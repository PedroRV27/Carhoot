import React, { useEffect, useState } from "react";
import { createCoches, deleteCoche, getCoches, updateCoche } from "./services/api";
import { auth, db } from "./services/firebase";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Container, Navbar, Button, Form, Table, Modal, Card, Row, Col } from 'react-bootstrap';
import './App.css';

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

  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [cocheToDelete, setCocheToDelete] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists() && userDoc.data().role === "admin") {
          setUser(user);
          setIsAdmin(true);
          showCoches();
        } else {
          setUser(null);
          setIsAdmin(false);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const showCoches = async () => {
    const data = await getCoches();
    setCoches(data);
  };

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setError("");
    } catch (err) {
      setError("Credenciales incorrectas");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setIsAdmin(false);
  };

  const handleImageUpload = (e, isEditing = false) => {
    const files = Array.from(e.target.files);
    if ((isEditing ? editingData.Imagenes.length + files.length : imagenes.length + files.length) > 5) {
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
    setShowEditModal(true);
  };

  const handleDeleteClick = (coche) => {
    setCocheToDelete(coche);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (cocheToDelete) {
      await deleteCoche(cocheToDelete.id);
      showCoches();
      setShowDeleteModal(false);
      setCocheToDelete(null);
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
      setShowEditModal(false);
      showCoches();
    }
  };

  const handleDeleteImage = (index) => {
    setEditingData((prev) => ({
      ...prev,
      Imagenes: prev.Imagenes.filter((_, i) => i !== index),
    }));
  };

  const getVehiculoDelDia = () => {
    const hoy = new Date().toISOString().split("T")[0];
    return coches.find((coche) => coche.fechaProgramada === hoy);
  };

  const vehiculoDelDia = getVehiculoDelDia();

  const filteredCoches = coches.filter((coche) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      coche.Marca.toLowerCase().includes(searchLower) ||
      coche.Modelo.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Container>
      <Navbar bg="white" variant="white" className="mb-4">
        <Navbar.Brand>Gestión de Coches</Navbar.Brand>
        {user && (
          <Button variant="outline-dark" onClick={handleLogout}>
            Cerrar sesión
          </Button>
        )}
      </Navbar>

      {!user ? (
        <Row className="justify-content-center">
          <Col md={6}>
            <Card>
              <Card.Body>
                <h2>Iniciar sesión</h2>
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Control
                      type="email"
                      placeholder="Correo"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Control
                      type="password"
                      placeholder="Contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </Form.Group>
                  <Button onClick={handleLogin}>Iniciar sesión</Button>
                  {error && <p className="text-danger mt-2">{error}</p>}
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      ) : isAdmin ? (
        <>
          <h2>Panel de Administración</h2>

          <Row className="mb-4">
            <Col>
              <Form.Control
                type="text"
                placeholder="Buscar por marca o modelo"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Col>
            <Col>
              <Button onClick={() => setShowAddModal(true)}>Añadir Coche</Button>
            </Col>
          </Row>

          {vehiculoDelDia && (
            <Card className="mb-4">
              <Card.Body>
                <Card.Title>Vehículo del Día</Card.Title>
                <Card.Text>
                  {vehiculoDelDia.Marca} {vehiculoDelDia.Modelo} ({vehiculoDelDia.AnoFabricacion})
                </Card.Text>
                <Row>
                  {vehiculoDelDia.Imagenes?.map((img, index) => (
                    <Col key={index} md={3}>
                      <Card.Img variant="top" src={img} alt={`Coche ${index}`} className="car-image" />
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
          )}

          {/* Tabla para pantallas grandes (oculta en moviles) */}
          <div className="d-none d-md-block">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Marca</th>
                  <th>Modelo</th>
                  <th>Año</th>
                  <th>Fecha Programada</th>
                  <th>Imágenes</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredCoches.map((coche) => (
                  <tr key={coche.id}>
                    <td>{coche.Marca}</td>
                    <td>{coche.Modelo}</td>
                    <td>{coche.AnoFabricacion}</td>
                    <td>{coche.fechaProgramada}</td>
                    <td>
                      <Row>
                        {coche.Imagenes?.map((img, index) => (
                          <Col key={index} md={3}>
                            <Card.Img variant="top" src={img} alt={`Coche ${index}`} className="car-image" />
                          </Col>
                        ))}
                      </Row>
                    </td>
                    <td>
                      <Button variant="warning" onClick={() => handleEdit(coche.id, coche)}>Editar</Button>{' '}
                      <Button variant="danger" onClick={() => handleDeleteClick(coche)}>Eliminar</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          {/* Tarjetas para moviles (ocultas en pantallas grandes) */}
          <div className="d-block d-md-none">
            {filteredCoches.map((coche) => (
              <Card key={coche.id} className="mb-4">
                <Card.Body>
                  <Card.Title>{coche.Marca} {coche.Modelo}</Card.Title>
                  <Card.Text>
                    <strong>Año:</strong> {coche.AnoFabricacion}<br />
                    <strong>Fecha Programada:</strong> {coche.fechaProgramada}
                  </Card.Text>
                  <Row>
                    {coche.Imagenes?.map((img, index) => (
                      <Col key={index} xs={6} md={3}>
                        <Card.Img variant="top" src={img} alt={`Coche ${index}`} className="car-image" />
                      </Col>
                    ))}
                  </Row>
                  <div className="mt-3">
                    <Button variant="warning" onClick={() => handleEdit(coche.id, coche)}>Editar</Button>{' '}
                    <Button variant="danger" onClick={() => handleDeleteClick(coche)}>Eliminar</Button>
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>

          {/* Modal para añadir coche */}
          <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Añadir Coche</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Control
                    type="text"
                    placeholder="Marca"
                    value={marca}
                    onChange={(e) => setMarca(e.target.value)}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Control
                    type="text"
                    placeholder="Modelo"
                    value={modelo}
                    onChange={(e) => setModelo(e.target.value)}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Control
                    type="number"
                    placeholder="Año de Fabricación"
                    value={anoFabricacion}
                    onChange={(e) => setAnoFabricacion(e.target.value)}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Control
                    type="date"
                    value={fechaProgramada}
                    onChange={(e) => setFechaProgramada(e.target.value)}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Control
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleImageUpload(e)}
                  />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="primary"
                onClick={async () => {
                  await createCoches({ Marca: marca, Modelo: modelo, AnoFabricacion: anoFabricacion, Imagenes: imagenes, fechaProgramada });
                  setMarca(""); setModelo(""); setAnoFabricacion(""); setFechaProgramada(""); setImagenes([]);
                  setShowAddModal(false);
                  showCoches();
                }}
              >
                Guardar
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Modal para editar coche */}
          <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Editar Coche</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Control
                    type="text"
                    placeholder="Marca"
                    value={editingData.Marca}
                    onChange={(e) => setEditingData({ ...editingData, Marca: e.target.value })}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Control
                    type="text"
                    placeholder="Modelo"
                    value={editingData.Modelo}
                    onChange={(e) => setEditingData({ ...editingData, Modelo: e.target.value })}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Control
                    type="number"
                    placeholder="Año de Fabricación"
                    value={editingData.AnoFabricacion}
                    onChange={(e) => setEditingData({ ...editingData, AnoFabricacion: e.target.value })}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Control
                    type="date"
                    value={editingData.fechaProgramada}
                    onChange={(e) => setEditingData({ ...editingData, fechaProgramada: e.target.value })}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Control
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleImageUpload(e, true)}
                  />
                </Form.Group>
                <Row>
                  {editingData.Imagenes.map((img, index) => (
                    <Col key={index} md={3}>
                      <Card.Img variant="top" src={img} alt={`Imagen ${index}`} className="car-image" />
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteImage(index)}
                      >
                        X
                      </Button>
                    </Col>
                  ))}
                </Row>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="primary" onClick={handleUpdate}>
                Guardar
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Modal de confirmación para eliminar */}
          <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Confirmar Eliminación</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              ¿Estás seguro de que deseas eliminar el coche {cocheToDelete?.Marca} {cocheToDelete?.Modelo}?
              Esta acción no se puede deshacer.
            </Modal.Body>
            <Modal.Footer>
              <Button variant="danger" onClick={confirmDelete}>
                Eliminar
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      ) : (
        <p>No tienes permiso para acceder a esta sección.</p>
      )}
    </Container>
  );
};

export default App;