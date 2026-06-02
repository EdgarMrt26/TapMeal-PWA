import React from "react";
import { Badge } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

const CampanaPedidos = ({ cantidad, onClick }) => {
  return (
    <div
      onClick={onClick}
      title="Pedidos pendientes de aprobación"
      style={{ cursor: "pointer", position: "relative", display: "inline-block" }}
    >
      <i
        className="bi bi-bell-fill"
        style={{
          fontSize: "1.6rem",
          color: cantidad > 0 ? "#f59e0b" : "#6b7280",
          transition: "color 0.3s",
        }}
      />
      {cantidad > 0 && (
        <Badge
          bg="danger"
          pill
          style={{
            position: "absolute",
            top: "-6px",
            right: "-8px",
            fontSize: "0.65rem",
            minWidth: "18px",
          }}
        >
          {cantidad}
        </Badge>
      )}
    </div>
  );
};

export default CampanaPedidos;