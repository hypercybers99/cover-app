import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ERROR_MAPPINGS } from '../src/lib/errors.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// 1. Generate Markdown Table Rows from ERROR_MAPPINGS ONLY
const sortedEntries = Object.entries(ERROR_MAPPINGS).sort(([a], [b]) => a.localeCompare(b));

const header = [
  '| Contract Error String / Prefix | Contract | User-Facing Explanation | Suggested Remediation |',
  '| :--- | :--- | :--- | :--- |'
];

const rows = sortedEntries.map(([k, v]) => {
  return `| \`${k}\` | ${v.contract} | ${v.plainMessage} | ${v.nextStep} |`;
});

const tableMarkdown = [...header, ...rows].join('\n');

// 2. Update README.md
const readmePath = path.join(rootDir, 'README.md');
let readme = fs.readFileSync(readmePath, 'utf8');

const readmeRegex = /## Error Remediation Reference[\s\S]*?(?=\n---|\n## License|$)/;
const newReadmeSection = `## Error Remediation Reference

Every \`gl.vm.UserError\` raised by the contracts (52 raise statements: 50 in \`Cover.py\` across 29 unique templates, 2 in \`CoverGuard.py\` across 2 templates) maps to a clear user explanation and suggested action in the UI:

${tableMarkdown}\n`;

readme = readme.replace(readmeRegex, newReadmeSection);
fs.writeFileSync(readmePath, readme, 'utf8');
console.log('Updated README.md Error Remediation Reference from src/lib/errors.ts');

// 3. Update or Create docs/FINAL_REPORT_APP_V2.md
const sourceReportPath = path.join(rootDir, 'docs/FINAL_REPORT_APP.md');
let reportContent = fs.readFileSync(sourceReportPath, 'utf8');

const reportRegex = /## 5\. Contract Error Mappings & UserError Table[\s\S]*?(?=\n---|\n## 6)/;
const newReportSection = `## 5. Contract Error Mappings & UserError Table

Total \`gl.vm.UserError\` raise statements in contracts: 52 (50 in \`Cover.py\` across 29 unique templates, 2 in \`CoverGuard.py\` across 2 templates).
Every instance is mapped to structured user-facing messages and actionable remediation advice directly from \`src/lib/errors.ts\`:

${tableMarkdown}\n`;

reportContent = reportContent.replace(reportRegex, newReportSection);
reportContent = reportContent.replace(/# FINAL_REPORT_APP: Cover Web Application \(V2\)/, '# FINAL_REPORT_APP_V2: Cover Web Application (V2)');

const destReportPath = path.join(rootDir, 'docs/FINAL_REPORT_APP_V2.md');
fs.writeFileSync(destReportPath, reportContent, 'utf8');
console.log(`Generated ${destReportPath} from src/lib/errors.ts ONLY (${sortedEntries.length} mapped templates)`);

// Also synchronize FINAL_REPORT_APP.md
fs.writeFileSync(sourceReportPath, reportContent.replace('# FINAL_REPORT_APP_V2', '# FINAL_REPORT_APP'), 'utf8');
