// ============================================
// LIMANI ANFRAGE-FUNNEL – JavaScript
// Laden NACH funnel-section.html
// Nutzt denselben Web3Forms Key wie contact.js
// ============================================

(function () {
    "use strict";
  
    // ── Config ──
    const WEB3FORMS_KEY = "e97b83e8-b4b2-496c-985f-868c0ae9b607";
    const TOTAL_STEPS = 6;
  
    // ── DOM Refs ──
    const stepsContainer = document.getElementById("funnelSteps");
    if (!stepsContainer) return; // Funnel nicht auf dieser Seite
  
    const progressBar = document.getElementById("funnelProgressBar");
    const btnNext = document.getElementById("funnelNext");
    const btnBack = document.getElementById("funnelBack");
    const btnSubmit = document.getElementById("funnelSubmit");
    const hint = document.getElementById("funnelHint");
    const successEl = document.getElementById("funnelSuccess");
    const errorEl = document.getElementById("funnelError");
    const resetBtn = document.getElementById("funnelReset");
    const summaryTags = document.getElementById("summaryTags");
    const stepDots = document.querySelectorAll(".funnel-step-dot");
    const steps = stepsContainer.querySelectorAll(".funnel-step");
  
    let currentStep = 1;
  
    // ── Helpers ──
    function getStep(n) {
      return stepsContainer.querySelector(`.funnel-step[data-step="${n}"]`);
    }
  
    function showStep(n) {
      steps.forEach((s) => s.classList.remove("active"));
      const target = getStep(n);
      if (target) target.classList.add("active");
  
      // Progress bar
      const pct = (n / TOTAL_STEPS) * 100;
      progressBar.style.width = pct + "%";
  
      // Dots
      stepDots.forEach((dot) => {
        const dotStep = parseInt(dot.dataset.step);
        dot.classList.remove("active", "done");
        if (dotStep === n) dot.classList.add("active");
        else if (dotStep < n) dot.classList.add("done");
      });
  
      // Buttons
      btnBack.style.visibility = n === 1 ? "hidden" : "visible";
      if (n === TOTAL_STEPS) {
        btnNext.style.display = "none";
        btnSubmit.style.display = "inline-flex";
        buildSummary();
      } else if (n >= 2 && n <= 5) {
        // Single-Select: Auto-Advance, kein Weiter-Button nötig
        btnNext.style.display = "none";
        btnSubmit.style.display = "none";
      } else {
        // Step 1 (Multi-Select): Button nur zeigen wenn etwas gewählt ist
        const hasSelection = getStep(1).querySelectorAll('input[name="leistung"]:checked').length > 0;
        btnNext.style.display = hasSelection ? "inline-flex" : "none";
        btnSubmit.style.display = "none";
      }
  
      // Clear hints
      clearHint();
    }
  
    function clearHint() {
      hint.textContent = "";
    }
  
    function showHint(msg) {
      hint.textContent = msg;
      // Kurz schütteln für Aufmerksamkeit
      hint.style.animation = "none";
      void hint.offsetWidth; // reflow
      hint.style.animation = "funnelShake 0.35s ease";
    }
  
    // ── Validation ──
    function validateStep(n) {
      const step = getStep(n);
  
      if (n === 1) {
        // Mindestens eine Leistung ausgewählt
        const checked = step.querySelectorAll('input[name="leistung"]:checked');
        if (checked.length === 0) {
          showHint("Bitte wählen Sie mindestens eine Leistung aus.");
          return false;
        }
      }
  
      if (n >= 2 && n <= 5) {
        // Radio-Auswahl vorhanden?
        const radios = step.querySelectorAll('input[type="radio"]');
        if (radios.length > 0) {
          const anyChecked = Array.from(radios).some((r) => r.checked);
          if (!anyChecked) {
            showHint("Bitte wählen Sie eine Option aus.");
            return false;
          }
        }
      }
  
      if (n === TOTAL_STEPS) {
        // Kontaktdaten validieren
        const vorname = document.getElementById("funnel-vorname");
        const nachname = document.getElementById("funnel-nachname");
        const telefon = document.getElementById("funnel-telefon");
        const email = document.getElementById("funnel-email");
        let valid = true;
  
        [vorname, nachname, telefon, email].forEach((input) => {
          input.classList.remove("invalid");
          if (!input.value.trim()) {
            input.classList.add("invalid");
            valid = false;
          }
        });
  
        // E-Mail Format prüfen
        if (email.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
          email.classList.add("invalid");
          valid = false;
        }
  
        if (!valid) {
          showHint("Bitte füllen Sie alle Pflichtfelder korrekt aus.");
          return false;
        }
      }
  
      return true;
    }
  
    // ── Step 1: Weiter-Button erst bei Auswahl einblenden ──
    function setupStep1Toggle() {
      const step1 = getStep(1);
      if (!step1) return;
      const checkboxes = step1.querySelectorAll('input[name="leistung"]');
      checkboxes.forEach((cb) => {
        cb.addEventListener("change", () => {
          if (currentStep !== 1) return;
          const hasSelection = step1.querySelectorAll('input[name="leistung"]:checked').length > 0;
          btnNext.style.display = hasSelection ? "inline-flex" : "none";
        });
      });
    }

    // ── Auto-Advance für Radio-Schritte ──
    function setupAutoAdvance() {
      // Steps 2-5: Bei Radio-Klick automatisch weiter nach kurzer Verzögerung
      for (let i = 2; i <= 5; i++) {
        const step = getStep(i);
        if (!step) continue;
        const radios = step.querySelectorAll('input[type="radio"]');
        radios.forEach((radio) => {
          radio.addEventListener("change", () => {
            // Visuelles Feedback kurz wirken lassen, dann weiter
            setTimeout(() => {
              if (currentStep === i && currentStep < TOTAL_STEPS) {
                currentStep++;
                showStep(currentStep);
                scrollToFunnel();
              }
            }, 350);
          });
        });
      }
    }
  
    // ── Summary Builder ──
    function buildSummary() {
      if (!summaryTags) return;
      summaryTags.innerHTML = "";
  
      const data = collectData();
      const items = [];
  
      if (data.leistung) items.push({ label: "Leistung", text: data.leistung });
      if (data.flaeche) items.push({ label: "Fläche", text: data.flaeche });
      if (data.zeitrahmen) items.push({ label: "Zeitrahmen", text: data.zeitrahmen });
      if (data.material) items.push({ label: "Material", text: data.material });
      if (data.rueckbau) items.push({ label: "Rückbau", text: data.rueckbau });
  
      items.forEach((item) => {
        const tag = document.createElement("span");
        tag.className = "summary-tag";
        tag.innerHTML = `<span class="summary-tag-label">${item.label}:</span> ${escapeHtml(item.text)}`;
        summaryTags.appendChild(tag);
      });
    }
  
    function escapeHtml(text) {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    }
  
    // ── Data Collection ──
    function collectData() {
      const leistungen = Array.from(
        stepsContainer.querySelectorAll('input[name="leistung"]:checked')
      ).map((i) => i.value);
  
      const getRadio = (name) => {
        const el = stepsContainer.querySelector(`input[name="${name}"]:checked`);
        return el ? el.value : "";
      };
  
      return {
        leistung: leistungen.join(", "),
        flaeche: getRadio("flaeche"),
        zeitrahmen: getRadio("zeitrahmen"),
        material: getRadio("material"),
        rueckbau: getRadio("rueckbau"),
        vorname: document.getElementById("funnel-vorname")?.value.trim() || "",
        nachname: document.getElementById("funnel-nachname")?.value.trim() || "",
        telefon: document.getElementById("funnel-telefon")?.value.trim() || "",
        email: document.getElementById("funnel-email")?.value.trim() || "",
        notiz: document.getElementById("funnel-notiz")?.value.trim() || "",
      };
    }
  
    // ── Scroll to Funnel ──
    function scrollToFunnel() {
      const section = document.getElementById("anfrage-funnel");
      if (!section) return;
      const navbar = document.querySelector(".navbar");
      const offset = navbar ? navbar.offsetHeight + 12 : 80;
      const top = section.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  
    // ── Submit via Web3Forms ──
    async function submitFunnel() {
      const data = collectData();
  
      btnSubmit.disabled = true;
      btnSubmit.innerHTML = `
        <svg class="funnel-spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10" stroke-dasharray="31.4" stroke-dashoffset="10"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite"/></circle></svg>
        Wird gesendet...
      `;
      errorEl.style.display = "none";
  
      // Build the email body
      const body = [
        `Leistung: ${data.leistung}`,
        `Fläche: ${data.flaeche}`,
        `Zeitrahmen: ${data.zeitrahmen}`,
        `Material: ${data.material}`,
        `Rückbau: ${data.rueckbau}`,
        `---`,
        `Name: ${data.vorname} ${data.nachname}`,
        `Telefon: ${data.telefon}`,
        `E-Mail: ${data.email}`,
        data.notiz ? `Nachricht: ${data.notiz}` : "",
      ]
        .filter(Boolean)
        .join("\n");
  
      const formData = new FormData();
      formData.append("access_key", WEB3FORMS_KEY);
      formData.append("subject", `Funnel-Anfrage – ${data.leistung}`);
      formData.append("from_name", "Limani Website Funnel");
      formData.append("Vorname", data.vorname);
      formData.append("Nachname", data.nachname);
      formData.append("Telefon", data.telefon);
      formData.append("Email", data.email);
      formData.append("Leistung", data.leistung);
      formData.append("Flaeche", data.flaeche);
      formData.append("Zeitrahmen", data.zeitrahmen);
      formData.append("Material", data.material);
      formData.append("Rueckbau", data.rueckbau);
      if (data.notiz) formData.append("Nachricht", data.notiz);
      // Honeypot
      formData.append("botcheck", "");
  
      try {
        const res = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          body: formData,
        });
        const result = await res.json();
  
        if (res.ok && result.success) {
          showSuccess();
        } else {
          showError();
        }
      } catch (err) {
        console.error("Funnel-Netzwerkfehler:", err);
        showError();
      }
    }
  
    function showSuccess() {
      // Hide steps and nav
      stepsContainer.style.display = "none";
      document.querySelector(".funnel-nav").style.display = "none";
      document.querySelector(".funnel-progress").style.display = "none";
      hint.style.display = "none";
      errorEl.style.display = "none";
      successEl.style.display = "block";
      scrollToFunnel();
    }
  
    function showError() {
      errorEl.style.display = "block";
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = `
        Erneut versuchen
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20,6 9,17 4,12"/></svg>
      `;
    }
  
    function resetFunnel() {
      // Reset all inputs
      stepsContainer.querySelectorAll("input, textarea").forEach((el) => {
        if (el.type === "checkbox" || el.type === "radio") el.checked = false;
        else el.value = "";
        el.classList.remove("invalid");
      });
  
      // Show steps again
      stepsContainer.style.display = "";
      document.querySelector(".funnel-nav").style.display = "";
      document.querySelector(".funnel-progress").style.display = "";
      hint.style.display = "";
      successEl.style.display = "none";
      errorEl.style.display = "none";
  
      currentStep = 1;
      showStep(1);
      scrollToFunnel();
    }
  
    // ── Event Listeners ──
    btnNext.addEventListener("click", () => {
      if (!validateStep(currentStep)) return;
      if (currentStep < TOTAL_STEPS) {
        currentStep++;
        showStep(currentStep);
        scrollToFunnel();
      }
    });
  
    btnBack.addEventListener("click", () => {
      if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
      }
    });
  
    btnSubmit.addEventListener("click", () => {
      if (!validateStep(TOTAL_STEPS)) return;
      submitFunnel();
    });
  
    if (resetBtn) {
      resetBtn.addEventListener("click", resetFunnel);
    }
  
    // Keyboard: Enter = Next
    stepsContainer.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") {
        e.preventDefault();
        if (currentStep < TOTAL_STEPS) {
          btnNext.click();
        } else {
          btnSubmit.click();
        }
      }
    });
  
    // Remove invalid state on input
    stepsContainer.addEventListener("input", (e) => {
      if (e.target.classList.contains("invalid")) {
        e.target.classList.remove("invalid");
      }
      clearHint();
    });
  
    stepsContainer.addEventListener("change", () => {
      clearHint();
    });
  
    // ── Init ──
    setupAutoAdvance();
    setupStep1Toggle();
    showStep(1);
  
    // Shake animation keyframes
    if (!document.getElementById("funnel-shake-style")) {
      const style = document.createElement("style");
      style.id = "funnel-shake-style";
      style.textContent = `
        @keyframes funnelShake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(5px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(2px); }
        }
      `;
      document.head.appendChild(style);
    }
  })();