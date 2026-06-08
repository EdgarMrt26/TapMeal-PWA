import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Row, Col, Card, Table, Spinner, Alert } from "react-bootstrap";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList
} from "recharts";
import { supabase } from "../../database/supabaseconfig";

const Visualizacion1 = forwardRef(({ fechaDesde, fechaHasta }, ref) => {
  const [cargando, setCargando] = useState(true);
  const [sinDatos, setSinDatos] = useState(false);
  const [totalIngresos, setTotalIngresos] = useState(0);
  const [totalPedidos, setTotalPedidos] = useState(0);
  const [ticketPromedio, setTicketPromedio] = useState(0);
  const [ventasPorDia, setVentasPorDia] = useState([]);
  const [ingresosPorTipo, setIngresosPorTipo] = useState([]);
  const [top5DiasIngreso, setTop5DiasIngreso] = useState([]);
  const [bottom5DiasIngreso, setBottom5DiasIngreso] = useState([]);
  const [variacionPorcentual, setVariacionPorcentual] = useState(null);
  const [hallazgo, setHallazgo] = useState("");
  const [accionRecomendada, setAccionRecomendada] = useState("");

  useEffect(() => {
    if (fechaDesde && fechaHasta) cargarDatos();
  }, [fechaDesde, fechaHasta]);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setSinDatos(false);
      const inicio = `${fechaDesde} 00:00:00`;
      const fin = `${fechaHasta} 23:59:59`;

      // 1. Obtener pedidos con su tipo
      const { data: pedidos, error } = await supabase
        .from("Pedido")
        .select(`
          id_pedido,
          fecha,
          Tipo_pedido ( descripcion )
        `)
        .gte("fecha", inicio)
        .lte("fecha", fin);

      if (error) throw error;
      if (!pedidos || pedidos.length === 0) {
        setSinDatos(true);
        limpiarDatos();
        setCargando(false);
        return;
      }

      const idsPedidos = pedidos.map(p => p.id_pedido);

      // 2. Detalles
      const { data: detalles, error: errDet } = await supabase
        .from("Detalle_pedido")
        .select("id_pedido, cantidad, precio_unitario")
        .in("id_pedido", idsPedidos);

      if (errDet) throw errDet;
      if (!detalles || detalles.length === 0) {
        setSinDatos(true);
        limpiarDatos();
        setCargando(false);
        return;
      }

      // 3. Calcular total real por pedido
      const mapaPedidoTotal = new Map();
      detalles.forEach(det => {
        const subtotal = (det.cantidad || 0) * (det.precio_unitario || 0);
        mapaPedidoTotal.set(det.id_pedido, (mapaPedidoTotal.get(det.id_pedido) || 0) + subtotal);
      });

      const pedidosConTotal = pedidos.map(ped => ({
        id_pedido: ped.id_pedido,
        fecha: ped.fecha,
        tipo: ped.Tipo_pedido?.descripcion || "Sin tipo",
        totalReal: mapaPedidoTotal.get(ped.id_pedido) || 0
      }));

      // 4. Totales globales
      const ingresosTotal = pedidosConTotal.reduce((s, p) => s + p.totalReal, 0);
      const pedidosTotal = pedidosConTotal.length;
      const promedio = pedidosTotal > 0 ? ingresosTotal / pedidosTotal : 0;
      setTotalIngresos(ingresosTotal);
      setTotalPedidos(pedidosTotal);
      setTicketPromedio(promedio);

      // 5. Ventas por día
      const mapaDias = new Map();
      pedidosConTotal.forEach(ped => {
        const fechaStr = ped.fecha.split("T")[0];
        if (!mapaDias.has(fechaStr)) mapaDias.set(fechaStr, { fecha: fechaStr, ingresos: 0, pedidos: 0 });
        const dia = mapaDias.get(fechaStr);
        dia.ingresos += ped.totalReal;
        dia.pedidos += 1;
      });
      const ventasPorDiaArray = Array.from(mapaDias.values()).sort((a, b) => a.fecha.localeCompare(b.fecha));
      setVentasPorDia(ventasPorDiaArray);

      // 6. Ingresos por tipo de pedido (SOLO "Local" y "Línea" - comparación flexible)
      // Normalizamos para comparar sin acentos y mayúsculas
      const normalize = (str) => str?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") || "";
      const esLocal = (t) => normalize(t) === "local";
      const esLinea = (t) => normalize(t) === "linea";

      const tiposFiltrados = pedidosConTotal.filter(p => esLocal(p.tipo) || esLinea(p.tipo));
      
      let ingresosPorTipoArray = [];
      if (tiposFiltrados.length > 0) {
        const mapaTipos = new Map();
        tiposFiltrados.forEach(ped => {
          const tipoKey = ped.tipo; // conservamos el nombre original
          if (!mapaTipos.has(tipoKey)) {
            mapaTipos.set(tipoKey, { tipo: tipoKey, ingresos: 0, pedidos: 0 });
          }
          const item = mapaTipos.get(tipoKey);
          item.ingresos += ped.totalReal;
          item.pedidos += 1;
        });
        ingresosPorTipoArray = Array.from(mapaTipos.values()).sort((a, b) => b.ingresos - a.ingresos);
      } else {
        // Si no hay Local/Línea, mostrar todos los tipos que sí aparecen en los pedidos
        const todosTipos = new Map();
        pedidosConTotal.forEach(ped => {
          if (!todosTipos.has(ped.tipo)) {
            todosTipos.set(ped.tipo, { tipo: ped.tipo, ingresos: 0, pedidos: 0 });
          }
          const item = todosTipos.get(ped.tipo);
          item.ingresos += ped.totalReal;
          item.pedidos += 1;
        });
        ingresosPorTipoArray = Array.from(todosTipos.values()).sort((a, b) => b.ingresos - a.ingresos);
        if (ingresosPorTipoArray.length === 0) {
          ingresosPorTipoArray = [{ tipo: "No hay datos de tipo", ingresos: 0, pedidos: 0 }];
        }
      }
      setIngresosPorTipo(ingresosPorTipoArray);

      // 7. Top y bottom días
      const sorted = [...ventasPorDiaArray].sort((a, b) => b.ingresos - a.ingresos);
      setTop5DiasIngreso(sorted.slice(0, 5));
      setBottom5DiasIngreso([...sorted].reverse().slice(0, 5).filter(d => d.ingresos > 0));

      // 8. Hallazgo y acción (resumido)
      const topDia = sorted[0]?.fecha || "ninguno";
      const tipoPrincipal = ingresosPorTipoArray[0]?.tipo || "ninguno";
      const hallazgoText = `En el período ${fechaDesde} al ${fechaHasta} hubo ${pedidosTotal} pedidos con ingresos totales de C$ ${ingresosTotal.toFixed(2)} (promedio C$ ${promedio.toFixed(2)}). Día pico: ${topDia}. ${ingresosPorTipoArray[0]?.tipo !== "No hay datos de tipo" ? `El tipo "${tipoPrincipal}" aporta el ${((ingresosPorTipoArray[0]?.ingresos || 0) / ingresosTotal * 100).toFixed(1)}% del ingreso.` : ""}`;
      const accionText = `Reforzar promociones los días de menor venta (${bottom5DiasIngreso.map(d => d.fecha).join(", ")}). Potenciar el tipo de pedido "${tipoPrincipal}".`;
      setHallazgo(hallazgoText);
      setAccionRecomendada(accionText);
    } catch (err) {
      console.error(err);
      setSinDatos(true);
      limpiarDatos();
    } finally {
      setCargando(false);
    }
  };

  const limpiarDatos = () => {
    setTotalIngresos(0);
    setTotalPedidos(0);
    setTicketPromedio(0);
    setVentasPorDia([]);
    setIngresosPorTipo([]);
    setTop5DiasIngreso([]);
    setBottom5DiasIngreso([]);
    setVariacionPorcentual(null);
    setHallazgo("No hay datos en el rango seleccionado.");
    setAccionRecomendada("Amplía el rango de fechas o verifica los pedidos registrados.");
  };

  const descargarExcel = () => {
    if (!ventasPorDia.length) {
      alert("No hay datos para exportar");
      return;
    }
    const resumenRows = [
      ["Indicador", "Valor"],
      ["Período", `${fechaDesde} al ${fechaHasta}`],
      ["Total Ingresos (C$)", totalIngresos.toFixed(2)],
      ["Total Pedidos", totalPedidos],
      ["Ticket Promedio (C$)", ticketPromedio.toFixed(2)],
    ];
    const detalleDiaRows = [
      ["Fecha", "Ingresos (C$)", "Cantidad Pedidos"],
      ...ventasPorDia.map(d => [d.fecha, d.ingresos.toFixed(2), d.pedidos])
    ];
    const detalleTipoRows = [
      ["Tipo de pedido", "Ingresos (C$)", "Cantidad Pedidos", "% Aporte"],
      ...ingresosPorTipo.map(t => [
        t.tipo,
        t.ingresos.toFixed(2),
        t.pedidos,
        totalIngresos > 0 ? ((t.ingresos / totalIngresos) * 100).toFixed(2) + "%" : "0%"
      ])
    ];
    const csvResumen = resumenRows.map(r => r.join(",")).join("\n");
    const csvDia = detalleDiaRows.map(r => r.join(",")).join("\n");
    const csvTipo = detalleTipoRows.map(r => r.join(",")).join("\n");
    const csvFinal = `RESUMEN GENERAL\n${csvResumen}\n\nVENTAS POR DÍA\n${csvDia}\n\nINGRESOS POR TIPO DE PEDIDO\n${csvTipo}`;
    const blob = new Blob(["\uFEFF" + csvFinal], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Ventas_Totales_${fechaDesde}_a_${fechaHasta}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  useImperativeHandle(ref, () => ({ descargarExcel }));

  if (cargando) return <div className="text-center"><Spinner animation="border" /></div>;
  if (sinDatos) return <Alert variant="warning">⚠️ No hay pedidos con detalles en el rango seleccionado.</Alert>;

  return (
    <>
      <Row className="g-4 mb-5">
        <Col md={4}><Card className="bg-primary text-white"><Card.Body><h5>💰 Ingresos Totales</h5><h2>C$ {totalIngresos.toFixed(2)}</h2></Card.Body></Card></Col>
        <Col md={4}><Card className="bg-info text-white"><Card.Body><h5>🧾 Total Pedidos</h5><h2>{totalPedidos}</h2></Card.Body></Card></Col>
        <Col md={4}><Card className="bg-success text-white"><Card.Body><h5>🍽️ Ticket Promedio</h5><h2>C$ {ticketPromedio.toFixed(2)}</h2></Card.Body></Card></Col>
      </Row>

      <Row className="g-4 mb-4">
        <Col lg={12}>
          <Card><Card.Body>
            <h5>📈 Evolución diaria</h5>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={ventasPorDia}><CartesianGrid /><XAxis dataKey="fecha" /><YAxis tickFormatter={v=>`C$${v}`} /><Tooltip formatter={v=>`C$${v.toFixed(2)}`} /><Line type="monotone" dataKey="ingresos" stroke="#3b82f6" strokeWidth={2} dot={{r:3}} /></LineChart>
            </ResponsiveContainer>
          </Card.Body></Card>
        </Col>
      </Row>

      <Row className="g-4 mb-4">
        <Col lg={6}>
          <Card><Card.Body>
            <h5>🍕 Ingresos por tipo (Local / Línea)</h5>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart layout="vertical" data={ingresosPorTipo} margin={{left:70}}><CartesianGrid /><XAxis type="number" tickFormatter={v=>`C$${v}`} /><YAxis type="category" dataKey="tipo" width={120} /><Tooltip formatter={v=>`C$${v.toFixed(2)}`} /><Bar dataKey="ingresos" fill="#f97316" barSize={25}><LabelList dataKey="ingresos" position="right" formatter={v=>`C$${v.toFixed(0)}`} /></Bar></BarChart>
            </ResponsiveContainer>
          </Card.Body></Card>
        </Col>
        <Col lg={6}>
          <Card><Card.Body>
            <h5>🏆 Top 5 días</h5>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart layout="vertical" data={top5DiasIngreso} margin={{left:70}}><CartesianGrid /><XAxis type="number" tickFormatter={v=>`C$${v}`} /><YAxis type="category" dataKey="fecha" width={100} /><Tooltip formatter={v=>`C$${v.toFixed(2)}`} /><Bar dataKey="ingresos" fill="#3b82f6" barSize={25}><LabelList dataKey="ingresos" position="right" formatter={v=>`C$${v.toFixed(0)}`} /></Bar></BarChart>
            </ResponsiveContainer>
          </Card.Body></Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col><Card><Card.Body>
          <h5>📋 Detalle por día</h5>
          <Table striped bordered hover><thead><tr><th>Fecha</th><th>Ingresos (C$)</th><th>Pedidos</th><th>Ticket Promedio</th></tr></thead><tbody>{ventasPorDia.map((d,i)=> <tr key={i}><td>{d.fecha}</td><td>{d.ingresos.toFixed(2)}</td><td>{d.pedidos}</td><td>{(d.ingresos/d.pedidos).toFixed(2)}</td></tr>)}</tbody></Table>
        </Card.Body></Card></Col>
      </Row>

      <Row className="g-4 mb-5">
        <Col md={6}><Card className="border-warning"><Card.Body><h5><i className="bi bi-lightbulb"></i> Hallazgo</h5><p>{hallazgo}</p></Card.Body></Card></Col>
        <Col md={6}><Card className="border-info"><Card.Body><h5><i className="bi bi-check2-circle"></i> Acción</h5><p>{accionRecomendada}</p></Card.Body></Card></Col>
      </Row>
    </>
  );
});

export default Visualizacion1;