import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// Load environment variables IMMEDIATELY
dotenv.config();

import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createOrder, getWalletBalance } from './bybitService.js';
import brokerService from './brokerService.js';
import encryption from './encryption.js';

// --- Broker OAuth Config ---
const BYBIT_CLIENT_ID = process.env.BYBIT_CLIENT_ID || 'oUR2aPlwXyuH';
const BYBIT_CLIENT_SECRET = process.env.BYBIT_CLIENT_SECRET || 'JI3UB8NnO04T3w3EnzX41VogA';
const REDIRECT_URI = process.env.REDIRECT_URI || 'https://www.mesoflixlabs.com/callback/bybit';

if (!process.env.BYBIT_CLIENT_ID || process.env.BYBIT_CLIENT_ID === 'oUR2aPlwXyuH') {
  console.warn('[CONFIG] Warning: Using default or possibly incorrect BYBIT_CLIENT_ID');
}
if (!process.env.BYBIT_CLIENT_SECRET || process.env.BYBIT_CLIENT_SECRET === 'JI3UB8NnO04T3w3EnzX41VogA') {
  console.warn('[CONFIG] Warning: Using default or possibly incorrect BYBIT_CLIENT_SECRET');
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const JWT_SECRET = process.env.JWT_SECRET || 'mesoflix_staff_secret_2026';
const OAUTH_STATE_SECRET = process.env.OAUTH_STATE_SECRET || JWT_SECRET; // Fallback to JWT_SECRET for now

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
app.use(cors({
  origin: true, // Dynamically allow the origin of the request
  credentials: true
}));
app.use(express.json());

// Helper: Phase 1 Audit Logging
async function addAuditLog({ sessionId, userId, eventType, status, metadata }) {
  try {
    const { error } = await supabase
      .from('oauth_audit_events')
      .insert([{
        session_id: sessionId,
        user_id: userId,
        event_type: eventType,
        status: status,
        metadata: metadata || {}
      }]);
    if (error) console.error('[AUDIT_ERROR]', error);
  } catch (err) {
    console.error('[AUDIT_CRITICAL_FAILURE]', err);
  }
}

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

// --- CLIENT AUTH ENDPOINTS (TRADERS) ---

// User Registration (Main Landing Page)
app.post('/api/user/register', async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Email, password, and name are required.' });
    }

    // 1. Check if email exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists.' });
    }

    // 2. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create User Profile
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([
        { 
          email, 
          password_hash: hashedPassword, 
          full_name: fullName 
        }
      ])
      .select('id, email, full_name')
      .single();

    if (insertError) {
      console.error('Supabase Insert User Error:', insertError);
      return res.status(400).json({ error: 'Account creation failed. Please try again.' });
    }

    // 4. Generate Token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: 'trader' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({ success: true, token, user: newUser });

  } catch (error) {
    console.error('User registration error:', error);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// User Login (Main Landing Page)
app.post('/api/user/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // 1. Fetch user
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (!user || error) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // 2. Compare Password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // 3. Generate Token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: 'trader' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({ 
      success: true, 
      token, 
      user: { 
        id: user.id, 
        email: user.email, 
        fullName: user.full_name 
      } 
    });

  } catch (error) {
    console.error('User login error:', error);
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
      crypto: { hasLeader: false, members: 0 },
      support: { hasLeader: false, members: 0 }
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
    // 1. Check if email already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'This email is already registered. Please sign in instead.' });
    }

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

// --- BYBIT API ENDPOINTS ---

// Test Bybit Order Placement (Dynamic Config)
app.post('/api/bybit/test-order', async (req, res) => {
  try {
    const { symbol, side, qty, price, category, apiConfig } = req.body;

    if (!symbol || !side || !qty) {
      return res.status(400).json({ error: 'Missing order parameters (symbol, side, qty).' });
    }

    if (!apiConfig || !apiConfig.apiKey || !apiConfig.apiSecret) {
      return res.status(400).json({ error: 'Missing Bybit API credentials (apiKey, apiSecret).' });
    }

    const orderParams = {
      category: category || 'spot',
      symbol,
      side,
      orderType: price ? 'Limit' : 'Market',
      qty: qty.toString(),
      price: price ? price.toString() : undefined,
      timeInForce: 'GTC',
      orderLinkId: `test-${Date.now()}`
    };

    console.log('Placing Test Order:', orderParams);
    const result = await createOrder(orderParams, apiConfig);
    
    if (result.retCode !== 0) {
      console.error('Bybit API Error:', result);
      return res.status(400).json(result);
    }

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Bybit Order Execution Error:', error);
    res.status(500).json({ error: 'Failed to place Bybit order.' });
  }
});

// Get Bybit Wallet Balance (Dynamic Config)
app.post('/api/bybit/balance', async (req, res) => {
  try {
    const { accountType, apiConfig } = req.body;

    if (!apiConfig || !apiConfig.apiKey || !apiConfig.apiSecret) {
      return res.status(400).json({ error: 'Missing Bybit API credentials.' });
    }

    const result = await getWalletBalance({ accountType: accountType || 'UNIFIED' }, apiConfig);

    if (result.retCode !== 0) {
      console.error('Bybit Balance Error:', result);
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Bybit Balance Fetch Error:', error);
    res.status(500).json({ error: 'Failed to fetch Bybit balance.' });
  }
});

// --- BROKER SEAMLESS ONBOARDING ENDPOINT ---

app.post('/api/broker/onboard', async (req, res) => {
  try {
    const { userId, environment } = req.body; // environment: 'REAL', 'DEMO', 'TESTNET'
    const finalEnv = environment || 'REAL';

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required for broker onboarding.' });
    }

    // 1. Check if user already has an account for this environment
    const { data: existingAccount } = await supabase
      .from('user_broker_accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('environment', finalEnv)
      .single();

    if (existingAccount) {
      return res.status(409).json({ 
        success: true, 
        message: 'Account already exists.', 
        sub_uid: existingAccount.bybit_sub_uid 
      });
    }

    // 2. Master Account Credentials (MANDATORY in .env)
    const masterConfig = {
      apiKey: process.env.BYBIT_MASTER_API_KEY,
      apiSecret: process.env.BYBIT_MASTER_API_SECRET,
      isTestnet: finalEnv === 'TESTNET' || finalEnv === 'DEMO' // Map Demo/Testnet to Testnet master if necessary, or check env
    };

    if (!masterConfig.apiKey || !masterConfig.apiSecret) {
      console.error('CRITICAL: Bybit Master API Keys are missing in environment variables.');
      return res.status(500).json({ error: 'Broker Master Account is not configured on the server.' });
    }

    // 3. Generate a Unique Sub-Account Username
    const timestamp = Date.now().toString().slice(-6);
    const shortId = userId.slice(0, 4);
    const username = `msflx_${shortId}${timestamp}`;

    // 4. Create Sub-Account UID on Bybit
    console.log(`[BROKER] Creating sub-account: ${username} for user ${userId}`);
    const subAccountRes = await brokerService.createClientSubAccount(username, masterConfig);
    
    if (subAccountRes.retCode !== 0) {
      console.error('Bybit Broker Create Account Error:', subAccountRes);
      return res.status(400).json({ error: subAccountRes.retMsg || 'Failed to create Bybit sub-account.' });
    }

    const subUid = subAccountRes.result.subMemberId || subAccountRes.result.uid;

    // 5. Generate API Keys for the new Sub-Account
    console.log(`[BROKER] Generating API Keys for UID: ${subUid}`);
    const apiKeyRes = await brokerService.createClientApiKey(subUid, masterConfig);

    if (apiKeyRes.retCode !== 0) {
      console.error('Bybit Broker Create API Error:', apiKeyRes);
      return res.status(400).json({ error: apiKeyRes.retMsg || 'Failed to generate sub-account API keys.' });
    }

    const { apiKey, apiSecret } = apiKeyRes.result;

    // 6. Encrypt and store in Supabase
    const encryptedKey = encryption.encrypt(apiKey);
    const encryptedSecret = encryption.encrypt(apiSecret);

    const { error: dbError } = await supabase
      .from('user_broker_accounts')
      .insert([{
        user_id: userId,
        bybit_sub_uid: subUid.toString(),
        bybit_username: username,
        encrypted_api_key: encryptedKey,
        encrypted_api_secret: encryptedSecret,
        environment: finalEnv
      }]);

    if (dbError) {
      console.error('Database Error storing broker keys:', dbError);
      return res.status(500).json({ error: 'Sub-account created but failed to store credentials securely.' });
    }

    res.status(201).json({ 
      success: true, 
      message: 'Seamless Bybit connectivity activated!',
      sub_uid: subUid 
    });

  } catch (error) {
    console.error('Broker onboarding catastrophic failure:', error);
    res.status(500).json({ error: 'An unexpected error occurred during broker integration.' });
  }
});

// --- MARKET DATA PROXY (Fixes CoinCap DNS Issues) ---
app.get('/api/market/coins', async (req, res) => {
  try {
    const limit = req.query.limit || 8;
    const response = await fetch(`https://api.coincap.io/v2/assets?limit=${limit}`);
    
    if (response.ok) {
      const data = await response.json();
      return res.status(200).json(data);
    }
    throw new Error('External Provider Redundant');
  } catch (error) {
    // Proactive Institutional Fallback - Keeps the site looking 'Live' even if CoinCap is down
    const fallbackData = {
      data: [
        { name: 'Bitcoin', symbol: 'BTC', priceUsd: '68245.20', changePercent24Hr: '1.25' },
        { name: 'Ethereum', symbol: 'ETH', priceUsd: '3512.45', changePercent24Hr: '3.10' },
        { name: 'Solana', symbol: 'SOL', priceUsd: '192.15', changePercent24Hr: '-0.85' },
        { name: 'Cardano', symbol: 'ADA', priceUsd: '0.62', changePercent24Hr: '2.40' },
        { name: 'Polkadot', symbol: 'DOT', priceUsd: '9.45', changePercent24Hr: '5.12' },
        { name: 'Avalanche', symbol: 'AVAX', priceUsd: '56.30', changePercent24Hr: '1.20' },
        { name: 'Ripple', symbol: 'XRP', priceUsd: '0.64', changePercent24Hr: '0.45' },
        { name: 'Chainlink', symbol: 'LINK', priceUsd: '18.90', changePercent24Hr: '2.15' }
      ]
    };
    res.status(200).json(fallbackData);
  }
});

// --- BYBIT BROKER OAUTH ROUTES ---

// 1. Authorize: Redirect user to Bybit
// 1. Authorize: Redirect user to Bybit with Secure Signed State
app.get('/api/auth/bybit/authorize', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'User ID is required for authorization.' });

    // 1. Create a Secure Signed State
    const jti = crypto.randomUUID(); // Unique ID for this specific callback attempt
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 Minute TTL

    // 2. Persist Session in DB
    const { data: session, error: sessionErr } = await supabase
      .from('oauth_sessions')
      .insert([{
        jti,
        user_id: userId,
        provider: 'bybit',
        status: 'issued',
        expires_at: expiresAt.toISOString()
      }])
      .select()
      .single();

    if (sessionErr) throw sessionErr;

    // 3. Sign the state token
    const state = jwt.sign(
      { jti, userId, type: 'oauth_state' },
      OAUTH_STATE_SECRET,
      { expiresIn: '15m' }
    );

    // 4. Log the redirect attempt
    await addAuditLog({
      sessionId: session.id,
      userId,
      eventType: 'REDIRECT',
      status: 'SUCCESS',
      metadata: { jti }
    });

    const authorizeUrl = `https://www.bybit.com/en/oauth?client_id=${BYBIT_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=openapi&state=${state}`;
    
    res.redirect(authorizeUrl);
  } catch (err) {
    console.error('[AUTH_START_FAILURE]', err);
    res.status(500).json({ error: 'Failed to initiate secure authorization flow.' });
  }
});

// 2. Callback: Handle redirect back from Bybit (Documented Institutional Flow)
app.get('/api/auth/bybit/callback', async (req, res) => {
  const { code, state: stateJwt, error: bybitError } = req.query;
  let oauthSession = null;
  let userId = null;
  let jti = null;

  try {
    const isJson = req.headers.accept && req.headers.accept.includes('application/json');

    // 1. Initial Handshake Validation
    if (bybitError) {
      console.error('[OAUTH_CALLBACK] Bybit returned error:', bybitError);
      const errUrl = `https://www.mesoflixlabs.com/auth/error?code=bybit_error&details=${encodeURIComponent(bybitError)}`;
      if (isJson) return res.status(400).json({ success: false, error: 'bybit_error', details: bybitError, redirect: errUrl });
      return res.redirect(errUrl);
    }

    if (!code || !stateJwt) {
      console.error('[OAUTH_CALLBACK] Missing requirements (code or state)');
      const errUrl = 'https://www.mesoflixlabs.com/auth/error?code=missing_parameters';
      if (isJson) return res.status(400).json({ success: false, error: 'missing_parameters', redirect: errUrl });
      return res.redirect(errUrl);
    }

    // 2. Verify Signed State JWT (Security Gate)
    try {
      const decodedState = jwt.verify(stateJwt, OAUTH_STATE_SECRET);
      if (decodedState.type !== 'oauth_state') throw new Error('Invalid token type');
      userId = decodedState.userId;
      jti = decodedState.jti;
    } catch (err) {
      console.error('[OAUTH_CALLBACK] State Verification Failed:', err.message);
      return res.redirect('https://www.mesoflixlabs.com/auth/error?code=invalid_state');
    }

    // 3. One-Time Session Validation & Anti-Replay
    const { data: session, error: sessionFetchErr } = await supabase
      .from('oauth_sessions')
      .select('*')
      .eq('jti', jti)
      .eq('user_id', userId)
      .single();

    if (sessionFetchErr || !session) {
      console.error('[OAUTH_CALLBACK] Session lookup failed:', jti);
      const errUrl = 'https://www.mesoflixlabs.com/auth/error?code=invalid_session';
      if (isJson) return res.status(400).json({ success: false, error: 'invalid_session', redirect: errUrl });
      return res.redirect(errUrl);
    }

    oauthSession = session;

    if (session.status !== 'issued') {
      console.error('[OAUTH_CALLBACK] Session already consumed:', jti);
      const errUrl = 'https://www.mesoflixlabs.com/auth/error?code=session_already_consumed';
      if (isJson) return res.status(400).json({ success: false, error: 'session_already_consumed', redirect: errUrl });
      return res.redirect(errUrl);
    }

    if (new Date(session.expires_at) < new Date()) {
      console.error('[OAUTH_CALLBACK] Session expired:', jti);
      const errUrl = 'https://www.mesoflixlabs.com/auth/error?code=session_expired';
      if (isJson) return res.status(400).json({ success: false, error: 'session_expired', redirect: errUrl });
      return res.redirect(errUrl);
    }

    // Capture Callback Success in Audit
    await addAuditLog({ sessionId: session.id, userId, eventType: 'CALLBACK', status: 'SUCCESS' });

    // 4. Exchange Code for Access Token (Documented Institutional Step)
    console.log(`[OAUTH] Exchanging auth_code for access_token for userId: ${userId}`);
    const tokenRes = await fetch('https://api2.bybit.com/oauth/v1/public/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: BYBIT_CLIENT_ID,
        client_secret: BYBIT_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI
      })
    });

    const tokenData = await tokenRes.json().catch(() => ({ error: 'Invalid JSON response from Bybit' }));

    if (!tokenData.access_token) {
      console.error('[OAUTH] Token exchange failed:', tokenData);
      await addAuditLog({ sessionId: session.id, userId, eventType: 'TOKEN_EXCHANGE', status: 'FAILURE', metadata: tokenData });
      const errUrl = 'https://www.mesoflixlabs.com/auth/error?code=token_exchange_failed';
      if (isJson) return res.status(400).json({ success: false, error: 'token_exchange_failed', details: tokenData, redirect: errUrl });
      return res.redirect(errUrl);
    }

    const accessToken = tokenData.access_token;
    await addAuditLog({ sessionId: session.id, userId, eventType: 'TOKEN_EXCHANGE', status: 'SUCCESS' });

    // 5. Retrieve Permanent OpenAPI Credentials (The "Permanent" Keys)
    console.log(`[OAUTH] Retrieving permanent OpenAPI keys for userId: ${userId}`);
    const keyRes = await fetch('https://api2.bybit.com/oauth/v1/resource/restrict/openapi', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    const keyData = await keyRes.json().catch(() => ({ ret_code: -1 }));

    if (keyData.ret_code !== 0 || !keyData.result) {
      console.error('[OAUTH] Key retrieval failed:', keyData);
      const errUrl = 'https://www.mesoflixlabs.com/auth/error?code=key_retrieval_failed';
      if (isJson) return res.status(400).json({ success: false, error: 'key_retrieval_failed', details: keyData, redirect: errUrl });
      return res.redirect(errUrl);
    }

    // Defensive Extraction & Normalization
    const result = keyData.result;
    const apiKey = result.api_key;
    const apiSecret = result.api_secret;
    const rawSubUid = result.sub_member_id || result.sub_uid || result.user_id;

    if (!apiKey || !apiSecret) {
      console.error('[OAUTH] Incomplete credentials received from Bybit:', result);
      if (oauthSession) await addAuditLog({ sessionId: oauthSession.id, userId, eventType: 'KEY_RETRIEVAL', status: 'FAILURE', metadata: result });
      const errUrl = 'https://www.mesoflixlabs.com/auth/error?code=incomplete_credentials';
      if (isJson) return res.status(400).json({ success: false, error: 'incomplete_credentials', redirect: errUrl });
      return res.redirect(errUrl);
    }

    const subUidStr = rawSubUid ? rawSubUid.toString() : null;

    // 6. Security Check & Persistence
    // Prevent account swapping/duplicate linking (Only if UID is present)
    if (subUidStr) {
      const { data: existingAccount } = await supabase
        .from('user_broker_accounts')
        .select('user_id')
        .eq('bybit_sub_uid', subUidStr)
        .single();

      if (existingAccount && existingAccount.user_id !== userId) {
        console.warn(`[OAUTH] Security Alert: Bybit UID ${subUidStr} already linked to User ${existingAccount.user_id}`);
        const errUrl = 'https://www.mesoflixlabs.com/auth/error?code=account_already_linked_elsewhere';
        if (isJson) return res.status(403).json({ success: false, error: 'account_already_linked_elsewhere', redirect: errUrl });
        return res.redirect(errUrl);
      }
    }

    // Encrypt and save to database
    const encryptedKey = encryption.encrypt(apiKey);
    const encryptedSecret = encryption.encrypt(apiSecret);

    const { error: dbError } = await supabase
      .from('user_broker_accounts')
      .upsert([{
        user_id: userId,
        bybit_sub_uid: subUidStr,
        bybit_username: 'Bybit Authorized',
        encrypted_api_key: encryptedKey,
        encrypted_api_secret: encryptedSecret,
        environment: 'REAL'
      }], { onConflict: 'user_id, environment' });

    if (dbError) {
      console.error('[OAUTH] DB Persistence Error:', dbError);
      const errUrl = 'https://www.mesoflixlabs.com/auth/error?code=db_storage_failed';
      if (isJson) return res.status(500).json({ success: false, error: 'db_storage_failed', redirect: errUrl });
      return res.redirect(errUrl);
    }

    // 7. Cleanup & Audit logging
    await supabase.from('oauth_sessions').update({ status: 'consumed', consumed_at: new Date().toISOString() }).eq('id', session.id);
    await addAuditLog({ sessionId: session.id, userId, eventType: 'DB_UPSERT', status: 'SUCCESS', metadata: { subUid: subUidStr } });

    console.log(`[OAUTH] Synchronization complete for userId: ${userId}`);
    if (isJson) return res.status(200).json({ success: true, redirect: '/auth/complete?success=true' });
    res.redirect('https://www.mesoflixlabs.com/auth/complete?success=true');

  } catch (err) {
    console.error('[OAUTH_CALLBACK_CRITICAL]', err);
    if (isJson) return res.status(500).json({ success: false, error: 'server_error' });
    res.redirect('https://www.mesoflixlabs.com/auth/error?code=server_error');
  }
});

// GET: broker/account - Retrieve existing managed account
app.get('/api/broker/account/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { environment } = req.query; // optional: 'REAL', 'DEMO', 'TESTNET'
    const finalEnv = environment || 'REAL';

    const { data: account, error } = await supabase
      .from('user_broker_accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('environment', finalEnv)
      .single();

    if (error || !account) {
      return res.status(404).json({ error: 'No managed account found for this environment.' });
    }

    // Decrypt keys for the platform to use
    const apiKey = encryption.decrypt(account.encrypted_api_key);
    const apiSecret = encryption.decrypt(account.encrypted_api_secret);

    res.status(200).json({
      success: true,
      sub_uid: account.bybit_sub_uid,
      username: account.bybit_username,
      apiConfig: {
        apiKey,
        apiSecret,
        isTestnet: finalEnv === 'TESTNET' || finalEnv === 'DEMO',
        isDemo: finalEnv === 'DEMO',
        brokerId: 'Ef001038'
      }
    });

  } catch (error) {
    console.error('Error fetching broker account:', error);
    res.status(500).json({ error: 'Failed to retrieve connection security keys.' });
  }
});

app.listen(PORT, () => {
  console.log(`Express API Server listening on port ${PORT}`);
});
