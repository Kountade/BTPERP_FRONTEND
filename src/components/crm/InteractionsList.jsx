// src/components/crm/InteractionsList.jsx
// Liste des interactions - Multi-agences

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  MessageSquare, Plus, Edit, Trash2, Eye, Search,
  ChevronDown, ChevronUp, RefreshCw, AlertTriangle,
  Mail, Phone, Users, Building2, Wifi, WifiOff,
  Filter, Loader2, Calendar, Clock, UserCircle,
  FileText, Video, Briefcase, UserCheck, XCircle
} from 'lucide-react';
import AxiosInstance from '../AxiosInstance';

function InteractionsList() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const leadId = queryParams.get('lead');
  const clientId = queryParams.get('client');

  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterResponsable, setFilterResponsable] = useState('all');
  const [responsables, setResponsables] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedInteraction, setSelectedInteraction] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [leadInfo, setLeadInfo] = useState(null);
  const [clientInfo, setClientInfo] = useState(null);

  const TYPE_CHOICES = [
    { value: 'appel', label: 'Appel téléphonique', icon: Phone },
    { value: 'email', label: 'Email', icon: Mail },
    { value: 'rencontre', label: 'Rencontre', icon: Users },
    { value: 'visite_chantier', label: 'Visite de chantier', icon: Building2 },
    { value: 'reunion', label: 'Réunion', icon: Video },
    { value: 'autre', label: 'Autre', icon: FileText }
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

      let url = '/interactions/';
      const params = new URLSearchParams();
      if (leadId) params.append('lead', leadId);
      if (clientId) params.append('client', clientId);
      if (filterType !== 'all') params.append('type', filterType);
      if (filterResponsable !== 'all') params.append('responsable', filterResponsable);
      if (searchTerm) params.append('search', searchTerm);
      if (params.toString()) url += '?' + params.toString();

      const [interactionsRes, usersRes] = await Promise.all([
        AxiosInstance.get(url, { headers: { Authorization: `Token ${token}` } }),
        AxiosInstance.get('/users/', { headers: { Authorization: `Token ${token}` } })
      ]);

      setInteractions(interactionsRes.data || []);
      setResponsables(usersRes.data || []);

      if (leadId) {
        try {
          const leadRes = await AxiosInstance.get(`/leads/${leadId}/`, {
            headers: { Authorization: `Token ${token}` }
          });
          setLeadInfo(leadRes.data);
        } catch (e) {}
      }
      if (clientId) {
        try {
          const clientRes = await AxiosInstance.get(`/clients/${clientId}/`, {
            headers: { Authorization: `Token ${token}` }
          });
          setClientInfo(clientRes.data);
        } catch (e) {}
      }

    } catch (error) {
      console.error('❌ Erreur chargement:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        setError('Erreur lors du chargement des interactions');
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
  }, [leadId, clientId, filterType, filterResponsable, searchTerm]);

  const handleDelete = async () => {
    if (!selectedInteraction) return;
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('Token');
      await AxiosInstance.delete(`/interactions/${selectedInteraction.id}/`, {
        headers: { Authorization: `Token ${token}` }
      });
      setInteractions(interactions.filter(i => i.id !== selectedInteraction.id));
      setShowDeleteModal(false);
      setSelectedInteraction(null);
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

  const getTypeBadgeColor = (type) => {
    const colors = {
      'appel': 'info',
      'email': 'primary',
      'rencontre': 'success',
      'visite_chantier': 'warning',
      'reunion': 'secondary',
      'autre': 'neutral'
    };
    return colors[type] || 'neutral';
  };

  const getTypeIcon = (type) => {
    const icons = {
      'appel': <Phone className="w-4 h-4" />,
      'email': <Mail className="w-4 h-4" />,
      'rencontre': <Users className="w-4 h-4" />,
      'visite_chantier': <Building2 className="w-4 h-4" />,
      'reunion': <Video className="w-4 h-4" />,
      'autre': <FileText className="w-4 h-4" />
    };
    return icons[type] || <MessageSquare className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-base-content/60">Chargement des interactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 w-full">
      {/* Header avec contexte */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="w-8 h-8 text-primary" />
            Interactions
          </h1>
          {(leadInfo || clientInfo) && (
            <p className="text-sm text-base-content/60 mt-1">
              {leadInfo && `Pour : ${leadInfo.nom} (lead)`}
              {clientInfo && `Pour : ${clientInfo.nom} (client)`}
            </p>
          )}
          <p className="text-base-content/60 text-sm mt-1">
            Historique des échanges avec vos prospects et clients
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
          <Link 
            to={`/interactions/create${leadId ? `?lead=${leadId}` : ''}${clientId ? `?client=${clientId}` : ''}`} 
            className="btn btn-primary gap-2"
          >
            <Plus className="w-5 h-5" />
            Nouvelle interaction
          </Link>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-4 bg-base-100 p-4 rounded-lg shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
          <input
            type="text"
            placeholder="Rechercher par sujet ou contenu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input input-bordered w-full pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
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
              setFilterType('all');
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

      {interactions.length === 0 ? (
        <div className="text-center py-12 bg-base-100 rounded-lg shadow-sm">
          <MessageSquare className="w-16 h-16 text-base-content/20 mx-auto mb-4" />
          <h3 className="text-lg font-medium">Aucune interaction</h3>
          <p className="text-base-content/60 text-sm mt-1">
            {searchTerm || filterType !== 'all' || filterResponsable !== 'all'
              ? 'Aucune interaction ne correspond à vos filtres'
              : 'Commencez par enregistrer une interaction'}
          </p>
          <Link 
            to={`/interactions/create${leadId ? `?lead=${leadId}` : ''}${clientId ? `?client=${clientId}` : ''}`} 
            className="btn btn-primary mt-4 gap-2"
          >
            <Plus className="w-5 h-5" />
            Nouvelle interaction
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {interactions.map((i) => {
            const isExpanded = expandedId === i.id;
            const typeColor = getTypeBadgeColor(i.type_interaction);
            const typeIcon = getTypeIcon(i.type_interaction);
            const dateObj = new Date(i.date);

            return (
              <div 
                key={i.id} 
                className="bg-base-100 rounded-lg shadow-sm border border-base-200 overflow-hidden transition-all"
              >
                <div 
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-base-200/50 transition-colors"
                  onClick={() => toggleExpand(i.id)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`p-2 rounded-lg bg-${typeColor}/10 text-${typeColor}`}>
                      {typeIcon}
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-base truncate">
                          {i.sujet || 'Sans sujet'}
                        </h3>
                        <span className={`badge badge-${typeColor} badge-sm`}>
                          {i.type_display || i.type_interaction}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-base-content/60 mt-0.5 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {dateObj.toLocaleDateString('fr-FR')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {i.responsable_name && (
                          <span className="flex items-center gap-1">
                            <UserCircle className="w-3 h-3" />
                            {i.responsable_name}
                          </span>
                        )}
                        {i.lead_nom && (
                          <span className="flex items-center gap-1 text-primary">
                            <Users className="w-3 h-3" />
                            Lead: {i.lead_nom}
                          </span>
                        )}
                        {i.client_nom && (
                          <span className="flex items-center gap-1 text-success">
                            <Building2 className="w-3 h-3" />
                            Client: {i.client_nom}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="flex items-center gap-1">
                      <Link 
                        to={`/interactions/${i.id}`} 
                        className="btn btn-ghost btn-sm btn-square"
                        onClick={(e) => e.stopPropagation()}
                        title="Voir les détails"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link 
                        to={`/interactions/edit/${i.id}`} 
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
                          setSelectedInteraction(i);
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
                          toggleExpand(i.id);
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
                          Détails
                        </h4>
                        <p className="text-sm"><span className="font-medium">Type :</span> {i.type_display || i.type_interaction}</p>
                        <p className="text-sm"><span className="font-medium">Sujet :</span> {i.sujet}</p>
                        <p className="text-sm"><span className="font-medium">Date :</span> {dateObj.toLocaleString('fr-FR')}</p>
                        {i.duree && (
                          <p className="text-sm"><span className="font-medium">Durée :</span> {i.duree} min</p>
                        )}
                        {i.responsable_name && (
                          <p className="text-sm"><span className="font-medium">Responsable :</span> {i.responsable_name}</p>
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold uppercase text-base-content/40 mb-2 flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          Contenu
                        </h4>
                        <p className="text-sm whitespace-pre-wrap">{i.contenu || 'Aucun contenu'}</p>
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
      {showDeleteModal && selectedInteraction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-base-100 rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 text-error mb-4">
              <AlertTriangle className="w-8 h-8" />
              <h3 className="text-xl font-bold">Confirmer la suppression</h3>
            </div>
            <p className="text-base-content/70">
              Êtes-vous sûr de vouloir supprimer l'interaction 
              <span className="font-semibold text-base-content"> "{selectedInteraction.sujet}"</span> ?
            </p>
            <p className="text-sm text-error/70 mt-2">
              ⚠️ Cette action est irréversible.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedInteraction(null);
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

export default InteractionsList;