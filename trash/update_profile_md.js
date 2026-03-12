const fs = require('fs');

let content = fs.readFileSync('src/components/MemberProfile.tsx', 'utf8');

// Replace top divider and container
content = content.replace(
  `        {/* Content - aligned with header */}
        <div className="border-t border-slate-700/60 pt-8">
          <div className="prose prose-invert max-w-none">`,
  `        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-slate-800 via-slate-600 to-slate-800 my-10 w-full" />

        {/* Content - aligned with header */}
        <div>
          <div className="markdown-custom-wrapper">
            <div className="markdown-body p-0 bg-transparent text-gray-300">`
);

// Replace the end tags
content = content.replace(
  `              </div>
            </div>
      </div>
    </div>`,
  `              </div>
            </div>
          </div>
      </div>
    </div>`
);

// Remove the unwanted markdown components overrides, but keep 'a', 'img', and 'youtube-embed'
// The regex below removes the block from 'h1' to 'li', and 'strong' to 'td'
content = content.replace(/h1:[^]*?a:\s*\(\{ href, children \}\) => \(\s*<a\s*href=\{href\}\s*className="[^"]*"\s*target="_blank"\s*rel="noopener noreferrer"\s*>\s*\{children\}\s*<\/a>\s*\),/m, `a: ({ href, children }) => (\n                      <a href={href} className="text-[#CB743B] hover:text-[#e08950] transition-colors" target="_blank" rel="noopener noreferrer">\n                        {children}\n                      </a>\n                    ),`);

content = content.replace(/strong:[^]*?td:\s*\(\{ children \}\) => <td[^>]*>\{children\}<\/td>,/m, '');

if (content.includes('markdown-custom-wrapper') && !content.includes('h1:')) {
    console.log('Successfully updated MemberProfile.tsx');
    fs.writeFileSync('src/components/MemberProfile.tsx', content);
} else {
    console.log('Failed to update correctly. Check patterns.');
    // dump current to temp file for debugging
    fs.writeFileSync('src/components/MemberProfile.tsx.temp', content);
}

