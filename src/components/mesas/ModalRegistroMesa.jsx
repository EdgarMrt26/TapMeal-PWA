import React, { useState } from "react";
import {Modal, Form, Button} from "react-bootstrap";



const ModalRegistroMesa = ({
  mostrarModal,
  setMostrarModal,
  nuevaMesa, 
  manejoCambioInput,
  agregarMesa,
}) =>{


  const [deshabilitado, setDeshabilitado]= useState(false);


  const handleRegistrar = async () => {
    if (deshabilitado) return;
    setDeshabilitado(true);
    await agregarMesa();
    setDeshabilitado(false);
  };



  return(
    <Modal 
    show={mostrarModal}
    onHide={()=> setMostrarModal(false)}
    backdrop="static"
    keyboard={false}
    centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Agregar Mesa</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
          <Form.Label>Nombre</Form.Label>
          <Form.Control
          type="text"
          name="nombre_mesa"
          value={nuevaMesa.nombre_mesa}
          onChange={manejoCambioInput}
          placeholder="Ej. mesa 1"
          />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={()=> setMostrarModal(false)}>
          Cancelar
        </Button>

        <Button 
        variant="primary"
        onClick={handleRegistrar}
        disabled={nuevaMesa.nombre_mesa.trim()=== "" || deshabilitado}
        >
          Guardar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}


export default ModalRegistroMesa;