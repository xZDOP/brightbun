const fs = require('fs');

const listeningQuizData = JSON.parse(fs.readFileSync('scripts/listeningQuizData.json', 'utf8'));

// Format reading questions from previous data
const readingContent = fs.readFileSync('index.html', 'utf8');
const quizDataMatch = readingContent.match(/const quizData = (\[[\s\S]*?\]);\s*\/\*\*/);
if (!quizDataMatch) {
  console.error('Could not find quizData in index.html');
  process.exit(1);
}
const quizDataStr = quizDataMatch[1];

console.log('Found quizData with length:', quizDataStr.length);
console.log('Listening questions count:', listeningQuizData.length);

// Generate full HTML
const html = `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>BRIGHT Dutch Language Exam Prep</title>
  <meta name="description" content="Master all 120 official Dutch business & language exam questions: Reading & Grammar and Listening Comprehension (Luistervaardigheid) with in-depth grammar explanations." />
  <meta property="og:title" content="BRIGHT Dutch Language Exam Prep" />
  <meta property="og:description" content="Master all 120 official Dutch business & language exam questions: Reading & Grammar and Listening Comprehension (Luistervaardigheid) with in-depth grammar explanations." />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
  <style>
    /* Reset & Design Tokens */
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    :root {
      --bg-dark: #090d16;
      --bg-base: #0f172a;
      --bg-surface: #1e293b;
      --bg-surface-hover: #273549;
      --bg-surface-elevated: #243044;
      --border-subtle: #334155;
      --border-focus: #6366f1;
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --text-dim: #64748b;
      --accent-primary: #6366f1;
      --accent-primary-hover: #4f46e5;
      --accent-primary-glow: rgba(99, 102, 241, 0.25);
      --accent-success: #10b981;
      --accent-success-hover: #059669;
      --accent-success-glow: rgba(16, 185, 129, 0.25);
      --accent-danger: #ef4444;
      --accent-danger-glow: rgba(239, 68, 68, 0.25);
      --accent-warning: #f59e0b;
      --accent-cyan: #06b6d4;
      --font-sans: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
    }

    body {
      background-color: var(--bg-base);
      color: var(--text-main);
      font-family: var(--font-sans);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      overflow-x: hidden;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
    }

    /* Ambient background gradient */
    .bg-mesh {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 0;
      background: 
        radial-gradient(circle at 15% 15%, rgba(99, 102, 241, 0.12) 0%, transparent 45%),
        radial-gradient(circle at 85% 80%, rgba(16, 185, 129, 0.08) 0%, transparent 45%),
        radial-gradient(circle at 50% 50%, rgba(15, 23, 42, 0.95) 0%, var(--bg-dark) 100%);
    }

    /* App container */
    #app {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    /* Top Navigation Header */
    header {
      border-bottom: 1px solid var(--border-subtle);
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(12px);
      position: sticky;
      top: 0;
      z-index: 50;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.5rem;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
      user-select: none;
    }

    .brand-logo {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      background: linear-gradient(135deg, #6366f1, #3b82f6);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 1.15rem;
      color: white;
      box-shadow: 0 0 18px var(--accent-primary-glow);
    }

    .brand-title {
      font-weight: 700;
      font-size: 1.05rem;
      letter-spacing: -0.02em;
      color: var(--text-main);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .badge-pill {
      font-size: 0.7rem;
      font-weight: 600;
      padding: 0.15rem 0.55rem;
      border-radius: 9999px;
      background: rgba(99, 102, 241, 0.15);
      color: #818cf8;
      border: 1px solid rgba(99, 102, 241, 0.3);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .header-controls {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    .icon-btn {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      color: var(--text-muted);
      width: 38px;
      height: 38px;
      border-radius: 9px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .icon-btn:hover {
      background: var(--bg-surface-hover);
      color: var(--text-main);
      border-color: #475569;
    }

    .icon-btn.active {
      color: var(--accent-primary);
      border-color: var(--accent-primary);
      background: rgba(99, 102, 241, 0.12);
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-weight: 600;
      font-size: 0.875rem;
      padding: 0.55rem 1.15rem;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      border: 1px solid transparent;
      user-select: none;
      text-decoration: none;
      font-family: inherit;
    }

    .btn-secondary {
      background: var(--bg-surface);
      border-color: var(--border-subtle);
      color: var(--text-main);
    }

    .btn-secondary:hover {
      background: var(--bg-surface-hover);
      border-color: #475569;
    }

    .btn-primary {
      background: var(--accent-primary);
      color: white;
      box-shadow: 0 4px 14px var(--accent-primary-glow);
    }

    .btn-primary:hover {
      background: var(--accent-primary-hover);
      transform: translateY(-1px);
      box-shadow: 0 6px 18px rgba(99, 102, 241, 0.35);
    }

    .btn-success {
      background: var(--accent-success);
      color: white;
      box-shadow: 0 4px 14px var(--accent-success-glow);
    }

    .btn-success:hover {
      background: var(--accent-success-hover);
      transform: translateY(-1px);
      box-shadow: 0 6px 18px rgba(16, 185, 129, 0.35);
    }

    .btn-cyan {
      background: #0891b2;
      color: white;
      box-shadow: 0 4px 14px rgba(6, 182, 212, 0.25);
    }

    .btn-cyan:hover {
      background: #0e7490;
      transform: translateY(-1px);
      box-shadow: 0 6px 18px rgba(6, 182, 212, 0.35);
    }

    /* Main Container */
    main {
      flex: 1;
      width: 100%;
      max-width: 920px;
      margin: 0 auto;
      padding: 2rem 1.25rem 3rem;
      display: flex;
      flex-direction: column;
    }

    /* Views */
    .view-screen {
      display: none;
      animation: fadeIn 0.3s ease-out forwards;
    }

    .view-screen.active {
      display: flex;
      flex-direction: column;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20%, 60% { transform: translateX(-6px); }
      40%, 80% { transform: translateX(6px); }
    }

    @keyframes pulseGlow {
      0%, 100% { box-shadow: 0 0 12px rgba(239, 68, 68, 0.4); transform: scale(1); }
      50% { box-shadow: 0 0 24px rgba(239, 68, 68, 0.8); transform: scale(1.02); }
    }

    @keyframes soundwave {
      0%, 100% { height: 6px; }
      50% { height: 18px; }
    }

    @keyframes scaleSuccess {
      0% { transform: scale(0.98); }
      50% { transform: scale(1.01); }
      100% { transform: scale(1); }
    }

    /* CENTRAL HUB (LANDING) */
    .hero-section {
      text-align: center;
      margin-bottom: 2rem;
    }

    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.35rem 0.9rem;
      border-radius: 9999px;
      background: rgba(99, 102, 241, 0.12);
      border: 1px solid rgba(99, 102, 241, 0.3);
      color: #a5b4fc;
      font-size: 0.8rem;
      font-weight: 600;
      margin-bottom: 1.25rem;
    }

    .hero-title {
      font-size: clamp(2rem, 5vw, 2.75rem);
      font-weight: 800;
      letter-spacing: -0.03em;
      line-height: 1.15;
      margin-bottom: 0.75rem;
      background: linear-gradient(135deg, #ffffff 40%, #cbd5e1 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .hero-subtitle {
      font-size: 1.05rem;
      color: var(--text-muted);
      max-width: 640px;
      margin: 0 auto 1.5rem;
      line-height: 1.6;
    }

    /* SECTION SELECTOR (Central Hub) */
    .hub-section-container {
      margin-bottom: 2rem;
    }

    .hub-section-label {
      text-align: center;
      font-size: 0.82rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--accent-cyan);
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .hub-cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.25rem;
    }

    .hub-card {
      background: var(--bg-surface);
      border: 2px solid var(--border-subtle);
      border-radius: 16px;
      padding: 1.5rem;
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      position: relative;
      display: flex;
      flex-direction: column;
    }

    .hub-card:hover {
      border-color: #6366f1;
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
    }

    .hub-card.active {
      border-color: #6366f1;
      background: linear-gradient(180deg, rgba(99, 102, 241, 0.08) 0%, var(--bg-surface) 100%);
      box-shadow: 0 0 0 1px #6366f1, 0 12px 30px var(--accent-primary-glow);
    }

    .hub-card.listening.active {
      border-color: #06b6d4;
      background: linear-gradient(180deg, rgba(6, 182, 212, 0.08) 0%, var(--bg-surface) 100%);
      box-shadow: 0 0 0 1px #06b6d4, 0 12px 30px rgba(6, 182, 212, 0.2);
    }

    .hub-icon-wrapper {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1rem;
    }

    .hub-icon-wrapper.reading {
      background: rgba(99, 102, 241, 0.15);
      color: #818cf8;
      border: 1px solid rgba(99, 102, 241, 0.3);
    }

    .hub-icon-wrapper.listening {
      background: rgba(6, 182, 212, 0.15);
      color: #22d3ee;
      border: 1px solid rgba(6, 182, 212, 0.3);
    }

    .hub-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--text-main);
      margin-bottom: 0.35rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .hub-desc {
      font-size: 0.85rem;
      color: var(--text-muted);
      line-height: 1.5;
      margin-bottom: 1rem;
      flex-grow: 1;
    }

    .hub-footer-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      padding-top: 0.75rem;
      font-size: 0.75rem;
      color: var(--text-dim);
      font-weight: 600;
    }

    .active-indicator-tag {
      display: none;
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      padding: 0.15rem 0.5rem;
      border-radius: 9999px;
      background: #6366f1;
      color: white;
    }

    .hub-card.active .active-indicator-tag {
      display: inline-block;
    }

    .hub-card.listening.active .active-indicator-tag {
      background: #0891b2;
    }

    /* Active section banner */
    .active-section-banner {
      background: var(--bg-surface-elevated);
      border: 1px solid var(--border-subtle);
      border-radius: 12px;
      padding: 0.75rem 1.25rem;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .active-section-title {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--text-main);
    }

    /* Mode Selection Cards */
    .modes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.25rem;
      margin-bottom: 2rem;
    }

    .mode-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: 16px;
      padding: 1.5rem;
      position: relative;
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      flex-direction: column;
    }

    .mode-card:hover {
      border-color: #6366f1;
      transform: translateY(-3px);
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3), 0 0 20px var(--accent-primary-glow);
    }

    .mode-card.exam-mode-card:hover {
      border-color: #f59e0b;
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3), 0 0 20px rgba(245, 158, 11, 0.2);
    }

    .mode-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1rem;
    }

    .mode-icon.practice {
      background: rgba(99, 102, 241, 0.15);
      color: #818cf8;
      border: 1px solid rgba(99, 102, 241, 0.3);
    }

    .mode-icon.exam {
      background: rgba(245, 158, 11, 0.15);
      color: #fbbf24;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }

    .mode-title {
      font-size: 1.2rem;
      font-weight: 700;
      color: var(--text-main);
      margin-bottom: 0.4rem;
    }

    .mode-desc {
      font-size: 0.85rem;
      color: var(--text-muted);
      line-height: 1.5;
      margin-bottom: 1rem;
      flex-grow: 1;
    }

    .mode-features {
      list-style: none;
      margin-bottom: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
    }

    .mode-features li {
      font-size: 0.8rem;
      color: #cbd5e1;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .mode-features li svg {
      color: var(--accent-success);
      flex-shrink: 0;
    }

    /* Jump Selector drawer/card */
    .jump-drawer {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: 16px;
      padding: 1.5rem;
      margin-top: 1rem;
    }

    .jump-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;
    }

    .jump-title {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--text-main);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .jump-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
      gap: 0.45rem;
      max-height: 200px;
      overflow-y: auto;
      padding-right: 0.25rem;
    }

    .jump-chip {
      background: var(--bg-surface-elevated);
      border: 1px solid var(--border-subtle);
      color: var(--text-muted);
      font-family: var(--font-mono);
      font-size: 0.8rem;
      font-weight: 600;
      height: 38px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .jump-chip:hover {
      border-color: var(--accent-primary);
      color: var(--text-main);
      background: var(--bg-surface-hover);
    }

    .jump-chip.answered-correct {
      border-color: var(--accent-success);
      color: #34d399;
      background: rgba(16, 185, 129, 0.15);
    }

    .jump-chip.answered-wrong {
      border-color: var(--accent-danger);
      color: #f87171;
      background: rgba(239, 68, 68, 0.15);
    }

    .jump-chip.current {
      border-color: var(--accent-primary);
      box-shadow: 0 0 0 2px var(--accent-primary);
      color: white;
    }

    /* QUIZ VIEW */
    .quiz-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: 20px;
      padding: 1.75rem 2rem;
      box-shadow: 0 16px 36px rgba(0, 0, 0, 0.35);
      position: relative;
      margin-bottom: 2rem;
    }

    .quiz-top-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.25rem;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .quiz-meta {
      display: flex;
      align-items: center;
      gap: 0.65rem;
    }

    .category-tag {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 0.25rem 0.65rem;
      border-radius: 6px;
      background: rgba(99, 102, 241, 0.15);
      color: #a5b4fc;
      border: 1px solid rgba(99, 102, 241, 0.3);
    }

    .category-tag.audio-tag {
      background: rgba(6, 182, 212, 0.15);
      color: #67e8f9;
      border-color: rgba(6, 182, 212, 0.3);
    }

    .question-counter {
      font-family: var(--font-mono);
      font-size: 0.85rem;
      color: var(--text-muted);
      font-weight: 600;
    }

    /* Timer Widget */
    .timer-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: var(--bg-surface-elevated);
      border: 1px solid var(--border-subtle);
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
      font-family: var(--font-mono);
      font-size: 0.95rem;
      font-weight: 700;
      color: #fbbf24;
      transition: all 0.25s ease;
    }

    .timer-badge.warning {
      border-color: #f59e0b;
      color: #fbbf24;
      background: rgba(245, 158, 11, 0.15);
    }

    .timer-badge.danger {
      border-color: #ef4444;
      color: #f87171;
      background: rgba(239, 68, 68, 0.2);
      animation: pulseGlow 1s infinite alternate;
    }

    /* Progress bar */
    .progress-bar-container {
      width: 100%;
      height: 6px;
      background: rgba(255, 255, 255, 0.06);
      border-radius: 9999px;
      margin-bottom: 1.5rem;
      overflow: hidden;
      position: relative;
    }

    .progress-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #6366f1, #10b981);
      border-radius: 9999px;
      transition: width 0.3s ease;
    }

    /* Timer countdown bar for exam mode */
    .timer-bar-container {
      width: 100%;
      height: 4px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 9999px;
      margin-top: -1.25rem;
      margin-bottom: 1.5rem;
      overflow: hidden;
    }

    .timer-bar-fill {
      height: 100%;
      background: #10b981;
      width: 100%;
      transition: width 1s linear, background-color 0.5s ease;
    }

    .timer-bar-fill.warning {
      background: #f59e0b;
    }

    .timer-bar-fill.danger {
      background: #ef4444;
    }

    /* AUDIO PLAYER WIDGET (For Listening Comprehension) */
    .audio-player-box {
      background: linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(30, 41, 59, 0.8) 100%);
      border: 1px solid rgba(6, 182, 212, 0.3);
      border-radius: 14px;
      padding: 1.25rem 1.5rem;
      margin-bottom: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .audio-player-controls {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .audio-play-btn {
      background: linear-gradient(135deg, #0891b2, #0284c7);
      color: white;
      border: none;
      padding: 0.65rem 1.35rem;
      border-radius: 10px;
      font-weight: 700;
      font-size: 0.95rem;
      display: inline-flex;
      align-items: center;
      gap: 0.65rem;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(6, 182, 212, 0.3);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .audio-play-btn:hover:not(:disabled) {
      background: linear-gradient(135deg, #0e7490, #0369a1);
      transform: translateY(-1px);
      box-shadow: 0 6px 18px rgba(6, 182, 212, 0.4);
    }

    .audio-play-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      box-shadow: none;
    }

    .audio-play-btn.playing {
      background: #0284c7;
      animation: pulseGlow 1.5s infinite alternate;
    }

    /* Sound wave animation */
    .soundwave-container {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      height: 18px;
    }

    .soundwave-bar {
      width: 3px;
      background: white;
      border-radius: 2px;
      height: 6px;
    }

    .audio-play-btn.playing .soundwave-bar:nth-child(1) { animation: soundwave 0.8s infinite ease-in-out; }
    .audio-play-btn.playing .soundwave-bar:nth-child(2) { animation: soundwave 0.8s infinite ease-in-out 0.2s; }
    .audio-play-btn.playing .soundwave-bar:nth-child(3) { animation: soundwave 0.8s infinite ease-in-out 0.4s; }

    .audio-meta-controls {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    .speed-btn {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #e2e8f0;
      font-family: var(--font-mono);
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.35rem 0.65rem;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .speed-btn:hover {
      background: rgba(255, 255, 255, 0.15);
      border-color: #38bdf8;
      color: white;
    }

    .replay-counter-badge {
      font-size: 0.75rem;
      font-family: var(--font-mono);
      font-weight: 600;
      padding: 0.35rem 0.65rem;
      border-radius: 8px;
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #cbd5e1;
    }

    /* Listening transcript toggle & box */
    .transcript-box {
      margin-top: 0.5rem;
      background: rgba(0, 0, 0, 0.25);
      border: 1px dashed rgba(6, 182, 212, 0.4);
      border-radius: 10px;
      padding: 0.85rem 1rem;
      display: none;
      animation: fadeIn 0.25s ease-out forwards;
    }

    .transcript-box.visible {
      display: block;
    }

    .transcript-dutch {
      font-size: 0.92rem;
      color: #f1f5f9;
      margin-bottom: 0.4rem;
      font-style: italic;
    }

    .transcript-english {
      font-size: 0.82rem;
      color: #94a3b8;
    }

    /* Question content */
    .question-prompt {
      margin-bottom: 1.25rem;
    }

    .dutch-text {
      font-size: 1.25rem;
      font-weight: 700;
      line-height: 1.4;
      color: var(--text-main);
      letter-spacing: -0.01em;
    }

    /* Translation toggle & card */
    .translation-container {
      margin-top: 0.75rem;
    }

    .toggle-translation-btn {
      background: transparent;
      border: 1px dashed var(--border-subtle);
      color: var(--text-muted);
      font-size: 0.8rem;
      font-weight: 600;
      padding: 0.35rem 0.75rem;
      border-radius: 8px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      transition: all 0.15s ease;
    }

    .toggle-translation-btn:hover {
      border-color: #818cf8;
      color: #c7d2fe;
      background: rgba(99, 102, 241, 0.08);
    }

    .translation-card {
      margin-top: 0.65rem;
      background: rgba(99, 102, 241, 0.08);
      border-left: 3px solid var(--accent-primary);
      padding: 0.65rem 1rem;
      border-radius: 0 8px 8px 0;
      font-size: 0.95rem;
      color: #c7d2fe;
      display: none;
      animation: fadeIn 0.2s ease-out forwards;
    }

    .translation-card.visible {
      display: block;
    }

    /* Options List */
    .options-grid {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin: 1.5rem 0;
    }

    .option-card {
      background: var(--bg-surface-elevated);
      border: 1px solid var(--border-subtle);
      border-radius: 12px;
      padding: 0.9rem 1.25rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      cursor: pointer;
      transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
      user-select: none;
      position: relative;
    }

    .option-card:hover:not(.locked) {
      background: var(--bg-surface-hover);
      border-color: #6366f1;
      transform: translateX(3px);
    }

    .option-letter {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border-subtle);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-mono);
      font-weight: 700;
      font-size: 0.85rem;
      color: var(--text-muted);
      flex-shrink: 0;
      transition: all 0.15s ease;
    }

    .option-text {
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-main);
      flex-grow: 1;
    }

    .option-feedback-icon {
      margin-left: auto;
      opacity: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    /* Selected states */
    .option-card.correct {
      background: rgba(16, 185, 129, 0.12) !important;
      border-color: var(--accent-success) !important;
      animation: scaleSuccess 0.25s ease-out;
      box-shadow: 0 0 16px var(--accent-success-glow);
    }

    .option-card.correct .option-letter {
      background: var(--accent-success);
      border-color: var(--accent-success);
      color: white;
    }

    .option-card.correct .option-feedback-icon {
      opacity: 1;
      color: var(--accent-success);
    }

    .option-card.incorrect {
      background: rgba(239, 68, 68, 0.12) !important;
      border-color: var(--accent-danger) !important;
      animation: shake 0.4s ease-in-out;
      box-shadow: 0 0 16px var(--accent-danger-glow);
    }

    .option-card.incorrect .option-letter {
      background: var(--accent-danger);
      border-color: var(--accent-danger);
      color: white;
    }

    .option-card.incorrect .option-feedback-icon {
      opacity: 1;
      color: var(--accent-danger);
    }

    .option-card.locked {
      cursor: default;
    }

    /* Explanation Card */
    .explanation-panel {
      display: none;
      margin-top: 1.25rem;
      background: rgba(15, 23, 42, 0.9);
      border: 1px solid var(--border-subtle);
      border-radius: 14px;
      padding: 1.15rem 1.35rem;
      animation: fadeIn 0.3s ease-out forwards;
    }

    .explanation-panel.visible {
      display: block;
    }

    .explanation-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      font-weight: 700;
      color: #38bdf8;
      margin-bottom: 0.5rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .explanation-text {
      font-size: 0.9rem;
      color: #cbd5e1;
      line-height: 1.55;
    }

    /* Quiz Action Bar */
    .quiz-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.07);
      gap: 1rem;
    }

    .shortcut-hint {
      font-size: 0.75rem;
      color: var(--text-dim);
      font-family: var(--font-mono);
    }

    /* RESULTS SCREEN */
    .results-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: 20px;
      padding: 2.5rem 2rem;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
      text-align: center;
    }

    .score-circle-wrapper {
      position: relative;
      width: 160px;
      height: 160px;
      margin: 0 auto 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .score-circle-svg {
      width: 100%;
      height: 100%;
      transform: rotate(-90deg);
    }

    .circle-bg {
      fill: none;
      stroke: rgba(255, 255, 255, 0.08);
      stroke-width: 8;
    }

    .circle-progress {
      fill: none;
      stroke: var(--accent-primary);
      stroke-width: 8;
      stroke-linecap: round;
      stroke-dasharray: 440;
      stroke-dashoffset: 440;
      transition: stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.5s ease;
    }

    .score-inner-text {
      position: absolute;
      text-align: center;
    }

    .score-percentage {
      font-family: var(--font-mono);
      font-size: 2.25rem;
      font-weight: 800;
      color: white;
    }

    .score-fraction {
      font-size: 0.85rem;
      color: var(--text-muted);
      font-weight: 600;
    }

    .results-title {
      font-size: 1.85rem;
      font-weight: 800;
      color: var(--text-main);
      margin-bottom: 0.5rem;
    }

    .results-subtext {
      font-size: 0.95rem;
      color: var(--text-muted);
      max-width: 500px;
      margin: 0 auto 2rem;
    }

    .results-stats-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .results-stat-box {
      background: var(--bg-surface-elevated);
      border: 1px solid var(--border-subtle);
      border-radius: 12px;
      padding: 1rem;
    }

    .results-actions {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      flex-wrap: wrap;
      margin-bottom: 2.5rem;
    }

    /* Review section */
    .review-section {
      text-align: left;
      border-top: 1px solid var(--border-subtle);
      padding-top: 2rem;
    }

    .review-filter-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.25rem;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .filter-pills {
      display: flex;
      gap: 0.5rem;
    }

    .filter-btn {
      background: var(--bg-surface-elevated);
      border: 1px solid var(--border-subtle);
      color: var(--text-muted);
      font-size: 0.8rem;
      font-weight: 600;
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .filter-btn.active {
      background: var(--accent-primary);
      border-color: var(--accent-primary);
      color: white;
    }

    .review-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      max-height: 500px;
      overflow-y: auto;
      padding-right: 0.5rem;
    }

    .review-item {
      background: var(--bg-surface-elevated);
      border: 1px solid var(--border-subtle);
      border-radius: 12px;
      padding: 1.25rem;
      position: relative;
    }

    .review-item.is-correct {
      border-left: 4px solid var(--accent-success);
    }

    .review-item.is-incorrect {
      border-left: 4px solid var(--accent-danger);
    }

    .review-item-q {
      font-weight: 700;
      font-size: 1rem;
      color: var(--text-main);
      margin-bottom: 0.4rem;
    }

    .review-answers {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      margin: 0.6rem 0;
      font-size: 0.85rem;
    }

    .review-user-ans {
      color: #f87171;
    }

    .review-correct-ans {
      color: #34d399;
      font-weight: 600;
    }

    .review-exp {
      font-size: 0.82rem;
      color: #94a3b8;
      line-height: 1.5;
      background: rgba(0, 0, 0, 0.2);
      padding: 0.6rem 0.85rem;
      border-radius: 8px;
      margin-top: 0.5rem;
    }

    /* Modal dialog */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(4px);
      z-index: 100;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }

    .modal-overlay.active {
      display: flex;
    }

    .modal-box {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: 16px;
      padding: 1.75rem;
      max-width: 440px;
      width: 100%;
      box-shadow: 0 24px 48px rgba(0, 0, 0, 0.6);
      text-align: center;
    }

    .modal-title {
      font-size: 1.25rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      color: white;
    }

    .modal-desc {
      font-size: 0.9rem;
      color: var(--text-muted);
      margin-bottom: 1.5rem;
    }

    .modal-buttons {
      display: flex;
      justify-content: center;
      gap: 0.75rem;
    }

    /* Toast notification */
    #toast {
      position: fixed;
      bottom: 1.5rem;
      right: 1.5rem;
      z-index: 150;
      background: var(--bg-surface-elevated);
      border: 1px solid var(--border-subtle);
      color: white;
      padding: 0.65rem 1.15rem;
      border-radius: 10px;
      font-size: 0.85rem;
      font-weight: 600;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      gap: 0.5rem;
      opacity: 0;
      pointer-events: none;
      transform: translateY(12px);
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    #toast.show {
      opacity: 1;
      transform: translateY(0);
    }

    /* Scrollbars */
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    ::-webkit-scrollbar-track {
      background: transparent;
    }
    ::-webkit-scrollbar-thumb {
      background: #334155;
      border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #475569;
    }

    /* Mobile adjustments */
    @media (max-width: 640px) {
      header {
        padding: 0 1rem;
      }
      .brand-title span {
        display: none;
      }
      main {
        padding: 1.25rem 1rem 2rem;
      }
      .quiz-card {
        padding: 1.25rem;
      }
      .dutch-text {
        font-size: 1.15rem;
      }
      .option-card {
        padding: 0.85rem 1rem;
      }
      .score-circle-wrapper {
        width: 130px;
        height: 130px;
      }
      .score-percentage {
        font-size: 1.8rem;
      }
    }
  </style>
</head>
<body>
  <div class="bg-mesh"></div>

  <div id="app">
    <!-- Header -->
    <header>
      <div class="brand" onclick="appState.confirmQuitToMenu()">
        <div class="brand-logo">NL</div>
        <div class="brand-title">
          BRIGHT <span>Dutch</span>
          <span id="headerSectionBadge" class="badge-pill">Central Hub</span>
        </div>
      </div>

      <div class="header-controls">
        <button id="soundToggleBtn" class="icon-btn active" title="Toggle Sound FX" onclick="appState.toggleSound()">
          <!-- Sound ON SVG -->
          <svg id="soundOnIcon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          </svg>
          <!-- Sound OFF SVG -->
          <svg id="soundOffIcon" style="display:none" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <line x1="23" y1="9" x2="17" y2="15"></line>
            <line x1="17" y1="9" x2="23" y2="15"></line>
          </svg>
        </button>

        <button id="navJumpBtn" class="icon-btn" style="display:none;" title="Question Map" onclick="appState.toggleJumpDrawer()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
        </button>

        <button id="quitBtn" class="btn btn-secondary" style="display:none; padding: 0.4rem 0.85rem;" onclick="appState.confirmQuitToMenu()">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          <span>Menu</span>
        </button>
      </div>
    </header>

    <!-- Main Content Area -->
    <main>

      <!-- 1. CENTRAL HUB (LANDING SCREEN) -->
      <section id="landingScreen" class="view-screen active">
        <div class="hero-section">
          <div class="hero-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
              <path d="M2 17l10 5 10-5"></path>
              <path d="M2 12l10 5 10-5"></path>
            </svg>
            Complete BRIGHT Dutch Assessment Platform &bull; 120 Total Questions
          </div>
          <h1 class="hero-title">Master Professional Dutch</h1>
          <p class="hero-subtitle">
            Prepare for official Dutch business language tests. Select a module below to practice with detailed grammar breakdowns or simulate real 60-second timed exam conditions.
          </p>
        </div>

        <!-- MODULE SELECTOR (Central Hub) -->
        <div class="hub-section-container">
          <div class="hub-section-label">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
            Select Exam Module
          </div>

          <div class="hub-cards-grid">
            <!-- Module 1: Reading & Grammar -->
            <div id="hubCardReading" class="hub-card active" onclick="appState.selectModule('reading')">
              <div class="hub-icon-wrapper reading">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
              </div>
              <div class="hub-title">
                <span>📖 Reading & Grammar</span>
                <span class="active-indicator-tag">Selected</span>
              </div>
              <p class="hub-desc">
                60 official multiple-choice questions focusing on sentence structure, word order & inversion, 't kofschip spelling, prepositions, and workplace collocations.
              </p>
              <div class="hub-footer-meta">
                <span>60 Questions</span>
                <span style="color: #818cf8;">Leesvaardigheid</span>
              </div>
            </div>

            <!-- Module 2: Listening Comprehension -->
            <div id="hubCardListening" class="hub-card listening" onclick="appState.selectModule('listening')">
              <div class="hub-icon-wrapper listening">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
                  <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
                </svg>
              </div>
              <div class="hub-title">
                <span>🎧 Listening Comprehension</span>
                <span class="active-indicator-tag">Selected</span>
              </div>
              <p class="hub-desc">
                60 official audio assessment questions with native Dutch speech synthesis (nl-NL), speed controls (0.85x/1.0x), full transcripts, and translations.
              </p>
              <div class="hub-footer-meta">
                <span>60 Audio Questions</span>
                <span style="color: #22d3ee;">Luistervaardigheid</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Active Section Banner -->
        <div class="active-section-banner">
          <div class="active-section-title">
            <span id="activeModuleIcon" style="font-size: 1.25rem;">📖</span>
            <div>
              <div id="activeModuleTitle" style="font-size: 0.95rem; font-weight: 700;">Reading & Grammar Section</div>
              <div id="activeModuleSub" style="font-size: 0.75rem; color: var(--text-dim); font-weight: 500;">60 Questions available &bull; Target CEFR B1 - C1</div>
            </div>
          </div>
          <span class="badge-pill" id="activeModulePill">Ready to Study</span>
        </div>

        <!-- Mode Selection Cards -->
        <div class="modes-grid">
          <!-- Mode 1: Practice & Learn -->
          <div class="mode-card" onclick="appState.startPracticeMode()">
            <div class="mode-icon practice">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polygon points="10 8 16 12 10 16 10 8"></polygon>
              </svg>
            </div>
            <h2 class="mode-title">Practice & Learn</h2>
            <p class="mode-desc">
              Untimed, self-paced study. Instant feedback after each option, deep grammar/audio explanations, and toggleable translations.
            </p>
            <ul class="mode-features">
              <li>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Untimed pace (no clock pressure)
              </li>
              <li>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Unlimited audio replays & speed toggles
              </li>
              <li>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Toggleable English translations & transcripts
              </li>
              <li>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Navigate freely or jump to any question
              </li>
            </ul>
            <button class="btn btn-primary" style="width: 100%; margin-top: auto;">
              <span>Start Practice Mode</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>
          </div>

          <!-- Mode 2: Exam / Timed Mode -->
          <div class="mode-card exam-mode-card" onclick="appState.startExamMode()">
            <div class="mode-icon exam">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <h2 class="mode-title">Timed Exam Simulation</h2>
            <p class="mode-desc">
              Strict 60-second limit per question with live countdown, urgency alerts, audio replay limits (max 2), and detailed score diagnostics.
            </p>
            <ul class="mode-features">
              <li>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                60 seconds per question countdown
              </li>
              <li>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Max 2 audio replays per question
              </li>
              <li>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Pulsing alert under 10 seconds
              </li>
              <li>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Complete review of missed questions
              </li>
            </ul>
            <button class="btn btn-success" style="width: 100%; margin-top: auto;">
              <span>Begin Timed Exam</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>
          </div>
        </div>

        <!-- Quick Question Selector Preview -->
        <div class="jump-drawer">
          <div class="jump-header">
            <span class="jump-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
              Jump to any specific question in Practice Mode
            </span>
            <span id="jumpTotalText" style="font-size: 0.8rem; color: var(--text-dim);">Questions 1 to 60</span>
          </div>
          <div class="jump-grid" id="landingJumpGrid"></div>
        </div>
      </section>

      <!-- 2. QUIZ SCREEN (Used by both Practice & Exam) -->
      <section id="quizScreen" class="view-screen">
        <!-- Progress bar across all 60 questions -->
        <div class="progress-bar-container">
          <div id="quizProgressBar" class="progress-bar-fill" style="width: 0%;"></div>
        </div>

        <!-- 60-second countdown bar for Exam mode -->
        <div id="timerBarContainer" class="timer-bar-container" style="display: none;">
          <div id="timerBarFill" class="timer-bar-fill"></div>
        </div>

        <div class="quiz-card">
          <!-- Top bar -->
          <div class="quiz-top-bar">
            <div class="quiz-meta">
              <span id="quizModuleBadge" class="category-tag">Reading</span>
              <span id="quizCategoryBadge" class="category-tag">Grammar</span>
              <span id="quizCounterText" class="question-counter">Question 1 of 60</span>
            </div>

            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <!-- Bookmark button -->
              <button id="bookmarkBtn" class="icon-btn" title="Bookmark this question" onclick="appState.toggleCurrentBookmark()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              </button>

              <!-- Timed mode countdown badge -->
              <div id="quizTimerBadge" class="timer-badge" style="display: none;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span id="timerSecondsText">60s</span>
              </div>
            </div>
          </div>

          <!-- AUDIO PLAYER WIDGET (Active only for Listening Comprehension) -->
          <div id="audioPlayerWidget" class="audio-player-box" style="display: none;">
            <div class="audio-player-controls">
              <button id="playAudioBtn" class="audio-play-btn" onclick="appState.playCurrentAudio()">
                <svg id="playAudioIcon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                </svg>
                <div class="soundwave-container" id="soundwaveContainer" style="display:none;">
                  <span class="soundwave-bar"></span>
                  <span class="soundwave-bar"></span>
                  <span class="soundwave-bar"></span>
                </div>
                <span id="playAudioBtnText">Play Audio Fragment (nl-NL)</span>
              </button>

              <div class="audio-meta-controls">
                <button id="audioSpeedBtn" class="speed-btn" title="Toggle audio speed (0.85x / 1.0x)" onclick="appState.toggleAudioSpeed()">1.0x</button>
                <span id="audioReplayBadge" class="replay-counter-badge">Replays: Unlimited</span>
              </div>
            </div>

            <!-- Practice mode Audio Transcript & English Translation Toggle -->
            <div id="transcriptToggleWrapper">
              <button id="toggleTranscriptBtn" class="toggle-translation-btn" onclick="appState.toggleAudioTranscript()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <span id="transcriptBtnLabel">Show Audio Transcript & English Translation (T)</span>
              </button>
              <div id="transcriptBox" class="transcript-box">
                <div id="transcriptDutchText" class="transcript-dutch"></div>
                <div id="transcriptEnglishText" class="transcript-english"></div>
              </div>
            </div>
          </div>

          <!-- Question Prompt -->
          <div class="question-prompt">
            <div id="dutchQuestionText" class="dutch-text">Loading question...</div>

            <!-- English Translation Toggle (For Reading & Grammar in Practice Mode) -->
            <div id="translationWrapper" class="translation-container">
              <button id="toggleTranslationBtn" class="toggle-translation-btn" onclick="appState.toggleTranslation()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M5 8l6 6"></path>
                  <path d="M4 14l6-6 2-3"></path>
                  <path d="M2 5h12"></path>
                  <path d="M7 2h1"></path>
                  <path d="M22 22l-5-10-5 10"></path>
                  <path d="M14 18h6"></path>
                </svg>
                <span id="translationBtnLabel">Show English Translation (T)</span>
              </button>
              <div id="englishTranslationCard" class="translation-card"></div>
            </div>
          </div>

          <!-- Options List -->
          <div id="optionsList" class="options-grid"></div>

          <!-- Animated Explanation Panel -->
          <div id="explanationPanel" class="explanation-panel">
            <div class="explanation-header">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              Grammar & Context Breakdown
            </div>
            <div id="explanationText" class="explanation-text"></div>
          </div>

          <!-- Quiz Footer Actions -->
          <div class="quiz-footer">
            <button id="prevQuestionBtn" class="btn btn-secondary" onclick="appState.prevQuestion()">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
              <span>Previous</span>
            </button>

            <span class="shortcut-hint">Keys: [1-4 / A-D] Select &bull; [P] Audio &bull; [Enter] Next</span>

            <button id="nextQuestionBtn" class="btn btn-primary" onclick="appState.nextQuestion()">
              <span id="nextBtnLabel">Next Question</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </div>
        </div>

        <!-- Popover Question Jump Grid (In Quiz) -->
        <div id="quizJumpDrawer" class="jump-drawer" style="display: none; margin-top: 1.5rem;">
          <div class="jump-header">
            <span class="jump-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              Question Navigator (1 to 60)
            </span>
            <button class="btn btn-secondary" style="padding: 0.25rem 0.65rem; font-size: 0.75rem;" onclick="appState.toggleJumpDrawer()">Close</button>
          </div>
          <div class="jump-grid" id="quizJumpGrid"></div>
        </div>
      </section>

      <!-- 3. RESULTS & REVIEW SCREEN -->
      <section id="resultsScreen" class="view-screen">
        <div class="results-card">
          <!-- Circular Score Visualization -->
          <div class="score-circle-wrapper">
            <svg class="score-circle-svg" viewBox="0 0 160 160">
              <circle class="circle-bg" cx="80" cy="80" r="70" />
              <circle id="scoreProgressCircle" class="circle-progress" cx="80" cy="80" r="70" />
            </svg>
            <div class="score-inner-text">
              <div id="finalScorePercent" class="score-percentage">0%</div>
              <div id="finalScoreFraction" class="score-fraction">0 / 60</div>
            </div>
          </div>

          <h2 id="resultsGradeTitle" class="results-title">Assessment Completed!</h2>
          <p id="resultsFeedbackMsg" class="results-subtext">
            Here is your comprehensive performance breakdown for the BRIGHT Dutch Exam.
          </p>

          <div class="results-stats-row">
            <div class="results-stat-box">
              <span id="resTotalCorrect" class="stat-val" style="color: #34d399;">0</span>
              <span class="stat-label">Correct</span>
            </div>
            <div class="results-stat-box">
              <span id="resTotalWrong" class="stat-val" style="color: #f87171;">0</span>
              <span class="stat-label">Incorrect</span>
            </div>
            <div class="results-stat-box">
              <span id="resTimeSpent" class="stat-val" style="color: #60a5fa;">0m 00s</span>
              <span class="stat-label">Total Time</span>
            </div>
            <div class="results-stat-box">
              <span id="resAvgSpeed" class="stat-val" style="color: #fbbf24;">0s</span>
              <span class="stat-label">Avg / Question</span>
            </div>
          </div>

          <div class="results-actions">
            <button id="retryIncorrectBtn" class="btn btn-secondary" onclick="appState.retryIncorrect()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="1 4 1 10 7 10"></polyline>
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
              </svg>
              <span>Practice Incorrect (<span id="missedCountText">0</span>)</span>
            </button>

            <button class="btn btn-primary" onclick="appState.restartCurrentMode()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M23 4v6h-6"></path>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
              </svg>
              <span>Retake Full Set</span>
            </button>

            <button class="btn btn-secondary" onclick="appState.quitToMenu()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              <span>Main Menu</span>
            </button>
          </div>

          <!-- Comprehensive Review List -->
          <div class="review-section">
            <div class="review-filter-bar">
              <h3 style="font-size: 1.15rem; font-weight: 700;">Question By Question Review</h3>
              <div class="filter-pills">
                <button class="filter-btn active" onclick="appState.filterReview('all', this)">All (60)</button>
                <button class="filter-btn" onclick="appState.filterReview('wrong', this)">Missed (<span id="filterWrongCount">0</span>)</button>
                <button class="filter-btn" onclick="appState.filterReview('bookmarked', this)">Bookmarked (<span id="filterBookmarkCount">0</span>)</button>
              </div>
            </div>

            <div id="reviewItemsList" class="review-list"></div>
          </div>
        </div>
      </section>

    </main>
  </div>

  <!-- Quit Confirmation Modal -->
  <div id="quitModal" class="modal-overlay">
    <div class="modal-box">
      <h3 class="modal-title">Quit current session?</h3>
      <p class="modal-desc">Your current session progress will be lost if you return to the main menu.</p>
      <div class="modal-buttons">
        <button class="btn btn-secondary" onclick="appState.closeQuitModal()">Keep Going</button>
        <button class="btn btn-primary" onclick="appState.quitToMenu()">Quit to Menu</button>
      </div>
    </div>
  </div>

  <!-- Toast Notification -->
  <div id="toast">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
    <span id="toastMessage">Notification</span>
  </div>

  <!-- Sound Synthesizer & Quiz Application Script -->
  <script>
    /**
     * MODULE 1: 60 READING & GRAMMAR QUESTIONS (FROM OFFICIAL PDF DOCUMENT)
     */
    const quizData = ${quizDataStr};

    /**
     * MODULE 2: 60 LISTENING COMPREHENSION QUESTIONS (FROM OFFICIAL VIDEO ASSESSMENT)
     */
    const listeningQuizData = ${JSON.stringify(listeningQuizData, null, 2)};

    /**
     * Web Audio API Synthesizer (No external audio file dependencies)
     */
    class SoundFX {
      constructor() {
        this.ctx = null;
        this.enabled = true;
      }

      init() {
        if (!this.ctx) {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          if (AudioContext) {
            this.ctx = new AudioContext();
          }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume();
        }
      }

      playCorrect() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.12);
        osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.25);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
      }

      playWrong() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(146.83, now + 0.22);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
      }

      playTick() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
      }
    }

    const sound = new SoundFX();

    /**
     * Application State & Controller
     */
    class QuizApplication {
      constructor() {
        this.selectedModule = 'reading'; // 'reading' | 'listening'
        this.currentMode = 'landing'; // 'landing' | 'practice' | 'exam' | 'results'
        this.activeQuestionList = [...quizData];
        this.currentIndex = 0;
        this.answers = {}; // index -> { selectedIndex, isCorrect, timeSpent }
        this.showTranslation = false;
        this.showTranscript = false;
        this.bookmarkedIds = new Set();

        // Speech synthesis audio settings
        this.audioSpeed = 1.0;
        this.isAudioPlaying = false;
        this.currentReplaysUsed = 0;
        
        // Exam timer
        this.timerSeconds = 60;
        this.timerInterval = null;
        this.examStartTime = null;
        this.examEndTime = null;
        this.questionStartTime = null;

        // Load bookmarks from localStorage
        try {
          const saved = localStorage.getItem('bright_dutch_bookmarks');
          if (saved) {
            this.bookmarkedIds = new Set(JSON.parse(saved));
          }
        } catch (e) {
          console.warn('LocalStorage unavailable', e);
        }

        // Initialize voices when available
        if ('speechSynthesis' in window) {
          window.speechSynthesis.onvoiceschanged = () => {
            window.speechSynthesis.getVoices();
          };
        }
      }

      init() {
        this.selectModule('reading', false);
        this.renderLandingJumpGrid();
        this.setupKeyboardListeners();
      }

      // Module Selector (Central Hub)
      selectModule(moduleName, showNotification = true) {
        this.selectedModule = moduleName;
        const hubReading = document.getElementById('hubCardReading');
        const hubListening = document.getElementById('hubCardListening');
        const activeIcon = document.getElementById('activeModuleIcon');
        const activeTitle = document.getElementById('activeModuleTitle');
        const activeSub = document.getElementById('activeModuleSub');
        const activePill = document.getElementById('activeModulePill');
        const headerBadge = document.getElementById('headerSectionBadge');

        if (moduleName === 'reading') {
          hubReading.classList.add('active');
          hubListening.classList.remove('active');
          activeIcon.textContent = '📖';
          activeTitle.textContent = 'Reading & Grammar Section (Leesvaardigheid)';
          activeSub.textContent = '60 Official Questions &bull; Word order, verbs, prepositions & idioms';
          activePill.textContent = 'Reading Active';
          activePill.style.background = 'rgba(99, 102, 241, 0.15)';
          activePill.style.color = '#818cf8';
          activePill.style.borderColor = 'rgba(99, 102, 241, 0.3)';
          headerBadge.textContent = 'Reading & Grammar';
          this.activeQuestionList = [...quizData];
        } else {
          hubListening.classList.add('active');
          hubReading.classList.remove('active');
          activeIcon.textContent = '🎧';
          activeTitle.textContent = 'Listening Comprehension Section (Luistervaardigheid)';
          activeSub.textContent = '60 Spoken Audio Fragments &bull; Native nl-NL speech & transcripts';
          activePill.textContent = 'Listening Active';
          activePill.style.background = 'rgba(6, 182, 212, 0.15)';
          activePill.style.color = '#22d3ee';
          activePill.style.borderColor = 'rgba(6, 182, 212, 0.3)';
          headerBadge.textContent = 'Listening (Luister)';
          this.activeQuestionList = [...listeningQuizData];
        }

        this.renderLandingJumpGrid();
        if (showNotification) {
          this.showToast(\`Switched to \${moduleName === 'reading' ? '📖 Reading & Grammar' : '🎧 Listening Comprehension'}\`);
        }
      }

      // Mode switchers
      startPracticeMode(initialIndex = 0) {
        sound.init();
        this.currentMode = 'practice';
        this.activeQuestionList = this.selectedModule === 'reading' ? [...quizData] : [...listeningQuizData];
        this.currentIndex = initialIndex;
        this.answers = {};
        this.showTranslation = false;
        this.showTranscript = false;
        this.currentReplaysUsed = 0;
        this.stopTimer();
        this.stopSpeech();

        this.showView('quizScreen');
        this.updateHeaderControls();
        this.renderCurrentQuestion();
      }

      startExamMode() {
        sound.init();
        this.currentMode = 'exam';
        this.activeQuestionList = this.selectedModule === 'reading' ? [...quizData] : [...listeningQuizData];
        this.currentIndex = 0;
        this.answers = {};
        this.showTranslation = false;
        this.showTranscript = false;
        this.currentReplaysUsed = 0;
        this.examStartTime = Date.now();
        this.stopSpeech();

        this.showView('quizScreen');
        this.updateHeaderControls();
        this.renderCurrentQuestion();
      }

      retryIncorrect() {
        const sourceData = this.selectedModule === 'reading' ? quizData : listeningQuizData;
        const missedQuestions = sourceData.filter((q, idx) => {
          return this.answers[idx] && !this.answers[idx].isCorrect;
        });

        if (missedQuestions.length === 0) {
          this.showToast('No missed questions to practice!');
          return;
        }

        this.activeQuestionList = missedQuestions;
        this.currentMode = 'practice';
        this.currentIndex = 0;
        this.answers = {};
        this.showTranslation = false;
        this.showTranscript = false;
        this.currentReplaysUsed = 0;
        this.stopTimer();
        this.stopSpeech();

        this.showView('quizScreen');
        this.updateHeaderControls();
        this.renderCurrentQuestion();
        this.showToast(\`Practicing \${missedQuestions.length} missed questions\`);
      }

      restartCurrentMode() {
        if (this.currentMode === 'exam' || this.currentMode === 'results') {
          this.startExamMode();
        } else {
          this.startPracticeMode(0);
        }
      }

      confirmQuitToMenu() {
        if (this.currentMode === 'landing') return;
        document.getElementById('quitModal').classList.add('active');
      }

      closeQuitModal() {
        document.getElementById('quitModal').classList.remove('active');
      }

      quitToMenu() {
        this.closeQuitModal();
        this.stopTimer();
        this.stopSpeech();
        this.currentMode = 'landing';
        this.showView('landingScreen');
        this.updateHeaderControls();
        this.renderLandingJumpGrid();
      }

      showView(screenId) {
        document.querySelectorAll('.view-screen').forEach(el => el.classList.remove('active'));
        const screen = document.getElementById(screenId);
        if (screen) screen.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      updateHeaderControls() {
        const quitBtn = document.getElementById('quitBtn');
        const navJumpBtn = document.getElementById('navJumpBtn');

        if (this.currentMode === 'landing') {
          quitBtn.style.display = 'none';
          navJumpBtn.style.display = 'none';
        } else {
          quitBtn.style.display = 'inline-flex';
          navJumpBtn.style.display = 'inline-flex';
        }
      }

      // Render Question
      renderCurrentQuestion() {
        const q = this.activeQuestionList[this.currentIndex];
        if (!q) return;

        this.questionStartTime = Date.now();
        this.currentReplaysUsed = 0;
        this.stopSpeech();

        // Counter & Progress
        const total = this.activeQuestionList.length;
        document.getElementById('quizCounterText').textContent = \`Question \${this.currentIndex + 1} of \${total}\`;
        
        const moduleBadge = document.getElementById('quizModuleBadge');
        const categoryBadge = document.getElementById('quizCategoryBadge');
        
        if (this.selectedModule === 'listening') {
          moduleBadge.textContent = '🎧 Listening';
          moduleBadge.className = 'category-tag audio-tag';
          categoryBadge.textContent = q.category || 'Comprehension';
          categoryBadge.className = 'category-tag audio-tag';
        } else {
          moduleBadge.textContent = '📖 Reading';
          moduleBadge.className = 'category-tag';
          categoryBadge.textContent = q.category || 'Grammar';
          categoryBadge.className = 'category-tag';
        }

        const progressPct = ((this.currentIndex) / total) * 100;
        document.getElementById('quizProgressBar').style.width = \`\${progressPct}%\`;

        // Dutch Question Text
        const dutchPrompt = q.dutchQuestion || 'Wat heeft u begrepen?';
        document.getElementById('dutchQuestionText').textContent = \`\${q.id}. \${dutchPrompt}\`;

        // Bookmark icon state
        this.updateBookmarkButtonState(q.id);

        // Audio Player Widget configuration
        const audioWidget = document.getElementById('audioPlayerWidget');
        const translationWrapper = document.getElementById('translationWrapper');
        const translationCard = document.getElementById('englishTranslationCard');
        const translationBtnLabel = document.getElementById('translationBtnLabel');

        if (this.selectedModule === 'listening') {
          audioWidget.style.display = 'flex';
          translationWrapper.style.display = 'none'; // Transcript toggle is in audio player

          // Configure transcripts
          document.getElementById('transcriptDutchText').textContent = q.audioTranscript || '';
          document.getElementById('transcriptEnglishText').textContent = q.englishAudioTranslation || '';

          const transcriptBox = document.getElementById('transcriptBox');
          const transcriptBtnLabel = document.getElementById('transcriptBtnLabel');
          const transcriptToggleWrapper = document.getElementById('transcriptToggleWrapper');

          if (this.currentMode === 'practice') {
            transcriptToggleWrapper.style.display = 'block';
            if (this.showTranscript) {
              transcriptBox.classList.add('visible');
              transcriptBtnLabel.textContent = 'Hide Transcript & Translation (T)';
            } else {
              transcriptBox.classList.remove('visible');
              transcriptBtnLabel.textContent = 'Show Transcript & Translation (T)';
            }
          } else {
            // In exam mode, hide transcript toggle
            transcriptToggleWrapper.style.display = 'none';
            transcriptBox.classList.remove('visible');
          }

          this.updateAudioPlayerUI();

          // In timed exam mode, auto-play audio fragment once on question load!
          if (this.currentMode === 'exam' && this.answers[this.currentIndex] === undefined) {
            setTimeout(() => this.playCurrentAudio(), 250);
          }
        } else {
          // Reading mode
          audioWidget.style.display = 'none';
          translationWrapper.style.display = 'block';

          translationCard.textContent = q.englishTranslation;
          if (this.currentMode === 'practice') {
            translationWrapper.style.display = 'block';
            if (this.showTranslation) {
              translationCard.classList.add('visible');
              translationBtnLabel.textContent = 'Hide English Translation (T)';
            } else {
              translationCard.classList.remove('visible');
              translationBtnLabel.textContent = 'Show English Translation (T)';
            }
          } else {
            translationWrapper.style.display = 'none';
            translationCard.classList.remove('visible');
          }
        }

        // Explanation text
        const explanationPanel = document.getElementById('explanationPanel');
        const explanationText = document.getElementById('explanationText');
        explanationText.textContent = q.explanation;

        // Render Options
        const optionsList = document.getElementById('optionsList');
        optionsList.innerHTML = '';

        const letters = ['A', 'B', 'C', 'D'];
        const existingAnswer = this.answers[this.currentIndex];

        q.options.forEach((optText, optIdx) => {
          const card = document.createElement('div');
          card.className = 'option-card';
          card.setAttribute('data-index', optIdx);

          let letterHtml = \`<div class="option-letter">\${letters[optIdx]}</div>\`;
          let textHtml = \`<div class="option-text">\${optText}</div>\`;
          let iconHtml = \`
            <div class="option-feedback-icon">
              <svg class="icon-chk" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <svg class="icon-err" style="display:none;" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </div>
          \`;

          card.innerHTML = letterHtml + textHtml + iconHtml;

          if (existingAnswer !== undefined) {
            card.classList.add('locked');
            if (optIdx === q.correctIndex) {
              card.classList.add('correct');
              card.querySelector('.icon-chk').style.display = 'block';
              card.querySelector('.icon-err').style.display = 'none';
            } else if (optIdx === existingAnswer.selectedIndex) {
              card.classList.add('incorrect');
              card.querySelector('.icon-chk').style.display = 'none';
              card.querySelector('.icon-err').style.display = 'block';
            }
          } else {
            card.addEventListener('click', () => this.handleOptionSelect(optIdx));
          }

          optionsList.appendChild(card);
        });

        // Show/hide explanation
        if (existingAnswer !== undefined) {
          explanationPanel.classList.add('visible');
        } else {
          explanationPanel.classList.remove('visible');
        }

        // Navigation button labels & state
        const prevBtn = document.getElementById('prevQuestionBtn');
        const nextBtn = document.getElementById('nextQuestionBtn');
        const nextBtnLabel = document.getElementById('nextBtnLabel');
        const isAnswered = existingAnswer !== undefined;

        if (this.currentMode === 'practice') {
          prevBtn.style.display = this.currentIndex > 0 ? 'inline-flex' : 'none';
        } else {
          prevBtn.style.display = 'none';
        }

        if (isAnswered) {
          nextBtn.className = 'btn btn-primary';
          nextBtnLabel.textContent = this.currentIndex === total - 1 ? 'Finish Assessment' : 'Next Question';
        } else {
          if (this.currentMode === 'exam') {
            nextBtn.className = 'btn btn-secondary';
            nextBtnLabel.textContent = this.currentIndex === total - 1 ? 'Skip & Finish' : 'Skip Question';
          } else {
            nextBtn.className = 'btn btn-secondary';
            nextBtnLabel.textContent = this.currentIndex === total - 1 ? 'Finish Assessment' : 'Next Question';
          }
        }

        // Handle Timed Mode Countdown
        if (this.currentMode === 'exam') {
          document.getElementById('timerBarContainer').style.display = 'block';
          document.getElementById('quizTimerBadge').style.display = 'inline-flex';
          
          if (existingAnswer === undefined) {
            this.startTimer();
          } else {
            this.stopTimer();
          }
        } else {
          document.getElementById('timerBarContainer').style.display = 'none';
          document.getElementById('quizTimerBadge').style.display = 'none';
          this.stopTimer();
        }

        this.renderQuizJumpGrid();
      }

      // Audio Speech Synthesis Methods
      playCurrentAudio() {
        if (!('speechSynthesis' in window)) {
          this.showToast('Speech synthesis not supported in this browser.');
          return;
        }

        // Limit replays in Exam mode (max 2 replays)
        if (this.currentMode === 'exam') {
          if (this.currentReplaysUsed >= 2) {
            this.showToast('Max audio replays reached (2 of 2 used).');
            return;
          }
          this.currentReplaysUsed++;
          this.updateAudioPlayerUI();
        }

        this.stopSpeech();
        const q = this.activeQuestionList[this.currentIndex];
        if (!q || !q.audioTranscript) return;

        const utterance = new SpeechSynthesisUtterance(q.audioTranscript);
        utterance.lang = 'nl-NL';
        utterance.rate = this.audioSpeed || 1.0;

        const voices = window.speechSynthesis.getVoices();
        const dutchVoice = voices.find(v => v.lang && v.lang.toLowerCase().startsWith('nl'));
        if (dutchVoice) {
          utterance.voice = dutchVoice;
        }

        this.isAudioPlaying = true;
        this.updateAudioPlayButtonState();

        utterance.onend = () => {
          this.isAudioPlaying = false;
          this.updateAudioPlayButtonState();
        };

        utterance.onerror = () => {
          this.isAudioPlaying = false;
          this.updateAudioPlayButtonState();
        };

        window.speechSynthesis.speak(utterance);
      }

      stopSpeech() {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
        this.isAudioPlaying = false;
        this.updateAudioPlayButtonState();
      }

      toggleAudioSpeed() {
        this.audioSpeed = this.audioSpeed === 1.0 ? 0.85 : 1.0;
        const btn = document.getElementById('audioSpeedBtn');
        if (btn) btn.textContent = \`\${this.audioSpeed}x\`;
        this.showToast(\`Audio speed set to \${this.audioSpeed}x\`);
        if (this.isAudioPlaying) {
          this.playCurrentAudio();
        }
      }

      updateAudioPlayerUI() {
        const replayBadge = document.getElementById('audioReplayBadge');
        const playBtn = document.getElementById('playAudioBtn');

        if (this.currentMode === 'exam') {
          const remaining = Math.max(0, 2 - this.currentReplaysUsed);
          replayBadge.textContent = \`Replays Left: \${remaining} / 2\`;
          replayBadge.style.color = remaining === 0 ? '#f87171' : '#fbbf24';
          playBtn.disabled = remaining === 0;
        } else {
          replayBadge.textContent = 'Replays: Unlimited';
          replayBadge.style.color = '#cbd5e1';
          playBtn.disabled = false;
        }
      }

      updateAudioPlayButtonState() {
        const btn = document.getElementById('playAudioBtn');
        const text = document.getElementById('playAudioBtnText');
        const icon = document.getElementById('playAudioIcon');
        const wave = document.getElementById('soundwaveContainer');

        if (!btn) return;

        if (this.isAudioPlaying) {
          btn.classList.add('playing');
          text.textContent = 'Playing Audio Fragment...';
          icon.style.display = 'none';
          wave.style.display = 'inline-flex';
        } else {
          btn.classList.remove('playing');
          text.textContent = 'Play Audio Fragment (nl-NL)';
          icon.style.display = 'block';
          wave.style.display = 'none';
        }
      }

      toggleAudioTranscript() {
        this.showTranscript = !this.showTranscript;
        const box = document.getElementById('transcriptBox');
        const label = document.getElementById('transcriptBtnLabel');

        if (this.showTranscript) {
          box.classList.add('visible');
          label.textContent = 'Hide Transcript & Translation (T)';
        } else {
          box.classList.remove('visible');
          label.textContent = 'Show Transcript & Translation (T)';
        }
      }

      // Handle Option Selection
      handleOptionSelect(selectedIndex) {
        if (this.answers[this.currentIndex] !== undefined) return;

        const q = this.activeQuestionList[this.currentIndex];
        const isCorrect = (selectedIndex === q.correctIndex);
        const timeSpent = Math.max(1, Math.round((Date.now() - this.questionStartTime) / 1000));

        this.answers[this.currentIndex] = {
          selectedIndex,
          isCorrect,
          timeSpent,
          isTimedOut: false
        };

        this.stopTimer();

        // Audio & Visual feedback
        if (isCorrect) {
          sound.playCorrect();
        } else {
          sound.playWrong();
        }

        const cards = document.querySelectorAll('#optionsList .option-card');
        cards.forEach((card, idx) => {
          card.classList.add('locked');
          if (idx === q.correctIndex) {
            card.classList.add('correct');
            card.querySelector('.icon-chk').style.display = 'block';
            card.querySelector('.icon-err').style.display = 'none';
          } else if (idx === selectedIndex) {
            card.classList.add('incorrect');
            card.querySelector('.icon-chk').style.display = 'none';
            card.querySelector('.icon-err').style.display = 'block';
          }
        });

        // Update Next button to active primary state
        const nextBtn = document.getElementById('nextQuestionBtn');
        const nextBtnLabel = document.getElementById('nextBtnLabel');
        nextBtn.className = 'btn btn-primary';
        nextBtnLabel.textContent = this.currentIndex === this.activeQuestionList.length - 1 ? 'Finish Assessment' : 'Next Question';

        // Reveal explanation and smoothly scroll into view
        const expPanel = document.getElementById('explanationPanel');
        expPanel.classList.add('visible');
        setTimeout(() => {
          expPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 80);

        this.renderQuizJumpGrid();
      }

      // Handle Question Timeout (Exam Mode)
      handleTimeout() {
        if (this.answers[this.currentIndex] !== undefined) return;
        const q = this.activeQuestionList[this.currentIndex];

        sound.playWrong();
        this.answers[this.currentIndex] = {
          selectedIndex: -1,
          isCorrect: false,
          timeSpent: 60,
          isTimedOut: true
        };

        this.stopTimer();
        this.showToast("Time's up! Showing correct answer.");

        // Lock & reveal correct option
        const cards = document.querySelectorAll('#optionsList .option-card');
        cards.forEach((card, idx) => {
          card.classList.add('locked');
          if (idx === q.correctIndex) {
            card.classList.add('correct');
            card.querySelector('.icon-chk').style.display = 'block';
            card.querySelector('.icon-err').style.display = 'none';
          }
        });

        document.getElementById('explanationPanel').classList.add('visible');
        this.renderQuizJumpGrid();
      }

      // Timer Management
      startTimer() {
        this.stopTimer();
        this.timerSeconds = 60;
        this.updateTimerDisplay();

        this.timerInterval = setInterval(() => {
          this.timerSeconds--;
          this.updateTimerDisplay();

          if (this.timerSeconds <= 5 && this.timerSeconds > 0) {
            sound.playTick();
          }

          if (this.timerSeconds <= 0) {
            this.handleTimeout();
          }
        }, 1000);
      }

      stopTimer() {
        if (this.timerInterval) {
          clearInterval(this.timerInterval);
          this.timerInterval = null;
        }
      }

      updateTimerDisplay() {
        const badge = document.getElementById('quizTimerBadge');
        const text = document.getElementById('timerSecondsText');
        const barFill = document.getElementById('timerBarFill');

        text.textContent = \`\${this.timerSeconds}s\`;

        const pct = Math.max(0, (this.timerSeconds / 60) * 100);
        barFill.style.width = \`\${pct}%\`;

        badge.classList.remove('warning', 'danger');
        barFill.classList.remove('warning', 'danger');

        if (this.timerSeconds <= 10) {
          badge.classList.add('danger');
          barFill.classList.add('danger');
        } else if (this.timerSeconds <= 20) {
          badge.classList.add('warning');
          barFill.classList.add('warning');
        }
      }

      // Navigation
      nextQuestion() {
        if (this.answers[this.currentIndex] === undefined && this.currentMode === 'exam') {
          this.answers[this.currentIndex] = {
            selectedIndex: -1,
            isCorrect: false,
            timeSpent: 60 - this.timerSeconds,
            isTimedOut: false
          };
        }

        if (this.currentIndex < this.activeQuestionList.length - 1) {
          this.currentIndex++;
          this.renderCurrentQuestion();
        } else {
          this.finishQuiz();
        }
      }

      prevQuestion() {
        if (this.currentIndex > 0) {
          this.currentIndex--;
          this.renderCurrentQuestion();
        }
      }

      jumpToQuestion(idx) {
        if (idx >= 0 && idx < this.activeQuestionList.length) {
          this.currentIndex = idx;
          this.renderCurrentQuestion();
          this.closeJumpDrawer();
        }
      }

      // Bookmarking
      toggleCurrentBookmark() {
        const q = this.activeQuestionList[this.currentIndex];
        if (!q) return;

        const compositeId = \`\${this.selectedModule}_\${q.id}\`;
        if (this.bookmarkedIds.has(compositeId)) {
          this.bookmarkedIds.delete(compositeId);
          this.showToast(\`Removed Q\${q.id} from bookmarks\`);
        } else {
          this.bookmarkedIds.add(compositeId);
          this.showToast(\`Bookmarked Q\${q.id} for review\`);
        }

        this.updateBookmarkButtonState(q.id);
        this.saveBookmarks();
      }

      updateBookmarkButtonState(qId) {
        const btn = document.getElementById('bookmarkBtn');
        const compositeId = \`\${this.selectedModule}_\${qId}\`;
        if (this.bookmarkedIds.has(compositeId)) {
          btn.classList.add('active');
          btn.querySelector('svg').style.fill = '#6366f1';
        } else {
          btn.classList.remove('active');
          btn.querySelector('svg').style.fill = 'none';
        }
      }

      saveBookmarks() {
        try {
          localStorage.setItem('bright_dutch_bookmarks', JSON.stringify([...this.bookmarkedIds]));
        } catch (e) {}
      }

      toggleTranslation() {
        this.showTranslation = !this.showTranslation;
        const card = document.getElementById('englishTranslationCard');
        const btnLabel = document.getElementById('translationBtnLabel');

        if (this.showTranslation) {
          card.classList.add('visible');
          btnLabel.textContent = 'Hide English Translation (T)';
        } else {
          card.classList.remove('visible');
          btnLabel.textContent = 'Show English Translation (T)';
        }
      }

      toggleSound() {
        sound.enabled = !sound.enabled;
        const btn = document.getElementById('soundToggleBtn');
        const onIcon = document.getElementById('soundOnIcon');
        const offIcon = document.getElementById('soundOffIcon');

        if (sound.enabled) {
          btn.classList.add('active');
          onIcon.style.display = 'block';
          offIcon.style.display = 'none';
          this.showToast('Sound Effects: Enabled');
          sound.playCorrect();
        } else {
          btn.classList.remove('active');
          onIcon.style.display = 'none';
          offIcon.style.display = 'block';
          this.showToast('Sound Effects: Muted');
        }
      }

      toggleJumpDrawer() {
        const drawer = document.getElementById('quizJumpDrawer');
        if (drawer.style.display === 'none') {
          drawer.style.display = 'block';
          this.renderQuizJumpGrid();
        } else {
          drawer.style.display = 'none';
        }
      }

      closeJumpDrawer() {
        document.getElementById('quizJumpDrawer').style.display = 'none';
      }

      // Finish Quiz & Render Results
      finishQuiz() {
        this.stopTimer();
        this.stopSpeech();
        this.examEndTime = Date.now();
        this.currentMode = 'results';

        const total = this.activeQuestionList.length;
        let correctCount = 0;
        let totalSecondsSpent = 0;

        for (let i = 0; i < total; i++) {
          const ans = this.answers[i];
          if (ans && ans.isCorrect) {
            correctCount++;
          }
          if (ans && ans.timeSpent) {
            totalSecondsSpent += ans.timeSpent;
          }
        }

        const scorePercent = Math.round((correctCount / total) * 100);

        // Update Stat Cards
        document.getElementById('resTotalCorrect').textContent = correctCount;
        document.getElementById('resTotalWrong').textContent = total - correctCount;
        document.getElementById('missedCountText').textContent = total - correctCount;

        const minutes = Math.floor(totalSecondsSpent / 60);
        const seconds = totalSecondsSpent % 60;
        document.getElementById('resTimeSpent').textContent = \`\${minutes}m \${seconds.toString().padStart(2, '0')}s\`;

        const avgSecs = (totalSecondsSpent / (total || 1)).toFixed(1);
        document.getElementById('resAvgSpeed').textContent = \`\${avgSecs}s\`;

        // Donut circle progress
        const circle = document.getElementById('scoreProgressCircle');
        const circumference = 2 * Math.PI * 70;
        const offset = circumference - (scorePercent / 100) * circumference;
        circle.style.strokeDashoffset = offset;

        if (scorePercent >= 80) {
          circle.style.stroke = '#10b981';
        } else if (scorePercent >= 60) {
          circle.style.stroke = '#6366f1';
        } else {
          circle.style.stroke = '#ef4444';
        }

        document.getElementById('finalScorePercent').textContent = \`\${scorePercent}%\`;
        document.getElementById('finalScoreFraction').textContent = \`\${correctCount} / \${total}\`;

        // English Feedback title & description
        const gradeTitle = document.getElementById('resultsGradeTitle');
        const feedbackMsg = document.getElementById('resultsFeedbackMsg');
        const modName = this.selectedModule === 'reading' ? 'Reading & Grammar' : 'Listening Comprehension';

        if (scorePercent >= 90) {
          gradeTitle.textContent = 'Outstanding Performance! (CEFR C1/C2)';
          feedbackMsg.textContent = \`Exceptional mastery of Dutch \${modName}! You have demonstrated fluency and high accuracy.\`;
        } else if (scorePercent >= 75) {
          gradeTitle.textContent = 'Passed with Merit! (CEFR B2)';
          feedbackMsg.textContent = \`Great work! You have a solid grasp of professional Dutch business \${modName}.\`;
        } else if (scorePercent >= 55) {
          gradeTitle.textContent = 'Exam Passed (CEFR B1)';
          feedbackMsg.textContent = \`Passing score! Review your missed questions below to sharpen challenging areas in Dutch \${modName}.\`;
        } else {
          gradeTitle.textContent = 'Needs More Practice';
          feedbackMsg.textContent = \`Keep studying! Review the detailed explanations and transcripts below and retake the \${modName} exam.\`;
        }

        this.renderReviewList('all');
        this.showView('resultsScreen');
        this.updateHeaderControls();
      }

      // Review Section Filtering & Rendering
      renderReviewList(filter = 'all') {
        const container = document.getElementById('reviewItemsList');
        container.innerHTML = '';

        let wrongCount = 0;
        let bookmarkedCount = 0;

        const filteredQuestions = this.activeQuestionList.filter((q, idx) => {
          const ans = this.answers[idx];
          const isWrong = !ans || !ans.isCorrect;
          const compositeId = \`\${this.selectedModule}_\${q.id}\`;
          const isBookmarked = this.bookmarkedIds.has(compositeId);

          if (isWrong) wrongCount++;
          if (isBookmarked) bookmarkedCount++;

          if (filter === 'wrong') return isWrong;
          if (filter === 'bookmarked') return isBookmarked;
          return true;
        });

        document.getElementById('filterWrongCount').textContent = wrongCount;
        document.getElementById('filterBookmarkCount').textContent = bookmarkedCount;

        if (filteredQuestions.length === 0) {
          container.innerHTML = \`<div style="text-align: center; color: var(--text-dim); padding: 2rem;">No questions match this filter.</div>\`;
          return;
        }

        filteredQuestions.forEach((q) => {
          const originalIdx = this.activeQuestionList.findIndex(item => item.id === q.id);
          const ans = this.answers[originalIdx];
          const isCorrect = ans && ans.isCorrect;

          const item = document.createElement('div');
          item.className = \`review-item \${isCorrect ? 'is-correct' : 'is-incorrect'}\`;

          const userChoiceText = (ans && ans.selectedIndex >= 0 && q.options[ans.selectedIndex]) 
            ? q.options[ans.selectedIndex] 
            : (ans && ans.isTimedOut ? 'Timed out (No answer)' : 'Skipped / Unanswered');
          const correctChoiceText = q.options[q.correctIndex];

          const crossSvg = \`<svg style="display:inline-block;vertical-align:-2px;margin-left:4px;color:#ef4444;" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>\`;
          const checkSvg = \`<svg style="display:inline-block;vertical-align:-2px;margin-left:4px;color:#10b981;" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>\`;

          // If listening question, show audio playback button and transcript in review
          let audioReviewHtml = '';
          if (this.selectedModule === 'listening' && q.audioTranscript) {
            audioReviewHtml = \`
              <div style="margin: 0.6rem 0; padding: 0.6rem 0.85rem; background: rgba(6, 182, 212, 0.08); border-left: 3px solid #06b6d4; border-radius: 0 8px 8px 0;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.35rem;">
                  <span style="font-size: 0.75rem; font-weight: 700; color: #67e8f9; text-transform: uppercase;">🎧 Audio Transcript</span>
                  <button class="btn btn-secondary" style="padding: 0.2rem 0.55rem; font-size: 0.72rem; gap: 0.3rem;" onclick="appState.playReviewAudio('\${q.audioTranscript.replace(/'/g, "\\\\'")}')">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                    <span>Play Audio</span>
                  </button>
                </div>
                <div style="font-size: 0.85rem; color: #f1f5f9; font-style: italic; margin-bottom: 0.25rem;">"\${q.audioTranscript}"</div>
                <div style="font-size: 0.8rem; color: #94a3b8;">\${q.englishAudioTranslation || ''}</div>
              </div>
            \`;
          }

          item.innerHTML = \`
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.4rem;">
              <span class="category-tag \${this.selectedModule === 'listening' ? 'audio-tag' : ''}">\${q.category || (this.selectedModule === 'listening' ? 'Listening' : 'Grammar')}</span>
              <span style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-dim);">Q#\${q.id}</span>
            </div>
            <div class="review-item-q">\${q.dutchQuestion || 'Wat heeft u begrepen?'}</div>
            \${q.englishQuestionTranslation ? \`<div style="font-size: 0.82rem; color: #a5b4fc; margin-bottom: 0.4rem;"><em>\${q.englishQuestionTranslation}</em></div>\` : (q.englishTranslation ? \`<div style="font-size: 0.82rem; color: #a5b4fc; margin-bottom: 0.4rem;"><em>\${q.englishTranslation}</em></div>\` : '')}
            \${audioReviewHtml}
            <div class="review-answers">
              \${!isCorrect ? \`<div class="review-user-ans">Your answer: <strong>\${userChoiceText}</strong> \${crossSvg}</div>\` : ''}
              <div class="review-correct-ans">Correct answer: <strong>\${correctChoiceText}</strong> \${checkSvg}</div>
            </div>
            <div class="review-exp"><strong>Explanation:</strong> \${q.explanation}</div>
          \`;

          container.appendChild(item);
        });
      }

      playReviewAudio(text) {
        if (!('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'nl-NL';
        utterance.rate = this.audioSpeed || 1.0;
        const voices = window.speechSynthesis.getVoices();
        const dutchVoice = voices.find(v => v.lang && v.lang.toLowerCase().startsWith('nl'));
        if (dutchVoice) utterance.voice = dutchVoice;
        window.speechSynthesis.speak(utterance);
      }

      filterReview(filter, btnElement) {
        document.querySelectorAll('.filter-pills .filter-btn').forEach(btn => btn.classList.remove('active'));
        if (btnElement) btnElement.classList.add('active');
        this.renderReviewList(filter);
      }

      // Jump Grids
      renderLandingJumpGrid() {
        const grid = document.getElementById('landingJumpGrid');
        grid.innerHTML = '';
        this.activeQuestionList.forEach((q, idx) => {
          const chip = document.createElement('div');
          chip.className = 'jump-chip';
          chip.textContent = q.id;
          chip.title = \`Question \${q.id}: \${q.category || 'Question'}\`;
          chip.addEventListener('click', () => {
            this.startPracticeMode(idx);
          });
          grid.appendChild(chip);
        });
        document.getElementById('jumpTotalText').textContent = \`Questions 1 to \${this.activeQuestionList.length}\`;
      }

      renderQuizJumpGrid() {
        const grid = document.getElementById('quizJumpGrid');
        grid.innerHTML = '';
        this.activeQuestionList.forEach((q, idx) => {
          const chip = document.createElement('div');
          chip.className = 'jump-chip';
          chip.textContent = q.id;

          if (idx === this.currentIndex) {
            chip.classList.add('current');
          }

          const ans = this.answers[idx];
          if (ans !== undefined) {
            if (ans.isCorrect) chip.classList.add('answered-correct');
            else chip.classList.add('answered-wrong');
          }

          chip.addEventListener('click', () => {
            this.jumpToQuestion(idx);
          });
          grid.appendChild(chip);
        });
      }

      // Toast Notifications
      showToast(msg) {
        const toast = document.getElementById('toast');
        const text = document.getElementById('toastMessage');
        text.textContent = msg;
        toast.classList.add('show');
        clearTimeout(this.toastTimer);
        this.toastTimer = setTimeout(() => {
          toast.classList.remove('show');
        }, 2500);
      }

      // Keyboard Controls
      setupKeyboardListeners() {
        window.addEventListener('keydown', (e) => {
          if (document.getElementById('quitModal').classList.contains('active')) {
            if (e.key === 'Escape') this.closeQuitModal();
            return;
          }

          if (this.currentMode !== 'practice' && this.currentMode !== 'exam') return;

          // Audio play shortcut: 'P' or 'p'
          if ((e.key === 'p' || e.key === 'P') && this.selectedModule === 'listening') {
            this.playCurrentAudio();
            return;
          }

          // Translation / Transcript toggle: 'T' or 't'
          if (e.key === 't' || e.key === 'T') {
            if (this.currentMode === 'practice') {
              if (this.selectedModule === 'listening') {
                this.toggleAudioTranscript();
              } else {
                this.toggleTranslation();
              }
            }
            return;
          }

          // Bookmark: 'B' or 'b'
          if (e.key === 'b' || e.key === 'B') {
            this.toggleCurrentBookmark();
            return;
          }

          // Option selection: 1-4 or A-D
          const key = e.key.toUpperCase();
          const optionKeys = {
            '1': 0, 'A': 0,
            '2': 1, 'B': 1,
            '3': 2, 'C': 2,
            '4': 3, 'D': 3
          };

          if (optionKeys[key] !== undefined) {
            const optIdx = optionKeys[key];
            const q = this.activeQuestionList[this.currentIndex];
            if (q && optIdx < q.options.length) {
              this.handleOptionSelect(optIdx);
            }
            return;
          }

          // Next: Enter or Space
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.nextQuestion();
            return;
          }

          // Previous: ArrowLeft
          if (e.key === 'ArrowLeft' && this.currentMode === 'practice') {
            this.prevQuestion();
            return;
          }

          // Next: ArrowRight
          if (e.key === 'ArrowRight') {
            this.nextQuestion();
            return;
          }
        });
      }
    }

    // Initialize Application
    const appState = new QuizApplication();
    window.appState = appState;
    document.addEventListener('DOMContentLoaded', () => {
      appState.init();
    });
  </script>
</body>
</html>
`;

fs.writeFileSync('index.html', html);
console.log('Successfully written complete unified index.html! File size:', html.length);
