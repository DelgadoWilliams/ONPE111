import { useState, useEffect } from 'react';
import { FileText, Download, Calendar, Filter, Printer, Mail, Eye, TrendingUp, Users, MapPin, BarChart3, AlertCircle, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import html2canvas from 'html2canvas';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const Reportes = () => {
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVistaPrevia, setModalVistaPrevia] = useState(false);
  const [datosVistaPrevia, setDatosVistaPrevia] = useState(null);
  const [reporteActual, setReporteActual] = useState(null);

  // Estados para datos reales
  const [estadisticas, setEstadisticas] = useState(null);
  const [reportesGenerados, setReportesGenerados] = useState([]);

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);

      // Cargar estadísticas del dashboard
      const respStats = await fetch(`${API_URL}/api/estadisticas/dashboard`);
      const dataStats = await respStats.json();

      if (dataStats.success) {
        setEstadisticas(dataStats.data);

        // Generar lista de reportes disponibles basados en datos reales
        const reportes = generarReportesDisponibles(dataStats.data);
        setReportesGenerados(reportes);
      }

      setError(null);
    } catch (err) {
      console.error('Error cargando datos:', err);
      setError('Error al cargar los reportes. Verifica que el backend esté ejecutándose.');
    } finally {
      setLoading(false);
    }
  };

  const generarReportesDisponibles = (stats) => {
    const reportes = [
      {
        id: 1,
        nombre: 'Participación Electoral General',
        tipo: 'Estadístico',
        descripcion: `Análisis de ${stats.total_votantes.toLocaleString()} votantes registrados`,
        fecha: new Date().toISOString().split('T')[0],
        tamaño: '2.4 MB',
        formato: 'PDF',
        estado: 'Disponible',
        endpoint: '/api/estadisticas/dashboard',
        icono: Users
      },
      {
        id: 2,
        nombre: 'Distribución por Departamento',
        tipo: 'Resultados',
        descripcion: 'Votos por región geográfica',
        fecha: new Date().toISOString().split('T')[0],
        tamaño: '1.8 MB',
        formato: 'Excel',
        estado: 'Disponible',
        endpoint: '/estadisticas/votos-por-distrito',
        icono: MapPin
      },
      {
        id: 3,
        nombre: 'Análisis Presidencial',
        tipo: 'Resultados',
        descripcion: `${stats.votos.presidencial} votos presidenciales registrados`,
        fecha: new Date().toISOString().split('T')[0],
        tamaño: '3.2 MB',
        formato: 'PDF',
        estado: 'Disponible',
        endpoint: '/estadisticas/votos-por-distrito/presidencial',
        icono: TrendingUp
      },
      {
        id: 4,
        nombre: 'Análisis Regional',
        tipo: 'Resultados',
        descripcion: `${stats.votos.regional} votos regionales registrados`,
        fecha: new Date().toISOString().split('T')[0],
        tamaño: '2.9 MB',
        formato: 'PDF',
        estado: 'Disponible',
        endpoint: '/estadisticas/votos-por-distrito/regional',
        icono: BarChart3
      },
      {
        id: 5,
        nombre: 'Análisis Distrital',
        tipo: 'Resultados',
        descripcion: `${stats.votos.distrital} votos distritales registrados`,
        fecha: new Date().toISOString().split('T')[0],
        tamaño: '2.1 MB',
        formato: 'PDF',
        estado: 'Disponible',
        endpoint: '/estadisticas/votos-por-distrito/distrital',
        icono: MapPin
      },
    ];

    return reportes;
  };

  const descargarReporte = async (reporte) => {
    try {
      console.log(`Descargando reporte: ${reporte.nombre}`);

      // Hacer fetch al endpoint correspondiente
      const response = await fetch(`${API_URL}${reporte.endpoint}`);
      const data = await response.json();

      // Mostrar mensaje de carga
      const loadingAlert = document.createElement('div');
      loadingAlert.className = 'fixed top-4 right-4 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2';
      loadingAlert.innerHTML = '<div class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div> Generando PDF con gráficos...';
      document.body.appendChild(loadingAlert);

      // Generación de PDF
      await generarPDF(reporte, data);

      // Remover mensaje de carga
      document.body.removeChild(loadingAlert);

      alert(`✅ Reporte "${reporte.nombre}" descargado exitosamente`);
    } catch (err) {
      console.error('Error descargando reporte:', err);
      alert('❌ Error al descargar el reporte');
    }
  };

  const generarPDF = async (reporte, data) => {
    const doc = new jsPDF();

    // Configuración de fuente y colores
    const colorPrimario = [71, 85, 105]; // slate-600
    const colorSecundario = [148, 163, 184]; // slate-400

    // Encabezado
    doc.setFillColor(...colorPrimario);
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Sistema Electoral ONPE', 105, 20, { align: 'center' });

    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text(reporte.nombre, 105, 32, { align: 'center' });

    // Información del reporte
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha de generación: ${new Date().toLocaleString('es-PE')}`, 14, 50);
    doc.text(`Tipo: ${reporte.tipo}`, 14, 56);

    let yPos = 70;

    const generarGraficoComoImagen = async (tipo, datos) => {
      return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 400;
        const ctx = canvas.getContext('2d');

        if (tipo === 'barras') {
          // Dibujar gráfico de barras manualmente
          const padding = 60;
          const barWidth = (canvas.width - padding * 2) / datos.length;
          const maxValue = Math.max(...datos.map(d => d.cantidad || d.votos || d.value));
          const heightRatio = (canvas.height - padding * 2) / maxValue;

          // Fondo blanco
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Título
          ctx.fillStyle = '#1f2937';
          ctx.font = 'bold 20px Arial';
          ctx.fillText('Distribución de Votos por Tipo', 20, 30);

          // Dibujar barras
          datos.forEach((item, index) => {
            const x = padding + index * barWidth;
            const valor = item.cantidad || item.votos || item.value || 0;
            const barHeight = valor * heightRatio;
            const y = canvas.height - padding - barHeight;

            // Barra
            ctx.fillStyle = '#475569';
            ctx.fillRect(x + 5, y, barWidth - 10, barHeight);

            // Etiqueta
            ctx.fillStyle = '#1f2937';
            ctx.font = '12px Arial';
            ctx.save();
            ctx.translate(x + barWidth / 2, canvas.height - 20);
            ctx.rotate(-Math.PI / 4);
            ctx.fillText(item.rango || item.name || item.distrito || 'N/A', 0, 0);
            ctx.restore();

            // Valor
            ctx.fillStyle = '#1f2937';
            ctx.font = 'bold 14px Arial';
            ctx.fillText(valor.toLocaleString(), x + barWidth / 2 - 20, y - 5);
          });

        } else if (tipo === 'pie') {
          // Dibujar gráfico circular manualmente
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          const radius = Math.min(centerX, centerY) - 60;

          // Fondo blanco
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Título
          ctx.fillStyle = '#1f2937';
          ctx.font = 'bold 20px Arial';
          ctx.fillText('Proporción de Votos', 20, 30);

          const colores = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#94a3b8'];
          const total = datos.reduce((sum, d) => sum + (d.votos || d.cantidad || d.value || 0), 0);

          let currentAngle = -Math.PI / 2;

          datos.forEach((item, index) => {
            const valor = item.votos || item.cantidad || item.value || 0;
            const sliceAngle = (valor / total) * 2 * Math.PI;

            // Dibujar sector
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.closePath();
            ctx.fillStyle = colores[index % colores.length];
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3;
            ctx.stroke();

            // Etiqueta y porcentaje
            const midAngle = currentAngle + sliceAngle / 2;
            const labelX = centerX + Math.cos(midAngle) * (radius + 40);
            const labelY = centerY + Math.sin(midAngle) * (radius + 40);

            ctx.fillStyle = '#1f2937';
            ctx.font = 'bold 12px Arial';
            const porcentaje = ((valor / total) * 100).toFixed(1);
            const label = `${item.name || item.rango || 'N/A'}: ${porcentaje}%`;
            ctx.fillText(label, labelX - 30, labelY);

            currentAngle += sliceAngle;
          });
        }

        // Convertir canvas a imagen
        const imgData = canvas.toDataURL('image/png', 1.0);
        resolve(imgData);
      });
    };

    // Contenido según el tipo de reporte
    if (reporte.endpoint === '/api/estadisticas/dashboard') {
      // Reporte de Dashboard
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...colorPrimario);
      doc.text('Resumen Ejecutivo', 14, yPos);
      yPos += 10;

      const stats = data.data;
      const tableData = [
        ['Total de Votantes', stats.total_votantes.toLocaleString()],
        ['Registros Cargados', stats.registros_cargados.toLocaleString()],
        ['Datos Procesados', `${stats.datos_procesados}%`],
        ['Votos Presidenciales', stats.votos.presidencial.toLocaleString()],
        ['Votos Regionales', stats.votos.regional.toLocaleString()],
        ['Votos Distritales', stats.votos.distrital.toLocaleString()],
        ['Total de Votos', stats.votos.total.toLocaleString()]
      ];

      autoTable(doc, {
        startY: yPos,
        head: [['Indicador', 'Valor']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: colorPrimario,
          fontSize: 12,
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 10,
          cellPadding: 5
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        }
      });

      yPos = doc.lastAutoTable.finalY + 15;

      // 🎨 GENERAR GRÁFICOS DIRECTAMENTE DESDE DATOS
      try {
        doc.addPage();
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...colorPrimario);
        doc.text('Gráficos de Análisis', 14, 20);

        // Preparar datos para los gráficos
        const dataVotos = [
          { rango: 'Presidencial', cantidad: stats.votos.presidencial },
          { rango: 'Regional', cantidad: stats.votos.regional },
          { rango: 'Distrital', cantidad: stats.votos.distrital }
        ];

        console.log('📊 Generando gráfico de barras desde datos...');
        const chartBarImg = await generarGraficoComoImagen('barras', dataVotos);
        if (chartBarImg) {
          doc.text('Distribución de Votos por Tipo', 14, 35);
          doc.addImage(chartBarImg, 'PNG', 14, 40, 180, 90);
          console.log('✅ Gráfico de barras agregado');
        }

        console.log('📊 Generando gráfico circular desde datos...');
        const chartPieImg = await generarGraficoComoImagen('pie', dataVotos);
        if (chartPieImg) {
          doc.text('Proporción de Votos', 14, 145);
          doc.addImage(chartPieImg, 'PNG', 14, 150, 180, 90);
          console.log('✅ Gráfico circular agregado');
        }

        yPos = 250;
      } catch (error) {
        console.log('Error generando gráficos:', error);
      }

      // Actividad Reciente
      if (stats.actividad_reciente && stats.actividad_reciente.length > 0) {
        doc.addPage();
        yPos = 20;

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Actividad Reciente', 14, yPos);
        yPos += 8;

        const actividadData = stats.actividad_reciente.slice(0, 5).map(act => [
          act.action,
          act.time,
          act.status
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [['Acción', 'Fecha/Hora', 'Estado']],
          body: actividadData,
          theme: 'striped',
          headStyles: {
            fillColor: colorPrimario,
            fontSize: 10
          },
          styles: {
            fontSize: 9,
            cellPadding: 4
          }
        });
      }

    } else if (reporte.endpoint.includes('votos-por-distrito')) {
      // Reporte de Distribución Geográfica
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...colorPrimario);
      doc.text('Distribución de Votos por Distrito', 14, yPos);
      yPos += 10;

      if (data.data && data.data.length > 0) {
        const distritosData = data.data.slice(0, 20).map((item, index) => [
          (index + 1).toString(),
          item.distrito,
          item.votos.toLocaleString()
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [['#', 'Distrito', 'Votos']],
          body: distritosData,
          theme: 'grid',
          headStyles: {
            fillColor: colorPrimario,
            fontSize: 11,
            fontStyle: 'bold'
          },
          styles: {
            fontSize: 10,
            cellPadding: 5
          },
          alternateRowStyles: {
            fillColor: [248, 250, 252]
          },
          columnStyles: {
            0: { cellWidth: 15, halign: 'center' },
            1: { cellWidth: 110 },
            2: { cellWidth: 40, halign: 'right' }
          }
        });

        yPos = doc.lastAutoTable.finalY + 15;

        // 🎨 GENERAR GRÁFICO DE DISTRITOS DESDE DATOS
        try {
          doc.addPage();
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(...colorPrimario);
          doc.text('Visualización Gráfica', 14, 20);

          // Usar los primeros 10 distritos
          const top10 = data.data.slice(0, 10);

          console.log('📊 Generando gráfico de distritos desde datos...');
          const chartDistritosImg = await generarGraficoComoImagen('barras', top10);
          if (chartDistritosImg) {
            doc.text('Top 10 Distritos con Más Votos', 14, 35);
            doc.addImage(chartDistritosImg, 'PNG', 14, 40, 180, 120);
            console.log('✅ Gráfico de distritos agregado');
          }
        } catch (error) {
          console.log('Error generando gráfico de distritos:', error);
        }

        // Resumen en nueva página
        if (doc.internal.getCurrentPageInfo().pageNumber > 1) {
          yPos = 180;
        } else {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Resumen:', 14, yPos);
        yPos += 7;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Total de distritos: ${data.total_distritos}`, 14, yPos);
        yPos += 6;
        doc.text(`Total de votos: ${data.total_votos?.toLocaleString() || 'N/A'}`, 14, yPos);
      }
    }

    // Pie de página
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(...colorSecundario);
      doc.text(
        `Página ${i} de ${pageCount}`,
        105,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
      doc.text(
        'Sistema Electoral ONPE - Confidencial',
        14,
        doc.internal.pageSize.height - 10
      );
    }

    // Guardar PDF
    doc.save(`${reporte.nombre.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const verVistaPrevia = async (reporte) => {
    try {
      const response = await fetch(`${API_URL}${reporte.endpoint}`);
      const data = await response.json();

      setDatosVistaPrevia(data);
      setReporteActual(reporte);
      setModalVistaPrevia(true);
    } catch (err) {
      console.error('Error en vista previa:', err);
      alert('❌ Error al cargar vista previa');
    }
  };

  const cerrarModal = () => {
    setModalVistaPrevia(false);
    setDatosVistaPrevia(null);
    setReporteActual(null);
  };

  const tiposReporte = [
    { id: 'todos', nombre: 'Todos los Reportes', count: reportesGenerados.length },
    { id: 'Estadístico', nombre: 'Estadísticos', count: reportesGenerados.filter(r => r.tipo === 'Estadístico').length },
    { id: 'Resultados', nombre: 'Resultados', count: reportesGenerados.filter(r => r.tipo === 'Resultados').length },
    { id: 'Auditoría', nombre: 'Auditoría', count: reportesGenerados.filter(r => r.tipo === 'Auditoría').length },
  ];

  const reportesFiltrados = filtroTipo === 'todos'
    ? reportesGenerados
    : reportesGenerados.filter(r => r.tipo === filtroTipo);

  // Animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
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
      transition: { duration: 0.4 }
    },
    hover: {
      scale: 1.02,
      backgroundColor: "rgba(249, 250, 251, 1)",
      transition: { duration: 0.2 }
    }
  };

  // Estado de carga
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin text-slate-600 mx-auto mb-4" size={48} />
          <p className="text-gray-600">Cargando reportes...</p>
        </div>
      </div>
    );
  }

  // Estado de error
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center max-w-md">
          <AlertCircle className="text-red-600 mx-auto mb-4" size={48} />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Error al Cargar Reportes</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={cargarDatos}
            className="px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

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
            <p className="text-sm opacity-90">
              {estadisticas?.total_votantes.toLocaleString()} votantes | {estadisticas?.votos.total.toLocaleString()} votos registrados
            </p>
          </div>
          <motion.button
            onClick={cargarDatos}
            className="flex items-center gap-2 px-6 py-3 bg-white text-slate-600 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <FileText size={18} />
            Actualizar Reportes
          </motion.button>
        </div>
      </motion.div>

      {/* Estadísticas de Reportes */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            icon: FileText,
            color: 'slate',
            title: 'Total Reportes',
            value: reportesGenerados.length.toString(),
            bgColor: 'slate'
          },
          {
            icon: Users,
            color: 'green',
            title: 'Total Votantes',
            value: estadisticas?.total_votantes.toLocaleString() || '0',
            bgColor: 'green'
          },
          {
            icon: TrendingUp,
            color: 'blue',
            title: 'Votos Procesados',
            value: `${estadisticas?.datos_procesados.toFixed(1) || '0'}%`,
            bgColor: 'blue'
          },
          {
            icon: BarChart3,
            color: 'purple',
            title: 'Total Votos',
            value: estadisticas?.votos.total.toLocaleString() || '0',
            bgColor: 'purple'
          }
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

      {/* Filtros */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
      >
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={20} className="text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Filtrar por tipo:</span>
          {tiposReporte.map((tipo) => (
            <motion.button
              key={tipo.id}
              onClick={() => setFiltroTipo(tipo.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filtroTipo === tipo.id
                ? 'bg-slate-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              {tipo.nombre} ({tipo.count})
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Lista de Reportes */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-xl shadow-sm border border-gray-200"
      >
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-800">
            {filtroTipo === 'todos' ? 'Todos los Reportes' : `Reportes de ${filtroTipo}`}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {reportesFiltrados.length} reporte(s) disponible(s)
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          <AnimatePresence>
            {reportesFiltrados.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-12 text-center"
              >
                <FileText className="text-gray-400 mx-auto mb-4" size={48} />
                <p className="text-gray-600">No hay reportes disponibles en esta categoría</p>
              </motion.div>
            ) : (
              reportesFiltrados.map((reporte, index) => {
                const IconoReporte = reporte.icono || FileText;
                return (
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
                        className={`p-3 rounded-lg ${reporte.formato === 'PDF' ? 'bg-red-100' : 'bg-green-100'
                          }`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        <IconoReporte className={
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
                              <span className="text-xs text-gray-500">Formato: {reporte.formato}</span>
                            </div>
                          </div>
                          <motion.span
                            className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200 }}
                          >
                            {reporte.estado}
                          </motion.span>
                        </div>

                        <motion.div
                          className="flex gap-2 mt-4"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          transition={{ duration: 0.3 }}
                        >
                          <motion.button
                            onClick={() => descargarReporte(reporte)}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white hover:bg-slate-700 rounded-lg transition-colors text-sm"
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                          >
                            <Download size={16} />
                            Descargar
                          </motion.button>

                          <motion.button
                            onClick={() => verVistaPrevia(reporte)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors text-sm"
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                          >
                            <Eye size={16} />
                            Vista Previa
                          </motion.button>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Modal de Vista Previa */}
      <AnimatePresence>
        {modalVistaPrevia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={cerrarModal}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header del Modal */}
              <div className="bg-gradient-to-r from-slate-600 to-slate-700 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">{reporteActual?.nombre}</h3>
                    <p className="text-sm opacity-90 mt-1">{reporteActual?.descripcion}</p>
                  </div>
                  <button
                    onClick={cerrarModal}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* Contenido del Modal */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                {datosVistaPrevia && reporteActual?.endpoint === '/api/estadisticas/dashboard' && (
                  <VistaPreviaDashboard data={datosVistaPrevia.data} />
                )}

                {datosVistaPrevia && reporteActual?.endpoint.includes('votos-por-distrito') && (
                  <VistaPreviaDistritos data={datosVistaPrevia} />
                )}

                {datosVistaPrevia && reporteActual?.endpoint === '/upload/analyze' && (
                  <VistaPreviaAnalisis data={datosVistaPrevia} />
                )}
              </div>

              {/* Footer del Modal */}
              <div className="border-t border-gray-200 p-4 flex justify-end gap-3">
                <button
                  onClick={cerrarModal}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    descargarReporte(reporteActual);
                    cerrarModal();
                  }}
                  className="flex items-center gap-2 px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                >
                  <Download size={18} />
                  Descargar PDF
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Componente para Vista Previa del Dashboard
const VistaPreviaDashboard = ({ data }) => {
  // Preparar datos para gráficos
  const votosData = [
    { name: 'Presidencial', votos: data.votos.presidencial, fill: '#3b82f6' },
    { name: 'Regional', votos: data.votos.regional, fill: '#10b981' },
    { name: 'Distrital', votos: data.votos.distrital, fill: '#8b5cf6' }
  ];

  const COLORS = ['#3b82f6', '#10b981', '#8b5cf6'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Votantes" value={data.total_votantes.toLocaleString()} color="blue" />
        <StatCard title="Registros Cargados" value={data.registros_cargados.toLocaleString()} color="green" />
        <StatCard title="Datos Procesados" value={`${data.datos_procesados}%`} color="purple" />
        <StatCard title="Total Votos" value={data.votos.total.toLocaleString()} color="orange" />
      </div>

      {/* Gráfico de Barras */}
      <div className="bg-white rounded-lg border border-gray-200 p-6" id="chart-votos-tipo">
        <h4 className="font-bold text-gray-800 mb-4">Distribución de Votos por Tipo</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={votosData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              formatter={(value) => value.toLocaleString()}
            />
            <Legend />
            <Bar dataKey="votos" fill="#475569" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico de Pastel */}
      <div className="bg-white rounded-lg border border-gray-200 p-6" id="chart-votos-pie">
        <h4 className="font-bold text-gray-800 mb-4">Proporción de Votos</h4>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={votosData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="votos"
            >
              {votosData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => value.toLocaleString()} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {data.actividad_reciente && data.actividad_reciente.length > 0 && (
        <div>
          <h4 className="font-bold text-gray-800 mb-3">Actividad Reciente</h4>
          <div className="space-y-2">
            {data.actividad_reciente.slice(0, 5).map((actividad, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">{actividad.action}</p>
                  <p className="text-sm text-gray-600">{actividad.time}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${actividad.status === 'success'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
                  }`}>
                  {actividad.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Componente para Vista Previa de Distritos
const VistaPreviaDistritos = ({ data }) => {
  const topDistritos = data.data?.slice(0, 10) || [];
  const total = data.total_votos || 0;

  // Preparar datos para el gráfico
  const chartData = topDistritos.map(d => ({
    distrito: d.distrito.length > 15 ? d.distrito.substring(0, 15) + '...' : d.distrito,
    votos: d.votos
  }));

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Total de Distritos</p>
            <p className="text-3xl font-bold text-blue-600">{data.total_distritos}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Total de Votos</p>
            <p className="text-3xl font-bold text-purple-600">{total.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Gráfico de Barras Horizontales */}
      <div className="bg-white rounded-lg border border-gray-200 p-6" id="chart-distritos-bar">
        <h4 className="font-bold text-gray-800 mb-4">Top 10 Distritos - Visualización</h4>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis type="number" stroke="#6b7280" />
            <YAxis dataKey="distrito" type="category" width={120} stroke="#6b7280" />
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              formatter={(value) => value.toLocaleString()}
            />
            <Legend />
            <Bar dataKey="votos" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h4 className="font-bold text-gray-800 mb-4">Top 10 Distritos por Votos</h4>
        <div className="space-y-3">
          {topDistritos.map((distrito, index) => {
            const porcentaje = total > 0 ? (distrito.votos / total * 100) : 0;
            return (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-600 text-white rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <span className="font-medium text-gray-800">{distrito.distrito}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">{distrito.votos.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">{porcentaje.toFixed(1)}%</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${porcentaje}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Componente para Vista Previa de Análisis
const VistaPreviaAnalisis = ({ data }) => {
  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800">
          📊 Los datos de análisis se mostrarán aquí cuando estén disponibles.
        </p>
      </div>
      <pre className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-96 text-sm">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
};

// Componente auxiliar para tarjetas de estadísticas
const StatCard = ({ title, value, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    green: 'bg-green-50 border-green-200 text-green-600',
    purple: 'bg-purple-50 border-purple-200 text-purple-600',
    orange: 'bg-orange-50 border-orange-200 text-orange-600'
  };

  return (
    <div className={`${colorClasses[color]} border rounded-lg p-4`}>
      <p className="text-sm mb-1 opacity-80">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
};

export default Reportes;