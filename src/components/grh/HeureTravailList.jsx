// src/components/rh/HeureTravailList.jsx
// Liste des heures travaillées

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Clock, Plus, Edit, Trash2, Search,
  ChevronDown, ChevronUp, RefreshCw, AlertTriangle,
  UserCircle, Building2, Calendar, Wifi, WifiOff,
  CheckCircle, XCircle, Filter, Loader2,
  Timer, TrendingUp, Moon, Sun
} from 'lucide-react';
import AxiosInstance from '../AxiosInstance';

function HeureTravailList() {
  const navigate = useNavigate();
  const [heures, setHeures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterEmploye, setFilterEmploye] = useState('all');
  const [filterValide, setFilterValide] = useState('all');
  const [employes, setEmployes] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedHeure, setSelectedHeure] = useState(null);
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

      const [heuresRes, employesRes] = await Promise.all([
        AxiosInstance.get('/heures-travail/', {
          headers: { Authorization: `Token ${token}` }
        }),
        AxiosInstance.get('/employes/', {
          headers: { Authorization: `Token ${token}` }
        })
      ]);

      console.log('📊 Heures chargées:', heuresRes.data?.length || 0);
      setHeures(heuresRes.data || []);
      setEmployes(employesRes.data || []);

    } catch (error) {
      console.error('❌ Erreur chargement:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        setError('Erreur lors du chargement des heures travaillées');
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

  // Filtrer
  const filteredHeures = heures.filter(h => {
    const employeNom = (h.employe_nom || '').toLowerCase();
    const matchSearch = employeNom.includes(searchTerm.toLowerCase());
    const matchEmploye = filterEmploye === 'all' || h.employe === parseInt(filterEmploye);
    const matchDate = !filterDate || h.date === filterDate;
    const matchValide = filterValide === 'all' || 
                       (filterValide === 'valide' && h.valide) ||
                       (filterValide === 'non_valide' && !h.valide);
    return matchSearch && matchEmploye && matchDate && matchValide;
  });

  // Supprimer
  const handleDelete = async () => {
    if (!selectedHeure) return;
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('Token');
      await AxiosInstance.delete(`/heures-travail/${selectedHeure.id}/`, {
        headers: { Authorization: `Token ${token}` }
      });
      setHeures(heures.filter(h => h.id !== selectedHeure.id));
      setShowDeleteModal(false);
      setSelectedHeure(null);
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  // Valider
  const handleValider = async (id) => {
    try {
      const token = localStorage.getItem('Token');
      await AxiosInstance.post(`/heures-travail/${id}/valider/`, {}, {
        headers: { Authorization: `Token ${token}` }
      });
      await loadData();
    } catch (error) {
      console.error('Erreur validation:', error);
      alert('Erreur lors de la validation');
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Statistiques
  const stats = {
    total: heures.length,
    validees: heures.filter(h => h.valide).length,
    nonValidees: heures.filter(h => !h.valide).length,
    totalHeures: heures.reduce((acc, h) => acc + parseFloat(h.total_heures || 0), 0)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-base-content/60">Chargement des heures travaillées...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Timer className="w-8 h-8 text-primary" />
            Heures travaillées
          </h1>
          <p className="text-base-content/60 text-sm mt-1">
            Suivi des heures travaillées par employé
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
          <Link to="/heures-travail/create" className="btn btn-primary gap-2">
            <Plus className="w-5 h-5" />
            Nouvelle saisie
          </Link>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="stat bg-base-100 rounded-lg shadow-sm p-4">
          <div className="stat-title text-xs">Total saisies</div>
          <div className="stat-value text-2xl">{stats.total}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg shadow-sm p-4">
          <div className="stat-title text-xs">Validées</div>
          <div className="stat-value text-2xl text-success">{stats.validees}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg shadow-sm p-4">
          <div className="stat-title text-xs">Non validées</div>
          <div className="stat-value text-2xl text-warning">{stats.nonValidees}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg shadow-sm p-4">
          <div className="stat-title text-xs">Total heures</div>
          <div className="stat-value text-2xl text-info">{stats.totalHeures.toFixed(1)}h</div>
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
            value={filterValide} 
            onChange={(e) => setFilterValide(e.target.value)}
            className="select select-bordered select-sm"
          >
            <option value="all">Tous les statuts</option>
            <option value="valide">Validées</option>
            <option value="non_valide">Non validées</option>
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
              setFilterValide('all');
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

      {filteredHeures.length === 0 ? (
        <div className="text-center py-12 bg-base-100 rounded-lg shadow-sm">
          <Timer className="w-16 h-16 text-base-content/20 mx-auto mb-4" />
          <h3 className="text-lg font-medium">Aucune saisie d'heures trouvée</h3>
          <p className="text-base-content/60 text-sm mt-1">
            Commencez par créer votre première saisie d'heures
          </p>
          <Link to="/heures-travail/create" className="btn btn-primary mt-4 gap-2">
            <Plus className="w-5 h-5" />
            Nouvelle saisie
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHeures.map((h) => {
            const isExpanded = expandedId === h.id;
            const totalHeures = parseFloat(h.total_heures || 0);

            return (
              <div 
                key={h.id} 
                className={`bg-base-100 rounded-lg shadow-sm border ${h.valide ? 'border-success/30' : 'border-warning/30'} overflow-hidden transition-all`}
              >
                <div 
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-base-200/50 transition-colors"
                  onClick={() => toggleExpand(h.id)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`p-2 rounded-lg ${h.valide ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                      {h.valide ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-base truncate">
                          {h.employe_nom || 'Employé inconnu'}
                        </h3>
                        <span className={`badge ${h.valide ? 'badge-success' : 'badge-warning'} badge-sm`}>
                          {h.valide ? 'Validé' : 'En attente'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-base-content/60 mt-0.5 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {h.date ? new Date(h.date).toLocaleDateString('fr-FR') : 'N/A'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Timer className="w-3 h-3" />
                          Total: {totalHeures.toFixed(1)}h
                        </span>
                        {h.projet_nom && (
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {h.projet_nom}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="flex items-center gap-1">
                      {!h.valide && (
                        <button 
                          className="btn btn-sm btn-success btn-square"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleValider(h.id);
                          }}
                          title="Valider"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <Link 
                        to={`/heures-travail/edit/${h.id}`} 
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
                          setSelectedHeure(h);
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
                          toggleExpand(h.id);
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
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div>
                        <h4 className="text-xs font-semibold uppercase text-base-content/40 mb-2">Heures normales</h4>
                        <p className="text-lg font-bold text-primary">{parseFloat(h.heures_normales || 0).toFixed(1)}h</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold uppercase text-base-content/40 mb-2">Supplémentaires</h4>
                        <p className="text-lg font-bold text-secondary">{parseFloat(h.heures_supplementaires || 0).toFixed(1)}h</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold uppercase text-base-content/40 mb-2">Nuit</h4>
                        <p className="text-lg font-bold text-info">{parseFloat(h.heures_nuit || 0).toFixed(1)}h</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold uppercase text-base-content/40 mb-2">Weekend</h4>
                        <p className="text-lg font-bold text-warning">{parseFloat(h.heures_weekend || 0).toFixed(1)}h</p>
                      </div>
                    </div>
                    {h.valide_par && (
                      <div className="mt-3 text-xs text-base-content/40">
                        Validé par: {h.valide_par}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de suppression */}
      {showDeleteModal && selectedHeure && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-base-100 rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 text-error mb-4">
              <AlertTriangle className="w-8 h-8" />
              <h3 className="text-xl font-bold">Confirmer la suppression</h3>
            </div>
            <p className="text-base-content/70">
              Êtes-vous sûr de vouloir supprimer cette saisie d'heures ?
            </p>
            <p className="text-sm text-error/70 mt-2">
              ⚠️ Cette action est irréversible.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedHeure(null);
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

export default HeureTravailList;