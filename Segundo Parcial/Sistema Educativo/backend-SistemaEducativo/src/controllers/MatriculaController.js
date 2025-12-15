import { Matricula } from "../models/Matricula.js";
import { Estudiante } from "../models/Estudiante.js";
import { Curso } from "../models/Curso.js";
import { Nota } from "../models/Nota.js";
import * as MatriculaService from "../services/MatriculaService.js";

// crear matrícula
export const crearMatricula = async (req, res) => {
    try {
        const { estudianteId, cursoId, fechaMatricula } = req.body;

        if (!estudianteId || !cursoId || !fechaMatricula) {
            return res.status(400).json({
                mensaje: "EstudianteId, cursoId y fechaMatricula son obligatorios"
            });
        }

        // Validar que estudiante existe y está activo
        const estudiante = await Estudiante.findByPk(estudianteId);
        if (!estudiante || estudiante.estado !== "activo") {
            return res.status(404).json({
                mensaje: "Estudiante no encontrado o inactivo"
            });
        }

        // Validar que curso existe
        const curso = await Curso.findByPk(cursoId);
        if (!curso) {
            return res.status(404).json({
                mensaje: "Curso no encontrado"
            });
        }

        // Validar que el estudiante no esté ya matriculado en este curso
        const matriculaExistente = await Matricula.findOne({
            where: { estudianteId, cursoId }
        });
        if (matriculaExistente) {
            return res.status(400).json({
                mensaje: "El estudiante ya está matriculado en este curso"
            });
        }

        // Validar cupo disponible (usa service para la lógica)
        await MatriculaService.validarCupoDisponible(cursoId);

        const nuevaMatricula = await Matricula.create({
            estudianteId,
            cursoId,
            fechaMatricula,
            estado: "activa"
        });

        res.status(201).json(nuevaMatricula);

    } catch (error) {
        console.error("Error al crear matrícula:", error);
        res.status(500).json({ mensaje: error.message });
    }
};

// obtener todas las matrículas
export const obtenerMatriculas = async (req, res) => {
    try {
        const { estudianteId, cursoId, periodo, estado } = req.query;

        const filtros = {};
        if (estado) filtros.estado = estado;
        if (estudianteId) filtros.estudianteId = estudianteId;
        if (cursoId) filtros.cursoId = cursoId;

        const include = [
            { model: Estudiante, as: "estudiante" },
            {
                model: Curso,
                as: "curso",
                where: periodo ? { periodoAcademico: periodo } : undefined
            }
        ];

        const matriculas = await Matricula.findAll({
            where: filtros,
            include
        });

        res.status(200).json(matriculas);

    } catch (error) {
        console.error("Error al obtener matrículas:", error);
        res.status(500).json({ mensaje: "Error al obtener matrículas" });
    }
};

// obtener una matrícula por id
export const obtenerMatricula = async (req, res) => {
    try {
        const matricula = await Matricula.findByPk(req.params.id, {
            include: [
                { model: Estudiante, as: "estudiante" },
                { model: Curso, as: "curso" },
                { model: Nota, as: "notas" }
            ]
        });

        if (!matricula) {
            return res.status(404).json({
                mensaje: "Matrícula no encontrada"
            });
        }

        res.status(200).json(matricula);

    } catch (error) {
        console.error("Error al obtener matrícula:", error);
        res.status(500).json({ mensaje: "Error al obtener matrícula" });
    }
};

// actualizar una matrícula
export const actualizarMatricula = async (req, res) => {
    try {
        const matricula = await Matricula.findByPk(req.params.id);

        if (!matricula) {
            return res.status(404).json({
                mensaje: "Matrícula no encontrada"
            });
        }

        const { cursoId, fechaMatricula, estado } = req.body;

        if (!cursoId && !fechaMatricula && !estado) {
            return res.status(400).json({
                mensaje: "Ingresar datos para actualizar"
            });
        }

        // Si se actualiza el curso, validar cupo (usa service para la lógica)
        if (cursoId && cursoId !== matricula.cursoId) {
            const nuevoCurso = await Curso.findByPk(cursoId);
            if (!nuevoCurso) {
                return res.status(404).json({
                    mensaje: "Curso no encontrado"
                });
            }

            await MatriculaService.validarCupoDisponible(cursoId, matricula.idMatricula);
        }

        if (cursoId) matricula.cursoId = cursoId;
        if (fechaMatricula) matricula.fechaMatricula = fechaMatricula;
        if (estado) matricula.estado = estado;

        await matricula.save();

        res.status(200).json(matricula);

    } catch (error) {
        console.error("Error al actualizar matrícula:", error);
        res.status(500).json({ mensaje: error.message });
    }
};

// eliminar una matrícula
export const eliminarMatricula = async (req, res) => {
    try {
        const matricula = await Matricula.findByPk(req.params.id, {
            include: [{ model: Nota, as: "notas" }]
        });

        if (!matricula) {
            return res.status(404).json({
                mensaje: "Matrícula no encontrada"
            });
        }

        // Verificar si tiene notas registradas
        if (matricula.notas && matricula.notas.length > 0) {
            return res.status(400).json({
                mensaje: "No se puede eliminar una matrícula con notas registradas"
            });
        }

        await matricula.destroy();

        res.status(204).send();

    } catch (error) {
        console.error("Error al eliminar matrícula:", error);
        res.status(500).json({ mensaje: "Error al eliminar matrícula", error: error.message });
    }
};

// obtener matrículas de un estudiante
export const obtenerMatriculasEstudiante = async (req, res) => {
    try {
        const estudiante = await Estudiante.findByPk(req.params.estudianteId);
        if (!estudiante) {
            return res.status(404).json({
                mensaje: "Estudiante no encontrado"
            });
        }

        const matriculas = await Matricula.findAll({
            where: { estudianteId: req.params.estudianteId },
            include: [{ model: Curso, as: "curso" }]
        });

        res.status(200).json(matriculas);

    } catch (error) {
        console.error("Error al obtener matrículas del estudiante:", error);
        res.status(500).json({ mensaje: "Error al obtener matrículas del estudiante" });
    }
};

// obtener matrículas de un curso
export const obtenerMatriculasCurso = async (req, res) => {
    try {
        const curso = await Curso.findByPk(req.params.cursoId);
        if (!curso) {
            return res.status(404).json({
                mensaje: "Curso no encontrado"
            });
        }

        const matriculas = await Matricula.findAll({
            where: { cursoId: req.params.cursoId },
            include: [{ model: Estudiante, as: "estudiante" }]
        });

        res.status(200).json(matriculas);

    } catch (error) {
        console.error("Error al obtener matrículas del curso:", error);
        res.status(500).json({ mensaje: "Error al obtener matrículas del curso" });
    }
};

// obtener resumen de matrículas (usa service para la lógica)
export const obtenerResumenMatriculas = async (req, res) => {
    try {
        const resumen = await MatriculaService.obtenerResumenMatriculas(req.params.cursoId);
        res.status(200).json(resumen);
    } catch (error) {
        console.error("Error al obtener resumen de matrículas:", error);
        res.status(404).json({ mensaje: error.message });
    }
};
