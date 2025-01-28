import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider,
    signInWithPopup, sendPasswordResetEmail, fetchSignInMethodsForEmail, sendEmailVerification, db, doc, getDoc,
    getDocs, collection, setDoc, updateDoc, deleteDoc, addDoc, query, where, onSnapshot } from "./firebase";

const collectionName = 'Coches';

// Ayuda a convertior los datos de firebase en array
const getArrayFromCollection = (collection) => {
    return collection.docs.map(doc => {
        return { ...doc.data(), id: doc.id };
    });
};

// Create
export const createCoches = async (obj) => {
    const colRef = collection(db, collectionName); 
    const data = await addDoc(colRef, obj);
    return data.id;
};

// Update
export const updateCoche = async (id, obj) => {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, obj);
};

// Read
export const getCoches = async () => {
    const colRef = collection(db, collectionName);
    const result = await getDocs(colRef);
    return getArrayFromCollection(result);
};

// Read with where
export const getCocheByCondition = async (value) => {
    const colRef = collection(db, collectionName);
    const result = await getDocs(query(colRef, where('age', '==', value)));
    return getArrayFromCollection(result);
};

// Delete
export const deleteCoche = async (id) => {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
};
