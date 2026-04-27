import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

function Playlist() {
  const [musicas, setMusicas] = useState([])
  const navigate = useNavigate()

  const API = import.meta.env.VITE_API_URL

  useEffect(() => {
    async function carregar() {
      try {
        const token = localStorage.getItem("token")

        const res = await fetch(`${API}/api/listar/`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        if (!res.ok) {
          throw new Error("Erro na requisição")
        }

        const data = await res.json()
        setMusicas(data)

      } catch (err) {
        console.error(err)
        alert("Erro ao carregar playlist")
      }
    }

    carregar()
  }, [API])

  async function deletar(id) {
    const confirmar = confirm("Excluir música?")
    if (!confirmar) return

    try {
      const token = localStorage.getItem("token")

      const res = await fetch(`${API}/api/deletar/${id}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!res.ok) {
        throw new Error("Erro ao deletar")
      }

      setMusicas(prev => prev.filter(m => m.id !== id))

    } catch (err) {
      console.error(err)
      alert("Erro ao excluir")
    }
  }

  return (
    <div style={{
      padding: "20px",
      color: "#fff"
    }}>

      <button 
        onClick={() => navigate("/")}
        style={{
          marginBottom: "20px",
          padding: "8px 15px",
          borderRadius: "6px",
          border: "none",
          background: "#444",
          color: "#fff",
          cursor: "pointer"
        }}
      >
        ⬅ Voltar
      </button>

      <h2>🎶 Playlist</h2>

      {musicas.length === 0 && <p>Nenhuma música ainda</p>}

      {musicas.map((m) => (
        <div key={m.id} style={{
          background: "#222",
          padding: "15px",
          margin: "15px 0",
          borderRadius: "10px"
        }}>

          <strong style={{ fontSize: "16px" }}>
            {m.titulo}
          </strong>

          <p style={{ margin: "5px 0", color: "#ccc" }}>
            🎤 {m.cantor}
          </p>

          <button
            onClick={() => deletar(m.id)}
            style={{
              marginTop: "10px",
              padding: "6px 12px",
              background: "#d32f2f",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer"
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