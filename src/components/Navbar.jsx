// src/components/Navbar.jsx - Version BTP COMPLÈTE AVEC OFFLINE

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
} from 'lucide-react';

import logo from '../assets/logo.svg';

let AxiosInstance = null;
let GlobalAlerts = null;

try {
  AxiosInstance = require('./AxiosInstance').default;
  GlobalAlerts = require('./common/GlobalAlerts').default;
} catch (error) {
  console.warn('Modules optionnels non trouvés:', error.message);
}

// ============================================================
// ✅ CONFIGURATION DES RÔLES BTP
// ============================================================
const ROLE_CONFIG = {
  pdg: { 
    label: 'PDG', 
    color: 'error', 
    icon: Shield, 
    description: 'Accès total', 
    level: 100 
  },
  directeur_agence: { 
    label: 'Directeur Agence', 
    color: 'primary', 
    icon: Building2, 
    description: 'Gestion agence', 
    level: 80 
  },
  chef_chantier: { 
    label: 'Chef Chantier', 
    color: 'warning', 
    icon: Construction, 
    description: 'Gestion chantiers', 
    level: 70 
  },
  conducteur_travaux: { 
    label: 'Conducteur Travaux', 
    color: 'secondary', 
    icon: HardHat, 
    description: 'Suivi travaux', 
    level: 65 
  },
  technicien: { 
    label: 'Technicien', 
    color: 'info', 
    icon: Wrench, 
    description: 'Travaux techniques', 
    level: 50 
  },
  gestionnaire_stock: { 
    label: 'Gestionnaire Stock', 
    color: 'success', 
    icon: Package, 
    description: 'Gestion matériaux', 
    level: 60 
  },
  commercial_btp: { 
    label: 'Commercial BTP', 
    color: 'accent', 
    icon: Handshake, 
    description: 'Ventes BTP', 
    level: 55 
  },
  comptable_btp: { 
    label: 'Comptable BTP', 
    color: 'info', 
    icon: Calculator, 
    description: 'Comptabilité', 
    level: 65 
  },
  responsable_hse: { 
    label: 'Responsable HSE', 
    color: 'warning', 
    icon: Shield, 
    description: 'Sécurité', 
    level: 70 
  },
  responsable_rh: { 
    label: 'Responsable RH', 
    color: 'secondary', 
    icon: Users, 
    description: 'Ressources humaines', 
    level: 70 
  },
  acheteur: { 
    label: 'Acheteur', 
    color: 'primary', 
    icon: ShoppingBag, 
    description: 'Achats', 
    level: 55 
  },
  assistant_chantier: { 
    label: 'Assistant Chantier', 
    color: 'info', 
    icon: Clipboard, 
    description: 'Support chantier', 
    level: 40 
  },
  securite: { 
    label: 'Sécurité', 
    color: 'error', 
    icon: AlertTriangle, 
    description: 'Sécurité chantiers', 
    level: 60 
  },
  responsable_qualite: { 
    label: 'Responsable Qualité', 
    color: 'success', 
    icon: CheckCircle, 
    description: 'Contrôle qualité', 
    level: 65 
  }
};

const Navbar = ({ content, mode, toggleColorMode }) => {
  const location = useLocation();
  const path = location.pathname || '/';
  const navigate = useNavigate();

  // États principaux
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
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
  const [userRole, setUserRole] = useState('technicien');
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // ✅ ÉTATS OFFLINE
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // États des compteurs BTP
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

  // Récupérer l'utilisateur
  const getUserData = () => {
    try {
      const userData = localStorage.getItem('User');
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  };

  const user = getUserData();
  const role = user?.role_global || user?.role || 'technicien';
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

  // Permissions BTP
  const isPdg = role === 'pdg';
  const isDirecteur = role === 'directeur_agence';
  const isChefChantier = role === 'chef_chantier';
  const isConducteur = role === 'conducteur_travaux';
  const isGestionnaireStock = role === 'gestionnaire_stock';
  const isCommercial = role === 'commercial_btp';
  const isComptable = role === 'comptable_btp';
  const isHSE = role === 'responsable_hse';
  const isRH = role === 'responsable_rh';
  const isAcheteur = role === 'acheteur';
  const isSecurite = role === 'securite';
  const isQualite = role === 'responsable_qualite';

  const isAdmin = isPdg || isDirecteur;

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

  const roleConfig = ROLE_CONFIG[role] || ROLE_CONFIG.technicien;
  const RoleIcon = roleConfig.icon;

  // ✅ FONCTIONS OFFLINE
  // Initialiser IndexedDB
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

  // Récupérer le nombre d'opérations en attente
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
      console.log(`📝 ${count} opérations en attente`);
      return count;
    } catch (error) {
      console.error('Erreur comptage:', error);
      setPendingCount(0);
      return 0;
    }
  };

  // Supprimer une opération
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
      console.log(`🗑️ Opération ${id} supprimée`);
    } catch (error) {
      console.error('Erreur suppression:', error);
    }
  };

  // ✅ SYNCHRONISATION
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
      
      // Mettre à jour le compteur
      await getPendingCount();
      
      // Notification
      if (synced > 0) {
        // Afficher une notification dans la console
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
      
      // Attendre un peu que la connexion soit stable
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

    // ✅ Synchronisation périodique (toutes les 30 secondes)
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

  // ✅ Charger le compteur au montage
  useEffect(() => {
    getPendingCount();
  }, []);

  // Charger les données BTP
  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem('Token');
        if (!token || !AxiosInstance) return;

        if (isAdmin) {
          const chantiersRes = await AxiosInstance.get('/chantiers/?status=en_cours', {
            headers: { Authorization: `Token ${token}` }
          }).catch(() => ({ data: [] }));
          setChantiersEnCours(chantiersRes.data?.length || 0);

          const securiteRes = await AxiosInstance.get('/alertes-securite/?status=active', {
            headers: { Authorization: `Token ${token}` }
          }).catch(() => ({ data: [] }));
          setAlertesSecurite(securiteRes.data?.length || 0);

          const stocksRes = await AxiosInstance.get('/materiaux/stock-faible/', {
            headers: { Authorization: `Token ${token}` }
          }).catch(() => ({ data: [] }));
          setStocksFaibles(stocksRes.data?.length || 0);

          const enginsRes = await AxiosInstance.get('/engins/disponibles/', {
            headers: { Authorization: `Token ${token}` }
          }).catch(() => ({ data: [] }));
          setEnginsDisponibles(enginsRes.data?.length || 0);

          const employesRes = await AxiosInstance.get('/employes/presents/', {
            headers: { Authorization: `Token ${token}` }
          }).catch(() => ({ data: [] }));
          setEmployesPresent(employesRes.data?.length || 0);

          const notifRes = await AxiosInstance.get('/notifications/unread-count/', {
            headers: { Authorization: `Token ${token}` }
          }).catch(() => ({ data: { unread_count: 0 } }));
          setNotificationsCount(notifRes.data?.unread_count || 0);

          const cmdRes = await AxiosInstance.get('/commandes/?status=en_attente', {
            headers: { Authorization: `Token ${token}` }
          }).catch(() => ({ data: [] }));
          setCommandesEnAttente(cmdRes.data?.length || 0);

          const medicalRes = await AxiosInstance.get('/employes/visites-medicales-proches/', {
            headers: { Authorization: `Token ${token}` }
          }).catch(() => ({ data: [] }));
          setVisitesMedicales(medicalRes.data?.length || 0);

          const inspRes = await AxiosInstance.get('/inspections/?status=en_cours', {
            headers: { Authorization: `Token ${token}` }
          }).catch(() => ({ data: [] }));
          setInspectionsEnCours(inspRes.data?.length || 0);
        }

        if (isCommercial || isAdmin) {
          const facturesRes = await AxiosInstance.get('/factures/?status=impayee', {
            headers: { Authorization: `Token ${token}` }
          }).catch(() => ({ data: [] }));
          setFacturesImpayees(facturesRes.data?.length || 0);
        }

      } catch (error) {
        console.error('Erreur chargement données BTP:', error);
      }
    };

    loadData();
  }, [role, isAdmin, isCommercial]);

  // Gestion des sections
  const handleSectionToggle = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Déconnexion
  const logoutUser = () => {
    setIsUserMenuOpen(false);
    localStorage.removeItem('Token');
    localStorage.removeItem('User');
    navigate('/');
  };

  // ============================================================
  // ✅ MENU ERP BTP
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
      items: [
        { id: 'chantiers', text: 'Chantiers', icon: Construction, path: '/chantiers', permission: true, badge: chantiersEnCours > 0 ? chantiersEnCours : 0 },
        { id: 'chantiers-en-cours', text: 'Chantiers en Cours', icon: Construction, path: '/chantiers/en-cours', permission: true },
        { id: 'planning-chantiers', text: 'Planning Chantiers', icon: Calendar, path: '/planning-chantiers', permission: isAdmin || isChefChantier },
        { id: 'phases-travaux', text: 'Phases Travaux', icon: Layers, path: '/phases-travaux', permission: isAdmin || isChefChantier || isConducteur },
        { id: 'suivi-avancement', text: 'Suivi Avancement', icon: Target, path: '/suivi-avancement', permission: isAdmin || isChefChantier || isConducteur },
        { id: 'inspections', text: 'Inspections', icon: ClipboardCheck, path: '/inspections', permission: isAdmin || isChefChantier || isQualite, badge: inspectionsEnCours > 0 ? inspectionsEnCours : 0 }
      ]
    },
    {
      name: 'STOCKS & MATÉRIAUX',
      icon: Package,
      items: [
        { id: 'materiaux', text: 'Matériaux', icon: Package, path: '/materiaux', permission: isAdmin || isGestionnaireStock || isAcheteur },
        { id: 'catalogues', text: 'Catalogues', icon: BookOpen, path: '/catalogues', permission: isAdmin || isGestionnaireStock || isAcheteur },
        { id: 'stocks', text: 'Stocks', icon: Boxes, path: '/stocks', permission: isAdmin || isGestionnaireStock, badge: stocksFaibles > 0 ? stocksFaibles : 0 },
        { id: 'entrepots', text: 'Entrepôts', icon: Warehouse, path: '/entrepots', permission: isAdmin || isGestionnaireStock },
        { id: 'mouvements-stock', text: 'Mouvements Stock', icon: MoveHorizontal, path: '/mouvements-stock', permission: isAdmin || isGestionnaireStock },
        { id: 'transferts', text: 'Transferts', icon: Truck, path: '/transferts', permission: isAdmin || isGestionnaireStock },
        { id: 'alertes-stock', text: 'Alertes Stock', icon: AlertOctagon, path: '/alertes-stock', permission: isAdmin || isGestionnaireStock || isAcheteur, badge: stocksFaibles > 0 ? stocksFaibles : 0 }
      ]
    },
    {
      name: 'ENGINS & ÉQUIPEMENTS',
      icon: Truck,
      items: [
        { id: 'engins', text: 'Engins', icon: Truck, path: '/engins', permission: isAdmin || isChefChantier || isConducteur },
        { id: 'engins-disponibles', text: 'Disponibles', icon: Truck, path: '/engins/disponibles', permission: isAdmin || isChefChantier, badge: enginsDisponibles > 0 ? enginsDisponibles : 0 },
        { id: 'maintenance', text: 'Maintenance', icon: Wrench, path: '/maintenance', permission: isAdmin || isChefChantier },
        { id: 'contrats-location', text: 'Contrats Location', icon: FileText, path: '/contrats-location', permission: isAdmin || isGestionnaireStock },
        { id: 'assurances-engins', text: 'Assurances', icon: Shield, path: '/assurances-engins', permission: isAdmin },
        { id: 'carnet-entretien', text: 'Carnet Entretien', icon: BookOpen, path: '/carnet-entretien', permission: isAdmin || isChefChantier }
      ]
    },
    {
      name: 'RESSOURCES HUMAINES',
      icon: Users,
      items: [
        { id: 'employes', text: 'Employés', icon: Users, path: '/employes', permission: isAdmin || isRH },
        { id: 'employes-present', text: 'Présents', icon: UserCheck, path: '/employes/presents', permission: isAdmin || isRH || isChefChantier, badge: employesPresent > 0 ? employesPresent : 0 },
        { id: 'planning-personnel', text: 'Planning Personnel', icon: CalendarClock, path: '/planning-personnel', permission: isAdmin || isRH || isChefChantier },
        { id: 'habilitations', text: 'Habilitations', icon: Award, path: '/habilitations', permission: isAdmin || isRH || isHSE },
        { id: 'formations', text: 'Formations', icon: BookOpen, path: '/formations', permission: isAdmin || isRH },
        { id: 'visites-medicales', text: 'Visites Médicales', icon: Activity, path: '/visites-medicales', permission: isAdmin || isRH || isHSE, badge: visitesMedicales > 0 ? visitesMedicales : 0 },
        { id: 'accidents-travail', text: 'Accidents', icon: AlertTriangle, path: '/accidents-travail', permission: isAdmin || isRH || isHSE }
      ]
    }
  ];

  // ============================================================
  // ✅ SECTIONS ADMIN BTP
  // ============================================================

  if (isAdmin) {
    menuSections.splice(4, 0, {
      name: 'ACHATS & FOURNISSEURS',
      icon: Handshake,
      items: [
        { id: 'fournisseurs', text: 'Fournisseurs', icon: Building2, path: '/fournisseurs', permission: isAdmin || isAcheteur },
        { id: 'commandes', text: 'Commandes', icon: FileText, path: '/commandes', permission: isAdmin || isAcheteur, badge: commandesEnAttente > 0 ? commandesEnAttente : 0 },
        { id: 'receptions', text: 'Réceptions', icon: PackageCheck, path: '/receptions', permission: isAdmin || isGestionnaireStock },
        { id: 'retours', text: 'Retours', icon: RotateCcw, path: '/retours', permission: isAdmin || isGestionnaireStock },
        { id: 'factures-fournisseurs', text: 'Factures Fournisseurs', icon: ReceiptIcon, path: '/factures-fournisseurs', permission: isAdmin || isComptable, badge: facturesImpayees > 0 ? facturesImpayees : 0 },
        { id: 'paiements-fournisseurs', text: 'Paiements', icon: CreditCardIcon, path: '/paiements-fournisseurs', permission: isAdmin || isComptable }
      ]
    });

    menuSections.splice(5, 0, {
      name: 'SÉCURITÉ & QUALITÉ',
      icon: Shield,
      items: [
        { id: 'securite', text: 'Sécurité', icon: Shield, path: '/securite', permission: isAdmin || isHSE || isSecurite },
        { id: 'alertes-securite', text: 'Alertes Sécurité', icon: AlertTriangle, path: '/alertes-securite', permission: isAdmin || isHSE || isSecurite, badge: alertesSecurite > 0 ? alertesSecurite : 0 },
        { id: 'qualite', text: 'Qualité', icon: CheckCircle, path: '/qualite', permission: isAdmin || isQualite },
        { id: 'controles-qualite', text: 'Contrôles', icon: ClipboardList, path: '/controles-qualite', permission: isAdmin || isQualite },
        { id: 'non-conformites', text: 'Non-Conformités', icon: AlertCircle, path: '/non-conformites', permission: isAdmin || isQualite },
        { id: 'audits', text: 'Audits', icon: ClipboardCheck, path: '/audits', permission: isAdmin || isQualite }
      ]
    });

    menuSections.splice(6, 0, {
      name: 'FINANCES & COMPTABILITÉ',
      icon: DollarSign,
      items: [
        { id: 'comptabilite', text: 'Comptabilité', icon: Calculator, path: '/comptabilite', permission: isAdmin || isComptable },
        { id: 'budgets', text: 'Budgets', icon: PiggyBank, path: '/budgets', permission: isAdmin || isComptable },
        { id: 'depenses', text: 'Dépenses', icon: TrendingDown, path: '/depenses', permission: isAdmin || isComptable },
        { id: 'factures-clients', text: 'Factures Clients', icon: FileText, path: '/factures-clients', permission: isAdmin || isComptable, badge: facturesImpayees > 0 ? facturesImpayees : 0 },
        { id: 'paiements-clients', text: 'Paiements Clients', icon: CreditCard, path: '/paiements-clients', permission: isAdmin || isComptable },
        { id: 'rapports-financiers', text: 'Rapports', icon: ChartPie, path: '/rapports-financiers', permission: isAdmin || isComptable }
      ]
    });

    menuSections.splice(7, 0, {
      name: 'ADMINISTRATION',
      icon: Settings,
      items: [
        { id: 'company-config', text: 'Configuration', icon: Building2, path: '/company-config', permission: isPdg },
        { id: 'utilisateurs', text: 'Utilisateurs', icon: Users, path: '/utilisateurs', permission: isPdg },
        { id: 'agences', text: 'Agences', icon: Building2, path: '/agences', permission: isPdg },
        { id: 'roles', text: 'Rôles & Permissions', icon: Shield, path: '/roles', permission: isPdg },
        { id: 'notifications', text: 'Notifications', icon: Bell, path: '/notifications', permission: isPdg, badge: notificationsCount > 0 ? notificationsCount : 0 },
        { id: 'audit', text: "Journal d'audit", icon: History, path: '/audit', permission: isPdg },
        { id: 'backups', text: 'Sauvegardes', icon: Database, path: '/backups', permission: isPdg }
      ]
    });
  }

  menuSections.push({
    name: 'MON ESPACE',
    icon: UserCircle,
    items: [
      { id: 'profile', text: 'Mon Profil', icon: UserCircle, path: '/profile', permission: true },
      { id: 'my-notifications', text: 'Mes Notifications', icon: BellRing, path: '/my-notifications', permission: true, badge: notificationsCount > 0 ? notificationsCount : 0 },
      { id: 'support', text: 'Support', icon: HelpCircle, path: '/support', permission: true },
      { id: 'preferences', text: 'Préférences', icon: Settings, path: '/my-preferences', permission: true }
    ]
  });

  const visibleSections = menuSections
    .map(section => {
      const visibleItems = section.items.filter(item => item.permission === true);
      return {
        ...section,
        items: visibleItems
      };
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
      
      {/* ✅ INDICATEUR OFFLINE EN HAUT */}
      <div className={`offline-indicator ${isOnline ? 'online' : 'offline'}`}>
        <div className="status-container">
          {isOnline ? (
            <Wifi className="w-4 h-4" />
          ) : (
            <WifiOff className="w-4 h-4" />
          )}
          <span className="status-text">{isOnline ? 'En ligne' : 'Hors ligne'}</span>
          {pendingCount > 0 && (
            <span className="pending-badge">
              📝 {pendingCount} en attente
              {isOnline && (
                <button 
                  onClick={() => {
                    console.log('🔄 Synchronisation manuelle demandée');
                    syncPendingOperations();
                  }} 
                  disabled={isSyncing}
                  className="sync-btn"
                  title="Synchroniser maintenant"
                >
                  {isSyncing ? '⏳' : '🔄'}
                </button>
              )}
            </span>
          )}
        </div>
      </div>

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

            {/* Centre - Date/Heure */}
            <div className="hidden lg:flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary-content/10 backdrop-blur-sm">
                <Calendar className="w-4 h-4 text-primary-content/80" />
                <span className="text-sm font-medium text-primary-content">{formattedDate}</span>
                <div className="w-px h-4 bg-primary-content/30 mx-1"></div>
                <Clock className="w-4 h-4 text-primary-content/80" />
                <span className="text-sm font-medium text-primary-content">{formattedTime}</span>
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

              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary-content/10">
                <RoleIcon className="w-4 h-4 text-primary-content" />
                <span className="text-primary-content text-xs font-medium">{roleConfig.label}</span>
                {isPdg && (
                  <span className="badge badge-error badge-xs ml-1">PDG</span>
                )}
                {isDirecteur && (
                  <span className="badge badge-primary badge-xs ml-1">Dir.</span>
                )}
              </div>

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
                              {isPdg && <span className="badge badge-error badge-sm">PDG</span>}
                              {isDirecteur && <span className="badge badge-primary badge-sm">Dir.</span>}
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
                          <span className="text-sm text-base-content">Mes préférences</span>
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

          <div className={`p-4 border-b border-primary/20 ${!sidebarOpen && 'text-center'}`}>
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
                  <div className="flex items-center gap-1 mt-1">
                    <span className={`badge badge-${roleConfig.color} badge-sm`}>
                      <RoleIcon className="w-3 h-3 mr-1" />
                      {roleConfig.label}
                    </span>
                    {isPdg && <span className="badge badge-error badge-sm">PDG</span>}
                    {isDirecteur && <span className="badge badge-primary badge-sm">Dir.</span>}
                  </div>
                </div>
              )}
            </div>
          </div>

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
          {content || (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-base-content/50">Aucun contenu à afficher</p>
              </div>
            </div>
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
                  </div>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-primary-content p-2 rounded-lg hover:bg-primary-content/10">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-primary-content/10 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-primary-content/20 flex items-center justify-center text-primary-content font-bold">
                  {userInitial || 'U'}
                </div>
                <div>
                  <p className="text-primary-content font-medium text-sm">{userFullName || userName}</p>
                  <p className="text-primary-content/60 text-xs">{userEmail}</p>
                </div>
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