// src/components/crm/LeadDetail.jsx
// Détails d'un lead/prospect - Multi-agences

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  Users, ChevronLeft, Edit, Trash2, 
  UserCircle, Mail, Phone, Building2, Wifi, WifiOff,
  AlertTriangle, DollarSign, Calendar, FileText,
  Loader2, Briefcase, Clock, TrendingUp, ArrowRight, UserCheck,
  Plus, Target, Star, Trophy, XCircle, Handshake
} from 'lucide-react';
import AxiosInstance from '../AxiosInstance';

const STATUT_CHOICES = [
  { value: 'nouveau', label: 'Nouveau' },
  { value: 'contacte', label: 'Contacté' },
  { value: 'qualifie', label: 'Qualifié' },
  { value: 'devis', label: 'En devis' },
  { value: 'perdu', label: 'Perdu' },
  { value: 'gagne', label: 'Gagné' }
];

function LeadDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [interactions, setInteractions] = useState([]);
  const [loadingRelations, setLoadingRelations] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showChangeStatutModal, setShowChangeStatutModal] = useState(false);
  const [newStatut, setNewStatut] = useState('');
  const [motifPerte, setMotifPerte] = useState('');
  const [changingStatut, setChangingStatut] = useState(false);

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

      const response = await AxiosInstance.get(`/leads/${id}/`, {
        headers: { Authorization: `Token ${token}` }
      });
      setLead(response.data);
      setNewStatut(response.data.statut || 'nouveau');

      setLoadingRelations(true);
      try {
        const interactionsRes = await AxiosInstance.get(`/leads/${id}/interactions/`, {
          headers: { Authorization: `Token ${token}` }
        });
        setInteractions(interactionsRes.data || []);
      } catch (relError) {
        console.warn('⚠️ Erreur chargement interactions:', relError);
      } finally {
        setLoadingRelations(false);
      }

    } catch (error) {
      console.error('❌ Erreur chargement:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else if (error.response?.status === 404) {
        setError('Lead non trouvé');
      } else {
        setError('Erreur lors du chargement du lead');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!window.confirm('Supprimer ce lead ?')) return;
    
    try {
      const token = localStorage.getItem('Token');
      await AxiosInstance.delete(`/leads/${id}/`, {
        headers: { Authorization: `Token ${token}` }
      });
      navigate('/leads');
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleChangeStatut = async () => {
    if (!newStatut) return;
    setChangingStatut(true);
    try {
      const token = localStorage.getItem('Token');
      await AxiosInstance.post(`/leads/${id}/changer_statut/`, {
        statut: newStatut,
        motif_perte: newStatut === 'perdu' ? motifPerte : ''
      }, {
        headers: { Authorization: `Token ${token}` }
      });
      await loadData();
      setShowChangeStatutModal(false);
      setMotifPerte('');
    } catch (error) {
      console.error('❌ Erreur changement statut:', error);
      alert('Erreur lors du changement de statut');
    } finally {
      setChangingStatut(false);
    }
  };

  const handleConvertirClient = async () => {
    if (!window.confirm('Convertir ce lead en client ?')) return;
    
    try {
      const token = localStorage.getItem('Token');
      const response = await AxiosInstance.post(`/leads/${id}/convertir_client/`, {}, {
        headers: { Authorization: `Token ${token}` }
      });
      alert(response.data.message || 'Lead converti en client avec succès');
      navigate(`/clients/${response.data.client?.id || lead.client}`);
    } catch (error) {
      console.error('❌ Erreur conversion:', error);
      alert('Erreur lors de la conversion');
    }
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
      'nouveau': <Star className="w-5 h-5" />,
      'contacte': <Phone className="w-5 h-5" />,
      'qualifie': <Target className="w-5 h-5" />,
      'devis': <FileText className="w-5 h-5" />,
      'perdu': <XCircle className="w-5 h-5" />,
      'gagne': <Trophy className="w-5 h-5" />
    };
    return icons[statut] || <Briefcase className="w-5 h-5" />;
  };

  const getStatutLabel = (statut) => {
    const labels = {
      'nouveau': 'Nouveau',
      'contacte': 'Contacté',
      'qualifie': 'Qualifié',
      'devis': 'En devis',
      'perdu': 'Perdu',
      'gagne': 'Gagné'
    };
    return labels[statut] || statut;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-base-content/60">Chargement du lead...</p>
        </div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-error mx-auto mb-4" />
          <h3 className="text-lg font-medium">{error || 'Lead non trouvé'}</h3>
          <Link to="/leads" className="btn btn-primary mt-4">
            Retour à la liste
          </Link>
        </div>
      </div>
    );
  }

  const statutColor = getStatutBadgeColor(lead.statut);
  const statutIcon = getStatutIcon(lead.statut);
  const age = lead.age || 0;
  const agenceNom = lead.agence_nom || lead.agence || 'Non assignée';
  const isGagne = lead.statut === 'gagne';
  const isPerdu = lead.statut === 'perdu';

  return (
    <div className="w-full px-4 py-5 space-y-5">
      
      {/* En-tête */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/leads')}
            className="btn btn-ghost btn-sm btn-square"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl bg-${statutColor}/10 text-${statutColor}`}>
              {statutIcon}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{lead.nom}</h1>
              <p className="text-sm text-base-content/60">
                {lead.societe || 'Indépendant'} • {lead.source_display || lead.source}
                {lead.agence_nom && ` • ${lead.agence_nom}`}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className={`badge ${isOnline ? 'badge-success' : 'badge-error'} gap-1.5 px-3 py-2.5`}>
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            {isOnline ? 'En ligne' : 'Hors ligne'}
          </div>
          <span className={`badge badge-${statutColor} badge-md gap-1.5 px-3 py-2.5`}>
            {lead.statut_display || lead.statut}
          </span>
          {lead.budget_estime && (
            <span className="badge badge-primary badge-md gap-1.5 px-3 py-2.5">
              <DollarSign className="w-4 h-4" />
              {parseFloat(lead.budget_estime).toLocaleString()} €
            </span>
          )}
          {!isGagne && !isPerdu && (
            <button 
              onClick={() => setShowChangeStatutModal(true)}
              className="btn btn-sm btn-info gap-1.5"
            >
              <TrendingUp className="w-4 h-4" />
              Changer statut
            </button>
          )}
          {isGagne && (
            <button 
              onClick={handleConvertirClient}
              className="btn btn-sm btn-success gap-1.5"
            >
              <Handshake className="w-4 h-4" />
              Convertir en client
            </button>
          )}
          <Link 
            to={`/leads/edit/${id}`} 
            className="btn btn-sm btn-primary gap-1.5"
          >
            <Edit className="w-4 h-4" />
            Modifier
          </Link>
          <button 
            onClick={handleDelete}
            className="btn btn-sm btn-error gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            Supprimer
          </button>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-base-100 rounded-xl shadow-sm p-4 border border-base-200">
          <p className="text-xs text-base-content/40 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Âge
          </p>
          <p className="text-2xl font-bold text-primary">{age} jour{age > 1 ? 's' : ''}</p>
        </div>
        <div className="bg-base-100 rounded-xl shadow-sm p-4 border border-base-200">
          <p className="text-xs text-base-content/40 flex items-center gap-1">
            <Mail className="w-3 h-3" /> Interactions
          </p>
          <p className="text-2xl font-bold text-primary">{interactions.length}</p>
        </div>
        <div className="bg-base-100 rounded-xl shadow-sm p-4 border border-base-200">
          <p className="text-xs text-base-content/40 flex items-center gap-1">
            <DollarSign className="w-3 h-3" /> Budget estimé
          </p>
          <p className="text-2xl font-bold text-primary">{lead.budget_estime ? parseFloat(lead.budget_estime).toLocaleString() + ' €' : 'N/A'}</p>
        </div>
        <div className="bg-base-100 rounded-xl shadow-sm p-4 border border-base-200">
          <p className="text-xs text-base-content/40 flex items-center gap-1">
            <Calendar className="w-3 h-3" /> Prochaine action
          </p>
          <p className="text-2xl font-bold text-primary">{lead.prochaine_action ? new Date(lead.prochaine_action).toLocaleDateString('fr-FR') : 'N/A'}</p>
        </div>
      </div>

      {/* Informations détaillées */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Informations générales */}
        <div className="bg-base-100 rounded-xl shadow-sm p-4 border border-base-200">
          <h3 className="text-sm font-semibold uppercase text-base-content/40 mb-3 flex items-center gap-2">
            <UserCircle className="w-4 h-4" />
            Informations générales
          </h3>
          <div className="space-y-2">
            <p className="text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4 text-base-content/40" />
              Agence: <span className="font-medium">{agenceNom}</span>
            </p>
            <p className="text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-base-content/40" />
              Nom: <span className="font-medium">{lead.nom}</span>
            </p>
            <p className="text-sm flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-base-content/40" />
              Société: <span className="font-medium">{lead.societe || 'Indépendant'}</span>
            </p>
            <p className="text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-base-content/40" />
              Statut: <span className={`font-medium text-${statutColor}`}>{lead.statut_display || lead.statut}</span>
            </p>
            <p className="text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-base-content/40" />
              Source: <span className="font-medium">{lead.source_display || lead.source}</span>
            </p>
            {lead.commercial_name && (
              <p className="text-sm flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-base-content/40" />
                Commercial: <span className="font-medium">{lead.commercial_name}</span>
              </p>
            )}
            {lead.client_nom && (
              <p className="text-sm flex items-center gap-2">
                <Building2 className="w-4 h-4 text-base-content/40" />
                Client associé: <span className="font-medium">{lead.client_nom}</span>
              </p>
            )}
          </div>
        </div>

        {/* Contact */}
        <div className="bg-base-100 rounded-xl shadow-sm p-4 border border-base-200">
          <h3 className="text-sm font-semibold uppercase text-base-content/40 mb-3 flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Contact
          </h3>
          <div className="space-y-2">
            <p className="text-sm flex items-center gap-2">
              <Mail className="w-4 h-4 text-base-content/40" />
              Email: <span className="font-medium">{lead.email}</span>
            </p>
            <p className="text-sm flex items-center gap-2">
              <Phone className="w-4 h-4 text-base-content/40" />
              Téléphone: <span className="font-medium">{lead.telephone}</span>
            </p>
          </div>
        </div>

        {/* Qualification */}
        <div className="bg-base-100 rounded-xl shadow-sm p-4 border border-base-200">
          <h3 className="text-sm font-semibold uppercase text-base-content/40 mb-3 flex items-center gap-2">
            <Target className="w-4 h-4" />
            Qualification
          </h3>
          <div className="space-y-2">
            <p className="text-sm flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-base-content/40" />
              Budget estimé: <span className="font-medium">{lead.budget_estime ? parseFloat(lead.budget_estime).toLocaleString() + ' €' : 'Non renseigné'}</span>
            </p>
            <p className="text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-base-content/40" />
              Type travaux: <span className="font-medium">{lead.type_travaux || 'Non renseigné'}</span>
            </p>
            <p className="text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-base-content/40" />
              Délai souhaité: <span className="font-medium">{lead.delai_souhaite ? new Date(lead.delai_souhaite).toLocaleDateString('fr-FR') : 'Non renseigné'}</span>
            </p>
            <p className="text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-base-content/40" />
              Prochaine action: <span className="font-medium">{lead.prochaine_action ? new Date(lead.prochaine_action).toLocaleDateString('fr-FR') : 'Non planifiée'}</span>
            </p>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-base-100 rounded-xl shadow-sm p-4 border border-base-200">
          <h3 className="text-sm font-semibold uppercase text-base-content/40 mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Notes
          </h3>
          <p className="text-sm">{lead.notes || 'Aucune note'}</p>
          {isPerdu && lead.motif_perte && (
            <div className="mt-3 p-3 bg-error/10 rounded-lg border border-error/20">
              <p className="text-sm font-semibold text-error flex items-center gap-1">
                <XCircle className="w-4 h-4" /> Motif de la perte
              </p>
              <p className="text-sm text-base-content/80">{lead.motif_perte}</p>
              {lead.date_perte && (
                <p className="text-xs text-base-content/40 mt-1">Perdu le {new Date(lead.date_perte).toLocaleDateString('fr-FR')}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Interactions */}
      <div className="bg-base-100 rounded-xl shadow-sm p-4 border border-base-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold uppercase text-base-content/40 flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Interactions ({interactions.length})
          </h3>
          <Link to={`/interactions/create?lead=${id}`} className="btn btn-sm btn-primary gap-1">
            <Plus className="w-4 h-4" />
            Nouvelle interaction
          </Link>
        </div>
        {loadingRelations ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : interactions.length === 0 ? (
          <p className="text-center text-base-content/40 py-8">Aucune interaction</p>
        ) : (
          <div className="space-y-3">
            {interactions.map(interaction => (
              <div key={interaction.id} className="border-b border-base-200 pb-3 last:border-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="badge badge-sm badge-neutral">
                      {interaction.type_display || interaction.type_interaction}
                    </span>
                    <span className="text-sm font-medium">{interaction.sujet}</span>
                  </div>
                  <span className="text-xs text-base-content/40">
                    {interaction.date ? new Date(interaction.date).toLocaleString('fr-FR') : 'N/A'}
                  </span>
                </div>
                <p className="text-sm text-base-content/60 mt-1">{interaction.contenu}</p>
                {interaction.responsable_name && (
                  <p className="text-xs text-base-content/40 mt-1">
                    Par: {interaction.responsable_name}
                    {interaction.duree && ` • ${interaction.duree} min`}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Métadonnées */}
      <div className="text-xs text-base-content/40 text-center border-t border-base-200 pt-3">
        <p>Créé le {lead.created_at ? new Date(lead.created_at).toLocaleString('fr-FR') : 'N/A'}</p>
        {lead.updated_at && lead.updated_at !== lead.created_at && (
          <p>Modifié le {new Date(lead.updated_at).toLocaleString('fr-FR')}</p>
        )}
      </div>

      {/* Modal changement de statut */}
      {showChangeStatutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-base-100 rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-info" />
              Changer le statut
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nouveau statut</label>
                <select 
                  value={newStatut}
                  onChange={(e) => setNewStatut(e.target.value)}
                  className="select select-bordered w-full"
                >
                  {STATUT_CHOICES.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              {newStatut === 'perdu' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Motif de la perte</label>
                  <textarea 
                    value={motifPerte}
                    onChange={(e) => setMotifPerte(e.target.value)}
                    className="textarea textarea-bordered w-full"
                    rows="2"
                    placeholder="Raison de la perte..."
                  />
                </div>
              )}
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => {
                    setShowChangeStatutModal(false);
                    setMotifPerte('');
                  }}
                  className="btn flex-1"
                  disabled={changingStatut}
                >
                  Annuler
                </button>
                <button
                  onClick={handleChangeStatut}
                  className="btn btn-primary flex-1 gap-2"
                  disabled={changingStatut || !newStatut}
                >
                  {changingStatut ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                  {changingStatut ? 'Changement...' : 'Valider'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LeadDetail;