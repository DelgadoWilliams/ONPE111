// src/pages/CargarDatos.jsx
import { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, X, RefreshCw, Database } from 'lucide-react';

const CargarDatos = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const ext = selectedFile.name.split('.').pop().toLowerCase();
    if (ext === 'csv') {
      setFile(selectedFile);
      setError(null);
      setResult(null);
    } else {
      setError('Solo se permiten archivos CSV');
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Por favor selecciona un archivo');
      return;
    }

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_URL}/api/upload/upload-csv`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.message || 'Error al procesar el archivo');
      }

      setResult(data);
      setFile(null);
      // Limpiar input file
      const input = document.querySelector('input[type="file"]');
      if (input) input.value = '';
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Error de conexión con el servidor');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setResult(null);
    setError(null);
    const input = document.querySelector('input[type="file"]');
    if (input) input.value = '';
  };

  const getTipoColor = (tipo) => {
    const colors = {
      presidencial: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
      regional: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
      distrital: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' }
    };
    return colors[tipo] || colors.presidencial;
  };

  const color = result ? getTipoColor(result.tipo_detectado || 'presidencial') : null;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-600 to-slate-700 p-6 rounded-xl text-white shadow-lg">
        <div className="flex items-center gap-3">
          <Database size={32} />
          <div>
            <h2 className="text-2xl font-bold">Carga de Datasets</h2>
            <p className="text-sm opacity-90">Sube archivos CSV con datos electorales</p>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-6">Seleccionar Archivo CSV</h3>

        <div className="mb-6">
          <label className="block">
            <div className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
              file ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-slate-500 hover:bg-slate-50'
            }`}>
              <Upload className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-lg font-medium text-gray-700">
                {file ? `Seleccionado: ${file.name}` : 'Haz clic o arrastra un archivo CSV aquí'}
              </p>
              <p className="text-sm text-gray-500 mt-2">Solo archivos .csv</p>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </label>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all font-semibold"
          >
            {uploading ? (
              <>
                <RefreshCw size={20} className="animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <Upload size={20} />
                Subir y Procesar
              </>
            )}
          </button>

          {(file || result || error) && (
            <button
              onClick={resetForm}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2"
            >
              <X size={20} />
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-start gap-3">
          <AlertCircle className="text-red-600 mt-0.5" size={22} />
          <div>
            <p className="font-bold text-red-800">Error</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Éxito */}
      {result && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-5 text-white">
            <div className="flex items-center gap-3">
              <CheckCircle size={28} />
              <div>
                <p className="text-xl font-bold">¡CSV Procesado Exitosamente!</p>
                <p className="text-sm opacity-90">Los datos están en la tabla temporal</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-5">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Tipo de elección:</span>
              <span className={`px-4 py-2 rounded-lg font-bold text-sm ${color.bg} ${color.text} border ${color.border}`}>
                {result.tipo_detectado?.toUpperCase() || 'DESCONOCIDO'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-center">
                <p className="text-xs text-blue-700 uppercase font-semibold">Total filas</p>
                <p className="text-3xl font-bold text-blue-900 mt-1">{result.estadisticas.total_filas}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
                <p className="text-xs text-green-700 uppercase font-semibold">Válidos</p>
                <p className="text-3xl font-bold text-green-900 mt-1">{result.estadisticas.registros_validos}</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 text-center">
                <p className="text-xs text-orange-700 uppercase font-semibold">Errores</p>
                <p className="text-3xl font-bold text-orange-900 mt-1">{result.estadisticas.registros_con_errores}</p>
              </div>
            </div>

            <div className="bg-gray-50 p-5 rounded-lg">
              <p className="text-sm font-semibold text-gray-700 mb-3">Información del archivo</p>
              <div className="text-sm space-y-2 text-gray-600">
                <p><strong>Nombre:</strong> {result.archivo?.nombre || 'Desconocido'}</p>
                <p><strong>Columnas:</strong> {result.archivo?.columnas?.join(', ') || '—'}</p>
                <p><strong>Tabla temporal:</strong> <code className="bg-gray-200 px-2 py-1 rounded text-xs">{result.tabla_destino}</code></p>
                <p><strong>Batch ID:</strong> <code className="bg-gray-200 px-2 py-1 rounded text-xs font-mono">{result.batch_id}</code></p>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Tasa de éxito</span>
                <span className="font-bold text-green-600">{result.estadisticas.porcentaje_exito}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-gradient-to-r from-green-500 to-emerald-600 h-full rounded-full transition-all duration-1000"
                  style={{ width: `${result.estadisticas.porcentaje_exito}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <FileText className="text-blue-600 mt-0.5" size={22} />
          <div>
            <p className="font-bold text-blue-900 mb-2">Siguiente paso</p>
            <p className="text-sm text-blue-800">
              Ve a <strong>Limpieza de Datos</strong> para revisar duplicados, limpiar y enviar a la tabla final.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CargarDatos;