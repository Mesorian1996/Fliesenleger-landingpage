// js/contact.js – Web3Forms
const WEB3FORMS_KEY = "e97b83e8-b4b2-496c-985f-868c0ae9b607"; // ← Web3Forms Access Key

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("kontaktformular");
  if (!form) return;

  const submitBtn = document.getElementById("submitBtn");
  const successMsg = document.getElementById("successMessage");
  const errorMsg = document.getElementById("errorMessage");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }

    const formData = new FormData(form);
    formData.append("access_key", WEB3FORMS_KEY);
    formData.append("subject", "Neue Anfrage – Limani Fliesenleger");
    formData.append("from_name", "Limani Website");

    const originalHTML = submitBtn.innerHTML;
    submitBtn.innerHTML = "Wird gesendet...";
    submitBtn.disabled = true;
    successMsg?.classList.add("d-none");
    errorMsg?.classList.add("d-none");

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok && data.success) {
        form.reset();
        form.classList.remove("was-validated");
        successMsg?.classList.remove("d-none");
        successMsg?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        setTimeout(() => successMsg?.classList.add("d-none"), 8000);
      } else {
        errorMsg?.classList.remove("d-none");
      }
    } catch (err) {
      console.error("Netzwerkfehler:", err);
      errorMsg?.classList.remove("d-none");
    } finally {
      submitBtn.innerHTML = originalHTML;
      submitBtn.disabled = false;
    }
  });
});