import { useState } from "react"
import { useNavigate } from "react-router-dom"

function Login() {
  const [usuario, setUsuario] = useState("")
  const [senha, setSenha] = useState("")
  const navigate = useNavigate()

  const entrar = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          usuario: usuario,
          senha: senha
        })
      })

      const data = await res.json()

      if (data.status === "ok") {
        localStorage.setItem("logado", "true")
        navigate("/")
      } else {
        alert("Usuário ou senha inválidos")
      }

    } catch (err) {
      console.error(err)
      alert("Erro ao conectar com o servidor")
    }
  }

  return (
    <div style={container}>
      <div style={card}>
        <h2 style={titulo}>🔐 Login</h2>
        <h1 style={titulo}>🎤 Karaoke Show Grace</h1>

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
  backgroundColor: "rgba(0,0,0,0.8)",
  padding: "40px",
  borderRadius: "12px",
  textAlign: "center"
}

const titulo = {
  color: "#fff",
  marginBottom: "20px"
}

const input = {
  display: "block",
  width: "250px",
  padding: "10px",
  margin: "10px auto",
  borderRadius: "8px",
  border: "none"
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