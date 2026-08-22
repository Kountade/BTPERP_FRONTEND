// src/components/chantiers/ProjetPdf.jsx
// Génération PDF d'un projet/chantier - Téléchargement et Impression

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  FileText, ChevronLeft, Download, Printer, Loader2,
  Wifi, WifiOff, AlertTriangle, Building2,
  UserCircle, Briefcase, Calendar, DollarSign,
  Clock, Coins, MapPin, Award, BadgeCheck,
  FileCheck, FileX, Eye, Layers, Target, TrendingUp,
  HardHat, Construction
} from 'lucide-react';
import AxiosInstance from '../AxiosInstance';
import jsPDF from 'jspdf';
import logoSvg from '../../assets/logo.svg';

// ========== FONCTION POUR ÉCRIRE LES NOMBRES EN LETTRES ==========
const nombreEnLettres = (montant) => {
  const unite = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
  const dizaine = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'];
  const centaine = ['', 'cent', 'deux cents', 'trois cents', 'quatre cents', 'cinq cents', 'six cents', 'sept cents', 'huit cents', 'neuf cents'];

  const sousBloc = (n) => {
    if (n === 0) return '';
    let lettres = '';
    const cents = Math.floor(n / 100);
    const reste = n % 100;
    if (cents > 0) {
      lettres += centaine[cents];
      if (reste > 0) lettres += ' ';
    }
    if (reste > 0) {
      if (reste < 10) lettres += unite[reste];
      else if (reste < 20) {
        const u = reste - 10;
        if (u === 0) lettres += 'dix';
        else if (u === 1) lettres += 'onze';
        else if (u === 2) lettres += 'douze';
        else if (u === 3) lettres += 'treize';
        else if (u === 4) lettres += 'quatorze';
        else if (u === 5) lettres += 'quinze';
        else if (u === 6) lettres += 'seize';
        else lettres += dizaine[1] + (u ? '-' + unite[u] : '');
      } else {
        const d = Math.floor(reste / 10);
        const u = reste % 10;
        if (d === 7 || d === 9) {
          lettres += dizaine[d - 1] + '-' + (u === 0 ? '' : (u === 1 ? 'onze' : unite[u + 10]));
        } else {
          lettres += dizaine[d];
          if (u === 1 && d !== 8) lettres += ' et un';
          else if (u > 0) lettres += '-' + unite[u];
        }
      }
    }
    return lettres.trim();
  };

  const milliers = Math.floor(montant / 1000);
  const resteMilliers = montant % 1000;
  let result = '';
  if (milliers > 0) {
    if (milliers === 1) result += 'mille';
    else result += sousBloc(milliers) + ' mille';
    if (resteMilliers > 0) result += ' ';
  }
  if (resteMilliers > 0) result += sousBloc(resteMilliers);
  if (result === '') result = 'zéro';
  return result.charAt(0).toUpperCase() + result.slice(1) + ' Francs CFA';
};

// ========== FONCTIONS DE FORMATAGE ==========
const formatNumber = (n) => {
  const num = parseFloat(n) || 0;
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

const formatCurrency = (amt) => `${formatNumber(amt)} FCFA`;

const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '-';

// ========== FONCTION POUR AJOUTER UN FILIGRANE ==========
const addWatermark = (doc, text, options = {}) => {
  const {
    fontSize = 40,
    color = [200, 200, 200],
    opacity = 0.15,
    angle = -45,
    repeat = true,
    spacing = 100
  } = options;

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  const currentFontSize = doc.internal.getFontSize();
  const currentTextColor = doc.internal.getTextColor();
  
  doc.setFontSize(fontSize);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(color[0], color[1], color[2]);
  
  doc.setGState(new doc.GState({ opacity: opacity }));
  
  const diagonal = Math.sqrt(pageWidth * pageWidth + pageHeight * pageHeight);
  const textWidth = doc.getTextWidth(text);
  
  const numX = Math.ceil((diagonal + textWidth) / (textWidth + spacing));
  const numY = Math.ceil(diagonal / spacing);
  
  const offsetX = (pageWidth - numX * (textWidth + spacing)) / 2;
  const offsetY = (pageHeight - numY * spacing) / 2;
  
  if (!repeat) {
    const centerX = pageWidth / 2;
    const centerY = pageHeight / 2;
    doc.text(text, centerX, centerY, { 
      align: 'center',
      angle: angle,
      baseline: 'middle'
    });
  } else {
    for (let i = 0; i < numY; i++) {
      for (let j = 0; j < numX; j++) {
        const x = offsetX + j * (textWidth + spacing);
        const y = offsetY + i * spacing;
        doc.text(text, x, y, {
          angle: angle,
          baseline: 'middle'
        });
      }
    }
  }
  
  doc.setFontSize(currentFontSize);
  doc.setTextColor(currentTextColor[0], currentTextColor[1], currentTextColor[2]);
  doc.setGState(new doc.GState({ opacity: 1 }));
};

// ========== FONCTION DE GÉNÉRATION PDF ==========
const generateProjetPDF = async (projet, phases = [], options = {}) => {
  if (!projet || typeof projet !== 'object') {
    throw new Error('Données du projet invalides');
  }

  return new Promise((resolve, reject) => {
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = 210;
      const pageHeight = 297;
      const margins = { left: 15, right: 15, top: 18, bottom: 18 };
      const contentWidth = pageWidth - margins.left - margins.right;
      let y = margins.top;

      // ========== INFORMATIONS DE L'ENTREPRISE ==========
      const company = {
        name: 'SEYDI GROUP',
        address: 'Dakar, Sénégal',
        phone: '+221 33 123 45 67',
        email: 'contact@seydigroup.com',
        rccm: 'SN DKR 2023 B 123',
        capital: '10 000 000 FCFA'
      };

      // ========== DONNÉES PROJET ==========
      const code = projet.code || `PRJ-${String(projet.id).padStart(6, '0')}`;
      const nom = projet.nom || 'Projet sans nom';
      const statut = projet.statut || 'etude';
      const type = projet.type_projet || 'construction';
      const dateDebut = projet.date_debut || '';
      const dateFinPrevue = projet.date_fin_previsionnelle || '';
      const dateFinReelle = projet.date_fin_reelle || '';
      
      const budgetTotal = parseFloat(projet.budget_total) || 0;
      const budgetMO = parseFloat(projet.budget_mo) || 0;
      const budgetMateriaux = parseFloat(projet.budget_materiaux) || 0;
      const budgetST = parseFloat(projet.budget_sous_traitance) || 0;
      const budgetFG = parseFloat(projet.budget_frais_generaux) || 0;
      
      const coutReelMO = parseFloat(projet.cout_reel_mo) || 0;
      const coutReelMateriaux = parseFloat(projet.cout_reel_materiaux) || 0;
      const coutReelST = parseFloat(projet.cout_reel_sous_traitance) || 0;
      const coutReelFG = parseFloat(projet.cout_reel_frais_generaux) || 0;
      
      const coutTotal = coutReelMO + coutReelMateriaux + coutReelST + coutReelFG;
      const marge = budgetTotal - coutTotal;
      
      const tauxAvancement = parseFloat(projet.taux_avancement) || 0;
      const rentabilitePrevisionnelle = parseFloat(projet.rentabilite_previsionnelle) || 0;
      const noteQualite = parseFloat(projet.note_qualite) || 0;
      const niveauRisque = projet.niveau_risque || 'Faible';
      
      const clientNom = projet.client_nom || projet.client || 'Client inconnu';
      const chefProjetNom = projet.chef_projet_nom || projet.chef_projet || 'Non assigné';
      const agenceNom = projet.agence_nom || projet.agence || 'Non assignée';
      
      const adresse = projet.adresse_chantier || '';
      const codePostal = projet.code_postal || '';
      const ville = projet.ville || '';
      const gps = projet.coordonnees_gps || '';

      const statutLabels = {
        'etude': 'En étude',
        'encours': 'En cours',
        'suspendu': 'Suspendu',
        'termine': 'Terminé',
        'livre': 'Livré'
      };
      const statutLabel = statutLabels[statut] || statut;

      const typeLabels = {
        'construction': 'Construction neuve',
        'renovation': 'Rénovation',
        'extension': 'Extension',
        'tp': 'Travaux Publics',
        'entretien': 'Entretien',
        'demolition': 'Démolition'
      };
      const typeLabel = typeLabels[type] || type;

      const budgetTotalLettres = nombreEnLettres(budgetTotal);

      // ========== CHARGEMENT DU LOGO ==========
      const loadLogo = (src) => new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          canvas.getContext('2d').drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => resolve(null);
        img.src = src;
      });

      loadLogo(logoSvg).then((logoData) => {
        // ================================================================
        // EN-TÊTE
        // ================================================================
        const logoWidth = 26;
        const logoHeight = 26;
        
        if (logoData) {
          doc.addImage(logoData, 'PNG', margins.left, y, logoWidth, logoHeight);
        } else {
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text(company.name, margins.left, y + 5);
        }

        const textStartX = margins.left + logoWidth + 7;
        doc.setFontSize(13.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(26, 35, 126);
        doc.text(company.name, textStartX, y + 5.5);
        
        doc.setFontSize(7.8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(84, 110, 122);
        doc.text(`Capital social : ${company.capital}`, textStartX, y + 10.5);
        doc.text(`N° RCCM : ${company.rccm}`, textStartX, y + 14.5);
        doc.text(company.address.toUpperCase(), textStartX, y + 18.5);
        
        doc.setFontSize(13.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(26, 35, 126);
        doc.text('FICHE DE PROJET', pageWidth - margins.right, y + 5.5, { align: 'right' });
        
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(84, 110, 122);
        doc.text(`N° ${code}`, pageWidth - margins.right, y + 10.5, { align: 'right' });
        doc.text(`Émis le ${formatDate(new Date().toISOString())}`, pageWidth - margins.right, y + 14.5, { align: 'right' });

        y += 27;
        doc.setDrawColor(26, 35, 126);
        doc.setLineWidth(0.4);
        doc.line(margins.left, y, pageWidth - margins.right, y);
        y += 8;

        // ================================================================
        // GRILLE D'INFORMATIONS PROJET
        // ================================================================
        const gridY = y;
        doc.setFillColor(248, 249, 250);
        doc.roundedRect(margins.left, gridY, contentWidth, 24, 2, 2, 'F');
        doc.setDrawColor(224, 224, 224);
        doc.setLineWidth(0.5);
        doc.roundedRect(margins.left, gridY, contentWidth, 24, 2, 2, 'S');

        const colWidth = contentWidth / 4;
        const gridX1 = margins.left;
        const gridX2 = margins.left + colWidth;
        const gridX3 = margins.left + colWidth * 2;
        const gridX4 = margins.left + colWidth * 3;

        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(120, 144, 156);
        
        doc.text('CODE', gridX1 + 4, gridY + 4.5);
        doc.text('STATUT', gridX2 + 4, gridY + 4.5);
        doc.text('TYPE', gridX3 + 4, gridY + 4.5);
        doc.text('AVANCEMENT', gridX4 + 4, gridY + 4.5);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(26, 35, 126);
        doc.text(code, gridX1 + 4, gridY + 13);
        
        const statutColor = statut === 'encours' ? [0, 150, 0] : 
                            statut === 'termine' || statut === 'livre' ? [33, 150, 243] :
                            statut === 'suspendu' ? [255, 193, 7] : [158, 158, 158];
        doc.setTextColor(statutColor[0], statutColor[1], statutColor[2]);
        doc.text(statutLabel, gridX2 + 4, gridY + 13);
        doc.setTextColor(26, 35, 126);
        
        doc.text(typeLabel, gridX3 + 4, gridY + 13);
        doc.text(`${tauxAvancement}%`, gridX4 + 4, gridY + 13);

        // Deuxième ligne : client, chef projet, agence
        const gridY2 = gridY + 24;
        doc.setFillColor(248, 249, 250);
        doc.roundedRect(margins.left, gridY2, contentWidth, 18, 2, 2, 'F');
        doc.setDrawColor(224, 224, 224);
        doc.setLineWidth(0.5);
        doc.roundedRect(margins.left, gridY2, contentWidth, 18, 2, 2, 'S');

        const gridX5 = margins.left;
        const gridX6 = margins.left + colWidth;
        const gridX7 = margins.left + colWidth * 2;
        const gridX8 = margins.left + colWidth * 3;

        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(120, 144, 156);
        doc.text('CLIENT', gridX5 + 4, gridY2 + 4.5);
        doc.text('CHEF DE PROJET', gridX6 + 4, gridY2 + 4.5);
        doc.text('AGENCE', gridX7 + 4, gridY2 + 4.5);
        doc.text('NIVEAU RISQUE', gridX8 + 4, gridY2 + 4.5);

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(33, 33, 33);
        doc.text(clientNom, gridX5 + 4, gridY2 + 13);
        doc.text(chefProjetNom, gridX6 + 4, gridY2 + 13);
        doc.text(agenceNom, gridX7 + 4, gridY2 + 13);
        doc.text(niveauRisque, gridX8 + 4, gridY2 + 13);

        y = gridY2 + 22;

        // ================================================================
        // SECTION LOCALISATION
        // ================================================================
        if (adresse || ville || codePostal || gps) {
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(26, 35, 126);
          doc.text('LOCALISATION', margins.left, y);
          y += 2;
          doc.setDrawColor(224, 224, 224);
          doc.setLineWidth(0.5);
          doc.line(margins.left, y, pageWidth - margins.right, y);
          y += 6;

          const locY = y;
          doc.setFillColor(248, 249, 250);
          doc.roundedRect(margins.left, locY, contentWidth, 18, 2, 2, 'F');
          doc.setDrawColor(224, 224, 224);
          doc.setLineWidth(0.5);
          doc.roundedRect(margins.left, locY, contentWidth, 18, 2, 2, 'S');

          let locText = '';
          if (adresse) locText += `Adresse : ${adresse}`;
          if (codePostal) locText += `, ${codePostal}`;
          if (ville) locText += ` ${ville}`;
          if (gps) locText += ` (GPS: ${gps})`;
          if (!locText) locText = 'Non renseigné';

          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(33, 33, 33);
          const locLines = doc.splitTextToSize(locText, contentWidth - 12);
          doc.text(locLines, margins.left + 6, locY + 6);
          y = locY + 18 + 6;
        }

        // ================================================================
        // SECTION CALENDRIER
        // ================================================================
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(26, 35, 126);
        doc.text('CALENDRIER', margins.left, y);
        y += 2;
        doc.setDrawColor(224, 224, 224);
        doc.setLineWidth(0.5);
        doc.line(margins.left, y, pageWidth - margins.right, y);
        y += 6;

        const calY = y;
        doc.setFillColor(248, 249, 250);
        doc.roundedRect(margins.left, calY, contentWidth, 18, 2, 2, 'F');
        doc.setDrawColor(224, 224, 224);
        doc.setLineWidth(0.5);
        doc.roundedRect(margins.left, calY, contentWidth, 18, 2, 2, 'S');

        const calColW = contentWidth / 3;
        const calX1 = margins.left;
        const calX2 = margins.left + calColW;
        const calX3 = margins.left + calColW * 2;

        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(120, 144, 156);
        doc.text('DÉBUT', calX1 + 4, calY + 4.5);
        doc.text('FIN PRÉVUE', calX2 + 4, calY + 4.5);
        doc.text('FIN RÉELLE', calX3 + 4, calY + 4.5);

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(33, 33, 33);
        doc.text(formatDate(dateDebut), calX1 + 4, calY + 13);
        doc.text(formatDate(dateFinPrevue), calX2 + 4, calY + 13);
        doc.text(dateFinReelle ? formatDate(dateFinReelle) : 'Non terminé', calX3 + 4, calY + 13);

        y = calY + 22;

        // ================================================================
        // TABLEAU DES BUDGETS
        // ================================================================
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(26, 35, 126);
        doc.text('BUDGETS ET COÛTS', margins.left, y);
        y += 2;
        doc.setDrawColor(224, 224, 224);
        doc.setLineWidth(0.5);
        doc.line(margins.left, y, pageWidth - margins.right, y);
        y += 6;

        const colBudgetX = margins.left;
        const colBudgetY = y;
        const colWidthBudget = contentWidth / 3;

        // En-tête du tableau
        doc.setFillColor(26, 35, 126);
        doc.roundedRect(colBudgetX, colBudgetY, contentWidth, 7, 2, 2, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'bold');
        doc.text('Poste', colBudgetX + 3, colBudgetY + 4.5);
        doc.text('Budget prévu', colBudgetX + colWidthBudget + 3, colBudgetY + 4.5);
        doc.text('Coût réel', colBudgetX + colWidthBudget * 2 + 3, colBudgetY + 4.5);

        y = colBudgetY + 7;
        let currentY = y;
        let rowIndex = 0;

        const budgetItems = [
          { label: 'Main d\'œuvre', budget: budgetMO, reel: coutReelMO },
          { label: 'Matériaux', budget: budgetMateriaux, reel: coutReelMateriaux },
          { label: 'Sous-traitance', budget: budgetST, reel: coutReelST },
          { label: 'Frais généraux', budget: budgetFG, reel: coutReelFG },
        ];

        for (const item of budgetItems) {
          if (rowIndex % 2 === 0) {
            doc.setFillColor(248, 249, 250);
            doc.rect(colBudgetX, currentY - 0.5, contentWidth, 6.5, 'F');
          }
          doc.setDrawColor(224, 224, 224);
          doc.setLineWidth(0.1);
          doc.line(colBudgetX, currentY, colBudgetX + colWidthBudget, currentY + 6);
          doc.line(colBudgetX + colWidthBudget, currentY, colBudgetX + colWidthBudget * 2, currentY + 6);
          doc.line(colBudgetX + colWidthBudget * 2, currentY, colBudgetX + contentWidth, currentY + 6);
          
          doc.setTextColor(33, 33, 33);
          doc.setFontSize(8);
          doc.setFont('helvetica', 'normal');
          doc.text(item.label, colBudgetX + 3, currentY + 4);
          doc.text(formatCurrency(item.budget), colBudgetX + colWidthBudget + 3, currentY + 4);
          doc.text(formatCurrency(item.reel), colBudgetX + colWidthBudget * 2 + 3, currentY + 4);
          
          currentY += 6.5;
          rowIndex++;
        }

        // Ligne totale
        doc.setFillColor(26, 35, 126);
        doc.roundedRect(colBudgetX, currentY - 0.5, contentWidth, 7, 2, 2, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('TOTAL', colBudgetX + 3, currentY + 4);
        doc.text(formatCurrency(budgetTotal), colBudgetX + colWidthBudget + 3, currentY + 4);
        doc.text(formatCurrency(coutTotal), colBudgetX + colWidthBudget * 2 + 3, currentY + 4);

        y = currentY + 8;

        // ================================================================
        // INDICATEURS
        // ================================================================
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(26, 35, 126);
        doc.text('INDICATEURS', margins.left, y);
        y += 2;
        doc.setDrawColor(224, 224, 224);
        doc.setLineWidth(0.5);
        doc.line(margins.left, y, pageWidth - margins.right, y);
        y += 6;

        const indY = y;
        doc.setFillColor(248, 249, 250);
        doc.roundedRect(margins.left, indY, contentWidth, 18, 2, 2, 'F');
        doc.setDrawColor(224, 224, 224);
        doc.setLineWidth(0.5);
        doc.roundedRect(margins.left, indY, contentWidth, 18, 2, 2, 'S');

        const indColW = contentWidth / 3;
        const indX1 = margins.left;
        const indX2 = margins.left + indColW;
        const indX3 = margins.left + indColW * 2;

        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(120, 144, 156);
        doc.text('AVANCEMENT', indX1 + 4, indY + 4.5);
        doc.text('RENTABILITÉ PRÉV.', indX2 + 4, indY + 4.5);
        doc.text('NOTE QUALITÉ', indX3 + 4, indY + 4.5);

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(33, 33, 33);
        doc.text(`${tauxAvancement}%`, indX1 + 4, indY + 13);
        doc.text(`${rentabilitePrevisionnelle}%`, indX2 + 4, indY + 13);
        doc.text(`${noteQualite}/5`, indX3 + 4, indY + 13);

        y = indY + 22;

        // ================================================================
        // PHASES
        // ================================================================
        if (phases && phases.length > 0) {
          doc.addPage();
          y = margins.top;
          
          // En-tête de page (identique)
          if (logoData) {
            doc.addImage(logoData, 'PNG', margins.left, y, logoWidth, logoHeight);
          }
          doc.setFontSize(13.5);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(26, 35, 126);
          doc.text(company.name, textStartX, y + 5.5);
          doc.setFontSize(7.8);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(84, 110, 122);
          doc.text(`Capital social : ${company.capital}`, textStartX, y + 10.5);
          doc.text(`N° RCCM : ${company.rccm}`, textStartX, y + 14.5);
          doc.text(company.address.toUpperCase(), textStartX, y + 18.5);
          
          doc.setFontSize(13.5);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(26, 35, 126);
          doc.text('PHASES DU PROJET', pageWidth - margins.right, y + 5.5, { align: 'right' });
          doc.setFontSize(8.5);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(84, 110, 122);
          doc.text(code, pageWidth - margins.right, y + 10.5, { align: 'right' });
          
          y += 27;
          doc.setDrawColor(26, 35, 126);
          doc.setLineWidth(0.4);
          doc.line(margins.left, y, pageWidth - margins.right, y);
          y += 8;

          // En-tête du tableau des phases
          const phaseCols = [margins.left, margins.left + contentWidth * 0.35, margins.left + contentWidth * 0.55, margins.left + contentWidth * 0.75];
          doc.setFillColor(26, 35, 126);
          doc.roundedRect(margins.left, y, contentWidth, 7, 2, 2, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(7.5);
          doc.setFont('helvetica', 'bold');
          doc.text('Nom', phaseCols[0] + 3, y + 4.5);
          doc.text('Type', phaseCols[1] + 3, y + 4.5);
          doc.text('Avancement', phaseCols[2] + 3, y + 4.5);
          doc.text('Budget', phaseCols[3] + 3, y + 4.5);
          y += 7;

          for (let idx = 0; idx < phases.length; idx++) {
            const phase = phases[idx];
            if (idx % 2 === 0) {
              doc.setFillColor(248, 249, 250);
              doc.rect(margins.left, y - 0.5, contentWidth, 6.5, 'F');
            }
            doc.setDrawColor(224, 224, 224);
            doc.setLineWidth(0.1);
            doc.line(phaseCols[0], y, phaseCols[0], y + 6);
            doc.line(phaseCols[1], y, phaseCols[1], y + 6);
            doc.line(phaseCols[2], y, phaseCols[2], y + 6);
            doc.line(phaseCols[3], y, phaseCols[3], y + 6);

            doc.setTextColor(33, 33, 33);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.text(phase.nom || 'Sans nom', phaseCols[0] + 3, y + 4);
            doc.text(phase.type_display || phase.type_phase || '', phaseCols[1] + 3, y + 4);
            doc.text(`${phase.taux_avancement || 0}%`, phaseCols[2] + 3, y + 4);
            doc.text(formatCurrency(phase.budget || 0), phaseCols[3] + 3, y + 4);
            y += 6.5;
          }
        }

        // ================================================================
        // SIGNATURES
        // ================================================================
        const signatureY = y + 8;
        const signatureWidth = 85;
        const signatureX1 = margins.left;
        const signatureX2 = pageWidth - margins.right - signatureWidth;

        doc.setDrawColor(66, 66, 66);
        doc.setLineWidth(0.5);
        doc.line(signatureX1, signatureY + 5, signatureX1 + signatureWidth, signatureY + 5);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(84, 110, 122);
        doc.text('Signature du Chef de projet', signatureX1 + (signatureWidth / 2), signatureY, { align: 'center' });
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(120, 144, 156);
        doc.text('Nom et date', signatureX1 + (signatureWidth / 2), signatureY + 12, { align: 'center' });

        doc.line(signatureX2, signatureY + 5, signatureX2 + signatureWidth, signatureY + 5);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(84, 110, 122);
        doc.text('Signature du Client', signatureX2 + (signatureWidth / 2), signatureY, { align: 'center' });
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(120, 144, 156);
        doc.text(clientNom, signatureX2 + (signatureWidth / 2), signatureY + 12, { align: 'center' });

        y = signatureY + 20;

        // ================================================================
        // PIED DE PAGE
        // ================================================================
        const footerY = pageHeight - margins.bottom - 10;
        doc.setDrawColor(224, 224, 224);
        doc.setLineWidth(0.5);
        doc.line(margins.left, footerY - 5, pageWidth - margins.right, footerY - 5);
        
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(120, 144, 156);
        doc.text('SEYDI GROUP - DAKAR, SÉNÉGAL', pageWidth / 2, footerY, { align: 'center' });
        doc.text(`Tél: ${company.phone} - Email: ${company.email}`, pageWidth / 2, footerY + 4, { align: 'center' });
        doc.text(`RCCM: ${company.rccm}`, pageWidth / 2, footerY + 8, { align: 'center' });

        // ================================================================
        // NUMÉROTATION DES PAGES ET FILIGRANE
        // ================================================================
        const watermarkText = options.watermark || 'PROJET - CONFIDENTIEL';
        const watermarkOptions = {
          fontSize: options.watermarkSize || 40,
          color: options.watermarkColor || [200, 200, 200],
          opacity: options.watermarkOpacity || 0.12,
          angle: options.watermarkAngle || -45,
          repeat: options.watermarkRepeat !== undefined ? options.watermarkRepeat : true,
          spacing: options.watermarkSpacing || 100
        };

        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          addWatermark(doc, watermarkText, watermarkOptions);
          doc.setFontSize(7);
          doc.setTextColor(160, 160, 170);
          doc.text(`Page ${i}/${pageCount}`, pageWidth - margins.right, pageHeight - margins.bottom, { align: 'right' });
        }

        const pdfBlob = doc.output('blob');
        resolve(pdfBlob);

      }).catch(reject);

    } catch (error) {
      reject(error);
    }
  });
};

// ========== COMPOSANT PRINCIPAL ==========
function ProjetPdf() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [projet, setProjet] = useState(null);
  const [phases, setPhases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const iframeRef = useRef(null);

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

  // Charger les données et générer le PDF
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('Token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Charger le projet
        const projetRes = await AxiosInstance.get(`/projets/${id}/`, {
          headers: { Authorization: `Token ${token}` }
        });
        setProjet(projetRes.data);

        // Charger les phases
        let phasesData = [];
        try {
          const phasesRes = await AxiosInstance.get(`/projets/${id}/phases/`, {
            headers: { Authorization: `Token ${token}` }
          });
          phasesData = phasesRes.data || [];
          setPhases(phasesData);
        } catch (phaseError) {
          console.warn('⚠️ Erreur chargement phases:', phaseError);
        }

        // Générer le PDF automatiquement
        await generatePDF(projetRes.data, phasesData);

      } catch (error) {
        console.error('❌ Erreur chargement:', error);
        if (error.response?.status === 401) {
          navigate('/login');
        } else if (error.response?.status === 404) {
          setError('Projet non trouvé');
        } else {
          setError('Erreur lors du chargement du projet');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadData();
    }

    // Nettoyer l'URL blob
    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [id, navigate]);

  // Générer le PDF
  const generatePDF = async (projetData, phasesData) => {
    if (!projetData) return;
    
    setGenerating(true);
    try {
      const blob = await generateProjetPDF(projetData, phasesData, {
        watermark: 'PROJET - CONFIDENTIEL',
        watermarkSize: 40,
        watermarkColor: [200, 200, 200],
        watermarkOpacity: 0.12,
        watermarkAngle: -45,
        watermarkRepeat: true,
        watermarkSpacing: 100
      });

      // Créer une URL pour le blob
      const url = URL.createObjectURL(blob);
      
      // Nettoyer l'ancienne URL
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
      
      setPdfBlobUrl(url);

      // Charger dans l'iframe
      if (iframeRef.current) {
        iframeRef.current.src = url;
      }

    } catch (error) {
      console.error('❌ Erreur génération PDF:', error);
      setError('Erreur lors de la génération du PDF');
    } finally {
      setGenerating(false);
    }
  };

  // ✅ Télécharger le PDF
  const handleDownload = () => {
    if (pdfBlobUrl) {
      const link = document.createElement('a');
      const code = projet?.code || `PRJ-${String(projet?.id || '').padStart(6, '0')}`;
      link.href = pdfBlobUrl;
      link.download = `Projet_${code}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // ✅ Imprimer le PDF
  const handlePrint = () => {
    if (iframeRef.current) {
      try {
        iframeRef.current.contentWindow.print();
      } catch (e) {
        // Fallback: ouvrir dans un nouvel onglet pour imprimer
        if (pdfBlobUrl) {
          const win = window.open(pdfBlobUrl, '_blank');
          win?.focus();
        }
      }
    }
  };

  // ✅ Régénérer le PDF
  const handleRegenerate = async () => {
    await generatePDF(projet, phases);
  };

  const isActif = projet?.statut === 'encours' || projet?.statut === 'etude';

  const STATUT_LABELS = {
    'etude': 'En étude',
    'encours': 'En cours',
    'suspendu': 'Suspendu',
    'termine': 'Terminé',
    'livre': 'Livré'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-base-content/60">Chargement du projet...</p>
        </div>
      </div>
    );
  }

  if (error || !projet) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-error mx-auto mb-4" />
          <h3 className="text-lg font-medium">{error || 'Projet non trouvé'}</h3>
          <Link to="/projets" className="btn btn-primary mt-4">
            Retour à la liste
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[calc(100vh-88px)] flex flex-col bg-base-200">
      
      {/* ✅ Barre d'outils */}
      <div className="flex items-center justify-between flex-wrap gap-2 p-3 bg-base-100 border-b border-base-200 flex-shrink-0">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate(`/projets/${id}`)}
            className="btn btn-ghost btn-sm btn-square"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-bold">Aperçu PDF</h1>
              <p className="text-xs text-base-content/60">
                {projet.code} - {projet.nom}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <div className={`badge ${isOnline ? 'badge-success' : 'badge-error'} gap-1 px-2 py-2 text-xs`}>
            {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {isOnline ? 'En ligne' : 'Hors ligne'}
          </div>
          <span className={`badge ${isActif ? 'badge-success' : 'badge-error'} badge-sm`}>
            {STATUT_LABELS[projet.statut] || projet.statut}
          </span>
          
          <div className="divider divider-horizontal mx-0 h-6"></div>
          
          {/* ✅ BOUTON TÉLÉCHARGER */}
          <button
            onClick={handleDownload}
            className="btn btn-sm btn-success gap-1.5"
            disabled={!pdfBlobUrl || generating}
          >
            <Download className="w-4 h-4" />
            Télécharger
          </button>
          
          {/* ✅ BOUTON IMPRIMER */}
          <button
            onClick={handlePrint}
            className="btn btn-sm btn-primary gap-1.5"
            disabled={!pdfBlobUrl || generating}
          >
            <Printer className="w-4 h-4" />
            Imprimer
          </button>
          
          {/* ✅ BOUTON RÉGÉNÉRER */}
          <button
            onClick={handleRegenerate}
            className="btn btn-sm btn-ghost gap-1.5"
            disabled={generating}
          >
            {generating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
            {generating ? 'Génération...' : 'Régénérer'}
          </button>
        </div>
      </div>

      {/* ✅ APERÇU PDF */}
      <div className="flex-1 bg-base-200 p-2 overflow-hidden">
        {generating ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto mb-4" />
              <p className="text-base-content/60">Génération du PDF en cours...</p>
            </div>
          </div>
        ) : pdfBlobUrl ? (
          <iframe
            ref={iframeRef}
            src={pdfBlobUrl}
            className="w-full h-full rounded-lg shadow-lg border border-base-200 bg-white"
            title="Aperçu du projet"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <FileText className="w-16 h-16 text-base-content/20 mx-auto mb-4" />
              <p className="text-base-content/60">Aucun aperçu disponible</p>
              <button
                onClick={handleRegenerate}
                className="btn btn-primary btn-sm mt-4 gap-1.5"
              >
                <FileText className="w-4 h-4" />
                Générer le PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProjetPdf;