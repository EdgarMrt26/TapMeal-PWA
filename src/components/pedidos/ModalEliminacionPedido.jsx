import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";

const ModalEliminacionPedido = ({
  mostrarModal,
  setMostrarModal,
  pedido,
  eliminarPedido,
}) => {
  
  const [deshabilitado, setDeshabilitado] = useState(false);

  const handleEliminar = async () => {
    if (deshabilitado) return;
    setDeshabilitado(true);
    await eliminarPedido();
    setDeshabilitado(false);
  };

  return (
    <Modal
      show={mostrarModal}
      onHide={() => setMostrarModal(false)}
      backdrop="static"
      keyboard={false}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Confirmar Eliminación</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        ¿Estás seguro de que deseas eliminar el pedido{" "}
        <strong>#{pedido?.id_pedido}</strong>?
        <br />
        <small className="text-muted">
          Esta acción no se puede deshacer.
        </small>
      </Modal.Body>

      <Modal.Footer>
        <Button 
          variant="secondary" 
          onClick={() => setMostrarModal(false)}
        >
          Cancelar
        </Button>
        <Button 
          variant="danger" 
          onClick={handleEliminar}
          disabled={deshabilitado}
        >
          Eliminar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEliminacionPedido;