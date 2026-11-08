class StickPetCard extends HTMLElement {
  // ===========================================================================
  // 1. Configuration defaults
  // ===========================================================================
  /*
    Architecture direction

    This card is moving towards a small procedural Home Assistant world:

    - Dude: a simple stick figure character.
    - Cat: a separate rig with skeleton and future silhouette render modes.
    - POIs: world objects that can create walk targets, arrival actions,
      desired hand targets, and later entity/service actions.
    - Debug-first workflow: new behaviours should expose target/debug geometry
      before they drive animation.

    Most advanced tuning options remain available via YAML, but the visual
    editor should stay deliberately simple: view mode, debug layers, and
    temporary cat tuning while the cat design is being developed.
  */

  static defaults() {
    return {
      // -----------------------------------------------------------------------
      // Card / view mode
      // -----------------------------------------------------------------------
      title: "Stick Pet",

      // "world"      = normal card view
      // "cat_focus"  = hide the dude and enlarge/centre the cat for tuning
      // "dude_focus" = reserved for later gait work
      view_mode: "world",

      // Home Assistant card sizing
      height: 320,
      grid_rows: 5,
      grid_columns: "full",
      grid_min_rows: 4,
      grid_min_columns: 6,

      // SVG world
      world_fill_available_width: true,
      world_width: 520,
      world_height: 240,
      world_padding_x: 6,

      // Scene visibility
      show_dude: true,
      show_cat: false,
      show_pois: true,
      show_environment: true,

      // Scene scale/transform
      scale: 1,

      // Cat focus mode
      cat_focus_scale: 2.6,
      cat_focus_padding: 18,
      cat_focus_hide_dude: true,
      cat_focus_hide_pois: true,
      cat_focus_hide_head_path: true,

      // -----------------------------------------------------------------------
      // Dude: position and proportions
      // -----------------------------------------------------------------------
      figure_x: 260,
      auto_standing_y: true,
      figure_y: 64,
      desired_figure_x: 320,
      desired_figure_y: 64,
      horizontal_tap_movement: true,

      // Compact default proportions, closer to figure D
      head_radius: 21,
      neck_length: 7,
      torso_length: 44,
      shoulder_width: 28,
      hip_width: 16,
      upper_arm_length: 38,
      lower_arm_length: 36,
      upper_leg_length: 38,
      lower_leg_length: 38,

      // -----------------------------------------------------------------------
      // Dude: movement and pathing
      // -----------------------------------------------------------------------
      animate_on_tap: true,
      click_sets_desired: true,
      spring_strength: 0.008,
      damping: 0.55,
      settle_threshold: 0.45,

      // Arrival / movement finish
      walk_finish_distance: 2.4,
      walk_finish_speed: 0.85,

      // Future gait overhaul switch.
      // Keep "legacy" as the current system until a new procedural gait exists.
      dude_walk_cycle_mode: "legacy", // "legacy" | "procedural"

      // Head speed profile
      max_head_speed_x: 0.62,
      max_head_speed_y: 0.9,
      use_speed_profile: true,
      walk_speed_x: 0.45,
      jog_speed_x: 0.85,
      run_speed_x: 1.25,
      jog_distance: 50,
      run_distance: 110,
      accel_ease_distance: 24,
      decel_ease_distance: 32,

      // Let feet lead the body/head
      head_wait_for_feet: true,
      head_wait_speed_multiplier: 0.82,

      // Path planning
      movement_mode: "path",
      show_head_path: true,
      path_color: "var(--primary-text-color)",
      path_opacity: 0.22,
      path_width: 2,
      path_dash: "4 6",
      standing_y_tolerance: 2,

      // Head movement limits
      head_clamp_enabled: true,
      head_clamp_up_ratio: 0.13,
      head_clamp_down_ratio: 0.16,
      show_head_clamp: false,

      // Floor
      show_floor: true,
      floor_y: 212,

      // -----------------------------------------------------------------------
      // Dude: legacy leg solver
      // -----------------------------------------------------------------------
      leg_solver_enabled: true,
      foot_lock_mode: "planted_floor",
      stance_width: 14,
      knee_outward_amount: 0.35,
      standing_leg_extension_ratio: 0.97,
      leg_min_extension_ratio: 0.68,

      // Planted foot stepping
      step_trigger_ratio: 1,
      step_target_ahead_ratio: 0.7,
      step_progress_speed: 0.018,
      step_height: 10,
      step_cooldown_frames: 1,

      // Idle landing / final foot placement
      idle_final_step_enabled: true,
      idle_final_step_distance: 8,
      idle_settle_snap_distance: 3,
      idle_destination_blend_ratio: 1.35,

      // Anticipatory / walk-like stepping
      anticipatory_steps: false,
      anticipatory_step_distance: 5,
      foot_lead_distance_ratio: 0.18,
      prefer_alternating_feet: true,
      allow_foot_crossing: true,
      side_on_walk: true,
      walk_lane_ratio: 0.18,

      // Side-on body movement
      side_on_body: true,
      side_on_body_min_width_ratio: 0.08,
      side_on_body_speed_threshold: 0.05,

      // Knee lead
      knee_lead_enabled: true,
      knee_lead_amount: 9,
      knee_lift_amount: 5,

      // Knee bend direction
      knee_bend_mode: "travel",
      knee_bend_travel_threshold: 0.03,

      // Movement intensity / gait scaling
      movement_intensity_enabled: true,
      movement_intensity_smoothing: 0.12,
      gait_stride_jog_boost: 0.16,
      gait_step_height_jog_boost: 7,
      gait_knee_lift_jog_boost: 7,
      gait_knee_lead_jog_boost: 3,

      // -----------------------------------------------------------------------
      // Dude: arms, IK, and hand targets
      // -----------------------------------------------------------------------
      arm_ik_enabled: true,
      arm_flail_enabled: true,
      arm_flail_amount: 6,
      arm_flail_lift: 2.5,
      arm_flail_speed: 0.004,
      arm_flail_idle_amount: 0.08,
      arm_flail_step_boost: 0.18,

      // Arm elbow controls
      arm_elbow_pole_down_amount: 24,
      arm_elbow_pole_outward_amount: 8,

      // Arm IK swing shaping
      arm_swing_reach: 12,
      arm_swing_lift: 2.5,
      arm_hand_forward_bias: 2,
      arm_balance_reach: 3.5,
      arm_target_reach_ratio: 0.96,
      arm_elbow_bend_strength: 0.28,

      // Arm swing momentum
      arm_momentum_enabled: true,
      arm_momentum_amount: 4,
      arm_phase_speed_min: 0.0008,
      arm_phase_speed_max: 0.0038,

      // Desired hand target behaviour
      poi_hand_target_enabled: true,
      poi_hand_target_trigger_distance: 7,
      poi_hand_target_reach_padding: 2,

      // Desired hand target movement
      poi_hand_reach_enabled: true,
      poi_hand_reach_strength: 1,
      poi_hand_reach_blend_speed: 0.1,
      poi_hand_reach_return_speed: 0.08,
      poi_hand_reach_only_when_reachable: true,

      // -----------------------------------------------------------------------
      // Dude: secondary body movement
      // -----------------------------------------------------------------------
      body_bob_enabled: true,
      body_bob_amount: 2.2,
      body_bob_speed_amount: 0.6,
      body_bob_step_amount: 1.4,
      body_bob_smoothing: 0.12,

      torso_lean_enabled: true,
      torso_lean_amount: 2.2,
      torso_lean_speed_amount: 0.8,

      balance_proxy_enabled: true,
      balance_support_range: 34,
      balance_counter_lean_amount: 5,

      arm_balance_enabled: true,
      arm_balance_amount: 7,
      arm_balance_lift: 2,

      // Pose response, parked for now
      pose_response_enabled: false,
      torso_crouch_compress_ratio: 0.06,
      torso_stretch_extend_ratio: 0.03,
      stance_crouch_widen_ratio: 0.22,
      stance_stretch_narrow_ratio: 0.06,
      knee_crouch_outward_ratio: 0.35,
      knee_stretch_outward_ratio: -0.1,

      // -----------------------------------------------------------------------
      // Dude: idle animation and idle pose
      // -----------------------------------------------------------------------
      idle_animation_enabled: true,
      idle_breath_amount: 1.4,
      idle_sway_amount: 1.2,
      idle_head_look_amount: 2.2,
      idle_head_nod_amount: 0.8,
      idle_animation_speed: 0.0012,

      idle_pose_enabled: true,
      idle_pose_foot_tolerance: 1.4,
      idle_pose_body_settle_speed: 0.025,

      // -----------------------------------------------------------------------
      // Auto wander and POI-driven movement
      // -----------------------------------------------------------------------
      auto_wander: true,
      wander_use_available_width: true,
      wander_width_ratio: 0.75,
      wander_min_x: 70,
      wander_max_x: 450,
      wander_min_idle_ms: 1200,
      wander_max_idle_ms: 4200,
      wander_target_jitter: 12,

      // Points of interest / simple environment
      poi_enabled: true,
      poi_chance: 0.45,
      poi_random_wander_enabled: true,

      // POI interaction/action behaviour
      poi_action_enabled: true,
      poi_action_on_arrival: true,

      // Built-in light switch POIs
      poi_switches_enabled: true,
      poi_switch_left_ratio: 0.24,
      poi_switch_right_ratio: 0.76,
      poi_switch_y: 104,
      poi_switch_walk_offset_x: 34, // legacy fallback

      // POI approach behaviour
      poi_switch_approach_type: "within_reach",
      poi_switch_reach_ratio: 0.72,
      poi_switch_min_approach_distance: 22,
      poi_switch_max_approach_distance: 58,

      // Local light-source effect for switch POIs.
      // At the moment this is effectively an arrival indicator.
      // Later this can split into arrival feedback vs real switched output.
      poi_light_source_enabled: true,
      poi_light_source_y_offset: 48,
      poi_light_source_radius: 34,
      poi_light_source_color: "rgba(255, 190, 70, 0.72)",
      poi_light_source_off_opacity: 0.08,
      poi_light_source_on_opacity: 0.75,

      // POI debug/path styling
      poi_path_color: "var(--warning-color)",
      random_path_color: "var(--primary-text-color)",
      poi_switch_color: "var(--primary-text-color)",
      poi_switch_opacity: 0.55,

      // Click / attention POIs
      click_creates_attention_poi: true,
      click_attention_poi_lifetime_ms: 12000,
      click_attention_poi_type: "attention",
      click_attention_poi_label: "look",
      click_attention_poi_move_dude: true,
      click_attention_poi_move_cat: false,

      // Cat direct manipulation.
      // This is the first interactive use of the broader cat interaction model.
      // Pointer dragging writes targetOverrides; the target-led solver consumes them.
      cat_interaction_enabled: true,
      cat_drag_enabled: true,
      cat_drag_mode: "head", // "head" | "scruff" | "nearest"
      cat_drag_require_cat_focus: true,
      cat_drag_prevent_dude_click: true,

      // Cat true wander mode.
      // Intended for placing the cat as a transparent dashboard ribbon/overlay.
      // This hides UI/environment chrome and allows the cat to visually spill
      // beyond the card slot where the dashboard permits overflow.
      cat_true_wander_mode: false,
      cat_true_wander_overflow: true,

      // Cat auto-wander v0.
      // This gently moves the cat's head target left/right. The target-led body
      // solver and existing contact/gait logic do the rest.
      cat_auto_wander: true,
      cat_wander_min_x: 110,
      cat_wander_max_x: 410,
      cat_wander_path_y: 166,
      cat_wander_head_speed: 0.28,
      cat_wander_arrival_distance: 3,
      cat_wander_min_idle_ms: 5000,
      cat_wander_max_idle_ms: 10000,
      cat_wander_target_jitter: 8,


      // -----------------------------------------------------------------------
      // Cat: v1 anatomical rig scaffold
      // -----------------------------------------------------------------------
      cat_enabled: false,

      // Cat rig architecture.
      // Legacy/manual and candidate solvers have been archived; the live card
      // now uses the constrained target-led cat path.
      // "skeleton" first; "silhouette" later uses the same rig.
      cat_model: "og", // "og" | "feline_v1_direct_register" | "feline_v2_smooth_direct_register" | "feline_v3_flow_direct_register" | "feline_v4_compact_direct_register" | "feline_v5_compact_head_direct_register" | "feline_v6_articulated_direct_register" | "feline_v7_refined_articulated_direct_register" | "feline_v8_tucked_articulated_direct_register" | "feline_v9_flowing_articulated_direct_register"
      cat_comparison_tile_height: 190,

      // Fast editor-only experiment switches. These deliberately override the
      // live cat only while enabled, so turning one back off restores cat_model.
      show_cat_candidate_array: false,
      show_cat_pixel_preview: false,
      cat_pixel_walk_experimental: false,
      cat_pixel_self_walk: false,
      cat_pixel_animate: true,
      cat_pixel_cycle_ms: 1000,
      cat_pixel_cell_size: 9,
      show_cat_pixel_grid: false,
      show_cat_pixel_paw_debug: false,
      // V10 split-pin silhouette: independent art-direction dimensions.
      // These deliberately do not inherit from cat_body_length ratios.
      cat_split_pin_torso_depth: 31,
      cat_split_pin_haunch_depth: 35,
      cat_split_pin_body_span: 84,
      cat_split_pin_neck_width: 18,
      cat_split_pin_head_width: 25,
      cat_split_pin_head_height: 19,
      cat_split_pin_tail_width: 8,
      cat_split_pin_tail_back_reach: 18,
      cat_split_pin_tail_rise: 27,
      cat_split_pin_upper_limb_width: 10,
      cat_split_pin_lower_limb_width: 7,
      show_cat_split_pin_debug: false,
      cat_direct_register_offset: 0,
      cat_paw_print_history: 12,
      cat_render_mode: "surface", // "skeleton" | "surface" | "silhouette"
      cat_pose: "stand", // "stand" | "sit" | "loaf" | "stretch" | "alert" | "rub"
      cat_head_shape: "anatomical", // "anatomical" | "circle" | "soft_profile" | "compact_hybrid"
      cat_facing: "left", // "left" | "right"

      // Cat world placement.
      // Scale is now back to 1: the tuned 0.7 size has been baked into the
      // rig defaults below.
      cat_x: 160,
      cat_y: 212,
      cat_scale: 1,

      // Cat focus/tuning helpers
      cat_tuning_enabled: true,
      cat_tuning_show_baseline: true,

      // High-level pose controls.
      // These are intended to become the nicer front-end for the constrained rig:
      // head position/angle, spine angle, paw placement, and mood.
      cat_mood: "neutral", // "neutral" | "alert" | "curious" | "relaxed" | "playful"
      cat_pose_control_blend: 1,
      cat_body_comfort_motion_only: true,

      // Body solver mode. "target_led" is the active path. "pose" remains as
      // a direct constrained fallback for debugging simple static poses.
      cat_body_solver_mode: "target_led", // "target_led" | "pose"

      // Target-led body response.
      // These are not pose preferences; they control how the body responds
      // when an interaction target pulls the head beyond comfortable neck reach.
      cat_neck_max_stretch_ratio: 2.2,
      cat_neck_rest_posture_blend: 0.72,
      cat_neck_rest_forward_ratio: 0.12,
      cat_neck_rest_lift_ratio: 1.12,
      cat_auto_head_carry_forward_ratio: 0.08,
      cat_auto_head_carry_lift_ratio: 1.18,
      cat_head_body_follow_strength: 0.55,
      cat_head_body_follow_hip_strength: 0.08,

      cat_spine_max_stretch_ratio: 1.22,
      cat_spine_min_compress_ratio: 0.86,
      cat_paw_unplant_ratio: 0.8,
      cat_paw_hang_length_ratio: 0.72,
      cat_paw_ground_capture_distance: 10,

      // Contact landing active-target bias.
      // This is deliberately stateless/interruption-friendly:
      // desired paw targets remain the base/config targets, while resolved paws
      // expose targetX/targetY as the active target for this frame.
      cat_paw_landing_enabled: true,
      cat_paw_landing_root_x_bias: 0,
      cat_front_paw_landing_forward_bias: 2.5,
      cat_rear_paw_landing_forward_bias: -2,
      cat_paw_landing_keep_old_target_bias: 0.15,
      cat_paw_support_min_body_separation_ratio: 0.36,

      // Persistent contact memory.
      // Base/config paw targets seed the first stance only. After that, paws
      // grip their latest planted target until reach/contact rules release them.
      cat_paw_contact_memory_enabled: true,

      // Basic gait/release arbitration.
      // This prevents every paw independently releasing as soon as it is
      // over-stretched. It is the first step towards a proper walk cycle.
      cat_gait_release_arbitration_enabled: true,
      cat_gait_max_released_paws: 1,
      cat_gait_release_cooldown_frames: 3,
      cat_gait_force_release_ratio: 1,
      cat_gait_clock_enabled: true,
      cat_gait_cycle_frames: 76,
      cat_gait_swing_ratio: 0.24,
      cat_gait_stride_length: 42,
      cat_gait_swing_lift_ratio: 0.18,
      cat_gait_swing_duration_scale: 1,

      // Support-state body response.
      // Temporarily disabled while gait/anatomy owns body motion. The old
      // hanging response yanked hips down during walking whenever support
      // briefly dropped below fully planted.
      cat_support_state_enabled: true,
      cat_support_body_response_enabled: false,
      cat_partly_supported_hang_blend: 0.45,
      cat_suspended_hang_blend: 1,
      cat_suspended_hip_drop_ratio: 0.95,
      cat_suspended_hip_back_ratio: 0.22,

      // Dynamic solved facing.
      // cat_facing remains the configured/default facing, but target-led mode
      // can derive the live facing from the solved body direction.
      cat_dynamic_facing_enabled: true,
      cat_dynamic_facing_deadband: 4,

      // Cat Rig v2 pose targets.
      // These are local, facing-aware controls used by the constrained solver.
      // Positive X values mean "towards the cat's front".
      // Positive Y values mean downwards in SVG space.
      //
      // Target-led calibration notes, June 2026:
      // - head_forward: 18 = flinched/squinched, 29 = neutral, 38 = sniffing
      // - head_lift: -21 = head near floor, 0 = neutral, 12 = upper-normal,
      //   30 = plausible high head once spine/body response improves
      // - head_tilt: -50 = looking down, -13 = neutral, 14 = roughly level
      // - front paw X: -15 = far back natural limit, 36 = near shoulder,
      //   50 = uncomfortable forward stretch
      // - rear paw X: -14 = straight/overextended, 0 = under butt,
      //   28 = close to front resting paw area
      // These are editor-friendly operating ranges, not hard anatomy limits.
      cat_v2_spine_angle: 0,
      cat_v2_spine_curve: 2,
      cat_v2_chest_height: 31,
      cat_v2_hip_height: 30,

      cat_v2_head_forward: 34,
      cat_v2_head_lift: 7,
      cat_v2_head_tilt: -2,

      cat_v2_front_near_paw_x: 37,
      cat_v2_front_near_paw_y: 0,
      cat_v2_front_far_paw_x: 45,
      cat_v2_front_far_paw_y: 0,

      cat_v2_rear_near_paw_x: 4,
      cat_v2_rear_near_paw_y: 0,
      cat_v2_rear_far_paw_x: -8,
      cat_v2_rear_far_paw_y: 0,

      // Soft anatomical constraints scaffold.
      // Keep off by default until the solver pass is added and tested.
      cat_constraints_enabled: false,
      cat_constraint_blend: 0.35,
      cat_length_constraint_blend: 0.4,
      cat_angle_constraint_blend: 0.25,
      cat_proportion_profile: "current_stand",

      // Proportion ratios, expressed against cat_body_length.
      // These are deliberately editable so we can tune towards the ideal cat.
      cat_ratio_body_height: 0.6,
      cat_ratio_neck_length: 0.18,
      cat_ratio_skull_width: 0.52,
      cat_ratio_skull_height: 0.3,
      cat_ratio_front_leg_length: 0.78,
      cat_ratio_rear_leg_length: 0.88,
      cat_ratio_tail_length: 0.9,

      // Front leg segment ratios, expressed against front leg length.
      cat_ratio_front_upper: 0.42,
      cat_ratio_front_lower: 0.36,
      cat_ratio_front_pastern: 0.16,

      // Rear leg segment ratios, expressed against rear leg length.
      cat_ratio_rear_upper: 0.32,
      cat_ratio_rear_lower: 0.49,
      cat_ratio_rear_foot: 0.36,

      // Soft angle targets.
      // Degrees are stored here for later use by the constraint pass.
      cat_front_elbow_rest_angle: 165,
      cat_front_wrist_rest_angle: 172,
      cat_rear_knee_rest_angle: 72,
      cat_rear_hock_rest_angle: 132,

      // Body / spine
      cat_body_length: 38,
      cat_body_height: 27.5,
      cat_body_slope: 0,
      cat_spine_curve: 7,
      cat_chest_lift: 0.7,
      cat_hip_lift: 0,

      // Explicit limb pivots.
      // These are hidden anatomical rig points rather than visible labels.
      cat_shoulder_joint_forward: 1,
      cat_shoulder_joint_drop: 7,
      cat_hip_joint_forward: 4,
      cat_hip_joint_drop: 5.6,

      // Neck
      cat_neck_length: 8.2,
      cat_neck_lift: 0,
      cat_neck_forward: 1.4,

      // Skull / cranium.
      // Legacy head aliases are preserved below for YAML compatibility.
      cat_skull_width: 23.7,
      cat_skull_height: 13.7,
      cat_skull_offset_x: -9.8,
      cat_skull_offset_y: -3.2,
      cat_skull_tilt: -6,
      cat_skull_roundness: 0.05,

      // Legacy head controls retained as aliases/fallbacks.
      cat_head_width: 23.7,
      cat_head_height: 13.7,
      cat_head_offset_x: -9.8,
      cat_head_offset_y: -3.2,

      // Authored SVG head template tuning.
      // The imported Illustrator head is authored as left-facing.
      // Rendering should mirror it only when cat_facing is "right".
      cat_head_template_fit_width: 520,
      cat_head_template_fit_height: 360,
      cat_head_template_offset_x: 0,
      cat_head_template_offset_y: 0,
      cat_head_template_scale: 1,

      // Muzzle / nasal bridge.
      // Currently legacy/parked while the authored SVG head is used visually.
      cat_muzzle_length: 1.4,
      cat_muzzle_height: 7.7,
      cat_muzzle_offset_y: 2.8,
      cat_muzzle_bridge_lift: 0.7,
      cat_muzzle_roundness: 0.2,
      cat_muzzle_thickness: 4.2,
      cat_nose_size: 0.28,

      // Lower jaw / mandible.
      // Visible jaw is the authored SVG jaw, with these values used for
      // pivot, mouth opening, and future animation.
      cat_jaw_length: 10.5,
      cat_jaw_height: 2.8,
      cat_jaw_pivot_x: -5.8,
      cat_jaw_pivot_y: 0,
      cat_jaw_angle: 0,

      // Mouth open is not scaled here because the authored SVG jaw renderer
      // currently uses it as an angular opening control.
      // Observed mouth calibration:
      // 3.5 = closed, 12 = slightly open, 20 = wide open.
      cat_mouth_open: 3.5,

      // Authored SVG jaw tuning
      cat_jaw_template_offset_x: -6.3,
      cat_jaw_template_offset_y: -1.4,
      cat_jaw_opacity: 1,

      // Face fill
      cat_head_fill_enabled: true,
      cat_head_fill_color: "var(--primary-text-color)",

      // Ears.
      // Front ear is softer/behind; rear ear gives the stronger silhouette.
      cat_front_ear_offset_x: 3.5,
      cat_front_ear_offset_y: -4.2,
      cat_front_ear_height: 3.5,
      cat_front_ear_width: 2.8,
      cat_front_ear_angle: 19,
      cat_front_ear_opacity: 0.35,

      cat_rear_ear_offset_x: -1.4,
      cat_rear_ear_offset_y: -4.2,
      cat_rear_ear_height: 3.5,
      cat_rear_ear_width: 2.8,
      cat_rear_ear_angle: 13,
      cat_rear_ear_opacity: 1,

      // Legacy ear controls retained as broad fallbacks.
      cat_ear_height: 3.5,
      cat_ear_width: 12.6,

      // Front legs:
      // shoulder joint -> elbow -> wrist -> paw
      cat_front_leg_length: 17.5,
      cat_front_paw_spread: 6.3,
      cat_front_paw_forward: -1.4,
      cat_front_far_paw_offset: 2.1,
      cat_front_leg_bend: -2.1,
      cat_front_elbow_forward: -2.1,
      cat_front_wrist_forward: -0.7,
      cat_front_wrist_height: 2.8,

      // Rear legs:
      // hip joint -> knee -> hock/ankle -> paw
      cat_rear_leg_length: 25.2,
      cat_rear_paw_spread: 11.2,
      cat_rear_paw_forward: 5.6,
      cat_rear_far_paw_offset: 3.5,
      cat_rear_leg_bend: 8.4,
      cat_rear_knee_forward: 7.7,
      cat_rear_hock_forward: -7.7,
      cat_rear_hock_height: 6.3,

      // Overall leg shaping
      cat_leg_bend_amount: 2.1,

      // Tail as spine continuation:
      // chest/scapula -> mid spine -> sacrum/tail base -> tail control -> mid -> tip
      cat_tail_length: 34,
      cat_tail_curve: -8,
      cat_tail_lift: -24,
      cat_tail_segments: 3,
      cat_tail_mid_lift_ratio: 0.52,
      cat_tail_mid_curve_ratio: 0.18,
      cat_tail_spine_follow: 0.65,
      cat_tail_base_angle: -26,
      cat_tail_tip_curl: 3,
      cat_tail_mood_enabled: true,
      cat_tail_follow_speed: 0.09,
      cat_tail_motion_lag: 0.55,
      cat_tail_walk_sway: 3,

      // Cat idle animation scaffold
      cat_idle_animation_enabled: true,
      cat_idle_breath_amount: 0.22,
      cat_idle_tail_flick_amount: 0.55,
      cat_idle_tail_flick_speed: 0.0009,
      cat_idle_head_look_amount: 0.35,

      // -----------------------------------------------------------------------
      // Debug visibility
      // -----------------------------------------------------------------------
      show_joints: false,
      show_leg_debug: true,
      show_pose_debug: false,

      show_poi_debug: false,
      show_poi_reach_debug: false,
      show_poi_state_debug: false,
      poi_debug_color: "var(--accent-color)",
      poi_debug_opacity: 0.35,

      show_hand_target_debug: false,
      show_hand_reach_debug: false,
      hand_target_debug_color: "var(--success-color)",
      hand_target_unreachable_color: "var(--error-color)",
      hand_target_debug_opacity: 0.7,

      // Cat debug
      show_cat_tuning_lab: false,
      cat_tuning_lab_default_section: "mood",
      cat_tuning_lab_collapsed: true,
      show_cat_debug: false,
      show_cat_debug_skeleton: false,
      show_cat_nodes: false,
      show_cat_body_nodes: false,
      show_cat_limb_nodes: false,
      show_cat_head_nodes: false,
      show_cat_tail_nodes: false,
      show_cat_ear_nodes: false,
      show_cat_body_contour_nodes: false,
      show_cat_body_contour_labels: false,
      show_cat_tail_surface_nodes: false,
      show_cat_tail_surface_labels: false,
      show_cat_collar_nodes: false,
      show_cat_collar_labels: false,
      show_cat_paw_contact_debug: false,
      show_cat_paw_print_debug: false,
      show_cat_motion_trace: false,
      show_cat_motion_trace_joints: false,
      cat_motion_trace_max_samples: 90,
      cat_motion_trace_sample_ms: 80,
      cat_motion_trace_opacity: 0.62,
      cat_motion_trace_space: "body_relative", // "body_relative" | "world"
      show_cat_support_debug_label: false,
      show_cat_skeleton: true,
      show_cat_belly_line: false,
      show_cat_mood_controls: false,
      show_cat_mood_debug_label: false,
      show_cat_bounds: false,
      cat_debug_color: "var(--accent-color)",
      cat_debug_opacity: 0.45,
      cat_debug_node_opacity: 0.45,
      cat_debug_label_opacity: 0.35,
      cat_debug_label_size: 3,
      cat_debug_paw_opacity: 0.8,
      cat_belly_line_opacity: 0.18,

      // Runtime-tunable cat render layers.
      show_cat_render_skeleton: false,
      cat_render_skeleton_opacity: 1,
      show_cat_render_body_surface: false,
      cat_render_body_surface_opacity: 1,
      show_cat_render_chest_surface: false,
      cat_render_chest_surface_opacity: 1,
      show_cat_render_body_contour_surface: true,
      cat_render_body_contour_surface_opacity: 1,
      show_cat_render_collar_surface: true,
      cat_render_collar_surface_opacity: 1,
      show_cat_render_rear_surface: true,
      cat_render_rear_surface_opacity: 1,
      show_cat_render_front_surface: true,
      cat_render_front_surface_opacity: 1,
      show_cat_render_topline: false,
      cat_render_topline_opacity: 1,
      show_cat_render_belly_surface: false,
      cat_render_belly_surface_opacity: 1,
      show_cat_render_tail_surface: true,
      cat_render_tail_surface_opacity: 1,
      show_cat_render_head: true,
      cat_render_head_opacity: 1,
      cat_surface_front_bend_roundness: 1,
      cat_surface_rear_bend_roundness: 1,
      cat_tail_surface_base_width: 0.59,
      cat_tail_surface_tip_width: 0.18,

      // -----------------------------------------------------------------------
      // Cat temporary fine-tune checkpoint values
      // -----------------------------------------------------------------------
      /*
        The Cat Tuning Lab writes temporary runtime overrides named:

          cat_ft_<surface>_<node>_x
          cat_ft_<surface>_<node>_y

        They intentionally default to "not present", which means zero offset.
        During tuning, copy the changed fine-tune readout from the on-card UI
        into this section if you want to preserve a checkpoint in code.

        These offsets are measuring tools, not the desired final architecture.
        Later, convert useful offsets into the underlying surface helpers:
        bodyContourSurfacePath, collarSurfacePath, tailSurfacePath, and future
        head/face surface helpers. See CAT_FINE_TUNE_NOTES.md.
      */

      cat_joint_band_preference_enabled: true,
      cat_joint_band_preference_weight: 0.22,

      cat_ft_body_contour_collarBack_x: -2,
      cat_ft_body_contour_collarBack_y: -2,
      
      cat_ft_collar_collarBackCorner_x: -0.9,
      cat_ft_collar_collarBackCorner_y: -1.5,
      cat_ft_collar_collarFrontControl_y: -2.9,
      cat_ft_collar_collarJawCorner_x: -2.7,
      cat_ft_collar_collarJawCorner_y: 2.7,
      cat_ft_collar_collarSkullCorner_x: 1.1,
      cat_ft_collar_collarSkullCorner_y: -1.6,

      cat_ft_body_contour_bellyControl_x: 1.6,
      cat_ft_body_contour_bellyControl_y: -1.5,
      cat_ft_body_contour_bellyStart_x: -4.3,
      cat_ft_body_contour_bellyStart_y: -0.5,
      cat_ft_body_contour_rearBellyAnchor_x: 1.2,
      cat_ft_body_contour_rearBellyAnchor_y: 1,

      cat_ft_tail_surface_tailBaseEdgeA_x: -2.6,
      cat_ft_tail_surface_tailBaseEdgeA_y: 1,
      cat_ft_tail_surface_tailBaseEdgeB_x: -1.6,
      cat_ft_tail_surface_tailBaseEdgeB_y: 1.2,

      // Cat contact/debug state colours.
      // Used by paw/contact debug and can later be reused by support zones,
      // landing candidates, gait debug, and interaction targets.
      cat_debug_planted_color: "var(--success-color)",
      cat_debug_landing_color: "var(--warning-color)",
      cat_debug_hanging_color: "var(--info-color)",
      cat_debug_unknown_contact_color: "var(--secondary-text-color)",

      // -----------------------------------------------------------------------
      // Shared style
      // -----------------------------------------------------------------------
      line_color: "var(--primary-text-color)",
      line_width: 6,
      joint_color: "var(--primary-text-color)",
      joint_size: 4,
      head_fill: "none",

      floor_color: "var(--primary-text-color)",
      floor_opacity: 0.18,
      floor_width: 2,

      stage_background: true,
      stage_radius: 18,

      // Cat style
      cat_line_color: "var(--primary-text-color)",
      cat_line_width: 4,
      cat_node_color: "var(--accent-color)",
      cat_node_size: 0.8,
      cat_fill: "none",
      cat_silhouette_fill: "var(--primary-text-color)",
      cat_opacity: 1,
    };
  }

  static getStubConfig() {
    return StickPetCard.defaults();
  }

  // ===========================================================================
  // 2. Visual editor form
  // ===========================================================================
  /*
    Visual editor philosophy

    The editor should stay intentionally small while this project is evolving.

    Keep in the UI:
    - General card/view controls
    - Basic scene visibility
    - Cat focus controls
    - Basic cat mode / interaction controls
    - Debug layer toggles

    Keep YAML-only for now:
    - Dude body proportions
    - Cat anatomy / posture / gait tuning
    - Legacy and candidate cat solvers
    - Legacy gait tuning
    - Advanced POI behaviour
    - Arm/IK tuning
    - Detailed style controls

    This stops the editor becoming a dumping ground for every experimental
    parameter while still allowing fast iteration where it matters.
  */

  static getConfigForm() {
    const n = StickPetCard.numberField;
    const b = StickPetCard.booleanField;
    const t = StickPetCard.textField;
    const s = StickPetCard.selectField;
    const g = StickPetCard.editorGroup;

    return {
      schema: [
        g("general", "General", "mdi:account-child-outline", [
          t("title"),
          n("height", 160, 800, 10),
          s("view_mode", [
            ["world", "World"],
            ["cat_focus", "Cat focus"],
            ["dude_focus", "Dude focus"],
          ]),
        ]),

        g("visibility", "Visibility", "mdi:eye-outline", [
          b("show_dude"),
          b("show_cat"),
          b("show_pois"),
          b("show_environment"),
          b("show_floor"),
        ]),

        g("cat_focus", "Cat focus mode", "mdi:cat", [
          n("cat_focus_scale", 0.5, 8, 0.05),
          n("cat_focus_padding", 0, 120, 1),
          b("cat_focus_hide_dude"),
          b("cat_focus_hide_pois"),
          b("cat_focus_hide_head_path"),
        ]),

        g("cat", "Cat", "mdi:cat", [
          b("cat_enabled"),
          s("cat_render_mode", [
            ["skeleton", "Skeleton"],
            ["surface", "Surface"],
            ["silhouette", "Silhouette"],
          ]),
          s("cat_drag_mode", [
            ["head", "Head"],
            ["scruff", "Scruff"],
            ["nearest", "Nearest target"],
          ]),
          b("cat_interaction_enabled"),
          b("cat_drag_enabled"),
          b("cat_auto_wander"),
          b("show_cat_tuning_lab"),
          b("show_cat_mood_controls"),
        ]),

        g("debug", "Debug layers", "mdi:bug-outline", [
          b("show_head_path"),
          b("show_joints"),
          b("show_leg_debug"),
          b("show_pose_debug"),

          b("show_poi_debug"),
          b("show_poi_reach_debug"),
          b("show_poi_state_debug"),

          b("show_hand_target_debug"),
          b("show_hand_reach_debug"),

          b("show_cat_debug"),
          b("show_cat_nodes"),
          b("show_cat_skeleton"),
          b("show_cat_mood_debug_label"),
          b("show_cat_bounds"),
        ]),
      ],
      computeLabel: StickPetCard.label,
      computeHelper: StickPetCard.helper,
    };
  }

  static editorGroup(name, title, icon, schema) {
    return {
      type: "expandable",
      name,
      title,
      icon,
      flatten: true,
      schema,
    };
  }

  static fieldDefault(name) {
    return StickPetCard.defaults()[name];
  }

  static numberField(name, min, max, step, mode = "box") {
    return {
      name,
      default: StickPetCard.fieldDefault(name),
      selector: {
        number: {
          min,
          max,
          step,
          mode,
        },
      },
    };
  }

  static booleanField(name) {
    return {
      name,
      default: StickPetCard.fieldDefault(name),
      selector: {
        boolean: {},
      },
    };
  }

  static textField(name) {
    return {
      name,
      default: StickPetCard.fieldDefault(name),
      selector: {
        text: {},
      },
    };
  }

  static selectField(name, options) {
    return {
      name,
      default: StickPetCard.fieldDefault(name),
      selector: {
        select: {
          mode: "dropdown",
          options: options.map(([value, label]) => ({ value, label })),
        },
      },
    };
  }

  static label(schema) {
    const labels = {
      title: "Title",
      height: "Card height",
      view_mode: "View mode",

      show_dude: "Show dude",
      show_cat: "Show cat",
      show_pois: "Show POIs",
      show_environment: "Show environment",
      show_floor: "Show floor",

      cat_focus_scale: "Cat focus scale",
      cat_focus_padding: "Cat focus padding",
      cat_focus_hide_dude: "Hide dude in cat focus",
      cat_focus_hide_pois: "Hide POIs in cat focus",
      cat_focus_hide_head_path: "Hide head path in cat focus",

      cat_enabled: "Enable cat",
      cat_render_mode: "Cat render mode",
      cat_drag_mode: "Cat drag target",
      cat_interaction_enabled: "Cat interaction",
      cat_drag_enabled: "Cat dragging",
      cat_auto_wander: "Cat auto-wander",
      show_cat_tuning_lab: "Show on-card tuning UI",
      show_cat_mood_controls: "Show cat mood controls",

      show_head_path: "Show walk/head path",
      show_joints: "Show dude joints",
      show_leg_debug: "Show leg debug",
      show_pose_debug: "Show pose debug",
      show_poi_debug: "Show POI debug",
      show_poi_reach_debug: "Show POI reach zones",
      show_poi_state_debug: "Show POI state labels",
      show_hand_target_debug: "Show hand target debug",
      show_hand_reach_debug: "Show hand reach debug",
      show_cat_debug: "Show cat debug",
      show_cat_nodes: "Show cat nodes",
      show_cat_skeleton: "Show cat skeleton",
      show_cat_mood_debug_label: "Show cat mood label",
      show_cat_bounds: "Show cat bounds",
    };

    return labels[schema.name] || schema.title || schema.name;
  }

  static helper(schema) {
    const helpers = {
      height: "Overall card height in pixels.",
      view_mode:
        "World shows the normal scene. Cat focus follows the cat for tuning.",
      cat_drag_mode:
        "Nearest target uses the closest named cat interaction target.",
      show_cat_tuning_lab:
        "Shows the live tuning panel on the card itself. Leave off for a cleaner default card.",
    };

    return helpers[schema.name] || "";
  }

  // ===========================================================================
  // 3. Lifecycle, runtime state, and Home Assistant integration
  // ===========================================================================
  /*
    Runtime state is grouped around the main systems:

    - Dude movement:
      current head position, desired head position, planned path, velocity.

    - Dude stepping:
      planted feet, active foot step, step cooldown, idle pose settling.

    - POI/interaction:
      current movement type, current POI, local POI state, action guards.

    - Temporary attention POIs:
      short-lived "look here" world signals created by clicking/tapping.

    - Hand reach:
      per-hand blend state for desired POI hand targets.

    - Cat:
      placeholder state for the upcoming rig, pose, and focus workflow.

    The important rule: config describes the world; runtime state describes what
    the characters are currently doing inside that world.
  */

  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this.c = StickPetCard.defaults();

    const standingY = this.getEffectiveStandingY(this.c);

    // -----------------------------------------------------------------------
    // Dude movement state
    // -----------------------------------------------------------------------
    this.currentHead = {
      x: Number(this.c.figure_x),
      y: standingY,
    };

    this.desiredHead = {
      x: this.currentHead.x,
      y: this.currentHead.y,
    };

    this.segmentStartHead = { ...this.currentHead };
    this.velocity = { x: 0, y: 0 };
    this.motionPath = [];
    this.pathIndex = 0;

    // -----------------------------------------------------------------------
    // Animation handles and layout observers
    // -----------------------------------------------------------------------
    this.raf = null;
    this.idleRaf = null;
    this.wanderTimer = null;
    this.attentionPoiTimer = null;
    this.resizeObserver = null;
    this.measuredWorldWidth = null;

    // Pointer interaction handlers are bound once so they can be added/removed.
    this._catPointerMoveHandler = (event) => this.handlePointerMove(event);
    this._catPointerUpHandler = (event) => this.handlePointerUp(event);
    this._suppressNextClick = false;

    // -----------------------------------------------------------------------
    // Dude stepping / idle pose state
    // -----------------------------------------------------------------------
    this.feet = null;
    this.activeStep = null;
    this.stepCooldown = 0;
    this.lastStepFoot = null;
    this.idleFinalStepUsed = false;

    this.idlePoseState = {
      active: false,
      phase: "none",
      bodyBlend: 0,
    };

    // -----------------------------------------------------------------------
    // POI / goal / local action state
    // -----------------------------------------------------------------------
    this.currentMoveKind = "random";
    this.currentPoi = null;
    this.currentMoveActionHandled = false;
    this.lastCompletedPoiId = null;
    this.poiLocalState = {};

    // -----------------------------------------------------------------------
    // Temporary attention POI state
    // -----------------------------------------------------------------------
    this.temporaryPois = [];

    // -----------------------------------------------------------------------
    // Desired hand target / reach state
    // -----------------------------------------------------------------------
    this.handReachState = {
      left: 0,
      right: 0,
    };

    // -----------------------------------------------------------------------
    // Cat runtime scaffold
    // -----------------------------------------------------------------------
    this.catState = this.createInitialCatState();
  }

  createInitialCatState() {
    return {
      pose: String(this.c.cat_pose || "stand"),
      renderMode: String(this.c.cat_render_mode || "skeleton"),
      lastPose: null,
      rig: null,
      bounds: null,
      liveMood: null,
      livePose: null,
      poseEditing: false,
      tuningSection: String(this.c.cat_tuning_lab_default_section || "mood"),
      tuningCollapsed: this.bool(this.c.cat_tuning_lab_collapsed),
      tuningOverrides: {},
      movementTest: {
        continuousWalk: false,
        paused: false,
        direction: 1,
      },
      idlePhase: 0,
      lastFrameTime: performance.now(),
      pendingAttentionPoi: null,
      limbSolveMemory: {},
      motionTrace: {
        samples: [],
        lastSampleAt: 0,
      },

      // Last solved direction. Used as hysteresis/fallback so dynamic facing
      // does not flicker when the body is almost vertical.
      solvedFrontSign:
        typeof this.getCatFacingSign === "function"
          ? this.getCatFacingSign()
          : String(this.c.cat_facing || "left") === "right"
            ? 1
            : -1,

      /*
        Universal interaction model for the cat.

        interactionTargets:
        - named anchors/zones on the solved cat rig
        - rebuilt from the current rig
        - examples: head, scruff, back, paws, tail tip

        targetOverrides:
        - temporary world-space desired targets
        - consumed by solvers/planners
        - examples: dragged head target, paw placement, tail tip loiter target

        interactionSession:
        - the live interaction currently in progress
        - examples: dragging, petting, picking up, paw shake
      */
      interactionTargets: {},

      targetOverrides: {
        head: null,
        scruff: null,
        back: null,
        frontPawNear: null,
        frontPawFar: null,
        rearPawNear: null,
        rearPawFar: null,
        tailTip: null,
      },

      pawContact: {
        frontNear: this.createCatPawContactSlot("frontNear"),
        frontFar: this.createCatPawContactSlot("frontFar"),
        rearNear: this.createCatPawContactSlot("rearNear"),
        rearFar: this.createCatPawContactSlot("rearFar"),
      },

      directRegister: {
        frontPrints: {
          frontNear: [],
          frontFar: [],
        },
        scores: [],
        lastScore: null,
      },

      gait: {
        frame: 0,
        phase: 0,
        clockPaw: null,
        clockMoving: false,
        clockSpeed: 0,
        phaseAdvance: 0,
        clockRoot: null,
        lastReleasedPaw: null,
        lastReleasedFrame: -9999,
        releaseCooldown: 0,
        releaseSequence: ["rearNear", "frontNear", "rearFar", "frontFar"],
        lastReleasePlan: null,
      },

      tail: {
        idealTip: null,
        smoothedTip: null,
        phase: 0,
        lastBase: null,
      },

      interactionSession: {
        active: false,
        type: null, // "drag_target" | "pet" | "pick_up" | "reach" | later
        targetId: null, // "head" | "scruff" | "back" | "frontPawNear" | etc.
        pointerId: null,
        startWorld: null,
        currentWorld: null,
        source: null, // usually "pointer"; later could be "dude" or "poi"
      },

      autoWander: {
        active: false,
        target: null,
        idleUntil: 0,
        raf: null,
        lastFrameTime: null,
      },
    };
  }


  setConfig(config) {
    this.cancelAutoWander();

    if (this.stopCatAutoWander) {
      this.stopCatAutoWander({ clearOverride: true });
    }

    if (this.attentionPoiTimer) {
      window.clearTimeout(this.attentionPoiTimer);
      this.attentionPoiTimer = null;
    }

    this.c = {
      ...StickPetCard.defaults(),
      ...(config || {}),
    };

    const standingY = this.getEffectiveStandingY(this.c);

    // -----------------------------------------------------------------------
    // Reset dude movement to configured start position
    // -----------------------------------------------------------------------
    this.currentHead = {
      x: Number(this.c.figure_x),
      y: this.clampHeadY(standingY),
    };

    this.desiredHead = {
      x: this.currentHead.x,
      y: this.currentHead.y,
    };

    this.segmentStartHead = { ...this.currentHead };
    this.velocity = { x: 0, y: 0 };
    this.motionPath = [];
    this.pathIndex = 0;

    // -----------------------------------------------------------------------
    // Reset animation handles
    // -----------------------------------------------------------------------
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = null;

    if (this.idleRaf) cancelAnimationFrame(this.idleRaf);
    this.idleRaf = null;

    // -----------------------------------------------------------------------
    // Reset stepping / idle pose state
    // -----------------------------------------------------------------------
    this.resetFeet();
    this.activeStep = null;
    this.stepCooldown = 0;
    this.lastStepFoot = null;
    this.idleFinalStepUsed = false;

    this.idlePoseState = {
      active: true,
      phase: "settling_body",
      bodyBlend: 1,
    };

    // -----------------------------------------------------------------------
    // Reset POI / action state
    // -----------------------------------------------------------------------
    this.currentMoveKind = "random";
    this.currentPoi = null;
    this.currentMoveActionHandled = false;
    this.lastCompletedPoiId = null;
    this.poiLocalState = {};

    // -----------------------------------------------------------------------
    // Reset temporary attention POI state
    // -----------------------------------------------------------------------
    this.temporaryPois = [];
    this.attentionPoiTimer = null;

    // -----------------------------------------------------------------------
    // Reset hand reach state
    // -----------------------------------------------------------------------
    this.handReachState = {
      left: 0,
      right: 0,
    };

    // -----------------------------------------------------------------------
    // Reset cat runtime scaffold
    // -----------------------------------------------------------------------
    this.catState = this.createInitialCatState();

    // The comparison view owns independent child card instances.  It must not
    // also initialise the parent world's animation/update pipeline.
    if (this.isCatCandidateComparisonMode()) {
      this.render();
      return;
    }

    this.render();
    this.updateSkeleton();
    this.updateHeadPath();

    if (this.updateAttentionPoiLayer) this.updateAttentionPoiLayer();
    if (this.updateCatLayer) this.updateCatLayer();
    if (this.updateCatDebugLayer) this.updateCatDebugLayer();

    window.setTimeout(() => {
      this.scheduleAutoWander();
      this.startIdleAnimation();
      this.startCatAutoWander();
    }, 0);
  }

  set hass(hass) {
    this._hass = hass;

    if (this.isCatCandidateComparisonMode()) {
      this.shadowRoot
        ?.querySelectorAll?.("stick-pet-card[data-candidate-model]")
        .forEach((card) => {
          card.hass = hass;
        });
    }
  }

  connectedCallback() {
    if (this.isCatCandidateComparisonMode()) {
      // setConfig() owns the comparison grid. Rebuilding it again here would
      // create and start nine child cards twice during initial attachment.
      return;
    }

    this.updateSkeleton();

    if (this.updateAttentionPoiLayer) this.updateAttentionPoiLayer();
    if (this.updateCatLayer) this.updateCatLayer();
    if (this.updateCatDebugLayer) this.updateCatDebugLayer();

    window.setTimeout(() => {
      this.scheduleAutoWander();
      this.startIdleAnimation();
      this.startCatAutoWander();
    }, 0);
  }

  disconnectedCallback() {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = null;

    if (this.idleRaf) cancelAnimationFrame(this.idleRaf);
    this.idleRaf = null;

    if (this.attentionPoiTimer) {
      window.clearTimeout(this.attentionPoiTimer);
      this.attentionPoiTimer = null;
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    window.removeEventListener("pointermove", this._catPointerMoveHandler);
    window.removeEventListener("pointerup", this._catPointerUpHandler);
    window.removeEventListener("pointercancel", this._catPointerUpHandler);

    this.cancelAutoWander();

    if (this.stopCatAutoWander) {
      this.stopCatAutoWander({ clearOverride: true });
    }
  }

  getCardSize() {
    return Math.ceil((Number(this.c.height) || 420) / 50);
  }

  getGridOptions() {
    const rows = Math.max(1, Math.round(Number(this.c.grid_rows) || 7));
    const minRows = Math.max(1, Math.round(Number(this.c.grid_min_rows) || 4));

    const rawColumns = this.c.grid_columns;
    const columns =
      String(rawColumns) === "full"
        ? "full"
        : this.clamp(Math.round(Number(rawColumns) || 12), 1, 12);

    const minColumns = this.clamp(
      Math.round(Number(this.c.grid_min_columns) || 6),
      1,
      12
    );

    return {
      rows,
      columns,
      min_rows: minRows,
      min_columns: minColumns,
    };
  }

  // ===========================================================================
  // 4. Rendering and SVG shell
  // ===========================================================================
  /*
    Rendering responsibilities in this section:

    - Build the static SVG/DOM shell.
    - Create named layers for environment, POIs, attention POIs, cat, dude,
      and debug overlays.
    - Apply view-mode visibility rules.
    - Prepare cat-focus mode so cat design can be iterated quickly.
    - Keep actual character solving/rendering in later dedicated sections.

    Layer order is intentional:

    guides / path
    environment
    POIs
    temporary attention POIs
    cat
    dude
    debug overlays

    The cat is placed behind the dude for now. Later, if rubbing/overlap matters,
    the cat renderer can split into behind/in-front sublayers.

    Attention POIs are temporary "look here" world signals created by clicking
    or tapping. For now they can still move the dude, but structurally they are
    treated as POI-like objects that any character may later investigate.
  */

  isCatCandidateComparisonMode() {
    return this.bool(this.getCatRuntimeConfigValue("show_cat_candidate_array", this.c?.show_cat_candidate_array)) || ["cat_candidate_comparison", "cat_static_anatomy_comparison"].includes(
      String(this.c?.view_mode || "")
    );
  }

  getCatCandidateComparisonSpecs() {
    /*
      Kept as explicit model/config pairs rather than cloning one live rig.
      Every tile is a full Stick Pet child card, so a comparison represents the
      candidates' real solvers and wander loops rather than a static mock-up.
    */
    if (this.isViewMode("cat_static_anatomy_comparison")) {
      return [
        { label: "V12 contoured candidate", model: "feline_v12_contoured_split_pin_static", static: true },
        {
          label: "V14 domestic + independent tail",
          model: "feline_v14_decoupled_tail_static",
          static: true,
          art: { cat_split_pin_torso_depth: 18, cat_split_pin_haunch_depth: 21 },
        },
        {
          label: "V15 balanced domestic",
          model: "feline_v15_balanced_domestic_static",
          static: true,
          art: { cat_split_pin_body_span: 32, cat_split_pin_torso_depth: 20, cat_split_pin_haunch_depth: 24 },
        },
      ];
    }

    return [
      { label: "OG", model: "og" },
      { label: "V1 direct register", model: "feline_v1_direct_register" },
      { label: "V2 smooth", model: "feline_v2_smooth_direct_register" },
      {
        label: "V3 flow",
        model: "feline_v3_flow_direct_register",
        gait: { cat_gait_cycle_frames: 92, cat_gait_swing_ratio: 0.4, cat_gait_swing_lift_ratio: 0.33, cat_gait_swing_duration_scale: 1.35 },
      },
      { label: "V4 compact", model: "feline_v4_compact_direct_register" },
      { label: "V5 compact head", model: "feline_v5_compact_head_direct_register" },
      { label: "V6 landmark mass", model: "feline_v6_articulated_direct_register" },
      { label: "V7 restrained mass", model: "feline_v7_refined_articulated_direct_register" },
      {
        label: "V8 tucked candidate", model: "feline_v8_tucked_articulated_direct_register",
        gait: { cat_gait_cycle_frames: 96, cat_gait_swing_ratio: 0.42, cat_gait_stride_length: 31, cat_gait_swing_lift_ratio: 0.26, cat_gait_swing_duration_scale: 1.3 },
      },
      {
        label: "V9 flowing limbs", model: "feline_v9_flowing_articulated_direct_register",
        gait: { cat_gait_cycle_frames: 96, cat_gait_swing_ratio: 0.42, cat_gait_stride_length: 31, cat_gait_swing_lift_ratio: 0.26, cat_gait_swing_duration_scale: 1.3 },
      },
      { label: "V25 old reference study", model: "feline_v25_reference_static", static: true },
      { label: "V27 clean mass study", model: "feline_v27_clean_mass_static", static: true },
      { label: "V28 domestic cut-out", model: "feline_v28_domestic_cutout_static", static: true },
      { label: "V29 traced silhouette", model: "feline_v29_traced_static", static: true },
      { label: "V30 reference template", model: "feline_v30_reference_template", static: true },
      { label: "V31 limb study", model: "feline_v31_reference_limb_study", static: true },
      { label: "V32 anatomical study", model: "feline_v32_anatomical_study", static: true },
      { label: "V33 jointed pose study", model: "feline_v33_jointed_pose_study", static: true },
      { label: "V34 filled limb skin", model: "feline_v34_filled_limb_skin", static: true },
      { label: "V35 proportion study", model: "feline_v35_proportion_study", static: true },
      { label: "V36 grounded leg study", model: "feline_v36_grounded_leg_study", static: true },
      { label: "V37 overlap study", model: "feline_v37_overlap_study", static: true },
      { label: "V38 low neck study", model: "feline_v38_low_neck_study", static: true },
      { label: "V39 articulated limb skin", model: "feline_v39_articulated_limb_skin", static: true },
      { label: "V40 landmark limb study", model: "feline_v40_landmark_limb_skin", static: true },
      { label: "V41 raised landmark limbs", model: "feline_v41_raised_landmark_limbs", static: true },
      { label: "V42 continuous cut-out", model: "feline_v42_continuous_cutout", static: true },
      { label: "V43 overlay limb skins", model: "feline_v43_overlay_limb_skins", static: true },
      { label: "V44 reference trace", model: "feline_v44_reference_trace_static", static: true },
      { label: "V45 elevated profile trace", model: "feline_v45_elevated_profile_static", static: true },
      { label: "V46 image-traced walk", model: "feline_v46_image_traced_walk_static", static: true },
      { label: "V47 traced reference boundary", model: "feline_v47_reference_boundary_static", static: true },
      { label: "V48 softened reference trace", model: "feline_v48_soft_reference_trace_static", static: true },
      { label: "V49 high-resolution reference trace", model: "feline_v49_highres_reference_trace_static", static: true },
      { label: "V50 traced layer rig", model: "feline_v50_trace_layer_rig", static: true },
      { label: "V51 traced limb rig", model: "feline_v51_trace_limb_rig", static: true },
      { label: "V52 traced limb reach test", model: "feline_v52_trace_limb_reach_test", static: true },
      { label: "V53 traced limb skins", model: "feline_v53_trace_limb_skins", static: true },
      { label: "V54 overlapped limb skins", model: "feline_v54_overlapped_limb_skins", static: true },
      { label: "V55 segmented limb skins", model: "feline_v55_segmented_limb_skins", static: true },
      { label: "V56 lifted-belly limb study", model: "feline_v56_lifted_belly_limb_study", static: true },
      { label: "V57 four-chain limb study", model: "feline_v57_four_chain_limb_study", static: true },
      { label: "V58 traced contour layers", model: "feline_v58_traced_contour_layers", static: true },
      { label: "V59 trace IK walk", model: "feline_v59_trace_ik_walk", static: true },
      { label: "Pixel feline V1", model: "pixel_feline_v1", static: true },
    ];
  }

  renderCatCandidateComparison() {
    const c = this.c;
    const specs = this.getCatCandidateComparisonSpecs();
    const tileHeight = this.clamp(Math.round(Number(c.cat_comparison_tile_height || 190)), 150, 280);
    const heading = c.title || "Cat candidate comparison";
    const staticComparison = this.isViewMode("cat_static_anatomy_comparison");

    this.shadowRoot.innerHTML = `
      <ha-card class="cat-candidate-comparison">
        <div class="comparison-header"><div class="comparison-title">${this.esc(heading)}</div><button type="button" class="comparison-return" data-cat-candidate-return="1">return to card</button></div>
        <div class="comparison-note">${staticComparison ? "Frozen anatomy comparison · gait deliberately disabled" : "Independent walking instances · OG → V9"}</div>
        <div class="comparison-grid ${staticComparison ? "static" : ""}">
          ${specs
            .map(
              (spec) => `
                <stick-pet-card
                  class="comparison-tile"
                  data-candidate-model="${spec.model}"
                  aria-label="${this.esc(spec.label)} candidate"
                ></stick-pet-card>
              `
            )
            .join("")}
        </div>
      </ha-card>
      <style>
        :host { display: block; }
        ha-card { display: block; padding: 12px; overflow: hidden; }
        .comparison-header { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
        .comparison-title { font-size: 16px; font-weight: 650; color: var(--primary-text-color); }
        .comparison-return { border: 1px solid color-mix(in srgb, var(--primary-text-color) 25%, transparent); border-radius: 6px; background: transparent; color: inherit; padding: 4px 7px; font: inherit; font-size: 12px; cursor: pointer; }
        .comparison-note { margin: 2px 0 10px; color: var(--secondary-text-color); font-size: 12px; }
        .comparison-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; }
        .comparison-grid.static { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .comparison-tile { min-width: 0; height: ${tileHeight}px; }
        @media (max-width: 560px) { .comparison-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
      </style>
    `;

    this.shadowRoot.querySelectorAll("stick-pet-card[data-candidate-model]").forEach((card, index) => {
      const spec = specs[index];
      card.setConfig({
        title: spec.label,
        view_mode: "cat_focus",
        height: tileHeight,
        show_dude: false,
        show_cat: true,
        cat_enabled: true,
        cat_model: spec.model,
        cat_pose: "stand",
        cat_auto_wander: !spec.static,
        cat_wander_min_idle_ms: spec.static ? 999999 : 0,
        cat_wander_max_idle_ms: spec.static ? 999999 : 0,
        cat_wander_min_x: 22,
        cat_wander_max_x: 148,
        cat_wander_head_speed: 0.20,
        auto_wander: false,
        show_cat_debug: false,
        ...(spec.static
          ? {
              cat_body_solver_mode: "pose",
              cat_facing: "right",
              cat_gait_enabled: false,
              cat_split_pin_body_span: 34,
              cat_split_pin_torso_depth: 16,
              cat_split_pin_haunch_depth: 18,
              cat_split_pin_neck_width: 9,
              cat_split_pin_head_width: 13,
              cat_split_pin_head_height: 10,
              cat_split_pin_tail_width: 3.5,
              cat_split_pin_upper_limb_width: 4.5,
              cat_split_pin_lower_limb_width: 3,
            }
          : {}),
        ...(spec.art || {}),
        ...(spec.gait || {}),
      });
      card.hass = this._hass;
    });
    this.shadowRoot.querySelector("[data-cat-candidate-return]")?.addEventListener("click", (event) => {
      event.preventDefault();
      this.setCatRuntimeConfigValue("show_cat_candidate_array", false);
      this.render();
    });
  }

  render() {
    if (this.isCatCandidateComparisonMode()) {
      this.renderCatCandidateComparison();
      return;
    }

    const c = this.c;
    const scale = Number(c.scale) || 1;
    const trueWander = this.isCatTrueWanderMode();
    const trueWanderOverflow = this.shouldAllowCatTrueWanderOverflow();
    const worldWidth = this.getWorldWidth();
    const worldHeight = this.getWorldHeight();
    const worldCentreX = worldWidth / 2;
    const worldCentreY = worldHeight / 2;
    const worldPaddingX = this.getWorldPaddingX();

    const worldTransform = this.getWorldViewTransform({
      worldWidth,
      worldHeight,
      worldCentreX,
      worldCentreY,
      scale,
    });

    const showDude = this.shouldRenderDude();
    const showCat = this.shouldRenderCat();
    const showPois = this.shouldRenderPois();
    const showEnvironment = this.shouldRenderEnvironment();
    const showFloor = this.shouldRenderFloor();
    const showHeadPath = this.shouldRenderHeadPath();
    const showAttentionPois = this.shouldRenderAttentionPois();

    this.shadowRoot.innerHTML = `
      <ha-card>
        <div class="card">
          ${c.title ? `<div class="title">${this.esc(c.title)}</div>` : ""}

          <div class="stage">
            <svg
              class="svg"
              viewBox="0 0 ${worldWidth} ${worldHeight}"
              role="img"
              aria-label="Stick pet character world"
            >
              <g
                id="world"
                transform="${worldTransform}"
              >
                <g id="guides"></g>

                <g
                  id="headPath"
                  style="display: ${showHeadPath ? "inline" : "none"};"
                ></g>

                <g
                  id="environmentLayer"
                  style="display: ${showEnvironment ? "inline" : "none"};"
                >
                  ${
                    showFloor
                      ? `
                        <line
                          id="floor"
                          x1="${worldPaddingX}"
                          y1="${Number(c.floor_y)}"
                          x2="${worldWidth - worldPaddingX}"
                          y2="${Number(c.floor_y)}"
                          class="floor"
                        />
                      `
                      : ""
                  }
                </g>

                <g
                  id="poiLayer"
                  style="display: ${showPois ? "inline" : "none"};"
                ></g>

                <g
                  id="attentionPoiLayer"
                  style="display: ${showAttentionPois ? "inline" : "none"};"
                ></g>

                <g
                  id="catLayer"
                  style="display: ${showCat ? "inline" : "none"};"
                ></g>

                <g
                  id="figure"
                  style="display: ${showDude ? "inline" : "none"};"
                >
                  <g id="legDebug"></g>

                  <circle id="head" class="head" />

                  <line id="neckLine" class="limb" />
                  <line id="torsoLine" class="limb" />

                  <line id="shoulderLine" class="limb" />
                  <line id="hipLine" class="limb" />

                  <line id="leftUpperArm" class="limb" />
                  <line id="leftLowerArm" class="limb" />
                  <line id="rightUpperArm" class="limb" />
                  <line id="rightLowerArm" class="limb" />

                  <line id="leftUpperLeg" class="limb" />
                  <line id="leftLowerLeg" class="limb" />
                  <line id="rightUpperLeg" class="limb" />
                  <line id="rightLowerLeg" class="limb" />

                  <g id="joints"></g>
                </g>

                <g id="poseDebug"></g>
                <g id="poiDebugLayer"></g>
                <g id="handTargetDebugLayer"></g>
                <g id="catDebugLayer"></g>
              </g>
            </svg>

            ${this.renderCatMoodControls()}
            ${this.renderCatTuningLab()}
          </div>
        </div>
      </ha-card>

      <style>
        :host {
          display: block;
          height: 100%;
        }

        ha-card {
          height: 100%;
          min-height: ${Number(c.height) || 420}px;
          overflow: ${trueWanderOverflow ? "visible" : "hidden"};
          background: ${
            trueWander
              ? "transparent"
              : "var(--ha-card-background, var(--card-background-color, white))"
          };
          box-shadow: ${trueWander ? "none" : "var(--ha-card-box-shadow, none)"};
          border: ${trueWander ? "none" : "var(--ha-card-border-width, 0) solid var(--ha-card-border-color, transparent)"};
          cursor: ${this.bool(c.animate_on_tap) ? "pointer" : "default"};
        }

        .card {
          height: 100%;
          min-height: ${Number(c.height) || 420}px;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          padding: ${trueWander ? "0" : "14px"};
        }

        .title {
          font-size: 16px;
          font-weight: 600;
          color: var(--primary-text-color);
          margin-bottom: 8px;
          opacity: 0.9;
        }

        .stage {
          position: relative;
          flex: 1;
          min-height: 0;
          border-radius: ${trueWander ? "0" : `${Number(c.stage_radius)}px`};
          overflow: ${trueWanderOverflow ? "visible" : "hidden"};
          background: ${
            trueWander
              ? "transparent"
              : this.bool(c.stage_background)
                ? `radial-gradient(circle at 50% 18%, rgba(255,255,255,0.08), transparent 34%), rgba(127,127,127,0.04)`
                : "transparent"
          };
        }

        .svg {
          width: 100%;
          height: 100%;
          display: block;
        }

        .cat-mood-controls {
          position: absolute;
          top: 8px;
          right: 8px;
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          justify-content: flex-end;
          max-width: min(360px, calc(100% - 16px));
          z-index: 3;
          pointer-events: auto;
        }

        .cat-mood-button {
          appearance: none;
          border: 1px solid color-mix(in srgb, var(--primary-text-color) 28%, transparent);
          background: color-mix(in srgb, var(--card-background-color, white) 84%, transparent);
          color: var(--primary-text-color);
          border-radius: 999px;
          padding: 3px 8px;
          min-height: 24px;
          font: inherit;
          font-size: 11px;
          line-height: 1;
          cursor: pointer;
          opacity: 0.72;
        }

        .cat-mood-button.active {
          background: var(--primary-text-color);
          color: var(--card-background-color, white);
          opacity: 0.92;
        }

        .cat-tuning-lab {
          position: absolute;
          left: 8px;
          bottom: 8px;
          width: min(390px, calc(100% - 16px));
          max-height: calc(100% - 16px);
          overflow: auto;
          padding: 8px;
          border-radius: 8px;
          background: color-mix(in srgb, var(--card-background-color, white) 88%, transparent);
          color: var(--primary-text-color);
          box-shadow: 0 4px 16px rgba(0,0,0,0.16);
          font-size: 11px;
          z-index: 4;
          pointer-events: auto;
        }

        .cat-tuning-lab-header,
        .cat-tuning-tabs,
        .cat-tuning-row,
        .cat-tuning-actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .cat-tuning-lab-header {
          justify-content: space-between;
          margin-bottom: 6px;
          font-weight: 600;
        }

        .cat-tuning-tabs {
          flex-wrap: wrap;
          margin-bottom: 6px;
        }

        .cat-tuning-subtabs {
          display: flex;
          align-items: center;
          gap: 5px;
          flex-wrap: wrap;
          margin: 0 0 7px;
          padding-bottom: 5px;
          border-bottom: 1px solid color-mix(in srgb, var(--primary-text-color) 12%, transparent);
        }

        .cat-tuning-button {
          appearance: none;
          border: 1px solid color-mix(in srgb, var(--primary-text-color) 25%, transparent);
          background: transparent;
          color: inherit;
          border-radius: 999px;
          padding: 3px 7px;
          min-height: 22px;
          font: inherit;
          cursor: pointer;
        }

        .cat-tuning-button.active {
          background: var(--primary-text-color);
          color: var(--card-background-color, white);
        }

        .cat-tuning-row {
          display: grid;
          grid-template-columns: 118px 1fr 110px;
          margin: 4px 0;
        }

        .cat-tuning-row small {
          display: block;
          font-size: 9px;
          line-height: 1.05;
          opacity: 0.58;
        }

        .cat-tuning-row input[type="range"] {
          width: 100%;
        }

        .cat-tuning-subsection {
          margin: 9px 0 3px;
          padding-top: 6px;
          border-top: 1px solid color-mix(in srgb, var(--primary-text-color) 14%, transparent);
          font-weight: 700;
          opacity: 0.72;
        }

        .cat-render-layer-row {
          grid-template-columns: 118px 18px 1fr 126px;
        }

        .cat-render-layer-row input[type="checkbox"] {
          margin: 0;
        }

        .cat-tuning-readouts {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 3px 8px;
          margin-top: 6px;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          opacity: 0.86;
        }

        .cat-tuning-readouts div {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .cat-fine-tune-node {
          margin: 6px 0;
          padding: 6px;
          border: 1px solid color-mix(in srgb, var(--primary-text-color) 12%, transparent);
          border-radius: 6px;
          background: color-mix(in srgb, var(--card-background-color, white) 72%, transparent);
        }

        .cat-fine-tune-node.changed {
          border-color: color-mix(in srgb, var(--warning-color) 64%, transparent);
        }

        .cat-fine-tune-node.active {
          outline: 2px solid color-mix(in srgb, var(--info-color) 78%, transparent);
        }

        .cat-fine-tune-node-head,
        .cat-fine-tune-axis-row,
        .cat-fine-tune-axis {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .cat-fine-tune-node-head {
          justify-content: space-between;
        }

        .cat-fine-tune-node-head small,
        .cat-fine-tune-node-readout,
        .cat-fine-tune-note {
          display: block;
          font-size: 9px;
          opacity: 0.62;
        }

        .cat-fine-tune-note {
          margin: 0 0 6px;
          line-height: 1.2;
        }

        .cat-fine-tune-axis-row {
          margin-top: 5px;
        }

        .cat-fine-tune-axis {
          flex: 1;
        }

        .cat-fine-tune-axis input {
          min-width: 0;
          width: 100%;
        }

        .cat-fine-tune-readout pre {
          margin: 4px 0 8px;
          padding: 6px;
          max-height: 120px;
          overflow: auto;
          border-radius: 6px;
          background: color-mix(in srgb, var(--primary-text-color) 8%, transparent);
          font-size: 10px;
          white-space: pre-wrap;
        }

        /* -------------------------------------------------------------------
           Dude styling
        ------------------------------------------------------------------- */

        .limb {
          stroke: ${c.line_color};
          stroke-width: ${Number(c.line_width)};
          stroke-linecap: round;
          stroke-linejoin: round;
          fill: none;
        }

        .head {
          stroke: ${c.line_color};
          stroke-width: ${Number(c.line_width)};
          fill: ${c.head_fill};
        }

        .joint {
          fill: ${c.joint_color};
          opacity: 0.75;
        }

        /* -------------------------------------------------------------------
           Environment and movement path styling
        ------------------------------------------------------------------- */

        .floor {
          stroke: ${c.floor_color};
          stroke-width: ${Number(c.floor_width)};
          stroke-linecap: round;
          opacity: ${Number(c.floor_opacity)};
        }

        .guide {
          stroke: ${c.line_color};
          stroke-width: 1.5;
          stroke-dasharray: 4 6;
          opacity: 0.12;
        }

        .head-path-line {
          stroke: ${c.path_color};
          stroke-width: ${Number(c.path_width)};
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-dasharray: ${c.path_dash};
          opacity: ${Number(c.path_opacity)};
          fill: none;
        }

        .head-path-point {
          fill: ${c.path_color};
          opacity: ${Number(c.path_opacity) + 0.18};
        }

        /* -------------------------------------------------------------------
           POI styling
        ------------------------------------------------------------------- */

        .poi-switch-plate {
          stroke: ${c.poi_switch_color};
          stroke-width: 1.8;
          fill: none;
          opacity: ${Number(c.poi_switch_opacity)};
        }

        .poi-switch-dot {
          fill: ${c.poi_switch_color};
          opacity: ${Number(c.poi_switch_opacity)};
        }

        .poi-switch-label {
          fill: ${c.poi_switch_color};
          opacity: ${Number(c.poi_switch_opacity) * 0.75};
          font-size: 7px;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          text-anchor: middle;
        }

        .poi-light-source {
          fill: ${c.poi_light_source_color};
          opacity: 0;
          pointer-events: none;
        }

        .poi-light-glow {
          fill: ${c.poi_light_source_color};
          opacity: 0;
          pointer-events: none;
        }

        .poi-switch-plate.active {
          opacity: ${Math.min(1, Number(c.poi_switch_opacity) + 0.35)};
        }

        /* -------------------------------------------------------------------
           Temporary attention POI styling
        ------------------------------------------------------------------- */

        .attention-poi-ring {
          stroke: var(--accent-color);
          stroke-width: 1.6;
          stroke-dasharray: 3 3;
          fill: none;
          opacity: 0.55;
        }

        .attention-poi-dot {
          fill: var(--accent-color);
          opacity: 0.8;
        }

        .attention-poi-line {
          stroke: var(--accent-color);
          stroke-width: 1.2;
          stroke-dasharray: 2 4;
          opacity: 0.35;
        }

        .attention-poi-label {
          fill: var(--accent-color);
          opacity: 0.7;
          font-size: 8px;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          text-anchor: middle;
        }

        /* -------------------------------------------------------------------
           Cat styling
        ------------------------------------------------------------------- */

        .cat-line {
          stroke: ${c.cat_line_color};
          stroke-width: ${Number(c.cat_line_width)};
          stroke-linecap: round;
          stroke-linejoin: round;
          fill: none;
          opacity: ${Number(c.cat_opacity)};
        }

        .cat-body-line {
          stroke: ${c.cat_line_color};
          stroke-width: ${Number(c.cat_line_width)};
          stroke-linecap: round;
          stroke-linejoin: round;
          fill: none;
          opacity: ${Number(c.cat_opacity)};
        }

        .cat-tail-line {
          stroke: ${c.cat_line_color};
          stroke-width: ${Number(c.cat_line_width)};
          stroke-linecap: round;
          stroke-linejoin: round;
          fill: none;
          opacity: ${Number(c.cat_opacity)};
        }

        .cat-head-shape {
          stroke: ${c.cat_line_color};
          stroke-width: ${Number(c.cat_line_width)};
          stroke-linecap: round;
          stroke-linejoin: round;
          fill: ${c.cat_fill};
          opacity: ${Number(c.cat_opacity)};
        }

        .cat-silhouette {
          fill: ${c.cat_silhouette_fill};
          opacity: ${Number(c.cat_opacity)};
        }

        .cat-node {
          fill: ${c.cat_node_color};
          opacity: 0.8;
        }

        /* -------------------------------------------------------------------
           Dude debug styling
        ------------------------------------------------------------------- */

        .leg-debug-line {
          stroke: ${c.line_color};
          stroke-width: 1.5;
          stroke-dasharray: 3 5;
          opacity: 0.2;
        }

        .leg-debug-point {
          fill: ${c.line_color};
          opacity: 0.22;
        }

        .leg-debug-step {
          stroke: ${c.line_color};
          stroke-width: 1.5;
          stroke-dasharray: 2 4;
          opacity: 0.35;
          fill: none;
        }

        .pose-debug {
          fill: var(--secondary-text-color);
          font-size: 8px;
          opacity: 0.65;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        }

        /* -------------------------------------------------------------------
           POI debug styling
        ------------------------------------------------------------------- */

        .poi-debug-line {
          stroke: ${c.poi_debug_color};
          stroke-width: 1.4;
          stroke-dasharray: 4 4;
          opacity: ${Number(c.poi_debug_opacity)};
          fill: none;
        }

        .poi-debug-fill {
          fill: ${c.poi_debug_color};
          opacity: ${Number(c.poi_debug_opacity) * 0.2};
        }

        .poi-debug-point {
          fill: ${c.poi_debug_color};
          opacity: ${Number(c.poi_debug_opacity) + 0.25};
        }

        .poi-debug-text {
          fill: ${c.poi_debug_color};
          opacity: ${Number(c.poi_debug_opacity) + 0.35};
          font-size: 8px;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          text-anchor: middle;
        }

        /* -------------------------------------------------------------------
           Hand target debug styling
        ------------------------------------------------------------------- */

        .hand-target-debug-line {
          stroke-width: 1.8;
          stroke-dasharray: 3 4;
          fill: none;
          opacity: ${Number(c.hand_target_debug_opacity)};
        }

        .hand-target-debug-point {
          opacity: ${Number(c.hand_target_debug_opacity)};
        }

        .hand-target-debug-ring {
          stroke-width: 1.5;
          fill: none;
          opacity: ${Number(c.hand_target_debug_opacity) * 0.75};
        }

        .hand-target-debug-text {
          font-size: 8px;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          text-anchor: middle;
          opacity: ${Number(c.hand_target_debug_opacity)};
        }

        .hand-reach-debug-zone {
          stroke-width: 1.2;
          stroke-dasharray: 5 5;
          fill: none;
          opacity: ${Number(c.hand_target_debug_opacity) * 0.35};
        }

        /* -------------------------------------------------------------------
           Cat debug styling
        ------------------------------------------------------------------- */

        .cat-debug-line {
          stroke: ${c.cat_debug_color};
          stroke-width: 1.3;
          stroke-dasharray: 4 4;
          opacity: ${Number(c.cat_debug_opacity)};
          fill: none;
        }

        .cat-belly-line {
          stroke: ${c.cat_line_color || c.line_color};
          stroke-width: ${Math.max(1, Number(c.cat_line_width || c.line_width) * 0.42)};
          stroke-linecap: round;
          fill: none;
          pointer-events: none;
        }

        .cat-movement-target-line {
          stroke: var(--warning-color);
          stroke-width: 1.4;
          stroke-dasharray: 4 4;
          opacity: 0.55;
          fill: none;
          pointer-events: none;
        }

        .cat-movement-target-point {
          fill: var(--warning-color);
          opacity: 0.72;
          pointer-events: none;
        }

        .cat-debug-fill {
          fill: ${c.cat_debug_color};
          opacity: ${Number(c.cat_debug_opacity) * 0.16};
        }

        .cat-surface-fill {
          fill: ${c.cat_line_color || c.line_color};
          opacity: 0.08;
          pointer-events: none;
        }

        .cat-surface-line {
          stroke: ${c.cat_line_color || c.line_color};
          stroke-width: 1.2;
          stroke-dasharray: 3 3;
          opacity: 0.18;
          fill: none;
          pointer-events: none;
        }

        .cat-surface-render {
          pointer-events: none;
        }

        .cat-skeleton-base.soft {
          opacity: 1;
        }

        .cat-skeleton-base.soft .cat-line,
        .cat-skeleton-base.soft .cat-body-line,
        .cat-skeleton-base.soft .cat-tail-line {
          stroke-width: ${Math.max(1.2, Number(c.cat_line_width || c.line_width) * 0.42)};
        }

        .cat-skeleton-base.soft .cat-belly-line {
          opacity: ${Math.max(0.08, Number(c.cat_belly_line_opacity || 0.18) * 0.65)};
        }

        .cat-surface-body,
        .cat-surface-chest,
        .cat-surface-body-contour,
        .cat-surface-collar,
        .cat-surface-rear,
        .cat-surface-front,
        .cat-surface-tail {
          fill: ${c.cat_line_color || c.line_color};
          stroke: none;
          opacity: 1;
        }

        .cat-surface-rear.far {
          opacity: 1;
        }

        .cat-surface-rear.web,
        .cat-surface-front.web {
          stroke: ${c.cat_line_color || c.line_color};
          stroke-width: ${Math.max(0.9, Number(c.cat_line_width || c.line_width) * 0.32)};
          stroke-linejoin: round;
          stroke-linecap: round;
        }

        .cat-surface-tail-tip,
        .cat-surface-topline,
        .cat-surface-belly {
          stroke: ${c.cat_line_color || c.line_color};
          fill: none;
          stroke-linecap: round;
          stroke-linejoin: round;
          pointer-events: none;
        }

        .cat-surface-front.far {
          opacity: 1;
        }

        .cat-surface-tail-tip {
          stroke-width: ${Math.max(0.8, Number(c.cat_line_width || c.line_width) * 0.14)};
          opacity: 0.36;
        }

        .cat-surface-topline {
          stroke-width: ${Math.max(1.2, Number(c.cat_line_width || c.line_width) * 0.34)};
          opacity: 1;
        }

        .cat-surface-belly {
          stroke-width: ${Math.max(1, Number(c.cat_line_width || c.line_width) * 0.22)};
          opacity: 1;
        }

        .cat-debug-point {
          fill: ${c.cat_debug_color};
          opacity: ${Number(c.cat_debug_opacity) + 0.25};
        }

        .cat-debug-text {
          fill: ${c.cat_debug_color};
          opacity: 0.38;
          font-size: 3px;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          pointer-events: none;
        }
      </style>
    `;

    const card = this.shadowRoot.querySelector("ha-card");

    if (card) {
      /*
        Pointer events support direct manipulation of world targets.
        Click remains as the legacy/attention POI signal.
      */
      card.addEventListener("pointerdown", (event) =>
        this.handlePointerDown(event)
      );

      card.addEventListener("click", (event) => this.handleTap(event));
    }

    this.attachCatMoodControls();
    this.attachCatTuningLab();

    this.setupResizeObserver();
    this.updateWorldLayout();

    if (this.updateAttentionPoiLayer) this.updateAttentionPoiLayer();
    if (this.updateCatLayer) this.updateCatLayer();
    if (this.updateCatDebugLayer) this.updateCatDebugLayer();
  }

  isCatTrueWanderMode() {
    return this.bool(this.c.cat_true_wander_mode);
  }

  shouldAllowCatTrueWanderOverflow() {
    return (
      this.isCatTrueWanderMode() &&
      this.bool(this.c.cat_true_wander_overflow)
    );
  }


  isViewMode(mode) {
    return String(this.c.view_mode || "world") === mode;
  }

  isCatFocusMode() {
    return this.isViewMode("cat_focus");
  }

  isDudeFocusMode() {
    return this.isViewMode("dude_focus");
  }

  shouldRenderDude() {
    if (this.isCatTrueWanderMode()) {
      return false;
    }

    if (this.isCatFocusMode() && this.bool(this.c.cat_focus_hide_dude)) {
      return false;
    }

    return this.bool(this.c.show_dude);
  }

  shouldRenderCat() {
    if (this.isCatTrueWanderMode()) {
      return true;
    }

    if (this.isCatFocusMode()) {
      return true;
    }

    return this.bool(this.c.show_cat) || this.bool(this.c.cat_enabled) || this.bool(
      this.getCatRuntimeConfigValue("show_cat_pixel_preview", this.c.show_cat_pixel_preview)
    );
  }

  shouldRenderPois() {
    if (this.isCatTrueWanderMode()) {
      return false;
    }

    if (this.isCatFocusMode() && this.bool(this.c.cat_focus_hide_pois)) {
      return false;
    }

    return this.bool(this.c.show_pois) && this.bool(this.c.poi_enabled);
  }

  shouldRenderAttentionPois() {
    if (this.isCatTrueWanderMode()) {
      return false;
    }

    if (!this.bool(this.c.click_creates_attention_poi)) {
      return false;
    }

    if (this.isCatFocusMode() && this.bool(this.c.cat_focus_hide_pois)) {
      return false;
    }

    return true;
  }

  shouldRenderEnvironment() {
    if (this.isCatTrueWanderMode()) {
      return false;
    }

    return this.bool(this.c.show_environment);
  }

  shouldRenderFloor() {
    if (this.isCatTrueWanderMode()) {
      return false;
    }

    return this.shouldRenderEnvironment() && this.bool(this.c.show_floor);
  }

  shouldRenderHeadPath() {
    if (this.isCatTrueWanderMode()) {
      return false;
    }

    if (this.isCatFocusMode() && this.bool(this.c.cat_focus_hide_head_path)) {
      return false;
    }

    return this.bool(this.c.show_head_path);
  }

  renderCatMoodControls({ force = false } = {}) {
    if (!force && !this.bool(this.c.show_cat_mood_controls)) return "";
    if (!this.shouldRenderCat || !this.shouldRenderCat()) return "";

    const currentMood = this.getCurrentCatMood();

    return `
      <div class="cat-mood-controls" aria-label="Cat mood controls">
        ${this.getCatMoodNames()
          .map((mood) => {
            const active = mood === currentMood;
            return `
              <button
                type="button"
                class="cat-mood-button${active ? " active" : ""}"
                data-cat-mood="${this.esc(mood)}"
                aria-pressed="${active ? "true" : "false"}"
              >${this.esc(mood)}</button>
            `;
          })
          .join("")}
      </div>
    `;
  }

  attachCatMoodControls() {
    this.shadowRoot.querySelectorAll("[data-cat-mood]").forEach((button) => {
      button.addEventListener("pointerdown", (event) => {
        event.stopPropagation();
      });
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.setLiveCatMood(button.getAttribute("data-cat-mood"));
      });
    });
  }

  setLiveCatMood(mood) {
    const safeMood = this.getCatMoodNames().includes(String(mood))
      ? String(mood)
      : "neutral";

    if (!this.catState) {
      this.catState = this.createInitialCatState();
    }

    this.catState.liveMood = safeMood;

    if (this.updateCatLayer) this.updateCatLayer();
    if (this.updateCatDebugLayer) this.updateCatDebugLayer();
    this.render();
    this.startIdleAnimation();
    this.startCatAutoWander();
  }

  getCatPoseNames() {
    return ["stand", "sit", "loaf", "stretch", "alert", "rub"];
  }

  getCatPoseProfiles() {
    /*
      Quick pose MVP.

      These are root/skeleton-level profile overrides that feed the same
      target-led rig controls as normal walking. They are intentionally broad:
      good enough for authoring idle states, not a final animation system.
    */
    return {
      stand: {},
      sit: {
        cat_v2_spine_angle: -8,
        cat_v2_spine_curve: 14,
        cat_v2_chest_height: 45,
        cat_v2_hip_height: -50,
        cat_v2_head_forward: 27,
        cat_v2_head_lift: 12,
        cat_v2_head_tilt: -3,
        cat_shoulder_joint_forward: 4,
        cat_hip_joint_forward: 14,
        cat_v2_front_near_paw_x: 20,
        cat_v2_front_far_paw_x: 38,
        cat_v2_rear_near_paw_x: 14,
        cat_v2_rear_far_paw_x: 14,
        cat_tail_base_angle: -48,
        cat_tail_lift: -10,
        cat_tail_curve: -2,
      },
      loaf: {
        cat_v2_spine_angle: 0,
        cat_v2_spine_curve: 2,
        cat_v2_chest_height: 18,
        cat_v2_hip_height: 18,
        cat_v2_head_forward: 22,
        cat_v2_head_lift: 15,
        cat_v2_head_tilt: -1,
        cat_shoulder_joint_forward: 0,
        cat_hip_joint_forward: 2,
        cat_v2_front_near_paw_x: 18,
        cat_v2_front_far_paw_x: 28,
        cat_v2_rear_near_paw_x: -2,
        cat_v2_rear_far_paw_x: -10,
        cat_tail_base_angle: -24,
        cat_tail_lift: 4,
        cat_tail_curve: -10,
      },
    };
  }

  getCurrentCatPose() {
    const configured = String(this.c?.cat_pose || "stand");
    const live = this.catState?.livePose;
    const pose = String(live || configured || "stand");
    return this.getCatPoseNames().includes(pose) ? pose : "stand";
  }

  isCatPoseOverrideActive() {
    return this.bool(this.catState?.poseEditing) || this.getCurrentCatPose() !== "stand";
  }

  isCatInMotionContext({
    gait = this.catState?.gait,
    autoWander = this.catState?.autoWander,
    movementTest = this.catState?.movementTest || this.getCatMovementTestState(),
    supportState = this.catState?.rig?.supportState,
  } = {}) {
    const interactionActive = this.bool(this.catState?.interactionSession?.active);
    const continuousWalk = this.bool(movementTest?.continuousWalk);
    const gaitMoving = this.bool(gait?.clockMoving);
    const autoMoving =
      this.getCatAutoWanderEnabled() &&
      !this.bool(movementTest?.paused) &&
      Boolean(autoWander?.active) &&
      Boolean(autoWander?.target);
    const supportMoving =
      supportState &&
      (String(supportState.state || "") !== "supported" ||
        Number(supportState.hangingCount || 0) > 0 ||
        Number(supportState.supportCount || 0) < 4);

    return Boolean(
      interactionActive ||
        continuousWalk ||
        gaitMoving ||
        autoMoving ||
        supportMoving
    );
  }

  getCatBodyComfortAuthority({ motionContext = null } = {}) {
    const motionOnly = this.bool(
      this.getCatRuntimeConfigValue(
        "cat_body_comfort_motion_only",
        this.c.cat_body_comfort_motion_only ?? true
      )
    );

    if (!motionOnly) return 1;
    return motionContext ? 1 : 0.1;
  }

  getCatPoseOverrideState() {
    if (!this.catState) this.catState = this.createInitialCatState();
    if (!this.catState.poseOverrides) this.catState.poseOverrides = {};
    return this.catState.poseOverrides;
  }

  getCatPoseProfileValues(poseName = this.getCurrentCatPose()) {
    const safePose = this.getCatPoseNames().includes(String(poseName))
      ? String(poseName)
      : "stand";
    return {
      ...(this.getCatPoseProfiles()[safePose] || {}),
      ...(this.getCatPoseOverrideState()[safePose] || {}),
    };
  }

  getActiveCatPoseOverrides() {
    const pose = this.getCurrentCatPose();
    if (pose === "stand" && !this.catState?.poseEditing) return {};
    return this.getCatPoseProfileValues(pose);
  }

  setLiveCatPose(poseName, { editing = false, pauseMovement = true } = {}) {
    const safePose = this.getCatPoseNames().includes(String(poseName))
      ? String(poseName)
      : "stand";

    if (!this.catState) this.catState = this.createInitialCatState();

    this.catState.livePose = safePose === "stand" ? null : safePose;
    this.catState.poseEditing = this.bool(editing);

    if (pauseMovement) {
      const movement = this.getCatMovementTestState();
      movement.paused = safePose !== "stand" || this.catState.poseEditing;
      if (movement.paused) {
        this.stopCatAutoWander?.({ clearOverride: false });
      } else if (this.getCatAutoWanderEnabled()) {
        this.startCatAutoWander();
      }
    }

    this.resetCatPoseMotionMemory();

    if (this.updateCatLayer) this.updateCatLayer();
    if (this.updateCatDebugLayer) this.updateCatDebugLayer();
    if (this.updateWorldLayout && this.isCatFocusMode()) this.updateWorldLayout();
  }

  setCatAutoIdlePose(poseName) {
    if (this.catState?.poseEditing) return;
    const safePose = this.getCatPoseNames().includes(String(poseName))
      ? String(poseName)
      : "stand";
    const livePose = safePose === "stand" ? null : safePose;
    if (this.catState?.livePose === livePose) return;
    if (!this.catState) this.catState = this.createInitialCatState();
    this.catState.livePose = livePose;
    this.resetCatPoseMotionMemory();
  }

  setCatPoseProfileValue(poseName, name, value) {
    const safePose = this.getCatPoseNames().includes(String(poseName))
      ? String(poseName)
      : "stand";
    const overrides = this.getCatPoseOverrideState();
    if (!overrides[safePose]) overrides[safePose] = {};
    const numeric = Number(value);
    overrides[safePose][name] = Number.isFinite(numeric) ? numeric : value;
    if (this.isCatPoseOverrideActive()) this.resetCatPoseMotionMemory();

    if (this.updateCatLayer) this.updateCatLayer();
    if (this.updateCatDebugLayer) this.updateCatDebugLayer();
  }

  resetCatPoseMotionMemory() {
    if (!this.catState) this.catState = this.createInitialCatState();
    this.catState.limbSolveMemory = {};
    this.catState.gait = this.createInitialCatState().gait;
    this.catState.pawContact = {
      frontNear: this.createCatPawContactSlot("frontNear"),
      frontFar: this.createCatPawContactSlot("frontFar"),
      rearNear: this.createCatPawContactSlot("rearNear"),
      rearFar: this.createCatPawContactSlot("rearFar"),
    };
  }

  resetCatPoseProfileValue(poseName, name = null) {
    const safePose = this.getCatPoseNames().includes(String(poseName))
      ? String(poseName)
      : "stand";
    const overrides = this.getCatPoseOverrideState();
    if (!name) {
      delete overrides[safePose];
    } else if (overrides[safePose]) {
      delete overrides[safePose][name];
    }

    if (this.updateCatLayer) this.updateCatLayer();
    if (this.updateCatDebugLayer) this.updateCatDebugLayer();
  }

  getCatRuntimeConfigValue(name, fallback = undefined) {
    const poseOverrides = this.getActiveCatPoseOverrides?.() || {};
    if (Object.prototype.hasOwnProperty.call(poseOverrides, name)) {
      return poseOverrides[name];
    }

    const overrides = this.catState?.tuningOverrides || {};
    if (Object.prototype.hasOwnProperty.call(overrides, name)) {
      return overrides[name];
    }

    if (this.c && Object.prototype.hasOwnProperty.call(this.c, name)) {
      return this.c[name];
    }

    return fallback;
  }

  getCatRuntimeConfig() {
    return {
      ...(this.c || {}),
      ...(this.catState?.tuningOverrides || {}),
      ...(this.getActiveCatPoseOverrides?.() || {}),
    };
  }

  setCatRuntimeConfigValue(name, value) {
    if (!this.catState) {
      this.catState = this.createInitialCatState();
    }
    if (!this.catState.tuningOverrides) {
      this.catState.tuningOverrides = {};
    }

    if (typeof value === "boolean") {
      this.catState.tuningOverrides[name] = value;
    } else {
      const numeric = Number(value);
      this.catState.tuningOverrides[name] = Number.isFinite(numeric) ? numeric : value;
    }

    if (this.updateCatLayer) this.updateCatLayer();
    if (this.updateCatDebugLayer) this.updateCatDebugLayer();
    if (this.updateWorldLayout && this.isCatFocusMode()) this.updateWorldLayout();
  }

  resetCatTuningOverride(name = null) {
    if (!this.catState) return;
    if (!this.catState.tuningOverrides) return;

    if (name) {
      delete this.catState.tuningOverrides[name];
    } else {
      this.catState.tuningOverrides = {};
    }

    if (this.updateCatLayer) this.updateCatLayer();
    if (this.updateCatDebugLayer) this.updateCatDebugLayer();
  }

  getCatTuningSectionOverrideNames(section = this.getCatTuningSection()) {
    if (section === "render") {
      return [
        "show_cat_belly_line",
        "cat_belly_line_opacity",
        ...this.getCatRenderLayerControls().flatMap((layer) => [
          layer.visible,
          layer.opacity,
        ]),
      ];
    }

    if (section === "movement") {
      const subsection = this.getCatTuningSubsection("movement");
      return [
        ...this.getCatTuningSliderControls("movement", subsection).map(([name]) => name),
        ...(subsection === "travel" ? ["cat_auto_wander"] : []),
      ];
    }

    if (section === "anatomy") {
      return this.getCatTuningSliderControls("anatomy", this.getCatTuningSubsection("anatomy")).map(([name]) => name);
    }

    if (section === "poses") {
      const pose = this.getCurrentCatPose();
      return Object.keys(this.getCatPoseOverrideState()[pose] || {});
    }

    if (section === "debug") {
      return [
        ...this.getCatTuningDebugNames(),
        ...this.getCatTuningSliderControls("debug", this.getCatTuningSubsection("debug")).map(([name]) => name),
      ];
    }

    if (section === "fine_tune") {
      const surface = this.getCatFineTuneSurface(this.getCatTuningSubsection("fine_tune"));
      return [
        ...(surface?.nodes || []).flatMap(([nodeKey]) => [
          this.getCatFineTuneOffsetName(surface.key, nodeKey, "x"),
          this.getCatFineTuneOffsetName(surface.key, nodeKey, "y"),
        ]),
        ...(surface?.semanticControls || []).map(([name]) => name),
      ];
    }

    return [];
  }

  resetCatTuningSection(section = this.getCatTuningSection()) {
    if (!this.catState) return;

    this.getCatTuningSectionOverrideNames(section).forEach((name) => {
      this.resetCatTuningOverride(name);
    });

    if (section === "mood") {
      this.catState.liveMood = null;
    }

    if (section === "poses") {
      const pose = this.getCurrentCatPose();
      this.resetCatPoseProfileValue(pose);
      this.catState.livePose = null;
      this.catState.poseEditing = false;
      const movement = this.getCatMovementTestState();
      movement.paused = false;
      if (this.getCatAutoWanderEnabled()) {
        this.startCatAutoWander();
      }
    }

    if (section === "movement" && this.getCatTuningSubsection("movement") === "travel") {
      this.catState.movementTest = {
        continuousWalk: false,
        paused: false,
        direction: 1,
      };
      if (this.bool(this.getCatRuntimeConfigValue("cat_auto_wander", this.c.cat_auto_wander))) {
        this.startCatAutoWander();
      } else {
        this.stopCatAutoWander?.({ clearOverride: false });
      }
    }

    this.render();
    if (this.updateCatLayer) this.updateCatLayer();
    if (this.updateCatDebugLayer) this.updateCatDebugLayer();
  }

  getCatMovementTestState() {
    if (!this.catState) {
      this.catState = this.createInitialCatState();
    }

    if (!this.catState.movementTest) {
      this.catState.movementTest = {
        continuousWalk: false,
        paused: false,
        direction: 1,
      };
    }

    return this.catState.movementTest;
  }

  getCatAutoWanderEnabled() {
    return this.bool(this.getCatRuntimeConfigValue("cat_auto_wander", this.c.cat_auto_wander));
  }

  resetCatLocomotionTestPosition() {
    if (!this.catState) {
      this.catState = this.createInitialCatState();
    }

    const auto = this.getCatAutoWanderState();
    auto.currentAnchor = this.getCatDefaultLocomotionAnchor();
    auto.target = null;
    auto.idleUntil = 0;
    auto.lastFrameTime = null;
    auto.facingSign = this.catState.solvedFrontSign || this.getCatFacingSign();

    this.catState.pawContact = {
      frontNear: this.createCatPawContactSlot("frontNear"),
      frontFar: this.createCatPawContactSlot("frontFar"),
      rearNear: this.createCatPawContactSlot("rearNear"),
      rearFar: this.createCatPawContactSlot("rearFar"),
    };

    this.catState.gait = this.createInitialCatState().gait;
    this.catState.limbSolveMemory = {};

    if (this.updateCatLayer) this.updateCatLayer();
    if (this.updateWorldLayout && this.isCatFocusMode()) this.updateWorldLayout();
    if (this.updateCatDebugLayer) this.updateCatDebugLayer();
  }

  getCatTuningSection() {
    const section = String(
      this.catState?.tuningSection ||
        this.c.cat_tuning_lab_default_section ||
        "mood"
    );

    return ["mood", "movement", "anatomy", "poses", "render", "debug", "fine_tune"].includes(section)
      ? section
      : "mood";
  }

  getCatTuningSubsectionId(label) {
    return String(label || "general")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "") || "general";
  }

  getCatTuningSubsections(section) {
    const controls = this.getCatTuningControls(section);
    const headings = controls
      .filter((control) => control?.type === "heading")
      .map((control) => ({
        id: control.id || this.getCatTuningSubsectionId(control.label),
        label: control.label,
      }));

    return headings.length ? headings : [];
  }

  getCatTuningSubsection(section = this.getCatTuningSection()) {
    const subsections = this.getCatTuningSubsections(section);
    if (!subsections.length) return null;

    const current =
      this.catState?.tuningSubsections?.[section] ||
      this.c[`cat_tuning_lab_${section}_section`] ||
      subsections[0].id;

    return subsections.some((subsection) => subsection.id === current)
      ? current
      : subsections[0].id;
  }

  getCatTuningVisibleControls(section = this.getCatTuningSection()) {
    const controls = this.getCatTuningControls(section);
    const activeSubsection = this.getCatTuningSubsection(section);
    if (!activeSubsection) return controls;

    const visible = [];
    let collecting = false;

    controls.forEach((control) => {
      if (control?.type === "heading") {
        collecting =
          (control.id || this.getCatTuningSubsectionId(control.label)) === activeSubsection;
        return;
      }

      if (collecting) visible.push(control);
    });

    return visible;
  }

  getCatTuningControls(section) {
    const heading = (label, id = null) => ({
      type: "heading",
      label,
      id: id || this.getCatTuningSubsectionId(label),
    });
    const controls = {
      movement: [
        heading("Travel"),
        ["cat_wander_head_speed", 0.05, 1.5, 0.01],
        heading("Gait"),
        ["cat_gait_cycle_frames", 30, 140, 1],
        ["cat_gait_stride_length", 12, 90, 1],
        ["cat_gait_swing_ratio", 0.08, 0.5, 0.01],
        heading("Contact"),
        ["cat_paw_unplant_ratio", 0.55, 1.25, 0.01],
        ["cat_paw_ground_capture_distance", 2, 30, 1],
        ["cat_gait_force_release_ratio", 0.85, 1.8, 0.01],
        ["cat_gait_release_cooldown_frames", 0, 16, 1],
        heading("Spine"),
        ["cat_spine_min_compress_ratio", 0.55, 1.1, 0.01],
        ["cat_spine_max_stretch_ratio", 0.8, 1.8, 0.01],
      ],
      debug: [
        heading("Rig"),
        heading("Nodes"),
        ["cat_node_size", 0.2, 12, 0.1],
        ["cat_debug_label_size", 1, 10, 0.1],
        ["cat_debug_node_opacity", 0, 1, 0.01],
        ["cat_debug_label_opacity", 0, 1, 0.01],
        heading("Body contour"),
        heading("Tail surface"),
        heading("Collar"),
        heading("Paws"),
        ["cat_debug_paw_opacity", 0, 1, 0.01],
        heading("Labels"),
        heading("Bounds"),
        heading("Experiments"),
      ],
      anatomy: [
        heading("Body"),
        ["cat_body_length", 30, 80, 0.5],
        ["cat_ratio_body_height", 0.35, 0.8, 0.01],
        ["cat_shoulder_joint_forward", -8, 10, 0.1],
        ["cat_hip_joint_forward", -8, 10, 0.1],
        heading("Legs"),
        ["cat_ratio_front_leg_length", 0.55, 1.2, 0.01],
        ["cat_ratio_rear_leg_length", 0.55, 1.25, 0.01],
        ["cat_ratio_front_upper", 0.2, 0.6, 0.01],
        ["cat_ratio_front_lower", 0.2, 0.6, 0.01],
        ["cat_ratio_front_pastern", 0.08, 0.35, 0.01],
        ["cat_surface_front_bend_roundness", 0, 2.5, 0.05],
        ["cat_ratio_rear_upper", 0.18, 0.55, 0.01],
        ["cat_ratio_rear_lower", 0.18, 0.55, 0.01],
        ["cat_ratio_rear_foot", 0.1, 0.4, 0.01],
        ["cat_surface_rear_bend_roundness", 0, 2.5, 0.05],
        heading("Neck"),
        ["cat_neck_rest_forward_ratio", -0.4, 0.8, 0.01],
        ["cat_neck_rest_lift_ratio", 0.2, 1.8, 0.01],
        ["cat_auto_head_carry_forward_ratio", -0.4, 0.8, 0.01],
        ["cat_auto_head_carry_lift_ratio", 0.2, 1.8, 0.01],
        heading("Tail"),
        ["cat_tail_length", 12, 70, 0.5],
        ["cat_tail_curve", -30, 30, 0.5],
        ["cat_tail_lift", -55, 25, 0.5],
        ["cat_tail_base_angle", -80, 60, 1],
        ["cat_tail_tip_curl", -18, 24, 0.5],
        ["cat_tail_mid_lift_ratio", 0, 1.4, 0.01],
        ["cat_tail_mid_curve_ratio", -1, 1, 0.01],
        ["cat_tail_surface_base_width", 0.2, 2, 0.01],
        ["cat_tail_surface_tip_width", 0.02, 0.8, 0.01],
        heading("Face"),
        ["cat_skull_width", 8, 36, 0.1],
        ["cat_skull_height", 6, 28, 0.1],
        ["cat_skull_offset_x", -20, 20, 0.1],
        ["cat_skull_offset_y", -20, 20, 0.1],
        ["cat_skull_tilt", -40, 40, 1],
        ["cat_head_template_scale", 0.5, 1.8, 0.01],
        ["cat_head_template_offset_x", -80, 80, 1],
        ["cat_head_template_offset_y", -80, 80, 1],
        ["cat_front_ear_offset_x", -12, 12, 0.1],
        ["cat_front_ear_offset_y", -12, 12, 0.1],
        ["cat_front_ear_width", 0.5, 10, 0.1],
        ["cat_front_ear_height", 0.5, 12, 0.1],
        ["cat_front_ear_angle", -60, 60, 1],
        ["cat_front_ear_opacity", 0, 1, 0.01],
        ["cat_rear_ear_offset_x", -12, 12, 0.1],
        ["cat_rear_ear_offset_y", -12, 12, 0.1],
        ["cat_rear_ear_width", 0.5, 10, 0.1],
        ["cat_rear_ear_height", 0.5, 12, 0.1],
        ["cat_rear_ear_angle", -60, 60, 1],
        ["cat_rear_ear_opacity", 0, 1, 0.01],
        ["cat_mouth_open", 0, 24, 0.1],
        ["cat_jaw_angle", -35, 35, 1],
        ["cat_jaw_pivot_x", -18, 8, 0.1],
        ["cat_jaw_pivot_y", -10, 10, 0.1],
        ["cat_jaw_template_offset_x", -20, 20, 0.1],
        ["cat_jaw_template_offset_y", -20, 20, 0.1],
        ["cat_jaw_opacity", 0, 1, 0.01],
      ],
      fine_tune: [
        heading("Body contour", "body_contour"),
        heading("Collar", "collar"),
        heading("Tail", "tail_surface"),
        heading("Face", "face"),
      ],
    };

    return controls[section] || [];
  }

  getCatTuningSliderControls(section, subsection = null) {
    const controls = subsection
      ? this.getCatTuningVisibleControls(section)
      : this.getCatTuningControls(section);

    return controls.filter((control) => Array.isArray(control));
  }

  getCatTuningControlDescription(name) {
    const descriptions = {
      cat_wander_head_speed: "Root travel speed. Higher moves the body faster and asks the gait to cover more ground; lower should slow travel and cadence.",
      cat_gait_cycle_frames: "Clock length. Higher slows the paw order/cadence; lower makes the gait cycle faster and can expose twitching.",
      cat_gait_stride_length: "Expected ground covered per gait cycle. Higher gives longer, lazier steps; lower gives shorter, quicker steps.",
      cat_gait_swing_ratio: "Share of cycle spent stepping. Higher keeps paws in the air longer; lower makes quicker, snappier foot placement.",
      cat_paw_unplant_ratio: "How far a planted paw can stretch before release. Higher holds contacts longer; lower releases earlier.",
      cat_paw_ground_capture_distance: "Landing-to-floor tolerance. Higher lets paws grip from farther away; lower requires cleaner floor contact.",
      cat_gait_force_release_ratio: "Emergency over-stretch limit. Higher tolerates more stretch before forcing; lower prevents extreme reaches sooner.",
      cat_gait_release_cooldown_frames: "Frames before another release. Higher spaces steps apart; lower allows quicker sequencing.",
      cat_spine_min_compress_ratio: "Minimum shoulder-hip span. Higher resists bunching; lower allows the body to compress more.",
      cat_spine_max_stretch_ratio: "Maximum shoulder-hip span. Higher allows longer stretched poses; lower keeps the spine more compact.",
      cat_v2_spine_angle: "Pose spine angle. Higher/lower tilt the chest-to-hip line in opposite directions.",
      cat_v2_spine_curve: "Pose spine curve. Higher adds more arc through the back; lower flattens or reverses the curve.",
      cat_v2_chest_height: "Pose chest height above floor. Higher lifts the shoulders/chest; lower crouches the front body.",
      cat_v2_hip_height: "Pose hip height above floor. Higher lifts the rump; lower drops into sit/loaf shapes.",
      cat_v2_front_near_paw_x: "Near front paw target in facing space. Higher places it farther forward; lower brings it back under the chest.",
      cat_v2_front_far_paw_x: "Far front paw target in facing space. Higher places it farther forward; lower brings it back under the chest.",
      cat_v2_rear_near_paw_x: "Near rear paw target in facing space. Higher tucks it forward; lower sends it back behind the hip.",
      cat_v2_rear_far_paw_x: "Far rear paw target in facing space. Higher tucks it forward; lower sends it back behind the hip.",
      cat_node_size: "Debug node radius. Higher makes rig points easier to see; lower reduces clutter.",
      cat_debug_label_size: "Debug label text size. Higher makes point names easier to read; lower keeps dense overlays quieter.",
      cat_debug_node_opacity: "Debug node opacity. Higher makes node dots stronger; lower fades them without hiding labels.",
      cat_debug_label_opacity: "Debug label opacity. Higher makes point names stronger; lower reduces text clutter.",
      cat_debug_paw_opacity: "Paw/contact debug opacity. Higher makes foot markers and target lines stronger; lower keeps contact hints subtle.",
      cat_body_length: "Chest-to-sacrum length. Higher lengthens the torso; lower makes a shorter, more compact cat.",
      cat_ratio_body_height: "Body thickness relative to length. Higher deepens the torso/belly; lower makes a slimmer body.",
      cat_shoulder_joint_forward: "Shoulder root X in facing space. Higher moves the foreleg root forward under the neck/head; lower moves it back under the chest.",
      cat_hip_joint_forward: "Hip root X in facing space. Higher moves the rear leg root forward under the body; lower moves it back towards the tail/sacrum.",
      cat_ratio_front_leg_length: "Front leg total length. Higher gives more reach and taller support; lower can make forelegs cramped.",
      cat_ratio_rear_leg_length: "Rear leg total length. Higher gives more rear sweep/reach; lower can make hips dip if contacts are far.",
      cat_ratio_front_upper: "Front upper segment share. Higher lengthens shoulder-to-elbow; lower shifts length into lower/pastern segments.",
      cat_ratio_front_lower: "Front lower segment share. Higher lengthens elbow-to-wrist; lower makes the foreleg fold tighter.",
      cat_ratio_front_pastern: "Front wrist-to-paw share. Higher gives longer pastern/foot reach; lower makes front paws more vertical.",
      cat_surface_front_bend_roundness: "Front web surface depth. Higher fills more inner elbow skin; lower reduces the foreleg web.",
      cat_ratio_rear_upper: "Rear upper segment share. Higher lengthens hip-to-knee; lower shifts length into hock/foot.",
      cat_ratio_rear_lower: "Rear lower segment share. Higher lengthens knee-to-hock; lower tightens the rear bend.",
      cat_ratio_rear_foot: "Rear hock-to-paw share. Higher lengthens the rear foot/low reach; lower shortens the ground-side segment.",
      cat_surface_rear_bend_roundness: "Rear web surface depth. Higher fills more inner haunch skin; lower reduces the haunch web.",
      cat_neck_rest_forward_ratio: "Resting neck forward bias. Higher carries the head farther forward; lower stacks it more over the shoulders.",
      cat_neck_rest_lift_ratio: "Resting neck lift. Higher raises/uprights the head; lower lets the head sit lower.",
      cat_auto_head_carry_forward_ratio: "Auto-walk head forward carry. Higher noses into travel; lower keeps the head back over the body.",
      cat_auto_head_carry_lift_ratio: "Auto-walk head lift. Higher gives a prouder/upright head; lower gives a stalking/dipped head.",
      cat_tail_length: "Tail length. Higher extends the tail; lower shortens it.",
      cat_tail_curve: "Side curve in facing space. More positive/negative bends the tail sideways in opposite directions.",
      cat_tail_lift: "Tail tip vertical bias. More negative lifts the tip; more positive drops it.",
      cat_tail_base_angle: "Root angle from spine. Higher rotates the tail base one way; lower rotates it the other.",
      cat_tail_tip_curl: "Distal tip curl. Higher curls/kinks the tip more one way; lower curls it the other way.",
      cat_tail_mid_lift_ratio: "Where lift appears along the tail. Higher carries lift through the middle; lower leaves more lift for the tip/base.",
      cat_tail_mid_curve_ratio: "Where side curve appears along the tail. Higher pushes curve into the middle; lower reverses/reduces that bias.",
      cat_tail_surface_base_width: "Tail base thickness. Higher makes a fuller root; lower makes a thinner join.",
      cat_tail_surface_tip_width: "Tail tip thickness. Higher makes a blunt/thick tip; lower makes a finer taper.",
      cat_ratio_skull_width: "Effective skull width ratio from body length. Higher makes the solved head wider/longer; lower compacts it.",
      cat_ratio_skull_height: "Effective skull height ratio from body length. Higher makes the solved head taller; lower flattens it.",
      cat_v2_head_forward: "Effective head forward offset. Higher moves the solved skull forward from the neck; lower pulls it back.",
      cat_v2_head_lift: "Effective head lift. Higher raises the solved skull; lower drops it.",
      cat_v2_head_tilt: "Effective solved head tilt. Higher/lower rotate the whole head in opposite directions.",
      cat_skull_width: "Head/skull width. Higher makes the head longer/wider; lower compacts it.",
      cat_skull_height: "Head/skull height. Higher makes the head taller; lower flattens it.",
      cat_skull_offset_x: "Head X offset in facing space. Higher moves the skull forward; lower moves it back.",
      cat_skull_offset_y: "Head Y offset. Higher moves the skull down; lower moves it up.",
      cat_skull_tilt: "Head tilt angle. Higher/lower rotate the head in opposite directions.",
      cat_head_template_scale: "Authored SVG head scale. Higher enlarges the template inside the solved skull; lower shrinks it.",
      cat_head_template_offset_x: "SVG head X trim. Higher shifts the drawn head forward/right in template space; lower shifts it back/left.",
      cat_head_template_offset_y: "SVG head Y trim. Higher shifts the drawn head down; lower shifts it up.",
      cat_front_ear_offset_x: "Far/soft ear X position. Higher moves it forward; lower moves it back.",
      cat_front_ear_offset_y: "Far/soft ear Y position. Higher moves it down; lower moves it up.",
      cat_front_ear_width: "Far/soft ear width. Higher widens it; lower narrows it.",
      cat_front_ear_height: "Far/soft ear height. Higher makes it taller; lower makes it shorter.",
      cat_front_ear_angle: "Far/soft ear tilt. Higher/lower lean the ear in opposite directions.",
      cat_front_ear_opacity: "Far/soft ear opacity. Higher makes it stronger; lower fades it.",
      cat_rear_ear_offset_x: "Near/silhouette ear X position. Higher moves it forward; lower moves it back.",
      cat_rear_ear_offset_y: "Near/silhouette ear Y position. Higher moves it down; lower moves it up.",
      cat_rear_ear_width: "Near/silhouette ear width. Higher widens it; lower narrows it.",
      cat_rear_ear_height: "Near/silhouette ear height. Higher makes it taller; lower makes it shorter.",
      cat_rear_ear_angle: "Near/silhouette ear tilt. Higher/lower lean the ear in opposite directions.",
      cat_rear_ear_opacity: "Near/silhouette ear opacity. Higher makes it stronger; lower fades it.",
      cat_mouth_open: "Jaw opening driver. Higher opens/rotates the jaw more; lower closes it.",
      cat_jaw_angle: "Base jaw rotation. Higher/lower rotate the jaw in opposite directions before mouth opening.",
      cat_jaw_pivot_x: "Jaw pivot X. Higher shifts the hinge forward; lower shifts it back.",
      cat_jaw_pivot_y: "Jaw pivot Y. Higher shifts the hinge down; lower shifts it up.",
      cat_jaw_template_offset_x: "SVG jaw X trim. Higher shifts the drawn jaw forward/right; lower shifts it back/left.",
      cat_jaw_template_offset_y: "SVG jaw Y trim. Higher shifts the drawn jaw down; lower shifts it up.",
      cat_jaw_opacity: "Lower jaw opacity. Higher makes it stronger; lower fades it.",
    };

    return descriptions[name] || "";
  }

  getCatFineTuneSurfaces() {
    /*
      Fine-tune surface registry

      This is the source of truth for the temporary node-offset UI.

      - `semanticControls` are real config/runtime values that already feed
        into solver/render helpers.
      - `nodes` are temporary XY offsets named `cat_ft_<surface>_<node>_<axis>`.
        They are meant for visual tuning and later harvesting, not as permanent
        one-off patches.
      - `debugNodes` / `debugLabels` point at the render debug toggles used when
        a node is selected in the tuning lab.

      Workflow:
      1. Tune nodes live in the card.
      2. Copy the changed fine-tune readout into the defaults checkpoint block
         if a value is worth preserving.
      3. Later, convert repeated/useful offsets into robust local-basis geometry
         in the relevant surface helper.

      Keep node names anatomical and stable; they are the handoff language
      between visual tuning and the future robust surface model.
    */
    return [
      {
        key: "body_contour",
        label: "Body contour",
        debugNodes: "show_cat_body_contour_nodes",
        debugLabels: "show_cat_body_contour_labels",
        color: "var(--warning-color)",
        nodes: [
          ["collarBack", "Where the neck/collar blends into the back."],
          ["topControlA", "Front/top body curve control."],
          ["topControlB", "Mid/rear body curve control."],
          ["rumpTop", "Top rear body mass near the tail base."],
          ["tailTopEdge", "Upper tail-root edge used by the body contour."],
          ["tailBottomEdge", "Lower tail-root edge used by the body contour."],
          ["rumpFaceTop", "Upper rear face where rump turns into tail/root."],
          ["rumpFaceBottom", "Lower rear haunch face / thigh mass."],
          ["rearBellyAnchor", "Rear underside before the hind leg."],
          ["bellyControl", "Controls belly curve depth."],
          ["bellyStart", "Where the belly begins near the front underside."],
          ["frontUnder", "Front chest / underside depth."],
          ["shoulderGuard", "Shoulder transition guard point."],
          ["shoulderCloseControl", "Curve closing the contour back into the shoulder."],
        ],
      },
      {
        key: "collar",
        label: "Collar",
        debugNodes: "show_cat_collar_nodes",
        debugLabels: "show_cat_collar_labels",
        color: "var(--success-color)",
        nodes: [
          ["collarLegCorner", "Lower collar/chest connection to the front leg surface."],
          ["collarJawCorner", "Under-jaw / throat connection."],
          ["collarSkullCorner", "Upper neck/head connection."],
          ["collarBackCorner", "Back of collar into shoulder/topline."],
          ["collarFrontControl", "Front curve of the collar."],
          ["collarRearControl", "Rear curve of the collar."],
        ],
      },
      {
        key: "tail_surface",
        label: "Tail",
        debugNodes: "show_cat_tail_surface_nodes",
        debugLabels: "show_cat_tail_surface_labels",
        color: "var(--info-color)",
        semanticControls: [
          ["cat_tail_surface_base_width", 0.2, 2, 0.01],
          ["cat_tail_surface_tip_width", 0.02, 0.8, 0.01],
          ["cat_tail_curve", -30, 30, 0.5],
          ["cat_tail_lift", -55, 25, 0.5],
          ["cat_tail_base_angle", -80, 60, 1],
          ["cat_tail_tip_curl", -18, 24, 0.5],
        ],
        nodes: [
          ["tailRootInside", "Small root extension into the body silhouette."],
          ["tailBase", "Original solved tail base."],
          ["tailControl", "First tail curve control."],
          ["tailMid", "Middle tail bend point."],
          ["tailTipControl", "Distal tip curl/kink control."],
          ["tailTip", "Tail endpoint."],
          ["tailBaseEdgeA", "One side of the tail base taper."],
          ["tailBaseEdgeB", "Other side of the tail base taper."],
          ["tailTipEdgeA", "One side of the tail tip taper."],
          ["tailTipEdgeB", "Other side of the tail tip taper."],
        ],
      },
      {
        key: "face",
        label: "Face",
        note: "The visible face uses authored SVG templates. These controls move/scale the solved skull, head SVG, and jaw SVG rather than editing individual path points.",
        semanticControls: [
          ["cat_ratio_skull_width", 0.2, 0.8, 0.01],
          ["cat_ratio_skull_height", 0.12, 0.5, 0.01],
          ["cat_v2_head_forward", -20, 30, 0.1],
          ["cat_v2_head_lift", -20, 30, 0.1],
          ["cat_v2_head_tilt", -40, 40, 1],
          ["cat_skull_width", 8, 36, 0.1],
          ["cat_skull_height", 6, 28, 0.1],
          ["cat_skull_offset_x", -20, 20, 0.1],
          ["cat_skull_offset_y", -20, 20, 0.1],
          ["cat_skull_tilt", -40, 40, 1],
          ["cat_head_template_scale", 0.5, 1.8, 0.01],
          ["cat_head_template_offset_x", -80, 80, 1],
          ["cat_head_template_offset_y", -80, 80, 1],
          ["cat_mouth_open", 0, 24, 0.1],
          ["cat_jaw_angle", -35, 35, 1],
          ["cat_jaw_pivot_x", -18, 8, 0.1],
          ["cat_jaw_pivot_y", -10, 10, 0.1],
          ["cat_jaw_template_offset_x", -20, 20, 0.1],
          ["cat_jaw_template_offset_y", -20, 20, 0.1],
          ["cat_jaw_opacity", 0, 1, 0.01],
        ],
        nodes: [],
      },
    ];
  }

  getCatFineTuneSurface(surfaceKey = this.getCatTuningSubsection("fine_tune")) {
    return this.getCatFineTuneSurfaces().find((surface) => surface.key === surfaceKey) || this.getCatFineTuneSurfaces()[0];
  }

  getCatFineTuneOffsetName(surfaceKey, nodeKey, axis) {
    return `cat_ft_${surfaceKey}_${nodeKey}_${axis}`;
  }

  getCatFineTuneOffset(surfaceKey, nodeKey) {
    return {
      x: Number(this.getCatRuntimeConfigValue(this.getCatFineTuneOffsetName(surfaceKey, nodeKey, "x"), 0)) || 0,
      y: Number(this.getCatRuntimeConfigValue(this.getCatFineTuneOffsetName(surfaceKey, nodeKey, "y"), 0)) || 0,
    };
  }

  isCatFineTuneNodeChanged(surfaceKey, nodeKey) {
    const offset = this.getCatFineTuneOffset(surfaceKey, nodeKey);
    return Math.abs(offset.x) > 0.001 || Math.abs(offset.y) > 0.001;
  }

  getCatFineTuneOffsetMirrorSign(rig = this.catState?.rig) {
    /*
      Fine-tune X offsets are authored in the left-facing cat view.

      The solved rig mirrors horizontally when the cat turns, so a saved local
      nudge should mirror with the body instead of remaining a world-space
      screen nudge. Left-facing keeps the authored X value; right-facing flips
      it.
    */
    const front = Number(
      rig?.solvedFrontSign ||
        rig?.cfg?.frontSign ||
        this.getCatFacingSign?.() ||
        -1
    );

    return front === 1 ? -1 : 1;
  }

  applyCatFineTunePoint(surfaceKey, nodeKey, point, rig = this.catState?.rig) {
    if (!point) return point;
    const offset = this.getCatFineTuneOffset(surfaceKey, nodeKey);
    if (!offset.x && !offset.y) return point;
    const mirrorX = this.getCatFineTuneOffsetMirrorSign(rig);

    return {
      ...point,
      x: Number(point.x) + offset.x * mirrorX,
      y: Number(point.y) + offset.y,
    };
  }

  getCatFineTuneHighlight() {
    return this.catState?.fineTuneHighlight || null;
  }

  setCatFineTuneHighlight(surfaceKey, nodeKey) {
    if (!this.catState) this.catState = this.createInitialCatState();
    this.catState.fineTuneHighlight = surfaceKey && nodeKey
      ? { surface: surfaceKey, node: nodeKey }
      : null;

    const surface = this.getCatFineTuneSurface(surfaceKey);
    if (surface?.debugNodes) this.setCatRuntimeConfigValue(surface.debugNodes, true);
    if (surface?.debugLabels) this.setCatRuntimeConfigValue(surface.debugLabels, true);
    this.setCatRuntimeConfigValue("show_cat_debug", true);
  }

  isCatFineTuneNodeHighlighted(surfaceKey, nodeKey) {
    const highlight = this.getCatFineTuneHighlight();
    return highlight?.surface === surfaceKey && highlight?.node === nodeKey;
  }

  resetCatFineTuneNode(surfaceKey, nodeKey) {
    ["x", "y"].forEach((axis) => this.resetCatTuningOverride(this.getCatFineTuneOffsetName(surfaceKey, nodeKey, axis)));
  }

  resetCatFineTuneSurface(surfaceKey) {
    const surface = this.getCatFineTuneSurface(surfaceKey);
    (surface?.nodes || []).forEach(([nodeKey]) => this.resetCatFineTuneNode(surface.key, nodeKey));
    (surface?.semanticControls || []).forEach(([name]) => this.resetCatTuningOverride(name));
  }

  resetAllCatFineTuneValues() {
    const semanticNames = new Set(
      this.getCatFineTuneSurfaces().flatMap((surface) =>
        (surface.semanticControls || []).map(([name]) => name)
      )
    );

    Object.keys(this.catState?.tuningOverrides || {})
      .filter((name) => name.startsWith("cat_ft_") || semanticNames.has(name))
      .forEach((name) => this.resetCatTuningOverride(name));
  }

  getCatFineTuneChangedValues(surfaceKey = null) {
    const overrides = this.catState?.tuningOverrides || {};
    const prefix = surfaceKey ? `cat_ft_${surfaceKey}_` : "cat_ft_";
    const surfaces = surfaceKey
      ? [this.getCatFineTuneSurface(surfaceKey)]
      : this.getCatFineTuneSurfaces();
    const semanticNames = new Set(
      surfaces.flatMap((surface) =>
        (surface?.semanticControls || []).map(([name]) => name)
      )
    );

    return Object.entries(overrides)
      .filter(
        ([name, value]) =>
          (name.startsWith(prefix) || semanticNames.has(name)) &&
          Math.abs(Number(value) || 0) > 0.001
      )
      .sort(([a], [b]) => a.localeCompare(b));
  }

  formatCatTuningValue(value) {
    if (typeof value === "boolean") return value ? "on" : "off";
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return this.esc(String(value ?? ""));
    if (Math.abs(numeric) >= 100) return numeric.toFixed(0);
    if (Math.abs(numeric) >= 10) return numeric.toFixed(1);
    return numeric.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
  }

  getCatTuningReadouts(section) {
    const rig = this.catState?.rig || null;
    const gait = this.catState?.gait || {};
    const auto = this.catState?.autoWander || {};
    const intent = this.getCatBehaviourIntent();
    const support = rig?.supportState || {};
    const pawStates = ["frontPawNear", "frontPawFar", "rearPawNear", "rearPawFar"].map(
      (name) => rig?.[name]?.state || "unknown"
    );
    const countState = (state) => pawStates.filter((value) => value === state).length;
    const targetDistance =
      auto.target && auto.currentAnchor
        ? Math.hypot(
            Number(auto.target.x) - Number(auto.currentAnchor.x),
            Number(auto.target.y) - Number(auto.currentAnchor.y)
          )
        : null;
    const anatomy = rig?.anatomy || null;
    const naturalSpeed =
      Number(this.getCatRuntimeConfigValue("cat_gait_stride_length", 42)) /
      Math.max(1, Number(this.getCatRuntimeConfigValue("cat_gait_cycle_frames", 76)));
    const belly = rig?.bellyGuide?.diagnostics || {};
    const overrides = Object.keys(this.catState?.tuningOverrides || {});
    const movementTest = this.getCatMovementTestState();

    const common = {
      mood: this.getCurrentCatMood(),
      section,
    };

    const readouts = {
      mood: {
        ...common,
        pace: intent.paceMultiplier,
        headF: intent.headForwardBias,
        headLift: intent.headLiftBias,
        tailFlick: intent.tailTipFlickAmount,
        restless: intent.idleRestlessness,
      },
      movement: {
        auto: this.getCatAutoWanderEnabled(),
        pose: this.getCurrentCatPose(),
        paused: this.bool(movementTest.paused),
        continuous: this.bool(movementTest.continuousWalk),
        dir: Number(movementTest.direction || 1) >= 0 ? "right" : "left",
        speed: this.getCatRuntimeConfigValue("cat_wander_head_speed", 0.28),
        natural: naturalSpeed,
        rootSpeed: gait.clockSpeed,
        speedRatio: gait.speedStrideRatio,
        stride: gait.clockStrideLength,
        cfgStride: gait.configuredStrideLength,
        phase: gait.phase,
        phaseAdv: gait.phaseAdvance,
        moving: gait.clockMoving,
        lastPaw: gait.lastReleasedPaw || "-",
        release: gait.lastReleasePlan?.reason || "-",
        heldRepeat: gait.lastReleasePlan?.repeatHeldPaws?.join(",") || "-",
        cooldown: gait.releaseCooldown,
        support: support.state || "-",
        planted: countState("planted"),
        landing: countState("landing"),
        hanging: countState("hanging"),
        targetDist: targetDistance,
      },
      poses: {
        ...common,
        pose: this.getCurrentCatPose(),
        editing: this.bool(this.catState?.poseEditing),
        paused: this.bool(movementTest.paused),
        changed: Object.keys(this.getCatPoseOverrideState()[this.getCurrentCatPose()] || {}).length,
      },
      anatomy: {
        body: anatomy?.body?.length,
        height: anatomy?.body?.height,
        frontLeg: anatomy?.front?.totalLength,
        rearLeg: anatomy?.rear?.totalLength,
        fSeg: anatomy?.front
          ? `${this.formatCatTuningValue(anatomy.front.upperLength)}/${this.formatCatTuningValue(anatomy.front.lowerLength)}/${this.formatCatTuningValue(anatomy.front.pasternLength)}`
          : "-",
        rSeg: anatomy?.rear
          ? `${this.formatCatTuningValue(anatomy.rear.upperLength)}/${this.formatCatTuningValue(anatomy.rear.lowerLength)}/${this.formatCatTuningValue(anatomy.rear.footLength)}`
          : "-",
        bellyOffset: belly.bellyToSpineOffset,
        bellyLen: belly.bellyLength,
        spineLen: belly.spineLength,
      },
      debug: {
        ...common,
        facing: rig?.solvedFrontSign === 1 ? "right" : "left",
        support: support.state || "-",
        overrides: overrides.length ? overrides.join(",") : "-",
      },
      render: {
        ...common,
        mode: this.getCatRenderMode(),
        default: this.c.cat_render_mode || "skeleton",
        skeleton: this.formatCatLayerReadout("skeleton"),
        body: this.formatCatLayerReadout("body_surface"),
        chest: this.formatCatLayerReadout("chest_surface"),
        contour: this.formatCatLayerReadout("body_contour_surface"),
        rear: this.formatCatLayerReadout("rear_surface"),
        front: this.formatCatLayerReadout("front_surface"),
        tail: this.formatCatLayerReadout("tail_surface"),
        head: this.formatCatLayerReadout("head"),
      },
      fine_tune: {
        ...common,
        surface: this.getCatFineTuneSurface()?.label || "-",
        changed: this.getCatFineTuneChangedValues().length,
        selected: this.getCatFineTuneHighlight()
          ? `${this.getCatFineTuneHighlight().surface}.${this.getCatFineTuneHighlight().node}`
          : "-",
      },
    };

    return readouts[section] || readouts.mood;
  }

  renderCatTuningReadouts(section) {
    const readouts = this.getCatTuningReadouts(section);

    return `
      <div class="cat-tuning-readouts">
        ${Object.entries(readouts)
          .map(
            ([key, value]) =>
              `<div title="${this.esc(key)}: ${this.esc(String(value ?? "-"))}">${this.esc(key)}: ${this.formatCatTuningValue(value)}</div>`
          )
          .join("")}
      </div>
    `;
  }

  renderCatTuningSlider([name, min, max, step]) {
    const value = Number(this.getCatRuntimeConfigValue(name, this.c[name]));
    const defaultValue = this.c[name];
    const overridden = Object.prototype.hasOwnProperty.call(
      this.catState?.tuningOverrides || {},
      name
    );

    return `
      <label class="cat-tuning-row">
        <span title="${this.esc(name)}: ${this.esc(this.getCatTuningControlDescription(name))}">
          <span>${this.esc(name.replace(/^cat_/, ""))}${overridden ? " *" : ""}</span>
          ${
            this.getCatTuningControlDescription(name)
              ? `<small>${this.esc(this.getCatTuningControlDescription(name))}</small>`
              : ""
          }
        </span>
        <input
          type="range"
          min="${min}"
          max="${max}"
          step="${step}"
          value="${Number.isFinite(value) ? value : min}"
          data-cat-tune="${this.esc(name)}"
        />
        <span title="${this.esc(name)} current/default">${this.formatCatTuningValue(value)} / default ${this.formatCatTuningValue(defaultValue)}</span>
      </label>
    `;
  }

  renderCatTuningControl(control) {
    if (control?.type === "heading") {
      return `<div class="cat-tuning-subsection">${this.esc(control.label)}</div>`;
    }

    return this.renderCatTuningSlider(control);
  }

  renderCatTuningSubsectionTabs(section) {
    const subsections = this.getCatTuningSubsections(section);
    if (subsections.length <= 1) return "";

    const activeSubsection = this.getCatTuningSubsection(section);

    return `
      <div class="cat-tuning-subtabs" aria-label="${this.esc(section)} tuning area">
        ${subsections
          .map(
            (subsection) => `
              <button
                type="button"
                class="cat-tuning-button${subsection.id === activeSubsection ? " active" : ""}"
                data-cat-tuning-subsection="${this.esc(subsection.id)}"
              >${this.esc(subsection.label)}</button>
            `
          )
          .join("")}
      </div>
    `;
  }

  renderCatTuningLab() {
    if (this.isCatTrueWanderMode()) return "";
    if (!this.bool(this.c.show_cat_tuning_lab)) return "";
    if (!this.shouldRenderCat || !this.shouldRenderCat()) return "";

    const section = this.getCatTuningSection();
    const collapsed = this.bool(this.catState?.tuningCollapsed);
    const sections = [
      ["mood", "Mood"],
      ["movement", "Movement"],
      ["anatomy", "Anatomy"],
      ["poses", "Poses"],
      ["render", "Render"],
      ["debug", "Debug"],
      ["fine_tune", "Fine tune"],
    ];

    const controls = this.getCatTuningVisibleControls(section);
    const activeSubsection = this.getCatTuningSubsection(section);
    const activeSubsectionLabel =
      this.getCatTuningSubsections(section).find(
        (subsection) => subsection.id === activeSubsection
      )?.label || section;
    const body = collapsed
      ? ""
      : `
        <div class="cat-tuning-tabs" aria-label="What do you want to adjust?">
          ${sections
            .map(
              ([id, label]) => `
                <button
                  type="button"
                  class="cat-tuning-button${id === section ? " active" : ""}"
                  data-cat-tuning-section="${id}"
                >${label}</button>
              `
            )
            .join("")}
        </div>

        ${this.renderCatTuningSubsectionTabs(section)}

        ${
          section === "mood"
            ? this.renderCatMoodControls({ force: true }).replace("cat-mood-controls", "cat-tuning-tabs")
            : ""
        }

        ${
          section === "debug"
            ? this.renderCatTuningDebugControls()
            : section === "poses"
              ? this.renderCatTuningPoseControls()
            : section === "fine_tune"
              ? this.renderCatTuningFineTuneControls()
            : `
              ${section === "render" ? this.renderCatTuningRenderControls() : ""}
              ${section === "movement" && activeSubsection === "travel" ? this.renderCatTuningMovementControls() : ""}
              ${controls.map((control) => this.renderCatTuningControl(control)).join("")}
            `
        }

        <div class="cat-tuning-actions">
          <button type="button" class="cat-tuning-button" data-cat-tuning-reset-section="1">reset ${this.esc(activeSubsection ? activeSubsectionLabel : section)}</button>
          ${
            section === "mood"
              ? `<button type="button" class="cat-tuning-button" data-cat-mood-reset="1">reset mood</button>`
              : ""
          }
        </div>

        ${this.renderCatTuningReadouts(section)}
      `;

    return `
      <div class="cat-tuning-lab" data-cat-tuning-lab="1">
        <div class="cat-tuning-lab-header">
          <span>What do you want to adjust?</span>
          <button type="button" class="cat-tuning-button" data-cat-tuning-collapse="1">${collapsed ? "open" : "hide"}</button>
        </div>
        ${body}
      </div>
    `;
  }

  rememberCatTuningScroll() {
    if (!this.catState) this.catState = this.createInitialCatState();
    const panel = this.shadowRoot?.querySelector("[data-cat-tuning-lab]");
    if (panel) {
      this.catState.tuningScrollTop = Number(panel.scrollTop || 0);
    }
  }

  restoreCatTuningScroll() {
    const scrollTop = Number(this.catState?.tuningScrollTop || 0);
    if (!scrollTop) return;

    window.requestAnimationFrame(() => {
      const panel = this.shadowRoot?.querySelector("[data-cat-tuning-lab]");
      if (panel) panel.scrollTop = scrollTop;
    });
  }

  renderCatTuningLabPreservingScroll() {
    this.rememberCatTuningScroll();
    this.render();
    this.restoreCatTuningScroll();
  }

  renderCatTuningDebugControls() {
    const controls = this.getCatTuningVisibleControls("debug");
    return `
      ${this.renderCatTuningBoolControls(this.getCatTuningVisibleDebugNames())}
      ${controls.map((control) => this.renderCatTuningControl(control)).join("")}
    `;
  }

  getCatPoseControlNames() {
    return [
      "cat_v2_spine_angle",
      "cat_v2_spine_curve",
      "cat_v2_chest_height",
      "cat_v2_hip_height",
      "cat_v2_head_forward",
      "cat_v2_head_lift",
      "cat_v2_head_tilt",
      "cat_shoulder_joint_forward",
      "cat_hip_joint_forward",
      "cat_v2_front_near_paw_x",
      "cat_v2_front_far_paw_x",
      "cat_v2_rear_near_paw_x",
      "cat_v2_rear_far_paw_x",
      "cat_tail_base_angle",
      "cat_tail_lift",
      "cat_tail_curve",
    ];
  }

  getCatPoseControlRange(name) {
    const ranges = {
      cat_v2_spine_angle: [-35, 35, 1],
      cat_v2_spine_curve: [-18, 18, 0.5],
      cat_v2_chest_height: [-25, 45, 0.5],
      cat_v2_hip_height: [-50, 45, 0.5],
      cat_v2_head_forward: [-5, 55, 0.5],
      cat_v2_head_lift: [-20, 35, 0.5],
      cat_v2_head_tilt: [-45, 35, 1],
      cat_shoulder_joint_forward: [-12, 14, 0.1],
      cat_hip_joint_forward: [-16, 14, 0.1],
      cat_v2_front_near_paw_x: [-20, 60, 0.5],
      cat_v2_front_far_paw_x: [-20, 65, 0.5],
      cat_v2_rear_near_paw_x: [-35, 35, 0.5],
      cat_v2_rear_far_paw_x: [-40, 35, 0.5],
      cat_tail_base_angle: [-90, 70, 1],
      cat_tail_lift: [-60, 30, 0.5],
      cat_tail_curve: [-35, 35, 0.5],
    };

    return ranges[name] || [0, 1, 0.01];
  }

  renderCatPoseButtons({ includeEdit = false } = {}) {
    const current = this.getCurrentCatPose();
    return `
      <div class="cat-tuning-tabs" aria-label="Cat pose picker">
        ${this.getCatPoseNames()
          .map((pose) => `
            <button
              type="button"
              class="cat-tuning-button${pose === current ? " active" : ""}"
              data-cat-pose="${this.esc(pose)}"
            >${this.esc(pose)}</button>
          `)
          .join("")}
        ${
          includeEdit
            ? `<button
                type="button"
                class="cat-tuning-button${this.bool(this.catState?.poseEditing) ? " active" : ""}"
                data-cat-pose-edit-toggle="1"
              >${this.bool(this.catState?.poseEditing) ? "editing" : "edit pose"}</button>`
            : ""
        }
      </div>
    `;
  }

  renderCatPoseSlider(name) {
    const pose = this.getCurrentCatPose();
    const baseProfile = this.getCatPoseProfiles()[pose] || {};
    const liveProfile = this.getCatPoseProfileValues(pose);
    const [min, max, step] = this.getCatPoseControlRange(name);
    const value = Number(liveProfile[name] ?? this.c[name] ?? min);
    const defaultValue = baseProfile[name] ?? this.c[name] ?? 0;
    const overridden = Object.prototype.hasOwnProperty.call(
      this.getCatPoseOverrideState()[pose] || {},
      name
    );

    return `
      <label class="cat-tuning-row">
        <span title="${this.esc(name)}: ${this.esc(this.getCatTuningControlDescription(name))}">
          <span>${this.esc(name.replace(/^cat_/, ""))}${overridden ? " *" : ""}</span>
          ${
            this.getCatTuningControlDescription(name)
              ? `<small>${this.esc(this.getCatTuningControlDescription(name))}</small>`
              : ""
          }
        </span>
        <input
          type="range"
          min="${min}"
          max="${max}"
          step="${step}"
          value="${Number.isFinite(value) ? value : min}"
          data-cat-pose-tune="${this.esc(name)}"
          data-cat-pose-name="${this.esc(pose)}"
        />
        <span>${this.formatCatTuningValue(value)} / pose ${this.formatCatTuningValue(defaultValue)}</span>
      </label>
    `;
  }

  getCatPoseChangedValues(pose = this.getCurrentCatPose()) {
    return Object.entries(this.getCatPoseOverrideState()[pose] || {})
      .filter(([, value]) => Math.abs(Number(value) || 0) > 0.001)
      .sort(([a], [b]) => a.localeCompare(b));
  }

  renderCatTuningPoseControls() {
    const pose = this.getCurrentCatPose();
    const changed = this.getCatPoseChangedValues(pose);
    const poseBlock = {
      [pose]: {
        ...(this.getCatPoseProfiles()[pose] || {}),
        ...(this.getCatPoseOverrideState()[pose] || {}),
      },
    };

    return `
      <div class="cat-fine-tune-panel">
        ${this.renderCatPoseButtons({ includeEdit: true })}
        <div class="cat-fine-tune-note">
          Pose editing pauses auto-wander/gait and applies broad skeleton/root-level overrides. Mood posture offsets are damped while a non-stand pose is active.
        </div>
        <div class="cat-tuning-actions">
          <button type="button" class="cat-tuning-button" data-cat-pose-reset="${this.esc(pose)}">reset ${this.esc(pose)} edits</button>
          <button type="button" class="cat-tuning-button" data-cat-pose-stand="1">return to stand</button>
        </div>
        ${this.getCatPoseControlNames().map((name) => this.renderCatPoseSlider(name)).join("")}
        <div class="cat-fine-tune-readout">
          <strong>Changed ${this.esc(pose)} pose values</strong>
          <pre>${this.esc(
            changed.length
              ? changed.map(([name, value]) => `${name}: ${this.formatCatTuningValue(value)}`).join("\n")
              : "No pose edits changed."
          )}</pre>
          <strong>Pasteable pose profile</strong>
          <pre>${this.esc(JSON.stringify(poseBlock, null, 2))}</pre>
        </div>
      </div>
    `;
  }

  renderCatTuningFineTuneControls() {
    const surface = this.getCatFineTuneSurface();
    if (!surface) return "";

    const changedValues = this.getCatFineTuneChangedValues(surface.key);
    const allChangedValues = this.getCatFineTuneChangedValues();

    return `
      <div class="cat-fine-tune-panel">
        <div class="cat-tuning-actions">
          <button type="button" class="cat-tuning-button" data-cat-ft-reset-surface="${this.esc(surface.key)}">reset ${this.esc(surface.label)}</button>
          <button type="button" class="cat-tuning-button" data-cat-ft-reset-all="1">reset all fine tune</button>
        </div>
        ${
          surface.note
            ? `<div class="cat-fine-tune-note">${this.esc(surface.note)}</div>`
            : ""
        }
        <div class="cat-fine-tune-note">
          X/Y node offsets are authored in the left-facing cat view; X offsets mirror automatically when the cat turns.
        </div>
        ${
          surface.semanticControls?.length
            ? `<div class="cat-fine-tune-semantic">
                ${surface.semanticControls.map((control) => this.renderCatTuningSlider(control)).join("")}
              </div>`
            : ""
        }
        ${
          surface.nodes?.length
            ? `<div class="cat-fine-tune-node-list">
                ${surface.nodes
                  .map(([nodeKey, description]) => this.renderCatFineTuneNodeControl(surface, nodeKey, description))
                  .join("")}
              </div>`
            : ""
        }
        <div class="cat-fine-tune-readout">
          <strong>Changed ${this.esc(surface.label)} values</strong>
          <pre>${this.esc(
            changedValues.length
              ? changedValues.map(([name, value]) => `${name}: ${this.formatCatTuningValue(value)}`).join("\n")
              : "No fine-tune offsets changed for this surface."
          )}</pre>
          <strong>All changed fine-tune values</strong>
          <pre>${this.esc(
            allChangedValues.length
              ? allChangedValues.map(([name, value]) => `${name}: ${this.formatCatTuningValue(value)}`).join("\n")
              : "No fine-tune offsets changed."
          )}</pre>
        </div>
      </div>
    `;
  }

  renderCatFineTuneNodeControl(surface, nodeKey, description = "") {
    const offset = this.getCatFineTuneOffset(surface.key, nodeKey);
    const changed = this.isCatFineTuneNodeChanged(surface.key, nodeKey);
    const highlighted = this.isCatFineTuneNodeHighlighted(surface.key, nodeKey);
    const renderAxis = (axis) => {
      const name = this.getCatFineTuneOffsetName(surface.key, nodeKey, axis);
      const value = Number(offset[axis] || 0);

      return `
        <label class="cat-fine-tune-axis">
          <span>${axis.toUpperCase()}</span>
          <input
            type="range"
            min="-12"
            max="12"
            step="0.1"
            value="${value}"
            data-cat-ft="${this.esc(name)}"
            data-cat-ft-surface="${this.esc(surface.key)}"
            data-cat-ft-node="${this.esc(nodeKey)}"
          />
          <span>${this.formatCatTuningValue(value)}</span>
        </label>
      `;
    };

    return `
      <div class="cat-fine-tune-node${changed ? " changed" : ""}${highlighted ? " active" : ""}">
        <div class="cat-fine-tune-node-head">
          <button
            type="button"
            class="cat-tuning-button${highlighted ? " active" : ""}"
            data-cat-ft-highlight-surface="${this.esc(surface.key)}"
            data-cat-ft-highlight-node="${this.esc(nodeKey)}"
          >highlight</button>
          <span>
            <strong>${this.esc(nodeKey)}${changed ? " *" : ""}</strong>
            ${description ? `<small>${this.esc(description)}</small>` : ""}
          </span>
          <button
            type="button"
            class="cat-tuning-button"
            data-cat-ft-reset-node-surface="${this.esc(surface.key)}"
            data-cat-ft-reset-node="${this.esc(nodeKey)}"
          >reset</button>
        </div>
        <div class="cat-fine-tune-axis-row">
          ${renderAxis("x")}
          ${renderAxis("y")}
        </div>
        <div class="cat-fine-tune-node-readout">
          ${this.esc(surface.key)}.${this.esc(nodeKey)}:
          x ${this.formatCatTuningValue(offset.x)} / y ${this.formatCatTuningValue(offset.y)}
          / default 0,0
        </div>
      </div>
    `;
  }

  renderCatTuningBoolControls(names) {
    const labels = {
      show_cat_candidate_array: "candidate array",
      show_cat_pixel_preview: "pixel feline V1",
      cat_pixel_walk_experimental: "animate four frames",
      cat_pixel_self_walk: "move one cell per frame",
      show_cat_pixel_grid: "pixel grid",
      show_cat_pixel_paw_debug: "highlight paws",
    };
    return names
      .map((name) => {
        const value = this.bool(this.getCatRuntimeConfigValue(name, this.c[name]));
        return `
          <label class="cat-tuning-row">
            <span>${this.esc(labels[name] || name.replace(/^show_cat_/, ""))}</span>
            <input type="checkbox" data-cat-tune-bool="${this.esc(name)}" ${value ? "checked" : ""} />
            <span>${value ? "on" : "off"} / default ${this.bool(this.c[name]) ? "on" : "off"}</span>
          </label>
        `;
      })
      .join("");
  }

  getCatRenderMode() {
    const mode = String(
      this.getCatRuntimeConfigValue("cat_render_mode", this.c.cat_render_mode || "skeleton")
    );

    return ["skeleton", "surface", "silhouette"].includes(mode)
      ? mode
      : "skeleton";
  }

  renderCatTuningRenderControls() {
    return `
      <div class="cat-tuning-render-layers">
        ${this.getCatRenderLayerControls()
          .map((layer) => this.renderCatRenderLayerControl(layer))
          .join("")}
        ${this.renderCatBellyGuideLayerControl()}
      </div>
    `;
  }

  getCatRenderLayerControls() {
    return [
      {
        key: "skeleton",
        label: "Skeleton",
        visible: "show_cat_render_skeleton",
        opacity: "cat_render_skeleton_opacity",
      },
      {
        key: "body_surface",
        label: "Body",
        visible: "show_cat_render_body_surface",
        opacity: "cat_render_body_surface_opacity",
      },
      {
        key: "chest_surface",
        label: "Chest",
        visible: "show_cat_render_chest_surface",
        opacity: "cat_render_chest_surface_opacity",
      },
      {
        key: "body_contour_surface",
        label: "Body contour",
        visible: "show_cat_render_body_contour_surface",
        opacity: "cat_render_body_contour_surface_opacity",
      },
      {
        key: "collar_surface",
        label: "Collar",
        visible: "show_cat_render_collar_surface",
        opacity: "cat_render_collar_surface_opacity",
      },
      {
        key: "rear_surface",
        label: "Rear legs",
        visible: "show_cat_render_rear_surface",
        opacity: "cat_render_rear_surface_opacity",
      },
      {
        key: "front_surface",
        label: "Front legs",
        visible: "show_cat_render_front_surface",
        opacity: "cat_render_front_surface_opacity",
      },
      {
        key: "topline",
        label: "Topline",
        visible: "show_cat_render_topline",
        opacity: "cat_render_topline_opacity",
      },
      {
        key: "belly_surface",
        label: "Belly contour",
        visible: "show_cat_render_belly_surface",
        opacity: "cat_render_belly_surface_opacity",
      },
      {
        key: "tail_surface",
        label: "Tail",
        visible: "show_cat_render_tail_surface",
        opacity: "cat_render_tail_surface_opacity",
      },
      {
        key: "head",
        label: "Head",
        visible: "show_cat_render_head",
        opacity: "cat_render_head_opacity",
      },
    ];
  }

  getCatRenderLayerControl(key) {
    return this.getCatRenderLayerControls().find((layer) => layer.key === key) || null;
  }

  isCatRenderLayerVisible(key) {
    const layer = this.getCatRenderLayerControl(key);
    if (!layer) return true;
    return this.bool(this.getCatRuntimeConfigValue(layer.visible, this.c[layer.visible]));
  }

  getCatRenderLayerOpacity(key) {
    const layer = this.getCatRenderLayerControl(key);
    if (!layer) return 1;

    return this.clamp(
      Number(this.getCatRuntimeConfigValue(layer.opacity, this.c[layer.opacity] ?? 1)),
      0,
      1
    );
  }

  formatCatLayerReadout(key) {
    const visible = this.isCatRenderLayerVisible(key);
    const opacity = this.getCatRenderLayerOpacity(key);
    return `${visible ? "on" : "off"} ${this.formatCatTuningValue(opacity)}`;
  }

  hasVisibleCatSurfaceLayers() {
    return [
      "body_surface",
      "chest_surface",
      "body_contour_surface",
      "collar_surface",
      "rear_surface",
      "front_surface",
      "topline",
      "belly_surface",
      "tail_surface",
    ].some((key) => this.isCatRenderLayerVisible(key));
  }

  renderCatRenderLayerControl(layer) {
    const visible = this.bool(this.getCatRuntimeConfigValue(layer.visible, this.c[layer.visible]));
    const opacity = this.getCatRenderLayerOpacity(layer.key);
    const defaultOpacity = this.c[layer.opacity];
    const visibleChanged = Object.prototype.hasOwnProperty.call(
      this.catState?.tuningOverrides || {},
      layer.visible
    );
    const opacityChanged = Object.prototype.hasOwnProperty.call(
      this.catState?.tuningOverrides || {},
      layer.opacity
    );

    return `
      <label class="cat-tuning-row cat-render-layer-row">
        <span title="${this.esc(layer.visible)} / ${this.esc(layer.opacity)}">
          <span>${this.esc(layer.label)}${visibleChanged || opacityChanged ? " *" : ""}</span>
          <small>${this.esc(layer.key)}</small>
        </span>
        <input type="checkbox" data-cat-tune-bool="${this.esc(layer.visible)}" ${visible ? "checked" : ""} />
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value="${opacity}"
          data-cat-tune="${this.esc(layer.opacity)}"
        />
        <span>${visible ? "on" : "off"} ${this.formatCatTuningValue(opacity)} / default ${this.formatCatTuningValue(defaultOpacity)}</span>
      </label>
    `;
  }

  renderCatBellyGuideLayerControl() {
    const visible = this.bool(
      this.getCatRuntimeConfigValue("show_cat_belly_line", this.c.show_cat_belly_line)
    );
    const opacity = this.clamp(
      Number(this.getCatRuntimeConfigValue("cat_belly_line_opacity", this.c.cat_belly_line_opacity)),
      0,
      1
    );
    const changed =
      Object.prototype.hasOwnProperty.call(this.catState?.tuningOverrides || {}, "show_cat_belly_line") ||
      Object.prototype.hasOwnProperty.call(this.catState?.tuningOverrides || {}, "cat_belly_line_opacity");

    return `
      <label class="cat-tuning-row cat-render-layer-row">
        <span title="show_cat_belly_line / cat_belly_line_opacity">
          <span>Belly guide${changed ? " *" : ""}</span>
          <small>debug guide</small>
        </span>
        <input type="checkbox" data-cat-tune-bool="show_cat_belly_line" ${visible ? "checked" : ""} />
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value="${opacity}"
          data-cat-tune="cat_belly_line_opacity"
        />
        <span>${visible ? "on" : "off"} ${this.formatCatTuningValue(opacity)} / default ${this.formatCatTuningValue(this.c.cat_belly_line_opacity)}</span>
      </label>
    `;
  }

  getCatTuningDebugNames() {
    return this.getCatTuningVisibleDebugNames();
  }

  getCatTuningVisibleDebugNames() {
    const subsection = this.getCatTuningSubsection("debug");
    const groups = {
      rig: ["show_cat_debug", "show_cat_debug_skeleton"],
      nodes: [
        "show_cat_debug",
        "show_cat_body_nodes",
        "show_cat_limb_nodes",
        "show_cat_head_nodes",
        "show_cat_tail_nodes",
        "show_cat_ear_nodes",
      ],
      body_contour: [
        "show_cat_debug",
        "show_cat_body_contour_nodes",
        "show_cat_body_contour_labels",
      ],
      tail_surface: [
        "show_cat_debug",
        "show_cat_tail_surface_nodes",
        "show_cat_tail_surface_labels",
      ],
      collar: [
        "show_cat_debug",
        "show_cat_collar_nodes",
        "show_cat_collar_labels",
      ],
      paws: ["show_cat_debug", "show_cat_paw_contact_debug"],
      labels: [
        "show_cat_debug",
        "show_cat_support_debug_label",
        "show_cat_mood_debug_label",
      ],
      bounds: ["show_cat_debug", "show_cat_bounds"],
      experiments: [
        "show_cat_candidate_array",
        "show_cat_pixel_preview",
        "cat_pixel_walk_experimental",
        "cat_pixel_self_walk",
        "show_cat_pixel_grid",
        "show_cat_pixel_paw_debug",
      ],
    };

    return groups[subsection] || [
      "show_cat_debug",
      "show_cat_debug_skeleton",
      "show_cat_body_nodes",
      "show_cat_limb_nodes",
      "show_cat_head_nodes",
      "show_cat_tail_nodes",
      "show_cat_ear_nodes",
      "show_cat_body_contour_nodes",
      "show_cat_body_contour_labels",
      "show_cat_tail_surface_nodes",
      "show_cat_tail_surface_labels",
      "show_cat_collar_nodes",
      "show_cat_collar_labels",
      "show_cat_paw_contact_debug",
      "show_cat_support_debug_label",
      "show_cat_mood_debug_label",
      "show_cat_bounds",
      "show_cat_candidate_array",
      "show_cat_pixel_preview",
      "cat_pixel_walk_experimental",
      "cat_pixel_self_walk",
      "show_cat_pixel_grid",
      "show_cat_pixel_paw_debug",
    ];
  }

  renderCatTuningMovementControls() {
    const autoEnabled = this.getCatAutoWanderEnabled();
    const movementTest = this.getCatMovementTestState();
    const continuous = this.bool(movementTest.continuousWalk);
    const paused = this.bool(movementTest.paused);
    const direction = Number(movementTest.direction || 1) >= 0 ? 1 : -1;

    return `
      <div class="cat-tuning-tabs">
        <button
          type="button"
          class="cat-tuning-button${autoEnabled ? " active" : ""}"
          data-cat-auto-toggle="1"
        >auto-wander ${autoEnabled ? "on" : "off"}</button>
        <button
          type="button"
          class="cat-tuning-button${paused ? " active" : ""}"
          data-cat-movement-pause-toggle="1"
        >${paused ? "resume" : "pause"}</button>
        <button
          type="button"
          class="cat-tuning-button${continuous ? " active" : ""}"
          data-cat-continuous-toggle="1"
        >continuous walk</button>
        <button
          type="button"
          class="cat-tuning-button${continuous && direction < 0 ? " active" : ""}"
          data-cat-continuous-direction="-1"
        >left</button>
        <button
          type="button"
          class="cat-tuning-button${continuous && direction > 0 ? " active" : ""}"
          data-cat-continuous-direction="1"
        >right</button>
        <button
          type="button"
          class="cat-tuning-button"
          data-cat-continuous-reset-position="1"
        >reset pos</button>
      </div>
      <div class="cat-fine-tune-note">Pose preview pauses movement so you can inspect the pose without gait fighting it.</div>
      ${this.renderCatPoseButtons()}
    `;
  }

  renderCatMovementTargetMarker() {
    if (!this.bool(this.c.show_cat_tuning_lab)) return "";
    if (this.getCatTuningSection() !== "movement") return "";

    const auto = this.catState?.autoWander;
    const current = auto?.currentAnchor || this.catState?.rig?.anchor;
    const target = auto?.target;

    if (!current || !target) return "";

    const movementTest = this.getCatMovementTestState();
    const continuous = this.bool(movementTest.continuousWalk);
    const direction = Number(movementTest.direction || 1) >= 0 ? 1 : -1;
    const worldWidth = this.getWorldWidth();
    const worldHeight = this.getWorldHeight();
    const displayTarget = continuous
      ? {
          x: Number(current.x) + direction * Math.min(120, worldWidth * 0.22),
          y: Number(current.y),
        }
      : {
          x: Number(target.x),
          y: Number(target.y),
        };

    const clampedTarget = {
      x: this.clamp(displayTarget.x, 0, worldWidth),
      y: this.clamp(displayTarget.y, 0, worldHeight),
    };

    return `
      <g class="cat-movement-target" data-target-source="${this.esc(target.source || "wander")}">
        <line
          x1="${Number(current.x)}"
          y1="${Number(current.y)}"
          x2="${clampedTarget.x}"
          y2="${clampedTarget.y}"
          class="cat-movement-target-line"
        />
        <circle
          cx="${clampedTarget.x}"
          cy="${clampedTarget.y}"
          r="3.5"
          class="cat-movement-target-point"
        />
      </g>
    `;
  }

  attachCatTuningLab() {
    this.shadowRoot.querySelectorAll("[data-cat-tuning-section]").forEach((button) => {
      button.addEventListener("pointerdown", (event) => event.stopPropagation());
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!this.catState) this.catState = this.createInitialCatState();
        this.catState.tuningSection = button.getAttribute("data-cat-tuning-section");
        this.renderCatTuningLabPreservingScroll();
      });
    });

    this.shadowRoot.querySelectorAll("[data-cat-tuning-subsection]").forEach((button) => {
      button.addEventListener("pointerdown", (event) => event.stopPropagation());
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!this.catState) this.catState = this.createInitialCatState();
        const section = this.getCatTuningSection();
        if (!this.catState.tuningSubsections) this.catState.tuningSubsections = {};
        this.catState.tuningSubsections[section] = button.getAttribute("data-cat-tuning-subsection");
        this.renderCatTuningLabPreservingScroll();
      });
    });

    this.shadowRoot.querySelectorAll("[data-cat-tune]").forEach((input) => {
      input.addEventListener("pointerdown", (event) => event.stopPropagation());
      input.addEventListener("input", (event) => {
        event.stopPropagation();
        this.setCatRuntimeConfigValue(input.getAttribute("data-cat-tune"), input.value);
        const valueLabel = input.parentElement?.querySelector("span:last-child");
        if (valueLabel) {
          const name = input.getAttribute("data-cat-tune");
          valueLabel.textContent = `${this.formatCatTuningValue(input.value)} / default ${this.formatCatTuningValue(this.c[name])}`;
        }
      });
      input.addEventListener("change", (event) => {
        event.stopPropagation();
        this.renderCatTuningLabPreservingScroll();
      });
    });

    this.shadowRoot.querySelectorAll("[data-cat-tune-bool]").forEach((input) => {
      input.addEventListener("pointerdown", (event) => event.stopPropagation());
      input.addEventListener("change", (event) => {
        event.stopPropagation();
        this.setCatRuntimeConfigValue(input.getAttribute("data-cat-tune-bool"), input.checked);
        this.renderCatTuningLabPreservingScroll();
      });
    });

    this.shadowRoot.querySelectorAll("[data-cat-pose]").forEach((button) => {
      button.addEventListener("pointerdown", (event) => event.stopPropagation());
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const editing = this.getCatTuningSection() === "poses";
        this.setLiveCatPose(button.getAttribute("data-cat-pose"), {
          editing,
          pauseMovement: true,
        });
        this.renderCatTuningLabPreservingScroll();
      });
    });

    this.shadowRoot.querySelectorAll("[data-cat-pose-edit-toggle]").forEach((button) => {
      button.addEventListener("pointerdown", (event) => event.stopPropagation());
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!this.catState) this.catState = this.createInitialCatState();
        const next = !this.bool(this.catState.poseEditing);
        this.catState.poseEditing = next;
        this.getCatMovementTestState().paused = next;
        if (next) {
          this.stopCatAutoWander?.({ clearOverride: false });
        } else if (this.getCurrentCatPose() === "stand" && this.getCatAutoWanderEnabled()) {
          this.startCatAutoWander();
        }
        this.renderCatTuningLabPreservingScroll();
      });
    });

    this.shadowRoot.querySelectorAll("[data-cat-pose-tune]").forEach((input) => {
      input.addEventListener("pointerdown", (event) => event.stopPropagation());
      input.addEventListener("input", (event) => {
        event.stopPropagation();
        this.setCatPoseProfileValue(
          input.getAttribute("data-cat-pose-name"),
          input.getAttribute("data-cat-pose-tune"),
          input.value
        );
      });
      input.addEventListener("change", (event) => {
        event.stopPropagation();
        this.renderCatTuningLabPreservingScroll();
      });
    });

    this.shadowRoot.querySelectorAll("[data-cat-pose-reset]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.resetCatPoseProfileValue(button.getAttribute("data-cat-pose-reset"));
        this.renderCatTuningLabPreservingScroll();
      });
    });

    this.shadowRoot.querySelectorAll("[data-cat-pose-stand]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.setLiveCatPose("stand", { editing: false, pauseMovement: true });
        this.renderCatTuningLabPreservingScroll();
      });
    });

    this.shadowRoot.querySelectorAll("[data-cat-ft]").forEach((input) => {
      input.addEventListener("pointerdown", (event) => event.stopPropagation());
      input.addEventListener("input", (event) => {
        event.stopPropagation();
        const surface = input.getAttribute("data-cat-ft-surface");
        const node = input.getAttribute("data-cat-ft-node");
        this.setCatFineTuneHighlight(surface, node);
        this.setCatRuntimeConfigValue(input.getAttribute("data-cat-ft"), input.value);
      });
      input.addEventListener("change", (event) => {
        event.stopPropagation();
        this.renderCatTuningLabPreservingScroll();
      });
    });

    this.shadowRoot.querySelectorAll("[data-cat-ft-highlight-surface]").forEach((button) => {
      button.addEventListener("pointerdown", (event) => event.stopPropagation());
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.setCatFineTuneHighlight(
          button.getAttribute("data-cat-ft-highlight-surface"),
          button.getAttribute("data-cat-ft-highlight-node")
        );
        this.renderCatTuningLabPreservingScroll();
      });
    });

    this.shadowRoot.querySelectorAll("[data-cat-ft-reset-node]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.resetCatFineTuneNode(
          button.getAttribute("data-cat-ft-reset-node-surface"),
          button.getAttribute("data-cat-ft-reset-node")
        );
        this.renderCatTuningLabPreservingScroll();
      });
    });

    this.shadowRoot.querySelectorAll("[data-cat-ft-reset-surface]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.resetCatFineTuneSurface(button.getAttribute("data-cat-ft-reset-surface"));
        this.renderCatTuningLabPreservingScroll();
      });
    });

    this.shadowRoot.querySelectorAll("[data-cat-ft-reset-all]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.resetAllCatFineTuneValues();
        this.renderCatTuningLabPreservingScroll();
      });
    });

    this.shadowRoot.querySelectorAll("[data-cat-render-mode]").forEach((button) => {
      button.addEventListener("pointerdown", (event) => event.stopPropagation());
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.setCatRuntimeConfigValue(
          "cat_render_mode",
          button.getAttribute("data-cat-render-mode")
        );
        this.renderCatTuningLabPreservingScroll();
      });
    });

    this.shadowRoot.querySelectorAll("[data-cat-tuning-reset-section]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.rememberCatTuningScroll();
        this.resetCatTuningSection();
        this.restoreCatTuningScroll();
      });
    });

    this.shadowRoot.querySelectorAll("[data-cat-auto-toggle]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const next = !this.getCatAutoWanderEnabled();
        this.setCatRuntimeConfigValue("cat_auto_wander", next);
        if (next) {
          this.getCatMovementTestState().paused = false;
          const auto = this.getCatAutoWanderState();
          auto.idleUntil = 0;
          this.startCatAutoWander();
        } else {
          this.stopCatAutoWander?.({ clearOverride: false });
        }
        this.renderCatTuningLabPreservingScroll();
      });
    });

    this.shadowRoot.querySelectorAll("[data-cat-movement-pause-toggle]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const state = this.getCatMovementTestState();
        state.paused = !this.bool(state.paused);
        if (state.paused) {
          this.stopCatAutoWander?.({ clearOverride: false });
        } else if (this.getCatAutoWanderEnabled()) {
          const auto = this.getCatAutoWanderState();
          auto.idleUntil = 0;
          this.startCatAutoWander();
        }
        this.renderCatTuningLabPreservingScroll();
        if (this.updateCatLayer) this.updateCatLayer();
        if (this.updateCatDebugLayer) this.updateCatDebugLayer();
      });
    });

    this.shadowRoot.querySelectorAll("[data-cat-continuous-toggle]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const state = this.getCatMovementTestState();
        state.continuousWalk = !this.bool(state.continuousWalk);
        if (state.continuousWalk) {
          state.paused = false;
          this.setCatRuntimeConfigValue("cat_auto_wander", true);
          const auto = this.getCatAutoWanderState();
          auto.target = this.chooseCatAutoWanderTarget();
          auto.idleUntil = 0;
          this.startCatAutoWander();
        }
        this.renderCatTuningLabPreservingScroll();
      });
    });

    this.shadowRoot.querySelectorAll("[data-cat-continuous-direction]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const state = this.getCatMovementTestState();
        state.direction = Number(button.getAttribute("data-cat-continuous-direction")) >= 0 ? 1 : -1;
        state.continuousWalk = true;
        state.paused = false;
        this.setCatRuntimeConfigValue("cat_auto_wander", true);
        const auto = this.getCatAutoWanderState();
        auto.target = this.chooseCatAutoWanderTarget();
        auto.idleUntil = 0;
        this.startCatAutoWander();
        this.renderCatTuningLabPreservingScroll();
      });
    });

    this.shadowRoot.querySelectorAll("[data-cat-continuous-reset-position]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.resetCatLocomotionTestPosition();
      });
    });

    this.shadowRoot.querySelectorAll("[data-cat-mood-reset]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (this.catState) this.catState.liveMood = null;
        this.renderCatTuningLabPreservingScroll();
        if (this.updateCatLayer) this.updateCatLayer();
        if (this.updateCatDebugLayer) this.updateCatDebugLayer();
      });
    });

    this.shadowRoot.querySelectorAll("[data-cat-tuning-collapse]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!this.catState) this.catState = this.createInitialCatState();
        this.catState.tuningCollapsed = !this.bool(this.catState.tuningCollapsed);
        this.renderCatTuningLabPreservingScroll();
      });
    });
  }

  getCatFocusCameraPoint({ worldWidth, worldHeight } = {}) {
    /*
      Cat focus should follow the solved cat, not the configured spawn point.

      Use the live rig bounds when they exist so dragging/auto-wander stay in
      frame. Y is blended back towards the floor anchor because an expressive
      tail can make the full bounds centre much too high for leg/gait tuning.
    */

    const rig = this.catState?.rig;
    const bounds = rig?.bounds;
    const fallback = {
      x: Number(this.c.cat_x),
      y: Number(this.c.cat_y),
    };

    let point = fallback;

    if (bounds) {
      const boundsCentre = {
        x: Number(bounds.x || 0) + Number(bounds.width || 0) * 0.5,
        y: Number(bounds.y || 0) + Number(bounds.height || 0) * 0.5,
      };

      const anchor = rig.anchor || fallback;

      point = {
        x: boundsCentre.x,
        y: this.lerp(boundsCentre.y, Number(anchor.y || boundsCentre.y), 0.38),
      };
    } else if (rig?.anchor) {
      point = {
        x: Number(rig.anchor.x),
        y: Number(rig.anchor.y),
      };
    }

    return {
      x: this.clamp(Number(point.x), 0, Number(worldWidth || this.getWorldWidth())),
      y: this.clamp(Number(point.y), 0, Number(worldHeight || this.getWorldHeight())),
    };
  }

  getWorldViewTransform({
    worldWidth,
    worldHeight,
    worldCentreX,
    worldCentreY,
    scale,
  }) {
    if (this.isCatFocusMode()) {
      const catFocusPoint = this.getCatFocusCameraPoint({
        worldWidth,
        worldHeight,
      });
      const catX = catFocusPoint.x;
      const catY = catFocusPoint.y;
      const catScale = Math.max(0.1, Number(this.c.cat_focus_scale) || 2.6);

      /*
        Cat focus keeps world coordinates intact, but visually zooms around the
        live cat. This lets us tune cat proportions without breaking POIs,
        floor coordinates, direct dragging, or future world interactions.
      */
      return `
        translate(${worldCentreX} ${worldCentreY})
        scale(${catScale})
        translate(${-catX} ${-catY})
      `;
    }

    if (this.isDudeFocusMode()) {
      const dudeX = this.clamp(
        Number(this.currentHead?.x || this.c.figure_x),
        0,
        worldWidth
      );

      const dudeY = this.clamp(
        Number(this.currentHead?.y || this.getEffectiveStandingY(this.c)),
        0,
        worldHeight
      );

      const dudeScale = Math.max(0.1, Number(this.c.scale) || scale || 1);

      return `
        translate(${worldCentreX} ${worldCentreY})
        scale(${dudeScale})
        translate(${-dudeX} ${-dudeY})
      `;
    }

    return `
      translate(${worldCentreX} ${worldCentreY})
      scale(${scale})
      translate(${-worldCentreX} ${-worldCentreY})
    `;
  }

  // ===========================================================================
  // 5. Input handling and temporary attention POIs
  // ===========================================================================
  /*
    Click/tap behaviour is now treated as a world signal.

    Instead of thinking "click means move the dude here", a click creates a
    temporary attention POI:

      click world
      -> create attention POI
      -> dude/cat/other characters may decide to investigate it

    For now, click_attention_poi_move_dude preserves the old behaviour by
    immediately sending the dude to the clicked point. Later this can become
    shared goal-selection logic for the dude and cat.
  */

  handleTap(event) {
    /*
      If a pointer drag has just been handled, do not also treat the release as
      a normal click/attention POI. This keeps cat manipulation separate from
      dude movement and POI creation.
    */
    if (this.consumeSuppressNextClick()) return;

    if (!this.bool(this.c.animate_on_tap)) return;

    const clickPosition = this.getSvgClickPosition(event);
    if (!clickPosition) return;

    const attentionPoi = this.createAttentionPoiFromClick(clickPosition);

    /*
      Existing behaviour compatibility:
      clicking can still move the dude immediately, but the click is now also
      represented as a temporary POI for future "look here" behaviour.
    */
    if (this.bool(this.c.click_attention_poi_move_dude)) {
      this.cancelAutoWander();

      const target = this.getTargetFromAttentionPoi(attentionPoi, {
        useFallback: !this.bool(this.c.click_sets_desired),
      });

      this.startMoveToTarget(target, {
        kind: "attention",
        poi: attentionPoi,
      });
    }

    /*
      Cat click behaviour is only scaffolded for now.
      Once the cat has a movement/goal system, this same attention POI can be
      used as an investigation target.
    */
    if (this.bool(this.c.click_attention_poi_move_cat)) {
      this.queueCatAttentionPoi(attentionPoi);
    }

    this.updateAttentionPoiLayer();
    this.updatePoiDebugLayer();

    if (this.updateCatDebugLayer) {
      this.updateCatDebugLayer();
    }
  }

  shouldAllowCatPointerInteraction() {
    if (!this.bool(this.c.cat_interaction_enabled)) return false;
    if (!this.bool(this.c.cat_drag_enabled)) return false;
    if (!this.shouldRenderCat()) return false;

    if (
      this.bool(this.c.cat_drag_require_cat_focus) &&
      !this.isCatFocusMode()
    ) {
      return false;
    }

    return true;
  }

  consumeSuppressNextClick() {
    const shouldSuppress = Boolean(this._suppressNextClick);
    this._suppressNextClick = false;
    return shouldSuppress;
  }

  suppressNextClick() {
    this._suppressNextClick = true;

    window.setTimeout(() => {
      this._suppressNextClick = false;
    }, 0);
  }

  getCatDragTargetId(worldPoint) {
    const mode = String(this.c.cat_drag_mode || "head");

    if (mode === "head") return "head";
    if (mode === "scruff") return "scruff";

    const nearest = this.findNearestCatInteractionTarget(worldPoint);
    return nearest?.id || "head";
  }

  handlePointerDown(event) {
    if (!this.shouldAllowCatPointerInteraction()) return;

    const worldPoint = this.getSvgClickPosition(event);
    if (!worldPoint) return;

    const targetId = this.getCatDragTargetId(worldPoint);
    const target =
      this.catState?.interactionTargets?.[targetId] ||
      this.findNearestCatInteractionTarget(worldPoint);

    if (!target || !target.point) return;

    const dx = worldPoint.x - target.point.x;
    const dy = worldPoint.y - target.point.y;
    const distance = Math.hypot(dx, dy);

    if (distance > Number(target.radius || 0)) {
      return;
    }

    /*
      We have captured a cat interaction.
      Prevent browser gestures and stop this becoming a normal card click.
    */
    event.preventDefault();
    event.stopPropagation();

    if (this.bool(this.c.cat_drag_prevent_dude_click)) {
      this.suppressNextClick();
    }

    this.beginCatInteractionSession({
      type: "drag_target",
      targetId,
      pointerId: event.pointerId,
      startWorld: worldPoint,
      source: "pointer",
    });

    this.setCatTargetOverride(targetId, worldPoint);

    const card = this.shadowRoot.querySelector("ha-card");
    if (card && card.setPointerCapture) {
      try {
        card.setPointerCapture(event.pointerId);
      } catch (_err) {
        // Some HA wrappers/browser combinations may not allow capture.
      }
    }

    window.addEventListener("pointermove", this._catPointerMoveHandler);
    window.addEventListener("pointerup", this._catPointerUpHandler);
    window.addEventListener("pointercancel", this._catPointerUpHandler);

    this.updateCatLayer();
    this.updateCatDebugLayer();
  }

  handlePointerMove(event) {
    const session = this.catState?.interactionSession;

    if (!session?.active) return;
    if (
      session.pointerId !== null &&
      session.pointerId !== undefined &&
      event.pointerId !== session.pointerId
    ) {
      return;
    }

    const worldPoint = this.getSvgClickPosition(event);
    if (!worldPoint) return;

    event.preventDefault();

    this.updateCatInteractionSession(worldPoint);
    this.setCatTargetOverride(session.targetId, worldPoint);

    this.updateCatLayer();
    this.updateCatDebugLayer();
  }

  handlePointerUp(event) {
    const session = this.catState?.interactionSession;

    if (
      session?.active &&
      session.pointerId !== null &&
      session.pointerId !== undefined &&
      event.pointerId !== session.pointerId
    ) {
      return;
    }

    window.removeEventListener("pointermove", this._catPointerMoveHandler);
    window.removeEventListener("pointerup", this._catPointerUpHandler);
    window.removeEventListener("pointercancel", this._catPointerUpHandler);

    this.endCatInteractionSession();

    if (this.bool(this.c.cat_drag_prevent_dude_click)) {
      this.suppressNextClick();
    }

    this.updateCatLayer();
    this.updateCatDebugLayer();
  }

  getSvgClickPosition(event) {
    const svg = this.shadowRoot.querySelector("svg");
    const world = this.shadowRoot.querySelector("#world");

    if (!svg || !world || !svg.createSVGPoint) return null;

    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;

    const matrix = world.getScreenCTM();
    if (!matrix) return null;

    const local = point.matrixTransform(matrix.inverse());

    return {
      x: this.clamp(local.x, 0, this.getWorldWidth()),
      y: this.clamp(local.y, 0, this.getWorldHeight()),
    };
  }

  createAttentionPoiFromClick(position) {
    const standingY = this.clampHeadY(this.getEffectiveStandingY(this.c));

    const clickX = this.clamp(Number(position.x), 0, this.getWorldWidth());
    const clickY = this.clamp(Number(position.y), 0, this.getWorldHeight());

    const horizontalOnly = this.bool(this.c.horizontal_tap_movement);

    const targetX = this.bool(this.c.click_sets_desired)
      ? clickX
      : Number(this.c.desired_figure_x);

    const targetY = this.bool(this.c.click_sets_desired)
      ? horizontalOnly
        ? standingY
        : this.clampHeadY(clickY)
      : horizontalOnly
        ? standingY
        : this.clampHeadY(Number(this.c.desired_figure_y));

    const now = performance.now();

    const poi = {
      id: `attention_${Math.round(now)}`,
      type: String(this.c.click_attention_poi_type || "attention"),
      label: String(this.c.click_attention_poi_label || "look"),

      /*
        x/y are the actual clicked point.
        walkX/walkY are the current practical movement target generated from
        that click.

        This distinction matters later:
        - a character can look at / investigate the clicked point
        - while choosing a sensible place to stand nearby
      */
      x: clickX,
      y: clickY,
      walkX: this.clamp(targetX, 0, this.getWorldWidth()),
      walkY: this.clampHeadY(targetY),

      temporary: true,
      createdAt: now,
      expiresAt:
        now +
        Math.max(
          1000,
          Number(this.c.click_attention_poi_lifetime_ms) || 12000
        ),

      source: "click",

      /*
        Future-friendly POI metadata.
        Keeping this shape similar to normal POIs means click attention can
        later join the same goal-selection system as switches, cats, furniture,
        doors, and other world objects.
      */
      approach: {
        type: "point",
      },

      attention: {
        priority: 1,
        claimedBy: null,
      },
    };

    this.setTemporaryAttentionPoi(poi);
    return poi;
  }

  setTemporaryAttentionPoi(poi) {
    if (!poi) return;

    if (!this.temporaryPois) {
      this.temporaryPois = [];
    }

    /*
      For v1, keep only the latest click attention POI.
      Later this could become a short queue if we want multiple investigation
      points to persist at once.
    */
    this.temporaryPois = [poi];

    if (this.attentionPoiTimer) {
      window.clearTimeout(this.attentionPoiTimer);
      this.attentionPoiTimer = null;
    }

    const delay = Math.max(
      1000,
      Number(this.c.click_attention_poi_lifetime_ms) || 12000
    );

    this.attentionPoiTimer = window.setTimeout(() => {
      this.clearExpiredTemporaryPois();
      this.updateAttentionPoiLayer();
      this.updatePoiDebugLayer();

      if (this.updateCatDebugLayer) {
        this.updateCatDebugLayer();
      }
    }, delay);
  }

  clearExpiredTemporaryPois() {
    if (!this.temporaryPois) return;

    const now = performance.now();

    this.temporaryPois = this.temporaryPois.filter((poi) => {
      if (!poi.temporary) return true;
      return Number(poi.expiresAt || 0) > now;
    });
  }

  getTemporaryPois() {
    this.clearExpiredTemporaryPois();
    return this.temporaryPois || [];
  }

  getTargetFromAttentionPoi(poi, options = {}) {
    const standingY = this.clampHeadY(this.getEffectiveStandingY(this.c));

    if (!poi || options.useFallback) {
      return {
        x: Number(this.c.desired_figure_x),
        y: this.bool(this.c.horizontal_tap_movement)
          ? standingY
          : this.clampHeadY(Number(this.c.desired_figure_y)),
      };
    }

    return {
      x: this.clamp(Number(poi.walkX ?? poi.x), 0, this.getWorldWidth()),
      y: this.bool(this.c.horizontal_tap_movement)
        ? standingY
        : this.clampHeadY(Number(poi.walkY ?? poi.y)),
    };
  }

  queueCatAttentionPoi(poi) {
    if (!poi) return;

    /*
      Placeholder for Cat v2+.

      The cat does not move yet, but this establishes the future API:
      clicks can create investigation targets for any character.
    */
    if (!this.catState) {
      this.catState = this.createInitialCatState();
    }

    this.catState.pendingAttentionPoi = poi;
  }

  updateAttentionPoiLayer() {
    const layer = this.shadowRoot.querySelector("#attentionPoiLayer");
    if (!layer) return;

    if (!this.bool(this.c.click_creates_attention_poi)) {
      layer.innerHTML = "";
      return;
    }

    const pois = this.getTemporaryPois();

    if (!pois.length) {
      layer.innerHTML = "";
      return;
    }

    const markup = pois
      .map((poi) => {
        const x = Number(poi.x);
        const y = Number(poi.y);
        const walkX = Number(poi.walkX ?? poi.x);
        const walkY = Number(poi.walkY ?? poi.y);

        const remainingMs = Math.max(
          0,
          Number(poi.expiresAt || 0) - performance.now()
        );

        const lifetimeMs = Math.max(
          1000,
          Number(this.c.click_attention_poi_lifetime_ms) || 12000
        );

        const lifeRatio = this.clamp(remainingMs / lifetimeMs, 0, 1);
        const opacity = this.lerp(0.12, 1, lifeRatio);

        return `
          <g
            class="attention-poi"
            data-poi-id="${this.esc(poi.id)}"
            style="opacity: ${opacity};"
          >
            <circle
              cx="${x}"
              cy="${y}"
              r="7"
              class="attention-poi-ring"
            />
            <circle
              cx="${x}"
              cy="${y}"
              r="2.5"
              class="attention-poi-dot"
            />
            <line
              x1="${x}"
              y1="${y}"
              x2="${walkX}"
              y2="${walkY}"
              class="attention-poi-line"
            />
            <text
              x="${x}"
              y="${y - 11}"
              class="attention-poi-label"
            >${this.esc(poi.label || "look")}</text>
          </g>
        `;
      })
      .join("");

    layer.innerHTML = markup;
  }

  // ===========================================================================
  // 6. Path planning, POIs, and interaction targets
  // ===========================================================================
  /*
    This section owns the "world target" layer of the card:

    - Head path planning and path debug rendering.
    - Built-in POIs such as switches.
    - Temporary attention POIs created by clicks/taps.
    - POI approach targets for characters to stand near something.
    - POI actions and local visual state.
    - Desired hand targets generated by POIs.

    Important model:

      POI      = a meaningful thing/place in the world
      Goal     = a character's current intention
      Target   = physical coordinates generated by a goal/POI
      Action   = optional effect when a condition is met

    Temporary attention POIs are deliberately POI-like. They are currently
    created by clicks as "look here" signals, and later the dude/cat can decide
    whether to investigate them.
  */

  planHeadPath(start, target) {
    const mode = String(this.c.movement_mode || "path");
    const worldWidth = this.getWorldWidth();

    const cleanStart = {
      x: this.clamp(Number(start.x), 0, worldWidth),
      y: this.clampHeadY(Number(start.y)),
    };

    const cleanTarget = {
      x: this.clamp(Number(target.x), 0, worldWidth),
      y: this.clampHeadY(Number(target.y)),
    };

    if (mode === "direct") {
      return [cleanTarget];
    }

    const standingY = this.clampHeadY(this.getEffectiveStandingY(this.c));
    const tolerance = Number(this.c.standing_y_tolerance) || 2;

    const points = [];

    if (Math.abs(cleanStart.y - standingY) > tolerance) {
      points.push({ x: cleanStart.x, y: standingY, role: "recover" });
    }

    if (Math.abs(cleanTarget.x - cleanStart.x) > 1) {
      points.push({ x: cleanTarget.x, y: standingY, role: "travel" });
    }

    if (
      Math.abs(cleanTarget.y - standingY) > tolerance ||
      points.length === 0
    ) {
      points.push({ x: cleanTarget.x, y: cleanTarget.y, role: "pose" });
    }

    return points;
  }

  getCurrentWaypoint() {
    if (!this.motionPath.length) return this.desiredHead;

    return this.motionPath[
      this.clamp(this.pathIndex, 0, this.motionPath.length - 1)
    ];
  }

  updateHeadPath() {
    const layer = this.shadowRoot.querySelector("#headPath");
    if (!layer) return;

    if (!this.shouldRenderHeadPath || !this.shouldRenderHeadPath()) {
      layer.innerHTML = "";
      return;
    }

    if (!this.motionPath.length) {
      layer.innerHTML = "";
      return;
    }

    const start = this.currentHead;
    const points = [start, ...this.motionPath];
    const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(" ");

    const pathColor = this.getCurrentPathColor();

    const markers = this.motionPath
      .map(
        (p) => `
          <circle
            cx="${p.x}"
            cy="${p.y}"
            r="2.8"
            class="head-path-point"
            style="fill: ${pathColor};"
          />
        `
      )
      .join("");

    layer.innerHTML = `
      <polyline
        points="${polylinePoints}"
        class="head-path-line"
        style="stroke: ${pathColor};"
      />
      ${markers}
    `;
  }

  getCurrentPathColor() {
    const kind = String(this.currentMoveKind || "random");

    if (kind === "poi") {
      return this.c.poi_path_color || this.c.path_color;
    }

    if (kind === "attention") {
      return "var(--accent-color)";
    }

    return this.c.random_path_color || this.c.path_color;
  }

  // ---------------------------------------------------------------------------
  // POI list construction
  // ---------------------------------------------------------------------------

  getPoiList(options = {}) {
    const includeBuiltIns = options.includeBuiltIns !== false;
    const includeTemporary = options.includeTemporary !== false;

    const pois = [];

    if (includeBuiltIns && this.bool(this.c.poi_enabled)) {
      pois.push(...this.getBuiltInPoiList());
    }

    if (includeTemporary) {
      pois.push(...this.getTemporaryPoisAsPoiList());
    }

    return pois;
  }

  getBuiltInPoiList() {
    const pois = [];

    if (this.bool(this.c.poi_switches_enabled)) {
      pois.push(...this.getSwitchPoiList());
    }

    return pois;
  }

  getSwitchPoiList() {
    const worldWidth = this.getWorldWidth();
    const switchY = Number(this.c.poi_switch_y) || 104;

    const lightYOffset = Math.max(
      0,
      Number(this.c.poi_light_source_y_offset) || 48
    );

    const leftX =
      worldWidth *
      this.clamp(Number(this.c.poi_switch_left_ratio) || 0.24, 0.05, 0.95);

    const rightX =
      worldWidth *
      this.clamp(Number(this.c.poi_switch_right_ratio) || 0.76, 0.05, 0.95);

    const makeSwitchPoi = (id, x, side) => ({
      id,
      type: "light_switch",
      label: "switch",
      x,
      y: switchY,
      temporary: false,
      source: "built_in",

      /*
        The POI describes how it should be approached.
        The actual walk target is calculated from the figure's proportions.
      */
      approach: {
        type: String(this.c.poi_switch_approach_type || "within_reach"),
        reachRatio: this.clamp(
          Number(this.c.poi_switch_reach_ratio) || 0.72,
          0.1,
          1
        ),
        minDistance: Math.max(
          0,
          Number(this.c.poi_switch_min_approach_distance) || 22
        ),
        maxDistance: Math.max(
          1,
          Number(this.c.poi_switch_max_approach_distance) || 58
        ),
        side,
      },

      /*
        Desired hand target.
        The arm solver can blend towards this once the dude has arrived.
      */
      handTarget: {
        type: "point",
        hand: "nearest",
        x,
        y: switchY,
        triggerDistance: Math.max(
          1,
          Number(this.c.poi_hand_target_trigger_distance) || 7
        ),
      },

      /*
        Flexible action slot.
        For now this remains the arrival indicator/action.
      */
      action: {
        type: "toggle_local_state",
        stateKey: `${id}_light`,
      },

      effects: [
        {
          type: "light_source",
          stateKey: `${id}_light`,
          x,
          y: switchY - lightYOffset,
        },
      ],
    });

    return [
      makeSwitchPoi("switch_left", leftX, "right"),
      makeSwitchPoi("switch_right", rightX, "left"),
    ];
  }

  getTemporaryPoisAsPoiList() {
    if (!this.bool(this.c.click_creates_attention_poi)) {
      return [];
    }

    return this.getTemporaryPois().map((poi) => ({
      ...poi,
      temporary: true,
      source: poi.source || "temporary",

      /*
        Keep attention POIs compatible with normal movement/approach code.
        x/y are the interesting point; walkX/walkY are the practical target.
      */
      approach: poi.approach || {
        type: "point",
      },
    }));
  }

  getPoiById(id) {
    if (!id) return null;
    return this.getPoiList().find((poi) => poi.id === id) || null;
  }

  choosePoi() {
    const pois = this.getPoiList();

    if (!pois.length) return null;

    /*
      Give temporary attention POIs a small priority boost.
      This is a future-facing choice: clicks are "look here" signals and should
      feel more intentional than a random wander target while they exist.
    */
    const attentionPois = pois.filter((poi) => poi.type === "attention");
    const basePool = attentionPois.length ? attentionPois : pois;

    /*
      Avoid immediately choosing the POI we just completed.
      This is not a timeout; it is goal selection hygiene.
      If there is only one POI, we still allow it.
    */
    const candidates =
      basePool.length > 1 && this.lastCompletedPoiId
        ? basePool.filter((poi) => poi.id !== this.lastCompletedPoiId)
        : basePool;

    const pool = candidates.length ? candidates : basePool;

    return pool[Math.floor(Math.random() * pool.length)];
  }

  // ---------------------------------------------------------------------------
  // POI approach/standing targets
  // ---------------------------------------------------------------------------

  getPoiWalkTarget(poi) {
    if (!poi) return null;

    if (poi.type === "attention") {
      return this.getAttentionPoiWalkTarget(poi);
    }

    const standingY = this.clampHeadY(this.getEffectiveStandingY(this.c));
    const worldWidth = this.getWorldWidth();

    const approachDistance = this.getPoiApproachDistance(poi);
    const approachSide = this.getPoiApproachSide(poi);

    /*
      "right" means the dude stands to the right of the POI.
      "left" means the dude stands to the left of the POI.
    */
    const direction = approachSide === "right" ? 1 : -1;

    return {
      x: this.clamp(Number(poi.x) + direction * approachDistance, 0, worldWidth),
      y: standingY,
    };
  }

  getAttentionPoiWalkTarget(poi) {
    const standingY = this.clampHeadY(this.getEffectiveStandingY(this.c));

    if (!poi) {
      return {
        x: Number(this.c.desired_figure_x),
        y: standingY,
      };
    }

    return {
      x: this.clamp(Number(poi.walkX ?? poi.x), 0, this.getWorldWidth()),
      y: this.bool(this.c.horizontal_tap_movement)
        ? standingY
        : this.clampHeadY(Number(poi.walkY ?? poi.y)),
    };
  }

  getPoiApproachDistance(poi) {
    const legacyFallback = Math.max(
      0,
      Number(this.c.poi_switch_walk_offset_x) || 34
    );

    if (!poi?.approach || poi.approach.type === "point") {
      return 0;
    }

    if (poi.approach.type !== "within_reach") {
      return legacyFallback;
    }

    const upperArm = Math.max(0, Number(this.c.upper_arm_length) || 0);
    const lowerArm = Math.max(0, Number(this.c.lower_arm_length) || 0);
    const armReach = upperArm + lowerArm;

    const reachRatio = this.clamp(
      Number(poi.approach.reachRatio) || 0.72,
      0.1,
      1
    );

    const minDistance = Math.max(
      0,
      Number(poi.approach.minDistance) || legacyFallback
    );

    const maxDistance = Math.max(
      minDistance,
      Number(poi.approach.maxDistance) || legacyFallback
    );

    /*
      Usable reach should be less than the full arm length. Full extension tends
      to look locked and awkward, especially once we drive hand targets.
    */
    const usableReach = armReach * reachRatio;

    return this.clamp(usableReach, minDistance, maxDistance);
  }

  getPoiApproachSide(poi) {
    const side = String(poi?.approach?.side || "auto");

    if (side === "left" || side === "right") {
      return side;
    }

    /*
      Auto side: if the POI is on the left side of the world, stand to its right.
      If the POI is on the right side, stand to its left.
    */
    const worldCentre = this.getWorldWidth() / 2;
    return Number(poi?.x || 0) < worldCentre ? "right" : "left";
  }

  // ---------------------------------------------------------------------------
  // POI local state and actions
  // ---------------------------------------------------------------------------

  getPoiStateValue(stateKey) {
    if (!stateKey) return false;
    return !!this.poiLocalState?.[stateKey];
  }

  setPoiStateValue(stateKey, value) {
    if (!stateKey) return;

    if (!this.poiLocalState) {
      this.poiLocalState = {};
    }

    this.poiLocalState[stateKey] = !!value;
  }

  togglePoiStateValue(stateKey) {
    const next = !this.getPoiStateValue(stateKey);
    this.setPoiStateValue(stateKey, next);
    return next;
  }

  runPoiAction(poi) {
    if (!poi || !this.bool(this.c.poi_action_enabled)) return;

    const action = poi.action;
    if (!action || !action.type) return;

    switch (String(action.type)) {
      case "toggle_local_state":
        this.togglePoiStateValue(action.stateKey);
        break;

      /*
        Future actions could live here:

        case "toggle_entity":
          this._hass.callService(...)
          break;

        case "change_room":
          this.startRoomTransition(...)
          break;

        case "emit_attention":
          this.createAttentionPoiFromSomething(...)
          break;
      */

      default:
        break;
    }

    this.updatePoiLayer();
    this.updatePoiDebugLayer();
  }

  handlePoiArrival() {
    if (!this.bool(this.c.poi_action_on_arrival)) return;

    /*
      Attention POIs are arrival/investigation goals, not switch-style actions.
      They intentionally do not run a POI action here unless a future action is
      added to them explicitly.
    */
    if (this.currentMoveKind !== "poi") return;
    if (!this.currentPoi) return;

    /*
      Each movement goal should only be allowed to fire its action once.
      Without this, a very short re-arrival or repeated finish pass can toggle
      the same POI twice.
    */
    if (this.currentMoveActionHandled) return;

    this.currentMoveActionHandled = true;
    this.lastCompletedPoiId = this.currentPoi.id;

    this.runPoiAction(this.currentPoi);
  }

  // ---------------------------------------------------------------------------
  // POI rendering
  // ---------------------------------------------------------------------------

  updatePoiLayer() {
    const layer = this.shadowRoot.querySelector("#poiLayer");
    if (!layer) return;

    if (!this.shouldRenderPois || !this.shouldRenderPois()) {
      layer.innerHTML = "";
      return;
    }

    const pois = this.getPoiList({
      includeTemporary: false,
    });

    if (!pois.length) {
      layer.innerHTML = "";
      return;
    }

    const lightMarkup = pois
      .flatMap((poi) => poi.effects || [])
      .filter((effect) => effect.type === "light_source")
      .map((effect) => {
        const isOn = this.getPoiStateValue(effect.stateKey);
        const x = Number(effect.x);
        const y = Number(effect.y);
        const r = Math.max(4, Number(this.c.poi_light_source_radius) || 34);

        const onOpacity = this.clamp(
          Number(this.c.poi_light_source_on_opacity) || 0.75,
          0,
          1
        );

        const offOpacity = this.clamp(
          Number(this.c.poi_light_source_off_opacity) || 0.08,
          0,
          1
        );

        const opacity = isOn ? onOpacity : offOpacity;

        if (!this.bool(this.c.poi_light_source_enabled)) return "";

        return `
          <g class="poi-light-effect">
            <circle
              cx="${x}"
              cy="${y}"
              r="${r}"
              class="poi-light-glow"
              style="opacity: ${opacity * 0.35};"
            />
            <circle
              cx="${x}"
              cy="${y}"
              r="${Math.max(3, r * 0.18)}"
              class="poi-light-source"
              style="opacity: ${opacity};"
            />
          </g>
        `;
      })
      .join("");

    const switchMarkup = pois
      .filter((poi) => poi.type === "light_switch")
      .map((poi) => {
        const x = Number(poi.x);
        const y = Number(poi.y);
        const w = 13;
        const h = 20;

        const stateKey = poi.action?.stateKey;
        const isOn = this.getPoiStateValue(stateKey);
        const activeClass = isOn ? " active" : "";

        return `
          <g class="poi-switch" data-poi-id="${this.esc(poi.id)}">
            <rect
              x="${x - w / 2}"
              y="${y - h / 2}"
              width="${w}"
              height="${h}"
              rx="2.5"
              class="poi-switch-plate${activeClass}"
            />
            <circle
              cx="${x}"
              cy="${y - 4}"
              r="1.4"
              class="poi-switch-dot"
            />
            <circle
              cx="${x}"
              cy="${y + 4}"
              r="1.4"
              class="poi-switch-dot"
            />
            <text
              x="${x}"
              y="${y + h / 2 + 9}"
              class="poi-switch-label"
            >POI</text>
          </g>
        `;
      })
      .join("");

    layer.innerHTML = `
      ${lightMarkup}
      ${switchMarkup}
    `;
  }

  updatePoiDebugLayer() {
    const layer = this.shadowRoot.querySelector("#poiDebugLayer");
    if (!layer) return;

    const showAny =
      this.bool(this.c.show_poi_debug) ||
      this.bool(this.c.show_poi_reach_debug) ||
      this.bool(this.c.show_poi_state_debug);

    if (!showAny) {
      layer.innerHTML = "";
      return;
    }

    const pois = this.getPoiList();

    if (!pois.length) {
      layer.innerHTML = "";
      return;
    }

    const standingY = this.clampHeadY(this.getEffectiveStandingY(this.c));

    const markup = pois
      .map((poi) => {
        const poiX = Number(poi.x);
        const poiY = Number(poi.y);
        const walkTarget = this.getPoiWalkTarget(poi);
        const approachDistance = this.getPoiApproachDistance
          ? this.getPoiApproachDistance(poi)
          : 0;

        const isCurrent =
          this.currentPoi && this.currentPoi.id === poi.id;

        const stateKey = poi.action?.stateKey;
        const stateValue = stateKey
          ? this.getPoiStateValue(stateKey)
          : false;

        const parts = [];

        if (this.bool(this.c.show_poi_reach_debug)) {
          if (poi.type === "attention") {
            const radius = Math.max(5, Number(poi.attention?.radius || 12));

            parts.push(`
              <circle
                cx="${poiX}"
                cy="${poiY}"
                r="${radius}"
                class="poi-debug-fill"
              />
            `);
          } else {
            /*
              Shows the horizontal "within reach" band.
              This is intentionally simple for now: the hand-target debug layer
              shows the true shoulder-to-target reach circle.
            */
            parts.push(`
              <line
                x1="${poiX - approachDistance}"
                y1="${standingY}"
                x2="${poiX + approachDistance}"
                y2="${standingY}"
                class="poi-debug-line"
              />
              <circle
                cx="${poiX}"
                cy="${standingY}"
                r="${Math.max(2, approachDistance)}"
                class="poi-debug-fill"
              />
            `);
          }
        }

        if (this.bool(this.c.show_poi_debug)) {
          parts.push(`
            <circle
              cx="${poiX}"
              cy="${poiY}"
              r="${isCurrent ? 5 : 3}"
              class="poi-debug-point"
            />
          `);

          if (walkTarget) {
            parts.push(`
              <circle
                cx="${walkTarget.x}"
                cy="${walkTarget.y}"
                r="${isCurrent ? 5 : 3}"
                class="poi-debug-point"
              />
              <line
                x1="${poiX}"
                y1="${poiY}"
                x2="${walkTarget.x}"
                y2="${walkTarget.y}"
                class="poi-debug-line"
              />
            `);
          }
        }

        if (this.bool(this.c.show_poi_state_debug)) {
          const actionType = poi.action?.type || "none";
          const approachType = poi.approach?.type || "none";
          const source = poi.source || "unknown";
          const temporary = poi.temporary ? "temporary" : "persistent";

          const label = [
            poi.id,
            poi.type,
            temporary,
            `source:${source}`,
            `approach:${approachType}`,
            `action:${actionType}`,
            stateKey ? `${stateKey}:${stateValue ? "on" : "off"}` : null,
            isCurrent ? "current" : null,
          ]
            .filter(Boolean)
            .join(" | ");

          parts.push(`
            <text
              x="${poiX}"
              y="${poiY - 18}"
              class="poi-debug-text"
            >${this.esc(label)}</text>
          `);
        }

        return parts.join("");
      })
      .join("");

    layer.innerHTML = markup;
  }

  // ---------------------------------------------------------------------------
  // Desired hand targets
  // ---------------------------------------------------------------------------

  getDesiredHandTarget(side, body) {
    if (!this.bool(this.c.poi_hand_target_enabled)) return null;
    if (!body) return null;
    if (this.currentMoveKind !== "poi") return null;
    if (!this.currentPoi) return null;
    if (this.isFigureMoving()) return null;
    if (this.activeStep) return null;

    const poi = this.getPoiById(this.currentPoi.id) || this.currentPoi;
    return this.getPoiHandTargetForSide(poi, side, body);
  }

  getPoiHandTargetForSide(poi, side, body) {
    if (!poi?.handTarget) return null;

    const handTarget = poi.handTarget;
    const targetHand = this.getPreferredHandForPoi(poi, body);

    if (targetHand !== side) return null;
    if (handTarget.type !== "point") return null;

    const shoulder = side === "left" ? body.leftShoulder : body.rightShoulder;
    const currentHand = side === "left" ? body.leftHand : body.rightHand;

    const target = {
      x: Number(handTarget.x ?? poi.x),
      y: Number(handTarget.y ?? poi.y),
    };

    const reach = this.getHandReachInfo({
      side,
      shoulder,
      currentHand,
      target,
      triggerDistance: handTarget.triggerDistance,
    });

    return {
      poi,
      side,
      type: handTarget.type,
      x: target.x,
      y: target.y,
      triggerDistance: reach.triggerDistance,
      reachable: reach.reachable,
      distanceFromShoulder: reach.distanceFromShoulder,
      distanceFromCurrentHand: reach.distanceFromCurrentHand,
      maxReach: reach.maxReach,
      currentHand,
      shoulder,
    };
  }

  getPreferredHandForPoi(poi, body) {
    const configured = String(poi?.handTarget?.hand || "nearest");

    if (configured === "left" || configured === "right") {
      return configured;
    }

    /*
      For now "nearest" means nearest shoulder to the target.
      That is better than nearest current hand, because the current hand may be
      swinging or idling somewhere unhelpful.
    */
    const target = {
      x: Number(poi?.handTarget?.x ?? poi?.x ?? 0),
      y: Number(poi?.handTarget?.y ?? poi?.y ?? 0),
    };

    if (!body?.leftShoulder || !body?.rightShoulder) {
      return "right";
    }

    const leftDistance = this.distance(body.leftShoulder, target);
    const rightDistance = this.distance(body.rightShoulder, target);

    return leftDistance <= rightDistance ? "left" : "right";
  }

  getHandReachInfo({
    side,
    shoulder,
    currentHand,
    target,
    triggerDistance = null,
  }) {
    const upper = Math.max(0, Number(this.c.upper_arm_length) || 0);
    const lower = Math.max(0, Number(this.c.lower_arm_length) || 0);

    const padding = Math.max(
      0,
      Number(this.c.poi_hand_target_reach_padding) || 0
    );

    const maxReach = Math.max(1, upper + lower - padding);

    const distanceFromShoulder = this.distance(shoulder, target);
    const distanceFromCurrentHand = currentHand
      ? this.distance(currentHand, target)
      : Infinity;

    const cleanTriggerDistance = Math.max(
      1,
      Number(triggerDistance) ||
        Number(this.c.poi_hand_target_trigger_distance) ||
        7
    );

    return {
      side,
      reachable: distanceFromShoulder <= maxReach,
      maxReach,
      distanceFromShoulder,
      distanceFromCurrentHand,
      triggerDistance: cleanTriggerDistance,
      triggered: distanceFromCurrentHand <= cleanTriggerDistance,
    };
  }

  getActiveDesiredHandTargets(body) {
    if (!body) return [];

    return ["left", "right"]
      .map((side) => this.getDesiredHandTarget(side, body))
      .filter(Boolean);
  }

  updateHandTargetDebugLayer(body) {
    const layer = this.shadowRoot.querySelector("#handTargetDebugLayer");
    if (!layer) return;

    const showTarget = this.bool(this.c.show_hand_target_debug);
    const showReach = this.bool(this.c.show_hand_reach_debug);

    if (!showTarget && !showReach) {
      layer.innerHTML = "";
      return;
    }

    const targets = this.getActiveDesiredHandTargets(body);

    if (!targets.length) {
      layer.innerHTML = "";
      return;
    }

    const markup = targets
      .map((target) => {
        const colour = target.reachable
          ? this.c.hand_target_debug_color
          : this.c.hand_target_unreachable_color;

        const label = [
          `${target.side} hand`,
          target.poi?.id || "poi",
          target.reachable ? "reachable" : "unreachable",
          `reach:${Math.round(target.distanceFromShoulder)}/${Math.round(target.maxReach)}`,
          `hand:${Math.round(target.distanceFromCurrentHand)}`,
        ].join(" | ");

        const parts = [];

        if (showReach) {
          parts.push(`
            <circle
              cx="${target.shoulder.x}"
              cy="${target.shoulder.y}"
              r="${target.maxReach}"
              class="hand-reach-debug-zone"
              style="stroke: ${colour};"
            />
          `);
        }

        if (showTarget) {
          parts.push(`
            <line
              x1="${target.shoulder.x}"
              y1="${target.shoulder.y}"
              x2="${target.x}"
              y2="${target.y}"
              class="hand-target-debug-line"
              style="stroke: ${colour};"
            />

            <circle
              cx="${target.x}"
              cy="${target.y}"
              r="${Math.max(3, target.triggerDistance)}"
              class="hand-target-debug-ring"
              style="stroke: ${colour};"
            />

            <circle
              cx="${target.x}"
              cy="${target.y}"
              r="3"
              class="hand-target-debug-point"
              style="fill: ${colour};"
            />

            <circle
              cx="${target.currentHand.x}"
              cy="${target.currentHand.y}"
              r="2.5"
              class="hand-target-debug-point"
              style="fill: ${colour}; opacity: 0.45;"
            />

            <line
              x1="${target.currentHand.x}"
              y1="${target.currentHand.y}"
              x2="${target.x}"
              y2="${target.y}"
              class="hand-target-debug-line"
              style="stroke: ${colour}; opacity: 0.38;"
            />

            <text
              x="${target.x}"
              y="${target.y - 13}"
              class="hand-target-debug-text"
              style="fill: ${colour};"
            >${this.esc(label)}</text>
          `);
        }

        return parts.join("");
      })
      .join("");

    layer.innerHTML = markup;
  }

  // ===========================================================================
  // 7. Animation loops and dude movement controller
  // ===========================================================================
  /*
    This section controls movement over time.

    It does not decide how the dude's skeleton is shaped — that belongs to the
    skeleton/arms/legs sections. It only decides:

    - when animation frames should run
    - where the dude's head/body target is
    - how the head moves along the current path
    - when a move has finished
    - when idle pose/idle animation should take over
    - when auto-wander should choose a new goal

    Clicks now create temporary attention POIs in Section 5. Those can be used
    as movement goals here, either immediately from a click or later through
    auto-wander/goal selection.
  */

  // ---------------------------------------------------------------------------
  // Idle animation loop
  // ---------------------------------------------------------------------------

  startIdleAnimation() {
    const dudeIdleEnabled =
      this.bool(this.c.idle_animation_enabled) ||
      this.bool(this.c.idle_pose_enabled);

    const catIdleEnabled =
      this.bool(this.c.cat_idle_animation_enabled) &&
      (this.shouldRenderCat ? this.shouldRenderCat() : this.bool(this.c.cat_enabled));

    if (!dudeIdleEnabled && !catIdleEnabled) {
      return;
    }

    if (!this.isConnected) return;
    if (this.raf) return;
    if (this.motionPath && this.motionPath.length > 0) return;
    if (this.idleRaf) return;

    const frame = () => {
      const hasActivePath = this.motionPath && this.motionPath.length > 0;

      const stillAllowed =
        this.isConnected &&
        !this.raf &&
        !hasActivePath &&
        (dudeIdleEnabled || catIdleEnabled);

      if (!stillAllowed) {
        this.idleRaf = null;
        return;
      }

      this.updateSkeleton();

      if (this.updateCatLayer) this.updateCatLayer();
      if (this.updateCatDebugLayer) this.updateCatDebugLayer();
      if (this.updateAttentionPoiLayer) this.updateAttentionPoiLayer();

      const keepRunning =
        this.bool(this.c.idle_animation_enabled) ||
        this.bool(this.c.cat_idle_animation_enabled) ||
        this.isIdlePoseActive() ||
        !!this.activeStep;

      if (keepRunning) {
        this.idleRaf = requestAnimationFrame(frame);
      } else {
        this.idleRaf = null;
      }
    };

    this.idleRaf = requestAnimationFrame(frame);
  }

  cancelIdleAnimation() {
    if (!this.idleRaf) return;

    cancelAnimationFrame(this.idleRaf);
    this.idleRaf = null;
  }

  // ---------------------------------------------------------------------------
  // Idle pose state
  // ---------------------------------------------------------------------------

  getIdlePoseState() {
    if (!this.idlePoseState) {
      this.idlePoseState = {
        active: false,
        phase: "none",
        bodyBlend: 0,
      };
    }

    return this.idlePoseState;
  }

  startIdlePose() {
    if (!this.bool(this.c.idle_pose_enabled)) return;

    const state = this.getIdlePoseState();

    state.active = true;
    state.phase = "settling_feet";
    state.bodyBlend = 0;
  }

  cancelIdlePose() {
    const state = this.getIdlePoseState();

    state.active = false;
    state.phase = "none";
    state.bodyBlend = 0;
  }

  isIdlePoseActive() {
    const state = this.getIdlePoseState();
    return !!state.active;
  }

  getIdlePoseBodyBlend() {
    const state = this.getIdlePoseState();
    return this.clamp(Number(state.bodyBlend || 0), 0, 1);
  }

  // ---------------------------------------------------------------------------
  // Main movement animation loop
  // ---------------------------------------------------------------------------

  startAnimation() {
    this.cancelIdleAnimation();
    this.cancelIdlePose();
    this.cancelAutoWander();

    if (this.raf) cancelAnimationFrame(this.raf);

    const frame = () => {
      const moving = this.stepSpring();

      /*
        updateSkeleton() is where the dude's body/limbs respond to movement.
        Keeping movement target logic separate from skeleton solving will make
        it easier to replace the gait later.
      */
      this.updateSkeleton();

      if (this.updateAttentionPoiLayer) this.updateAttentionPoiLayer();
      if (this.updateCatLayer) this.updateCatLayer();
      if (this.updateCatDebugLayer) this.updateCatDebugLayer();

      if (moving || this.activeStep) {
        this.raf = requestAnimationFrame(frame);
      } else {
        this.raf = null;

        /*
          Walking has finished. If this was a POI move, run the POI's action.
          At the moment switch POIs use this for the local light effect.
          Attention POIs intentionally do nothing unless given an action.
        */
        this.handlePoiArrival();

        /*
          Hand over to the idle pose system:
          feet settle first, then body/idle animation blends in.
        */
        this.startIdlePose();

        this.updateSkeleton();

        if (this.updateAttentionPoiLayer) this.updateAttentionPoiLayer();
        if (this.updateCatLayer) this.updateCatLayer();
        if (this.updateCatDebugLayer) this.updateCatDebugLayer();

        this.scheduleAutoWander();
        this.startIdleAnimation();
      }
    };

    this.raf = requestAnimationFrame(frame);
  }

  startMoveToTarget(target, options = {}) {
    this.cancelIdleAnimation();
    this.cancelIdlePose();
    this.cancelAutoWander();

    this.currentMoveKind = options.kind || "manual";
    this.currentPoi = options.poi || null;
    this.currentMoveActionHandled = false;

    const cleanTarget = {
      x: this.clamp(Number(target.x), 0, this.getWorldWidth()),
      y: this.clampHeadY(Number(target.y)),
    };

    this.desiredHead = cleanTarget;
    this.motionPath = this.planHeadPath(this.currentHead, cleanTarget);
    this.pathIndex = 0;
    this.segmentStartHead = { ...this.currentHead };
    this.velocity = { x: 0, y: 0 };
    this.idleFinalStepUsed = false;

    this.updateHeadPath();
    this.updatePoiDebugLayer();

    if (this.updateAttentionPoiLayer) this.updateAttentionPoiLayer();
    if (this.updateCatDebugLayer) this.updateCatDebugLayer();

    this.startAnimation();
  }

  // ---------------------------------------------------------------------------
  // Head/path movement
  // ---------------------------------------------------------------------------

  stepSpring() {
    const target = this.getCurrentWaypoint();

    const strength = Number(this.c.spring_strength) || 0.008;
    const damping = Number(this.c.damping) || 0.55;
    const threshold = Number(this.c.settle_threshold) || 0.45;

    const tx = Number(target.x);
    const ty = this.clampHeadY(Number(target.y));

    const dx = tx - this.currentHead.x;
    const dy = ty - this.currentHead.y;

    this.velocity.x = (this.velocity.x + dx * strength) * damping;
    this.velocity.y = (this.velocity.y + dy * strength) * damping;

    this.applyHeadSpeedLimits(tx);

    this.currentHead.x += this.velocity.x;
    this.currentHead.y += this.velocity.y;
    this.currentHead.y = this.clampHeadY(this.currentHead.y);

    const remainingDx = tx - this.currentHead.x;
    const remainingDy = ty - this.currentHead.y;

    const distance = Math.hypot(remainingDx, remainingDy);
    const speed = Math.hypot(this.velocity.x, this.velocity.y);

    /*
      The old behaviour waited for tiny spring movement to fully settle.
      This made the character look visually arrived, but not actually hand
      over to the idle pose for a few seconds.

      This cuts the walk short once the head is close enough and slow enough.
    */
    const finishDistance = Math.max(
      threshold,
      Number(this.c.walk_finish_distance) || 2.4
    );

    const finishSpeed = Math.max(
      threshold,
      Number(this.c.walk_finish_speed) || 0.85
    );

    const closeEnough = distance <= finishDistance;
    const slowEnough = speed <= finishSpeed;

    if (closeEnough && slowEnough) {
      this.currentHead.x = tx;
      this.currentHead.y = ty;
      this.velocity.x = 0;
      this.velocity.y = 0;

      if (this.pathIndex < this.motionPath.length - 1) {
        this.pathIndex += 1;
        this.segmentStartHead = { ...this.currentHead };
        this.updateHeadPath();
        return true;
      }

      this.motionPath = [];
      this.pathIndex = 0;
      this.updateHeadPath();
      return false;
    }

    return true;
  }

  applyHeadSpeedLimits(targetX) {
    let maxX = this.getCurrentHeadSpeedLimitX(targetX);
    const maxY = Math.max(0.03, Number(this.c.max_head_speed_y) || 0.9);

    if (this.bool(this.c.head_wait_for_feet)) {
      maxX *= this.getFootLeadSpeedMultiplier(targetX);
    }

    this.velocity.x = this.clamp(this.velocity.x, -maxX, maxX);
    this.velocity.y = this.clamp(this.velocity.y, -maxY, maxY);
  }

  getCurrentHeadSpeedLimitX(targetX) {
    if (!this.bool(this.c.use_speed_profile)) {
      return Math.max(0.03, Number(this.c.max_head_speed_x) || 0.62);
    }

    const startX = Number(this.segmentStartHead?.x ?? this.currentHead.x);
    const currentX = Number(this.currentHead.x);
    const target = Number(targetX);

    const totalDistance = Math.abs(target - startX);
    const travelled = Math.abs(currentX - startX);
    const remaining = Math.abs(target - currentX);

    const walkSpeed = Math.max(0.03, Number(this.c.walk_speed_x) || 0.45);
    const jogSpeed = Math.max(walkSpeed, Number(this.c.jog_speed_x) || 0.85);
    const runSpeed = Math.max(jogSpeed, Number(this.c.run_speed_x) || 1.25);

    const jogDistance = Math.max(1, Number(this.c.jog_distance) || 50);
    const runDistance = Math.max(jogDistance + 1, Number(this.c.run_distance) || 110);

    let cruiseSpeed = walkSpeed;

    if (totalDistance >= runDistance) {
      cruiseSpeed = runSpeed;
    } else if (totalDistance >= jogDistance) {
      const t = this.clamp(
        (totalDistance - jogDistance) / (runDistance - jogDistance),
        0,
        1
      );
      cruiseSpeed = this.lerp(jogSpeed, runSpeed, t);
    } else {
      const t = this.clamp(totalDistance / jogDistance, 0, 1);
      cruiseSpeed = this.lerp(walkSpeed, jogSpeed, t);
    }

    const accelDistance = Math.max(1, Number(this.c.accel_ease_distance) || 24);
    const decelDistance = Math.max(1, Number(this.c.decel_ease_distance) || 32);

    const accel = this.smoothstep(this.clamp(travelled / accelDistance, 0, 1));
    const decel = this.smoothstep(this.clamp(remaining / decelDistance, 0, 1));

    const ease = this.clamp(Math.min(accel, decel), 0, 1);

    return Math.max(walkSpeed * 0.35, cruiseSpeed * ease);
  }

  getFootLeadSpeedMultiplier(targetX) {
    if (!this.feet || String(this.c.foot_lock_mode) !== "planted_floor") {
      return 1;
    }

    const direction = Math.sign(Number(targetX) - Number(this.currentHead.x));
    if (direction === 0) return 1;

    const pose = this.getVerticalPose();
    const pelvis = this.getPelvisForHead(this.currentHead, pose);
    const lead = this.getForwardMostFootLead(direction, pelvis);

    const totalLeg =
      Number(this.c.upper_leg_length) + Number(this.c.lower_leg_length);

    const stanceLead =
      this.getEffectiveStance(pose) * Number(this.c.walk_lane_ratio || 0.18);

    const desiredLead =
      totalLeg *
      this.clamp(Number(this.c.foot_lead_distance_ratio) || 0.18, 0, 1);

    const requiredLead = Math.max(1, stanceLead + desiredLead);

    const readiness = this.smoothstep(
      this.clamp(lead / requiredLead, 0, 1)
    );

    const intensity = this.getMovementIntensity
      ? this.getMovementIntensity()
      : 1;

    const jogAmount = this.clamp(intensity - 1, 0, 1);

    /*
      When moving faster, let the body travel a bit further over the support
      leg. This prevents the old gait from looking too sticky.
    */
    const baseMinimum = this.clamp(
      Number(this.c.head_wait_speed_multiplier) || 0.82,
      0.05,
      1
    );

    const dynamicMinimum = this.lerp(baseMinimum, 0.86, jogAmount);

    /*
      Near the destination, be a little more cautious so we still get calm
      arrivals rather than overshooting into tiny correction steps.
    */
    const remaining = Math.abs(Number(targetX) - Number(this.currentHead.x));
    const landingDistance = Math.max(12, Number(this.c.decel_ease_distance) || 32);
    const landingAmount = 1 - this.smoothstep(
      this.clamp(remaining / landingDistance, 0, 1)
    );

    const cautiousMinimum = this.lerp(dynamicMinimum, baseMinimum, landingAmount);

    return this.lerp(cautiousMinimum, 1, readiness);
  }

  getForwardMostFootLead(direction, pelvis) {
    if (!this.feet) return 0;

    const leftLead = direction * (this.feet.left.x - pelvis.x);
    const rightLead = direction * (this.feet.right.x - pelvis.x);

    return Math.max(leftLead, rightLead);
  }

  // ---------------------------------------------------------------------------
  // Movement state helpers
  // ---------------------------------------------------------------------------

  isFigureMoving() {
    if (this.raf) return true;
    if (this.activeStep) return true;

    if (!this.motionPath.length) {
      return false;
    }

    const target = this.getCurrentWaypoint();

    const targetDistance = Math.hypot(
      Number(target.x) - Number(this.currentHead.x),
      Number(target.y) - Number(this.currentHead.y)
    );

    const speed = Math.hypot(
      Number(this.velocity?.x || 0),
      Number(this.velocity?.y || 0)
    );

    const threshold = Math.max(0.05, Number(this.c.settle_threshold) || 0.45);

    return targetDistance > threshold || speed > threshold;
  }

  getMovementState() {
    if (this.activeStep) return `stepping:${this.activeStep.foot}`;

    const idleState = this.getIdlePoseState();

    if (idleState.active && idleState.phase !== "idling") {
      return `idle:${idleState.phase}`;
    }

    if (this.isFigureMoving()) {
      if (this.currentMoveKind === "attention") return "investigating";
      if (this.currentMoveKind === "poi") return "poi";
      return "walking";
    }

    if (this.wanderTimer) return "waiting";
    return "idle";
  }

  // ---------------------------------------------------------------------------
  // Auto-wander / simple goal selection
  // ---------------------------------------------------------------------------

  scheduleAutoWander() {
    this.cancelAutoWander();

    if (!this.bool(this.c.auto_wander)) return;
    if (!this.isConnected) return;
    if (this.raf || this.activeStep || this.isFigureMoving()) return;

    const minIdle = Math.max(0, Number(this.c.wander_min_idle_ms) || 0);
    const maxIdle = Math.max(
      minIdle,
      Number(this.c.wander_max_idle_ms) || minIdle
    );

    const delay = minIdle + Math.random() * (maxIdle - minIdle);

    this.wanderTimer = window.setTimeout(() => {
      this.wanderTimer = null;
      this.startAutoWanderMove();
    }, delay);
  }

  cancelAutoWander() {
    if (!this.wanderTimer) return;

    window.clearTimeout(this.wanderTimer);
    this.wanderTimer = null;
  }

  startAutoWanderMove() {
    if (!this.bool(this.c.auto_wander)) return;
    if (this.raf || this.activeStep || this.isFigureMoving()) return;

    const standingY = this.clampHeadY(this.getEffectiveStandingY(this.c));

    /*
      POI selection now includes temporary attention POIs.
      This means a click can become a "look here" goal that the dude may choose
      to investigate, rather than only being an immediate movement command.
    */
    const canUsePoi =
      this.bool(this.c.poi_enabled) &&
      this.getPoiList().length > 0;

    const canUseRandom = this.bool(this.c.poi_random_wander_enabled);
    const poiChance = this.clamp(Number(this.c.poi_chance) || 0, 0, 1);

    const shouldChoosePoi =
      canUsePoi &&
      (!canUseRandom || Math.random() < poiChance);

    if (shouldChoosePoi) {
      const poi = this.choosePoi();
      const target = this.getPoiWalkTarget(poi);

      if (poi && target) {
        this.startMoveToTarget(target, {
          kind: poi.type === "attention" ? "attention" : "poi",
          poi,
        });
        return;
      }
    }

    if (!canUseRandom) return;

    const range = this.getWanderRange();

    const jitter = Math.max(0, Number(this.c.wander_target_jitter) || 0);
    let targetX = range.min + Math.random() * (range.max - range.min);

    targetX += (Math.random() - 0.5) * jitter;
    targetX = this.clamp(targetX, range.min, range.max);

    this.startMoveToTarget(
      {
        x: targetX,
        y: standingY,
      },
      {
        kind: "random",
        poi: null,
      }
    );
  }

  // ===========================================================================
  // 8. Dude skeleton solving and body pose construction
  // ===========================================================================
  /*
    This section builds the dude's body pose for the current frame.

    It owns:
    - head / neck / pelvis placement
    - shoulder and hip anchors
    - idle body/head motion
    - body bob
    - torso lean
    - side-on body compression
    - balance proxy

    It deliberately does not own:
    - arm target selection and arm IK
    - leg solving and foot planting
    - cat rig solving

    The current dude remains a simple stick figure. The cat will use a separate
    rig/renderer so we can make it more silhouette-driven without complicating
    the dude.
  */

  updateSkeleton() {
    const body = this.solveBody();
    if (!body) return;

    this.setCircle("head", body.head.x, body.head.y, Number(this.c.head_radius));

    this.setLine(
      "neckLine",
      body.head.x,
      body.head.y + Number(this.c.head_radius),
      body.neck.x,
      body.neck.y
    );

    this.setLine(
      "torsoLine",
      body.neck.x,
      body.neck.y,
      body.pelvis.x,
      body.pelvis.y
    );

    this.setLine(
      "shoulderLine",
      body.leftShoulder.x,
      body.leftShoulder.y,
      body.rightShoulder.x,
      body.rightShoulder.y
    );

    this.setLine(
      "hipLine",
      body.leftHip.x,
      body.leftHip.y,
      body.rightHip.x,
      body.rightHip.y
    );

    this.setLine(
      "leftUpperArm",
      body.leftShoulder.x,
      body.leftShoulder.y,
      body.leftElbow.x,
      body.leftElbow.y
    );

    this.setLine(
      "leftLowerArm",
      body.leftElbow.x,
      body.leftElbow.y,
      body.leftHand.x,
      body.leftHand.y
    );

    this.setLine(
      "rightUpperArm",
      body.rightShoulder.x,
      body.rightShoulder.y,
      body.rightElbow.x,
      body.rightElbow.y
    );

    this.setLine(
      "rightLowerArm",
      body.rightElbow.x,
      body.rightElbow.y,
      body.rightHand.x,
      body.rightHand.y
    );

    this.setLine(
      "leftUpperLeg",
      body.leftHip.x,
      body.leftHip.y,
      body.leftKnee.x,
      body.leftKnee.y
    );

    this.setLine(
      "leftLowerLeg",
      body.leftKnee.x,
      body.leftKnee.y,
      body.leftFoot.x,
      body.leftFoot.y
    );

    this.setLine(
      "rightUpperLeg",
      body.rightHip.x,
      body.rightHip.y,
      body.rightKnee.x,
      body.rightKnee.y
    );

    this.setLine(
      "rightLowerLeg",
      body.rightKnee.x,
      body.rightKnee.y,
      body.rightFoot.x,
      body.rightFoot.y
    );

    this.updateJoints(body);
    this.updateLegDebug(body);
    this.updatePoseDebug(body.pose);
    this.updateHandTargetDebugLayer(body);
  }

  solveBody() {
    const c = this.c;

    const pose = this.getVerticalPose();
    const sideOnAmount = this.getSideOnBodyAmount();

    const bodyBob = this.getBodyBobOffset(sideOnAmount);
    const idleMotion = this.getIdleMotionOffset();
    const balanceProxy = this.getBalanceProxy(sideOnAmount);
    const torsoLean = this.getTorsoLeanOffset(sideOnAmount, balanceProxy);

    /*
      currentHead remains the dude's primary movement anchor.
      Secondary animation layers then offset the visible body/head around it.
    */
    const baseX = Number(this.currentHead.x) + idleMotion.bodyX;
    const baseY = this.clampHeadY(
      Number(this.currentHead.y) + bodyBob.y + idleMotion.bodyY
    );

    const head = {
      x: baseX + torsoLean.x + idleMotion.headX,
      y: baseY + idleMotion.headY,
    };

    const headR = Number(c.head_radius);

    const effectiveTorsoLength = this.applyPoseScalar(
      Number(c.torso_length),
      pose,
      {
        crouchRatio: -Number(c.torso_crouch_compress_ratio),
        stretchRatio: Number(c.torso_stretch_extend_ratio),
      }
    );

    const neck = {
      x: head.x,
      y: head.y + headR + Number(c.neck_length),
    };

    const pelvis = {
      x: baseX,
      y: neck.y + effectiveTorsoLength,
    };

    const widthRatio = this.getSideOnWidthRatio(sideOnAmount);
    const shoulderWidth = Number(c.shoulder_width) * widthRatio;
    const hipWidth = Number(c.hip_width) * widthRatio;

    const leftShoulder = {
      x: neck.x - shoulderWidth / 2,
      y: neck.y + 4,
    };

    const rightShoulder = {
      x: neck.x + shoulderWidth / 2,
      y: neck.y + 4,
    };

    const leftHip = {
      x: pelvis.x - hipWidth / 2,
      y: pelvis.y,
    };

    const rightHip = {
      x: pelvis.x + hipWidth / 2,
      y: pelvis.y,
    };

    const arms = this.solveArms({
      leftShoulder,
      rightShoulder,
      sideOnAmount,
      balanceProxy,
    });

    const legs = this.solveLegs({
      pelvis,
      leftHip,
      rightHip,
      pose,
      sideOnAmount,
    });

    return {
      pose,
      sideOnAmount,
      bodyBob,
      idleMotion,
      balanceProxy,
      torsoLean,

      head,
      neck,
      pelvis,

      leftShoulder,
      rightShoulder,
      leftHip,
      rightHip,

      ...arms,
      ...legs,
    };
  }

  getIdleMotionOffset() {
    const zero = {
      bodyX: 0,
      bodyY: 0,
      headX: 0,
      headY: 0,
    };

    if (!this.bool(this.c.idle_animation_enabled)) {
      return zero;
    }

    if (this.isFigureMoving()) {
      return zero;
    }

    const blend = this.bool(this.c.idle_pose_enabled)
      ? this.getIdlePoseBodyBlend()
      : 1;

    if (blend <= 0.001) {
      return zero;
    }

    const now = performance.now();
    const speed = Math.max(0.0001, Number(this.c.idle_animation_speed) || 0.0012);

    const breathAmount = Math.max(0, Number(this.c.idle_breath_amount) || 1.4);
    const swayAmount = Math.max(0, Number(this.c.idle_sway_amount) || 1.2);
    const headLookAmount = Math.max(0, Number(this.c.idle_head_look_amount) || 2.2);
    const headNodAmount = Math.max(0, Number(this.c.idle_head_nod_amount) || 0.8);

    const phase = now * speed;

    const breath = Math.sin(phase * 2.1) * breathAmount;
    const sway = Math.sin(phase * 0.8) * swayAmount;
    const headLook = Math.sin(phase * 0.47 + 1.7) * headLookAmount;
    const headNod = Math.sin(phase * 0.63 + 0.4) * headNodAmount;

    return {
      bodyX: sway * blend,
      bodyY: breath * 0.35 * blend,
      headX: headLook * blend,
      headY: (headNod + breath * 0.15) * blend,
    };
  }

  getMovementIntensity() {
    if (!this.bool(this.c.movement_intensity_enabled)) {
      return 0;
    }

    if (!this._movementIntensityState) {
      this._movementIntensityState = {
        value: 0,
      };
    }

    if (!this.isFigureMoving() && !this.activeStep) {
      this._movementIntensityState.value = this.lerp(
        this._movementIntensityState.value,
        0,
        0.1
      );

      return this._movementIntensityState.value;
    }

    const speed = Math.abs(Number(this.velocity?.x || 0));
    const walkSpeed = Math.max(0.03, Number(this.c.walk_speed_x) || 0.45);
    const jogSpeed = Math.max(walkSpeed + 0.01, Number(this.c.jog_speed_x) || 0.85);
    const runSpeed = Math.max(jogSpeed + 0.01, Number(this.c.run_speed_x) || 1.25);

    const waypoint = this.getCurrentWaypoint();
    const startX = Number(this.segmentStartHead?.x ?? this.currentHead.x);
    const targetX = Number(waypoint?.x ?? this.currentHead.x);
    const currentX = Number(this.currentHead.x);

    const totalDistance = Math.abs(targetX - startX);
    const remaining = Math.abs(targetX - currentX);

    const jogDistance = Math.max(1, Number(this.c.jog_distance) || 50);
    const runDistance = Math.max(jogDistance + 1, Number(this.c.run_distance) || 110);

    /*
      Distance intent:
      short move = walk
      medium move = brisk walk / jog
      long move = stronger jog
    */
    let distanceIntent = 0;

    if (totalDistance > 1) {
      if (totalDistance <= jogDistance) {
        distanceIntent = this.clamp(totalDistance / jogDistance, 0, 1);
      } else {
        distanceIntent =
          1 +
          this.clamp(
            (totalDistance - jogDistance) / (runDistance - jogDistance),
            0,
            1
          );
      }
    }

    /*
      Speed intent:
      actual velocity still contributes, but no longer controls everything.
    */
    let speedIntent = 0;

    if (speed > 0.01) {
      if (speed <= walkSpeed) {
        speedIntent = this.clamp(speed / walkSpeed, 0, 1);
      } else if (speed <= jogSpeed) {
        speedIntent =
          1 +
          this.clamp((speed - walkSpeed) / (jogSpeed - walkSpeed), 0, 1);
      } else {
        speedIntent =
          2 +
          this.clamp((speed - jogSpeed) / (runSpeed - jogSpeed), 0, 1);
      }
    }

    /*
      Ease intensity down near the destination so he lands calmly.
      This prevents the jog pose fighting the idle landing.
    */
    const landingEaseDistance = Math.max(12, Number(this.c.decel_ease_distance) || 32);
    const landingEase = this.smoothstep(
      this.clamp(remaining / landingEaseDistance, 0, 1)
    );

    const target = Math.max(distanceIntent, speedIntent) * landingEase;

    const smoothing = this.clamp(
      Number(this.c.movement_intensity_smoothing) || 0.12,
      0.02,
      0.5
    );

    this._movementIntensityState.value = this.lerp(
      this._movementIntensityState.value,
      target,
      smoothing
    );

    return this._movementIntensityState.value;
  }

  getSideOnBodyAmount() {
    if (!this.bool(this.c.side_on_body)) return 0;

    const speed = Math.abs(Number(this.velocity?.x || 0));
    const threshold = Math.max(
      0,
      Number(this.c.side_on_body_speed_threshold) || 0.05
    );

    if (speed <= threshold && !this.isFigureMoving()) return 0;

    const walkSpeed = Math.max(0.03, Number(this.c.walk_speed_x) || 0.45);
    const amount = this.clamp(speed / walkSpeed, 0, 1);

    return this.smoothstep(amount);
  }

  getSideOnWidthRatio(sideOnAmount) {
    const minRatio = this.clamp(
      Number(this.c.side_on_body_min_width_ratio) || 0.08,
      0,
      1
    );

    return this.lerp(1, minRatio, sideOnAmount);
  }

  getBodyBobOffset(sideOnAmount = 0) {
    if (!this.bool(this.c.body_bob_enabled)) {
      return { x: 0, y: 0 };
    }

    if (!this._bodyBobState) {
      this._bodyBobState = {
        y: 0,
        phase: 0,
        lastTime: performance.now(),
      };
    }

    const now = performance.now();
    const dt = this.clamp(now - this._bodyBobState.lastTime, 0, 40);
    this._bodyBobState.lastTime = now;

    const speed = Math.abs(Number(this.velocity?.x || 0));
    const walkSpeed = Math.max(0.03, Number(this.c.walk_speed_x) || 0.45);
    const movementAmount = this.smoothstep(this.clamp(speed / walkSpeed, 0, 1));
    const sideOn = this.clamp(sideOnAmount, 0, 1);

    const moving = this.isFigureMoving() || !!this.activeStep;

    if (!moving) {
      this._bodyBobState.y = this.lerp(
        this._bodyBobState.y,
        0,
        Math.max(0.02, Number(this.c.body_bob_smoothing) || 0.12)
      );

      return {
        x: 0,
        y: this._bodyBobState.y,
      };
    }

    const baseAmount = Math.max(0, Number(this.c.body_bob_amount) || 2.2);
    const speedAmount = Math.max(0, Number(this.c.body_bob_speed_amount) || 0.6);
    const stepAmount = Math.max(0, Number(this.c.body_bob_step_amount) || 1.4);

    /*
      Slow, speed-led phase. This prevents tiny quick steps from creating
      a frantic visual bob.
    */
    const phaseRate = this.lerp(0.001, 0.004, movementAmount);
    this._bodyBobState.phase += dt * phaseRate;

    const walkingWave = Math.sin(this._bodyBobState.phase);

    let stepLift = 0;

    if (this.activeStep) {
      const progress = this.clamp(Number(this.activeStep.progress) || 0, 0, 1);
      stepLift = Math.sin(Math.PI * progress);
    }

    const rhythmicBob =
      -Math.abs(walkingWave) * baseAmount * movementAmount * sideOn;

    const speedBob =
      Math.sin(this._bodyBobState.phase * 0.55) *
      speedAmount *
      movementAmount *
      0.25;

    const activeStepBob =
      -stepLift * stepAmount * 0.65;

    const targetY = rhythmicBob + speedBob + activeStepBob;

    const smoothing = this.clamp(
      Number(this.c.body_bob_smoothing) || 0.12,
      0.02,
      0.5
    );

    this._bodyBobState.y = this.lerp(
      this._bodyBobState.y,
      targetY,
      smoothing
    );

    return {
      x: 0,
      y: this._bodyBobState.y,
    };
  }

  getTorsoLeanOffset(sideOnAmount = 0, balanceProxy = null) {
    if (!this.bool(this.c.torso_lean_enabled)) {
      return { x: 0, y: 0 };
    }

    const direction = this.getWalkDirection();
    const speed = Math.abs(Number(this.velocity?.x || 0));
    const walkSpeed = Math.max(0.03, Number(this.c.walk_speed_x) || 0.45);

    const movementAmount = this.smoothstep(this.clamp(speed / walkSpeed, 0, 1));

    if (!this.isFigureMoving() && !this.activeStep) {
      return { x: 0, y: 0 };
    }

    const leanAmount = Math.max(0, Number(this.c.torso_lean_amount) || 4);
    const speedAmount = Math.max(0, Number(this.c.torso_lean_speed_amount) || 2);

    const stepBoost = this.activeStep ? 0.1 : 0;
    const activity = this.clamp(movementAmount + stepBoost, 0, 1);
    const sideOn = this.clamp(sideOnAmount, 0, 1);

    const travelLean =
      direction * (leanAmount + speedAmount * movementAmount) * activity * sideOn;

    const balanceLean = balanceProxy
      ? Number(balanceProxy.counterLeanX || 0)
      : 0;

    return {
      x: travelLean + balanceLean,
      y: 0,
    };
  }

  getBalanceProxy(sideOnAmount = 0) {
    if (!this.bool(this.c.balance_proxy_enabled)) {
      return {
        supportX: Number(this.currentHead?.x || 0),
        bodyX: Number(this.currentHead?.x || 0),
        errorX: 0,
        normalisedErrorX: 0,
        counterLeanX: 0,
      };
    }

    if (!this.feet?.left || !this.feet?.right) {
      return {
        supportX: Number(this.currentHead?.x || 0),
        bodyX: Number(this.currentHead?.x || 0),
        errorX: 0,
        normalisedErrorX: 0,
        counterLeanX: 0,
      };
    }

    const supportX = (Number(this.feet.left.x) + Number(this.feet.right.x)) / 2;
    const bodyX = Number(this.currentHead?.x || supportX);
    const errorX = bodyX - supportX;

    const range = Math.max(1, Number(this.c.balance_support_range) || 34);
    const normalisedErrorX = this.clamp(errorX / range, -1, 1);

    const counterAmount = Math.max(
      0,
      Number(this.c.balance_counter_lean_amount) || 5
    );

    const counterLeanX =
      -normalisedErrorX * counterAmount * this.clamp(sideOnAmount, 0, 1);

    return {
      supportX,
      bodyX,
      errorX,
      normalisedErrorX,
      counterLeanX,
    };
  }

  // ===========================================================================
  // 9. Dude arms, hand targets, and arm IK
  // ===========================================================================
  /*
    This section owns the dude's arms.

    It handles:
    - base relaxed/swinging hand targets
    - arm momentum and balance offsets
    - blending hands towards desired POI hand targets
    - two-bone arm IK
    - target-aware elbow/pole selection

    Important principle:
    the hand target moves first, then the elbow is solved from the fixed upper
    and lower arm lengths. This keeps the system useful for future interactions
    such as switches, objects, cats, furniture, and moving targets.
  */

  solveArms({ leftShoulder, rightShoulder, sideOnAmount = 0, balanceProxy = null }) {
    if (!this.bool(this.c.arm_ik_enabled)) {
      return this.solveSimpleArms({ leftShoulder, rightShoulder });
    }

    const upper = Number(this.c.upper_arm_length);
    const lower = Number(this.c.lower_arm_length);

    const targets = this.getArmHandTargets({
      leftShoulder,
      rightShoulder,
      upper,
      lower,
      sideOnAmount,
      balanceProxy,
    });

    const leftHand = targets.left;
    const rightHand = targets.right;

    /*
      Rebuild a lightweight body context using the final intended hand targets.
      This lets the elbow solver know whether a POI hand target is active,
      without hard-coding switch/cat/object behaviour into the arm.
    */
    const bodyContext = {
      leftShoulder,
      rightShoulder,
      leftHand,
      rightHand,
    };

    const leftDesiredTarget = this.getDesiredHandTarget("left", bodyContext);
    const rightDesiredTarget = this.getDesiredHandTarget("right", bodyContext);

    const leftElbow = this.solveArmElbow({
      side: "left",
      shoulder: leftShoulder,
      hand: leftHand,
      desiredTarget: leftDesiredTarget,
      upper,
      lower,
      sideOnAmount,
    });

    const rightElbow = this.solveArmElbow({
      side: "right",
      shoulder: rightShoulder,
      hand: rightHand,
      desiredTarget: rightDesiredTarget,
      upper,
      lower,
      sideOnAmount,
    });

    return {
      leftElbow,
      rightElbow,
      leftHand,
      rightHand,
    };
  }

  solveArmElbow({
    side,
    shoulder,
    hand,
    desiredTarget = null,
    upper,
    lower,
    sideOnAmount = 0,
  }) {
    const outward = Math.max(
      0.02,
      Number(this.c.arm_elbow_bend_strength) || 0.28
    );

    /*
      If this arm is actively reaching for a desired hand target, use a
      target-aware pole. This chooses the more natural of the two possible IK
      elbow positions.
    */
    if (
      desiredTarget &&
      this.bool(this.c.poi_hand_reach_enabled) &&
      (!this.bool(this.c.poi_hand_reach_only_when_reachable) ||
        desiredTarget.reachable)
    ) {
      const preferredPole = this.getArmPreferredPole({
        side,
        shoulder,
        hand,
        desiredTarget,
      });

      return this.solveTwoBoneIKWithPreferredPole({
        start: shoulder,
        end: hand,
        lenA: upper,
        lenB: lower,
        preferredPole,
        outwardAmount: outward,
      });
    }

    /*
      Normal walking/idle arms still use the simple bend preference.
      This preserves the current stick-figure behaviour outside interactions.
    */
    const bend = this.getArmBendDirection(side, sideOnAmount);

    return this.solveTwoBoneIK(
      shoulder,
      hand,
      upper,
      lower,
      bend,
      outward
    );
  }

  solveSimpleArms({ leftShoulder, rightShoulder }) {
    const upper = Number(this.c.upper_arm_length);
    const lower = Number(this.c.lower_arm_length);

    const leftElbow = {
      x: leftShoulder.x - 10,
      y: leftShoulder.y + upper,
    };

    const rightElbow = {
      x: rightShoulder.x + 10,
      y: rightShoulder.y + upper,
    };

    return {
      leftElbow,
      rightElbow,
      leftHand: {
        x: leftElbow.x + 5,
        y: leftElbow.y + lower,
      },
      rightHand: {
        x: rightElbow.x - 5,
        y: rightElbow.y + lower,
      },
    };
  }

  // ---------------------------------------------------------------------------
  // Arm hand targets
  // ---------------------------------------------------------------------------

  getArmHandTargets({
    leftShoulder,
    rightShoulder,
    upper,
    lower,
    sideOnAmount = 0,
    balanceProxy = null,
  }) {
    const direction = this.getWalkDirection();
    const speed = Math.abs(Number(this.velocity?.x || 0));
    const walkSpeed = Math.max(0.03, Number(this.c.walk_speed_x) || 0.45);
    const movementAmount = this.smoothstep(this.clamp(speed / walkSpeed, 0, 1));
    const sideOn = this.clamp(sideOnAmount, 0, 1);

    const swingReach = this.bool(this.c.arm_flail_enabled)
      ? Math.max(0, Number(this.c.arm_swing_reach) || 12)
      : 0;

    const swingLift = this.bool(this.c.arm_flail_enabled)
      ? Math.max(
          0,
          Number(this.c.arm_swing_lift) ||
            Number(this.c.arm_flail_lift) ||
            2.5
        )
      : 0;

    const handForwardBias = Math.max(
      0,
      Number(this.c.arm_hand_forward_bias) || 2
    );

    const balanceReach = this.bool(this.c.arm_balance_enabled)
      ? Math.max(0, Number(this.c.arm_balance_reach) || 3.5)
      : 0;

    const idleAmount = Math.max(0, Number(this.c.arm_flail_idle_amount) || 0.08);

    const stepBoost = this.activeStep
      ? this.clamp(Number(this.c.arm_flail_step_boost) || 0.18, 0, 1)
      : 0;

    const activity = this.clamp(
      idleAmount + movementAmount * 0.9 + stepBoost,
      0,
      1
    );

    /*
      Arm swing is step-led rather than free-running.
      It remains only one force applied to the final hand target.
    */
    const swingValues = this.getArmSwingValues(sideOnAmount);
    const leftSwing = swingValues.left;
    const rightSwing = swingValues.right;

    const momentumOffset = this.getArmMomentumOffset(sideOnAmount);

    const balanceError = balanceProxy
      ? this.clamp(Number(balanceProxy.normalisedErrorX || 0), -1, 1)
      : 0;

    const balanceX = -balanceError * balanceReach * sideOn;
    const relaxedDrop = (upper + lower) * 0.76;

    const makeBaseTarget = (shoulder, swing) => {
      /*
        This is the walk-swing force.
        Positive swing means hand moves ahead of the body.
        Negative swing means hand falls behind.
      */
      const walkX = direction * swing * swingReach * activity * sideOn;

      /*
        Keep this small. It stops the leading hand looking completely passive,
        but it should not dominate the arm pose.
      */
      const forwardLead =
        direction * Math.max(0, swing) * handForwardBias * activity * sideOn;

      /*
        Trailing hand is allowed to go back, but softened so it does not look
        like a marching robot.
      */
      const trailingSoftener =
        direction *
        Math.min(0, swing) *
        handForwardBias *
        0.25 *
        activity *
        sideOn;

      const liftY = -Math.abs(swing) * swingLift * activity * sideOn;

      const desired = {
        x:
          shoulder.x +
          walkX +
          forwardLead +
          trailingSoftener +
          momentumOffset.x +
          balanceX,
        y: shoulder.y + relaxedDrop + liftY + momentumOffset.y,
      };

      return this.limitArmTarget(shoulder, desired, upper, lower);
    };

    const baseTargets = {
      left: makeBaseTarget(leftShoulder, leftSwing),
      right: makeBaseTarget(rightShoulder, rightSwing),
    };

    /*
      Build a temporary body context so desired-hand-target logic can decide:
      - which hand should be used
      - whether the target is reachable
      - how far the base hand currently is from the target

      This avoids needing the final solved elbow/hand positions first.
    */
    const bodyContext = {
      leftShoulder,
      rightShoulder,
      leftHand: baseTargets.left,
      rightHand: baseTargets.right,
    };

    return {
      left: this.applyDesiredHandTargetToBase({
        side: "left",
        shoulder: leftShoulder,
        baseTarget: baseTargets.left,
        bodyContext,
        upper,
        lower,
      }),
      right: this.applyDesiredHandTargetToBase({
        side: "right",
        shoulder: rightShoulder,
        baseTarget: baseTargets.right,
        bodyContext,
        upper,
        lower,
      }),
    };
  }

  applyDesiredHandTargetToBase({
    side,
    shoulder,
    baseTarget,
    bodyContext,
    upper,
    lower,
  }) {
    if (!this.handReachState) {
      this.handReachState = {
        left: 0,
        right: 0,
      };
    }

    const desiredTarget = this.getDesiredHandTarget(side, bodyContext);

    const canReach =
      this.bool(this.c.poi_hand_reach_enabled) &&
      desiredTarget &&
      (!this.bool(this.c.poi_hand_reach_only_when_reachable) ||
        desiredTarget.reachable);

    const blendSpeed = this.clamp(
      Number(this.c.poi_hand_reach_blend_speed) || 0.1,
      0.001,
      1
    );

    const returnSpeed = this.clamp(
      Number(this.c.poi_hand_reach_return_speed) || 0.08,
      0.001,
      1
    );

    const targetBlend = canReach ? 1 : 0;
    const speed = canReach ? blendSpeed : returnSpeed;

    this.handReachState[side] = this.lerp(
      Number(this.handReachState[side] || 0),
      targetBlend,
      speed
    );

    const strength = this.clamp(
      Number(this.c.poi_hand_reach_strength) || 1,
      0,
      1
    );

    const blend = this.clamp(this.handReachState[side] * strength, 0, 1);

    if (blend <= 0.001 || !desiredTarget) {
      return baseTarget;
    }

    /*
      Move the hand target towards the desired POI point.
      The actual elbow is solved afterwards, preserving arm lengths.
    */
    const desired = {
      x: this.lerp(baseTarget.x, Number(desiredTarget.x), blend),
      y: this.lerp(baseTarget.y, Number(desiredTarget.y), blend),
    };

    return this.limitArmTarget(shoulder, desired, upper, lower);
  }

  // ---------------------------------------------------------------------------
  // Arm swing and secondary motion
  // ---------------------------------------------------------------------------

  getArmSwingValues(sideOnAmount = 0) {
    if (!this._armSwingState) {
      this._armSwingState = {
        left: 0,
        right: 0,
      };
    }

    const sideOn = this.clamp(sideOnAmount, 0, 1);
    const moving = this.isFigureMoving() || !!this.activeStep;

    const stepAmount = this.clamp(
      Number(this.c.arm_step_swing_amount) || 0.78,
      0,
      1
    );

    const freeAmount = this.clamp(
      Number(this.c.arm_free_swing_amount) || 0.18,
      0,
      1
    );

    const smoothing = this.clamp(
      Number(this.c.arm_step_swing_smoothing) || 0.14,
      0.02,
      0.5
    );

    let targetLeft = 0;
    let targetRight = 0;

    if (this.activeStep) {
      const progress = this.clamp(Number(this.activeStep.progress) || 0, 0, 1);
      const eased = this.smoothstep(progress);

      /*
        One step should move the arms once from one extreme to the other.
        This avoids the old double-time metronome effect.
      */
      const swing = this.lerp(-stepAmount, stepAmount, eased);

      if (this.activeStep.foot === "left") {
        /*
          Left foot forward means right arm comes forward.
        */
        targetLeft = -swing;
        targetRight = swing;
      } else {
        /*
          Right foot forward means left arm comes forward.
        */
        targetLeft = swing;
        targetRight = -swing;
      }
    } else if (moving) {
      /*
        Between visible steps, only allow a small residual sway.
        This keeps arms alive without letting them cycle independently
        at double speed.
      */
      const phaseInfo = this.getArmWalkPhase();
      targetLeft = Math.sin(phaseInfo.phase) * freeAmount * sideOn;
      targetRight = -targetLeft;
    }

    /*
      Smooth towards the target swing so step changes do not snap the arms.
      This also makes the swing feel like a force/momentum effect rather
      than a hard pose.
    */
    this._armSwingState.left = this.lerp(
      this._armSwingState.left,
      targetLeft,
      smoothing
    );

    this._armSwingState.right = this.lerp(
      this._armSwingState.right,
      targetRight,
      smoothing
    );

    return {
      left: this._armSwingState.left,
      right: this._armSwingState.right,
    };
  }

  getArmWalkPhase() {
    if (!this._armPhaseState) {
      this._armPhaseState = {
        phase: 0,
        rate: 0,
        lastTime: performance.now(),
      };
    }

    const now = performance.now();
    const dt = this.clamp(now - this._armPhaseState.lastTime, 0, 40);
    this._armPhaseState.lastTime = now;

    const speed = Math.abs(Number(this.velocity?.x || 0));
    const walkSpeed = Math.max(0.03, Number(this.c.walk_speed_x) || 0.45);
    const speedNorm = this.smoothstep(this.clamp(speed / walkSpeed, 0, 1));

    const moving = this.isFigureMoving() && !this.activeStep;

    const minRate = Math.max(
      0.0001,
      Number(this.c.arm_phase_speed_min) || 0.0005
    );

    const maxRate = Math.max(
      minRate,
      Number(this.c.arm_phase_speed_max) || 0.0018
    );

    const targetRate = moving
      ? this.lerp(minRate, maxRate, speedNorm)
      : 0;

    this._armPhaseState.rate = this.lerp(
      this._armPhaseState.rate,
      targetRate,
      0.06
    );

    this._armPhaseState.phase += dt * this._armPhaseState.rate;

    return {
      phase: this._armPhaseState.phase,
    };
  }

  getArmMomentumOffset(sideOnAmount = 0) {
    if (!this.bool(this.c.arm_momentum_enabled)) {
      return { x: 0, y: 0 };
    }

    if (!this._armMomentumState) {
      this._armMomentumState = {
        x: 0,
        y: 0,
      };
    }

    const sideOn = this.clamp(sideOnAmount, 0, 1);
    const amount = Math.max(0, Number(this.c.arm_momentum_amount) || 5);

    const targetX =
      -Number(this.velocity?.x || 0) * amount * 0.9 * sideOn;

    const targetY =
      Math.abs(Number(this.velocity?.x || 0)) * 0.45 * sideOn;

    this._armMomentumState.x = this.lerp(this._armMomentumState.x, targetX, 0.12);
    this._armMomentumState.y = this.lerp(this._armMomentumState.y, targetY, 0.08);

    return {
      x: this._armMomentumState.x,
      y: this._armMomentumState.y,
    };
  }

  // ---------------------------------------------------------------------------
  // Arm IK helpers
  // ---------------------------------------------------------------------------

  limitArmTarget(shoulder, target, upper, lower) {
    const dx = Number(target.x) - Number(shoulder.x);
    const dy = Number(target.y) - Number(shoulder.y);
    const distance = Math.max(0.0001, Math.hypot(dx, dy));

    /*
      This does not change arm length. It limits the requested hand target so
      the later two-bone solver can produce a reasonable bend rather than a
      fully locked arm.
    */
    const maxRatio = this.clamp(
      Number(this.c.arm_target_reach_ratio) || 0.96,
      0.45,
      0.999
    );

    const maxReach = Math.max(1, (upper + lower) * maxRatio);
    const minReach = Math.max(1, Math.abs(upper - lower) + 6);

    const solvedDistance = this.clamp(distance, minReach, maxReach);

    return {
      x: shoulder.x + (dx / distance) * solvedDistance,
      y: shoulder.y + (dy / distance) * solvedDistance,
    };
  }

  solveTwoBoneIKWithPreferredPole({
    start,
    end,
    lenA,
    lenB,
    preferredPole,
    outwardAmount = 1,
  }) {
    const elbowA = this.solveTwoBoneIK(
      start,
      end,
      lenA,
      lenB,
      1,
      outwardAmount
    );

    const elbowB = this.solveTwoBoneIK(
      start,
      end,
      lenA,
      lenB,
      -1,
      outwardAmount
    );

    const distanceA = this.distance(elbowA, preferredPole);
    const distanceB = this.distance(elbowB, preferredPole);

    return distanceA <= distanceB ? elbowA : elbowB;
  }

  getArmPreferredPole({ side, shoulder, hand, desiredTarget = null }) {
    const sideSign = side === "left" ? -1 : 1;

    const mid = {
      x: this.lerp(Number(shoulder.x), Number(hand.x), 0.5),
      y: this.lerp(Number(shoulder.y), Number(hand.y), 0.5),
    };

    /*
      For reaching, the elbow should usually sit below the shoulder-hand line
      rather than flipping upward. This gives a more natural "bend first, then
      extend" feel.
    */
    const downAmount = Math.max(
      0,
      Number(this.c.arm_elbow_pole_down_amount) || 24
    );

    const outwardAmount = Math.max(
      0,
      Number(this.c.arm_elbow_pole_outward_amount) || 8
    );

    /*
      If the target is clearly to one side, bias the elbow slightly in that
      direction. Otherwise fall back to the natural side of the arm.
    */
    let reachSign = sideSign;

    if (desiredTarget) {
      const dx = Number(desiredTarget.x) - Number(shoulder.x);
      if (Math.abs(dx) > 2) {
        reachSign = Math.sign(dx);
      }
    }

    return {
      x: mid.x + reachSign * outwardAmount,
      y: mid.y + downAmount,
    };
  }

  getArmBendDirection(side, sideOnAmount = 0) {
    const idleBend = side === "left" ? 1 : -1;

    const speed = Math.abs(Number(this.velocity?.x || 0));
    const shouldUseTravelBend =
      this.isFigureMoving() ||
      this.activeStep ||
      speed > 0.03 ||
      sideOnAmount > 0.1;

    if (!shouldUseTravelBend) {
      return idleBend;
    }

    return this.getWalkDirection() >= 0 ? 1 : -1;
  }
  // ===========================================================================
  // 10. Dude legacy legs and foot planting
  // ===========================================================================
  /*
    This is the current biped leg system for the dude.

    It is intentionally labelled as legacy because it works, but it is not the
    movement architecture we would use if starting again. The important thing
    for now is to keep it stable and compatible with the cleaner body/arm
    sections above.

    This section provides:

    - solveLegs()
    - planted/sliding/free leg modes
    - persistent planted foot state
    - step lifecycle
    - legacy foot target placement
    - two-bone IK shared by legs and arms
    - knee bend/lead helpers

    Future gait work should sit beside this using:

      dude_walk_cycle_mode: "legacy" | "procedural"

    rather than further complicating this system.
  */

  // ---------------------------------------------------------------------------
  // Legacy leg entry points
  // ---------------------------------------------------------------------------

  solveLegs({ pelvis, leftHip, rightHip, pose, sideOnAmount = 0 }) {
    const c = this.c;
    const upper = Number(c.upper_leg_length);
    const lower = Number(c.lower_leg_length);
    const mode = String(c.foot_lock_mode || "planted_floor");

    if (!this.bool(c.leg_solver_enabled) || mode === "free") {
      const leftKnee = {
        x: leftHip.x - 10,
        y: leftHip.y + upper,
      };

      const rightKnee = {
        x: rightHip.x + 10,
        y: rightHip.y + upper,
      };

      return {
        leftKnee,
        rightKnee,
        leftFoot: {
          x: leftKnee.x + 2,
          y: leftKnee.y + lower,
        },
        rightFoot: {
          x: rightKnee.x - 2,
          y: rightKnee.y + lower,
        },
      };
    }

    if (mode === "sliding_floor") {
      return this.solveSlidingFloorLegs({
        pelvis,
        leftHip,
        rightHip,
        pose,
        upper,
        lower,
        sideOnAmount,
      });
    }

    return this.solvePlantedFloorLegs({
      pelvis,
      leftHip,
      rightHip,
      pose,
      upper,
      lower,
      sideOnAmount,
    });
  }

  solveSlidingFloorLegs({
    pelvis,
    leftHip,
    rightHip,
    pose,
    upper,
    lower,
    sideOnAmount = 0,
  }) {
    const floorY = Number(this.c.floor_y);
    const stance = this.getEffectiveStance(pose);

    const leftFoot = {
      x: pelvis.x - stance,
      y: floorY,
    };

    const rightFoot = {
      x: pelvis.x + stance,
      y: floorY,
    };

    const outward = this.getEffectiveKneeOutward(pose);
    const leftBend = this.getKneeBendDirection("left", sideOnAmount);
    const rightBend = this.getKneeBendDirection("right", sideOnAmount);

    let leftKnee = this.solveTwoBoneIK(
      leftHip,
      leftFoot,
      upper,
      lower,
      leftBend,
      outward
    );

    let rightKnee = this.solveTwoBoneIK(
      rightHip,
      rightFoot,
      upper,
      lower,
      rightBend,
      outward
    );

    leftKnee = this.applyKneeLead(leftKnee, leftFoot, sideOnAmount);
    rightKnee = this.applyKneeLead(rightKnee, rightFoot, sideOnAmount);

    return {
      leftKnee,
      rightKnee,
      leftFoot,
      rightFoot,
    };
  }

  solvePlantedFloorLegs({
    pelvis,
    leftHip,
    rightHip,
    pose,
    upper,
    lower,
    sideOnAmount = 0,
  }) {
    this.ensureFeet(pelvis, pose);
    this.updateStepProgress();

    const leftFoot = {
      ...this.feet.left,
    };

    const rightFoot = {
      ...this.feet.right,
    };

    this.maybeStartStep({
      pelvis,
      leftHip,
      rightHip,
      leftFoot,
      rightFoot,
      upper,
      lower,
      pose,
    });

    const outward = this.getEffectiveKneeOutward(pose);
    const leftBend = this.getKneeBendDirection("left", sideOnAmount);
    const rightBend = this.getKneeBendDirection("right", sideOnAmount);

    let leftKnee = this.solveTwoBoneIK(
      leftHip,
      leftFoot,
      upper,
      lower,
      leftBend,
      outward
    );

    let rightKnee = this.solveTwoBoneIK(
      rightHip,
      rightFoot,
      upper,
      lower,
      rightBend,
      outward
    );

    leftKnee = this.applyKneeLead(leftKnee, leftFoot, sideOnAmount);
    rightKnee = this.applyKneeLead(rightKnee, rightFoot, sideOnAmount);

    return {
      leftKnee,
      rightKnee,
      leftFoot,
      rightFoot,
    };
  }

  // ---------------------------------------------------------------------------
  // Foot state
  // ---------------------------------------------------------------------------

  resetFeet() {
    const standingY = this.getEffectiveStandingY(this.c);

    const head = {
      x: Number(this.c.figure_x),
      y: this.clampHeadY(standingY),
    };

    const pose = {
      crouch: 0,
      stretch: 0,
      raw: 0,
    };

    const pelvis = this.getPelvisForHead(head, pose);
    this.feet = this.getIdleFootTargets(pelvis, pose);
  }

  ensureFeet(pelvis, pose) {
    if (this.feet?.left && this.feet?.right) return;
    this.feet = this.getIdleFootTargets(pelvis, pose);
  }

  // ---------------------------------------------------------------------------
  // Step lifecycle
  // ---------------------------------------------------------------------------

  updateStepProgress() {
    if (!this.activeStep) return;

    const footName = this.activeStep.foot;
    const foot = this.feet?.[footName];

    if (!foot) {
      this.activeStep = null;
      return;
    }

    const speed = Math.max(0.001, Number(this.c.step_progress_speed) || 0.018);

    this.activeStep.progress = this.clamp(
      Number(this.activeStep.progress || 0) + speed,
      0,
      1
    );

    const t = this.smoothstep(this.activeStep.progress);

    const height = Math.max(
      0,
      Number(this.activeStep.height ?? this.c.step_height) || 10
    );

    const arc = Math.sin(Math.PI * t) * height;

    foot.x = this.lerp(this.activeStep.from.x, this.activeStep.to.x, t);
    foot.y = Math.min(
      Number(this.c.floor_y),
      this.lerp(this.activeStep.from.y, this.activeStep.to.y, t) - arc
    );

    if (this.activeStep.progress >= 1) {
      foot.x = this.activeStep.to.x;
      foot.y = Number(this.c.floor_y);

      this.lastStepFoot = footName;
      this.activeStep = null;

      this.stepCooldown = Math.max(
        0,
        Math.round(Number(this.c.step_cooldown_frames) || 0)
      );
    }
  }

  maybeStartStep({
    pelvis,
    leftHip,
    rightHip,
    leftFoot,
    rightFoot,
    upper,
    lower,
    pose,
  }) {
    if (this.activeStep) return;

    const totalLeg = upper + lower;

    const triggerDistance =
      totalLeg *
      this.clamp(Number(this.c.step_trigger_ratio) || 0.99, 0.4, 1);

    const leftDistance = this.distance(leftHip, leftFoot);
    const rightDistance = this.distance(rightHip, rightFoot);

    if (!this.isFigureMoving()) {
      if (this.bool(this.c.idle_pose_enabled)) {
        this.updateIdlePoseSettling(pelvis, pose);
        return;
      }

      this.settleFeetToIdleStance(pelvis, pose);
      return;
    }

    this.idleFinalStepUsed = false;

    if (this.stepCooldown > 0) {
      this.stepCooldown -= 1;
      return;
    }

    if (this.bool(this.c.anticipatory_steps)) {
      const anticipatory = this.getAnticipatoryStep({ pelvis, pose });

      if (anticipatory) {
        this.startFootStep(anticipatory.foot, anticipatory.to);
        return;
      }
    }

    if (leftDistance < triggerDistance && rightDistance < triggerDistance) {
      return;
    }

    const preferred = this.getPreferredNextFoot();
    const mostStretched = leftDistance > rightDistance ? "left" : "right";

    const stretchDifference = Math.abs(leftDistance - rightDistance);
    const overridePreferred = stretchDifference > totalLeg * 0.18;

    const chosen =
      this.bool(this.c.prefer_alternating_feet) && !overridePreferred
        ? preferred
        : mostStretched;

    const to = this.getStepTargetForFoot(chosen, pelvis, pose);
    this.startFootStep(chosen, to);
  }

  updateIdlePoseSettling(pelvis, pose) {
    if (!this.feet) return;

    const state = this.getIdlePoseState();

    if (!state.active) {
      this.startIdlePose();
    }

    const targets = this.getIdleFootTargets(pelvis, pose);

    const tolerance = Math.max(
      0.1,
      Number(this.c.idle_pose_foot_tolerance) || 1.4
    );

    const leftDistance = this.distance(this.feet.left, targets.left);
    const rightDistance = this.distance(this.feet.right, targets.right);

    const feetSettled =
      leftDistance <= tolerance &&
      rightDistance <= tolerance;

    if (!feetSettled) {
      state.phase = "settling_feet";
      state.bodyBlend = this.lerp(Number(state.bodyBlend || 0), 0, 0.18);

      if (this.activeStep) return;

      const foot = leftDistance >= rightDistance ? "left" : "right";
      this.startFootStep(foot, targets[foot]);
      return;
    }

    this.feet.left.x = targets.left.x;
    this.feet.left.y = targets.left.y;
    this.feet.right.x = targets.right.x;
    this.feet.right.y = targets.right.y;

    state.phase = "settling_body";

    const settleSpeed = this.clamp(
      Number(this.c.idle_pose_body_settle_speed) || 0.025,
      0.001,
      0.2
    );

    state.bodyBlend = this.lerp(Number(state.bodyBlend || 0), 1, settleSpeed);

    if (Math.abs(1 - state.bodyBlend) <= 0.01) {
      state.bodyBlend = 1;
      state.phase = "idling";
      state.active = true;

      if (!this.wanderTimer && !this.raf && !this.activeStep) {
        this.scheduleAutoWander();
      }
    }
  }

  settleFeetToIdleStance(pelvis, pose) {
    if (!this.feet || this.activeStep) return;

    const targets = this.getIdleFootTargets(pelvis, pose);

    this.feet.left.x = targets.left.x;
    this.feet.left.y = targets.left.y;
    this.feet.right.x = targets.right.x;
    this.feet.right.y = targets.right.y;
  }

  // ---------------------------------------------------------------------------
  // Foot targets
  // ---------------------------------------------------------------------------

  getIdleFootTargets(pelvis, pose, xOverride = null) {
    const stance = this.getCompactIdleStance(pose);
    const centreX = xOverride === null ? pelvis.x : Number(xOverride);
    const worldWidth = this.getWorldWidth();

    return {
      left: {
        x: this.clamp(centreX - stance, 0, worldWidth),
        y: Number(this.c.floor_y),
      },
      right: {
        x: this.clamp(centreX + stance, 0, worldWidth),
        y: Number(this.c.floor_y),
      },
    };
  }

  getDestinationFootTargets(pose) {
    const destination =
      this.motionPath && this.motionPath.length
        ? this.motionPath[this.motionPath.length - 1]
        : this.desiredHead || this.currentHead;

    const centreX = Number(destination?.x ?? this.currentHead.x);
    const stance = this.getCompactIdleStance(pose);
    const worldWidth = this.getWorldWidth();

    return {
      left: {
        x: this.clamp(centreX - stance, 0, worldWidth),
        y: Number(this.c.floor_y),
      },
      right: {
        x: this.clamp(centreX + stance, 0, worldWidth),
        y: Number(this.c.floor_y),
      },
    };
  }

  getPreferredNextFoot() {
    if (!this.lastStepFoot) {
      const direction = this.getWalkDirection();
      return direction >= 0 ? "right" : "left";
    }

    return this.lastStepFoot === "left" ? "right" : "left";
  }

  getWalkDirection() {
    const target = this.getCurrentWaypoint();

    const targetDirection = Math.sign(
      Number(target.x) - Number(this.currentHead.x)
    );

    if (targetDirection !== 0) return targetDirection;

    const velocityDirection = Math.sign(Number(this.velocity?.x || 0));
    return velocityDirection || 1;
  }

  getAnticipatoryStep({ pelvis, pose }) {
    if (!this.feet) return null;

    const direction = this.getWalkDirection();

    const preferred = this.bool(this.c.prefer_alternating_feet)
      ? this.getPreferredNextFoot()
      : direction > 0
        ? "right"
        : "left";

    const foot = this.feet[preferred];
    if (!foot) return null;

    const totalLeg =
      Number(this.c.upper_leg_length) + Number(this.c.lower_leg_length);

    const sideOffset = this.getWalkLaneOffset(preferred, pose);

    const desiredLead =
      direction *
        (totalLeg *
          this.clamp(Number(this.c.foot_lead_distance_ratio) || 0.18, 0, 1)) +
      sideOffset;

    const currentLead = foot.x - pelvis.x;
    const leadDeficit = direction * (desiredLead - currentLead);

    if (leadDeficit < Number(this.c.anticipatory_step_distance || 0)) {
      return null;
    }

    return {
      foot: preferred,
      to: this.getStepTargetForFoot(preferred, pelvis, pose),
    };
  }

  getStepTargetForFoot(foot, pelvis, pose) {
    const totalLeg =
      Number(this.c.upper_leg_length) + Number(this.c.lower_leg_length);

    const waypoint = this.getCurrentWaypoint();
    const direction = Math.sign(Number(waypoint.x) - Number(pelvis.x)) || 1;

    const intensity = this.getMovementIntensity
      ? this.getMovementIntensity()
      : 0;

    const jogAmount = this.clamp(intensity - 1, 0, 1);

    const baseAheadRatio = this.clamp(
      Number(this.c.step_target_ahead_ratio) || 0.7,
      0,
      0.95
    );

    const jogStrideBoost = this.clamp(
      Number(this.c.gait_stride_jog_boost) || 0.16,
      0,
      0.35
    );

    const ahead =
      totalLeg *
      this.clamp(baseAheadRatio + jogStrideBoost * jogAmount, 0, 0.98);

    const sideOffset = this.getWalkLaneOffset(foot, pose);
    const crossingAllowed = this.bool(this.c.allow_foot_crossing);

    let targetX = pelvis.x + sideOffset + direction * ahead;

    if (!crossingAllowed) {
      const stance = this.getEffectiveStance(pose);
      targetX = pelvis.x + (foot === "left" ? -stance : stance);
    }

    const destinationTargets = this.getDestinationFootTargets(pose);
    const destinationTarget = destinationTargets[foot];

    const remaining = Math.abs(Number(waypoint.x) - Number(pelvis.x));

    const blendDistance = Math.max(
      8,
      totalLeg * (Number(this.c.idle_destination_blend_ratio) || 1.35)
    );

    const destinationBlend = 1 - this.clamp(remaining / blendDistance, 0, 1);

    targetX = this.lerp(
      targetX,
      destinationTarget.x,
      this.smoothstep(destinationBlend)
    );

    return {
      x: this.clamp(targetX, 0, this.getWorldWidth()),
      y: Number(this.c.floor_y),
    };
  }

  getWalkLaneOffset(foot, pose) {
    const stance = this.getEffectiveStance(pose);

    if (!this.bool(this.c.side_on_walk)) {
      return foot === "left" ? -stance : stance;
    }

    const laneRatio = this.clamp(Number(this.c.walk_lane_ratio) || 0.18, 0, 1);
    return (foot === "left" ? -stance : stance) * laneRatio;
  }

  startFootStep(foot, to) {
    if (!this.feet?.[foot]) return;
    if (!to) return;

    const intensity = this.getMovementIntensity
      ? this.getMovementIntensity()
      : 0;

    const jogAmount = this.clamp(intensity - 1, 0, 1);

    const baseHeight = Math.max(0, Number(this.c.step_height) || 10);

    const jogHeightBoost = Math.max(
      0,
      Number(this.c.gait_step_height_jog_boost) || 0
    );

    this.activeStep = {
      foot,
      from: {
        ...this.feet[foot],
      },
      to: {
        x: this.clamp(Number(to.x), 0, this.getWorldWidth()),
        y: Number(this.c.floor_y),
      },
      height: baseHeight + jogHeightBoost * jogAmount,
      progress: 0,
    };
  }

  // ---------------------------------------------------------------------------
  // Leg IK helpers
  // ---------------------------------------------------------------------------

  getKneeBendDirection(side, sideOnAmount = 0) {
    const mode = String(this.c.knee_bend_mode || "travel");
    const idleBend = side === "left" ? 1 : -1;

    if (mode === "mirror") {
      return idleBend;
    }

    const speed = Math.abs(Number(this.velocity?.x || 0));
    const threshold = Math.max(
      0,
      Number(this.c.knee_bend_travel_threshold) || 0.03
    );

    const shouldUseTravelBend =
      mode === "travel" &&
      (this.isFigureMoving() || sideOnAmount > 0.1 || speed > threshold);

    if (!shouldUseTravelBend) {
      return idleBend;
    }

    const direction = this.getWalkDirection();
    return direction >= 0 ? -1 : 1;
  }

  getCatAnatomyProfile(input, profile, scale = 1) {
    /*
      Canonical cat anatomy profile.

      This is the single source of truth for anatomical proportions used by
      constrained rig solving. Behaviour should emerge from these lengths,
      preferred angles, and comfort ranges rather than scattered pixel rules.
    */

    const s = Number(scale) || 1;

    const bodyLength = Math.max(1, Number(input.bodyLength || 1) * s);

    const frontRatios = this.normaliseCatSegmentRatios(profile.frontSegments);
    const rearRatios = this.normaliseCatSegmentRatios(profile.rearSegments);

    const frontTotal = Math.max(1, Number(profile.frontLegLength || 1) * s);
    const rearTotal = Math.max(1, Number(profile.rearLegLength || 1) * s);

    const frontUpper = frontTotal * frontRatios[0];
    const frontLower = frontTotal * frontRatios[1];
    const frontPastern = frontTotal * frontRatios[2];

    const rearUpper = rearTotal * rearRatios[0];
    const rearLower = rearTotal * rearRatios[1];
    const rearFoot = rearTotal * rearRatios[2];

    return {
      body: {
        length: bodyLength,
        height: Math.max(1, Number(profile.bodyHeight || input.bodyHeight || 1) * s),
        spineCurve: Number(input.spineCurve || 0) * s,
      },

      head: {
        skullWidth: Math.max(1, Number(profile.skullWidth || input.skullWidth || 1) * s),
        skullHeight: Math.max(1, Number(profile.skullHeight || input.skullHeight || 1) * s),
        neckLength: Math.max(0.1, Number(profile.neckLength || input.neckLength || 1) * s),
      },

      front: {
        totalLength: frontTotal,
        upperLength: frontUpper,
        lowerLength: frontLower,
        pasternLength: frontPastern,

        preferredReach: frontTotal * 0.88,
        minReach: Math.max(1, Math.abs(frontUpper - frontLower) + frontPastern * 0.4),
        maxReach: frontTotal * 0.98,

        preferredElbowAngle: 165,
        preferredWristAngle: 175,
        minElbowAngle: 95,
        maxElbowAngle: 178,
        minWristAngle: 120,
        maxWristAngle: 180,
      },

      rear: {
        totalLength: rearTotal,
        upperLength: rearUpper,
        lowerLength: rearLower,
        footLength: rearFoot,

        preferredReach: rearTotal * 0.72,
        minReach: Math.max(1, Math.abs(rearUpper - rearLower) + rearFoot * 0.35),
        maxReach: rearTotal * 0.98,

        preferredKneeAngle: 105,
        preferredHockAngle: 125,
        minKneeAngle: 45,
        maxKneeAngle: 165,
        minHockAngle: 55,
        maxHockAngle: 170,
      },
    };
  }

  distanceBetweenPoints(a, b) {
    return Math.hypot(
      Number(b.x) - Number(a.x),
      Number(b.y) - Number(a.y)
    );
  }

  getJointAngleDegrees(a, joint, b) {
    /*
      Returns the inside angle at "joint" between:
        joint -> a
        joint -> b

      180 = almost straight
      90  = right angle
      0   = folded back on itself
    */
    const v1 = {
      x: Number(a.x) - Number(joint.x),
      y: Number(a.y) - Number(joint.y),
    };

    const v2 = {
      x: Number(b.x) - Number(joint.x),
      y: Number(b.y) - Number(joint.y),
    };

    const len1 = Math.max(0.001, Math.hypot(v1.x, v1.y));
    const len2 = Math.max(0.001, Math.hypot(v2.x, v2.y));

    const dot = (v1.x * v2.x + v1.y * v2.y) / (len1 * len2);
    const clampedDot = this.clamp(dot, -1, 1);

    return (Math.acos(clampedDot) * 180) / Math.PI;
  }

  // ---------------------------------------------------------------------------
  solveTwoBoneIK(start, end, lenA, lenB, bendDirection = 1, outwardAmount = 1) {
    const dx = Number(end.x) - Number(start.x);
    const dy = Number(end.y) - Number(start.y);

    const distanceRaw = Math.hypot(dx, dy);
    const distance = Math.max(0.0001, distanceRaw);

    const ux = dx / distance;
    const uy = dy / distance;

    const maxReach = Math.max(0.0001, Number(lenA) + Number(lenB) - 0.0001);
    const minReach = Math.max(
      0.0001,
      Math.abs(Number(lenA) - Number(lenB)) + 0.0001
    );

    const solvedDistance = this.clamp(distance, minReach, maxReach);

    const a =
      (Number(lenA) * Number(lenA) -
        Number(lenB) * Number(lenB) +
        solvedDistance * solvedDistance) /
      (2 * solvedDistance);

    const hSquared = Math.max(0, Number(lenA) * Number(lenA) - a * a);
    const h = Math.sqrt(hSquared) * Math.max(0, Number(outwardAmount) || 1);

    const baseX = Number(start.x) + ux * a;
    const baseY = Number(start.y) + uy * a;

    const px = -uy;
    const py = ux;

    const bend = Number(bendDirection || 1);

    return {
      x: baseX + px * h * bend,
      y: baseY + py * h * bend,
    };
  }

  applyKneeLead(knee, foot, sideOnAmount = 0) {
    if (!this.bool(this.c.knee_lead_enabled)) {
      return knee;
    }

    const sideOn = this.clamp(Number(sideOnAmount) || 0, 0, 1);

    if (sideOn <= 0.001) {
      return knee;
    }

    const direction = this.getWalkDirection();

    const intensity = this.getMovementIntensity
      ? this.getMovementIntensity()
      : 0;

    const jogAmount = this.clamp(intensity - 1, 0, 1);

    const leadAmount =
      Math.max(0, Number(this.c.knee_lead_amount) || 0) +
      Math.max(0, Number(this.c.gait_knee_lead_jog_boost) || 0) * jogAmount;

    const liftAmount =
      Math.max(0, Number(this.c.knee_lift_amount) || 0) +
      Math.max(0, Number(this.c.gait_knee_lift_jog_boost) || 0) * jogAmount;

    return {
      x: Number(knee.x) + direction * leadAmount * sideOn,
      y: Number(knee.y) - liftAmount * sideOn,
    };
  }

  // ===========================================================================
  // 11. Pose response and body measurements
  // ===========================================================================

  getVerticalPose() {
    if (!this.bool(this.c.pose_response_enabled)) {
      return { crouch: 0, stretch: 0, raw: 0 };
    }

    const standingY = this.getEffectiveStandingY(this.c);
    const currentY = Number(this.currentHead?.y ?? standingY);
    const limits = this.getHeadYLimits();

    const upwardRange = Math.max(0.0001, standingY - limits.min);
    const downwardRange = Math.max(0.0001, limits.max - standingY);

    const delta = currentY - standingY;

    const crouchRaw = this.clamp(delta / downwardRange, 0, 1);
    const stretchRaw = this.clamp(-delta / upwardRange, 0, 1);

    return {
      crouch: this.smoothstep(crouchRaw),
      stretch: this.smoothstep(stretchRaw),
      raw: delta,
    };
  }

  applyPoseScalar(baseValue, pose, { crouchRatio = 0, stretchRatio = 0 } = {}) {
    return (
      Number(baseValue) *
      (1 + pose.crouch * crouchRatio + pose.stretch * stretchRatio)
    );
  }

  getEffectiveStance(pose) {
    const totalLeg =
      Number(this.c.upper_leg_length) + Number(this.c.lower_leg_length);

    const crouch = this.clamp(Number(pose?.crouch || 0), 0, 1);
    const stretch = this.clamp(Number(pose?.stretch || 0), 0, 1);
    const moving = this.isFigureMoving() || !!this.activeStep;

    const idleHalfStance = Math.max(6, totalLeg * 0.095);
    const walkHalfStance = Math.max(idleHalfStance + 2, totalLeg * 0.135);

    const base = moving ? walkHalfStance : idleHalfStance;
    const crouchAdjust = totalLeg * (moving ? 0.03 : 0.015) * crouch;
    const stretchAdjust = totalLeg * 0.01 * stretch;

    return Math.max(5, base + crouchAdjust - stretchAdjust);
  }

  getCompactIdleStance(pose) {
    const totalLeg =
      Number(this.c.upper_leg_length) + Number(this.c.lower_leg_length);

    const crouch = this.clamp(Number(pose?.crouch || 0), 0, 1);

    const base = Math.max(6, totalLeg * 0.095);
    const crouchAdjust = totalLeg * 0.015 * crouch;

    return Math.max(5, base + crouchAdjust);
  }

  getEffectiveKneeOutward(pose) {
    const crouch = this.clamp(Number(pose?.crouch || 0), 0, 1);
    const moving = this.isFigureMoving() || !!this.activeStep;

    const idleOutward = 0.22 + crouch * 0.10;
    const movingOutward = 0.4 + crouch * 0.16;

    return moving ? movingOutward : idleOutward;
  }

  getPelvisForHead(head, pose = { crouch: 0, stretch: 0, raw: 0 }) {
    const effectiveTorsoLength = this.applyPoseScalar(
      Number(this.c.torso_length),
      pose,
      {
        crouchRatio: -Number(this.c.torso_crouch_compress_ratio),
        stretchRatio: Number(this.c.torso_stretch_extend_ratio),
      }
    );

    const neckY =
      Number(head.y) + Number(this.c.head_radius) + Number(this.c.neck_length);

    return {
      x: Number(head.x),
      y: neckY + effectiveTorsoLength,
    };
  }

  getStandingFigureHeight(config = this.c) {
    return (
      Number(config.head_radius) * 2 +
      Number(config.neck_length) +
      Number(config.torso_length) +
      Number(config.upper_leg_length) +
      Number(config.lower_leg_length)
    );
  }

  getHeadToPelvisHeight(config = this.c) {
    return (
      Number(config.head_radius) +
      Number(config.neck_length) +
      Number(config.torso_length)
    );
  }

  getEffectiveStandingY(config = this.c) {
    if (!this.bool(config.auto_standing_y)) {
      return Number(config.figure_y);
    }

    const floorY = Number(config.floor_y);
    const headToPelvis = this.getHeadToPelvisHeight(config);

    const upper = Number(config.upper_leg_length);
    const lower = Number(config.lower_leg_length);
    const totalLeg = upper + lower;

    const extensionRatio = this.clamp(
      Number(config.standing_leg_extension_ratio) || 0.96,
      0.4,
      0.99
    );

    const desiredLegDistance = totalLeg * extensionRatio;

    const stance = Math.max(
      Number(config.stance_width) || 22,
      Number(config.hip_width) / 2 + 4
    );

    const hipToFootX = Math.max(0, stance - Number(config.hip_width) / 2);
    const verticalReach = Math.sqrt(
      Math.max(0, desiredLegDistance * desiredLegDistance - hipToFootX * hipToFootX)
    );

    return floorY - verticalReach - headToPelvis;
  }

  getLegMinimumHipFloorGap(config = this.c) {
    const upper = Number(config.upper_leg_length);
    const lower = Number(config.lower_leg_length);
    const totalLeg = upper + lower;

    const minExtensionRatio = this.clamp(
      Number(config.leg_min_extension_ratio) || 0.68,
      0.25,
      0.98
    );

    const minLegDistance = totalLeg * minExtensionRatio;

    const stance = Math.max(
      Number(config.stance_width) || 22,
      Number(config.hip_width) / 2 + 4
    );

    const hipToFootX = Math.max(0, stance - Number(config.hip_width) / 2);
    const verticalSquared = minLegDistance * minLegDistance - hipToFootX * hipToFootX;

    return Math.sqrt(Math.max(8 * 8, verticalSquared));
  }

  getHeadYLimits() {
    const c = this.c;

    const standingY = this.getEffectiveStandingY(c);
    const figureHeight = Math.max(1, this.getStandingFigureHeight());

    const rawMin =
      standingY - figureHeight * Math.max(0, Number(c.head_clamp_up_ratio) || 0);

    const rawMax =
      standingY + figureHeight * Math.max(0, Number(c.head_clamp_down_ratio) || 0);

    const pelvisSafeMax =
      Number(c.floor_y) -
      this.getLegMinimumHipFloorGap(c) -
      this.getHeadToPelvisHeight(c);

    return {
      min: rawMin,
      max: Math.max(rawMin, Math.min(rawMax, pelvisSafeMax)),
    };
  }

  clampHeadY(y) {
    if (!this.bool(this.c.head_clamp_enabled)) return Number(y);

    const limits = this.getHeadYLimits();
    return this.clamp(Number(y), limits.min, limits.max);
  }

  // ===========================================================================
  // 12. Debug rendering
  // ===========================================================================

  updateGuides() {
    const layer = this.shadowRoot.querySelector("#guides");
    if (!layer) return;

    if (!this.bool(this.c.show_head_clamp)) {
      layer.innerHTML = "";
      return;
    }

    const limits = this.getHeadYLimits();
    const standingY = this.getEffectiveStandingY(this.c);
    const worldPaddingX = this.getWorldPaddingX();
    const x1 = worldPaddingX;
    const x2 = this.getWorldWidth() - worldPaddingX;

    layer.innerHTML = `
      <line x1="${x1}" y1="${limits.min}" x2="${x2}" y2="${limits.min}" class="guide" />
      <line x1="${x1}" y1="${limits.max}" x2="${x2}" y2="${limits.max}" class="guide" />
      <line x1="${x1}" y1="${standingY}" x2="${x2}" y2="${standingY}" class="guide" style="opacity:0.22;" />
    `;
  }

  updateJoints(body) {
    const layer = this.shadowRoot.querySelector("#joints");
    if (!layer) return;

    if (!this.bool(this.c.show_joints)) {
      layer.innerHTML = "";
      return;
    }

    const points = [
      body.head,
      body.neck,
      body.pelvis,
      body.leftShoulder,
      body.rightShoulder,
      body.leftHip,
      body.rightHip,
      body.leftElbow,
      body.rightElbow,
      body.leftHand,
      body.rightHand,
      body.leftKnee,
      body.rightKnee,
      body.leftFoot,
      body.rightFoot,
    ];

    layer.innerHTML = points
      .map(
        (p) => `<circle cx="${p.x}" cy="${p.y}" r="${Number(this.c.joint_size)}" class="joint" />`
      )
      .join("");
  }

  updateLegDebug(body) {
    const layer = this.shadowRoot.querySelector("#legDebug");
    if (!layer) return;

    if (!this.bool(this.c.show_leg_debug)) {
      layer.innerHTML = "";
      return;
    }

    const active = this.activeStep;

    const stepDebug = active
      ? `
        <path
          d="M ${active.from.x} ${active.from.y}
             Q ${(active.from.x + active.to.x) / 2} ${Number(this.c.floor_y) - Number(this.c.step_height)}
               ${active.to.x} ${active.to.y}"
          class="leg-debug-step"
        />
      `
      : "";

    layer.innerHTML = `
      <line x1="${body.leftHip.x}" y1="${body.leftHip.y}" x2="${body.leftFoot.x}" y2="${body.leftFoot.y}" class="leg-debug-line" />
      <line x1="${body.rightHip.x}" y1="${body.rightHip.y}" x2="${body.rightFoot.x}" y2="${body.rightFoot.y}" class="leg-debug-line" />
      <circle cx="${body.leftFoot.x}" cy="${body.leftFoot.y}" r="4" class="leg-debug-point" />
      <circle cx="${body.rightFoot.x}" cy="${body.rightFoot.y}" r="4" class="leg-debug-point" />
      ${stepDebug}
    `;
  }

  updatePoseDebug(pose) {
    const layer = this.shadowRoot.querySelector("#poseDebug");
    if (!layer) return;

    if (!this.bool(this.c.show_pose_debug)) {
      layer.innerHTML = "";
      return;
    }

    const standingY = this.getEffectiveStandingY(this.c);
    const target = this.getCurrentWaypoint();
    const speedLimitX = this.getCurrentHeadSpeedLimitX(Number(target.x));
    const movementState = this.getMovementState();

    layer.innerHTML = `
      <text x="24" y="22" class="pose-debug">state: ${movementState}</text>
      <text x="24" y="34" class="pose-debug">standingY: ${standingY.toFixed(1)}</text>
      <text x="24" y="46" class="pose-debug">crouch: ${pose.crouch.toFixed(2)}</text>
      <text x="24" y="58" class="pose-debug">stretch: ${pose.stretch.toFixed(2)}</text>
      <text x="24" y="70" class="pose-debug">step: ${this.activeStep ? this.activeStep.foot : "none"}</text>
      <text x="24" y="82" class="pose-debug">last: ${this.lastStepFoot || "none"}</text>
      <text x="24" y="94" class="pose-debug">speedX: ${speedLimitX.toFixed(2)}</text>
      <text x="24" y="106" class="pose-debug">wander: ${this.bool(this.c.auto_wander) ? "on" : "off"}</text>
    `;
  }

  // ===========================================================================
  // 13. Cat anatomical rig scaffold and rendering
  // ===========================================================================
  /*
    Cat v1 anatomical scaffold.

    Direction rule:

      cat_facing: "left"  => front is -X, back is +X
      cat_facing: "right" => front is +X, back is -X

    Important implementation detail:

      The rig is solved as named hidden anatomy points first.
      Rendering then draws a deliberately minimal stick/silhouette view from
      those points.

    This keeps future behaviours clean:

      attention target -> head/neck/ear/jaw response
      walk target      -> paw/limb/body response
      pose preset      -> rig point offsets
      renderer         -> visible SVG only
  */

  getCatFacingSign() {
    return String(this.c.cat_facing || "left") === "right" ? 1 : -1;
  }

  getCatPoseConfig() {
    const facingSign = this.getCatFacingSign();

    return {
      pose: String(this.c.cat_pose || "stand"),
      renderMode: String(this.c.cat_render_mode || "skeleton"),
      headShape: String(this.c.cat_head_shape || "anatomical"),
      facing: String(this.c.cat_facing || "left"),
      facingSign,
      frontSign: facingSign,
      backSign: -facingSign,
      x: Number(this.c.cat_x),
      y: Number(this.c.cat_y),
      scale: Math.max(0.05, Number(this.c.cat_scale) || 1),
    };
  }

  getCatSolvedFrontSign({
    frontRoot = null,
    rearRoot = null,
    fallbackFrontSign = null,
  } = {}) {
    /*
      Dynamic solved facing.

      The configured cat_facing value is still the starting/default direction.
      But once the rig is being pulled around, the live facing should come from
      body geometry:

        shoulder/neck/chest end left of hip/sacrum/tail end  => faces left
        shoulder/neck/chest end right of hip/sacrum/tail end => faces right

      This does not mutate this.c.cat_facing. It only affects the solved rig.
    */

    const fallback =
      fallbackFrontSign === 1 || fallbackFrontSign === -1
        ? fallbackFrontSign
        : this.catState?.solvedFrontSign || this.getCatFacingSign();

    if (!this.bool(this.c.cat_dynamic_facing_enabled)) {
      return fallback;
    }

    if (!frontRoot || !rearRoot) {
      return fallback;
    }

    const dx = Number(frontRoot.x) - Number(rearRoot.x);
    const deadband =
      Math.max(0, Number(this.c.cat_dynamic_facing_deadband ?? 4)) *
      Math.max(0.05, Number(this.c.cat_scale || 1));

    if (Math.abs(dx) <= deadband) {
      return this.catState?.solvedFrontSign || fallback;
    }

    return dx >= 0 ? 1 : -1;
  }


  normaliseVector(vector, fallback = { x: 1, y: 0 }) {
    const x = Number(vector?.x || 0);
    const y = Number(vector?.y || 0);
    const length = Math.hypot(x, y);

    if (length < 0.0001) {
      return { ...fallback };
    }

    return {
      x: x / length,
      y: y / length,
    };
  }

  rotatePoint(point, pivot, degrees) {
    const angle = (Number(degrees) || 0) * (Math.PI / 180);
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    const dx = Number(point.x) - Number(pivot.x);
    const dy = Number(point.y) - Number(pivot.y);

    return {
      x: Number(pivot.x) + dx * cos - dy * sin,
      y: Number(pivot.y) + dx * sin + dy * cos,
    };
  }

  getCatHeadFill() {
    if (!this.bool(this.c.cat_head_fill_enabled)) {
      return "none";
    }

    return this.c.cat_head_fill_color || this.c.cat_line_color || "currentColor";
  }

  getCatLocalPoint(origin, frontSign, localX, localY, scale = 1) {
    /*
      localX is intentionally interpreted in facing-space:
      positive values move toward the cat's front.
      negative values move toward the cat's back.

      localY remains normal SVG space:
      negative is up, positive is down.
    */
    return {
      x: Number(origin.x) + frontSign * Number(localX || 0) * scale,
      y: Number(origin.y) + Number(localY || 0) * scale,
    };
  }

  solveCatRig() {
    /*
      Live cat solver switchboard.

      Legacy manual and candidate solvers are archived in /archived. The active
      runtime path is target-led; "pose" remains as a hidden direct constrained
      fallback for debugging simple static poses.
    */
    return String(this.c.cat_body_solver_mode || "target_led") === "pose"
      ? this.solveConstrainedCatRig()
      : this.solveTargetLedCatRig();
  }

  solveTargetLedCatRig(options = {}) {
    /*
      Target-led constrained cat solver.

      This is the first proper inversion of the cat rig:

      OLD:
        body pose -> shoulder/hip roots -> desired paws -> clamped paws

      NEW:
        head/paw targets -> shoulder/hip/body roots -> limb IK

      This first version is deliberately static:
      - no stepping
      - no gait planner
      - no dragging yet
      - all paws are treated as planted target points

      The goal is to prove that the body can follow fixed head/paw targets
      before we add movement.
    */

    const cfg = this.getCatPoseConfig();
    const input = this.getConstrainedCatPoseInput(cfg);
    const profile = this.getCatProportionProfile(input);

    const s = cfg.scale;

    /*
      front/back begin from configured cat_facing, but target-led mode may
      resolve a live facing from the solved body direction later in this method.
    */
    let front = cfg.frontSign;
    let back = cfg.backSign;
    let solvedCfg = cfg;

    const anatomy = this.getCatAnatomyProfile(input, profile, s);
    const mood = this.getCatMoodOffsets(input);
    const behaviourIntent = this.getCatBehaviourIntent(input);
    const targetPlan = this.getCatTargetPlan({
      cfg,
      input,
      anatomy,
    });

    front =
      targetPlan.frontSign === 1 || targetPlan.frontSign === -1
        ? targetPlan.frontSign
        : front;
    back = -front;

    const anchor = {
      x: Number(targetPlan.anchor?.x ?? input.anchor.x),
      y: Number(targetPlan.anchor?.y ?? input.anchor.y),
    };

    // -----------------------------------------------------------------------
    // Target-led body roots
    // -----------------------------------------------------------------------

    const floorY = anchor.y;

    /*
      Base/config paw targets.

      These seed the first stance only. Once contact memory exists, the body
      should plan around current planted/active paw contacts rather than being
      pulled back to these original points forever.
    */
    const baseDesiredFrontPawNear = targetPlan.paws.frontNear;
    const baseDesiredFrontPawFar = targetPlan.paws.frontFar;
    const baseDesiredRearPawNear = targetPlan.paws.rearNear;
    const baseDesiredRearPawFar = targetPlan.paws.rearFar;

    /*
      Effective desired/planning targets.

      These are what the body-root estimate and paw resolver use. They come
      from planted contact memory first, then latest active target, then the
      base/config point only if the paw has not yet entered the live system.
    */
    const desiredFrontPawNear = this.getCatPawPlanningTarget(
      "frontNear",
      baseDesiredFrontPawNear
    );

    const desiredFrontPawFar = this.getCatPawPlanningTarget(
      "frontFar",
      baseDesiredFrontPawFar
    );

    const desiredRearPawNear = this.getCatPawPlanningTarget(
      "rearNear",
      baseDesiredRearPawNear
    );

    const desiredRearPawFar = this.getCatPawPlanningTarget(
      "rearFar",
      baseDesiredRearPawFar
    );

    const frontPawMid = this.averageCatPoints([
      desiredFrontPawNear,
      desiredFrontPawFar,
    ]);

    const rearPawMid = this.averageCatPoints([
      desiredRearPawNear,
      desiredRearPawFar,
    ]);

    const baseFrontPawMid = this.averageCatPoints([
      baseDesiredFrontPawNear,
      baseDesiredFrontPawFar,
    ]);

    const baseRearPawMid = this.averageCatPoints([
      baseDesiredRearPawNear,
      baseDesiredRearPawFar,
    ]);

    const frontReach = this.getCatFrontLimbReach({
      anatomy,
    });

    const rearReach = this.getCatRearLimbReach({
      anatomy,
    });

    /*
      Early target-led facing.

      This is the important root fix.

      Dynamic facing used to be resolved after the shoulder/hip body roots had
      already been solved. That meant the body-follow pass could still use the
      configured/default facing, then the rendered head would flip later.

      In target-led mode the head target is the strongest clue about which end
      is the front. So resolve intended facing before:
      - head-root estimation
      - shoulder/chest follow
      - neck solving
      - final skull placement

      This prevents the "flipped head collapses onto the shoulders" problem.
    */
    const headSource = String(targetPlan.head.source || "config");
    const headIsDirect = headSource === "override" || headSource === "drag";
    const anchorIsAutoLocomotion =
      String(targetPlan.anchor?.source || "") === "cat_auto_wander";

    const earlyFacingReference = rearPawMid || anchor;

    const earlySolvedFrontSign = headIsDirect
      ? this.getCatSolvedFrontSign({
          frontRoot: {
            x: Number(targetPlan.head.x),
            y: Number(targetPlan.head.y),
          },
          rearRoot: earlyFacingReference,
          fallbackFrontSign: front,
        })
      : front;

    front = earlySolvedFrontSign;
    back = -earlySolvedFrontSign;

    solvedCfg = {
      ...cfg,
      facing: front === 1 ? "right" : "left",
      facingSign: front,
      frontSign: front,
      backSign: back,
      dynamicFacing: this.bool(this.c.cat_dynamic_facing_enabled),
      configuredFacing: cfg.facing,
      configuredFrontSign: cfg.frontSign,
      earlyDynamicFacing: true,
    };

    /*
      First estimate roots from the desired paw contacts.
      This is the standing/walking-friendly estimate.
    */
    const shoulderBackFromPaws = frontReach.maxReach * 0.16;
    const shoulderHeightFromPaws = frontReach.maxReach * 0.76;

    let shoulderJoint = {
      x: frontPawMid.x - front * shoulderBackFromPaws,
      y: frontPawMid.y - shoulderHeightFromPaws,
    };

    const hipFrontFromPaws = rearReach.maxReach * 0.12;
    const hipHeightFromPaws = rearReach.maxReach * 0.68;

    let hipJoint = {
      x: rearPawMid.x + front * hipFrontFromPaws,
      y: rearPawMid.y - hipHeightFromPaws,
    };

    const poseHeightAuthority =
      this.isCatInMotionContext({
        gait: this.getCatGaitState(),
        autoWander: this.getCatAutoWanderState(),
        movementTest: this.getCatMovementTestState(),
      })
        ? 0
        : 1;
    
    if (poseHeightAuthority > 0) {
      const poseShoulderY =
        anchor.y -
        Number(input.chestHeight || 0) * s +
        Number(input.shoulderDrop || 0) * s;
    
      const poseHipY =
        anchor.y -
        Number(input.hipHeight || 0) * s +
        Number(input.hipDrop || 0) * s;
    
      shoulderJoint = {
        ...shoulderJoint,
        y: this.lerp(shoulderJoint.y, poseShoulderY, poseHeightAuthority),
      };
    
      hipJoint = {
        ...hipJoint,
        y: this.lerp(hipJoint.y, poseHipY, poseHeightAuthority),
      };
    }


    /*
      Head/body separation.

      The gait/body solve now belongs to shoulders, hips, paws, and locomotion
      anchor. Head targets are handled later as an expressive appendage, like
      the tail. This prevents autonomous walking from pulling the whole cat
      forward by the skull.
    */

    if (anchorIsAutoLocomotion) {
      /*
        Body locomotion intent.

        Planted paw memory deliberately stays in world space. Auto-wander
        therefore needs to move the shoulder/hip roots themselves through that
        support base; otherwise removing head pull leaves no body driver. The
        moving anchor supplies the body intent, and contact/gait primitives
        decide which paws release to keep up.
      */
      const locomotionShoulder = {
        x: baseFrontPawMid.x - front * shoulderBackFromPaws,
        y: baseFrontPawMid.y - shoulderHeightFromPaws,
      };
      const locomotionHip = {
        x: baseRearPawMid.x + front * hipFrontFromPaws,
        y: baseRearPawMid.y - hipHeightFromPaws,
      };
      const locomotionBlend = 0.72;

      shoulderJoint = {
        x: this.lerp(shoulderJoint.x, locomotionShoulder.x, locomotionBlend),
        y: this.lerp(shoulderJoint.y, locomotionShoulder.y, locomotionBlend),
      };
      hipJoint = {
        x: this.lerp(hipJoint.x, locomotionHip.x, locomotionBlend),
        y: this.lerp(hipJoint.y, locomotionHip.y, locomotionBlend),
      };
    }

    /*
      Gait/release arbitration.

      This decides which planted paw is allowed to release this frame. The
      preliminary and final contact passes both use the same plan so support
      calculations and final memory updates agree.
    */
    this.tickCatGaitState();

    const gaitReleasePlan = this.buildCatPawReleasePlan({
      shoulderJoint,
      hipJoint,
      frontReach,
      rearReach,
      floorY,
      front,
      scale: s,
    });

    this.getCatGaitState().lastReleasePlan = gaitReleasePlan;

    /*
      First-pass contact resolution.

      We resolve paw states once using the initial body roots. This tells the
      body whether it is supported, partly supported, or suspended.

      front/scale are passed through so the paw resolver can choose
      facing-aware active landing targets without mutating the base desired paw
      targets.
    */
    const preliminaryFrontPawNear = this.resolveCatContactAwarePawTarget({
      name: "frontNear",
      desiredPaw: desiredFrontPawNear,
      root: shoulderJoint,
      reach: frontReach,
      floorY,
      front,
      scale: s,
      bodyLength: anatomy.body.length,
      commitContactMemory: false,
      releaseAllowed: gaitReleasePlan.allowedPaws.includes("frontNear"),
      releaseRequested:
        gaitReleasePlan.enabled &&
        gaitReleasePlan.allowedPaws.includes("frontNear"),
      forceReleaseRatio: Number(this.getCatRuntimeConfigValue("cat_gait_force_release_ratio", 1)),
    });

    const preliminaryFrontPawFar = this.resolveCatContactAwarePawTarget({
      name: "frontFar",
      desiredPaw: desiredFrontPawFar,
      root: shoulderJoint,
      reach: frontReach,
      floorY,
      front,
      scale: s,
      bodyLength: anatomy.body.length,
      commitContactMemory: false,
      releaseAllowed: gaitReleasePlan.allowedPaws.includes("frontFar"),
      releaseRequested:
        gaitReleasePlan.enabled &&
        gaitReleasePlan.allowedPaws.includes("frontFar"),
      forceReleaseRatio: Number(this.getCatRuntimeConfigValue("cat_gait_force_release_ratio", 1)),
    });

    const preliminaryRearPawNear = this.resolveCatContactAwarePawTarget({
      name: "rearNear",
      desiredPaw: desiredRearPawNear,
      root: hipJoint,
      reach: rearReach,
      floorY,
      front,
      scale: s,
      bodyLength: anatomy.body.length,
      commitContactMemory: false,
      releaseAllowed: gaitReleasePlan.allowedPaws.includes("rearNear"),
      releaseRequested:
        gaitReleasePlan.enabled &&
        gaitReleasePlan.allowedPaws.includes("rearNear"),
      forceReleaseRatio: Number(this.getCatRuntimeConfigValue("cat_gait_force_release_ratio", 1)),
    });

    const preliminaryRearPawFar = this.resolveCatContactAwarePawTarget({
      name: "rearFar",
      desiredPaw: desiredRearPawFar,
      root: hipJoint,
      reach: rearReach,
      floorY,
      front,
      scale: s,
      bodyLength: anatomy.body.length,
      commitContactMemory: false,
      releaseAllowed: gaitReleasePlan.allowedPaws.includes("rearFar"),
      releaseRequested:
        gaitReleasePlan.enabled &&
        gaitReleasePlan.allowedPaws.includes("rearFar"),
      forceReleaseRatio: Number(this.getCatRuntimeConfigValue("cat_gait_force_release_ratio", 1)),
    });

    const preliminarySupportState = this.getCatSupportStateFromPaws({
      frontNear: preliminaryFrontPawNear,
      frontFar: preliminaryFrontPawFar,
      rearNear: preliminaryRearPawNear,
      rearFar: preliminaryRearPawFar,
    });

    const inMotionContext = this.isCatInMotionContext({
      gait: this.getCatGaitState(),
      autoWander: this.getCatAutoWanderState(),
      movementTest: this.getCatMovementTestState(),
      supportState: preliminarySupportState,
    });

    const comfortAuthority = this.getCatBodyComfortAuthority({
      motionContext: inMotionContext,
    });

    /*
      Let the body react to support state.

      This is the key new behaviour:
      if the cat is no longer meaningfully supported by paws, the hip/sacrum
      starts hanging from the dragged front/neck/shoulder area instead of the
      spine stretching towards old floor contacts.
    */
    const supportAdjustedBody = this.applyCatSupportStateToBody({
      shoulderJoint,
      hipJoint,
      front,
      anatomy,
      preliminarySupportState,
      authorityScale: comfortAuthority,
    });

    shoulderJoint = supportAdjustedBody.shoulderJoint;
    hipJoint = supportAdjustedBody.hipJoint;

    const postureAdjustedBody = this.applyCatPostureToBodyRoots({
      shoulderJoint,
      hipJoint,
      front,
      anatomy,
      supportState: supportAdjustedBody.supportState,
      headPull: 0,
      authorityScale: comfortAuthority,
    });

    shoulderJoint = postureAdjustedBody.shoulderJoint;
    hipJoint = postureAdjustedBody.hipJoint;

    /*
      Spine/body-root comfort.

      Contact and landing can pull the body roots together or apart. Keep that
      length inside a soft anatomical envelope before the final paw solve, so
      walking does not slowly concertina into a bunched support base.
    */
    const spineComfort = this.applyCatSpineLengthComfort({
      shoulderJoint,
      hipJoint,
      front,
      anatomy,
      supportState: supportAdjustedBody.supportState,
      authorityScale: comfortAuthority,
    });

    shoulderJoint = spineComfort.shoulderJoint;
    hipJoint = spineComfort.hipJoint;

    /*
      Final facing confirmation.

      Facing has already been resolved from the head target before the body
      solve. At this point we only confirm it from the solved body direction.

      In practice this should usually agree with the early facing. The deadband
      in getCatSolvedFrontSign prevents flicker when the body is nearly vertical.
    */
    const solvedFrontSign = this.getCatSolvedFrontSign({
      frontRoot: shoulderJoint,
      rearRoot: hipJoint,
      fallbackFrontSign: front,
    });

    front = solvedFrontSign;
    back = -solvedFrontSign;

    solvedCfg = {
      ...solvedCfg,
      facing: front === 1 ? "right" : "left",
      facingSign: front,
      frontSign: front,
      backSign: back,
      finalDynamicFacing: true,
    };

    /*
      Convert hidden joint roots back to visible body points.

      shoulderJoint = chest + local shoulder offset
      hipJoint      = sacrum + local hip offset
    */
    const chest = {
      x: shoulderJoint.x - front * Number(input.shoulderForward || 0) * s,
      y: shoulderJoint.y - Number(input.shoulderDrop || 0) * s,
    };

    const sacrum = {
      x: hipJoint.x - front * Number(input.hipForward || 0) * s,
      y: hipJoint.y - Number(input.hipDrop || 0) * s,
    };

    const spineCurve =
      Number(input.spineCurve || 0) * s + Number(mood.spineCurve || 0) * s;

    const midSpine = {
      x: this.lerp(chest.x, sacrum.x, 0.5),
      y: this.lerp(chest.y, sacrum.y, 0.5) - spineCurve,
    };

    // -----------------------------------------------------------------------
    // Neck / head
    // -----------------------------------------------------------------------

    /*
      Neck base is the body-side end of the neck.

      For now this remains the chest/front-spine point. Later, if we want a more
      skeletal rig, this could become a separate cervical root between chest and
      shoulderJoint.
    */
    const neckBase = { ...chest };

    /*
      Desired skull target.

      Direct dragging remains a strong skull target. Autonomous walking is
      socket-led: the body/chest travels, then the head is carried from an
      upright neck socket near that chest. That keeps auto-wander from feeling
      like an invisible hand is pulling the cat by the face.
    */
    let desiredSkull = {
      x: targetPlan.head.x + Number(mood.headForward || 0) * front * s,
      y: targetPlan.head.y + Number(mood.headLift || 0) * s,
      width: profile.skullWidth * s,
      height: profile.skullHeight * s,
      tilt: Number(targetPlan.head.angle || 0) + Number(mood.headTilt || 0),
      roundness: input.skullRoundness,
      source: targetPlan.head.source || "config",
    };

    if (!headIsDirect) {
      const neckLength = Math.max(1, Number(anatomy?.head?.neckLength || 1));
      const pace = this.clamp(Number(behaviourIntent.paceMultiplier || 1), 0.25, 2);
      const paceForwardBias = Math.max(0, pace - 1) * 0.08;
      const paceLiftBias = -Math.max(0, pace - 1) * 0.12;
      const carriedSocket = {
        x:
          neckBase.x +
          front *
            neckLength *
            this.clamp(
              Number(this.getCatRuntimeConfigValue("cat_auto_head_carry_forward_ratio", 0.08)) +
                paceForwardBias +
                Number(behaviourIntent.headForwardBias || 0) / Math.max(1, neckLength) * 0.35,
              -1,
              1
            ),
        y:
          neckBase.y -
          neckLength *
            this.clamp(
              Number(this.getCatRuntimeConfigValue("cat_auto_head_carry_lift_ratio", 1.18)) +
                paceLiftBias +
                Number(behaviourIntent.headLiftBias || 0) / Math.max(1, neckLength) * 0.35,
              0,
              2
            ),
      };

      desiredSkull = {
        ...this.getCatSkullFromNeckSocket({
          socket: carriedSocket,
          skullPrototype: desiredSkull,
          cfg: {
            ...solvedCfg,
            scale: s,
            frontSign: front,
          },
        }),
        source: "carried_body",
        carriedSocket,
      };
    }

    const neckSolve = this.solveCatNeckLimb({
      neckBase,
      desiredSkull,
      anatomy,
      cfg: {
        ...solvedCfg,
        scale: s,
        frontSign: front,
      },
      scale: s,
      authorityScale: comfortAuthority,
    });

    const skull = neckSolve.skull;
    const neckTip = neckSolve.neckTip;
    const neckControl = neckSolve.neckControl;

    // Legacy/debug face points retained so debug layers and future eye/look
    // systems still have meaningful anchors.
    const nose = {
      x: skull.x + front * skull.width * 0.56,
      y: skull.y + skull.height * 0.08,
    };

    const muzzleTop = {
      x: skull.x + front * skull.width * 0.42,
      y: skull.y - skull.height * 0.15,
    };

    const muzzleBottom = {
      x: skull.x + front * skull.width * 0.43,
      y: skull.y + skull.height * 0.23,
    };

    const jawPivot = {
      x: skull.x + front * skull.width * 0.1,
      y: skull.y + skull.height * 0.2,
    };

    const jawTip = {
      x: jawPivot.x + front * skull.width * 0.45,
      y: jawPivot.y + skull.height * 0.3,
    };

    const ears = this.getCatEarRig({
      skull,
      front,
      scale: s,
    });

    // -----------------------------------------------------------------------
    // Paw targets
    // -----------------------------------------------------------------------

    /*
      Final contact resolution.

      We resolve again after support adjustment, so hanging paws follow their
      final shoulder/hip roots.
    */
    const frontPawNear = this.resolveCatContactAwarePawTarget({
      name: "frontNear",
      desiredPaw: desiredFrontPawNear,
      root: shoulderJoint,
      reach: frontReach,
      floorY,
      front,
      scale: s,
      bodyLength: anatomy.body.length,
      commitContactMemory: true,
      releaseAllowed: gaitReleasePlan.allowedPaws.includes("frontNear"),
      releaseRequested:
        gaitReleasePlan.enabled &&
        gaitReleasePlan.allowedPaws.includes("frontNear"),
      forceReleaseRatio: Number(this.getCatRuntimeConfigValue("cat_gait_force_release_ratio", 1)),
    });

    const frontPawFar = this.resolveCatContactAwarePawTarget({
      name: "frontFar",
      desiredPaw: desiredFrontPawFar,
      root: shoulderJoint,
      reach: frontReach,
      floorY,
      front,
      scale: s,
      bodyLength: anatomy.body.length,
      commitContactMemory: true,
      releaseAllowed: gaitReleasePlan.allowedPaws.includes("frontFar"),
      releaseRequested:
        gaitReleasePlan.enabled &&
        gaitReleasePlan.allowedPaws.includes("frontFar"),
      forceReleaseRatio: Number(this.getCatRuntimeConfigValue("cat_gait_force_release_ratio", 1)),
    });

    const rearPawNear = this.resolveCatContactAwarePawTarget({
      name: "rearNear",
      desiredPaw: desiredRearPawNear,
      root: hipJoint,
      reach: rearReach,
      floorY,
      front,
      scale: s,
      bodyLength: anatomy.body.length,
      commitContactMemory: true,
      releaseAllowed: gaitReleasePlan.allowedPaws.includes("rearNear"),
      releaseRequested:
        gaitReleasePlan.enabled &&
        gaitReleasePlan.allowedPaws.includes("rearNear"),
      forceReleaseRatio: Number(this.getCatRuntimeConfigValue("cat_gait_force_release_ratio", 1)),
    });

    const rearPawFar = this.resolveCatContactAwarePawTarget({
      name: "rearFar",
      desiredPaw: desiredRearPawFar,
      root: hipJoint,
      reach: rearReach,
      floorY,
      front,
      scale: s,
      bodyLength: anatomy.body.length,
      commitContactMemory: true,
      releaseAllowed: gaitReleasePlan.allowedPaws.includes("rearFar"),
      releaseRequested:
        gaitReleasePlan.enabled &&
        gaitReleasePlan.allowedPaws.includes("rearFar"),
      forceReleaseRatio: Number(this.getCatRuntimeConfigValue("cat_gait_force_release_ratio", 1)),
    });

    const supportState = this.getCatSupportStateFromPaws({
      frontNear: frontPawNear,
      frontFar: frontPawFar,
      rearNear: rearPawNear,
      rearFar: rearPawFar,
    });

    const bellyGuideForLimbPreference = this.getCatBellyLine(
      {
        ...this.catState?.rig,
        cfg: solvedCfg,
        solvedFrontSign: front,
        chest,
        midSpine,
        sacrum,
      },
      anatomy
    );

    // -----------------------------------------------------------------------
    // Limb solving
    // -----------------------------------------------------------------------

    const frontNear = this.solveCatConstrainedFrontLimb({
      shoulder: shoulderJoint,
      paw: frontPawNear,
      anatomy,
      front,
      bendStrength: 1,
      jointBandPreference: bellyGuideForLimbPreference,
      continuityKey: "frontNear",
    });

    const frontFar = this.solveCatConstrainedFrontLimb({
      shoulder: shoulderJoint,
      paw: frontPawFar,
      anatomy,
      front,
      bendStrength: 1,
      jointBandPreference: bellyGuideForLimbPreference,
      continuityKey: "frontFar",
    });

    const rearNear = this.solveCatConstrainedRearLimb({
      hip: hipJoint,
      paw: rearPawNear,
      anatomy,
      front,
      kneeForward: Math.max(3, anatomy.rear.upperLength * 0.32),
      kneeDrop: Math.max(2, anatomy.rear.upperLength * 0.18),
      hockBack: Math.max(2, anatomy.rear.footLength * 0.8),
      hockHeight: Math.max(2, anatomy.rear.footLength * 0.8),
      blend: 1,
      jointBandPreference: bellyGuideForLimbPreference,
      continuityKey: "rearNear",
    });

    const rearFar = this.solveCatConstrainedRearLimb({
      hip: hipJoint,
      paw: rearPawFar,
      anatomy,
      front,
      kneeForward: Math.max(3, anatomy.rear.upperLength * 0.32),
      kneeDrop: Math.max(2, anatomy.rear.upperLength * 0.18),
      hockBack: Math.max(2, anatomy.rear.footLength * 0.8),
      hockHeight: Math.max(2, anatomy.rear.footLength * 0.8),
      blend: 1,
      jointBandPreference: bellyGuideForLimbPreference,
      continuityKey: "rearFar",
    });

    // -----------------------------------------------------------------------
    // Tail as spine continuation
    // -----------------------------------------------------------------------

    const spineVector = this.normaliseVector(
      {
        x: sacrum.x - chest.x,
        y: sacrum.y - chest.y,
      },
      { x: back, y: 0 }
    );

    const tailIntent = this.resolveCatTailIntent({
      tailBase: sacrum,
      spineVector,
      input,
      anatomy,
      front,
      scale: s,
    });

    const tail = this.solveCatTail({
      tailBase: sacrum,
      spineVector,
      front,
      back,
      tailLength: Number(
        this.getCatRuntimeConfigValue(
          "cat_tail_length",
          this.c.cat_tail_length ?? anatomy.body.tailLength
        )
      ) * s,
      tailCurve:
        Number(this.getCatRuntimeConfigValue("cat_tail_curve", this.c.cat_tail_curve) || 0) * 0.35 * s + tailIntent.curve,
      tailLift: Number(this.getCatRuntimeConfigValue("cat_tail_lift", this.c.cat_tail_lift) || 0) * 0.2 * s,
      tailFollow: tailIntent.follow,
      tailBaseAngle: Number(this.getCatRuntimeConfigValue("cat_tail_base_angle", this.c.cat_tail_base_angle) || 0),
      tailTipCurl:
        Number(this.getCatRuntimeConfigValue("cat_tail_tip_curl", this.c.cat_tail_tip_curl) || 0) * 0.25 * s + tailIntent.curl,
      midLiftRatio: this.clamp(Number(this.getCatRuntimeConfigValue("cat_tail_mid_lift_ratio", this.c.cat_tail_mid_lift_ratio) ?? 0.1), 0, 1),
      midCurveRatio: this.clamp(Number(this.getCatRuntimeConfigValue("cat_tail_mid_curve_ratio", this.c.cat_tail_mid_curve_ratio) ?? 0.3), -1, 1),
      tailTipTarget: this.bool(this.getCatRuntimeConfigValue("cat_tail_mood_enabled", this.c.cat_tail_mood_enabled))
        ? tailIntent.smoothedTip
        : null,
    });

    const { tailBase, tailControl, tailMid, tailTipControl, tailTip } = tail;

    const rig = {
      cfg: solvedCfg,
      rigMode: "target_led",
      targetPlan,
      supportState,
      postureState: postureAdjustedBody.postureState,
      spineLengthState: spineComfort.spineLengthState,
      gaitReleasePlan,
      tailIntent,

      solvedFrontSign: front,
      solvedBackSign: back,
      configuredFrontSign: cfg.frontSign,

      anchor,

      chest,
      midSpine,
      sacrum,
      shoulderJoint,
      hipJoint,

      neckBase,
      neckControl,
      neckTip,

      skull,
      nose,
      muzzleTop,
      muzzleBottom,
      jawPivot,
      jawTip,

      frontEar: ears.frontEar,
      rearEar: ears.rearEar,

      frontElbowNear: frontNear.jointA,
      frontWristNear: frontNear.jointB,
      frontPawNear,
      desiredFrontPawNear,
      frontPawNearState: frontPawNear.state,

      frontElbowFar: frontFar.jointA,
      frontWristFar: frontFar.jointB,
      frontPawFar,
      desiredFrontPawFar,
      frontPawFarState: frontPawFar.state,

      rearKneeNear: rearNear.jointA,
      rearHockNear: rearNear.jointB,
      rearPawNear,
      desiredRearPawNear,
      rearPawNearState: rearPawNear.state,

      rearKneeFar: rearFar.jointA,
      rearHockFar: rearFar.jointB,
      rearPawFar,
      desiredRearPawFar,
      rearPawFarState: rearPawFar.state,

      tailBase,
      tailControl,
      tailMid,
      tailTipControl,
      tailTip,
    };

    rig.bounds = this.getCatBounds(rig);
    rig.anatomy = anatomy;
    rig.bellyGuide = this.getCatBellyLine(rig, anatomy);

    return rig;
  }

  // ---------------------------------------------------------------------------
  solveConstrainedCatRig(options = {}) {
    /*
      Cat Rig v2: direct constrained procedural stand scaffold.

      This builds the same named output rig points as target-led mode, but from
      direct pose inputs:
      - body anchor
      - facing
      - body/spine/head pose
      - paw targets
      - proportion ratios
      - mood offsets

      For now this is still a standing-pose solver. Later, sit/loaf/stretch and
      terrain-aware paw placement can feed into this same structure.
    */
    const cfg = this.getCatPoseConfig();
    const input = this.getConstrainedCatPoseInput(cfg);
    const profile = this.getCatProportionProfile(input);

    const s = cfg.scale;
    const front = cfg.frontSign;
    const back = cfg.backSign;

    const anatomy = this.getCatAnatomyProfile(input, profile, s);
    const mood = this.getCatMoodOffsets(input);

    const anchor = {
      x: input.anchor.x,
      y: input.anchor.y,
    };

    // -----------------------------------------------------------------------
    // Body / spine
    // -----------------------------------------------------------------------

    const bodyLength = input.bodyLength * s;

    /*
      V2 body model:
      - chest and hip heights are explicit floor-relative controls
      - spine angle rotates the chest/sacrum relationship
      - spine curve only bends the midpoint
    */
    const spineAngleRad = (Number(input.spineAngle || 0) * Math.PI) / 180;
    const halfBody = bodyLength * 0.42;

    const backAxis = this.normaliseVector(
      {
        x: Math.cos(spineAngleRad) * back,
        y: Math.sin(spineAngleRad),
      },
      { x: back, y: 0 }
    );

    const chest = {
      x: anchor.x - backAxis.x * halfBody,
      y:
        anchor.y -
        input.chestHeight * s -
        backAxis.y * halfBody +
        mood.chestLift * s,
    };

    const sacrum = {
      x: anchor.x + backAxis.x * halfBody,
      y:
        anchor.y -
        input.hipHeight * s +
        backAxis.y * halfBody +
        mood.hipLift * s,
    };

    const midSpine = {
      x: this.lerp(chest.x, sacrum.x, 0.5),
      y:
        this.lerp(chest.y, sacrum.y, 0.5) -
        input.spineCurve * s +
        mood.spineCurve * s,
    };

    const shoulderJoint = this.getCatLocalPoint(
      chest,
      front,
      input.shoulderForward,
      input.shoulderDrop,
      s
    );

    const hipJoint = this.getCatLocalPoint(
      sacrum,
      front,
      input.hipForward,
      input.hipDrop,
      s
    );

    // -----------------------------------------------------------------------
    // Neck / head
    // -----------------------------------------------------------------------

    const neckBase = { ...chest };

    const neckControl = this.getCatLocalPoint(
      neckBase,
      front,
      input.neckForward,
      -input.neckLift + mood.neckLift,
      s
    );

    const neckTip = this.getCatLocalPoint(
      neckControl,
      front,
      profile.neckLength,
      (-input.neckLift + mood.neckLift) * 0.35,
      s
    );

    /*
      V2 head target:
      - headForward is facing-aware
      - headLift is positive upwards
      - headTilt is explicit, with mood added on top
    */
    const skull = {
      x:
        neckTip.x +
        front * input.headForward * s +
        mood.headForward * front * s,
      y: neckTip.y - input.headLift * s + mood.headLift * s,
      width: profile.skullWidth * s,
      height: profile.skullHeight * s,
      tilt: input.headTilt + mood.headTilt,
      roundness: input.skullRoundness,
    };

    // Legacy/debug face points retained so debug layers and future eye/look
    // systems still have meaningful anchors.
    const nose = {
      x: skull.x + front * skull.width * 0.56,
      y: skull.y + skull.height * 0.08,
    };

    const muzzleTop = {
      x: skull.x + front * skull.width * 0.42,
      y: skull.y - skull.height * 0.15,
    };

    const muzzleBottom = {
      x: skull.x + front * skull.width * 0.43,
      y: skull.y + skull.height * 0.23,
    };

    const jawPivot = {
      x: skull.x + front * skull.width * 0.1,
      y: skull.y + skull.height * 0.2,
    };

    const jawTip = {
      x: jawPivot.x + front * skull.width * 0.45,
      y: jawPivot.y + skull.height * 0.3,
    };

    const ears = this.getCatEarRig({
      skull,
      front,
      scale: s,
    });

    // -----------------------------------------------------------------------
    // Paw targets
    // -----------------------------------------------------------------------

    /*
      V2 paw targets:
      - X is local/facing-aware from the shoulder or hip joint
      - Y is relative to the current floor/anchor
      - positive Y means lower than the floor line, negative means raised

      These are desired world-space targets. The actual paw positions may be
      clamped by anatomical reach constraints.
    */
    const generatedDesiredPawTargets = this.getCatDesiredPawTargets({
      shoulderJoint,
      hipJoint,
      anchor,
      input,
      front,
      scale: s,
    });

    const desiredPawTargets =
      options.desiredPawTargets || generatedDesiredPawTargets;

    const {
      desiredFrontPawNear,
      desiredFrontPawFar,
      desiredRearPawNear,
      desiredRearPawFar,
    } = desiredPawTargets;

    const frontReach = this.getCatFrontLimbReach({
      anatomy,
    });

    const frontPawNear = this.clampCatPawTargetToReach({
      root: shoulderJoint,
      desiredPaw: desiredFrontPawNear,
      minReach: frontReach.minReach,
      maxReach: frontReach.maxReach,
    });

    const frontPawFar = this.clampCatPawTargetToReach({
      root: shoulderJoint,
      desiredPaw: desiredFrontPawFar,
      minReach: frontReach.minReach,
      maxReach: frontReach.maxReach,
    });

    const rearReach = this.getCatRearLimbReach({
      anatomy,
    });

    const rearPawNear = this.clampCatPawTargetToReach({
      root: hipJoint,
      desiredPaw: desiredRearPawNear,
      minReach: rearReach.minReach,
      maxReach: rearReach.maxReach,
    });

    const rearPawFar = this.clampCatPawTargetToReach({
      root: hipJoint,
      desiredPaw: desiredRearPawFar,
      minReach: rearReach.minReach,
      maxReach: rearReach.maxReach,
    });

    const bellyGuideForLimbPreference = this.getCatBellyLine(
      {
        cfg,
        solvedFrontSign: front,
        chest,
        midSpine,
        sacrum,
      },
      anatomy
    );

    // -----------------------------------------------------------------------
    // Limb solving
    // -----------------------------------------------------------------------

    const frontNear = this.solveCatConstrainedFrontLimb({
      shoulder: shoulderJoint,
      paw: frontPawNear,
      anatomy,
      front,
      bendStrength: 1,
      jointBandPreference: bellyGuideForLimbPreference,
      continuityKey: "poseFrontNear",
    });

    const frontFar = this.solveCatConstrainedFrontLimb({
      shoulder: shoulderJoint,
      paw: frontPawFar,
      anatomy,
      front,
      bendStrength: 1,
      jointBandPreference: bellyGuideForLimbPreference,
      continuityKey: "poseFrontFar",
    });

    const rearNear = this.solveCatConstrainedRearLimb({
      hip: hipJoint,
      paw: rearPawNear,
      anatomy,
      front,
      kneeForward: Math.max(3, anatomy.rear.totalLength * 0.28),
      kneeDrop: Math.max(5, anatomy.rear.totalLength * 0.28),
      hockBack: Math.max(4, anatomy.rear.totalLength * 0.24),
      hockHeight: Math.max(4, anatomy.rear.totalLength * 0.18),
      blend: 1,
      jointBandPreference: bellyGuideForLimbPreference,
      continuityKey: "poseRearNear",
    });

    const rearFar = this.solveCatConstrainedRearLimb({
      hip: hipJoint,
      paw: rearPawFar,
      anatomy,
      front,
      kneeForward: Math.max(3, anatomy.rear.totalLength * 0.28),
      kneeDrop: Math.max(5, anatomy.rear.totalLength * 0.28),
      hockBack: Math.max(4, anatomy.rear.totalLength * 0.24),
      hockHeight: Math.max(4, anatomy.rear.totalLength * 0.18),
      blend: 1,
      jointBandPreference: bellyGuideForLimbPreference,
      continuityKey: "poseRearFar",
    });

    // -----------------------------------------------------------------------
    // Tail as spine continuation
    // -----------------------------------------------------------------------

    const spineVector = this.normaliseVector(
      {
        x: sacrum.x - midSpine.x,
        y: sacrum.y - midSpine.y,
      },
      { x: back, y: 0 }
    );

    const tail = this.solveCatTail({
      tailBase: sacrum,
      spineVector,
      front,
      back,
      tailLength: profile.tailLength * s,
      tailCurve: input.tailCurve * s + mood.tailCurve * s,
      tailLift: input.tailLift * s + mood.tailLift * s,
      tailFollow: this.clamp(input.tailSpineFollow, 0, 1),
      tailBaseAngle: input.tailBaseAngle,
      tailTipCurl: input.tailTipCurl * s + mood.tailTipCurl * s,
      midLiftRatio: input.tailMidLiftRatio,
      midCurveRatio: input.tailMidCurveRatio,
    });

    const { tailBase, tailControl, tailMid, tailTipControl, tailTip } = tail;

    const rig = {
      cfg,
      rigMode: "constrained",

      anchor,

      chest,
      midSpine,
      sacrum,
      shoulderJoint,
      hipJoint,

      neckBase,
      neckControl,
      neckTip,

      skull,
      nose,
      muzzleTop,
      muzzleBottom,
      jawPivot,
      jawTip,

      frontEar: ears.frontEar,
      rearEar: ears.rearEar,

      frontElbowNear: frontNear.jointA,
      frontWristNear: frontNear.jointB,
      frontPawNear,
      desiredFrontPawNear,

      frontElbowFar: frontFar.jointA,
      frontWristFar: frontFar.jointB,
      frontPawFar,
      desiredFrontPawFar,

      rearKneeNear: rearNear.jointA,
      rearHockNear: rearNear.jointB,
      rearPawNear,
      desiredRearPawNear,

      rearKneeFar: rearFar.jointA,
      rearHockFar: rearFar.jointB,
      rearPawFar,
      desiredRearPawFar,

      tailBase,
      tailControl,
      tailMid,
      tailTipControl,
      tailTip,
    };

    rig.bounds = this.getCatBounds(rig);

    rig.anatomy = anatomy;
    rig.bellyGuide = this.getCatBellyLine(rig, anatomy);

    return rig;
  }

  getConstrainedCatPoseInput(cfg) {
    const c = this.getCatRuntimeConfig();

    /*
      Blend lets us compare old/manual-adjacent constrained inputs with the
      cleaner V2 pose controls.

      0 = old control vocabulary
      1 = V2 pose-target vocabulary
    */
    const poseBlend = this.clamp(Number(c.cat_pose_control_blend ?? 1), 0, 1);

    const oldChestHeight =
      Number(c.cat_body_height || 0) + Number(c.cat_chest_lift || 0);

    const oldHipHeight =
      Number(c.cat_body_height || 0) + Number(c.cat_hip_lift || 0);

    const oldFrontNearX =
      Number(c.cat_front_paw_forward || 0) -
      Number(c.cat_front_paw_spread || 0) * 0.5;

    const oldFrontFarX =
      Number(c.cat_front_paw_forward || 0) +
      Number(c.cat_front_far_paw_offset || 0) +
      Number(c.cat_front_paw_spread || 0) * 0.5;

    const oldRearNearX =
      Number(c.cat_rear_paw_forward || 0) -
      Number(c.cat_rear_paw_spread || 0) * 0.5;

    const oldRearFarX =
      Number(c.cat_rear_paw_forward || 0) +
      Number(c.cat_rear_far_paw_offset || 0) +
      Number(c.cat_rear_paw_spread || 0) * 0.5;

    return {
      anchor: {
        x: Number(cfg.x),
        y: Number(cfg.y),
      },

      poseBlend,

      bodyLength: Number(c.cat_body_length) || 1,

      spineAngle: this.lerp(
        Number(c.cat_body_slope || 0),
        Number(c.cat_v2_spine_angle || 0),
        poseBlend
      ),

      spineCurve: this.lerp(
        Number(c.cat_spine_curve || 0),
        Number(c.cat_v2_spine_curve || 0),
        poseBlend
      ),

      chestHeight: this.lerp(
        oldChestHeight,
        Number(c.cat_v2_chest_height || oldChestHeight),
        poseBlend
      ),

      hipHeight: this.lerp(
        oldHipHeight,
        Number(c.cat_v2_hip_height || oldHipHeight),
        poseBlend
      ),

      bodySlope: Number(c.cat_body_slope || 0),
      chestLift: Number(c.cat_chest_lift || 0),
      hipLift: Number(c.cat_hip_lift || 0),

      shoulderForward: Number(c.cat_shoulder_joint_forward || 0),
      shoulderDrop: Number(c.cat_shoulder_joint_drop || 0),
      hipForward: Number(c.cat_hip_joint_forward || 0),
      hipDrop: Number(c.cat_hip_joint_drop || 0),

      neckLength: Number(c.cat_neck_length || 0),
      neckLift: Number(c.cat_neck_lift || 0),
      neckForward: Number(c.cat_neck_forward || 0),

      headForward: this.lerp(
        Math.abs(Number(c.cat_skull_offset_x ?? c.cat_head_offset_x ?? 0)),
        Number(c.cat_v2_head_forward || 0),
        poseBlend
      ),

      headLift: this.lerp(
        -Number(c.cat_skull_offset_y ?? c.cat_head_offset_y ?? 0),
        Number(c.cat_v2_head_lift || 0),
        poseBlend
      ),

      headTilt: this.lerp(
        Number(c.cat_skull_tilt || 0),
        Number(c.cat_v2_head_tilt || 0),
        poseBlend
      ),

      skullWidth: Number(c.cat_skull_width || c.cat_head_width || 1),
      skullHeight: Number(c.cat_skull_height || c.cat_head_height || 1),
      skullOffsetX: Number(c.cat_skull_offset_x ?? c.cat_head_offset_x ?? 0),
      skullOffsetY: Number(c.cat_skull_offset_y ?? c.cat_head_offset_y ?? 0),
      skullTilt: Number(c.cat_skull_tilt || 0),
      skullRoundness: Number(c.cat_skull_roundness ?? 0.5),

      frontNearPawX: this.lerp(
        oldFrontNearX,
        Number(c.cat_v2_front_near_paw_x ?? oldFrontNearX),
        poseBlend
      ),

      frontNearPawY: this.lerp(
        0,
        Number(c.cat_v2_front_near_paw_y || 0),
        poseBlend
      ),

      frontFarPawX: this.lerp(
        oldFrontFarX,
        Number(c.cat_v2_front_far_paw_x ?? oldFrontFarX),
        poseBlend
      ),

      frontFarPawY: this.lerp(
        0,
        Number(c.cat_v2_front_far_paw_y || 0),
        poseBlend
      ),

      rearNearPawX: this.lerp(
        oldRearNearX,
        Number(c.cat_v2_rear_near_paw_x ?? oldRearNearX),
        poseBlend
      ),

      rearNearPawY: this.lerp(
        0,
        Number(c.cat_v2_rear_near_paw_y || 0),
        poseBlend
      ),

      rearFarPawX: this.lerp(
        oldRearFarX,
        Number(c.cat_v2_rear_far_paw_x ?? oldRearFarX),
        poseBlend
      ),

      rearFarPawY: this.lerp(
        0,
        Number(c.cat_v2_rear_far_paw_y || 0),
        poseBlend
      ),

      frontPawForward: Number(c.cat_front_paw_forward || 0),
      frontPawSpread: Number(c.cat_front_paw_spread || 0),
      frontFarPawOffset: Number(c.cat_front_far_paw_offset || 0),
      frontLegBend: Number(c.cat_front_leg_bend || 0),

      rearPawForward: Number(c.cat_rear_paw_forward || 0),
      rearPawSpread: Number(c.cat_rear_paw_spread || 0),
      rearFarPawOffset: Number(c.cat_rear_far_paw_offset || 0),
      rearLegBend: Number(c.cat_rear_leg_bend || 0),

      tailCurve: Number(c.cat_tail_curve || 0),
      tailLift: Number(c.cat_tail_lift || 0),
      tailSpineFollow: Number(c.cat_tail_spine_follow ?? 1),
      tailBaseAngle: Number(c.cat_tail_base_angle || 0),
      tailTipCurl: Number(c.cat_tail_tip_curl || 0),
      tailMidLiftRatio: this.clamp(
        Number(c.cat_tail_mid_lift_ratio ?? 0.3),
        0,
        1
      ),
      tailMidCurveRatio: this.clamp(
        Number(c.cat_tail_mid_curve_ratio ?? -0.2),
        -1,
        1
      ),

      mood: this.getCurrentCatMood(),
    };
  }

  getCatProportionProfile(input) {
    const c = this.getCatRuntimeConfig();
    const bodyLength = Math.max(1, Number(input.bodyLength) || 1);

    const profileName = String(c.cat_proportion_profile || "current_stand");

    const presets = {
      current_stand: {
        bodyHeight: Number(c.cat_ratio_body_height ?? 0.64),
        neckLength: Number(c.cat_ratio_neck_length ?? 0.12),
        skullWidth: Number(c.cat_ratio_skull_width ?? 0.48),
        skullHeight: Number(c.cat_ratio_skull_height ?? 0.28),
        frontLegLength: Number(c.cat_ratio_front_leg_length ?? 0.43),
        rearLegLength: Number(c.cat_ratio_rear_leg_length ?? 0.62),
        tailLength: Number(c.cat_ratio_tail_length ?? 0.9),

        frontSegments: [
          Number(c.cat_ratio_front_upper ?? 0.4),
          Number(c.cat_ratio_front_lower ?? 0.38),
          Number(c.cat_ratio_front_pastern ?? 0.22),
        ],

        rearSegments: [
          Number(c.cat_ratio_rear_upper ?? 0.38),
          Number(c.cat_ratio_rear_lower ?? 0.34),
          Number(c.cat_ratio_rear_foot ?? 0.28),
        ],
      },

      natural_stand: {
        bodyHeight: 0.62,
        neckLength: 0.14,
        skullWidth: 0.46,
        skullHeight: 0.27,
        frontLegLength: 0.45,
        rearLegLength: 0.64,
        tailLength: 0.7,
        frontSegments: [0.38, 0.4, 0.22],
        rearSegments: [0.36, 0.36, 0.28],
      },

      kittenish: {
        bodyHeight: 0.66,
        neckLength: 0.11,
        skullWidth: 0.55,
        skullHeight: 0.34,
        frontLegLength: 0.42,
        rearLegLength: 0.58,
        tailLength: 0.5,
        frontSegments: [0.38, 0.38, 0.24],
        rearSegments: [0.36, 0.34, 0.3],
      },

      long_cat: {
        bodyHeight: 0.5,
        neckLength: 0.16,
        skullWidth: 0.4,
        skullHeight: 0.23,
        frontLegLength: 0.44,
        rearLegLength: 0.66,
        tailLength: 0.95,
        frontSegments: [0.4, 0.39, 0.21],
        rearSegments: [0.37, 0.35, 0.28],
      },
    };

    const selected = presets[profileName] || presets.current_stand;
    const normalise = (values) => {
      const cleaned = values.map((value) => Math.max(0.01, Number(value) || 0.01));
      const total = cleaned.reduce((sum, value) => sum + value, 0) || 1;
      return cleaned.map((value) => value / total);
    };

    return {
      bodyHeight: bodyLength * selected.bodyHeight,
      neckLength: bodyLength * selected.neckLength,
      skullWidth: bodyLength * selected.skullWidth,
      skullHeight: bodyLength * selected.skullHeight,
      frontLegLength: bodyLength * selected.frontLegLength,
      rearLegLength: bodyLength * selected.rearLegLength,
      tailLength: bodyLength * selected.tailLength,
      frontSegments: normalise(selected.frontSegments),
      rearSegments: normalise(selected.rearSegments),
    };
  }

  getCatMoodNames() {
    return ["neutral", "relaxed", "curious", "alert", "playful"];
  }

  getCurrentCatMood() {
    const configured = String(this.c?.cat_mood || "neutral");
    const live = this.catState?.liveMood;
    const mood = String(live || configured || "neutral");

    return this.getCatMoodNames().includes(mood) ? mood : "neutral";
  }

  getCatBehaviourIntent(input = {}) {
    /*
      Small shared behaviour intent layer.

      Mood should influence existing primitives instead of each subsystem
      inventing a separate switch. Values here are deliberately subtle and are
      consumed by locomotion pace, carried head posture, tail expression, and
      tiny idle motion.
    */

    const mood = String(input.mood || this.getCurrentCatMood());
    const intents = {
      neutral: {
        paceMultiplier: 1,
        headForwardBias: 0,
        headLiftBias: 0,
        headTiltBias: 0,
        tailTipFlickAmount: 0.25,
        tailTipCurlBias: 0,
        idleRestlessness: 0.35,
        lookAroundAmount: 0.25,
      },
      relaxed: {
        paceMultiplier: 0.72,
        headForwardBias: -0.8,
        headLiftBias: 1.4,
        headTiltBias: 2,
        tailTipFlickAmount: 0.12,
        tailTipCurlBias: -0.8,
        idleRestlessness: 0.16,
        lookAroundAmount: 0.12,
      },
      curious: {
        paceMultiplier: 1.06,
        headForwardBias: 1.3,
        headLiftBias: 0.3,
        headTiltBias: 4,
        tailTipFlickAmount: 0.55,
        tailTipCurlBias: 1.2,
        idleRestlessness: 0.52,
        lookAroundAmount: 0.65,
      },
      alert: {
        paceMultiplier: 1.22,
        headForwardBias: 1.8,
        headLiftBias: -1.1,
        headTiltBias: -2,
        tailTipFlickAmount: 0.4,
        tailTipCurlBias: 0.4,
        idleRestlessness: 0.42,
        lookAroundAmount: 0.38,
      },
      playful: {
        paceMultiplier: 1.34,
        headForwardBias: 1.2,
        headLiftBias: -0.4,
        headTiltBias: -5,
        tailTipFlickAmount: 0.9,
        tailTipCurlBias: 2.2,
        idleRestlessness: 0.82,
        lookAroundAmount: 0.75,
      },
    };

    const intent = this.isCatPoseOverrideActive()
      ? {
          ...intents.neutral,
          paceMultiplier: 0,
          tailTipFlickAmount: 0,
          idleRestlessness: 0,
          lookAroundAmount: 0,
        }
      : intents[mood] || intents.neutral;

    return {
      mood,
      ...intent,
    };
  }

  getCatMoodOffsets(input) {
    const mood = String(input.mood || this.getCurrentCatMood());
    if (this.isCatPoseOverrideActive()) {
      return {
        headForward: 0,
        headLift: 0,
        headTilt: 0,
        neckLift: 0,
        chestLift: 0,
        hipLift: 0,
        spineCurve: 0,
        tailLift: 0,
        tailCurve: 0,
        tailTipCurl: 0,
      };
    }

    const behaviourIntent = this.getCatBehaviourIntent({ mood });

    const moods = {
      neutral: {
        headForward: 0,
        headLift: 0,
        headTilt: 0,
        neckLift: 0,
        chestLift: 0,
        hipLift: 0,
        spineCurve: 0,
        tailLift: 0,
        tailCurve: 0,
        tailTipCurl: 0,
      },

      alert: {
        headForward: 1.5,
        headLift: -1,
        headTilt: -3,
        neckLift: 1,
        chestLift: 1,
        hipLift: 0,
        spineCurve: 0.5,
        tailLift: -2,
        tailCurve: -4,
        tailTipCurl: 1,
      },

      curious: {
        headForward: 2,
        headLift: 0,
        headTilt: 4,
        neckLift: 0,
        chestLift: 0,
        hipLift: 0,
        spineCurve: 0,
        tailLift: -1,
        tailCurve: -2,
        tailTipCurl: 2,
      },

      relaxed: {
        headForward: -1,
        headLift: 1,
        headTilt: 3,
        neckLift: -1,
        chestLift: -0.5,
        hipLift: -0.5,
        spineCurve: -0.5,
        tailLift: 2,
        tailCurve: 3,
        tailTipCurl: -1,
      },

      playful: {
        headForward: 2,
        headLift: -0.5,
        headTilt: -6,
        neckLift: 1,
        chestLift: -1,
        hipLift: 2,
        spineCurve: 2,
        tailLift: -4,
        tailCurve: -7,
        tailTipCurl: 4,
      },
    };

    const offsets = moods[mood] || moods.neutral;

    return {
      ...offsets,
      headForward: Number(offsets.headForward || 0) + behaviourIntent.headForwardBias,
      headLift: Number(offsets.headLift || 0) + behaviourIntent.headLiftBias,
      headTilt: Number(offsets.headTilt || 0) + behaviourIntent.headTiltBias,
    };
  }

  getCatMoodWeights(input = {}) {
    /*
      Shared mood-weight primitive.

      Today this mostly reflects the explicit cat_mood config. Later, world
      events, POIs, interaction sessions, or needs can add weights here without
      tail/ear/body systems each inventing their own mood switchboard.
    */

    const mood = String(input.mood || this.getCurrentCatMood());
    const weights = {
      neutral: 0,
      confident: 0,
      curious: 0,
      relaxed: 0,
      alert: 0,
      playful: 0,
      annoyed: 0,
      fearful: 0,
    };

    weights[mood] =
      Object.prototype.hasOwnProperty.call(weights, mood) ? 1 : 0;

    if (!weights[mood]) {
      weights.neutral = 1;
    }

    const session = this.catState?.interactionSession;
    if (session?.active) {
      weights.curious += 0.2;
      weights.alert += 0.12;
    }

    const total =
      Object.values(weights).reduce((sum, value) => sum + Math.max(0, value), 0) ||
      1;

    Object.keys(weights).forEach((key) => {
      weights[key] = Math.max(0, weights[key]) / total;
    });

    return weights;
  }

  getCatTailMoodProfiles() {
    /*
      Tail mood profiles are authored as local zones from the tail base:
      positive x means toward the cat's back, negative x means over/forward.
      negative y means up.
    */

    return {
      neutral: {
        back: 0.78,
        lift: -0.48,
        curl: 0.08,
        curve: 0.1,
        follow: 0.72,
        sway: 0.35,
        stiffness: 0.55,
      },
      confident: {
        back: 0.16,
        lift: -1.05,
        curl: 0.2,
        curve: 0.16,
        follow: 0.8,
        sway: 0.24,
        stiffness: 0.68,
      },
      curious: {
        back: 0.5,
        lift: -0.82,
        curl: 0.32,
        curve: 0.26,
        follow: 0.74,
        sway: 0.45,
        stiffness: 0.58,
      },
      relaxed: {
        back: 0.9,
        lift: -0.22,
        curl: -0.05,
        curve: 0.06,
        follow: 0.62,
        sway: 0.18,
        stiffness: 0.38,
      },
      alert: {
        back: 0.35,
        lift: -0.95,
        curl: 0.12,
        curve: 0.08,
        follow: 0.86,
        sway: 0.12,
        stiffness: 0.82,
      },
      playful: {
        back: 0.24,
        lift: -1.1,
        curl: 0.42,
        curve: 0.34,
        follow: 0.7,
        sway: 0.65,
        stiffness: 0.5,
      },
      annoyed: {
        back: 0.72,
        lift: -0.32,
        curl: -0.18,
        curve: -0.24,
        follow: 0.58,
        sway: 0.95,
        stiffness: 0.75,
      },
      fearful: {
        back: 0.34,
        lift: 0.1,
        curl: -0.35,
        curve: -0.28,
        follow: 0.9,
        sway: 0.04,
        stiffness: 0.9,
      },
    };
  }

  getCatTailMoodIntent({ input, anatomy, front, scale = 1 } = {}) {
    const weights = this.getCatMoodWeights(input);
    const profiles = this.getCatTailMoodProfiles();
    const bodyLength = Math.max(1, Number(anatomy?.body?.length || 1));
    const tailLength = Math.max(
      1,
      Number(anatomy?.body?.tailLength || anatomy?.tail?.length || bodyLength)
    );
    const blended = {
      back: 0,
      lift: 0,
      curl: 0,
      curve: 0,
      follow: 0,
      sway: 0,
      stiffness: 0,
    };

    Object.entries(weights).forEach(([name, weight]) => {
      const profile = profiles[name] || profiles.neutral;
      Object.keys(blended).forEach((key) => {
        blended[key] += Number(profile[key] || 0) * weight;
      });
    });

    const s = Number(scale) || 1;
    const back = -Number(front || -1);

    return {
      weights,
      localBack: blended.back * tailLength,
      localLift: blended.lift * tailLength,
      curl: blended.curl * tailLength,
      curve: blended.curve * bodyLength,
      follow: this.clamp(blended.follow, 0, 1),
      sway: blended.sway * Number(this.c.cat_tail_walk_sway ?? 3) * s,
      stiffness: this.clamp(blended.stiffness, 0, 1),
      backSign: back,
    };
  }

  getCatTailRuntimeState() {
    if (!this.catState) {
      this.catState = this.createInitialCatState();
    }

    if (!this.catState.tail) {
      this.catState.tail = {
        idealTip: null,
        smoothedTip: null,
        phase: 0,
        lastBase: null,
      };
    }

    return this.catState.tail;
  }

  resolveCatTailIntent({
    tailBase,
    spineVector,
    input,
    anatomy,
    front,
    scale = 1,
  } = {}) {
    const base = {
      x: Number(tailBase?.x || 0),
      y: Number(tailBase?.y || 0),
    };
    const intent = this.getCatTailMoodIntent({
      input,
      anatomy,
      front,
      scale,
    });
    const behaviourIntent = this.getCatBehaviourIntent(input);
    const back = intent.backSign;
    const s = Number(scale) || 1;
    const state = this.getCatTailRuntimeState();
    const gait = this.getCatGaitState();
    const baseMotion =
      state.lastBase && Number.isFinite(Number(state.lastBase.y))
        ? Number(base.y) - Number(state.lastBase.y)
        : 0;

    state.phase =
      Number(state.phase || 0) +
      (Number(gait.phaseAdvance || 0) > 0
        ? Number(gait.phaseAdvance || 0) * Math.PI * 2
        : 0.035);

    const walkSway =
      this.bool(this.c.cat_tail_mood_enabled) && Boolean(gait.clockMoving)
        ? Math.sin(state.phase) * intent.sway * (1 - intent.stiffness * 0.45)
        : 0;
    const idleFlick =
      !gait.clockMoving && this.bool(this.c.cat_idle_animation_enabled)
        ? Math.sin(
            performance.now() *
              Math.max(0.0001, Number(this.c.cat_idle_tail_flick_speed ?? 0.0009)) *
              this.lerp(0.6, 1.9, behaviourIntent.idleRestlessness)
          ) *
          Number(this.c.cat_idle_tail_flick_amount ?? 0.55) *
          behaviourIntent.tailTipFlickAmount *
          s
        : 0;
    const lagLift =
      -baseMotion *
      this.clamp(Number(this.c.cat_tail_motion_lag ?? 0.55), 0, 2);

    const spine = this.normaliseVector(
      spineVector || { x: back, y: 0 },
      { x: back, y: 0 }
    );
    const follow = intent.follow;
    const direction = this.normaliseVector(
      {
        x: this.lerp(back, spine.x, follow),
        y: this.lerp(0, spine.y, follow),
      },
      { x: back, y: 0 }
    );

    const idealTip = {
      x:
        base.x +
        direction.x * intent.localBack +
        front * (intent.curve + walkSway + idleFlick),
      y:
        base.y +
        direction.y * intent.localBack +
        intent.localLift +
        lagLift -
        Math.abs(idleFlick) * 0.25,
    };

    const override = this.getCatTargetOverride("tailTip");
    const targetTip = override
      ? {
          x: Number(override.x),
          y: Number(override.y),
        }
      : idealTip;

    const followSpeed = this.clamp(
      Number(this.c.cat_tail_follow_speed ?? 0.09) * this.lerp(0.7, 1.45, intent.stiffness),
      0.01,
      1
    );

    const previous = state.smoothedTip || targetTip;
    const smoothedTip = {
      x: this.lerp(previous.x, targetTip.x, followSpeed),
      y: this.lerp(previous.y, targetTip.y, followSpeed),
    };

    state.idealTip = idealTip;
    state.smoothedTip = smoothedTip;
    state.lastBase = base;
    state.intent = intent;

    return {
      ...intent,
      idealTip,
      targetTip,
      smoothedTip,
      followSpeed,
      walkSway,
      idleFlick,
      curl: Number(intent.curl || 0) + Number(behaviourIntent.tailTipCurlBias || 0) * s,
      baseMotion,
      override: Boolean(override),
    };
  }

  normaliseCatSegmentRatios(ratios) {
    const cleaned = (ratios || []).map((value) =>
      Math.max(0.01, Number(value) || 0.01)
    );

    const total = cleaned.reduce((sum, value) => sum + value, 0) || 1;

    return cleaned.map((value) => value / total);
  }

  solveTwoBoneIk({ root, target, lengthA, lengthB, bendHint }) {
    /*
      Generic 2-bone IK.

      Given:
        root -> joint -> target

      Solve:
        where joint must sit so that:
          root->joint length = lengthA
          joint->target length = lengthB

      bendHint chooses which side of the root-target line the joint prefers.
    */

    const a = {
      x: Number(root.x),
      y: Number(root.y),
    };

    const b = {
      x: Number(target.x),
      y: Number(target.y),
    };

    const rootToTarget = {
      x: b.x - a.x,
      y: b.y - a.y,
    };

    const rawDistance = Math.hypot(rootToTarget.x, rootToTarget.y);
    const distance = Math.max(0.001, rawDistance);

    const lenA = Math.max(0.001, Number(lengthA) || 0.001);
    const lenB = Math.max(0.001, Number(lengthB) || 0.001);

    /*
      If the target is unreachable, clamp the solve distance so the joint still
      lies on a plausible maximum-extension pose rather than exploding.
    */
    const maxReach = lenA + lenB - 0.001;
    const minReach = Math.abs(lenA - lenB) + 0.001;
    const solveDistance = this.clamp(distance, minReach, maxReach);

    const axis = this.normaliseVector(rootToTarget, { x: 0, y: 1 });

    /*
      Distance from root to the point along the root-target axis where the
      perpendicular joint offset is centred.
    */
    const along =
      (lenA * lenA - lenB * lenB + solveDistance * solveDistance) /
      (2 * solveDistance);

    const heightSquared = Math.max(0, lenA * lenA - along * along);
    const height = Math.sqrt(heightSquared);

    const base = {
      x: a.x + axis.x * along,
      y: a.y + axis.y * along,
    };

    let perpendicular = {
      x: -axis.y,
      y: axis.x,
    };

    const hint = this.normaliseVector(bendHint, perpendicular);
    const dot = perpendicular.x * hint.x + perpendicular.y * hint.y;

    if (dot < 0) {
      perpendicular = {
        x: -perpendicular.x,
        y: -perpendicular.y,
      };
    }

    const joint = {
      x: base.x + perpendicular.x * height,
      y: base.y + perpendicular.y * height,
    };

    return {
      joint,
      reachable: rawDistance <= maxReach && rawDistance >= minReach,
      distance: rawDistance,
      solveDistance,
    };
  }

  getCatTargetPlan({ cfg, input, anatomy }) {
    /*
      Target-led cat plan.

      This is the new top layer for the cat rig. It describes where the cat is
      trying to put important end-effectors before the body is solved.

      First-pass rules:
      - head target is a world-space skull centre
      - paw targets start as desired world-space floor/contact targets
      - paw X controls are interpreted from the cat anchor, not from the moving
        shoulder/hip roots
      - contact-aware resolution later decides whether each paw is planted,
        hanging, or landing

      Later this becomes the walking/reaching planner:
      planted -> unplanted -> seeking -> landing -> planted
    */

    const s = Number(cfg.scale) || 1;
    const front = this.getCatLocomotionFacingSign(cfg.frontSign);

    const configuredAnchor = {
      x: Number(input.anchor.x),
      y: Number(input.anchor.y),
    };

    const anchor = this.getCatLocomotionAnchor(configuredAnchor);

    const bodyLength = Number(anatomy?.body?.length || input.bodyLength * s || 1);
    const chestHeight = Number(input.chestHeight || 0) * s;
    const neckLength = Math.max(1, Number(anatomy?.head?.neckLength || 1));

    /*
      Autonomous carried-head posture.

      In auto-wander the locomotion anchor is the thing moving. The head should
      be carried by that body motion through an upright neck socket, not treated
      like a hard skull target that tows the shoulders forward. Pointer
      overrides still bypass this and stay strong/direct.
    */
    const estimatedChest = {
      x: anchor.x + front * bodyLength * 0.42,
      y: anchor.y - chestHeight,
    };
    const carriedSocket = {
      x:
        estimatedChest.x +
        front *
          neckLength *
          this.clamp(Number(this.c.cat_auto_head_carry_forward_ratio ?? 0.08), -1, 1),
      y:
        estimatedChest.y -
        neckLength *
          this.clamp(Number(this.c.cat_auto_head_carry_lift_ratio ?? 1.18), 0, 2),
    };
    const carriedSkull = this.getCatSkullFromNeckSocket({
      socket: carriedSocket,
      skullPrototype: {
        x: estimatedChest.x,
        y: estimatedChest.y,
        width: Number(anatomy?.head?.skullWidth || input.skullWidth || 1) * s,
        height: Number(anatomy?.head?.skullHeight || input.skullHeight || 1) * s,
        tilt: Number(input.headTilt || 0),
        roundness: Number(input.skullRoundness || 0),
      },
      cfg: {
        ...cfg,
        scale: s,
        frontSign: front,
      },
    });

    const defaultHeadTarget = {
      x: carriedSkull.x,
      y: carriedSkull.y,
      angle: Number(input.headTilt || 0),
      strength: 0.18,
      mode: "target",
      source: "carried_body",
      carriedSocket,
    };

    const headOverride =
      this.getCatTargetOverride("head") ||
      this.getCatTargetOverride("scruff");

    const headTarget = headOverride
      ? {
          ...defaultHeadTarget,
          x: Number(headOverride.x),
          y: Number(headOverride.y),
          strength: 1,
          source: "override",
        }
      : defaultHeadTarget;

    const makePawTarget = (localX, localY, name) => ({
      name,
      x: anchor.x + front * Number(localX || 0) * s,
      y: anchor.y + Number(localY || 0) * s,
      state: "planted",
    });

    return {
      anchor,
      configuredAnchor,
      frontSign: front,
      backSign: -front,
      head: headTarget,
      paws: {
        frontNear: makePawTarget(
          input.frontNearPawX,
          input.frontNearPawY,
          "frontNear"
        ),
        frontFar: makePawTarget(
          input.frontFarPawX,
          input.frontFarPawY,
          "frontFar"
        ),
        rearNear: makePawTarget(
          input.rearNearPawX,
          input.rearNearPawY,
          "rearNear"
        ),
        rearFar: makePawTarget(
          input.rearFarPawX,
          input.rearFarPawY,
          "rearFar"
        ),
      },
    };
  }

  averageCatPoints(points) {
    const safePoints = (points || []).filter(
      (point) =>
        point &&
        Number.isFinite(Number(point.x)) &&
        Number.isFinite(Number(point.y))
    );

    if (!safePoints.length) {
      return { x: 0, y: 0 };
    }

    return {
      x:
        safePoints.reduce((sum, point) => sum + Number(point.x), 0) /
        safePoints.length,
      y:
        safePoints.reduce((sum, point) => sum + Number(point.y), 0) /
        safePoints.length,
    };
  }

  createCatPawContactSlot(name = "paw") {
    return {
      name,
      state: "uninitialised",

      // The current real ground contact. While this exists and remains
      // reachable, the paw should grip it.
      plantedTarget: null,

      // The current intent target while unplanted/hanging/landing.
      // This may update every frame and is deliberately interruptible.
      activeTarget: null,

      // Explicit step lifecycle. This is the gait primitive:
      // planted -> stepping arc -> planted. It keeps animation separate from
      // landing-candidate choice so gait does not become prediction soup.
      step: null,

      // True once the original/base target has been used to seed the first
      // stance. After this, the base target should stop acting as home gravity.
      hasInitialised: false,
    };
  }

  getCatPawContactSlot(name = "paw") {
    if (!this.catState) {
      return null;
    }

    if (!this.catState.pawContact) {
      this.catState.pawContact = {};
    }

    if (!this.catState.pawContact[name]) {
      this.catState.pawContact[name] = this.createCatPawContactSlot(name);
    }

    return this.catState.pawContact[name];
  }

  getCatPawPlanningTarget(name, baseTarget) {
    /*
      Planning target used by the body-root estimate.

      This is what stops the original/config paw points pulling the cat forever.

      Priority:
      1. plantedTarget: the real gripped floor contact
      2. activeTarget: the latest seeking/hanging/landing target
      3. baseTarget: only before the paw has ever been initialised
    */

    const safeBase = {
      x: Number(baseTarget?.x || 0),
      y: Number(baseTarget?.y || 0),
      state: baseTarget?.state || "base",
      source: "base",
    };

    if (!this.bool(this.c.cat_paw_contact_memory_enabled)) {
      return safeBase;
    }

    const slot = this.getCatPawContactSlot(name);

    if (slot?.plantedTarget) {
      return {
        ...slot.plantedTarget,
        name,
        state: "planted",
        source: "plantedMemory",
      };
    }

    if (slot?.activeTarget) {
      return {
        ...slot.activeTarget,
        name,
        state: slot.state || "active",
        source: "activeMemory",
      };
    }

    return safeBase;
  }

  approachPoint(current, target, maxStep = 1) {
    /*
      Generic point motion primitive.

      This intentionally has no cat-specific knowledge. It is the smallest
      reusable building block for "move an intent/target towards another point
      without teleporting", and can later serve hands, heads, POIs, or other
      animated end-effectors.
    */

    const from = {
      x: Number(current?.x ?? target?.x ?? 0),
      y: Number(current?.y ?? target?.y ?? 0),
    };

    const to = {
      x: Number(target?.x ?? from.x),
      y: Number(target?.y ?? from.y),
    };

    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.hypot(dx, dy);
    const step = Math.max(0, Number(maxStep) || 0);

    if (distance <= 0.001 || distance <= step) {
      return {
        x: to.x,
        y: to.y,
        complete: true,
        distance,
      };
    }

    return {
      x: from.x + (dx / distance) * step,
      y: from.y + (dy / distance) * step,
      complete: false,
      distance,
    };
  }

  updateCatPawContactSlot(name, patch = {}) {
    if (!this.bool(this.c.cat_paw_contact_memory_enabled)) {
      return null;
    }

    const slot = this.getCatPawContactSlot(name);
    if (!slot) return null;

    Object.assign(slot, patch);
    return slot;
  }

  getCatGaitState() {
    if (!this.catState) {
      this.catState = this.createInitialCatState();
    }

    if (!this.catState.gait) {
      this.catState.gait = {
        frame: 0,
        phase: 0,
        clockPaw: null,
        clockMoving: false,
        clockSpeed: 0,
        clockRoot: null,
        lastReleasedPaw: null,
        lastReleasedFrame: -9999,
        releaseCooldown: 0,
        releaseSequence: ["rearNear", "frontNear", "rearFar", "frontFar"],
        lastReleasePlan: null,
      };
    }

    const gait = this.catState.gait;
    if (!Number.isFinite(Number(gait.phase))) gait.phase = 0;
    if (!Object.prototype.hasOwnProperty.call(gait, "clockPaw")) {
      gait.clockPaw = null;
    }
    if (!Object.prototype.hasOwnProperty.call(gait, "clockMoving")) {
      gait.clockMoving = false;
    }
    if (!Number.isFinite(Number(gait.clockSpeed))) gait.clockSpeed = 0;
    if (!Number.isFinite(Number(gait.phaseAdvance))) gait.phaseAdvance = 0;
    if (!Object.prototype.hasOwnProperty.call(gait, "clockRoot")) {
      gait.clockRoot = null;
    }

    return this.catState.gait;
  }

  getCatGaitClockSequence() {
    /*
      Lateral-sequence walking clock.

      The clock owns timing only: rear paw, same-side front paw, other rear,
      other front. Contact memory still owns grounding and the limb solver
      still owns anatomy.
    */

    if (this.isCatDirectRegisterModel()) {
      return [
        { name: "frontNear", phase: 0 },
        { name: "rearNear", phase: 0.25 },
        { name: "frontFar", phase: 0.5 },
        { name: "rearFar", phase: 0.75 },
      ];
    }

    return [
      { name: "rearNear", phase: 0 },
      { name: "frontNear", phase: 0.25 },
      { name: "rearFar", phase: 0.5 },
      { name: "frontFar", phase: 0.75 },
    ];
  }

  getCircularPhaseDistance(a, b) {
    const phaseA = ((Number(a) || 0) % 1 + 1) % 1;
    const phaseB = ((Number(b) || 0) % 1 + 1) % 1;
    const delta = Math.abs(phaseA - phaseB);

    return Math.min(delta, 1 - delta);
  }

  updateCatGaitClock({
    shoulderJoint,
    hipJoint,
    front = 1,
    scale = 1,
  } = {}) {
    const gait = this.getCatGaitState();

    if (!this.bool(this.c.cat_gait_clock_enabled)) {
      gait.clockPaw = null;
      gait.clockMoving = false;
      return gait;
    }

    const root = this.averageCatPoints([shoulderJoint, hipJoint]);
    const previousRoot = gait.clockRoot;
    const dx =
      previousRoot && Number.isFinite(Number(previousRoot.x))
        ? Number(root.x) - Number(previousRoot.x)
        : 0;
    const dy =
      previousRoot && Number.isFinite(Number(previousRoot.y))
        ? Number(root.y) - Number(previousRoot.y)
        : 0;
    const distance = Math.hypot(dx, dy);
    const s = Math.max(0.1, Number(scale) || 1);
    const strideLength = Math.max(
      6 * s,
      Number(this.getCatRuntimeConfigValue("cat_gait_stride_length", 42)) * s
    );
    const cycleFrames = Math.max(
      20,
      Number(this.getCatRuntimeConfigValue("cat_gait_cycle_frames", 76))
    );
    const moving = distance > 0.015 * s;
    const baseFrameAdvance = moving ? 1 / cycleFrames : 0;
    const expectedDistancePerFrame = strideLength / cycleFrames;
    const speedStrideRatio =
      moving && expectedDistancePerFrame > 0
        ? this.clamp(distance / expectedDistancePerFrame, 0.08, 1.35)
        : 0;
    const frameAdvance = baseFrameAdvance * speedStrideRatio;
    const distanceAdvance = moving ? distance / strideLength : 0;

    /*
      Keep the old clock structure, but soften its frame floor using the
      speed/stride ratio. If the body only covers a small fraction of the
      configured stride-per-frame, cadence drops instead of forcing fast feet.
    */
    const advance = moving ? Math.max(frameAdvance, distanceAdvance) : 0;
    gait.phase = ((Number(gait.phase || 0) + advance) % 1 + 1) % 1;
    gait.phaseAdvance = advance;
    gait.clockRoot = root;
    gait.clockSpeed = distance;
    gait.clockMoving = moving;
    gait.clockStrideLength = strideLength;
    gait.configuredStrideLength = strideLength;
    gait.speedStrideRatio = speedStrideRatio;
    gait.clockTravelSign =
      Math.abs(dx) > 0.001
        ? dx >= 0
          ? 1
          : -1
        : Number(front || 1);

    const swingRatio = this.clamp(
      Number(this.getCatRuntimeConfigValue("cat_gait_swing_ratio", 0.24)),
      0.08,
      0.45
    );
    const halfWindow = swingRatio / 2;
    const sequence = this.getCatGaitClockSequence();
    const clockCandidate = sequence
      .map((entry) => ({
        ...entry,
        distance: this.getCircularPhaseDistance(gait.phase, entry.phase),
      }))
      .sort((a, b) => a.distance - b.distance)[0];

    gait.clockPaw =
      moving && clockCandidate && clockCandidate.distance <= halfWindow
        ? clockCandidate.name
        : null;

    return gait;
  }

  getCatStepDurationFrames({ distance = 0, scale = 1 } = {}) {
    /*
      Gait-normalized step timing.

      Step duration should come from the shared gait clock, not from front/rear
      limb reach. That keeps rear and front paws moving through their swing at
      the same temporal pace while still adapting when the whole body speeds up.
    */

    const gait = this.getCatGaitState();
    const cycleFrames = Math.max(
      20,
      Number(this.getCatRuntimeConfigValue("cat_gait_cycle_frames", 76))
    );
    const swingRatio = this.clamp(
      Number(this.getCatRuntimeConfigValue("cat_gait_swing_ratio", 0.24)),
      0.08,
      0.45
    );
    const phaseAdvance = Math.max(
      Number(gait.phaseAdvance || 0),
      1 / cycleFrames
    );
    const baseDuration = swingRatio / phaseAdvance;

    const s = Math.max(0.1, Number(scale) || 1);
    const strideLength = Math.max(
      6 * s,
      Number(this.getCatRuntimeConfigValue("cat_gait_stride_length", 42)) * s
    );
    const strideRatio = this.clamp(Number(distance || 0) / strideLength, 0, 1.5);

    /*
      Distance can stretch the swing a little, but it should not let a short
      rear step zip ahead of the front paws.
    */
    const distanceScale = this.clamp(0.95 + strideRatio * 0.22, 0.95, 1.28);

    const rawDuration = Math.max(
      8,
      Math.min(24, Math.round(baseDuration * distanceScale))
    );
    const durationScale = this.clamp(
      Number(this.getCatRuntimeConfigValue("cat_gait_swing_duration_scale", 1)),
      0.5,
      2
    );

    return Math.max(8, Math.min(40, Math.round(rawDuration * durationScale)));
  }

  getCatActiveStepPaw() {
    const pawContact = this.catState?.pawContact || {};

    return ["frontNear", "frontFar", "rearNear", "rearFar"].find(
      (name) => pawContact[name]?.step
    ) || null;
  }

  tickCatGaitState() {
    const gait = this.getCatGaitState();

    gait.frame = Number(gait.frame || 0) + 1;
    gait.releaseCooldown = Math.max(
      0,
      Number(gait.releaseCooldown || 0) - 1
    );

    return gait;
  }

  startCatPawStep({
    name,
    from,
    to,
    root,
    reach,
    floorY,
    scale = 1,
  } = {}) {
    const slot = this.getCatPawContactSlot(name);
    if (!slot || !from || !to) return null;

    const gait = this.getCatGaitState();
    const maxReach = Math.max(1, Number(reach?.maxReach || 1));
    const distance = this.distanceBetweenPoints(from, to);
    const durationFrames = this.getCatStepDurationFrames({
      distance,
      scale,
    });

    const step = {
      name,
      from: {
        x: Number(from.x),
        y: Number(from.y),
      },
      to: {
        x: Number(to.x),
        y: Number(to.y),
      },
      rootX: Number(root?.x || 0),
      rootY: Number(root?.y || 0),
      floorY: Number.isFinite(Number(floorY)) ? Number(floorY) : Number(to.y),
      startedFrame: Number(gait.frame || 0),
      durationFrames,
      lift: Math.max(
        2 * Math.max(0.1, Number(scale) || 1),
        Math.min(
          12 * Math.max(0.1, Number(scale) || 1),
          maxReach * this.clamp(
            Number(this.getCatRuntimeConfigValue("cat_gait_swing_lift_ratio", 0.18)),
            0.08,
            0.5
          )
        )
      ),
    };

    slot.step = step;
    slot.state = "stepping";
    slot.plantedTarget = null;
    slot.activeTarget = {
      ...step.from,
      rootX: step.rootX,
      rootY: step.rootY,
    };

    this.noteCatPawReleased(name);

    return step;
  }

  sampleCatPawStep(name, { commitContactMemory = true } = {}) {
    const slot = this.getCatPawContactSlot(name);
    const step = slot?.step;
    if (!slot || !step) return null;

    const gait = this.getCatGaitState();
    const elapsed = Math.max(0, Number(gait.frame || 0) - Number(step.startedFrame || 0));
    const duration = Math.max(1, Number(step.durationFrames || 1));
    const rawProgress = this.clamp(elapsed / duration, 0, 1);
    const t = this.smoothstep(rawProgress);
    const lift = Math.max(0, Number(step.lift || 0));
    const arc = Math.sin(Math.PI * t) * lift;

    const point = {
      x: this.lerp(Number(step.from.x), Number(step.to.x), t),
      y: this.lerp(Number(step.from.y), Number(step.to.y), t) - arc,
    };

    const complete = rawProgress >= 1;

    if (commitContactMemory) {
      const activeTarget = {
        x: point.x,
        y: point.y,
        rootX: Number(step.rootX || 0),
        rootY: Number(step.rootY || 0),
      };

      slot.activeTarget = activeTarget;

      if (complete) {
        const plantedTarget = {
          x: Number(step.to.x),
          y: Number(step.floorY),
          rootX: Number(step.rootX || 0),
          rootY: Number(step.rootY || 0),
        };

        slot.step = null;
        slot.state = "planted";
        slot.plantedTarget = plantedTarget;
        slot.activeTarget = plantedTarget;
        this.noteCatPawLanding(name, plantedTarget);
      }
    }

    return {
      name,
      x: complete ? Number(step.to.x) : point.x,
      y: complete ? Number(step.floorY) : point.y,
      state: complete ? "planted" : "stepping",
      targetX: Number(step.to.x),
      targetY: Number(step.to.y),
      plantedX: complete ? Number(step.to.x) : undefined,
      plantedY: complete ? Number(step.floorY) : undefined,
      floorY: Number(step.floorY),
      contactSource: complete ? "stepComplete" : "stepArc",
      stepProgress: rawProgress,
      stepDurationFrames: duration,
      stepLift: lift,
    };
  }

  noteCatPawReleased(name) {
    if (!name) return;

    const gait = this.getCatGaitState();

    gait.lastReleasedPaw = name;
    gait.lastReleasedFrame = Number(gait.frame || 0);
    gait.releaseCooldown = Math.max(
      0,
      Number(this.getCatRuntimeConfigValue("cat_gait_release_cooldown_frames", 3))
    );
  }

  getCatPawReleaseSequence() {
    /*
      First walking-ish sequence.

      This is a simple lateral-sequence-inspired order:
        rear paw, same-side front paw, other rear paw, other front paw.

      It is not yet a full gait engine. It simply gives the release arbitration
      a stable preference so the cat does not move all paws at once.
    */

    const gait = this.getCatGaitState();

    if (this.isCatDirectRegisterModel()) {
      return ["frontNear", "rearNear", "frontFar", "rearFar"];
    }

    return Array.isArray(gait.releaseSequence) && gait.releaseSequence.length
      ? gait.releaseSequence
      : ["rearNear", "frontNear", "rearFar", "frontFar"];
  }

  getCatNextPreferredReleasePaw() {
    const sequence = this.getCatPawReleaseSequence();
    const gait = this.getCatGaitState();

    const lastIndex = sequence.indexOf(gait.lastReleasedPaw);

    if (lastIndex < 0) {
      return sequence[0];
    }

    return sequence[(lastIndex + 1) % sequence.length];
  }

  getCatReleaseRootForPaw(name, { shoulderJoint, hipJoint } = {}) {
    return String(name || "").startsWith("front") ? shoulderJoint : hipJoint;
  }

  getCatReleaseReachForPaw(name, { frontReach, rearReach } = {}) {
    return String(name || "").startsWith("front") ? frontReach : rearReach;
  }

  buildCatPawReleasePlan({
    shoulderJoint,
    hipJoint,
    frontReach,
    rearReach,
    floorY,
    front = null,
    scale = 1,
  } = {}) {
    /*
      Gait/release arbitration.

      Contact memory decides whether a planted paw is stretched.
      This planner decides which stretched paw is allowed to let go.

      Rules for now:
      - prefer one intentional release at a time
      - prefer the next paw in a simple rear/front/rear/front sequence
      - still allow forced release if a paw becomes dangerously stretched
      - preliminary solver passes can read this plan without mutating state
    */

    const pawNames = ["frontNear", "frontFar", "rearNear", "rearFar"];
    const enabled = this.bool(this.c.cat_gait_release_arbitration_enabled);
    const memoryEnabled = this.bool(this.c.cat_paw_contact_memory_enabled);

    const emptyPlan = {
      enabled,
      allowedPaws: pawNames,
      preferredPaw: null,
      candidates: [],
      forcedCandidates: [],
      heldPaws: [],
      reason: enabled ? "no_candidates" : "disabled",
    };

    const poseEditingOrPose =
      this.bool(this.catState?.poseEditing) ||
      String(this.getCurrentCatPose?.() || this.c.cat_pose || "stand") !== "stand";
    
    const movementTest = this.getCatMovementTestState?.();
    const autoWander = this.getCatAutoWanderState?.();
    const interactionActive = this.bool(this.catState?.interactionSession?.active);
    
    const trueLocomotion =
      !poseEditingOrPose &&
      (
        interactionActive ||
        this.bool(movementTest?.continuousWalk) ||
        (
          this.getCatAutoWanderEnabled?.() &&
          !this.bool(movementTest?.paused) &&
          Boolean(autoWander?.active) &&
          Boolean(autoWander?.target)
        )
      );
    
    if (!trueLocomotion) {
      return {
        ...emptyPlan,
        enabled: false,
        allowedPaws: [],
        preferredPaw: null,
        candidates: [],
        forcedCandidates: [],
        heldPaws: pawNames,
        reason: "idle_pose_gait_disabled",
      };
    }

    if (!enabled || !memoryEnabled) {
      return {
        ...emptyPlan,
        enabled: false,
        reason: "disabled",
      };
    }

    const forceReleaseRatio = this.clamp(
      Number(this.getCatRuntimeConfigValue("cat_gait_force_release_ratio", 1)),
      0.8,
      2
    );
    const gait = this.updateCatGaitClock({
      shoulderJoint,
      hipJoint,
      front:
        front === 1 || front === -1
          ? front
          : this.getCatLocomotionFacingSign(this.getCatFacingSign()),
      scale,
    });

    const candidates = [];

    pawNames.forEach((name) => {
      const slot = this.getCatPawContactSlot(name);
      const plantedTarget = slot?.plantedTarget;

      if (!plantedTarget) return;

      const root = this.getCatReleaseRootForPaw(name, {
        shoulderJoint,
        hipJoint,
      });

      const reach = this.getCatReleaseReachForPaw(name, {
        frontReach,
        rearReach,
      });

      if (!root || !reach) return;

      const maxReach = Math.max(0.001, Number(reach.maxReach || 0.001));
      const unplantRatio = this.clamp(
        Number(this.getCatRuntimeConfigValue("cat_paw_unplant_ratio", 0.8)),
        0.2,
        1.5
      );

      const maxPlantedReach = maxReach * unplantRatio;
      const forcedReleaseDistance = maxReach * forceReleaseRatio;

      const dx = Number(plantedTarget.x || 0) - Number(root.x || 0);
      const dy = Number(plantedTarget.y || 0) - Number(root.y || 0);
      const distance = Math.hypot(dx, dy);
      const facingSign =
        front === 1 || front === -1
          ? front
          : this.getCatLocomotionFacingSign(this.getCatFacingSign());
      const localXFromRoot = dx * facingSign;
      const isFrontPaw = String(name || "").startsWith("front");
      const trailingLimit = maxReach * (isFrontPaw ? -0.34 : -0.16);
      const forwardLimit = maxReach * (isFrontPaw ? 0.58 : 0.44);
      const trailingError = Math.max(0, trailingLimit - localXFromRoot);
      const forwardError = Math.max(0, localXFromRoot - forwardLimit);
      const supportError = Math.max(trailingError, forwardError);
      const supportPoor = supportError > maxReach * 0.08;

      const isOverstretched = distance > maxPlantedReach;
      const isForced = distance > forcedReleaseDistance;
      const clockRequested =
        this.bool(this.c.cat_gait_clock_enabled) &&
        gait.clockMoving &&
        gait.clockPaw === name &&
        distance > maxReach * 0.32;

      if (!isOverstretched && !supportPoor && !clockRequested) return;

      candidates.push({
        name,
        distance,
        maxReach,
        maxPlantedReach,
        forcedReleaseDistance,
        overreach: distance - maxPlantedReach,
        localXFromRoot,
        trailingLimit,
        forwardLimit,
        supportError,
        supportPoor,
        clockRequested,
        gaitPhase: Number(gait.phase || 0),
        gaitClockPaw: gait.clockPaw || null,
        urgency:
          Math.max(0, distance - maxPlantedReach) / maxReach +
          supportError / maxReach +
          (clockRequested ? 0.25 : 0),
        forced: isForced,
        root,
        plantedTarget,
      });
    });

    if (!candidates.length) {
      return {
        ...emptyPlan,
        allowedPaws: [],
        candidates,
        reason: "no_candidates",
      };
    }

    const lastReleasedPaw = gait.lastReleasedPaw || null;
    const nonRepeatCandidates = candidates.filter(
      (candidate) => candidate.name !== lastReleasedPaw
    );
    const selectableCandidates = nonRepeatCandidates.length
      ? nonRepeatCandidates
      : candidates.filter((candidate) => candidate.forced);
    const repeatHeldPaws = candidates
      .filter(
        (candidate) =>
          candidate.name === lastReleasedPaw &&
          !selectableCandidates.some((selectable) => selectable.name === candidate.name)
      )
      .map((candidate) => candidate.name);

    const forcedCandidates = selectableCandidates.filter((candidate) => candidate.forced);

    if (forcedCandidates.length) {
      return {
        enabled,
        allowedPaws: forcedCandidates.map((candidate) => candidate.name),
        preferredPaw: forcedCandidates[0]?.name || null,
        candidates,
        forcedCandidates,
        heldPaws: candidates
          .filter(
            (candidate) =>
              !forcedCandidates.some((forced) => forced.name === candidate.name)
          )
          .map((candidate) => candidate.name),
        reason: "forced",
      };
    }

    if (!selectableCandidates.length) {
      return {
        enabled,
        allowedPaws: [],
        preferredPaw: this.getCatNextPreferredReleasePaw(),
        candidates,
        forcedCandidates: [],
        heldPaws: candidates.map((candidate) => candidate.name),
        repeatHeldPaws,
        gaitPhase: Number(gait.phase || 0),
        gaitClockPaw: gait.clockPaw || null,
        reason: "repeat_hold",
      };
    }

    const activeStepPaw = this.getCatActiveStepPaw();

    if (activeStepPaw) {
      return {
        enabled,
        allowedPaws: [],
        preferredPaw: this.getCatNextPreferredReleasePaw(),
        candidates,
        forcedCandidates: [],
        heldPaws: candidates.map((candidate) => candidate.name),
        activeStepPaw,
        reason: "step_active",
      };
    }

    const preferredNext = this.getCatNextPreferredReleasePaw();
    const clockCandidate = this.bool(this.c.cat_gait_clock_enabled)
      ? selectableCandidates.find((candidate) => candidate.clockRequested)
      : null;

    /*
      If the walking clock has opened a swing window, prefer that paw. The
      older sequence fallback remains for extreme/off-clock cases, but normal
      walking should be paced by phase instead of whichever paw first becomes
      a little stretched.
    */
    let selected = null;

    const preferredCandidate = selectableCandidates.find(
      (candidate) => candidate.name === preferredNext
    );

    if (clockCandidate && Number(gait.releaseCooldown || 0) <= 0) {
      selected = clockCandidate;
    } else if (
      preferredCandidate &&
      (Number(gait.releaseCooldown || 0) <= 0 ||
        Number(preferredCandidate.urgency || 0) > 0.34)
    ) {
      selected = preferredCandidate;
    } else if (Number(gait.releaseCooldown || 0) <= 0) {
      /*
        No preferred candidate is currently stretched. Hold the rhythm unless
        another paw is genuinely urgent. This prevents the release plan from
        skipping front paws and producing rear/rear "rabbit hop" steps.
      */
      const urgentFallback = [...candidates]
        .filter((candidate) =>
          selectableCandidates.some((selectable) => selectable.name === candidate.name)
        )
        .filter((candidate) => Number(candidate.urgency || 0) > 0.42)
        .sort((a, b) => b.urgency - a.urgency)[0];

      selected = urgentFallback || null;
    }

    if (!selected) {
      return {
        enabled,
        allowedPaws: [],
        preferredPaw: gait.clockPaw || preferredNext,
        candidates,
        forcedCandidates: [],
        heldPaws: candidates.map((candidate) => candidate.name),
        repeatHeldPaws,
        gaitPhase: Number(gait.phase || 0),
        gaitClockPaw: gait.clockPaw || null,
        reason: clockCandidate
          ? "clock_cooldown_hold"
          : preferredCandidate
            ? "cooldown_hold"
            : "sequence_hold",
      };
    }

    const maxReleased = Math.max(
      1,
      Math.floor(Number(this.c.cat_gait_max_released_paws ?? 1))
    );

    const allowedPaws = [selected.name];

    if (maxReleased > 1) {
      const extras = candidates
        .filter((candidate) => candidate.name !== selected.name)
        .sort((a, b) => b.urgency - a.urgency)
        .slice(0, maxReleased - 1)
        .map((candidate) => candidate.name);

      allowedPaws.push(...extras);
    }

    return {
      enabled,
      allowedPaws,
      preferredPaw: selected.name,
      candidates,
      forcedCandidates: [],
      heldPaws: candidates
        .filter((candidate) => !allowedPaws.includes(candidate.name))
        .map((candidate) => candidate.name),
      repeatHeldPaws,
      gaitPhase: Number(gait.phase || 0),
      gaitClockPaw: gait.clockPaw || null,
      reason: selected.clockRequested ? "clock_selected" : "selected",
    };
  }

  getCatDesiredPawTargets({
    shoulderJoint,
    hipJoint,
    anchor,
    input,
    front,
    scale,
  }) {
    /*
      Converts V2 local paw controls into world-space desired paw targets.

      Important:
      - These are desired targets, not necessarily final reachable paw positions.
      - Later body candidate solving will keep these desired world targets fixed
        while trying alternative chest/hip/spine positions.
    */

    const s = Number(scale) || 1;

    return {
      desiredFrontPawNear: {
        x: shoulderJoint.x + front * Number(input.frontNearPawX || 0) * s,
        y: anchor.y + Number(input.frontNearPawY || 0) * s,
      },

      desiredFrontPawFar: {
        x: shoulderJoint.x + front * Number(input.frontFarPawX || 0) * s,
        y: anchor.y + Number(input.frontFarPawY || 0) * s,
      },

      desiredRearPawNear: {
        x: hipJoint.x + front * Number(input.rearNearPawX || 0) * s,
        y: anchor.y + Number(input.rearNearPawY || 0) * s,
      },

      desiredRearPawFar: {
        x: hipJoint.x + front * Number(input.rearFarPawX || 0) * s,
        y: anchor.y + Number(input.rearFarPawY || 0) * s,
      },
    };
  }

  getCatSupportGroupAverage(names = []) {
    const points = (names || [])
      .map((name) => {
        const slot = this.getCatPawContactSlot(name);
        return slot?.plantedTarget || slot?.activeTarget || null;
      })
      .filter(Boolean);

    return points.length ? this.averageCatPoints(points) : null;
  }

  getCatLandingSupportSeparationAdjustment({
    name = "paw",
    target,
    front = 1,
    bodyLength = 1,
  } = {}) {
    /*
      Support-base landing preference.

      This does not move planted paws and it does not impose a visual paw gap.
      It only nudges the landing target for the paw that is already stepping if
      the front and rear support groups are collapsing into the same body patch.
    */

    const isFrontPaw = String(name || "").startsWith("front");
    const oppositeAverage = isFrontPaw
      ? this.getCatSupportGroupAverage(["rearNear", "rearFar"])
      : this.getCatSupportGroupAverage(["frontNear", "frontFar"]);

    if (!target || !oppositeAverage) {
      return {
        x: Number(target?.x || 0),
        y: Number(target?.y || 0),
        adjustment: 0,
        separation: null,
        minSeparation: null,
      };
    }

    const safeFront = front === 1 || front === -1 ? front : 1;
    const safeBodyLength = Math.max(1, Number(bodyLength || 1));
    const minSeparation =
      safeBodyLength *
      this.clamp(
        Number(this.c.cat_paw_support_min_body_separation_ratio ?? 0.36),
        0.1,
        0.9
      );

    const separation = isFrontPaw
      ? (Number(target.x) - Number(oppositeAverage.x)) * safeFront
      : (Number(oppositeAverage.x) - Number(target.x)) * safeFront;
    const deficit = Math.max(0, minSeparation - separation);
    const adjustment = deficit * 0.45;
    const direction = isFrontPaw ? safeFront : -safeFront;

    return {
      x: Number(target.x) + direction * adjustment,
      y: Number(target.y),
      adjustment,
      separation,
      minSeparation,
      oppositeX: Number(oppositeAverage.x),
      oppositeY: Number(oppositeAverage.y),
    };
  }

  getCatFreshLandingPawTarget({
    name = "paw",
    desiredPaw,
    root,
    reach = null,
    front,
    floorY,
    scale = 1,
    bodyLength = 1,
  } = {}) {
    /*
      Fresh active landing target.

      This does not mutate the base desired paw target and it does not commit a
      new planted target. It simply chooses the best active target for this
      frame.

      That makes it interruptible:
      if the cat/body/head changes direction, the paw can revise this target on
      the next frame instead of being locked into an old step path.
    */

    const s = Number(scale) || 1;

    const safeRoot = {
      x: Number(root?.x || 0),
      y: Number(root?.y || 0),
    };

    const safeDesired = {
      x: Number(desiredPaw?.x || safeRoot.x),
      y: Number(desiredPaw?.y || floorY || safeRoot.y),
    };

    const safeFloorY = Number.isFinite(Number(floorY))
      ? Number(floorY)
      : safeDesired.y;

    const isFrontPaw = String(name || "").startsWith("front");
    const isNearPaw = String(name || "").includes("Near");
    const slot = this.getCatPawContactSlot(name);
    const previousTarget = slot?.activeTarget || slot?.plantedTarget || null;
    const maxReach = Math.max(1, Number(reach?.maxReach || 1));
    const rootVelocityX =
      previousTarget && Number.isFinite(Number(previousTarget.rootX))
        ? safeRoot.x - Number(previousTarget.rootX)
        : 0;
    const travelSign =
      Math.abs(rootVelocityX) > 0.05
        ? rootVelocityX >= 0
          ? 1
          : -1
        : Number(front || 1);

    const generalBias =
      Number(this.c.cat_paw_landing_root_x_bias || 0) * s;

    const limbBias =
      Number(
        isFrontPaw
          ? this.c.cat_front_paw_landing_forward_bias ?? 2.5
          : this.c.cat_rear_paw_landing_forward_bias ?? -2
      ) * s;

    /*
      Landing is a support candidate, not just a decorative foot pose.

      Front paws can reach a little into travel. Rear paws need enough forward
      sweep to pass their previous contact, so they can push the body instead
      of just catching up behind the hip.
    */
    const supportBias = isFrontPaw
      ? travelSign * 1.2 * s
      : travelSign * maxReach * 0.28;

    const laneBias = (isNearPaw ? -1 : 1) * (isFrontPaw ? 1.1 : 1.6) * s;

    const freshTarget = {
      x:
        safeRoot.x +
        Number(front || 1) * (generalBias + limbBias) +
        supportBias +
        laneBias,
      y: safeFloorY,
    };

    const keepOldBias = this.clamp(
      Number(this.c.cat_paw_landing_keep_old_target_bias ?? 0.15),
      0,
      1
    );

    const blendedTarget = {
      x: this.lerp(freshTarget.x, safeDesired.x, keepOldBias),
      y: safeFloorY,
    };

    /*
      Minimum useful stride.

      Once a paw has been selected to step, landing almost on top of its old
      contact reads like jitter rather than gait. Keep this as a candidate
      preference: the step lifecycle still owns the animation, while landing
      selection makes the step worth taking.
    */
    const previousX = Number(previousTarget?.x);
    const minUsefulStride = maxReach * (isFrontPaw ? 0.22 : 0.34);
    const strideInTravelDirection = Number.isFinite(previousX)
      ? (blendedTarget.x - previousX) * travelSign
      : minUsefulStride;
    const strideBoost = Math.max(0, minUsefulStride - strideInTravelDirection);

    const strideTarget = {
      x: blendedTarget.x + travelSign * strideBoost,
      y: blendedTarget.y,
    };

    /*
      Feline V1: direct register.

      In a quiet cat walk, the hind paw commonly lands into the print left by
      the same-side forepaw. This candidate deliberately makes that relation a
      first-class target rather than hoping independent landing biases happen
      to converge. OG retains the existing independent landing behaviour.
    */
    if (this.isCatDirectRegisterModel() && !isFrontPaw) {
      const matchingFront = isNearPaw ? "frontNear" : "frontFar";
      const print = this.getCatDirectRegisterState().frontPrints?.[matchingFront]?.at?.(-1);
      if (print) {
        const registerOffset = Number(this.c.cat_direct_register_offset ?? 0) * s;
        return {
          x: Number(print.x) + Number(front || 1) * registerOffset,
          y: safeFloorY,
          freshX: Number(print.x),
          freshY: safeFloorY,
          oldX: safeDesired.x,
          oldY: safeDesired.y,
          keepOldBias: 0,
          minUsefulStride: 0,
          strideInTravelDirection: 0,
          strideBoost: 0,
          supportSeparation: null,
          supportMinSeparation: null,
          supportSeparationAdjustment: 0,
          rootX: safeRoot.x,
          rootY: safeRoot.y,
          rootVelocityX,
          travelSign,
          supportBias: 0,
          laneBias: 0,
          directRegister: true,
          registerFront: matchingFront,
          registerPrintX: Number(print.x),
          registerPrintY: Number(print.y),
        };
      }
    }
    const supportAdjustedTarget = this.getCatLandingSupportSeparationAdjustment({
      name,
      target: strideTarget,
      front,
      bodyLength,
    });

    return {
      x: supportAdjustedTarget.x,
      y: supportAdjustedTarget.y,
      freshX: freshTarget.x,
      freshY: freshTarget.y,
      oldX: safeDesired.x,
      oldY: safeDesired.y,
      keepOldBias,
      minUsefulStride,
      strideInTravelDirection,
      strideBoost,
      supportSeparation: supportAdjustedTarget.separation,
      supportMinSeparation: supportAdjustedTarget.minSeparation,
      supportSeparationAdjustment: supportAdjustedTarget.adjustment,
      rootX: safeRoot.x,
      rootY: safeRoot.y,
      rootVelocityX,
      travelSign,
      supportBias,
      laneBias,
    };
  }


  resolveCatContactAwarePawTarget({
    name = "paw",
    desiredPaw,
    root,
    reach,
    floorY,
    front = 1,
    scale = 1,
    commitContactMemory = true,
    releaseAllowed = true,
    releaseRequested = false,
    forceReleaseRatio = null,
    bodyLength = 1,
  }) {
    /*
      Contact-aware paw target resolution with persistent ground contact.

      Layer meanings:
      - desiredX/Y = current planning target passed into this resolver
      - plantedTarget = committed floor contact from runtime memory
      - activeTarget = current seeking/hanging/landing target
      - x/y = final clamped IK paw target

      Gait arbitration:
      - a planted paw may be over-stretched but held planted
      - only the release plan's selected paw is allowed to release normally
      - extreme over-stretch can still force release as a safety valve
    */

    const memoryEnabled = this.bool(this.c.cat_paw_contact_memory_enabled);
    const slot = memoryEnabled ? this.getCatPawContactSlot(name) : null;

    const safeRoot = {
      x: Number(root?.x || 0),
      y: Number(root?.y || 0),
    };

    const safeDesired = {
      x: Number(desiredPaw?.x || safeRoot.x),
      y: Number(desiredPaw?.y || safeRoot.y),
    };

    const safeFloorY = Number.isFinite(Number(floorY))
      ? Number(floorY)
      : safeDesired.y;

    const activeStep =
      memoryEnabled && slot?.step
        ? this.sampleCatPawStep(name, { commitContactMemory })
        : null;

    if (activeStep) {
      return {
        ...activeStep,
        desiredX: safeDesired.x,
        desiredY: safeDesired.y,
      };
    }

    const minReach = Math.max(0.001, Number(reach?.minReach || 0.001));
    const maxReach = Math.max(minReach, Number(reach?.maxReach || minReach));

    const unplantRatio = this.clamp(
      Number(this.getCatRuntimeConfigValue("cat_paw_unplant_ratio", 0.8)),
      0.2,
      1.5
    );

    const hangLengthRatio = this.clamp(
      Number(this.c.cat_paw_hang_length_ratio ?? 0.72),
      0.1,
      1.5
    );

    const groundCaptureDistance = Math.max(
      0,
      Number(this.getCatRuntimeConfigValue("cat_paw_ground_capture_distance", 10))
    );

    const maxPlantedReach = maxReach * unplantRatio;

    const forceRatio =
      forceReleaseRatio === null || forceReleaseRatio === undefined
        ? this.clamp(Number(this.getCatRuntimeConfigValue("cat_gait_force_release_ratio", 1)), 0.8, 2)
        : this.clamp(Number(forceReleaseRatio), 0.8, 2);

    const forcedReleaseDistance = maxReach * forceRatio;

    const isFloorLike = (point) =>
      Math.abs(Number(point?.y || 0) - safeFloorY) <= groundCaptureDistance;

    const distanceFromRoot = (point) =>
      Math.hypot(
        Number(point?.x || 0) - safeRoot.x,
        Number(point?.y || 0) - safeRoot.y
      );

    /*
      Memory seed.

      Before the paw has ever entered the live contact system, the current
      desired/base point is allowed to become the first planted target.
    */
    if (
      memoryEnabled &&
      slot &&
      !slot.hasInitialised &&
      isFloorLike(safeDesired) &&
      distanceFromRoot(safeDesired) <= maxPlantedReach
    ) {
      const seededTarget = {
        x: safeDesired.x,
        y: safeDesired.y,
      };

      if (commitContactMemory) {
        slot.hasInitialised = true;
        slot.state = "planted";
        slot.plantedTarget = seededTarget;
        slot.activeTarget = seededTarget;
      }

      const planted = this.clampCatPawTargetToReach({
        root: safeRoot,
        desiredPaw: seededTarget,
        minReach,
        maxReach,
      });

      return {
        name,
        x: planted.x,
        y: planted.y,
        state: "planted",

        desiredX: safeDesired.x,
        desiredY: safeDesired.y,

        targetX: seededTarget.x,
        targetY: seededTarget.y,

        plantedX: seededTarget.x,
        plantedY: seededTarget.y,

        floorY: safeFloorY,
        contactSource: "seeded",
      };
    }

    /*
      1. Existing planted contact.

      If reachable, grip it.

      If over-stretched, gait arbitration decides whether this paw is actually
      allowed to release now.
    */
    const plantedTarget =
      memoryEnabled && slot?.plantedTarget
        ? {
            x: Number(slot.plantedTarget.x),
            y: Number(slot.plantedTarget.y),
          }
        : null;

    if (plantedTarget) {
      const plantedDistance = distanceFromRoot(plantedTarget);

      const plantedReachable =
        isFloorLike(plantedTarget) && plantedDistance <= maxPlantedReach;

      const forcedRelease =
        isFloorLike(plantedTarget) && plantedDistance > forcedReleaseDistance;
      const plannedRelease =
        Boolean(releaseRequested) && isFloorLike(plantedTarget);

      if (
        (plantedReachable && !plannedRelease) ||
        (!releaseAllowed && !forcedRelease)
      ) {
        const planted = this.clampCatPawTargetToReach({
          root: safeRoot,
          desiredPaw: plantedTarget,
          minReach,
          maxReach,
        });

        if (commitContactMemory) {
          slot.state = "planted";
          slot.activeTarget = plantedTarget;
        }

        return {
          name,
          x: planted.x,
          y: planted.y,
          state: "planted",

          desiredX: safeDesired.x,
          desiredY: safeDesired.y,

          targetX: plantedTarget.x,
          targetY: plantedTarget.y,

          plantedX: plantedTarget.x,
          plantedY: plantedTarget.y,

          floorY: safeFloorY,
          contactSource: plantedReachable ? "memory" : "gaitHeld",
          gaitReleaseHeld: !plantedReachable && !releaseAllowed,
          forcedRelease,
          plannedRelease,
          overreach: Math.max(0, plantedDistance - maxPlantedReach),
        };
      }

      /*
        Release.

        The planted point is no longer reachable and gait arbitration allows it
        to release, or the paw is stretched far enough to force release.
      */
      if (commitContactMemory) {
        const landingTarget = this.getCatFreshLandingPawTarget({
          name,
          desiredPaw: safeDesired,
          root: safeRoot,
          reach,
          front,
          floorY: safeFloorY,
          scale,
          bodyLength,
        });

        const clampedLandingTarget = this.clampCatPawTargetToReach({
          root: safeRoot,
          desiredPaw: landingTarget,
          minReach,
          maxReach,
        });

        const step = this.startCatPawStep({
          name,
          from: plantedTarget,
          to: {
            x: clampedLandingTarget.x,
            y: safeFloorY,
          },
          root: safeRoot,
          reach,
          floorY: safeFloorY,
          scale,
        });

        const stepPoint = this.sampleCatPawStep(name, {
          commitContactMemory,
        }) || {
          x: plantedTarget.x,
          y: plantedTarget.y,
          state: "stepping",
          contactSource: "stepStart",
        };

        return {
          name,
          x: stepPoint.x,
          y: stepPoint.y,
          state: stepPoint.state || "stepping",

          desiredX: safeDesired.x,
          desiredY: safeDesired.y,

          targetX: step?.to?.x ?? clampedLandingTarget.x,
          targetY: step?.to?.y ?? safeFloorY,
          floorY: safeFloorY,

          contactSource: "stepStart",
          releaseRequested,
          forcedRelease,
          plannedRelease,
          stepProgress: stepPoint.stepProgress ?? 0,
          stepDurationFrames: step?.durationFrames,
          stepLift: step?.lift,
        };
      }
    }

    /*
      2. Stateless fallback when contact memory is disabled.
    */
    if (!memoryEnabled) {
      const desiredDistance = distanceFromRoot(safeDesired);
      const desiredIsFloorLike = isFloorLike(safeDesired);

      if (desiredIsFloorLike && desiredDistance <= maxPlantedReach) {
        const planted = this.clampCatPawTargetToReach({
          root: safeRoot,
          desiredPaw: safeDesired,
          minReach,
          maxReach,
        });

        return {
          name,
          x: planted.x,
          y: planted.y,
          state: "planted",
          desiredX: safeDesired.x,
          desiredY: safeDesired.y,
          targetX: safeDesired.x,
          targetY: safeDesired.y,
          floorY: safeFloorY,
          contactSource: "stateless",
        };
      }
    }

    /*
      3. Hanging.
    */
    const hangTarget = {
      x: safeRoot.x,
      y: Math.min(safeRoot.y + maxReach * hangLengthRatio, safeFloorY),
    };

    const hanging = this.clampCatPawTargetToReach({
      root: safeRoot,
      desiredPaw: hangTarget,
      minReach,
      maxReach,
    });

    const closeEnoughToFloor =
      Math.abs(hanging.y - safeFloorY) <= groundCaptureDistance;

    if (
      !closeEnoughToFloor ||
      !this.bool(this.c.cat_paw_landing_enabled)
    ) {
      if (memoryEnabled && slot && commitContactMemory) {
        slot.hasInitialised = true;
        slot.state = "hanging";
        slot.activeTarget = {
          x: hangTarget.x,
          y: hangTarget.y,
          rootX: safeRoot.x,
          rootY: safeRoot.y,
        };
      }

      return {
        name,
        x: hanging.x,
        y: hanging.y,
        state: "hanging",

        desiredX: safeDesired.x,
        desiredY: safeDesired.y,

        targetX: hangTarget.x,
        targetY: hangTarget.y,

        floorY: safeFloorY,
        contactSource: "active",
      };
    }

    /*
      4. Landing.

      Close to the floor, choose a fresh active landing target. Contact memory
      lets the active target approach that candidate before it commits as the
      next planted contact, so paws do not teleport to every new candidate.
    */
    const landingTarget = this.getCatFreshLandingPawTarget({
      name,
      desiredPaw: safeDesired,
      root: safeRoot,
      reach,
      front,
      floorY: safeFloorY,
      scale,
      bodyLength,
    });

    const previousActiveTarget =
      memoryEnabled && slot?.activeTarget
        ? {
            x: Number(slot.activeTarget.x),
            y: Number(slot.activeTarget.y),
          }
        : null;

    const landingStep = Math.max(1.5, maxReach * 0.18);
    const approachedLanding =
      memoryEnabled && previousActiveTarget
        ? this.approachPoint(previousActiveTarget, landingTarget, landingStep)
        : {
            x: landingTarget.x,
            y: landingTarget.y,
            complete: true,
            distance: 0,
          };

    const landing = this.clampCatPawTargetToReach({
      root: safeRoot,
      desiredPaw: approachedLanding,
      minReach,
      maxReach,
    });

    const committedTarget = {
      x: approachedLanding.x,
      y: approachedLanding.y,
      rootX: safeRoot.x,
      rootY: safeRoot.y,
    };

    if (memoryEnabled && slot && commitContactMemory) {
      slot.hasInitialised = true;
      slot.state = approachedLanding.complete ? "planted" : "landing";
      slot.plantedTarget = approachedLanding.complete ? committedTarget : null;
      slot.activeTarget = committedTarget;
    }

    const resolvedState =
      memoryEnabled && approachedLanding.complete ? "planted" : "landing";

    return {
      name,
      x: landing.x,
      y: landing.y,
      state: resolvedState,

      desiredX: safeDesired.x,
      desiredY: safeDesired.y,

      targetX: approachedLanding.x,
      targetY: approachedLanding.y,

      plantedX:
        memoryEnabled && commitContactMemory && approachedLanding.complete
          ? committedTarget.x
          : undefined,
      plantedY:
        memoryEnabled && commitContactMemory && approachedLanding.complete
          ? committedTarget.y
          : undefined,

      freshLandingX: landingTarget.freshX,
      freshLandingY: landingTarget.freshY,
      oldLandingX: landingTarget.oldX,
      oldLandingY: landingTarget.oldY,
      landingKeepOldBias: landingTarget.keepOldBias,
      landingApproachComplete: approachedLanding.complete,
      landingApproachDistance: approachedLanding.distance,
      landingStep,
      landingTargetX: landingTarget.x,
      landingTargetY: landingTarget.y,
      minUsefulStride: landingTarget.minUsefulStride,
      strideInTravelDirection: landingTarget.strideInTravelDirection,
      strideBoost: landingTarget.strideBoost,
      supportSeparation: landingTarget.supportSeparation,
      supportMinSeparation: landingTarget.supportMinSeparation,
      supportSeparationAdjustment: landingTarget.supportSeparationAdjustment,
      rootVelocityX: landingTarget.rootVelocityX,
      travelSign: landingTarget.travelSign,
      supportBias: landingTarget.supportBias,
      laneBias: landingTarget.laneBias,

      floorY: safeFloorY,
      contactSource:
        memoryEnabled && !approachedLanding.complete
          ? "approachLanding"
          : memoryEnabled
            ? "commitLanding"
            : "landing",
    };
  }

  getCatSupportStateFromPaws(paws = {}) {
    /*
      Whole-cat support state.

      This is deliberately simple:
      - planted and landing paws count as support
      - hanging paws do not
      - support state then guides body behaviour

      This same concept becomes the foundation for walking:
      planted -> unplant -> seek -> landing -> planted.
    */

    const pawList = [
      paws.frontNear,
      paws.frontFar,
      paws.rearNear,
      paws.rearFar,
    ].filter(Boolean);

    const supportedPaws = pawList.filter((paw) =>
      ["planted", "landing"].includes(String(paw.state || ""))
    );

    const hangingPaws = pawList.filter(
      (paw) => String(paw.state || "") === "hanging"
    );

    const supportCount = supportedPaws.length;

    let state = "suspended";

    if (supportCount >= 3) {
      state = "supported";
    } else if (supportCount >= 1) {
      state = "partly_supported";
    }

    return {
      state,
      supportCount,
      hangingCount: hangingPaws.length,
      supportedPaws,
      hangingPaws,
      paws: pawList,
    };
  }

  getCatSuspendedHipTarget({
    shoulderJoint,
    hipJoint,
    front,
    anatomy,
  } = {}) {
    /*
      Suspended body target.

      When no paws are meaningfully supporting the cat, the hip/sacrum should
      stop trying to preserve old floor contacts and should instead hang below
      the lifted front/neck/shoulder area.

      This is not a walking solver yet; it is the core physical fallback that
      prevents the spine becoming an infinite bridge.
    */

    const bodyLength = Math.max(1, Number(anatomy?.body?.length || 1));
    const safeShoulder = {
      x: Number(shoulderJoint?.x || 0),
      y: Number(shoulderJoint?.y || 0),
    };

    const fallbackHip = {
      x: Number(hipJoint?.x || safeShoulder.x),
      y: Number(hipJoint?.y || safeShoulder.y + bodyLength),
    };

    const drop =
      bodyLength *
      this.clamp(Number(this.c.cat_suspended_hip_drop_ratio ?? 0.95), 0.2, 2);

    const backOffset =
      bodyLength *
      this.clamp(Number(this.c.cat_suspended_hip_back_ratio ?? 0.22), -1, 1);

    const back = -front;

    return {
      x: safeShoulder.x + back * backOffset,
      y: safeShoulder.y + drop,
      fallbackX: fallbackHip.x,
      fallbackY: fallbackHip.y,
    };
  }

  applyCatSupportStateToBody({
    shoulderJoint,
    hipJoint,
    front,
    anatomy,
    preliminarySupportState,
    authorityScale = 1,
  } = {}) {
    /*
      Body response to support state.

      supported:
        keep the paw-led hip estimate

      partly_supported:
        blend the hip towards a hanging target

      suspended:
        strongly move the hip towards a hanging target

      This is intentionally hip-led for now. The shoulder is already primarily
      driven by the head/scruff/neck pull, so changing the hip is the cleanest
      way to stop body stretch without destroying the drag interaction.
    */

    if (!this.bool(this.c.cat_support_state_enabled)) {
      return {
        shoulderJoint,
        hipJoint,
        supportState: preliminarySupportState || {
          state: "supported",
          supportCount: 4,
          hangingCount: 0,
        },
      };
    }

    const supportState = preliminarySupportState || {
      state: "supported",
      supportCount: 4,
      hangingCount: 0,
    };

    const motionAuthority = this.clamp(Number(authorityScale ?? 1), 0, 1);

    if (!this.bool(this.c.cat_support_body_response_enabled)) {
      return {
        shoulderJoint,
        hipJoint,
        supportState: {
          ...supportState,
          bodyHangBlend: 0,
          bodyResponseDisabled: true,
        },
      };
    }

    const suspendedTarget = this.getCatSuspendedHipTarget({
      shoulderJoint,
      hipJoint,
      front,
      anatomy,
    });

    let blend = 0;

    if (supportState.state === "suspended") {
      blend = this.clamp(Number(this.c.cat_suspended_hang_blend ?? 1), 0, 1) * motionAuthority;
    } else if (supportState.state === "partly_supported") {
      blend = this.clamp(
        Number(this.c.cat_partly_supported_hang_blend ?? 0.45),
        0,
        1
      ) * motionAuthority;
    }

    if (blend <= 0) {
      return {
        shoulderJoint,
        hipJoint,
        supportState,
      };
    }

    return {
      shoulderJoint,
      hipJoint: {
        x: this.lerp(hipJoint.x, suspendedTarget.x, blend),
        y: this.lerp(hipJoint.y, suspendedTarget.y, blend),
      },
      supportState: {
        ...supportState,
        suspendedHipTarget: suspendedTarget,
        bodyHangBlend: blend,
      },
    };
  }

  applyCatPostureToBodyRoots({
    shoulderJoint,
    hipJoint,
    front,
    anatomy,
    supportState,
    headPull = 1,
    authorityScale = 1,
  } = {}) {
    /*
      Supported torso posture.

      Contact memory can correctly keep paws planted while the body travels,
      but the torso still needs a comfort primitive of its own. Otherwise the
      head/shoulder can pull forward while the hip trails behind, producing a
      "dragging the rear half" silhouette even when all four paws are supported.

      This helper is deliberately modest:
      - it does not choose steps
      - it does not know why the cat is moving
      - it only keeps shoulder and hip near a plausible body-root relationship
        when support says the cat is actually standing on paws
    */

    const safeShoulder = {
      x: Number(shoulderJoint?.x || 0),
      y: Number(shoulderJoint?.y || 0),
    };

    const safeHip = {
      x: Number(hipJoint?.x || safeShoulder.x),
      y: Number(hipJoint?.y || safeShoulder.y),
    };

    const state = String(supportState?.state || "supported");
    const motionAuthority = this.clamp(Number(authorityScale ?? 1), 0, 1);

    if (state === "suspended") {
      return {
        shoulderJoint: safeShoulder,
        hipJoint: safeHip,
        postureState: {
          state,
          blend: 0,
          reason: "suspended",
        },
      };
    }

    const bodyLength = Math.max(1, Number(anatomy?.body?.length || 1));
    const bodyHeight = Math.max(1, Number(anatomy?.body?.height || bodyLength * 0.6));
    const idealRootLength = bodyLength * 0.92;
    const back = -Number(front || -1);

    const vector = {
      x: safeHip.x - safeShoulder.x,
      y: safeHip.y - safeShoulder.y,
    };

    const alongBack = vector.x * back;
    const vertical = vector.y;

    const longError = Math.max(0, alongBack - idealRootLength * 1.08);
    const shortError = Math.max(0, idealRootLength * 0.86 - alongBack);
    const slopeError = Math.max(0, Math.abs(vertical) - bodyHeight * 0.18);
    const normalisedError =
      (longError + shortError) / Math.max(1, idealRootLength) +
      slopeError / Math.max(1, bodyHeight);

    const baseBlend = state === "supported" ? 0.2 : 0.1;
    const mildBlend = state === "supported" ? 0.055 : 0.025;
    const blend = this.clamp(
      mildBlend + normalisedError * baseBlend,
      0,
      state === "supported" ? 0.28 : 0.14
    ) * motionAuthority;

    if (blend <= 0) {
      return {
        shoulderJoint: safeShoulder,
        hipJoint: safeHip,
        postureState: {
          state,
          blend: 0,
          reason: "comfortable",
        },
      };
    }

    /*
      Preserve the current torso centre, then rebuild a more comfortable
      shoulder/hip pair around it. This avoids teleporting the whole cat while
      still giving the spine a clearer preferred shape.
    */
    const centre = {
      x: (safeShoulder.x + safeHip.x) * 0.5,
      y: (safeShoulder.y + safeHip.y) * 0.5,
    };

    const desiredShoulder = {
      x: centre.x + Number(front || -1) * idealRootLength * 0.5,
      y: centre.y,
    };

    const desiredHip = {
      x: centre.x + back * idealRootLength * 0.5,
      y: centre.y + bodyHeight * 0.025,
    };

    /*
      Let strong deliberate head/scruff pulls keep a little more authority.
      Auto-wander head targets derive from posture, so this mainly protects
      manual dragging from feeling glued.
    */
    const shoulderBlend = blend * this.lerp(1, 0.65, this.clamp(headPull, 0, 1));

    return {
      shoulderJoint: {
        x: this.lerp(safeShoulder.x, desiredShoulder.x, shoulderBlend),
        y: this.lerp(safeShoulder.y, desiredShoulder.y, shoulderBlend),
      },
      hipJoint: {
        x: this.lerp(safeHip.x, desiredHip.x, blend),
        y: this.lerp(safeHip.y, desiredHip.y, blend),
      },
      postureState: {
        state,
        blend,
        shoulderBlend,
        idealRootLength,
        alongBack,
        vertical,
        normalisedError,
      },
    };
  }

  applyCatSpineLengthComfort({
    shoulderJoint,
    hipJoint,
    front,
    anatomy,
    supportState,
    authorityScale = 1,
  } = {}) {
    /*
      Body-root length envelope.

      Paw contacts can be individually valid while the front and rear support
      groups drift too close together. This helper protects the spine/body
      primitive itself: shoulder and hip roots should not freely collapse below
      a comfortable anatomical length, and should still respect the existing
      max stretch cap.
    */

    const safeShoulder = {
      x: Number(shoulderJoint?.x || 0),
      y: Number(shoulderJoint?.y || 0),
    };

    const safeHip = {
      x: Number(hipJoint?.x || safeShoulder.x),
      y: Number(hipJoint?.y || safeShoulder.y),
    };

    const bodyLength = Math.max(1, Number(anatomy?.body?.length || 1));
    const state = String(supportState?.state || "supported");
    const motionAuthority = this.clamp(Number(authorityScale ?? 1), 0, 1);
    const vector = {
      x: safeHip.x - safeShoulder.x,
      y: safeHip.y - safeShoulder.y,
    };
    const distance = Math.hypot(vector.x, vector.y);
    const back = -Number(front || -1);
    const fallbackDirection = { x: back, y: 0 };
    const direction =
      distance > 0.001
        ? {
            x: vector.x / distance,
            y: vector.y / distance,
          }
        : fallbackDirection;

    const minDistance =
      bodyLength *
      this.clamp(Number(this.getCatRuntimeConfigValue("cat_spine_min_compress_ratio", 0.78)), 0.35, 1.2);
    const maxDistance =
      bodyLength *
      this.clamp(Number(this.getCatRuntimeConfigValue("cat_spine_max_stretch_ratio", 1.22)), 0.6, 3);

    const compressionDeficit = Math.max(0, minDistance - distance);
    const stretchExcess = Math.max(0, distance - maxDistance);

    if (compressionDeficit <= 0 && stretchExcess <= 0) {
      return {
        shoulderJoint: safeShoulder,
        hipJoint: safeHip,
        spineLengthState: {
          state,
          distance,
          minDistance,
          maxDistance,
          adjustment: 0,
          reason: "comfortable",
        },
      };
    }

    /*
      Apply gently when supported, less when partly supported, and do not fight
      suspended/dragged body behaviour. The hip gets most of the correction so
      head/neck manipulation remains responsive.
    */
    const compressionBlend =
      state === "supported" ? 0.55 : state === "partly_supported" ? 0.28 : 0;
    const stretchBlend = 1;
    const targetDistance =
      compressionDeficit > 0
        ? distance + compressionDeficit * compressionBlend * motionAuthority
        : distance - stretchExcess * stretchBlend * motionAuthority;

    const hipTarget = {
      x: safeShoulder.x + direction.x * targetDistance,
      y: safeShoulder.y + direction.y * targetDistance,
    };

    return {
      shoulderJoint: safeShoulder,
      hipJoint: hipTarget,
      spineLengthState: {
        state,
        distance,
        minDistance,
        maxDistance,
        targetDistance,
        adjustment: targetDistance - distance,
        reason: compressionDeficit > 0 ? "compressed" : "stretched",
      },
    };
  }

  getCatFrontLimbReach({ anatomy }) {
    const upperLength = anatomy.front.upperLength;
    const lowerLength = anatomy.front.lowerLength;
    const pasternLength = anatomy.front.pasternLength;

    const maxReach = anatomy.front.maxReach;

    const minReach = Math.max(
      1,
      Math.abs(upperLength - lowerLength) + pasternLength * 0.35
    );

    return {
      upperLength,
      lowerLength,
      pasternLength,
      minReach,
      maxReach,
    };
  }

  getCatRearLimbReach({ anatomy }) {
    const upperLength = anatomy.rear.upperLength;
    const lowerLength = anatomy.rear.lowerLength;
    const footLength = anatomy.rear.footLength;

    const maxReach = anatomy.rear.maxReach;

    const minReach = Math.max(
      1,
      Math.abs(upperLength - lowerLength) + footLength * 0.35
    );

    return {
      upperLength,
      lowerLength,
      footLength,
      minReach,
      maxReach,
    };
  }

  clampCatPawTargetToReach({ root, desiredPaw, minReach, maxReach }) {
    const rootPoint = {
      x: Number(root.x),
      y: Number(root.y),
    };

    const desired = {
      x: Number(desiredPaw.x),
      y: Number(desiredPaw.y),
    };

    const vector = {
      x: desired.x - rootPoint.x,
      y: desired.y - rootPoint.y,
    };

    const distance = Math.max(0.001, Math.hypot(vector.x, vector.y));
    const clampedDistance = this.clamp(
      distance,
      Math.max(0.001, Number(minReach) || 0.001),
      Math.max(0.001, Number(maxReach) || distance)
    );

    if (Math.abs(clampedDistance - distance) < 0.001) {
      return desired;
    }

    const direction = this.normaliseVector(vector, { x: 0, y: 1 });

    return {
      x: rootPoint.x + direction.x * clampedDistance,
      y: rootPoint.y + direction.y * clampedDistance,
    };
  }

  solveCatConstrainedFrontLimb({
    shoulder,
    paw,
    anatomy,
    front,
    bendStrength = 1,
    jointBandPreference = null,
    continuityKey = null,
  }) {
    /*
      Front limb IK solver.

      Chain:
        shoulder -> elbow -> wrist -> paw

      The paw is treated as the contact/end target. The generic 3-segment
      solver chooses a plausible wrist/carpus candidate, then solves the
      shoulder/elbow/wrist chain around it.
    */

    const upperLength = anatomy.front.upperLength;
    const lowerLength = anatomy.front.lowerLength;
    const pasternLength = anatomy.front.pasternLength;

    const back = -front;

    /*
      Front pasterns are close to vertical in the reference stance, with a
      modest backwards lean. This is a preference, not a fixed wrist patch; the
      shared solver may choose a nearby candidate when reach/angles require it.
    */
    const preferredPasternVector = this.normaliseVector(
      {
        x: back * 0.2,
        y: -1,
      },
      { x: 0, y: -1 }
    );

    /*
      For a side-on cat front leg, the elbow generally sits a little behind and
      below the shoulder-wrist line. Keeping this as a profile hint lets the
      same solver serve the rear leg with different anatomy preferences.
    */
    const elbowHint = {
      x: back * Math.max(0.1, upperLength * 0.34) * bendStrength,
      y: Math.max(0.1, upperLength * 0.3),
    };

    return this.solveCatConstrainedThreeSegmentLimb({
      root: shoulder,
      paw,
      segmentA: upperLength,
      segmentB: lowerLength,
      segmentC: pasternLength,
      distalPreference: preferredPasternVector,
      jointAHint: elbowHint,
      preferredJointAAngle: anatomy.front.preferredElbowAngle,
      preferredJointBAngle: anatomy.front.preferredWristAngle,
      bendStrength,
      role: "front",
      jointBandPreference,
      continuityKey,
    });
  }

  solveCatConstrainedRearLimb({
    hip,
    paw,
    anatomy,
    front,
    kneeForward,
    kneeDrop,
    hockBack,
    hockHeight,
    blend = 1,
    jointBandPreference = null,
    continuityKey = null,
  }) {
    /*
      Rear limb IK solver.

      Chain:
        hip -> knee -> hock -> paw

      This now uses the same shared 3-segment limb protocol as the front leg:
      root/paw are fixed inputs, segment lengths come from anatomy, and the
      profile supplies rear-specific hock/knee preferences.
    */

    const upperLength = anatomy.rear.upperLength;
    const lowerLength = anatomy.rear.lowerLength;
    const footLength = anatomy.rear.footLength;

    const back = -front;

    /*
      Hock target.

      Anatomically, the hock sits above and behind the rear paw. We use the
      requested hockBack / hockHeight as a preferred direction, then normalise
      that to the actual foot segment length so the hock->paw length stays
      consistent.
    */
    const preferredFootVector = this.normaliseVector(
      {
        x: back * Math.max(0.1, Number(hockBack || 0)),
        y: -Math.max(0.1, Number(hockHeight || 0)),
      },
      { x: back, y: -0.6 }
    );

    /*
      Knee bend hint.

      For a side-on cat rear leg, the knee generally wants to sit towards the
      front of the cat and somewhat down from the hip, rather than simply
      perpendicular to the hip-paw line.
    */
    const kneeHint = {
      x: front * Math.max(1, Number(kneeForward || 0)),
      y: Math.max(1, Number(kneeDrop || 0)),
    };

    return this.solveCatConstrainedThreeSegmentLimb({
      root: hip,
      paw,
      segmentA: upperLength,
      segmentB: lowerLength,
      segmentC: footLength,
      distalPreference: preferredFootVector,
      jointAHint: kneeHint,
      preferredJointAAngle: anatomy.rear.preferredKneeAngle,
      preferredJointBAngle: anatomy.rear.preferredHockAngle,
      bendStrength: blend,
      role: "rear",
      jointBandPreference,
      continuityKey,
    });
  }

  solveCatConstrainedThreeSegmentLimb({
    root,
    paw,
    totalLength,
    ratios,
    bendSide = 1,
    bendStrength = 1,
    defaultBend = 0,
    segmentA = null,
    segmentB = null,
    segmentC = null,
    distalPreference = null,
    jointAHint = null,
    preferredJointAAngle = null,
    preferredJointBAngle = null,
    role = "limb",
    jointBandPreference = null,
    continuityKey = null,
  }) {
    /*
      Shared 3-segment cat limb IK.

      Protocol:
        root -> jointA -> jointB -> paw

      The old front/rear solvers each fixed jointB from the paw, then ran a
      two-bone solve for root->jointA->jointB. This helper keeps the same stable
      foundation, but treats jointB as a small candidate choice around the
      distal segment. That gives wrist/hock placement room to adapt before gait
      logic decides that a paw must step.

      This is deliberately not cat-walk-specific. The same primitive shape can
      later be used by other anatomical rigs: root/end target, segment lengths,
      and profile preferences in; solved joints and debug measurements out.
    */

    const safeRoot = {
      x: Number(root?.x || 0),
      y: Number(root?.y || 0),
    };

    const safePaw = {
      x: Number(paw?.x || safeRoot.x),
      y: Number(paw?.y || safeRoot.y),
    };

    let lenA = Math.max(0.001, Number(segmentA) || 0);
    let lenB = Math.max(0.001, Number(segmentB) || 0);
    let lenC = Math.max(0.001, Number(segmentC) || 0);

    if (!Number(segmentA) || !Number(segmentB) || !Number(segmentC)) {
      const cleanedRatios = this.normaliseCatSegmentRatios(
        Array.isArray(ratios) && ratios.length >= 3 ? ratios : [0.4, 0.38, 0.22]
      );
      const fallbackTotal = Math.max(
        0.001,
        Number(totalLength) ||
          this.distanceBetweenPoints(safeRoot, safePaw) * 1.05
      );

      lenA = fallbackTotal * cleanedRatios[0];
      lenB = fallbackTotal * cleanedRatios[1];
      lenC = fallbackTotal * cleanedRatios[2];
    }

    const rootToPaw = {
      x: safePaw.x - safeRoot.x,
      y: safePaw.y - safeRoot.y,
    };

    const distance = Math.max(0.001, Math.hypot(rootToPaw.x, rootToPaw.y));
    const reachRatio = distance / Math.max(0.001, lenA + lenB + lenC);

    const preferredDistal = this.normaliseVector(
      distalPreference || { x: 0, y: -1 },
      { x: 0, y: -1 }
    );

    const rootAxis = this.normaliseVector(rootToPaw, { x: 0, y: 1 });
    const distalBaseAngle = Math.atan2(preferredDistal.y, preferredDistal.x);

    const candidateAngles = [
      0,
      -10,
      10,
      -20,
      20,
      -32,
      32,
      -46,
      46,
      -62,
      62,
    ];

    const hint = this.normaliseVector(
      jointAHint || { x: -rootAxis.y * bendSide, y: rootAxis.x * bendSide },
      { x: -rootAxis.y * bendSide, y: rootAxis.x * bendSide }
    );
    const continuityMemory =
      continuityKey && this.catState?.limbSolveMemory
        ? this.catState.limbSolveMemory[continuityKey]
        : null;
    const continuityScale = Math.max(1, lenA + lenB + lenC);

    const scoreAngle = (value, preferred, tolerance, weight = 1) => {
      if (!Number.isFinite(Number(preferred))) return 0;
      const safeTolerance = Math.max(1, Number(tolerance) || 1);
      return (Math.abs(Number(value) - Number(preferred)) / safeTolerance) * weight;
    };

    const scoreJointBandPreference = (jointA, reachable) => {
      if (!reachable) return { score: 0, offset: null };
      if (!this.bool(this.c.cat_joint_band_preference_enabled)) {
        return { score: 0, offset: null };
      }
      if (role !== "front" && role !== "rear") {
        return { score: 0, offset: null };
      }

      const line = jointBandPreference?.bellyLine;
      const start = line?.start;
      const end = line?.end;

      if (!start || !end || !jointA) {
        return { score: 0, offset: null };
      }

      const axis = this.normaliseVector(
        {
          x: Number(end.x) - Number(start.x),
          y: Number(end.y) - Number(start.y),
        },
        { x: 1, y: 0 }
      );

      let normal = {
        x: -axis.y,
        y: axis.x,
      };

      if (normal.y < 0) {
        normal = {
          x: -normal.x,
          y: -normal.y,
        };
      }

      const mid = line.mid || {
        x: (Number(start.x) + Number(end.x)) * 0.5,
        y: (Number(start.y) + Number(end.y)) * 0.5,
      };
      const bodyHeight = Math.max(
        1,
        Number(jointBandPreference?.diagnostics?.bodyHeight) || 1
      );
      const toJoint = {
        x: Number(jointA.x) - Number(mid.x),
        y: Number(jointA.y) - Number(mid.y),
      };
      const below = toJoint.x * normal.x + toJoint.y * normal.y;
      const along = toJoint.x * axis.x + toJoint.y * axis.y;
      const normalisedDistance = Math.abs(below) / bodyHeight;
      const weight = this.clamp(
        Number(this.c.cat_joint_band_preference_weight ?? 0.22),
        0,
        2
      );

      return {
        score: normalisedDistance * weight,
        offset: {
          along,
          below,
          normalisedDistance,
        },
      };
    };

    let best = null;

    candidateAngles.forEach((offsetDegrees, index) => {
      const angle = distalBaseAngle + (offsetDegrees * Math.PI) / 180;
      const distalVector = {
        x: Math.cos(angle),
        y: Math.sin(angle),
      };

      const jointB = {
        x: safePaw.x + distalVector.x * lenC,
        y: safePaw.y + distalVector.y * lenC,
      };

      const solve = this.solveTwoBoneIk({
        root: safeRoot,
        target: jointB,
        lengthA: lenA,
        lengthB: lenB,
        bendHint: hint,
      });

      const jointA = solve.joint;
      const jointAAngle = this.getJointAngleDegrees(safeRoot, jointA, jointB);
      const jointBAngle = this.getJointAngleDegrees(jointA, jointB, safePaw);
      const rootJointBDistance = this.distanceBetweenPoints(safeRoot, jointB);

      const preferredJointB = {
        x: safePaw.x + preferredDistal.x * lenC,
        y: safePaw.y + preferredDistal.y * lenC,
      };

      const distalPreferenceError =
        this.distanceBetweenPoints(jointB, preferredJointB) / Math.max(1, lenC);

      const unreachablePenalty = solve.reachable ? 0 : 3;
      const jointBandScore = scoreJointBandPreference(jointA, solve.reachable);
      const continuityScore =
        continuityMemory?.jointA && continuityMemory?.jointB
          ? this.clamp(
              (this.distanceBetweenPoints(jointA, continuityMemory.jointA) +
                this.distanceBetweenPoints(jointB, continuityMemory.jointB)) /
                continuityScale,
              0,
              2
            ) * 0.42
          : 0;

      /*
        The first candidate is the authored/profile preference. A tiny index
        cost keeps the solver stable when several candidates are almost equal.
      */
      const score =
        unreachablePenalty +
        distalPreferenceError * 0.55 +
        scoreAngle(jointAAngle, preferredJointAAngle, 42, 0.38) +
        scoreAngle(jointBAngle, preferredJointBAngle, 42, 0.28) +
        jointBandScore.score +
        continuityScore +
        index * 0.002;

      const candidate = {
        jointA,
        jointB,
        reachable: solve.reachable,
        distance,
        rootJointBDistance,
        reachRatio,
        jointAAngle,
        jointBAngle,
        jointBandOffset: jointBandScore.offset,
        jointBandScore: jointBandScore.score,
        continuityScore,
        score,
        candidateOffsetDegrees: offsetDegrees,
        role,
        segmentLengths: {
          a: lenA,
          b: lenB,
          c: lenC,
        },
      };

      if (!best || candidate.score < best.score) {
        best = candidate;
      }
    });

    if (continuityKey && best) {
      if (!this.catState) this.catState = this.createInitialCatState();
      if (!this.catState.limbSolveMemory) this.catState.limbSolveMemory = {};
      this.catState.limbSolveMemory[continuityKey] = {
        jointA: { x: Number(best.jointA.x), y: Number(best.jointA.y) },
        jointB: { x: Number(best.jointB.x), y: Number(best.jointB.y) },
        candidateOffsetDegrees: best.candidateOffsetDegrees,
        score: best.score,
      };
    }

    return best;
  }

  solveCatTail({
    tailBase,
    spineVector,
    front,
    back,
    tailLength,
    tailCurve,
    tailLift,
    tailFollow = 0.8,
    tailBaseAngle = 0,
    tailTipCurl = 0,
    midLiftRatio = 0.5,
    midCurveRatio = 0,
    tailTipTarget = null,
  } = {}) {
    /*
      Tip-led tail primitive.

      A cat tail should feel like a flexible appendage with an intended tip
      position, not just a fixed polyline continuing the spine. This keeps the
      current simple cubic render path, but changes the meaning:

        sacrum/base -> elastic control -> arcing mid -> ideal tip

      Later moods/attention can move the ideal tip without replacing the tail
      system. The same idea could also become useful for whiskers, arms, or any
      soft "reach this expressive end point" appendage.
    */

    const base = {
      x: Number(tailBase?.x || 0),
      y: Number(tailBase?.y || 0),
    };

    const safeBack = Number(back || -Number(front || -1) || 1);
    const safeFront = Number(front || -safeBack || -1);
    const length = Math.max(0.001, Number(tailLength) || 0.001);
    const curve = Number(tailCurve || 0);
    const lift = Number(tailLift || 0);
    const curl = Number(tailTipCurl || 0);

    const follow = this.clamp(Number(tailFollow ?? 0.8), 0, 1);
    const baseSpineDirection = this.normaliseVector(
      {
        x: this.lerp(safeBack, Number(spineVector?.x || safeBack), follow),
        y: this.lerp(0, Number(spineVector?.y || 0), follow),
      },
      { x: safeBack, y: 0 }
    );

    /*
      tailBaseAngle is authored in cat-facing space. Mirror it with the back
      direction so the same YAML/default value lifts the tail upward whether
      the cat is facing left or right.
    */
    const mirroredBaseAngle = Number(tailBaseAngle || 0) * safeBack;

    const baseDirection = this.normaliseVector(
      this.rotatePoint(baseSpineDirection, { x: 0, y: 0 }, mirroredBaseAngle),
      baseSpineDirection
    );

    const idealTip = tailTipTarget
      ? {
          x: Number(tailTipTarget.x),
          y: Number(tailTipTarget.y),
        }
      : {
          x: base.x + baseDirection.x * length + safeFront * curve,
          y: base.y + baseDirection.y * length + lift - curl,
        };

    const baseToTip = {
      x: idealTip.x - base.x,
      y: idealTip.y - base.y,
    };
    const tailAxis = this.normaliseVector(baseToTip, baseDirection);
    const tailNormal = {
      x: -tailAxis.y,
      y: tailAxis.x,
    };

    /*
      Clean tail primitive.

      The tip may come from mood smoothing, but the body of the tail owns its
      own bend. That prevents the render from degenerating into a straight tube
      whenever the target tip lies along the sacrum direction.
    */
    const authoredBend =
      safeFront * curve * 0.55 +
      curl * 0.65 +
      Math.max(1.5, length * 0.12) * safeFront;
    const liftBend = lift * 0.22;
    const midBias = this.clamp(Number(midCurveRatio ?? 0.2), -1, 1);

    const tailControl = {
      x:
        base.x +
        baseToTip.x * 0.28 +
        tailNormal.x * authoredBend * 0.36,
      y:
        base.y +
        baseToTip.y * 0.28 +
        tailNormal.y * authoredBend * 0.36 +
        liftBend * 0.2,
    };

    const tailMid = {
      x:
        base.x +
        baseToTip.x * 0.58 +
        tailNormal.x * authoredBend * (0.75 + midBias * 0.18),
      y:
        base.y +
        baseToTip.y * 0.58 +
        tailNormal.y * authoredBend * (0.75 + midBias * 0.18) +
        liftBend,
    };

    const distalAxis = this.normaliseVector(
      {
        x: idealTip.x - tailMid.x,
        y: idealTip.y - tailMid.y,
      },
      tailAxis
    );
    const distalNormal = {
      x: -distalAxis.y,
      y: distalAxis.x,
    };
    const curlSign = Math.sign(curl || safeFront) || 1;
    const kinkAmount =
      -safeFront *
      this.clamp(
        curl * 1.8 + curlSign * Math.max(1.2, length * 0.08),
        -length * 0.28,
        length * 0.28
      );
    const floatAmount = Math.max(1, length * 0.08) * (lift < 0 ? -0.35 : 0.18);
    const tailTipControl = {
      x:
        tailMid.x +
        (idealTip.x - tailMid.x) * 0.64 +
        distalNormal.x * kinkAmount,
      y:
        tailMid.y +
        (idealTip.y - tailMid.y) * 0.64 +
        distalNormal.y * kinkAmount +
        floatAmount,
    };

    return {
      tailBase: base,
      tailControl,
      tailMid,
      tailTipControl,
      tailTip: idealTip,
      tailIdealTip: idealTip,
    };
  }

  getCatBellyLine(rig, anatomy = null) {
    /*
      Belly line / underside guide.

      This is visual anatomy, not a limb solver rule. It follows the solved
      chest -> midSpine -> sacrum body curve, offset downward by a body-relative
      amount so we can judge whether the limb joints sit in a plausible band
      under the torso during walking.
    */

    if (!rig?.chest || !rig?.midSpine || !rig?.sacrum) return null;

    const chest = rig.chest;
    const midSpine = rig.midSpine;
    const sacrum = rig.sacrum;
    const bodyHeight = Math.max(
      1,
      Number(anatomy?.body?.height || rig.anatomy?.body?.height || 1)
    );

    const spineAxis = this.normaliseVector(
      {
        x: Number(sacrum.x) - Number(chest.x),
        y: Number(sacrum.y) - Number(chest.y),
      },
      { x: -Number(rig.solvedFrontSign || rig.cfg?.frontSign || -1), y: 0 }
    );

    let undersideNormal = {
      x: -spineAxis.y,
      y: spineAxis.x,
    };

    if (undersideNormal.y < 0) {
      undersideNormal = {
        x: -undersideNormal.x,
        y: -undersideNormal.y,
      };
    }

    /*
      The spine/body line is currently drawn through the visible top/centre of
      the torso. The belly guide needs to read as the underside contour, so its
      offset is intentionally more than a small internal brace offset.
    */
    const offset = bodyHeight * 0.58;
    const midOffset = bodyHeight * 0.64;
    const endInset = bodyHeight * 0.08;

    const bellyStart = {
      x: Number(chest.x) + undersideNormal.x * offset + spineAxis.x * endInset,
      y: Number(chest.y) + undersideNormal.y * offset + spineAxis.y * endInset,
    };
    const bellyMid = {
      x: Number(midSpine.x) + undersideNormal.x * midOffset,
      y: Number(midSpine.y) + undersideNormal.y * midOffset,
    };
    const bellyEnd = {
      x: Number(sacrum.x) + undersideNormal.x * offset - spineAxis.x * endInset,
      y: Number(sacrum.y) + undersideNormal.y * offset - spineAxis.y * endInset,
    };

    const spineLength =
      this.distanceBetweenPoints(chest, midSpine) +
      this.distanceBetweenPoints(midSpine, sacrum);
    const bellyLength =
      this.distanceBetweenPoints(bellyStart, bellyMid) +
      this.distanceBetweenPoints(bellyMid, bellyEnd);

    const projectToBelly = (point) => {
      if (!point) return null;

      const toPoint = {
        x: Number(point.x) - bellyMid.x,
        y: Number(point.y) - bellyMid.y,
      };

      return {
        along: toPoint.x * spineAxis.x + toPoint.y * spineAxis.y,
        below: toPoint.x * undersideNormal.x + toPoint.y * undersideNormal.y,
      };
    };

    const nearJointBand = {
      front: rig.frontElbowNear || null,
      rear: rig.rearKneeNear || null,
    };
    const farJointBand = {
      front: rig.frontElbowFar || null,
      rear: rig.rearKneeFar || null,
    };

    const getBandAngle = (band) =>
      band.front && band.rear
        ? Math.atan2(
            Number(band.rear.y) - Number(band.front.y),
            Number(band.rear.x) - Number(band.front.x)
          )
        : null;

    const nearJointBandAngle = getBandAngle(nearJointBand);
    const farJointBandAngle = getBandAngle(farJointBand);
    const spineAngle = Math.atan2(spineAxis.y, spineAxis.x);
    const bellyAngle = Math.atan2(
      bellyEnd.y - bellyStart.y,
      bellyEnd.x - bellyStart.x
    );
    const makePatch = (...points) =>
      points.every(Boolean)
        ? {
            points,
          }
        : null;
    const rearNearUpperLegPatch = makePatch(
      rig.hipJoint,
      rig.rearKneeNear,
      rig.rearHockNear
    );
    const rearFarUpperLegPatch = makePatch(
      rig.hipJoint,
      rig.rearKneeFar,
      rig.rearHockFar
    );

    return {
      spineLine: {
        start: chest,
        mid: midSpine,
        end: sacrum,
      },
      bellyLine: {
        start: bellyStart,
        mid: bellyMid,
        end: bellyEnd,
      },
      nearJointBand,
      farJointBand,
      jointBand: nearJointBand,
      bellySurface: {
        bellyLine: {
          start: bellyStart,
          mid: bellyMid,
          end: bellyEnd,
        },
        nearJointBand,
        farJointBand,
      },
      patches: {
        rearNearUpperLeg: rearNearUpperLegPatch,
        rearFarUpperLeg: rearFarUpperLegPatch,
      },
      diagnostics: {
        bellySpineAngleDelta: bellyAngle - spineAngle,
        jointBandSpineAngleDelta:
          nearJointBandAngle == null ? null : nearJointBandAngle - spineAngle,
        nearJointBandSpineAngleDelta:
          nearJointBandAngle == null ? null : nearJointBandAngle - spineAngle,
        farJointBandSpineAngleDelta:
          farJointBandAngle == null ? null : farJointBandAngle - spineAngle,
        bellyLength,
        spineLength,
        bodyHeight,
        bellyToSpineOffset: offset,
        frontElbowOffsetFromBelly: projectToBelly(nearJointBand.front),
        rearKneeOffsetFromBelly: projectToBelly(nearJointBand.rear),
        frontElbowFarOffsetFromBelly: projectToBelly(farJointBand.front),
        rearKneeFarOffsetFromBelly: projectToBelly(farJointBand.rear),
      },
    };
  }

  getCatEarRig({ skull, front, scale }) {
    const c = this.getCatRuntimeConfig();

    /*
      Ear rig.

      Ears live in skull-local space and follow the mirrored visual head tilt.
      The stored skull tilt is authored from the left-facing pose, so when the
      cat faces right the visual tilt needs to invert.
    */

    const skullTilt = -Number(front || -1) * Number(skull?.tilt || 0);

    const getSkullLocalPoint = (localX, localY) => {
      const point = this.getCatLocalPoint(
        skull,
        front,
        Number(localX || 0),
        Number(localY || 0),
        scale
      );

      return this.rotatePoint(point, skull, skullTilt);
    };

    const makeEar = (prefix) => {
      const base = getSkullLocalPoint(
        Number(c[`cat_${prefix}_ear_offset_x`] || 0),
        Number(c[`cat_${prefix}_ear_offset_y`] || 0)
      );

      const width = Number(c[`cat_${prefix}_ear_width`] || 0) * scale;
      const height = Number(c[`cat_${prefix}_ear_height`] || 0) * scale;
      const localEarAngle = Number(c[`cat_${prefix}_ear_angle`] || 0);

      const outerRaw = {
        x: base.x - front * width * 0.5,
        y: base.y,
      };

      const innerRaw = {
        x: base.x + front * width * 0.5,
        y: base.y,
      };

      const tipRaw = {
        x: base.x + front * width * 0.08,
        y: base.y - height,
      };

      const totalAngle = skullTilt + front * localEarAngle;

      return {
        base,
        outer: this.rotatePoint(outerRaw, base, totalAngle),
        inner: this.rotatePoint(innerRaw, base, totalAngle),
        tip: this.rotatePoint(tipRaw, base, totalAngle),
        opacity: Number(c[`cat_${prefix}_ear_opacity`] ?? 1),
      };
    };

    return {
      frontEar: makeEar("front"),
      rearEar: makeEar("rear"),
    };
  }

  getCatInteractionTargets(rig) {
    if (!rig) return {};

    /*
      Named interaction anchors on the cat.

      These are intentionally broader than dragging:
      - head/scruff can be grabbed
      - back can be petted
      - paws can be targeted for tricks or object interaction
      - tailTip can later use a loiter-zone target
    */

    const head = rig.skull
      ? {
          x: Number(rig.skull.x),
          y: Number(rig.skull.y),
        }
      : null;

    const scruff =
      rig.neckBase && rig.neckTip
        ? {
            x: this.lerp(rig.neckBase.x, rig.neckTip.x, 0.35),
            y: this.lerp(rig.neckBase.y, rig.neckTip.y, 0.35),
          }
        : head;

    const back =
      rig.chest && rig.sacrum
        ? {
            x: this.lerp(rig.chest.x, rig.sacrum.x, 0.45),
            y: this.lerp(rig.chest.y, rig.sacrum.y, 0.45),
          }
        : null;

    return {
      head: head
        ? {
            id: "head",
            kind: "point",
            point: head,
            radius: 20,
          }
        : null,

      scruff: scruff
        ? {
            id: "scruff",
            kind: "point",
            point: scruff,
            radius: 20,
          }
        : null,

      back: back
        ? {
            id: "back",
            kind: "point",
            point: back,
            radius: 24,
          }
        : null,

      frontPawNear: rig.frontPawNear
        ? {
            id: "frontPawNear",
            kind: "point",
            point: {
              x: Number(rig.frontPawNear.x),
              y: Number(rig.frontPawNear.y),
            },
            radius: 14,
          }
        : null,

      frontPawFar: rig.frontPawFar
        ? {
            id: "frontPawFar",
            kind: "point",
            point: {
              x: Number(rig.frontPawFar.x),
              y: Number(rig.frontPawFar.y),
            },
            radius: 14,
          }
        : null,

      rearPawNear: rig.rearPawNear
        ? {
            id: "rearPawNear",
            kind: "point",
            point: {
              x: Number(rig.rearPawNear.x),
              y: Number(rig.rearPawNear.y),
            },
            radius: 14,
          }
        : null,

      rearPawFar: rig.rearPawFar
        ? {
            id: "rearPawFar",
            kind: "point",
            point: {
              x: Number(rig.rearPawFar.x),
              y: Number(rig.rearPawFar.y),
            },
            radius: 14,
          }
        : null,

      tailTip: rig.tailTip
        ? {
            id: "tailTip",
            kind: "point",
            point: {
              x: Number(rig.tailTip.x),
              y: Number(rig.tailTip.y),
            },
            radius: 14,
          }
        : null,
    };
  }

  setCatTargetOverride(targetId, point) {
    if (!this.catState) {
      this.catState = this.createInitialCatState();
    }

    if (!this.catState.targetOverrides) {
      this.catState.targetOverrides =
        this.createInitialCatState().targetOverrides;
    }

    if (!targetId) return;

    this.catState.targetOverrides[targetId] = point
      ? {
          x: Number(point.x),
          y: Number(point.y),
        }
      : null;
  }

  getCatTargetOverride(targetId) {
    if (!targetId) return null;
    return this.catState?.targetOverrides?.[targetId] || null;
  }

  clearCatTargetOverride(targetId) {
    if (!this.catState?.targetOverrides) return;
    if (!targetId) return;

    this.catState.targetOverrides[targetId] = null;
  }

  clearAllCatTargetOverrides() {
    if (!this.catState) {
      this.catState = this.createInitialCatState();
      return;
    }

    this.catState.targetOverrides =
      this.createInitialCatState().targetOverrides;
  }

  getCatAutoWanderState() {
    if (!this.catState) {
      this.catState = this.createInitialCatState();
    }

    if (!this.catState.autoWander) {
      this.catState.autoWander = {
        active: false,
        target: null,
        currentAnchor: null,
        facingSign: null,
        idleUntil: 0,
        raf: null,
        lastFrameTime: null,
      };
    }

    return this.catState.autoWander;
  }

  getCatLocomotionFacingSign(configuredFrontSign = null) {
    /*
      Facing intent for root-led locomotion.

      Local cat controls are authored in "front" space, so target planning
      needs to know the intended facing before it creates head and paw targets.
      Dynamic facing can still confirm the solved body later, but auto-wander's
      travel direction should be the first clue while the root is moving.
    */

    const fallback =
      configuredFrontSign === 1 || configuredFrontSign === -1
        ? configuredFrontSign
        : this.getCatFacingSign();

    const state = this.catState?.autoWander;

    if (
      this.getCatAutoWanderEnabled() &&
      !this.catState?.interactionSession?.active &&
      (state?.facingSign === 1 || state?.facingSign === -1)
    ) {
      return state.facingSign;
    }

    return fallback;
  }

  getCatLocomotionAnchor(configuredAnchor) {
    /*
      Runtime locomotion anchor.

      Auto-wander used to move the head target directly, which made walking
      depend on an arbitrary skull Y path. The more reusable primitive is a
      body/root intent: locomotion moves the cat's floor anchor, then the
      target planner derives head and paw targets from posture/anatomy.

      Manual dragging still uses explicit head/scruff overrides. This helper is
      only the background locomotion layer that future dude/cat movement can
      share conceptually: intent -> root motion -> end-effector targets.
    */

    const base = {
      x: Number(configuredAnchor?.x || 0),
      y: Number(configuredAnchor?.y || 0),
    };

    const state = this.catState?.autoWander;

    if (state?.currentAnchor && !this.catState?.interactionSession?.active) {
      return {
        x: Number(state.currentAnchor.x),
        y: Number.isFinite(Number(state.currentAnchor.y))
          ? Number(state.currentAnchor.y)
          : base.y,
        source: this.getCatAutoWanderEnabled()
          ? "cat_auto_wander"
          : "cat_locomotion_hold",
      };
    }

    return base;
  }

  getCatDefaultLocomotionAnchor() {
    const cfg = this.getCatPoseConfig();
    const input = this.getCatSolverInput();

    return {
      x: Number(input.anchor?.x ?? cfg.x ?? 0),
      y: Number(input.anchor?.y ?? cfg.y ?? 0),
    };
  }

  getCatCurrentAutoBodyPoint() {
    const state = this.getCatAutoWanderState();

    if (state.currentAnchor) {
      return {
        x: Number(state.currentAnchor.x),
        y: Number(state.currentAnchor.y),
      };
    }

    const rigAnchor = this.catState?.rig?.anchor;

    if (rigAnchor) {
      return {
        x: Number(rigAnchor.x),
        y: Number(rigAnchor.y),
      };
    }

    return this.getCatDefaultLocomotionAnchor();
  }

  getCatDefaultHeadTargetForWander() {
    /*
      Reconstruct the normal configured head target closely enough for
      auto-wander startup.

      Once auto-wander is running, the actual live value comes from the existing
      targetOverride("head").
    */

    const cfg = this.getCatPoseConfig();
    const input = this.getCatSolverInput();
    const anatomy = this.getCatAnatomy?.(input) || null;

    const s = Number(cfg.scale) || 1;
    const front = Number(cfg.frontSign || -1);

    const anchor = {
      x: Number(input.anchor.x),
      y: Number(input.anchor.y),
    };

    const bodyLength = Number(
      anatomy?.body?.length || Number(input.bodyLength || 40.6) * s || 40.6
    );

    const chestHeight = Number(input.chestHeight || 0) * s;

    return {
      x:
        anchor.x +
        front * (bodyLength * 0.42 + Number(input.headForward || 0) * s),
      y:
        anchor.y -
        chestHeight -
        Number(input.headLift || 0) * s,
    };
  }

  getCatCurrentAutoHeadPoint() {
    const override = this.getCatTargetOverride("head");

    if (override) {
      return {
        x: Number(override.x),
        y: Number(override.y),
      };
    }

    const rigHead = this.catState?.rig?.skull;

    if (rigHead) {
      return {
        x: Number(rigHead.x),
        y: Number(rigHead.y),
      };
    }

    return this.getCatDefaultHeadTargetForWander();
  }

  chooseCatAutoWanderTarget() {
    const movementTest = this.getCatMovementTestState();
    if (this.bool(movementTest.continuousWalk)) {
      const current = this.getCatCurrentAutoBodyPoint();
      const direction = Number(movementTest.direction || 1) >= 0 ? 1 : -1;
      const distance = Math.max(this.getWorldWidth() * 3, 900);

      return {
        x: Number(current.x) + direction * distance,
        y: Number(current.y),
        source: "cat_continuous_walk",
      };
    }

    const minX = this.clamp(
      Number(this.c.cat_wander_min_x ?? 110),
      0,
      this.getWorldWidth()
    );

    const maxX = this.clamp(
      Number(this.c.cat_wander_max_x ?? 410),
      0,
      this.getWorldWidth()
    );

    const lo = Math.min(minX, maxX);
    const hi = Math.max(minX, maxX);

    const current = this.getCatCurrentAutoBodyPoint();

    /*
      Keep v0 nice and legible: usually choose the opposite side rather than a
      totally random small shuffle.
    */
    const midpoint = (lo + hi) / 2;
    const goRight = Number(current.x || midpoint) < midpoint;

    const edgeTarget = goRight ? hi : lo;

    const jitter = Math.max(0, Number(this.c.cat_wander_target_jitter ?? 8));
    const jitterAmount = (Math.random() * 2 - 1) * jitter;

    return {
      x: this.clamp(edgeTarget + jitterAmount, lo, hi),
      y: Number(current.y),
      source: "cat_auto_wander",
    };
  }

  pauseCatAutoWander() {
    const state = this.getCatAutoWanderState();

    const minIdle = Math.max(0, Number(this.c.cat_wander_min_idle_ms ?? 900));
    const maxIdle = Math.max(
      minIdle,
      Number(this.c.cat_wander_max_idle_ms ?? 2200)
    );

    state.target = null;
    state.idleUntil = performance.now() + this.lerp(minIdle, maxIdle, Math.random());
    state.lastFrameTime = null;
    this.setCatAutoIdlePose("sit");
  }

  stepCatAutoWander() {
    if (!this.getCatAutoWanderEnabled()) return false;
    if (this.bool(this.getCatMovementTestState().paused)) return false;
    if (!this.bool(this.c.cat_enabled) && !this.bool(this.c.show_cat)) return false;

    /*
      Manual cat dragging wins. The auto-wanderer should behave like a gentle
      invisible hand, not fight the user's pointer.
    */
    if (this.catState?.interactionSession?.active) {
      return true;
    }

    const state = this.getCatAutoWanderState();
    const now = performance.now();

    if (state.idleUntil && now < state.idleUntil) {
      this.setCatAutoIdlePose("sit");
      return true;
    }

    if (!state.target) {
      this.setCatAutoIdlePose("stand");
      state.target = this.chooseCatAutoWanderTarget();
    }

    const current = this.getCatCurrentAutoBodyPoint();

    const target = {
      x: Number(state.target.x),
      y: Number.isFinite(Number(state.target.y))
        ? Number(state.target.y)
        : Number(current.y),
    };

    const dx = target.x - current.x;
    const dy = target.y - current.y;
    const distance = Math.hypot(dx, dy);
    const facingDeadband =
      Math.max(0, Number(this.c.cat_dynamic_facing_deadband ?? 4)) *
      Math.max(0.05, Number(this.c.cat_scale || 1));

    if (Math.abs(dx) > facingDeadband) {
      state.facingSign = dx >= 0 ? 1 : -1;
    }

    const arrivalDistance = Math.max(
      0.5,
      Number(this.c.cat_wander_arrival_distance ?? 3)
    );

    if (distance <= arrivalDistance) {
      state.currentAnchor = target;
      this.clearCatTargetOverride("head");
      if (this.bool(this.getCatMovementTestState().continuousWalk)) {
        this.setCatAutoIdlePose("stand");
        state.target = this.chooseCatAutoWanderTarget();
      } else {
        this.pauseCatAutoWander();
      }
      return true;
    }

    const lastFrameTime = Number(state.lastFrameTime || now);
    const dt = Math.min(64, Math.max(0, now - lastFrameTime));
    state.lastFrameTime = now;

    /*
      Speed is world units per 16.67ms frame. The YAML name still says
      "head_speed" for backwards compatibility, but it now drives root
      locomotion. Head height is derived by the target planner from anatomy and
      posture instead of from cat_wander_path_y.
    */
    const speed = Math.max(0.01, Number(this.getCatRuntimeConfigValue("cat_wander_head_speed", 0.28)));
    const behaviourIntent = this.getCatBehaviourIntent();
    const maxStep =
      speed *
      this.clamp(Number(behaviourIntent.paceMultiplier || 1), 0.25, 2) *
      Math.max(1, dt / 16.67);
    const step = Math.min(distance, maxStep);

    const next = {
      x: current.x + (dx / distance) * step,
      y: current.y + (dy / distance) * step,
    };

    state.currentAnchor = next;
    this.clearCatTargetOverride("head");

    return true;
  }

  startCatAutoWander() {
    if (!this.getCatAutoWanderEnabled()) return;
    if (this.bool(this.getCatMovementTestState().paused)) return;

    const state = this.getCatAutoWanderState();

    if (state.raf) return;

    state.active = true;
    state.lastFrameTime = null;

    const frame = () => {
      const currentState = this.getCatAutoWanderState();

      if (
        !this.isConnected ||
        !this.getCatAutoWanderEnabled() ||
        this.bool(this.getCatMovementTestState().paused)
      ) {
        currentState.raf = null;
        currentState.active = false;
        return;
      }

      this.stepCatAutoWander();

      if (this.updateWorldLayout && this.isCatFocusMode()) {
        this.updateWorldLayout();
      }
      if (this.updateCatLayer) this.updateCatLayer();
      if (this.updateCatDebugLayer) this.updateCatDebugLayer();

      currentState.raf = requestAnimationFrame(frame);
    };

    state.raf = requestAnimationFrame(frame);
  }

  stopCatAutoWander({ clearOverride = false } = {}) {
    const state = this.getCatAutoWanderState();

    if (state.raf) {
      cancelAnimationFrame(state.raf);
    }

    state.raf = null;
    state.active = false;
    state.target = null;
    state.lastFrameTime = null;

    if (clearOverride) {
      this.clearCatTargetOverride("head");
    }
  }

  beginCatInteractionSession({
    type = null,
    targetId = null,
    pointerId = null,
    startWorld = null,
    source = "pointer",
  } = {}) {
    if (!this.catState) {
      this.catState = this.createInitialCatState();
    }

    if (this.stopCatAutoWander) {
      this.stopCatAutoWander({ clearOverride: false });
    }

    this.catState.interactionSession = {
      active: true,
      type,
      targetId,
      pointerId,
      startWorld: startWorld
        ? {
            x: Number(startWorld.x),
            y: Number(startWorld.y),
          }
        : null,
      currentWorld: startWorld
        ? {
            x: Number(startWorld.x),
            y: Number(startWorld.y),
          }
        : null,
      source,
    };
  }

  updateCatInteractionSession(point) {
    if (!this.catState?.interactionSession?.active) return;
    if (!point) return;

    this.catState.interactionSession.currentWorld = {
      x: Number(point.x),
      y: Number(point.y),
    };
  }

  endCatInteractionSession() {
    if (!this.catState) {
      this.catState = this.createInitialCatState();
      return;
    }

    if (this.getCatAutoWanderEnabled()) {
      this.startCatAutoWander();
    }

    this.catState.interactionSession =
      this.createInitialCatState().interactionSession;
  }

  findNearestCatInteractionTarget(worldPoint, rig = null) {
    if (!worldPoint) return null;

    const activeRig = rig || this.catState?.rig || this.solveCatRig();
    const targets = this.getCatInteractionTargets(activeRig);

    let best = null;
    let bestDistance = Infinity;

    Object.values(targets).forEach((target) => {
      if (!target || !target.point) return;

      const dx = Number(worldPoint.x) - Number(target.point.x);
      const dy = Number(worldPoint.y) - Number(target.point.y);
      const distance = Math.hypot(dx, dy);

      if (distance <= Number(target.radius || 0) && distance < bestDistance) {
        best = target;
        bestDistance = distance;
      }
    });

    return best;
  }

  updateCatLayer() {
    const layer = this.shadowRoot.querySelector("#catLayer");
    if (!layer) return;

    if (!this.shouldRenderCat || !this.shouldRenderCat()) {
      layer.innerHTML = "";
      return;
    }

    const rig = this.solveCatRig();

    if (!this.catState) {
      this.catState = this.createInitialCatState();
    }

    this.catState.rig = rig;
    this.catState.bounds = rig.bounds;
    this.catState.interactionTargets = this.getCatInteractionTargets(rig);
    this.catState.solvedFrontSign =
      rig.solvedFrontSign || rig.cfg?.frontSign || this.getCatFacingSign();

    const renderMode = this.getCatRenderMode();

    layer.innerHTML = `
      <g class="cat-rig" data-cat-render-mode="${this.esc(renderMode)}">
        ${this.renderCatSkeleton(rig)}
        ${this.renderCatMovementTargetMarker()}
      </g>
    `;

    this.updateCatDebugLayer();
  }

  getCatTailTipControl(rig) {
    if (rig?.tailTipControl) return rig.tailTipControl;

    return {
      x: (Number(rig?.tailMid?.x || 0) + Number(rig?.tailTip?.x || 0)) * 0.5,
      y: (Number(rig?.tailMid?.y || 0) + Number(rig?.tailTip?.y || 0)) * 0.5,
    };
  }

  getCatTailRenderPath(rig) {
    const tipControl = this.getCatTailTipControl(rig);

    return `
      M ${rig.tailBase.x} ${rig.tailBase.y}
      C ${rig.tailControl.x} ${rig.tailControl.y}
        ${rig.tailMid.x} ${rig.tailMid.y}
        ${rig.tailMid.x} ${rig.tailMid.y}
      Q ${tipControl.x} ${tipControl.y}
        ${rig.tailTip.x} ${rig.tailTip.y}
    `;
  }

  renderFelineV2Silhouette(rig) {
    /*
      Candidate V2 is deliberately a rendering experiment, not a new solver.
      It preserves the same solved joints, contacts, direct-register policy and
      debug layer as OG/V1, but draws them as a softer feline mass: a long low
      ribcage, tucked belly, high haunch, compact head, and tapered curved tail.
    */
    if (!rig?.chest || !rig?.midSpine || !rig?.sacrum || !rig?.skull) return "";

    const front = Number(rig.solvedFrontSign || rig.cfg?.frontSign || -1);
    const fill = this.getCatHeadFill();
    const farFill = "var(--secondary-text-color)";
    const lineWidth = Math.max(3.5, Number(this.c.cat_line_width || this.c.line_width || 6));
    const belly = rig.bellyGuide?.bellyLine || {
      start: { x: rig.chest.x, y: rig.chest.y + lineWidth * 1.7 },
      mid: { x: rig.midSpine.x, y: rig.midSpine.y + lineWidth * 2.1 },
      end: { x: rig.sacrum.x, y: rig.sacrum.y + lineWidth * 1.7 },
    };
    const bodyDepth = Math.max(9, Number(belly.mid.y) - Number(rig.midSpine.y));
    const topChest = { x: Number(rig.chest.x) + front * lineWidth * 0.22, y: Number(rig.chest.y) - bodyDepth * 0.52 };
    const topMid = { x: Number(rig.midSpine.x), y: Number(rig.midSpine.y) - bodyDepth * 0.68 };
    const topRump = { x: Number(rig.sacrum.x) - front * lineWidth * 0.18, y: Number(rig.sacrum.y) - bodyDepth * 0.56 };
    const haunch = { x: Number(rig.hipJoint.x) - front * lineWidth * 0.4, y: Number(rig.hipJoint.y) - bodyDepth * 0.12 };
    const shoulder = { x: Number(rig.shoulderJoint.x) + front * lineWidth * 0.42, y: Number(rig.shoulderJoint.y) - bodyDepth * 0.08 };
    const torsoPath = `
      M ${Number(rig.neckBase.x)} ${Number(rig.neckBase.y)}
      C ${topChest.x} ${topChest.y}, ${topMid.x} ${topMid.y}, ${topRump.x} ${topRump.y}
      C ${Number(rig.sacrum.x) - front * bodyDepth * 0.2} ${Number(rig.sacrum.y) - bodyDepth * 0.15}, ${haunch.x} ${haunch.y}, ${Number(belly.end.x)} ${Number(belly.end.y)}
      C ${Number(belly.mid.x)} ${Number(belly.mid.y) + bodyDepth * 0.14}, ${Number(belly.start.x)} ${Number(belly.start.y)}, ${shoulder.x} ${shoulder.y}
      C ${Number(rig.chest.x) + front * bodyDepth * 0.08} ${Number(rig.chest.y) - bodyDepth * 0.14}, ${Number(rig.neckBase.x)} ${Number(rig.neckBase.y) + bodyDepth * 0.18}, ${Number(rig.neckBase.x)} ${Number(rig.neckBase.y)}
      Z
    `;
    const limb = (root, jointA, jointB, paw, colour, opacity, width) => {
      if (![root, jointA, jointB, paw].every(Boolean)) return "";
      return `
        <path
          d="M ${root.x} ${root.y} Q ${jointA.x} ${jointA.y}, ${jointB.x} ${jointB.y} Q ${jointB.x} ${jointB.y}, ${paw.x} ${paw.y}"
          fill="none"
          stroke="${colour}"
          stroke-width="${width}"
          stroke-linecap="round"
          stroke-linejoin="round"
          opacity="${opacity}"
        />
      `;
    };
    const head = rig.skull;
    const hw = Math.max(7, Number(head.width || 14) * 0.52);
    const hh = Math.max(6, Number(head.height || 12) * 0.56);
    const hx = Number(head.x);
    const hy = Number(head.y);
    const headPath = `
      M ${hx - front * hw * 0.68} ${hy - hh * 0.2}
      L ${hx - front * hw * 0.34} ${hy - hh * 1.05}
      L ${hx - front * hw * 0.03} ${hy - hh * 0.46}
      L ${hx + front * hw * 0.24} ${hy - hh * 1.12}
      L ${hx + front * hw * 0.47} ${hy - hh * 0.25}
      C ${hx + front * hw * 0.92} ${hy - hh * 0.12}, ${hx + front * hw * 0.98} ${hy + hh * 0.22}, ${hx + front * hw * 0.72} ${hy + hh * 0.34}
      C ${hx + front * hw * 0.42} ${hy + hh * 0.58}, ${hx + front * hw * 0.02} ${hy + hh * 0.52}, ${hx - front * hw * 0.48} ${hy + hh * 0.18}
      C ${hx - front * hw * 0.62} ${hy + hh * 0.02}, ${hx - front * hw * 0.68} ${hy - hh * 0.1}, ${hx - front * hw * 0.68} ${hy - hh * 0.2}
      Z
    `;
    const neckRootTop = {
      x: Number(rig.neckBase.x) - front * lineWidth * 0.48,
      y: Number(rig.neckBase.y) - bodyDepth * 0.26,
    };
    const neckRootBottom = {
      x: Number(rig.neckBase.x) + front * lineWidth * 0.64,
      y: Number(rig.neckBase.y) + bodyDepth * 0.22,
    };
    const headBackTop = {
      x: hx - front * hw * 0.66,
      y: hy - hh * 0.22,
    };
    const headBackBottom = {
      x: hx - front * hw * 0.5,
      y: hy + hh * 0.24,
    };
    const neckPath = `
      M ${neckRootTop.x} ${neckRootTop.y}
      C ${Number(rig.neckControl.x)} ${Number(rig.neckControl.y) - bodyDepth * 0.24}, ${headBackTop.x} ${headBackTop.y}, ${headBackTop.x} ${headBackTop.y}
      L ${headBackBottom.x} ${headBackBottom.y}
      C ${Number(rig.neckControl.x)} ${Number(rig.neckControl.y) + bodyDepth * 0.18}, ${neckRootBottom.x} ${neckRootBottom.y}, ${neckRootBottom.x} ${neckRootBottom.y}
      Z
    `;

    return `
      <g class="cat-feline-v2" data-cat-model="feline_v2_smooth_direct_register">
        <path d="${this.getCatTailRenderPath(rig)}" fill="none" stroke="${fill}" stroke-width="${lineWidth * 0.88}" stroke-linecap="round" stroke-linejoin="round" />
        ${limb(rig.hipJoint, rig.rearKneeFar, rig.rearHockFar, rig.rearPawFar, farFill, 0.48, lineWidth * 0.78)}
        ${limb(rig.shoulderJoint, rig.frontElbowFar, rig.frontWristFar, rig.frontPawFar, farFill, 0.48, lineWidth * 0.64)}
        <path d="${torsoPath}" fill="${fill}" stroke="none" />
        <path d="${neckPath}" fill="${fill}" stroke="none" />
        ${limb(rig.hipJoint, rig.rearKneeNear, rig.rearHockNear, rig.rearPawNear, fill, 1, lineWidth * 0.92)}
        ${limb(rig.shoulderJoint, rig.frontElbowNear, rig.frontWristNear, rig.frontPawNear, fill, 1, lineWidth * 0.74)}
        ${this.renderCatHead(rig)}
      </g>
    `;
  }

  renderFelineV27MassStudy(rig) {
    /* A clean, reference-led 2D cut-out. It uses only the card anchor/scale;
       it deliberately does not read legacy rig joints or body-length rules. */
    if (!rig?.anchor) return "";
    const s = Number(rig.cfg?.scale || 1);
    const front = Number(rig.solvedFrontSign || rig.cfg?.frontSign || 1);
    const fill = this.getCatHeadFill();
    const floor = Number(rig.anchor.y);
    const cx = Number(rig.anchor.x);
    const d = Math.max(18, 18 * s);
    const l = Math.max(48, 24 * s);
    const X = (value) => cx + front * value;
    const pt = (x, y) => `${X(x)} ${y}`;
    const body = `M ${pt(-0.88 * l, floor - 1.10 * d)}
      C ${pt(-1.02 * l, floor - 1.46 * d)}, ${pt(-0.82 * l, floor - 1.90 * d)}, ${pt(-0.50 * l, floor - 1.94 * d)}
      C ${pt(-0.12 * l, floor - 1.98 * d)}, ${pt(0.34 * l, floor - 1.98 * d)}, ${pt(0.57 * l, floor - 1.84 * d)}
      C ${pt(0.77 * l, floor - 1.70 * d)}, ${pt(0.76 * l, floor - 1.30 * d)}, ${pt(0.61 * l, floor - 1.08 * d)}
      C ${pt(0.34 * l, floor - 0.98 * d)}, ${pt(0.05 * l, floor - 1.02 * d)}, ${pt(-0.17 * l, floor - 1.12 * d)}
      C ${pt(-0.42 * l, floor - 1.23 * d)}, ${pt(-0.66 * l, floor - 1.16 * d)}, ${pt(-0.88 * l, floor - 1.10 * d)} Z`;
    const neckHead = `M ${pt(0.49 * l, floor - 1.73 * d)}
      C ${pt(0.67 * l, floor - 2.02 * d)}, ${pt(0.76 * l, floor - 2.28 * d)}, ${pt(0.82 * l, floor - 2.32 * d)}
      C ${pt(0.96 * l, floor - 2.48 * d)}, ${pt(1.12 * l, floor - 2.52 * d)}, ${pt(1.26 * l, floor - 2.44 * d)}
      L ${pt(1.30 * l, floor - 2.82 * d)} L ${pt(1.43 * l, floor - 2.48 * d)}
      L ${pt(1.55 * l, floor - 2.72 * d)} L ${pt(1.60 * l, floor - 2.38 * d)}
      C ${pt(1.82 * l, floor - 2.26 * d)}, ${pt(1.87 * l, floor - 2.06 * d)}, ${pt(1.66 * l, floor - 1.92 * d)}
      C ${pt(1.42 * l, floor - 1.79 * d)}, ${pt(1.14 * l, floor - 1.79 * d)}, ${pt(0.97 * l, floor - 1.75 * d)}
      C ${pt(0.82 * l, floor - 1.50 * d)}, ${pt(0.71 * l, floor - 1.25 * d)}, ${pt(0.61 * l, floor - 1.08 * d)} Z`;
    const farRear = `M ${pt(-0.70 * l, floor - 1.18 * d)} C ${pt(-0.88 * l, floor - 0.92 * d)}, ${pt(-0.91 * l, floor - 0.48 * d)}, ${pt(-0.80 * l, floor - 0.28 * d)}
      C ${pt(-0.70 * l, floor - 0.14 * d)}, ${pt(-0.62 * l, floor - 0.06 * d)}, ${pt(-0.52 * l, floor)}
      L ${pt(-0.38 * l, floor)} C ${pt(-0.46 * l, floor - 0.10 * d)}, ${pt(-0.55 * l, floor - 0.14 * d)}, ${pt(-0.61 * l, floor - 0.25 * d)}
      C ${pt(-0.70 * l, floor - 0.42 * d)}, ${pt(-0.62 * l, floor - 0.71 * d)}, ${pt(-0.48 * l, floor - 0.95 * d)} L ${pt(-0.42 * l, floor - 1.22 * d)} Z`;
    const nearRear = `M ${pt(-0.47 * l, floor - 1.19 * d)} C ${pt(-0.63 * l, floor - 0.91 * d)}, ${pt(-0.56 * l, floor - 0.62 * d)}, ${pt(-0.36 * l, floor - 0.43 * d)}
      C ${pt(-0.20 * l, floor - 0.28 * d)}, ${pt(-0.11 * l, floor - 0.12 * d)}, ${pt(0.04 * l, floor)}
      L ${pt(0.20 * l, floor)} C ${pt(0.08 * l, floor - 0.12 * d)}, ${pt(-0.05 * l, floor - 0.17 * d)}, ${pt(-0.19 * l, floor - 0.30 * d)}
      C ${pt(-0.37 * l, floor - 0.48 * d)}, ${pt(-0.39 * l, floor - 0.77 * d)}, ${pt(-0.24 * l, floor - 1.14 * d)} Z`;
    const farFront = `M ${pt(0.52 * l, floor - 1.15 * d)} C ${pt(0.47 * l, floor - 0.85 * d)}, ${pt(0.47 * l, floor - 0.45 * d)}, ${pt(0.54 * l, floor - 0.18 * d)}
      L ${pt(0.62 * l, floor)} L ${pt(0.76 * l, floor)} C ${pt(0.65 * l, floor - 0.16 * d)}, ${pt(0.61 * l, floor - 0.38 * d)}, ${pt(0.65 * l, floor - 0.72 * d)} L ${pt(0.72 * l, floor - 1.16 * d)} Z`;
    const nearFront = `M ${pt(0.72 * l, floor - 1.13 * d)} C ${pt(0.73 * l, floor - 0.85 * d)}, ${pt(0.83 * l, floor - 0.58 * d)}, ${pt(0.98 * l, floor - 0.32 * d)}
      L ${pt(1.16 * l, floor)} L ${pt(1.32 * l, floor)} C ${pt(1.15 * l, floor - 0.15 * d)}, ${pt(1.04 * l, floor - 0.29 * d)}, ${pt(0.95 * l, floor - 0.48 * d)}
      C ${pt(0.88 * l, floor - 0.67 * d)}, ${pt(0.90 * l, floor - 0.93 * d)}, ${pt(0.92 * l, floor - 1.16 * d)} Z`;
    const tail = `M ${pt(-0.88 * l, floor - 1.50 * d)} C ${pt(-1.23 * l, floor - 1.53 * d)}, ${pt(-1.42 * l, floor - 2.00 * d)}, ${pt(-1.39 * l, floor - 2.49 * d)} C ${pt(-1.37 * l, floor - 2.82 * d)}, ${pt(-1.45 * l, floor - 3.00 * d)}, ${pt(-1.55 * l, floor - 3.05 * d)}`;
    return `<g class="cat-feline-v27" data-cat-model="${this.getCatModel()}"><path d="${tail}" fill="none" stroke="${fill}" stroke-width="${Math.max(5, d * 0.20)}" stroke-linecap="round" />
      <path d="${farRear}" fill="${fill}"/><path d="${farFront}" fill="${fill}"/><path d="${body}" fill="${fill}"/><path d="${neckHead}" fill="${fill}"/><path d="${nearRear}" fill="${fill}"/><path d="${nearFront}" fill="${fill}"/></g>`;
  }

  renderFelineV28DomesticCutout(rig) {
    if (!rig?.anchor) return "";
    const s = Number(rig.cfg?.scale || 1);
    const front = Number(rig.solvedFrontSign || rig.cfg?.frontSign || 1);
    const fill = this.getCatHeadFill();
    const floor = Number(rig.anchor.y);
    const cx = Number(rig.anchor.x);
    const d = Math.max(18, 18 * s);
    const l = Math.max(48, 22 * s);
    const X = (v) => cx + front * v;
    const p = (x, y) => `${X(x)} ${y}`;
    // A compact domestic-cat torso: shallow back, deep chest, lifted belly.
    const body = `M ${p(-0.82*l, floor-1.12*d)} C ${p(-0.97*l, floor-1.44*d)}, ${p(-0.75*l, floor-1.87*d)}, ${p(-0.47*l, floor-1.90*d)} C ${p(-0.12*l, floor-1.94*d)}, ${p(0.30*l, floor-1.92*d)}, ${p(0.52*l, floor-1.75*d)} C ${p(0.70*l, floor-1.61*d)}, ${p(0.72*l, floor-1.27*d)}, ${p(0.58*l, floor-1.08*d)} C ${p(0.28*l, floor-0.99*d)}, ${p(0.02*l, floor-1.03*d)}, ${p(-0.19*l, floor-1.13*d)} C ${p(-0.43*l, floor-1.24*d)}, ${p(-0.66*l, floor-1.17*d)}, ${p(-0.82*l, floor-1.12*d)} Z`;
    const head = `M ${p(0.48*l, floor-1.72*d)} C ${p(0.62*l, floor-1.96*d)}, ${p(0.70*l, floor-2.17*d)}, ${p(0.80*l, floor-2.23*d)} C ${p(0.94*l, floor-2.37*d)}, ${p(1.08*l, floor-2.38*d)}, ${p(1.18*l, floor-2.31*d)} L ${p(1.20*l, floor-2.64*d)} L ${p(1.32*l, floor-2.34*d)} L ${p(1.43*l, floor-2.57*d)} L ${p(1.47*l, floor-2.29*d)} C ${p(1.61*l, floor-2.20*d)}, ${p(1.65*l, floor-2.04*d)}, ${p(1.49*l, floor-1.94*d)} C ${p(1.28*l, floor-1.81*d)}, ${p(1.04*l, floor-1.80*d)}, ${p(0.92*l, floor-1.75*d)} C ${p(0.76*l, floor-1.51*d)}, ${p(0.67*l, floor-1.25*d)}, ${p(0.58*l, floor-1.08*d)} Z`;
    const tail = `M ${p(-0.83*l, floor-1.48*d)} C ${p(-1.14*l, floor-1.54*d)}, ${p(-1.32*l, floor-1.96*d)}, ${p(-1.30*l, floor-2.42*d)} C ${p(-1.29*l, floor-2.76*d)}, ${p(-1.37*l, floor-2.93*d)}, ${p(-1.46*l, floor-2.98*d)}`;
    // Each leg is a closed, filled silhouette: broad proximal mass, slim hock,
    // and a small horizontal paw. No strokes or exposed joint circles.
    const farRear = `M ${p(-0.72*l, floor-1.16*d)} C ${p(-0.87*l, floor-0.97*d)}, ${p(-0.90*l, floor-0.62*d)}, ${p(-0.83*l, floor-0.39*d)} C ${p(-0.77*l, floor-0.20*d)}, ${p(-0.66*l, floor-0.10*d)}, ${p(-0.57*l, floor-0.05*d)} L ${p(-0.48*l, floor)} L ${p(-0.34*l, floor)} L ${p(-0.47*l, floor-0.10*d)} C ${p(-0.59*l, floor-0.18*d)}, ${p(-0.67*l, floor-0.31*d)}, ${p(-0.68*l, floor-0.47*d)} C ${p(-0.69*l, floor-0.69*d)}, ${p(-0.56*l, floor-0.90*d)}, ${p(-0.43*l, floor-1.15*d)} Z`;
    const nearRear = `M ${p(-0.46*l, floor-1.18*d)} C ${p(-0.61*l, floor-0.94*d)}, ${p(-0.55*l, floor-0.64*d)}, ${p(-0.35*l, floor-0.47*d)} C ${p(-0.18*l, floor-0.32*d)}, ${p(-0.07*l, floor-0.14*d)}, ${p(0.06*l, floor-0.05*d)} L ${p(0.22*l, floor)} L ${p(0.37*l, floor)} L ${p(0.18*l, floor-0.10*d)} C ${p(0.03*l, floor-0.17*d)}, ${p(-0.12*l, floor-0.28*d)}, ${p(-0.25*l, floor-0.41*d)} C ${p(-0.43*l, floor-0.59*d)}, ${p(-0.39*l, floor-0.86*d)}, ${p(-0.24*l, floor-1.15*d)} Z`;
    const farFront = `M ${p(0.51*l, floor-1.16*d)} C ${p(0.47*l, floor-0.90*d)}, ${p(0.47*l, floor-0.57*d)}, ${p(0.52*l, floor-0.30*d)} L ${p(0.58*l, floor-0.05*d)} L ${p(0.68*l, floor)} L ${p(0.82*l, floor)} L ${p(0.68*l, floor-0.12*d)} C ${p(0.60*l, floor-0.28*d)}, ${p(0.60*l, floor-0.55*d)}, ${p(0.69*l, floor-1.14*d)} Z`;
    const nearFront = `M ${p(0.69*l, floor-1.14*d)} C ${p(0.70*l, floor-0.88*d)}, ${p(0.80*l, floor-0.60*d)}, ${p(0.94*l, floor-0.40*d)} C ${p(1.04*l, floor-0.25*d)}, ${p(1.12*l, floor-0.11*d)}, ${p(1.24*l, floor-0.05*d)} L ${p(1.38*l, floor)} L ${p(1.54*l, floor)} L ${p(1.34*l, floor-0.11*d)} C ${p(1.19*l, floor-0.20*d)}, ${p(1.09*l, floor-0.35*d)}, ${p(1.01*l, floor-0.54*d)} C ${p(0.94*l, floor-0.74*d)}, ${p(0.95*l, floor-0.95*d)}, ${p(0.89*l, floor-1.16*d)} Z`;
    return `<g class="cat-feline-v28" data-cat-model="${this.getCatModel()}"><path d="${tail}" fill="none" stroke="${fill}" stroke-width="${Math.max(5, d*.20)}" stroke-linecap="round"/><path d="${farRear}" fill="${fill}"/><path d="${farFront}" fill="${fill}"/><path d="${body}" fill="${fill}"/><path d="${head}" fill="${fill}"/><path d="${nearRear}" fill="${fill}"/><path d="${nearFront}" fill="${fill}"/></g>`;
  }

  renderFelineV29TracedSilhouette(rig) {
    if (!rig?.anchor) return "";
    const s = Number(rig.cfg?.scale || 1) * 0.25;
    const front = Number(rig.solvedFrontSign || rig.cfg?.frontSign || 1);
    const fill = this.getCatHeadFill();
    const x = Number(rig.anchor.x);
    const y = Number(rig.anchor.y);
    const body = `M -72 -30 C -88 -43 -74 -68 -48 -69 C -12 -72 25 -71 43 -58 C 56 -51 62 -39 58 -26 C 49 -21 33 -20 17 -25 C 3 -30 -16 -27 -30 -22 C -46 -18 -61 -22 -72 -30 Z`;
    const head = `M 40 -58 C 51 -72 59 -85 67 -88 C 74 -96 86 -97 93 -92 L 95 -108 L 102 -94 L 111 -105 L 113 -91 C 125 -86 128 -77 118 -71 C 105 -63 86 -64 72 -60 C 66 -48 61 -35 58 -26 Z`;
    const tail = `M -72 -48 C -103 -50 -118 -76 -115 -106 C -114 -121 -119 -130 -126 -133`;
    const rearFar = `M -65 -28 C -77 -14 -78 -1 -72 7 C -67 13 -61 17 -55 18 L -44 18 C -54 12 -60 7 -61 0 C -63 -9 -55 -17 -45 -25 Z`;
    const rearNear = `M -43 -25 C -54 -9 -48 4 -33 12 C -24 17 -17 19 -7 20 L 5 20 C -8 14 -18 9 -27 3 C -37 -5 -34 -15 -22 -25 Z`;
    const frontFar = `M 42 -25 C 39 -9 39 6 44 15 L 54 20 L 64 20 C 54 13 51 5 53 -5 L 61 -27 Z`;
    const frontNear = `M 59 -26 C 62 -9 70 5 84 16 L 97 20 L 109 20 C 94 13 85 5 79 -7 C 75 -15 76 -22 75 -31 Z`;
    return `<g class="cat-feline-v29" transform="translate(${x} ${y}) scale(${front * s} ${s})"><path d="${tail}" fill="none" stroke="${fill}" stroke-width="8" stroke-linecap="round"/><path d="${rearFar}" fill="${fill}"/><path d="${frontFar}" fill="${fill}"/><path d="${body}" fill="${fill}"/><path d="${head}" fill="${fill}"/><path d="${rearNear}" fill="${fill}"/><path d="${frontNear}" fill="${fill}"/></g>`;
  }

  renderFelineV30ReferenceTemplate(rig) {
    if (!rig?.anchor) return "";
    const s = Number(rig.cfg?.scale || 1) * 0.40;
    const front = Number(rig.solvedFrontSign || rig.cfg?.frontSign || 1);
    const fill = this.getCatHeadFill();
    const x = Number(rig.anchor.x);
    const y = Number(rig.anchor.y);
    const studyModel = this.getCatModel();
    const refinedLegs = ["feline_v31_reference_limb_study", "feline_v32_anatomical_study", "feline_v33_jointed_pose_study", "feline_v34_filled_limb_skin", "feline_v35_proportion_study", "feline_v36_grounded_leg_study", "feline_v37_overlap_study", "feline_v38_low_neck_study", "feline_v39_articulated_limb_skin", "feline_v40_landmark_limb_skin", "feline_v41_raised_landmark_limbs"].includes(studyModel);
    // Ground is exactly local y=0. These outlines are a compact, filled
    // side-on domestic-cat template, independent of every legacy rig joint.
    const body = `M -74 -29 C -88 -42 -76 -70 -50 -72 C -17 -75 20 -73 39 -61 C 54 -52 61 -40 58 -27 C 47 -21 30 -21 14 -26 C 0 -31 -17 -29 -31 -22 C -48 -17 -63 -22 -74 -29 Z`;
    const head = ["feline_v38_low_neck_study", "feline_v39_articulated_limb_skin", "feline_v40_landmark_limb_skin", "feline_v41_raised_landmark_limbs"].includes(studyModel)
      ? `M 48 -45 C 53 -54 59 -62 66 -65 C 74 -73 82 -74 88 -70 L 90 -86 L 97 -71 L 106 -83 L 108 -70 C 117 -66 119 -59 111 -55 C 99 -50 84 -51 73 -48 C 67 -41 62 -33 58 -27 Z`
      : studyModel === "feline_v35_proportion_study"
      ? `M 46 -52 C 51 -61 56 -69 63 -72 C 70 -80 79 -81 85 -77 L 87 -94 L 94 -79 L 103 -91 L 105 -78 C 114 -74 116 -67 108 -63 C 97 -58 83 -59 73 -55 C 67 -46 62 -35 58 -27 Z`
      : studyModel === "feline_v33_jointed_pose_study"
      ? `M 43 -52 C 51 -65 58 -75 66 -79 C 74 -86 82 -87 88 -83 L 90 -99 L 97 -84 L 106 -96 L 108 -82 C 117 -78 119 -71 111 -66 C 99 -60 84 -61 73 -56 C 66 -46 61 -35 58 -27 Z`
      : studyModel === "feline_v32_anatomical_study"
      ? `M 42 -59 C 51 -72 58 -83 66 -87 C 74 -94 83 -95 89 -91 L 91 -107 L 98 -92 L 107 -104 L 109 -90 C 119 -85 121 -77 112 -72 C 100 -66 84 -67 72 -62 C 65 -50 61 -36 58 -27 Z`
      : `M 38 -61 C 51 -78 59 -91 68 -95 C 76 -104 88 -105 96 -99 L 98 -118 L 106 -100 L 116 -113 L 118 -97 C 131 -91 134 -80 122 -73 C 108 -65 88 -66 73 -62 C 66 -50 62 -36 58 -27 Z`;
    const tail = studyModel === "feline_v41_raised_landmark_limbs"
      ? `M -74 -49 C -101 -50 -112 -73 -107 -95 C -106 -105 -110 -109 -116 -111`
      : `M -74 -49 C -104 -52 -121 -79 -118 -110 C -117 -127 -122 -137 -130 -141`;
    const rearFar = `M -68 -29 C -79 -17 -78 -5 -71 -1 C -65 3 -60 5 -55 4 L -47 0 L -57 -3 C -65 -8 -65 -16 -55 -26 Z`;
    const rearNear = `M -48 -27 C -59 -12 -53 -2 -39 3 C -28 8 -18 8 -7 4 L 4 0 L -10 -1 C -23 -4 -33 -10 -32 -18 C -31 -23 -26 -27 -20 -29 Z`;
    const frontFar = `M 43 -28 C 40 -16 41 -5 46 -1 L 55 0 L 65 0 L 55 -5 C 52 -12 54 -20 62 -29 Z`;
    const frontNear = `M 61 -29 C 63 -16 72 -6 84 -2 L 99 0 L 111 0 L 95 -6 C 86 -14 80 -23 79 -32 Z`;
    const landmarkLimbStudy = ["feline_v40_landmark_limb_skin", "feline_v41_raised_landmark_limbs"].includes(studyModel);
    const v40FarLegs = landmarkLimbStudy
      ? `
        <path d="M -72 -36
          C -83 -31 -88 -21 -86 -12
          C -84 -5 -78 -1 -70 0
          L -58 0
          C -67 -5 -70 -11 -67 -18
          C -64 -25 -57 -31 -48 -34 Z" fill="${fill}" opacity="0.46"/>
        <path d="M 43 -36
          C 37 -28 36 -18 38 -10
          C 40 -3 45 -1 52 0
          L 63 0
          C 55 -5 53 -12 55 -20
          C 57 -27 61 -32 66 -36 Z" fill="${fill}" opacity="0.46"/>
      `
      : "";
    const v40NearLegs = landmarkLimbStudy
      ? `
        <path d="M -63 -50
          C -76 -43 -81 -32 -78 -22
          C -76 -14 -69 -8 -61 -4
          C -55 -1 -48 0 -40 0
          L -25 0
          C -23 0 -22 -2 -24 -3
          L -41 -10
          C -49 -14 -52 -20 -50 -27
          C -48 -35 -39 -41 -28 -44
          L -18 -47 Z" fill="${fill}"/>
        <path d="M 52 -49
          C 59 -42 62 -32 66 -23
          C 71 -14 79 -7 89 -3
          C 95 -1 102 0 109 0
          L 96 0
          C 86 -4 79 -10 74 -18
          C 69 -27 66 -37 62 -46 Z" fill="${fill}"/>
      `
      : "";
    const smoothLegs = studyModel === "feline_v39_articulated_limb_skin"
      ? `
        <path d="M -68 -29
          C -76 -24 -80 -17 -79 -11
          C -78 -5 -73 -1 -67 0
          L -56 0
          C -63 -4 -67 -8 -66 -13
          C -65 -18 -58 -23 -47 -27
          L -43 -30 Z" fill="${fill}" opacity="0.48"/>
        <path d="M 44 -29
          C 40 -23 39 -15 40 -9
          C 41 -3 45 -1 51 0
          L 61 0
          C 55 -4 52 -9 53 -15
          C 54 -21 58 -27 63 -30 Z" fill="${fill}" opacity="0.48"/>
        <path d="M -48 -28
          C -58 -22 -64 -15 -63 -9
          C -62 -3 -54 -1 -46 0
          L -29 0
          C -38 -5 -43 -9 -42 -14
          C -40 -19 -31 -24 -21 -27
          L -16 -30 Z" fill="${fill}"/>
        <path d="M 61 -30
          C 63 -23 67 -16 72 -10
          C 78 -4 85 -1 92 0
          L 108 0
          C 98 -5 92 -9 88 -15
          C 85 -21 84 -27 80 -31 Z" fill="${fill}"/>
      `
      : studyModel === "feline_v38_low_neck_study"
      ? `<path d="M -68 -29 C -78 -19 -76 -9 -68 -3 L -60 0 L -48 0 L -60 -7 C -61 -14 -54 -22 -46 -27 Z" fill="${fill}" opacity="0.48"/><path d="M 44 -29 C 42 -17 43 -7 49 -2 L 57 0 L 68 0 L 56 -8 C 54 -15 57 -23 62 -30 Z" fill="${fill}" opacity="0.48"/><path d="M -48 -28 C -60 -18 -55 -8 -42 -3 L -23 0 L -8 0 L -28 -8 C -35 -15 -31 -23 -22 -29 Z" fill="${fill}"/><path d="M 61 -30 C 63 -18 70 -8 82 -3 L 99 0 L 114 0 L 94 -8 C 85 -16 80 -25 78 -31 Z" fill="${fill}"/>`
      : studyModel === "feline_v37_overlap_study"
      ? `<path d="M -68 -29 C -78 -19 -76 -9 -68 -3 L -60 0 L -48 0 L -60 -7 C -61 -14 -54 -22 -46 -27 Z" fill="${fill}" opacity="0.48"/><path d="M 44 -29 C 42 -17 43 -7 49 -2 L 57 0 L 68 0 L 56 -8 C 54 -15 57 -23 62 -30 Z" fill="${fill}" opacity="0.48"/><path d="M -48 -28 C -60 -18 -55 -8 -42 -3 L -23 0 L -8 0 L -28 -8 C -35 -15 -31 -23 -22 -29 Z" fill="${fill}"/><path d="M 61 -30 C 63 -18 70 -8 82 -3 L 99 0 L 114 0 L 94 -8 C 85 -16 80 -25 78 -31 Z" fill="${fill}"/>`
      : studyModel === "feline_v36_grounded_leg_study"
      ? `<path d="M -68 -39 C -78 -25 -76 -10 -68 -3 L -60 0 L -48 0 L -60 -9 C -61 -20 -54 -31 -46 -38 Z" fill="${fill}"/><path d="M -48 -38 C -60 -25 -55 -10 -42 -3 L -23 0 L -8 0 L -28 -10 C -35 -20 -31 -31 -22 -39 Z" fill="${fill}"/><path d="M 44 -39 C 42 -24 43 -9 49 -2 L 57 0 L 68 0 L 56 -10 C 54 -20 57 -31 62 -40 Z" fill="${fill}"/><path d="M 61 -40 C 63 -25 70 -10 82 -3 L 99 0 L 114 0 L 94 -10 C 85 -21 80 -33 78 -41 Z" fill="${fill}"/>`
      : studyModel === "feline_v35_proportion_study"
      ? `<path d="M -68 -29 C -78 -19 -76 -9 -68 -3 L -60 0 L -48 0 L -60 -7 C -61 -14 -54 -22 -46 -27 Z" fill="${fill}"/><path d="M -48 -28 C -60 -18 -55 -8 -42 -3 L -23 0 L -8 0 L -28 -8 C -35 -15 -31 -23 -22 -29 Z" fill="${fill}"/><path d="M 44 -29 C 42 -17 43 -7 49 -2 L 57 0 L 68 0 L 56 -8 C 54 -15 57 -23 62 -30 Z" fill="${fill}"/><path d="M 61 -30 C 63 -18 70 -8 82 -3 L 99 0 L 114 0 L 94 -8 C 85 -16 80 -25 78 -31 Z" fill="${fill}"/>`
      : studyModel === "feline_v34_filled_limb_skin"
      ? `<path d="M -68 -29 C -78 -19 -77 -9 -70 -3 L -61 0 L -48 0 L -60 -7 C -62 -14 -55 -22 -46 -27 Z" fill="${fill}"/><path d="M -48 -28 C -60 -18 -57 -8 -45 -3 L -28 0 L -13 0 L -30 -8 C -37 -15 -33 -23 -22 -29 Z" fill="${fill}"/><path d="M 44 -29 C 41 -17 43 -7 49 -2 L 57 0 L 69 0 L 57 -8 C 55 -15 57 -23 63 -30 Z" fill="${fill}"/><path d="M 61 -30 C 63 -18 70 -8 81 -3 L 94 0 L 108 0 L 92 -8 C 84 -16 80 -25 79 -31 Z" fill="${fill}"/>`
      : studyModel === "feline_v33_jointed_pose_study"
      ? `<path d="M -63 -28 L -73 -14 L -66 -4 L -56 0" fill="none" stroke="${fill}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/><path d="M -43 -27 L -54 -14 L -41 -6 L -24 0 L -11 0" fill="none" stroke="${fill}" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/><path d="M 47 -28 L 44 -12 L 50 0" fill="none" stroke="${fill}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/><path d="M 62 -29 L 67 -14 L 78 -5 L 94 0" fill="none" stroke="${fill}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>`
      : studyModel === "feline_v32_anatomical_study"
      ? `<path d="M -63 -28 Q -72 -17 -66 -8 Q -62 -2 -55 0" fill="none" stroke="${fill}" stroke-width="10" stroke-linecap="round"/><path d="M -43 -27 Q -54 -15 -43 -8 Q -28 1 -13 0" fill="none" stroke="${fill}" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/><path d="M 47 -28 Q 45 -15 50 0" fill="none" stroke="${fill}" stroke-width="9" stroke-linecap="round"/><path d="M 62 -29 Q 64 -16 72 -7 Q 82 1 96 0" fill="none" stroke="${fill}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>`
      : `<path d="M -62 -28 Q -74 -15 -64 -5 Q -57 1 -48 0" fill="none" stroke="${fill}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/><path d="M -43 -27 Q -53 -15 -42 -7 Q -28 1 -14 0" fill="none" stroke="${fill}" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/><path d="M 48 -28 Q 44 -14 51 0" fill="none" stroke="${fill}" stroke-width="10" stroke-linecap="round"/><path d="M 64 -29 Q 68 -14 82 -2 L 98 0" fill="none" stroke="${fill}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>`;
    const bodyLift = studyModel === "feline_v41_raised_landmark_limbs" ? -30 : studyModel === "feline_v36_grounded_leg_study" ? -10 : 0;
    return `<g class="cat-feline-v30" transform="translate(${x} ${y}) scale(${front*s} ${s})">${landmarkLimbStudy ? v40FarLegs : refinedLegs ? smoothLegs : `<path d="${rearFar}" fill="${fill}"/><path d="${frontFar}" fill="${fill}"/>`}<g transform="translate(0 ${bodyLift})"><path d="${tail}" fill="none" stroke="${fill}" stroke-width="8" stroke-linecap="round"/><path d="${body}" fill="${fill}"/><path d="${head}" fill="${fill}"/></g>${landmarkLimbStudy ? v40NearLegs : refinedLegs ? "" : `<path d="${rearNear}" fill="${fill}"/><path d="${frontNear}" fill="${fill}"/>`}</g>`;
  }

  renderFelineV42ContinuousCutout(rig) {
    if (!rig?.anchor) return "";
    const s = Number(rig.cfg?.scale || 1) * 0.40;
    const front = Number(rig.solvedFrontSign || rig.cfg?.frontSign || 1);
    const fill = this.getCatHeadFill();
    const x = Number(rig.anchor.x);
    const y = Number(rig.anchor.y);
    // One uninterrupted near-side contour prevents the torso/limb seams that
    // made V39–V41 read as detached sticks. The negative spaces deliberately
    // mark a thigh-to-hock bend and a narrow front wrist before each paw.
    const farRear = `M -69 -50 C -81 -42 -85 -28 -81 -17 C -78 -8 -71 -2 -62 0 L -49 0 C -59 -6 -62 -13 -60 -21 C -57 -31 -49 -39 -39 -45 Z`;
    const farFront = `M 38 -52 C 32 -39 34 -23 39 -12 C 42 -5 48 -1 56 0 L 68 0 C 59 -7 57 -16 59 -26 C 61 -37 66 -45 71 -51 Z`;
    const tail = `M -75 -67 C -102 -70 -116 -93 -112 -119 C -110 -132 -114 -140 -122 -144`;
    const cutout = `
      M -76 -66
      C -88 -75 -80 -92 -53 -95
      C -18 -98 18 -96 37 -85
      C 48 -79 54 -70 59 -62
      C 63 -73 69 -81 76 -84
      C 83 -91 90 -92 96 -88
      L 98 -105 L 105 -90 L 115 -101 L 116 -88
      C 126 -83 128 -75 119 -70
      C 108 -64 91 -66 78 -62
      C 70 -56 66 -49 63 -42
      C 64 -31 69 -19 77 -10
      C 83 -4 91 -1 101 0
      L 114 0
      C 116 0 117 -2 115 -3
      L 99 -10
      C 91 -16 85 -25 82 -35
      C 78 -41 72 -43 63 -42
      C 50 -37 34 -36 17 -42
      C 3 -47 -12 -47 -26 -41
      C -38 -36 -45 -27 -43 -18
      C -41 -9 -33 -3 -23 -1
      L -8 0
      C -6 0 -5 -2 -7 -3
      L -24 -10
      C -32 -15 -35 -22 -32 -29
      C -28 -36 -20 -40 -11 -43
      C -29 -45 -46 -42 -58 -35
      C -69 -30 -78 -38 -80 -48
      C -82 -56 -80 -62 -76 -66 Z`;
    const overlayLimbs = this.getCatModel() === "feline_v43_overlay_limb_skins"
      ? `
        <path d="M -69 -78
          C -82 -63 -84 -45 -78 -30
          C -74 -20 -67 -10 -58 -4
          C -52 -1 -46 0 -38 0
          L -24 0
          C -22 0 -21 -2 -24 -4
          L -42 -13
          C -50 -19 -52 -28 -48 -37
          C -44 -46 -34 -52 -20 -56
          C -37 -61 -55 -70 -69 -78 Z" fill="${fill}"/>
        <path d="M 49 -71
          C 59 -58 62 -44 66 -31
          C 70 -19 79 -9 90 -4
          C 97 -1 104 0 113 0
          L 98 0
          C 87 -5 79 -14 74 -25
          C 69 -38 66 -54 60 -68 Z" fill="${fill}"/>
      `
      : "";
    return `<g class="cat-feline-v42" transform="translate(${x} ${y}) scale(${front * s} ${s})"><path d="${tail}" fill="none" stroke="${fill}" stroke-width="11" stroke-linecap="round"/><path d="${farRear}" fill="${fill}" opacity="0.46"/><path d="${farFront}" fill="${fill}" opacity="0.46"/><path d="${cutout}" fill="${fill}"/>${overlayLimbs}</g>`;
  }

  renderFelineV44ReferenceTrace(rig) {
    if (!rig?.anchor) return "";
    const s = Number(rig.cfg?.scale || 1) * 0.40;
    const front = Number(rig.solvedFrontSign || rig.cfg?.frontSign || 1);
    const fill = this.getCatHeadFill();
    const x = Number(rig.anchor.x);
    const y = Number(rig.anchor.y);

    // Clean-room static trace. These coordinates are deliberately authored as
    // silhouette landmarks, rather than derived from the legacy body solver.
    // The near skin contains the torso/head plus the visible haunch and
    // foreleg. Far legs remain behind it solely to establish depth.
    const tail = `M -72 -62 C -99 -65 -114 -90 -111 -117 C -110 -134 -116 -145 -124 -149`;
    const farHind = `M -66 -45 C -77 -38 -80 -27 -77 -17 C -74 -8 -68 -2 -60 0 L -48 0 C -57 -6 -60 -14 -57 -23 C -54 -32 -47 -39 -38 -44 Z`;
    const farFront = `M 36 -46 C 31 -34 32 -21 37 -11 C 41 -4 47 -1 55 0 L 67 0 C 58 -7 56 -16 58 -26 C 60 -35 64 -42 69 -47 Z`;
    const nearSilhouette = `
      M -74 -57
      C -86 -64 -78 -82 -54 -85
      C -20 -89 16 -87 35 -76
      C 47 -69 53 -59 58 -48
      C 63 -59 69 -67 76 -70
      C 82 -77 89 -78 95 -74
      L 97 -91 L 104 -76 L 113 -88 L 115 -75
      C 125 -70 127 -62 118 -57
      C 107 -51 90 -53 77 -49
      C 69 -43 65 -36 61 -29
      C 62 -20 68 -12 76 -7
      C 82 -3 89 -1 97 0
      L 109 0
      C 111 0 112 -2 110 -3
      L 94 -10
      C 86 -17 81 -27 79 -37
      C 75 -43 69 -46 61 -44
      C 49 -39 34 -39 18 -44
      C 4 -49 -10 -48 -22 -43
      C -34 -38 -42 -30 -42 -22
      C -42 -14 -36 -7 -28 -3
      C -23 -1 -18 0 -12 0
      L 1 0
      C 3 0 4 -2 2 -3
      L -15 -10
      C -23 -15 -27 -22 -24 -30
      C -21 -36 -13 -40 -4 -43
      C -21 -46 -39 -43 -52 -36
      C -64 -31 -73 -37 -77 -47
      C -80 -53 -78 -56 -74 -57 Z`;
    return `<g class="cat-feline-v44" transform="translate(${x} ${y}) scale(${front * s} ${s})"><path d="${tail}" fill="none" stroke="${fill}" stroke-width="11" stroke-linecap="round"/><path d="${farHind}" fill="${fill}" opacity="0.48"/><path d="${farFront}" fill="${fill}" opacity="0.48"/><path d="${nearSilhouette}" fill="${fill}"/></g>`;
  }

  getFelineV45Landmarks() {
    return {
      hip: { x: -51, y: -69 }, knee: { x: -61, y: -36 }, hock: { x: -47, y: -12 }, rearPaw: { x: -14, y: 0 },
      shoulder: { x: 48, y: -67 }, elbow: { x: 61, y: -37 }, wrist: { x: 77, y: -12 }, frontPaw: { x: 109, y: 0 },
      tailBase: { x: -73, y: -79 }, neckBase: { x: 55, y: -67 }, skull: { x: 88, y: -84 },
    };
  }

  renderFelineV45ElevatedProfile(rig) {
    if (!rig?.anchor) return "";
    const s = Number(rig.cfg?.scale || 1) * 0.40;
    const front = Number(rig.solvedFrontSign || rig.cfg?.frontSign || 1);
    const fill = this.getCatHeadFill();
    const x = Number(rig.anchor.x);
    const y = Number(rig.anchor.y);
    const marks = this.getFelineV45Landmarks();
    // This profile is intentionally elevated: torso depth and leg support
    // height are independent. It is a static, reference-like drawing with
    // four complete limb contours, not a reskin of a solved stick rig.
    const tail = `M ${marks.tailBase.x} ${marks.tailBase.y} C -101 -83 -117 -107 -113 -132 C -111 -146 -117 -156 -126 -160`;
    const farHind = `M -64 -67 C -77 -60 -82 -47 -79 -35 C -76 -23 -70 -11 -62 -4 C -57 -1 -52 0 -46 0 L -35 0 C -33 0 -32 -2 -34 -4 L -48 -13 C -55 -20 -57 -29 -54 -39 C -51 -51 -43 -60 -33 -66 Z`;
    const farFront = `M 34 -65 C 29 -51 31 -35 37 -21 C 42 -10 49 -3 58 0 L 70 0 C 61 -8 59 -19 61 -30 C 63 -44 67 -55 73 -65 Z`;
    const nearHind = `M -51 -72 C -65 -63 -70 -48 -66 -35 C -63 -23 -55 -12 -45 -5 C -38 -1 -31 0 -22 0 L -8 0 C -6 0 -5 -2 -7 -4 L -25 -13 C -34 -19 -38 -28 -35 -38 C -32 -49 -23 -59 -12 -65 C -27 -67 -41 -70 -51 -72 Z`;
    const nearFront = `M 51 -70 C 56 -54 62 -37 70 -24 C 78 -11 88 -4 100 0 L 113 0 C 115 0 116 -2 114 -4 L 98 -12 C 88 -20 82 -31 79 -44 C 76 -56 70 -65 62 -70 Z`;
    const torsoAndHead = `
      M -74 -78
      C -86 -85 -78 -103 -53 -106
      C -18 -110 16 -108 36 -96
      C 47 -90 54 -80 59 -69
      C 63 -80 69 -88 76 -91
      C 82 -98 90 -99 96 -95
      L 98 -113 L 105 -97 L 114 -109 L 116 -96
      C 126 -91 129 -82 120 -77
      C 108 -71 91 -73 78 -68
      C 69 -62 65 -54 61 -48
      C 49 -53 34 -53 18 -58
      C 2 -63 -12 -62 -26 -56
      C -43 -49 -60 -57 -72 -68
      C -77 -72 -78 -76 -74 -78 Z`;
    return `<g class="cat-feline-v45" transform="translate(${x} ${y}) scale(${front * s} ${s})"><path d="${tail}" fill="none" stroke="${fill}" stroke-width="11" stroke-linecap="round"/><path d="${farHind}" fill="${fill}" opacity="0.58"/><path d="${farFront}" fill="${fill}" opacity="0.58"/><path d="${torsoAndHead}" fill="${fill}"/><path d="${nearHind}" fill="${fill}"/><path d="${nearFront}" fill="${fill}"/></g>`;
  }

  renderFelineV46ImageTracedWalk(rig) {
    if (!rig?.anchor) return "";
    const s = Number(rig.cfg?.scale || 1) * 0.40;
    const front = Number(rig.solvedFrontSign || rig.cfg?.frontSign || 1);
    const fill = this.getCatHeadFill();
    const x = Number(rig.anchor.x);
    const y = Number(rig.anchor.y);
    // Directly traced from the supplied simple walking-cat reference. These
    // paths intentionally use screen silhouette landmarks, not solver output.
    const tail = `M -73 -104 C -96 -106 -108 -131 -106 -161 C -104 -181 -110 -196 -117 -203`;
    const farHind = `M -65 -94 C -79 -83 -83 -66 -78 -51 L -74 -33 C -72 -19 -65 -7 -56 0 L -45 0 C -43 0 -42 -2 -44 -4 L -55 -14 C -62 -23 -64 -34 -60 -46 C -56 -60 -49 -71 -38 -80 Z`;
    const nearHind = `M -49 -86 C -59 -72 -59 -57 -52 -43 C -44 -29 -32 -14 -18 -5 C -12 -2 -6 0 2 0 L 14 0 C 16 0 17 -2 15 -4 L -3 -12 C -15 -19 -23 -29 -25 -40 C -27 -52 -20 -63 -10 -73 C -24 -78 -38 -83 -49 -86 Z`;
    const farFront = `M 45 -82 C 41 -64 42 -47 48 -31 C 52 -18 58 -7 67 0 L 78 0 C 80 0 81 -2 79 -4 L 68 -14 C 62 -27 62 -40 66 -54 C 69 -67 73 -76 78 -83 Z`;
    const nearFront = `M 64 -83 C 66 -64 74 -45 85 -30 C 94 -17 105 -7 118 -2 L 131 0 L 143 0 C 145 0 146 -2 144 -4 L 126 -11 C 115 -20 107 -31 102 -44 C 97 -60 91 -75 81 -84 Z`;
    const bodyAndHead = `
      M -74 -106
      C -87 -119 -76 -137 -53 -140
      C -21 -143 19 -140 35 -131
      C 48 -122 55 -109 60 -94
      C 65 -112 73 -129 82 -138
      C 87 -148 92 -154 98 -151
      L 100 -169 L 106 -154 L 114 -161 L 116 -149
      C 127 -146 131 -137 124 -131
      C 116 -124 102 -123 92 -120
      C 81 -109 75 -96 69 -79
      C 57 -76 43 -77 27 -84
      C 11 -92 -7 -92 -22 -86
      C -35 -81 -48 -83 -60 -92
      C -71 -97 -79 -101 -74 -106 Z`;
    return `<g class="cat-feline-v46" transform="translate(${x} ${y}) scale(${front * s} ${s})"><path d="${tail}" fill="none" stroke="${fill}" stroke-width="12" stroke-linecap="round"/><path d="${farHind}" fill="${fill}" opacity="0.72"/><path d="${farFront}" fill="${fill}" opacity="0.72"/><path d="${bodyAndHead}" fill="${fill}"/><path d="${nearHind}" fill="${fill}"/><path d="${nearFront}" fill="${fill}"/></g>`;
  }

  getFelineV47TraceLandmarks() {
    // These pivots are selected from the *visible limb contour runs* in V49.
    // Do not substitute generic skeleton positions here: the first V57 pass
    // did that for the near rear leg and attached it inside the rump instead
    // of at the actual belly-side leg root.
    return {
      tailBase: { x: -68, y: -121 },
      hip: { x: -12, y: -62 }, knee: { x: -22, y: -58 }, hock: { x: -41, y: -35 }, rearPaw: { x: -18, y: 0 },
      farHip: { x: -73, y: -104 }, farKnee: { x: -73, y: -61 }, farHock: { x: -76, y: -55 }, farRearPaw: { x: -73, y: 0 },
      shoulder: { x: 83, y: -111 }, elbow: { x: 78, y: -77 }, wrist: { x: 57, y: -47 }, frontPaw: { x: 71, y: 0 },
      farShoulder: { x: 33, y: -54 }, farElbow: { x: 30, y: -42 }, farWrist: { x: 26, y: -20 }, farFrontPaw: { x: 23, y: 0 },
      neckBase: { x: 48, y: -123 }, skull: { x: 89, y: -154 },
    };
  }

  getFelineV49TraceContourChains() {
    // Ordered samples from the exact V49 outline. This is deliberately more
    // detailed than the articulation pivots: it preserves the contour shape
    // required to skin a posed limb rather than turning it into a tube.
    return {
      nearRear: [[-12, -62], [-22, -58], [-41, -35], [-41, -26], [-37, -15], [-32, -9], [-23, -3], [-18, 0]],
      farRear: [[-73, -104], [-73, -61], [-72, -58], [-76, -55], [-77, -45], [-82, -13], [-76, -2], [-73, 0]],
      nearFront: [[83, -111], [78, -77], [70, -63], [60, -49], [57, -47], [58, -35], [71, 0]],
      farFront: [[33, -54], [30, -42], [30, -32], [26, -20], [23, -7], [23, 0]],
    };
  }

  renderFelineV47ReferenceBoundary(rig) {
    if (!rig?.anchor) return "";
    const softened = this.getCatModel() === "feline_v48_soft_reference_trace_static";
    const s = Number(rig.cfg?.scale || 1) * (softened ? 0.31 : 0.36);
    const front = Number(rig.solvedFrontSign || rig.cfg?.frontSign || 1);
    const fill = this.getCatHeadFill();
    const x = Number(rig.anchor.x);
    const y = Number(rig.anchor.y);
    // Pixel-traced from the user-supplied walking-cat reference, then
    // simplified from 1,422 raster-edge points to 61 boundary landmarks.
    // It is purposely a single static silhouette: this is the visual source
    // of truth before any pose deformation is introduced.
    const boundary = `
      M -106 -217 L -98 -212 L -94 -204 L -92 -168 L -87 -149 L -78 -133
      L -79 -129 L -68 -121 L 5 -123 L 40 -118 L 48 -123 L 74 -169
      L 78 -168 L 78 -154 L 83 -152 L 89 -157 L 90 -149 L 96 -146
      L 102 -135 L 109 -133 L 104 -120 L 92 -112 L 83 -111 L 78 -77
      L 57 -47 L 58 -35 L 71 0 L 57 0 L 46 -23 L 38 -11 L 33 -10
      L 32 0 L 23 0 L 33 -54 L 13 -54 L -12 -62 L -22 -58
      L -41 -35 L -37 -15 L -18 0 L -39 0 L -44 -6 L -41 -9
      L -45 -7 L -58 -22 L -60 -38 L -64 -37 L -70 -26 L -68 -11
      L -62 -10 L -61 0 L -76 -2 L -82 -13 L -86 -34 L -77 -45
      L -70 -67 L -73 -104 L -85 -113 L -100 -140 L -103 -155
      L -103 -212 Z`;
    return `<g class="cat-feline-v47" transform="translate(${x} ${y}) scale(${front * s} ${s})"><path d="${boundary}" fill="${fill}" ${softened ? `stroke="${fill}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"` : ""}/></g>`;
  }

  renderFelineV49HighResolutionTrace(rig) {
    if (!rig?.anchor) return "";
    const s = Number(rig.cfg?.scale || 1) * 0.27;
    const front = Number(rig.solvedFrontSign || rig.cfg?.frontSign || 1);
    const fill = this.getCatHeadFill();
    const x = Number(rig.anchor.x);
    const y = Number(rig.anchor.y);
    const landmarks = this.getFelineV47TraceLandmarks();
    const contours = this.getFelineV49TraceContourChains();
    const showTraceLabels = this.bool(this.c.show_cat_debug_labels);
    // Same supplied reference, now retained at 105 contour landmarks (RDP
    // epsilon 1.4px) so tail, hock, wrist, and paw contours survive card scale.
    const boundary = `M -106 -217 L -98 -212 -94 -204 -92 -168 -87 -149 -78 -133 -79 -129 -76 -129 -73 -124 -68 -121 -47 -120 -41 -122 -24 -121 -28 -123 5 -123 12 -120 40 -118 48 -123 56 -140 60 -142 70 -166 74 -169 78 -168 78 -154 83 -152 86 -157 89 -157 90 -149 96 -146 102 -135 109 -133 109 -127 104 -120 92 -112 83 -111 78 -77 70 -63 66 -58 64 -59 60 -49 57 -47 58 -35 71 0 57 0 56 -5 54 -5 49 -12 50 -19 46 -23 41 -19 39 -13 37 -13 38 -11 33 -10 32 0 23 0 23 -7 26 -12 26 -20 30 -32 30 -42 33 -46 33 -54 13 -54 -1 -60 -12 -62 -22 -58 -41 -35 -41 -26 -37 -15 -35 -15 -32 -9 -23 -3 -19 -3 -18 0 -39 0 -44 -6 -41 -9 -45 -7 -46 -11 -58 -22 -60 -38 -64 -37 -64 -34 -69 -31 -68 -28 -70 -26 -68 -11 -62 -10 -61 0 -73 0 -76 -2 -82 -13 -86 -34 -80 -39 -77 -45 -76 -55 -72 -58 -73 -61 -70 -67 -73 -104 -85 -113 -100 -140 -103 -155 -103 -212 Z`;
    const landmarkDebug = this.bool(this.c.show_cat_debug)
      ? `
        <g class="cat-trace-landmarks" fill="none" stroke="#ffb300" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="${contours.nearRear.map(([px, py]) => `${px},${py}`).join(" ")}" stroke="#00acc1" stroke-width="2.1"/>
          <polyline points="${contours.nearFront.map(([px, py]) => `${px},${py}`).join(" ")}" stroke="#00acc1" stroke-width="2.1"/>
          <polyline points="${contours.farRear.map(([px, py]) => `${px},${py}`).join(" ")}" stroke="#90a4ae" stroke-width="2.1" stroke-dasharray="4 3"/>
          <polyline points="${contours.farFront.map(([px, py]) => `${px},${py}`).join(" ")}" stroke="#90a4ae" stroke-width="2.1" stroke-dasharray="4 3"/>
          <polyline points="${landmarks.hip.x},${landmarks.hip.y} ${landmarks.knee.x},${landmarks.knee.y} ${landmarks.hock.x},${landmarks.hock.y} ${landmarks.rearPaw.x},${landmarks.rearPaw.y}"/>
          <polyline points="${landmarks.shoulder.x},${landmarks.shoulder.y} ${landmarks.elbow.x},${landmarks.elbow.y} ${landmarks.wrist.x},${landmarks.wrist.y} ${landmarks.frontPaw.x},${landmarks.frontPaw.y}"/>
          <polyline points="${landmarks.farHip.x},${landmarks.farHip.y} ${landmarks.farKnee.x},${landmarks.farKnee.y} ${landmarks.farHock.x},${landmarks.farHock.y} ${landmarks.farRearPaw.x},${landmarks.farRearPaw.y}" stroke="#90a4ae" stroke-dasharray="4 3"/>
          <polyline points="${landmarks.farShoulder.x},${landmarks.farShoulder.y} ${landmarks.farElbow.x},${landmarks.farElbow.y} ${landmarks.farWrist.x},${landmarks.farWrist.y} ${landmarks.farFrontPaw.x},${landmarks.farFrontPaw.y}" stroke="#90a4ae" stroke-dasharray="4 3"/>
          <path d="M ${landmarks.tailBase.x} ${landmarks.tailBase.y} L ${landmarks.neckBase.x} ${landmarks.neckBase.y}" stroke="#4fc3f7" stroke-dasharray="4 3"/>
          ${Object.entries(landmarks).map(([name, point]) => `<g><circle cx="${point.x}" cy="${point.y}" r="4.2" fill="#fff"/><circle cx="${point.x}" cy="${point.y}" r="2.1" fill="#ffb300" stroke="none"/>${showTraceLabels ? `<text x="${point.x + 5}" y="${point.y - 5}" fill="#ffb300" stroke="none" font-size="8" font-family="sans-serif">${name}</text>` : ""}</g>`).join("")}
        </g>`
      : "";
    return `<g class="cat-feline-v49" transform="translate(${x} ${y}) scale(${front * s} ${s})"><path d="${boundary}" fill="${fill}" stroke="${fill}" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/>${landmarkDebug}</g>`;
  }

  renderFelineV50TraceLayerRig(rig) {
    if (!rig?.anchor) return "";
    const s = Number(rig.cfg?.scale || 1) * 0.27;
    const front = Number(rig.solvedFrontSign || rig.cfg?.frontSign || 1);
    const fill = this.getCatHeadFill();
    const x = Number(rig.anchor.x);
    const y = Number(rig.anchor.y);
    const pose = this.getCurrentCatPose();
    const isolateLimbs = ["feline_v51_trace_limb_rig", "feline_v52_trace_limb_reach_test"].includes(this.getCatModel());
    const strongLimbTest = this.getCatModel() === "feline_v52_trace_limb_reach_test";
    const boundary = `M -106 -217 L -98 -212 -94 -204 -92 -168 -87 -149 -78 -133 -79 -129 -76 -129 -73 -124 -68 -121 -47 -120 -41 -122 -24 -121 -28 -123 5 -123 12 -120 40 -118 48 -123 56 -140 60 -142 70 -166 74 -169 78 -168 78 -154 83 -152 86 -157 89 -157 90 -149 96 -146 102 -135 109 -133 109 -127 104 -120 92 -112 83 -111 78 -77 70 -63 66 -58 64 -59 60 -49 57 -47 58 -35 71 0 57 0 56 -5 54 -5 49 -12 50 -19 46 -23 41 -19 39 -13 37 -13 38 -11 33 -10 32 0 23 0 23 -7 26 -12 26 -20 30 -32 30 -42 33 -46 33 -54 13 -54 -1 -60 -12 -62 -22 -58 -41 -35 -41 -26 -37 -15 -35 -15 -32 -9 -23 -3 -19 -3 -18 0 -39 0 -44 -6 -41 -9 -45 -7 -46 -11 -58 -22 -60 -38 -64 -37 -64 -34 -69 -31 -68 -28 -70 -26 -68 -11 -62 -10 -61 0 -73 0 -76 -2 -82 -13 -86 -34 -80 -39 -77 -45 -76 -55 -72 -58 -73 -61 -70 -67 -73 -104 -85 -113 -100 -140 -103 -155 -103 -212 Z`;
    // V49 is the approved visual baseline. Until each traced contour has a
    // matching deformable skin, clipped whole-silhouette transforms produce
    // exposed seams at the neck and legs. Keep normal card output on the
    // clean baseline; the old transform experiment is opt-in only.
    if (pose === "stand" || !this.bool(this.c.cat_trace_experimental_pose)) {
      return `<g class="cat-feline-v50" transform="translate(${x} ${y}) scale(${front * s} ${s})"><path d="${boundary}" fill="${fill}" stroke="${fill}" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/></g>`;
    }
    const suffix = String(this._instanceId || "trace").replace(/[^a-z0-9_-]/gi, "") || "trace";
    const ids = { body: `trace-body-${suffix}`, head: `trace-head-${suffix}`, tail: `trace-tail-${suffix}` };
    const poseValues = pose === "alert"
      ? { head: -5, tail: -12, headY: -2, rear: 0, front: 0 }
      : pose === "stretch"
      ? { head: 3, tail: 10, headY: 2, rear: strongLimbTest ? -12 : -4, front: strongLimbTest ? 18 : 6 }
      : { head: 0, tail: 6, headY: 0, rear: 0, front: 0 };
    const tracedPath = `<path d="${boundary}" fill="${fill}" stroke="${fill}" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/>`;
    const bodyAndLimbLayers = isolateLimbs
      ? `<g clip-path="url(#${ids.body})">${tracedPath}</g>
         <g clip-path="url(#${ids.rear})"><g transform="rotate(${poseValues.rear} -64 -54)">${tracedPath}</g></g>
         <g clip-path="url(#${ids.front})"><g transform="rotate(${poseValues.front} 48 -54)">${tracedPath}</g></g>`
      : `<g clip-path="url(#${ids.body})">${tracedPath}</g>`;
    return `<g class="cat-feline-v50" transform="translate(${x} ${y}) scale(${front * s} ${s})">
      <defs>
        <clipPath id="${ids.body}"><rect x="-87" y="-126" width="147" height="${isolateLimbs ? 73 : 128}"/></clipPath>
        <clipPath id="${ids.head}"><rect x="54" y="-177" width="62" height="128"/></clipPath>
        <clipPath id="${ids.tail}"><rect x="-110" y="-220" width="51" height="108"/></clipPath>
        <clipPath id="${ids.rear}"><rect x="-90" y="-73" width="113" height="75"/></clipPath>
        <clipPath id="${ids.front}"><rect x="20" y="-73" width="62" height="75"/></clipPath>
      </defs>
      ${bodyAndLimbLayers}
      <g clip-path="url(#${ids.tail})" transform="rotate(${poseValues.tail} -68 -121)">${tracedPath}</g>
      <g clip-path="url(#${ids.head})" transform="rotate(${poseValues.head} 57 -121) translate(0 ${poseValues.headY})">${tracedPath}</g>
    </g>`;
  }

  renderFelineV53TraceLimbSkins(rig) {
    if (!rig?.anchor) return "";
    if (this.getCurrentCatPose() === "stand") return this.renderFelineV49HighResolutionTrace(rig);
    const s = Number(rig.cfg?.scale || 1) * 0.27;
    const front = Number(rig.solvedFrontSign || rig.cfg?.frontSign || 1);
    const fill = this.getCatHeadFill();
    const x = Number(rig.anchor.x);
    const y = Number(rig.anchor.y);
    const pose = this.getCurrentCatPose();
    const stretch = pose === "stretch";
    const overlapSkins = this.getCatModel() === "feline_v54_overlapped_limb_skins";
    // The torso is a traced upper shell. The legs below are independent skins
    // whose outer contours originate at V49's observed contact points.
    const torso = `M -106 -217 L -98 -212 -94 -204 -92 -168 -87 -149 -78 -133 -79 -129 -76 -129 -73 -124 -68 -121 -47 -120 -41 -122 -24 -121 -28 -123 5 -123 12 -120 40 -118 48 -123 56 -140 60 -142 70 -166 74 -169 78 -168 78 -154 83 -152 86 -157 89 -157 90 -149 96 -146 102 -135 109 -133 109 -127 104 -120 92 -112 83 -111 78 -77 70 -63 66 -58 64 -59 60 -49 57 -47 33 -54 13 -54 -1 -60 -12 -62 -22 -58 -41 -35 -60 -38 -73 -61 -73 -104 -85 -113 -100 -140 -103 -155 -103 -212 Z`;
    const farRear = `M -73 -104 L -70 -67 -68 -28 -70 -26 -68 -11 -62 -10 -61 0 -73 0 -76 -2 -82 -13 -86 -34 -80 -39 -77 -45 -76 -55 -72 -58 -73 -61 Z`;
    const farFront = `M 33 -54 L 32 0 L 23 0 L 23 -7 L 26 -12 L 26 -20 L 30 -32 L 30 -42 Z`;
    const nearRear = `M -41 -35 C -42 -25 -37 -15 -28 -8 C -21 -3 -12 -1 -3 0 L 10 0 C 12 0 13 -2 11 -4 L -6 -12 C -16 -19 -22 -29 -22 -38 C -22 -47 -16 -52 -7 -55 L 13 -54 C -5 -60 -24 -57 -41 -48 Z`;
    const nearFront = `M 57 -47 C 58 -35 63 -22 70 -12 C 77 -4 86 -1 97 0 L 110 0 C 112 0 113 -2 111 -4 L 95 -12 C 85 -20 79 -31 76 -41 C 71 -47 65 -49 57 -47 Z`;
    const rootSkins = overlapSkins
      ? `<path d="M -61 -69 C -48 -66 -30 -61 -15 -54 C -25 -45 -39 -42 -52 -47 C -60 -52 -64 -61 -61 -69 Z" fill="${fill}"/><path d="M 43 -67 C 56 -65 68 -58 76 -47 C 69 -42 61 -41 53 -46 C 47 -51 43 -58 43 -67 Z" fill="${fill}"/>`
      : "";
    const rearTransform = stretch ? "rotate(-10 -41 -47)" : "";
    const frontTransform = stretch ? "rotate(14 57 -47)" : "";
    return `<g class="cat-feline-v53" transform="translate(${x} ${y}) scale(${front * s} ${s})"><path d="${torso}" fill="${fill}" stroke="${fill}" stroke-width="1.5" stroke-linejoin="round"/><path d="${farRear}" fill="${fill}" opacity="0.72"/><path d="${farFront}" fill="${fill}" opacity="0.72"/><g transform="${rearTransform}"><path d="${nearRear}" fill="${fill}"/></g><g transform="${frontTransform}"><path d="${nearFront}" fill="${fill}"/></g>${rootSkins}</g>`;
  }

  renderFelineV55SegmentedLimbSkins(rig) {
    if (!rig?.anchor) return "";
    if (this.getCurrentCatPose() === "stand") return this.renderFelineV49HighResolutionTrace(rig);
    const s = Number(rig.cfg?.scale || 1) * 0.27;
    const front = Number(rig.solvedFrontSign || rig.cfg?.frontSign || 1);
    const fill = this.getCatHeadFill();
    const x = Number(rig.anchor.x);
    const y = Number(rig.anchor.y);
    const stretch = this.getCurrentCatPose() === "stretch";
    const liftedBelly = this.getCatModel() === "feline_v56_lifted_belly_limb_study";
    const fourChain = this.getCatModel() === "feline_v57_four_chain_limb_study";
    const torsoLower = liftedBelly
      ? `70 -68 60 -64 51 -64 40 -67 25 -67 10 -71 -4 -74 -17 -71 -30 -65 -43 -55 -60 -50`
      : `70 -63 66 -58 64 -59 60 -49 57 -47 33 -54 13 -54 -1 -60 -12 -62 -22 -58 -41 -35 -60 -38`;
    const torso = `M -106 -217 L -98 -212 -94 -204 -92 -168 -87 -149 -78 -133 -79 -129 -76 -129 -73 -124 -68 -121 -47 -120 -41 -122 -24 -121 -28 -123 5 -123 12 -120 40 -118 48 -123 56 -140 60 -142 70 -166 74 -169 78 -168 78 -154 83 -152 86 -157 89 -157 90 -149 96 -146 102 -135 109 -133 109 -127 104 -120 92 -112 83 -111 78 -77 ${torsoLower} -73 -61 -73 -104 -85 -113 -100 -140 -103 -155 -103 -212 Z`;
    const farRear = `M -73 -104 L -70 -67 -68 -28 -70 -26 -68 -11 -62 -10 -61 0 -73 0 -76 -2 -82 -13 -86 -34 -80 -39 -77 -45 -76 -55 -72 -58 -73 -61 Z`;
    const farFront = `M 33 -54 L 32 0 L 23 0 L 23 -7 L 26 -12 L 26 -20 L 30 -32 L 30 -42 Z`;
    // The far limbs must come from the same traced contour as the approved
    // V49 silhouette. The earlier V57 test invented rounded, vertical pieces
    // here; it proved the layer order but visibly stopped being a cat leg.
    // These are the actual rear/front far-leg boundary runs from that trace.
    const farChains = fourChain
      ? `<g opacity="0.58"><path d="${farRear}" fill="${fill}"/><path d="${farFront}" fill="${fill}"/></g>`
      : `<path d="${farRear}" fill="${fill}" opacity="0.65"/><path d="${farFront}" fill="${fill}" opacity="0.65"/>`;
    const rearUpper = stretch
      ? `M -60 -68 C -69 -58 -72 -44 -67 -32 C -64 -25 -58 -21 -50 -20 L -39 -26 C -46 -34 -47 -43 -43 -52 C -38 -61 -30 -66 -20 -67 C -36 -71 -50 -72 -60 -68 Z`
      : `M -60 -68 C -67 -57 -67 -44 -61 -33 C -56 -25 -50 -21 -42 -20 L -32 -26 C -38 -34 -39 -43 -35 -52 C -30 -61 -22 -65 -12 -66 C -30 -70 -48 -72 -60 -68 Z`;
    const rearLower = stretch
      ? `M -51 -24 C -48 -16 -42 -9 -33 -4 L -20 0 L -6 0 C -4 0 -3 -2 -5 -4 L -22 -12 C -31 -18 -35 -25 -37 -32 L -45 -31 Z`
      : `M -43 -24 C -39 -16 -32 -9 -23 -4 L -10 0 L 4 0 C 6 0 7 -2 5 -4 L -12 -12 C -21 -18 -26 -25 -29 -32 L -37 -31 Z`;
    const frontUpper = stretch
      ? `M 51 -66 C 55 -52 61 -38 69 -26 L 79 -20 C 76 -34 73 -48 67 -61 C 63 -66 58 -68 51 -66 Z`
      : `M 51 -66 C 54 -52 59 -38 66 -27 L 75 -21 C 73 -34 70 -49 65 -61 C 61 -66 56 -68 51 -66 Z`;
    const frontLower = stretch
      ? `M 69 -27 C 78 -17 88 -8 100 -3 L 115 0 L 128 0 C 130 0 131 -2 129 -4 L 111 -11 C 100 -19 91 -27 82 -34 L 75 -33 Z`
      : `M 66 -27 C 74 -17 83 -8 95 -3 L 109 0 L 122 0 C 124 0 125 -2 123 -4 L 106 -11 C 96 -19 88 -27 79 -34 L 72 -33 Z`;
    const caps = `<path d="M -61 -70 C -47 -68 -30 -62 -16 -54 C -27 -46 -41 -44 -53 -49 C -60 -54 -64 -63 -61 -70 Z" fill="${fill}"/><path d="M 43 -68 C 56 -66 68 -59 76 -48 C 69 -43 61 -42 53 -47 C 47 -52 43 -59 43 -68 Z" fill="${fill}"/>`;
    return `<g class="cat-feline-v55" transform="translate(${x} ${y}) scale(${front * s} ${s})">${farChains}<path d="${torso}" fill="${fill}" stroke="${fill}" stroke-width="1.5" stroke-linejoin="round"/><path d="${rearUpper}" fill="${fill}"/><path d="${rearLower}" fill="${fill}"/><path d="${frontUpper}" fill="${fill}"/><path d="${frontLower}" fill="${fill}"/>${caps}</g>`;
  }

  renderFelineV58TracedContourLayers(rig) {
    /*
      The first usable poseable construction: the exact V49 silhouette is
      separated into far limbs, an upper body shell, and near limbs. All
      visible outer-edge points remain V49 source data. The final outline is
      drawn over the composition as an invariant neutral-pose contract.
    */
    if (!rig?.anchor) return "";
    const s = Number(rig.cfg?.scale || 1) * 0.27;
    const front = Number(rig.solvedFrontSign || rig.cfg?.frontSign || 1);
    const fill = this.getCatHeadFill();
    const x = Number(rig.anchor.x);
    const y = Number(rig.anchor.y);
    const outer = `M -106 -217 L -98 -212 -94 -204 -92 -168 -87 -149 -78 -133 -79 -129 -76 -129 -73 -124 -68 -121 -47 -120 -41 -122 -24 -121 -28 -123 5 -123 12 -120 40 -118 48 -123 56 -140 60 -142 70 -166 74 -169 78 -168 78 -154 83 -152 86 -157 89 -157 90 -149 96 -146 102 -135 109 -133 109 -127 104 -120 92 -112 83 -111 78 -77 70 -63 66 -58 64 -59 60 -49 57 -47 58 -35 71 0 57 0 56 -5 54 -5 49 -12 50 -19 46 -23 41 -19 39 -13 37 -13 38 -11 33 -10 32 0 23 0 23 -7 26 -12 26 -20 30 -32 30 -42 33 -46 33 -54 13 -54 -1 -60 -12 -62 -22 -58 -41 -35 -41 -26 -37 -15 -35 -15 -32 -9 -23 -3 -19 -3 -18 0 -39 0 -44 -6 -41 -9 -45 -7 -46 -11 -58 -22 -60 -38 -64 -37 -64 -34 -69 -31 -68 -28 -70 -26 -68 -11 -62 -10 -61 0 -73 0 -76 -2 -82 -13 -86 -34 -80 -39 -77 -45 -76 -55 -72 -58 -73 -61 -70 -67 -73 -104 -85 -113 -100 -140 -103 -155 -103 -212 Z`;
    const farRear = `M -73 -104 L -73 -61 -72 -58 -76 -55 -77 -45 -82 -13 -76 -2 -73 0 -61 0 -62 -10 -68 -11 -70 -26 -64 -37 -60 -38 -58 -22 -64 -37 -70 -67 Z`;
    const farFront = `M 33 -54 L 30 -42 30 -32 26 -20 23 -7 23 0 32 0 33 -10 38 -11 37 -13 39 -13 41 -19 46 -23 50 -19 49 -12 54 -5 57 0 58 -35 57 -47 Z`;
    const torso = `M -106 -217 L -98 -212 -94 -204 -92 -168 -87 -149 -78 -133 -79 -129 -76 -129 -73 -124 -68 -121 -47 -120 -41 -122 -24 -121 -28 -123 5 -123 12 -120 40 -118 48 -123 56 -140 60 -142 70 -166 74 -169 78 -168 78 -154 83 -152 86 -157 89 -157 90 -149 96 -146 102 -135 109 -133 109 -127 104 -120 92 -112 83 -111 78 -77 70 -63 66 -58 64 -59 60 -49 57 -47 33 -54 13 -54 -1 -60 -12 -62 -73 -104 -85 -113 -100 -140 -103 -155 -103 -212 Z`;
    const nearRear = `M -12 -62 L -22 -58 -41 -35 -41 -26 -37 -15 -35 -15 -32 -9 -23 -3 -19 -3 -18 0 -39 0 -44 -6 -41 -9 -45 -7 -46 -11 -58 -22 -60 -38 C -52 -53 -34 -63 -12 -62 Z`;
    const nearFront = `M 83 -111 L 78 -77 70 -63 66 -58 64 -59 60 -49 57 -47 58 -35 71 0 57 0 56 -5 54 -5 49 -12 50 -19 46 -23 41 -19 39 -13 37 -13 38 -11 46 -23 C 50 -52 64 -86 83 -111 Z`;
    return `<g class="cat-feline-v58" transform="translate(${x} ${y}) scale(${front * s} ${s})">
      <g class="cat-feline-v58-far-limbs"><path d="${farRear}" fill="${fill}"/><path d="${farFront}" fill="${fill}"/></g>
      <path class="cat-feline-v58-torso" d="${torso}" fill="${fill}"/>
      <g class="cat-feline-v58-near-limbs"><path d="${nearRear}" fill="${fill}"/><path d="${nearFront}" fill="${fill}"/></g>
      <path class="cat-feline-v58-neutral-contract" d="${outer}" fill="${fill}" stroke="${fill}" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/>
    </g>`;
  }

  getFelineTraceGaitPhase() {
    const override = Number(this.getCatRuntimeConfigValue("cat_gait_phase_override", NaN));
    if (Number.isFinite(override)) return ((override % 1) + 1) % 1;
    const moving = this.isCatInMotionContext?.() && this.bool(this.c.cat_gait_enabled ?? true);
    return moving ? ((Number(this.catState?.gait?.phase || 0) % 1) + 1) % 1 : 0;
  }

  renderFelineV59TraceIkWalk(rig) {
    /*
      A trace-native locomotion renderer. The legacy contact clock supplies
      phase; it does not supply visible geometry. Every limb is a filled skin
      generated from feline-specific joint placement and tapered contour
      widths, then layered behind/in front of the traced body shell.
    */
    if (!rig?.anchor) return "";
    const frozenPhase = Number(this.getCatRuntimeConfigValue("cat_gait_phase_override", NaN));
    if (!this.bool(this.c.cat_trace_walk_experimental) && !Number.isFinite(frozenPhase)) {
      return this.renderFelineV49HighResolutionTrace(rig);
    }
    const s = Number(rig.cfg?.scale || 1) * 0.27;
    const front = Number(rig.solvedFrontSign || rig.cfg?.frontSign || 1);
    const fill = this.getCatHeadFill();
    const x = Number(rig.anchor.x);
    const y = Number(rig.anchor.y);
    const phase = this.getFelineTraceGaitPhase();
    const debug = this.bool(this.c.show_cat_trace_rig);
    const mod = (value) => ((value % 1) + 1) % 1;
    const smooth = (value) => {
      const t = Math.max(0, Math.min(1, value));
      return t * t * (3 - 2 * t);
    };
    const lerp = (a, b, t) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
    const add = (point, dx, dy) => ({ x: point.x + dx * front, y: point.y + dy });
    const pawCycle = (base, offset) => {
      // A body-relative planted paw drifts back as the body advances. During
      // its short swing window it returns forward on a shallow toe-clearance arc.
      const local = mod(phase - offset);
      const swing = 0.23;
      const stride = 20;
      if (local < swing) {
        const t = smooth(local / swing);
        return { x: base.x + front * (-stride * 0.5 + stride * t), y: base.y - Math.sin(Math.PI * t) * 13, swing: true, progress: t };
      }
      const stance = (local - swing) / (1 - swing);
      return { x: base.x + front * (stride * 0.5 - stride * stance), y: base.y, swing: false, progress: stance };
    };
    const jointedLeg = (kind, root, paw) => {
      const rear = kind === "rear";
      const first = lerp(root, paw, rear ? 0.40 : 0.36);
      const second = lerp(root, paw, rear ? 0.73 : 0.72);
      const knee = add(first, rear ? -15 : 10, rear ? 2 : 0);
      const hock = add(second, rear ? -9 : 1, rear ? -5 : -5);
      return [root, knee, hock, paw];
    };
    const normal = (from, to) => {
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const length = Math.max(0.001, Math.hypot(dx, dy));
      return { x: -dy / length, y: dx / length };
    };
    const limbSkin = (points, widths, pawLength = 8) => {
      const normals = points.map((point, index) => {
        if (index === 0) return normal(point, points[1]);
        if (index === points.length - 1) return normal(points[index - 1], point);
        const a = normal(points[index - 1], point);
        const b = normal(point, points[index + 1]);
        const length = Math.max(0.001, Math.hypot(a.x + b.x, a.y + b.y));
        return { x: (a.x + b.x) / length, y: (a.y + b.y) / length };
      });
      const left = points.map((p, i) => ({ x: p.x + normals[i].x * widths[i] * 0.5, y: p.y + normals[i].y * widths[i] * 0.5 }));
      const right = points.map((p, i) => ({ x: p.x - normals[i].x * widths[i] * 0.5, y: p.y - normals[i].y * widths[i] * 0.5 }));
      const paw = points[points.length - 1];
      const toe = { x: paw.x + front * pawLength, y: paw.y };
      return `M ${left[0].x} ${left[0].y}
        Q ${left[1].x} ${left[1].y} ${left[2].x} ${left[2].y}
        Q ${left[3].x} ${left[3].y} ${toe.x} ${toe.y}
        Q ${right[3].x} ${right[3].y} ${right[2].x} ${right[2].y}
        Q ${right[1].x} ${right[1].y} ${right[0].x} ${right[0].y} Z`;
    };
    const paws = {
      rearNear: pawCycle({ x: -18, y: 0 }, 0.00),
      frontNear: pawCycle({ x: 71, y: 0 }, 0.25),
      rearFar: pawCycle({ x: -73, y: 0 }, 0.50),
      frontFar: pawCycle({ x: 23, y: 0 }, 0.75),
    };
    const legs = {
      rearFar: jointedLeg("rear", { x: -67, y: -89 }, paws.rearFar),
      frontFar: jointedLeg("front", { x: 36, y: -62 }, paws.frontFar),
      rearNear: jointedLeg("rear", { x: -19, y: -68 }, paws.rearNear),
      frontNear: jointedLeg("front", { x: 69, y: -82 }, paws.frontNear),
    };
    // Retain V49's complete observed body mass and subtract only controlled
    // lower-body windows for the replacement limbs. This avoids reinventing
    // the rump, belly, head or tail while keeping limb ownership explicit.
    const body = `M -106 -217 L -98 -212 -94 -204 -92 -168 -87 -149 -78 -133 -79 -129 -76 -129 -73 -124 -68 -121 -47 -120 -41 -122 -24 -121 -28 -123 5 -123 12 -120 40 -118 48 -123 56 -140 60 -142 70 -166 74 -169 78 -168 78 -154 83 -152 86 -157 89 -157 90 -149 96 -146 102 -135 109 -133 109 -127 104 -120 92 -112 83 -111 78 -77 70 -63 66 -58 64 -59 60 -49 57 -47 58 -35 71 0 57 0 56 -5 54 -5 49 -12 50 -19 46 -23 41 -19 39 -13 37 -13 38 -11 33 -10 32 0 23 0 23 -7 26 -12 26 -20 30 -32 30 -42 33 -46 33 -54 13 -54 -1 -60 -12 -62 -22 -58 -41 -35 -41 -26 -37 -15 -35 -15 -32 -9 -23 -3 -19 -3 -18 0 -39 0 -44 -6 -41 -9 -45 -7 -46 -11 -58 -22 -60 -38 -64 -37 -64 -34 -69 -31 -68 -28 -70 -26 -68 -11 -62 -10 -61 0 -73 0 -76 -2 -82 -13 -86 -34 -80 -39 -77 -45 -76 -55 -72 -58 -73 -61 -70 -67 -73 -104 -85 -113 -100 -140 -103 -155 -103 -212 Z`;
    const suffix = String(this._instanceId || "trace-walk").replace(/[^a-z0-9_-]/gi, "") || "trace-walk";
    const bodyMask = `trace-walk-body-${suffix}`;
    const farMarkup = `<path d="${limbSkin(legs.rearFar, [20, 16, 11, 10], 8)}" fill="${fill}"/><path d="${limbSkin(legs.frontFar, [15, 11, 8, 9], 8)}" fill="${fill}"/>`;
    const nearMarkup = `<path d="${limbSkin(legs.rearNear, [29, 21, 13, 12], 10)}" fill="${fill}"/><path d="${limbSkin(legs.frontNear, [19, 14, 9, 10], 10)}" fill="${fill}"/>`;
    const debugMarkup = debug
      ? `<g fill="none" stroke-linecap="round" stroke-linejoin="round">
          ${Object.entries(legs).map(([name, points]) => `<polyline points="${points.map((p) => `${p.x},${p.y}`).join(" ")}" stroke="${name.includes("Far") ? "#90a4ae" : "#00acc1"}" stroke-width="2" ${name.includes("Far") ? 'stroke-dasharray="4 3"' : ""}/>${points.map((p) => `<circle cx="${p.x}" cy="${p.y}" r="2.7" fill="#fff" stroke="#ffb300" stroke-width="1.5"/>`).join("")}`).join("")}
        </g>`
      : "";
    return `<g class="cat-feline-v59" transform="translate(${x} ${y}) scale(${front * s} ${s})">
      <defs><mask id="${bodyMask}" x="-120" y="-230" width="250" height="240" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse"><rect x="-120" y="-230" width="250" height="240" fill="#000"/><path d="${body}" fill="#fff"/><path d="M -76 -70 C -84 -45 -83 -17 -76 4 L -63 4 C -69 -20 -65 -45 -68 -66 Z" fill="#000"/><path d="M -39 -58 C -48 -40 -43 -17 -34 4 L -17 4 C -27 -16 -29 -39 -20 -57 Z" fill="#000"/><path d="M 31 -53 C 25 -35 24 -14 24 4 L 34 4 C 38 -17 39 -37 36 -53 Z" fill="#000"/><path d="M 64 -77 C 56 -53 59 -20 62 4 L 74 4 C 79 -22 77 -53 71 -77 Z" fill="#000"/></mask></defs>
      <g class="cat-feline-v59-far-limbs">${farMarkup}</g>
      <path class="cat-feline-v59-body" d="${body}" fill="${fill}" stroke="${fill}" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" mask="url(#${bodyMask})"/>
      <g class="cat-feline-v59-near-limbs">${nearMarkup}</g>
      ${debugMarkup}
    </g>`;
  }

  getPixelFelineV1Frame() {
    /*
      A deliberately small 24×24, one-bit sprite. The torso, tail, ears and
      head are fixed cells; each limb has its own cell cluster so a walk is a
      sequence of approved poses, never a deformation or interpolated rig.
    */
    // Literal centre-cell transcription of the user's 24×24 reference image.
    // This neutral sprite is the pixel-art source of truth: never mutate it
    // in order to make an animation frame easier.
    const bodyRows = [
      "........................",
      "........................",
      "........................",
      "........................",
      "........................",
      "........................",
      "..##....................",
      "..#.....................",
      "..#.....................",
      "..#.....................",
      "..##.............#.#....",
      "...##............###....",
      "...##...........#####...",
      "....##.######..#######..",
      "....##################..",
      "....#################...",
      "....###############.....",
      "...###############......",
      "...###############......",
      "...######...#####.......",
      "..######.....####.......",
      "..##.##.....###.#.......",
      "..#..##.....##..#.......",
      "..##..##....#...##......",
    ];
    const cells = new Set();
    bodyRows.forEach((row, y) => [...row].forEach((value, x) => {
      if (value === "#") cells.add(`${x},${y}`);
    }));
    if (!this.bool(this.getCatRuntimeConfigValue("cat_pixel_walk_experimental", this.c.cat_pixel_walk_experimental))) {
      return { cells, frame: 0, size: 24 };
    }
    const walkFrames = [
      ["........................","........................","........................","........................","........................","........................","...#....................","..#.....................","..#.....................","..#.....................","..##.............#.#....","...##............###....","...##...........#####...","....##.#####...#######..","....##################..",".....################...",".....##############.....","....##############......","...######.#######.......","...######...#####.......","..######.....####.......","..##.##.....###.#.......","..#..##.....##..#.......","..R...#R....R...#R......"],
      ["........................","........................","........................","........................","........................","........................","........................","...#....................","..#.....................","..#.....................","..##....................","..##.............#.#....","...##............###....","...##...###....######...","....##################..","....##################..",".....################...","....##############......","....##############......","...#####.....####.......","...####.....#####.......","...###......##.#........","...R##......R..#........",".....#R........#R......."],
      ["........................","........................","........................","........................","........................","........................","........................","....#...................","...#....................","...#....................","...#....................","...##............#.#....","....#............###....","....##..###....######...","....##################..",".....#################..",".....################...",".....#############......","....#############.......","....#####....####.......","....####.....###........","....##.......###........","....##R......#R.........",".....R........#R........"],
      ["........................","........................","........................","........................","........................","........................","........................","...#....................","..#.....................","..##....................","...#.............#.#....","...##............###....","...##...........#####...","....##.#####...#######..","....##################..",".....################...",".....##############.....","....##############......","....#####.#######.......","....####.....####.......","...#####.....####.......","...##.##.....##.#.......","...#...#R....#..R.......","...#R........#R........."],
    ];
    const phaseOverride = Number(this.getCatRuntimeConfigValue("cat_pixel_frame_override", NaN));
    const selfWalk = this.bool(this.getCatRuntimeConfigValue("cat_pixel_self_walk", this.c.cat_pixel_self_walk));
    const moving = (selfWalk && this.bool(this.getCatRuntimeConfigValue("cat_pixel_walk_experimental", this.c.cat_pixel_walk_experimental))) || (this.isCatInMotionContext?.() && this.bool(this.getCatRuntimeConfigValue("cat_pixel_animate", this.c.cat_pixel_animate ?? true)));
    const cycleMs = Math.max(200, Number(this.getCatRuntimeConfigValue("cat_pixel_cycle_ms", 1000)) || 1000);
    const frame = Number.isFinite(phaseOverride)
      ? ((Math.floor(phaseOverride) % 4) + 4) % 4
      : moving
      ? Math.floor((performance.now() % cycleMs) / (cycleMs / 4))
      : 0;
    // Eight held pixel poses, not interpolated joints. The lateral sequence
    // is rear-near → front-near → rear-far → front-far; only the first pose
    // of each pair lifts a foot. During stance the same foot drifts back one
    // cell relative to the translating body, avoiding an obvious snap back.
    const walkCells = new Set();
    const pawCells = new Set();
    walkFrames[frame].forEach((row, y) => [...row].forEach((value, x) => {
      if (value === "#" || value === "R") walkCells.add(`${x},${y}`);
      if (value === "R") pawCells.add(`${x},${y}`);
    }));
    return { cells: walkCells, pawCells, frame, size: 24, cycleMs };
  }

  renderPixelFelineV1(rig) {
    if (!rig?.anchor) return "";
    const s = Number(rig.cfg?.scale || 1) * 0.27;
    const front = Number(rig.solvedFrontSign || rig.cfg?.frontSign || 1);
    const fill = this.getCatHeadFill();
    const x = Number(rig.anchor.x);
    const y = Number(rig.anchor.y);
    const { cells, pawCells = new Set(), frame, size, cycleMs = 1000 } = this.getPixelFelineV1Frame();
    const cell = Math.max(4, Number(this.getCatRuntimeConfigValue("cat_pixel_cell_size", 9)) || 9);
    const showGrid = this.bool(this.getCatRuntimeConfigValue("show_cat_pixel_grid", this.c.show_cat_pixel_grid));
    const showPawDebug = this.bool(this.getCatRuntimeConfigValue("show_cat_pixel_paw_debug", this.c.show_cat_pixel_paw_debug));
    const selfWalk = this.bool(this.getCatRuntimeConfigValue("cat_pixel_walk_experimental", this.c.cat_pixel_walk_experimental)) && this.bool(this.getCatRuntimeConfigValue("cat_pixel_self_walk", this.c.cat_pixel_self_walk));
    let travelCells = 0;
    if (selfWalk) {
      if (!this.catState) this.catState = this.createInitialCatState();
      if (!this.catState.pixelWalkStartedAt) this.catState.pixelWalkStartedAt = performance.now();
      travelCells = Math.floor((performance.now() - Number(this.catState.pixelWalkStartedAt)) / (cycleMs / 4));
    }
    const blocks = [...cells]
      .map((key) => key.split(",").map(Number))
      .filter(([px, py]) => px >= 0 && px < size && py >= 0 && py < size)
      .map(([px, py]) => `<rect x="${(px - size / 2) * cell}" y="${(py - size) * cell}" width="${cell}" height="${cell}" fill="${showPawDebug && pawCells.has(`${px},${py}`) ? "#ef5350" : fill}"/>`)
      .join("");
    const grid = showGrid
      ? `<g fill="none" stroke="#607d8b" stroke-width="0.45" opacity="0.50">${Array.from({ length: size + 1 }, (_, index) => `<line x1="${(-size / 2 + index) * cell}" y1="${-size * cell}" x2="${(-size / 2 + index) * cell}" y2="0"/><line x1="${-size / 2 * cell}" y1="${(-size + index) * cell}" x2="${size / 2 * cell}" y2="${(-size + index) * cell}"/>`).join("")}</g>`
      : "";
    const frameLabel = showGrid
      ? `<text x="${(-size / 2) * cell}" y="${-size * cell - 7}" font-size="8" font-family="monospace" fill="#00acc1">pixel frame ${frame}/8</text>`
      : "";
    return `<g class="cat-pixel-feline-v1" transform="translate(${x + front * travelCells * cell * s} ${y}) scale(${front * s} ${s})" shape-rendering="crispEdges">${blocks}${grid}${frameLabel}</g>`;
  }

  renderFelineV25ReferenceSilhouette(rig) {
    /*
      Static anatomy gate. This is deliberately a rendered silhouette, not a
      diagnostic display of the articulation. It establishes the approved
      feline mass before that mass is attached to motion again.
    */
    if (!rig?.anchor) return "";
    const c = this.c;
    const s = Number(rig.cfg?.scale || 1);
    const front = Number(rig.solvedFrontSign || rig.cfg?.frontSign || 1);
    const fill = this.getCatHeadFill();
    const moving = this.getCatModel() === "feline_v26_reference_walk";
    const solverPaws = [rig.frontPawNear, rig.frontPawFar, rig.rearPawNear, rig.rearPawFar].filter(Boolean);
    const floor = moving && solverPaws.length
      ? Math.max(...solverPaws.map((point) => Number(point.y)))
      : Number(rig.anchor.y);
    const centre = moving && solverPaws.length
      ? solverPaws.reduce((sum, point) => sum + Number(point.x) / solverPaws.length, 0)
      : Number(rig.anchor.x);
    const span = Math.max(44, Number(c.cat_split_pin_body_span || 26) * s);
    const depth = Math.max(16, Number(c.cat_split_pin_torso_depth || 20) * s);
    const hip = { x: centre - front * span * 0.31, y: floor - depth * 1.26 };
    const shoulder = { x: centre + front * span * 0.31, y: floor - depth * 1.30 };
    const P = (x, y) => `${x} ${y}`;
    const body = `M ${P(hip.x - front * span * 0.25, hip.y + depth * 0.18)}
      C ${P(hip.x - front * span * 0.39, hip.y - depth * 0.10)}, ${P(hip.x - front * span * 0.22, hip.y - depth * 0.57)}, ${P(hip.x + front * span * 0.03, hip.y - depth * 0.52)}
      C ${P(centre - front * span * 0.05, hip.y - depth * 0.57)}, ${P(shoulder.x - front * span * 0.13, shoulder.y - depth * 0.49)}, ${P(shoulder.x + front * depth * 0.04, shoulder.y - depth * 0.20)}
      C ${P(shoulder.x + front * depth * 0.12, shoulder.y + depth * 0.02)}, ${P(shoulder.x + front * depth * 0.10, shoulder.y + depth * 0.28)}, ${P(shoulder.x - front * depth * 0.05, shoulder.y + depth * 0.35)}
      C ${P(centre + front * span * 0.06, hip.y + depth * 0.19)}, ${P(hip.x + front * span * 0.06, hip.y + depth * 0.22)}, ${P(hip.x - front * span * 0.25, hip.y + depth * 0.18)} Z`;
    const neck = `M ${P(shoulder.x - front * depth * 0.05, shoulder.y - depth * 0.32)}
      C ${P(shoulder.x + front * depth * 0.18, shoulder.y - depth * 0.54)}, ${P(shoulder.x + front * depth * 0.38, shoulder.y - depth * 0.68)}, ${P(shoulder.x + front * depth * 0.44, shoulder.y - depth * 0.54)}
      L ${P(shoulder.x + front * depth * 0.57, shoulder.y - depth * 0.12)}
      C ${P(shoulder.x + front * depth * 0.35, shoulder.y + depth * 0.10)}, ${P(shoulder.x + front * depth * 0.20, shoulder.y + depth * 0.29)}, ${P(shoulder.x + front * depth * 0.05, shoulder.y + depth * 0.31)} Z`;
    const headX = shoulder.x + front * depth * 0.52;
    const headY = shoulder.y - depth * 0.57;
    const head = `M ${P(headX - front * depth * 0.26, headY + depth * 0.28)}
      C ${P(headX - front * depth * 0.39, headY + depth * 0.04)}, ${P(headX - front * depth * 0.27, headY - depth * 0.28)}, ${P(headX - front * depth * 0.06, headY - depth * 0.31)}
      L ${P(headX + front * depth * 0.04, headY - depth * 0.67)} L ${P(headX + front * depth * 0.19, headY - depth * 0.29)}
      L ${P(headX + front * depth * 0.35, headY - depth * 0.55)} L ${P(headX + front * depth * 0.42, headY - depth * 0.20)}
      C ${P(headX + front * depth * 0.69, headY - depth * 0.05)}, ${P(headX + front * depth * 0.78, headY + depth * 0.10)}, ${P(headX + front * depth * 0.56, headY + depth * 0.22)}
      C ${P(headX + front * depth * 0.30, headY + depth * 0.39)}, ${P(headX - front * depth * 0.06, headY + depth * 0.42)}, ${P(headX - front * depth * 0.26, headY + depth * 0.28)} Z`;
    const leg = (points, upper, lower) => {
      const [root, jointA, jointB, paw] = points;
      const upperPath = `M ${P(root.x, root.y)} Q ${P(jointA.x, jointA.y)} ${P(jointB.x, jointB.y)}`;
      const lowerPath = `M ${P(jointB.x, jointB.y)} Q ${P(paw.x, paw.y)} ${P(paw.x + front * lower * 0.62, paw.y)}`;
      return `<path d="${upperPath}" fill="none" stroke="${fill}" stroke-width="${upper}" stroke-linecap="round" stroke-linejoin="round" /><path d="${lowerPath}" fill="none" stroke="${fill}" stroke-width="${lower}" stroke-linecap="round" stroke-linejoin="round" />`;
    };
    const farRear = [
      { x: hip.x - front * span * 0.12, y: hip.y + depth * 0.16 }, { x: hip.x - front * span * 0.22, y: floor - depth * 0.62 }, { x: hip.x - front * span * 0.18, y: floor - depth * 0.20 }, { x: hip.x - front * span * 0.10, y: floor },
    ];
    const farFront = [
      { x: shoulder.x - front * span * 0.03, y: shoulder.y + depth * 0.22 }, { x: shoulder.x - front * span * 0.05, y: floor - depth * 0.62 }, { x: shoulder.x - front * span * 0.03, y: floor - depth * 0.18 }, { x: shoulder.x + front * span * 0.05, y: floor },
    ];
    const nearRear = [
      { x: hip.x + front * span * 0.03, y: hip.y + depth * 0.19 }, { x: hip.x - front * span * 0.08, y: floor - depth * 0.66 }, { x: hip.x + front * span * 0.10, y: floor - depth * 0.18 }, { x: hip.x + front * span * 0.27, y: floor },
    ];
    const nearFront = [
      { x: shoulder.x + front * span * 0.08, y: shoulder.y + depth * 0.22 }, { x: shoulder.x + front * span * 0.15, y: floor - depth * 0.64 }, { x: shoulder.x + front * span * 0.25, y: floor - depth * 0.18 }, { x: shoulder.x + front * span * 0.37, y: floor },
    ];
    if (moving) {
      // The contact solver advances deliberately slowly. Use a separate,
      // gentle visual clock so the rendered gait completes an observable
      // cycle instead of appearing frozen in ordinary dashboard captures.
      const gaitPhase = (Date.now() * 0.0032) % (Math.PI * 2);
      const animateFoot = (leg, phaseOffset) => {
        const wave = Math.sin(gaitPhase + phaseOffset);
        const lift = Math.max(0, wave);
        const root = leg[0];
        const paw = leg[3];
        const dx = front * span * wave * 0.09;
        leg[3] = { x: paw.x + dx, y: floor - depth * 0.18 * lift };
        leg[2] = { x: leg[2].x + dx * 0.36, y: floor - depth * 0.18 - depth * lift * 0.04 };
        // Keep the upper bend alive, but do not allow it to become a rigid V.
        leg[1] = { x: leg[1].x + dx * 0.20, y: root.y + (floor - root.y) * 0.55 - depth * lift * 0.08 };
      };
      animateFoot(nearRear, 0);
      animateFoot(farFront, Math.PI * 0.5);
      animateFoot(farRear, Math.PI);
      animateFoot(nearFront, Math.PI * 1.5);
    }
    const tailBase = { x: hip.x - front * span * 0.24, y: hip.y - depth * 0.02 };
    const tail = `M ${P(tailBase.x, tailBase.y)} C ${P(tailBase.x - front * span * 0.28, tailBase.y - depth * 0.10)}, ${P(tailBase.x - front * span * 0.34, tailBase.y - depth * 0.82)}, ${P(tailBase.x - front * span * 0.25, tailBase.y - depth * 1.18)}`;
    return `<g class="cat-feline-v25" data-cat-model="${this.getCatModel()}">
      <path d="${tail}" fill="none" stroke="${fill}" stroke-width="${Math.max(4, depth * 0.16)}" stroke-linecap="round" />
      ${leg(farRear, depth * 0.19, depth * 0.12)}${leg(farFront, depth * 0.17, depth * 0.11)}
      <path d="${body}" fill="${fill}" /><path d="${neck}" fill="${fill}" />
      ${leg(nearRear, depth * 0.22, depth * 0.14)}${leg(nearFront, depth * 0.19, depth * 0.12)}
      <path d="${head}" fill="${fill}" /></g>`;
  }

  renderFelineV10SplitPinSilhouette(rig) {
    /*
      Anatomy-first static candidate.

      This intentionally rejects the legacy “everything is a fraction of body
      length” presentation rule. The solved shoulder/hip and limb joints still
      supply meaningful articulation anchors, but visible mass is controlled by
      separate art-direction dimensions. It is the SVG analogue of the supplied
      split-pin construction: torso, neck, head, tail, and each limb segment are
      distinct pieces joined at anatomical pivots.
    */
    if (!rig?.hipJoint || !rig?.shoulderJoint) return "";

    const c = this.c;
    const dynamicFitSkin = this.getCatModel() === "feline_v18_dynamic_fit_direct_register";
    const dynamicIndependent = ["feline_v19_independent_direct_register", "feline_v20_support_centred_direct_register", "feline_v21_moderate_stride_direct_register", "feline_v22_short_stride_direct_register", "feline_v23_anatomical_bend_direct_register", "feline_v24_choreographed_feline_walk"].includes(this.getCatModel());
    const supportCentredSkin = ["feline_v20_support_centred_direct_register", "feline_v21_moderate_stride_direct_register", "feline_v22_short_stride_direct_register", "feline_v23_anatomical_bend_direct_register", "feline_v24_choreographed_feline_walk"].includes(this.getCatModel());
    const anatomicalBendSkin = this.getCatModel() === "feline_v23_anatomical_bend_direct_register";
    const choreographedWalkSkin = this.getCatModel() === "feline_v24_choreographed_feline_walk";
    const integratedSkin = ["feline_v16_integrated_skin_static", "feline_v17_integrated_skin_direct_register", "feline_v18_dynamic_fit_direct_register", "feline_v19_independent_direct_register", "feline_v20_support_centred_direct_register", "feline_v21_moderate_stride_direct_register", "feline_v22_short_stride_direct_register", "feline_v23_anatomical_bend_direct_register", "feline_v24_choreographed_feline_walk"].includes(this.getCatModel());
    const contouredLayout = ["feline_v12_contoured_split_pin_static", "feline_v13_domestic_split_pin_static", "feline_v14_decoupled_tail_static", "feline_v15_balanced_domestic_static", "feline_v16_integrated_skin_static"].includes(this.getCatModel());
    const independentLayout = dynamicIndependent || contouredLayout || this.getCatModel() === "feline_v11_split_pin_layout_static";
    const s = Number(rig.cfg?.scale || 1);
    const front = Number(rig.solvedFrontSign || rig.cfg?.frontSign || 1);
    const fill = this.getCatHeadFill();
    // These are independent art dimensions expressed in the card's shared
    // world-unit scale. They are not proportions of body length.
    /*
      Static art uses the world scale directly. During locomotion V18 reduces
      the skin mass to the available leg support band, preventing a static
      torso depth from swallowing the animated limbs.
    */
    const movingSupportHeight = Math.max(
      1,
      ((Number(rig.frontPawNear?.y || 0) + Number(rig.rearPawNear?.y || 0)) * 0.5) -
        ((Number(rig.shoulderJoint?.y || 0) + Number(rig.hipJoint?.y || 0)) * 0.5)
    );
    const dynamicFit = dynamicFitSkin
      ? this.clamp(movingSupportHeight / Math.max(1, Number(c.cat_split_pin_torso_depth || 20) * s * 2.1), 0.42, 0.72)
      : 1;
    const torsoDepth = Math.max(12, Number(c.cat_split_pin_torso_depth || 31) * s * dynamicFit);
    const haunchDepth = Math.max(torsoDepth, Number(c.cat_split_pin_haunch_depth || 35) * s * dynamicFit);
    const neckWidth = Math.max(8, Number(c.cat_split_pin_neck_width || 18) * s * dynamicFit);
    const headWidth = Math.max(12, Number(c.cat_split_pin_head_width || 25) * s * dynamicFit);
    const headHeight = Math.max(10, Number(c.cat_split_pin_head_height || 19) * s * dynamicFit);
    const tailWidth = Math.max(3, Number(c.cat_split_pin_tail_width || 8) * s * dynamicFit);
    const tailBackReach = Math.max(8, Number(c.cat_split_pin_tail_back_reach || 18) * s * dynamicFit);
    const tailRise = Math.max(12, Number(c.cat_split_pin_tail_rise || 27) * s * dynamicFit);
    const upperWidth = Math.max(3, Number(c.cat_split_pin_upper_limb_width || 10) * s * dynamicFit);
    const lowerWidth = Math.max(2.5, Number(c.cat_split_pin_lower_limb_width || 7) * s * dynamicFit);
    const rearBottomDrop = choreographedWalkSkin ? 0.18 : integratedSkin ? 0.24 : contouredLayout ? 0.22 : 0.34;
    const chestBottomDrop = choreographedWalkSkin ? 0.25 : integratedSkin ? 0.30 : contouredLayout ? 0.26 : 0.30;
    // A lifted centreline creates the modest abdominal tuck that distinguishes
    // a feline silhouette from a rectangular, canine torso.
    const bellyMidDrop = choreographedWalkSkin ? -0.13 : integratedSkin ? 0.015 : contouredLayout ? 0.06 : 0.34;
    const solvedFloorY = Math.max(
      Number(rig.frontPawNear?.y || 0),
      Number(rig.rearPawNear?.y || 0),
      Number(rig.frontPawFar?.y || 0),
      Number(rig.rearPawFar?.y || 0)
    );
    const floorY = Number(dynamicIndependent ? solvedFloorY : rig.anchor?.y ?? solvedFloorY);
    const bodySpan = Math.max(40, Number(c.cat_split_pin_body_span || 84) * s);
    const supportCentreX = [rig.frontPawNear, rig.frontPawFar, rig.rearPawNear, rig.rearPawFar]
      .filter(Boolean)
      .reduce((sum, point, _index, points) => sum + Number(point.x) / points.length, 0);
    const layoutCentreX = supportCentredSkin ? supportCentreX : Number(rig.anchor?.x || 0);
    const staticHip = {
      x: layoutCentreX - front * bodySpan * 0.45,
      y: floorY - torsoDepth * (choreographedWalkSkin ? 1.25 : 1.62),
    };
    const staticShoulder = {
      x: layoutCentreX + front * bodySpan * 0.43,
      y: floorY - torsoDepth * (choreographedWalkSkin ? 1.29 : 1.68),
    };
    const hip = independentLayout ? staticHip : rig.hipJoint;
    const shoulder = independentLayout ? staticShoulder : rig.shoulderJoint;
    const neckTip = independentLayout
      ? { x: shoulder.x + front * neckWidth * 0.80, y: shoulder.y - headHeight * (choreographedWalkSkin ? 0.55 : 0.98) }
      : rig.neckTip || rig.skull || shoulder;
    const tailBase = independentLayout
      ? { x: hip.x - front * haunchDepth * 0.22, y: hip.y - haunchDepth * 0.08 }
      : rig.tailBase || rig.sacrum || hip;
    const dynamicLeg = (root, paw, kind, sideOffset = 0) => {
      const safePaw = paw || { x: root.x, y: floorY };
      const isRear = kind === "rear";
      if (anatomicalBendSkin) {
        const dx = Number(safePaw.x) - Number(root.x);
        const kneeProgress = isRear ? 0.42 : 0.44;
        const hockProgress = isRear ? 0.74 : 0.76;
        const kneeBias = isRear ? 0.10 : -0.07;
        const hockBias = isRear ? -0.07 : 0.035;
        return {
          jointA: {
            x: root.x + dx * kneeProgress + front * bodySpan * (kneeBias + sideOffset),
            y: Number(root.y) + (floorY - Number(root.y)) * (isRear ? 0.48 : 0.45),
          },
          jointB: {
            x: root.x + dx * hockProgress + front * bodySpan * (hockBias + sideOffset * 0.4),
            y: floorY - torsoDepth * 0.20,
          },
          paw: safePaw,
        };
      }
      const rootForward = isRear ? -0.19 : 0.12;
      const jointForward = isRear ? -0.10 : -0.04;
      return {
        jointA: {
          x: root.x + front * bodySpan * (rootForward + sideOffset),
          y: floorY - torsoDepth * (isRear ? 0.86 : 0.84),
        },
        jointB: {
          x: Number(safePaw.x) + front * bodySpan * (jointForward + sideOffset * 0.4),
          y: floorY - torsoDepth * 0.23,
        },
        paw: safePaw,
      };
    };
    /*
      V24 is intentionally a visual gait study. The direct-register solver still
      provides locomotion timing and carries the character through the world,
      but its legacy paw targets are not a usable anatomical drawing guide. A
      feline walk needs a readable, staggered support polygon in every frame,
      rather than four target points converging underneath the belly.
    */
    const walkPhase = Number(this.catState?.gait?.phase || 0) * Math.PI * 2;
    const visualFoot = (root, phaseOffset, restOffset) => {
      const wave = Math.sin(walkPhase + phaseOffset);
      const lift = Math.max(0, wave);
      return {
        x: Number(root.x) + front * bodySpan * (restOffset + wave * 0.11),
        y: floorY - torsoDepth * 0.22 * lift,
      };
    };
    const choreographedLeg = (root, phaseOffset, restOffset, kind) => {
      const paw = visualFoot(root, phaseOffset, restOffset);
      const dx = Number(paw.x) - Number(root.x);
      const isRear = kind === "rear";
      return {
        jointA: {
          x: Number(root.x) + dx * (isRear ? 0.24 : 0.30) + front * bodySpan * (isRear ? -0.13 : 0.055),
          y: Number(root.y) + (floorY - Number(root.y)) * (isRear ? 0.48 : 0.46),
        },
        jointB: {
          x: Number(paw.x) + front * bodySpan * (isRear ? -0.085 : -0.025),
          y: floorY - torsoDepth * 0.20 - (floorY - Number(paw.y)) * 0.24,
        },
        paw,
      };
    };
    const staticRearNear = dynamicIndependent
      ? (choreographedWalkSkin ? choreographedLeg(hip, 0, 0.14, "rear") : dynamicLeg(hip, rig.rearPawNear, "rear", 0))
      : independentLayout
      ? {
          jointA: { x: hip.x - front * bodySpan * 0.24, y: floorY - torsoDepth * 0.86 },
          jointB: { x: hip.x - front * bodySpan * 0.13, y: floorY - torsoDepth * 0.25 },
          paw: { x: hip.x - front * bodySpan * 0.04, y: floorY },
        }
      : { jointA: rig.rearKneeNear, jointB: rig.rearHockNear, paw: rig.rearPawNear };
    const staticRearFar = dynamicIndependent
      ? (choreographedWalkSkin ? choreographedLeg(hip, Math.PI, -0.22, "rear") : dynamicLeg(hip, rig.rearPawFar, "rear", 0.08))
      : independentLayout
      ? {
          jointA: { x: hip.x + front * bodySpan * 0.02, y: floorY - torsoDepth * 0.72 },
          jointB: { x: hip.x + front * bodySpan * 0.14, y: floorY - torsoDepth * 0.20 },
          paw: { x: hip.x + front * bodySpan * 0.24, y: floorY },
        }
      : { jointA: rig.rearKneeFar, jointB: rig.rearHockFar, paw: rig.rearPawFar };
    const staticFrontNear = dynamicIndependent
      ? (choreographedWalkSkin ? choreographedLeg(shoulder, Math.PI * 1.5, 0.24, "front") : dynamicLeg(shoulder, rig.frontPawNear, "front", 0))
      : independentLayout
      ? {
          jointA: { x: shoulder.x + front * bodySpan * 0.13, y: floorY - torsoDepth * 0.92 },
          jointB: { x: shoulder.x + front * bodySpan * 0.18, y: floorY - torsoDepth * 0.26 },
          paw: { x: shoulder.x + front * bodySpan * 0.30, y: floorY },
        }
      : { jointA: rig.frontElbowNear, jointB: rig.frontWristNear, paw: rig.frontPawNear };
    const staticFrontFar = dynamicIndependent
      ? (choreographedWalkSkin ? choreographedLeg(shoulder, Math.PI * 0.5, -0.16, "front") : dynamicLeg(shoulder, rig.frontPawFar, "front", -0.08))
      : independentLayout
      ? {
          jointA: { x: shoulder.x - front * bodySpan * 0.05, y: floorY - torsoDepth * 0.78 },
          jointB: { x: shoulder.x + front * bodySpan * 0.03, y: floorY - torsoDepth * 0.24 },
          paw: { x: shoulder.x + front * bodySpan * 0.10, y: floorY },
        }
      : { jointA: rig.frontElbowFar, jointB: rig.frontWristFar, paw: rig.frontPawFar };

    const piece = (from, to, startWidth, endWidth, opacity = 1) => {
      if (!from || !to) return "";
      const dx = Number(to.x) - Number(from.x);
      const dy = Number(to.y) - Number(from.y);
      const distance = Math.hypot(dx, dy);
      if (distance < 0.01) return "";
      const nx = -dy / distance;
      const ny = dx / distance;
      const a = startWidth * 0.5;
      const b = endWidth * 0.5;
      return `
        <path d="
          M ${from.x + nx * a} ${from.y + ny * a}
          Q ${to.x + nx * b} ${to.y + ny * b} ${to.x - nx * b} ${to.y - ny * b}
          Q ${from.x - nx * a} ${from.y - ny * a} ${from.x + nx * a} ${from.y + ny * a}
          Z
        " fill="${fill}" opacity="${opacity}" />
      `;
    };

    const limb = (root, jointA, jointB, paw, opacity) => {
      const subtleJoints = choreographedWalkSkin;
      const cap = (point, radius) =>
        point
          ? `<circle cx="${point.x}" cy="${point.y}" r="${radius}" fill="${fill}" />`
          : "";
      return `
        <g opacity="${opacity}">
          ${piece(root, jointA, upperWidth, upperWidth * 0.88, 1)}
          ${piece(jointA, jointB, lowerWidth * 1.12, lowerWidth, 1)}
          ${piece(jointB, paw, lowerWidth, lowerWidth * 0.76, 1)}
          ${cap(root, upperWidth * (subtleJoints ? 0.34 : 0.48))}
          ${cap(jointA, Math.max(lowerWidth * (subtleJoints ? 0.46 : 0.68), upperWidth * (subtleJoints ? 0.30 : 0.42)))}
          ${cap(jointB, lowerWidth * (subtleJoints ? 0.42 : 0.58))}
        </g>
      `;
    };

    // A self-contained, tapered tail curve avoids the broken/kinked legacy path.
    const tailOut = {
      x: Number(tailBase.x) - front * tailBackReach * 0.46,
      y: Number(tailBase.y) - tailRise * 0.34,
    };
    const tailHigh = {
      x: tailOut.x - front * tailBackReach * 0.54,
      y: tailOut.y - tailRise * 0.66,
    };
    const tailTip = {
      x: tailHigh.x + front * tailBackReach * 0.08,
      y: tailHigh.y - tailRise * 0.12,
    };

    const torsoPath = `
      M ${hip.x - front * haunchDepth * 0.48} ${hip.y + haunchDepth * rearBottomDrop}
      C ${hip.x - front * haunchDepth * 0.82} ${hip.y - haunchDepth * 0.06},
        ${hip.x - front * haunchDepth * 0.36} ${hip.y - haunchDepth * 0.72},
        ${hip.x + front * torsoDepth * 0.20} ${hip.y - haunchDepth * 0.58}
      C ${shoulder.x - front * torsoDepth * 0.32} ${shoulder.y - torsoDepth * 0.55},
        ${shoulder.x + front * torsoDepth * 0.16} ${shoulder.y - torsoDepth * 0.44},
        ${shoulder.x + front * torsoDepth * 0.24} ${shoulder.y - torsoDepth * 0.18}
      L ${shoulder.x + front * torsoDepth * 0.18} ${shoulder.y + torsoDepth * chestBottomDrop}
      C ${shoulder.x - front * torsoDepth * 0.18} ${shoulder.y + torsoDepth * (chestBottomDrop + 0.04)},
        ${(hip.x + shoulder.x) * 0.5} ${(hip.y + shoulder.y) * 0.5 + torsoDepth * bellyMidDrop},
        ${hip.x + front * torsoDepth * 0.18} ${hip.y + torsoDepth * (rearBottomDrop + 0.03)}
      C ${hip.x - front * haunchDepth * 0.10} ${hip.y + haunchDepth * (rearBottomDrop + 0.05)},
        ${hip.x - front * haunchDepth * 0.36} ${hip.y + haunchDepth * (rearBottomDrop + 0.02)},
        ${hip.x - front * haunchDepth * 0.48} ${hip.y + haunchDepth * rearBottomDrop}
      Z
    `;

    const neckPath = `
      M ${shoulder.x - front * neckWidth * 0.44} ${shoulder.y - torsoDepth * 0.40}
      C ${shoulder.x + front * neckWidth * 0.34} ${shoulder.y - torsoDepth * 0.74},
        ${neckTip.x - front * neckWidth * 0.58} ${neckTip.y + headHeight * 0.42},
        ${neckTip.x - front * neckWidth * 0.42} ${neckTip.y + headHeight * 0.28}
      L ${neckTip.x + front * neckWidth * 0.24} ${neckTip.y + headHeight * 0.40}
      C ${neckTip.x - front * neckWidth * 0.10} ${neckTip.y + headHeight * 0.82},
        ${shoulder.x + front * neckWidth * 0.36} ${shoulder.y + torsoDepth * 0.20},
        ${shoulder.x + front * neckWidth * 0.18} ${shoulder.y + torsoDepth * 0.28}
      Z
    `;

    const hx = Number(neckTip.x) + front * headWidth * 0.08;
    const hy = Number(neckTip.y) - headHeight * 0.04;
    const headPath = choreographedWalkSkin ? `
      M ${hx - front * headWidth * 0.43} ${hy + headHeight * 0.39}
      C ${hx - front * headWidth * 0.56} ${hy + headHeight * 0.08},
        ${hx - front * headWidth * 0.46} ${hy - headHeight * 0.29},
        ${hx - front * headWidth * 0.19} ${hy - headHeight * 0.42}
      L ${hx - front * headWidth * 0.07} ${hy - headHeight * 0.76}
      L ${hx + front * headWidth * 0.12} ${hy - headHeight * 0.39}
      L ${hx + front * headWidth * 0.34} ${hy - headHeight * 0.68}
      L ${hx + front * headWidth * 0.43} ${hy - headHeight * 0.26}
      C ${hx + front * headWidth * 0.68} ${hy - headHeight * 0.08},
        ${hx + front * headWidth * 0.78} ${hy + headHeight * 0.08},
        ${hx + front * headWidth * 0.60} ${hy + headHeight * 0.21}
      C ${hx + front * headWidth * 0.37} ${hy + headHeight * 0.41},
        ${hx - front * headWidth * 0.11} ${hy + headHeight * 0.51},
        ${hx - front * headWidth * 0.43} ${hy + headHeight * 0.39}
      Z
    ` : `
      M ${hx - front * headWidth * 0.45} ${hy + headHeight * 0.42}
      C ${hx - front * headWidth * 0.62} ${hy + headHeight * 0.12},
        ${hx - front * headWidth * 0.50} ${hy - headHeight * 0.35},
        ${hx - front * headWidth * 0.20} ${hy - headHeight * 0.48}
      L ${hx - front * headWidth * 0.06} ${hy - headHeight * 1.00}
      L ${hx + front * headWidth * 0.15} ${hy - headHeight * 0.48}
      L ${hx + front * headWidth * 0.38} ${hy - headHeight * 0.90}
      L ${hx + front * headWidth * 0.48} ${hy - headHeight * 0.30}
      C ${hx + front * headWidth * 0.82} ${hy - headHeight * 0.12},
        ${hx + front * headWidth * 0.96} ${hy + headHeight * 0.08},
        ${hx + front * headWidth * 0.70} ${hy + headHeight * 0.26}
      C ${hx + front * headWidth * 0.42} ${hy + headHeight * 0.48},
        ${hx - front * headWidth * 0.12} ${hy + headHeight * 0.54},
        ${hx - front * headWidth * 0.45} ${hy + headHeight * 0.42}
      Z
    `;

    const debugPoints = [
      hip, shoulder,
      staticRearNear.jointA, staticRearNear.jointB, staticRearNear.paw,
      staticFrontNear.jointA, staticFrontNear.jointB, staticFrontNear.paw,
    ].filter(Boolean);
    const pinDebug = this.bool(c.show_cat_split_pin_debug)
      ? `<g class="cat-split-pin-debug">${debugPoints.map((point) => `<circle cx="${point.x}" cy="${point.y}" r="${Math.max(2.5, s * 3)}" fill="#fff" stroke="#d97706" stroke-width="${Math.max(1, s)}" />`).join("")}</g>`
      : "";

    return `
      <g class="cat-feline-v10" data-cat-model="${this.getCatModel()}">
        <path d="M ${tailBase.x} ${tailBase.y} C ${tailOut.x} ${tailOut.y}, ${tailHigh.x} ${tailHigh.y}, ${tailTip.x} ${tailTip.y}" fill="none" stroke="${fill}" stroke-width="${tailWidth}" stroke-linecap="round" stroke-linejoin="round" />
        ${limb(hip, staticRearFar.jointA, staticRearFar.jointB, staticRearFar.paw, choreographedWalkSkin ? 1 : integratedSkin ? 0.22 : 0.34)}
        ${limb(shoulder, staticFrontFar.jointA, staticFrontFar.jointB, staticFrontFar.paw, choreographedWalkSkin ? 1 : integratedSkin ? 0.22 : 0.34)}
        <path d="${torsoPath}" fill="${fill}" />
        <path d="${neckPath}" fill="${fill}" />
        ${limb(hip, staticRearNear.jointA, staticRearNear.jointB, staticRearNear.paw, 1)}
        ${limb(shoulder, staticFrontNear.jointA, staticFrontNear.jointB, staticFrontNear.paw, 1)}
        <path d="${headPath}" fill="${fill}" />
        ${pinDebug}
      </g>
    `;
  }

  renderFelineV6ArticulatedSilhouette(rig) {
    /*
      V6 is deliberately a renderer-only candidate. The target-led solver,
      contact memory, and direct-register stepping remain shared with the
      established rig; this makes the silhouette and limb construction the
      thing under test rather than masking a gait regression with new physics.

      The visual construction follows the reference landmark diagrams: a high
      hip/haunch, a long shallow thorax, a tucked abdominal line, and separate
      articulated near/far limbs.  Rounded strokes give the limbs continuous
      mass without pretending that a three-point IK chain is a filled polygon.
    */
    if (!rig) return "";

    const flowing = this.getCatModel() === "feline_v9_flowing_articulated_direct_register";
    const slender = flowing || this.getCatModel() === "feline_v8_tucked_articulated_direct_register";
    const compact = slender || this.getCatModel() === "feline_v7_refined_articulated_direct_register";
    const front = Number(rig.solvedFrontSign || rig.cfg?.frontSign || 1);
    const fill = this.getCatHeadFill();
    const solvedBodyDepth =
      Number(rig.anatomy?.body?.height || this.c.cat_body_height || 25) *
      Number(rig.cfg?.scale || 1);
    const bodyDepth = compact
      ? this.clamp(solvedBodyDepth * (slender ? 0.42 : 0.52), slender ? 15 : 17, slender ? 28 : 33)
      : Math.max(14, solvedBodyDepth);
    const hip = rig.hipJoint;
    const shoulder = rig.shoulderJoint;
    const chest = rig.chest || shoulder;
    const sacrum = rig.sacrum || hip;
    const neck = rig.neckBase || shoulder;
    if (!hip || !shoulder || !chest || !sacrum || !neck) return "";

    const limb = (points, opacity, width) => {
      const valid = points.filter(Boolean);
      if (valid.length < 2) return "";
      const path =
        flowing && valid.length === 4
          ? (() => {
              const [root, knee, hock, paw] = valid;
              const point = (from, to, amount) => ({
                x: this.lerp(Number(from.x), Number(to.x), amount),
                y: this.lerp(Number(from.y), Number(to.y), amount),
              });
              const rootOut = point(root, knee, 0.46);
              const kneeIn = point(knee, root, 0.22);
              const kneeOut = point(knee, hock, 0.42);
              const hockIn = point(hock, knee, 0.28);
              const hockOut = point(hock, paw, 0.42);
              const pawIn = point(paw, hock, 0.20);
              return `M ${root.x} ${root.y}
                C ${rootOut.x} ${rootOut.y}, ${kneeIn.x} ${kneeIn.y}, ${knee.x} ${knee.y}
                C ${kneeOut.x} ${kneeOut.y}, ${hockIn.x} ${hockIn.y}, ${hock.x} ${hock.y}
                C ${hockOut.x} ${hockOut.y}, ${pawIn.x} ${pawIn.y}, ${paw.x} ${paw.y}`;
            })()
          : valid.reduce(
              (result, point, index) =>
                `${result}${index ? " L" : "M"} ${Number(point.x)} ${Number(point.y)}`,
              ""
            );
      const paw = valid.at(-1);
      const toe = {
        x: Number(paw.x) + front * Math.max(3, width * 0.42),
        y: Number(paw.y),
      };
      return `
        <path d="${path}" fill="none" stroke="${fill}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" opacity="${opacity}" />
        <path d="M ${paw.x} ${paw.y} L ${toe.x} ${toe.y}" fill="none" stroke="${fill}" stroke-width="${Math.max(2, width * 0.48)}" stroke-linecap="round" opacity="${opacity}" />
      `;
    };

    const farLegWidth = Math.max(3.2, bodyDepth * (slender ? 0.14 : compact ? 0.16 : 0.22));
    const nearLegWidth = Math.max(3.8, bodyDepth * (slender ? 0.17 : compact ? 0.20 : 0.28));
    const tailWidth = Math.max(3.5, bodyDepth * (slender ? 0.145 : compact ? 0.17 : 0.25));
    const bellyTuck = slender ? 0.24 : 0;

    /*
      The belly rises from the chest toward the hip: this is the important
      feline negative space missing from the earlier rectangular silhouette.
      The neck wedge reaches the solved socket so the compact V5 head remains
      structurally attached instead of hovering over the shoulders.
    */
    const torsoPath = `
      M ${hip.x - front * bodyDepth * 0.74} ${hip.y + bodyDepth * 0.40}
      C ${hip.x - front * bodyDepth * 0.98} ${hip.y - bodyDepth * 0.08},
        ${sacrum.x - front * bodyDepth * 0.34} ${sacrum.y - bodyDepth * 0.90},
        ${sacrum.x + front * bodyDepth * 0.20} ${sacrum.y - bodyDepth * 0.64}
      C ${rig.midSpine.x} ${rig.midSpine.y - bodyDepth * 0.55},
        ${chest.x + front * bodyDepth * 0.14} ${chest.y - bodyDepth * 0.58},
        ${shoulder.x + front * bodyDepth * 0.30} ${shoulder.y - bodyDepth * 0.40}
      L ${neck.x + front * bodyDepth * 0.24} ${neck.y - bodyDepth * 0.12}
      C ${neck.x + front * bodyDepth * 0.30} ${neck.y + bodyDepth * 0.22},
        ${shoulder.x + front * bodyDepth * 0.24} ${shoulder.y + bodyDepth * 0.40},
        ${chest.x + front * bodyDepth * 0.08} ${chest.y + bodyDepth * 0.48}
      C ${rig.midSpine.x + front * bodyDepth * 0.10} ${rig.midSpine.y + bodyDepth * (0.32 - bellyTuck)},
        ${hip.x + front * bodyDepth * 0.40} ${hip.y + bodyDepth * (0.22 - bellyTuck * 0.35)},
        ${hip.x - front * bodyDepth * 0.74} ${hip.y + bodyDepth * (slender ? 0.26 : 0.40)}
      Z
    `;

    return `
      <g class="cat-feline-v6" data-cat-model="${this.getCatModel()}">
        <path d="${this.getCatTailRenderPath(rig)}" fill="none" stroke="${fill}" stroke-width="${tailWidth}" stroke-linecap="round" stroke-linejoin="round" />
        ${limb([hip, rig.rearKneeFar, rig.rearHockFar, rig.rearPawFar], 0.32, farLegWidth)}
        ${limb([shoulder, rig.frontElbowFar, rig.frontWristFar, rig.frontPawFar], 0.32, farLegWidth * 0.86)}
        <path d="${torsoPath}" fill="${fill}" stroke="none" />
        ${limb([hip, rig.rearKneeNear, rig.rearHockNear, rig.rearPawNear], 1, nearLegWidth)}
        ${limb([shoulder, rig.frontElbowNear, rig.frontWristNear, rig.frontPawNear], 1, nearLegWidth * 0.86)}
        ${this.renderFelineV5CompactHead(rig)}
      </g>
    `;
  }

  renderCatSkeleton(rig) {
    if (!rig) return "";

    if (this.getCatModel() === "feline_v27_clean_mass_static") {
      return this.renderFelineV27MassStudy(rig);
    }

    if (this.getCatModel() === "feline_v28_domestic_cutout_static") {
      return this.renderFelineV28DomesticCutout(rig);
    }

    if (this.getCatModel() === "feline_v29_traced_static") {
      return this.renderFelineV29TracedSilhouette(rig);
    }

    if (this.getCatModel() === "feline_v44_reference_trace_static") {
      return this.renderFelineV44ReferenceTrace(rig);
    }

    if (this.getCatModel() === "feline_v45_elevated_profile_static") {
      return this.renderFelineV45ElevatedProfile(rig);
    }

    if (this.getCatModel() === "feline_v46_image_traced_walk_static") {
      return this.renderFelineV46ImageTracedWalk(rig);
    }

    if (["feline_v47_reference_boundary_static", "feline_v48_soft_reference_trace_static"].includes(this.getCatModel())) {
      return this.renderFelineV47ReferenceBoundary(rig);
    }

    if (this.getCatModel() === "feline_v49_highres_reference_trace_static") {
      return this.renderFelineV49HighResolutionTrace(rig);
    }

    if (this.getCatModel() === "feline_v50_trace_layer_rig") {
      return this.renderFelineV50TraceLayerRig(rig);
    }

    if (this.getCatModel() === "feline_v51_trace_limb_rig") {
      return this.renderFelineV50TraceLayerRig(rig);
    }

    if (this.getCatModel() === "feline_v52_trace_limb_reach_test") {
      return this.renderFelineV50TraceLayerRig(rig);
    }

    if (this.getCatModel() === "feline_v53_trace_limb_skins") {
      return this.renderFelineV53TraceLimbSkins(rig);
    }

    if (this.getCatModel() === "feline_v54_overlapped_limb_skins") {
      return this.renderFelineV53TraceLimbSkins(rig);
    }

    if (this.getCatModel() === "feline_v55_segmented_limb_skins") {
      return this.renderFelineV55SegmentedLimbSkins(rig);
    }

    if (this.getCatModel() === "feline_v56_lifted_belly_limb_study") {
      return this.renderFelineV55SegmentedLimbSkins(rig);
    }

    if (this.getCatModel() === "feline_v57_four_chain_limb_study") {
      return this.renderFelineV55SegmentedLimbSkins(rig);
    }

    if (this.getCatModel() === "feline_v58_traced_contour_layers") {
      return this.renderFelineV58TracedContourLayers(rig);
    }

    if (this.getCatModel() === "feline_v59_trace_ik_walk") {
      return this.renderFelineV59TraceIkWalk(rig);
    }

    if (this.getCatModel() === "pixel_feline_v1") {
      return this.renderPixelFelineV1(rig);
    }

    if (["feline_v42_continuous_cutout", "feline_v43_overlay_limb_skins"].includes(this.getCatModel())) {
      return this.renderFelineV42ContinuousCutout(rig);
    }

    if (["feline_v30_reference_template", "feline_v31_reference_limb_study", "feline_v32_anatomical_study", "feline_v33_jointed_pose_study", "feline_v34_filled_limb_skin", "feline_v35_proportion_study", "feline_v36_grounded_leg_study", "feline_v37_overlap_study", "feline_v38_low_neck_study", "feline_v39_articulated_limb_skin", "feline_v40_landmark_limb_skin", "feline_v41_raised_landmark_limbs"].includes(this.getCatModel())) {
      return this.renderFelineV30ReferenceTemplate(rig);
    }

    if (["feline_v25_reference_static", "feline_v26_reference_walk"].includes(this.getCatModel())) {
      return this.renderFelineV25ReferenceSilhouette(rig);
    }

    if (["feline_v10_split_pin_static", "feline_v11_split_pin_layout_static", "feline_v12_contoured_split_pin_static", "feline_v13_domestic_split_pin_static", "feline_v14_decoupled_tail_static", "feline_v15_balanced_domestic_static", "feline_v16_integrated_skin_static", "feline_v17_integrated_skin_direct_register", "feline_v18_dynamic_fit_direct_register", "feline_v19_independent_direct_register", "feline_v20_support_centred_direct_register", "feline_v21_moderate_stride_direct_register", "feline_v22_short_stride_direct_register", "feline_v23_anatomical_bend_direct_register", "feline_v24_choreographed_feline_walk"].includes(this.getCatModel())) {
      return this.renderFelineV10SplitPinSilhouette(rig);
    }

    if (this.getCatModel() === "feline_v2_smooth_direct_register") {
      return this.renderFelineV2Silhouette(rig);
    }

    if (["feline_v6_articulated_direct_register", "feline_v7_refined_articulated_direct_register", "feline_v8_tucked_articulated_direct_register", "feline_v9_flowing_articulated_direct_register"].includes(this.getCatModel())) {
      return this.renderFelineV6ArticulatedSilhouette(rig);
    }

    const renderMode = this.getCatRenderMode();
    const showSkeleton = this.isCatRenderLayerVisible("skeleton");
    const hasSurfaceLayers = this.hasVisibleCatSurfaceLayers();
    const needsBodyContourDebugGeometry =
      this.bool(this.getCatRuntimeConfigValue("show_cat_body_contour_nodes", this.c.show_cat_body_contour_nodes)) ||
      this.bool(this.getCatRuntimeConfigValue("show_cat_body_contour_labels", this.c.show_cat_body_contour_labels));
    const needsTailSurfaceDebugGeometry =
      this.bool(this.getCatRuntimeConfigValue("show_cat_tail_surface_nodes", this.c.show_cat_tail_surface_nodes)) ||
      this.bool(this.getCatRuntimeConfigValue("show_cat_tail_surface_labels", this.c.show_cat_tail_surface_labels));
    const needsCollarDebugGeometry =
      this.bool(this.getCatRuntimeConfigValue("show_cat_collar_nodes", this.c.show_cat_collar_nodes)) ||
      this.bool(this.getCatRuntimeConfigValue("show_cat_collar_labels", this.c.show_cat_collar_labels));
    const showSurface =
      hasSurfaceLayers ||
      needsBodyContourDebugGeometry ||
      needsTailSurfaceDebugGeometry ||
      needsCollarDebugGeometry;
    const skeletonOpacity = this.getCatRenderLayerOpacity("skeleton");
    const bellyGuide = rig.bellyGuide || this.getCatBellyLine(rig, rig.anatomy);
    const bellyOpacity = this.clamp(
      Number(this.getCatRuntimeConfigValue("cat_belly_line_opacity", 0.18)),
      0,
      1
    );
    const bellyMarkup =
      this.bool(this.getCatRuntimeConfigValue("show_cat_belly_line", this.c.show_cat_belly_line)) && bellyGuide?.bellyLine
        ? `
        <path
          d="
            M ${bellyGuide.bellyLine.start.x} ${bellyGuide.bellyLine.start.y}
            Q ${bellyGuide.bellyLine.mid.x} ${bellyGuide.bellyLine.mid.y}
              ${bellyGuide.bellyLine.end.x} ${bellyGuide.bellyLine.end.y}
          "
          class="cat-belly-line"
          style="opacity: ${bellyOpacity};"
        />
      `
        : "";

    const bodyMarkup = showSkeleton
      ? `
        <g class="${hasSurfaceLayers ? "cat-skeleton-base soft" : "cat-skeleton-base"}" style="opacity: ${skeletonOpacity};">
        <path
          d="
            M ${rig.chest.x} ${rig.chest.y}
            Q ${rig.midSpine.x} ${rig.midSpine.y}
              ${rig.sacrum.x} ${rig.sacrum.y}
          "
          class="cat-body-line"
        />

        ${bellyMarkup}

        <path
          d="
            M ${rig.neckBase.x} ${rig.neckBase.y}
            Q ${rig.neckControl.x} ${rig.neckControl.y}
              ${rig.neckTip.x} ${rig.neckTip.y}
          "
          class="cat-line"
        />

        <path
          d="${this.getCatTailRenderPath(rig)}"
          class="cat-tail-line"
        />

        <line
          x1="${rig.chest.x}"
          y1="${rig.chest.y}"
          x2="${rig.shoulderJoint.x}"
          y2="${rig.shoulderJoint.y}"
          class="cat-line"
        />

        <line
          x1="${rig.sacrum.x}"
          y1="${rig.sacrum.y}"
          x2="${rig.hipJoint.x}"
          y2="${rig.hipJoint.y}"
          class="cat-line"
        />

        <polyline
          points="
            ${rig.shoulderJoint.x},${rig.shoulderJoint.y}
            ${rig.frontElbowFar.x},${rig.frontElbowFar.y}
            ${rig.frontWristFar.x},${rig.frontWristFar.y}
            ${rig.frontPawFar.x},${rig.frontPawFar.y}
          "
          class="cat-line"
          style="opacity: ${Math.max(0.25, Number(this.c.cat_opacity) * 0.45)};"
        />

        <polyline
          points="
            ${rig.shoulderJoint.x},${rig.shoulderJoint.y}
            ${rig.frontElbowNear.x},${rig.frontElbowNear.y}
            ${rig.frontWristNear.x},${rig.frontWristNear.y}
            ${rig.frontPawNear.x},${rig.frontPawNear.y}
          "
          class="cat-line"
        />

        <polyline
          points="
            ${rig.hipJoint.x},${rig.hipJoint.y}
            ${rig.rearKneeFar.x},${rig.rearKneeFar.y}
            ${rig.rearHockFar.x},${rig.rearHockFar.y}
            ${rig.rearPawFar.x},${rig.rearPawFar.y}
          "
          class="cat-line"
          style="opacity: ${Math.max(0.25, Number(this.c.cat_opacity) * 0.45)};"
        />

        <polyline
          points="
            ${rig.hipJoint.x},${rig.hipJoint.y}
            ${rig.rearKneeNear.x},${rig.rearKneeNear.y}
            ${rig.rearHockNear.x},${rig.rearHockNear.y}
            ${rig.rearPawNear.x},${rig.rearPawNear.y}
          "
          class="cat-line"
        />
        </g>
      `
      : "";

    return `
      ${bodyMarkup}
      ${showSurface ? this.renderCatSurface(rig, bellyGuide) : ""}
      ${
        this.isCatRenderLayerVisible("head")
          ? `<g class="cat-head-layer" style="opacity: ${this.getCatRenderLayerOpacity("head")};">${this.renderCatHead(rig)}</g>`
          : ""
      }
    `;
  }

  renderCatSurface(rig, bellyGuide) {
    if (!rig || !bellyGuide?.bellyLine) return "";

    const lineWidth = Math.max(1, Number(this.c.cat_line_width || this.c.line_width || 6));
    const anatomy = rig.anatomy || {};
    const frontBendRoundness = this.clamp(
      Number(
        this.getCatRuntimeConfigValue(
          "cat_surface_front_bend_roundness",
          this.c.cat_surface_front_bend_roundness ?? 1
        )
      ),
      0,
      3
    );
    const rearBendRoundness = this.clamp(
      Number(
        this.getCatRuntimeConfigValue(
          "cat_surface_rear_bend_roundness",
          this.c.cat_surface_rear_bend_roundness ?? 1
        )
      ),
      0,
      3
    );

    const limbSurfacePath = (points, widths) => {
      const cleanPoints = points.filter(Boolean).map((point) => ({
        x: Number(point.x),
        y: Number(point.y),
      }));

      if (cleanPoints.length < 2) return "";

      const normalAt = (index) => {
        const prev = cleanPoints[Math.max(0, index - 1)];
        const next = cleanPoints[Math.min(cleanPoints.length - 1, index + 1)];
        const tangent = this.normaliseVector(
          {
            x: next.x - prev.x,
            y: next.y - prev.y,
          },
          { x: 1, y: 0 }
        );

        return {
          x: -tangent.y,
          y: tangent.x,
        };
      };

      const left = cleanPoints.map((point, index) => {
        const normal = normalAt(index);
        const width = Math.max(0.1, Number(widths[index] ?? widths[widths.length - 1] ?? 1));

        return {
          x: point.x + normal.x * width,
          y: point.y + normal.y * width,
        };
      });

      const right = cleanPoints.map((point, index) => {
        const normal = normalAt(index);
        const width = Math.max(0.1, Number(widths[index] ?? widths[widths.length - 1] ?? 1));

        return {
          x: point.x - normal.x * width,
          y: point.y - normal.y * width,
        };
      });

      const first = left[0];
      const last = left[left.length - 1];
      const rightLast = right[right.length - 1];

      return `
        M ${first.x} ${first.y}
        ${left.slice(1).map((point) => `L ${point.x} ${point.y}`).join(" ")}
        Q ${cleanPoints[cleanPoints.length - 1].x} ${cleanPoints[cleanPoints.length - 1].y}
          ${rightLast.x} ${rightLast.y}
        ${right
          .slice(0, -1)
          .reverse()
          .map((point) => `L ${point.x} ${point.y}`)
          .join(" ")}
        Q ${cleanPoints[0].x} ${cleanPoints[0].y}
          ${first.x} ${first.y}
        Z
      `;
    };

    const pointOnLine = (from, to, ratio) => ({
      x: Number(from.x) + (Number(to.x) - Number(from.x)) * ratio,
      y: Number(from.y) + (Number(to.y) - Number(from.y)) * ratio,
    });

    const jointWebSurfacePath = (
      prev,
      joint,
      next,
      upperWidth,
      lowerWidth,
      depth,
      reachRatio = 0.52
    ) => {
      if (!prev || !joint || !next) return "";

      const jointPoint = {
        x: Number(joint.x),
        y: Number(joint.y),
      };
      const upperAxis = this.normaliseVector(
        {
          x: Number(prev.x) - jointPoint.x,
          y: Number(prev.y) - jointPoint.y,
        },
        { x: -1, y: 0 }
      );
      const lowerAxis = this.normaliseVector(
        {
          x: Number(next.x) - jointPoint.x,
          y: Number(next.y) - jointPoint.y,
        },
        { x: 1, y: 0 }
      );
      const axisSum = {
        x: upperAxis.x + lowerAxis.x,
        y: upperAxis.y + lowerAxis.y,
      };
      const bendInside =
        Math.hypot(axisSum.x, axisSum.y) > 0.001
          ? this.normaliseVector(axisSum, { x: 0, y: -1 })
          : this.normaliseVector(
              { x: -upperAxis.y, y: upperAxis.x },
              { x: 0, y: -1 }
            );

      const normalForSegment = (from, to) => {
        const tangent = this.normaliseVector(
          {
            x: Number(to.x) - Number(from.x),
            y: Number(to.y) - Number(from.y),
          },
          { x: 1, y: 0 }
        );
        return { x: -tangent.y, y: tangent.x };
      };

      const offsetPoint = (point, normal, width, side) => ({
        x: Number(point.x) + normal.x * Number(width || 0) * side,
        y: Number(point.y) + normal.y * Number(width || 0) * side,
      });
      const chooseInsidePoint = (point, normal, width) => {
        const candidateA = offsetPoint(point, normal, width, 1);
        const candidateB = offsetPoint(point, normal, width, -1);
        const score = (candidate) =>
          (Number(candidate.x) - Number(point.x)) * bendInside.x +
          (Number(candidate.y) - Number(point.y)) * bendInside.y;

        return score(candidateA) >= score(candidateB) ? candidateA : candidateB;
      };

      const upperNormal = normalForSegment(prev, joint);
      const lowerNormal = normalForSegment(joint, next);
      const overlap = Math.max(0.45, lineWidth * 0.22);
      const upperOuter = chooseInsidePoint(
        pointOnLine(joint, prev, Math.max(0.08, reachRatio - 0.04)),
        upperNormal,
        Math.max(0.12, Number(upperWidth || 0) - overlap * 0.65)
      );
      const lowerOuter = chooseInsidePoint(
        pointOnLine(joint, next, Math.max(0.08, reachRatio - 0.04)),
        lowerNormal,
        Math.max(0.12, Number(lowerWidth || 0) - overlap * 0.65)
      );
      const cornerWidth = Math.max(
        0.2,
        Math.min(Number(upperWidth || 0), Number(lowerWidth || upperWidth || 0))
      );
      const corner = {
        x: jointPoint.x + bendInside.x * Math.max(0.12, cornerWidth * 0.38),
        y: jointPoint.y + bendInside.y * Math.max(0.12, cornerWidth * 0.38),
      };
      const hypotenuseMid = this.averageCatPoints([upperOuter, lowerOuter]);
      const control = {
        x: this.lerp(hypotenuseMid.x, corner.x, this.clamp(Number(depth || 0), 0, 3) * 0.28),
        y: this.lerp(hypotenuseMid.y, corner.y, this.clamp(Number(depth || 0), 0, 3) * 0.28),
      };

      return `
        M ${upperOuter.x} ${upperOuter.y}
        L ${corner.x} ${corner.y}
        L ${lowerOuter.x} ${lowerOuter.y}
        Q ${control.x} ${control.y}
          ${upperOuter.x} ${upperOuter.y}
        Z
      `;
    };

    const rearPatch = (root, knee, hock, paw, className = "cat-surface-rear") => {
      const d = limbSurfacePath(
        [root, knee, hock, paw],
        [lineWidth * 1.08, lineWidth * 0.98, lineWidth * 0.64, lineWidth * 0.3]
      );
      if (!d) return "";

      const webPatch =
        rearBendRoundness > 0
          ? jointWebSurfacePath(
              root,
              knee,
              hock,
              lineWidth * 0.98,
              lineWidth * 0.64,
              rearBendRoundness,
              0.72
            )
          : "";

      /*
        The rear leg needs visible mass around the primary knee/haunch bend.
        This rounded fill is render-only: it follows the solved joint corner
        and scales from rear anatomy, but it does not feed back into the IK.
      */
      return `
        ${webPatch ? `<path d="${webPatch}" class="${className} web" />` : ""}
        <path d="${d}" class="${className}" />
      `;
    };

    const getLimbRibbonRootCornerToward = (root, next, width, direction, alongRatio = 0.12) => {
      if (!root || !next) return null;

      const axis = this.normaliseVector(
        {
          x: Number(next.x) - Number(root.x),
          y: Number(next.y) - Number(root.y),
        },
        { x: 0, y: 1 }
      );
      const normal = { x: -axis.y, y: axis.x };
      const targetDirection = this.normaliseVector(direction, { x: 1, y: 0 });
      const base = {
        x: Number(root.x) + axis.x * lineWidth * alongRatio,
        y: Number(root.y) + axis.y * lineWidth * alongRatio,
      };
      const candidateA = {
        x: base.x + normal.x * Number(width || 0),
        y: base.y + normal.y * Number(width || 0),
      };
      const candidateB = {
        x: base.x - normal.x * Number(width || 0),
        y: base.y - normal.y * Number(width || 0),
      };
      const score = (point) =>
        (Number(point.x) - Number(root.x)) * targetDirection.x +
        (Number(point.y) - Number(root.y)) * targetDirection.y;

      return score(candidateA) >= score(candidateB) ? candidateA : candidateB;
    };

    const getFrontLegRibbonRootCorner = (root, elbow, side = 1) => {
      const front = Number(rig.solvedFrontSign || rig.cfg?.frontSign || this.getCatFacingSign() || -1);
      const direction = side >= 0
        ? { x: front, y: -0.06 }
        : { x: -front, y: 0.1 };

      return getLimbRibbonRootCornerToward(
        root,
        elbow,
        lineWidth * 0.48,
        direction,
        0.12
      );
    };

    const getRearLegRibbonRootCorner = (root, knee, side = 1) => {
      const front = Number(rig.solvedFrontSign || rig.cfg?.frontSign || this.getCatFacingSign() || -1);
      const direction = side >= 0
        ? { x: -front, y: -0.18 }
        : { x: front, y: 0.16 };

      return getLimbRibbonRootCornerToward(
        root,
        knee,
        lineWidth * 1.08,
        direction,
        0.08
      );
    };

    const frontLegSurface = (root, elbow, wrist, paw, className = "cat-surface-front") => {
      const lowerBlend = 0.78;
      const lowerWrist = wrist && paw
        ? {
            x: Number(wrist.x) + (Number(paw.x) - Number(wrist.x)) * lowerBlend,
            y: Number(wrist.y) + (Number(paw.y) - Number(wrist.y)) * lowerBlend,
          }
        : wrist;
      const d = limbSurfacePath(
        [root, elbow, wrist, lowerWrist],
        [lineWidth * 0.48, lineWidth * 0.42, lineWidth * 0.28, lineWidth * 0.18]
      );
      if (!d) return "";

      const webPatch =
        frontBendRoundness > 0
          ? jointWebSurfacePath(
              root,
              elbow,
              wrist,
              lineWidth * 0.42,
              lineWidth * 0.28,
              frontBendRoundness,
              0.52
            )
          : "";

      return `
        ${webPatch ? `<path d="${webPatch}" class="${className} web" />` : ""}
        <path d="${d}" class="${className}" />
      `;
    };

    const collarSurfacePath = () => {
      const required = [
        rig.shoulderJoint,
        rig.frontElbowNear,
        rig.jawPivot,
        rig.neckTip,
        rig.midSpine,
      ];
      if (required.some((point) => !point)) return "";

      const shoulder = rig.shoulderJoint;
      let legCorner =
        getFrontLegRibbonRootCorner(shoulder, rig.frontElbowNear, 1) ||
        rig.shoulderJoint;
      let jawCorner = {
        x: this.lerp(Number(rig.jawPivot.x), Number(rig.neckTip.x), 0.18),
        y: this.lerp(Number(rig.jawPivot.y), Number(rig.neckTip.y), 0.18),
      };
      let skullCorner = {
        x: this.lerp(Number(rig.neckTip.x), Number(rig.neckBase?.x ?? rig.neckTip.x), 0.14),
        y: this.lerp(Number(rig.neckTip.y), Number(rig.neckBase?.y ?? rig.neckTip.y), 0.14),
      };
      let backCorner = {
        x: this.lerp(Number(shoulder.x), Number(rig.midSpine.x), 0.58),
        y: this.lerp(Number(shoulder.y), Number(rig.midSpine.y), 0.58) - lineWidth * 0.08,
      };

      /*
        Collar surface v1:
        - four main corners are real rig-relative landmarks
        - the two long sides curve inward by pulling controls toward the
          shoulder, which keeps the shape attached to the chest/neck instead of
          becoming a rectangular throat patch.
      */
      const frontSideMid = this.averageCatPoints([legCorner, jawCorner]);
      let frontControl = {
        x: this.lerp(frontSideMid.x, Number(shoulder.x), 0.42),
        y: this.lerp(frontSideMid.y, Number(shoulder.y), 0.42),
      };
      const rearSideMid = this.averageCatPoints([skullCorner, backCorner]);
      let rearControl = {
        x: this.lerp(rearSideMid.x, Number(shoulder.x), 0.3),
        y: this.lerp(rearSideMid.y, Number(shoulder.y), 0.3),
      };

      legCorner = this.applyCatFineTunePoint("collar", "collarLegCorner", legCorner);
      jawCorner = this.applyCatFineTunePoint("collar", "collarJawCorner", jawCorner);
      skullCorner = this.applyCatFineTunePoint("collar", "collarSkullCorner", skullCorner);
      backCorner = this.applyCatFineTunePoint("collar", "collarBackCorner", backCorner);
      frontControl = this.applyCatFineTunePoint("collar", "collarFrontControl", frontControl);
      rearControl = this.applyCatFineTunePoint("collar", "collarRearControl", rearControl);

      rig.collarDebug = [
        { name: "collarLegCorner", point: legCorner },
        { name: "collarJawCorner", point: jawCorner },
        { name: "collarSkullCorner", point: skullCorner },
        { name: "collarBackCorner", point: backCorner },
        { name: "collarFrontControl", point: frontControl },
        { name: "collarRearControl", point: rearControl },
      ];

      return `
        M ${legCorner.x} ${legCorner.y}
        Q ${frontControl.x} ${frontControl.y}
          ${jawCorner.x} ${jawCorner.y}
        L ${skullCorner.x} ${skullCorner.y}
        Q ${rearControl.x} ${rearControl.y}
          ${backCorner.x} ${backCorner.y}
        L ${legCorner.x} ${legCorner.y}
        Z
      `;
    };

    const bodyContourSurfacePath = () => {
      const required = [
        rig.shoulderJoint,
        rig.midSpine,
        rig.tailBase,
        rig.hipJoint,
        rig.rearKneeNear,
        bellyGuide.bellyLine?.start,
        bellyGuide.bellyLine?.mid,
        bellyGuide.bellyLine?.end,
      ];
      if (required.some((point) => !point)) return "";

      const shoulder = rig.shoulderJoint;
      const front = Number(rig.solvedFrontSign || rig.cfg?.frontSign || this.getCatFacingSign() || -1);
      const tailBaseWidthMultiplier = this.clamp(
        Number(
          this.getCatRuntimeConfigValue(
            "cat_tail_surface_base_width",
            this.c.cat_tail_surface_base_width ?? 0.59
          )
        ),
        0.05,
        3
      );
      const tailRootAxis = this.normaliseVector(
        {
          x: Number(rig.tailControl?.x ?? rig.tailBase.x) - Number(rig.tailBase.x),
          y: Number(rig.tailControl?.y ?? rig.tailBase.y) - Number(rig.tailBase.y),
        },
        { x: -front, y: -0.2 }
      );
      const tailRootNormal = { x: -tailRootAxis.y, y: tailRootAxis.x };
      const tailRootWidth = Math.max(0.2, lineWidth * tailBaseWidthMultiplier);
      let tailEdgeA = {
        x: Number(rig.tailBase.x) + tailRootNormal.x * tailRootWidth,
        y: Number(rig.tailBase.y) + tailRootNormal.y * tailRootWidth,
      };
      let tailEdgeB = {
        x: Number(rig.tailBase.x) - tailRootNormal.x * tailRootWidth,
        y: Number(rig.tailBase.y) - tailRootNormal.y * tailRootWidth,
      };
      let tailTopEdge =
        (tailEdgeA.y < tailEdgeB.y ? tailEdgeA : tailEdgeB);
      let tailBottomEdge =
        (tailEdgeA.y >= tailEdgeB.y ? tailEdgeA : tailEdgeB);
      const rearTopCorner =
        getRearLegRibbonRootCorner(rig.hipJoint, rig.rearKneeNear, 1) ||
        rig.hipJoint;
      let collarBack = {
        x: this.lerp(Number(shoulder.x), Number(rig.midSpine.x), 0.5),
        y: this.lerp(Number(shoulder.y), Number(rig.midSpine.y), 0.5) - lineWidth * 0.08,
      };
      let rumpTop = {
        x: this.lerp(Number(tailTopEdge.x), Number(rig.midSpine.x), 0.18),
        y: this.lerp(Number(tailTopEdge.y), Number(rig.midSpine.y), 0.18) + lineWidth * 0.06,
      };
      let rumpFaceTop = {
        x: this.lerp(Number(tailBottomEdge.x), Number(rearTopCorner.x), 0.38),
        y: this.lerp(Number(tailBottomEdge.y), Number(rearTopCorner.y), 0.38),
      };
      let rumpFaceBottom = bellyGuide.bellyLine?.end
        ? {
            x: this.lerp(Number(rearTopCorner.x), Number(bellyGuide.bellyLine.end.x), 0.42),
            y: this.lerp(Number(rearTopCorner.y), Number(bellyGuide.bellyLine.end.y), 0.42) + lineWidth * 0.32,
          }
        : rearTopCorner;
      let rearBellyAnchor = bellyGuide.bellyLine?.end
        ? {
            x: this.lerp(Number(bellyGuide.bellyLine.mid.x), Number(bellyGuide.bellyLine.end.x), 0.72),
            y: this.lerp(Number(bellyGuide.bellyLine.mid.y), Number(bellyGuide.bellyLine.end.y), 0.72) + lineWidth * 0.3,
          }
        : rumpFaceBottom;
      const frontRibbonInside =
        getFrontLegRibbonRootCorner(shoulder, rig.frontElbowNear, -1);
      const frontRibbonLead =
        getFrontLegRibbonRootCorner(shoulder, rig.frontElbowNear, 1) ||
        frontRibbonInside ||
        shoulder;
      const frontBehindLimitX = Number(frontRibbonLead.x) - front * lineWidth * 0.16;
      let frontUnder = frontRibbonInside
        ? {
            x:
              front < 0
                ? Math.max(
                    this.lerp(Number(frontRibbonInside.x), Number(shoulder.x), 0.82) -
                      front * lineWidth * 0.18,
                    frontBehindLimitX
                  )
                : Math.min(
                    this.lerp(Number(frontRibbonInside.x), Number(shoulder.x), 0.82) -
                      front * lineWidth * 0.18,
                    frontBehindLimitX
                  ),
            y: this.lerp(Number(frontRibbonInside.y), Number(shoulder.y), 0.22) + lineWidth * 0.12,
          }
        :
        {
          x: this.lerp(Number(bellyGuide.bellyLine.start.x), Number(shoulder.x), 0.3),
          y: this.lerp(Number(bellyGuide.bellyLine.start.y), Number(shoulder.y), 0.3),
        };
      let bellyStart = {
        x: Number(rig.frontElbowNear.x),
        y: Number(bellyGuide.bellyLine.start.y),
      };
      let shoulderGuard = {
        x: Number(frontRibbonLead.x),
        y: this.lerp(frontRibbonLead.y, collarBack.y, 0.58) + lineWidth * 0.04,
      };
      let topControlA = {
        x: this.lerp(collarBack.x, rig.midSpine.x, 0.45),
        y: this.lerp(collarBack.y, rig.midSpine.y, 0.45) - lineWidth * 0.42,
      };
      let topControlB = {
        x: this.lerp(rig.midSpine.x, rumpTop.x, 0.45),
        y: this.lerp(rig.midSpine.y, rumpTop.y, 0.45) - lineWidth * 0.16,
      };
      let bellyControl = {
        x: Number(bellyGuide.bellyLine.mid.x),
        y: Number(bellyGuide.bellyLine.mid.y) + lineWidth * 0.16,
      };
      let shoulderCloseControl = {
        x: this.lerp(shoulderGuard.x, collarBack.x, 0.52),
        y: this.lerp(shoulderGuard.y, collarBack.y, 0.36),
      };

      collarBack = this.applyCatFineTunePoint("body_contour", "collarBack", collarBack);
      topControlA = this.applyCatFineTunePoint("body_contour", "topControlA", topControlA);
      topControlB = this.applyCatFineTunePoint("body_contour", "topControlB", topControlB);
      rumpTop = this.applyCatFineTunePoint("body_contour", "rumpTop", rumpTop);
      tailTopEdge = this.applyCatFineTunePoint("body_contour", "tailTopEdge", tailTopEdge);
      tailBottomEdge = this.applyCatFineTunePoint("body_contour", "tailBottomEdge", tailBottomEdge);
      rumpFaceTop = this.applyCatFineTunePoint("body_contour", "rumpFaceTop", rumpFaceTop);
      rumpFaceBottom = this.applyCatFineTunePoint("body_contour", "rumpFaceBottom", rumpFaceBottom);
      rearBellyAnchor = this.applyCatFineTunePoint("body_contour", "rearBellyAnchor", rearBellyAnchor);
      bellyControl = this.applyCatFineTunePoint("body_contour", "bellyControl", bellyControl);
      bellyStart = this.applyCatFineTunePoint("body_contour", "bellyStart", bellyStart);
      frontUnder = this.applyCatFineTunePoint("body_contour", "frontUnder", frontUnder);
      shoulderGuard = this.applyCatFineTunePoint("body_contour", "shoulderGuard", shoulderGuard);
      shoulderCloseControl = this.applyCatFineTunePoint("body_contour", "shoulderCloseControl", shoulderCloseControl);

      rig.bodyContourDebug = [
        { name: "collarBack", point: collarBack },
        { name: "topControlA", point: topControlA },
        { name: "topControlB", point: topControlB },
        { name: "rumpTop", point: rumpTop },
        { name: "tailTopEdge", point: tailTopEdge },
        { name: "tailBottomEdge", point: tailBottomEdge },
        { name: "rumpFaceTop", point: rumpFaceTop },
        { name: "rumpFaceBottom", point: rumpFaceBottom },
        { name: "rearBellyAnchor", point: rearBellyAnchor },
        { name: "bellyControl", point: bellyControl },
        { name: "bellyStart", point: bellyStart },
        { name: "frontUnder", point: frontUnder },
        { name: "shoulderGuard", point: shoulderGuard },
        { name: "shoulderCloseControl", point: shoulderCloseControl },
      ];

      return `
        M ${collarBack.x} ${collarBack.y}
        C ${topControlA.x} ${topControlA.y}
          ${topControlB.x} ${topControlB.y}
          ${rumpTop.x} ${rumpTop.y}
        L ${tailTopEdge.x} ${tailTopEdge.y}
        L ${tailBottomEdge.x} ${tailBottomEdge.y}
        L ${rumpFaceTop.x} ${rumpFaceTop.y}
        L ${rumpFaceBottom.x} ${rumpFaceBottom.y}
        L ${rearBellyAnchor.x} ${rearBellyAnchor.y}
        Q ${bellyControl.x} ${bellyControl.y}
          ${bellyStart.x} ${bellyStart.y}
        L ${frontUnder.x} ${frontUnder.y}
        L ${shoulderGuard.x} ${shoulderGuard.y}
        Q ${shoulderCloseControl.x} ${shoulderCloseControl.y}
          ${collarBack.x} ${collarBack.y}
        Z
      `;
    };

    const bodyContourPath = bodyContourSurfacePath();

    const tailSurfacePath = () => {
      let tailBase = this.applyCatFineTunePoint("tail_surface", "tailBase", rig.tailBase);
      let tailControl = this.applyCatFineTunePoint("tail_surface", "tailControl", rig.tailControl);
      let tailMid = this.applyCatFineTunePoint("tail_surface", "tailMid", rig.tailMid);
      let tailTip = this.applyCatFineTunePoint("tail_surface", "tailTip", rig.tailTip);
      let tipControl = this.applyCatFineTunePoint("tail_surface", "tailTipControl", this.getCatTailTipControl(rig));
      const cubicPoint = (t) => {
        const mt = 1 - t;
        return {
          x:
            mt ** 3 * Number(tailBase.x) +
            3 * mt ** 2 * t * Number(tailControl.x) +
            3 * mt * t ** 2 * Number(tailMid.x) +
            t ** 3 * Number(tailMid.x),
          y:
            mt ** 3 * Number(tailBase.y) +
            3 * mt ** 2 * t * Number(tailControl.y) +
            3 * mt * t ** 2 * Number(tailMid.y) +
            t ** 3 * Number(tailMid.y),
        };
      };
      const quadPoint = (t) => {
        const mt = 1 - t;
        return {
          x:
            mt ** 2 * Number(tailMid.x) +
            2 * mt * t * Number(tipControl.x) +
            t ** 2 * Number(tailTip.x),
          y:
            mt ** 2 * Number(tailMid.y) +
            2 * mt * t * Number(tipControl.y) +
            t ** 2 * Number(tailTip.y),
        };
      };
      let tailRootInside = bellyGuide?.bellyLine?.end
        ? {
            x: this.lerp(Number(tailBase.x), Number(bellyGuide.bellyLine.end.x), 0.12),
            y: this.lerp(Number(tailBase.y), Number(bellyGuide.bellyLine.end.y), 0.12) + lineWidth * 0.08,
          }
        : rig.midSpine
          ? {
              x: this.lerp(Number(tailBase.x), Number(rig.midSpine.x), 0.06),
              y: this.lerp(Number(tailBase.y), Number(rig.midSpine.y), 0.06) + lineWidth * 0.22,
            }
          : tailBase;
      tailRootInside = this.applyCatFineTunePoint("tail_surface", "tailRootInside", tailRootInside);
      const samples = [tailRootInside];
      for (let i = 0; i <= 5; i += 1) samples.push(cubicPoint(i / 5));
      for (let i = 1; i <= 5; i += 1) samples.push(quadPoint(i / 5));

      const baseWidthMultiplier = this.clamp(
        Number(
          this.getCatRuntimeConfigValue(
            "cat_tail_surface_base_width",
            this.c.cat_tail_surface_base_width ?? 0.59
          )
        ),
        0.05,
        3
      );
      const tipWidthMultiplier = this.clamp(
        Number(
          this.getCatRuntimeConfigValue(
            "cat_tail_surface_tip_width",
            this.c.cat_tail_surface_tip_width ?? 0.18
          )
        ),
        0.01,
        2
      );
      const maxWidth = Math.max(0.2, lineWidth * baseWidthMultiplier);
      const minWidth = Math.max(0.05, lineWidth * tipWidthMultiplier);
      const widthAt = (index) =>
        this.lerp(maxWidth, minWidth, index / Math.max(1, samples.length - 1));
      const normalAt = (index) => {
        const prev = samples[Math.max(0, index - 1)];
        const next = samples[Math.min(samples.length - 1, index + 1)];
        const tangent = this.normaliseVector(
          { x: next.x - prev.x, y: next.y - prev.y },
          { x: 1, y: 0 }
        );
        return { x: -tangent.y, y: tangent.x };
      };
      const sideA = samples.map((point, index) => {
        const normal = normalAt(index);
        const width = widthAt(index);
        return {
          x: point.x + normal.x * width,
          y: point.y + normal.y * width,
        };
      });
      const sideB = samples.map((point, index) => {
        const normal = normalAt(index);
        const width = widthAt(index);
        return {
          x: point.x - normal.x * width,
          y: point.y - normal.y * width,
        };
      });
      sideA[0] = this.applyCatFineTunePoint("tail_surface", "tailBaseEdgeA", sideA[0]);
      sideB[0] = this.applyCatFineTunePoint("tail_surface", "tailBaseEdgeB", sideB[0]);
      sideA[sideA.length - 1] = this.applyCatFineTunePoint("tail_surface", "tailTipEdgeA", sideA[sideA.length - 1]);
      sideB[sideB.length - 1] = this.applyCatFineTunePoint("tail_surface", "tailTipEdgeB", sideB[sideB.length - 1]);

      rig.tailSurfaceDebug = [
        { name: "tailRootInside", point: tailRootInside },
        { name: "tailBase", point: tailBase },
        { name: "tailControl", point: tailControl },
        { name: "tailMid", point: tailMid },
        { name: "tailTipControl", point: tipControl },
        { name: "tailTip", point: tailTip },
        { name: "tailBaseEdgeA", point: sideA[0] },
        { name: "tailBaseEdgeB", point: sideB[0] },
        { name: "tailTipEdgeA", point: sideA[sideA.length - 1] },
        { name: "tailTipEdgeB", point: sideB[sideB.length - 1] },
      ];

      return `
        M ${sideA[0].x} ${sideA[0].y}
        ${sideA.slice(1).map((point) => `L ${point.x} ${point.y}`).join(" ")}
        ${sideB.reverse().map((point) => `L ${point.x} ${point.y}`).join(" ")}
        Z
      `;
    };
    const collarPath = collarSurfacePath();
    const tailPath = tailSurfacePath();
    const tailSurfacePoint = (name, fallback) =>
      rig.tailSurfaceDebug?.find?.((item) => item?.name === name)?.point || fallback;

    return `
      <g class="cat-surface-render">
        ${
          this.isCatRenderLayerVisible("body_surface")
            ? `
              <path
                d="
                  M ${rig.chest.x} ${rig.chest.y}
                  Q ${rig.midSpine.x} ${rig.midSpine.y}
                    ${rig.sacrum.x} ${rig.sacrum.y}
                  L ${bellyGuide.bellyLine.end.x} ${bellyGuide.bellyLine.end.y}
                  Q ${bellyGuide.bellyLine.mid.x} ${bellyGuide.bellyLine.mid.y}
                    ${bellyGuide.bellyLine.start.x} ${bellyGuide.bellyLine.start.y}
                  Z
                "
                class="cat-surface-body"
                style="opacity: ${this.getCatRenderLayerOpacity("body_surface")};"
              />
            `
            : ""
        }

        ${
          this.isCatRenderLayerVisible("chest_surface")
            ? `
              <path
                d="
                  M ${rig.neckBase.x} ${rig.neckBase.y}
                  Q ${rig.chest.x} ${rig.chest.y}
                    ${bellyGuide.bellyLine.start.x} ${bellyGuide.bellyLine.start.y}
                  Q ${rig.shoulderJoint.x} ${rig.shoulderJoint.y}
                    ${rig.neckBase.x} ${rig.neckBase.y}
                  Z
                "
                class="cat-surface-chest"
                style="opacity: ${this.getCatRenderLayerOpacity("chest_surface")};"
              />
            `
            : ""
        }

        ${
          this.isCatRenderLayerVisible("body_contour_surface")
            ? `
              <path
                d="${bodyContourPath}"
                class="cat-surface-body-contour"
                style="opacity: ${this.getCatRenderLayerOpacity("body_contour_surface")};"
              />
            `
            : ""
        }

        ${
          this.isCatRenderLayerVisible("collar_surface")
            ? ` 
              <path
                d="${collarPath}"
                class="cat-surface-collar"
                style="opacity: ${this.getCatRenderLayerOpacity("collar_surface")};"
              />
            `
            : ""
        }

        ${
          this.isCatRenderLayerVisible("rear_surface")
            ? `
              <g style="opacity: ${this.getCatRenderLayerOpacity("rear_surface")};">
                <g class="cat-surface-far-limb" style="opacity: 0.42;">
                  ${rearPatch(rig.hipJoint, rig.rearKneeFar, rig.rearHockFar, rig.rearPawFar, "cat-surface-rear far")}
                </g>
                ${rearPatch(rig.hipJoint, rig.rearKneeNear, rig.rearHockNear, rig.rearPawNear)}
              </g>
            `
            : ""
        }
        ${
          this.isCatRenderLayerVisible("front_surface")
            ? `
              <g style="opacity: ${this.getCatRenderLayerOpacity("front_surface")};">
                <g class="cat-surface-far-limb" style="opacity: 0.42;">
                  ${frontLegSurface(rig.shoulderJoint, rig.frontElbowFar, rig.frontWristFar, rig.frontPawFar, "cat-surface-front far")}
                </g>
                ${frontLegSurface(rig.shoulderJoint, rig.frontElbowNear, rig.frontWristNear, rig.frontPawNear)}
              </g>
            `
            : ""
        }

        ${
          this.isCatRenderLayerVisible("topline")
            ? `
              <path
                d="
                  M ${rig.chest.x} ${rig.chest.y}
                  Q ${rig.midSpine.x} ${rig.midSpine.y}
                    ${rig.sacrum.x} ${rig.sacrum.y}
                "
                class="cat-surface-topline"
                style="opacity: ${this.getCatRenderLayerOpacity("topline")};"
              />
            `
            : ""
        }
        ${
          this.isCatRenderLayerVisible("belly_surface")
            ? `
              <path
                d="
                  M ${bellyGuide.bellyLine.start.x} ${bellyGuide.bellyLine.start.y}
                  Q ${bellyGuide.bellyLine.mid.x} ${bellyGuide.bellyLine.mid.y}
                    ${bellyGuide.bellyLine.end.x} ${bellyGuide.bellyLine.end.y}
                "
                class="cat-surface-belly"
                style="opacity: ${this.getCatRenderLayerOpacity("belly_surface")};"
              />
            `
            : ""
        }

        ${
          this.isCatRenderLayerVisible("tail_surface")
            ? `
              <g style="opacity: ${this.getCatRenderLayerOpacity("tail_surface")};">
                <path
                  d="${tailPath}"
                  class="cat-surface-tail"
                />
                <path
                  d="
                    M ${tailSurfacePoint("tailMid", rig.tailMid).x} ${tailSurfacePoint("tailMid", rig.tailMid).y}
                    Q ${tailSurfacePoint("tailTipControl", this.getCatTailTipControl(rig)).x} ${tailSurfacePoint("tailTipControl", this.getCatTailTipControl(rig)).y}
                      ${tailSurfacePoint("tailTip", rig.tailTip).x} ${tailSurfacePoint("tailTip", rig.tailTip).y}
                  "
                  class="cat-surface-tail-tip"
                />
              </g>
            `
            : ""
        }
      </g>
    `;
  }

  renderCatSurfaceGuides(bellyGuide) {
    if (!bellyGuide) return "";

    const hasBand = (band) => Boolean(band?.front && band?.rear);

    const renderBand = (band, className = "cat-surface-line") => {
      if (!hasBand(band)) return "";

      return `
        <line
          x1="${band.front.x}"
          y1="${band.front.y}"
          x2="${band.rear.x}"
          y2="${band.rear.y}"
          class="${className}"
        />
      `;
    };

    const renderPatch = (patch) => {
      if (!patch?.points?.length) return "";

      return `
        <polygon
          points="${patch.points.map((point) => `${point.x},${point.y}`).join(" ")}"
          class="cat-surface-fill"
        />
        <polyline
          points="${patch.points
            .concat([patch.points[0]])
            .map((point) => `${point.x},${point.y}`)
            .join(" ")}"
          class="cat-surface-line"
        />
      `;
    };

    const nearBand = bellyGuide.nearJointBand;
    const farBand = bellyGuide.farJointBand;
    const undersideSurface =
      hasBand(nearBand) && hasBand(farBand)
        ? `
          <polygon
            points="
              ${nearBand.front.x},${nearBand.front.y}
              ${farBand.front.x},${farBand.front.y}
              ${farBand.rear.x},${farBand.rear.y}
              ${nearBand.rear.x},${nearBand.rear.y}
            "
            class="cat-surface-fill"
          />
        `
        : "";

    return `
      <g class="cat-surface-guides">
        ${undersideSurface}
        ${renderBand(nearBand)}
        ${renderBand(farBand)}
        ${renderPatch(bellyGuide.patches?.rearNearUpperLeg)}
        ${renderPatch(bellyGuide.patches?.rearFarUpperLeg)}
      </g>
    `;
  }

  getCatHeadTemplate() {
    return {
      viewBox: { x: 0, y: 0, width: 841.89, height: 595.28 },

      /*
        Author-provided template anchors from Illustrator.

        Important:
        This SVG was authored left-facing.
        Therefore:
        - cat_facing left  = no mirror
        - cat_facing right = horizontal mirror
      */
      skullCenter: { x: 488.74, y: 173.76 },
      jawPivot: { x: 488.74, y: 348.58 },
      neckAttach: { x: 626.47, y: 173.76 },
      eyeGuide: { x: 307.78, y: 207.26 },

      fitWidth: Number(
        this.getCatRuntimeConfigValue("cat_head_template_fit_width", this.c.cat_head_template_fit_width || 520)
      ),
      fitHeight: Number(
        this.getCatRuntimeConfigValue("cat_head_template_fit_height", this.c.cat_head_template_fit_height || 360)
      ),
      templateScale: Math.max(
        0.05,
        Number(this.getCatRuntimeConfigValue("cat_head_template_scale", this.c.cat_head_template_scale || 1))
      ),

      skullPath: `
        M213.17,400.34
        c-39.76-12.92-43.24-51.39-54.75-83.64
        c-35.08-34.6,30.53-60.31,48.8-84.84
        c50.05-54.13,34.59-113.57,120.81-155.11
        C627.46-94.91,786.66,232.11,570.22,347.56
        c-66.81,20.31-195.53,34.73-249.57,55.88
        C262.15,436.53,270.19,416.08,213.17,400.34z
      `,

      jawPath: `
        M212.83,397.84
        c29.27,0.71,53.03,37.78,79.84,15.79
        c36.11-26.03,97.5-14.09,117.47-60.7
        c16.62-39.21,67.33-27.52,100.24-42.97
        c95.65-27.31,30.89,101.21-16.76,120.15
        C416.74,458.62,212.17,539.65,212.83,397.84z
      `,
    };
  }

  getCatHeadTemplateFlipSign(rig) {
    /*
      The authored SVG is left-facing.

      rig.cfg.frontSign:
      - left-facing cat  => -1
      - right-facing cat =>  1

      SVG flip:
      - left-facing cat  =>  1  no mirror
      - right-facing cat => -1  mirror

      So the SVG flip is the inverse of frontSign.
    */
    return rig.cfg.frontSign === 1 ? -1 : 1;
  }

  getCatVisualHeadTilt(rig) {
    /*
      cat_v2_head_tilt is authored from the left-facing cat's point of view.

      When the cat faces right, the pose is mirrored, so the visual tilt angle
      needs to mirror too.

      Example:
      - left-facing neutral tilt:  -13
      - right-facing neutral tilt: +13
    */
    return -Number(rig.cfg.frontSign || -1) * Number(rig.skull?.tilt || 0);
  }

  getCatHeadTemplateOffset(rig, template, localPoint) {
    /*
      Converts a local authored head-template point into an offset from the
      solved skull centre.

      This is useful in both directions:

      - skull centre -> template point:
          skull + offset

      - template point -> skull centre:
          socket - offset

      The important bit is that this uses the same mirroring, scaling, visual
      head tilt, and template scale as the visible rendered head.
    */

    const flip = this.getCatHeadTemplateFlipSign(rig);
    const templateScale = Number(template.templateScale || 1);

    const scaleXAbs =
      (Number(rig.skull.width || 1) / Number(template.fitWidth || 1)) *
      templateScale;

    const scaleY =
      (Number(rig.skull.height || 1) / Number(template.fitHeight || 1)) *
      templateScale;

    const localDx =
      (Number(localPoint.x) - Number(template.skullCenter.x)) *
      flip *
      scaleXAbs;

    const localDy =
      (Number(localPoint.y) - Number(template.skullCenter.y)) * scaleY;

    return this.rotatePoint(
      { x: localDx, y: localDy },
      { x: 0, y: 0 },
      this.getCatVisualHeadTilt(rig)
    );
  }

  getCatHeadTemplatePoint(rig, template, localPoint) {
    const offset = this.getCatHeadTemplateOffset(rig, template, localPoint);

    return {
      x:
        Number(rig.skull.x) +
        Number(this.getCatRuntimeConfigValue("cat_head_template_offset_x", this.c.cat_head_template_offset_x || 0)) *
          rig.cfg.scale +
        offset.x,
      y:
        Number(rig.skull.y) +
        Number(this.getCatRuntimeConfigValue("cat_head_template_offset_y", this.c.cat_head_template_offset_y || 0)) *
          rig.cfg.scale +
        offset.y,
    };
  }

  getCatHeadNeckSocket(rig) {
    /*
      The visible head is now driven by the authored SVG template, including:
      - facing-aware horizontal mirroring
      - visual tilt mirroring
      - template scaling
      - template offsets

      So anything that visually attaches to the head should use template space
      too. The neck socket is the main example.

      If for any reason the template/anchor is unavailable, fall back to the
      older proportional estimate.
    */

    const template = this.getCatHeadTemplate?.();

    if (template?.neckAttach) {
      return this.getCatHeadTemplatePoint(rig, template, template.neckAttach);
    }

    const front = Number(rig?.cfg?.frontSign || -1);

    return {
      x: Number(rig?.skull?.x || 0) - front * Number(rig?.skull?.width || 0) * 0.35,
      y: Number(rig?.skull?.y || 0) + Number(rig?.skull?.height || 0) * 0.08,
    };
  }

  getCatSkullFromNeckSocket({ socket, skullPrototype, cfg } = {}) {
    /*
      Inverse of getCatHeadNeckSocket.

      Given a desired/constrained neck socket position, rebuild the skull centre
      so the rendered head's authored neckAttach point sits exactly on that
      socket.

      This is the key to making the neck anatomical:
      the neck solves to a socket, then the skull follows from that socket.
    */

    const template = this.getCatHeadTemplate?.();

    const skull = {
      x: Number(skullPrototype?.x || 0),
      y: Number(skullPrototype?.y || 0),
      width: Number(skullPrototype?.width || 1),
      height: Number(skullPrototype?.height || 1),
      tilt: Number(skullPrototype?.tilt || 0),
      roundness: Number(skullPrototype?.roundness || 0),
    };

    if (!template?.neckAttach) {
      const front = Number(cfg?.frontSign || -1);

      return {
        ...skull,
        x: Number(socket?.x || 0) + front * skull.width * 0.35,
        y: Number(socket?.y || 0) - skull.height * 0.08,
      };
    }

    const rig = {
      skull,
      cfg: {
        ...(cfg || {}),
        scale: Number(cfg?.scale || this.c.cat_scale || 1),
      },
    };

    const offset = this.getCatHeadTemplateOffset(
      rig,
      template,
      template.neckAttach
    );

    return {
      ...skull,
      x:
        Number(socket?.x || 0) -
        Number(this.getCatRuntimeConfigValue("cat_head_template_offset_x", this.c.cat_head_template_offset_x || 0)) *
          rig.cfg.scale -
        offset.x,
      y:
        Number(socket?.y || 0) -
        Number(this.getCatRuntimeConfigValue("cat_head_template_offset_y", this.c.cat_head_template_offset_y || 0)) *
          rig.cfg.scale -
        offset.y,
    };
  }

  getCatRestingNeckSocket({
    neckBase,
    desiredSocket,
    anatomy,
    cfg,
    source = "config",
    scale = 1,
    authorityScale = 1,
  } = {}) {
    /*
      Resting neck socket preference.

      The head target says where the skull wants to be. The neck socket says how
      the head attaches to the body. For a relaxed walking cat, that socket
      should usually sit a little forward and above the chest, giving the neck
      a real upright component instead of a flat line that drags the shoulder.
    */

    const safeBase = {
      x: Number(neckBase?.x || 0),
      y: Number(neckBase?.y || 0),
    };
    const safeDesired = {
      x: Number(desiredSocket?.x || safeBase.x),
      y: Number(desiredSocket?.y || safeBase.y),
    };
    const neckLength = Math.max(1, Number(anatomy?.head?.neckLength || 1));
    const front = Number(cfg?.frontSign || -1);
    const sourceName = String(source || "config");
    const sourceBlend =
      sourceName === "override" || sourceName === "drag" ? 0.35 : 1;
    const blend =
      this.clamp(Number(this.c.cat_neck_rest_posture_blend ?? 0.32), 0, 1) *
      sourceBlend *
      this.clamp(Number(authorityScale ?? 1), 0, 1);

    const restSocket = {
      x:
        safeBase.x +
        front *
          neckLength *
          this.clamp(Number(this.c.cat_neck_rest_forward_ratio ?? 0.42), -1, 1),
      y:
        safeBase.y -
        neckLength *
          this.clamp(Number(this.c.cat_neck_rest_lift_ratio ?? 0.88), -0.5, 2),
    };

    return {
      x: this.lerp(safeDesired.x, restSocket.x, blend),
      y: this.lerp(safeDesired.y, restSocket.y, blend),
      desiredSocket: safeDesired,
      restSocket,
      blend,
      source: sourceName,
    };
  }

  solveCatNeckLimb({
    neckBase,
    desiredSkull,
    anatomy,
    cfg,
    scale = 1,
    authorityScale = 1,
  } = {}) {
    /*
      Anatomical neck limb.

      The head target proposes a desired skull. From that we derive the desired
      head-side neck socket. The neck then constrains that socket relative to
      the body-side neck base.

      Final skull position is rebuilt from the constrained socket.

      This means:
      - the neck has a real anatomical length
      - the skull is no longer absolute truth if it would break the neck
      - the rendered neck socket and rendered head template stay aligned
    */

    const s = Number(scale) || 1;

    const safeBase = {
      x: Number(neckBase?.x || 0),
      y: Number(neckBase?.y || 0),
    };

    const safeSkull = {
      x: Number(desiredSkull?.x || safeBase.x),
      y: Number(desiredSkull?.y || safeBase.y),
      width: Number(desiredSkull?.width || 1),
      height: Number(desiredSkull?.height || 1),
      tilt: Number(desiredSkull?.tilt || 0),
      roundness: Number(desiredSkull?.roundness || 0),
      source: desiredSkull?.source || "config",
    };

    const desiredSocket = this.getCatHeadNeckSocket({
      skull: safeSkull,
      cfg: {
        ...(cfg || {}),
        scale: s,
      },
    });

    const postureSocket = this.getCatRestingNeckSocket({
      neckBase: safeBase,
      desiredSocket,
      anatomy,
      cfg,
      source: safeSkull.source || "config",
      scale: s,
      authorityScale,
    });

    const neckVector = {
      x: postureSocket.x - safeBase.x,
      y: postureSocket.y - safeBase.y,
    };

    const neckDistance = Math.hypot(neckVector.x, neckVector.y);

    /*
      Neck length is intentionally a little forgiving because the authored head
      socket is a visual attachment point, not a pure skeleton joint.
    */
    const maxNeckDistance =
      Number(anatomy?.head?.neckLength || 0) *
        Math.max(0.1, Number(this.c.cat_neck_max_stretch_ratio ?? 2.2)) +
      Number(anatomy?.head?.skullHeight || safeSkull.height || 0) * 0.35;

    let skullSocket = {
      x: postureSocket.x,
      y: postureSocket.y,
    };
    let constrained = false;

    if (neckDistance > maxNeckDistance && neckDistance > 0.001) {
      const direction = {
        x: neckVector.x / neckDistance,
        y: neckVector.y / neckDistance,
      };

      skullSocket = {
        x: safeBase.x + direction.x * maxNeckDistance,
        y: safeBase.y + direction.y * maxNeckDistance,
      };

      constrained = true;
    }

    const finalSkull = this.getCatSkullFromNeckSocket({
      socket: skullSocket,
      skullPrototype: safeSkull,
      cfg: {
        ...(cfg || {}),
        scale: s,
      },
    });

    const neckAxis = this.normaliseVector(
      {
        x: skullSocket.x - safeBase.x,
        y: skullSocket.y - safeBase.y,
      },
      { x: Number(cfg?.frontSign || -1), y: 0 }
    );

    const neckSide = {
      x: -neckAxis.y,
      y: neckAxis.x,
    };

    const upwardNeck = skullSocket.y < safeBase.y;
    const neckCurve =
      Number(anatomy?.head?.neckLength || 0) * (upwardNeck ? 0.34 : 0.18);

    const neckControl = {
      x: this.lerp(safeBase.x, skullSocket.x, 0.5),
      y:
        this.lerp(safeBase.y, skullSocket.y, 0.5) -
        neckCurve +
        neckSide.y * neckCurve * 0.18,
    };

    return {
      neckBase: safeBase,
      neckTip: skullSocket,
      skullSocket,
      neckControl,
      skull: finalSkull,
      desiredSocket,
      restSocket: postureSocket.restSocket,
      neckPostureBlend: postureSocket.blend,
      constrained,
      neckDistance,
      maxNeckDistance,
    };
  }

  renderCatHead(rig) {
    if (!rig) return "";

    if (["feline_v5_compact_head_direct_register", "feline_v6_articulated_direct_register", "feline_v7_refined_articulated_direct_register", "feline_v8_tucked_articulated_direct_register", "feline_v9_flowing_articulated_direct_register"].includes(this.getCatModel())) {
      return this.renderFelineV5CompactHead(rig);
    }

    /*
      Draw order:
      - front ear softer/behind
      - jaw behind/under the skull
      - skull on top so the cheek area overlaps the jaw correctly
      - rear ear last for the stronger silhouette
    */
    return `
      <g class="cat-head-rig">
        ${this.renderCatEar(rig.frontEar, "front")}
        ${this.renderCatJaw(rig)}
        ${this.renderCatSkull(rig)}
        ${this.renderCatEar(rig.rearEar, "rear")}
      </g>
    `;
  }

  renderCatSkull(rig) {
    const template = this.getCatHeadTemplate();
    const fill = this.getCatHeadFill();
    const flip = this.getCatHeadTemplateFlipSign(rig);
    const templateScale = Number(template.templateScale || 1);
    const visualHeadTilt = this.getCatVisualHeadTilt(rig);

    const scaleX =
      (Number(rig.skull.width || 1) / Number(template.fitWidth || 1)) *
      templateScale *
      flip;

    const scaleY =
      (Number(rig.skull.height || 1) / Number(template.fitHeight || 1)) *
      templateScale;

    const headX =
      Number(rig.skull.x) +
      Number(this.getCatRuntimeConfigValue("cat_head_template_offset_x", this.c.cat_head_template_offset_x || 0)) *
        rig.cfg.scale;

    const headY =
      Number(rig.skull.y) +
      Number(this.getCatRuntimeConfigValue("cat_head_template_offset_y", this.c.cat_head_template_offset_y || 0)) *
        rig.cfg.scale;

    const transform = [
      `translate(${headX} ${headY})`,
      `rotate(${visualHeadTilt})`,
      `scale(${scaleX} ${scaleY})`,
      `translate(${-template.skullCenter.x} ${-template.skullCenter.y})`,
    ].join(" ");

    return `
      <path
        d="${template.skullPath.trim().replace(/\s+/g, " ")}"
        class="cat-head-shape"
        transform="${transform}"
        style="fill: ${fill};"
      />
    `;
  }

  renderCatJaw(rig) {
    const template = this.getCatHeadTemplate();
    const fill = this.getCatHeadFill();
    const flip = this.getCatHeadTemplateFlipSign(rig);
    const templateScale = Number(template.templateScale || 1);
    const visualHeadTilt = this.getCatVisualHeadTilt(rig);

    const scaleXAbs =
      (Number(rig.skull.width || 1) / Number(template.fitWidth || 1)) *
      templateScale;

    const scaleY =
      (Number(rig.skull.height || 1) / Number(template.fitHeight || 1)) *
      templateScale;

    const scaleX = scaleXAbs * flip;

    const jawPivotWorld = this.getCatHeadTemplatePoint(
      rig,
      template,
      template.jawPivot
    );

    const cfgScale = Number(rig.cfg.scale || 1);

    const localOffset = {
      x:
        Number(this.getCatRuntimeConfigValue("cat_jaw_template_offset_x", this.c.cat_jaw_template_offset_x || 0)) *
          cfgScale *
          flip +
        Number(this.getCatRuntimeConfigValue("cat_jaw_pivot_x", this.c.cat_jaw_pivot_x || 0)) *
          cfgScale *
          rig.cfg.frontSign,
      y:
        (Number(this.getCatRuntimeConfigValue("cat_jaw_template_offset_y", this.c.cat_jaw_template_offset_y || 0)) +
          Number(this.getCatRuntimeConfigValue("cat_jaw_pivot_y", this.c.cat_jaw_pivot_y || 0))) *
        cfgScale,
    };

    const rotatedOffset = this.rotatePoint(
      localOffset,
      { x: 0, y: 0 },
      visualHeadTilt
    );

    const finalJawPivot = {
      x: jawPivotWorld.x + rotatedOffset.x,
      y: jawPivotWorld.y + rotatedOffset.y,
    };

    const jawOpenAngle =
      Number(this.getCatRuntimeConfigValue("cat_jaw_angle", this.c.cat_jaw_angle || 0)) +
      Number(this.getCatRuntimeConfigValue("cat_mouth_open", this.c.cat_mouth_open || 0)) * 1.2;

    const jawAngle = visualHeadTilt + rig.cfg.frontSign * jawOpenAngle;

    const transform = [
      `translate(${finalJawPivot.x} ${finalJawPivot.y})`,
      `rotate(${jawAngle})`,
      `scale(${scaleX} ${scaleY})`,
      `translate(${-template.jawPivot.x} ${-template.jawPivot.y})`,
    ].join(" ");

    return `
      <path
        d="${template.jawPath.trim().replace(/\s+/g, " ")}"
        class="cat-head-shape"
        transform="${transform}"
        style="
          fill: ${fill};
          opacity: ${this.clamp(Number(this.getCatRuntimeConfigValue("cat_jaw_opacity", this.c.cat_jaw_opacity ?? 0.72)), 0, 1)};
        "
      />
    `;
  }

  renderCatEar(ear, role = "rear") {
    if (!ear) return "";

    const opacity =
      role === "front"
        ? Number(this.getCatRuntimeConfigValue("cat_front_ear_opacity", this.c.cat_front_ear_opacity ?? ear.opacity ?? 0.55))
        : Number(this.getCatRuntimeConfigValue("cat_rear_ear_opacity", this.c.cat_rear_ear_opacity ?? ear.opacity ?? 1));

    return `
      <path
        d="
          M ${ear.outer.x} ${ear.outer.y}
          L ${ear.tip.x} ${ear.tip.y}
          L ${ear.inner.x} ${ear.inner.y}
          Z
        "
        class="cat-head-shape"
        style="
          fill: ${this.getCatHeadFill()};
          opacity: ${this.clamp(opacity, 0, 1)};
        "
      />
    `;
  }

  updateCatDebugLayer() {
    const layer = this.shadowRoot.querySelector("#catDebugLayer");
    if (!layer) return;

    if (!this.bool(this.getCatRuntimeConfigValue("show_cat_debug", this.c.show_cat_debug))) {
      layer.innerHTML = "";
      return;
    }

    const rig = this.catState?.rig || this.solveCatRig();

    if (!rig) {
      layer.innerHTML = "";
      return;
    }

    this.recordCatMotionTrace(rig);

    const debugOpacity = this.clamp(
      Number(this.getCatRuntimeConfigValue("cat_debug_opacity", this.c.cat_debug_opacity ?? 0.45)),
      0,
      1
    );
    const debugNodeOpacity = this.clamp(
      Number(this.getCatRuntimeConfigValue("cat_debug_node_opacity", this.c.cat_debug_node_opacity ?? debugOpacity)),
      0,
      1
    );
    const debugLabelOpacity = this.clamp(
      Number(this.getCatRuntimeConfigValue("cat_debug_label_opacity", this.c.cat_debug_label_opacity ?? debugOpacity)),
      0,
      1
    );
    const debugLabelSize = Math.max(
      1,
      Number(this.getCatRuntimeConfigValue("cat_debug_label_size", this.c.cat_debug_label_size ?? 3))
    );
    const debugPawOpacity = this.clamp(
      Number(this.getCatRuntimeConfigValue("cat_debug_paw_opacity", this.c.cat_debug_paw_opacity ?? debugOpacity)),
      0,
      1
    );
    const debugNodeSize = Math.max(
      0.1,
      Number(this.getCatRuntimeConfigValue("cat_node_size", this.c.cat_node_size ?? 3))
    );
    const debugSkeletonVisible = this.bool(
      this.getCatRuntimeConfigValue("show_cat_debug_skeleton", this.c.show_cat_debug_skeleton)
    );
    const legacyAllNodes = this.bool(
      this.getCatRuntimeConfigValue("show_cat_nodes", this.c.show_cat_nodes)
    );
    const bodyNodesVisible =
      legacyAllNodes ||
      this.bool(this.getCatRuntimeConfigValue("show_cat_body_nodes", this.c.show_cat_body_nodes));
    const limbNodesVisible =
      legacyAllNodes ||
      this.bool(this.getCatRuntimeConfigValue("show_cat_limb_nodes", this.c.show_cat_limb_nodes));
    const headNodesVisible =
      legacyAllNodes ||
      this.bool(this.getCatRuntimeConfigValue("show_cat_head_nodes", this.c.show_cat_head_nodes));
    const tailNodesVisible =
      legacyAllNodes ||
      this.bool(this.getCatRuntimeConfigValue("show_cat_tail_nodes", this.c.show_cat_tail_nodes));
    const earNodesVisible =
      legacyAllNodes ||
      this.bool(this.getCatRuntimeConfigValue("show_cat_ear_nodes", this.c.show_cat_ear_nodes));
    const bodyContourNodesVisible = this.bool(
      this.getCatRuntimeConfigValue("show_cat_body_contour_nodes", this.c.show_cat_body_contour_nodes)
    );
    const bodyContourLabelsVisible = this.bool(
      this.getCatRuntimeConfigValue("show_cat_body_contour_labels", this.c.show_cat_body_contour_labels)
    );
    const tailSurfaceNodesVisible = this.bool(
      this.getCatRuntimeConfigValue("show_cat_tail_surface_nodes", this.c.show_cat_tail_surface_nodes)
    );
    const tailSurfaceLabelsVisible = this.bool(
      this.getCatRuntimeConfigValue("show_cat_tail_surface_labels", this.c.show_cat_tail_surface_labels)
    );
    const collarNodesVisible = this.bool(
      this.getCatRuntimeConfigValue("show_cat_collar_nodes", this.c.show_cat_collar_nodes)
    );
    const collarLabelsVisible = this.bool(
      this.getCatRuntimeConfigValue("show_cat_collar_labels", this.c.show_cat_collar_labels)
    );
    const pawContactVisible = this.bool(
      this.getCatRuntimeConfigValue("show_cat_paw_contact_debug", this.c.show_cat_paw_contact_debug)
    );
    const motionTraceVisible = this.bool(
      this.getCatRuntimeConfigValue("show_cat_motion_trace", this.c.show_cat_motion_trace)
    );
    const supportLabelVisible = this.bool(
      this.getCatRuntimeConfigValue("show_cat_support_debug_label", this.c.show_cat_support_debug_label)
    );

    /*
      Contact-state colour key.

      Keep this centralised. Later we can reuse this exact state key for:
      - paw candidates
      - surface/landing zones
      - gait phases
      - interaction targets
      - support polygons
    */
    const contactStateColor = (state) => {
      switch (String(state || "unknown")) {
        case "planted":
          return this.c.cat_debug_planted_color || "var(--success-color)";
        case "landing":
          return this.c.cat_debug_landing_color || "var(--warning-color)";
        case "hanging":
          return this.c.cat_debug_hanging_color || "var(--info-color)";
        default:
          return (
            this.c.cat_debug_unknown_contact_color ||
            "var(--secondary-text-color)"
          );
      }
    };

    const pawDebugItems = [
      {
        id: "frontNear",
        label: "FN",
        actualName: "frontPawNear",
        desiredName: "desiredFrontPawNear",
        stateName: "frontPawNearState",
      },
      {
        id: "frontFar",
        label: "FF",
        actualName: "frontPawFar",
        desiredName: "desiredFrontPawFar",
        stateName: "frontPawFarState",
      },
      {
        id: "rearNear",
        label: "RN",
        actualName: "rearPawNear",
        desiredName: "desiredRearPawNear",
        stateName: "rearPawNearState",
      },
      {
        id: "rearFar",
        label: "RF",
        actualName: "rearPawFar",
        desiredName: "desiredRearPawFar",
        stateName: "rearPawFarState",
      },
    ];

    const getPawState = (item) => {
      const actual = rig[item.actualName];
      return (
        actual?.state ||
        rig[item.stateName] ||
        rig.supportState?.paws?.find?.((paw) => paw?.name === item.id)?.state ||
        "unknown"
      );
    };

    const getPointStateName = (pointName) => {
      const item = pawDebugItems.find(
        (paw) => paw.actualName === pointName || paw.desiredName === pointName
      );

      return item ? getPawState(item) : null;
    };

    const nodeGroups = [
      {
        visible: bodyNodesVisible,
        names: ["anchor", "chest", "midSpine", "sacrum", "shoulderJoint", "hipJoint"],
      },
      {
        visible: bodyNodesVisible || headNodesVisible,
        names: ["neckBase", "neckControl", "neckTip"],
      },
      {
        visible: headNodesVisible,
        names: ["skull", "nose", "muzzleTop", "muzzleBottom", "jawPivot", "jawTip"],
      },
      {
        visible: limbNodesVisible,
        names: [
          "frontElbowNear",
          "frontWristNear",
          "frontPawNear",
          "desiredFrontPawNear",
          "frontElbowFar",
          "frontWristFar",
          "frontPawFar",
          "desiredFrontPawFar",
          "rearKneeNear",
          "rearHockNear",
          "rearPawNear",
          "desiredRearPawNear",
          "rearKneeFar",
          "rearHockFar",
          "rearPawFar",
          "desiredRearPawFar",
        ],
      },
      {
        visible: tailNodesVisible,
        names: ["tailBase", "tailControl", "tailMid", "tailTip"],
      },
    ];

    const pointNames = nodeGroups
      .filter((group) => group.visible)
      .flatMap((group) => group.names);

    const nodeMarkup = pointNames.length
      ? pointNames
          .map((name) => {
            const p = rig[name];
            if (!p) return "";

            const contactState = getPointStateName(name);
            const contactColor = contactState
              ? contactStateColor(contactState)
              : null;

            const pointStyle = contactColor
              ? `style="fill: ${contactColor}; opacity: ${Math.min(
                  1,
                  debugNodeOpacity + 0.35
                )};"`
              : `style="opacity: ${debugNodeOpacity};"`;

            const textStyle = contactColor
              ? `style="fill: ${contactColor}; font-size: ${debugLabelSize}px; opacity: ${Math.min(
                  1,
                  debugLabelOpacity + 0.15
                )};"`
              : `style="font-size: ${debugLabelSize}px; opacity: ${debugLabelOpacity};"`;

            if (debugNodeOpacity <= 0 && debugLabelOpacity <= 0) return "";

            const circleMarkup = debugNodeOpacity > 0
              ? `
                <circle
                  cx="${p.x}"
                  cy="${p.y}"
                  r="${debugNodeSize}"
                  class="cat-debug-point"
                  ${pointStyle}
                />
              `
              : "";

            return `
              <g class="cat-debug-node">
                ${circleMarkup}
                ${
                  debugLabelOpacity > 0
                    ? `<text
                        x="${p.x}"
                        y="${p.y - 5}"
                        class="cat-debug-text"
                        ${textStyle}
                      >${this.esc(name)}</text>`
                    : ""
                }
              </g>
            `;
          })
          .join("")
      : "";

    const earNodeMarkup = earNodesVisible
      ? ["frontEar", "rearEar"]
          .map((name) => {
            const ear = rig[name];
            if (!ear) return "";

            return `
              <g class="cat-debug-node">
                ${
                  debugNodeOpacity > 0
                    ? `<circle cx="${ear.base.x}" cy="${ear.base.y}" r="${debugNodeSize}" class="cat-debug-point" style="opacity: ${debugNodeOpacity};" />
                       <circle cx="${ear.tip.x}" cy="${ear.tip.y}" r="${debugNodeSize}" class="cat-debug-point" style="opacity: ${debugNodeOpacity};" />`
                    : ""
                }
                ${
                  debugLabelOpacity > 0
                    ? `<text x="${ear.base.x}" y="${ear.base.y - 6}" class="cat-debug-text" style="font-size: ${debugLabelSize}px; opacity: ${debugLabelOpacity};">${this.esc(name)}</text>`
                    : ""
                }
              </g>
            `;
          })
          .join("")
      : "";

    const renderSurfaceDebugNodes = (surfaceKey, items, nodesVisible, labelsVisible, color, className) =>
      (nodesVisible || labelsVisible) && Array.isArray(items)
        ? items
            .map((item) => {
              const p = item?.point;
              if (!p) return "";
              const name = item.name || "surfacePoint";
              const changed = this.isCatFineTuneNodeChanged(surfaceKey, name);
              const highlighted = this.isCatFineTuneNodeHighlighted(surfaceKey, name);
              const nodeColor = highlighted
                ? "deepskyblue"
                : changed
                  ? "var(--warning-color)"
                  : color;
              const nodeRadius = highlighted
                ? Math.max(0.4, debugNodeSize * 0.85)
                : changed
                  ? Math.max(0.5, debugNodeSize * 0.9)
                  : Math.max(0.4, debugNodeSize * 0.85);
              const labelOpacity = highlighted
                ? Math.min(1, debugLabelOpacity + 0.45)
                : changed
                  ? Math.min(1, debugLabelOpacity + 0.25)
                  : debugLabelOpacity;
              const circleMarkup =
                nodesVisible && debugNodeOpacity > 0
                  ? `
                    ${
                      highlighted
                        ? `<circle
                            cx="${p.x}"
                            cy="${p.y}"
                            r="${nodeRadius + 2.2}"
                            fill="none"
                            stroke="deepskyblue"
                            stroke-width="1"
                            opacity="0.9"
                          />`
                        : ""
                    }
                    <circle
                      cx="${p.x}"
                      cy="${p.y}"
                      r="${nodeRadius}"
                      class="cat-debug-point"
                      style="fill: ${nodeColor}; opacity: ${highlighted ? Math.min(1, debugNodeOpacity + 0.35) : debugNodeOpacity};"
                    />
                  `
                  : "";
              const labelMarkup =
                labelsVisible && debugLabelOpacity > 0
                  ? `
                    <text
                      x="${p.x + 2.2}"
                      y="${p.y - 2.2}"
                      class="cat-debug-text"
                      style="fill: ${nodeColor}; font-size: ${debugLabelSize}px; opacity: ${labelOpacity};"
                    >${this.esc(name)}${changed ? " *" : ""}</text>
                  `
                  : "";

              return `
                <g class="${className}">
                  ${circleMarkup}
                  ${labelMarkup}
                </g>
              `;
            })
            .join("")
        : "";

    const bodyContourMarkup = renderSurfaceDebugNodes(
      "body_contour",
      rig.bodyContourDebug,
      bodyContourNodesVisible,
      bodyContourLabelsVisible,
      "var(--warning-color)",
      "cat-debug-body-contour-node"
    );
    const tailSurfaceMarkup = renderSurfaceDebugNodes(
      "tail_surface",
      rig.tailSurfaceDebug,
      tailSurfaceNodesVisible,
      tailSurfaceLabelsVisible,
      "var(--info-color)",
      "cat-debug-tail-surface-node"
    );
    const collarMarkup = renderSurfaceDebugNodes(
      "collar",
      rig.collarDebug,
      collarNodesVisible,
      collarLabelsVisible,
      "var(--success-color)",
      "cat-debug-collar-node"
    );

    const bounds = rig.bounds;
    const boundsMarkup =
      this.bool(this.getCatRuntimeConfigValue("show_cat_bounds", this.c.show_cat_bounds)) && bounds
        ? `
          <rect
            x="${bounds.x}"
            y="${bounds.y}"
            width="${bounds.width}"
            height="${bounds.height}"
            class="cat-debug-fill"
          />
          <rect
            x="${bounds.x}"
            y="${bounds.y}"
            width="${bounds.width}"
            height="${bounds.height}"
            class="cat-debug-line"
          />
        `
        : "";

    const bellyGuide = rig.bellyGuide || this.getCatBellyLine(rig, rig.anatomy);
    const renderBellyDebugBand = (band, opacity = 0.72) => {
      if (!band?.front || !band?.rear) return "";

      return `
        <line
          x1="${band.front.x}"
          y1="${band.front.y}"
          x2="${band.rear.x}"
          y2="${band.rear.y}"
          class="cat-debug-line"
          style="opacity: ${debugOpacity * opacity}; stroke-dasharray: 2 3;"
        />
      `;
    };

    const renderBellyDebugPatch = (patch) => {
      if (!patch?.points?.length) return "";

      const points = patch.points.map((point) => `${point.x},${point.y}`).join(" ");

      return `
        <polygon
          points="${points}"
          class="cat-debug-fill"
          style="opacity: ${debugOpacity * 0.08};"
        />
      `;
    };

    const bellyDebugMarkup = bellyGuide?.bellyLine
      ? `
        <path
          d="
            M ${bellyGuide.bellyLine.start.x} ${bellyGuide.bellyLine.start.y}
            Q ${bellyGuide.bellyLine.mid.x} ${bellyGuide.bellyLine.mid.y}
              ${bellyGuide.bellyLine.end.x} ${bellyGuide.bellyLine.end.y}
          "
          class="cat-debug-line"
          style="opacity: ${debugOpacity * 0.42};"
        />

        ${renderBellyDebugBand(bellyGuide.nearJointBand || bellyGuide.jointBand, 0.72)}
        ${renderBellyDebugBand(bellyGuide.farJointBand, 0.44)}
        ${renderBellyDebugPatch(bellyGuide.patches?.rearNearUpperLeg)}
        ${renderBellyDebugPatch(bellyGuide.patches?.rearFarUpperLeg)}

        <circle
          cx="${bellyGuide.bellyLine.start.x}"
          cy="${bellyGuide.bellyLine.start.y}"
          r="1.8"
          class="cat-debug-point"
          style="opacity: ${debugOpacity * 0.7};"
        />
        <circle
          cx="${bellyGuide.bellyLine.mid.x}"
          cy="${bellyGuide.bellyLine.mid.y}"
          r="1.8"
          class="cat-debug-point"
          style="opacity: ${debugOpacity * 0.7};"
        />
        <circle
          cx="${bellyGuide.bellyLine.end.x}"
          cy="${bellyGuide.bellyLine.end.y}"
          r="1.8"
          class="cat-debug-point"
          style="opacity: ${debugOpacity * 0.7};"
        />
      `
      : "";

    const skeletonDebugMarkup = debugSkeletonVisible
      ? `
      <path
        d="
          M ${rig.chest.x} ${rig.chest.y}
          Q ${rig.midSpine.x} ${rig.midSpine.y}
            ${rig.sacrum.x} ${rig.sacrum.y}
          ${this.getCatTailRenderPath(rig)}
        "
        class="cat-debug-line"
      />

      <line
        x1="${rig.shoulderJoint.x}"
        y1="${rig.shoulderJoint.y}"
        x2="${rig.hipJoint.x}"
        y2="${rig.hipJoint.y}"
        class="cat-debug-line"
      />

      <line
        x1="${rig.neckBase.x}"
        y1="${rig.neckBase.y}"
        x2="${rig.neckTip.x}"
        y2="${rig.neckTip.y}"
        class="cat-debug-line"
      />

      <line
        x1="${rig.jawPivot.x}"
        y1="${rig.jawPivot.y}"
        x2="${rig.jawTip.x}"
        y2="${rig.jawTip.y}"
        class="cat-debug-line"
      />

      ${bellyDebugMarkup}
    `
      : "";

    /*
      Paw/contact debug.

      Actual paw = larger filled circle
      Desired/contact target = smaller hollow-ish circle
      Dashed line = desired target to actual resolved paw
    */
    const pawContactMarkup = pawContactVisible
      ? pawDebugItems
          .map((item) => {
        const actual = rig[item.actualName];
        const desired = rig[item.desiredName];
        const activeTarget =
          actual?.targetX !== undefined && actual?.targetY !== undefined
            ? {
                x: Number(actual.targetX),
                y: Number(actual.targetY),
              }
            : desired;

        if (!actual) return "";

        const state = getPawState(item);
        const color = contactStateColor(state);
        const labelY = actual.y - 7;

        const desiredMarkup = activeTarget
          ? `
            <line
              x1="${activeTarget.x}"
              y1="${activeTarget.y}"
              x2="${actual.x}"
              y2="${actual.y}"
              style="
                stroke: ${color};
                stroke-width: 1;
                stroke-dasharray: 2 2;
                opacity: ${debugPawOpacity * 0.75};
                fill: none;
              "
            />
            <circle
              cx="${activeTarget.x}"
              cy="${activeTarget.y}"
              r="2.1"
              style="
                fill: none;
                stroke: ${color};
                stroke-width: 1;
                opacity: ${debugPawOpacity * 0.9};
              "
            />
          `
          : "";

        return `
          <g class="cat-debug-paw-contact" data-paw="${this.esc(item.id)}" data-state="${this.esc(state)}">
            ${desiredMarkup}
            <circle
              cx="${actual.x}"
              cy="${actual.y}"
              r="${Math.max(3.2, debugNodeSize + 1.2)}"
              style="
                fill: ${color};
                stroke: var(--card-background-color);
                stroke-width: 0.8;
                opacity: ${Math.min(1, debugPawOpacity)};
              "
            />
            ${
              debugLabelOpacity > 0
                ? `<text
                    x="${actual.x}"
                    y="${labelY}"
                    text-anchor="middle"
                    class="cat-debug-text"
                    style="
                      fill: ${color};
                      opacity: ${debugLabelOpacity};
                      font-size: ${debugLabelSize}px;
                    "
                  >${this.esc(item.label)}:${this.esc(state)}</text>`
                : ""
            }
          </g>
        `;
          })
          .join("")
      : "";

    const motionTraceMarkup = motionTraceVisible
      ? this.renderCatMotionTrace(rig, debugOpacity)
      : "";
    const pawPrintMarkup = this.bool(
      this.getCatRuntimeConfigValue("show_cat_paw_print_debug", this.c.show_cat_paw_print_debug)
    )
      ? this.renderCatPawPrintDebug(debugLabelSize, debugLabelOpacity)
      : "";

    const supportState = rig.supportState?.state || "unknown";
    const supportCount =
      rig.supportState?.supportCount !== undefined
        ? rig.supportState.supportCount
        : "?";

    const supportColor =
      supportState === "supported"
        ? contactStateColor("planted")
        : supportState === "partly_supported"
          ? contactStateColor("landing")
          : supportState === "suspended"
            ? contactStateColor("hanging")
            : contactStateColor("unknown");

    const supportMarkup = supportLabelVisible
      ? `
      <text
        x="${Number(bounds?.x ?? rig.anchor.x) - 8}"
        y="${Number(bounds?.y ?? rig.anchor.y) - 8}"
        font-size="${debugLabelSize}"
        font-family="monospace"
        fill="${supportColor}"
        opacity="${Math.min(1, debugLabelOpacity + 0.35)}"
      >support: ${this.esc(supportState)} (${this.esc(String(supportCount))}/4)</text>
    `
      : "";

    const moodMarkup = this.bool(this.getCatRuntimeConfigValue("show_cat_mood_debug_label", this.c.show_cat_mood_debug_label))
      ? `
        <text
          x="${Number(bounds?.x ?? rig.anchor.x) - 8}"
          y="${Number(bounds?.y ?? rig.anchor.y) - 15}"
          font-size="${debugLabelSize}"
          font-family="monospace"
          fill="${this.c.cat_debug_color}"
          opacity="${Math.min(1, debugLabelOpacity + 0.3)}"
        >mood: ${this.esc(this.getCurrentCatMood())}</text>
      `
      : "";

    layer.innerHTML = `
      <g class="cat-debug">
        ${boundsMarkup}
        ${skeletonDebugMarkup}
        ${motionTraceMarkup}
        ${pawPrintMarkup}
        ${pawContactMarkup}
        ${nodeMarkup}
        ${earNodeMarkup}
        ${bodyContourMarkup}
        ${tailSurfaceMarkup}
        ${collarMarkup}
        ${moodMarkup}
        ${supportMarkup}
      </g>
    `;
  }

  renderFelineV5CompactHead(rig) {
    /*
      Candidate V5 uses the solved neck socket as the head's attachment rather
      than scaling the authored long-muzzle template around skull centre. The
      result is intentionally a compact feline side profile: short muzzle,
      two small ears, high crown, and a continuous throat connection.
    */
    const socket = rig?.neckTip || rig?.neckBase || rig?.skull;
    if (!socket || !rig?.skull) return "";

    const front = Number(rig.solvedFrontSign || rig.cfg?.frontSign || -1);
    const width = Math.max(10, Number(rig.skull.width || 20) * 0.9);
    const height = Math.max(8, Number(rig.skull.height || 12) * 1.05);
    const x = Number(socket.x);
    const y = Number(socket.y);
    const fill = this.getCatHeadFill();
    const path = `
      M ${x - front * width * 0.18} ${y + height * 0.36}
      C ${x - front * width * 0.44} ${y + height * 0.1}, ${x - front * width * 0.42} ${y - height * 0.34}, ${x - front * width * 0.14} ${y - height * 0.5}
      L ${x - front * width * 0.04} ${y - height * 1.08}
      L ${x + front * width * 0.18} ${y - height * 0.52}
      L ${x + front * width * 0.36} ${y - height * 1.02}
      L ${x + front * width * 0.48} ${y - height * 0.36}
      C ${x + front * width * 0.76} ${y - height * 0.2}, ${x + front * width * 0.88} ${y + height * 0.04}, ${x + front * width * 0.7} ${y + height * 0.18}
      C ${x + front * width * 0.56} ${y + height * 0.4}, ${x + front * width * 0.25} ${y + height * 0.52}, ${x - front * width * 0.18} ${y + height * 0.36}
      Z
    `;

    return `<g class="cat-head-rig cat-head-rig-v5"><path d="${path}" fill="${fill}" stroke="none" /></g>`;
  }

  getCatModel() {
    if (this.bool(this.getCatRuntimeConfigValue("show_cat_pixel_preview", this.c.show_cat_pixel_preview))) {
      return "pixel_feline_v1";
    }
    const model = String(this.getCatRuntimeConfigValue("cat_model", this.c.cat_model || "og"));
    return ["og", "feline_v1_direct_register", "feline_v2_smooth_direct_register", "feline_v3_flow_direct_register", "feline_v4_compact_direct_register", "feline_v5_compact_head_direct_register", "feline_v6_articulated_direct_register", "feline_v7_refined_articulated_direct_register", "feline_v8_tucked_articulated_direct_register", "feline_v9_flowing_articulated_direct_register", "feline_v10_split_pin_static", "feline_v11_split_pin_layout_static", "feline_v12_contoured_split_pin_static", "feline_v13_domestic_split_pin_static", "feline_v14_decoupled_tail_static", "feline_v15_balanced_domestic_static", "feline_v16_integrated_skin_static", "feline_v17_integrated_skin_direct_register", "feline_v18_dynamic_fit_direct_register", "feline_v19_independent_direct_register", "feline_v20_support_centred_direct_register", "feline_v21_moderate_stride_direct_register", "feline_v22_short_stride_direct_register", "feline_v23_anatomical_bend_direct_register", "feline_v24_choreographed_feline_walk", "feline_v25_reference_static", "feline_v26_reference_walk", "feline_v27_clean_mass_static", "feline_v28_domestic_cutout_static", "feline_v29_traced_static", "feline_v30_reference_template", "feline_v31_reference_limb_study", "feline_v32_anatomical_study", "feline_v33_jointed_pose_study", "feline_v34_filled_limb_skin", "feline_v35_proportion_study", "feline_v36_grounded_leg_study", "feline_v37_overlap_study", "feline_v38_low_neck_study", "feline_v39_articulated_limb_skin", "feline_v40_landmark_limb_skin", "feline_v41_raised_landmark_limbs", "feline_v42_continuous_cutout", "feline_v43_overlay_limb_skins", "feline_v44_reference_trace_static", "feline_v45_elevated_profile_static", "feline_v46_image_traced_walk_static", "feline_v47_reference_boundary_static", "feline_v48_soft_reference_trace_static", "feline_v49_highres_reference_trace_static", "feline_v50_trace_layer_rig", "feline_v51_trace_limb_rig", "feline_v52_trace_limb_reach_test", "feline_v53_trace_limb_skins", "feline_v54_overlapped_limb_skins", "feline_v55_segmented_limb_skins", "feline_v56_lifted_belly_limb_study", "feline_v57_four_chain_limb_study", "feline_v58_traced_contour_layers", "feline_v59_trace_ik_walk", "pixel_feline_v1"].includes(model)
      ? model
      : "og";
  }

  isCatDirectRegisterModel() {
    return ["feline_v1_direct_register", "feline_v2_smooth_direct_register", "feline_v3_flow_direct_register", "feline_v4_compact_direct_register", "feline_v5_compact_head_direct_register", "feline_v6_articulated_direct_register", "feline_v7_refined_articulated_direct_register", "feline_v8_tucked_articulated_direct_register", "feline_v9_flowing_articulated_direct_register", "feline_v17_integrated_skin_direct_register", "feline_v18_dynamic_fit_direct_register", "feline_v19_independent_direct_register", "feline_v20_support_centred_direct_register", "feline_v21_moderate_stride_direct_register", "feline_v22_short_stride_direct_register", "feline_v23_anatomical_bend_direct_register", "feline_v24_choreographed_feline_walk", "feline_v26_reference_walk"].includes(this.getCatModel());
  }

  getCatDirectRegisterState() {
    if (!this.catState) {
      this.catState = this.createInitialCatState();
    }
    if (!this.catState.directRegister) {
      this.catState.directRegister = {
        frontPrints: { frontNear: [], frontFar: [] },
        scores: [],
        lastScore: null,
      };
    }
    return this.catState.directRegister;
  }

  noteCatPawLanding(name, target) {
    if (!this.isCatDirectRegisterModel() || !name || !target) return;

    const state = this.getCatDirectRegisterState();
    const point = {
      x: Number(target.x),
      y: Number(target.y),
      frame: Number(this.getCatGaitState().frame || 0),
    };

    if (name === "frontNear" || name === "frontFar") {
      const prints = state.frontPrints[name] || [];
      prints.push(point);
      const maxPrints = Math.max(2, Math.round(Number(this.c.cat_paw_print_history ?? 12)));
      if (prints.length > maxPrints) prints.splice(0, prints.length - maxPrints);
      state.frontPrints[name] = prints;
      return;
    }

    const matchingFront = name === "rearNear" ? "frontNear" : "frontFar";
    const print = state.frontPrints?.[matchingFront]?.at?.(-1);
    if (!print) return;

    const error = Math.hypot(point.x - Number(print.x), point.y - Number(print.y));
    const tolerance = Math.max(1, Number(this.c.cat_line_width || 6) * 0.7);
    const score = this.clamp(1 - error / tolerance, 0, 1);
    const result = {
      rear: name,
      front: matchingFront,
      print,
      landing: point,
      error,
      score,
      frame: point.frame,
    };
    state.scores.push(result);
    if (state.scores.length > 12) state.scores.splice(0, state.scores.length - 12);
    state.lastScore = result;
  }

  recordCatMotionTrace(rig) {
    const traceEnabled = this.bool(
      this.getCatRuntimeConfigValue("show_cat_motion_trace", this.c.show_cat_motion_trace)
    );

    if (!traceEnabled) {
      if (this.catState?.motionTrace?.samples?.length) {
        this.catState.motionTrace = { samples: [], lastSampleAt: 0 };
      }
      return;
    }

    if (!this.catState) return;
    if (!this.catState.motionTrace) {
      this.catState.motionTrace = { samples: [], lastSampleAt: 0 };
    }

    const now = performance.now();
    const sampleEveryMs = Math.max(
      16,
      Number(
        this.getCatRuntimeConfigValue(
          "cat_motion_trace_sample_ms",
          this.c.cat_motion_trace_sample_ms ?? 80
        )
      ) || 80
    );
    const trace = this.catState.motionTrace;

    if (now - Number(trace.lastSampleAt || 0) < sampleEveryMs) return;

    const point = (name) => {
      const source = rig?.[name];
      if (!source || !Number.isFinite(Number(source.x)) || !Number.isFinite(Number(source.y))) {
        return null;
      }
      return { x: Number(source.x), y: Number(source.y) };
    };

    const sample = {
      frontSign: Number(rig.solvedFrontSign || rig.cfg?.frontSign || this.getCatFacingSign() || -1),
      skull: point("skull"),
      chest: point("chest"),
      frontPawNear: point("frontPawNear"),
      frontPawFar: point("frontPawFar"),
      rearPawNear: point("rearPawNear"),
      rearPawFar: point("rearPawFar"),
      frontElbowNear: point("frontElbowNear"),
      frontElbowFar: point("frontElbowFar"),
      rearKneeNear: point("rearKneeNear"),
      rearKneeFar: point("rearKneeFar"),
      rearHockNear: point("rearHockNear"),
      rearHockFar: point("rearHockFar"),
    };

    trace.samples.push(sample);
    trace.lastSampleAt = now;

    const maxSamples = Math.max(
      2,
      Math.round(
        Number(
          this.getCatRuntimeConfigValue(
            "cat_motion_trace_max_samples",
            this.c.cat_motion_trace_max_samples ?? 90
          )
        ) || 90
      )
    );
    if (trace.samples.length > maxSamples) {
      trace.samples.splice(0, trace.samples.length - maxSamples);
    }
  }

  renderCatPawPrintDebug(labelSize = 3, labelOpacity = 0.35) {
    if (!this.isCatDirectRegisterModel()) return "";

    const state = this.getCatDirectRegisterState();
    const printGroups = [
      { name: "frontNear", label: "FN", color: "#1e88e5" },
      { name: "frontFar", label: "FF", color: "#90caf9" },
    ];
    const printMarkup = printGroups
      .flatMap(({ name, label, color }) =>
        (state.frontPrints?.[name] || []).map((print, index, prints) => {
          const isLatest = index === prints.length - 1;
          return `
            <g class="cat-paw-print" data-paw="${name}">
              <circle
                cx="${print.x}"
                cy="${print.y}"
                r="${isLatest ? 4.4 : 3.1}"
                fill="none"
                stroke="${color}"
                stroke-width="${isLatest ? 1.4 : 1}"
                stroke-dasharray="${isLatest ? "" : "2 2"}"
                opacity="${isLatest ? 0.95 : 0.45}"
              />
              ${
                isLatest && labelOpacity > 0
                  ? `<text x="${Number(print.x) + 4}" y="${Number(print.y) - 4}" class="cat-debug-text" style="fill: ${color}; font-size: ${labelSize}px; opacity: ${Math.min(1, labelOpacity + 0.25)};">${label} print</text>`
                  : ""
              }
            </g>
          `;
        })
      )
      .join("");

    const result = state.lastScore;
    const scoreMarkup = result
      ? `
        <text
          x="${Number(result.landing.x) + 5}"
          y="${Number(result.landing.y) + 10}"
          class="cat-debug-text"
          style="fill: ${result.score >= 0.8 ? "var(--success-color)" : "var(--warning-color)"}; font-size: ${labelSize}px; opacity: ${Math.min(1, labelOpacity + 0.35)};"
        >DR ${Math.round(Number(result.score || 0) * 100)}% / ${Number(result.error || 0).toFixed(1)}</text>
      `
      : "";

    return `<g class="cat-paw-print-debug" pointer-events="none">${printMarkup}${scoreMarkup}</g>`;
  }

  renderCatMotionTrace(rig, debugOpacity = 1) {
    const samples = this.catState?.motionTrace?.samples || [];
    if (samples.length < 2) return "";

    const traceOpacity = this.clamp(
      Number(
        this.getCatRuntimeConfigValue(
          "cat_motion_trace_opacity",
          this.c.cat_motion_trace_opacity ?? 0.62
        )
      ),
      0,
      1
    );
    const showJointTraces = this.bool(
      this.getCatRuntimeConfigValue(
        "show_cat_motion_trace_joints",
        this.c.show_cat_motion_trace_joints
      )
    );
    const traceSpace = String(
      this.getCatRuntimeConfigValue(
        "cat_motion_trace_space",
        this.c.cat_motion_trace_space || "body_relative"
      )
    );
    const currentChest = rig?.chest;
    const currentFrontSign = Number(rig?.solvedFrontSign || rig?.cfg?.frontSign || this.getCatFacingSign() || -1);
    const tracePoint = (sample, name) => {
      const source = sample?.[name];
      if (!source) return null;
      if (traceSpace !== "body_relative" || !sample?.chest || !currentChest) {
        return source;
      }

      const sampleFrontSign = Number(sample.frontSign || currentFrontSign || -1);
      return {
        x:
          Number(currentChest.x) +
          (Number(source.x) - Number(sample.chest.x)) * sampleFrontSign * currentFrontSign,
        y: Number(currentChest.y) + Number(source.y) - Number(sample.chest.y),
      };
    };
    const line = (name, color, width = 1.4, opacity = 1, dash = "") => {
      const points = samples
        .map((sample) => tracePoint(sample, name))
        .filter(Boolean)
        .map((point) => `${point.x},${point.y}`)
        .join(" ");
      if (!points) return "";

      const current = tracePoint(samples[samples.length - 1], name);
      return `
        <polyline
          points="${points}"
          fill="none"
          stroke="${color}"
          stroke-width="${width}"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-dasharray="${dash}"
          opacity="${traceOpacity * debugOpacity * opacity}"
        />
        ${
          current
            ? `<circle cx="${current.x}" cy="${current.y}" r="${Math.max(1.5, width)}" fill="${color}" opacity="${Math.min(1, traceOpacity * debugOpacity + 0.25)}" />`
            : ""
        }
      `;
    };

    const jointMarkup = showJointTraces
      ? `
        ${line("frontElbowNear", "#1e88e5", 0.9, 0.6, "2 2")}
        ${line("frontElbowFar", "#90caf9", 0.9, 0.45, "2 2")}
        ${line("rearKneeNear", "#fb8c00", 0.9, 0.6, "2 2")}
        ${line("rearKneeFar", "#ffcc80", 0.9, 0.45, "2 2")}
        ${line("rearHockNear", "#8e24aa", 0.9, 0.6, "2 2")}
        ${line("rearHockFar", "#ce93d8", 0.9, 0.45, "2 2")}
      `
      : "";

    return `
      <g class="cat-motion-trace" pointer-events="none">
        ${line("skull", "#00acc1", 1.1, 0.8, "3 2")}
        ${line("chest", "#26a69a", 1, 0.65, "3 2")}
        ${line("frontPawNear", "#1e88e5", 1.6, 1)}
        ${line("frontPawFar", "#90caf9", 1.3, 0.7)}
        ${line("rearPawNear", "#fb8c00", 1.6, 1)}
        ${line("rearPawFar", "#ffcc80", 1.3, 0.7)}
        ${jointMarkup}
      </g>
    `;
  }

  getCatBounds(rig) {
    if (!rig) return null;

    const points = [];

    const addPoint = (p) => {
      if (!p) return;
      if (!Number.isFinite(Number(p.x)) || !Number.isFinite(Number(p.y))) return;
      points.push({ x: Number(p.x), y: Number(p.y) });
    };

    [
      "anchor",
      "chest",
      "midSpine",
      "sacrum",
      "shoulderJoint",
      "hipJoint",
      "neckBase",
      "neckControl",
      "neckTip",
      "skull",
      "nose",
      "muzzleTop",
      "muzzleBottom",
      "jawPivot",
      "jawTip",
      "frontElbowNear",
      "frontWristNear",
      "frontPawNear",
      "frontElbowFar",
      "frontWristFar",
      "frontPawFar",
      "rearKneeNear",
      "rearHockNear",
      "rearPawNear",
      "rearKneeFar",
      "rearHockFar",
      "rearPawFar",
      "tailBase",
      "tailControl",
      "tailMid",
      "tailTip",
    ].forEach((name) => addPoint(rig[name]));

    ["frontEar", "rearEar"].forEach((name) => {
      const ear = rig[name];
      if (!ear) return;
      addPoint(ear.base);
      addPoint(ear.outer);
      addPoint(ear.inner);
      addPoint(ear.tip);
    });

    if (rig.skull) {
      const padX = Number(rig.skull.width || 0) * 0.55;
      const padY = Number(rig.skull.height || 0) * 0.55;

      addPoint({ x: rig.skull.x - padX, y: rig.skull.y - padY });
      addPoint({ x: rig.skull.x + padX, y: rig.skull.y + padY });
    }

    if (!points.length) return null;

    const minX = Math.min(...points.map((p) => p.x));
    const maxX = Math.max(...points.map((p) => p.x));
    const minY = Math.min(...points.map((p) => p.y));
    const maxY = Math.max(...points.map((p) => p.y));

    const padding = 8 * Math.max(0.05, Number(this.c.cat_scale) || 1);

    return {
      x: minX - padding,
      y: minY - padding,
      width: maxX - minX + padding * 2,
      height: maxY - minY + padding * 2,
    };
  }

  // ===========================================================================
  // 14. General helpers
  // ===========================================================================

  setCircle(id, cx, cy, r) {
    const el = this.shadowRoot.querySelector(`#${id}`);
    if (!el) return;

    el.setAttribute("cx", cx);
    el.setAttribute("cy", cy);
    el.setAttribute("r", r);
  }

  setLine(id, x1, y1, x2, y2) {
    const el = this.shadowRoot.querySelector(`#${id}`);
    if (!el) return;

    el.setAttribute("x1", x1);
    el.setAttribute("y1", y1);
    el.setAttribute("x2", x2);
    el.setAttribute("y2", y2);
  }

  distance(a, b) {
    return Math.hypot(Number(a.x) - Number(b.x), Number(a.y) - Number(b.y));
  }

  lerp(a, b, t) {
    return Number(a) + (Number(b) - Number(a)) * Number(t);
  }

  lerpPoint(a, b, t) {
    const blend = this.clamp(Number(t) || 0, 0, 1);

    return {
      x: this.lerp(Number(a.x), Number(b.x), blend),
      y: this.lerp(Number(a.y), Number(b.y), blend),
    };
  }

  smoothstep(value) {
    const x = this.clamp(value, 0, 1);
    return x * x * (3 - 2 * x);
  }

  clamp(value, min, max) {
    return Math.min(max, Math.max(min, Number(value)));
  }

  getConfiguredWorldWidth() {
    return Math.max(160, Number(this.c.world_width) || 520);
  }

  getWorldWidth() {
    return Math.max(
      this.getConfiguredWorldWidth(),
      Number(this.measuredWorldWidth) || 0
    );
  }

  getWorldHeight() {
    return Math.max(120, Number(this.c.world_height) || 240);
  }

  getWorldPaddingX() {
    const width = this.getWorldWidth();
    return this.clamp(Number(this.c.world_padding_x) || 24, 0, width / 2);
  }

  getWanderRange() {
    const worldWidth = this.getWorldWidth();
    const paddingX = this.getWorldPaddingX();

    if (!this.bool(this.c.wander_use_available_width)) {
      const minX = this.clamp(
        Number(this.c.wander_min_x) || paddingX,
        0,
        worldWidth
      );

      const maxX = this.clamp(
        Number(this.c.wander_max_x) || worldWidth - paddingX,
        0,
        worldWidth
      );

      return {
        min: Math.min(minX, maxX),
        max: Math.max(minX, maxX),
      };
    }

    const usableMin = paddingX;
    const usableMax = worldWidth - paddingX;
    const usableWidth = Math.max(1, usableMax - usableMin);

    const ratio = this.clamp(
      Number(this.c.wander_width_ratio) || 0.75,
      0.05,
      1
    );

    const wanderWidth = usableWidth * ratio;
    const centre = worldWidth / 2;

    const min = this.clamp(centre - wanderWidth / 2, usableMin, usableMax);
    const max = this.clamp(centre + wanderWidth / 2, usableMin, usableMax);

    return {
      min: Math.min(min, max),
      max: Math.max(min, max),
    };
  }

  setupResizeObserver() {
    const stage = this.shadowRoot.querySelector(".stage");
    if (!stage || typeof ResizeObserver === "undefined") return;

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    this.resizeObserver = new ResizeObserver(() => {
      this.updateMeasuredWorldWidth();
    });

    this.resizeObserver.observe(stage);
    this.updateMeasuredWorldWidth();
  }

  updateMeasuredWorldWidth() {
    if (!this.bool(this.c.world_fill_available_width)) {
      this.measuredWorldWidth = null;
      this.updateWorldLayout();
      return;
    }

    const stage = this.shadowRoot.querySelector(".stage");
    if (!stage) return;

    const rect = stage.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const worldHeight = this.getWorldHeight();
    const aspectWidth = worldHeight * (rect.width / rect.height);
    const nextWidth = Math.max(this.getConfiguredWorldWidth(), aspectWidth);

    if (Math.abs(nextWidth - Number(this.measuredWorldWidth || 0)) < 1) {
      return;
    }

    this.measuredWorldWidth = nextWidth;
    this.updateWorldLayout();
  }

  updateWorldLayout() {
    const svg = this.shadowRoot.querySelector("svg");
    const world = this.shadowRoot.querySelector("#world");
    const floor = this.shadowRoot.querySelector("#floor");

    const worldWidth = this.getWorldWidth();
    const worldHeight = this.getWorldHeight();
    const worldCentreX = worldWidth / 2;
    const worldCentreY = worldHeight / 2;
    const scale = Number(this.c.scale) || 1;
    const paddingX = this.getWorldPaddingX();

    if (svg) {
      svg.setAttribute("viewBox", `0 0 ${worldWidth} ${worldHeight}`);
    }

    if (world) {
      world.setAttribute(
        "transform",
        this.getWorldViewTransform({
          worldWidth,
          worldHeight,
          worldCentreX,
          worldCentreY,
          scale,
        })
      );
    }

    if (floor) {
      floor.setAttribute("x1", String(paddingX));
      floor.setAttribute("x2", String(worldWidth - paddingX));
      floor.setAttribute("y1", String(Number(this.c.floor_y)));
      floor.setAttribute("y2", String(Number(this.c.floor_y)));
    }

    this.updateGuides();
    this.updateHeadPath();
    this.updatePoiLayer();
    this.updatePoiDebugLayer();
    this.updateSkeleton();

    if (this.updateAttentionPoiLayer) this.updateAttentionPoiLayer();
    if (this.updateCatLayer) this.updateCatLayer();
    if (this.updateCatDebugLayer) this.updateCatDebugLayer();
  }

  bool(value) {
    return value === true || value === "true" || value === 1 || value === "1";
  }

  esc(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}

// ===========================================================================
// 14. Custom element registration
// ===========================================================================

if (!customElements.get("stick-pet-card")) {
  customElements.define("stick-pet-card", StickPetCard);
}

window.customCards = window.customCards || [];
window.customCards.push({
  type: "stick-pet-card",
  name: "Stick Pet Card",
  description: "A tiny procedural stick figure for Home Assistant dashboards.",
});
