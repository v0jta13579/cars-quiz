"use client"

import { useMemo, useState, useTransition } from "react"
import { ArrowLeft, ArrowRight, Check, ChevronRight, CircleHelp, Flag, Gauge, Medal, Pencil, Play, Plus, Save, Settings2, Shield, Sparkles, Trash2, Trophy, X } from "lucide-react"
import { deleteQuiz, saveQuiz, submitScore, type QuizRecord, type ScoreRecord } from "@/lib/actions"
import type { QuizQuestion } from "@/lib/schema"

type View = "home" | "editor" | "my-quizzes" | "leaderboard" | "race" | "result"
type Props = { initialQuizzes: QuizRecord[]; initialLeaderboard: ScoreRecord[] }

const builtIn: QuizRecord = {
  id: "ultimate-car-quiz", title: "ULTIMATE CAR QUIZ", createdAt: "",
  questions: [
    { question: "Která automobilka vyrábí model 911?", options: ["Ferrari", "Porsche", "Aston Martin", "McLaren"], answer: 1 },
    { question: "Jak se jmenuje první sériově vyráběné auto na světě?", options: ["Ford Model T", "Benz Patent-Motorwagen", "Citroën Type A", "Oldsmobile Curved Dash"], answer: 1 },
    { question: "Kolik válců má klasický motor V12?", options: ["8", "10", "12", "16"], answer: 2 },
    { question: "Která značka má ve znaku vzpínajícího se koně?", options: ["Lamborghini", "Ferrari", "Bugatti", "Maserati"], answer: 1 },
    { question: "Který model je známý jako ‚Godzilla‘?", options: ["Toyota Supra", "Nissan GT-R", "Mazda RX-7", "Honda NSX"], answer: 1 },
    { question: "Která země je domovem značky Koenigsegg?", options: ["Německo", "Itálie", "Švédsko", "Dánsko"], answer: 2 },
    { question: "Co měří jednotka koňská síla?", options: ["Točivý moment", "Výkon motoru", "Objem motoru", "Spotřebu"], answer: 1 },
    { question: "Která automobilka vyrábí model Chiron?", options: ["Bugatti", "Pagani", "Rimac", "Lotus"], answer: 0 },
    { question: "Jaký typ motoru proslavil Mazdu RX-8?", options: ["V8", "Wankelův rotační", "Boxer", "Řadový šestiválec"], answer: 1 },
    { question: "Který z těchto vozů má motor uprostřed?", options: ["Porsche 911", "Ferrari 296 GTB", "BMW M3", "Mercedes-AMG C 63"], answer: 1 },
    { question: "Co znamená zkratka ABS?", options: ["Active Brake System", "Anti-lock Braking System", "Automatic Balance Steering", "Advanced Boost Setup"], answer: 1 },
    { question: "Kdo založil automobilku Lamborghini?", options: ["Enzo Ferrari", "Ferruccio Lamborghini", "Giovanni Agnelli", "Ettore Bugatti"], answer: 1 },
    { question: "Která značka vyrábí supersport Jesko?", options: ["Pagani", "Koenigsegg", "McLaren", "Hennessey"], answer: 1 },
    { question: "Jaký pohon mají vozy Subaru nejčastěji?", options: ["Přední", "Zadní", "Všechna kola", "Pouze elektrický"], answer: 2 },
    { question: "Ve kterém roce debutoval Ford Mustang?", options: ["1954", "1964", "1974", "1984"], answer: 1 },
    { question: "Která automobilka používá slogan ‚The Ultimate Driving Machine‘?", options: ["Audi", "BMW", "Mercedes-Benz", "Lexus"], answer: 1 },
    { question: "Co je přeplňování turbodmychadlem?", options: ["Chlazení oleje", "Stlačování vzduchu do motoru", "Převod výkonu na kola", "Omezování otáček"], answer: 1 },
    { question: "Který vůz držel rekord Nürburgringu mezi sériovými auty v roce 2023?", options: ["Porsche 911 GT3 RS", "Mercedes-AMG One", "Lamborghini Revuelto", "Ferrari SF90"], answer: 1 },
    { question: "Jaká automobilka vytvořila legendární model Miata?", options: ["Toyota", "Mazda", "Honda", "Nissan"], answer: 1 },
    { question: "Který elektromobil je spojený se jménem Rimac?", options: ["Nevera", "Taycan", "Air", "I-PACE"], answer: 0 },
  ],
}
const cars = ["GT-R NISMO", "911 TURBO S", "M4 COMPETITION", "HURACÁN EVO", "AMG GT R", "SUPRA GR", "RS6 AVANT"]
const carColors = ["#f33c4c", "#2584ff", "#f2b73c", "#7c63f3", "#e8edf2", "#43d49a", "#ff744d"]
const emptyQuestion = (): QuizQuestion => ({ question: "", options: ["", "", "", ""], answer: 0 })

function formatScore(score: number) { return `${score.toLocaleString("cs-CZ")} B` }

export function CarQuizGame({ initialQuizzes, initialLeaderboard }: Props) {
  const [view, setView] = useState<View>("home")
  const [savedQuizzes, setSavedQuizzes] = useState(initialQuizzes)
  const [leaderboard, setLeaderboard] = useState(initialLeaderboard)
  const [activeQuiz, setActiveQuiz] = useState<QuizRecord>(builtIn)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [nickname, setNickname] = useState("")
  const [scoreSaved, setScoreSaved] = useState(false)
  const [quizTitle, setQuizTitle] = useState("")
  const [questions, setQuestions] = useState<QuizQuestion[]>([emptyQuestion()])
  const [editingId, setEditingId] = useState<string | undefined>()
  const [notice, setNotice] = useState("")
  const [pending, startTransition] = useTransition()

  const question = activeQuiz.questions[questionIndex]
  const correctCount = useMemo(() => score / 100, [score])

  function startQuiz(quiz: QuizRecord) {
    if (!quiz.questions.length) return
    setActiveQuiz(quiz); setQuestionIndex(0); setSelectedAnswer(null); setScore(0); setNickname(""); setScoreSaved(false); setNotice(""); setView("race")
  }

  function answerQuestion(index: number) {
    if (selectedAnswer !== null) return
    setSelectedAnswer(index)
    if (index === question.answer) setScore((value) => value + 100)
  }

  function nextQuestion() {
    if (questionIndex + 1 >= activeQuiz.questions.length) { setView("result"); return }
    setQuestionIndex((index) => index + 1); setSelectedAnswer(null)
  }

  function newQuiz() {
    setEditingId(undefined); setQuizTitle(""); setQuestions([emptyQuestion()]); setView("editor"); setNotice("")
  }

  function editQuiz(quiz: QuizRecord) {
    setEditingId(quiz.id); setQuizTitle(quiz.title); setQuestions(quiz.questions.map((item) => ({ ...item, options: [...item.options] as QuizQuestion["options"] }))); setView("editor"); setNotice("")
  }

  async function persistQuiz() {
    const result = await saveQuiz({ id: editingId, title: quizTitle, questions })
    if (!("quiz" in result) || !result.quiz) { setNotice("error" in result ? result.error ?? "Kvíz se nepodařilo uložit." : "Kvíz se nepodařilo uložit."); return }
    setSavedQuizzes((items) => [result.quiz, ...items.filter((item) => item.id !== result.quiz.id)])
    setView("my-quizzes")
  }

  async function removeQuiz(id: string) {
    const result = await deleteQuiz(id)
    if ("ok" in result) setSavedQuizzes((items) => items.filter((item) => item.id !== id))
  }

  async function saveResult() {
    const result = await submitScore({ nickname, score, totalQuestions: activeQuiz.questions.length, quizTitle: activeQuiz.title })
    if ("error" in result && result.error) { setNotice(result.error); return }
    setNotice("Výsledek přidán do leaderboardu.")
    setScoreSaved(true)
    setLeaderboard((items) => [...items, { id: crypto.randomUUID(), nickname: nickname.trim(), score, totalQuestions: activeQuiz.questions.length, quizTitle: activeQuiz.title, createdAt: new Date().toISOString() }].sort((a, b) => b.score - a.score).slice(0, 20))
  }

  function addQuestion() { setQuestions((current) => [...current, emptyQuestion()]) }

  return (
    <main className="game-shell">
      <header className="topbar">
        <button className="brand" onClick={() => setView("home")} aria-label="CAR QUIZ RACE — domů">
          <span className="brand-mark"><Gauge size={21} strokeWidth={2.6} /></span><span>CAR QUIZ <b>RACE</b></span>
        </button>
        <div className="topbar-right"><span className="online"><i /> LIVE RACE MODE</span><span className="top-divider" /><button className="top-score" onClick={() => setView("leaderboard")}><Trophy size={15} /> Žebříček</button></div>
      </header>

      {view === "home" && <section className="home-view">
        <div className="hero">
          <div className="hero-copy"><div className="eyebrow"><span className="eyebrow-line" /> MOTORSPORT KNOWLEDGE <span className="eyebrow-line" /></div><h1>VÍTEJ NA<br /><span>STARTOVNÍ ČÁŘE.</span></h1><p>Každá otázka je nový závod. Ukaž, co víš o světě rychlých kol.</p>
            <button className="primary-button hero-button" onClick={() => startQuiz(builtIn)}><Play size={17} fill="currentColor" /> START ULTIMATE QUIZ <ArrowRight size={17} /></button>
            <div className="hero-meta"><span><Shield size={15} /> 20 OTÁZEK</span><span><Gauge size={15} /> 100 BODŮ ZA SPRÁVNOU</span></div>
          </div>
          <div className="road-scene" aria-label="Stylizovaná závodní silnice s auty">
            <div className="scene-glow" /><div className="road"><div className="road-edge road-edge-left" /><div className="road-edge road-edge-right" /><div className="road-line" /><div className="road-line second" />
              <div className="car-shape car-one"><span /></div><div className="car-shape car-two"><span /></div><div className="car-shape car-three"><span /></div>
            </div><span className="scene-caption">NIGHT CIRCUIT <b>01 / 03</b></span><div className="scene-speed">280 <small>KM/H</small></div>
          </div>
          <div className="hero-index"><span>01</span><i /> <span>03</span></div>
        </div>
        <div className="section-heading"><div><span className="section-kicker">VYBER SI SVŮJ ZÁVOD</span><h2>NA ČEM DNES ZÁVODÍŠ?</h2></div><span className="section-count">{String(savedQuizzes.length + 1).padStart(2, "0")} KVÍZŮ</span></div>
        <div className="quiz-cards">
          <button className="quiz-card featured" onClick={() => startQuiz(builtIn)}><span className="card-topline"><span className="card-label red-label">DOPORUČENO</span><span className="card-arrow"><ArrowRight size={17} /></span></span><span className="card-number">01</span><span className="card-title">ULTIMATE<br />CAR QUIZ</span><span className="card-description">Legenda mezi kvízy. 20 otázek, historie i rychlost.</span><span className="card-bottom"><span>20 OTÁZEK</span><span>ALL LEVELS <ChevronRight size={14} /></span></span></button>
          <button className="quiz-card create-card" onClick={newQuiz}><span className="create-icon"><Plus size={23} /></span><span className="card-title">POSTAV SI<br />VLASTNÍ ZÁVOD</span><span className="card-description">Vytvoř vlastní otázky a vyzvi komunitu.</span><span className="card-bottom"><span>VLASTNÍ KVÍZ</span><span>VYTVOŘIT <ChevronRight size={14} /></span></span></button>
          {savedQuizzes.slice(0, 2).map((quiz, index) => <button className="quiz-card saved-card" key={quiz.id} onClick={() => startQuiz(quiz)}><span className="card-topline"><span className="card-label">MOJE TRAŤ</span><span className="card-arrow"><ArrowRight size={17} /></span></span><span className="card-number">{String(index + 3).padStart(2, "0")}</span><span className="card-title">{quiz.title}</span><span className="card-description">Tvůj vlastní okruh s {quiz.questions.length} {quiz.questions.length === 1 ? "otázkou" : "otázkami"}.</span><span className="card-bottom"><span>{quiz.questions.length} OTÁZEK</span><span>START <ChevronRight size={14} /></span></span></button>)}
        </div>
        <section className="question-catalog" aria-labelledby="question-catalog-title"><div className="section-heading"><div><span className="section-kicker">KOMPLETNÍ PŘEHLED</span><h2 id="question-catalog-title">VŠECHNY OTÁZKY</h2></div><span className="section-count">{builtIn.questions.length + savedQuizzes.reduce((total, quiz) => total + quiz.questions.length, 0)} CELKEM</span></div>{[{ ...builtIn }, ...savedQuizzes].map((quiz) => <div className="catalog-quiz" key={quiz.id}><h3>{quiz.title}<span>{quiz.questions.length} {quiz.questions.length === 1 ? "OTÁZKA" : "OTÁZEK"}</span></h3><ol>{quiz.questions.map((item, index) => <li key={`${quiz.id}-${index}`}><strong>{item.question}</strong><ul>{item.options.map((option, optionIndex) => <li className={optionIndex === item.answer ? "catalog-correct" : ""} key={optionIndex}><span>{String.fromCharCode(65 + optionIndex)}.</span> {option}{optionIndex === item.answer && <Check size={13} aria-label="Správná odpověď" />}</li>)}</ul></li>)}</ol></div>)}</section>
        <div className="home-footer"><span><Sparkles size={14} /> NOVÉ TRATĚ, NOVÉ VÝZVY</span><button onClick={() => setView("my-quizzes")}>MOJE KVÍZY <ArrowRight size={14} /></button><button onClick={() => setView("leaderboard")}>LEADERBOARD <ArrowRight size={14} /></button></div>
      </section>}

      {view === "editor" && <section className="content-view editor-view"><button className="back-link" onClick={() => setView("home")}><ArrowLeft size={16} /> ZPĚT DO MENU</button><div className="page-heading"><span className="section-kicker">GARÁŽ / TVŮJ EDITOR</span><h1>{editingId ? "UPRAV KVÍZ" : "POSTAV SI VLASTNÍ KVÍZ"}</h1><p>Každá otázka přidá do závodu další zatáčku.</p></div>
        <div className="editor-panel"><label className="field-label" htmlFor="quiz-title">NÁZEV TVÉHO KVÍZU</label><input id="quiz-title" className="text-input" value={quizTitle} maxLength={80} onChange={(event) => setQuizTitle(event.target.value)} placeholder="Např. Japonské legendy" />
          <div className="editor-questions">{questions.map((item, questionNumber) => <article className="question-editor" key={questionNumber}><div className="question-editor-head"><span className="question-badge">OTÁZKA {String(questionNumber + 1).padStart(2, "0")}</span>{questions.length > 1 && <button className="icon-button danger" onClick={() => setQuestions((all) => all.filter((_, index) => index !== questionNumber))} aria-label={`Smazat otázku ${questionNumber + 1}`}><Trash2 size={16} /></button>}</div>
            <input className="text-input question-input" value={item.question} maxLength={240} onChange={(event) => setQuestions((all) => all.map((q, index) => index === questionNumber ? { ...q, question: event.target.value } : q))} placeholder="Zadej otázku…" aria-label={`Text otázky ${questionNumber + 1}`} />
            <div className="option-editor-grid">{item.options.map((option, optionIndex) => <label className={`option-edit ${item.answer === optionIndex ? "is-correct" : ""}`} key={optionIndex}><span>{String.fromCharCode(65 + optionIndex)}</span><input value={option} maxLength={100} onChange={(event) => setQuestions((all) => all.map((q, index) => index === questionNumber ? { ...q, options: q.options.map((current, i) => i === optionIndex ? event.target.value : current) as QuizQuestion["options"] } : q))} placeholder={`Možnost ${String.fromCharCode(65 + optionIndex)}`} aria-label={`Možnost ${String.fromCharCode(65 + optionIndex)} pro otázku ${questionNumber + 1}`} /><button type="button" onClick={() => setQuestions((all) => all.map((q, index) => index === questionNumber ? { ...q, answer: optionIndex } : q))} aria-label={`Označit možnost ${String.fromCharCode(65 + optionIndex)} jako správnou`}><Check size={14} /></button></label>)}</div><p className="correct-hint"><Check size={13} /> Kliknutím na fajfku označíš správnou odpověď.</p>
          </article>)}</div>
          <button className="add-question" onClick={addQuestion}><Plus size={16} /> PŘIDAT DALŠÍ OTÁZKU</button>
          {notice && <p className="form-notice">{notice}</p>}
          <div className="editor-actions"><span>{questions.length} {questions.length === 1 ? "OTÁZKA" : "OTÁZKY"} V KVÍZU</span><button className="primary-button" disabled={pending} onClick={() => startTransition(() => { void persistQuiz() })}><Save size={16} /> ULOŽIT KVÍZ</button></div>
        </div>
      </section>}

      {view === "my-quizzes" && <section className="content-view"><button className="back-link" onClick={() => setView("home")}><ArrowLeft size={16} /> ZPĚT DO MENU</button><div className="page-heading"><span className="section-kicker">TVÁ GARÁŽ</span><h1>MOJE KVÍZY</h1><p>Vlastní tratě uložené pro další závod.</p></div><div className="list-toolbar"><span>{savedQuizzes.length} VLASTNÍCH KVÍZŮ</span><button className="outline-button" onClick={newQuiz}><Plus size={15} /> NOVÝ KVÍZ</button></div>
        {savedQuizzes.length ? <div className="quiz-list">{savedQuizzes.map((quiz) => <article className="quiz-list-item" key={quiz.id}><div className="list-icon"><Flag size={18} /></div><div className="list-main"><h3>{quiz.title}</h3><p>{quiz.questions.length} {quiz.questions.length === 1 ? "otázka" : "otázek"} <span>•</span> VLASTNÍ KVÍZ</p></div><button className="outline-button small" onClick={() => startQuiz(quiz)}><Play size={14} /> HRÁT</button><button className="icon-button" onClick={() => editQuiz(quiz)} aria-label={`Upravit kvíz ${quiz.title}`}><Pencil size={16} /></button><button className="icon-button danger" onClick={() => void removeQuiz(quiz.id)} aria-label={`Smazat kvíz ${quiz.title}`}><Trash2 size={16} /></button></article>)}</div> : <div className="empty-state"><div className="empty-symbol"><CircleHelp size={28} /></div><h3>GARÁŽ JE ZATÍM PRÁZDNÁ</h3><p>Postav si svůj první kvíz a vyjeď na trať.</p><button className="primary-button" onClick={newQuiz}><Plus size={16} /> VYTVOŘIT KVÍZ</button></div>}
      </section>}

      {view === "leaderboard" && <section className="content-view"><button className="back-link" onClick={() => setView("home")}><ArrowLeft size={16} /> ZPĚT DO MENU</button><div className="page-heading"><span className="section-kicker">ŠAMPIONÁT / SEZÓNA 01</span><h1>LEADERBOARD</h1><p>Každá správná odpověď tě přibližuje k pódiu.</p></div><div className="leaderboard-panel"><div className="leaderboard-head"><span>POŘADÍ / JEZDEC</span><span>ZÁVOD</span><span>SKÓRE</span></div>{leaderboard.length ? leaderboard.map((entry, index) => <div className={`leaderboard-row ${index < 3 ? `podium podium-${index + 1}` : ""}`} key={entry.id}><div className="racer-cell"><span className="rank">{String(index + 1).padStart(2, "0")}</span><span className="avatar">{entry.nickname.slice(0, 1).toUpperCase()}</span><span className="racer-name">{entry.nickname}</span>{index === 0 && <Medal className="medal" size={17} />}</div><span className="race-name">{entry.quizTitle}</span><strong className="score-cell">{formatScore(entry.score)}</strong></div>) : <div className="empty-state leaderboard-empty"><div className="empty-symbol"><Trophy size={26} /></div><h3>POLE POSITION JE VOLNÁ</h3><p>Dokonči závod a tvoje skóre se objeví tady.</p><button className="primary-button" onClick={() => startQuiz(builtIn)}><Play size={15} /> ZAJET PRVNÍ KOLO</button></div>}</div><p className="board-footnote"><Shield size={14} /> Výsledky jsou uložené do společného žebříčku CAR QUIZ RACE.</p></section>}

      {view === "race" && question && <section className="race-view"><div className="race-top"><button className="back-link" onClick={() => setView("home")}><ArrowLeft size={16} /> UKONČIT ZÁVOD</button><div className="race-status"><span>OKRUH 01</span><span className="status-dot" /> <span>{activeQuiz.title}</span></div></div>
        <div className="race-progress"><div className="progress-label"><span>OTÁZKA {String(questionIndex + 1).padStart(2, "0")} <i>/ {String(activeQuiz.questions.length).padStart(2, "0")}</i></span><span>{formatScore(score)}</span></div><div className="progress-track"><span style={{ width: `${((questionIndex + 1) / activeQuiz.questions.length) * 100}%` }} /></div></div>
        <div className="track-stage"><div className="track-horizon" /><div className="track-question"><span className="question-kicker">{cars[questionIndex % cars.length]} <i /> PŘIJÍŽDÍ S OTÁZKOU</span><h2>{question.question}</h2><div className="answer-grid">{question.options.map((option, index) => { const correct = selectedAnswer !== null && question.answer === index; const wrong = selectedAnswer === index && selectedAnswer !== question.answer; return <button key={index} className={`answer-option ${correct ? "answer-correct" : ""} ${wrong ? "answer-wrong" : ""}`} disabled={selectedAnswer !== null} onClick={() => answerQuestion(index)}><span className="answer-letter">{String.fromCharCode(65 + index)}</span><span>{option}</span>{correct && <Check size={17} />}{wrong && <X size={17} />}</button> })}</div>
          {selectedAnswer !== null && <div className={`answer-feedback ${selectedAnswer === question.answer ? "feedback-correct" : "feedback-wrong"}`}><span>{selectedAnswer === question.answer ? <><Check size={17} /> SPRÁVNÁ ODPOVĚĎ. +100 BODŮ</> : <><X size={17} /> TENTOKRÁT NE. SPRÁVNĚ JE {String.fromCharCode(65 + question.answer)}</>}</span><button className="primary-button" onClick={nextQuestion}>{questionIndex + 1 === activeQuiz.questions.length ? "ZOBRAZIT VÝSLEDEK" : "DALŠÍ OTÁZKA"} <ArrowRight size={16} /></button></div>}
        </div><div className="race-stats"><span><Gauge size={15} /> {cars[questionIndex % cars.length]}</span><span><Settings2 size={15} /> {correctCount} SPRÁVNĚ</span><span><Flag size={15} /> {Math.max(0, activeQuiz.questions.length - questionIndex - 1)} K ZÁVĚRU</span></div></div>
      </section>}

      {view === "result" && <section className="result-view"><div className="result-card"><div className="result-icon"><Trophy size={31} /></div><span className="section-kicker">CÍLOVÁ ROVINKA / {activeQuiz.title}</span><h1>ZÁVOD DOKONČEN.</h1><p className="result-subtitle">Každé kolo tě posouvá blíž k titulu.</p><div className="result-score"><strong>{formatScore(score)}</strong><span>CELKOVÉ SKÓRE</span></div><div className="result-stats"><div><strong>{correctCount}<small>/{activeQuiz.questions.length}</small></strong><span>SPRÁVNĚ</span></div><div><strong>{Math.round((correctCount / activeQuiz.questions.length) * 100)}<small>%</small></strong><span>ÚSPĚŠNOST</span></div><div><strong>+{score}</strong><span>BODY</span></div></div><div className="score-submit"><label htmlFor="nickname">PŘEZDÍVKA DO LEADERBOARDU</label><div className="score-submit-row"><input id="nickname" className="text-input" value={nickname} maxLength={24} onChange={(event) => setNickname(event.target.value)} placeholder="Tvá závodní přezdívka" /><button className="primary-button" disabled={pending || scoreSaved} onClick={() => startTransition(() => { void saveResult() })}><Trophy size={15} /> {scoreSaved ? "SKÓRE ULOŽENO" : "ULOŽIT SKÓRE"}</button></div>{notice && <p className="form-notice">{notice}</p>}</div><div className="result-actions"><button className="outline-button" onClick={() => setView("leaderboard")}>LEADERBOARD <ArrowRight size={15} /></button><button className="primary-button" onClick={() => setView("home")}>ZPĚT DO MENU</button></div></div></section>}

      <footer className="site-footer"><span>CAR QUIZ RACE <i>© 2026</i></span><span>BUILT FOR THE LOVE OF CARS <b>●</b></span><button onClick={() => setView("home")}>HLAVNÍ MENU <ArrowRight size={13} /></button></footer>
    </main>
  )
}
