/* ───────────────────────────────────────────────────────────────
   s6-tools.js — Tool Tour: one handler per vertical sub-slide.
   Each function returns { timeline, cleanup }.
   ─────────────────────────────────────────────────────────────── */

/* ── Shared typewriter helper ─────────────────────────────────── */
function typeInto(containerEl, lines, baseDelay) {
  baseDelay = baseDelay || 0;
  var tl = gsap.timeline();
  var delay = baseDelay;
  lines.forEach(function(line) {
    var row = document.createElement('div');
    row.innerHTML = line.html;
    tl.call(function(r) {
      containerEl.appendChild(r);
      containerEl.scrollTop = containerEl.scrollHeight;
    }, [row], delay);
    delay += (line.pause || 0.6);
  });
  return tl;
}

/* ── 6a: krkn-hub ─────────────────────────────────────────────── */
function animateHub(section) {
  var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  var cards = section.querySelectorAll('.hub-card');

  var more = section.querySelector('.hub-more');

  gsap.set(['#s-hub .s-tool__eyebrow','#s-hub .s-tool__name','#s-hub .s-tool__desc','#s-hub .s-tool__bullets'], { opacity: 0, x: -24 });
  gsap.set(cards, { opacity: 0, scale: .9, y: 10 });
  if (more) gsap.set(more, { opacity: 0, y: 8 });

  tl
    .to('#s-hub .s-tool__eyebrow', { opacity: 1, x: 0, duration: .5 })
    .to('#s-hub .s-tool__name',    { opacity: 1, x: 0, duration: .6 }, '-=.2')
    .to('#s-hub .s-tool__desc',    { opacity: 1, x: 0, duration: .5 }, '-=.1')
    .to('#s-hub .s-tool__bullets', { opacity: 1, x: 0, duration: .5 }, '-=.1')
    /* Cascade hub cards */
    .to(cards, { opacity: 1, scale: 1, y: 0, duration: .45, stagger: .07 }, '+=.3')
    /* Show "more" text after all cards have appeared */
    .to(more, { opacity: 1, y: 0, duration: .5 }, '+=.2');

  /* Pulse highlight each card in turn */
  tl.call(function() {
    var i = 0;
    var timer = setInterval(function() {
      cards.forEach(function(c) { c.classList.remove('hub-active'); });
      if (i < cards.length) {
        cards[i].classList.add('hub-active');
        i++;
      } else {
        clearInterval(timer);
        /* Keep all slightly lit */
        cards.forEach(function(c) { c.classList.add('hub-active'); });
      }
    }, 500);
    section._hubTimer = timer;
  }, null, '+=.2');

  function cleanup() {
    clearInterval(section._hubTimer);
    section.querySelectorAll('.hub-card').forEach(function(c) { c.classList.remove('hub-active'); });
  }

  return { timeline: tl, cleanup: cleanup };
}

/* ── 6b: krknctl ──────────────────────────────────────────────── */
function animateKrknctl(section) {
  var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  var body = document.getElementById('krknctl-body');
  if (body) body.innerHTML = '';

  gsap.set(['#s-krknctl .s-tool__eyebrow','#s-krknctl .s-tool__name','#s-krknctl .s-tool__desc','#s-krknctl .s-tool__bullets'], { opacity: 0, x: -24 });
  gsap.set('#krknctl-terminal', { opacity: 0, y: 20 });

  tl
    .to('#s-krknctl .s-tool__eyebrow', { opacity: 1, x: 0, duration: .5 })
    .to('#s-krknctl .s-tool__name',    { opacity: 1, x: 0, duration: .6 }, '-=.2')
    .to('#s-krknctl .s-tool__desc',    { opacity: 1, x: 0, duration: .5 }, '-=.1')
    .to('#s-krknctl .s-tool__bullets', { opacity: 1, x: 0, duration: .5 }, '-=.1')
    .to('#krknctl-terminal', { opacity: 1, y: 0, duration: .7 }, '+=.2')
    .call(function() {
      if (!body) return;
      var lines = [
        { html: '<span class="t-prompt">$</span> <span class="t-cmd">krknctl list</span>',                     pause: .8 },
        { html: '<span class="t-output">📦  pod-scenarios        delete, kill, oom</span>',                    pause: .2 },
        { html: '<span class="t-output">📦  node-scenarios       drain, shutdown, io-stress</span>',           pause: .2 },
        { html: '<span class="t-output">📦  network-chaos        partition, latency, packet-loss</span>',      pause: .2 },
        { html: '<span class="t-output">📦  cpu-hog              node and pod cpu exhaustion</span>',          pause: .8 },
        { html: '<span class="t-prompt">$</span> <span class="t-cmd">krknctl run pod-scenarios \\</span>',    pause: .3 },
        { html: '<span class="t-output--dim">    --namespace prod --pod-label app=frontend</span>',            pause: .3 },
        { html: '<span class="t-output--dim">    --kill-count 1 --wait-for-recovery</span>',                   pause: 1.0 },
        { html: '<span class="t-output t-output--yellow">▶  Validating config…           ✓</span>',           pause: .4 },
        { html: '<span class="t-output t-output--yellow">▶  Targeting frontend-v2-9f2a</span>',               pause: .4 },
        { html: '<span class="t-output t-output--orange">✘  Pod deleted — monitoring recovery</span>',        pause: .8 },
        { html: '<span class="t-output t-output--green">✔  Recovery confirmed in 47s</span>',                 pause: .4 },
        { html: '<span class="t-output t-output--green">✔  Resiliency score: 78/100</span><span class="t-cursor">_</span>', pause: 0 },
      ];
      typeInto(body, lines, 0);
    });

  return { timeline: tl, cleanup: function() { if (body) body.innerHTML = ''; } };
}

/* ── 6c: Krkn Operator ────────────────────────────────────────── */
function animateOperator(section) {
  var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  var body = document.getElementById('operator-body');
  if (body) body.innerHTML = '';
  var badge = document.getElementById('operator-badge');

  gsap.set(['#s-operator .s-tool__eyebrow','#s-operator .s-tool__name','#s-operator .s-tool__desc','#s-operator .s-tool__bullets'], { opacity: 0, x: -24 });
  gsap.set('#operator-terminal', { opacity: 0, y: 20 });
  if (badge) gsap.set(badge, { opacity: 0, y: 10 });

  tl
    .to('#s-operator .s-tool__eyebrow', { opacity: 1, x: 0, duration: .5 })
    .to('#s-operator .s-tool__name',    { opacity: 1, x: 0, duration: .6 }, '-=.2')
    .to('#s-operator .s-tool__desc',    { opacity: 1, x: 0, duration: .5 }, '-=.1')
    .to('#s-operator .s-tool__bullets', { opacity: 1, x: 0, duration: .5 }, '-=.1')
    .to('#operator-terminal', { opacity: 1, y: 0, duration: .7 }, '+=.2')
    .call(function() {
      if (!body) return;
      var lines = [
        { html: '<span class="t-output t-output--dim">apiVersion: chaos.krkn.dev/v1alpha1</span>',          pause: .2 },
        { html: '<span class="t-output t-output--dim">kind: PodScenario</span>',                            pause: .2 },
        { html: '<span class="t-output t-output--dim">metadata:</span>',                                    pause: .2 },
        { html: '<span class="t-output t-output--dim">  name: nightly-frontend-delete</span>',              pause: .3 },
        { html: '<span class="t-output t-output--dim">spec:</span>',                                        pause: .2 },
        { html: '<span class="t-output t-output--dim">  namespace: production</span>',                      pause: .2 },
        { html: '<span class="t-output t-output--dim">  labelSelector:</span>',                             pause: .2 },
        { html: '<span class="t-output t-output--dim">    matchLabels:</span>',                             pause: .2 },
        { html: '<span class="t-output t-output--dim">      app: frontend</span>',                          pause: .2 },
        { html: '<span class="t-output t-output--dim">  killCount: 1</span>',                               pause: .2 },
        { html: '<span class="t-output t-output--dim">  waitRecovery: true</span>',                         pause: .2 },
        { html: '<span class="t-output t-output--dim">  schedule: "0 2 * * *"</span>',                      pause: 1.2 },
        { html: '<span class="t-output t-output--green">✔  Applied — reconciling…</span>',                 pause: 0 },
      ];
      typeInto(body, lines, 0);
    })
    .to(badge, { opacity: 1, y: 0, duration: .7, ease: 'back.out(1.4)' }, '+=2.0');

  return { timeline: tl, cleanup: function() { if (body) body.innerHTML = ''; if (badge) gsap.set(badge, { opacity: 0 }); } };
}

/* ── 6d: Krkn AI ──────────────────────────────────────────────── */
function animateAI(section) {
  var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  var body    = document.getElementById('ai-body');
  var results = document.getElementById('ai-results');
  if (body) body.innerHTML = '';

  gsap.set(['#s-ai .s-tool__eyebrow','#s-ai .s-tool__name','#s-ai .s-tool__desc','#s-ai .s-tool__bullets'], { opacity: 0, x: -24 });
  gsap.set('#ai-terminal', { opacity: 0, y: 20 });
  if (results) gsap.set(results, { opacity: 0 });

  tl
    .to('#s-ai .s-tool__eyebrow', { opacity: 1, x: 0, duration: .5 })
    .to('#s-ai .s-tool__name',    { opacity: 1, x: 0, duration: .6 }, '-=.2')
    .to('#s-ai .s-tool__desc',    { opacity: 1, x: 0, duration: .5 }, '-=.1')
    .to('#s-ai .s-tool__bullets', { opacity: 1, x: 0, duration: .5 }, '-=.1')
    .to('#ai-terminal', { opacity: 1, y: 0, duration: .7 }, '+=.2')
    .call(function() {
      if (!body) return;
      var lines = [
        { html: '<span class="t-prompt">$</span> <span class="t-cmd">krkn_ai discover -k kubeconfig.yaml \\</span>',          pause: .3 },
        { html: '<span class="t-output--dim">    -n "robot-shop" -o ./krkn-ai.yaml</span>',                                    pause: .8 },
        { html: '<span class="t-output t-output--green">✔  Discovered 12 pods, 3 nodes, 5 services</span>',                   pause: .3 },
        { html: '<span class="t-output t-output--green">✔  Generated krkn-ai.yaml</span>',                                    pause: .8 },
        { html: '<span class="t-prompt">$</span> <span class="t-cmd">krkn_ai run -c ./krkn-ai.yaml -o ./results/</span>',     pause: .8 },
        { html: '<span class="t-output t-output--yellow">▶  Generation 1/10 — evolving scenarios…</span>',                    pause: .5 },
        { html: '<span class="t-output t-output--orange">   pod-scenarios       → fitness: 82</span>',                        pause: .3 },
        { html: '<span class="t-output t-output--orange">   network-chaos       → fitness: 74</span>',                        pause: .3 },
        { html: '<span class="t-output t-output--orange">   cpu-hog             → fitness: 61</span>',                        pause: .6 },
        { html: '<span class="t-output t-output--yellow">▶  Crossover + mutation → generation 2…</span>',                    pause: .5 },
        { html: '<span class="t-output t-output--green">✔  Evolution complete — 3 critical paths found</span><span class="t-cursor">_</span>', pause: 0 },
      ];
      typeInto(body, lines, 0);
    })
    .to(results, { opacity: 1, duration: .8 }, '+=3.0');

  /* Highlight result rows one by one */
  tl.call(function() {
    if (!results) return;
    var rows = results.querySelectorAll('.s-ai__result-row');
    rows.forEach(function(row, i) {
      setTimeout(function() {
        row.style.transition = 'box-shadow .4s';
        row.style.boxShadow = '0 0 16px rgba(236,28,36,.3)';
        setTimeout(function() { row.style.boxShadow = ''; }, 800);
      }, i * 500);
    });
  }, null, '+=.2');

  return { timeline: tl, cleanup: function() { if (body) body.innerHTML = ''; } };
}

/* ── 6e: Krkn Dashboard ───────────────────────────────────────── */
function animateDashboard(section) {
  var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  var img = document.getElementById('dashboard-img');

  gsap.set(['#s-dashboard .s-tool__eyebrow','#s-dashboard .s-tool__name','#s-dashboard .s-tool__desc','#s-dashboard .s-tool__bullets'], { opacity: 0, x: -24 });
  if (img) gsap.set(img, { opacity: 0, y: 20, scale: .97 });

  tl
    .to('#s-dashboard .s-tool__eyebrow', { opacity: 1, x: 0, duration: .5 })
    .to('#s-dashboard .s-tool__name',    { opacity: 1, x: 0, duration: .6 }, '-=.2')
    .to('#s-dashboard .s-tool__desc',    { opacity: 1, x: 0, duration: .5 }, '-=.1')
    .to('#s-dashboard .s-tool__bullets', { opacity: 1, x: 0, duration: .5 }, '-=.1');

  if (img) {
    tl.to(img, { opacity: 1, y: 0, scale: 1, duration: .9, ease: 'power2.out' }, '+=.3');
    /* Subtle parallax float */
    tl.to(img, { y: -8, duration: 3, ease: 'sine.inOut', yoyo: true, repeat: -1 }, '-=.5');
  }

  return { timeline: tl };
}

/* ── 6f: Krkn Assist ──────────────────────────────────────────── */
function animateAssist(section) {
  var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  var body = document.getElementById('assist-body');
  if (body) body.innerHTML = '';

  gsap.set(['#s-assist .s-tool__eyebrow','#s-assist .s-tool__name','#s-assist .s-tool__desc','#s-assist .s-tool__bullets'], { opacity: 0, x: -24 });
  gsap.set('#assist-terminal', { opacity: 0, y: 20 });

  tl
    .to('#s-assist .s-tool__eyebrow', { opacity: 1, x: 0, duration: .5 })
    .to('#s-assist .s-tool__name',    { opacity: 1, x: 0, duration: .6 }, '-=.2')
    .to('#s-assist .s-tool__desc',    { opacity: 1, x: 0, duration: .5 }, '-=.1')
    .to('#s-assist .s-tool__bullets', { opacity: 1, x: 0, duration: .5 }, '-=.1')
    .to('#assist-terminal', { opacity: 1, y: 0, duration: .7 }, '+=.2')
    .call(function() {
      if (!body) return;
      var lines = [
        { html: '<span class="t-prompt">assist&gt;</span> <span class="t-cmd">krknctl-assist</span>',                  pause: .6 },
        { html: '<span class="t-output t-output--blue">👋  Hi! What would you like to chaos test today?</span>',       pause: 1.0 },
        { html: '<span class="t-prompt">you&gt;</span>   <span class="t-cmd">I want to test my frontend under pod failures</span>', pause: .8 },
        { html: '<span class="t-output t-output--blue">🤖  Great! I\'ll use the pod-scenarios plugin.</span>',         pause: .4 },
        { html: '<span class="t-output t-output--blue">    Which namespace? (default: default)</span>',                pause: .8 },
        { html: '<span class="t-prompt">you&gt;</span>   <span class="t-cmd">production</span>',                       pause: .6 },
        { html: '<span class="t-output t-output--blue">    How many pods to delete? (default: 1)</span>',              pause: .7 },
        { html: '<span class="t-prompt">you&gt;</span>   <span class="t-cmd">1</span>',                                pause: .8 },
        { html: '<span class="t-output t-output--yellow">▶  Running: krknctl run pod-scenarios \\</span>',            pause: .3 },
        { html: '<span class="t-output t-output--dim">       --namespace production --kill-count 1</span>',            pause: 1.0 },
        { html: '<span class="t-output t-output--green">✔  Scenario complete. Score: 78/100.</span>',                 pause: .4 },
        { html: '<span class="t-output t-output--blue">    Recovery latency exceeded SLO. Want help fixing it?</span><span class="t-cursor">_</span>', pause: 0 },
      ];
      typeInto(body, lines, 0);
    });

  return { timeline: tl, cleanup: function() { if (body) body.innerHTML = ''; } };
}
