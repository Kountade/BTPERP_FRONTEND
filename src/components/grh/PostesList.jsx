// src/components/rh/PostesList.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  AlertTriangle,
  Users,
  Shield,
  Award,
  CheckCircle,
  XCircle,
  Wifi,
  WifiOff,
  Filter,
  Grid,
  List,
  MoreVertical
} from 'lucide-react';
import AxiosInstance from '../AxiosInstance';

function PostesList() {
  const navigate = useNavigate();
  const [postes, setPostes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategorie, setFilterCategorie] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPoste, setSelectedPoste] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Catégories de postes
  const CATEGORIES = [
    { value: 'direction', label: 'Direction', color: 'badge-error' },
    { value: 'maitrise', label: 'Maîtrise', color: 'badge-warning' },
    { value: 'technicien', label: 'Technicien', color: 'badge-info' },
    { value: 'ouvrier', label: 'Ouvrier', color: 'badge-success' },
    { value: 'administratif', label: 'Administratif', color: 'badge-primary' }
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

  // Charger les postes
  const loadPostes = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('Token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await AxiosInstance.get('/postes/', {
        headers: { Authorization: `Token ${token}` }
      });

      setPostes(response.data || []);
    } catch (error) {
      console.error('Erreur chargement postes:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        setError('Erreur lors du chargement des postes');
        const cachedData = localStorage.getItem('postes_cache');
        if (cachedData) {
          setPostes(JSON.parse(cachedData));
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Rafraîchir
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadPostes();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // Sauvegarder en cache
  useEffect(() => {
    if (postes.length > 0) {
      localStorage.setItem('postes_cache', JSON.stringify(postes));
    }
  }, [postes]);

  // Charger au montage
  useEffect(() => {
    loadPostes();
  }, []);

  // Filtrer les postes
  const filteredPostes = postes.filter(poste => {
    const matchSearch = poste.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       poste.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       poste.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategorie = filterCategorie === 'all' || poste.categorie === filterCategorie;
    return matchSearch && matchCategorie;
  });

  // Supprimer un poste
  const handleDelete = async () => {
    if (!selectedPoste) return;
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('Token');
      await AxiosInstance.delete(`/postes/${selectedPoste.id}/`, {
        headers: { Authorization: `Token ${token}` }
      });
      setPostes(postes.filter(p => p.id !== selectedPoste.id));
      setShowDeleteModal(false);
      setSelectedPoste(null);
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
    total: postes.length,
    parCategorie: CATEGORIES.map(cat => ({
      ...cat,
      count: postes.filter(p => p.categorie === cat.value).length
    }))
  };

  // Obtenir la config d'une catégorie
  const getCategorieConfig = (categorie) => {
    return CATEGORIES.find(c => c.value === categorie) || CATEGORIES[0];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="mt-4 text-base-content/60">Chargement des postes...</p>
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
            <Briefcase className="w-8 h-8 text-primary" />
            Postes & Métiers
          </h1>
          <p className="text-base-content/60 text-sm mt-1">
            Gérez tous les postes et métiers de l'entreprise
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
          <Link to="/postes/create" className="btn btn-primary gap-2">
            <Plus className="w-5 h-5" />
            Nouveau poste
          </Link>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="stat bg-base-100 rounded-lg shadow-sm p-4">
          <div className="stat-title text-xs">Total</div>
          <div className="stat-value text-2xl">{stats.total}</div>
        </div>
        {stats.parCategorie.map(cat => (
          <div key={cat.value} className="stat bg-base-100 rounded-lg shadow-sm p-4">
            <div className="stat-title text-xs">{cat.label}</div>
            <div className={`stat-value text-2xl ${cat.color.replace('badge-', 'text-')}`}>
              {cat.count}
            </div>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-4 bg-base-100 p-4 rounded-lg shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
          <input
            type="text"
            placeholder="Rechercher un poste..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input input-bordered w-full pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <select 
            value={filterCategorie} 
            onChange={(e) => setFilterCategorie(e.target.value)}
            className="select select-bordered select-sm"
          >
            <option value="all">Toutes les catégories</option>
            {CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
          <button 
            onClick={handleRefresh} 
            className={`btn btn-ghost btn-sm gap-1 ${isRefreshing ? 'animate-spin' : ''}`}
            disabled={isRefreshing}
          >
            <RefreshCw className="w-4 h-4" />
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

      {filteredPostes.length === 0 ? (
        <div className="text-center py-12 bg-base-100 rounded-lg shadow-sm">
          <Briefcase className="w-16 h-16 text-base-content/20 mx-auto mb-4" />
          <h3 className="text-lg font-medium">Aucun poste trouvé</h3>
          <p className="text-base-content/60 text-sm mt-1">
            {searchTerm || filterCategorie !== 'all'
              ? 'Aucun poste ne correspond à vos filtres'
              : 'Commencez par créer votre premier poste'}
          </p>
          <Link to="/postes/create" className="btn btn-primary mt-4 gap-2">
            <Plus className="w-5 h-5" />
            Créer un poste
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPostes.map((poste) => {
            const catConfig = getCategorieConfig(poste.categorie);
            const isExpanded = expandedId === poste.id;

            return (
              <div 
                key={poste.id} 
                className="bg-base-100 rounded-lg shadow-sm border border-base-200 overflow-hidden transition-all"
              >
                <div 
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-base-200/50 transition-colors"
                  onClick={() => toggleExpand(poste.id)}
                >
                  <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                    <div className={`badge badge-lg ${catConfig.color} gap-1 flex-shrink-0`}>
                      <Briefcase className="w-3 h-3" />
                      <span className="hidden sm:inline">{catConfig.label}</span>
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-base truncate">
                          {poste.nom}
                        </h3>
                        <span className="text-xs text-base-content/40 font-mono">
                          {poste.code}
                        </span>
                        {poste.nb_employes > 0 && (
                          <span className="badge badge-ghost badge-sm flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {poste.nb_employes}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-base-content/60 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Award className="w-3 h-3" />
                          Niveau: {poste.niveau || 'Non défini'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          Coeff: {poste.coefficient || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Link 
                      to={`/postes/${poste.id}`} 
                      className="btn btn-ghost btn-sm btn-square"
                      onClick={(e) => e.stopPropagation()}
                      title="Voir les détails"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link 
                      to={`/postes/edit/${poste.id}`} 
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
                        setSelectedPoste(poste);
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
                        toggleExpand(poste.id);
                      }}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Détails étendus */}
                {isExpanded && (
                  <div className="border-t border-base-200 p-4 bg-base-200/30">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <h4 className="text-xs font-semibold uppercase text-base-content/40 mb-2">Description</h4>
                        <p className="text-sm">{poste.description || 'Aucune description'}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold uppercase text-base-content/40 mb-2">Compétences requises</h4>
                        {poste.competences_requises_detail && poste.competences_requises_detail.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {poste.competences_requises_detail.map((comp, idx) => (
                              <span key={idx} className="badge badge-ghost badge-sm">
                                {comp.nom}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-base-content/40">Aucune compétence requise</p>
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold uppercase text-base-content/40 mb-2">Catégorie</h4>
                        <p className="text-sm">{catConfig.label}</p>
                        <p className="text-sm text-base-content/60">Niveau: {poste.niveau || 'Non défini'}</p>
                        <p className="text-sm text-base-content/60">Coefficient: {poste.coefficient || 'N/A'}</p>
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
      {showDeleteModal && selectedPoste && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-base-100 rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 text-error mb-4">
              <AlertTriangle className="w-8 h-8" />
              <h3 className="text-xl font-bold">Confirmer la suppression</h3>
            </div>
            <p className="text-base-content/70">
              Êtes-vous sûr de vouloir supprimer le poste 
              <span className="font-semibold text-base-content"> "{selectedPoste.nom}"</span> ?
            </p>
            <p className="text-sm text-error/70 mt-2">
              ⚠️ Cette action est irréversible.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedPoste(null);
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
                  <span className="loading loading-spinner loading-sm"></span>
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

export default PostesList;