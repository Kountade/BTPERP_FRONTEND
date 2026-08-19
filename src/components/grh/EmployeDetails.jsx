// src/components/rh/EmployeDetails.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  UserCircle, 
  X, 
  RefreshCw,
  Wifi,
  WifiOff,
  AlertTriangle,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Building2,
  Award,
  DollarSign,
  Shield,
  CheckCircle,
  XCircle,
  Edit,
  ArrowLeft,
  Users,
  HardHat,
  Clock,
  Activity,
  FileText,
  GraduationCap,
  UserCheck,
  UserX,
  ChevronDown,
  ChevronUp,
  Eye,
  BarChart3,
  List,
  Grid
} from 'lucide-react';
import AxiosInstance from '../AxiosInstance';

function EmployeDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [employe, setEmploye] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [activeTab, setActiveTab] = useState('info');
  const [expandedCompetenceId, setExpandedCompetenceId] = useState(null);

  // Tabs
  const tabs = [
    { id: 'info', label: 'Informations', icon: UserCircle },
    { id: 'competences', label: 'Compétences', icon: Award },
    { id: 'formations', label: 'Formations', icon: GraduationCap },
    { id: 'pointages', label: 'Pointages', icon: Clock },
    { id: 'absences', label: 'Absences', icon: Calendar },
    { id: 'frais', label: 'Notes de frais', icon: FileText }
  ];

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

  // Charger l'employé
  useEffect(() => {
    const loadEmploye = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('Token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await AxiosInstance.get(`/employes/${id}/`, {
          headers: { Authorization: `Token ${token}` }
        });

        setEmploye(response.data);
        setError(null);
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
      loadEmploye();
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

      const response = await AxiosInstance.get(`/employes/${id}/`, {
        headers: { Authorization: `Token ${token}` }
      });

      setEmploye(response.data);
      setError(null);
    } catch (error) {
      console.error('Erreur rafraîchissement:', error);
      setError('Erreur lors du rafraîchissement');
    } finally {
      setLoading(false);
    }
  };

  // Toggle expansion compétence
  const toggleCompetenceExpand = (id) => {
    setExpandedCompetenceId(expandedCompetenceId === id ? null : id);
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

  if (error || !employe) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-warning mx-auto mb-4" />
          <h3 className="text-lg font-medium">Erreur</h3>
          <p className="text-base-content/60 text-sm mt-1">{error || 'Employé non trouvé'}</p>
          <button onClick={() => navigate('/employes')} className="btn btn-primary mt-4">
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  const fullName = `${employe.prenom || ''} ${employe.nom || ''}`.trim() || 'Employé';
  const age = employe.age || 0;
  const anciennete = employe.anciennete || 0;

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/employes')}
            className="btn btn-ghost btn-sm gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <UserCircle className="w-8 h-8 text-primary" />
            Détails de l'employé
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
            to={`/employes/edit/${employe.id}`} 
            className="btn btn-primary gap-2"
          >
            <Edit className="w-4 h-4" />
            Modifier
          </Link>
        </div>
      </div>

      {/* En-tête employé */}
      <div className="bg-base-100 rounded-lg shadow-sm p-6 border border-base-200">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="avatar placeholder">
            <div className={`w-24 h-24 rounded-full ${employe.actif ? 'bg-primary/20 text-primary' : 'bg-base-300 text-base-content/40'} flex items-center justify-center`}>
              <span className="text-4xl font-bold">{fullName.charAt(0).toUpperCase()}</span>
            </div>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-bold">{fullName}</h2>
            <div className="flex items-center gap-3 mt-1 flex-wrap justify-center sm:justify-start">
              <span className="badge badge-primary badge-lg gap-1">
                <Award className="w-4 h-4" />
                {employe.matricule}
              </span>
              <span className={`badge ${employe.actif ? 'badge-success' : 'badge-error'} badge-lg gap-1`}>
                {employe.actif ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                {employe.actif ? 'Actif' : 'Inactif'}
              </span>
              <span className="badge badge-info badge-lg gap-1">
                <Briefcase className="w-4 h-4" />
                {employe.poste_nom || 'N/A'}
              </span>
              <span className="badge badge-secondary badge-lg gap-1">
                <Building2 className="w-4 h-4" />
                {employe.service_nom || 'N/A'}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-2 text-sm text-base-content/60 flex-wrap justify-center sm:justify-start">
              <span className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                {employe.email}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                {employe.telephone || 'N/A'}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {age} ans
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {anciennete} an(s) d'ancienneté
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 bg-base-100 rounded-lg shadow-sm p-2 border border-base-200">
        {tabs.map(tab => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                isActive 
                  ? 'bg-primary text-primary-content shadow-md' 
                  : 'hover:bg-base-200'
              }`}
            >
              <TabIcon className="w-4 h-4" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Contenu des tabs */}
      <div className="bg-base-100 rounded-lg shadow-sm p-6 border border-base-200">
        
        {/* Tab: Informations */}
        {activeTab === 'info' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Identité */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <UserCircle className="w-5 h-5 text-primary" />
                Identité
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <UserCircle className="w-4 h-4 text-base-content/40" />
                  <span className="text-sm"><strong>Matricule:</strong> {employe.matricule}</span>
                </div>
                <div className="flex items-center gap-2">
                  <UserCircle className="w-4 h-4 text-base-content/40" />
                  <span className="text-sm"><strong>Nom:</strong> {employe.nom}</span>
                </div>
                <div className="flex items-center gap-2">
                  <UserCircle className="w-4 h-4 text-base-content/40" />
                  <span className="text-sm"><strong>Prénom:</strong> {employe.prenom}</span>
                </div>
                <div className="flex items-center gap-2">
                  <UserCircle className="w-4 h-4 text-base-content/40" />
                  <span className="text-sm"><strong>Sexe:</strong> {employe.sexe === 'M' ? 'Masculin' : 'Féminin'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-base-content/40" />
                  <span className="text-sm"><strong>Date de naissance:</strong> {employe.date_naissance ? new Date(employe.date_naissance).toLocaleDateString('fr-FR') : 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-base-content/40" />
                  <span className="text-sm"><strong>Lieu de naissance:</strong> {employe.lieu_naissance || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-base-content/40" />
                  <span className="text-sm"><strong>Nationalité:</strong> {employe.nationalite || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                Contact
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-base-content/40" />
                  <span className="text-sm"><strong>Email:</strong> {employe.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-base-content/40" />
                  <span className="text-sm"><strong>Téléphone:</strong> {employe.telephone || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-base-content/40" />
                  <span className="text-sm"><strong>Adresse:</strong> {employe.adresse || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-base-content/40" />
                  <span className="text-sm"><strong>Code postal:</strong> {employe.code_postal || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-base-content/40" />
                  <span className="text-sm"><strong>Ville:</strong> {employe.ville || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Professionnel */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" />
                Professionnel
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-base-content/40" />
                  <span className="text-sm"><strong>Situation:</strong> {employe.situation_display || employe.situation}</span>
                </div>
                <div className="flex items-center gap-2">
                  <HardHat className="w-4 h-4 text-base-content/40" />
                  <span className="text-sm"><strong>Poste:</strong> {employe.poste_nom || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-base-content/40" />
                  <span className="text-sm"><strong>Service:</strong> {employe.service_nom || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-base-content/40" />
                  <span className="text-sm"><strong>Date d'embauche:</strong> {employe.date_embauche ? new Date(employe.date_embauche).toLocaleDateString('fr-FR') : 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-base-content/40" />
                  <span className="text-sm"><strong>Date fin contrat:</strong> {employe.date_fin_contrat ? new Date(employe.date_fin_contrat).toLocaleDateString('fr-FR') : 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-base-content/40" />
                  <span className="text-sm"><strong>Fin période d'essai:</strong> {employe.date_essai_fin ? new Date(employe.date_essai_fin).toLocaleDateString('fr-FR') : 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-base-content/40" />
                  <span className="text-sm"><strong>Ancienneté:</strong> {employe.anciennete || 0} an(s)</span>
                </div>
              </div>
            </div>

            {/* Salaire */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                Salaire & Primes
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-base-content/40" />
                  <span className="text-sm"><strong>Salaire base:</strong> {employe.salaire_base?.toLocaleString()} €</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-base-content/40" />
                  <span className="text-sm"><strong>Taux horaire:</strong> {employe.taux_horaire || '0'} €</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-base-content/40" />
                  <span className="text-sm"><strong>Prime panier:</strong> {employe.prime_panier || '0'} €</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-base-content/40" />
                  <span className="text-sm"><strong>Indemnité KM:</strong> {employe.indemnite_km || '0'} €</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-base-content/40" />
                  <span className="text-sm"><strong>Prime ancienneté:</strong> {employe.prime_anciennete || '0'} €</span>
                </div>
              </div>
            </div>

            {/* Documents & Statut */}
            <div className="lg:col-span-2">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Documents & Statut
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-base-content/40" />
                    <span className="text-sm"><strong>N° Sécurité Sociale:</strong> {employe.numero_securite_sociale || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-base-content/40" />
                    <span className="text-sm"><strong>N° Permis:</strong> {employe.num_permis || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {employe.permis_valide ? (
                      <CheckCircle className="w-4 h-4 text-success" />
                    ) : (
                      <XCircle className="w-4 h-4 text-error" />
                    )}
                    <span className="text-sm"><strong>Permis valide:</strong> {employe.permis_valide ? 'Oui' : 'Non'}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {employe.actif ? (
                      <CheckCircle className="w-4 h-4 text-success" />
                    ) : (
                      <XCircle className="w-4 h-4 text-error" />
                    )}
                    <span className="text-sm"><strong>Actif:</strong> {employe.actif ? 'Oui' : 'Non'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {employe.disponible ? (
                      <CheckCircle className="w-4 h-4 text-success" />
                    ) : (
                      <XCircle className="w-4 h-4 text-warning" />
                    )}
                    <span className="text-sm"><strong>Disponible:</strong> {employe.disponible ? 'Oui' : 'Non'}</span>
                  </div>
                  {employe.agence_nom && (
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-base-content/40" />
                      <span className="text-sm"><strong>Agence:</strong> {employe.agence_nom}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Compétences */}
        {activeTab === 'competences' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Compétences
              </h3>
              <Link to={`/employes/${employe.id}/competences/add`} className="btn btn-primary btn-sm gap-1">
                <Plus className="w-4 h-4" />
                Ajouter
              </Link>
            </div>
            {employe.competences && employe.competences.length > 0 ? (
              <div className="space-y-3">
                {employe.competences.map((comp, idx) => (
                  <div key={idx} className="bg-base-200/30 rounded-lg p-4 border border-base-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{comp.competence_nom}</h4>
                        <div className="flex items-center gap-3 text-sm text-base-content/60 mt-1">
                          <span className={`badge ${comp.niveau === 'expert' ? 'badge-error' : comp.niveau === 'avance' ? 'badge-warning' : 'badge-info'} badge-sm`}>
                            {comp.niveau_display || comp.niveau}
                          </span>
                          <span>Catégorie: {comp.competence_categorie || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-base-content/40">
                          {comp.date_obtention ? new Date(comp.date_obtention).toLocaleDateString('fr-FR') : 'N/A'}
                        </span>
                        <button className="btn btn-ghost btn-xs btn-square text-error">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    {comp.date_expiration && (
                      <div className="mt-2 text-xs text-warning">
                        ⚠️ Expire le {new Date(comp.date_expiration).toLocaleDateString('fr-FR')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-base-content/40">Aucune compétence enregistrée</p>
            )}
          </div>
        )}

        {/* Tab: Formations */}
        {activeTab === 'formations' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary" />
                Formations
              </h3>
              <Link to={`/employes/${employe.id}/formations/add`} className="btn btn-primary btn-sm gap-1">
                <Plus className="w-4 h-4" />
                Ajouter
              </Link>
            </div>
            {employe.formations && employe.formations.length > 0 ? (
              <div className="space-y-3">
                {employe.formations.map((formation, idx) => (
                  <div key={idx} className="bg-base-200/30 rounded-lg p-4 border border-base-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{formation.nom}</h4>
                        <div className="flex items-center gap-3 text-sm text-base-content/60 mt-1">
                          <span>{formation.organisme}</span>
                          <span>{formation.duree_heures}h</span>
                          <span className={`badge ${formation.valide ? 'badge-success' : 'badge-warning'} badge-sm`}>
                            {formation.valide ? 'Validée' : 'En attente'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{new Date(formation.date_debut).toLocaleDateString('fr-FR')} - {new Date(formation.date_fin).toLocaleDateString('fr-FR')}</p>
                        <p className="text-xs text-base-content/40">{formation.cout?.toLocaleString()} €</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-base-content/40">Aucune formation enregistrée</p>
            )}
          </div>
        )}

        {/* Tab: Pointages */}
        {activeTab === 'pointages' && (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Pointages
            </h3>
            {employe.pointages_recents && employe.pointages_recents.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Heure</th>
                      <th>Type</th>
                      <th>Projet</th>
                      <th>Remarque</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employe.pointages_recents.map((pointage, idx) => (
                      <tr key={idx}>
                        <td>{new Date(pointage.date).toLocaleDateString('fr-FR')}</td>
                        <td>{pointage.heure}</td>
                        <td>
                          <span className={`badge ${pointage.type_pointage === 'arrivee' ? 'badge-success' : pointage.type_pointage === 'depart' ? 'badge-error' : 'badge-info'} badge-sm`}>
                            {pointage.type_display}
                          </span>
                        </td>
                        <td>{pointage.projet_nom || 'N/A'}</td>
                        <td>{pointage.remarque || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-base-content/40">Aucun pointage enregistré</p>
            )}
          </div>
        )}

        {/* Tab: Absences */}
        {activeTab === 'absences' && (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Absences
            </h3>
            {employe.absences_en_cours && employe.absences_en_cours.length > 0 ? (
              <div className="space-y-3">
                {employe.absences_en_cours.map((absence, idx) => (
                  <div key={idx} className="bg-base-200/30 rounded-lg p-4 border border-base-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{absence.type_display}</h4>
                        <div className="flex items-center gap-3 text-sm text-base-content/60 mt-1">
                          <span>{new Date(absence.date_debut).toLocaleDateString('fr-FR')} - {new Date(absence.date_fin).toLocaleDateString('fr-FR')}</span>
                          <span className={`badge ${absence.statut === 'approuvee' ? 'badge-success' : absence.statut === 'demandee' ? 'badge-warning' : 'badge-error'} badge-sm`}>
                            {absence.statut_display}
                          </span>
                          <span>{absence.nombre_jours} jour(s)</span>
                        </div>
                      </div>
                      {absence.motif && (
                        <p className="text-sm text-base-content/40 max-w-xs">{absence.motif}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-base-content/40">Aucune absence en cours</p>
            )}
          </div>
        )}

        {/* Tab: Notes de frais */}
        {activeTab === 'frais' && (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Notes de frais
            </h3>
            <p className="text-sm text-base-content/40">Les notes de frais seront affichées ici</p>
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
            <div className="stat-title text-xs">Compétences</div>
            <div className="stat-value text-xl">{employe.competences?.length || 0}</div>
          </div>
          <div className="stat bg-base-200/30 rounded-lg p-3">
            <div className="stat-title text-xs">Formations</div>
            <div className="stat-value text-xl">{employe.formations?.length || 0}</div>
          </div>
          <div className="stat bg-base-200/30 rounded-lg p-3">
            <div className="stat-title text-xs">Pointages (7j)</div>
            <div className="stat-value text-xl">{employe.pointages_recents?.length || 0}</div>
          </div>
          <div className="stat bg-base-200/30 rounded-lg p-3">
            <div className="stat-title text-xs">Absences en cours</div>
            <div className="stat-value text-xl text-warning">{employe.absences_en_cours?.length || 0}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmployeDetails;