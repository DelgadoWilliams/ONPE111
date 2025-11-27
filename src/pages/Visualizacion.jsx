import { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  RefreshCw, ChevronDown, Vote, MapPin, Users
} from 'lucide-react';
import { motion } from 'framer-motion';
import { estadisticasAPI } from '../services/api';
const Visualizacion = () => {
  const [activeChart, setActiveChart] = useState('barras');
  const [electionType, setElectionType] = useState('todos');
  const [loading, setLoading] = useState(false);
  const [estadisticas, setEstadisticas] = useState(null);
  const [votosPorDistrito, setVotosPorDistrito] = useState([]);

  // Opciones del selector de elección
  const electionOptions = [
    { value: 'todos', label: 'Todos', icon: Vote },
    { value: 'presidencial', label: 'Presidencial', icon: Vote },
    { value: 'regional', label: 'Regional', icon: MapPin },
    { value: 'distrital', label: 'Distrital', icon: Users },
  ];

  const CurrentElectionIcon = electionOptions.find(opt => opt.value === electionType)?.icon || Vote;

  // Cargar datos reales al montar el componente
  useEffect(() => {
    cargarDatos();
  }, []);

  // ✅ AGREGAR ESTE NUEVO useEffect
  useEffect(() => {
    if (estadisticas) { // Solo cargar si ya hay datos generales
      cargarVotosPorDistrito();
    }
  }, [electionType]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const response = await estadisticasAPI.getDashboard(); // ← API REAL

      if (response.data && response.data.success) {
        const data = response.data.data;
        setEstadisticas(data);
        await cargarVotosPorDistrito();
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
      setEstadisticas({
        total_votantes: 0,
        votos: { presidencial: 0, regional: 0, distrital: 0, total: 0 }
      });
    } finally {
      setLoading(false);
    }
  };

  // Cargar votos por distrito
  const cargarVotosPorDistrito = async () => {
    try {
      setLoading(true);

      // Usar endpoint con filtro
      const response = await estadisticasAPI.getVotosPorDistritoFiltrado(electionType);

      if (response.data && response.data.success) {
        const distritosData = response.data.data;
        const totalVotos = response.data.total_votos || distritosData.reduce((sum, d) => sum + d.votos, 0);

        // Validar que haya datos
        if (!distritosData || distritosData.length === 0) {
          console.warn('No hay datos de distritos para este tipo de elección');
          setVotosPorDistrito([]);
          return;
        }

        // Obtener los top 5 distritos
        const topDistritos = distritosData
          .slice(0, 5)
          .map((d, idx) => ({
            name: d.distrito,
            value: parseFloat(((d.votos / totalVotos) * 100).toFixed(1)),
            votos: d.votos,
            color: ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'][idx]
          }));

        // Agrupar el resto como "Otros"
        const otrosVotos = distritosData
          .slice(5)
          .reduce((sum, d) => sum + d.votos, 0);

        if (otrosVotos > 0) {
          topDistritos.push({
            name: 'Otros',
            value: parseFloat(((otrosVotos / totalVotos) * 100).toFixed(1)),
            votos: otrosVotos,
            color: '#94a3b8'
          });
        }

        setVotosPorDistrito(topDistritos);
        console.log(`✅ Cargados ${topDistritos.length} distritos para: ${electionType}`);
      } else {
        console.warn('Respuesta sin datos válidos');
        setVotosPorDistrito([]);
      }
    } catch (error) {
      console.error('Error cargando votos por distrito:', error);
      setVotosPorDistrito([]);
    } finally {
      setLoading(false);
    }
  };

  // Datos transformados para los gráficos
  // GRÁFICO 1: Distribución de votos por tipo de elección
  const dataVotosPorTipo = estadisticas ? [
    { rango: 'Presidencial', cantidad: estadisticas.votos?.presidencial || 0 },
    { rango: 'Regional', cantidad: estadisticas.votos?.regional || 0 },
    { rango: 'Distrital', cantidad: estadisticas.votos?.distrital || 0 },
  ] : [];

  // GRÁFICO 2: Participación electoral (votantes vs votos)
  const dataParticipacion = estadisticas ? [
    {
      nombre: 'Total Votantes',
      valor: estadisticas.total_votantes || 0,
      color: '#6366f1'
    },
    {
      nombre: 'Votos Emitidos',
      valor: estadisticas.votos?.total || 0,
      color: '#8b5cf6'
    },
    {
      nombre: 'Pendientes',
      valor: Math.max(0, (estadisticas.total_votantes || 0) - (estadisticas.votos?.total || 0)),
      color: '#ec4899'
    },
  ] : [];

  // GRÁFICO 3: Tendencia de actividad reciente
  const dataTendencia = estadisticas?.actividad_reciente ?
    estadisticas.actividad_reciente.map((act, idx) => {
      const tipo = act.action.includes('Presidencial') ? 'Presidencial' :
        act.action.includes('Regional') ? 'Regional' : 'Distrital';
      return {
        mes: `Actividad ${idx + 1}`,
        tipo: tipo,
        registros: idx + 1
      };
    }) : [];

  // GRÁFICO 4: Datos del gráfico circular (por distrito)
  const dataPie = votosPorDistrito;

  const chartTypes = [
    { id: 'barras', name: 'Gráfico de Barras', icon: '📊' },
    { id: 'lineas', name: 'Gráfico de Líneas', icon: '📈' },
    { id: 'pie', name: 'Gráfico Circular', icon: '🥧' },
    { id: 'comparativo', name: 'Comparativo', icon: '📉' },
  ];

  // Componentes de gráficos
  const BarrasChart = () => (
    <motion.div
      key="barras"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-6"
    >
      {/* GRÁFICO 1: Votos por Tipo de Elección */}
      <motion.div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">Votos por Tipo de Elección</h3>
          <span className="text-sm text-gray-600">Total: {estadisticas?.votos?.total?.toLocaleString() || 0} votos</span>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dataVotosPorTipo}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="rango" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
            <Bar dataKey="cantidad" fill="#6366f1" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* GRÁFICO 2: Participación Electoral */}
      <motion.div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">Participación Electoral</h3>
          <span className="text-sm text-gray-600">
            {estadisticas?.datos_procesados?.toFixed(1) || 0}% procesado
          </span>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dataParticipacion} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis type="number" stroke="#6b7280" />
            <YAxis dataKey="nombre" type="category" stroke="#6b7280" width={120} />
            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
            <Bar dataKey="valor" radius={[0, 8, 8, 0]}>
              {dataParticipacion.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </motion.div>
  );

  const LineasChart = () => (
    <motion.div
      key="lineas"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800">Actividad Reciente del Sistema</h3>
        <span className="text-sm text-gray-600">Últimos {dataTendencia.length} registros</span>
      </div>

      {dataTendencia.length > 0 ? (
        <>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dataTendencia}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="mes" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
              <Legend />
              <Line
                type="monotone"
                dataKey="registros"
                stroke="#6366f1"
                strokeWidth={3}
                dot={{ fill: '#6366f1', r: 5 }}
                activeDot={{ r: 7 }}
                name="Actividad"
              />
            </LineChart>
          </ResponsiveContainer>

          {/* Lista de actividad reciente */}
          <div className="mt-6 space-y-2">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Detalle de Actividad:</h4>
            {estadisticas?.actividad_reciente?.map((act, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm">
                <span className="text-gray-700">{act.action}</span>
                <span className="text-gray-500 text-xs">
                  {new Date(act.time).toLocaleString('es-PE', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-64 text-gray-400">
          <p>No hay actividad reciente registrada</p>
        </div>
      )}
    </motion.div>
  );

  const PieChartComponent = () => (
    <motion.div
      key="pie"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-6"
    >
      <motion.div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Distribución Porcentual por Distrito</h3>
        {dataPie.length > 0 ? (
          <ResponsiveContainer width="100%" height={380}>
            <PieChart>
              <Pie
                data={dataPie}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={130}
                fill="#8884d8"
                dataKey="value"
              >
                {dataPie.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-96 text-gray-400">
            <p>Cargando datos de distritos...</p>
          </div>
        )}
      </motion.div>

      <motion.div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Detalle por Distrito</h3>
        <div className="space-y-3">
          {dataPie.length > 0 ? (
            dataPie.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="font-medium text-gray-800">{item.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800">{item.value}%</p>
                  <p className="text-xs text-gray-600">
                    {item.votos?.toLocaleString() || 0} votos
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-400 py-8">
              <p>No hay datos disponibles</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );

  const ComparativoChart = () => (
    <motion.div
      key="comparativo"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Comparación por Tipo de Elección</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={dataVotosPorTipo}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="rango" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
            <Legend />
            <Bar dataKey="cantidad" fill="#6366f1" name="Total Votos" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            color: 'blue',
            title: 'Tasa de Participación',
            value: `${estadisticas?.datos_procesados?.toFixed(1) || 0}%`,
            desc: 'Votos procesados'
          },
          {
            color: 'purple',
            title: 'Total Votantes',
            value: estadisticas?.total_votantes?.toLocaleString() || '0',
            desc: 'Registrados en el sistema'
          },
          {
            color: 'pink',
            title: 'Total Votos',
            value: estadisticas?.votos?.total?.toLocaleString() || '0',
            desc: 'Votos emitidos'
          }
        ].map((metric, index) => (
          <motion.div
            key={index}
            className={`bg-gradient-to-br from-${metric.color}-500 to-${metric.color}-600 p-6 rounded-xl text-white shadow-lg`}
            whileHover={{ scale: 1.05, y: -5 }}
          >
            <p className="text-sm opacity-90 mb-2">{metric.title}</p>
            <p className="text-3xl font-bold mb-1">{metric.value}</p>
            <p className="text-xs opacity-75">{metric.desc}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4">
      {/* Selector de Tipo de Gráfico */}
      <motion.div
        className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="text-lg font-bold text-gray-800 mb-4">Tipo de Visualización</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {chartTypes.map((chart) => (
            <motion.button
              key={chart.id}
              onClick={() => setActiveChart(chart.id)}
              className={`p-6 rounded-lg border-2 transition-all flex flex-col items-center ${activeChart === chart.id
                ? 'border-slate-500 bg-slate-50 shadow-md'
                : 'border-gray-200 hover:border-slate-300'
                }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="text-4xl mb-3">{chart.icon}</div>
              <p className="text-sm font-semibold text-gray-800">{chart.name}</p>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* BARRA DE ACCIONES: Actualizar + Selector de Elección */}
      <motion.div
        className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-5 rounded-xl shadow-sm border border-gray-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <motion.button
          onClick={cargarDatos}
          disabled={loading}
          className="flex items-center gap-3 px-6 py-3 bg-slate-600 text-white font-medium rounded-lg hover:bg-slate-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: loading ? 1 : 1.05 }}
          whileTap={{ scale: loading ? 1 : 0.95 }}
        >
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Actualizando...' : 'Actualizar Datos'}
        </motion.button>

        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-600 hidden sm:block">Tipo de elección:</span>
          <div className="relative">
            <select
              value={electionType}
              onChange={(e) => setElectionType(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg pl-11 pr-10 py-3 text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all cursor-pointer hover:border-slate-400 shadow-sm"
            >
              {electionOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <CurrentElectionIcon className="text-slate-600" size={20} />
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <ChevronDown className="text-gray-500" size={20} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Gráficos dinámicos */}
      <div>
        {activeChart === 'barras' && <BarrasChart />}
        {activeChart === 'lineas' && <LineasChart />}
        {activeChart === 'pie' && <PieChartComponent />}
        {activeChart === 'comparativo' && <ComparativoChart />}
      </div>

      {/* Resumen rápido */}
      <motion.div
        className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="text-lg font-bold text-gray-800 mb-4">Resumen General</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            {
              color: 'indigo',
              title: 'Total Votantes',
              value: estadisticas?.total_votantes?.toLocaleString() || '0'
            },
            {
              color: 'emerald',
              title: 'Votos Presidenciales',
              value: estadisticas?.votos?.presidencial?.toLocaleString() || '0'
            },
            {
              color: 'amber',
              title: 'Votos Regionales',
              value: estadisticas?.votos?.regional?.toLocaleString() || '0'
            },
            {
              color: 'purple',
              title: 'Votos Distritales',
              value: estadisticas?.votos?.distrital?.toLocaleString() || '0'
            },
            {
              color: 'rose',
              title: 'Total Votos',
              value: estadisticas?.votos?.total?.toLocaleString() || '0'
            }
          ].map((stat, index) => (
            <motion.div
              key={index}
              className={`text-center p-5 bg-${stat.color}-50 rounded-xl border border-${stat.color}-200`}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <p className={`text-sm font-medium text-${stat.color}-800`}>{stat.title}</p>
              <p className={`text-2xl font-bold text-${stat.color}-900 mt-1`}>{stat.value}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Visualizacion;