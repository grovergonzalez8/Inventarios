import { FirebaseAdapter } from "../firebase/FirebaseAdapter.js";
import { InventarioService } from "../../../src/application/InventarioService.js";

const firebaseAdapter = new FirebaseAdapter();
const inventarioService = new InventarioService(firebaseAdapter);

async function cargarInventario() {
  const tabla = document.querySelector("#tabla-inventario tbody");
  tabla.innerHTML = "";
  const productos = await inventarioService.obtenerProductos();
  let i = 1;

  productos.forEach(producto => {
    const tr = document.createElement("tr");
    const stockActual = producto.Stock ?? 0;
    const botonDeshabilitado = stockActual <= 0 ? "disabled" : "";
    const textoBoton = botonDeshabilitado ? "Sin stock" : "Solicitar";

    tr.innerHTML = `
      <td>${i++}</td>
      <td>${producto.Codigo || '-'}</td>
      <td>${producto.Producto || '-'}</td>
      <td>${stockActual}</td>
      <td>${producto["Unidad Medida"] || '-'}</td>
      <td><input type="number" min="1" max="${stockActual}" value="1" class="cantidad-pedir" ${botonDeshabilitado} /></td>
      <td><input type="text" class="nombre-solicitante" /></td>
      <td><input type="text" class="departamento-destino" /></td>
      <td><button class="btn-solicitar" ${botonDeshabilitado}>${textoBoton}</button></td>
    `;

    tabla.appendChild(tr);

    if (!botonDeshabilitado) {
      tr.querySelector(".btn-solicitar").addEventListener("click", async () => {
        const cantidad = parseInt(tr.querySelector(".cantidad-pedir").value);
        const nombreSolicitante = tr.querySelector(".nombre-solicitante").value.trim();
        const departamentoDestino = tr.querySelector(".departamento-destino").value.trim();

        if (!nombreSolicitante || !departamentoDestino) {
          alert("Por favor complete todos los campos.");
          return;
        }
        if (isNaN(cantidad) || cantidad <= 0 || cantidad > stockActual) {
          alert("Cantidad inválida.");
          return;
        }

        try {
          await inventarioService.retirarProducto(producto, cantidad, nombreSolicitante, departamentoDestino);
          alert("¡Solicitud enviada con éxito!");
          cargarInventario();
        } catch (error) {
          console.error("Error al enviar solicitud:", error);
          alert("Error al enviar solicitud.");
        }
      });
    }
  });
}

cargarInventario();