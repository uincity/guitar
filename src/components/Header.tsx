import { Guitar } from 'lucide-react'

export function Header() {
  return (
    <header className="site-header">
      <div className="brand-mark" aria-hidden="true"><Guitar size={22} /></div>
      <div>
        <h1>Guitar Chord Player for Cathrine</h1>
        <p>코드를 보고, 누르고, 들어보세요.</p>
      </div>
    </header>
  )
}
