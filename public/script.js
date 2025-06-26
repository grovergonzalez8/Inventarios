const bienvenida = document.getElementById("bienvenida");
    const texto = "Bienvenido al Sistema de Inventario";
    let i = 0;

    function escribir() {
      if (i < texto.length) {
        bienvenida.textContent += texto.charAt(i);
        i++;
        setTimeout(escribir, 60);
      }
    }

    bienvenida.textContent = "";
    escribir();