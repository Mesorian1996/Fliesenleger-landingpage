// script.js – UI-Features (ohne Formular-Backend)

document.addEventListener("DOMContentLoaded", () => {
  const navbar = document.querySelector(".navbar");
  const navbarToggler = document.querySelector(".navbar-toggler");
  const navbarCollapse = document.getElementById("navbarNav");

  // -----------------------------
  // Smooth Scroll mit Offset = Navbar-Höhe
  // -----------------------------
  const normalizePath = (path) => {
    if (!path) return "/";
    return (
      path
        .replace(/index\.html$/i, "") // index.html entfernen
        .replace(/\/+$/, "") || "/"
    );
  };

const navLinks = document.querySelectorAll(
  'a.nav-link[href^="#"], a.nav-link[href^="/#"], ' +
  'a.dropdown-item[href^="#"], a.dropdown-item[href^="/#"], ' +
  'a.btn[href^="#"], a.btn[href^="/#"]'
);

navLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    // WICHTIG: Dropdown-Toggle komplett ignorieren
    if (link.matches('[data-bs-toggle="dropdown"]')) {
      return; // Bootstrap soll das Dropdown normal öffnen
    }

    const url = new URL(link.href, window.location.origin);
    const currentPath = normalizePath(window.location.pathname);
    const targetPath = normalizePath(url.pathname);

    if (targetPath === currentPath && url.hash) {
      const target = document.querySelector(url.hash);
      if (!target) return;

      e.preventDefault();

        const navbarHeight = navbar ? navbar.offsetHeight : 0;
        const extraMargin = 0; // etwas Luft unter der Navbar
        const targetTop =
          target.getBoundingClientRect().top +
          window.scrollY -
          navbarHeight -
          extraMargin;

        window.scrollTo({
          top: targetTop,
          behavior: "smooth",
        });

        // Mobile: Menü einklappen
        if (navbarCollapse && navbarCollapse.classList.contains("show")) {
          const bsCollapse =
            bootstrap.Collapse.getOrCreateInstance(navbarCollapse);
          bsCollapse.hide();
        }
      }
      // andere Seite -> normaler Link (kein preventDefault)
    });
  });

  // -----------------------------
  // Collapse beim Klick außerhalb der Navbar
  // -----------------------------
  if (navbarCollapse && navbarToggler) {
    document.addEventListener("click", (event) => {
      const isNavbarOpen = navbarCollapse.classList.contains("show");
      const clickInside =
        navbarCollapse.contains(event.target) ||
        navbarToggler.contains(event.target);

      if (isNavbarOpen && !clickInside) {
        const collapse = bootstrap.Collapse.getInstance(navbarCollapse);
        if (collapse) collapse.hide();
      }
    });
  }

  // -----------------------------
  // Galerie (Karten-Stapel)
  // -----------------------------
  const bilder = document.querySelectorAll(".stapel-bild");
  const dotIndikator = document.getElementById("dotIndikator");
  let aktuelleIndex = 0;

  if (dotIndikator && bilder.length) {
    bilder.forEach((_, i) => {
      const dot = document.createElement("span");
      dot.classList.add("dot");
      if (i === 0) dot.classList.add("active");
      dotIndikator.appendChild(dot);
    });

    const dots = dotIndikator.querySelectorAll(".dot");

    function zeigeBild(index) {
      bilder.forEach((bild, i) => {
        bild.className = "stapel-bild";
        if (i === index) {
          bild.classList.add("active");
          dots[i].classList.add("active");
        } else {
          dots[i].classList.remove("active");
          const dist = (i - index + bilder.length) % bilder.length;
          if (dist === 1) bild.classList.add("next-1");
          else if (dist === 2) bild.classList.add("next-2");
        }
      });
    }

    dots.forEach((dot, i) => {
      dot.addEventListener("click", (e) => {
        e.stopPropagation();
        aktuelleIndex = i;
        zeigeBild(aktuelleIndex);
      });
    });

    const stapel = document.getElementById("projektStapel");
    if (stapel) {
      stapel.addEventListener("click", () => {
        aktuelleIndex = (aktuelleIndex + 1) % bilder.length;
        zeigeBild(aktuelleIndex);
      });
    }

    zeigeBild(aktuelleIndex);
  }

  // -----------------------------
  // Fallback: bei Klick im mobilen Menü einklappen
  // (Dropdown-Toggle bleibt offen)
  // -----------------------------
  if (navbarCollapse) {
    navbarCollapse.addEventListener("click", (e) => {
      const link = e.target.closest("a");
      if (!link) return;

      const isNavTarget = link.matches(".nav-link, .dropdown-item, .btn");
      const isDropdownToggle = link.matches('[data-bs-toggle="dropdown"]');

      // Dropdown-Toggle NICHT schließen, nur echte Navigationsziele
      if (!isNavTarget || isDropdownToggle) {
        return;
      }

      if (navbarCollapse.classList.contains("show")) {
        const bsCollapse =
          bootstrap.Collapse.getOrCreateInstance(navbarCollapse);
        bsCollapse.hide();
      }
    });
  }

  // -----------------------------
  // AOS-Init (falls nicht schon inline)
  // -----------------------------
  if (window.AOS) {
    AOS.init({ duration: 800, once: true });
  }

  // -----------------------------
  // Jahr im Footer
  // -----------------------------
  const jahrEl = document.getElementById("jahr");
  if (jahrEl) jahrEl.textContent = new Date().getFullYear();
});

// --------------------------------------
// Swiper / Slider-Logik
// --------------------------------------
function updateRauten(index) {
  const rauten = document.querySelectorAll(".rauten-indikator .diamond");
  rauten.forEach((r, i) => {
    r.classList.toggle("active", i === index);
  });
}

const sliderTabs = document.querySelectorAll(".slider-tab");
const sliderIndicator = document.querySelector(".slider-indicator");
const sliderControls = document.querySelector(".slider-controls");

const updateIndicator = (tab, index) => {
  if (!tab || !sliderIndicator || !sliderControls || !sliderTabs.length) return;
  sliderIndicator.style.transform = `translateX(${tab.offsetLeft - 20}px)`;
  sliderIndicator.style.width = `${tab.getBoundingClientRect().width}px`;

  const scrollLeft =
    sliderTabs[index].offsetLeft -
    sliderControls.offsetWidth / 2 +
    sliderTabs[index].offsetWidth / 2;
  sliderControls.scrollTo({ left: scrollLeft, behavior: "smooth" });
};

if (typeof Swiper !== "undefined") {
  const swiper = new Swiper(".slider-container", {
    effect: "fade",
    speed: 1300,
    autoplay: { delay: 6000 },
    navigation: {
      prevEl: "#slide-prev",
      nextEl: "#slide-next",
    },
    on: {
      slideChange: () => {
        const currentTabIndex = [...sliderTabs].indexOf(
          sliderTabs[swiper.activeIndex]
        );
        updateIndicator(sliderTabs[swiper.activeIndex], currentTabIndex);
      },
      reachEnd: () => swiper.autoplay.stop(),
    },
  });

  sliderTabs.forEach((tab, index) => {
    tab.addEventListener("click", () => {
      swiper.slideTo(index);
      updateIndicator(tab, index);
    });
  });

  if (sliderTabs.length) {
    updateIndicator(sliderTabs[0], 0);
    window.addEventListener("resize", () =>
      updateIndicator(sliderTabs[swiper.activeIndex], swiper.activeIndex)
    );
  }
}

// --------------------------------------
// Go-Top Button
// --------------------------------------
const goTopBtn = document.getElementById("goTopBtn");
if (goTopBtn) {
  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) goTopBtn.classList.add("show");
    else goTopBtn.classList.remove("show");
  });

  goTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// --------------------------------------
// Hero-Heading Fade-Out (nur Startseite)
// --------------------------------------
const heroHeading = document.querySelector(".hero-main-heading-wrapper");
if (heroHeading) {
  document.addEventListener("scroll", () => {
    const scrollY = window.scrollY;
    const fadePoint = 180; // Nach 0–180px Scroll fade-out

    if (scrollY < fadePoint) {
      const opacity = 1 - scrollY / fadePoint;
      heroHeading.style.opacity = opacity;
      heroHeading.style.transform = `translate(-50%, ${scrollY * 0.1}px)`;
    } else {
      heroHeading.style.opacity = 0;
    }
  });
}

// --------------------------------------
// Galerie-Slider "Beispiele für Fliesenarbeiten"
// --------------------------------------
(function () {
  const gallery = document.querySelector(".fliesen-gallery");
  if (!gallery) return;

  const track = gallery.querySelector(".gallery-track");
  const slides = Array.from(gallery.querySelectorAll(".gallery-slide"));
  const prevBtn = gallery.querySelector(".gallery-arrow-prev");
  const nextBtn = gallery.querySelector(".gallery-arrow-next");

  let currentIndex = 0;
  const maxIndex = slides.length - 1;

  function updateSlider() {
    const offset = -currentIndex * 100;
    track.style.transform = `translateX(${offset}%)`;
  }

  function goNext() {
    currentIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1;
    updateSlider();
  }

  function goPrev() {
    currentIndex = currentIndex <= 0 ? maxIndex : currentIndex - 1;
    updateSlider();
  }

  if (prevBtn && nextBtn) {
    prevBtn.addEventListener("click", goPrev);
    nextBtn.addEventListener("click", goNext);
  }

  // Swipe-Unterstützung für Mobile
  let startX = 0;
  let isDragging = false;

  track.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
    isDragging = true;
  });

  track.addEventListener("touchmove", (e) => {
    if (!isDragging) return;
    const diff = e.touches[0].clientX - startX;
    // optional: visuelles Mitziehen einbauen
  });

  track.addEventListener("touchend", (e) => {
    if (!isDragging) return;
    const diff = e.changedTouches[0].clientX - startX;

    if (diff > 50) {
      goPrev();
    } else if (diff < -50) {
      goNext();
    }

    isDragging = false;
  });

  
})();


  document.addEventListener("DOMContentLoaded", () => {
    const slides = document.querySelectorAll(".slider-item");

    slides.forEach((slide, index) => {
      const bg = slide.dataset.bg;
      if (!bg) return;

      const img = new Image();
      img.src = bg;

      // Erster Slide = LCP → sofort priorisiert laden
      if (index === 0) {
        img.loading = "eager";
      }

      img.onload = () => {
        slide.style.setProperty("--bg-img", `url('${bg}')`);
        slide.classList.add("bg-loaded");
      };
    });
  });

