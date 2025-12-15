import api from './api';

export const notaService = {
    obtenerTodas: async (filtros = {}) => {
        const params = new URLSearchParams(filtros).toString();
        const response = await api.get(`/notas${params ? '?' + params : ''}`);
        return response.data;
    },

    obtenerPorId: async (id) => {
        const response = await api.get(`/notas/${id}`);
        return response.data;
    },

    crear: async (datos) => {
        const response = await api.post('/notas', datos);
        return response.data;
    },

    actualizar: async (id, datos) => {
        const response = await api.put(`/notas/${id}`, datos);
        return response.data;
    },

    eliminar: async (id) => {
        const response = await api.delete(`/notas/${id}`);
        return response.data;
    },

    calcularNotaParcial: async (matriculaId, parcial) => {
        const response = await api.get(`/notas/parcial/${matriculaId}/${parcial}`);
        return response.data;
    },

    calcularPromedioSemestre: async (matriculaId) => {
        const response = await api.get(`/notas/promedio/${matriculaId}`);
        return response.data;
    },

    obtenerEstadoAcademico: async (estudianteId, cursoId) => {
        const response = await api.get(`/notas/estado/${estudianteId}/${cursoId}`);
        return response.data;
    },

    generarReporte: async (estudianteId) => {
        const response = await api.get(`/notas/reporte/${estudianteId}`);
        return response.data;
    }
};
