import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Row, Col, Card, Table, Spinner } from "react-bootstrap";
import { ComposedChart, BarChart, Bar, Cell, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from "recharts";
import { supabase } from "../../database/supabaseconfig";

const COLORES_EXTRAS = [
  "#1b5e20", // 1. Verde Oscuro (Doble Queso)
  "#2e7d32", // 2. Verde Medio (Tocineta)
  "#c0ca33", // 3. Verde/Amarillo (Papas Fritas)
  "#e64a19", // 4. Naranja (Champiñones)
  "#f4511e", // 5. Naranja/Rojo (Aguacate)
  "#c62828", // 6. Rojo (Cebolla Caramelizada)
  "#b71c1c", // 7. Rojo Oscuro (Huevo Frito)
  "#880e4f"  // 8. Rojo Vino (Jalapeños)
];

const Visualizacion3 = forwardRef(({ fechaDesde, fechaHasta }, ref) => {
  const [cargando, setCargando] = useState(true);
  const [totalUnidades, setTotalUnidades] = useState(0);
  const [totalIngresos, setTotalIngresos] = useState(0);
  const [tasaEfectividad, setTasaEfectividad] = useState(0);
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

      // 1. Obtener todos los pedidos del rango de fechas
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

      // 2. Obtener todos los extras disponibles en el catálogo
      const { data: todosLosExtras, error: errExt } = await supabase
        .from("Extras")
        .select("id_extra, descripcion, precio");

      if (errExt) throw errExt;

      // 3. Obtener los detalles de los pedidos
      const { data: detalles, error: errDet } = await supabase
        .from("Detalle_pedido")
        .select(`
          id_pedido,
          cantidad,
          id_extra,
          Extras (
            descripcion,
            precio
          )
        `)
        .in("id_pedido", idsPedidos);

      if (errDet) throw errDet;
      if (!detalles || detalles.length === 0) {
        limpiarDatos();
        setCargando(false);
        return;
      }

      // Filtrar detalles que contengan extras válidos
      const detallesConExtras = detalles.filter(d => d.id_extra !== null && d.Extras);

      // Calcular KPI 1: Total unidades vendidas
      const totalUnidadesCalc = detallesConExtras.reduce((acc, curr) => acc + (curr.cantidad || 0), 0);

      // Calcular KPI 2: Total ingresos por extras
      const totalIngresosCalc = detallesConExtras.reduce((acc, curr) => {
        const precio = parseFloat(curr.Extras?.precio || 0);
        return acc + (curr.cantidad || 0) * precio;
      }, 0);

      // Calcular KPI 3: Tasa de efectividad de extras ((Pedidos con extras / Total pedidos) * 100)
      const idsPedidosConExtras = new Set(detallesConExtras.map(d => d.id_pedido));
      const totalPedidosConExtras = idsPedidosConExtras.size;
      const tasaEfectividadCalc = pedidos.length 
        ? parseFloat(((totalPedidosConExtras / pedidos.length) * 100).toFixed(1)) 
        : 0;

      // Inicializar mapa con todos los extras para no omitir ninguno
      const mapaExtras = new Map();
      if (todosLosExtras) {
        todosLosExtras.forEach(e => {
          mapaExtras.set(e.descripcion, { cantidad: 0, subtotal: 0, frecuencia: 0 });
        });
      }

      // Agrupar y calcular ingresos por tipo de extra
      detallesConExtras.forEach(d => {
        const nombre = d.Extras?.descripcion || "Desconocido";
        const cant = d.cantidad || 0;
        const precio = parseFloat(d.Extras?.precio || 0);
        const subtotal = cant * precio;

        if (!mapaExtras.has(nombre)) {
          mapaExtras.set(nombre, { cantidad: 0, subtotal: 0, frecuencia: 0 });
        }
        const item = mapaExtras.get(nombre);
        item.cantidad += cant;
        item.subtotal += subtotal;
        item.frecuencia += 1;
      });

      let extrasArray = Array.from(mapaExtras.entries()).map(([extra, values]) => ({
        extra,
        cantidad: values.cantidad,
        subtotal: values.subtotal,
        frecuencia: values.frecuencia
      }));

      // Ordenar de mayor a menor por cantidad para el ranking
      extrasArray.sort((a, b) => b.cantidad - a.cantidad);

      // Calcular porcentajes acumulados de Pareto
      let sumaAcumulada = 0;
      const extrasConPareto = extrasArray.map((e, idx) => {
        sumaAcumulada += e.subtotal;
        const porcentajeAcumulado = totalIngresosCalc > 0 
          ? parseFloat(((sumaAcumulada / totalIngresosCalc) * 100).toFixed(1))
          : 0;
        return {
          ...e,
          ranking: idx + 1,
          acumulado: sumaAcumulada,
          porcentajeAcumulado
        };
      });

      // Generar hallazgos dinámicos basados en la regla 80/20 y ranking
      const extrasPrincipales = extrasConPareto.filter(e => e.porcentajeAcumulado <= 85);
      const principalesSeleccionados = extrasPrincipales.length > 0 ? extrasPrincipales : extrasConPareto.slice(0, 1);
      const nombresPrincipales = principalesSeleccionados.map(e => e.extra).join(", ");
      
      const hallazgoText = `Los extras principales (${nombresPrincipales || "N/A"}) concentran la mayor parte de las ganancias adicionales del restaurante. La tasa de efectividad de venta sugerida (upsell) en el sistema TapMeal es del ${tasaEfectividadCalc}%, lo cual representa un alto engagement de los clientes.`;
      
      const accionText = `Se sugiere asegurar y automatizar el inventario de los complementos estrella (${nombresPrincipales || "los más vendidos"}) para evitar pérdidas por quiebres de stock. Depurar del menú aquellos extras con nula rotación para simplificar las compras y reducir costos operativos.`;

      setTotalUnidades(totalUnidadesCalc);
      setTotalIngresos(totalIngresosCalc);
      setTasaEfectividad(tasaEfectividadCalc);
      setRankingData(extrasConPareto);
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
    setTasaEfectividad(0);
    setRankingData([]);
    setHallazgo("No hay datos de adicionales registrados en el rango de fechas seleccionado.");
    setAccionRecomendada("Amplía el rango de fechas o verifica si los pedidos registrados contienen complementos.");
  };

  const descargarExcel = () => {
    if (!rankingData.length) {
      alert("No hay datos para exportar");
      return;
    }

    const resumenRows = [
      ["Indicador", "Valor"],
      ["Período", `${fechaDesde} al ${fechaHasta}`],
      ["Total Unidades de Extras", totalUnidades],
      ["Total Ingresos por Extras (C$)", totalIngresos.toFixed(2)],
      ["Tasa de Efectividad de Extras", `${tasaEfectividad}%`],
    ];

    const detalleRows = [
      ["Ranking", "Extra", "Unidades Vendidas", "Ingresos Totales (C$)", "Pedidos (Frecuencia)", "% Acumulado"],
      ...rankingData.map(p => [
        p.ranking,
        p.extra,
        p.cantidad,
        p.subtotal.toFixed(2),
        p.frecuencia,
        `${p.porcentajeAcumulado}%`
      ])
    ];

    const csvResumen = resumenRows.map(r => r.join(",")).join("\n");
    const csvDetalle = detalleRows.map(r => r.join(",")).join("\n");
    const csvFinal = `RESUMEN DE RENTABILIDAD DE EXTRAS\n${csvResumen}\n\nDETALLE DE PRODUCTOS ADICIONALES (ANÁLISIS DE PARETO)\n${csvDetalle}`;

    const blob = new Blob(["\uFEFF" + csvFinal], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Rentabilidad_Extras_${fechaDesde}_a_${fechaHasta}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  useImperativeHandle(ref, () => ({
    descargarExcel
  }));

  const obtenerYAxisProps = () => {
    if (rankingData.length === 0) {
      return { domain: [0, 100], ticks: [0, 25, 50, 75, 100] };
    }
    const maxVal = Math.max(...rankingData.map(e => e.subtotal));
    let maxY = 100;
    if (maxVal <= 50) maxY = 50;
    else if (maxVal <= 100) maxY = 100;
    else if (maxVal <= 200) maxY = 200;
    else if (maxVal <= 300) maxY = 300;
    else if (maxVal <= 500) maxY = 500;
    else if (maxVal <= 1000) maxY = 1000;
    else if (maxVal <= 2000) maxY = 2000;
    else maxY = Math.ceil(maxVal / 1000) * 1000;

    const step = maxY / 4;
    const ticks = [0, step, step * 2, step * 3, maxY].map(v => Math.round(v));
    return { domain: [0, maxY], ticks };
  };

  const { domain: yDomain, ticks: yTicks } = obtenerYAxisProps();

  const renderBarLabel = (props) => {
    const { x, y, width, value } = props;
    if (value === undefined || value === null) return null;
    return (
      <text x={x + width / 2} y={y - 8} fill="#374151" textAnchor="middle" fontSize={11} fontWeight="600">
        {value.toFixed(0)}
      </text>
    );
  };

  const renderLineLabel = (props) => {
    const { x, y, value } = props;
    if (value === undefined || value === null) return null;
    const valText = value % 1 === 0 ? value.toFixed(0) : value.toFixed(1);
    return (
      <text x={x} y={y - 12} fill="#ea580c" textAnchor="middle" fontSize={11} fontWeight="600">
        {valText}%
      </text>
    );
  };

  if (cargando) return <div className="text-center my-4"><Spinner animation="border" /></div>;

  // Tomar los top 8 extras por cantidad para el gráfico de barras doble vertical
  const top8Extras = rankingData.slice(0, 8);

  return (
    <>
      {/* Tarjetas KPI */}
      <Row className="g-4 mb-5">
        <Col md={4}>
          <Card className="shadow-sm border-0 bg-primary text-white h-100">
            <Card.Body className="d-flex flex-column justify-content-center py-4">
              <h5 className="mb-2 opacity-75">📦 Total Unidades de Extras</h5>
              <h2>{totalUnidades.toLocaleString()} und</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm border-0 bg-success text-white h-100">
            <Card.Body className="d-flex flex-column justify-content-center py-4">
              <h5 className="mb-2 opacity-75">💰 Ingresos por Extras</h5>
              <h2>C$ {totalIngresos.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm border-0 bg-info text-white h-100">
            <Card.Body className="d-flex flex-column justify-content-center py-4">
              <h5 className="mb-2 opacity-75">🎯 Efectividad de Venta (Upsell)</h5>
              <h2>{tasaEfectividad}%</h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Grid de Gráficos (Pareto en Col 1, Stacked Vertical en Col 2) */}
      <Row className="g-4 mb-4">
        {/* Columna 1: Pareto (80/20) */}
        <Col lg={6}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <h5 className="mb-4">📊 Análisis de Pareto (80/20) de Extras</h5>
              
              <div style={{ width: "100%", height: 380 }}>
                {rankingData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={rankingData}
                      margin={{ top: 25, right: 20, left: 10, bottom: 50 }}
                      barCategoryGap="20%"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="extra" 
                        tick={{ fill: "#374151", fontSize: 11 }} 
                        angle={-45}
                        textAnchor="end"
                        height={70}
                      />
                      {/* Eje Y Izquierdo para los Ingresos */}
                      <YAxis 
                        yAxisId="left" 
                        orientation="left" 
                        stroke="#1b365d"
                        tick={{ fill: "#374151", fontSize: 11 }}
                        domain={yDomain}
                        ticks={yTicks}
                      />
                      {/* Eje Y Derecho para el Porcentaje Acumulado */}
                      <YAxis 
                        yAxisId="right" 
                        orientation="right" 
                        stroke="#ea580c"
                        tick={{ fill: "#374151", fontSize: 11 }}
                        domain={[0, 100]}
                        ticks={[0, 20, 40, 60, 80, 100]}
                      />
                      <Tooltip 
                        cursor={false}
                        formatter={(value, name) => {
                          if (name === "Ingresos") return [`C$ ${parseFloat(value).toFixed(2)}`, "Ingresos"];
                          if (name === "% Acumulado") return [`${value}%`, "% Acumulado"];
                          return [value, name];
                        }} 
                      />
                      <Legend 
                        verticalAlign="top" 
                        align="left"
                        height={40} 
                        iconType="circle"
                        content={() => (
                          <div className="d-flex gap-3 mb-3" style={{ fontSize: "0.85rem", paddingLeft: "10px" }}>
                            <div className="d-flex align-items-center gap-1">
                              <span 
                                style={{ 
                                  display: "inline-block", 
                                  width: 8, 
                                  height: 8, 
                                  borderRadius: "50%", 
                                  backgroundColor: "#24458f" 
                                }} 
                              />
                              <span style={{ color: "#374151", fontWeight: "600" }}>Ingresos</span>
                            </div>
                            <div className="d-flex align-items-center gap-1">
                              <span 
                                style={{ 
                                  display: "inline-block", 
                                  width: 8, 
                                  height: 8, 
                                  borderRadius: "50%", 
                                  backgroundColor: "#ea580c" 
                                }} 
                              />
                              <span style={{ color: "#374151", fontWeight: "600" }}>% Acumulado</span>
                            </div>
                          </div>
                        )}
                      />
                      <Bar 
                        yAxisId="left" 
                        dataKey="subtotal" 
                        name="Ingresos" 
                        fill="#24458f" 
                        maxBarSize={45}
                        radius={[3, 3, 0, 0]}
                        label={renderBarLabel}
                      />
                      <Line 
                        yAxisId="right" 
                        type="monotone" 
                        dataKey="porcentajeAcumulado" 
                        name="% Acumulado" 
                        stroke="#ea580c" 
                        strokeWidth={2.5} 
                        dot={{ fill: "#ea580c", strokeWidth: 1, r: 4 }}
                        activeDot={{ r: 6, fill: "#ea580c" }} 
                        label={renderLineLabel}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="d-flex align-items-center justify-content-center h-100">
                    <p className="text-muted">No hay datos suficientes para graficar.</p>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Columna 2: Ránking y Aporte Económico (Gráfico Doble Vertical de 8 extras) */}
        <Col lg={6}>
          <Card className="shadow-sm h-100">
            <Card.Body className="d-flex flex-column">
              <h5 className="mb-4">📈 Ránking de Extras Más Vendidos y su Aporte Económico</h5>
              
              <div className="flex-grow-1 d-flex flex-column" style={{ minHeight: 390 }}>
                {top8Extras.length > 0 ? (
                  <>
                    {/* Gráfico Superior: Cantidad */}
                    <div style={{ width: "100%", height: 170 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={top8Extras}
                          margin={{ top: 25, right: 20, left: 10, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="extra" hide />
                          <YAxis 
                            domain={[0, (max) => Math.ceil(max * 1.2)]}
                            tick={{ fill: "#374151", fontSize: 10 }}
                            axisLine={true}
                            tickLine={true}
                            width={50}
                            label={{ value: 'Cantidad', angle: -90, position: 'insideLeft', offset: -5, style: { textAnchor: 'middle', fontSize: 10, fill: '#374151', fontWeight: 'bold' } }}
                          />
                          <Tooltip formatter={(v) => [`${v} und`, "Cantidad"]} />
                          <Bar dataKey="cantidad" barSize={28}>
                            {top8Extras.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORES_EXTRAS[index % COLORES_EXTRAS.length]} />
                            ))}
                            <LabelList dataKey="cantidad" position="top" fill="#374151" fontSize={10} fontWeight="600" />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Divisor muy tenue alineado al estilo original */}
                    <div className="text-center text-muted position-relative my-2" style={{ height: "20px" }}>
                      <hr style={{ margin: "10px 0", borderColor: "#cbd5e1", opacity: 0.3 }} />
                      <span style={{ 
                        position: "absolute", 
                        top: "50%", 
                        left: "50%", 
                        transform: "translate(-50%, -50%)", 
                        backgroundColor: "#ffffff", 
                        padding: "0 10px", 
                        fontSize: "0.75rem", 
                        fontWeight: "600",
                        color: "#64748b",
                        letterSpacing: "1px"
                      }}>
                        EXTRA
                      </span>
                    </div>

                    {/* Gráfico Inferior: Ingresos */}
                    <div style={{ width: "100%", height: 210 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={top8Extras}
                          margin={{ top: 25, right: 20, left: 10, bottom: 45 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis 
                            dataKey="extra" 
                            tick={{ fill: "#374151", fontSize: 9 }}
                            axisLine={true}
                            tickLine={true}
                            interval={0}
                            angle={-20}
                            textAnchor="end"
                          />
                          <YAxis 
                            tickFormatter={(v) => `C$${v}`}
                            tick={{ fill: "#374151", fontSize: 10 }}
                            axisLine={true}
                            tickLine={true}
                            width={50}
                            domain={[0, (max) => Math.ceil(max * 1.2)]}
                            label={{ value: 'Ingresos por Extras', angle: -90, position: 'insideLeft', offset: -5, style: { textAnchor: 'middle', fontSize: 10, fill: '#374151', fontWeight: 'bold' } }}
                          />
                          <Tooltip formatter={(v) => [`C$ ${v.toFixed(2)}`, "Ingreso"]} />
                          <Bar dataKey="subtotal" barSize={28}>
                            {top8Extras.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORES_EXTRAS[index % COLORES_EXTRAS.length]} />
                            ))}
                            <LabelList 
                              dataKey="subtotal" 
                              position="top" 
                              fill="#374151" 
                              fontSize={10} 
                              fontWeight="600" 
                              formatter={(v) => `C$${v.toFixed(0)}`}
                            />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </>
                ) : (
                  <div className="d-flex align-items-center justify-content-center h-100">
                    <p className="text-muted">No hay datos suficientes para graficar.</p>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tabla detallada */}
      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm">
            <Card.Body>
              <h5 className="mb-3">📋 Detalle de Desempeño y Pareto de Extras</h5>
              <div style={{ overflowX: "auto" }}>
                <Table striped bordered hover responsive className="mb-0">
                  <thead className="table-dark">
                    <tr>
                      <th>Ranking</th>
                      <th>Extra</th>
                      <th>Unidades Vendidas</th>
                      <th>Ingresos Totales (C$)</th>
                      <th>Frecuencia (Pedidos)</th>
                      <th>% Acumulado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankingData.length > 0 ? (
                      rankingData.map((e) => (
                        <tr key={e.ranking}>
                          <td><strong>#{e.ranking}</strong></td>
                          <td>{e.extra}</td>
                          <td>{e.cantidad.toLocaleString()}</td>
                          <td>C$ {e.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td>{e.frecuencia}</td>
                          <td>
                            <span 
                              className={`badge ${e.porcentajeAcumulado <= 80 ? 'bg-success' : 'bg-secondary'}`}
                              style={{ fontSize: "0.85rem" }}
                            >
                              {e.porcentajeAcumulado}%
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center text-muted py-3">No hay datos disponibles en la tabla</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Hallazgos y Decisiones Gerenciales */}
      <Row className="g-4 mb-4">
        <Col md={6}>
          <Card className="shadow-sm border-warning h-100">
            <Card.Body>
              <h5 className="text-warning mb-3">
                <i className="bi bi-lightbulb-fill me-2"></i>Hallazgo clave (Pareto)
              </h5>
              <p className="mb-0" style={{ lineHeight: "1.6", fontSize: "0.95rem" }}>
                {hallazgo}
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="shadow-sm border-info h-100">
            <Card.Body>
              <h5 className="text-info mb-3">
                <i className="bi bi-check2-circle me-2"></i>Acción recomendada
              </h5>
              <p className="mb-0" style={{ lineHeight: "1.6", fontSize: "0.95rem" }}>
                {accionRecomendada}
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
});

export default Visualizacion3;