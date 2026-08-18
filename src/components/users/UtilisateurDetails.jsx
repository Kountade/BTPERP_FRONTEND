// src/components/UtilisateurDetails.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  UserCircle, 
  Mail, 
  Phone, 
  Building2, 
  Shield, 
  X, 
  RefreshCw,
  Users,
  HardHat,
  Package,
  Truck,
  Handshake,
  Calculator,
  Award,
  Calendar,
  MapPin,
  CheckCircle,
  XCircle,
  Edit,
  ArrowLeft,
  Clock,
  Wifi,
  WifiOff,
  AlertTriangle
} from 'lucide-react';
import AxiosInstance from '../AxiosInstance'

function UtilisateurDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Configuration des rôles
  const ROLE_CONFIG = {
    pdg: { label: 'PDG', icon: Shield, color: 'badge-error' },
    directeur_agence: { label: 'Directeur Agence', icon: Building2, color: 'badge-primary' },
    chef_chantier: { label: 'Chef Chantier', icon: HardHat, color: 'badge-warning' },
    conducteur_travaux: { label: 'Conducteur Travaux', icon: HardHat, color: 'badge-secondary' },
    technicien: { label: 'Technicien', icon: HardHat, color: 'badge-info' },
    gestionnaire_stock: { label: 'Gestionnaire Stock', icon: Package, color: 'badge-success' },
    commercial_btp: { label: 'Commercial BTP', icon: Handshake, color: 'badge-accent' },
    comptable_btp: { label: 'Comptable BTP', icon: Calculator, color: 'badge-info' },
    responsable_hse: { label: 'Responsable HSE', icon: Shield, color: 'badge-warning' },
    responsable_rh: { label: 'Responsable RH', icon: Users, color: 'badge-secondary' },
    acheteur: { label: 'Acheteur', icon: Package, color: 'badge-primary' },
    securite: { label: 'Sécurité', icon: Shield, color: 'badge-error' },
    responsable_qualite: { label: 'Responsable Qualité', icon: CheckCircle, color: 'badge-success' },
    assistant_chantier: { label: 'Assistant Chantier', icon: Users, color: 'badge-info' }
  };

  const CONTRACT_LABELS = {
    cdi: 'CDI',
    cdd: 'CDD',
    interim: 'Intérim',
    apprenti: 'Apprenti',
    stagiaire: 'Stagiaire'
  };

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

  // Charger l'utilisateur
  useEffect(() => {
    const loadUser = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('Token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await AxiosInstance.get(`/users/${id}/`, {
          headers: { Authorization: `Token ${token}` }
        });

        setUser(response.data);
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
      loadUser();
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

      const response = await AxiosInstance.get(`/users/${id}/`, {
        headers: { Authorization: `Token ${token}` }
      });

      setUser(response.data);
      setError(null);
    } catch (error) {
      console.error('Erreur rafraîchissement:', error);
      setError('Erreur lors du rafraîchissement');
    } finally {
      setLoading(false);
    }
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

  if (error || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-warning mx-auto mb-4" />
          <h3 className="text-lg font-medium">Erreur</h3>
          <p className="text-base-content/60 text-sm mt-1">{error || 'Utilisateur non trouvé'}</p>
          <button onClick={() => navigate('/utilisateurs')} className="btn btn-primary mt-4">
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email;
  
  // Rôle principal
  let mainRole = null;
  let mainRoleConfig = null;
  if (user.role_global === 'pdg') {
    mainRole = 'pdg';
    mainRoleConfig = ROLE_CONFIG.pdg;
  } else if (user.roles_agence && user.roles_agence.length > 0) {
    mainRole = user.roles_agence[0].role;
    mainRoleConfig = ROLE_CONFIG[mainRole];
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/utilisateurs')}
            className="btn btn-ghost btn-sm gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <UserCircle className="w-8 h-8 text-primary" />
            Détails utilisateur
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
            to={`/utilisateurs/edit/${user.id}`} 
            className="btn btn-primary gap-2"
          >
            <Edit className="w-4 h-4" />
            Modifier
          </Link>
        </div>
      </div>

      {/* En-tête utilisateur */}
      <div className="bg-base-100 rounded-lg shadow-sm p-6 border border-base-200">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="avatar placeholder">
            <div className="w-24 h-24 rounded-full bg-primary/20 text-primary flex items-center justify-center">
              <span className="text-4xl font-bold">{fullName.charAt(0).toUpperCase()}</span>
            </div>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-bold">{fullName}</h2>
            <div className="flex items-center gap-3 mt-1 flex-wrap justify-center sm:justify-start">
              <span className="flex items-center gap-1 text-base-content/60">
                <Mail className="w-4 h-4" />
                {user.email}
              </span>
              {mainRoleConfig && (
                <span className={`badge ${mainRoleConfig.color} badge-lg gap-1`}>
                  <mainRoleConfig.icon className="w-4 h-4" />
                  {mainRoleConfig.label}
                </span>
              )}
              <span className={`badge ${user.is_active ? 'badge-success' : 'badge-error'} badge-lg gap-1`}>
                {user.is_active ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                {user.is_active ? 'Actif' : 'Inactif'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Informations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informations personnelles */}
        <div className="bg-base-100 rounded-lg shadow-sm p-6 border border-base-200">
          <h3 className="text-lg font-semibold mb-4">Informations personnelles</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <UserCircle className="w-4 h-4 text-base-content/40" />
              <span className="text-sm">
                <strong>Nom complet:</strong> {fullName}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-base-content/40" />
              <span className="text-sm">
                <strong>Email:</strong> {user.email}
              </span>
            </div>
            {user.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-base-content/40" />
                <span className="text-sm">
                  <strong>Téléphone:</strong> {user.phone}
                </span>
              </div>
            )}
            {user.birthday && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-base-content/40" />
                <span className="text-sm">
                  <strong>Date de naissance:</strong> {new Date(user.birthday).toLocaleDateString('fr-FR')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Rôles et agences */}
        <div className="bg-base-100 rounded-lg shadow-sm p-6 border border-base-200">
          <h3 className="text-lg font-semibold mb-4">Rôles et agences</h3>
          {user.role_global === 'pdg' ? (
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-error" />
              <span className="text-sm font-medium text-error">PDG - Accès total sur toutes les agences</span>
            </div>
          ) : (
            <div className="space-y-3">
              {user.roles_agence?.map((role, index) => {
                const config = ROLE_CONFIG[role.role];
                return (
                  <div key={index} className="flex items-center justify-between p-2 bg-base-200/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className={`badge ${config?.color || 'badge-ghost'} gap-1`}>
                        {config && <config.icon className="w-3 h-3" />}
                        {config?.label || role.role}
                      </span>
                      <span className="text-sm text-base-content/60">
                        {role.agence_nom}
                      </span>
                    </div>
                    <span className="text-xs text-base-content/40">
                      {role.est_actif ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                );
              })}
              {(!user.roles_agence || user.roles_agence.length === 0) && (
                <p className="text-sm text-base-content/40">Aucun rôle assigné</p>
              )}
            </div>
          )}
        </div>

        {/* Informations RH */}
        <div className="bg-base-100 rounded-lg shadow-sm p-6 border border-base-200">
          <h3 className="text-lg font-semibold mb-4">Informations RH</h3>
          <div className="space-y-3">
            {user.employee_id && (
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-base-content/40" />
                <span className="text-sm">
                  <strong>Matricule:</strong> {user.employee_id}
                </span>
              </div>
            )}
            {user.hire_date && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-base-content/40" />
                <span className="text-sm">
                  <strong>Date d'embauche:</strong> {new Date(user.hire_date).toLocaleDateString('fr-FR')}
                </span>
              </div>
            )}
            {user.contract_type && (
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-base-content/40" />
                <span className="text-sm">
                  <strong>Type de contrat:</strong> {CONTRACT_LABELS[user.contract_type] || user.contract_type}
                </span>
              </div>
            )}
            {user.specialite_principale && (
              <div className="flex items-center gap-2">
                <HardHat className="w-4 h-4 text-base-content/40" />
                <span className="text-sm">
                  <strong>Spécialité:</strong> {user.specialite_principale}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Activité */}
        <div className="bg-base-100 rounded-lg shadow-sm p-6 border border-base-200">
          <h3 className="text-lg font-semibold mb-4">Activité</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-base-content/40" />
              <span className="text-sm">
                <strong>Dernière connexion:</strong> {user.last_login ? new Date(user.last_login).toLocaleString('fr-FR') : 'Jamais'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-base-content/40" />
              <span className="text-sm">
                <strong>Inscrit le:</strong> {user.date_joined ? new Date(user.date_joined).toLocaleDateString('fr-FR') : 'N/A'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-base-content/40" />
              <span className="text-sm">
                <strong>Staff:</strong> {user.is_staff ? 'Oui' : 'Non'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-base-content/40" />
              <span className="text-sm">
                <strong>Superuser:</strong> {user.is_superuser ? 'Oui' : 'Non'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Adresse */}
      {(user.address || user.city || user.postal_code || user.country) && (
        <div className="bg-base-100 rounded-lg shadow-sm p-6 border border-base-200">
          <h3 className="text-lg font-semibold mb-4">Adresse</h3>
          <div className="space-y-2">
            {user.address && (
              <p className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-base-content/40" />
                {user.address}
              </p>
            )}
            <p className="text-sm text-base-content/60">
              {user.postal_code} {user.city} {user.country}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default UtilisateurDetails;