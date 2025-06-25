// === main.js ===

// Alle Eventlistener & Init-Logik in einem DOMContentLoaded Block

document.addEventListener("DOMContentLoaded", function () {
  // Navbar Collapse beim Klick auf Link
  const navbarToggler = document.querySelector(".navbar-toggler");
  const navbarCollapse = document.getElementById("navbarNav");

  document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", () => {
      const collapse = bootstrap.Collapse.getInstance(navbarCollapse);
      if (collapse && navbarCollapse.classList.contains("show")) {
        collapse.hide();
      }
    });
  });

  // Smooth Scroll mit Offset
  document.querySelectorAll("a[href^='#']").forEach(link => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href").substring(1);
      const targetEl = document.getElementById(targetId);
      const offset = 80;

      if (targetEl) {
        const offsetPosition = targetEl.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: offsetPosition, behavior: "smooth" });
      }
    });
  });

  // Collapse beim Klick außerhalb
  document.addEventListener("click", function (event) {
    const isNavbarOpen = navbarCollapse.classList.contains("show");
    const clickInside = navbarCollapse.contains(event.target) || navbarToggler.contains(event.target);
    if (isNavbarOpen && !clickInside) {
      const collapse = bootstrap.Collapse.getInstance(navbarCollapse);
      if (collapse) collapse.hide();
    }
  });

  // Galerie (Karten-Stapel)
  const bilder = document.querySelectorAll(".stapel-bild");
  const dotIndikator = document.getElementById("dotIndikator");
  let aktuelleIndex = 0;

  bilder.forEach((_, i) => {
    const dot = document.createElement("span");
    dot.classList.add("dot");
    if (i === 0) dot.classList.add("active");
    dotIndikator.appendChild(dot);
  });

  const dots = dotIndikator.querySelectorAll(".dot");

  dots.forEach((dot, i) => {
    dot.addEventListener("click", (e) => {
      e.stopPropagation(); // verhindert Bildwechsel durch Klick auf das Bild
      aktuelleIndex = i;
      zeigeBild(aktuelleIndex);
    });
  });

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

  document.getElementById("projektStapel").addEventListener("click", () => {
    aktuelleIndex = (aktuelleIndex + 1) % bilder.length;
    zeigeBild(aktuelleIndex);
  });
  zeigeBild(aktuelleIndex);

  // Active-Link ScrollSpy
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-link");

  window.addEventListener("scroll", () => {
    const scrollY = window.scrollY;
    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 100;
      const sectionHeight = section.offsetHeight;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove("active");
          if (link.getAttribute("href") === `#${section.id}`) {
            link.classList.add("active");
          }
        });
      }
    });
  });

  // Kontaktformular
  const form = document.querySelector("#kontaktformular");
  const input = document.querySelector("#phone");
  const hiddenInput = document.querySelector("#telefon_voll");
  const phoneInput = window.intlTelInput(input, {
    initialCountry: "de",
    preferredCountries: ["de", "at", "ch", "xk", "al"],
    separateDialCode: true,
    utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js"
  });

  form.addEventListener("submit", function (e) {
    const formValid = form.checkValidity();
    const phoneValid = phoneInput.isValidNumber();
    if (!formValid || !phoneValid) {
      e.preventDefault();
      form.classList.add("was-validated");
      input.classList.toggle("is-invalid", !phoneValid);
      return;
    }
    hiddenInput.value = phoneInput.getNumber();
  });

  // Datei Upload prüfen
  document.querySelector("#datei").addEventListener("change", function () {
    const maxSizeMB = 5;
    const file = this.files[0];
    const fehlerDiv = document.querySelector("#dateiFehler");
    if (file && file.size > maxSizeMB * 1024 * 1024) {
      this.classList.add("is-invalid");
      fehlerDiv.classList.remove("d-none");
      this.value = "";
    } else {
      this.classList.remove("is-invalid");
      fehlerDiv.classList.add("d-none");
    }
  });

  // Anfrageart dynamisch
  document.getElementById("anfrageart").addEventListener("change", function () {
    const feld = document.getElementById("konkreteAngaben");
    feld.style.display = (this.value === "konkret") ? "block" : "none";
  });

  // AOS Init
  AOS.init({ duration: 800, once: true });
});

document.getElementById("datei").addEventListener("change", function () {
  const fileNameSpan = document.querySelector(".file-name");
  if (this.files.length > 0) {
    fileNameSpan.textContent = this.files[0].name;
  } else {
    fileNameSpan.textContent = "Keine Datei ausgewählt";
  }
});

// document.addEventListener("DOMContentLoaded", function () {
//   const swiper = new Swiper('.hero-swiper', {
//     loop: true,
//     slidesPerView: 1, // <<< DAS IST ENTSCHEIDEND
//     autoplay: {
//       delay: 5000,
//       disableOnInteraction: false,
//     },
//     on: {
//       slideChange: function () {
//         const allIndicators = document.querySelectorAll('.rauten-indikator');
//         allIndicators.forEach(indikator => {
//           const diamonds = indikator.querySelectorAll('.diamond');
//           diamonds.forEach((d, i) => {
//             d.classList.toggle('active', i === swiper.realIndex % diamonds.length);
//           });
//         });
//       }
//     }
//   });
// });


function updateRauten(index) {
  const rauten = document.querySelectorAll('.rauten-indikator .diamond');
  rauten.forEach((r, i) => {
    r.classList.toggle('active', i === index);
  });
}

const sliderTabs = document.querySelectorAll(".slider-tab");
const sliderIndicator = document.querySelector(".slider-indicator");
const sliderControls = document.querySelector(".slider-controls");

// Update the indicator height and width
const updateIndicator = (tab, index) => {
  sliderIndicator.style.transform = `translateX(${tab.offsetLeft - 20}px)`;
  sliderIndicator.style.width = `${tab.getBoundingClientRect().width}px`;

  const scrollLeft = sliderTabs[index].offsetLeft - sliderControls.offsetWidth / 2 + sliderTabs[index].offsetWidth / 2;
  sliderControls.scrollTo({ left: scrollLeft, behavior: "smooth" });
}

// initialize swiper
const swiper = new Swiper(".slider-container", {
  effect: "fade",
  speed: 1300,
  autoplay: {delay: 4000},
  navigation: {
    prevEl: "#slide-prev",
    nextEl: "#slide-next"
  },
  on: {
    // Update Indicator on slide change
    slideChange: () => {
      const currentTabIndex = [...sliderTabs].indexOf(sliderTabs[swiper.activeIndex]);
      updateIndicator(sliderTabs[swiper.activeIndex], currentTabIndex)
    },
    reachEnd: () => swiper.autoplay.stop()
  }
});

// Update the slide and Indicator on tab click
sliderTabs.forEach((tab,index) => {
  tab.addEventListener("click", () => {
    swiper.slideTo(index);
    updateIndicator(tab, index);
  });
});

updateIndicator(sliderTabs[0], 0);
window.addEventListener("resize", () => updateIndicator(sliderTabs[swiper.activeIndex], 0));

const goTopBtn = document.getElementById("goTopBtn");

window.addEventListener("scroll", () => {
  if (window.scrollY > 300) {
    goTopBtn.classList.add("show");
  } else {
    goTopBtn.classList.remove("show");
  }
});

goTopBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

document.addEventListener("DOMContentLoaded", () => {
  const jahr = new Date().getFullYear();
  document.getElementById("jahr").textContent = jahr;
});

document.getElementById('kontaktformular').addEventListener('submit', async function (e) {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form); // ← Das nimmt auch Datei mit

  try {
    const res = await fetch('https://fliesenleger-backend.onrender.com/anfrage', {
      method: 'POST',
      body: formData
    });

    const result = await res.json();

    if (res.ok) {
      document.getElementById('successMessage').classList.remove('d-none');
      form.reset();
    } else {
      alert('❌ Es gab ein Problem: ' + result.message || result.error);
    }
  } catch (err) {
    alert('🚨 Anfrage konnte nicht gesendet werden.');
    console.error(err);
  }
});
