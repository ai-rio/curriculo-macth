#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function runCommand(command, options = {}) {
  try {
    return {
      success: true,
      output: execSync(command, { encoding: 'utf8', ...options }).trim()
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

function ensureBackupDir() {
  const backupDir = path.join(process.cwd(), '.git-backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
    console.log('📁 Created backup directory: .git-backups/');
  }
  return backupDir;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function cleanupOldBackups(backupDir, keepCount = 10) {
  try {
    const backups = fs.readdirSync(backupDir)
      .filter(file => file.endsWith('.bundle'))
      .map(file => ({
        name: file,
        path: path.join(backupDir, file),
        mtime: fs.statSync(path.join(backupDir, file)).mtime
      }))
      .sort((a, b) => b.mtime - a.mtime); // Sort by modification time, newest first

    if (backups.length > keepCount) {
      const toDelete = backups.slice(keepCount);
      console.log(`🧹 Cleaning up ${toDelete.length} old backups...`);

      for (const backup of toDelete) {
        fs.unlinkSync(backup.path);
        console.log(`   🗑️  Deleted: ${backup.name}`);
      }
    }
  } catch (error) {
    console.log(`⚠️  Warning: Could not clean up old backups: ${error.message}`);
  }
}

async function createBackup() {
  console.log('💾 Resume-Matcher Git Repository Backup');
  console.log('========================================');
  console.log('');

  // Ensure we're in a git repository
  const isGitRepo = runCommand('git rev-parse --is-inside-work-tree');
  if (!isGitRepo.success) {
    console.log('❌ Error: Not in a git repository');
    process.exit(1);
  }

  // Get repository information
  const repoName = path.basename(process.cwd());
  const currentBranch = runCommand('git rev-parse --abbrev-ref HEAD');
  const commitHash = runCommand('git rev-parse HEAD');

  console.log(`📦 Repository: ${repoName}`);
  console.log(`🌿 Current branch: ${currentBranch.output}`);
  console.log(`📝 Latest commit: ${commitHash.output?.substring(0, 8)}`);
  console.log('');

  // Check for uncommitted changes and warn
  const statusResult = runCommand('git status --porcelain');
  if (statusResult.success && statusResult.output.length > 0) {
    console.log('⚠️  Warning: Uncommitted changes detected');
    console.log('   Backup will only include committed changes');
    console.log('   💡 Run: bun git:wip "description" to include current work');
    console.log('');
  }

  // Ensure backup directory exists
  const backupDir = ensureBackupDir();

  // Create timestamp for backup
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').split('.')[0];
  const backupName = `${repoName}_${timestamp}.bundle`;
  const backupPath = path.join(backupDir, backupName);

  try {
    console.log('🔄 Creating complete repository backup...');

    // Create git bundle with all branches and tags
    const bundleResult = runCommand(`git bundle create "${backupPath}" --all`);

    if (!bundleResult.success) {
      throw new Error(`Bundle creation failed: ${bundleResult.error}`);
    }

    // Get backup file size
    const backupStat = fs.statSync(backupPath);
    const backupSize = formatBytes(backupStat.size);

    console.log('✅ Backup created successfully!');
    console.log(`   📄 File: ${backupName}`);
    console.log(`   📊 Size: ${backupSize}`);
    console.log(`   📍 Location: .git-backups/${backupName}`);
    console.log('');

    // Create backup metadata
    const metadata = {
      timestamp: new Date().toISOString(),
      repository: repoName,
      branch: currentBranch.output,
      commit: commitHash.output,
      size: backupStat.size,
      hasUncommittedChanges: statusResult.output.length > 0
    };

    const metadataPath = backupPath.replace('.bundle', '.json');
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

    // Test backup integrity
    console.log('🔍 Verifying backup integrity...');
    const verifyResult = runCommand(`git bundle verify "${backupPath}"`);

    if (verifyResult.success) {
      console.log('✅ Backup verification successful');
    } else {
      console.log('⚠️  Warning: Backup verification failed');
      console.log('   Backup may be corrupted or incomplete');
    }

    // Clean up old backups
    cleanupOldBackups(backupDir);

    // Show recent backups
    console.log('');
    console.log('📚 Recent backups:');
    const recentBackups = fs.readdirSync(backupDir)
      .filter(file => file.endsWith('.bundle'))
      .sort()
      .reverse()
      .slice(0, 5);

    for (const backup of recentBackups) {
      const backupFilePath = path.join(backupDir, backup);
      const stat = fs.statSync(backupFilePath);
      const isNew = backup === backupName;
      console.log(`   ${isNew ? '🆕' : '📄'} ${backup} (${formatBytes(stat.size)}, ${stat.mtime.toLocaleDateString()})`);
    }

    console.log('');
    console.log('💡 Backup Tips:');
    console.log('   • Store backups in multiple locations for safety');
    console.log('   • Test restoration periodically: bun git:restore-backup');
    console.log('   • Backups include all branches, tags, and commit history');
    console.log('   • Consider automating backups with cron jobs');

  } catch (error) {
    console.error('❌ Backup failed:', error.message);

    // Clean up partial backup
    if (fs.existsSync(backupPath)) {
      fs.unlinkSync(backupPath);
    }

    process.exit(1);
  }
}

createBackup().catch(error => {
  console.error('❌ Backup process failed:', error.message);
  process.exit(1);
});