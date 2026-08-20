// src/components/rh/PointageForm.jsx
// Formulaire de pointage - Avec synchronisation fonctionnelle

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Clock, Save, X, RefreshCw, Wifi, WifiOff, AlertTriangle,
  UserCircle, Building2, ChevronLeft,
  Timer, CheckCircle, Loader2
} from 'lucide-react';
import AxiosInstance from '../AxiosInstance';
import cacheService from '../../services/CacheService';

function PointageForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingRelations, setLoadingRelations] = useState(true);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('info');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [employes, setEmployes] = useState([]);
  const [projets, setProjets] = useState([]);
  const [contrats, setContrats] = useState([]);
  
  const [formData, setFormData] = useState({
    employe: '',
    contrat: '',
    projet: '',
    tache: '',
    type_pointage: 'arrivee',
    remarque: '',
  });

  const TYPE_CHOICES = [
    { value: 'arrivee', label: 'Arrivée' },
    { value: 'depart', label: 'Départ' },
    { value: 'pause', label: 'Pause' },
    { value: 'retour_pause', label: 'Retour de pause' },
    { value: 'heure_sup', label: 'Heure supplémentaire' }
  ];

  // ✅ SYNC DES DONNÉES PENDING
  const syncPendingData = async () => {
    if (!isOnline) {
      console.log('📡 Hors ligne - Synchronisation impossible');
      return;
    }

    if (isSyncing) {
      console.log('⏳ Synchronisation déjà en cours');
      return;
    }

    setIsSyncing(true);
    console.log('🔄 Début synchronisation des pointages...');

    try {
      // Récupérer les opérations en attente
      const pendingOps = await cacheService.getPendingOperations();
      
      if (pendingOps.length === 0) {
        console.log('✅ Aucune opération en attente');
        setIsSyncing(false);
        return;
      }

      console.log(`📝 ${pendingOps.length} opérations à synchroniser`);
      
      const token = localStorage.getItem('Token');
      if (!token) {
        console.log('❌ Token manquant');
        setIsSyncing(false);
        return;
      }

      let synced = 0;
      let failed = 0;

      for (const op of pendingOps) {
        try {
          // Ne traiter que les opérations liées aux pointages
          if (!op.type || !['CREATE_POINTAGE', 'UPDATE_POINTAGE'].includes(op.type)) {
            continue;
          }

          console.log(`📤 Synchronisation: ${op.type}`);
          
          let url = '';
          let method = '';
          
          // Préparer les données
          const preparedData = {
            employe: parseInt(op.data.employe),
            contrat: op.data.contrat ? parseInt(op.data.contrat) : null,
            projet: op.data.projet ? parseInt(op.data.projet) : null,
            tache: op.data.tache || '',
            type_pointage: op.data.type_pointage,
            remarque: op.data.remarque || '',
          };

          if (op.type === 'CREATE_POINTAGE') {
            url = '/pointages/';
            method = 'POST';
          } else if (op.type === 'UPDATE_POINTAGE') {
            url = `/pointages/${op.pointageId}/`;
            method = 'PUT';
          }

          const response = await AxiosInstance({
            method: method,
            url: url,
            data: preparedData,
            headers: { Authorization: `Token ${token}` }
          });

          if (response && response.status >= 200 && response.status < 300) {
            await cacheService.removePendingOperation(op.id);
            synced++;
            console.log(`✅ Opération ${op.id} synchronisée`);
          } else {
            failed++;
            console.log(`❌ Échec synchronisation ${op.id}: ${response?.status}`);
          }

        } catch (error) {
          failed++;
          console.error(`❌ Erreur sync opération ${op.id}:`, error);
          
          if (error.response?.status === 401) {
            console.log('🔒 Token invalide - Déconnexion');
            localStorage.removeItem('Token');
            localStorage.removeItem('User');
            navigate('/login');
            setIsSyncing(false);
            return;
          }
        }
      }

      console.log(`📊 Synchro terminée: ${synced} succès, ${failed} échecs`);
      
      // Notification de succès
      if (synced > 0) {
        setMessageType('success');
        setMessage(`✅ ${synced} pointage(s) synchronisé(s) avec succès`);
        setTimeout(() => setMessage(null), 4000);
      }

    } catch (error) {
      console.error('❌ Erreur synchronisation:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Surveiller la connexion
  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      console.log('📶 Connexion rétablie');
      
      // ✅ Synchronisation automatique
      await syncPendingData();
      
      // Recharger les données
      await loadRelations();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      console.log('📡 Mode hors ligne');
      loadFromCache();
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadFromCache = async () => {
    try {
      console.log('📡 Chargement depuis le cache...');
      
      const cachedEmployes = await cacheService.getCachedEmployes();
      if (cachedEmployes && cachedEmployes.length > 0) {
        setEmployes(cachedEmployes);
        console.log('💾 Employés depuis le cache:', cachedEmployes.length);
      }
      
      const cachedProjets = await cacheService.getCachedProjets();
      if (cachedProjets && cachedProjets.length > 0) {
        setProjets(cachedProjets);
        console.log('💾 Projets depuis le cache:', cachedProjets.length);
      }
      
      const cachedContrats = await cacheService.getCachedContrats();
      if (cachedContrats && cachedContrats.length > 0) {
        console.log('💾 Contrats depuis le cache (total):', cachedContrats.length);
        
        if (formData.employe) {
          const filtered = cachedContrats.filter(c => c.employe === parseInt(formData.employe));
          setContrats(filtered);
          console.log('💾 Contrats filtrés pour employé:', filtered.length);
        } else {
          setContrats(cachedContrats);
        }
      } else {
        console.log('⚠️ Aucun contrat en cache');
        setContrats([]);
      }
      
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

      console.log('📡 Chargement depuis l\'API...');

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
      
      if (formData.employe) {
        const filtered = contratsData.filter(c => c.employe === parseInt(formData.employe));
        setContrats(filtered);
      } else {
        setContrats(contratsData);
      }

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
        
        const allContrats = await cacheService.getCachedContrats();
        const updatedContrats = [...allContrats, ...contratsData];
        await cacheService.cacheContrats(updatedContrats);
        
        return;
      } catch (error) {
        console.error('❌ Erreur chargement contrats API:', error);
      }
    }

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

  useEffect(() => {
    if (isEdit) {
      const loadPointage = async () => {
        setLoadingData(true);
        try {
          const token = localStorage.getItem('Token');
          if (!token) {
            navigate('/login');
            return;
          }

          const response = await AxiosInstance.get(`/pointages/${id}/`, {
            headers: { Authorization: `Token ${token}` }
          });
          
          const data = response.data;
          setFormData({
            employe: data.employe || '',
            contrat: data.contrat || '',
            projet: data.projet || '',
            tache: data.tache || '',
            type_pointage: data.type_pointage || 'arrivee',
            remarque: data.remarque || '',
          });

          if (data.employe) {
            await loadContratsForEmploye(data.employe);
          }

        } catch (error) {
          console.error('❌ Erreur chargement pointage:', error);
          setMessageType('error');
          setMessage('Erreur lors du chargement du pointage');
        } finally {
          setLoadingData(false);
        }
      };
      loadPointage();
    } else {
      setLoadingData(false);
    }
  }, [id, isEdit, navigate, loadContratsForEmploye]);

  useEffect(() => {
    loadRelations();
  }, []);

  // Quand l'employé change, charger ses contrats
  useEffect(() => {
    if (formData.employe) {
      loadContratsForEmploye(formData.employe);
    } else {
      setContrats([]);
    }
  }, [formData.employe, loadContratsForEmploye]);

  // Quand la connexion change, recharger les contrats
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
      type_pointage: 'arrivee',
      remarque: '',
    });
    setContrats([]);
  };

  // ✅ GÉNÉRER L'ID DE L'OPÉRATION
  const generateOperationId = () => {
    return Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9);
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

      const pointageData = {
        employe: parseInt(formData.employe),
        contrat: formData.contrat ? parseInt(formData.contrat) : null,
        projet: formData.projet ? parseInt(formData.projet) : null,
        tache: formData.tache || '',
        type_pointage: formData.type_pointage,
        remarque: formData.remarque || '',
      };

      let response;
      try {
        if (isEdit) {
          response = await AxiosInstance.put(`/pointages/${id}/`, pointageData, {
            headers: { Authorization: `Token ${token}` }
          });
        } else {
          response = await AxiosInstance.post('/pointages/', pointageData, {
            headers: { Authorization: `Token ${token}` }
          });
        }

        setMessageType('success');
        setMessage(isEdit ? '✅ Pointage modifié avec succès' : '✅ Pointage créé avec succès');
        
        if (!isEdit) resetForm();
        setTimeout(() => navigate('/pointages'), 1500);

      } catch (error) {
        console.error('❌ Erreur API:', error);

        // ✅ Sauvegarde OFFLINE
        if (error.message === 'Network Error' || error.code === 'ERR_NETWORK' || !navigator.onLine) {
          try {
            const operationId = generateOperationId();
            const operation = {
              id: operationId,
              type: isEdit ? 'UPDATE_POINTAGE' : 'CREATE_POINTAGE',
              data: formData,
              pointageId: isEdit ? id : undefined,
              timestamp: new Date().toISOString(),
              endpoint: isEdit ? `/pointages/${id}/` : '/pointages/',
              method: isEdit ? 'PUT' : 'POST'
            };
            
            // Sauvegarder l'opération
            const pendingOps = await cacheService.getPendingOperations();
            pendingOps.push(operation);
            await cacheService.db.setItem('pendingOperations', pendingOps);
            
            setMessageType('warning');
            setMessage('💾 Sauvegardé localement - Sync auto à la reconnexion');
            
            if (!isEdit) resetForm();
            setTimeout(() => navigate('/pointages'), 2000);
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
        
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-base-200 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/pointages')}
              className="btn btn-ghost btn-sm btn-square"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="p-2 bg-primary/10 rounded-xl">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold">
              {isEdit ? 'Modifier le pointage' : 'Nouveau pointage'}
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
              onClick={() => navigate('/pointages')}
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
              <Clock className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-base-content">Informations du pointage</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              
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
                  <p className="text-xs text-warning mt-1">⚠️ Aucun contrat trouvé pour cet employé</p>
                )}
                {!isOnline && contrats.length > 0 && (
                  <p className="text-xs text-info mt-1">💾 {contrats.length} contrat(s) depuis le cache</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  <Timer className="w-4 h-4 inline mr-1.5" />
                  Type de pointage <span className="text-error">*</span>
                </label>
                <select 
                  name="type_pointage" 
                  value={formData.type_pointage}
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

              <div className="col-span-full">
                <label className="block text-sm font-medium mb-1">
                  Tâche
                </label>
                <input 
                  name="tache" 
                  value={formData.tache}
                  onChange={handleChange}
                  className="input input-bordered w-full" 
                  placeholder="Tâche associée"
                />
              </div>

              <div className="col-span-full">
                <label className="block text-sm font-medium mb-1">
                  Remarque
                </label>
                <textarea 
                  name="remarque" 
                  value={formData.remarque}
                  onChange={handleChange}
                  className="textarea textarea-bordered w-full" 
                  rows="2"
                  placeholder="Remarque éventuelle..."
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
              onClick={() => navigate('/pointages')}
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

export default PointageForm;