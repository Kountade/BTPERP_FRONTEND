// src/components/rh/ContratPdf.jsx
// Génération PDF d'un contrat de travail - Téléchargement et Impression

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  FileText, ChevronLeft, Download, Printer, Loader2,
  Wifi, WifiOff, AlertTriangle, Building2,
  UserCircle, Briefcase, Calendar, DollarSign,
  Clock, Coins, MapPin, Award, BadgeCheck,
  FileCheck, FileX, Eye
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
const generateContratPDF = async (contrat, employe, options = {}) => {
  if (!contrat || typeof contrat !== 'object') {
    throw new Error('Données du contrat invalides');
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

      // ========== DONNÉES CONTRAT ==========
      const reference = contrat.reference || `CTR-${String(contrat.id).padStart(6, '0')}`;
      const dateContrat = contrat.date_embauche || new Date().toISOString().split('T')[0];
      const dateFinContrat = contrat.date_fin_contrat || '';
      const situation = contrat.situation || 'cdi';
      const statut = contrat.statut || 'actif';
      
      const salaireBase = parseFloat(contrat.salaire_base) || 0;
      const tauxHoraire = parseFloat(contrat.taux_horaire) || 0;
      const primePanier = parseFloat(contrat.prime_panier) || 0;
      const indemniteKm = parseFloat(contrat.indemnite_km) || 0;
      const primeAnciennete = parseFloat(contrat.prime_anciennete) || 0;
      
      const totalRemuneration = salaireBase + primePanier + indemniteKm + primeAnciennete;

      const situationLabels = {
        'cdi': 'CDI (Contrat à Durée Indéterminée)',
        'cdd': 'CDD (Contrat à Durée Déterminée)',
        'interim': 'Intérim',
        'apprenti': 'Apprenti',
        'stagiaire': 'Stagiaire',
        'auto_entrepreneur': 'Auto-Entrepreneur'
      };
      const situationLabel = situationLabels[situation] || situation;

      const statutLabels = {
        'actif': 'Actif',
        'termine': 'Terminé',
        'resilie': 'Résilié',
        'suspendu': 'Suspendu'
      };
      const statutLabel = statutLabels[statut] || statut;

      // ========== DONNÉES EMPLOYÉ ==========
      const employeNom = employe?.nom || 'Employé';
      const employePrenom = employe?.prenom || '';
      const employeFullName = employePrenom ? `${employePrenom} ${employeNom}` : employeNom;
      const employeEmail = employe?.email || '';
      const employeTel = employe?.telephone || '';
      const employeAdr = employe?.adresse || '';
      const employeMatricule = employe?.matricule || '';
      const employePoste = employe?.poste_nom || employe?.poste || '';
      const employeService = employe?.service_nom || employe?.service || '';

      const salaireLettres = nombreEnLettres(salaireBase);

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
        doc.text('CONTRAT DE TRAVAIL', pageWidth - margins.right, y + 5.5, { align: 'right' });
        
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(84, 110, 122);
        doc.text(`N° ${reference}`, pageWidth - margins.right, y + 10.5, { align: 'right' });
        doc.text(`Émis le ${formatDate(new Date().toISOString())}`, pageWidth - margins.right, y + 14.5, { align: 'right' });

        y += 27;
        doc.setDrawColor(26, 35, 126);
        doc.setLineWidth(0.4);
        doc.line(margins.left, y, pageWidth - margins.right, y);
        y += 8;

        // ================================================================
        // GRILLE D'INFORMATIONS CONTRAT
        // ================================================================
        const gridY = y;
        doc.setFillColor(248, 249, 250);
        doc.roundedRect(margins.left, gridY, contentWidth, 18, 2, 2, 'F');
        doc.setDrawColor(224, 224, 224);
        doc.setLineWidth(0.5);
        doc.roundedRect(margins.left, gridY, contentWidth, 18, 2, 2, 'S');

        const colWidth = contentWidth / 5;
        const gridX1 = margins.left;
        const gridX2 = margins.left + colWidth;
        const gridX3 = margins.left + colWidth * 2;
        const gridX4 = margins.left + colWidth * 3;
        const gridX5 = margins.left + colWidth * 4;

        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(120, 144, 156);
        
        doc.text('DATE D\'EMBAUCHE', gridX1 + 4, gridY + 4.5);
        doc.text('SITUATION', gridX2 + 4, gridY + 4.5);
        doc.text('STATUT', gridX3 + 4, gridY + 4.5);
        doc.text('MATRICULE', gridX4 + 4, gridY + 4.5);
        doc.text('FIN CONTRAT', gridX5 + 4, gridY + 4.5);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(26, 35, 126);
        doc.text(formatDate(dateContrat), gridX1 + 4, gridY + 12);
        doc.text(situationLabel, gridX2 + 4, gridY + 12);
        
        const statutColor = statut === 'actif' ? [0, 150, 0] : [200, 0, 0];
        doc.setTextColor(statutColor[0], statutColor[1], statutColor[2]);
        doc.text(statutLabel, gridX3 + 4, gridY + 12);
        doc.setTextColor(26, 35, 126);
        
        doc.text(employeMatricule || 'N/A', gridX4 + 4, gridY + 12);
        doc.text(dateFinContrat ? formatDate(dateFinContrat) : 'Non spécifiée', gridX5 + 4, gridY + 12);

        y = gridY + 22;

        // ================================================================
        // INFORMATIONS EMPLOYÉ
        // ================================================================
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(26, 35, 126);
        doc.text('INFORMATIONS EMPLOYÉ', margins.left, y);
        y += 2;
        doc.setDrawColor(224, 224, 224);
        doc.setLineWidth(0.5);
        doc.line(margins.left, y, pageWidth - margins.right, y);
        y += 6;

        const employeY = y;
        doc.setFillColor(248, 249, 250);
        doc.roundedRect(margins.left, employeY, contentWidth, 30, 2, 2, 'F');
        doc.setDrawColor(224, 224, 224);
        doc.setLineWidth(0.5);
        doc.roundedRect(margins.left, employeY, contentWidth, 30, 2, 2, 'S');

        let empRowY = employeY + 4;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(84, 110, 122);
        doc.text('Nom complet', margins.left + 6, empRowY);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(26, 35, 126);
        doc.text(employeFullName, margins.left + 50, empRowY);

        empRowY += 6;
        if (employeEmail) {
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(84, 110, 122);
          doc.text('Email', margins.left + 6, empRowY);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(26, 35, 126);
          doc.text(employeEmail, margins.left + 50, empRowY);
          empRowY += 6;
        }
        if (employeTel) {
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(84, 110, 122);
          doc.text('Téléphone', margins.left + 6, empRowY);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(26, 35, 126);
          doc.text(employeTel, margins.left + 50, empRowY);
          empRowY += 6;
        }
        if (employeAdr) {
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(84, 110, 122);
          doc.text('Adresse', margins.left + 6, empRowY);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(26, 35, 126);
          const adrLines = doc.splitTextToSize(employeAdr, contentWidth - 56);
          doc.text(adrLines, margins.left + 50, empRowY);
          empRowY += 6 * Math.max(1, adrLines.length);
        }
        if (employePoste) {
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(84, 110, 122);
          doc.text('Poste', margins.left + 6, empRowY);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(26, 35, 126);
          doc.text(employePoste, margins.left + 50, empRowY);
          empRowY += 6;
        }
        if (employeService) {
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(84, 110, 122);
          doc.text('Service', margins.left + 6, empRowY);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(26, 35, 126);
          doc.text(employeService, margins.left + 50, empRowY);
          empRowY += 6;
        }

        y = employeY + 34;

        // ================================================================
        // TABLEAU DES ÉLÉMENTS CONTRACTUELS
        // ================================================================
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(26, 35, 126);
        doc.text('ÉLÉMENTS CONTRACTUELS', margins.left, y);
        y += 2;
        doc.setDrawColor(224, 224, 224);
        doc.setLineWidth(0.5);
        doc.line(margins.left, y, pageWidth - margins.right, y);
        y += 6;

        const colElemX = margins.left;
        const colMontantX = pageWidth - margins.right - 45;
        const colPeriodeX = pageWidth - margins.right;

        const headerY = y;
        doc.setFillColor(26, 35, 126);
        doc.roundedRect(colElemX, headerY, contentWidth, 7, 2, 2, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'bold');
        doc.text('Élément', colElemX + 3, headerY + 4.5);
        doc.text('Montant', colMontantX + 3, headerY + 4.5);
        doc.text('Périodicité', colPeriodeX - 3, headerY + 4.5, { align: 'right' });

        y = headerY + 7;
        let currentY = y;
        let rowIndex = 0;

        const elements = [
          { label: 'Salaire de base', montant: salaireBase, periode: 'Mensuel' },
          { label: 'Taux horaire', montant: tauxHoraire, periode: 'Horaire' },
        ];
        if (primePanier > 0) {
          elements.push({ label: 'Prime panier', montant: primePanier, periode: 'Mensuel' });
        }
        if (indemniteKm > 0) {
          elements.push({ label: 'Indemnité KM', montant: indemniteKm, periode: 'Mensuel' });
        }
        if (primeAnciennete > 0) {
          elements.push({ label: 'Prime ancienneté', montant: primeAnciennete, periode: 'Mensuel' });
        }

        for (let idx = 0; idx < elements.length; idx++) {
          const el = elements[idx];
          
          if (rowIndex % 2 === 0) {
            doc.setFillColor(248, 249, 250);
            doc.rect(colElemX, currentY - 0.5, contentWidth, 6.5, 'F');
          }

          doc.setDrawColor(224, 224, 224);
          doc.setLineWidth(0.1);
          doc.line(colElemX, currentY, colElemX, currentY + 6);
          doc.line(colMontantX, currentY, colMontantX, currentY + 6);
          doc.line(colPeriodeX, currentY, colPeriodeX, currentY + 6);

          doc.setTextColor(33, 33, 33);
          doc.setFontSize(8);
          doc.setFont('helvetica', 'normal');
          doc.text(el.label, colElemX + 3, currentY + 4);
          
          if (el.montant > 0) {
            doc.text(formatCurrency(el.montant), colMontantX + 3, currentY + 4);
          } else {
            doc.text('-', colMontantX + 3, currentY + 4);
          }
          doc.text(el.periode, colPeriodeX - 3, currentY + 4, { align: 'right' });

          currentY += 6.5;
          rowIndex++;
        }

        doc.setDrawColor(180, 180, 190);
        doc.setLineWidth(0.3);
        doc.line(colElemX, currentY, pageWidth - margins.right, currentY);
        y = currentY + 5;

        // ================================================================
        // TOTAUX
        // ================================================================
        let ay = y;

        const amountBoxWidth = 70;
        const amountBoxX = pageWidth - margins.right - amountBoxWidth;
        const amountBoxHeight = 12;

        doc.setFillColor(26, 35, 126);
        doc.roundedRect(amountBoxX - 7, ay - 2, amountBoxWidth + 8, amountBoxHeight, 2, 2, 'F');

        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text('TOTAL RÉMUNÉRATION', amountBoxX + 4, ay + 6);

        const totalFormatted = formatCurrency(totalRemuneration);
        doc.setFontSize(12);
        doc.setTextColor(255, 255, 255);
        let fontSizeTotal = 12;
        let textWidthTotal = doc.getTextWidth(totalFormatted);
        if (textWidthTotal > amountBoxWidth - 10) {
          fontSizeTotal = 10;
          doc.setFontSize(fontSizeTotal);
          if (doc.getTextWidth(totalFormatted) > amountBoxWidth - 10) {
            fontSizeTotal = 8;
            doc.setFontSize(fontSizeTotal);
          }
        }
        doc.text(totalFormatted, amountBoxX + amountBoxWidth, ay + 6, { align: 'right' });

        ay += amountBoxHeight + 4;

        // Salaire en toutes lettres
        const lettresBoxHeight = 14;
        doc.setFillColor(248, 249, 250);
        doc.roundedRect(margins.left, ay, contentWidth, lettresBoxHeight, 2, 2, 'F');
        doc.setDrawColor(224, 224, 224);
        doc.setLineWidth(0.5);
        doc.roundedRect(margins.left, ay, contentWidth, lettresBoxHeight, 2, 2, 'S');

        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(84, 110, 122);
        doc.text('Salaire de base en toutes lettres :', margins.left + 6, ay + 9);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(33, 33, 33);

        const lettresStartX = margins.left + 65;
        const lettresAvailableWidth = contentWidth - 70;

        let lettresFontSize = 8;
        doc.setFontSize(lettresFontSize);
        let lettresWidth = doc.getTextWidth(salaireLettres);

        while (lettresWidth > lettresAvailableWidth && lettresFontSize > 5) {
          lettresFontSize -= 0.5;
          doc.setFontSize(lettresFontSize);
          lettresWidth = doc.getTextWidth(salaireLettres);
        }

        if (lettresWidth > lettresAvailableWidth) {
          const splitLettres = doc.splitTextToSize(salaireLettres, lettresAvailableWidth);
          doc.text(splitLettres, lettresStartX, ay + 5);
        } else {
          doc.text(salaireLettres, lettresStartX, ay + 9);
        }

        ay += lettresBoxHeight + 6;
        y = ay;

        // ================================================================
        // CLAUSES PARTICULIÈRES
        // ================================================================
        const dateJour = new Date().toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });

        const clausesBoxHeight = 30;
        doc.setFillColor(255, 248, 230);
        doc.roundedRect(margins.left, y, contentWidth, clausesBoxHeight, 2, 2, 'F');
        doc.setDrawColor(255, 204, 128);
        doc.setLineWidth(0.5);
        doc.roundedRect(margins.left, y, contentWidth, clausesBoxHeight, 2, 2, 'S');
        
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(230, 81, 0);
        doc.text('Clauses particulières', margins.left + 6, y + 5);
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(66, 66, 66);
        doc.setFontSize(7.5);
        const clauses = [
          `Le présent contrat est conclu pour une durée ${situation === 'cdi' ? 'indéterminée' : 'déterminée'}.`,
          `L'employé est engagé à compter du ${formatDate(dateContrat)}.`,
          `Le salaire de base est fixé à ${formatCurrency(salaireBase)} (${salaireLettres}).`,
          `Le contrat est soumis à la législation du travail en vigueur au Sénégal.`,
          `Fait à Dakar, le ${dateJour}.`
        ];
        let clauseY = y + 12;
        for (const clause of clauses) {
          const splitClause = doc.splitTextToSize(clause, contentWidth - 12);
          doc.text(splitClause, margins.left + 6, clauseY);
          clauseY += 4 * splitClause.length;
        }

        y = y + clausesBoxHeight + 6;

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
        doc.text('Signature de l\'employé', signatureX1 + (signatureWidth / 2), signatureY, { align: 'center' });
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(120, 144, 156);
        doc.text('Nom et date', signatureX1 + (signatureWidth / 2), signatureY + 12, { align: 'center' });

        doc.line(signatureX2, signatureY + 5, signatureX2 + signatureWidth, signatureY + 5);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(84, 110, 122);
        doc.text('Signature de l\'employeur', signatureX2 + (signatureWidth / 2), signatureY, { align: 'center' });
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(120, 144, 156);
        doc.text(company.name, signatureX2 + (signatureWidth / 2), signatureY + 12, { align: 'center' });

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
        const watermarkText = options.watermark || 'CONTRAT DE TRAVAIL';
        const watermarkOptions = {
          fontSize: options.watermarkSize || 40,
          color: options.watermarkColor || [200, 200, 200],
          opacity: options.watermarkOpacity || 0.15,
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

        // Résoudre avec le blob PDF
        const pdfBlob = doc.output('blob');
        resolve(pdfBlob);

      }).catch(reject);

    } catch (error) {
      reject(error);
    }
  });
};

// ========== COMPOSANT PRINCIPAL ==========
function ContratPdf() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [contrat, setContrat] = useState(null);
  const [employe, setEmploye] = useState(null);
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

        // Charger le contrat
        const contratRes = await AxiosInstance.get(`/contrats/${id}/`, {
          headers: { Authorization: `Token ${token}` }
        });
        setContrat(contratRes.data);

        // Charger l'employé associé
        let employeData = null;
        if (contratRes.data.employe) {
          try {
            const employeRes = await AxiosInstance.get(`/employes/${contratRes.data.employe}/`, {
              headers: { Authorization: `Token ${token}` }
            });
            employeData = employeRes.data;
            setEmploye(employeData);
          } catch (empError) {
            console.error('❌ Erreur chargement employé:', empError);
          }
        }

        // Générer le PDF automatiquement
        await generatePDF(contratRes.data, employeData);

      } catch (error) {
        console.error('❌ Erreur chargement:', error);
        if (error.response?.status === 401) {
          navigate('/login');
        } else if (error.response?.status === 404) {
          setError('Contrat non trouvé');
        } else {
          setError('Erreur lors du chargement du contrat');
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
  const generatePDF = async (contratData, employeData) => {
    if (!contratData) return;
    
    setGenerating(true);
    try {
      const blob = await generateContratPDF(contratData, employeData, {
        watermark: 'CONTRAT DE TRAVAIL',
        watermarkSize: 40,
        watermarkColor: [200, 200, 200],
        watermarkOpacity: 0.15,
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
      const reference = contrat?.reference || `CTR-${String(contrat?.id || '').padStart(6, '0')}`;
      link.href = pdfBlobUrl;
      link.download = `Contrat_travail_${reference}.pdf`;
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
    await generatePDF(contrat, employe);
  };

  const isActif = contrat?.statut === 'actif';

  const SITUATION_LABELS = {
    'cdi': 'CDI',
    'cdd': 'CDD',
    'interim': 'Intérim',
    'apprenti': 'Apprenti',
    'stagiaire': 'Stagiaire',
    'auto_entrepreneur': 'Auto-Entrepreneur'
  };

  const STATUT_LABELS = {
    'actif': 'Actif',
    'termine': 'Terminé',
    'resilie': 'Résilié',
    'suspendu': 'Suspendu'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-base-content/60">Chargement du contrat...</p>
        </div>
      </div>
    );
  }

  if (error || !contrat) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-error mx-auto mb-4" />
          <h3 className="text-lg font-medium">{error || 'Contrat non trouvé'}</h3>
          <Link to="/contrats" className="btn btn-primary mt-4">
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
            onClick={() => navigate(`/contrats/${id}`)}
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
                Contrat de {contrat.employe_nom || 'Employé'}
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
            {STATUT_LABELS[contrat.statut] || contrat.statut}
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
            title="Aperçu du contrat"
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

export default ContratPdf;