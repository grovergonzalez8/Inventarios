import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA0pXFrvZpa6Mb9fgZb9PIPwIw7jPNRU6Q",
  authDomain: "inventario-posgrado.firebaseapp.com",
  projectId: "inventario-posgrado",
  storageBucket: "inventario-posgrado.appspot.com",
  messagingSenderId: "289529154853",
  appId: "1:289529154853:web:61b62ba3ab9b49cbe29ecc"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.getElementById("form-ingresar").addEventListener("submit", async (e) => {
  e.preventDefault();
  const Codigo = document.getElementById("Codigo").value.trim();
  const Producto = document.getElementById("Producto").value.trim();
  const Stock = parseInt(document.getElementById("Stock").value);
  const Unidad = document.getElementById("Unidad Medida").value.trim();

  if (!Codigo || !Producto || !Unidad || isNaN(Stock) || Stock <= 0) {
    alert("Completa todos los campos correctamente.");
    return;
  }

  try {
    const nuevoProducto = {
      Codigo: Codigo,
      Producto: Producto,
      Stock: Stock,
      "Unidad Medida": Unidad
    };

    console.log("Producto a ingresar:", nuevoProducto); 
    await addDoc(collection(db, "productos"), nuevoProducto);

    alert("Producto ingresado con éxito.");
    e.target.reset();
  } catch (error) {
    console.error("Error al ingresar producto:", error);
    alert("Error al ingresar producto.");
}

});
