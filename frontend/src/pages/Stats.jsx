import React, { useState } from "react"

export default function Stats() {
  // Демо-данные для примера
  const mockAnalyses = [
    {
      id: 1,
      date: "27 мая 2026",
      time: "10:32",
      state: "Умеренная когнитивная нагрузка",
      cognitiveIndex: 62,
      latency: 310,
      blinks: 18
    },
    {
      id: 2,
      date: "26 мая 2026",
      time: "17:15",
      state: "Состояние близко к норме",
      cognitiveIndex: 28,
      latency: 215,
      blinks: 12
    }
  ]

  // 🔥 Состояние для отслеживания открытого меню экспорта
  const [openMenuId, setOpenMenuId] = useState(null)

  const getStateColor = (state) => {
    if (state.includes("Высокая")) return "#ff8a8a"
    if (state.includes("Умеренная")) return "#ffd27a"
    return "#7CFFB2"
  }

  const getStateBg = (state) => {
    if (state.includes("Высокая")) return "rgba(255,120,120,0.15)"
    if (state.includes("Умеренная")) return "rgba(255,210,120,0.15)"
    return "rgba(124,255,178,0.15)"
  }

  // 🔥 Обработчик экспорта
  const handleExport = (analysisId, serviceName) => {
    alert(`📤 Экспорт анализа #${analysisId} в ${serviceName}\n\nВ рабочей версии данные будут переданы через защищённое API.`)
    setOpenMenuId(null)
  }

  return (
    <div style={{
      backgroundColor: "#2b2b2b",
      minHeight: "100vh",
      color: "white",
      paddingBottom: "60px"
    }}>
      <div style={{ maxWidth: "1450px", margin: "0 auto", padding: "50px" }}>

        {/* ЗАГОЛОВОК */}
        <div style={{ marginBottom: "40px" }}>
          <h1 style={{ fontSize: "48px", fontWeight: "700", marginBottom: "12px" }}>
            История анализов
          </h1>
          <p style={{ fontSize: "20px", color: "#bdbdbd", lineHeight: "1.6", maxWidth: "800px" }}>
            Здесь сохраняются результаты всех проведённых тестов для отслеживания
            динамики состояния и сравнения показателей во времени.
          </p>
        </div>

        {/* СЕТКА КАРТОЧЕК */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: "24px"
        }}>
          {mockAnalyses.map((analysis) => (
            <div
              key={analysis.id}
              style={{
                backgroundColor: "#1f1f1f",
                borderRadius: "24px",
                padding: "28px",
                border: "1px solid #333",
                boxShadow: "0 0 30px rgba(0,0,0,0.2)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                cursor: "pointer",
                position: "relative" // 🔥 Для позиционирования меню
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)"
                e.currentTarget.style.boxShadow = "0 8px 40px rgba(0,0,0,0.3)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)"
                e.currentTarget.style.boxShadow = "0 0 30px rgba(0,0,0,0.2)"
              }}
            >
              {/* ВЕРХНЯЯ ЧАСТЬ: Дата + Результат */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "20px",
                flexWrap: "wrap",
                gap: "12px"
              }}>
                <div>
                  <div style={{ fontSize: "22px", fontWeight: "600", color: "white" }}>
                    {analysis.date}
                  </div>
                  <div style={{ fontSize: "16px", color: "#888", marginTop: "4px" }}>
                    {analysis.time}
                  </div>
                </div>
                <div style={{
                  padding: "8px 14px",
                  borderRadius: "12px",
                  backgroundColor: getStateBg(analysis.state),
                  color: getStateColor(analysis.state),
                  fontSize: "14px",
                  fontWeight: "600",
                  textAlign: "right",
                  border: `1px solid ${getStateColor(analysis.state).replace(')', ',0.3)').replace('rgb', 'rgba')}`
                }}>
                  {analysis.state}
                </div>
              </div>

              {/* ЦЕНТРАЛЬНЫЙ БЛОК: Когнитивный индекс */}
              <div style={{
                marginBottom: "20px",
                padding: "20px",
                backgroundColor: "#252525",
                borderRadius: "16px",
                textAlign: "center",
                border: "1px solid #333"
              }}>
                <div style={{ fontSize: "14px", color: "#bdbdbd", marginBottom: "8px" }}>
                  Когнитивный индекс
                </div>
                <div style={{ fontSize: "42px", fontWeight: "700", color: "#7CFFB2" }}>
                  {analysis.cognitiveIndex}
                  <span style={{ fontSize: "18px", color: "#888", fontWeight: "400" }}>/100</span>
                </div>
              </div>

              {/* НИЖНЯЯ ЧАСТЬ: Дополнительные метрики */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                fontSize: "15px",
                marginBottom: "20px"
              }}>
                <div style={{
                  backgroundColor: "#252525",
                  padding: "14px",
                  borderRadius: "14px",
                  border: "1px solid #333"
                }}>
                  <div style={{ color: "#888", fontSize: "13px", marginBottom: "6px" }}>Латентность</div>
                  <div style={{ color: "white", fontWeight: "600", fontSize: "18px" }}>
                    {analysis.latency} мс
                  </div>
                </div>
                <div style={{
                  backgroundColor: "#252525",
                  padding: "14px",
                  borderRadius: "14px",
                  border: "1px solid #333"
                }}>
                  <div style={{ color: "#888", fontSize: "13px", marginBottom: "6px" }}>Моргания</div>
                  <div style={{ color: "white", fontWeight: "600", fontSize: "18px" }}>
                    {analysis.blinks} /мин
                  </div>
                </div>
              </div>

              {/* 🔥 КНОПКА ЭКСПОРТА */}
              <div style={{ position: "relative" }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation() // 🔥 Чтобы не срабатывал клик по карточке
                    setOpenMenuId(openMenuId === analysis.id ? null : analysis.id)
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    width: "100%",
                    padding: "10px 16px",
                    background: "linear-gradient(135deg, rgba(124,255,178,0.15), rgba(124,255,178,0.05))",
                    border: "1px solid rgba(124,255,178,0.3)",
                    borderRadius: "12px",
                    color: "#7CFFB2",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "linear-gradient(135deg, rgba(124,255,178,0.25), rgba(124,255,178,0.1))"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "linear-gradient(135deg, rgba(124,255,178,0.15), rgba(124,255,178,0.05))"
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  Экспортировать
                </button>

                {/* 🔥 ВЫПАДАЮЩЕЕ МЕНЮ ЭКСПОРТА */}
                {openMenuId === analysis.id && (
                  <div style={{
                    position: "absolute",
                    bottom: "100%",
                    left: "0",
                    right: "0",
                    marginBottom: "8px",
                    backgroundColor: "#1f1f1f",
                    border: "1px solid #333",
                    borderRadius: "16px",
                    padding: "12px",
                    minWidth: "240px",
                    boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
                    zIndex: 100
                  }}>
                    <div style={{ fontSize: "13px", color: "#888", marginBottom: "10px", textAlign: "center" }}>
                      Экспорт в
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
                        onClick={(e) => {
                          e.stopPropagation()
                          handleExport(analysis.id, option.name)
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          width: "100%",
                          padding: "8px 14px",
                          background: "transparent",
                          border: "none",
                          borderRadius: "10px",
                          color: "white",
                          fontSize: "14px",
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
                        <span style={{ fontSize: "18px" }}>{option.icon}</span>
                        <span>{option.name}</span>
                        <span style={{
                          marginLeft: "auto",
                          fontSize: "11px",
                          color: option.color,
                          backgroundColor: `${option.color}20`,
                          padding: "3px 8px",
                          borderRadius: "20px"
                        }}>
                          Доступно
                        </span>
                      </button>
                    ))}

                    <div style={{
                      marginTop: "10px",
                      paddingTop: "10px",
                      borderTop: "1px solid #333",
                      fontSize: "11px",
                      color: "#666",
                      textAlign: "center"
                    }}>
                      🔒 Защищённое соединение
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}