// src/components/rh/PointageDetail.jsx
// Détails d'un pointage

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  Clock, ChevronLeft, Edit, Trash2, 
  UserCircle, Building2, Calendar, MapPin,
  Wifi, WifiOff, AlertTriangle, FileText,
  Loader2, CheckCircle, XCircle
} from 'lucide-react';
import AxiosInstance from '../AxiosInstance';

function PointageDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [pointage, setPointage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

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

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('Token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await AxiosInstance.get(`/pointages/${id}/`, {
          headers: { Authorization: `Token ${token}` }
        });
        setPointage(response.data);

      } catch (error) {
        console.error('❌ Erreur chargement:', error);
        if (error.response?.status === 401) {
          navigate('/login');
        } else if (error.response?.status === 404) {
          setError('Pointage non trouvé');
        } else {
          setError('Erreur lors du chargement du pointage');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadData();
    }
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!window.confirm('Supprimer ce pointage ?')) return;
    
    try {
      const token = localStorage.getItem('Token');
      await AxiosInstance.delete(`/pointages/${id}/`, {
        headers: { Authorization: `Token ${token}` }
      });
      navigate('/pointages');
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      'arrivee': 'success',
      'depart': 'error',
      'pause': 'warning',
      'retour_pause': 'info',
      'heure_sup': 'secondary'
    };
    return colors[type] || 'neutral';
  };

  const getTypeIcon = (type) => {
    const icons = {
      'arrivee': '✅',
      'depart': '🚪',
      'pause': '☕',
      'retour_pause': '🔄',
      'heure_sup': '⏰'
    };
    return icons[type] || '📌';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-base-content/60">Chargement du pointage...</p>
        </div>
      </div>
    );
  }

  if (error || !pointage) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-error mx-auto mb-4" />
          <h3 className="text-lg font-medium">{error || 'Pointage non trouvé'}</h3>
          <Link to="/pointages" className="btn btn-primary mt-4">
            Retour à la liste
          </Link>
        </div>
      </div>
    );
  }

  const typeColor = getTypeColor(pointage.type_pointage);
  const typeIcon = getTypeIcon(pointage.type_pointage);

  return (
    <div className="w-full px-4 py-5 space-y-5">
      
      {/* En-tête */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/pointages')}
            className="btn btn-ghost btn-sm btn-square"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl bg-${typeColor}/10 text-${typeColor}`}>
              <span className="text-2xl">{typeIcon}</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">Détail du pointage</h1>
              <p className="text-sm text-base-content/60">
                {pointage.employe_nom || 'Employé'} • {pointage.type_display || pointage.type_pointage}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className={`badge ${isOnline ? 'badge-success' : 'badge-error'} gap-1.5 px-3 py-2.5`}>
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            {isOnline ? 'En ligne' : 'Hors ligne'}
          </div>
          <span className={`badge badge-${typeColor} badge-md gap-1.5 px-3 py-2.5`}>
            {pointage.type_display || pointage.type_pointage}
          </span>
          <Link 
            to={`/pointages/edit/${id}`}
            className="btn btn-sm btn-primary gap-1.5"
          >
            <Edit className="w-4 h-4" />
            Modifier
          </Link>
          <button 
            onClick={handleDelete}
            className="btn btn-sm btn-error gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            Supprimer
          </button>
        </div>
      </div>

      {/* Informations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Employé */}
        <div className="bg-base-100 rounded-xl shadow-sm p-4 border border-base-200">
          <h3 className="text-sm font-semibold uppercase text-base-content/40 mb-3 flex items-center gap-2">
            <UserCircle className="w-4 h-4" />
            Employé
          </h3>
          <div className="space-y-2">
            <p className="font-medium text-base">{pointage.employe_nom || 'Employé inconnu'}</p>
            <p className="text-sm text-base-content/60">ID: {pointage.employe}</p>
            {pointage.contrat_display && (
              <p className="text-sm text-base-content/60">Contrat: {pointage.contrat_display}</p>
            )}
          </div>
        </div>

        {/* Pointage */}
        <div className="bg-base-100 rounded-xl shadow-sm p-4 border border-base-200">
          <h3 className="text-sm font-semibold uppercase text-base-content/40 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Pointage
          </h3>
          <div className="space-y-2">
            <p className="text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-base-content/40" />
              Date: <span className="font-medium">
                {pointage.date ? new Date(pointage.date).toLocaleDateString('fr-FR') : 'N/A'}
              </span>
            </p>
            <p className="text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-base-content/40" />
              Heure: <span className="font-medium">{pointage.heure || 'N/A'}</span>
            </p>
            <p className="text-sm flex items-center gap-2">
              <span className={`badge badge-${typeColor} badge-sm`}>
                {pointage.type_display || pointage.type_pointage}
              </span>
            </p>
          </div>
        </div>

        {/* Projet / Tâche */}
        <div className="bg-base-100 rounded-xl shadow-sm p-4 border border-base-200">
          <h3 className="text-sm font-semibold uppercase text-base-content/40 mb-3 flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Projet / Tâche
          </h3>
          <div className="space-y-2">
            <p className="text-sm">Projet: {pointage.projet_nom || 'Non spécifié'}</p>
            <p className="text-sm">Tâche: {pointage.tache_nom || 'Non spécifiée'}</p>
          </div>
        </div>

        {/* Localisation */}
        <div className="bg-base-100 rounded-xl shadow-sm p-4 border border-base-200">
          <h3 className="text-sm font-semibold uppercase text-base-content/40 mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Localisation
          </h3>
          <div className="space-y-2">
            {pointage.latitude && pointage.longitude ? (
              <>
                <p className="text-sm">Latitude: {pointage.latitude}</p>
                <p className="text-sm">Longitude: {pointage.longitude}</p>
                <a 
                  href={`https://www.google.com/maps?q=${pointage.latitude},${pointage.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline inline-block"
                >
                  Voir sur la carte →
                </a>
              </>
            ) : (
              <p className="text-sm text-base-content/40">Non géolocalisé</p>
            )}
          </div>
        </div>
      </div>

      {/* Remarque */}
      {pointage.remarque && (
        <div className="bg-base-100 rounded-xl shadow-sm p-4 border border-base-200">
          <h3 className="text-sm font-semibold uppercase text-base-content/40 mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Remarque
          </h3>
          <p className="text-sm">{pointage.remarque}</p>
        </div>
      )}

      {/* Métadonnées */}
      <div className="text-xs text-base-content/40 text-center border-t border-base-200 pt-3">
        <p>Créé le {pointage.created_at ? new Date(pointage.created_at).toLocaleString('fr-FR') : 'N/A'}</p>
      </div>
    </div>
  );
}

export default PointageDetail;