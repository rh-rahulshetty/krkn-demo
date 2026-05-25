/* S4 — Ecosystem Map: hub + spoke lines + tool card pop-ins */
function animateEcosystem(section) {
  var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  /* Card IDs in order of appearance */
  var cardIds = ['#eco-hub-card','#eco-krknctl-card','#eco-operator-card','#eco-ai-card','#eco-dashboard-card','#eco-assist-card'];

  /* Reset */
  gsap.set('#s-eco\\$ecosystem .s-eco__eyebrow', { opacity: 0, y: 10 });
  gsap.set('#s-eco\\$ecosystem .s-eco__title',   { opacity: 0, y: 10 });
  gsap.set('#eco-hub', { opacity: 0, scale: .7 });
  cardIds.forEach(function(id) { gsap.set(id, { opacity: 0, scale: .88 }); });
  /* Clear old lines */
  var svgEl = document.getElementById('eco-lines');
  while (svgEl && svgEl.firstChild) svgEl.removeChild(svgEl.firstChild);

  /* Header in */
  tl
    .to('#s-ecosystem .s-eco__eyebrow', { opacity: 1, y: 0, duration: .5 })
    .to('#s-ecosystem .s-eco__title',   { opacity: 1, y: 0, duration: .6 }, '-=.2')
    /* Hub pops in */
    .to('#eco-hub', { opacity: 1, scale: 1, duration: .8, ease: 'back.out(1.6)' }, '+=.3');

  /* Draw spokes + pop cards sequentially */
  cardIds.forEach(function(cardId, i) {
    tl
      .call(function() {
        drawSpoke(cardId, svgEl);
      })
      .to(cardId, { opacity: 1, scale: 1, duration: .55, ease: 'back.out(1.4)' }, '-=.1')
      .call(function() {
        var el = document.querySelector(cardId);
        if (el) el.classList.add('eco-visible');
      });
  });

  /* Pulse highlight each card once after all are visible */
  tl.call(function() {
    var delay = 0;
    cardIds.forEach(function(id) {
      var el = document.querySelector(id);
      if (!el) return;
      setTimeout(function() {
        el.classList.add('eco-hl');
        setTimeout(function() { el.classList.remove('eco-hl'); }, 1200);
      }, delay);
      delay += 400;
    });
  }, null, '+=1.0');

  /* ── Spoke drawing helper ──────────────────────────────────── */
  function drawSpoke(cardId, svgEl) {
    if (!svgEl) return;
    var hub   = document.getElementById('eco-hub');
    var card  = document.querySelector(cardId);
    var mapEl = document.querySelector('.s-eco__map');
    if (!hub || !card || !mapEl) return;

    var mapRect  = mapEl.getBoundingClientRect();
    var hubRect  = hub.getBoundingClientRect();
    var cardRect = card.getBoundingClientRect();

    var hubX  = hubRect.left  - mapRect.left + hubRect.width  / 2;
    var hubY  = hubRect.top   - mapRect.top  + hubRect.height / 2;
    var cardX = cardRect.left - mapRect.left + cardRect.width  / 2;
    var cardY = cardRect.top  - mapRect.top  + cardRect.height / 2;

    /* Convert to SVG coordinate space (SVG is sized to match mapEl) */
    var scaleX = svgEl.viewBox.baseVal.width  / mapRect.width;
    var scaleY = svgEl.viewBox.baseVal.height / mapRect.height;

    var x1 = hubX  * scaleX,  y1 = hubY  * scaleY;
    var x2 = cardX * scaleX,  y2 = cardY * scaleY;

    /* If SVG has no explicit viewBox set it from map dimensions */
    if (!svgEl.viewBox.baseVal.width) {
      svgEl.setAttribute('viewBox', '0 0 ' + mapRect.width + ' ' + mapRect.height);
      x1 = hubX; y1 = hubY; x2 = cardX; y2 = cardY;
    }

    var len = Math.hypot(x2 - x1, y2 - y1);

    var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1); line.setAttribute('y1', y1);
    line.setAttribute('x2', x2); line.setAttribute('y2', y2);
    line.setAttribute('stroke', 'rgba(236,28,36,0.35)');
    line.setAttribute('stroke-width', '1.5');
    line.setAttribute('stroke-dasharray', len + ' ' + len);
    line.setAttribute('stroke-dashoffset', len);
    svgEl.appendChild(line);

    gsap.to(line, { strokeDashoffset: 0, duration: .6, ease: 'power2.inOut' });
  }

  function cleanup() {
    var svgEl = document.getElementById('eco-lines');
    if (svgEl) while (svgEl.firstChild) svgEl.removeChild(svgEl.firstChild);
    cardIds.forEach(function(id) {
      var el = document.querySelector(id);
      if (el) { el.classList.remove('eco-visible'); el.classList.remove('eco-hl'); }
    });
  }

  return { timeline: tl, cleanup: cleanup };
}
