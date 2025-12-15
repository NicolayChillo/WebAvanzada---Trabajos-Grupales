import { Asignatura } from "../models/Asignatura.js";
import { Curso } from "../models/Curso.js";
import { Op } from "sequelize";

// crear asignatura
export const crearAsignatura = async (req, res) => {
    try {
        const { codigoAsignatura, nombreAsignatura, creditos } = req.body;

        if (!codigoAsignatura || !nombreAsignatura || !creditos) {
            return res.status(400).json({
                mensaje: "Todos los campos son obligatorios"
            });
        }

        // Validar código único
        const asignaturaExistente = await Asignatura.findOne({ where: { codigoAsignatura } });
        if (asignaturaExistente) {
            return res.status(400).json({
                mensaje: "Ya existe una asignatura con este código"
            });
        }

        const nuevaAsignatura = await Asignatura.create({
            codigoAsignatura,
            nombreAsignatura,
            creditos
        });

        res.status(201).json(nuevaAsignatura);

    } catch (error) {
        console.error("Error al crear asignatura:", error);
        res.status(500).json({ mensaje: "Error al crear asignatura", error: error.message });
    }
};

// obtener todas las asignaturas
export const obtenerAsignaturas = async (_req, res) => {
    try {
        const asignaturas = await Asignatura.findAll({
            where: { estado: "activa" }
        });
        res.status(200).json(asignaturas);
    } catch (error) {
        console.error("Error al obtener asignaturas:", error);
        res.status(500).json({ mensaje: "Error al obtener asignaturas" });
    }
};

// obtener una asignatura por id
export const obtenerAsignatura = async (req, res) => {
    try {
        const asignatura = await Asignatura.findByPk(req.params.id, {
            include: [{ model: Curso, as: "cursos" }]
        });

        if (!asignatura) {
            return res.status(404).json({
                mensaje: "Asignatura no encontrada"
            });
        }

        res.status(200).json(asignatura);

    } catch (error) {
        console.error("Error al obtener asignatura:", error);
        res.status(500).json({ mensaje: "Error al obtener asignatura" });
    }
};

// actualizar una asignatura
export const actualizarAsignatura = async (req, res) => {
    try {
        const asignatura = await Asignatura.findByPk(req.params.id);

        if (!asignatura) {
            return res.status(404).json({
                mensaje: "Asignatura no encontrada"
            });
        }

        const { codigoAsignatura, nombreAsignatura, creditos } = req.body;

        if (!codigoAsignatura && !nombreAsignatura && !creditos) {
            return res.status(400).json({
                mensaje: "Ingresar datos para actualizar"
            });
        }

        // Validar código único si se actualiza
        if (codigoAsignatura && codigoAsignatura !== asignatura.codigoAsignatura) {
            const codigoExistente = await Asignatura.findOne({ where: { codigoAsignatura } });
            if (codigoExistente) {
                return res.status(400).json({
                    mensaje: "El código ya está registrado"
                });
            }
        }

        if (codigoAsignatura) asignatura.codigoAsignatura = codigoAsignatura;
        if (nombreAsignatura) asignatura.nombreAsignatura = nombreAsignatura;
        if (creditos) asignatura.creditos = creditos;

        await asignatura.save();

        res.status(200).json(asignatura);

    } catch (error) {
        console.error("Error al actualizar asignatura:", error);
        res.status(500).json({ mensaje: "Error al actualizar asignatura", error: error.message });
    }
};

// eliminar una asignatura (soft delete)
export const eliminarAsignatura = async (req, res) => {
    try {
        const asignatura = await Asignatura.findByPk(req.params.id, {
            include: [{ model: Curso, as: "cursos" }]
        });

        if (!asignatura) {
            return res.status(404).json({
                mensaje: "Asignatura no encontrada"
            });
        }

        // Verificar si tiene cursos asociados
        if (asignatura.cursos && asignatura.cursos.length > 0) {
            return res.status(400).json({
                mensaje: "No se puede eliminar una asignatura con cursos asociados"
            });
        }

        asignatura.estado = "inactiva";
        await asignatura.save();

        res.status(204).send();

    } catch (error) {
        console.error("Error al eliminar asignatura:", error);
        res.status(500).json({ mensaje: "Error al eliminar asignatura", error: error.message });
    }
};

// buscar asignatura
export const buscarAsignatura = async (req, res) => {
    try {
        const asignaturas = await Asignatura.findAll({
            where: {
                [Op.or]: [
                    { codigoAsignatura: { [Op.like]: `%${req.params.termino}%` } },
                    { nombreAsignatura: { [Op.like]: `%${req.params.termino}%` } }
                ]
            }
        });

        res.status(200).json(asignaturas);

    } catch (error) {
        console.error("Error al buscar asignatura:", error);
        res.status(500).json({ mensaje: "Error al buscar asignatura" });
    }
};

// obtener asignaturas por nivel
export const obtenerAsignaturasPorNivel = async (req, res) => {
    try {
        const asignaturas = await Asignatura.findAll({
            where: {
                nivel: req.params.nivel,
                estado: "activa"
            }
        });

        res.status(200).json(asignaturas);

    } catch (error) {
        console.error("Error al obtener asignaturas por nivel:", error);
        res.status(500).json({ mensaje: "Error al obtener asignaturas por nivel" });
    }
};
