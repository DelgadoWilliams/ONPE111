// src/pages/LimpiezaDatos.jsx
import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Zap, RefreshCw, Database, Search, ChevronLeft, ChevronRight, Copy, MinusCircle, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const LimpiezaDatos = () => {
  const [completedSteps, setCompletedSteps] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentProcessingStep, setCurrentProcessingStep] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Datasets
  const [batches, setBatches] = useState([]);
  const [batchSeleccionado, setBatchSeleccionado] = useState(null);
  const [cargandoBatches, setCargandoBatches] = useState(true);
  const [datosTabla, setDatosTabla] = useState([]);
  const [cargandoDatos, setCargandoDatos] = useState(false);

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 10;

  // Estadísticas (se calculan al cargar el batch)
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    duplicados: 0,
    errores: 0,
    validos: 0,
    scoreCalidad: 0
  });

  useEffect(() => {
    cargarBatches();
  }, []);

  useEffect(() => {
    if (batchSeleccionado) {
      cargarDatosBatch();
    } else {
      setDatosTabla([]);
      setEstadisticas({ total: 0, duplicados: 0, errores: 0, validos: 0, scoreCalidad: 0 });
      setCompletedSteps([]);
      setPaginaActual(1);
    }
  }, [batchSeleccionado]);

  const cargarBatches = async () => {
    setCargandoBatches(true);
    try {
      const response = await axios.get(`${API_URL}/api/upload/batches/list`);
      if (response.data.success) {
        const pendientes = response.data.batches.filter(b => b.estado !== 'procesado');
        setBatches(pendientes);
        if (pendientes.length > 0 && !batchSeleccionado) {
          setBatchSeleccionado(pendientes[0]);
        }
      }
    } catch (error) {
      console.error('Error cargando batches:', error);
    } finally {
      setCargandoBatches(false);
    }
  };

  const cargarDatosBatch = async () => {
    if (!batchSeleccionado) return;

    setCargandoDatos(true);
    try {
      const response = await axios.get(
        `${API_URL}/api/upload/batch/${batchSeleccionado.batch_id}/data/${batchSeleccionado.tipo_eleccion}`
      );

      if (response.data.success && response.data.data) {
        const data = response.data.data;
        setDatosTabla(data);

        // Cálculo eficiente de duplicados
        const dniMap = {};
        data.forEach(row => {
          if (row.dni) dniMap[row.dni] = (dniMap[row.dni] || 0) + 1;
        });
        const duplicadosCount = data.filter(row => row.dni && dniMap[row.dni] > 1).length;
        const erroresCount = data.filter(row => !row.dni || !row.nombre_completo || !row.candidato_nombre).length;
        const total = data.length;
        const validos = total - duplicadosCount - erroresCount;

        setEstadisticas({
          total,
          duplicados: duplicadosCount,
          errores: erroresCount,
          validos,
          scoreCalidad: total > 0 ? Math.round((validos / total) * 100) : 0
        });

        // Marcar "Analizar datos" como completado automáticamente
        if (!completedSteps.includes(1)) {
          setCompletedSteps([1]);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      alert('No se pudieron cargar los datos del batch');
    } finally {
      setCargandoDatos(false);
    }
  };

  // Acciones de limpieza conectadas al backend
  const handleCleaningAction = async (actionId) => {
    if (isProcessing || !batchSeleccionado) return;

    setIsProcessing(true);
    setCurrentProcessingStep(actionId);

    try {
      let endpoint = '';
      let method = 'post';
      let payload = {};

      if (actionId === 2) {
        // Quitar duplicados
        endpoint = `${API_URL}/api/upload/batch/${batchSeleccionado.batch_id}/remove-duplicates`;
      } else if (actionId === 3) {
        // Limpiar nulos
        endpoint = `${API_URL}/api/upload/batch/${batchSeleccionado.batch_id}/clean-nulls`;
      } else if (actionId === 4) {
        // Normalizar
        endpoint = `${API_URL}/api/upload/batch/${batchSeleccionado.batch_id}/normalize`;
      } else {
        // Analizar datos (ya se hace al cargar)
        setCompletedSteps(prev => [...prev, actionId]);
        setIsProcessing(false);
        setCurrentProcessingStep(null);
        return;
      }

      const response = await axios[method](endpoint, payload);

      if (response.data.success) {
        setCompletedSteps(prev => [...prev, actionId]);
        // Recargar datos después de limpiar
        await cargarDatosBatch();
      } else {
        alert(response.data.message || 'Error en la limpieza de datos');
      }
    } catch (error) {
      alert('Error en la limpieza: ' + (error.response?.data?.detail || error.message));
    } finally {
      setIsProcessing(false);
      setCurrentProcessingStep(null);
    }
  };

  const enviarATablaFinal = async (replaceAll = false) => {
  if (!batchSeleccionado) return;
  
  const modoTexto = replaceAll ? 'REEMPLAZAR TODOS' : 'AGREGAR SIN DUPLICAR';
  const confirmMsg = replaceAll 
    ? '⚠️ ADVERTENCIA: Esto BORRARÁ todos los votos existentes y los reemplazará con los datos limpios. ¿Estás seguro?' 
    : '¿Agregar los datos limpios a la tabla final (sin borrar nada)?';
  
  if (!confirm(confirmMsg)) return;
  
  setIsProcessing(true);
  
  try {
    const endpoint = replaceAll 
      ? `/api/upload/batch/${batchSeleccionado.batch_id}/move-to-final-replace`
      : `/api/upload/batch/${batchSeleccionado.batch_id}/move-to-final-append`;
    
    const response = await axios.post(`${API_URL}${endpoint}`);
    
    if (response.data.success) {
      alert(`✅ ¡Listo! ${response.data.estadisticas.votos_registrados} votos registrados en modo: ${modoTexto}`);
      cargarBatches();
      setBatchSeleccionado(null);
    }
  } catch (error) {
    alert('Error: ' + (error.response?.data?.detail || error.message));
  } finally {
    setIsProcessing(false);
  }
};

  // Filtrado
  const datosFiltrados = datosTabla.filter(row =>
    Object.values(row).some(val =>
      val && String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const inicio = (paginaActual - 1) * registrosPorPagina;
  const actuales = datosFiltrados.slice(inicio, inicio + registrosPorPagina);
  const totalPaginas = Math.ceil(datosFiltrados.length / registrosPorPagina);

  const getStatusBadge = (row) => {
    const base = "px-2 py-1 text-xs font-medium rounded-full";
    const esDuplicado = row.dni && datosTabla.filter(r => r.dni === row.dni).length > 1;
    if (esDuplicado) return <span className={`${base} bg-red-100 text-red-800`}>Duplicado</span>;
    if (!row.dni || !row.nombre_completo || !row.candidato_nombre)
      return <span className={`${base} bg-yellow-100 text-yellow-800`}>Incompleto</span>;
    return <span className={`${base} bg-green-100 text-green-800`}>Válido</span>;
  };

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Selector de Batch */}
      <motion.div className="bg-white p-6 rounded-xl shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Database className="text-indigo-600" size={28} />
            <div>
              <h3 className="text-xl font-bold">Dataset a Limpiar</h3>
              <p className="text-sm text-gray-600">Selecciona un batch pendiente</p>
            </div>
          </div>
          <button onClick={cargarBatches} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            <RefreshCw size={16} /> Actualizar
          </button>
        </div>

        {cargandoBatches ? (
          <div className="text-center py-8"><RefreshCw className="animate-spin mx-auto" size={32} /></div>
        ) : batches.length === 0 ? (
          <p className="text-center py-8 text-gray-500">No hay batches pendientes</p>
        ) : (
          <select
            value={batchSeleccionado?.batch_id || ''}
            onChange={(e) => setBatchSeleccionado(batches.find(b => b.batch_id === e.target.value) || null)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">-- Seleccionar batch --</option>
            {batches.map(b => (
              <option key={b.batch_id} value={b.batch_id}>
                {b.detalles?.archivo_nombre || 'Sin nombre'} - {b.tipo_eleccion.toUpperCase()} ({b.total_registros} reg)
              </option>
            ))}
          </select>
        )}
      </motion.div>

      {/* Estadísticas - AHORA SIEMPRE VISIBLES */}
      {batchSeleccionado && estadisticas.total > 0 && (
        <motion.div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-bold mb-4">Resumen de Calidad de Datos</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-blue-50 p-5 rounded-xl border border-blue-200 text-center">
              <p className="text-xs text-blue-700 font-semibold">Total</p>
              <p className="text-3xl font-bold text-blue-900">{estadisticas.total}</p>
            </div>
            <div className="bg-red-50 p-5 rounded-xl border border-red-200 text-center">
              <p className="text-xs text-red-700 font-semibold">Duplicados</p>
              <p className="text-3xl font-bold text-red-900">{estadisticas.duplicados}</p>
            </div>
            <div className="bg-yellow-50 p-5 rounded-xl border border-yellow-200 text-center">
              <p className="text-xs text-yellow-700 font-semibold">Errores</p>
              <p className="text-3xl font-bold text-yellow-900">{estadisticas.errores}</p>
            </div>
            <div className="bg-green-50 p-5 rounded-xl border border-green-200 text-center">
              <p className="text-xs text-green-700 font-semibold">Válidos</p>
              <p className="text-3xl font-bold text-green-900">{estadisticas.validos}</p>
            </div>
            <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-200 text-center">
              <p className="text-xs text-emerald-700 font-semibold">Calidad</p>
              <p className="text-3xl font-bold text-emerald-900">{estadisticas.scoreCalidad}%</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Acciones de Limpieza */}
      {batchSeleccionado && (
        <motion.div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-bold mb-6">Acciones de Limpieza</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { id: 1, name: 'Analizar datos', icon: BarChart3 },
              { id: 2, name: 'Quitar duplicados', icon: Copy },
              { id: 3, name: 'Limpiar nulos', icon: MinusCircle },
              { id: 4, name: 'Normalizar', icon: Zap },
            ].map(action => {
              const Icon = action.icon;
              const done = completedSteps.includes(action.id);
              return (
                <button
                  key={action.id}
                  onClick={() => handleCleaningAction(action.id)}
                  disabled={isProcessing || action.id === 1} // Analizar ya está hecho
                  className={`p-6 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${done ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-gray-500'
                    } ${isProcessing ? 'opacity-60' : ''}`}
                >
                  <div className={`p-4 rounded-full ${done ? 'bg-green-100' : 'bg-gray-100'}`}>
                    {currentProcessingStep === action.id ?
                      <RefreshCw className="animate-spin" size={28} /> :
                      <Icon size={28} className={done ? 'text-green-600' : 'text-gray-600'} />
                    }
                  </div>
                  <span className="font-semibold">{action.name}</span>
                  {done && <CheckCircle size={20} className="text-green-600" />}
                </button>
              );
            })}
          </div>

          {completedSteps.length === 4 && (
            <div className="mt-6 space-y-4">
              {/* Header */}
              <div className="p-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white text-center">
                <h4 className="text-2xl font-bold mb-2">¡Limpieza Completada!</h4>
                <p className="text-sm opacity-90">Selecciona cómo deseas migrar los datos</p>
              </div>

              {/* Botones */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* BOTÓN 1: REEMPLAZAR TODO */}
                <motion.button
                  onClick={() => enviarATablaFinal(true)} // replace_all = true
                  disabled={isProcessing}
                  className="flex flex-col items-center gap-3 p-6 bg-red-50 border-2 border-red-500 rounded-xl hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
                    <RefreshCw size={32} className="text-white" />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-red-900 text-lg">Reemplazar Todo</p>
                    <p className="text-sm text-red-700 mt-1">Borra datos existentes y sube los nuevos</p>
                  </div>
                  {isProcessing && (
                    <div className="flex items-center gap-2 text-red-600">
                      <RefreshCw className="animate-spin" size={16} />
                      <span className="text-xs">Procesando...</span>
                    </div>
                  )}
                </motion.button>

                {/* BOTÓN 2: AGREGAR SIN DUPLICAR */}
                <motion.button
                  onClick={() => enviarATablaFinal(false)} // replace_all = false
                  disabled={isProcessing}
                  className="flex flex-col items-center gap-3 p-6 bg-blue-50 border-2 border-blue-500 rounded-xl hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                    <Database size={32} className="text-white" />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-blue-900 text-lg">Agregar Sin Duplicar</p>
                    <p className="text-sm text-blue-700 mt-1">Solo agrega votos nuevos (no borra nada)</p>
                  </div>
                  {isProcessing && (
                    <div className="flex items-center gap-2 text-blue-600">
                      <RefreshCw className="animate-spin" size={16} />
                      <span className="text-xs">Procesando...</span>
                    </div>
                  )}
                </motion.button>

              </div>

              {/* Advertencia para REEMPLAZAR TODO */}
              <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 flex items-start gap-3">
                <AlertTriangle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="font-semibold text-yellow-900">⚠️ Advertencia</p>
                  <p className="text-sm text-yellow-800 mt-1">
                    "Reemplazar Todo" eliminará permanentemente todos los votos existentes en la tabla.
                    Solo usa esta opción si estás seguro de reemplazar los datos completamente.
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Tabla */}
      {batchSeleccionado && (
        <motion.div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-6 border-b flex justify-between items-center">
            <h3 className="text-lg font-bold">Vista Previa de Datos</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setPaginaActual(1); }}
                className="pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>
          </div>

          {cargandoDatos ? (
            <div className="text-center py-16">
              <RefreshCw className="animate-spin mx-auto" size={40} />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {['DNI', 'Nombre', 'Candidato', 'Partido', 'Distrito', 'Fecha', 'Estado'].map(h => (
                        <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {actuales.map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium">{row.dni || '—'}</td>
                        <td className="px-6 py-4 text-sm">{row.nombre_completo || '—'}</td>
                        <td className="px-6 py-4 text-sm">{row.candidato_nombre || '—'}</td>
                        <td className="px-6 py-4 text-sm">{row.candidato_partido || '—'}</td>
                        <td className="px-6 py-4 text-sm">{row.distrito || '—'}</td>
                        <td className="px-6 py-4 text-sm">
                          {row.fecha_voto ? new Date(row.fecha_voto).toLocaleDateString('es-PE') : '—'}
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(row)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {datosFiltrados.length > registrosPorPagina && (
                <div className="px-6 py-4 border-t flex justify-between items-center text-sm">
                  <span>Mostrando {inicio + 1} - {Math.min(inicio + registrosPorPagina, datosFiltrados.length)} de {datosFiltrados.length}</span>
                  <div className="flex gap-2">
                    <button onClick={() => setPaginaActual(p => Math.max(1, p - 1))} disabled={paginaActual === 1} className="px-3 py-1 border rounded disabled:opacity-50">
                      <ChevronLeft size={16} />
                    </button>
                    <span className="px-3 py-1">{paginaActual} / {totalPaginas}</span>
                    <button onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))} disabled={paginaActual === totalPaginas} className="px-3 py-1 border rounded disabled:opacity-50">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default LimpiezaDatos;