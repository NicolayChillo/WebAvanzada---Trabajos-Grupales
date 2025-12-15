import api from './api';

export const usuarioService = {
    login: async (email, password) => {
        const response = await api.post('/usuarios/login', { email, password });
        return response.data;
    },

    obtenerTodos: async () => {
        const response = await api.get('/usuarios');
        return response.data;
    },

    obtenerPorId: async (id) => {
        const response = await api.get(`/usuarios/${id}`);
        return response.data;
    },

    crear: async (datos) => {
        const response = await api.post('/usuarios', datos);
        return response.data;
    },

    actualizar: async (id, datos) => {
        const response = await api.put(`/usuarios/${id}`, datos);
        return response.data;
    },

    eliminar: async (id) => {
        const response = await api.delete(`/usuarios/${id}`);
        return response.data;
    },

    buscar: async (termino) => {
        const response = await api.get(`/usuarios/buscar/${termino}`);
        return response.data;
    },

    resetPasswordByEmail: async (email, newPassword) => {
        const response = await api.put('/usuarios/reset-password', { email, newPassword });
        return response.data;
    }
};
