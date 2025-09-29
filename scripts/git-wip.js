#!/usr/bin/env node

const { execSync } = require('child_process');
const description = process.argv[2];

if (!description) {
  console.log('❌ Error: Work description required');
  console.log('Usage: bun run git:wip "what you are working on"');
  process.exit(1);
}

const message = `wip: ${description}`;

try {
  console.log('📝 Adding changes...');
  execSync('git add .', { stdio: 'inherit' });

  console.log('💾 Committing work in progress...');
  execSync(`git commit -m "${message}"`, { stdio: 'inherit' });

  console.log('✅ Work in progress saved! Remember to complete with git:done when finished.');
} catch (error) {
  console.log('❌ Git operation failed:', error.message);
  process.exit(1);
}