let express = require('express');
let middleAutenticacion = require('../middlewares/autenticacion');
let app = express();

let Medico = require('../models/medico');

//=============================================
//Obtener todos los medicos
//=============================================
app.get('/', (req, res, next) => {

    let offset = req.query.offset || 0;
    offset = Number(offset); 

    Medico.find({})
        .skip(offset)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec(
            (err, medicos) => {
                if(err)
                {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando medicos',
                        errors: err
                    });
                }
                Medico.count({}, (err, count) => {
                    res.status(200).json({
                        ok: true,
                        medicos: medicos,
                        total: count
                    });
                });
            }
        )
});

//=============================================
//Crear nuevo medico
//=============================================
app.post('/', middleAutenticacion.verificaToken, (req, res) => {
    let body = req.body;
    let userSession = req.usuario;
    let medico = new Medico({
        nombre: body.nombre,
        usuario: userSession._id,
        hospital: body.hospitalId
    });
    
    medico.save((err, medicoGuardado) =>{
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear medico',
                errors: err
            });
        }            
        res.status(201).json({
            ok: true,
            medico: medicoGuardado,
            usuarioToken: req.usuario
        });
    })
});

//=============================================
//Actualizar medico
//=============================================
app.put('/:id', middleAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) 
    {
        return res.status(400).json({
            ok: false,
            mensaje: 'Id incorrecto'
        });    
    }

    Medico.findById(id, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico',
                errors: err
            });
        }
        if(!medico)
        {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe el medico'
            });
        }

        let body = req.body;
        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospitalId;

        medico.save((err, medicoGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico',
                    errors: err
                });
            }            
            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });
        });
    });
});

//=============================================
//Borrar medico
//=============================================
app.delete('/:id', middleAutenticacion.verificaToken, (req, res) => {
    let id = req.params.id;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) 
    {
        return res.status(400).json({
            ok: false,
            mensaje: 'Id incorrecto'
        });    
    }

    Medico.findByIdAndRemove(id, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar medico',
                errors: err
            });
        }      
        
        if(!medico)
        {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe el medico'
            });    
        }
        res.status(200).json({
            ok: true,
            medico: medico
        });        
    });
});

module.exports = app;