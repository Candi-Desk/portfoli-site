/* Consent for Google Analytics 4.
   Nothing is loaded and no cookie is set until the visitor accepts.
   Accept and Decline are the same size and weight, so neither choice is steered.
   While GA_ID is still the placeholder, no banner is shown and nothing loads. */
(function () {
  "use strict";
  var GA_ID = "G-EVMLX4ZCV5";           /* replace with your GA4 Measurement ID */
  var KEY = "analytics-consent";
  /* Banner wording follows the page language; Accept and Decline stay equal in size and weight. */
  var TXT = document.documentElement.lang === "de" ? {
    title: "Analyse-Cookies",
    body: "Ich möchte Besuche mit Google Analytics zählen, um zu sehen, welche Seiten nützlich sind. " +
          "Es läuft nur, wenn Sie zustimmen. Sie können Ihre Auswahl jederzeit unter „Cookie-Einstellungen“ im Fußbereich ändern.",
    privacy: "Datenschutzerklärung", decline: "Ablehnen", accept: "Akzeptieren",
    inactive: "Analyse ist auf dieser Website nicht aktiv, daher gibt es nichts einzustellen."
  } : {
    title: "Analytics cookies",
    body: "I would like to count visits with Google Analytics to see which pages are useful. " +
          "It only runs if you accept. You can change your choice any time under “Cookie settings” in the footer.",
    privacy: "Privacy notice", decline: "Decline", accept: "Accept",
    inactive: "Analytics is not active on this site, so there is nothing to set."
  };
  var configured = /^G-[A-Z0-9]{6,}$/.test(GA_ID) && GA_ID !== "G-XXXXXXXXXX";

  function read() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function write(v) { try { localStorage.setItem(KEY, v); } catch (e) { /* choice just won't persist */ } }

  function loadGA() {
    if (window.__gaLoaded) return;
    window.__gaLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("consent", "default", { analytics_storage: "granted", ad_storage: "denied",
      ad_user_data: "denied", ad_personalization: "denied" });
    window.gtag("js", new Date());
    window.gtag("config", GA_ID, { allow_google_signals: false });
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA_ID);
    document.head.appendChild(s);
  }

  function clearGA() {
    /* Remove GA cookies on this domain if a visitor withdraws consent. */
    document.cookie.split(";").forEach(function (c) {
      var n = c.split("=")[0].trim();
      if (n === "_ga" || n.indexOf("_ga_") === 0) {
        document.cookie = n + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
      }
    });
  }

  var banner;
  function build() {
    banner = document.createElement("div");
    banner.className = "consent";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-labelledby", "consent-title");
    banner.hidden = true;
    banner.innerHTML =
      '<h2 id="consent-title">' + TXT.title + '</h2>' +
      '<p>' + TXT.body + ' <a href="datenschutz.html">' + TXT.privacy + '</a></p>' +
      '<div class="row"><button type="button" data-choice="denied">' + TXT.decline + '</button>' +
      '<button type="button" data-choice="granted">' + TXT.accept + '</button></div>';
    banner.addEventListener("click", function (e) {
      var c = e.target && e.target.getAttribute && e.target.getAttribute("data-choice");
      if (!c) return;
      write(c);
      banner.hidden = true;
      if (c === "granted") loadGA(); else clearGA();
    });
    document.body.appendChild(banner);
  }

  function show() { if (!banner) build(); banner.hidden = false; var b = banner.querySelector("button"); if (b) b.focus(); }

  var saved = read();
  if (configured && saved === "granted") loadGA();
  if (configured && !saved) { build(); banner.hidden = false; }

  document.addEventListener("click", function (e) {
    var t = e.target && e.target.closest && e.target.closest("[data-cookie-settings]");
    if (!t) return;
    e.preventDefault();
    if (!configured) { alert(TXT.inactive); return; }
    show();
  });
})();
