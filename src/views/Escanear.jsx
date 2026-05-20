import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";

const Escanear = () => {
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const lector = new Html5Qrcode("lector-qr");

    const iniciarEscaneo = async () => {
      try {
        await lector.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: 250 },
          (textoDecodificado) => {
            lector.stop().catch(() => {});
            
            const match = textoDecodificado.match(/\/mesa\/([^/\s]+)/);
            if (match) {
              const idMesa = match[1];
              navigate(`/mesa/${idMesa}`);
            } else {
              setError("El QR no contiene una mesa válida.");
            }
          },
          () => {}
        );
      } catch (err) {
        console.error("Error al iniciar cámara:", err);
        setError("No se pudo acceder a la cámara. Asegúrate de dar permisos.");
      }
    };

    iniciarEscaneo();

    return () => {
      lector.stop().catch(() => {});
    };
  }, [navigate]);

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", fontFamily: "'Segoe UI', sans-serif", padding: "20px" }}>
      <div className="text-center">
        <h3 className="mb-3 fw-bold" style={{ color: "#0c0c2c" }}>
          <i className="bi bi-qr-code-scan me-2" style={{ color: "#ff6a00" }} />
          Escanear Mesa
        </h3>
        <p className="text-muted mb-4">Apunta la cámara al código QR de tu mesa</p>

        {error ? (
          <div className="alert alert-warning">{error}</div>
        ) : (
          <div id="lector-qr" style={{ maxWidth: 400, margin: "0 auto", border: "2px solid #ddd", borderRadius: 12, overflow: "hidden" }} />
        )}

        <button
          className="btn btn-outline-secondary mt-4"
          onClick={() => navigate("/")}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default Escanear;