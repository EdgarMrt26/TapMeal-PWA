import React, { createContext, useContext, useState } from "react";

const CarritoContexto = createContext();

export const CarritoProveedor = ({ children }) => {
  const [carrito, setCarrito] = useState([]);

  const agregarAlCarrito = (platillo) => {
    setCarrito(prev => {
      const existe = prev.find(item =>
        item.id_platillo === platillo.id_platillo &&
        item.extraSeleccionado?.id_extra === platillo.extraSeleccionado?.id_extra &&
        item.salsaSeleccionada?.id_salsa === platillo.salsaSeleccionada?.id_salsa
      );
      if (existe) {
        return prev.map(item =>
          item.id_platillo === platillo.id_platillo &&
          item.extraSeleccionado?.id_extra === platillo.extraSeleccionado?.id_extra &&
          item.salsaSeleccionada?.id_salsa === platillo.salsaSeleccionada?.id_salsa
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }
      return [...prev, { ...platillo, cantidad: 1 }];
    });
  };

  const aumentarCantidad = (index) => {
    setCarrito(prev => prev.map((item, i) =>
      i === index ? { ...item, cantidad: item.cantidad + 1 } : item
    ));
  };

  const disminuirCantidad = (index) => {
    setCarrito(prev => {
      const item = prev[index];
      if (item.cantidad === 1) return prev.filter((_, i) => i !== index);
      return prev.map((item, i) =>
        i === index ? { ...item, cantidad: item.cantidad - 1 } : item
      );
    });
  };

  const eliminarDelCarrito = (index) => {
    setCarrito(prev => prev.filter((_, i) => i !== index));
  };

  const actualizarExtra = (index, nuevoExtra) => {
    setCarrito(prev => prev.map((item, i) =>
      i === index ? { ...item, extraSeleccionado: nuevoExtra } : item
    ));
  };

  const actualizarSalsa = (index, nuevaSalsa) => {
    setCarrito(prev => prev.map((item, i) =>
      i === index ? { ...item, salsaSeleccionada: nuevaSalsa } : item
    ));
  };

  const limpiarCarrito = () => setCarrito([]);

  const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);

  const totalCarrito = carrito.reduce((acc, item) => {
    const precioExtra = item.extraSeleccionado ? parseFloat(item.extraSeleccionado.precio || 0) : 0;
    const precioSalsa = item.salsaSeleccionada ? parseFloat(item.salsaSeleccionada.precio || 0) : 0;
    return acc + (parseFloat(item.precio || 0) + precioExtra + precioSalsa) * item.cantidad;
  }, 0);

  return (
    <CarritoContexto.Provider value={{
      carrito,
      agregarAlCarrito,
      aumentarCantidad,
      disminuirCantidad,
      eliminarDelCarrito,
      actualizarExtra,
      actualizarSalsa,
      limpiarCarrito,
      totalItems,
      totalCarrito,
    }}>
      {children}
    </CarritoContexto.Provider>
  );
};

export const useCarrito = () => useContext(CarritoContexto);