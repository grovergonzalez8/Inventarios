import { FirebaseAdapter } from "../firebase/FirebaseAdapter.js";
import { SolicitudesService } from "../../../src/application/SolicitudesService.js";

const firebaseAdapter = new FirebaseAdapter();
const solicitudesService = new SolicitudesService(firebaseAdapter);

const tablaBody = document.querySelector("#tabla-solicitudes tbody");

function formatearFecha(fechaStr) {
  const fecha = new Date(fechaStr);
  return fecha.toLocaleDateString("es-BO", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

async function cargarSolicitudes() {
  try {
    const solicitudes = await solicitudesService.obtenerSolicitudes();
    tablaBody.innerHTML = "";
    let index = 1;

    solicitudes.forEach(s => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${index++}</td>
        <td>${s.codigo_producto || "—"}</td>
        <td>${s.departamento_destino || "—"}</td>
        <td>${s.nombre_solicitante || "—"}</td>
        <td>${s.cantidad ?? 0}</td>
        <td>${s.fecha ? formatearFecha(s.fecha) : "—"}</td>
      `;

      tablaBody.appendChild(row);
    });

  } catch (err) {
    console.error("Error al cargar solicitudes:", err);
    alert("Error al cargar las solicitudes.");
  }
}

cargarSolicitudes();

document.getElementById("btnExcel").addEventListener("click", exportarExcel);
document.getElementById("btnPDF").addEventListener("click", exportarPDF);
document.getElementById("btnPrint").addEventListener("click", () => window.print());

function exportarExcel() {
  import("https://cdn.sheetjs.com/xlsx-latest/package/xlsx.mjs").then(XLSX => {
    const tabla = document.getElementById("tabla-solicitudes");

    const tablaVisible = tabla.cloneNode(true);
    const originalRows = tabla.querySelectorAll("tbody tr");
    const nuevoBody = document.createElement("tbody");

    originalRows.forEach(row => nuevoBody.appendChild(row.cloneNode(true)));

    tablaVisible.querySelector("tbody").replaceWith(nuevoBody);

    const wb = XLSX.utils.table_to_book(tablaVisible, { sheet: "Solicitudes" });
    XLSX.writeFile(wb, "reporte_solicitudes.xlsx");
  });
}

function exportarPDF() {
  import("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js").then(jsPDFModule => {
    const { jsPDF } = jsPDFModule;

    import("https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.25/jspdf.plugin.autotable.min.js").then(() => {
      const doc = new jsPDF();
      doc.autoTable({ html: "#tabla-solicitudes" });
      doc.save("reporte_solicitudes.pdf");
    });
  });
}