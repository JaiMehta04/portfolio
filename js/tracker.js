/* ============================================
   TRACKER.JS — Visitor logging with Firebase
   
   Logs: IP, city, country, timestamp, page,
         user-agent, referrer, screen size
   
   Uses ipapi.co (free, no key needed for light use)
   and Firebase Realtime Database.
   ============================================ */

(function () {
  'use strict';

  // =============================================
  // >>> FIREBASE CONFIG — REPLACE WITH YOUR OWN
  // =============================================
const firebaseConfig = {
  apiKey: "AIzaSyBOrcb4oRfd_4h8aqCOy5odiHN25iS-UXI",
  authDomain: "portfolio-85d1a.firebaseapp.com",
  databaseURL: "https://portfolio-85d1a-default-rtdb.firebaseio.com",
  projectId: "portfolio-85d1a",
  storageBucket: "portfolio-85d1a.firebasestorage.app",
  messagingSenderId: "741390322021",
  appId: "1:741390322021:web:2e221aaf90eef712d8b98c",
  measurementId: "G-VPHBPKS3XN"
};

  // Only initialize if Firebase SDK is loaded and config is set
  if (typeof firebase === 'undefined' || firebaseConfig.apiKey === "YOUR_API_KEY") {
    console.info('[Tracker] Firebase not configured — visitor logging disabled.');
    return;
  }

  // Initialize Firebase (only if not already initialized)
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  var db = firebase.database();

  // Collect device & page info
  var visitData = {
    timestamp:   new Date().toISOString(),
    page:        window.location.pathname,
    referrer:    document.referrer || 'direct',
    userAgent:   navigator.userAgent,
    screenWidth: screen.width,
    screenHeight: screen.height,
    language:    navigator.language || ''
  };

  // Fetch location from ipapi.co (free tier: 1000 req/day)
  fetch('https://ipapi.co/json/')
    .then(function (res) { return res.json(); })
    .then(function (geo) {
      visitData.ip        = geo.ip || '';
      visitData.city      = geo.city || '';
      visitData.region    = geo.region || '';
      visitData.country   = geo.country_name || '';
      visitData.latitude  = geo.latitude || '';
      visitData.longitude = geo.longitude || '';
      visitData.org       = geo.org || '';
      visitData.timezone  = geo.timezone || '';
      pushVisit(visitData);
    })
    .catch(function () {
      // If geo fails, still log the visit without location
      pushVisit(visitData);
    });

  function pushVisit(data) {
    db.ref('visitors').push(data).catch(function (err) {
      console.warn('[Tracker] Could not log visit:', err.message);
    });
  }
})();
