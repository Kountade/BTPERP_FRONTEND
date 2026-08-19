// src/components/rh/PointageList.jsx
// Liste des pointages des employés

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Clock, Plus, Edit, Trash2, Eye, Search,
  ChevronDown, ChevronUp, RefreshCw, AlertTriangle,
  UserCircle, Building2, Calendar, Wifi, WifiOff,
  MapPin, CheckCircle, XCircle, Users,
  Filter, Download, Printer, Loader2
} from 'lucide-react';
import AxiosInstance from '../AxiosInstance';

function PointageList() {
  const navigate = useNavigate();
  const [pointages, setPointages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterEmploye, setFilterEmploye] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [employes, setEmployes] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPointage, setSelectedPointage] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Options
  const TYPE_CHOICES = [
    { value: 'arrivee', label: 'Arrivée' },
    { value: 'depart', label: 'Départ' },
    { value: 'pause', label: 'Pause' },
    { value: 'retour_pause', label: 'Retour de pause' },
    { value: 'heure_sup', label: 'Heure supplémentaire' }
  ];

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

  // Charger les données
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('Token');
      if (!token) {
        navigate('/login');
        return;
      }

      const [pointagesRes, employesRes] = await Promise.all([
        AxiosInstance.get('/pointages/', {
          headers: { Authorization: `Token ${token}` }
        }),
        AxiosInstance.get('/employes/', {
          headers: { Authorization: `Token ${token}` }
        })
      ]);

      console.log('📊 Pointages chargés:', pointagesRes.data?.length || 0);
      console.log('👤 Employés chargés:', employesRes.data?.length || 0);

      setPointages(pointagesRes.data || []);
      setEmployes(employesRes.data || []);
      
      // Sauvegarder en cache
      try {
        localStorage.setItem('pointages_cache', JSON.stringify(pointagesRes.data || []));
      } catch (e) {
        console.warn('Cache non disponible');
      }

    } catch (error) {
      console.error('❌ Erreur chargement:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        setError('Erreur lors du chargement des pointages: ' + (error.message || 'Erreur inconnue'));
        // Essayer le cache
        try {
          const cachedData = localStorage.getItem('pointages_cache');
          if (cachedData) {
            setPointages(JSON.parse(cachedData));
          }
        } catch (e) {
          setPointages([]);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Rafraîchir
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // Charger au montage
  useEffect(() => {
    loadData();
  }, []);

  // Filtrer les pointages
  const filteredPointages = pointages.filter(p => {
    const employeNom = (p.employe_nom || '').toLowerCase();
    const matchSearch = employeNom.includes(searchTerm.toLowerCase());
    const matchEmploye = filterEmploye === 'all' || p.employe === parseInt(filterEmploye);
    const matchType = filterType === 'all' || p.type_pointage === filterType;
    const matchDate = !filterDate || p.date === filterDate;
    return matchSearch && matchEmploye && matchType && matchDate;
  });

  // Supprimer un pointage
  const handleDelete = async () => {
    if (!selectedPointage) return;
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('Token');
      await AxiosInstance.delete(`/pointages/${selectedPointage.id}/`, {
        headers: { Authorization: `Token ${token}` }
      });
      setPointages(pointages.filter(p => p.id !== selectedPointage.id));
      setShowDeleteModal(false);
      setSelectedPointage(null);
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Statistiques
  const stats = {
    total: pointages.length,
    arrivees: pointages.filter(p => p.type_pointage === 'arrivee').length,
    departs: pointages.filter(p => p.type_pointage === 'depart').length,
    pauses: pointages.filter(p => p.type_pointage === 'pause').length
  };

  const getTypeColor = (type) => {
    const colors = {
      'arrivee': 'success',
      'depart': 'error',
      'pause': 'warning',
      'retour_pause': 'info',
      'heure_sup': 'secondary'
    };
    return colors[type] || 'neutral';
  };

  const getTypeIcon = (type) => {
    const icons = {
      'arrivee': '✅',
      'depart': '🚪',
      'pause': '☕',
      'retour_pause': '🔄',
      'heure_sup': '⏰'
    };
    return icons[type] || '📌';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-base-content/60">Chargement des pointages...</p>
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
            <Clock className="w-8 h-8 text-primary" />
            Pointages
          </h1>
          <p className="text-base-content/60 text-sm mt-1">
            Suivi des pointages des employés
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
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Rafraîchir
          </button>
          <Link to="/pointages/create" className="btn btn-primary gap-2">
            <Plus className="w-5 h-5" />
            Nouveau pointage
          </Link>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="stat bg-base-100 rounded-lg shadow-sm p-4">
          <div className="stat-title text-xs">Total</div>
          <div className="stat-value text-2xl">{stats.total}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg shadow-sm p-4">
          <div className="stat-title text-xs">Arrivées</div>
          <div className="stat-value text-2xl text-success">{stats.arrivees}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg shadow-sm p-4">
          <div className="stat-title text-xs">Départs</div>
          <div className="stat-value text-2xl text-error">{stats.departs}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg shadow-sm p-4">
          <div className="stat-title text-xs">Pauses</div>
          <div className="stat-value text-2xl text-warning">{stats.pauses}</div>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-4 bg-base-100 p-4 rounded-lg shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
          <input
            type="text"
            placeholder="Rechercher par employé..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input input-bordered w-full pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <select 
            value={filterEmploye} 
            onChange={(e) => setFilterEmploye(e.target.value)}
            className="select select-bordered select-sm"
          >
            <option value="all">Tous les employés</option>
            {employes.map(e => {
              const fullName = `${e.prenom || ''} ${e.nom || ''}`.trim() || e.email;
              return (
                <option key={e.id} value={e.id}>{fullName}</option>
              );
            })}
          </select>
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            className="select select-bordered select-sm"
          >
            <option value="all">Tous les types</option>
            {TYPE_CHOICES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="input input-bordered input-sm w-36"
          />
          <button 
            onClick={() => {
              setFilterDate('');
              setFilterEmploye('all');
              setFilterType('all');
              setSearchTerm('');
            }}
            className="btn btn-ghost btn-sm gap-1"
          >
            <Filter className="w-4 h-4" />
            Réinitialiser
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-warning shadow-lg">
          <AlertTriangle className="w-6 h-6" />
          <span>{error}</span>
          <button onClick={handleRefresh} className="btn btn-sm btn-ghost">Réessayer</button>
        </div>
      )}

      {filteredPointages.length === 0 ? (
        <div className="text-center py-12 bg-base-100 rounded-lg shadow-sm">
          <Clock className="w-16 h-16 text-base-content/20 mx-auto mb-4" />
          <h3 className="text-lg font-medium">Aucun pointage trouvé</h3>
          <p className="text-base-content/60 text-sm mt-1">
            {searchTerm || filterEmploye !== 'all' || filterType !== 'all' || filterDate
              ? 'Aucun pointage ne correspond à vos filtres'
              : 'Commencez par créer votre premier pointage'}
          </p>
          <Link to="/pointages/create" className="btn btn-primary mt-4 gap-2">
            <Plus className="w-5 h-5" />
            Créer un pointage
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPointages.map((p) => {
            const isExpanded = expandedId === p.id;
            const typeColor = getTypeColor(p.type_pointage);
            const typeIcon = getTypeIcon(p.type_pointage);

            return (
              <div 
                key={p.id} 
                className={`bg-base-100 rounded-lg shadow-sm border border-base-200 overflow-hidden transition-all`}
              >
                <div 
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-base-200/50 transition-colors"
                  onClick={() => toggleExpand(p.id)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`p-2 rounded-lg bg-${typeColor}/10 text-${typeColor}`}>
                      <span className="text-xl">{typeIcon}</span>
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-base truncate">
                          {p.employe_nom || 'Employé inconnu'}
                        </h3>
                        <span className={`badge badge-${typeColor} badge-sm`}>
                          {p.type_display || p.type_pointage}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-base-content/60 mt-0.5 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {p.date ? new Date(p.date).toLocaleDateString('fr-FR') : 'N/A'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {p.heure || 'N/A'}
                        </span>
                        {p.projet_nom && (
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {p.projet_nom}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="flex items-center gap-1">
                      <Link 
                        to={`/pointages/${p.id}`} 
                        className="btn btn-ghost btn-sm btn-square"
                        onClick={(e) => e.stopPropagation()}
                        title="Voir les détails"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link 
                        to={`/pointages/edit/${p.id}`} 
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
                          setSelectedPointage(p);
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
                          toggleExpand(p.id);
                        }}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Détails étendus */}
                {isExpanded && (
                  <div className="border-t border-base-200 p-4 bg-base-200/30">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <h4 className="text-xs font-semibold uppercase text-base-content/40 mb-2 flex items-center gap-1">
                          <UserCircle className="w-3 h-3" />
                          Informations
                        </h4>
                        <p className="text-sm">Employé: {p.employe_nom || 'N/A'}</p>
                        <p className="text-sm">Type: {p.type_display || p.type_pointage}</p>
                        <p className="text-sm">Date: {p.date ? new Date(p.date).toLocaleDateString('fr-FR') : 'N/A'}</p>
                        <p className="text-sm">Heure: {p.heure || 'N/A'}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold uppercase text-base-content/40 mb-2 flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          Projet / Tâche
                        </h4>
                        <p className="text-sm">Projet: {p.projet_nom || 'Non spécifié'}</p>
                        <p className="text-sm">Tâche: {p.tache_nom || 'Non spécifiée'}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold uppercase text-base-content/40 mb-2 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          Localisation
                        </h4>
                        {p.latitude && p.longitude ? (
                          <>
                            <p className="text-sm">Lat: {p.latitude}</p>
                            <p className="text-sm">Lng: {p.longitude}</p>
                            <a 
                              href={`https://www.google.com/maps?q=${p.latitude},${p.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline"
                            >
                              Voir sur la carte →
                            </a>
                          </>
                        ) : (
                          <p className="text-sm text-base-content/40">Non géolocalisé</p>
                        )}
                        {p.remarque && (
                          <p className="text-sm mt-2 text-base-content/60">Remarque: {p.remarque}</p>
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

      {/* Modal de suppression */}
      {showDeleteModal && selectedPointage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-base-100 rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 text-error mb-4">
              <AlertTriangle className="w-8 h-8" />
              <h3 className="text-xl font-bold">Confirmer la suppression</h3>
            </div>
            <p className="text-base-content/70">
              Êtes-vous sûr de vouloir supprimer le pointage de 
              <span className="font-semibold text-base-content"> "{selectedPointage.employe_nom}"</span> ?
            </p>
            <p className="text-sm text-error/70 mt-2">
              ⚠️ Cette action est irréversible.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedPointage(null);
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
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                {isDeleting ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PointageList;