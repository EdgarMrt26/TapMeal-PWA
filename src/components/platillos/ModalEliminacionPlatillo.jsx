import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";

const ModalEliminacionPlatillo = ({
  mostrarModalEliminacion,
  setMostrarModalEliminacion,
  eliminarPlatillo,
  platillo,
}) => {

  const [deshabilitado, setDeshabilitado] = useState(false);

  const handleEliminar = async () => {

    if (deshabilitado) return;

    setDeshabilitado(true);

    await eliminarPlatillo();

    setDeshabilitado(false);
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
        <Modal.Title>Eliminar Platillo</Modal.Title>
      </Modal.Header>

      <Modal.Body>

        ¿Deseas eliminar el platillo{" "}
        <strong>{platillo?.nombre_platillo}</strong>?

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
          Eliminar
        </Button>

      </Modal.Footer>

    </Modal>
  );
};

export default ModalEliminacionPlatillo;