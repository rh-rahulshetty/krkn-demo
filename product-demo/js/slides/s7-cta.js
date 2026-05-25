/* S12 — CTA: terminal quick-start + QR code */
function animateCTA(section) {
  var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  var body = document.getElementById('cta-body');
  if (body) body.innerHTML = '';

  /* Reset */
  gsap.set(['#s-cta .s-cta__eyebrow','#s-cta .s-cta__title','#s-cta .s-cta__sub',
            '#s-cta .s-cta__links','#s-cta .s-cta__cncf'], { opacity: 0, x: -24 });
  gsap.set('#cta-terminal', { opacity: 0, y: 20 });
  gsap.set('#cta-qr-wrap',  { opacity: 0, y: 16 });

  tl
    .to('#s-cta .s-cta__eyebrow', { opacity: 1, x: 0, duration: .5 })
    .to('#s-cta .s-cta__title',   { opacity: 1, x: 0, duration: .7 }, '-=.2')
    .to('#s-cta .s-cta__sub',     { opacity: 1, x: 0, duration: .5 }, '-=.1')
    .to('#s-cta .s-cta__links',   { opacity: 1, x: 0, duration: .5 }, '-=.1')
    .to('#s-cta .s-cta__cncf',    { opacity: .7, x: 0, duration: .5 }, '-=.1')

    /* Terminal */
    .to('#cta-terminal', { opacity: 1, y: 0, duration: .7, ease: 'back.out(1.4)' }, '-=.2')
    .call(function() {
      if (!body) return;
      var lines = [
        { html: '<span class="t-output--dim"># 01 — Install the CLI</span>',                                          pause: .4 },
        { html: '<span class="t-prompt">$</span> <span class="t-cmd">curl -fsSL https://raw.githubusercontent.com/</span>',  pause: .2 },
        { html: '<span class="t-cmd">    krkn-chaos/krknctl/refs/heads/main/install.sh | bash</span>',                pause: .6 },
        { html: '<span class="t-output t-output--green">✔  krknctl installed</span>',                                 pause: .6 },
        { html: '<span class="t-output--dim"># 02 — Pick a scenario</span>',                                          pause: .4 },
        { html: '<span class="t-prompt">$</span> <span class="t-cmd">krknctl list available</span>',                  pause: .6 },
        { html: '<span class="t-output">   pod-scenarios        node-scenarios</span>',                                pause: .15 },
        { html: '<span class="t-output">   network-chaos        cpu-hog</span>',                                       pause: .15 },
        { html: '<span class="t-output">   memory-hog           io-hog</span>',                                        pause: .5 },
        { html: '<span class="t-output--dim"># 03 — Run &amp; measure</span>',                                        pause: .4 },
        { html: '<span class="t-prompt">$</span> <span class="t-cmd">krknctl run pod-scenarios \\</span>',            pause: .2 },
        { html: '<span class="t-output--dim">    --namespace prod --pod-label app=frontend</span>',                    pause: .6 },
        { html: '<span class="t-output t-output--green">✔  Resiliency score: 78/100</span><span class="t-cursor">_</span>', pause: 0 },
      ];
      typeInto(body, lines, 0);
    })

    /* QR code */
    .call(function() { _renderQR(); }, null, '+=4.0')
    .to('#cta-qr-wrap', { opacity: 1, y: 0, duration: .7 }, '+=.2');

  return { timeline: tl, cleanup: function() { if (body) body.innerHTML = ''; } };
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
