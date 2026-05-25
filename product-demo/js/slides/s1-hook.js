/* S1 — Hook: production alert cascade */
function animateHook(section) {
  var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

  /* Reset */
  gsap.set(['#s-hook .s-hook__time', '#s-hook .s-hook__terminal',
             '#hook-question', '#hook-answer'], { opacity: 0, y: 0, x: 0 });
  gsap.set('#s-hook .s-hook__line', { opacity: 0, x: -16 });

  tl
    .to('#s-hook .s-hook__time', { opacity: 1, duration: .6 })
    .to('#s-hook .s-hook__terminal', { opacity: 1, duration: .8 }, '-=.2')
    .to('#hl1', { opacity: 1, x: 0, duration: .5 }, '+=.4')
    .to('#hl2', { opacity: 1, x: 0, duration: .5 }, '+=.6')
    .to('#hl3', { opacity: 1, x: 0, duration: .5 }, '+=.5')
    .to('#hl4', { opacity: 1, x: 0, duration: .5 }, '+=.6')
    .to('#hl5', { opacity: 1, x: 0, duration: .5 }, '+=.7')
    .to('#hook-question', { opacity: 1, y: 0, duration: .9 }, '+=1.2')
    .to('#hook-answer',   { opacity: 1, duration: .8 }, '+=1.0');

  return { timeline: tl };
}
