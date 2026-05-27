import React, { useState, useRef, useMemo } from "react"
import { uploadVideo } from "../api"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts"

function Analyzer() {

  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false) // 🔥 Состояние для меню экспорта

  const [recording, setRecording] = useState(false)
  const [flash, setFlash] = useState(false)

  const [analysisMode, setAnalysisMode] = useState(null)
  const [analysisMethod, setAnalysisMethod] = useState("classic") // Кнопка для вида

  const videoRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])

  // =========================================
  // QUESTIONS
  // =========================================

  const questionPool = useMemo(() => [
    {
      text: "Как вы оцениваете ваше текущее состояние?",
      options: [
        { label: "Хорошее", value: 0 },
        { label: "Нормальное", value: 1 },
        { label: "Плохое", value: 2 }
      ]
    },
    {
      text: "Сколько кофеиносодержащих напитков вы употребили сегодня?",
      options: [
        { label: "0", value: 0 },
        { label: "1-2", value: 1 },
        { label: "3 и более", value: 2 }
      ]
    },
    {
      text: "Сколько часов вы спали в последние дни?",
      options: [
        { label: "7-9 часов", value: 0 },
        { label: "5-6 часов", value: 1 },
        { label: "Менее 5 часов", value: 2 }
      ]
    },
    {
      text: "Сколько времени вы проводили за экраном устройств?",
      options: [
        { label: "Менее 2 часов", value: 0 },
        { label: "2-6 часов", value: 1 },
        { label: "Более 6 часов", value: 2 }
      ]
    },
    {
      text: "Испытываете ли вы головные боли в последнее время?",
      options: [
        { label: "Нет", value: 0 },
        { label: "Иногда", value: 1 },
        { label: "Часто", value: 2 }
      ]
    },
    {
      text: "Насколько вы ощущаете усталость глаз?",
      options: [
        { label: "Не ощущаю", value: 0 },
        { label: "Умеренно", value: 1 },
        { label: "Сильно", value: 2 }
      ]
    },
    {
      text: "Как часто вы испытываете стресс?",
      options: [
        { label: "Редко", value: 0 },
        { label: "Иногда", value: 1 },
        { label: "Часто", value: 2 }
      ]
    },
    {
      text: "Как вы оцениваете уровень концентрации?",
      options: [
        { label: "Высокий", value: 0 },
        { label: "Средний", value: 1 },
        { label: "Низкий", value: 2 }
      ]
    },
    {
      text: "Чувствуете ли вы сонливость?",
      options: [
        { label: "Нет", value: 0 },
        { label: "Немного", value: 1 },
        { label: "Сильную", value: 2 }
      ]
    },
    {
      text: "Насколько вы были физически активны сегодня?",
      options: [
        { label: "Активен", value: 0 },
        { label: "Умеренно активен", value: 1 },
        { label: "Почти без активности", value: 2 }
      ]
    }
  ], [])

  // =========================================
  // RANDOM QUESTIONS
  // =========================================

  const [questions] = useState(() => {
    const shuffled = [...questionPool].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, 4)
  })

  const [answers, setAnswers] = useState(Array(4).fill(0))

  // =========================================
  // SURVEY LOGIC
  // =========================================

  const calculateSurveyScore = () => answers.reduce((a, b) => a + b, 0)

  const getSurveyState = (score) => {
    if (score >= 6) return "Высокая вероятность усталости"
    if (score >= 3) return "Умеренное напряжение"
    return "Состояние близко к норме"
  }

  const getCognitiveScore = (surveyScore, variability = 0, blink = 0) => {
    let score = surveyScore * 10 + variability * 18 + blink * 0.8
    score = Math.min(100, Math.max(5, score))
    return Math.round(score)
  }

  const getAiSummary = (score) => {
    if (score >= 75) {
      return "Обнаружены признаки выраженной когнитивной нагрузки и повышенной утомляемости. Рекомендуется снизить зрительное напряжение и сделать перерыв."
    }
    if (score >= 45) {
      return "Наблюдаются умеренные признаки усталости и напряжения. Возможна сниженная концентрация внимания."
    }
    return "Показатели соответствуют относительно стабильному состоянию без выраженной когнитивной перегрузки."
  }

  // =========================================
  // SURVEY ONLY MODE
  // =========================================

  const runSurveyOnlyAnalysis = () => {
    const surveyScore = calculateSurveyScore()
    const cognitiveScore = getCognitiveScore(surveyScore)
    setAnalysisMode("surveyOnly")
    setResult({
      fallback: true,
      survey_only: true,
      survey_score: surveyScore,
      cognitive_score: cognitiveScore,
      final_state: getSurveyState(surveyScore),
      ai_summary: getAiSummary(cognitiveScore)
    })
  }

  // =========================================
  // ANALYZE VIDEO
  // =========================================

  const analyzeVideo = async (file) => {
    setLoading(true)
    setResult(null)
    const surveyScore = calculateSurveyScore()

    try {
      // 🔥 Всегда отправляем "classic" на бэкенд (AI-метод убран)
      const data = await uploadVideo(file, "classic")

      let finalState = data.state
      if (analysisMode === "survey") {
        if (surveyScore >= 6 || data.variability > 2 || data.blink_rate > 25) {
          finalState = "Высокая когнитивная нагрузка"
        } else if (surveyScore >= 3 || data.variability > 1) {
          finalState = "Умеренная когнитивная нагрузка"
        } else {
          finalState = "Состояние близко к норме"
        }
      }

      const cognitiveScore = getCognitiveScore(surveyScore, data.variability, data.blink_rate)

      setResult({
        ...data,
        survey_score: surveyScore,
        cognitive_score: cognitiveScore,
        final_state: finalState,
        ai_summary: getAiSummary(cognitiveScore),
        fallback: false
      })

    } catch (err) {
      console.error("Ошибка анализа:", err)
      const errorData = err.response?.data || err.data || {}
      const cognitiveScore = getCognitiveScore(surveyScore)
      setResult({
        fallback: true,
        survey_score: surveyScore,
        cognitive_score: cognitiveScore,
        final_state: getSurveyState(surveyScore),
        ai_summary: getAiSummary(cognitiveScore),
        debug: errorData.debug || [],
        stats: errorData.stats || null
      })
    }

    setLoading(false)
  }

  // =========================================
  // UPLOAD
  // =========================================

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    analyzeVideo(file)
  }

  // =========================================
  // RECORDING
  // =========================================

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false
      })

      videoRef.current.srcObject = stream
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" })
        const file = new File([blob], "recorded.webm", { type: "video/webm" })
        analyzeVideo(file)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setRecording(true)

      setTimeout(() => {
        setFlash(true)
        setTimeout(() => setFlash(false), 250)
      }, 2000)

      setTimeout(() => stopRecording(), 6000)

    } catch (err) {
      console.error(err)
      alert("Ошибка доступа к камере")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current) mediaRecorderRef.current.stop()
    setRecording(false)
  }

  // =========================================
  // UI
  // =========================================

  return (
    <div style={{ backgroundColor: "#2b2b2b", minHeight: "100vh", color: "white", paddingBottom: "60px" }}>

      {flash && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "white", zIndex: 9999 }} />
      )}

      <div style={{ maxWidth: "1450px", margin: "0 auto", padding: "50px" }}>

        {/* TITLE */}
        <div style={{ marginBottom: "45px" }}>
          <div style={{ fontSize: "56px", fontWeight: "700", marginBottom: "16px" }}>Анализ состояния</div>
          <div style={{ fontSize: "24px", color: "#bdbdbd", lineHeight: "1.8", maxWidth: "900px" }}>
            Оценка когнитивной нагрузки на основе видеопупиллометрии, динамики зрачка и результатов анкетирования.
          </div>
        </div>

        {/* SURVEY */}
        {!analysisMode && (
          <div style={{ backgroundColor: "#1f1f1f", borderRadius: "28px", padding: "40px", border: "1px solid #333", boxShadow: "0 0 40px rgba(0,0,0,0.25)" }}>
            <div style={{ fontSize: "38px", fontWeight: "700", marginBottom: "14px" }}>Предварительный опрос</div>
            <div style={{ fontSize: "21px", color: "#bdbdbd", marginBottom: "40px", lineHeight: "1.8" }}>
              Ответьте на несколько вопросов перед началом анализа.
            </div>

            {questions.map((q, index) => (
              <div key={index} style={{ marginBottom: "36px" }}>
                <div style={{ fontSize: "25px", fontWeight: "600", marginBottom: "18px" }}>{q.text}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "14px" }}>
                  {q.options.map((option, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        const updated = [...answers]
                        updated[index] = option.value
                        setAnswers(updated)
                      }}
                      style={{
                        padding: "16px 24px",
                        borderRadius: "16px",
                        border: answers[index] === option.value ? "2px solid #7CFFB2" : "1px solid #444",
                        background: answers[index] === option.value
                          ? "linear-gradient(135deg, rgba(124,255,178,0.18), rgba(124,255,178,0.08))"
                          : "#2d2d2d",
                        color: "white",
                        cursor: "pointer",
                        fontSize: "18px",
                        transition: "0.25s ease",
                        boxShadow: answers[index] === option.value ? "0 0 20px rgba(124,255,178,0.15)" : "none"
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* BUTTONS */}
            <div style={{ display: "flex", justifyContent: "space-between", gap: "20px", marginTop: "20px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: "18px", flexWrap: "wrap" }}>
                <button onClick={() => setAnalysisMode("survey")} style={mainButton}>Перейти к анализу</button>
                <button onClick={() => setAnalysisMode("video")} style={secondaryButton}>Анализ без опроса</button>
              </div>
              <button onClick={runSurveyOnlyAnalysis} style={surveyOnlyButton}>Анализ только по опросу</button>
            </div>
          </div>
        )}

        {/* VIDEO ANALYSIS */}
        {(analysisMode === "survey" || analysisMode === "video") && (
          <div style={{ backgroundColor: "#1f1f1f", borderRadius: "28px", padding: "40px", border: "1px solid #333", boxShadow: "0 0 40px rgba(0,0,0,0.25)" }}>
            <div style={{ fontSize: "38px", fontWeight: "700", marginBottom: "14px" }}>Видеоанализ</div>
            <div style={{ fontSize: "21px", color: "#bdbdbd", marginBottom: "35px", lineHeight: "1.8" }}>
              Посмотрите прямо в камеру. Через 2 секунды появится световая вспышка.
            </div>

            {/* 🔥 КНОПКА ВЫБОРА МЕТОДА (для вида) */}
            <div style={{ marginBottom: "30px", padding: "20px", backgroundColor: "#2a2a3a", borderRadius: "16px", border: "1px solid #444" }}>
              <div style={{ fontSize: "20px", fontWeight: "600", marginBottom: "14px", color: "#7CFFB2" }}>🔬 Метод анализа</div>
              <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
                <button
                  onClick={() => setAnalysisMethod("classic")}
                  style={{
                    padding: "14px 24px",
                    borderRadius: "12px",
                    border: analysisMethod === "classic" ? "2px solid #7CFFB2" : "1px solid #555",
                    background: analysisMethod === "classic"
                      ? "linear-gradient(135deg, rgba(124,255,178,0.2), rgba(124,255,178,0.1))"
                      : "#2d2d2d",
                    color: "white",
                    cursor: "pointer",
                    fontSize: "16px",
                    transition: "0.25s ease",
                    flex: "1",
                    minWidth: "200px"
                  }}
                >
                  📷 Классический (OpenCV)
                  <div style={{ fontSize: "13px", color: "#aaa", marginTop: "4px", fontWeight: "400" }}>Активен</div>
                </button>

                <button
                  onClick={() => setAnalysisMethod("ai")}
                  disabled
                  style={{
                    padding: "14px 24px",
                    borderRadius: "12px",
                    border: "1px solid #444",
                    background: "#252525",
                    color: "#666",
                    cursor: "not-allowed",
                    fontSize: "16px",
                    flex: "1",
                    minWidth: "200px",
                    opacity: 0.6
                  }}
                >
                  🤖 AI (MediaPipe)
                  <div style={{ fontSize: "13px", color: "#555", marginTop: "4px", fontWeight: "400" }}>Требует установки</div>
                </button>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}>
              {/* CAMERA */}
              <div style={{ backgroundColor: "#252525", borderRadius: "24px", padding: "28px", border: "1px solid #333" }}>
                <div style={{ fontSize: "26px", fontWeight: "700", marginBottom: "20px" }}>Быстрый тест</div>
                <div style={{ position: "relative" }}>
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    style={{ width: "100%", borderRadius: "22px", border: "2px solid #3a3a3a", backgroundColor: "black" }}
                  />
                  <div style={{
                    position: "absolute", top: "18px", left: "18px", padding: "8px 14px",
                    borderRadius: "12px", backgroundColor: "rgba(0,0,0,0.55)", fontSize: "14px",
                    fontWeight: "600", border: "1px solid rgba(124,255,178,0.3)"
                  }}>● LIVE SCAN</div>
                </div>
                <div style={{ marginTop: "24px" }}>
                  {!recording ? (
                    <button onClick={startRecording} style={mainButton}>▶ Начать тест</button>
                  ) : (
                    <button onClick={stopRecording} style={{ ...mainButton, background: "linear-gradient(135deg, #ff6868, #ff4040)", boxShadow: "0 0 30px rgba(255,80,80,0.25)" }}>⛔ Остановить</button>
                  )}
                </div>
              </div>

              {/* UPLOAD */}
              <div style={{ backgroundColor: "#252525", borderRadius: "24px", padding: "28px", border: "1px solid #333" }}>
                <div style={{ fontSize: "26px", fontWeight: "700", marginBottom: "18px" }}>Загрузка видео</div>
                <div style={{ color: "#bdbdbd", fontSize: "18px", lineHeight: "1.8", marginBottom: "28px" }}>
                  Можно загрузить заранее записанное видео реакции зрачка.
                </div>
                <input type="file" onChange={handleUpload} style={{ fontSize: "18px" }} />
              </div>
            </div>
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div style={{ marginTop: "35px", backgroundColor: "#1f1f1f", borderRadius: "24px", padding: "35px", border: "1px solid #333" }}>
            <div style={{ fontSize: "30px", fontWeight: "700", marginBottom: "18px" }}>Выполняется анализ...</div>
            <div style={{ width: "100%", height: "12px", backgroundColor: "#2d2d2d", borderRadius: "999px", overflow: "hidden" }}>
              <div style={{ width: "60%", height: "100%", background: "linear-gradient(90deg, #7CFFB2, #54d98c)", borderRadius: "999px", animation: "pulse 1.2s infinite" }} />
            </div>
          </div>
        )}

        {/* RESULT */}
        {result && (
          <div style={{ marginTop: "35px", backgroundColor: "#1f1f1f", borderRadius: "28px", padding: "40px", border: "1px solid #333", boxShadow: "0 0 40px rgba(0,0,0,0.25)" }}>

            {/* HEADER */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px", marginBottom: "30px" }}>
              <div>
                <div style={{ fontSize: "38px", fontWeight: "700", marginBottom: "10px" }}>Результаты анализа</div>
                <div style={{ color: "#bdbdbd", fontSize: "20px" }}>Анализ когнитивной нагрузки и динамики зрачка</div>
                {result.method && (
                  <div style={{ fontSize: "14px", color: "#7CFFB2", marginTop: "8px", fontWeight: "600" }}>
                    Метод: 📷 Классический (OpenCV)
                  </div>
                )}
              </div>
              <div style={{
                padding: "18px 28px", borderRadius: "18px",
                background: result.final_state?.includes("Высок")
                  ? "linear-gradient(135deg, rgba(255,120,120,0.22), rgba(255,120,120,0.08))"
                  : result.final_state?.includes("Умер")
                    ? "linear-gradient(135deg, rgba(255,210,120,0.22), rgba(255,210,120,0.08))"
                    : "linear-gradient(135deg, rgba(124,255,178,0.22), rgba(124,255,178,0.08))",
                border: result.final_state?.includes("Высок")
                  ? "1px solid rgba(255,120,120,0.35)"
                  : result.final_state?.includes("Умер")
                    ? "1px solid rgba(255,210,120,0.35)"
                    : "1px solid rgba(124,255,178,0.35)"
              }}>
                <div style={{ fontSize: "18px", color: "#bdbdbd", marginBottom: "8px" }}>Итоговое состояние</div>
                <div style={{
                  fontSize: "28px", fontWeight: "700",
                  color: result.final_state?.includes("Высок") ? "#ff8a8a"
                    : result.final_state?.includes("Умер") ? "#ffd27a" : "#7CFFB2"
                }}>{result.final_state}</div>
              </div>
            </div>

            {/* FALLBACK / DEBUG */}
            {result.fallback && (
              <div style={{ backgroundColor: "#3b2d12", border: "1px solid #7b5b1a", padding: "22px", borderRadius: "16px", marginBottom: "35px", fontSize: "18px", lineHeight: "1.8" }}>
                <div style={{ marginBottom: "12px", fontWeight: "600" }}>⚠️ Видео не удалось обработать</div>
                <div style={{ marginBottom: "16px" }}>Анализ выполнен только на основе результатов опроса.</div>
                <details style={{ backgroundColor: "#2a2340", borderRadius: "10px", padding: "14px", fontSize: "14px", color: "#c5b5ff", marginTop: "12px" }}>
                  <summary style={{ cursor: "pointer", fontWeight: "600", marginBottom: "8px" }}>🔍 Показать техническую информацию</summary>
                  <div style={{ maxHeight: "200px", overflowY: "auto", fontFamily: "monospace" }}>
                    {result.debug && result.debug.length > 0 ? (
                      result.debug.map((log, i) => (<div key={i} style={{ padding: "2px 0", borderBottom: "1px dashed #444" }}>{log}</div>))
                    ) : (<div>Отладочные данные не получены. Проверьте консоль браузера (F12) и логи Python-сервера.</div>)}
                  </div>
                </details>
                {result.stats && (
                  <div style={{ marginTop: "16px", display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px", fontSize: "15px" }}>
                    <div>📊 Кадры: {result.stats.total_frames}</div>
                    <div>👤 Лица: {result.stats.faces_detected}</div>
                    <div>👁️ Глаза: {result.stats.eyes_detected}</div>
                    <div>⭕ Зрачки: {result.stats.pupils_detected}</div>
                    <div>💧 Моргания: {result.stats.blinks}</div>
                    <div>✅ Успешных: {result.stats.valid_pupil_frames}</div>
                  </div>
                )}
              </div>
            )}

            {/* METRICS */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "16px", marginBottom: "40px" }}>
              {!result.fallback && (
                <>
                  <Metric title="Базовый диаметр" value={`${result.baseline_diameter?.toFixed(2) || result.mean_pupil?.toFixed(2) || '—'} px`} />
                  <Metric title="Сужение" value={`${result.constriction_amplitude?.toFixed(2) || '—'} px`} />
                  <Metric title="Латентность" value={`${result.constriction_latency_ms?.toFixed(0) || '—'} мс`} />
                  <Metric title="Восстановление" value={result.recovery_time_ms ? `${result.recovery_time_ms.toFixed(0)} мс` : '—'} />
                  <Metric title="Моргания" value={`${result.blink_rate?.toFixed(1) || '—'} /мин`} />
                  <Metric title="Вариабельность" value={`${result.variability?.toFixed(2) || '—'} px`} />
                </>
              )}
              {result.fallback && result.mean_pupil && (
                <>
                  <Metric title="Средний зрачок" value={`${result.mean_pupil.toFixed(2)} px`} />
                  <Metric title="Моргания" value={`${result.blink_rate?.toFixed(1) || '—'} /мин`} />
                  <Metric title="Вариабельность" value={`${result.variability?.toFixed(2) || '—'} px`} />
                </>
              )}
              {(analysisMode === "survey" || result.survey_only) && (<Metric title="Баллы опроса" value={result.survey_score} />)}
              <Metric
                title="Когнитивный индекс"
                value={`${Math.min(100, Math.max(0,
                  (result.survey_score || 0) * 8 +
                  (result.variability || 0) * 12 +
                  (result.blink_rate || 0) * 0.5 +
                  (result.constriction_latency_ms ? Math.max(0, 300 - result.constriction_latency_ms) / 3 : 0)
                ).toFixed(0))}/100`}
              />
            </div>

            {/* 🔥 КНОПКА ЭКСПОРТА РЕЗУЛЬТАТОВ */}
            {!result.fallback && (
              <div style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "40px",
                position: "relative"
              }}>
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "12px 24px",
                    background: "linear-gradient(135deg, rgba(124,255,178,0.15), rgba(124,255,178,0.05))",
                    border: "1px solid rgba(124,255,178,0.3)",
                    borderRadius: "12px",
                    color: "#7CFFB2",
                    fontSize: "16px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "linear-gradient(135deg, rgba(124,255,178,0.25), rgba(124,255,178,0.1))"
                    e.currentTarget.style.transform = "translateY(-2px)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "linear-gradient(135deg, rgba(124,255,178,0.15), rgba(124,255,178,0.05))"
                    e.currentTarget.style.transform = "translateY(0)"
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  Экспортировать результаты
                </button>

                {/* 🔥 ВЫПАДАЮЩЕЕ МЕНЮ ЭКСПОРТА */}
                {showExportMenu && (
                  <div style={{
                    position: "absolute",
                    top: "100%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    marginTop: "8px",
                    backgroundColor: "#1f1f1f",
                    border: "1px solid #333",
                    borderRadius: "16px",
                    padding: "12px",
                    minWidth: "280px",
                    boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
                    zIndex: 100
                  }}>
                    <div style={{ fontSize: "14px", color: "#888", marginBottom: "12px", textAlign: "center" }}>
                      Выберите формат экспорта
                    </div>

                    {[
                      { name: "Apple Health", icon: "🍎", color: "#ff3b30" },
                      { name: "Google Fit", icon: "💚", color: "#34a853" },
                      { name: "Mi Fit", icon: "🟠", color: "#ff6b35" },
                      { name: "CSV файл", icon: "📊", color: "#7CFFB2" },
                      { name: "PDF отчёт", icon: "📄", color: "#a8a8ff" }
                    ].map((option) => (
                      <button
                        key={option.name}
                        onClick={() => {
                          alert(`📤 Экспорт в ${option.name} (демо-режим)\n\nВ рабочей версии данные будут переданы через защищённое API.`)
                          setShowExportMenu(false)
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          width: "100%",
                          padding: "10px 16px",
                          background: "transparent",
                          border: "none",
                          borderRadius: "10px",
                          color: "white",
                          fontSize: "15px",
                          cursor: "pointer",
                          textAlign: "left",
                          transition: "background 0.2s ease"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#2a2a2a"
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent"
                        }}
                      >
                        <span style={{ fontSize: "20px" }}>{option.icon}</span>
                        <span>{option.name}</span>
                        <span style={{
                          marginLeft: "auto",
                          fontSize: "12px",
                          color: option.color,
                          backgroundColor: `${option.color}20`,
                          padding: "4px 10px",
                          borderRadius: "20px"
                        }}>
                          Доступно
                        </span>
                      </button>
                    ))}

                    <div style={{
                      marginTop: "12px",
                      paddingTop: "12px",
                      borderTop: "1px solid #333",
                      fontSize: "12px",
                      color: "#666",
                      textAlign: "center"
                    }}>
                      🔒 Данные передаются через зашифрованное соединение
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SUMMARY */}
            <div style={{ background: "linear-gradient(135deg, rgba(124,255,178,0.10), rgba(124,255,178,0.03))", border: "1px solid rgba(124,255,178,0.18)", borderRadius: "22px", padding: "28px", marginBottom: "40px" }}>
              <div style={{ fontSize: "26px", fontWeight: "700", marginBottom: "16px", color: "#7CFFB2" }}>Summary</div>
              <div style={{ fontSize: "19px", lineHeight: "1.9", color: "#d5d5d5" }}>
                {result.final_state?.includes("Высок")
                  ? "Обнаружены признаки повышенной когнитивной нагрузки. Анализ показывает высокую вариабельность реакции зрачка и возможное снижение концентрации внимания."
                  : result.final_state?.includes("Умер")
                    ? "Выявлено умеренное напряжение. Параметры реакции зрачка находятся в пределах допустимых значений, однако присутствуют признаки усталости."
                    : "Показатели находятся близко к физиологической норме. Реакция зрачка и результаты опроса не указывают на выраженную когнитивную нагрузку."}
              </div>
            </div>

            {/* VIDEO BLOCK */}
            {!result.fallback && result.video_url && (
              <div style={{ marginBottom: "50px" }}>
                <div style={{ fontSize: "30px", fontWeight: "700", marginBottom: "20px" }}>Детекция зрачка</div>
                <div style={{ fontSize: "18px", color: "#bdbdbd", marginBottom: "22px", lineHeight: "1.7" }}>
                  На видео отображается работа алгоритма: обнаружение глаза, локализация области зрачка и отслеживание изменения диаметра в реальном времени.
                </div>
                <div style={{ position: "relative", maxWidth: "950px" }}>
                  <video
                    width="100%"
                    controls
                    autoPlay
                    loop
                    muted
                    playsInline
                    style={{ borderRadius: "22px", border: "2px solid #3a3a3a", boxShadow: "0 0 40px rgba(0,0,0,0.35)", backgroundColor: "#000" }}
                    onError={(e) => console.error("❌ Видео не загрузилось:", e)}
                  >
                    <source src={result.video_url} type="video/mp4" />
                  </video>
                  <div style={{
                    position: "absolute", top: "18px", left: "18px", padding: "10px 16px",
                    borderRadius: "12px", backgroundColor: "rgba(0,0,0,0.6)", border: "1px solid rgba(124,255,178,0.3)",
                    backdropFilter: "blur(8px)", fontSize: "15px", color: "#7CFFB2", fontWeight: "600"
                  }}>● Pupil Tracking Active</div>
                  <div style={{
                    position: "absolute", bottom: "18px", right: "18px", padding: "10px 16px",
                    borderRadius: "12px", backgroundColor: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.08)",
                    backdropFilter: "blur(8px)", fontSize: "15px", color: "#d7d7d7"
                  }}>Eye contour + pupil center visualization</div>
                </div>
              </div>
            )}

            {/* GRAPH */}
            {!result.fallback && result.pupil_sizes && (
              <div>
                <div style={{ fontSize: "30px", fontWeight: "700", marginBottom: "20px" }}>Динамика диаметра зрачка</div>
                <div style={{ backgroundColor: "#181818", border: "1px solid #2f2f2f", borderRadius: "24px", padding: "30px", overflowX: "auto" }}>
                  <LineChart width={950} height={380} data={result.pupil_sizes.map((v, i) => ({ frame: i, value: v }))}>
                    <CartesianGrid strokeDasharray="4 4" stroke="#333" />
                    <XAxis dataKey="frame" stroke="#aaa" />
                    <YAxis stroke="#aaa" />
                    <Tooltip contentStyle={{ backgroundColor: "#202020", border: "1px solid #444", borderRadius: "12px", color: "white" }} />
                    <Line type="monotone" dataKey="value" stroke="#7CFFB2" strokeWidth={4} dot={false} isAnimationActive={true} animationDuration={1800} />
                  </LineChart>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  )
}

// =========================================
// METRIC
// =========================================

function Metric({ title, value }) {
  return (
    <div style={{ backgroundColor: "#1f1f1f", borderRadius: "24px", padding: "28px", border: "1px solid #333", boxShadow: "0 0 30px rgba(0,0,0,0.2)" }}>
      <div style={{ color: "#bdbdbd", fontSize: "18px", marginBottom: "14px" }}>{title}</div>
      <div style={{ fontSize: "42px", fontWeight: "700", color: "#7CFFB2" }}>{value}</div>
    </div>
  )
}

// =========================================
// STYLES
// =========================================

const panelStyle = {
  backgroundColor: "#1f1f1f",
  borderRadius: "28px",
  padding: "35px",
  border: "1px solid #333",
  boxShadow: "0 0 40px rgba(0,0,0,0.25)"
}

const sectionTitle = {
  fontSize: "32px",
  fontWeight: "700",
  marginBottom: "24px"
}

const mainButton = {
  padding: "18px 30px",
  background: "linear-gradient(135deg, #7CFFB2, #56d98f)",
  border: "none",
  borderRadius: "16px",
  color: "#0b0b0b",
  fontSize: "20px",
  fontWeight: "700",
  cursor: "pointer",
  boxShadow: "0 0 30px rgba(124,255,178,0.18)",
  transition: "0.25s ease"
}

const secondaryButton = {
  padding: "18px 30px",
  backgroundColor: "#2b2b2b",
  border: "1px solid #555",
  borderRadius: "16px",
  color: "white",
  fontSize: "20px",
  fontWeight: "600",
  cursor: "pointer",
  transition: "0.25s ease"
}

const surveyOnlyButton = {
  padding: "18px 28px",
  background: "linear-gradient(135deg, rgba(124,255,178,0.16), rgba(124,255,178,0.06))",
  border: "1px solid rgba(124,255,178,0.3)",
  borderRadius: "16px",
  color: "#7CFFB2",
  fontSize: "19px",
  fontWeight: "700",
  cursor: "pointer",
  transition: "0.25s ease",
  boxShadow: "0 0 20px rgba(124,255,178,0.08)"
}

export default Analyzer