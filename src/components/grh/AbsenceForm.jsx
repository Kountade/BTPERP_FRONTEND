// src/components/rh/AbsenceForm.jsx
// Formulaire d'absence

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  UserMinus, Save, X, RefreshCw, Wifi, WifiOff, AlertTriangle,
  UserCircle, Calendar, ChevronLeft, FileText,
  Clock, Users, CheckCircle, Loader2
} from 'lucide-react';
import AxiosInstance from '../AxiosInstance';
import cacheService from '../../services/CacheService';

function AbsenceForm() {
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
  const [contrats, setContrats] = useState([]);
  
  // FORMULAIRE
  const [formData, setFormData] = useState({
    employe: '',
    contrat: '',
    type_absence: 'cp',
    date_debut: new Date().toISOString().split('T')[0],
    date_fin: new Date().toISOString().split('T')[0],
    motif: '',
    justificatif: null,
  });

  // Options
  const TYPE_CHOICES = [
    { value: 'cp', label: 'Congés payés' },
    { value: 'rtt', label: 'RTT' },
    { value: 'maladie', label: 'Maladie' },
    { value: 'accident', label: 'Accident du travail' },
    { value: 'maternite', label: 'Maternité' },
    { value: 'sans_solde', label: 'Sans solde' },
    { value: 'formation', label: 'Formation' },
    { value: 'autre', label: 'Autre' }
  ];

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

      const employesRes = await AxiosInstance.get('/employes/', { 
        headers: { Authorization: `Token ${token}` } 
      });

      setEmployes(employesRes.data || []);
      await cacheService.db.setItem('employes_cache', employesRes.data || []);

    } catch (error) {
      console.error('❌ Erreur chargement relations:', error);
      await loadFromCache();
    } finally {
      setLoadingRelations(false);
    }
  };

  // Charger les données si édition
  useEffect(() => {
    if (isEdit) {
      const loadAbsence = async () => {
        setLoadingData(true);
        try {
          const token = localStorage.getItem('Token');
          if (!token) {
            navigate('/login');
            return;
          }

          const response = await AxiosInstance.get(`/absences/${id}/`, {
            headers: { Authorization: `Token ${token}` }
          });
          
          const data = response.data;
          setFormData({
            employe: data.employe || '',
            contrat: data.contrat || '',
            type_absence: data.type_absence || 'cp',
            date_debut: data.date_debut || new Date().toISOString().split('T')[0],
            date_fin: data.date_fin || new Date().toISOString().split('T')[0],
            motif: data.motif || '',
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
      loadAbsence();
    } else {
      setLoadingData(false);
    }
  }, [id, isEdit, navigate]);

  // Charger les relations au montage
  useEffect(() => {
    loadRelations();
  }, []);

  // Charger les contrats d'un employé
  useEffect(() => {
    const loadContrats = async () => {
      if (!formData.employe) {
        setContrats([]);
        return;
      }

      try {
        const token = localStorage.getItem('Token');
        if (!token) return;

        const response = await AxiosInstance.get(`/employes/${formData.employe}/contrats/`, {
          headers: { Authorization: `Token ${token}` }
        });
        setContrats(response.data || []);
      } catch (error) {
        console.error('❌ Erreur chargement contrats:', error);
        setContrats([]);
      }
    };

    loadContrats();
  }, [formData.employe]);

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
      type_absence: 'cp',
      date_debut: new Date().toISOString().split('T')[0],
      date_fin: new Date().toISOString().split('T')[0],
      motif: '',
      justificatif: null,
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

      const dataToSend = new FormData();
      dataToSend.append('employe', parseInt(formData.employe));
      if (formData.contrat) dataToSend.append('contrat', parseInt(formData.contrat));
      dataToSend.append('type_absence', formData.type_absence);
      dataToSend.append('date_debut', formData.date_debut);
      dataToSend.append('date_fin', formData.date_fin);
      dataToSend.append('motif', formData.motif || '');
      if (formData.justificatif) {
        dataToSend.append('justificatif', formData.justificatif);
      }

      let response;
      if (isEdit) {
        response = await AxiosInstance.put(`/absences/${id}/`, dataToSend, {
          headers: { 
            Authorization: `Token ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        response = await AxiosInstance.post('/absences/', dataToSend, {
          headers: { 
            Authorization: `Token ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      setMessageType('success');
      setMessage(isEdit ? '✅ Absence modifiée avec succès' : '✅ Absence créée avec succès');
      
      if (!isEdit) resetForm();
      setTimeout(() => navigate('/absences'), 1500);

    } catch (error) {
      console.error('❌ Erreur:', error);

      if (error.message === 'Network Error' || error.code === 'ERR_NETWORK' || !navigator.onLine) {
        try {
          await cacheService.addPendingOperation({
            type: isEdit ? 'UPDATE_ABSENCE' : 'CREATE_ABSENCE',
            data: formData,
            absenceId: isEdit ? id : undefined
          });
          setMessageType('warning');
          setMessage('💾 Sauvegardé localement - Sync auto à la reconnexion');
          if (!isEdit) resetForm();
          setTimeout(() => navigate('/absences'), 2000);
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
              onClick={() => navigate('/absences')}
              className="btn btn-ghost btn-sm btn-square"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="p-2 bg-primary/10 rounded-xl">
              <UserMinus className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold">
              {isEdit ? 'Modifier l\'absence' : 'Nouvelle absence'}
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
              onClick={() => navigate('/absences')}
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
              <UserMinus className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-base-content">Informations de l'absence</h3>
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
                    </option>
                  ))}
                </select>
              </div>

              {/* Type d'absence */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  <FileText className="w-4 h-4 inline mr-1.5" />
                  Type d'absence <span className="text-error">*</span>
                </label>
                <select 
                  name="type_absence" 
                  value={formData.type_absence}
                  onChange={handleChange}
                  className="select select-bordered w-full"
                  required
                >
                  {TYPE_CHOICES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
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

              {/* Motif - colonne entière */}
              <div className="col-span-full">
                <label className="block text-sm font-medium mb-1">
                  <FileText className="w-4 h-4 inline mr-1.5" />
                  Motif
                </label>
                <textarea 
                  name="motif" 
                  value={formData.motif}
                  onChange={handleChange}
                  className="textarea textarea-bordered w-full" 
                  rows="3"
                  placeholder="Détail du motif..."
                />
              </div>

              {/* Justificatif */}
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
              {loading ? 'En cours...' : (isEdit ? 'Modifier' : 'Créer')}
            </button>
            
            <button 
              type="button" 
              className="btn btn-ghost gap-2"
              onClick={() => navigate('/absences')}
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

export default AbsenceForm;