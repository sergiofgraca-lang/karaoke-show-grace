export default function Salvar() {
  return (
    <div style={{ color: "#fff", padding: 20 }}>
      <h2>Salvar Música</h2>
    </div>
  )
}import { useState } from "react"

export default function Salvar() {
  const [titulo, setTitulo] = useState("")
  const [videoId, setVideoId] = useState("")
  const [cantor, setCantor] = useState("")

  const API = import.meta.env.VITE_API_URL || "https://karaoke-show-grace-backend-production.up.railway.app"

  const salvar = async () => {
    try {
      const res = await fetch(`${API}/api/salvar/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          titulo,
          videoId,
          cantor
        })
      })

      if (!res.ok) {
        throw new Error("Erro ao salvar")
      }

      alert("Música salva com sucesso!")

      setTitulo("")
      setVideoId("")
      setCantor("")

    } catch (err) {
      console.error(err)
      alert("Erro ao conectar no servidor")
    }
  }

  return (
    <div style={{ color: "#fff", padding: 20 }}>
      <h2>🎵 Salvar Música</h2>

      <input
        placeholder="Título"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        style={{ display: "block", margin: 10 }}
      />

      <input
        placeholder="Video ID (YouTube)"
        value={videoId}
        onChange={(e) => setVideoId(e.target.value)}
        style={{ display: "block", margin: 10 }}
      />

      <input
        placeholder="Cantor"
        value={cantor}
        onChange={(e) => setCantor(e.target.value)}
        style={{ display: "block", margin: 10 }}
      />

      <button onClick={salvar}>
        Salvar
      </button>
    </div>
  )
}