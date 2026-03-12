const fs = require('fs');

let content = fs.readFileSync('src/components/TeamMembers.tsx', 'utf8');

// For Figure 2, the user wants "frosted semi-transparent, NO BLUE".
// Current invisible hover bg:
// bg-slate-800/80 border border-slate-600/60
// We need to change this to a frosted gray look without blue tints (like slate). 
// Let's use neutral gray with backdrop-blur.

const regex = /bg-slate-800\/80 border border-slate-600\/60 rounded-\[20px\] opacity-0 group-hover:opacity-100 shadow-xl/g;
const replacement = 'bg-[#2a2a2a]/60 backdrop-blur-md border border-white/10 rounded-[20px] opacity-0 group-hover:opacity-100 shadow-2xl';

let replacedContent = content.replace(regex, replacement);

if (replacedContent !== content) {
    console.log('Successfully updated card hover backgrounds to frosted gray.');
    fs.writeFileSync('src/components/TeamMembers.tsx', replacedContent);
} else {
    console.log('Could not find the target string to replace.');
}

