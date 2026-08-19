// src/components/rh/ContratDetail.jsx
// Détails d'un contrat de travail - Pleine largeur avec espacement équilibré

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  FileText, ChevronLeft, Edit, Trash2, Printer, 
  UserCircle, Briefcase, Calendar, DollarSign,
  Clock, Coins, MapPin, Award, BadgeCheck,
  Wifi, WifiOff, AlertTriangle, Building2,
  Mail, Phone, FileCheck, FileX, Loader2
} from 'lucide-react';
import AxiosInstance from '../AxiosInstance';

function ContratDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [contrat, setContrat] = useState(null);
  const [employe, setEmploye] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

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
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('Token');
        if (!token) {
          navigate('/login');
          return;
        }

        const contratRes = await AxiosInstance.get(`/contrats/${id}/`, {
          headers: { Authorization: `Token ${token}` }
        });
        
        setContrat(contratRes.data);

        if (contratRes.data.employe) {
          try {
            const employeRes = await AxiosInstance.get(`/employes/${contratRes.data.employe}/`, {
              headers: { Authorization: `Token ${token}` }
            });
            setEmploye(employeRes.data);
          } catch (empError) {
            console.error('❌ Erreur chargement employé:', empError);
          }
        }

      } catch (error) {
        console.error('❌ Erreur chargement:', error);
        if (error.response?.status === 401) {
          navigate('/login');
        } else if (error.response?.status === 404) {
          setError('Contrat non trouvé');
        } else {
          setError('Erreur lors du chargement du contrat');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadData();
    }
  }, [id, navigate]);

  // Supprimer
  const handleDelete = async () => {
    if (!window.confirm('Supprimer ce contrat ?')) return;
    
    try {
      const token = localStorage.getItem('Token');
      await AxiosInstance.delete(`/contrats/${id}/`, {
        headers: { Authorization: `Token ${token}` }
      });
      navigate('/contrats');
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const isActif = contrat?.statut === 'actif';

  const SITUATION_LABELS = {
    'cdi': 'CDI',
    'cdd': 'CDD',
    'interim': 'Intérim',
    'apprenti': 'Apprenti',
    'stagiaire': 'Stagiaire',
    'auto_entrepreneur': 'Auto-Entrepreneur'
  };

  const STATUT_LABELS = {
    'actif': 'Actif',
    'termine': 'Terminé',
    'resilie': 'Résilié',
    'suspendu': 'Suspendu'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-base-content/60">Chargement du contrat...</p>
        </div>
      </div>
    );
  }

  if (error || !contrat) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-error mx-auto mb-4" />
          <h3 className="text-lg font-medium">{error || 'Contrat non trouvé'}</h3>
          <Link to="/contrats" className="btn btn-primary mt-4">
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
            onClick={() => navigate('/contrats')}
            className="btn btn-ghost btn-sm btn-square"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isActif ? 'bg-success/10 text-success' : 'bg-base-300 text-base-content/40'}`}>
              {isActif ? <FileCheck className="w-6 h-6" /> : <FileX className="w-6 h-6" />}
            </div>
            <div>
              <h1 className="text-2xl font-bold">Contrat de travail</h1>
              <p className="text-sm text-base-content/60">
                {SITUATION_LABELS[contrat.situation] || contrat.situation} • {contrat.employe_nom || 'Employé'}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className={`badge ${isOnline ? 'badge-success' : 'badge-error'} gap-1.5 px-3 py-2.5`}>
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            {isOnline ? 'En ligne' : 'Hors ligne'}
          </div>
          <span className={`badge ${isActif ? 'badge-success' : 'badge-error'} badge-md gap-1.5 px-3 py-2.5`}>
            {STATUT_LABELS[contrat.statut] || contrat.statut}
          </span>
          <Link 
            to={`/contrats/pdf/${id}`}
            target="_blank"
            className="btn btn-sm btn-ghost gap-1.5"
          >
            <Printer className="w-4 h-4" />
            PDF
          </Link>
          <Link 
            to={`/contrats/edit/${id}`}
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

      {/* Informations du contrat - 2 colonnes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Employé */}
        <div className="bg-base-100 rounded-xl shadow-sm p-4 border border-base-200">
          <h3 className="text-sm font-semibold uppercase text-base-content/40 mb-3 flex items-center gap-2">
            <UserCircle className="w-4 h-4" />
            Employé
          </h3>
          <div className="space-y-2">
            <p className="font-medium text-base">{contrat.employe_nom || 'Employé inconnu'}</p>
            {employe && (
              <>
                <p className="text-sm flex items-center gap-2 text-base-content/60">
                  <Mail className="w-4 h-4" />
                  {employe.email || 'Non renseigné'}
                </p>
                <p className="text-sm flex items-center gap-2 text-base-content/60">
                  <Phone className="w-4 h-4" />
                  {employe.telephone || 'Non renseigné'}
                </p>
                <p className="text-sm flex items-center gap-2 text-base-content/60">
                  <Building2 className="w-4 h-4" />
                  {employe.service_nom || 'Service non assigné'} • {employe.poste_nom || 'Poste non assigné'}
                </p>
                <p className="text-sm flex items-center gap-2 text-base-content/60">
                  <Award className="w-4 h-4" />
                  Matricule: {employe.matricule || 'N/A'}
                </p>
              </>
            )}
            <Link 
              to={`/employes/${contrat.employe}`}
              className="text-xs text-primary hover:underline inline-block mt-1"
            >
              Voir le profil de l'employé →
            </Link>
          </div>
        </div>

        {/* Détails du contrat */}
        <div className="bg-base-100 rounded-xl shadow-sm p-4 border border-base-200">
          <h3 className="text-sm font-semibold uppercase text-base-content/40 mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Détails du contrat
          </h3>
          <div className="space-y-2">
            <p className="text-sm flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-base-content/40" />
              Situation: <span className="font-medium">{SITUATION_LABELS[contrat.situation] || contrat.situation}</span>
            </p>
            <p className="text-sm flex items-center gap-2">
              <BadgeCheck className="w-4 h-4 text-base-content/40" />
              Statut: <span className={`font-medium ${isActif ? 'text-success' : 'text-error'}`}>
                {STATUT_LABELS[contrat.statut] || contrat.statut}
              </span>
            </p>
            <p className="text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-base-content/40" />
              Date d'embauche: <span className="font-medium">
                {contrat.date_embauche ? new Date(contrat.date_embauche).toLocaleDateString('fr-FR') : 'N/A'}
              </span>
            </p>
            {contrat.date_fin_contrat && (
              <p className="text-sm flex items-center gap-2 text-warning">
                <Calendar className="w-4 h-4" />
                Date fin de contrat: <span className="font-medium">
                  {new Date(contrat.date_fin_contrat).toLocaleDateString('fr-FR')}
                </span>
              </p>
            )}
            <p className="text-sm flex items-center gap-2 text-base-content/60">
              <Award className="w-4 h-4" />
              Ancienneté: {contrat.anciennete || 0} an(s)
            </p>
            <p className="text-sm flex items-center gap-2 text-base-content/60">
              <Clock className="w-4 h-4" />
              ID: {contrat.id}
            </p>
          </div>
        </div>
      </div>

      {/* Rémunération */}
      <div className="bg-base-100 rounded-xl shadow-sm p-4 border border-base-200">
        <h3 className="text-sm font-semibold uppercase text-base-content/40 mb-3 flex items-center gap-2">
          <DollarSign className="w-4 h-4" />
          Rémunération
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          <div className="text-center p-3 bg-base-200 rounded-lg">
            <p className="text-xl font-bold text-primary">{contrat.salaire_base?.toLocaleString() || 0} €</p>
            <p className="text-xs text-base-content/40">Salaire base</p>
          </div>
          <div className="text-center p-3 bg-base-200 rounded-lg">
            <p className="text-xl font-bold text-secondary">{contrat.taux_horaire || 0} €</p>
            <p className="text-xs text-base-content/40">Taux horaire</p>
          </div>
          <div className="text-center p-3 bg-base-200 rounded-lg">
            <p className="text-xl font-bold text-success">{contrat.prime_panier || 0} €</p>
            <p className="text-xs text-base-content/40">Prime panier</p>
          </div>
          <div className="text-center p-3 bg-base-200 rounded-lg">
            <p className="text-xl font-bold text-info">{contrat.indemnite_km || 0} €</p>
            <p className="text-xs text-base-content/40">Indemnité KM</p>
          </div>
          <div className="text-center p-3 bg-base-200 rounded-lg">
            <p className="text-xl font-bold text-warning">{contrat.prime_anciennete || 0} €</p>
            <p className="text-xs text-base-content/40">Prime ancienneté</p>
          </div>
        </div>
      </div>

      {/* Métadonnées */}
      <div className="text-xs text-base-content/40 text-center border-t border-base-200 pt-3">
        <p>Créé le {contrat.created_at ? new Date(contrat.created_at).toLocaleString('fr-FR') : 'N/A'}</p>
        {contrat.updated_at && contrat.updated_at !== contrat.created_at && (
          <p>Modifié le {new Date(contrat.updated_at).toLocaleString('fr-FR')}</p>
        )}
      </div>
    </div>
  );
}

export default ContratDetail;