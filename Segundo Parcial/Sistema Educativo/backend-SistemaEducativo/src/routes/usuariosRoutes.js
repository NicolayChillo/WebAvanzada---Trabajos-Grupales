import express from "express";
import {
    crearUsuario,
    obtenerUsuarios,
    obtenerUsuario,
    actualizarUsuario,
    eliminarUsuario,
    loginUsuario,
    buscarUsuario
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

// actualizar usuario
router.put("/:id", actualizarUsuario);

// eliminar usuario
router.delete("/:id", eliminarUsuario);

export default router;
