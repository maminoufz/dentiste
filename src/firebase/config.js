import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

// ── Firebase config ────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyBht5La-Q-GpkMLkmc8xo5IIzHfE2KCay8",
  authDomain: "dentiste-b95e8.firebaseapp.com",
  projectId: "dentiste-b95e8",
  storageBucket: "dentiste-b95e8.firebasestorage.app",
  messagingSenderId: "180145904851",
  appId: "1:180145904851:web:b1ad1ab86030f9f6e6c826",
  measurementId: "G-1H0VCTKTP6",
};

const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const db = getFirestore(app);

// ── Collection references ──────────────────────────────────────────────────────
export const patientsCol = collection(db, "patients");
export const seancesCol  = collection(db, "seances");

// ── PATIENTS ───────────────────────────────────────────────────────────────────
export async function addPatient(data) {
  return await addDoc(patientsCol, {
    ...data,
    createdAt: Timestamp.now(),
  });
}

export async function updatePatient(id, data) {
  await updateDoc(doc(db, "patients", id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deletePatient(id) {
  await deleteDoc(doc(db, "patients", id));
}

// Real-time listener for patients
export function listenPatients(callback, onError) {
  const q = query(patientsCol, orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    const patients = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(patients);
  }, (error) => {
    console.error("Firebase listenPatients error:", error);
    if (onError) onError(error);
  });
}

// ── SEANCES ────────────────────────────────────────────────────────────────────
export async function addSeance(data) {
  return await addDoc(seancesCol, {
    ...data,
    createdAt: Timestamp.now(),
  });
}

export async function updateSeance(id, data) {
  await updateDoc(doc(db, "seances", id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteSeance(id) {
  await deleteDoc(doc(db, "seances", id));
}

// Real-time listener for seances
export function listenSeances(callback, onError) {
  const q = query(seancesCol, orderBy("date", "desc"));
  return onSnapshot(q, (snap) => {
    const seances = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(seances);
  }, (error) => {
    console.error("Firebase listenSeances error:", error);
    if (onError) onError(error);
  });
}
