import api from './api';

export const estudianteService = {
    obtenerTodos: async () => {
        const response = await api.get('/estudiantes');
        return response.data;
    },

    obtenerPorId: async (id) => {
        const response = await api.get(`/estudiantes/${id}`);
        return response.data;
    },

    crear: async (datos) => {
        const response = await api.post('/estudiantes', datos);
        return response.data;
    },

    actualizar: async (id, datos) => {
        const response = await api.put(`/estudiantes/${id}`, datos);
        return response.data;
    },

    eliminar: async (id) => {
        const response = await api.delete(`/estudiantes/${id}`);
        return response.data;
    },

    buscar: async (termino) => {
        const response = await api.get(`/estudiantes/buscar/${termino}`);
        return response.data;
    },

    obtenerNotas: async (id) => {
        const response = await api.get(`/estudiantes/${id}/notas`);
        return response.data;
    },

    obtenerHistorial: async (id) => {
        const response = await api.get(`/estudiantes/${id}/historial`);
        return response.data;
    }
};
