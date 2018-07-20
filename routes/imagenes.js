let express = require('express');

//Inicializar variables
let app = express();

const path = require('path');
let fs = require('fs');

app.get('/:tipo/:img', (req, res, next) => {
    let tipo = req.params.tipo;
    let img = req.params.img;
    let pathImagen = path.resolve(__dirname, `../uploads/${tipo}/${img}`);
    if(fs.existsSync(pathImagen))
    {
        res.sendFile(pathImagen);
    }
    else
    {
        let pathNoImg = path.resolve(__dirname, '../assets/no-img.jpg');
        res.sendFile(pathNoImg);
    }
});

module.exports = app;