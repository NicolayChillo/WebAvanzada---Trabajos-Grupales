import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Modal, Badge } from 'react-bootstrap';
import { matriculaService } from '../../services/matriculaService';
import { estudianteService } from '../../services/estudianteService';
import { cursoService } from '../../services/cursoService';
import AlertMessage from '../../components/common/AlertMessage';
import ConfirmModal from '../../components/common/ConfirmModal';

const Matriculas = () => {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    const [matriculas, setMatriculas] = useState([]);
    const [estudiantes, setEstudiantes] = useState([]);
    const [cursos, setCursos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({ show: false, variant: '', message: '' });
    const [showModal, setShowModal] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [matriculaSeleccionada, setMatriculaSeleccionada] = useState(null);
    const [formData, setFormData] = useState({
        estudianteId: '',
        cursoId: '',
        periodoAcademico: '',
        fechaMatricula: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        cargarMatriculas();
        cargarEstudiantes();
        cargarCursos();
    }, []);

    const cargarMatriculas = async () => {
        try {
            setLoading(true);
            const data = await matriculaService.obtenerTodas();
            setMatriculas(data);
        } catch (error) {
            mostrarAlerta('danger', 'Error al cargar matrículas');
        } finally {
            setLoading(false);
        }
    };

    const cargarEstudiantes = async () => {
        try {
            const data = await estudianteService.obtenerTodos();
            setEstudiantes(data.filter(e => e.estado === 'activo'));
        } catch (error) {
            console.error('Error al cargar estudiantes');
        }
    };

    const cargarCursos = async () => {
        try {
            const data = await cursoService.obtenerTodos();
            setCursos(data);
        } catch (error) {
            console.error('Error al cargar cursos');
        }
    };

    const mostrarAlerta = (variant, message) => {
        setAlert({ show: true, variant, message });
        setTimeout(() => setAlert({ show: false, variant: '', message: '' }), 5000);
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
            const datosMatricula = {
                ...formData,
                estudianteId: parseInt(formData.estudianteId),
                cursoId: parseInt(formData.cursoId),
                estado: 'activa'
            };

            if (matriculaSeleccionada) {
                await matriculaService.actualizar(matriculaSeleccionada.idMatricula, datosMatricula);
                mostrarAlerta('success', 'Matrícula actualizada correctamente');
            } else {
                await matriculaService.crear(datosMatricula);
                mostrarAlerta('success', 'Estudiante matriculado correctamente');
            }
            cerrarModal();
            cargarMatriculas();
        } catch (error) {
            mostrarAlerta('danger', error.response?.data?.mensaje || 'Error al guardar matrícula');
        } finally {
            setLoading(false);
        }
    };

    const abrirModalNuevo = () => {
        setMatriculaSeleccionada(null);
        setFormData({
            estudianteId: '',
            cursoId: '',
            periodoAcademico: '',
            fechaMatricula: new Date().toISOString().split('T')[0]
        });
        setShowModal(true);
    };

    const abrirModalEditar = (matricula) => {
        setMatriculaSeleccionada(matricula);
        setFormData({
            estudianteId: matricula.estudianteId || '',
            cursoId: matricula.cursoId || '',
            periodoAcademico: matricula.periodoAcademico || '',
            fechaMatricula: matricula.fechaMatricula || ''
        });
        setShowModal(true);
    };

    const cerrarModal = () => {
        setShowModal(false);
        setMatriculaSeleccionada(null);
    };

    const abrirConfirmEliminar = (matricula) => {
        setMatriculaSeleccionada(matricula);
        setShowConfirm(true);
    };

    const handleEliminar = async () => {
        try {
            await matriculaService.eliminar(matriculaSeleccionada.idMatricula);
            mostrarAlerta('success', 'Matrícula eliminada correctamente');
            setShowConfirm(false);
            cargarMatriculas();
        } catch (error) {
            mostrarAlerta('danger', error.response?.data?.mensaje || 'Error al eliminar matrícula');
        }
    };

    const obtenerEstadoColor = (estado) => {
        switch(estado) {
            case 'activa': return 'success';
            case 'retirada': return 'danger';
            case 'completada': return 'primary';
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
                    <h2>{usuario.tipo === 'estudiante' ? 'Mis Matrículas' : 'Gestión de Matrículas'}</h2>
                </Col>
                {usuario.tipo !== 'docente' && (
                    <Col className="text-end">
                        <Button variant="primary" onClick={abrirModalNuevo}>
                            <i className="bi bi-plus-circle me-2"></i>
                            Nueva Matrícula
                        </Button>
                    </Col>
                )}
            </Row>

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
                                    <th>Estudiante</th>
                                    <th>Curso (NRC)</th>
                                    <th>Asignatura</th>
                                    <th>Período</th>
                                    <th>Fecha Matrícula</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {matriculas.length > 0 ? (
                                    matriculas.map((matricula) => (
                                        <tr key={matricula.idMatricula}>
                                            <td>{matricula.idMatricula}</td>
                                            <td>{matricula.estudiante?.nombreEstudiante || 'N/A'}</td>
                                            <td><strong>{matricula.curso?.nrc || 'N/A'}</strong></td>
                                            <td>{matricula.curso?.asignatura?.nombreAsignatura || 'N/A'}</td>
                                            <td>{matricula.periodoAcademico}</td>
                                            <td>{matricula.fechaMatricula}</td>
                                            <td>
                                                <Badge bg={obtenerEstadoColor(matricula.estado)}>
                                                    {matricula.estado}
                                                </Badge>
                                            </td>
                                            <td>
                                                {usuario.tipo === 'admin' ? (
                                                    <>
                                                        <Button
                                                            variant="warning"
                                                            size="sm"
                                                            className="me-2"
                                                            onClick={() => abrirModalEditar(matricula)}
                                                        >
                                                            <i className="bi bi-pencil"></i>
                                                        </Button>
                                                        <Button
                                                            variant="danger"
                                                            size="sm"
                                                            onClick={() => abrirConfirmEliminar(matricula)}
                                                        >
                                                            <i className="bi bi-trash"></i>
                                                        </Button>
                                                    </>
                                                ) : usuario.tipo === 'estudiante' ? (
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() => abrirConfirmEliminar(matricula)}
                                                    >
                                                        <i className="bi bi-x-circle"></i> Retirar
                                                    </Button>
                                                ) : (
                                                    <span className="text-muted">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="text-center text-muted">
                                            No hay matrículas registradas
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
                        {matriculaSeleccionada ? 'Editar Matrícula' : 'Nueva Matrícula'}
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Estudiante *</Form.Label>
                                    <Form.Select
                                        name="estudianteId"
                                        value={formData.estudianteId}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Seleccione un estudiante...</option>
                                        {estudiantes.map(e => (
                                            <option key={e.idEstudiante} value={e.idEstudiante}>
                                                {e.cedula} - {e.nombreEstudiante}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Curso *</Form.Label>
                                    <Form.Select
                                        name="cursoId"
                                        value={formData.cursoId}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Seleccione un curso...</option>
                                        {cursos.map(c => (
                                            <option key={c.idCurso} value={c.idCurso}>
                                                {c.nrc} - {c.asignatura?.nombreAsignatura || 'Sin asignatura'}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Período Académico *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="periodoAcademico"
                                        value={formData.periodoAcademico}
                                        onChange={handleChange}
                                        placeholder="Ej: 2024-1"
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Fecha de Matrícula *</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="fechaMatricula"
                                        value={formData.fechaMatricula}
                                        onChange={handleChange}
                                        required
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
                title="Eliminar Matrícula"
                message={`¿Está seguro de eliminar esta matrícula?`}
            />
        </Container>
    );
};

export default Matriculas;
