// src/services/api.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

console.log('🌐 API URL configurada:', API_BASE_URL);

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000,
});

// ============================================
// CANDIDATOS → /api/candidatos
// ============================================
export const candidatosAPI = {
    getAll: () => api.get('/api/candidatos'),
    getById: (id) => api.get(`/api/candidatos/${id}`),
    getByTipo: (tipo) => api.get(`/api/candidatos/tipo/${tipo}`), // presidencial, regional, distrital
    create: (candidato) => api.post('/api/candidatos', candidato),
    update: (id, candidato) => api.put(`/api/candidatos/${id}`, candidato),
    delete: (id) => api.delete(`/api/candidatos/${id}`),
};

// ============================================
// VOTANTES → /api/votantes
// ============================================
export const votantesAPI = {
    getAll: () => api.get('/api/votantes'),
    getById: (id) => api.get(`/api/votantes/${id}`),
    getByDni: (dni) => api.get(`/api/votantes/dni/${dni}`),
    create: (votante) => api.post('/api/votantes', votante),
    update: (id, votante) => api.put(`/api/votantes/${id}`, votante),
    delete: (id) => api.delete(`/api/votantes/${id}`),
};

// ============================================
// VOTOS PRESIDENCIALES → /api/votos/presidenciales
// ============================================
export const votosPresidencialesAPI = {
    getAll: () => api.get('/api/votos/presidenciales'),
    getById: (id) => api.get(`/api/votos/presidenciales/${id}`),
    create: (voto) => api.post('/api/votos/presidenciales', voto),
    delete: (id) => api.delete(`/api/votos/presidenciales/${id}`),
    checkIfVoted: (dni) => api.get(`/api/votos/presidenciales/check/${dni}`),
};

// ============================================
// VOTOS REGIONALES → /api/votos/regionales
// ============================================
export const votosRegionalesAPI = {
    getAll: () => api.get('/api/votos/regionales'),
    getById: (id) => api.get(`/api/votos/regionales/${id}`),
    create: (voto) => api.post('/api/votos/regionales', voto),
    delete: (id) => api.delete(`/api/votos/regionales/${id}`),
    checkIfVoted: (dni) => api.get(`/api/votos/regionales/check/${dni}`),
};

// ============================================
// VOTOS DISTRITALES → /api/votos/distritales
// ============================================
export const votosDistritalesAPI = {
    getAll: () => api.get('/api/votos/distritales'),
    getById: (id) => api.get(`/api/votos/distritales/${id}`),
    create: (voto) => api.post('/api/votos/distritales', voto),
    delete: (id) => api.delete(`/api/votos/distritales/${id}`),
    checkIfVoted: (dni) => api.get(`/api/votos/distritales/check/${dni}`),
};

// ============================================
// ESTADÍSTICAS
// ============================================
export const estadisticasAPI = {
    getPorTipo: (tipo) => api.get(`/api/estadisticas/${tipo}`), // presidencial, regional, distrital
    getGeneral: () => api.get('/api/estadisticas/general'),
};

// ============================================
// HEALTH CHECK
// ============================================
export const healthAPI = {
    check: () => api.get('/health').catch(() => ({ data: { status: 'DOWN' } })),
};

// ============================================
// LIMPIEZA DE DATOS DE BATCHES
// ============================================
export const limpiezaBatchAPI = {
    removeDuplicates: (batchId) => api.post(`/upload/batch/${batchId}/remove-duplicates`),
    cleanNulls: (batchId) => api.post(`/upload/batch/${batchId}/clean-nulls`),
    normalize: (batchId) => api.post(`/upload/batch/${batchId}/normalize`),
};

// ============================================
// MACHINE LEARNING → /api/train
// ============================================
export const mlAPI = {
    // Entrenar modelo para un tipo de elección específico
    entrenarModelo: (tipoEleccion) => api.post(`/api/train/entrenar/${tipoEleccion}`),

    // Obtener modelos activos para todos los tipos de elección
    getModelosActivos: () => api.get('/api/train/modelos-activos'),

    // Obtener predicciones para un tipo de elección
    getPredicciones: (tipoEleccion) => api.get(`/api/train/predicciones/${tipoEleccion}`),

    // Obtener todos los modelos entrenados
    getAllModelos: () => api.get('/api/train/models'),

    // Obtener detalles de un modelo específico
    getModeloDetalle: (modelId) => api.get(`/api/train/models/${modelId}`),
};

// Actualizar estadísticas API con dashboard
estadisticasAPI.getDashboard = () => api.get('/api/estadisticas/dashboard');

export default api;