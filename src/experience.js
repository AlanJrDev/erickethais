import gsap from "gsap";

/**
 * Imperative experience engine (ported from Open Design index.html).
 * Preserves all scene interactions; attaches to the document after React mounts.
 * @returns {() => void} cleanup
 */
export function initExperience() {
  "use strict";
  window.gsap = gsap;


    /* Preencha quando tiver a data: new Date(AAAA, MM - 1, DD) */
    const START_DATE = null;
    const scenes = Array.from(document.querySelectorAll(".scene"));
    let index = 0;
    let journeyStarted = false;
    let callTriggered = false;
    let reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", (e) => {
      reduced = e.matches;
    });

    /* emilkowalski-motion + emil-design-eng — transform/opacity only, ease-out, UI ≤300ms */
    const MOTION = {
      ease: "power3.out",
      easeExit: "power3.out",
      easeInOut: "power2.inOut",
      easeSoft: "sine.inOut",
      fast: 0.14,
      ui: 0.18,
      enter: 0.4,
      scene: 0.42,
      exit: 0.14,
      stagger: 0.045,
      staggerMax: 0.06
    };
    let enterTl = null;
    let sceneTween = null;

    function killEnter() {
      if (enterTl) {
        enterTl.kill();
        enterTl = null;
      }
    }

    const progress = document.getElementById("progress");
    const sceneNav = document.getElementById("sceneNav");
    const hud = document.getElementById("hud");
    const hudCount = document.getElementById("hudCount");

    /* ---------- Custom cursor ---------- */
    const cursor = document.getElementById("cursor");
    const cursorDot = document.getElementById("cursorDot");
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let cx = mx, cy = my;
    window.addEventListener("mousemove", (e) => {
      mx = e.clientX; my = e.clientY;
      cursorDot.style.left = mx + "px";
      cursorDot.style.top = my + "px";
    });
    function loopCursor() {
      if (reduced) {
        cursor.style.left = mx + "px";
        cursor.style.top = my + "px";
        return;
      }
      cx += (mx - cx) * 0.22;
      cy += (my - cy) * 0.22;
      cursor.style.left = cx + "px";
      cursor.style.top = cy + "px";
      requestAnimationFrame(loopCursor);
    }
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches && !reduced) loopCursor();

    function bindCursorTargets(root) {
      const scope = root || document;
      const nodes = scope.querySelectorAll
        ? scope.querySelectorAll("button, a, .tl-node, .tl-hit, .cine-card, .env-card, .polaroid, .call-btn, #heartBtn, #soundToggle")
        : [];
      nodes.forEach((el) => {
        if (el.dataset.cursorBound === "1") return;
        el.dataset.cursorBound = "1";
        el.addEventListener("mouseenter", () => cursor.classList.add("hover"));
        el.addEventListener("mouseleave", () => cursor.classList.remove("hover"));
      });
    }
    bindCursorTargets(document);

    /* ---------- Nav dots ---------- */
    scenes.forEach((s, i) => {
      if (i === 0) return; // hide intro from main nav until start
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", "Ir para cena " + i);
      b.addEventListener("click", () => goTo(i));
      sceneNav.appendChild(b);
    });

    function updateChrome() {
      const total = scenes.length - 1; // after intro, content scenes
      const display = journeyStarted ? Math.max(1, index) : 0;
      const shown = journeyStarted ? index : 0;
      progress.style.width = journeyStarted ? ((index / (scenes.length - 1)) * 100) + "%" : "0%";
      hudCount.textContent = String(Math.max(index, 1)).padStart(2, "0") + " / " + String(scenes.length - 1).padStart(2, "0");
      Array.from(sceneNav.children).forEach((btn, i) => {
        btn.classList.toggle("active", i + 1 === index);
      });
    }

    function goTo(i, opts) {
      if (i < 0 || i >= scenes.length) return;
      if (!journeyStarted && i > 0) return;
      if (i === index && !opts?.force) return;
      const prev = index;
      index = i;
      killEnter();
      if (sceneTween) { sceneTween.kill(); sceneTween = null; }
      scenes.forEach((s, n) => {
        s.classList.toggle("active", n === index);
        if (n !== index && window.gsap) gsap.set(s, { clearProps: "opacity,transform" });
      });
      updateChrome();
      onSceneEnter(index, prev);
      if (!reduced && window.gsap) {
        const dir = i >= prev ? 1 : -1;
        sceneTween = gsap.fromTo(
          scenes[index],
          { opacity: 0, y: 12 * dir },
          { opacity: 1, y: 0, duration: MOTION.scene, ease: MOTION.ease, overwrite: true }
        );
      }
    }

    function next() {
      if (index < scenes.length - 1) goTo(index + 1);
    }
    function prev() {
      if (index > 1 || (index === 1 && journeyStarted)) goTo(Math.max(1, index - 1));
      else if (index > 0) goTo(index - 1);
    }

    /* ---------- Intro typewriter + stars ---------- */
    const typeLine = document.getElementById("typeLine");
    const heartWrap = document.getElementById("heartWrap");
    const heartBtn = document.getElementById("heartBtn");
    const heartBurst = document.getElementById("heartBurst");
    const introHint = document.getElementById("introHint");
    const skipIntro = document.getElementById("skipIntro");
    const introText = "Tem histórias que não se medem em tempo — se medem em presença...";
    let heartBursting = false;

    function typeIntro() {
      let i = 0;
      typeLine.innerHTML = "";
      const span = document.createElement("span");
      const caret = document.createElement("span");
      caret.className = "type-cursor";
      caret.setAttribute("aria-hidden", "true");
      typeLine.appendChild(span);
      typeLine.appendChild(caret);
      const step = () => {
        if (i <= introText.length) {
          span.textContent = introText.slice(0, i);
          i++;
          setTimeout(step, reduced ? 0 : 38 + Math.random() * 30);
        } else {
          caret.remove();
          setTimeout(() => {
            heartWrap.classList.add("visible");
            introHint.classList.add("visible");
            skipIntro.classList.add("show");
          }, reduced ? 0 : 600);
        }
      };
      step();
    }

    const starsCanvas = document.getElementById("starsCanvas");
    const sctx = starsCanvas.getContext("2d");
    let stars = [];
    function resizeStars() {
      starsCanvas.width = window.innerWidth * devicePixelRatio;
      starsCanvas.height = window.innerHeight * devicePixelRatio;
      sctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      stars = Array.from({ length: 120 }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: Math.random() * 1.4 + 0.3,
        a: Math.random(),
        s: Math.random() * 0.02 + 0.005
      }));
    }
    function drawStars() {
      if (!sctx) return;
      sctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      stars.forEach((st) => {
        st.a += st.s;
        const alpha = 0.3 + Math.sin(st.a) * 0.5;
        sctx.beginPath();
        sctx.fillStyle = "rgba(255,255,255," + alpha + ")";
        sctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
        sctx.fill();
      });
      if (index === 0) requestAnimationFrame(drawStars);
    }
    resizeStars();
    window.addEventListener("resize", resizeStars);
    drawStars();
    typeIntro();

    /* ---------- Heart 2D — compact SVG + soft burst ---------- */
    function spawnHeartParticles() {
      if (!heartBurst) return;
      heartBurst.innerHTML = "";
      const n = 16;
      for (let i = 0; i < n; i++) {
        const p = document.createElement("i");
        const ang = (Math.PI * 2 * i) / n + (Math.random() * 0.35);
        const dist = 42 + Math.random() * 48;
        p.style.setProperty("--tx", Math.cos(ang) * dist + "px");
        p.style.setProperty("--ty", Math.sin(ang) * dist + "px");
        p.style.setProperty("--d", (Math.random() * 0.08) + "s");
        heartBurst.appendChild(p);
      }
    }

    function burstThenStart() {
      if (journeyStarted || heartBursting) return;
      heartBursting = true;
      spawnHeartParticles();
      heartWrap.classList.add("is-bursting");
      setTimeout(() => startJourney(), reduced ? 0 : 420);
    }

    if (heartBtn) {
      heartBtn.addEventListener("click", burstThenStart);
    }

    /* ---------- Background music (same icon; motion state only) ---------- */
    const bgMusic = document.getElementById("bgMusic");
    const soundToggle = document.getElementById("soundToggle");
    let musicOn = false;
    let musicUserPaused = false;

    function setSoundUI(on) {
      if (!soundToggle) return;
      soundToggle.classList.toggle("is-on", on);
      soundToggle.classList.toggle("is-off", !on);
      soundToggle.setAttribute("aria-pressed", on ? "true" : "false");
      soundToggle.setAttribute("aria-label", on ? "Som ligado — toque para silenciar" : "Som desligado — toque para ligar");
    }

    function playBgMusic() {
      if (!bgMusic || musicUserPaused) return;
      bgMusic.volume = 0.55;
      const p = bgMusic.play();
      if (p && typeof p.then === "function") {
        p.then(() => {
          musicOn = true;
          setSoundUI(true);
        }).catch(() => {
          musicOn = false;
          setSoundUI(false);
        });
      } else {
        musicOn = !bgMusic.paused;
        setSoundUI(musicOn);
      }
    }

    function pauseBgMusic(fromUser) {
      if (!bgMusic) return;
      bgMusic.pause();
      musicOn = false;
      if (fromUser) musicUserPaused = true;
      setSoundUI(false);
    }

    function toggleBgMusic() {
      if (!bgMusic) return;
      if (musicOn && !bgMusic.paused) {
        pauseBgMusic(true);
      } else {
        musicUserPaused = false;
        playBgMusic();
      }
      if (soundToggle && window.gsap && !reduced) {
        gsap.fromTo(soundToggle, { scale: 0.94 }, { scale: 1, duration: MOTION.ui, ease: MOTION.ease });
      }
    }

    if (soundToggle) {
      soundToggle.addEventListener("click", toggleBgMusic);
    }

    function startJourney() {
      if (journeyStarted) return;
      journeyStarted = true;
      sceneNav.hidden = false;
      hud.hidden = false;
      if (soundToggle) {
        soundToggle.classList.add("show");
        if (window.gsap && !reduced) {
          gsap.fromTo(soundToggle, { opacity: 0, scale: 0.9 }, {
            opacity: 1, scale: 1, duration: MOTION.enter, ease: MOTION.ease, delay: 0.08
          });
        }
      }
      if (window.gsap && !reduced) {
        gsap.fromTo(sceneNav, { opacity: 0, x: 10 }, { opacity: 1, x: 0, duration: MOTION.enter, ease: MOTION.ease });
        gsap.fromTo(hud, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: MOTION.enter, ease: MOTION.ease, delay: 0.05 });
      }
      goTo(1, { force: true });
      // Autoplay after gesture (heart / skip) — browser policy OK
      musicUserPaused = false;
      playBgMusic();
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) {
          const ctx = new AC();
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g); g.connect(ctx.destination);
          g.gain.value = 0.0001; o.start(); o.stop(ctx.currentTime + 0.01);
        }
      } catch (_) {}
    }
    skipIntro.addEventListener("click", startJourney);

    /* ---------- Scene enter hooks (emilkowalski-motion reveals) ---------- */
    function revealGroup(tl, els, at, extra) {
      if (!els || !els.length) return;
      const vars = Object.assign({
        opacity: 0,
        y: 12
      }, extra && extra.from || {});
      const to = Object.assign({
        opacity: 1,
        y: 0,
        duration: MOTION.enter,
        stagger: Math.min(MOTION.stagger, MOTION.staggerMax),
        ease: MOTION.ease
      }, extra && extra.to || {});
      tl.fromTo(els, vars, to, at);
    }

    function playSceneReveal(sc) {
      if (!window.gsap || reduced || !sc) return;
      killEnter();
      enterTl = gsap.timeline({ defaults: { ease: MOTION.ease } });

      const head = sc.querySelectorAll(".split-head > *");
      const hero = sc.querySelectorAll(".hero-copy > *");

      if (sc.id === "scene-hero" && hero.length) {
        revealGroup(enterTl, hero, 0.04, { from: { y: 14 }, to: { duration: 0.42, stagger: 0.05 } });
        return;
      }

      if (head.length) {
        revealGroup(enterTl, head, 0, { from: { y: 10 }, to: { duration: 0.36, stagger: 0.04 } });
      }

      if (sc.id === "scene-timeline") {
        const nodes = sc.querySelectorAll(".tl-node");
        nodes.forEach((n) => n.classList.remove("is-lit"));
        revealGroup(enterTl, nodes, 0.08, {
          from: { y: 14, opacity: 0 },
          to: { duration: 0.36, stagger: 0.05 }
        });
        // paint the rail once cards settle (positions known)
        enterTl.add(() => {
          requestAnimationFrame(() => paintTimelineRail());
        }, 0.42);
      } else if (sc.id === "scene-map") {
        const stage = sc.querySelector(".map-stage");
        if (stage) enterTl.fromTo(stage, { opacity: 0, y: 14, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.42 }, 0.08);
        const cities = sc.querySelectorAll(".map-labels .city");
        revealGroup(enterTl, cities, 0.18, { from: { y: 8 }, to: { duration: 0.34, stagger: 0.06 } });
        const dist = sc.querySelector(".map-dist");
        if (dist) enterTl.fromTo(dist, { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.38 }, 0.26);
        const quote = sc.querySelector(".map-quote");
        if (quote) enterTl.fromTo(quote, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.36 }, 0.4);
      } else if (sc.id === "scene-letters") {
        const cards = sc.querySelectorAll(".env-card");
        revealGroup(enterTl, cards, 0.06, {
          from: { y: 14, opacity: 0, scale: 0.97 },
          to: {
            y: 0, opacity: 1, scale: 1, duration: 0.4, stagger: 0.035,
            /* libera transform p/ tilt 3D (CSS vars) após a entrada */
            clearProps: "transform"
          }
        });
      } else if (sc.id === "scene-cinema") {
        const cards = sc.querySelectorAll(".cine-card");
        revealGroup(enterTl, cards, 0.08, {
          from: { y: 12, opacity: 0, scale: 0.97 },
          to: { y: 0, opacity: 1, scale: 1, duration: 0.38, stagger: 0.045 }
        });
      } else if (sc.id === "scene-playlist") {
        const tracks = sc.querySelectorAll(".track");
        revealGroup(enterTl, tracks, 0.08, {
          from: { y: 10, opacity: 0 },
          to: { duration: 0.34, stagger: 0.04 }
        });
        const note = sc.querySelector(".scene-inner > .script");
        if (note) enterTl.fromTo(note, { opacity: 0 }, { opacity: 0.9, duration: 0.34 }, 0.28);
      } else if (sc.id === "scene-counter") {
        const cells = sc.querySelectorAll(".counter-cell");
        revealGroup(enterTl, cells, 0.08, {
          from: { y: 12, opacity: 0, scale: 0.97 },
          to: { y: 0, opacity: 1, scale: 1, duration: 0.4, stagger: 0.05 }
        });
        const lede = sc.querySelector(".scene-inner > .lede");
        if (lede) enterTl.fromTo(lede, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.34 }, 0.28);
      } else if (sc.id === "scene-constellation") {
        const box = sc.querySelector(".constellation");
        if (box) enterTl.fromTo(box, { opacity: 0, y: 12, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.42 }, 0.08);
      } else if (sc.id === "scene-book") {
        const book = sc.querySelector(".book");
        const controls = sc.querySelectorAll(".book-controls .btn-ghost");
        if (book) enterTl.fromTo(book, { opacity: 0, y: 14, rotateY: -8 }, { opacity: 1, y: 0, rotateY: 0, duration: 0.45 }, 0.08);
        revealGroup(enterTl, controls, 0.22, { from: { y: 8 }, to: { duration: 0.3, stagger: 0.04 } });
      } else if (sc.id === "scene-polaroid") {
        const polaroids = sc.querySelectorAll(".polaroid");
        const restRots = Array.from(polaroids).map((el) => {
          const t = el.style.transform.match(/rotate\(([-\d.]+)deg\)/);
          return t ? parseFloat(t[1]) : 0;
        });
        /* celebration scene: a little bounce is allowed (rare / first-time delight) */
        enterTl.fromTo(polaroids, {
          y: -64,
          opacity: 0,
          rotation: (n) => restRots[n] + (n % 2 ? 8 : -8),
          scale: 0.95
        }, {
          y: 0,
          opacity: 1,
          rotation: (n) => restRots[n],
          scale: 1,
          duration: 0.52,
          stagger: 0.06,
          ease: "back.out(1.2)"
        }, 0.06);
      } else if (sc.id === "scene-final") {
        const line = document.getElementById("finalLine");
        const btn = document.getElementById("heartExplode");
        if (line && line.style.display !== "none") {
          enterTl.fromTo(line, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5 }, 0);
        }
        if (btn) {
          enterTl.add(() => btn.classList.add("visible"), 0.55);
          enterTl.fromTo(btn, { y: 8, scale: 0.97 }, { y: 0, scale: 1, duration: 0.34 }, 0.55);
        }
      }
    }

    function onSceneEnter(i, prev) {
      document.querySelectorAll(".scene video").forEach((v) => {
        try { v.pause(); } catch (_) {}
      });

      const sc = scenes[i];
      if (!sc) return;

      // no-op kept for compatibility

      if (sc.id === "scene-hero") {
        const v = sc.querySelector("video");
        if (v) { v.currentTime = 0; v.play().catch(() => {}); }
      }

      if (sc.id === "scene-map") startMap();
      if (sc.id === "scene-timeline") requestAnimationFrame(() => paintTimelineRail());
      if (sc.id === "scene-letters") {
        mountLettersGrid();
        stopLetters3D();
      } else stopLetters3D();
      if (sc.id === "scene-counter") startCounter();
      if (sc.id === "scene-constellation") startConstellation();

      if (sc.id === "scene-final") {
        const btn = document.getElementById("heartExplode");
        const line = document.getElementById("finalLine");
        const boom = document.getElementById("finalBoom");
        boom.classList.remove("show");
        line.style.display = "";
        btn.classList.remove("visible");
        if (reduced) btn.classList.add("visible");
      }

      playSceneReveal(sc);

      // reduced-motion / no-gsap: still paint the rail
      if (sc.id === "scene-timeline") {
        requestAnimationFrame(() => paintTimelineRail());
      }
    }

    /* ---------- Keyboard / wheel / swipe ---------- */
    let wheelLock = false;
    const TL_EDGE = 6; // px tolerance at track ends

    function timelineAtBottom(track) {
      if (!track) return true;
      return track.scrollTop + track.clientHeight >= track.scrollHeight - TL_EDGE;
    }
    function timelineAtTop(track) {
      if (!track) return true;
      return track.scrollTop <= TL_EDGE;
    }

    function trySceneFromWheel(deltaY) {
      if (wheelLock) return false;
      if (Math.abs(deltaY) < 20) return false;
      wheelLock = true;
      if (deltaY > 0) next(); else prev();
      setTimeout(() => { wheelLock = false; }, reduced ? 320 : 620);
      return true;
    }

    window.addEventListener("keydown", (e) => {
      if (!journeyStarted && e.key !== "Escape") {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); startJourney(); }
        return;
      }
      if (document.getElementById("lightbox").classList.contains("open")) {
        if (e.key === "Escape") closeLightbox();
        return;
      }
      if (document.getElementById("letterModal").classList.contains("open")) {
        if (e.key === "Escape") closeLetter();
        return;
      }
      if (document.getElementById("callOverlay").classList.contains("active")) return;

      if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault(); next();
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault(); prev();
      } else if (e.key === "Home") { e.preventDefault(); goTo(1); }
      else if (e.key === "End") { e.preventDefault(); goTo(scenes.length - 1); }
    }, { passive: false });

    window.addEventListener("wheel", (e) => {
      if (!journeyStarted) return;
      if (document.querySelector(".lightbox.open, .letter-modal.open, .call-overlay.active")) return;

      // Inside timeline: scroll the track; only change scene at the ends
      const track = e.target.closest && e.target.closest(".timeline-track");
      if (track) {
        if (e.deltaY > 0 && timelineAtBottom(track)) trySceneFromWheel(e.deltaY);
        else if (e.deltaY < 0 && timelineAtTop(track)) trySceneFromWheel(e.deltaY);
        return;
      }

      trySceneFromWheel(e.deltaY);
    }, { passive: true });

    let touchY = null;
    let touchTimelineTrack = null;
    window.addEventListener("touchstart", (e) => {
      touchY = e.touches[0].clientY;
      touchTimelineTrack = (e.target.closest && e.target.closest(".timeline-track")) || null;
    }, { passive: true });
    window.addEventListener("touchend", (e) => {
      if (touchY == null || !journeyStarted) return;
      if (document.querySelector(".lightbox.open, .letter-modal.open, .call-overlay.active")) return;
      const dy = touchY - e.changedTouches[0].clientY;
      const track = touchTimelineTrack;
      touchY = null;
      touchTimelineTrack = null;
      if (Math.abs(dy) <= 50) return;

      // On timeline track: only leave when swipe goes past last/first item
      if (track) {
        if (dy > 0 && timelineAtBottom(track)) next();
        else if (dy < 0 && timelineAtTop(track)) prev();
        return;
      }
      if (dy > 0) next(); else prev();
    }, { passive: true });

    /* ---------- Lightbox ---------- */
    const lightbox = document.getElementById("lightbox");
    const lbMedia = document.getElementById("lbMedia");
    const lbCaption = document.getElementById("lbCaption");

    function openLightbox(type, src, cap) {
      lbMedia.innerHTML = "";
      if (type === "vid") {
        const v = document.createElement("video");
        v.src = src; v.controls = true; v.autoplay = true; v.playsInline = true;
        lbMedia.appendChild(v);
      } else {
        const img = document.createElement("img");
        img.src = src; img.alt = cap || "";
        lbMedia.appendChild(img);
      }
      lbCaption.textContent = cap || "";
      lightbox.classList.add("open");
      if (window.gsap && !reduced) {
        const inner = lightbox.querySelector(".lightbox-inner");
        gsap.fromTo(lightbox, { opacity: 0 }, { opacity: 1, duration: MOTION.ui, ease: MOTION.ease });
        if (inner) {
          gsap.fromTo(inner, { opacity: 0, y: 12, scale: 0.97 }, {
            opacity: 1, y: 0, scale: 1, duration: MOTION.ui, ease: MOTION.ease
          });
        }
      }
    }
    function closeLightbox() {
      const done = () => {
        lightbox.classList.remove("open");
        lbMedia.innerHTML = "";
        if (window.gsap) gsap.set(lightbox, { clearProps: "opacity" });
      };
      if (window.gsap && !reduced && lightbox.classList.contains("open")) {
        const inner = lightbox.querySelector(".lightbox-inner");
        /* exit faster than enter; ease-out (never ease-in on UI) */
        if (inner) gsap.to(inner, { opacity: 0, y: 6, scale: 0.98, duration: MOTION.exit, ease: MOTION.easeExit });
        gsap.to(lightbox, { opacity: 0, duration: MOTION.exit, ease: MOTION.easeExit, onComplete: done });
      } else done();
    }
    document.getElementById("lbClose").addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });

    document.querySelectorAll("[data-lb]").forEach((el) => {
      el.addEventListener("click", () => {
        openLightbox(el.dataset.lb, el.dataset.src, el.dataset.cap);
      });
    });

    /* ---------- Cinema: mídia só no lightbox (sem preview embutido) ---------- */
    /* cards usam data-lb + clique global; sem video no card, sem autoplay no hover */
    document.querySelectorAll(".tl-node video").forEach((v) => {
      const parent = v.closest(".tl-node");
      if (!parent) return;
      parent.addEventListener("mouseenter", () => {
        if (!parent.classList.contains("is-open")) return;
        v.play().catch(() => {});
      });
      parent.addEventListener("mouseleave", () => v.pause());
    });

    /* ---------- Timeline: trilho reto preenchido conforme o scroll ---------- */
    let tlRailRaf = 0;

    function clamp01(v) { return Math.min(Math.max(v, 0), 1); }

    function paintTimelineRail() {
      tlRailRaf = 0;

      const track = document.getElementById("timelineTrack");
      const rail = document.getElementById("tlRail");
      const fill = document.getElementById("tlRailFill");
      if (!track || !rail || !fill) return;

      const nodes = Array.from(track.querySelectorAll(".tl-node"));
      if (!nodes.length) return;

      const railRect = rail.getBoundingClientRect();
      const railH = Math.max(railRect.height, 1);
      const trackRect = track.getBoundingClientRect();
      const anchor = trackRect.top + track.clientHeight * 0.42;
      const maxScroll = Math.max(track.scrollHeight - track.clientHeight, 0);
      const scrollTop = track.scrollTop;

      const marks = nodes.map((node) => {
        const r = node.getBoundingClientRect();
        const offset = Math.min(r.height * 0.3, 42);
        const markerScreen = r.top + offset;
        const y = markerScreen - railRect.top;
        const cross = scrollTop + (markerScreen - anchor);
        return { node: node, ratio: clamp01(y / railH), cross: cross };
      });

      const lastCross = marks[marks.length - 1].cross;
      const scale = lastCross > maxScroll && lastCross > 0 ? maxScroll / lastCross : 1;
      marks.forEach((m) => { m.at = clamp01(m.cross * scale); });
      marks.forEach((m) => { m.at = Math.min(Math.max(m.cross * scale, 0), maxScroll); });

      let p;
      if (maxScroll < 1) {
        p = marks[marks.length - 1].ratio;
      } else {
        let idx = 0;
        for (let i = 0; i < marks.length; i++) {
          if (marks[i].at <= scrollTop + 0.5) idx = i;
        }
        if (idx >= marks.length - 1) {
          p = marks[marks.length - 1].ratio;
        } else {
          const from = marks[idx];
          const to = marks[idx + 1];
          const span = to.at - from.at;
          const u = span > 1 ? (scrollTop - from.at) / span : 1;
          p = from.ratio + (to.ratio - from.ratio) * clamp01(u);
        }
      }
      p = clamp01(p);

      fill.style.transform = "scaleY(" + p.toFixed(4) + ")";

      let active = 0;
      marks.forEach((m, i) => { if (m.ratio <= p + 0.004) active = i; });
      marks.forEach((m, i) => {
        const lit = i <= active;
        if (m.node.classList.contains("is-lit") !== lit) m.node.classList.toggle("is-lit", lit);
      });
    }

    function updateTimelineRail() {
      if (tlRailRaf) return;
      tlRailRaf = requestAnimationFrame(paintTimelineRail);
    }

    const trackEl = document.getElementById("timelineTrack");
    if (trackEl) trackEl.addEventListener("scroll", updateTimelineRail, { passive: true });
    window.addEventListener("resize", updateTimelineRail);



    const setTlHint = (n, open) => {
      const h = n.querySelector(".tl-hint");
      if (h) h.textContent = open ? "Toque para fechar" : "Toque para revelar";
    };
    document.querySelectorAll(".tl-node").forEach((node) => {
      const hit = node.querySelector(".tl-hit");
      const media = node.querySelector(".tl-reveal-media");
      if (!hit) return;
      hit.addEventListener("click", () => {
        const wasOpen = node.classList.contains("is-open");
        document.querySelectorAll(".tl-node.is-open").forEach((n) => {
          if (n === node) return;
          n.classList.remove("is-open");
          const b = n.querySelector(".tl-hit");
          if (b) b.setAttribute("aria-expanded", "false");
          setTlHint(n, false);
          const v = n.querySelector("video");
          if (v) v.pause();
        });
        if (wasOpen) {
          node.classList.remove("is-open");
          hit.setAttribute("aria-expanded", "false");
          setTlHint(node, false);
          if (media && media.tagName === "VIDEO") media.pause();
        } else {
          node.classList.add("is-open");
          node.classList.add("is-lit");
          hit.setAttribute("aria-expanded", "true");
          setTlHint(node, true);
          if (media && media.tagName === "VIDEO") media.play().catch(() => {});
          const track = document.getElementById("timelineTrack");
          if (track) {
            const r = node.getBoundingClientRect();
            const tr = track.getBoundingClientRect();
            if (r.bottom > tr.bottom - 12 || r.top < tr.top + 12) {
              node.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }
          }
        }
        updateTimelineRail();
      });
    });

    /* ---------- Letters modal + 3D paper envelopes ---------- */
    const letterModal = document.getElementById("letterModal");
    const letterTitle = document.getElementById("letterTitle");
    const letterBody = document.getElementById("letterBody");
    let typeTimer = null;

    const LETTER_DATA = [
      {
        stamp: "01",
        title: "Para você",
        body: "Se eu pudesse te dar o mundo embrulhado, dava. Como não dá, te dou esta certeza: você é a primeira pessoa que penso quando acordo — e a última antes de dormir."
      },
      {
        stamp: "02",
        title: "Nos dias longos",
        body: "Tem dia em que o relógio anda devagar de propósito. Nesses, eu procuro você pela casa, ouço a sua risada e lembro: o melhor lugar do mundo é onde a gente está."
      },
      {
        stamp: "03",
        title: "Promessa",
        body: "Eu prometo continuar escolhendo a gente. Nos dias fáceis e nos dias difíceis. Você, eu e o Benício — o nosso “nós” no meio, firme."
      },
      {
        stamp: "04",
        title: "Aniversário",
        body: "Hoje o mundo completa mais uma volta com você nele — e eu agradeço. Obrigado por existir com essa luz, essa teimosia gostosa, esse jeito de ser casa. Feliz aniversário, Thais."
      },
      {
        stamp: "05",
        title: "Desde __/__/____",
        body: "Desde __/__/____, o tempo deixou de ser só calendário. Virou contagem do que a gente construiu: um amor, uma casa, uma família."
      },
      {
        stamp: "06",
        title: "Cada segundo",
        body: "Não é o tempo que passa — é o tempo que a gente enche de nós. Cada segundo ao seu lado vale mais do que horas inteiras sem o seu nome no ar."
      },
      {
        stamp: "07",
        title: "O relógio e a gente",
        body: "O relógio marca horas. A gente marca encontros, risadas, silêncios bons. Se o tempo tivesse favorito, seria o instante em que você digita e eu já sorrio antes de ler."
      },
      {
        stamp: "08",
        title: "Tempo a favor",
        body: "Dizem que o tempo cura. Eu digo que o tempo a favor da gente é o que a gente constrói: paciência, planos e a certeza de que o melhor ainda está por vir."
      },
      {
        stamp: "09",
        title: "Olhos de mel",
        body: "Tem um brilho no seu olhar que atravessa qualquer dia cinza. Olhos de mel — doces o bastante pra derreter o mundo inteiro."
      },
      {
        stamp: "10",
        title: "Café e sol",
        body: "Bom dia, amor. Café quente, sol na janela e a vontade de te dar um pedaço do meu dia. Se eu pudesse, te servia o café e te beijava a testa."
      },
      {
        stamp: "11",
        title: "O olhar",
        body: "Às vezes não preciso de palavras longas. Só do seu olhar — mesmo em foto, mesmo num instante qualquer. É ali que eu me encontro de novo."
      },
      {
        stamp: "12",
        title: "Mel no escuro",
        body: "Simples assim, sem enfeite demais: eu te amo. Do jeito quieto e do jeito barulhento. Do jeito que cabe num áudio de 15 segundos e do jeito que não cabe em site nenhum — mas eu tentei. Você é mel no escuro."
      }
    ];

    function bindEnvCardTilt(btn) {
      if (reduced || btn.dataset.tiltBound === "1") return;
      btn.dataset.tiltBound = "1";
      let raf = 0;
      const maxX = 13;
      const maxY = 16;

      const setTilt = (rx, ry, hot) => {
        btn.style.setProperty("--env-rx", rx.toFixed(2) + "deg");
        btn.style.setProperty("--env-ry", ry.toFixed(2) + "deg");
        btn.classList.toggle("is-hot", !!hot);
      };

      const onMove = (e) => {
        const r = btn.getBoundingClientRect();
        if (!r.width || !r.height) return;
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          setTilt(-py * maxX * 2, px * maxY * 2, true);
        });
      };

      const onLeave = () => {
        cancelAnimationFrame(raf);
        setTilt(0, 0, false);
      };

      btn.addEventListener("pointerenter", () => btn.classList.add("is-hot"));
      btn.addEventListener("pointermove", onMove);
      btn.addEventListener("pointerleave", onLeave);
      btn.addEventListener("pointercancel", onLeave);
      btn.addEventListener("blur", onLeave);
    }

    function mountLettersGrid() {
      const grid = document.getElementById("lettersGrid");
      if (!grid || grid.dataset.ready === "1") return;
      const playSvg = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
      grid.innerHTML = LETTER_DATA.map((d, i) => `
        <button type="button" class="env-card" role="listitem" data-letter-index="${i}"
          aria-label="Abrir carta ${d.stamp}: ${d.title}">
          <span class="env-crease" aria-hidden="true"></span>
          <span class="env-paper" aria-hidden="true"></span>
          <span class="env-pocket" aria-hidden="true"></span>
          <span class="env-flap" aria-hidden="true">
            <span class="env-flap-face"></span>
            <span class="env-flap-back"></span>
            <span class="env-seal">${playSvg}</span>
          </span>
          <span class="env-stamp">${d.stamp}</span>
          <span class="env-title">${d.title}</span>
        </button>
      `).join("");
      grid.dataset.ready = "1";
      grid.querySelectorAll(".env-card").forEach((btn) => {
        btn.addEventListener("click", () => {
          const idx = Number(btn.dataset.letterIndex);
          const d = LETTER_DATA[idx];
          if (d) openLetter(d.title, d.body);
        });
        bindEnvCardTilt(btn);
      });
      if (typeof bindCursorTargets === "function") bindCursorTargets(grid);
    }

    function openLetter(title, body) {
      letterTitle.textContent = title;
      letterBody.textContent = "";
      letterModal.classList.add("open");
      const sheet = letterModal.querySelector(".letter-sheet");
      if (window.gsap && !reduced) {
        gsap.fromTo(letterModal, { opacity: 0 }, { opacity: 1, duration: MOTION.ui, ease: MOTION.ease });
        if (sheet) {
          gsap.fromTo(sheet, { opacity: 0, y: 14, scale: 0.97 }, {
            opacity: 1, y: 0, scale: 1, duration: MOTION.enter, ease: MOTION.ease
          });
        }
      }
      let i = 0;
      clearInterval(typeTimer);
      if (reduced) { letterBody.textContent = body; return; }
      typeTimer = setInterval(() => {
        i++;
        letterBody.textContent = body.slice(0, i);
        if (i >= body.length) clearInterval(typeTimer);
      }, 14);
    }
    function closeLetter() {
      clearInterval(typeTimer);
      const done = () => {
        letterModal.classList.remove("open");
        if (window.gsap) gsap.set(letterModal, { clearProps: "opacity" });
      };
      if (window.gsap && !reduced && letterModal.classList.contains("open")) {
        const sheet = letterModal.querySelector(".letter-sheet");
        if (sheet) gsap.to(sheet, { opacity: 0, y: 6, scale: 0.98, duration: MOTION.exit, ease: MOTION.easeExit });
        gsap.to(letterModal, { opacity: 0, duration: MOTION.exit, ease: MOTION.easeExit, onComplete: done });
      } else done();
    }
    document.getElementById("letterClose").addEventListener("click", closeLetter);
    letterModal.addEventListener("click", (e) => { if (e.target === letterModal) closeLetter(); });
    mountLettersGrid();

    /* Procedural paper (linen) texture */
    function makePaperTexture(title, stamp) {
      const c = document.createElement("canvas");
      c.width = 512;
      c.height = 360;
      const ctx = c.getContext("2d");
      // cream base
      const g = ctx.createLinearGradient(0, 0, 512, 360);
      g.addColorStop(0, "#f5efe4");
      g.addColorStop(0.5, "#ebe2d2");
      g.addColorStop(1, "#e6dcc8");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 512, 360);
      // linen grain
      for (let i = 0; i < 9000; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 360;
        const a = 0.03 + Math.random() * 0.05;
        ctx.fillStyle = Math.random() > 0.5
          ? "rgba(120,90,60," + a + ")"
          : "rgba(255,255,255," + a + ")";
        ctx.fillRect(x, y, 1.2, 1.2);
      }
      // subtle diagonal weave
      ctx.strokeStyle = "rgba(180,150,110,0.06)";
      ctx.lineWidth = 1;
      for (let i = -360; i < 512; i += 6) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + 360, 360);
        ctx.stroke();
      }
      // V flap crease shadow
      ctx.fillStyle = "rgba(160,130,90,0.12)";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(256, 150);
      ctx.lineTo(512, 0);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(120,90,60,0.18)";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(256, 150);
      ctx.lineTo(512, 0);
      ctx.stroke();

      // stamp number top-right
      ctx.save();
      ctx.translate(430, 42);
      ctx.rotate(-0.08);
      ctx.strokeStyle = "rgba(255,45,85,0.45)";
      ctx.lineWidth = 2;
      ctx.strokeRect(-28, -18, 56, 36);
      ctx.fillStyle = "rgba(255,45,85,0.55)";
      ctx.font = "600 18px Inter, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(stamp, 0, 1);
      ctx.restore();

      // PARA VOCÊ
      ctx.fillStyle = "rgba(60,45,40,0.45)";
      ctx.font = "500 13px Inter, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.letterSpacing = "0.28em";
      ctx.fillText("PARA VOCÊ", 256, 200);

      // title
      ctx.fillStyle = "rgba(40,30,28,0.88)";
      ctx.font = "italic 500 36px 'Cormorant Garamond', Georgia, serif";
      ctx.fillText(title, 256, 248);

      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 4;
      return tex;
    }

    function makeFlapTexture() {
      const c = document.createElement("canvas");
      c.width = 512;
      c.height = 256;
      const ctx = c.getContext("2d");
      const g = ctx.createLinearGradient(0, 0, 0, 256);
      g.addColorStop(0, "#f0e8da");
      g.addColorStop(1, "#e2d6c0");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 512, 256);
      for (let i = 0; i < 4000; i++) {
        ctx.fillStyle = "rgba(140,110,70," + (0.03 + Math.random() * 0.04) + ")";
        ctx.fillRect(Math.random() * 512, Math.random() * 256, 1, 1);
      }
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    }

    function makeSealTexture() {
      const c = document.createElement("canvas");
      c.width = 128;
      c.height = 128;
      const ctx = c.getContext("2d");
      const g = ctx.createRadialGradient(45, 40, 8, 64, 64, 60);
      g.addColorStop(0, "#ff8fb0");
      g.addColorStop(0.45, "#ff2d55");
      g.addColorStop(1, "#c41840");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(64, 64, 58, 0, Math.PI * 2);
      ctx.fill();
      // mini heart
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      const hx = 64, hy = 68, s = 0.55;
      ctx.moveTo(hx, hy + 10 * s);
      ctx.bezierCurveTo(hx, hy + 10 * s, hx - 2 * s, hy - 6 * s, hx - 16 * s, hy - 6 * s);
      ctx.bezierCurveTo(hx - 32 * s, hy - 6 * s, hx - 32 * s, hy + 12 * s, hx - 32 * s, hy + 12 * s);
      ctx.bezierCurveTo(hx - 32 * s, hy + 24 * s, hx - 16 * s, hy + 36 * s, hx, hy + 48 * s);
      ctx.bezierCurveTo(hx + 16 * s, hy + 36 * s, hx + 32 * s, hy + 24 * s, hx + 32 * s, hy + 12 * s);
      ctx.bezierCurveTo(hx + 32 * s, hy + 12 * s, hx + 32 * s, hy - 6 * s, hx + 16 * s, hy - 6 * s);
      ctx.bezierCurveTo(hx + 4 * s, hy - 6 * s, hx, hy + 10 * s, hx, hy + 10 * s);
      ctx.fill();
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    }

    function createEnvelopeMesh(data, indexEnv) {
      const group = new THREE.Group();
      group.userData = { letterIndex: indexEnv, data, open: false };

      const paperTex = makePaperTexture(data.title, data.stamp);
      const flapTex = makeFlapTexture();
      const sealTex = makeSealTexture();

      const bodyMat = new THREE.MeshStandardMaterial({
        map: paperTex,
        roughness: 0.82,
        metalness: 0.02,
        side: THREE.DoubleSide
      });
      const sideMat = new THREE.MeshStandardMaterial({
        color: 0xd8cbb4,
        roughness: 0.9,
        metalness: 0
      });

      // body box — thin envelope
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 1.55, 0.06),
        [sideMat, sideMat, sideMat, sideMat, bodyMat, sideMat]
      );
      body.position.z = 0;
      group.add(body);

      // V flap (triangular) as a plane folded from top
      const flapShape = new THREE.Shape();
      flapShape.moveTo(-1.2, 0);
      flapShape.lineTo(1.2, 0);
      flapShape.lineTo(0, -0.95);
      flapShape.lineTo(-1.2, 0);
      const flapGeo = new THREE.ShapeGeometry(flapShape);
      const flapMat = new THREE.MeshStandardMaterial({
        map: flapTex,
        roughness: 0.85,
        metalness: 0.02,
        side: THREE.DoubleSide
      });
      const flap = new THREE.Mesh(flapGeo, flapMat);
      // pivot at top edge of envelope
      const flapPivot = new THREE.Group();
      flapPivot.position.set(0, 0.775, 0.035);
      flap.position.set(0, 0, 0);
      flap.rotation.x = 0.02;
      flapPivot.add(flap);
      group.add(flapPivot);
      group.userData.flapPivot = flapPivot;

      // wax seal
      const seal = new THREE.Mesh(
        new THREE.CircleGeometry(0.22, 32),
        new THREE.MeshStandardMaterial({
          map: sealTex,
          roughness: 0.35,
          metalness: 0.15,
          emissive: 0xff2d55,
          emissiveIntensity: 0.12
        })
      );
      seal.position.set(0, 0.12, 0.04);
      group.add(seal);
      group.userData.seal = seal;

      // slight thickness rim at front for paper edge
      const rim = new THREE.Mesh(
        new THREE.PlaneGeometry(2.38, 1.52),
        new THREE.MeshBasicMaterial({
          color: 0xc4b49a,
          transparent: true,
          opacity: 0.15,
          side: THREE.BackSide
        })
      );
      rim.position.z = -0.032;
      group.add(rim);

      group.userData.textures = [paperTex, flapTex, sealTex];
      group.userData.meshes = [body, flap, seal, rim];
      return group;
    }

    let letters3 = null;

    function useLettersFallback() {
      const canvas = document.getElementById("letters3d");
      if (canvas) canvas.style.display = "none";
      mountLettersGrid();
    }

    function stopLetters3D() {
      if (!letters3) return;
      letters3.running = false;
      if (letters3.raf) cancelAnimationFrame(letters3.raf);
      // keep GPU resources until full dispose when leaving permanently — soft pause only
    }

    function disposeLetters3D() {
      if (!letters3) return;
      letters3.running = false;
      if (letters3.raf) cancelAnimationFrame(letters3.raf);
      if (letters3.onResize) window.removeEventListener("resize", letters3.onResize);
      if (letters3.canvas) {
        letters3.canvas.removeEventListener("pointerdown", letters3.onDown);
        letters3.canvas.removeEventListener("pointermove", letters3.onMove);
        letters3.canvas.removeEventListener("pointerup", letters3.onUp);
      }
      letters3.envelopes.forEach((env) => {
        env.userData.textures.forEach((t) => t.dispose());
        env.traverse((o) => {
          if (o.geometry) o.geometry.dispose();
          if (o.material) {
            if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose());
            else o.material.dispose();
          }
        });
      });
      if (letters3.renderer) letters3.renderer.dispose();
      letters3 = null;
    }

    function startLetters3D() {
      // Grade de envelopes da referência (image-3) — CSS, legível e tocável
      useLettersFallback();
    }

    /* ---------- Map canvas — céu do nosso lar ---------- */
    const mapCanvas = document.getElementById("mapCanvas");
    let map2 = null;

    function disposeMap3D() {
      if (!map2) return;
      map2.running = false;
      if (map2.raf) cancelAnimationFrame(map2.raf);
      if (map2.onResize) window.removeEventListener("resize", map2.onResize);
      map2 = null;
    }

    function resizeMap() {
      if (!map2 || !mapCanvas) return;
      const stage = mapCanvas.parentElement;
      const ww = stage.clientWidth || 340;
      const hh = stage.clientHeight || 480;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      mapCanvas.width = Math.floor(ww * dpr);
      mapCanvas.height = Math.floor(hh * dpr);
      mapCanvas.style.width = ww + "px";
      mapCanvas.style.height = hh + "px";
      map2.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      map2.w = ww;
      map2.h = hh;
    }

    function drawMapFrame() {
      if (!map2) return;
      const { ctx, w, h, pulse } = map2;
      ctx.clearRect(0, 0, w, h);

      /* estrelas suaves */
      for (let i = 0; i < map2.stars.length; i++) {
        const s = map2.stars[i];
        const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(pulse * 1.4 + s.p));
        ctx.globalAlpha = s.a * tw;
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    function loopMap2D() {
      if (!map2 || !map2.running) {
        if (map2) map2.raf = null;
        return;
      }
      if (scenes[index]?.id !== "scene-map") {
        map2.running = false;
        map2.raf = null;
        return;
      }
      map2.pulse = performance.now() * 0.001;
      drawMapFrame();
      map2.raf = requestAnimationFrame(loopMap2D);
    }

    function startMap() {
      if (!mapCanvas) return;

      if (map2 && map2.ctx) {
        map2.running = true;
        resizeMap();
        if (!map2.raf) loopMap2D();
        return;
      }

      const ctx = mapCanvas.getContext("2d");
      if (!ctx) return;

      const stars = Array.from({ length: 48 }, () => ({
        x: Math.random(),
        y: Math.random(),
        r: 0.4 + Math.random() * 1.2,
        a: 0.15 + Math.random() * 0.55,
        p: Math.random() * Math.PI * 2
      }));

      map2 = {
        ctx,
        w: 0,
        h: 0,
        pulse: 0,
        stars,
        running: true,
        raf: null,
        onResize: null
      };

      map2.onResize = () => {
        if (scenes[index]?.id === "scene-map") resizeMap();
      };
      window.addEventListener("resize", map2.onResize);
      resizeMap();
      loopMap2D();
    }

    window.addEventListener("resize", () => {
      if (scenes[index]?.id === "scene-map") resizeMap();
    });

    /* ---------- Counter ---------- */
    let counterTimer = null;
    function startCounter() {
      const tick = () => {
        if (!START_DATE) {
          ["cDays", "cHours", "cMins", "cSecs"].forEach((id) => {
            document.getElementById(id).textContent = "--";
          });
          return;
        }
        const now = new Date();
        let diff = Math.max(0, now - START_DATE);
        const days = Math.floor(diff / 86400000); diff -= days * 86400000;
        const hours = Math.floor(diff / 3600000); diff -= hours * 3600000;
        const mins = Math.floor(diff / 60000); diff -= mins * 60000;
        const secs = Math.floor(diff / 1000);
        document.getElementById("cDays").textContent = days;
        document.getElementById("cHours").textContent = hours;
        document.getElementById("cMins").textContent = mins;
        document.getElementById("cSecs").textContent = secs;
      };
      tick();
      clearInterval(counterTimer);
      counterTimer = setInterval(tick, 1000);
    }

    /* ---------- Constellation (cosmic canvas) ---------- */
    const constCanvas = document.getElementById("constCanvas");
    const cctx = constCanvas.getContext("2d");
    const memories = [
      "O primeiro bom dia",
      "Sua risada",
      "Nosso __/__/____",
      "O nosso lar",
      "O Benício",
      "O primeiro aninho",
      "O seu aniversário",
      "A nossa promessa",
      "Para sempre"
    ];
    let constStars = [];
    let fieldStars = [];
    let dustMotes = [];
    let shooters = [];
    let constRaf = null;
    let hoverMem = -1;
    let constT = 0;
    let constW = 0;
    let constH = 0;

    function seedField(w, h) {
      const n = Math.max(90, Math.floor((w * h) / 1400));
      fieldStars = Array.from({ length: n }, () => {
        const layer = Math.random();
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          r: layer < 0.55 ? 0.35 + Math.random() * 0.55 : 0.7 + Math.random() * 1.4,
          a: 0.15 + Math.random() * 0.75,
          tw: Math.random() * Math.PI * 2,
          twSp: 0.012 + Math.random() * 0.04,
          hue: Math.random() < 0.12 ? 42 : Math.random() < 0.2 ? 330 : 210,
          layer: layer
        };
      });
      dustMotes = Array.from({ length: 28 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 8 + Math.random() * 28,
        a: 0.02 + Math.random() * 0.05,
        drift: (Math.random() - 0.5) * 0.08,
        rise: -0.02 - Math.random() * 0.04
      }));
      shooters = [];
    }

    function spawnShooter(w, h) {
      if (reduced) return;
      const fromLeft = Math.random() > 0.5;
      shooters.push({
        x: fromLeft ? -20 : w + 20,
        y: Math.random() * h * 0.45,
        vx: fromLeft ? 3.2 + Math.random() * 2.4 : -(3.2 + Math.random() * 2.4),
        vy: 1.1 + Math.random() * 1.6,
        life: 1,
        decay: 0.012 + Math.random() * 0.01,
        len: 40 + Math.random() * 50
      });
    }

    function resizeConst() {
      const stage = constCanvas.parentElement;
      constCanvas.width = stage.clientWidth * devicePixelRatio;
      constCanvas.height = stage.clientHeight * devicePixelRatio;
      cctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      const w = stage.clientWidth, h = stage.clientHeight;
      constW = w; constH = h;
      seedField(w, h);
      constStars = memories.map((m, i) => {
        const ang = (i / memories.length) * Math.PI * 2 - Math.PI / 2;
        const rad = Math.min(w, h) * 0.28;
        return {
          x: w / 2 + Math.cos(ang) * rad + (i % 2 ? 18 : -12),
          y: h / 2 + Math.sin(ang) * rad * 0.75,
          r: 2.8 + (i % 3) * 0.35,
          mem: m,
          pulse: Math.random() * Math.PI * 2,
          hue: i === 2 ? 42 : (i % 2 ? 340 : 200)
        };
      });
    }

    function drawNebula(w, h, t) {
      const cx = w * 0.5 + Math.sin(t * 0.15) * 12;
      const cy = h * 0.52 + Math.cos(t * 0.12) * 8;
      const g1 = cctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(w, h) * 0.55);
      g1.addColorStop(0, "rgba(120, 60, 140, 0.22)");
      g1.addColorStop(0.35, "rgba(60, 40, 120, 0.12)");
      g1.addColorStop(0.7, "rgba(20, 30, 80, 0.06)");
      g1.addColorStop(1, "rgba(0,0,0,0)");
      cctx.fillStyle = g1;
      cctx.fillRect(0, 0, w, h);

      const g2 = cctx.createRadialGradient(w * 0.22, h * 0.28, 0, w * 0.22, h * 0.28, Math.min(w, h) * 0.38);
      g2.addColorStop(0, "rgba(40, 80, 160, 0.14)");
      g2.addColorStop(0.55, "rgba(80, 40, 100, 0.06)");
      g2.addColorStop(1, "rgba(0,0,0,0)");
      cctx.fillStyle = g2;
      cctx.fillRect(0, 0, w, h);

      const g3 = cctx.createRadialGradient(w * 0.78, h * 0.7, 0, w * 0.78, h * 0.7, Math.min(w, h) * 0.32);
      g3.addColorStop(0, "rgba(180, 50, 90, 0.1)");
      g3.addColorStop(0.6, "rgba(100, 40, 80, 0.04)");
      g3.addColorStop(1, "rgba(0,0,0,0)");
      cctx.fillStyle = g3;
      cctx.fillRect(0, 0, w, h);

      // soft milky-way band
      cctx.save();
      cctx.translate(w / 2, h / 2);
      cctx.rotate(-0.45 + Math.sin(t * 0.05) * 0.03);
      const band = cctx.createLinearGradient(-w * 0.6, 0, w * 0.6, 0);
      band.addColorStop(0, "rgba(180,190,255,0)");
      band.addColorStop(0.35, "rgba(200,210,255,0.04)");
      band.addColorStop(0.5, "rgba(255,240,255,0.08)");
      band.addColorStop(0.65, "rgba(200,210,255,0.04)");
      band.addColorStop(1, "rgba(180,190,255,0)");
      cctx.fillStyle = band;
      cctx.fillRect(-w * 0.6, -h * 0.08, w * 1.2, h * 0.16);
      cctx.restore();
    }

    function drawFieldStar(s, t) {
      s.tw += s.twSp;
      const twinkle = 0.55 + 0.45 * Math.sin(s.tw + t * 0.4);
      const a = Math.min(1, s.a * twinkle * 1.45);
      const r = s.r * (0.95 + twinkle * 0.35);
      if (s.layer > 0.82) {
        cctx.save();
        cctx.globalAlpha = a * 0.75;
        cctx.strokeStyle = s.hue === 42 ? "rgba(255,230,160,1)" : "rgba(245,250,255,0.95)";
        cctx.lineWidth = 0.75;
        cctx.beginPath();
        cctx.moveTo(s.x - r * 3.6, s.y);
        cctx.lineTo(s.x + r * 3.6, s.y);
        cctx.moveTo(s.x, s.y - r * 3.6);
        cctx.lineTo(s.x, s.y + r * 3.6);
        cctx.stroke();
        cctx.restore();
      }
      // soft halo
      cctx.beginPath();
      cctx.fillStyle = s.hue === 42
        ? `rgba(255, 230, 160, ${a * 0.35})`
        : s.hue === 330
          ? `rgba(255, 200, 230, ${a * 0.35})`
          : `rgba(230, 240, 255, ${a * 0.3})`;
      cctx.arc(s.x, s.y, r * 2.4, 0, Math.PI * 2);
      cctx.fill();
      cctx.beginPath();
      cctx.fillStyle = s.hue === 42
        ? `rgba(255, 235, 180, ${a})`
        : s.hue === 330
          ? `rgba(255, 210, 230, ${a})`
          : `rgba(240, 245, 255, ${a})`;
      cctx.arc(s.x, s.y, r, 0, Math.PI * 2);
      cctx.fill();
    }

    function drawMemStar(s, i, t) {
      s.pulse += 0.028;
      const hot = i === hoverMem;
      const breathe = 0.75 + 0.25 * Math.sin(s.pulse);
      const coreR = s.r * 1.2 + (hot ? 2.8 : 0.4) + Math.sin(s.pulse) * 1.0;
      const glowR = coreR * (hot ? 9.5 : 7.0) * breathe;

      // outer nebula glow — brighter
      const og = cctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, glowR);
      if (hot) {
        og.addColorStop(0, "rgba(255, 235, 180, 0.85)");
        og.addColorStop(0.22, "rgba(255, 200, 100, 0.4)");
        og.addColorStop(0.5, "rgba(255, 120, 160, 0.16)");
        og.addColorStop(1, "rgba(0,0,0,0)");
      } else if (s.hue === 42) {
        og.addColorStop(0, "rgba(255, 235, 170, 0.7)");
        og.addColorStop(0.3, "rgba(255, 200, 100, 0.28)");
        og.addColorStop(0.65, "rgba(255, 160, 80, 0.08)");
        og.addColorStop(1, "rgba(0,0,0,0)");
      } else {
        og.addColorStop(0, "rgba(255, 255, 255, 0.78)");
        og.addColorStop(0.18, "rgba(255, 170, 200, 0.35)");
        og.addColorStop(0.48, "rgba(160, 120, 255, 0.14)");
        og.addColorStop(1, "rgba(0,0,0,0)");
      }
      cctx.fillStyle = og;
      cctx.beginPath();
      cctx.arc(s.x, s.y, glowR, 0, Math.PI * 2);
      cctx.fill();

      // diffraction spikes — brighter
      cctx.save();
      cctx.translate(s.x, s.y);
      cctx.rotate(t * 0.08 + i * 0.4);
      const spike = coreR * (hot ? 6.5 : 4.8) * breathe;
      const spikeGrad = cctx.createLinearGradient(-spike, 0, spike, 0);
      spikeGrad.addColorStop(0, "rgba(255,255,255,0)");
      spikeGrad.addColorStop(0.5, hot ? "rgba(255,240,190,0.95)" : "rgba(255,255,255,0.78)");
      spikeGrad.addColorStop(1, "rgba(255,255,255,0)");
      cctx.strokeStyle = spikeGrad;
      cctx.lineWidth = hot ? 1.7 : 1.2;
      cctx.beginPath();
      cctx.moveTo(-spike, 0);
      cctx.lineTo(spike, 0);
      cctx.moveTo(0, -spike * 0.85);
      cctx.lineTo(0, spike * 0.85);
      cctx.stroke();
      // diagonal spikes (softer)
      cctx.globalAlpha = 0.65;
      cctx.rotate(Math.PI / 4);
      cctx.beginPath();
      cctx.moveTo(-spike * 0.6, 0);
      cctx.lineTo(spike * 0.6, 0);
      cctx.moveTo(0, -spike * 0.5);
      cctx.lineTo(0, spike * 0.5);
      cctx.stroke();
      cctx.restore();

      // bright core
      const core = cctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, coreR * 1.9);
      core.addColorStop(0, "#ffffff");
      core.addColorStop(0.28, hot ? "#FFF2C8" : "#ffffff");
      core.addColorStop(0.55, hot ? "rgba(255,210,120,0.95)" : "rgba(255,230,240,0.92)");
      core.addColorStop(0.82, hot ? "rgba(255,180,90,0.55)" : "rgba(255,190,220,0.45)");
      core.addColorStop(1, "rgba(255,255,255,0)");
      cctx.fillStyle = core;
      cctx.beginPath();
      cctx.arc(s.x, s.y, coreR * 1.9, 0, Math.PI * 2);
      cctx.fill();

      cctx.beginPath();
      cctx.fillStyle = "#fff";
      cctx.arc(s.x, s.y, Math.max(1.5, coreR * 0.7), 0, Math.PI * 2);
      cctx.fill();
    }

    function drawLinks(t) {
      // soft glow pass — thin + transparent
      cctx.save();
      cctx.lineCap = "round";
      cctx.shadowColor = "rgba(255, 140, 190, 0.18)";
      cctx.shadowBlur = 4;
      cctx.strokeStyle = `rgba(255, 170, 200, ${0.055 + 0.02 * Math.sin(t * 0.6)})`;
      cctx.lineWidth = 0.65;
      cctx.beginPath();
      constStars.forEach((s, i) => {
        const n = constStars[(i + 1) % constStars.length];
        cctx.moveTo(s.x, s.y);
        cctx.lineTo(n.x, n.y);
      });
      for (let i = 0; i < constStars.length; i += 2) {
        const n = constStars[(i + 3) % constStars.length];
        cctx.moveTo(constStars[i].x, constStars[i].y);
        cctx.lineTo(n.x, n.y);
      }
      cctx.stroke();
      cctx.restore();

      // crisp inner filament — hairline
      cctx.strokeStyle = "rgba(255, 235, 250, 0.1)";
      cctx.lineWidth = 0.35;
      cctx.beginPath();
      constStars.forEach((s, i) => {
        const n = constStars[(i + 1) % constStars.length];
        cctx.moveTo(s.x, s.y);
        cctx.lineTo(n.x, n.y);
      });
      for (let i = 0; i < constStars.length; i += 2) {
        const n = constStars[(i + 3) % constStars.length];
        cctx.moveTo(constStars[i].x, constStars[i].y);
        cctx.lineTo(n.x, n.y);
      }
      cctx.stroke();

      // traveling light along ring — softer so links stay delicate
      if (!reduced && constStars.length) {
        const n = constStars.length;
        const u = ((t * 0.18) % 1) * n;
        const i0 = Math.floor(u) % n;
        const i1 = (i0 + 1) % n;
        const f = u - Math.floor(u);
        const px = constStars[i0].x + (constStars[i1].x - constStars[i0].x) * f;
        const py = constStars[i0].y + (constStars[i1].y - constStars[i0].y) * f;
        const pg = cctx.createRadialGradient(px, py, 0, px, py, 8);
        pg.addColorStop(0, "rgba(255,245,220,0.55)");
        pg.addColorStop(0.4, "rgba(255,170,210,0.18)");
        pg.addColorStop(1, "rgba(0,0,0,0)");
        cctx.fillStyle = pg;
        cctx.beginPath();
        cctx.arc(px, py, 8, 0, Math.PI * 2);
        cctx.fill();
      }
    }

    function startConstellation() {
      resizeConst();
      cancelAnimationFrame(constRaf);
      let lastSpawn = 0;
      const draw = (now) => {
        if (scenes[index].id !== "scene-constellation") return;
        const w = constCanvas.clientWidth || constCanvas.parentElement.clientWidth;
        const h = constCanvas.clientHeight || constCanvas.parentElement.clientHeight;
        constT = (now || performance.now()) * 0.001;

        cctx.clearRect(0, 0, w, h);

        // deep space wash (drawn on canvas only)
        const sky = cctx.createRadialGradient(w * 0.5, h * 0.55, 0, w * 0.5, h * 0.55, Math.max(w, h) * 0.72);
        sky.addColorStop(0, "rgba(12, 16, 36, 0.55)");
        sky.addColorStop(0.55, "rgba(6, 8, 20, 0.35)");
        sky.addColorStop(1, "rgba(2, 2, 8, 0.15)");
        cctx.fillStyle = sky;
        cctx.fillRect(0, 0, w, h);

        drawNebula(w, h, constT);

        // dust
        dustMotes.forEach((d) => {
          d.x += d.drift;
          d.y += d.rise;
          if (d.x < -40) d.x = w + 40;
          if (d.x > w + 40) d.x = -40;
          if (d.y < -40) d.y = h + 40;
          const dg = cctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.r);
          dg.addColorStop(0, `rgba(200,180,255,${d.a})`);
          dg.addColorStop(1, "rgba(0,0,0,0)");
          cctx.fillStyle = dg;
          cctx.beginPath();
          cctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
          cctx.fill();
        });

        // background starfield
        fieldStars.forEach((s) => drawFieldStar(s, constT));

        // constellation geometry
        drawLinks(constT);
        constStars.forEach((s, i) => drawMemStar(s, i, constT));

        // shooting stars
        if (!reduced && constT - lastSpawn > 4.5 + Math.random() * 3) {
          spawnShooter(w, h);
          lastSpawn = constT;
        }
        shooters = shooters.filter((sh) => sh.life > 0);
        shooters.forEach((sh) => {
          sh.x += sh.vx;
          sh.y += sh.vy;
          sh.life -= sh.decay;
          const tx = sh.x - sh.vx * (sh.len / 4);
          const ty = sh.y - sh.vy * (sh.len / 4);
          const sg = cctx.createLinearGradient(tx, ty, sh.x, sh.y);
          sg.addColorStop(0, "rgba(255,255,255,0)");
          sg.addColorStop(0.6, `rgba(255,230,200,${0.35 * sh.life})`);
          sg.addColorStop(1, `rgba(255,255,255,${0.95 * sh.life})`);
          cctx.strokeStyle = sg;
          cctx.lineWidth = 1.5;
          cctx.lineCap = "round";
          cctx.beginPath();
          cctx.moveTo(tx, ty);
          cctx.lineTo(sh.x, sh.y);
          cctx.stroke();
          cctx.beginPath();
          cctx.fillStyle = `rgba(255,255,255,${sh.life})`;
          cctx.arc(sh.x, sh.y, 1.6, 0, Math.PI * 2);
          cctx.fill();
        });

        constRaf = requestAnimationFrame(draw);
      };
      draw();
    }

    function pickStar(x, y) {
      const rect = constCanvas.getBoundingClientRect();
      const px = x - rect.left, py = y - rect.top;
      let best = -1, bestD = 32;
      constStars.forEach((s, i) => {
        const d = Math.hypot(s.x - px, s.y - py);
        if (d < bestD) { bestD = d; best = i; }
      });
      return best;
    }
    constCanvas.addEventListener("mousemove", (e) => {
      hoverMem = pickStar(e.clientX, e.clientY);
      document.getElementById("constTip").textContent =
        hoverMem >= 0 ? constStars[hoverMem].mem : "Toque em uma estrela para revelar uma memória";
    });
    constCanvas.addEventListener("click", (e) => {
      const i = pickStar(e.clientX, e.clientY);
      if (i >= 0) {
        document.getElementById("constTip").textContent = constStars[i].mem;
        hoverMem = i;
      }
    });
    window.addEventListener("resize", () => {
      if (scenes[index]?.id === "scene-constellation") resizeConst();
    });

    /* ---------- Book ---------- */
    const pages = [
      { script: "Para Thais", text: "Se este site fosse um livro, a primeira página seria só o seu nome — escrito devagar, com medo de errar a letra e estragar a magia." },
      { script: "Nosso lar", text: "Não é um endereço. É o jeito que a casa fica quando você está nela: mais leve, mais quente, mais nossa." },
      { script: "__/__/____", text: "O dia em que paramos de só gostar e começamos a construir. Obrigado por ter dito sim — com a boca, com o olhar, com a vida." },
      { script: "Benício", text: "O nosso maior presente chegou pequeno, de mãos fechadas, e abriu o mundo inteiro. Desde então, tudo tem mais cor." },
      { script: "Beleza", text: "Sua beleza não pede flash nem filtro. É o jeito que o dia muda quando você entra nele — suave, inevitável, como se o mundo tivesse ensaiado só pra te enquadrar." },
      { script: "Olhos", text: "Nos seus olhos eu me perco de propósito. Tem um silêncio que fala, uma calma que me desmonta, e um brilho que me faz lembrar por que eu escolhi te amar todos os dias." },
      { script: "Sorriso", text: "Seu sorriso é o atalho mais curto entre um dia difícil e o peito quente. Quando ele aparece, o mundo inteiro fica mais fácil." },
      { script: "Presença", text: "Tem uma beleza sua que não cabe em foto: a do jeito que você ocupa o espaço. Você é a presença que ordena o meu caos e deixa o ar mais leve." },
      { script: "Eternidade", text: "Se eu pudesse escolher um único retrato pra guardar até o fim, seria o instante em que seus olhos me encontram — porque ali, Thais, o tempo para e o amor se explica sozinho." }
    ];
    let pageIndex = 0;
    const bookPage = document.getElementById("bookPage");
    const bookScript = document.getElementById("bookScript");
    const bookText = document.getElementById("bookText");
    const bookNum = document.getElementById("bookNum");
    const bookPrev = document.getElementById("bookPrev");
    const bookNext = document.getElementById("bookNext");

    function renderPage(dir) {
      const p = pages[pageIndex];
      const flip = () => {
        bookScript.textContent = p.script;
        bookText.textContent = p.text;
        bookNum.textContent = String(pageIndex + 1).padStart(2, "0") + " / " + String(pages.length).padStart(2, "0");
        bookPrev.disabled = pageIndex === 0;
        bookNext.disabled = pageIndex === pages.length - 1;
      };
      if (window.gsap && !reduced && bookPage) {
        const goingNext = dir !== "prev";
        const mid = goingNext ? -92 : 92;
        const from = goingNext ? 88 : -88;
        gsap.to(bookPage, {
          rotateY: mid,
          duration: MOTION.ui,
          ease: MOTION.easeInOut,
          transformOrigin: "left center",
          onComplete: () => {
            flip();
            gsap.fromTo(
              bookPage,
              { rotateY: from },
              { rotateY: 0, duration: MOTION.ui + 0.08, ease: MOTION.ease, transformOrigin: "left center" }
            );
          }
        });
      } else flip();
    }
    bookNext.addEventListener("click", () => {
      if (pageIndex < pages.length - 1) { pageIndex++; renderPage("next"); }
    });
    bookPrev.addEventListener("click", () => {
      if (pageIndex > 0) { pageIndex--; renderPage("prev"); }
    });

    /* ---------- Final explode + call ---------- */
    const heartExplode = document.getElementById("heartExplode");
    const confettiLayer = document.getElementById("confettiLayer");
    const finalBoom = document.getElementById("finalBoom");
    const finalLine = document.getElementById("finalLine");
    const callOverlay = document.getElementById("callOverlay");

    function spawnConfetti() {
      confettiLayer.innerHTML = "";
      const colors = ["#FF2D55", "#FF6B9E", "#FFD166", "#ffffff", "#ff8fab"];
      for (let i = 0; i < 80; i++) {
        const el = document.createElement("div");
        const size = 6 + Math.random() * 8;
        const isHeart = Math.random() > 0.55;
        el.style.cssText = [
          "position:absolute",
          "left:" + (Math.random() * 100) + "%",
          "top:-10%",
          "width:" + size + "px",
          "height:" + size + "px",
          "background:" + colors[i % colors.length],
          isHeart ? "border-radius:50% 50% 0 50%; transform:rotate(-45deg)" : "border-radius:2px",
          "opacity:0.9",
          "animation: fall" + (i % 3) + " " + (2.5 + Math.random() * 2) + "s linear forwards"
        ].join(";");
        confettiLayer.appendChild(el);
      }
      if (!document.getElementById("fallStyles")) {
        const st = document.createElement("style");
        st.id = "fallStyles";
        st.textContent = `
          @keyframes fall0 { to { transform: translateY(110vh) rotate(360deg); opacity: 0.2; } }
          @keyframes fall1 { to { transform: translateY(110vh) rotate(-280deg) translateX(40px); opacity: 0.15; } }
          @keyframes fall2 { to { transform: translateY(110vh) rotate(200deg) translateX(-30px); opacity: 0.2; } }
        `;
        document.head.appendChild(st);
      }
    }

    heartExplode.addEventListener("click", () => {
      heartExplode.classList.remove("visible");
      finalLine.style.display = "none";
      finalBoom.classList.add("show");
      spawnConfetti();
      if (window.gsap && !reduced) {
        gsap.fromTo(finalBoom, { opacity: 0, y: 16, scale: 0.96 }, {
          opacity: 1, y: 0, scale: 1, duration: 0.65, ease: MOTION.ease
        });
        const parts = finalBoom.querySelectorAll(".title, .script, .lede, .eyebrow");
        gsap.fromTo(parts, { opacity: 0, y: 12 }, {
          opacity: 1, y: 0, duration: 0.45, stagger: 0.06, ease: MOTION.ease, delay: 0.08
        });
      }
      if (!callTriggered) {
        callTriggered = true;
        setTimeout(() => startCall(), reduced ? 1200 : 4200);
      }
    });

    /* ---------- Simulated call ---------- */
    let ringInterval = null;
    function beep() {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        const ctx = new AC();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = "sine";
        o.frequency.value = 520;
        g.gain.value = 0.04;
        o.connect(g); g.connect(ctx.destination);
        o.start();
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
        o.stop(ctx.currentTime + 0.36);
      } catch (_) {}
    }

    function startCall() {
      callOverlay.classList.add("active");
      document.getElementById("callStatus").textContent = "Erick está ligando para você...";
      document.getElementById("callActions").style.display = "flex";
      document.getElementById("callVideoWrap").classList.remove("on");
      if (window.gsap && !reduced) {
        const avatar = callOverlay.querySelector(".call-avatar");
        const name = callOverlay.querySelector(".call-name");
        const status = callOverlay.querySelector(".call-status");
        const actions = callOverlay.querySelector(".call-actions");
        gsap.fromTo(callOverlay, { opacity: 0 }, { opacity: 1, duration: MOTION.ui, ease: MOTION.ease });
        gsap.fromTo([avatar, name, status], { opacity: 0, y: 14 }, {
          opacity: 1, y: 0, duration: 0.45, stagger: 0.06, ease: MOTION.ease
        });
        if (actions) {
          gsap.fromTo(actions, { opacity: 0, y: 18, scale: 0.96 }, {
            opacity: 1, y: 0, scale: 1, duration: 0.45, ease: MOTION.ease, delay: 0.15
          });
        }
      }
      beep();
      ringInterval = setInterval(beep, 1600);
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    }

    document.getElementById("callAccept").addEventListener("click", () => {
      clearInterval(ringInterval);
      document.getElementById("callActions").style.display = "none";
      document.getElementById("callStatus").textContent = "Em chamada";
      const wrap = document.getElementById("callVideoWrap");
      wrap.classList.add("on");
      // Pause bed so call audio is clear (keeps user mute preference)
      if (bgMusic && !bgMusic.paused) {
        bgMusic.pause();
        musicOn = false;
        setSoundUI(false);
      }
      const v = document.getElementById("callVideo");
      v.currentTime = 0;
      v.muted = false;
      v.play().catch(() => {
        v.muted = true;
        v.play().catch(() => {});
      });
    });

    document.getElementById("callDecline").addEventListener("click", () => {
      clearInterval(ringInterval);
      callOverlay.classList.remove("active");
    });

    document.getElementById("callEnd").addEventListener("click", () => {
      const v = document.getElementById("callVideo");
      v.pause();
      callOverlay.classList.remove("active");
      document.getElementById("callVideoWrap").classList.remove("on");
      if (!musicUserPaused) playBgMusic();
    });

    /* ---------- Init ---------- */
    updateChrome();
  
  return function cleanup() {
    try {
      document.querySelectorAll("video, audio").forEach((el) => {
        try {
          el.pause();
        } catch (_) {}
      });
    } catch (_) {}
  };
}
