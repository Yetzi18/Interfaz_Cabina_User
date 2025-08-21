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
