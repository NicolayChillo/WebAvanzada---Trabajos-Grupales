import express from "express";
import {
    crearCurso,
    obtenerCursos,
    obtenerCurso,
    actualizarCurso,
    eliminarCurso,
    obtenerEstudiantesCurso,
    obtenerCursosPorPeriodo,
    buscarCurso,
    obtenerPromediosCurso
} from "../controllers/CursoController.js";

const router = express.Router();

// obtener todos los cursos
router.get("/", obtenerCursos);

// buscar curso por NRC
router.get("/buscar/:termino", buscarCurso);

// obtener cursos por período
router.get("/periodo/:periodo", obtenerCursosPorPeriodo);

// obtener un curso por id
router.get("/:id", obtenerCurso);

// obtener estudiantes de un curso
router.get("/:id/estudiantes", obtenerEstudiantesCurso);

// obtener promedios de un curso
router.get("/:id/promedios", obtenerPromediosCurso);

// crear nuevo curso
router.post("/", crearCurso);

// actualizar curso
router.put("/:id", actualizarCurso);

// eliminar curso
router.delete("/:id", eliminarCurso);

export default router;
