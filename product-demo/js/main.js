/* ───────────────────────────────────────────────────────────────
   main.js — Reveal.js init + GSAP timeline dispatcher
   ─────────────────────────────────────────────────────────────── */

/* Map slide IDs → handler functions (evaluated lazily at call time) */
var SLIDE_FN_MAP = {
  's-hook':      function() { return typeof animateHook      === 'function' ? animateHook      : null; },
  's-chaos':     function() { return typeof animateChaos     === 'function' ? animateChaos     : null; },
  's-krkn':      function() { return typeof animateKrkn      === 'function' ? animateKrkn      : null; },
  's-ecosystem': function() { return typeof animateEcosystem === 'function' ? animateEcosystem : null; },
  's-demo':      function() { return typeof animateDemo      === 'function' ? animateDemo      : null; },
  's-hub':       function() { return typeof animateHub       === 'function' ? animateHub       : null; },
  's-krknctl':   function() { return typeof animateKrknctl   === 'function' ? animateKrknctl   : null; },
  's-operator':  function() { return typeof animateOperator  === 'function' ? animateOperator  : null; },
  's-ai':        function() { return typeof animateAI        === 'function' ? animateAI        : null; },
  's-dashboard': function() { return typeof animateDashboard === 'function' ? animateDashboard : null; },
  's-assist':    function() { return typeof animateAssist    === 'function' ? animateAssist    : null; },
  's-cta':       function() { return typeof animateCTA       === 'function' ? animateCTA       : null; },
};

var currentTimeline = null;
var currentCleanup  = null;

function killCurrent() {
  if (currentTimeline) {
    currentTimeline.kill();
    currentTimeline = null;
  }
  if (typeof currentCleanup === 'function') {
    currentCleanup();
    currentCleanup = null;
  }
}

function dispatchSlide(section) {
  killCurrent();
  if (!section) return;
  var id  = section.id;
  var fnGetter = SLIDE_FN_MAP[id];
  if (!fnGetter) return;
  var handler = fnGetter();
  if (typeof handler !== 'function') return;

  var result = handler(section);
  if (result && result.timeline) currentTimeline = result.timeline;
  if (result && result.cleanup)  currentCleanup  = result.cleanup;
}

/* ── Reveal.js init ─────────────────────────────────────────── */
Reveal.initialize({
  hash:               false,
  loop:               true,
  autoSlide:          18000,          /* fallback; each section overrides via data-autoslide */
  autoSlideStoppable: true,
  transition:         'fade',
  transitionSpeed:    'slow',
  controls:           false,
  progress:           false,
  overview:           false,
  touch:              true,
  mouseWheel:         false,
  keyboard:           true,
  center:             true,
  width:              1391,
  height:             783,
  margin:             0,
  minScale:           0.1,
  maxScale:           2.0,
}).then(function() {
  /* Fire animation for the first visible slide */
  dispatchSlide(Reveal.getCurrentSlide());

  Reveal.on('slidechanged', function(e) {
    dispatchSlide(e.currentSlide);
    document.dispatchEvent(new CustomEvent('krkn:slidechanged', { detail: e }));
  });

  /* For vertical slides within the tool tour */
  Reveal.on('fragmentshown', function() {});

  window.KrknMain = { kill: killCurrent, dispatch: dispatchSlide };
});
