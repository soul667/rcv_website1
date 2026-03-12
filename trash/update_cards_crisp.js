const fs = require('fs');

let content = fs.readFileSync('src/components/TeamMembers.tsx', 'utf8');

const regex = /<Card key={[^{}]+\.id} onClick={[^{]*\{[^}]*\}[^{]*\{[^}]*\}[^>]*>[\s\S]*?<\/Card>/g;

let count = 0;
content = content.replace(regex, (match) => {
  count++;
  // Extract variable name from key={varName.id}
  const varMatch = match.match(/key={(\w+)\.id}/);
  if (!varMatch) return match;
  
  const varName = varMatch[1];
  
  return `<Card key={${varName}.id} onClick={() => onMemberClick?.(${varName})} className="bg-slate-800/40 border border-slate-700/50 hover:bg-slate-700/50 hover:border-slate-500 group rounded-[20px] p-6 text-center shadow-lg hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer overflow-hidden relative">
                  <CardContent className="p-0 relative z-10 flex flex-col h-full bg-transparent">
                    <div className="mb-5 relative mx-auto w-24 h-24 sm:w-28 sm:h-28">
                      <div className="absolute inset-0 bg-slate-500/10 rounded-full scale-100 group-hover:scale-110 transition-transform duration-300 pointer-events-none"></div>
                      <ImageWithFallback
                        src={${varName}.image}
                        alt={${varName}.name}
                        className="w-full h-full object-cover rounded-full border-2 border-slate-600/50 group-hover:border-slate-400 transition-colors duration-300 relative z-10"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-grow flex flex-col justify-between">
                      <div>
                        <h4 className="text-lg sm:text-xl font-bold tracking-tight mb-1 text-slate-100 group-hover:text-white transition-colors duration-300">
                          {language === 'zh' ? ${varName}.name : ${varName}.nameEn}
                        </h4>
                        <p className="text-sm text-slate-400 font-medium mb-4 group-hover:text-slate-300 transition-colors duration-300">
                          {language === 'zh' ? ${varName}.title : ${varName}.titleEn}
                        </p>
                      </div>
                      {${varName}.email && (
                        <div className="flex justify-center mt-auto pt-2">
                          <a
                            href={\`mailto:\${${varName}.email}\`}
                            className="p-2 inline-flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-600 transition-all duration-300 border border-slate-700 hover:border-slate-500"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Mail className="h-[18px] w-[18px]" />
                          </a>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>`;
});

console.log('Cards replaced:', count);
fs.writeFileSync('src/components/TeamMembers.tsx', content);
