// src/components/rh/ContratList.jsx
// Liste des contrats de travail

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FileText, Plus, Edit, Trash2, Eye, Search,
  ChevronDown, ChevronUp, RefreshCw, AlertTriangle,
  UserCircle, Building2, Briefcase, Calendar,
  DollarSign, Clock, BadgeCheck, Wifi, WifiOff,
  FileCheck, FileX, Users
} from 'lucide-react';
import AxiosInstance from '../AxiosInstance';

function ContratList() {
  const navigate = useNavigate();
  const [contrats, setContrats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSituation, setFilterSituation] = useState('all');
  const [filterStatut, setFilterStatut] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedContrat, setSelectedContrat] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Options
  const SITUATION_CHOICES = [
    { value: 'cdi', label: 'CDI' },
    { value: 'cdd', label: 'CDD' },
    { value: 'interim', label: 'Intérim' },
    { value: 'apprenti', label: 'Apprenti' },
    { value: 'stagiaire', label: 'Stagiaire' },
    { value: 'auto_entrepreneur', label: 'Auto-Entrepreneur' }
  ];

  const STATUT_CHOICES = [
    { value: 'actif', label: 'Actif' },
    { value: 'termine', label: 'Terminé' },
    { value: 'resilie', label: 'Résilié' },
    { value: 'suspendu', label: 'Suspendu' }
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

      const response = await AxiosInstance.get('/contrats/', {
        headers: { Authorization: `Token ${token}` }
      });

      setContrats(response.data || []);
      localStorage.setItem('contrats_cache', JSON.stringify(response.data || []));

    } catch (error) {
      console.error('❌ Erreur chargement:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        setError('Erreur lors du chargement des contrats');
        const cachedData = localStorage.getItem('contrats_cache');
        if (cachedData) {
          try {
            setContrats(JSON.parse(cachedData));
          } catch (e) {
            setContrats([]);
          }
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

  // Filtrer les contrats
  const filteredContrats = contrats.filter(c => {
    const employeNom = `${c.employe_nom || ''}`.toLowerCase();
    const matchSearch = employeNom.includes(searchTerm.toLowerCase());
    const matchSituation = filterSituation === 'all' || c.situation === filterSituation;
    const matchStatut = filterStatut === 'all' || c.statut === filterStatut;
    return matchSearch && matchSituation && matchStatut;
  });

  // Supprimer un contrat
  const handleDelete = async () => {
    if (!selectedContrat) return;
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('Token');
      await AxiosInstance.delete(`/contrats/${selectedContrat.id}/`, {
        headers: { Authorization: `Token ${token}` }
      });
      setContrats(contrats.filter(c => c.id !== selectedContrat.id));
      setShowDeleteModal(false);
      setSelectedContrat(null);
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
    total: contrats.length,
    actifs: contrats.filter(c => c.statut === 'actif').length,
    termines: contrats.filter(c => c.statut === 'termine').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="mt-4 text-base-content/60">Chargement des contrats...</p>
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
            <FileText className="w-8 h-8 text-primary" />
            Contrats de travail
          </h1>
          <p className="text-base-content/60 text-sm mt-1">
            Gérez tous les contrats des employés
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
          <Link to="/contrats/create" className="btn btn-primary gap-2">
            <Plus className="w-5 h-5" />
            Nouveau contrat
          </Link>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="stat bg-base-100 rounded-lg shadow-sm p-4">
          <div className="stat-title text-xs">Total</div>
          <div className="stat-value text-2xl">{stats.total}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg shadow-sm p-4">
          <div className="stat-title text-xs">Actifs</div>
          <div className="stat-value text-2xl text-success">{stats.actifs}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg shadow-sm p-4">
          <div className="stat-title text-xs">Terminés</div>
          <div className="stat-value text-2xl text-error">{stats.termines}</div>
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
            value={filterSituation} 
            onChange={(e) => setFilterSituation(e.target.value)}
            className="select select-bordered select-sm"
          >
            <option value="all">Toutes les situations</option>
            {SITUATION_CHOICES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <select 
            value={filterStatut} 
            onChange={(e) => setFilterStatut(e.target.value)}
            className="select select-bordered select-sm"
          >
            <option value="all">Tous les statuts</option>
            {STATUT_CHOICES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="alert alert-warning shadow-lg">
          <AlertTriangle className="w-6 h-6" />
          <span>{error}</span>
          <button onClick={handleRefresh} className="btn btn-sm btn-ghost">Réessayer</button>
        </div>
      )}

      {filteredContrats.length === 0 ? (
        <div className="text-center py-12 bg-base-100 rounded-lg shadow-sm">
          <FileText className="w-16 h-16 text-base-content/20 mx-auto mb-4" />
          <h3 className="text-lg font-medium">Aucun contrat trouvé</h3>
          <p className="text-base-content/60 text-sm mt-1">
            {searchTerm || filterSituation !== 'all' || filterStatut !== 'all'
              ? 'Aucun contrat ne correspond à vos filtres'
              : 'Commencez par créer votre premier contrat'}
          </p>
          <Link to="/contrats/create" className="btn btn-primary mt-4 gap-2">
            <Plus className="w-5 h-5" />
            Créer un contrat
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredContrats.map((c) => {
            const isExpanded = expandedId === c.id;
            const isActif = c.statut === 'actif';

            return (
              <div 
                key={c.id} 
                className={`bg-base-100 rounded-lg shadow-sm border ${isActif ? 'border-success/30' : 'border-base-200'} overflow-hidden transition-all`}
              >
                <div 
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-base-200/50 transition-colors"
                  onClick={() => toggleExpand(c.id)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`p-2 rounded-lg ${isActif ? 'bg-success/10 text-success' : 'bg-base-300 text-base-content/40'}`}>
                      {isActif ? <FileCheck className="w-5 h-5" /> : <FileX className="w-5 h-5" />}
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-base truncate">
                          {c.employe_nom || 'Employé inconnu'}
                        </h3>
                        <span className={`badge ${isActif ? 'badge-success' : 'badge-error'} badge-sm`}>
                          {c.statut}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-base-content/60 mt-0.5 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3 h-3" />
                          {c.situation_display || c.situation}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {c.date_embauche ? new Date(c.date_embauche).toLocaleDateString('fr-FR') : 'N/A'}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          {c.salaire_base?.toLocaleString()} €
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="flex items-center gap-1">
                      <Link 
                        to={`/contrats/${c.id}`} 
                        className="btn btn-ghost btn-sm btn-square"
                        onClick={(e) => e.stopPropagation()}
                        title="Voir les détails"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link 
                        to={`/contrats/edit/${c.id}`} 
                        className="btn btn-ghost btn-sm btn-square"
                        onClick={(e) => e.stopPropagation()}
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <Link 
                        to={`/contrats/pdf/${c.id}`}
                        target="_blank"
                        className="btn btn-ghost btn-sm btn-square"
                        onClick={(e) => e.stopPropagation()}
                        title="PDF"
                      >
                        <FileText className="w-4 h-4" />
                      </Link>
                      <button 
                        className="btn btn-ghost btn-sm btn-square text-error hover:bg-error/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedContrat(c);
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
                          toggleExpand(c.id);
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
                          Employé
                        </h4>
                        <p className="text-sm">{c.employe_nom || 'N/A'}</p>
                        <p className="text-sm text-base-content/60">ID: {c.employe}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold uppercase text-base-content/40 mb-2 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Dates
                        </h4>
                        <p className="text-sm">Embauche: {c.date_embauche ? new Date(c.date_embauche).toLocaleDateString('fr-FR') : 'N/A'}</p>
                        {c.date_fin_contrat && (
                          <p className="text-sm text-warning">Fin: {new Date(c.date_fin_contrat).toLocaleDateString('fr-FR')}</p>
                        )}
                        <p className="text-sm text-base-content/60">Ancienneté: {c.anciennete || 0} an(s)</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold uppercase text-base-content/40 mb-2 flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          Rémunération
                        </h4>
                        <p className="text-sm">Salaire base: {c.salaire_base?.toLocaleString()} €</p>
                        <p className="text-sm">Taux horaire: {c.taux_horaire} €</p>
                        {c.prime_panier > 0 && (
                          <p className="text-sm text-success">Prime panier: {c.prime_panier} €</p>
                        )}
                        {c.indemnite_km > 0 && (
                          <p className="text-sm text-info">Indemnité KM: {c.indemnite_km} €</p>
                        )}
                        {c.prime_anciennete > 0 && (
                          <p className="text-sm text-warning">Prime ancienneté: {c.prime_anciennete} €</p>
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
      {showDeleteModal && selectedContrat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-base-100 rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 text-error mb-4">
              <AlertTriangle className="w-8 h-8" />
              <h3 className="text-xl font-bold">Confirmer la suppression</h3>
            </div>
            <p className="text-base-content/70">
              Êtes-vous sûr de vouloir supprimer le contrat de 
              <span className="font-semibold text-base-content"> "{selectedContrat.employe_nom}"</span> ?
            </p>
            <p className="text-sm text-error/70 mt-2">
              ⚠️ Cette action est irréversible.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedContrat(null);
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

export default ContratList;