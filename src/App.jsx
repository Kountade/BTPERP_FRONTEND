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
import AgenceList from './components/AgenceList';
import CreateAgence from './components/CreateAgence';

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

                {/* ==================== FINANCES ==================== 
                <Route path="/finances-dashboard" element={<FinancesDashboard />} />
                */}

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