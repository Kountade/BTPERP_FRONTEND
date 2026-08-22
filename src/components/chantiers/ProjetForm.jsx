// src/components/chantiers/ProjetForm.jsx
// Formulaire de projet/chantier - Multi-agences

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Briefcase, Save, X, RefreshCw, Wifi, WifiOff, AlertTriangle,
  Building2, ChevronLeft, DollarSign, Calendar, FileText,
  Loader2, MapPin, UserCircle, HardHat, Target
} from 'lucide-react';
import AxiosInstance from '../AxiosInstance';
import cacheService from '../../services/CacheService';

const STATUT_CHOICES = [
  { value: 'etude', label: 'En étude' },
  { value: 'encours', label: 'En cours' },
  { value: 'suspendu', label: 'Suspendu' },
  { value: 'termine', label: 'Terminé' },
  { value: 'livre', label: 'Livré' }
];

const TYPE_CHOICES = [
  { value: 'construction', label: 'Construction neuve' },
  { value: 'renovation', label: 'Rénovation' },
  { value: 'extension', label: 'Extension' },
  { value: 'tp', label: 'Travaux Publics' },
  { value: 'entretien', label: 'Entretien' },
  { value: 'demolition', label: 'Démolition' }
];

const RISQUE_CHOICES = [
  { value: 'Faible', label: 'Faible' },
  { value: 'Moyen', label: 'Moyen' },
  { value: 'Élevé', label: 'Élevé' },
  { value: 'Critique', label: 'Critique' }
];

function ProjetForm() {
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
  const [chefsProjet, setChefsProjet] = useState([]);

  const [formData, setFormData] = useState({
    code: '',
    nom: '',
    type_projet: 'construction',
    statut: 'etude',
    client: '',
    chef_projet: '',
    agence: '',
    date_debut: '',
    date_fin_previsionnelle: '',
    budget_total: '',
    budget_mo: 0,
    budget_materiaux: 0,
    budget_sous_traitance: 0,
    budget_frais_generaux: 0,
    adresse_chantier: '',
    code_postal: '',
    ville: '',
    coordonnees_gps: '',
    taux_avancement: 0,
    rentabilite_previsionnelle: 0,
    note_qualite: 0,
    niveau_risque: 'Faible',
  });

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

  const loadFromCache = async () => {
    try {
      const cachedAgences = await cacheService.getCachedAgences();
      if (cachedAgences) setAgences(cachedAgences);
      
      const cachedUsers = await cacheService.getCachedUsers();
      if (cachedUsers) {
        const chefs = cachedUsers.filter(u => 
          u.est_chef_projet || u.est_directeur_agence || u.role_global === 'pdg'
        );
        setChefsProjet(chefs);
      }
      
      const cachedClients = await cacheService.db.getItem('clients_cache');
      if (cachedClients) setClients(cachedClients);
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
      const chefs = allUsers.filter(u => 
        u.est_chef_projet || u.est_directeur_agence || u.role_global === 'pdg'
      );
      setChefsProjet(chefs);

      setClients(clientsRes.data || []);

      await cacheService.cacheAgences(agencesData);
      await cacheService.cacheUsers(allUsers);
      await cacheService.db.setItem('clients_cache', clientsRes.data || []);

    } catch (error) {
      console.error('❌ Erreur chargement relations:', error);
      await loadFromCache();
    } finally {
      setLoadingRelations(false);
    }
  };

  useEffect(() => {
    if (isEdit) {
      const loadProjet = async () => {
        setLoadingData(true);
        try {
          const token = localStorage.getItem('Token');
          if (!token) {
            navigate('/login');
            return;
          }
          const response = await AxiosInstance.get(`/projets/${id}/`, {
            headers: { Authorization: `Token ${token}` }
          });
          const data = response.data;
          setFormData({
            code: data.code || '',
            nom: data.nom || '',
            type_projet: data.type_projet || 'construction',
            statut: data.statut || 'etude',
            client: data.client || '',
            chef_projet: data.chef_projet || '',
            agence: data.agence || '',
            date_debut: data.date_debut || '',
            date_fin_previsionnelle: data.date_fin_previsionnelle || '',
            budget_total: data.budget_total || '',
            budget_mo: data.budget_mo || 0,
            budget_materiaux: data.budget_materiaux || 0,
            budget_sous_traitance: data.budget_sous_traitance || 0,
            budget_frais_generaux: data.budget_frais_generaux || 0,
            adresse_chantier: data.adresse_chantier || '',
            code_postal: data.code_postal || '',
            ville: data.ville || '',
            coordonnees_gps: data.coordonnees_gps || '',
            taux_avancement: data.taux_avancement || 0,
            rentabilite_previsionnelle: data.rentabilite_previsionnelle || 0,
            note_qualite: data.note_qualite || 0,
            niveau_risque: data.niveau_risque || 'Faible',
          });
        } catch (error) {
          console.error('❌ Erreur chargement:', error);
          setMessageType('error');
          setMessage('Erreur lors du chargement');
        } finally {
          setLoadingData(false);
        }
      };
      loadProjet();
    } else {
      setLoadingData(false);
    }
  }, [id, isEdit, navigate]);

  useEffect(() => {
    loadRelations();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      code: '',
      nom: '',
      type_projet: 'construction',
      statut: 'etude',
      client: '',
      chef_projet: '',
      agence: agencePrincipale ? agencePrincipale.id : '',
      date_debut: '',
      date_fin_previsionnelle: '',
      budget_total: '',
      budget_mo: 0,
      budget_materiaux: 0,
      budget_sous_traitance: 0,
      budget_frais_generaux: 0,
      adresse_chantier: '',
      code_postal: '',
      ville: '',
      coordonnees_gps: '',
      taux_avancement: 0,
      rentabilite_previsionnelle: 0,
      note_qualite: 0,
      niveau_risque: 'Faible',
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
        code: formData.code,
        nom: formData.nom,
        type_projet: formData.type_projet,
        statut: formData.statut,
        client: parseInt(formData.client),
        chef_projet: formData.chef_projet ? parseInt(formData.chef_projet) : null,
        agence: parseInt(formData.agence),
        date_debut: formData.date_debut,
        date_fin_previsionnelle: formData.date_fin_previsionnelle,
        budget_total: parseFloat(formData.budget_total) || 0,
        budget_mo: parseFloat(formData.budget_mo) || 0,
        budget_materiaux: parseFloat(formData.budget_materiaux) || 0,
        budget_sous_traitance: parseFloat(formData.budget_sous_traitance) || 0,
        budget_frais_generaux: parseFloat(formData.budget_frais_generaux) || 0,
        adresse_chantier: formData.adresse_chantier,
        code_postal: formData.code_postal,
        ville: formData.ville,
        coordonnees_gps: formData.coordonnees_gps,
        taux_avancement: parseFloat(formData.taux_avancement) || 0,
        rentabilite_previsionnelle: parseFloat(formData.rentabilite_previsionnelle) || 0,
        note_qualite: parseFloat(formData.note_qualite) || 0,
        niveau_risque: formData.niveau_risque,
      };

      if (isEdit) {
        await AxiosInstance.put(`/projets/${id}/`, dataToSend, {
          headers: { Authorization: `Token ${token}` }
        });
      } else {
        await AxiosInstance.post('/projets/', dataToSend, {
          headers: { Authorization: `Token ${token}` }
        });
      }

      setMessageType('success');
      setMessage(isEdit ? '✅ Projet modifié avec succès' : '✅ Projet créé avec succès');
      
      if (!isEdit) resetForm();
      setTimeout(() => navigate('/projets'), 1500);

    } catch (error) {
      console.error('❌ Erreur:', error);
      
      if (!navigator.onLine || error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
        try {
          await cacheService.addPendingOperation({
            type: isEdit ? 'UPDATE_PROJET' : 'CREATE_PROJET',
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
              onClick={() => navigate('/projets')}
              className="btn btn-ghost btn-sm btn-square"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="p-2 bg-primary/10 rounded-xl">
              <Briefcase className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold">
              {isEdit ? 'Modifier le projet' : 'Nouveau projet'}
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
              onClick={() => navigate('/projets')}
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
            <span>📡 Mode hors ligne - Données depuis le cache</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="bg-base-200 rounded-xl p-4 border border-base-300">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-base-300">
              <Briefcase className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-base-content">Informations générales</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  <FileText className="w-4 h-4 inline mr-1.5" />
                  Code <span className="text-error">*</span>
                </label>
                <input 
                  name="code" 
                  value={formData.code}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="Ex: CH-2024-001"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  <FileText className="w-4 h-4 inline mr-1.5" />
                  Nom <span className="text-error">*</span>
                </label>
                <input 
                  name="nom" 
                  value={formData.nom}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="Nom du projet"
                  required
                />
              </div>

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
                  <Target className="w-4 h-4 inline mr-1.5" />
                  Type <span className="text-error">*</span>
                </label>
                <select 
                  name="type_projet" 
                  value={formData.type_projet}
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
                  <HardHat className="w-4 h-4 inline mr-1.5" />
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
                  <UserCircle className="w-4 h-4 inline mr-1.5" />
                  Chef de projet
                </label>
                <select 
                  name="chef_projet" 
                  value={formData.chef_projet}
                  onChange={handleChange}
                  className="select select-bordered w-full"
                >
                  <option value="">Sélectionner</option>
                  {chefsProjet.map(u => {
                    const name = u.first_name || u.last_name ? `${u.first_name || ''} ${u.last_name || ''}`.trim() : u.email;
                    return (
                      <option key={u.id} value={u.id}>{name}</option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  <Calendar className="w-4 h-4 inline mr-1.5" />
                  Date de début <span className="text-error">*</span>
                </label>
                <input 
                  name="date_debut" 
                  type="date"
                  value={formData.date_debut}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  <Calendar className="w-4 h-4 inline mr-1.5" />
                  Date de fin prévisionnelle <span className="text-error">*</span>
                </label>
                <input 
                  name="date_fin_previsionnelle" 
                  type="date"
                  value={formData.date_fin_previsionnelle}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  required
                />
              </div>
            </div>
          </div>

          {/* Budget */}
          <div className="bg-base-200 rounded-xl p-4 border border-base-300">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-base-300">
              <DollarSign className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-base-content">Budget</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  <DollarSign className="w-4 h-4 inline mr-1.5" />
                  Budget total <span className="text-error">*</span>
                </label>
                <input 
                  name="budget_total" 
                  type="number"
                  step="0.01"
                  value={formData.budget_total}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Budget Main d'œuvre
                </label>
                <input 
                  name="budget_mo" 
                  type="number"
                  step="0.01"
                  value={formData.budget_mo}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Budget Matériaux
                </label>
                <input 
                  name="budget_materiaux" 
                  type="number"
                  step="0.01"
                  value={formData.budget_materiaux}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Budget Sous-traitance
                </label>
                <input 
                  name="budget_sous_traitance" 
                  type="number"
                  step="0.01"
                  value={formData.budget_sous_traitance}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Budget Frais généraux
                </label>
                <input 
                  name="budget_frais_generaux" 
                  type="number"
                  step="0.01"
                  value={formData.budget_frais_generaux}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Localisation */}
          <div className="bg-base-200 rounded-xl p-4 border border-base-300">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-base-300">
              <MapPin className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-base-content">Localisation</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="col-span-full">
                <label className="block text-sm font-medium mb-1">
                  Adresse du chantier <span className="text-error">*</span>
                </label>
                <input 
                  name="adresse_chantier" 
                  value={formData.adresse_chantier}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="Adresse complète"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Code postal <span className="text-error">*</span>
                </label>
                <input 
                  name="code_postal" 
                  value={formData.code_postal}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="75000"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Ville <span className="text-error">*</span>
                </label>
                <input 
                  name="ville" 
                  value={formData.ville}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="Paris"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Coordonnées GPS
                </label>
                <input 
                  name="coordonnees_gps" 
                  value={formData.coordonnees_gps}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="48.8566, 2.3522"
                />
              </div>
            </div>
          </div>

          {/* Indicateurs */}
          <div className="bg-base-200 rounded-xl p-4 border border-base-300">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-base-300">
              <Target className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-base-content">Indicateurs</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Taux d'avancement (%)
                </label>
                <input 
                  name="taux_avancement" 
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.taux_avancement}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Rentabilité prévisionnelle (%)
                </label>
                <input 
                  name="rentabilite_previsionnelle" 
                  type="number"
                  step="0.01"
                  value={formData.rentabilite_previsionnelle}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Note qualité (/5)
                </label>
                <input 
                  name="note_qualite" 
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={formData.note_qualite}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Niveau de risque
                </label>
                <select 
                  name="niveau_risque" 
                  value={formData.niveau_risque}
                  onChange={handleChange}
                  className="select select-bordered w-full"
                >
                  {RISQUE_CHOICES.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
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
              onClick={() => navigate('/projets')}
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

export default ProjetForm;