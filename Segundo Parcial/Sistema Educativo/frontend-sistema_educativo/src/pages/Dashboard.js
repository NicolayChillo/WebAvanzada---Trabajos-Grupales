import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ListGroup, Badge } from 'react-bootstrap';
import { estudianteService } from '../services/estudianteService';
import { docenteService } from '../services/docenteService';
import { notaService } from '../services/notaService';
import { matriculaService } from '../services/matriculaService';

const Dashboard = () => {
    const [stats, setStats] = useState({
        estudiantes: 0,
        docentes: 0,
        notas: 0
    });
    const [actividades, setActividades] = useState([]);
    const [notificaciones, setNotificaciones] = useState([]);
    const [cargando, setCargando] = useState(false);
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

    useEffect(() => {
        cargarDashboard();
    }, []);

    const cargarDashboard = async () => {
        try {
            setCargando(true);

            const filtrosNotas = {};
            if (usuario.tipo === 'docente' && usuario.idDocente) filtrosNotas.docenteId = usuario.idDocente;
            if (usuario.tipo === 'estudiante' && usuario.idEstudiante) filtrosNotas.estudianteId = usuario.idEstudiante;

            const peticiones = [notaService.obtenerTodas(filtrosNotas), matriculaService.obtenerTodas()];
            if (usuario.tipo === 'admin') {
                peticiones.push(estudianteService.obtenerTodos());
                peticiones.push(docenteService.obtenerTodos());
            }

            const respuestas = await Promise.all(peticiones);
            const notas = respuestas[0] || [];
            const matriculas = respuestas[1] || [];
            const estudiantes = usuario.tipo === 'admin' ? respuestas[2] || [] : [];
            const docentes = usuario.tipo === 'admin' ? respuestas[3] || [] : [];

            const estudiantesContados = usuario.tipo === 'admin'
                ? (estudiantes.length || 0)
                : usuario.tipo === 'docente'
                    ? new Set((matriculas || []).filter(m => m.curso?.docenteId === usuario.idDocente).map(m => m.estudianteId)).size
                    : usuario.tipo === 'estudiante'
                        ? 1
                        : 0;

            const docentesContados = usuario.tipo === 'admin'
                ? (docentes.length || 0)
                : usuario.tipo === 'docente'
                    ? 1
                    : 0;

            setStats({
                estudiantes: estudiantesContados,
                docentes: docentesContados,
                notas: notas.length || 0
            });

            setActividades(construirActividades(notas, matriculas));
            setNotificaciones(construirNotificaciones(notas, matriculas));
        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
        } finally {
            setCargando(false);
        }
    };

    const construirActividades = (notas = [], matriculas = []) => {
        const items = [];

        const notasFiltradas = usuario.tipo === 'admin'
            ? notas
            : usuario.tipo === 'docente' && usuario.idDocente
                ? notas.filter(n => n.docenteId === usuario.idDocente)
                : usuario.tipo === 'estudiante' && usuario.idEstudiante
                    ? notas.filter(n => n.matricula?.estudiante?.idEstudiante === usuario.idEstudiante || n.matricula?.estudiante?.usuarioId === usuario.idUsuario)
                    : [];

        const matriculasFiltradas = usuario.tipo === 'admin'
            ? matriculas
            : usuario.tipo === 'docente' && usuario.idDocente
                ? matriculas.filter(m => m.curso?.docenteId === usuario.idDocente)
                : usuario.tipo === 'estudiante' && usuario.idEstudiante
                    ? matriculas.filter(m => m.estudianteId === usuario.idEstudiante)
                    : [];

        notasFiltradas.forEach((nota, idx) => {
            items.push({
                id: `nota-${nota.idNota || idx}`,
                titulo: `Nota de ${nota.matricula?.estudiante?.nombreEstudiante || 'Estudiante'}`,
                detalle: `${nota.tipoEvaluacion} P${nota.parcial} en ${nota.matricula?.curso?.nrc || 'Curso'}: ${nota.calificacion}`,
                fecha: nota.fechaEvaluacion,
                tipo: 'nota'
            });
        });

        matriculasFiltradas.forEach((matricula, idx) => {
            items.push({
                id: `mat-${matricula.idMatricula || idx}`,
                titulo: `Matrícula en ${matricula.curso?.nrc || 'Curso'}`,
                detalle: `${matricula.estudiante?.nombreEstudiante || 'Estudiante'} - ${matricula.estado || 'activa'}`,
                fecha: matricula.fechaMatricula,
                tipo: 'matricula'
            });
        });

        return items
            .filter(item => item.fecha)
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
            .slice(0, 6);
    };

    const construirNotificaciones = (notas = [], matriculas = []) => {
        const alerts = [];

        const notasFiltradas = usuario.tipo === 'admin'
            ? notas
            : usuario.tipo === 'docente' && usuario.idDocente
                ? notas.filter(n => n.docenteId === usuario.idDocente)
                : usuario.tipo === 'estudiante' && usuario.idEstudiante
                    ? notas.filter(n => n.matricula?.estudiante?.idEstudiante === usuario.idEstudiante || n.matricula?.estudiante?.usuarioId === usuario.idUsuario)
                    : [];

        notasFiltradas
            .filter(n => n.calificacion < 11)
            .slice(0, 5)
            .forEach((nota, idx) => {
                alerts.push({
                    id: `low-${nota.idNota || idx}`,
                    mensaje: `Calificación baja (${nota.calificacion}) de ${nota.matricula?.estudiante?.nombreEstudiante || 'Estudiante'} en ${nota.matricula?.curso?.nrc || 'Curso'} (P${nota.parcial})`,
                    tipo: 'warning'
                });
            });

        if (usuario.tipo === 'estudiante' && notasFiltradas.length === 0) {
            alerts.push({
                id: 'sin-notas',
                mensaje: 'Aún no tienes notas registradas en tus cursos.',
                tipo: 'info'
            });
        }

        if (usuario.tipo === 'docente' && matriculas.length > 0) {
            const propias = matriculas.filter(m => m.curso?.docenteId === usuario.idDocente);
            if (propias.length === 0) {
                alerts.push({
                    id: 'sin-cursos',
                    mensaje: 'No tienes matrículas asociadas a tus cursos en este periodo.',
                    tipo: 'info'
                });
            }
        }

        if (usuario.tipo === 'admin' && alerts.length === 0) {
            alerts.push({
                id: 'todo-ok',
                mensaje: 'Sin alertas críticas. Revisa matrículas y notas recientes.',
                tipo: 'success'
            });
        }

        return alerts.slice(0, 6);
    };

    const formatearFecha = (fecha) => {
        if (!fecha) return '';
        const d = new Date(fecha);
        if (Number.isNaN(d.getTime())) return '';
        return d.toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <Container fluid>
            <Row className="mb-4">
                <Col>
                    <h2>Bienvenido, {usuario.nombreUsuario || 'Usuario'}</h2>
                    <p className="text-muted">Panel de Control - Sistema Educativo</p>
                </Col>
            </Row>

            <Row className="g-4 mb-4">
                <Col md={4}>
                    <Card className="text-center shadow-sm h-100">
                        <Card.Body>
                            <div className="mb-3">
                                <i className="bi bi-people-fill text-primary" style={{ fontSize: '3rem' }}></i>
                            </div>
                            <Card.Title className="h1 fw-bold text-primary">{stats.estudiantes}</Card.Title>
                            <Card.Text className="text-muted">Estudiantes Registrados</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={4}>
                    <Card className="text-center shadow-sm h-100">
                        <Card.Body>
                            <div className="mb-3">
                                <i className="bi bi-person-badge-fill text-success" style={{ fontSize: '3rem' }}></i>
                            </div>
                            <Card.Title className="h1 fw-bold text-success">{stats.docentes}</Card.Title>
                            <Card.Text className="text-muted">Docentes Activos</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={4}>
                    <Card className="text-center shadow-sm h-100">
                        <Card.Body>
                            <div className="mb-3">
                                <i className="bi bi-clipboard-check-fill text-warning" style={{ fontSize: '3rem' }}></i>
                            </div>
                            <Card.Title className="h1 fw-bold text-warning">{stats.notas}</Card.Title>
                            <Card.Text className="text-muted">Notas Registradas</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="g-4">
                <Col md={6}>
                    <Card className="shadow-sm">
                        <Card.Header className="bg-primary text-white">
                            <h5 className="mb-0">Últimas Actividades</h5>
                        </Card.Header>
                        <Card.Body>
                            {cargando && <p className="text-muted">Cargando...</p>}
                            {!cargando && actividades.length === 0 && (
                                <p className="text-muted">No hay actividades recientes</p>
                            )}
                            {!cargando && actividades.length > 0 && (
                                <ListGroup variant="flush">
                                    {actividades.map(item => (
                                        <ListGroup.Item key={item.id} className="d-flex justify-content-between align-items-start">
                                            <div>
                                                <div className="fw-semibold">{item.titulo}</div>
                                                <div className="text-muted small">{item.detalle}</div>
                                            </div>
                                            <Badge bg="light" text="dark">{formatearFecha(item.fecha)}</Badge>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={6}>
                    <Card className="shadow-sm">
                        <Card.Header className="bg-success text-white">
                            <h5 className="mb-0">Notificaciones</h5>
                        </Card.Header>
                        <Card.Body>
                            {cargando && <p className="text-muted">Cargando...</p>}
                            {!cargando && notificaciones.length === 0 && (
                                <p className="text-muted">No hay notificaciones pendientes</p>
                            )}
                            {!cargando && notificaciones.length > 0 && (
                                <ListGroup variant="flush">
                                    {notificaciones.map(item => (
                                        <ListGroup.Item key={item.id} className="d-flex align-items-start gap-2">
                                            <Badge bg={item.tipo === 'warning' ? 'warning' : item.tipo === 'success' ? 'success' : 'secondary'} className="text-uppercase">{item.tipo}</Badge>
                                            <span>{item.mensaje}</span>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Dashboard;
