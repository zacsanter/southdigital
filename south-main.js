/* ========================
 * 1) HELPER FUNCTIONS
 * ======================== */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
function isValidURL(url) {
  return /^(https?:\/\/)?[^\s.]+\.[^\s]{2,}(\/.*)?$/i.test(url.trim());
}
function isEmptyOrValidURL(value) {
  return !value.trim() || isValidURL(value);
}

// Debounce
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

/* ========================
 * 2) 3D BROWSER TILT
 * ======================== */
function initBrowser3DEffects() {
  const wrappers3d = document.querySelectorAll('.browser-3d:not(.js-3d-initialized)');
  wrappers3d.forEach((wrapper3d) => {
    wrapper3d.classList.add('js-3d-initialized');
    let isHovering = false;

    wrapper3d.addEventListener('mouseenter', () => { isHovering = true; });
    wrapper3d.addEventListener('mousemove', debounce((e) => {
      if (!isHovering) return;
      const rect = wrapper3d.getBoundingClientRect();
      const offsetX = (e.clientX - rect.left) / rect.width - 0.5;
      const offsetY = (e.clientY - rect.top) / rect.height - 0.5;
      const rotateMax = 5;
      const rotateX = -offsetY * rotateMax;
      const rotateY =  offsetX * rotateMax;

      gsap.to(wrapper3d, {
        duration: 0.4,
        rotateX,
        rotateY,
        rotateZ: 0,
        x: 0,
        y: 0,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    }, 16));
    wrapper3d.addEventListener('mouseleave', () => {
      isHovering = false;
      gsap.to(wrapper3d, {
        duration: 1,
        rotateX: 0,
        rotateY: 0,
        rotateZ: 0,
        x: 0,
        y: 0,
        ease: 'power3.inOut',
        overwrite: 'auto'
      });
    });
  });
}

/* ========================
 * 3) SWIPER INITIALIZATION
 * ======================== */
function initializeSwiper() {
  const swiper = new Swiper('.swiper-container', {
    slidesPerView: 'auto',
    freeMode: true,
    centeredSlides: true,
    centeredSlidesBounds: true,
    initialSlide: 3, // “Animation” slide
    observer: true,
    observeParents: true,

    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev'
    },
    mousewheel: {
      forceToAxis: true
    },
    touchStartPreventDefault: false,

    on: {
      init: function() {
        animateEntrance(this);
        updateArrows(this);
      },
      setTranslate: function() {
        updateArrows(this);
      },
      transitionEnd: function() {
        updateArrows(this);
      },
      touchEnd: function() {
        updateArrows(this);
      },
      sliderMove: function() {
        updateArrows(this);
      }
    }
  });

  function updateArrows(swiper) {
    const maxT = swiper.maxTranslate();
    const minT = swiper.minTranslate();
    const curT = swiper.getTranslate();

    const prevBtn = swiper.navigation.prevEl;
    const nextBtn = swiper.navigation.nextEl;
    if (!prevBtn || !nextBtn) return;

    // Hide next if we can’t scroll further right
    if (curT <= maxT + 1) {
      nextBtn.style.display = 'none';
    } else {
      nextBtn.style.display = '';
    }
    // Hide prev if we can’t scroll further left
    if (curT >= minT - 1) {
      prevBtn.style.display = 'none';
    } else {
      prevBtn.style.display = '';
    }
  }

  function animateEntrance(swiper) {
    gsap.killTweensOf(".swiper-slide");
    const slides = swiper.slides;
    const centerIndex = Math.floor(slides.length / 2);

    const slidesWithDistance = Array.from(slides).map((slide, i) => {
      return { slide, distance: Math.abs(i - centerIndex) };
    });
    slidesWithDistance.sort((a, b) => a.distance - b.distance);

    const tl = gsap.timeline();
    slidesWithDistance.forEach((item, idx) => {
      tl.fromTo(
        item.slide,
        { scale: 0.8, opacity: 0, y: 50 },
        { scale: 1, opacity: 1, y: 0, duration: 1, ease: "power3.out" },
        idx * 0.1
      );
    });
  }

  // (Optional) custom arrow elements
  document.body.addEventListener("click", function(e) {
    if (e.target.closest(".swiper-button-next")) {
      e.preventDefault();
      swiper.slideNext();
    } else if (e.target.closest(".swiper-button-prev")) {
      e.preventDefault();
      swiper.slidePrev();
    }
  });
}

/* ========================
 * 4) SIMPLE TESTIMONIAL SLIDER
 * ======================== */
function initializeTestimonialSlider() {
  const slides = document.querySelectorAll(".home_testimonial-1_slide-content");
  let currentIndex = 0;

  function showSlide(index) {
    slides.forEach(sl => sl.classList.remove("active"));
    if (slides[index]) slides[index].classList.add("active");
  }

  function showNextSlide() {
    currentIndex = (currentIndex + 1) % slides.length;
    showSlide(currentIndex);
  }

  function showPrevSlide() {
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    showSlide(currentIndex);
  }

  document.body.addEventListener("click", function(e) {
    if (e.target.closest(".cs-arrow-next")) {
      e.preventDefault();
      showNextSlide();
    } else if (e.target.closest(".cs-arrow-prev")) {
      e.preventDefault();
      showPrevSlide();
    }
  });

  showSlide(currentIndex);
}

/* ========================
 * 5) "LOAD MORE" TESTIMONIALS
 * ======================== */
const CHAR_LIMIT = 110;
function setupLoadMoreOnCard(card) {
  const reviewEl = card.querySelector(".text-size-medium.review");
  const toggleLink = card.querySelector(".loadmore-less");
  if (!reviewEl || !toggleLink) return;

  const fullText = reviewEl.textContent.trim();
  if (fullText.length <= CHAR_LIMIT) {
    toggleLink.style.display = "none";
    return;
  }

  const truncatedText = fullText.slice(0, CHAR_LIMIT) + "...";
  reviewEl.textContent = truncatedText;
  let isTruncated = true;

  toggleLink.addEventListener("click", function(e) {
    e.preventDefault();
    if (isTruncated) {
      reviewEl.textContent = fullText;
      toggleLink.querySelector("div").textContent = "Load less";
    } else {
      reviewEl.textContent = truncatedText;
      toggleLink.querySelector("div").textContent = "Load more";
    }
    isTruncated = !isTruncated;
  });
}

function initLoadMoreTestimonials() {
  const testimonialCards = document.querySelectorAll(".testimonial18_card:not(.js-loadmore-initialized)");
  testimonialCards.forEach(function(card) {
    card.classList.add("js-loadmore-initialized");
    setupLoadMoreOnCard(card);
  });
}

// -------------------------
// Helper: Get UTM Parameters
// -------------------------
function getUtmParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param) || "";
}

function appendUtmParams(formData) {
  formData.set("utm_source", getUtmParam("utm_source"));
  formData.set("utm_campaign", getUtmParam("utm_campaign"));
  formData.set("utm_content", getUtmParam("utm_content"));
  formData.set("utm_medium", getUtmParam("utm_medium"));
  return formData;
}

/* ========================
 * 6) FORM: #email-form
 * ======================== */
function initializeEmailForm() {
  const formEl = document.getElementById('email-form');
  const continueBtn = document.getElementById('continue-btn');
  if (!formEl || !continueBtn) {
    console.warn('Email form or Continue button not found.');
    return;
  }

  const questionBlocks = document.querySelectorAll('.ondemand-page .question-block');
  const checkboxes = formEl.querySelectorAll('.services-interested-checkbox');
  const radios = formEl.querySelectorAll('#question-2 input[type="radio"]');
  const yourNameInput = document.getElementById('your-name');
  const yourEmailInput = document.getElementById('your-email');
  const companyInput = document.getElementById('company-name');
  const websiteInput = document.getElementById('website-url');

  if (!yourNameInput || !yourEmailInput || !companyInput || !websiteInput) {
    console.warn('One or more required inputs not found in #email-form.');
    return;
  }

  const answers = Array(questionBlocks.length).fill(false);

  function allAnswered() {
    return answers.every(Boolean);
  }

  function updateContinueButton() {
    if (allAnswered()) {
      continueBtn.classList.remove('inactive');
      continueBtn.style.pointerEvents = 'auto';
    } else {
      continueBtn.classList.add('inactive');
      continueBtn.style.pointerEvents = 'none';
    }
  }

  function toggleQuestionBlock(qIndex, enable) {
    const qBlock = questionBlocks[qIndex];
    if (!qBlock) return;
    if (enable) {
      qBlock.classList.remove('disabled');
      qBlock.querySelectorAll('input, select, textarea, button, a').forEach(el => {
        if (['INPUT','SELECT','TEXTAREA'].includes(el.tagName)) {
          el.disabled = false;
        } else {
          el.removeAttribute('tabIndex');
          el.removeAttribute('aria-disabled');
        }
      });
    } else {
      qBlock.classList.add('disabled');
      qBlock.querySelectorAll('input, select, textarea, button, a').forEach(el => {
        if (['INPUT','SELECT','TEXTAREA'].includes(el.tagName)) {
          el.disabled = true;
        } else {
          el.setAttribute('tabIndex', '-1');
          el.setAttribute('aria-disabled', 'true');
        }
      });
    }
  }

  // Q1: Services Interested
  checkboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      const anyChecked = Array.from(checkboxes).some(x => x.checked);
      answers[0] = anyChecked;
      if (anyChecked) {
        toggleQuestionBlock(1, true);
      } else {
        toggleQuestionBlock(1, false);
        answers[1] = false;
        for (let i = 2; i < answers.length; i++) {
          toggleQuestionBlock(i, false);
          answers[i] = false;
        }
      }
      updateContinueButton();
    });
  });

  // Q2: Timeframe
  radios.forEach(r => {
    r.addEventListener('change', () => {
      answers[1] = true;
      toggleQuestionBlock(2, true);
      updateContinueButton();
    });
  });

  // Q3: Your Name
  yourNameInput.addEventListener('input', () => {
    answers[2] = (yourNameInput.value.trim() !== '');
    if (answers[2]) {
      toggleQuestionBlock(3, true);
    } else {
      toggleQuestionBlock(3, false);
      answers[3] = false;
      for (let i = 4; i < answers.length; i++) {
        toggleQuestionBlock(i, false);
        answers[i] = false;
      }
    }
    updateContinueButton();
  });

  // Q4: Your Email
  yourEmailInput.addEventListener('input', () => {
    const val = yourEmailInput.value.trim();
    answers[3] = (val !== '' && isValidEmail(val));
    if (answers[3]) {
      toggleQuestionBlock(4, true);
    } else {
      toggleQuestionBlock(4, false);
      answers[4] = false;
      toggleQuestionBlock(5, false);
      answers[5] = false;
    }
    updateContinueButton();
  });

  // Q5: Company Name
  companyInput.addEventListener('input', () => {
    answers[4] = (companyInput.value.trim() !== '');
    if (answers[4]) {
      toggleQuestionBlock(5, true);
    } else {
      toggleQuestionBlock(5, false);
      answers[5] = false;
    }
    updateContinueButton();
  });

  // Q6: Website URL
  websiteInput.addEventListener('input', () => {
    const val = websiteInput.value.trim();
    answers[5] = (val !== '' && isValidURL(val));
    updateContinueButton();
  });

  // Continue Button
  continueBtn.addEventListener('click', function(e) {
    e.preventDefault();
    if (!allAnswered()) {
      console.log("Not all answered, can't continue");
      return;
    }
    if (!isValidURL(websiteInput.value) || !isValidEmail(yourEmailInput.value)) {
      alert("Please ensure both your email and website URL are valid.");
      return;
    }

    const formData = new FormData(formEl);
    const selectedLabels = [];
    checkboxes.forEach((checkbox) => {
      if (checkbox.checked) {
        const labelEl = checkbox.parentNode.querySelector('.ms-pill-label');
        selectedLabels.push(labelEl ? labelEl.textContent.trim() : 'On');
      }
    });
    const joined = selectedLabels.join(', ');
    formData.set('Services-Interested-In-3', joined);

    // Append UTM parameters
    appendUtmParams(formData);

    fetch("https://services.leadconnectorhq.com/hooks/ebN44ZZDqKXacptD3Rm7/webhook-trigger/46c04656-b7f5-4bc9-a90e-1d9fcbea62f8", {
      method: "POST",
      body: formData
    })
    .then(() => {
      window.location.href = "/book/on-demand";
    })
    .catch(err => {
      console.error("Error sending data:", err);
      alert("Error submitting form. Please try again later.");
    });
  });

  // Validate on load
  (function validateOnLoad() {
    const anyChecked = Array.from(checkboxes).some(x => x.checked);
    answers[0] = anyChecked;
    toggleQuestionBlock(1, anyChecked);
    if (!anyChecked) {
      for (let i = 1; i < answers.length; i++) {
        toggleQuestionBlock(i, false);
        answers[i] = false;
      }
      updateContinueButton();
      return;
    }

    const anyRadioChecked = Array.from(radios).some(r => r.checked);
    answers[1] = anyRadioChecked;
    toggleQuestionBlock(2, anyRadioChecked);
    if (!anyRadioChecked) {
      for (let i = 2; i < answers.length; i++) {
        toggleQuestionBlock(i, false);
        answers[i] = false;
      }
      updateContinueButton();
      return;
    }

    const nameFilled = (yourNameInput.value.trim() !== '');
    answers[2] = nameFilled;
    toggleQuestionBlock(3, nameFilled);
    if (!nameFilled) {
      for (let i = 3; i < answers.length; i++) {
        toggleQuestionBlock(i, false);
        answers[i] = false;
      }
      updateContinueButton();
      return;
    }

    const emailVal = yourEmailInput.value.trim();
    const emailValid = isValidEmail(emailVal);
    answers[3] = (emailVal !== '' && emailValid);
    toggleQuestionBlock(4, answers[3]);
    if (!answers[3]) {
      answers[4] = false;
      toggleQuestionBlock(5, false);
      answers[5] = false;
      updateContinueButton();
      return;
    }

    const companyFilled = (companyInput.value.trim() !== '');
    answers[4] = companyFilled;
    toggleQuestionBlock(5, companyFilled);
    if (!companyFilled) {
      answers[5] = false;
      updateContinueButton();
      return;
    }

    const websiteVal = websiteInput.value.trim();
    answers[5] = (websiteVal !== '' && isValidURL(websiteVal));
    updateContinueButton();
  })();
}

// ========================
// 7) FORM: #newbuild-form
// ========================
function initializeNewbuildForm() {
  const formEl = document.getElementById('newbuild-form');
  const continueBtn = document.getElementById('continue-btn-newbuild');
  if (!formEl || !continueBtn) {
    console.warn('New Build form or Continue button not found.');
    return;
  }

  const questionBlocks = document.querySelectorAll('.newbuild-page .question-block');
  const typeRadio = formEl.querySelectorAll('#nb-question-1 input[type="radio"]');
  const purposeCheckboxes = formEl.querySelectorAll('.purpose-of-website-checkbox');
  const timeframeRadio = formEl.querySelectorAll('#nb-question-3 input[type="radio"]');
  const nameInput = document.getElementById('Name');
  const emailInput = document.getElementById('Email-Address');
  const companyInput = document.getElementById('Company-Name-2');
  const websiteInput = document.getElementById('Website-URL-2');

  if (!nameInput || !emailInput || !companyInput || !websiteInput) {
    console.warn('One or more required inputs not found in #newbuild-form.');
    return;
  }
  if (typeRadio.length === 0 || purposeCheckboxes.length === 0 || timeframeRadio.length === 0) {
    console.warn('Radio/checkbox inputs missing for #newbuild-form.');
    return;
  }

  const answers = Array(questionBlocks.length).fill(false);

  function allAnswered() {
    return answers.every(Boolean);
  }

  function updateContinueButton() {
    if (allAnswered()) {
      continueBtn.classList.remove('inactive');
      continueBtn.style.pointerEvents = 'auto';
    } else {
      continueBtn.classList.add('inactive');
      continueBtn.style.pointerEvents = 'none';
    }
  }

  function toggleQuestionBlock(qIndex, enable) {
    const qBlock = questionBlocks[qIndex];
    if (!qBlock) return;
    if (enable) {
      qBlock.classList.remove('disabled');
      qBlock.querySelectorAll('input, select, textarea, button, a').forEach(el => {
        if (['INPUT','SELECT','TEXTAREA'].includes(el.tagName)) {
          el.disabled = false;
        } else {
          el.removeAttribute('tabIndex');
          el.removeAttribute('aria-disabled');
        }
      });
    } else {
      qBlock.classList.add('disabled');
      qBlock.querySelectorAll('input, select, textarea, button, a').forEach(el => {
        if (['INPUT','SELECT','TEXTAREA'].includes(el.tagName)) {
          el.disabled = true;
        } else {
          el.setAttribute('tabIndex', '-1');
          el.setAttribute('aria-disabled', 'true');
        }
      });
    }
  }

  // Q1: Type of Website (Radio)
  typeRadio.forEach(radio => {
    radio.addEventListener('change', () => {
      answers[0] = Array.from(typeRadio).some(x => x.checked);
      if (answers[0]) {
        toggleQuestionBlock(1, true);
      } else {
        for (let i = 1; i < answers.length; i++) {
          toggleQuestionBlock(i, false);
          answers[i] = false;
        }
      }
      updateContinueButton();
    });
  });

  // Q2: Purpose of Website (Checkboxes)
  purposeCheckboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      answers[1] = Array.from(purposeCheckboxes).some(x => x.checked);
      if (answers[1]) {
        toggleQuestionBlock(2, true);
      } else {
        for (let i = 2; i < answers.length; i++) {
          toggleQuestionBlock(i, false);
          answers[i] = false;
        }
      }
      updateContinueButton();
    });
  });

  // Q3: Timeframe (Radio)
  timeframeRadio.forEach(radio => {
    radio.addEventListener('change', () => {
      answers[2] = Array.from(timeframeRadio).some(x => x.checked);
      if (answers[2]) {
        toggleQuestionBlock(3, true);
      } else {
        for (let i = 3; i < answers.length; i++) {
          toggleQuestionBlock(i, false);
          answers[i] = false;
        }
      }
      updateContinueButton();
    });
  });

  // Q4: Name (Removed Debounce)
  nameInput.addEventListener('input', () => {
    answers[3] = (nameInput.value.trim() !== '');
    toggleQuestionBlock(4, answers[3]);
    if (!answers[3]) {
      answers[4] = false;
      for (let i = 5; i < answers.length; i++) {
        toggleQuestionBlock(i, false);
        answers[i] = false;
      }
    }
    updateContinueButton();
  });

  // Q5: Email (Removed Debounce)
  emailInput.addEventListener('input', () => {
    const val = emailInput.value.trim();
    answers[4] = (val !== '' && isValidEmail(val));
    toggleQuestionBlock(5, answers[4]);
    if (!answers[4]) {
      answers[5] = false;
      toggleQuestionBlock(6, false);
      answers[6] = false;
    }
    updateContinueButton();
  });

  // Q6: Company (Removed Debounce)
  companyInput.addEventListener('input', () => {
    const val = companyInput.value.trim();
    answers[5] = (val !== '');
    toggleQuestionBlock(6, answers[5]);
    if (!answers[5]) {
      answers[6] = false;
    }
    updateContinueButton();
  });

  // Q7: Website (Removed Debounce)
  websiteInput.addEventListener('input', () => {
    answers[6] = isEmptyOrValidURL(websiteInput.value);
    updateContinueButton();
  });

  // Continue Button
  continueBtn.addEventListener('click', function(e) {
    e.preventDefault();
    if (!allAnswered()) {
      console.log("Not all answered, can't continue");
      return;
    }
    if (!isEmptyOrValidURL(websiteInput.value) || !isValidEmail(emailInput.value)) {
      alert("Please ensure both your email and website URL are valid.");
      return;
    }

    const formData = new FormData(formEl);

    // Gather Q2 checkboxes
    const selectedLabels = [];
    purposeCheckboxes.forEach((checkbox) => {
      if (checkbox.checked) {
        const labelEl = checkbox.parentNode.querySelector('.ms-pill-label');
        selectedLabels.push(labelEl ? labelEl.textContent.trim() : 'On');
      }
    });
    const joined = selectedLabels.join(', ');
    formData.set('Purpose-of-Website', joined);

    // Append UTM parameters if needed
    appendUtmParams(formData);

    fetch("https://services.leadconnectorhq.com/hooks/ebN44ZZDqKXacptD3Rm7/webhook-trigger/BiZAvMuK6VH4yzD3zjBQ", {
      method: "POST",
      body: formData
    })
    .then(() => {
      window.location.href = "book/new-build";
    })
    .catch(err => {
      console.error("Error sending data:", err);
      alert("Error submitting form. Please try again later.");
    });
  });

  // Validate onLoad
  (function validateOnLoad() {
    answers[0] = Array.from(typeRadio).some(x => x.checked);
    toggleQuestionBlock(1, answers[0]);
    if (!answers[0]) {
      for (let i = 1; i < answers.length; i++) {
        toggleQuestionBlock(i, false);
        answers[i] = false;
      }
      updateContinueButton();
      return;
    }

    answers[1] = Array.from(purposeCheckboxes).some(x => x.checked);
    toggleQuestionBlock(2, answers[1]);
    if (!answers[1]) {
      for (let i = 2; i < answers.length; i++) {
        toggleQuestionBlock(i, false);
        answers[i] = false;
      }
      updateContinueButton();
      return;
    }

    answers[2] = Array.from(timeframeRadio).some(x => x.checked);
    toggleQuestionBlock(3, answers[2]);
    if (!answers[2]) {
      for (let i = 3; i < answers.length; i++) {
        toggleQuestionBlock(i, false);
        answers[i] = false;
      }
      updateContinueButton();
      return;
    }

    answers[3] = (nameInput.value.trim() !== '');
    toggleQuestionBlock(4, answers[3]);
    if (!answers[3]) {
      for (let i = 4; i < answers.length; i++) {
        toggleQuestionBlock(i, false);
        answers[i] = false;
      }
      updateContinueButton();
      return;
    }

    answers[4] = (emailInput.value.trim() !== '' && isValidEmail(emailInput.value.trim()));
    toggleQuestionBlock(5, answers[4]);
    if (!answers[4]) {
      answers[5] = false;
      toggleQuestionBlock(6, false);
      answers[6] = false;
      updateContinueButton();
      return;
    }

    answers[5] = (companyInput.value.trim() !== '');
    toggleQuestionBlock(6, answers[5]);
    if (!answers[5]) {
      answers[6] = false;
      updateContinueButton();
      return;
    }

    answers[6] = isEmptyOrValidURL(websiteInput.value.trim());
    updateContinueButton();
  })();
}

/* ========================
 * 8) MARQUEE (SLOW SPEED)
 * ======================== */
function initMarquee() {
  const marqueeContainer = document.querySelector('.marquee-content.scroll');
  if (!marqueeContainer) return;

  // Duplicate content
  const marqueeContent = marqueeContainer.innerHTML;
  marqueeContainer.insertAdjacentHTML('beforeend', marqueeContent);

  // Width of single set
  const singleWidth = marqueeContainer.scrollWidth / 2;

  // GSAP scroll - slower speed
  gsap.to(marqueeContainer, {
    x: -singleWidth,
    duration: 60,
    repeat: -1,
    ease: 'linear',
    onRepeat: () => {
      gsap.set(marqueeContainer, { x: 0 });
    }
  });
}

/* ========================
 * 9) MOBILE-ONLY SCROLL-TO-TOP ON PAGINATION (Inside #slidertop)
 * ======================== */
function initPaginationScrollMobile() {
  const slidertopEl = document.getElementById('slidertop');
  if (!slidertopEl) return;

  // Only run on mobile devices (<= 767px)
  if (window.innerWidth <= 767) {
    // We'll attach the same smooth-scroll behavior to both prev/next
    function scrollToSliderTop() {
      slidertopEl.scrollIntoView({ behavior: 'smooth' });
    }

    // Grab current .w-pagination-previous and .w-pagination-next links
    const prevButtons = slidertopEl.querySelectorAll('.w-pagination-previous');
    const nextButtons = slidertopEl.querySelectorAll('.w-pagination-next');

    // Attach the scroll event to each one
    prevButtons.forEach((btn) => {
      btn.removeEventListener('click', scrollToSliderTop); // remove any duplicates
      btn.addEventListener('click', scrollToSliderTop);
    });
    nextButtons.forEach((btn) => {
      btn.removeEventListener('click', scrollToSliderTop); // remove any duplicates
      btn.addEventListener('click', scrollToSliderTop);
    });
  }
}

/* ========================
 * 10) DOMContentLoaded MAIN
 * ======================== */
document.addEventListener("DOMContentLoaded", function() {
  initBrowser3DEffects();
  initializeSwiper();
  initializeTestimonialSlider();
  initLoadMoreTestimonials();
  initializeEmailForm();
  initializeNewbuildForm();
  initMarquee();
  initPaginationScrollMobile();

  // Observe newly added items for dynamic grids, etc.
  const observer = new MutationObserver(function(mutations) {
    let foundNew = false;
    for (let mutation of mutations) {
      if (mutation.type === 'childList' && mutation.addedNodes.length) {
        foundNew = true;
      }
    }
    if (foundNew) {
      setTimeout(() => {
        initBrowser3DEffects();
        initLoadMoreTestimonials();
        initPaginationScrollMobile(); 
      }, 50);
    }
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
});

/* ========================
 * 11) GRID ANIMATION (p5.js loader)
 * ======================== */
// Wrap the entire script in a device detection IIFE
(function() {
  // Check if the device is a mobile or tablet
  function isMobileOrTablet() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (window.innerWidth <= 1024); // Additional width check for tablets
  }

  // If it's a mobile/tablet device, skip loading p5.js and the animation script
  if (isMobileOrTablet()) {
    console.log("Mobile or tablet detected. Skipping grid animation.");
    return;
  }

  // Dynamically load p5.js only if not a mobile/tablet device
  const p5Script = document.createElement('script');
  p5Script.src = "https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.6.0/p5.min.js";
  p5Script.onload = initializeGridAnimation;
  p5Script.onerror = function() {
    console.error("Failed to load p5.js");
  };
  document.head.appendChild(p5Script);

  // Main animation initialization function
  function initializeGridAnimation() {
    console.log("p5.js loaded. Initializing grid animation.");

    new p5((p) => {
      // CONSTANTS
      const CELL_SIZE = 40;
      const PROB_OF_NEIGHBOR = 0.5;
      const AMT_FADE_PER_FRAME = 5;
      const MAX_NEIGHBORS = 100;

      // VARIABLES
      let colorWithAlpha;
      let numRows;
      let numCols;
      let currentRow = -2;
      let currentCol = -2;
      let allNeighbors = [];

      // Cached theme colors
      const themeColorCache = {
        light: {
          background: null,
          circle: null
        },
        dark: {
          background: null,
          circle: null
        }
      };

      function cacheThemeColors() {
        const rootStyles = getComputedStyle(document.documentElement);
        // Cache light mode
        themeColorCache.light.background = rootStyles.getPropertyValue('--light--background').trim();
        themeColorCache.light.circle = rootStyles.getPropertyValue('--light--grid-color').trim();
        // Cache dark mode
        themeColorCache.dark.background = rootStyles.getPropertyValue('--dark--background').trim();
        themeColorCache.dark.circle = rootStyles.getPropertyValue('--dark--grid-color').trim();
      }

      function getCurrentThemeColors() {
        const isDarkMode = document.body.classList.contains('dark-mode');
        return isDarkMode ? themeColorCache.dark : themeColorCache.light;
      }

      function updateColors() {
        const colors = getCurrentThemeColors();
        let gridColor = p.color(colors.circle);
        colorWithAlpha = p.color(p.red(gridColor), p.green(gridColor), p.blue(gridColor), 200);
      }

      p.setup = function() {
        console.log("p5.js setup initiated.");
        // Initial color caching
        cacheThemeColors();

        let cnv = p.createCanvas(p.windowWidth, p.windowHeight);
        cnv.style("position", "fixed");
        cnv.style("inset", "0");
        cnv.style("z-index", "-1");

        p.pixelDensity(1);
        updateColors();

        p.noFill();
        p.stroke(colorWithAlpha);
        p.strokeWeight(1);
        updateGridDimensions();

        // Instant theme change listener
        document.addEventListener('themeChanged', () => {
          console.log("Theme changed. Updating colors.");
          cacheThemeColors();
          updateColors();
        });
      };

      function updateGridDimensions() {
        numRows = Math.ceil(p.windowHeight / CELL_SIZE);
        numCols = Math.ceil(p.windowWidth / CELL_SIZE);
        console.log(`Grid dimensions updated: ${numCols} cols x ${numRows} rows`);
      }

      p.draw = function() {
        const themeColors = getCurrentThemeColors();
        p.background(p.color(themeColors.background));

        if (p.focused) {
          const row = p.constrain(p.floor(p.mouseY / CELL_SIZE), 0, numRows - 1);
          const col = p.constrain(p.floor(p.mouseX / CELL_SIZE), 0, numCols - 1);

          if (row !== currentRow || col !== currentCol) {
            currentRow = row;
            currentCol = col;

            if (allNeighbors.length < MAX_NEIGHBORS) {
              allNeighbors.push(...getRandomNeighbors(row, col));
            }
          }

          const x = col * CELL_SIZE;
          const y = row * CELL_SIZE;
          p.stroke(colorWithAlpha);
          p.rect(x, y, CELL_SIZE, CELL_SIZE);
        }

        let i = allNeighbors.length;
        while (i--) {
          const neighbor = allNeighbors[i];
          neighbor.opacity -= AMT_FADE_PER_FRAME;

          if (neighbor.opacity <= 0) {
            allNeighbors.splice(i, 1);
          } else {
            const neighborColor = p.color(
              p.red(colorWithAlpha),
              p.green(colorWithAlpha),
              p.blue(colorWithAlpha),
              neighbor.opacity
            );
            p.stroke(neighborColor);
            p.rect(
              neighbor.col * CELL_SIZE,
              neighbor.row * CELL_SIZE,
              CELL_SIZE,
              CELL_SIZE
            );
          }
        }
      };

      function getRandomNeighbors(row, col) {
        const neighbors = [];
        const neighborOffsets = [
          [-1, -1], [-1, 0], [-1, 1],
          [0, -1], [0, 1],
          [1, -1], [1, 0], [1, 1]
        ];

        const numNeighbors = p.min(4, 8 - Math.floor(allNeighbors.length / 10));
        const shuffledOffsets = neighborOffsets
          .sort(() => Math.random() - 0.5)
          .slice(0, numNeighbors);

        for (const [dRow, dCol] of shuffledOffsets) {
          const neighborRow = row + dRow;
          const neighborCol = col + dCol;
          if (neighborRow >= 0 && neighborRow < numRows &&
              neighborCol >= 0 && neighborCol < numCols &&
              Math.random() < PROB_OF_NEIGHBOR) {
            neighbors.push({
              row: neighborRow,
              col: neighborCol,
              opacity: 255
            });
          }
        }
        return neighbors;
      }

      p.windowResized = function() {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
        updateGridDimensions();
      };
    });
  }
})();

/* ========================
 * 12) CUSTOM CURSOR
 * ======================== */
document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const cursorNormal = document.querySelector('.cursor-normal');
  const pointer = document.querySelector('.pointer');
  const textCursor = document.querySelector('.text-cursor');
  const cursorOn = document.getElementById('cursor-on');
  const customOff = document.getElementById('custom-off');

  let lastMouseX = 0;
  let lastMouseY = 0;

  function updateCursorPosition(x, y) {
    if (cursorNormal) {
      cursorNormal.style.top = `${y}px`;
      cursorNormal.style.left = `${x}px`;
    }
    if (pointer) {
      pointer.style.top = `${y}px`;
      pointer.style.left = `${x}px`;
    }
    if (textCursor) {
      textCursor.style.top = `${y}px`;
      textCursor.style.left = `${x}px`;
    }
  }

  function enableCustomCursor(x, y) {
    body.classList.remove('custom-cursor-disabled');
    body.classList.add('cursor-visible');
    updateCursorPosition(x, y);
    if (cursorOn) {
      cursorOn.classList.add('current');
      cursorOn.setAttribute('aria-pressed', 'true');
    }
    if (customOff) {
      customOff.classList.remove('current');
      customOff.setAttribute('aria-pressed', 'false');
    }
    localStorage.setItem('customCursorEnabled', 'true');
  }

  function disableCustomCursor() {
    body.classList.add('custom-cursor-disabled');
    body.classList.remove('cursor-visible');
    if (cursorOn) {
      cursorOn.classList.remove('current');
      cursorOn.setAttribute('aria-pressed', 'false');
    }
    if (customOff) {
      customOff.classList.add('current');
      customOff.setAttribute('aria-pressed', 'true');
    }
    localStorage.setItem('customCursorEnabled', 'false');
  }

  // On load, see if user previously disabled
  const customCursorEnabled = localStorage.getItem('customCursorEnabled');
  if (customCursorEnabled === 'false') {
    disableCustomCursor();
  } else {
    // Retrieve last known cursor position
    const storedCursorPos = sessionStorage.getItem('cursorPosition');
    if (storedCursorPos) {
      try {
        const { x, y } = JSON.parse(storedCursorPos);
        lastMouseX = x;
        lastMouseY = y;
      } catch (e) {
        console.error('Error parsing cursor position from sessionStorage:', e);
      }
    }
    // The cursor is shown on first mousemove
  }

  // Mousemove => move custom cursor if enabled
  document.addEventListener('mousemove', (e) => {
    if (localStorage.getItem('customCursorEnabled') === 'false') return;
    const x = e.clientX;
    const y = e.clientY;
    lastMouseX = x;
    lastMouseY = y;

    if (!body.classList.contains('cursor-visible')) {
      enableCustomCursor(x, y);
    } else {
      updateCursorPosition(x, y);
    }

    // Save position in sessionStorage
    sessionStorage.setItem('cursorPosition', JSON.stringify({ x, y }));
  });

  // Pointer-style elements
  const pointerSelectors = `
    a, .link, .dropdown-toggle, .footer-card, .w-button, .w-nav-link,
    .dropdown-menu-option, .dropdown-menu-option-cursor, .dropdown-menu-option-cookies,
    .slider-arrow, .footer-link-box
  `;
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(pointerSelectors)) {
      body.classList.add('cursor-pointer');
    }
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(pointerSelectors)) {
      body.classList.remove('cursor-pointer');
    }
  });

  // Text-style elements
  const textSelectors = `
    p, span, h1, h2, h3, h4, h5, h6, .text-container, .text-style-tagline
  `;
  document.addEventListener('mouseover', (e) => {
    if (e.target.matches(textSelectors) && !e.target.closest(pointerSelectors)) {
      body.classList.add('cursor-text');
    }
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.matches(textSelectors) && !e.target.closest(pointerSelectors)) {
      body.classList.remove('cursor-text');
    }
  });

  // Enable/disable custom cursor with buttons
  if (cursorOn) {
    cursorOn.addEventListener('click', () => {
      enableCustomCursor(lastMouseX, lastMouseY);
    });
  }
  if (customOff) {
    customOff.addEventListener('click', () => {
      disableCustomCursor();
    });
  }

  // Clear session-based cursorPosition on resize
  window.addEventListener('resize', () => {
    sessionStorage.removeItem('cursorPosition');
  });

  // Detect mouse leaving window => 'cursor-outside'
  window.addEventListener('mouseout', (e) => {
    if (!e.relatedTarget) {
      body.classList.add('cursor-outside');
    }
  });
  window.addEventListener('mouseover', (e) => {
    if (!e.relatedTarget) {
      body.classList.remove('cursor-outside');
    }
  });
});
