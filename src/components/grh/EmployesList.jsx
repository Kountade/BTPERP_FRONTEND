// src/components/rh/EmployesList.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  AlertTriangle,
  Mail,
  Phone,
  Briefcase,
  Building2,
  Wifi,
  WifiOff,
  UserCheck,
  UserX,
  Calendar,
  Award
} from 'lucide-react';

// ✅ IMPORT CORRECT
import AxiosInstance from '../AxiosInstance';

function EmployesList() {
  const navigate = useNavigate();
  const [employes, setEmployes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterService, setFilterService] = useState('all');
  const [filterPoste, setFilterPoste] = useState('all');
  const [filterStatut, setFilterStatut] = useState('all');
  const [services, setServices] = useState([]);
  const [postes, setPostes] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEmploye, setSelectedEmploye] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
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
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('Token');
      if (!token) {
        navigate('/login');
        return;
      }

      // ✅ ENDPOINTS SANS PREFIXE /rh
      const [employesRes, servicesRes, postesRes] = await Promise.all([
        AxiosInstance.get('/employes/', {
          headers: { Authorization: `Token ${token}` }
        }),
        AxiosInstance.get('/services/', {
          headers: { Authorization: `Token ${token}` }
        }),
        AxiosInstance.get('/postes/', {
          headers: { Authorization: `Token ${token}` }
        })
      ]);

      setEmployes(employesRes.data || []);
      setServices(servicesRes.data || []);
      setPostes(postesRes.data || []);
    } catch (error) {
      console.error('❌ Erreur chargement:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        setError('Erreur lors du chargement des employés: ' + (error.message || 'Erreur inconnue'));
        // Récupérer les données du cache local si disponible
        const cachedData = localStorage.getItem('employes_cache');
        if (cachedData) {
          try {
            setEmployes(JSON.parse(cachedData));
          } catch (e) {
            setEmployes([]);
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Rafraîchir
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // Sauvegarder en cache
  useEffect(() => {
    if (employes.length > 0) {
      localStorage.setItem('employes_cache', JSON.stringify(employes));
    }
  }, [employes]);

  // Charger au montage
  useEffect(() => {
    loadData();
  }, []);

  // Filtrer les employés
  const filteredEmployes = employes.filter(emp => {
    const fullName = `${emp.nom || ''} ${emp.prenom || ''}`.toLowerCase();
    const matchSearch = fullName.includes(searchTerm.toLowerCase()) ||
                       (emp.matricule || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                       (emp.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchService = filterService === 'all' || emp.service === parseInt(filterService);
    const matchPoste = filterPoste === 'all' || emp.poste === parseInt(filterPoste);
    const matchStatut = filterStatut === 'all' || 
                       (filterStatut === 'actif' && emp.actif) ||
                       (filterStatut === 'inactif' && !emp.actif);
    return matchSearch && matchService && matchPoste && matchStatut;
  });

  // Supprimer un employé
  const handleDelete = async () => {
    if (!selectedEmploye) return;
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('Token');
      await AxiosInstance.delete(`/employes/${selectedEmploye.id}/`, {
        headers: { Authorization: `Token ${token}` }
      });
      setEmployes(employes.filter(e => e.id !== selectedEmploye.id));
      setShowDeleteModal(false);
      setSelectedEmploye(null);
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Statistiques
  const stats = {
    total: employes.length,
    actifs: employes.filter(e => e.actif).length,
    inactifs: employes.filter(e => !e.actif).length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="mt-4 text-base-content/60">Chargement des employés...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-8 h-8 text-primary" />
            Employés
          </h1>
          <p className="text-base-content/60 text-sm mt-1">
            Gérez tous les employés de l'entreprise
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className={`badge ${isOnline ? 'badge-success' : 'badge-error'} gap-1.5 px-3 py-2.5`}>
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            {isOnline ? 'En ligne' : 'Hors ligne'}
          </div>
          <button 
            onClick={handleRefresh}
            className={`btn btn-ghost btn-sm gap-1.5 ${isRefreshing ? 'animate-spin' : ''}`}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Rafraîchir
          </button>
          <Link to="/employes/create" className="btn btn-primary gap-2">
            <Plus className="w-5 h-5" />
            Nouvel employé
          </Link>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="stat bg-base-100 rounded-lg shadow-sm p-4">
          <div className="stat-title text-xs">Total</div>
          <div className="stat-value text-2xl">{stats.total}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg shadow-sm p-4">
          <div className="stat-title text-xs">Actifs</div>
          <div className="stat-value text-2xl text-success">{stats.actifs}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg shadow-sm p-4">
          <div className="stat-title text-xs">Inactifs</div>
          <div className="stat-value text-2xl text-error">{stats.inactifs}</div>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-4 bg-base-100 p-4 rounded-lg shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
          <input
            type="text"
            placeholder="Rechercher un employé..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input input-bordered w-full pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <select 
            value={filterService} 
            onChange={(e) => setFilterService(e.target.value)}
            className="select select-bordered select-sm"
          >
            <option value="all">Tous les services</option>
            {services.map(s => (
              <option key={s.id} value={s.id}>{s.nom}</option>
            ))}
          </select>
          <select 
            value={filterPoste} 
            onChange={(e) => setFilterPoste(e.target.value)}
            className="select select-bordered select-sm"
          >
            <option value="all">Tous les postes</option>
            {postes.map(p => (
              <option key={p.id} value={p.id}>{p.nom}</option>
            ))}
          </select>
          <select 
            value={filterStatut} 
            onChange={(e) => setFilterStatut(e.target.value)}
            className="select select-bordered select-sm"
          >
            <option value="all">Tous les statuts</option>
            <option value="actif">Actifs</option>
            <option value="inactif">Inactifs</option>
          </select>
          <button 
            onClick={handleRefresh} 
            className={`btn btn-ghost btn-sm gap-1 ${isRefreshing ? 'animate-spin' : ''}`}
            disabled={isRefreshing}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-warning shadow-lg">
          <AlertTriangle className="w-6 h-6" />
          <span>{error}</span>
          <button onClick={handleRefresh} className="btn btn-sm btn-ghost">Réessayer</button>
        </div>
      )}

      {filteredEmployes.length === 0 ? (
        <div className="text-center py-12 bg-base-100 rounded-lg shadow-sm">
          <Users className="w-16 h-16 text-base-content/20 mx-auto mb-4" />
          <h3 className="text-lg font-medium">Aucun employé trouvé</h3>
          <p className="text-base-content/60 text-sm mt-1">
            {searchTerm || filterService !== 'all' || filterPoste !== 'all' || filterStatut !== 'all'
              ? 'Aucun employé ne correspond à vos filtres'
              : 'Commencez par créer votre premier employé'}
          </p>
          <Link to="/employes/create" className="btn btn-primary mt-4 gap-2">
            <Plus className="w-5 h-5" />
            Créer un employé
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEmployes.map((emp) => {
            const isExpanded = expandedId === emp.id;
            const fullName = `${emp.prenom || ''} ${emp.nom || ''}`.trim() || 'Employé';

            return (
              <div 
                key={emp.id} 
                className={`bg-base-100 rounded-lg shadow-sm border ${emp.actif ? 'border-base-200' : 'border-error/20'} overflow-hidden transition-all`}
              >
                <div 
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-base-200/50 transition-colors"
                  onClick={() => toggleExpand(emp.id)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Avatar */}
                    <div className="avatar placeholder">
                      <div className={`w-10 h-10 rounded-full ${emp.actif ? 'bg-primary/20 text-primary' : 'bg-base-300 text-base-content/40'} flex items-center justify-center`}>
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
                          {emp.matricule}
                        </span>
                        {!emp.actif && (
                          <span className="badge badge-error badge-sm">Inactif</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-base-content/60 mt-0.5 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3 h-3" />
                          {emp.poste_nom || 'Non assigné'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {emp.service_nom || 'Non assigné'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {emp.email}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`badge ${emp.actif ? 'badge-success' : 'badge-error'} badge-sm`}>
                      {emp.actif ? 'Actif' : 'Inactif'}
                    </span>
                    <div className="flex items-center gap-1">
                      <Link 
                        to={`/employes/${emp.id}`} 
                        className="btn btn-ghost btn-sm btn-square"
                        onClick={(e) => e.stopPropagation()}
                        title="Voir les détails"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link 
                        to={`/employes/edit/${emp.id}`} 
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
                          setSelectedEmploye(emp);
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
                          toggleExpand(emp.id);
                        }}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Détails étendus */}
                {isExpanded && (
                  <div className="border-t border-base-200 p-4 bg-base-200/30">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <h4 className="text-xs font-semibold uppercase text-base-content/40 mb-2">Contact</h4>
                        <p className="text-sm flex items-center gap-2">
                          <Mail className="w-4 h-4 text-base-content/40" />
                          {emp.email}
                        </p>
                        <p className="text-sm flex items-center gap-2">
                          <Phone className="w-4 h-4 text-base-content/40" />
                          {emp.telephone || 'Non renseigné'}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold uppercase text-base-content/40 mb-2">Embauche</h4>
                        <p className="text-sm flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-base-content/40" />
                          {emp.date_embauche ? new Date(emp.date_embauche).toLocaleDateString('fr-FR') : 'N/A'}
                        </p>
                        <p className="text-sm flex items-center gap-2">
                          <Award className="w-4 h-4 text-base-content/40" />
                          Ancienneté: {emp.anciennete || 0} an(s)
                        </p>
                        <p className="text-sm">
                          Contrat: {emp.situation_display || emp.situation}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold uppercase text-base-content/40 mb-2">Salaire</h4>
                        <p className="text-sm">Base: {emp.salaire_base?.toLocaleString()} €</p>
                        {emp.taux_horaire && (
                          <p className="text-sm">Taux horaire: {emp.taux_horaire} €</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de suppression */}
      {showDeleteModal && selectedEmploye && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-base-100 rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 text-error mb-4">
              <AlertTriangle className="w-8 h-8" />
              <h3 className="text-xl font-bold">Confirmer la suppression</h3>
            </div>
            <p className="text-base-content/70">
              Êtes-vous sûr de vouloir supprimer l'employé 
              <span className="font-semibold text-base-content"> "{selectedEmploye.prenom} {selectedEmploye.nom}"</span> ?
            </p>
            <p className="text-sm text-error/70 mt-2">
              ⚠️ Cette action est irréversible.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedEmploye(null);
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
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                {isDeleting ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployesList;