import { useNavigate } from "react-router-dom"

function Icon({ type }) {
  const common = {
    width: "34px",
    height: "34px",
    fill: "#7CFFB2",
    flexShrink: 0,
    filter: "drop-shadow(0 0 6px rgba(124,255,178,0.25))"
  }

  switch (type) {
    case "brain":
      return (
        <svg viewBox="0 0 24 24" style={common}>
          <path d="M12 2a3 3 0 00-3 3v1a3 3 0 00-2 5.5V13a5 5 0 0010 0v-1.5A3 3 0 0015 6V5a3 3 0 00-3-3z" />
        </svg>
      )

    case "eye":
      return (
        <svg viewBox="0 0 24 24" style={common}>
          <path d="M12 5c-5 0-9 4-10 7 1 3 5 7 10 7s9-4 10-7c-1-3-5-7-10-7zm0 11a4 4 0 110-8 4 4 0 010 8z" />
        </svg>
      )

    case "chart":
      return (
        <svg viewBox="0 0 24 24" style={common}>
          <path d="M3 3h2v18H3V3zm16 6h2v12h-2V9zM9 13h2v8H9v-8zm4-6h2v14h-2V7z" />
        </svg>
      )

    case "wave":
      return (
        <svg viewBox="0 0 24 24" style={common}>
          <path
            d="M2 12c2-4 4 4 6 0s4-4 6 0 4 4 6 0"
            stroke="#7CFFB2"
            strokeWidth="2"
            fill="none"
          />
        </svg>
      )

    case "camera":
      return (
        <svg viewBox="0 0 24 24" style={common}>
          <path d="M4 7h3l2-2h6l2 2h3v12H4V7zm8 3a4 4 0 100 8 4 4 0 000-8z" />
        </svg>
      )

    case "light":
      return (
        <svg viewBox="0 0 24 24" style={common}>
          <path d="M9 21h6v-1H9v1zm3-20a7 7 0 00-4 12c1 1 2 2 2 4h4c0-2 1-3 2-4a7 7 0 00-4-12z" />
        </svg>
      )

    default:
      return null
  }
}

function generateCards() {
  const dataset = [
    {
      icon: "chart",
      title: "Пупиллография",
      text: "Изменение диаметра зрачка используется как маркер когнитивной нагрузки и автономной нервной активности."
    },
    {
      icon: "brain",
      title: "Стресс-индикаторы",
      text: "Снижение стабильности диаметра зрачка коррелирует с повышенным уровнем умственной нагрузки."
    },
    {
      icon: "wave",
      title: "Реакция зрачка",
      text: "Латентный период реакции зрачка составляет 200–500 мс в нормальных условиях освещения."
    },
    {
      icon: "chart",
      title: "Вариабельность сигнала",
      text: "Высокая вариабельность диаметра может указывать на усталость или снижение концентрации."
    },
    {
      icon: "eye",
      title: "Eye-tracking анализ",
      text: "Компьютерное зрение позволяет выделять зрачок даже при частичных перекрытиях века."
    },
    {
      icon: "light",
      title: "Фотопупиллярный рефлекс",
      text: "Зрачок сужается в ответ на световой стимул для регулирования светового потока."
    }
  ]

  return [...dataset]
    .sort(() => 0.5 - Math.random())
    .slice(0, 3)
}

export default function Home() {
  const navigate = useNavigate()
  const cards = generateCards()

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#2b2b2b",
      color: "white",
      fontFamily: "Arial"
    }}>

      <div style={{
        width: "100%",
        maxWidth: "1450px",
        margin: "0 auto",
        padding: "90px 55px"
      }}>

        {/* HERO */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1.3fr 1fr",
          gap: "70px",
          alignItems: "stretch"
        }}>

          {/* LEFT */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center"
          }}>

            <h1 style={{
              fontSize: "68px",
              marginBottom: "28px",
              lineHeight: "1.12",
              fontWeight: "700",
              maxWidth: "900px"
            }}>
              Анализ реакции зрачка
              <br />
              в реальном времени
            </h1>

            <p style={{
              color: "#d0d0d0",
              fontSize: "25px",
              lineHeight: "1.9",
              marginBottom: "42px",
              maxWidth: "850px"
            }}>
              Система компьютерного зрения для анализа динамики диаметра
              зрачка, используемая для оценки когнитивной нагрузки,
              уровня стресса и физиологической реакции человека.
            </p>

            {/* BUTTONS WITH ANIMATION */}
            <div style={{ display: "flex", gap: "18px" }}>

              <button
                onClick={() => navigate("/analyze")}
                style={{
                  background: "linear-gradient(135deg, #7CFFB2, #56d98f)",
                  border: "none",
                  padding: "18px 30px",
                  borderRadius: "16px",
                  fontWeight: "700",
                  cursor: "pointer",
                  fontSize: "18px",
                  color: "#0b0b0b",
                  boxShadow: "0 0 24px rgba(124,255,178,0.25)",
                  transition: "all 0.25s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px) scale(1.03)"
                  e.currentTarget.style.boxShadow = "0 0 40px rgba(124,255,178,0.35)"
                  e.currentTarget.style.filter = "brightness(1.05)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0) scale(1)"
                  e.currentTarget.style.boxShadow = "0 0 24px rgba(124,255,178,0.25)"
                  e.currentTarget.style.filter = "brightness(1)"
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = "translateY(0) scale(0.98)"
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px) scale(1.03)"
                }}
              >
                Начать анализ
              </button>

              <button
                onClick={() => navigate("/stats")}
                style={{
                  backgroundColor: "#1f1f1f",
                  border: "1px solid #343434",
                  padding: "18px 30px",
                  borderRadius: "16px",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: "18px",
                  fontWeight: "600",
                  transition: "all 0.25s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)"
                  e.currentTarget.style.border = "1px solid rgba(124,255,178,0.35)"
                  e.currentTarget.style.boxShadow = "0 0 25px rgba(0,0,0,0.25)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)"
                  e.currentTarget.style.border = "1px solid #343434"
                  e.currentTarget.style.boxShadow = "none"
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = "translateY(0) scale(0.98)"
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)"
                }}
              >
                Статистика
              </button>

            </div>

          </div>

          {/* RIGHT */}
          <div style={{
            backgroundColor: "#1f1f1f",
            border: "1px solid #333",
            borderRadius: "26px",
            padding: "26px",
            minHeight: "500px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxShadow: "0 0 45px rgba(0,0,0,0.25)"
          }}>

            <div style={{
              height: "290px",
              borderRadius: "18px",
              border: "1px solid #2f2f2f",
              overflow: "hidden",
              backgroundColor: "#000",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <img
                src="https://i.pinimg.com/736x/92/bd/1b/92bd1b7b50746c6c3f5f179425977eca.jpg"
                alt="Pupillometry"
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain"
                }}
              />
            </div>

            <div style={{ marginTop: "22px" }}>
              <div style={{
                fontSize: "28px",
                fontWeight: "700",
                color: "#7CFFB2",
                marginBottom: "16px"
              }}>
                Научная основа метода
              </div>

              <div style={{
                fontSize: "18px",
                color: "#c7c7c7",
                lineHeight: "1.9"
              }}>
                Исследования зрачкового рефлекса активно развивались
                начиная с <b>1960-х годов</b>. Вклад внесли
                <b> Hess & Polt (1964)</b>,
                <b> Beatty (1966)</b>,
                <b> Kahneman (1973)</b> и
                <b> Steinhauer (1983–2000)</b>.
              </div>
            </div>

          </div>
        </div>

        {/* CARDS */}
        <div style={{
          marginTop: "110px",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "28px"
        }}>

          {cards.map((c, i) => (
            <div
              key={i}
              style={{
                backgroundColor: "#1f1f1f",
                border: "1px solid #313131",
                borderRadius: "20px",
                padding: "34px",
                minHeight: "240px",
                cursor: "pointer",
                transition: "all 0.25s ease",
                boxShadow: "0 0 18px rgba(0,0,0,0.15)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-6px) scale(1.02)"
                e.currentTarget.style.boxShadow = "0 0 30px rgba(124,255,178,0.15)"
                e.currentTarget.style.border = "1px solid rgba(124,255,178,0.35)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0) scale(1)"
                e.currentTarget.style.boxShadow = "0 0 18px rgba(0,0,0,0.15)"
                e.currentTarget.style.border = "1px solid #313131"
              }}
            >

              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                marginBottom: "18px"
              }}>
                <div style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "14px",
                  backgroundColor: "#111",
                  border: "1px solid #2f2f2f",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <Icon type={c.icon} />
                </div>

                <h3 style={{
                  fontSize: "24px",
                  color: "#7CFFB2",
                  fontWeight: "700",
                  margin: 0
                }}>
                  {c.title}
                </h3>
              </div>

              <p style={{
                fontSize: "18px",
                lineHeight: "1.9",
                color: "#cfcfcf"
              }}>
                {c.text}
              </p>

            </div>
          ))}

        </div>

                  {/* FOOTER */}
        <div style={{
          marginTop: "110px",
          paddingTop: "38px",
          borderTop: "1px solid #333",
          fontSize: "18px",
          color: "#a8a8a8",
          lineHeight: "1.9"
        }}>
          Система разработана как инструмент анализа физиологических
          реакций человека с использованием методов компьютерного зрения.
        </div>
      </div>
    </div>
  )
}