import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, Database, FileUp, Settings, Users, TrendingUp, 
  LogOut, Menu, X, Vote, UserCheck, Building2, MapPinned,
  FileText, ShieldCheck, ClipboardList, Home, Zap,
  ChevronDown, ChevronRight, Bell, HelpCircle, Sun, Moon
} from 'lucide-react';
import { useState, useEffect } from 'react';

const Sidebar = ({ activeSection, setActiveSection, sidebarOpen, setSidebarOpen, onLogout }) => {
  const [expandedSections, setExpandedSections] = useState({
    'General': true,
    'Gestión Electoral': false,
    'Análisis de Datos': false,
    'Entrenamiento': false,
    'Administración': false
  });
  const [darkMode, setDarkMode] = useState(false);
  const [userData, setUserData] = useState(null);


  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userData');
    
    if (onLogout) {
      onLogout();
    }
    
    window.location.href = '/';
  };

  const toggleSection = (sectionTitle) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle]
    }));
  };

  const menuSections = [
    {
      title: 'General',
      icon: Home,
      items: [
        { 
          id: 'dashboard', 
          name: 'Inicio', 
          icon: Home,
          description: 'Vista general del sistema',
          badge: null
        },
      ]
    },
    {
      title: 'Gestión Electoral',
      icon: Vote,
      items: [
        { 
          id: 'candidatos', 
          name: 'Candidatos', 
          icon: UserCheck,
          description: 'Gestión de candidatos',
        },
      ]
    },
    {
      title: 'Análisis de Datos',
      icon: Database,
      items: [
        { 
          id: 'datos', 
          name: 'Gestión de Datos', 
          icon: Database,
          description: 'Base de datos principal',
          badge: null
        },
        { 
          id: 'carga', 
          name: 'Importar Datos', 
          icon: FileUp,
          description: 'Carga masiva de información',
          badge: 'Nuevo'
        },
        { 
          id: 'limpieza', 
          name: 'Detección de Fraudes', 
          icon: ShieldCheck,
          description: 'Análisis de seguridad',
          badge: '3'
        },
      ]
    },
    {
      title: 'Entrenamiento',
      icon: TrendingUp,
      items: [
        { 
          id: 'Entrenamiento', 
          name: 'Entrenamiento Modelo', 
          icon: Zap,
          description: 'Modelos de machine learning',
          badge: 'AI'
        },
        { 
          id: 'analisis', 
          name: 'Análisis Estadístico', 
          icon: TrendingUp,
          description: 'Estadísticas electorales',
          badge: null
        },
        { 
          id: 'visualizacion', 
          name: 'Visualización', 
          icon: BarChart3,
          description: 'Gráficos y reportes',
          badge: null
        },
      ]
    },
    {
      title: 'Administración',
      icon: Settings,
      items: [
        { 
          id: 'reportes', 
          name: 'Reportes', 
          icon: FileText,
          description: 'Generación de informes',
          badge: '5'
        }
      ]
    }
  ];

  const quickActions = [
    { icon: FileUp, label: 'Importar Datos', color: 'from-blue-500 to-cyan-500' },
    { icon: BarChart3, label: 'Ver Reportes', color: 'from-green-500 to-emerald-500' },
    { icon: Users, label: 'Nuevo Candidato', color: 'from-purple-500 to-pink-500' },
    { icon: ShieldCheck, label: 'Auditoría', color: 'from-orange-500 to-red-500' },
  ];

  const SidebarIcon = ({ icon: Icon, isActive, hasNotifications }) => (
    <div className="relative">
      <Icon size={20} />
      {hasNotifications && (
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></div>
      )}
    </div>
  );

  return (
    <motion.aside 
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className={`${sidebarOpen ? 'w-80' : 'w-20'} transition-all duration-300 flex flex-col relative overflow-hidden group`}
      style={{
        background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
        borderRight: '1px solid rgba(148, 163, 184, 0.2)'
      }}
    >
      {/* Efectos de fondo mejorados */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div 
          className="absolute top-0 left-0 rounded-full"
          style={{
            width: '320px',
            height: '320px',
            background: 'linear-gradient(45deg, #64748b, #94a3b8)',
            filter: 'blur(80px)'
          }}
        />
        <div 
          className="absolute bottom-0 right-0 rounded-full"
          style={{
            width: '280px',
            height: '280px',
            background: 'linear-gradient(45deg, #cbd5e1, #e2e8f0)',
            filter: 'blur(60px)'
          }}
        />
      </div>

      {/* Header del Sidebar */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative p-6 flex items-center justify-between border-b border-gray-200/50"
      >
        {sidebarOpen ? (
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg bg-white border border-gray-200 overflow-hidden">
              <img
                src="/Logo/icono.png"
                alt="Logo ONPE"
                className="w-10 h-10 object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                ONPE
              </h1>
              <p className="text-xs text-slate-500 font-medium">Sistema Electoral Inteligente</p>
            </div>
          </div>
        ) : (
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm bg-white mx-auto overflow-hidden">
            <img
              src="/Logo/icono.png"
              alt="ONPE"
              className="w-8 h-8 object-contain"
            />
          </div>
        )}
        
        <motion.button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 hover:bg-white/80 rounded-xl transition-all duration-200 text-slate-600 shadow-sm hover:shadow-md"
        >
          {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </motion.button>
      </motion.div>

      {/* Información del Usuario (solo cuando sidebar está expandido) */}
      <AnimatePresence>
        {sidebarOpen && userData && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="relative px-6 py-4 border-b border-gray-200/50 bg-white/50 backdrop-blur-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center shadow-lg">
                <UserCheck size={20} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 text-sm truncate">{userData.name}</p>
                <p className="text-xs text-slate-500 truncate">{userData.role}</p>
                <p className="text-xs text-slate-400">Último acceso: {userData.lastLogin}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Menú de Navegación */}
      <nav className="relative flex-1 p-4 overflow-y-auto custom-scrollbar">
        {menuSections.map((section, sectionIndex) => (
          <motion.div 
            key={section.title} 
            className="mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + sectionIndex * 0.05 }}
          >
            {/* Header de sección */}
            <button
              onClick={() => toggleSection(section.title)}
              className="w-full flex items-center justify-between px-2 py-3 rounded-lg hover:bg-white/50 transition-all group"
            >
              <div className="flex items-center gap-3">
                <section.icon size={18} className="text-slate-500" />
                {sidebarOpen && (
                  <span className="text-sm font-semibold text-slate-700">
                    {section.title}
                  </span>
                )}
              </div>
              {sidebarOpen && (
                <motion.div
                  animate={{ rotate: expandedSections[section.title] ? 0 : -90 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown size={16} className="text-slate-400" />
                </motion.div>
              )}
            </button>

            {/* Items de la sección */}
            <AnimatePresence>
              {expandedSections[section.title] && (
                <motion.ul 
                  className="space-y-1 mt-1"
                  initial={sidebarOpen ? { opacity: 0, height: 0 } : false}
                  animate={sidebarOpen ? { opacity: 1, height: 'auto' } : false}
                  exit={sidebarOpen ? { opacity: 0, height: 0 } : false}
                >
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;
                    return (
                      <motion.li 
                        key={item.id}
                        whileHover={{ x: 4 }}
                        layout
                      >
                        <button
                          onClick={() => setActiveSection(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                            isActive
                              ? 'text-white shadow-lg'
                              : 'text-slate-600 hover:bg-white/80 hover:text-slate-800 hover:shadow-md'
                          }`}
                          style={isActive ? {
                            background: 'linear-gradient(135deg, #475569 0%, #64748b 100%)',
                          } : {}}
                          title={!sidebarOpen ? `${item.name} - ${item.description}` : ''}
                        >
                          {isActive && (
                            <motion.div 
                              className="absolute inset-0"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              style={{
                                background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%)'
                              }}
                            />
                          )}
                          
                          <SidebarIcon 
                            icon={Icon} 
                            isActive={isActive}
                            hasNotifications={item.badge}
                          />
                          
                          {sidebarOpen && (
                            <>
                              <div className="flex-1 text-left min-w-0">
                                <span className="text-sm font-medium block truncate">{item.name}</span>
                                <span className="text-xs opacity-70 block truncate">{item.description}</span>
                              </div>
                              
                              {item.badge && (
                                <motion.span 
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className={`px-2 py-1 text-xs rounded-full ${
                                    isActive 
                                      ? 'bg-white/20 text-white' 
                                      : 'bg-slate-200 text-slate-700'
                                  }`}
                                >
                                  {item.badge}
                                </motion.span>
                              )}
                            </>
                          )}
                          
                          {isActive && (
                            <motion.div 
                              className="absolute right-2 w-1 h-6 bg-white/80 rounded-l-full"
                              initial={{ scaleY: 0 }}
                              animate={{ scaleY: 1 }}
                              transition={{ delay: 0.1 }}
                            />
                          )}
                        </button>
                      </motion.li>
                    );
                  })}
                </motion.ul>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </nav>

      {/* Footer del Sidebar */}
      <div className="relative p-4 border-t border-gray-200/50 space-y-2">
        {/* Botones de configuración */}
        {sidebarOpen && (
          <motion.div 
            className="flex gap-2 mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
          </motion.div>
        )}

        {/* Botón de Logout */}
        <motion.button 
          onClick={handleLogout}
          whileHover={{ x: sidebarOpen ? 0 : 4 }}
          className="w-full flex items-center gap-3 px-3 py-3 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all group relative overflow-hidden"
        >
          <motion.div
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.3 }}
          >
            <LogOut size={18} />
          </motion.div>
          {sidebarOpen && (
            <>
              <span className="text-sm font-medium">Cerrar Sesión</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </>
          )}
        </motion.button>

        {/* Versión del sistema */}
        {sidebarOpen && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-xs text-slate-400 pt-2"
          >
            v2.1.0 • ONPE Sistema
          </motion.p>
        )}
      </div>
    </motion.aside>
  );
};

export default Sidebar;