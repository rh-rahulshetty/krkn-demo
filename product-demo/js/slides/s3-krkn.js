/* S3 — Meet Krkn: logo breathe + text cascade + badges */
function animateKrkn(section) {
  var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  /* Reset */
  gsap.set('#s-krkn .s-krkn__logo-wrap', { opacity: 0, scale: .8 });
  gsap.set(['#krkn-eyebrow','#krkn-name','#krkn-tagline','#krkn-desc','#krkn-badges','#krkn-github'], { opacity: 0, x: 24 });

  tl
    .to('#s-krkn .s-krkn__logo-wrap', { opacity: 1, scale: 1, duration: .9, ease: 'back.out(1.4)' })
    /* Gentle breathe on the logo */
    .to('#s-krkn .s-krkn__logo', { scale: 1.04, duration: 2, ease: 'sine.inOut', yoyo: true, repeat: -1 }, '-=.3')
    /* Text items stagger in */
    .to('#krkn-eyebrow', { opacity: 1, x: 0, duration: .5 }, '-=1.6')
    .to('#krkn-name',    { opacity: 1, x: 0, duration: .6 }, '-=.3')
    .to('#krkn-tagline', { opacity: 1, x: 0, duration: .5 }, '-=.2')
    .to('#krkn-desc',    { opacity: 1, x: 0, duration: .6 }, '-=.1')
    .to('#krkn-badges',  { opacity: 1, x: 0, duration: .6 }, '+=.3')
    .to('#krkn-github',  { opacity: 1, x: 0, duration: .5 }, '-=.1');

  return { timeline: tl };
}
