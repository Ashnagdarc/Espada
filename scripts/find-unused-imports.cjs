#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Function to extract imports from a file
function extractImports(content) {
  const imports = [];
  
  // Match various import patterns
  const importPatterns = [
    // import { named } from 'module'
    /import\s*\{\s*([^}]+)\s*\}\s*from\s*['"`]([^'"`]+)['"`]/g,
    // import defaultImport from 'module'
    /import\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s+from\s*['"`]([^'"`]+)['"`]/g,
    // import * as namespace from 'module'
    /import\s*\*\s*as\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s+from\s*['"`]([^'"`]+)['"`]/g,
    // import 'module' (side effect)
    /import\s*['"`]([^'"`]+)['"`]/g
  ];

  importPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      if (match[1] && match[2]) {
        // Named or default imports
        const importedNames = match[1].split(',').map(name => name.trim());
        imports.push({
          names: importedNames,
          module: match[2],
          type: 'named'
        });
      } else if (match[1]) {
        // Side effect import
        imports.push({
          names: [],
          module: match[1],
          type: 'side-effect'
        });
      }
    }
  });

  return imports;
}

// Function to check if an import is used in the file
function isImportUsed(importName, content) {
  // Remove import statements to avoid false positives
  const contentWithoutImports = content.replace(/import\s+.*?from\s*['"`][^'"`]+['"`]/g, '');
  
  // Clean import name (remove 'type ' prefix if present)
  const cleanImportName = importName.replace(/^type\s+/, '');
  
  // Check for usage patterns
  const usagePatterns = [
    new RegExp(`\\b${cleanImportName}\\b`, 'g'),
    new RegExp(`<${cleanImportName}`, 'g'), // JSX component usage
    new RegExp(`${cleanImportName}\\.`, 'g'), // Method/property access
    new RegExp(`${cleanImportName}\\(`, 'g'), // Function call
    new RegExp(`:\\s*${cleanImportName}`, 'g'), // Type annotation
    new RegExp(`<${cleanImportName}>`, 'g'), // Generic type
    new RegExp(`${cleanImportName}\\[`, 'g'), // Array type
  ];

  return usagePatterns.some(pattern => pattern.test(contentWithoutImports));
}

// Function to analyze a single file
function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const imports = extractImports(content);
    const unusedImports = [];

    imports.forEach(importObj => {
      if (importObj.type === 'side-effect') {
        // Side effect imports are always considered used
        return;
      }

      importObj.names.forEach(importName => {
        const cleanName = importName.replace(/\s*as\s+\w+/, '').trim();
        if (!isImportUsed(cleanName, content)) {
          unusedImports.push({
            name: cleanName,
            module: importObj.module,
            line: content.split('\n').findIndex(line => line.includes(importName)) + 1
          });
        }
      });
    });

    return unusedImports;
  } catch (error) {
    console.error(`Error analyzing ${filePath}:`, error.message);
    return [];
  }
}

// Function to find all TypeScript/JavaScript files
function findTSJSFiles(dir, excludeDirs = ['node_modules', '.git', '.next', 'dist', 'build']) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    items.forEach(item => {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !excludeDirs.includes(item)) {
        traverse(fullPath);
      } else if (stat.isFile() && /\.(ts|tsx|js|jsx)$/.test(item)) {
        files.push(fullPath);
      }
    });
  }
  
  traverse(dir);
  return files;
}

// Main function
function main() {
  const projectRoot = process.argv[2] || process.cwd();
  console.log(`Analyzing unused imports in: ${projectRoot}`);
  
  const files = findTSJSFiles(projectRoot);
  console.log(`Found ${files.length} TypeScript/JavaScript files`);
  
  let totalUnusedImports = 0;
  
  files.forEach(file => {
    const unusedImports = analyzeFile(file);
    if (unusedImports.length > 0) {
      console.log(`\n📁 ${path.relative(projectRoot, file)}:`);
      unusedImports.forEach(unused => {
        console.log(`  ❌ Line ${unused.line}: '${unused.name}' from '${unused.module}'`);
        totalUnusedImports++;
      });
    }
  });
  
  if (totalUnusedImports === 0) {
    console.log('\n✅ No unused imports found!');
  } else {
    console.log(`\n📊 Total unused imports found: ${totalUnusedImports}`);
  }
}

if (require.main === module) {
  main();
}

module.exports = { analyzeFile, extractImports, isImportUsed };