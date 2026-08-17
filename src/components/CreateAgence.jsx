// src/components/CreateAgence.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AxiosInstance from './AxiosInstance';

function CreateAgence() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('info');
  const [formData, setFormData] = useState({
    nom: '',
    type_agence: 'regionale',
    region: 'centre',
    adresse: '',
    telephone: '',
    email: '',
    ville: '',
    code_postal: '',
    pays: 'France',
    superficie_m2: '',
    capacite_stockage: '',
    nb_engins_max: '',
    nb_employes_max: ''
  });

  // ✅ État pour le mode hors ligne
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // ✅ Surveiller les changements de connexion
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('📶 Connexion rétablie');
    };
    const handleOffline = () => {
      setIsOnline(false);
      console.log('📡 Hors ligne');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // ✅ Charger les données si modification
  useEffect(() => {
    if (isEdit) {
      const loadAgence = async () => {
        try {
          const response = await AxiosInstance.get(`/agences/${id}/`);
          const data = response.data;
          setFormData({
            nom: data.nom || '',
            type_agence: data.type_agence || 'regionale',
            region: data.region || 'centre',
            adresse: data.adresse || '',
            telephone: data.telephone || '',
            email: data.email || '',
            ville: data.ville || '',
            code_postal: data.code_postal || '',
            pays: data.pays || 'France',
            superficie_m2: data.superficie_m2 || '',
            capacite_stockage: data.capacite_stockage || '',
            nb_engins_max: data.nb_engins_max || '',
            nb_employes_max: data.nb_employes_max || ''
          });
        } catch (error) {
          console.error('Erreur chargement:', error);
          setMessageType('error');
          setMessage('❌ Erreur lors du chargement de l\'agence');
        }
      };
      loadAgence();
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // ✅ Réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      nom: '',
      type_agence: 'regionale',
      region: 'centre',
      adresse: '',
      telephone: '',
      email: '',
      ville: '',
      code_postal: '',
      pays: 'France',
      superficie_m2: '',
      capacite_stockage: '',
      nb_engins_max: '',
      nb_employes_max: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    
    try {
      // ✅ Nettoyer les données - convertir les nombres
      const dataToSend = {
        ...formData,
        superficie_m2: formData.superficie_m2 ? parseInt(formData.superficie_m2) : null,
        capacite_stockage: formData.capacite_stockage ? parseFloat(formData.capacite_stockage) : null,
        nb_engins_max: formData.nb_engins_max ? parseInt(formData.nb_engins_max) : null,
        nb_employes_max: formData.nb_employes_max ? parseInt(formData.nb_employes_max) : null
      };

      let response;
      if (isEdit) {
        response = await AxiosInstance.put(`/agences/${id}/`, dataToSend);
      } else {
        response = await AxiosInstance.post('/agences/', dataToSend);
      }
      
      // ✅ Vérifier si la réponse est offline
      if (response.data && response.data.offline) {
        setMessageType('warning');
        setMessage('💾 Agence sauvegardée localement. Synchronisation automatique à la reconnexion.');
        // ✅ Réinitialiser le formulaire même en offline
        if (!isEdit) {
          resetForm();
        }
      } else {
        setMessageType('success');
        setMessage(isEdit ? '✅ Agence modifiée avec succès !' : '✅ Agence créée avec succès !');
        
        if (!isEdit) {
          resetForm();
        }
        
        // ✅ Rediriger vers la liste après 2 secondes
        setTimeout(() => {
          navigate('/agences');
        }, 2000);
      }
      
    } catch (error) {
      console.error('❌ Erreur création agence:', error);
      
      // ✅ Gestion des erreurs OFFLINE
      if (error.message === 'Network Error' || error.code === 'ERR_NETWORK' || !navigator.onLine) {
        setMessageType('warning');
        setMessage('💾 Agence sauvegardée localement (hors ligne). Synchronisation automatique à la reconnexion.');
        
        // ✅ Réinitialiser le formulaire même en offline
        if (!isEdit) {
          resetForm();
        }
        setLoading(false);
        return;
      }
      
      // ✅ Gestion des erreurs 401 (non authentifié)
      if (error.response?.status === 401) {
        setMessageType('error');
        setMessage('🔒 Session expirée. Veuillez vous reconnecter.');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } 
      // ✅ Gestion des erreurs 400 (validation)
      else if (error.response?.status === 400) {
        setMessageType('error');
        const errors = error.response.data;
        const errorMessages = [];
        
        Object.keys(errors).forEach(key => {
          const fieldErrors = errors[key];
          if (Array.isArray(fieldErrors)) {
            fieldErrors.forEach(err => {
              errorMessages.push(`${key}: ${err}`);
            });
          } else {
            errorMessages.push(`${key}: ${fieldErrors}`);
          }
        });
        
        setMessage(`❌ ${errorMessages.join(', ')}`);
      } 
      // ✅ Gestion des erreurs 403 (permission)
      else if (error.response?.status === 403) {
        setMessageType('error');
        setMessage('⛔ Vous n\'avez pas la permission de créer une agence.');
      } 
      // ✅ Gestion des erreurs 500 (serveur)
      else if (error.response?.status === 500) {
        setMessageType('error');
        setMessage('⚠️ Erreur serveur. Veuillez réessayer plus tard.');
      } 
      // ✅ Autres erreurs
      else {
        setMessageType('error');
        setMessage('❌ Erreur: ' + (error.message || 'Erreur inconnue'));
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto mt-8 p-6 bg-base-100 rounded-lg shadow-lg">
      {/* ✅ Indicateur de connexion en haut du formulaire */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-base-200">
        <h2 className="text-2xl font-bold">
          {isEdit ? '✏️ Modifier l\'agence' : '🏗️ Créer une agence'}
        </h2>
        <div className={`badge ${isOnline ? 'badge-success' : 'badge-error'} gap-2`}>
          <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></span>
          {isOnline ? 'En ligne' : 'Hors ligne'}
        </div>
      </div>
      
      {/* ✅ Message d'alerte */}
      {message && (
        <div className={`alert-offline ${messageType} mb-4`}>
          <span className="text-lg">
            {messageType === 'success' ? '✅' : 
             messageType === 'warning' ? '💾' : 
             messageType === 'error' ? '❌' : 'ℹ️'}
          </span>
          <span>{message}</span>
        </div>
      )}
      
      {/* ✅ Avertissement hors ligne */}
      {!isOnline && (
        <div className="alert alert-warning mb-4 shadow-lg">
          <span className="text-lg">📡</span>
          <span>Vous êtes hors ligne. Les données seront sauvegardées localement et synchronisées automatiquement à la reconnexion.</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nom - colonne entière */}
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">
              Nom de l'agence <span className="text-error">*</span>
            </label>
            <input 
              name="nom" 
              value={formData.nom}
              onChange={handleChange}
              className="input input-bordered w-full" 
              placeholder="Ex: Agence de Dakar"
              required 
            />
          </div>
          
          {/* Type d'agence */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Type d'agence <span className="text-error">*</span>
            </label>
            <select 
              name="type_agence" 
              value={formData.type_agence}
              onChange={handleChange}
              className="select select-bordered w-full" 
              required
            >
              <option value="siege">🏢 Siège Social</option>
              <option value="regionale">📍 Agence Régionale</option>
              <option value="chantier">🏗️ Base Vie Chantier</option>
              <option value="logistique">📦 Dépôt Logistique</option>
            </select>
          </div>
          
          {/* Région */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Région <span className="text-error">*</span>
            </label>
            <select 
              name="region" 
              value={formData.region}
              onChange={handleChange}
              className="select select-bordered w-full" 
              required
            >
              <option value="nord">Nord</option>
              <option value="sud">Sud</option>
              <option value="est">Est</option>
              <option value="ouest">Ouest</option>
              <option value="centre">Centre</option>
              <option value="international">International</option>
            </select>
          </div>
          
          {/* Adresse - colonne entière */}
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">
              Adresse <span className="text-error">*</span>
            </label>
            <input 
              name="adresse" 
              value={formData.adresse}
              onChange={handleChange}
              className="input input-bordered w-full" 
              placeholder="Ex: 123 Avenue de la République"
              required 
            />
          </div>
          
          {/* Ville */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Ville <span className="text-error">*</span>
            </label>
            <input 
              name="ville" 
              value={formData.ville}
              onChange={handleChange}
              className="input input-bordered w-full" 
              placeholder="Ex: Dakar"
              required 
            />
          </div>
          
          {/* Code Postal */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Code Postal <span className="text-error">*</span>
            </label>
            <input 
              name="code_postal" 
              value={formData.code_postal}
              onChange={handleChange}
              className="input input-bordered w-full" 
              placeholder="Ex: 10000"
              required 
            />
          </div>
          
          {/* Téléphone */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Téléphone <span className="text-error">*</span>
            </label>
            <input 
              name="telephone" 
              value={formData.telephone}
              onChange={handleChange}
              className="input input-bordered w-full" 
              placeholder="Ex: +221 77 123 45 67"
              required 
            />
          </div>
          
          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Email <span className="text-error">*</span>
            </label>
            <input 
              name="email" 
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="input input-bordered w-full" 
              placeholder="Ex: contact@agence.com"
              required 
            />
          </div>
          
          {/* Pays */}
          <div>
            <label className="block text-sm font-medium mb-1">Pays</label>
            <input 
              name="pays" 
              value={formData.pays}
              onChange={handleChange}
              className="input input-bordered w-full" 
              placeholder="Ex: France"
            />
          </div>

          {/* Capacités BTP */}
          <div className="col-span-2">
            <div className="divider text-sm text-base-content/50">📊 Capacités BTP</div>
          </div>

          {/* Superficie */}
          <div>
            <label className="block text-sm font-medium mb-1">Superficie (m²)</label>
            <input 
              name="superficie_m2" 
              type="number"
              value={formData.superficie_m2}
              onChange={handleChange}
              className="input input-bordered w-full" 
              placeholder="Ex: 500"
            />
          </div>

          {/* Capacité stockage */}
          <div>
            <label className="block text-sm font-medium mb-1">Capacité stockage (m³)</label>
            <input 
              name="capacite_stockage" 
              type="number"
              step="0.01"
              value={formData.capacite_stockage}
              onChange={handleChange}
              className="input input-bordered w-full" 
              placeholder="Ex: 1000.50"
            />
          </div>

          {/* Nb engins max */}
          <div>
            <label className="block text-sm font-medium mb-1">Nb engins max</label>
            <input 
              name="nb_engins_max" 
              type="number"
              value={formData.nb_engins_max}
              onChange={handleChange}
              className="input input-bordered w-full" 
              placeholder="Ex: 10"
            />
          </div>

          {/* Nb employés max */}
          <div>
            <label className="block text-sm font-medium mb-1">Nb employés max</label>
            <input 
              name="nb_employes_max" 
              type="number"
              value={formData.nb_employes_max}
              onChange={handleChange}
              className="input input-bordered w-full" 
              placeholder="Ex: 50"
            />
          </div>
        </div>
        
        {/* ✅ Boutons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <button 
            type="submit" 
            className="btn btn-primary flex-1"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                {isEdit ? 'Modification en cours...' : 'Création en cours...'}
              </>
            ) : (
              isEdit ? '✏️ Modifier l\'agence' : '🏗️ Créer l\'agence'
            )}
          </button>
          
          <button 
            type="button" 
            className="btn btn-ghost"
            onClick={() => navigate('/agences')}
          >
            Annuler
          </button>
          
          {!isEdit && (
            <button 
              type="button" 
              className="btn btn-ghost btn-sm"
              onClick={resetForm}
              disabled={loading}
            >
              Réinitialiser
            </button>
          )}
        </div>
        
        {/* ✅ Information offline */}
        {!isOnline && (
          <div className="text-center text-xs text-base-content/40 mt-2">
            💾 Les données seront sauvegardées localement et synchronisées automatiquement
          </div>
        )}
      </form>
    </div>
  );
}

export default CreateAgence;