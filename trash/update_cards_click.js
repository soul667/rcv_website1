const fs = require('fs');

let content = fs.readFileSync('src/components/TeamMembers.tsx', 'utf8');

// The new unified card component string without the button, and with onClick on the Card itself.
const getNewCard = (itemName) => `
                <Card key={${itemName}.id} onClick={() => onMemberClick?.(${itemName})} className="!bg-transparent !border-none shadow-none cursor-pointer group rounded-3xl p-4 card-hover-breathe relative overflow-hidden text-left">
                  <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                  <CardContent className="p-0 sm:p-4 text-center relative z-10">
                    <div className="mb-4 relative inline-block">
                      <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 scale-150" />
                      <ImageWithFallback
                        src={${itemName}.image}
                        alt={${itemName}.name}
                        className="w-24 h-24 aspect-square rounded-full mx-auto object-cover ring-2 ring-white/10 group-hover:ring-4 group-hover:ring-indigo-400/40 group-hover:scale-105 transition-all duration-500 relative z-10"
                        loading="lazy"
                      />
                    </div>
                    <h4 className="text-lg font-semibold tracking-wide mb-1 text-white group-hover:text-indigo-200 transition-colors duration-300">
                      {language === 'zh' ? ${itemName}.name : ${itemName}.nameEn}
                    </h4>
                    <p className="text-xs text-gray-400 mb-4 font-light tracking-wide opacity-80 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:translate-y-1">
                      {language === 'zh' ? ${itemName}.title : ${itemName}.titleEn}
                    </p>
                    {${itemName}.email && (
                      <div className="flex justify-center mb-3">
                        <a
                          href={\`mailto:\${${itemName}.email}\`}
                          className="p-1.5 text-gray-500 hover:text-indigo-300 transition-colors transform group-hover:translate-y-1 opacity-80 group-hover:opacity-100 duration-300"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Mail className="h-4 w-4" />
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
`;

const replaceBlock = (regexArrayName) => {
  const r = new RegExp(`\\{${regexArrayName}\\.map\\(\\((.*?)\\) => \\([\\s\\S]*?<\\/Card>\\n\\s*\\)\\)\\}`, 'g');
  content = content.replace(r, (match, itemName) => {
     return `{${regexArrayName}.map((${itemName}) => (${getNewCard(itemName)}              ))}`;
  });
};

replaceBlock('faculty');
replaceBlock('phdStudents');
replaceBlock('masterStudents');
replaceBlock('researchAssociates');
replaceBlock('administrativeAssistants');
replaceBlock('others');

fs.writeFileSync('src/components/TeamMembers.tsx', content);
console.log('Done removing buttons and setting onClick.');
