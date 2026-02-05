export function validarReserva(data, reservasExistentes) {

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
    hayConflicto(fechaHora, data.professionalId, reservasExistentes)
  ) {
    return { ok: false, error: "Profesional ocupado en ese horario" };
  }

  return { ok: true };
}

/* ===================== */

export function crearReserva(data) {
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

function hayConflicto(fecha, profesionalId, reservas) {
  return reservas.some(r => {
    const existente = new Date(`${r.date}T${r.time}`);
    return (
      r.professionalId === profesionalId &&
      existente.getTime() === fecha.getTime()
    );
  });
}
