let express = require('express');

let fileUpload = require('express-fileupload');
let fs = require('fs');
//Inicializar variables
let app = express();

let Usuario = require('../models/usuario');
let Medico = require('../models/medico');
let Hospital = require('../models/hospital');

app.use(fileUpload());

app.put('/:tipo/:id', (req, res, next) => {

    let tipo = req.params.tipo;
    let id = req.params.id;

    //tipos de coleccion
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if(tiposValidos.indexOf(tipo) < 0)
    {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo no válido'
        });
    }

    if(!req.files)
    {
        return res.status(400).json({
            ok: false,
            mensaje: 'Seleccione un archivo'
        });
    }

    //Obtener nombre del archivo
    let archivo = req.files.imagen;
    let nombreCortado = archivo.name.split('.');
    let extension = nombreCortado[nombreCortado.length - 1];

    //Validar extensiones
    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if(extensionesValidas.indexOf(extension) < 0)
    {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extensión no válida'
        });
    }
    
    //Nombre de archivo personalizado
    let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;

    //Mover archivo tmp a un path
    let path = `./uploads/${tipo}/${nombreArchivo}`;

    archivo.mv(path, (err) => {
        if(err)
        {
            return res.status(500).json({
                ok: false,
                mensaje: err
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res, path);
        
    });
});

function subirPorTipo(tipo, id, nombreArchivo, res, pathNew)
{
    if(tipo == 'usuarios')
    {
        Usuario.findById(id, (err, usuario) => {
            if(!usuario)
            {
                if(fs.existsSync(pathNew))
                {
                    fs.unlinkSync(pathNew);
                }
                return res.status(400).json({
                    ok: false,
                    mensaje: "No existe el usuario"
                });
            }
            let pathOld = './uploads/usuarios/' + usuario.img;        
            //Si existe, borra la img vieja
            if(fs.existsSync(pathOld))
            {
                fs.unlinkSync(pathOld);
            }
            usuario.img = nombreArchivo;
            usuario.save((err, usuarioActualizado) => {
                usuarioActualizado.password = ":)";
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuarioActualizado
                });
            });
        });
    }
    if(tipo == 'medicos')
    {
        Medico.findById(id, (err, medico) => {
            if(!medico)
            {
                if(fs.existsSync(pathNew))
                {
                    fs.unlinkSync(pathNew);
                }
                return res.status(400).json({
                    ok: false,
                    mensaje: "No existe el medico"
                });
            }
            let pathOld = './uploads/medicos/' + medico.img;
            if(fs.existsSync(pathOld))
            {
                fs.unlinkSync(pathOld);
            }
            medico.img = nombreArchivo;
            medico.save((err, medicoActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico actualizada',
                    medicoActualizado
                });            
            });
        });
    }
    if(tipo == 'hospitales')
    {
        Hospital.findById(id, (err, hospital) => {
            if(!hospital)
            {
                fs.unlinkSync(pathNew);
                return res.status(400).json({
                    ok: false,
                    mensaje: "No existe el hospital"
                });
            }
            let pathOld = './uploads/hospitales/' + hospital.img;
            if(fs.existsSync(pathOld))
            {
                fs.unlinkSync(pathOld);
            }
            hospital.img = nombreArchivo;
            hospital.save((err, hospitalActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualizada',
                    hospitalActualizado
                });            
            });
        });
    }
}

module.exports = app;