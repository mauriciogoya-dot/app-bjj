# 🥋 Carceglia Team Pretorianos | Sistema de Gestión Integral

Aplicación web frontend (SPA) desarrollada a medida para la gestión integral, control de asistencias por turnos y administración financiera de la academia de Brazilian Jiu-Jitsu **Carceglia Team Pretorianos**.

🔗 **Sitio en vivo (GitHub Pages):** [Ver Aplicación en Producción](https://mauriciogoya-dot.github.io/app-bjj/)

---

## 🚀 Características Principales

* **📊 Dashboard & Finanzas Mensuales:** 
  * Panel global con estadísticas en tiempo real (total de alumnos, activos, inactivos y cuotas al día).
  * Calculadora financiera automática del mes seleccionado para el desglose de ingresos brutos, pago por alquiler/servicios al propietario y cálculo de la ganancia neta.
* **📝 Registro e Inscripción de Alumnos:**
  * Formulario completo para altas de nuevos practicantes con datos de contacto, fecha de nacimiento, condición, cinturón y grados (tiras).
* **👥 Nómina y Control de Cuotas:**
  * Tabla general interactiva con estados de cuota mensuales dinámicos (*Pendiente*, *Pago Parcial*, *Al día*).
  * Perfiles individuales modales con historial de asistencias, notas, seminarios y torneos.
* **📅 Control de Asistencias por Turno:**
  * Sistema de fichaje diario avanzado que permite registrar asistencias filtrando por fecha y turno específico (*Turno Mañana*, *Tarde*, *Noche*, *Competencia*).
  * Conteo acumulativo histórico para el seguimiento de graduación de cada alumno.

---

## 🛠️ Tecnologías Utilizadas

* **HTML5 / CSS3** estructurado de manera semántica.
* **Tailwind CSS (vía CDN)** para un diseño moderno, responsivo y adaptado al modo oscuro (*dark theme*).
* **JavaScript Moderno (ES6 Modules)** aplicando Programación Orientada a Objetos (POO) con clases separadas (`Alumno`, `Asistencia`).
* **localStorage** para la persistencia local de datos de forma segura en el navegador.
* **GitHub Pages** para despliegue e integración continua.

---

## 💻 Instalación y Uso Local

Si deseas clonar y probar el proyecto de manera local en tu equipo:

1. Clona el repositorio:
   ```bash
   git clone [https://github.com/mauriciogoya-dot/app-bjj.git](https://github.com/mauriciogoya-dot/app-bjj.git)
