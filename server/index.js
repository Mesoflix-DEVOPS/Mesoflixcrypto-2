import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const JWT_SECRET = process.env.JWT_SECRET || 'mesoflix_staff_secret_2026';

// Supabase Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
  console.error('CRITICAL: Supabase environment variables (VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE) are missing!');
}

// We use the SERVICE_ROLE key here because we are bypassing RLS for our hidden staff auth
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

// Helper: Generate Unique Staff Key
function generateUniqueKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let key = 'S-';
  for (let i = 1; i <= 12; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
    if (i % 4 === 0 && i < 12) key += '-';
  }
  return key;
}

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to send email via Brevo
async function sendBrevoEmail({ name, email, subject, message, accountEmail }) {
  if (!BREVO_API_KEY || BREVO_API_KEY === 'YOUR_BREVO_API_KEY_HERE') {
    console.warn('BREVO_API_KEY is not set correctly. Email delivery skipped.');
    return true; // Simulate success if no key
  }

  const emailData = {
    sender: { name: 'Support', email: 'no-reply@mesoflixlabs.com' },
    to: [{ email: 'support@mesoflixlabs.com' }],
    subject: `[Support] ${subject}`,
    htmlContent: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
        <h2 style="color: #4a90e2; border-bottom: 2px solid #4a90e2; padding-bottom: 10px;">New Support Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Contact Email:</strong> ${email}</p>
        <p><strong>Account Email:</strong> ${accountEmail || 'N/A'}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <h3 style="color: #555;">Message:</h3>
        <p style="white-space: pre-wrap; background: #f9f9f9; padding: 15px; border-radius: 4px;">${message}</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 0.85em; color: #999;"><em>Submitted on: ${new Date().toUTCString()}</em></p>
      </div>
    `
  };

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify(emailData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Brevo API Error: ${JSON.stringify(errorData)}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error sending Brevo email:', error);
    throw error;
  }
}

// Help check for Render deployment
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'Healthy', timestamp: new Date().toISOString() });
});

// Support Contact Endpoint
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message, accountEmail } = req.body;

    // 1. Basic Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'All required fields must be filled.' });
    }
    
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format.' });
    }

    if (message.length < 10) {
      return res.status(400).json({ error: 'Message must be at least 10 characters long.' });
    }

    // 2. Insert into Supabase
    const { data: insertData, error: insertError } = await supabase
      .from('support_messages')
      .insert([
        { 
          name, 
          email, 
          subject, 
          message, 
          account_email: accountEmail || null,
          status: 'new'
        }
      ])
      .select();

    if (insertError) {
      console.error('Supabase Insert Error:', insertError);
      throw new Error('Database insertion failed');
    }

    // 3. Send Email via Brevo
    await sendBrevoEmail({ name, email, subject, message, accountEmail });

    // 4. Respond to client
    res.status(200).json({ success: true, message: 'Your request has been received. Our support team will respond within 24 hours.' });

  } catch (error) {
    res.status(500).json({ error: 'Unable to process your request at the moment. Please try again later.' });
  }
});

// --- CUSTOM STAFF AUTH ENDPOINTS ---

// Staff Registration (Hidden)
app.post('/api/staff/register', async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // 1. Check if email already exists in staff_profiles
    const { data: existingStaff } = await supabase
      .from('staff_profiles')
      .select('email')
      .eq('email', email)
      .single();

    if (existingStaff) {
      return res.status(409).json({ error: 'Email already registered.' });
    }

    // 2. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);
    const uniqueKey = generateUniqueKey();

    // 3. Save to staff_profiles
    const { error: insertError } = await supabase
      .from('staff_profiles')
      .insert([
        { 
          email, 
          password: hashedPassword, 
          full_name: fullName, 
          unique_key: uniqueKey 
        }
      ]);

    if (insertError) throw insertError;

    res.status(201).json({ success: true, uniqueKey });

  } catch (error) {
    console.error('Staff registration error:', error);
    res.status(500).json({ error: 'Failed to create staff account.' });
  }
});

// Staff Login (Triple-Factor)
app.post('/api/staff/login', async (req, res) => {
  try {
    const { email, password, uniqueKey } = req.body;

    if (!email || !password || !uniqueKey) {
      return res.status(400).json({ error: 'Email, password, and unique key are required.' });
    }

    // 1. Fetch staff profile
    const { data: staff, error } = await supabase
      .from('staff_profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (!staff || error) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // 2. Compare Password
    const isPasswordValid = await bcrypt.compare(password, staff.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // 3. Compare Unique Key
    if (staff.unique_key !== uniqueKey) {
      return res.status(401).json({ error: 'Invalid security key.' });
    }

    // 4. Generate Session Token
    const token = jwt.sign(
      { id: staff.id, email: staff.email, role: 'staff' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({ 
      success: true, 
      token, 
      staff: { 
        id: staff.id, 
        email: staff.email, 
        fullName: staff.full_name 
      } 
    });

  } catch (error) {
    console.error('Staff login error:', error);
    res.status(500).json({ error: 'Authentication failed.' });
  }
});

app.listen(PORT, () => {
  console.log(`Express API Server listening on port ${PORT}`);
});
