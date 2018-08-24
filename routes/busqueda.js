var express = require('express');

//Inicializar variables
var app = express();

let Hospital = require('../models/hospital');
let Medico = require('../models/medico');
let Usuario = require('../models/usuario');

app.get('/coleccion/:tabla/:busqueda', (req, res, next) => {
    let tabla = req.params.tabla;
    let busqueda = req.params.busqueda;
    let regExp = new RegExp(busqueda, 'i');
    let promesa;
    switch(tabla)
    {
        case 'medico':
            promesa = buscarMedicos(regExp);
            break;
        case 'hospital':
            promesa = buscarHospitales(regExp);
            break;
        case 'usuario':
            promesa = buscarUsuarios(regExp);
            break;
        default:
            return res.status(404).json({
                ok: false
            });
            break;
    }
    promesa.then(data => {
        res.status(200).json({
            ok: true,
            [tabla]: data
        });
    });
});

app.get('/todo/:busqueda', (req, res, next) => {

    let busqueda = req.params.busqueda;
    let regExp = new RegExp(busqueda, 'i');

    Promise.all([
        buscarHospitales(regExp),
        buscarMedicos(regExp),
        buscarUsuarios(regExp)
    ]).then(response => {
        res.status(200).json({
            ok: true,
            hospitales: response[0],
            medicos: response[1],
            usuarios: response[2],
        });
    });
});

function buscarHospitales(regExp) {
    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: regExp })
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => {
            if (err) {
                reject("Error al buscar hospitales");
            }
            else {
                resolve(hospitales);
            }
        });
    });
}

function buscarMedicos(regExp) {
    return new Promise((resolve, reject) => {
        Medico.find({ nombre: regExp })
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec((err, medicos) => {
                if (err) {
                    reject("Error al buscar hospitales");
                }
                else {
                    resolve(medicos);
                }
            });
    });
}

function buscarUsuarios(regExp) {
    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre email role img')
        .or([
            {nombre: regExp},
            {email: regExp}
        ])
        .exec((err, usuarios) => {
            if(err)
            {
                reject("Error al cargar usuarios", err);
            }
            else
            {
                resolve(usuarios);
            }
        });
    });
}

module.exports = app;