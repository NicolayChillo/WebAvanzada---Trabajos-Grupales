import { Docente } from "../models/Docente.js";
import { Usuario } from "../models/Usuario.js";
import { Curso } from "../models/Curso.js";
import { Asignatura } from "../models/Asignatura.js";
import { Op } from "sequelize";

// crear docente
export const crearDocente = async (req, res) => {
    try {
        const { usuarioId, nombreDocente, titulo, especialidad, cargaHoraria } = req.body;

        if (!usuarioId || !nombreDocente || !titulo || !especialidad || !cargaHoraria) {
            return res.status(400).json({
                mensaje: "Todos los campos son obligatorios"
            });
        }

        // Validar carga horaria
        if (cargaHoraria < 1 || cargaHoraria > 40) {
            return res.status(400).json({
                mensaje: "La carga horaria debe estar entre 1 y 40 horas"
            });
        }

        // Validar que usuario exista
        const usuario = await Usuario.findByPk(usuarioId);
        if (!usuario) {
            return res.status(404).json({
                mensaje: "Usuario no encontrado"
            });
        }

        const nuevoDocente = await Docente.create({
            usuarioId,
            nombreDocente,
            titulo,
            especialidad,
            cargaHoraria
        });

        res.status(201).json(nuevoDocente);

    } catch (error) {
        console.error("Error al crear docente:", error);
        res.status(500).json({ mensaje: "Error al crear docente", error: error.message });
    }
};

// obtener todos los docentes
export const obtenerDocentes = async (_req, res) => {
    try {
        const docentes = await Docente.findAll({
            include: [
                { model: Usuario, attributes: { exclude: ["password"] } },
                { model: Curso, as: "cursos", include: [{ model: Asignatura, as: "asignatura" }] }
            ]
        });
        res.status(200).json(docentes);
    } catch (error) {
        console.error("Error al obtener docentes:", error);
        res.status(500).json({ mensaje: "Error al obtener docentes" });
    }
};

// obtener un docente por id
export const obtenerDocente = async (req, res) => {
    try {
        const docente = await Docente.findByPk(req.params.id, {
            include: [
                { model: Usuario, attributes: { exclude: ["password"] } },
                { model: Curso, as: "cursos", include: [{ model: Asignatura, as: "asignatura" }] }
            ]
        });

        if (!docente) {
            return res.status(404).json({
                mensaje: "Docente no encontrado"
            });
        }

        res.status(200).json(docente);

    } catch (error) {
        console.error("Error al obtener docente:", error);
        res.status(500).json({ mensaje: "Error al obtener docente" });
    }
};

// actualizar un docente
export const actualizarDocente = async (req, res) => {
    try {
        const docente = await Docente.findByPk(req.params.id);

        if (!docente) {
            return res.status(404).json({
                mensaje: "Docente no encontrado"
            });
        }

        const { nombreDocente, titulo, especialidad, cargaHoraria } = req.body;

        if (!nombreDocente && !titulo && !especialidad && !cargaHoraria) {
            return res.status(400).json({
                mensaje: "Ingresar datos para actualizar"
            });
        }

        // Validar carga horaria si se actualiza
        if (cargaHoraria && (cargaHoraria < 1 || cargaHoraria > 40)) {
            return res.status(400).json({
                mensaje: "La carga horaria debe estar entre 1 y 40 horas"
            });
        }

        if (nombreDocente) docente.nombreDocente = nombreDocente;
        if (titulo) docente.titulo = titulo;
        if (especialidad) docente.especialidad = especialidad;
        if (cargaHoraria) docente.cargaHoraria = cargaHoraria;

        await docente.save();

        res.status(200).json(docente);

    } catch (error) {
        console.error("Error al actualizar docente:", error);
        res.status(500).json({ mensaje: "Error al actualizar docente", error: error.message });
    }
};

// eliminar un docente
export const eliminarDocente = async (req, res) => {
    try {
        const docente = await Docente.findByPk(req.params.id, {
            include: [{ model: Curso, as: "cursos" }]
        });

        if (!docente) {
            return res.status(404).json({
                mensaje: "Docente no encontrado"
            });
        }

        // Verificar si tiene cursos asignados
        if (docente.cursos && docente.cursos.length > 0) {
            return res.status(400).json({
                mensaje: "No se puede eliminar un docente con cursos asignados"
            });
        }

        await docente.destroy();

        res.status(204).send();

    } catch (error) {
        console.error("Error al eliminar docente:", error);
        res.status(500).json({ mensaje: "Error al eliminar docente", error: error.message });
    }
};

// buscar docente
export const buscarDocente = async (req, res) => {
    try {
        const docentes = await Docente.findAll({
            where: {
                [Op.or]: [
                    { nombreDocente: { [Op.like]: `%${req.params.termino}%` } },
                    { titulo: { [Op.like]: `%${req.params.termino}%` } },
                    { especialidad: { [Op.like]: `%${req.params.termino}%` } }
                ]
            },
            include: [{ model: Usuario, attributes: { exclude: ["password"] } }]
        });

        res.status(200).json(docentes);

    } catch (error) {
        console.error("Error al buscar docente:", error);
        res.status(500).json({ mensaje: "Error al buscar docente" });
    }
};

// asignar materia a docente
export const asignarMateria = async (req, res) => {
    try {
        const cursoId = req.body.cursoId || req.body.idCurso;

        if (!cursoId) {
            return res.status(400).json({
                mensaje: "cursoId es obligatorio"
            });
        }

        const docente = await Docente.findByPk(req.params.id);
        if (!docente) {
            return res.status(404).json({
                mensaje: "Docente no encontrado"
            });
        }

        const curso = await Curso.findByPk(cursoId);
        if (!curso) {
            return res.status(404).json({
                mensaje: "Curso no encontrado"
            });
        }

        curso.docenteId = req.params.id;
        await curso.save();

        res.status(200).json(curso);

    } catch (error) {
        console.error("Error al asignar materia:", error);
        res.status(500).json({ mensaje: "Error al asignar materia", error: error.message });
    }
};
