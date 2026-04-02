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
// We prefer SERVICE_ROLE for custom auth, but fallback to ANON_KEY to prevent crashes
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('CRITICAL: Supabase environment variables (URL or API KEY) are missing!');
}

// Initialize Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

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
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #f1f5f9; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="background: #0f172a; padding: 30px; text-align: center;">
          <img src="https://mesoflixcrypto-2-n7su-git-master-mesoflix-devops-projects.vercel.app/site_icon.svg" alt="MesoflixLabs" style="width: 50px; height: 50px; margin-bottom: 10px;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">Mesoflix<span style="color: #38bdf8;">Labs</span></h1>
        </div>
        <div style="padding: 40px; background: #ffffff;">
          <h2 style="color: #1e293b; margin-top: 0; font-size: 20px;">New Support Request</h2>
          <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 30px;">
            <p style="margin: 5px 0; color: #64748b; font-size: 14px;"><strong>From:</strong> ${name}</p>
            <p style="margin: 5px 0; color: #64748b; font-size: 14px;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 5px 0; color: #64748b; font-size: 14px;"><strong>Account:</strong> ${accountEmail || 'N/A'}</p>
          </div>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">${message}</p>
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #f1f5f9; text-align: center;">
            <p style="font-size: 12px; color: #94a3b8; margin: 0;">© 2026 MesoflixLabs. All rights reserved.</p>
          </div>
        </div>
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

    if (insertError) {
        console.error('Supabase Insert Error:', insertError);
        return res.status(400).json({ error: `Database Error: ${insertError.message}` });
    }

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
        fullName: staff.full_name,
        category: staff.category,
        role: staff.role,
        teamId: staff.team_id,
        agreementSigned: staff.agreement_signed
      } 
    });

  } catch (error) {
    console.error('Staff login error:', error);
    res.status(500).json({ error: 'Authentication failed.' });
  }
});

// GET: staff/status - Check category availability
app.get('/api/staff/status', async (req, res) => {
  try {
    const { data: teams, error } = await supabase
      .from('staff_teams')
      .select('category, member_count');

    if (error) throw error;

    // Default status for all categories
    const status = {
      binary: { hasLeader: false, members: 0 },
      forex: { hasLeader: false, members: 0 },
      crypto: { hasLeader: false, members: 0 }
    };

    teams.forEach(t => {
      if (status[t.category]) {
        status[t.category].hasLeader = true;
        status[t.category].members = t.member_count;
      }
    });

    res.status(200).json(status);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch staff status.' });
  }
});

// POST: staff/onboard - Advanced Onboarding Flow (NDA + Category Selection)
app.post('/api/staff/onboard', async (req, res) => {
  try {
    const { staffId, category } = req.body;

    if (!staffId || !category) {
      return res.status(400).json({ error: 'Staff ID and Category are required.' });
    }

    // 1. Check if category already has a team
    const { data: existingTeam, error: teamError } = await supabase
      .from('staff_teams')
      .select('*')
      .eq('category', category)
      .single();

    let finalRole = 'member';
    let teamId = null;

    if (!existingTeam) {
      // 2. This person is the LEADER for this new branch
      const { data: newTeam, error: createError } = await supabase
        .from('staff_teams')
        .insert([{ category, leader_id: staffId, member_count: 1 }])
        .select()
        .single();

      if (createError) throw createError;
      finalRole = 'leader';
      teamId = newTeam.id;
    } else {
      // 3. Leader exists, check for space (limit 3 members)
      if (existingTeam.member_count >= 3) {
        return res.status(400).json({ error: `The ${category} team is already full.` });
      }

      // 4. Register as member and update member count
      teamId = existingTeam.id;
      const { error: updateTeamError } = await supabase
        .from('staff_teams')
        .update({ member_count: existingTeam.member_count + 1 })
        .eq('id', teamId);

      if (updateTeamError) throw updateTeamError;
    }

    // 5. Update staff profile with role and domain info
    const { error: profileError } = await supabase
      .from('staff_profiles')
      .update({ 
        category, 
        role: finalRole, 
        team_id: teamId, 
        onboarding_completed: true,
        agreement_signed: true,
        signed_at: new Date().toISOString()
      })
      .eq('id', staffId);

    if (profileError) throw profileError;

    res.status(200).json({ success: true, role: finalRole, teamId });

  } catch (error) {
    console.error('Staff onboarding error:', error);
    res.status(500).json({ error: 'Failed to complete onboarding.' });
  }
});

// GET: staff/team - Fetch current team members
app.get('/api/staff/team/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Get user's team ID
    const { data: user, error: userError } = await supabase
      .from('staff_profiles')
      .select('team_id')
      .eq('id', id)
      .single();
    
    if (userError || !user.team_id) {
       return res.status(404).json({ error: 'No team found for this user.' });
    }

    // 2. Get all staff in that team
    const { data: members, error: membersError } = await supabase
      .from('staff_profiles')
      .select('id, full_name, email, role, category')
      .eq('team_id', user.team_id);

    if (membersError) throw membersError;

    res.status(200).json(members);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch team data.' });
  }
});

// Staff Reply to Ticket
app.post('/api/staff/reply', async (req, res) => {
  try {
    const { ticketId, userEmail, userName, message, staffName } = req.body;

    if (!ticketId || !userEmail || !message) {
      return res.status(400).json({ error: 'Missing required reply data.' });
    }

    // 1. Fetch existing replies first
    const { data: ticket, error: fetchError } = await supabase
      .from('support_messages')
      .select('replies')
      .eq('id', ticketId)
      .single();

    if (fetchError) throw fetchError;

    const currentReplies = ticket.replies || [];
    const newReply = {
      message,
      sender: staffName || 'Support Team',
      timestamp: new Date().toISOString()
    };

    // 2. Send Professional Email to User
    const emailData = {
      sender: { name: 'MesoflixLabs Support', email: 'support@mesoflixlabs.com' },
      to: [{ email: userEmail, name: userName }],
      subject: `Update on Your Ticket: ${ticketId.slice(0, 8)}`,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #f1f5f9; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <div style="background: #0f172a; padding: 30px; text-align: center;">
            <img src="https://mesoflixcrypto-2-n7su-git-master-mesoflix-devops-projects.vercel.app/site_icon.svg" alt="MesoflixLabs" style="width: 50px; height: 50px; margin-bottom: 10px;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">Mesoflix<span style="color: #38bdf8;">Labs</span></h1>
          </div>
          <div style="padding: 40px; background: #ffffff;">
            <p style="font-size: 16px; color: #64748b; margin-bottom: 24px;">Hello ${userName},</p>
            <div style="font-size: 16px; line-height: 1.6; color: #1e293b; background: #f8fafc; padding: 25px; border-radius: 12px; border-left: 4px solid #38bdf8;">
              ${message}
            </div>
            <p style="font-size: 14px; color: #94a3b8; margin-top: 30px; margin-bottom: 0;">Best regards,</p>
            <p style="font-size: 16px; font-weight: bold; color: #0f172a; margin-top: 5px;">${staffName || 'The Support Team'}</p>
          </div>
          <div style="background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #f1f5f9;">
            <p style="font-size: 12px; color: #94a3b8; margin: 0;">MesoflixLabs Institutional Brokerage Services</p>
          </div>
        </div>
      `
    };

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify(emailData)
    });

    if (!response.ok) throw new Error('Email delivery failed');

    // 3. Update Status and Append Reply in Supabase
    const { error: updateError } = await supabase
      .from('support_messages')
      .update({ 
        status: 'active',
        replies: [...currentReplies, newReply]
      })
      .eq('id', ticketId);

    if (updateError) throw updateError;

    res.status(200).json({ success: true, message: 'Reply sent and stored successfully.' });

  } catch (error) {
    console.error('Staff reply error:', error);
    res.status(500).json({ error: 'Failed to process reply.' });
  }
});

// Update Ticket Status
app.patch('/api/tickets/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['new', 'active', 'completed', 'closed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status.' });
    }

    const { error } = await supabase
      .from('support_messages')
      .update({ status })
      .eq('id', id);

    if (error) throw error;

    res.status(200).json({ success: true, message: 'Status updated.' });

  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({ error: 'Failed to update ticket status.' });
  }
});

app.listen(PORT, () => {
  console.log(`Express API Server listening on port ${PORT}`);
});
