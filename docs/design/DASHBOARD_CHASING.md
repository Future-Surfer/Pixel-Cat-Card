# Whole-dashboard chasing

Design for [INT-04](../ROADMAP.md), with the existing observation rules from [INT-05](../ROADMAP.md).

## What it should look like

Two cats notice each other. One might sneak a few steps and crouch, then pounce beside the other cat. The other cat can watch, walk away, play back, or dash to a nearby card. If the first cat sees where they went and has a safe route, it can follow. A third cat might lift its head, watch from its perch, move aside, or later make its own invitation. Any of those choices can end the encounter. A quiet look or a missed pounce is a complete outcome.

## Dev preview

Set `dashboard_chasing: true` on both companion cards to allow voluntary cross-card chase legs. The [social lab](../../prototype/social-lab.html) has a reachable crossing and an out-of-reach scenario. Select **Eligible chase invitation** and evaluate after the cats have noticed each other. Add a third watcher to try the existing observation behaviour.

The first pass shares the current chase episode and resumes its ordinary play endings after both cats land. It uses checked point routes and allows up to two transfers under the same chase timeout. Expanded sneak and pounce pacing, optional bystander participation, dedicated wall-chase routes, and natural-frequency testing in Home Assistant are follow-ups.

## Build order

1. **Follow across one card edge.** Extend the existing two-cat chase episode and keep its independent ignore, watch, and run replies. Give the runner the choice of stopping, running locally, or taking an ordinary safe route to a nearby support. Have the chaser act on its own last-seen snapshot. Extend snapshots with a stable support reference and, only where useful, direction inferred from consecutive observations. Plan from the next grounded decision point, reserve a separate landing and braking space, and reuse existing walk, jump, and wall routes. If the runner disappears, the chaser can look from the last visible edge and then give up. The chase cannot use the runner's private route or steer a cat in mid-air.
2. **Make the pace read as play.** Reuse the existing brief look, authored sneak, crouch, pounce, gait, and landing clips. A cat can pause to look, then sprint, or stop after a feint or miss. A pounce aims for a checked empty spot beside the last observed cat on a broad support, and commits to that spot at takeoff. Let the recipient decide how to react. Keep one optional role swap and use the existing mood, personality, energy, and cooldowns to vary the choices. Once a single transfer works, allow a second within the same time and route budget. Tune from footage before commissioning frames.
3. **Let other cats notice first.** Extend the existing observer, which already watches visible moving cats. An observer can keep napping, turn to look, or give the chase a little space. Watching works across an unreachable gap if the action is visible. Once that reads well, let one nearby cat approach a free lookout point or make a separate play invitation during a lull. Start with a maximum of two active runners per chase. A third cat can take over a role after one of them disengages, or begin a fresh invitation once cooldowns permit.

## Safety and lifecycle

- A route needs a clear takeoff, landing, room to stop, and a way back to ordinary roaming. Check third-party movement and pending landings when reserving space. The runner and chaser can take different routes.
- Bound chase duration, transfers, and replans. Do route searches at grounded decisions using the existing budgets. An interruption releases the chase's route and reservations without discarding a user's command. A cat already airborne finishes its checked landing, then stops pursuing.
- Keep the current **Chasing** switch and the existing short same-surface chase. Develop cross-card pursuit behind a reversible dev flag and fold it into **Chasing** once it passes the live checks. Keep ordinary moods and interaction rates independent of lab settings.

## How to judge it

- Extend the existing social lab with ordinary Home Assistant-style cards, a reachable transfer, a blocked or unreachable route, and a third cat who can see only part of the action. Allow seeded replay and log who saw what, invitations and replies, routes, reserved landings, and why each chase ended. Seed the setup while letting the cats choose their responses.
- Test one- and two-transfer chases, lost sight, refusal, a pounce miss, a bystander crossing the landing, and interruption by Home, pause, pickup, navigation, and reflow. Compare the existing same-surface chase with pursuit switched off. Check that episodes and reservations clear after each case.
- Run a mixed-age session on the Home Assistant dev dashboard with the lab bias both on and off. Watch for readable pauses, safe spacing, occasional missed connections, and cats that carry on doing their own thing. Compare route work and frame time with pursuit off in the stress view before enabling it by default.
