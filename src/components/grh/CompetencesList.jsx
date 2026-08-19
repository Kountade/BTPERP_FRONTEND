// src/components/rh/CompetencesList.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Award, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  AlertTriangle,
  Wifi,
  WifiOff,
  CheckCircle,
  XCircle,
  Filter,
  BookOpen,
  Users,
  Briefcase
} from 'lucide-react';
import AxiosInstance from '../AxiosInstance';

function CompetencesList() {
  const navigate = useNavigate();
  const [competences, setCompetences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategorie, setFilterCategorie] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCompetence, setSelectedCompetence] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Catégories disponibles (à adapter selon votre base de données)
  const CATEGORIES = [
    'Technique',
    'Sécurité',
    'Management',
    'Informatique',
    'Administratif',
    'BTP',
    'Conduite',
    'Maintenance'
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

  // Charger les compétences
  const loadCompetences = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('Token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await AxiosInstance.get('/competences/', {
        headers: { Authorization: `Token ${token}` }
      });

      setCompetences(response.data || []);
    } catch (error) {
      console.error('Erreur chargement compétences:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        setError('Erreur lors du chargement des compétences');
        const cachedData = localStorage.getItem('competences_cache');
        if (cachedData) {
          setCompetences(JSON.parse(cachedData));
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Rafraîchir
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadCompetences();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // Sauvegarder en cache
  useEffect(() => {
    if (competences.length > 0) {
      localStorage.setItem('competences_cache', JSON.stringify(competences));
    }
  }, [competences]);

  // Charger au montage
  useEffect(() => {
    loadCompetences();
  }, []);

  // Filtrer les compétences
  const filteredCompetences = competences.filter(comp => {
    const matchSearch = comp.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       comp.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       comp.categorie?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategorie = filterCategorie === 'all' || comp.categorie === filterCategorie;
    return matchSearch && matchCategorie;
  });

  // Supprimer une compétence
  const handleDelete = async () => {
    if (!selectedCompetence) return;
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('Token');
      await AxiosInstance.delete(`/competences/${selectedCompetence.id}/`, {
        headers: { Authorization: `Token ${token}` }
      });
      setCompetences(competences.filter(c => c.id !== selectedCompetence.id));
      setShowDeleteModal(false);
      setSelectedCompetence(null);
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
    total: competences.length,
    parCategorie: CATEGORIES.map(cat => ({
      nom: cat,
      count: competences.filter(c => c.categorie === cat).length
    }))
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="mt-4 text-base-content/60">Chargement des compétences...</p>
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
            <Award className="w-8 h-8 text-primary" />
            Compétences
          </h1>
          <p className="text-base-content/60 text-sm mt-1">
            Gérez les compétences et qualifications des employés
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
          <Link to="/competences/create" className="btn btn-primary gap-2">
            <Plus className="w-5 h-5" />
            Nouvelle compétence
          </Link>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="stat bg-base-100 rounded-lg shadow-sm p-4">
          <div className="stat-title text-xs">Total</div>
          <div className="stat-value text-2xl">{stats.total}</div>
        </div>
        {stats.parCategorie.slice(0, 3).map(cat => (
          <div key={cat.nom} className="stat bg-base-100 rounded-lg shadow-sm p-4">
            <div className="stat-title text-xs">{cat.nom}</div>
            <div className="stat-value text-2xl text-info">{cat.count}</div>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-4 bg-base-100 p-4 rounded-lg shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
          <input
            type="text"
            placeholder="Rechercher une compétence..."
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
              <option key={cat} value={cat}>{cat}</option>
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

      {filteredCompetences.length === 0 ? (
        <div className="text-center py-12 bg-base-100 rounded-lg shadow-sm">
          <Award className="w-16 h-16 text-base-content/20 mx-auto mb-4" />
          <h3 className="text-lg font-medium">Aucune compétence trouvée</h3>
          <p className="text-base-content/60 text-sm mt-1">
            {searchTerm || filterCategorie !== 'all'
              ? 'Aucune compétence ne correspond à vos filtres'
              : 'Commencez par créer votre première compétence'}
          </p>
          <Link to="/competences/create" className="btn btn-primary mt-4 gap-2">
            <Plus className="w-5 h-5" />
            Créer une compétence
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCompetences.map((comp) => {
            const isExpanded = expandedId === comp.id;

            return (
              <div 
                key={comp.id} 
                className="bg-base-100 rounded-lg shadow-sm border border-base-200 overflow-hidden transition-all"
              >
                <div 
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-base-200/50 transition-colors"
                  onClick={() => toggleExpand(comp.id)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="badge badge-primary badge-lg gap-1 flex-shrink-0">
                      <Award className="w-3 h-3" />
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-base truncate">
                        {comp.nom}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-base-content/60 mt-0.5">
                        {comp.categorie && (
                          <span className="badge badge-ghost badge-xs">
                            {comp.categorie}
                          </span>
                        )}
                        {comp.description && (
                          <span className="truncate max-w-xs">{comp.description}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Link 
                      to={`/competences/${comp.id}`} 
                      className="btn btn-ghost btn-sm btn-square"
                      onClick={(e) => e.stopPropagation()}
                      title="Voir les détails"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link 
                      to={`/competences/edit/${comp.id}`} 
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
                        setSelectedCompetence(comp);
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
                        toggleExpand(comp.id);
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
                        <h4 className="text-xs font-semibold uppercase text-base-content/40 mb-2">Informations</h4>
                        <p className="text-sm"><strong>Nom:</strong> {comp.nom}</p>
                        {comp.categorie && (
                          <p className="text-sm"><strong>Catégorie:</strong> {comp.categorie}</p>
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold uppercase text-base-content/40 mb-2">Description</h4>
                        <p className="text-sm">{comp.description || 'Aucune description'}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold uppercase text-base-content/40 mb-2">Employés</h4>
                        <p className="text-sm flex items-center gap-1">
                          <Users className="w-4 h-4 text-base-content/40" />
                          {comp.employes_count || 0} employés
                        </p>
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
      {showDeleteModal && selectedCompetence && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-base-100 rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 text-error mb-4">
              <AlertTriangle className="w-8 h-8" />
              <h3 className="text-xl font-bold">Confirmer la suppression</h3>
            </div>
            <p className="text-base-content/70">
              Êtes-vous sûr de vouloir supprimer la compétence 
              <span className="font-semibold text-base-content"> "{selectedCompetence.nom}"</span> ?
            </p>
            <p className="text-sm text-error/70 mt-2">
              ⚠️ Cette action est irréversible.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedCompetence(null);
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

export default CompetencesList;