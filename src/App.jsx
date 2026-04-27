import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"

import Home from "./pages/Home"
import Player from "./pages/Player"
import Buscar from "./pages/Buscar"
import Login from "./pages/Login"
import Playlist from "./pages/Playlist"
import Ranking from "./pages/Ranking"

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
    <div style={estiloApp}>
      <BrowserRouter>
        <Routes>

          <Route path="/login" element={<Login />} />

          <Route path="/" element={
            <RotaPrivada><Home /></RotaPrivada>
          } />

          <Route path="/player" element={
            <RotaPrivada><Player /></RotaPrivada>
          } />

          <Route path="/buscar" element={
            <RotaPrivada><Buscar /></RotaPrivada>
          } />

          <Route path="/playlist" element={
            <RotaPrivada><Playlist /></RotaPrivada>
          } />

          <Route path="/ranking" element={
            <RotaPrivada><Ranking /></RotaPrivada>
          } />

        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App