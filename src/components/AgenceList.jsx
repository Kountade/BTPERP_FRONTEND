// src/components/AgenceList.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { 
  Building2, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  MapPin,
  Phone,
  Mail,
  Users,
  Package,
  Truck,
  HardHat,
  ChevronDown,
  ChevronUp,
  X,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertTriangle,
  Shield,
  Handshake,
  Calculator,
  UserCog,
  FileText,
  Calendar,
  Clock,
  DollarSign,
  Home,
  Globe,
  UserCheck,
  Settings,
  LogOut,
  Menu,
  Bell,
  Moon,
  Sun,
  Filter,
  ArrowLeft,
  ArrowRight,
  Save,
  X as XIcon
} from 'lucide-react';

import AxiosInstance from './AxiosInstance';

function AgenceList() {
  const navigate = useNavigate();
  const [agences, setAgences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterRegion, setFilterRegion] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAgence, setSelectedAgence] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const TYPE_AGENCE = {
    siege: { label: 'Siège Social', icon: Building2, color: 'badge-error' },
    regionale: { label: 'Agence Régionale', icon: MapPin, color: 'badge-primary' },
    chantier: { label: 'Base Vie Chantier', icon: HardHat, color: 'badge-warning' },
    logistique: { label: 'Dépôt Logistique', icon: Package, color: 'badge-success' }
  };

  const REGIONS = [
    'nord', 'sud', 'est', 'ouest', 'centre', 'international'
  ];

  // Charger les agences
  const loadAgences = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('Token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await AxiosInstance.get('/agences/', {
        headers: { Authorization: `Token ${token}` }
      });

      setAgences(response.data || []);
    } catch (error) {
      console.error('Erreur chargement agences:', error);
      
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        setError('Erreur lors du chargement des agences');
        const cachedData = localStorage.getItem('agences_cache');
        if (cachedData) {
          setAgences(JSON.parse(cachedData));
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Rafraîchir avec animation
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadAgences();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // Sauvegarder en cache local
  useEffect(() => {
    if (agences.length > 0) {
      localStorage.setItem('agences_cache', JSON.stringify(agences));
    }
  }, [agences]);

  // Charger au montage
  useEffect(() => {
    loadAgences();
  }, []);

  // Filtrer les agences
  const filteredAgences = agences.filter(agence => {
    const matchSearch = agence.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       agence.ville?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       agence.code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType === 'all' || agence.type_agence === filterType;
    const matchRegion = filterRegion === 'all' || agence.region === filterRegion;
    return matchSearch && matchType && matchRegion;
  });

  // Supprimer une agence
  const handleDelete = async () => {
    if (!selectedAgence) return;
    
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('Token');
      await AxiosInstance.delete(`/agences/${selectedAgence.id}/`, {
        headers: { Authorization: `Token ${token}` }
      });

      setAgences(agences.filter(a => a.id !== selectedAgence.id));
      setShowDeleteModal(false);
      setSelectedAgence(null);
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
    total: agences.length,
    siege: agences.filter(a => a.type_agence === 'siege').length,
    regionale: agences.filter(a => a.type_agence === 'regionale').length,
    chantier: agences.filter(a => a.type_agence === 'chantier').length,
    logistique: agences.filter(a => a.type_agence === 'logistique').length,
    actives: agences.filter(a => a.est_active).length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="mt-4 text-base-content/60">Chargement des agences...</p>
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
            <Building2 className="w-8 h-8 text-primary" />
            Agences BTP
          </h1>
          <p className="text-base-content/60 text-sm mt-1">
            Gérez toutes vos agences et chantiers
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* ✅ Bouton Rafraîchir */}
          <button 
            onClick={handleRefresh}
            className={`btn btn-ghost btn-sm gap-1.5 ${isRefreshing ? 'animate-spin' : ''}`}
            title="Rafraîchir la liste"
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Rafraîchir
          </button>
          
          <Link to="/agences/create" className="btn btn-primary gap-2">
            <Plus className="w-5 h-5" />
            Nouvelle agence
          </Link>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="stat bg-base-100 rounded-lg shadow-sm p-4">
          <div className="stat-title text-xs">Total</div>
          <div className="stat-value text-2xl">{stats.total}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg shadow-sm p-4">
          <div className="stat-title text-xs">Sièges</div>
          <div className="stat-value text-2xl text-error">{stats.siege}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg shadow-sm p-4">
          <div className="stat-title text-xs">Régionales</div>
          <div className="stat-value text-2xl text-primary">{stats.regionale}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg shadow-sm p-4">
          <div className="stat-title text-xs">Chantiers</div>
          <div className="stat-value text-2xl text-warning">{stats.chantier}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg shadow-sm p-4">
          <div className="stat-title text-xs">Logistiques</div>
          <div className="stat-value text-2xl text-success">{stats.logistique}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg shadow-sm p-4">
          <div className="stat-title text-xs">Actives</div>
          <div className="stat-value text-2xl text-success">{stats.actives}</div>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-4 bg-base-100 p-4 rounded-lg shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
          <input
            type="text"
            placeholder="Rechercher une agence..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input input-bordered w-full pl-10"
          />
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            className="select select-bordered select-sm"
          >
            <option value="all">Tous les types</option>
            {Object.entries(TYPE_AGENCE).map(([key, value]) => (
              <option key={key} value={key}>{value.label}</option>
            ))}
          </select>

          <select 
            value={filterRegion} 
            onChange={(e) => setFilterRegion(e.target.value)}
            className="select select-bordered select-sm"
          >
            <option value="all">Toutes les régions</option>
            {REGIONS.map(region => (
              <option key={region} value={region}>
                {region.charAt(0).toUpperCase() + region.slice(1)}
              </option>
            ))}
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

      {/* Liste des agences */}
      {filteredAgences.length === 0 ? (
        <div className="text-center py-12 bg-base-100 rounded-lg shadow-sm">
          <Building2 className="w-16 h-16 text-base-content/20 mx-auto mb-4" />
          <h3 className="text-lg font-medium">Aucune agence trouvée</h3>
          <p className="text-base-content/60 text-sm mt-1">
            {searchTerm || filterType !== 'all' || filterRegion !== 'all' 
              ? 'Aucune agence ne correspond à vos filtres'
              : 'Commencez par créer votre première agence'}
          </p>
          <Link to="/agences/create" className="btn btn-primary mt-4 gap-2">
            <Plus className="w-5 h-5" />
            Créer une agence
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAgences.map((agence) => {
            const typeInfo = TYPE_AGENCE[agence.type_agence] || TYPE_AGENCE.regionale;
            const TypeIcon = typeInfo.icon;
            const isExpanded = expandedId === agence.id;

            return (
              <div 
                key={agence.id} 
                className={`bg-base-100 rounded-lg shadow-sm border ${agence.est_active ? 'border-base-200' : 'border-error/20'} overflow-hidden transition-all`}
              >
                {/* Ligne principale */}
                <div 
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-base-200/50 transition-colors"
                  onClick={() => toggleExpand(agence.id)}
                >
                  <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                    <div className={`badge badge-lg ${typeInfo.color} gap-1 flex-shrink-0`}>
                      <TypeIcon className="w-3 h-3" />
                      <span className="hidden sm:inline">{typeInfo.label}</span>
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-base truncate">
                          {agence.nom}
                        </h3>
                        <span className="text-xs text-base-content/40 font-mono">
                          {agence.code}
                        </span>
                        {!agence.est_active && (
                          <span className="badge badge-error badge-sm">Inactive</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-base-content/60 mt-0.5">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {agence.ville || 'Non renseignée'}
                        </span>
                        {agence.region && (
                          <span className="badge badge-ghost badge-xs">
                            {agence.region.charAt(0).toUpperCase() + agence.region.slice(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Statistiques rapides */}
                    <div className="flex items-center gap-3 text-xs text-base-content/40 mr-2">
                      {agence.nombre_utilisateurs > 0 && (
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {agence.nombre_utilisateurs}
                        </span>
                      )}
                      {agence.nb_engins_max > 0 && (
                        <span className="flex items-center gap-1">
                          <Truck className="w-3 h-3" />
                          {agence.nb_engins_max}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <Link 
                        to={`/agences/${agence.id}`} 
                        className="btn btn-ghost btn-sm btn-square"
                        onClick={(e) => e.stopPropagation()}
                        title="Voir les détails"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link 
                        to={`/agences/edit/${agence.id}`} 
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
                          setSelectedAgence(agence);
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
                          toggleExpand(agence.id);
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
                        <h4 className="text-xs font-semibold uppercase text-base-content/40 mb-2">Adresse</h4>
                        <p className="text-sm">{agence.adresse || 'Non renseignée'}</p>
                        <p className="text-sm text-base-content/60">
                          {agence.code_postal} {agence.ville}, {agence.pays || 'Non renseigné'}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold uppercase text-base-content/40 mb-2">Contact</h4>
                        <p className="text-sm flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          {agence.telephone || 'Non renseigné'}
                        </p>
                        <p className="text-sm flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {agence.email || 'Non renseigné'}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold uppercase text-base-content/40 mb-2">Capacités</h4>
                        <div className="space-y-1 text-sm">
                          {agence.superficie_m2 && (
                            <p>Superficie: {agence.superficie_m2} m²</p>
                          )}
                          {agence.nb_employes_max && (
                            <p>Employés max: {agence.nb_employes_max}</p>
                          )}
                          {agence.capacite_stockage && (
                            <p>Capacité stockage: {agence.capacite_stockage} m³</p>
                          )}
                          {!agence.superficie_m2 && !agence.nb_employes_max && !agence.capacite_stockage && (
                            <p className="text-base-content/40">Aucune information</p>
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
      {showDeleteModal && selectedAgence && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-base-100 rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 text-error mb-4">
              <AlertTriangle className="w-8 h-8" />
              <h3 className="text-xl font-bold">Confirmer la suppression</h3>
            </div>
            
            <p className="text-base-content/70">
              Êtes-vous sûr de vouloir supprimer l'agence 
              <span className="font-semibold text-base-content"> "{selectedAgence.nom}"</span> ?
            </p>
            <p className="text-sm text-error/70 mt-2">
              ⚠️ Cette action est irréversible et supprimera toutes les données associées.
            </p>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedAgence(null);
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

export default AgenceList;