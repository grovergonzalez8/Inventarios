import { FirebaseAdapter } from "../firebase/FirebaseAdapter.js";
import { InventarioService } from "../../../src/application/InventarioService.js";
import { obtenerUsuarioSeguro, redirigirAlLogin, tienePermiso, mostrarNotificacion } from "./auth.js";

const user = obtenerUsuarioSeguro();
if (!user || !tienePermiso('admin')) {
  mostrarNotificacion("Acceso restringido solo para administradores", true);
  setTimeout(() => redirigirAlLogin(), 2000);
}

const firebaseAdapter = new FirebaseAdapter();
const inventarioService = new InventarioService(firebaseAdapter);

const UI = {
  form: document.getElementById("form-ingresar"),
  codigo: document.getElementById("codigo"),
  producto: document.getElementById("producto"),
  stock: document.getElementById("stock"),
  unidadMedida: document.getElementById("unidadMedida"),
  btnLimpiar: document.getElementById("btn-limpiar")
};

function inicializar() {
  UI.form.addEventListener("submit", handleSubmit);
  UI.btnLimpiar?.addEventListener("click", limpiarFormulario);
  UI.codigo.addEventListener("input", validarCodigo);
  UI.producto.addEventListener("input", validarProducto);
  UI.stock.addEventListener("input", validarStock);
}

async function handleSubmit(e) {
  e.preventDefault();
  
  if (!validarFormulario()) {
    return;
  }

  const producto = {
    Codigo: UI.codigo.value.trim(),
    Producto: UI.producto.value.trim(),
    Stock: parseInt(UI.stock.value),
    "Unidad Medida": UI.unidadMedida.value.trim()
  };

  try {
    await inventarioService.ingresarProducto(producto);
    mostrarNotificacion("Producto ingresado con éxito");
    limpiarFormulario();
  } catch (error) {
    console.error("Error al ingresar producto:", error);
    mostrarNotificacion("Error al ingresar producto", true);
  }
}

function validarFormulario() {
  let valido = true;
  
  if (!validarCodigo()) valido = false;
  if (!validarProducto()) valido = false;
  if (!validarStock()) valido = false;
  if (!UI.unidadMedida.value.trim()) {
    mostrarError(UI.unidadMedida, "La unidad de medida es requerida");
    valido = false;
  }

  return valido;
}

function validarCodigo() {
  const valor = UI.codigo.value.trim();
  if (!valor) {
    mostrarError(UI.codigo, "El código es requerido");
    return false;
  }
  if (valor.length < 3) {
    mostrarError(UI.codigo, "Mínimo 3 caracteres");
    return false;
  }
  limpiarError(UI.codigo);
  return true;
}

function validarProducto() {
  const valor = UI.producto.value.trim();
  if (!valor) {
    mostrarError(UI.producto, "El producto es requerido");
    return false;
  }
  if (valor.length < 5) {
    mostrarError(UI.producto, "Mínimo 5 caracteres");
    return false;
  }
  limpiarError(UI.producto);
  return true;
}

function validarStock() {
  const valor = parseInt(UI.stock.value);
  if (isNaN(valor)) {
    mostrarError(UI.stock, "El stock debe ser un número");
    return false;
  }
  if (valor < 0) {
    mostrarError(UI.stock, "El stock no puede ser negativo");
    return false;
  }
  if (valor > 10000) {
    mostrarError(UI.stock, "El stock no puede ser mayor a 10,000");
    return false;
  }
  limpiarError(UI.stock);
  return true;
}

function mostrarError(campo, mensaje) {
  limpiarError(campo);
  campo.classList.add("error");
  const errorElement = document.createElement("small");
  errorElement.className = "error-message";
  errorElement.textContent = mensaje;
  campo.insertAdjacentElement("afterend", errorElement);
}

function limpiarError(campo) {
  campo.classList.remove("error");
  const errorElement = campo.nextElementSibling;
  if (errorElement && errorElement.classList.contains("error-message")) {
    errorElement.remove();
  }
}

function limpiarFormulario() {
  UI.form.reset();
  document.querySelectorAll(".error-message").forEach(el => el.remove());
  document.querySelectorAll(".error").forEach(el => el.classList.remove("error"));
}

document.addEventListener("DOMContentLoaded", inicializar);