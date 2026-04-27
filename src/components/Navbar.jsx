import { useNavigate } from "react-router-dom"

function Navbar() {
  const navigate = useNavigate()

  function logout() {
    localStorage.removeItem("token")
    navigate("/login")
  }

  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "10px 20px",
      background: "#1e1e1e",
      marginBottom: "20px"
    }}>
      <h3>🎤 Karaoke Show</h3>

      <button
        onClick={logout}
        style={{
          background: "red",
          color: "#fff",
          border: "none",
          padding: "8px 15px",
          borderRadius: "8px"
        }}
      >
        Sair
      </button>
    </div>
  )
}

export default Navbar