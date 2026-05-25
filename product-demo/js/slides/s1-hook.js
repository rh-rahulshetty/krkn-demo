/* S1 — Hook: production incident timeline */
function animateHook(section) {
  var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

  /* Reset */
  gsap.set('#s-hook .s-hook__time', { opacity: 0 });
  gsap.set('.s-hook__tl-event', { opacity: 0, x: -14 });
  gsap.set('.s-hook__tl-line', { scaleY: 0, transformOrigin: 'top center' });
  gsap.set(['#hook-question', '#hook-answer'], { opacity: 0, y: 20 });

  tl
    .to('#s-hook .s-hook__time', { opacity: 1, duration: .5 })
    .to('#hte1', { opacity: 1, x: 0, duration: .45 }, '+=.3')
    .to('#htl1', { scaleY: 1, duration: .35 }, '-=.05')
    .to('#hte2', { opacity: 1, x: 0, duration: .45 }, '+=.35')
    .to('#htl2', { scaleY: 1, duration: .35 }, '-=.05')
    .to('#hte3', { opacity: 1, x: 0, duration: .45 }, '+=.35')
    .to('#htl3', { scaleY: 1, duration: .35 }, '-=.05')
    .to('#hte4', { opacity: 1, x: 0, duration: .45 }, '+=.35')
    .to('#htl4', { scaleY: 1, duration: .35 }, '-=.05')
    .to('#hte5', { opacity: 1, x: 0, duration: .45 }, '+=.35')
    .to('#hook-question', { opacity: 1, y: 0, duration: .85 }, '+=1.0')
    .to('#hook-answer',   { opacity: 1, duration: .7 }, '+=.7');

  return { timeline: tl };
}
