export default function Home() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '4rem',
      }}
    >
      <h1 style={{ fontSize: '4rem', fontWeight: 700 }}>slidenerds</h1>
      <p style={{ fontSize: '1.5rem', marginTop: '1rem', opacity: 0.7 }}>
        Presentations powered by LLMs
      </p>
      <p style={{ fontSize: '1rem', marginTop: '2rem', opacity: 0.5 }}>Coming soon.</p>
    </main>
  )
}
