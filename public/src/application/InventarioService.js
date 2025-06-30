export class InventarioService {
  constructor(productoRepository) {
    this.productoRepository = productoRepository;
  }

  async ingresarProducto(productoData) {
    return this.productoRepository.guardarProducto(productoData);
  }

  async obtenerProductos() {
    return this.productoRepository.obtenerProductos();
  }

  async retirarProducto(producto, cantidad, nombreSolicitante, departamentoDestino) {
    if (producto.Stock < cantidad) {
      throw new Error("Stock insuficiente");
    }

    const nuevoStock = producto.Stock - cantidad;

    await this.productoRepository.actualizarStock(producto.Codigo, nuevoStock);

    const solicitud = {
      codigo_producto: producto.Codigo,
      cantidad,
      nombre_solicitante: nombreSolicitante,
      departamento_destino: departamentoDestino,
      fecha: new Date().toISOString(),
    };

    await this.productoRepository.crearSolicitud(solicitud);
  }

  async actualizarProducto(id, data) {
    return this.productoRepository.actualizarProductoPorId(id, data);
  }

  async eliminarProducto(id) {
    return this.productoRepository.eliminarProductoPorId(id);
  }

  async obtenerProductos() {
    return this.productoRepository.obtenerProductosConId(); 
  }
}