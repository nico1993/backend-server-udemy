let jwt = require('jsonwebtoken');
let SEED = require('../config/config').SEED;

//=============================================
//Verificar token
//=============================================
exports.verificaToken = function(req, res, next)
{
    let token = req.query.token;
    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto'
            });
        }
        req.usuario = decoded.usuario;
        next();       
    });
}

//=============================================
//Verificar admin role
//=============================================
exports.verificaAdminRole = function(req, res, next)
{
    var usuario = req.usuario;
    if(usuario.role === 'ADMIN_ROLE')
    {
        next();
        return;
    }

    return res.status(401).json({
        ok: false,
        mensaje: 'Token incorrecto - no es administrador'
    });
}

//=============================================
//Verificar admin o mismo usuario
//=============================================
exports.verificaAdminOMismoUsuario = function(req, res, next)
{
    var usuario = req.usuario;
    var id = req.params.id;

    if(usuario.role === 'ADMIN_ROLE' || usuario._id === id)
    {
        next();
        return;
    }

    return res.status(401).json({
        ok: false,
        mensaje: 'Token incorrecto - no es administrador ni es el mismo usuario'
    });
}