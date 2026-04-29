import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"

import Home from "./pages/Home"
import Player from "./pages/Player"
import Buscar from "./pages/Buscar"
import Login from "./pages/Login"
import Playlist from "./pages/Playlist"
import Ranking from "./pages/Ranking"
import Salvar from "./pages/Salvar"

const estiloApp = {
  backgroundColor: "#121212",
  minHeight: "100vh",
  color: "#fff",
  fontFamily: "Arial"
}

function RotaPrivada({ children }) {
  const token = localStorage.getItem("token")
  return token ? children : <Navigate to="/login" />
}

function App() {
  return (
    <BrowserRouter> {/* 🔥 TEM QUE ENVOLVER TUDO */}
      <div style={estiloApp}>

        <Routes>

          <Route path="/login" element={<Login />} />

          <Route path="/" element={
            <RotaPrivada><Home /></RotaPrivada>
          } />

          <Route path="/buscar" element={
            <RotaPrivada><Buscar /></RotaPrivada>
          } />

          <Route path="/player/:videoId" element={
            <RotaPrivada><Player /></RotaPrivada>
          } />

          <Route path="/playlist" element={
            <RotaPrivada><Playlist /></RotaPrivada>
          } />

          <Route path="/ranking" element={
            <RotaPrivada><Ranking /></RotaPrivada>
          } />

          <Route path="/salvar" element={
            <RotaPrivada><Salvar /></RotaPrivada>
          } />

        </Routes>

      </div>
    </BrowserRouter>
  )
}

export default App