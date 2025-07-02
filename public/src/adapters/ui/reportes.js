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
        <td>${s.producto || "—"}</td>
        <td>${s.departamento_destino || "—"}</td>
        <td>${s.nombre_solicitante || "—"}</td>
        <td>${s.cantidad ?? 0}</td>
        <td>${s.unidad_medida || "—"}</td>
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
document.getElementById("btnPrint").addEventListener("click", imprimirVista);

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
  import("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js").then(() => {
    const { jsPDF } = window.jspdf;

    import("https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.25/jspdf.plugin.autotable.min.js").then(() => {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const fechaActual = new Date().toLocaleString("es-BO");

      // HEADER SUPERIOR
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text("Universidad Mayor de San Simón", 40, 40);
      doc.setFont("helvetica", "normal");
      doc.text("Unidad Sub Almacén Posgrado Derecho", 40, 58);

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Nota de Salida", pageWidth / 2, 50, { align: "center" });

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(`Fecha: ${fechaActual}`, pageWidth - 40, 40, { align: "right" });
      doc.text("Página 1", pageWidth - 40, 58, { align: "right" });

      // DATOS ENCABEZADO DESDE LA TABLA
        const primerFila = document.querySelector("#tabla-solicitudes tbody tr");
        let solicitante = "—";
        let departamento = "—";
        let fechaSolicitud = "—";

        if (primerFila) {
        const celdas = primerFila.querySelectorAll("td");
        solicitante = celdas[4]?.textContent.trim() || "—";
        departamento = celdas[3]?.textContent.trim() || "—";
        fechaSolicitud = celdas[7]?.textContent.trim() || "—";
        }

        doc.text(`Solicitante: ${solicitante}`, 40, 100);
        doc.text(`Departamento destino: ${departamento}`, 40, 115);
        doc.text(`Fecha de solicitud: ${fechaSolicitud}`, pageWidth - 40, 100, { align: "right" });


      // TABLA
      const tableHeaders = [["Nro.", "Código del Producto", "Producto", "Unidad Medida", "Cantidad"]];
      const tableRows = [];

      const filas = document.querySelectorAll("#tabla-solicitudes tbody tr");
      filas.forEach((tr, index) => {
        const celdas = tr.querySelectorAll("td");
        tableRows.push([
          index + 1,
          celdas[1]?.textContent.trim() || "",
          celdas[2]?.textContent.trim() || "",
          celdas[6]?.textContent.trim() || "",
          celdas[5]?.textContent.trim() || "",
        ]);
      });

      doc.autoTable({
        head: tableHeaders,
        body: tableRows,
        startY: 140,
        styles: { fontSize: 8 },
        headStyles: {
          fillColor: [88, 143, 202],
          textColor: 255,
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [240, 240, 240],
        },
        margin: { left: 40, right: 40 },
      });

      // FIRMA
      const yFinal = doc.lastAutoTable.finalY + 200;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.line(pageWidth / 2 - 60, yFinal - 10, pageWidth / 2 + 60, yFinal - 10); // línea para firma
      doc.text("Recibí Conforme", pageWidth / 2, yFinal, { align: "center" });
      doc.text("SOLICITANTE", pageWidth / 2, yFinal + 20, { align: "center" });

      // FOOTER
      doc.setDrawColor(0);
      doc.line(40, 780, pageWidth - 40, 780);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text("Sistema de Almacenes", pageWidth / 2, 795, { align: "center" });

      doc.save("nota_salida.pdf");
    });
  });
}

function imprimirVista() {
  const primerFila = document.querySelector("#tabla-solicitudes tbody tr");
  if (!primerFila) return alert("No hay datos para imprimir.");

  const celdas = primerFila.querySelectorAll("td");
  const solicitante = celdas[4]?.textContent.trim() || "—";
  const departamento = celdas[3]?.textContent.trim() || "—";
  const fechaSolicitud = celdas[7]?.textContent.trim() || "—";
  const fechaImpresion = new Date().toLocaleString("es-BO");

  const filas = document.querySelectorAll("#tabla-solicitudes tbody tr");
  let tablaHtml = "";

  filas.forEach((tr, index) => {
    const td = tr.querySelectorAll("td");
    tablaHtml += `
      <tr>
        <td>${index + 1}</td>
        <td>${td[1]?.textContent.trim()}</td>
        <td>${td[2]?.textContent.trim()}</td>
        <td>${td[6]?.textContent.trim()}</td>
        <td>${td[5]?.textContent.trim()}</td>
      </tr>
    `;
  });

  const ventana = window.open("", "_blank");
  ventana.document.write(`
    <html>
    <head>
      <title>Nota de Salida</title>
      <style>
        body {
          font-family: Helvetica, sans-serif;
          font-size: 10pt;
          padding: 40px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th, td {
          border: 1px solid #000;
          padding: 5px;
        }
        th {
          background-color: #588FCA;
          color: black;
        }
        .header, .footer {
          display: flex;
          justify-content: space-between;
        }
        h2 {
          text-align: center;
          margin: 20px 0;
        }
        .firma {
          text-align: center;
          margin-top: 100px;
        }
        .firma div {
          margin-top: 10px;
        }
        .linea-footer {
          position: fixed;
          bottom: 40px;
          left: 40px;
          rigth: 40px;
          font-size: 10pt;
          margin-top: 40px;
          border-top: 1px solid black;
          text-align: center;
          padding-top: 5px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <strong>Universidad Mayor de San Simón</strong><br>
          Unidad Sub Almacén Posgrado Derecho
        </div>
        <div style="text-align: right;">
          Fecha: ${fechaImpresion}<br>
          Página 1
        </div>
      </div>

      <h2>Nota de Salida</h2>

      <div class="header">
        <div>
          Solicitante: ${solicitante}<br>
          Departamento destino: ${departamento}
        </div>
        <div style="text-align: right;">
          Fecha de solicitud: ${fechaSolicitud}
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Nro.</th>
            <th>Código del Producto</th>
            <th>Producto</th>
            <th>Unidad Medida</th>
            <th>Cantidad</th>
          </tr>
        </thead>
        <tbody>
          ${tablaHtml}
        </tbody>
      </table>

      <div class="firma">
        <div style="border-top: 1px solid #000; width: 200px; margin: 0 auto;"></div>
        <div>Recibí Conforme</div>
        <div>SOLICITANTE</div>
      </div>

      <div class="linea-footer">
        Sistema de Almacenes
      </div>
    </body>
    </html>
  `);

  ventana.document.close();
  ventana.focus();
  ventana.print();
}