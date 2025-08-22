function goTo(id) {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    document.getElementById(id).classList.add("active");

  // mostrar/ocultar barra superior
    const topbar = document.getElementById("topbar");
    if(id === "welcome") {
        topbar.style.display = "none";
    } else {
        topbar.style.display = "flex";
    }

    // Simulación sensores
    if(id === "vitals") {
        setTimeout(()=>{
        document.getElementById("temp").textContent = "36.5 °C";
        document.getElementById("hr").textContent = "80 BPM";
        document.getElementById("spo2").textContent = "95 %SpO2";
        document.getElementById("bp").textContent = "120/80 mmHg";
        }, 1000);
    }
}

function submitRegister() {
    const rut = document.getElementById("rut").value.trim();
    const nombre = document.getElementById("nombre").value.trim();
    const apellido = document.getElementById("apellido").value.trim();
    const edad = document.getElementById("edad").value.trim();
    const sexo = document.getElementById("sexo").value;

    // Validación RUT
    if(rut.length < 8 || rut.length > 9) {
        alert("El RUT debe tener entre 8 y 9 caracteres.");
        return;
    }

    // Validación Nombre y Apellido
    if(!nombre) {
        alert("El campo Nombre es obligatorio.");
        return;
    }
    if(!apellido) {
        alert("El campo Apellido es obligatorio.");
        return;
    }

    // Validación Edad
    const edadNum = parseInt(edad, 10);
    if(isNaN(edadNum) || edadNum < 1 || edadNum > 120) {
        alert("La edad debe ser un número entre 1 y 120.");
        return;
    }

    // Validación Sexo
    if(!sexo) {
        alert("Seleccione un sexo.");
        return;
    }

    // Guardar en memoria (simulación)
    localStorage.setItem("paciente", JSON.stringify({
        rut, 
        nombre, 
        apellido, 
        edad: edadNum, 
        sexo
    }));

    goTo("vitals");
}
