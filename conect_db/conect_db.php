<?php
    $host = "localhost";
    $user = "root";
    $password = "";
    $database = "iniciosesiondb";
    $conexion = mysqli_connect($host, $user, $password, $database);

    if (!$conexion) {
        echo "Error de conexión: " . mysqli_connect_error();
    }