import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";


const ModalEliminacionMesa = ({
  mostrarModalEliminacion, 
  setMostrarModalEliminacion,
  eliminarMesa,
  mesa,
})=>{

  const [deshabilitado, setDeshabilitado] = useState(false);
  const handleEliminar = async ()=> {
    if (deshabilitado) return;
    setDeshabilitado(true);
    await eliminarMesa();
    setDeshabilitado(false);
  };


  return (
    <Modal
    show={mostrarModalEliminacion}
    onHide={() => setMostrarModalEliminacion(false)}
    backdrop= "static"
    keyboard={false}
    centered
    >

      <Modal.Header closeButton>
        <Modal.Title>Confirmar Eliminación</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        ¿Estas seguro de que deseas eliminar la mesa "<strong>{mesa?.nombre_mesa}</strong>"?
      </Modal.Body>

      <Modal.Footer>
        <Button
        variant="secondary"
        onClick={()=> setMostrarModalEliminacion(false)}
        >
          Cancelar
        </Button>
        <Button
        variant="danger"
        onClick={handleEliminar}
        disabled={deshabilitado}>
          Eliminar
        </Button>
        
      </Modal.Footer>
    </Modal>
  )
}

export default ModalEliminacionMesa;