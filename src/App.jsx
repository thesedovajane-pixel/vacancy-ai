
import { useState, useEffect, useRef } from 'react'
import './App.css'

const questions = [
  {
    title: 'Расскажите о ежедневных задачах',
    description: 'Какие 2–3 задачи сотрудник выполняет каждый день?',
    placeholder: 'Например: анализирует данные, общается с клиентами, готовит отчёты...'
  },
  {
    title: 'Над каким проектом работает сотрудник?',
    description: 'Какой проект или направление будет в фокусе ближайшие шесть месяцев?',
    placeholder: 'Опишите проект, его цель и основные особенности...'
  },
  {
    title: 'Что будет дальше?',
    description: 'Продолжит ли сотрудник этот проект следующие шесть месяцев или перейдёт на другой?',
    placeholder: 'Расскажите о планах на следующий период...'
  },
  {
    title: 'Какие нужны навыки и инструменты?',
    description: 'Какие специальные программы, инструменты и знания необходимы?',
    placeholder: 'Например: Figma, SQL, Jira, английский язык...'
  }
]

function App() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState(['', '', '', ''])
  const [listening, setListening] = useState(false)
  const [error, setError] = useState('')
  const recognitionRef = useRef(null)

  const isComplete = step === questions.length
  const currentQuestion = questions[step]
  const currentAnswer = answers[step] || ''
  const progress = isComplete
  ? 100
  : (step / questions.length) * 100

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  function updateAnswer(value) {
    setAnswers(previous =>
      previous.map((answer, index) => index === step ? value : answer)
    )
  }

  function startListening() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      setError('Голосовой ввод не поддерживается. Попробуйте Chrome или введите ответ вручную.')
      return
    }

    setError('')
    const recognition = new SpeechRecognition()
    recognition.lang = 'ru-RU'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setAnswers(previous =>
        previous.map((answer, index) =>
          index === step
            ? answer ? `${answer} ${transcript}` : transcript
            : answer
        )
      )
    }

    recognition.onerror = () => {
      setError('Не удалось распознать речь. Проверьте доступ к микрофону или введите ответ вручную.')
      setListening(false)
    }

    recognition.onend = () => {
      setListening(false)
    }

    recognitionRef.current = recognition
    setListening(true)
    recognition.start()
  }

  function stopListening() {
    recognitionRef.current?.stop()
    setListening(false)
  }

  function nextStep() {
    if (!currentAnswer.trim()) {
      setError('Сначала напишите или продиктуйте ответ.')
      return
    }
    setError('')
    setStep(step + 1)
  }

  function previousStep() {
    setError('')
    setStep(Math.max(0, step - 1))
  }

  function restart() {
    setStep(0)
    setAnswers(['', '', '', ''])
    setError('')
  }

  function downloadDescription() {
    const content = questions
      .map((question, index) => `${question.title}\n${answers[index]}`)
      .join('\n\n')
  
    const file = new Blob([content], {
      type: 'text/plain;charset=utf-8'
    })
  
    const url = URL.createObjectURL(file)
    const link = document.createElement('a')
  
    link.href = url
    link.download = 'vacancy-description.txt'
  
    document.body.appendChild(link)
    link.click()
    link.remove()
  
    URL.revokeObjectURL(url)
  }
  
  if (isComplete) {
    return (
      <main className="app-shell">
        <header className="topbar">
          <div className="brand"><span className="brand-mark">V</span> VACANCY AI</div>
          <span className="status-label">Результат интервью</span>
        </header>

        <section className="result-card">
          <div className="eyebrow">ВАШ ЧЕРНОВИК ВАКАНСИИ</div>
          <h1>Описание позиции</h1>
          <p className="result-intro">
            На основе ваших ответов подготовлена структура требований к сотруднику.
          </p>          
{[
  ['Основные обязанности', 'Какие задачи выполняет сотрудник ежедневно?'],
  ['Проект на ближайшие 6 месяцев', 'Над каким проектом предстоит работать?'],
  ['Дальнейшие планы', 'Как изменится зона ответственности?'],
  ['Требования к кандидату', 'Какие навыки и инструменты необходимы?']
].map((section, index) => (
  <div className="result-section" key={section[0]}>
    <div className="result-section-label">РАЗДЕЛ {index + 1}</div>
    <h3>{section[0]}</h3>
    <p className="result-hint">{section[1]}</p>
    <textarea
      className="result-editor"
      value={answers[index]}
      onChange={(event) =>
        setAnswers(previous =>
          previous.map((answer, i) =>
            i === index ? event.target.value : answer
          )
        )
      }
      rows={3}
    />
  </div>
))}
            
<div className="result-actions">
  <button className="secondary-button" onClick={previousStep}>
    Вернуться к ответам
  </button>
  <button className="primary-button" onClick={() => {
    navigator.clipboard?.writeText(
      questions.map((q, i) => `${q.title}\n${answers[i]}`).join('\n\n')
    )
    setError('Текст скопирован, если браузер разрешил доступ к буферу обмена.')
  }}>

              Скопировать описание
            </button> 
<button
  className="secondary-button"
  onClick={downloadDescription}
>
  ↓ Скачать .txt
</button>

          </div>
          {error && <p className="error-message">{error}</p>}
          <button className="text-button" onClick={restart}>Начать заново</button>
        </section>
      </main>
    )
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand"><span className="brand-mark">V</span> VACANCY AI</div>
        <span className="status-label">Создание вакансии</span>
      </header>

      <section className="interview">
        <div className="progress-meta">
          <span>ИНТЕРВЬЮ</span>
          <span>{String(step + 1).padStart(2, '0')} / 04</span>
        </div>

        

        <div className="progress-widget">

<div className="progress-ring-wrap">
  <svg className="progress-ring" viewBox="0 0 220 220">
    <circle
      className="progress-ring-bg"
      cx="110"
      cy="110"
      r="100"
    />

    <circle
      className="progress-ring-value"
      cx="110"
      cy="110"
      r="100"
      style={{
        strokeDasharray: `${2 * Math.PI * 100}`,
        strokeDashoffset: `${2 * Math.PI * 100 * (1 - progress / 100)}`
      }}
    />
  </svg>

  <div className="progress-ring-center">
    <button
      className={`voice-orb ${listening ? 'is-listening' : ''}`}
      onClick={listening ? stopListening : startListening}
      aria-label={listening ? 'Остановить запись' : 'Начать голосовой ввод'}
    >
      <span className="orb-core">
        {listening ? 'Ⅱ' : '●'}
      </span>
      <span className="orb-halo" />
    </button>
  </div>
</div>

<div className="progress-caption">
  <span>{Math.round(progress)}%</span>
  <small>ГОТОВНОСТЬ</small>
</div>

<div className="voice-status">
  {listening ? 'Слушаю вас...' : 'Нажмите, чтобы ответить голосом'}
</div>

</div>


        <div className="question-content" key={step}>          <div className="eyebrow">ВОПРОС {step + 1}</div>
          <h1>{currentQuestion.title}</h1>
          <p className="question-description">{currentQuestion.description}</p>

          <label className="answer-label" htmlFor="answer">
            ВАШ ОТВЕТ
          </label>
          <textarea
            id="answer"
            value={currentAnswer}
            onChange={(event) => updateAnswer(event.target.value)}
            placeholder={currentQuestion.placeholder}
            rows={4}
          />

          {error && <p className="error-message">{error}</p>}

          <div className="form-footer">
            <span className="helper-text">Можно ответить голосом или текстом</span>
            <div className="navigation">
              {step > 0 && (
                <button className="secondary-button" onClick={previousStep}>
                  Назад
                </button>
              )}
              <button className="primary-button" onClick={nextStep}>
                {step === 3 ? 'Сформировать результат' : 'Далее'}
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer-note">
        <span className="footer-dot" />
        Ваши ответы помогут сформировать профиль будущего сотрудника
      </footer>
    </main>
  )
}

export default App

