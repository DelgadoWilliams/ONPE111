import { motion } from 'framer-motion';
import { Users, FileText, TrendingUp, CheckCircle, AlertCircle, Zap, Activity, ArrowUp, ArrowDown } from 'lucide-react';

const Dashboard = () => {
  // Variantes de animación
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 100 },
    },
  };
  const stats = [
    {
      title: 'Total Votantes',
      value: '125,430',
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      gradient: 'from-blue-500 to-cyan-500',
      shadowColor: 'shadow-blue-500/50'
    },
    {
      title: 'Registros Cargados',
      value: '45,230',
      change: '+8.2%',
      trend: 'up',
      icon: FileText,
      gradient: 'from-green-500 to-emerald-500',
      shadowColor: 'shadow-green-500/50'
    },
    {
      title: 'Datos Procesados',
      value: '98.5%',
      change: '+2.1%',
      trend: 'up',
      icon: TrendingUp,
      gradient: 'from-purple-500 to-pink-500',
      shadowColor: 'shadow-purple-500/50'
    },
    {
      title: 'Validación Completa',
      value: '42,100',
      change: '+5.3%',
      trend: 'up',
      icon: CheckCircle,
      gradient: 'from-orange-500 to-red-500',
      shadowColor: 'shadow-orange-500/50'
    }
  ];

  const recentActivity = [
    { id: 1, action: 'Carga de datos CSV', time: 'Hace 5 minutos', status: 'success', icon: '📊' },
    { id: 2, action: 'Limpieza de duplicados', time: 'Hace 15 minutos', status: 'success', icon: '🧹' },
    { id: 3, action: 'Análisis estadístico', time: 'Hace 1 hora', status: 'warning', icon: '📈' },
    { id: 4, action: 'Exportación de reportes', time: 'Hace 2 horas', status: 'success', icon: '📄' },
  ];

  const qualityMetrics = [
    { label: 'Registros Válidos', value: 93, color: 'from-green-500 to-emerald-500' },
    { label: 'Datos Completos', value: 87, color: 'from-blue-500 to-cyan-500' },
    { label: 'Sin Duplicados', value: 95, color: 'from-purple-500 to-pink-500' },
    { label: 'Formato Correcto', value: 99, color: 'from-indigo-500 to-purple-500' },
  ];

  return (
    <motion.div 
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Bienvenida con efecto hero */}
<motion.div 
    variants={itemVariants}
    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 p-8 shadow-2xl"
>
    <div className="absolute inset-0 bg-grid-white/10"></div>
    <motion.div 
        className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 4, repeat: Infinity }}
    ></motion.div>
    <motion.div 
        className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, delay: 2 }}
    ></motion.div>
    
    <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
            <Zap className="text-slate-200 animate-pulse" size={32} />
            <h1 className="text-3xl font-bold text-white">¡Bienvenido al Sistema Electoral!</h1>
        </div>
        <p className="text-white/90 text-lg max-w-2xl">
            Gestiona todo el proceso electoral de manera eficiente y transparente. Sistema actualizado en tiempo real.
        </p>
        <div className="flex items-center gap-4 mt-6">
            <button className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/30 transition-colors">
                Documentación
            </button>
        </div>
    </div>
</motion.div>

      {/* Stats Cards Mejoradas */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={containerVariants}
      >
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div 
              key={index}
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
            >
              {/* Efecto de brillo en hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              {/* Borde gradiente animado */}
              <div className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity rounded-2xl`}></div>
              
              <div className="relative flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-600 mb-2">{stat.title}</p>
                  <h3 className="text-3xl font-bold text-slate-800 mb-2">{stat.value}</h3>
                  <div className="flex items-center gap-2">
                    {stat.trend === 'up' ? (
                      <ArrowUp className="text-green-500" size={16} />
                    ) : (
                      <ArrowDown className="text-red-500" size={16} />
                    )}
                    <span className={`text-sm font-semibold ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className={`w-14 h-14 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center shadow-lg ${stat.shadowColor} group-hover:scale-110 transition-transform`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>

              {/* Mini sparkline effect */}
              <div className="mt-4 h-1 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full bg-gradient-to-r ${stat.gradient} rounded-full`} style={{width: '70%'}}></div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Gráficos y Actividad */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        variants={containerVariants}
      >
        {/* Calidad de Datos - Mejorado */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-2 glass-effect rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-indigo-600 bg-clip-text text-transparent">
              Calidad de Datos
            </h3>
            <Activity className="text-indigo-600 animate-pulse" size={24} />
          </div>
          
          <div className="space-y-5">
            {qualityMetrics.map((metric, index) => (
              <motion.div 
                key={index} 
                variants={itemVariants}
                className="group"
              >
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-700">{metric.label}</span>
                  <span className="text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {metric.value}%
                  </span>
                </div>
                <div className="relative w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${metric.color} rounded-full transition-all duration-1000 ease-out relative`}
                    style={{width: `${metric.value}%`}}
                  >
                    <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                  </div>
                  {/* Efecto de brillo */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Indicador general */}
          <motion.div 
            variants={itemVariants}
            className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200"
          >
            <div className="flex items-center gap-3">
              <CheckCircle className="text-green-600" size={24} />
              <div>
                <p className="font-semibold text-green-800">Calidad Excelente</p>
                <p className="text-sm text-green-700">Todos los indicadores dentro de rangos óptimos</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Actividad Reciente - Mejorada */}
        <motion.div 
          variants={itemVariants}
          className="glass-effect rounded-2xl p-6 shadow-xl"
        >
          <h3 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-indigo-600 bg-clip-text text-transparent mb-6">
            Actividad Reciente
          </h3>
          <motion.div className="space-y-4" variants={containerVariants}>
            {recentActivity.map((activity) => (
              <motion.div 
                key={activity.id}
                variants={itemVariants}
                whileHover={{ x: 8 }}
                className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/50 transition-all group cursor-pointer"
              >
                <div className="text-2xl group-hover:scale-110 transition-transform">
                  {activity.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                    {activity.action}
                  </p>
                  <p className="text-xs text-slate-500">{activity.time}</p>
                </div>
                <div className={`w-2 h-2 rounded-full ${
                  activity.status === 'success' ? 'bg-green-500' : 'bg-yellow-500'
                } group-hover:scale-150 transition-transform`}></div>
              </motion.div>
            ))}
          </motion.div>

          <button className="mt-4 w-full py-2.5 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors">
            Ver todo el historial →
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;