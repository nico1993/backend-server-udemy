//Requires (importacion de librerias personalizadas)
var express = require('express');
var mongoose = require('mongoose');

//Inicializar variables
var app = express();

//Conexion a la DB
var db = mongoose.connection;
mongoose.connect('mongodb://localhost/hospitalDB');
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log("Database: \x1b[32m%s\x1b[0m", 'online');  
});

//Rutas
app.get('/', (req, res, next) => {
    res.status(403).json({
        ok: true,
        mensaje: 'Peticion realizada correctamente'
    });
});

//Escuchar peticiones express
app.listen(3000, () => {
    console.log("Express server port 3000: \x1b[32m%s\x1b[0m", 'online');
});