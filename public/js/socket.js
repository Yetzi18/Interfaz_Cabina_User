const socket = io(); // se conecta automáticamente al servidor

socket.on('nuevo_dato', (dato) => {
    console.log('Dato recibido:', dato);
    updateMeasuringTiles({
        bpm: dato.bpm,
        spo2: dato.spo2,
        temp: dato.temp,
    });
});