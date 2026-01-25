import Link from 'next/link';

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="hero container animate-fade-in relative">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-64 h-64 bg-primary rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-float" style={{ animationDelay: '0s' }} />
          <div className="absolute top-40 right-1/4 w-64 h-64 bg-accent rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-float" style={{ animationDelay: '2s' }} />
        </div>

        <div className="badge mb-6" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
          <span className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            AI-Powered Face Matching
          </span>
        </div>

        <h1 className="hero-title max-w-4xl mx-auto">
          Guests Get Their <br />
          <span className="text-gradient">Event Photos Instantly</span>
        </h1>

        <p className="hero-subtitle text-lg md:text-xl text-slate-400">
          Scan a QR code. Take a selfie. See every photo you appear in.
          <br className="hidden md:block" />
          No app needed. No waiting. Just your memories, delivered like magic.
        </p>

        <div className="flex gap-4 justify-center flex-wrap mt-8">
          <Link href="/create-event" className="btn btn-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Create Event
          </Link>
          <Link href="/event/DEMO24" className="btn btn-secondary">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            Try Live Demo
          </Link>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mb-24 relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl mb-4">How It Works</h2>
          <p className="max-w-xl mx-auto text-lg">
            Three simple steps to deliver a premium photo experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {/* Step 1 */}
          <div className="glass-card text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl font-bold leading-none select-none transition-transform group-hover:scale-110 duration-500">1</div>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mx-auto mb-6 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-500/30" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3">Create Event</h3>
            <p>Generate a unique QR code for your event in seconds. Display it at the venue entrance.</p>
          </div>

          {/* Step 2 */}
          <div className="glass-card text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl font-bold leading-none select-none transition-transform group-hover:scale-110 duration-500">2</div>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 mx-auto mb-6 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-purple-500/30" style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.2 15c.7-1.2 1-2.5.7-3.9-.6-2-2.4-3.5-4.4-3.5h-1.2c-.7-3-3.2-5.2-6.2-5.6-3-.3-5.9 1.3-7.3 4-1.2 2.5-1 6.5.5 8.8m8.7-1.6V21" />
                <path d="M16 16l-4-4-4 4" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3">Upload Live</h3>
            <p>Photographers upload photos during the event. Our AI instantly processes and indexes every face.</p>
          </div>

          {/* Step 3 */}
          <div className="glass-card text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl font-bold leading-none select-none transition-transform group-hover:scale-110 duration-500">3</div>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 mx-auto mb-6 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-pink-500/30" style={{ background: 'linear-gradient(135deg, #ec4899, #f43f5e)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3">Guests Delight</h3>
            <p>Guests scan, take a selfie, and get a personalized gallery of just their photos. Magic!</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mb-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl mb-4">Why Pros Trust Snapory</h2>
          <p className="max-w-2xl mx-auto text-lg">
            Built for scale, privacy, and speed. The perfect tool for weddings, corporate events, and parties.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {[
            {
              title: "99.9% Accurate AI",
              desc: "State-of-the-art face recognition models ensure no blurry matches.",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 14a4 4 0 1 1 4-4 4 4 0 0 1-4 4z" />
                </svg>
              )
            },
            {
              title: "Privacy First",
              desc: "Photos are only visible to the people in them. GDPR compliant.",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              )
            },
            {
              title: "Unlimited Scale",
              desc: "From 50 to 50,000 guests. Our cloud architecture scales instantly.",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              )
            },
            {
              title: "Zero App Download",
              desc: "Web-based experience. Works on every iPhone and Android browser.",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                  <line x1="12" y1="18" x2="12.01" y2="18" />
                </svg>
              )
            },
            {
              title: "Fast S3 Storage",
              desc: "Direct integration with OVH Object Storage for lightning fast retrievals.",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              )
            },
            {
              title: "Branded Galleries",
              desc: "Customize the look and feel to match your client's brand.",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 19l7-7 3 3-7 7-3-3z" />
                  <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                  <path d="M2 2l7.586 7.586" />
                  <circle cx="11" cy="11" r="2" />
                </svg>
              )
            }
          ].map((feature, i) => (
            <div key={i} className="glass-card hover:bg-slate-800/50 transition-all duration-300">
              <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center mb-4 text-indigo-400">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden py-24 mb-0">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 to-purple-900 opacity-50 -z-10" style={{ background: 'linear-gradient(to right, #312e81, #581c87)' }} />
        <div className="container text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
            Ready to wow your clients?
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Join thousands of photographers delivering photos the modern way.
          </p>
          <div className="flex justify-center gap-6">
            <Link
              href="/create-event"
              className="btn bg-white text-indigo-900 hover:bg-indigo-50 font-bold px-8"
              style={{ background: 'white', color: '#312e81' }}
            >
              Get Started for Free
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer border-t border-slate-800 bg-slate-950">
        <div className="container py-12">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <span className="text-2xl font-bold text-white tracking-tight">Snapory</span>
              <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">Admin</span>
            </div>
            <div className="footer-links flex flex-wrap justify-center gap-8">
              <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link href="#" className="hover:text-white transition-colors">Contact Support</Link>
              <Link href="#" className="hover:text-white transition-colors">API Docs</Link>
            </div>
          </div>
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} Snapory Inc. Designed for the future of photography.
          </p>
        </div>
      </footer>
    </div>
  );
}
