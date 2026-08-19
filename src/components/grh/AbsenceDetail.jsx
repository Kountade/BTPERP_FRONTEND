// src/components/rh/AbsenceDetail.jsx
// Détails d'une absence

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  UserMinus, ChevronLeft, Edit, Trash2, 
  UserCircle, Calendar, FileText, Wifi, WifiOff,
  AlertTriangle, CheckCircle, XCircle, Clock,
  Loader2, BadgeCheck
} from 'lucide-react';
import AxiosInstance from '../AxiosInstance';

function AbsenceDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [absence, setAbsence] = useState(null);
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

        const response = await AxiosInstance.get(`/absences/${id}/`, {
          headers: { Authorization: `Token ${token}` }
        });
        setAbsence(response.data);

      } catch (error) {
        console.error('❌ Erreur chargement:', error);
        if (error.response?.status === 401) {
          navigate('/login');
        } else if (error.response?.status === 404) {
          setError('Absence non trouvée');
        } else {
          setError('Erreur lors du chargement de l\'absence');
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
    if (!window.confirm('Supprimer cette absence ?')) return;
    
    try {
      const token = localStorage.getItem('Token');
      await AxiosInstance.delete(`/absences/${id}/`, {
        headers: { Authorization: `Token ${token}` }
      });
      navigate('/absences');
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleApprouver = async (approuve) => {
    try {
      const token = localStorage.getItem('Token');
      await AxiosInstance.post(`/absences/${id}/approuver/`, { approuve }, {
        headers: { Authorization: `Token ${token}` }
      });
      await loadData();
    } catch (error) {
      console.error('Erreur approbation:', error);
      alert('Erreur lors de l\'approbation');
    }
  };

  const getStatutColor = (statut) => {
    const colors = {
      'demandee': 'warning',
      'approuvee': 'success',
      'refusee': 'error',
      'annulee': 'neutral'
    };
    return colors[statut] || 'neutral';
  };

  const getTypeIcon = (type) => {
    const icons = {
      'cp': '🏖️',
      'rtt': '📅',
      'maladie': '🤒',
      'accident': '⚠️',
      'maternite': '👶',
      'sans_solde': '💰',
      'formation': '📚',
      'autre': '📌'
    };
    return icons[type] || '📌';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-base-content/60">Chargement de l'absence...</p>
        </div>
      </div>
    );
  }

  if (error || !absence) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-error mx-auto mb-4" />
          <h3 className="text-lg font-medium">{error || 'Absence non trouvée'}</h3>
          <Link to="/absences" className="btn btn-primary mt-4">
            Retour à la liste
          </Link>
        </div>
      </div>
    );
  }

  const statutColor = getStatutColor(absence.statut);
  const typeIcon = getTypeIcon(absence.type_absence);
  const isEnAttente = absence.statut === 'demandee';

  return (
    <div className="w-full px-4 py-5 space-y-5">
      
      {/* En-tête */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/absences')}
            className="btn btn-ghost btn-sm btn-square"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="text-3xl">{typeIcon}</div>
            <div>
              <h1 className="text-2xl font-bold">Détail de l'absence</h1>
              <p className="text-sm text-base-content/60">
                {absence.employe_nom || 'Employé'} • {absence.type_display || absence.type_absence}
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
            {absence.statut_display || absence.statut}
          </span>
          {isEnAttente && (
            <>
              <button 
                onClick={() => handleApprouver(true)}
                className="btn btn-sm btn-success gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                Approuver
              </button>
              <button 
                onClick={() => handleApprouver(false)}
                className="btn btn-sm btn-error gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                Refuser
              </button>
            </>
          )}
          <Link 
            to={`/absences/edit/${id}`} 
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
            <p className="font-medium text-base">{absence.employe_nom || 'Employé inconnu'}</p>
            <p className="text-sm text-base-content/60">ID: {absence.employe}</p>
            {absence.contrat && (
              <p className="text-sm text-base-content/60">Contrat: {absence.contrat}</p>
            )}
          </div>
        </div>

        {/* Type et statut */}
        <div className="bg-base-100 rounded-xl shadow-sm p-4 border border-base-200">
          <h3 className="text-sm font-semibold uppercase text-base-content/40 mb-3 flex items-center gap-2">
            <BadgeCheck className="w-4 h-4" />
            Type et statut
          </h3>
          <div className="space-y-2">
            <p className="text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-base-content/40" />
              Type: <span className="font-medium">{absence.type_display || absence.type_absence}</span>
            </p>
            <p className="text-sm flex items-center gap-2">
              <BadgeCheck className="w-4 h-4 text-base-content/40" />
              Statut: <span className={`font-medium badge badge-${statutColor} badge-sm`}>
                {absence.statut_display || absence.statut}
              </span>
            </p>
            {absence.approuve_par_nom && (
              <p className="text-sm text-base-content/60">
                Approuvé par: {absence.approuve_par_nom}
              </p>
            )}
          </div>
        </div>

        {/* Période */}
        <div className="bg-base-100 rounded-xl shadow-sm p-4 border border-base-200">
          <h3 className="text-sm font-semibold uppercase text-base-content/40 mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Période
          </h3>
          <div className="space-y-2">
            <p className="text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-base-content/40" />
              Début: <span className="font-medium">
                {absence.date_debut ? new Date(absence.date_debut).toLocaleDateString('fr-FR') : 'N/A'}
              </span>
            </p>
            <p className="text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-base-content/40" />
              Fin: <span className="font-medium">
                {absence.date_fin ? new Date(absence.date_fin).toLocaleDateString('fr-FR') : 'N/A'}
              </span>
            </p>
            <p className="text-sm flex items-center gap-2 font-medium">
              <Clock className="w-4 h-4 text-base-content/40" />
              Durée: {absence.nombre_jours} jour(s)
            </p>
          </div>
        </div>

        {/* Motif */}
        <div className="bg-base-100 rounded-xl shadow-sm p-4 border border-base-200">
          <h3 className="text-sm font-semibold uppercase text-base-content/40 mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Motif
          </h3>
          <div className="space-y-2">
            <p className="text-sm">{absence.motif || 'Non renseigné'}</p>
            {absence.justificatif && (
              <div className="mt-2">
                <a 
                  href={absence.justificatif}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  📎 Voir le justificatif
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Métadonnées */}
      <div className="text-xs text-base-content/40 text-center border-t border-base-200 pt-3">
        <p>Créé le {absence.created_at ? new Date(absence.created_at).toLocaleString('fr-FR') : 'N/A'}</p>
        {absence.updated_at && absence.updated_at !== absence.created_at && (
          <p>Modifié le {new Date(absence.updated_at).toLocaleString('fr-FR')}</p>
        )}
      </div>
    </div>
  );
}

export default AbsenceDetail;