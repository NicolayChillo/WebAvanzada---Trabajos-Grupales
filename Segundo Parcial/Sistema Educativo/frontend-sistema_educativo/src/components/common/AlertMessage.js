import React from 'react';
import { Alert } from 'react-bootstrap';

const AlertMessage = ({ variant, message, onClose }) => {
    if (!message) return null;

    return (
        <Alert variant={variant} dismissible onClose={onClose}>
            {message}
        </Alert>
    );
};

export default AlertMessage;
