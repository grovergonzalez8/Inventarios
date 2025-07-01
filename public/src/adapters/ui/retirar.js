const user = JSON.parse(localStorage.getItem("user"));
if (!user) {
  window.location.href = "login.html";
}

import { FirebaseAdapter } from "../firebase/FirebaseAdapter.js";
import { InventarioService } from "../../../src/application/InventarioService.js";

const firebaseAdapter = new FirebaseAdapter();
const inventarioService = new InventarioService(firebaseAdapter);

let productosGlobal = [];

async function cargarInventario() {
  productosGlobal = await inventarioService.obtenerProductos();
  aplicarFiltros();
}

function aplicarFiltros() {
  const orden = document.getElementById("orden-alfabetico").value;
  const filtroStock = document.getElementById("filtro-stock").value;
  const textoBusqueda = document.getElementById("filtro-busqueda").value.trim().toLowerCase();

  let productosFiltrados = [...productosGlobal];

  if (filtroStock === "con-stock") {
    productosFiltrados = productosFiltrados.filter(p => (p.Stock ?? 0) > 0);
  } else if (filtroStock === "sin-stock") {
    productosFiltrados = productosFiltrados.filter(p => (p.Stock ?? 0) <= 0);
  }

  if (textoBusqueda !== "") {
    productosFiltrados = productosFiltrados.filter(p => {
      const nombre = (p.Producto || "").toLowerCase();
      const codigo = (p.Codigo || "").toLowerCase();
      return nombre.includes(textoBusqueda) || codigo.includes(textoBusqueda);
    });
  }

  productosFiltrados.sort((a, b) => {
    const nombreA = (a.Producto || "").toLowerCase();
    const nombreB = (b.Producto || "").toLowerCase();

    if (orden === "az") return nombreA.localeCompare(nombreB);
    if (orden === "za") return nombreB.localeCompare(nombreA);
    return 0;
  });

  renderTabla(productosFiltrados);
}

function renderTabla(productos) {
  const tabla = document.querySelector("#tabla-inventario tbody");
  tabla.innerHTML = "";
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
      <td>
        <select class="departamento-destino">
          <option value="">Seleccione</option>
          <option>Direccion de Posgrado</option>
          <option>Secretaria Administrativa</option>
          <option>Secretaria Academica</option>
          <option>Desarrollo Tecnologico y Sistemas para la Educacion</option>
          <option>Coordinacion Academica</option>
          <option>Informatica</option>
          <option>Coordinacion Area Diplomados Doble Titulacion</option>
          <option>Soporte Academico y Caja Chica</option>
          <option>Recepcion e Informaciones</option>
          <option>Apoyo Logistico</option>
        </select>
      </td>
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
          const datosSolicitud = {
            codigo_producto: producto.Codigo || "",
            producto: producto.Producto || "",
            cantidad: cantidad,
            unidad_medida: producto["Unidad Medida"] || "",
            nombre_solicitante: nombreSolicitante,
            departamento_destino: departamentoDestino,
            fecha: new Date().toISOString()
          };

          await inventarioService.retirarProducto(datosSolicitud);
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

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("orden-alfabetico").addEventListener("change", aplicarFiltros);
  document.getElementById("filtro-stock").addEventListener("change", aplicarFiltros);
  document.getElementById("filtro-busqueda").addEventListener("input", aplicarFiltros);
});

cargarInventario();