import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, query, where, updateDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA0pXFrvZpa6Mb9fgZb9PIPwIw7jPNRU6Q",
  authDomain: "inventario-posgrado.firebaseapp.com",
  projectId: "inventario-posgrado",
  storageBucket: "inventario-posgrado.appspot.com",
  messagingSenderId: "289529154853",
  appId: "1:289529154853:web:61b62ba3ab9b49cbe29ecc"
};

class FirebaseAdapter {
  constructor() {
    const app = initializeApp(firebaseConfig);
    this.db = getFirestore(app);
  }

  getDB() {
    return this.db;
  }

  async obtenerProductos() {
    const snapshot = await getDocs(collection(this.db, "productos"));
    return snapshot.docs.map(doc => doc.data());
  }

  async guardarProducto(productoData) {
    return await addDoc(collection(this.db, "productos"), productoData);
  }

  async actualizarStock(codigo, nuevoStock) {
    const productosRef = collection(this.db, "productos");
    const consulta = query(productosRef, where("Codigo", "==", codigo));
    const snapshot = await getDocs(consulta);

    if (!snapshot.empty) {
      const docRef = snapshot.docs[0].ref;
      await updateDoc(docRef, { Stock: nuevoStock });
    } else {
      throw new Error(`No se encontró producto con código: ${codigo}`);
    }
  }

  async crearSolicitud(solicitud) {
    return await addDoc(collection(this.db, "solicitudes"), {
      codigo_producto: solicitud.codigo_producto,
      producto: solicitud.producto,
      cantidad: solicitud.cantidad,
      unidad_medida: solicitud.unidad_medida || "UNIDAD",
      nombre_solicitante: solicitud.nombre_solicitante,
      departamento_destino: solicitud.departamento_destino,
      fecha: new Date().toISOString(),
    });
  }

  async actualizarProductoPorId(id, data) {
    const docRef = doc(this.db, "productos", id);
    await updateDoc(docRef, data);
  }

  async eliminarProductoPorId(id) {
    const docRef = doc(this.db, "productos", id);
    await deleteDoc(docRef);
  }

  async obtenerProductosConId() {
    const snapshot = await getDocs(collection(this.db, "productos"));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async obtenerSolicitudesConId() {
    const snapshot = await getDocs(collection(this.db, "solicitudes"));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async obtenerProductoPorCodigo(codigo) {
    const productosRef = collection(this.db, "productos");
    const consulta = query(productosRef, where("Codigo", "==", codigo));
    const snapshot = await getDocs(consulta);

    if (!snapshot.empty) {
      return snapshot.docs[0].data();
    }
    return null;
  }

  async obtenerSolicitudesPorFecha(inicio, fin) {
    const solicitudesRef = collection(this.db, "solicitudes");
    const consulta = query(
      solicitudesRef,
      where("fecha", ">=", inicio),
      where("fecha", "<=", fin)
    );
    const snapshot = await getDocs(consulta);
    return snapshot.docs.map(doc => doc.data());
  }
}

export { FirebaseAdapter };