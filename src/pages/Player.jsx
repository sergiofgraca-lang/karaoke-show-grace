import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import * as Tone from "tone";

const API =
  import.meta.env.VITE_API_URL ||
  "https://karaoke-show-grace-backend.vercel.app/api";

const TONS = [
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
  "B",
];

export default function Player() {
  const navigate = useNavigate();
  const { videoId } = useParams();
  const location = useLocation();

  const musica = location.state?.musica || "Karaokê";

  // =========================================================
  // REFS
  // =========================================================

  const playerRef = useRef(null);
  const youtubeRef = useRef(null);

  const audioRef = useRef(null);
  const pitchRef = useRef(null);

  const sincronizacaoRef = useRef(null);

  const youtubeTocandoRef = useRef(false);

  const audioStartTimeRef = useRef(null);
  const audioOffsetRef = useRef(0);
  const audioDurationRef = useRef(0);

  const youtubeApiCarregadaRef = useRef(false);

  // =========================================================
  // STATES
  // =========================================================

  const [audioPronto, setAudioPronto] = useState(false);
  const [audioCarregando, setAudioCarregando] = useState(true);

  const [erroAudio, setErroAudio] = useState("");

  const [audioNome, setAudioNome] = useState("");

  const [tomAtual, setTomAtual] = useState(0);

  const [tocando, setTocando] = useState(false);

  const [resultado, setResultado] = useState(null);

  // =========================================================
  // LIMPAR ÁUDIO
  // =========================================================

  function limparAudio() {
    console.log("🧹 Limpando áudio Tone.js...");

    if (sincronizacaoRef.current) {
      clearInterval(sincronizacaoRef.current);
      sincronizacaoRef.current = null;
    }

    if (audioRef.current) {
      try {
        audioRef.current.stop();
      } catch {}

      try {
        audioRef.current.dispose();
      } catch {}

      audioRef.current = null;
    }

    if (pitchRef.current) {
      try {
        pitchRef.current.dispose();
      } catch {}

      pitchRef.current = null;
    }

    audioStartTimeRef.current = null;
    audioOffsetRef.current = 0;
    audioDurationRef.current = 0;

    setAudioPronto(false);
  }

  // =========================================================
  // PREPARAR ÁUDIO
  // =========================================================

  useEffect(() => {
    let ativo = true;

    async function prepararAudio() {
      try {
        console.log("🎵 Preparando Tone.js...");
        console.log("🔎 Procurando áudio associado ao videoId:", videoId);

        setAudioPronto(false);
        setAudioCarregando(true);
        setErroAudio("");
        setAudioNome("");

        limparAudio();

        // -----------------------------------------------------
        // BUSCAR ÁUDIO NO DJANGO (TRATADO COM TRY/CATCH)
        // -----------------------------------------------------
        let dados = {};
        try {
          const resposta = await fetch(`${API}/audio/${videoId}/`);
          if (resposta.ok) {
            dados = await resposta.json();
            console.log("🎯 Resposta do Django:", dados);
          }
        } catch (fetchErr) {
          console.log("⚠️ Rota de associação do Django offline ou não encontrada. Usando stream direto.");
        }

        if (!ativo) return;

        // -----------------------------------------------------
        // DESCOBRIR URL DO ÁUDIO
        // -----------------------------------------------------

        let finalAudioURL = "";
        let nomeDoAudio = `${videoId}.mp3`;

        if (dados.url) {
          if (
            dados.url.startsWith("http://") ||
            dados.url.startsWith("https://")
          ) {
            finalAudioURL = dados.url;
          } else {
            finalAudioURL = new URL(dados.url, `${API}/`).href;
          }
        }

        if (!finalAudioURL && dados.audio) {
          if (
            dados.audio.startsWith("http://") ||
            dados.audio.startsWith("https://")
          ) {
            finalAudioURL = dados.audio;
          } else {
            finalAudioURL = new URL(dados.audio, `${API}/`).href;
          }
        }

        if (dados.audio) {
          nomeDoAudio = dados.audio;
        }

        // -----------------------------------------------------
        // ATIVAÇÃO DO FALLBACK DO GOOGLE/STREAM PARA A NUVEM
        // -----------------------------------------------------
        if (!finalAudioURL) {
          finalAudioURL = `https://vevioz.com{videoId}`;
          console.log("🚀 Fallback ativado: Streaming direto da nuvem configurado.");
        }

        console.log("🎵 URL final do áudio:", finalAudioURL);
        setAudioNome(nomeDoAudio);

        // -----------------------------------------------------
        // INICIAR TONE
        // -----------------------------------------------------

        console.log("🔊 Criando PitchShift...");

        const pitchShift = new Tone.PitchShift({
          pitch: tomAtual,
          windowSize: 0.1,
          delayTime: 0,
          feedback: 0,
        }).toDestination();

        if (!ativo) {
          pitchShift.dispose();
          return;
        }

        pitchRef.current = pitchShift;

        // -----------------------------------------------------
        // CRIAÇÃO E CARREGAMENTO DO PLAYER
        // -----------------------------------------------------
        console.log("🔊 Inicializando buffer do Tone.Player...");
        const player = new Tone.Player({
          url: finalAudioURL,
          loop: false,
          autostart: false,
          onload: () => {
            if (!ativo) return;
            console.log("✅ Tone.js carregado e pronto para reprodução.");
            setAudioPronto(true);
            setAudioCarregando(false);
          },
          onerror: (err) => {
            console.error("❌ Erro ao carregar buffer do player:", err);
            setErroAudio("Não foi possível processar as frequências de áudio.");
            setAudioCarregando(false);
          }
        }).connect(pitchShift);

        audioRef.current = player;

      } catch (error) {
        console.error("❌ Erro no fluxo de preparação do áudio:", error);
        if (ativo) {
          setErroAudio(error.message || "Erro de inicialização.");
          setAudioCarregando(false);
        }
      }
    }

    prepararAudio();

    return () => {
      ativo = false;
    };
  }, [videoId, tomAtual]);

  // =========================================================
  // INICIAR ÁUDIO
  // =========================================================

  async function iniciarAudio() {
    try {
      if (!audioRef.current) {
        console.log("⚠️ Tone.Player ainda não está pronto.");
        return;
      }

      if (!audioPronto) {
        console.log("⚠️ Áudio ainda está carregando.");
        return;
      }

      const youtube = youtubeRef.current;

      if (!youtube) {
        console.log("⚠️ YouTube Player ainda não está pronto.");
        return;
      }

      // Permissão do navegador para áudio
      await Tone.start();

      const tempoYoutube = youtube.getCurrentTime();

      let offset = tempoYoutube;

      if (
        audioDurationRef.current > 0 &&
        offset >= audioDurationRef.current
      ) {
        offset = 0;
      }

      console.log(
        "▶️ Iniciando Tone.js no tempo:",
        offset.toFixed(2)
      );

      try {
        audioRef.current.stop();
      } catch {}

      audioRef.current.start(undefined, offset);

      audioOffsetRef.current = offset;
      audioStartTimeRef.current = Tone.now();

      setTocando(true);

      iniciarSincronizacao();
    } catch (erro) {
      console.error(
        "❌ Erro ao iniciar áudio:",
        erro
      );
    }
  }

  // =========================================================
  // PAUSAR ÁUDIO
  // =========================================================

  function pausarAudio() {
    try {
      const youtube = youtubeRef.current;

      if (youtube) {
        audioOffsetRef.current =
          youtube.getCurrentTime();
      }

      if (audioRef.current) {
        audioRef.current.stop();
      }

      audioStartTimeRef.current = null;

      setTocando(false);

      console.log(
        "⏸️ Tone.js pausado em:",
        audioOffsetRef.current.toFixed(2)
      );
    } catch (erro) {
      console.error(
        "❌ Erro ao pausar áudio:",
        erro
      );
    }
  }

  // =========================================================
  // PARAR ÁUDIO
  // =========================================================

  function pararAudio() {
    try {
      if (audioRef.current) {
        audioRef.current.stop();
      }

      audioOffsetRef.current = 0;
      audioStartTimeRef.current = null;

      setTocando(false);

      console.log("⏹️ Tone.js parado.");
    } catch (erro) {
      console.error(
        "❌ Erro ao parar áudio:",
        erro
      );
    }
  }

  // =========================================================
  // SINCRONIZAÇÃO YOUTUBE ↔ TONE
  // =========================================================

  function sincronizarAudioComYouTube() {
    const youtube = youtubeRef.current;
    const audio = audioRef.current;

    if (!youtube || !audio) {
      return;
    }

    if (!youtubeTocandoRef.current) {
      return;
    }

    try {
      const tempoYoutube =
        youtube.getCurrentTime();

      let tempoTone = audioOffsetRef.current;

      if (audioStartTimeRef.current !== null) {
        tempoTone =
          audioOffsetRef.current +
          (Tone.now() -
            audioStartTimeRef.current);
      }

      const diferenca =
        Math.abs(tempoYoutube - tempoTone);

      if (diferenca > 0.4) {
        console.log(
          "🔄 Corrigindo sincronização:",
          {
            youtube: tempoYoutube.toFixed(2),
            tone: tempoTone.toFixed(2),
            diferenca: diferenca.toFixed(2),
          }
        );

        try {
          audio.stop();
        } catch {}

        audio.start(
          undefined,
          tempoYoutube
        );

        audioOffsetRef.current =
          tempoYoutube;

        audioStartTimeRef.current =
          Tone.now();
      }
    } catch (erro) {
      console.log(
        "⚠️ Erro na sincronização:",
        erro
      );
    }
  }

  // =========================================================
  // INICIAR SINCRONIZAÇÃO
  // =========================================================

  function iniciarSincronizacao() {
    if (sincronizacaoRef.current) {
      return;
    }

    sincronizacaoRef.current =
      setInterval(() => {
        sincronizarAudioComYouTube();
      }, 500);
  }

  // =========================================================
  // YOUTUBE PLAYER
  // =========================================================

  useEffect(() => {
    let ativo = true;

    function criarYoutubePlayer() {
      if (!ativo) return;

      if (!window.YT || !window.YT.Player) {
        console.log(
          "⏳ YouTube API ainda não carregada..."
        );
        return;
      }

      if (!playerRef.current) {
        console.log(
          "⚠️ Elemento do YouTube ainda não existe."
        );
        return;
      }

      console.log(
        "🎬 Criando YouTube Player:",
        videoId
      );

      try {
        youtubeRef.current =
          new window.YT.Player(
            playerRef.current,
            {
              videoId: videoId,

              playerVars: {
                autoplay: 0,
                controls: 1,
                modestbranding: 1,
                rel: 0,
                enablejsapi: 1,
                origin:
                  window.location.origin,
              },

              events: {
                onReady: (event) => {
                  console.log(
                    "✅ YouTube Player pronto."
                  );

                  // IMPORTANTE:
                  // O áudio original do YouTube fica mudo.
                  event.target.mute();

                  iniciarSincronizacao();
                },

                onStateChange: (event) => {
                  const estado =
                    event.data;

                  // PLAYING
                  if (
                    estado ===
                    window.YT.PlayerState.PLAYING
                  ) {
                    console.log(
                      "▶️ YouTube PLAY → iniciando Tone.js"
                    );

                    youtubeTocandoRef.current =
                      true;

                    setTocando(true);

                    iniciarAudio();
                  }

                  // PAUSED
                  else if (
                    estado ===
                    window.YT.PlayerState.PAUSED
                  ) {
                    console.log(
                      "⏸️ YouTube PAUSE → pausando Tone.js"
                    );

                    youtubeTocandoRef.current =
                      false;

                    pausarAudio();
                  }

                  // BUFFERING
                  else if (
                    estado ===
                    window.YT.PlayerState.BUFFERING
                  ) {
                    console.log(
                      "⏳ YouTube BUFFERING"
                    );

                    // Não paramos o áudio imediatamente.
                    // O controle de sincronização
                    // cuidará da correção.
                  }

                  // ENDED
                  else if (
                    estado ===
                    window.YT.PlayerState.ENDED
                  ) {
                    console.log(
                      "🏁 YouTube ENDED"
                    );

                    youtubeTocandoRef.current =
                      false;

                    pararAudio();

                    mostrarResultado();
                  }
                },
              },
            }
          );
      } catch (erro) {
        console.error(
          "❌ Erro ao criar YouTube Player:",
          erro
        );
      }
    }

    // -------------------------------------------------------
    // API JÁ EXISTE
    // -------------------------------------------------------

    if (
      window.YT &&
      window.YT.Player
    ) {
      youtubeApiCarregadaRef.current =
        true;

      criarYoutubePlayer();
    } else {
      // -----------------------------------------------------
      // CARREGAR API
      // -----------------------------------------------------

      console.log(
        "📡 Carregando YouTube IFrame API..."
      );

      const scriptExistente =
        document.querySelector(
          'script[src="https://www.youtube.com/iframe_api"]'
        );

      const callbackAnterior =
        window.onYouTubeIframeAPIReady;

      window.onYouTubeIframeAPIReady =
        () => {
          console.log(
            "✅ YouTube IFrame API carregada."
          );

          youtubeApiCarregadaRef.current =
            true;

          if (callbackAnterior) {
            try {
              callbackAnterior();
            } catch {}
          }

          criarYoutubePlayer();
        };

      if (!scriptExistente) {
        const script =
          document.createElement(
            "script"
          );

        script.src =
          "https://www.youtube.com/iframe_api";

        script.async = true;

        document.body.appendChild(
          script
        );
      }
    }

    return () => {
      ativo = false;

      youtubeTocandoRef.current =
        false;

      if (sincronizacaoRef.current) {
        clearInterval(
          sincronizacaoRef.current
        );

        sincronizacaoRef.current =
          null;
      }

      if (
        youtubeRef.current &&
        typeof youtubeRef.current.destroy ===
          "function"
      ) {
        try {
          youtubeRef.current.destroy();
        } catch {}
      }

      youtubeRef.current = null;
    };
  }, [videoId]);

  // =========================================================
  // ALTERAR TOM
  // =========================================================

  function aumentarTom() {
    setTomAtual((atual) => {
      const novoTom = atual + 1;

      // Limita entre -12 e +12 semitons
      const valor =
        novoTom > 12
          ? 12
          : novoTom;

      if (pitchRef.current) {
        pitchRef.current.pitch =
          valor;
      }

      console.log(
        "🎵 Tom:",
        TONS[
          ((valor % 12) + 12) % 12
        ],
        "Pitch:",
        valor
      );

      return valor;
    });
  }

  function diminuirTom() {
    setTomAtual((atual) => {
      const novoTom = atual - 1;

      // Limita entre -12 e +12 semitons
      const valor =
        novoTom < -12
          ? -12
          : novoTom;

      if (pitchRef.current) {
        pitchRef.current.pitch =
          valor;
      }

      console.log(
        "🎵 Tom:",
        TONS[
          ((valor % 12) + 12) % 12
        ],
        "Pitch:",
        valor
      );

      return valor;
    });
  }

  // =========================================================
  // TOM VISUAL
  // =========================================================

  const indiceTomVisual =
    ((tomAtual % 12) + 12) % 12;

  const nomeTom =
    TONS[indiceTomVisual];

  // =========================================================
  // RESULTADO
  // =========================================================

  function mostrarResultado() {
    const notas = [
      70,
      75,
      80,
      85,
      88,
      90,
      92,
      95,
      98,
      100,
    ];

    const mensagens = [
      "Mandou muito bem! 🎤",
      "Excelente! 👏",
      "Você arrasou! 🔥",
      "Que voz! 🎶",
      "Foi muito bem! ⭐",
      "Show de bola! 🎉",
    ];

    const nota =
      notas[
        Math.floor(
          Math.random() *
            notas.length
        )
      ];

    const mensagem =
      mensagens[
        Math.floor(
          Math.random() *
            mensagens.length
        )
      ];

    setResultado({
      nota,
      mensagem,
    });

    try {
      const aplausos =
        new Audio(
          "https://www.myinstants.com/media/sounds/aplausos.mp3"
        );

      aplausos.volume = 0.7;

      aplausos
        .play()
        .catch(() => {});
    } catch {}
  }

  // =========================================================
  // SALVAR NA PLAYLIST
  // =========================================================

  async function salvarNaPlaylist() {
    try {
      const cantor = window.prompt(
        "Digite o nome do cantor:",
        ""
      );

      if (!cantor) {
        return;
      }

      const resposta =
        await fetch(
          `${API}/salvar/`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              titulo: musica,
              videoId,
              cantor,
            }),
          }
        );

      const dados =
        await resposta.json();

      console.log(
        "💾 Resposta salvar playlist:",
        dados
      );

      if (!resposta.ok) {
        throw new Error(
          dados.erro ||
            "Erro ao salvar música."
        );
      }

      alert(
        "🎵 Música salva na playlist!"
      );
    } catch (erro) {
      console.error(
        "❌ Erro ao salvar playlist:",
        erro
      );

      alert(
        erro.message ||
          "Erro ao salvar música."
      );
    }
  }

  // =========================================================
  // TELA DE RESULTADO
  // =========================================================

  if (resultado) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #111827, #312e81)",
          color: "#fff",
          padding: "30px",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "42px",
            marginBottom: "10px",
          }}
        >
          🎤 Resultado
        </h1>

        <div
          style={{
            fontSize: "80px",
            fontWeight: "bold",
            margin: "20px",
          }}
        >
          {resultado.nota}
        </div>

        <h2>
          {resultado.mensagem}
        </h2>

        <div
          style={{
            display: "flex",
            gap: "15px",
            marginTop: "30px",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <button
            onClick={() =>
              setResultado(null)
            }
            style={{
              padding:
                "14px 24px",
              fontSize: "18px",
              cursor: "pointer",
            }}
          >
            🎤 Cantar novamente
          </button>

          <button
            onClick={() =>
              navigate(-1)
            }
            style={{
              padding:
                "14px 24px",
              fontSize: "18px",
              cursor: "pointer",
            }}
          >
            ← Voltar
          </button>
        </div>
      </div>
    );
  }

  // =========================================================
  // JSX PRINCIPAL
  // =========================================================

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#111827",
        color: "#fff",
        padding: "20px",
      }}
    >
      {/* =====================================================
          TÍTULO
      ====================================================== */}

      <div
        style={{
          textAlign: "center",
          marginBottom: "20px",
        }}
      >
        <h1>
          🎤 {musica}
        </h1>

        <p
          style={{
            opacity: 0.8,
          }}
        >
          Karaoke Show Grace
        </p>
      </div>

      {/* =====================================================
          VÍDEO YOUTUBE
      ====================================================== */}

      <div
        style={{
          width: "100%",
          maxWidth: "1000px",
          margin: "0 auto",
          aspectRatio: "16 / 9",
          background: "#000",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        <div
          ref={playerRef}
          style={{
            width: "100%",
            height: "100%",
          }}
        />
      </div>

      {/* =====================================================
          STATUS DO ÁUDIO
      ====================================================== */}

      <div
        style={{
          maxWidth: "1000px",
          margin: "20px auto",
          padding: "15px",
          borderRadius: "10px",
          background: "#1f2937",
          textAlign: "center",
        }}
      >
        {audioCarregando && (
          <div>
            ⏳ Preparando áudio...
          </div>
        )}

        {!audioCarregando &&
          audioPronto && (
            <div
              style={{
                color: "#4ade80",
              }}
            >
              ✅ Áudio pronto
              {audioNome
                ? ` — ${audioNome}`
                : ""}
            </div>
          )}

        {erroAudio && (
          <div
            style={{
              color: "#f87171",
              marginTop: "5px",
            }}
          >
            ❌ {erroAudio}
          </div>
        )}
      </div>

      {/* =====================================================
          CONTROLE DE TOM
      ====================================================== */}

      <div
        style={{
          maxWidth: "1000px",
          margin: "20px auto",
          padding: "20px",
          background: "#1f2937",
          borderRadius: "12px",
          textAlign: "center",
        }}
      >
        <h2>
          🎵 Tonalidade
        </h2>

        <div
          style={{
            fontSize: "40px",
            fontWeight: "bold",
            margin: "15px",
          }}
        >
          {nomeTom}
        </div>

        <div
          style={{
            fontSize: "16px",
            opacity: 0.8,
            marginBottom: "15px",
          }}
        >
          {tomAtual > 0
            ? `+${tomAtual} semitom${
                tomAtual === 1
                  ? ""
                  : "s"
              }`
            : `${tomAtual} semitom${
                tomAtual === -1
                  ? ""
                  : "s"
              }`}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent:
              "center",
            gap: "15px",
          }}
        >
          <button
            onClick={diminuirTom}
            disabled={
              tomAtual <= -12
            }
            style={{
              fontSize: "28px",
              width: "70px",
              height: "55px",
              cursor:
                tomAtual <= -12
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            −
          </button>

          <button
            onClick={() =>
              setTomAtual(0)
            }
            style={{
              fontSize: "18px",
              padding:
                "0 20px",
              cursor: "pointer",
            }}
          >
            Original
          </button>

          <button
            onClick={aumentarTom}
            disabled={
              tomAtual >= 12
            }
            style={{
              fontSize: "28px",
              width: "70px",
              height: "55px",
              cursor:
                tomAtual >= 12
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            +
          </button>
        </div>
      </div>

      {/* =====================================================
          CONTROLES
      ====================================================== */}

      <div
        style={{
          maxWidth: "1000px",
          margin: "20px auto",
          display: "flex",
          justifyContent:
            "center",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={salvarNaPlaylist}
          style={{
            padding:
              "12px 20px",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          💾 Salvar na Playlist
        </button>

        <button
          onClick={() =>
            navigate(-1)
          }
          style={{
            padding:
              "12px 20px",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          ← Voltar
        </button>
      </div>

      {/* =====================================================
          INFORMAÇÃO
      ====================================================== */}

      <div
        style={{
          maxWidth: "1000px",
          margin: "30px auto",
          textAlign: "center",
          opacity: 0.7,
          fontSize: "14px",
        }}
      >
        <p>
          🎧 O áudio original do
          YouTube está silenciado.
        </p>

        <p>
          🎵 O áudio processado pelo
          Tone.js é usado para permitir
          alteração da tonalidade.
        </p>

        <p>
          🎚️ Use + e − para alterar o
          tom em semitons.
        </p>
      </div>
    </div>
  );
}