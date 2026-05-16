import React from "react";
import { useNavigate } from "react-router-dom";
import { useCarrito } from "../../components/contexto/CarritoContexto";

const BotonCarrito = ({ visible }) => {
  const { totalItems } = useCarrito();
  const navegar = useNavigate();

  if (!visible) return null;

  return (
    <button
      onClick={() => navegar("/carrito")}
      style={{
        position: "fixed", bottom: 24, right: 24, zIndex: 150,
        background: "#ff6a00", color: "white", border: "none",
        borderRadius: "50%", width: 56, height: 56,
        fontSize: "1.4rem", cursor: "pointer",
        boxShadow: "0 4px 16px rgba(255,106,0,0.4)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <i className="bi bi-cart3" />
      {totalItems > 0 && (
        <span style={{
          position: "absolute", top: 0, right: 0,
          background: "#0c0c2c", color: "white", borderRadius: "50%",
          width: 20, height: 20, fontSize: "0.65rem", fontWeight: 700,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {totalItems}
        </span>
      )}
    </button>
  );
};

export default BotonCarrito;