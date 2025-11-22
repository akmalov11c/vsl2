// === PRESERVED OLD LOGIC: countdown-gated CTA -> show form -> submit -> localStorage + redirect ===

function initForm() {
  const form = document.getElementById("registrationForm");
  const nameInput = document.getElementById("name");
  const phoneInput = document.getElementById("phone");
  const nameError = document.getElementById("nameError");
  const phoneError = document.getElementById("phoneError");
  const countryCodeEl = document.getElementById("selectedCountryCode");
  const dropdown = document.getElementById("countryDropdown");
  const dropdownIcon = document.getElementById("dropdownIcon");
  const timerElement = document.getElementById("timer");
  const unlockBtn = document.getElementById("unlockBtn");

  let totalSeconds = 60 * 25; // 25:00
  const pad = (n) => String(n).padStart(2, "0");
  unlockBtn.disabled = true;
  form.style.display = "none";

  const setTime = (s) => {
    const m = pad(Math.floor(s / 60));
    const sec = pad(s % 60);
    const t = `${m}:${sec}`;
    if (timerElement && timerElement.textContent !== t)
      timerElement.textContent = t;
    unlockBtn.textContent = `Ro'yxatdan o'tish (${t})`;
  };

  function startCountdown() {
    const endTime = Date.now() + totalSeconds * 1000;
    window.__timerStarted = true;

    const countdown = setInterval(() => {
      const remaining = Math.max(0, Math.round((endTime - Date.now()) / 1000));
      totalSeconds = remaining;

      if (remaining <= 0) {
        clearInterval(countdown);
        if (timerElement) {
          timerElement.textContent = "00:00";
          unlockBtn.textContent = `Ro'yxatdan o'tish`;
          unlockBtn.disabled = false;
        }
      } else {
        setTime(remaining);
      }
    }, 1000);
  }

  unlockBtn.addEventListener("click", () => {
    form.style.display = "";
    unlockBtn.style.display = "none";
  });

  // Countries and phone masks (preserved)
  const countries = [
    { name: "Uzbekistan", code: "+998" },
    { name: "AQSH", code: "+1" },
    { name: "Janubiy Koreya", code: "+82" },
    { name: "Qirg'iziston", code: "+996" },
    { name: "Qozog'iston", code: "+7" },
    { name: "Tojikiston", code: "+992" },
    { name: "Turkmaniston", code: "+993" },
    { name: "Polsha", code: "+48" },
  ];

  const formats = {
    "+998": {
      ph: "88 888 88 88",
      re: /^\d{2} \d{3} \d{2} \d{2}$/,
      cut: 9,
      max: 12,
    },
    "+1": { ph: "555 123 4567", re: /^\d{3} \d{3} \d{4}$/, cut: 10, max: 12 },
    "+82": { ph: "10 1234 5678", re: /^\d{2} \d{4} \d{4}$/, cut: 10, max: 12 },
    "+996": { ph: "555 123 456", re: /^\d{3} \d{3} \d{3}$/, cut: 9, max: 11 },
    "+7": { ph: "700 123 4567", re: /^\d{3} \d{3} \d{4}$/, cut: 10, max: 12 },
    "+992": { ph: "55 555 5555", re: /^\d{2} \d{3} \d{4}$/, cut: 9, max: 11 },
    "+993": { ph: "6 123 4567", re: /^\d{1} \d{3} \d{4}$/, cut: 8, max: 10 },
    "+48": { ph: "123 456 789", re: /^\d{3} \d{3} \d{3}$/, cut: 9, max: 11 },
  };

  let selectedCode = "+998";
  if (phoneInput) {
    phoneInput.placeholder = formats[selectedCode].ph;
    phoneInput.maxLength = formats[selectedCode].max;
  }

  function setupCountries() {
    const trigger = document.getElementById("selectedCountry");
    if (!trigger) return;

    trigger.addEventListener("click", () => {
      const open = dropdown.style.display === "block";
      dropdown.style.display = open ? "none" : "block";
      dropdownIcon.innerHTML = open
        ? '<polyline points="6 9 12 15 18 9"></polyline>'
        : '<polyline points="18 15 12 9 6 15"></polyline>';

      if (!open) {
        dropdown.innerHTML = "";
        countries.forEach((c) => {
          const div = document.createElement("div");
          div.className = "country-option";
          div.innerHTML = `<span>${c.name}</span><span class="country-code">${c.code}</span>`;
          div.onclick = () => {
            selectedCode = c.code;
            countryCodeEl.textContent = c.code;
            dropdown.style.display = "none";
            if (phoneInput) {
              phoneInput.placeholder = formats[c.code].ph;
              phoneInput.maxLength = formats[c.code].max;
              phoneInput.value = "";
            }
            phoneError.style.display = "none";
            dropdownIcon.innerHTML =
              '<polyline points="6 9 12 15 18 9"></polyline>';
          };
          dropdown.appendChild(div);
        });
      }
    });

    document.addEventListener("click", (e) => {
      if (!trigger.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.style.display = "none";
        dropdownIcon.innerHTML =
          '<polyline points="6 9 12 15 18 9"></polyline>';
      }
    });
  }

  if (phoneInput) {
    phoneInput.addEventListener("input", (e) => {
      const onlyNums = e.target.value
        .replace(/\D/g, "")
        .slice(0, formats[selectedCode].cut);
      let v = onlyNums;

      if (selectedCode === "+998") {
        if (v.length > 2 && v.length <= 5)
          v = v.replace(/(\d{2})(\d{0,3})/, "$1 $2");
        else if (v.length > 5 && v.length <= 7)
          v = v.replace(/(\d{2})(\d{3})(\d{0,2})/, "$1 $2 $3");
        else if (v.length > 7)
          v = v.replace(/(\d{2})(\d{3})(\d{2})(\d{0,2})/, "$1 $2 $3 $4");
      }
      e.target.value = v;
      phoneError.style.display = "none";
    });
  }

  if (nameInput)
    nameInput.addEventListener(
      "input",
      () => (nameError.style.display = "none")
    );

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      if (!nameInput.value.trim()) {
        nameError.style.display = "block";
        return;
      }
      if (!formats[selectedCode].re.test(phoneInput.value)) {
        phoneError.style.display = "block";
        return;
      }

      const data = {
        name: nameInput.value.trim(),
        phone: `${selectedCode} ${phoneInput.value}`,
        time: new Date().toLocaleString("uz-UZ"),
        uid: Date.now().toString(),
      };

      // Save locally (thankyou page will send to Google Sheets)
      localStorage.setItem("FormData", JSON.stringify(data));
      form.querySelector("button").disabled = true;

      // Redirect (same as old website)
      window.location.href = "/thankYou.html";
    });
  }

  function safeRun(fn, delay = 300) {
    try {
      if ("requestIdleCallback" in window) {
        requestIdleCallback(fn, { timeout: 500 });
      } else {
        setTimeout(fn, delay);
      }
    } catch {
      setTimeout(fn, delay);
    }
  }

  safeRun(setupCountries);
  safeRun(startCountdown);

  // Fallbacks to ensure timer starts
  setTimeout(() => {
    if (!window.__timerStarted) {
      window.__timerStarted = true;
      startCountdown();
    }
  }, 1000);

  document.addEventListener(
    "touchstart",
    () => {
      if (!window.__timerStarted) {
        window.__timerStarted = true;
        startCountdown();
      }
    },
    { once: true, passive: true }
  );
}

function startApp() {
  requestAnimationFrame(() => {
    if ("requestIdleCallback" in window) {
      requestIdleCallback(initForm, { timeout: 1000 });
    } else {
      setTimeout(initForm, 100);
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startApp);
} else {
  startApp();
}
