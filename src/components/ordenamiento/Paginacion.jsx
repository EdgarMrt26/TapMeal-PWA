import React from "react";
import { Pagination, Row, Col, Dropdown, DropdownButton } from "react-bootstrap";

const Paginacion = ({
  registrosPorPagina,
  totalRegistros,
  paginaActual,
  establecerPaginaActual,
  establecerRegistrosPorPagina
}) => {

  const totalPaginas = Math.ceil(totalRegistros / registrosPorPagina);

  const cambiarPagina = (numeroPagina) => {
    if (numeroPagina >= 1 && numeroPagina <= totalPaginas) {
      establecerPaginaActual(numeroPagina);
    }
  };

  // Ajustado para recibir directamente el número desde el Dropdown
  const cambiarCantidadRegistros = (cantidad) => {
    establecerRegistrosPorPagina(Number(cantidad));
    establecerPaginaActual(1);
  };

  const elementosPaginacion = [];
  const maximoPaginasAMostrar = 3;

  let paginaInicio = Math.max(1, paginaActual - Math.floor(maximoPaginasAMostrar / 2));
  let paginaFin = Math.min(totalPaginas, paginaInicio + maximoPaginasAMostrar - 1);

  if (paginaFin - paginaInicio + 1 < maximoPaginasAMostrar) {
    paginaInicio = Math.max(1, paginaFin - maximoPaginasAMostrar + 1);
  }

  for (let numeroPagina = paginaInicio; numeroPagina <= paginaFin; numeroPagina++) {
    elementosPaginacion.push(
      <Pagination.Item
        key={numeroPagina}
        active={numeroPagina === paginaActual}
        onClick={() => cambiarPagina(numeroPagina)}
      >
        {numeroPagina}
      </Pagination.Item>
    );
  }

  return (
    <Row className="mt-1 align-items-center">
      {/* Selector de cantidad de registros usando Dropdown */}
      <Col xs="auto">
        <DropdownButton
          variant="outline-dark"
          size="sm"
          title={`${registrosPorPagina}`}
          onSelect={cambiarCantidadRegistros}
          drop="up" 
        >
          <Dropdown.Item eventKey="5">5</Dropdown.Item>
          <Dropdown.Item eventKey="10">10</Dropdown.Item>
          <Dropdown.Item eventKey="50">50</Dropdown.Item>
          <Dropdown.Item eventKey="100">100</Dropdown.Item>
          <Dropdown.Item eventKey="500">500</Dropdown.Item>
        </DropdownButton>
      </Col>

      {/* Controles de páginas (Intactos) */}
      <Col className="d-flex justify-content-center">
        <Pagination className="shadow-sm mt-2">
          <Pagination.First
            onClick={() => cambiarPagina(1)}
            disabled={paginaActual === 1}
          />
          <Pagination.Prev
            onClick={() => cambiarPagina(paginaActual - 1)}
            disabled={paginaActual === 1}
          />
          {paginaInicio > 1 && <Pagination.Ellipsis />}
          {elementosPaginacion}
          {paginaFin < totalPaginas && <Pagination.Ellipsis />}
          <Pagination.Next  
            onClick={() => cambiarPagina(paginaActual + 1)}
            disabled={paginaActual === totalPaginas}
          />
          <Pagination.Last  
            onClick={() => cambiarPagina(paginaActual)}
            disabled={paginaActual === totalPaginas}
          />
        </Pagination>
      </Col>
    </Row>
  );
};

export default Paginacion;