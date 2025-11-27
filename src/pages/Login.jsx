// sistema-electoral/src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Shield, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Login = ({ onLoginSuccess }) => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [loginData, setLoginData] = useState({
        username: '',
        password: ''
    });
    const [loginError, setLoginError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleLoginSubmit = (e) => {
        e.preventDefault();
        setLoginError('');

        // Credenciales de ejemplo - en producción validar con backend
        if (loginData.username === 'admin' && loginData.password === 'admin123') {
            setSuccess(true);
            setTimeout(() => {
                onLoginSuccess();
            }, 1000);
        } else {
            setLoginError('Usuario o contraseña incorrectos');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setLoginData(prev => ({ ...prev, [name]: value }));
        setLoginError('');
    };

    // Animaciones
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
        hidden: { 
            opacity: 0, 
            scale: 0.8,
            y: 50 
        },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 15,
                duration: 0.8
            }
        }
    };

    const buttonVariants = {
        initial: { scale: 1 },
        tap: { scale: 0.95 },
        hover: { 
            scale: 1.02,
            transition: { duration: 0.2 }
        }
    };

    const inputVariants = {
        focus: {
            scale: 1.02,
            boxShadow: "0 0 0 3px rgba(100, 116, 139, 0.1)",
            transition: { duration: 0.2 }
        }
    };

    const errorVariants = {
        hidden: { opacity: 0, x: -20, height: 0 },
        visible: { 
            opacity: 1, 
            x: 0, 
            height: "auto",
            transition: {
                type: "spring",
                stiffness: 200,
                damping: 15
            }
        },
        exit: { 
            opacity: 0, 
            x: 20, 
            height: 0,
            transition: { duration: 0.3 }
        }
    };

    const blobVariants = {
        animate: {
            scale: [1, 1.1, 1],
            rotate: [0, 5, 0],
            transition: {
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    return (
        <motion.div 
            className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-50 to-slate-200 flex items-center justify-center p-4"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            {/* Background decorativo animado */}
            <div className="absolute inset-0 overflow-hidden">
                <motion.div 
                    className="absolute top-20 left-10 w-72 h-72 bg-slate-300 rounded-full mix-blend-multiply filter blur-xl opacity-70"
                    variants={blobVariants}
                    animate="animate"
                />
                <motion.div 
                    className="absolute top-40 right-10 w-72 h-72 bg-slate-400 rounded-full mix-blend-multiply filter blur-xl opacity-70"
                    variants={blobVariants}
                    animate="animate"
                    transition={{ delay: 2 }}
                />
                <motion.div 
                    className="absolute bottom-20 left-20 w-72 h-72 bg-slate-500 rounded-full mix-blend-multiply filter blur-xl opacity-70"
                    variants={blobVariants}
                    animate="animate"
                    transition={{ delay: 4 }}
                />
            </div>

            <motion.div 
                className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
                variants={cardVariants}
            >
                {/* Botón de Volver */}
                <motion.button
                    onClick={() => navigate('/')}
                    className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-2 bg-white/90 hover:bg-white rounded-lg transition-all text-gray-700 hover:text-slate-600 text-sm font-medium shadow-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    variants={itemVariants}
                >
                    <ArrowLeft size={16} />
                    Volver
                </motion.button>
                
                {/* Header */}
                <motion.div 
                    className="bg-gradient-to-r from-slate-600 to-slate-700 p-8 text-white"
                    variants={itemVariants}
                >
                    <motion.div 
                        className="flex items-center justify-center mb-4"
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                            <Shield size={40} />
                        </div>
                    </motion.div>
                    <motion.h2 
                        className="text-3xl font-bold text-center mb-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        Panel Administrativo
                    </motion.h2>
                    <motion.p 
                        className="text-center text-sm opacity-90"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.9 }}
                        transition={{ delay: 0.3 }}
                    >
                        Sistema Electoral ONPE 2024
                    </motion.p>
                </motion.div>

                {/* Formulario */}
                <div className="p-8">
                    <AnimatePresence mode="wait">
                        {loginError && (
                            <motion.div
                                key="error"
                                variants={errorVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3"
                            >
                                <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                                <p className="text-sm text-red-800">{loginError}</p>
                            </motion.div>
                        )}

                        {success && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3"
                            >
                                <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
                                <p className="text-sm text-green-800">¡Acceso correcto! Redirigiendo...</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <motion.form 
                        onSubmit={handleLoginSubmit} 
                        className="space-y-6"
                        variants={containerVariants}
                    >
                        <motion.div variants={itemVariants}>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Usuario
                            </label>
                            <motion.input
                                type="text"
                                name="username"
                                value={loginData.username}
                                onChange={handleInputChange}
                                placeholder="Ingrese su usuario"
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                                required
                                whileFocus="focus"
                                variants={inputVariants}
                            />
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Contraseña
                            </label>
                            <div className="relative">
                                <motion.input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={loginData.password}
                                    onChange={handleInputChange}
                                    placeholder="Ingrese su contraseña"
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                                    required
                                    whileFocus="focus"
                                    variants={inputVariants}
                                />
                                <motion.button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-slate-600 transition-colors"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </motion.button>
                            </div>
                        </motion.div>

                        <motion.div 
                            className="bg-slate-50 border border-slate-200 rounded-xl p-4"
                            variants={itemVariants}
                            whileHover={{ 
                                scale: 1.02,
                                backgroundColor: "rgba(100, 116, 139, 0.08)"
                            }}
                            transition={{ duration: 0.2 }}
                        >
                            <p className="text-xs text-slate-800">
                                <strong>Credenciales de prueba:</strong><br />
                                Usuario: <code className="bg-slate-100 px-2 py-1 rounded font-mono">admin</code><br />
                                Contraseña: <code className="bg-slate-100 px-2 py-1 rounded font-mono">admin123</code>
                            </p>
                        </motion.div>

                        <motion.button
                            type="submit"
                            disabled={!loginData.username || !loginData.password || success}
                            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-xl hover:from-slate-700 hover:to-slate-800 transition-all font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                            initial="initial"
                        >
                            <Lock size={20} />
                            Iniciar Sesión
                        </motion.button>
                    </motion.form>
                </div>

                {/* Footer del modal */}
                <motion.div 
                    className="bg-gray-50 px-8 py-4 border-t border-gray-200"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                >
                    <p className="text-xs text-gray-600 text-center">
                        Sistema protegido con encriptación de nivel bancario
                    </p>
                </motion.div>
            </motion.div>
        </motion.div>
    );
};

export default Login;