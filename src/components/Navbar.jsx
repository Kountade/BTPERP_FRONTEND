// src/components/Navbar.jsx - Version BTP COMPLÈTE AVEC OFFLINE & MENUS RH + CONTRATS

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  Package, 
  Building2, 
  Tags, 
  LogOut, 
  UserCircle, 
  Settings, 
  Warehouse, 
  ShoppingCart,
  Receipt,
  FileText,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  Bell,
  Moon,
  Sun,
  Shield,
  Clock,
  Calendar,
  MapPin,
  TrendingUp,
  CreditCard,
  UsersRound,
  Boxes,
  AlertTriangle,
  Search,
  HelpCircle,
  History,
  Truck,
  ArrowLeftRight,
  DollarSign,
  Grid3x3,
  Ruler,
  ClipboardCheck,
  LineChart,
  MoveHorizontal,
  Calculator,
  PackageCheck,
  Layers,
  ArrowLeftRight as ReturnIcon,
  AlertOctagon,
  Wallet,
  BookOpen,
  PiggyBank,
  ChartPie,
  Cog,
  Database,
  Mail,
  BellRing,
  Printer,
  Globe,
  Lock,
  Key,
  UserCog,
  CalendarClock,
  RefreshCw,
  Activity,
  Award,
  BarChart3,
  Edit,
  Eye,
  Landmark,        
  Coins,           
  ReceiptText,     
  CalendarDays,    
  CheckCircle,     
  ClipboardList,   
  Gauge,           
  AlertCircle,     
  Banknote,        
  ArrowDownUp,     
  TrendingDown,    
  Briefcase,       
  HandCoins,       
  ScrollText,      
  Scale,           
  Target,          
  PieChart,        
  FileSpreadsheet,
  Handshake,
  FileCheck,
  RotateCcw,
  Receipt as ReceiptIcon,
  CreditCard as CreditCardIcon,
  TrendingUp as TrendingUpIcon,
  BarChart,
  Clipboard,
  AlertCircle as AlertCircleIcon,
  Archive,
  PackageOpen,
  Truck as TruckIcon,
  Map,
  UserCheck,
  Route,
  // ✅ ICÔNES BTP
  HardHat,
  Construction,
  Wrench,
  Gavel,
  Pickaxe,
  Compass,
  Home,
  Factory,
  Trees,
  Mountain,
  Ship,
  Car,
  Bus,
  Train,
  Plane,
  Bike,
  Fuel,
  Zap,
  Droplet,
  Wind,
  Cloud,
  CloudRain,
  Snowflake,
  Thermometer,
  Anchor,
  Flag,
  Wifi,
  WifiOff,
  Crown,
  Store,
  GraduationCap,
  Clock as ClockIcon,
  Loader2,
  Crown as CrownIcon,
  // ✅ ICÔNES RH COMPLÉMENTAIRES
  ClipboardList as ServiceIcon,
  BadgeCheck,
  Clock as TimeIcon,
  Calendar as CalendarIcon,
  FileSpreadsheet as DPAEIcon,
  Receipt as FraisIcon,
  UserMinus,
  UserPlus,
  UserCheck as UserCheckIcon,
  CalendarRange,
  FileBadge,
  Stethoscope,
  Briefcase as BriefcaseIcon,
  Timer,
  Hourglass,
  Badge,
  FileSignature,
  Users as UsersIcon,
  UserCog as UserCogIcon,
  FileClock,
  // ✅ ICÔNE CONTRAT
  FileText as ContratIcon,
  FileCheck as ContratCheckIcon,
} from 'lucide-react';

import logo from '../assets/logo.svg';
import AxiosInstance from './AxiosInstance';

// ============================================================
// ✅ CONFIGURATION DES RÔLES
// ============================================================

const ROLE_GLOBAL_CONFIG = {
  pdg: { label: 'PDG', color: 'error', icon: Crown, description: 'Accès total - Toutes agences', level: 100 },
  drh: { label: 'DRH', color: 'secondary', icon: UsersRound, description: 'Ressources Humaines - Toutes agences', level: 90 },
  autre: { label: 'Utilisateur', color: 'neutral', icon: UserCircle, description: 'Compte standard', level: 50 }
};

const ROLE_AGENCE_CONFIG = {
  directeur_agence: { label: 'Directeur Agence', color: 'primary', icon: Building2, description: 'Gestion agence', level: 80 },
  chef_chantier: { label: 'Chef Chantier', color: 'warning', icon: Construction, description: 'Gestion chantiers', level: 70 },
  conducteur_travaux: { label: 'Conducteur Travaux', color: 'secondary', icon: HardHat, description: 'Suivi travaux', level: 65 },
  technicien: { label: 'Technicien', color: 'info', icon: Wrench, description: 'Travaux techniques', level: 50 },
  gestionnaire_stock: { label: 'Gestionnaire Stock', color: 'success', icon: Package, description: 'Gestion matériaux', level: 60 },
  commercial_btp: { label: 'Commercial BTP', color: 'accent', icon: Handshake, description: 'Ventes BTP', level: 55 },
  comptable_btp: { label: 'Comptable BTP', color: 'info', icon: Calculator, description: 'Comptabilité', level: 65 },
  responsable_hse: { label: 'Responsable HSE', color: 'warning', icon: Shield, description: 'Sécurité', level: 70 },
  responsable_rh: { label: 'Responsable RH', color: 'secondary', icon: Users, description: 'Ressources humaines', level: 70 },
  acheteur: { label: 'Acheteur', color: 'primary', icon: ShoppingBag, description: 'Achats', level: 55 },
  securite: { label: 'Sécurité', color: 'error', icon: AlertTriangle, description: 'Sécurité chantiers', level: 60 },
  responsable_qualite: { label: 'Responsable Qualité', color: 'success', icon: CheckCircle, description: 'Contrôle qualité', level: 65 },
  assistant_chantier: { label: 'Assistant Chantier', color: 'info', icon: Clipboard, description: 'Support chantier', level: 40 }
};

const Navbar = ({ content, mode, toggleColorMode }) => {
  const location = useLocation();
  const path = location.pathname;
  const navigate = useNavigate();

  // ✅ ÉTATS PRINCIPAUX
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isAgencesMenuOpen, setIsAgencesMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [openSections, setOpenSections] = useState({
    'TABLEAU DE BORD': true,
    'CHANTIERS': true,
    'STOCKS & MATÉRIAUX': true,
    'ENGINS & ÉQUIPEMENTS': true,
    'RESSOURCES HUMAINES': true,
    'MON ESPACE': false
  });
  
  const [userInitial, setUserInitial] = useState('U');
  const [userFullName, setUserFullName] = useState('Utilisateur');
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // ✅ ÉTATS UTILISATEUR ET AGENCES
  const [userData, setUserData] = useState(null);
  const [agences, setAgences] = useState([]);
  const [agenceCourante, setAgenceCourante] = useState(null);
  const [effectiveRole, setEffectiveRole] = useState('autre');
  const [roleType, setRoleType] = useState('global');
  const [isLoading, setIsLoading] = useState(true);
  
  // ✅ ÉTATS OFFLINE
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // ✅ ÉTATS COMPTEURS BTP
  const [chantiersEnCours, setChantiersEnCours] = useState(0);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [alertesSecurite, setAlertesSecurite] = useState(0);
  const [stocksFaibles, setStocksFaibles] = useState(0);
  const [enginsDisponibles, setEnginsDisponibles] = useState(0);
  const [employesPresent, setEmployesPresent] = useState(0);
  const [commandesEnAttente, setCommandesEnAttente] = useState(0);
  const [facturesImpayees, setFacturesImpayees] = useState(0);
  const [inspectionsEnCours, setInspectionsEnCours] = useState(0);
  const [visitesMedicales, setVisitesMedicales] = useState(0);
  
  // ✅ ÉTATS RH COMPLÉMENTAIRES
  const [absencesEnCours, setAbsencesEnCours] = useState(0);
  const [notesFraisEnAttente, setNotesFraisEnAttente] = useState(0);
  const [dpaeEnAttente, setDpaeEnAttente] = useState(0);
  const [pointagesAJour, setPointagesAJour] = useState(0);
  const [planningActif, setPlanningActif] = useState(0);
  const [contratsActifs, setContratsActifs] = useState(0);

  // ============================================================
  // RÉCUPÉRATION UTILISATEUR
  // ============================================================

  const getUserData = () => {
    try {
      const userData = localStorage.getItem('User');
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  };

  const user = getUserData();
  const userRole = user?.role_global || 'autre';
  const userEmail = user?.email || '';
  const firstName = user?.first_name || '';
  const lastName = user?.last_name || '';
  const userName = firstName || lastName || user?.username || userEmail?.split('@')[0] || 'Utilisateur';

  // Horloge
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const formattedDate = currentTime.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  // Initiale utilisateur
  useEffect(() => {
    if (firstName && lastName) {
      setUserInitial(`${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase());
      setUserFullName(`${firstName} ${lastName}`);
    } else if (userName) {
      setUserInitial(userName.charAt(0).toUpperCase());
      setUserFullName(userName);
    }
  }, [firstName, lastName, userName]);

  // ============================================================
  // ✅ FONCTIONS OFFLINE - INDEXEDDB
  // ============================================================

  const initDB = () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('BTP_ERP_DB', 1);
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('pending_operations')) {
          db.createObjectStore('pending_operations', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
        }
      };
      request.onsuccess = (event) => resolve(event.target.result);
      request.onerror = (event) => reject(event.target.error);
    });
  };

  const getPendingCount = async () => {
    try {
      const db = await initDB();
      const transaction = db.transaction(['pending_operations'], 'readonly');
      const store = transaction.objectStore('pending_operations');
      const count = await new Promise((resolve) => {
        const request = store.count();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => resolve(0);
      });
      setPendingCount(count);
      return count;
    } catch (error) {
      console.error('Erreur comptage:', error);
      setPendingCount(0);
      return 0;
    }
  };

  const deleteOperation = async (id) => {
    try {
      const db = await initDB();
      const transaction = db.transaction(['pending_operations'], 'readwrite');
      const store = transaction.objectStore('pending_operations');
      await new Promise((resolve, reject) => {
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Erreur suppression:', error);
    }
  };

  const syncPendingOperations = async () => {
    if (!isOnline) {
      console.log('📡 Hors ligne - synchronisation impossible');
      return;
    }
    
    if (isSyncing) {
      console.log('⏳ Synchronisation déjà en cours');
      return;
    }
    
    setIsSyncing(true);
    console.log('🔄 Début synchronisation...');
    
    try {
      const db = await initDB();
      const transaction = db.transaction(['pending_operations'], 'readonly');
      const store = transaction.objectStore('pending_operations');
      
      const operations = await new Promise((resolve) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => resolve([]);
      });

      if (operations.length === 0) {
        console.log('✅ Aucune donnée à synchroniser');
        setIsSyncing(false);
        return;
      }

      console.log(`📝 ${operations.length} opérations à synchroniser`);

      const token = localStorage.getItem('Token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      let synced = 0;
      let failed = 0;

      for (const op of operations) {
        try {
          const url = `${API_BASE_URL}${op.endpoint}`;
          console.log(`📤 Synchronisation: ${op.method} ${url}`);
          
          const response = await fetch(url, {
            method: op.method,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': token ? `Token ${token}` : ''
            },
            body: JSON.stringify(op.data)
          });

          if (response.ok) {
            await deleteOperation(op.id);
            synced++;
            console.log(`✅ Opération ${op.id} synchronisée`);
          } else {
            failed++;
            console.log(`❌ Échec synchronisation ${op.id}: ${response.status}`);
            
            if (response.status === 401) {
              console.log('🔒 Token invalide, déconnexion...');
              localStorage.removeItem('Token');
              localStorage.removeItem('User');
              navigate('/login');
              setIsSyncing(false);
              return;
            }
          }
        } catch (error) {
          failed++;
          console.error(`❌ Erreur synchronisation ${op.id}:`, error);
        }
      }

      console.log(`📊 Synchro terminée: ${synced} succès, ${failed} échecs`);
      await getPendingCount();
      
      if (synced > 0) {
        console.log(`🎉 ${synced} opération(s) synchronisée(s) avec succès`);
      }
      
    } catch (error) {
      console.error('❌ Erreur synchronisation:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  // ✅ GESTION DE LA CONNEXION
  useEffect(() => {
    const handleOnline = async () => {
      console.log('📶 Connexion rétablie');
      setIsOnline(true);
      
      setTimeout(async () => {
        const count = await getPendingCount();
        if (count > 0) {
          console.log(`🔄 Synchronisation automatique de ${count} opérations...`);
          await syncPendingOperations();
        }
      }, 2000);
    };

    const handleOffline = () => {
      console.log('📡 Hors ligne');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const interval = setInterval(() => {
      if (isOnline) {
        syncPendingOperations();
      }
    }, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [isOnline]);

  useEffect(() => {
    getPendingCount();
  }, []);

  // ============================================================
  // ✅ DÉTERMINER LE RÔLE EFFECTIF
  // ============================================================

  const determineEffectiveRole = (userData, currentAgence) => {
    if (!userData) return { role: 'autre', type: 'global' };
    
    if (userData.role_global === 'pdg') return { role: 'pdg', type: 'global' };
    if (userData.role_global === 'drh') return { role: 'drh', type: 'global' };
    
    if (currentAgence && userData.roles_agence) {
      const roleInAgence = userData.roles_agence.find(r => 
        r.agence_id === currentAgence.id && r.est_actif
      );
      if (roleInAgence) return { role: roleInAgence.role, type: 'agence' };
    }
    
    return { role: 'autre', type: 'global' };
  };

  const checkUserAccessToAgence = (agenceId, rolesAgence) => {
    if (!rolesAgence) return false;
    return rolesAgence.some(r => r.agence_id === agenceId && r.est_actif);
  };

  const canSwitchAgence = () => {
    if (isPDG || isDRH) return agences.length > 1;
    const accessibleAgences = agences.filter(a => a.hasAccess);
    return accessibleAgences.length > 1;
  };

  const getRoleConfig = () => {
    if (roleType === 'global') {
      return ROLE_GLOBAL_CONFIG[effectiveRole] || ROLE_GLOBAL_CONFIG.autre;
    }
    return ROLE_AGENCE_CONFIG[effectiveRole] || ROLE_GLOBAL_CONFIG.autre;
  };

  // ============================================================
  // ✅ PERMISSIONS
  // ============================================================

  const isPDG = effectiveRole === 'pdg' && roleType === 'global';
  const isDRH = effectiveRole === 'drh' && roleType === 'global';
  const isDirecteur = effectiveRole === 'directeur_agence';
  const isChefChantier = effectiveRole === 'chef_chantier';
  const isConducteur = effectiveRole === 'conducteur_travaux';
  const isGestionnaireStock = effectiveRole === 'gestionnaire_stock';
  const isCommercial = effectiveRole === 'commercial_btp';
  const isComptable = effectiveRole === 'comptable_btp';
  const isHSE = effectiveRole === 'responsable_hse';
  const isRH = effectiveRole === 'responsable_rh';
  const isAcheteur = effectiveRole === 'acheteur';
  const isSecurite = effectiveRole === 'securite';
  const isQualite = effectiveRole === 'responsable_qualite';

  const isAdmin = isPDG || isDirecteur;
  const isHR = isPDG || isDRH || isRH;

  const canViewChantiers = () => isPDG || isDirecteur || isChefChantier || isConducteur;
  const canViewStocks = () => isPDG || isDirecteur || isGestionnaireStock || isAcheteur;
  const canViewEngins = () => isPDG || isDirecteur || isChefChantier || isConducteur;
  const canViewRH = () => isPDG || isDRH || isRH;
  const canViewAdmin = () => isPDG;
  const canViewComptabilite = () => isPDG || isComptable || isDirecteur;
  const canViewSecurite = () => isPDG || isHSE || isSecurite || isQualite;

  const roleConfig = getRoleConfig();
  const RoleIcon = roleConfig.icon;

  // ============================================================
  // ✅ CHARGER LES DONNÉES
  // ============================================================

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const agencesRes = await AxiosInstance.get('/agences/');
        const toutesLesAgences = agencesRes.data || [];
        
        let userRolesAgence = [];
        let userFullData = null;
        
        if (user?.id) {
          const userRes = await AxiosInstance.get(`/users/${user.id}/`);
          userFullData = userRes.data;
          userRolesAgence = userFullData.roles_agence || [];
        }
        
        const agencesAvecAcces = toutesLesAgences.map(agence => {
          const hasAccess = isPDG || isDRH || checkUserAccessToAgence(agence.id, userRolesAgence);
          return { ...agence, hasAccess };
        });
        
        setAgences(agencesAvecAcces);
        
        let currentAgence = null;
        const savedAgence = localStorage.getItem('AgenceCourante');
        
        if (savedAgence) {
          try {
            const parsed = JSON.parse(savedAgence);
            const hasAccess = isPDG || isDRH || checkUserAccessToAgence(parsed.id, userRolesAgence);
            if (hasAccess) {
              currentAgence = parsed;
            }
          } catch (e) {}
        }
        
        if (!currentAgence && agencesAvecAcces.length > 0) {
          const accessibleAgence = agencesAvecAcces.find(a => a.hasAccess);
          if (accessibleAgence) {
            currentAgence = accessibleAgence;
          } else if (agencesAvecAcces.length > 0) {
            currentAgence = agencesAvecAcces[0];
          }
          
          if (currentAgence) {
            localStorage.setItem('AgenceCourante', JSON.stringify(currentAgence));
          }
        }
        
        setAgenceCourante(currentAgence);
        
        if (userFullData) {
          const { role, type } = determineEffectiveRole(userFullData, currentAgence);
          setEffectiveRole(role);
          setRoleType(type);
        } else {
          setEffectiveRole(userRole);
          setRoleType('global');
        }
        
        const token = localStorage.getItem('Token');
        if (token && AxiosInstance) {
          const params = currentAgence?.id ? `?agence_id=${currentAgence.id}` : '';
          
          if (isAdmin) {
            const chantiersRes = await AxiosInstance.get(`/chantiers/?status=en_cours${params}`).catch(() => ({ data: [] }));
            setChantiersEnCours(chantiersRes.data?.length || 0);

            const securiteRes = await AxiosInstance.get(`/alertes-securite/?status=active${params}`).catch(() => ({ data: [] }));
            setAlertesSecurite(securiteRes.data?.length || 0);

            const stocksRes = await AxiosInstance.get(`/materiaux/stock-faible/${params}`).catch(() => ({ data: [] }));
            setStocksFaibles(stocksRes.data?.length || 0);

            const enginsRes = await AxiosInstance.get(`/engins/disponibles/${params}`).catch(() => ({ data: [] }));
            setEnginsDisponibles(enginsRes.data?.length || 0);

            const employesRes = await AxiosInstance.get(`/employes/presents/${params}`).catch(() => ({ data: [] }));
            setEmployesPresent(employesRes.data?.length || 0);

            const notifRes = await AxiosInstance.get(`/notifications/unread-count/${params}`).catch(() => ({ data: { unread_count: 0 } }));
            setNotificationsCount(notifRes.data?.unread_count || 0);

            const cmdRes = await AxiosInstance.get(`/commandes/?status=en_attente${params}`).catch(() => ({ data: [] }));
            setCommandesEnAttente(cmdRes.data?.length || 0);

            const medicalRes = await AxiosInstance.get(`/employes/visites-medicales-proches/${params}`).catch(() => ({ data: [] }));
            setVisitesMedicales(medicalRes.data?.length || 0);

            const inspRes = await AxiosInstance.get(`/inspections/?status=en_cours${params}`).catch(() => ({ data: [] }));
            setInspectionsEnCours(inspRes.data?.length || 0);
          }

          if (isCommercial || isAdmin) {
            const facturesRes = await AxiosInstance.get(`/factures/?status=impayee${params}`).catch(() => ({ data: [] }));
            setFacturesImpayees(facturesRes.data?.length || 0);
          }

          // ✅ CHARGEMENT DES DONNÉES RH
          if (isHR || isAdmin) {
            const absencesRes = await AxiosInstance.get(`/absences/?status=en_cours${params}`).catch(() => ({ data: [] }));
            setAbsencesEnCours(absencesRes.data?.length || 0);

            const fraisRes = await AxiosInstance.get(`/notes-frais/?status=en_attente${params}`).catch(() => ({ data: [] }));
            setNotesFraisEnAttente(fraisRes.data?.length || 0);

            const dpaeRes = await AxiosInstance.get(`/dpae/?status=en_attente${params}`).catch(() => ({ data: [] }));
            setDpaeEnAttente(dpaeRes.data?.length || 0);

            const pointageRes = await AxiosInstance.get(`/pointages/aujourdhui/${params}`).catch(() => ({ data: [] }));
            setPointagesAJour(pointageRes.data?.length || 0);

            const planningRes = await AxiosInstance.get(`/planning/actif/${params}`).catch(() => ({ data: [] }));
            setPlanningActif(planningRes.data?.length || 0);

            // ✅ CHARGEMENT DES CONTRATS ACTIFS
            const contratsRes = await AxiosInstance.get(`/contrats/?statut=actif${params}`).catch(() => ({ data: [] }));
            setContratsActifs(contratsRes.data?.length || 0);
          }
        }
        
      } catch (error) {
        console.error('❌ Erreur chargement:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [user?.id]);

  // ============================================================
  // ✅ CHANGER D'AGENCE
  // ============================================================

  const changerAgence = (agence) => {
    if (!agence.hasAccess && !isPDG && !isDRH) {
      alert(`Vous n'avez pas accès à l'agence ${agence.nom}`);
      return;
    }
    
    setAgenceCourante(agence);
    localStorage.setItem('AgenceCourante', JSON.stringify(agence));
    setIsAgencesMenuOpen(false);
    window.location.reload();
  };

  // ============================================================
  // ✅ DÉCONNEXION
  // ============================================================

  const logoutUser = () => {
    setIsUserMenuOpen(false);
    localStorage.removeItem('Token');
    localStorage.removeItem('User');
    localStorage.removeItem('AgenceCourante');
    navigate('/');
  };

  // ============================================================
  // ✅ GESTION DES SECTIONS
  // ============================================================

  const handleSectionToggle = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // ============================================================
  // ✅ MENU ERP BTP - AVEC MENUS RH COMPLETS + CONTRATS
  // ============================================================

  const menuSections = [
    {
      name: 'TABLEAU DE BORD',
      icon: LayoutDashboard,
      items: [
        { id: 'dashboard', text: 'Dashboard BTP', icon: LayoutDashboard, path: '/dashboard', permission: true },
        { id: 'statistiques', text: 'Statistiques', icon: TrendingUp, path: '/statistiques', permission: isAdmin },
        { id: 'analyses', text: 'Analyses', icon: BarChart3, path: '/analyses', permission: isAdmin }
      ]
    },
    {
      name: 'CHANTIERS',
      icon: Construction,
      permission: canViewChantiers(),
      items: [
        { id: 'chantiers', text: 'Chantiers', icon: Construction, path: '/chantiers', permission: canViewChantiers(), badge: chantiersEnCours > 0 ? chantiersEnCours : 0 },
        { id: 'chantiers-en-cours', text: 'En Cours', icon: Construction, path: '/chantiers/en-cours', permission: canViewChantiers() },
        { id: 'planning-chantiers', text: 'Planning', icon: Calendar, path: '/planning-chantiers', permission: isAdmin || isChefChantier },
        { id: 'phases-travaux', text: 'Phases', icon: Layers, path: '/phases-travaux', permission: isAdmin || isChefChantier || isConducteur },
        { id: 'suivi-avancement', text: 'Avancement', icon: Target, path: '/suivi-avancement', permission: isAdmin || isChefChantier || isConducteur },
        { id: 'inspections', text: 'Inspections', icon: ClipboardCheck, path: '/inspections', permission: isAdmin || isChefChantier || isQualite, badge: inspectionsEnCours > 0 ? inspectionsEnCours : 0 }
      ]
    },
    {
      name: 'STOCKS & MATÉRIAUX',
      icon: Package,
      permission: canViewStocks(),
      items: [
        { id: 'materiaux', text: 'Matériaux', icon: Package, path: '/materiaux', permission: canViewStocks() },
        { id: 'catalogues', text: 'Catalogues', icon: BookOpen, path: '/catalogues', permission: canViewStocks() },
        { id: 'stocks', text: 'Stocks', icon: Boxes, path: '/stocks', permission: canViewStocks(), badge: stocksFaibles > 0 ? stocksFaibles : 0 },
        { id: 'entrepots', text: 'Entrepôts', icon: Warehouse, path: '/entrepots', permission: canViewStocks() },
        { id: 'mouvements-stock', text: 'Mouvements', icon: MoveHorizontal, path: '/mouvements-stock', permission: canViewStocks() },
        { id: 'transferts', text: 'Transferts', icon: Truck, path: '/transferts', permission: canViewStocks() },
        { id: 'alertes-stock', text: 'Alertes', icon: AlertOctagon, path: '/alertes-stock', permission: canViewStocks(), badge: stocksFaibles > 0 ? stocksFaibles : 0 }
      ]
    },
    {
      name: 'ENGINS & ÉQUIPEMENTS',
      icon: Truck,
      permission: canViewEngins(),
      items: [
        { id: 'engins', text: 'Engins', icon: Truck, path: '/engins', permission: canViewEngins() },
        { id: 'engins-disponibles', text: 'Disponibles', icon: Truck, path: '/engins/disponibles', permission: canViewEngins(), badge: enginsDisponibles > 0 ? enginsDisponibles : 0 },
        { id: 'maintenance', text: 'Maintenance', icon: Wrench, path: '/maintenance', permission: canViewEngins() },
        { id: 'contrats-location', text: 'Locations', icon: FileText, path: '/contrats-location', permission: canViewEngins() },
        { id: 'assurances-engins', text: 'Assurances', icon: Shield, path: '/assurances-engins', permission: isAdmin },
        { id: 'carnet-entretien', text: 'Entretien', icon: BookOpen, path: '/carnet-entretien', permission: canViewEngins() }
      ]
    },
    // ✅ SECTION RESSOURCES HUMAINES - COMPLÈTE AVEC CONTRATS
    {
      name: 'RESSOURCES HUMAINES',
      icon: Users,
      permission: canViewRH(),
      items: [
        // === ADMINISTRATION RH ===
        { id: 'employes', text: 'Employés', icon: Users, path: '/employes', permission: canViewRH() },
        { id: 'contrats', text: 'Contrats', icon: ContratIcon, path: '/contrats', permission: canViewRH(), badge: contratsActifs > 0 ? contratsActifs : 0 },
        { id: 'services', text: 'Services', icon: ServiceIcon, path: '/services', permission: canViewRH() },
        { id: 'postes', text: 'Postes', icon: BriefcaseIcon, path: '/postes', permission: canViewRH() },
        { id: 'competences', text: 'Compétences', icon: BadgeCheck, path: '/competences', permission: canViewRH() },
        
        // === PRÉSENCE & POINTAGE ===
        { id: 'pointages', text: 'Pointages', icon: TimeIcon, path: '/pointages', permission: canViewRH(), badge: pointagesAJour > 0 ? pointagesAJour : 0 },
        { id: 'employes-present', text: 'Présents', icon: UserCheckIcon, path: '/employes/presents', permission: canViewRH(), badge: employesPresent > 0 ? employesPresent : 0 },
        { id: 'heures-travail', text: 'Heures de Travail', icon: Timer, path: '/heures-travail', permission: canViewRH() },
        
        // === ABSENCES & CONGÉS ===
        { id: 'absences', text: 'Absences', icon: UserMinus, path: '/absences', permission: canViewRH(), badge: absencesEnCours > 0 ? absencesEnCours : 0 },
        { id: 'conges', text: 'Congés', icon: CalendarIcon, path: '/conges', permission: canViewRH() },
        
        // === PLANIFICATION ===
        { id: 'planning', text: 'Planning', icon: CalendarRange, path: '/planning', permission: canViewRH(), badge: planningActif > 0 ? planningActif : 0 },
        { id: 'planning-personnel', text: 'Planning Personnel', icon: CalendarClock, path: '/planning-personnel', permission: canViewRH() },
        
        // === DOCUMENTS & ADMINISTRATIF ===
        { id: 'dpae', text: 'DPAE', icon: DPAEIcon, path: '/dpae', permission: canViewRH(), badge: dpaeEnAttente > 0 ? dpaeEnAttente : 0 },
        { id: 'notes-frais', text: 'Notes de Frais', icon: FraisIcon, path: '/notes-frais', permission: canViewRH(), badge: notesFraisEnAttente > 0 ? notesFraisEnAttente : 0 },
        
        // === FORMATION & HABILITATIONS ===
        { id: 'formations', text: 'Formations', icon: GraduationCap, path: '/formations', permission: canViewRH() },
        { id: 'habilitations', text: 'Habilitations', icon: Award, path: '/habilitations', permission: canViewRH() },
        
        // === SANTÉ & SÉCURITÉ ===
        { id: 'visites-medicales', text: 'Visites Médicales', icon: Stethoscope, path: '/visites-medicales', permission: canViewRH(), badge: visitesMedicales > 0 ? visitesMedicales : 0 },
        { id: 'accidents-travail', text: 'Accidents', icon: AlertTriangle, path: '/accidents-travail', permission: canViewRH() },
        
        // === GESTION DES COMPÉTENCES ===
        { id: 'evaluations', text: 'Évaluations', icon: ClipboardList, path: '/evaluations', permission: canViewRH() },
        { id: 'objectifs', text: 'Objectifs', icon: Target, path: '/objectifs', permission: canViewRH() },
        
        // === RAPPORTS RH ===
        { id: 'rapports-rh', text: 'Rapports RH', icon: FileSpreadsheet, path: '/rapports-rh', permission: canViewRH() },
        { id: 'statistiques-rh', text: 'Statistiques RH', icon: ChartPie, path: '/statistiques-rh', permission: canViewRH() },
      ]
    }
  ];

  // ✅ SECTIONS ADMIN BTP
  if (isAdmin) {
    menuSections.splice(4, 0, {
      name: 'ACHATS & FOURNISSEURS',
      icon: Handshake,
      permission: isAdmin || isAcheteur,
      items: [
        { id: 'fournisseurs', text: 'Fournisseurs', icon: Building2, path: '/fournisseurs', permission: isAdmin || isAcheteur },
        { id: 'commandes', text: 'Commandes', icon: FileText, path: '/commandes', permission: isAdmin || isAcheteur, badge: commandesEnAttente > 0 ? commandesEnAttente : 0 },
        { id: 'receptions', text: 'Réceptions', icon: PackageCheck, path: '/receptions', permission: isAdmin || isGestionnaireStock },
        { id: 'retours', text: 'Retours', icon: RotateCcw, path: '/retours', permission: isAdmin || isGestionnaireStock },
        { id: 'factures-fournisseurs', text: 'Factures', icon: ReceiptIcon, path: '/factures-fournisseurs', permission: isAdmin || isComptable, badge: facturesImpayees > 0 ? facturesImpayees : 0 },
        { id: 'paiements-fournisseurs', text: 'Paiements', icon: CreditCardIcon, path: '/paiements-fournisseurs', permission: isAdmin || isComptable }
      ]
    });

    menuSections.splice(5, 0, {
      name: 'SÉCURITÉ & QUALITÉ',
      icon: Shield,
      permission: canViewSecurite(),
      items: [
        { id: 'securite', text: 'Sécurité', icon: Shield, path: '/securite', permission: canViewSecurite() },
        { id: 'alertes-securite', text: 'Alertes', icon: AlertTriangle, path: '/alertes-securite', permission: canViewSecurite(), badge: alertesSecurite > 0 ? alertesSecurite : 0 },
        { id: 'qualite', text: 'Qualité', icon: CheckCircle, path: '/qualite', permission: canViewSecurite() },
        { id: 'controles-qualite', text: 'Contrôles', icon: ClipboardList, path: '/controles-qualite', permission: canViewSecurite() },
        { id: 'non-conformites', text: 'Non-Conformités', icon: AlertCircle, path: '/non-conformites', permission: canViewSecurite() },
        { id: 'audits', text: 'Audits', icon: ClipboardCheck, path: '/audits', permission: canViewSecurite() }
      ]
    });

    menuSections.splice(6, 0, {
      name: 'FINANCES & COMPTABILITÉ',
      icon: DollarSign,
      permission: canViewComptabilite(),
      items: [
        { id: 'comptabilite', text: 'Comptabilité', icon: Calculator, path: '/comptabilite', permission: canViewComptabilite() },
        { id: 'budgets', text: 'Budgets', icon: PiggyBank, path: '/budgets', permission: canViewComptabilite() },
        { id: 'depenses', text: 'Dépenses', icon: TrendingDown, path: '/depenses', permission: canViewComptabilite() },
        { id: 'factures-clients', text: 'Factures Clients', icon: FileText, path: '/factures-clients', permission: canViewComptabilite(), badge: facturesImpayees > 0 ? facturesImpayees : 0 },
        { id: 'paiements-clients', text: 'Paiements', icon: CreditCard, path: '/paiements-clients', permission: canViewComptabilite() },
        { id: 'rapports-financiers', text: 'Rapports', icon: ChartPie, path: '/rapports-financiers', permission: canViewComptabilite() }
      ]
    });

    menuSections.splice(7, 0, {
      name: 'ADMINISTRATION',
      icon: Settings,
      permission: canViewAdmin(),
      items: [
        { id: 'company-config', text: 'Configuration', icon: Building2, path: '/company-config', permission: isPDG },
        { id: 'utilisateurs', text: 'Utilisateurs', icon: Users, path: '/utilisateurs', permission: isPDG },
        { id: 'agences', text: 'Agences', icon: Building2, path: '/agences', permission: isPDG },
        { id: 'roles', text: 'Rôles', icon: Shield, path: '/roles', permission: isPDG },
        { id: 'notifications', text: 'Notifications', icon: Bell, path: '/notifications', permission: isPDG, badge: notificationsCount > 0 ? notificationsCount : 0 },
        { id: 'audit', text: "Journal", icon: History, path: '/audit', permission: isPDG },
        { id: 'backups', text: 'Sauvegardes', icon: Database, path: '/backups', permission: isPDG }
      ]
    });
  }

  // ✅ MON ESPACE
  menuSections.push({
    name: 'MON ESPACE',
    icon: UserCircle,
    items: [
      { id: 'profile', text: 'Mon Profil', icon: UserCircle, path: '/profile', permission: true },
      { id: 'my-notifications', text: 'Notifications', icon: BellRing, path: '/my-notifications', permission: true, badge: notificationsCount > 0 ? notificationsCount : 0 },
      { id: 'support', text: 'Support', icon: HelpCircle, path: '/support', permission: true },
      { id: 'preferences', text: 'Préférences', icon: Settings, path: '/my-preferences', permission: true }
    ]
  });

  // Filtrer les sections
  const visibleSections = menuSections
    .map(section => {
      const visibleItems = section.items.filter(item => item.permission === true);
      return { ...section, items: visibleItems };
    })
    .filter(section => section.items.length > 0);

  // Recherche
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const searchResults = searchQuery.length > 1 ?
    visibleSections.flatMap(section =>
      section.items.filter(item =>
        item.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        section.name.toLowerCase().includes(searchQuery.toLowerCase())
      ).map(item => ({ ...item, section: section.name }))
    ) : [];

  return (
    <div className="min-h-screen bg-base-200">
      
      {/* Overlay recherche */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setIsSearchOpen(false)}>
          <div className="flex items-start justify-center pt-20 px-4" onClick={e => e.stopPropagation()}>
            <div className="w-full max-w-2xl bg-base-100 rounded-2xl shadow-2xl overflow-hidden border border-primary/20">
              <div className="p-4 border-b border-base-200">
                <div className="flex items-center gap-3">
                  <Search className="w-5 h-5 text-primary" />
                  <input
                    type="text"
                    placeholder="Rechercher un menu... (Ctrl+K)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-base-content placeholder:text-base-content/40"
                    autoFocus
                  />
                  <button onClick={() => setIsSearchOpen(false)} className="p-1 rounded-lg hover:bg-base-200">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto p-2">
                {searchResults.length > 0 ? (
                  searchResults.map((item) => (
                    <Link
                      key={item.id}
                      to={item.path}
                      onClick={() => setIsSearchOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary/10 transition-colors"
                    >
                      <item.icon className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-base-content">{item.text}</p>
                        <p className="text-xs text-base-content/40">{item.section}</p>
                      </div>
                    </Link>
                  ))
                ) : searchQuery.length > 1 ? (
                  <div className="text-center py-8">
                    <p className="text-base-content/40">Aucun résultat pour "{searchQuery}"</p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-base-content/40">Tapez pour rechercher un menu</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Barre de navigation supérieure */}
      <nav className="fixed top-8 left-0 right-0 z-40 bg-gradient-to-r from-primary to-primary/90 shadow-lg border-b-2 border-accent">
        <div className="px-4 sm:px-6 lg:pl-72">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo et menu toggle */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hidden lg:flex p-2 rounded-lg text-primary-content hover:bg-primary-content/10 transition-colors"
                title={sidebarOpen ? "Réduire le menu" : "Agrandir le menu"}
              >
                {sidebarOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-primary-content hover:bg-primary-content/10 transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              <Link to="/dashboard" className="hidden lg:flex items-center gap-3 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary-content/20 rounded-xl blur-md group-hover:blur-lg transition-all"></div>
                  <div className="relative w-10 h-10 bg-base-100 rounded-xl flex items-center justify-center shadow-lg border-2 border-accent">
                    <img src={logo} alt="Logo" className="w-7 h-7 object-contain" onError={(e) => { e.target.style.display = 'none' }} />
                  </div>
                </div>
                <div>
                  <h1 className="text-primary-content font-bold text-lg tracking-wide">BTP ERP</h1>
                  <p className="text-primary-content/60 text-[10px] font-medium">Multi-Agences</p>
                </div>
              </Link>

              <div className="lg:hidden flex items-center gap-2">
                <div className="w-8 h-8 bg-base-100 rounded-lg flex items-center justify-center border-2 border-accent">
                  <img src={logo} alt="Logo" className="w-6 h-6 object-contain" onError={(e) => { e.target.style.display = 'none' }} />
                </div>
                <span className="text-primary-content font-bold text-sm">BTP ERP</span>
              </div>
            </div>

            {/* ✅ Centre - Date/Heure + INDICATEUR SYNC */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Date et Heure */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary-content/10 backdrop-blur-sm">
                <Calendar className="w-4 h-4 text-primary-content/80" />
                <span className="text-sm font-medium text-primary-content">{formattedDate}</span>
                <div className="w-px h-4 bg-primary-content/30 mx-1"></div>
                <Clock className="w-4 h-4 text-primary-content/80" />
                <span className="text-sm font-medium text-primary-content">{formattedTime}</span>
              </div>

              {/* ✅ INDICATEUR SYNCHRONISATION - ENTRE DATE ET AGENCES */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary-content/10 backdrop-blur-sm border border-primary-content/20">
                {isOnline ? (
                  <Wifi className="w-4 h-4 text-success" />
                ) : (
                  <WifiOff className="w-4 h-4 text-error" />
                )}
                <span className={`text-xs font-medium ${isOnline ? 'text-success' : 'text-error'}`}>
                  {isOnline ? 'En ligne' : 'Hors ligne'}
                </span>
                {pendingCount > 0 && (
                  <>
                    <div className="w-px h-4 bg-primary-content/30 mx-1"></div>
                    <span className="text-xs font-medium text-warning flex items-center gap-1">
                      📝 {pendingCount}
                    </span>
                    {isOnline && (
                      <button 
                        onClick={syncPendingOperations} 
                        disabled={isSyncing}
                        className="p-0.5 rounded hover:bg-primary-content/20 transition-colors text-primary-content/80"
                        title="Synchroniser maintenant"
                      >
                        {isSyncing ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <RefreshCw className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Actions droite */}
            <div className="flex items-center gap-2">
              
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 rounded-lg text-primary-content hover:bg-primary-content/10 transition-colors"
                title="Rechercher (Ctrl+K)"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* SÉLECTEUR D'AGENCE */}
              {!isLoading && agences.length > 0 && agenceCourante && (
                <div className="relative">
                  <button
                    onClick={() => canSwitchAgence() && setIsAgencesMenuOpen(!isAgencesMenuOpen)}
                    className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-sm ${
                      canSwitchAgence()
                        ? 'bg-primary-content/10 text-primary-content hover:bg-primary-content/20 cursor-pointer'
                        : 'bg-primary-content/10 text-primary-content cursor-default'
                    }`}
                    disabled={!canSwitchAgence()}
                  >
                    <Building2 className="w-4 h-4 text-primary-content/80" />
                    <span className="max-w-32 truncate font-medium">
                      {agenceCourante.nom || 'Agence'}
                    </span>
                    {canSwitchAgence() && <ChevronDown className="w-3 h-3 text-primary-content/60" />}
                  </button>
                 
                  {canSwitchAgence() && isAgencesMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsAgencesMenuOpen(false)}></div>
                      <div className="absolute right-0 mt-2 w-80 bg-base-100 rounded-xl shadow-xl z-50 border border-primary/20 overflow-hidden">
                        <div className="p-3 bg-gradient-to-r from-primary/10 to-transparent border-b border-primary/20">
                          <p className="text-xs font-semibold text-primary">
                            {isPDG || isDRH ? 'TOUTES LES AGENCES' : 'MES AGENCES'}
                          </p>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {agences.map((agence) => {
                            const isCurrent = agenceCourante?.id === agence.id;
                            const hasAccess = agence.hasAccess || isPDG || isDRH;
                            
                            return (
                              <button
                                key={agence.id}
                                onClick={() => {
                                  if (hasAccess || isCurrent) {
                                    changerAgence(agence);
                                  }
                                }}
                                disabled={!hasAccess && !isCurrent}
                                className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left ${
                                  isCurrent
                                    ? 'bg-primary/10 border-l-3 border-primary'
                                    : hasAccess
                                      ? 'hover:bg-primary/5'
                                      : 'opacity-50 cursor-not-allowed'
                                }`}
                              >
                                <Building2 className={`w-5 h-5 ${
                                  agence.type_agence === 'siege' ? 'text-error' : 
                                  agence.type_agence === 'chantier' ? 'text-warning' : 
                                  'text-primary'
                                }`} />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium text-base-content">{agence.nom}</p>
                                    {!hasAccess && !isCurrent && (
                                      <span className="badge badge-neutral badge-xs">Non accessible</span>
                                    )}
                                    {isCurrent && (
                                      <span className="badge badge-primary badge-xs">Actuelle</span>
                                    )}
                                  </div>
                                  <p className="text-xs text-base-content/40">
                                    {agence.ville || agence.type_display || 'Agence'}
                                  </p>
                                </div>
                                {isCurrent && (
                                  <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                                )}
                                {!hasAccess && !isCurrent && (
                                  <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Badge rôle */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary-content/10">
                <RoleIcon className="w-4 h-4 text-primary-content" />
                <span className="text-primary-content text-xs font-medium">{roleConfig.label}</span>
                {isPDG && (
                  <span className="badge badge-error badge-xs ml-1">PDG</span>
                )}
              </div>

              {/* Mode thème */}
              <button
                onClick={toggleColorMode}
                className="p-2 rounded-lg text-primary-content hover:bg-primary-content/10 transition-colors"
                title={mode === 'dark' ? "Mode clair" : "Mode sombre"}
              >
                {mode === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Menu utilisateur */}
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-primary-content/10 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-content font-bold border-2 border-primary-content shadow-md">
                    {userInitial || 'U'}
                  </div>
                  <ChevronDown className="w-4 h-4 text-primary-content hidden sm:block" />
                </button>
                
                {isUserMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)}></div>
                    <div className="absolute right-0 mt-2 w-80 bg-base-100 rounded-xl shadow-xl z-50 border border-primary/20 overflow-hidden">
                      <div className="p-4 bg-gradient-to-r from-primary to-primary/80 text-primary-content">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-primary-content/20 flex items-center justify-center text-xl font-bold">
                            {userInitial || 'U'}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold">{userFullName || userName}</p>
                            <p className="text-xs text-primary-content/70 truncate">{userEmail}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              <span className={`badge badge-${roleConfig.color} badge-sm`}>
                                {roleConfig.label}
                              </span>
                              {agenceCourante && !isPDG && !isDRH && (
                                <span className="badge badge-primary badge-sm flex items-center gap-1">
                                  <Building2 className="w-3 h-3" />
                                  {agenceCourante.nom}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="py-2">
                        <Link
                          to="/profile"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-primary/5 transition-colors"
                        >
                          <UserCircle className="w-5 h-5 text-base-content/40" />
                          <span className="text-sm text-base-content">Mon profil</span>
                        </Link>
                        <Link
                          to="/my-preferences"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-primary/5 transition-colors"
                        >
                          <Settings className="w-5 h-5 text-base-content/40" />
                          <span className="text-sm text-base-content">Préférences</span>
                        </Link>
                        <div className="border-t border-base-200 my-1"></div>
                        <button
                          onClick={logoutUser}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-error/10 transition-colors text-error"
                        >
                          <LogOut className="w-5 h-5" />
                          <span className="text-sm">Déconnexion</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar Desktop */}
      <aside className={`
        fixed left-0 top-[88px] bottom-0 z-30
        bg-base-100 shadow-xl border-r border-primary/20
        transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'w-72' : 'w-20'}
        hidden lg:block
      `}>
        <div className="h-full flex flex-col">
          
          <div className={`p-4 border-b border-primary/20 ${!sidebarOpen && 'text-center'} bg-gradient-to-r from-primary/5 to-transparent`}>
            <div className={`flex items-center ${!sidebarOpen && 'justify-center'} gap-3`}>
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                <img src={logo} alt="Logo" className="w-7 h-7 object-contain" onError={(e) => { e.target.style.display = 'none' }} />
              </div>
              {sidebarOpen && (
                <div>
                  <h2 className="font-bold text-base-content text-sm">BTP ERP</h2>
                  <p className="text-xs text-base-content/50">Multi-Agences</p>
                </div>
              )}
            </div>
          </div>

          {/* Profil dans la sidebar */}
          <div className={`p-4 border-b border-primary/20 ${!sidebarOpen && 'text-center'} ${roleConfig.color === 'error' ? 'bg-error/5' : roleConfig.color === 'primary' ? 'bg-primary/5' : 'bg-base-200'}`}>
            <div className={`flex items-center ${!sidebarOpen && 'flex-col'} gap-3`}>
              <div className="avatar placeholder">
                <div className={`bg-gradient-to-br from-primary to-primary/80 text-primary-content rounded-xl ${sidebarOpen ? 'w-12 h-12' : 'w-10 h-10'} shadow-lg ring-2 ring-primary/20`}>
                  <span className={`${sidebarOpen ? 'text-xl' : 'text-lg'} font-bold`}>{userInitial || 'U'}</span>
                </div>
              </div>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate text-base-content">{userFullName || userName}</p>
                  <p className="text-xs text-base-content/50 truncate">{userEmail}</p>
                  <div className="flex flex-wrap items-center gap-1 mt-1">
                    <span className={`badge badge-${roleConfig.color} badge-sm`}>
                      <RoleIcon className="w-3 h-3 mr-1" />
                      {roleConfig.label}
                    </span>
                    {agenceCourante && !isPDG && !isDRH && (
                      <span className="badge badge-primary badge-sm flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {agenceCourante.nom}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Menu de navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {visibleSections.map((section, idx) => {
              const SectionIcon = section.icon;
              const isOpen = openSections[section.name] || false;
              
              return (
                <div key={idx} className="mb-1">
                  <button
                    onClick={() => handleSectionToggle(section.name)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                      ${!sidebarOpen && 'justify-center'}
                      ${isOpen 
                        ? 'bg-primary/10 text-primary'
                        : 'text-base-content/70 hover:bg-primary/5 hover:text-primary'
                      }
                    `}
                  >
                    <SectionIcon className={`w-5 h-5 ${isOpen ? 'text-inherit' : ''}`} />
                    {sidebarOpen && (
                      <>
                        <span className="flex-1 text-left text-xs font-semibold tracking-wide uppercase">
                          {section.name}
                        </span>
                        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </>
                    )}
                  </button>
                  
                  {sidebarOpen && isOpen && (
                    <div className="ml-6 mt-2 space-y-1 border-l-2 border-primary pl-4">
                      {section.items.map((item) => {
                        const ItemIcon = item.icon;
                        const isActive = path === item.path;
                        
                        return (
                          <Link
                            key={item.id}
                            to={item.path}
                            className={`
                              flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200
                              ${isActive 
                                ? 'bg-primary text-primary-content shadow-md'
                                : 'text-base-content/60 hover:bg-primary/10 hover:text-primary'
                              }
                            `}
                          >
                            <ItemIcon className={`w-4 h-4 ${isActive ? 'text-inherit' : ''}`} />
                            <span className="flex-1">{item.text}</span>
                            {item.badge && item.badge > 0 && (
                              <span className={`badge badge-error badge-xs ${isActive ? 'badge-outline' : ''}`}>
                                {item.badge > 99 ? '99+' : item.badge}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-primary/20 bg-base-100">
            {sidebarOpen ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse"></div>
                  <span className="text-xs text-base-content/50">v2.1.0</span>
                </div>
                <span className="badge badge-primary badge-sm">BTP</span>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse mx-auto"></div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Contenu principal */}
      <main className={`transition-all duration-300 pt-[88px] ${sidebarOpen ? 'lg:pl-72' : 'lg:pl-20'}`}>
        <div className="p-4 sm:p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="loading loading-spinner loading-lg text-primary w-16 h-16"></div>
                <p className="mt-4 text-base-content/60">Chargement...</p>
              </div>
            </div>
          ) : (
            content
          )}
        </div>
      </main>

      {/* Menu mobile */}
      {isMobileMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50 lg:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="fixed top-0 left-0 bottom-0 w-80 bg-base-100 z-50 shadow-2xl lg:hidden overflow-y-auto">
            <div className="relative overflow-hidden bg-gradient-to-br from-primary to-primary/80 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-base-100 rounded-xl flex items-center justify-center p-2 shadow-lg">
                    <img src={logo} alt="Logo" className="w-full h-full object-contain" onError={(e) => { e.target.style.display = 'none' }} />
                  </div>
                  <div>
                    <h2 className="text-primary-content font-bold text-lg">BTP ERP</h2>
                    <p className="text-primary-content/70 text-xs">{roleConfig.label}</p>
                    {agenceCourante && !isPDG && !isDRH && (
                      <p className="text-primary-content/60 text-[10px] flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {agenceCourante.nom}
                      </p>
                    )}
                  </div>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-primary-content p-2 rounded-lg hover:bg-primary-content/10">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="py-4 px-3 space-y-1">
              {visibleSections.map((section, idx) => {
                const SectionIcon = section.icon;
                const isOpen = openSections[section.name] || false;
                
                return (
                  <div key={idx} className="mb-2">
                    <button
                      onClick={() => handleSectionToggle(section.name)}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-primary/10 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <SectionIcon className="w-5 h-5 text-primary" />
                        <span className="text-xs font-bold uppercase">
                          {section.name}
                        </span>
                      </div>
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    
                    {isOpen && (
                      <div className="ml-6 mt-2 space-y-1 border-l-2 border-primary pl-4">
                        {section.items.map((item) => {
                          const ItemIcon = item.icon;
                          const isActive = path === item.path;
                          
                          return (
                            <Link
                              key={item.id}
                              to={item.path}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className={`
                                flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all
                                ${isActive 
                                  ? 'bg-primary text-primary-content'
                                  : 'hover:bg-primary/10'
                                }
                              `}
                            >
                              <ItemIcon className="w-4 h-4" />
                              <span>{item.text}</span>
                              {item.badge && item.badge > 0 && (
                                <span className="badge badge-error badge-xs ml-auto">{item.badge > 99 ? '99+' : item.badge}</span>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Navbar;