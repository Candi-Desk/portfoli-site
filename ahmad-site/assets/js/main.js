/* Ahmad Al Jabri — portfolio
   Motion and small behaviours.

   The page is complete without this file: every element is present and
   legible in the markup, and this only enhances it. Every effect below is
   switched off when the visitor has asked for reduced motion. */

(function () {
  "use strict";

  document.documentElement.classList.add("js");

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasIO = "IntersectionObserver" in window;
  var each = function (list, fn) { Array.prototype.forEach.call(list, fn); };

  /* ---- stagger indices -------------------------------------------------
     Any container marked [data-stagger] numbers its revealable children,
     so a grid arrives as a sequence rather than as a block.             */
  each(document.querySelectorAll("[data-stagger]"), function (group) {
    var i = 0;
    each(group.children, function (child) {
      var target = child.classList.contains("reveal") ? child : child.querySelector(".reveal");
      if (!target) return;
      target.style.setProperty("--i", i);
      i += 1;
    });
  });

  /* ---- scroll progress [Nielsen #1 — visibility of system status] ------ */
  var progress = document.querySelector(".progress");
  if (progress && !reduced) {
    var ticking = false;
    var paint = function () {
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      var ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      progress.style.transform = "scaleX(" + ratio + ")";
      ticking = false;
    };
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(paint);
    }, { passive: true });
    window.addEventListener("resize", paint, { passive: true });
    paint();
  }

  /* ---- sticky nav reveal (home page only; case pages use .nav--static) --- */
  var nav = document.querySelector(".nav:not(.nav--static)");
  if (nav) {
    var trigger = document.querySelector("[data-nav-trigger]");
    if (trigger && hasIO) {
      new IntersectionObserver(function (entries) {
        nav.classList.toggle("is-visible", !entries[0].isIntersecting);
      }, { rootMargin: "-80px 0px 0px 0px" }).observe(trigger);
    } else {
      nav.classList.add("is-visible");
    }
  }

  /* ---- active section in the nav --------------------------------------- */
  var navLinks = document.querySelectorAll(".nav-links a[href^='#']");
  if (navLinks.length && hasIO) {
    var linkFor = {};
    each(navLinks, function (link) { linkFor[link.getAttribute("href").slice(1)] = link; });

    var sections = [];
    Object.keys(linkFor).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) sections.push(el);
    });

    var setActive = function (id) {
      each(navLinks, function (link) {
        link.classList.toggle("is-active", link.getAttribute("href") === "#" + id);
      });
    };

    var visible = {};
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { visible[entry.target.id] = entry.isIntersecting; });
      for (var i = 0; i < sections.length; i += 1) {
        if (visible[sections[i].id]) { setActive(sections[i].id); return; }
      }
    }, { rootMargin: "-62px 0px -55% 0px" });

    sections.forEach(function (el) { sectionObserver.observe(el); });
  }

  /* ---- reveal on scroll -------------------------------------------------
     One observer drives three things: the reveal transition, the rule that
     draws across a section head, and the timeline rail.                  */
  var revealables = document.querySelectorAll(".reveal, .section-head, .timeline, .timeline li");
  if (!hasIO || reduced) {
    each(revealables, function (el) { el.classList.add("is-in"); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    each(revealables, function (el) { revealObserver.observe(el); });
  }

  /* ---- bar charts grow once in view ------------------------------------- */
  var bars = document.querySelectorAll(".bar .fill[data-w], .meter i[data-w]");
  var fillBar = function (el) { el.style.width = el.getAttribute("data-w"); };
  if (!hasIO || reduced) {
    each(bars, fillBar);
  } else {
    var barObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        setTimeout(function () { fillBar(el); }, Number(el.getAttribute("data-delay") || 0));
        obs.unobserve(el);
      });
    }, { threshold: 0.4 });
    each(bars, function (el) { barObserver.observe(el); });
  }

  /* ---- figures count up once in view -----------------------------------
     Markup carries the final value, so a visitor without JavaScript — or
     with reduced motion — reads the real number immediately.            */
  var counters = document.querySelectorAll("[data-count]");

  /* A counting figure must never show a number that could be mistaken for
     a different real figure, so the element owns its whole formatted value
     — separators included — rather than animating a digit group while a
     static ",000" sits beside it. */
  var isDe = document.documentElement.lang === "de";
  var group = function (text) {
    var parts = text.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, isDe ? "." : ",");
    return parts.join(isDe ? "," : ".");
  };

  var runCount = function (el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var decimals = Number(el.getAttribute("data-dec") || 0);
    var duration = Number(el.getAttribute("data-dur") || 900);
    var start = null;

    var step = function (now) {
      if (start === null) start = now;
      var t = Math.min(1, (now - start) / duration);
      var eased = 1 - Math.pow(1 - t, 3);          /* ease-out cubic */
      el.textContent = group((target * eased).toFixed(decimals));
      if (t < 1) window.requestAnimationFrame(step);
      else el.textContent = group(target.toFixed(decimals));
    };
    window.requestAnimationFrame(step);
  };

  if (hasIO && !reduced && window.requestAnimationFrame) {
    var countObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        setTimeout(function () { runCount(el); }, Number(el.getAttribute("data-delay") || 0));
        obs.unobserve(el);
      });
    }, { threshold: 0.6 });
    each(counters, function (el) { countObserver.observe(el); });
  }

  /* ---- copy buttons ------------------------------------------------------ */
  var copyText = isDe
    ? { idle: "Kopieren", done: "Kopiert", selected: "Markiert" }
    : { idle: "Copy", done: "Copied", selected: "Selected" };
  each(document.querySelectorAll("[data-copy]"), function (btn) {
    btn.addEventListener("click", function () {
      var value = btn.getAttribute("data-copy");
      var done = function () {
        btn.textContent = copyText.done;
        setTimeout(function () { btn.textContent = copyText.idle; }, 1500);
      };
      var selectInstead = function () {
        var target = document.getElementById(btn.getAttribute("data-copy-target"));
        if (!target) return;
        var range = document.createRange();
        range.selectNodeContents(target);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        btn.textContent = copyText.selected;
        setTimeout(function () { btn.textContent = copyText.idle; }, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).then(done).catch(selectInstead);
      } else {
        selectInstead();
      }
    });
  });

  /* ---- contact form -----------------------------------------------------
     No backend in this build: the site is presented, not published.
     The handler shows the confirmation state so the flow can be demonstrated.
     To make it live, point the form at a provider and remove preventDefault. */
  var form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var ok = document.getElementById("form-ok");
      if (ok) { ok.classList.add("is-shown"); }
      form.reset();
    });
  }
})();
