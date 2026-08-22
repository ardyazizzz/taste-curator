import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Copy,
  Heart,
  Image as ImageIcon,
  LayoutDashboard,
  Link2,
  LockKeyhole,
  MoreHorizontal,
  Pencil,
  Plus,
  RotateCcw,
  Sparkles,
  Undo2,
  X,
} from 'lucide-react'
import { Mascot, type MascotMood } from './components/Mascot'

type Rating = 'not_for_me' | 'kinda_like' | 'love_it'
type Screen = 'welcome' | 'tutorial' | 'quiz' | 'milestone' | 'complete'

type QuizItem = {
  id: string
  title: string
  note: string
  src: string
  fallback: string
}

const quizItems: QuizItem[] = [
  {
    id: 'warm-minimal',
    title: 'Warm, quiet spaces',
    note: 'Soft light and a little room to breathe.',
    src: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=84',
    fallback: 'linear-gradient(135deg,#e5d6c3,#f7f0e8 52%,#bfa786)',
  },
  {
    id: 'color-block',
    title: 'A confident pop',
    note: 'Color that knows exactly when to speak up.',
    src: 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1200&q=84',
    fallback: 'linear-gradient(140deg,#3f365f,#e49370 56%,#f7d1ac)',
  },
  {
    id: 'editorial',
    title: 'Editorial calm',
    note: 'A considered mix of texture, shape, and type.',
    src: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=84',
    fallback: 'linear-gradient(140deg,#e7e0d4,#b5b9aa 53%,#8b7b68)',
  },
  {
    id: 'playful',
    title: 'A little unexpected',
    note: 'Curious details that reward a second look.',
    src: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=84',
    fallback: 'linear-gradient(135deg,#f4c55d,#f7844d 53%,#533e61)',
  },
  {
    id: 'natural',
    title: 'Grounded and natural',
    note: 'Warm materials, friendly forms, no fuss.',
    src: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=84',
    fallback: 'linear-gradient(135deg,#d3b79b,#f4eee5 52%,#899c77)',
  },
  {
    id: 'bold-type',
    title: 'Make it memorable',
    note: 'A clear point of view, with a wink.',
    src: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=84',
    fallback: 'linear-gradient(135deg,#272140,#e2a37d 52%,#ffd454)',
  },
  {
    id: 'soft-luxe',
    title: 'Softly considered',
    note: 'A polished feel that still feels like you.',
    src: 'https://images.unsplash.com/photo-1617104678098-de229db51175?auto=format&fit=crop&w=1200&q=84',
    fallback: 'linear-gradient(135deg,#f4e9dc,#dac2be 53%,#8e879a)',
  },
  {
    id: 'sunny',
    title: 'Bright energy',
    note: 'The kind of visual that lifts the room.',
    src: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=1200&q=84',
    fallback: 'linear-gradient(135deg,#ffe5a7,#f7a74f 53%,#7b9f8b)',
  },
]

const ratingLabels: Record<Rating, string> = {
  not_for_me: 'Not for me',
  kinda_like: 'Kinda like it',
  love_it: 'Love it',
}

function App() {
  const isAdmin = window.location.pathname.startsWith('/admin')
  return isAdmin ? <AdminPreview /> : <ClientQuiz />
}

function ClientQuiz() {
  const [screen, setScreen] = useState<Screen>('welcome')
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, Rating>>(() => {
    try {
      return JSON.parse(localStorage.getItem('taste-tile-demo-answers') || '{}')
    } catch {
      return {}
    }
  })
  const [lastAnswer, setLastAnswer] = useState<Rating | null>(null)
  const [cardState, setCardState] = useState<'idle' | Rating>('idle')
  const [showZoom, setShowZoom] = useState(false)
  const [copied, setCopied] = useState(false)

  const current = quizItems[index]
  const loved = quizItems.filter((item) => answers[item.id] === 'love_it')
  const liked = quizItems.filter((item) => answers[item.id] === 'kinda_like')
  const completedCount = Object.keys(answers).length
  const isComplete = completedCount >= quizItems.length
  const progress = screen === 'complete' ? 100 : Math.min(100, Math.round((index / quizItems.length) * 100))

  useEffect(() => {
    try {
      localStorage.setItem('taste-tile-demo-answers', JSON.stringify(answers))
    } catch {
      // Some browsers restrict storage for file:// previews; the quiz still works in memory.
    }
  }, [answers])

  useEffect(() => {
    if (screen !== 'quiz') return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') choose('not_for_me')
      if (event.key === 'ArrowUp') choose('kinda_like')
      if (event.key === 'ArrowRight') choose('love_it')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  function startQuiz() {
    if (isComplete) {
      setScreen('complete')
      return
    }
    const nextUnanswered = quizItems.findIndex((item) => !answers[item.id])
    setIndex(nextUnanswered === -1 ? 0 : nextUnanswered)
    setScreen('tutorial')
  }

  function choose(rating: Rating) {
    if (screen !== 'quiz' || cardState !== 'idle') return
    setCardState(rating)
    setLastAnswer(rating)
    setAnswers((currentAnswers) => ({ ...currentAnswers, [current.id]: rating }))
    window.setTimeout(() => {
      if (index === 3 && quizItems.length > 5) {
        setCardState('idle')
        setScreen('milestone')
        return
      }
      if (index >= quizItems.length - 1) {
        setCardState('idle')
        setScreen('complete')
      } else {
        setCardState('idle')
        setIndex((value) => value + 1)
      }
    }, 390)
  }

  function undo() {
    if (index === 0) return
    const previous = quizItems[index - 1]
    setAnswers((currentAnswers) => {
      const next = { ...currentAnswers }
      delete next[previous.id]
      return next
    })
    setIndex((value) => value - 1)
    setScreen('quiz')
    setLastAnswer(null)
  }

  function restart() {
    setAnswers({})
    setIndex(0)
    setLastAnswer(null)
    setCardState('idle')
    setScreen('welcome')
  }

  return (
    <main className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <header className="topbar">
        <div className="brand-lockup" aria-label="Taste Curator">
          <div className="brand-mark"><span /><span /><span /></div>
          <span>TASTE CURATOR</span>
        </div>
        <div className="topbar-actions">
          <span className="tiny-status"><span className="status-dot" /> private preview</span>
          <a href="/admin" className="admin-link"><LayoutDashboard size={14} /> admin</a>
        </div>
      </header>

      <section className="experience-grid">
        <aside className="story-panel">
          <div className="story-kicker"><Sparkles size={14} /> a quick note from ardy</div>
          <h1>Let’s make<br /><em>something you’ll love.</em></h1>
          <p className="story-lede">I’ve put together a few quick choices to help me understand what feels right to you.</p>
          <div className="story-metrics">
            <div><strong>02</strong><span>minutes<br />to play</span></div>
            <div><strong>03</strong><span>simple<br />reactions</span></div>
            <div><strong>01</strong><span>clearer<br />direction</span></div>
          </div>
          <div className="cat-stage side-cat"><div className="sparkle s1">✦</div><div className="sparkle s2">✦</div><Mascot mood={screen === 'complete' ? 'party' : 'wave'} size="large" /></div>
          <p className="story-footnote">No wrong answers. Just your point of view <span>♡</span></p>
        </aside>

        <section className={`quiz-window screen-${screen}`}>
          {screen === 'welcome' && <Welcome onStart={startQuiz} completed={isComplete} />}
          {screen === 'tutorial' && <Tutorial onStart={() => { setScreen('quiz'); setIndex(answers[current?.id] ? index : (quizItems.findIndex((item) => !answers[item.id]) || 0)) }} />}
          {screen === 'quiz' && (
            <QuizStage
              item={current}
              index={index}
              progress={progress}
              total={quizItems.length}
              cardState={cardState}
              lastAnswer={lastAnswer}
              onChoose={choose}
              onUndo={undo}
              onZoom={() => setShowZoom(true)}
            />
          )}
          {screen === 'milestone' && <Milestone count={Object.keys(answers).length} onContinue={() => { setScreen('quiz'); setIndex((value) => value + 1) }} />}
          {screen === 'complete' && <Complete loved={loved} liked={liked} onRestart={restart} />}
        </section>
      </section>

      <footer className="app-footer"><span>Made for better conversations.</span><span className="footer-cat">●</span><span>NationGraph · General visual taste</span></footer>
      {showZoom && <ZoomModal item={current} onClose={() => setShowZoom(false)} />}
      {copied && <div className="toast"><Check size={15} /> link copied</div>}
    </main>
  )
}

function Welcome({ onStart, completed }: { onStart: () => void; completed: boolean }) {
  return (
    <div className="welcome-view">
      <div className="quiz-client-label"><span className="client-gem">N</span><span>NATIONGRAPH</span><LockKeyhole size={13} /></div>
      <div className="welcome-copy"><span className="eyebrow">a few choices from ardy</span><h2>Let’s find what<br /><span>feels right.</span></h2><p>Choose what you like. I’ll take it from there.</p></div>
      <Mascot mood="wave" size="hero" />
      <button className="primary-cta" onClick={onStart}>{completed ? 'See your picks' : 'Let’s go!'} <ChevronRight size={20} /></button>
      <div className="time-note"><span className="clock-dot">◷</span> Takes about 2 minutes <span className="divider-dot">·</span> Just tap what feels right</div>
      <div className="welcome-squiggle">✦</div>
    </div>
  )
}

function Tutorial({ onStart }: { onStart: () => void }) {
  const steps = [
    ['▧', 'You’ll see design examples', 'A tiny gallery of directions.'],
    ['☺', 'Choose what feels right', 'Three taps. Zero overthinking.'],
    ['✣', 'I’ll learn what you like', 'So our next idea starts closer.'],
  ]
  return (
    <div className="tutorial-view">
      <button className="back-button" onClick={() => window.location.reload()} aria-label="Back"><ArrowLeft size={18} /></button>
      <div className="tutorial-heading"><span className="eyebrow">it’s easy</span><h2>How it works<span>.</span></h2><div className="mini-progress"><i /><i /><i className="muted" /><i className="muted" /></div></div>
      <div className="steps-list">{steps.map(([icon, title, subtitle], i) => <div className="step-row" key={title}><div className={`step-icon step-${i}`}>{icon}</div><div><strong>{title}</strong><span>{subtitle}</span></div><span className="step-number">0{i + 1}</span></div>)}</div>
      <div className="tutorial-cat"><Mascot mood="peek" size="medium" /><div className="speech-bubble">Easy peasy! <span>✦</span></div></div>
      <button className="secondary-cta dark-cta" onClick={onStart}>Start picking <ArrowRight size={18} /></button>
    </div>
  )
}

function QuizStage({ item, index, progress, total, cardState, lastAnswer, onChoose, onUndo, onZoom }: { item: QuizItem; index: number; progress: number; total: number; cardState: 'idle' | Rating; lastAnswer: Rating | null; onChoose: (rating: Rating) => void; onUndo: () => void; onZoom: () => void }) {
  return (
    <div className="quiz-stage">
      <div className="quiz-head"><button className="icon-button" onClick={() => window.location.reload()} aria-label="Exit"><X size={21} /></button><div className="progress-wrap"><div className="progress-track"><span style={{ width: `${Math.max(5, progress)}%` }} /></div><strong>{String(index + 1).padStart(2, '0')} <small>/ {String(total).padStart(2, '0')}</small></strong></div><button className="icon-button ghost" aria-label="More"><MoreHorizontal size={21} /></button></div>
      <div className="quiz-prompt"><span className="eyebrow">{index < 2 ? 'first impressions' : index < 5 ? 'you’re getting it' : 'last stretch'}</span><h2>How does this<br /><em>feel to you?</em></h2></div>
      <div className={`reference-card card-${cardState}`}>
        <div className="reference-backdrop" style={{ background: item.fallback }} />
        <img src={item.src} alt={item.title} onError={(event) => { event.currentTarget.style.display = 'none' }} />
        <div className="reference-chip"><span>{String(index + 1).padStart(2, '0')}</span><span className="chip-line" /><span>{item.title}</span></div>
        <button className="zoom-button" onClick={onZoom} aria-label="Enlarge reference"><ImageIcon size={16} /></button>
        {cardState !== 'idle' && <div className={`drag-label drag-${cardState}`}>{ratingLabels[cardState]} {cardState === 'love_it' ? '♥' : cardState === 'kinda_like' ? '•' : '×'}</div>}
      </div>
      <p className="reference-note">{item.note}</p>
      <div className="rating-row">
        <button className="rating-button rating-no" onClick={() => onChoose('not_for_me')}><span className="rating-icon"><X size={23} strokeWidth={2.7} /></span><span>Not for me</span><small>←</small></button>
        <button className="rating-button rating-maybe" onClick={() => onChoose('kinda_like')}><span className="rating-icon"><span className="neutral-face">—</span></span><span>Kinda like it</span><small>↑</small></button>
        <button className="rating-button rating-yes" onClick={() => onChoose('love_it')}><span className="rating-icon"><Heart size={23} fill="currentColor" /></span><span>Love it</span><small>→</small></button>
      </div>
      <div className="quiz-bottom"><button className={`undo-button ${index === 0 ? 'disabled' : ''}`} onClick={onUndo}><Undo2 size={14} /> Undo last pick</button><span><span className="keyboard-key">←</span><span className="keyboard-key">↑</span><span className="keyboard-key">→</span> or tap</span></div>
      {lastAnswer && <div className="saved-pill"><Check size={13} /> saved</div>}
    </div>
  )
}

function Milestone({ count, onContinue }: { count: number; onContinue: () => void }) {
  return <div className="milestone-view"><div className="milestone-stars">✦ <span>✦</span> ✦</div><span className="eyebrow">a helpful start</span><h2>You’re on<br /><em>a roll.</em></h2><p>{count} picks in. I’m starting to see what feels right to you.</p><Mascot mood="progress" size="large" /><button className="primary-cta" onClick={onContinue}>Keep going <ArrowRight size={18} /></button></div>
}

function Complete({ loved, liked, onRestart }: { loved: QuizItem[]; liked: QuizItem[]; onRestart: () => void }) {
  const picks = loved.length ? loved : liked
  return <div className="complete-view"><div className="confetti confetti-a">✦</div><div className="confetti confetti-b">◆</div><div className="complete-heading"><span className="eyebrow">quiz complete</span><h2>Your taste is<br /><em>taking shape.</em></h2><p>Here are a few designs that felt most like you.</p></div><div className="mini-collage">{(picks.length ? picks : quizItems.slice(0, 3)).slice(0, 3).map((item) => <div className="mini-tile" key={item.id}><div style={{ background: item.fallback }} /><img src={item.src} alt="" onError={(event) => { event.currentTarget.style.display = 'none' }} /><Heart size={13} fill="currentColor" /></div>)}</div><Mascot mood="party" size="medium" /><h3>All done! <span>🎉</span></h3><p className="complete-sub">I’ll use these preferences to guide our next design steps.</p><button className="secondary-cta light-cta" onClick={onRestart}><RotateCcw size={16} /> Play again</button></div>
}

function ZoomModal({ item, onClose }: { item: QuizItem; onClose: () => void }) {
  return <div className="modal-backdrop" onClick={onClose}><div className="zoom-modal" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={onClose}><X size={18} /></button><div className="modal-image" style={{ background: item.fallback }}><img src={item.src} alt={item.title} onError={(event) => { event.currentTarget.style.display = 'none' }} /></div><div className="modal-copy"><span className="eyebrow">reference {item.id}</span><h3>{item.title}</h3><p>{item.note}</p></div></div></div>
}

function AdminPreview() {
  const [tab, setTab] = useState<'overview' | 'board'>('overview')
  const [copied, setCopied] = useState(false)
  const preferences = useMemo(() => ({ love: 18, maybe: 11, no: 5 }), [])
  function copyLink() { navigator.clipboard?.writeText(`${window.location.origin}/q/nationgraph/general-visual-taste/demo`); setCopied(true); window.setTimeout(() => setCopied(false), 1800) }
  return <main className="admin-shell"><div className="admin-topbar"><div className="brand-lockup"><div className="brand-mark"><span /><span /><span /></div><span>TASTE CURATOR</span></div><div className="admin-top-actions"><a href="/" className="client-preview"><Sparkles size={14} /> open client preview</a><div className="avatar">AR</div></div></div><div className="admin-layout"><aside className="admin-sidebar"><div className="admin-welcome"><span className="eyebrow">workspace</span><h1>Good morning,<br /><em>Ardy.</em></h1><p>Let’s make the next client conversation a little more visual.</p></div><nav><button className={tab === 'overview' ? 'active' : ''} onClick={() => setTab('overview')}><LayoutDashboard size={17} /> Overview</button><button className={tab === 'board' ? 'active' : ''} onClick={() => setTab('board')}><Heart size={17} /> Preference board <span className="nav-count">34</span></button></nav><div className="sidebar-card"><Mascot mood="peek" size="small" /><div><strong>Need a hand?</strong><span>Your links stay private.</span></div></div></aside><section className="admin-content">{tab === 'overview' ? <><div className="admin-page-head"><div><span className="eyebrow">clients / all</span><h2>Your clients <span>·</span> <small>2</small></h2></div><button className="new-client"><Plus size={17} /> New client</button></div><div className="client-grid"><ClientCard name="NationGraph" initials="N" color="blue" quizzes="3 quizzes" responses="47 responses" active onOpen={() => setTab('board')} /><ClientCard name="FurtherAI" initials="F" color="lavender" quizzes="1 quiz" responses="— responses" /></div><div className="recent-head"><div><span className="eyebrow">nationgraph</span><h3>Recent quizzes</h3></div><button className="ghost-link">View all <ArrowRight size={15} /></button></div><div className="quiz-list"><QuizListRow title="General Visual Taste" status="Published" count="24 / 24 answered" onCopy={copyLink} /><QuizListRow title="Infographic Direction" status="Published" count="12 / 24 answered" onCopy={copyLink} /><QuizListRow title="Carousel Exploration" status="Draft" count="Not published" onCopy={copyLink} /></div></> : <PreferenceBoard preferences={preferences} />}</section></div>{copied && <div className="toast"><Check size={15} /> link copied</div>}</main>
}

function ClientCard({ name, initials, color, quizzes, responses, active, onOpen }: { name: string; initials: string; color: string; quizzes: string; responses: string; active?: boolean; onOpen?: () => void }) {
  return <button className="client-card" onClick={onOpen}><div className={`client-logo logo-${color}`}>{initials}<span /></div><div className="client-card-info"><strong>{name}</strong><span>{quizzes} <i>·</i> {responses}</span></div><div className={`client-live ${active ? 'live' : ''}`} /> <ChevronRight size={18} className="card-arrow" /></button>
}

function QuizListRow({ title, status, count, onCopy }: { title: string; status: string; count: string; onCopy: () => void }) {
  return <div className="quiz-list-row"><div className="quiz-icon"><ImageIcon size={17} /></div><div className="quiz-row-main"><strong>{title}</strong><span>{count}</span></div><span className={`quiz-status ${status === 'Published' ? 'published' : 'draft'}`}><span />{status}</span><button className="row-icon" aria-label="Edit"><Pencil size={15} /></button><button className="row-icon" onClick={onCopy} aria-label="Copy link"><Link2 size={15} /></button></div>
}

function PreferenceBoard({ preferences }: { preferences: { love: number; maybe: number; no: number } }) {
  return <><div className="admin-page-head board-head"><div><span className="eyebrow">nationgraph / preference board</span><h2>Visual signals <span>·</span> <small>34 picks</small></h2></div><button className="filter-button">All quizzes <ChevronRight size={15} /></button></div><div className="signal-strip"><div><span className="signal-heart">♥</span><strong>{preferences.love}</strong><small>Love it</small></div><div><span className="signal-maybe">•</span><strong>{preferences.maybe}</strong><small>Kinda like</small></div><div><span className="signal-no">×</span><strong>{preferences.no}</strong><small>Not for me</small></div></div><div className="board-section-head"><h3>Love it <span>♥</span></h3><button>View all <ArrowRight size={15} /></button></div><div className="board-grid">{quizItems.slice(0, 6).map((item) => <div className="board-tile" key={item.id}><div style={{ background: item.fallback }} /><img src={item.src} alt={item.title} onError={(event) => { event.currentTarget.style.display = 'none' }} /><Heart size={14} fill="currentColor" /></div>)}</div><div className="board-note"><Sparkles size={16} /><span>Keep collecting. Patterns appear when the choices do.</span></div></>
}

export default App
