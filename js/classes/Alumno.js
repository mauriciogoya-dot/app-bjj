export class Alumno {
  static alumnos = [];

  constructor(
    nombre,
    telefono,
    fechaNacimiento,
    cinturon,
    grados,
    estado,
    pagos = {},
    observaciones = "",
    id = null,
  ) {
    this.id =
      id || Date.now().toString() + Math.random().toString(36).substring(2, 7);
    this.nombre = nombre;
    this.telefono = telefono;
    this.fechaNacimiento = fechaNacimiento;
    this.cinturon = cinturon;
    this.grados = parseInt(grados);
    this.estado = estado; // 'Activo', 'A prueba', 'Inactivo'
    this.pagos = pagos; // Objeto con formato { 'YYYY-MM': 'Al día' / 'Pendiente' / 'Parcial' }
    this.observaciones = observaciones;
  }

  guardar() {
    Alumno.alumnos.push(this);
    Alumno.sincronizarStorage();
  }

  // Obtener el estado de la cuota para un mes específico (Ej: '2026-10')
  obtenerEstadoCuota(mesAnio) {
    return this.pagos[mesAnio] || "Pendiente"; // Si no existe registro, por defecto es Pendiente
  }

  // Actualizar el estado de cuota para un mes específico
  setEstadoCuota(mesAnio, estado) {
    this.pagos[mesAnio] = estado;
    Alumno.sincronizarStorage();
  }

  static sincronizarStorage() {
    localStorage.setItem("pretorianos_alumnos", JSON.stringify(Alumno.alumnos));
  }

  static cargarStorage() {
    const alumnosStorage = localStorage.getItem("pretorianos_alumnos");
    if (alumnosStorage) {
      const datos = JSON.parse(alumnosStorage);
      Alumno.alumnos = datos.map(
        (a) =>
          new Alumno(
            a.nombre,
            a.telefono,
            a.fechaNacimiento,
            a.cinturon,
            a.grados,
            a.estado,
            a.pagos || {}, // Recuperar objeto de pagos o vacío
            a.observaciones,
            a.id,
          ),
      );
    } else {
      Alumno.alumnos = [];
    }
  }

  obtenerTotalAsistencias(asistenciasGlobales) {
    return asistenciasGlobales.filter((a) => a.alumnoId === this.id).length;
  }

  static eliminar(id) {
    Alumno.alumnos = Alumno.alumnos.filter((a) => a.id !== id);
    Alumno.sincronizarStorage();
  }

  static buscarPorId(id) {
    return Alumno.alumnos.find((a) => a.id === id);
  }

  static obtenerEstadisticas(mesAnio) {
    const total = Alumno.alumnos.length;
    const activos = Alumno.alumnos.filter(
      (a) => a.estado === "Activo" || a.estado === "A prueba",
    ).length;
    const inactivos = total - activos;
    const cuotasAlDia = Alumno.alumnos.filter(
      (a) => a.obtenerEstadoCuota(mesAnio) === "Al día",
    ).length;

    return { total, activos, inactivos, cuotasAlDia };
  }
}
