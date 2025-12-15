import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/App.css';

// Layout
import NavigationBar from './components/layout/NavigationBar';
import PrivateRoute from './components/common/PrivateRoute';
import RoleRoute from './components/common/RoleRoute';

// Pages
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Estudiantes from './pages/estudiantes/Estudiantes';
import Docentes from './pages/docentes/Docentes';
import Notas from './pages/notas/Notas';
import Cursos from './pages/cursos/Cursos';
import Matriculas from './pages/matriculas/Matriculas';
import Usuarios from './pages/usuarios/Usuarios';

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta pública */}
        <Route path="/login" element={<Login />} />
        <Route path="/recuperar" element={<ForgotPassword />} />
        <Route path="/registro" element={<Register />} />

        {/* Rutas privadas */}
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <div className="d-flex flex-column min-vh-100">
                <NavigationBar />
                <div className="flex-grow-1 bg-light">
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    
                    {/* Solo admin */}
                    <Route path="/usuarios" element={
                      <RoleRoute allowedRoles={['admin']}>
                        <Usuarios />
                      </RoleRoute>
                    } />
                    <Route path="/estudiantes" element={
                      <RoleRoute allowedRoles={['admin']}>
                        <Estudiantes />
                      </RoleRoute>
                    } />
                    <Route path="/perfil" element={
                      <RoleRoute allowedRoles={['estudiante']}>
                        <Estudiantes />
                      </RoleRoute>
                    } />
                    <Route path="/docentes" element={
                      <RoleRoute allowedRoles={['admin']}>
                        <Docentes />
                      </RoleRoute>
                    } />
                    
                    {/* Admin y docente */}
                    <Route path="/cursos" element={
                      <RoleRoute allowedRoles={['admin', 'docente']}>
                        <Cursos />
                      </RoleRoute>
                    } />
                    
                    {/* Admin, estudiante y docente */}
                    <Route path="/notas" element={
                      <RoleRoute allowedRoles={['admin', 'estudiante', 'docente']}>
                        <Notas />
                      </RoleRoute>
                    } />
                    
                    {/* Admin y estudiante */}
                    <Route path="/matriculas" element={
                      <RoleRoute allowedRoles={['admin', 'estudiante']}>
                        <Matriculas />
                      </RoleRoute>
                    } />
                    
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </div>
              </div>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

