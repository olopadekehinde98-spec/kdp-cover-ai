const COVERS = [
  {
    genre: 'Thriller',
    title: 'The Last Signal',
    author: 'J. Morgan',
    img: 'https://images.unsplash.com/photo-1519882189396-71bae72b3f48?w=400&h=533&fit=crop&q=80',
    titleColor: 'text-red-300',
    genreColor: 'text-red-400',
    quote: '"Gripping cover — exactly what the genre demands."',
  },
  {
    genre: 'Romance',
    title: 'When We Collide',
    author: 'A. Rivers',
    img: 'https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?w=400&h=533&fit=crop&q=80',
    titleColor: 'text-pink-200',
    genreColor: 'text-pink-400',
    quote: '"My readers said it was the prettiest cover I\'ve ever published."',
  },
  {
    genre: 'Fantasy',
    title: 'Realm of Ash',
    author: 'E. Dawnwood',
    img: 'https://images.unsplash.com/photo-1518562923405-b2c71ab6d70e?w=400&h=533&fit=crop&q=80',
    titleColor: 'text-blue-200',
    genreColor: 'text-blue-400',
    quote: '"Generated in 20 seconds. My designer charged $400 for something worse."',
  },
  {
    genre: 'Self-Help',
    title: 'The 5AM Method',
    author: 'D. Cole',
    img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=533&fit=crop&q=80',
    titleColor: 'text-amber-200',
    genreColor: 'text-amber-400',
    quote: '"Professional, clean, and Amazon-ready in one click."',
  },
  {
    genre: 'Mystery',
    title: 'No One Left',
    author: 'S. Hartley',
    img: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=400&h=533&fit=crop&q=80',
    titleColor: 'text-slate-200',
    genreColor: 'text-slate-400',
    quote: '"The spine calculation alone saved me from 3 KDP rejections."',
  },
  {
    genre: 'Horror',
    title: 'Hollow Season',
    author: 'M. Blake',
    img: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=400&h=533&fit=crop&q=80',
    titleColor: 'text-green-300',
    genreColor: 'text-green-400',
    quote: '"Exactly the dark, creepy aesthetic I described in one prompt."',
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
          <div key={cover.title} className="group relative rounded-2xl overflow-hidden hover:scale-[1.02] transition-transform cursor-pointer shadow-xl">

            {/* Background image */}
            <div className="aspect-[3/4] relative">
              <img
                src={cover.img}
                alt={`${cover.genre} book cover — ${cover.title}`}
                className="w-full h-full object-cover"
              />

              {/* Dark gradient overlay — always visible at bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/30" />

              {/* Genre tag top left */}
              <div className="absolute top-3 left-3">
                <span className={`text-[10px] font-bold uppercase tracking-widest ${cover.genreColor} bg-black/60 px-2 py-0.5 rounded-full`}>
                  {cover.genre}
                </span>
              </div>

              {/* KDP badge top right */}
              <div className="absolute top-3 right-3 bg-green-500/20 border border-green-500/50 text-green-400 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                KDP ✓
              </div>

              {/* Title + author bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className={`text-base font-black leading-tight mb-0.5 ${cover.titleColor} drop-shadow-lg`}>
                  {cover.title}
                </div>
                <div className="text-xs text-white/50">{cover.author}</div>

                {/* Spine strip */}
                <div className="mt-2 flex gap-0.5">
                  <div className="h-0.5 flex-1 bg-white/30 rounded-full" />
                  <div className="h-0.5 w-4 bg-white/60 rounded-full" />
                  <div className="h-0.5 flex-1 bg-white/30 rounded-full" />
                </div>
                <div className="flex justify-between text-[8px] text-white/20 mt-0.5">
                  <span>Front</span><span>Spine</span><span>Back</span>
                </div>
              </div>
            </div>

            {/* Hover overlay with quote */}
            <div className="absolute inset-0 bg-black/85 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-5">
              <p className="text-white text-sm text-center italic leading-relaxed">{cover.quote}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-8">
        <p className="text-gray-600 text-sm mb-6">Hover any cover to see what authors said · All genres supported</p>
        <a href="/sign-up" className="inline-flex bg-violet-600 hover:bg-violet-700 text-white font-semibold px-6 py-3 rounded-xl transition text-sm">
          Generate Your Cover Free →
        </a>
      </div>
    </section>
  )
}
