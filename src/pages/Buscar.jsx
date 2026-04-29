import { useState } from "react"
import { useNavigate } from "react-router-dom"

function Buscar() {
  const [busca, setBusca] = useState("")
  const [videos, setVideos] = useState([])

  const navigate = useNavigate()
  const API_KEY = import.meta.env.VITE_YOUTUBE_KEY

  async function buscarMusica() {
    if (!busca) return

    try {
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${busca}+karaoke&type=video&maxResults=10&key=${API_KEY}`

      const res = await fetch(url)
      const data = await res.json()

      // 🔥 FILTRA só vídeos válidos
      const filtrados = (data.items || []).filter(
        (v) => v.id && v.id.videoId
      )

      setVideos(filtrados)
    } catch (err) {
      console.error(err)
      alert("Erro ao buscar no YouTube")
    }
  }

  function abrir(videoId, titulo) {
    if (!videoId) return

    navigate(`/player/${videoId}`, {
      state: { musica: titulo }
    })
  }

  return (
    <div style={{ padding: "20px", textAlign: "center", color: "#fff" }}>

      <button onClick={() => navigate("/")}>
        ⬅ Voltar
      </button>

      <h1>🔎 Buscar Música</h1>

      <input
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Digite a música"
        style={{ padding: "10px", width: "70%" }}
      />

      <br /><br />

      <button onClick={buscarMusica}>
        Buscar
      </button>

      <div style={{ marginTop: "20px" }}>
        {videos.map(v => (
          <div
            key={v.id.videoId}
            onClick={() => abrir(v.id.videoId, v.snippet.title)}
            style={{ cursor: "pointer", marginBottom: "15px" }}
          >
            <img src={v.snippet.thumbnails.medium.url} width="120" />
            <p>{v.snippet.title}</p>
          </div>
        ))}
      </div>

    </div>
  )
}

export default Buscar