var SCENARIO_POD_STEPS = [
  { label: 'Healthy', color: 'green', owner: 'k8s' },
  { label: 'Inject', color: 'orange', owner: 'krkn' },
  { label: 'Delete', color: 'red', owner: 'krkn' },
  { label: 'Detect', color: 'blue', owner: 'k8s' },
  { label: 'Reroute', color: 'blue', owner: 'k8s' },
  { label: 'Remove', color: 'red', owner: 'k8s' },
  { label: 'Create', color: 'blue', owner: 'k8s' },
  { label: 'Verify', color: 'blue', owner: 'krkn' },
  { label: 'Passed', color: 'green', owner: 'krkn' },
];

async function scenarioPod(ctx) {
  var t = 0;

  // Phase 1 — Healthy State
  ctx.setPhase(1, 'Healthy State', 'All pods serving traffic', 'green', 'k8s');
  ctx.highlightStep(0);
  ctx.addEvent(t, 'Krkn config loaded — pod-delete scenario', 'blue');
  await ctx.wait(600);
  ctx.addEvent(t, 'Scenario plugin: pod_scenario_plugin', 'blue');
  await ctx.wait(600);
  ctx.addEvent(t, 'Target discovery: frontend-v2-9f2a (Node 2)', 'blue');
  await ctx.wait(600);
  t += 1.8;
  ctx.addEvent(t, 'All pods healthy, traffic balanced', 'green');
  ctx.updateSLO('100%', '120ms', '0.1%');
  await ctx.wait(1500);
  t += 1.5;

  // Phase 2 — Chaos Injection
  ctx.setPhase(2, 'Chaos Injection', 'Krkn targeting frontend-v2-9f2a', 'orange', 'krkn');
  ctx.highlightStep(1);
  ctx.enterFocusMode();
  ctx.krkn.classList.add('krkn-active');
  ctx.showChaosLine();
  ctx.addEvent(t, 'Krkn: pod-delete targeting frontend-v2-9f2a', 'orange');
  ctx.fireChaosDot();
  await ctx.wait(1200);
  t += 1.2;

  ctx.apiserver.classList.add('cp-highlight');
  ctx.addEvent(t, 'API Server: DELETE pod/frontend-v2-9f2a', 'orange');
  await ctx.wait(800);
  t += 0.8;
  ctx.apiserver.classList.remove('cp-highlight');
  ctx.krkn.classList.remove('krkn-active');
  ctx.hideChaosLine();

  // Phase 3 — Pod Deleted
  ctx.setPhase(3, 'Pod Deleted', 'frontend-v2-9f2a terminating', 'red', 'krkn');
  ctx.highlightStep(2);
  ctx.setPodStatus(ctx.pod3Orig, 'killed');
  ctx.showCtxLabel(ctx.pod3Orig, 'Pod Terminating — graceful shutdown', 'red', 'top', -24);
  ctx.addEvent(t, 'frontend-v2-9f2a deleted — graceful shutdown initiated', 'red');
  ctx.updateSLO('99.8%', '180ms', '0.8%');
  await ctx.wait(1500);
  t += 1.5;

  ctx.pathBDots.forEach(function(d) { d.style.display = 'none'; });
  ctx.addEvent(t, 'Traffic to frontend-v2 endpoint failing', 'red');
  ctx.updateSLO('99.5%', '220ms', '1.2%');
  await ctx.wait(1000);
  t += 1.0;

  // Phase 4 — Drift Detected
  ctx.setPhase(4, 'Drift Detected', 'Controller reconciling', 'blue', 'k8s');
  ctx.highlightStep(3);
  ctx.controller.classList.add('cp-reconciling');
  ctx.showCtxLabel(ctx.controller, 'ReplicaSet: desired=2 current=1', 'blue', 'bottom');
  ctx.addEvent(t, 'Controller: replica drift detected', 'blue');
  await ctx.wait(1500);
  t += 1.5;

  ctx.addEvent(t, 'ReplicaSet reconciling — scheduling new pod', 'blue');
  await ctx.wait(1000);
  t += 1.0;

  // Phase 5 — Traffic Rerouted
  ctx.setPhase(5, 'Traffic Rerouted', 'Endpoint removed from Service', 'blue', 'k8s');
  ctx.highlightStep(4);
  ctx.showCtxLabel(ctx.serviceEl, 'Endpoint removed — traffic rerouted', 'blue', 'bottom');
  ctx.addTrafficBoost();
  ctx.addEvent(t, 'Endpoint removed — frontend-v2-9f2a', 'blue');
  ctx.updateSLO('99.6%', '190ms', '0.9%');
  await ctx.wait(3000);
  t += 3.0;

  // Phase 6 — Pod Removed
  ctx.setPhase(6, 'Pod Removed', 'Cleaning up failed pod', 'red', 'k8s');
  ctx.highlightStep(5);
  ctx.clearCtxLabel();
  ctx.controller.classList.remove('cp-reconciling');
  ctx.addEvent(t, 'Terminated pod removed from node', 'red');
  await ctx.wait(1500);
  t += 1.5;
  ctx.pod3Orig.classList.remove('pod-failing');
  ctx.pod3Orig.classList.add('pod-dying');
  await ctx.wait(800);
  t += 0.8;
  ctx.pod3Orig.style.display = 'none';
  ctx.pod3Orig.classList.remove('pod-dying');
  await ctx.wait(800);
  t += 0.8;

  // Phase 7 — Creating Pod
  ctx.setPhase(7, 'Creating Pod', 'Replacement pod scheduling', 'blue', 'k8s');
  ctx.highlightStep(6);
  ctx.showCtxLabel(ctx.pod3Slot, 'Scheduling replacement pod...', 'blue', 'top', -24);
  var creatingPod = ctx.createNewPod('creating');
  ctx.pod3Slot.appendChild(creatingPod);
  ctx.addEvent(t, 'New frontend-v2 replica scheduling on Node 2', 'blue');
  ctx.updateSLO('99.7%', '170ms', '0.6%');
  await ctx.wait(2500);
  t += 2.5;

  ctx.addEvent(t, 'Container images pulled, starting...', 'blue');
  await ctx.wait(2000);
  t += 2.0;

  creatingPod.remove();
  var readyPod = ctx.createNewPod('ready');
  ctx.pod3Slot.appendChild(readyPod);
  ctx.showCtxLabel(ctx.pod3Slot, 'Pod Ready — passing health checks', 'green', 'top', -24);
  ctx.addEvent(t, 'frontend-v2-x4w7 ready — health checks passing', 'green');
  ctx.updateSLO('99.9%', '140ms', '0.2%');
  await ctx.wait(1500);
  t += 1.5;

  // Phase 8 — Recovery Verification
  ctx.setPhase(8, 'Recovery Verification', 'Validating cluster state', 'blue', 'krkn');
  ctx.highlightStep(7);
  ctx.clearCtxLabel();
  ctx.pathBDots.forEach(function(d) { d.style.display = ''; });
  ctx.removeTrafficBoost();
  ctx.exitFocusMode();
  ctx.addEvent(t, 'Krkn: starting recovery verification', 'blue');

  ctx.showVerifyChecklist(['Workload Recovery', 'Health Checks', 'Critical Alerts']);
  await ctx.wait(1200);
  t += 1.2;

  ctx.updateVerifyCheck(0, true, 'ReplicaSet 2/2 ready');
  ctx.addEvent(t, 'Verify: workload recovery — ReplicaSet 2/2 ready', 'green');
  await ctx.wait(1000);
  t += 1.0;

  ctx.updateVerifyCheck(1, true, 'All probes passing');
  ctx.addEvent(t, 'Verify: health checks — all probes passing', 'green');
  await ctx.wait(1000);
  t += 1.0;

  ctx.updateVerifyCheck(2, false, 'Recovery latency alert fired (47s > 30s)');
  ctx.addEvent(t, 'Verify: critical alerts — recovery latency alert fired', 'red');
  await ctx.wait(1500);
  t += 1.5;

  ctx.hideVerifyChecklist();
  await ctx.wait(500);

  ctx.addEvent(t, 'Krkn: resiliency score 78/100 — SLOs 2/3 met', 'orange');
  ctx.addEvent(t, 'Krkn: exit code 0 — scenario executed successfully', 'green');
  await ctx.wait(1500);
  t += 1.5;

  ctx.clearCtxLabel();
  ctx.clearStepHighlight();
  readyPod.remove();
}
