import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Modal, Badge } from 'react-bootstrap';
import { cursoService } from '../../services/cursoService';
import { docenteService } from '../../services/docenteService';
import AlertMessage from '../../components/common/AlertMessage';
import ConfirmModal from '../../components/common/ConfirmModal';

const Cursos = () => {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    const [cursos, setCursos] = useState([]);
    const [docentes, setDocentes] = useState([]);
    const [asignaturas, setAsignaturas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({ show: false, variant: '', message: '' });
    const [showModal, setShowModal] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showPromedios, setShowPromedios] = useState(false);
    const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
    const [promediosData, setPromediosData] = useState([]);
    const [formData, setFormData] = useState({
        nrc: '',
        asignaturaId: '',
        docenteId: '',
        periodoAcademico: '',
        cupoMaximo: '30',
        horario: ''
    });

    useEffect(() => {
        cargarCursos();
        cargarDocentes();
        cargarAsignaturas();
    }, []);

    const cargarCursos = async () => {
        try {
            setLoading(true);
            const data = await cursoService.obtenerTodos();
            setCursos(data);
        } catch (error) {
            mostrarAlerta('danger', 'Error al cargar cursos');
        } finally {
            setLoading(false);
        }
    };

    const cargarDocentes = async () => {
        try {
            const data = await docenteService.obtenerTodos();
            setDocentes(data);
        } catch (error) {
            console.error('Error al cargar docentes');
        }
    };

    const cargarAsignaturas = async () => {
        try {
            // Usando el servicio de curso que debe tener un método para obtener asignaturas
            const response = await fetch('http://localhost:3000/api/asignaturas');
            const data = await response.json();
            setAsignaturas(data);
        } catch (error) {
            console.error('Error al cargar asignaturas');
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
            const datosCurso = {
                ...formData,
                asignaturaId: parseInt(formData.asignaturaId),
                docenteId: parseInt(formData.docenteId),
                cupoMaximo: parseInt(formData.cupoMaximo)
            };

            if (cursoSeleccionado) {
                await cursoService.actualizar(cursoSeleccionado.idCurso, datosCurso);
                mostrarAlerta('success', 'Curso actualizado correctamente');
            } else {
                await cursoService.crear(datosCurso);
                mostrarAlerta('success', 'Curso creado correctamente');
            }
            cerrarModal();
            cargarCursos();
        } catch (error) {
            mostrarAlerta('danger', error.response?.data?.mensaje || 'Error al guardar curso');
        } finally {
            setLoading(false);
        }
    };

    const abrirModalNuevo = () => {
        setCursoSeleccionado(null);
        setFormData({
            nrc: '',
            asignaturaId: '',
            docenteId: '',
            periodoAcademico: '',
            cupoMaximo: '30',
            horario: ''
        });
        setShowModal(true);
    };

    const abrirModalEditar = (curso) => {
        setCursoSeleccionado(curso);
        setFormData({
            nrc: curso.nrc || '',
            asignaturaId: curso.asignaturaId || '',
            docenteId: curso.docenteId || '',
            periodoAcademico: curso.periodoAcademico || '',
            cupoMaximo: curso.cupoMaximo || '30',
            horario: curso.horario || ''
        });
        setShowModal(true);
    };

    const cerrarModal = () => {
        setShowModal(false);
        setCursoSeleccionado(null);
    };

    const abrirConfirmEliminar = (curso) => {
        setCursoSeleccionado(curso);
        setShowConfirm(true);
    };

    const handleEliminar = async () => {
        try {
            await cursoService.eliminar(cursoSeleccionado.idCurso);
            mostrarAlerta('success', 'Curso eliminado correctamente');
            setShowConfirm(false);
            cargarCursos();
        } catch (error) {
            mostrarAlerta('danger', error.response?.data?.mensaje || 'Error al eliminar curso');
        }
    };

    const abrirModalPromedios = async (curso) => {
        setCursoSeleccionado(curso);
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:3000/api/cursos/${curso.idCurso}/promedios`);
            const data = await response.json();
            setPromediosData(data);
            setShowPromedios(true);
        } catch (error) {
            mostrarAlerta('danger', 'Error al cargar promedios');
        } finally {
            setLoading(false);
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
                    <h2>{usuario.tipo === 'docente' ? 'Mis Cursos' : 'Gestión de Cursos'}</h2>
                </Col>
                {usuario.tipo === 'admin' && (
                    <Col className="text-end">
                        <Button variant="primary" onClick={abrirModalNuevo}>
                            <i className="bi bi-plus-circle me-2"></i>
                            Nuevo Curso
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
                                    <th>NRC</th>
                                    <th>Asignatura</th>
                                    <th>Docente</th>
                                    <th>Período</th>
                                    <th>Cupo Máximo</th>
                                    <th>Horario</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cursos.length > 0 ? (
                                    cursos.map((curso) => (
                                        <tr key={curso.idCurso}>
                                            <td>{curso.idCurso}</td>
                                            <td><strong>{curso.nrc}</strong></td>
                                            <td>{curso.asignatura?.nombreAsignatura || 'N/A'}</td>
                                            <td>{curso.docente?.nombreDocente || 'N/A'}</td>
                                            <td>
                                                <Badge bg="info">{curso.periodoAcademico}</Badge>
                                            </td>
                                            <td>{curso.cupoMaximo}</td>
                                            <td>{curso.horario || 'No especificado'}</td>
                                            <td>
                                                {usuario.tipo === 'admin' ? (
                                                    <>
                                                        <Button
                                                            variant="warning"
                                                            size="sm"
                                                            className="me-2"
                                                            onClick={() => abrirModalEditar(curso)}
                                                        >
                                                            <i className="bi bi-pencil"></i>
                                                        </Button>
                                                        <Button
                                                            variant="danger"
                                                            size="sm"
                                                            onClick={() => abrirConfirmEliminar(curso)}
                                                        >
                                                            <i className="bi bi-trash"></i>
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <span className="text-muted"></span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="text-center text-muted">
                                            No hay cursos registrados
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
                        {cursoSeleccionado ? 'Editar Curso' : 'Nuevo Curso'}
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>NRC *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="nrc"
                                        value={formData.nrc}
                                        onChange={handleChange}
                                        maxLength="10"
                                        required
                                    />
                                </Form.Group>
                            </Col>
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
                        </Row>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Asignatura *</Form.Label>
                                    <Form.Select
                                        name="asignaturaId"
                                        value={formData.asignaturaId}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Seleccione una asignatura...</option>
                                        {asignaturas.map(a => (
                                            <option key={a.idAsignatura} value={a.idAsignatura}>
                                                {a.codigoAsignatura} - {a.nombreAsignatura}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Docente *</Form.Label>
                                    <Form.Select
                                        name="docenteId"
                                        value={formData.docenteId}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Seleccione un docente...</option>
                                        {docentes.map(d => (
                                            <option key={d.idDocente} value={d.idDocente}>
                                                {d.nombreDocente}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Cupo Máximo *</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="cupoMaximo"
                                        value={formData.cupoMaximo}
                                        onChange={handleChange}
                                        min="1"
                                        max="100"
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Horario</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="horario"
                                        value={formData.horario}
                                        onChange={handleChange}
                                        placeholder="Ej: Lun-Mie 08:00-10:00"
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
                title="Eliminar Curso"
                message={`¿Está seguro de eliminar el curso ${cursoSeleccionado?.nrc}?`}
            />

            {/* Modal Promedios */}
            <Modal show={showPromedios} onHide={() => setShowPromedios(false)} size="xl">
                <Modal.Header closeButton>
                    <Modal.Title>
                        Promedios - {cursoSeleccionado?.nrc} ({cursoSeleccionado?.asignatura?.nombreAsignatura})
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {usuario.tipo === 'estudiante' ? (
                        // Vista de estudiante: solo sus promedios
                        <div>
                            {promediosData.length > 0 ? (
                                promediosData.map(est => (
                                    <Card key={est.idEstudiante} className="mb-3">
                                        <Card.Body>
                                            <h5>{est.nombreEstudiante}</h5>
                                            <Row className="mt-3">
                                                <Col md={3}>
                                                    <div className="text-center p-3 bg-light rounded">
                                                        <h6 className="text-muted">Parcial 1</h6>
                                                        <h3 className={`mb-0 ${est.promedioParcial1 >= 14 ? 'text-success' : est.promedioParcial1 >= 10 ? 'text-warning' : 'text-danger'}`}>
                                                            {est.promedioParcial1 ? est.promedioParcial1.toFixed(2) : 'N/A'}
                                                        </h3>
                                                    </div>
                                                </Col>
                                                <Col md={3}>
                                                    <div className="text-center p-3 bg-light rounded">
                                                        <h6 className="text-muted">Parcial 2</h6>
                                                        <h3 className={`mb-0 ${est.promedioParcial2 >= 14 ? 'text-success' : est.promedioParcial2 >= 10 ? 'text-warning' : 'text-danger'}`}>
                                                            {est.promedioParcial2 ? est.promedioParcial2.toFixed(2) : 'N/A'}
                                                        </h3>
                                                    </div>
                                                </Col>
                                                <Col md={3}>
                                                    <div className="text-center p-3 bg-light rounded">
                                                        <h6 className="text-muted">Parcial 3</h6>
                                                        <h3 className={`mb-0 ${est.promedioParcial3 >= 14 ? 'text-success' : est.promedioParcial3 >= 10 ? 'text-warning' : 'text-danger'}`}>
                                                            {est.promedioParcial3 ? est.promedioParcial3.toFixed(2) : 'N/A'}
                                                        </h3>
                                                    </div>
                                                </Col>
                                                <Col md={3}>
                                                    <div className="text-center p-3 bg-primary text-white rounded">
                                                        <h6>Promedio Final</h6>
                                                        <h3 className="mb-0">
                                                            {est.promedioFinal ? est.promedioFinal.toFixed(2) : 'N/A'}
                                                        </h3>
                                                    </div>
                                                </Col>
                                            </Row>
                                        </Card.Body>
                                    </Card>
                                ))
                            ) : (
                                <p className="text-center text-muted">No tienes notas registradas en este curso</p>
                            )}
                        </div>
                    ) : (
                        // Vista de admin/docente: todos los estudiantes
                        <Table responsive hover>
                            <thead className="table-dark">
                                <tr>
                                    <th>Estudiante</th>
                                    <th className="text-center">Parcial 1</th>
                                    <th className="text-center">Parcial 2</th>
                                    <th className="text-center">Parcial 3</th>
                                    <th className="text-center">Promedio Final</th>
                                    <th className="text-center">Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {promediosData.length > 0 ? (
                                    promediosData.map(est => (
                                        <tr key={est.idEstudiante}>
                                            <td><strong>{est.nombreEstudiante}</strong></td>
                                            <td className="text-center">
                                                <Badge bg={est.promedioParcial1 >= 14 ? 'success' : est.promedioParcial1 >= 10 ? 'warning' : 'danger'}>
                                                    {est.promedioParcial1 ? est.promedioParcial1.toFixed(2) : 'N/A'}
                                                </Badge>
                                            </td>
                                            <td className="text-center">
                                                <Badge bg={est.promedioParcial2 >= 14 ? 'success' : est.promedioParcial2 >= 10 ? 'warning' : 'danger'}>
                                                    {est.promedioParcial2 ? est.promedioParcial2.toFixed(2) : 'N/A'}
                                                </Badge>
                                            </td>
                                            <td className="text-center">
                                                <Badge bg={est.promedioParcial3 >= 14 ? 'success' : est.promedioParcial3 >= 10 ? 'warning' : 'danger'}>
                                                    {est.promedioParcial3 ? est.promedioParcial3.toFixed(2) : 'N/A'}
                                                </Badge>
                                            </td>
                                            <td className="text-center">
                                                <h5>
                                                    <Badge bg={est.promedioFinal >= 14 ? 'success' : est.promedioFinal >= 10 ? 'warning' : 'danger'}>
                                                        {est.promedioFinal ? est.promedioFinal.toFixed(2) : 'N/A'}
                                                    </Badge>
                                                </h5>
                                            </td>
                                            <td className="text-center">
                                                {est.promedioFinal >= 14 ? (
                                                    <Badge bg="success">Aprobado</Badge>
                                                ) : est.promedioFinal >= 10 ? (
                                                    <Badge bg="warning">En riesgo</Badge>
                                                ) : (
                                                    <Badge bg="danger">Reprobado</Badge>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center text-muted">
                                            No hay estudiantes matriculados en este curso
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowPromedios(false)}>
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Cursos;
