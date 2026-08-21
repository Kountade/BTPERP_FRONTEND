// src/components/crm/LeadsList.jsx
// Liste des leads/prospects - Multi-agences

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Briefcase, Plus, Edit, Trash2, Eye, Search,
  ChevronDown, ChevronUp, RefreshCw, AlertTriangle,
  Mail, Phone, Building2, Wifi, WifiOff,
  Filter, Loader2, Star, Calendar, Clock,
  UserCheck, UserX, DollarSign, TrendingUp,
  UserCircle, FileText, Target, Handshake, Trophy, XCircle
} from 'lucide-react';
import AxiosInstance from '../AxiosInstance';

function LeadsList() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  const [filterCommercial, setFilterCommercial] = useState('all');
  const [commerciaux, setCommerciaux] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const STATUT_CHOICES = [
    { value: 'nouveau', label: 'Nouveau', icon: Star },
    { value: 'contacte', label: 'Contacté', icon: Phone },
    { value: 'qualifie', label: 'Qualifié', icon: Target },
    { value: 'devis', label: 'En devis', icon: FileText },
    { value: 'perdu', label: 'Perdu', icon: XCircle },
    { value: 'gagne', label: 'Gagné', icon: Trophy }
  ];

  const SOURCE_CHOICES = [
    { value: 'site_web', label: 'Site web' },
    { value: 'bouche_a_oreille', label: 'Bouche à oreille' },
    { value: 'publicite', label: 'Publicité' },
    { value: 'salon', label: 'Salon professionnel' },
    { value: 'appel', label: 'Appel d\'offres' },
    { value: 'autre', label: 'Autre' }
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

      const [leadsRes, usersRes] = await Promise.all([
        AxiosInstance.get('/leads/', {
          headers: { Authorization: `Token ${token}` }
        }),
        AxiosInstance.get('/users/', {
          headers: { Authorization: `Token ${token}` }
        })
      ]);

      console.log('📊 Leads chargés:', leadsRes.data?.length || 0);
      setLeads(leadsRes.data || []);
      
      const allUsers = usersRes.data || [];
      const commerciaux = allUsers.filter(u => 
        u.est_commercial_btp || u.est_directeur_agence || u.role_global === 'pdg'
      );
      setCommerciaux(commerciaux);

    } catch (error) {
      console.error('❌ Erreur chargement:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        setError('Erreur lors du chargement des leads');
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

  const filteredLeads = leads.filter(l => {
    const matchSearch = (l.nom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                       (l.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                       (l.societe || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatut = filterStatut === 'all' || l.statut === filterStatut;
    const matchSource = filterSource === 'all' || l.source === filterSource;
    const matchCommercial = filterCommercial === 'all' || l.commercial === parseInt(filterCommercial);
    return matchSearch && matchStatut && matchSource && matchCommercial;
  });

  const handleDelete = async () => {
    if (!selectedLead) return;
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('Token');
      await AxiosInstance.delete(`/leads/${selectedLead.id}/`, {
        headers: { Authorization: `Token ${token}` }
      });
      setLeads(leads.filter(l => l.id !== selectedLead.id));
      setShowDeleteModal(false);
      setSelectedLead(null);
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
      'nouveau': 'neutral',
      'contacte': 'info',
      'qualifie': 'primary',
      'devis': 'warning',
      'perdu': 'error',
      'gagne': 'success'
    };
    return colors[statut] || 'neutral';
  };

  const getStatutIcon = (statut) => {
    const icons = {
      'nouveau': <Star className="w-4 h-4" />,
      'contacte': <Phone className="w-4 h-4" />,
      'qualifie': <Target className="w-4 h-4" />,
      'devis': <FileText className="w-4 h-4" />,
      'perdu': <XCircle className="w-4 h-4" />,
      'gagne': <Trophy className="w-4 h-4" />
    };
    return icons[statut] || <Briefcase className="w-4 h-4" />;
  };

  const stats = {
    total: leads.length,
    nouveaux: leads.filter(l => l.statut === 'nouveau').length,
    contactes: leads.filter(l => l.statut === 'contacte').length,
    qualifies: leads.filter(l => l.statut === 'qualifie').length,
    devis: leads.filter(l => l.statut === 'devis').length,
    gagnes: leads.filter(l => l.statut === 'gagne').length,
    perdus: leads.filter(l => l.statut === 'perdu').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-base-content/60">Chargement des leads...</p>
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
            Prospects (Leads)
          </h1>
          <p className="text-base-content/60 text-sm mt-1">
            Gestion des prospects et opportunités commerciales
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
          <Link to="/leads/create" className="btn btn-primary gap-2">
            <Plus className="w-5 h-5" />
            Nouveau lead
          </Link>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
        <div className="stat bg-base-100 rounded-lg shadow-sm p-3">
          <div className="stat-title text-[10px] flex items-center gap-1">
            <Briefcase className="w-3 h-3" /> Total
          </div>
          <div className="stat-value text-xl">{stats.total}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg shadow-sm p-3">
          <div className="stat-title text-[10px] flex items-center gap-1">
            <Star className="w-3 h-3" /> Nouveaux
          </div>
          <div className="stat-value text-xl text-neutral">{stats.nouveaux}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg shadow-sm p-3">
          <div className="stat-title text-[10px] flex items-center gap-1">
            <Phone className="w-3 h-3" /> Contactés
          </div>
          <div className="stat-value text-xl text-info">{stats.contactes}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg shadow-sm p-3">
          <div className="stat-title text-[10px] flex items-center gap-1">
            <Target className="w-3 h-3" /> Qualifiés
          </div>
          <div className="stat-value text-xl text-primary">{stats.qualifies}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg shadow-sm p-3">
          <div className="stat-title text-[10px] flex items-center gap-1">
            <Trophy className="w-3 h-3" /> Gagnés
          </div>
          <div className="stat-value text-xl text-success">{stats.gagnes}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg shadow-sm p-3">
          <div className="stat-title text-[10px] flex items-center gap-1">
            <XCircle className="w-3 h-3" /> Perdus
          </div>
          <div className="stat-value text-xl text-error">{stats.perdus}</div>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-4 bg-base-100 p-4 rounded-lg shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
          <input
            type="text"
            placeholder="Rechercher un lead..."
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
            value={filterSource} 
            onChange={(e) => setFilterSource(e.target.value)}
            className="select select-bordered select-sm"
          >
            <option value="all">Toutes les sources</option>
            {SOURCE_CHOICES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <select 
            value={filterCommercial} 
            onChange={(e) => setFilterCommercial(e.target.value)}
            className="select select-bordered select-sm"
          >
            <option value="all">Tous les commerciaux</option>
            {commerciaux.map(c => {
              const name = c.first_name || c.last_name ? `${c.first_name || ''} ${c.last_name || ''}`.trim() : c.email;
              return (
                <option key={c.id} value={c.id}>{name}</option>
              );
            })}
          </select>
          <button 
            onClick={() => {
              setFilterStatut('all');
              setFilterSource('all');
              setFilterCommercial('all');
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

      {filteredLeads.length === 0 ? (
        <div className="text-center py-12 bg-base-100 rounded-lg shadow-sm">
          <Briefcase className="w-16 h-16 text-base-content/20 mx-auto mb-4" />
          <h3 className="text-lg font-medium">Aucun lead trouvé</h3>
          <p className="text-base-content/60 text-sm mt-1">
            {searchTerm || filterStatut !== 'all' || filterSource !== 'all' || filterCommercial !== 'all'
              ? 'Aucun lead ne correspond à vos filtres'
              : 'Commencez par créer votre premier lead'}
          </p>
          <Link to="/leads/create" className="btn btn-primary mt-4 gap-2">
            <Plus className="w-5 h-5" />
            Créer un lead
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLeads.map((l) => {
            const isExpanded = expandedId === l.id;
            const statutColor = getStatutBadgeColor(l.statut);
            const statutIcon = getStatutIcon(l.statut);
            const age = l.age || 0;

            return (
              <div 
                key={l.id} 
                className={`bg-base-100 rounded-lg shadow-sm border ${
                  l.statut === 'gagne' ? 'border-success/30' : 
                  l.statut === 'perdu' ? 'border-error/30' :
                  l.statut === 'devis' ? 'border-warning/30' :
                  'border-base-200'
                } overflow-hidden transition-all`}
              >
                <div 
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-base-200/50 transition-colors"
                  onClick={() => toggleExpand(l.id)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`p-2 rounded-lg bg-${statutColor}/10 text-${statutColor}`}>
                      {statutIcon}
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-base truncate">
                          {l.nom || 'Lead inconnu'}
                        </h3>
                        <span className={`badge badge-${statutColor} badge-sm`}>
                          {l.statut_display || l.statut}
                        </span>
                        {l.societe && (
                          <span className="badge badge-neutral badge-sm">
                            <Building2 className="w-3 h-3 inline mr-1" />
                            {l.societe}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-base-content/60 mt-0.5 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {l.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {l.telephone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {age} jour{age > 1 ? 's' : ''}
                        </span>
                        {l.budget_estime && (
                          <span className="flex items-center gap-1 text-primary">
                            <DollarSign className="w-3 h-3" />
                            {parseFloat(l.budget_estime).toLocaleString()} €
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="flex items-center gap-1">
                      <Link 
                        to={`/leads/${l.id}`} 
                        className="btn btn-ghost btn-sm btn-square"
                        onClick={(e) => e.stopPropagation()}
                        title="Voir les détails"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link 
                        to={`/leads/edit/${l.id}`} 
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
                          setSelectedLead(l);
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
                          toggleExpand(l.id);
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
                        <p className="text-sm"><span className="font-medium">Nom :</span> {l.nom}</p>
                        <p className="text-sm"><span className="font-medium">Société :</span> {l.societe || 'N/A'}</p>
                        <p className="text-sm"><span className="font-medium">Source :</span> {l.source_display || l.source}</p>
                        <p className="text-sm"><span className="font-medium">Statut :</span> {l.statut_display || l.statut}</p>
                        {l.commercial_name && (
                          <p className="text-sm text-base-content/60"><span className="font-medium">Commercial :</span> {l.commercial_name}</p>
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold uppercase text-base-content/40 mb-2 flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          Qualification
                        </h4>
                        <p className="text-sm"><span className="font-medium">Budget estimé :</span> {l.budget_estime ? parseFloat(l.budget_estime).toLocaleString() + ' €' : 'N/A'}</p>
                        <p className="text-sm"><span className="font-medium">Type travaux :</span> {l.type_travaux || 'N/A'}</p>
                        <p className="text-sm"><span className="font-medium">Délai souhaité :</span> {l.delai_souhaite ? new Date(l.delai_souhaite).toLocaleDateString('fr-FR') : 'N/A'}</p>
                        {l.date_perte && (
                          <p className="text-sm text-error"><span className="font-medium">Perdu le :</span> {new Date(l.date_perte).toLocaleDateString('fr-FR')}</p>
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold uppercase text-base-content/40 mb-2 flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          Notes
                        </h4>
                        <p className="text-sm">{l.notes || 'Aucune note'}</p>
                        {l.prochaine_action && (
                          <p className="text-sm mt-2 text-warning">
                            <Calendar className="w-3 h-3 inline mr-1" />
                            Prochaine action : {new Date(l.prochaine_action).toLocaleDateString('fr-FR')}
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
      {showDeleteModal && selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-base-100 rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 text-error mb-4">
              <AlertTriangle className="w-8 h-8" />
              <h3 className="text-xl font-bold">Confirmer la suppression</h3>
            </div>
            <p className="text-base-content/70">
              Êtes-vous sûr de vouloir supprimer le lead 
              <span className="font-semibold text-base-content"> "{selectedLead.nom}"</span> ?
            </p>
            <p className="text-sm text-error/70 mt-2">
              ⚠️ Cette action est irréversible.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedLead(null);
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

export default LeadsList;