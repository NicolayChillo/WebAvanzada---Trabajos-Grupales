import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Alert, Card, Container } from 'react-bootstrap';
import { usuarioService } from '../services/usuarioService';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombreUsuario: '',
    email: '',
    password: '',
    tipo: 'estudiante'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await usuarioService.crear({
        nombreUsuario: formData.nombreUsuario,
        email: formData.email,
        password: formData.password,
        tipo: formData.tipo
      });
      setSuccess('Usuario registrado correctamente. Ya puedes iniciar sesión.');
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Card className="mx-auto" style={{ maxWidth: '520px' }}>
        <Card.Body>
          <h3 className="mb-3">Crear cuenta</h3>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Nombre de usuario</Form.Label>
              <Form.Control
                name="nombreUsuario"
                value={formData.nombreUsuario}
                onChange={handleChange}
                placeholder="juanperez"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Correo electrónico</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="correo@ejemplo.com"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Tipo de cuenta</Form.Label>
              <Form.Select name="tipo" value={formData.tipo} onChange={handleChange}>
                <option value="estudiante">Estudiante</option>
                <option value="docente">Docente</option>
              </Form.Select>
            </Form.Group>
            <div className="d-flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? 'Registrando...' : 'Registrarse'}
              </Button>
              <Button variant="secondary" onClick={() => navigate('/login')}>Volver al Login</Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Register;
