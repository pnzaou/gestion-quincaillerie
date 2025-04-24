import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    nom: {type: String, required: true},
    prenom: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    role: {type: String, enum: ["admin", "gerant", "comptable"], required: true, default: "gerant"},
    status: {type: String, enum: ["actif", "suspendu"], default: "actif"},
    isDefaultPasswordChanged: {type: Boolean, default: false}
}, {
    timestamps: true
})

const User = mongoose.models.User || mongoose.model("User", userSchema)

export default User