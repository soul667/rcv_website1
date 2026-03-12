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
  
  return `<Card key={${varName}.id} onClick={() => onMemberClick?.(${varName})} className="bg-transparent border-none shadow-none group rounded-[20px] p-4 sm:p-6 text-center hover:-translate-y-1 transition-all duration-300 cursor-pointer relative">
                  {/* Crisp hover background that is invisible by default */}
                  <div className="absolute inset-0 bg-slate-800/80 border border-slate-600/60 rounded-[20px] opacity-0 group-hover:opacity-100 shadow-xl transition-all duration-300 pointer-events-none z-0"></div>
                  
                  <CardContent className="p-0 relative z-10 flex flex-col h-full bg-transparent">
                    <div className="mb-5 relative mx-auto w-24 h-24 sm:w-28 sm:h-28">
                      <ImageWithFallback
                        src={${varName}.image}
                        alt={${varName}.name}
                        className="w-full h-full object-cover rounded-full ring-2 ring-transparent group-hover:ring-slate-300 group-hover:ring-offset-4 group-hover:ring-offset-slate-800 transition-all duration-300 relative z-10"
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
                            className="p-2 inline-flex items-center justify-center rounded-full bg-transparent text-slate-500 hover:text-white hover:bg-slate-600 transition-all duration-300 opacity-0 group-hover:opacity-100"
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

console.log('Cards replaced to invisible base:', count);
fs.writeFileSync('src/components/TeamMembers.tsx', content);
