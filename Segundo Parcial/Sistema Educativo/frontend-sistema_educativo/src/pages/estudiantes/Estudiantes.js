import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, InputGroup, Modal } from 'react-bootstrap';
import { estudianteService } from '../../services/estudianteService';
import { usuarioService } from '../../services/usuarioService';
import AlertMessage from '../../components/common/AlertMessage';
import ConfirmModal from '../../components/common/ConfirmModal';

const Estudiantes = () => {
    const [estudiantes, setEstudiantes] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({ show: false, variant: '', message: '' });
    const [busqueda, setBusqueda] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [estudianteSeleccionado, setEstudianteSeleccionado] = useState(null);
    const [formData, setFormData] = useState({
        cedula: '',
        nombreEstudiante: '',
        fechaNacimiento: '',
        direccion: '',
        telefono: '',
        email: '',
        nombreUsuario: '',
        password: ''
    });

    useEffect(() => {
        cargarEstudiantes();
        cargarUsuarios();
    }, []);

    const cargarEstudiantes = async () => {
        try {
            setLoading(true);
            const data = await estudianteService.obtenerTodos();
            setEstudiantes(data);
        } catch (error) {
            mostrarAlerta('danger', 'Error al cargar estudiantes');
        } finally {
            setLoading(false);
        }
    };

    const cargarUsuarios = async () => {
        try {
            const data = await usuarioService.obtenerTodos();
            setUsuarios(data.filter(u => u.tipo === 'estudiante'));
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
            cargarEstudiantes();
            return;
        }

        try {
            const data = await estudianteService.buscar(busqueda);
            setEstudiantes(data);
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
            if (estudianteSeleccionado) {
                // Al editar solo enviar datos del estudiante
                const datosEstudiante = {
                    cedula: formData.cedula,
                    nombreEstudiante: formData.nombreEstudiante,
                    fechaNacimiento: formData.fechaNacimiento,
                    direccion: formData.direccion,
                    telefono: formData.telefono
                };
                await estudianteService.actualizar(estudianteSeleccionado.idEstudiante, datosEstudiante);
                mostrarAlerta('success', 'Estudiante actualizado correctamente');
            } else {
                // Al crear, enviar datos del estudiante y usuario
                const datosCompletos = {
                    cedula: formData.cedula,
                    nombreEstudiante: formData.nombreEstudiante,
                    fechaNacimiento: formData.fechaNacimiento,
                    direccion: formData.direccion,
                    telefono: formData.telefono,
                    usuario: {
                        email: formData.email,
                        nombreUsuario: formData.nombreUsuario,
                        password: formData.password,
                        tipo: 'estudiante'
                    }
                };
                await estudianteService.crear(datosCompletos);
                mostrarAlerta('success', 'Estudiante creado correctamente');
            }
            cerrarModal();
            cargarEstudiantes();
        } catch (error) {
            mostrarAlerta('danger', error.response?.data?.mensaje || 'Error al guardar estudiante');
        } finally {
            setLoading(false);
        }
    };

    const abrirModalNuevo = () => {
        setEstudianteSeleccionado(null);
        setFormData({
            cedula: '',
            nombreEstudiante: '',
            fechaNacimiento: '',
            direccion: '',
            telefono: '',
            email: '',
            nombreUsuario: '',
            password: ''
        });
        setShowModal(true);
    };

    const abrirModalEditar = (estudiante) => {
        setEstudianteSeleccionado(estudiante);
        setFormData({
            cedula: estudiante.cedula || '',
            nombreEstudiante: estudiante.nombreEstudiante || '',
            fechaNacimiento: estudiante.fechaNacimiento || '',
            direccion: estudiante.direccion || '',
            telefono: estudiante.telefono || '',
            email: '',
            nombreUsuario: '',
            password: ''
        });
        setShowModal(true);
    };

    const cerrarModal = () => {
        setShowModal(false);
        setEstudianteSeleccionado(null);
    };

    const abrirConfirmEliminar = (estudiante) => {
        setEstudianteSeleccionado(estudiante);
        setShowConfirm(true);
    };

    const handleEliminar = async () => {
        try {
            await estudianteService.eliminar(estudianteSeleccionado.idEstudiante);
            mostrarAlerta('success', 'Estudiante eliminado correctamente');
            setShowConfirm(false);
            cargarEstudiantes();
        } catch (error) {
            mostrarAlerta('danger', error.response?.data?.mensaje || 'Error al eliminar estudiante');
        }
    };

    return (
        <Container fluid>
            <Row className="mb-4">
                <Col>
                    <h2>Gestión de Estudiantes</h2>
                </Col>
                <Col xs="auto">
                    <Button variant="primary" onClick={abrirModalNuevo}>
                        <i className="bi bi-plus-circle me-2"></i>
                        Nuevo Estudiante
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
                                    placeholder="Buscar por cédula o nombre..."
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
                                    <th>Cédula</th>
                                    <th>Nombre</th>
                                    <th>Fecha Nacimiento</th>
                                    <th>Teléfono</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {estudiantes.length > 0 ? (
                                    estudiantes.map((estudiante) => (
                                        <tr key={estudiante.idEstudiante}>
                                            <td>{estudiante.idEstudiante}</td>
                                            <td>{estudiante.cedula}</td>
                                            <td>{estudiante.nombreEstudiante}</td>
                                            <td>{estudiante.fechaNacimiento}</td>
                                            <td>{estudiante.telefono}</td>
                                            <td>
                                                <span className={`badge ${estudiante.estado === 'activo' ? 'bg-success' : 'bg-secondary'}`}>
                                                    {estudiante.estado}
                                                </span>
                                            </td>
                                            <td>
                                                <Button
                                                    variant="warning"
                                                    size="sm"
                                                    className="me-2"
                                                    onClick={() => abrirModalEditar(estudiante)}
                                                >
                                                    <i className="bi bi-pencil"></i>
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={() => abrirConfirmEliminar(estudiante)}
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center text-muted">
                                            No hay estudiantes registrados
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
                        {estudianteSeleccionado ? 'Editar Estudiante' : 'Nuevo Estudiante'}
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Cédula *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="cedula"
                                        value={formData.cedula}
                                        onChange={handleChange}
                                        maxLength="10"
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Nombre Completo *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="nombreEstudiante"
                                        value={formData.nombreEstudiante}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Fecha de Nacimiento *</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="fechaNacimiento"
                                        value={formData.fechaNacimiento}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Teléfono *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="telefono"
                                        value={formData.telefono}
                                        onChange={handleChange}
                                        maxLength="10"
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Dirección *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="direccion"
                                        value={formData.direccion}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        {!estudianteSeleccionado && (
                            <>
                                <hr />
                                <h6 className="text-muted mb-3">Datos de Usuario</h6>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Email *</Form.Label>
                                            <Form.Control
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required={!estudianteSeleccionado}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Nombre de Usuario *</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="nombreUsuario"
                                                value={formData.nombreUsuario}
                                                onChange={handleChange}
                                                required={!estudianteSeleccionado}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={12}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Contraseña *</Form.Label>
                                            <Form.Control
                                                type="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                minLength="6"
                                                required={!estudianteSeleccionado}
                                            />
                                            <Form.Text className="text-muted">
                                                Mínimo 6 caracteres
                                            </Form.Text>
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </>
                        )}
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
                title="Eliminar Estudiante"
                message={`¿Está seguro de eliminar al estudiante ${estudianteSeleccionado?.nombreEstudiante}?`}
            />
        </Container>
    );
};

export default Estudiantes;
