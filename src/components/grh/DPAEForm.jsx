// src/components/rh/DPAEForm.jsx
// Formulaire DPAE - Version corrigée

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FileText, Save, X, RefreshCw, Wifi, WifiOff, AlertTriangle,
  UserCircle, Calendar, ChevronLeft, Loader2,
  CheckCircle, Users, Send
} from 'lucide-react';
import AxiosInstance from '../AxiosInstance';
import cacheService from '../../services/CacheService';
import { saveOffline } from '../../services/syncService';

function DPAEForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingRelations, setLoadingRelations] = useState(true);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('info');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const [employes, setEmployes] = useState([]);
  const [contrats, setContrats] = useState([]);
  const [generatedNumber, setGeneratedNumber] = useState('');
  
  const [formData, setFormData] = useState({
    employe: '',
    contrat: '',
    date_embauche: new Date().toISOString().split('T')[0],
    date_fin_contrat: '',
    motif_embauche: '',
  });

  // Surveiller la connexion
  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      console.log('📶 Connexion rétablie');
      await loadRelations();
      // ✅ Générer un numéro si en ligne
      if (!isEdit) {
        await generateNumber();
      }
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

  // Charger depuis le cache
  const loadFromCache = async () => {
    try {
      console.log('📡 Chargement depuis le cache...');
      
      const cachedEmployes = await cacheService.getCachedEmployes();
      if (cachedEmployes && cachedEmployes.length > 0) {
        setEmployes(cachedEmployes);
        console.log('💾 Employés depuis le cache:', cachedEmployes.length);
      }
      
      const cachedContrats = await cacheService.getCachedContrats();
      if (cachedContrats && cachedContrats.length > 0) {
        setContrats(cachedContrats);
        console.log('💾 Contrats depuis le cache:', cachedContrats.length);
      }
    } catch (error) {
      console.error('❌ Erreur chargement cache:', error);
    }
  };

  // Charger les relations
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

      const [employesRes, contratsRes] = await Promise.all([
        AxiosInstance.get('/employes/', { headers: { Authorization: `Token ${token}` } }),
        AxiosInstance.get('/contrats/', { headers: { Authorization: `Token ${token}` } })
      ]);

      const employesData = employesRes.data || [];
      const contratsData = contratsRes.data || [];

      console.log('📊 API - Employés:', employesData.length);
      console.log('📊 API - Contrats:', contratsData.length);

      setEmployes(employesData);
      setContrats(contratsData);

      await cacheService.cacheEmployes(employesData);
      await cacheService.cacheContrats(contratsData);
      console.log('✅ Données sauvegardées en cache');

    } catch (error) {
      console.error('❌ Erreur chargement relations:', error);
      await loadFromCache();
    } finally {
      setLoadingRelations(false);
    }
  };

  // ✅ Générer le numéro DPAE (UNIQUEMENT en ligne)
  const generateNumber = async () => {
    try {
      const token = localStorage.getItem('Token');
      if (!token) {
        setGeneratedNumber('000001');
        return;
      }
      
      const response = await AxiosInstance.post('/dpae/generer_numero/', {}, {
        headers: { Authorization: `Token ${token}` }
      });
      
      if (response.data && response.data.numero) {
        setGeneratedNumber(response.data.numero);
        console.log('📝 Numéro généré:', response.data.numero);
      } else {
        setGeneratedNumber('000001');
      }
    } catch (error) {
      console.error('❌ Erreur génération numéro:', error);
      setGeneratedNumber('000001');
    }
  };

  // Charger les contrats d'un employé
  useEffect(() => {
    const loadContrats = async () => {
      if (!formData.employe) {
        setContrats([]);
        return;
      }

      if (navigator.onLine) {
        try {
          const token = localStorage.getItem('Token');
          if (!token) return;

          const response = await AxiosInstance.get(`/employes/${formData.employe}/contrats/`, {
            headers: { Authorization: `Token ${token}` }
          });
          setContrats(response.data || []);
          return;
        } catch (error) {
          console.error('❌ Erreur chargement contrats:', error);
        }
      }

      try {
        const cachedContrats = await cacheService.getCachedContrats();
        if (cachedContrats) {
          const filtered = cachedContrats.filter(c => c.employe === parseInt(formData.employe));
          setContrats(filtered);
          console.log('💾 Contrats filtrés depuis le cache:', filtered.length);
        }
      } catch (error) {
        console.error('❌ Erreur chargement contrats cache:', error);
        setContrats([]);
      }
    };

    loadContrats();
  }, [formData.employe]);

  useEffect(() => {
    if (isEdit) {
      const loadDpae = async () => {
        setLoadingData(true);
        try {
          const token = localStorage.getItem('Token');
          if (!token) {
            navigate('/login');
            return;
          }

          const response = await AxiosInstance.get(`/dpae/${id}/`, {
            headers: { Authorization: `Token ${token}` }
          });
          
          const data = response.data;
          setFormData({
            employe: data.employe || '',
            contrat: data.contrat || '',
            date_embauche: data.date_embauche || new Date().toISOString().split('T')[0],
            date_fin_contrat: data.date_fin_contrat || '',
            motif_embauche: data.motif_embauche || '',
          });
          setGeneratedNumber(data.numero);

        } catch (error) {
          console.error('❌ Erreur chargement:', error);
          setMessageType('error');
          setMessage('Erreur lors du chargement');
        } finally {
          setLoadingData(false);
        }
      };
      loadDpae();
    } else {
      setLoadingData(false);
      // ✅ Générer le numéro uniquement si en ligne
      if (navigator.onLine) {
        generateNumber();
      } else {
        setGeneratedNumber('OFFLINE_' + Date.now().toString());
      }
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
      employe: '',
      contrat: '',
      date_embauche: new Date().toISOString().split('T')[0],
      date_fin_contrat: '',
      motif_embauche: '',
    });
    if (navigator.onLine) {
      generateNumber();
    } else {
      setGeneratedNumber('OFFLINE_' + Date.now().toString());
    }
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

      // ✅ Préparer les données SANS le numéro (le backend le génère)
      const dataToSend = {
        employe: parseInt(formData.employe),
        contrat: formData.contrat ? parseInt(formData.contrat) : null,
        date_embauche: formData.date_embauche,
        date_fin_contrat: formData.date_fin_contrat || null,
        motif_embauche: formData.motif_embauche || '',
      };

      // ✅ Si hors ligne, sauvegarder avec syncService
      if (!navigator.onLine) {
        try {
          const result = await saveOffline('/dpae/', 'POST', {
            ...dataToSend,
            numero: generatedNumber || 'OFFLINE_' + Date.now().toString(),
          });
          
          console.log('💾 Sauvegardé offline via syncService:', result);
          
          setMessageType('warning');
          setMessage('💾 Sauvegardé localement - Sync auto à la reconnexion');
          if (!isEdit) resetForm();
          setTimeout(() => navigate('/dpae'), 2000);
        } catch (cacheError) {
          console.error('❌ Erreur sauvegarde locale:', cacheError);
          setMessageType('error');
          setMessage('❌ Erreur lors de la sauvegarde locale');
        }
        setLoading(false);
        return;
      }

      // ✅ Si en ligne, envoyer à l'API (SANS numéro)
      let response;
      try {
        if (isEdit) {
          response = await AxiosInstance.put(`/dpae/${id}/`, dataToSend, {
            headers: { Authorization: `Token ${token}` }
          });
        } else {
          response = await AxiosInstance.post('/dpae/', dataToSend, {
            headers: { Authorization: `Token ${token}` }
          });
        }

        setMessageType('success');
        setMessage(isEdit ? '✅ DPAE modifiée avec succès' : '✅ DPAE créée avec succès');
        
        if (!isEdit) resetForm();
        setTimeout(() => navigate('/dpae'), 1500);

      } catch (error) {
        console.error('❌ Erreur API:', error);

        // ✅ Fallback offline si l'API échoue
        if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
          try {
            const result = await saveOffline('/dpae/', 'POST', {
              ...dataToSend,
              numero: generatedNumber || 'OFFLINE_' + Date.now().toString(),
            });
            
            console.log('💾 Sauvegardé offline via syncService:', result);
            
            setMessageType('warning');
            setMessage('💾 Sauvegardé localement - Sync auto à la reconnexion');
            if (!isEdit) resetForm();
            setTimeout(() => navigate('/dpae'), 2000);
          } catch (cacheError) {
            console.error('❌ Erreur sauvegarde locale:', cacheError);
            setMessageType('error');
            setMessage('❌ Erreur lors de la sauvegarde locale');
          }
          setLoading(false);
          return;
        }

        // Gestion des erreurs 400 (validation)
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
              onClick={() => navigate('/dpae')}
              className="btn btn-ghost btn-sm btn-square"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="p-2 bg-primary/10 rounded-xl">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold">
              {isEdit ? 'Modifier la DPAE' : 'Nouvelle DPAE'}
            </h2>
            {generatedNumber && !isEdit && (
              <span className="badge badge-primary badge-sm">
                N° {generatedNumber}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            <div className={`badge ${isOnline ? 'badge-success' : 'badge-error'} gap-1.5 px-3 py-2.5`}>
              {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              {isOnline ? 'En ligne' : 'Hors ligne'}
            </div>
            <button 
              type="button" 
              className="btn btn-ghost btn-sm gap-1"
              onClick={() => navigate('/dpae')}
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
              <FileText className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-base-content">Informations DPAE</h3>
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
                {!isOnline && contrats.length > 0 && (
                  <p className="text-xs text-info mt-1">💾 {contrats.length} contrat(s) depuis le cache</p>
                )}
              </div>

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

              <div className="col-span-full">
                <label className="block text-sm font-medium mb-1">
                  <FileText className="w-4 h-4 inline mr-1.5" />
                  Motif de l'embauche <span className="text-error">*</span>
                </label>
                <textarea 
                  name="motif_embauche" 
                  value={formData.motif_embauche}
                  onChange={handleChange}
                  className="textarea textarea-bordered w-full" 
                  rows="3"
                  placeholder="Motif de l'embauche..."
                  required
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
              onClick={() => navigate('/dpae')}
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

export default DPAEForm;