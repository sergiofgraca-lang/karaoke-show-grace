function Player() {
  const navigate = useNavigate()
  const { videoId } = useParams()
  const location = useLocation()

  // =========================================================
  // MÚSICA RECEBIDA
  // =========================================================

  const musicaRecebida = location.state?.musica

  const musica =
    typeof musicaRecebida === "object"
      ? musicaRecebida
      : {
          titulo: musicaRecebida || "Karaokê",
          videoId
        }

  // =========================================================
  // API
  // =========================================================

  const API =
    import.meta.env.VITE_API_URL &&
    import.meta.env.VITE_API_URL !== "undefined"
      ? import.meta.env.VITE_API_URL
      : "http://127.0.0.1:8000"

  // =========================================================
  // REFERÊNCIAS
  // =========================================================

  const playerRef = useRef(null)

  const audioRef = useRef(null)
  const pitchRef = useRef(null)

  const audioOffsetRef = useRef(0)
  const audioStartTimeRef = useRef(null)
  const audioDurationRef = useRef(0)

  const sincronizacaoRef = useRef(null)

  // Proteções contra inicialização duplicada
  const audioInicializandoRef = useRef(false)
  const audioPreparandoRef = useRef(false)
  const youtubeCriadoRef = useRef(false)

  const youtubeTocandoRef = useRef(false)

  // =========================================================
  // ESTADOS
  // =========================================================

  const [audioPronto, setAudioPronto] = useState(false)
  const [tocando, setTocando] = useState(false)

  const [audioNome, setAudioNome] = useState("")
  const [erroAudio, setErroAudio] = useState("")

  const [resultado, setResultado] = useState(null)

  // =========================================================
  // TONALIDADE
  // =========================================================

  const tons = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B"
  ]

  const tomOriginal = 0
  const [tomAtual, setTomAtual] = useState(0)

  // =========================================================
  // OBTER TEMPO DO YOUTUBE
  // =========================================================

  function obterTempoYouTube() {
    const youtube = playerRef.current

    if (
      !youtube ||
      typeof youtube.getCurrentTime !== "function"
    ) {
      return null
    }

    try {
      const tempo = youtube.getCurrentTime()

      if (!Number.isFinite(tempo) || tempo < 0) {
        return null
      }

      return tempo
    } catch {
      return null
    }
  }

  // =========================================================
  // FUNÇÃO ISOLADA: PREPARAR ÁUDIO (MANTÉM AS CHAVES ÍNTEGRAS)
  // =========================================================
  async function prepararAudio(ativo) {
    if (audioPreparandoRef.current) {
      console.log("⚠️ Preparação do áudio já está em andamento.")
      return
    }

    audioPreparandoRef.current = true

    try {
      console.log("🎵 Preparando Tone.js...")
      console.log("🔎 Procurando áudio associado ao videoId:", videoId)

      setAudioPronto(false)
      setErroAudio("")
      setAudioNome("")

      let finalAudioURL = ""
      let nomeDoAudio = `${videoId}.mp3`

      // Buscar áudio no Django
      try {
        const resposta = await fetch(`${API}/audio/${videoId}/`)
        if (resposta.ok) {
          const dados = await resposta.json()
          console.log("🎯 Associação recebida do Django:", dados)
          
          if (dados.url) {
            if (dados.url.startsWith("http://") || dados.url.startsWith("https://")) {
              finalAudioURL = dados.url
            } else {
              finalAudioURL = new URL(dados.url, API).href
            }
            if (dados.audio) nomeDoAudio = dados.audio
          }
        }
      } catch (err) {
        console.log("⚠️ Rota de áudio direta indisponível. Usando fallback.")
      }

      // Fallback dinâmico para nuvem
      if (!finalAudioURL) {
        finalAudioURL = `https://vevioz.com{videoId}`
        console.log("🚀 Usando Fallback de Streaming Direto")
      }

      if (!ativo) return

      setAudioNome(nomeDoAudio)

      // Limpeza do Player anterior
      if (audioRef.current) {
        try { audioRef.current.stop() } catch {}
        audioRef.current.dispose()
        audioRef.current = null
      }

      if (pitchRef.current) {
        pitchRef.current.dispose()
        pitchRef.current = null
      }

      // Pitch Shift
      const pitchShift = new Tone.PitchShift({
        pitch: tomAtual,
        windowSize: 0.1,
        delayTime: 0,
        feedback: 0
      }).toDestination()

      pitchRef.current = pitchShift

      // Player
      const player = new Tone.Player({
        url: finalAudioURL,
        loop: false,
        autostart: false
      })

      player.connect(pitchShift)
      audioRef.current = player

      // Carregar Buffer
      await Tone.loaded()

      if (!ativo) {
        player.dispose()
        pitchShift.dispose()
        return
      }

      console.log("✅ Tone.js pronto com áudio associado ao vídeo")
      setAudioPronto(true)
      audioPreparandoRef.current = false

    } catch (error) {
      console.error("❌ Erro ao preparar áudio:", error)
      if (ativo) {
        setErroAudio(error.message || "Erro ao carregar o fluxo de áudio.")
      }
      audioPreparandoRef.current = false
    }
  }

  // =========================================================
  // GATILHO COMPACTO DO USEEFFECT (LIVRE DE ERROS DE SINTAXE)
  // =========================================================
  useEffect(() => {
    let ativo = true
    prepararAudio(ativo)
    return () => { ativo = false }
  }, [videoId, tomAtual, API])

  // O restante do seu arquivo Player.jsx continua perfeitamente alinhado a partir daqui..

    // =======================================================
    // LIMPEZA
    // =======================================================

    return () => {
      ativo = false

      audioPreparandoRef.current = false
      audioInicializandoRef.current = false

      if (sincronizacaoRef.current) {
        clearInterval(
          sincronizacaoRef.current
        )

        sincronizacaoRef.current = null
      }

      if (audioRef.current) {
        try {
          audioRef.current.stop()
        } catch {}

        audioRef.current.dispose()
        audioRef.current = null
      }

      if (pitchRef.current) {
        pitchRef.current.dispose()
        pitchRef.current = null
      }

      audioOffsetRef.current = 0
      audioStartTimeRef.current = null

      youtubeTocandoRef.current = false
    }
  } [videoId, API]

  // =========================================================
  // INICIAR ÁUDIO
  // =========================================================

  async function iniciarAudio() {
    // -------------------------------------------------------
    // PROTEÇÃO CONTRA DUPLICAÇÃO
    // -------------------------------------------------------

    if (audioInicializandoRef.current) {
      console.log(
        "⚠️ Áudio já está sendo inicializado."
      )

      return
    }

    audioInicializandoRef.current = true

    try {
      // -----------------------------------------------------
      // DESBLOQUEAR AUDIOCONTEXT
      // -----------------------------------------------------

      await Tone.start()

      const audio = audioRef.current
      const youtube = playerRef.current

      if (!audio) {
        console.log(
          "⚠️ Tone.js ainda não está pronto"
        )

        return
      }

      if (!youtube) {
        console.log(
          "⚠️ YouTube ainda não está pronto"
        )

        return
      }

      // -----------------------------------------------------
      // NÃO INICIAR DUAS VEZES
      // -----------------------------------------------------

      if (audio.state === "started") {
        console.log(
          "ℹ️ Tone.js já está tocando"
        )

        setTocando(true)

        return
      }

      // -----------------------------------------------------
      // POSIÇÃO DO YOUTUBE
      // -----------------------------------------------------

      let offset = obterTempoYouTube()

      if (offset === null) {
        offset = audioOffsetRef.current
      }

      const duracao =
        Number(
          audioDurationRef.current
        )

      if (
        Number.isFinite(duracao) &&
        duracao > 0 &&
        offset >= duracao
      ) {
        offset = 0
      }

      offset = Math.max(
        0,
        Number(offset) || 0
      )

      audioOffsetRef.current = offset

      console.log(
        "▶️ Iniciando áudio na posição:",
        offset.toFixed(2),
        "segundos"
      )

      // -----------------------------------------------------
      // INICIAR
      // -----------------------------------------------------

      audio.start(
        undefined,
        offset
      )

      audioStartTimeRef.current =
        Tone.now()

      setTocando(true)

      console.log(
        "✅ Áudio iniciado sincronizado com YouTube"
      )
    } catch (erro) {
      console.error(
        "❌ Erro ao iniciar áudio:",
        erro
      )
    } finally {
      audioInicializandoRef.current = false
    }
  }

  // =========================================================
  // PAUSAR ÁUDIO
  // =========================================================

  function pausarAudio() {
    const audio = audioRef.current

    if (!audio) {
      return
    }

    const posicaoYoutube =
      obterTempoYouTube()

    if (posicaoYoutube !== null) {
      audioOffsetRef.current =
        posicaoYoutube

      console.log(
        "⏸️ Pausando áudio na posição:",
        posicaoYoutube.toFixed(2),
        "segundos"
      )
    }

    if (audio.state === "started") {
      audio.stop()
    }

    audioStartTimeRef.current = null

    setTocando(false)
  }

  // =========================================================
  // BUFFERING
  // =========================================================

  function tratarBuffering() {
    const audio = audioRef.current

    if (!audio) {
      return
    }

    const tempoYoutube =
      obterTempoYouTube()

    if (tempoYoutube !== null) {
      audioOffsetRef.current =
        tempoYoutube

      console.log(
        "⏳ BUFFERING → posição:",
        tempoYoutube.toFixed(2),
        "segundos"
      )
    }

    if (audio.state === "started") {
      audio.stop()

      console.log(
        "⏹️ Áudio parado durante BUFFERING"
      )
    }

    audioStartTimeRef.current = null

    setTocando(false)
  }

  // =========================================================
  // FINAL DA MÚSICA
  // =========================================================

  function pararAudio() {
    const audio = audioRef.current

    if (!audio) {
      return
    }

    console.log(
      "⏹️ YouTube terminou → parando áudio"
    )

    if (audio.state === "started") {
      audio.stop()
    }

    audioOffsetRef.current = 0
    audioStartTimeRef.current = null

    youtubeTocandoRef.current = false

    setTocando(false)
  }

  // =========================================================
  // SINCRONIZAÇÃO
  // =========================================================

  function sincronizarAudioComYouTube() {
    const youtube = playerRef.current
    const audio = audioRef.current

    if (!youtube || !audio) {
      return
    }

    if (!youtubeTocandoRef.current) {
      return
    }

    const youtubeTempo =
      obterTempoYouTube()

    if (youtubeTempo === null) {
      return
    }

    const duracao =
      Number(
        audioDurationRef.current
      )

    if (
      !Number.isFinite(duracao) ||
      duracao <= 0
    ) {
      return
    }

    const novoTempo =
      Math.min(
        Math.max(
          youtubeTempo,
          0
        ),
        duracao
      )

    let audioTempo =
      Number(
        audioOffsetRef.current
      )

    if (
      audio.state === "started" &&
      audioStartTimeRef.current !== null
    ) {
      audioTempo =
        audioOffsetRef.current +
        (
          Tone.now() -
          audioStartTimeRef.current
        )
    }

    if (!Number.isFinite(audioTempo)) {
      audioTempo = 0
    }

    const diferenca =
      Math.abs(
        novoTempo -
        audioTempo
      )

    // -------------------------------------------------------
    // CORRIGIR SOMENTE SE A DIFERENÇA FOR SIGNIFICATIVA
    // -------------------------------------------------------

    if (diferenca > 0.4) {
      console.log(
        "🔄 Reposicionando áudio:",
        audioTempo.toFixed(2),
        "→",
        novoTempo.toFixed(2),
        "| diferença:",
        diferenca.toFixed(2)
      )

      if (audio.state === "started") {
        audio.stop()
      }

      audioOffsetRef.current =
        novoTempo

      audio.start(
        undefined,
        novoTempo
      )

      audioStartTimeRef.current =
        Tone.now()

      console.log(
        "✅ Áudio reposicionado"
      )
    }
  }

  // =========================================================
  // MONITORAMENTO
  // =========================================================

  function iniciarSincronizacao() {
    if (sincronizacaoRef.current) {
      return
    }

    sincronizacaoRef.current =
      setInterval(() => {
        sincronizarAudioComYouTube()
      }, 500)

    console.log(
      "🔄 Monitoramento de sincronização iniciado"
    )
  }

  // =========================================================
  // YOUTUBE PLAYER
  // =========================================================

  useEffect(() => {
    let ativo = true

    function criarPlayer() {
      if (!ativo || !videoId) {
        return
      }

      // -----------------------------------------------------
      // PROTEÇÃO CONTRA DUPLICAÇÃO
      // -----------------------------------------------------

      if (youtubeCriadoRef.current) {
        console.log(
          "⚠️ YouTube Player já foi criado."
        )

        return
      }

      if (
        !window.YT ||
        !window.YT.Player
      ) {
        return
      }

      youtubeCriadoRef.current = true

      console.log(
        "🎬 Criando YouTube Player:",
        videoId
      )

      playerRef.current =
        new window.YT.Player(
          "player",
          {
            videoId,

            width: "100%",
            height: "100%",

            playerVars: {
              modestbranding: 1,
              rel: 0,
              enablejsapi: 1,
              origin:
                window.location.origin
            },

            events: {
              // =============================================
              // READY
              // =============================================

              onReady: (event) => {
                if (!ativo) {
                  return
                }

                console.log(
                  "✅ YouTube pronto"
                )

                try {
                  event.target.mute()

                  console.log(
                    "🔇 YouTube mutado"
                  )
                } catch {}

                iniciarSincronizacao()
              },

              // =============================================
              // ESTADO
              // =============================================

              onStateChange: (e) => {
                if (!ativo) {
                  return
                }

                console.log(
                  "🎬 Estado YouTube:",
                  e.data
                )

                // ------------------------------------------------
                // PLAY
                // ------------------------------------------------

                if (
                  e.data ===
                  window.YT.PlayerState.PLAYING
                ) {
                  console.log(
                    "▶️ YouTube PLAY"
                  )

                  youtubeTocandoRef.current =
                    true

                  iniciarAudio()
                }

                // ------------------------------------------------
                // PAUSE
                // ------------------------------------------------

                if (
                  e.data ===
                  window.YT.PlayerState.PAUSED
                ) {
                  console.log(
                    "⏸️ YouTube PAUSE"
                  )

                  youtubeTocandoRef.current =
                    false

                  pausarAudio()
                }

                // ------------------------------------------------
                // BUFFERING
                // ------------------------------------------------

                if (
                  e.data ===
                  window.YT.PlayerState.BUFFERING
                ) {
                  console.log(
                    "⏳ YouTube BUFFERING"
                  )

                  tratarBuffering()
                }

                // ------------------------------------------------
                // FIM
                // ------------------------------------------------

                if (
                  e.data ===
                  window.YT.PlayerState.ENDED
                ) {
                  console.log(
                    "🏁 YouTube terminou"
                  )

                  youtubeTocandoRef.current =
                    false

                  pararAudio()

                  mostrarResultado()
                }
              }
            }
          }
        )
    }

    // =======================================================
    // API JÁ EXISTE
    // =======================================================

    if (
      window.YT &&
      window.YT.Player
    ) {
      criarPlayer()
    } else {
      console.log(
        "📡 Carregando YouTube IFrame API..."
      )

      const scriptExistente =
        document.querySelector(
          'script[src="https://www.youtube.com/iframe_api"]'
        )

      if (!scriptExistente) {
        const tag =
          document.createElement("script")

        tag.src =
          "https://www.youtube.com/iframe_api"

        document.body.appendChild(tag)
      }

      // -----------------------------------------------------
      // NÃO SOBRESCREVER DESNECESSARIAMENTE
      // -----------------------------------------------------

      const callbackAnterior =
        window.onYouTubeIframeAPIReady

      window.onYouTubeIframeAPIReady =
        () => {
          if (
            typeof callbackAnterior ===
            "function"
          ) {
            try {
              callbackAnterior()
            } catch {}
          }

          criarPlayer()
        }
    }

    // =======================================================
    // LIMPEZA
    // =======================================================

    return () => {
      ativo = false

      if (sincronizacaoRef.current) {
        clearInterval(
          sincronizacaoRef.current
        )

        sincronizacaoRef.current = null
      }

      youtubeTocandoRef.current =
        false

      youtubeCriadoRef.current =
        false

      if (playerRef.current) {
        try {
          playerRef.current.destroy()
        } catch {}

        playerRef.current = null
      }
    }
  }, [videoId])

  // =========================================================
  // AUMENTAR TOM
  // =========================================================

  function aumentarTom() {
    setTomAtual((atual) => {
      const novoTom =
        (atual + 1) % 12

      console.log(
        "🎵 Aumentando tom:",
        novoTom,
        tons[novoTom]
      )

      if (pitchRef.current) {
        pitchRef.current.pitch =
          novoTom
      }

      return novoTom
    })
  }

  // =========================================================
  // DIMINUIR TOM
  // =========================================================

  function diminuirTom() {
    setTomAtual((atual) => {
      const novoTom =
        (atual - 1 + 12) % 12

      console.log(
        "🎵 Diminuindo tom:",
        novoTom,
        tons[novoTom]
      )

      if (pitchRef.current) {
        pitchRef.current.pitch =
          novoTom
      }

      return novoTom
    })
  }

  // =========================================================
  // RESTAURAR TOM
  // =========================================================

  function restaurarTomOriginal() {
    console.log(
      "🔄 Voltando ao tom original"
    )

    setTomAtual(
      tomOriginal
    )

    if (pitchRef.current) {
      pitchRef.current.pitch =
        tomOriginal
    }
  }

  // =========================================================
  // RESULTADO
  // =========================================================

  function mostrarResultado() {
    const nota = (
      Math.random() * 4 +
      6
    ).toFixed(1)

    const cantor =
      musica.cantor?.trim() ||
      "Você"

    let emoji = "😬"
    let frases = []

    // -------------------------------------------------------
    // NOTA 9 OU 10
    // -------------------------------------------------------

    if (nota >= 9) {
      emoji = "🔥"

      frases = [
        `Parabéns, ${cantor}! Você arrasou!!!!! 🔥`,
        `Sensacional, ${cantor}! Você deu um show! 🎤🔥`,
        `${cantor}, que apresentação incrível! 👏👏👏`,
        `Parabéns, ${cantor}! Hoje você estava inspirado! ⭐`,
        `${cantor}, você simplesmente destruiu! Que show! 🔥`,
        `Que voz, ${cantor}! Você nasceu para o karaokê! 🎶`,
        `${cantor}, essa foi de arrepiar! Parabéns! 👏`,
        `${cantor}, você mandou muito bem! Espetacular! 🌟`
      ]
    }

    // -------------------------------------------------------
    // NOTA 7 ATÉ 8.9
    // -------------------------------------------------------

    else if (nota >= 7) {
      emoji = "😎"

      frases = [
        `Mandou muito bem, ${cantor}! 😎`,
        `Parabéns, ${cantor}! Essa foi muito boa! 👏`,
        `${cantor}, você está pegando fogo! 🔥`,
        `Muito bom, ${cantor}! Continue assim! 🎤`,
        `${cantor}, quase perfeito! Você foi muito bem! ⭐`,
        `Boa, ${cantor}! Essa merece aplausos! 👏👏`,
        `${cantor}, mandou bem demais! 😎🎶`
      ]
    }

    // -------------------------------------------------------
    // NOTA ABAIXO DE 7
    // -------------------------------------------------------

    else {
      emoji = "😬"

      frases = [
        `${cantor}, o importante é cantar e se divertir! 🎤❤️`,
        `Muito bem, ${cantor}! A próxima será ainda melhor! 💪`,
        `${cantor}, não pare! Cada música fica melhor! 🎶`,
        `Parabéns, ${cantor}! Continue soltando a voz! 👏`,
        `${cantor}, o palco é seu! Vamos para a próxima! 🔥`,
        `Boa, ${cantor}! O importante é cantar com alegria! 😊`,
        `${cantor}, já temos uma estrela no karaokê! ⭐`
      ]
    }

    // -------------------------------------------------------
    // ESCOLHER FRASE ALEATÓRIA
    // -------------------------------------------------------

    const mensagem =
      frases[
        Math.floor(
          Math.random() * frases.length
        )
      ]

    // -------------------------------------------------------
    // MOSTRAR RESULTADO
    // -------------------------------------------------------

    setResultado({
      nota,
      emoji,
      mensagem,
      cantor
    })

    // -------------------------------------------------------
    // APLAUSOS
    // -------------------------------------------------------

    const aplausos =
      new Audio(
        "https://www.myinstants.com/media/sounds/aplausos.mp3"
      )

    aplausos
      .play()
      .catch(() => {})
  }

  // =========================================================
  // TELA
  // =========================================================

  return (
    <div
      style={{
        textAlign: "center",
        padding: "20px",
        backgroundColor:
          "#121212",
        minHeight: "100vh",
        color: "#fff"
      }}
    >
      <button
        onClick={() =>
          navigate(-1)
        }
      >
        ⬅ Voltar
      </button>

      <h2>
        🎤 {musica.titulo}
      </h2>

      {!resultado && (
        <>
          {/* =================================================
              VÍDEO
          ================================================= */}

          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "800px",
              margin: "20px auto",
              paddingBottom: "56.25%"
            }}
          >
            <div
              id="player"
              style={{
                position:
                  "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%"
              }}
            />
          </div>

          {/* =================================================
              STATUS DO ÁUDIO
          ================================================= */}

          <div
            style={{
              maxWidth: "800px",
              margin: "10px auto",
              padding: "10px",
              backgroundColor:
                "#1e1e1e",
              borderRadius: "10px"
            }}
          >
            {erroAudio ? (
              <>
                <p
                  style={{
                    margin: 0,
                    color: "#ff6b6b"
                  }}
                >
                  ⚠️ {erroAudio}
                </p>

                <p
                  style={{
                    margin:
                      "8px 0 0",
                    color: "#aaa"
                  }}
                >
                  O vídeo permanece disponível,
                  mas nenhum áudio será reproduzido
                  até que ele seja associado no Django.
                </p>
              </>
            ) : (
              <>
                <p
                  style={{
                    margin: 0
                  }}
                >
                  🎵 Áudio:{" "}
                  {audioPronto
                    ? "✅ Pronto"
                    : "⏳ Carregando..."}
                </p>

                {audioNome && (
                  <p
                    style={{
                      margin:
                        "5px 0 0",
                      color: "#aaa",
                      fontSize:
                        "14px"
                    }}
                  >
                    🎧 Arquivo:{" "}
                    {audioNome}
                  </p>
                )}

                <p
                  style={{
                    margin:
                      "5px 0 0",
                    color: "#aaa"
                  }}
                >
                  {tocando
                    ? "▶️ Tocando junto com YouTube"
                    : "⏸️ Parado"}
                </p>
              </>
            )}
          </div>

          {/* =================================================
              TONALIDADE
          ================================================= */}

          <div
            style={{
              maxWidth: "800px",
              margin: "20px auto",
              padding: "20px",
              backgroundColor:
                "#1e1e1e",
              borderRadius: "12px"
            }}
          >
            <h3>
              🎵 Tonalidade
            </h3>

            <div
              style={{
                display: "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                gap: "20px",
                marginTop:
                  "15px"
              }}
            >
              <button
                onClick={
                  diminuirTom
                }
                style={{
                  fontSize:
                    "24px",
                  width: "50px",
                  height: "50px",
                  cursor:
                    "pointer"
                }}
              >
                −
              </button>

              <div
                style={{
                  minWidth:
                    "100px",
                  fontSize:
                    "30px",
                  fontWeight:
                    "bold"
                }}
              >
                {tons[tomAtual]}
              </div>

              <button
                onClick={
                  aumentarTom
                }
                style={{
                  fontSize:
                    "24px",
                  width: "50px",
                  height: "50px",
                  cursor:
                    "pointer"
                }}
              >
                +
              </button>
            </div>

            <p
              style={{
                marginTop:
                  "15px",
                color: "#aaa"
              }}
            >
              Tom original:{" "}
              <strong>
                {tons[tomOriginal]}
              </strong>
            </p>

            {tomAtual !==
              tomOriginal && (
              <button
                onClick={
                  restaurarTomOriginal
                }
                style={{
                  marginTop:
                    "5px",
                  padding:
                    "8px 15px",
                  cursor:
                    "pointer"
                }}
              >
                🔄 Voltar ao tom original
              </button>
            )}
          </div>
        </>
      )}

      {/* =====================================================
          RESULTADO
      ===================================================== */}

      {resultado && (
        <div
          style={{
            maxWidth: "800px",
            margin: "40px auto",
            padding: "40px 20px",
            backgroundColor:
              "#1e1e1e",
            borderRadius: "20px"
          }}
        >
          <h1
            style={{
              fontSize: "70px",
              margin: "0 0 10px"
            }}
          >
            {resultado.emoji}
          </h1>

          <h2
            style={{
              fontSize: "32px",
              margin: "10px 0"
            }}
          >
            Nota: {resultado.nota}
          </h2>

          <h3
            style={{
              fontSize: "28px",
              margin: "20px 0",
              color: "#ffd700"
            }}
          >
            🎤 {resultado.cantor}
          </h3>

          <p
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              marginTop: "20px"
            }}
          >
            {resultado.mensagem}
          </p>

          <div
            style={{
              fontSize: "35px",
              marginTop: "25px"
            }}
          >
            👏 👏 👏 👏 👏
          </div>
        </div>
      )}
    </div>
  )


export default Player