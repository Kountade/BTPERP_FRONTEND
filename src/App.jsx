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

import PostesList from './components/grh/PostesList';
import PosteForm from './components/grh/PosteForm';
import PosteDetails from './components/grh/PosteDetails';

import EmployesList from './components/grh/EmployesList';
import EmployeForm from './components/grh/EmployeForm';
import EmployeDetails from './components/grh/EmployeDetails';

import CompetencesList from './components/grh/CompetencesList';
import CompetenceForm from './components/grh/CompetenceForm';
import CompetenceDetails from './components/grh/CompetenceDetails';

import ContratList from './components/grh/ContratList';
import ContratForm from './components/grh/ContratForm';
import ContratDetail from './components/grh/ContratDetail';
import ContratPdf from './components/grh/ContratPdf';


import HeureTravailList from './components/grh/HeureTravailList';
import HeureTravailForm from './components/grh/HeureTravailForm';

import AbsenceList from './components/grh/AbsenceList';
import AbsenceForm from './components/grh/AbsenceForm';
import AbsenceDetail from './components/grh/AbsenceDetail';

import PointageList from './components/grh/PointageList';
import PointageForm from './components/grh/PointageForm';
import PointageDetail from './components/grh/PointageDetail';

import NoteDeFraisList from './components/grh/NoteDeFraisList';
import NoteDeFraisForm from './components/grh/NoteDeFraisForm';
import NoteDeFraisDetail from './components/grh/NoteDeFraisDetail';

import DPAEList from './components/grh/DPAEList';
import DPAEForm from './components/grh/DPAEForm';
import DPAEDetail from './components/grh/DPAEDetail';

import PlanningList from './components/grh/PlanningList';
import PlanningForm from './components/grh/PlanningForm';

import FormationList from './components/grh/FormationList';
import FormationDetail from './components/grh/FormationDetail';
import FormationForm from './components/grh/FormationForm';

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

             
 {/* ==================== LIVRAISONS ==================== */}
              
                <Route path="/services" element={<ServicesList />} />
                <Route path="/services/create" element={<ServiceForm />} />
                <Route path="/services/edit/:id" element={<ServiceForm />} />
                <Route path="/services/:id" element={<ServiceDetails />} />   
 {/* ==================== LIVRAISONS ==================== 
                <Route path="/livraisons" element={<DeliveriesList />} />
                <Route path="/livraisons/:id" element={<DeliveryDetails />} />
                */}
                <Route path="/postes" element={<PostesList />} />
                <Route path="/postes/create" element={<PosteForm />} />
                <Route path="/postes/edit/:id" element={<PosteForm />} />
                <Route path="/postes/:id" element={<PosteDetails />} />    
                  
                 {/* EMPLOYÉS */}
                <Route path="/employes" element={<EmployesList />} />
                 <Route path="/employes/create" element={<EmployeForm />} />
                <Route path="/employes/edit/:id" element={<EmployeForm />} />
                 <Route path="/employes/:id" element={<EmployeDetails />} /> 


                 // Dans les routes protégées
                <Route path="/competences" element={<CompetencesList />} />
                <Route path="/competences/create" element={<CompetenceForm />} />
                <Route path="/competences/edit/:id" element={<CompetenceForm />} />
                <Route path="/competences/:id" element={<CompetenceDetails />} />

          

           
// Dans les routes protégées
<Route path="/contrats" element={<ContratList />} />
<Route path="/contrats/create" element={<ContratForm />} />
<Route path="/contrats/edit/:id" element={<ContratForm />} />
<Route path="/contrats/:id" element={<ContratDetail />} />
<Route path="/contrats/pdf/:id" element={<ContratPdf />} />




<Route path="/heures-travail" element={<HeureTravailList />} />
<Route path="/heures-travail/create" element={<HeureTravailForm />} />
<Route path="/heures-travail/edit/:id" element={<HeureTravailForm />} />


                <Route path="/absences" element={<AbsenceList />} />
<Route path="/absences/create" element={<AbsenceForm />} />
<Route path="/absences/edit/:id" element={<AbsenceForm />} />
<Route path="/absences/:id" element={<AbsenceDetail />} />
                {/* ==================== AUDIT ==================== */}


                <Route path="/pointages" element={<PointageList />} />
<Route path="/pointages/create" element={<PointageForm />} />
<Route path="/pointages/edit/:id" element={<PointageForm />} />
<Route path="/pointages/:id" element={<PointageDetail />} />

                {/* ==================== PARAMÈTRES ==================== */}

                 {/* === RH - NOTES DE FRAIS === */}
              <Route path="/notes-frais" element={<NoteDeFraisList />} />
              <Route path="/notes-frais/create" element={<NoteDeFraisForm />} />
              <Route path="/notes-frais/edit/:id" element={<NoteDeFraisForm />} />
              <Route path="/notes-frais/:id" element={<NoteDeFraisDetail />} />


                            {/* === RH - DPAE === */}
              <Route path="/dpae" element={<DPAEList />} />
              <Route path="/dpae/create" element={<DPAEForm />} />
              <Route path="/dpae/edit/:id" element={<DPAEForm />} />
              <Route path="/dpae/:id" element={<DPAEDetail />} />
           

           <Route path="/planning" element={<PlanningList />} />
<Route path="/planning/create" element={<PlanningForm />} />
<Route path="/planning/edit/:id" element={<PlanningForm />} />


// Dans App.jsx
<Route path="/formations" element={<FormationList />} />
<Route path="/formations/create" element={<FormationForm />} />
<Route path="/formations/edit/:id" element={<FormationForm />} />
<Route path="/formations/:id" element={<FormationDetail />} />
               
              </Route>
            </Routes>
          }
        />
      )}
    </>
  );
}

export default App;