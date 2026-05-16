import React,{useState, useEffect} from "react";
import { Table, Spinner, Button } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css"


const TablaMesa = ({
  mesas,
  abrirModalEdicion,
  abrirModalEliminacion
}) => {
  const [loading, setLoading] = useState(true);


  useEffect(()=>{
    if (mesas && mesas.length > 0){
      setLoading(false);

    }else{
      setLoading(true);
    }
  },[mesas]);



  return(
    <>
    {loading ? (
      <div  className="text-center">
        <h4>Cargando Mesas...</h4>
        <Spinner animation="border" variant="success" role="status"/>
      </div>
    ):(
      <Table striped borderless hover responsive size="sm">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre Mesa</th>
            <th className="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {mesas.map((mesas)=>(
            <tr key={mesas.id_mesa}>
              <td>{mesas.id_mesa}</td>
              <td>{mesas.nombre_mesa}</td>
              <td className="text-center">
                <Button
                variant="outline-warning"
                size="sm"
                className="m-1"
                onClick={()=>abrirModalEdicion(mesas)}
                >
                  <i className="bi bi-pencil"></i>
                </Button>

                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={()=> abrirModalEliminacion(mesas)}
                >
                  <i className="bi bi-trash"></i>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    )}
    
    </>
  );
}

export default TablaMesa;
