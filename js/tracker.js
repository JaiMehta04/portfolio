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

  // Parse device details from user agent
  function parseUA(ua) {
    var browser = 'Unknown', os = 'Unknown', device = 'Desktop';
    // Browser
    if (/Edg\//i.test(ua)) browser = 'Edge';
    else if (/OPR|Opera/i.test(ua)) browser = 'Opera';
    else if (/Chrome/i.test(ua)) browser = 'Chrome';
    else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';
    else if (/Firefox/i.test(ua)) browser = 'Firefox';
    else if (/MSIE|Trident/i.test(ua)) browser = 'IE';
    // OS
    if (/Windows/i.test(ua)) os = 'Windows';
    else if (/Mac OS/i.test(ua)) os = 'macOS';
    else if (/Android/i.test(ua)) os = 'Android';
    else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
    else if (/Linux/i.test(ua)) os = 'Linux';
    // Device type
    if (/Mobile|Android.*Mobile|iPhone/i.test(ua)) device = 'Mobile';
    else if (/iPad|Android(?!.*Mobile)|Tablet/i.test(ua)) device = 'Tablet';
    return { browser: browser, os: os, device: device };
  }

  // Detect device model name
  function getDeviceModel(ua) {
    // Android — extract model from "Build/..." or "; MODEL Build"
    var androidMatch = ua.match(/;\s*([^;)]+?)\s*(?:Build|MIUI)/);
    if (androidMatch) return androidMatch[1].trim();

    // iPad
    if (/iPad/i.test(ua)) {
      return guessIPadModel();
    }

    // iPhone — map by screen dimensions + devicePixelRatio
    if (/iPhone/i.test(ua)) {
      return guessIPhoneModel();
    }

    // Mac
    if (/Macintosh/i.test(ua)) return 'Mac';

    // Windows — try to extract version
    var winMatch = ua.match(/Windows NT (\d+\.\d+)/);
    if (winMatch) {
      var winVer = { '10.0': '10/11', '6.3': '8.1', '6.2': '8', '6.1': '7' };
      return 'Windows ' + (winVer[winMatch[1]] || winMatch[1]);
    }

    return '';
  }

  function guessIPhoneModel() {
    var w = screen.width, h = screen.height, r = window.devicePixelRatio || 1;
    // Use the smaller dimension as width (portrait)
    var sw = Math.min(w, h), sh = Math.max(w, h);

    // Mapping based on logical resolution + pixel ratio
    if (sw === 430 && sh === 932 && r === 3) return 'iPhone 15 Pro Max / 16 Plus';
    if (sw === 393 && sh === 852 && r === 3) return 'iPhone 15 Pro / 15 / 16';
    if (sw === 428 && sh === 926 && r === 3) return 'iPhone 14 Plus / 13 Pro Max';
    if (sw === 390 && sh === 844 && r === 3) return 'iPhone 14 / 13 / 13 Pro / 12';
    if (sw === 375 && sh === 812 && r === 3) return 'iPhone 13 Mini / 12 Mini / X / XS';
    if (sw === 414 && sh === 896 && r === 3) return 'iPhone 11 Pro Max / XS Max';
    if (sw === 414 && sh === 896 && r === 2) return 'iPhone 11 / XR';
    if (sw === 414 && sh === 736 && r === 3) return 'iPhone 8 Plus / 7 Plus / 6s Plus';
    if (sw === 375 && sh === 667 && r === 2) return 'iPhone SE / 8 / 7 / 6s';
    if (sw === 320 && sh === 568 && r === 2) return 'iPhone SE (1st) / 5s';
    return 'iPhone';
  }

  function guessIPadModel() {
    var w = Math.min(screen.width, screen.height);
    if (w >= 1024) return 'iPad Pro 12.9"';
    if (w >= 834) return 'iPad Pro 11" / Air';
    if (w >= 810) return 'iPad 10th Gen';
    if (w >= 768) return 'iPad / iPad Mini';
    return 'iPad';
  }

  var uaInfo = parseUA(navigator.userAgent);
  var deviceModel = getDeviceModel(navigator.userAgent);

  // Collect device & page info
  var visitData = {
    timestamp:   new Date().toISOString(),
    page:        window.location.pathname,
    referrer:    document.referrer || 'direct',
    userAgent:   navigator.userAgent,
    browser:     uaInfo.browser,
    os:          uaInfo.os,
    deviceType:  uaInfo.device,
    deviceModel: deviceModel,
    screenWidth: screen.width,
    screenHeight: screen.height,
    language:    navigator.language || ''
  };

  // Fetch location — try ipinfo.io first (more precise), fallback to ipapi.co
  function fetchFromIpinfo() {
    return fetch('https://ipinfo.io/json')
      .then(function (res) { return res.json(); })
      .then(function (geo) {
        var loc = (geo.loc || '').split(',');
        visitData.ip        = geo.ip || '';
        visitData.city      = geo.city || '';
        visitData.region    = geo.region || '';
        visitData.country   = geo.country || '';
        visitData.latitude  = loc[0] || '';
        visitData.longitude = loc[1] || '';
        visitData.org       = geo.org || '';
        visitData.timezone  = geo.timezone || '';
        visitData.postal    = geo.postal || '';
        visitData.geoSource = 'ipinfo';
      });
  }

  function fetchFromIpapi() {
    return fetch('https://ipapi.co/json/')
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
        visitData.postal    = geo.postal || '';
        visitData.geoSource = 'ipapi';
      });
  }

  fetchFromIpinfo()
    .catch(function () { return fetchFromIpapi(); })
    .catch(function () { /* both failed, log without geo */ })
    .then(function () { pushVisit(visitData); });

  function pushVisit(data) {
    db.ref('visitors').push(data).catch(function (err) {
      console.warn('[Tracker] Could not log visit:', err.message);
    });
  }
})();
