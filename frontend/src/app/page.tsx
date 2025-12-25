import PhotoUploader from '@/components/PhotoUploader';

export default function Home() {
  return (
    <main className="container">
      <header className="header">
        <h1>📸 Snapory</h1>
        <p>Real-time Event Photo Platform</p>
      </header>
      
      <section className="upload-section">
        <PhotoUploader />
      </section>

      <footer className="footer">
        <p>Built with Next.js, ASP.NET Core, and Python AI</p>
      </footer>
    </main>
  );
}
