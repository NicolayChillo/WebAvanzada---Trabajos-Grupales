import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';

const NavigationBar = () => {
    const navigate = useNavigate();
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    const displayName = usuario.nombreUsuario || usuario.email || 'Usuario';
    const displayEmail = usuario.email || 'N/A';

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        navigate('/login');
    };

    const handlePerfil = () => {
        navigate('/perfil');
    };

    return (
        <Navbar bg="dark" variant="dark" expand="lg" className="mb-3">
            <Container fluid>
                <Navbar.Brand as={Link} to="/dashboard">Sistema Educativo</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/dashboard">Inicio</Nav.Link>
                        
                        {/* Admin ve todo */}
                        {usuario.tipo === 'admin' && (
                            <>
                                <Nav.Link as={Link} to="/usuarios">Usuarios</Nav.Link>
                                <Nav.Link as={Link} to="/estudiantes">Estudiantes</Nav.Link>
                                <Nav.Link as={Link} to="/docentes">Docentes</Nav.Link>
                                <Nav.Link as={Link} to="/cursos">Cursos</Nav.Link>
                                <Nav.Link as={Link} to="/matriculas">Matrículas</Nav.Link>
                                <Nav.Link as={Link} to="/notas">Notas</Nav.Link>
                            </>
                        )}
                        
                        {/* Estudiante: solo matrículas y notas */}
                        {usuario.tipo === 'estudiante' && (
                            <>
                                <Nav.Link as={Link} to="/matriculas">Mis Matrículas</Nav.Link>
                                <Nav.Link as={Link} to="/notas">Mis Notas</Nav.Link>
                            </>
                        )}
                        
                        {/* Docente: solo cursos y notas */}
                        {usuario.tipo === 'docente' && (
                            <>
                                <Nav.Link as={Link} to="/cursos">Cursos</Nav.Link>
                                <Nav.Link as={Link} to="/notas">Notas</Nav.Link>
                            </>
                        )}
                    </Nav>
                    <Nav>
                        <NavDropdown title={displayName} id="basic-nav-dropdown" align="end">
                            {usuario.tipo === 'estudiante' && (
                                <NavDropdown.Item onClick={handlePerfil}>
                                    Mi Perfil
                                </NavDropdown.Item>
                            )}
                            {usuario.tipo === 'estudiante' && <NavDropdown.Divider />}
                            <NavDropdown.Item disabled>
                                {displayEmail}
                            </NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Item onClick={handleLogout}>
                                Cerrar Sesión
                            </NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default NavigationBar;
