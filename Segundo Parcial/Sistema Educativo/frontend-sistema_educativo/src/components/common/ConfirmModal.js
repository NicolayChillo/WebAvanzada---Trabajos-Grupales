import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const ConfirmModal = ({ show, onHide, onConfirm, title, message }) => {
    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>{title || 'Confirmar acción'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {message || '¿Está seguro de realizar esta acción?'}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Cancelar
                </Button>
                <Button variant="danger" onClick={onConfirm}>
                    Confirmar
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ConfirmModal;
