(() => {
  "use strict";
  const header = document.querySelector(".site-header");
  const menuButton = document.querySelector(".menu-toggle");
  const mobileMenu = document.querySelector("#mobile-menu");
  const isFixedHeaderPage = document.body.classList.contains("rooms-page");

  const closeMenu = () => {
    if (!mobileMenu || !menuButton) return;
    mobileMenu.hidden = true;
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Открыть меню");
  };

  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", () => {
      const open = menuButton.getAttribute("aria-expanded") !== "true";
      menuButton.setAttribute("aria-expanded", String(open));
      menuButton.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
      mobileMenu.hidden = !open;
    });
    mobileMenu.querySelectorAll("a").forEach(a => a.addEventListener("click", closeMenu));
  }

  if (header && !isFixedHeaderPage) {
    window.addEventListener("scroll", () => header.classList.toggle("scrolled", window.scrollY > 30), { passive: true });
  }

  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add("visible"); observer.unobserve(entry.target); }
    }), { threshold: 0.1 });
    revealItems.forEach(el => observer.observe(el));
  } else {
    revealItems.forEach(el => el.classList.add("visible"));
  }

  // Booking buttons preselect the room and bring the form into view.
  document.querySelectorAll("[data-room]").forEach(link => link.addEventListener("click", () => {
    const comment = document.querySelector('[name="comment"]');
    if (comment) comment.value = `Интересует: ${link.dataset.room}. `;
  }));

  // Interactive gallery lightbox with prev/next buttons, keyboard arrows, swipe & thumbnails.
  const lightbox = document.querySelector("#lightbox");
  const galleryItems = [...document.querySelectorAll(".gallery-item")];
  if (lightbox && galleryItems.length) {
    const lightboxImg = lightbox.querySelector(".lightbox-stage img");
    const lightboxTitle = document.querySelector("#lightbox-title");
    const lightboxCounter = document.querySelector("#lightbox-counter");
    const thumbsWrap = document.querySelector("#lightbox-thumbs");
    let currentPhoto = 0;
    let touchStartX = 0;

    if (thumbsWrap) {
      galleryItems.forEach((item, idx) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "lightbox-thumb";
        btn.setAttribute("aria-label", `Фото ${idx + 1}`);
        const thumbImg = document.createElement("img");
        thumbImg.src = item.querySelector("img").src;
        thumbImg.alt = "";
        btn.appendChild(thumbImg);
        btn.addEventListener("click", () => showPhoto(idx));
        thumbsWrap.appendChild(btn);
      });
    }

    const showPhoto = index => {
      currentPhoto = (index + galleryItems.length) % galleryItems.length;
      const item = galleryItems[currentPhoto];
      const img = item.querySelector("img");
      lightboxImg.src = item.dataset.full;
      lightboxImg.alt = img.alt;
      if (lightboxTitle) lightboxTitle.textContent = img.alt;
      if (lightboxCounter) lightboxCounter.textContent = `${currentPhoto + 1} / ${galleryItems.length}`;
      if (thumbsWrap) {
        [...thumbsWrap.children].forEach((t, i) => t.classList.toggle("active", i === currentPhoto));
      }
    };

    const openPhoto = index => {
      showPhoto(index);
      if (!lightbox.open) lightbox.showModal();
    };

    galleryItems.forEach((item, idx) => item.addEventListener("click", () => openPhoto(idx)));
    const openAllBtn = document.querySelector("#open-gallery-btn");
    if (openAllBtn) openAllBtn.addEventListener("click", () => openPhoto(0));

    const prevBtn = document.querySelector("#lightbox-prev");
    const nextBtn = document.querySelector("#lightbox-next");
    if (prevBtn) prevBtn.addEventListener("click", () => showPhoto(currentPhoto - 1));
    if (nextBtn) nextBtn.addEventListener("click", () => showPhoto(currentPhoto + 1));

    lightbox.addEventListener("touchstart", e => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
    lightbox.addEventListener("touchend", e => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 40) showPhoto(currentPhoto + (dx < 0 ? 1 : -1));
    }, { passive: true });

    document.addEventListener("keydown", e => {
      if (!lightbox.open) return;
      if (e.key === "ArrowLeft") showPhoto(currentPhoto - 1);
      if (e.key === "ArrowRight") showPhoto(currentPhoto + 1);
    });

    lightbox.addEventListener("click", event => { if (event.target === lightbox) lightbox.close(); });
    lightbox.addEventListener("close", () => { lightboxImg.src = ""; });
  }

  // Mini photo sliders on rooms.html
  document.querySelectorAll("[data-slider]").forEach(slider => {
    const imgs = [...slider.querySelectorAll("img")];
    if (imgs.length < 2) return;
    let idx = 0;
    const setSlide = next => {
      idx = (next + imgs.length) % imgs.length;
      imgs.forEach((im, i) => im.classList.toggle("active", i === idx));
    };
    slider.querySelector(".mini-prev")?.addEventListener("click", () => setSlide(idx - 1));
    slider.querySelector(".mini-next")?.addEventListener("click", () => setSlide(idx + 1));
  });

  // Modals open/close
  document.querySelectorAll("[data-open]").forEach(btn => btn.addEventListener("click", () => {
    const dlg = document.getElementById(btn.dataset.open);
    if (dlg && !dlg.open) dlg.showModal();
  }));
  document.querySelectorAll("[data-close]").forEach(button => button.addEventListener("click", () => {
    document.getElementById(button.dataset.close)?.close();
  }));

  // Review carousel.
  const cards = [...document.querySelectorAll(".review-card")];
  const dots = [...document.querySelectorAll(".review-dots .dot")];
  const reviewPrev = document.querySelector("#review-prev");
  const reviewNext = document.querySelector("#review-next");
  if (cards.length && reviewPrev && reviewNext) {
    let reviewIndex = 0;
    const showReview = index => {
      reviewIndex = (index + cards.length) % cards.length;
      cards.forEach((card, i) => card.classList.toggle("active", i === reviewIndex));
      dots.forEach((dot, i) => dot.classList.toggle("active", i === reviewIndex));
    };
    reviewPrev.addEventListener("click", () => showReview(reviewIndex - 1));
    reviewNext.addEventListener("click", () => showReview(reviewIndex + 1));
    dots.forEach(dot => dot.addEventListener("click", () => showReview(Number(dot.dataset.index))));
  }

  // Date cannot be earlier than today.
  const dateInput = document.querySelector('[name="date"]');
  const today = new Date();
  const minDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  if (dateInput) dateInput.min = minDate;

  // Demo form: client validation, honeypot and 30-second cooldown.
  const form = document.querySelector("#booking");
  const status = document.querySelector("#form-status");
  if (form && status) {
    let lastSubmit = 0;
    const phoneDigits = value => value.replace(/\D/g, "");
    form.addEventListener("submit", event => {
      event.preventDefault();
      status.textContent = "";
      if (form.elements.website.value) return;
      if (!form.reportValidity()) return;
      const digits = phoneDigits(form.elements.phone.value);
      if (digits.length < 10 || digits.length > 15) {
        form.elements.phone.setCustomValidity("Проверьте номер телефона.");
        form.elements.phone.reportValidity();
        form.elements.phone.setCustomValidity("");
        return;
      }
      if (!form.elements.consent.checked) { form.elements.consent.reportValidity(); return; }
      const now = Date.now();
      if (now - lastSubmit < 30000) {
        status.textContent = `Повторную заявку можно отправить через ${Math.ceil((30000 - (now - lastSubmit)) / 1000)} сек.`;
        return;
      }
      lastSubmit = now;
      const name = form.elements.name.value.trim();
      status.textContent = `Спасибо, ${name}! Форма работает в демонстрационном режиме: заявка проверена, но не отправлена владельцу. Для приёма заявок подключите серверный обработчик.`;
      form.reset();
      if (dateInput) dateInput.min = minDate;
    });
  }

  const yearEl = document.querySelector("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
  document.addEventListener("keydown", event => { if (event.key === "Escape") closeMenu(); });
})();
