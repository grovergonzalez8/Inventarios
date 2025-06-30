const user = JSON.parse(localStorage.getItem("user"));
if (!user || user.rol !== "admin") {
  alert("Acceso restringido solo para administradores");
  window.location.href = "index.html";
}

import { FirebaseAdapter } from "../firebase/FirebaseAdapter.js";
import { InventarioService } from "../../../src/application/InventarioService.js";

const firebaseAdapter = new FirebaseAdapter();
const inventarioService = new InventarioService(firebaseAdapter);

const tablaBody = document.querySelector("#tabla-productos tbody");

async function cargarProductos() {
  const productos = await inventarioService.obtenerProductos();
  tablaBody.innerHTML = '';
  let index = 1;

  productos.forEach(producto => {
    const row = document.createElement('tr');

    row.innerHTML = `
      <td>${index++}</td>
      <td><input type="text" value="${producto.Codigo || ''}" class="editable-cell" data-field="Codigo"></td>
      <td><input type="text" value="${producto.Producto || ''}" class="editable-cell" data-field="Producto"></td>
      <td><input type="number" value="${producto.Stock || 0}" class="editable-cell" data-field="Stock"></td>
      <td><input type="text" value="${producto['Unidad Medida'] || ''}" class="editable-cell" data-field="Unidad Medida"></td>
      <td class="acciones-btns">
        <button class="btn-guardar">Guardar</button>
        <button class="btn-eliminar">Eliminar</button>
      </td>
    `;

    row.querySelector('.btn-guardar').addEventListener('click', async () => {
      const inputs = row.querySelectorAll('.editable-cell');
      const nuevoProducto = {};

      inputs.forEach(input => {
        const key = input.dataset.field;
        const value = key === 'Stock' ? parseInt(input.value) : input.value.trim();
        nuevoProducto[key] = value;
      });

      try {
        await inventarioService.actualizarProducto(producto.id, nuevoProducto);
        alert('Producto actualizado correctamente');
      } catch (err) {
        alert('Error al actualizar');
        console.error(err);
      }
    });

    row.querySelector('.btn-eliminar').addEventListener('click', async () => {
      if (confirm('¿Estás seguro de eliminar este producto?')) {
        try {
          await inventarioService.eliminarProducto(producto.id);
          row.remove();
          alert('Producto eliminado');
        } catch (err) {
          alert('Error al eliminar');
          console.error(err);
        }
      }
    });

    tablaBody.appendChild(row);
  });
}

cargarProductos();