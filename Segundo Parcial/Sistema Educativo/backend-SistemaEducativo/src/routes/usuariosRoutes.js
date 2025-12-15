import express from "express";
import {
    crearUsuario,
    obtenerUsuarios,
    obtenerUsuario,
    actualizarUsuario,
    eliminarUsuario,
    loginUsuario,
    buscarUsuario,
    resetPasswordByEmail
} from "../controllers/UsuarioController.js";

const router = express.Router();

// obtener todos los usuarios
router.get("/", obtenerUsuarios);

// buscar usuario por email
router.get("/buscar/:termino", buscarUsuario);

// obtener un usuario por id
router.get("/:id", obtenerUsuario);

// crear nuevo usuario
router.post("/", crearUsuario);

// login
router.post("/login", loginUsuario);

// actualizar contraseña por email
router.put("/reset-password", resetPasswordByEmail);

// actualizar usuario
router.put("/:id", actualizarUsuario);

// eliminar usuario
router.delete("/:id", eliminarUsuario);

export default router;
