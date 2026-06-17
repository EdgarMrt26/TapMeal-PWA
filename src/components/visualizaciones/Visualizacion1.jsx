import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Row, Col, Card, Table, Spinner, Alert } from "react-bootstrap";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { supabase } from "../../database/supabaseconfig";

const DIAS_SEMANA = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

const Visualizacion1 = forwardRef(({ fechaDesde, fechaHasta }, ref) => {
  const [cargando, setCargando] = useState(true);
  const [sinDatos, setSinDatos] = useState(false);
  const [totalIngresos, setTotalIngresos] = useState(0);
  const [totalPedidos, setTotalPedidos] = useState(0);
  const [ticketPromedio, setTicketPromedio] = useState(0);
  const [ventasPorDia, setVentasPorDia] = useState([]);
  const [ingresosPorTipo, setIngresosPorTipo] = useState([]);
  const [top5DiasIngreso, setTop5DiasIngreso] = useState([]);
  const [mapaCalorSemana, setMapaCalorSemana] = useState([]);
  const [hallazgo, setHallazgo] = useState("");
  const [accionRecomendada, setAccionRecomendada] = useState("");

  useEffect(() => {
    if (fechaDesde && fechaHasta) cargarDatos();
  }, [fechaDesde, fechaHasta]);

  const limpiarDatos = () => {
    setTotalIngresos(0);
    setTotalPedidos(0);
    setTicketPromedio(0);
    setVentasPorDia([]);
    setIngresosPorTipo([]);
    setTop5DiasIngreso([]);
    setMapaCalorSemana([]);
    setHallazgo("No hay datos en el rango seleccionado.");
    setAccionRecomendada(
      "Amplía el rango de fechas o verifica los pedidos registrados."
    );
  };

  const obtenerRangoFechas = () => {
    const inicio = `${fechaDesde}T00:00:00`;

    const fechaFin = new Date(`${fechaHasta}T00:00:00`);
    fechaFin.setDate(fechaFin.getDate() + 1);

    const fin = fechaFin.toISOString().split("T")[0] + "T00:00:00";

    return { inicio, fin };
  };

  const obtenerColorHeatmap = (valor, maximo) => {
    if (!valor || maximo === 0) return "#f3f4f6";

    const intensidad = valor / maximo;

    if (intensidad >= 0.8) return "#ff6a00";
    if (intensidad >= 0.6) return "#fb923c";
    if (intensidad >= 0.4) return "#fdba74";
    if (intensidad >= 0.2) return "#fed7aa";

    return "#ffedd5";
  };

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setSinDatos(false);

      const { inicio, fin } = obtenerRangoFechas();

      const { data: pedidos, error: errorPedidos } = await supabase
        .from("Pedido")
        .select("id_pedido, fecha, id_tipo, total")
        .gte("fecha", inicio)
        .lt("fecha", fin)
        .order("fecha", { ascending: true });

      if (errorPedidos) throw errorPedidos;

      if (!pedidos || pedidos.length === 0) {
        limpiarDatos();
        setSinDatos(true);
        return;
      }

      const idsPedidos = pedidos.map((p) => p.id_pedido);

      const { data: detalles, error: errorDetalles } = await supabase
        .from("Detalle_pedido")
        .select("id_pedido, cantidad, precio_unitario")
        .in("id_pedido", idsPedidos);

      if (errorDetalles) throw errorDetalles;

      if (!detalles || detalles.length === 0) {
        limpiarDatos();
        setSinDatos(true);
        return;
      }

      const { data: tipos, error: errorTipos } = await supabase
        .from("Tipo_pedido")
        .select("id_tipo, descripcion");

      if (errorTipos) throw errorTipos;

      const mapaTipos = new Map();
      (tipos || []).forEach((tipo) => {
        mapaTipos.set(tipo.id_tipo, tipo.descripcion);
      });

      const mapaTotalPedido = new Map();

      detalles.forEach((detalle) => {
        const cantidad = Number(detalle.cantidad || 0);
        const precio = Number(detalle.precio_unitario || 0);
        const subtotal = cantidad * precio;

        mapaTotalPedido.set(
          detalle.id_pedido,
          (mapaTotalPedido.get(detalle.id_pedido) || 0) + subtotal
        );
      });

      const pedidosProcesados = pedidos.map((pedido) => ({
        ...pedido,
        tipo: mapaTipos.get(pedido.id_tipo) || "Sin tipo",
        totalReal:
          mapaTotalPedido.get(pedido.id_pedido) || Number(pedido.total || 0),
      }));

      const ingresosTotal = pedidosProcesados.reduce(
        (acc, pedido) => acc + pedido.totalReal,
        0
      );

      const pedidosTotal = pedidosProcesados.length;
      const promedio = pedidosTotal > 0 ? ingresosTotal / pedidosTotal : 0;

      setTotalIngresos(ingresosTotal);
      setTotalPedidos(pedidosTotal);
      setTicketPromedio(promedio);

      const mapaDias = new Map();
      const mapaTipoPedido = new Map();

      const mapaSemana = new Map(
        DIAS_SEMANA.map((dia) => [
          dia,
          {
            dia,
            ingresos: 0,
            pedidos: 0,
            ticketPromedio: 0,
          },
        ])
      );

      pedidosProcesados.forEach((pedido) => {
        const fechaPedido = new Date(pedido.fecha);
        const fechaStr = String(pedido.fecha).split("T")[0].split(" ")[0];
        const diaSemana = DIAS_SEMANA[fechaPedido.getDay()];

        if (!mapaDias.has(fechaStr)) {
          mapaDias.set(fechaStr, {
            fecha: fechaStr,
            ingresos: 0,
            pedidos: 0,
          });
        }

        const dia = mapaDias.get(fechaStr);
        dia.ingresos += pedido.totalReal;
        dia.pedidos += 1;

        if (!mapaTipoPedido.has(pedido.tipo)) {
          mapaTipoPedido.set(pedido.tipo, {
            tipo: pedido.tipo,
            ingresos: 0,
            pedidos: 0,
          });
        }

        const tipo = mapaTipoPedido.get(pedido.tipo);
        tipo.ingresos += pedido.totalReal;
        tipo.pedidos += 1;

        const semana = mapaSemana.get(diaSemana);
        semana.ingresos += pedido.totalReal;
        semana.pedidos += 1;
      });

      const ventasDia = Array.from(mapaDias.values()).sort((a, b) =>
        a.fecha.localeCompare(b.fecha)
      );

      const tiposArray = Array.from(mapaTipoPedido.values()).sort(
        (a, b) => b.ingresos - a.ingresos
      );

      const heatmapArray = Array.from(mapaSemana.values()).map((dia) => ({
        ...dia,
        ticketPromedio: dia.pedidos > 0 ? dia.ingresos / dia.pedidos : 0,
      }));

      const topDias = [...ventasDia]
        .sort((a, b) => b.ingresos - a.ingresos)
        .slice(0, 5);

      setVentasPorDia(ventasDia);
      setIngresosPorTipo(tiposArray);
      setTop5DiasIngreso(topDias);
      setMapaCalorSemana(heatmapArray);

      const tipoPrincipal = tiposArray[0]?.tipo || "Sin tipo";
      const diaPico = topDias[0]?.fecha || "sin datos";

      const diaSemanaMasFuerte = [...heatmapArray].sort(
        (a, b) => b.ingresos - a.ingresos
      )[0];

      setHallazgo(
        `En el período ${fechaDesde} al ${fechaHasta} se registraron ${pedidosTotal} pedidos con ingresos de C$ ${ingresosTotal.toFixed(
          2
        )}. El ticket promedio fue C$ ${promedio.toFixed(
          2
        )}. El día con mayor ingreso fue ${diaPico}. El día de semana más fuerte fue ${
          diaSemanaMasFuerte?.dia || "sin datos"
        }.`
      );

      setAccionRecomendada(
        `Reforzar promociones en los días de menor venta y potenciar el tipo de pedido "${tipoPrincipal}".`
      );
    } catch (error) {
      console.error("Error en Visualizacion1:", error);
      limpiarDatos();
      setSinDatos(true);
    } finally {
      setCargando(false);
    }
  };

  const descargarExcel = () => {
    if (!ventasPorDia.length) {
      alert("No hay datos para exportar");
      return;
    }

    const resumenRows = [
      ["Indicador", "Valor"],
      ["Período", `${fechaDesde} al ${fechaHasta}`],
      ["Total Ingresos", totalIngresos.toFixed(2)],
      ["Total Pedidos", totalPedidos],
      ["Ticket Promedio", ticketPromedio.toFixed(2)],
    ];

    const ventasRows = [
      ["Fecha", "Ingresos", "Pedidos", "Ticket Promedio"],
      ...ventasPorDia.map((dia) => [
        dia.fecha,
        dia.ingresos.toFixed(2),
        dia.pedidos,
        (dia.ingresos / dia.pedidos).toFixed(2),
      ]),
    ];

    const heatmapRows = [
      ["Día de semana", "Ingresos", "Pedidos", "Ticket Promedio"],
      ...mapaCalorSemana.map((dia) => [
        dia.dia,
        dia.ingresos.toFixed(2),
        dia.pedidos,
        dia.ticketPromedio.toFixed(2),
      ]),
    ];

    const csv =
      `RESUMEN\n${resumenRows.map((r) => r.join(",")).join("\n")}` +
      `\n\nVENTAS POR DÍA\n${ventasRows.map((r) => r.join(",")).join("\n")}` +
      `\n\nMAPA DE CALOR SEMANAL\n${heatmapRows
        .map((r) => r.join(","))
        .join("\n")}`;

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `Ventas_${fechaDesde}_a_${fechaHasta}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  useImperativeHandle(ref, () => ({ descargarExcel }));

  if (cargando) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" />
      </div>
    );
  }

  if (sinDatos) {
    return (
      <Alert variant="warning">
        ⚠️ No hay pedidos con detalles en el rango seleccionado.
      </Alert>
    );
  }

  const maxHeatmap = Math.max(
    ...mapaCalorSemana.map((dia) => dia.ingresos || 0),
    0
  );

  return (
    <>
      <Row className="g-4 mb-5">
        <Col md={4}>
          <Card className="bg-primary text-white">
            <Card.Body>
              <h5>💰 Ingresos Totales</h5>
              <h2>C$ {totalIngresos.toFixed(2)}</h2>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="bg-info text-white">
            <Card.Body>
              <h5>🧾 Total Pedidos</h5>
              <h2>{totalPedidos}</h2>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="bg-success text-white">
            <Card.Body>
              <h5>🍽️ Ticket Promedio</h5>
              <h2>C$ {ticketPromedio.toFixed(2)}</h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4 mb-4">
        <Col lg={12}>
          <Card>
            <Card.Body>
              <h5>📈 Evolución diaria</h5>

              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={ventasPorDia}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fecha" />
                  <YAxis tickFormatter={(v) => `C$${v}`} />
                  <Tooltip formatter={(v) => `C$ ${Number(v).toFixed(2)}`} />
                  <Line
                    type="monotone"
                    dataKey="ingresos"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4 mb-4">
        <Col lg={6}>
          <Card>
            <Card.Body>
              <h5>🍕 Ingresos por tipo de pedido</h5>

              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  layout="vertical"
                  data={ingresosPorTipo}
                  margin={{ left: 70 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(v) => `C$${v}`} />
                  <YAxis type="category" dataKey="tipo" width={120} />
                  <Tooltip formatter={(v) => `C$ ${Number(v).toFixed(2)}`} />
                  <Bar dataKey="ingresos" fill="#f97316" barSize={25}>
                    <LabelList
                      dataKey="ingresos"
                      position="right"
                      formatter={(v) => `C$${Number(v).toFixed(0)}`}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card>
            <Card.Body>
              <h5>🏆 Top 5 días por ingreso</h5>

              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  layout="vertical"
                  data={top5DiasIngreso}
                  margin={{ left: 70 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(v) => `C$${v}`} />
                  <YAxis type="category" dataKey="fecha" width={100} />
                  <Tooltip formatter={(v) => `C$ ${Number(v).toFixed(2)}`} />
                  <Bar dataKey="ingresos" fill="#3b82f6" barSize={25}>
                    <LabelList
                      dataKey="ingresos"
                      position="right"
                      formatter={(v) => `C$${Number(v).toFixed(0)}`}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4 mb-4">
        <Col lg={12}>
          <Card>
            <Card.Body>
              <h5>🔥 Mapa de calor por día de la semana</h5>
              <p className="text-muted small mb-3">
                Mientras más intenso el color, mayor ingreso generado ese día.
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                  gap: "12px",
                }}
              >
                {mapaCalorSemana.map((dia) => {
                  const bg = obtenerColorHeatmap(dia.ingresos, maxHeatmap);
                  const textoOscuro = dia.ingresos < maxHeatmap * 0.6;

                  return (
                    <div
                      key={dia.dia}
                      style={{
                        background: bg,
                        color: textoOscuro ? "#111827" : "white",
                        borderRadius: "14px",
                        padding: "16px",
                        minHeight: "120px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                        border: "1px solid rgba(0,0,0,0.06)",
                      }}
                    >
                      <h6 style={{ fontWeight: 800, marginBottom: 10 }}>
                        {dia.dia}
                      </h6>

                      <div style={{ fontSize: "0.85rem" }}>
                        Ingresos
                      </div>

                      <div style={{ fontSize: "1.2rem", fontWeight: 800 }}>
                        C$ {dia.ingresos.toFixed(2)}
                      </div>

                      <div style={{ marginTop: 8, fontSize: "0.82rem" }}>
                        Pedidos: <strong>{dia.pedidos}</strong>
                      </div>

                      <div style={{ fontSize: "0.82rem" }}>
                        Ticket:{" "}
                        <strong>C$ {dia.ticketPromedio.toFixed(2)}</strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Body>
              <h5>📋 Detalle por día</h5>

              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Ingresos</th>
                    <th>Pedidos</th>
                    <th>Ticket Promedio</th>
                  </tr>
                </thead>

                <tbody>
                  {ventasPorDia.map((dia, index) => (
                    <tr key={index}>
                      <td>{dia.fecha}</td>
                      <td>C$ {dia.ingresos.toFixed(2)}</td>
                      <td>{dia.pedidos}</td>
                      <td>C$ {(dia.ingresos / dia.pedidos).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4 mb-5">
        <Col md={6}>
          <Card className="border-warning">
            <Card.Body>
              <h5>💡 Hallazgo</h5>
              <p>{hallazgo}</p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="border-info">
            <Card.Body>
              <h5>✅ Acción recomendada</h5>
              <p>{accionRecomendada}</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
});

export default Visualizacion1;