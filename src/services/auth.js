import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

// Verificar si el usuario es administrador
export async function checkAdminRole() {
  const auth = getAuth();
  const db = getFirestore();

  // Obtener usuario actual
  const user = auth.currentUser;
  if (!user) {
    console.error("No hay usuario autenticado.");
    return false;
  }

  // Consultar el rol en Firestore
  const userDoc = await getDoc(doc(db, "users", user.uid));
  if (userDoc.exists()) {
    const role = userDoc.data().role;
    return role === "admin";
  } else {
    console.error("El documento del usuario no existe.");
    return false;
  }
}