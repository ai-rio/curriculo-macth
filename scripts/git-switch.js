#!/usr/bin/env node

const { execSync } = require('child_process');
const branchName = process.argv[2];

if (!branchName) {
  console.log('❌ Error: Branch name required');
  console.log('Usage: bun git:switch "branch-name"');
  console.log('Examples:');
  console.log('  bun git:switch main');
  console.log('  bun git:switch feature/payment-integration');
  process.exit(1);
}

try {
  console.log('🔍 Checking current state...');

  // Check for uncommitted changes
  try {
    execSync('git diff-index --quiet HEAD --', { stdio: 'pipe' });
    console.log('✅ Working tree is clean');
  } catch (error) {
    console.log('⚠️  You have uncommitted changes.');
    console.log('💾 Auto-saving current work...');

    // Get current branch name for WIP commit
    const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();

    execSync('git add .', { stdio: 'inherit' });
    execSync(`git commit -m "wip: auto-save before switching from ${currentBranch} to ${branchName}"`, { stdio: 'inherit' });
    console.log('✅ Work saved automatically');
  }

  // Check if target branch exists
  try {
    execSync(`git rev-parse --verify ${branchName}`, { stdio: 'pipe' });
    console.log(`🔄 Switching to existing branch: ${branchName}`);
  } catch (error) {
    console.log(`❌ Branch '${branchName}' does not exist`);
    console.log('💡 Use: bun git:branch "branch-name" to create a new branch');
    process.exit(1);
  }

  // Switch to target branch
  execSync(`git checkout ${branchName}`, { stdio: 'inherit' });

  // Pull latest if it's a remote branch
  if (branchName === 'main' || branchName.startsWith('origin/')) {
    console.log('📥 Pulling latest changes...');
    execSync(`git pull origin ${branchName}`, { stdio: 'inherit' });
  }

  console.log(`✅ Successfully switched to branch: ${branchName}`);

} catch (error) {
  console.log('❌ Branch switch failed:', error.message);
  process.exit(1);
}