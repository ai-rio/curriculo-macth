#!/usr/bin/env node

const { execSync } = require('child_process');
const title = process.argv[2];
const description = process.argv[3] || '';

if (!title) {
  console.log('❌ Error: PR title required');
  console.log('Usage: bun git:pr "PR Title" "Optional Description"');
  console.log('Examples:');
  console.log('  bun git:pr "Add Stripe payment integration"');
  console.log('  bun git:pr "Fix resume upload bug" "Resolves issue with large file uploads"');
  process.exit(1);
}

try {
  // Get current branch
  const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();

  if (currentBranch === 'main') {
    console.log('❌ Cannot create PR from main branch');
    console.log('💡 Use: bun git:branch "feature-name" to create a feature branch first');
    process.exit(1);
  }

  console.log(`🔍 Creating PR from branch: ${currentBranch}`);

  // Check if there are commits to push
  try {
    execSync(`git log origin/main..HEAD --oneline`, { stdio: 'pipe' });
  } catch (error) {
    console.log('❌ No commits found on this branch to create PR');
    console.log('💡 Make some commits first, then try again');
    process.exit(1);
  }

  // Ensure branch is pushed
  console.log('📤 Pushing branch to remote...');
  execSync(`git push origin ${currentBranch}`, { stdio: 'inherit' });

  // Check if gh CLI is available
  try {
    execSync('gh --version', { stdio: 'pipe' });
  } catch (error) {
    console.log('❌ GitHub CLI (gh) not installed');
    console.log('📋 Manual PR creation required:');
    // Update with your repo URL
    console.log(`   https://github.com/YOUR_USERNAME/Resume-Matcher/compare/main...${currentBranch}`);
    console.log('💡 Install gh CLI: https://cli.github.com/');
    process.exit(0);
  }

  // Create PR
  console.log('🚀 Creating pull request...');
  const prBody = description || `## Summary\n\nImplemented from branch: ${currentBranch}\n\n## Test Plan\n\n- [ ] Tested locally\n- [ ] Frontend tests pass\n- [ ] Backend tests pass\n- [ ] No breaking changes\n\n🤖 Generated with [Claude Code](https://claude.ai/code)`;

  const result = execSync(`gh pr create --title "${title}" --body "${prBody}" --base main`, {
    encoding: 'utf8',
    stdio: 'pipe'
  });

  console.log('✅ Pull request created successfully!');
  console.log(`🔗 ${result.trim()}`);

} catch (error) {
  console.log('❌ PR creation failed:', error.message);

  // Fallback to manual PR creation
  const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
  console.log('📋 Create PR manually:');
  console.log(`   https://github.com/YOUR_USERNAME/Resume-Matcher/compare/main...${currentBranch}`);

  process.exit(1);
}