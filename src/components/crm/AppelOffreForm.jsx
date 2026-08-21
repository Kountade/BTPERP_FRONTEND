
// src/components/crm/AppelOffreForm.jsx
// Formulaire d'appel d'offres - Multi-agences

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FileText, Save, X, RefreshCw, Wifi, WifiOff, AlertTriangle,
  UserCircle, Building2, ChevronLeft,
  Calendar, DollarSign, Loader2, Briefcase, Clock
} from 'lucide-react';
import AxiosInstance from '../AxiosInstance';
import cacheService from '../../services/CacheService';

const STATUT_CHOICES = [
  { value: 'recu', label: 'Reçu' },
  { value: 'en_cours', label: 'En cours' },
  { value: 'soumis', label: 'Soumis' },
  { value: 'gagne', label: 'Gagné' },
  { value: 'perdu', label: 'Perdu' }
];

function AppelOffreForm() {
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
  const [clients, setClients] = useState([]);
  const [responsables, setResponsables] = useState([]);

  const [formData, setFormData] = useState({
    agence: '',
    reference: '',
    client: '',
    objet: '',
    description: '',
    date_publication: '',
    date_limite: '',
    date_soumission: '',
    statut: 'recu',
    budget_estime: '',
    montant_soumis: '',
    notes: '',
    responsable: '',
  });

  // Gestion de la connexion
  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      await loadRelations();
    };
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Chargement depuis le cache (hors ligne)
  const loadFromCache = async () => {
    try {
      console.log('📡 Chargement des relations depuis le cache...');

      // Agences
      const cachedAgences = await cacheService.getCachedAgences();
      if (cachedAgences && cachedAgences.length > 0) {
        setAgences(cachedAgences);
        const user = JSON.parse(localStorage.getItem('User') || '{}');
        let principale = null;
        if (user.agence_principale) {
          principale = cachedAgences.find(a => a.id === user.agence_principale);
        }
        if (!principale && cachedAgences.length > 0) {
          principale = cachedAgences[0];
        }
        setAgencePrincipale(principale);
        if (!isEdit && principale && !formData.agence) {
          setFormData(prev => ({ ...prev, agence: principale.id }));
        }
      }

      // Clients
      const cachedClients = await cacheService.db.getItem('clients_cache');
      if (cachedClients) {
        setClients(cachedClients);
      }

      // Utilisateurs (responsables)
      const cachedUsers = await cacheService.getCachedUsers();
      if (cachedUsers) {
        setResponsables(cachedUsers);
      }

      console.log('✅ Données chargées depuis le cache');
    } catch (error) {
      console.error('❌ Erreur chargement cache:', error);
    }
  };

  // Chargement des relations (API ou cache)
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

      console.log('📡 Chargement des relations depuis l\'API...');
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
      if (!isEdit && principale && !formData.agence) {
        setFormData(prev => ({ ...prev, agence: principale.id }));
      }

      setResponsables(usersRes.data || []);
      setClients(clientsRes.data || []);

      // Mise en cache
      await cacheService.cacheAgences(agencesData);
      await cacheService.cacheUsers(usersRes.data || []);
      await cacheService.db.setItem('clients_cache', clientsRes.data || []);
      console.log('✅ Données mises en cache');

    } catch (error) {
      console.error('❌ Erreur chargement relations:', error);
      await loadFromCache();
    } finally {
      setLoadingRelations(false);
    }
  };

  // Chargement de l'appel d'offres si édition
  useEffect(() => {
    if (isEdit) {
      const loadAppel = async () => {
        setLoadingData(true);
        try {
          const token = localStorage.getItem('Token');
          if (!token) {
            navigate('/login');
            return;
          }
          const response = await AxiosInstance.get(`/appels-offres/${id}/`, {
            headers: { Authorization: `Token ${token}` }
          });
          const data = response.data;
          setFormData({
            agence: data.agence || '',
            reference: data.reference || '',
            client: data.client || '',
            objet: data.objet || '',
            description: data.description || '',
            date_publication: data.date_publication || '',
            date_limite: data.date_limite || '',
            date_soumission: data.date_soumission || '',
            statut: data.statut || 'recu',
            budget_estime: data.budget_estime || '',
            montant_soumis: data.montant_soumis || '',
            notes: data.notes || '',
            responsable: data.responsable || '',
          });
        } catch (error) {
          console.error('❌ Erreur chargement:', error);
          setMessageType('error');
          setMessage('Erreur lors du chargement de l\'appel d\'offres');
        } finally {
          setLoadingData(false);
        }
      };
      loadAppel();
    } else {
      setLoadingData(false);
    }
  }, [id, isEdit, navigate]);

  // Chargement initial des relations
  useEffect(() => {
    loadRelations();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      agence: agencePrincipale ? agencePrincipale.id : '',
      reference: '',
      client: '',
      objet: '',
      description: '',
      date_publication: '',
      date_limite: '',
      date_soumission: '',
      statut: 'recu',
      budget_estime: '',
      montant_soumis: '',
      notes: '',
      responsable: '',
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

      if (!formData.client) {
        setMessageType('error');
        setMessage('❌ Veuillez sélectionner un client');
        setLoading(false);
        return;
      }

      const dataToSend = {
        agence: parseInt(formData.agence),
        reference: formData.reference,
        client: parseInt(formData.client),
        objet: formData.objet,
        description: formData.description || '',
        date_publication: formData.date_publication || null,
        date_limite: formData.date_limite || null,
        date_soumission: formData.date_soumission || null,
        statut: formData.statut,
        budget_estime: formData.budget_estime ? parseFloat(formData.budget_estime) : null,
        montant_soumis: formData.montant_soumis ? parseFloat(formData.montant_soumis) : null,
        notes: formData.notes || '',
        responsable: formData.responsable ? parseInt(formData.responsable) : null,
      };

      if (isEdit) {
        await AxiosInstance.put(`/appels-offres/${id}/`, dataToSend, {
          headers: { Authorization: `Token ${token}` }
        });
      } else {
        await AxiosInstance.post('/appels-offres/', dataToSend, {
          headers: { Authorization: `Token ${token}` }
        });
      }

      setMessageType('success');
      setMessage(isEdit ? '✅ Appel d\'offres modifié avec succès' : '✅ Appel d\'offres créé avec succès');
      
      if (!isEdit) resetForm();
      setTimeout(() => navigate('/appels-offres'), 1500);

    } catch (error) {
      console.error('❌ Erreur:', error);
      // Gestion hors ligne
      if (!navigator.onLine || error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
        try {
          await cacheService.addPendingOperation({
            type: isEdit ? 'UPDATE_APPEL_OFFRE' : 'CREATE_APPEL_OFFRE',
            data: formData,
            id: isEdit ? id : undefined
          });
          setMessageType('warning');
          setMessage('💾 Sauvegardé localement - Synchronisation automatique à la reconnexion');
          if (!isEdit) resetForm();
        } catch (cacheError) {
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
              onClick={() => navigate('/appels-offres')}
              className="btn btn-ghost btn-sm btn-square"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="p-2 bg-primary/10 rounded-xl">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold">
              {isEdit ? 'Modifier l\'appel d\'offres' : 'Nouvel appel d\'offres'}
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
              onClick={() => navigate('/appels-offres')}
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
               messageType === 'warning' ? '⚠️' : 
               messageType === 'error' ? '❌' : 'ℹ️'}
            </span>
            <span>{message}</span>
          </div>
        )}

        {!isOnline && (
          <div className="alert alert-warning mb-3 py-2 shadow-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>📡 Mode hors ligne - Données depuis le cache</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="bg-base-200 rounded-xl p-4 border border-base-300">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-base-300">
              <FileText className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-base-content">Informations de l'appel d'offres</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              
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
                {!isOnline && agences.length > 0 && (
                  <p className="text-xs text-info mt-1">💾 Agences depuis le cache</p>
                )}
                {agences.length === 0 && (
                  <p className="text-xs text-warning mt-1">⚠️ Aucune agence disponible</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  <FileText className="w-4 h-4 inline mr-1.5" />
                  Référence <span className="text-error">*</span>
                </label>
                <input 
                  name="reference" 
                  value={formData.reference}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="Ex: AO-2025-001"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  <Building2 className="w-4 h-4 inline mr-1.5" />
                  Client <span className="text-error">*</span>
                </label>
                <select 
                  name="client" 
                  value={formData.client}
                  onChange={handleChange}
                  className="select select-bordered w-full"
                  required
                >
                  <option value="">Sélectionner un client</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.nom}</option>
                  ))}
                </select>
                {!isOnline && clients.length > 0 && (
                  <p className="text-xs text-info mt-1">💾 Clients depuis le cache</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  <FileText className="w-4 h-4 inline mr-1.5" />
                  Objet <span className="text-error">*</span>
                </label>
                <input 
                  name="objet" 
                  value={formData.objet}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="Objet de l'appel d'offres"
                  required
                />
              </div>

              <div className="col-span-full">
                <label className="block text-sm font-medium mb-1">
                  <FileText className="w-4 h-4 inline mr-1.5" />
                  Description
                </label>
                <textarea 
                  name="description" 
                  value={formData.description}
                  onChange={handleChange}
                  className="textarea textarea-bordered w-full" 
                  rows="2"
                  placeholder="Description détaillée..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  <Calendar className="w-4 h-4 inline mr-1.5" />
                  Date de publication
                </label>
                <input 
                  name="date_publication" 
                  type="date"
                  value={formData.date_publication}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  <Calendar className="w-4 h-4 inline mr-1.5" />
                  Date limite <span className="text-error">*</span>
                </label>
                <input 
                  name="date_limite" 
                  type="date"
                  value={formData.date_limite}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  <Calendar className="w-4 h-4 inline mr-1.5" />
                  Date de soumission
                </label>
                <input 
                  name="date_soumission" 
                  type="date"
                  value={formData.date_soumission}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  <Briefcase className="w-4 h-4 inline mr-1.5" />
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
                  <DollarSign className="w-4 h-4 inline mr-1.5" />
                  Montant soumis (€)
                </label>
                <input 
                  name="montant_soumis" 
                  type="number"
                  step="0.01"
                  value={formData.montant_soumis}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  <UserCircle className="w-4 h-4 inline mr-1.5" />
                  Responsable
                </label>
                <select 
                  name="responsable" 
                  value={formData.responsable}
                  onChange={handleChange}
                  className="select select-bordered w-full"
                >
                  <option value="">Sélectionner</option>
                  {responsables.map(u => {
                    const name = u.first_name || u.last_name ? `${u.first_name || ''} ${u.last_name || ''}`.trim() : u.email;
                    return (
                      <option key={u.id} value={u.id}>{name}</option>
                    );
                  })}
                </select>
                {!isOnline && responsables.length > 0 && (
                  <p className="text-xs text-info mt-1">💾 Responsables depuis le cache</p>
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
                  rows="2"
                  placeholder="Notes complémentaires..."
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
              onClick={() => navigate('/appels-offres')}
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

export default AppelOffreForm;