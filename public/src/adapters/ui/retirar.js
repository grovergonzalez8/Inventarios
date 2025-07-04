import { FirebaseAdapter } from "../firebase/FirebaseAdapter.js";
import { InventarioService } from "../../../src/application/InventarioService.js";
import { obtenerUsuarioSeguro, redirigirAlLogin, mostrarNotificacion } from "./auth.js";

const user = obtenerUsuarioSeguro();
if (!user) {
  mostrarNotificacion("Debes iniciar sesión para acceder a esta vista", true);
  redirigirAlLogin();
}

const firebaseAdapter = new FirebaseAdapter();
const inventarioService = new InventarioService(firebaseAdapter);

let productosGlobal = [];
const DEPARTAMENTOS = [
  "Direccion de Posgrado",
  "Secretaria Administrativa",
  "Secretaria Academica",
  "Desarrollo Tecnologico y Sistemas para la Educacion",
  "Coordinacion Academica",
  "Informatica",
  "Coordinacion Area Diplomados Doble Titulacion",
  "Soporte Academico y Caja Chica",
  "Recepcion e Informaciones",
  "Apoyo Logistico"
];

const UI = {
  tabla: document.querySelector("#tabla-inventario tbody"),
  filtroOrden: document.getElementById("orden-alfabetico"),
  filtroStock: document.getElementById("filtro-stock"),
  filtroBusqueda: document.getElementById("filtro-busqueda")
};

document.addEventListener("DOMContentLoaded", inicializar);

async function inicializar() {
  try {
    UI.filtroOrden.addEventListener("change", aplicarFiltros);
    UI.filtroStock.addEventListener("change", aplicarFiltros);
    UI.filtroBusqueda.addEventListener("input", aplicarFiltros);
    
    await cargarInventario();
  } catch (error) {
    console.error("Error al inicializar:", error);
    mostrarNotificacion("Error al cargar el inventario", true);
  }
}

async function cargarInventario() {
  try {
    productosGlobal = await inventarioService.obtenerProductos();
    aplicarFiltros();
  } catch (error) {
    console.error("Error al cargar inventario:", error);
    throw error;
  }
}

function aplicarFiltros() {
  try {
    const orden = UI.filtroOrden.value;
    const filtroStock = UI.filtroStock.value;
    const textoBusqueda = UI.filtroBusqueda.value.trim().toLowerCase();

    let productosFiltrados = filtrarPorStock(productosGlobal, filtroStock);
    productosFiltrados = filtrarPorBusqueda(productosFiltrados, textoBusqueda);
    productosFiltrados = ordenarProductos(productosFiltrados, orden);

    renderTabla(productosFiltrados);
  } catch (error) {
    console.error("Error al aplicar filtros:", error);
  }
}

function filtrarPorStock(productos, filtro) {
  return productos.filter(p => {
    const stock = p.Stock ?? 0;
    return filtro === "todos" ||
           (filtro === "con-stock" && stock > 0) ||
           (filtro === "sin-stock" && stock <= 0);
  });
}

function filtrarPorBusqueda(productos, texto) {
  if (!texto) return productos;
  
  return productos.filter(p => {
    const nombre = (p.Producto || "").toLowerCase();
    const codigo = (p.Codigo || "").toLowerCase();
    return nombre.includes(texto) || codigo.includes(texto);
  });
}

function ordenarProductos(productos, orden) {
  return [...productos].sort((a, b) => {
    const nombreA = (a.Producto || "").toLowerCase();
    const nombreB = (b.Producto || "").toLowerCase();
    return orden === "az" ? nombreA.localeCompare(nombreB) : 
           orden === "za" ? nombreB.localeCompare(nombreA) : 0;
  });
}

function renderTabla(productos) {
  UI.tabla.innerHTML = productos.map((producto, index) => {
    const stockActual = producto.Stock ?? 0;
    const tieneStock = stockActual > 0;
    
    return `
      <tr data-id="${producto.id}">
        <td>${index + 1}</td>
        <td>${producto.Codigo || '-'}</td>
        <td>${producto.Producto || '-'}</td>
        <td>${stockActual}</td>
        <td>${producto["Unidad Medida"] || '-'}</td>
        <td>
          <input type="number" 
                 min="1" 
                 max="${stockActual}" 
                 value="1" 
                 class="cantidad-pedir" 
                 ${!tieneStock ? 'disabled' : ''}>
        </td>
        <td><input type="text" class="nombre-solicitante" ${!tieneStock ? 'disabled' : ''}></td>
        <td>
          <select class="departamento-destino" ${!tieneStock ? 'disabled' : ''}>
            <option value="">Seleccione</option>
            ${DEPARTAMENTOS.map(depto => `<option>${depto}</option>`).join('')}
          </select>
        </td>
        <td>
          <button class="btn-solicitar" ${!tieneStock ? 'disabled' : ''}>
            ${tieneStock ? 'Solicitar' : 'Sin stock'}
          </button>
        </td>
      </tr>
    `;
  }).join('');

  UI.tabla.addEventListener("click", manejarClickSolicitar);
}

async function manejarClickSolicitar(event) {
  const btn = event.target.closest(".btn-solicitar");
  if (!btn || btn.disabled) return;

  const fila = btn.closest("tr");
  try {
    const solicitud = obtenerDatosSolicitud(fila);
    validarSolicitud(solicitud);
    
    await inventarioService.retirarProducto(solicitud);
    mostrarNotificacion("Solicitud enviada con éxito");
    await cargarInventario();
  } catch (error) {
    console.error("Error en solicitud:", error);
    mostrarNotificacion(`${error.message}`, true);
  }
}

function obtenerDatosSolicitud(fila) {
  const productoId = fila.dataset.id;
  const producto = productosGlobal.find(p => p.id === productoId);
  
  return {
    codigo_producto: producto.Codigo || "",
    producto: producto.Producto || "",
    cantidad: parseInt(fila.querySelector(".cantidad-pedir").value),
    unidad_medida: producto["Unidad Medida"] || "",
    nombre_solicitante: fila.querySelector(".nombre-solicitante").value.trim(),
    departamento_destino: fila.querySelector(".departamento-destino").value.trim(),
    fecha: new Date().toISOString(),
    usuario: obtenerUsuarioSeguro()?.username || "Anónimo"
  };
}

function validarSolicitud(solicitud) {
  const errores = [];
  
  if (!solicitud.nombre_solicitante) {
    errores.push("El nombre del solicitante es requerido");
  }
  
  if (!solicitud.departamento_destino) {
    errores.push("Debe seleccionar un departamento");
  }
  
  if (isNaN(solicitud.cantidad)) {
    errores.push("La cantidad debe ser un número válido");
  } else if (solicitud.cantidad <= 0) {
    errores.push("La cantidad debe ser mayor a cero");
  }
  
  if (errores.length > 0) {
    throw new Error(errores.join(". "));
  }
}