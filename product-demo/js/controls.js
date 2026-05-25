/* ───────────────────────────────────────────────────────────────
   controls.js — control bar: act dots, prev/next, play/pause, fullscreen
   Runs BEFORE main.js initialises Reveal, so we listen for the
   `reveal:ready` event and also poll lightly until Reveal is ready.
   ─────────────────────────────────────────────────────────────── */

(function() {
  /* ── ACT MAP ──────────────────────────────────────────────────
     Maps top-level slide indices → human act names for the dot bar.
     The tool-tour vertical group (index 5) shows as one dot.
  ─────────────────────────────────────────────────────────────── */
  var ACTS = [
    { label: 'Hook'      },
    { label: 'Chaos'     },
    { label: 'Krkn'      },
    { label: 'Ecosystem' },
    { label: 'Demo'      },
    { label: 'Tools'     },
    { label: 'Start'     },
  ];

  var bar        = document.getElementById('krkn-controls');
  var dotsEl     = document.getElementById('kc-dots');
  var btnPrev    = document.getElementById('kc-prev');
  var btnPlay    = document.getElementById('kc-playpause');
  var iconPause  = btnPlay.querySelector('.kc-icon-pause');
  var iconPlay   = btnPlay.querySelector('.kc-icon-play');
  var btnNext    = document.getElementById('kc-next');
  var btnFS      = document.getElementById('kc-fullscreen');
  var iconEnter  = btnFS.querySelector('.kc-icon-enter');
  var iconExit   = btnFS.querySelector('.kc-icon-exit');

  var dots       = [];
  var hideTimer  = null;
  var playing    = true;   /* mirrors Reveal autoSlide state */

  /* ── Build dot row ────────────────────────────────────────── */
  ACTS.forEach(function(act, i) {
    var d = document.createElement('button');
    d.className = 'kc-dot';
    d.title = act.label;
    d.addEventListener('click', function() {
      if (window.Reveal) Reveal.slide(i, 0);
    });
    dotsEl.appendChild(d);
    dots.push(d);
  });

  /* ── Update active dot ────────────────────────────────────── */
  function setActiveDot(hIdx) {
    dots.forEach(function(d, i) {
      d.classList.toggle('active', i === hIdx);
    });
  }

  /* ── Play / Pause helpers ─────────────────────────────────── */
  function setPlaying(val) {
    playing = val;
    iconPause.style.display = val ? '' : 'none';
    iconPlay.style.display  = val ? 'none' : '';
  }

  /* ── Auto-hide bar ────────────────────────────────────────── */
  function showBar() {
    bar.classList.remove('kc-hidden');
    clearTimeout(hideTimer);
    hideTimer = setTimeout(function() {
      bar.classList.add('kc-hidden');
    }, 3500);
  }

  document.addEventListener('mousemove', showBar);
  document.addEventListener('touchstart', showBar);
  showBar(); /* show initially */

  /* ── Button handlers ──────────────────────────────────────── */
  btnPrev.addEventListener('click', function() {
    if (!window.Reveal) return;
    var idx = Reveal.getIndices().h;
    if (idx === 0) {
      Reveal.slide(ACTS.length - 1, 0);
    } else {
      Reveal.slide(idx - 1, 0);
    }
    showBar();
  });

  btnNext.addEventListener('click', function() {
    if (!window.Reveal) return;
    var idx = Reveal.getIndices().h;
    Reveal.slide((idx + 1) % ACTS.length, 0);
    showBar();
  });

  btnPlay.addEventListener('click', function() {
    if (!window.Reveal) return;
    if (playing) {
      Reveal.pauseAutoSlide();
      setPlaying(false);
    } else {
      Reveal.resumeAutoSlide();
      setPlaying(true);
    }
    showBar();
  });

  /* ── Fullscreen ───────────────────────────────────────────── */
  function toggleFS() {
    if (!document.fullscreenElement) {
      (document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen).call(document.documentElement);
    } else {
      (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    }
  }

  function updateFSIcon() {
    var inFS = !!document.fullscreenElement;
    iconEnter.style.display = inFS ? 'none' : '';
    iconExit.style.display  = inFS ? '' : 'none';
  }

  btnFS.addEventListener('click', function() { toggleFS(); showBar(); });
  document.addEventListener('fullscreenchange', updateFSIcon);
  document.addEventListener('webkitfullscreenchange', updateFSIcon);

  /* ── Reveal event listeners ───────────────────────────────── */
  document.addEventListener('krkn:slidechanged', function(e) {
    var hIdx = e.detail.indexh;
    setActiveDot(hIdx);
  });

  /* ── Keyboard shortcuts ───────────────────────────────────── */
  document.addEventListener('keydown', function(e) {
    if (e.key === 'f' || e.key === 'F') toggleFS();
    if (e.key === ' ') {
      e.preventDefault();
      btnPlay.click();
    }
    showBar();
  });

  /* ── Poll until Reveal is ready, then sync initial state ──── */
  var readyTimer = setInterval(function() {
    if (!window.Reveal || !Reveal.isReady()) return;
    clearInterval(readyTimer);
    setActiveDot(Reveal.getIndices().h);
    /* Sync pause/play icon with Reveal's initial auto-slide state */
    setPlaying(!Reveal.isAutoSlidePaused());
  }, 100);

})();
