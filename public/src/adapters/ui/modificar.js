import { FirebaseAdapter } from "../firebase/FirebaseAdapter.js";
import { InventarioService } from "../../../src/application/InventarioService.js";
import { obtenerUsuarioSeguro, redirigirAlLogin, tienePermiso } from "./auth.js";

const user = obtenerUsuarioSeguro();
if (!user || !tienePermiso('admin')) {
  mostrarNotificacion("Acceso restringido a administradores", true);
  setTimeout(() => redirigirAlLogin(), 2000);
}

const firebaseAdapter = new FirebaseAdapter();
const inventarioService = new InventarioService(firebaseAdapter);

const UI = {
  tabla: document.querySelector("#tabla-productos tbody"),
  busqueda: document.getElementById("filtro-busqueda"),
  orden: document.getElementById("orden-alfabetico"),
  stock: document.getElementById("filtro-stock"),
  btnAgregar: document.getElementById("btn-agregar"),
  modal: document.getElementById("modal-agregar"),
  formAgregar: document.getElementById("form-agregar")
};

let productosGlobal = [];

UI.busqueda.addEventListener("input", aplicarFiltros);
UI.orden.addEventListener("change", aplicarFiltros);
UI.stock.addEventListener("change", aplicarFiltros);
UI.btnAgregar?.addEventListener("click", () => UI.modal.style.display = "block");
UI.formAgregar?.addEventListener("submit", agregarProducto);

cargarProductos();

async function cargarProductos() {
    try {
        productosGlobal = await inventarioService.obtenerProductos();
        aplicarFiltros();
    } catch (error) {
        console.error("Error al cargar productos:", error);
        alert("Error al cargar el inventario");
    }
}

function aplicarFiltros() {
    const busqueda = UI.busqueda.value.toLowerCase();
    const orden = UI.orden.value;
    const stock = UI.stock.value;

    let filtrados = productosGlobal.filter(p => {
        const coincideBusqueda = 
            (p.Producto || "").toLowerCase().includes(busqueda) || 
            (p.Codigo || "").toLowerCase().includes(busqueda);
        
        const tieneStock = (p.Stock ?? 0) > 0;
        const pasaFiltroStock = 
            stock === "todos" ||
            (stock === "con-stock" && tieneStock) ||
            (stock === "sin-stock" && !tieneStock);

        return coincideBusqueda && pasaFiltroStock;
    });

    filtrados.sort((a, b) => {
        const nombreA = (a.Producto || "").toLowerCase();
        const nombreB = (b.Producto || "").toLowerCase();
        return orden === "az" ? nombreA.localeCompare(nombreB) : 
               orden === "za" ? nombreB.localeCompare(nombreA) : 0;
    });

    renderTabla(filtrados);
}

function renderTabla(productos) {
    UI.tabla.innerHTML = productos.map((producto, index) => `
        <tr>
            <td>${index + 1}</td>
            <td><input type="text" value="${producto.Codigo || ''}" data-field="Codigo"></td>
            <td><input type="text" value="${producto.Producto || ''}" data-field="Producto"></td>
            <td><input type="number" value="${producto.Stock || 0}" data-field="Stock"></td>
            <td><input type="text" value="${producto['Unidad Medida'] || ''}" data-field="Unidad Medida"></td>
            <td class="acciones">
                <button class="btn-guardar" data-id="${producto.id}">💾</button>
                <button class="btn-eliminar" data-id="${producto.id}">🗑️</button>
            </td>
        </tr>
    `).join('');

    UI.tabla.addEventListener("click", async (e) => {
        const btn = e.target.closest("button");
        if (!btn) return;

        const id = btn.dataset.id;
        const row = btn.closest("tr");
        
        if (btn.classList.contains("btn-guardar")) {
            await guardarCambios(id, row);
        } 
        else if (btn.classList.contains("btn-eliminar")) {
            await eliminarProducto(id, row);
        }
    });
}

async function guardarCambios(id, row) {
    const nuevoProducto = {
        Codigo: row.querySelector('[data-field="Codigo"]').value.trim(),
        Producto: row.querySelector('[data-field="Producto"]').value.trim(),
        Stock: parseInt(row.querySelector('[data-field="Stock"]').value),
        'Unidad Medida': row.querySelector('[data-field="Unidad Medida"]').value.trim()
    };

    try {
        await inventarioService.actualizarProducto(id, nuevoProducto);
        mostrarNotificacion("✅ Producto actualizado");
    } catch (error) {
        console.error("Error al actualizar:", error);
        mostrarNotificacion("Error al actualizar", true);
    }
}

async function eliminarProducto(id, row) {
    if (!confirm("¿Confirmar eliminación?")) return;
    
    try {
        await inventarioService.eliminarProducto(id);
        row.remove();
        mostrarNotificacion("🗑️ Producto eliminado");
    } catch (error) {
        console.error("Error al eliminar:", error);
        mostrarNotificacion("Error al eliminar", true);
    }
}

async function agregarProducto(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const nuevoProducto = {
        Codigo: formData.get("codigo").trim(),
        Producto: formData.get("producto").trim(),
        Stock: parseInt(formData.get("stock")),
        'Unidad Medida': formData.get("unidadMedida").trim()
    };

    try {
        await inventarioService.ingresarProducto(nuevoProducto);
        UI.modal.style.display = "none";
        e.target.reset();
        mostrarNotificacion("✨ Producto agregado");
        cargarProductos();
    } catch (error) {
        console.error("Error al agregar:", error);
        mostrarNotificacion("Error al agregar", true);
    }
}

function mostrarNotificacion(mensaje, esError = false) {
    const notificacion = document.createElement("div");
    notificacion.className = `notificacion ${esError ? 'error' : 'exito'}`;
    notificacion.textContent = mensaje;
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
        notificacion.classList.add("mostrar");
        setTimeout(() => {
            notificacion.classList.remove("mostrar");
            setTimeout(() => notificacion.remove(), 300);
        }, 3000);
    }, 100);
}