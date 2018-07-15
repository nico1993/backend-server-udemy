var express = require('express');
var bcrypt = require('bcryptjs');
let jwt = require('jsonwebtoken');
let middleAutenticacion = require('../middlewares/autenticacion');
var app = express();

let Usuario = require('../models/usuario');

//=============================================
//Obtener todos los usuarios
//=============================================
app.get('/', (req, res, next) => {
    Usuario.find({}, 'nombre email img role')
        .exec(
            (err, usuarios) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando usuarios',
                        errors: err
                    });
                }
                res.status(200).json({
                    ok: true,
                    usuarios: usuarios
                });
            })
});

//=============================================
//Actualizar nuevo usuario
//=============================================
app.put('/:id', middleAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;

    Usuario.findById(id, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }
        if(!usuario)
        {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe el usuario'
            });
        }

        let body = req.body;
        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            }            
            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });
        });
    });
});

//=============================================
//Crear nuevo usuario
//=============================================
app.post('/', middleAutenticacion.verificaToken, (req, res) => {
    let body = req.body;
    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role         
    });

    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            });
        }            
        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
        });
    });
});

//=============================================
//Borrar usuario
//=============================================
app.delete('/:id', middleAutenticacion.verificaToken, (req, res) => {
    let id = req.params.id;
    Usuario.findByIdAndRemove(id, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                errors: err
            });
        }      
        
        if(!usuario)
        {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe el usuario'
            });    
        }
        res.status(200).json({
            ok: true,
            usuario: usuario
        });        
    });
});

module.exports = app;