import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, InputGroup, Modal } from 'react-bootstrap';
import { estudianteService } from '../../services/estudianteService';
import { usuarioService } from '../../services/usuarioService';
import AlertMessage from '../../components/common/AlertMessage';
import ConfirmModal from '../../components/common/ConfirmModal';

const Estudiantes = () => {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    const [estudiantes, setEstudiantes] = useState([]);
    const [estudianteActual, setEstudianteActual] = useState(null);
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({ show: false, variant: '', message: '' });
    const [busqueda, setBusqueda] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showDetalle, setShowDetalle] = useState(false);
    const [estudianteSeleccionado, setEstudianteSeleccionado] = useState(null);
    const [formData, setFormData] = useState({
        cedula: '',
        nombreEstudiante: '',
        fechaNacimiento: '',
        direccion: '',
        telefono: '',
        foto: '',
        email: '',
        nombreUsuario: '',
        password: ''
    });
    const [editandoPerfil, setEditandoPerfil] = useState(false);

    const cargarEstudiantes = useCallback(async () => {
        try {
            setLoading(true);
            const data = await estudianteService.obtenerTodos();
            setEstudiantes(data);
        } catch (error) {
            mostrarAlerta('danger', 'Error al cargar estudiantes');
        } finally {
            setLoading(false);
        }
    }, []);

    const cargarEstudianteActual = useCallback(async () => {
        try {
            setLoading(true);
            if (usuario.idEstudiante) {
                const data = await estudianteService.obtenerPorId(usuario.idEstudiante);
                setEstudianteActual(data);
            } else {
                // fallback: cargar todos y filtrar por usuarioId
                const data = await estudianteService.obtenerTodos();
                const encontrado = data.find(e => e.usuarioId === usuario.idUsuario);
                setEstudianteActual(encontrado || null);
            }
        } catch (error) {
            mostrarAlerta('danger', 'Error al cargar tus datos');
        } finally {
            setLoading(false);
        }
    }, [usuario.idEstudiante, usuario.idUsuario]);

    useEffect(() => {
        if (usuario.tipo === 'estudiante') {
            cargarEstudianteActual();
        } else {
            cargarEstudiantes();
        }
    }, [usuario.tipo, cargarEstudianteActual, cargarEstudiantes]);

    const mostrarAlerta = (variant, message) => {
        setAlert({ show: true, variant, message });
        setTimeout(() => setAlert({ show: false, variant: '', message: '' }), 5000);
    };

    const handleBuscar = useCallback(async () => {
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
    }, [busqueda, cargarEstudiantes]);

    useEffect(() => {
        if (usuario.tipo !== 'admin') return; // solo aplica a tabla admin
        const t = setTimeout(() => {
            handleBuscar();
        }, 300);
        return () => clearTimeout(t);
    }, [busqueda, usuario.tipo, handleBuscar]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const iniciarEditarPerfil = () => {
        setFormData({
            cedula: estudianteActual.cedula || '',
            nombreEstudiante: estudianteActual.nombreEstudiante || '',
            fechaNacimiento: estudianteActual.fechaNacimiento || '',
            direccion: estudianteActual.direccion || '',
            telefono: estudianteActual.telefono || '',
            foto: estudianteActual.foto || '',
            email: usuario.email || '',
            nombreUsuario: usuario.nombreUsuario || '',
            password: ''
        });
        setEditandoPerfil(true);
    };

    const cancelarEditarPerfil = () => {
        setEditandoPerfil(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (editandoPerfil && estudianteActual) {
                // Actualizar perfil del estudiante actual
                const datosEstudiante = {
                    cedula: formData.cedula,
                    nombreEstudiante: formData.nombreEstudiante,
                    fechaNacimiento: formData.fechaNacimiento,
                    direccion: formData.direccion,
                    telefono: formData.telefono,
                    foto: formData.foto
                };
                await estudianteService.actualizar(estudianteActual.idEstudiante, datosEstudiante);
                
                // Si cambió password o usuario, actualizar también
                if (formData.password || formData.nombreUsuario !== usuario.nombreUsuario) {
                    const datosUsuario = {};
                    if (formData.password) datosUsuario.password = formData.password;
                    if (formData.nombreUsuario !== usuario.nombreUsuario) datosUsuario.nombreUsuario = formData.nombreUsuario;
                    if (Object.keys(datosUsuario).length > 0) {
                        await usuarioService.actualizar(usuario.idUsuario, datosUsuario);
                    }
                }
                
                mostrarAlerta('success', 'Perfil actualizado correctamente');
                cancelarEditarPerfil();
                cargarEstudianteActual();
            } else if (estudianteSeleccionado) {
                // Al editar desde admin
                const datosEstudiante = {
                    cedula: formData.cedula,
                    nombreEstudiante: formData.nombreEstudiante,
                    fechaNacimiento: formData.fechaNacimiento,
                    direccion: formData.direccion,
                    telefono: formData.telefono,
                    foto: formData.foto
                };
                await estudianteService.actualizar(estudianteSeleccionado.idEstudiante, datosEstudiante);
                mostrarAlerta('success', 'Estudiante actualizado correctamente');
            } else {
                // Al crear
                const datosCompletos = {
                    cedula: formData.cedula,
                    nombreEstudiante: formData.nombreEstudiante,
                    fechaNacimiento: formData.fechaNacimiento,
                    direccion: formData.direccion,
                    telefono: formData.telefono,
                    foto: formData.foto,
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
            mostrarAlerta('danger', error.response?.data?.mensaje || 'Error al guardar');
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
            foto: '',
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
            foto: estudiante.foto || '',
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

    const abrirDetalle = (estudiante) => {
        setEstudianteSeleccionado(estudiante);
        setShowDetalle(true);
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
                    <h2>{usuario.tipo === 'estudiante' ? 'Perfil' : 'Gestión de Estudiantes'}</h2>
                </Col>
                {usuario.tipo === 'admin' && (
                    <Col xs="auto">
                        <Button variant="primary" onClick={abrirModalNuevo}>
                            <i className="bi bi-plus-circle me-2"></i>
                            Nuevo Estudiante
                        </Button>
                    </Col>
                )}
            </Row>

            {alert.show && (
                <AlertMessage
                    variant={alert.variant}
                    message={alert.message}
                    onClose={() => setAlert({ show: false, variant: '', message: '' })}
                />
            )}

            {usuario.tipo === 'estudiante' ? (
                <Card className="shadow-sm">
                    <Card.Body>
                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Cargando...</span>
                                </div>
                            </div>
                        ) : estudianteActual ? (
                            editandoPerfil ? (
                                <Form onSubmit={handleSubmit}>
                                    <Row className="mb-3">
                                        <Col md={4} className="text-center mb-3">
                                            <div className="mb-3">
                                                <img
                                                    src={formData.foto || 'https://via.placeholder.com/200?text=Foto'}
                                                    alt="Preview"
                                                    style={{ width: '160px', height: '160px', objectFit: 'cover', borderRadius: '12px' }}
                                                />
                                            </div>
                                            <Form.Group className="mb-3">
                                                <Form.Label>URL de Foto</Form.Label>
                                                <Form.Control
                                                    type="url"
                                                    name="foto"
                                                    value={formData.foto}
                                                    onChange={handleChange}
                                                    placeholder="https://..."
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={8}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Nombre Estudiante</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="nombreEstudiante"
                                                    value={formData.nombreEstudiante}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </Form.Group>
                                            <Row>
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Cédula</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            name="cedula"
                                                            value={formData.cedula}
                                                            onChange={handleChange}
                                                            required
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Teléfono</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            name="telefono"
                                                            value={formData.telefono}
                                                            onChange={handleChange}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Fecha Nacimiento</Form.Label>
                                                        <Form.Control
                                                            type="date"
                                                            name="fechaNacimiento"
                                                            value={formData.fechaNacimiento}
                                                            onChange={handleChange}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Usuario</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            name="nombreUsuario"
                                                            value={formData.nombreUsuario}
                                                            onChange={handleChange}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Dirección</Form.Label>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={2}
                                                    name="direccion"
                                                    value={formData.direccion}
                                                    onChange={handleChange}
                                                />
                                            </Form.Group>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Nueva Contraseña (dejar en blanco para no cambiar)</Form.Label>
                                                <Form.Control
                                                    type="password"
                                                    name="password"
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    placeholder="••••••••"
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Row className="mt-4">
                                        <Col className="d-flex gap-2 justify-content-end">
                                            <Button variant="secondary" onClick={cancelarEditarPerfil}>
                                                Cancelar
                                            </Button>
                                            <Button variant="primary" type="submit" disabled={loading}>
                                                {loading ? 'Guardando...' : 'Guardar Cambios'}
                                            </Button>
                                        </Col>
                                    </Row>
                                </Form>
                            ) : (
                                <>
                                    <Row className="align-items-center">
                                        <Col md={4} className="text-center mb-3">
                                            <img
                                                src={estudianteActual.foto || 'https://via.placeholder.com/200?text=Foto'}
                                                alt={estudianteActual.nombreEstudiante}
                                                style={{ width: '160px', height: '160px', objectFit: 'cover', borderRadius: '12px' }}
                                            />
                                        </Col>
                                        <Col md={8}>
                                            <h4 className="mb-3">{estudianteActual.nombreEstudiante}</h4>
                                            <Row className="mb-2">
                                                <Col sm={6}><strong>Cédula:</strong> {estudianteActual.cedula}</Col>
                                                <Col sm={6}><strong>Teléfono:</strong> {estudianteActual.telefono}</Col>
                                            </Row>
                                            <Row className="mb-2">
                                                <Col sm={6}><strong>Fecha Nacimiento:</strong> {estudianteActual.fechaNacimiento}</Col>
                                                <Col sm={6}><strong>Estado:</strong> {estudianteActual.estado}</Col>
                                            </Row>
                                            <Row className="mb-2">
                                                <Col sm={12}><strong>Dirección:</strong> {estudianteActual.direccion}</Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                    <Row className="mt-4">
                                        <Col className="d-flex gap-2 justify-content-end">
                                            <Button variant="primary" onClick={iniciarEditarPerfil}>
                                                <i className="bi bi-pencil me-2"></i>Editar Perfil
                                            </Button>
                                        </Col>
                                    </Row>
                                </>
                            )
                        ) : (
                            <p className="text-muted mb-0">No se encontraron tus datos.</p>
                        )}
                    </Card.Body>
                </Card>
            ) : (
                <>
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
                                                    <td className="d-flex gap-2">
                                                        <Button
                                                            variant="info"
                                                            size="sm"
                                                            onClick={() => abrirDetalle(estudiante)}
                                                        >
                                                            <i className="bi bi-eye"></i>
                                                        </Button>
                                                        <Button
                                                            variant="warning"
                                                            size="sm"
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
                </>
            )}

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
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Foto (URL)</Form.Label>
                                    <Form.Control
                                        type="url"
                                        name="foto"
                                        value={formData.foto}
                                        onChange={handleChange}
                                        placeholder="https://..."
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

            <Modal show={showDetalle} onHide={() => setShowDetalle(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Detalle de estudiante</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {estudianteSeleccionado ? (
                        <Row className="align-items-center">
                            <Col md={4} className="text-center mb-3">
                                <img
                                    src={estudianteSeleccionado.foto || 'https://via.placeholder.com/200?text=Foto'}
                                    alt={estudianteSeleccionado.nombreEstudiante}
                                    style={{ width: '160px', height: '160px', objectFit: 'cover', borderRadius: '12px' }}
                                />
                            </Col>
                            <Col md={8}>
                                <h5 className="mb-3">{estudianteSeleccionado.nombreEstudiante}</h5>
                                <Row className="mb-2">
                                    <Col sm={6}><strong>Cédula:</strong> {estudianteSeleccionado.cedula}</Col>
                                    <Col sm={6}><strong>Teléfono:</strong> {estudianteSeleccionado.telefono}</Col>
                                </Row>
                                <Row className="mb-2">
                                    <Col sm={6}><strong>Fecha Nacimiento:</strong> {estudianteSeleccionado.fechaNacimiento}</Col>
                                    <Col sm={6}><strong>Estado:</strong> {estudianteSeleccionado.estado}</Col>
                                </Row>
                                <Row className="mb-2">
                                    <Col sm={12}><strong>Dirección:</strong> {estudianteSeleccionado.direccion}</Col>
                                </Row>
                            </Col>
                        </Row>
                    ) : (
                        <p className="text-muted mb-0">Sin datos.</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDetalle(false)}>Cerrar</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Estudiantes;
