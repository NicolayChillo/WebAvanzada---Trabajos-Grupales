import express from "express";
import {
    crearMatricula,
    obtenerMatriculas,
    obtenerMatricula,
    actualizarMatricula,
    eliminarMatricula,
    obtenerMatriculasEstudiante,
    obtenerMatriculasCurso,
    obtenerResumenMatriculas
} from "../controllers/MatriculaController.js";

const router = express.Router();

// obtener todas las matrículas
router.get("/", obtenerMatriculas);

// obtener una matrícula por id
router.get("/:id", obtenerMatricula);

// obtener matrículas de un estudiante
router.get("/estudiante/:estudianteId", obtenerMatriculasEstudiante);

// obtener matrículas de un curso
router.get("/curso/:cursoId", obtenerMatriculasCurso);

// obtener resumen de matrículas de un curso
router.get("/curso/:cursoId/resumen", obtenerResumenMatriculas);

// crear nueva matrícula
router.post("/", crearMatricula);

// actualizar matrícula
router.put("/:id", actualizarMatricula);

// eliminar matrícula
router.delete("/:id", eliminarMatricula);

export default router;
