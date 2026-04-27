import { useState } from "react"
import { useNavigate } from "react-router-dom"

function Login() {
  const [usuario, setUsuario] = useState("")
  const [senha, setSenha] = useState("")
  const navigate = useNavigate()

  const API = "https://karaoke-show-grace-backend-production.up.railway.app"

  const entrar = async () => {
    try {
      const res = await fetch(`${API}/api/token/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: usuario,
          password: senha
        })
      })

      const data = await res.json()

      console.log("STATUS:", res.status)
      console.log("RESPONSE:", data)

      if (res.ok && data.access) {
        localStorage.setItem("token", data.access)
        navigate("/")
      } else {
        alert("Login inválido: " + JSON.stringify(data))
      }

    } catch (err) {
      console.error(err)
      alert("Erro ao conectar com servidor")
    }
  }

  return (
    <div style={container}>
      <div style={card}>
        <h1 style={titulo}>🎤 Karaoke Show Grace</h1>
        <h2 style={subtitulo}>Conecte-se</h2>

        <input
          type="text"
          placeholder="Usuário"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          style={input}
        />

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          style={input}
        />

        <button onClick={entrar} style={botao}>
          Entrar
        </button>
      </div>
    </div>
  )
}

export default Login

const container = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
  backgroundImage: "url('https://images.unsplash.com/photo-1514525253161-7a46d19cd819')",
  backgroundSize: "cover",
  backgroundPosition: "center"
}

const card = {
  backgroundColor: "rgba(0,0,0,0.85)",
  padding: "40px",
  borderRadius: "12px",
  textAlign: "center",
  boxShadow: "0 0 20px rgba(0,0,0,0.5)"
}

const titulo = {
  color: "#ff0000",
  marginBottom: "10px"
}

const subtitulo = {
  color: "#fff",
  marginBottom: "20px"
}

const input = {
  display: "block",
  width: "250px",
  padding: "10px",
  margin: "10px auto",
  borderRadius: "8px",
  border: "none",
  outline: "none"
}

const botao = {
  marginTop: "15px",
  padding: "10px 20px",
  borderRadius: "8px",
  border: "none",
  backgroundColor: "#ff0000",
  color: "#fff",
  cursor: "pointer"
}