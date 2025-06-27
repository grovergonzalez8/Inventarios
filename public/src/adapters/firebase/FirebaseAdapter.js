import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, query, where, updateDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

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
    return await addDoc(collection(this.db, "solicitudes"), solicitud);
  }
}

export { FirebaseAdapter };