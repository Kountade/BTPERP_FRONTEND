// src/components/crm/InteractionDetail.jsx
// Détails d'une interaction - Multi-agences

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  MessageSquare, ChevronLeft, Edit, Trash2, 
  UserCircle, Mail, Phone, Building2, Wifi, WifiOff,
  AlertTriangle, Calendar, FileText, Loader2,
  Users, Video, Clock, ArrowLeft
} from 'lucide-react';
import AxiosInstance from '../AxiosInstance';

function InteractionDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [interaction, setInteraction] = useState(null);
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

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('Token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await AxiosInstance.get(`/interactions/${id}/`, {
        headers: { Authorization: `Token ${token}` }
      });
      setInteraction(response.data);

    } catch (error) {
      console.error('❌ Erreur chargement:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else if (error.response?.status === 404) {
        setError('Interaction non trouvée');
      } else {
        setError('Erreur lors du chargement');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!window.confirm('Supprimer cette interaction ?')) return;
    
    try {
      const token = localStorage.getItem('Token');
      await AxiosInstance.delete(`/interactions/${id}/`, {
        headers: { Authorization: `Token ${token}` }
      });
      navigate('/interactions');
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const getTypeBadgeColor = (type) => {
    const colors = {
      'appel': 'info',
      'email': 'primary',
      'rencontre': 'success',
      'visite_chantier': 'warning',
      'reunion': 'secondary',
      'autre': 'neutral'
    };
    return colors[type] || 'neutral';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-base-content/60">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error || !interaction) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-error mx-auto mb-4" />
          <h3 className="text-lg font-medium">{error || 'Interaction non trouvée'}</h3>
          <Link to="/interactions" className="btn btn-primary mt-4">
            Retour à la liste
          </Link>
        </div>
      </div>
    );
  }

  const typeColor = getTypeBadgeColor(interaction.type_interaction);
  const dateObj = new Date(interaction.date);

  return (
    <div className="w-full px-4 py-5 space-y-5">
      
      {/* En-tête */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/interactions')}
            className="btn btn-ghost btn-sm btn-square"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl bg-${typeColor}/10 text-${typeColor}`}>
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{interaction.sujet}</h1>
              <p className="text-sm text-base-content/60">
                {interaction.type_display || interaction.type_interaction}
                {interaction.responsable_name && ` • ${interaction.responsable_name}`}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className={`badge ${isOnline ? 'badge-success' : 'badge-error'} gap-1.5 px-3 py-2.5`}>
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            {isOnline ? 'En ligne' : 'Hors ligne'}
          </div>
          <span className={`badge badge-${typeColor} badge-md px-3 py-2.5`}>
            {interaction.type_display || interaction.type_interaction}
          </span>
          <Link 
            to={`/interactions/edit/${id}`} 
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
        
        {/* Détails */}
        <div className="bg-base-100 rounded-xl shadow-sm p-4 border border-base-200">
          <h3 className="text-sm font-semibold uppercase text-base-content/40 mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Détails
          </h3>
          <div className="space-y-2">
            <p className="text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-base-content/40" />
              Date: <span className="font-medium">{dateObj.toLocaleString('fr-FR')}</span>
            </p>
            {interaction.duree && (
              <p className="text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-base-content/40" />
                Durée: <span className="font-medium">{interaction.duree} minutes</span>
              </p>
            )}
            <p className="text-sm flex items-center gap-2">
              <UserCircle className="w-4 h-4 text-base-content/40" />
              Responsable: <span className="font-medium">{interaction.responsable_name || 'Non assigné'}</span>
            </p>
            {interaction.lead_nom && (
              <p className="text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-base-content/40" />
                Lead: <span className="font-medium">{interaction.lead_nom}</span>
              </p>
            )}
            {interaction.client_nom && (
              <p className="text-sm flex items-center gap-2">
                <Building2 className="w-4 h-4 text-base-content/40" />
                Client: <span className="font-medium">{interaction.client_nom}</span>
              </p>
            )}
            {interaction.agence_nom && (
              <p className="text-sm flex items-center gap-2">
                <Building2 className="w-4 h-4 text-base-content/40" />
                Agence: <span className="font-medium">{interaction.agence_nom}</span>
              </p>
            )}
          </div>
        </div>

        {/* Contenu */}
        <div className="bg-base-100 rounded-xl shadow-sm p-4 border border-base-200">
          <h3 className="text-sm font-semibold uppercase text-base-content/40 mb-3 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Contenu
          </h3>
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap">{interaction.contenu || 'Aucun contenu'}</p>
          </div>
        </div>
      </div>

      {/* Métadonnées */}
      <div className="text-xs text-base-content/40 text-center border-t border-base-200 pt-3">
        <p>Créé le {interaction.created_at ? new Date(interaction.created_at).toLocaleString('fr-FR') : 'N/A'}</p>
        {interaction.updated_at && interaction.updated_at !== interaction.created_at && (
          <p>Modifié le {new Date(interaction.updated_at).toLocaleString('fr-FR')}</p>
        )}
      </div>
    </div>
  );
}

export default InteractionDetail;