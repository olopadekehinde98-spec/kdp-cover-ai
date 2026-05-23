const COVERS = [
  {
    genre: 'Thriller',
    title: 'The Last Signal',
    author: 'J. Morgan',
    bg: 'from-red-950 via-gray-950 to-black',
    accent: 'border-red-800/60',
    titleColor: 'text-red-300',
    spine: 'bg-red-900',
    mood: '🌑',
    desc: '"Gripping cover — exactly what the genre demands."',
  },
  {
    genre: 'Romance',
    title: 'When We Collide',
    author: 'A. Rivers',
    bg: 'from-pink-950 via-rose-900 to-purple-950',
    accent: 'border-pink-700/60',
    titleColor: 'text-pink-200',
    spine: 'bg-pink-900',
    mood: '🌹',
    desc: '"My readers said it was the prettiest cover I\'ve ever published."',
  },
  {
    genre: 'Fantasy',
    title: 'Realm of Ash',
    author: 'E. Dawnwood',
    bg: 'from-blue-950 via-indigo-900 to-teal-950',
    accent: 'border-blue-700/60',
    titleColor: 'text-blue-200',
    spine: 'bg-blue-900',
    mood: '⚔️',
    desc: '"Generated in 20 seconds. My designer charged $400 for something worse."',
  },
  {
    genre: 'Self-Help',
    title: 'The 5AM Method',
    author: 'D. Cole',
    bg: 'from-amber-950 via-orange-900 to-yellow-950',
    accent: 'border-amber-600/60',
    titleColor: 'text-amber-200',
    spine: 'bg-amber-900',
    mood: '☀️',
    desc: '"Professional, clean, and Amazon-ready in one click."',
  },
  {
    genre: 'Mystery',
    title: 'No One Left',
    author: 'S. Hartley',
    bg: 'from-slate-900 via-gray-900 to-zinc-950',
    accent: 'border-slate-600/60',
    titleColor: 'text-slate-200',
    spine: 'bg-slate-700',
    mood: '🔍',
    desc: '"The spine calculation alone saved me from 3 KDP rejections."',
  },
  {
    genre: 'Horror',
    title: 'Hollow Season',
    author: 'M. Blake',
    bg: 'from-green-950 via-emerald-950 to-black',
    accent: 'border-green-900/60',
    titleColor: 'text-green-300',
    spine: 'bg-green-950',
    mood: '🌿',
    desc: '"Exactly the dark, creepy aesthetic I described in one prompt."',
  },
]

export default function CoverGallery() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Every Genre. Every Style.
        </h2>
        <p className="text-gray-400 max-w-xl mx-auto">
          Describe your book in one sentence — the AI handles the rest.
          Full-wrap covers with spine, back, and bleed — ready for KDP.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {COVERS.map(cover => (
          <div key={cover.title} className={`group relative bg-gradient-to-b ${cover.bg} border ${cover.accent} rounded-2xl overflow-hidden hover:scale-[1.02] transition-transform cursor-pointer`}>

            {/* Book cover mockup */}
            <div className="aspect-[3/4] flex flex-col justify-between p-4 relative">

              {/* Genre tag */}
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-white/50 uppercase tracking-widest">{cover.genre}</span>
                <span className="text-lg">{cover.mood}</span>
              </div>

              {/* Center decoration */}
              <div className="absolute inset-0 flex items-center justify-center opacity-10">
                <div className="w-24 h-24 rounded-full border-2 border-white/30" />
                <div className="absolute w-16 h-16 rounded-full border border-white/20" />
              </div>

              {/* Title block */}
              <div>
                <div className={`text-lg font-black leading-tight mb-1 ${cover.titleColor}`}>{cover.title}</div>
                <div className="text-xs text-white/40 font-medium">{cover.author}</div>

                {/* Spine indicator */}
                <div className={`mt-3 h-1 w-full ${cover.spine} rounded-full opacity-60`} />
                <div className="flex justify-between text-[9px] text-white/20 mt-1">
                  <span>Front</span>
                  <span>Spine</span>
                  <span>Back</span>
                </div>
              </div>
            </div>

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
              <p className="text-white text-sm text-center italic leading-relaxed">{cover.desc}</p>
            </div>

            {/* KDP badge */}
            <div className="absolute top-2 right-2 bg-green-500/20 border border-green-500/40 text-green-400 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
              KDP ✓
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-gray-600 text-sm mt-6">
        Hover any cover to see what authors said · All genres supported
      </p>
    </section>
  )
}
