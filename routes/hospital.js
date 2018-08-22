let express = require('express');
let middleAutenticacion = require('../middlewares/autenticacion');
let app = express();

let Hospital = require('../models/hospital');

//=============================================
//Obtener todos los hospitales
//=============================================
app.get('/', (req, res, next) => {

    let offset = req.query.offset || 0;
    offset = Number(offset); 

    Hospital.find({})
        .skip(offset)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec(
            (err, hospitales) => {
                if(err)
                {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando hospitales',
                        errors: err
                    });
                }
                Hospital.count({}, (err, count) => {
                    res.status(200).json({
                        ok: true,
                        hospitales: hospitales,
                        total: count
                    });
                });
            }
        )
});

//=============================================
//Obtener hospital por ID
//=============================================
app.get('/:id', (req, res) => {
    let id = req.params.id;
    Hospital.findById(id)
        .populate('usuario', 'nombre img email')
        .exec((err, hospital) => {
            if(err)
            {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar hospital',
                    errors: err    
                });
            }
            if(!hospital)
            {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El hospital con el id ' + id + ' no existe',
                    errors: {
                        message: 'No existe el hospital con ese ID'
                    }        
                });
            }

            res.status(200).json({
                ok: true,
                hospital: hospital
            })
        })
});


//=============================================
//Crear nuevo hospital
//=============================================
app.post('/', middleAutenticacion.verificaToken, (req, res) => {
    let body = req.body;
    let userSession = req.usuario;
    let hospital = new Hospital({
        nombre: body.nombre,
        usuario: userSession._id
    });
    
    hospital.save((err, hospitalGuardado) =>{
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                errors: err
            });
        }            
        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado,
            usuarioToken: req.usuario
        });
    })
});

//=============================================
//Actualizar hospital
//=============================================
app.put('/:id', middleAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;

    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        }
        if(!hospital)
        {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe el hospital'
            });
        }

        let body = req.body;
        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;

        hospital.save((err, hospitalGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                });
            }            
            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });
        });
    });
});

//=============================================
//Borrar hospital
//=============================================
app.delete('/:id', middleAutenticacion.verificaToken, (req, res) => {
    let id = req.params.id;
    Hospital.findByIdAndRemove(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                errors: err
            });
        }      
        
        if(!hospital)
        {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe el hospital'
            });    
        }
        res.status(200).json({
            ok: true,
            hospital: hospital
        });        
    });
});

module.exports = app;