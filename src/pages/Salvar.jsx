import { useState } from "react"

export default function Salvar() {
  const [titulo, setTitulo] = useState("")
  const [videoId, setVideoId] = useState("")
  const [cantor, setCantor] = useState("")

  const API = import.meta.env.VITE_API_URL

  const salvar = async () => {
    try {
      const token = localStorage.getItem("token")

      const res = await fetch(`${API}/salvar/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          titulo,
          videoId,
          cantor,
        }),
      })

      console.log("STATUS:", res.status)

      const data = await res.json()

      console.log("RESPOSTA:", data)

      if (res.ok) {
        alert("Música salva!")

        setTitulo("")
        setVideoId("")
        setCantor("")
      } else {
        alert("Erro ao salvar")
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

      <br /><br />

      <input
        placeholder="Video ID"
        value={videoId}
        onChange={(e) => setVideoId(e.target.value)}
      />

      <br /><br />

      <input
        placeholder="Cantor"
        value={cantor}
        onChange={(e) => setCantor(e.target.value)}
      />

      <br /><br />

      <button onClick={salvar}>
        Salvar
      </button>
    </div>
  )
}

