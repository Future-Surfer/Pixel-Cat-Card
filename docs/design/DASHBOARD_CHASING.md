# Whole-dashboard chasing

Design for [INT-04](../ROADMAP.md), with the existing observation rules from [INT-05](../ROADMAP.md).

## What it should look like

Two cats notice each other. One might sneak a few steps and crouch, then pounce beside the other cat. The other cat can watch, walk away, play back, or dash to a nearby card. If the first cat sees where they went and has a safe route, it can follow. A third cat might lift its head, watch from its perch, move aside, or later make its own invitation. Any of those choices can end the encounter. A quiet look or a missed pounce is a complete outcome.

## Try the pilot

In Home Assistant, choose **Behaviour Lab → Focus → Chase across cards**. The focus makes each cat more likely to run on, follow motion it actually saw, pounce beside it, or turn to watch. It keeps decisions and routes local to each cat. Choose **Natural behaviour** to clear the focus.

In ordinary play, each cat can choose to follow movement it sees on the same surface or across cards when its **Chasing** setting and social and interaction behaviour are enabled. It keeps space for a checked landing, has a way back, and makes a new choice after its own cooldown. The other cat keeps its own route and settings. The [social lab](../../prototype/social-lab.html) offers reachable and blocked scenarios. It prompts one cat to cross so you can observe the other cat’s choice.

Natural-frequency calibration and optional bystander participation remain follow-ups.

## Retired paired pilot

The first pilot assigned a runner and a chaser, with an invitation, optional role swap and shared timeout. The implementation and tests are preserved in [Git history](https://github.com/Future-Surfer/Pixel-Cat-Card/tree/321633ef59469754d2688eaad9f2e2716f664fc1). The former `dashboard_chasing` YAML flag has no effect. Existing dashboards can remove it and keep the individual **Chasing** preference.

## Safety and lifecycle

- A route needs a clear takeoff, landing, room to stop, and a way back to ordinary roaming. Check third-party movement and pending landings when reserving space. The runner and chaser can take different routes.
- Bound chase duration, transfers, and replans. Do route searches at grounded decisions using the existing budgets. An interruption releases the chase's route and reservations without discarding a user's command. A cat already airborne finishes its checked landing, then stops pursuing.
- Use each cat’s **Chasing** setting on the same surface and across cards. Keep ordinary moods and interaction rates independent of lab settings.

## How to judge it

- Extend the existing social lab with ordinary Home Assistant-style cards, a reachable transfer, a blocked or unreachable route, and a third cat who can see only part of the action. Allow seeded replay and log who saw what, invitations and replies, routes, reserved landings, and why each chase ended. Seed the setup while letting the cats choose their responses.
- Test observed movement, lost sight, quiet alternatives, a pounce miss in Behaviour Lab, a bystander crossing the landing, and interruption by Home, pause, pickup, navigation, and reflow. Check that the observing cat’s setting disables its own pursuit. Check that episodes and reservations clear after each case.
- Run a mixed-age session on the Home Assistant dev dashboard with the lab bias both on and off. Watch for readable pauses, safe spacing, occasional missed connections, and cats that carry on doing their own thing. Compare route work and frame time with pursuit off in the stress view before enabling it by default.
