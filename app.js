//Requires (importacion de librerias personalizadas)
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

//Inicializar variables
var app = express();

//Body parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Importar Rutas
let appRoutes = require('./routes/app');
let usuarioRoutes = require('./routes/usuario');
let loginRoutes = require('./routes/login');

//Conexion a la DB
var db = mongoose.connection;
mongoose.connect('mongodb://localhost/hospitalDB');
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log("Database: \x1b[32m%s\x1b[0m", 'online');  
});

//Rutas
app.use('/usuario', usuarioRoutes);
app.use('/login', loginRoutes);
app.use('/', appRoutes);

//Escuchar peticiones express
app.listen(3000, () => {
    console.log("Express server port 3000: \x1b[32m%s\x1b[0m", 'online');
});