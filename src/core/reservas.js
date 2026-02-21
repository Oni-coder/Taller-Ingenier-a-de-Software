 function validarReserva(data, reservasExistentes) {

  if (!data.service) {
    return { ok: false, error: "Debe seleccionar un servicio" };
  }

  if (!data.date || !data.time) {
    return { ok: false, error: "Debe elegir fecha y hora" };
  }

  const fechaHora = new Date(`${data.date}T${data.time}`);

  if (fechaHora < new Date()) {
    return { ok: false, error: "No se permiten reservas en el pasado" };
  }

  if (!estaDentroHorario(fechaHora)) {
    return { ok: false, error: "Horario fuera del rango permitido" };
  }

  if (!dentroAntelacion(fechaHora)) {
    return { ok: false, error: "Solo se puede reservar con hasta 2 meses" };
  }

  if (
    data.professionalId &&
    hayConflicto(data.date, data.time, data.professionalId, reservasExistentes)
  ) {
    return { ok: false, error: "Profesional ocupado en ese horario" };
  }

  return { ok: true };
}

/* ===================== */
/* editar */
 function crearReserva(data) {
  return {
    id: crypto.randomUUID(),
    ...data,
    duration: 30,
    estado: "confirmada"
  };
}

/* =====================
   REGLAS INTERNAS
===================== */

function estaDentroHorario(fecha) {
  const dia = fecha.getDay(); // 0 domingo
  const hora = fecha.getHours();

  if (dia >= 1 && dia <= 5) return hora >= 9 && hora < 18;
  if (dia === 6) return hora >= 8 && hora < 12;

  return false;
}

function dentroAntelacion(fecha) {
  const max = new Date();
  max.setMonth(max.getMonth() + 2);
  return fecha <= max;
}
function hayConflicto(date, time, profesionalId, reservas) {

  return reservas.some(r =>
    r.professionalId === profesionalId &&
    r.date === date &&
    r.time === time
  );
}

 function filtrarReservas(reservas, filtros, usuario){

  let resultado = [...reservas];

  if (!usuario) return [];

  if (usuario.rol === "cliente") {
    resultado = resultado.filter(r => r.usuario === usuario.usuario);
  }

  if (usuario.rol === "trabajador") {
    resultado = resultado.filter(r => r.professionalId === usuario.id);
  }

  if (filtros.fecha) {
    resultado = resultado.filter(r => r.date === filtros.fecha);
  }

  if (filtros.servicio) {
    resultado = resultado.filter(r => r.service === filtros.servicio);
  }

  if (filtros.estado) {
    resultado = resultado.filter(r => r.estado === filtros.estado);
  }

  return resultado;
}

function suma(a, b) {

  return a + b;

}
/*
Este bloque SOLO se ejecuta en Jest (Node)
En el navegador, `module` no existe, así que se ignora
Permite que el mismo archivo funcione en navegador y en Jest
*/



module.exports = {
  validarReserva,
  crearReserva,
  filtrarReservas,
  suma
};



