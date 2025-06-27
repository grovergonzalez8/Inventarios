import { FirebaseAdapter } from "../firebase/FirebaseAdapter.js";
import { InventarioService } from "../../../src/application/InventarioService.js";

const firebaseAdapter = new FirebaseAdapter();
const inventarioService = new InventarioService(firebaseAdapter);

document.getElementById("form-ingresar").addEventListener("submit", async (e) => {
  e.preventDefault();
  const codigo = document.getElementById("codigo").value.trim();
  const producto = document.getElementById("producto").value.trim();
  const stock = parseInt(document.getElementById("stock").value);
  const unidadMedida = document.getElementById("unidadMedida").value.trim();

  if (!codigo || !producto || isNaN(stock) || !unidadMedida) {
    alert("Todos los campos son obligatorios.");
    return;
  }

  try {
    await inventarioService.ingresarProducto({
      Codigo: codigo,
      Producto: producto,
      Stock: stock,
      "Unidad Medida": unidadMedida
    });
    alert("Producto ingresado con éxito.");
    e.target.reset();
  } catch (error) {
    console.error("Error al ingresar producto:", error);
    alert("Error al ingresar producto.");
  }
});