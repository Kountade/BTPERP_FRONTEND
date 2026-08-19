// src/components/rh/AbsenceList.jsx
// Liste des absences des employés

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  UserMinus, Plus, Edit, Trash2, Eye, Search,
  ChevronDown, ChevronUp, RefreshCw, AlertTriangle,
  UserCircle, Building2, Calendar, Wifi, WifiOff,
  CheckCircle, XCircle, Filter, Loader2,
  Clock, FileText, Users, BadgeCheck
} from 'lucide-react';
import AxiosInstance from '../AxiosInstance';

function AbsenceList() {
  const navigate = useNavigate();
  const [absences, setAbsences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterEmploye, setFilterEmploye] = useState('all');
  const [filterStatut, setFilterStatut] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [employes, setEmployes] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAbsence, setSelectedAbsence] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Options
  const TYPE_CHOICES = [
    { value: 'cp', label: 'Congés payés' },
    { value: 'rtt', label: 'RTT' },
    { value: 'maladie', label: 'Maladie' },
    { value: 'accident', label: 'Accident du travail' },
    { value: 'maternite', label: 'Maternité' },
    { value: 'sans_solde', label: 'Sans solde' },
    { value: 'formation', label: 'Formation' },
    { value: 'autre', label: 'Autre' }
  ];

  const STATUT_CHOICES = [
    { value: 'demandee', label: 'Demandée' },
    { value: 'approuvee', label: 'Approuvée' },
    { value: 'refusee', label: 'Refusée' },
    { value: 'annulee', label: 'Annulée' }
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

      const [absencesRes, employesRes] = await Promise.all([
        AxiosInstance.get('/absences/', {
          headers: { Authorization: `Token ${token}` }
        }),
        AxiosInstance.get('/employes/', {
          headers: { Authorization: `Token ${token}` }
        })
      ]);

      console.log('📊 Absences chargées:', absencesRes.data?.length || 0);
      setAbsences(absencesRes.data || []);
      setEmployes(employesRes.data || []);

    } catch (error) {
      console.error('❌ Erreur chargement:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        setError('Erreur lors du chargement des absences');
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

  // Charger au montage
  useEffect(() => {
    loadData();
  }, []);

  // Filtrer
  const filteredAbsences = absences.filter(a => {
    const employeNom = (a.employe_nom || '').toLowerCase();
    const matchSearch = employeNom.includes(searchTerm.toLowerCase());
    const matchEmploye = filterEmploye === 'all' || a.employe === parseInt(filterEmploye);
    const matchStatut = filterStatut === 'all' || a.statut === filterStatut;
    const matchType = filterType === 'all' || a.type_absence === filterType;
    const matchDate = !filterDate || a.date_debut === filterDate || a.date_fin === filterDate;
    return matchSearch && matchEmploye && matchStatut && matchType && matchDate;
  });

  // Supprimer
  const handleDelete = async () => {
    if (!selectedAbsence) return;
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('Token');
      await AxiosInstance.delete(`/absences/${selectedAbsence.id}/`, {
        headers: { Authorization: `Token ${token}` }
      });
      setAbsences(absences.filter(a => a.id !== selectedAbsence.id));
      setShowDeleteModal(false);
      setSelectedAbsence(null);
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  // Approuver/Refuser
  const handleApprouver = async (id, approuve) => {
    try {
      const token = localStorage.getItem('Token');
      await AxiosInstance.post(`/absences/${id}/approuver/`, { approuve }, {
        headers: { Authorization: `Token ${token}` }
      });
      await loadData();
    } catch (error) {
      console.error('Erreur approbation:', error);
      alert('Erreur lors de l\'approbation');
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Statistiques
  const stats = {
    total: absences.length,
    demandees: absences.filter(a => a.statut === 'demandee').length,
    approuvees: absences.filter(a => a.statut === 'approuvee').length,
    refusees: absences.filter(a => a.statut === 'refusee').length
  };

  const getStatutColor = (statut) => {
    const colors = {
      'demandee': 'warning',
      'approuvee': 'success',
      'refusee': 'error',
      'annulee': 'neutral'
    };
    return colors[statut] || 'neutral';
  };

  const getTypeIcon = (type) => {
    const icons = {
      'cp': '🏖️',
      'rtt': '📅',
      'maladie': '🤒',
      'accident': '⚠️',
      'maternite': '👶',
      'sans_solde': '💰',
      'formation': '📚',
      'autre': '📌'
    };
    return icons[type] || '📌';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-base-content/60">Chargement des absences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <UserMinus className="w-8 h-8 text-primary" />
            Absences
          </h1>
          <p className="text-base-content/60 text-sm mt-1">
            Gestion des absences des employés
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
          <Link to="/absences/create" className="btn btn-primary gap-2">
            <Plus className="w-5 h-5" />
            Nouvelle absence
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
          <div className="stat-title text-xs">En attente</div>
          <div className="stat-value text-2xl text-warning">{stats.demandees}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg shadow-sm p-4">
          <div className="stat-title text-xs">Approuvées</div>
          <div className="stat-value text-2xl text-success">{stats.approuvees}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg shadow-sm p-4">
          <div className="stat-title text-xs">Refusées</div>
          <div className="stat-value text-2xl text-error">{stats.refusees}</div>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-4 bg-base-100 p-4 rounded-lg shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
          <input
            type="text"
            placeholder="Rechercher par employé..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input input-bordered w-full pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <select 
            value={filterEmploye} 
            onChange={(e) => setFilterEmploye(e.target.value)}
            className="select select-bordered select-sm"
          >
            <option value="all">Tous les employés</option>
            {employes.map(e => {
              const fullName = `${e.prenom || ''} ${e.nom || ''}`.trim() || e.email;
              return (
                <option key={e.id} value={e.id}>{fullName}</option>
              );
            })}
          </select>
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            className="select select-bordered select-sm"
          >
            <option value="all">Tous les types</option>
            {TYPE_CHOICES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <select 
            value={filterStatut} 
            onChange={(e) => setFilterStatut(e.target.value)}
            className="select select-bordered select-sm"
          >
            <option value="all">Tous les statuts</option>
            {STATUT_CHOICES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="input input-bordered input-sm w-36"
          />
          <button 
            onClick={() => {
              setFilterDate('');
              setFilterEmploye('all');
              setFilterStatut('all');
              setFilterType('all');
              setSearchTerm('');
            }}
            className="btn btn-ghost btn-sm gap-1"
          >
            <Filter className="w-4 h-4" />
            Réinitialiser
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

      {filteredAbsences.length === 0 ? (
        <div className="text-center py-12 bg-base-100 rounded-lg shadow-sm">
          <UserMinus className="w-16 h-16 text-base-content/20 mx-auto mb-4" />
          <h3 className="text-lg font-medium">Aucune absence trouvée</h3>
          <p className="text-base-content/60 text-sm mt-1">
            Commencez par créer votre première absence
          </p>
          <Link to="/absences/create" className="btn btn-primary mt-4 gap-2">
            <Plus className="w-5 h-5" />
            Nouvelle absence
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAbsences.map((a) => {
            const isExpanded = expandedId === a.id;
            const statutColor = getStatutColor(a.statut);
            const typeIcon = getTypeIcon(a.type_absence);
            const isEnAttente = a.statut === 'demandee';

            return (
              <div 
                key={a.id} 
                className={`bg-base-100 rounded-lg shadow-sm border ${
                  a.statut === 'approuvee' ? 'border-success/30' : 
                  a.statut === 'refusee' ? 'border-error/30' :
                  'border-warning/30'
                } overflow-hidden transition-all`}
              >
                <div 
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-base-200/50 transition-colors"
                  onClick={() => toggleExpand(a.id)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="text-2xl">{typeIcon}</div>
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-base truncate">
                          {a.employe_nom || 'Employé inconnu'}
                        </h3>
                        <span className={`badge badge-${statutColor} badge-sm`}>
                          {a.statut_display || a.statut}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-base-content/60 mt-0.5 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {a.date_debut ? new Date(a.date_debut).toLocaleDateString('fr-FR') : 'N/A'}
                          {a.date_fin && a.date_fin !== a.date_debut && (
                            <> → {new Date(a.date_fin).toLocaleDateString('fr-FR')}</>
                          )}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {a.nombre_jours} jour(s)
                        </span>
                        <span className="flex items-center gap-1">
                          <BadgeCheck className="w-3 h-3" />
                          {a.type_display || a.type_absence}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="flex items-center gap-1">
                      {isEnAttente && (
                        <>
                          <button 
                            className="btn btn-sm btn-success btn-square"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApprouver(a.id, true);
                            }}
                            title="Approuver"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button 
                            className="btn btn-sm btn-error btn-square"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApprouver(a.id, false);
                            }}
                            title="Refuser"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <Link 
                        to={`/absences/${a.id}`} 
                        className="btn btn-ghost btn-sm btn-square"
                        onClick={(e) => e.stopPropagation()}
                        title="Voir les détails"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link 
                        to={`/absences/edit/${a.id}`} 
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
                          setSelectedAbsence(a);
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
                          toggleExpand(a.id);
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
                        <h4 className="text-xs font-semibold uppercase text-base-content/40 mb-2 flex items-center gap-1">
                          <UserCircle className="w-3 h-3" />
                          Informations
                        </h4>
                        <p className="text-sm">Employé: {a.employe_nom || 'N/A'}</p>
                        <p className="text-sm">Type: {a.type_display || a.type_absence}</p>
                        <p className="text-sm">Statut: {a.statut_display || a.statut}</p>
                        {a.approuve_par_nom && (
                          <p className="text-sm text-base-content/60">
                            Approuvé par: {a.approuve_par_nom}
                          </p>
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold uppercase text-base-content/40 mb-2 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Période
                        </h4>
                        <p className="text-sm">Début: {a.date_debut ? new Date(a.date_debut).toLocaleDateString('fr-FR') : 'N/A'}</p>
                        <p className="text-sm">Fin: {a.date_fin ? new Date(a.date_fin).toLocaleDateString('fr-FR') : 'N/A'}</p>
                        <p className="text-sm font-medium">Durée: {a.nombre_jours} jour(s)</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold uppercase text-base-content/40 mb-2 flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          Motif
                        </h4>
                        <p className="text-sm">{a.motif || 'Non renseigné'}</p>
                        {a.justificatif && (
                          <p className="text-sm text-primary mt-1">
                            📎 Justificatif disponible
                          </p>
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
      {showDeleteModal && selectedAbsence && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-base-100 rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 text-error mb-4">
              <AlertTriangle className="w-8 h-8" />
              <h3 className="text-xl font-bold">Confirmer la suppression</h3>
            </div>
            <p className="text-base-content/70">
              Êtes-vous sûr de vouloir supprimer cette absence ?
            </p>
            <p className="text-sm text-error/70 mt-2">
              ⚠️ Cette action est irréversible.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedAbsence(null);
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
                  <Loader2 className="w-4 h-4 animate-spin" />
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

export default AbsenceList;