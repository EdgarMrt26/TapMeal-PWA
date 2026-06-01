import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Row, Col, Card, Table, Spinner } from "react-bootstrap";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from "recharts";
import { supabase } from "../../database/supabaseconfig";

const Visualizacion2 = forwardRef(({ fechaDesde, fechaHasta }, ref) => {
  const [cargando, setCargando] = useState(true);
  const [totalUnidades, setTotalUnidades] = useState(0);
  const [totalIngresos, setTotalIngresos] = useState(0);
  const [top5Cantidad, setTop5Cantidad] = useState([]);
  const [bottom5Cantidad, setBottom5Cantidad] = useState([]);
  const [top5Ingreso, setTop5Ingreso] = useState([]);
  const [top5Frecuencia, setTop5Frecuencia] = useState([]);
  const [rankingData, setRankingData] = useState([]);
  const [hallazgo, setHallazgo] = useState("");
  const [accionRecomendada, setAccionRecomendada] = useState("");

  useEffect(() => {
    if (fechaDesde && fechaHasta) cargarDatos();
  }, [fechaDesde, fechaHasta]);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const inicio = `${fechaDesde} 00:00:00`;
      const fin = `${fechaHasta} 23:59:59`;

      const { data: pedidos, error } = await supabase
        .from("Pedido")
        .select("id_pedido, fecha")
        .gte("fecha", inicio)
        .lte("fecha", fin);
      if (error) throw error;
      if (!pedidos || pedidos.length === 0) {
        limpiarDatos();
        setCargando(false);
        return;
      }

      const idsPedidos = pedidos.map(p => p.id_pedido);
      const { data: detalles, error: errDet } = await supabase
        .from("Detalle_pedido")
        .select(`
          cantidad,
          precio_unitario,
          Platillos (nombre_platillo)
        `)
        .in("id_pedido", idsPedidos);
      if (errDet) throw errDet;
      if (!detalles || detalles.length === 0) {
        limpiarDatos();
        setCargando(false);
        return;
      }

      const mapa = new Map();
      detalles.forEach(det => {
        const nombre = det.Platillos?.nombre_platillo || "Desconocido";
        const cant = det.cantidad || 0;
        const subtotal = cant * (det.precio_unitario || 0);
        if (!mapa.has(nombre)) {
          mapa.set(nombre, { cantidad: 0, subtotal: 0, frecuencia: 0 });
        }
        const item = mapa.get(nombre);
        item.cantidad += cant;
        item.subtotal += subtotal;
        item.frecuencia += 1;
      });

      let platillosArray = Array.from(mapa.entries()).map(([platillo, values]) => ({
        platillo,
        cantidad: values.cantidad,
        subtotal: values.subtotal,
        frecuencia: values.frecuencia
      }));

      const totalUnidadesCalc = platillosArray.reduce((a, b) => a + b.cantidad, 0);
      const totalIngresosCalc = platillosArray.reduce((a, b) => a + b.subtotal, 0);

      platillosArray.sort((a, b) => b.cantidad - a.cantidad);
      const ranking = platillosArray.map((p, idx) => ({ ...p, ranking: idx + 1 }));

      const topCantidad = ranking.slice(0, 5);
      const bottomCantidad = [...ranking].reverse().slice(0, 5).filter(p => p.cantidad > 0);
      const topIngreso = [...ranking].sort((a, b) => b.subtotal - a.subtotal).slice(0, 5);
      const topFrecuencia = [...ranking].sort((a, b) => b.frecuencia - a.frecuencia).slice(0, 5);

      const top3 = ranking.slice(0, 3);
      const top3Unidades = top3.reduce((a, b) => a + b.cantidad, 0);
      const top3Ingresos = top3.reduce((a, b) => a + b.subtotal, 0);
      const porcentajeUnidades = totalUnidadesCalc ? (top3Unidades / totalUnidadesCalc * 100).toFixed(1) : 0;
      const porcentajeIngresos = totalIngresosCalc ? (top3Ingresos / totalIngresosCalc * 100).toFixed(1) : 0;
      const bajos = bottomCantidad.map(p => p.platillo).join(", ");
      const hallazgoText = `Los 3 platillos más vendidos (${top3.map(p => p.platillo).join(", ")}) concentran el ${porcentajeUnidades}% de las unidades y generan el ${porcentajeIngresos}% del ingreso total. Platillos con baja rotación: ${bajos || "ninguno"}.`;
      const eliminarSugeridos = bottomCantidad.slice(0, 3).map(p => p.platillo).join(", ");
      const accionText = `Se recomienda evaluar la permanencia de ${eliminarSugeridos || "platillos de muy baja rotación"} en el menú. Promocionar los de alto ingreso por unidad como ${topIngreso[0]?.platillo || "ninguno"}.`;

      setTotalUnidades(totalUnidadesCalc);
      setTotalIngresos(totalIngresosCalc);
      setTop5Cantidad(topCantidad);
      setBottom5Cantidad(bottomCantidad);
      setTop5Ingreso(topIngreso);
      setTop5Frecuencia(topFrecuencia);
      setRankingData(ranking);
      setHallazgo(hallazgoText);
      setAccionRecomendada(accionText);
    } catch (err) {
      console.error(err);
      limpiarDatos();
    } finally {
      setCargando(false);
    }
  };

  const limpiarDatos = () => {
    setTotalUnidades(0);
    setTotalIngresos(0);
    setTop5Cantidad([]);
    setBottom5Cantidad([]);
    setTop5Ingreso([]);
    setTop5Frecuencia([]);
    setRankingData([]);
    setHallazgo("No hay datos en el rango seleccionado.");
    setAccionRecomendada("Amplía el rango de fechas o verifica los pedidos registrados.");
  };

  const descargarExcel = () => {
    if (!rankingData.length) {
      alert("No hay datos para exportar");
      return;
    }

    const resumenRows = [
      ["Indicador", "Valor"],
      ["Período", `${fechaDesde} al ${fechaHasta}`],
      ["Total Unidades Vendidas", totalUnidades],
      ["Total Ingresos (C$)", totalIngresos.toFixed(2)],
    ];

    const detalleRows = [
      ["Platillo", "Cantidad", "Subtotal (C$)", "Frecuencia", "Ranking"],
      ...rankingData.map(p => [
        p.platillo,
        p.cantidad,
        p.subtotal.toFixed(2),
        p.frecuencia,
        p.ranking
      ])
    ];

    const csvResumen = resumenRows.map(r => r.join(",")).join("\n");
    const csvDetalle = detalleRows.map(r => r.join(",")).join("\n");
    const csvFinal = `RESUMEN\n${csvResumen}\n\nDETALLE DE PLATILLOS\n${csvDetalle}`;

    const blob = new Blob(["\uFEFF" + csvFinal], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Popularidad_Platillos_${fechaDesde}_a_${fechaHasta}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  useImperativeHandle(ref, () => ({
    descargarExcel
  }));

  if (cargando) return <div className="text-center"><Spinner animation="border" /></div>;

  return (
    <>
      <Row className="g-4 mb-5">
        <Col md={6}>
          <Card className="shadow-sm border-0 bg-primary text-white">
            <Card.Body><h5>🍽️ Total Unidades Vendidas</h5><h2>{totalUnidades.toLocaleString()}</h2></Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="shadow-sm border-0 bg-success text-white">
            <Card.Body><h5>💰 Total Ingresos</h5><h2>C$ {totalIngresos.toFixed(2)}</h2></Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4 mb-4">
        <Col lg={6}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <h5 className="mb-3">🏆 Top 5 más vendidos (por cantidad)</h5>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart layout="vertical" data={top5Cantidad} margin={{ left: 70 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="platillo" width={120} />
                  <Tooltip formatter={(v) => [`${v} und`, "Cantidad"]} />
                  <Bar dataKey="cantidad" fill="#3b82f6" barSize={25}>
                    <LabelList dataKey="cantidad" position="right" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <h5 className="mb-3">📉 Baja rotación (menor cantidad)</h5>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart layout="vertical" data={bottom5Cantidad} margin={{ left: 70 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="platillo" width={120} />
                  <Tooltip formatter={(v) => [`${v} und`, "Cantidad"]} />
                  <Bar dataKey="cantidad" fill="#ef4444" barSize={25}>
                    <LabelList dataKey="cantidad" position="right" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4 mb-4">
        <Col lg={6}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <h5 className="mb-3">💵 Ingreso por platillo (subtotal)</h5>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart layout="vertical" data={top5Ingreso} margin={{ left: 70 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(v) => `C$${v}`} />
                  <YAxis type="category" dataKey="platillo" width={120} />
                  <Tooltip formatter={(v) => [`C$ ${v.toFixed(2)}`, "Ingreso"]} />
                  <Bar dataKey="subtotal" fill="#f97316" barSize={25}>
                    <LabelList dataKey="subtotal" position="right" formatter={(v) => `C$${v.toFixed(0)}`} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <h5 className="mb-3">🔄 Frecuencia de pedidos</h5>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart layout="vertical" data={top5Frecuencia} margin={{ left: 70 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="platillo" width={120} />
                  <Tooltip formatter={(v) => [`${v} veces`, "Frecuencia"]} />
                  <Bar dataKey="frecuencia" fill="#8b5cf6" barSize={25}>
                    <LabelList dataKey="frecuencia" position="right" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm">
            <Card.Body>
              <h5 className="mb-3">📋 Detalle completo de platillos</h5>
              <div style={{ overflowX: "auto" }}>
                <Table striped bordered hover responsive>
                  <thead>
                    <tr><th>Platillo</th><th>Cantidad</th><th>Subtotal (C$)</th><th>Frecuencia</th><th>Ranking</th></tr>
                  </thead>
                  <tbody>
                    {rankingData.map((p, idx) => (
                      <tr key={idx}>
                        <td>{p.platillo}</td><td>{p.cantidad}</td><td>{p.subtotal.toFixed(2)}</td><td>{p.frecuencia}</td><td>{p.ranking}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4 mb-5">
        <Col md={6}>
          <Card className="shadow-sm border-warning">
            <Card.Body><h5><i className="bi bi-lightbulb me-2"></i>Hallazgo clave</h5><p>{hallazgo}</p></Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="shadow-sm border-info">
            <Card.Body><h5><i className="bi bi-check2-circle me-2"></i>Acción recomendada</h5><p>{accionRecomendada}</p></Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
});

export default Visualizacion2;