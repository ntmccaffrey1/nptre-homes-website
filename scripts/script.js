/* =================================
   Lenis Scroll
================================= */ 

let resizeTimeout;
const lenis = new Lenis({
  duration: 1,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smooth: true,
  smoothTouch: false,
});

function lenisScroll() {
  function raf(time) {
    if (!document.body.classList.contains('ov-hidden')) {
      lenis.raf(time);
    }
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
}

function refreshLenis() {
  clearTimeout(resizeTimeout); // Cancel previous resize calls
  resizeTimeout = setTimeout(() => {
    requestAnimationFrame(() => {
      lenis.resize(); // Recalculate dimensions inside requestAnimationFrame for smoother transitions
    });
  }, 300); // Adjust delay as needed
}

// Refresh Lenis when the page fully loads
window.addEventListener("load", refreshLenis);


/* =================================
   Link Click Fade In / Out
================================= */ 

function bodyFadeInOut() {
  // Remove .page-exit if page is restored from bfcache
  window.addEventListener("pageshow", (event) => {
    document.body.classList.remove("page-exit");
  });

  // Fade out when a link is clicked
  document.addEventListener("click", (e) => {
    const link = e.target.closest("a[href]");
    if (!link) return;

    const href = link.getAttribute("href");

    // Skip anchors, external links, target="_blank", or mailto: links
    if (
      !href ||
      href.startsWith("#") ||
      link.target === "_blank" ||
      href.startsWith("http") ||
      href.startsWith("mailto:")
    ) return;

    e.preventDefault();
    document.body.classList.add("page-exit");

    // Navigate after transition
    setTimeout(() => {
      window.location.href = href;
    }, 400);
  });
}

/* =================================
   Utility Functions
================================= */ 

function isElementInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top < window.innerHeight && 
    rect.bottom > 0 && 
    rect.left < window.innerWidth && 
    rect.right > 0 
  );
}

/* =================================
 Split Heading's into Span Elements
================================= */ 

function staggerFade() {
  const headers = document.querySelectorAll('.stagger-fade');

  headers.forEach(header => {
    const words = header.textContent.trim().split(' ');
    header.innerHTML = words.map(word => `<span>${word}</span>`).join(' ');

    const spans = header.querySelectorAll('span');

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          spans.forEach((span, i) => {
            span.style.transitionDelay = `${i * 100}ms`;
          });
          header.classList.add('visible');
          observer.unobserve(header);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(header);
  });
}

/* =================================
 Fade Out On Scroll
================================= */ 

function fadeOutOnScroll(selector, threshold = 500) {
  const fadeOutEl = document.querySelector(selector);

  if (!fadeOutEl) return;

  window.addEventListener('scroll', function() {
    const opacity = Math.max(0, 1 - window.scrollY / threshold);
    fadeOutEl.style.opacity = opacity;
  });
}

/* =================================
 Scroll Progress Bar
================================= */ 

function scrollProgressBar() {
  window.addEventListener('scroll', () => {
    const scrollProg = document.getElementById('scroll-progress');

    if (!scrollProg) return;

    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    scrollProg.style.width = scrollPercent + '%';
  });
}

/* =================================
 Fade In Elements On Scroll
================================= */ 

function fadeInElements() {
  const fadeInElements = document.querySelectorAll('.initial-blur');

  function onScroll() {
    fadeInElements.forEach(element => {
        if (isElementInViewport(element)) {
            element.classList.add('visible');
        }
    });
  }
  window.addEventListener('scroll', onScroll);
  onScroll();
}

/* ====================================================================
 Wait Until ::before Displays on Project Hero and Hero Homepage Slider
==================================================================== */ 

function waitBefore() {
  const projectHero = document.querySelector(".project-hero");
  const hero = document.querySelector(".hero");

  // Handle .project-hero image
  if (projectHero) {
    const img = projectHero.querySelector("img");

    if (img) {
      if (img.complete) {
        projectHero.classList.add("img-loaded");
      } else {
        img.addEventListener("load", () => {
          projectHero.classList.add("img-loaded");
        });
      }
    }
  }

  // Handle .hero image
  if (hero) {
    const firstHeroImage = hero.querySelector(".hero-image img");
    if (firstHeroImage) {
      if (firstHeroImage.complete) {
        hero.classList.add("img-loaded");
      } else {
        firstHeroImage.addEventListener("load", () => {
          hero.classList.add("img-loaded");
        });
      }
    }
  }
}

/* =================================
   Homepage Slider
================================= */ 

function heroSlider() {
  const slides = document.querySelectorAll('.hero-image');
  const navContainer = document.getElementById('slider-nav');

  if (!slides.length || !navContainer) return;

  navContainer.setAttribute('role', 'tablist');

  const SLIDE_DURATION = 5000;
  let currentSlide = 0;
  let isPaused = false;
  const navButtons = [];

  const icons = {
    play: `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`,
    pause: `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`
  };

  // Create navigation buttons
  slides.forEach((_, index) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.classList.add('nav-btn');
    btn.textContent = index + 1;
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-label', `Go to slide ${index + 1}`);
    btn.setAttribute('aria-selected', 'false');
    btn.setAttribute('tabindex', index === 0 ? '0' : '-1');

    btn.addEventListener('click', () => handleNavClick(index));
    navContainer.appendChild(btn);
    navButtons.push(btn);
  });

  navContainer.addEventListener('keydown', (e) => {
    const focusedIndex = navButtons.findIndex(btn => btn === document.activeElement);
  
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
  
      const dir = e.key === 'ArrowRight' ? 1 : -1;
      const nextIndex = (focusedIndex + dir + navButtons.length) % navButtons.length;
  
      navButtons[nextIndex].focus();         // move keyboard focus
      goToSlide(nextIndex);                  // change slide
    }
  });

  function handleNavClick(index) {
    if (index === currentSlide) {
      togglePause();
    } else {
      goToSlide(index);
    }
  }

  function goToSlide(index) {
    clearProgress(navButtons[currentSlide]);

    slides[currentSlide].classList.remove('incoming');
    slides[currentSlide].setAttribute('aria-hidden', 'true');
    navButtons[currentSlide].classList.remove('active');
    navButtons[currentSlide].setAttribute('aria-selected', 'false');

    currentSlide = index;

    slides[currentSlide].classList.add('incoming');
    slides[currentSlide].setAttribute('aria-hidden', 'false');
    navButtons[currentSlide].classList.add('active');
    navButtons[currentSlide].setAttribute('aria-selected', 'true');

    updateNavButtons();

    if (!isPaused) {
      startProgress(navButtons[currentSlide], SLIDE_DURATION, 0, () => {
        goToSlide((currentSlide + 1) % slides.length);
      });
    }
  }

  function togglePause() {
    isPaused = !isPaused;
    updateNavButtons();

    const currentBtn = navButtons[currentSlide];

    if (isPaused) {
      cancelAnimationFrame(currentBtn._progressFrame);
    } else {
      const elapsed = currentBtn._elapsed || 0;
      startProgress(currentBtn, SLIDE_DURATION, elapsed, () => {
        goToSlide((currentSlide + 1) % slides.length);
      });
    }
  }

  function updateNavButtons() {
    navButtons.forEach((btn, i) => {
      btn.classList.toggle('active', i === currentSlide);
      btn.setAttribute('aria-selected', i === currentSlide ? 'true' : 'false');
      btn.setAttribute('tabindex', i === currentSlide ? '0' : '-1');
      btn.innerHTML = (i === currentSlide)
        ? (isPaused ? icons.play : icons.pause)
        : i + 1;
    });
  }

  function clearProgress(btn) {
    if (btn._progressFrame) {
      cancelAnimationFrame(btn._progressFrame);
      btn.style.setProperty('--progress', '0%');
      btn._elapsed = 0;
    }
  }

  function startProgress(button, duration, startAt = 0, onComplete = () => {}) {
    let start = null;

    function step(timestamp) {
      if (!start) start = timestamp - startAt;
      const elapsed = timestamp - start;
      const percent = Math.min(elapsed / duration, 1) * 100;

      button.style.setProperty('--progress', `${percent}%`);
      button._elapsed = elapsed;

      if (elapsed < duration) {
        button._progressFrame = requestAnimationFrame(step);
      } else {
        button._elapsed = 0;
        onComplete();
      }
    }

    if (button._progressFrame) {
      cancelAnimationFrame(button._progressFrame);
    }

    button._progressFrame = requestAnimationFrame(step);
  }

  window.addEventListener('load', () => {
    const firstSlide = document.querySelector('.hero-image.scale-in');
    
    if (firstSlide) {
      setTimeout(() => {
        firstSlide.classList.remove('scale-in');
      }, 1000); // 1000ms = 1 second
    }
  });

  slides.forEach((slide, index) => {
    slide.setAttribute('aria-hidden', index === currentSlide ? 'false' : 'true');
  });

  // Initialize
  slides[currentSlide].classList.add('incoming');
  navButtons[currentSlide].classList.add('active');
  updateNavButtons();

  startProgress(navButtons[currentSlide], SLIDE_DURATION, 0, () => {
    goToSlide((currentSlide + 1) % slides.length);
  });
}

/* =================================
 Back to Home's Button
================================= */ 

function backToHomes() {
  const backButton = document.querySelector('.back-button');
  const showAtScrollY = 100; 

  if (!backButton) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > showAtScrollY) {
      backButton.classList.add('visible');
    } else {
      backButton.classList.remove('visible');
    }
  });
}

/* =================================
 Menu Toggle
================================= */ 

function menuToggle() {
  const hamburger = document.getElementById('hamburger');
  const menu = document.getElementById('menu');
  const overlay = document.getElementById('menu__overlay');

  if (!(hamburger && menu && overlay)) return;

  const toggleMenuState = (isOpen) => {
    const toggleClass = (element, className, add = true) =>
      element.classList[add ? 'add' : 'remove'](className);

    // Toggle active state for hamburger icon
    hamburger.classList.toggle('active');

    if (isOpen) {
      toggleClass(menu, 'show', false);
      toggleClass(menu, 'closing');
      toggleClass(overlay, 'show', false);
      document.body.classList.remove('ov-hidden');
      lenis.start();

      // Remove closing class after transition completes
      setTimeout(() => toggleClass(menu, 'closing', false), 400);
    } else {
      toggleClass(menu, 'show');
      toggleClass(overlay, 'show');
      document.body.classList.add('ov-hidden');
      lenis.stop();
    }
  };

  hamburger.addEventListener('click', () => {
    const isOpen = menu.classList.contains('show');
    toggleMenuState(isOpen);
  });
}

/* =================================
 Set Active Link in Main Menu
================================= */ 

function setActiveLink() {
  if (window.innerWidth <= 992) return;

  const links = document.querySelectorAll('.main-menu a');
  const currentPath = window.location.pathname;

  let activeLink = null;

  links.forEach(link => {
    const linkPath = new URL(link.getAttribute('href'), window.location.origin).pathname;
    const isExactMatch = linkPath === currentPath;
    const isHomesMatch = linkPath.endsWith('/homes') && currentPath.startsWith('/homes/');

    if (isExactMatch || isHomesMatch) {
      link.classList.add('active');
      activeLink = link;
    }
  });

  const applyOpacity = (hoveredLink = null) => {
    links.forEach(link => {
      link.style.opacity =
        hoveredLink ? (link === hoveredLink ? '1' : '0.3') :
        activeLink ? (link === activeLink ? '1' : '0.3') :
        '1';
    });
  };

  links.forEach(link => {
    link.addEventListener('mouseenter', () => applyOpacity(link));
    link.addEventListener('mouseleave', () => applyOpacity());
  });

  applyOpacity(); // Set initial opacity based on active
}

/* =================================
 Sub Nav Link and Image Hover Effect
================================= */ 

function subNavHoverEffect() {
  const links = document.querySelectorAll('.hover-link');
  if (!links.length) return;

  let currentImage = null;

  // Initialize first link and image
  const firstLink = links[0];
  const firstImage = document.getElementById(`${firstLink.id}-img`);
  if (firstImage) {
    firstImage.style.opacity = '1';
    currentImage = firstImage;
  }
  firstLink.style.opacity = '1';

  links.forEach(link => {
    link.addEventListener('mouseenter', () => {
      const newImage = document.getElementById(`${link.id}-img`);

      if (newImage && newImage !== currentImage) {
        currentImage?.style.setProperty('opacity', '0');
        newImage.style.opacity = '1';
        currentImage = newImage;
      }

      links.forEach(otherLink =>
        otherLink.style.opacity = otherLink === link ? '1' : '0.3'
      );
    });
  });
}

/* =================================
 Lazy Load Images
================================= */ 

// Lazy load images using IntersectionObserver
function lazyImages() {
  if ('IntersectionObserver' in window) {
    const lazyImages = document.querySelectorAll('img.lazy');

    const lazyLoad = (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.getAttribute('data-src');  // Set the real image source
          img.classList.remove('lazy');
          observer.unobserve(img);
        }
      });
    };

    const observer = new IntersectionObserver(lazyLoad, {
      root: null,
      rootMargin: '0px 0px -25px 0px'
    });

    lazyImages.forEach(image => {
      observer.observe(image);
    });
  } else {
    // Fallback for browsers without IntersectionObserver support
    const images = document.querySelectorAll('img.lazy');
    images.forEach(img => {
      img.src = img.getAttribute('data-src');  // Set the real image source
    });
  }
}

/* =================================
   Project Popup Gallery
================================= */ 

function gallery() {
  const popup = document.getElementById('image-popup');
  if (!popup) return;

  const popupImg = popup.querySelector('.popup-image');
  const closeBtn = popup.querySelector('.close-btn');
  const nextBtn = popup.querySelector('.next-btn');
  const prevBtn = popup.querySelector('.prev-btn');
  const counter = popup.querySelector('.popup-counter');
  const galleryImages = Array.from(document.querySelectorAll('.gallery-image img'));

  let currentIndex = 0;
  let touchStartX = 0, touchEndX = 0, touchStartTime = 0;

  const SWIPE_THRESHOLD = 50;
  const TAP_THRESHOLD = 10;
  const TIME_THRESHOLD = 500;

  function updatePopup() {
    const img = galleryImages[currentIndex];
    const imgSrc = img.src || img.dataset.src;
    const imgAlt = img.alt || '';

    popupImg.classList.remove('visible');

    const tempImg = new Image();
    tempImg.onload = () => {
      popupImg.src = imgSrc;
      popupImg.alt = imgAlt;
      counter.textContent = `${currentIndex + 1} / ${galleryImages.length}`;
      setTimeout(() => popupImg.classList.add('visible'), 50);
    };
    tempImg.src = imgSrc;
  }

  function openPopup(index) {
    currentIndex = index;
    popup.classList.add('show');
    document.body.classList.add('ov-hidden');
    lenis.stop();
    setTimeout(updatePopup, 10); // let browser apply changes first
  }

  function closePopup() {
    popup.classList.remove('show');
    setTimeout(() => {
      popupImg.src = '';
      counter.textContent = '';
      document.body.classList.remove('ov-hidden');
      lenis.start();
    }, 300);
  }

  function showNextImage() {
    currentIndex = (currentIndex + 1) % galleryImages.length;
    updatePopup();
  }

  function showPrevImage() {
    currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
    updatePopup();
  }

  // Swipe handling
  function handleTouchStart(e) {
    if (e.touches.length > 1) return;
    touchStartX = touchEndX = e.touches[0].screenX;
    touchStartTime = Date.now();
  }

  function handleTouchMove(e) {
    if (e.touches.length > 1) return;
    touchEndX = e.touches[0].screenX;
  }

  function handleTouchEnd() {
    const deltaX = touchEndX - touchStartX;
    const elapsed = Date.now() - touchStartTime;

    if (Math.abs(deltaX) > SWIPE_THRESHOLD && elapsed < TIME_THRESHOLD) {
      deltaX < 0 ? showNextImage() : showPrevImage();
    }

    // Reset
    touchStartX = touchEndX = touchStartTime = 0;
  }

  // Attach listeners
  closeBtn?.addEventListener('click', closePopup);
  nextBtn?.addEventListener('click', showNextImage);
  prevBtn?.addEventListener('click', showPrevImage);

  popupImg.addEventListener('touchstart', handleTouchStart, false);
  popupImg.addEventListener('touchmove', handleTouchMove, false);
  popupImg.addEventListener('touchend', handleTouchEnd, false);

  galleryImages.forEach((img, i) =>
    img.addEventListener('click', () => openPopup(i))
  );

  // Optional button to open gallery from outside
  document.querySelector('.open-gallery')?.addEventListener('click', () => {
    if (galleryImages.length) openPopup(0);
  });
}  

/* =================================
   Full Screen Homes Page
================================= */ 

function projectFullSlider() {
  const slides = document.querySelectorAll('.slide');
  const slider = document.getElementById('project-slider');
  const slideCounter = document.getElementById('slide-counter');
  const arrowUp = document.getElementById('arrow-up');
  const arrowDown = document.getElementById('arrow-down');
  const wrapper = document.querySelector('.fullpage-wrapper');

  if (!slider || !slideCounter || !slides.length || !wrapper) return;

  let currentIndex = 0;
  let isScrolling = false;
  let startY = 0;
  let isTouching = false;

  const SLIDE_DELAY = 1000;
  const ANIMATION_DELAY = 500;

  // Set heights and recenter
  function updateSliderHeight() {
    const vh = window.innerHeight;
    wrapper.style.height = `${vh}px`;
    document.querySelectorAll('.project-hero, .slide').forEach(el => {
      el.style.height = `${vh}px`;
    });
    recenterCurrentSlide();
  }

  function recenterCurrentSlide() {
    const slideHeight = window.innerHeight;
    slider.style.transform = `translateY(-${currentIndex * slideHeight}px)`;
  }

  function updateCounter() {
    slideCounter.textContent = `${currentIndex + 1} / ${slides.length}`;
  }

  function updateActiveClass() {
    slides.forEach((slide, idx) => {
      slide.classList.toggle('active', idx === currentIndex);
    });
  }

  function updateArrowStates() {
    arrowUp.disabled = currentIndex === 0;
    arrowDown.disabled = currentIndex === slides.length - 1;
  }

  function animateSlideImage(slide) {
    const img = slide.querySelector('img');
    if (!img) return;

    img.classList.remove('image-pre-fade');
    img.style.animation = 'none';
    img.offsetHeight; // force reflow
    img.classList.add('image-pre-fade');

    setTimeout(() => {
      img.style.animation = 'fadeScaleIn 0.6s ease-out forwards';
    }, ANIMATION_DELAY);
  }

  function goToSlide(index) {
    if (isScrolling || index < 0 || index >= slides.length) return;

    currentIndex = index;
    const slideHeight = window.innerHeight;
    slider.style.transform = `translateY(-${currentIndex * slideHeight}px)`;

    updateActiveClass();
    updateArrowStates();
    updateCounter();
    animateSlideImage(slides[currentIndex]);

    isScrolling = true;
    setTimeout(() => isScrolling = false, SLIDE_DELAY);
  }

  function nextSlide() {
    if (currentIndex < slides.length - 1) goToSlide(currentIndex + 1);
  }

  function prevSlide() {
    if (currentIndex > 0) goToSlide(currentIndex - 1);
  }

  window.addEventListener('load', () => {
    updateSliderHeight();
    updateCounter();
  });

  window.addEventListener('resize', updateSliderHeight);

  wrapper.addEventListener('touchmove', e => e.preventDefault(), { passive: false });

  arrowUp?.addEventListener('click', prevSlide);
  arrowDown?.addEventListener('click', nextSlide);

  window.addEventListener('wheel', e => {
    if (isScrolling) return;
    e.deltaY > 0 ? nextSlide() : prevSlide();
  });

  window.addEventListener('touchstart', e => {
    startY = e.touches[0].clientY;
    isTouching = true;
  }, { passive: true });

  window.addEventListener('touchend', e => {
    if (!isTouching || isScrolling) return;

    const deltaY = startY - e.changedTouches[0].clientY;
    if (Math.abs(deltaY) > 50) {
      deltaY > 0 ? nextSlide() : prevSlide();
    }
    isTouching = false;
  });
}

/* =================================
 Page Background Transition
================================= */ 

function bodyFadeInOut() {
  const overlay = document.getElementById('transition-overlay');

  // Clear transition on pageshow (e.g., back/forward cache)
  window.addEventListener('pageshow', () => {
    document.body.classList.remove('page-exit');
    overlay?.classList.remove('show');
  });

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href]');
    if (!link) return;

    const href = link.getAttribute('href');
    const isExternal = href.startsWith('http') || href.startsWith('mailto:');

    // Skip non-navigational or external links
    if (!href || href.startsWith('#') || isExternal || link.target === '_blank') return;

    e.preventDefault();
    overlay?.classList.add('show');

    setTimeout(() => {
      window.location.href = href;
    }, 400);
  });
}

/* =================================
 Initializers
================================= */ 

document.addEventListener('DOMContentLoaded', () => {
  loadHeader()
    .then(() => {
      menuToggle();
      subNavHoverEffect();
      setActiveLink();
    })
    .catch(err => console.error('Failed to load header:', err));

  if (!document.body.classList.contains('no-footer')) {
    loadFooter().catch(err => console.error('Failed to load footer:', err));
  }

  initializeComponents();
});

function loadHeader() {
  return fetch('../utilities/header.html')
    .then(response => response.text())
    .then(html => {
      document.getElementById('header').innerHTML = html;
    });
}

function loadFooter() {
  return fetch('../utilities/footer.html')
    .then(response => response.text())
    .then(html => {
      document.getElementById('footer').innerHTML = html;
    });
}

function initializeComponents() {
  scrollProgressBar();
  backToHomes();
  bodyFadeInOut();
  staggerFade();
  gallery();
  fadeOutOnScroll('.project_down_arrow');
  fadeOutOnScroll('.fade-out-element');
  fadeInElements();
  heroSlider();
  lazyImages();
  lenisScroll();
  projectFullSlider();
  waitBefore();
}