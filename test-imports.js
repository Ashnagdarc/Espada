// Simple test to verify the Badge component can be found
const fs = require('fs');
const path = require('path');

// Check if the badge file exists
const badgeFile = path.join(__dirname, 'components', 'ui', 'badge.tsx');
const buttonFile = path.join(__dirname, 'components', 'ui', 'Button.tsx');

console.log('Testing file existence:');
console.log('Badge file exists:', fs.existsSync(badgeFile));
console.log('Button file exists:', fs.existsSync(buttonFile));

// Check the product page import
const productPageFile = path.join(__dirname, 'app', 'products', '[id]', 'page.tsx');
if (fs.existsSync(productPageFile)) {
  const content = fs.readFileSync(productPageFile, 'utf8');
  const hasBadgeImport = content.includes("import { Badge } from '@/components/ui/badge'");
  const hasButtonImport = content.includes("import { Button } from '@/components/ui/Button'");
  
  console.log('Product page imports:');
  console.log('Badge import (lowercase):', hasBadgeImport);
  console.log('Button import (uppercase):', hasButtonImport);
}