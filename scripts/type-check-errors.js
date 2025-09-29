#!/usr/bin/env bun

/**
 * Type Check Error Analysis Tool
 * Analyzes TypeScript and Python type checking errors across the monorepo
 */

import { spawnSync } from 'child_process';
import { resolve } from 'path';

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function colorize(text, color) {
  return `${color}${text}${COLORS.reset}`;
}

function runCommand(command, cwd) {
  const result = spawnSync(command, {
    shell: true,
    cwd,
    encoding: 'utf-8',
    maxBuffer: 10 * 1024 * 1024, // 10MB buffer
  });

  return {
    stdout: result.stdout || '',
    stderr: result.stderr || '',
    output: (result.stdout || '') + (result.stderr || ''),
    exitCode: result.status,
  };
}

function analyzeTypeScriptErrors(output) {
  const lines = output.split('\n');
  const errorLines = lines.filter(line => line.includes('error TS'));

  const errorsByCode = {};
  const errorsByFile = {};

  errorLines.forEach(line => {
    // Extract error code (e.g., TS2339)
    const codeMatch = line.match(/error (TS\d+):/);
    if (codeMatch) {
      const code = codeMatch[1];
      errorsByCode[code] = (errorsByCode[code] || 0) + 1;
    }

    // Extract file path
    const fileMatch = line.match(/^(.+?)\(\d+,\d+\):/);
    if (fileMatch) {
      const file = fileMatch[1];
      errorsByFile[file] = (errorsByFile[file] || 0) + 1;
    }
  });

  return {
    total: errorLines.length,
    byCode: errorsByCode,
    byFile: errorsByFile,
    lines: errorLines,
  };
}

function analyzePythonErrors(output) {
  const lines = output.split('\n');

  // Pyright error patterns
  const errorLines = lines.filter(line =>
    line.includes('error:') ||
    line.includes('warning:') ||
    line.includes('information:')
  );

  const errorsByType = {};
  const errorsByFile = {};
  const errorsByCategory = {
    error: 0,
    warning: 0,
    information: 0,
  };

  errorLines.forEach(line => {
    // Count by severity
    if (line.includes('- error:')) {
      errorsByCategory.error++;
    } else if (line.includes('- warning:')) {
      errorsByCategory.warning++;
    } else if (line.includes('- information:')) {
      errorsByCategory.information++;
    }

    // Extract error type (e.g., reportGeneralTypeIssues)
    const typeMatch = line.match(/- (?:error|warning|information): (.+?) \[/);
    if (typeMatch) {
      const type = typeMatch[1];
      errorsByType[type] = (errorsByType[type] || 0) + 1;
    }

    // Extract file path
    const fileMatch = line.match(/^  (.+?:\d+:\d+) -/);
    if (fileMatch) {
      const filePath = fileMatch[1].split(':')[0];
      errorsByFile[filePath] = (errorsByFile[filePath] || 0) + 1;
    }
  });

  // Also check for summary line
  const summaryMatch = output.match(/(\d+) errors?, (\d+) warnings?, (\d+) informations?/);
  if (summaryMatch) {
    errorsByCategory.error = parseInt(summaryMatch[1]);
    errorsByCategory.warning = parseInt(summaryMatch[2]);
    errorsByCategory.information = parseInt(summaryMatch[3]);
  }

  return {
    total: errorsByCategory.error,
    warnings: errorsByCategory.warning,
    information: errorsByCategory.information,
    byType: errorsByType,
    byFile: errorsByFile,
    lines: errorLines,
  };
}

function printDivider(char = '=', length = 80) {
  console.log(colorize(char.repeat(length), COLORS.cyan));
}

function printSection(title) {
  console.log();
  printDivider();
  console.log(colorize(`  ${title}`, COLORS.bright + COLORS.cyan));
  printDivider();
  console.log();
}

function printTypeScriptAnalysis(analysis) {
  printSection('TypeScript Type Check Results');

  if (analysis.total === 0) {
    console.log(colorize('✓ No TypeScript errors found!', COLORS.green));
    return;
  }

  console.log(colorize(`Total Errors: ${analysis.total}`, COLORS.red));
  console.log();

  // Errors by code
  console.log(colorize('Errors by Type Code:', COLORS.yellow));
  const sortedCodes = Object.entries(analysis.byCode)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  sortedCodes.forEach(([code, count]) => {
    const description = getTypeScriptErrorDescription(code);
    console.log(`  ${colorize(code, COLORS.magenta)}: ${count} - ${description}`);
  });

  console.log();

  // Top files with errors
  console.log(colorize('Top 10 Files with Errors:', COLORS.yellow));
  const sortedFiles = Object.entries(analysis.byFile)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  sortedFiles.forEach(([file, count]) => {
    console.log(`  ${colorize(count.toString().padStart(3), COLORS.red)} errors in ${file}`);
  });
}

function printPythonAnalysis(analysis) {
  printSection('Python Type Check Results');

  if (analysis.total === 0 && analysis.warnings === 0) {
    console.log(colorize('✓ No Python errors found!', COLORS.green));
    if (analysis.information > 0) {
      console.log(colorize(`ℹ ${analysis.information} information messages`, COLORS.cyan));
    }
    return;
  }

  console.log(colorize(`Errors: ${analysis.total}`, COLORS.red));
  console.log(colorize(`Warnings: ${analysis.warnings}`, COLORS.yellow));
  if (analysis.information > 0) {
    console.log(colorize(`Information: ${analysis.information}`, COLORS.cyan));
  }
  console.log();

  // Errors by type
  if (Object.keys(analysis.byType).length > 0) {
    console.log(colorize('Errors by Type:', COLORS.yellow));
    const sortedTypes = Object.entries(analysis.byType)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);

    sortedTypes.forEach(([type, count]) => {
      console.log(`  ${colorize(type, COLORS.magenta)}: ${count}`);
    });
    console.log();
  }

  // Top files with errors
  if (Object.keys(analysis.byFile).length > 0) {
    console.log(colorize('Top 10 Files with Errors:', COLORS.yellow));
    const sortedFiles = Object.entries(analysis.byFile)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);

    sortedFiles.forEach(([file, count]) => {
      console.log(`  ${colorize(count.toString().padStart(3), COLORS.red)} errors in ${file}`);
    });
  }
}

function printCombinedSummary(tsAnalysis, pyAnalysis) {
  printSection('Combined Summary');

  const totalErrors = tsAnalysis.total + pyAnalysis.total;
  const totalWarnings = pyAnalysis.warnings;

  console.log(colorize('Monorepo Type Check Status:', COLORS.bright));
  console.log(`  Frontend (TypeScript): ${tsAnalysis.total === 0 ? colorize('✓ PASS', COLORS.green) : colorize(`✗ ${tsAnalysis.total} errors`, COLORS.red)}`);
  console.log(`  Backend (Python):      ${pyAnalysis.total === 0 ? colorize('✓ PASS', COLORS.green) : colorize(`✗ ${pyAnalysis.total} errors`, COLORS.red)}${pyAnalysis.warnings > 0 ? colorize(` (${pyAnalysis.warnings} warnings)`, COLORS.yellow) : ''}`);
  console.log();
  console.log(colorize(`Total: ${totalErrors} errors, ${totalWarnings} warnings`, totalErrors === 0 ? COLORS.green : COLORS.red));

  if (totalErrors > 0) {
    console.log();
    console.log(colorize('Next Steps:', COLORS.yellow));
    console.log('  1. Review the documentation: docs/development/type-check/README.md');
    console.log('  2. Fix high-priority errors first (see error classification)');
    console.log('  3. Run type checks frequently during development');
    console.log('  4. Use "bun run type-check:frontend" or "bun run type-check:backend" to check specific parts');
  }
}

function getTypeScriptErrorDescription(code) {
  const descriptions = {
    'TS2339': 'Property does not exist on type',
    'TS2345': 'Argument not assignable to parameter',
    'TS18047': 'Possibly null or undefined',
    'TS7006': 'Parameter implicitly has any type',
    'TS2322': 'Type is not assignable',
    'TS18046': 'Possibly undefined',
    'TS2531': 'Object is possibly null',
    'TS2532': 'Object is possibly undefined',
    'TS2304': 'Cannot find name',
    'TS2305': 'Module has no exported member',
    'TS2307': 'Cannot find module',
    'TS2571': 'Object is of type unknown',
    'TS7031': 'Binding element implicitly has any type',
    'TS2769': 'No overload matches this call',
  };

  return descriptions[code] || 'See TypeScript documentation';
}

function main() {
  const args = process.argv.slice(2);
  const target = args[0]; // 'frontend', 'backend', or undefined for both

  console.log(colorize('\n🔍 Type Check Error Analysis Tool\n', COLORS.bright + COLORS.blue));

  const rootDir = resolve(import.meta.dir, '..');
  let tsAnalysis = { total: 0, byCode: {}, byFile: {}, lines: [] };
  let pyAnalysis = { total: 0, warnings: 0, information: 0, byType: {}, byFile: {}, lines: [] };

  // Run TypeScript type check
  if (!target || target === 'frontend') {
    console.log(colorize('Running TypeScript type check...', COLORS.cyan));
    const tsResult = runCommand('bun run type-check:frontend', rootDir);
    tsAnalysis = analyzeTypeScriptErrors(tsResult.output);
  }

  // Run Python type check
  if (!target || target === 'backend') {
    console.log(colorize('Running Python type check...', COLORS.cyan));
    const pyResult = runCommand('bun run type-check:backend', rootDir);
    pyAnalysis = analyzePythonErrors(pyResult.output);
  }

  // Print analyses
  if (!target || target === 'frontend') {
    printTypeScriptAnalysis(tsAnalysis);
  }

  if (!target || target === 'backend') {
    printPythonAnalysis(pyAnalysis);
  }

  // Print combined summary if checking both
  if (!target) {
    printCombinedSummary(tsAnalysis, pyAnalysis);
  }

  console.log();
  printDivider();
  console.log();

  // Exit with error code if there are errors
  const hasErrors = tsAnalysis.total > 0 || pyAnalysis.total > 0;
  process.exit(hasErrors ? 1 : 0);
}

main();