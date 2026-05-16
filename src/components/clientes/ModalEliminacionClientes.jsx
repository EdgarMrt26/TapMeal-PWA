import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";

const ModalEliminacionClientes = ({
    mostrarModalEliminacion,
    setMostrarModalEliminacion,
    eliminarCliente,
    cliente,         
}) => {
  
    const [deshabilitado, setDeshabilitado] = useState(false);

    const handleEliminar = async () => {
        if (deshabilitado) return;
        setDeshabilitado(true);
        await eliminarCliente(); 
        setDeshabilitado(false);
        setMostrarModalEliminacion(false); 
    };

    return (
        <Modal
            show={mostrarModalEliminacion}
            onHide={() => setMostrarModalEliminacion(false)}
            backdrop="static"
            keyboard={false}
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title>Confirmar Eliminación</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                ¿Estás seguro de que deseas eliminar al cliente: 
                <br />
                <strong>
                    {cliente?.nombre_cliente} {cliente?.apellido_cliente}
                </strong>?
                <p className="text-muted small mt-2">
                    ID: {cliente?.id_cliente}
                </p>
            </Modal.Body>
            <Modal.Footer>
                <Button 
                    variant="secondary" 
                    onClick={() => setMostrarModalEliminacion(false)}
                >
                    Cancelar
                </Button>
                <Button 
                    variant="danger" 
                    onClick={handleEliminar}
                    disabled={deshabilitado}
                >
                    {deshabilitado ? 'Eliminando...' : 'Eliminar Cliente'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ModalEliminacionClientes;