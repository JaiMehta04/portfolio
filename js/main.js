/* ============================================
   MAIN.JS — Portfolio interactions
   ============================================ */

(function () {
  'use strict';

  // ---- Navbar scroll effect ----
  const navbar = document.getElementById('navbar');
  const backToTop = document.getElementById('backToTop');

  function handleScroll() {
    const scrolled = window.scrollY > 50;
    navbar.classList.toggle('scrolled', scrolled);
    backToTop.classList.toggle('visible', window.scrollY > 400);
  }
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // ---- Mobile nav toggle ----
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  navToggle.addEventListener('click', function () {
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('open');
  });

  // Close mobile nav on link click
  navLinks.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      navToggle.classList.remove('active');
      navLinks.classList.remove('open');
    });
  });

  // ---- Active nav link highlight ----
  const sections = document.querySelectorAll('.section, .hero');
  const navAnchors = document.querySelectorAll('.nav-links a');

  function highlightNav() {
    var current = '';
    sections.forEach(function (section) {
      var top = section.offsetTop - 120;
      if (window.scrollY >= top) {
        current = section.getAttribute('id');
      }
    });
    navAnchors.forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  }
  window.addEventListener('scroll', highlightNav, { passive: true });

  // ---- Back to top ----
  backToTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ---- Typing effect ----
  var typedEl = document.getElementById('typedText');
  var phrases = [
    'Data Science & ML Engineer',
    'Computer Vision Enthusiast',
    'NLP & Information Retrieval',
    'GATE Qualified Researcher',
    'ISRO Research Intern'
  ];
  var phraseIdx = 0;
  var charIdx = 0;
  var deleting = false;
  var typeSpeed = 80;

  function typeWriter() {
    var current = phrases[phraseIdx];
    if (deleting) {
      typedEl.textContent = current.substring(0, charIdx - 1);
      charIdx--;
      typeSpeed = 40;
    } else {
      typedEl.textContent = current.substring(0, charIdx + 1);
      charIdx++;
      typeSpeed = 80;
    }

    if (!deleting && charIdx === current.length) {
      typeSpeed = 2000; // pause at end
      deleting = true;
    } else if (deleting && charIdx === 0) {
      deleting = false;
      phraseIdx = (phraseIdx + 1) % phrases.length;
      typeSpeed = 400;
    }

    setTimeout(typeWriter, typeSpeed);
  }
  typeWriter();

  // ---- Scroll animations (IntersectionObserver) ----
  var animElements = document.querySelectorAll('[data-animate]');

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var delay = parseInt(entry.target.dataset.delay) || 0;
            setTimeout(function () {
              entry.target.classList.add('visible');
            }, delay);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    animElements.forEach(function (el) { observer.observe(el); });
  } else {
    // Fallback: show everything
    animElements.forEach(function (el) { el.classList.add('visible'); });
  }

  // ---- Counter animation ----
  var counters = document.querySelectorAll('[data-count]');
  var counterObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(function (el) { counterObserver.observe(el); });

  function animateCounter(el) {
    var target = parseFloat(el.dataset.count);
    var hasDecimal = el.dataset.count.indexOf('.') !== -1;
    var decimals = hasDecimal ? (el.dataset.count.split('.')[1] || '').length : 0;
    var duration = 1500;
    var startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      var current = eased * target;
      el.textContent = hasDecimal ? current.toFixed(decimals) : Math.floor(current);
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = hasDecimal ? target.toFixed(decimals) : target;
      }
    }
    requestAnimationFrame(step);
  }

  // ==================================================
  // NEURAL NETWORK CANVAS — animated forward-pass viz
  // ==================================================
  var neuralCanvas = document.getElementById('neuralCanvas');
  var mouse = { x: null, y: null };

  if (neuralCanvas) {
    var nCtx = neuralCanvas.getContext('2d');
    var layers = [4, 6, 8, 6, 3]; // Input → Hidden → Output
    var layerLabels = ['Input', 'Conv', 'Dense', 'ReLU', 'Output'];
    var neurons = [];
    var pulses = [];
    var nTime = 0;

    function resizeNeural() {
      neuralCanvas.width = neuralCanvas.parentElement.offsetWidth;
      neuralCanvas.height = neuralCanvas.parentElement.offsetHeight;
      buildNetwork();
    }

    function buildNetwork() {
      neurons = [];
      var w = neuralCanvas.width;
      var h = neuralCanvas.height;
      // Place network on the right 55% of canvas
      var startX = w * 0.45;
      var endX = w * 0.95;
      var layerSpacing = (endX - startX) / (layers.length - 1);

      for (var l = 0; l < layers.length; l++) {
        var count = layers[l];
        var x = startX + l * layerSpacing;
        var layerH = Math.min(h * 0.6, count * 50);
        var startY = (h - layerH) / 2;
        var nodeSpacing = layerH / (count - 1 || 1);
        for (var n = 0; n < count; n++) {
          neurons.push({
            x: x,
            y: count === 1 ? h / 2 : startY + n * nodeSpacing,
            layer: l,
            index: n,
            radius: 5,
            glow: 0,
            baseGlow: 0
          });
        }
      }
    }

    function spawnPulse() {
      // Pick random connection
      var fromLayer = Math.floor(Math.random() * (layers.length - 1));
      var fromNeurons = neurons.filter(function(n) { return n.layer === fromLayer; });
      var toNeurons = neurons.filter(function(n) { return n.layer === fromLayer + 1; });
      var from = fromNeurons[Math.floor(Math.random() * fromNeurons.length)];
      var to = toNeurons[Math.floor(Math.random() * toNeurons.length)];
      if (from && to) {
        pulses.push({
          fromX: from.x, fromY: from.y,
          toX: to.x, toY: to.y,
          progress: 0,
          speed: 0.008 + Math.random() * 0.012,
          color: Math.random() > 0.5 ? '59, 185, 252' : '110, 231, 183',
          fromNeuron: from,
          toNeuron: to
        });
      }
    }

    function drawNeural() {
      nCtx.clearRect(0, 0, neuralCanvas.width, neuralCanvas.height);
      nTime += 0.01;
      var w = neuralCanvas.width;
      var h = neuralCanvas.height;

      // Draw connections (synapses)
      for (var l = 0; l < layers.length - 1; l++) {
        var fromNs = neurons.filter(function(n) { return n.layer === l; });
        var toNs = neurons.filter(function(n) { return n.layer === l + 1; });
        for (var fi = 0; fi < fromNs.length; fi++) {
          for (var ti = 0; ti < toNs.length; ti++) {
            var f = fromNs[fi], t = toNs[ti];
            nCtx.beginPath();
            nCtx.moveTo(f.x, f.y);
            // Bezier curve for organic look
            var cx = (f.x + t.x) / 2;
            nCtx.quadraticCurveTo(cx, f.y, t.x, t.y);
            nCtx.strokeStyle = 'rgba(59, 185, 252, 0.06)';
            nCtx.lineWidth = 0.8;
            nCtx.stroke();
          }
        }
      }

      // Draw pulses
      for (var pi = pulses.length - 1; pi >= 0; pi--) {
        var p = pulses[pi];
        p.progress += p.speed;
        if (p.progress >= 1) {
          p.toNeuron.glow = 1;
          pulses.splice(pi, 1);
          continue;
        }
        var t = p.progress;
        var cx = (p.fromX + p.toX) / 2;
        // Quadratic bezier point
        var px = (1-t)*(1-t)*p.fromX + 2*(1-t)*t*cx + t*t*p.toX;
        var py = (1-t)*(1-t)*p.fromY + 2*(1-t)*t*p.fromY + t*t*p.toY;

        nCtx.beginPath();
        nCtx.arc(px, py, 3, 0, Math.PI * 2);
        nCtx.fillStyle = 'rgba(' + p.color + ', 0.9)';
        nCtx.fill();

        // Glow trail
        nCtx.beginPath();
        nCtx.arc(px, py, 10, 0, Math.PI * 2);
        var trailGrad = nCtx.createRadialGradient(px, py, 0, px, py, 10);
        trailGrad.addColorStop(0, 'rgba(' + p.color + ', 0.3)');
        trailGrad.addColorStop(1, 'rgba(' + p.color + ', 0)');
        nCtx.fillStyle = trailGrad;
        nCtx.fill();
      }

      // Draw neurons
      for (var ni = 0; ni < neurons.length; ni++) {
        var neuron = neurons[ni];
        neuron.glow *= 0.96; // fade glow

        // Hover glow from mouse
        if (mouse.x !== null) {
          var mdx = mouse.x - neuron.x;
          var mdy = mouse.y - neuron.y;
          var mDist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mDist < 120) {
            neuron.glow = Math.max(neuron.glow, (120 - mDist) / 120 * 0.8);
          }
        }

        var breathe = Math.sin(nTime * 2 + ni * 0.5) * 0.15 + 0.85;
        var r = neuron.radius * breathe;
        var glowAlpha = 0.3 + neuron.glow * 0.7;

        // Outer glow
        if (neuron.glow > 0.05) {
          nCtx.beginPath();
          nCtx.arc(neuron.x, neuron.y, r + 15 * neuron.glow, 0, Math.PI * 2);
          var grd = nCtx.createRadialGradient(neuron.x, neuron.y, r, neuron.x, neuron.y, r + 15 * neuron.glow);
          grd.addColorStop(0, 'rgba(59, 185, 252, ' + (neuron.glow * 0.3) + ')');
          grd.addColorStop(1, 'rgba(59, 185, 252, 0)');
          nCtx.fillStyle = grd;
          nCtx.fill();
        }

        // Neuron body
        nCtx.beginPath();
        nCtx.arc(neuron.x, neuron.y, r, 0, Math.PI * 2);
        nCtx.fillStyle = 'rgba(59, 185, 252, ' + glowAlpha + ')';
        nCtx.fill();

        // White center
        nCtx.beginPath();
        nCtx.arc(neuron.x, neuron.y, r * 0.4, 0, Math.PI * 2);
        nCtx.fillStyle = 'rgba(255, 255, 255, ' + (0.3 + neuron.glow * 0.5) + ')';
        nCtx.fill();
      }

      // Layer labels
      nCtx.font = '600 11px Inter, sans-serif';
      nCtx.textAlign = 'center';
      var drawnLayers = [];
      for (var li = 0; li < layers.length; li++) {
        var layerNeurons = neurons.filter(function(n) { return n.layer === li; });
        if (layerNeurons.length) {
          var lx = layerNeurons[0].x;
          if (drawnLayers.indexOf(li) === -1) {
            var label = layerLabels[li] || 'Layer ' + li;
            nCtx.fillStyle = 'rgba(159, 179, 200, 0.4)';
            nCtx.fillText(label, lx, h * 0.9);
            drawnLayers.push(li);
          }
        }
      }

      // Spawn pulses periodically
      if (Math.random() < 0.08) spawnPulse();

      requestAnimationFrame(drawNeural);
    }

    resizeNeural();
    window.addEventListener('resize', resizeNeural);
    drawNeural();

    // Mouse interaction for neural canvas
    neuralCanvas.parentElement.addEventListener('mousemove', function(e) {
      var rect = neuralCanvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    }, { passive: true });
    neuralCanvas.parentElement.addEventListener('mouseleave', function() {
      mouse.x = null;
      mouse.y = null;
    });
  }

  // ==================================================
  // DATA RAIN CANVAS — falling hex/binary characters
  // ==================================================
  var rainCanvas = document.getElementById('dataRainCanvas');
  if (rainCanvas) {
    var rCtx = rainCanvas.getContext('2d');
    var columns = [];
    var chars = '01εδσμΣΠ∂∫∇λ'.split('');

    function resizeRain() {
      rainCanvas.width = rainCanvas.parentElement.offsetWidth;
      rainCanvas.height = rainCanvas.parentElement.offsetHeight;
      var colW = 20;
      var numCols = Math.floor(rainCanvas.width / colW);
      columns = [];
      for (var c = 0; c < numCols; c++) {
        columns.push({
          x: c * colW,
          y: Math.random() * -rainCanvas.height,
          speed: 0.5 + Math.random() * 1.5,
          chars: []
        });
        // Pre-fill random chars
        var len = 5 + Math.floor(Math.random() * 15);
        for (var ci = 0; ci < len; ci++) {
          columns[c].chars.push(chars[Math.floor(Math.random() * chars.length)]);
        }
      }
    }

    function drawRain() {
      rCtx.clearRect(0, 0, rainCanvas.width, rainCanvas.height);
      rCtx.font = '12px monospace';

      for (var c = 0; c < columns.length; c++) {
        var col = columns[c];
        col.y += col.speed;
        if (col.y > rainCanvas.height + col.chars.length * 16) {
          col.y = -col.chars.length * 16;
          col.speed = 0.5 + Math.random() * 1.5;
        }

        for (var ci = 0; ci < col.chars.length; ci++) {
          var cy = col.y + ci * 16;
          if (cy < 0 || cy > rainCanvas.height) continue;
          var alpha = ci === col.chars.length - 1 ? 0.8 : (0.1 + (ci / col.chars.length) * 0.3);
          var color = ci === col.chars.length - 1 ? '110, 231, 183' : '59, 185, 252';
          rCtx.fillStyle = 'rgba(' + color + ', ' + alpha + ')';
          rCtx.fillText(col.chars[ci], col.x, cy);

          // Randomly mutate chars
          if (Math.random() < 0.005) {
            col.chars[ci] = chars[Math.floor(Math.random() * chars.length)];
          }
        }
      }
      requestAnimationFrame(drawRain);
    }

    resizeRain();
    window.addEventListener('resize', resizeRain);
    drawRain();
  }

  // ==================================================
  // TRAINING TERMINAL SIMULATOR
  // ==================================================
  var termBody = document.getElementById('terminalBody');
  if (termBody) {
    var epoch = 0;
    var maxEpochs = 50;
    var loss = 2.45;
    var acc = 0.12;
    var valAcc = 0.10;

    function addTermLine(html, delay) {
      setTimeout(function() {
        var line = document.createElement('div');
        line.className = 'terminal-line';
        line.innerHTML = html;
        termBody.appendChild(line);
        // Keep scrolled to bottom
        termBody.scrollTop = termBody.scrollHeight;
        // Remove old lines to avoid overflow
        while (termBody.children.length > 12) {
          termBody.removeChild(termBody.firstChild);
        }
      }, delay || 0);
    }

    function simulateTraining() {
      if (epoch >= maxEpochs) {
        addTermLine('<span class="t-done">✓ Training complete! Accuracy: ' + acc.toFixed(4) + '</span>');
        setTimeout(function() {
          // Reset and start over
          epoch = 0; loss = 2.45; acc = 0.12; valAcc = 0.10;
          addTermLine('<span class="t-prompt">$</span> <span class="t-cmd">python train.py --model transformer</span>');
          setTimeout(simulateTraining, 2000);
        }, 5000);
        return;
      }

      epoch++;
      // Simulate realistic curves
      loss = Math.max(0.02, loss * (0.92 + Math.random() * 0.06));
      acc = Math.min(0.99, acc + (1 - acc) * (0.04 + Math.random() * 0.03));
      valAcc = Math.min(0.98, valAcc + (1 - valAcc) * (0.03 + Math.random() * 0.025));

      var bar = '';
      var filled = Math.floor((epoch / maxEpochs) * 20);
      for (var b = 0; b < 20; b++) bar += b < filled ? '█' : '░';

      addTermLine(
        '<span class="t-epoch">Epoch ' + epoch + '/' + maxEpochs + '</span> ' +
        '<span style="color:#5f7489">' + bar + '</span> ' +
        '<span class="t-loss">loss: ' + loss.toFixed(4) + '</span> ' +
        '<span class="t-acc">acc: ' + acc.toFixed(4) + '</span> ' +
        '<span class="t-val">val: ' + valAcc.toFixed(4) + '</span>'
      );

      setTimeout(simulateTraining, 600 + Math.random() * 400);
    }

    // Start after initial delay
    setTimeout(simulateTraining, 3000);
  }

  // ---- Contact form (EmailJS) ----
  // Sign up at https://www.emailjs.com/ and fill in these three values:
  var EMAILJS_PUBLIC_KEY = 'ib2MiozYTQ_iJf5k4';   // Account > API Keys > Public Key
  var EMAILJS_SERVICE_ID = 'service_sdbonkp';   // Email Services > Service ID
  var EMAILJS_TEMPLATE_ID = 'template_l5i53xm';  // Email Templates > Template ID

  if (EMAILJS_PUBLIC_KEY) {
    emailjs.init(EMAILJS_PUBLIC_KEY);
  }

  var form = document.getElementById('contactForm');
  var status = document.getElementById('formStatus');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      if (!EMAILJS_PUBLIC_KEY) {
        status.textContent = 'Contact form is not configured yet.';
        status.className = 'form-status error';
        return;
      }

      var btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.querySelector('span').textContent = 'Sending...';
      status.textContent = '';
      status.className = 'form-status';

      emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, form)
        .then(function () {
          status.textContent = 'Message sent! Thank you for reaching out.';
          status.className = 'form-status success';
          form.reset();
          setTimeout(function () {
            status.textContent = '';
            status.className = 'form-status';
          }, 5000);
        })
        .catch(function (err) {
          status.textContent = 'Oops — something went wrong. Please email me directly.';
          status.className = 'form-status error';
          console.error('EmailJS error:', err);
        })
        .finally(function () {
          btn.disabled = false;
          btn.querySelector('span').textContent = 'Send Message';
        });
    });
  }

  // ---- Card glow follow cursor ----
  var glowCards = document.querySelectorAll('.project-card, .skill-category, .timeline-content');
  glowCards.forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var rect = card.getBoundingClientRect();
      card.style.setProperty('--mouse-x', (e.clientX - rect.left) + 'px');
      card.style.setProperty('--mouse-y', (e.clientY - rect.top) + 'px');
    });
  });

  // ---- Subtle tilt effect on project cards ----
  var tiltCards = document.querySelectorAll('.project-card');
  tiltCards.forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var rect = card.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width - 0.5;
      var y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = 'translateY(-8px) perspective(800px) rotateY(' + (x * 6) + 'deg) rotateX(' + (-y * 6) + 'deg)';
    });
    card.addEventListener('mouseleave', function () {
      card.style.transform = '';
    });
  });

  // ---- Parallax on hero background blobs ----
  var hero = document.querySelector('.hero');
  if (hero) {
    window.addEventListener('mousemove', function (e) {
      var x = (e.clientX / window.innerWidth - 0.5) * 20;
      var y = (e.clientY / window.innerHeight - 0.5) * 20;
      document.body.style.setProperty('--parallax-x', x + 'px');
      document.body.style.setProperty('--parallax-y', y + 'px');
    }, { passive: true });
  }

  // ---- Video thumbnail hover-to-play ----
  var videoThumbs = document.querySelectorAll('.project-video-thumb');
  videoThumbs.forEach(function (thumb) {
    var video = thumb.querySelector('video');
    if (video) {
      thumb.addEventListener('mouseenter', function () {
        video.currentTime = 0;
        video.play().catch(function () {});
      });
      thumb.addEventListener('mouseleave', function () {
        video.pause();
      });
    }
  });

  // ---- Smooth section reveal with stagger ----
  var sectionTitles = document.querySelectorAll('.section-title');
  if ('IntersectionObserver' in window) {
    var titleObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          titleObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    sectionTitles.forEach(function (el) { titleObs.observe(el); });
  }
})();
