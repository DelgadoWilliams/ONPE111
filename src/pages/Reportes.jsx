import { useState } from 'react';
import { FileText, Download, Calendar, Filter, Printer, Mail, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Reportes = () => {
  const [filtroTipo, setFiltroTipo] = useState('todos');

  const reportesDisponibles = [
    {
      id: 1,
      nombre: 'Porcentaje de Votos',
      tipo: 'Estadístico',
      descripcion: 'Análisis detallado de la participación ciudadana',
      fecha: '2024-10-25',
      tamaño: '2.4 MB',
      formato: 'PDF',
      estado: 'Disponible'
    },  
    {
      id: 2,
      nombre: 'Porcentaje de votos por región',
      tipo: 'Resultados',
      descripcion: 'Porcentaje de votos por región',
      fecha: '2024-10-25',
      tamaño: '8.7 MB',
      formato: 'Excel',
      estado: 'Disponible'
    }
  ];

  const tiposReporte = [
    { id: 'todos', nombre: 'Todos los Reportes', count: 6 },
    { id: 'Estadístico', nombre: 'Estadísticos', count: 2 },
    { id: 'Resultados', nombre: 'Resultados', count: 1 },
    { id: 'Operativo', nombre: 'Operativos', count: 2 },
    { id: 'Auditoría', nombre: 'Auditoría', count: 1 },
  ];

  const reportesFiltrados = filtroTipo === 'todos' 
    ? reportesDisponibles 
    : reportesDisponibles.filter(r => r.tipo === filtroTipo);

  // Animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  };

  const listItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4
      }
    },
    hover: {
      scale: 1.02,
      backgroundColor: "rgba(249, 250, 251, 1)",
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <motion.div 
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <motion.div 
        variants={itemVariants}
        className="bg-gradient-to-r from-slate-600 to-slate-700 p-6 rounded-xl shadow-lg text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Centro de Reportes</h2>
            <p className="text-sm opacity-90">Generación y descarga de informes del sistema electoral</p>
          </div>
          <motion.button 
            className="flex items-center gap-2 px-6 py-3 bg-white text-slate-600 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <FileText size={18} />
            Generar Nuevo Reporte
          </motion.button>
        </div>
      </motion.div>

      {/* Estadísticas de Reportes */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { icon: FileText, color: 'slate', title: 'Total Reportes', value: '247', bgColor: 'slate' },
          { icon: Calendar, color: 'green', title: 'Generados Hoy', value: '12', bgColor: 'green' },
          { icon: Download, color: 'blue', title: 'Descargas', value: '1,458', bgColor: 'blue' },
          { icon: Calendar, color: 'purple', title: 'Programados', value: '8', bgColor: 'purple' }
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div 
              key={index}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className={`text-3xl font-bold text-${stat.color}-600 mt-2`}>{stat.value}</p>
                </div>
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Icon className={`text-${stat.color}-600`} size={32} />
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </div>




      {/* Lista de Reportes */}
      <motion.div 
        variants={cardVariants}
        className="bg-white rounded-xl shadow-sm border border-gray-200"
      >
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-800">
            {filtroTipo === 'todos' ? 'Todos los Reportes' : `Reportes de ${filtroTipo}`}
          </h3>
        </div>

        <div className="divide-y divide-gray-200">
          <AnimatePresence mode="wait">
            {reportesFiltrados.map((reporte, index) => (
              <motion.div 
                key={reporte.id}
                variants={listItemVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                whileHover="hover"
                className="p-6 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <motion.div 
                    className={`p-3 rounded-lg ${
                      reporte.formato === 'PDF' ? 'bg-red-100' : 'bg-green-100'
                    }`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <FileText className={
                      reporte.formato === 'PDF' ? 'text-red-600' : 'text-green-600'
                    } size={24} />
                  </motion.div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-lg font-bold text-gray-800">{reporte.nombre}</h4>
                        <p className="text-sm text-gray-600 mt-1">{reporte.descripcion}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-gray-500">Tipo: {reporte.tipo}</span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-500">Fecha: {reporte.fecha}</span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-500">Tamaño: {reporte.tamaño}</span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-500">Formato: {reporte.formato}</span>
                        </div>
                      </div>
                      <motion.span 
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          reporte.estado === 'Disponible' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200 }}
                      >
                        {reporte.estado}
                      </motion.span>
                    </div>

                    <AnimatePresence>
                      {reporte.estado === 'Disponible' && (
                        <motion.div 
                          className="flex gap-2 mt-4"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          {[
                            { icon: Download, label: 'Descargar', color: 'slate' },
                            { icon: Eye, label: 'Vista Previa', color: 'blue' },
                            { icon: Printer, label: 'Imprimir', color: 'gray' },
                            { icon: Mail, label: 'Enviar', color: 'gray' }
                          ].map((action, actionIndex) => (
                            <motion.button 
                              key={action.label}
                              className={`flex items-center gap-2 px-4 py-2 ${
                                action.color === 'slate' 
                                  ? 'bg-slate-600 text-white hover:bg-slate-700' 
                                  : action.color === 'blue'
                                    ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              } rounded-lg transition-colors text-sm`}
                              variants={buttonVariants}
                              whileHover="hover"
                              whileTap="tap"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: actionIndex * 0.1 }}
                            >
                              <action.icon size={16} />
                              {action.label}
                            </motion.button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Reportes;