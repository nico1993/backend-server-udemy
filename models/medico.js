let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let medicoSchema = new Schema({
    nombre: {type: String, required: [true, 'El nombre es requerido']},
    img: {type: String, required: false},
    usuario: {type: Schema.Types.ObjectId, ref: 'Usuario', required: [true, 'El usuario es requerido']},
    hospital: {type: Schema.Types.ObjectId, ref: 'Hospital', required: [true, 'El hospital es requerido']}
});

module.exports = mongoose.model('Medico', medicoSchema);