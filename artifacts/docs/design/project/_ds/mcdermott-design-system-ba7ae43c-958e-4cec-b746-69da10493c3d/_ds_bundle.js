/* @ds-bundle: {"format":3,"namespace":"McDermottDesignSystem_ba7ae4","components":[{"name":"Alert","sourcePath":"components/Alert/Alert.jsx"},{"name":"Avatar","sourcePath":"components/Avatar/Avatar.jsx"},{"name":"Badge","sourcePath":"components/Badge/Badge.jsx"},{"name":"Button","sourcePath":"components/Button/Button.jsx"},{"name":"Card","sourcePath":"components/Card/Card.jsx"},{"name":"Checkbox","sourcePath":"components/Checkbox/Checkbox.jsx"},{"name":"IconButton","sourcePath":"components/IconButton/IconButton.jsx"},{"name":"Input","sourcePath":"components/Input/Input.jsx"},{"name":"McDermottSymbol","sourcePath":"components/Lockup/Lockup.jsx"},{"name":"Lockup","sourcePath":"components/Lockup/Lockup.jsx"},{"name":"Stepper","sourcePath":"components/Stepper/Stepper.jsx"},{"name":"Switch","sourcePath":"components/Switch/Switch.jsx"},{"name":"Tabs","sourcePath":"components/Tabs/Tabs.jsx"}],"sourceHashes":{"components/Alert/Alert.jsx":"2f24e38fa8e3","components/Avatar/Avatar.jsx":"fcdaa6bc8bf4","components/Badge/Badge.jsx":"30f8f4f791a8","components/Button/Button.jsx":"78a1768c559a","components/Card/Card.jsx":"27f13e42b3e3","components/Checkbox/Checkbox.jsx":"b869b1d779cf","components/IconButton/IconButton.jsx":"d3df1126bccc","components/Input/Input.jsx":"958e7ca319c5","components/Lockup/Lockup.jsx":"e2e5ec32dc14","components/Stepper/Stepper.jsx":"239f5084c104","components/Switch/Switch.jsx":"34b95d431f7d","components/Tabs/Tabs.jsx":"036b058a8e86","ui_kits/deposition-summarizer/chat.jsx":"6ef31d685e75","ui_kits/review-cost-estimator/estimator.jsx":"9c2f16f08aef","ui_kits/review-cost-estimator/shell.jsx":"a565aea1f78a"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.McDermottDesignSystem_ba7ae4 = window.McDermottDesignSystem_ba7ae4 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/Alert/Alert.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * McDermott Alert. Subtle pale fill + 4px left border accent + navy text.
 * Severities: info | success | warning | error. Text on the pale fill is
 * always navy (theme-stable). Pair with a Phosphor icon matching severity.
 */
const SEV = {
  info: {
    bg: 'var(--color-pale-blue)',
    border: 'var(--color-blue)',
    icon: 'ph-info'
  },
  success: {
    bg: 'var(--color-pale-success)',
    border: 'var(--color-success)',
    icon: 'ph-check-circle'
  },
  warning: {
    bg: 'var(--color-pale-gold)',
    border: 'var(--color-warning)',
    icon: 'ph-warning-circle'
  },
  error: {
    bg: 'var(--color-pale-orange)',
    border: 'var(--color-error)',
    icon: 'ph-x-circle'
  }
};
function Alert({
  severity = 'info',
  title,
  children,
  icon,
  style,
  ...rest
}) {
  const s = SEV[severity] || SEV.info;
  return /*#__PURE__*/React.createElement("div", _extends({
    role: severity === 'error' ? 'alert' : 'status',
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 'var(--space-3)',
      padding: 'var(--space-4)',
      borderLeft: `4px solid ${s.border}`,
      borderRadius: 'var(--radius)',
      background: s.bg,
      color: 'var(--color-navy)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("i", {
    className: `ph ${icon || s.icon}`,
    "aria-hidden": "true",
    style: {
      fontSize: 20,
      flexShrink: 0,
      marginTop: 2
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, title && /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      marginBottom: 'var(--space-1)'
    }
  }, title), children && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      lineHeight: 1.5
    }
  }, children)));
}
Object.assign(__ds_scope, { Alert });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/Alert/Alert.jsx", error: String((e && e.message) || e) }); }

// components/Avatar/Avatar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * McDermott Avatar. Circular, brand-aligned initial fallback (Mix font on a
 * pale fill) — not a generic gray placeholder. Sizes: 24/32/40/48.
 * Pass `src` for a photo, or `name` to derive initials.
 */
function Avatar({
  name = '',
  src,
  size = 40,
  style,
  ...rest
}) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map(w => w[0] || '').join('').toUpperCase();
  const base = {
    width: size,
    height: size,
    flexShrink: 0,
    borderRadius: 999,
    overflow: 'hidden',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...style
  };
  if (src) {
    return /*#__PURE__*/React.createElement("img", _extends({
      src: src,
      alt: name,
      width: size,
      height: size,
      style: {
        ...base,
        objectFit: 'cover'
      }
    }, rest));
  }
  return /*#__PURE__*/React.createElement("span", _extends({
    "aria-label": name || undefined,
    role: "img",
    style: {
      ...base,
      background: 'var(--color-pale-blue)',
      color: 'var(--color-navy)',
      fontFamily: 'var(--font-mix)',
      fontSize: Math.round(size * 0.42),
      lineHeight: 1
    }
  }, rest), initials || '·');
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/Avatar/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/Badge/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * McDermott status Badge (pill). Pale fills + navy text by default — never
 * saturated alert colors. Pill shape, 12pt ALL CAPS, 5% tracking.
 * Live status gets a 6px dot. Draft/Archived are bordered, no fill.
 */
const VARIANTS = {
  live: {
    background: 'var(--color-pale-success)',
    color: 'var(--color-navy)',
    dot: 'var(--color-success)'
  },
  pending: {
    background: 'var(--color-pale-gold)',
    color: 'var(--color-navy)'
  },
  failed: {
    background: 'var(--color-pale-orange)',
    color: 'var(--color-navy)'
  },
  info: {
    background: 'var(--color-pale-blue)',
    color: 'var(--color-navy)'
  },
  draft: {
    background: 'transparent',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-light)'
  },
  archived: {
    background: 'transparent',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border-light)'
  }
};
function Badge({
  children,
  variant = 'draft',
  style,
  ...rest
}) {
  const v = VARIANTS[variant] || VARIANTS.draft;
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--space-2)',
      padding: v.border ? '3px var(--space-3)' : 'var(--space-1) var(--space-3)',
      borderRadius: 'var(--radius-pill)',
      fontFamily: 'var(--font-sans)',
      fontSize: 12,
      fontWeight: 500,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      whiteSpace: 'nowrap',
      background: v.background,
      color: v.color,
      border: v.border || 'none',
      ...style
    }
  }, rest), v.dot && /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      width: 6,
      height: 6,
      borderRadius: '50%',
      background: v.dot,
      flexShrink: 0
    }
  }), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/Badge/Badge.jsx", error: String((e && e.message) || e) }); }

// components/Button/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * McDermott Button.
 * ALL-CAPS sans label, 2px radius, 140×36 min, never wraps.
 * Variants: primary | secondary | destructive. Sizes inherit the 36px height.
 * Interactive accent flips per theme (blue light / teal dark) via tokens —
 * never hardcode teal here.
 */
function Button({
  children,
  variant = 'primary',
  type = 'button',
  icon,
  // optional Phosphor class name, e.g. "ph-floppy-disk"
  iconRight,
  // optional trailing Phosphor class name
  loading = false,
  disabled = false,
  onClick,
  style,
  ...rest
}) {
  const styles = buttonStyles(variant);
  const isDisabled = disabled || loading;
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    onClick: onClick,
    disabled: isDisabled,
    "aria-disabled": isDisabled || undefined,
    "data-loading": loading || undefined,
    style: {
      ...styles,
      ...style
    },
    onMouseEnter: e => !isDisabled && Object.assign(e.currentTarget.style, hoverStyles(variant)),
    onMouseLeave: e => !isDisabled && Object.assign(e.currentTarget.style, styles)
  }, rest), loading ? /*#__PURE__*/React.createElement("i", {
    className: "ph ph-circle-notch",
    "aria-hidden": "true",
    style: {
      fontSize: 16,
      animation: 'mds-spin 800ms linear infinite'
    }
  }) : /*#__PURE__*/React.createElement(React.Fragment, null, icon && /*#__PURE__*/React.createElement("i", {
    className: `ph ${icon}`,
    "aria-hidden": "true",
    style: {
      fontSize: 16,
      lineHeight: 1
    }
  }), /*#__PURE__*/React.createElement("span", null, children), iconRight && /*#__PURE__*/React.createElement("i", {
    className: `ph ${iconRight}`,
    "aria-hidden": "true",
    style: {
      fontSize: 16,
      lineHeight: 1
    }
  })));
}
const base = {
  fontFamily: 'var(--font-sans)',
  fontSize: 14,
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  borderRadius: 'var(--radius)',
  minWidth: 140,
  height: 36,
  padding: '0 var(--space-4)',
  border: 'none',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 'var(--space-2)',
  whiteSpace: 'nowrap',
  transition: 'background var(--transition), color var(--transition), border-color var(--transition)'
};
function isDark() {
  if (typeof document === 'undefined') return false;
  return document.documentElement.getAttribute('data-theme') === 'dark';
}
function buttonStyles(variant) {
  const dark = isDark();
  if (variant === 'secondary') {
    return {
      ...base,
      background: dark ? 'transparent' : 'var(--bg-surface)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-button)'
    };
  }
  if (variant === 'destructive') {
    return {
      ...base,
      background: 'var(--color-error)',
      color: 'var(--color-navy)'
    };
  }
  // primary
  return {
    ...base,
    background: 'var(--accent-interactive)',
    color: dark ? 'var(--color-navy)' : 'var(--color-white)'
  };
}
function hoverStyles(variant) {
  const dark = isDark();
  if (variant === 'secondary') {
    return dark ? {
      background: 'var(--color-teal)',
      color: 'var(--color-navy)',
      borderColor: 'var(--color-teal)'
    } : {
      background: 'var(--color-navy)',
      color: 'var(--color-white)',
      borderColor: 'var(--color-navy)'
    };
  }
  if (variant === 'destructive') {
    return {
      background: '#E62929',
      color: 'var(--color-navy)'
    };
  }
  return dark ? {
    background: 'var(--color-white)',
    color: 'var(--color-navy)'
  } : {
    background: 'var(--color-navy)',
    color: 'var(--color-white)'
  };
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/Button/Button.jsx", error: String((e && e.message) || e) }); }

// components/Card/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * McDermott Card. Surface bg, 1px border-light, 2px radius. Optional 30px top
 * stroke in a secondary color, optional image/fill area, then eyebrow + Mix
 * title + body. Hover lifts 2px with shadow-md. Compose freely via children.
 */
function Card({
  topStroke,
  // optional color string for the 30px top stroke
  eyebrow,
  title,
  children,
  href,
  hoverable = true,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const Tag = href ? 'a' : 'div';
  return /*#__PURE__*/React.createElement(Tag, _extends({
    href: href,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'block',
      textDecoration: 'none',
      color: 'inherit',
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-light)',
      borderRadius: 'var(--radius)',
      overflow: 'hidden',
      minWidth: 0,
      transition: 'transform var(--transition), box-shadow var(--transition)',
      transform: hoverable && hover ? 'translateY(-2px)' : 'none',
      boxShadow: hoverable && hover ? 'var(--shadow-md)' : 'none',
      ...style
    }
  }, rest), topStroke && /*#__PURE__*/React.createElement("div", {
    style: {
      height: 30,
      width: '100%',
      background: topStroke
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 'var(--space-5)'
    }
  }, eyebrow && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 300,
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      color: 'var(--text-secondary)',
      marginBottom: 'var(--space-2)'
    }
  }, eyebrow), title && /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: 'var(--font-mix)',
      fontSize: 28,
      lineHeight: 1.05,
      letterSpacing: '-0.03em',
      color: 'var(--text-primary)',
      margin: '0 0 var(--space-3)',
      wordBreak: 'break-word'
    }
  }, title), children && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 300,
      lineHeight: 1.4,
      color: 'var(--text-secondary)'
    }
  }, children)));
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/Card/Card.jsx", error: String((e && e.message) || e) }); }

// components/Checkbox/Checkbox.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * McDermott Checkbox / Radio. 24×24 control (WCAG touch floor), 2px radius
 * (999px for radio). Fill is --accent-interactive when checked; the check mark
 * is white in light, navy in dark. Use `radio` for single-select groups.
 */
function Checkbox({
  checked = false,
  onChange,
  label,
  radio = false,
  disabled = false,
  id,
  name,
  style,
  ...rest
}) {
  const ctrlId = id || `mds-check-${Math.random().toString(36).slice(2, 8)}`;
  const dark = typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark';
  const radius = radio ? 999 : 'var(--radius)';
  const box = {
    width: 24,
    height: 24,
    flexShrink: 0,
    border: checked ? '2px solid var(--accent-interactive)' : '2px solid var(--text-primary)',
    background: checked && !radio ? 'var(--accent-interactive)' : 'var(--bg-surface)',
    borderRadius: radius,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'background var(--transition), border-color var(--transition)'
  };
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: ctrlId,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-3)',
      minHeight: 24,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.4 : 1,
      ...style
    }
  }, /*#__PURE__*/React.createElement("input", _extends({
    id: ctrlId,
    type: radio ? 'radio' : 'checkbox',
    name: name,
    checked: checked,
    disabled: disabled,
    onChange: onChange,
    style: {
      position: 'absolute',
      opacity: 0,
      width: 1,
      height: 1,
      pointerEvents: 'none'
    }
  }, rest)), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: box
  }, checked && !radio && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 12,
      height: 7,
      borderLeft: `2px solid ${dark ? 'var(--color-navy)' : 'var(--color-white)'}`,
      borderBottom: `2px solid ${dark ? 'var(--color-navy)' : 'var(--color-white)'}`,
      transform: 'rotate(-45deg) translate(1px, -1px)'
    }
  }), checked && radio && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 12,
      height: 12,
      borderRadius: 999,
      background: 'var(--accent-interactive)'
    }
  })), label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 16,
      color: 'var(--text-primary)'
    }
  }, label));
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/Checkbox/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/IconButton/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * McDermott IconButton — 36×36 icon-only button.
 * Requires an aria-label (icon-only buttons are not self-describing).
 * Default (ghost) for toolbar/topbar use; `bordered` when it needs an edge.
 */
function IconButton({
  icon,
  label,
  variant = 'ghost',
  // 'ghost' | 'bordered'
  size = 36,
  disabled = false,
  onClick,
  style,
  ...rest
}) {
  const styles = {
    width: size,
    height: size,
    minWidth: size,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'var(--radius)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    color: 'var(--icon-default)',
    background: variant === 'bordered' ? 'var(--bg-surface)' : 'transparent',
    border: variant === 'bordered' ? '1px solid var(--border-button)' : '1px solid transparent',
    opacity: disabled ? 0.4 : 1,
    pointerEvents: disabled ? 'none' : 'auto',
    transition: 'background var(--transition), color var(--transition), border-color var(--transition)',
    ...style
  };
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    "aria-label": label,
    title: label,
    disabled: disabled,
    onClick: onClick,
    style: styles,
    onMouseEnter: e => {
      e.currentTarget.style.background = 'var(--color-pale-blue)';
      e.currentTarget.style.color = 'var(--color-navy)';
    },
    onMouseLeave: e => {
      e.currentTarget.style.background = variant === 'bordered' ? 'var(--bg-surface)' : 'transparent';
      e.currentTarget.style.color = 'var(--icon-default)';
    }
  }, rest), /*#__PURE__*/React.createElement("i", {
    className: `ph ${icon}`,
    "aria-hidden": "true",
    style: {
      fontSize: size >= 44 ? 24 : 20,
      lineHeight: 1
    }
  }));
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/IconButton/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/Input/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  useState
} = React;
/**
 * McDermott text Input. Single-column, 40px control height, 2px radius.
 * Mark optional (not required) — never asterisks. Validate on blur, never
 * on keystroke. Error text is navy, shown below; field border turns error red.
 * Pass inputmode/autocomplete through for mobile keyboards + password managers.
 */
function Input({
  label,
  id,
  type = 'text',
  icon,
  // optional leading Phosphor class
  optional = false,
  hint,
  error,
  value,
  onChange,
  onBlur,
  placeholder,
  disabled = false,
  style,
  ...rest
}) {
  const [focused, setFocused] = useState(false);
  const inputId = id || `mds-input-${Math.random().toString(36).slice(2, 8)}`;
  const borderColor = error ? 'var(--color-error)' : focused ? 'var(--text-secondary)' : 'var(--border-light)';
  const fieldStyles = {
    fontFamily: 'var(--font-sans)',
    fontSize: 16,
    height: 'var(--control-h)',
    width: '100%',
    padding: icon ? '0 var(--space-3) 0 40px' : '0 var(--space-3)',
    background: 'var(--bg-surface)',
    color: 'var(--text-primary)',
    border: `1px solid ${borderColor}`,
    borderRadius: 'var(--radius)',
    transition: 'border-color var(--transition)',
    opacity: disabled ? 0.4 : 1,
    minWidth: 0,
    outline: focused ? '2px solid var(--focus-ring)' : 'none',
    outlineOffset: 2
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-2)',
      minWidth: 0,
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: inputId,
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 14,
      fontWeight: 500,
      color: 'var(--text-primary)',
      display: 'flex',
      gap: 'var(--space-2)',
      alignItems: 'baseline'
    }
  }, label, optional && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 400,
      color: 'var(--text-secondary)'
    }
  }, "Optional")), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width: '100%',
      minWidth: 0
    }
  }, icon && /*#__PURE__*/React.createElement("i", {
    className: `ph ${icon}`,
    "aria-hidden": "true",
    style: {
      position: 'absolute',
      left: 'var(--space-3)',
      top: '50%',
      transform: 'translateY(-50%)',
      color: 'var(--icon-default)',
      fontSize: 18,
      pointerEvents: 'none'
    }
  }), /*#__PURE__*/React.createElement("input", _extends({
    id: inputId,
    type: type,
    value: value,
    placeholder: placeholder,
    disabled: disabled,
    "aria-invalid": !!error || undefined,
    "aria-describedby": error ? `${inputId}-err` : hint ? `${inputId}-hint` : undefined,
    onChange: onChange,
    onFocus: () => setFocused(true),
    onBlur: e => {
      setFocused(false);
      onBlur && onBlur(e);
    },
    style: fieldStyles
  }, rest))), error ? /*#__PURE__*/React.createElement("span", {
    id: `${inputId}-err`,
    style: {
      fontSize: 13,
      color: 'var(--text-primary)',
      display: 'flex',
      gap: 'var(--space-2)',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-warning-circle",
    "aria-hidden": "true",
    style: {
      fontSize: 16,
      color: 'var(--color-error)'
    }
  }), error) : hint ? /*#__PURE__*/React.createElement("span", {
    id: `${inputId}-hint`,
    style: {
      fontSize: 13,
      color: 'var(--text-secondary)'
    }
  }, hint) : null);
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/Input/Input.jsx", error: String((e && e.message) || e) }); }

// components/Lockup/Lockup.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** The official McDermott symbol — M-in-circle. fill="currentColor", never recolored or cropped. */
function McDermottSymbol({
  size = 32,
  style
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      width: size,
      height: size,
      flexShrink: 0,
      display: 'inline-flex',
      ...style
    }
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 171.84 171.84",
    xmlns: "http://www.w3.org/2000/svg",
    fill: "currentColor",
    role: "img",
    "aria-label": "McDermott",
    style: {
      width: '100%',
      height: '100%',
      display: 'block',
      fill: 'currentColor'
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M43,85.12l22.6,36.87h-22.6v-36.87ZM113.34,121.9h16.81V47.95h-16.81v73.95ZM42.17,47.95l47.09,76.79,8.38-20.04-34.79-56.75h-20.67ZM171.84,85.92c0,47.37-38.55,85.92-85.92,85.92S0,133.29,0,85.92,38.55,0,85.92,0s85.92,38.55,85.92,85.92ZM162.77,85.92c0-42.37-34.47-76.85-76.85-76.85S9.07,43.55,9.07,85.92s34.47,76.85,76.85,76.85,76.85-34.47,76.85-76.85Z"
  })));
}

/**
 * McDermott application lockup — symbol + divider + app name.
 * The single shared identity for every app. No per-app logos.
 * Inherits `color` from the surface (set `surface`): navy sidebar → white,
 * light surface → theme text. The divider is the master-brand cue; never omit it.
 */
function Lockup({
  name,
  surface = 'sidebar',
  // 'sidebar' (white) | 'light' (theme text)
  size = 32,
  // 32 in headers, 48–64 on login/splash
  style,
  ...rest
}) {
  const color = surface === 'sidebar' ? 'var(--color-white)' : 'var(--text-primary)';
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--space-3)',
      minWidth: 0,
      color,
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement(McDermottSymbol, {
    size: size
  }), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      width: 1,
      alignSelf: 'stretch',
      minHeight: 24,
      flexShrink: 0,
      background: 'color-mix(in srgb, currentColor 22%, transparent)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mix)',
      fontSize: size >= 48 ? 28 : 18,
      lineHeight: 1.15,
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden'
    }
  }, name));
}
Object.assign(__ds_scope, { McDermottSymbol, Lockup });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/Lockup/Lockup.jsx", error: String((e && e.message) || e) }); }

// components/Stepper/Stepper.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * McDermott Stepper — continuous-track progress for a 3–6 step flow.
 * NEVER bordered rectangles. Four states that all render at the same 36px
 * (28px mobile) circle so the row stays on one baseline:
 *   not-started · current · completed · error
 * State reflects whether the step's WORK is done — a completed step stays
 * completed when you navigate away. On output/summary pages, pass every step
 * as completed (no current).
 *
 * steps: [{ label, state }] where state ∈ not-started|current|completed|error.
 * Completed/current steps are clickable when onStepClick is provided.
 */
function Stepper({
  steps = [],
  onStepClick,
  compact = false,
  style,
  ...rest
}) {
  const dark = typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark';
  const filledFg = dark ? 'var(--color-navy)' : 'var(--color-white)';
  const size = compact ? 28 : 36;
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "list",
    "aria-label": "Progress",
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      padding: 'var(--space-4) 0 var(--space-5)',
      minWidth: 0,
      maxWidth: '100%',
      ...style
    }
  }, rest), steps.map((step, i) => {
    const state = step.state || 'not-started';
    const isLast = i === steps.length - 1;
    const clickable = onStepClick && (state === 'completed' || state === 'current');
    const circle = {
      width: size,
      height: size,
      borderRadius: 999,
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-sans)',
      fontSize: compact ? 12 : 13,
      fontWeight: 600,
      position: 'relative',
      zIndex: 1,
      transition: 'background var(--transition), border-color var(--transition), color var(--transition)',
      background: 'var(--bg-surface)',
      border: '1.5px solid var(--border-light)',
      color: 'var(--text-secondary)'
    };
    if (state === 'current' || state === 'completed') {
      circle.background = 'var(--accent-interactive)';
      circle.border = '1.5px solid var(--accent-interactive)';
      circle.color = filledFg;
    } else if (state === 'error') {
      circle.background = 'var(--color-error)';
      circle.border = '1.5px solid var(--color-error)';
      circle.color = 'var(--color-navy)';
    }
    const connectorDone = state === 'completed';
    const half = size / 2;
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      role: "listitem",
      style: {
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--space-2)',
        position: 'relative'
      }
    }, !isLast && /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true",
      style: {
        position: 'absolute',
        top: half - (connectorDone ? 1 : 0.5),
        left: `calc(50% + ${half + 4}px)`,
        right: `calc(-50% + ${half + 4}px)`,
        height: connectorDone ? 2 : 1,
        zIndex: 0,
        background: connectorDone ? 'var(--accent-interactive)' : 'var(--border-light)',
        transition: 'background var(--transition)'
      }
    }), /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: clickable ? () => onStepClick(i) : undefined,
      "aria-current": state === 'current' ? 'step' : undefined,
      disabled: !clickable,
      style: {
        background: 'none',
        border: 'none',
        padding: 0,
        font: 'inherit',
        cursor: clickable ? 'pointer' : 'default',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--space-2)',
        minWidth: 0,
        width: '100%'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: circle
    }, state === 'completed' ? /*#__PURE__*/React.createElement("i", {
      className: "ph ph-check",
      "aria-hidden": "true",
      style: {
        fontSize: compact ? 14 : 16
      }
    }) : state === 'error' ? /*#__PURE__*/React.createElement("i", {
      className: "ph ph-warning",
      "aria-hidden": "true",
      style: {
        fontSize: compact ? 14 : 16
      }
    }) : i + 1), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-sans)',
        fontSize: compact ? 11 : 13,
        textAlign: 'center',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth: '100%',
        color: state === 'not-started' ? 'var(--text-secondary)' : 'var(--text-primary)',
        fontWeight: state === 'current' ? 500 : 400
      }
    }, step.label)));
  }));
}
Object.assign(__ds_scope, { Stepper });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/Stepper/Stepper.jsx", error: String((e && e.message) || e) }); }

// components/Switch/Switch.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * McDermott Switch (toggle). 44×24 track, 18px thumb. On-state is
 * --accent-interactive (blue light / teal dark). Use for immediate
 * binary settings — not for form submission that needs a Save.
 */
function Switch({
  checked = false,
  onChange,
  label,
  disabled = false,
  id,
  style,
  ...rest
}) {
  const ctrlId = id || `mds-switch-${Math.random().toString(36).slice(2, 8)}`;
  const track = {
    position: 'relative',
    width: 44,
    height: 24,
    flexShrink: 0,
    background: checked ? 'var(--accent-interactive)' : 'var(--color-navy-gray-2)',
    borderRadius: 999,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'background var(--transition)'
  };
  const thumb = {
    position: 'absolute',
    top: 3,
    left: 3,
    width: 18,
    height: 18,
    background: 'var(--color-white)',
    borderRadius: 999,
    transform: checked ? 'translateX(20px)' : 'translateX(0)',
    transition: 'transform var(--transition)',
    boxShadow: 'var(--shadow-sm)'
  };
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: ctrlId,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--space-3)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.4 : 1,
      ...style
    }
  }, /*#__PURE__*/React.createElement("input", _extends({
    id: ctrlId,
    type: "checkbox",
    role: "switch",
    checked: checked,
    disabled: disabled,
    onChange: onChange,
    "aria-checked": checked,
    style: {
      position: 'absolute',
      opacity: 0,
      width: 1,
      height: 1,
      pointerEvents: 'none'
    }
  }, rest)), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: track
  }, /*#__PURE__*/React.createElement("span", {
    style: thumb
  })), label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 16,
      color: 'var(--text-primary)'
    }
  }, label));
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/Switch/Switch.jsx", error: String((e && e.message) || e) }); }

// components/Tabs/Tabs.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  useRef
} = React;
/**
 * McDermott Tabs — sibling content switcher within a section (never primary nav).
 * Active tab: 2px bottom border in --accent-interactive. Max 5. The row scrolls
 * horizontally on narrow viewports, never wraps. Keyboard: Left/Right/Home/End.
 *
 * tabs: [{ id, label }]; controlled via `value` + `onChange`.
 */
function Tabs({
  tabs = [],
  value,
  onChange,
  style,
  ...rest
}) {
  const refs = useRef([]);
  const onKeyDown = (e, i) => {
    let next = null;
    if (e.key === 'ArrowRight') next = (i + 1) % tabs.length;else if (e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;else if (e.key === 'Home') next = 0;else if (e.key === 'End') next = tabs.length - 1;
    if (next !== null) {
      e.preventDefault();
      onChange && onChange(tabs[next].id);
      refs.current[next] && refs.current[next].focus();
    }
  };
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "tablist",
    style: {
      display: 'flex',
      gap: 'var(--space-5)',
      borderBottom: '1px solid var(--border-light)',
      overflowX: 'auto',
      overflowY: 'hidden',
      scrollbarWidth: 'thin',
      WebkitOverflowScrolling: 'touch',
      minWidth: 0,
      maxWidth: '100%',
      ...style
    }
  }, rest), tabs.map((t, i) => {
    const selected = t.id === value;
    return /*#__PURE__*/React.createElement("button", {
      key: t.id,
      ref: el => refs.current[i] = el,
      role: "tab",
      type: "button",
      "aria-selected": selected,
      tabIndex: selected ? 0 : -1,
      onClick: () => onChange && onChange(t.id),
      onKeyDown: e => onKeyDown(e, i),
      style: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 'var(--space-3) 0',
        marginBottom: -1,
        fontFamily: 'var(--font-sans)',
        fontSize: 14,
        fontWeight: 500,
        color: selected ? 'var(--accent-interactive)' : 'var(--text-secondary)',
        borderBottom: `2px solid ${selected ? 'var(--accent-interactive)' : 'transparent'}`,
        whiteSpace: 'nowrap',
        flexShrink: 0,
        transition: 'color var(--transition), border-color var(--transition)'
      },
      onMouseEnter: e => {
        if (!selected) e.currentTarget.style.color = 'var(--text-primary)';
      },
      onMouseLeave: e => {
        if (!selected) e.currentTarget.style.color = 'var(--text-secondary)';
      }
    }, t.label);
  }));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/Tabs/Tabs.jsx", error: String((e && e.message) || e) }); }

// ui_kits/deposition-summarizer/chat.jsx
try { (() => {
// McDermott — Deposition Summarizer · AI chat surface
const {
  Lockup,
  IconButton,
  Avatar
} = window.McDermottDesignSystem_ba7ae4;
const {
  useState,
  useRef,
  useEffect
} = React;

// Render AI body text with inline numeric citation markers: [[1]] -> superscript
function AiBody({
  text
}) {
  const parts = text.split(/(\[\[\d+\]\])/g);
  return /*#__PURE__*/React.createElement("div", {
    className: "ai-body"
  }, parts.map((p, i) => {
    const m = p.match(/^\[\[(\d+)\]\]$/);
    if (m) return /*#__PURE__*/React.createElement("sup", {
      className: "cite",
      key: i,
      title: `Source ${m[1]}`
    }, m[1]);
    return /*#__PURE__*/React.createElement(React.Fragment, {
      key: i
    }, p);
  }));
}
function ThinkingDots() {
  return /*#__PURE__*/React.createElement("div", {
    className: "msg-ai"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ai-tag"
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-sparkle",
    "aria-hidden": "true"
  }), "Generating"), /*#__PURE__*/React.createElement("div", {
    className: "ai-thinking",
    "aria-label": "Generating response"
  }, /*#__PURE__*/React.createElement("span", null), /*#__PURE__*/React.createElement("span", null), /*#__PURE__*/React.createElement("span", null)));
}
function ToolCall({
  tool
}) {
  const [open, setOpen] = useState(false);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("button", {
    className: "tool-call",
    onClick: () => setOpen(o => !o),
    "aria-expanded": open
  }, /*#__PURE__*/React.createElement("span", {
    className: "tool-icon"
  }, /*#__PURE__*/React.createElement("i", {
    className: `ph ${tool.icon}`,
    "aria-hidden": "true"
  })), /*#__PURE__*/React.createElement("span", {
    className: "tool-name"
  }, tool.name), /*#__PURE__*/React.createElement("span", {
    className: "tool-summary"
  }, tool.summary), /*#__PURE__*/React.createElement("i", {
    className: "ph ph-check-circle tool-status ok",
    "aria-label": "Completed"
  })), /*#__PURE__*/React.createElement("div", {
    className: `tool-detail ${open ? 'open' : ''}`
  }, tool.detail));
}
function Feedback() {
  const [vote, setVote] = useState(null);
  return /*#__PURE__*/React.createElement("div", {
    className: "ai-actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: `ai-action ${vote === 'up' ? 'active' : ''}`,
    onClick: () => setVote('up'),
    "aria-pressed": vote === 'up'
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-thumbs-up",
    "aria-hidden": "true"
  })), /*#__PURE__*/React.createElement("button", {
    className: `ai-action ${vote === 'down' ? 'active' : ''}`,
    onClick: () => setVote('down'),
    "aria-pressed": vote === 'down'
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-thumbs-down",
    "aria-hidden": "true"
  })), /*#__PURE__*/React.createElement("button", {
    className: "ai-action"
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-copy",
    "aria-hidden": "true"
  }), "Copy"));
}
function AiMessage({
  msg,
  streaming,
  onFollowup
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "msg-ai"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ai-tag"
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-sparkle",
    "aria-hidden": "true"
  }), "Generated"), /*#__PURE__*/React.createElement(AiBody, {
    text: msg.shown
  }), streaming && /*#__PURE__*/React.createElement("span", {
    className: "stream-cursor",
    "aria-hidden": "true"
  }), !streaming && /*#__PURE__*/React.createElement(React.Fragment, null, msg.tool && /*#__PURE__*/React.createElement(ToolCall, {
    tool: msg.tool
  }), msg.sources && /*#__PURE__*/React.createElement("details", {
    className: "source-list"
  }, /*#__PURE__*/React.createElement("summary", null, "Sources ", /*#__PURE__*/React.createElement("span", {
    className: "source-count"
  }, "\xB7 ", msg.sources.length)), /*#__PURE__*/React.createElement("ol", null, msg.sources.map((s, i) => /*#__PURE__*/React.createElement("li", {
    key: i
  }, s)))), /*#__PURE__*/React.createElement(Feedback, null), msg.followups && /*#__PURE__*/React.createElement("div", {
    className: "followups"
  }, msg.followups.map((f, i) => /*#__PURE__*/React.createElement("button", {
    className: "followup",
    key: i,
    onClick: () => onFollowup(f)
  }, f)))));
}
window.DSChat = {
  AiBody,
  ThinkingDots,
  ToolCall,
  Feedback,
  AiMessage
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/deposition-summarizer/chat.jsx", error: String((e && e.message) || e) }); }

// ui_kits/review-cost-estimator/estimator.jsx
try { (() => {
// McDermott — Review Cost Estimator · the wizard flow + info stepper + summary
const {
  Button,
  Input,
  Checkbox,
  Switch,
  Alert,
  Badge
} = window.McDermottDesignSystem_ba7ae4;
const {
  useState
} = React;
const fmtUSD = n => '$' + n.toLocaleString('en-US');

// ---- Info stepper (calculation-flow variant): each step shows its running value ----
function InfoStepper({
  steps,
  current,
  reached,
  onJump
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "rce-infostepper",
    role: "list",
    "aria-label": "Estimate progress"
  }, steps.map((s, i) => {
    const state = i === current ? 'current' : reached > i ? 'completed' : 'not-started';
    const clickable = reached > i && i !== current;
    return /*#__PURE__*/React.createElement("button", {
      key: s.key,
      role: "listitem",
      type: "button",
      className: `rce-infostep ${state}`,
      "aria-current": state === 'current' ? 'step' : undefined,
      disabled: !clickable,
      onClick: clickable ? () => onJump(i) : undefined
    }, /*#__PURE__*/React.createElement("div", {
      className: "rce-infostep-eyebrow"
    }, "Step ", i + 1), /*#__PURE__*/React.createElement("div", {
      className: "rce-infostep-name"
    }, s.name), /*#__PURE__*/React.createElement("div", {
      className: "rce-infostep-value"
    }, state === 'not-started' ? /*#__PURE__*/React.createElement("span", {
      className: "muted"
    }, "\u2014") : /*#__PURE__*/React.createElement("span", null, s.value)));
  }));
}
function FieldRow({
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "rce-field-row"
  }, children);
}

// ---- Step 1 — Matter setup ----
function MatterSetup({
  data,
  set
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "rce-form"
  }, /*#__PURE__*/React.createElement(FieldRow, null, /*#__PURE__*/React.createElement(Input, {
    label: "Matter name",
    value: data.matterName,
    onChange: e => set({
      matterName: e.target.value
    })
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Client",
    value: data.client,
    onChange: e => set({
      client: e.target.value
    })
  })), /*#__PURE__*/React.createElement(FieldRow, null, /*#__PURE__*/React.createElement(Input, {
    label: "Client number",
    value: data.clientNo,
    onChange: e => set({
      clientNo: e.target.value
    }),
    inputMode: "numeric"
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Matter number",
    value: data.matterNo,
    onChange: e => set({
      matterNo: e.target.value
    }),
    inputMode: "numeric"
  })), /*#__PURE__*/React.createElement("div", {
    className: "rce-fieldset"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rce-legend"
  }, "Review method"), /*#__PURE__*/React.createElement("div", {
    className: "rce-radio-row"
  }, [['linear', 'Linear review'], ['tar', 'TAR / predictive'], ['hybrid', 'Hybrid']].map(([v, l]) => /*#__PURE__*/React.createElement(Checkbox, {
    key: v,
    radio: true,
    name: "method",
    label: l,
    checked: data.method === v,
    onChange: () => set({
      method: v
    })
  })))), /*#__PURE__*/React.createElement(FieldRow, null, /*#__PURE__*/React.createElement(Input, {
    label: "Rate year",
    value: data.rateYear,
    onChange: e => set({
      rateYear: e.target.value
    }),
    hint: "Rate card v24 is current.",
    inputMode: "numeric"
  }), /*#__PURE__*/React.createElement("div", null)));
}

// ---- Step 2 — Processing scenarios ----
function Processing({
  data,
  set
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "rce-form"
  }, /*#__PURE__*/React.createElement(Alert, {
    severity: "info",
    title: "Two scenarios will be modeled"
  }, "A conservative and an aggressive scenario are calculated from the document population below."), /*#__PURE__*/React.createElement(FieldRow, null, /*#__PURE__*/React.createElement(Input, {
    label: "Document population",
    value: data.docs,
    onChange: e => set({
      docs: e.target.value
    }),
    inputMode: "numeric",
    hint: "De-duplicated count after ingestion."
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Reviewers",
    value: data.reviewers,
    onChange: e => set({
      reviewers: e.target.value
    }),
    inputMode: "numeric"
  })), /*#__PURE__*/React.createElement("div", {
    className: "rce-switches"
  }, /*#__PURE__*/React.createElement(Switch, {
    label: "Apply technology-assisted prioritization",
    checked: data.tar,
    onChange: e => set({
      tar: e.target.checked
    })
  }), /*#__PURE__*/React.createElement(Switch, {
    label: "Include privilege review pass",
    checked: data.priv,
    onChange: e => set({
      priv: e.target.checked
    })
  }), /*#__PURE__*/React.createElement(Switch, {
    label: "Include foreign-language QC",
    checked: data.flqc,
    onChange: e => set({
      flqc: e.target.checked
    })
  })));
}

// ---- Step 3 — Review ----
function ReviewStep({
  data
}) {
  const rows = [['Matter', `${data.matterName}`], ['Matter ID', `${data.clientNo} · ${data.matterNo}`], ['Review method', {
    linear: 'Linear review',
    tar: 'TAR / predictive',
    hybrid: 'Hybrid'
  }[data.method]], ['Document population', Number(data.docs).toLocaleString('en-US')], ['Reviewers', data.reviewers], ['Rate card', `v24 · ${data.rateYear}`]];
  return /*#__PURE__*/React.createElement("div", {
    className: "rce-form"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rce-review-table"
  }, rows.map(([k, v]) => /*#__PURE__*/React.createElement("div", {
    className: "rce-review-line",
    key: k
  }, /*#__PURE__*/React.createElement("span", {
    className: "rce-review-k"
  }, k), /*#__PURE__*/React.createElement("span", {
    className: "rce-review-v"
  }, v)))), /*#__PURE__*/React.createElement(Alert, {
    severity: "warning",
    title: "Confirm before generating"
  }, "Generating locks these inputs into the estimate. You can revise any step and regenerate."));
}

// ---- Output — Estimate summary ----
function Summary({
  data,
  total,
  onRevise
}) {
  const scenarioA = Math.round(total * 0.84);
  const scenarioB = total;
  const perDoc = (total / Math.max(1, Number(data.docs))).toFixed(2);
  return /*#__PURE__*/React.createElement("div", {
    className: "rce-summary"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rce-summary-head"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow",
    style: {
      margin: 0
    }
  }, "Generated estimate"), /*#__PURE__*/React.createElement("h1", {
    className: "h2",
    style: {
      margin: 'var(--space-2) 0 0'
    }
  }, data.matterName)), /*#__PURE__*/React.createElement(Badge, {
    variant: "live"
  }, "Live")), /*#__PURE__*/React.createElement("div", {
    className: "rce-kpis"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rce-kpi"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rce-kpi-label"
  }, "Estimated total"), /*#__PURE__*/React.createElement("div", {
    className: "rce-kpi-value"
  }, fmtUSD(total))), /*#__PURE__*/React.createElement("div", {
    className: "rce-kpi"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rce-kpi-label"
  }, "Per document"), /*#__PURE__*/React.createElement("div", {
    className: "rce-kpi-value"
  }, "$", perDoc)), /*#__PURE__*/React.createElement("div", {
    className: "rce-kpi"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rce-kpi-label"
  }, "Documents"), /*#__PURE__*/React.createElement("div", {
    className: "rce-kpi-value"
  }, Number(data.docs).toLocaleString('en-US')))), /*#__PURE__*/React.createElement("div", {
    className: "rce-scenarios"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rce-scenario"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rce-scenario-top",
    style: {
      background: 'var(--color-pale-blue)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "rce-scenario-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow",
    style: {
      margin: 0
    }
  }, "Scenario A \xB7 conservative"), /*#__PURE__*/React.createElement("div", {
    className: "rce-scenario-value"
  }, fmtUSD(scenarioA)), /*#__PURE__*/React.createElement("p", {
    className: "rce-scenario-note"
  }, "TAR prioritization, single review pass, no foreign-language QC."))), /*#__PURE__*/React.createElement("div", {
    className: "rce-scenario"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rce-scenario-top",
    style: {
      background: 'var(--color-pale-gold)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "rce-scenario-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow",
    style: {
      margin: 0
    }
  }, "Scenario B \xB7 full"), /*#__PURE__*/React.createElement("div", {
    className: "rce-scenario-value"
  }, fmtUSD(scenarioB)), /*#__PURE__*/React.createElement("p", {
    className: "rce-scenario-note"
  }, "Linear review with privilege pass and foreign-language QC.")))), /*#__PURE__*/React.createElement("div", {
    className: "rce-summary-actions"
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    icon: "ph-export"
  }, "Export estimate"), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    onClick: onRevise
  }, "Revise inputs")));
}
window.RCEFlow = {
  InfoStepper,
  MatterSetup,
  Processing,
  ReviewStep,
  Summary,
  fmtUSD
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/review-cost-estimator/estimator.jsx", error: String((e && e.message) || e) }); }

// ui_kits/review-cost-estimator/shell.jsx
try { (() => {
// McDermott — Review Cost Estimator · App shell (sidebar + top bar + drawer)
// Composes Lockup, IconButton, Avatar, Badge from the design-system bundle.
const {
  Lockup,
  IconButton,
  Avatar,
  Badge
} = window.McDermottDesignSystem_ba7ae4;
const {
  useState,
  useEffect
} = React;
function SymbolMark({
  size = 20
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      width: size,
      height: size,
      display: 'inline-flex',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 171.84 171.84",
    fill: "currentColor",
    "aria-hidden": "true",
    style: {
      width: '100%',
      height: '100%'
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M43,85.12l22.6,36.87h-22.6v-36.87ZM113.34,121.9h16.81V47.95h-16.81v73.95ZM42.17,47.95l47.09,76.79,8.38-20.04-34.79-56.75h-20.67ZM171.84,85.92c0,47.37-38.55,85.92-85.92,85.92S0,133.29,0,85.92,38.55,0,85.92,0s85.92,38.55,85.92,85.92ZM162.77,85.92c0-42.37-34.47-76.85-76.85-76.85S9.07,43.55,9.07,85.92s34.47,76.85,76.85,76.85,76.85-34.47,76.85-76.85Z"
  })));
}

// Sidebar — app-scoped navigation ONLY (no stepper mirror), active-matter card, pinned user.
function Sidebar({
  active,
  onNavigate,
  open,
  onClose
}) {
  const nav = [{
    id: 'estimate',
    icon: 'ph-calculator',
    label: 'Estimate'
  }, {
    id: 'reference',
    icon: 'ph-book-open',
    label: 'Reference'
  }, {
    id: 'admin',
    icon: 'ph-lock-simple',
    label: 'Admin panel'
  }];
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: `rce-scrim ${open ? 'show' : ''}`,
    onClick: onClose,
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("aside", {
    className: `rce-sidebar ${open ? 'open' : ''}`,
    "aria-label": "Primary"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rce-side-top"
  }, /*#__PURE__*/React.createElement(Lockup, {
    name: "Review Cost Estimator",
    surface: "sidebar"
  }), /*#__PURE__*/React.createElement("div", {
    className: "rce-matter"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rce-matter-eyebrow"
  }, "Active matter"), /*#__PURE__*/React.createElement("div", {
    className: "rce-matter-title"
  }, "Acme Corp. v. Roe Industries"), /*#__PURE__*/React.createElement("div", {
    className: "rce-matter-id"
  }, "412037 \xB7 0042"))), /*#__PURE__*/React.createElement("nav", {
    className: "rce-nav",
    "aria-label": "Sections"
  }, nav.map(n => /*#__PURE__*/React.createElement("a", {
    key: n.id,
    href: `#${n.id}`,
    className: `rce-nav-link ${active === n.id ? 'active' : ''}`,
    "aria-current": active === n.id ? 'page' : undefined,
    onClick: e => {
      e.preventDefault();
      onNavigate(n.id);
      onClose();
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: `ph ${n.icon}`,
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("span", null, n.label)))), /*#__PURE__*/React.createElement("div", {
    className: "rce-side-pinned"
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: "Mara Lindqvist",
    size: 32
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "rce-user-name"
  }, "Mara Lindqvist"), /*#__PURE__*/React.createElement("div", {
    className: "rce-user-role"
  }, "Litigation support")), /*#__PURE__*/React.createElement(IconButton, {
    icon: "ph-sign-out",
    label: "Sign out"
  }))));
}

// Top bar — calm: one location, one primary action, session controls.
function TopBar({
  pageTitle,
  onHamburger,
  primary,
  theme,
  onToggleTheme,
  saved
}) {
  return /*#__PURE__*/React.createElement("header", {
    className: "rce-topbar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rce-topbar-left"
  }, /*#__PURE__*/React.createElement("button", {
    className: "rce-hamburger",
    onClick: onHamburger,
    "aria-label": "Open menu",
    type: "button"
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-list",
    "aria-hidden": "true"
  })), /*#__PURE__*/React.createElement("nav", {
    className: "rce-crumbs",
    "aria-label": "Breadcrumb"
  }, /*#__PURE__*/React.createElement(SymbolMark, {
    size: 16
  }), /*#__PURE__*/React.createElement("i", {
    className: "ph ph-caret-right",
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("span", {
    "aria-current": "page"
  }, pageTitle))), /*#__PURE__*/React.createElement("div", {
    className: "rce-topbar-right"
  }, /*#__PURE__*/React.createElement("span", {
    className: "rce-save",
    title: saved ? 'All changes saved' : 'Saving…'
  }, /*#__PURE__*/React.createElement("i", {
    className: `ph ${saved ? 'ph-cloud-check' : 'ph-arrows-clockwise'}`,
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("span", {
    className: "rce-save-text"
  }, saved ? 'Saved' : 'Saving…')), /*#__PURE__*/React.createElement(IconButton, {
    icon: theme === 'dark' ? 'ph-sun' : 'ph-moon',
    label: "Toggle theme",
    onClick: onToggleTheme
  }), /*#__PURE__*/React.createElement(Avatar, {
    name: "Mara Lindqvist",
    size: 32
  }), primary));
}
window.RCEShell = {
  Sidebar,
  TopBar,
  SymbolMark
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/review-cost-estimator/shell.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Alert = __ds_scope.Alert;

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.McDermottSymbol = __ds_scope.McDermottSymbol;

__ds_ns.Lockup = __ds_scope.Lockup;

__ds_ns.Stepper = __ds_scope.Stepper;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.Tabs = __ds_scope.Tabs;

})();
