import { useNavigate, useLocation } from "react-router-dom"

export default function Navbar() {

  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  const linkStyle = (active) => ({
    color: active ? "#7CFFB2" : "#d7d7d7",
    fontSize: "17px",
    fontWeight: active ? "700" : "500",
    padding: "12px 18px",
    borderRadius: "14px",
    cursor: "pointer",
    background: active
      ? "linear-gradient(135deg, rgba(124,255,178,0.18), rgba(124,255,178,0.08))"
      : "transparent",
    border: active
      ? "1px solid rgba(124,255,178,0.35)"
      : "1px solid transparent",
    transition: "all 0.25s ease",
    boxShadow: active
      ? "0 0 24px rgba(124,255,178,0.15)"
      : "none",
    transform: "translateY(0)"
  })

  return (
    <div style={{
      backgroundColor: "rgba(16,16,16,0.85)",
      borderBottom: "1px solid #232323",
      padding: "18px 42px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      zIndex: 1000,
      backdropFilter: "blur(14px)"
    }}>

      {/* LOGO */}
      <div
        onClick={() => navigate("/")}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          cursor: "pointer",
          transition: "0.25s ease"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.03)"
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)"
        }}
      >

        <div style={{
          width: "14px",
          height: "14px",
          borderRadius: "50%",
          backgroundColor: "#7CFFB2",
          boxShadow: "0 0 18px #7CFFB2"
        }} />

        <div style={{
          fontSize: "24px",
          fontWeight: "700",
          color: "#ffffff",
          letterSpacing: "0.6px"
        }}>
          Пупиллометрия
        </div>

      </div>

      {/* NAVIGATION */}
      <div style={{
        display: "flex",
        gap: "10px",
        backgroundColor: "#181818",
        padding: "7px",
        borderRadius: "16px",
        border: "1px solid #2a2a2a",
        boxShadow: "0 0 30px rgba(0,0,0,0.25)"
      }}>

        {[
          { path: "/", label: "Главная" },
          { path: "/analyze", label: "Анализ" },
          { path: "/stats", label: "Статистика" }
        ].map((item) => (
          <div
            key={item.path}
            onClick={() => navigate(item.path)}
            style={linkStyle(isActive(item.path))}
            onMouseEnter={(e) => {
              if (!isActive(item.path)) {
                e.currentTarget.style.transform = "translateY(-2px)"
                e.currentTarget.style.background = "rgba(124,255,178,0.08)"
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive(item.path)) {
                e.currentTarget.style.transform = "translateY(0)"
                e.currentTarget.style.background = "transparent"
              }
            }}
          >
            {item.label}
          </div>
        ))}

      </div>

      {/* LOGIN BUTTON */}
      <button
        style={{
          background: "linear-gradient(135deg, #7CFFB2, #54d98c)",
          border: "none",
          padding: "12px 20px",
          borderRadius: "14px",
          fontWeight: "700",
          fontSize: "15px",
          cursor: "pointer",
          color: "#0b0b0b",
          boxShadow: "0 0 24px rgba(124,255,178,0.25)",
          transition: "all 0.25s ease"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-3px) scale(1.03)"
          e.currentTarget.style.boxShadow = "0 0 40px rgba(124,255,178,0.35)"
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0) scale(1)"
          e.currentTarget.style.boxShadow = "0 0 24px rgba(124,255,178,0.25)"
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.transform = "scale(0.98)"
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = "translateY(-3px) scale(1.03)"
        }}
      >
        Вход
      </button>

    </div>
  )
}