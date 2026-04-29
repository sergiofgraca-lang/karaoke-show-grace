const API_KEY = "SUA_CHAVE_AQUI"

async function buscarMusica() {
  if (!busca) return

  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${busca}+karaoke&type=video&maxResults=10&key=${API_KEY}`

    const res = await fetch(url)
    const data = await res.json()

    console.log("YOUTUBE:", data)

    if (!data.items) {
      alert("Erro na busca")
      return
    }

    setVideos(data.items)

  } catch (err) {
    console.error(err)
    alert("Erro ao buscar")
  }
}