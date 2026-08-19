// src/components/rh/ContratForm.jsx
// Formulaire CONTRAT UNIQUEMENT - 10 champs - Avec cache et redirection

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { 
  FileText, Briefcase, BadgeCheck, CalendarDays, DollarSign,
  Clock, Coins, MapPin, Award, Save, X, RefreshCw,
  Wifi, WifiOff, AlertTriangle, UserCircle, Building2, Users,
  ChevronLeft
} from 'lucide-react';
import AxiosInstance from '../AxiosInstance';

// ✅ IMPORTER CacheService
import cacheService from '../../services/CacheService';

function ContratForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isEdit = !!id;
  
  // Récupérer l'employe_id depuis l'URL
  const queryParams = new URLSearchParams(location.search);
  const employeIdFromUrl = queryParams.get('employe');

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingRelations, setLoadingRelations] = useState(true);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('info');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // ✅ DONNÉES POUR LES SELECTS (CLÉS ÉTRANGÈRES)
  const [employes, setEmployes] = useState([]);
  const [selectedEmploye, setSelectedEmploye] = useState(null);
  
  // ✅ FORMULAIRE CONTRAT (10 champs UNIQUEMENT)
  const [formData, setFormData] = useState({
    employe: employeIdFromUrl || '',
    situation: 'cdi',
    statut: 'actif',
    date_embauche: '',
    date_fin_contrat: '',
    salaire_base: '',
    taux_horaire: '',
    prime_panier: '0',
    indemnite_km: '0',
    prime_anciennete: '0',
  });

  // Options
  const SITUATION_CHOICES = [
    { value: 'cdi', label: 'CDI' },
    { value: 'cdd', label: 'CDD' },
    { value: 'interim', label: 'Intérim' },
    { value: 'apprenti', label: 'Apprenti' },
    { value: 'stagiaire', label: 'Stagiaire' },
    { value: 'auto_entrepreneur', label: 'Auto-Entrepreneur' }
  ];

  const STATUT_CHOICES = [
    { value: 'actif', label: 'Actif' },
    { value: 'termine', label: 'Terminé' },
    { value: 'resilie', label: 'Résilié' },
    { value: 'suspendu', label: 'Suspendu' }
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
      // Employés
      const cachedEmployes = await cacheService.db.getItem('employes_cache');
      if (cachedEmployes && cachedEmployes.length > 0) {
        setEmployes(cachedEmployes);
        console.log('💾 Employés depuis le cache:', cachedEmployes.length);
        
        if (employeIdFromUrl) {
          const emp = cachedEmployes.find(e => e.id === parseInt(employeIdFromUrl));
          if (emp) setSelectedEmploye(emp);
        }
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
      
      const employesRes = await AxiosInstance.get('/employes/', {
        headers: { Authorization: `Token ${token}` }
      });

      const employesData = employesRes.data || [];
      setEmployes(employesData);

      if (employeIdFromUrl) {
        const emp = employesData.find(e => e.id === parseInt(employeIdFromUrl));
        if (emp) setSelectedEmploye(emp);
      }

      // Sauvegarder en cache pour offline
      await cacheService.db.setItem('employes_cache', employesData);
      console.log('✅ Données sauvegardées en cache');

    } catch (error) {
      console.error('❌ Erreur chargement relations:', error);
      // En cas d'erreur, essayer le cache
      await loadFromCache();
    } finally {
      setLoadingRelations(false);
    }
  };

  // ✅ Charger le contrat si édition
  useEffect(() => {
    if (isEdit) {
      const loadContrat = async () => {
        setLoadingData(true);
        try {
          const token = localStorage.getItem('Token');
          if (!token) {
            navigate('/login');
            return;
          }

          // Si hors ligne, essayer le cache
          if (!navigator.onLine) {
            const cachedContrat = await cacheService.db.getItem(`contrat_${id}`);
            if (cachedContrat) {
              setFormData({
                employe: cachedContrat.employe || '',
                situation: cachedContrat.situation || 'cdi',
                statut: cachedContrat.statut || 'actif',
                date_embauche: cachedContrat.date_embauche || '',
                date_fin_contrat: cachedContrat.date_fin_contrat || '',
                salaire_base: cachedContrat.salaire_base || '',
                taux_horaire: cachedContrat.taux_horaire || '',
                prime_panier: cachedContrat.prime_panier || '0',
                indemnite_km: cachedContrat.indemnite_km || '0',
                prime_anciennete: cachedContrat.prime_anciennete || '0',
              });
              setLoadingData(false);
              // Charger l'employé associé depuis le cache
              if (cachedContrat.employe) {
                const cachedEmployes = await cacheService.db.getItem('employes_cache');
                if (cachedEmployes) {
                  const emp = cachedEmployes.find(e => e.id === parseInt(cachedContrat.employe));
                  if (emp) setSelectedEmploye(emp);
                }
              }
              return;
            }
          }

          // Si en ligne, charger depuis l'API
          const response = await AxiosInstance.get(`/contrats/${id}/`, {
            headers: { Authorization: `Token ${token}` }
          });
          
          const data = response.data;
          setFormData({
            employe: data.employe || '',
            situation: data.situation || 'cdi',
            statut: data.statut || 'actif',
            date_embauche: data.date_embauche || '',
            date_fin_contrat: data.date_fin_contrat || '',
            salaire_base: data.salaire_base || '',
            taux_horaire: data.taux_horaire || '',
            prime_panier: data.prime_panier || '0',
            indemnite_km: data.indemnite_km || '0',
            prime_anciennete: data.prime_anciennete || '0',
          });

          // Charger l'employé associé
          if (data.employe) {
            try {
              const empRes = await AxiosInstance.get(`/employes/${data.employe}/`, {
                headers: { Authorization: `Token ${token}` }
              });
              setSelectedEmploye(empRes.data);
            } catch (empError) {
              console.error('❌ Erreur chargement employé:', empError);
            }
          }

          // Sauvegarder en cache
          await cacheService.db.setItem(`contrat_${id}`, data);

        } catch (error) {
          console.error('❌ Erreur chargement contrat:', error);
          setMessageType('error');
          setMessage('Erreur lors du chargement du contrat');
        } finally {
          setLoadingData(false);
        }
      };
      loadContrat();
    } else {
      setLoadingData(false);
    }
  }, [id, isEdit, navigate]);

  // ✅ Charger les relations au montage
  useEffect(() => {
    loadRelations();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEmployeChange = (e) => {
    const empId = e.target.value;
    setFormData(prev => ({
      ...prev,
      employe: empId
    }));
    const emp = employes.find(e => e.id === parseInt(empId));
    setSelectedEmploye(emp || null);
  };

  const resetForm = () => {
    setFormData({
      employe: employeIdFromUrl || '',
      situation: 'cdi',
      statut: 'actif',
      date_embauche: '',
      date_fin_contrat: '',
      salaire_base: '',
      taux_horaire: '',
      prime_panier: '0',
      indemnite_km: '0',
      prime_anciennete: '0',
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

      // CONTRAT UNIQUEMENT (10 champs)
      const contratData = {
        employe: parseInt(formData.employe),
        situation: formData.situation,
        statut: formData.statut || 'actif',
        date_embauche: formData.date_embauche,
        date_fin_contrat: formData.date_fin_contrat || null,
        salaire_base: formData.salaire_base ? parseFloat(formData.salaire_base) : 0,
        taux_horaire: formData.taux_horaire ? parseFloat(formData.taux_horaire) : 0,
        prime_panier: formData.prime_panier ? parseFloat(formData.prime_panier) : 0,
        indemnite_km: formData.indemnite_km ? parseFloat(formData.indemnite_km) : 0,
        prime_anciennete: formData.prime_anciennete ? parseFloat(formData.prime_anciennete) : 0,
      };

      let response;
      if (isEdit) {
        response = await AxiosInstance.put(`/contrats/${id}/`, contratData, {
          headers: { Authorization: `Token ${token}` }
        });
        // Mettre à jour le cache
        await cacheService.db.setItem(`contrat_${id}`, response.data);
      } else {
        response = await AxiosInstance.post('/contrats/', contratData, {
          headers: { Authorization: `Token ${token}` }
        });
        // Sauvegarder en cache
        await cacheService.db.setItem(`contrat_${response.data.id}`, response.data);
      }

      setMessageType('success');
      setMessage(isEdit ? '✅ Contrat modifié avec succès' : '✅ Contrat créé avec succès');
      
      // ✅ REDIRECTION VERS LA LISTE DES CONTRATS
      if (!isEdit) resetForm();
      setTimeout(() => navigate('/contrats'), 1500);

    } catch (error) {
      console.error('❌ Erreur:', error);

      // ✅ Sauvegarde OFFLINE via CacheService
      if (error.message === 'Network Error' || error.code === 'ERR_NETWORK' || !navigator.onLine) {
        try {
          await cacheService.addPendingOperation({
            type: isEdit ? 'UPDATE_CONTRAT' : 'CREATE_CONTRAT',
            data: formData,
            contratId: isEdit ? id : undefined
          });
          setMessageType('warning');
          setMessage('💾 Sauvegardé localement - Sync auto à la reconnexion');
          if (!isEdit) resetForm();
          // Redirection après sauvegarde offline
          setTimeout(() => navigate('/contrats'), 2000);
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

  // Rediriger vers la création d'employé
  const goToCreateEmploye = () => {
    navigate('/employes/create');
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
            <button 
              onClick={() => navigate('/contrats')}
              className="btn btn-ghost btn-sm btn-square"
              title="Retour à la liste"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="p-2 bg-primary/10 rounded-xl">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold">
              {isEdit ? 'Modifier le contrat' : 'Nouveau contrat de travail'}
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
              onClick={() => navigate('/contrats')}
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

        {/* ✅ FORMULAIRE CONTRAT - 10 CHAMPS UNIQUEMENT */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="bg-base-200 rounded-xl p-4 border border-base-300">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-base-300">
              <FileText className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-base-content">Détails du contrat</h3>
              <span className="badge badge-primary badge-xs ml-2">10 champs</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              
              {/* Employé - CLÉ ÉTRANGÈRE */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  <UserCircle className="w-4 h-4 inline mr-1.5" />
                  Employé <span className="text-error">*</span>
                </label>
                <div className="flex gap-2">
                  <select 
                    name="employe" 
                    value={formData.employe}
                    onChange={handleEmployeChange}
                    className="select select-bordered flex-1"
                    required
                    disabled={!!employeIdFromUrl}
                  >
                    <option value="">Sélectionner un employé</option>
                    {employes.map(e => {
                      const fullName = `${e.prenom || ''} ${e.nom || ''}`.trim() || e.email;
                      return (
                        <option key={e.id} value={e.id}>
                          {e.matricule} - {fullName}
                        </option>
                      );
                    })}
                  </select>
                  {!employeIdFromUrl && (
                    <button 
                      type="button"
                      onClick={goToCreateEmploye}
                      className="btn btn-primary btn-sm gap-1"
                      title="Créer un employé"
                    >
                      <Users className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {selectedEmploye && (
                  <p className="text-xs text-base-content/60 mt-1">
                    <Building2 className="w-3 h-3 inline mr-1" />
                    {selectedEmploye.service_nom || 'Service non assigné'} • 
                    {selectedEmploye.poste_nom || 'Poste non assigné'}
                  </p>
                )}
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
                  {SITUATION_CHOICES.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              {/* Statut */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  <BadgeCheck className="w-4 h-4 inline mr-1.5" />
                  Statut
                </label>
                <select 
                  name="statut" 
                  value={formData.statut}
                  onChange={handleChange}
                  className="select select-bordered w-full"
                >
                  {STATUT_CHOICES.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              {/* Date d'embauche */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  <CalendarDays className="w-4 h-4 inline mr-1.5" />
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
                  <CalendarDays className="w-4 h-4 inline mr-1.5" />
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
                  <Clock className="w-4 h-4 inline mr-1.5" />
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
                  <Coins className="w-4 h-4 inline mr-1.5" />
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
                  <MapPin className="w-4 h-4 inline mr-1.5" />
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
                  <Award className="w-4 h-4 inline mr-1.5" />
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
              onClick={() => navigate('/contrats')}
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

export default ContratForm;