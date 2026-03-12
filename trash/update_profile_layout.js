const fs = require('fs');

let content = fs.readFileSync('src/components/pages/TeamPage.tsx', 'utf8');

// The layout the user sees in Figure 3 is from TeamPage.tsx, which is the detailed profile view.
// Let's redesign the top header part to look better.

// Current layout starts with: 
// <div className="flex flex-col md:flex-row gap-8 mb-12 items-start">
//   {member.image && (
//     <img src={member.image} alt={member.name} className="w-48 h-48 rounded-xl object-cover shadow-lg" />
//   )}
//   <div>
//     <h1 className="text-4xl font-bold mb-2 text-slate-100">{language === 'zh' ? member.name : member.nameEn}</h1>
//     ...

const newTopLayout = `
        {/* Profile Header Redesign */}
        <div className="relative mb-16 mt-4">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-800/80 to-slate-900/40 rounded-[2rem] border border-slate-700/50 shadow-2xl overflow-hidden -z-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start p-8 sm:p-12">
            {member.image && (
              <div className="relative flex-shrink-0 group">
                <div className="absolute inset-0 bg-slate-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
                <img 
                  src={member.image} 
                  alt={member.name} 
                  className="w-40 h-40 sm:w-56 sm:h-56 rounded-2xl object-cover ring-4 ring-slate-800/50 shadow-xl relative z-10 transition-transform duration-300 group-hover:scale-[1.02]" 
                />
              </div>
            )}
            
            <div className="flex-1 text-center md:text-left pt-2">
              <h1 className="text-4xl sm:text-5xl font-extrabold mb-3 text-white tracking-tight">
                {language === 'zh' ? member.name : member.nameEn}
              </h1>
              <p className="text-xl sm:text-2xl text-slate-300 font-medium mb-6">
                {language === 'zh' ? member.title : member.titleEn}
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                {(member.email || member.social) && (
                  <div className="flex flex-wrap gap-3">
                    {member.email && (
                      <a href={\`mailto:\${member.email}\`} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/80 hover:bg-slate-700 border border-slate-600/50 text-slate-300 hover:text-white transition-all shadow-sm">
                        <Mail className="w-4 h-4" />
                        <span className="text-sm font-medium">{member.email}</span>
                      </a>
                    )}
                    {member.social?.map((social, index) => (
                      <a key={index} href={social.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/80 hover:bg-slate-700 border border-slate-600/50 text-slate-300 hover:text-white transition-all shadow-sm">
                        {social.icon_pack === 'fab' && social.icon === 'fa-google-scholar' ? (
                          <LucideGraduationCap className="w-4 h-4" />
                        ) : social.icon === 'google-scholar' ? (
                          <LucideGraduationCap className="w-4 h-4" />
                        ) : social.icon === 'github' ? (
                          <LayoutGrid className="w-4 h-4" /> // Placeholder for github
                        ) : (
                          <Link2 className="w-4 h-4" /> // Placeholder for other links
                        )}
                        <span className="text-sm font-medium capitalize">{social.icon.replace(/-/g, ' ')}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
`;

// regex replace the block
const regexPattern = /<div className="flex flex-col md:flex-row gap-8 mb-12 items-start">[\s\S]*?(?=<\/div>\s*<\/div>\s*<div className="prose)/;

content = content.replace(regexPattern, newTopLayout);

fs.writeFileSync('src/components/pages/TeamPage.tsx', content);
console.log('Done redesigning profile header.');
