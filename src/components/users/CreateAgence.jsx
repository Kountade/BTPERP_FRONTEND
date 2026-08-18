// src/components/CreateAgence.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Ruler, 
  Package, 
  Truck, 
  Users, 
  Save, 
  X, 
  RefreshCw,
  Wifi,
  WifiOff,
  AlertTriangle,
  Warehouse,
  Home,
  Map,
  HardHat
} from 'lucide-react';
import AxiosInstance from '../AxiosInstance';

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
          setMessage('Erreur lors du chargement');
        }
      };
      loadAgence();
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

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
      
      if (response.data && response.data.offline) {
        setMessageType('warning');
        setMessage('Sauvegardé localement - Sync auto à la reconnexion');
        if (!isEdit) resetForm();
      } else {
        setMessageType('success');
        setMessage(isEdit ? 'Agence modifiée avec succès' : 'Agence créée avec succès');
        if (!isEdit) resetForm();
        setTimeout(() => navigate('/agences'), 1500);
      }
      
    } catch (error) {
      console.error('Erreur:', error);
      
      if (error.message === 'Network Error' || error.code === 'ERR_NETWORK' || !navigator.onLine) {
        setMessageType('warning');
        setMessage('Sauvegardé localement - Sync auto à la reconnexion');
        if (!isEdit) resetForm();
        setLoading(false);
        return;
      }
      
      if (error.response?.status === 401) {
        setMessageType('error');
        setMessage('Session expirée');
        setTimeout(() => navigate('/login'), 1500);
      } else if (error.response?.status === 400) {
        setMessageType('error');
        const errors = error.response.data;
        const messages = Object.keys(errors).flatMap(key => 
          Array.isArray(errors[key]) ? errors[key].map(e => `${key}: ${e}`) : `${key}: ${errors[key]}`
        );
        setMessage(messages.join(', '));
      } else if (error.response?.status === 403) {
        setMessageType('error');
        setMessage('Permission refusée');
      } else if (error.response?.status === 500) {
        setMessageType('error');
        setMessage('Erreur serveur');
      } else {
        setMessageType('error');
        setMessage(error.message || 'Erreur inconnue');
      }
    }
    setLoading(false);
  };

  return (
    <div className="h-[calc(100vh-88px)] overflow-hidden bg-base-200">
      <div className="h-full w-full bg-base-100 p-6 overflow-y-auto">
        
        {/* En-tête */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-base-200 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold">
              {isEdit ? 'Modifier l\'agence' : 'Nouvelle agence'}
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
              onClick={() => navigate('/agences')}
            >
              <X className="w-4 h-4" />
              Fermer
            </button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`alert-offline ${messageType} mb-3 py-2 px-3`}>
            {message}
          </div>
        )}

        {/* Avertissement hors ligne */}
        {!isOnline && (
          <div className="alert alert-warning mb-3 py-2 shadow-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>Hors ligne - Sauvegarde locale automatique</span>
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            
            {/* Nom */}
            <div className="lg:col-span-1">
              <label className="block text-sm font-medium mb-1">
                <Building2 className="w-4 h-4 inline mr-1.5" />
                Nom <span className="text-error">*</span>
              </label>
              <input 
                name="nom" 
                value={formData.nom}
                onChange={handleChange}
                className="input input-bordered w-full" 
                placeholder="Nom de l'agence"
                required 
              />
            </div>
            
            {/* Type */}
            <div>
              <label className="block text-sm font-medium mb-1">
                <Home className="w-4 h-4 inline mr-1.5" />
                Type <span className="text-error">*</span>
              </label>
              <select 
                name="type_agence" 
                value={formData.type_agence}
                onChange={handleChange}
                className="select select-bordered w-full" 
                required
              >
                <option value="siege">Siège Social</option>
                <option value="regionale">Agence Régionale</option>
                <option value="chantier">Base Vie Chantier</option>
                <option value="logistique">Dépôt Logistique</option>
              </select>
            </div>
            
            {/* Région */}
            <div>
              <label className="block text-sm font-medium mb-1">
                <Map className="w-4 h-4 inline mr-1.5" />
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
            
            {/* Adresse */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium mb-1">
                <MapPin className="w-4 h-4 inline mr-1.5" />
                Adresse <span className="text-error">*</span>
              </label>
              <input 
                name="adresse" 
                value={formData.adresse}
                onChange={handleChange}
                className="input input-bordered w-full" 
                placeholder="Adresse complète"
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
                placeholder="Ville"
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
                placeholder="Code postal"
                required 
              />
            </div>
            
            {/* Téléphone */}
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
                placeholder="Téléphone"
                required 
              />
            </div>
            
            {/* Email */}
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
                placeholder="Email"
                required 
              />
            </div>
            
            {/* Pays */}
            <div>
              <label className="block text-sm font-medium mb-1">
                <Globe className="w-4 h-4 inline mr-1.5" />
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

            {/* Séparateur */}
            <div className="col-span-full">
              <div className="divider text-sm text-base-content/40 my-1">Capacités BTP</div>
            </div>

            {/* Superficie */}
            <div>
              <label className="block text-sm font-medium mb-1">
                <Ruler className="w-4 h-4 inline mr-1.5" />
                Superficie (m²)
              </label>
              <input 
                name="superficie_m2" 
                type="number"
                value={formData.superficie_m2}
                onChange={handleChange}
                className="input input-bordered w-full" 
                placeholder="Superficie en m²"
              />
            </div>

            {/* Capacité stockage */}
            <div>
              <label className="block text-sm font-medium mb-1">
                <Warehouse className="w-4 h-4 inline mr-1.5" />
                Stockage (m³)
              </label>
              <input 
                name="capacite_stockage" 
                type="number"
                step="0.01"
                value={formData.capacite_stockage}
                onChange={handleChange}
                className="input input-bordered w-full" 
                placeholder="Capacité en m³"
              />
            </div>

            {/* Nb engins max */}
            <div>
              <label className="block text-sm font-medium mb-1">
                <Truck className="w-4 h-4 inline mr-1.5" />
                Engins max
              </label>
              <input 
                name="nb_engins_max" 
                type="number"
                value={formData.nb_engins_max}
                onChange={handleChange}
                className="input input-bordered w-full" 
                placeholder="Nombre d'engins max"
              />
            </div>

            {/* Nb employés max */}
            <div>
              <label className="block text-sm font-medium mb-1">
                <Users className="w-4 h-4 inline mr-1.5" />
                Employés max
              </label>
              <input 
                name="nb_employes_max" 
                type="number"
                value={formData.nb_employes_max}
                onChange={handleChange}
                className="input input-bordered w-full" 
                placeholder="Nombre d'employés max"
              />
            </div>
          </div>
          
          {/* Boutons */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-base-200">
            <button 
              type="submit" 
              className="btn btn-primary flex-1 min-w-[120px] gap-2"
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <Save className="w-4 h-4" />
              )}
              {loading ? 'En cours...' : (isEdit ? 'Modifier' : 'Créer')}
            </button>
            
            <button 
              type="button" 
              className="btn btn-ghost gap-2"
              onClick={() => navigate('/agences')}
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
          
          {/* Info offline */}
          {!isOnline && (
            <div className="text-center text-xs text-base-content/40 mt-1">
              Sauvegarde locale - Synchronisation automatique à la reconnexion
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default CreateAgence;