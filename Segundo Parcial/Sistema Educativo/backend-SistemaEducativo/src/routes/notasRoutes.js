import express from "express";
import {
    crearNota,
    obtenerNotas,
    obtenerNota,
    actualizarNota,
    eliminarNota,
    calcularNotaParcial,
    calcularPromedioSemestre,
    obtenerEstadoAcademico,
    generarReporteAcademico
} from "../controllers/NotaController.js";

const router = express.Router();

// obtener todas las notas
router.get("/", obtenerNotas);

// obtener una nota por id
router.get("/:id", obtenerNota);

// calcular nota por parcial
router.get("/:matriculaId/parcial/:parcial/calcular", calcularNotaParcial);

// calcular promedio del semestre
router.get("/:matriculaId/promedio-semestre", calcularPromedioSemestre);

// obtener estado académico
router.get("/estudiante/:estudianteId/estado", obtenerEstadoAcademico);
router.get("/estudiante/:estudianteId/curso/:cursoId/estado", obtenerEstadoAcademico);

// generar reporte académico
router.get("/estudiante/:estudianteId/reporte", generarReporteAcademico);

// crear nueva nota
router.post("/", crearNota);

// actualizar nota
router.put("/:id", actualizarNota);

// eliminar nota
router.delete("/:id", eliminarNota);

export default router;
