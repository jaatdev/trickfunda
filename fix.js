const fs = require('fs');
let content = fs.readFileSync('app/admin/editor/page.tsx', 'utf8');
content = content.replaceAll("\\`", "`");
content = content.replaceAll("\\\\n", "\\n");
fs.writeFileSync('app/admin/editor/page.tsx', content);
