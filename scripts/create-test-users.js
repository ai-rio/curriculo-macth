#!/usr/bin/env node

/**
 * Create test users in local Supabase instance
 * Run with: node scripts/create-test-users.js
 */

const testUsers = [
  {
    email: 'user@example.com',
    password: 'TestPassword123!',
    fullName: 'Test User',
  },
  {
    email: 'developer@example.com',
    password: 'DevPassword123!',
    fullName: 'Test Developer',
  },
  {
    email: 'admin@example.com',
    password: 'AdminPassword123!',
    fullName: 'Test Admin',
  },
];

const SUPABASE_URL = 'http://127.0.0.1:54321';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

async function createUser(user) {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      email: user.email,
      password: user.password,
      data: {
        full_name: user.fullName,
      },
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    if (data.msg?.includes('already registered')) {
      console.log(`✓ User ${user.email} already exists`);
      return { success: true, existed: true };
    }
    throw new Error(`Failed to create ${user.email}: ${JSON.stringify(data)}`);
  }

  return { success: true, existed: false, data };
}

async function main() {
  console.log('Creating test users in local Supabase...\n');

  for (const user of testUsers) {
    try {
      const result = await createUser(user);
      if (!result.existed) {
        console.log(`✓ Created user: ${user.email}`);
        console.log(`  Name: ${user.fullName}`);
        console.log(`  Password: ${user.password}\n`);
      }
    } catch (error) {
      console.error(`✗ Error creating ${user.email}:`, error.message);
    }
  }

  console.log('\n✓ Test users setup complete!');
  console.log('\nYou can now login with:');
  testUsers.forEach((user) => {
    console.log(`  ${user.email} / ${user.password}`);
  });
}

main().catch(console.error);
