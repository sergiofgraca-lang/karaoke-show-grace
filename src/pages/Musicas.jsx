import { useNavigate } from "react-router-dom"

function Musicas() {
  const navigate = useNavigate()

  const lista = [
    {
      nome: "Evidências - Chitãozinho & Xororó",
      video: "https://www.youtube.com/watch?v=ePjtnSPFWK8"
    },
    {
      nome: "Boate Azul - Bruno & Marrone",
      video: "https://www.youtube.com/watch?v=7JZ8wW6n7hA"
    },
    {
      nome: "Sinônimos - Zé Ramalho",
      video: "https://www.youtube.com/watch?v=FzZ3bR0W4sM"
    },
    {
      nome: "Fio de Cabelo - Chitãozinho & Xororó",
      video: "https://www.youtube.com/watch?v=Q0cQd6bqk8A"
    }
  ]

  function abrirPlayer(musica) {
    navigate("/player", {
      state: {
        musica: musica.nome,
        video: musica.video
      }
    })
  }

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      
      <button
        onClick={() => navigate("/")}
        style={{
          marginBottom: "20px",
          padding: "10px 20px",
          cursor: "pointer"
        }}
      >
        ⬅ Voltar
      </button>

      <h1>🎵 Músicas</h1>

      {lista.map((musica, index) => (
        <div
          key={index}
          onClick={() => abrirPlayer(musica)} // 🔥 AQUI É O SEGREDO
          style={{
            margin: "10px auto",
            padding: "15px",
            border: "1px solid #ccc",
            width: "250px",
            borderRadius: "8px",
            cursor: "pointer"
          }}
        >
          {musica.nome}
        </div>
      ))}
    </div>
  )
}

export default Musicas