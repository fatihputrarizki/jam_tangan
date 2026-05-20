/* ============================================
   LUXE TIMEPIECE — Full-Page Scroll Engine
   One scroll = one section transition
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ============================
  // CONFIGURATION
  // ============================
  const TRANSITION_DURATION = 1000;  // ms for section transition
  const SCROLL_COOLDOWN = 1200;     // ms before next scroll allowed
  const TOUCH_THRESHOLD = 50;       // px swipe distance to trigger

  // ============================
  // DOM ELEMENTS
  // ============================
  const wrapper = document.getElementById('fullpageWrapper');
  const sections = document.querySelectorAll('.fp-section');
  const navDots = document.querySelectorAll('.fp-nav-dot');
  const progressBar = document.getElementById('fpProgress');
  const counterCurrent = document.getElementById('fpCounterCurrent');
  const scrollHint = document.getElementById('fpScrollHint');
  const navbar = document.getElementById('navbar');
  const preloader = document.getElementById('preloader');

  // ============================
  // STATE
  // ============================
  let currentIndex = 0;
  let isAnimating = false;
  let touchStartY = 0;
  let touchStartX = 0;
  let countersAnimated = false;

  const totalSections = sections.length;

  // ============================
  // PRELOADER
  // ============================
  window.addEventListener('load', () => {
    setTimeout(() => {
      preloader.classList.add('hidden');
      // Trigger first section animations
      setTimeout(() => activateSection(0), 300);
    }, 2200);
  });
  // Fallback
  setTimeout(() => {
    preloader.classList.add('hidden');
    setTimeout(() => activateSection(0), 300);
  }, 3500);

  // ============================
  // CORE: GO TO SECTION
  // ============================
  function goToSection(index, instant = false) {
    if (index < 0 || index >= totalSections) return;
    if (isAnimating && !instant) return;
    if (index === currentIndex && !instant) return;

    isAnimating = true;
    const prevIndex = currentIndex;

    // Mark previous section as leaving
    if (sections[prevIndex] && prevIndex !== index) {
      sections[prevIndex].classList.add('leaving');
      sections[prevIndex].classList.remove('active');
    }

    currentIndex = index;

    // Move wrapper
    const translateY = -(currentIndex * 100);
    wrapper.style.transform = `translateY(${translateY}vh)`;

    // Update UI elements
    updateNavDots();
    updateProgress();
    updateCounter();
    updateNavbar();
    updateScrollHint();
    updateNavLinks();

    // After transition, activate new section
    const delay = instant ? 50 : TRANSITION_DURATION;
    setTimeout(() => {
      // Remove leaving class from all
      sections.forEach(s => s.classList.remove('leaving'));
      // Activate current
      activateSection(currentIndex);
      isAnimating = false;
    }, delay);

    // Trigger special effects per section
    if (currentIndex === 2) triggerCounters(); // Brand Story section
  }

  function activateSection(index) {
    sections.forEach((s, i) => {
      if (i === index) {
        s.classList.add('active');
      } else {
        s.classList.remove('active');
      }
    });
  }

  // ============================
  // UI UPDATES
  // ============================
  function updateNavDots() {
    navDots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
    });
  }

  function updateProgress() {
    const progress = ((currentIndex) / (totalSections - 1)) * 100;
    progressBar.style.width = `${progress}%`;
  }

  function updateCounter() {
    const num = String(currentIndex + 1).padStart(2, '0');
    counterCurrent.textContent = num;
    // Add a quick scale animation
    counterCurrent.style.transform = 'scale(1.2)';
    setTimeout(() => {
      counterCurrent.style.transform = 'scale(1)';
    }, 300);
  }

  function updateNavbar() {
    if (currentIndex > 0) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  function updateScrollHint() {
    if (currentIndex > 0) {
      scrollHint.classList.add('hidden');
    } else {
      scrollHint.classList.remove('hidden');
    }
  }

  function updateNavLinks() {
    const links = document.querySelectorAll('.nav-links a[data-goto]');
    links.forEach(link => {
      const targetIdx = parseInt(link.getAttribute('data-goto'));
      if (targetIdx === currentIndex) {
        link.classList.add('active-link');
      } else {
        link.classList.remove('active-link');
      }
    });
  }

  // ============================
  // MOUSE WHEEL HANDLER
  // ============================
  function handleWheel(e) {
    e.preventDefault();

    if (isAnimating) return;

    const delta = e.deltaY;
    if (Math.abs(delta) < 30) return; // Ignore tiny scrolls

    if (delta > 0) {
      // Scroll down
      goToSection(currentIndex + 1);
    } else {
      // Scroll up
      goToSection(currentIndex - 1);
    }
  }

  window.addEventListener('wheel', handleWheel, { passive: false });

  // ============================
  // TOUCH HANDLERS
  // ============================
  window.addEventListener('touchstart', (e) => {
    touchStartY = e.changedTouches[0].screenY;
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  window.addEventListener('touchend', (e) => {
    if (isAnimating) return;

    const touchEndY = e.changedTouches[0].screenY;
    const touchEndX = e.changedTouches[0].screenX;
    const diffY = touchStartY - touchEndY;
    const diffX = touchStartX - touchEndX;

    // Only trigger if vertical swipe is dominant
    if (Math.abs(diffY) > TOUCH_THRESHOLD && Math.abs(diffY) > Math.abs(diffX)) {
      if (diffY > 0) {
        goToSection(currentIndex + 1);
      } else {
        goToSection(currentIndex - 1);
      }
    }
  }, { passive: true });

  // ============================
  // KEYBOARD NAVIGATION
  // ============================
  window.addEventListener('keydown', (e) => {
    if (isAnimating) return;

    switch (e.key) {
      case 'ArrowDown':
      case 'PageDown':
      case ' ':
        e.preventDefault();
        goToSection(currentIndex + 1);
        break;
      case 'ArrowUp':
      case 'PageUp':
        e.preventDefault();
        goToSection(currentIndex - 1);
        break;
      case 'Home':
        e.preventDefault();
        goToSection(0);
        break;
      case 'End':
        e.preventDefault();
        goToSection(totalSections - 1);
        break;
    }
  });

  // ============================
  // NAV DOT CLICKS
  // ============================
  navDots.forEach(dot => {
    dot.addEventListener('click', () => {
      const index = parseInt(dot.getAttribute('data-index'));
      goToSection(index);
    });
  });

  // ============================
  // DATA-GOTO LINK CLICKS
  // ============================
  document.querySelectorAll('[data-goto]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const index = parseInt(el.getAttribute('data-goto'));
      goToSection(index);

      // Close mobile nav if open
      const navToggle = document.getElementById('navToggle');
      const navLinks = document.getElementById('navLinks');
      navToggle.classList.remove('active');
      navLinks.classList.remove('open');
    });
  });

  // ============================
  // MOBILE NAV TOGGLE
  // ============================
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('open');
  });

  // ============================
  // HERO PARTICLES
  // ============================
  const particlesContainer = document.getElementById('heroParticles');
  for (let i = 0; i < 30; i++) {
    const particle = document.createElement('div');
    particle.classList.add('hero-particle');
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = `${20 + Math.random() * 60}%`;
    particle.style.animationDelay = `${Math.random() * 6}s`;
    particle.style.animationDuration = `${4 + Math.random() * 4}s`;
    const size = 1 + Math.random() * 2;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particlesContainer.appendChild(particle);
  }

  // ============================
  // HERO PARALLAX (mouse move)
  // ============================
  const heroImg = document.getElementById('heroImg');
  const heroSection = sections[0];

  if (heroSection && heroImg) {
    heroSection.addEventListener('mousemove', (e) => {
      if (currentIndex !== 0) return;
      const rect = heroSection.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      heroImg.style.transform = `perspective(1000px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;
    });
    heroSection.addEventListener('mouseleave', () => {
      heroImg.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg)';
      heroImg.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
      setTimeout(() => { heroImg.style.transition = ''; }, 600);
    });
  }

  // ============================
  // COLLECTION CARD TILT
  // ============================
  document.querySelectorAll('.collection-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      card.style.transform = `perspective(800px) rotateX(${(y - 0.5) * -8}deg) rotateY(${(x - 0.5) * 8}deg) translateY(-8px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
      setTimeout(() => { card.style.transition = ''; }, 600);
    });
  });

  // ============================
  // ANIMATED COUNTERS
  // ============================
  function triggerCounters() {
    if (countersAnimated) return;
    countersAnimated = true;

    document.querySelectorAll('.brand-stat-number[data-target]').forEach(counter => {
      const target = parseInt(counter.getAttribute('data-target'));
      const duration = 2000;
      const startTime = performance.now();

      const update = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        counter.textContent = Math.floor(eased * target) + '+';
        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          counter.textContent = target + '+';
        }
      };

      // Small delay before starting
      setTimeout(() => requestAnimationFrame(update), 600);
    });
  }

  // ============================
  // TESTIMONIAL CAROUSEL
  // ============================
  const testimonialTrack = document.getElementById('testimonialTrack');
  const testimonialDots = document.querySelectorAll('.testimonial-dot');
  const prevBtn = document.getElementById('testimonialPrev');
  const nextBtn = document.getElementById('testimonialNext');
  const totalSlides = document.querySelectorAll('.testimonial-slide').length;
  let currentSlide = 0;
  let autoplayInterval;

  function goToSlide(index) {
    if (index < 0) index = totalSlides - 1;
    if (index >= totalSlides) index = 0;
    currentSlide = index;
    testimonialTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
    testimonialDots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSlide);
    });
  }

  testimonialDots.forEach(dot => {
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      goToSlide(parseInt(dot.getAttribute('data-index')));
      resetAutoplay();
    });
  });

  if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); goToSlide(currentSlide - 1); resetAutoplay(); });
  if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); goToSlide(currentSlide + 1); resetAutoplay(); });

  function startAutoplay() { autoplayInterval = setInterval(() => goToSlide(currentSlide + 1), 5000); }
  function resetAutoplay() { clearInterval(autoplayInterval); startAutoplay(); }
  startAutoplay();

  // Carousel swipe (horizontal only, don't interfere with vertical page scroll)
  const carouselEl = document.getElementById('testimonialCarousel');
  let carouselTouchStartX = 0;
  if (carouselEl) {
    carouselEl.addEventListener('touchstart', (e) => {
      carouselTouchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    carouselEl.addEventListener('touchend', (e) => {
      const diffX = carouselTouchStartX - e.changedTouches[0].screenX;
      if (Math.abs(diffX) > 50) {
        if (diffX > 0) goToSlide(currentSlide + 1);
        else goToSlide(currentSlide - 1);
        resetAutoplay();
      }
    }, { passive: true });
  }

  // ============================
  // NEWSLETTER FORM
  // ============================
  const newsletterForm = document.getElementById('newsletterForm');
  const emailInput = document.getElementById('emailInput');

  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = emailInput.value.trim();
      if (!email) return;
      const btn = newsletterForm.querySelector('.newsletter-btn');
      const originalText = btn.textContent;
      btn.textContent = '✓ Berhasil!';
      btn.style.background = 'linear-gradient(135deg, #4ade80, #22c55e)';
      emailInput.value = '';
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
      }, 3000);
    });
  }

  // ============================
  // VIDEO MODAL
  // ============================
  const watchVideoBtn = document.getElementById('watchVideoBtn');
  if (watchVideoBtn) {
    watchVideoBtn.addEventListener('click', () => {
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.92); z-index: 10000;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; opacity: 0; transition: opacity 0.4s ease;
      `;
      const content = document.createElement('div');
      content.style.cssText = `text-align: center; color: #c9a96e; font-family: 'Playfair Display', serif; transform: scale(0.9); transition: transform 0.4s ease;`;
      content.innerHTML = `
        <div style="width: 80px; height: 80px; border: 2px solid #c9a96e; border-radius: 50%;
             display: flex; align-items: center; justify-content: center; margin: 0 auto 24px;">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="#c9a96e"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        </div>
        <h3 style="font-size: 1.5rem; margin-bottom: 8px;">Coming Soon</h3>
        <p style="font-family: Inter, sans-serif; font-size: 0.85rem; color: #888;">Film eksklusif LuxeTimepiece akan segera hadir</p>
        <p style="font-family: Inter, sans-serif; font-size: 0.7rem; color: #555; margin-top: 24px;">Klik dimana saja untuk menutup</p>
      `;
      overlay.appendChild(content);
      document.body.appendChild(overlay);
      // Animate in
      requestAnimationFrame(() => {
        overlay.style.opacity = '1';
        content.style.transform = 'scale(1)';
      });
      overlay.addEventListener('click', () => {
        overlay.style.opacity = '0';
        content.style.transform = 'scale(0.9)';
        setTimeout(() => overlay.remove(), 400);
      });
    });
  }

  // ============================
  // INITIAL STATE
  // ============================
  updateProgress();
  updateCounter();

});
