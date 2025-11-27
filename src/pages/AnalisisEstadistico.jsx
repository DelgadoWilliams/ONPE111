import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  RefreshCw,
  Play,
  Zap,
  TrendingUp,
  Target,
  Calculator,
  Activity,
  BarChart2,
  Vote,
  MapPin,
  Users,
  ChevronDown,
  AlertCircle
} from 'lucide-react';
import { mlAPI, estadisticasAPI } from '../services/api';

const AnalisisEstadistico = () => {
  const [selectedAnalysis, setSelectedAnalysis] = useState('descriptivo');
  const [electionType, setElectionType] = useState('presidencial');
  const [modeloActual, setModeloActual] = useState(null);
  const [loading, setLoading] = useState(false);
  const [entrenando, setEntrenando] = useState(false);
  const [estadisticas, setEstadisticas] = useState(null);
  const [error, setError] = useState(null);

  const electionOptions = [
    { value: 'presidencial', label: 'Elección Presidencial', icon: Vote },
    { value: 'regional', label: 'Elección Regional', icon: MapPin },
    { value: 'distrital', label: 'Elección Distrital', icon: Users },
  ];

  // Cargar estadísticas descriptivas cuando se monta el componente
  useEffect(() => {
    if (selectedAnalysis === 'descriptivo') {
      cargarEstadisticasDescriptivas();
    }
  }, [selectedAnalysis]);

  // Cargar modelo cuando cambia el tipo de elección
  useEffect(() => {
    if (selectedAnalysis === 'predictivo') {
      cargarModeloActivo();
    }
  }, [electionType, selectedAnalysis]);

  const cargarEstadisticasDescriptivas = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await estadisticasAPI.getDashboard();

      if (response.data && response.data.success) {
        const data = response.data.data;

        // Transformar datos del backend al formato esperado
        setEstadisticas({
          descriptivas: [
            { label: 'Total Votantes', value: data.total_votantes?.toLocaleString() || '0', icon: Calculator, color: 'blue' },
            { label: 'Registros Cargados', value: data.registros_cargados?.toLocaleString() || '0', icon: Activity, color: 'green' },
            { label: 'Datos Procesados', value: `${data.datos_procesados || 0}%`, icon: TrendingUp, color: 'purple' },
            { label: 'Validación Completa', value: data.validacion_completa?.toLocaleString() || '0', icon: BarChart2, color: 'orange' },
          ],
          distribucion: [
            { rango: 'Presidencial', cantidad: data.votos?.presidencial || 0, porcentaje: ((data.votos?.presidencial || 0) / (data.votos?.total || 1) * 100).toFixed(1) },
            { rango: 'Regional', cantidad: data.votos?.regional || 0, porcentaje: ((data.votos?.regional || 0) / (data.votos?.total || 1) * 100).toFixed(1) },
            { rango: 'Distrital', cantidad: data.votos?.distrital || 0, porcentaje: ((data.votos?.distrital || 0) / (data.votos?.total || 1) * 100).toFixed(1) },
          ],
          actividad: data.actividad_reciente || []
        });
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
      setError('No se pudieron cargar las estadísticas. Verifica que el backend esté activo.');
      // Datos por defecto en caso de error
      setEstadisticas({
        descriptivas: [
          { label: 'Total Votantes', value: '0', icon: Calculator, color: 'blue' },
          { label: 'Registros Cargados', value: '0', icon: Activity, color: 'green' },
          { label: 'Datos Procesados', value: '0%', icon: TrendingUp, color: 'purple' },
          { label: 'Validación Completa', value: '0', icon: BarChart2, color: 'orange' },
        ],
        distribucion: [],
        actividad: []
      });
    } finally {
      setLoading(false);
    }
  };

  const cargarModeloActivo = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await mlAPI.getPredicciones(electionType);

      // La respuesta viene directamente en response.data
      if (response.data && response.data.success) {
        const modelData = response.data;

        // Transformar al formato esperado por el componente
        setModeloActual({
          modelo_activo: modelData.modelo_activo || modelData.model_name || `Modelo ${electionType}`,
          metricas: {
            'Accuracy': `${(modelData.metricas?.accuracy * 100 || 0).toFixed(1)}%`,
            'Precision': `${(modelData.metricas?.precision * 100 || 0).toFixed(1)}%`,
            'Recall': `${(modelData.metricas?.recall * 100 || 0).toFixed(1)}%`,
            'F1-Score': (modelData.metricas?.f1_score || 0).toFixed(2)
          },
          participacion_estimada: modelData.participacion_estimada || 'N/A',
          feature_importance: modelData.feature_importance || {},
          fecha_entrenamiento: modelData.fecha_entrenamiento || modelData.created_at,
          model_id: modelData.model_id
        });
      } else {
        // No hay modelo entrenado
        setModeloActual(null);
      }
    } catch (error) {
      console.error('Error cargando modelo:', error);
      setModeloActual(null);
      // No mostrar error si simplemente no hay modelo
      if (error.response && error.response.status !== 404) {
        setError('Error al cargar el modelo. Verifica que el backend esté activo.');
      }
    } finally {
      setLoading(false);
    }
  };

  const entrenarModelo = async () => {
    setEntrenando(true);
    setError(null);
    try {
      const response = await mlAPI.entrenarModelo(electionType);

      // La respuesta viene directamente en response.data, no en response.data.data
      if (response.data && response.data.success) {
        const modelData = response.data;

        // Transformar datos del backend al formato esperado
        setModeloActual({
          modelo_activo: modelData.modelo_activo || modelData.algorithm || `Modelo ${electionType}`,
          metricas: {
            'Accuracy': `${(modelData.metricas?.accuracy * 100 || 0).toFixed(1)}%`,
            'Precision': `${(modelData.metricas?.precision * 100 || 0).toFixed(1)}%`,
            'Recall': `${(modelData.metricas?.recall * 100 || 0).toFixed(1)}%`,
            'F1-Score': (modelData.metricas?.f1_score || 0).toFixed(2)
          },
          participacion_estimada: modelData.participacion_estimada || 'N/A',
          feature_importance: modelData.feature_importance || {},
          fecha_entrenamiento: new Date().toISOString(),
          model_id: modelData.model_id,
          training_time: modelData.training_time
        });

        alert(`✅ Modelo ${electionType} entrenado exitosamente!`);
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (error) {
      console.error('Error entrenando modelo:', error);
      const errorMsg = error.response?.data?.detail || error.message || 'Error desconocido';
      setError(`Error al entrenar el modelo: ${errorMsg}`);
      alert(`❌ Error: ${errorMsg}`);
    } finally {
      setEntrenando(false);
    }
  };

  // ============= COMPONENTE: ANÁLISIS DESCRIPTIVO =============
  const AnalisisDescriptivo = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="mx-auto animate-spin text-purple-600 mb-3" size={32} />
            <p className="text-gray-600">Cargando estadísticas...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
          <AlertCircle className="mx-auto text-red-500 mb-3" size={48} />
          <p className="text-red-700 font-medium mb-2">Error al cargar datos</p>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <button
            onClick={cargarEstadisticasDescriptivas}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      );
    }

    if (!estadisticas) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500">No hay datos disponibles</p>
        </div>
      );
    }

    return (
      <motion.div
        key="descriptivo"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        {/* Tarjetas de estadísticas básicas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {estadisticas.descriptivas.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className={`inline-flex p-3 bg-${stat.color}-100 rounded-lg mb-3`}>
                  <Icon className={`text-${stat.color}-600`} size={24} />
                </div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Distribución por tipo de voto */}
        <motion.div
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-lg font-bold text-gray-800 mb-4">Distribución de Votos por Tipo</h3>
          <div className="space-y-4">
            {estadisticas.distribucion.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{item.rango}</span>
                  <span className="text-sm text-gray-600">
                    {item.cantidad.toLocaleString()} ({item.porcentaje}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <motion.div
                    className="bg-gradient-to-r from-slate-500 to-slate-700 h-3 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(item.porcentaje, 100)}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Actividad reciente */}
        {estadisticas.actividad && estadisticas.actividad.length > 0 && (
          <motion.div
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="text-lg font-bold text-gray-800 mb-4">Actividad Reciente</h3>
            <div className="space-y-3">
              {estadisticas.actividad.map((actividad, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{actividad.action}</p>
                    <p className="text-xs text-gray-600">{new Date(actividad.time).toLocaleString()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${actividad.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                    {actividad.status}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    );
  };

  // ============= COMPONENTE: ANÁLISIS PREDICTIVO =============
  const AnalisisPredictivo = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="mx-auto animate-spin text-purple-600 mb-3" size={32} />
            <p className="text-gray-600">Cargando modelo...</p>
          </div>
        </div>
      );
    }

    return (
      <motion.div
        key="predictivo"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        {/* Mostrar modelo si existe */}
        {modeloActual ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Modelo activo */}
            <motion.div
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Target className="text-purple-600" size={20} />
                <h3 className="text-lg font-bold text-gray-800">Modelo Activo</h3>
              </div>

              <div className="p-4 border-2 border-slate-500 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-bold text-gray-800">{modeloActual.modelo_activo}</p>
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    Activo
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(modeloActual.metricas).map(([key, value]) => (
                    <div key={key} className="bg-white p-3 rounded-lg">
                      <p className="text-xs text-gray-600 uppercase font-medium mb-1">{key}</p>
                      <p className="text-xl font-bold text-slate-700">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Predicciones */}
            <motion.div
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="text-lg font-bold text-gray-800 mb-4">Predicciones</h3>

              <div className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-lg mb-6">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Participación Estimada 2026
                </p>
                <p className="text-4xl font-bold text-purple-700">
                  {modeloActual.participacion_estimada}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Factores Principales</p>
                <div className="space-y-3">
                  {Object.entries(modeloActual.feature_importance).map(([label, value], index) => (
                    <div key={index}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600 font-medium">{label}</span>
                        <span className="font-bold text-purple-700">{(value * 100).toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <motion.div
                          className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2.5 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${value * 100}%` }}
                          transition={{ duration: 0.8, delay: index * 0.1 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        ) : (
          // Sin modelo entrenado
          <motion.div
            className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <AlertCircle className="mx-auto text-gray-400 mb-4" size={56} />
            <p className="text-gray-600 font-medium mb-2">
              No hay modelo entrenado para {electionType}
            </p>
            <p className="text-sm text-gray-500">
              Haz clic en "Entrenar Modelo" para comenzar el análisis predictivo
            </p>
          </motion.div>
        )}
      </motion.div>
    );
  };

  // Obtener el ícono actual
  const CurrentIcon = electionOptions.find(opt => opt.value === electionType)?.icon || Vote;

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp size={28} />
          <h1 className="text-2xl font-bold">Análisis Estadístico Electoral</h1>
        </div>
        <p className="text-purple-100">
          Estadísticas descriptivas y modelos predictivos de participación electoral
        </p>
      </div>

      {/* Selector de análisis y elección */}
      <motion.div
        className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="text-lg font-bold text-gray-800 mb-4">Tipo de Análisis</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {[
            { id: 'descriptivo', label: 'Análisis Descriptivo', description: 'Estadísticas básicas', icon: Calculator },
            { id: 'predictivo', label: 'Análisis Predictivo', description: 'Modelos ML', icon: Activity },
          ].map((analysis) => {
            const Icon = analysis.icon;
            return (
              <motion.button
                key={analysis.id}
                onClick={() => setSelectedAnalysis(analysis.id)}
                className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center ${selectedAnalysis === analysis.id
                  ? 'border-slate-500 bg-slate-50'
                  : 'border-gray-200 hover:border-slate-300'
                  }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon
                  className={selectedAnalysis === analysis.id ? 'text-slate-600' : 'text-gray-400'}
                  size={32}
                />
                <p className="font-medium text-gray-800 mt-2">{analysis.label}</p>
                <p className="text-xs text-gray-600 mt-1">{analysis.description}</p>
              </motion.button>
            );
          })}
        </div>

        {/* Dropdown tipo de elección */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Elección
          </label>
          <div className="relative">
            <select
              value={electionType}
              onChange={(e) => setElectionType(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pl-12 pr-10 text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-slate-500 cursor-pointer"
            >
              {electionOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <CurrentIcon className="text-slate-600" size={20} />
            </div>

            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <ChevronDown className="text-gray-500" size={20} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Contenido dinámico */}
      <div>
        {selectedAnalysis === 'descriptivo' && <AnalisisDescriptivo />}
        {selectedAnalysis === 'predictivo' && <AnalisisPredictivo />}
      </div>
    </div>
  );
};

export default AnalisisEstadistico;