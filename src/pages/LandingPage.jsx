// sistema-electoral/src/pages/LandingPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { candidatosAPI, votantesAPI, votosPresidencialesAPI, votosRegionalesAPI, votosDistritalesAPI } from '../services/api';
import { Vote, CheckCircle, AlertCircle, Loader, User, MapPin, Phone, Mail, Shield, Lock, X, ChevronRight, FileText, Users, BarChart, Award, Globe, Zap, TrendingUp, ArrowRight, Star, Clock, Users2, Eye, Fingerprint, CheckSquare, MessageCircle, Send, RefreshCw } from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        dni: '',
        nombres: '',
        apellido_paterno: '',
        apellido_materno: '',
        nombre_completo: '',
        departamento: '',
        provincia: '',
        distrito: '',
        direccion: '',
        direccion_completa: '',
        ubigeo_reniec: '',
        ubigeo_sunat: '',
        ubigeo: [],
        telefono: '',
        email: '',
        candidato: ''
    });

    const [loading, setLoading] = useState(false);
    const [dniVerified, setDniVerified] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [showVotingForm, setShowVotingForm] = useState(false);
    const [formStep, setFormStep] = useState(1);
    const [selectedCandidates, setSelectedCandidates] = useState({
        presidencial: '',
        regional: '',
        distrital: ''
    });
    const [viewingProposals, setViewingProposals] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [activeTab, setActiveTab] = useState('presidencial');

    // Estado del Chatbot
    const [chatbotOpen, setChatbotOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState([
        {
            id: 1,
            type: 'bot',
            text: '¡Hola! Soy el Asistente Electoral ONPE 🤖. ¿Cómo puedo ayudarte hoy?',
            timestamp: new Date()
        }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    // Respuestas predefinidas del chatbot
    const chatbotResponses = {
        'hola': '👋 ¡Hola! Bienvenido al Sistema de Votación Virtual de la ONPE. Estoy aquí para ayudarte con todo lo relacionado al proceso electoral. ¿Qué deseas saber hoy?',

        'cómo votar': '🗳️ Para emitir tu voto sigue estos pasos:\n1️⃣ Haz clic en el botón "Votar Aquí".\n2️⃣ Ingresa tu número de DNI.\n3️⃣ Verifica que tus datos personales sean correctos.\n4️⃣ Elige a tus candidatos en las categorías disponibles (presidencial, regional o distrital).\n5️⃣ Confirma tu selección para registrar tu voto.\n¡Y listo! Tu participación quedará registrada de forma segura.',

        'requisitos': '📋 Para poder votar necesitas:\n- Ser ciudadano(a) peruano(a).\n- Tener 18 años cumplidos.\n- Contar con un DNI vigente.\nSi cumples con estos requisitos, podrás participar en el proceso electoral sin problemas.',

        'candidatos': '👥 En esta plataforma podrás consultar a los candidatos presidenciales, regionales y distritales. Cada perfil incluye su foto, partido político y principales propuestas. Te recomiendo revisarlos antes de emitir tu voto.',

        'seguridad': '🔐 La seguridad es nuestra prioridad. El sistema utiliza **cifrado AES-256**, **autenticación biométrica** y conexiones **seguras (HTTPS)** para proteger tus datos. Además, todos los votos son **anónimos e inalterables**.',

        'horario': '🕒 La plataforma de votación está disponible las 24 horas del día durante el periodo electoral oficial. Recuerda ingresar y votar antes de la fecha límite establecida por la ONPE.',

        'ayuda': '💡 Puedo asistirte con la siguiente información:\n- Cómo votar\n- Requisitos para votar\n- Información de candidatos\n- Seguridad del sistema\n- Horarios de votación\n- Contacto con soporte\n¿Sobre qué tema te gustaría saber más?',

        'contacto': '📞 Si necesitas asistencia personalizada, comunícate con nuestro equipo de soporte:\n- Línea gratuita: 0800-12345\n- Correo: soporte@onpe.gob.pe\n- Horario de atención: Lunes a domingo, de 8:00 a.m. a 8:00 p.m.\n¿Deseas que te ayude con algo más?'
    };

    // 🔍 Función que detecta el mensaje del usuario y busca coincidencias
    function getChatbotResponse(userInput) {
        const input = userInput.toLowerCase().trim();

        // Palabras clave asociadas a cada tema
        const keywords = {
            'hola': ['hola', 'buenos días', 'buenas tardes', 'hey', 'saludos'],
            'cómo votar': ['votar', 'emitir voto', 'cómo votar', 'quiero votar', 'proceso de votación'],
            'requisitos': ['requisitos', 'qué necesito', 'condiciones', 'puedo votar', 'edad mínima'],
            'candidatos': ['candidatos', 'postulantes', 'ver candidatos', 'lista de candidatos', 'presidenciales', 'regionales', 'distritales'],
            'seguridad': ['seguridad', 'protegido', 'datos', 'cifrado', 'privacidad'],
            'horario': ['horario', 'hora', 'cuándo puedo votar', 'disponible', 'tiempo'],
            'ayuda': ['ayuda', 'asistencia', 'soporte', 'no entiendo', 'qué puedo hacer'],
            'contacto': ['contacto', 'llamar', 'correo', 'soporte', 'teléfono']
        };

        // Buscar coincidencia por palabra clave
        for (const key in keywords) {
            if (keywords[key].some(word => input.includes(word))) {
                return chatbotResponses[key];
            }
        }

        // Respuesta por defecto si no se entiende el mensaje
        return '🤔 Lo siento, no entendí tu consulta. Puedes pedirme ayuda escribiendo "ayuda" o decirme sobre qué tema deseas información (por ejemplo, "requisitos" o "cómo votar").';
    }

    // Función para enviar mensaje en el chatbot
    const handleSendMessage = () => {
        if (!chatInput.trim()) return;

        // Agregar mensaje del usuario
        const userMessage = {
            id: chatMessages.length + 1,
            type: 'user',
            text: chatInput,
            timestamp: new Date()
        };

        setChatMessages(prev => [...prev, userMessage]);
        setChatInput('');
        setIsTyping(true);

        // Simular respuesta del bot con delay
        setTimeout(() => {
            const botResponse = {
                id: chatMessages.length + 2,
                type: 'bot',
                text: getChatbotResponse(chatInput),
                timestamp: new Date()
            };
            setChatMessages(prev => [...prev, botResponse]);
            setIsTyping(false);
        }, 800);
    };

    // Animaciones mejoradas
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.6,
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
                duration: 0.5,
                ease: "easeOut"
            }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.4,
                ease: "easeOut"
            }
        },
        hover: {
            y: -5,
            scale: 1.02,
            transition: {
                duration: 0.2,
                ease: "easeOut"
            }
        }
    };

    const modalVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.3,
                type: "spring",
                damping: 25,
                stiffness: 500
            }
        },
        exit: {
            opacity: 0,
            scale: 0.8,
            transition: {
                duration: 0.2
            }
        }
    };

    const stepVariants = {
        hidden: { opacity: 0, x: 50 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.5,
                ease: "easeOut"
            }
        },
        exit: {
            opacity: 0,
            x: -50,
            transition: {
                duration: 0.3
            }
        }
    };

    // Candidatos por tipo de elección con imágenes reales y logos de partidos
    const [candidatos, setCandidatos] = useState({
        presidencial: [],
        regional: [],
        distrital: []
    });
    const [loadingCandidatos, setLoadingCandidatos] = useState(true);

    // src/pages/LandingPage.jsx

    useEffect(() => {
        const cargarCandidatos = async () => {
            try {
                setLoadingCandidatos(true);
                const response = await candidatosAPI.getAll();

                console.log('📋 Response completo:', response);
                console.log('🔍 Estructura del response:', Object.keys(response));

                // ✅ CORRECCIÓN: El backend devuelve { success: true, data: [...] }
                let candidatosData = null;

                // Primero verificar si hay response.data (Axios wrapper)
                if (response.data) {
                    // Verificar si response.data tiene la estructura del backend { success, data }
                    if (response.data.success && Array.isArray(response.data.data)) {
                        candidatosData = response.data.data;
                        console.log('✅ Array encontrado en response.data.data');
                    }
                    // Si response.data es directamente un array
                    else if (Array.isArray(response.data)) {
                        candidatosData = response.data;
                        console.log('✅ Array encontrado en response.data');
                    }
                }
                // Si response es directamente el objeto del backend
                else if (response.success && Array.isArray(response.data)) {
                    candidatosData = response.data;
                    console.log('✅ Array encontrado en response.data (directo)');
                }
                // Si response es directamente un array
                else if (Array.isArray(response)) {
                    candidatosData = response;
                    console.log('✅ Response es directamente el array');
                }

                // Si no encontramos array, usar array vacío
                if (!candidatosData || !Array.isArray(candidatosData)) {
                    console.error('❌ No se pudo encontrar array de candidatos en:', response);
                    candidatosData = [];
                }

                console.log('📋 Candidatos cargados:', candidatosData);
                console.log('🔢 Cantidad de candidatos:', candidatosData.length);

                // Agrupar candidatos por tipo de elección
                const candidatosPorTipo = {
                    presidencial: [],
                    regional: [],
                    distrital: []
                };

                candidatosData.forEach(candidato => {
                    const tipo = candidato.tipoEleccion?.toLowerCase() || candidato.tipo_eleccion?.toLowerCase();

                    // Mapear el candidato al formato que espera el componente
                    const candidatoMapeado = {
                        id: candidato.id,
                        nombre: candidato.nombre || candidato.name,
                        partido: candidato.partido || candidato.party,
                        color: obtenerColorPorPartido(candidato.partido || candidato.party),
                        photo: candidato.imageUrl || candidato.image_url || 'https://via.placeholder.com/150',
                        logo: candidato.logoPartido || candidato.logo || generarLogoPartido(candidato.partido || candidato.party),
                        propuestas: formatearPropuestas(candidato.propuestas || candidato.proposals),
                        experiencia: candidato.experiencia || 'Candidato registrado',
                        educacion: candidato.educacion || 'Información no disponible'
                    };

                    if (tipo === 'presidencial') {
                        candidatosPorTipo.presidencial.push(candidatoMapeado);
                    } else if (tipo === 'regional') {
                        candidatosPorTipo.regional.push(candidatoMapeado);
                    } else if (tipo === 'distrital') {
                        candidatosPorTipo.distrital.push(candidatoMapeado);
                    }
                });

                console.log('✅ Candidatos agrupados:', candidatosPorTipo);
                setCandidatos(candidatosPorTipo);
                setLoadingCandidatos(false);

            } catch (error) {
                console.error('❌ Error al cargar candidatos:', error);
                setLoadingCandidatos(false);
                setError('No se pudieron cargar los candidatos. Por favor, recarga la página.');
            }
        };

        cargarCandidatos();
    }, []);

    // 5️⃣ Funciones auxiliares para mapear datos
    const obtenerColorPorPartido = (partido) => {
        const coloresPorPartido = {
            'Perú Libre': 'red',
            'Fuerza Popular': 'orange',
            'Renovación Popular': 'blue',
            'Avanza País': 'purple',
            'Frente Regional': 'teal',
            'Unidad Regional': 'orange',
            'Desarrollo Regional': 'cyan',
            'Fuerza Regional': 'pink',
            'Partido Distrital': 'indigo',
            'Movimiento Vecinal': 'yellow',
            'Unidad Distrital': 'lime',
            'Frente Distrital': 'amber'
        };

        return coloresPorPartido[partido] || 'slate';
    };

    const generarLogoPartido = (partido) => {
        // Generar un placeholder con las iniciales del partido
        const iniciales = partido.split(' ').map(p => p[0]).join('').substring(0, 2);
        return `https://placehold.co/40x40/4F46E5/white?text=${iniciales}`;
    };

    const formatearPropuestas = (propuestas) => {
        if (!propuestas) return 'Sin propuestas registradas';

        if (Array.isArray(propuestas)) {
            // Si es un array de objetos con estructura compleja
            if (propuestas.length > 0 && typeof propuestas[0] === 'object') {
                return propuestas.map((p, i) =>
                    `${i + 1}. ${p.titulo || p.descripcion || 'Propuesta sin título'}`
                ).join('\n');
            }
            // Si es un array simple de strings
            return propuestas.map((p, i) => `${i + 1}. ${p}`).join('\n');
        }

        if (typeof propuestas === 'string') {
            try {
                // Intentar parsear si es JSON string
                const parsed = JSON.parse(propuestas);
                return formatearPropuestas(parsed);
            } catch {
                return propuestas;
            }
        }

        return 'Sin propuestas registradas';
    };

    // Componente mejorado para la tarjeta del candidato
    const CandidateCard = ({ type, candidate, isSelected, onSelect, onViewProposals }) => (
        <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            className={`relative border-2 rounded-xl overflow-hidden transition-all cursor-pointer ${isSelected
                ? `border-${candidate.color}-500 shadow-xl`
                : 'border-gray-200 hover:border-gray-300 hover:shadow-md bg-white'
                }`}
            onClick={() => onSelect(candidate)}
        >
            <div className={`h-2 bg-gradient-to-r from-${candidate.color}-400 to-${candidate.color}-600`}></div>
            <div className="p-6">
                <div className="flex items-center gap-4">
                    {/* Logo del partido a la izquierda */}
                    <div className="flex-shrink-0">
                        <img
                            src={candidate.logo}
                            alt={`Logo de ${candidate.partido}`}
                            className="w-14 h-14 rounded-xl object-contain bg-white p-1.5 border border-gray-200 shadow-sm"
                        />
                    </div>

                    {/* Contenido del candidato en el centro */}
                    <div className="flex-1 min-w-0">
                        <h5 className="font-bold text-gray-900 text-lg mb-1 truncate">{candidate.nombre}</h5>
                        <p className="text-sm text-gray-600 mb-2 font-medium">
                            {candidate.partido}
                        </p>
                        <div className="flex items-center justify-between">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onViewProposals(candidate);
                                }}
                                className="flex items-center gap-1 text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                            >
                                <FileText size={14} />
                                Ver Propuestas
                            </motion.button>
                            {isSelected && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                                    className={`bg-${candidate.color}-100 p-1.5 rounded-full`}
                                >
                                    <CheckCircle className={`text-${candidate.color}-600 flex-shrink-0`} size={18} />
                                </motion.div>
                            )}
                        </div>
                    </div>

                    {/* Foto del candidato a la derecha */}
                    <div className="relative flex-shrink-0">
                        <motion.img
                            whileHover={{ scale: 1.1 }}
                            transition={{ duration: 0.2 }}
                            src={candidate.photo}
                            alt={candidate.nombre}
                            className="w-20 h-20 rounded-xl object-cover border-2 border-gray-200 shadow-sm"
                        />
                    </div>
                </div>
            </div>
        </motion.div>
    );

    // Componente mejorado para el modal de propuestas
    const PropuestasModal = ({ candidate, onClose }) => {
        // Mapeo de colores a valores CSS
        const colorMap = {
            'red': '#EF4444',
            'orange': '#F97316',
            'blue': '#3B82F6',
            'purple': '#A855F7',
            'teal': '#14B8A6',
            'cyan': '#06B6D4',
            'pink': '#EC4899',
            'indigo': '#6366F1',
            'yellow': '#EAB308',
            'lime': '#84CC16',
            'amber': '#F59E0B'
        };

        const headerColor = colorMap[candidate.color] || '#3B82F6';

        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
            >
                <motion.div
                    variants={modalVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                >
                    <div style={{ background: `linear-gradient(to right, ${headerColor}, ${headerColor}dd)` }} className="p-8 text-white">
                        <div className="flex justify-between items-start gap-4">
                            <div className="flex items-center gap-6 flex-1">
                                <motion.img
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.1, type: "spring", stiffness: 500, damping: 15 }}
                                    src={candidate.photo}
                                    alt={candidate.nombre}
                                    className="w-24 h-24 rounded-xl object-cover border-4 border-white/70 flex-shrink-0"
                                />
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="flex-1 min-w-0"
                                >
                                    <h2 className="text-3xl font-bold mb-2 break-words">{candidate.nombre}</h2>
                                    <p className="text-base opacity-95 flex items-center gap-2 flex-wrap">
                                        <img src={candidate.logo} alt="" className="w-6 h-6 rounded-full flex-shrink-0" />
                                        <span>{candidate.partido}</span>
                                    </p>
                                </motion.div>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={onClose}
                                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all flex-shrink-0"
                            >
                                <X size={28} />
                            </motion.button>
                        </div>
                    </div>
                    <div className="p-8">
                        <motion.h4
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2"
                        >
                            <FileText size={22} style={{ color: headerColor }} />
                            Plan de Gobierno
                        </motion.h4>
                        <div className="space-y-3 mb-6">
                            {candidate.propuestas.split('\n').map((propuesta, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 + index * 0.1 }}
                                    className="flex items-start gap-3"
                                >
                                    <div style={{ backgroundColor: `${headerColor}22` }} className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span style={{ color: headerColor }} className="text-xs font-bold">{index + 1}</span>
                                    </div>
                                    <p className="text-gray-700 text-sm leading-relaxed">{propuesta}</p>
                                </motion.div>
                            ))}
                        </div>

                        {candidate.experiencia && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="mb-5 p-4 bg-gray-50 rounded-lg"
                            >
                                <h5 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                    <Award size={18} style={{ color: headerColor }} />
                                    Experiencia
                                </h5>
                                <p className="text-gray-700 text-sm leading-relaxed">{candidate.experiencia}</p>
                            </motion.div>
                        )}

                        {candidate.educacion && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="mb-6 p-4 bg-gray-50 rounded-lg"
                            >
                                <h5 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                    <Users size={18} style={{ color: headerColor }} />
                                    Educación
                                </h5>
                                <p className="text-gray-700 text-sm leading-relaxed">{candidate.educacion}</p>
                            </motion.div>
                        )}

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            className="pt-6 border-t border-gray-200"
                        >
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={onClose}
                                className="w-full px-4 py-3 rounded-xl font-medium transition-colors text-white"
                                style={{ backgroundColor: headerColor }}
                            >
                                Cerrar
                            </motion.button>
                        </motion.div>
                    </div>
                </motion.div>
            </motion.div>
        );
    };

    // Componente mejorado para el modal de éxito
    const SuccessModal = () => {
        const votosEmitidos = [
            selectedCandidates.presidencial && 'Presidencial',
            selectedCandidates.regional && 'Regional',
            selectedCandidates.distrital && 'Distrital'
        ].filter(Boolean);

        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
            >
                <motion.div
                    variants={modalVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
                >
                    <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white text-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500, damping: 15, delay: 0.1 }}
                            className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4"
                        >
                            <CheckCircle className="text-green-500" size={40} />
                        </motion.div>
                        <motion.h3
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-2xl font-bold mb-2"
                        >
                            ¡Voto Registrado con Éxito!
                        </motion.h3>
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-sm opacity-90"
                        >
                            Su participación ha sido registrada en el sistema electoral
                        </motion.p>
                    </div>
                    <div className="p-6">
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-gray-700 mb-4"
                        >
                            Gracias por ejercer su derecho al voto. Su participación es fundamental para fortalecer nuestra democracia.
                        </motion.p>

                        {/* Mostrar detalle de votos */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <p className="text-sm font-semibold text-gray-700 mb-2">Votos registrados:</p>
                            <div className="space-y-2">
                                {votosEmitidos.map((tipo, index) => (
                                    <motion.div
                                        key={tipo}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 + index * 0.1 }}
                                        className="flex items-center gap-2 text-sm text-gray-600"
                                    >
                                        <CheckCircle className="text-green-500" size={16} />
                                        <span>{tipo}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="flex items-center justify-center gap-2 mb-4"
                        >
                            <Fingerprint className="text-gray-500" size={16} />
                            <span className="text-xs text-gray-500">ID de Voto: {Math.random().toString(36).substring(2, 15).toUpperCase()}</span>
                        </motion.div>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={closeSuccessModal}
                            className="w-full px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-xl hover:from-slate-700 hover:to-slate-800 transition-all font-medium"
                        >
                            Cerrar
                        </motion.button>
                    </div>
                </motion.div>
            </motion.div>
        );
    };

    const handleDniChange = async (e) => {
        const dni = e.target.value.replace(/\D/g, '').slice(0, 8);
        setFormData(prev => ({ ...prev, dni }));
        setError('');
        setDniVerified(false);

        if (dni.length === 8) {
            await verificarDNI(dni);
        }
    };

    const verificarDNI = async (dni) => {
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`https://api.factiliza.com/v1/dni/info/${dni}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzOTg0OSIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6ImNvbnN1bHRvciJ9.Zjah1AYn78eK3rXfNWNSoDjxt9sSGwuYU48vRD7W8lA`
                }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('DNI no encontrado en los registros. Por favor, verifica el número.');
                }
                throw new Error(`Error del servidor: ${response.statusText} (Código: ${response.status})`);
            }

            const result = await response.json();

            if (result.success) {
                const data = result.data;

                setFormData(prev => ({
                    ...prev,
                    dni: data.numero,
                    nombres: data.nombres,
                    apellido_paterno: data.apellido_paterno,
                    apellido_materno: data.apellido_materno,
                    nombre_completo: data.nombre_completo,
                    departamento: data.departamento,
                    provincia: data.provincia,
                    distrito: data.distrito,
                    direccion: data.direccion,
                    direccion_completa: data.direccion_completa,
                    ubigeo_reniec: data.ubigeo_reniec,
                    ubigeo_sunat: data.ubigeo_sunat,
                    ubigeo: data.ubigeo
                }));
                setDniVerified(true);
                setError('');
            } else {
                setError(result.message || 'No se pudieron obtener los datos del DNI.');
                setDniVerified(false);
            }
        } catch (err) {
            setError(err.message || 'Error al conectar con el servicio de verificación. Intenta nuevamente.');
            setDniVerified(false);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleContinue = () => {
        if (formStep === 1) {
            setFormStep(2);
        }
    };

    const handleCandidateSelection = (candidate) => {
        console.log("🎯 Candidato clickeado:", candidate);

        // Determinar el tipo de elección basado en la lista de candidatos
        let type = '';
        if (candidatos.presidencial.some(c => c.id === candidate.id)) {
            type = 'presidencial';
            console.log("✅ Tipo: Presidencial");
        } else if (candidatos.regional.some(c => c.id === candidate.id)) {
            type = 'regional';
            console.log("✅ Tipo: Regional");
        } else if (candidatos.distrital.some(c => c.id === candidate.id)) {
            type = 'distrital';
            console.log("✅ Tipo: Distrital");
        } else {
            console.log("❌ No se pudo determinar el tipo de candidato");
            return;
        }

        if (type) {
            setSelectedCandidates(prev => {
                const newSelection = {
                    ...prev,
                    [type]: prev[type] === candidate.id ? '' : candidate.id  // ← Cambiar a ID
                };
                console.log("🔄 Nuevo selectedCandidates:", newSelection);
                return newSelection;
            });
        }
    };

    const handleSubmit = async () => {
        console.log("🔍 DEBUG - selectedCandidates:", selectedCandidates);

        if (!Object.values(selectedCandidates).some(c => c !== '')) {
            setError('Debes seleccionar al menos un candidato');
            return;
        }

        if (!dniVerified) {
            setError('Debes verificar tu DNI primero');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // ✅ Payload para votante
            const votantePayload = {
                dni: formData.dni.trim(),
                nombres: (formData.nombres || "Ciudadano").trim(),
                apellido_paterno: (formData.apellido_paterno || "Anónimo").trim(),
                apellido_materno: (formData.apellido_materno || "Virtual").trim(),
                departamento: (formData.departamento || "LIMA").trim(),
                provincia: (formData.provincia || "LIMA").trim(),
                distrito: (formData.distrito || "LIMA").trim(),
                direccion: formData.direccion?.trim() || null,
                direccion_completa: formData.direccion_completa?.trim() || null,
                ubigeo_reniec: formData.ubigeo_reniec || null,
                ubigeo_sunat: formData.ubigeo_sunat || null,
                telefono: formData.telefono?.trim() || null,
                email: formData.email?.trim() || null,
                estado: 'Activo'
            };

            console.log("📤 PAYLOAD VOTANTE:", JSON.stringify(votantePayload, null, 2));

            const votanteResponse = await votantesAPI.create(votantePayload);
            const votanteCreado = votanteResponse.data;

            console.log("✅ VOTANTE CREADO:", votanteCreado);

            // ✅ CORRECCIÓN: Obtener el ID del votante correctamente
            const votanteId = votanteCreado.data?.id || votanteCreado.id;

            if (!votanteId) {
                throw new Error("No se pudo obtener el ID del votante creado");
            }

            console.log("🆔 Votante ID:", votanteId);

            // ✅ Registrar votos
            const votosPromises = [];

            // PRESIDENCIAL
            if (selectedCandidates.presidencial) {
                const candidato = candidatos.presidencial.find(c => c.id === selectedCandidates.presidencial);
                if (candidato) {
                    console.log("🗳️ Registrando voto presidencial...");
                    const votoPayload = {
                        votante_id: votanteId,  // ✅ UUID
                        candidato_id: candidato.id,  // ✅ UUID
                        dni_votante: formData.dni.trim(),
                        departamento: formData.departamento || "LIMA",
                        provincia: formData.provincia || "LIMA",
                        distrito: formData.distrito || "LIMA"
                    };
                    console.log("📤 Voto presidencial payload:", votoPayload);
                    votosPromises.push(
                        votosPresidencialesAPI.create(votoPayload).catch(err => {
                            console.error("❌ Error voto presidencial:", err.response?.data);
                            throw err;
                        })
                    );
                } else {
                    console.error("❌ No se encontró candidato presidencial con ID:", selectedCandidates.presidencial);
                }
            }

            // REGIONAL
            if (selectedCandidates.regional) {
                const candidato = candidatos.regional.find(c => c.id === selectedCandidates.regional);
                if (candidato) {
                    console.log("🗳️ Registrando voto regional...");
                    const votoPayload = {
                        votante_id: votanteId,  // ✅ UUID
                        candidato_id: candidato.id,  // ✅ UUID
                        dni_votante: formData.dni.trim(),
                        departamento: formData.departamento || "LIMA",
                        provincia: formData.provincia || "LIMA",
                        distrito: formData.distrito || "LIMA"
                    };
                    console.log("📤 Voto regional payload:", votoPayload);
                    votosPromises.push(
                        votosRegionalesAPI.create(votoPayload).catch(err => {
                            console.error("❌ Error voto regional:", err.response?.data);
                            throw err;
                        })
                    );
                } else {
                    console.error("❌ No se encontró candidato regional con ID:", selectedCandidates.regional);
                }
            }

            // DISTRITAL
            if (selectedCandidates.distrital) {
                const candidato = candidatos.distrital.find(c => c.id === selectedCandidates.distrital);
                if (candidato) {
                    console.log("🗳️ Registrando voto distrital...");
                    const votoPayload = {
                        votante_id: votanteId,  // ✅ UUID
                        candidato_id: candidato.id,  // ✅ UUID
                        dni_votante: formData.dni.trim(),
                        departamento: formData.departamento || "LIMA",
                        provincia: formData.provincia || "LIMA",
                        distrito: formData.distrito || "LIMA"
                    };
                    console.log("📤 Voto distrital payload:", votoPayload);
                    votosPromises.push(
                        votosDistritalesAPI.create(votoPayload).catch(err => {
                            console.error("❌ Error voto distrital:", err.response?.data);
                            throw err;
                        })
                    );
                } else {
                    console.error("❌ No se encontró candidato distrital con ID:", selectedCandidates.distrital);
                }
            }

            // ✅ Esperar a que todos los votos se registren
            if (votosPromises.length > 0) {
                console.log(`⏳ Esperando ${votosPromises.length} votos...`);
                await Promise.all(votosPromises);
                console.log("✅ TODOS LOS VOTOS REGISTRADOS");
            } else {
                console.log("⚠️ No se seleccionaron candidatos para votar");
            }

            console.log("✅ PROCESO COMPLETADO - Votante y votos registrados");
            setShowSuccessModal(true);

        } catch (err) {
            console.error("❌ ERROR:", err);
            console.error("❌ Response:", err.response?.data);
            console.error("❌ Status:", err.response?.status);

            // Extraer mensaje de error detallado
            let errorMsg = 'Error al registrar. Por favor, intenta nuevamente.';

            if (err.response?.data?.detail) {
                if (Array.isArray(err.response.data.detail)) {
                    // Error de validación de Pydantic
                    errorMsg = err.response.data.detail.map(e =>
                        `${e.loc?.join('.')}: ${e.msg}`
                    ).join(', ');
                } else if (typeof err.response.data.detail === 'string') {
                    errorMsg = err.response.data.detail;
                }
            }

            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };
    const closeModal = () => {
        setShowVotingForm(false);
        setError('');
        setSuccess(false);
        setFormStep(1);
        setSelectedCandidates({
            presidencial: '',
            regional: '',
            distrital: ''
        });
        setViewingProposals(null);
        setFormData({
            dni: '',
            nombres: '',
            apellido_paterno: '',
            apellido_materno: '',
            nombre_completo: '',
            departamento: '',
            provincia: '',
            distrito: '',
            direccion: '',
            direccion_completa: '',
            ubigeo_reniec: '',
            ubigeo_sunat: '',
            ubigeo: [],
            telefono: '',
            email: '',
            candidato: ''
        });
        setDniVerified(false);
    };

    const closeSuccessModal = () => {
        setShowSuccessModal(false);
        // Opcional: también cerrar el formulario de votación o resetear el formulario
        closeModal();
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100"
        >
            {/* Header mejorado */}
            <motion.header
                variants={itemVariants}
                className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40"
            >
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <motion.div
                                whileHover={{ scale: 1.05, rotate: 5 }}
                                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg overflow-hidden bg-white"
                            >
                                {/* Logo importado desde la carpeta public */}
                                <img
                                    src="/Logo/icono.png"
                                    alt="Logo ONPE"
                                    className="w-full h-full object-contain"
                                />
                            </motion.div>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-600 to-slate-700 bg-clip-text text-transparent">
                                    ONPE - Sistema de Votación
                                </h1>
                                <p className="text-sm text-gray-600">Elecciones Generales 2024</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg border border-green-200"
                            >
                                <Shield className="text-green-600" size={20} />
                                <span className="text-sm font-medium text-green-800">Sistema Seguro</span>
                            </motion.div>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/login')}
                                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-lg hover:from-slate-700 hover:to-slate-800 transition-all font-medium shadow-lg"
                            >
                                <Lock size={18} />
                                Acceso Admin
                            </motion.button>
                        </div>
                    </div>
                </div>
            </motion.header>

            {/* Hero Section mejorada */}
            <section className="relative overflow-hidden py-16">
                <div className="absolute inset-0 bg-gradient-to-r from-slate-600/5 to-slate-700/5"></div>
                <div className="max-w-7xl mx-auto px-4 relative">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="text-center mb-12"
                    >
                        <motion.h2
                            variants={itemVariants}
                            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
                        >
                            Emite tu Voto de Forma
                            <span className="bg-gradient-to-r from-slate-600 to-slate-700 bg-clip-text text-transparent"> Segura y Rápida</span>
                        </motion.h2>
                        <motion.p
                            variants={itemVariants}
                            className="text-xl text-gray-600 max-w-2xl mx-auto"
                        >
                            Cuando el pueblo confía, el país avanza; y cuando el país avanza, el pueblo vuelve a confiar. Así se construye el Perú que todos soñamos.
                        </motion.p>
                    </motion.div>

                    {/* Estadísticas mejoradas */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
                    >
                        {[
                            { icon: User, color: 'blue', number: '125,430', text: 'Votantes Registrados', change: '+12.5%' },
                            { icon: CheckCircle, color: 'green', number: '89,234', text: 'Votos Emitidos', change: '+18.2%' },
                            { icon: Shield, color: 'slate', number: '100%', text: 'Sistema Seguro', change: 'Verificado' }
                        ].map((stat, index) => (
                            <motion.div
                                key={stat.text}
                                variants={itemVariants}
                                whileHover={{ scale: 1.05, y: -5 }}
                                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 text-center"
                            >
                                <div className={`w-12 h-12 bg-${stat.color}-100 rounded-xl flex items-center justify-center mx-auto mb-3`}>
                                    <stat.icon className={`text-${stat.color}-600`} size={24} />
                                </div>
                                <p className="text-3xl font-bold text-gray-900">{stat.number}</p>
                                <p className="text-sm text-gray-600 mt-1">{stat.text}</p>
                                <div className="flex items-center justify-center mt-2">
                                    <TrendingUp className="text-green-500" size={14} />
                                    <span className="text-xs text-green-500 ml-1">{stat.change}</span>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Botón de Votar Ahora mejorado */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="text-center"
                    >
                        <motion.button
                            whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowVotingForm(true)}
                            className="px-8 py-4 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-xl hover:from-slate-700 hover:to-slate-800 transition-all font-bold text-lg shadow-lg"
                        >
                            <Vote size={24} className="inline mr-2" />
                            Vote Aqui
                        </motion.button>
                    </motion.div>
                </div>
            </section>

            {/* Sección de Proceso Electoral mejorada */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Proceso Electoral Simplificado</h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Hemos diseñado un proceso sencillo y transparente para garantizar tu participación
                        </p>
                    </motion.div>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-4 gap-6"
                    >
                        {[
                            { number: '1', title: 'Verificación', description: 'Verifica tu identidad con tu DNI a través de nuestro sistema seguro', icon: Fingerprint },
                            { number: '2', title: 'Selección', description: 'Revisa los perfiles de los candidatos y sus propuestas', icon: Eye },
                            { number: '3', title: 'Votación', description: 'Selecciona tus candidatos de forma segura y confidencial', icon: Vote },
                            { number: '4', title: 'Confirmación', description: 'Voto Enviado con Exito', icon: CheckSquare }
                        ].map((step, index) => (
                            <motion.div
                                key={step.number}
                                variants={itemVariants}
                                whileHover={{ scale: 1.05 }}
                                className="text-center"
                            >
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4"
                                >
                                    <step.icon className="text-slate-600" size={24} />
                                </motion.div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                                <p className="text-sm text-gray-600">{step.description}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Sección de Candidatos Destacados mejorada */}
            <section className="py-16 bg-gradient-to-br from-gray-50 to-gray-100 z-10 relative">
                <div className="max-w-7xl mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Conoce a los Candidatos</h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Revisa las propuestas de los principales candidatos para tomar una decisión informada
                        </p>
                    </motion.div>

                    {/* Pestañas de navegación */}
                    <div className="flex justify-center mb-8">
                        <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-xl shadow-md p-1 inline-flex">
                            {[
                                { id: 'presidencial', label: 'Presidencial', icon: Vote },
                                { id: 'regional', label: 'Regional', icon: MapPin },
                                { id: 'distrital', label: 'Distrital', icon: User }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-6 py-3 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === tab.id
                                        ? 'bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-md'
                                        : 'text-black-600 hover:text-black-900'
                                        }`}
                                >
                                    <tab.icon size={16} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Mostrar loading o candidatos */}
                    {loadingCandidatos ? (
                        <div className="text-center py-16">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="inline-block"
                            >
                                <RefreshCw className="text-slate-600" size={48} />
                            </motion.div>
                            <p className="text-gray-600 mt-4 text-lg">Cargando candidatos...</p>
                        </div>
                    ) : candidatos[activeTab].length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                            <Users size={64} className="mx-auto text-gray-300 mb-4" />
                            <h3 className="text-xl font-bold text-gray-600 mb-2">
                                No hay candidatos {activeTab}es registrados
                            </h3>
                            <p className="text-gray-500">
                                Los candidatos aparecerán aquí una vez sean registrados en el sistema
                            </p>
                        </div>
                    ) : (
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                        >
                            {candidatos[activeTab].slice(0, 4).map((candidato, index) => {
                                const getGradientClass = (color) => {
                                    const gradientMap = {
                                        red: 'bg-gradient-to-r from-red-400 to-red-600',
                                        orange: 'bg-gradient-to-r from-orange-400 to-orange-600',
                                        blue: 'bg-gradient-to-r from-blue-400 to-blue-600',
                                        purple: 'bg-gradient-to-r from-purple-400 to-purple-600',
                                        teal: 'bg-gradient-to-r from-teal-400 to-teal-600',
                                        cyan: 'bg-gradient-to-r from-cyan-400 to-cyan-600',
                                        pink: 'bg-gradient-to-r from-pink-400 to-pink-600',
                                        indigo: 'bg-gradient-to-r from-indigo-400 to-indigo-600',
                                        yellow: 'bg-gradient-to-r from-yellow-400 to-yellow-600',
                                        lime: 'bg-gradient-to-r from-lime-400 to-lime-600',
                                        amber: 'bg-gradient-to-r from-amber-400 to-amber-600',
                                        slate: 'bg-gradient-to-r from-slate-400 to-slate-600'
                                    };
                                    return gradientMap[color] || 'bg-gradient-to-r from-gray-400 to-gray-600';
                                };

                                const gradientClass = getGradientClass(candidato.color);

                                return (
                                    <motion.div
                                        key={candidato.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.1, duration: 0.4 }}
                                        whileHover={{ y: -8, scale: 1.03 }}
                                        className="bg-white bg-opacity-90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300"
                                    >
                                        {/* Barra de color superior */}
                                        <div className={`h-3 ${gradientClass}`}></div>

                                        <div className="p-5">
                                            <div className="flex flex-col items-center mb-4">
                                                <div className="relative mb-4">
                                                    <motion.div
                                                        whileHover={{ scale: 1.1 }}
                                                        className="w-20 h-20 rounded-full border-4 border-white shadow-md overflow-hidden"
                                                    >
                                                        <img
                                                            src={candidato.photo}
                                                            alt={candidato.nombre}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(candidato.nombre)}&background=random&size=200`;
                                                            }}
                                                        />
                                                    </motion.div>
                                                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
                                                        <img
                                                            src={candidato.logo}
                                                            alt={candidato.partido}
                                                            className="w-6 h-6 rounded-full object-cover"
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = generarLogoPartido(candidato.partido);
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                <h3 className="font-bold text-gray-900 text-center text-lg leading-tight">
                                                    {candidato.nombre}
                                                </h3>
                                                <p className="text-sm text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-medium">
                                                    {candidato.partido}
                                                </p>
                                            </div>

                                            <div className="flex items-center justify-center mb-4">
                                                <div className="flex items-center">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                                            size={14}
                                                        />
                                                    ))}
                                                    <span className="text-xs text-gray-500 ml-1">(4.0)</span>
                                                </div>
                                            </div>

                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setViewingProposals(candidato)}
                                                className="w-full text-center py-2.5 bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-gray-700 rounded-lg transition-all text-sm font-medium flex items-center justify-center gap-2"
                                            >
                                                <FileText size={14} />
                                                Ver Propuestas
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    )}
                </div>
            </section>

            {/* Sección de Características del Sistema mejorada */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Características del Sistema</h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Nuestra plataforma de votación electrónica ofrece seguridad, transparencia y accesibilidad
                        </p>
                    </motion.div>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-8"
                    >
                        {[
                            { icon: Shield, color: 'blue', title: 'Seguridad Garantizada', description: 'Cifrado de extremo a extremo y autenticación biométrica para proteger cada voto', features: ['Cifrado AES-256', 'Autenticación biométrica', 'Registro inmutable'] },
                            { icon: Zap, color: 'green', title: 'Rapidez y Eficiencia', description: 'Resultados en tiempo real y proceso de votación simplificado para todos los ciudadanos', features: ['Resultados en tiempo real', 'Proceso simplificado', 'Acceso 24/7'] },
                            { icon: Globe, color: 'slate', title: 'Accesibilidad Universal', description: 'Diseño inclusivo que permite votar desde cualquier lugar y dispositivo', features: ['Diseño responsivo', 'Soporte multiidioma', 'Asistencia inclusiva'] }
                        ].map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                variants={itemVariants}
                                whileHover={{ scale: 1.05, y: -5 }}
                                className="bg-gray-50 rounded-xl p-6"
                            >
                                <div className={`w-16 h-16 bg-${feature.color}-100 rounded-xl flex items-center justify-center mb-4`}>
                                    <feature.icon className={`text-${feature.color}-600`} size={28} />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                                <p className="text-gray-600 mb-4">{feature.description}</p>
                                <ul className="space-y-2">
                                    {feature.features.map((item, idx) => (
                                        <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                                            <CheckCircle className="text-green-500" size={14} />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Sección de Testimonios */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Testimonios de Ciudadanos</h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Descubre lo que dicen los ciudadanos sobre nuestra plataforma de votación
                        </p>
                    </motion.div>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    >
                        {[
                            { name: 'María González', role: 'Profesora', comment: 'El sistema es muy intuitivo y seguro. Pude votar desde casa sin ningún problema.', rating: 5 },
                            { name: 'Carlos Mendoza', role: 'Empresario', comment: 'La verificación por DNI es rápida y confiable. Me siento seguro usando esta plataforma.', rating: 5 },
                            { name: 'Ana Rodríguez', role: 'Estudiante', comment: 'Como joven, valoro la facilidad de uso y la accesibilidad del sistema para votar.', rating: 4 }
                        ].map((testimonial, index) => (
                            <motion.div
                                key={index}
                                variants={itemVariants}
                                whileHover={{ scale: 1.02, y: -5 }}
                                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
                            >
                                <div className="flex items-center mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="text-yellow-400 fill-current" size={16} />
                                    ))}
                                </div>
                                <p className="text-gray-700 mb-4 italic">"{testimonial.comment}"</p>
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{testimonial.name}</p>
                                        <p className="text-sm text-gray-600">{testimonial.role}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Modal de Votación mejorado */}
            <AnimatePresence>
                {showVotingForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    >
                        <motion.div
                            variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="bg-white rounded-2xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
                        >
                            {/* Header del Modal mejorado */}
                            <div className="bg-gradient-to-r from-slate-600 to-slate-700 p-6 text-white flex justify-between items-center">
                                <div>
                                    <h3 className="text-2xl font-bold mb-2">Formulario de Votación</h3>
                                    <p className="text-sm opacity-90">Complete sus datos para emitir su voto</p>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={closeModal}
                                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-all"
                                >
                                    <X size={24} />
                                </motion.button>
                            </div>

                            {/* Indicador de pasos mejorado */}
                            <div className="px-6 pt-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${formStep >= 1 ? 'bg-slate-600 text-white' : 'bg-gray-200 text-gray-600'}`}>1</div>
                                        <span className={`ml-2 text-sm font-medium ${formStep >= 1 ? 'text-slate-600' : 'text-gray-500'}`}>Datos Personales</span>
                                    </div>
                                    <div className={`flex-1 h-1 mx-4 ${formStep >= 2 ? 'bg-slate-600' : 'bg-gray-200'}`}></div>
                                    <div className="flex items-center">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${formStep >= 2 ? 'bg-slate-600 text-white' : 'bg-gray-200 text-gray-600'}`}>2</div>
                                        <span className={`ml-2 text-sm font-medium ${formStep >= 2 ? 'text-slate-600' : 'text-gray-500'}`}>Seleccionar Candidatos</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6">
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="m-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3"
                                    >
                                        <AlertCircle className="text-red-600" size={24} />
                                        <p className="text-sm text-red-800">{error}</p>
                                    </motion.div>
                                )}

                                <AnimatePresence mode="wait">
                                    {/* Paso 1: Datos Personales mejorado */}
                                    {formStep === 1 && (
                                        <motion.div
                                            key="step1"
                                            variants={stepVariants}
                                            initial="hidden"
                                            animate="visible"
                                            exit="exit"
                                            className="space-y-6"
                                        >
                                            <div>
                                                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold text-sm">1</div>
                                                    Datos Personales
                                                </h4>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="md:col-span-2">
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            DNI
                                                        </label>
                                                        <div className="relative">
                                                            <input
                                                                type="text"
                                                                value={formData.dni}
                                                                onChange={handleDniChange}
                                                                maxLength={8}
                                                                placeholder="Ingrese su DNI de 8 dígitos"
                                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                                                            />
                                                            {loading && (
                                                                <div className="absolute right-3 top-3">
                                                                    <Loader className="animate-spin text-slate-600" size={20} />
                                                                </div>
                                                            )}
                                                            {dniVerified && !loading && (
                                                                <motion.div
                                                                    initial={{ scale: 0 }}
                                                                    animate={{ scale: 1 }}
                                                                    className="absolute right-3 top-3"
                                                                >
                                                                    <CheckCircle className="text-green-600" size={20} />
                                                                </motion.div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="md:col-span-2">
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Nombre Completo
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="nombre_completo"
                                                            value={formData.nombre_completo}
                                                            onChange={handleInputChange}
                                                            placeholder="Nombre completo"
                                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500"
                                                            readOnly={dniVerified}
                                                            autoComplete="name"
                                                            spellCheck="false"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Nombres
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="nombres"
                                                            value={formData.nombres}
                                                            onChange={handleInputChange}
                                                            placeholder="Nombres"
                                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500"
                                                            readOnly={dniVerified}
                                                            autoComplete="given-name"
                                                            spellCheck="false"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Apellido Paterno
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="apellido_paterno"
                                                            value={formData.apellido_paterno}
                                                            onChange={handleInputChange}
                                                            placeholder="Apellido Paterno"
                                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500"
                                                            readOnly={dniVerified}
                                                            autoComplete="family-name"
                                                            spellCheck="false"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Apellido Materno
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="apellido_materno"
                                                            value={formData.apellido_materno}
                                                            onChange={handleInputChange}
                                                            placeholder="Apellido Materno"
                                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500"
                                                            readOnly={dniVerified}
                                                            autoComplete="family-name"
                                                            spellCheck="false"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Departamento
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="departamento"
                                                            value={formData.departamento}
                                                            onChange={handleInputChange}
                                                            placeholder="Departamento"
                                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500"
                                                            readOnly={dniVerified}
                                                            autoComplete="address-level1"
                                                            spellCheck="false"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Provincia
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="provincia"
                                                            value={formData.provincia}
                                                            onChange={handleInputChange}
                                                            placeholder="Provincia"
                                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500"
                                                            readOnly={dniVerified}
                                                            autoComplete="address-level2"
                                                            spellCheck="false"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Distrito
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="distrito"
                                                            value={formData.distrito}
                                                            onChange={handleInputChange}
                                                            placeholder="Distrito"
                                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500"
                                                            readOnly={dniVerified}
                                                            autoComplete="address-level3"
                                                            spellCheck="false"
                                                        />
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
                                                            placeholder="Dirección"
                                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500"
                                                            readOnly={dniVerified}
                                                            autoComplete="street-address"
                                                            spellCheck="false"
                                                        />
                                                    </div>

                                                    <div className="md:col-span-2">
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Dirección Completa
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="direccion_completa"
                                                            value={formData.direccion_completa}
                                                            onChange={handleInputChange}
                                                            placeholder="Dirección completa"
                                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500"
                                                            readOnly={dniVerified}
                                                            autoComplete="street-address"
                                                            spellCheck="false"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            <Phone size={16} className="inline mr-1" />
                                                            Teléfono
                                                        </label>
                                                        <input
                                                            type="tel"
                                                            name="telefono"
                                                            value={formData.telefono}
                                                            onChange={handleInputChange}
                                                            placeholder="987654321"
                                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500"
                                                            autoComplete="tel"
                                                            spellCheck="false"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            <Mail size={16} className="inline mr-1" />
                                                            Correo Electrónico
                                                        </label>
                                                        <input
                                                            type="email"
                                                            name="email"
                                                            value={formData.email}
                                                            onChange={handleInputChange}
                                                            placeholder="correo@ejemplo.com"
                                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500"
                                                            autoComplete="email"
                                                            spellCheck="false"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-6 border-t border-gray-200">
                                                <motion.button
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    type="button"
                                                    onClick={handleContinue}
                                                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-xl hover:from-slate-700 hover:to-slate-800 transition-all font-bold text-lg shadow-lg"
                                                >
                                                    Continuar
                                                    <ChevronRight size={20} />
                                                </motion.button>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Paso 2: Selección de Candidatos mejorado */}
                                    {formStep === 2 && (
                                        <motion.div
                                            key="step2"
                                            variants={stepVariants}
                                            initial="hidden"
                                            animate="visible"
                                            exit="exit"
                                            className="space-y-6"
                                        >
                                            <div>
                                                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold text-sm">2</div>
                                                    Seleccione sus Candidatos <span className="text-red-500">*</span>
                                                </h4>
                                                <p className="text-sm text-gray-600 mb-4">Puede seleccionar un candidato para cada tipo de elección. Haga clic en una tarjeta para seleccionar o deseleccionar.</p>
                                            </div>

                                            {/* Pestañas de navegación para candidatos */}
                                            <div className="flex justify-center mb-6">
                                                <div className="bg-gray-100 rounded-lg p-1 inline-flex">
                                                    {[
                                                        { id: 'presidencial', label: 'Presidencial', icon: Vote },
                                                        { id: 'regional', label: 'Regional', icon: MapPin },
                                                        { id: 'distrital', label: 'Distrital', icon: User }
                                                    ].map((tab) => (
                                                        <button
                                                            key={tab.id}
                                                            onClick={() => setActiveTab(tab.id)}
                                                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === tab.id
                                                                ? 'bg-white text-slate-600 shadow-sm'
                                                                : 'text-gray-600 hover:text-gray-900'
                                                                }`}
                                                        >
                                                            <tab.icon size={16} />
                                                            {tab.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Elección Presidencial */}
                                            {activeTab === 'presidencial' && (
                                                <div className="mb-8">
                                                    <h5 className="text-md font-bold text-blue-600 mb-3 flex items-center gap-2">
                                                        <Vote size={18} />
                                                        Elección Presidencial
                                                    </h5>
                                                    {loadingCandidatos ? (
                                                        <div className="text-center py-8">
                                                            <p className="text-gray-500">Cargando candidatos...</p>
                                                        </div>
                                                    ) : candidatos.presidencial.length === 0 ? (
                                                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                                                            <p className="text-gray-500">No hay candidatos presidenciales disponibles</p>
                                                        </div>
                                                    ) : (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {candidatos.presidencial.map((candidato) => (
                                                                <CandidateCard
                                                                    key={candidato.id}
                                                                    type="presidencial"
                                                                    candidate={candidato}
                                                                    isSelected={selectedCandidates.presidencial === candidato.id}  // ID
                                                                    onSelect={handleCandidateSelection}
                                                                    onViewProposals={setViewingProposals}
                                                                />
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Elección Regional */}
                                            {activeTab === 'regional' && (
                                                <div className="mb-8">
                                                    <h5 className="text-md font-bold text-green-600 mb-3 flex items-center gap-2">
                                                        <MapPin size={18} />
                                                        Elección Regional
                                                    </h5>
                                                    {loadingCandidatos ? (
                                                        <div className="text-center py-8">
                                                            <p className="text-gray-500">Cargando candidatos...</p>
                                                        </div>
                                                    ) : candidatos.regional.length === 0 ? (
                                                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                                                            <p className="text-gray-500">No hay candidatos regionales disponibles</p>
                                                        </div>
                                                    ) : (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {candidatos.regional.map((candidato) => (
                                                                <CandidateCard
                                                                    key={candidato.id}
                                                                    type="regional"
                                                                    candidate={candidato}
                                                                    isSelected={selectedCandidates.regional === candidato.id}
                                                                    onSelect={handleCandidateSelection}
                                                                    onViewProposals={setViewingProposals}
                                                                />
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Elección Distrital */}
                                            {activeTab === 'distrital' && (
                                                <div className="mb-8">
                                                    <h5 className="text-md font-bold text-purple-600 mb-3 flex items-center gap-2">
                                                        <User size={18} />
                                                        Elección Distrital
                                                    </h5>
                                                    {loadingCandidatos ? (
                                                        <div className="text-center py-8">
                                                            <p className="text-gray-500">Cargando candidatos...</p>
                                                        </div>
                                                    ) : candidatos.distrital.length === 0 ? (
                                                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                                                            <p className="text-gray-500">No hay candidatos distritales disponibles</p>
                                                        </div>
                                                    ) : (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {candidatos.distrital.map((candidato) => (
                                                                <CandidateCard
                                                                    key={candidato.id}
                                                                    type="distrital"
                                                                    candidate={candidato}
                                                                    isSelected={selectedCandidates.distrital === candidato.id}
                                                                    onSelect={handleCandidateSelection}
                                                                    onViewProposals={setViewingProposals}
                                                                />
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Resumen de selección */}
                                            {/* Resumen de selección - Versión corregida */}
                                            <div className="bg-gray-50 rounded-xl p-4 mb-6">
                                                <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                                    <CheckSquare size={18} />
                                                    Resumen de su selección:
                                                </h5>
                                                <div className="space-y-2">
                                                    {selectedCandidates.presidencial && (
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm text-gray-600">Presidencial:</span>
                                                            <span className="text-sm font-medium text-gray-900">
                                                                {candidatos.presidencial.find(c => c.id === selectedCandidates.presidencial)?.nombre || 'Candidato no encontrado'}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {selectedCandidates.regional && (
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm text-gray-600">Regional:</span>
                                                            <span className="text-sm font-medium text-gray-900">
                                                                {candidatos.regional.find(c => c.id === selectedCandidates.regional)?.nombre || 'Candidato no encontrado'}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {selectedCandidates.distrital && (
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm text-gray-600">Distrital:</span>
                                                            <span className="text-sm font-medium text-gray-900">
                                                                {candidatos.distrital.find(c => c.id === selectedCandidates.distrital)?.nombre || 'Candidato no encontrado'}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {!selectedCandidates.presidencial && !selectedCandidates.regional && !selectedCandidates.distrital && (
                                                        <p className="text-sm text-gray-500 italic">No ha seleccionado ningún candidato aún</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="pt-6 border-t border-gray-200 flex gap-4">
                                                <motion.button
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    type="button"
                                                    onClick={() => setFormStep(1)}
                                                    className="flex-1 px-6 py-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-bold"
                                                >
                                                    Anterior
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    type="button"
                                                    onClick={handleSubmit}
                                                    disabled={loading}
                                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-xl hover:from-slate-700 hover:to-slate-800 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                                                >
                                                    <Vote size={24} />
                                                    Emitir Voto(s)
                                                </motion.button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal de Propuestas */}
            <AnimatePresence>
                {viewingProposals && (
                    <PropuestasModal
                        candidate={viewingProposals}
                        onClose={() => setViewingProposals(null)}
                    />
                )}
            </AnimatePresence>

            {/* Modal de Éxito */}
            <AnimatePresence>
                {showSuccessModal && <SuccessModal />}
            </AnimatePresence>

            {/* Footer mejorado */}
            <motion.footer
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="bg-gray-900 text-white py-12"
            >
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <motion.div
                                    whileHover={{ scale: 1.05, rotate: 5 }}
                                    className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center"
                                >
                                    <Vote className="text-white" size={20} />
                                </motion.div>
                                <h3 className="text-xl font-bold">ONPE</h3>
                            </div>
                            <p className="text-sm text-gray-400">
                                Oficina Nacional de Procesos Electorales. Garantizando elecciones democráticas y transparentes.
                            </p>
                        </div>

                        <div>
                            <h4 className="text-lg font-semibold mb-4">Enlaces Rápidos</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><a href="#" className="hover:text-white transition-colors">Inicio</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Candidatos</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Resultados</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Prensa</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-lg font-semibold mb-4">Recursos</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><a href="#" className="hover:text-white transition-colors">Guía de Votación</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Centro de Ayuda</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Términos y Condiciones</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-lg font-semibold mb-4">Contacto</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li className="flex items-center gap-2">
                                    <Phone size={16} />
                                    <span>0800-12345</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Mail size={16} />
                                    <span>soporte@onpe.gob.pe</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <MapPin size={16} />
                                    <span>Jr. Washington 1894, Cercado de Lima</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 pt-8 text-center">
                        <p className="text-sm text-gray-400">
                            © 2024 ONPE - Oficina Nacional de Procesos Electorales. Todos los derechos reservados.
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                            Sistema seguro y verificado | Elecciones Generales 2024
                        </p>
                    </div>
                </div>
            </motion.footer>

            {/* Chatbot Flotante */}
            <motion.div className="fixed bottom-8 right-8 z-50">
                {/* Botón Chatbot */}
                <AnimatePresence>
                    {!chatbotOpen && (
                        <motion.button
                            onClick={() => setChatbotOpen(true)}
                            className="bg-gradient-to-r from-slate-600 via-slate-700 to-slate-800 text-white p-4 rounded-full shadow-lg hover:shadow-xl"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <MessageCircle size={24} />
                        </motion.button>
                    )}
                </AnimatePresence>

                {/* Ventana del Chat */}
                <AnimatePresence>
                    {chatbotOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 20 }}
                            className="absolute bottom-0 right-0 w-96 h-screen sm:h-96 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                        >
                            {/* Header del Chat */}
                            <div className="bg-gradient-to-r from-slate-600 via-slate-700 to-slate-800 p-4 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                                    <h3 className="font-bold text-white">Asistente ONPE</h3>
                                </div>
                                <motion.button
                                    onClick={() => setChatbotOpen(false)}
                                    whileHover={{ rotate: 90 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <X size={20} className="text-white" />
                                </motion.button>
                            </div>

                            {/* Mensajes del Chat */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-800/50">
                                {chatMessages.map((msg, index) => (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-xs px-4 py-2 rounded-lg whitespace-pre-wrap text-sm ${msg.type === 'user'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-700 text-gray-100'
                                                }`}
                                        >
                                            {msg.text}
                                        </div>
                                    </motion.div>
                                ))}

                                {/* Indicador de Escritura */}
                                {isTyping && (
                                    <motion.div
                                        className="flex gap-1"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    >
                                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    </motion.div>
                                )}
                            </div>

                            {/* Input del Chat */}
                            <div className="border-t border-gray-700 p-3 flex gap-2 bg-gray-800">
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            handleSendMessage();
                                        }
                                    }}
                                    placeholder="Escribe tu pregunta..."
                                    className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                                    disabled={isTyping}
                                />
                                <motion.button
                                    onClick={handleSendMessage}
                                    disabled={isTyping}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    <Send size={18} />
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
};

export default LandingPage;