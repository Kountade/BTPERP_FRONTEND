// src/components/rh/EmployeForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  UserCircle, Mail, Phone, Building2, Shield, Save, X, RefreshCw,
  Wifi, WifiOff, AlertTriangle, Users, HardHat, Award, Calendar, 
  MapPin, CheckCircle, Eye, EyeOff, Key, Briefcase, DollarSign,
  UserPlus
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
  
  const [formData, setFormData] = useState({
    matricule: '',
    nom: '',
    prenom: '',
    sexe: 'M',
    date_naissance: '',
    lieu_naissance: '',
    nationalite: 'Française',
    email: '',
    telephone: '',
    adresse: '',
    code_postal: '',
    ville: '',
    situation: 'cdi',
    poste: '',
    service: '',
    date_embauche: '',
    date_fin_contrat: '',
    date_essai_fin: '',
    salaire_base: '',
    taux_horaire: '',
    prime_panier: '0',
    indemnite_km: '0',
    prime_anciennete: '0',
    numero_securite_sociale: '',
    num_permis: '',
    permis_valide: true,
    agence: '',
    user_id: '',
    actif: true,
    disponible: true
  });

  // Options
  const SEXE_CHOICES = [
    { value: 'M', label: 'Masculin' },
    { value: 'F', label: 'Féminin' }
  ];

  const SITUATION_CHOICES = [
    { value: 'cdi', label: 'CDI' },
    { value: 'cdd', label: 'CDD' },
    { value: 'interim', label: 'Intérim' },
    { value: 'apprenti', label: 'Apprenti' },
    { value: 'stagiaire', label: 'Stagiaire' },
    { value: 'auto_entrepreneur', label: 'Auto-Entrepreneur' }
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
      // Agences
      const cachedAgences = await cacheService.getCachedAgences();
      if (cachedAgences && cachedAgences.length > 0) {
        setAgences(cachedAgences);
        console.log('💾 Agences depuis le cache:', cachedAgences.length);
      }

      // Services
      const cachedServices = await cacheService.db.getItem('services_cache');
      if (cachedServices) {
        setServices(cachedServices);
        console.log('💾 Services depuis le cache:', cachedServices.length);
      }

      // Postes
      const cachedPostes = await cacheService.db.getItem('postes_cache');
      if (cachedPostes) {
        setPostes(cachedPostes);
        console.log('💾 Postes depuis le cache:', cachedPostes.length);
      }

      // Users
      const cachedUsers = await cacheService.db.getItem('users_cache');
      if (cachedUsers) {
        setUsers(cachedUsers);
        console.log('💾 Utilisateurs depuis le cache:', cachedUsers.length);
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

      // 1. Si hors ligne, charger depuis le cache
      if (!navigator.onLine) {
        await loadFromCache();
        setLoadingRelations(false);
        return;
      }

      // 2. Si en ligne, charger depuis l'API
      console.log('📡 Chargement depuis l\'API...');
      
      const [agencesRes, servicesRes, postesRes, usersRes] = await Promise.all([
        AxiosInstance.get('/agences/', {
          headers: { Authorization: `Token ${token}` }
        }),
        AxiosInstance.get('/services/', {
          headers: { Authorization: `Token ${token}` }
        }),
        AxiosInstance.get('/postes/', {
          headers: { Authorization: `Token ${token}` }
        }),
        AxiosInstance.get('/users/', {
          headers: { Authorization: `Token ${token}` }
        })
      ]);

      const agencesData = agencesRes.data || [];
      const servicesData = servicesRes.data || [];
      const postesData = postesRes.data || [];
      const usersData = usersRes.data || [];

      setAgences(agencesData);
      setServices(servicesData);
      setPostes(postesData);
      setUsers(usersData);

      // Sauvegarder en cache pour offline
      await cacheService.cacheAgences(agencesData);
      await cacheService.db.setItem('services_cache', servicesData);
      await cacheService.db.setItem('postes_cache', postesData);
      await cacheService.db.setItem('users_cache', usersData);
      console.log('✅ Données sauvegardées en cache');

    } catch (error) {
      console.error('❌ Erreur chargement relations:', error);
      // En cas d'erreur, essayer le cache
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

          // Si hors ligne, essayer le cache
          if (!navigator.onLine) {
            const cachedEmploye = await cacheService.getCachedUserById(id);
            if (cachedEmploye) {
              const data = cachedEmploye;
              setFormData({
                matricule: data.matricule || '',
                nom: data.nom || '',
                prenom: data.prenom || '',
                sexe: data.sexe || 'M',
                date_naissance: data.date_naissance || '',
                lieu_naissance: data.lieu_naissance || '',
                nationalite: data.nationalite || 'Française',
                email: data.email || '',
                telephone: data.telephone || '',
                adresse: data.adresse || '',
                code_postal: data.code_postal || '',
                ville: data.ville || '',
                situation: data.situation || 'cdi',
                poste: data.poste || '',
                service: data.service || '',
                date_embauche: data.date_embauche || '',
                date_fin_contrat: data.date_fin_contrat || '',
                date_essai_fin: data.date_essai_fin || '',
                salaire_base: data.salaire_base || '',
                taux_horaire: data.taux_horaire || '',
                prime_panier: data.prime_panier || '0',
                indemnite_km: data.indemnite_km || '0',
                prime_anciennete: data.prime_anciennete || '0',
                numero_securite_sociale: data.numero_securite_sociale || '',
                num_permis: data.num_permis || '',
                permis_valide: data.permis_valide !== undefined ? data.permis_valide : true,
                agence: data.agence || '',
                user_id: data.user || '',
                actif: data.actif !== undefined ? data.actif : true,
                disponible: data.disponible !== undefined ? data.disponible : true
              });
              setLoadingData(false);
              return;
            }
          }

          // Si en ligne, charger depuis l'API
          const response = await AxiosInstance.get(`/employes/${id}/`, {
            headers: { Authorization: `Token ${token}` }
          });
          const data = response.data;
          setFormData({
            matricule: data.matricule || '',
            nom: data.nom || '',
            prenom: data.prenom || '',
            sexe: data.sexe || 'M',
            date_naissance: data.date_naissance || '',
            lieu_naissance: data.lieu_naissance || '',
            nationalite: data.nationalite || 'Française',
            email: data.email || '',
            telephone: data.telephone || '',
            adresse: data.adresse || '',
            code_postal: data.code_postal || '',
            ville: data.ville || '',
            situation: data.situation || 'cdi',
            poste: data.poste || '',
            service: data.service || '',
            date_embauche: data.date_embauche || '',
            date_fin_contrat: data.date_fin_contrat || '',
            date_essai_fin: data.date_essai_fin || '',
            salaire_base: data.salaire_base || '',
            taux_horaire: data.taux_horaire || '',
            prime_panier: data.prime_panier || '0',
            indemnite_km: data.indemnite_km || '0',
            prime_anciennete: data.prime_anciennete || '0',
            numero_securite_sociale: data.numero_securite_sociale || '',
            num_permis: data.num_permis || '',
            permis_valide: data.permis_valide !== undefined ? data.permis_valide : true,
            agence: data.agence || '',
            user_id: data.user || '',
            actif: data.actif !== undefined ? data.actif : true,
            disponible: data.disponible !== undefined ? data.disponible : true
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
      date_naissance: '',
      lieu_naissance: '',
      nationalite: 'Française',
      email: '',
      telephone: '',
      adresse: '',
      code_postal: '',
      ville: '',
      situation: 'cdi',
      poste: '',
      service: '',
      date_embauche: '',
      date_fin_contrat: '',
      date_essai_fin: '',
      salaire_base: '',
      taux_horaire: '',
      prime_panier: '0',
      indemnite_km: '0',
      prime_anciennete: '0',
      numero_securite_sociale: '',
      num_permis: '',
      permis_valide: true,
      agence: '',
      user_id: '',
      actif: true,
      disponible: true
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

      const dataToSend = {
        ...formData,
        salaire_base: formData.salaire_base ? parseFloat(formData.salaire_base) : 0,
        taux_horaire: formData.taux_horaire ? parseFloat(formData.taux_horaire) : 0,
        prime_panier: formData.prime_panier ? parseFloat(formData.prime_panier) : 0,
        indemnite_km: formData.indemnite_km ? parseFloat(formData.indemnite_km) : 0,
        prime_anciennete: formData.prime_anciennete ? parseFloat(formData.prime_anciennete) : 0,
        user_id: formData.user_id ? parseInt(formData.user_id) : null
      };

      let response;
      if (isEdit) {
        response = await AxiosInstance.put(`/employes/${id}/`, dataToSend, {
          headers: { Authorization: `Token ${token}` }
        });
      } else {
        response = await AxiosInstance.post('/employes/', dataToSend, {
          headers: { Authorization: `Token ${token}` }
        });
      }

      if (response.data && response.data.offline) {
        setMessageType('warning');
        setMessage('💾 Sauvegardé localement - Sync auto à la reconnexion');
        if (!isEdit) resetForm();
      } else {
        setMessageType('success');
        setMessage(isEdit ? '✅ Employé modifié avec succès' : '✅ Employé créé avec succès');
        if (!isEdit) resetForm();
        setTimeout(() => navigate('/employes'), 1500);
      }

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

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-3">
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

            {/* Date de naissance */}
            <div>
              <label className="block text-sm font-medium mb-1">
                <Calendar className="w-4 h-4 inline mr-1.5" />
                Date de naissance <span className="text-error">*</span>
              </label>
              <input 
                name="date_naissance" 
                type="date"
                value={formData.date_naissance}
                onChange={handleChange}
                className="input input-bordered w-full"
                required 
              />
            </div>

            {/* Lieu de naissance */}
            <div>
              <label className="block text-sm font-medium mb-1">
                <MapPin className="w-4 h-4 inline mr-1.5" />
                Lieu de naissance
              </label>
              <input 
                name="lieu_naissance" 
                value={formData.lieu_naissance}
                onChange={handleChange}
                className="input input-bordered w-full" 
                placeholder="Lieu de naissance"
              />
            </div>

            {/* Nationalité */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Nationalité
              </label>
              <input 
                name="nationalite" 
                value={formData.nationalite}
                onChange={handleChange}
                className="input input-bordered w-full" 
                placeholder="Nationalité"
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

            {/* Code Postal */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Code Postal
              </label>
              <input 
                name="code_postal" 
                value={formData.code_postal}
                onChange={handleChange}
                className="input input-bordered w-full" 
                placeholder="Code postal"
              />
            </div>

            {/* Ville */}
            <div>
              <label className="block text-sm font-medium mb-1">
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

            {/* Situation */}
            <div>
              <label className="block text-sm font-medium mb-1">
                <Briefcase className="w-4 h-4 inline mr-1.5" />
                Situation <span className="text-error">*</span>
              </label>
              <select 
                name="situation" 
                value={formData.situation}
                onChange={handleChange}
                className="select select-bordered w-full"
                required
              >
                {SITUATION_CHOICES.map(sit => (
                  <option key={sit.value} value={sit.value}>{sit.label}</option>
                ))}
              </select>
            </div>

            {/* Poste - CLÉ ÉTRANGÈRE */}
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

            {/* Service - CLÉ ÉTRANGÈRE */}
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

            {/* Date d'embauche */}
            <div>
              <label className="block text-sm font-medium mb-1">
                <Calendar className="w-4 h-4 inline mr-1.5" />
                Date d'embauche <span className="text-error">*</span>
              </label>
              <input 
                name="date_embauche" 
                type="date"
                value={formData.date_embauche}
                onChange={handleChange}
                className="input input-bordered w-full"
                required 
              />
            </div>

            {/* Date fin contrat */}
            <div>
              <label className="block text-sm font-medium mb-1">
                <Calendar className="w-4 h-4 inline mr-1.5" />
                Date fin contrat
              </label>
              <input 
                name="date_fin_contrat" 
                type="date"
                value={formData.date_fin_contrat}
                onChange={handleChange}
                className="input input-bordered w-full" 
              />
            </div>

            {/* Date fin période d'essai */}
            <div>
              <label className="block text-sm font-medium mb-1">
                <Calendar className="w-4 h-4 inline mr-1.5" />
                Fin période d'essai
              </label>
              <input 
                name="date_essai_fin" 
                type="date"
                value={formData.date_essai_fin}
                onChange={handleChange}
                className="input input-bordered w-full" 
              />
            </div>

            {/* Salaire base */}
            <div>
              <label className="block text-sm font-medium mb-1">
                <DollarSign className="w-4 h-4 inline mr-1.5" />
                Salaire base (€)
              </label>
              <input 
                name="salaire_base" 
                type="number"
                step="0.01"
                value={formData.salaire_base}
                onChange={handleChange}
                className="input input-bordered w-full" 
                placeholder="0.00"
              />
            </div>

            {/* Taux horaire */}
            <div>
              <label className="block text-sm font-medium mb-1">
                <DollarSign className="w-4 h-4 inline mr-1.5" />
                Taux horaire (€)
              </label>
              <input 
                name="taux_horaire" 
                type="number"
                step="0.01"
                value={formData.taux_horaire}
                onChange={handleChange}
                className="input input-bordered w-full" 
                placeholder="0.00"
              />
            </div>

            {/* Prime panier */}
            <div>
              <label className="block text-sm font-medium mb-1">
                <DollarSign className="w-4 h-4 inline mr-1.5" />
                Prime panier (€)
              </label>
              <input 
                name="prime_panier" 
                type="number"
                step="0.01"
                value={formData.prime_panier}
                onChange={handleChange}
                className="input input-bordered w-full" 
                placeholder="0.00"
              />
            </div>

            {/* Indemnité KM */}
            <div>
              <label className="block text-sm font-medium mb-1">
                <DollarSign className="w-4 h-4 inline mr-1.5" />
                Indemnité KM (€)
              </label>
              <input 
                name="indemnite_km" 
                type="number"
                step="0.01"
                value={formData.indemnite_km}
                onChange={handleChange}
                className="input input-bordered w-full" 
                placeholder="0.00"
              />
            </div>

            {/* Prime ancienneté */}
            <div>
              <label className="block text-sm font-medium mb-1">
                <DollarSign className="w-4 h-4 inline mr-1.5" />
                Prime ancienneté (€)
              </label>
              <input 
                name="prime_anciennete" 
                type="number"
                step="0.01"
                value={formData.prime_anciennete}
                onChange={handleChange}
                className="input input-bordered w-full" 
                placeholder="0.00"
              />
            </div>

            {/* N° Sécurité Sociale */}
            <div>
              <label className="block text-sm font-medium mb-1">
                <Shield className="w-4 h-4 inline mr-1.5" />
                N° Sécurité Sociale
              </label>
              <input 
                name="numero_securite_sociale" 
                value={formData.numero_securite_sociale}
                onChange={handleChange}
                className="input input-bordered w-full" 
                placeholder="N° Sécurité Sociale"
              />
            </div>

            {/* N° Permis */}
            <div>
              <label className="block text-sm font-medium mb-1">
                <Shield className="w-4 h-4 inline mr-1.5" />
                N° Permis
              </label>
              <input 
                name="num_permis" 
                value={formData.num_permis}
                onChange={handleChange}
                className="input input-bordered w-full" 
                placeholder="N° Permis"
              />
            </div>

            {/* Permis valide */}
            <div className="flex items-center gap-2 pt-6">
              <input 
                name="permis_valide" 
                type="checkbox"
                checked={formData.permis_valide}
                onChange={handleChange}
                className="checkbox checkbox-primary"
              />
              <label className="text-sm font-medium">
                <CheckCircle className="w-4 h-4 inline mr-1.5" />
                Permis valide
              </label>
            </div>

            {/* Agence - CLÉ ÉTRANGÈRE */}
            <div>
              <label className="block text-sm font-medium mb-1">
                <Building2 className="w-4 h-4 inline mr-1.5" />
                Agence
              </label>
              <select 
                name="agence" 
                value={formData.agence}
                onChange={handleChange}
                className="select select-bordered w-full"
              >
                <option value="">Sélectionner une agence</option>
                {agences.map(a => (
                  <option key={a.id} value={a.id}>{a.nom} ({a.ville})</option>
                ))}
              </select>
            </div>

            {/* Utilisateur associé - CLÉ ÉTRANGÈRE */}
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

            {/* Statut */}
            <div className="flex items-center gap-4 pt-6">
              <div className="flex items-center gap-2">
                <input 
                  name="actif" 
                  type="checkbox"
                  checked={formData.actif}
                  onChange={handleChange}
                  className="checkbox checkbox-success"
                />
                <label className="text-sm font-medium">
                  <CheckCircle className="w-4 h-4 inline mr-1.5" />
                  Actif
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  name="disponible" 
                  type="checkbox"
                  checked={formData.disponible}
                  onChange={handleChange}
                  className="checkbox checkbox-info"
                />
                <label className="text-sm font-medium">
                  <CheckCircle className="w-4 h-4 inline mr-1.5" />
                  Disponible
                </label>
              </div>
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