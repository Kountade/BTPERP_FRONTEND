// src/components/rh/DPAEList.jsx
// Liste des Déclarations Préalables à l'Embauche

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FileText, Plus, Edit, Trash2, Eye, Search,
  ChevronDown, ChevronUp, RefreshCw, AlertTriangle,
  UserCircle, Calendar, Wifi, WifiOff,
  CheckCircle, XCircle, Filter, Loader2,
  Send, Users, FileCheck
} from 'lucide-react';
import AxiosInstance from '../AxiosInstance';

function DPAEList() {
  const navigate = useNavigate();
  const [dpae, setDpae] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEmploye, setFilterEmploye] = useState('all');
  const [filterTransmis, setFilterTransmis] = useState('all');
  const [employes, setEmployes] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDpae, setSelectedDpae] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
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

      const [dpaeRes, employesRes] = await Promise.all([
        AxiosInstance.get('/dpae/', {
          headers: { Authorization: `Token ${token}` }
        }),
        AxiosInstance.get('/employes/', {
          headers: { Authorization: `Token ${token}` }
        })
      ]);

      console.log('📊 DPAE chargées:', dpaeRes.data?.length || 0);
      setDpae(dpaeRes.data || []);
      setEmployes(employesRes.data || []);

    } catch (error) {
      console.error('❌ Erreur chargement:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        setError('Erreur lors du chargement des DPAE');
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

  const filteredDpae = dpae.filter(d => {
    const employeNom = (d.employe_nom || '').toLowerCase();
    const matchSearch = employeNom.includes(searchTerm.toLowerCase()) ||
                       (d.numero || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchEmploye = filterEmploye === 'all' || d.employe === parseInt(filterEmploye);
    const matchTransmis = filterTransmis === 'all' || 
                         (filterTransmis === 'transmis' && d.transmis) ||
                         (filterTransmis === 'non_transmis' && !d.transmis);
    return matchSearch && matchEmploye && matchTransmis;
  });

  const handleDelete = async () => {
    if (!selectedDpae) return;
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('Token');
      await AxiosInstance.delete(`/dpae/${selectedDpae.id}/`, {
        headers: { Authorization: `Token ${token}` }
      });
      setDpae(dpae.filter(d => d.id !== selectedDpae.id));
      setShowDeleteModal(false);
      setSelectedDpae(null);
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTransmettre = async (id) => {
    try {
      const token = localStorage.getItem('Token');
      await AxiosInstance.post(`/dpae/${id}/transmettre/`, {}, {
        headers: { Authorization: `Token ${token}` }
      });
      await loadData();
    } catch (error) {
      console.error('Erreur transmission:', error);
      alert('Erreur lors de la transmission');
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const stats = {
    total: dpae.length,
    transmises: dpae.filter(d => d.transmis).length,
    nonTransmises: dpae.filter(d => !d.transmis).length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-base-content/60">Chargement des DPAE...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-8 h-8 text-primary" />
            DPAE
          </h1>
          <p className="text-base-content/60 text-sm mt-1">
            Déclarations Préalables à l'Embauche
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
          <Link to="/dpae/create" className="btn btn-primary gap-2">
            <Plus className="w-5 h-5" />
            Nouvelle DPAE
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="stat bg-base-100 rounded-lg shadow-sm p-4">
          <div className="stat-title text-xs">Total</div>
          <div className="stat-value text-2xl">{stats.total}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg shadow-sm p-4">
          <div className="stat-title text-xs">Transmises</div>
          <div className="stat-value text-2xl text-success">{stats.transmises}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg shadow-sm p-4">
          <div className="stat-title text-xs">Non transmises</div>
          <div className="stat-value text-2xl text-warning">{stats.nonTransmises}</div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-base-100 p-4 rounded-lg shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
          <input
            type="text"
            placeholder="Rechercher par employé ou numéro..."
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
            value={filterTransmis} 
            onChange={(e) => setFilterTransmis(e.target.value)}
            className="select select-bordered select-sm"
          >
            <option value="all">Tous les statuts</option>
            <option value="transmis">Transmises</option>
            <option value="non_transmis">Non transmises</option>
          </select>
          <button 
            onClick={() => {
              setFilterEmploye('all');
              setFilterTransmis('all');
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

      {filteredDpae.length === 0 ? (
        <div className="text-center py-12 bg-base-100 rounded-lg shadow-sm">
          <FileText className="w-16 h-16 text-base-content/20 mx-auto mb-4" />
          <h3 className="text-lg font-medium">Aucune DPAE trouvée</h3>
          <p className="text-base-content/60 text-sm mt-1">
            Commencez par créer votre première DPAE
          </p>
          <Link to="/dpae/create" className="btn btn-primary mt-4 gap-2">
            <Plus className="w-5 h-5" />
            Nouvelle DPAE
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDpae.map((d) => {
            const isExpanded = expandedId === d.id;

            return (
              <div 
                key={d.id} 
                className={`bg-base-100 rounded-lg shadow-sm border ${d.transmis ? 'border-success/30' : 'border-warning/30'} overflow-hidden transition-all`}
              >
                <div 
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-base-200/50 transition-colors"
                  onClick={() => toggleExpand(d.id)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`p-2 rounded-lg ${d.transmis ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                      {d.transmis ? <FileCheck className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-base truncate">
                          {d.employe_nom || 'Employé inconnu'}
                        </h3>
                        <span className={`badge ${d.transmis ? 'badge-success' : 'badge-warning'} badge-sm`}>
                          {d.transmis ? 'Transmise' : 'En attente'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-base-content/60 mt-0.5 flex-wrap">
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          N° {d.numero}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {d.date_envoi ? new Date(d.date_envoi).toLocaleDateString('fr-FR') : 'N/A'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Embauche: {d.date_embauche ? new Date(d.date_embauche).toLocaleDateString('fr-FR') : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="flex items-center gap-1">
                      {!d.transmis && (
                        <button 
                          className="btn btn-sm btn-success btn-square"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTransmettre(d.id);
                          }}
                          title="Transmettre"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      )}
                      <Link 
                        to={`/dpae/${d.id}`} 
                        className="btn btn-ghost btn-sm btn-square"
                        onClick={(e) => e.stopPropagation()}
                        title="Voir les détails"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link 
                        to={`/dpae/edit/${d.id}`} 
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
                          setSelectedDpae(d);
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
                          toggleExpand(d.id);
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
                        <p className="text-sm">Employé: {d.employe_nom || 'N/A'}</p>
                        <p className="text-sm">Numéro: {d.numero}</p>
                        <p className="text-sm">Statut: {d.transmis ? 'Transmise' : 'En attente'}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold uppercase text-base-content/40 mb-2 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Dates
                        </h4>
                        <p className="text-sm">Envoi: {d.date_envoi ? new Date(d.date_envoi).toLocaleDateString('fr-FR') : 'N/A'}</p>
                        <p className="text-sm">Embauche: {d.date_embauche ? new Date(d.date_embauche).toLocaleDateString('fr-FR') : 'N/A'}</p>
                        {d.date_fin_contrat && (
                          <p className="text-sm">Fin contrat: {new Date(d.date_fin_contrat).toLocaleDateString('fr-FR')}</p>
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold uppercase text-base-content/40 mb-2 flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          Informations
                        </h4>
                        <p className="text-sm">Motif: {d.motif_embauche}</p>
                        {d.numero_ursaff && (
                          <p className="text-sm">N° URSSAF: {d.numero_ursaff}</p>
                        )}
                        {d.contrat_display && (
                          <p className="text-sm">Contrat: {d.contrat_display}</p>
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

      {showDeleteModal && selectedDpae && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-base-100 rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 text-error mb-4">
              <AlertTriangle className="w-8 h-8" />
              <h3 className="text-xl font-bold">Confirmer la suppression</h3>
            </div>
            <p className="text-base-content/70">
              Êtes-vous sûr de vouloir supprimer cette DPAE ?
            </p>
            <p className="text-sm text-error/70 mt-2">
              ⚠️ Cette action est irréversible.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedDpae(null);
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

export default DPAEList;