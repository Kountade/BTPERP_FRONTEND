// src/components/users/UtilisateurForm.jsx - VERSION SIMPLIFIÉE
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  UserCircle, Mail, Phone, Building2, Shield, Save, X, RefreshCw,
  Wifi, WifiOff, AlertTriangle, Users, HardHat, Award, Calendar, 
  MapPin, CheckCircle, Eye, EyeOff, Key
} from 'lucide-react';
import AxiosInstance from '../AxiosInstance';

// ✅ IMPORTER CacheService
import cacheService from '../../services/CacheService';

function UtilisateurForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('info');
  const [agences, setAgences] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    city: '',
    country: 'France',
    postal_code: '',
    role_global: 'autre',
    agence_id: '',
    role_agence: '',
    employee_id: '',
    hire_date: '',
    contract_type: '',
    specialite_principale: '',
    is_active: true
  });

  const ROLE_AGENCE_CHOICES = [
    { value: 'directeur_agence', label: 'Directeur Agence' },
    { value: 'chef_chantier', label: 'Chef Chantier' },
    { value: 'conducteur_travaux', label: 'Conducteur Travaux' },
    { value: 'technicien', label: 'Technicien' },
    { value: 'gestionnaire_stock', label: 'Gestionnaire Stock' },
    { value: 'commercial_btp', label: 'Commercial BTP' },
    { value: 'comptable_btp', label: 'Comptable BTP' },
    { value: 'responsable_hse', label: 'Responsable HSE' },
    { value: 'responsable_rh', label: 'Responsable RH' },
    { value: 'acheteur', label: 'Acheteur' },
    { value: 'securite', label: 'Sécurité' },
    { value: 'responsable_qualite', label: 'Responsable Qualité' },
    { value: 'assistant_chantier', label: 'Assistant Chantier' }
  ];

  const CONTRACT_TYPES = [
    { value: 'cdi', label: 'CDI' },
    { value: 'cdd', label: 'CDD' },
    { value: 'interim', label: 'Intérim' },
    { value: 'apprenti', label: 'Apprenti' },
    { value: 'stagiaire', label: 'Stagiaire' }
  ];

  const SPECIALITE_CHOICES = [
    { value: 'gros_oeuvre', label: 'Gros Œuvre' },
    { value: 'second_oeuvre', label: 'Second Œuvre' },
    { value: 'tp', label: 'Travaux Publics' },
    { value: 'genie_civil', label: 'Génie Civil' },
    { value: 'charpente', label: 'Charpente' },
    { value: 'couverture', label: 'Couverture' },
    { value: 'plomberie', label: 'Plomberie' },
    { value: 'electricite', label: 'Électricité' },
    { value: 'climatisation', label: 'Climatisation' },
    { value: 'peinture', label: 'Peinture' },
    { value: 'menuiserie', label: 'Menuiserie' }
  ];

  // ✅ Surveiller la connexion
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

  // ✅ Charger les agences
  useEffect(() => {
    const loadAgences = async () => {
      try {
        // 1. Essayer le cache d'abord
        const cached = await cacheService.getCachedAgences();
        if (cached && cached.length > 0) {
          console.log('💾 Agences depuis le cache:', cached.length);
          setAgences(cached);
          return;
        }

        // 2. Si en ligne, charger depuis l'API
        if (navigator.onLine) {
          const token = localStorage.getItem('Token');
          if (!token) return;
          
          const response = await AxiosInstance.get('/agences/', {
            headers: { Authorization: `Token ${token}` }
          });
          
          const data = response.data || [];
          setAgences(data);
          await cacheService.cacheAgences(data);
          console.log('✅ Agences depuis l\'API:', data.length);
        }
      } catch (error) {
        console.error('Erreur chargement agences:', error);
        // En cas d'erreur, essayer le cache
        const cached = await cacheService.getCachedAgences();
        if (cached && cached.length > 0) {
          setAgences(cached);
        }
      }
    };
    loadAgences();
  }, []);

  // ✅ Charger l'utilisateur si édition
  useEffect(() => {
    if (isEdit) {
      const loadUser = async () => {
        setLoadingData(true);
        try {
          const token = localStorage.getItem('Token');
          if (!token) {
            navigate('/login');
            return;
          }
          const response = await AxiosInstance.get(`/users/${id}/`, {
            headers: { Authorization: `Token ${token}` }
          });
          const user = response.data;
          setFormData({
            email: user.email || '',
            password: '',
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            phone: user.phone || '',
            address: user.address || '',
            city: user.city || '',
            country: user.country || 'France',
            postal_code: user.postal_code || '',
            role_global: user.role_global || 'autre',
            agence_id: user.roles_agence?.[0]?.agence_id || '',
            role_agence: user.roles_agence?.[0]?.role || '',
            employee_id: user.employee_id || '',
            hire_date: user.hire_date || '',
            contract_type: user.contract_type || '',
            specialite_principale: user.specialite_principale || '',
            is_active: user.is_active !== undefined ? user.is_active : true
          });
        } catch (error) {
          console.error('Erreur chargement:', error);
          setMessageType('error');
          setMessage('Erreur lors du chargement');
        } finally {
          setLoadingData(false);
        }
      };
      loadUser();
    } else {
      setLoadingData(false);
    }
  }, [id, isEdit, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      phone: '',
      address: '',
      city: '',
      country: 'France',
      postal_code: '',
      role_global: 'autre',
      agence_id: '',
      role_agence: '',
      employee_id: '',
      hire_date: '',
      contract_type: '',
      specialite_principale: '',
      is_active: true
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

      const dataToSend = { ...formData };
      if (!dataToSend.password) {
        delete dataToSend.password;
      }

      let response;
      if (isEdit) {
        response = await AxiosInstance.put(`/users/${id}/`, dataToSend, {
          headers: { Authorization: `Token ${token}` }
        });
      } else {
        response = await AxiosInstance.post('/register/', dataToSend, {
          headers: { Authorization: `Token ${token}` }
        });
      }

      setMessageType('success');
      setMessage(isEdit ? '✅ Utilisateur modifié avec succès' : '✅ Utilisateur créé avec succès');
      if (!isEdit) resetForm();
      setTimeout(() => navigate('/utilisateurs'), 1500);

    } catch (error) {
      console.error('Erreur:', error);

      // ✅ Gestion hors ligne
      if (!navigator.onLine || error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
        try {
          await cacheService.addPendingOperation({
            type: isEdit ? 'UPDATE_USER' : 'CREATE_USER',
            data: formData,
            userId: isEdit ? id : undefined
          });
          
          setMessageType('warning');
          setMessage('💾 Utilisateur sauvegardé localement - Synchronisation automatique à la reconnexion');
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
      } else if (error.response?.status === 403) {
        setMessageType('error');
        setMessage('⛔ Permission refusée');
      } else {
        setMessageType('error');
        setMessage(`❌ ${error.message || 'Erreur inconnue'}`);
      }
    }
    setLoading(false);
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="mt-4 text-base-content/60">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-88px)] overflow-hidden bg-base-200">
      <div className="h-full w-full bg-base-100 p-6 overflow-y-auto">
        
        {/* En-tête */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-base-200 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <UserCircle className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold">
              {isEdit ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
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
              onClick={() => navigate('/utilisateurs')}
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
            <span>Hors ligne - Les données seront synchronisées automatiquement</span>
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            
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
                disabled={isEdit}
              />
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-sm font-medium mb-1">
                <Key className="w-4 h-4 inline mr-1.5" />
                Mot de passe {!isEdit && <span className="text-error">*</span>}
              </label>
              <div className="relative">
                <input 
                  name="password" 
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  className="input input-bordered w-full pr-10" 
                  placeholder={isEdit ? 'Laisser vide' : 'Mot de passe'}
                  required={!isEdit}
                  minLength={6}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Statut */}
            <div>
              <label className="block text-sm font-medium mb-1">
                <CheckCircle className="w-4 h-4 inline mr-1.5" />
                Statut
              </label>
              <select 
                name="is_active" 
                value={formData.is_active ? 'active' : 'inactive'}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.value === 'active' }))}
                className="select select-bordered w-full"
              >
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
              </select>
            </div>

            {/* Prénom */}
            <div>
              <label className="block text-sm font-medium mb-1">Prénom</label>
              <input 
                name="first_name" 
                value={formData.first_name}
                onChange={handleChange}
                className="input input-bordered w-full" 
                placeholder="Prénom"
              />
            </div>

            {/* Nom */}
            <div>
              <label className="block text-sm font-medium mb-1">Nom</label>
              <input 
                name="last_name" 
                value={formData.last_name}
                onChange={handleChange}
                className="input input-bordered w-full" 
                placeholder="Nom"
              />
            </div>

            {/* Téléphone */}
            <div>
              <label className="block text-sm font-medium mb-1">
                <Phone className="w-4 h-4 inline mr-1.5" />
                Téléphone
              </label>
              <input 
                name="phone" 
                value={formData.phone}
                onChange={handleChange}
                className="input input-bordered w-full" 
                placeholder="Téléphone"
              />
            </div>

            {/* Rôle Global */}
            <div>
              <label className="block text-sm font-medium mb-1">
                <Shield className="w-4 h-4 inline mr-1.5" />
                Rôle Global
              </label>
              <select 
                name="role_global" 
                value={formData.role_global}
                onChange={handleChange}
                className="select select-bordered w-full"
              >
                <option value="autre">Autre</option>
                <option value="pdg">PDG</option>
              </select>
            </div>

            {/* Agence */}
            <div>
              <label className="block text-sm font-medium mb-1">
                <Building2 className="w-4 h-4 inline mr-1.5" />
                Agence
              </label>
              <select 
                name="agence_id" 
                value={formData.agence_id}
                onChange={handleChange}
                className="select select-bordered w-full"
                disabled={formData.role_global === 'pdg'}
              >
                <option value="">Sélectionner une agence</option>
                {agences.map(agence => (
                  <option key={agence.id} value={agence.id}>
                    {agence.nom} ({agence.ville})
                  </option>
                ))}
              </select>
            </div>

            {/* Rôle Agence */}
            <div>
              <label className="block text-sm font-medium mb-1">
                <Users className="w-4 h-4 inline mr-1.5" />
                Rôle dans l'agence
              </label>
              <select 
                name="role_agence" 
                value={formData.role_agence}
                onChange={handleChange}
                className="select select-bordered w-full"
                disabled={formData.role_global === 'pdg' || !formData.agence_id}
              >
                <option value="">Sélectionner</option>
                {ROLE_AGENCE_CHOICES.map(role => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Matricule */}
            <div>
              <label className="block text-sm font-medium mb-1">
                <Award className="w-4 h-4 inline mr-1.5" />
                Matricule
              </label>
              <input 
                name="employee_id" 
                value={formData.employee_id}
                onChange={handleChange}
                className="input input-bordered w-full" 
                placeholder="Matricule"
              />
            </div>

            {/* Type de contrat */}
            <div>
              <label className="block text-sm font-medium mb-1">Contrat</label>
              <select 
                name="contract_type" 
                value={formData.contract_type}
                onChange={handleChange}
                className="select select-bordered w-full"
              >
                <option value="">Sélectionner</option>
                {CONTRACT_TYPES.map(contract => (
                  <option key={contract.value} value={contract.value}>
                    {contract.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date d'embauche */}
            <div>
              <label className="block text-sm font-medium mb-1">
                <Calendar className="w-4 h-4 inline mr-1.5" />
                Date d'embauche
              </label>
              <input 
                name="hire_date" 
                type="date"
                value={formData.hire_date}
                onChange={handleChange}
                className="input input-bordered w-full" 
              />
            </div>

            {/* Spécialité */}
            <div>
              <label className="block text-sm font-medium mb-1">
                <HardHat className="w-4 h-4 inline mr-1.5" />
                Spécialité
              </label>
              <select 
                name="specialite_principale" 
                value={formData.specialite_principale}
                onChange={handleChange}
                className="select select-bordered w-full"
              >
                <option value="">Sélectionner</option>
                {SPECIALITE_CHOICES.map(spec => (
                  <option key={spec.value} value={spec.value}>
                    {spec.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Adresse */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                <MapPin className="w-4 h-4 inline mr-1.5" />
                Adresse
              </label>
              <input 
                name="address" 
                value={formData.address}
                onChange={handleChange}
                className="input input-bordered w-full" 
                placeholder="Adresse"
              />
            </div>

            {/* Ville */}
            <div>
              <label className="block text-sm font-medium mb-1">Ville</label>
              <input 
                name="city" 
                value={formData.city}
                onChange={handleChange}
                className="input input-bordered w-full" 
                placeholder="Ville"
              />
            </div>

            {/* Code Postal */}
            <div>
              <label className="block text-sm font-medium mb-1">Code Postal</label>
              <input 
                name="postal_code" 
                value={formData.postal_code}
                onChange={handleChange}
                className="input input-bordered w-full" 
                placeholder="Code Postal"
              />
            </div>

            {/* Pays */}
            <div>
              <label className="block text-sm font-medium mb-1">Pays</label>
              <input 
                name="country" 
                value={formData.country}
                onChange={handleChange}
                className="input input-bordered w-full" 
                placeholder="Pays"
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
              onClick={() => navigate('/utilisateurs')}
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
        </form>
      </div>
    </div>
  );
}

export default UtilisateurForm;