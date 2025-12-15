import api from './api';

export const matriculaService = {
    obtenerTodas: async (filtros = {}) => {
        const params = new URLSearchParams(filtros).toString();
        const response = await api.get(`/matriculas${params ? '?' + params : ''}`);
        return response.data;
    },

    obtenerPorId: async (id) => {
        const response = await api.get(`/matriculas/${id}`);
        return response.data;
    },

    crear: async (datos) => {
        const response = await api.post('/matriculas', datos);
        return response.data;
    },

    actualizar: async (id, datos) => {
        const response = await api.put(`/matriculas/${id}`, datos);
        return response.data;
    },

    eliminar: async (id) => {
        const response = await api.delete(`/matriculas/${id}`);
        return response.data;
    }
};
