import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config();

// Configuration - User should provide these in .env.local or environment
const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
const LOGTO_ENDPOINT = process.env.LOGTO_ENDPOINT; // e.g. https://your-logto.com
const LOGTO_MANAGEMENT_API_ID = process.env.LOGTO_MANAGEMENT_API_ID;
const LOGTO_MANAGEMENT_API_SECRET = process.env.LOGTO_MANAGEMENT_API_SECRET;
const LOGTO_RESOURCE = process.env.LOGTO_RESOURCE || 'https://default.logto.app/api';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!CLERK_SECRET_KEY || !LOGTO_ENDPOINT || !LOGTO_MANAGEMENT_API_ID || !LOGTO_MANAGEMENT_API_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables. Please check .env.local');
  console.log('Required: CLERK_SECRET_KEY, LOGTO_ENDPOINT, LOGTO_MANAGEMENT_API_ID, LOGTO_MANAGEMENT_API_SECRET, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function getLogtoManagementToken() {
  console.log('⏳ Fetching Logto Management API token...');
  const auth = Buffer.from(`${LOGTO_MANAGEMENT_API_ID}:${LOGTO_MANAGEMENT_API_SECRET}`).toString('base64');
  const response = await fetch(`${LOGTO_ENDPOINT}/oidc/token`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${auth}`
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      resource: LOGTO_RESOURCE,
      scope: 'all',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get Logto token: ${error}`);
  }

  const data = await response.json();
  return data.access_token;
}

async function getClerkUsers() {
  console.log('⏳ Fetching users from Clerk...');
  const response = await fetch('https://api.clerk.com/v1/users?limit=500', {
    headers: {
      Authorization: `Bearer ${CLERK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch Clerk users: ${error}`);
  }

  return await response.json();
}

async function main() {
  const stats = {
    total: 0,
    clerk: 0,
    logtoBefore: 0,
    logtoAfter: 0,
    migrated: 0,
    skipped: 0,
    failed: 0,
    alreadyExists: 0
  };

  try {
    const logtoToken = await getLogtoManagementToken();
    
    // 1. Get Logto user count before migration
    console.log('⏳ Counting existing Logto users...');
    const logtoCountRes = await fetch(`${LOGTO_ENDPOINT}/api/users?limit=1`, {
      headers: { Authorization: `Bearer ${logtoToken}` },
    });
    stats.logtoBefore = parseInt(logtoCountRes.headers.get('x-total-count') || logtoCountRes.headers.get('total-count') || '0');
    console.log(`ℹ️ Existing Logto users: ${stats.logtoBefore}`);

    // 2. Get Clerk users
    const clerkUsers = await getClerkUsers();
    stats.clerk = clerkUsers.length;
    stats.total = clerkUsers.length;
    console.log(`🚀 Starting migration of ${stats.clerk} users from Clerk...`);

    for (const user of clerkUsers) {
      const result = await migrateUser(user, logtoToken);
      if (result === 'migrated') stats.migrated++;
      else if (result === 'exists') stats.alreadyExists++;
      else if (result === 'skipped') stats.skipped++;
      else stats.failed++;
    }

    // 3. Get Logto user count after migration
    console.log('⏳ Counting Logto users after migration...');
    const logtoCountAfterRes = await fetch(`${LOGTO_ENDPOINT}/api/users?limit=1`, {
      headers: { Authorization: `Bearer ${logtoToken}` },
    });
    stats.logtoAfter = parseInt(logtoCountAfterRes.headers.get('x-total-count') || logtoCountAfterRes.headers.get('total-count') || '0');

    console.log('\n--- Migration Summary ---');
    console.log(`Clerk Users: ${stats.clerk}`);
    console.log(`Logto Users (Before): ${stats.logtoBefore}`);
    console.log(`Logto Users (After): ${stats.logtoAfter}`);
    console.log(`Successfully Migrated: ${stats.migrated}`);
    console.log(`Already Existed in Logto: ${stats.alreadyExists}`);
    console.log(`Skipped (No Email): ${stats.skipped}`);
    console.log(`Failed: ${stats.failed}`);
    
    const expected = Math.min(stats.clerk, stats.migrated + stats.alreadyExists);
    const actualIncrease = stats.logtoAfter - stats.logtoBefore;
    
    if (actualIncrease === stats.migrated) {
      console.log('✅ Verification passed: Logto user count increased by exactly the number of migrated users.');
    } else {
      console.log(`⚠️ Verification warning: Logto user count increased by ${actualIncrease}, but we expected an increase of ${stats.migrated}.`);
    }

    console.log('✨ Migration complete!');
  } catch (error) {
    console.error('💥 Migration failed:', error);
  }
}

async function migrateUser(clerkUser, logtoToken) {
  const email = clerkUser.email_addresses[0]?.email_address;
  if (!email) {
    console.log(`⚠️ Skipping user ${clerkUser.id} (no email)`);
    return 'skipped';
  }

  console.log(`⏳ Migrating user: ${email} (${clerkUser.id})...`);

  // 1. Create user in Logto
  const logtoResponse = await fetch(`${LOGTO_ENDPOINT}/api/users`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${logtoToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      primaryEmail: email,
      username: (clerkUser.username || email.split('@')[0]).replace(/[^a-zA-Z0-9_-]/g, '_'),
      name: `${clerkUser.first_name || ''} ${clerkUser.last_name || ''}`.trim() || undefined,
    }),
  });

  let logtoUser;
  let status = 'migrated';

  const body = await logtoResponse.json();

  if (logtoResponse.status === 409 || ( (logtoResponse.status === 400 || logtoResponse.status === 422) && body.code === 'user.username_already_in_use')) {
    console.log(`ℹ️ User ${email} already exists or username conflict (Status: ${logtoResponse.status}). Fetching by email...`);
    const searchResponse = await fetch(`${LOGTO_ENDPOINT}/api/users?search.primaryEmail=${encodeURIComponent(email)}`, {
      headers: { Authorization: `Bearer ${logtoToken}` },
    });
    const searchData = await searchResponse.json();
    logtoUser = searchData[0];
    
    if (logtoUser) {
      status = 'exists';
    } else if (body.code === 'user.username_already_in_use') {
      console.log(`⚠️ Username taken by another user. Retrying with random suffix...`);
      const retryResponse = await fetch(`${LOGTO_ENDPOINT}/api/users`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${logtoToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          primaryEmail: email,
          username: (clerkUser.username || email.split('@')[0]).replace(/[^a-zA-Z0-9_-]/g, '_') + '_' + Math.random().toString(36).substring(2, 7),
          name: `${clerkUser.first_name || ''} ${clerkUser.last_name || ''}`.trim() || undefined,
        }),
      });
      if (retryResponse.ok) {
        logtoUser = await retryResponse.json();
        status = 'migrated';
      } else {
        const retryBody = await retryResponse.json();
        console.error(`❌ Failed retry for ${email}: ${JSON.stringify(retryBody)}`);
        return 'failed';
      }
    }
  } else if (logtoResponse.status === 400 && body.code === 'guard.invalid_input') {
    console.log(`⚠️ Invalid input for ${email} (Status: 400). Retrying with random username...`);
    const retryResponse = await fetch(`${LOGTO_ENDPOINT}/api/users`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${logtoToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        primaryEmail: email,
        username: 'user_' + Math.random().toString(36).substring(2, 10),
        name: `${clerkUser.first_name || ''} ${clerkUser.last_name || ''}`.trim() || undefined,
      }),
    });
    if (retryResponse.ok) {
      logtoUser = await retryResponse.json();
      status = 'migrated';
    } else {
      const retryBody = await retryResponse.json();
      console.error(`❌ Failed retry after invalid input for ${email}: ${JSON.stringify(retryBody)}`);
      return 'failed';
    }
  } else if (!logtoResponse.ok) {
    console.error(`❌ Failed to create user ${email} in Logto (Status: ${logtoResponse.status}): ${JSON.stringify(body)}`);
    return 'failed';
  } else {
    logtoUser = body;
  }

  if (!logtoUser) {
    console.error(`❌ Could not find or create Logto user for ${email}`);
    return 'failed';
  }

  const logtoId = logtoUser.id;
  const clerkId = clerkUser.id;

  // 2. Update Supabase
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', clerkId)
      .maybeSingle();

    if (profile) {
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          ...profile,
          id: logtoId,
          updated_at: new Date().toISOString()
        });

      if (insertError && insertError.code !== '23505') {
        console.error(`❌ Failed to create new profile for ${email}:`, insertError);
        return 'failed';
      } else {
        await Promise.all([
          supabase.from('api_keys').update({ user_id: logtoId }).eq('user_id', clerkId),
          supabase.from('usage_logs').update({ user_id: logtoId }).eq('user_id', clerkId),
          supabase.from('user_subscriptions').update({ user_id: logtoId }).eq('user_id', clerkId),
        ]);

        await supabase.from('profiles').delete().eq('id', clerkId);
        console.log(`✅ Successfully migrated ${email} to Logto ID ${logtoId}`);
      }
    } else {
      console.log(`ℹ️ No existing Supabase profile found for ${email} (${clerkId}). Creating new one...`);
      await supabase.from('profiles').upsert({
        id: logtoId,
        email: email,
        role: 'user',
        plan: 'free'
      });
    }
    return status;
  } catch (dbError) {
    console.error(`❌ Database error migrating ${email}:`, dbError);
    return 'failed';
  }
}

main();
