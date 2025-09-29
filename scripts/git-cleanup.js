#!/usr/bin/env node

const { execSync } = require('child_process');
const branchName = process.argv[2];

try {
  // Get current branch
  const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();

  // If branch name provided, clean up specific branch
  if (branchName) {
    if (branchName === 'main') {
      console.log('❌ Cannot delete main branch');
      process.exit(1);
    }

    if (currentBranch === branchName) {
      console.log('🔄 Switching to main before cleanup...');
      execSync('git checkout main', { stdio: 'inherit' });
    }

    console.log(`🧹 Deleting branch: ${branchName}`);

    // Delete local branch
    try {
      execSync(`git branch -D ${branchName}`, { stdio: 'inherit' });
      console.log(`✅ Local branch ${branchName} deleted`);
    } catch (error) {
      console.log(`⚠️  Local branch ${branchName} not found or already deleted`);
    }

    // Delete remote branch
    try {
      execSync(`git push origin --delete ${branchName}`, { stdio: 'inherit' });
      console.log(`✅ Remote branch ${branchName} deleted`);
    } catch (error) {
      console.log(`⚠️  Remote branch ${branchName} not found or already deleted`);
    }

    return;
  }

  // Auto-cleanup: find merged branches
  console.log('🔍 Finding merged branches to cleanup...');

  // Get merged branches (excluding main and current)
  let mergedBranches;
  try {
    mergedBranches = execSync('git branch --merged main', { encoding: 'utf8' })
      .split('\n')
      .map(branch => branch.trim().replace(/^\*\s*/, ''))
      .filter(branch => branch && branch !== 'main' && !branch.startsWith('* '));
  } catch (error) {
    console.log('❌ Could not get merged branches');
    process.exit(1);
  }

  if (mergedBranches.length === 0) {
    console.log('✅ No merged branches to cleanup');
    return;
  }

  console.log('🧹 Found merged branches to cleanup:');
  mergedBranches.forEach(branch => console.log(`  - ${branch}`));
  console.log('');

  // Switch to main if on a branch to be deleted
  if (mergedBranches.includes(currentBranch)) {
    console.log('🔄 Switching to main...');
    execSync('git checkout main', { stdio: 'inherit' });
  }

  // Delete each merged branch
  mergedBranches.forEach(branch => {
    try {
      execSync(`git branch -d ${branch}`, { stdio: 'inherit' });
      console.log(`✅ Deleted local branch: ${branch}`);
    } catch (error) {
      console.log(`⚠️  Could not delete local branch: ${branch}`);
    }
  });

  console.log('✅ Branch cleanup complete!');

} catch (error) {
  console.log('❌ Cleanup failed:', error.message);
  process.exit(1);
}