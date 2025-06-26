const firebaseConfig = {
  apiKey: "AIzaSyA0pXFrvZpa6Mb9fgZb9PIPwIw7jPNRU6Q",
  authDomain: "inventario-posgrado.firebaseapp.com",
  projectId: "inventario-posgrado",
  storageBucket: "inventario-posgrado.appspot.com",
  messagingSenderId: "289529154853",
  appId: "1:289529154853:web:61b62ba3ab9b49cbe29ecc"
};

// Inicializar Firebase y Firestore
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

async function cargarInventario() {
  const tabla = document.querySelector("#tabla-inventario tbody");
  tabla.innerHTML = "";

  const snapshot = await db.collection("productos").get();
  let i = 1;

  snapshot.forEach(docSnap => {
    const producto = docSnap.data();

    const tr = document.createElement("tr");
    const stockActual = producto.Stock ?? 0;
    const botonDeshabilitado = stockActual <= 0 ? "disabled" : "";
    const textoBoton = botonDeshabilitado ? "Sin stock" : "Solicitar";

    tr.innerHTML = `
      <td><b>${i++}</b></td>
      <td><b>${producto.Codigo || '-'}</b></td>
      <td><b>${producto.Producto || '-'}</b></td>
      <td><b>${stockActual}</b></td>
      <td><b>${producto["Unidad Medida"] || '-'}</b></td>
      <td><input type="number" min="1" max="${stockActual}" value="1" class="cantidad-pedir" ${botonDeshabilitado}/></td>
      <td><input type="text" class="nombre-solicitante" /></td>
      <td><input type="text" class="departamento-destino" /></td>
      <td><button class="btn-solicitar" ${botonDeshabilitado ? "disabled" : ""}>${textoBoton}</button></td>
    `;

    tabla.appendChild(tr);

    tr.querySelector(".btn-solicitar").addEventListener("click", async () => {
      const cantidad = parseInt(tr.querySelector(".cantidad-pedir").value);
      const nombreSolicitante = tr.querySelector(".nombre-solicitante").value.trim();
      const departamentoDestino = tr.querySelector(".departamento-destino").value.trim();

      if (!nombreSolicitante || !departamentoDestino) {
        alert("Por favor complete todos los campos.");
        return;
      }

      if (isNaN(cantidad) || cantidad <= 0 || cantidad > producto.Stock) {
        alert("Cantidad inválida.");
        return;
      }

      try {
        // Registrar solicitud
        await db.collection("solicitudes").add({
          codigo_producto: producto.Codigo,
          cantidad,
          nombre_solicitante: nombreSolicitante,
          departamento_destino: departamentoDestino,
          fecha: new Date().toISOString()
        });

        // Actualizar stock
        await db.collection("productos").doc(docSnap.id).update({
          Stock: producto.Stock - cantidad
        });

        alert("¡Solicitud enviada con éxito!");
        cargarInventario();
      } catch (error) {
        console.error("Error al registrar la solicitud:", error);
        alert("Error al registrar la solicitud.");
      }
    });
  });
}

cargarInventario();