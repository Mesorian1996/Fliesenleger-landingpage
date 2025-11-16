// js/contact.js
const CONTACT_API = "https://contact-backend-chm2.onrender.com/v1/contact";
const SITE_ID = "limani-fliesenleger";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("kontaktformular");
  const successMessage = document.getElementById("successMessage");
  const phoneInputField = document.getElementById("phone");
  const hiddenTelField = document.getElementById("telefon_voll");
  const anfrageartSelect = document.getElementById("anfrageart");
  const konkreteAngaben = document.getElementById("konkreteAngaben");

  // Konkrete Angaben ein-/ausblenden
  if (anfrageartSelect && konkreteAngaben) {
    anfrageartSelect.addEventListener("change", () => {
      konkreteAngaben.style.display =
        anfrageartSelect.value === "konkret" ? "block" : "none";
    });
  }

  // intl-tel-input initialisieren (falls eingebunden)
  let iti = null;
  if (phoneInputField && window.intlTelInput) {
    iti = window.intlTelInput(phoneInputField, {
      initialCountry: "de",
      preferredCountries: ["de", "at", "ch", "xk", "al"],
      separateDialCode: true,
      utilsScript:
        "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
    });
  }

  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    event.stopPropagation();

    // Bootstrap-Validation
    const formValid = form.checkValidity();
    const phoneValid = iti ? iti.isValidNumber() : true;

    if (!formValid || !phoneValid) {
      form.classList.add("was-validated");
      if (phoneInputField) {
        phoneInputField.classList.toggle("is-invalid", !phoneValid);
      }
      return;
    }

    // Verstecktes tel-Feld befüllen
    if (hiddenTelField) {
      if (iti) {
        hiddenTelField.value = iti.getNumber();
      } else if (phoneInputField) {
        hiddenTelField.value = phoneInputField.value.trim();
      }
    }

    const formData = new FormData(form);
    const payload = { siteId: SITE_ID };

    formData.forEach((value, key) => {
      if (key === "datenschutz") {
        payload[key] = true;
      } else {
        const v = (value ?? "").toString().trim();
        if (v !== "") payload[key] = v;
      }
    });

    // Sichergehen, dass "tel" gesetzt ist
    if (iti) {
      payload.tel = iti.getNumber();
      delete payload.phone;
    }

    if (successMessage) {
      successMessage.classList.add("d-none");
    }

    try {
      const res = await fetch(CONTACT_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        console.error("Kontaktfehler:", data);
        alert(
          "Leider ist ein Fehler beim Versenden Ihrer Anfrage aufgetreten. Bitte versuchen Sie es später erneut."
        );
        return;
      }

      // Erfolg
      form.reset();
      form.classList.remove("was-validated");
      if (iti) iti.setNumber("");
      if (successMessage) {
        successMessage.classList.remove("d-none");
        setTimeout(
          () => successMessage.classList.add("d-none"),
          8000
        );
      }
    } catch (err) {
      console.error("Netzwerkfehler:", err);
      alert(
        "Es ist ein Netzwerkfehler aufgetreten. Bitte versuchen Sie es später erneut."
      );
    }
  });
});
