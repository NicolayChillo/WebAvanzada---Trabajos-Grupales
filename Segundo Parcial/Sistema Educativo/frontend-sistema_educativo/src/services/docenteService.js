import api from './api';

export const docenteService = {
    obtenerTodos: async () => {
        const response = await api.get('/docentes');
        return response.data;
    },

    obtenerPorId: async (id) => {
        const response = await api.get(`/docentes/${id}`);
        return response.data;
    },

    crear: async (datos) => {
        const response = await api.post('/docentes', datos);
        return response.data;
    },

    actualizar: async (id, datos) => {
        const response = await api.put(`/docentes/${id}`, datos);
        return response.data;
    },

    eliminar: async (id) => {
        const response = await api.delete(`/docentes/${id}`);
        return response.data;
    },

    buscar: async (termino) => {
        const response = await api.get(`/docentes/buscar/${termino}`);
        return response.data;
    },

    asignarMateria: async (id, cursoId) => {
        const response = await api.post(`/docentes/${id}/asignar-materia`, { cursoId });
        return response.data;
    }
};
