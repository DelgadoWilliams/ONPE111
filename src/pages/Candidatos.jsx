import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Award,
  TrendingUp,
  Search,
  X,
  Eye,
  Trophy,
  FileText,
} from 'lucide-react';
import { candidatosAPI } from '../services/api';
import { votosPresidencialesAPI, votosRegionalesAPI, votosDistritalesAPI } from '../services/api';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

const mapearCandidato = (c) => {
  // Normalizar tipo_eleccion desde el inicio
  const tipoOriginal = c.tipo_eleccion || c.tipoEleccion || '';
  const tipoNormalizado = tipoOriginal.toLowerCase().trim();
  
  return {
      ...c,
      tipo_eleccion: tipoNormalizado,  // ✅ Normalizado
      image_url: c.imageUrl || c.image_url,
      propuestas: typeof c.propuestas === 'string'
          ? (c.propuestas ? JSON.parse(c.propuestas) : [])
          : (c.propuestas || [])
  };
};

const normalizarTipo = (tipo) => tipo ? tipo.toString().toLowerCase().trim() : '';

const formatNumber = (num) => num.toLocaleString('es-ES');

const Candidatos = () => {
  const [candidatos, setCandidatos] = useState([]);
  const [votosPorCandidato, setVotosPorCandidato] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [candidatoSeleccionado, setCandidatoSeleccionado] = useState(null);

  // src/pages/Candidatos.jsx

  // src/pages/Candidatos.jsx

useEffect(() => {
  const cargarDatos = async () => {
      try {
          setLoading(true);

          const resCandidatos = await candidatosAPI.getAll();
          console.log("📋 Response completo candidatos:", resCandidatos);
          
          // Extraer el array de candidatos correctamente
          let candidatosArray = [];
          
          if (resCandidatos.data) {
              if (resCandidatos.data.success && Array.isArray(resCandidatos.data.data)) {
                  candidatosArray = resCandidatos.data.data;
              }
              else if (Array.isArray(resCandidatos.data)) {
                  candidatosArray = resCandidatos.data;
              }
          }
          else if (resCandidatos.success && Array.isArray(resCandidatos.data)) {
              candidatosArray = resCandidatos.data;
          }
          
          console.log("✅ Candidatos extraídos:", candidatosArray);
          
          // ✅ CORRECCIÓN: Mapear Y normalizar tipo_eleccion
          const candidatosMapeados = candidatosArray.map(c => {
              const mapped = mapearCandidato(c);
              
              // Normalizar tipo_eleccion (puede venir como tipo_eleccion o tipoEleccion)
              const tipoOriginal = c.tipo_eleccion || c.tipoEleccion || '';
              mapped.tipo_eleccion = tipoOriginal.toLowerCase().trim();
              
              console.log(`📌 Candidato: ${mapped.nombre} -> Tipo: "${mapped.tipo_eleccion}"`);
              
              return mapped;
          });

          console.log("📋 Candidatos mapeados con tipos:", candidatosMapeados);

          // Cargar votos
          const [pres, reg, dist] = await Promise.all([
              votosPresidencialesAPI.getAll().catch(() => ({ data: { data: [] } })),
              votosRegionalesAPI.getAll().catch(() => ({ data: { data: [] } })),
              votosDistritalesAPI.getAll().catch(() => ({ data: { data: [] } })),
          ]);

          console.log("📊 Votos presidenciales:", pres);
          console.log("📊 Votos regionales:", reg);
          console.log("📊 Votos distritales:", dist);

          const votosPresArray = pres.data?.data || pres.data || [];
          const votosRegArray = reg.data?.data || reg.data || [];
          const votosDistArray = dist.data?.data || dist.data || [];

          const todosLosVotos = [...votosPresArray, ...votosRegArray, ...votosDistArray];
          console.log("📊 Total votos combinados:", todosLosVotos.length);

          const conteo = {};
          todosLosVotos.forEach(voto => {
              const id = voto.candidato?.id || voto.candidato_id;
              if (id) conteo[id] = (conteo[id] || 0) + 1;
          });

          console.log("📊 Conteo de votos por candidato:", conteo);

          setVotosPorCandidato(conteo);
          setCandidatos(candidatosMapeados);
      } catch (err) {
          setError('Error al cargar los datos');
          console.error("❌ Error en cargarDatos:", err);
      } finally {
          setLoading(false);
      }
  };

  cargarDatos();
}, []);

  // Enriquecer con votos y porcentaje
  const candidatosConVotos = candidatos.map(c => ({
    ...c,
    votos: votosPorCandidato[c.id] || 0
  }));

  const totalVotosPorTipo = {
    presidencial: candidatosConVotos.filter(c => normalizarTipo(c.tipo_eleccion) === 'presidencial').reduce((s, c) => s + c.votos, 0),
    regional: candidatosConVotos.filter(c => normalizarTipo(c.tipo_eleccion) === 'regional').reduce((s, c) => s + c.votos, 0),
    distrital: candidatosConVotos.filter(c => normalizarTipo(c.tipo_eleccion) === 'distrital').reduce((s, c) => s + c.votos, 0),
  };

  const candidatosFinales = candidatosConVotos.map(c => {
    const tipo = normalizarTipo(c.tipo_eleccion);
    const total = totalVotosPorTipo[tipo] || 1;
    const porcentaje = total > 0 ? ((c.votos / total) * 100).toFixed(1) : 0;
    return { ...c, porcentaje };
  });

  const candidatosOrdenados = [...candidatosFinales].sort((a, b) => b.votos - a.votos);
  const liderActual = filtroTipo === 'todos'
    ? candidatosOrdenados[0]
    : candidatosOrdenados.find(c => normalizarTipo(c.tipo_eleccion) === filtroTipo);

  const tipoConfig = {
    presidencial: { label: 'Presidencial', color: 'from-purple-600 to-pink-600', bar: 'bg-purple-600' },
    regional: { label: 'Regional', color: 'from-emerald-600 to-teal-600', bar: 'bg-emerald-600' },
    distrital: { label: 'Distrital', color: 'from-blue-600 to-cyan-600', bar: 'bg-blue-600' },
  };

  const estadisticas = [
    { label: 'Total Candidatos', value: candidatos.length, icon: Users, gradient: 'from-blue-500 to-cyan-500' },
    { label: 'Presidenciales', value: candidatos.filter(c => normalizarTipo(c.tipo_eleccion) === 'presidencial').length, icon: Award, gradient: 'from-purple-500 to-pink-500' },
    { label: 'Regionales', value: candidatos.filter(c => normalizarTipo(c.tipo_eleccion) === 'regional').length, icon: TrendingUp, gradient: 'from-emerald-500 to-teal-500' },
    { label: 'Distritales', value: candidatos.filter(c => normalizarTipo(c.tipo_eleccion) === 'distrital').length, icon: Users, gradient: 'from-orange-500 to-red-500' },
  ];

  const candidatosFiltrados = candidatosFinales.filter(c => {
    const tipoOk = filtroTipo === 'todos' || normalizarTipo(c.tipo_eleccion) === filtroTipo;
    const busquedaOk = !terminoBusqueda ||
      c.nombre?.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
      c.partido?.toLowerCase().includes(terminoBusqueda.toLowerCase());
    return tipoOk && busquedaOk;
  });

  const contadorPorTipo = {
    total: candidatos.length,
    presidencial: candidatos.filter(c => normalizarTipo(c.tipo_eleccion) === 'presidencial').length,
    regional: candidatos.filter(c => normalizarTipo(c.tipo_eleccion) === 'regional').length,
    distrital: candidatos.filter(c => normalizarTipo(c.tipo_eleccion) === 'distrital').length,
  };

  const tiposFiltro = [
    { id: 'todos', label: 'Todos los Candidatos', count: contadorPorTipo.total },
    { id: 'presidencial', label: 'Presidenciales', count: contadorPorTipo.presidencial },
    { id: 'regional', label: 'Regionales', count: contadorPorTipo.regional },
    { id: 'distrital', label: 'Distritales', count: contadorPorTipo.distrital },
  ];

  const abrirModalPropuestas = (candidato) => {
    setCandidatoSeleccionado(candidato);
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setCandidatoSeleccionado(null);
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Implementado': return 'bg-green-100 text-green-800';
      case 'En progreso': return 'bg-blue-100 text-blue-800';
      case 'Planificado': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPrioridadColor = (prioridad) => {
    switch (prioridad) {
      case 'Alta': return 'bg-red-100 text-red-800';
      case 'Media': return 'bg-orange-100 text-orange-800';
      case 'Baja': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="text-center py-20 text-xl text-slate-600">Cargando resultados...</div>;
  if (error) return <div className="text-center py-20 text-red-600 text-xl">{error}</div>;

  return (
    <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">

      {/* Hero */}
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white mb-2">Resultados Electorales en Vivo</h1>
          <p className="text-white/90">Seguimiento en tiempo real de votos y preferencias</p>
        </div>
      </motion.div>

      {/* Estadísticas */}
      <motion.div className="grid grid-cols-1 md:grid-cols-4 gap-4" variants={containerVariants}>
        {estadisticas.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div key={i} variants={itemVariants} whileHover={{ y: -5 }} className="glass-effect rounded-2xl p-6 hover:shadow-xl transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-indigo-600 bg-clip-text text-transparent">
                    {stat.value}
                  </p>
                </div>
                <div className={`w-14 h-14 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Filtros */}
      <motion.div variants={itemVariants} className="glass-effect p-6 rounded-2xl shadow-xl">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Filtrar por Tipo</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {tiposFiltro.map(t => (
            <motion.button
              key={t.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFiltroTipo(t.id)}
              className={`p-4 rounded-xl border-2 transition-all text-left ${filtroTipo === t.id ? 'border-indigo-500 bg-indigo-50 shadow-md' : 'border-slate-200 bg-white hover:border-indigo-300'}`}
            >
              <p className="font-semibold text-slate-800">{t.label}</p>
              <p className="text-2xl font-bold text-indigo-600 mt-1">{t.count}</p>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Búsqueda */}
      <motion.div variants={itemVariants} className="glass-effect p-6 rounded-2xl shadow-xl">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por nombre o partido..."
              className="w-full pl-10 pr-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={terminoBusqueda}
              onChange={(e) => setTerminoBusqueda(e.target.value)}
            />
          </div>
          {terminoBusqueda && (
            <button onClick={() => setTerminoBusqueda('')} className="flex items-center gap-2 px-5 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all">
              <X size={18} /> Limpiar
            </button>
          )}
        </div>
      </motion.div>

      {/* Cards de Candidatos - Más anchas con max-w actualizada y centradas */}
      <motion.div
        key={`${filtroTipo}-${terminoBusqueda}`}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {candidatosFiltrados.map((candidato) => {
          const tipo = normalizarTipo(candidato.tipo_eleccion);
          const config = tipoConfig[tipo] || { label: 'Desconocido', color: 'from-gray-400 to-gray-600', bar: 'bg-gray-500' };
          const esLider = liderActual?.id === candidato.id;

          return (
            <motion.div
              key={candidato.id}
              layout
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.01 }}
              // Cambiado max-w-xs y md:max-w-sm a max-w-md y md:max-w-lg para hacer la card más ancha
              className="relative rounded-2xl overflow-hidden group bg-white shadow-xl hover:shadow-2xl border border-slate-200 transition-all mx-auto w-full max-w-md md:max-w-lg"
            >
              {/* Top gradient + badge tipo */}
              <div className={`absolute top-0 left-0 w-full h-32 z-0 bg-gradient-to-r ${config.color}`}></div>
              {/* Badge tipo */}
              <span className="absolute top-5 left-5 z-10 bg-white/80 px-4 py-1 rounded-full text-xs font-semibold shadow-md border border-white">
                {config.label}
              </span>

              {/* Trofeo líder */}
              {esLider && filtroTipo !== 'todos' && (
                <span className="absolute top-5 right-5 z-10">
                  <Trophy className="text-yellow-500 drop-shadow-xl animate-pulse" size={30} />
                </span>
              )}

              <div className="relative flex flex-col items-center pt-16 pb-10 px-6 z-10 text-base min-h-[340px]">
                {/* Foto */}
                <div className="w-24 h-24 rounded-full shadow-lg border-4 border-white bg-slate-100 overflow-hidden -mt-12 mb-2 flex items-center justify-center">
                  {candidato.image_url ? (
                    <img
                      src={candidato.image_url}
                      alt={candidato.nombre}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <span className="text-4xl font-bold text-white w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-600 to-pink-500">
                      {candidato.nombre?.charAt(0) || "?"}
                    </span>
                  )}
                </div>
                {/* Nombre */}
                <h3 className="mt-2 text-lg font-extrabold text-slate-800 text-center">
                  {candidato.nombre}
                </h3>
                {/* Partido */}
                <div className="text-sm text-center font-medium bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-1">
                  {candidato.partido}
                </div>
                {/* Votos y porcentaje */}
                <div className="flex w-full justify-between items-center mb-2 mt-1">
                  <div>
                    <span className="block text-2xl font-bold text-indigo-700">{candidato.porcentaje}%</span>
                    <span className="block text-xs text-slate-500">{formatNumber(candidato.votos)} votos</span>
                  </div>
                  {esLider && filtroTipo !== 'todos' && (
                    <span className="text-[11px] font-semibold text-yellow-900 bg-yellow-200 px-3 py-1 rounded-full shadow">Líder</span>
                  )}
                </div>
                {/* Barra porcentaje */}
                <div className="w-full mt-1 mb-3">
                  <div className="w-full bg-slate-200 rounded-full h-3 relative overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${candidato.porcentaje}%` }}
                      transition={{ duration: 1.1, ease: "easeOut" }}
                      className={`h-full rounded-full ${config.bar} relative`}
                    ></motion.div>
                  </div>
                </div>
                {/* Datos extra rápidos */}
                <div className="flex w-full justify-between items-center text-xs text-slate-500 mb-5">
                  <div className="flex flex-col items-center flex-1 border-r border-slate-100 last:border-none">
                    <span className="font-bold text-indigo-600 text-sm">{candidato.propuestas.length}</span>
                    <span>Propuestas</span>
                  </div>
                  <div className="flex flex-col items-center flex-1 border-r border-slate-100 last:border-none">
                    <span className="font-bold text-slate-700 text-sm">{config.label}</span>
                    <span>Tipo</span>
                  </div>
                  <div className="flex flex-col items-center flex-1">
                    <span className="font-bold text-green-600 text-sm">Activo</span>
                    <span>Estado</span>
                  </div>
                </div>
                {/* Botón ver propuestas */}
                <button
                  onClick={() => abrirModalPropuestas(candidato)}
                  className="w-full flex items-center justify-center gap-2 py-2 mt-auto bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-semibold rounded-xl shadow hover:from-blue-700 hover:to-indigo-800 transition-all"
                >
                  <Eye size={16} /> Ver Propuestas
                </button>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Modal de Propuestas (sin cambios) */}
      {showModal && candidatoSeleccionado && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-6 text-white relative">
              <button onClick={cerrarModal} className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-xl transition">
                <X size={28} />
              </button>
              <div className="flex items-center gap-5">
                <div className="w-24 h-24 rounded-2xl shadow-2xl overflow-hidden border-4 border-white">
                  {candidatoSeleccionado.image_url ? (
                    <img src={candidatoSeleccionado.image_url} alt={candidatoSeleccionado.nombre} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-white/30 flex items-center justify-center text-6xl font-bold">
                      {candidatoSeleccionado.nombre?.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-3xl font-bold">{candidatoSeleccionado.nombre}</h2>
                  <p className="text-xl opacity-90">{candidatoSeleccionado.partido}</p>
                  <p className="text-sm opacity-80 mt-2">
                    {candidatoSeleccionado.propuestas.length} propuestas • {formatNumber(candidatoSeleccionado.votos)} votos ({candidatoSeleccionado.porcentaje}%)
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {candidatoSeleccionado.propuestas.length > 0 ? (
                <div className="grid gap-5">
                  {candidatoSeleccionado.propuestas.map((p, i) => (
                    <div key={i} className="border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-all group">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-xl font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                          {p.titulo || 'Sin título'}
                        </h3>
                        <FileText className="text-slate-400" size={24} />
                      </div>
                      <p className="text-slate-600 leading-relaxed mb-4">{p.descripcion || 'Sin descripción.'}</p>
                      <div className="flex flex-wrap gap-3">
                        {p.categoria && <span className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">{p.categoria}</span>}
                        {p.estado && <span className={`px-4 py-2 rounded-full text-sm font-medium ${getEstadoColor(p.estado)}`}>{p.estado}</span>}
                        {p.prioridad && <span className={`px-4 py-2 rounded-full text-sm font-medium ${getPrioridadColor(p.prioridad)}`}>Prioridad {p.prioridad}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <FileText size={64} className="mx-auto text-slate-300 mb-4" />
                  <p className="text-xl text-slate-500">Este candidato aún no tiene propuestas registradas</p>
                </div>
              )}
            </div>

            <div className="border-t p-5 bg-slate-50 text-right">
              <button onClick={cerrarModal} className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition font-medium">
                Cerrar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Candidatos;