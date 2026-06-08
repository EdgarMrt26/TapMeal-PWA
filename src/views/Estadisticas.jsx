import React, { useState, useRef } from "react";
import { Container, Row, Col, Form, Button, Dropdown } from "react-bootstrap";
import Visualizacion1 from "../components/visualizaciones/Visualizacion1";
import Visualizacion2 from "../components/visualizaciones/Visualizacion2";
import Visualizacion3 from "../components/visualizaciones/Visualizacion3";

const Estadisticas = () => {
  const [fechaDesde, setFechaDesde] = useState(
    new Date(new Date().setDate(new Date().getDate() - 30)).toLocaleDateString("en-CA")
  );
  const [fechaHasta, setFechaHasta] = useState(
    new Date().toLocaleDateString("en-CA")
  );
  const [visualizacionActiva, setVisualizacionActiva] = useState("vis3");
  const vis2Ref = useRef();
  const vis3Ref = useRef();

  const descargarExcel = () => {
    if (visualizacionActiva === "vis2" && vis2Ref.current) {
      vis2Ref.current.descargarExcel();
    } else if (visualizacionActiva === "vis3" && vis3Ref.current) {
      vis3Ref.current.descargarExcel();
    } else if (visualizacionActiva === "vis1") {
      alert("Descarga para Ventas globales aún no implementada");
    } else {
      alert("Selecciona una visualización válida");
    }
  };

  return (
    <Container fluid className="mt-4 px-4">
      <div className="mb-4">
        <h2>📈 Panel de Estadísticas</h2>
        <p className="text-muted">Selecciona una visualización y el rango de fechas</p>
      </div>

      <Row className="mb-4 align-items-end">
        <Col md={3}>
          <Form.Group>
            <Form.Label>Fecha desde</Form.Label>
            <Form.Control type="date" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)} />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label>Fecha hasta</Form.Label>
            <Form.Control type="date" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)} />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label>Visualización</Form.Label>
            <Dropdown>
              <Dropdown.Toggle variant="outline-primary" style={{ width: "100%" }}>
                {visualizacionActiva === "vis1" && "📊 Ventas"}
                {visualizacionActiva === "vis2" && "🍽️ Popularidad de platillos"}
                {visualizacionActiva === "vis3" && "👥 Rentabilidad de Extras"}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => setVisualizacionActiva("vis1")}>📊 Ventas</Dropdown.Item>
                <Dropdown.Item onClick={() => setVisualizacionActiva("vis2")}>🍽️ Popularidad de platillos</Dropdown.Item>
                <Dropdown.Item onClick={() => setVisualizacionActiva("vis3")}>👥 Rentabilidad de Extras</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Form.Group>
        </Col>
        <Col md={3}>
          <Button variant="success" onClick={descargarExcel}>
            <i className="bi bi-file-earmark-excel me-2"></i>Descargar Excel
          </Button>
        </Col>
      </Row>

      {visualizacionActiva === "vis1" && <Visualizacion1 fechaDesde={fechaDesde} fechaHasta={fechaHasta} />}
      {visualizacionActiva === "vis2" && <Visualizacion2 ref={vis2Ref} fechaDesde={fechaDesde} fechaHasta={fechaHasta} />}
      {visualizacionActiva === "vis3" && <Visualizacion3 ref={vis3Ref} fechaDesde={fechaDesde} fechaHasta={fechaHasta} />}
    </Container>
  );
};

export default Estadisticas;