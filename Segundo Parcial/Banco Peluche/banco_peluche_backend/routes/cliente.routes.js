import express from 'express';
import {
	calcular,
	crearCliente,
	obtenerClientes,
	obtenerMorosos,
	obtenerNoMorosos,
	obtenerClientePorId,
	actualizarCliente,
	eliminarCliente,
	estadisticas,
	exportPDF,
	exportXLSX
} from '../controllers/cliente.controller.js';

const router = express.Router();

//CRUD Clientes
router.post('/', crearCliente);
router.get('/', obtenerClientes);
// Cálculo y estadísticas
router.post('/calcular/:id', calcular);
router.get('/estadisticas', estadisticas);

// Obtener morosos y no morosos
router.get('/morosos', obtenerMorosos);
router.get('/no-morosos', obtenerNoMorosos);

// Exportar PDF y XLSX
router.get('/:id/export/pdf', exportPDF);
router.get('/:id/export/xlsx', exportXLSX);

// Rutas por id
router.get('/:id', obtenerClientePorId);
router.put('/:id', actualizarCliente);
router.delete('/:id', eliminarCliente);

export default router;