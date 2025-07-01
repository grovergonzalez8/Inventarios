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

  async retirarProducto(datosSolicitud) {
    // Obtener el producto completo para verificar el stock
    const producto = await this.productoRepository.obtenerProductoPorCodigo(datosSolicitud.codigo_producto);
    
    if (!producto) {
      throw new Error("Producto no encontrado");
    }

    if (producto.Stock < datosSolicitud.cantidad) {
      throw new Error("Stock insuficiente");
    }

    // Actualizar el stock
    const nuevoStock = producto.Stock - datosSolicitud.cantidad;
    await this.productoRepository.actualizarStock(producto.Codigo, nuevoStock);

    const solicitudCompleta = {
      codigo_producto: producto.Codigo,
      producto: producto.Producto, // Nombre completo del producto
      descripcion: producto.Descripcion || producto.Producto, // Usar descripción si existe
      cantidad: datosSolicitud.cantidad,
      unidad_medida: producto["Unidad Medida"] || "UNIDAD", // Campo de tu base de datos
      nombre_solicitante: datosSolicitud.nombre_solicitante,
      departamento_destino: datosSolicitud.departamento_destino,
      fecha: new Date().toISOString()
    };

    await this.productoRepository.crearSolicitud(solicitudCompleta);
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

  async obtenerProductoPorCodigo(codigo) {
    const productos = await this.productoRepository.obtenerProductos();
    return productos.find(p => p.Codigo === codigo);
  }
}