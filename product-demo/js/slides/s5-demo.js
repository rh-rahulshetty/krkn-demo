/* ───────────────────────────────────────────────────────────────
   s5-demo.js — Simple demo: Engineer → cluster CPU hog scenario
   ─────────────────────────────────────────────────────────────── */

function animateDemo(section) {
  var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  /* ── Reset ────────────────────────────────────────────────── */
  gsap.set('#d2-actor',     { opacity: 0, x: -30 });
  gsap.set('#d2-cluster',   { opacity: 0, x:  30 });
  gsap.set('#d2-connector', { opacity: 0 });
  gsap.set('#d2-cmd',       { opacity: 0 });
  gsap.set('#d2-conn-label',{ opacity: 0 });

  var log = document.getElementById('d2-log');
  if (log) log.innerHTML = '';
  var cmdText = document.getElementById('d2-cmd-text');
  if (cmdText) cmdText.textContent = '';

  _setMetric('d2-lat', '120ms', 'ok');
  _setMetric('d2-cpu', '14%',   'ok');
  _setMetric('d2-err', '0.1%',  'ok');
  _setNodeDot('d2-n1-dot', 'green');
  _setNodeDot('d2-n2-dot', 'green');

  ['d2-pa', 'd2-pb', 'd2-pc', 'd2-pd'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) {
      el.className = 's-demo2__pod';
      var dot = el.querySelector('.s-demo2__pod-dot');
      if (dot) dot.style.background = 'var(--green)';
    }
  });

  var n2 = document.getElementById('d2-n2');
  if (n2) n2.classList.remove('d2-stressed', 'd2-recovered');

  var existingHog = document.getElementById('d2-hog-pod');
  if (existingHog && existingHog.parentNode) existingHog.parentNode.removeChild(existingHog);

  /* Reset arrow */
  var path = document.getElementById('d2-conn-path');
  var head = document.getElementById('d2-conn-head');
  if (path) gsap.set(path, { strokeDashoffset: 168 });
  if (head) gsap.set(head, { opacity: 0 });

  /* ── Sequence ─────────────────────────────────────────────── */
  tl
    .to('#d2-actor',     { opacity: 1, x: 0, duration: .6 })
    .to('#d2-cluster',   { opacity: 1, x: 0, duration: .6 }, '-=.3')
    .call(function() { _log('ok', '02:41:00', 'Cluster healthy — all pods running'); })

    .to('#d2-connector', { opacity: 1, duration: .4 }, '+=1.0')
    .to('#d2-cmd',       { opacity: 1, duration: .3 }, '+=.2')
    .call(function() { _type('krknctl run cpu-hog --namespace prod', 55); })

    .call(function() { _fireArrow(); }, null, '+=2.0')
    .to('#d2-conn-label', { opacity: 1, duration: .4 }, '+=.3')

    .call(function() {
      _injectHogPod();
      _log('warn', '02:41:07', 'cpu-hog deployed — worker-2 targeted');
    }, null, '+=.5')

    .call(function() {
      if (n2) n2.classList.add('d2-stressed');
      _setNodeDot('d2-n2-dot', 'orange');
      _stressPod('d2-pc');
      _stressPod('d2-pd');
      _log('warn', '02:41:09', 'CPU utilization: 94% on worker-2');
    }, null, '+=.8')

    .call(function() {
      _setMetric('d2-cpu', '94%',   'crit');
      _setMetric('d2-lat', '340ms', 'crit');
      _setMetric('d2-err', '3.2%',  'crit');
      _log('err', '02:41:11', '[!] p95 latency 340ms — SLO threshold 200ms breached');
    }, null, '+=.8')

    .call(function() {
      _removeHogPod();
      _log('ok', '02:41:24', 'Krkn removed stressor — monitoring recovery');
    }, null, '+=3.5')

    .call(function() {
      if (n2) { n2.classList.remove('d2-stressed'); n2.classList.add('d2-recovered'); }
      _setNodeDot('d2-n2-dot', 'green');
      _recoverPod('d2-pc');
      _recoverPod('d2-pd');
      _setMetric('d2-cpu', '14%',   'ok');
      _setMetric('d2-lat', '118ms', 'ok');
      _setMetric('d2-err', '0.1%',  'ok');
      _log('ok', '02:41:27', '[✓] Cluster recovered — failure mode documented');
    }, null, '+=1.0');

  return { timeline: tl };
}

/* ── Helpers ──────────────────────────────────────────────────── */

function _log(level, ts, msg) {
  var container = document.getElementById('d2-log');
  if (!container) return;
  var entry = document.createElement('div');
  entry.className = 's-demo2__log-entry d2-' + level;
  var tsSpan = document.createElement('span');
  tsSpan.className = 's-demo2__log-ts';
  tsSpan.textContent = ts;
  var msgSpan = document.createElement('span');
  msgSpan.className = 's-demo2__log-msg';
  if (level === 'err')  msgSpan.classList.add('d2-log-red');
  if (level === 'warn') msgSpan.classList.add('d2-log-orange');
  if (level === 'ok')   msgSpan.classList.add('d2-log-green');
  msgSpan.textContent = msg;
  entry.appendChild(tsSpan);
  entry.appendChild(msgSpan);
  container.appendChild(entry);
  while (container.children.length > 4) {
    container.removeChild(container.firstChild);
  }
}

function _type(text, msPerChar) {
  var el = document.getElementById('d2-cmd-text');
  if (!el) return;
  el.textContent = '';
  var i = 0;
  var interval = setInterval(function() {
    if (!document.getElementById('d2-cmd-text')) { clearInterval(interval); return; }
    if (i >= text.length) { clearInterval(interval); return; }
    el.textContent += text[i++];
  }, msPerChar);
}

function _fireArrow() {
  var path = document.getElementById('d2-conn-path');
  var head = document.getElementById('d2-conn-head');
  if (path) gsap.to(path, { strokeDashoffset: 0, duration: .7, ease: 'power2.inOut' });
  if (head) gsap.to(head, { opacity: 1, duration: .3, delay: .55 });
}

function _setMetric(id, val, state) {
  var el = document.getElementById(id);
  if (!el) return;
  el.textContent = val;
  el.classList.remove('d2-warn', 'd2-crit');
  if (state === 'crit') el.classList.add('d2-crit');
  if (state === 'warn') el.classList.add('d2-warn');
}

function _setNodeDot(id, color) {
  var el = document.getElementById(id);
  if (!el) return;
  el.classList.toggle('d2-orange', color === 'orange');
  el.style.background = color === 'orange' ? 'var(--orange)' : 'var(--green)';
}

function _stressPod(id) {
  var el = document.getElementById(id);
  if (!el) return;
  el.classList.add('d2-stressed');
  var dot = el.querySelector('.s-demo2__pod-dot');
  if (dot) dot.style.background = 'var(--orange)';
}

function _recoverPod(id) {
  var el = document.getElementById(id);
  if (!el) return;
  el.classList.remove('d2-stressed');
  el.classList.add('d2-recovered');
  var dot = el.querySelector('.s-demo2__pod-dot');
  if (dot) dot.style.background = 'var(--green)';
}

function _injectHogPod() {
  var container = document.getElementById('d2-n2-pods');
  if (!container || document.getElementById('d2-hog-pod')) return;
  var pod = document.createElement('div');
  pod.id = 'd2-hog-pod';
  pod.className = 's-demo2__hog-pod';
  pod.innerHTML = '<div class="s-demo2__pod-dot" style="background:var(--red);flex-shrink:0"></div><span>cpu-hog [chaos]</span>';
  container.appendChild(pod);
  gsap.from(pod, { opacity: 0, y: 8, duration: .4, ease: 'back.out(1.5)' });
}

function _removeHogPod() {
  var pod = document.getElementById('d2-hog-pod');
  if (!pod) return;
  gsap.to(pod, { opacity: 0, y: -8, duration: .5, ease: 'power2.in', onComplete: function() {
    if (pod.parentNode) pod.parentNode.removeChild(pod);
  }});
}
