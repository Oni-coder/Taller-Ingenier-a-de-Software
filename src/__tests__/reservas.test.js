const {
  validarReserva,
  crearReserva,
  filtrarReservas
} = require("../core/reservas"); // ajustá la ruta si es necesario

describe("validarReserva", () => {

  const fechaFutura = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(10, 0, 0, 0); // horario válido lunes-viernes
    return {
      date: d.toISOString().split("T")[0],
      time: "10:00"
    };
  };

  test("falla si no hay servicio", () => {
    const data = { ...fechaFutura() };

    const res = validarReserva(data, []);

    expect(res.ok).toBe(false);
    expect(res.error).toBe("Debe seleccionar un servicio");
  });

  test("falla si no hay fecha u hora", () => {
    const data = { service: "Baño" };

    const res = validarReserva(data, []);

    expect(res.ok).toBe(false);
    expect(res.error).toBe("Debe elegir fecha y hora");
  });

  test("falla si la fecha es en el pasado", () => {
    const ayer = new Date();
    ayer.setDate(ayer.getDate() - 1);

    const data = {
      service: "Corte",
      date: ayer.toISOString().split("T")[0],
      time: "10:00"
    };

    const res = validarReserva(data, []);

    expect(res.ok).toBe(false);
    expect(res.error).toBe("No se permiten reservas en el pasado");
  });

  test("falla si el horario está fuera del rango permitido", () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(23, 0, 0, 0);

    const data = {
      service: "Corte",
      date: d.toISOString().split("T")[0],
      time: "23:00"
    };

    const res = validarReserva(data, []);

    expect(res.ok).toBe(false);
    expect(res.error).toBe("Horario fuera del rango permitido");
  });

  test("falla si supera los 2 meses de antelación", () => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    d.setHours(10, 0, 0, 0);

    const data = {
      service: "Corte",
      date: d.toISOString().split("T")[0],
      time: "10:00"
    };

    const res = validarReserva(data, []);

    expect(res.ok).toBe(false);
    expect(res.error).toBe("Solo se puede reservar con hasta 2 meses");
  });

  test("falla si hay conflicto de profesional", () => {
    const futura = fechaFutura();

    const reservas = [
      {
        professionalId: 1,
        date: futura.date,
        time: futura.time
      }
    ];

    const data = {
      service: "Corte",
      professionalId: 1,
      date: futura.date,
      time: futura.time
    };

    const res = validarReserva(data, reservas);

    expect(res.ok).toBe(false);
    expect(res.error).toBe("Profesional ocupado en ese horario");
  });

  test("reserva válida retorna ok true", () => {
    const futura = fechaFutura();

    const data = {
      service: "Corte",
      professionalId: 1,
      date: futura.date,
      time: futura.time
    };

    const res = validarReserva(data, []);

    expect(res.ok).toBe(true);
  });

});


describe("crearReserva", () => {

  test("crea reserva con id, duration y estado", () => {

    const data = {
      service: "Corte",
      date: "2026-03-01",
      time: "10:00"
    };

    const reserva = crearReserva(data);

    expect(reserva.id).toBeDefined();
    expect(reserva.duration).toBe(30);
    expect(reserva.estado).toBe("confirmada");
    expect(reserva.service).toBe("Corte");
  });

});


describe("filtrarReservas", () => {

  const reservasMock = [
    {
      usuario: "juan",
      professionalId: 1,
      date: "2026-03-01",
      service: "Corte",
      estado: "confirmada"
    },
    {
      usuario: "ana",
      professionalId: 2,
      date: "2026-03-02",
      service: "Baño",
      estado: "pendiente"
    }
  ];

  test("retorna vacío si no hay usuario", () => {
    const res = filtrarReservas(reservasMock, {}, null);
    expect(res).toEqual([]);
  });

  test("cliente solo ve sus reservas", () => {
    const usuario = { rol: "cliente", usuario: "juan" };

    const res = filtrarReservas(reservasMock, {}, usuario);

    expect(res.length).toBe(1);
    expect(res[0].usuario).toBe("juan");
  });

  test("trabajador solo ve sus reservas", () => {
    const usuario = { rol: "trabajador", id: 2 };

    const res = filtrarReservas(reservasMock, {}, usuario);

    expect(res.length).toBe(1);
    expect(res[0].professionalId).toBe(2);
  });

  test("filtra por fecha", () => {
    const usuario = { rol: "admin" };

    const res = filtrarReservas(reservasMock, { fecha: "2026-03-01" }, usuario);

    expect(res.length).toBe(1);
    expect(res[0].date).toBe("2026-03-01");
  });

  test("filtra por servicio", () => {
    const usuario = { rol: "admin" };

    const res = filtrarReservas(reservasMock, { servicio: "Baño" }, usuario);

    expect(res.length).toBe(1);
    expect(res[0].service).toBe("Baño");
  });

  test("filtra por estado", () => {
    const usuario = { rol: "admin" };

    const res = filtrarReservas(reservasMock, { estado: "pendiente" }, usuario);

    expect(res.length).toBe(1);
    expect(res[0].estado).toBe("pendiente");
  });

});


