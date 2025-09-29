#!/usr/bin/env node

const { execSync } = require('child_process');
const message = process.argv[2];

if (!message) {
  console.log('❌ Error: Commit message required');
  console.log('Usage: bun run git:done "your commit message"');
  process.exit(1);
}

try {
  console.log('📝 Adding changes...');
  execSync('git add .', { stdio: 'inherit' });

  console.log('💾 Committing changes...');
  execSync(`git commit -m "${message}"`, { stdio: 'inherit' });

  console.log('🚀 Pushing to remote...');
  execSync('git push origin HEAD', { stdio: 'inherit' });

  console.log('✅ Work completed and pushed successfully!');
} catch (error) {
  console.log('❌ Git operation failed:', error.message);
  process.exit(1);
}