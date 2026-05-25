/* ───────────────────────────────────────────────────────────────
   s5-demo.js — Live cluster visualisation (pod-delete scenario)
   Adapted from v3 shared.js + scenario-pod.js. Uses `d-` prefixed
   element IDs to avoid conflicts with Reveal.js internals.
   ─────────────────────────────────────────────────────────────── */

var _demoActive = false;
var _demoAbort  = null;

function animateDemo(section) {
  /* Kill previous run if any */
  if (_demoAbort) { _demoAbort(); _demoAbort = null; }
  _demoActive = true;

  var aborted = false;
  _demoAbort = function() { aborted = true; _demoActive = false; };

  /* Defer to next frame so Reveal has finished its CSS transform */
  setTimeout(function() {
    if (aborted) return;
    _runDemo(section, function() { return aborted; });
  }, 200);

  function cleanup() {
    aborted = true;
    _demoActive = false;
    _resetDemoDOM();
  }

  return { cleanup: cleanup };
}

/* ── Reset all DOM state between runs ────────────────────────── */
function _resetDemoDOM() {
  var svgEl = document.getElementById('demo-svg-layer');
  /* Remove all dynamically added children from svg (keep defs) */
  var toRemove = [];
  svgEl && svgEl.childNodes.forEach(function(n) { if (n.tagName !== 'defs') toRemove.push(n); });
  toRemove.forEach(function(n) { n.parentNode.removeChild(n); });

  /* Reset pod slot */
  var pod3 = document.getElementById('d-pod3');
  if (pod3) {
    pod3.style.display = '';
    pod3.className = 'pod-card';
    _setPodStatusDirect(pod3, 'healthy');
    /* Remove any extra pods injected by scenario */
    var slot = document.getElementById('d-pod3-slot');
    if (slot) {
      Array.from(slot.children).forEach(function(c) { if (c.id !== 'd-pod3') c.remove(); });
    }
  }
  var pod4 = document.getElementById('d-pod4');
  if (pod4) { pod4.className = 'pod-card'; _setPodStatusDirect(pod4, 'healthy'); }

  /* Remove dynamically added elements */
  var cluster = document.getElementById('demo-cluster');
  if (cluster) {
    cluster.querySelectorAll('.ctx-label, .targeting-ring, .targeting-label, .chaos-dot, .blast-ring-el, .node-status-tags, .helper-pod-badge, .traffic-boost-dot').forEach(function(el) { el.remove(); });
  }

  /* Reset node classes */
  var wn2 = document.getElementById('d-wn2');
  if (wn2) wn2.classList.remove('node-isolated', 'focus-dim', 'focus-dim-lite');
  var wn1 = document.getElementById('d-wn1');
  if (wn1) wn1.classList.remove('focus-dim', 'focus-dim-lite');

  /* Reset control plane */
  ['d-apiserver','d-controller','d-etcd','d-scheduler'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.classList.remove('cp-highlight', 'cp-reconciling');
  });

  /* Reset krkn card */
  var krkn = document.getElementById('d-krkn');
  if (krkn) {
    krkn.classList.remove('krkn-active');
    var cmd = document.getElementById('d-krkn-cmd');
    if (cmd) cmd.style.display = 'none';
  }

  /* Reset SLO */
  var avail   = document.getElementById('d-slo-avail');
  var latency = document.getElementById('d-slo-latency');
  var error   = document.getElementById('d-slo-error');
  if (avail)   { avail.textContent = '100%';  avail.className = 'slo-value slo-healthy'; }
  if (latency) { latency.textContent = '120ms'; latency.className = 'slo-value slo-healthy'; }
  if (error)   { error.textContent = '0.1%';  error.className = 'slo-value slo-healthy'; }

  /* Reset phase bar */
  var ph = document.getElementById('d-phase-num');
  if (ph) { ph.textContent = '—'; ph.className = 'phase-number'; }
  var pt = document.getElementById('d-phase-title');
  if (pt) pt.textContent = 'Initializing';
  var ps = document.getElementById('d-phase-subtitle');
  if (ps) ps.textContent = '';

  /* Reset overlays */
  ['d-scene-overlay','d-verify','d-scorecard'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) { el.style.display = 'none'; el.style.opacity = '0'; }
  });

  /* Clear lifecycle */
  var lc = document.getElementById('d-lifecycle');
  if (lc) lc.style.display = 'none';

  /* Reset focus */
  document.querySelectorAll('#demo-cluster .focus-dim, #demo-cluster .focus-dim-lite').forEach(function(el) {
    el.classList.remove('focus-dim', 'focus-dim-lite');
  });

  /* Reset users + connectors */
  var users = document.getElementById('d-users');
  if (users) users.classList.remove('focus-dim-lite');
}

function _setPodStatusDirect(podEl, state) {
  podEl.classList.remove('pod-failing','pod-dying','pod-unreachable','pod-creating','pod-ready','pod-recovered','pod-isolating','pod-starting','pod-almost-ready');
  var dot  = podEl.querySelector('.status-dot-el');
  var text = podEl.querySelector('.status-text-el');
  var xm   = podEl.querySelector('.fail-x');
  if (!dot || !text) return;
  if (xm) xm.style.display = 'none';
  dot.className  = 'status-dot-el dot-green';
  text.textContent = 'Healthy';
  text.className = 'status-text-el text-green';
}

/* ── Main demo runner ─────────────────────────────────────────── */
function _runDemo(section, isAborted) {
  var NS = 'http://www.w3.org/2000/svg';
  var pacing = 1.0;    /* 1.4× faster than v3 default of 2× */

  /* ── Element refs ─── */
  var cluster    = document.getElementById('demo-cluster');
  var svgEl      = document.getElementById('demo-svg-layer');
  var wn1        = document.getElementById('d-wn1');
  var wn2        = document.getElementById('d-wn2');
  var pod3Slot   = document.getElementById('d-pod3-slot');
  var pod3Orig   = document.getElementById('d-pod3');
  var pod4       = document.getElementById('d-pod4');
  var apiserver  = document.getElementById('d-apiserver');
  var controller = document.getElementById('d-controller');
  var scheduler  = document.getElementById('d-scheduler');
  var etcd       = document.getElementById('d-etcd');
  var krkn       = document.getElementById('d-krkn');
  var krknCmd    = document.getElementById('d-krkn-cmd');
  var users      = document.getElementById('d-users');
  var serviceEl  = document.getElementById('d-service');
  var ingressEl  = document.getElementById('d-ingress');
  var flowConns  = document.querySelectorAll('#demo-cluster .flow-connector');
  var phaseNum   = document.getElementById('d-phase-num');
  var phaseTitle = document.getElementById('d-phase-title');
  var phaseSub   = document.getElementById('d-phase-subtitle');
  var sloAvail   = document.getElementById('d-slo-avail');
  var sloLat     = document.getElementById('d-slo-latency');
  var sloErr     = document.getElementById('d-slo-error');

  if (!cluster || !svgEl) return;

  /* ── SVG sizing using getBoundingClientRect (Reveal.js safe) ── */
  var cRect = cluster.getBoundingClientRect();
  var w = cRect.width, h = cRect.height;
  if (w < 10 || h < 10) return;   /* not visible yet */
  svgEl.setAttribute('viewBox', '0 0 ' + w + ' ' + h);

  function pos(el, edge) {
    var r = el.getBoundingClientRect();
    var ox = r.left - cRect.left, oy = r.top - cRect.top;
    switch (edge) {
      case 'right':  return { x: ox + r.width,     y: oy + r.height / 2 };
      case 'left':   return { x: ox,                y: oy + r.height / 2 };
      case 'top':    return { x: ox + r.width / 2,  y: oy };
      case 'bottom': return { x: ox + r.width / 2,  y: oy + r.height };
      default:       return { x: ox + r.width / 2,  y: oy + r.height / 2 };
    }
  }

  function drawLine(x1, y1, x2, y2, opts) {
    opts = opts || {};
    var el = document.createElementNS(NS, 'line');
    el.setAttribute('x1', x1); el.setAttribute('y1', y1);
    el.setAttribute('x2', x2); el.setAttribute('y2', y2);
    el.setAttribute('stroke', opts.stroke || '#EC1C24');
    el.setAttribute('stroke-width', opts.width || '1.5');
    if (opts.dash)   el.setAttribute('stroke-dasharray', opts.dash);
    if (opts.marker) el.setAttribute('marker-end', 'url(#' + opts.marker + ')');
    svgEl.appendChild(el);
    return el;
  }

  /* Draw static structural lines */
  var serviceB = pos(serviceEl, 'bottom');
  var serviceC = pos(serviceEl, 'center');
  var wn1T     = pos(wn1, 'top');
  var wn2T     = pos(wn2, 'top');
  var wn1B     = pos(wn1, 'bottom');
  var wn2B     = pos(wn2, 'bottom');
  var cpT      = pos(document.getElementById('d-cp'), 'top');
  var krknL    = pos(krkn, 'left');
  var krknC    = pos(krkn, 'center');
  var apiR     = pos(apiserver, 'right');
  var apiC     = pos(apiserver, 'center');
  var usersR   = pos(users, 'right');
  var ingressC = pos(ingressEl, 'center');
  var pod1T    = pos(document.getElementById('d-pod1'), 'top');
  var pod3T    = pos(pod3Orig, 'top');

  var trafficWN1 = drawLine(serviceC.x, serviceB.y, wn1T.x, wn1T.y, { marker: 'd-arr-r' });
  var trafficWN2 = drawLine(serviceC.x, serviceB.y, wn2T.x, wn2T.y, { marker: 'd-arr-r' });
  drawLine(wn1B.x, wn1B.y, cpT.x - 120, cpT.y, { stroke: '#1e3a5f', width: '1', dash: '7 4' });
  drawLine(wn2B.x, wn2B.y, cpT.x + 120, cpT.y, { stroke: '#1e3a5f', width: '1', dash: '7 4' });

  /* Traffic dot paths */
  var pathA = 'M ' + usersR.x + ',' + usersR.y +
              ' L ' + ingressC.x + ',' + ingressC.y +
              ' L ' + serviceC.x + ',' + serviceC.y +
              ' L ' + serviceC.x + ',' + serviceB.y +
              ' L ' + wn1T.x    + ',' + wn1T.y +
              ' L ' + pod1T.x   + ',' + pod1T.y;
  var pathB = 'M ' + usersR.x + ',' + usersR.y +
              ' L ' + ingressC.x + ',' + ingressC.y +
              ' L ' + serviceC.x + ',' + serviceC.y +
              ' L ' + serviceC.x + ',' + serviceB.y +
              ' L ' + wn2T.x    + ',' + wn2T.y +
              ' L ' + pod3T.x   + ',' + pod3T.y;
  var chaosPath = 'M ' + krknL.x + ',' + krknC.y +
                  ' L ' + (apiR.x + 6) + ',' + apiC.y;

  function spawnDot(cls, pathD, delay, dur) {
    var d = document.createElement('div');
    d.className = cls;
    d.style.setProperty('--path', "path('" + pathD + "')");
    d.style.setProperty('--dur', dur + 's');
    d.style.setProperty('--delay', delay + 's');
    cluster.appendChild(d);
    return d;
  }

  /* Spawn animated traffic dots */
  var dur = 5;
  var pathADots = [], pathBDots = [];
  for (var i = 0; i < 3; i++) {
    pathADots.push(spawnDot('traffic-dot', pathA, i * (dur / 3), dur));
    pathBDots.push(spawnDot('traffic-dot', pathB, i * (dur / 3) + 0.6, dur));
  }

  /* ── Helpers ──────────────────────────────────────────────── */
  function wait(ms) {
    return new Promise(function(resolve) {
      setTimeout(resolve, ms * pacing);
    });
  }

  function setPhase(num, title, subtitle, color, owner) {
    phaseNum.textContent = num;
    phaseNum.className = 'phase-number';
    if (color) phaseNum.classList.add('phase-' + color);
    phaseNum.classList.add('phase-bump');
    setTimeout(function() { phaseNum.classList.remove('phase-bump'); }, 300);
    phaseTitle.innerHTML = title + (owner ? ' <span class="phase-owner phase-owner-' + owner + '">' + (owner === 'krkn' ? 'Krkn' : 'K8s') + '</span>' : '');
    phaseSub.textContent = subtitle || '';
  }

  function updateSLO(avail, latency, err) {
    sloAvail.textContent  = avail;   sloLat.textContent = latency;  sloErr.textContent = err;
    var av = parseFloat(avail), lt = parseInt(latency), er = parseFloat(err);
    sloAvail.className  = 'slo-value ' + (av >= 99.9 ? 'slo-healthy' : av >= 99 ? 'slo-warning' : 'slo-critical');
    sloLat.className    = 'slo-value ' + (lt <= 150  ? 'slo-healthy' : lt <= 250 ? 'slo-warning' : 'slo-critical');
    sloErr.className    = 'slo-value ' + (er <= 0.5  ? 'slo-healthy' : er <= 2   ? 'slo-warning' : 'slo-critical');
  }

  function setPodStatus(podEl, state) {
    podEl.classList.remove('pod-failing','pod-dying','pod-unreachable','pod-creating',
                            'pod-ready','pod-recovered','pod-isolating','pod-starting','pod-almost-ready');
    var dot  = podEl.querySelector('.status-dot-el');
    var text = podEl.querySelector('.status-text-el');
    var xm   = podEl.querySelector('.fail-x');
    if (!dot || !text) return;
    if (xm) xm.style.display = 'none';
    var map = {
      healthy:       ['dot-green',  'Healthy',      'text-green'],
      killed:        ['dot-red',    'Pod Killed',   'text-red',    'pod-failing', true],
      isolating:     ['dot-orange', 'Isolating…',   'text-orange', 'pod-isolating'],
      'not-ready':   ['dot-orange', 'Not Ready',    'text-orange', 'pod-unreachable'],
      recovering:    ['dot-blue',   'Recovering…',  'text-blue',   'pod-starting'],
      starting:      ['dot-blue',   'Starting…',    'text-blue',   'pod-starting'],
      'almost-ready':['dot-green',  'Almost Ready', 'text-green',  'pod-almost-ready'],
      ready:         ['dot-green',  'Ready',        'text-green',  'pod-recovered'],
    };
    var m = map[state] || map.healthy;
    dot.className  = 'status-dot-el ' + m[0];
    text.textContent = m[1];
    text.className = 'status-text-el ' + m[2];
    if (m[3]) podEl.classList.add(m[3]);
    if (m[4] && xm) xm.style.display = '';
  }

  function createNewPod(state) {
    var pod = document.createElement('div');
    pod.className = 'pod-card pod-' + state;
    var statusHTML = state === 'creating'
      ? '<div class="spinner"></div><span class="status-text-el text-blue">Creating…</span>'
      : '<div class="status-dot-el dot-green"></div><span class="status-text-el text-green">Ready</span>';
    pod.innerHTML =
      '<div class="pod-status-bar">' + statusHTML + '</div>' +
      '<div class="pod-label"><span><span class="pod-friendly-name">Frontend App</span><span class="pod-k8s-name">frontend-v2-x4w7</span></span></div>' +
      '<div class="containers-grid"><span class="ctr-chip">react-app</span><span class="ctr-chip">nginx</span></div>' +
      '<div class="pod-event-label">' + (state === 'creating' ? 'Scheduling…' : 'Pod Ready') + '</div>';
    return pod;
  }

  var chaosLineEl = null;
  function showChaosLine() {
    chaosLineEl = drawLine(krknL.x, krknC.y, apiR.x + 6, apiC.y, { stroke: '#f97316', width: '2.5', marker: 'd-arr-o' });
    chaosLineEl.classList.add('chaos-line');
    chaosLineEl.setAttribute('filter', 'url(#d-chaos-glow)');
    chaosLineEl.style.opacity = '0';
    chaosLineEl.style.transition = 'opacity 0.4s ease';
    requestAnimationFrame(function() { if (chaosLineEl) chaosLineEl.style.opacity = '1'; });
  }
  function hideChaosLine() {
    if (!chaosLineEl) return;
    chaosLineEl.style.opacity = '0';
    var el = chaosLineEl; chaosLineEl = null;
    setTimeout(function() { if (el.parentNode) el.parentNode.removeChild(el); }, 400);
  }

  function fireChaosDot() {
    var dot = document.createElement('div');
    dot.className = 'chaos-dot';
    dot.style.setProperty('--path', "path('" + chaosPath + "')");
    cluster.appendChild(dot);
    setTimeout(function() { if (dot.parentNode) dot.parentNode.removeChild(dot); }, 1400);
  }

  function fireBlastRing(targetEl) {
    var r = targetEl.getBoundingClientRect();
    var cx = (r.left - cRect.left) + r.width  / 2;
    var cy = (r.top  - cRect.top)  + r.height / 2;
    var ring = document.createElementNS(NS, 'circle');
    ring.setAttribute('cx', cx); ring.setAttribute('cy', cy); ring.setAttribute('r', r.width / 2);
    ring.setAttribute('fill', 'none'); ring.setAttribute('stroke', '#EC1C24'); ring.setAttribute('stroke-width', '3');
    ring.classList.add('blast-ring-el');
    ring.style.animation = 'blastRing .9s ease-out forwards';
    svgEl.appendChild(ring);
    setTimeout(function() { if (ring.parentNode) ring.parentNode.removeChild(ring); }, 1000);
  }

  var trafficXMark = null;
  function showTrafficFailed() {
    trafficWN2.setAttribute('stroke', '#EC1C24');
    trafficWN2.setAttribute('stroke-dasharray', '4 3');
    trafficWN2.classList.add('traffic-line-flicker');
    var midX = (serviceC.x + wn2T.x) / 2;
    var midY = (serviceB.y + wn2T.y) / 2;
    var g  = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'svg-x-mark');
    var mk = function(x1, y1, x2, y2) {
      var ln = document.createElementNS(NS, 'line');
      ln.setAttribute('x1', x1); ln.setAttribute('y1', y1);
      ln.setAttribute('x2', x2); ln.setAttribute('y2', y2);
      ln.setAttribute('stroke', '#EC1C24'); ln.setAttribute('stroke-width', '2.5');
      ln.setAttribute('stroke-linecap', 'round'); return ln;
    };
    g.appendChild(mk(midX - 7, midY - 7, midX + 7, midY + 7));
    g.appendChild(mk(midX + 7, midY - 7, midX - 7, midY + 7));
    svgEl.appendChild(g);
    trafficXMark = g;
  }
  function hideTrafficFailed() {
    trafficWN2.setAttribute('stroke', '#EC1C24');
    trafficWN2.removeAttribute('stroke-dasharray');
    trafficWN2.classList.remove('traffic-line-flicker');
    if (trafficXMark) { trafficXMark.parentNode && trafficXMark.parentNode.removeChild(trafficXMark); trafficXMark = null; }
  }

  var currentLabel = null;
  function showCtxLabel(targetEl, text, theme, edge, offsetY) {
    clearCtxLabel();
    var r   = targetEl.getBoundingClientRect();
    var ox  = r.left - cRect.left, oy = r.top - cRect.top;
    var y   = (edge === 'bottom') ? oy + r.height + 8 : oy + (offsetY !== undefined ? offsetY : -24);
    var lbl = document.createElement('div');
    lbl.className = 'ctx-label ctx-' + theme;
    lbl.textContent = text;
    lbl.style.left = (ox + r.width / 2) + 'px';
    lbl.style.top  = y + 'px';
    cluster.appendChild(lbl);
    currentLabel = lbl;
  }
  function clearCtxLabel() {
    if (currentLabel) { currentLabel.parentNode && currentLabel.parentNode.removeChild(currentLabel); currentLabel = null; }
  }

  function showTargeting(targetEl, label) {
    var r = targetEl.getBoundingClientRect();
    var ring = document.createElement('div');
    ring.className = 'targeting-ring';
    ring.style.left   = (r.left - cRect.left - 4) + 'px';
    ring.style.top    = (r.top  - cRect.top  - 4) + 'px';
    ring.style.width  = (r.width  + 8) + 'px';
    ring.style.height = (r.height + 8) + 'px';
    var lbl = document.createElement('div');
    lbl.className = 'targeting-label';
    lbl.textContent = '⊕ ' + label;
    lbl.style.left = (r.left - cRect.left + r.width / 2) + 'px';
    lbl.style.top  = (r.top - cRect.top - 26) + 'px';
    lbl.style.transform = 'translateX(-50%)';
    cluster.appendChild(ring);
    cluster.appendChild(lbl);
  }
  function clearTargeting() {
    cluster.querySelectorAll('.targeting-ring, .targeting-label').forEach(function(el) { el.remove(); });
  }

  function showKrknTerminal(cmd) {
    if (!krknCmd) return;
    krknCmd.textContent = '$ ' + cmd;
    krknCmd.style.display = '';
  }

  function enterFocusMode(dimPod4) {
    wn1.classList.add('focus-dim');
    if (dimPod4 !== false) pod4.classList.add('focus-dim-lite');
    users.classList.add('focus-dim-lite');
    flowConns.forEach(function(fc) { fc.classList.add('focus-dim-lite'); });
    etcd.classList.add('focus-dim-lite');
    scheduler.classList.add('focus-dim-lite');
  }
  function exitFocusMode() {
    wn1.classList.remove('focus-dim');
    pod4.classList.remove('focus-dim-lite');
    users.classList.remove('focus-dim-lite');
    flowConns.forEach(function(fc) { fc.classList.remove('focus-dim-lite'); });
    etcd.classList.remove('focus-dim-lite');
    scheduler.classList.remove('focus-dim-lite');
  }

  var boostDots = [];
  function addTrafficBoost() {
    for (var i = 0; i < 3; i++) boostDots.push(spawnDot('traffic-dot', pathA, i * 1.0, 3.5));
  }
  function removeTrafficBoost() {
    boostDots.forEach(function(d) { d.parentNode && d.parentNode.removeChild(d); });
    boostDots = [];
  }

  var LCARROW = '<svg viewBox="0 0 14 8" fill="none"><line x1="0" y1="4" x2="10" y2="4" stroke="#64748b" stroke-width="1.5"/><polygon points="9,1.5 14,4 9,6.5" fill="#64748b"/></svg>';
  var lfSteps = [];
  function setLifecycle(title, steps) {
    var lc = document.getElementById('d-lifecycle');
    if (lc) lc.style.display = '';
    var lt = document.getElementById('d-lifecycle-title');
    if (lt) lt.textContent = title;
    var flow = document.getElementById('d-lifecycle-flow');
    if (!flow) return;
    flow.innerHTML = steps.map(function(s, i) {
      var arrow = i > 0 ? '<div class="lf-arrow">' + LCARROW + '</div>' : '';
      var owner = s.owner ? '<span class="lf-owner lf-owner-' + s.owner + '">' + (s.owner === 'krkn' ? 'Krkn' : 'K8s') + '</span>' : '';
      return arrow + '<div class="lf-step lf-' + s.color + '"><div class="lf-dot"></div>' + s.label + owner + '</div>';
    }).join('');
    lfSteps = flow.querySelectorAll('.lf-step');
  }
  function highlightStep(idx) {
    lfSteps.forEach(function(s, i) { s.classList.toggle('lf-active', i === idx); });
  }

  function showVerifyChecklist(items) {
    var el = document.getElementById('d-verify');
    if (!el) return;
    el.innerHTML = '<div class="verify-card"><div class="verify-title">Recovery Verification</div><div class="verify-checks">' +
      items.map(function(label) {
        return '<div class="verify-row"><div class="verify-icon"><div class="spinner"></div></div><span class="verify-name">' + label + '</span><span class="verify-detail"></span></div>';
      }).join('') +
      '</div></div>';
    el.style.display = '';
    el.style.opacity = '0';
    setTimeout(function() { el.style.opacity = '1'; }, 20);
  }
  function updateVerifyCheck(idx, passed, detail) {
    var el = document.getElementById('d-verify');
    if (!el) return;
    var rows = el.querySelectorAll('.verify-row');
    if (!rows[idx]) return;
    rows[idx].classList.remove('verify-row-passed', 'verify-row-failed');
    rows[idx].classList.add(passed ? 'verify-row-passed' : 'verify-row-failed');
    var icon = rows[idx].querySelector('.verify-icon');
    var checkSVG = passed
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round"><path d="M5 12l5 5L20 7"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="#EC1C24" stroke-width="2.5" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>';
    if (icon) icon.innerHTML = checkSVG;
    var det = rows[idx].querySelector('.verify-detail');
    if (det) det.textContent = detail || '';
  }
  function hideVerifyChecklist() {
    var el = document.getElementById('d-verify');
    if (el) { el.style.opacity = '0'; setTimeout(function() { el.style.display = 'none'; }, 400); }
  }

  /* ── LIFECYCLE STEPS ──────────────────────────────────────── */
  var STEPS = [
    { label: 'Healthy', color: 'green', owner: 'k8s' },
    { label: 'Inject',  color: 'orange', owner: 'krkn' },
    { label: 'Delete',  color: 'red',    owner: 'krkn' },
    { label: 'Detect',  color: 'blue',   owner: 'k8s' },
    { label: 'Reroute', color: 'blue',   owner: 'k8s' },
    { label: 'Remove',  color: 'red',    owner: 'k8s' },
    { label: 'Create',  color: 'blue',   owner: 'k8s' },
    { label: 'Verify',  color: 'blue',   owner: 'krkn' },
    { label: 'Passed',  color: 'green',  owner: 'krkn' },
  ];
  setLifecycle('Pod Delete Scenario', STEPS);

  /* ── POD SCENARIO (adapted from scenario-pod.js, 1.4× pacing) ─ */
  (async function runScenario() {
    var t = 0;

    function check() { if (isAborted()) throw new Error('aborted'); }

    try {
      // Phase 1 — Healthy
      setPhase(1, 'Healthy State', 'All pods serving traffic', 'green', 'k8s');
      highlightStep(0);
      updateSLO('100%', '120ms', '0.1%');
      check(); await wait(600);
      showCtxLabel(wn2, 'Target: Worker Node 2', 'blue', 'top', -26);
      check(); await wait(1400);
      clearCtxLabel();
      t += 2.0;

      // Pre-chaos targeting
      showTargeting(pod3Orig, 'frontend-v2-9f2a');
      check(); await wait(1500);
      t += 1.5;
      clearTargeting();

      // Phase 2 — Injection
      setPhase(2, 'Chaos Injection', 'Krkn targeting frontend-v2-9f2a', 'orange', 'krkn');
      highlightStep(1);
      enterFocusMode();
      krkn.classList.add('krkn-active');
      showChaosLine();
      showKrknTerminal('krknctl run pod-scenarios');
      check(); fireChaosDot();
      check(); await wait(900);
      t += 0.9;

      apiserver.classList.add('cp-highlight');
      check(); await wait(600);
      t += 0.6;
      apiserver.classList.remove('cp-highlight');
      krkn.classList.remove('krkn-active');
      hideChaosLine();

      // Phase 3 — Pod Deleted
      setPhase(3, 'Pod Deleted', 'frontend-v2-9f2a terminating', 'red', 'krkn');
      highlightStep(2);
      setPodStatus(pod3Orig, 'killed');
      fireBlastRing(pod3Orig);
      showCtxLabel(pod3Orig, 'Pod Terminating', 'red', 'top', -24);
      updateSLO('99.8%', '180ms', '0.8%');
      check(); await wait(1000);
      t += 1.0;

      pathBDots.forEach(function(d) { d.style.display = 'none'; });
      showTrafficFailed();
      updateSLO('99.5%', '220ms', '1.2%');
      check(); await wait(800);
      t += 0.8;

      // Phase 4 — Detect
      setPhase(4, 'Drift Detected', 'Controller reconciling', 'blue', 'k8s');
      highlightStep(3);
      controller.classList.add('cp-reconciling');
      showCtxLabel(controller, 'ReplicaSet: desired=2 current=1', 'blue', 'bottom');
      check(); await wait(1000);
      t += 1.0;
      check(); await wait(700);
      t += 0.7;

      // Phase 5 — Reroute
      setPhase(5, 'Traffic Rerouted', 'Endpoint removed from Service', 'blue', 'k8s');
      highlightStep(4);
      showCtxLabel(serviceEl, 'Endpoint removed — traffic rerouted', 'blue', 'bottom');
      addTrafficBoost();
      updateSLO('99.6%', '190ms', '0.9%');
      check(); await wait(2000);
      t += 2.0;

      // Phase 6 — Pod Removed
      setPhase(6, 'Pod Removed', 'Cleaning up failed pod', 'red', 'k8s');
      highlightStep(5);
      clearCtxLabel();
      controller.classList.remove('cp-reconciling');
      check(); await wait(1000);
      t += 1.0;
      pod3Orig.classList.remove('pod-failing');
      pod3Orig.classList.add('pod-dying');
      check(); await wait(600);
      t += 0.6;
      pod3Orig.style.display = 'none';
      pod3Orig.classList.remove('pod-dying');
      check(); await wait(500);
      t += 0.5;

      // Phase 7 — Create
      setPhase(7, 'Creating Pod', 'Scheduler selecting node', 'blue', 'k8s');
      highlightStep(6);
      scheduler.classList.remove('cp-muted');
      scheduler.classList.add('cp-reconciling');
      showCtxLabel(scheduler, 'Selecting optimal node…', 'blue', 'bottom');
      check(); await wait(1000);
      t += 1.0;
      scheduler.classList.remove('cp-reconciling');
      scheduler.classList.add('cp-muted');
      clearCtxLabel();

      var creatingPod = createNewPod('creating');
      pod3Slot.appendChild(creatingPod);
      showCtxLabel(pod3Slot, 'Scheduling replacement pod…', 'blue', 'top', -24);
      updateSLO('99.7%', '170ms', '0.6%');
      check(); await wait(1800);
      t += 1.8;
      check(); await wait(1200);
      t += 1.2;

      creatingPod.remove();
      var readyPod = createNewPod('ready');
      pod3Slot.appendChild(readyPod);
      showCtxLabel(pod3Slot, 'Pod Ready — health checks passing', 'green', 'top', -24);
      updateSLO('99.9%', '140ms', '0.2%');
      check(); await wait(1000);
      t += 1.0;

      // Phase 8 — Verify
      setPhase(8, 'Recovery Verification', 'Validating cluster state', 'blue', 'krkn');
      highlightStep(7);
      clearCtxLabel();
      pathBDots.forEach(function(d) { d.style.display = ''; });
      hideTrafficFailed();
      removeTrafficBoost();
      exitFocusMode();

      showVerifyChecklist(['Workload Recovery', 'Health Checks', 'Critical Alerts']);
      check(); await wait(1200);
      t += 1.2;

      updateVerifyCheck(0, true, 'ReplicaSet 2/2 ready');
      check(); await wait(1000);
      t += 1.0;

      updateVerifyCheck(1, true, 'All probes passing');
      check(); await wait(1000);
      t += 1.0;

      updateVerifyCheck(2, false, 'Recovery latency alert fired (47s > 30s SLO)');
      updateSLO('100%', '122ms', '0.05%');
      check(); await wait(1500);
      t += 1.5;

      hideVerifyChecklist();
      check(); await wait(500);

      // Phase 9 — Passed / loop
      setPhase(9, 'Scenario Complete', 'Resiliency score: 78/100', 'green', 'krkn');
      highlightStep(8);
      showCtxLabel(krkn, 'Exit code 0 — scenario passed', 'green', 'top', -28);
      check(); await wait(3000);
      clearCtxLabel();

      /* Loop: reset and restart */
      if (!isAborted()) {
        _resetDemoDOM();
        setTimeout(function() {
          if (!isAborted()) _runDemo(section, isAborted);
        }, 1000);
      }

    } catch(e) {
      /* aborted */
    }
  })();
}
