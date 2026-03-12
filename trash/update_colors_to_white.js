const fs = require('fs');

let content = fs.readFileSync('src/components/TeamMembers.tsx', 'utf8');

// The goal is to change the "indigo" glowing theme to a "white" glowing theme.
// Replaces in unified card string:
// bg-indigo-500/20 -> bg-white/10
content = content.replace(/bg-indigo-500\/20/g, 'bg-white/10');
// ring-indigo-400/40 -> ring-white/30
content = content.replace(/ring-indigo-400\/40/g, 'ring-white/30');
// text-indigo-200 -> text-white
content = content.replace(/text-indigo-200/g, 'text-white');
// hover:text-indigo-300 -> hover:text-white
content = content.replace(/hover:text-indigo-300/g, 'hover:text-white');

// Dividers:
// bg-gradient-to-r from-transparent to-indigo-500/50 -> to-white/30
content = content.replace(/to-indigo-500\/50/g, 'to-white/30');
// bg-indigo-400 -> bg-white
content = content.replace(/bg-indigo-400/g, 'bg-white');
// shadow-[0_0_8px_rgba(129,140,248,0.8)] -> shadow-[0_0_8px_rgba(255,255,255,0.8)]
content = content.replace(/shadow-\[0_0_8px_rgba\(129,140,248,0\.8\)\]/g, 'shadow-[0_0_8px_rgba(255,255,255,0.8)]');

fs.writeFileSync('src/components/TeamMembers.tsx', content);
console.log('Done converting TeamMembers colors to white.');
