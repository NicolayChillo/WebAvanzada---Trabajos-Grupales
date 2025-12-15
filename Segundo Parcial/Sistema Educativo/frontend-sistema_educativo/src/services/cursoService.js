import api from './api';

export const cursoService = {
    obtenerTodos: async (filtros = {}) => {
        const params = new URLSearchParams(filtros).toString();
        const response = await api.get(`/cursos${params ? '?' + params : ''}`);
        return response.data;
    },

    obtenerPorId: async (id) => {
        const response = await api.get(`/cursos/${id}`);
        return response.data;
    },

    crear: async (datos) => {
        const response = await api.post('/cursos', datos);
        return response.data;
    },

    actualizar: async (id, datos) => {
        const response = await api.put(`/cursos/${id}`, datos);
        return response.data;
    },

    eliminar: async (id) => {
        const response = await api.delete(`/cursos/${id}`);
        return response.data;
    },

    buscar: async (termino) => {
        const response = await api.get(`/cursos/buscar/${termino}`);
        return response.data;
    }
};
