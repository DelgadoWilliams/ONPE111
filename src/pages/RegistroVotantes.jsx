import { useState } from 'react';
import { UserPlus, Save, X, Search, Calendar, MapPin, Phone, Mail, IdCard } from 'lucide-react';

const RegistroVotantes = () => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    dni: '',
    nombre: '',
    apellidos: '',
    edad: '',
    fechaNacimiento: '',
    distrito: '',
    direccion: '',
    telefono: '',
    email: '',
    estado: 'Activo'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Datos del formulario:', formData);
    // Aquí iría la lógica para guardar
    setShowForm(false);
    // Resetear formulario
    setFormData({
      dni: '',
      nombre: '',
      apellidos: '',
      edad: '',
      fechaNacimiento: '',
      distrito: '',
      direccion: '',
      telefono: '',
      email: '',
      estado: 'Activo'
    });
  };

  const registrosRecientes = [
    { id: 1, dni: '12345678', nombre: 'Juan Pérez González', distrito: 'Lima', fecha: '2024-10-20', estado: 'Activo' },
    { id: 2, dni: '87654321', nombre: 'María García López', distrito: 'Callao', fecha: '2024-10-19', estado: 'Activo' },
    { id: 3, dni: '45678912', nombre: 'Carlos Rodríguez', distrito: 'Arequipa', fecha: '2024-10-19', estado: 'Pendiente' },
    { id: 4, dni: '78912345', nombre: 'Ana Martínez Silva', distrito: 'Cusco', fecha: '2024-10-18', estado: 'Activo' },
    { id: 5, dni: '32165498', nombre: 'Pedro Sánchez Torres', distrito: 'Lima', fecha: '2024-10-18', estado: 'Activo' },
  ];

  const distritos = [
    'Lima', 'Callao', 'Arequipa', 'Cusco', 'Trujillo', 'Chiclayo', 
    'Piura', 'Iquitos', 'Huancayo', 'Tacna', 'Ayacucho', 'Puno'
  ];

  return (
    <div className="space-y-6">
      {/* Header con Botón de Nuevo Registro */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-xl shadow-lg text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Registro de Votantes</h2>
            <p className="text-sm opacity-90">Sistema de inscripción y gestión electoral</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            <UserPlus size={20} />
            Nuevo Registro
          </button>
        </div>
      </div>

      {/* Estadísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Registros Hoy</p>
          <p className="text-3xl font-bold text-indigo-600">247</p>
          <p className="text-xs text-green-600 mt-1">+18% vs ayer</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Esta Semana</p>
          <p className="text-3xl font-bold text-purple-600">1,834</p>
          <p className="text-xs text-green-600 mt-1">+12% vs sem. anterior</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Este Mes</p>
          <p className="text-3xl font-bold text-pink-600">8,456</p>
          <p className="text-xs text-green-600 mt-1">+25% vs mes anterior</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Total Activos</p>
          <p className="text-3xl font-bold text-green-600">125,430</p>
          <p className="text-xs text-gray-600 mt-1">Base de datos</p>
        </div>
      </div>

      {/* Formulario de Registro (Modal) */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header del Modal */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Nuevo Registro de Votante</h3>
                <p className="text-sm text-gray-600 mt-1">Complete todos los campos requeridos</p>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} className="text-gray-600" />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-6">
                {/* Información Personal */}
                <div>
                  <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <IdCard size={20} className="text-indigo-600" />
                    Información Personal
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        DNI <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="dni"
                        value={formData.dni}
                        onChange={handleInputChange}
                        maxLength="8"
                        placeholder="12345678"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Edad <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="edad"
                        value={formData.edad}
                        onChange={handleInputChange}
                        min="18"
                        max="120"
                        placeholder="25"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombres <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleInputChange}
                        placeholder="Juan Carlos"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Apellidos <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="apellidos"
                        value={formData.apellidos}
                        onChange={handleInputChange}
                        placeholder="Pérez González"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Calendar size={16} />
                        Fecha de Nacimiento <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="fechaNacimiento"
                        value={formData.fechaNacimiento}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estado <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="estado"
                        value={formData.estado}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      >
                        <option value="Activo">Activo</option>
                        <option value="Pendiente">Pendiente</option>
                        <option value="Inactivo">Inactivo</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Información de Ubicación */}
                <div>
                  <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <MapPin size={20} className="text-indigo-600" />
                    Ubicación
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Distrito <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="distrito"
                        value={formData.distrito}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      >
                        <option value="">Seleccione un distrito</option>
                        {distritos.map((distrito) => (
                          <option key={distrito} value={distrito}>
                            {distrito}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dirección
                      </label>
                      <input
                        type="text"
                        name="direccion"
                        value={formData.direccion}
                        onChange={handleInputChange}
                        placeholder="Av. Principal 123"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Información de Contacto */}
                <div>
                  <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Phone size={20} className="text-indigo-600" />
                    Contacto
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Phone size={16} />
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleInputChange}
                        placeholder="987654321"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Mail size={16} />
                        Correo Electrónico
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="correo@ejemplo.com"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Nota Informativa */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Nota:</strong> Los campos marcados con <span className="text-red-500">*</span> son obligatorios. 
                    Asegúrese de verificar toda la información antes de guardar.
                  </p>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <Save size={20} />
                  Guardar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Búsqueda Rápida */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Búsqueda de Votantes</h3>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por DNI, nombre o distrito..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
            Buscar
          </button>
        </div>
      </div>

      {/* Registros Recientes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-800">Registros Recientes</h3>
          <p className="text-sm text-gray-600">Últimos votantes registrados en el sistema</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">DNI</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Nombre Completo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Distrito</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Fecha Registro</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {registrosRecientes.map((registro) => (
                <tr key={registro.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">{registro.dni}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{registro.nombre}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{registro.distrito}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{registro.fecha}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      registro.estado === 'Activo' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {registro.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                      Ver Detalles
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Mostrando 5 de 125,430 registros
          </p>
          <button className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors text-sm font-medium">
            Ver Todos los Registros →
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegistroVotantes;