// src/components/crm/AppelsOffresList.jsx
// Liste des appels d'offres - Multi-agences

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FileText, Plus, Edit, Trash2, Eye, Search,
  ChevronDown, ChevronUp, RefreshCw, AlertTriangle,
  Calendar, Clock, Building2, Wifi, WifiOff,
  Filter, Loader2, DollarSign, UserCircle, Briefcase,
  CheckCircle, XCircle, Clock as ClockIcon
} from 'lucide-react';
import AxiosInstance from '../AxiosInstance';

function AppelsOffresList() {
  const navigate = useNavigate();
  const [appels, setAppels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState('all');
  const [filterClient, setFilterClient] = useState('all');
  const [filterResponsable, setFilterResponsable] = useState('all');
  const [clients, setClients] = useState([]);
  const [responsables, setResponsables] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAppel, setSelectedAppel] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const STATUT_CHOICES = [
    { value: 'recu', label: 'Reçu' },
    { value: 'en_cours', label: 'En cours' },
    { value: 'soumis', label: 'Soumis' },
    { value: 'gagne', label: 'Gagné' },
    { value: 'perdu', label: 'Perdu' }
  ];

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

      const [appelsRes, clientsRes, usersRes] = await Promise.all([
        AxiosInstance.get('/appels-offres/', {
          headers: { Authorization: `Token ${token}` }
        }),
        AxiosInstance.get('/clients/', {
          headers: { Authorization: `Token ${token}` }
        }),
        AxiosInstance.get('/users/', {
          headers: { Authorization: `Token ${token}` }
        })
      ]);

      setAppels(appelsRes.data || []);
      setClients(clientsRes.data || []);
      setResponsables(usersRes.data || []);

    } catch (error) {
      console.error('❌ Erreur chargement:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        setError('Erreur lors du chargement des appels d\'offres');
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

  const filteredAppels = appels.filter(a => {
    const matchSearch = (a.reference || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                       (a.objet || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                       (a.client_nom || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatut = filterStatut === 'all' || a.statut === filterStatut;
    const matchClient = filterClient === 'all' || a.client === parseInt(filterClient);
    const matchResponsable = filterResponsable === 'all' || a.responsable === parseInt(filterResponsable);
    return matchSearch && matchStatut && matchClient && matchResponsable;
  });

  const handleDelete = async () => {
    if (!selectedAppel) return;
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('Token');
      await AxiosInstance.delete(`/appels-offres/${selectedAppel.id}/`, {
        headers: { Authorization: `Token ${token}` }
      });
      setAppels(appels.filter(a => a.id !== selectedAppel.id));
      setShowDeleteModal(false);
      setSelectedAppel(null);
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
      'recu': 'neutral',
      'en_cours': 'info',
      'soumis': 'warning',
      'gagne': 'success',
      'perdu': 'error'
    };
    return colors[statut] || 'neutral';
  };

  const getStatutIcon = (statut) => {
    const icons = {
      'recu': <FileText className="w-4 h-4" />,
      'en_cours': <ClockIcon className="w-4 h-4" />,
      'soumis': <CheckCircle className="w-4 h-4" />,
      'gagne': <CheckCircle className="w-4 h-4 text-success" />,
      'perdu': <XCircle className="w-4 h-4 text-error" />
    };
    return icons[statut] || <FileText className="w-4 h-4" />;
  };

  const getStatutLabel = (statut) => {
    const labels = {
      'recu': 'Reçu',
      'en_cours': 'En cours',
      'soumis': 'Soumis',
      'gagne': 'Gagné',
      'perdu': 'Perdu'
    };
    return labels[statut] || statut;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-base-content/60">Chargement des appels d'offres...</p>
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
            <FileText className="w-8 h-8 text-primary" />
            Appels d'offres
          </h1>
          <p className="text-base-content/60 text-sm mt-1">
            Gestion des appels d'offres reçus et soumis
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
          <Link to="/appels-offres/create" className="btn btn-primary gap-2">
            <Plus className="w-5 h-5" />
            Nouvel appel d'offres
          </Link>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-4 bg-base-100 p-4 rounded-lg shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
          <input
            type="text"
            placeholder="Rechercher par référence, objet ou client..."
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
            value={filterClient} 
            onChange={(e) => setFilterClient(e.target.value)}
            className="select select-bordered select-sm"
          >
            <option value="all">Tous les clients</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.nom}</option>
            ))}
          </select>
          <select 
            value={filterResponsable} 
            onChange={(e) => setFilterResponsable(e.target.value)}
            className="select select-bordered select-sm"
          >
            <option value="all">Tous les responsables</option>
            {responsables.map(u => {
              const name = u.first_name || u.last_name ? `${u.first_name || ''} ${u.last_name || ''}`.trim() : u.email;
              return (
                <option key={u.id} value={u.id}>{name}</option>
              );
            })}
          </select>
          <button 
            onClick={() => {
              setFilterStatut('all');
              setFilterClient('all');
              setFilterResponsable('all');
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

      {filteredAppels.length === 0 ? (
        <div className="text-center py-12 bg-base-100 rounded-lg shadow-sm">
          <FileText className="w-16 h-16 text-base-content/20 mx-auto mb-4" />
          <h3 className="text-lg font-medium">Aucun appel d'offres</h3>
          <p className="text-base-content/60 text-sm mt-1">
            {searchTerm || filterStatut !== 'all' || filterClient !== 'all' || filterResponsable !== 'all'
              ? 'Aucun appel d\'offres ne correspond à vos filtres'
              : 'Commencez par enregistrer un appel d\'offres'}
          </p>
          <Link to="/appels-offres/create" className="btn btn-primary mt-4 gap-2">
            <Plus className="w-5 h-5" />
            Nouvel appel d'offres
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAppels.map((a) => {
            const isExpanded = expandedId === a.id;
            const statutColor = getStatutBadgeColor(a.statut);
            const statutIcon = getStatutIcon(a.statut);
            const estEnRetard = a.est_en_retard || false;
            const joursRestants = a.jours_restants !== undefined ? a.jours_restants : null;

            return (
              <div 
                key={a.id} 
                className={`bg-base-100 rounded-lg shadow-sm border ${
                  a.statut === 'gagne' ? 'border-success/30' : 
                  a.statut === 'perdu' ? 'border-error/30' :
                  a.statut === 'en_cours' ? 'border-info/30' :
                  'border-base-200'
                } overflow-hidden transition-all`}
              >
                <div 
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-base-200/50 transition-colors"
                  onClick={() => toggleExpand(a.id)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`p-2 rounded-lg bg-${statutColor}/10 text-${statutColor}`}>
                      {statutIcon}
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-base truncate">
                          {a.reference || 'Sans référence'}
                        </h3>
                        <span className={`badge badge-${statutColor} badge-sm`}>
                          {a.statut_display || a.statut}
                        </span>
                        {a.client_nom && (
                          <span className="badge badge-neutral badge-sm">
                            {a.client_nom}
                          </span>
                        )}
                        {estEnRetard && (
                          <span className="badge badge-error badge-sm gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            En retard
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-base-content/60 mt-0.5 flex-wrap">
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {a.objet || 'Sans objet'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Limite: {a.date_limite ? new Date(a.date_limite).toLocaleDateString('fr-FR') : 'N/A'}
                        </span>
                        {a.budget_estime && (
                          <span className="flex items-center gap-1 text-primary">
                            <DollarSign className="w-3 h-3" />
                            {parseFloat(a.budget_estime).toLocaleString()} €
                          </span>
                        )}
                        {joursRestants !== null && joursRestants >= 0 && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {joursRestants} jours restants
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="flex items-center gap-1">
                      <Link 
                        to={`/appels-offres/${a.id}`} 
                        className="btn btn-ghost btn-sm btn-square"
                        onClick={(e) => e.stopPropagation()}
                        title="Voir les détails"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link 
                        to={`/appels-offres/edit/${a.id}`} 
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
                          setSelectedAppel(a);
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
                          toggleExpand(a.id);
                        }}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-base-200 p-4 bg-base-200/30">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-xs font-semibold uppercase text-base-content/40 mb-2 flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          Informations
                        </h4>
                        <p className="text-sm"><span className="font-medium">Référence :</span> {a.reference}</p>
                        <p className="text-sm"><span className="font-medium">Objet :</span> {a.objet}</p>
                        <p className="text-sm"><span className="font-medium">Client :</span> {a.client_nom || 'N/A'}</p>
                        <p className="text-sm"><span className="font-medium">Statut :</span> {a.statut_display || a.statut}</p>
                        <p className="text-sm"><span className="font-medium">Responsable :</span> {a.responsable_name || 'N/A'}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold uppercase text-base-content/40 mb-2 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Dates
                        </h4>
                        <p className="text-sm"><span className="font-medium">Publication :</span> {a.date_publication ? new Date(a.date_publication).toLocaleDateString('fr-FR') : 'N/A'}</p>
                        <p className="text-sm"><span className="font-medium">Date limite :</span> {a.date_limite ? new Date(a.date_limite).toLocaleDateString('fr-FR') : 'N/A'}</p>
                        {a.date_soumission && (
                          <p className="text-sm"><span className="font-medium">Soumission :</span> {new Date(a.date_soumission).toLocaleDateString('fr-FR')}</p>
                        )}
                        <p className="text-sm"><span className="font-medium">Budget estimé :</span> {a.budget_estime ? parseFloat(a.budget_estime).toLocaleString() + ' €' : 'N/A'}</p>
                        {a.montant_soumis && (
                          <p className="text-sm"><span className="font-medium">Montant soumis :</span> {parseFloat(a.montant_soumis).toLocaleString() + ' €'}</p>
                        )}
                      </div>
                      <div className="col-span-full">
                        <h4 className="text-xs font-semibold uppercase text-base-content/40 mb-2 flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          Notes
                        </h4>
                        <p className="text-sm">{a.notes || 'Aucune note'}</p>
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
      {showDeleteModal && selectedAppel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-base-100 rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 text-error mb-4">
              <AlertTriangle className="w-8 h-8" />
              <h3 className="text-xl font-bold">Confirmer la suppression</h3>
            </div>
            <p className="text-base-content/70">
              Êtes-vous sûr de vouloir supprimer l'appel d'offres 
              <span className="font-semibold text-base-content"> "{selectedAppel.reference}"</span> ?
            </p>
            <p className="text-sm text-error/70 mt-2">
              ⚠️ Cette action est irréversible.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedAppel(null);
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

export default AppelsOffresList;