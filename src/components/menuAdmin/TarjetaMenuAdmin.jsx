import React from "react";
import { Card, Badge } from "react-bootstrap";

const TarjetaMenuAdmin = ({ platillo, categoriaNombre }) => {
  const descripcion = platillo.descripcion || "";
  const preview = descripcion.length > 60 ? descripcion.substring(0, 60) + "..." : descripcion;

  return (
    <Card
      className="h-100 border-0 shadow-sm overflow-hidden"
      style={{ borderRadius: 14, transition: "transform 0.2s, box-shadow 0.2s" }}
      onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
      onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
    >
      <div style={{ height: 160, overflow: "hidden", background: "#f3f4f6" }}>
        {platillo.url_imagen ? (
          <img
            src={platillo.url_imagen}
            alt={platillo.nombre_platillo}
            style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s" }}
          />
        ) : (
          <div className="d-flex align-items-center justify-content-center h-100">
            <i className="bi bi-image text-muted" style={{ fontSize: "2.5rem" }} />
          </div>
        )}
      </div>

      <Card.Body className="p-3 d-flex flex-column">
        <Badge bg="warning" text="dark" pill className="mb-2 align-self-start" style={{ fontSize: "0.7rem" }}>
          {categoriaNombre}
        </Badge>
        <h6 className="fw-bold mb-1" style={{ color: "#0c0c2c", fontSize: "0.92rem" }}>
          {platillo.nombre_platillo}
        </h6>
        {descripcion && (
          <p className="text-muted mb-2" style={{ fontSize: "0.78rem", lineHeight: 1.5, flexGrow: 1 }}>
            {preview}
          </p>
        )}
        <div className="d-flex align-items-center justify-content-between mt-auto pt-2">
          <span className="fw-bold" style={{ color: "#ff6a00", fontSize: "1rem" }}>
            C${parseFloat(platillo.precio || 0).toFixed(2)}
          </span>
        </div>
      </Card.Body>
    </Card>
  );
};

export default TarjetaMenuAdmin;