// script.js – UI-Features (ohne Formular-Backend)

document.addEventListener("DOMContentLoaded", function () {
  // Navbar Collapse beim Klick auf Link
  const navbarToggler = document.querySelector(".navbar-toggler");
  const navbarCollapse = document.getElementById("navbarNav");

  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      const collapse = bootstrap.Collapse.getInstance(navbarCollapse);
      if (collapse && navbarCollapse.classList.contains("show")) {
        collapse.hide();
      }
    });
  });

  // Smooth Scroll mit Offset
  document.querySelectorAll("a[href^='#']").forEach((link) => {
    link.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (!href || href === "#") return;
      e.preventDefault();
      const targetId = href.substring(1);
      const targetEl = document.getElementById(targetId);
      const offset = 80;

      if (targetEl) {
        const offsetPosition =
          targetEl.getBoundingClientRect().top +
          window.pageYOffset -
          offset;
        window.scrollTo({ top: offsetPosition, behavior: "smooth" });
      }
    });
  });

  // Collapse beim Klick außerhalb
  document.addEventListener("click", function (event) {
    if (!navbarCollapse || !navbarToggler) return;
    const isNavbarOpen = navbarCollapse.classList.contains("show");
    const clickInside =
      navbarCollapse.contains(event.target) ||
      navbarToggler.contains(event.target);
    if (isNavbarOpen && !clickInside) {
      const collapse = bootstrap.Collapse.getInstance(navbarCollapse);
      if (collapse) collapse.hide();
    }
  });

  // Galerie (Karten-Stapel)
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

  // Active-Link ScrollSpy
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-link");

  window.addEventListener("scroll", () => {
    const scrollY = window.scrollY;
    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 100;
      const sectionHeight = section.offsetHeight;
      if (
        scrollY >= sectionTop &&
        scrollY < sectionTop + sectionHeight
      ) {
        navLinks.forEach((link) => {
          link.classList.remove("active");
          if (link.getAttribute("href") === `#${section.id}`) {
            link.classList.add("active");
          }
        });
      }
    });
  });

  // AOS Init
  if (window.AOS) AOS.init({ duration: 800, once: true });

  // Jahr im Footer
  const jahrEl = document.getElementById("jahr");
  if (jahrEl) jahrEl.textContent = new Date().getFullYear();
});

// Swiper / Slider-Logik
function updateRauten(index) {
  const rauten = document.querySelectorAll(
    ".rauten-indikator .diamond"
  );
  rauten.forEach((r, i) => {
    r.classList.toggle("active", i === index);
  });
}

const sliderTabs = document.querySelectorAll(".slider-tab");
const sliderIndicator = document.querySelector(".slider-indicator");
const sliderControls = document.querySelector(".slider-controls");

const updateIndicator = (tab, index) => {
  if (!tab || !sliderIndicator || !sliderControls || !sliderTabs.length)
    return;
  sliderIndicator.style.transform = `translateX(${
    tab.offsetLeft - 20
  }px)`;
  sliderIndicator.style.width = `${tab.getBoundingClientRect().width}px`;

  const scrollLeft =
    sliderTabs[index].offsetLeft -
    sliderControls.offsetWidth / 2 +
    sliderTabs[index].offsetWidth / 2;
  sliderControls.scrollTo({ left: scrollLeft, behavior: "smooth" });
};

const swiper = new Swiper(".slider-container", {
  effect: "fade",
  speed: 1300,
  autoplay: { delay: 4000 },
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
    updateIndicator(sliderTabs[swiper.activeIndex], 0)
  );
}

// Go-Top Button
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

document.addEventListener("scroll", () => {
  const hero = document.querySelector(".hero-main-heading-wrapper");
  const scrollY = window.scrollY;

  // Nach 0–180px Scroll fade-out
  const fadePoint = 180;

  if (scrollY < fadePoint) {
    const opacity = 1 - scrollY / fadePoint;
    hero.style.opacity = opacity;
    hero.style.transform = `translate(-50%, ${scrollY * 0.1}px)`; // leicht nach oben weg
  } else {
    hero.style.opacity = 0;
  }
});