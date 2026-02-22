/* ============================================================
   PORTFOLIO — script.js
   Author : Alex Rivera
   Handles: Cursor, Scroll, Skill Bars, Form Validation,
            LocalStorage Feedback, Section Reveal
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {

  /* ============================================================
     1. CUSTOM CURSOR
     ============================================================ */
  const dot  = document.getElementById("cursorDot");
  const ring = document.getElementById("cursorRing");

  let mouseX = 0, mouseY = 0;
  let ringX  = 0, ringY  = 0;

  // Move dot instantly with mouse
  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX - 4 + "px";
    dot.style.top  = mouseY - 4 + "px";
  });

  // Animate ring with smooth lag
  function animateRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    ring.style.left = ringX - 18 + "px";
    ring.style.top  = ringY - 18 + "px";
    requestAnimationFrame(animateRing);
  }
  animateRing();

  // Ring grows on interactive elements
  const interactiveEls = document.querySelectorAll("a, button, .skill-card, .project-card, .contact-item");
  interactiveEls.forEach((el) => {
    el.addEventListener("mouseenter", () => {
      ring.style.width   = "60px";
      ring.style.height  = "60px";
      ring.style.opacity = "0.6";
    });
    el.addEventListener("mouseleave", () => {
      ring.style.width   = "36px";
      ring.style.height  = "36px";
      ring.style.opacity = "1";
    });
  });


  /* ============================================================
     2. SCROLL PROGRESS BAR
     ============================================================ */
  const progressBar = document.getElementById("scrollProgress");

  window.addEventListener("scroll", () => {
    const scrolled   = window.scrollY;
    const maxScroll  = document.documentElement.scrollHeight - window.innerHeight;
    const percentage = (scrolled / maxScroll) * 100;
    progressBar.style.width = percentage + "%";
  });


  /* ============================================================
     3. MOBILE NAV TOGGLE
     ============================================================ */
  const navToggle = document.getElementById("navToggle");
  const nav       = document.querySelector("nav");

  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      nav.classList.toggle("open");
      navToggle.textContent = nav.classList.contains("open") ? "✕" : "☰";
    });

    // Close nav when a link is clicked
    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("open");
        navToggle.textContent = "☰";
      });
    });
  }


  /* ============================================================
     4. SKILL BAR ANIMATION (Intersection Observer)
     ============================================================ */
  const barFills = document.querySelectorAll(".bar-fill");

  const barObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const fill      = entry.target;
          const targetPct = fill.getAttribute("data-width") || "0";
          fill.style.width = targetPct + "%";
          barObserver.unobserve(fill); // animate once
        }
      });
    },
    { threshold: 0.3 }
  );

  barFills.forEach((fill) => barObserver.observe(fill));


  /* ============================================================
     5. SECTION REVEAL (cards & items fade up on scroll)
     ============================================================ */
  const revealItems = document.querySelectorAll(
    ".skill-card, .project-card, .contact-item, .about-img-wrap, .about-content"
  );

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity   = "1";
          entry.target.style.transform = "translateY(0)";
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  revealItems.forEach((el) => {
    // Set initial hidden state via JS (mirrors CSS starting values)
    el.style.opacity    = "0";
    el.style.transform  = "translateY(24px)";
    el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    revealObserver.observe(el);
  });


  /* ============================================================
     6. FORM VALIDATION
     ============================================================ */

  /**
   * Show or hide a validation error message for a field.
   * @param {string} fieldId - The input element's id
   * @param {string} message - Error text to display
   * @param {boolean} hasError - Whether to show the error
   */
  function setFieldError(fieldId, message, hasError) {
    const input    = document.getElementById(fieldId);
    const errorEl  = document.getElementById(fieldId + "-error");

    if (!input || !errorEl) return;

    if (hasError) {
      errorEl.textContent = message;
      errorEl.style.display = "block";
      input.classList.add("error");
    } else {
      errorEl.style.display = "none";
      input.classList.remove("error");
    }
  }

  /**
   * Validate an email address format.
   * @param {string} email
   * @returns {boolean}
   */
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Clear all validation errors from the form.
   */
  function clearAllErrors() {
    ["fname", "email", "message"].forEach((id) => setFieldError(id, "", false));
  }

  // Live validation — clear error once user starts correcting the field
  ["fname", "email", "message"].forEach((id) => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener("input", () => setFieldError(id, "", false));
    }
  });


  /* ============================================================
     7. FORM SUBMISSION + LOCAL STORAGE
     ============================================================ */
  const contactForm  = document.getElementById("contactForm");
  const successMsg   = document.getElementById("successMsg");
  const STORAGE_KEY  = "portfolio_feedback";

  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      clearAllErrors();

      // Collect values
      const name    = document.getElementById("fname").value.trim();
      const email   = document.getElementById("email").value.trim();
      const message = document.getElementById("message").value.trim();
      const topic   = document.getElementById("topic").value;

      // Validate
      let isValid = true;

      if (name === "") {
        setFieldError("fname", "Please enter your full name.", true);
        isValid = false;
      }

      if (email === "" || !isValidEmail(email)) {
        setFieldError("email", "Please enter a valid email address.", true);
        isValid = false;
      }

      if (message === "") {
        setFieldError("message", "Please write a message before sending.", true);
        isValid = false;
      }

      if (!isValid) return; // Stop submission if errors exist

      // Build feedback entry
      const entry = {
        id:      Date.now(),
        name:    name,
        email:   email,
        message: message,
        topic:   topic,
        date:    new Date().toLocaleDateString("en-US", {
          year:   "numeric",
          month:  "short",
          day:    "numeric",
          hour:   "2-digit",
          minute: "2-digit",
        }),
      };

      // Save to localStorage
      saveFeedback(entry);

      // DOM Manipulation — show success, hide form
      contactForm.style.display = "none";
      if (successMsg) {
        successMsg.classList.add("show");
      }

      // Reset form data
      contactForm.reset();

      // Re-render feedback list
      renderFeedbackList();

      // After 5 seconds restore the form
      setTimeout(() => {
        if (successMsg) successMsg.classList.remove("show");
        contactForm.style.display = "block";
      }, 5000);
    });
  }


  /* ============================================================
     8. LOCAL STORAGE HELPERS
     ============================================================ */

  /**
   * Save a new feedback entry to localStorage.
   * @param {Object} entry
   */
  function saveFeedback(entry) {
    const existing = loadFeedback();
    existing.unshift(entry); // newest first
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  }

  /**
   * Load all feedback entries from localStorage.
   * @returns {Array}
   */
  function loadFeedback() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  }

  /**
   * Escape HTML to prevent XSS when inserting user content into the DOM.
   * @param {string} str
   * @returns {string}
   */
  function escapeHTML(str) {
    return String(str)
      .replace(/&/g,  "&amp;")
      .replace(/</g,  "&lt;")
      .replace(/>/g,  "&gt;")
      .replace(/"/g,  "&quot;")
      .replace(/'/g,  "&#039;");
  }

  /**
   * Render stored feedback entries into the DOM.
   */
  function renderFeedbackList() {
    const container = document.getElementById("feedbackContainer");
    if (!container) return;

    const entries = loadFeedback();

    if (entries.length === 0) {
      container.innerHTML = `
        <div class="feedback-empty">
          No messages yet — be the first to leave one!
        </div>`;
      return;
    }

    // Show up to 5 most recent entries
    const html = entries.slice(0, 5).map((entry) => `
      <div class="feedback-item">
        <div class="feedback-header">
          <div class="feedback-author">
            <div class="feedback-avatar">${escapeHTML(entry.name.charAt(0).toUpperCase())}</div>
            <div>
              <div class="feedback-name">${escapeHTML(entry.name)}</div>
              <div class="feedback-email">${escapeHTML(entry.email)}</div>
            </div>
          </div>
          <div class="feedback-date">${escapeHTML(entry.date)}</div>
        </div>
        <div class="feedback-topic">${escapeHTML(entry.topic)}</div>
        <div class="feedback-msg">"${escapeHTML(entry.message)}"</div>
      </div>
    `).join("");

    container.innerHTML = html;
  }

  // Render existing feedback on page load
  renderFeedbackList();


  /* ============================================================
     9. ACTIVE NAV HIGHLIGHT ON SCROLL
     ============================================================ */
  const sections = document.querySelectorAll("section[id]");
  const navLinks  = document.querySelectorAll("nav a");

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute("id");
          navLinks.forEach((link) => {
            link.style.color = link.getAttribute("href") === "#" + id
              ? "var(--accent)"
              : "";
          });
        }
      });
    },
    { threshold: 0.4 }
  );

  sections.forEach((sec) => sectionObserver.observe(sec));

}); // end DOMContentLoaded
