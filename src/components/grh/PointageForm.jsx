// src/components/rh/PointageForm.jsx
// Formulaire de pointage

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Clock, Save, X, RefreshCw, Wifi, WifiOff, AlertTriangle,
  UserCircle, Building2, Calendar, MapPin, FileText,
  ChevronLeft, Users, Timer, CheckCircle
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
  
  // DONNÉES POUR LES SELECTS
  const [employes, setEmployes] = useState([]);
  const [projets, setProjets] = useState([]);
  const [taches, setTaches] = useState([]);
  
  // FORMULAIRE
  const [formData, setFormData] = useState({
    employe: '',
    contrat: '',
    projet: '',
    tache: '',
    type_pointage: 'arrivee',
    latitude: '',
    longitude: '',
    remarque: '',
  });

  // Options
  const TYPE_CHOICES = [
    { value: 'arrivee', label: 'Arrivée' },
    { value: 'depart', label: 'Départ' },
    { value: 'pause', label: 'Pause' },
    { value: 'retour_pause', label: 'Retour de pause' },
    { value: 'heure_sup', label: 'Heure supplémentaire' }
  ];

  // Géolocalisation
  const [location, setLocation] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);

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

  // Charger depuis le cache
  const loadFromCache = async () => {
    try {
      const cachedEmployes = await cacheService.db.getItem('employes_cache');
      if (cachedEmployes) setEmployes(cachedEmployes);
      
      const cachedProjets = await cacheService.db.getItem('projets_cache');
      if (cachedProjets) setProjets(cachedProjets);
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

      const [employesRes, projetsRes] = await Promise.all([
        AxiosInstance.get('/employes/', { headers: { Authorization: `Token ${token}` } }),
        AxiosInstance.get('/projets/', { headers: { Authorization: `Token ${token}` } })
      ]);

      setEmployes(employesRes.data || []);
      setProjets(projetsRes.data || []);

      await cacheService.db.setItem('employes_cache', employesRes.data || []);
      await cacheService.db.setItem('projets_cache', projetsRes.data || []);

    } catch (error) {
      console.error('❌ Erreur chargement relations:', error);
      await loadFromCache();
    } finally {
      setLoadingRelations(false);
    }
  };

  // Charger le pointage si édition
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
            latitude: data.latitude || '',
            longitude: data.longitude || '',
            remarque: data.remarque || '',
          });

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
      // Obtenir la géolocalisation
      getCurrentLocation();
    }
  }, [id, isEdit, navigate]);

  // Charger les relations au montage
  useEffect(() => {
    loadRelations();
  }, []);

  // Obtenir la géolocalisation
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      console.log('Geolocation non supportée');
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        });
        setFormData(prev => ({
          ...prev,
          latitude: pos.coords.latitude.toString(),
          longitude: pos.coords.longitude.toString()
        }));
        setGettingLocation(false);
      },
      (err) => {
        console.error('Erreur géolocalisation:', err);
        setGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

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
      latitude: location?.latitude?.toString() || '',
      longitude: location?.longitude?.toString() || '',
      remarque: '',
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

      const pointageData = {
        employe: parseInt(formData.employe),
        contrat: formData.contrat ? parseInt(formData.contrat) : null,
        projet: formData.projet ? parseInt(formData.projet) : null,
        tache: formData.tache ? parseInt(formData.tache) : null,
        type_pointage: formData.type_pointage,
        latitude: formData.latitude || null,
        longitude: formData.longitude || null,
        remarque: formData.remarque || '',
      };

      let response;
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
      console.error('❌ Erreur:', error);

      if (error.message === 'Network Error' || error.code === 'ERR_NETWORK' || !navigator.onLine) {
        try {
          await cacheService.addPendingOperation({
            type: isEdit ? 'UPDATE_POINTAGE' : 'CREATE_POINTAGE',
            data: formData,
            pointageId: isEdit ? id : undefined
          });
          setMessageType('warning');
          setMessage('💾 Sauvegardé localement - Sync auto à la reconnexion');
          if (!isEdit) resetForm();
          setTimeout(() => navigate('/pointages'), 2000);
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
              <Clock className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-base-content">Informations du pointage</h3>
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
              </div>

              {/* Type de pointage */}
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
              <div>
                <label className="block text-sm font-medium mb-1">
                  <FileText className="w-4 h-4 inline mr-1.5" />
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

              {/* Latitude */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  <MapPin className="w-4 h-4 inline mr-1.5" />
                  Latitude
                </label>
                <input 
                  name="latitude" 
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={handleChange}
                  className="input input-bordered w-full" 
                  placeholder="Latitude"
                />
              </div>

              {/* Longitude */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  <MapPin className="w-4 h-4 inline mr-1.5" />
                  Longitude
                </label>
                <input 
                  name="longitude" 
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={handleChange}
                  className="input input-bordered w-full" 
                  placeholder="Longitude"
                />
              </div>

              {/* Bouton géolocalisation */}
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  className="btn btn-outline btn-sm gap-2"
                  disabled={gettingLocation}
                >
                  {gettingLocation ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : (
                    <MapPin className="w-4 h-4" />
                  )}
                  {gettingLocation ? 'Localisation...' : 'Obtenir la position'}
                </button>
                {location && (
                  <span className="text-xs text-success ml-2">
                    <CheckCircle className="w-3 h-3 inline mr-1" />
                    Position obtenue
                  </span>
                )}
              </div>

              {/* Remarque - colonne entière */}
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

export default PointageForm;