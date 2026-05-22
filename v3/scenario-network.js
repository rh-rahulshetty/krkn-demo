var SCENARIO_NETWORK_STEPS = [
  { label: 'Healthy', color: 'green', owner: 'k8s' },
  { label: 'Inject', color: 'orange', owner: 'krkn' },
  { label: 'Impact', color: 'red', owner: 'krkn' },
  { label: 'Detect', color: 'blue', owner: 'k8s' },
  { label: 'Reroute', color: 'blue', owner: 'k8s' },
  { label: 'Restore', color: 'green', owner: 'krkn' },
  { label: 'Recover', color: 'blue', owner: 'k8s' },
  { label: 'Verify', color: 'blue', owner: 'krkn' },
  { label: 'Passed', color: 'green', owner: 'krkn' },
];

async function scenarioNetwork(ctx) {
  var t = 0;

  // Phase 1 — Healthy State
  ctx.setPhase(1, 'Healthy State', 'All nodes connected', 'green', 'k8s');
  ctx.highlightStep(0);
  ctx.addEvent(t, 'Krkn config loaded — node-network-isolation scenario', 'blue');
  await ctx.wait(600);
  ctx.addEvent(t, 'Scenario plugin: node_network_scenario_plugin', 'blue');
  await ctx.wait(600);
  ctx.addEvent(t, 'Target discovery: Worker Node 2', 'blue');
  await ctx.wait(600);
  t += 1.8;
  ctx.addEvent(t, 'All nodes healthy, network stable', 'green');
  ctx.updateSLO('100%', '120ms', '0.1%');
  await ctx.wait(1500);
  t += 1.5;

  // Pre-chaos: Targeting
  ctx.showTargeting(ctx.wn2, 'Worker Node 2');
  ctx.addEvent(t, 'Krkn: acquiring target — Worker Node 2', 'orange');
  await ctx.wait(2000);
  t += 2.0;
  ctx.clearTargeting();

  // Phase 2 — Chaos Injection
  ctx.setPhase(2, 'Chaos Injection', 'Deploying helper pod on WN2', 'orange', 'krkn');
  ctx.highlightStep(1);
  ctx.enterFocusMode(false);
  ctx.krkn.classList.add('krkn-active');
  ctx.showChaosLine();
  ctx.showKrknTerminal('krknctl run node-network-filter');
  ctx.addEvent(t, 'Krkn: deploying krkn-helper pod on Worker Node 2', 'orange');
  ctx.fireChaosDot();
  await ctx.wait(1200);
  t += 1.2;

  ctx.showHelperPod(ctx.wn2, 'active', 'Deploying...');
  ctx.addEvent(t, 'krkn-helper pod scheduled (privileged: true)', 'orange');
  await ctx.wait(800);
  t += 0.8;

  ctx.updateHelperPod('active', 'Applying rules');
  ctx.addEvent(t, 'krkn-helper: applying iptables DROP ingress + egress', 'orange');
  await ctx.wait(800);
  t += 0.8;
  ctx.krkn.classList.remove('krkn-active');
  ctx.hideChaosLine();

  // Phase 3 — Impact
  ctx.setPhase(3, 'Pod Impacted', 'Network partition active', 'red', 'krkn');
  ctx.highlightStep(2);
  ctx.wn2.classList.add('node-isolated');
  ctx.addNodeTags(ctx.wn2, [
    { text: 'Ingress Blocked', color: 'red' },
    { text: 'Egress Blocked', color: 'red' },
  ]);
  ctx.showCtxLabel(ctx.wn2, 'iptables DROP ingress + egress', 'red', 'top', -28);
  ctx.addEvent(t, 'Worker Node 2 network partitioned', 'red');

  ctx.setPodStatus(ctx.pod3Orig, 'isolating');
  ctx.setPodStatus(ctx.pod4, 'isolating');
  ctx.updateSLO('99.5%', '200ms', '1.5%');
  await ctx.wait(1500);
  t += 1.5;

  ctx.setPodStatus(ctx.pod3Orig, 'not-ready');
  ctx.setPodStatus(ctx.pod4, 'not-ready');
  ctx.addEvent(t, 'frontend-v2-9f2a, order-svc-5n1p: probes failing', 'red');

  ctx.showTrafficFailed();
  ctx.pathBDots.forEach(function(d) { d.style.display = 'none'; });
  ctx.updateSLO('98.5%', '340ms', '3.2%');
  await ctx.wait(2000);
  t += 2.0;

  // Phase 4 — Detect
  ctx.setPhase(4, 'Drift Detected', 'Endpoint controller reacting', 'blue', 'k8s');
  ctx.highlightStep(3);
  ctx.controller.classList.add('cp-reconciling');
  ctx.showCtxLabel(ctx.controller, 'Endpoint drift — 2 replicas not ready', 'blue', 'bottom');
  ctx.addEvent(t, 'Controller: 2 endpoints removed from Service', 'blue');
  ctx.updateSLO('99.0%', '260ms', '2.1%');
  await ctx.wait(2000);
  t += 2.0;

  // Phase 5 — Reroute
  ctx.setPhase(5, 'Traffic Rerouted', 'All traffic to Worker Node 1', 'blue', 'k8s');
  ctx.highlightStep(4);
  ctx.addTrafficBoost();
  ctx.showCtxLabel(ctx.serviceEl, 'Traffic rerouted to Node 1', 'blue', 'bottom');
  ctx.addEvent(t, 'Service endpoints updated — WN1 only', 'blue');
  ctx.updateSLO('99.4%', '190ms', '1.0%');
  await ctx.wait(2500);
  t += 2.5;

  ctx.controller.classList.remove('cp-reconciling');
  ctx.addEvent(t, 'Traffic stabilized on healthy node', 'blue');
  ctx.updateSLO('99.7%', '160ms', '0.5%');
  await ctx.wait(1500);
  t += 1.5;

  // Phase 6 — Restore
  ctx.setPhase(6, 'Network Restored', 'Dwell time elapsed — cleaning up', 'green', 'krkn');
  ctx.highlightStep(5);
  ctx.addEvent(t, 'Krkn: dwell time elapsed — initiating cleanup', 'green');
  await ctx.wait(800);
  t += 0.8;

  ctx.updateHelperPod('removing', 'Removing rules');
  ctx.addEvent(t, 'krkn-helper: removing iptables rules', 'green');
  await ctx.wait(1000);
  t += 1.0;

  ctx.wn2.classList.remove('node-isolated');
  ctx.removeNodeTags();
  ctx.hideTrafficFailed();
  ctx.trafficLineWN2.style.opacity = '1';
  ctx.addNodeTags(ctx.wn2, [{ text: 'Connectivity Restored', color: 'green' }]);
  ctx.showCtxLabel(ctx.wn2, 'Network partition removed', 'green', 'top', -28);
  ctx.addEvent(t, 'iptables rules removed — network restored', 'green');
  await ctx.wait(800);
  t += 0.8;

  ctx.addEvent(t, 'krkn-helper pod deleted from Node 2', 'green');
  ctx.hideHelperPod();
  await ctx.wait(1000);
  t += 1.0;

  // Phase 7 — Recover
  ctx.setPhase(7, 'Pods Recovering', 'Readiness probes resuming', 'blue', 'k8s');
  ctx.highlightStep(6);
  ctx.removeNodeTags();

  ctx.setPodStatus(ctx.pod3Orig, 'recovering');
  ctx.setPodStatus(ctx.pod4, 'recovering');
  ctx.addEvent(t, 'Pods reconnecting to API server', 'blue');
  ctx.updateSLO('99.8%', '150ms', '0.3%');
  await ctx.wait(1200);
  t += 1.2;

  ctx.setPodStatus(ctx.pod3Orig, 'starting');
  ctx.setPodStatus(ctx.pod4, 'starting');
  ctx.addEvent(t, 'Readiness probes passing...', 'blue');
  await ctx.wait(1200);
  t += 1.2;

  ctx.setPodStatus(ctx.pod3Orig, 'almost-ready');
  ctx.setPodStatus(ctx.pod4, 'almost-ready');
  await ctx.wait(800);
  t += 0.8;

  ctx.setPodStatus(ctx.pod3Orig, 'ready');
  ctx.setPodStatus(ctx.pod4, 'ready');
  ctx.addEvent(t, 'frontend-v2-9f2a, order-svc-5n1p: ready', 'green');
  ctx.updateSLO('99.9%', '135ms', '0.15%');

  ctx.pathBDots.forEach(function(d) { d.style.display = ''; });
  ctx.removeTrafficBoost();
  await ctx.wait(1500);
  t += 1.5;

  // Phase 8 — Recovery Verification
  ctx.setPhase(8, 'Recovery Verification', 'Validating cluster state', 'blue', 'krkn');
  ctx.highlightStep(7);
  ctx.clearCtxLabel();
  ctx.pod3Orig.classList.remove('pod-recovered');
  ctx.pod4.classList.remove('pod-recovered');
  ctx.setPodStatus(ctx.pod3Orig, 'healthy');
  ctx.setPodStatus(ctx.pod4, 'healthy');
  ctx.exitFocusMode();
  ctx.addEvent(t, 'Krkn: starting recovery verification', 'blue');

  ctx.showVerifyChecklist(['Workload Recovery', 'Health Checks', 'Critical Alerts']);
  await ctx.wait(1200);
  t += 1.2;

  ctx.updateVerifyCheck(0, true, 'All endpoints re-registered');
  ctx.addEvent(t, 'Verify: workload recovery — all endpoints healthy', 'green');
  await ctx.wait(1000);
  t += 1.0;

  ctx.updateVerifyCheck(1, false, 'p95 latency breached (340ms > 200ms SLO)');
  ctx.addEvent(t, 'Verify: health checks — p95 latency SLO breached', 'red');
  await ctx.wait(1000);
  t += 1.0;

  ctx.updateVerifyCheck(2, true, 'No critical alerts');
  ctx.addEvent(t, 'Verify: critical alerts — none firing', 'green');
  ctx.updateSLO('100%', '122ms', '0.05%');
  await ctx.wait(1500);
  t += 1.5;

  ctx.hideVerifyChecklist();
  await ctx.wait(500);

  ctx.addEvent(t, 'Krkn: resiliency score 82/100 — SLOs 2/3 met', 'orange');
  ctx.addEvent(t, 'Krkn: exit code 0 — scenario executed successfully', 'green');
  await ctx.wait(1500);
  t += 1.5;

  ctx.clearCtxLabel();
  ctx.clearStepHighlight();
}
