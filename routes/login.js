let express = require('express');
let bcrypt = require('bcryptjs');
let jwt = require('jsonwebtoken');
let Usuario = require('../models/usuario');
let SEED = require('../config/config').SEED;
let app = express();

app.post('/', (req, res) => {

    let body = req.body;
    Usuario.findOne({email: body.email}, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error login',
                errors: err
            });
        }      
        
        if(!usuario)
        {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email'
            });    
        }

        if(!bcrypt.compareSync(body.password, usuario.password))    
        {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password'
            });  
        }

        usuario.password = ":)";
        let token = jwt.sign({usuario: usuario}, SEED, {expiresIn: 14400}); //4 hs
        res.status(200).json({
            ok: true,
            usuario: usuario,
            token: token,
            body
        }); 
    });
});

module.exports = app;