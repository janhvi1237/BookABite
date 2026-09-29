import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Creates a GSAP context scoped to a ref container for automatic cleanup.
 */
export function createScrollContext(scopeRef, animationSetup) {
  if (!scopeRef.current) return () => {};

  const ctx = gsap.context(() => {
    animationSetup(gsap, ScrollTrigger);
  }, scopeRef);

  return () => ctx.revert();
}

/**
 * Standard staggered card reveal with subtle scale and fade.
 */
export function animateStaggerCards(selector, triggerElement, options = {}) {
  return gsap.fromTo(
    selector,
    { opacity: 0, y: 35, scale: 0.98 },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.7,
      stagger: 0.12,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: triggerElement || selector,
        start: 'top 85%',
        toggleActions: 'play none none none',
        ...options.scrollTrigger,
      },
      ...options,
    }
  );
}

/**
 * Fade up reveal for sections or headings.
 */
export function animateFadeUp(element, options = {}) {
  return gsap.fromTo(
    element,
    { opacity: 0, y: 30 },
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: element,
        start: 'top 88%',
        toggleActions: 'play none none none',
      },
      ...options,
    }
  );
}
