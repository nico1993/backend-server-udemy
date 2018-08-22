let express = require('express');
let bcrypt = require('bcryptjs');
let jwt = require('jsonwebtoken');
let Usuario = require('../models/usuario');
let SEED = require('../config/config').SEED;
let app = express();

//Google
const { OAuth2Client } = require('google-auth-library');
let CLIENT_ID = require('../config/config').CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);

//==================================
// Autenticación de google
//==================================

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    // const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.img || payload.picture,
        google: true,
        payload
    };
}

app.post('/google', async(req, res) => {

    let token = req.body.token;

    let googleUser = await verify(token)
        .catch(e => {
            return res.status(403).json({
                ok: false,
                mensaje: 'Token no válido'
            });
        });
	
    Usuario.findOne({email: googleUser.email}, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error login',
                errors: err
            });
        }

        if (usuario) 
        {
            if(usuario.google === false)
            {
                res.status(400).json({
                    ok: false,
                    mensaje: 'Debe usar la autenticación normal'
                });
            }
            else
            {
                let tokenUser = jwt.sign({ usuario: usuario }, SEED, { expiresIn: 14400 }); //4 hs
                res.status(200).json({
                    ok: true,
                    usuario: usuario,
                    token: tokenUser
                });
            }
        }
        else
        {
            let usuario = new Usuario();
            usuario.nombre = googleUser.nombre;
            usuario.img = googleUser.img;
            usuario.email = googleUser.email;
            usuario.google = true;
            usuario.password = ":)";
			console.log(usuario);

            usuario.save((err, usuarioGuardado) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error login',
                        errors: err
                    });
                }

                let tokenUser = jwt.sign({ usuario: usuarioGuardado }, SEED, { expiresIn: 14400 }); //4 hs
                res.status(200).json({
                    ok: true,
                    usuario: usuarioGuardado,
                    token: tokenUser
                });
            });
        }
    });
});

//==================================
// Autenticación normal
//==================================
app.post('/', (req, res) => {

    let body = req.body;
    Usuario.findOne({ email: body.email }, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error login',
                errors: err
            });
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email'
            });
        }

        if (!bcrypt.compareSync(body.password, usuario.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password'
            });
        }

        usuario.password = ":)";
        let token = jwt.sign({ usuario: usuario }, SEED, { expiresIn: 14400 }); //4 hs
        res.status(200).json({
            ok: true,
            usuario: usuario,
            token: token,
            body
        });
    });
});

module.exports = app;