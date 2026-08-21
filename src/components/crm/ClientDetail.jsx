// src/components/crm/ClientDetail.jsx
// Détails d'un client - Multi-agences

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  Building2, ChevronLeft, Edit, Trash2, 
  UserCircle, Mail, Phone, MapPin, Wifi, WifiOff,
  AlertTriangle, DollarSign, Star, Calendar,
  FileText, Users, Loader2, CheckCircle, XCircle,
  Briefcase, CreditCard, Eye
} from 'lucide-react';
import AxiosInstance from '../AxiosInstance';

function ClientDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  const [leads, setLeads] = useState([]);
  const [appelsOffres, setAppelsOffres] = useState([]);
  const [interactions, setInteractions] = useState([]);
  const [loadingRelations, setLoadingRelations] = useState(false);
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

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('Token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Charger le client
        const response = await AxiosInstance.get(`/clients/${id}/`, {
          headers: { Authorization: `Token ${token}` }
        });
        setClient(response.data);

        // Charger les relations
        setLoadingRelations(true);
        try {
          const [leadsRes, appelsRes, interactionsRes] = await Promise.all([
            AxiosInstance.get(`/clients/${id}/leads/`, {
              headers: { Authorization: `Token ${token}` }
            }),
            AxiosInstance.get(`/clients/${id}/appels-offres/`, {
              headers: { Authorization: `Token ${token}` }
            }),
            AxiosInstance.get(`/clients/${id}/interactions/`, {
              headers: { Authorization: `Token ${token}` }
            })
          ]);
          setLeads(leadsRes.data || []);
          setAppelsOffres(appelsRes.data || []);
          setInteractions(interactionsRes.data || []);
        } catch (relError) {
          console.warn('⚠️ Erreur chargement relations:', relError);
        } finally {
          setLoadingRelations(false);
        }

      } catch (error) {
        console.error('❌ Erreur chargement:', error);
        if (error.response?.status === 401) {
          navigate('/login');
        } else if (error.response?.status === 404) {
          setError('Client non trouvé');
        } else {
          setError('Erreur lors du chargement du client');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadData();
    }
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!window.confirm('Supprimer ce client ?')) return;
    
    try {
      const token = localStorage.getItem('Token');
      await AxiosInstance.delete(`/clients/${id}/`, {
        headers: { Authorization: `Token ${token}` }
      });
      navigate('/clients');
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const getTypeBadgeColor = (type) => {
    const colors = {
      'particulier': 'neutral',
      'entreprise': 'primary',
      'collectivite': 'secondary',
      'promoteur': 'warning',
      'bailleur': 'info'
    };
    return colors[type] || 'neutral';
  };

  const getStatutColor = (statut) => {
    const colors = {
      'recu': 'neutral',
      'en_cours': 'warning',
      'soumis': 'info',
      'gagne': 'success',
      'perdu': 'error'
    };
    return colors[statut] || 'neutral';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-base-content/60">Chargement du client...</p>
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-error mx-auto mb-4" />
          <h3 className="text-lg font-medium">{error || 'Client non trouvé'}</h3>
          <Link to="/clients" className="btn btn-primary mt-4">
            Retour à la liste
          </Link>
        </div>
      </div>
    );
  }

  const typeColor = getTypeBadgeColor(client.type_client);
  const agenceNom = client.agence_nom || client.agence || 'Non assignée';

  return (
    <div className="w-full px-4 py-5 space-y-5">
      
      {/* En-tête */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/clients')}
            className="btn btn-ghost btn-sm btn-square"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${client.actif ? 'bg-primary/10 text-primary' : 'bg-base-300 text-base-content/40'}`}>
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{client.nom}</h1>
              <p className="text-sm text-base-content/60">
                {client.type_display || client.type_client}
                {client.siret && ` • SIRET: ${client.siret}`}
                {client.agence_nom && ` • ${client.agence_nom}`}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className={`badge ${isOnline ? 'badge-success' : 'badge-error'} gap-1.5 px-3 py-2.5`}>
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            {isOnline ? 'En ligne' : 'Hors ligne'}
          </div>
          <span className={`badge badge-${typeColor} badge-md gap-1.5 px-3 py-2.5`}>
            {client.type_display || client.type_client}
          </span>
          <span className={`badge ${client.actif ? 'badge-success' : 'badge-error'} badge-md gap-1.5 px-3 py-2.5`}>
            {client.actif ? 'Actif' : 'Inactif'}
          </span>
          {client.note > 0 && (
            <span className="badge badge-warning badge-md gap-1.5 px-3 py-2.5">
              <Star className="w-4 h-4" />
              {client.note}
            </span>
          )}
          <Link 
            to={`/clients/edit/${id}`} 
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
          <p className="text-xs text-base-content/40">Leads</p>
          <p className="text-2xl font-bold text-primary">{leads.length}</p>
        </div>
        <div className="bg-base-100 rounded-xl shadow-sm p-4 border border-base-200">
          <p className="text-xs text-base-content/40">Appels d'offres</p>
          <p className="text-2xl font-bold text-primary">{appelsOffres.length}</p>
        </div>
        <div className="bg-base-100 rounded-xl shadow-sm p-4 border border-base-200">
          <p className="text-xs text-base-content/40">Interactions</p>
          <p className="text-2xl font-bold text-primary">{interactions.length}</p>
        </div>
        <div className="bg-base-100 rounded-xl shadow-sm p-4 border border-base-200">
          <p className="text-xs text-base-content/40">Plafond crédit</p>
          <p className="text-2xl font-bold text-primary">{parseFloat(client.plafond_credit || 0).toLocaleString()} €</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs tabs-boxed bg-base-100 p-1">
        <button 
          className={`tab ${activeTab === 'info' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          <Building2 className="w-4 h-4 mr-2" />
          Informations
        </button>
        <button 
          className={`tab ${activeTab === 'leads' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('leads')}
        >
          <Users className="w-4 h-4 mr-2" />
          Leads ({leads.length})
        </button>
        <button 
          className={`tab ${activeTab === 'appels' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('appels')}
        >
          <FileText className="w-4 h-4 mr-2" />
          Appels d'offres ({appelsOffres.length})
        </button>
        <button 
          className={`tab ${activeTab === 'interactions' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('interactions')}
        >
          <Mail className="w-4 h-4 mr-2" />
          Interactions ({interactions.length})
        </button>
      </div>

      {/* Contenu des tabs */}
      {activeTab === 'info' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Informations générales */}
          <div className="bg-base-100 rounded-xl shadow-sm p-4 border border-base-200">
            <h3 className="text-sm font-semibold uppercase text-base-content/40 mb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Informations générales
            </h3>
            <div className="space-y-2">
              <p className="text-sm flex items-center gap-2">
                <Building2 className="w-4 h-4 text-base-content/40" />
                Agence: <span className="font-medium">{agenceNom}</span>
              </p>
              <p className="text-sm flex items-center gap-2">
                <UserCircle className="w-4 h-4 text-base-content/40" />
                Nom: <span className="font-medium">{client.nom}</span>
              </p>
              <p className="text-sm flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-base-content/40" />
                Type: <span className="font-medium">{client.type_display || client.type_client}</span>
              </p>
              <p className="text-sm flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-base-content/40" />
                SIRET: <span className="font-medium">{client.siret || 'Non renseigné'}</span>
              </p>
              <p className="text-sm flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-base-content/40" />
                Plafond crédit: <span className="font-medium">{parseFloat(client.plafond_credit || 0).toLocaleString()} €</span>
              </p>
              <p className="text-sm flex items-center gap-2">
                <Star className="w-4 h-4 text-base-content/40" />
                Note: <span className="font-medium">{client.note || 0}/5</span>
              </p>
              <p className="text-sm flex items-center gap-2">
                {client.actif ? (
                  <CheckCircle className="w-4 h-4 text-success" />
                ) : (
                  <XCircle className="w-4 h-4 text-error" />
                )}
                Statut: <span className={`font-medium ${client.actif ? 'text-success' : 'text-error'}`}>
                  {client.actif ? 'Actif' : 'Inactif'}
                </span>
              </p>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-base-100 rounded-xl shadow-sm p-4 border border-base-200">
            <h3 className="text-sm font-semibold uppercase text-base-content/40 mb-3 flex items-center gap-2">
              <UserCircle className="w-4 h-4" />
              Contact
            </h3>
            <div className="space-y-2">
              <p className="text-sm flex items-center gap-2">
                <Mail className="w-4 h-4 text-base-content/40" />
                Email: <span className="font-medium">{client.email}</span>
              </p>
              <p className="text-sm flex items-center gap-2">
                <Phone className="w-4 h-4 text-base-content/40" />
                Téléphone: <span className="font-medium">{client.telephone}</span>
              </p>
              <p className="text-sm flex items-center gap-2">
                <UserCircle className="w-4 h-4 text-base-content/40" />
                Contact principal: <span className="font-medium">{client.contact_principal || 'Non renseigné'}</span>
              </p>
              <p className="text-sm flex items-center gap-2">
                <Phone className="w-4 h-4 text-base-content/40" />
                Tél. contact: <span className="font-medium">{client.contact_telephone || 'Non renseigné'}</span>
              </p>
              <p className="text-sm flex items-center gap-2">
                <Mail className="w-4 h-4 text-base-content/40" />
                Email contact: <span className="font-medium">{client.contact_email || 'Non renseigné'}</span>
              </p>
            </div>
          </div>

          {/* Adresse */}
          <div className="bg-base-100 rounded-xl shadow-sm p-4 border border-base-200 md:col-span-2">
            <h3 className="text-sm font-semibold uppercase text-base-content/40 mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Adresse
            </h3>
            <div className="space-y-2">
              <p className="text-sm">{client.adresse}</p>
              <p className="text-sm">{client.code_postal} {client.ville}</p>
              <p className="text-sm">{client.pays}</p>
            </div>
          </div>

          {/* Métadonnées */}
          <div className="text-xs text-base-content/40 text-center border-t border-base-200 pt-3 col-span-full">
            <p>Créé le {client.created_at ? new Date(client.created_at).toLocaleString('fr-FR') : 'N/A'}</p>
            {client.updated_at && client.updated_at !== client.created_at && (
              <p>Modifié le {new Date(client.updated_at).toLocaleString('fr-FR')}</p>
            )}
            {client.created_by_name && (
              <p>Créé par: {client.created_by_name}</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'leads' && (
        <div className="bg-base-100 rounded-xl shadow-sm p-4 border border-base-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold uppercase text-base-content/40">Leads associés</h3>
            <Link to="/leads/create" className="btn btn-sm btn-primary gap-1">
              <Users className="w-4 h-4" />
              Nouveau lead
            </Link>
          </div>
          {loadingRelations ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : leads.length === 0 ? (
            <p className="text-center text-base-content/40 py-8">Aucun lead associé</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Statut</th>
                    <th>Source</th>
                    <th>Commercial</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map(lead => (
                    <tr key={lead.id}>
                      <td className="font-medium">{lead.nom}</td>
                      <td>
                        <span className={`badge badge-sm ${
                          lead.statut === 'gagne' ? 'badge-success' :
                          lead.statut === 'perdu' ? 'badge-error' :
                          lead.statut === 'devis' ? 'badge-warning' :
                          'badge-neutral'
                        }`}>
                          {lead.statut_display || lead.statut}
                        </span>
                      </td>
                      <td>{lead.source_display || lead.source}</td>
                      <td>{lead.commercial_name || 'Non assigné'}</td>
                      <td>
                        <Link to={`/leads/${lead.id}`} className="btn btn-ghost btn-xs btn-square">
                          <Eye className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'appels' && (
        <div className="bg-base-100 rounded-xl shadow-sm p-4 border border-base-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold uppercase text-base-content/40">Appels d'offres</h3>
            <Link to="/appels-offres/create" className="btn btn-sm btn-primary gap-1">
              <FileText className="w-4 h-4" />
              Nouvel appel d'offres
            </Link>
          </div>
          {loadingRelations ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : appelsOffres.length === 0 ? (
            <p className="text-center text-base-content/40 py-8">Aucun appel d'offres</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Référence</th>
                    <th>Objet</th>
                    <th>Date limite</th>
                    <th>Statut</th>
                    <th>Budget</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appelsOffres.map(ao => (
                    <tr key={ao.id}>
                      <td className="font-medium">{ao.reference}</td>
                      <td>{ao.objet}</td>
                      <td>{ao.date_limite ? new Date(ao.date_limite).toLocaleDateString('fr-FR') : 'N/A'}</td>
                      <td>
                        <span className={`badge badge-sm badge-${getStatutColor(ao.statut)}`}>
                          {ao.statut_display || ao.statut}
                        </span>
                      </td>
                      <td>{parseFloat(ao.budget_estime || 0).toLocaleString()} €</td>
                      <td>
                        <Link to={`/appels-offres/${ao.id}`} className="btn btn-ghost btn-xs btn-square">
                          <Eye className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'interactions' && (
        <div className="bg-base-100 rounded-xl shadow-sm p-4 border border-base-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold uppercase text-base-content/40">Interactions</h3>
            <Link to="/interactions/create" className="btn btn-sm btn-primary gap-1">
              <Mail className="w-4 h-4" />
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
      )}
    </div>
  );
}

export default ClientDetail;