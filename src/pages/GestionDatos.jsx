// src/pages/GestionDatos.jsx

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Search,
  Download,
} from 'lucide-react';
import { votosPresidencialesAPI, votosRegionalesAPI, votosDistritalesAPI } from '../services/api';
import { containerVariants, itemVariants } from '../animations';

const GestionDatos = () => {
  const [filtroTipo, setFiltroTipo] = useState('presidencial');
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
  const [datos, setDatos] = useState({
    presidencial: [],
    regional: [],
    distrital: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);

      const [presResp, regResp, distResp] = await Promise.all([
        votosPresidencialesAPI.getAll().catch(() => ({ data: { data: [] } })),
        votosRegionalesAPI.getAll().catch(() => ({ data: { data: [] } })),
        votosDistritalesAPI.getAll().catch(() => ({ data: { data: [] } })),
      ]);

      const votosPres = presResp.data?.data || presResp.data || [];
      const votosReg = regResp.data?.data || regResp.data || [];
      const votosDist = distResp.data?.data || distResp.data || [];

      const presidencial = votosPres.map(voto => ({
        id: voto.id,
        dni: voto.dni_votante || 'N/A',
        nombre_completo: voto.votantes
          ? `${voto.votantes.nombres} ${voto.votantes.apellido_paterno} ${voto.votantes.apellido_materno}`.trim()
          : 'N/A',
        distrito: voto.distrito || voto.votantes?.distrito || 'N/A',
        departamento: voto.departamento || voto.votantes?.departamento || 'N/A',
        provincia: voto.provincia || voto.votantes?.provincia || 'N/A',
        direccion: voto.votantes?.direccion || 'N/A',
        telefono: voto.votantes?.telefono || 'N/A',
        email: voto.votantes?.email || 'N/A',
        edad: voto.votantes?.edad || 'N/A',
        votoPresidencial: voto.candidatos || null,  // ← objeto completo
        fechaRegistro: voto.fecha_voto?.split('T')[0] || new Date().toISOString().split('T')[0],
        estado: 'Activo',
      }));

      const regional = votosReg.map(voto => ({
        id: voto.id,
        dni: voto.dni_votante || 'N/A',
        nombre_completo: voto.votantes
          ? `${voto.votantes.nombres} ${voto.votantes.apellido_paterno} ${voto.votantes.apellido_materno}`.trim()
          : 'N/A',
        distrito: voto.distrito || voto.votantes?.distrito || 'N/A',
        departamento: voto.departamento || voto.votantes?.departamento || 'N/A',
        provincia: voto.provincia || voto.votantes?.provincia || 'N/A',
        direccion: voto.votantes?.direccion || 'N/A',
        telefono: voto.votantes?.telefono || 'N/A',
        email: voto.votantes?.email || 'N/A',
        edad: voto.votantes?.edad || 'N/A',
        votoRegional: voto.candidatos || null,
        fechaRegistro: voto.fecha_voto?.split('T')[0] || new Date().toISOString().split('T')[0],
        estado: 'Activo',
      }));

      const distrital = votosDist.map(voto => ({
        id: voto.id,
        dni: voto.dni_votante || 'N/A',
        nombre_completo: voto.votantes
          ? `${voto.votantes.nombres} ${voto.votantes.apellido_paterno} ${voto.votantes.apellido_materno}`.trim()
          : 'N/A',
        distrito: voto.distrito || voto.votantes?.distrito || 'N/A',
        departamento: voto.departamento || voto.votantes?.departamento || 'N/A',
        provincia: voto.provincia || voto.votantes?.provincia || 'N/A',
        direccion: voto.votantes?.direccion || 'N/A',
        telefono: voto.votantes?.telefono || 'N/A',
        email: voto.votantes?.email || 'N/A',
        edad: voto.votantes?.edad || 'N/A',
        votoDistrital: voto.candidatos || null,
        fechaRegistro: voto.fecha_voto?.split('T')[0] || new Date().toISOString().split('T')[0],
        estado: 'Activo',
      }));

      setDatos({ presidencial, regional, distrital });
    } catch (err) {
      setError('Error al cargar los datos. Por favor, recarga la página.');
    } finally {
      setLoading(false);
    }
  };

  const exportarCSV = () => {
    try {
      let datosAExportar = [];
      let nombreTipo = '';

      if (filtroTipo === 'presidencial') { datosAExportar = datos.presidencial; nombreTipo = 'presidencial'; }
      else if (filtroTipo === 'regional') { datosAExportar = datos.regional; nombreTipo = 'regional'; }
      else if (filtroTipo === 'distrital') { datosAExportar = datos.distrital; nombreTipo = 'distrital'; }

      if (datosAExportar.length === 0) { alert('No hay datos para exportar'); return; }

      const headers = ['DNI','Nombre Completo','candidato_id','Candidato Nombre','Departamento','Provincia','Distrito','Fecha Registro'];

      const filas = datosAExportar.map(row => {
        const candidatoObj = filtroTipo === 'presidencial' ? row.votoPresidencial :
                             filtroTipo === 'regional' ? row.votoRegional : row.votoDistrital;

        const candidatoId = candidatoObj?.id || 'NO-ID';
        const candidatoNombre = candidatoObj?.nombre || 'No-Id';

        return [
          row.dni || '',
          row.nombre_completo || '',
          candidatoId,
          candidatoNombre,
          row.departamento || '',
          row.provincia || '',
          row.distrito || '',
          row.fechaRegistro || ''
        ];
      });

      const csvContent = [headers.join(','), ...filas.map(f => f.map(c => `"${(c+'').replace(/"/g,'""')}"`).join(','))].join('\r\n');
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `votos_${nombreTipo}_CON_ID_${new Date().toLocaleDateString('es-PE').replace(/\//g,'-')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
      alert('Error al exportar CSV');
    }
  };

  // Filtro
  let datosFiltrados = filtroTipo === 'presidencial' ? datos.presidencial :
                       filtroTipo === 'regional' ? datos.regional : datos.distrital;

  const filtrados = datosFiltrados.filter(row =>
    row.dni?.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
    row.nombre_completo?.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
    row.distrito?.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
    row.email?.toLowerCase().includes(terminoBusqueda.toLowerCase())
  );

  const handleSelectAll = (e) => {
    setSelectedRows(e.target.checked ? filtrados.map(r => r.id) : []);
  };

  const handleSelectRow = (id) => {
    setSelectedRows(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const getEstadoColor = (estado) => estado === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';

  const contadorPorTipo = {
    presidencial: datos.presidencial.length,
    regional: datos.regional.length,
    distrital: datos.distrital.length,
  };

  const tiposFiltro = [
    { id: 'presidencial', label: 'Presidencial', count: contadorPorTipo.presidencial },
    { id: 'regional', label: 'Regional', count: contadorPorTipo.regional },
    { id: 'distrital', label: 'Distrital', count: contadorPorTipo.distrital },
  ];

  if (loading) return <div className="text-center py-20"><div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div><p className="mt-4 text-gray-600">Cargando datos...</p></div>;
  if (error) return <div className="text-center py-20"><p className="text-red-600 text-lg">{error}</p><button onClick={cargarDatos} className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Reintentar</button></div>;

  return (
    <motion.div className="space-y-6 p-6 bg-gray-50 min-h-screen" initial="hidden" animate="visible" variants={containerVariants}>
      {/* Título y botones */}
      <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Registro de Votos</h2>
          <div className="flex gap-2">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={cargarDatos} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              <TrendingUp size={18} /> Actualizar
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={exportarCSV} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <Download size={18} /> Exportar CSV
            </motion.button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-gray-200">
          {tiposFiltro.map(tipo => (
            <button key={tipo.id} onClick={() => { setFiltroTipo(tipo.id); setSelectedRows([]); setTerminoBusqueda(''); }}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-all ${filtroTipo === tipo.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-600 hover:text-indigo-600'}`}>
              {tipo.label} ({tipo.count})
            </button>
          ))}
        </div>
      </motion.div>

      {/* Estadísticas */}
      <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-4" variants={containerVariants}>
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200"><p className="text-sm text-gray-600">Presidencial</p><p className="text-3xl font-bold text-blue-600">{datos.presidencial.length}</p></div>
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200"><p className="text-sm text-gray-600">Regional</p><p className="text-3xl font-bold text-green-600">{datos.regional.length}</p></div>
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200"><p className="text-sm text-gray-600">Distrital</p><p className="text-3xl font-bold text-purple-600">{datos.distrital.length}</p></div>
      </motion.div>

      {/* Tabla */}
      <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h3 className="text-lg font-bold text-gray-800">
              {filtroTipo === 'presidencial' ? 'Votos - Elección Presidencial' :
               filtroTipo === 'regional' ? 'Votos - Elección Regional' : 'Votos - Elección Distrital'}
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" placeholder="Buscar por DNI, nombre, distrito, email..." value={terminoBusqueda} onChange={e => setTerminoBusqueda(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-80" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left"><input type="checkbox" checked={selectedRows.length === filtrados.length && filtrados.length > 0} onChange={handleSelectAll} className="w-4 h-4 text-indigo-600 border-gray-300 rounded" /></th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">DNI</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Nombre Completo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Edad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Distrito</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Dirección</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Teléfono</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  {filtroTipo === 'presidencial' ? 'Voto Presidencial' : filtroTipo === 'regional' ? 'Voto Regional' : 'Voto Distrital'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Fecha Registro</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtrados.map(row => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4"><input type="checkbox" checked={selectedRows.includes(row.id)} onChange={() => handleSelectRow(row.id)} className="w-4 h-4 text-indigo-600 border-gray-300 rounded" /></td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.dni}</td>
                  <td className="px-6 py-4 text-sm text-gray-800 font-medium">{row.nombre_completo}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{row.edad}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{row.distrito}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{row.direccion || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{row.telefono || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{row.email || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm font-medium text-indigo-700">
                    {filtroTipo === 'presidencial' ? row.votoPresidencial?.nombre || 'No-Id' :
                     filtroTipo === 'regional' ? row.votoRegional?.nombre || 'No-Id' :
                     row.votoDistrital?.nombre || 'No-Id'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{row.fechaRegistro}</td>
                  <td className="px-6 py-4"><span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getEstadoColor(row.estado)}`}>{row.estado}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <p className="text-sm text-gray-700">Mostrando <span className="font-medium">1</span> a <span className="font-medium">{filtrados.length}</span> de <span className="font-medium">{filtrados.length}</span> registros</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default GestionDatos;