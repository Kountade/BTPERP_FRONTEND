// src/components/chantiers/ProjetsList.jsx
// Liste des projets/chantiers - Multi-agences

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Briefcase, Plus, Edit, Trash2, Eye, Search,
  ChevronDown, ChevronUp, RefreshCw, AlertTriangle,
  Building2, Wifi, WifiOff, Filter, Loader2,
  Calendar, Clock, DollarSign, MapPin, UserCircle,
  FileText, HardHat, Target, CheckCircle, XCircle,
  TrendingUp, Printer
} from 'lucide-react';
import AxiosInstance from '../AxiosInstance';

// ✅ Ajout de la fonction de vérification de l'état en ligne
function useOnlineStatus() {
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
  return isOnline;
}

function ProjetsList() {
  const navigate = useNavigate();
  const [projets, setProjets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterClient, setFilterClient] = useState('all');
  const [clients, setClients] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProjet, setSelectedProjet] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isOnline = useOnlineStatus(); // ✅ utilisation du hook

  const STATUT_CHOICES = [
    { value: 'etude', label: 'En étude' },
    { value: 'encours', label: 'En cours' },
    { value: 'suspendu', label: 'Suspendu' },
    { value: 'termine', label: 'Terminé' },
    { value: 'livre', label: 'Livré' }
  ];

  const TYPE_CHOICES = [
    { value: 'construction', label: 'Construction neuve' },
    { value: 'renovation', label: 'Rénovation' },
    { value: 'extension', label: 'Extension' },
    { value: 'tp', label: 'Travaux Publics' },
    { value: 'entretien', label: 'Entretien' },
    { value: 'demolition', label: 'Démolition' }
  ];

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('Token');
      if (!token) {
        navigate('/login');
        return;
      }

      const [projetsRes, clientsRes] = await Promise.all([
        AxiosInstance.get('/projets/', {
          headers: { Authorization: `Token ${token}` }
        }),
        AxiosInstance.get('/clients/', {
          headers: { Authorization: `Token ${token}` }
        })
      ]);

      setProjets(projetsRes.data || []);
      setClients(clientsRes.data || []);

    } catch (error) {
      console.error('❌ Erreur chargement:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        setError('Erreur lors du chargement des projets');
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

  const filteredProjets = projets.filter(p => {
    const matchSearch = (p.code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                       (p.nom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                       (p.ville || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatut = filterStatut === 'all' || p.statut === filterStatut;
    const matchType = filterType === 'all' || p.type_projet === filterType;
    const matchClient = filterClient === 'all' || p.client === parseInt(filterClient);
    return matchSearch && matchStatut && matchType && matchClient;
  });

  const handleDelete = async () => {
    if (!selectedProjet) return;
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('Token');
      await AxiosInstance.delete(`/projets/${selectedProjet.id}/`, {
        headers: { Authorization: `Token ${token}` }
      });
      setProjets(projets.filter(p => p.id !== selectedProjet.id));
      setShowDeleteModal(false);
      setSelectedProjet(null);
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

  const getStatutBadgeColor = (statut) => {
    const colors = {
      'etude': 'info',
      'encours': 'primary',
      'suspendu': 'warning',
      'termine': 'success',
      'livre': 'success'
    };
    return colors[statut] || 'neutral';
  };

  const getStatutIcon = (statut) => {
    const icons = {
      'etude': <FileText className="w-4 h-4" />,
      'encours': <HardHat className="w-4 h-4" />,
      'suspendu': <AlertTriangle className="w-4 h-4" />,
      'termine': <CheckCircle className="w-4 h-4" />,
      'livre': <Target className="w-4 h-4" />
    };
    return icons[statut] || <Briefcase className="w-4 h-4" />;
  };

  const stats = {
    total: projets.length,
    etude: projets.filter(p => p.statut === 'etude').length,
    encours: projets.filter(p => p.statut === 'encours').length,
    suspendu: projets.filter(p => p.statut === 'suspendu').length,
    termine: projets.filter(p => p.statut === 'termine').length,
    livre: projets.filter(p => p.statut === 'livre').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-base-content/60">Chargement des projets...</p>
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
            <Briefcase className="w-8 h-8 text-primary" />
            Chantiers / Projets
          </h1>
          <p className="text-base-content/60 text-sm mt-1">
            Gestion des chantiers et projets de construction
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
          <Link to="/projets/create" className="btn btn-primary gap-2">
            <Plus className="w-5 h-5" />
            Nouveau projet
          </Link>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <div className="stat bg-base-100 rounded-lg shadow-sm p-3">
          <div className="stat-title text-[10px] flex items-center gap-1">
            <Briefcase className="w-3 h-3" /> Total
          </div>
          <div className="stat-value text-xl">{stats.total}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg shadow-sm p-3">
          <div className="stat-title text-[10px] flex items-center gap-1">
            <FileText className="w-3 h-3" /> Étude
          </div>
          <div className="stat-value text-xl text-info">{stats.etude}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg shadow-sm p-3">
          <div className="stat-title text-[10px] flex items-center gap-1">
            <HardHat className="w-3 h-3" /> En cours
          </div>
          <div className="stat-value text-xl text-primary">{stats.encours}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg shadow-sm p-3">
          <div className="stat-title text-[10px] flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Terminés
          </div>
          <div className="stat-value text-xl text-success">{stats.termine + stats.livre}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg shadow-sm p-3">
          <div className="stat-title text-[10px] flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Suspendus
          </div>
          <div className="stat-value text-xl text-warning">{stats.suspendu}</div>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-4 bg-base-100 p-4 rounded-lg shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
          <input
            type="text"
            placeholder="Rechercher un projet..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input input-bordered w-full pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
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
          <select 
            value={filterClient} 
            onChange={(e) => setFilterClient(e.target.value)}
            className="select select-bordered select-sm"
          >
            <option value="all">Tous les clients</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.nom}</option>
            ))}
          </select>
          <button 
            onClick={() => {
              setFilterStatut('all');
              setFilterType('all');
              setFilterClient('all');
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

      {filteredProjets.length === 0 ? (
        <div className="text-center py-12 bg-base-100 rounded-lg shadow-sm">
          <Briefcase className="w-16 h-16 text-base-content/20 mx-auto mb-4" />
          <h3 className="text-lg font-medium">Aucun projet trouvé</h3>
          <p className="text-base-content/60 text-sm mt-1">
            {searchTerm || filterStatut !== 'all' || filterType !== 'all' || filterClient !== 'all'
              ? 'Aucun projet ne correspond à vos filtres'
              : 'Commencez par créer votre premier projet'}
          </p>
          <Link to="/projets/create" className="btn btn-primary mt-4 gap-2">
            <Plus className="w-5 h-5" />
            Créer un projet
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProjets.map((p) => {
            const isExpanded = expandedId === p.id;
            const statutColor = getStatutBadgeColor(p.statut);
            const statutIcon = getStatutIcon(p.statut);
            const avancement = parseFloat(p.taux_avancement) || 0;

            return (
              <div 
                key={p.id} 
                className={`bg-base-100 rounded-lg shadow-sm border ${
                  p.statut === 'encours' ? 'border-primary/30' : 
                  p.statut === 'termine' || p.statut === 'livre' ? 'border-success/30' :
                  p.statut === 'suspendu' ? 'border-warning/30' :
                  'border-base-200'
                } overflow-hidden transition-all`}
              >
                <div 
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-base-200/50 transition-colors"
                  onClick={() => toggleExpand(p.id)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`p-2 rounded-lg bg-${statutColor}/10 text-${statutColor}`}>
                      {statutIcon}
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-base truncate">
                          {p.code} - {p.nom}
                        </h3>
                        <span className={`badge badge-${statutColor} badge-sm`}>
                          {p.statut_display || p.statut}
                        </span>
                        <span className="badge badge-neutral badge-sm">
                          {p.type_display || p.type_projet}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-base-content/60 mt-0.5 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {p.client_nom || 'Client inconnu'}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {p.ville || 'N/A'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {p.date_debut ? new Date(p.date_debut).toLocaleDateString('fr-FR') : 'N/A'}
                        </span>
                        <span className="flex items-center gap-1 text-primary">
                          <DollarSign className="w-3 h-3" />
                          {parseFloat(p.budget_total).toLocaleString()} €
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          {avancement}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="flex items-center gap-1">
                      <Link 
                        to={`/projets/${p.id}`} 
                        className="btn btn-ghost btn-sm btn-square"
                        onClick={(e) => e.stopPropagation()}
                        title="Voir les détails"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link 
                        to={`/projets/pdf/${p.id}`} 
                        target="_blank"
                        className="btn btn-ghost btn-sm btn-square"
                        onClick={(e) => e.stopPropagation()}
                        title="Télécharger PDF"
                      >
                        <Printer className="w-4 h-4" />
                      </Link>
                      <Link 
                        to={`/projets/edit/${p.id}`} 
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
                          setSelectedProjet(p);
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
                          <FileText className="w-3 h-3" />
                          Informations
                        </h4>
                        <p className="text-sm"><span className="font-medium">Code :</span> {p.code}</p>
                        <p className="text-sm"><span className="font-medium">Client :</span> {p.client_nom || 'N/A'}</p>
                        <p className="text-sm"><span className="font-medium">Chef de projet :</span> {p.chef_projet_nom || 'N/A'}</p>
                        <p className="text-sm"><span className="font-medium">Agence :</span> {p.agence_nom || 'N/A'}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold uppercase text-base-content/40 mb-2 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Calendrier
                        </h4>
                        <p className="text-sm"><span className="font-medium">Début :</span> {p.date_debut ? new Date(p.date_debut).toLocaleDateString('fr-FR') : 'N/A'}</p>
                        <p className="text-sm"><span className="font-medium">Fin prévue :</span> {p.date_fin_previsionnelle ? new Date(p.date_fin_previsionnelle).toLocaleDateString('fr-FR') : 'N/A'}</p>
                        {p.date_fin_reelle && (
                          <p className="text-sm"><span className="font-medium">Fin réelle :</span> {new Date(p.date_fin_reelle).toLocaleDateString('fr-FR')}</p>
                        )}
                        <p className="text-sm"><span className="font-medium">Durée :</span> {p.duree_jours || 'N/A'} jours</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold uppercase text-base-content/40 mb-2 flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          Finances
                        </h4>
                        <p className="text-sm"><span className="font-medium">Budget total :</span> {parseFloat(p.budget_total).toLocaleString()} €</p>
                        <p className="text-sm"><span className="font-medium">Budget MO :</span> {parseFloat(p.budget_mo).toLocaleString()} €</p>
                        <p className="text-sm"><span className="font-medium">Budget matériaux :</span> {parseFloat(p.budget_materiaux).toLocaleString()} €</p>
                        <p className="text-sm"><span className="font-medium">Avancement :</span> {p.taux_avancement}%</p>
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
      {showDeleteModal && selectedProjet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-base-100 rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 text-error mb-4">
              <AlertTriangle className="w-8 h-8" />
              <h3 className="text-xl font-bold">Confirmer la suppression</h3>
            </div>
            <p className="text-base-content/70">
              Êtes-vous sûr de vouloir supprimer le projet 
              <span className="font-semibold text-base-content"> "{selectedProjet.code} - {selectedProjet.nom}"</span> ?
            </p>
            <p className="text-sm text-error/70 mt-2">
              ⚠️ Cette action est irréversible.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedProjet(null);
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

export default ProjetsList;