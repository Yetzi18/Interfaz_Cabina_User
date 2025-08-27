// Estado en memoria (no persistente) para borrar al terminar
const state = {
    paciente: null,
    vitals: null,
    sintomas: [],
    prioridad: { nivel: "Bajo", causa: "" }
};

function goTo(id) {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    document.getElementById(id).classList.add("active");

    // Topbar visible salvo en bienvenida y registro
    const topbar = document.getElementById("topbar");
    if (id === "welcome" || id === "register") topbar.style.display = "none";
    else topbar.style.display = "flex";

    if (id === "measuring") startMeasurement();
    if (id === "results") showResults();
    if (id === "final") showPriority();
}

/* -------- Identificación (manual) -------- */
function submitRegister() {
    const rut = document.getElementById("rut").value.trim();
    const nombre = document.getElementById("nombre").value.trim();
    const apellido = document.getElementById("apellido").value.trim();
    const edadStr = document.getElementById("edad").value.trim();
    const genero = document.getElementById("genero").value;

    // Validaciones
    if (rut.length < 8 || rut.length > 9) { alert("El RUT/ID debe tener entre 8 y 9 caracteres."); return; }
    if (!nombre) { alert("Ingrese nombre(s)."); return; }
    if (!apellido) { alert("Ingrese apellido(s)."); return; }
    const edad = parseInt(edadStr, 10);
    if (isNaN(edad) || edad < 1 || edad > 120) { alert("La edad debe ser un número entre 1 y 120."); return; }
    if (!genero) { alert("Seleccione un género."); return; }

    state.paciente = { rut, nombre, apellido, edad, genero };

    const box = document.getElementById("identity-confirm");
    box.innerHTML = `<strong>Paciente:</strong> ${nombre} ${apellido}, ${edad} años – ${genero}`;
    box.classList.remove("hidden");

    // Pequeño delay para que lean y pasamos a instrucciones
    setTimeout(() => goTo("instructions"), 900);
}

// /* -------- Medición automática -------- */
// // En producción: remplazar simulateSensorStream por datos reales (WebSocket/Serial/API)
// function startMeasurement() {
//     // Reiniciar UI medición
//     document.getElementById("progress").style.width = "0%";
//     document.getElementById("progress-text").textContent = "0%";
//     document.getElementById("sensor-alert").classList.add("hidden");
//     ["m-temp","m-bp","m-hr","m-fr"].forEach(id => document.getElementById(id).textContent = "--");

//     let progress = 0;
//     const step = () => {
//         if (progress >= 100) {
//         // Al finalizar, guardamos vitals y avanzamos
//         goTo("results");
//         return;
//         }
//         progress += 10;
//         document.getElementById("progress").style.width = progress + "%";
//         document.getElementById("progress-text").textContent = progress + "%";

//         // Simular lectura parcial y alertas a mitad
//         if (progress === 50) {
//         document.getElementById("sensor-alert").classList.remove("hidden");
//         setTimeout(()=>document.getElementById("sensor-alert").classList.add("hidden"), 1500);
//         }
//         // Simular streaming de sensores
//         const partial = simulateSensorStream();
//         updateMeasuringTiles(partial);

//         setTimeout(step, 400);
//     };
//     step();
// }

function startMeasurement() {
    // Reiniciar UI
    document.getElementById("progress").style.width = "0%";
    document.getElementById("progress-text").textContent = "0%";
    ["m-temp","m-bpm","m-spo2"].forEach(id => document.getElementById(id).textContent = "--");

    // Simulamos solo la barra de progreso
    let progress = 0;
    const step = () => {
        if (progress >= 100) {
            goTo("results");
            return;
        }
        progress += 10;
        document.getElementById("progress").style.width = progress + "%";
        document.getElementById("progress-text").textContent = progress + "%";

        setTimeout(step, 400);
    };
    step();
}

// Ya no necesitamos simulateSensorStream ni simulateFinalVitals
// Los datos reales se reciben por socket y se muestran mediante updateMeasuringTiles()

function updateMeasuringTiles(v) {
    if (!v) return;

    // Temperatura
    document.getElementById("m-temp").textContent = v.temp !== undefined ? `${v.temp.toFixed(1)} °C` : "--";

    // Pulso / frecuencia cardíaca
    document.getElementById("m-bpm").textContent = v.bpm !== undefined ? `${v.bpm} BPM` : "--";

    // Saturación de oxígeno (SpO2)
    document.getElementById("m-spo2").textContent = v.spo2 !== undefined ? `${v.spo2} %` : "--";

    // Guardar en el estado
    state.vitals = v;
}

function showResults() {
    if (!state.vitals) return; // no hay datos

    const { temp, bpm, fr, spo2 } = state.vitals;
    const now = new Date();

    // Mostrar en la pantalla de resultados
    document.getElementById("res-temp").textContent = temp !== undefined ? `${temp.toFixed(1)} °C` : "--";
    document.getElementById("res-hr").textContent = bpm !== undefined ? `${bpm} BPM` : "--";
    document.getElementById("res-fr").textContent = fr !== undefined ? `${fr} rpm` : "--";

    // Fecha y hora
    document.getElementById("res-datetime").textContent = now.toLocaleString();

    // Calcular prioridad
    state.prioridad = evaluarPrioridad(state.vitals);
}


function showPriority() {
    const box = document.getElementById("priority-box");
    const span = document.getElementById("priority-level");
    const cause = document.getElementById("priority-cause");
    const nivel = state.prioridad.nivel; // "Bajo" | "Medio" | "Alto"

    span.textContent = nivel;
    cause.textContent = state.prioridad.causa || "";

    box.className = "priority " + (nivel === "Bajo" ? "low" : nivel === "Medio" ? "med" : "high");

    // Guardar síntomas (opcional) — solo en memoria para esta sesión
    const selected = [...document.querySelectorAll("#symptom-form input:checked")].map(i => i.value);
    state.sintomas = selected;
    }

    /* -------- Evaluación de prioridad (reglas simples) --------
    Reglas (ejemplo):
    - Alto (rojo): HR < 40 o > 130 | PAS >= 180 o PAD >= 120 | Temp >= 39.5 o <= 35 | FR >= 30 o <= 8
    - Medio (amarillo): HR 100–130 o 40–50 | PAS 140–179 o PAD 90–119 | Temp 38–39.4 | FR 21–29
    - Bajo (verde): resto
*/
function evaluarPrioridad(v) {
    let nivel = "Bajo";
    const motivos = [];

    if (v.hr < 40 || v.hr > 130) { nivel = "Alto"; motivos.push(`Pulso fuera de rango (${v.hr} BPM)`); }
    if (v.sys >= 180 || v.dia >= 120) { nivel = "Alto"; motivos.push(`Presión elevada (${v.sys}/${v.dia})`); }
    if (v.temp >= 39.5 || v.temp <= 35) { nivel = "Alto"; motivos.push(`Temperatura crítica (${v.temp.toFixed(1)} °C)`); }
    if (v.fr >= 30 || v.fr <= 8) { nivel = "Alto"; motivos.push(`FR alterada (${v.fr} rpm)`); }

    if (nivel !== "Alto") {
        if ((v.hr >= 100 && v.hr <= 130) || (v.hr >= 40 && v.hr <= 50)) { nivel = "Medio"; motivos.push(`Pulso en precaución (${v.hr} BPM)`); }
        if ((v.sys >= 140 && v.sys <= 179) || (v.dia >= 90 && v.dia <= 119)) { nivel = "Medio"; motivos.push(`Presión en precaución (${v.sys}/${v.dia})`); }
        if (v.temp >= 38 && v.temp < 39.5) { nivel = "Medio"; motivos.push(`Fiebre moderada (${v.temp.toFixed(1)} °C)`); }
        if (v.fr >= 21 && v.fr <= 29) { nivel = "Medio"; motivos.push(`FR elevada (${v.fr} rpm)`); }
    }

    return { nivel, causa: motivos.join(" · ") };
}

/* -------- Finalizar y limpiar datos -------- */
function finishAndReset() {
    // Borrar TODOS los datos de la sesión
    state.paciente = null;
    state.vitals = null;
    state.sintomas = [];
    state.prioridad = { nivel: "Bajo", causa: "" };

    // Limpiar formularios
    document.getElementById("register-form").reset();
    document.querySelectorAll("#symptom-form input").forEach(i => (i.checked = false));

    // Limpiar UI de medición / resultados
    ["m-temp","m-bp","m-hr","m-fr"].forEach(id => document.getElementById(id).textContent = "--");
    ["res-temp","res-bp","res-hr","res-fr"].forEach(id => document.getElementById(id).textContent = "--");
    document.getElementById("res-datetime").textContent = "";
    document.getElementById("identity-confirm").classList.add("hidden");

    // Volver a bienvenida
    goTo("welcome");
}

// /* ====== Simulación de sensores (reemplazar en producción) ====== */
// function simulateSensorStream() {
//     // Generamos valores cada tick dentro de rangos razonables
//     return {
//         temp: randRange(36.0, 37.5),
//         sys: Math.round(randRange(110, 150)),
//         dia: Math.round(randRange(70, 95)),
//         hr: Math.round(randRange(60, 105)),
//         fr: Math.round(randRange(12, 22)),
//         spo2: Math.round(randRange(94, 99))
//     };
// }
// function simulateFinalVitals() {
//     return {
//         temp: randRange(36.3, 37.2),
//         sys: Math.round(randRange(115, 130)),
//         dia: Math.round(randRange(75, 85)),
//         hr: Math.round(randRange(65, 95)),
//         fr: Math.round(randRange(12, 20)),
//         spo2: Math.round(randRange(95, 99))
//     };
// }
// function randRange(min, max) { return Math.random() * (max - min) + min; }

/* ====== Integración real con Raspberry (sustituir simulación) ======
    - WebSocket: abrir ws://<raspberry-ip>:<port> y recibir JSON {temp, sys, dia, hr, fr, spo2}
    - Serial/HTTP: consultar endpoint y llamar updateMeasuringTiles(data) en tiempo real.
    - Cuando se complete la medición desde hardware, setear state.vitals y goTo("results").
*/
