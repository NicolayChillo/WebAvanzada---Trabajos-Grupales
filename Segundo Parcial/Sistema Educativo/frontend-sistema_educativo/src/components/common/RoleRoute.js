import React from 'react';
import { Navigate } from 'react-router-dom';

const RoleRoute = ({ children, allowedRoles }) => {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    
    if (!allowedRoles.includes(usuario.tipo)) {
        return <Navigate to="/dashboard" replace />;
    }
    
    return children;
};

export default RoleRoute;
