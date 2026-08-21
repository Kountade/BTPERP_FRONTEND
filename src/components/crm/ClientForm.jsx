// src/components/crm/ClientForm.jsx
// Formulaire client - Multi-agences

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Building2, Save, X, RefreshCw, Wifi, WifiOff, AlertTriangle,
  UserCircle, Mail, Phone, MapPin, ChevronLeft,
  DollarSign, UserPlus, Loader2, CheckCircle
} from 'lucide-react';
import AxiosInstance from '../AxiosInstance';
import cacheService from '../../services/CacheService';
import { saveOffline } from '../../services/syncService';

function ClientForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingRelations, setLoadingRelations] = useState(true);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('info');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // ✅ État pour les agences disponibles
  const [agences, setAgences] = useState([]);
  const [agencePrincipale, setAgencePrincipale] = useState(null);
  
  const [formData, setFormData] = useState({
    agence: '', // ✅ Ajout du champ agence
    nom: '',
    type_client: 'particulier',
    siret: '',
    email: '',
    telephone: '',
    adresse: '',
    code_postal: '',
    ville: '',
    pays: 'France',
    contact_principal: '',
    contact_telephone: '',
    contact_email: '',
    numero_compte: '',
    plafond_credit: '',
    actif: true,
    note: '',
  });

  const TYPE_CHOICES = [
    { value: 'particulier', label: 'Particulier' },
    { value: 'entreprise', label: 'Entreprise' },
    { value: 'collectivite', label: 'Collectivité' },
    { value: 'promoteur', label: 'Promoteur' },
    { value: 'bailleur', label: 'Bailleur social' }
  ];

  // Surveiller la connexion
  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      console.log('📶 Connexion rétablie');
      await loadAgences();
    };
    const handleOffline = () => {
      setIsOnline(false);
      console.log('📡 Mode hors ligne');
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // ✅ Charger les agences de l'utilisateur
  const loadAgences = async () => {
    setLoadingRelations(true);
    try {
      const token = localStorage.getItem('Token');
      if (!token) {
        setLoadingRelations(false);
        return;
      }

      // Récupérer les agences via l'API (sans /api)
      const response = await AxiosInstance.get('/agences/', {
        headers: { Authorization: `Token ${token}` }
      });

      const agencesData = response.data || [];
      // Filtrer les agences actives
      const activeAgences = agencesData.filter(a => a.est_active !== false);
      setAgences(activeAgences);

      // Déterminer l'agence principale (première ou celle marquée comme principale)
      // L'utilisateur peut avoir une agence_principale dans ses données
      const user = JSON.parse(localStorage.getItem('User') || '{}');
      let principale = null;
      if (user.agence_principale) {
        principale = activeAgences.find(a => a.id === user.agence_principale);
      }
      if (!principale && activeAgences.length > 0) {
        principale = activeAgences[0];
      }
      setAgencePrincipale(principale);
      
      // Si le formulaire est en création et qu'on a une agence principale, on la pré-sélectionne
      if (!isEdit && principale) {
        setFormData(prev => ({ ...prev, agence: principale.id }));
      }

    } catch (error) {
      console.error('❌ Erreur chargement agences:', error);
      // Essayer le cache
      try {
        const cachedAgences = await cacheService.getCachedAgences();
        if (cachedAgences && cachedAgences.length > 0) {
          setAgences(cachedAgences);
          if (!isEdit && cachedAgences.length > 0) {
            setFormData(prev => ({ ...prev, agence: cachedAgences[0].id }));
          }
        }
      } catch (e) {
        console.warn('Impossible de charger les agences depuis le cache');
      }
    } finally {
      setLoadingRelations(false);
    }
  };

  // Charger les données du client si édition
  useEffect(() => {
    if (isEdit) {
      const loadClient = async () => {
        setLoadingData(true);
        try {
          const token = localStorage.getItem('Token');
          if (!token) {
            navigate('/login');
            return;
          }

          const response = await AxiosInstance.get(`/clients/${id}/`, {
            headers: { Authorization: `Token ${token}` }
          });
          
          const data = response.data;
          setFormData({
            agence: data.agence || '',
            nom: data.nom || '',
            type_client: data.type_client || 'particulier',
            siret: data.siret || '',
            email: data.email || '',
            telephone: data.telephone || '',
            adresse: data.adresse || '',
            code_postal: data.code_postal || '',
            ville: data.ville || '',
            pays: data.pays || 'France',
            contact_principal: data.contact_principal || '',
            contact_telephone: data.contact_telephone || '',
            contact_email: data.contact_email || '',
            numero_compte: data.numero_compte || '',
            plafond_credit: data.plafond_credit || '',
            actif: data.actif !== undefined ? data.actif : true,
            note: data.note || '',
          });

        } catch (error) {
          console.error('❌ Erreur chargement:', error);
          setMessageType('error');
          setMessage('Erreur lors du chargement');
        } finally {
          setLoadingData(false);
        }
      };
      loadClient();
    } else {
      setLoadingData(false);
    }
  }, [id, isEdit, navigate]);

  // Charger les agences au montage
  useEffect(() => {
    loadAgences();
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
      type_client: 'particulier',
      siret: '',
      email: '',
      telephone: '',
      adresse: '',
      code_postal: '',
      ville: '',
      pays: 'France',
      contact_principal: '',
      contact_telephone: '',
      contact_email: '',
      numero_compte: '',
      plafond_credit: '',
      actif: true,
      note: '',
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

      // ✅ Vérifier que l'agence est sélectionnée
      if (!formData.agence) {
        setMessageType('error');
        setMessage('❌ Veuillez sélectionner une agence');
        setLoading(false);
        return;
      }

      const dataToSend = {
        agence: parseInt(formData.agence),
        nom: formData.nom,
        type_client: formData.type_client,
        siret: formData.siret || null,
        email: formData.email,
        telephone: formData.telephone,
        adresse: formData.adresse,
        code_postal: formData.code_postal,
        ville: formData.ville,
        pays: formData.pays,
        contact_principal: formData.contact_principal,
        contact_telephone: formData.contact_telephone,
        contact_email: formData.contact_email,
        numero_compte: formData.numero_compte || null,
        plafond_credit: formData.plafond_credit ? parseFloat(formData.plafond_credit) : 0,
        actif: formData.actif,
        note: formData.note ? parseFloat(formData.note) : 0,
      };

      let response;
      try {
        if (isEdit) {
          response = await AxiosInstance.put(`/clients/${id}/`, dataToSend, {
            headers: { Authorization: `Token ${token}` }
          });
        } else {
          response = await AxiosInstance.post('/clients/', dataToSend, {
            headers: { Authorization: `Token ${token}` }
          });
        }

        setMessageType('success');
        setMessage(isEdit ? '✅ Client modifié avec succès' : '✅ Client créé avec succès');
        
        if (!isEdit) resetForm();
        setTimeout(() => navigate('/clients'), 1500);

      } catch (error) {
        console.error('❌ Erreur API:', error);

        if (error.message === 'Network Error' || error.code === 'ERR_NETWORK' || !navigator.onLine) {
          try {
            const result = await saveOffline('/clients/', 'POST', dataToSend);
            console.log('💾 Sauvegardé offline via syncService:', result);
            
            setMessageType('warning');
            setMessage('💾 Sauvegardé localement - Sync auto à la reconnexion');
            if (!isEdit) resetForm();
            setTimeout(() => navigate('/clients'), 2000);
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
            {loadingRelations ? 'Chargement des agences...' : 'Chargement...'}
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
              onClick={() => navigate('/clients')}
              className="btn btn-ghost btn-sm btn-square"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="p-2 bg-primary/10 rounded-xl">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold">
              {isEdit ? 'Modifier le client' : 'Nouveau client'}
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
              onClick={() => navigate('/clients')}
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
              <Building2 className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-base-content">Informations du client</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              
              {/* ✅ Sélecteur d'agence */}
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
                  disabled={agences.length === 1} // Si une seule agence, on désactive
                >
                  <option value="">Sélectionner une agence</option>
                  {agences.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.nom} ({a.ville || 'N/A'})
                    </option>
                  ))}
                </select>
                {agences.length === 0 && (
                  <p className="text-xs text-warning mt-1">
                    ⚠️ Aucune agence disponible. Contactez l'administrateur.
                  </p>
                )}
                {!isOnline && agences.length > 0 && (
                  <p className="text-xs text-info mt-1">💾 Agences depuis le cache</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  <Building2 className="w-4 h-4 inline mr-1.5" />
                  Nom <span className="text-error">*</span>
                </label>
                <input 
                  name="nom" 
                  value={formData.nom}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="Nom du client"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  <UserCircle className="w-4 h-4 inline mr-1.5" />
                  Type <span className="text-error">*</span>
                </label>
                <select 
                  name="type_client" 
                  value={formData.type_client}
                  onChange={handleChange}
                  className="select select-bordered w-full"
                  required
                >
                  {TYPE_CHOICES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  SIRET
                </label>
                <input 
                  name="siret" 
                  value={formData.siret}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="12345678901234"
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
                  placeholder="client@email.com"
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
                  <MapPin className="w-4 h-4 inline mr-1.5" />
                  Code postal
                </label>
                <input 
                  name="code_postal" 
                  value={formData.code_postal}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="Code postal"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  <MapPin className="w-4 h-4 inline mr-1.5" />
                  Ville
                </label>
                <input 
                  name="ville" 
                  value={formData.ville}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="Ville"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  <MapPin className="w-4 h-4 inline mr-1.5" />
                  Pays
                </label>
                <input 
                  name="pays" 
                  value={formData.pays}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="Pays"
                />
              </div>

              <div className="col-span-full">
                <label className="block text-sm font-medium mb-1">
                  <MapPin className="w-4 h-4 inline mr-1.5" />
                  Adresse
                </label>
                <input 
                  name="adresse" 
                  value={formData.adresse}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="Adresse complète"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  <UserCircle className="w-4 h-4 inline mr-1.5" />
                  Contact principal
                </label>
                <input 
                  name="contact_principal" 
                  value={formData.contact_principal}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="Nom du contact"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  <Phone className="w-4 h-4 inline mr-1.5" />
                  Téléphone contact
                </label>
                <input 
                  name="contact_telephone" 
                  value={formData.contact_telephone}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="+221 77 123 45 67"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  <Mail className="w-4 h-4 inline mr-1.5" />
                  Email contact
                </label>
                <input 
                  name="contact_email" 
                  type="email"
                  value={formData.contact_email}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="contact@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  <DollarSign className="w-4 h-4 inline mr-1.5" />
                  Plafond crédit (€)
                </label>
                <input 
                  name="plafond_credit" 
                  type="number"
                  step="0.01"
                  value={formData.plafond_credit}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Numéro compte
                </label>
                <input 
                  name="numero_compte" 
                  value={formData.numero_compte}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="Numéro de compte"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Note (0-5)
                </label>
                <input 
                  name="note" 
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={formData.note}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="0"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input 
                  name="actif" 
                  type="checkbox"
                  checked={formData.actif}
                  onChange={handleChange}
                  className="checkbox checkbox-success"
                />
                <label className="text-sm font-medium">
                  <CheckCircle className="w-4 h-4 inline mr-1.5" />
                  Client actif
                </label>
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
              onClick={() => navigate('/clients')}
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

export default ClientForm;