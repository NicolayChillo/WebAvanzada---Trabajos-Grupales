import { Estudiante } from "../models/Estudiante.js";
import { Usuario } from "../models/Usuario.js";
import { Matricula } from "../models/Matricula.js";
import { Nota } from "../models/Nota.js";
import { Curso } from "../models/Curso.js";
import { Op } from "sequelize";

// crear estudiante
export const crearEstudiante = async (req, res) => {
    try {
        const { cedula, nombreEstudiante, fechaNacimiento, direccion, telefono, usuarioId } = req.body;

        if (!cedula || !nombreEstudiante || !fechaNacimiento || !direccion || !telefono || !usuarioId) {
            return res.status(400).json({
                mensaje: "Cédula, nombreEstudiante, fechaNacimiento, direccion, telefono y usuarioId son obligatorios"
            });
        }

        // Validar cédula única
        const estudianteExistente = await Estudiante.findOne({ where: { cedula } });
        if (estudianteExistente) {
            return res.status(400).json({
                mensaje: "La cédula ya está registrada"
            });
        }

        // Validar que usuario exista
        const usuario = await Usuario.findByPk(usuarioId);
        if (!usuario) {
            return res.status(404).json({
                mensaje: "Usuario no encontrado"
            });
        }

        const nuevoEstudiante = await Estudiante.create({
            cedula,
            nombreEstudiante,
            fechaNacimiento,
            direccion,
            telefono,
            usuarioId,
            estado: "activo"
        });

        res.status(201).json(nuevoEstudiante);

    } catch (error) {
        console.error("Error al crear estudiante:", error);
        res.status(500).json({ mensaje: "Error al crear estudiante", error: error.message });
    }
};

// obtener todos los estudiantes
export const obtenerEstudiantes = async (_req, res) => {
    try {
        const estudiantes = await Estudiante.findAll({
            where: { estado: "activo" },
            include: [{ model: Usuario, attributes: { exclude: ["password"] } }]
        });
        res.status(200).json(estudiantes);
    } catch (error) {
        console.error("Error al obtener estudiantes:", error);
        res.status(500).json({ mensaje: "Error al obtener estudiantes" });
    }
};

// obtener un estudiante por id
export const obtenerEstudiante = async (req, res) => {
    try {
        const estudiante = await Estudiante.findByPk(req.params.id, {
            include: [
                { model: Usuario, attributes: { exclude: ["password"] } },
                { model: Matricula, as: "matriculas" }
            ]
        });

        if (!estudiante || estudiante.estado === "inactivo") {
            return res.status(404).json({
                mensaje: "Estudiante no encontrado"
            });
        }

        res.status(200).json(estudiante);

    } catch (error) {
        console.log("Error al obtener estaaudiante:", error.message);
        res.status(500).json({ mensaje: "Erraaor al obtener estudiante", error: error.message, stack: error.stack });
    }
};

// actualizar un estudiante
export const actualizarEstudiante = async (req, res) => {
    try {
        const estudiante = await Estudiante.findByPk(req.params.id);

        if (!estudiante || estudiante.estado === "inactivo") {
            return res.status(404).json({
                mensaje: "Estudiante no encontrado"
            });
        }

        const { cedula, nombreEstudiante, fechaNacimiento, direccion, telefono } = req.body;

        if (!cedula && !nombreEstudiante && !fechaNacimiento && !direccion && !telefono) {
            return res.status(400).json({
                mensaje: "Ingresar datos para actualizar"
            });
        }

        // Validar cédula única si se actualiza
        if (cedula && cedula !== estudiante.cedula) {
            const cedulaExistente = await Estudiante.findOne({ where: { cedula } });
            if (cedulaExistente) {
                return res.status(400).json({
                    mensaje: "La cédula ya está registrada"
                });
            }
        }

        if (cedula) estudiante.cedula = cedula;
        if (nombreEstudiante) estudiante.nombreEstudiante = nombreEstudiante;
        if (fechaNacimiento) estudiante.fechaNacimiento = fechaNacimiento;
        if (direccion) estudiante.direccion = direccion;
        if (telefono) estudiante.telefono = telefono;

        await estudiante.save();

        res.status(200).json(estudiante);

    } catch (error) {
        console.error("Error al actualizar estudiante:", error);
        res.status(500).json({ mensaje: "Error al actualizar estudiante", error: error.message });
    }
};

// eliminar un estudiante (soft delete)
export const eliminarEstudiante = async (req, res) => {
    try {
        const estudiante = await Estudiante.findByPk(req.params.id);

        if (!estudiante || estudiante.estado === "inactivo") {
            return res.status(404).json({
                mensaje: "Estudiante no encontrado"
            });
        }

        estudiante.estado = "inactivo";
        await estudiante.save();

        res.status(204).send();

    } catch (error) {
        console.error("Error al eliminar estudiante:", error);
        res.status(500).json({ mensaje: "Error al eliminar estudiante", error: error.message });
    }
};

// obtener notas de un estudiante
export const obtenerNotasEstudiante = async (req, res) => {
    try {
        const estudiante = await Estudiante.findByPk(req.params.id);

        if (!estudiante || estudiante.estado === "inactivo") {
            return res.status(404).json({
                mensaje: "Estudiante no encontrado"
            });
        }

        const notas = await Nota.findAll({
            include: [{
                model: Matricula,
                as: "matricula",
                where: { estudianteId: req.params.id },
                include: [{ model: Curso, as: "curso" }]
            }]
        });

        res.status(200).json(notas);

    } catch (error) {
        console.error("Error al obtener notas:", error);
        res.status(500).json({ mensaje: "Error al obtener notas", error: error.message, stack: error.stack });
    }
};

// obtener historial académico de un estudiante
export const obtenerHistorialAcademico = async (req, res) => {
    try {
        const estudiante = await Estudiante.findByPk(req.params.id, {
            include: [{
                model: Matricula,
                as: "matriculas",
                include: [
                    { model: Curso, as: "curso" },
                    { model: Nota, as: "notas" }
                ]
            }]
        });

        if (!estudiante || estudiante.estado === "inactivo") {
            return res.status(404).json({
                mensaje: "Estudiante no encontrado"
            });
        }

        res.status(200).json(estudiante);

    } catch (error) {
        console.error("Error al obtener historial académico:", error);
        res.status(500).json({ mensaje: "Error al obtener historial académico", error: error.message, stack: error.stack });
    }
};

// buscar estudiante
export const buscarEstudiante = async (req, res) => {
    try {
        const estudiantes = await Estudiante.findAll({
            where: {
                [Op.or]: [
                    { cedula: { [Op.like]: `%${req.params.termino}%` } },
                    { nombreEstudiante: { [Op.like]: `%${req.params.termino}%` } }
                ]
            },
            include: [{ model: Usuario, attributes: { exclude: ["password"] } }]
        });

        res.status(200).json(estudiantes);

    } catch (error) {
        console.error("Error al buscar estudiante:", error);
        res.status(500).json({ mensaje: "Error al buscar estudiante" });
    }
};
