const fs = require('fs');

let content = fs.readFileSync('src/components/TeamMembers.tsx', 'utf8');

const dividerHtml = `
            {/* Elegant Section Divider */}
            <div className="flex items-center justify-center my-12 opacity-40">
              <div className="w-1/3 h-[1px] bg-gradient-to-r from-transparent to-indigo-500/50"></div>
              <div className="w-2 h-2 rounded-full bg-indigo-400 mx-4 shadow-[0_0_8px_rgba(129,140,248,0.8)]"></div>
              <div className="w-1/3 h-[1px] bg-gradient-to-l from-transparent to-indigo-500/50"></div>
            </div>
`;

// Replace `</div>\n        )}\n\n        {/* PhD Students */}`
// Basically we need to inject the divider BEFORE every new major category block.

const replaceBlock = (regexStr, replaceStr) => {
  content = content.replace(new RegExp(regexStr, 'g'), replaceStr);
};

// Insert a divider before PhD Students
replaceBlock(
  `</div>\n        \\)}\\n\\n        \\{\\/\\* PhD Students \\*\\/\\}`,
  `</div>\n        )}\n${dividerHtml}\n        {/* PhD Students */}`
);

// Insert a divider before Master Students
replaceBlock(
  `</div>\n        \\)}\\n\\n        \\{\\/\\* Master Students \\*\\/\\}`,
  `</div>\n        )}\n${dividerHtml}\n        {/* Master Students */}`
);

// Insert a divider before Research Associates
replaceBlock(
  `</div>\n        \\)}\\n\\n        \\{\\/\\* Research Associates \\*\\/\\}`,
  `</div>\n        )}\n${dividerHtml}\n        {/* Research Associates */}`
);

// Insert a divider before Administrative Assistants
replaceBlock(
  `</div>\n        \\)}\\n\\n        \\{\\/\\* Administrative Assistants \\*\\/\\}`,
  `</div>\n        )}\n${dividerHtml}\n        {/* Administrative Assistants */}`
);

// Insert a divider before Other Members
replaceBlock(
  `</div>\n        \\)}\\n\\n        \\{\\/\\* Other Members \\*\\/\\}`,
  `</div>\n        )}\n${dividerHtml}\n        {/* Other Members */}`
);

// Insert a divider before Alumni Section
replaceBlock(
  `</div>\n        \\)}\\n\\n        \\{\\/\\* Alumni Section \\*\\/\\}`,
  `</div>\n        )}\n${dividerHtml}\n        {/* Alumni Section */}`
);


fs.writeFileSync('src/components/TeamMembers.tsx', content);
console.log('Done inserting dividers.');
