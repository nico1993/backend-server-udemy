var mongoose = require('mongoose');
let uniqueValidator = require('mongoose-unique-validator');

let rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol permitido'
};

var Schema = mongoose.Schema;

var usuarioSchema = new Schema({
    nombre: {type: String, required: [true, 'El nombre es requerido']},
    email: {type: String, unique: true, required: [true, 'El email es requerido']},
    password: {type: String, required: [true, 'La contraseña es requerida']},
    img: {type: String},
    role: {type: String, required: true, default: "USER_ROLE", enum: rolesValidos},
    google: {type: Boolean, default: false}
});

usuarioSchema.plugin(uniqueValidator, {message: '{PATH} debe ser único'});

module.exports = mongoose.model('Usuario', usuarioSchema);