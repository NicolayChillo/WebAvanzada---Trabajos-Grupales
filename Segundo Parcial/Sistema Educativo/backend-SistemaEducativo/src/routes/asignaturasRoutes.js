import express from "express";
import {
    crearAsignatura,
    obtenerAsignaturas,
    obtenerAsignatura,
    actualizarAsignatura,
    eliminarAsignatura,
    buscarAsignatura,
    obtenerAsignaturasPorNivel
} from "../controllers/AsignaturaController.js";

const router = express.Router();

// obtener todas las asignaturas
router.get("/", obtenerAsignaturas);

// buscar asignatura por código o nombre
router.get("/buscar/:termino", buscarAsignatura);

// obtener asignaturas por nivel
router.get("/nivel/:nivel", obtenerAsignaturasPorNivel);

// obtener una asignatura por id
router.get("/:id", obtenerAsignatura);

// crear nueva asignatura
router.post("/", crearAsignatura);

// actualizar asignatura
router.put("/:id", actualizarAsignatura);

// eliminar asignatura
router.delete("/:id", eliminarAsignatura);

export default router;
