// src/components/ServiceForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Building2, 
  Save, 
  X, 
  RefreshCw,
  Wifi,
  WifiOff,
  AlertTriangle,
  Users,
  Briefcase,
  CheckCircle,
  UserCircle
} from 'lucide-react';
import AxiosInstance from '../AxiosInstance';

function ServiceForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('info');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [services, setServices] = useState([]);
  const [employes, setEmployes] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingEmployes, setLoadingEmployes] = useState(true);
  const [formData, setFormData] = useState({
    nom: '',
    code: '',
    responsable: '',
    parent: ''
  });

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
      setLoadingServices(true);
      setLoadingEmployes(true);
      
      try {
        const token = localStorage.getItem('Token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Charger les services pour le select parent
        const servicesRes = await AxiosInstance.get('/services/', {
          headers: { Authorization: `Token ${token}` }
        });
        setServices(servicesRes.data || []);
        setLoadingServices(false);

        // Charger les employés pour le select responsable
        const employesRes = await AxiosInstance.get('/employes/', {
          headers: { Authorization: `Token ${token}` }
        });
        setEmployes(employesRes.data || []);
        setLoadingEmployes(false);

        // Si édition, charger le service
        if (isEdit) {
          const response = await AxiosInstance.get(`/services/${id}/`, {
            headers: { Authorization: `Token ${token}` }
          });
          const data = response.data;
          setFormData({
            nom: data.nom || '',
            code: data.code || '',
            responsable: data.responsable || '',
            parent: data.parent || ''
          });
        }
      } catch (error) {
        console.error('Erreur chargement:', error);
        setMessageType('error');
        setMessage('Erreur lors du chargement des données');
        setLoadingServices(false);
        setLoadingEmployes(false);
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

  const resetForm = () => {
    setFormData({
      nom: '',
      code: '',
      responsable: '',
      parent: ''
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
        response = await AxiosInstance.put(`/services/${id}/`, dataToSend, {
          headers: { Authorization: `Token ${token}` }
        });
      } else {
        response = await AxiosInstance.post('/services/', dataToSend, {
          headers: { Authorization: `Token ${token}` }
        });
      }

      // ✅ Vérifier si la réponse est offline
      if (response.data && response.data.offline) {
        setMessageType('warning');
        setMessage('💾 Sauvegardé localement - Sync auto à la reconnexion');
        if (!isEdit) resetForm();
      } else {
        setMessageType('success');
        setMessage(isEdit ? '✅ Service modifié avec succès' : '✅ Service créé avec succès');
        if (!isEdit) resetForm();
        setTimeout(() => navigate('/services'), 1500);
      }

    } catch (error) {
      console.error('Erreur:', error);

      // ✅ Gestion des erreurs OFFLINE
      if (error.message === 'Network Error' || error.code === 'ERR_NETWORK' || !navigator.onLine) {
        setMessageType('warning');
        setMessage('💾 Sauvegardé localement - Sync auto à la reconnexion');
        if (!isEdit) resetForm();
        setLoading(false);
        return;
      }

      // ✅ Gestion des erreurs 401
      if (error.response?.status === 401) {
        setMessageType('error');
        setMessage('🔒 Session expirée');
        setTimeout(() => navigate('/login'), 1500);
      } 
      // ✅ Gestion des erreurs 400
      else if (error.response?.status === 400) {
        setMessageType('error');
        const errors = error.response.data;
        const messages = Object.keys(errors).flatMap(key => 
          Array.isArray(errors[key]) ? errors[key].map(e => `${key}: ${e}`) : `${key}: ${errors[key]}`
        );
        setMessage(`❌ ${messages.join(', ')}`);
      } 
      // ✅ Gestion des erreurs 403
      else if (error.response?.status === 403) {
        setMessageType('error');
        setMessage('⛔ Permission refusée');
      } 
      // ✅ Gestion des erreurs 500
      else if (error.response?.status === 500) {
        setMessageType('error');
        setMessage('⚠️ Erreur serveur');
      } 
      // ✅ Autres erreurs
      else {
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
        
        {/* ✅ En-tête - IDENTIQUE À CreateAgence */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-base-200 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold">
              {isEdit ? 'Modifier le service' : 'Nouveau service'}
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
              onClick={() => navigate('/services')}
            >
              <X className="w-4 h-4" />
              Fermer
            </button>
          </div>
        </div>

        {/* ✅ Message */}
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

        {/* ✅ Avertissement hors ligne */}
        {!isOnline && (
          <div className="alert alert-warning mb-3 py-2 shadow-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>Hors ligne - Sauvegarde locale automatique</span>
          </div>
        )}

        {/* ✅ Formulaire - IDENTIQUE À CreateAgence */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            
            {/* Nom */}
            <div className="lg:col-span-1">
              <label className="block text-sm font-medium mb-1">
                <Building2 className="w-4 h-4 inline mr-1.5" />
                Nom <span className="text-error">*</span>
              </label>
              <input 
                name="nom" 
                value={formData.nom}
                onChange={handleChange}
                className="input input-bordered w-full" 
                placeholder="Ex: Service Technique"
                required 
              />
            </div>

            {/* Code */}
            <div>
              <label className="block text-sm font-medium mb-1">
                <CheckCircle className="w-4 h-4 inline mr-1.5" />
                Code <span className="text-error">*</span>
              </label>
              <input 
                name="code" 
                value={formData.code}
                onChange={handleChange}
                className="input input-bordered w-full" 
                placeholder="Ex: TECH"
                required 
              />
            </div>

            {/* Responsable */}
            <div>
              <label className="block text-sm font-medium mb-1">
                <UserCircle className="w-4 h-4 inline mr-1.5" />
                Responsable
              </label>
              <select 
                name="responsable" 
                value={formData.responsable}
                onChange={handleChange}
                className="select select-bordered w-full"
                disabled={loadingEmployes}
              >
                <option value="">Non assigné</option>
                {employes.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.prenom} {emp.nom} ({emp.matricule})
                  </option>
                ))}
              </select>
            </div>

            {/* Service Parent */}
            <div className="lg:col-span-1">
              <label className="block text-sm font-medium mb-1">
                <Building2 className="w-4 h-4 inline mr-1.5" />
                Service Parent
              </label>
              <select 
                name="parent" 
                value={formData.parent}
                onChange={handleChange}
                className="select select-bordered w-full"
                disabled={loadingServices}
              >
                <option value="">Aucun (Service principal)</option>
                {services
                  .filter(s => s.id !== parseInt(id))
                  .map(s => (
                    <option key={s.id} value={s.id}>
                      {s.nom} ({s.code})
                    </option>
                  ))}
              </select>
            </div>

            {/* Info service parent */}
            <div className="col-span-full">
              <p className="text-xs text-base-content/40">
                💡 Sélectionnez un service parent si celui-ci est un sous-service
              </p>
            </div>
          </div>
          
          {/* ✅ Boutons - IDENTIQUE À CreateAgence */}
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
              onClick={() => navigate('/services')}
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
          
          {/* ✅ Info offline */}
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

export default ServiceForm;