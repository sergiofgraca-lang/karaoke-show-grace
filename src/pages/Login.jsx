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
      console.log(data)

      if (data.access) {
        localStorage.setItem("token", data.access)
        navigate("/")
      } else {
        alert("Login inválido")
      }

    } catch (err) {
      console.error(err)
      alert("Erro ao conectar com servidor")
    }
  }

  return (
    <div>
      <h2>Login</h2>

      <input value={usuario} onChange={e => setUsuario(e.target.value)} />
      <input value={senha} onChange={e => setSenha(e.target.value)} type="password" />

      <button onClick={entrar}>Entrar</button>
    </div>
  )
}

export default Login