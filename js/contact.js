// js/contact.js
const CONTACT_API = "https://contact-backend-chm2.onrender.com/v1/contact";
const SITE_ID = "limani-fliesenleger";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("kontaktformular");
  const successMessage = document.getElementById("successMessage");
  const phoneInputField = document.getElementById("phone");
  const anfrageartSelect = document.getElementById("anfrageart");
  const konkreteAngaben = document.getElementById("konkreteAngaben");

  // Konkrete Angaben ein-/ausblenden
  if (anfrageartSelect && konkreteAngaben) {
    anfrageartSelect.addEventListener("change", () => {
      konkreteAngaben.style.display =
        anfrageartSelect.value === "konkret" ? "block" : "none";
    });
  }

  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    event.stopPropagation();

    // Bootstrap-Validation
    const formValid = form.checkValidity();

    if (!formValid) {
      form.classList.add("was-validated");
      return;
    }

    const formData = new FormData(form);
    const payload = { siteId: SITE_ID };

    formData.forEach((value, key) => {
      const v = (value ?? "").toString().trim();
      if (v !== "") payload[key] = v;
    });

    if (payload.phone) {
      payload.tel = payload.phone;
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
