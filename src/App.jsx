import { useEffect } from "react";
import { initExperience } from "./experience";
import "./styles.css";

export default function App() {
  useEffect(() => {
    const cleanup = initExperience();
    return typeof cleanup === "function" ? cleanup : undefined;
  }, []);

  return (
    <>
      <div className="noise" aria-hidden="true"></div>
        <div className="cursor" id="cursor" aria-hidden="true"></div>
        <div className="cursor-dot" id="cursorDot" aria-hidden="true"></div>
        <div className="progress" id="progress" aria-hidden="true"></div>

        <nav className="scene-nav" id="sceneNav" aria-label="Navegação das cenas" hidden></nav>
        <div className="hud" id="hud" hidden>
          <span className="hud-count" id="hudCount">01 / 11</span>
          <span className="hint-keys">↓ ↑ ou espaço</span>
        </div>

        {/* Música de fundo: Vida Longa, Mundo Pequeno — mesmo ícone ligado/desligado */}
        <audio id="bgMusic" src="media/ambient.mp3" loop preload="auto" playsInline></audio>
        <button type="button" className="sound-toggle is-off" id="soundToggle" aria-label="Som desligado" aria-pressed="false" title="Som">
          <span className="sound-bars" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
        </button>

        <main className="stage" id="stage">

          {/* 0 INTRO */}
          <section className="scene active" id="scene-intro" data-od-id="intro" aria-label="Abertura">
            <div className="scene-bg"></div>
            <canvas className="stars-canvas" id="starsCanvas" aria-hidden="true"></canvas>
            <div className="intro-center">
              <p className="type-line" id="typeLine" aria-live="polite"></p>
              <div className="heart-wrap" id="heartWrap">
                <div className="heart-glow" aria-hidden="true"></div>
                <button type="button" className="heart-btn" id="heartBtn" aria-label="Toque no coração para começar a jornada">
                  <svg className="heart-svg" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
                    <defs>
                      <linearGradient id="heartGrad" x1="12" y1="8" x2="52" y2="56" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#ff8fb0" />
                        <stop offset="42%" stopColor="#ff4d6d" />
                        <stop offset="100%" stopColor="#ff2d55" />
                      </linearGradient>
                      <radialGradient id="heartShine" cx="0.32" cy="0.28" r="0.42">
                        <stop offset="0%" stopColor="rgba(255,255,255,0.65)" />
                        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                      </radialGradient>
                    </defs>
                    <path fill="url(#heartGrad)" d="M32 54.5C18 45.2 8.5 36.4 6.2 27.6 3.4 17.2 10.2 9 19.6 9c5.4 0 9.4 3 12.4 7.2C35 12 39 9 44.4 9 53.8 9 60.6 17.2 57.8 27.6 55.5 36.4 46 45.2 32 54.5z" />
                    <ellipse cx="24.5" cy="23" rx="7.5" ry="5.5" fill="url(#heartShine)" />
                  </svg>
                </button>
                <div className="heart-burst" id="heartBurst" aria-hidden="true"></div>
              </div>
              <p className="intro-hint" id="introHint">Toque no coração</p>
            </div>
            <button type="button" className="skip-intro" id="skipIntro">Pular intro</button>
          </section>

          {/* 1 HERO */}
          <section className="scene" id="scene-hero" data-od-id="hero" aria-label="Hero">
            <div className="hero-media">
              <img src="media/hero.jpg" alt="Erick e Thais juntos" />
              <div className="hero-veil"></div>
            </div>
            <div className="aurora" aria-hidden="true"></div>
            <div className="hero-copy scene-inner">
              <p className="eyebrow">Para Thais · __/__/____</p>
              <h1 className="title">Feliz aniversário,<br /><em>meu amor</em></h1>
              <p className="script">Thais</p>
              <p className="lede">Cada segundo ao seu lado me faz ter ainda mais certeza de que quero viver todos os próximos com você.</p>
            </div>
          </section>

          {/* 2 TIMELINE */}
          <section className="scene" id="scene-timeline" data-od-id="timeline" aria-label="Linha do tempo">
            <div className="scene-bg"></div>
            <div className="aurora" aria-hidden="true"></div>
            <div className="scene-inner">
              <header className="split-head">
                <p className="eyebrow">Nossa história</p>
                <h2 className="title">Linha do <em>tempo</em></h2>
                <p className="lede center mt-md" style={{marginInline: "auto"}}>Cada ponto é uma memória. Toque para abrir.</p>
              </header>
              <div className="timeline-wrap">
                <div className="timeline-track" id="timelineTrack">
                  <svg className="tl-spine" id="tlSpine" aria-hidden="true">
                    <defs>
                      <linearGradient id="tlGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FF2D55" stopOpacity="0.35" />
                        <stop offset="18%" stopColor="#FF2D55" />
                        <stop offset="52%" stopColor="#FF6B9E" />
                        <stop offset="82%" stopColor="#FFD166" />
                        <stop offset="100%" stopColor="#FFD166" stopOpacity="0.45" />
                      </linearGradient>
                    </defs>
                    <path className="tl-spine-track" id="tlSpineTrack" d="" />
                    <path className="tl-spine-progress" id="tlSpineProgress" d="" />
                    <circle className="tl-spine-head" id="tlSpineHead" r="4.5" cx="0" cy="0" />
                    <g className="tl-spine-sparks" id="tlSpineSparks" aria-hidden="true"></g>
                  </svg>
                  <ol className="tl-list">
                    <li className="tl-node">
                      <div className="tl-main">
                        <button type="button" className="tl-hit" aria-expanded="false" aria-controls="tl-reveal-1">
                          <span className="date">__/__/____</span>
                          <h3>O dia que nos conhecemos</h3>
                          <p className="tl-tease">Antes de tudo, existia só a curiosidade de te conhecer de verdade — e ela virou a nossa história.</p>
                          <span className="tl-hint">Toque para revelar</span>
                        </button>
                      </div>
                      <div className="tl-dot-col" aria-hidden="true"><span className="tl-dot"></span></div>
                      <div className="tl-reveal" id="tl-reveal-1">
                        <img className="tl-reveal-media" src="media/timeline-01.jpg" alt="Erick e Thais juntos" loading="lazy" data-lb="img" data-src="media/timeline-01.jpg" data-cap="O começo de tudo" />
                      </div>
                    </li>
                    <li className="tl-node">
                      <div className="tl-main">
                        <button type="button" className="tl-hit" aria-expanded="false" aria-controls="tl-reveal-2">
                          <span className="date">__/__/____</span>
                          <h3>A espera mais bonita</h3>
                          <p className="tl-tease">A barriga crescendo, o coração transbordando. A gente já amava alguém que ainda nem sabia o nome.</p>
                          <span className="tl-hint">Toque para revelar</span>
                        </button>
                      </div>
                      <div className="tl-dot-col" aria-hidden="true"><span className="tl-dot"></span></div>
                      <div className="tl-reveal" id="tl-reveal-2">
                        <img className="tl-reveal-media" src="media/timeline-02.jpg" alt="Thais na gestação do Benício" loading="lazy" data-lb="img" data-src="media/timeline-02.jpg" data-cap="A espera do Benício" />
                      </div>
                    </li>
                    <li className="tl-node">
                      <div className="tl-main">
                        <button type="button" className="tl-hit" aria-expanded="false" aria-controls="tl-reveal-3">
                          <span className="date">__/__/____</span>
                          <h3>A chegada do Benício</h3>
                          <p className="tl-tease">O dia em que o mundo ficou pequeno e o nosso peito ficou enorme. Ele chegou e a gente virou família.</p>
                          <span className="tl-hint">Toque para revelar</span>
                        </button>
                      </div>
                      <div className="tl-dot-col" aria-hidden="true"><span className="tl-dot"></span></div>
                      <div className="tl-reveal" id="tl-reveal-3">
                        <img className="tl-reveal-media" src="media/timeline-03.jpg" alt="Thais e Benício no chá de bebê" loading="lazy" data-lb="img" data-src="media/timeline-03.jpg" data-cap="Bem-vindo, Benício" />
                      </div>
                    </li>
                    <li className="tl-node">
                      <div className="tl-main">
                        <button type="button" className="tl-hit" aria-expanded="false" aria-controls="tl-reveal-4">
                          <span className="date">__/__/____</span>
                          <h3>O primeiro aninho</h3>
                          <p className="tl-tease">Um ano de descobertas, de risadas e de noites curtas. Um ano que passou rápido demais.</p>
                          <span className="tl-hint">Toque para revelar</span>
                        </button>
                      </div>
                      <div className="tl-dot-col" aria-hidden="true"><span className="tl-dot"></span></div>
                      <div className="tl-reveal" id="tl-reveal-4">
                        <img className="tl-reveal-media" src="media/timeline-04.jpg" alt="Benício no primeiro aniversário" loading="lazy" data-lb="img" data-src="media/timeline-04.jpg" data-cap="Um ano do nosso amor" />
                      </div>
                    </li>
                    <li className="tl-node">
                      <div className="tl-main">
                        <button type="button" className="tl-hit" aria-expanded="false" aria-controls="tl-reveal-5">
                          <span className="date">__/__/____</span>
                          <h3>Nosso lar</h3>
                          <p className="tl-tease">Não é um lugar. É o jeito que a casa fica quando nós três estamos nela.</p>
                          <span className="tl-hint">Toque para revelar</span>
                        </button>
                      </div>
                      <div className="tl-dot-col" aria-hidden="true"><span className="tl-dot"></span></div>
                      <div className="tl-reveal" id="tl-reveal-5">
                        <img className="tl-reveal-media" src="media/timeline-05.jpg" alt="Erick, Thais e Benício" loading="lazy" data-lb="img" data-src="media/timeline-05.jpg" data-cap="Onde a gente está" />
                      </div>
                    </li>
                    <li className="tl-node">
                      <div className="tl-main">
                        <button type="button" className="tl-hit" aria-expanded="false" aria-controls="tl-reveal-6">
                          <span className="date">__/__/____</span>
                          <h3>Momentos especiais</h3>
                          <p className="tl-tease">Cada encontro vira arquivo secreto no peito. Eu guardo todos.</p>
                          <span className="tl-hint">Toque para revelar</span>
                        </button>
                      </div>
                      <div className="tl-dot-col" aria-hidden="true"><span className="tl-dot"></span></div>
                      <div className="tl-reveal" id="tl-reveal-6">
                        <img className="tl-reveal-media" src="media/timeline-06.jpg" alt="Thais no aniversário" loading="lazy" data-lb="img" data-src="media/timeline-06.jpg" data-cap="O seu dia" />
                      </div>
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </section>

          {/* 3 POLAROID (assume o lugar do mural) */}
          <section className="scene" id="scene-polaroid" data-od-id="polaroid" aria-label="Galeria polaroid">
            <div className="scene-bg"></div>
            <div className="scene-inner">
              <header className="split-head">
                <p className="eyebrow">Mesa de memórias</p>
                <h2 className="title">Polaroids</h2>
              </header>
              <div className="polaroid-stage" id="polaroidStage">
                <div className="polaroid" data-lb="img" data-src="media/polaroid-01.jpg" data-cap="O começo de tudo" style={{transform: "rotate(-12deg)", zIndex: 1}}>
                  <img src="media/polaroid-01.jpg" alt="Erick e Thais no começo" />
                  <span className="cap">o começo de tudo</span>
                </div>
                <div className="polaroid" data-lb="img" data-src="media/polaroid-02.jpg" data-cap="A gente, do nosso jeito" style={{transform: "rotate(7deg)", zIndex: 2}}>
                  <img src="media/polaroid-02.jpg" alt="Erick e Thais" />
                  <span className="cap">a gente, do nosso jeito</span>
                </div>
                <div className="polaroid" data-lb="img" data-src="media/polaroid-03.jpg" data-cap="Sol, rio e você" style={{transform: "rotate(-5deg)", zIndex: 3}}>
                  <img src="media/polaroid-03.jpg" alt="Erick e Thais no caiaque" />
                  <span className="cap">sol, rio e você</span>
                </div>
                <div className="polaroid" data-lb="img" data-src="media/polaroid-04.jpg" data-cap="Meu lugar favorito" style={{transform: "rotate(10deg)", zIndex: 4}}>
                  <img src="media/polaroid-04.jpg" alt="Thais" />
                  <span className="cap">meu lugar favorito</span>
                </div>
                <div className="polaroid" data-lb="img" data-src="media/polaroid-05.jpg" data-cap="Nosso pedacinho de céu" style={{transform: "rotate(-8deg)", zIndex: 5}}>
                  <img src="media/polaroid-05.jpg" alt="Erick e Thais juntos" />
                  <span className="cap">nosso pedacinho de céu</span>
                </div>
              </div>
            </div>
          </section>

          {/* 4 NOSSO LAR */}
          <section className="scene" id="scene-map" data-od-id="map" aria-label="Nosso lar">
            <div className="scene-bg"></div>
            <div className="scene-inner">
              <header className="split-head">
                <p className="eyebrow">Onde a nossa história mora</p>
                <h2 className="title">Nosso <em>lar</em></h2>
              </header>
              <div className="map-stage home-stage">
                <canvas className="map-canvas" id="mapCanvas" aria-hidden="true"></canvas>
                <div className="home-art" aria-hidden="true">
                  <span className="home-halo"></span>
                  <svg className="home-svg" viewBox="0 0 120 120" fill="none">
                    <defs>
                      <linearGradient id="homeGrad" x1="20" y1="28" x2="100" y2="96" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#FF2D55" />
                        <stop offset="55%" stopColor="#FF6B9E" />
                        <stop offset="100%" stopColor="#FFD166" />
                      </linearGradient>
                    </defs>
                    <path d="M18 62 60 27l42 35" stroke="url(#homeGrad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M30 58v38h60V58" stroke="url(#homeGrad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M52 96V74h16v22" stroke="url(#homeGrad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="45" cy="70" r="2.4" fill="#FFD166" />
                    <circle cx="75" cy="70" r="2.4" fill="#FFD166" />
                  </svg>
                </div>
                <p className="map-quote script">Não é um lugar no mapa. É onde a gente está.</p>
              </div>
            </div>
          </section>

          {/* 5 LETTERS */}
          <section className="scene" id="scene-letters" data-od-id="letters" aria-label="Cartas">
            <div className="scene-bg"></div>
            <div className="scene-inner">
              <header className="split-head">
                <h2 className="title">Cartas para você<span className="title-heart" aria-hidden="true">♥</span></h2>
                <p className="lede center mt-md" style={{marginInline: "auto", maxWidth: "28ch"}}>Doze pedaços de papel. Toque e leia.</p>
              </header>
              <div className="letters-stage" id="lettersRain">
                <div className="letters-grid" id="lettersGrid" role="list" aria-label="Doze cartas para abrir"></div>
                <canvas id="letters3d" hidden aria-hidden="true"></canvas>
              </div>
            </div>
          </section>

          {/* 6 CINEMA */}
          <section className="scene" id="scene-cinema" data-od-id="cinema" aria-label="Vídeos">
            <div className="scene-bg"></div>
            <div className="scene-inner">
              <header className="split-head">
                <p className="eyebrow">Momentos guardados</p>
                <h2 className="title">Cenas da <em>nossa vida</em></h2>
                <p className="lede center mt-md" style={{marginInline: "auto"}}>Toque em uma cena para ampliar.</p>
              </header>
              <div className="cinema-grid">
                <button type="button" className="cine-card" data-lb="img" data-src="media/cinema-01.jpg" data-cap="A espera" aria-label="Ampliar A espera">
                  <img className="cine-thumb" src="media/cinema-01.jpg" alt="Thais na gestação" />
                  <span>
                    <span className="label">A espera</span>
                    <span className="cine-meta">Toque para ampliar</span>
                  </span>
                  <span className="play-ring" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z" /></svg></span>
                </button>
                <button type="button" className="cine-card" data-lb="img" data-src="media/cinema-02.jpg" data-cap="A chegada" aria-label="Ampliar A chegada">
                  <img className="cine-thumb" src="media/cinema-02.jpg" alt="Thais e Benício" />
                  <span>
                    <span className="label">A chegada</span>
                    <span className="cine-meta">Toque para ampliar</span>
                  </span>
                  <span className="play-ring" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z" /></svg></span>
                </button>
                <button type="button" className="cine-card" data-lb="img" data-src="media/cinema-03.jpg" data-cap="A mesa cheia" aria-label="Ampliar A mesa cheia">
                  <img className="cine-thumb" src="media/cinema-03.jpg" alt="Família reunida" />
                  <span>
                    <span className="label">A mesa cheia</span>
                    <span className="cine-meta">Toque para ampliar</span>
                  </span>
                  <span className="play-ring" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z" /></svg></span>
                </button>
                <button type="button" className="cine-card" data-lb="img" data-src="media/cinema-04.jpg" data-cap="O nosso retrato" aria-label="Ampliar O nosso retrato">
                  <img className="cine-thumb" src="media/cinema-04.jpg" alt="Retrato da família" />
                  <span>
                    <span className="label">O nosso retrato</span>
                    <span className="cine-meta">Toque para ampliar</span>
                  </span>
                  <span className="play-ring" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z" /></svg></span>
                </button>
              </div>
            </div>
          </section>

          {/* 7 PLAYLIST */}
          <section className="scene" id="scene-playlist" data-od-id="playlist" aria-label="Playlist">
            <div className="scene-bg"></div>
            <div className="aurora" aria-hidden="true"></div>
            <div className="scene-inner center">
              <header className="split-head">
                <p className="eyebrow">Trilha sonora</p>
                <h2 className="title">Músicas da <em>gente</em></h2>
                <p className="lede center mt-md" style={{marginInline: "auto"}}>Cada faixa carrega um pedaço da história. Ouça com o fone — ou com o peito.</p>
              </header>
              <div className="playlist" data-od-id="playlist-tracks">
                <a className="track" data-od-id="track-01" href="https://open.spotify.com/search/Vida%20Longa%20Mundo%20Pequeno%20Oriente" target="_blank" rel="noopener noreferrer" aria-label="Ouvir no Spotify: Vida Longa, Mundo Pequeno">
                  <div className="track-num">01</div>
                  <div>
                    <h4>Vida Longa, Mundo Pequeno</h4>
                    <p>“A nossa trilha de fundo. Toca baixinho e a casa inteira vira nós três.”</p>
                  </div>
                  <span className="track-spotify" aria-hidden="true" title="Spotify">
                    <svg viewBox="0 0 24 24" focusable="false"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
                  </span>
                </a>
                <a className="track" data-od-id="track-02" href="https://open.spotify.com/track/2LA2EvpxdC33cignxvKkNt" target="_blank" rel="noopener noreferrer" aria-label="Ouvir no Spotify: Beijos, Blues e Poesia">
                  <div className="track-num">02</div>
                  <div>
                    <h4>Beijos, Blues e Poesia</h4>
                    <p>“Essa me lembra quando a conversa não queria acabar.”</p>
                  </div>
                  <span className="track-spotify" aria-hidden="true" title="Spotify">
                    <svg viewBox="0 0 24 24" focusable="false"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
                  </span>
                </a>
                <a className="track" data-od-id="track-03" href="https://open.spotify.com/track/1DLKuppSYytOuxhtI6KBGu" target="_blank" rel="noopener noreferrer" aria-label="Ouvir no Spotify: Aliança">
                  <div className="track-num">03</div>
                  <div>
                    <h4>Aliança</h4>
                    <p>“A faixa oficial do ‘é oficial’.”</p>
                  </div>
                  <span className="track-spotify" aria-hidden="true" title="Spotify">
                    <svg viewBox="0 0 24 24" focusable="false"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
                  </span>
                </a>
                <a className="track" data-od-id="track-04" href="https://open.spotify.com/track/6vgKWE1KV4E7p1Dv75z0kL" target="_blank" rel="noopener noreferrer" aria-label="Ouvir no Spotify: Azul Da Cor Do Mar">
                  <div className="track-num">04</div>
                  <div>
                    <h4>Azul Da Cor Do Mar</h4>
                    <p>“Essa me lembra você rindo, o Benício no colo e o mundo inteiro cabendo na sala.”</p>
                  </div>
                  <span className="track-spotify" aria-hidden="true" title="Spotify">
                    <svg viewBox="0 0 24 24" focusable="false"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
                  </span>
                </a>
                <a className="track" data-od-id="track-05" href="https://open.spotify.com/track/3UStHHOyFXetR5621bKJBz" target="_blank" rel="noopener noreferrer" aria-label="Ouvir no Spotify: Duas Metades — Ao Vivo">
                  <div className="track-num">05</div>
                  <div>
                    <h4>Duas Metades — Ao Vivo</h4>
                    <p>“Hoje a playlist inteira é só o seu nome.”</p>
                  </div>
                  <span className="track-spotify" aria-hidden="true" title="Spotify">
                    <svg viewBox="0 0 24 24" focusable="false"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
                  </span>
                </a>
              </div>
              <p className="script mt-md" style={{opacity: ".9"}}>toque numa faixa para abrir no Spotify — a trilha de fundo é Vida Longa, Mundo Pequeno</p>
            </div>
          </section>

          {/* 8 COUNTER */}
          <section className="scene" id="scene-counter" data-od-id="counter" aria-label="Contador">
            <div className="scene-bg"></div>
            <div className="aurora" aria-hidden="true"></div>
            <div className="scene-inner center">
              <header className="split-head">
                <p className="eyebrow">Desde __/__/____</p>
                <h2 className="title">Já faz…</h2>
                <p className="script mt-sm">desde que começamos a nossa história</p>
              </header>
              <div className="counter-grid" aria-live="polite">
                <div className="counter-cell"><div className="num" id="cDays">0</div><div className="lbl">Dias</div></div>
                <div className="counter-cell"><div className="num" id="cHours">0</div><div className="lbl">Horas</div></div>
                <div className="counter-cell"><div className="num" id="cMins">0</div><div className="lbl">Minutos</div></div>
                <div className="counter-cell"><div className="num" id="cSecs">0</div><div className="lbl">Segundos</div></div>
              </div>
              <p className="lede center mt-md" style={{marginInline: "auto", marginTop: "28px"}}>Atualizando em tempo real — porque o tempo com você também é.</p>
            </div>
          </section>

          {/* 9 CONSTELLATION */}
          <section className="scene" id="scene-constellation" data-od-id="constellation" aria-label="Constelação">
            <div className="scene-bg"></div>
            <div className="scene-inner">
              <header className="split-head">
                <p className="eyebrow">Céu particular</p>
                <h2 className="title">Nossa <em>constelação</em></h2>
              </header>
              <div className="constellation">
                <canvas className="const-canvas" id="constCanvas" role="img" aria-label="Constelação interativa de memórias"></canvas>
                <p className="const-tip" id="constTip">Toque em uma estrela para revelar uma memória</p>
              </div>
            </div>
          </section>

          {/* 10 BOOK */}
          <section className="scene" id="scene-book" data-od-id="book" aria-label="Livro">
            <div className="scene-bg"></div>
            <div className="scene-inner">
              <header className="split-head">
                <p className="eyebrow">Páginas do peito</p>
                <h2 className="title">Livro de <em>cartas</em></h2>
              </header>
              <div className="book-stage">
                <div className="book" id="book">
                  <div className="book-3d">
                    <div className="book-shadow" aria-hidden="true"></div>
                    <div className="book-board" aria-hidden="true"></div>
                    <div className="book-block" aria-hidden="true"></div>
                    <div className="book-under" aria-hidden="true"></div>
                    <div className="book-ribbon" aria-hidden="true"></div>
                    <div className="book-page" id="bookPage">
                      <div className="book-page-face book-page-front">
                        <p className="script" id="bookScript">Para Thais</p>
                        <p id="bookText">Se este site fosse um livro, a primeira página seria só o seu nome — escrito devagar, com medo de errar a letra e estragar a magia.</p>
                        <span className="pg-num" id="bookNum">01 / 09</span>
                      </div>
                      <div className="book-page-face book-page-back" aria-hidden="true"></div>
                    </div>
                  </div>
                </div>
                <div className="book-controls">
                  <button type="button" className="btn-ghost" id="bookPrev" disabled>Anterior</button>
                  <button type="button" className="btn-ghost" id="bookNext">Próxima</button>
                </div>
              </div>
            </div>
          </section>

          {/* 11 FINAL */}
          <section className="scene" id="scene-final" data-od-id="final" aria-label="Final">
            <div className="scene-bg"></div>
            <div className="confetti-layer" id="confettiLayer" aria-hidden="true"></div>
            <div className="scene-inner">
              <div className="final-copy" id="finalCopy">
                <p className="final-line" id="finalLine">Eu escolheria você todos os dias — e escolho.</p>
                <button type="button" className="btn-primary" id="heartExplode" aria-label="Revelar mensagem final">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                  Abrir o coração
                </button>
                <div className="final-boom" id="finalBoom">
                  <h2 className="title">Feliz aniversário,<br /><em>meu amor</em>.</h2>
                  <p className="script">Obrigado por existir.</p>
                  <p className="lede" style={{marginInline: "auto"}}>Eu te amo infinitamente.</p>
                  <p className="eyebrow mt-md" style={{color: "var(--text-dim)"}}>Erick × Thais × Benício</p>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* LIGHTBOX */}
        <div className="lightbox" id="lightbox" role="dialog" aria-modal="true" aria-label="Mídia ampliada">
          <button type="button" className="lightbox-close" id="lbClose" aria-label="Fechar">×</button>
          <div className="lightbox-inner">
            <div id="lbMedia"></div>
            <p className="lightbox-caption" id="lbCaption"></p>
          </div>
        </div>

        {/* LETTER MODAL */}
        <div className="letter-modal" id="letterModal" role="dialog" aria-modal="true" aria-labelledby="letterTitle">
          <div className="letter-sheet">
            <h3 id="letterTitle"></h3>
            <p className="typewriter" id="letterBody"></p>
            <div className="close-row">
              <button type="button" className="btn-ghost" id="letterClose">Fechar carta</button>
            </div>
          </div>
        </div>

        {/* CALL OVERLAY */}
        <div className="call-overlay" id="callOverlay" role="dialog" aria-modal="true" aria-label="Chamada de vídeo">
          <div className="call-avatar">
            <img src="media/call-avatar.jpg" alt="Erick" />
          </div>
          <p className="call-name">Erick</p>
          <p className="call-status" id="callStatus">Erick está ligando para você...</p>
          <div className="call-actions" id="callActions">
            <button type="button" className="call-btn decline" id="callDecline" aria-label="Recusar">
              <svg viewBox="0 0 24 24"><path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08a.956.956 0 01-.29-.7c0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .27-.11.52-.29.7l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.1-.7-.28-.79-.73-1.68-1.36-2.66-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z" /></svg>
            </button>
            <button type="button" className="call-btn accept" id="callAccept" aria-label="Atender">
              <svg viewBox="0 0 24 24"><path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z" /></svg>
            </button>
          </div>
          <div className="call-video-wrap" id="callVideoWrap">
            <video id="callVideo" src="media/video.mp4" playsInline controls preload="metadata"></video>
            <button type="button" className="btn-ghost call-end" id="callEnd">Encerrar</button>
          </div>
        </div>
    </>
  );
}
