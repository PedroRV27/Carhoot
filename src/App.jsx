import React, { useEffect, useState } from "react";
import { createCoches, deleteCoche, getCoches, updateCoche } from "./services/api";
import { auth, db } from "./services/firebase";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Container, Navbar, Button, Form, Table, Modal, Card, Row, Col, Alert } from 'react-bootstrap';
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
  const [fieldErrors, setFieldErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [cocheToDelete, setCocheToDelete] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userRef);

          if (!userDoc.exists()) {
            await signOut(auth);
            setUser(null);
            setIsAdmin(false);
            setError("No tienes permisos para acceder");
            return;
          }

          if (userDoc.data().role !== "admin") {
            await signOut(auth);
            setUser(null);
            setIsAdmin(false);
            setError("No tienes permisos de administrador");
            return;
          }

          setUser(user);
          setIsAdmin(true);
          showCoches();
        } catch (error) {
          console.error("Error verificando permisos:", error);
          await signOut(auth);
          setUser(null);
          setIsAdmin(false);
          setError("Error verificando permisos");
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const showCoches = async () => {
    try {
      const data = await getCoches();
      setCoches(data);
    } catch (error) {
      console.error("Error al obtener coches:", error);
      setError("Error al cargar los coches. Inténtalo de nuevo.");
    }
  };

  const handleLogin = async () => {
    const loginErrors = {};
    
    if (!email || email.trim() === "") {
      loginErrors.email = "El email es obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      loginErrors.email = "Por favor, introduce un email válido";
    }
    
    if (!password || password.trim() === "") {
      loginErrors.password = "La contraseña es obligatoria";
    }

    if (Object.keys(loginErrors).length > 0) {
      setFieldErrors(loginErrors);
      setError("Por favor, completa todos los campos correctamente");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setError("");
      setFieldErrors({});
    } catch (err) {
      setError("Credenciales incorrectas o problema de conexión");
      setFieldErrors({});
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setIsAdmin(false);
  };

  const handleYearChange = (value, isEditing = false) => {
    const numericValue = value.replace(/\D/g, '').slice(0, 4);
    
    if (isEditing) {
      setEditingData(prev => ({ ...prev, AnoFabricacion: numericValue }));
      if (fieldErrors.anoFabricacion) {
        setFieldErrors(prev => ({...prev, anoFabricacion: ""}));
      }
    } else {
      setAnoFabricacion(numericValue);
      if (fieldErrors.anoFabricacion) {
        setFieldErrors(prev => ({...prev, anoFabricacion: ""}));
      }
    }
  };

  const validateDate = (dateString) => {
    if (!dateString) return true;
    const selectedDate = new Date(dateString);
    return !isNaN(selectedDate.getTime());
  };

  const handleImageUpload = (e, isEditing = false) => {
    const files = Array.from(e.target.files);
    const currentImages = isEditing ? editingData.Imagenes.length : imagenes.length;
    
    if (currentImages + files.length > 5) {
      setError("Solo puedes subir hasta 5 imágenes por coche");
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
      setFieldErrors(prev => ({...prev, imagenes: ""}));
    });
  };

  const validateCarData = (carData) => {
    const errors = {};
    
    if (!carData.Marca || carData.Marca.trim().length < 2) {
      errors.marca = "La marca es obligatoria y debe tener al menos 2 caracteres";
    }
    
    if (!carData.Modelo || carData.Modelo.trim().length < 2) {
      errors.modelo = "El modelo es obligatorio y debe tener al menos 2 caracteres";
    }
    
    if (!carData.AnoFabricacion || carData.AnoFabricacion.length !== 4 || isNaN(carData.AnoFabricacion)) {
      errors.anoFabricacion = "El año de fabricación debe tener exactamente 4 dígitos";
    }
    
    if (carData.fechaProgramada && !validateDate(carData.fechaProgramada)) {
      errors.fechaProgramada = "La fecha seleccionada no es válida";
    }
    
    if (!carData.Imagenes || carData.Imagenes.length === 0) {
      errors.imagenes = "Debes subir al menos una imagen";
    } else if (carData.Imagenes.length > 5) {
      errors.imagenes = "No puedes subir más de 5 imágenes";
    }
    
    return errors;
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
    setError("");
    setFieldErrors({});
  };

  const handleDeleteClick = (coche) => {
    setCocheToDelete(coche);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (cocheToDelete) {
      try {
        await deleteCoche(cocheToDelete.id);
        showCoches();
        setShowDeleteModal(false);
        setCocheToDelete(null);
      } catch (error) {
        console.error("Error al eliminar coche:", error);
        setError("Error al eliminar el coche. Inténtalo de nuevo.");
      }
    }
  };

  const handleUpdate = async () => {
    const validationErrors = validateCarData(editingData);
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setError("Por favor, corrige los errores en el formulario");
      return;
    }

    try {
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
      setError("");
      setFieldErrors({});
    } catch (error) {
      console.error("Error al actualizar coche:", error);
      setError("Error al actualizar el coche. Inténtalo de nuevo.");
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

  // Función para ordenar los coches por fecha programada (desde hoy hacia adelante)
  const sortCochesByDate = (cochesList) => {
    const hoy = new Date().toISOString().split('T')[0];
    
    return [...cochesList].sort((a, b) => {
      // Si no tiene fecha programada, va al final
      if (!a.fechaProgramada) return 1;
      if (!b.fechaProgramada) return -1;
      
      // Si la fecha es anterior a hoy, va después de las futuras
      const aIsPast = a.fechaProgramada < hoy;
      const bIsPast = b.fechaProgramada < hoy;
      
      if (aIsPast && !bIsPast) return 1;
      if (!aIsPast && bIsPast) return -1;
      if (aIsPast && bIsPast) return new Date(b.fechaProgramada).getTime() - new Date(a.fechaProgramada).getTime();
      
      // Ordenar fechas futuras de más cercana a más lejana
      return new Date(a.fechaProgramada).getTime() - new Date(b.fechaProgramada).getTime();
    });
  };

  const filteredCoches = sortCochesByDate(
    coches.filter((coche) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        coche.Marca.toLowerCase().includes(searchLower) ||
        coche.Modelo.toLowerCase().includes(searchLower)
      );
    })
  );

  const clearErrors = () => {
    setError("");
    setFieldErrors({});
  };

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

      {error && <Alert variant="danger" onClose={() => setError("")} dismissible>{error}</Alert>}

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
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (fieldErrors.email) {
                          setFieldErrors(prev => ({...prev, email: ""}));
                        }
                      }}
                      required
                      isInvalid={!!fieldErrors.email}
                    />
                    <Form.Control.Feedback type="invalid">
                      {fieldErrors.email}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Control
                      type="password"
                      placeholder="Contraseña"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (fieldErrors.password) {
                          setFieldErrors(prev => ({...prev, password: ""}));
                        }
                      }}
                      required
                      isInvalid={!!fieldErrors.password}
                    />
                    <Form.Control.Feedback type="invalid">
                      {fieldErrors.password}
                    </Form.Control.Feedback>
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
              <Button onClick={() => { setShowAddModal(true); clearErrors(); }}>Añadir Coche</Button>
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

          <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title style={{ color: 'black' }}>Añadir Coche</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Marca *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Marca"
                    value={marca}
                    onChange={(e) => {
                      setMarca(e.target.value);
                      if (fieldErrors.marca) {
                        setFieldErrors(prev => ({...prev, marca: ""}));
                      }
                    }}
                    required
                    minLength={2}
                    maxLength={50}
                    isInvalid={!!fieldErrors.marca}
                  />
                  <Form.Control.Feedback type="invalid">
                    {fieldErrors.marca}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Modelo *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Modelo"
                    value={modelo}
                    onChange={(e) => {
                      setModelo(e.target.value);
                      if (fieldErrors.modelo) {
                        setFieldErrors(prev => ({...prev, modelo: ""}));
                      }
                    }}
                    required
                    minLength={2}
                    maxLength={50}
                    isInvalid={!!fieldErrors.modelo}
                  />
                  <Form.Control.Feedback type="invalid">
                    {fieldErrors.modelo}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Año de Fabricación * (4 dígitos)</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Año de Fabricación"
                    value={anoFabricacion}
                    onChange={(e) => handleYearChange(e.target.value)}
                    maxLength={4}
                    required
                    isInvalid={!!fieldErrors.anoFabricacion}
                  />
                  <Form.Control.Feedback type="invalid">
                    {fieldErrors.anoFabricacion}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    Introduce exactamente 4 dígitos (ej: 2020)
                  </Form.Text>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Fecha Programada</Form.Label>
                  <Form.Control
                    type="date"
                    value={fechaProgramada}
                    onChange={(e) => {
                      const dateValue = e.target.value;
                      setFechaProgramada(dateValue);
                      if (fieldErrors.fechaProgramada) {
                        setFieldErrors(prev => ({...prev, fechaProgramada: ""}));
                      }
                    }}
                    isInvalid={!!fieldErrors.fechaProgramada}
                  />
                  <Form.Control.Feedback type="invalid">
                    {fieldErrors.fechaProgramada}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Imágenes * (Máximo 5)</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleImageUpload(e)}
                    required={imagenes.length === 0}
                    isInvalid={!!fieldErrors.imagenes}
                  />
                  <Form.Control.Feedback type="invalid">
                    {fieldErrors.imagenes}
                  </Form.Control.Feedback>
                  <Form.Text>Imágenes seleccionadas: {imagenes.length}/5</Form.Text>
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="primary"
                onClick={async () => {
                  const newCar = { 
                    Marca: marca, 
                    Modelo: modelo, 
                    AnoFabricacion: anoFabricacion, 
                    Imagenes: imagenes, 
                    fechaProgramada 
                  };
                  
                  const validationErrors = validateCarData(newCar);
                  if (Object.keys(validationErrors).length > 0) {
                    setFieldErrors(validationErrors);
                    setError("Por favor, corrige los errores en el formulario");
                    return;
                  }

                  try {
                    await createCoches(newCar);
                    setMarca("");
                    setModelo("");
                    setAnoFabricacion("");
                    setFechaProgramada("");
                    setImagenes([]);
                    setShowAddModal(false);
                    showCoches();
                    clearErrors();
                  } catch (error) {
                    console.error("Error al crear coche:", error);
                    setError("Error al crear el coche. Inténtalo de nuevo.");
                  }
                }}
              >
                Guardar
              </Button>
            </Modal.Footer>
          </Modal>

          <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title style={{ color: 'black' }}>Editar Coche</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Marca *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Marca"
                    value={editingData.Marca}
                    onChange={(e) => {
                      setEditingData({ ...editingData, Marca: e.target.value });
                      if (fieldErrors.marca) {
                        setFieldErrors(prev => ({...prev, marca: ""}));
                      }
                    }}
                    required
                    minLength={2}
                    maxLength={50}
                    isInvalid={!!fieldErrors.marca}
                  />
                  <Form.Control.Feedback type="invalid">
                    {fieldErrors.marca}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Modelo *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Modelo"
                    value={editingData.Modelo}
                    onChange={(e) => {
                      setEditingData({ ...editingData, Modelo: e.target.value });
                      if (fieldErrors.modelo) {
                        setFieldErrors(prev => ({...prev, modelo: ""}));
                      }
                    }}
                    required
                    minLength={2}
                    maxLength={50}
                    isInvalid={!!fieldErrors.modelo}
                  />
                  <Form.Control.Feedback type="invalid">
                    {fieldErrors.modelo}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Año de Fabricación * (4 dígitos)</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Año de Fabricación"
                    value={editingData.AnoFabricacion}
                    onChange={(e) => handleYearChange(e.target.value, true)}
                    maxLength={4}
                    required
                    isInvalid={!!fieldErrors.anoFabricacion}
                  />
                  <Form.Control.Feedback type="invalid">
                    {fieldErrors.anoFabricacion}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    Introduce exactamente 4 dígitos (ej: 2020)
                  </Form.Text>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Fecha Programada</Form.Label>
                  <Form.Control
                    type="date"
                    value={editingData.fechaProgramada}
                    onChange={(e) => {
                      const dateValue = e.target.value;
                      setEditingData({ ...editingData, fechaProgramada: dateValue });
                      if (fieldErrors.fechaProgramada) {
                        setFieldErrors(prev => ({...prev, fechaProgramada: ""}));
                      }
                    }}
                    isInvalid={!!fieldErrors.fechaProgramada}
                  />
                  <Form.Control.Feedback type="invalid">
                    {fieldErrors.fechaProgramada}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Imágenes * (Máximo 5)</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleImageUpload(e, true)}
                    isInvalid={!!fieldErrors.imagenes}
                  />
                  <Form.Control.Feedback type="invalid">
                    {fieldErrors.imagenes}
                  </Form.Control.Feedback>
                  <Form.Text>Imágenes seleccionadas: {editingData.Imagenes.length}/5</Form.Text>
                </Form.Group>
                <Row>
                  {editingData.Imagenes.map((img, index) => (
                    <Col key={index} md={3} className="mb-2">
                      <Card.Img variant="top" src={img} alt={`Imagen ${index}`} className="car-image" />
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteImage(index)}
                        className="mt-1"
                      >
                        Eliminar
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

          <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title style={{ color: 'black' }}>Confirmar Eliminación</Modal.Title>
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