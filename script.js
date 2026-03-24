// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // Preloader logic with minimum display time
  // ==========================================
  const craftingWords = [
    'Initializing...',
    'Designing UX...',
    'Building layout...',
    'Creating UI...',
    'Crafting product...',
    'Testing bugs...',
  ];

  const wordElement = document.getElementById('crafting-word');
  const preloader = document.getElementById('preloader');
  let wordIndex = 0;

  // Change words every 400ms for loading effect
  const wordInterval = setInterval(() => {
    if (wordElement) {
      wordElement.textContent = craftingWords[wordIndex];
      wordIndex = (wordIndex + 1) % craftingWords.length;
    }
  }, 400);

  // Smooth preloader hide animation
  function hidePreloader() {
    clearInterval(wordInterval);
    if (wordElement) {
    // Show final word before fading out
    wordElement.textContent = craftingWords[craftingWords.length - 1];
    }

    // Wait 500ms to show final state, then fade out
    setTimeout(() => {
      if (preloader) preloader.classList.add('preloader-hidden');
      document.body.classList.remove('loading');
    }, 500);
  }

  // Ensure minimum loading time of 2.5 seconds
  const startTime = Date.now();
  const minLoadingTime = 2500;

  // Hide preloader when all resources are loaded
  window.addEventListener('load', () => {
    const elapsedTime = Date.now() - startTime;
    // Wait for remaining time if loaded faster than minimum
    const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
    
    setTimeout(hidePreloader, remainingTime);
  });

  // Safety fallback: hide preloader after max 6 seconds
  setTimeout(hidePreloader, 6000);

  // ==========================================
  // Moscow time display
  // ==========================================
  function updateMoscowTime() {
    const formatter = new Intl.DateTimeFormat('ru-RU', {
      timeZone: 'Europe/Moscow',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    const timeString = formatter.format(new Date());

    const timeElement = document.getElementById('moscow-time');
    if (timeElement) {
      timeElement.textContent = timeString;
    }
  }

  // Update time immediately and then every minute
  updateMoscowTime();
  setInterval(updateMoscowTime, 60000);

  // ==========================================
  // Sanitize/Utility helpers
  // ==========================================
  function decodeBase64Safe(encodedText) {
    if (!encodedText) return '';
    try {
      return atob(encodedText);
    } catch (error) {
      console.warn('Base64 decode failed', encodedText, error);
      return '';
    }
  }

  // ==========================================
  // Typewriter effect for status badge
  // ==========================================
  let typeWriterTimeout;

  function typeWriter(element, text, speed = 100) {
    if (!element) return;

    clearTimeout(typeWriterTimeout);

    let i = 0;
    element.textContent = '';

    function type() {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        typeWriterTimeout = setTimeout(type, speed);
      }
    }

    // Start typing after a delay
    typeWriterTimeout = setTimeout(type, 1000);
  }

  // ==========================================
  // Contact page interactivity
  // ==========================================
  function addContactInteractivity() {
    const contactSection = document.querySelector('.cube-face--top');
    const socialTiles = document.querySelectorAll('.social-tile');
    
    if (!contactSection) return;
    
    // Add subtle parallax to particles on mouse move
    contactSection.addEventListener('mousemove', (e) => {
      const rect = contactSection.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      
      const blobs = contactSection.querySelectorAll('.blob');
      blobs.forEach((blob, index) => {
        const speed = (index + 1) * 0.5;
        const moveX = (x - 0.5) * speed;
        const moveY = (y - 0.5) * speed;
        blob.style.transform = `translate(${moveX}vh, ${moveY}vh)`;
      });
    });
    
    // Social tile interaction is handled by CSS hover states
  }

  // Initialize contact interactivity
  addContactInteractivity();
  const cube = document.getElementById('cube');
  const links = document.querySelectorAll('.nav-link');
  const blobs = document.querySelectorAll('.blob');

  const faceOrder = ['front', 'bottom', 'back', 'top'];
  let currentIndex = 0;
  let currentAngle = 0;
  let isRotating = false;

  function updateActiveMenu(index) {
    links.forEach(link => link.classList.remove('active'));
    const activeLink = document.querySelector(`.nav-link[data-face="${faceOrder[index]}"]`);
    if (activeLink) activeLink.classList.add('active');

    document.querySelectorAll('.cube-face').forEach(face => face.classList.remove('active'));
    const activeFace = document.querySelector('.cube-face--' + faceOrder[index]);
    if (activeFace) activeFace.classList.add('active');

    if (faceOrder[index] === 'top') {
      const badge = document.querySelector('.status-badge.available');
      if (badge && badge.dataset.text) {
        typeWriter(badge, badge.dataset.text);
      }
    }
  }

  updateActiveMenu(currentIndex);

  function rotateCube(steps) {
    const isModalActive = modal ? modal.classList.contains('active') : false;
    if (isRotating || steps === 0 || isModalActive) return;
    isRotating = true;
    if (cube) cube.classList.add('is-rotating');
    currentAngle += steps * 90;

    currentIndex = (currentIndex + steps) % 4;
    if (currentIndex < 0) currentIndex += 4;

    if (cube) cube.style.transform = `translateZ(-50vh) rotateX(${currentAngle}deg)`;

    setTimeout(() => {
      updateActiveMenu(currentIndex);
      isRotating = false;
      if (cube) cube.classList.remove('is-rotating');
    }, 1000);
  }

  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetIndex = faceOrder.indexOf(link.getAttribute('data-face'));
      if (targetIndex === -1 || targetIndex === currentIndex) return;

      let diff = targetIndex - currentIndex;
      if (diff > 2) diff -= 4;
      if (diff < -2) diff += 4;

      rotateCube(diff);
    });
  });

 // Mouse wheel and trackpad scrolling with sticky edge effect
  let lastCubeRotationTime = 0;
  let lastScrollEventTime = 0;
  const cubeCooldown = 1500; // Prevent rapid consecutive rotations
  const edgePause = 300;     // Pause duration at text edges

  window.addEventListener('wheel', (e) => {
    const now = Date.now();
    // Measure time since last scroll event
    const timeSinceLastScroll = now - lastScrollEventTime;
    lastScrollEventTime = now; // Update timer for each wheel movement

    const currentFaceEl = document.querySelector(`.cube-face--${faceOrder[currentIndex]}`);
    if (!currentFaceEl) return;

    // Check if content inside the face can be scrolled
    const isScrollable = currentFaceEl.scrollHeight > currentFaceEl.clientHeight;

    if (isScrollable) {
      const atTop = currentFaceEl.scrollTop === 0;
      // Math.ceil спасает от багов с масштабированием экрана
      const atBottom = Math.ceil(currentFaceEl.scrollTop + currentFaceEl.clientHeight) >= currentFaceEl.scrollHeight - 2;

      // Let browser handle scrolling if content fits inside face
      if (e.deltaY > 0 && !atBottom) return;
      if (e.deltaY < 0 && !atTop) return; 

      // Sticky edge: prevent cube rotation while user is scrolling
      // If scrolling is continuous (inertia), require pause before rotating cube
      if (timeSinceLastScroll < edgePause) {
        e.preventDefault(); 
        return; 
      }
    }

    // Text reached edge and inertia is absorbed, take control
    e.preventDefault();

    // Prevent rotation if cube is already rotating or cooldown is active
    if (isRotating || (now - lastCubeRotationTime < cubeCooldown)) return;

    // All clear, rotate cube and update timer
    lastCubeRotationTime = now;

    if (e.deltaY > 0) rotateCube(1);
    else rotateCube(-1);
    
  }, { passive: false }); // preventDefault() requires passive: false

  // --- Улучшенный обработчик свайпов для мобильных устройств ---
  let startX = 0;
  let startY = 0;

  window.addEventListener('touchstart', (e) => {
    if (isRotating) return;
    const isModalActive = modal ? modal.classList.contains('active') : false;
    if (isModalActive) return;

    if (e.touches && e.touches.length > 0) {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }
  }, { passive: true });

  function handleTouchEnd(e) {
    if (isRotating || !startX || !startY) return;

    const isModalActive = modal ? modal.classList.contains('active') : false;
    if (isModalActive) return;

    const touch = e.changedTouches && e.changedTouches.length > 0 ? e.changedTouches[0] : null;
    if (!touch) return;

    const diffX = startX - touch.clientX;
    const diffY = startY - touch.clientY;

    if (Math.abs(diffX) > Math.abs(diffY) + 10 && Math.abs(diffX) > 40) {
      if (diffX > 0) {
        rotateCube(1); // Свайп влево -> куб вправо
      } else {
        rotateCube(-1); // Свайп вправо -> куб влево
      }
    }

    startX = 0;
    startY = 0;
  }

  window.addEventListener('touchend', handleTouchEnd);
  window.addEventListener('touchcancel', handleTouchEnd); // Защита от прерывания свайпа браузером

  function moveBlobs(e) {
    let pageX = e.type === 'touchmove' ? e.changedTouches[0].clientX : e.clientX;
    let pageY = e.type === 'touchmove' ? e.changedTouches[0].clientY : e.clientY;

    const normalizedX = (pageX / window.innerWidth) - 0.5;
    const normalizedY = (pageY / window.innerHeight) - 0.5;

    blobs.forEach((blob, index) => {
      const depthFactor = (index + 1) * 2;
      const moveX = normalizedX * depthFactor;
      const moveY = normalizedY * depthFactor;
      blob.style.transform = `translate(${moveX}vh, ${moveY}vh)`;
    });
  }

  window.addEventListener('mousemove', moveBlobs);
  window.addEventListener('touchmove', moveBlobs, { passive: true });

  // ==========================================
  // --- MASTER MODAL CONTROL (With Navigation & Slide) ---
  // ==========================================
  const modal = document.getElementById('project-modal');
  const closeModalBtn = document.getElementById('close-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalDesc = document.getElementById('modal-desc');
  const modalImage = document.getElementById('modal-image-container');
  const modalLink = document.getElementById('modal-link');
  const animContainer = document.getElementById('modal-anim-container');
  const prevBtn = document.getElementById('prev-project');
  const nextBtn = document.getElementById('next-project');
  const projectCards = document.querySelectorAll('.project-card');

  let currentOpenProjectIndex = -1;
  let isModalAnimating = false;

  function updateModalData(cardIndex) {
    if (cardIndex < 0 || cardIndex >= projectCards.length) return;
    
    currentOpenProjectIndex = cardIndex;
    const card = projectCards[currentOpenProjectIndex];
    
    const title = card.querySelector('h3').innerText;
    const desc = card.getAttribute('data-description');
    const imageDiv = card.querySelector('.project-image');
    const bgImage = imageDiv.style.backgroundImage;
    const extLink = card.querySelector('.project-link');

    modalTitle.innerText = title;
    modalDesc.innerText = desc;
    modalImage.style.backgroundImage = bgImage;
    
    if (extLink && extLink.href && extLink.href !== "#") {
        modalLink.href = extLink.href;
        modalLink.style.display = 'inline-block';
    } else {
        modalLink.style.display = 'none';
    }
  }

  function changeProject(direction) {
    if (isModalAnimating) return; 
    isModalAnimating = true; 

    let nextIndex = currentOpenProjectIndex + direction;

    if (nextIndex < 0) nextIndex = projectCards.length - 1; 
    else if (nextIndex >= projectCards.length) nextIndex = 0; 

    const swipeClassOut = direction === 1 ? 'swipe-out-next' : 'swipe-out-prev';
    const startTranslate = direction === 1 ? '50px' : '-50px';

    animContainer.classList.add(swipeClassOut);

    setTimeout(() => {
      updateModalData(nextIndex);
      
      animContainer.classList.remove(swipeClassOut);
      animContainer.classList.add('swipe-in');
      animContainer.style.transform = `translateX(${startTranslate})`;

      setTimeout(() => {
          animContainer.classList.remove('swipe-in');
          animContainer.style.transform = `translateX(0)`;
          isModalAnimating = false; 
      }, 50); 
    }, 300); 
  }

  projectCards.forEach((card, index) => {
    card.addEventListener('click', () => {
      updateModalData(index);
      if (modal) modal.classList.add('active');
    });
  });

  if (prevBtn) prevBtn.addEventListener('click', () => changeProject(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => changeProject(1));
  if (closeModalBtn && modal) closeModalBtn.addEventListener('click', () => modal.classList.remove('active'));

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  }

  document.addEventListener('keydown', (e) => {
    const modalOpen = modal ? modal.classList.contains('active') : false;
    if (e.key === 'Escape' && modalOpen) {
      modal.classList.remove('active');
    }
    if (modalOpen) {
      if (e.key === 'ArrowLeft') changeProject(-1);
      if (e.key === 'ArrowRight') changeProject(1);
    }
  });

  // --- Защита от спама (декодирование Base64) ---
  document.querySelectorAll('.obfuscated-text').forEach(el => {
    const encodedText = el.getAttribute('data-text');
    if (encodedText) {
      el.textContent = decodeBase64Safe(encodedText);
    }
  });

  document.querySelectorAll('.social-tile').forEach(tile => {
    tile.addEventListener('click', function(e) {
      e.preventDefault();
      const encodedLink = this.getAttribute('data-link');
      const decodedUrl = decodeBase64Safe(encodedLink);
      if (!decodedUrl) return;

      if (decodedUrl.startsWith('mailto:')) {
        window.location.href = decodedUrl;
      } else {
        window.open(decodedUrl, '_blank', 'noreferrer');
      }
    });
  });
});