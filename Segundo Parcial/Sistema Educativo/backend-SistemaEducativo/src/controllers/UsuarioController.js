import { Usuario } from "../models/Usuario.js";
import { Op } from "sequelize";

// crear usuario
export const crearUsuario = async (req, res) => {
    try {
        const { email, password, nombreUsuario, tipo } = req.body;

        if (!email || !password || !nombreUsuario || !tipo) {
            return res.status(400).json({
                mensaje: "Email, password, nombreUsuario y tipo son obligatorios"
            });
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                mensaje: "Formato de email inválido"
            });
        }

        // Validar email único
        const usuarioExistente = await Usuario.findOne({ where: { email } });
        if (usuarioExistente) {
            return res.status(400).json({
                mensaje: "El email ya está registrado"
            });
        }

        // TODO: Implementar bcrypt para hashear password
        const nuevoUsuario = await Usuario.create({
            email,
            password,
            nombreUsuario,
            tipo
        });

        res.status(201).json(nuevoUsuario);

    } catch (error) {
        console.error("Error al crear usuario:", error);
        res.status(500).json({ mensaje: "Error al crear usuario", error: error.message });
    }
};

// obtener todos los usuarios
export const obtenerUsuarios = async (_req, res) => {
    try {
        const usuarios = await Usuario.findAll({
            attributes: { exclude: ["password"] }
        });
        res.status(200).json(usuarios);
    } catch (error) {
        console.error("Error al obtener usuarios:", error);
        res.status(500).json({ mensaje: "Error al obtener usuarios" });
    }
};

// obtener un usuario por id
export const obtenerUsuario = async (req, res) => {
    try {
        const usuario = await Usuario.findByPk(req.params.id, {
            attributes: { exclude: ["password"] }
        });

        if (!usuario) {
            return res.status(404).json({
                mensaje: "Usuario no encontrado"
            });
        }

        res.status(200).json(usuario);

    } catch (error) {
        console.error("Error al obtener usuario:", error);
        res.status(500).json({ mensaje: "Error al obtener usuario" });
    }
};

// actualizar un usuario
export const actualizarUsuario = async (req, res) => {
    try {
        const usuario = await Usuario.findByPk(req.params.id);

        if (!usuario) {
            return res.status(404).json({
                mensaje: "Usuario no encontrado"
            });
        }

        const { email, password, nombreUsuario, tipo } = req.body;

        if (!email && !password && !nombreUsuario && !tipo) {
            return res.status(400).json({
                mensaje: "Ingresar datos para actualizar"
            });
        }

        // Validar email único si se actualiza
        if (email && email !== usuario.email) {
            const emailExistente = await Usuario.findOne({ where: { email } });
            if (emailExistente) {
                return res.status(400).json({
                    mensaje: "El email ya está registrado"
                });
            }
        }

        if (email) usuario.email = email;
        if (password) usuario.password = password; // TODO: hashear con bcrypt
        if (nombreUsuario) usuario.nombreUsuario = nombreUsuario;
        if (tipo) usuario.tipo = tipo;

        await usuario.save();

        // Excluir password de la respuesta
        const { password: _, ...usuarioSinPassword } = usuario.toJSON();
        res.status(200).json(usuarioSinPassword);

    } catch (error) {
        console.error("Error al actualizar usuario:", error);
        res.status(500).json({ mensaje: "Error al actualizar usuario", error: error.message });
    }
};

// eliminar un usuario
export const eliminarUsuario = async (req, res) => {
    try {
        const usuario = await Usuario.findByPk(req.params.id);

        if (!usuario) {
            return res.status(404).json({
                mensaje: "Usuario no encontrado"
            });
        }

        await usuario.destroy();

        res.status(204).send();

    } catch (error) {
        console.error("Error al eliminar usuario:", error);
        res.status(500).json({ mensaje: "Error al eliminar usuario", error: error.message });
    }
};

// login usuario
export const loginUsuario = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                mensaje: "Email y password son obligatorios"
            });
        }

        const usuario = await Usuario.findOne({ where: { email } });

        if (!usuario) {
            return res.status(401).json({
                mensaje: "Credenciales incorrectas"
            });
        }

        // TODO: Implementar bcrypt.compare para validar password
        if (usuario.password !== password) {
            return res.status(401).json({
                mensaje: "Credenciales incorrectas"
            });
        }

        if (!usuario.activo) {
            return res.status(401).json({
                mensaje: "Usuario inactivo"
            });
        }

        // Excluir password de la respuesta
        const { password: _, ...usuarioSinPassword } = usuario.toJSON();
        res.status(200).json(usuarioSinPassword);

    } catch (error) {
        console.error("Error al hacer login:", error);
        res.status(500).json({ mensaje: "Error al hacer login", error: error.message });
    }
};

// buscar usuario
export const buscarUsuario = async (req, res) => {
    try {
        const usuarios = await Usuario.findAll({
            where: {
                [Op.or]: [
                    { email: { [Op.like]: `%${req.params.termino}%` } },
                    { nombreUsuario: { [Op.like]: `%${req.params.termino}%` } }
                ]
            },
            attributes: { exclude: ["password"] }
        });

        res.status(200).json(usuarios);

    } catch (error) {
        console.error("Error al buscar usuario:", error);
        res.status(500).json({ mensaje: "Error al buscar usuario" });
    }
};
