// src/components/rh/PlanningList.jsx
// Liste des plannings des employés - Version corrigée

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, Plus, Edit, Trash2, Search,
  ChevronDown, ChevronUp, RefreshCw, AlertTriangle,
  UserCircle, Building2, Wifi, WifiOff,
  CheckCircle, XCircle, Filter, Loader2,
  Clock, Timer
} from 'lucide-react';
import AxiosInstance from '../AxiosInstance';

function PlanningList() {
  const navigate = useNavigate();
  const [plannings, setPlannings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterEmploye, setFilterEmploye] = useState('all');
  const [filterValide, setFilterValide] = useState('all');
  const [employes, setEmployes] = useState([]);
  const [projets, setProjets] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPlanning, setSelectedPlanning] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

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

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('Token');
      if (!token) {
        navigate('/login');
        return;
      }

      const [planningRes, employesRes, projetsRes] = await Promise.all([
        AxiosInstance.get('/planning/', {
          headers: { Authorization: `Token ${token}` }
        }),
        AxiosInstance.get('/employes/', {
          headers: { Authorization: `Token ${token}` }
        }),
        AxiosInstance.get('/projets/', {
          headers: { Authorization: `Token ${token}` }
        })
      ]);

      console.log('📊 Plannings chargés:', planningRes.data?.length || 0);
      setPlannings(planningRes.data || []);
      setEmployes(employesRes.data || []);
      setProjets(projetsRes.data || []);

    } catch (error) {
      console.error('❌ Erreur chargement:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        setError('Erreur lors du chargement des plannings');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredPlannings = plannings.filter(p => {
    const employeNom = (p.employe_nom || '').toLowerCase();
    const matchSearch = employeNom.includes(searchTerm.toLowerCase());
    const matchEmploye = filterEmploye === 'all' || p.employe === parseInt(filterEmploye);
    const matchDate = !filterDate || p.date === filterDate;
    const matchValide = filterValide === 'all' || 
                       (filterValide === 'valide' && p.valide) ||
                       (filterValide === 'non_valide' && !p.valide);
    return matchSearch && matchEmploye && matchDate && matchValide;
  });

  const handleDelete = async () => {
    if (!selectedPlanning) return;
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('Token');
      await AxiosInstance.delete(`/planning/${selectedPlanning.id}/`, {
        headers: { Authorization: `Token ${token}` }
      });
      setPlannings(plannings.filter(p => p.id !== selectedPlanning.id));
      setShowDeleteModal(false);
      setSelectedPlanning(null);
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleValider = async (id) => {
    try {
      const token = localStorage.getItem('Token');
      await AxiosInstance.post(`/planning/${id}/valider/`, {}, {
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

  const stats = {
    total: plannings.length,
    valides: plannings.filter(p => p.valide).length,
    nonValides: plannings.filter(p => !p.valide).length
  };

  const formatTime = (time) => {
    if (!time) return 'N/A';
    return time.substring(0, 5);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-base-content/60">Chargement des plannings...</p>
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
            <Calendar className="w-8 h-8 text-primary" />
            Planning
          </h1>
          <p className="text-base-content/60 text-sm mt-1">
            Gestion des plannings des employés sur les chantiers
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
          <Link to="/planning/create" className="btn btn-primary gap-2">
            <Plus className="w-5 h-5" />
            Nouveau planning
          </Link>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-3 gap-3">
        <div className="stat bg-base-100 rounded-lg shadow-sm p-4">
          <div className="stat-title text-xs">Total</div>
          <div className="stat-value text-2xl">{stats.total}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg shadow-sm p-4">
          <div className="stat-title text-xs">Validés</div>
          <div className="stat-value text-2xl text-success">{stats.valides}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg shadow-sm p-4">
          <div className="stat-title text-xs">En attente</div>
          <div className="stat-value text-2xl text-warning">{stats.nonValides}</div>
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
            <option value="valide">Validés</option>
            <option value="non_valide">Non validés</option>
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

      {filteredPlannings.length === 0 ? (
        <div className="text-center py-12 bg-base-100 rounded-lg shadow-sm">
          <Calendar className="w-16 h-16 text-base-content/20 mx-auto mb-4" />
          <h3 className="text-lg font-medium">Aucun planning trouvé</h3>
          <p className="text-base-content/60 text-sm mt-1">
            {searchTerm || filterEmploye !== 'all' || filterValide !== 'all' || filterDate
              ? 'Aucun planning ne correspond à vos filtres'
              : 'Commencez par créer votre premier planning'}
          </p>
          <Link to="/planning/create" className="btn btn-primary mt-4 gap-2">
            <Plus className="w-5 h-5" />
            Nouveau planning
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPlannings.map((p) => {
            const isExpanded = expandedId === p.id;
            const duree = parseFloat(p.duree_heures || 0);

            return (
              <div 
                key={p.id} 
                className={`bg-base-100 rounded-lg shadow-sm border ${p.valide ? 'border-success/30' : 'border-warning/30'} overflow-hidden transition-all`}
              >
                <div 
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-base-200/50 transition-colors"
                  onClick={() => toggleExpand(p.id)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`p-2 rounded-lg ${p.valide ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                      {p.valide ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-base truncate">
                          {p.employe_nom || 'Employé inconnu'}
                        </h3>
                        <span className={`badge ${p.valide ? 'badge-success' : 'badge-warning'} badge-sm`}>
                          {p.valide ? 'Validé' : 'En attente'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-base-content/60 mt-0.5 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {p.date ? new Date(p.date).toLocaleDateString('fr-FR') : 'N/A'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(p.heure_debut)} - {formatTime(p.heure_fin)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Timer className="w-3 h-3" />
                          {duree.toFixed(1)}h
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
                      {!p.valide && (
                        <button 
                          className="btn btn-sm btn-success btn-square"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleValider(p.id);
                          }}
                          title="Valider"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <Link 
                        to={`/planning/edit/${p.id}`} 
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
                          setSelectedPlanning(p);
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

                {isExpanded && (
                  <div className="border-t border-base-200 p-4 bg-base-200/30">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <h4 className="text-xs font-semibold uppercase text-base-content/40 mb-2 flex items-center gap-1">
                          <UserCircle className="w-3 h-3" />
                          Informations
                        </h4>
                        <p className="text-sm">Employé: {p.employe_nom || 'N/A'}</p>
                        <p className="text-sm">Date: {p.date ? new Date(p.date).toLocaleDateString('fr-FR') : 'N/A'}</p>
                        <p className="text-sm">Heure: {formatTime(p.heure_debut)} - {formatTime(p.heure_fin)}</p>
                        <p className="text-sm">Durée: {duree.toFixed(1)} heures</p>
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
                          Notes
                        </h4>
                        <p className="text-sm">{p.notes || 'Aucune note'}</p>
                        {p.contrat_display && (
                          <p className="text-sm mt-2 text-base-content/60">
                            Contrat: {p.contrat_display}
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

      {/* Modal de suppression */}
      {showDeleteModal && selectedPlanning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-base-100 rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 text-error mb-4">
              <AlertTriangle className="w-8 h-8" />
              <h3 className="text-xl font-bold">Confirmer la suppression</h3>
            </div>
            <p className="text-base-content/70">
              Êtes-vous sûr de vouloir supprimer ce planning ?
            </p>
            <p className="text-sm text-error/70 mt-2">
              ⚠️ Cette action est irréversible.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedPlanning(null);
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
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {isDeleting ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlanningList;