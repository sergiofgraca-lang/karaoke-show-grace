import { useState } from "react"

export default function Salvar() {
  const [titulo, setTitulo] = useState("")
  const [videoId, setVideoId] = useState("")
  const [cantor, setCantor] = useState("")

  const API = "https://karaoke-show-grace-backend-production.up.railway.app"

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

      const data = await res.json()
      console.log(data)

      if (data.status === "ok") {
        alert("Música salva!")
        setTitulo("")
        setVideoId("")
        setCantor("")
      }

    } catch (err) {
      console.error(err)
      alert("Erro ao salvar")
    }
  }

  return (
    <div style={{ color: "#fff", padding: 20 }}>
      <h2>Salvar Música</h2>

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