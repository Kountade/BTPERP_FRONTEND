// src/components/crm/AppelOffreDetail.jsx
// Détail d'un appel d'offres - Multi-agences

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  FileText, ChevronLeft, Edit, Trash2, 
  UserCircle, Building2, Wifi, WifiOff,
  AlertTriangle, Calendar, Loader2,
  DollarSign, Award, XCircle, CheckCircle, TrendingUp
} from 'lucide-react';
import AxiosInstance from '../AxiosInstance';

function AppelOffreDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [appel, setAppel] = useState(null);
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
      const response = await AxiosInstance.get(`/appels-offres/${id}/`, {
        headers: { Authorization: `Token ${token}` }
      });
      setAppel(response.data);
    } catch (error) {
      console.error('❌ Erreur chargement:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else if (error.response?.status === 404) {
        setError('Appel d\'offres non trouvé');
      } else {
        setError('Erreur lors du chargement');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadData();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!window.confirm('Supprimer cet appel d\'offres ?')) return;
    try {
      const token = localStorage.getItem('Token');
      await AxiosInstance.delete(`/appels-offres/${id}/`, {
        headers: { Authorization: `Token ${token}` }
      });
      navigate('/appels-offres');
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const getStatutBadgeColor = (statut) => {
    const colors = {
      'recu': 'neutral',
      'en_cours': 'info',
      'soumis': 'warning',
      'gagne': 'success',
      'perdu': 'error'
    };
    return colors[statut] || 'neutral';
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

  if (error || !appel) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-error mx-auto mb-4" />
          <h3 className="text-lg font-medium">{error || 'Appel d\'offres non trouvé'}</h3>
          <Link to="/appels-offres" className="btn btn-primary mt-4">Retour à la liste</Link>
        </div>
      </div>
    );
  }

  const statutColor = getStatutBadgeColor(appel.statut);

  return (
    <div className="w-full px-4 py-5 space-y-5">
      {/* En-tête */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/appels-offres')} className="btn btn-ghost btn-sm btn-square">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl bg-${statutColor}/10 text-${statutColor}`}>
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{appel.reference}</h1>
              <p className="text-sm text-base-content/60">{appel.objet} • {appel.client_nom}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className={`badge ${isOnline ? 'badge-success' : 'badge-error'} gap-1.5 px-3 py-2.5`}>
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            {isOnline ? 'En ligne' : 'Hors ligne'}
          </div>
          <span className={`badge badge-${statutColor} badge-md px-3 py-2.5`}>
            {appel.statut_display || appel.statut}
          </span>
          <Link to={`/appels-offres/edit/${id}`} className="btn btn-sm btn-primary gap-1.5">
            <Edit className="w-4 h-4" /> Modifier
          </Link>
          <button onClick={handleDelete} className="btn btn-sm btn-error gap-1.5">
            <Trash2 className="w-4 h-4" /> Supprimer
          </button>
        </div>
      </div>

      {/* Détails */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-base-100 rounded-xl shadow-sm p-4 border border-base-200">
          <h3 className="text-sm font-semibold uppercase text-base-content/40 mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4" /> Informations
          </h3>
          <div className="space-y-2">
            <p className="text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4 text-base-content/40" /> Agence: <span className="font-medium">{appel.agence_nom}</span>
            </p>
            <p className="text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4 text-base-content/40" /> Client: <span className="font-medium">{appel.client_nom}</span>
            </p>
            <p className="text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-base-content/40" /> Référence: <span className="font-medium">{appel.reference}</span>
            </p>
            <p className="text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-base-content/40" /> Objet: <span className="font-medium">{appel.objet}</span>
            </p>
          </div>
        </div>

        <div className="bg-base-100 rounded-xl shadow-sm p-4 border border-base-200">
          <h3 className="text-sm font-semibold uppercase text-base-content/40 mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Dates & Responsable
          </h3>
          <div className="space-y-2">
            <p className="text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-base-content/40" /> Publié: <span className="font-medium">{appel.date_publication ? new Date(appel.date_publication).toLocaleDateString('fr-FR') : 'N/A'}</span>
            </p>
            <p className="text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-base-content/40" /> Limite: <span className="font-medium">{appel.date_limite ? new Date(appel.date_limite).toLocaleDateString('fr-FR') : 'N/A'}</span>
            </p>
            {appel.date_soumission && (
              <p className="text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-base-content/40" /> Soumis: <span className="font-medium">{new Date(appel.date_soumission).toLocaleDateString('fr-FR')}</span>
              </p>
            )}
            <p className="text-sm flex items-center gap-2">
              <UserCircle className="w-4 h-4 text-base-content/40" /> Responsable: <span className="font-medium">{appel.responsable_name || 'Non assigné'}</span>
            </p>
          </div>
        </div>

        <div className="bg-base-100 rounded-xl shadow-sm p-4 border border-base-200">
          <h3 className="text-sm font-semibold uppercase text-base-content/40 mb-3 flex items-center gap-2">
            <DollarSign className="w-4 h-4" /> Finances
          </h3>
          <div className="space-y-2">
            <p className="text-sm flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-base-content/40" /> Budget estimé: <span className="font-medium">{appel.budget_estime ? parseFloat(appel.budget_estime).toLocaleString() + ' €' : 'N/A'}</span>
            </p>
            {appel.montant_soumis && (
              <p className="text-sm flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-base-content/40" /> Montant soumis: <span className="font-medium">{parseFloat(appel.montant_soumis).toLocaleString()} €</span>
              </p>
            )}
          </div>
        </div>

        <div className="bg-base-100 rounded-xl shadow-sm p-4 border border-base-200">
          <h3 className="text-sm font-semibold uppercase text-base-content/40 mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4" /> Description & Notes
          </h3>
          <div className="space-y-2">
            <p className="text-sm"><span className="font-medium">Description:</span> {appel.description || 'Aucune'}</p>
            <p className="text-sm"><span className="font-medium">Notes:</span> {appel.notes || 'Aucune'}</p>
          </div>
        </div>
      </div>

      <div className="text-xs text-base-content/40 text-center border-t border-base-200 pt-3">
        <p>Créé le {appel.created_at ? new Date(appel.created_at).toLocaleString('fr-FR') : 'N/A'}</p>
        {appel.updated_at && appel.updated_at !== appel.created_at && (
          <p>Modifié le {new Date(appel.updated_at).toLocaleString('fr-FR')}</p>
        )}
      </div>
    </div>
  );
}

export default AppelOffreDetail;