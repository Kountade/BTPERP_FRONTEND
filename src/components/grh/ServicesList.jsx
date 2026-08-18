// src/components/ServicesList.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { 
  Building2, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  Users,
  Briefcase,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Wifi,
  WifiOff
} from 'lucide-react';

import AxiosInstance from '../AxiosInstance';

function ServicesList() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Surveiller la connexion
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Charger les services
  const loadServices = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('Token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await AxiosInstance.get('/services/', {
        headers: { Authorization: `Token ${token}` }
      });

      setServices(response.data || []);
    } catch (error) {
      console.error('Erreur chargement services:', error);
      
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        setError('Erreur lors du chargement des services');
        const cachedData = localStorage.getItem('services_cache');
        if (cachedData) {
          setServices(JSON.parse(cachedData));
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Rafraîchir avec animation
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadServices();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // Sauvegarder en cache local
  useEffect(() => {
    if (services.length > 0) {
      localStorage.setItem('services_cache', JSON.stringify(services));
    }
  }, [services]);

  // Charger au montage
  useEffect(() => {
    loadServices();
  }, []);

  // Filtrer les services
  const filteredServices = services.filter(service => {
    const matchSearch = service.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       service.code?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch;
  });

  // Supprimer un service
  const handleDelete = async () => {
    if (!selectedService) return;
    
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('Token');
      await AxiosInstance.delete(`/services/${selectedService.id}/`, {
        headers: { Authorization: `Token ${token}` }
      });

      setServices(services.filter(s => s.id !== selectedService.id));
      setShowDeleteModal(false);
      setSelectedService(null);
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  // Toggle expansion
  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Statistiques
  const stats = {
    total: services.length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="mt-4 text-base-content/60">Chargement des services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="w-8 h-8 text-primary" />
            Services & Départements
          </h1>
          <p className="text-base-content/60 text-sm mt-1">
            Gérez les services et départements de l'entreprise
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className={`badge ${isOnline ? 'badge-success' : 'badge-error'} gap-1.5 px-3 py-2.5`}>
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            {isOnline ? 'En ligne' : 'Hors ligne'}
          </div>
          <button 
            onClick={handleRefresh}
            className={`btn btn-ghost btn-sm gap-1.5 ${isRefreshing ? 'animate-spin' : ''}`}
            title="Rafraîchir la liste"
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Rafraîchir
          </button>
          <Link to="/services/create" className="btn btn-primary gap-2">
            <Plus className="w-5 h-5" />
            Nouveau service
          </Link>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="stat bg-base-100 rounded-lg shadow-sm p-4">
          <div className="stat-title text-xs">Total</div>
          <div className="stat-value text-2xl">{stats.total}</div>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-4 bg-base-100 p-4 rounded-lg shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
          <input
            type="text"
            placeholder="Rechercher un service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input input-bordered w-full pl-10"
          />
        </div>
        
        <button 
          onClick={handleRefresh} 
          className={`btn btn-ghost btn-sm gap-1 ${isRefreshing ? 'animate-spin' : ''}`}
          title="Rafraîchir"
          disabled={isRefreshing}
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Erreur */}
      {error && (
        <div className="alert alert-warning shadow-lg">
          <AlertTriangle className="w-6 h-6" />
          <span>{error}</span>
          <button onClick={handleRefresh} className="btn btn-sm btn-ghost">Réessayer</button>
        </div>
      )}

      {/* Liste des services */}
      {filteredServices.length === 0 ? (
        <div className="text-center py-12 bg-base-100 rounded-lg shadow-sm">
          <Building2 className="w-16 h-16 text-base-content/20 mx-auto mb-4" />
          <h3 className="text-lg font-medium">Aucun service trouvé</h3>
          <p className="text-base-content/60 text-sm mt-1">
            {searchTerm 
              ? 'Aucun service ne correspond à votre recherche'
              : 'Commencez par créer votre premier service'}
          </p>
          <Link to="/services/create" className="btn btn-primary mt-4 gap-2">
            <Plus className="w-5 h-5" />
            Créer un service
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredServices.map((service) => {
            const isExpanded = expandedId === service.id;

            return (
              <div 
                key={service.id} 
                className="bg-base-100 rounded-lg shadow-sm border border-base-200 overflow-hidden transition-all"
              >
                {/* Ligne principale */}
                <div 
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-base-200/50 transition-colors"
                  onClick={() => toggleExpand(service.id)}
                >
                  <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                    <div className="badge badge-primary badge-lg gap-1 flex-shrink-0">
                      <Building2 className="w-3 h-3" />
                      <span className="hidden sm:inline">{service.code || 'SVC'}</span>
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-base truncate">
                        {service.nom}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-base-content/60 mt-0.5">
                        {service.nb_employes > 0 && (
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {service.nb_employes} employés
                          </span>
                        )}
                        {service.responsable_nom && (
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-3 h-3" />
                            Resp: {service.responsable_nom}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="flex items-center gap-1">
                      <Link 
                        to={`/services/${service.id}`} 
                        className="btn btn-ghost btn-sm btn-square"
                        onClick={(e) => e.stopPropagation()}
                        title="Voir les détails"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link 
                        to={`/services/edit/${service.id}`} 
                        className="btn btn-ghost btn-sm btn-square"
                        onClick={(e) => e.stopPropagation()}
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button 
                        className="btn btn-ghost btn-sm btn-square text-error hover:bg-error/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedService(service);
                          setShowDeleteModal(true);
                        }}
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button 
                        className="btn btn-ghost btn-sm btn-square"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(service.id);
                        }}
                      >
                        {isExpanded ? 
                          <ChevronUp className="w-4 h-4" /> : 
                          <ChevronDown className="w-4 h-4" />
                        }
                      </button>
                    </div>
                  </div>
                </div>

                {/* Détails étendus */}
                {isExpanded && (
                  <div className="border-t border-base-200 p-4 bg-base-200/30">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <h4 className="text-xs font-semibold uppercase text-base-content/40 mb-2">Sous-services</h4>
                        {service.sous_services && service.sous_services.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {service.sous_services.map((ss, idx) => (
                              <span key={idx} className="badge badge-ghost badge-sm">
                                {ss.nom}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-base-content/40">Aucun sous-service</p>
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold uppercase text-base-content/40 mb-2">Responsable</h4>
                        <p className="text-sm">{service.responsable_nom || 'Non assigné'}</p>
                        {service.responsable && (
                          <p className="text-xs text-base-content/40">ID: {service.responsable}</p>
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold uppercase text-base-content/40 mb-2">Code</h4>
                        <p className="text-sm font-mono">{service.code || 'Non défini'}</p>
                        {service.parent && (
                          <p className="text-xs text-base-content/40">
                            Service parent: {service.parent_nom || service.parent}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {showDeleteModal && selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-base-100 rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 text-error mb-4">
              <AlertTriangle className="w-8 h-8" />
              <h3 className="text-xl font-bold">Confirmer la suppression</h3>
            </div>
            
            <p className="text-base-content/70">
              Êtes-vous sûr de vouloir supprimer le service 
              <span className="font-semibold text-base-content"> "{selectedService.nom}"</span> ?
            </p>
            <p className="text-sm text-error/70 mt-2">
              ⚠️ Cette action est irréversible.
            </p>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedService(null);
                }}
                className="btn flex-1"
                disabled={isDeleting}
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                className="btn btn-error flex-1 gap-2"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Suppression...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Supprimer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ServicesList;