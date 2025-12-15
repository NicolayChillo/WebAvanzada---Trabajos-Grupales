import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Alert } from 'react-bootstrap';
import '../styles/login.css';
import iconLogin from '../img/icon-login.svg';
import { usuarioService } from '../services/usuarioService';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [checked, setChecked] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleLogin = async (e) => {
        if (e?.preventDefault) e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await usuarioService.login(formData.email, formData.password);
            localStorage.setItem('usuario', JSON.stringify(response));
            localStorage.setItem('token', 'dummy-token'); // Si implementas JWT, usa el token real
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.mensaje || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="bg-primary-reverse bg-primary-50">
                <div className="flex justify-content-center">
                    <div className="w-full lg:w-5 h-screen text-center flex justify-content-center align-items-center">
                        <div className="z-5 w-full lg:w-8 px-6 text-center login-card" style={{ maxWidth: '460px' }}>
                            <div className="w-full flex align-items-center justify-content-center mb-3">
                                <img src={iconLogin} alt="Sistema Educativo" className="w-6rem" />
                            </div>
                            <h1 className="text-4xl font-light mt-4 text-primary-500">Bienvenido al Sistema Educativo</h1>
                            <p className="hero-subtitle">Ingresa tus credenciales para acceder a la plataforma</p>

                            {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

                            <div className="mt-5 text-left">
                                <Form onSubmit={handleLogin}>
                                    <label htmlFor="username" className="block mb-2" style={{ color: '#4c566a' }}>
                                        Nombre de Usuario
                                    </label>
                                    <span className="p-input-icon-right block">
                                        <i className="pi pi-user"></i>
                                        <Form.Control
                                            id="username"
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full"
                                            placeholder="correo@ejemplo.com"
                                            required
                                        />
                                    </span>

                                    <label htmlFor="password" className="block mb-2 mt-3" style={{ color: '#4c566a' }}>
                                        Contraseña
                                    </label>
                                    <span className="p-input-icon-right block">
                                        <i className="pi pi-lock"></i>
                                        <Form.Control
                                            id="password"
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="w-full"
                                            placeholder="********"
                                            required
                                        />
                                    </span>

                                    <div className="flex align-items-center justify-content-between mt-5">
                                        <div className="flex align-items-center">
                                            <Form.Check
                                                id="rememberme1"
                                                type="checkbox"
                                                checked={checked}
                                                onChange={(e) => setChecked(e.target.checked ?? false)}
                                                className="me-2"
                                                label="Recordarme"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex align-items-center justify-content-between mt-4 gap-3">
                                        <Button
                                            type="submit"
                                            onClick={handleLogin}
                                            className="w-100 login-btn"
                                            disabled={loading}
                                        >
                                            {loading ? 'Ingresando...' : 'Login'}
                                        </Button>
                                        <Button
                                            variant="link"
                                            className="forgot-link px-0"
                                            type="button"
                                            onClick={() => navigate('/recuperar')}
                                        >
                                            ¿Olvidó su contraseña?
                                        </Button>
                                        <Button
                                            variant="link"
                                            className="px-0"
                                            type="button"
                                            onClick={() => navigate('/registro')}
                                        >
                                            Crear cuenta
                                        </Button>
                                    </div>
                                </Form>
                            </div>
                        </div>
                    </div>

                    <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" className="absolute bottom-0 w-screen" viewBox="0 0 1440 250">
                        <defs>
                            <linearGradient id="c" x1="50%" x2="50%" y1="0%" y2="100%">
                                <stop offset="0%" stopColor="var(--primary-200)" />
                                <stop offset="99.052%" stopColor="var(--primary-300)" />
                            </linearGradient>
                            <path id="b" d="M0 202c142.333-66.667 249-90 320-70 106.5 30 122 83.5 195 83.5h292c92.642-106.477 190.309-160.81 293-163 102.691-2.19 216.025 47.643 340 149.5v155.5H0V202z" />
                            <filter id="a" width="105.1%" height="124.3%" x="-2.6%" y="-12.8%" filterUnits="objectBoundingBox">
                                <feOffset dy="-2" in="SourceAlpha" result="shadowOffsetOuter1" />
                                <feGaussianBlur in="shadowOffsetOuter1" result="shadowBlurOuter1" stdDeviation="12" />
                                <feColorMatrix in="shadowBlurOuter1" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.11 0" />
                            </filter>
                            <linearGradient id="d" x1="50%" x2="50%" y1="0%" y2="99.142%">
                                <stop offset="0%" stopColor="var(--primary-300)" />
                                <stop offset="100%" stopColor="var(--primary-500)" />
                            </linearGradient>
                        </defs>
                        <g fill="none" fillRule="evenodd">
                            <g transform="translate(0 .5)">
                                <use fill="#000" filter="url(#a)" xlinkHref="#b" />
                                <use fill="url(#c)" xlinkHref="#b" />
                            </g>
                            <path fill="url(#d)" d="M0 107c225.333 61.333 364.333 92 417 92 79 0 194-79.5 293-79.5S914 244 1002 244s156-45 195-68.5c26-15.667 107-74.167 243-175.5v357.5H0V107z" transform="translate(0 .5)" />
                        </g>
                    </svg>
                </div>
            </div>
        </>
    );
};

export default Login;
