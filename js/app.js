import { Alumno } from "./classes/Alumno.js";
import { Asistencia } from "./classes/Asistencia.js";

// ==========================================
// 0. INICIALIZACIÓN Y STORAGE
// ==========================================
Alumno.cargarStorage();
Asistencia.cargarStorage();

const obtenerMesActual = () => new Date().toISOString().slice(0, 7);

const selectorMesFinanzas = document.getElementById("selector-mes-finanzas");
const selectorMesNomina = document.getElementById("selector-mes-nomina");

selectorMesFinanzas.value = obtenerMesActual();
selectorMesNomina.value = obtenerMesActual();

selectorMesFinanzas.addEventListener("change", (e) => {
  selectorMesNomina.value = e.target.value;
  actualizarDashboardFinanciero();
});

selectorMesNomina.addEventListener("change", (e) => {
  selectorMesFinanzas.value = e.target.value;
  renderizarNomina();
});

actualizarDashboardFinanciero();

// ==========================================
// 1. NAVEGACIÓN ENTRE PESTAÑAS (TABS)
// ==========================================
const tabButtons = document.querySelectorAll(".tab-btn");
const viewSections = document.querySelectorAll(".view-section");

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const targetTab = button.getAttribute("data-tab");

    tabButtons.forEach((btn) => {
      btn.classList.remove("bg-amber-600", "text-slate-950", "shadow-md");
      btn.classList.add(
        "text-slate-300",
        "hover:bg-slate-700",
        "hover:text-white",
      );
    });
    button.classList.add("bg-amber-600", "text-slate-950", "shadow-md");
    button.classList.remove(
      "text-slate-300",
      "hover:bg-slate-700",
      "hover:text-white",
    );

    viewSections.forEach((section) => {
      section.classList.add("hidden");
      if (section.id === `view-${targetTab}`) {
        section.classList.remove("hidden");
      }
    });

    if (targetTab === "dashboard") actualizarDashboardFinanciero();
    if (targetTab === "nomina") renderizarNomina();
    if (targetTab === "asistencias") inicializarVistaAsistencias();
  });
});

// ==========================================
// 2. REGISTRO DE NUEVOS ALUMNOS
// ==========================================
const formAlumno = document.getElementById("form-alumno");

formAlumno.addEventListener("submit", (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value.trim();
  const telefono = document.getElementById("telefono").value.trim();
  const fechaNacimiento = document.getElementById("fecha-nacimiento").value;
  const cinturon = document.getElementById("cinturon").value;
  const grados = document.getElementById("grados").value;
  const estado = document.getElementById("estado").value;
  const observaciones = document.getElementById("observaciones").value.trim();

  if (
    !nombre ||
    !telefono ||
    !fechaNacimiento ||
    !cinturon ||
    !grados ||
    !estado
  )
    return;

  const mesActual = obtenerMesActual();
  const pagosIniciales = { [mesActual]: "Pendiente" };

  const nuevoAlumno = new Alumno(
    nombre,
    telefono,
    fechaNacimiento,
    cinturon,
    grados,
    estado,
    pagosIniciales,
    observaciones,
  );
  nuevoAlumno.guardar();

  formAlumno.reset();
  alert("¡Alumno registrado con éxito en el dojo!");

  document.querySelector('[data-tab="nomina"]').click();
});

// ==========================================
// 3. DASHBOARD Y CALCULADORA FINANCIERA MENSUAL
// ==========================================
function actualizarDashboardFinanciero() {
  const mesSeleccionado = selectorMesFinanzas.value;
  const stats = Alumno.obtenerEstadisticas(mesSeleccionado);

  document.getElementById("stat-total").textContent = stats.total;
  document.getElementById("stat-activos").textContent = stats.activos;
  document.getElementById("stat-cuotas").textContent = stats.cuotasAlDia;
  document.getElementById("stat-inactivos").textContent = stats.inactivos;

  const alumnosActivos = Alumno.alumnos.filter(
    (a) => a.estado === "Activo" || a.estado === "A prueba",
  );

  const VALOR_CUOTA = 45000;
  const PAGO_POR_ALUMNO_CARLOS = 15000;
  const SERVICIOS_FIJOS_CARLOS = 30000;

  let recaudacionBruta = 0;
  alumnosActivos.forEach((a) => {
    const estadoCuota = a.obtenerEstadoCuota(mesSeleccionado);
    if (estadoCuota === "Al día") {
      recaudacionBruta += VALOR_CUOTA;
    } else if (estadoCuota === "Parcial") {
      recaudacionBruta += VALOR_CUOTA / 2;
    }
  });

  const cantidadPagantesCarlos = alumnosActivos.length;
  const totalCarlos =
    cantidadPagantesCarlos * PAGO_POR_ALUMNO_CARLOS +
    (cantidadPagantesCarlos > 0 ? SERVICIOS_FIJOS_CARLOS : 0);
  const gananciaNeta = recaudacionBruta - totalCarlos;

  document.getElementById("fin-recaudacion").textContent =
    `$${recaudacionBruta.toLocaleString()}`;
  document.getElementById("fin-carlos").textContent =
    `$${totalCarlos.toLocaleString()}`;
  document.getElementById("fin-ganancia").textContent =
    `$${gananciaNeta.toLocaleString()}`;
}

// ==========================================
// 4. NÓMINA GENERAL Y CAMBIO DE CUOTA MENSUAL
// ==========================================
function renderizarNomina() {
  const tablaAlumnos = document.getElementById("tabla-alumnos");
  tablaAlumnos.innerHTML = "";

  const mesSeleccionado = selectorMesNomina.value;
  const alumnos = Alumno.alumnos;

  if (alumnos.length === 0) {
    tablaAlumnos.innerHTML = `
            <tr id="fila-vacia">
                <td colspan="6" class="py-8 text-center text-slate-500">No hay alumnos registrados en el sistema.</td>
            </tr>
        `;
    return;
  }

  alumnos.forEach((a) => {
    const tr = document.createElement("tr");
    tr.className =
      "border-b border-slate-700/50 hover:bg-slate-700/30 transition duration-150";

    let colorEstado =
      "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
    if (a.estado === "A prueba")
      colorEstado = "bg-blue-500/10 text-blue-400 border border-blue-500/20";
    if (a.estado === "Inactivo")
      colorEstado = "bg-slate-500/10 text-slate-400 border border-slate-500/20";

    const estadoCuotaMes = a.obtenerEstadoCuota(mesSeleccionado);
    const totalAsistencias = a.obtenerTotalAsistencias(Asistencia.asistencias);

    tr.innerHTML = `
            <td class="py-3 px-3">
                <div class="font-medium text-white">${a.nombre}</div>
                <div class="text-xs text-slate-400">📞 ${a.telefono}</div>
            </td>
            <td class="py-3 px-3">
                <div class="text-slate-100 font-medium">${a.cinturon}</div>
                <div class="text-xs text-slate-400">${a.grados} ${a.grados == 1 ? "Grado" : "Grados"}</div>
            </td>
            <td class="py-3 px-3">
                <span class="px-2.5 py-1 text-xs font-semibold rounded-full ${colorEstado}">${a.estado}</span>
            </td>
            <td class="py-3 px-3">
                <select data-id="${a.id}" class="select-estado-cuota bg-slate-900 border border-slate-700 text-xs rounded px-2 py-1 font-semibold focus:ring-2 focus:ring-amber-500 ${
                  estadoCuotaMes === "Al día"
                    ? "text-emerald-400"
                    : estadoCuotaMes === "Parcial"
                      ? "text-amber-400"
                      : "text-rose-400"
                }">
                    <option value="Pendiente" ${estadoCuotaMes === "Pendiente" ? "selected" : ""}>Pendiente</option>
                    <option value="Parcial" ${estadoCuotaMes === "Parcial" ? "selected" : ""}>Pago Parcial</option>
                    <option value="Al día" ${estadoCuotaMes === "Al día" ? "selected" : ""}>Al día</option>
                </select>
            </td>
            <td class="py-3 px-3 font-bold text-amber-400">
                ${totalAsistencias} clases
            </td>
            <td class="py-3 px-3 text-center space-x-2">
                <button data-id="${a.id}" class="btn-perfil bg-slate-700 hover:bg-slate-600 text-white text-xs px-2.5 py-1.5 rounded transition" title="Ver Perfil">
                    Perfil
                </button>
                <button data-id="${a.id}" class="btn-eliminar text-slate-400 hover:text-rose-400 p-1 rounded transition" title="Eliminar">
                    🗑️
                </button>
            </td>
        `;

    tablaAlumnos.appendChild(tr);
  });

  document.querySelectorAll(".select-estado-cuota").forEach((select) => {
    select.addEventListener("change", (e) => {
      const id = e.currentTarget.getAttribute("data-id");
      const nuevoEstado = e.currentTarget.value;
      const alumno = Alumno.buscarPorId(id);
      if (alumno) {
        alumno.setEstadoCuota(mesSeleccionado, nuevoEstado);
        renderizarNomina();
        actualizarDashboardFinanciero();
      }
    });
  });

  document.querySelectorAll(".btn-perfil").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.getAttribute("data-id");
      mostrarPerfilAlumno(id);
    });
  });

  document.querySelectorAll(".btn-eliminar").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.getAttribute("data-id");
      if (confirm("¿Estás seguro de eliminar este alumno del sistema?")) {
        Alumno.eliminar(id);
        renderizarNomina();
        actualizarDashboardFinanciero();
      }
    });
  });
}

// ==========================================
// 5. CONTROL DE ASISTENCIAS POR FECHA Y TURNO
// ==========================================
const inputFechaAsistencia = document.getElementById("input-fecha-asistencia");
const inputTurnoAsistencia = document.getElementById("input-turno-asistencia");

function inicializarVistaAsistencias() {
  if (!inputFechaAsistencia.value) {
    const hoy = new Date().toISOString().split("T")[0];
    inputFechaAsistencia.value = hoy;
  }

  renderizarListaAsistenciasDiarias();

  inputFechaAsistencia.removeEventListener(
    "change",
    renderizarListaAsistenciasDiarias,
  );
  inputFechaAsistencia.addEventListener(
    "change",
    renderizarListaAsistenciasDiarias,
  );

  inputTurnoAsistencia.removeEventListener(
    "change",
    renderizarListaAsistenciasDiarias,
  );
  inputTurnoAsistencia.addEventListener(
    "change",
    renderizarListaAsistenciasDiarias,
  );
}

function renderizarListaAsistenciasDiarias() {
  const tablaAsistenciaDiaria = document.getElementById(
    "tabla-asistencia-diaria",
  );
  tablaAsistenciaDiaria.innerHTML = "";

  const fechaSeleccionada = inputFechaAsistencia.value;
  const turnoSeleccionado = inputTurnoAsistencia.value;
  const alumnosActivos = Alumno.alumnos.filter(
    (a) => a.estado === "Activo" || a.estado === "A prueba",
  );

  if (alumnosActivos.length === 0) {
    tablaAsistenciaDiaria.innerHTML = `
            <tr>
                <td colspan="4" class="py-8 text-center text-slate-500">No hay alumnos activos o a prueba para pasar lista.</td>
            </tr>
        `;
    return;
  }

  alumnosActivos.forEach((a) => {
    const tr = document.createElement("tr");
    tr.className =
      "border-b border-slate-700/50 hover:bg-slate-700/30 transition duration-150";

    const estaPresente = Asistencia.existeAsistencia(
      a.id,
      fechaSeleccionada,
      turnoSeleccionado,
    );
    const totalHistorico = a.obtenerTotalAsistencias(Asistencia.asistencias);

    tr.innerHTML = `
            <td class="py-3 px-3 text-center">
                <input type="checkbox" data-id="${a.id}" class="check-asistencia w-5 h-5 accent-amber-600 cursor-pointer" ${estaPresente ? "checked" : ""}>
            </td>
            <td class="py-3 px-3 font-medium text-white">${a.nombre}</td>
            <td class="py-3 px-3 text-slate-300">${a.cinturon} (${a.grados} Grados)</td>
            <td class="py-3 px-3 text-center font-bold text-amber-400">${totalHistorico}</td>
        `;

    tablaAsistenciaDiaria.appendChild(tr);
  });

  document.querySelectorAll(".check-asistencia").forEach((chk) => {
    chk.addEventListener("change", (e) => {
      const alumnoId = e.currentTarget.getAttribute("data-id");
      const fecha = inputFechaAsistencia.value;
      const turno = inputTurnoAsistencia.value;

      if (e.currentTarget.checked) {
        const nuevaAsistencia = new Asistencia(alumnoId, fecha, turno);
        nuevaAsistencia.guardar();
      } else {
        Asistencia.asistencias = Asistencia.asistencias.filter(
          (asist) =>
            !(
              asist.alumnoId === alumnoId &&
              asist.fecha === fecha &&
              asist.turno === turno
            ),
        );
        Asistencia.sincronizarStorage();
      }

      renderizarListaAsistenciasDiarias();
    });
  });
}

// ==========================================
// 6. MODAL DE PERFIL INDIVIDUAL Y EDICIÓN
// ==========================================
const modalPerfil = document.getElementById("modal-perfil");
const contenidoPerfil = document.getElementById("contenido-perfil");
const cerrarModal = document.getElementById("cerrar-modal");

cerrarModal.addEventListener("click", () => {
  modalPerfil.classList.add("hidden");
  modalPerfil.classList.remove("flex");
});

function mostrarPerfilAlumno(id) {
  const alumno = Alumno.buscarPorId(id);
  if (!alumno) return;

  const mesSeleccionado = selectorMesNomina.value;
  const estadoCuotaMes = alumno.obtenerEstadoCuota(mesSeleccionado);
  const totalAsistencias = alumno.obtenerTotalAsistencias(
    Asistencia.asistencias,
  );
  const edad = alumno.calcularEdad();

  contenidoPerfil.innerHTML = `
        <div class="border-b border-slate-700 pb-3 flex justify-between items-start">
            <div>
                <h3 class="text-2xl font-bold text-amber-500">${alumno.nombre}</h3>
                <p class="text-xs text-slate-400">📞 ${alumno.telefono} | 📅 Nac: ${alumno.fechaNacimiento} (${edad} años)</p>
            </div>
            <button id="btn-modo-editar" class="bg-amber-600/20 hover:bg-amber-600/40 text-amber-400 border border-amber-500/30 text-xs px-3 py-1.5 rounded-lg transition">
                ✏️ Editar Ficha
            </button>
        </div>
        
        <div id="seccion-vista-perfil" class="space-y-4">
            <div class="grid grid-cols-2 gap-4 text-sm">
                <div class="bg-slate-900 p-3 rounded-lg border border-slate-700">
                    <span class="text-xs text-slate-400 block">Cinturón y Grados</span>
                    <span class="font-bold text-white">${alumno.cinturon} - ${alumno.grados} Grados</span>
                </div>
                <div class="bg-slate-900 p-3 rounded-lg border border-slate-700">
                    <span class="text-xs text-slate-400 block">Asistencias Totales</span>
                    <span class="font-bold text-amber-400 text-lg">${totalAsistencias} clases</span>
                </div>
                <div class="bg-slate-900 p-3 rounded-lg border border-slate-700">
                    <span class="text-xs text-slate-400 block">Condición Alumno</span>
                    <span class="font-bold text-emerald-400">${alumno.estado}</span>
                </div>
                <div class="bg-slate-900 p-3 rounded-lg border border-slate-700">
                    <span class="text-xs text-slate-400 block">Estado Cuota (${mesSeleccionado})</span>
                    <span class="font-bold text-blue-400">${estadoCuotaMes}</span>
                </div>
            </div>

            <div>
                <label class="block text-xs text-slate-400 uppercase mb-1">Observaciones / Seminarios / Torneos</label>
                <div class="bg-slate-900 p-3 rounded-lg border border-slate-700 text-sm text-slate-300 min-h-[60px]">
                    ${alumno.observaciones || '<span class="italic text-slate-500">Sin observaciones registradas.</span>'}
                </div>
            </div>
        </div>

        <!-- FORMULARIO DE EDICIÓN (Oculto por defecto dentro del modal) -->
        <form id="form-editar-alumno" class="space-y-3 hidden">
            <h4 class="text-sm font-semibold text-amber-400 border-b border-slate-700 pb-1">Modificar Datos del Alumno</h4>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                    <label class="block text-xs text-slate-400 mb-1">Nombre y Apellido</label>
                    <input type="text" id="edit-nombre" value="${alumno.nombre}" required class="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-white">
                </div>
                <div>
                    <label class="block text-xs text-slate-400 mb-1">Teléfono</label>
                    <input type="tel" id="edit-telefono" value="${alumno.telefono}" required class="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-white">
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                    <label class="block text-xs text-slate-400 mb-1">Fecha de Nacimiento</label>
                    <input type="date" id="edit-fecha" value="${alumno.fechaNacimiento}" required class="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-white">
                </div>
                <div>
                    <label class="block text-xs text-slate-400 mb-1">Condición</label>
                    <select id="edit-estado" class="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-white">
                        <option value="Activo" ${alumno.estado === "Activo" ? "selected" : ""}>Activo</option>
                        <option value="A prueba" ${alumno.estado === "A prueba" ? "selected" : ""}>A prueba</option>
                        <option value="Inactivo" ${alumno.estado === "Inactivo" ? "selected" : ""}>Inactivo</option>
                    </select>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                    <label class="block text-xs text-slate-400 mb-1">Cinturón</label>
                    <select id="edit-cinturon" class="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-white">
                        <option value="Blanco" ${alumno.cinturon === "Blanco" ? "selected" : ""}>Blanco</option>
                        <option value="Azul" ${alumno.cinturon === "Azul" ? "selected" : ""}>Azul</option>
                        <option value="Morado" ${alumno.cinturon === "Morado" ? "selected" : ""}>Morado</option>
                        <option value="Marrón" ${alumno.cinturon === "Marrón" ? "selected" : ""}>Marrón</option>
                        <option value="Negro" ${alumno.cinturon === "Negro" ? "selected" : ""}>Negro</option>
                    </select>
                </div>
                <div>
                    <label class="block text-xs text-slate-400 mb-1">Grados (Tiras)</label>
                    <select id="edit-grados" class="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-white">
                        <option value="0" ${alumno.grados === 0 ? "selected" : ""}>0 Grados</option>
                        <option value="1" ${alumno.grados === 1 ? "selected" : ""}>1 Grado</option>
                        <option value="2" ${alumno.grados === 2 ? "selected" : ""}>2 Grados</option>
                        <option value="3" ${alumno.grados === 3 ? "selected" : ""}>3 Grados</option>
                        <option value="4" ${alumno.grados === 4 ? "selected" : ""}>4 Grados</option>
                    </select>
                </div>
            </div>

            <div class="text-sm">
                <label class="block text-xs text-slate-400 mb-1">Observaciones</label>
                <textarea id="edit-observaciones" rows="2" class="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-white">${alumno.observaciones || ""}</textarea>
            </div>

            <div class="flex justify-end space-x-2 pt-2">
                <button type="button" id="btn-cancelar-edit" class="bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1.5 rounded text-xs transition">Cancelar</button>
                <button type="submit" class="bg-amber-600 hover:bg-amber-700 text-slate-950 font-bold px-4 py-1.5 rounded text-xs transition">Guardar Cambios</button>
            </div>
        </form>
    `;

  modalPerfil.classList.remove("hidden");
  modalPerfil.classList.add("flex");

  // Lógica para alternar entre vista y formulario de edición
  const btnModoEditar = document.getElementById("btn-modo-editar");
  const seccionVista = document.getElementById("seccion-vista-perfil");
  const formEditar = document.getElementById("form-editar-alumno");
  const btnCancelarEdit = document.getElementById("btn-cancelar-edit");

  btnModoEditar.onclick = () => {
    seccionVista.classList.add("hidden");
    formEditar.classList.remove("hidden");
    btnModoEditar.classList.add("hidden");
  };

  btnCancelarEdit.onclick = () => {
    formEditar.classList.add("hidden");
    seccionVista.classList.remove("hidden");
    btnModoEditar.classList.remove("hidden");
  };

  formEditar.onsubmit = (e) => {
    e.preventDefault();
    const nuevosDatos = {
      nombre: document.getElementById("edit-nombre").value.trim(),
      telefono: document.getElementById("edit-telefono").value.trim(),
      fechaNacimiento: document.getElementById("edit-fecha").value,
      cinturon: document.getElementById("edit-cinturon").value,
      grados: document.getElementById("edit-grados").value,
      estado: document.getElementById("edit-estado").value,
      observaciones: document.getElementById("edit-observaciones").value.trim(),
    };

    alumno.actualizarDatos(nuevosDatos);
    renderizarNomina();
    actualizarDashboardFinanciero();
    mostrarPerfilAlumno(alumno.id); // Refrescar el modal con los nuevos datos
  };
}
