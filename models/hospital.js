let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let hospitalSchema = new Schema({
    nombre: {type: String, required: [true, 'El nombre es requerido']},
    img: {type: String, required: false},
    usuario: {type: Schema.Types.ObjectId, ref: 'Usuario', required: [true, 'El usuario es requerido']}
}, {collection: 'hospitales'});

module.exports = mongoose.model('Hospital', hospitalSchema);