// src/components/rh/NoteDeFraisList.jsx
// Liste des notes de frais

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Receipt, Plus, Edit, Trash2, Eye, Search,
  ChevronDown, ChevronUp, RefreshCw, AlertTriangle,
  UserCircle, Building2, Calendar, Wifi, WifiOff,
  CheckCircle, XCircle, Filter, Loader2,
  DollarSign, FileText, Clock, Users
} from 'lucide-react';
import AxiosInstance from '../AxiosInstance';

function NoteDeFraisList() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterEmploye, setFilterEmploye] = useState('all');
  const [filterStatut, setFilterStatut] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [employes, setEmployes] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const TYPE_CHOICES = [
    { value: 'peage', label: 'Péage' },
    { value: 'carburant', label: 'Carburant' },
    { value: 'repas', label: 'Repas' },
    { value: 'hebergement', label: 'Hébergement' },
    { value: 'transport', label: 'Transport' },
    { value: 'materiel', label: 'Petit matériel' },
    { value: 'autre', label: 'Autre' }
  ];

  const STATUT_CHOICES = [
    { value: 'brouillon', label: 'Brouillon' },
    { value: 'soumise', label: 'Soumise' },
    { value: 'approuvee', label: 'Approuvée' },
    { value: 'refusee', label: 'Refusée' }
  ];

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

      const [notesRes, employesRes] = await Promise.all([
        AxiosInstance.get('/notes-frais/', {
          headers: { Authorization: `Token ${token}` }
        }),
        AxiosInstance.get('/employes/', {
          headers: { Authorization: `Token ${token}` }
        })
      ]);

      console.log('📊 Notes de frais chargées:', notesRes.data?.length || 0);
      setNotes(notesRes.data || []);
      setEmployes(employesRes.data || []);

    } catch (error) {
      console.error('❌ Erreur chargement:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        setError('Erreur lors du chargement des notes de frais: ' + (error.message || 'Erreur inconnue'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredNotes = notes.filter(n => {
    const employeNom = (n.employe_nom || '').toLowerCase();
    const matchSearch = employeNom.includes(searchTerm.toLowerCase());
    const matchEmploye = filterEmploye === 'all' || n.employe === parseInt(filterEmploye);
    const matchStatut = filterStatut === 'all' || n.statut === filterStatut;
    const matchType = filterType === 'all' || n.type_frais === filterType;
    const matchDate = !filterDate || n.date === filterDate;
    return matchSearch && matchEmploye && matchStatut && matchType && matchDate;
  });

  const handleDelete = async () => {
    if (!selectedNote) return;
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('Token');
      await AxiosInstance.delete(`/notes-frais/${selectedNote.id}/`, {
        headers: { Authorization: `Token ${token}` }
      });
      setNotes(notes.filter(n => n.id !== selectedNote.id));
      setShowDeleteModal(false);
      setSelectedNote(null);
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleApprouver = async (id, approuve) => {
    try {
      const token = localStorage.getItem('Token');
      await AxiosInstance.post(`/notes-frais/${id}/approuver/`, { approuve }, {
        headers: { Authorization: `Token ${token}` }
      });
      await loadData();
    } catch (error) {
      console.error('Erreur approbation:', error);
      alert('Erreur lors de l\'approbation');
    }
  };

  const handleSoumettre = async (id) => {
    try {
      const token = localStorage.getItem('Token');
      await AxiosInstance.post(`/notes-frais/${id}/soumettre/`, {}, {
        headers: { Authorization: `Token ${token}` }
      });
      await loadData();
    } catch (error) {
      console.error('Erreur soumission:', error);
      alert('Erreur lors de la soumission');
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const stats = {
    total: notes.length,
    brouillons: notes.filter(n => n.statut === 'brouillon').length,
    soumises: notes.filter(n => n.statut === 'soumise').length,
    approuvees: notes.filter(n => n.statut === 'approuvee').length,
    totalMontant: notes.reduce((acc, n) => acc + parseFloat(n.montant || 0), 0)
  };

  const getStatutColor = (statut) => {
    const colors = {
      'brouillon': 'neutral',
      'soumise': 'warning',
      'approuvee': 'success',
      'refusee': 'error'
    };
    return colors[statut] || 'neutral';
  };

  const getStatutIcon = (statut) => {
    const icons = {
      'brouillon': '📝',
      'soumise': '📤',
      'approuvee': '✅',
      'refusee': '❌'
    };
    return icons[statut] || '📌';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-base-content/60">Chargement des notes de frais...</p>
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
            <Receipt className="w-8 h-8 text-primary" />
            Notes de frais
          </h1>
          <p className="text-base-content/60 text-sm mt-1">
            Gestion des notes de frais des employés
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
          <Link to="/notes-frais/create" className="btn btn-primary gap-2">
            <Plus className="w-5 h-5" />
            Nouvelle note
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
          <div className="stat-title text-xs">Brouillons</div>
          <div className="stat-value text-2xl text-neutral">{stats.brouillons}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg shadow-sm p-4">
          <div className="stat-title text-xs">En attente</div>
          <div className="stat-value text-2xl text-warning">{stats.soumises}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg shadow-sm p-4">
          <div className="stat-title text-xs">Total montant</div>
          <div className="stat-value text-2xl text-info">{stats.totalMontant.toLocaleString()} €</div>
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

      {filteredNotes.length === 0 ? (
        <div className="text-center py-12 bg-base-100 rounded-lg shadow-sm">
          <Receipt className="w-16 h-16 text-base-content/20 mx-auto mb-4" />
          <h3 className="text-lg font-medium">Aucune note de frais trouvée</h3>
          <p className="text-base-content/60 text-sm mt-1">
            {searchTerm || filterEmploye !== 'all' || filterStatut !== 'all' || filterType !== 'all' || filterDate
              ? 'Aucune note ne correspond à vos filtres'
              : 'Commencez par créer votre première note de frais'}
          </p>
          <Link to="/notes-frais/create" className="btn btn-primary mt-4 gap-2">
            <Plus className="w-5 h-5" />
            Nouvelle note
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotes.map((n) => {
            const isExpanded = expandedId === n.id;
            const statutColor = getStatutColor(n.statut);
            const statutIcon = getStatutIcon(n.statut);
            const isSoumise = n.statut === 'soumise';
            const isBrouillon = n.statut === 'brouillon';

            return (
              <div 
                key={n.id} 
                className={`bg-base-100 rounded-lg shadow-sm border ${
                  n.statut === 'approuvee' ? 'border-success/30' : 
                  n.statut === 'refusee' ? 'border-error/30' :
                  n.statut === 'soumise' ? 'border-warning/30' :
                  'border-base-200'
                } overflow-hidden transition-all`}
              >
                <div 
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-base-200/50 transition-colors"
                  onClick={() => toggleExpand(n.id)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`p-2 rounded-lg bg-${statutColor}/10 text-${statutColor}`}>
                      <span className="text-xl">{statutIcon}</span>
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-base truncate">
                          {n.employe_nom || 'Employé inconnu'}
                        </h3>
                        <span className={`badge badge-${statutColor} badge-sm`}>
                          {n.statut_display || n.statut}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-base-content/60 mt-0.5 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Receipt className="w-3 h-3" />
                          {n.type_display || n.type_frais}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {n.date ? new Date(n.date).toLocaleDateString('fr-FR') : 'N/A'}
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-primary">
                          <DollarSign className="w-3 h-3" />
                          {parseFloat(n.montant || 0).toLocaleString()} €
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="flex items-center gap-1">
                      {isBrouillon && (
                        <button 
                          className="btn btn-sm btn-info btn-square"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSoumettre(n.id);
                          }}
                          title="Soumettre"
                        >
                          <Clock className="w-4 h-4" />
                        </button>
                      )}
                      {isSoumise && (
                        <>
                          <button 
                            className="btn btn-sm btn-success btn-square"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApprouver(n.id, true);
                            }}
                            title="Approuver"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button 
                            className="btn btn-sm btn-error btn-square"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApprouver(n.id, false);
                            }}
                            title="Refuser"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <Link 
                        to={`/notes-frais/${n.id}`} 
                        className="btn btn-ghost btn-sm btn-square"
                        onClick={(e) => e.stopPropagation()}
                        title="Voir les détails"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link 
                        to={`/notes-frais/edit/${n.id}`} 
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
                          setSelectedNote(n);
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
                          toggleExpand(n.id);
                        }}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-base-200 p-4 bg-base-200/30">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <h4 className="text-xs font-semibold uppercase text-base-content/40 mb-2 flex items-center gap-1">
                          <UserCircle className="w-3 h-3" />
                          Informations
                        </h4>
                        <p className="text-sm">Employé: {n.employe_nom || 'N/A'}</p>
                        <p className="text-sm">Type: {n.type_display || n.type_frais}</p>
                        <p className="text-sm">Date: {n.date ? new Date(n.date).toLocaleDateString('fr-FR') : 'N/A'}</p>
                        <p className="text-sm">Statut: {n.statut_display || n.statut}</p>
                        {n.approuve_par_nom && (
                          <p className="text-sm text-base-content/60">Approuvé par: {n.approuve_par_nom}</p>
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold uppercase text-base-content/40 mb-2 flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          Montant
                        </h4>
                        <p className="text-lg font-bold text-primary">{parseFloat(n.montant || 0).toLocaleString()} €</p>
                        {n.projet_nom && (
                          <p className="text-sm text-base-content/60">Projet: {n.projet_nom}</p>
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold uppercase text-base-content/40 mb-2 flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          Description
                        </h4>
                        <p className="text-sm">{n.description || 'Non renseigné'}</p>
                        {n.justificatif && (
                          <a 
                            href={n.justificatif}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline inline-block mt-1"
                          >
                            📎 Voir le justificatif
                          </a>
                        )}
                        {n.commentaire && (
                          <p className="text-sm mt-2 text-base-content/60">Commentaire: {n.commentaire}</p>
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
      {showDeleteModal && selectedNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-base-100 rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 text-error mb-4">
              <AlertTriangle className="w-8 h-8" />
              <h3 className="text-xl font-bold">Confirmer la suppression</h3>
            </div>
            <p className="text-base-content/70">
              Êtes-vous sûr de vouloir supprimer cette note de frais ?
            </p>
            <p className="text-sm text-error/70 mt-2">
              ⚠️ Cette action est irréversible.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedNote(null);
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
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {isDeleting ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NoteDeFraisList;