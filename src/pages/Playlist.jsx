import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

function Playlist() {
  const [musicas, setMusicas] = useState([])
  const navigate = useNavigate()

  const API =
    import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL !== "undefined"
      ? import.meta.env.VITE_API_URL
      : "http://127.0.0.1:8000"

  const carregarMusicas = async () => {
    try {
      const res = await fetch(`${API}/api/listar/`)

      if (!res.ok) {
        throw new Error("Erro ao buscar músicas")
      }

      const data = await res.json()
      setMusicas(data)

    } catch (err) {
      console.error(err)
      alert("Erro ao carregar playlist")
    }
  }

  useEffect(() => {
    carregarMusicas()
  }, [])

  const deletar = async (id) => {
    const confirmar = confirm("Excluir música?")
    if (!confirmar) return

    try {
      const res = await fetch(`${API}/api/deletar/${id}/`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        }
      })

      if (!res.ok) {
        throw new Error("Erro ao deletar")
      }

      setMusicas(prev => prev.filter(m => m.id !== id))

    } catch (err) {
      console.error(err)
      alert("Erro ao excluir música")
    }
  }

  return (
    <div style={{ padding: "20px", color: "#fff" }}>

      <button onClick={() => navigate("/")}>
        ⬅ Voltar
      </button>

      <h2>🎶 Playlist</h2>

      {musicas.length === 0 && <p>Nenhuma música ainda</p>}

      {musicas.map((m) => (
        <div key={m.id} style={{
          background: "#222",
          padding: "10px",
          margin: "10px 0",
          borderRadius: "8px"
        }}>
          <strong>{m.titulo}</strong><br />
          🎤 {m.cantor}

          <button
            onClick={() => deletar(m.id)}
            style={{
              marginTop: "8px",
              background: "red",
              color: "#fff",
              border: "none",
              padding: "5px 10px",
              borderRadius: "5px"
            }}
          >
            🗑 Excluir
          </button>
        </div>
      ))}
    </div>
  )
}

export default Playlist