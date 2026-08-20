// src/components/rh/FormationForm.jsx
// Formulaire des formations - Version corrigée

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  GraduationCap, Save, X, RefreshCw, Wifi, WifiOff, AlertTriangle,
  UserCircle, Calendar, ChevronLeft, Loader2,
  DollarSign, Clock, FileText, CheckCircle, Building2
} from 'lucide-react';
import AxiosInstance from '../AxiosInstance';
import cacheService from '../../services/CacheService';
import { saveOffline } from '../../services/syncService';

function FormationForm() {
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
  
  const [formData, setFormData] = useState({
    employe: '',
    contrat: '',
    nom: '',
    organisme: '',
    date_debut: new Date().toISOString().split('T')[0],
    date_fin: new Date().toISOString().split('T')[0],
    duree_heures: '',
    cout: '',
    certificat: '',
    valide: false,
  });

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      console.log('📶 Connexion rétablie');
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
      
      const cachedContrats = await cacheService.getCachedContrats();
      if (cachedContrats && cachedContrats.length > 0) {
        setContrats(cachedContrats);
        console.log('💾 Contrats depuis le cache:', cachedContrats.length);
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
      const loadFormation = async () => {
        setLoadingData(true);
        try {
          const token = localStorage.getItem('Token');
          if (!token) {
            navigate('/login');
            return;
          }

          const response = await AxiosInstance.get(`/formations/${id}/`, {
            headers: { Authorization: `Token ${token}` }
          });
          
          const data = response.data;
          setFormData({
            employe: data.employe || '',
            contrat: data.contrat || '',
            nom: data.nom || '',
            organisme: data.organisme || '',
            date_debut: data.date_debut || new Date().toISOString().split('T')[0],
            date_fin: data.date_fin || new Date().toISOString().split('T')[0],
            duree_heures: data.duree_heures || '',
            cout: data.cout || '',
            certificat: data.certificat || '',
            valide: data.valide || false,
          });

        } catch (error) {
          console.error('❌ Erreur chargement:', error);
          setMessageType('error');
          setMessage('Erreur lors du chargement');
        } finally {
          setLoadingData(false);
        }
      };
      loadFormation();
    } else {
      setLoadingData(false);
    }
  }, [id, isEdit, navigate]);

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
      employe: '',
      contrat: '',
      nom: '',
      organisme: '',
      date_debut: new Date().toISOString().split('T')[0],
      date_fin: new Date().toISOString().split('T')[0],
      duree_heures: '',
      cout: '',
      certificat: '',
      valide: false,
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
        nom: formData.nom,
        organisme: formData.organisme,
        date_debut: formData.date_debut,
        date_fin: formData.date_fin,
        duree_heures: parseInt(formData.duree_heures) || 0,
        cout: parseFloat(formData.cout) || 0,
        certificat: formData.certificat || '',
        valide: formData.valide,
      };

      let response;
      try {
        if (isEdit) {
          response = await AxiosInstance.put(`/formations/${id}/`, dataToSend, {
            headers: { Authorization: `Token ${token}` }
          });
        } else {
          response = await AxiosInstance.post('/formations/', dataToSend, {
            headers: { Authorization: `Token ${token}` }
          });
        }

        setMessageType('success');
        setMessage(isEdit ? '✅ Formation modifiée avec succès' : '✅ Formation créée avec succès');
        
        if (!isEdit) resetForm();
        setTimeout(() => navigate('/formations'), 1500);

      } catch (error) {
        console.error('❌ Erreur API:', error);

        if (error.message === 'Network Error' || error.code === 'ERR_NETWORK' || !navigator.onLine) {
          try {
            const result = await saveOffline('/formations/', 'POST', dataToSend);
            
            console.log('💾 Sauvegardé offline via syncService:', result);
            
            setMessageType('warning');
            setMessage('💾 Sauvegardé localement - Sync auto à la reconnexion');
            if (!isEdit) resetForm();
            setTimeout(() => navigate('/formations'), 2000);
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
        
        {/* En-tête */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-base-200 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/formations')}
              className="btn btn-ghost btn-sm btn-square"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="p-2 bg-primary/10 rounded-xl">
              <GraduationCap className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold">
              {isEdit ? 'Modifier la formation' : 'Nouvelle formation'}
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
              onClick={() => navigate('/formations')}
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
              <GraduationCap className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-base-content">Informations de la formation</h3>
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

              {/* Contrat */}
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

              {/* Nom de la formation */}
              <div className="col-span-full">
                <label className="block text-sm font-medium mb-1">
                  <GraduationCap className="w-4 h-4 inline mr-1.5" />
                  Nom de la formation <span className="text-error">*</span>
                </label>
                <input 
                  name="nom" 
                  value={formData.nom}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="Ex: Formation Sécurité BTP"
                  required
                />
              </div>

              {/* Organisme */}
              <div className="col-span-full">
                <label className="block text-sm font-medium mb-1">
                  <Building2 className="w-4 h-4 inline mr-1.5" />
                  Organisme formateur <span className="text-error">*</span>
                </label>
                <input 
                  name="organisme" 
                  value={formData.organisme}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="Ex: INRS, AFPA, CNAM"
                  required
                />
              </div>

              {/* Date début */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  <Calendar className="w-4 h-4 inline mr-1.5" />
                  Date début <span className="text-error">*</span>
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

              {/* Date fin */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  <Calendar className="w-4 h-4 inline mr-1.5" />
                  Date fin <span className="text-error">*</span>
                </label>
                <input 
                  name="date_fin" 
                  type="date"
                  value={formData.date_fin}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  required 
                />
              </div>

              {/* Durée heures */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  <Clock className="w-4 h-4 inline mr-1.5" />
                  Durée (heures) <span className="text-error">*</span>
                </label>
                <input 
                  name="duree_heures" 
                  type="number"
                  value={formData.duree_heures}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="0"
                  required
                />
              </div>

              {/* Coût */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  <DollarSign className="w-4 h-4 inline mr-1.5" />
                  Coût (€)
                </label>
                <input 
                  name="cout" 
                  type="number"
                  step="0.01"
                  value={formData.cout}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="0.00"
                />
              </div>

              {/* Certificat */}
              <div className="col-span-full">
                <label className="block text-sm font-medium mb-1">
                  <FileText className="w-4 h-4 inline mr-1.5" />
                  Certificat obtenu
                </label>
                <input 
                  name="certificat" 
                  value={formData.certificat}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="Ex: Certificat SST, CACES..."
                />
              </div>

              {/* Validé */}
              <div className="flex items-center gap-2 pt-2">
                <input 
                  name="valide" 
                  type="checkbox"
                  checked={formData.valide}
                  onChange={handleChange}
                  className="checkbox checkbox-success"
                />
                <label className="text-sm font-medium">
                  <CheckCircle className="w-4 h-4 inline mr-1.5" />
                  Formation validée
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
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {loading ? 'En cours...' : (isEdit ? 'Modifier' : 'Créer')}
            </button>
            
            <button 
              type="button" 
              className="btn btn-ghost gap-2"
              onClick={() => navigate('/formations')}
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

export default FormationForm;