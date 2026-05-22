function initCluster(scenarioRunner) {
  document.addEventListener('DOMContentLoaded', function() {
    var cluster = document.getElementById('cluster');
    var svgEl = document.getElementById('svg-layer');
    var cRect = cluster.getBoundingClientRect();
    var w = cluster.offsetWidth, h = cluster.offsetHeight;
    svgEl.style.width = w + 'px';
    svgEl.style.height = h + 'px';
    svgEl.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    var NS = 'http://www.w3.org/2000/svg';

    function pos(el, edge) {
      var r = el.getBoundingClientRect(), ox = r.left - cRect.left, oy = r.top - cRect.top;
      switch (edge) {
        case 'right':  return { x: ox + r.width, y: oy + r.height / 2 };
        case 'left':   return { x: ox, y: oy + r.height / 2 };
        case 'top':    return { x: ox + r.width / 2, y: oy };
        case 'bottom': return { x: ox + r.width / 2, y: oy + r.height };
        default:       return { x: ox + r.width / 2, y: oy + r.height / 2 };
      }
    }

    function drawLine(x1, y1, x2, y2, opts) {
      opts = opts || {};
      var el = document.createElementNS(NS, 'line');
      el.setAttribute('x1', x1); el.setAttribute('y1', y1);
      el.setAttribute('x2', x2); el.setAttribute('y2', y2);
      el.setAttribute('stroke', opts.stroke || '#c0392b');
      el.setAttribute('stroke-width', opts.width || '1.5');
      if (opts.dash) el.setAttribute('stroke-dasharray', opts.dash);
      if (opts.marker) el.setAttribute('marker-end', 'url(#' + opts.marker + ')');
      svgEl.appendChild(el);
      return el;
    }

    var wn1 = document.getElementById('el-wn1');
    var wn2 = document.getElementById('el-wn2');
    var pod3Slot = document.getElementById('el-pod3-slot');
    var pod3Orig = document.getElementById('el-pod3');
    var pod4 = document.getElementById('el-pod4');
    var apiserver = document.getElementById('el-apiserver');
    var controller = document.getElementById('el-controller');
    var krkn = document.getElementById('el-krkn');
    var usersBlock = document.getElementById('el-users');
    var etcd = document.getElementById('el-etcd');
    var scheduler = document.getElementById('el-scheduler');
    var serviceEl = document.getElementById('el-service');
    var flowConns = document.querySelectorAll('.flow-connector');

    var phaseNumEl = document.getElementById('phase-num');
    var phaseTitleEl = document.getElementById('phase-title');
    var phaseSubEl = document.getElementById('phase-subtitle');
    var eventListEl = document.getElementById('el-event-list');
    var sloAvailEl = document.getElementById('slo-avail');
    var sloLatencyEl = document.getElementById('slo-latency');
    var sloErrorEl = document.getElementById('slo-error');

    var serviceB = pos(serviceEl, 'bottom');
    var serviceC = pos(serviceEl, 'center');
    var wn1T = pos(wn1, 'top');
    var wn2T = pos(wn2, 'top');
    var wn1B = pos(wn1, 'bottom');
    var wn2B = pos(wn2, 'bottom');
    var cpT = pos(document.getElementById('el-cp'), 'top');
    var usersR = pos(usersBlock, 'right');
    var ingressC = pos(document.getElementById('el-ingress'), 'center');
    var pod1T = pos(document.getElementById('el-pod1'), 'top');
    var pod3T = pos(pod3Orig, 'top');
    var krknL = pos(krkn, 'left');
    var krknC = pos(krkn, 'center');
    var apiR = pos(apiserver, 'right');
    var apiC = pos(apiserver, 'center');

    var trafficLineWN1 = drawLine(serviceC.x, serviceB.y, wn1T.x, wn1T.y, { marker: 'arr-r' });
    var trafficLineWN2 = drawLine(serviceC.x, serviceB.y, wn2T.x, wn2T.y, { marker: 'arr-r' });
    drawLine(wn1B.x, wn1B.y, cpT.x - 160, cpT.y, { stroke: '#a8d4f0', width: '1', dash: '8 5' });
    drawLine(wn2B.x, wn2B.y, cpT.x + 160, cpT.y, { stroke: '#a8d4f0', width: '1', dash: '8 5' });

    var pathA = 'M ' + usersR.x + ',' + usersR.y + ' L ' + ingressC.x + ',' + ingressC.y + ' L ' + serviceC.x + ',' + serviceC.y + ' L ' + serviceC.x + ',' + serviceB.y + ' L ' + wn1T.x + ',' + wn1T.y + ' L ' + pod1T.x + ',' + pod1T.y;
    var pathB = 'M ' + usersR.x + ',' + usersR.y + ' L ' + ingressC.x + ',' + ingressC.y + ' L ' + serviceC.x + ',' + serviceC.y + ' L ' + serviceC.x + ',' + serviceB.y + ' L ' + wn2T.x + ',' + wn2T.y + ' L ' + pod3T.x + ',' + pod3T.y;
    var chaosPathD = 'M ' + krknL.x + ',' + krknC.y + ' L ' + (apiR.x + 6) + ',' + apiC.y;

    function spawnDot(cls, pathD, delay, dur) {
      var dot = document.createElement('div');
      dot.className = cls;
      dot.style.setProperty('--path', "path('" + pathD + "')");
      dot.style.setProperty('--dur', dur + 's');
      dot.style.setProperty('--delay', delay + 's');
      cluster.appendChild(dot);
      return dot;
    }

    var dur = 5;
    var pathADots = [];
    var pathBDots = [];
    for (var i = 0; i < 3; i++) {
      pathADots.push(spawnDot('traffic-dot', pathA, i * (dur / 3), dur));
      pathBDots.push(spawnDot('traffic-dot', pathB, i * (dur / 3) + 0.6, dur));
    }

    var CTR_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="#c0392b" stroke-width="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>';
    var POD_SVG_BLUE = '<svg viewBox="0 0 24 24" fill="none" stroke="#2980b9" stroke-width="2"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="8"/></svg>';
    var POD_SVG_GREEN = '<svg viewBox="0 0 24 24" fill="none" stroke="#1e8449" stroke-width="2"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="8"/></svg>';

    function wait(ms) { return new Promise(function(r) { setTimeout(r, ms); }); }

    // ── Phase counter ──
    function setPhase(num, title, subtitle, color, owner) {
      phaseNumEl.textContent = num;
      phaseNumEl.className = 'phase-number';
      if (color) phaseNumEl.classList.add('phase-' + color);
      phaseNumEl.classList.add('phase-bump');
      setTimeout(function() { phaseNumEl.classList.remove('phase-bump'); }, 300);
      if (owner) {
        phaseTitleEl.innerHTML = title + ' <span class="phase-owner phase-owner-' + owner + '">' + (owner === 'krkn' ? 'Krkn' : 'K8s') + '</span>';
      } else {
        phaseTitleEl.textContent = title;
      }
      phaseSubEl.textContent = subtitle || '';
    }

    // ── Event timeline ──
    var EVENT_COLORS = { green: '#1e8449', orange: '#e67e22', red: '#dc2626', blue: '#2980b9' };
    function addEvent(timeSec, text, color) {
      var totalSec = Math.floor(timeSec);
      var m = Math.floor(totalSec / 60);
      var s = totalSec % 60;
      var timeStr = '12:' + (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
      var entry = document.createElement('div');
      entry.className = 'event-entry';
      entry.innerHTML = '<div class="event-dot" style="background:' + (EVENT_COLORS[color] || EVENT_COLORS.green) + '"></div>' +
        '<span class="event-time">' + timeStr + '</span>' +
        '<span class="event-text">' + text + '</span>';
      eventListEl.appendChild(entry);
      eventListEl.scrollTop = eventListEl.scrollHeight;
    }
    function clearEvents() { eventListEl.innerHTML = ''; }

    // ── SLO metrics ──
    function updateSLO(avail, latency, errorRate) {
      sloAvailEl.textContent = avail;
      sloLatencyEl.textContent = latency;
      sloErrorEl.textContent = errorRate;
      var av = parseFloat(avail);
      var er = parseFloat(errorRate);
      var lt = parseInt(latency);
      sloAvailEl.className = 'slo-value ' + (av >= 99.9 ? 'slo-healthy' : av >= 99 ? 'slo-warning' : 'slo-critical');
      sloLatencyEl.className = 'slo-value ' + (lt <= 150 ? 'slo-healthy' : lt <= 250 ? 'slo-warning' : 'slo-critical');
      sloErrorEl.className = 'slo-value ' + (er <= 0.5 ? 'slo-healthy' : er <= 2 ? 'slo-warning' : 'slo-critical');
    }
    function resetSLO() { updateSLO('100%', '120ms', '0.1%'); }

    // ── Pod status ──
    function setPodStatus(podEl, state) {
      podEl.classList.remove('pod-failing', 'pod-dying', 'pod-unreachable', 'pod-creating', 'pod-ready', 'pod-recovered', 'pod-isolating', 'pod-starting', 'pod-almost-ready');
      var dot = podEl.querySelector('.status-dot-el');
      var text = podEl.querySelector('.status-text-el');
      var xmark = podEl.querySelector('.fail-x');
      if (!dot || !text) return;
      switch (state) {
        case 'healthy':
          dot.className = 'status-dot-el dot-green';
          text.textContent = 'Healthy'; text.className = 'status-text-el text-green';
          if (xmark) xmark.style.display = 'none';
          break;
        case 'killed':
          podEl.classList.add('pod-failing');
          dot.className = 'status-dot-el dot-red';
          text.textContent = 'Pod Killed'; text.className = 'status-text-el text-red';
          if (xmark) xmark.style.display = '';
          break;
        case 'isolating':
          podEl.classList.add('pod-isolating');
          dot.className = 'status-dot-el dot-orange';
          text.textContent = 'Isolating...'; text.className = 'status-text-el text-orange';
          if (xmark) xmark.style.display = 'none';
          break;
        case 'not-ready':
          podEl.classList.add('pod-unreachable');
          dot.className = 'status-dot-el dot-orange';
          text.textContent = 'Not Ready'; text.className = 'status-text-el text-orange';
          if (xmark) xmark.style.display = 'none';
          break;
        case 'unreachable':
          podEl.classList.add('pod-unreachable');
          dot.className = 'status-dot-el dot-orange';
          text.textContent = 'NOT READY'; text.className = 'status-text-el text-orange';
          if (xmark) xmark.style.display = 'none';
          break;
        case 'recovering':
          podEl.classList.add('pod-starting');
          dot.className = 'status-dot-el dot-blue';
          text.textContent = 'Recovering...'; text.className = 'status-text-el text-blue';
          if (xmark) xmark.style.display = 'none';
          break;
        case 'starting':
          podEl.classList.add('pod-starting');
          dot.className = 'status-dot-el dot-blue';
          text.textContent = 'Starting...'; text.className = 'status-text-el text-blue';
          if (xmark) xmark.style.display = 'none';
          break;
        case 'almost-ready':
          podEl.classList.add('pod-almost-ready');
          dot.className = 'status-dot-el dot-green';
          text.textContent = 'Almost Ready'; text.className = 'status-text-el text-green';
          if (xmark) xmark.style.display = 'none';
          break;
        case 'ready':
        case 'recovered':
          podEl.classList.add('pod-recovered');
          dot.className = 'status-dot-el dot-green';
          text.textContent = 'Ready'; text.className = 'status-text-el text-green';
          if (xmark) xmark.style.display = 'none';
          break;
      }
    }

    function createNewPod(state) {
      var pod = document.createElement('div');
      pod.className = 'pod-card pod-new pod-' + state;
      var statusHTML = state === 'creating'
        ? '<div class="spinner"></div><span class="status-text-el text-blue">Creating...</span>'
        : '<div class="status-dot-el dot-green"></div><span class="status-text-el text-green">Ready</span>';
      var podIcon = state === 'creating' ? POD_SVG_BLUE : POD_SVG_GREEN;
      var eventText = state === 'creating' ? 'ReplicaSet creating pod...' : 'New Pod Created';
      pod.innerHTML =
        '<div class="pod-status-bar">' + statusHTML + '</div>' +
        '<div class="pod-label">' + podIcon + ' frontend-v2-x4w7</div>' +
        '<div class="containers-grid">' +
          '<span class="ctr-chip">' + CTR_SVG + 'react-app</span>' +
          '<span class="ctr-chip">' + CTR_SVG + 'nginx</span>' +
        '</div>' +
        '<div class="pod-event-label">' + eventText + '</div>';
      return pod;
    }

    // ── Chaos dot + line ──
    function fireChaosDot() {
      var dot = document.createElement('div');
      dot.className = 'chaos-inject-dot';
      dot.style.setProperty('--path', "path('" + chaosPathD + "')");
      cluster.appendChild(dot);
      setTimeout(function() { dot.remove(); }, 1400);
    }

    var chaosLineEl = null;
    function showChaosLine() {
      chaosLineEl = drawLine(krknL.x, krknC.y, apiR.x + 6, apiC.y, {
        stroke: '#e67e22', width: '1.5', dash: '6 4', marker: 'arr-o'
      });
      chaosLineEl.style.opacity = '0';
      chaosLineEl.style.transition = 'opacity 0.4s ease';
      requestAnimationFrame(function() { chaosLineEl.style.opacity = '1'; });
    }
    function hideChaosLine() {
      if (!chaosLineEl) return;
      chaosLineEl.style.opacity = '0';
      var el = chaosLineEl;
      chaosLineEl = null;
      setTimeout(function() { el.remove(); }, 400);
    }

    // ── Traffic failure visualization ──
    var trafficXMark = null;
    function showTrafficFailed() {
      trafficLineWN2.setAttribute('stroke', '#dc2626');
      trafficLineWN2.setAttribute('stroke-dasharray', '4 3');
      trafficLineWN2.style.opacity = '1';
      trafficLineWN2.style.transition = '';
      trafficLineWN2.classList.add('traffic-line-flicker');
      var midX = (serviceC.x + wn2T.x) / 2;
      var midY = (serviceB.y + wn2T.y) / 2;
      var g = document.createElementNS(NS, 'g');
      g.setAttribute('class', 'svg-x-mark');
      var l1 = document.createElementNS(NS, 'line');
      l1.setAttribute('x1', midX - 7); l1.setAttribute('y1', midY - 7);
      l1.setAttribute('x2', midX + 7); l1.setAttribute('y2', midY + 7);
      l1.setAttribute('stroke', '#dc2626'); l1.setAttribute('stroke-width', '2.5');
      l1.setAttribute('stroke-linecap', 'round');
      var l2 = document.createElementNS(NS, 'line');
      l2.setAttribute('x1', midX + 7); l2.setAttribute('y1', midY - 7);
      l2.setAttribute('x2', midX - 7); l2.setAttribute('y2', midY + 7);
      l2.setAttribute('stroke', '#dc2626'); l2.setAttribute('stroke-width', '2.5');
      l2.setAttribute('stroke-linecap', 'round');
      g.appendChild(l1); g.appendChild(l2);
      svgEl.appendChild(g);
      trafficXMark = g;
    }
    function hideTrafficFailed() {
      trafficLineWN2.setAttribute('stroke', '#c0392b');
      trafficLineWN2.removeAttribute('stroke-dasharray');
      trafficLineWN2.classList.remove('traffic-line-flicker');
      if (trafficXMark) { trafficXMark.remove(); trafficXMark = null; }
    }

    // ── Contextual labels ──
    var currentLabel = null;
    function showCtxLabel(targetEl, text, theme, edge, offsetY) {
      edge = edge || 'top';
      offsetY = offsetY !== undefined ? offsetY : -24;
      clearCtxLabel();
      var r = targetEl.getBoundingClientRect();
      var ox = r.left - cRect.left, oy = r.top - cRect.top;
      var x = ox + r.width / 2;
      var y = edge === 'bottom' ? oy + r.height + 8 : oy + offsetY;
      var label = document.createElement('div');
      label.className = 'ctx-label ctx-' + theme;
      label.textContent = text;
      label.style.left = x + 'px';
      label.style.top = y + 'px';
      cluster.appendChild(label);
      currentLabel = label;
      return label;
    }
    function clearCtxLabel() {
      if (currentLabel) { currentLabel.remove(); currentLabel = null; }
    }

    // ── Focus mode ──
    function enterFocusMode(dimPod4) {
      if (dimPod4 === undefined) dimPod4 = true;
      wn1.classList.add('focus-dim');
      if (dimPod4) pod4.classList.add('focus-dim-lite');
      usersBlock.classList.add('focus-dim-lite');
      flowConns.forEach(function(fc) { fc.classList.add('focus-dim-lite'); });
      etcd.classList.add('focus-dim-lite');
      scheduler.classList.add('focus-dim-lite');
    }
    function exitFocusMode() {
      wn1.classList.remove('focus-dim');
      pod4.classList.remove('focus-dim-lite');
      usersBlock.classList.remove('focus-dim-lite');
      flowConns.forEach(function(fc) { fc.classList.remove('focus-dim-lite'); });
      etcd.classList.remove('focus-dim-lite');
      scheduler.classList.remove('focus-dim-lite');
    }

    // ── Node status tags ──
    var nodeTags = null;
    function addNodeTags(nodeEl, tags) {
      removeNodeTags();
      var container = document.createElement('div');
      container.className = 'node-status-tags';
      tags.forEach(function(t) {
        var el = document.createElement('span');
        el.className = 'node-tag node-tag-' + t.color;
        el.textContent = t.text;
        container.appendChild(el);
      });
      nodeEl.appendChild(container);
      nodeTags = container;
    }
    function removeNodeTags() {
      if (nodeTags) { nodeTags.remove(); nodeTags = null; }
    }

    // ── Traffic boost ──
    var boostDots = [];
    function addTrafficBoost() {
      for (var i = 0; i < 3; i++) {
        boostDots.push(spawnDot('traffic-dot', pathA, i * 1.0, 3.5));
      }
    }
    function removeTrafficBoost() {
      boostDots.forEach(function(d) { d.remove(); });
      boostDots = [];
    }

    // ── Lifecycle bar ──
    var ARROW_SVG = '<svg viewBox="0 0 14 8" fill="none"><line x1="0" y1="4" x2="10" y2="4" stroke="#94a3b8" stroke-width="1.5"/><polygon points="9,1.5 14,4 9,6.5" fill="#94a3b8"/></svg>';
    var lfSteps = [];

    function setLifecycle(title, steps) {
      document.getElementById('el-lifecycle-title').textContent = title;
      var flow = document.getElementById('el-lifecycle-flow');
      flow.innerHTML = steps.map(function(step, i) {
        var arrow = i > 0 ? '<div class="lf-arrow">' + ARROW_SVG + '</div>' : '';
        var ownerTag = step.owner ? '<span class="lf-owner lf-owner-' + step.owner + '">' + (step.owner === 'krkn' ? 'Krkn' : 'K8s') + '</span>' : '';
        return arrow + '<div class="lf-step lf-' + step.color + '"><div class="lf-dot"></div>' + step.label + ownerTag + '</div>';
      }).join('');
      lfSteps = flow.querySelectorAll('.lf-step');
    }

    function highlightStep(index) {
      lfSteps.forEach(function(s, i) { s.classList.toggle('lf-active', i === index); });
    }
    function clearStepHighlight() {
      lfSteps.forEach(function(s) { s.classList.remove('lf-active'); });
    }

    // ── Scene overlays ──
    function showSceneOverlay(title, subtitle) {
      var el = document.getElementById('el-scene-overlay');
      document.getElementById('scene-title-text').textContent = title;
      document.getElementById('scene-subtitle-text').textContent = subtitle || '';
      el.style.display = '';
      var card = el.querySelector('.scene-card');
      card.style.animation = 'none';
      card.offsetHeight;
      card.style.animation = 'fadeInScale 0.5s ease-out both';
    }
    function hideSceneOverlay() {
      var el = document.getElementById('el-scene-overlay');
      el.style.transition = 'opacity 0.5s ease';
      el.style.opacity = '0';
      setTimeout(function() { el.style.display = 'none'; el.style.opacity = '1'; el.style.transition = ''; }, 500);
    }

    // ── Verification checklist overlay ──
    function showVerifyChecklist(checks) {
      var el = document.getElementById('el-verify');
      var html = '<div class="verify-card">';
      html += '<div class="sc-result sc-result-passed" style="font-size:13px;margin-bottom:10px;">Recovery Verification</div>';
      checks.forEach(function(c, i) {
        html += '<div class="verify-row" id="verify-row-' + i + '">' +
          '<div class="verify-icon"><div class="spinner" style="width:14px;height:14px;border-width:2px;"></div></div>' +
          '<span class="verify-name">' + c + '</span>' +
          '<span class="verify-detail">Running...</span></div>';
      });
      html += '</div>';
      el.innerHTML = html;
      el.style.display = '';
      el.style.opacity = '0';
      var card = el.querySelector('.verify-card');
      card.style.animation = 'none';
      card.offsetHeight;
      card.style.animation = 'fadeInScale 0.4s ease-out both';
      requestAnimationFrame(function() { el.style.opacity = '1'; });
    }
    function updateVerifyCheck(index, passed, detail) {
      var row = document.getElementById('verify-row-' + index);
      if (!row) return;
      row.classList.add(passed ? 'verify-row-passed' : 'verify-row-failed');
      var icon = row.querySelector('.verify-icon');
      icon.innerHTML = passed
        ? '<svg viewBox="0 0 20 20" width="16" height="16"><circle cx="10" cy="10" r="9" fill="#d4edda" stroke="#1e8449" stroke-width="1.5"/><path d="M6 10l3 3 5-5" fill="none" stroke="#1e8449" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
        : '<svg viewBox="0 0 20 20" width="16" height="16"><circle cx="10" cy="10" r="9" fill="#fef2f2" stroke="#dc2626" stroke-width="1.5"/><path d="M7 7l6 6M13 7l-6 6" fill="none" stroke="#dc2626" stroke-width="2" stroke-linecap="round"/></svg>';
      var detailEl = row.querySelector('.verify-detail');
      detailEl.textContent = detail || (passed ? 'Passed' : 'Failed');
    }
    function hideVerifyChecklist() {
      var el = document.getElementById('el-verify');
      el.style.opacity = '0';
      setTimeout(function() { el.style.display = 'none'; el.innerHTML = ''; }, 500);
    }

    // ── Scorecard overlay ──
    function showScorecard(summary) {
      var el = document.getElementById('el-scorecard');
      var passed = summary.result === 'PASSED';
      var cls = passed ? 'passed' : 'failed';
      var icon = passed
        ? '<svg viewBox="0 0 40 40" width="36" height="36"><circle cx="20" cy="20" r="18" fill="#d4edda" stroke="#1e8449" stroke-width="2"/><path d="M12 20l6 6 10-10" fill="none" stroke="#1e8449" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>'
        : '<svg viewBox="0 0 40 40" width="36" height="36"><circle cx="20" cy="20" r="18" fill="#fef2f2" stroke="#dc2626" stroke-width="2"/><path d="M14 14l12 12M26 14l-12 12" fill="none" stroke="#dc2626" stroke-width="3" stroke-linecap="round"/></svg>';
      var r = summary.resiliency;
      var checksHtml = '';
      summary.recoveryVerification.forEach(function(c) {
        var p = c.passed;
        checksHtml += '<div class="sc-check sc-check-' + (p ? 'passed' : 'failed') + '">' +
          (p ? '&#10003;' : '&#10007;') + ' ' + c.name +
          '<span class="sc-check-detail">' + c.detail + '</span></div>';
      });
      var html = '<div class="scorecard-card">' +
        '<div class="sc-icon sc-icon-' + cls + '">' + icon + '</div>' +
        '<div class="sc-result sc-result-' + cls + '">Chaos Test Executed</div>' +
        '<div class="sc-exit-code">Exit Code: ' + summary.exitCode + ' (' + (summary.exitCode === 0 ? 'scenario completed' : 'failures detected') + ')</div>' +
        '<div class="sc-metrics-box">' +
          '<div class="sc-score-row">' +
            '<span class="sc-metric-label">Resiliency Score</span>' +
            '<span class="sc-score-num">' + r.score + '/100</span>' +
          '</div>' +
          '<div class="sc-score-bar"><div class="sc-score-fill sc-score-fill-' + (r.score >= 90 ? 'passed' : (r.score >= 70 ? 'warning' : 'failed')) + '" style="width:' + r.score + '%"></div></div>' +
          '<div class="sc-metric-grid">' +
            '<div><div class="sc-metric-label">SLOs Met</div><div class="sc-metric-value">' + r.passedSlos + '/' + r.totalSlos + '</div></div>' +
            '<div><div class="sc-metric-label">Total Points</div><div class="sc-metric-value">' + r.totalPoints + '</div></div>' +
            '<div><div class="sc-metric-label">Points Lost</div><div class="sc-metric-value">' + r.pointsLost + '</div></div>' +
          '</div>' +
        '</div>' +
        '<div class="sc-checks">' + checksHtml + '</div>' +
        '</div>';
      el.innerHTML = html;
      el.style.display = '';
      el.style.opacity = '0';
      var card = el.querySelector('.scorecard-card');
      card.style.animation = 'none';
      card.offsetHeight;
      card.style.animation = 'fadeInScale 0.6s ease-out both';
      requestAnimationFrame(function() { el.style.opacity = '1'; });
    }
    function hideScorecard() {
      var el = document.getElementById('el-scorecard');
      el.style.opacity = '0';
      setTimeout(function() { el.style.display = 'none'; el.innerHTML = ''; }, 600);
    }

    // ── Helper pod badge (network scenario) ──
    var helperBadge = null;
    function showHelperPod(nodeEl, status, statusText) {
      hideHelperPod();
      var badge = document.createElement('div');
      badge.className = 'helper-pod-badge' + (status === 'active' ? ' helper-pod-active' : '');
      badge.innerHTML =
        '<span class="helper-pod-icon">' + (status === 'active'
          ? '<div class="spinner" style="width:10px;height:10px;border-width:1.5px;"></div>'
          : '<div style="width:6px;height:6px;border-radius:50%;background:#e67e22;"></div>') + '</span>' +
        '<span class="helper-pod-name">krkn-helper</span>' +
        '<span class="helper-pod-status">' + (statusText || status) + '</span>';
      var podsRow = nodeEl.querySelector('.pods-row');
      if (podsRow) podsRow.appendChild(badge);
      else nodeEl.appendChild(badge);
      helperBadge = badge;
    }
    function updateHelperPod(status, statusText) {
      if (!helperBadge) return;
      helperBadge.className = 'helper-pod-badge' + (status === 'removing' ? ' helper-pod-removing' : status === 'active' ? ' helper-pod-active' : '');
      var iconEl = helperBadge.querySelector('.helper-pod-icon');
      iconEl.innerHTML = status === 'active'
        ? '<div class="spinner" style="width:10px;height:10px;border-width:1.5px;"></div>'
        : '<div style="width:6px;height:6px;border-radius:50%;background:' + (status === 'removing' ? '#dc2626' : '#e67e22') + ';"></div>';
      helperBadge.querySelector('.helper-pod-status').textContent = statusText || status;
    }
    function hideHelperPod() {
      if (helperBadge) { helperBadge.remove(); helperBadge = null; }
    }

    // ── Full state reset ──
    function resetAllState() {
      pod3Slot.querySelectorAll('.pod-new').forEach(function(el) { el.remove(); });
      pod3Orig.style.display = '';
      pod3Orig.className = 'pod-card';
      pod4.className = 'pod-card';
      setPodStatus(pod3Orig, 'healthy');
      setPodStatus(pod4, 'healthy');
      wn2.classList.remove('node-isolated');
      hideTrafficFailed();
      trafficLineWN2.setAttribute('stroke', '#c0392b');
      trafficLineWN2.removeAttribute('stroke-dasharray');
      trafficLineWN2.style.opacity = '1';
      trafficLineWN2.style.transition = '';
      pathBDots.forEach(function(d) { d.style.display = ''; });
      removeTrafficBoost();
      removeNodeTags();
      exitFocusMode();
      clearCtxLabel();
      clearStepHighlight();
      hideChaosLine();
      hideHelperPod();
      hideVerifyChecklist();
      hideScorecard();
      apiserver.classList.remove('cp-highlight');
      controller.classList.remove('cp-reconciling');
      krkn.classList.remove('krkn-active');
      clearEvents();
      resetSLO();
      setPhase('—', 'Initializing', '', '');
    }

    var ctx = {
      cluster: cluster,
      wn1: wn1, wn2: wn2,
      pod3Slot: pod3Slot, pod3Orig: pod3Orig, pod4: pod4,
      apiserver: apiserver, controller: controller,
      krkn: krkn, usersBlock: usersBlock,
      etcd: etcd, scheduler: scheduler,
      serviceEl: serviceEl, flowConns: flowConns,
      trafficLineWN2: trafficLineWN2,
      pathADots: pathADots, pathBDots: pathBDots,
      wait: wait,
      setPhase: setPhase,
      addEvent: addEvent, clearEvents: clearEvents,
      updateSLO: updateSLO, resetSLO: resetSLO,
      setPodStatus: setPodStatus, createNewPod: createNewPod,
      fireChaosDot: fireChaosDot,
      showChaosLine: showChaosLine, hideChaosLine: hideChaosLine,
      showTrafficFailed: showTrafficFailed, hideTrafficFailed: hideTrafficFailed,
      showCtxLabel: showCtxLabel, clearCtxLabel: clearCtxLabel,
      enterFocusMode: enterFocusMode, exitFocusMode: exitFocusMode,
      addNodeTags: addNodeTags, removeNodeTags: removeNodeTags,
      addTrafficBoost: addTrafficBoost, removeTrafficBoost: removeTrafficBoost,
      setLifecycle: setLifecycle, highlightStep: highlightStep, clearStepHighlight: clearStepHighlight,
      showSceneOverlay: showSceneOverlay, hideSceneOverlay: hideSceneOverlay,
      showVerifyChecklist: showVerifyChecklist, updateVerifyCheck: updateVerifyCheck, hideVerifyChecklist: hideVerifyChecklist,
      showScorecard: showScorecard, hideScorecard: hideScorecard,
      showHelperPod: showHelperPod, updateHelperPod: updateHelperPod, hideHelperPod: hideHelperPod,
      resetAllState: resetAllState,
      getCurrentLabel: function() { return currentLabel; }
    };

    scenarioRunner(ctx);
  });
}
