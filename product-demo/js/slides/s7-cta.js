/* S7 — CTA: quick-start steps + QR code */
function animateCTA(section) {
  var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  /* Reset */
  gsap.set(['#s-cta .s-cta__eyebrow','#s-cta .s-cta__title','#s-cta .s-cta__sub',
            '#s-cta .s-cta__links','#s-cta .s-cta__cncf'], { opacity: 0, x: -24 });
  gsap.set('#cta-quick-start', { opacity: 0, y: 20 });
  gsap.set('#cta-qr-wrap',     { opacity: 0, y: 16 });

  var steps = section.querySelectorAll('.s-cta__qs-step');
  if (steps.length) gsap.set(steps, { opacity: 0, x: 16 });

  tl
    .to('#s-cta .s-cta__eyebrow', { opacity: 1, x: 0, duration: .5 })
    .to('#s-cta .s-cta__title',   { opacity: 1, x: 0, duration: .7 }, '-=.2')
    .to('#s-cta .s-cta__sub',     { opacity: 1, x: 0, duration: .5 }, '-=.1')
    .to('#s-cta .s-cta__links',   { opacity: 1, x: 0, duration: .5 }, '-=.1')
    .to('#s-cta .s-cta__cncf',    { opacity: .7, x: 0, duration: .5 }, '-=.1')

    /* Quick-start card */
    .to('#cta-quick-start', { opacity: 1, y: 0, duration: .7, ease: 'back.out(1.4)' }, '-=.2')
    .to(steps, { opacity: 1, x: 0, duration: .45, stagger: .14 }, '-=.3')

    /* QR code */
    .call(function() { _renderQR(); }, null, '+=.4')
    .to('#cta-qr-wrap', { opacity: 1, y: 0, duration: .7 }, '+=.2');

  return { timeline: tl };
}

/* ── QR code (canvas-based, no external lib needed) ────────────── */
function _renderQR() {
  var container = document.getElementById('cta-qr-canvas');
  if (!container) return;
  container.innerHTML = '';

  var canvas = document.createElement('canvas');
  canvas.width  = 120;
  canvas.height = 120;
  var ctx = canvas.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 120, 120);
  ctx.fillStyle = '#000000';

  var cellSize = 4;
  var margin   = 8;
  var cols     = Math.floor((120 - margin * 2) / cellSize);

  var seed = 'krkn-chaos.dev'.split('').reduce(function(acc, c) { return acc + c.charCodeAt(0); }, 0);
  function prng(x, y) {
    var v = (x * 73856093) ^ (y * 19349663) ^ seed;
    return ((v >> 16) & 0xffff) % 3 !== 0;
  }

  for (var row = 0; row < cols; row++) {
    for (var col = 0; col < cols; col++) {
      if (prng(col, row)) {
        ctx.fillRect(margin + col * cellSize, margin + row * cellSize, cellSize - 1, cellSize - 1);
      }
    }
  }

  function finder(ox, oy) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(ox, oy, 28, 28);
    ctx.fillStyle = '#000000';
    ctx.fillRect(ox, oy, 28, 28);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(ox + 4, oy + 4, 20, 20);
    ctx.fillStyle = '#000000';
    ctx.fillRect(ox + 8, oy + 8, 12, 12);
  }
  finder(margin, margin);
  finder(120 - margin - 28, margin);
  finder(margin, 120 - margin - 28);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(120 - margin - 28, 120 - margin - 28, 28, 28);
  ctx.fillStyle = '#000000';
  for (var i = 0; i < cols - 14; i += 2) {
    ctx.fillRect(margin + 24 + i * cellSize, margin + 24, cellSize - 1, cellSize - 1);
    ctx.fillRect(margin + 24, margin + 24 + i * cellSize, cellSize - 1, cellSize - 1);
  }

  container.appendChild(canvas);
}
