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
    .to('#cta-qr-wrap', { opacity: 1, y: 0, duration: .7 }, '+=4.0');

  return { timeline: tl, cleanup: function() { if (body) body.innerHTML = ''; } };
}

