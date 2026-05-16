/**
 * Phosphor Icons mapping — https://phosphoricons.com
 * Usage: <Icon name="phone" /> renders <i class="ph ph-phone">
 * Weight is derived from strokeWidth + fill props in Icon.astro.
 */

export const PhosphorNames = {
  // ── UI / Navigation ───────────────────────────────────────────
  check:         'check',
  chevronRight:  'caret-right',
  chevronLeft:   'caret-left',
  chevronUp:     'caret-up',
  chevronDown:   'caret-down',
  plus:          'plus',
  close:         'x',
  menu:          'list',

  // ── Contact ────────────────────────────────────────────────────
  phone:         'phone',
  mail:          'envelope',
  whatsapp:      'whatsapp-logo',
  mapPin:        'map-pin',
  message:       'chat',
  send:          'paper-plane-tilt',

  // ── Social ─────────────────────────────────────────────────────
  instagram:     'instagram-logo',
  facebook:      'facebook-logo',
  google:        'google-logo',

  // ── Trust / UI ─────────────────────────────────────────────────
  star:          'star',
  shield:        'shield',
  lock:          'lock',
  user:          'user',
  time:          'clock',
  calendar:      'calendar',
  photo:         'image',
  award:         'trophy',
  externalLink:  'arrow-square-out',

  // ── Crafts ─────────────────────────────────────────────────────
  wrench:        'wrench',
  drywall:       'columns',
} as const;

export type IconName = keyof typeof PhosphorNames;
