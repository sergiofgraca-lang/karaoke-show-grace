import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

function Ranking() {
  const [dados, setDados] = useState([])
  const navigate = useNavigate()

 const API = import.meta.env.VITE_API_URL

  useEffect(() => {
    async function carregar() {
      try {
        const res = await fetch(`${API}/api/ranking/`)
        const data = await res.json()
        setDados(data)
      } catch (err) {
        alert("Erro ao carregar ranking")
      }
    }

    carregar()
  }, [])

  const top3 = dados.slice(0, 3)
  const resto = dados.slice(3)

  return (
    <div style={{
      padding: "20px",
      color: "#fff",
      textAlign: "center"
    }}>

      <button onClick={() => navigate("/")}>
        ⬅ Voltar
      </button>

      <h1 style={{ marginTop: "10px" }}>
        🏆 Ranking
      </h1>

      {/* 🥇 TOP 3 */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-end",
        gap: "15px",
        marginTop: "30px"
      }}>

        {top3[1] && (
          <div style={cardPrata}>
            🥈<br />
            <strong>{top3[1].cantor}</strong><br />
            {top3[1].total} músicas
          </div>
        )}

        {top3[0] && (
          <div style={cardOuro}>
            🥇<br />
            <strong>{top3[0].cantor}</strong><br />
            {top3[0].total} músicas
          </div>
        )}

        {top3[2] && (
          <div style={cardBronze}>
            🥉<br />
            <strong>{top3[2].cantor}</strong><br />
            {top3[2].total} músicas
          </div>
        )}

      </div>

      {/* 📋 RESTO */}
      <div style={{ marginTop: "30px" }}>
        {resto.map((item, i) => (
          <div key={i} style={{
            background: "#1e1e1e",
            padding: "12px",
            margin: "8px auto",
            borderRadius: "10px",
            maxWidth: "300px",
            display: "flex",
            justifyContent: "space-between"
          }}>
            <span>#{i + 4} {item.cantor}</span>
            <span>{item.total} 🎶</span>
          </div>
        ))}
      </div>

    </div>
  )
}

// 🎨 ESTILOS TOP 3

const baseCard = {
  padding: "15px",
  borderRadius: "12px",
  width: "100px",
  fontWeight: "bold",
  boxShadow: "0 0 15px rgba(0,0,0,0.6)"
}

const cardOuro = {
  ...baseCard,
  background: "linear-gradient(135deg, gold, orange)",
  height: "140px",
  fontSize: "16px"
}

const cardPrata = {
  ...baseCard,
  background: "linear-gradient(135deg, #ccc, #888)",
  height: "120px"
}

const cardBronze = {
  ...baseCard,
  background: "linear-gradient(135deg, #cd7f32, #8b4513)",
  height: "110px"
}

export default Ranking