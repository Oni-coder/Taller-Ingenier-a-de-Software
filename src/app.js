import {
  validarReserva,
  crearReserva
} from "./core/reservas.js";

/* =====================
   MENU BURGER
===================== */

const burger = document.getElementById("burger");
const nav = document.getElementById("menu");

burger.addEventListener("click", () => {
  nav.classList.toggle("active");
});

document.querySelectorAll("nav a").forEach(link => {
  link.addEventListener("click", () => {
    nav.classList.remove("active");
  });
});

/* =====================
   FORM RESERVA
===================== */

const form = document.getElementById("bookingForm");
const msg = document.getElementById("bookingMessage");

if (form) {
  form.addEventListener("submit", e => {
    e.preventDefault();

    const data = {
      service: document.getElementById("serviceSelect").value,
      professionalType: document.getElementById("professionalTypeSelect").value,
      professionalId: document.getElementById("professionalSelect")?.value || null,
      date: document.getElementById("dateInput").value,
      time: document.getElementById("timeInput").value
    };

    const reservas = JSON.parse(localStorage.getItem("reservas")) || [];

    const resultado = validarReserva(data, reservas);

    if (!resultado.ok) {
      msg.textContent = "❌ " + resultado.error;
      msg.style.color = "red";
      return;
    }

    const nueva = crearReserva(data);

    reservas.push(nueva);
    localStorage.setItem("reservas", JSON.stringify(reservas));

    msg.textContent = "✅ Turno reservado correctamente";
    msg.style.color = "green";

    form.reset();
  });
}
