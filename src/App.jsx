import Home from "./pages/Home"
import Playlist from "./pages/Playlist"
import Player from "./pages/Player"
import Salvar from "./pages/Salvar"

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/playlist" element={<Playlist />} />
      <Route path="/player/:videoId" element={<Player />} />
      <Route path="/salvar" element={<Salvar />} />
    </Routes>
  )
}


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

         

        </Routes>

      </div>
    </BrowserRouter>
  )
}

export default App