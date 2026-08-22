// src/components/chantiers/ProjetDetail.jsx
// Détails d'un projet/chantier - Multi-agences

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  Briefcase, ChevronLeft, Edit, Trash2, 
  Building2, Wifi, WifiOff, AlertTriangle,
  DollarSign, Calendar, FileText, Loader2,
  MapPin, UserCircle, HardHat, Target,
  Clock, TrendingUp, CheckCircle, XCircle,
  Printer, Users, Layers, MessageSquare,
  Plus, Eye, ArrowLeft, // ✅ ajout de Plus et Eye
} from 'lucide-react';
import AxiosInstance from '../AxiosInstance';

function ProjetDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [projet, setProjet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [phases, setPhases] = useState([]);
  const [loadingPhases, setLoadingPhases] = useState(false);
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

      const response = await AxiosInstance.get(`/projets/${id}/`, {
        headers: { Authorization: `Token ${token}` }
      });
      setProjet(response.data);

      // Charger les phases
      setLoadingPhases(true);
      try {
        const phasesRes = await AxiosInstance.get(`/projets/${id}/phases/`, {
          headers: { Authorization: `Token ${token}` }
        });
        setPhases(phasesRes.data || []);
      } catch (relError) {
        console.warn('⚠️ Erreur chargement phases:', relError);
      } finally {
        setLoadingPhases(false);
      }

    } catch (error) {
      console.error('❌ Erreur chargement:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else if (error.response?.status === 404) {
        setError('Projet non trouvé');
      } else {
        setError('Erreur lors du chargement du projet');
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
    if (!window.confirm('Supprimer ce projet ?')) return;
    
    try {
      const token = localStorage.getItem('Token');
      await AxiosInstance.delete(`/projets/${id}/`, {
        headers: { Authorization: `Token ${token}` }
      });
      navigate('/projets');
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const getStatutBadgeColor = (statut) => {
    const colors = {
      'etude': 'info',
      'encours': 'primary',
      'suspendu': 'warning',
      'termine': 'success',
      'livre': 'success'
    };
    return colors[statut] || 'neutral';
  };

  const getStatutLabel = (statut) => {
    const labels = {
      'etude': 'En étude',
      'encours': 'En cours',
      'suspendu': 'Suspendu',
      'termine': 'Terminé',
      'livre': 'Livré'
    };
    return labels[statut] || statut;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-base-content/60">Chargement du projet...</p>
        </div>
      </div>
    );
  }

  if (error || !projet) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-error mx-auto mb-4" />
          <h3 className="text-lg font-medium">{error || 'Projet non trouvé'}</h3>
          <Link to="/projets" className="btn btn-primary mt-4">
            Retour à la liste
          </Link>
        </div>
      </div>
    );
  }

  const statutColor = getStatutBadgeColor(projet.statut);
  const avancement = parseFloat(projet.taux_avancement) || 0;
  const budgetTotal = parseFloat(projet.budget_total) || 0;
  const coutTotal = parseFloat(projet.cout_total) || 0;
  const marge = parseFloat(projet.marge_reelle) || 0;

  return (
    <div className="w-full px-4 py-5 space-y-5">
      
      {/* En-tête */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/projets')}
            className="btn btn-ghost btn-sm btn-square"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl bg-${statutColor}/10 text-${statutColor}`}>
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{projet.code} - {projet.nom}</h1>
              <p className="text-sm text-base-content/60">
                {projet.type_display || projet.type_projet} • {projet.client_nom || 'Client inconnu'}
                {projet.agence_nom && ` • ${projet.agence_nom}`}
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
            {getStatutLabel(projet.statut)}
          </span>
          <span className="badge badge-primary badge-md gap-1.5 px-3 py-2.5">
            <TrendingUp className="w-4 h-4" />
            {avancement}%
          </span>
          <Link 
            to={`/projets/pdf/${id}`} 
            target="_blank"
            className="btn btn-sm btn-info gap-1.5"
          >
            <Printer className="w-4 h-4" />
            PDF
          </Link>
          <Link 
            to={`/projets/edit/${id}`} 
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

      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-base-100 rounded-xl shadow-sm p-4 border border-base-200">
          <p className="text-xs text-base-content/40 flex items-center gap-1">
            <DollarSign className="w-3 h-3" /> Budget
          </p>
          <p className="text-2xl font-bold text-primary">{budgetTotal.toLocaleString()} €</p>
        </div>
        <div className="bg-base-100 rounded-xl shadow-sm p-4 border border-base-200">
          <p className="text-xs text-base-content/40 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Durée
          </p>
          <p className="text-2xl font-bold text-primary">{projet.duree_jours || 'N/A'} jours</p>
        </div>
        <div className="bg-base-100 rounded-xl shadow-sm p-4 border border-base-200">
          <p className="text-xs text-base-content/40 flex items-center gap-1">
            <Layers className="w-3 h-3" /> Phases
          </p>
          <p className="text-2xl font-bold text-primary">{phases.length}</p>
        </div>
        <div className="bg-base-100 rounded-xl shadow-sm p-4 border border-base-200">
          <p className="text-xs text-base-content/40 flex items-center gap-1">
            <Target className="w-3 h-3" /> Avancement
          </p>
          <p className="text-2xl font-bold text-primary">{avancement}%</p>
        </div>
      </div>

      {/* Informations détaillées */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Général */}
        <div className="bg-base-100 rounded-xl shadow-sm p-4 border border-base-200">
          <h3 className="text-sm font-semibold uppercase text-base-content/40 mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Informations générales
          </h3>
          <div className="space-y-2">
            <p className="text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4 text-base-content/40" />
              Agence: <span className="font-medium">{projet.agence_nom || 'Non assignée'}</span>
            </p>
            <p className="text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4 text-base-content/40" />
              Client: <span className="font-medium">{projet.client_nom || 'N/A'}</span>
            </p>
            <p className="text-sm flex items-center gap-2">
              <UserCircle className="w-4 h-4 text-base-content/40" />
              Chef de projet: <span className="font-medium">{projet.chef_projet_nom || 'Non assigné'}</span>
            </p>
            <p className="text-sm flex items-center gap-2">
              <HardHat className="w-4 h-4 text-base-content/40" />
              Type: <span className="font-medium">{projet.type_display || projet.type_projet}</span>
            </p>
            <p className="text-sm flex items-center gap-2">
              <Target className="w-4 h-4 text-base-content/40" />
              Statut: <span className={`font-medium text-${statutColor}`}>{getStatutLabel(projet.statut)}</span>
            </p>
            <p className="text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-base-content/40" />
              Niveau de risque: <span className="font-medium">{projet.niveau_risque || 'N/A'}</span>
            </p>
          </div>
        </div>

        {/* Localisation */}
        <div className="bg-base-100 rounded-xl shadow-sm p-4 border border-base-200">
          <h3 className="text-sm font-semibold uppercase text-base-content/40 mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Localisation
          </h3>
          <div className="space-y-2">
            <p className="text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4 text-base-content/40" />
              Adresse: <span className="font-medium">{projet.adresse_chantier || 'N/A'}</span>
            </p>
            <p className="text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4 text-base-content/40" />
              Ville: <span className="font-medium">{projet.ville || 'N/A'}</span>
            </p>
            <p className="text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4 text-base-content/40" />
              Code postal: <span className="font-medium">{projet.code_postal || 'N/A'}</span>
            </p>
            {projet.coordonnees_gps && (
              <p className="text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4 text-base-content/40" />
                GPS: <span className="font-medium">{projet.coordonnees_gps}</span>
              </p>
            )}
          </div>
        </div>

        {/* Calendrier */}
        <div className="bg-base-100 rounded-xl shadow-sm p-4 border border-base-200">
          <h3 className="text-sm font-semibold uppercase text-base-content/40 mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Calendrier
          </h3>
          <div className="space-y-2">
            <p className="text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-base-content/40" />
              Date de début: <span className="font-medium">{projet.date_debut ? new Date(projet.date_debut).toLocaleDateString('fr-FR') : 'N/A'}</span>
            </p>
            <p className="text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-base-content/40" />
              Date fin prévue: <span className="font-medium">{projet.date_fin_previsionnelle ? new Date(projet.date_fin_previsionnelle).toLocaleDateString('fr-FR') : 'N/A'}</span>
            </p>
            {projet.date_fin_reelle && (
              <p className="text-sm flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-base-content/40" />
                Date fin réelle: <span className="font-medium">{new Date(projet.date_fin_reelle).toLocaleDateString('fr-FR')}</span>
              </p>
            )}
            <p className="text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-base-content/40" />
              Durée: <span className="font-medium">{projet.duree_jours || 'N/A'} jours</span>
            </p>
          </div>
        </div>

        {/* Finances */}
        <div className="bg-base-100 rounded-xl shadow-sm p-4 border border-base-200">
          <h3 className="text-sm font-semibold uppercase text-base-content/40 mb-3 flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Finances
          </h3>
          <div className="space-y-2">
            <p className="text-sm flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-base-content/40" />
              Budget total: <span className="font-medium">{budgetTotal.toLocaleString()} €</span>
            </p>
            <p className="text-sm flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-base-content/40" />
              Budget MO: <span className="font-medium">{parseFloat(projet.budget_mo).toLocaleString()} €</span>
            </p>
            <p className="text-sm flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-base-content/40" />
              Budget matériaux: <span className="font-medium">{parseFloat(projet.budget_materiaux).toLocaleString()} €</span>
            </p>
            <p className="text-sm flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-base-content/40" />
              Budget sous-traitance: <span className="font-medium">{parseFloat(projet.budget_sous_traitance).toLocaleString()} €</span>
            </p>
            <p className="text-sm flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-base-content/40" />
              Coût total réel: <span className="font-medium text-error">{coutTotal.toLocaleString()} €</span>
            </p>
            <p className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-base-content/40" />
              Marge: <span className={`font-medium ${marge >= 0 ? 'text-success' : 'text-error'}`}>{marge.toLocaleString()} €</span>
            </p>
            <p className="text-sm flex items-center gap-2">
              <Target className="w-4 h-4 text-base-content/40" />
              Rentabilité prévisionnelle: <span className="font-medium">{projet.rentabilite_previsionnelle || 0}%</span>
            </p>
          </div>
        </div>
      </div>

      {/* Phases */}
      <div className="bg-base-100 rounded-xl shadow-sm p-4 border border-base-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold uppercase text-base-content/40 flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Phases ({phases.length})
          </h3>
          <Link to={`/phases/create?projet=${id}`} className="btn btn-sm btn-primary gap-1">
            <Plus className="w-4 h-4" />
            Ajouter une phase
          </Link>
        </div>
        {loadingPhases ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : phases.length === 0 ? (
          <p className="text-center text-base-content/40 py-8">Aucune phase</p>
        ) : (
          <div className="space-y-3">
            {phases.map(phase => (
              <div key={phase.id} className="border-b border-base-200 pb-3 last:border-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="badge badge-sm badge-neutral">
                      {phase.type_display || phase.type_phase}
                    </span>
                    <span className="text-sm font-medium">{phase.nom}</span>
                    <span className="text-xs text-base-content/40">Ordre {phase.ordre}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-base-content/60">
                      Avancement: {phase.taux_avancement}%
                    </span>
                    <Link 
                      to={`/phases/${phase.id}`} 
                      className="btn btn-ghost btn-xs btn-square"
                    >
                      <Eye className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-base-content/40 mt-1">
                  <span>Début: {phase.date_debut ? new Date(phase.date_debut).toLocaleDateString('fr-FR') : 'N/A'}</span>
                  <span>Fin prévue: {phase.date_fin_previsionnelle ? new Date(phase.date_fin_previsionnelle).toLocaleDateString('fr-FR') : 'N/A'}</span>
                  {phase.responsable_nom && <span>Responsable: {phase.responsable_nom}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Métadonnées */}
      <div className="text-xs text-base-content/40 text-center border-t border-base-200 pt-3">
        <p>Créé le {projet.created_at ? new Date(projet.created_at).toLocaleString('fr-FR') : 'N/A'}</p>
        {projet.updated_at && projet.updated_at !== projet.created_at && (
          <p>Modifié le {new Date(projet.updated_at).toLocaleString('fr-FR')}</p>
        )}
      </div>
    </div>
  );
}

export default ProjetDetail;