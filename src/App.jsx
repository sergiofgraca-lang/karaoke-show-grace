import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"

import Home from "./pages/Home"
import Musicas from "./pages/Musicas"
import Player from "./pages/Player"
import Buscar from "./pages/Buscar"
import Login from "./pages/Login"
import Playlist from "./pages/Playlist" // ✅ IMPORT NO LUGAR CERTO

const estiloApp = {
  backgroundColor: "#0f0f0f",
  minHeight: "100vh",
  color: "#fff",
  fontFamily: "Arial"
}

// 🔒 ROTA PRIVADA
function RotaPrivada({ children }) {
  const logado = localStorage.getItem("logado")
  return logado === "true" ? children : <Navigate to="/login" />
}

function App() {
  return (
    <div style={estiloApp}>
      <BrowserRouter>
        <Routes>

          {/* 🔓 pública */}
          <Route path="/login" element={<Login />} />

          {/* 🔒 privadas */}
          <Route path="/" element={
            <RotaPrivada>
              <Home />
            </RotaPrivada>
          } />

          <Route path="/musicas" element={
            <RotaPrivada>
              <Musicas />
            </RotaPrivada>
          } />

          <Route path="/player" element={
            <RotaPrivada>
              <Player />
            </RotaPrivada>
          } />

          <Route path="/buscar" element={
            <RotaPrivada>
              <Buscar />
            </RotaPrivada>
          } />

          {/* 🎶 NOVA ROTA PLAYLIST (AGORA NO LUGAR CERTO) */}
          <Route path="/playlist" element={
            <RotaPrivada>
              <Playlist />
            </RotaPrivada>
          } />

        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App