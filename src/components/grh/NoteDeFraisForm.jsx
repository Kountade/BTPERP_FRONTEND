// src/components/rh/NoteDeFraisForm.jsx
// Formulaire des notes de frais

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Receipt, Save, X, RefreshCw, Wifi, WifiOff, AlertTriangle,
  UserCircle, Building2, Calendar, ChevronLeft,
  DollarSign, FileText, Loader2, CheckCircle
} from 'lucide-react';
import AxiosInstance from '../AxiosInstance';
import cacheService from '../../services/CacheService';
import { saveOffline } from '../../services/syncService';

function NoteDeFraisForm() {
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
  const [projets, setProjets] = useState([]);
  const [contrats, setContrats] = useState([]);
  
  const [formData, setFormData] = useState({
    employe: '',
    contrat: '',
    projet: '',
    date: new Date().toISOString().split('T')[0],
    type_frais: 'repas',
    montant: '',
    description: '',
    justificatif: null,
  });

  const TYPE_CHOICES = [
    { value: 'peage', label: 'Péage' },
    { value: 'carburant', label: 'Carburant' },
    { value: 'repas', label: 'Repas' },
    { value: 'hebergement', label: 'Hébergement' },
    { value: 'transport', label: 'Transport' },
    { value: 'materiel', label: 'Petit matériel' },
    { value: 'autre', label: 'Autre' }
  ];

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      await loadRelations();
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

  const loadFromCache = async () => {
    try {
      const cachedEmployes = await cacheService.getCachedEmployes();
      if (cachedEmployes) setEmployes(cachedEmployes);
      
      const cachedProjets = await cacheService.getCachedProjets();
      if (cachedProjets) setProjets(cachedProjets);
      
      const cachedContrats = await cacheService.getCachedContrats();
      if (cachedContrats) setContrats(cachedContrats);
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

      const [employesRes, projetsRes, contratsRes] = await Promise.all([
        AxiosInstance.get('/employes/', { headers: { Authorization: `Token ${token}` } }),
        AxiosInstance.get('/projets/', { headers: { Authorization: `Token ${token}` } }),
        AxiosInstance.get('/contrats/', { headers: { Authorization: `Token ${token}` } })
      ]);

      setEmployes(employesRes.data || []);
      setProjets(projetsRes.data || []);
      setContrats(contratsRes.data || []);

      await cacheService.cacheEmployes(employesRes.data || []);
      await cacheService.cacheProjets(projetsRes.data || []);
      await cacheService.cacheContrats(contratsRes.data || []);

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
      const loadNote = async () => {
        setLoadingData(true);
        try {
          const token = localStorage.getItem('Token');
          if (!token) {
            navigate('/login');
            return;
          }

          const response = await AxiosInstance.get(`/notes-frais/${id}/`, {
            headers: { Authorization: `Token ${token}` }
          });
          
          const data = response.data;
          setFormData({
            employe: data.employe || '',
            contrat: data.contrat || '',
            projet: data.projet || '',
            date: data.date || new Date().toISOString().split('T')[0],
            type_frais: data.type_frais || 'repas',
            montant: data.montant || '',
            description: data.description || '',
            justificatif: null,
          });

        } catch (error) {
          console.error('❌ Erreur chargement:', error);
          setMessageType('error');
          setMessage('Erreur lors du chargement');
        } finally {
          setLoadingData(false);
        }
      };
      loadNote();
    } else {
      setLoadingData(false);
    }
  }, [id, isEdit, navigate]);

  useEffect(() => {
    loadRelations();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const resetForm = () => {
    setFormData({
      employe: '',
      contrat: '',
      projet: '',
      date: new Date().toISOString().split('T')[0],
      type_frais: 'repas',
      montant: '',
      description: '',
      justificatif: null,
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

      const dataToSend = new FormData();
      dataToSend.append('employe', parseInt(formData.employe));
      if (formData.contrat) dataToSend.append('contrat', parseInt(formData.contrat));
      if (formData.projet) dataToSend.append('projet', parseInt(formData.projet));
      dataToSend.append('date', formData.date);
      dataToSend.append('type_frais', formData.type_frais);
      dataToSend.append('montant', parseFloat(formData.montant) || 0);
      dataToSend.append('description', formData.description || '');
      if (formData.justificatif) {
        dataToSend.append('justificatif', formData.justificatif);
      }

      let response;
      try {
        if (isEdit) {
          response = await AxiosInstance.put(`/notes-frais/${id}/`, dataToSend, {
            headers: { 
              Authorization: `Token ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          });
        } else {
          response = await AxiosInstance.post('/notes-frais/', dataToSend, {
            headers: { 
              Authorization: `Token ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          });
        }

        setMessageType('success');
        setMessage(isEdit ? '✅ Note modifiée avec succès' : '✅ Note créée avec succès');
        
        if (!isEdit) resetForm();
        setTimeout(() => navigate('/notes-frais'), 1500);

      } catch (error) {
        console.error('❌ Erreur API:', error);

        if (error.message === 'Network Error' || error.code === 'ERR_NETWORK' || !navigator.onLine) {
          try {
            await saveOffline('/notes-frais/', 'POST', {
              employe: parseInt(formData.employe),
              contrat: formData.contrat ? parseInt(formData.contrat) : null,
              projet: formData.projet ? parseInt(formData.projet) : null,
              date: formData.date,
              type_frais: formData.type_frais,
              montant: parseFloat(formData.montant) || 0,
              description: formData.description || '',
            });
            
            setMessageType('warning');
            setMessage('💾 Sauvegardé localement - Sync auto à la reconnexion');
            if (!isEdit) resetForm();
            setTimeout(() => navigate('/notes-frais'), 2000);
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
              onClick={() => navigate('/notes-frais')}
              className="btn btn-ghost btn-sm btn-square"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="p-2 bg-primary/10 rounded-xl">
              <Receipt className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold">
              {isEdit ? 'Modifier la note de frais' : 'Nouvelle note de frais'}
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
              onClick={() => navigate('/notes-frais')}
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
              <Receipt className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-base-content">Informations de la note</h3>
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

              <div>
                <label className="block text-sm font-medium mb-1">
                  <FileText className="w-4 h-4 inline mr-1.5" />
                  Type de frais <span className="text-error">*</span>
                </label>
                <select 
                  name="type_frais" 
                  value={formData.type_frais}
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
                  <DollarSign className="w-4 h-4 inline mr-1.5" />
                  Montant (€) <span className="text-error">*</span>
                </label>
                <input 
                  name="montant" 
                  type="number"
                  step="0.01"
                  value={formData.montant}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="0.00"
                  required
                />
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
                  <FileText className="w-4 h-4 inline mr-1.5" />
                  Description <span className="text-error">*</span>
                </label>
                <textarea 
                  name="description" 
                  value={formData.description}
                  onChange={handleChange}
                  className="textarea textarea-bordered w-full" 
                  rows="3"
                  placeholder="Description détaillée du frais..."
                  required
                />
              </div>

              <div className="col-span-full">
                <label className="block text-sm font-medium mb-1">
                  📎 Justificatif
                </label>
                <input 
                  name="justificatif" 
                  type="file"
                  onChange={handleChange}
                  className="file-input file-input-bordered w-full" 
                />
                <p className="text-xs text-base-content/40 mt-1">
                  Formats acceptés: PDF, JPG, PNG (max 5MB)
                </p>
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
              onClick={() => navigate('/notes-frais')}
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

export default NoteDeFraisForm;