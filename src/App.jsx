import { useEffect, useState } from "react";
import { createCoches, deleteCoche, getCoches, updateCoche } from "./services/api";

const App = () => {
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [anoFabricacion, setAnoFabricacion] = useState("");
  const [fechaProgramada, setFechaProgramada] = useState("");
  const [imagenes, setImagenes] = useState([]);
  const [coches, setCoches] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState({
    Marca: "",
    Modelo: "",
    AnoFabricacion: "",
    Imagenes: [],
    fechaProgramada: "",
  });

  useEffect(() => {
    showCoches();
  }, []);

  const showCoches = async () => {
    const data = await getCoches();
    setCoches(data);
  };

  const handleImageUpload = (e, isEditing = false) => {
    const files = Array.from(e.target.files);

    if (
      (isEditing
        ? editingData.Imagenes.length + files.length
        : imagenes.length + files.length) > 5
    ) {
      alert("Solo puedes subir hasta 5 imágenes por coche.");
      return;
    }

    const readers = files.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then((base64Images) => {
      if (isEditing) {
        setEditingData((prev) => ({
          ...prev,
          Imagenes: [...prev.Imagenes, ...base64Images],
        }));
      } else {
        setImagenes((prev) => [...prev, ...base64Images]);
      }
    });
  };

  const handleEdit = (id, coche) => {
    setEditingId(id);
    setEditingData({
      Marca: coche.Marca,
      Modelo: coche.Modelo,
      AnoFabricacion: coche.AnoFabricacion,
      Imagenes: coche.Imagenes || [],
      fechaProgramada: coche.fechaProgramada || "",
    });
  };

  const handleRemoveImage = (index, isEditing = false) => {
    if (isEditing) {
      setEditingData((prev) => ({
        ...prev,
        Imagenes: prev.Imagenes.filter((_, i) => i !== index),
      }));
    } else {
      setImagenes((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleUpdate = async () => {
    if (editingId) {
      await updateCoche(editingId, editingData);
      setEditingId(null);
      setEditingData({
        Marca: "",
        Modelo: "",
        AnoFabricacion: "",
        Imagenes: [],
        fechaProgramada: "",
      });
      showCoches();
    }
  };

  const getVehiculoDelDia = () => {
    const hoy = new Date().toISOString().split("T")[0];
    return coches.find((coche) => coche.fechaProgramada === hoy);
  };

  const vehiculoDelDia = getVehiculoDelDia();

  return (
    <div style={{ padding: "20px" }}>
      <h1>Gestión de Coches</h1>

      {/* Formulario para insertar nuevo coche */}
      <div>
        <input
          type="text"
          placeholder="Marca"
          value={marca}
          onChange={(e) => setMarca(e.target.value)}
        />
        <input
          type="text"
          placeholder="Modelo"
          value={modelo}
          onChange={(e) => setModelo(e.target.value)}
        />
        <input
          type="number"
          placeholder="Año de Fabricación"
          value={anoFabricacion}
          onChange={(e) => setAnoFabricacion(e.target.value)}
        />
        <input
          type="date"
          value={fechaProgramada}
          onChange={(e) => setFechaProgramada(e.target.value)}
        />
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleImageUpload(e)}
        />
        <div style={{ marginTop: "10px" }}>
          {imagenes.map((img, index) => (
            <div key={index} style={{ display: "inline-block", marginRight: "10px" }}>
              <img
                src={img}
                alt={`Imagen ${index + 1}`}
                style={{ width: "100px", height: "auto" }}
              />
              <button onClick={() => handleRemoveImage(index)}>Eliminar</button>
            </div>
          ))}
        </div>
        <button
          onClick={async () => {
            if (imagenes.length > 5) {
              alert("Solo puedes subir hasta 5 imágenes por coche.");
              return;
            }

            await createCoches({
              Marca: marca,
              Modelo: modelo,
              AnoFabricacion: anoFabricacion,
              Imagenes: imagenes,
              fechaProgramada,
            });

            setMarca("");
            setModelo("");
            setAnoFabricacion("");
            setFechaProgramada("");
            setImagenes([]);
            showCoches();
          }}
        >
          Insertar Coche
        </button>
      </div>

      {/* Vehículo del día */}
      <div style={{ marginTop: "20px" }}>
        <h2>Vehículo del Día</h2>
        {vehiculoDelDia ? (
          <div>
            <p>
              <strong>Marca:</strong> {vehiculoDelDia.Marca}
            </p>
            <p>
              <strong>Modelo:</strong> {vehiculoDelDia.Modelo}
            </p>
            <p>
              <strong>Año:</strong> {vehiculoDelDia.AnoFabricacion}
            </p>
            <div>
              {vehiculoDelDia.Imagenes.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Vehículo del día ${index + 1}`}
                  style={{ width: "100px", height: "auto", marginRight: "10px" }}
                />
              ))}
            </div>
          </div>
        ) : (
          <p>No hay vehículo programado para hoy.</p>
        )}
      </div>

      {/* Tabla para mostrar y gestionar los coches */}
      <table style={{ marginTop: "20px", width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Marca</th>
            <th>Modelo</th>
            <th>Año</th>
            <th>Fecha Programada</th>
            <th>Imágenes</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {coches.map((coche) => (
            <tr key={coche.id}>
              <td>{coche.id}</td>
              <td>{editingId === coche.id ? (
                <input
                  type="text"
                  value={editingData.Marca}
                  onChange={(e) =>
                    setEditingData((prev) => ({ ...prev, Marca: e.target.value }))
                  }
                />
              ) : (
                coche.Marca
              )}</td>
              <td>{editingId === coche.id ? (
                <input
                  type="text"
                  value={editingData.Modelo}
                  onChange={(e) =>
                    setEditingData((prev) => ({ ...prev, Modelo: e.target.value }))
                  }
                />
              ) : (
                coche.Modelo
              )}</td>
              <td>{editingId === coche.id ? (
                <input
                  type="number"
                  value={editingData.AnoFabricacion}
                  onChange={(e) =>
                    setEditingData((prev) => ({ ...prev, AnoFabricacion: e.target.value }))
                  }
                />
              ) : (
                coche.AnoFabricacion
              )}</td>
              <td>{editingId === coche.id ? (
                <input
                  type="date"
                  value={editingData.fechaProgramada}
                  onChange={(e) =>
                    setEditingData((prev) => ({ ...prev, fechaProgramada: e.target.value }))
                  }
                />
              ) : (
                coche.fechaProgramada
              )}</td>
              <td>{editingId === coche.id ? (
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleImageUpload(e, true)}
                  />
                  {editingData.Imagenes.map((img, index) => (
                    <div key={index}>
                      <img src={img} alt="" style={{ width: "100px" }} />
                      <button onClick={() => handleRemoveImage(index, true)}>X</button>
                    </div>
                  ))}
                </div>
              ) : (
                coche.Imagenes?.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`Imagen ${index + 1}`}
                    style={{ width: "100px", height: "auto", marginRight: "10px" }}
                  />
                ))
              )}</td>
              <td>
                {editingId === coche.id ? (
                  <>
                    <button onClick={handleUpdate}>Guardar</button>
                    <button onClick={() => setEditingId(null)}>Cancelar</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleEdit(coche.id, coche)}>Editar</button>
                    <button
                      onClick={async () => {
                        await deleteCoche(coche.id);
                        showCoches();
                      }}
                    >
                      Borrar
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default App;
