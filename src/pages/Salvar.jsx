import { useState } from "react"

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
      alert("Erro ao conectar com servidor")
    }
  }

  return (
    <div style={{ color: "#fff", padding: 20 }}>
      <h2>🎵 Salvar Música</h2>

      <input
        placeholder="Título"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
      />

      <input
        placeholder="Video ID"
        value={videoId}
        onChange={(e) => setVideoId(e.target.value)}
      />

      <input
        placeholder="Cantor"
        value={cantor}
        onChange={(e) => setCantor(e.target.value)}
      />

      <button onClick={salvar}>
        Salvar
      </button>
    </div>
  )
}