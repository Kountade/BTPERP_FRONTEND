// App.jsx
import './App.css';
import Register from './components/Register';
import Login from './components/Login';
import Home from './components/Home';
import Navbar from './components/Navbar';
import { Routes, Route, useLocation } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoutes';
import PasswordResetRequest from './components/PasswordResetRequest';
import PasswordReset from './components/PasswordReset';

// ✅ Import des composants AGENCES
import AgenceList from './components/users/AgenceList';
import CreateAgence from './components/users/CreateAgence';


// ✅ Import des composants AGENCES

import Utilisateurs from './components/users/Utilisateurs';
import UtilisateurForm from './components/users/UtilisateurForm';
import UtilisateurDetails from './components/users/UtilisateurDetails';

import ServicesList from './components/grh/ServicesList';
import ServiceForm from './components/grh/ServiceForm';
import ServiceDetails from './components/grh/ServiceDetails';


function App() {
  const location = useLocation();
  
  // Routes sans Navbar (pages d'authentification)
  const noNavBar = location.pathname === "/" || 
                   location.pathname === "/register" || 
                   location.pathname.includes("password") ||
                   location.pathname === "/login";

  return (
    <>
      {noNavBar ? (
        // Routes SANS Navbar (authentification)
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/request/password_reset" element={<PasswordResetRequest />} />
          <Route path="/password-reset/:token" element={<PasswordReset />} />
        </Routes>
      ) : (
        // Routes AVEC Navbar
        <Navbar
          content={
            <Routes>
              {/* Route protégée */}
              <Route element={<ProtectedRoute />}>
               
                {/* ==================== TABLEAU DE BORD ==================== */}
                <Route path="/dashboard" element={<Home />} />
                <Route path="/" element={<Home />} />

                {/* ==================== AGENCES ==================== */}
                <Route path="/agences" element={<AgenceList />} />
                <Route path="/agences/create" element={<CreateAgence />} />
                <Route path="/agences/edit/:id" element={<CreateAgence />} />
       
                <Route path="/utilisateurs" element={<Utilisateurs />} />
                <Route path="/utilisateurs/create" element={<UtilisateurForm />} />
                <Route path="/utilisateurs/edit/:id" element={<UtilisateurForm />} />
                <Route path="/utilisateurs/:id" element={<UtilisateurDetails />} />

                {/* ==================== FINANCES ==================== 
                <Route path="/finances-dashboard" element={<FinancesDashboard />} />
                */}

              
                <Route path="/services" element={<ServicesList />} />
                <Route path="/services/create" element={<ServiceForm />} />
                <Route path="/services/edit/:id" element={<ServiceForm />} />
                <Route path="/services/:id" element={<ServiceDetails />} />        
                  

                {/* ==================== LIVRAISONS ==================== 
                <Route path="/livraisons" element={<DeliveriesList />} />
                <Route path="/livraisons/:id" element={<DeliveryDetails />} />
                */}

                {/* ==================== AUDIT ====================
                <Route path="/audit" element={<AuditLog />} />
                */}

                {/* ==================== PARAMÈTRES ==================== */}
                {/* ==================== COMPANY CONFIG ==================== */}
               
              </Route>
            </Routes>
          }
        />
      )}
    </>
  );
}

export default App;