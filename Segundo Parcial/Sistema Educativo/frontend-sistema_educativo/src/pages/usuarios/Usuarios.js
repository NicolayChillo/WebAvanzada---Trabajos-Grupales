import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Modal, Badge, InputGroup } from 'react-bootstrap';
import { usuarioService } from '../../services/usuarioService';
import AlertMessage from '../../components/common/AlertMessage';
import ConfirmModal from '../../components/common/ConfirmModal';

const Usuarios = () => {
    const usuarioActual = JSON.parse(localStorage.getItem('usuario') || '{}');
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({ show: false, variant: '', message: '' });
    const [busqueda, setBusqueda] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
    const [formData, setFormData] = useState({
        nombreUsuario: '',
        email: '',
        password: '',
        tipo: 'estudiante',
        activo: true
    });

    const cargarUsuarios = useCallback(async () => {
        try {
            setLoading(true);
            const data = await usuarioService.obtenerTodos();
            setUsuarios(data);
        } catch (error) {
            mostrarAlerta('danger', 'Error al cargar usuarios');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        cargarUsuarios();
    }, [cargarUsuarios]);

    const mostrarAlerta = (variant, message) => {
        setAlert({ show: true, variant, message });
        setTimeout(() => setAlert({ show: false, variant: '', message: '' }), 5000);
    };

    const handleBuscar = useCallback(async () => {
        if (!busqueda.trim()) {
            cargarUsuarios();
            return;
        }

        try {
            const data = await usuarioService.buscar(busqueda);
            setUsuarios(data);
        } catch (error) {
            mostrarAlerta('danger', 'Error en la búsqueda');
        }
    }, [busqueda, cargarUsuarios]);

    useEffect(() => {
        const t = setTimeout(() => {
            handleBuscar();
        }, 300);
        return () => clearTimeout(t);
    }, [busqueda, handleBuscar]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (usuarioSeleccionado) {
                // Al editar, no enviar password si está vacío
                const datosActualizar = { ...formData };
                if (!datosActualizar.password) {
                    delete datosActualizar.password;
                }
                await usuarioService.actualizar(usuarioSeleccionado.idUsuario, datosActualizar);
                mostrarAlerta('success', 'Usuario actualizado correctamente');
            } else {
                await usuarioService.crear(formData);
                mostrarAlerta('success', 'Usuario creado correctamente');
            }
            cerrarModal();
            cargarUsuarios();
        } catch (error) {
            mostrarAlerta('danger', error.response?.data?.mensaje || 'Error al guardar usuario');
        } finally {
            setLoading(false);
        }
    };

    const abrirModalNuevo = () => {
        setUsuarioSeleccionado(null);
        setFormData({
            nombreUsuario: '',
            email: '',
            password: '',
            tipo: 'estudiante',
            activo: true
        });
        setShowModal(true);
    };

    const abrirModalEditar = (usuario) => {
        setUsuarioSeleccionado(usuario);
        setFormData({
            nombreUsuario: usuario.nombreUsuario || '',
            email: usuario.email || '',
            password: '',
            tipo: usuario.tipo || 'estudiante',
            activo: usuario.activo !== undefined ? usuario.activo : true
        });
        setShowModal(true);
    };

    const cerrarModal = () => {
        setShowModal(false);
        setUsuarioSeleccionado(null);
    };

    const abrirConfirmEliminar = (usuario) => {
        setUsuarioSeleccionado(usuario);
        setShowConfirm(true);
    };

    const handleEliminar = async () => {
        try {
            await usuarioService.eliminar(usuarioSeleccionado.idUsuario);
            mostrarAlerta('success', 'Usuario eliminado correctamente');
            setShowConfirm(false);
            cargarUsuarios();
        } catch (error) {
            mostrarAlerta('danger', error.response?.data?.mensaje || 'Error al eliminar usuario');
        }
    };

    const obtenerColorTipo = (tipo) => {
        switch(tipo) {
            case 'admin': return 'danger';
            case 'docente': return 'primary';
            case 'estudiante': return 'success';
            default: return 'secondary';
        }
    };

    return (
        <Container fluid>
            <AlertMessage
                show={alert.show}
                variant={alert.variant}
                message={alert.message}
                onClose={() => setAlert({ show: false, variant: '', message: '' })}
            />

            <Row className="mb-4">
                <Col>
                    <h2>Gestión de Usuarios</h2>
                </Col>
                <Col className="text-end">
                    <Button variant="primary" onClick={abrirModalNuevo}>
                        <i className="bi bi-plus-circle me-2"></i>
                        Nuevo Usuario
                    </Button>
                </Col>
            </Row>

            <Card className="shadow-sm mb-4">
                <Card.Body>
                    <Row>
                        <Col md={6}>
                            <InputGroup>
                                <Form.Control
                                    placeholder="Buscar por email o nombre de usuario..."
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
                                    <th>Nombre de Usuario</th>
                                    <th>Email</th>
                                    <th>Tipo</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usuarios.length > 0 ? (
                                    usuarios.map((usuario) => (
                                        <tr key={usuario.idUsuario}>
                                            <td>{usuario.idUsuario}</td>
                                            <td><strong>{usuario.nombreUsuario}</strong></td>
                                            <td>{usuario.email}</td>
                                            <td>
                                                <Badge bg={obtenerColorTipo(usuario.tipo)}>
                                                    {usuario.tipo}
                                                </Badge>
                                            </td>
                                            <td>
                                                <span className={`badge ${usuario.activo ? 'bg-success' : 'bg-secondary'}`}>
                                                    {usuario.activo ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>
                                            <td>
                                                <Button
                                                    variant="warning"
                                                    size="sm"
                                                    className="me-2"
                                                    onClick={() => abrirModalEditar(usuario)}
                                                >
                                                    <i className="bi bi-pencil"></i>
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={() => abrirConfirmEliminar(usuario)}
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center text-muted">
                                            No hay usuarios registrados
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
                        {usuarioSeleccionado ? 'Editar Usuario' : 'Nuevo Usuario'}
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Nombre de Usuario *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="nombreUsuario"
                                        value={formData.nombreUsuario}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Email *</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>
                                        Contraseña {usuarioSeleccionado ? '(dejar vacío para mantener)' : '*'}
                                    </Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required={!usuarioSeleccionado}
                                        minLength="6"
                                    />
                                    <Form.Text className="text-muted">
                                        Mínimo 6 caracteres
                                    </Form.Text>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Tipo de Usuario *</Form.Label>
                                    <Form.Select
                                        name="tipo"
                                        value={formData.tipo}
                                        onChange={handleChange}
                                        required
                                        disabled={usuarioSeleccionado?.idUsuario === usuarioActual.idUsuario && usuarioActual.tipo === 'admin'}
                                    >
                                        <option value="estudiante">Estudiante</option>
                                        <option value="docente">Docente</option>
                                        <option value="admin">Administrador</option>
                                    </Form.Select>
                                    {usuarioSeleccionado?.idUsuario === usuarioActual.idUsuario && usuarioActual.tipo === 'admin' && (
                                        <Form.Text className="text-warning">
                                            <i className="bi bi-exclamation-triangle me-1"></i>
                                            No puedes cambiar tu propio tipo de usuario
                                        </Form.Text>
                                    )}
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Check
                                        type="checkbox"
                                        name="activo"
                                        label="Usuario Activo"
                                        checked={formData.activo}
                                        onChange={handleChange}
                                    />
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
                title="Eliminar Usuario"
                message={`¿Está seguro de eliminar al usuario ${usuarioSeleccionado?.nombreUsuario}?`}
            />
        </Container>
    );
};

export default Usuarios;
