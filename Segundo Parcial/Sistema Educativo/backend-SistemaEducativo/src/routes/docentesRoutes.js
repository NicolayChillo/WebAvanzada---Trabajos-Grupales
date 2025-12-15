import express from "express";
import {
    crearDocente,
    obtenerDocentes,
    obtenerDocente,
    actualizarDocente,
    eliminarDocente,
    buscarDocente,
    asignarMateria
} from "../controllers/DocenteController.js";

const router = express.Router();

// obtener todos los docentes
router.get("/", obtenerDocentes);

// buscar docente por término
router.get("/buscar/:termino", buscarDocente);

// obtener un docente por id
router.get("/:id", obtenerDocente);

// crear nuevo docente
router.post("/", crearDocente);

// actualizar docente
router.put("/:id", actualizarDocente);

// asignar materia a docente
router.post("/:id/asignar-materia", asignarMateria);

// eliminar docente
router.delete("/:id", eliminarDocente);

export default router;
