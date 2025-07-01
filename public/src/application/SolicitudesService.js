export class SolicitudesService {
  constructor(adapter) {
    this.adapter = adapter;
  }

  async obtenerSolicitudes() {
    return await this.adapter.obtenerSolicitudesConId();
  }
}