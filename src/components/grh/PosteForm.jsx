// src/components/rh/PosteForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Briefcase, 
  Save, 
  X, 
  RefreshCw,
  Wifi,
  WifiOff,
  AlertTriangle,
  Award,
  Shield,
  Users,
  BookOpen,
  CheckCircle,
  XCircle,
  Plus,
  Trash2
} from 'lucide-react';
import AxiosInstance from '../AxiosInstance';

function PosteForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('info');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [competences, setCompetences] = useState([]);
  const [formData, setFormData] = useState({
    nom: '',
    code: '',
    description: '',
    categorie: 'technicien',
    niveau: '',
    coefficient: '',
    competences_requises: []
  });

  // Catégories de postes
  const CATEGORIES = [
    { value: 'direction', label: 'Direction' },
    { value: 'maitrise', label: 'Maîtrise' },
    { value: 'technicien', label: 'Technicien' },
    { value: 'ouvrier', label: 'Ouvrier' },
    { value: 'administratif', label: 'Administratif' }
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

  // Charger les données
  useEffect(() => {
    const loadData = async () => {
      setLoadingData(true);
      try {
        const token = localStorage.getItem('Token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Charger les compétences
        const competencesRes = await AxiosInstance.get('/competences/', {
          headers: { Authorization: `Token ${token}` }
        });
        setCompetences(competencesRes.data || []);

        // Si édition, charger le poste
        if (isEdit) {
          const response = await AxiosInstance.get(`/postes/${id}/`, {
            headers: { Authorization: `Token ${token}` }
          });
          const data = response.data;
          setFormData({
            nom: data.nom || '',
            code: data.code || '',
            description: data.description || '',
            categorie: data.categorie || 'technicien',
            niveau: data.niveau || '',
            coefficient: data.coefficient || '',
            competences_requises: data.competences_requises || []
          });
        }
      } catch (error) {
        console.error('Erreur chargement:', error);
        setMessageType('error');
        setMessage('Erreur lors du chargement des données');
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [id, isEdit, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCompetenceToggle = (competenceId) => {
    setFormData(prev => {
      const current = prev.competences_requises || [];
      if (current.includes(competenceId)) {
        return {
          ...prev,
          competences_requises: current.filter(id => id !== competenceId)
        };
      } else {
        return {
          ...prev,
          competences_requises: [...current, competenceId]
        };
      }
    });
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      code: '',
      description: '',
      categorie: 'technicien',
      niveau: '',
      coefficient: '',
      competences_requises: []
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

      const dataToSend = {
        ...formData,
        coefficient: formData.coefficient ? parseInt(formData.coefficient) : null
      };

      let response;
      if (isEdit) {
        response = await AxiosInstance.put(`/postes/${id}/`, dataToSend, {
          headers: { Authorization: `Token ${token}` }
        });
      } else {
        response = await AxiosInstance.post('/postes/', dataToSend, {
          headers: { Authorization: `Token ${token}` }
        });
      }

      if (response.data && response.data.offline) {
        setMessageType('warning');
        setMessage('💾 Sauvegardé localement - Sync auto à la reconnexion');
        if (!isEdit) resetForm();
      } else {
        setMessageType('success');
        setMessage(isEdit ? '✅ Poste modifié avec succès' : '✅ Poste créé avec succès');
        if (!isEdit) resetForm();
        setTimeout(() => navigate('/postes'), 1500);
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
              <Briefcase className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold">
              {isEdit ? 'Modifier le poste' : 'Nouveau poste'}
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
              onClick={() => navigate('/postes')}
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
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            
            {/* Nom */}
            <div className="lg:col-span-1">
              <label className="block text-sm font-medium mb-1">
                <Briefcase className="w-4 h-4 inline mr-1.5" />
                Nom <span className="text-error">*</span>
              </label>
              <input 
                name="nom" 
                value={formData.nom}
                onChange={handleChange}
                className="input input-bordered w-full" 
                placeholder="Ex: Chef de Chantier"
                required 
              />
            </div>

            {/* Code */}
            <div>
              <label className="block text-sm font-medium mb-1">
                <Shield className="w-4 h-4 inline mr-1.5" />
                Code <span className="text-error">*</span>
              </label>
              <input 
                name="code" 
                value={formData.code}
                onChange={handleChange}
                className="input input-bordered w-full" 
                placeholder="Ex: CHC-001"
                required 
              />
            </div>

            {/* Catégorie */}
            <div>
              <label className="block text-sm font-medium mb-1">
                <Users className="w-4 h-4 inline mr-1.5" />
                Catégorie <span className="text-error">*</span>
              </label>
              <select 
                name="categorie" 
                value={formData.categorie}
                onChange={handleChange}
                className="select select-bordered w-full"
                required
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Niveau */}
            <div>
              <label className="block text-sm font-medium mb-1">
                <Award className="w-4 h-4 inline mr-1.5" />
                Niveau
              </label>
              <input 
                name="niveau" 
                value={formData.niveau}
                onChange={handleChange}
                className="input input-bordered w-full" 
                placeholder="Ex: Niveau 5"
              />
            </div>

            {/* Coefficient */}
            <div>
              <label className="block text-sm font-medium mb-1">
                <Shield className="w-4 h-4 inline mr-1.5" />
                Coefficient
              </label>
              <input 
                name="coefficient" 
                type="number"
                value={formData.coefficient}
                onChange={handleChange}
                className="input input-bordered w-full" 
                placeholder="Ex: 350"
              />
            </div>

            {/* Description - colonne entière */}
            <div className="col-span-full">
              <label className="block text-sm font-medium mb-1">
                <BookOpen className="w-4 h-4 inline mr-1.5" />
                Description
              </label>
              <textarea 
                name="description" 
                value={formData.description}
                onChange={handleChange}
                className="textarea textarea-bordered w-full h-24" 
                placeholder="Description du poste..."
              />
            </div>

            {/* Compétences requises */}
            <div className="col-span-full">
              <label className="block text-sm font-medium mb-2">
                <CheckCircle className="w-4 h-4 inline mr-1.5" />
                Compétences requises
              </label>
              <div className="flex flex-wrap gap-2">
                {competences.length === 0 ? (
                  <p className="text-sm text-base-content/40">Aucune compétence disponible</p>
                ) : (
                  competences.map(comp => {
                    const isSelected = (formData.competences_requises || []).includes(comp.id);
                    return (
                      <button
                        key={comp.id}
                        type="button"
                        onClick={() => handleCompetenceToggle(comp.id)}
                        className={`badge badge-lg gap-1 px-3 py-2 transition-all ${
                          isSelected 
                            ? 'badge-primary cursor-pointer' 
                            : 'badge-ghost cursor-pointer hover:badge-primary/50'
                        }`}
                      >
                        {isSelected && <CheckCircle className="w-3 h-3" />}
                        {comp.nom}
                      </button>
                    );
                  })
                )}
              </div>
              <p className="text-xs text-base-content/40 mt-1">
                Cliquez sur une compétence pour l'ajouter ou la retirer
              </p>
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
              onClick={() => navigate('/postes')}
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

export default PosteForm;