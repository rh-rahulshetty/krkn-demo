/* S2 — Chaos Engineering: 4-step cycle */
function animateChaos(section) {
  var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  /* Reset */
  gsap.set(['#s-chaos .s-chaos__eyebrow', '#s-chaos .s-chaos__title', '#s-chaos .s-chaos__sub'], { opacity: 0, y: 20 });
  gsap.set(['#cs1','#cs2','#cs3','#cs4'], { opacity: 0, y: 30 });
  gsap.set(['#ca1','#ca2','#ca3'], { opacity: 0 });
  gsap.set('#chaos-tagline', { opacity: 0 });

  tl
    .to('#s-chaos .s-chaos__eyebrow', { opacity: 1, y: 0, duration: .5 })
    .to('#s-chaos .s-chaos__title',   { opacity: 1, y: 0, duration: .6 }, '-=.2')
    .to('#s-chaos .s-chaos__sub',     { opacity: 1, y: 0, duration: .6 }, '-=.2')
    /* Steps cascade in with active highlight */
    .to('#cs1', { opacity: 1, y: 0, duration: .6 }, '+=.4')
    .call(function() { document.getElementById('cs1').classList.add('cs-active'); })
    .to('#ca1', { opacity: 1, duration: .4 }, '+=.2')
    .to('#cs2', { opacity: 1, y: 0, duration: .6 })
    .call(function() { document.getElementById('cs2').classList.add('cs-active'); })
    .to('#ca2', { opacity: 1, duration: .4 }, '+=.2')
    .to('#cs3', { opacity: 1, y: 0, duration: .6 })
    .call(function() { document.getElementById('cs3').classList.add('cs-active'); })
    .to('#ca3', { opacity: 1, duration: .4 }, '+=.2')
    .to('#cs4', { opacity: 1, y: 0, duration: .6 })
    .call(function() { document.getElementById('cs4').classList.add('cs-active'); })
    .to('#chaos-tagline', { opacity: 1, duration: .8 }, '+=1.0');

  function cleanup() {
    ['cs1','cs2','cs3','cs4'].forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.classList.remove('cs-active');
    });
  }

  return { timeline: tl, cleanup: cleanup };
}
