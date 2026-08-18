// src/components/Utilisateurs.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  Mail,
  Phone,
  UserCircle,
  Building2,
  Shield,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  AlertTriangle,
  Calendar,
  Clock,
  HardHat,
  Wrench,
  Package,
  Truck,
  Handshake,
  Calculator,
  Award,
  CheckCircle,
  XCircle,
  ShoppingBag,
  Clipboard,
  MapPin
} from 'lucide-react';

import AxiosInstance from '../AxiosInstance';

function Utilisateurs() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterAgence, setFilterAgence] = useState('all');
  const [agences, setAgences] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ✅ Configuration des rôles BTP (identique à AgenceList)
  const ROLE_CONFIG = {
    pdg: { label: 'PDG', icon: Shield, color: 'badge-error' },
    directeur_agence: { label: 'Directeur Agence', icon: Building2, color: 'badge-primary' },
    chef_chantier: { label: 'Chef Chantier', icon: HardHat, color: 'badge-warning' },
    conducteur_travaux: { label: 'Conducteur Travaux', icon: HardHat, color: 'badge-secondary' },
    technicien: { label: 'Technicien', icon: Wrench, color: 'badge-info' },
    gestionnaire_stock: { label: 'Gestionnaire Stock', icon: Package, color: 'badge-success' },
    commercial_btp: { label: 'Commercial BTP', icon: Handshake, color: 'badge-accent' },
    comptable_btp: { label: 'Comptable BTP', icon: Calculator, color: 'badge-info' },
    responsable_hse: { label: 'Responsable HSE', icon: Shield, color: 'badge-warning' },
    responsable_rh: { label: 'Responsable RH', icon: Users, color: 'badge-secondary' },
    acheteur: { label: 'Acheteur', icon: ShoppingBag, color: 'badge-primary' },
    securite: { label: 'Sécurité', icon: Shield, color: 'badge-error' },
    responsable_qualite: { label: 'Responsable Qualité', icon: CheckCircle, color: 'badge-success' },
    assistant_chantier: { label: 'Assistant Chantier', icon: Clipboard, color: 'badge-info' },
    assistant_admin: { label: 'Assistant Admin', icon: UserCircle, color: 'badge-ghost' }
  };

  const ROLES = [
    { value: 'pdg', label: 'PDG' },
    { value: 'directeur_agence', label: 'Directeur Agence' },
    { value: 'chef_chantier', label: 'Chef Chantier' },
    { value: 'conducteur_travaux', label: 'Conducteur Travaux' },
    { value: 'technicien', label: 'Technicien' },
    { value: 'gestionnaire_stock', label: 'Gestionnaire Stock' },
    { value: 'commercial_btp', label: 'Commercial BTP' },
    { value: 'comptable_btp', label: 'Comptable BTP' },
    { value: 'responsable_hse', label: 'Responsable HSE' },
    { value: 'responsable_rh', label: 'Responsable RH' },
    { value: 'acheteur', label: 'Acheteur' },
    { value: 'securite', label: 'Sécurité' },
    { value: 'responsable_qualite', label: 'Responsable Qualité' },
    { value: 'assistant_chantier', label: 'Assistant Chantier' },
    { value: 'assistant_admin', label: 'Assistant Admin' }
  ];

  // Charger les utilisateurs
  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('Token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await AxiosInstance.get('/users/', {
        headers: { Authorization: `Token ${token}` }
      });

      setUsers(response.data || []);
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error);
      
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        setError('Erreur lors du chargement des utilisateurs');
        const cachedData = localStorage.getItem('users_cache');
        if (cachedData) {
          setUsers(JSON.parse(cachedData));
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Charger les agences pour le filtre
  const loadAgences = async () => {
    try {
      const token = localStorage.getItem('Token');
      if (!token) return;

      const response = await AxiosInstance.get('/agences/', {
        headers: { Authorization: `Token ${token}` }
      });

      setAgences(response.data || []);
    } catch (error) {
      console.error('Erreur chargement agences:', error);
    }
  };

  // Rafraîchir avec animation
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadUsers();
    await loadAgences();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // Sauvegarder en cache local
  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem('users_cache', JSON.stringify(users));
    }
  }, [users]);

  // Charger au montage
  useEffect(() => {
    loadUsers();
    loadAgences();
  }, []);

  // Filtrer les utilisateurs
  const filteredUsers = users.filter(user => {
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
    const matchSearch = fullName.includes(searchTerm.toLowerCase()) ||
                       user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       user.username?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Vérifier le rôle
    let matchRole = true;
    if (filterRole !== 'all') {
      const userRoles = user.roles_agence?.map(r => r.role) || [];
      if (user.role_global === 'pdg') {
        matchRole = filterRole === 'pdg';
      } else {
        matchRole = userRoles.includes(filterRole);
      }
    }
    
    // Vérifier l'agence
    let matchAgence = true;
    if (filterAgence !== 'all') {
      const userAgences = user.roles_agence?.map(r => r.agence_id) || [];
      matchAgence = userAgences.includes(parseInt(filterAgence));
    }
    
    const matchStatus = filterStatus === 'all' || 
                       (filterStatus === 'active' && user.is_active) ||
                       (filterStatus === 'inactive' && !user.is_active);
    
    return matchSearch && matchRole && matchAgence && matchStatus;
  });

  // Supprimer un utilisateur
  const handleDelete = async () => {
    if (!selectedUser) return;
    
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('Token');
      await AxiosInstance.delete(`/users/${selectedUser.id}/`, {
        headers: { Authorization: `Token ${token}` }
      });

      setUsers(users.filter(u => u.id !== selectedUser.id));
      setShowDeleteModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  // Toggle expansion
  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Statistiques
  const stats = {
    total: users.length,
    active: users.filter(u => u.is_active).length,
    inactive: users.filter(u => !u.is_active).length,
    pdg: users.filter(u => u.role_global === 'pdg').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="mt-4 text-base-content/60">Chargement des utilisateurs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header avec bouton rafraîchir */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-8 h-8 text-primary" />
            Utilisateurs BTP
          </h1>
          <p className="text-base-content/60 text-sm mt-1">
            Gérez tous les utilisateurs de votre plateforme
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button 
            onClick={handleRefresh}
            className={`btn btn-ghost btn-sm gap-1.5 ${isRefreshing ? 'animate-spin' : ''}`}
            title="Rafraîchir la liste"
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Rafraîchir
          </button>
          
          <Link to="/utilisateurs/create" className="btn btn-primary gap-2">
            <Plus className="w-5 h-5" />
            Nouvel utilisateur
          </Link>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="stat bg-base-100 rounded-lg shadow-sm p-4">
          <div className="stat-title text-xs">Total</div>
          <div className="stat-value text-2xl">{stats.total}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg shadow-sm p-4">
          <div className="stat-title text-xs">Actifs</div>
          <div className="stat-value text-2xl text-success">{stats.active}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg shadow-sm p-4">
          <div className="stat-title text-xs">Inactifs</div>
          <div className="stat-value text-2xl text-error">{stats.inactive}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg shadow-sm p-4">
          <div className="stat-title text-xs">PDG</div>
          <div className="stat-value text-2xl text-error">{stats.pdg}</div>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-4 bg-base-100 p-4 rounded-lg shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input input-bordered w-full pl-10"
          />
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <select 
            value={filterRole} 
            onChange={(e) => setFilterRole(e.target.value)}
            className="select select-bordered select-sm"
          >
            <option value="all">Tous les rôles</option>
            {ROLES.map(role => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>

          <select 
            value={filterAgence} 
            onChange={(e) => setFilterAgence(e.target.value)}
            className="select select-bordered select-sm"
          >
            <option value="all">Toutes les agences</option>
            {agences.map(agence => (
              <option key={agence.id} value={agence.id}>
                {agence.nom}
              </option>
            ))}
          </select>

          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="select select-bordered select-sm"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="inactive">Inactifs</option>
          </select>

          <button 
            onClick={handleRefresh} 
            className={`btn btn-ghost btn-sm gap-1 ${isRefreshing ? 'animate-spin' : ''}`}
            title="Rafraîchir"
            disabled={isRefreshing}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Erreur */}
      {error && (
        <div className="alert alert-warning shadow-lg">
          <AlertTriangle className="w-6 h-6" />
          <span>{error}</span>
          <button onClick={handleRefresh} className="btn btn-sm btn-ghost">Réessayer</button>
        </div>
      )}

      {/* Liste des utilisateurs */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-12 bg-base-100 rounded-lg shadow-sm">
          <Users className="w-16 h-16 text-base-content/20 mx-auto mb-4" />
          <h3 className="text-lg font-medium">Aucun utilisateur trouvé</h3>
          <p className="text-base-content/60 text-sm mt-1">
            {searchTerm || filterRole !== 'all' || filterStatus !== 'all' || filterAgence !== 'all'
              ? 'Aucun utilisateur ne correspond à vos filtres'
              : 'Commencez par créer votre premier utilisateur'}
          </p>
          <Link to="/utilisateurs/create" className="btn btn-primary mt-4 gap-2">
            <Plus className="w-5 h-5" />
            Créer un utilisateur
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredUsers.map((user) => {
            const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email;
            const isExpanded = expandedId === user.id;
            
            let mainRole = null;
            let mainRoleConfig = null;
            
            if (user.role_global === 'pdg') {
              mainRole = 'pdg';
              mainRoleConfig = ROLE_CONFIG.pdg;
            } else if (user.roles_agence && user.roles_agence.length > 0) {
              mainRole = user.roles_agence[0].role;
              mainRoleConfig = ROLE_CONFIG[mainRole] || { label: mainRole, icon: UserCircle, color: 'badge-ghost' };
            }

            return (
              <div 
                key={user.id} 
                className={`bg-base-100 rounded-lg shadow-sm border ${user.is_active ? 'border-base-200' : 'border-error/20'} overflow-hidden transition-all`}
              >
                {/* Ligne principale */}
                <div 
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-base-200/50 transition-colors"
                  onClick={() => toggleExpand(user.id)}
                >
                  <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                    {/* Avatar */}
                    <div className="avatar placeholder">
                      <div className={`w-10 h-10 rounded-full ${user.is_active ? 'bg-primary/20 text-primary' : 'bg-base-300 text-base-content/40'} flex items-center justify-center`}>
                        <span className="font-bold text-lg">
                          {fullName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-base truncate">
                          {fullName}
                        </h3>
                        <span className="text-xs text-base-content/40 font-mono">
                          ID: {user.id}
                        </span>
                        {!user.is_active && (
                          <span className="badge badge-error badge-sm">Inactif</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-base-content/60 mt-0.5 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </span>
                        {mainRoleConfig && (
                          <span className={`badge ${mainRoleConfig.color} badge-sm gap-1`}>
                            <mainRoleConfig.icon className="w-3 h-3" />
                            {mainRoleConfig.label}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Statistiques rapides */}
                    <div className="flex items-center gap-3 text-xs text-base-content/40 mr-2">
                      {user.roles_agence && user.roles_agence.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {user.roles_agence.length}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <Link 
                        to={`/utilisateurs/${user.id}`} 
                        className="btn btn-ghost btn-sm btn-square"
                        onClick={(e) => e.stopPropagation()}
                        title="Voir les détails"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link 
                        to={`/utilisateurs/edit/${user.id}`} 
                        className="btn btn-ghost btn-sm btn-square"
                        onClick={(e) => e.stopPropagation()}
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button 
                        className="btn btn-ghost btn-sm btn-square text-error hover:bg-error/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedUser(user);
                          setShowDeleteModal(true);
                        }}
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button 
                        className="btn btn-ghost btn-sm btn-square"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(user.id);
                        }}
                      >
                        {isExpanded ? 
                          <ChevronUp className="w-4 h-4" /> : 
                          <ChevronDown className="w-4 h-4" />
                        }
                      </button>
                    </div>
                  </div>
                </div>

                {/* Détails étendus */}
                {isExpanded && (
                  <div className="border-t border-base-200 p-4 bg-base-200/30">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <h4 className="text-xs font-semibold uppercase text-base-content/40 mb-2">Informations</h4>
                        <p className="text-sm flex items-center gap-2">
                          <UserCircle className="w-4 h-4" />
                          {user.first_name || ''} {user.last_name || ''}
                        </p>
                        <p className="text-sm flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {user.email}
                        </p>
                        {user.phone && (
                          <p className="text-sm flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            {user.phone}
                          </p>
                        )}
                        {user.employee_id && (
                          <p className="text-sm flex items-center gap-2 text-base-content/60">
                            <Award className="w-4 h-4" />
                            Matricule: {user.employee_id}
                          </p>
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold uppercase text-base-content/40 mb-2">Rôles</h4>
                        {user.role_global === 'pdg' ? (
                          <span className="badge badge-error gap-1">
                            <Shield className="w-3 h-3" />
                            PDG - Accès total
                          </span>
                        ) : (
                          <div className="space-y-1">
                            {user.roles_agence?.map((role, index) => {
                              const config = ROLE_CONFIG[role.role];
                              return (
                                <div key={index} className="flex items-center gap-2 text-sm">
                                  <span className={`badge ${config?.color || 'badge-ghost'} gap-1`}>
                                    {config && <config.icon className="w-3 h-3" />}
                                    {config?.label || role.role}
                                  </span>
                                  <span className="text-xs text-base-content/40">
                                    {role.agence_nom}
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
                      <div>
                        <h4 className="text-xs font-semibold uppercase text-base-content/40 mb-2">Statut</h4>
                        <div className="space-y-1 text-sm">
                          <p className="flex items-center gap-2">
                            {user.is_active ? (
                              <CheckCircle className="w-4 h-4 text-success" />
                            ) : (
                              <XCircle className="w-4 h-4 text-error" />
                            )}
                            {user.is_active ? 'Actif' : 'Inactif'}
                          </p>
                          {user.last_login && (
                            <p className="flex items-center gap-2 text-base-content/60">
                              <Clock className="w-4 h-4" />
                              Dernière connexion: {new Date(user.last_login).toLocaleDateString('fr-FR')}
                            </p>
                          )}
                          {user.date_joined && (
                            <p className="flex items-center gap-2 text-base-content/60">
                              <Calendar className="w-4 h-4" />
                              Inscrit le: {new Date(user.date_joined).toLocaleDateString('fr-FR')}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-base-100 rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 text-error mb-4">
              <AlertTriangle className="w-8 h-8" />
              <h3 className="text-xl font-bold">Confirmer la suppression</h3>
            </div>
            
            <p className="text-base-content/70">
              Êtes-vous sûr de vouloir supprimer l'utilisateur 
              <span className="font-semibold text-base-content"> "{selectedUser.email}"</span> ?
            </p>
            <p className="text-sm text-error/70 mt-2">
              ⚠️ Cette action est irréversible.
            </p>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedUser(null);
                }}
                className="btn flex-1"
                disabled={isDeleting}
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                className="btn btn-error flex-1 gap-2"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Suppression...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Supprimer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Utilisateurs;