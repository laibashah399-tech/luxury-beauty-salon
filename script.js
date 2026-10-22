/* ============================================================
   EDIT HERE: all business details live in this one object.
   Everything below is fictional demo data.
   ============================================================ */
const CONFIG = {
  phoneDisplay: "+1 (555) 555-0123", // DEMO number
  phoneDigits: "15555550123", // digits only, with country code (used for tel: and WhatsApp)
  email: "hello@luxebeauty.example", // DEMO email
  addressLines: [
    "24 Marigold Lane",
    "Lakeview, CA 90000",
    "(fictional address)",
  ],
  hours: [
    ["Monday to Friday", "10:00 AM – 7:00 PM"],
    ["Saturday", "9:00 AM – 6:00 PM"],
    ["Sunday", "Closed"],
  ],
  whatsappMessage:
    "Hello Luxe Beauty Studio, I would like to book an appointment.",
};

(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  document.documentElement.classList.add("js");

  /* ---- Fill contact details from CONFIG ---- */
  $$('[data-bind="phone-link"]').forEach((a) => {
    a.textContent = CONFIG.phoneDisplay;
    a.href = "tel:+" + CONFIG.phoneDigits;
  });
  $$('[data-bind="email-link"]').forEach((a) => {
    a.textContent = CONFIG.email;
    a.href = "mailto:" + CONFIG.email;
  });
  $$('[data-bind="wa-link"]').forEach((a) => {
    a.href = `https://wa.me/${CONFIG.phoneDigits}?text=${encodeURIComponent(CONFIG.whatsappMessage)}`;
  });
  $$('[data-bind="address"]').forEach((el) => {
    el.innerHTML = CONFIG.addressLines
      .map((l) => `<span style="display:block">${l}</span>`)
      .join("");
  });
  $$('[data-bind="address-inline"]').forEach((el) => {
    el.textContent = CONFIG.addressLines.slice(0, 2).join(", ");
  });
  $$('[data-bind="hours"]').forEach((ul) => {
    CONFIG.hours.forEach(([d, t]) => {
      const li = document.createElement("li");
      li.innerHTML = `<span></span><span></span>`;
      li.children[0].textContent = d;
      li.children[1].textContent = t;
      ul.appendChild(li);
    });
  });
  $("#yr").textContent = new Date().getFullYear();

  /* ---- Image fallback so a failed photo never leaves a broken icon ---- */
  $$("img").forEach((img) =>
    img.addEventListener(
      "error",
      () => {
        img.style.visibility = "hidden";
      },
      { once: true },
    ),
  );

  /* ---- Mobile menu ---- */
  const burger = $("#burger"),
    menu = $("#menu");
  const setMenu = (open) => {
    menu.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", open);
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };
  burger.addEventListener("click", () =>
    setMenu(!menu.classList.contains("open")),
  );
  $$("a", menu).forEach((a) =>
    a.addEventListener("click", () => setMenu(false)),
  );
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menu.classList.contains("open")) {
      setMenu(false);
      burger.focus();
    }
  });
  matchMedia("(min-width:961px)").addEventListener("change", (e) => {
    if (e.matches) setMenu(false);
  });

  /* ---- Entrance animations ---- */
  const items = $$(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.12 },
    );
    items.forEach((el, i) => {
      el.style.transitionDelay = (i % 3) * 90 + "ms";
      io.observe(el);
    });
  } else items.forEach((el) => el.classList.add("in"));

  /* ---- Gallery lightbox ---- */
  const lb = $("#lb"),
    lbImg = $("#lbImg"),
    thumbs = $$("#grid .g");
  let cur = 0;
  const show = (i) => {
    cur = (i + thumbs.length) % thumbs.length;
    const t = thumbs[cur];
    lbImg.src = t.dataset.full;
    lbImg.alt = $("img", t).alt;
  };
  thumbs.forEach((t, i) =>
    t.addEventListener("click", () => {
      show(i);
      lb.showModal();
    }),
  );
  $("#lbX").addEventListener("click", () => lb.close());
  $("#lbP").addEventListener("click", () => show(cur - 1));
  $("#lbN").addEventListener("click", () => show(cur + 1));
  lb.addEventListener("click", (e) => {
    if (e.target === lb) lb.close();
  });
  lb.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") show(cur - 1);
    if (e.key === "ArrowRight") show(cur + 1);
  });
  lb.addEventListener("close", () => thumbs[cur].focus());

  /* ---- Meet our experts dialog ---- */
  const team = $("#team");
  $("#expertsBtn").addEventListener("click", () => team.showModal());
  $("#teamBook").addEventListener("click", () => team.close());
  team.addEventListener("click", (e) => {
    if (e.target === team) team.close();
  });

  /* ---- Booking form ---- */
  const form = $("#bookForm"),
    confirmBox = $("#confirm"),
    dateEl = $("#date");
  const fmt = (d) => d.toISOString().slice(0, 10);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const max = new Date(today);
  max.setMonth(max.getMonth() + 6);
  dateEl.min = fmt(
    new Date(today.getTime() - today.getTimezoneOffset() * 60000),
  );
  dateEl.max = fmt(max);

  const rules = {
    name: (v) =>
      v.trim().length < 2
        ? "Enter your full name."
        : /[^\p{L}\s.'-]/u.test(v.trim())
          ? "Use letters only in your name."
          : "",
    phone: (v) => {
      const d = v.replace(/\D/g, "");
      return !/^[+\d\s().-]+$/.test(v) || d.length < 7 || d.length > 15
        ? "Enter a valid phone number, 7 to 15 digits."
        : "";
    },
    service: (v) => (v ? "" : "Choose a service."),
    date: (v) => {
      if (!v) return "Choose a date.";
      const [y, m, d] = v.split("-").map(Number),
        pick = new Date(y, m - 1, d);
      if (pick < today) return "Choose today or a future date.";
      if (pick.getDay() === 0)
        return "We are closed on Sundays. Choose another day.";
      return pick > max ? "Choose a date within six months." : "";
    },
    time: (v) => (v ? "" : "Choose a time."),
  };
  const check = (el) => {
    const msg = rules[el.name](el.value);
    $("#" + el.id + "-e").textContent = msg;
    el.classList.toggle("invalid", !!msg);
    el.setAttribute("aria-invalid", !!msg);
    return !msg;
  };
  const fields = $$("input,select", form);
  fields.forEach((el) => {
    el.addEventListener("blur", () => check(el));
    el.addEventListener(
      "input",
      () => el.classList.contains("invalid") && check(el),
    );
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const results = fields.map(check);
    if (results.includes(false)) {
      fields[results.indexOf(false)].focus();
      confirmBox.hidden = true;
      return;
    }
    const v = Object.fromEntries(fields.map((f) => [f.name, f.value.trim()]));
    const [y, m, d] = v.date.split("-").map(Number);
    const nice = new Date(y, m - 1, d).toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
    confirmBox.innerHTML = "";
    const h = document.createElement("h3"),
      p = document.createElement("p"),
      s = document.createElement("p");
    h.textContent = `Thank you, ${v.name.split(" ")[0]}.`;
    p.textContent = `Your request for ${v.service} on ${nice} at ${v.time} is noted. We would call ${v.phone} to confirm.`;
    s.className = "small";
    s.textContent = "Demo only: nothing was sent to a real salon.";
    confirmBox.append(h, p, s);
    confirmBox.hidden = false;
    confirmBox.focus();
    form.reset();
    fields.forEach((f) => {
      f.classList.remove("invalid");
      f.removeAttribute("aria-invalid");
    });
  });
})();
