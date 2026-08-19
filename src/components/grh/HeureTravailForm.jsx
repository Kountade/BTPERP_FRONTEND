// src/components/rh/HeureTravailForm.jsx
// Formulaire des heures travaillées - Version corrigée avec cache des contrats

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Timer, Save, X, RefreshCw, Wifi, WifiOff, AlertTriangle,
  UserCircle, Building2, Calendar, ChevronLeft,
  TrendingUp, Moon, Sun, CheckCircle, Loader2
} from 'lucide-react';
import AxiosInstance from '../AxiosInstance';
import cacheService from '../../services/CacheService';

function HeureTravailForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingRelations, setLoadingRelations] = useState(true);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('info');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // DONNÉES POUR LES SELECTS
  const [employes, setEmployes] = useState([]);
  const [projets, setProjets] = useState([]);
  const [contrats, setContrats] = useState([]);
  
  // FORMULAIRE
  const [formData, setFormData] = useState({
    employe: '',
    contrat: '',
    projet: '',
    tache: '',
    date: new Date().toISOString().split('T')[0],
    heures_normales: '0',
    heures_supplementaires: '0',
    heures_nuit: '0',
    heures_weekend: '0',
  });

  // Surveiller la connexion
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      loadRelations();
    };
    const handleOffline = () => {
      setIsOnline(false);
      loadFromCache();
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // ✅ Charger depuis le cache (toutes les données)
  const loadFromCache = async () => {
    try {
      console.log('📡 Chargement depuis le cache...');
      
      // Employés
      const cachedEmployes = await cacheService.getCachedEmployes();
      if (cachedEmployes && cachedEmployes.length > 0) {
        setEmployes(cachedEmployes);
        console.log('💾 Employés depuis le cache:', cachedEmployes.length);
      }
      
      // Projets
      const cachedProjets = await cacheService.getCachedProjets();
      if (cachedProjets && cachedProjets.length > 0) {
        setProjets(cachedProjets);
        console.log('💾 Projets depuis le cache:', cachedProjets.length);
      }
      
      // ✅ Contrats - charger tous les contrats en cache
      const cachedContrats = await cacheService.getCachedContrats();
      if (cachedContrats && cachedContrats.length > 0) {
        console.log('💾 Contrats depuis le cache (total):', cachedContrats.length);
        setContrats(cachedContrats);
        
        // Si un employé est sélectionné, filtrer les contrats
        if (formData.employe) {
          const filtered = cachedContrats.filter(c => c.employe === parseInt(formData.employe));
          setContrats(filtered);
          console.log('💾 Contrats filtrés pour employé:', filtered.length);
        }
      } else {
        console.log('⚠️ Aucun contrat en cache');
        setContrats([]);
      }
      
    } catch (error) {
      console.error('❌ Erreur chargement cache:', error);
    }
  };

  // ✅ Charger les relations depuis l'API
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

      // Charger depuis l'API
      const [employesRes, projetsRes, contratsRes] = await Promise.all([
        AxiosInstance.get('/employes/', { headers: { Authorization: `Token ${token}` } }),
        AxiosInstance.get('/projets/', { headers: { Authorization: `Token ${token}` } }),
        AxiosInstance.get('/contrats/', { headers: { Authorization: `Token ${token}` } })
      ]);

      const employesData = employesRes.data || [];
      const projetsData = projetsRes.data || [];
      const contratsData = contratsRes.data || [];

      console.log('📊 API - Employés:', employesData.length);
      console.log('📊 API - Projets:', projetsData.length);
      console.log('📊 API - Contrats:', contratsData.length);

      setEmployes(employesData);
      setProjets(projetsData);
      setContrats(contratsData);

      // ✅ Sauvegarder en cache
      await cacheService.cacheEmployes(employesData);
      await cacheService.cacheProjets(projetsData);
      await cacheService.cacheContrats(contratsData);
      console.log('✅ Données sauvegardées en cache');

    } catch (error) {
      console.error('❌ Erreur chargement relations:', error);
      await loadFromCache();
    } finally {
      setLoadingRelations(false);
    }
  };

  // ✅ Charger les contrats d'un employé (offline/online)
  const loadContratsForEmploye = useCallback(async (employeId) => {
    if (!employeId) {
      setContrats([]);
      return;
    }

    console.log(`🔍 Chargement des contrats pour l'employé ${employeId}...`);

    // Si en ligne, charger depuis l'API
    if (navigator.onLine) {
      try {
        const token = localStorage.getItem('Token');
        if (!token) return;

        const response = await AxiosInstance.get(`/employes/${employeId}/contrats/`, {
          headers: { Authorization: `Token ${token}` }
        });
        
        const contratsData = response.data || [];
        setContrats(contratsData);
        console.log('📊 API - Contrats pour employé:', contratsData.length);
        
        // Mettre à jour le cache global des contrats
        const allContrats = await cacheService.getCachedContrats();
        const updatedContrats = [...allContrats, ...contratsData];
        await cacheService.cacheContrats(updatedContrats);
        
        return;
      } catch (error) {
        console.error('❌ Erreur chargement contrats API:', error);
      }
    }

    // ✅ Hors ligne ou erreur : utiliser le cache
    try {
      const cachedContrats = await cacheService.getCachedContrats();
      console.log('💾 Contrats en cache (total):', cachedContrats.length);
      
      if (cachedContrats && cachedContrats.length > 0) {
        const filtered = cachedContrats.filter(c => c.employe === parseInt(employeId));
        setContrats(filtered);
        console.log('💾 Contrats filtrés pour employé:', filtered.length);
      } else {
        console.log('⚠️ Aucun contrat en cache pour cet employé');
        setContrats([]);
      }
    } catch (error) {
      console.error('❌ Erreur chargement contrats cache:', error);
      setContrats([]);
    }
  }, []);

  // Charger les données si édition
  useEffect(() => {
    if (isEdit) {
      const loadHeure = async () => {
        setLoadingData(true);
        try {
          const token = localStorage.getItem('Token');
          if (!token) {
            navigate('/login');
            return;
          }

          const response = await AxiosInstance.get(`/heures-travail/${id}/`, {
            headers: { Authorization: `Token ${token}` }
          });
          
          const data = response.data;
          setFormData({
            employe: data.employe || '',
            contrat: data.contrat || '',
            projet: data.projet || '',
            tache: data.tache || '',
            date: data.date || new Date().toISOString().split('T')[0],
            heures_normales: data.heures_normales || '0',
            heures_supplementaires: data.heures_supplementaires || '0',
            heures_nuit: data.heures_nuit || '0',
            heures_weekend: data.heures_weekend || '0',
          });

          // Charger les contrats pour l'employé
          if (data.employe) {
            await loadContratsForEmploye(data.employe);
          }

        } catch (error) {
          console.error('❌ Erreur chargement:', error);
          setMessageType('error');
          setMessage('Erreur lors du chargement');
        } finally {
          setLoadingData(false);
        }
      };
      loadHeure();
    } else {
      setLoadingData(false);
    }
  }, [id, isEdit, navigate, loadContratsForEmploye]);

  // Charger les relations au montage
  useEffect(() => {
    loadRelations();
  }, []);

  // ✅ Quand l'employé change, charger ses contrats
  useEffect(() => {
    if (formData.employe) {
      loadContratsForEmploye(formData.employe);
    } else {
      setContrats([]);
    }
  }, [formData.employe, loadContratsForEmploye]);

  // ✅ Quand la connexion change, recharger les contrats
  useEffect(() => {
    if (formData.employe && isOnline) {
      loadContratsForEmploye(formData.employe);
    }
  }, [isOnline, formData.employe, loadContratsForEmploye]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      employe: '',
      contrat: '',
      projet: '',
      tache: '',
      date: new Date().toISOString().split('T')[0],
      heures_normales: '0',
      heures_supplementaires: '0',
      heures_nuit: '0',
      heures_weekend: '0',
    });
    setContrats([]);
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
        employe: parseInt(formData.employe),
        contrat: formData.contrat ? parseInt(formData.contrat) : null,
        projet: formData.projet ? parseInt(formData.projet) : null,
        tache: formData.tache || '',
        date: formData.date,
        heures_normales: parseFloat(formData.heures_normales) || 0,
        heures_supplementaires: parseFloat(formData.heures_supplementaires) || 0,
        heures_nuit: parseFloat(formData.heures_nuit) || 0,
        heures_weekend: parseFloat(formData.heures_weekend) || 0,
      };

      let response;
      if (isEdit) {
        response = await AxiosInstance.put(`/heures-travail/${id}/`, dataToSend, {
          headers: { Authorization: `Token ${token}` }
        });
      } else {
        response = await AxiosInstance.post('/heures-travail/', dataToSend, {
          headers: { Authorization: `Token ${token}` }
        });
      }

      setMessageType('success');
      setMessage(isEdit ? '✅ Heures modifiées avec succès' : '✅ Heures enregistrées avec succès');
      
      if (!isEdit) resetForm();
      setTimeout(() => navigate('/heures-travail'), 1500);

    } catch (error) {
      console.error('❌ Erreur:', error);

      if (error.message === 'Network Error' || error.code === 'ERR_NETWORK' || !navigator.onLine) {
        try {
          await cacheService.addPendingOperation({
            type: isEdit ? 'UPDATE_HEURE_TRAVAIL' : 'CREATE_HEURE_TRAVAIL',
            data: formData,
            heureId: isEdit ? id : undefined
          });
          setMessageType('warning');
          setMessage('💾 Sauvegardé localement - Sync auto à la reconnexion');
          if (!isEdit) resetForm();
          setTimeout(() => navigate('/heures-travail'), 2000);
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
        
        {/* En-tête */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-base-200 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/heures-travail')}
              className="btn btn-ghost btn-sm btn-square"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="p-2 bg-primary/10 rounded-xl">
              <Timer className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold">
              {isEdit ? 'Modifier les heures travaillées' : 'Nouvelle saisie d\'heures'}
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
              onClick={() => navigate('/heures-travail')}
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

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="bg-base-200 rounded-xl p-4 border border-base-300">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-base-300">
              <Timer className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-base-content">Saisie des heures</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              
              {/* Employé */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  <UserCircle className="w-4 h-4 inline mr-1.5" />
                  Employé <span className="text-error">*</span>
                </label>
                <select 
                  name="employe" 
                  value={formData.employe}
                  onChange={handleChange}
                  className="select select-bordered w-full"
                  required
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
                {!isOnline && employes.length > 0 && (
                  <p className="text-xs text-info mt-1">💾 {employes.length} employés depuis le cache</p>
                )}
              </div>

              {/* ✅ Contrat - Avec cache */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  <CheckCircle className="w-4 h-4 inline mr-1.5" />
                  Contrat
                </label>
                <select 
                  name="contrat" 
                  value={formData.contrat}
                  onChange={handleChange}
                  className="select select-bordered w-full"
                >
                  <option value="">Sélectionner un contrat</option>
                  {contrats.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.situation_display || c.situation} - {c.date_embauche}
                      {c.statut === 'actif' ? ' ✅' : ' ❌'}
                    </option>
                  ))}
                </select>
                {contrats.length === 0 && formData.employe && (
                  <p className="text-xs text-warning mt-1">
                    ⚠️ Aucun contrat trouvé pour cet employé
                  </p>
                )}
                {!isOnline && contrats.length > 0 && (
                  <p className="text-xs text-info mt-1">
                    💾 {contrats.length} contrat(s) depuis le cache
                  </p>
                )}
                {!isOnline && formData.employe && contrats.length === 0 && (
                  <p className="text-xs text-error mt-1">
                    ⚠️ Aucun contrat en cache. Vérifiez votre connexion.
                  </p>
                )}
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  <Calendar className="w-4 h-4 inline mr-1.5" />
                  Date <span className="text-error">*</span>
                </label>
                <input 
                  name="date" 
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  required 
                />
              </div>

              {/* Projet */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  <Building2 className="w-4 h-4 inline mr-1.5" />
                  Projet
                </label>
                <select 
                  name="projet" 
                  value={formData.projet}
                  onChange={handleChange}
                  className="select select-bordered w-full"
                >
                  <option value="">Sélectionner un projet</option>
                  {projets.map(p => (
                    <option key={p.id} value={p.id}>{p.nom || p.code}</option>
                  ))}
                </select>
              </div>

              {/* Tâche */}
              <div className="col-span-full">
                <label className="block text-sm font-medium mb-1">
                  Tâche
                </label>
                <input 
                  name="tache" 
                  value={formData.tache}
                  onChange={handleChange}
                  className="input input-bordered w-full" 
                  placeholder="Description de la tâche"
                />
              </div>

              {/* Heures normales */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  <Timer className="w-4 h-4 inline mr-1.5" />
                  Heures normales
                </label>
                <input 
                  name="heures_normales" 
                  type="number"
                  step="0.5"
                  value={formData.heures_normales}
                  onChange={handleChange}
                  className="input input-bordered w-full" 
                  placeholder="0"
                />
              </div>

              {/* Heures supplémentaires */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  <TrendingUp className="w-4 h-4 inline mr-1.5" />
                  Heures supplémentaires
                </label>
                <input 
                  name="heures_supplementaires" 
                  type="number"
                  step="0.5"
                  value={formData.heures_supplementaires}
                  onChange={handleChange}
                  className="input input-bordered w-full" 
                  placeholder="0"
                />
              </div>

              {/* Heures de nuit */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  <Moon className="w-4 h-4 inline mr-1.5" />
                  Heures de nuit
                </label>
                <input 
                  name="heures_nuit" 
                  type="number"
                  step="0.5"
                  value={formData.heures_nuit}
                  onChange={handleChange}
                  className="input input-bordered w-full" 
                  placeholder="0"
                />
              </div>

              {/* Heures weekend */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  <Sun className="w-4 h-4 inline mr-1.5" />
                  Heures weekend
                </label>
                <input 
                  name="heures_weekend" 
                  type="number"
                  step="0.5"
                  value={formData.heures_weekend}
                  onChange={handleChange}
                  className="input input-bordered w-full" 
                  placeholder="0"
                />
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
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {loading ? 'En cours...' : (isEdit ? 'Modifier' : 'Enregistrer')}
            </button>
            
            <button 
              type="button" 
              className="btn btn-ghost gap-2"
              onClick={() => navigate('/heures-travail')}
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

export default HeureTravailForm;