import { Curso } from "../models/Curso.js";
import { Asignatura } from "../models/Asignatura.js";
import { Docente } from "../models/Docente.js";
import { Matricula } from "../models/Matricula.js";
import { Estudiante } from "../models/Estudiante.js";
import { Op } from "sequelize";

// crear curso
export const crearCurso = async (req, res) => {
    try {
        const { nrc, periodoAcademico, cupoMaximo, asignaturaId, docenteId } = req.body;

        if (!nrc || !periodoAcademico || !cupoMaximo || !asignaturaId || !docenteId) {
            return res.status(400).json({
                mensaje: "Todos los campos son obligatorios"
            });
        }

        // Validar NRC único
        const cursoExistente = await Curso.findOne({ where: { nrc } });
        if (cursoExistente) {
            return res.status(400).json({
                mensaje: "Ya existe un curso con este NRC"
            });
        }

        // Validar que asignatura existe
        const asignatura = await Asignatura.findByPk(asignaturaId);
        if (!asignatura) {
            return res.status(404).json({
                mensaje: "Asignatura no encontrada"
            });
        }

        // Validar que docente existe
        const docente = await Docente.findByPk(docenteId);
        if (!docente) {
            return res.status(404).json({
                mensaje: "Docente no encontrado"
            });
        }

        const nuevoCurso = await Curso.create({
            nrc,
            periodoAcademico,
            cupoMaximo,
            asignaturaId,
            docenteId
        });

        res.status(201).json(nuevoCurso);

    } catch (error) {
        console.error("Error al crear curso:", error);
        res.status(500).json({ mensaje: "Error al crear curso", error: error.message });
    }
};

// obtener todos los cursos
export const obtenerCursos = async (req, res) => {
    try {
        const { periodo, docenteId, asignaturaId } = req.query;

        const filtros = {};
        if (periodo) filtros.periodoAcademico = periodo;
        if (docenteId) filtros.docenteId = docenteId;
        if (asignaturaId) filtros.asignaturaId = asignaturaId;

        const cursos = await Curso.findAll({
            where: filtros,
            include: [
                { model: Asignatura, as: "asignatura" },
                { model: Docente, as: "docente" },
                { model: Matricula, as: "matriculas" }
            ]
        });

        res.status(200).json(cursos);

    } catch (error) {
        console.error("Error al obtener cursos:", error);
        res.status(500).json({ mensaje: "Error al obtener cursos" });
    }
};

// obtener un curso por id
export const obtenerCurso = async (req, res) => {
    try {
        const curso = await Curso.findByPk(req.params.id, {
            include: [
                { model: Asignatura, as: "asignatura" },
                { model: Docente, as: "docente" },
                { model: Matricula, as: "matriculas" }
            ]
        });

        if (!curso) {
            return res.status(404).json({
                mensaje: "Curso no encontrado"
            });
        }

        res.status(200).json(curso);

    } catch (error) {
        console.error("Error al obtener curso:", error);
        res.status(500).json({ mensaje: "Error al obtener curso" });
    }
};

// actualizar un curso
export const actualizarCurso = async (req, res) => {
    try {
        const curso = await Curso.findByPk(req.params.id);

        if (!curso) {
            return res.status(404).json({
                mensaje: "Curso no encontrado"
            });
        }

        const { nrc, periodoAcademico, cupoMaximo, asignaturaId, docenteId } = req.body;

        if (!nrc && !periodoAcademico && !cupoMaximo && !asignaturaId && !docenteId) {
            return res.status(400).json({
                mensaje: "Ingresar datos para actualizar"
            });
        }

        // Validar NRC único si se actualiza
        if (nrc && nrc !== curso.nrc) {
            const nrcExistente = await Curso.findOne({ where: { nrc } });
            if (nrcExistente) {
                return res.status(400).json({
                    mensaje: "El NRC ya está registrado"
                });
            }
        }

        if (nrc) curso.nrc = nrc;
        if (periodoAcademico) curso.periodoAcademico = periodoAcademico;
        if (cupoMaximo) curso.cupoMaximo = cupoMaximo;
        if (asignaturaId) curso.asignaturaId = asignaturaId;
        if (docenteId) curso.docenteId = docenteId;

        await curso.save();

        res.status(200).json(curso);

    } catch (error) {
        console.error("Error al actualizar curso:", error);
        res.status(500).json({ mensaje: "Error al actualizar curso", error: error.message });
    }
};

// eliminar un curso
export const eliminarCurso = async (req, res) => {
    try {
        const curso = await Curso.findByPk(req.params.id, {
            include: [{ model: Matricula, as: "matriculas" }]
        });

        if (!curso) {
            return res.status(404).json({
                mensaje: "Curso no encontrado"
            });
        }

        // Verificar si tiene matrículas
        if (curso.matriculas && curso.matriculas.length > 0) {
            return res.status(400).json({
                mensaje: "No se puede eliminar un curso con matrículas registradas"
            });
        }

        await curso.destroy();

        res.status(204).send();

    } catch (error) {
        console.error("Error al eliminar curso:", error);
        res.status(500).json({ mensaje: "Error al eliminar curso", error: error.message });
    }
};

// obtener estudiantes de un curso
export const obtenerEstudiantesCurso = async (req, res) => {
    try {
        const curso = await Curso.findByPk(req.params.id, {
            include: [{
                model: Matricula,
                as: "matriculas",
                include: [{ model: Estudiante, as: "estudiante" }]
            }]
        });

        if (!curso) {
            return res.status(404).json({
                mensaje: "Curso no encontrado"
            });
        }

        const estudiantes = (curso.matriculas || []).map(m => m.estudiante);
        res.status(200).json(estudiantes);

    } catch (error) {
        console.error("Error al obtener estudiantes del curso:", error);
        res.status(500).json({ mensaje: "Error al obtener estudiantes del curso" });
    }
};

// obtener cursos por periodo
export const obtenerCursosPorPeriodo = async (req, res) => {
    try {
        const cursos = await Curso.findAll({
            where: { periodoAcademico: req.params.periodo },
            include: [
                { model: Asignatura, as: "asignatura" },
                { model: Docente, as: "docente" },
                { model: Matricula, as: "matriculas" }
            ]
        });

        res.status(200).json(cursos);

    } catch (error) {
        console.error("Error al obtener cursos por periodo:", error);
        res.status(500).json({ mensaje: "Error al obtener cursos por periodo" });
    }
};

// buscar curso
export const buscarCurso = async (req, res) => {
    try {
        const cursos = await Curso.findAll({
            where: {
                [Op.or]: [
                    { nrc: { [Op.like]: `%${req.params.termino}%` } }
                ]
            },
            include: [
                { model: Asignatura, as: "asignatura" },
                { model: Docente, as: "docente" }
            ]
        });

        res.status(200).json(cursos);

    } catch (error) {
        console.error("Error al buscar curso:", error);
        res.status(500).json({ mensaje: "Error al buscar curso" });
    }
};
