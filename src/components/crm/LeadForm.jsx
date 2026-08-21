// src/components/crm/LeadForm.jsx
// Formulaire de lead/prospect - Multi-agences

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Users, Save, X, RefreshCw, Wifi, WifiOff, AlertTriangle,
  UserCircle, Mail, Phone, Building2, ChevronLeft,
  DollarSign, Calendar, FileText, Loader2,
  Briefcase, Clock, Target, Star, Trophy, XCircle
} from 'lucide-react';
import AxiosInstance from '../AxiosInstance';
import cacheService from '../../services/CacheService';
import { saveOffline } from '../../services/syncService';

const STATUT_CHOICES = [
  { value: 'nouveau', label: 'Nouveau' },
  { value: 'contacte', label: 'Contacté' },
  { value: 'qualifie', label: 'Qualifié' },
  { value: 'devis', label: 'En devis' },
  { value: 'perdu', label: 'Perdu' },
  { value: 'gagne', label: 'Gagné' }
];

const SOURCE_CHOICES = [
  { value: 'site_web', label: 'Site web' },
  { value: 'bouche_a_oreille', label: 'Bouche à oreille' },
  { value: 'publicite', label: 'Publicité' },
  { value: 'salon', label: 'Salon professionnel' },
  { value: 'appel', label: 'Appel d\'offres' },
  { value: 'autre', label: 'Autre' }
];

function LeadForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingRelations, setLoadingRelations] = useState(true);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('info');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const [agences, setAgences] = useState([]);
  const [agencePrincipale, setAgencePrincipale] = useState(null);
  const [commerciaux, setCommerciaux] = useState([]);
  const [clients, setClients] = useState([]);
  
  const [formData, setFormData] = useState({
    agence: '',
    nom: '',
    email: '',
    telephone: '',
    societe: '',
    statut: 'nouveau',
    source: 'site_web',
    type_travaux: '',
    budget_estime: '',
    delai_souhaite: '',
    notes: '',
    prochaine_action: '',
    commercial: '',
    client: '',
  });

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      console.log('📶 Connexion rétablie');
      await loadRelations();
    };
    const handleOffline = () => {
      setIsOnline(false);
      console.log('📡 Mode hors ligne');
      loadFromCache();
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadFromCache = async () => {
    try {
      console.log('📡 Chargement depuis le cache...');
      
      const cachedAgences = await cacheService.getCachedAgences();
      if (cachedAgences && cachedAgences.length > 0) {
        setAgences(cachedAgences);
        if (!isEdit && cachedAgences.length > 0) {
          setFormData(prev => ({ ...prev, agence: cachedAgences[0].id }));
        }
      }
      
      const cachedUsers = await cacheService.getCachedUsers();
      if (cachedUsers) {
        const commerciaux = cachedUsers.filter(u => 
          u.est_commercial_btp || u.est_directeur_agence || u.role_global === 'pdg'
        );
        setCommerciaux(commerciaux);
      }
      
      const cachedClients = await cacheService.db.getItem('clients_cache');
      if (cachedClients) {
        setClients(cachedClients);
      }
    } catch (error) {
      console.error('❌ Erreur chargement cache:', error);
    }
  };

  const loadRelations = async () => {
    setLoadingRelations(true);
    try {
      const token = localStorage.getItem('Token');
      if (!token) {
        setLoadingRelations(false);
        return;
      }

      if (!navigator.onLine) {
        await loadFromCache();
        setLoadingRelations(false);
        return;
      }

      console.log('📡 Chargement depuis l\'API...');

      const [agencesRes, usersRes, clientsRes] = await Promise.all([
        AxiosInstance.get('/agences/', { headers: { Authorization: `Token ${token}` } }),
        AxiosInstance.get('/users/', { headers: { Authorization: `Token ${token}` } }),
        AxiosInstance.get('/clients/', { headers: { Authorization: `Token ${token}` } })
      ]);

      const agencesData = agencesRes.data || [];
      setAgences(agencesData);
      
      const user = JSON.parse(localStorage.getItem('User') || '{}');
      let principale = null;
      if (user.agence_principale) {
        principale = agencesData.find(a => a.id === user.agence_principale);
      }
      if (!principale && agencesData.length > 0) {
        principale = agencesData[0];
      }
      setAgencePrincipale(principale);
      if (!isEdit && principale) {
        setFormData(prev => ({ ...prev, agence: principale.id }));
      }

      const allUsers = usersRes.data || [];
      const commerciaux = allUsers.filter(u => 
        u.est_commercial_btp || u.est_directeur_agence || u.role_global === 'pdg'
      );
      setCommerciaux(commerciaux);

      const clientsData = clientsRes.data || [];
      setClients(clientsData);

      await cacheService.cacheAgences(agencesData);
      await cacheService.cacheUsers(allUsers);
      await cacheService.db.setItem('clients_cache', clientsData);
      console.log('✅ Données sauvegardées en cache');

    } catch (error) {
      console.error('❌ Erreur chargement relations:', error);
      await loadFromCache();
    } finally {
      setLoadingRelations(false);
    }
  };

  useEffect(() => {
    if (isEdit) {
      const loadLead = async () => {
        setLoadingData(true);
        try {
          const token = localStorage.getItem('Token');
          if (!token) {
            navigate('/login');
            return;
          }

          const response = await AxiosInstance.get(`/leads/${id}/`, {
            headers: { Authorization: `Token ${token}` }
          });
          
          const data = response.data;
          setFormData({
            agence: data.agence || '',
            nom: data.nom || '',
            email: data.email || '',
            telephone: data.telephone || '',
            societe: data.societe || '',
            statut: data.statut || 'nouveau',
            source: data.source || 'site_web',
            type_travaux: data.type_travaux || '',
            budget_estime: data.budget_estime || '',
            delai_souhaite: data.delai_souhaite || '',
            notes: data.notes || '',
            prochaine_action: data.prochaine_action || '',
            commercial: data.commercial || '',
            client: data.client || '',
          });

        } catch (error) {
          console.error('❌ Erreur chargement:', error);
          setMessageType('error');
          setMessage('Erreur lors du chargement');
        } finally {
          setLoadingData(false);
        }
      };
      loadLead();
    } else {
      setLoadingData(false);
    }
  }, [id, isEdit, navigate]);

  useEffect(() => {
    loadRelations();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const resetForm = () => {
    setFormData({
      agence: agencePrincipale ? agencePrincipale.id : '',
      nom: '',
      email: '',
      telephone: '',
      societe: '',
      statut: 'nouveau',
      source: 'site_web',
      type_travaux: '',
      budget_estime: '',
      delai_souhaite: '',
      notes: '',
      prochaine_action: '',
      commercial: '',
      client: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('Token');
      if (!token) {
        navigate('/login');
        return;
      }

      if (!formData.agence) {
        setMessageType('error');
        setMessage('❌ Veuillez sélectionner une agence');
        setLoading(false);
        return;
      }

      const dataToSend = {
        agence: parseInt(formData.agence),
        nom: formData.nom,
        email: formData.email,
        telephone: formData.telephone,
        societe: formData.societe || '',
        statut: formData.statut,
        source: formData.source,
        type_travaux: formData.type_travaux || '',
        budget_estime: formData.budget_estime ? parseFloat(formData.budget_estime) : null,
        delai_souhaite: formData.delai_souhaite || null,
        notes: formData.notes || '',
        prochaine_action: formData.prochaine_action || null,
        commercial: formData.commercial ? parseInt(formData.commercial) : null,
        client: formData.client ? parseInt(formData.client) : null,
      };

      let response;
      try {
        if (isEdit) {
          response = await AxiosInstance.put(`/leads/${id}/`, dataToSend, {
            headers: { Authorization: `Token ${token}` }
          });
        } else {
          response = await AxiosInstance.post('/leads/', dataToSend, {
            headers: { Authorization: `Token ${token}` }
          });
        }

        setMessageType('success');
        setMessage(isEdit ? '✅ Lead modifié avec succès' : '✅ Lead créé avec succès');
        
        if (!isEdit) resetForm();
        setTimeout(() => navigate('/leads'), 1500);

      } catch (error) {
        console.error('❌ Erreur API:', error);

        if (error.message === 'Network Error' || error.code === 'ERR_NETWORK' || !navigator.onLine) {
          try {
            const result = await saveOffline('/leads/', 'POST', dataToSend);
            console.log('💾 Sauvegardé offline via syncService:', result);
            
            setMessageType('warning');
            setMessage('💾 Sauvegardé localement - Sync auto à la reconnexion');
            if (!isEdit) resetForm();
            setTimeout(() => navigate('/leads'), 2000);
          } catch (cacheError) {
            console.error('❌ Erreur sauvegarde locale:', cacheError);
            setMessageType('error');
            setMessage('❌ Erreur lors de la sauvegarde locale');
          }
          setLoading(false);
          return;
        }

        if (error.response?.status === 401) {
          setMessageType('error');
          setMessage('🔒 Session expirée');
          setTimeout(() => navigate('/login'), 1500);
        } else if (error.response?.status === 400) {
          setMessageType('error');
          const errors = error.response.data;
          const messages = Object.keys(errors).flatMap(key => 
            Array.isArray(errors[key]) ? errors[key].map(e => `${key}: ${e}`) : `${key}: ${errors[key]}`
          );
          setMessage(`❌ ${messages.join(', ')}`);
        } else {
          setMessageType('error');
          setMessage(`❌ ${error.message || 'Erreur inconnue'}`);
        }
      }
    } catch (error) {
      console.error('❌ Erreur globale:', error);
      setMessageType('error');
      setMessage(`❌ ${error.message || 'Erreur inconnue'}`);
    }
    setLoading(false);
  };

  if (loadingData || loadingRelations) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="mt-4 text-base-content/60">
            {loadingRelations ? 'Chargement des données...' : 'Chargement...'}
          </p>
          {!isOnline && (
            <p className="text-xs text-warning mt-2">📡 Mode hors ligne - Données depuis le cache</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-88px)] overflow-hidden bg-base-200 w-full">
      <div className="h-full w-full bg-base-100 p-6 overflow-y-auto">
        
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-base-200 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/leads')}
              className="btn btn-ghost btn-sm btn-square"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="p-2 bg-primary/10 rounded-xl">
              <Briefcase className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold">
              {isEdit ? 'Modifier le lead' : 'Nouveau lead'}
            </h2>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            <div className={`badge ${isOnline ? 'badge-success' : 'badge-error'} gap-1.5 px-3 py-2.5`}>
              {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              {isOnline ? 'En ligne' : 'Hors ligne'}
            </div>
            <button 
              type="button" 
              className="btn btn-ghost btn-sm gap-1"
              onClick={() => navigate('/leads')}
            >
              <X className="w-4 h-4" />
              Fermer
            </button>
          </div>
        </div>

        {message && (
          <div className={`alert-offline ${messageType} mb-3 py-2 px-3`}>
            <span className="text-lg">
              {messageType === 'success' ? '✅' : 
               messageType === 'warning' ? '💾' : 
               messageType === 'error' ? '❌' : 'ℹ️'}
            </span>
            <span>{message}</span>
          </div>
        )}

        {!isOnline && (
          <div className="alert alert-warning mb-3 py-2 shadow-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>📡 Mode hors ligne - Données chargées depuis le cache</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="bg-base-200 rounded-xl p-4 border border-base-300">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-base-300">
              <Briefcase className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-base-content">Informations du lead</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              
              {/* Sélecteur d'agence */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  <Building2 className="w-4 h-4 inline mr-1.5" />
                  Agence <span className="text-error">*</span>
                </label>
                <select 
                  name="agence" 
                  value={formData.agence}
                  onChange={handleChange}
                  className="select select-bordered w-full"
                  required
                  disabled={agences.length === 1}
                >
                  <option value="">Sélectionner une agence</option>
                  {agences.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.nom} ({a.ville || 'N/A'})
                    </option>
                  ))}
                </select>
                {agences.length === 0 && (
                  <p className="text-xs text-warning mt-1">⚠️ Aucune agence disponible</p>
                )}
                {!isOnline && agences.length > 0 && (
                  <p className="text-xs text-info mt-1">💾 Agences depuis le cache</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  <UserCircle className="w-4 h-4 inline mr-1.5" />
                  Nom <span className="text-error">*</span>
                </label>
                <input 
                  name="nom" 
                  value={formData.nom}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="Nom complet"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  <Mail className="w-4 h-4 inline mr-1.5" />
                  Email <span className="text-error">*</span>
                </label>
                <input 
                  name="email" 
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="email@exemple.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  <Phone className="w-4 h-4 inline mr-1.5" />
                  Téléphone <span className="text-error">*</span>
                </label>
                <input 
                  name="telephone" 
                  value={formData.telephone}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="+221 77 123 45 67"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  <Building2 className="w-4 h-4 inline mr-1.5" />
                  Société
                </label>
                <input 
                  name="societe" 
                  value={formData.societe}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="Nom de l'entreprise"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  <Target className="w-4 h-4 inline mr-1.5" />
                  Statut <span className="text-error">*</span>
                </label>
                <select 
                  name="statut" 
                  value={formData.statut}
                  onChange={handleChange}
                  className="select select-bordered w-full"
                  required
                >
                  {STATUT_CHOICES.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  <FileText className="w-4 h-4 inline mr-1.5" />
                  Source <span className="text-error">*</span>
                </label>
                <select 
                  name="source" 
                  value={formData.source}
                  onChange={handleChange}
                  className="select select-bordered w-full"
                  required
                >
                  {SOURCE_CHOICES.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  <FileText className="w-4 h-4 inline mr-1.5" />
                  Type de travaux
                </label>
                <input 
                  name="type_travaux" 
                  value={formData.type_travaux}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="Ex: Gros œuvre, Électricité..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  <DollarSign className="w-4 h-4 inline mr-1.5" />
                  Budget estimé (€)
                </label>
                <input 
                  name="budget_estime" 
                  type="number"
                  step="0.01"
                  value={formData.budget_estime}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  <Calendar className="w-4 h-4 inline mr-1.5" />
                  Délai souhaité
                </label>
                <input 
                  name="delai_souhaite" 
                  type="date"
                  value={formData.delai_souhaite}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  <Clock className="w-4 h-4 inline mr-1.5" />
                  Prochaine action
                </label>
                <input 
                  name="prochaine_action" 
                  type="date"
                  value={formData.prochaine_action}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  <UserCircle className="w-4 h-4 inline mr-1.5" />
                  Commercial
                </label>
                <select 
                  name="commercial" 
                  value={formData.commercial}
                  onChange={handleChange}
                  className="select select-bordered w-full"
                >
                  <option value="">Sélectionner un commercial</option>
                  {commerciaux.map(c => {
                    const name = c.first_name || c.last_name ? `${c.first_name || ''} ${c.last_name || ''}`.trim() : c.email;
                    return (
                      <option key={c.id} value={c.id}>{name}</option>
                    );
                  })}
                </select>
                {!isOnline && commerciaux.length > 0 && (
                  <p className="text-xs text-info mt-1">💾 Commerciaux depuis le cache</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  <Building2 className="w-4 h-4 inline mr-1.5" />
                  Client existant
                </label>
                <select 
                  name="client" 
                  value={formData.client}
                  onChange={handleChange}
                  className="select select-bordered w-full"
                >
                  <option value="">Aucun</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.nom}</option>
                  ))}
                </select>
                {!isOnline && clients.length > 0 && (
                  <p className="text-xs text-info mt-1">💾 Clients depuis le cache</p>
                )}
              </div>

              <div className="col-span-full">
                <label className="block text-sm font-medium mb-1">
                  <FileText className="w-4 h-4 inline mr-1.5" />
                  Notes
                </label>
                <textarea 
                  name="notes" 
                  value={formData.notes}
                  onChange={handleChange}
                  className="textarea textarea-bordered w-full" 
                  rows="3"
                  placeholder="Informations complémentaires..."
                />
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 pt-4 border-t border-base-200">
            <button 
              type="submit" 
              className="btn btn-primary flex-1 min-w-[120px] gap-2"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {loading ? 'En cours...' : (isEdit ? 'Modifier' : 'Créer')}
            </button>
            
            <button 
              type="button" 
              className="btn btn-ghost gap-2"
              onClick={() => navigate('/leads')}
            >
              <X className="w-4 h-4" />
              Annuler
            </button>
            
            {!isEdit && (
              <button 
                type="button" 
                className="btn btn-ghost gap-2"
                onClick={resetForm}
                disabled={loading}
              >
                <RefreshCw className="w-4 h-4" />
                Réinitialiser
              </button>
            )}
          </div>
          
          {!isOnline && (
            <div className="text-center text-xs text-base-content/40 mt-1">
              💾 Sauvegarde locale - Synchronisation automatique à la reconnexion
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default LeadForm;