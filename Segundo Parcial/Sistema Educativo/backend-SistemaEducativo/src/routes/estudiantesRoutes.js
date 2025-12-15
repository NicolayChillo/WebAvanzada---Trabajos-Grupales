import express from "express";
import {
    crearEstudiante,
    obtenerEstudiantes,
    obtenerEstudiante,
    actualizarEstudiante,
    eliminarEstudiante,
    obtenerNotasEstudiante,
    obtenerHistorialAcademico,
    buscarEstudiante
} from "../controllers/EstudianteController.js";

const router = express.Router();

// obtener todos los estudiantes
router.get("/", obtenerEstudiantes);

// buscar estudiante por término
router.get("/buscar/:termino", buscarEstudiante);

// obtener un estudiante por id
router.get("/:id", obtenerEstudiante);

// obtener notas de un estudiante
router.get("/:id/notas", obtenerNotasEstudiante);

// obtener historial académico de un estudiante
router.get("/:id/historial", obtenerHistorialAcademico);

// crear nuevo estudiante
router.post("/", crearEstudiante);

// actualizar estudiante
router.put("/:id", actualizarEstudiante);

// eliminar estudiante
router.delete("/:id", eliminarEstudiante);

export default router;
