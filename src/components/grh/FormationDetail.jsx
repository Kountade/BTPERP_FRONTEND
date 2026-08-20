// src/components/rh/FormationDetail.jsx
// Détails d'une formation

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  GraduationCap, ChevronLeft, Edit, Trash2, 
  UserCircle, Building2, Calendar, Wifi, WifiOff,
  AlertTriangle, FileText, DollarSign, Clock,
  CheckCircle, XCircle, Loader2
} from 'lucide-react';
import AxiosInstance from '../AxiosInstance';

function FormationDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formation, setFormation] = useState(null);
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

        const response = await AxiosInstance.get(`/formations/${id}/`, {
          headers: { Authorization: `Token ${token}` }
        });
        setFormation(response.data);

      } catch (error) {
        console.error('❌ Erreur chargement:', error);
        if (error.response?.status === 401) {
          navigate('/login');
        } else if (error.response?.status === 404) {
          setError('Formation non trouvée');
        } else {
          setError('Erreur lors du chargement de la formation');
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
    if (!window.confirm('Supprimer cette formation ?')) return;
    
    try {
      const token = localStorage.getItem('Token');
      await AxiosInstance.delete(`/formations/${id}/`, {
        headers: { Authorization: `Token ${token}` }
      });
      navigate('/formations');
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-base-content/60">Chargement de la formation...</p>
        </div>
      </div>
    );
  }

  if (error || !formation) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-error mx-auto mb-4" />
          <h3 className="text-lg font-medium">{error || 'Formation non trouvée'}</h3>
          <Link to="/formations" className="btn btn-primary mt-4">
            Retour à la liste
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-5 space-y-5">
      
      {/* En-tête */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/formations')}
            className="btn btn-ghost btn-sm btn-square"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${formation.valide ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
              {formation.valide ? <CheckCircle className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
            </div>
            <div>
              <h1 className="text-2xl font-bold">Détail de la formation</h1>
              <p className="text-sm text-base-content/60">
                {formation.employe_nom || 'Employé'} • {formation.nom}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className={`badge ${isOnline ? 'badge-success' : 'badge-error'} gap-1.5 px-3 py-2.5`}>
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            {isOnline ? 'En ligne' : 'Hors ligne'}
          </div>
          <span className={`badge ${formation.valide ? 'badge-success' : 'badge-warning'} badge-md gap-1.5 px-3 py-2.5`}>
            {formation.valide ? 'Validée' : 'En attente'}
          </span>
          <Link 
            to={`/formations/edit/${id}`} 
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
            <p className="font-medium text-base">{formation.employe_nom || 'Employé inconnu'}</p>
            <p className="text-sm text-base-content/60">ID: {formation.employe}</p>
            {formation.contrat_display && (
              <p className="text-sm text-base-content/60">Contrat: {formation.contrat_display}</p>
            )}
          </div>
        </div>

        {/* Formation */}
        <div className="bg-base-100 rounded-xl shadow-sm p-4 border border-base-200">
          <h3 className="text-sm font-semibold uppercase text-base-content/40 mb-3 flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            Formation
          </h3>
          <div className="space-y-2">
            <p className="text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-base-content/40" />
              Nom: <span className="font-medium">{formation.nom}</span>
            </p>
            <p className="text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4 text-base-content/40" />
              Organisme: <span className="font-medium">{formation.organisme}</span>
            </p>
            {formation.certificat && (
              <p className="text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-base-content/40" />
                Certificat: <span className="font-medium">{formation.certificat}</span>
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
                {formation.date_debut ? new Date(formation.date_debut).toLocaleDateString('fr-FR') : 'N/A'}
              </span>
            </p>
            <p className="text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-base-content/40" />
              Fin: <span className="font-medium">
                {formation.date_fin ? new Date(formation.date_fin).toLocaleDateString('fr-FR') : 'N/A'}
              </span>
            </p>
            <p className="text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-base-content/40" />
              Durée: <span className="font-medium">{formation.duree_heures || 0} heures</span>
            </p>
          </div>
        </div>

        {/* Coût */}
        <div className="bg-base-100 rounded-xl shadow-sm p-4 border border-base-200">
          <h3 className="text-sm font-semibold uppercase text-base-content/40 mb-3 flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Coût
          </h3>
          <div className="space-y-2">
            <p className="text-lg font-bold text-primary">
              {parseFloat(formation.cout || 0).toLocaleString()} €
            </p>
            <p className="text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-base-content/40" />
              Statut: <span className={`font-medium ${formation.valide ? 'text-success' : 'text-warning'}`}>
                {formation.valide ? 'Validée' : 'En attente de validation'}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Métadonnées */}
      <div className="text-xs text-base-content/40 text-center border-t border-base-200 pt-3">
        <p>Créé le {formation.created_at ? new Date(formation.created_at).toLocaleString('fr-FR') : 'N/A'}</p>
        {formation.updated_at && formation.updated_at !== formation.created_at && (
          <p>Modifié le {new Date(formation.updated_at).toLocaleString('fr-FR')}</p>
        )}
      </div>
    </div>
  );
}

export default FormationDetail;