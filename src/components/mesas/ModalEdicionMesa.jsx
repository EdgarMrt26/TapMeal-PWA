import React, { useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";


const ModalEdicionMesa = ({
  mostrarModalEdicion, 
  setMostrarModalEdicion,
  mesaEditar,
  manejoCambioInputEdicion,
  actualizarMesa,
}) =>{
  
  const [deshabilitado, setDeshabilitado]= useState(false);


  const handleActualizar = async ()=>{
    if (deshabilitado) return;
    setDeshabilitado(true);
    await actualizarMesa();
    setDeshabilitado(false);
  }

  return (
    <Modal
    show={mostrarModalEdicion}
    onHide={()=> setMostrarModalEdicion(false)}
    backdrop="static"
    keyboard= {false}
    centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Editar Mesa</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
          <Form.Label>Nombre</Form.Label>
          <Form.Control
          type="text"
          name="nombre_mesa"
          value={mesaEditar.nombre_mesa || ""}
          onChange={manejoCambioInputEdicion}
          placeholder="Ingresa el nombre de la mesa"
          />
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button
        variant="secondary"
        onClick={()=> setMostrarModalEdicion(false)}
        >
          Cancelar
        </Button>

        <Button
        variant="primary"
        onClick={handleActualizar}
        disabled={mesaEditar.nombre_mesa?.trim()=== "" || deshabilitado}
        >
          Actualizar
        </Button>
      </Modal.Footer>
    </Modal>
  )

}


export default ModalEdicionMesa;