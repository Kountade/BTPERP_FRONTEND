// src/components/rh/CompetenceDetails.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  Award, 
  X, 
  RefreshCw,
  Wifi,
  WifiOff,
  AlertTriangle,
  BookOpen,
  CheckCircle,
  XCircle,
  Edit,
  ArrowLeft,
  Users,
  Briefcase,
  Calendar,
  Mail,
  Phone,
  MapPin,
  ChevronDown,
  ChevronUp,
  Eye,
  BarChart3,
  UserCheck,
  UserX,
  HardHat
} from 'lucide-react';
import AxiosInstance from '../AxiosInstance';

function CompetenceDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [competence, setCompetence] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [expandedEmployeId, setExpandedEmployeId] = useState(null);
  const [employes, setEmployes] = useState([]);

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

  // Charger la compétence
  useEffect(() => {
    const loadCompetence = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('Token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await AxiosInstance.get(`/competences/${id}/`, {
          headers: { Authorization: `Token ${token}` }
        });

        setCompetence(response.data);
        setError(null);

        // Charger les employés ayant cette compétence
        try {
          const employesRes = await AxiosInstance.get(`/employes/?competence=${id}`, {
            headers: { Authorization: `Token ${token}` }
          });
          setEmployes(employesRes.data || []);
        } catch (e) {
          console.log('Aucun employé avec cette compétence');
          setEmployes([]);
        }

      } catch (error) {
        console.error('Erreur chargement:', error);
        if (error.response?.status === 401) {
          navigate('/login');
        } else {
          setError('Erreur lors du chargement des détails');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadCompetence();
    }
  }, [id, navigate]);

  // Rafraîchir
  const handleRefresh = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('Token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await AxiosInstance.get(`/competences/${id}/`, {
        headers: { Authorization: `Token ${token}` }
      });

      setCompetence(response.data);
      setError(null);

      const employesRes = await AxiosInstance.get(`/employes/?competence=${id}`, {
        headers: { Authorization: `Token ${token}` }
      });
      setEmployes(employesRes.data || []);

    } catch (error) {
      console.error('Erreur rafraîchissement:', error);
      setError('Erreur lors du rafraîchissement');
    } finally {
      setLoading(false);
    }
  };

  // Toggle expansion employé
  const toggleEmployeExpand = (id) => {
    setExpandedEmployeId(expandedEmployeId === id ? null : id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="mt-4 text-base-content/60">Chargement des détails...</p>
        </div>
      </div>
    );
  }

  if (error || !competence) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-warning mx-auto mb-4" />
          <h3 className="text-lg font-medium">Erreur</h3>
          <p className="text-base-content/60 text-sm mt-1">{error || 'Compétence non trouvée'}</p>
          <button onClick={() => navigate('/competences')} className="btn btn-primary mt-4">
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/competences')}
            className="btn btn-ghost btn-sm gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Award className="w-8 h-8 text-primary" />
            Détails de la compétence
          </h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className={`badge ${isOnline ? 'badge-success' : 'badge-error'} gap-1.5 px-3 py-2.5`}>
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            {isOnline ? 'En ligne' : 'Hors ligne'}
          </div>
          <button 
            onClick={handleRefresh}
            className="btn btn-ghost btn-sm gap-1"
          >
            <RefreshCw className="w-4 h-4" />
            Rafraîchir
          </button>
          <Link 
            to={`/competences/edit/${competence.id}`} 
            className="btn btn-primary gap-2"
          >
            <Edit className="w-4 h-4" />
            Modifier
          </Link>
        </div>
      </div>

      {/* En-tête compétence */}
      <div className="bg-base-100 rounded-lg shadow-sm p-6 border border-base-200">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="avatar placeholder">
            <div className="w-24 h-24 rounded-full bg-primary/20 text-primary flex items-center justify-center">
              <Award className="w-12 h-12" />
            </div>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-bold">{competence.nom}</h2>
            <div className="flex items-center gap-3 mt-1 flex-wrap justify-center sm:justify-start">
              {competence.categorie && (
                <span className="badge badge-primary badge-lg gap-1">
                  <Briefcase className="w-4 h-4" />
                  {competence.categorie}
                </span>
              )}
              <span className="badge badge-info badge-lg gap-1">
                <Users className="w-4 h-4" />
                {employes.length} employés
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Informations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informations générales */}
        <div className="bg-base-100 rounded-lg shadow-sm p-6 border border-base-200">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Informations générales
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-base-content/40" />
              <span className="text-sm">
                <strong>Nom:</strong> {competence.nom}
              </span>
            </div>
            {competence.categorie && (
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-base-content/40" />
                <span className="text-sm">
                  <strong>Catégorie:</strong> {competence.categorie}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-base-content/40" />
              <span className="text-sm">
                <strong>Employés:</strong> {employes.length}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-base-100 rounded-lg shadow-sm p-6 border border-base-200">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Description
          </h3>
          {competence.description ? (
            <p className="text-sm whitespace-pre-wrap">{competence.description}</p>
          ) : (
            <p className="text-sm text-base-content/40">Aucune description</p>
          )}
        </div>
      </div>

      {/* Employés avec cette compétence */}
      <div className="bg-base-100 rounded-lg shadow-sm p-6 border border-base-200">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Employés avec cette compétence ({employes.length})
        </h3>
        {employes.length === 0 ? (
          <p className="text-sm text-base-content/40">Aucun employé ne possède cette compétence</p>
        ) : (
          <div className="space-y-3">
            {employes.map((emp) => {
              const isExpanded = expandedEmployeId === emp.id;
              const fullName = `${emp.prenom || ''} ${emp.nom || ''}`.trim() || 'Employé';
              
              return (
                <div 
                  key={emp.id} 
                  className="bg-base-200/30 rounded-lg border border-base-200 overflow-hidden"
                >
                  <div 
                    className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-base-200/50 transition-colors"
                    onClick={() => toggleEmployeExpand(emp.id)}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="avatar placeholder">
                        <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                          <span className="font-bold">
                            {fullName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-sm truncate">{fullName}</h4>
                          <span className="badge badge-ghost badge-xs">{emp.matricule}</span>
                          <span className={`badge ${emp.actif ? 'badge-success' : 'badge-error'} badge-xs`}>
                            {emp.actif ? 'Actif' : 'Inactif'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-base-content/60 mt-0.5 flex-wrap">
                          <span className="flex items-center gap-1">
                            <HardHat className="w-3 h-3" />
                            {emp.poste_nom || 'N/A'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {emp.email}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Link 
                        to={`/employes/${emp.id}`} 
                        className="btn btn-ghost btn-xs btn-square"
                        onClick={(e) => e.stopPropagation()}
                        title="Voir l'employé"
                      >
                        <Eye className="w-3 h-3" />
                      </Link>
                      <button 
                        className="btn btn-ghost btn-xs btn-square"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleEmployeExpand(emp.id);
                        }}
                      >
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-base-200 p-3 bg-base-200/30">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <h5 className="text-xs font-semibold uppercase text-base-content/40 mb-1">Contact</h5>
                          <p className="text-sm flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {emp.email}
                          </p>
                          <p className="text-sm flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {emp.telephone || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <h5 className="text-xs font-semibold uppercase text-base-content/40 mb-1">Embauche</h5>
                          <p className="text-sm">
                            {emp.date_embauche ? new Date(emp.date_embauche).toLocaleDateString('fr-FR') : 'N/A'}
                          </p>
                          <p className="text-sm text-base-content/60">
                            Ancienneté: {emp.anciennete || 0} an(s)
                          </p>
                        </div>
                        <div>
                          <h5 className="text-xs font-semibold uppercase text-base-content/40 mb-1">Niveau</h5>
                          <p className="text-sm">
                            {emp.niveau_competence || 'Non défini'}
                          </p>
                          <p className="text-sm text-base-content/60">
                            {emp.situation_display || emp.situation}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Statistiques */}
      <div className="bg-base-100 rounded-lg shadow-sm p-6 border border-base-200">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          Statistiques
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="stat bg-base-200/30 rounded-lg p-3">
            <div className="stat-title text-xs">Total employés</div>
            <div className="stat-value text-xl">{employes.length}</div>
          </div>
          <div className="stat bg-base-200/30 rounded-lg p-3">
            <div className="stat-title text-xs">Actifs</div>
            <div className="stat-value text-xl text-success">
              {employes.filter(e => e.actif).length}
            </div>
          </div>
          <div className="stat bg-base-200/30 rounded-lg p-3">
            <div className="stat-title text-xs">Inactifs</div>
            <div className="stat-value text-xl text-error">
              {employes.filter(e => !e.actif).length}
            </div>
          </div>
          <div className="stat bg-base-200/30 rounded-lg p-3">
            <div className="stat-title text-xs">Postes requis</div>
            <div className="stat-value text-xl text-info">
              {competence.postes_requis || 0}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompetenceDetails;