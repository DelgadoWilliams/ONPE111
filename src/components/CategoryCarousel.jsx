// sistema-electoral/src/components/CategoryCarousel.jsx
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Vote, MapPin, Users, FileText, Eye } from 'lucide-react';

const CategoryCarousel = ({ 
    title, 
    description, 
    icon, 
    color, 
    candidates, 
    onViewProposals,
    categoryType 
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const itemsPerPage = 3; // Mostrar 3 candidatos a la vez
    const totalPages = Math.ceil(candidates.length / itemsPerPage);

    const goToPrevious = () => {
        setCurrentIndex((prevIndex) => (prevIndex === 0 ? totalPages - 1 : prevIndex - 1));
    };

    const goToNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex === totalPages - 1 ? 0 : prevIndex + 1));
    };

    const goToSlide = (index) => {
        setCurrentIndex(index);
    };

    const getCandidatesToShow = () => {
        const start = currentIndex * itemsPerPage;
        const end = start + itemsPerPage;
        return candidates.slice(start, end);
    };

    return (
        <div className="w-full py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 bg-${color}-100 rounded-full flex items-center justify-center`}>
                            {icon}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                            <p className="text-gray-600">{description}</p>
                        </div>
                    </div>
                    <button 
                        className={`px-6 py-3 bg-${color}-600 hover:bg-${color}-700 text-white rounded-xl font-medium transition-colors`}
                        onClick={() => console.log(`Ver todos los candidatos ${categoryType}`)}
                    >
                        Ver Todos
                    </button>
                </div>
                
                {/* Carousel Container */}
                <div className="relative">
                    {/* Carousel Inner */}
                    <div className="overflow-hidden rounded-2xl">
                        <div 
                            className="flex transition-transform duration-500 ease-in-out gap-4"
                            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                        >
                            {Array.from({ length: totalPages }).map((_, pageIndex) => (
                                <div key={pageIndex} className="w-full flex-shrink-0">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {candidates.slice(pageIndex * itemsPerPage, (pageIndex + 1) * itemsPerPage).map((candidate) => (
                                            <div key={candidate.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all">
                                                {/* Candidate Header */}
                                                <div className={`h-2 bg-${color}-500`}></div>
                                                <div className="p-5">
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <img
                                                            src={candidate.photo}
                                                            alt={candidate.nombre}
                                                            className="w-14 h-14 rounded-lg object-cover border-2 border-gray-200"
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-bold text-gray-900 text-lg truncate">{candidate.nombre}</h3>
                                                            <p className="text-sm text-gray-600 flex items-center gap-2">
                                                                <img 
                                                                    src={candidate.logo} 
                                                                    alt={candidate.partido}
                                                                    className="w-4 h-4 rounded-full"
                                                                />
                                                                {candidate.partido}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Propuesta Principal */}
                                                    <div className="mb-4">
                                                        <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed">
                                                            {candidate.propuestaPrincipal || candidate.propuestas?.split('\n')[0]}
                                                        </p>
                                                    </div>
                                                    
                                                    {/* Acciones */}
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => onViewProposals(candidate)}
                                                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
                                                        >
                                                            <Eye size={14} />
                                                            Ver Propuestas
                                                        </button>
                                                        <button
                                                            className={`flex-1 px-3 py-2 bg-${color}-600 hover:bg-${color}-700 text-white rounded-lg transition-colors text-sm font-medium`}
                                                            onClick={() => console.log(`Seleccionar ${candidate.nombre}`)}
                                                        >
                                                            Seleccionar
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Navigation Buttons */}
                    {totalPages > 1 && (
                        <>
                            <button 
                                onClick={goToPrevious}
                                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors z-10 border border-gray-200"
                                aria-label="Anterior"
                            >
                                <ChevronLeft size={20} className="text-gray-700" />
                            </button>
                            <button 
                                onClick={goToNext}
                                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors z-10 border border-gray-200"
                                aria-label="Siguiente"
                            >
                                <ChevronRight size={20} className="text-gray-700" />
                            </button>
                        </>
                    )}
                </div>
                
                {/* Indicators */}
                {totalPages > 1 && (
                    <div className="flex justify-center mt-6 space-x-2">
                        {Array.from({ length: totalPages }).map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={`w-2 h-2 rounded-full transition-colors ${
                                    index === currentIndex ? `bg-${color}-600` : 'bg-gray-300'
                                }`}
                                aria-label={`Ir a página ${index + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoryCarousel;