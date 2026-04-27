const salvar = async () => {
  try {
    const API = "https://karaoke-show-grace-backend-production.up.railway.app"

    const res = await fetch(`${API}/api/salvar/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        titulo: "teste",
        videoId: "123",
        cantor: "teste"
      })
    })

    const data = await res.json()
    console.log(data)

  } catch (err) {
    console.error(err)
    alert("erro no salvar")
  }
}