import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Modal, Badge } from 'react-bootstrap';
import { notaService } from '../../services/notaService';
import { matriculaService } from '../../services/matriculaService';
import { docenteService } from '../../services/docenteService';
import AlertMessage from '../../components/common/AlertMessage';
import ConfirmModal from '../../components/common/ConfirmModal';

const Notas = () => {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    const [notas, setNotas] = useState([]);
    const [matriculas, setMatriculas] = useState([]);
    const [docentes, setDocentes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({ show: false, variant: '', message: '' });
    const [showModal, setShowModal] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showDetalle, setShowDetalle] = useState(false);
    const [notaSeleccionada, setNotaSeleccionada] = useState(null);
    const [detalleSeleccionado, setDetalleSeleccionado] = useState({ curso: null, estudiante: null, notas: [], parciales: {}, matriculaId: null });
    const [agrupadoCursos, setAgrupadoCursos] = useState([]);
    const [filtros, setFiltros] = useState({
        parcial: '',
        tipoEvaluacion: ''
    });
    const [formData, setFormData] = useState({
        matriculaId: '',
        parcial: '1',
        tipoEvaluacion: 'examen',
        calificacion: '',
        porcentaje: '',
        fechaEvaluacion: '',
        docenteId: '',
        observaciones: ''
    });

    const tiposEvaluacion = [
        { value: 'examen', label: 'Examen', porcentajeSugerido: 40 },
        { value: 'tarea', label: 'Tarea', porcentajeSugerido: 20 },
        { value: 'proyecto', label: 'Proyecto', porcentajeSugerido: 20 },
        { value: 'participacion', label: 'Participación', porcentajeSugerido: 20 }
    ];

    useEffect(() => {
        cargarNotas();
        cargarMatriculas();
        cargarDocentes();
    }, []);

    const cargarNotas = async (filtrosActuales = {}) => {
        try {
            setLoading(true);
            const data = await notaService.obtenerTodas(filtrosActuales);
            setNotas(data);
            setAgrupadoCursos(agruparNotas(data));
        } catch (error) {
            mostrarAlerta('danger', 'Error al cargar notas');
        } finally {
            setLoading(false);
        }
    };

    const cargarMatriculas = async () => {
        try {
            const data = await matriculaService.obtenerTodas();
            setMatriculas(data);
        } catch (error) {
            console.error('Error al cargar matrículas');
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

    const agruparNotas = (lista) => {
        const cursosMap = new Map();

        lista.forEach((nota) => {
            const curso = nota.matricula?.curso;
            const estudiante = nota.matricula?.estudiante;
            if (!curso || !estudiante) return;

            // filtrar para estudiantes: solo sus notas
            if (usuario.tipo === 'estudiante' && estudiante.idEstudiante !== usuario.idEstudiante && estudiante.usuarioId !== usuario.idUsuario) {
                return;
            }

            if (!cursosMap.has(curso.idCurso)) {
                cursosMap.set(curso.idCurso, {
                    idCurso: curso.idCurso,
                    nrc: curso.nrc,
                    asignatura: curso.asignatura?.nombreAsignatura,
                    estudiantes: new Map()
                });
            }

            const cursoEntry = cursosMap.get(curso.idCurso);
            if (!cursoEntry.estudiantes.has(estudiante.idEstudiante)) {
                cursoEntry.estudiantes.set(estudiante.idEstudiante, {
                    idEstudiante: estudiante.idEstudiante,
                    nombreEstudiante: estudiante.nombreEstudiante,
                    matriculaId: nota.matriculaId,
                    parciales: {
                        1: { notas: [], suma: 0 },
                        2: { notas: [], suma: 0 },
                        3: { notas: [], suma: 0 }
                    }
                });
            }

            const estEntry = cursoEntry.estudiantes.get(estudiante.idEstudiante);
            const parcialKey = nota.parcial;
            if (estEntry.parciales[parcialKey]) {
                estEntry.parciales[parcialKey].notas.push(nota);
                estEntry.parciales[parcialKey].suma += Number(nota.aporte) || 0;
            }
        });

        // calcular promedios
        const resultado = Array.from(cursosMap.values()).map(curso => {
            const estudiantes = Array.from(curso.estudiantes.values()).map(est => {
                const p1 = est.parciales[1].suma;
                const p2 = est.parciales[2].suma;
                const p3 = est.parciales[3].suma;
                const parcialesConNotas = [p1, p2, p3].filter(v => v > 0).length;
                const promedioFinal = parcialesConNotas > 0 ? (p1 + p2 + p3) / parcialesConNotas : 0;
                const estado = promedioFinal >= 14 ? 'Aprobado' : promedioFinal >= 10 ? 'En recuperación' : 'Reprobado';
                return {
                    ...est,
                    promedioParcial1: p1,
                    promedioParcial2: p2,
                    promedioParcial3: p3,
                    promedioFinal,
                    estado
                };
            });
            return { ...curso, estudiantes };
        });

        return resultado;
    };

    const abrirDetalleNotas = (cursoId, estudianteId) => {
        const curso = agrupadoCursos.find(c => c.idCurso === cursoId);
        if (!curso) return;
        const estudiante = curso.estudiantes.find(e => e.idEstudiante === estudianteId);
        if (!estudiante) return;

        const notasDetalle = [];
        [1, 2, 3].forEach(parcial => {
            const grupo = estudiante.parciales[parcial];
            if (grupo) {
                notasDetalle.push({ parcial, notas: grupo.notas });
            }
        });

        setDetalleSeleccionado({
            curso,
            estudiante,
            notas: notasDetalle,
            parciales: estudiante.parciales,
            matriculaId: estudiante.matriculaId
        });
        setShowDetalle(true);
    };

    const mostrarAlerta = (variant, message) => {
        setAlert({ show: true, variant, message });
        setTimeout(() => setAlert({ show: false, variant: '', message: '' }), 5000);
    };

    const handleChangeFiltro = (e) => {
        const nuevosFiltros = {
            ...filtros,
            [e.target.name]: e.target.value
        };
        setFiltros(nuevosFiltros);
        cargarNotas(nuevosFiltros);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        // Auto-completar porcentaje según tipo de evaluación
        if (name === 'tipoEvaluacion') {
            const tipo = tiposEvaluacion.find(t => t.value === value);
            if (tipo) {
                setFormData(prev => ({
                    ...prev,
                    porcentaje: tipo.porcentajeSugerido
                }));
            }
        }
    };

    const calcularAporte = () => {
        if (formData.calificacion && formData.porcentaje) {
            return ((parseFloat(formData.calificacion) * parseFloat(formData.porcentaje)) / 100).toFixed(2);
        }
        return '0.00';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const aporte = calcularAporte();
            const datosNota = {
                ...formData,
                parcial: parseInt(formData.parcial),
                calificacion: parseFloat(formData.calificacion),
                porcentaje: parseFloat(formData.porcentaje),
                aporte: parseFloat(aporte),
                matriculaId: parseInt(formData.matriculaId),
                docenteId: parseInt(formData.docenteId)
            };

            if (notaSeleccionada) {
                await notaService.actualizar(notaSeleccionada.idNota, datosNota);
                mostrarAlerta('success', 'Nota actualizada correctamente');
            } else {
                await notaService.crear(datosNota);
                mostrarAlerta('success', 'Nota registrada correctamente');
            }
            cerrarModal();
            cargarNotas(filtros);
        } catch (error) {
            mostrarAlerta('danger', error.response?.data?.mensaje || 'Error al guardar nota');
        } finally {
            setLoading(false);
        }
    };

    const abrirModalNuevo = () => {
        setNotaSeleccionada(null);
        setFormData({
            matriculaId: '',
            parcial: '1',
            tipoEvaluacion: 'examen',
            calificacion: '',
            porcentaje: '40',
            fechaEvaluacion: new Date().toISOString().split('T')[0],
            docenteId: '',
            observaciones: ''
        });
        setShowModal(true);
    };

    const abrirModalEditar = (nota) => {
        setNotaSeleccionada(nota);
        setFormData({
            matriculaId: nota.matriculaId || '',
            parcial: nota.parcial?.toString() || '1',
            tipoEvaluacion: nota.tipoEvaluacion || 'examen',
            calificacion: nota.calificacion || '',
            porcentaje: nota.porcentaje || '',
            fechaEvaluacion: nota.fechaEvaluacion || '',
            docenteId: nota.docenteId || '',
            observaciones: nota.observaciones || ''
        });
        setShowModal(true);
    };

    const cerrarModal = () => {
        setShowModal(false);
        setNotaSeleccionada(null);
    };

    const abrirConfirmEliminar = (nota) => {
        setNotaSeleccionada(nota);
        setShowConfirm(true);
    };

    const handleEliminar = async () => {
        try {
            await notaService.eliminar(notaSeleccionada.idNota);
            mostrarAlerta('success', 'Nota eliminada correctamente');
            setShowConfirm(false);
            cargarNotas(filtros);
        } catch (error) {
            mostrarAlerta('danger', error.response?.data?.mensaje || 'Error al eliminar nota');
        }
    };

    const obtenerColorNota = (calificacion) => {
        if (calificacion >= 14) return 'success';
        if (calificacion >= 10) return 'warning';
        return 'danger';
    };

    return (
        <Container fluid>
            <Row className="mb-4">
                <Col>
                    <h2>{usuario.tipo === 'estudiante' ? 'Mis Notas' : 'Gestión de Notas'}</h2>
                </Col>
                {(usuario.tipo === 'admin' || usuario.tipo === 'docente') && (
                    <Col className="text-end">
                        <Button variant="primary" onClick={abrirModalNuevo}>
                            <i className="bi bi-plus-circle me-2"></i>
                            Registrar Nota
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

            <Card className="shadow-sm mb-4">
                <Card.Body>
                    <Row>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>Filtrar por Parcial</Form.Label>
                                <Form.Select
                                    name="parcial"
                                    value={filtros.parcial}
                                    onChange={handleChangeFiltro}
                                >
                                    <option value="">Todos</option>
                                    <option value="1">Parcial 1</option>
                                    <option value="2">Parcial 2</option>
                                    <option value="3">Parcial 3</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>Tipo de Evaluación</Form.Label>
                                <Form.Select
                                    name="tipoEvaluacion"
                                    value={filtros.tipoEvaluacion}
                                    onChange={handleChangeFiltro}
                                >
                                    <option value="">Todos</option>
                                    {tiposEvaluacion.map(tipo => (
                                        <option key={tipo.value} value={tipo.value}>
                                            {tipo.label}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
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
                    ) : agrupadoCursos.length === 0 ? (
                        <p className="text-center text-muted mb-0">No hay notas registradas</p>
                    ) : (
                        agrupadoCursos.map(curso => (
                            <Card key={curso.idCurso} className="mb-3">
                                <Card.Header className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <strong>{curso.nrc}</strong> - {curso.asignatura || 'Asignatura'}
                                    </div>
                                    <Badge bg="secondary">Curso ID: {curso.idCurso}</Badge>
                                </Card.Header>
                                <Card.Body>
                                    <Table responsive hover size="sm">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Estudiante</th>
                                                <th className="text-center">Parcial 1</th>
                                                <th className="text-center">Parcial 2</th>
                                                <th className="text-center">Parcial 3</th>
                                                <th className="text-center">Promedio Final</th>
                                                <th className="text-center">Estado</th>
                                                <th className="text-center">Notas</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {curso.estudiantes.map(est => (
                                                <tr key={est.idEstudiante}>
                                                    <td><strong>{est.nombreEstudiante}</strong></td>
                                                    <td className="text-center">
                                                        <Badge bg={est.promedioParcial1 >= 14 ? 'success' : est.promedioParcial1 >= 10 ? 'warning' : 'danger'}>
                                                            {est.promedioParcial1 ? est.promedioParcial1.toFixed(2) : '0.00'}
                                                        </Badge>
                                                    </td>
                                                    <td className="text-center">
                                                        <Badge bg={est.promedioParcial2 >= 14 ? 'success' : est.promedioParcial2 >= 10 ? 'warning' : 'danger'}>
                                                            {est.promedioParcial2 ? est.promedioParcial2.toFixed(2) : '0.00'}
                                                        </Badge>
                                                    </td>
                                                    <td className="text-center">
                                                        <Badge bg={est.promedioParcial3 >= 14 ? 'success' : est.promedioParcial3 >= 10 ? 'warning' : 'danger'}>
                                                            {est.promedioParcial3 ? est.promedioParcial3.toFixed(2) : '0.00'}
                                                        </Badge>
                                                    </td>
                                                    <td className="text-center">
                                                        <h6>
                                                            <Badge bg={est.promedioFinal >= 14 ? 'success' : est.promedioFinal >= 10 ? 'warning' : 'danger'}>
                                                                {est.promedioFinal ? est.promedioFinal.toFixed(2) : '0.00'}
                                                            </Badge>
                                                        </h6>
                                                    </td>
                                                        <td className="text-center">
                                                            <Badge bg={est.estado === 'Aprobado' ? 'success' : est.estado === 'En recuperación' ? 'warning' : 'danger'}>
                                                                {est.estado}
                                                            </Badge>
                                                        </td>
                                                    <td className="text-center">
                                                        <Button
                                                            size="sm"
                                                            variant="info"
                                                            onClick={() => abrirDetalleNotas(curso.idCurso, est.idEstudiante)}
                                                        >
                                                            Ver detalles
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </Card.Body>
                            </Card>
                        ))
                    )}
                </Card.Body>
            </Card>

            {/* Modal Crear/Editar */}
            <Modal show={showModal} onHide={cerrarModal} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        {notaSeleccionada ? 'Editar Nota' : 'Registrar Nueva Nota'}
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Matrícula (Estudiante-Curso) *</Form.Label>
                                    <Form.Select
                                        name="matriculaId"
                                        value={formData.matriculaId}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Seleccione una matrícula...</option>
                                        {matriculas.map(m => (
                                            <option key={m.idMatricula} value={m.idMatricula}>
                                                {m.estudiante?.nombreEstudiante} - {m.curso?.nrc}
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
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Parcial *</Form.Label>
                                    <Form.Select
                                        name="parcial"
                                        value={formData.parcial}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="1">Parcial 1</option>
                                        <option value="2">Parcial 2</option>
                                        <option value="3">Parcial 3</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Tipo de Evaluación *</Form.Label>
                                    <Form.Select
                                        name="tipoEvaluacion"
                                        value={formData.tipoEvaluacion}
                                        onChange={handleChange}
                                        required
                                    >
                                        {tiposEvaluacion.map(tipo => (
                                            <option key={tipo.value} value={tipo.value}>
                                                {tipo.label}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Fecha de Evaluación *</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="fechaEvaluacion"
                                        value={formData.fechaEvaluacion}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Calificación (0-20) *</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="calificacion"
                                        value={formData.calificacion}
                                        onChange={handleChange}
                                        min="0"
                                        max="20"
                                        step="0.01"
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Porcentaje (0-100) *</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="porcentaje"
                                        value={formData.porcentaje}
                                        onChange={handleChange}
                                        min="0"
                                        max="100"
                                        step="1"
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Aporte Calculado</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={calcularAporte()}
                                        readOnly
                                        className="bg-light fw-bold"
                                    />
                                    <Form.Text className="text-muted">
                                        Se calcula automáticamente
                                    </Form.Text>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Observaciones</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        name="observaciones"
                                        value={formData.observaciones}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Card bg="light" className="p-3">
                            <small className="text-muted">
                                <strong>Sistema de Evaluación:</strong>
                                <ul className="mb-0 mt-2">
                                    <li>Cada parcial vale 14 puntos máximo</li>
                                    <li>Son 4 evaluaciones por parcial (Tarea, Informe, Lección, Examen)</li>
                                    <li>Calificación individual sobre 20 puntos</li>
                                    <li>El aporte se calcula: (Calificación × Porcentaje) / 100</li>
                                </ul>
                            </small>
                        </Card>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={cerrarModal}>
                            Cancelar
                        </Button>
                        <Button variant="primary" type="submit" disabled={loading}>
                            {loading ? 'Guardando...' : 'Guardar Nota'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Modal Detalle de Notas por Parcial */}
            <Modal show={showDetalle} onHide={() => setShowDetalle(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        Notas - {detalleSeleccionado.curso?.nrc} / {detalleSeleccionado.estudiante?.nombreEstudiante}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {detalleSeleccionado.notas.map(grupo => (
                        <Card key={grupo.parcial} className="mb-3">
                            <Card.Header>
                                <strong>Parcial {grupo.parcial}</strong>
                            </Card.Header>
                            <Card.Body>
                                {grupo.notas.length > 0 ? (
                                    <Table responsive hover size="sm">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Tipo</th>
                                                <th>Calificación</th>
                                                <th>%</th>
                                                <th>Aporte</th>
                                                <th>Fecha</th>
                                                { (usuario.tipo === 'admin' || usuario.tipo === 'docente') && <th>Acciones</th> }
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {grupo.notas.map(n => (
                                                <tr key={n.idNota}>
                                                    <td>{n.tipoEvaluacion}</td>
                                                    <td>{n.calificacion}</td>
                                                    <td>{n.porcentaje}%</td>
                                                    <td className="fw-bold">{n.aporte?.toFixed(2)}</td>
                                                    <td>{n.fechaEvaluacion}</td>
                                                    {(usuario.tipo === 'admin' || usuario.tipo === 'docente') && (
                                                        <td>
                                                            <Button
                                                                variant="warning"
                                                                size="sm"
                                                                className="me-2"
                                                                onClick={() => { setShowDetalle(false); abrirModalEditar(n); }}
                                                            >
                                                                <i className="bi bi-pencil"></i>
                                                            </Button>
                                                            <Button
                                                                variant="danger"
                                                                size="sm"
                                                                onClick={() => { setShowDetalle(false); abrirConfirmEliminar(n); }}
                                                            >
                                                                <i className="bi bi-trash"></i>
                                                            </Button>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                ) : (
                                    <p className="text-muted mb-0">No hay notas registradas para este parcial</p>
                                )}
                            </Card.Body>
                        </Card>
                    ))}
                </Modal.Body>
                <Modal.Footer>
                    {(usuario.tipo === 'admin' || usuario.tipo === 'docente') && (
                        <Button
                            variant="primary"
                            onClick={() => {
                                setShowDetalle(false);
                                setNotaSeleccionada(null);
                                setFormData(prev => ({
                                    ...prev,
                                    matriculaId: detalleSeleccionado.matriculaId || '',
                                    parcial: '1',
                                    tipoEvaluacion: 'examen',
                                    calificacion: '',
                                    porcentaje: '40',
                                    fechaEvaluacion: new Date().toISOString().split('T')[0]
                                }));
                                setShowModal(true);
                            }}
                        >
                            Registrar Nota
                        </Button>
                    )}
                    <Button variant="secondary" onClick={() => setShowDetalle(false)}>
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal Confirmar Eliminación */}
            <ConfirmModal
                show={showConfirm}
                onHide={() => setShowConfirm(false)}
                onConfirm={handleEliminar}
                title="Eliminar Nota"
                message="¿Está seguro de eliminar esta nota?"
            />
        </Container>
    );
};

export default Notas;
