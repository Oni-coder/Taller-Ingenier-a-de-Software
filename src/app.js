/* =====================
   IMPORTS
===================== */

import {
  validarReserva,
  crearReserva
} from "./core/reservas.js";

document.addEventListener("DOMContentLoaded", function () {
    mostrarMapaVeterinaria();
});




//#region LOGIN

const txtUsuario = document.querySelector("#txtUsuario");
const txtPassword = document.querySelector("#txtPassword");
const btnLogin = document.querySelector("#btnLogin");
const loginMessage = document.querySelector("#loginMessage");

// Usuarios simulados
const usuarios = [
  { usuario: "admin", password: "veterinaria", rol: "admin" },
  { usuario: "cliente", password: "abcd", rol: "cliente" }
];

btnLogin?.addEventListener("click", login);

function login() {
  const user = txtUsuario.value.trim();
  const pass = txtPassword.value.trim();

  if (!user || !pass) {
    loginMessage.textContent = "Debe ingresar usuario y contraseña";
    loginMessage.style.color = "red";
    return;
  }

  const encontrado = usuarios.find(
    u => u.usuario === user && u.password === pass
  );

  if (encontrado) {
    loginMessage.textContent = "Login correcto ✔";
    loginMessage.style.color = "green";

    localStorage.setItem("usuarioLogueado", JSON.stringify(encontrado));

    actualizarMenu();
  } else {
    loginMessage.textContent = "Usuario o contraseña incorrectos ❌";
    loginMessage.style.color = "red";
  }
}

//#endregion
//#region TURNOS

const timeSelect = document.getElementById("timeSelect");
const dateInput = document.getElementById("dateInput");

function cargarTurnosPorFecha() {
  if (!timeSelect || !dateInput.value) return;

  const fecha = new Date(dateInput.value + "T00:00:00");
  const dia = fecha.getDay(); // 0=domingo,6=sábado

  timeSelect.innerHTML = "";

  if (dia === 0) {
    const opcion = document.createElement("option");
    opcion.value = "";
    opcion.textContent = "Cerrado (domingo)";
    timeSelect.appendChild(opcion);
    return;
  }

  let horaInicio;
  let horaFin;

  if (dia >= 1 && dia <= 5) {
    horaInicio = 9;
    horaFin = 18;
  } else if (dia === 6) {
    horaInicio = 8;
    horaFin = 12;
  }

  const primera = document.createElement("option");
  primera.value = "";
  primera.textContent = "Seleccione horario";
  timeSelect.appendChild(primera);

  let hora = horaInicio;
  let minuto = 0;

  while (hora < horaFin || (hora === horaFin && minuto === 0)) {

    let h = hora.toString().padStart(2, "0");
    let m = minuto.toString().padStart(2, "0");

    const opcion = document.createElement("option");
    opcion.value = h + ":" + m;
    opcion.textContent = h + ":" + m;

    timeSelect.appendChild(opcion);

    minuto += 30;

    if (minuto === 60) {
      minuto = 0;
      hora++;
    }

    if (hora === horaFin && minuto === 0) {
      break;
    }
  }
}

// Cuando cambia la fecha → recargar turnos
dateInput.addEventListener("change", cargarTurnosPorFecha);

//#endregion



//#region SESION

function actualizarMenu() {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogueado"));

  if (usuario) {
    document.querySelector('a[href="#login"]').textContent =
      `Salir (${usuario.usuario})`;
  }
}

actualizarMenu();

//#endregion


//#region MENU BURGER

const burger = document.getElementById("burger");
const nav = document.getElementById("menu");

burger?.addEventListener("click", () => {
  nav.classList.toggle("active");
});

document.querySelectorAll("nav a").forEach(link => {
  link.addEventListener("click", () => {
    nav.classList.remove("active");
  });
});

//#endregion


//#region FORM RESERVA

const form = document.getElementById("bookingForm");
const msg = document.getElementById("bookingMessage");

form?.addEventListener("submit", e => {
  e.preventDefault();

  const data = {
    service: document.getElementById("serviceSelect").value,
    professionalType: document.getElementById("professionalTypeSelect").value,
    professionalId:
      document.getElementById("professionalSelect")?.value || null,
    date: document.getElementById("dateInput").value,
    time: document.getElementById("timeSelect").value
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

//#endregion


//#region MAPA

function mostrarMapaVeterinaria() {
    /* ORT Centro - Mercedes y Cuareim (ubicación ficticia) */
    var lat = -34.9040;
    var lon = -56.1910;
    var delta = 0.002;

    var src =
        "https://www.openstreetmap.org/export/embed.html" +
        "?bbox=" + (lon - delta) + "," + (lat - delta) + "," +
        (lon + delta) + "," + (lat + delta) +
        "&layer=mapnik" +
        "&marker=" + lat + "," + lon;

    document.getElementById("map").innerHTML =
        '<iframe loading="lazy" src="' + src + '"></iframe>';
}

