import * as fs from 'fs';
import { resolve } from 'path';

function isSortedCaseInsensitive(arr: string[]): boolean {
  for (let i = 1; i < arr.length; i++) {
    if (arr[i - 1].toLowerCase().localeCompare(arr[i].toLowerCase()) > 0) {
      return false;
    }
  }
  return true;
}

function main(): void {
  const allowlistPath = resolve(process.cwd(), 'ALLOWLIST');
  const content = fs.readFileSync(allowlistPath, 'utf-8');
  const lines = content.split('\n').map(l => l.trim()).filter(l => l);

  if (!isSortedCaseInsensitive(lines)) {
    console.error('❌ ALLOWLIST is not sorted alphabetically!');
    console.error('Run the following to sort it:');
    console.error('  sort -f ALLOWLIST -o ALLOWLIST');
    process.exit(1);
  }

  // Check for duplicates
  const uniqueLines = Array.from(new Set(lines.map(l => l.toLowerCase())));
  if (uniqueLines.length !== lines.length) {
    console.error('❌ ALLOWLIST contains duplicates!');
    process.exit(1);
  }

  console.log('✅ ALLOWLIST is properly sorted and has no duplicates');
}

main();
