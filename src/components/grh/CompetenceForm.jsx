// src/components/rh/CompetenceForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Award, 
  Save, 
  X, 
  RefreshCw,
  Wifi,
  WifiOff,
  AlertTriangle,
  BookOpen,
  CheckCircle,
  Users,
  Briefcase
} from 'lucide-react';

// ✅ IMPORT CORRECT - remonter d'un dossier
import AxiosInstance from '../AxiosInstance';

function CompetenceForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('info');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    categorie: ''
  });

  // Catégories disponibles
  const CATEGORIES = [
    'Technique',
    'Sécurité',
    'Management',
    'Informatique',
    'Administratif',
    'BTP',
    'Conduite',
    'Maintenance',
    'Qualité',
    'Environnement',
    'Ressources Humaines',
    'Commercial',
    'Financier',
    'Logistique'
  ];

  // Surveiller la connexion
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Charger les données si édition
  useEffect(() => {
    if (isEdit) {
      const loadCompetence = async () => {
        setLoadingData(true);
        try {
          const token = localStorage.getItem('Token');
          if (!token) {
            navigate('/login');
            return;
          }
          const response = await AxiosInstance.get(`/competences/${id}/`, {
            headers: { Authorization: `Token ${token}` }
          });
          const data = response.data;
          setFormData({
            nom: data.nom || '',
            description: data.description || '',
            categorie: data.categorie || ''
          });
        } catch (error) {
          console.error('Erreur chargement:', error);
          setMessageType('error');
          setMessage('Erreur lors du chargement');
        } finally {
          setLoadingData(false);
        }
      };
      loadCompetence();
    } else {
      setLoadingData(false);
    }
  }, [id, isEdit, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      description: '',
      categorie: ''
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

      const dataToSend = { ...formData };

      let response;
      if (isEdit) {
        response = await AxiosInstance.put(`/competences/${id}/`, dataToSend, {
          headers: { Authorization: `Token ${token}` }
        });
      } else {
        response = await AxiosInstance.post('/competences/', dataToSend, {
          headers: { Authorization: `Token ${token}` }
        });
      }

      if (response.data && response.data.offline) {
        setMessageType('warning');
        setMessage('💾 Sauvegardé localement - Sync auto à la reconnexion');
        if (!isEdit) resetForm();
      } else {
        setMessageType('success');
        setMessage(isEdit ? '✅ Compétence modifiée avec succès' : '✅ Compétence créée avec succès');
        if (!isEdit) resetForm();
        setTimeout(() => navigate('/competences'), 1500);
      }

    } catch (error) {
      console.error('Erreur:', error);

      if (error.message === 'Network Error' || error.code === 'ERR_NETWORK' || !navigator.onLine) {
        setMessageType('warning');
        setMessage('💾 Sauvegardé localement - Sync auto à la reconnexion');
        if (!isEdit) resetForm();
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
      } else if (error.response?.status === 500) {
        setMessageType('error');
        setMessage('⚠️ Erreur serveur');
      } else {
        setMessageType('error');
        setMessage(`❌ ${error.message || 'Erreur inconnue'}`);
      }
    }
    setLoading(false);
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="mt-4 text-base-content/60">Chargement...</p>
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
              <Award className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold">
              {isEdit ? 'Modifier la compétence' : 'Nouvelle compétence'}
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
              onClick={() => navigate('/competences')}
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
            <span>Hors ligne - Sauvegarde locale automatique</span>
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-3 max-w-2xl mx-auto">
          <div className="grid grid-cols-1 gap-4">
            
            {/* Nom */}
            <div>
              <label className="block text-sm font-medium mb-1">
                <Award className="w-4 h-4 inline mr-1.5" />
                Nom <span className="text-error">*</span>
              </label>
              <input 
                name="nom" 
                value={formData.nom}
                onChange={handleChange}
                className="input input-bordered w-full" 
                placeholder="Ex: Conduite d'engins"
                required 
              />
            </div>

            {/* Catégorie */}
            <div>
              <label className="block text-sm font-medium mb-1">
                <Briefcase className="w-4 h-4 inline mr-1.5" />
                Catégorie
              </label>
              <select 
                name="categorie" 
                value={formData.categorie}
                onChange={handleChange}
                className="select select-bordered w-full"
              >
                <option value="">Sélectionner une catégorie</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-1">
                <BookOpen className="w-4 h-4 inline mr-1.5" />
                Description
              </label>
              <textarea 
                name="description" 
                value={formData.description}
                onChange={handleChange}
                className="textarea textarea-bordered w-full h-32" 
                placeholder="Description détaillée de la compétence..."
              />
            </div>

            {/* Info */}
            <div className="text-xs text-base-content/40">
              <p>💡 Une compétence peut être requise pour un poste ou détenue par un employé.</p>
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
              onClick={() => navigate('/competences')}
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
              Sauvegarde locale - Synchronisation automatique à la reconnexion
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default CompetenceForm;