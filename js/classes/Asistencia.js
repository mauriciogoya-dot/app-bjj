export class Asistencia {
  static asistencias = [];

  constructor(alumnoId, fecha, turno = "General", id = null) {
    this.id =
      id || Date.now().toString() + Math.random().toString(36).substring(2, 7);
    this.alumnoId = alumnoId;
    this.fecha = fecha;
    this.turno = turno;
  }

  guardar() {
    Asistencia.asistencias.push(this);
    Asistencia.sincronizarStorage();
  }

  static sincronizarStorage() {
    localStorage.setItem(
      "pretorianos_asistencias",
      JSON.stringify(Asistencia.asistencias),
    );
  }

  static cargarStorage() {
    const asistenciasStorage = localStorage.getItem("pretorianos_asistencias");
    if (asistenciasStorage) {
      const datos = JSON.parse(asistenciasStorage);
      Asistencia.asistencias = datos.map(
        (asist) =>
          new Asistencia(
            asist.alumnoId,
            asist.fecha,
            asist.turno || "General",
            asist.id,
          ),
      );
    } else {
      Asistencia.asistencias = [];
    }
  }

  static existeAsistencia(alumnoId, fecha, turno) {
    return Asistencia.asistencias.some(
      (a) => a.alumnoId === alumnoId && a.fecha === fecha && a.turno === turno,
    );
  }

  static eliminar(id) {
    Asistencia.asistencias = Asistencia.asistencias.filter((a) => a.id !== id);
    Asistencia.sincronizarStorage();
  }
}
