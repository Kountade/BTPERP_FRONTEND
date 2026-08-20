// src/components/rh/NoteDeFraisDetail.jsx
// Détails d'une note de frais - Version simplifiée

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  Receipt, ChevronLeft, Edit, Trash2, 
  UserCircle, Calendar, Wifi, WifiOff,
  AlertTriangle, FileText, DollarSign, Clock,
  Loader2
} from 'lucide-react';
import AxiosInstance from '../AxiosInstance';

function NoteDeFraisDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [note, setNote] = useState(null);
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

        console.log(`🔍 Chargement de la note ${id}...`);
        const response = await AxiosInstance.get(`/notes-frais/${id}/`, {
          headers: { Authorization: `Token ${token}` }
        });
        
        console.log('📊 Note chargée:', response.data);
        setNote(response.data);

      } catch (error) {
        console.error('❌ Erreur chargement:', error);
        if (error.response?.status === 401) {
          navigate('/login');
        } else if (error.response?.status === 404) {
          setError('Note de frais non trouvée');
        } else {
          setError('Erreur lors du chargement de la note');
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
    if (!window.confirm('Supprimer cette note de frais ?')) return;
    
    try {
      const token = localStorage.getItem('Token');
      await AxiosInstance.delete(`/notes-frais/${id}/`, {
        headers: { Authorization: `Token ${token}` }
      });
      navigate('/notes-frais');
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const getStatutColor = (statut) => {
    const colors = {
      'brouillon': 'neutral',
      'soumise': 'warning',
      'approuvee': 'success',
      'refusee': 'error'
    };
    return colors[statut] || 'neutral';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-base-content/60">Chargement de la note...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-error mx-auto mb-4" />
          <h3 className="text-lg font-medium">{error}</h3>
          <Link to="/notes-frais" className="btn btn-primary mt-4">
            Retour à la liste
          </Link>
        </div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-warning mx-auto mb-4" />
          <h3 className="text-lg font-medium">Note non trouvée</h3>
          <Link to="/notes-frais" className="btn btn-primary mt-4">
            Retour à la liste
          </Link>
        </div>
      </div>
    );
  }

  const statutColor = getStatutColor(note.statut);

  return (
    <div className="w-full px-4 py-5 space-y-5">
      
      {/* En-tête */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/notes-frais')}
            className="btn btn-ghost btn-sm btn-square"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Détail de la note de frais</h1>
              <p className="text-sm text-base-content/60">
                {note.employe_nom || 'Employé'} • {note.type_display || note.type_frais}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className={`badge ${isOnline ? 'badge-success' : 'badge-error'} gap-1.5 px-3 py-2.5`}>
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            {isOnline ? 'En ligne' : 'Hors ligne'}
          </div>
          <span className={`badge badge-${statutColor} badge-md gap-1.5 px-3 py-2.5`}>
            {note.statut_display || note.statut}
          </span>
          <Link 
            to={`/notes-frais/edit/${id}`} 
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
            <p className="font-medium text-base">{note.employe_nom || 'Employé inconnu'}</p>
            <p className="text-sm text-base-content/60">ID: {note.employe}</p>
            {note.contrat_display && (
              <p className="text-sm text-base-content/60">Contrat: {note.contrat_display}</p>
            )}
          </div>
        </div>

        {/* Détails du frais */}
        <div className="bg-base-100 rounded-xl shadow-sm p-4 border border-base-200">
          <h3 className="text-sm font-semibold uppercase text-base-content/40 mb-3 flex items-center gap-2">
            <Receipt className="w-4 h-4" />
            Détails du frais
          </h3>
          <div className="space-y-2">
            <p className="text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-base-content/40" />
              Type: <span className="font-medium">{note.type_display || note.type_frais}</span>
            </p>
            <p className="text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-base-content/40" />
              Date: <span className="font-medium">
                {note.date ? new Date(note.date).toLocaleDateString('fr-FR') : 'N/A'}
              </span>
            </p>
            <p className="text-sm flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-base-content/40" />
              Montant: <span className="font-medium text-primary text-lg">
                {parseFloat(note.montant || 0).toLocaleString()} €
              </span>
            </p>
            {note.projet_nom && (
              <p className="text-sm flex items-center gap-2">
                Projet: <span className="font-medium">{note.projet_nom}</span>
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="bg-base-100 rounded-xl shadow-sm p-4 border border-base-200">
          <h3 className="text-sm font-semibold uppercase text-base-content/40 mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Description
          </h3>
          <p className="text-sm">{note.description || 'Non renseignée'}</p>
          {note.justificatif && (
            <div className="mt-2">
              <a 
                href={note.justificatif}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                📎 Voir le justificatif
              </a>
            </div>
          )}
        </div>

        {/* Statut */}
        <div className="bg-base-100 rounded-xl shadow-sm p-4 border border-base-200">
          <h3 className="text-sm font-semibold uppercase text-base-content/40 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Statut
          </h3>
          <div className="space-y-2">
            <p className="text-sm flex items-center gap-2">
              <span className={`badge badge-${statutColor} badge-sm`}>
                {note.statut_display || note.statut}
              </span>
            </p>
            {note.date_soumission && (
              <p className="text-sm text-base-content/60">
                Soumis le: {new Date(note.date_soumission).toLocaleString('fr-FR')}
              </p>
            )}
            {note.date_approbation && (
              <p className="text-sm text-base-content/60">
                Approuvé le: {new Date(note.date_approbation).toLocaleString('fr-FR')}
              </p>
            )}
            {note.approuve_par_nom && (
              <p className="text-sm text-base-content/60">
                Approuvé par: {note.approuve_par_nom}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Métadonnées */}
      <div className="text-xs text-base-content/40 text-center border-t border-base-200 pt-3">
        <p>Créé le {note.created_at ? new Date(note.created_at).toLocaleString('fr-FR') : 'N/A'}</p>
        {note.updated_at && note.updated_at !== note.created_at && (
          <p>Modifié le {new Date(note.updated_at).toLocaleString('fr-FR')}</p>
        )}
      </div>
    </div>
  );
}

export default NoteDeFraisDetail;