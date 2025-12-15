import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, InputGroup, Modal } from 'react-bootstrap';
import { docenteService } from '../../services/docenteService';
import { usuarioService } from '../../services/usuarioService';
import AlertMessage from '../../components/common/AlertMessage';
import ConfirmModal from '../../components/common/ConfirmModal';

const Docentes = () => {
    const [docentes, setDocentes] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({ show: false, variant: '', message: '' });
    const [busqueda, setBusqueda] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [docenteSeleccionado, setDocenteSeleccionado] = useState(null);
    const [formData, setFormData] = useState({
        nombreDocente: '',
        titulo: '',
        especialidad: '',
        cargaHoraria: '',
        usuarioId: ''
    });

    useEffect(() => {
        cargarDocentes();
        cargarUsuarios();
    }, []);

    const cargarDocentes = async () => {
        try {
            setLoading(true);
            const data = await docenteService.obtenerTodos();
            setDocentes(data);
        } catch (error) {
            mostrarAlerta('danger', 'Error al cargar docentes');
        } finally {
            setLoading(false);
        }
    };

    const cargarUsuarios = async () => {
        try {
            const data = await usuarioService.obtenerTodos();
            setUsuarios(data.filter(u => u.tipo === 'docente'));
        } catch (error) {
            console.error('Error al cargar usuarios');
        }
    };

    const mostrarAlerta = (variant, message) => {
        setAlert({ show: true, variant, message });
        setTimeout(() => setAlert({ show: false, variant: '', message: '' }), 5000);
    };

    const handleBuscar = async () => {
        if (!busqueda.trim()) {
            cargarDocentes();
            return;
        }

        try {
            const data = await docenteService.buscar(busqueda);
            setDocentes(data);
        } catch (error) {
            mostrarAlerta('danger', 'Error en la búsqueda');
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (docenteSeleccionado) {
                await docenteService.actualizar(docenteSeleccionado.idDocente, formData);
                mostrarAlerta('success', 'Docente actualizado correctamente');
            } else {
                await docenteService.crear(formData);
                mostrarAlerta('success', 'Docente creado correctamente');
            }
            cerrarModal();
            cargarDocentes();
        } catch (error) {
            mostrarAlerta('danger', error.response?.data?.mensaje || 'Error al guardar docente');
        } finally {
            setLoading(false);
        }
    };

    const abrirModalNuevo = () => {
        setDocenteSeleccionado(null);
        setFormData({
            nombreDocente: '',
            titulo: '',
            especialidad: '',
            cargaHoraria: '',
            usuarioId: ''
        });
        setShowModal(true);
    };

    const abrirModalEditar = (docente) => {
        setDocenteSeleccionado(docente);
        setFormData({
            nombreDocente: docente.nombreDocente || '',
            titulo: docente.titulo || '',
            especialidad: docente.especialidad || '',
            cargaHoraria: docente.cargaHoraria || '',
            usuarioId: docente.usuarioId || ''
        });
        setShowModal(true);
    };

    const cerrarModal = () => {
        setShowModal(false);
        setDocenteSeleccionado(null);
    };

    const abrirConfirmEliminar = (docente) => {
        setDocenteSeleccionado(docente);
        setShowConfirm(true);
    };

    const handleEliminar = async () => {
        try {
            await docenteService.eliminar(docenteSeleccionado.idDocente);
            mostrarAlerta('success', 'Docente eliminado correctamente');
            setShowConfirm(false);
            cargarDocentes();
        } catch (error) {
            mostrarAlerta('danger', error.response?.data?.mensaje || 'Error al eliminar docente');
        }
    };

    return (
        <Container fluid>
            <Row className="mb-4">
                <Col>
                    <h2>Gestión de Docentes</h2>
                </Col>
                <Col xs="auto">
                    <Button variant="primary" onClick={abrirModalNuevo}>
                        <i className="bi bi-plus-circle me-2"></i>
                        Nuevo Docente
                    </Button>
                </Col>
            </Row>

            {alert.show && (
                <AlertMessage
                    variant={alert.variant}
                    message={alert.message}
                    onClose={() => setAlert({ show: false, variant: '', message: '' })}
                />
            )}

            <Card className="shadow-sm mb-4">
                <Card.Body>
                    <Row>
                        <Col md={6}>
                            <InputGroup>
                                <Form.Control
                                    placeholder="Buscar por nombre o especialidad..."
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleBuscar()}
                                />
                                <Button variant="primary" onClick={handleBuscar}>
                                    <i className="bi bi-search"></i> Buscar
                                </Button>
                            </InputGroup>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            <Card className="shadow-sm">
                <Card.Body>
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Cargando...</span>
                            </div>
                        </div>
                    ) : (
                        <Table responsive hover>
                            <thead className="table-dark">
                                <tr>
                                    <th>ID</th>
                                    <th>Nombre</th>
                                    <th>Título</th>
                                    <th>Especialidad</th>
                                    <th>Carga Horaria</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {docentes.length > 0 ? (
                                    docentes.map((docente) => (
                                        <tr key={docente.idDocente}>
                                            <td>{docente.idDocente}</td>
                                            <td>{docente.nombreDocente}</td>
                                            <td>{docente.titulo}</td>
                                            <td>{docente.especialidad}</td>
                                            <td>{docente.cargaHoraria} hrs</td>
                                            <td>
                                                <Button
                                                    variant="warning"
                                                    size="sm"
                                                    className="me-2"
                                                    onClick={() => abrirModalEditar(docente)}
                                                >
                                                    <i className="bi bi-pencil"></i>
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={() => abrirConfirmEliminar(docente)}
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center text-muted">
                                            No hay docentes registrados
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>

            {/* Modal Crear/Editar */}
            <Modal show={showModal} onHide={cerrarModal} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        {docenteSeleccionado ? 'Editar Docente' : 'Nuevo Docente'}
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Nombre Completo *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="nombreDocente"
                                        value={formData.nombreDocente}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Título *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="titulo"
                                        value={formData.titulo}
                                        onChange={handleChange}
                                        placeholder="Ej: Ingeniero, Magíster..."
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Especialidad *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="especialidad"
                                        value={formData.especialidad}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Carga Horaria *</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="cargaHoraria"
                                        value={formData.cargaHoraria}
                                        onChange={handleChange}
                                        min="1"
                                        max="40"
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Usuario *</Form.Label>
                                    <Form.Select
                                        name="usuarioId"
                                        value={formData.usuarioId}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Seleccione un usuario...</option>
                                        {usuarios.map(u => (
                                            <option key={u.idUsuario} value={u.idUsuario}>
                                                {u.nombreUsuario} ({u.email})
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={cerrarModal}>
                            Cancelar
                        </Button>
                        <Button variant="primary" type="submit" disabled={loading}>
                            {loading ? 'Guardando...' : 'Guardar'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Modal Confirmar Eliminación */}
            <ConfirmModal
                show={showConfirm}
                onHide={() => setShowConfirm(false)}
                onConfirm={handleEliminar}
                title="Eliminar Docente"
                message={`¿Está seguro de eliminar al docente ${docenteSeleccionado?.nombreDocente}?`}
            />
        </Container>
    );
};

export default Docentes;
