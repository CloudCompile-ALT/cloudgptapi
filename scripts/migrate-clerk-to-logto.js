
const CLERK_SECRET_KEY = 'sk_test_KwkoiGG2Zynrt98pD9dKS0wyPmee6pnw40VqDhjZIP';
const LOGTO_ENDPOINT = 'https://ethical-incident-barbara-proceedings.trycloudflare.com';
const LOGTO_MANAGEMENT_API_ID = 'm-migration';
const LOGTO_MANAGEMENT_API_SECRET = 'MigrationSecret123!';
const LOGTO_RESOURCE = 'https://default.logto.app/api';

async function getLogtoToken() {
  console.log('Fetching Logto Management API token...');
  const response = await fetch(`${LOGTO_ENDPOINT}/oidc/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: LOGTO_MANAGEMENT_API_ID,
      client_secret: LOGTO_MANAGEMENT_API_SECRET,
      resource: LOGTO_RESOURCE,
      scope: 'all',
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to get Logto token: ${await response.text()}`);
  }

  const data = await response.json();
  return data.access_token;
}

async function fetchClerkUsers() {
  console.log('Fetching users from Clerk...');
  let allUsers = [];
  let lastId = null;
  let hasMore = true;

  while (hasMore) {
    const url = `https://api.clerk.com/v1/users?limit=500${lastId ? `&offset_id=${lastId}` : ''}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Clerk users: ${await response.text()}`);
    }

    const users = await response.json();
    if (users.length === 0) {
      hasMore = false;
    } else {
      allUsers = allUsers.concat(users);
      lastId = users[users.length - 1].id;
      if (users.length < 500) hasMore = false;
    }
  }

  return allUsers;
}

async function migrateUser(clerkUser, logtoToken) {
  const email = clerkUser.email_addresses.find(e => e.id === clerkUser.primary_email_address_id)?.email_address 
                || clerkUser.email_addresses[0]?.email_address;
                
  if (!email) {
    console.warn(`Skipping user ${clerkUser.id}: No email address found.`);
    return;
  }

  const username = clerkUser.username;
  const firstName = clerkUser.first_name || '';
  const lastName = clerkUser.last_name || '';
  const fullName = `${firstName} ${lastName}`.trim();

  console.log(`Migrating ${email} (${clerkUser.id})...`);

  // Create user in Logto
  const response = await fetch(`${LOGTO_ENDPOINT}/api/users`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${logtoToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      primaryEmail: email,
      username: username || undefined,
      name: fullName || undefined,
      customData: {
        clerkId: clerkUser.id,
        migrationDate: new Date().toISOString(),
        clerkMetadata: clerkUser.public_metadata
      }
    }),
  });

  if (response.ok) {
    console.log(`Successfully migrated ${email}`);
  } else {
    const errorData = await response.json();
    if (errorData.code === 'user.already_exists' || (errorData.message && errorData.message.includes('already exists'))) {
      console.log(`User ${email} already exists in Logto. Skipping.`);
    } else {
      console.error(`Failed to migrate ${email}:`, JSON.stringify(errorData));
    }
  }
}

async function main() {
  try {
    const logtoToken = await getLogtoToken();
    const clerkUsers = await fetchClerkUsers();
    
    console.log(`Found ${clerkUsers.length} users in Clerk.`);

    for (const user of clerkUsers) {
      await migrateUser(user, logtoToken);
    }

    console.log('Migration complete!');
  } catch (err) {
    console.error('Migration failed:', err.message);
    if (err.stack) console.error(err.stack);
  }
}

main();
