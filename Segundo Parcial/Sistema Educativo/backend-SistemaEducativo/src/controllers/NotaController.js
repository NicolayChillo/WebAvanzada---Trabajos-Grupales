import { Nota } from "../models/Nota.js";
import { Matricula } from "../models/Matricula.js";
import { Docente } from "../models/Docente.js";
import { Curso } from "../models/Curso.js";
import { Estudiante } from "../models/Estudiante.js";
import * as NotaService from "../services/NotaService.js";

// crear nota
export const crearNota = async (req, res) => {
    try {
        const matriculaId = req.body.matriculaId ?? req.body.idMatricula;
        const { parcial, tipoEvaluacion, calificacion, docenteId, porcentaje, fechaEvaluacion } = req.body;

        if (!matriculaId || !parcial || !tipoEvaluacion || calificacion == null || !docenteId || porcentaje == null || !fechaEvaluacion) {
            return res.status(400).json({
                mensaje: "matriculaId, parcial, tipoEvaluacion, calificación, porcentaje, fechaEvaluacion y docenteId son obligatorios"
            });
        }

        // Validar que calificación esté entre 0 y 20
        if (calificacion < 0 || calificacion > 20) {
            return res.status(400).json({
                mensaje: "La calificación debe estar entre 0 y 20"
            });
        }

        if (porcentaje < 0 || porcentaje > 100) {
            return res.status(400).json({
                mensaje: "El porcentaje debe estar entre 0 y 100"
            });
        }

        // Validar parcial válido (1, 2, 3)
        if (![1, 2, 3].includes(parcial)) {
            return res.status(400).json({
                mensaje: "El parcial debe ser 1, 2 o 3"
            });
        }

        // Validar tipo de evaluación (solo 4 tipos permitidos según modelo)
        const TIPOS_EVALUACION_VALIDOS = ["examen", "tarea", "proyecto", "participacion"];
        if (!TIPOS_EVALUACION_VALIDOS.includes(tipoEvaluacion)) {
            return res.status(400).json({
                mensaje: "Tipo de evaluación inválido. Debe ser: examen, tarea, proyecto o participacion"
            });
        }

        // Validar que matrícula existe
        const matricula = await Matricula.findByPk(matriculaId);
        if (!matricula) {
            return res.status(404).json({
                mensaje: "Matrícula no encontrada"
            });
        }

        // Validar máximo 4 notas por parcial (una de cada tipo)
        const notasExistentes = await Nota.findOne({
            where: { matriculaId, parcial, tipoEvaluacion }
        });
        if (notasExistentes) {
            return res.status(400).json({
                mensaje: `Ya existe una evaluación de tipo ${tipoEvaluacion} para este parcial`
            });
        }

        // Validar que no haya más de 4 evaluaciones en este parcial
        const conteoNotas = await Nota.count({
            where: { matriculaId, parcial }
        });
        if (conteoNotas >= 4) {
            return res.status(400).json({
                mensaje: "Ya hay 4 evaluaciones registradas para este parcial"
            });
        }

        // Calcular aporte: usar el enviado o calcularlo con el porcentaje
        const aporteBase = req.body.aporte != null
            ? Number(req.body.aporte)
            : (calificacion * (porcentaje / 100));
        const aporte = Number(aporteBase.toFixed(2));

        const nuevaNota = await Nota.create({
            matriculaId,
            parcial,
            tipoEvaluacion,
            calificacion,
            docenteId,
            porcentaje,
            aporte,
            fechaEvaluacion
        });

        res.status(201).json(nuevaNota);

    } catch (error) {
        console.error("Error al crear nota:", error);
        res.status(500).json({ mensaje: "Error al crear nota", error: error.message });
    }
};

// obtener todas las notas
export const obtenerNotas = async (req, res) => {
    try {
        const { parcial, tipoEvaluacion, estudianteId, docenteId, cursoId } = req.query;

        const filtros = {};
        if (parcial) filtros.parcial = parcial;
        if (tipoEvaluacion) filtros.tipoEvaluacion = tipoEvaluacion;
        if (docenteId) filtros.docenteId = docenteId;

        const notas = await Nota.findAll({
            where: filtros,
            include: [
                {
                    model: Matricula,
                    as: "matricula",
                    where: estudianteId ? { estudianteId } : undefined,
                    include: [
                        { model: Estudiante, as: "estudiante" },
                        { model: Curso, as: "curso", where: cursoId ? { idCurso: cursoId } : undefined }
                    ]
                },
                { model: Docente, as: "docente" }
            ]
        });

        res.status(200).json(notas);

    } catch (error) {
        console.error("Error al obtener notas:", error);
        res.status(500).json({ mensaje: "Error al obtener notas" });
    }
};

// obtener una nota por id
export const obtenerNota = async (req, res) => {
    try {
        const nota = await Nota.findByPk(req.params.id, {
            include: [
                { 
                    model: Matricula, 
                    as: "matricula", 
                    include: [
                        { model: Estudiante, as: "estudiante" },
                        { model: Curso, as: "curso" }
                    ]
                },
                { model: Docente, as: "docente" }
            ]
        });

        if (!nota) {
            return res.status(404).json({
                mensaje: "Nota no encontrada"
            });
        }

        res.status(200).json(nota);

    } catch (error) {
        console.error("Error al obtener nota:", error);
        res.status(500).json({ mensaje: "Error al obtener nota" });
    }
};

// actualizar una nota
export const actualizarNota = async (req, res) => {
    try {
        const nota = await Nota.findByPk(req.params.id);

        if (!nota) {
            return res.status(404).json({
                mensaje: "Nota no encontrada"
            });
        }

        const { calificacion, tipoEvaluacion, porcentaje, fechaEvaluacion, aporte } = req.body;

        if (calificacion == null && tipoEvaluacion == null && porcentaje == null && fechaEvaluacion == null && aporte == null) {
            return res.status(400).json({
                mensaje: "Ingresar datos para actualizar"
            });
        }

        // Validar rango de calificación si se proporciona
        if (calificacion != null && (calificacion < 0 || calificacion > 20)) {
            return res.status(400).json({
                mensaje: "La calificación debe estar entre 0 y 20"
            });
        }

        if (porcentaje != null && (porcentaje < 0 || porcentaje > 100)) {
            return res.status(400).json({
                mensaje: "El porcentaje debe estar entre 0 y 100"
            });
        }

        if (calificacion != null) nota.calificacion = calificacion;
        if (tipoEvaluacion != null) nota.tipoEvaluacion = tipoEvaluacion;
        if (porcentaje != null) nota.porcentaje = porcentaje;
        if (fechaEvaluacion != null) nota.fechaEvaluacion = fechaEvaluacion;

        // Recalcular aporte si cambia calificación, porcentaje o se envía aporte explícito
        if (aporte != null || calificacion != null || porcentaje != null) {
            if (aporte != null) {
                nota.aporte = Number(Number(aporte).toFixed(2));
            } else {
                const cal = calificacion != null ? calificacion : nota.calificacion;
                const porc = porcentaje != null ? porcentaje : nota.porcentaje;
                const base = cal * (porc / 100);
                nota.aporte = Number(base.toFixed(2));
            }
        }

        await nota.save();

        res.status(200).json(nota);

    } catch (error) {
        console.error("Error al actualizar nota:", error);
        res.status(500).json({ mensaje: "Error al actualizar nota", error: error.message });
    }
};

// eliminar una nota
export const eliminarNota = async (req, res) => {
    try {
        const nota = await Nota.findByPk(req.params.id);

        if (!nota) {
            return res.status(404).json({
                mensaje: "Nota no encontrada"
            });
        }

        await nota.destroy();

        res.status(204).send();

    } catch (error) {
        console.error("Error al eliminar nota:", error);
        res.status(500).json({ mensaje: "Error al eliminar nota", error: error.message });
    }
};

// calcular nota por parcial (usa service para la lógica)
export const calcularNotaParcial = async (req, res) => {
    try {
        const { matriculaId, parcial } = req.params;
        const resultado = await NotaService.calcularNotaParcial(matriculaId, parcial);
        res.status(200).json(resultado);
    } catch (error) {
        console.error("Error al calcular nota parcial:", error);
        res.status(500).json({ mensaje: error.message });
    }
};

// calcular promedio del semestre (usa service para la lógica)
export const calcularPromedioSemestre = async (req, res) => {
    try {
        const { matriculaId } = req.params;
        const promedio = await NotaService.calcularPromedioSemestre(matriculaId);
        res.status(200).json(promedio);
    } catch (error) {
        console.error("Error al calcular promedio:", error);
        res.status(500).json({ mensaje: error.message });
    }
};

// obtener estado académico (usa service para la lógica)
export const obtenerEstadoAcademico = async (req, res) => {
    try {
        const { estudianteId, cursoId } = req.params;
        const estado = await NotaService.obtenerEstadoAcademico(estudianteId, cursoId);
        res.status(200).json(estado);
    } catch (error) {
        console.error("Error al obtener estado académico:", error);
        res.status(404).json({ mensaje: error.message });
    }
};

// generar reporte académico (usa service para la lógica)
export const generarReporteAcademico = async (req, res) => {
    try {
        const { estudianteId } = req.params;
        const reporte = await NotaService.generarReporteAcademico(estudianteId);
        res.status(200).json(reporte);
    } catch (error) {
        console.error("Error al generar reporte:", error);
        res.status(500).json({ mensaje: error.message });
    }
};
