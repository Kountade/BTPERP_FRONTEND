// src/components/rh/EmployeForm.jsx
// Version EMPLOYÉ UNIQUEMENT - 10 champs - Redirection vers /employes

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  UserCircle, Mail, Phone, Building2, Save, X, RefreshCw,
  Wifi, WifiOff, AlertTriangle, HardHat, Award,
  CheckCircle, UserPlus
} from 'lucide-react';
import AxiosInstance from '../AxiosInstance';

// ✅ IMPORTER CacheService
import cacheService from '../../services/CacheService';

function EmployeForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingRelations, setLoadingRelations] = useState(true);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('info');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // ✅ DONNÉES POUR LES SELECTS (CLÉS ÉTRANGÈRES)
  const [agences, setAgences] = useState([]);
  const [services, setServices] = useState([]);
  const [postes, setPostes] = useState([]);
  const [users, setUsers] = useState([]);
  
  // ✅ FORMULAIRE EMPLOYÉ (10 champs UNIQUEMENT)
  const [formData, setFormData] = useState({
    matricule: '',
    nom: '',
    prenom: '',
    sexe: 'M',
    email: '',
    telephone: '',
    adresse: '',
    poste: '',
    service: '',
    user_id: '',
  });

  // Options
  const SEXE_CHOICES = [
    { value: 'M', label: 'Masculin' },
    { value: 'F', label: 'Féminin' }
  ];

  // Surveiller la connexion
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('📶 Connexion rétablie');
      loadRelations();
    };
    const handleOffline = () => {
      setIsOnline(false);
      console.log('📡 Mode hors ligne - Utilisation du cache');
      loadFromCache();
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // ✅ Charger depuis le cache uniquement
  const loadFromCache = async () => {
    console.log('📡 Chargement depuis le cache...');
    try {
      const cachedAgences = await cacheService.getCachedAgences();
      if (cachedAgences && cachedAgences.length > 0) {
        setAgences(cachedAgences);
      }

      const cachedServices = await cacheService.db.getItem('services_cache');
      if (cachedServices) {
        setServices(cachedServices);
      }

      const cachedPostes = await cacheService.db.getItem('postes_cache');
      if (cachedPostes) {
        setPostes(cachedPostes);
      }

      const cachedUsers = await cacheService.db.getItem('users_cache');
      if (cachedUsers) {
        setUsers(cachedUsers);
      }

    } catch (error) {
      console.error('❌ Erreur chargement cache:', error);
    }
  };

  // ✅ Charger toutes les données (clés étrangères)
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
      
      const [agencesRes, servicesRes, postesRes, usersRes] = await Promise.all([
        AxiosInstance.get('/agences/', { headers: { Authorization: `Token ${token}` } }),
        AxiosInstance.get('/services/', { headers: { Authorization: `Token ${token}` } }),
        AxiosInstance.get('/postes/', { headers: { Authorization: `Token ${token}` } }),
        AxiosInstance.get('/users/', { headers: { Authorization: `Token ${token}` } })
      ]);

      const agencesData = agencesRes.data || [];
      const servicesData = servicesRes.data || [];
      const postesData = postesRes.data || [];
      const usersData = usersRes.data || [];

      setAgences(agencesData);
      setServices(servicesData);
      setPostes(postesData);
      setUsers(usersData);

      await cacheService.cacheAgences(agencesData);
      await cacheService.db.setItem('services_cache', servicesData);
      await cacheService.db.setItem('postes_cache', postesData);
      await cacheService.db.setItem('users_cache', usersData);
      console.log('✅ Données sauvegardées en cache');

    } catch (error) {
      console.error('❌ Erreur chargement relations:', error);
      await loadFromCache();
    } finally {
      setLoadingRelations(false);
    }
  };

  // ✅ Charger l'employé si édition
  useEffect(() => {
    if (isEdit) {
      const loadEmploye = async () => {
        setLoadingData(true);
        try {
          const token = localStorage.getItem('Token');
          if (!token) {
            navigate('/login');
            return;
          }

          if (!navigator.onLine) {
            const cachedEmploye = await cacheService.getCachedUserById(id);
            if (cachedEmploye) {
              setFormData({
                matricule: cachedEmploye.matricule || '',
                nom: cachedEmploye.nom || '',
                prenom: cachedEmploye.prenom || '',
                sexe: cachedEmploye.sexe || 'M',
                email: cachedEmploye.email || '',
                telephone: cachedEmploye.telephone || '',
                adresse: cachedEmploye.adresse || '',
                poste: cachedEmploye.poste || '',
                service: cachedEmploye.service || '',
                user_id: cachedEmploye.user || '',
              });
              setLoadingData(false);
              return;
            }
          }

          // Charger depuis l'API
          const response = await AxiosInstance.get(`/employes/${id}/`, {
            headers: { Authorization: `Token ${token}` }
          });
          const data = response.data;
          setFormData({
            matricule: data.matricule || '',
            nom: data.nom || '',
            prenom: data.prenom || '',
            sexe: data.sexe || 'M',
            email: data.email || '',
            telephone: data.telephone || '',
            adresse: data.adresse || '',
            poste: data.poste || '',
            service: data.service || '',
            user_id: data.user || '',
          });

        } catch (error) {
          console.error('❌ Erreur chargement employé:', error);
          setMessageType('error');
          setMessage('Erreur lors du chargement');
        } finally {
          setLoadingData(false);
        }
      };
      loadEmploye();
    } else {
      setLoadingData(false);
    }
  }, [id, isEdit, navigate]);

  // ✅ Charger les relations au montage
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
      matricule: '',
      nom: '',
      prenom: '',
      sexe: 'M',
      email: '',
      telephone: '',
      adresse: '',
      poste: '',
      service: '',
      user_id: '',
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

      // ✅ EMPLOYÉ UNIQUEMENT (10 champs)
      const employeData = {
        matricule: formData.matricule,
        nom: formData.nom,
        prenom: formData.prenom,
        sexe: formData.sexe,
        email: formData.email,
        telephone: formData.telephone,
        adresse: formData.adresse,
        poste: formData.poste ? parseInt(formData.poste) : null,
        service: formData.service ? parseInt(formData.service) : null,
        user_id: formData.user_id ? parseInt(formData.user_id) : null,
      };

      let response;
      if (isEdit) {
        response = await AxiosInstance.put(`/employes/${id}/`, employeData, {
          headers: { Authorization: `Token ${token}` }
        });
      } else {
        response = await AxiosInstance.post('/employes/', employeData, {
          headers: { Authorization: `Token ${token}` }
        });
      }

      setMessageType('success');
      setMessage(isEdit ? '✅ Employé modifié avec succès' : '✅ Employé créé avec succès');
      
      // ✅ REDIRECTION VERS /employes (création ET édition)
      if (!isEdit) {
        resetForm();
      }
      
      // ✅ Redirection vers la liste des employés après 1.5s
      setTimeout(() => navigate('/employes'), 1500);

    } catch (error) {
      console.error('❌ Erreur:', error);

      // ✅ Sauvegarde OFFLINE via CacheService
      if (error.message === 'Network Error' || error.code === 'ERR_NETWORK' || !navigator.onLine) {
        try {
          await cacheService.addPendingOperation({
            type: isEdit ? 'UPDATE_EMPLOYE' : 'CREATE_EMPLOYE',
            data: formData,
            userId: isEdit ? id : undefined
          });
          setMessageType('warning');
          setMessage('💾 Sauvegardé localement - Sync auto à la reconnexion');
          if (!isEdit) resetForm();
          // ✅ Redirection vers /employes même en mode offline
          setTimeout(() => navigate('/employes'), 2000);
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

  if (loadingData || loadingRelations) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary"></div>
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
    <div className="h-[calc(100vh-88px)] overflow-hidden bg-base-200">
      <div className="h-full w-full bg-base-100 p-6 overflow-y-auto">
        
        {/* En-tête */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-base-200 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <UserCircle className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold">
              {isEdit ? 'Modifier l\'employé' : 'Nouvel employé'}
            </h2>
            <span className="badge badge-ghost badge-sm">10 champs</span>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            <div className={`badge ${isOnline ? 'badge-success' : 'badge-error'} gap-1.5 px-3 py-2.5`}>
              {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              {isOnline ? 'En ligne' : 'Hors ligne'}
            </div>
            <button 
              type="button" 
              className="btn btn-ghost btn-sm gap-1"
              onClick={() => navigate('/employes')}
            >
              <X className="w-4 h-4" />
              Fermer
            </button>
          </div>
        </div>

        {/* Message */}
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

        {/* Avertissement hors ligne */}
        {!isOnline && (
          <div className="alert alert-warning mb-3 py-2 shadow-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>📡 Mode hors ligne - Données chargées depuis le cache</span>
          </div>
        )}

        {/* ✅ FORMULAIRE EMPLOYÉ - 10 CHAMPS UNIQUEMENT */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="bg-base-200 rounded-xl p-4 border border-base-300">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-base-300">
              <UserCircle className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-base-content">Identité & Contact</h3>
              <span className="badge badge-primary badge-xs ml-2">10 champs</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              
              {/* Matricule */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  <Award className="w-4 h-4 inline mr-1.5" />
                  Matricule <span className="text-error">*</span>
                </label>
                <input 
                  name="matricule" 
                  value={formData.matricule}
                  onChange={handleChange}
                  className="input input-bordered w-full" 
                  placeholder="Ex: EMP-001"
                  required 
                />
              </div>

              {/* Nom */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nom <span className="text-error">*</span>
                </label>
                <input 
                  name="nom" 
                  value={formData.nom}
                  onChange={handleChange}
                  className="input input-bordered w-full" 
                  placeholder="Nom"
                  required 
                />
              </div>

              {/* Prénom */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Prénom <span className="text-error">*</span>
                </label>
                <input 
                  name="prenom" 
                  value={formData.prenom}
                  onChange={handleChange}
                  className="input input-bordered w-full" 
                  placeholder="Prénom"
                  required 
                />
              </div>

              {/* Sexe */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Sexe <span className="text-error">*</span>
                </label>
                <select 
                  name="sexe" 
                  value={formData.sexe}
                  onChange={handleChange}
                  className="select select-bordered w-full"
                  required
                >
                  {SEXE_CHOICES.map(sex => (
                    <option key={sex.value} value={sex.value}>{sex.label}</option>
                  ))}
                </select>
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
                  placeholder="email@exemple.com"
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
                  placeholder="+221 77 123 45 67"
                  required 
                />
              </div>

              {/* Adresse - colonne entière */}
              <div className="col-span-full">
                <label className="block text-sm font-medium mb-1">
                  <Building2 className="w-4 h-4 inline mr-1.5" />
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

              {/* Poste */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  <HardHat className="w-4 h-4 inline mr-1.5" />
                  Poste <span className="text-error">*</span>
                </label>
                <select 
                  name="poste" 
                  value={formData.poste}
                  onChange={handleChange}
                  className="select select-bordered w-full"
                  required
                >
                  <option value="">Sélectionner un poste</option>
                  {postes.map(p => (
                    <option key={p.id} value={p.id}>{p.nom} ({p.code})</option>
                  ))}
                </select>
              </div>

              {/* Service */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  <Building2 className="w-4 h-4 inline mr-1.5" />
                  Service <span className="text-error">*</span>
                </label>
                <select 
                  name="service" 
                  value={formData.service}
                  onChange={handleChange}
                  className="select select-bordered w-full"
                  required
                >
                  <option value="">Sélectionner un service</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>{s.nom}</option>
                  ))}
                </select>
              </div>

              {/* Utilisateur associé */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  <UserPlus className="w-4 h-4 inline mr-1.5" />
                  Utilisateur associé
                </label>
                <select 
                  name="user_id" 
                  value={formData.user_id}
                  onChange={handleChange}
                  className="select select-bordered w-full"
                >
                  <option value="">Aucun utilisateur</option>
                  {users.map(u => {
                    const fullName = `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email;
                    return (
                      <option key={u.id} value={u.id}>{fullName}</option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>
          
          {/* ✅ Boutons */}
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
              onClick={() => navigate('/employes')}
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
              💾 Sauvegarde locale - Synchronisation automatique à la reconnexion
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default EmployeForm;