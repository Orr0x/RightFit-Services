import E from "react";
var se = { exports: {} }, z = {};
/**
 * @license React
 * react-jsx-dev-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Te;
function Er() {
  if (Te) return z;
  Te = 1;
  var n = Symbol.for("react.fragment");
  return z.Fragment = n, z.jsxDEV = void 0, z;
}
var G = {};
/**
 * @license React
 * react-jsx-dev-runtime.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var we;
function Sr() {
  return we || (we = 1, process.env.NODE_ENV !== "production" && function() {
    var n = E, o = Symbol.for("react.element"), s = Symbol.for("react.portal"), c = Symbol.for("react.fragment"), d = Symbol.for("react.strict_mode"), N = Symbol.for("react.profiler"), h = Symbol.for("react.provider"), j = Symbol.for("react.context"), g = Symbol.for("react.forward_ref"), m = Symbol.for("react.suspense"), x = Symbol.for("react.suspense_list"), p = Symbol.for("react.memo"), k = Symbol.for("react.lazy"), S = Symbol.for("react.offscreen"), V = Symbol.iterator, D = "@@iterator";
    function $(e) {
      if (e === null || typeof e != "object")
        return null;
      var r = V && e[V] || e[D];
      return typeof r == "function" ? r : null;
    }
    var w = n.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
    function b(e) {
      {
        for (var r = arguments.length, a = new Array(r > 1 ? r - 1 : 0), i = 1; i < r; i++)
          a[i - 1] = arguments[i];
        Y("error", e, a);
      }
    }
    function Y(e, r, a) {
      {
        var i = w.ReactDebugCurrentFrame, f = i.getStackAddendum();
        f !== "" && (r += "%s", a = a.concat([f]));
        var v = a.map(function(u) {
          return String(u);
        });
        v.unshift("Warning: " + r), Function.prototype.apply.call(console[e], console, v);
      }
    }
    var L = !1, H = !1, X = !1, ze = !1, Ge = !1, ce;
    ce = Symbol.for("react.module.reference");
    function He(e) {
      return !!(typeof e == "string" || typeof e == "function" || e === c || e === N || Ge || e === d || e === m || e === x || ze || e === S || L || H || X || typeof e == "object" && e !== null && (e.$$typeof === k || e.$$typeof === p || e.$$typeof === h || e.$$typeof === j || e.$$typeof === g || // This needs to include all possible module reference object
      // types supported by any Flight configuration anywhere since
      // we don't know which Flight build this will end up being used
      // with.
      e.$$typeof === ce || e.getModuleId !== void 0));
    }
    function Xe(e, r, a) {
      var i = e.displayName;
      if (i)
        return i;
      var f = r.displayName || r.name || "";
      return f !== "" ? a + "(" + f + ")" : a;
    }
    function le(e) {
      return e.displayName || "Context";
    }
    function _(e) {
      if (e == null)
        return null;
      if (typeof e.tag == "number" && b("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), typeof e == "function")
        return e.displayName || e.name || null;
      if (typeof e == "string")
        return e;
      switch (e) {
        case c:
          return "Fragment";
        case s:
          return "Portal";
        case N:
          return "Profiler";
        case d:
          return "StrictMode";
        case m:
          return "Suspense";
        case x:
          return "SuspenseList";
      }
      if (typeof e == "object")
        switch (e.$$typeof) {
          case j:
            var r = e;
            return le(r) + ".Consumer";
          case h:
            var a = e;
            return le(a._context) + ".Provider";
          case g:
            return Xe(e, e.render, "ForwardRef");
          case p:
            var i = e.displayName || null;
            return i !== null ? i : _(e.type) || "Memo";
          case k: {
            var f = e, v = f._payload, u = f._init;
            try {
              return _(u(v));
            } catch {
              return null;
            }
          }
        }
      return null;
    }
    var P = Object.assign, A = 0, ue, de, fe, me, pe, ve, he;
    function be() {
    }
    be.__reactDisabledLog = !0;
    function Ze() {
      {
        if (A === 0) {
          ue = console.log, de = console.info, fe = console.warn, me = console.error, pe = console.group, ve = console.groupCollapsed, he = console.groupEnd;
          var e = {
            configurable: !0,
            enumerable: !0,
            value: be,
            writable: !0
          };
          Object.defineProperties(console, {
            info: e,
            log: e,
            warn: e,
            error: e,
            group: e,
            groupCollapsed: e,
            groupEnd: e
          });
        }
        A++;
      }
    }
    function Qe() {
      {
        if (A--, A === 0) {
          var e = {
            configurable: !0,
            enumerable: !0,
            writable: !0
          };
          Object.defineProperties(console, {
            log: P({}, e, {
              value: ue
            }),
            info: P({}, e, {
              value: de
            }),
            warn: P({}, e, {
              value: fe
            }),
            error: P({}, e, {
              value: me
            }),
            group: P({}, e, {
              value: pe
            }),
            groupCollapsed: P({}, e, {
              value: ve
            }),
            groupEnd: P({}, e, {
              value: he
            })
          });
        }
        A < 0 && b("disabledDepth fell below zero. This is a bug in React. Please file an issue.");
      }
    }
    var Z = w.ReactCurrentDispatcher, Q;
    function U(e, r, a) {
      {
        if (Q === void 0)
          try {
            throw Error();
          } catch (f) {
            var i = f.stack.trim().match(/\n( *(at )?)/);
            Q = i && i[1] || "";
          }
        return `
` + Q + e;
      }
    }
    var ee = !1, J;
    {
      var er = typeof WeakMap == "function" ? WeakMap : Map;
      J = new er();
    }
    function Ne(e, r) {
      if (!e || ee)
        return "";
      {
        var a = J.get(e);
        if (a !== void 0)
          return a;
      }
      var i;
      ee = !0;
      var f = Error.prepareStackTrace;
      Error.prepareStackTrace = void 0;
      var v;
      v = Z.current, Z.current = null, Ze();
      try {
        if (r) {
          var u = function() {
            throw Error();
          };
          if (Object.defineProperty(u.prototype, "props", {
            set: function() {
              throw Error();
            }
          }), typeof Reflect == "object" && Reflect.construct) {
            try {
              Reflect.construct(u, []);
            } catch (F) {
              i = F;
            }
            Reflect.construct(e, [], u);
          } else {
            try {
              u.call();
            } catch (F) {
              i = F;
            }
            e.call(u.prototype);
          }
        } else {
          try {
            throw Error();
          } catch (F) {
            i = F;
          }
          e();
        }
      } catch (F) {
        if (F && i && typeof F.stack == "string") {
          for (var l = F.stack.split(`
`), C = i.stack.split(`
`), R = l.length - 1, y = C.length - 1; R >= 1 && y >= 0 && l[R] !== C[y]; )
            y--;
          for (; R >= 1 && y >= 0; R--, y--)
            if (l[R] !== C[y]) {
              if (R !== 1 || y !== 1)
                do
                  if (R--, y--, y < 0 || l[R] !== C[y]) {
                    var T = `
` + l[R].replace(" at new ", " at ");
                    return e.displayName && T.includes("<anonymous>") && (T = T.replace("<anonymous>", e.displayName)), typeof e == "function" && J.set(e, T), T;
                  }
                while (R >= 1 && y >= 0);
              break;
            }
        }
      } finally {
        ee = !1, Z.current = v, Qe(), Error.prepareStackTrace = f;
      }
      var B = e ? e.displayName || e.name : "", I = B ? U(B) : "";
      return typeof e == "function" && J.set(e, I), I;
    }
    function rr(e, r, a) {
      return Ne(e, !1);
    }
    function tr(e) {
      var r = e.prototype;
      return !!(r && r.isReactComponent);
    }
    function K(e, r, a) {
      if (e == null)
        return "";
      if (typeof e == "function")
        return Ne(e, tr(e));
      if (typeof e == "string")
        return U(e);
      switch (e) {
        case m:
          return U("Suspense");
        case x:
          return U("SuspenseList");
      }
      if (typeof e == "object")
        switch (e.$$typeof) {
          case g:
            return rr(e.render);
          case p:
            return K(e.type, r, a);
          case k: {
            var i = e, f = i._payload, v = i._init;
            try {
              return K(v(f), r, a);
            } catch {
            }
          }
        }
      return "";
    }
    var M = Object.prototype.hasOwnProperty, xe = {}, ge = w.ReactDebugCurrentFrame;
    function q(e) {
      if (e) {
        var r = e._owner, a = K(e.type, e._source, r ? r.type : null);
        ge.setExtraStackFrame(a);
      } else
        ge.setExtraStackFrame(null);
    }
    function ar(e, r, a, i, f) {
      {
        var v = Function.call.bind(M);
        for (var u in e)
          if (v(e, u)) {
            var l = void 0;
            try {
              if (typeof e[u] != "function") {
                var C = Error((i || "React class") + ": " + a + " type `" + u + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof e[u] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.");
                throw C.name = "Invariant Violation", C;
              }
              l = e[u](r, u, i, a, null, "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED");
            } catch (R) {
              l = R;
            }
            l && !(l instanceof Error) && (q(f), b("%s: type specification of %s `%s` is invalid; the type checker function must return `null` or an `Error` but returned a %s. You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument).", i || "React class", a, u, typeof l), q(null)), l instanceof Error && !(l.message in xe) && (xe[l.message] = !0, q(f), b("Failed %s type: %s", a, l.message), q(null));
          }
      }
    }
    var or = Array.isArray;
    function re(e) {
      return or(e);
    }
    function nr(e) {
      {
        var r = typeof Symbol == "function" && Symbol.toStringTag, a = r && e[Symbol.toStringTag] || e.constructor.name || "Object";
        return a;
      }
    }
    function ir(e) {
      try {
        return je(e), !1;
      } catch {
        return !0;
      }
    }
    function je(e) {
      return "" + e;
    }
    function Re(e) {
      if (ir(e))
        return b("The provided key is an unsupported type %s. This value must be coerced to a string before before using it here.", nr(e)), je(e);
    }
    var W = w.ReactCurrentOwner, sr = {
      key: !0,
      ref: !0,
      __self: !0,
      __source: !0
    }, Ee, Se, te;
    te = {};
    function cr(e) {
      if (M.call(e, "ref")) {
        var r = Object.getOwnPropertyDescriptor(e, "ref").get;
        if (r && r.isReactWarning)
          return !1;
      }
      return e.ref !== void 0;
    }
    function lr(e) {
      if (M.call(e, "key")) {
        var r = Object.getOwnPropertyDescriptor(e, "key").get;
        if (r && r.isReactWarning)
          return !1;
      }
      return e.key !== void 0;
    }
    function ur(e, r) {
      if (typeof e.ref == "string" && W.current && r && W.current.stateNode !== r) {
        var a = _(W.current.type);
        te[a] || (b('Component "%s" contains the string ref "%s". Support for string refs will be removed in a future major release. This case cannot be automatically converted to an arrow function. We ask you to manually fix this case by using useRef() or createRef() instead. Learn more about using refs safely here: https://reactjs.org/link/strict-mode-string-ref', _(W.current.type), e.ref), te[a] = !0);
      }
    }
    function dr(e, r) {
      {
        var a = function() {
          Ee || (Ee = !0, b("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", r));
        };
        a.isReactWarning = !0, Object.defineProperty(e, "key", {
          get: a,
          configurable: !0
        });
      }
    }
    function fr(e, r) {
      {
        var a = function() {
          Se || (Se = !0, b("%s: `ref` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", r));
        };
        a.isReactWarning = !0, Object.defineProperty(e, "ref", {
          get: a,
          configurable: !0
        });
      }
    }
    var mr = function(e, r, a, i, f, v, u) {
      var l = {
        // This tag allows us to uniquely identify this as a React Element
        $$typeof: o,
        // Built-in properties that belong on the element
        type: e,
        key: r,
        ref: a,
        props: u,
        // Record the component responsible for creating this element.
        _owner: v
      };
      return l._store = {}, Object.defineProperty(l._store, "validated", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: !1
      }), Object.defineProperty(l, "_self", {
        configurable: !1,
        enumerable: !1,
        writable: !1,
        value: i
      }), Object.defineProperty(l, "_source", {
        configurable: !1,
        enumerable: !1,
        writable: !1,
        value: f
      }), Object.freeze && (Object.freeze(l.props), Object.freeze(l)), l;
    };
    function pr(e, r, a, i, f) {
      {
        var v, u = {}, l = null, C = null;
        a !== void 0 && (Re(a), l = "" + a), lr(r) && (Re(r.key), l = "" + r.key), cr(r) && (C = r.ref, ur(r, f));
        for (v in r)
          M.call(r, v) && !sr.hasOwnProperty(v) && (u[v] = r[v]);
        if (e && e.defaultProps) {
          var R = e.defaultProps;
          for (v in R)
            u[v] === void 0 && (u[v] = R[v]);
        }
        if (l || C) {
          var y = typeof e == "function" ? e.displayName || e.name || "Unknown" : e;
          l && dr(u, y), C && fr(u, y);
        }
        return mr(e, l, C, f, i, W.current, u);
      }
    }
    var ae = w.ReactCurrentOwner, ye = w.ReactDebugCurrentFrame;
    function O(e) {
      if (e) {
        var r = e._owner, a = K(e.type, e._source, r ? r.type : null);
        ye.setExtraStackFrame(a);
      } else
        ye.setExtraStackFrame(null);
    }
    var oe;
    oe = !1;
    function ne(e) {
      return typeof e == "object" && e !== null && e.$$typeof === o;
    }
    function ke() {
      {
        if (ae.current) {
          var e = _(ae.current.type);
          if (e)
            return `

Check the render method of \`` + e + "`.";
        }
        return "";
      }
    }
    function vr(e) {
      {
        if (e !== void 0) {
          var r = e.fileName.replace(/^.*[\\\/]/, ""), a = e.lineNumber;
          return `

Check your code at ` + r + ":" + a + ".";
        }
        return "";
      }
    }
    var De = {};
    function hr(e) {
      {
        var r = ke();
        if (!r) {
          var a = typeof e == "string" ? e : e.displayName || e.name;
          a && (r = `

Check the top-level render call using <` + a + ">.");
        }
        return r;
      }
    }
    function Ce(e, r) {
      {
        if (!e._store || e._store.validated || e.key != null)
          return;
        e._store.validated = !0;
        var a = hr(r);
        if (De[a])
          return;
        De[a] = !0;
        var i = "";
        e && e._owner && e._owner !== ae.current && (i = " It was passed a child from " + _(e._owner.type) + "."), O(e), b('Each child in a list should have a unique "key" prop.%s%s See https://reactjs.org/link/warning-keys for more information.', a, i), O(null);
      }
    }
    function Fe(e, r) {
      {
        if (typeof e != "object")
          return;
        if (re(e))
          for (var a = 0; a < e.length; a++) {
            var i = e[a];
            ne(i) && Ce(i, r);
          }
        else if (ne(e))
          e._store && (e._store.validated = !0);
        else if (e) {
          var f = $(e);
          if (typeof f == "function" && f !== e.entries)
            for (var v = f.call(e), u; !(u = v.next()).done; )
              ne(u.value) && Ce(u.value, r);
        }
      }
    }
    function br(e) {
      {
        var r = e.type;
        if (r == null || typeof r == "string")
          return;
        var a;
        if (typeof r == "function")
          a = r.propTypes;
        else if (typeof r == "object" && (r.$$typeof === g || // Note: Memo only checks outer props here.
        // Inner props are checked in the reconciler.
        r.$$typeof === p))
          a = r.propTypes;
        else
          return;
        if (a) {
          var i = _(r);
          ar(a, e.props, "prop", i, e);
        } else if (r.PropTypes !== void 0 && !oe) {
          oe = !0;
          var f = _(r);
          b("Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?", f || "Unknown");
        }
        typeof r.getDefaultProps == "function" && !r.getDefaultProps.isReactClassApproved && b("getDefaultProps is only used on classic React.createClass definitions. Use a static property named `defaultProps` instead.");
      }
    }
    function Nr(e) {
      {
        for (var r = Object.keys(e.props), a = 0; a < r.length; a++) {
          var i = r[a];
          if (i !== "children" && i !== "key") {
            O(e), b("Invalid prop `%s` supplied to `React.Fragment`. React.Fragment can only have `key` and `children` props.", i), O(null);
            break;
          }
        }
        e.ref !== null && (O(e), b("Invalid attribute `ref` supplied to `React.Fragment`."), O(null));
      }
    }
    var Ve = {};
    function xr(e, r, a, i, f, v) {
      {
        var u = He(e);
        if (!u) {
          var l = "";
          (e === void 0 || typeof e == "object" && e !== null && Object.keys(e).length === 0) && (l += " You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.");
          var C = vr(f);
          C ? l += C : l += ke();
          var R;
          e === null ? R = "null" : re(e) ? R = "array" : e !== void 0 && e.$$typeof === o ? (R = "<" + (_(e.type) || "Unknown") + " />", l = " Did you accidentally export a JSX literal instead of a component?") : R = typeof e, b("React.jsx: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: %s.%s", R, l);
        }
        var y = pr(e, r, a, f, v);
        if (y == null)
          return y;
        if (u) {
          var T = r.children;
          if (T !== void 0)
            if (i)
              if (re(T)) {
                for (var B = 0; B < T.length; B++)
                  Fe(T[B], e);
                Object.freeze && Object.freeze(T);
              } else
                b("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");
            else
              Fe(T, e);
        }
        if (M.call(r, "key")) {
          var I = _(e), F = Object.keys(r).filter(function(Rr) {
            return Rr !== "key";
          }), ie = F.length > 0 ? "{key: someKey, " + F.join(": ..., ") + ": ...}" : "{key: someKey}";
          if (!Ve[I + ie]) {
            var jr = F.length > 0 ? "{" + F.join(": ..., ") + ": ...}" : "{}";
            b(`A props object containing a "key" prop is being spread into JSX:
  let props = %s;
  <%s {...props} />
React keys must be passed directly to JSX without using spread:
  let props = %s;
  <%s key={someKey} {...props} />`, ie, I, jr, I), Ve[I + ie] = !0;
          }
        }
        return e === c ? Nr(y) : br(y), y;
      }
    }
    var gr = xr;
    G.Fragment = c, G.jsxDEV = gr;
  }()), G;
}
process.env.NODE_ENV === "production" ? se.exports = Er() : se.exports = Sr();
var t = se.exports;
const _e = E.forwardRef(
  ({
    variant: n = "primary",
    size: o = "md",
    fullWidth: s = !1,
    loading: c = !1,
    leftIcon: d,
    rightIcon: N,
    disabled: h,
    className: j = "",
    children: g,
    ...m
  }, x) => {
    const p = [
      "rf-btn",
      `rf-btn-${n}`,
      `rf-btn-${o}`,
      s && "rf-btn-full-width",
      c && "rf-btn-loading",
      h && "rf-btn-disabled",
      j
    ].filter(Boolean).join(" ");
    return /* @__PURE__ */ t.jsxDEV(
      "button",
      {
        ref: x,
        className: p,
        disabled: h || c,
        "aria-busy": c,
        "aria-disabled": h || c,
        ...m,
        children: [
          c && /* @__PURE__ */ t.jsxDEV("span", { className: "rf-btn-spinner", "aria-hidden": "true", children: /* @__PURE__ */ t.jsxDEV("svg", { className: "rf-btn-spinner-icon", viewBox: "0 0 24 24", children: /* @__PURE__ */ t.jsxDEV(
            "circle",
            {
              className: "rf-btn-spinner-circle",
              cx: "12",
              cy: "12",
              r: "10",
              fill: "none",
              strokeWidth: "3"
            },
            void 0,
            !1,
            {
              fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/Button/Button.tsx",
              lineNumber: 97,
              columnNumber: 15
            },
            void 0
          ) }, void 0, !1, {
            fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/Button/Button.tsx",
            lineNumber: 96,
            columnNumber: 13
          }, void 0) }, void 0, !1, {
            fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/Button/Button.tsx",
            lineNumber: 95,
            columnNumber: 11
          }, void 0),
          !c && d && /* @__PURE__ */ t.jsxDEV("span", { className: "rf-btn-icon rf-btn-icon-left", "aria-hidden": "true", children: d }, void 0, !1, {
            fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/Button/Button.tsx",
            lineNumber: 109,
            columnNumber: 11
          }, void 0),
          /* @__PURE__ */ t.jsxDEV("span", { className: "rf-btn-content", children: g }, void 0, !1, {
            fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/Button/Button.tsx",
            lineNumber: 113,
            columnNumber: 9
          }, void 0),
          !c && N && /* @__PURE__ */ t.jsxDEV("span", { className: "rf-btn-icon rf-btn-icon-right", "aria-hidden": "true", children: N }, void 0, !1, {
            fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/Button/Button.tsx",
            lineNumber: 115,
            columnNumber: 11
          }, void 0)
        ]
      },
      void 0,
      !0,
      {
        fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/Button/Button.tsx",
        lineNumber: 86,
        columnNumber: 7
      },
      void 0
    );
  }
);
_e.displayName = "Button";
const $e = E.forwardRef(
  ({
    variant: n = "default",
    padding: o = "md",
    hoverable: s = !1,
    header: c,
    footer: d,
    children: N,
    fullWidth: h = !1,
    className: j = "",
    ...g
  }, m) => {
    const x = [
      "rf-card",
      `rf-card-${n}`,
      `rf-card-padding-${o}`,
      s && "rf-card-hoverable",
      h && "rf-card-full-width",
      j
    ].filter(Boolean).join(" ");
    return /* @__PURE__ */ t.jsxDEV("div", { ref: m, className: x, ...g, children: [
      c && /* @__PURE__ */ t.jsxDEV("div", { className: "rf-card-header", children: c }, void 0, !1, {
        fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/Card/Card.tsx",
        lineNumber: 78,
        columnNumber: 20
      }, void 0),
      /* @__PURE__ */ t.jsxDEV("div", { className: "rf-card-body", children: N }, void 0, !1, {
        fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/Card/Card.tsx",
        lineNumber: 79,
        columnNumber: 9
      }, void 0),
      d && /* @__PURE__ */ t.jsxDEV("div", { className: "rf-card-footer", children: d }, void 0, !1, {
        fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/Card/Card.tsx",
        lineNumber: 80,
        columnNumber: 20
      }, void 0)
    ] }, void 0, !0, {
      fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/Card/Card.tsx",
      lineNumber: 77,
      columnNumber: 7
    }, void 0);
  }
);
$e.displayName = "Card";
const Pe = ({
  title: n,
  subtitle: o,
  actions: s,
  icon: c
}) => /* @__PURE__ */ t.jsxDEV("div", { className: "rf-card-header-content", children: [
  /* @__PURE__ */ t.jsxDEV("div", { className: "rf-card-header-left", children: [
    c && /* @__PURE__ */ t.jsxDEV("div", { className: "rf-card-header-icon", children: c }, void 0, !1, {
      fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/Card/Card.tsx",
      lineNumber: 124,
      columnNumber: 18
    }, void 0),
    /* @__PURE__ */ t.jsxDEV("div", { className: "rf-card-header-text", children: [
      /* @__PURE__ */ t.jsxDEV("h3", { className: "rf-card-title", children: n }, void 0, !1, {
        fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/Card/Card.tsx",
        lineNumber: 126,
        columnNumber: 11
      }, void 0),
      o && /* @__PURE__ */ t.jsxDEV("p", { className: "rf-card-subtitle", children: o }, void 0, !1, {
        fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/Card/Card.tsx",
        lineNumber: 127,
        columnNumber: 24
      }, void 0)
    ] }, void 0, !0, {
      fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/Card/Card.tsx",
      lineNumber: 125,
      columnNumber: 9
    }, void 0)
  ] }, void 0, !0, {
    fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/Card/Card.tsx",
    lineNumber: 123,
    columnNumber: 7
  }, void 0),
  s && /* @__PURE__ */ t.jsxDEV("div", { className: "rf-card-header-actions", children: s }, void 0, !1, {
    fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/Card/Card.tsx",
    lineNumber: 130,
    columnNumber: 19
  }, void 0)
] }, void 0, !0, {
  fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/Card/Card.tsx",
  lineNumber: 122,
  columnNumber: 5
}, void 0);
Pe.displayName = "CardHeader";
const Ie = ({
  title: n,
  children: o,
  divider: s = !1,
  className: c = "",
  ...d
}) => {
  const N = [
    "rf-card-section",
    s && "rf-card-section-divider",
    c
  ].filter(Boolean).join(" ");
  return /* @__PURE__ */ t.jsxDEV("div", { className: N, ...d, children: [
    n && /* @__PURE__ */ t.jsxDEV("h4", { className: "rf-card-section-title", children: n }, void 0, !1, {
      fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/Card/Card.tsx",
      lineNumber: 180,
      columnNumber: 17
    }, void 0),
    /* @__PURE__ */ t.jsxDEV("div", { className: "rf-card-section-content", children: o }, void 0, !1, {
      fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/Card/Card.tsx",
      lineNumber: 181,
      columnNumber: 7
    }, void 0)
  ] }, void 0, !0, {
    fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/Card/Card.tsx",
    lineNumber: 179,
    columnNumber: 5
  }, void 0);
};
Ie.displayName = "CardSection";
const Oe = E.forwardRef(
  ({
    label: n,
    error: o,
    helperText: s,
    size: c = "md",
    variant: d = "default",
    leftIcon: N,
    rightIcon: h,
    fullWidth: j = !1,
    suffix: g,
    prefix: m,
    showRequired: x = !1,
    disabled: p,
    className: k = "",
    id: S,
    required: V,
    ...D
  }, $) => {
    const w = E.useId(), b = S || w, Y = `${b}-error`, L = `${b}-helper`, H = [
      "rf-input-wrapper",
      j && "rf-input-wrapper-full-width",
      k
    ].filter(Boolean).join(" "), X = [
      "rf-input",
      `rf-input-${c}`,
      `rf-input-${d}`,
      o && "rf-input-error",
      p && "rf-input-disabled",
      N && "rf-input-has-left-icon",
      h && "rf-input-has-right-icon",
      m && "rf-input-has-prefix",
      g && "rf-input-has-suffix"
    ].filter(Boolean).join(" ");
    return /* @__PURE__ */ t.jsxDEV("div", { className: H, children: [
      n && /* @__PURE__ */ t.jsxDEV("label", { htmlFor: b, className: "rf-input-label", children: [
        n,
        (x || V) && /* @__PURE__ */ t.jsxDEV("span", { className: "rf-input-required", "aria-label": "required", children: "*" }, void 0, !1, {
          fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/Input/Input.tsx",
          lineNumber: 117,
          columnNumber: 15
        }, void 0)
      ] }, void 0, !0, {
        fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/Input/Input.tsx",
        lineNumber: 114,
        columnNumber: 11
      }, void 0),
      /* @__PURE__ */ t.jsxDEV("div", { className: "rf-input-container", children: [
        N && /* @__PURE__ */ t.jsxDEV("span", { className: "rf-input-icon rf-input-icon-left", children: N }, void 0, !1, {
          fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/Input/Input.tsx",
          lineNumber: 125,
          columnNumber: 24
        }, void 0),
        m && /* @__PURE__ */ t.jsxDEV("span", { className: "rf-input-prefix", children: m }, void 0, !1, {
          fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/Input/Input.tsx",
          lineNumber: 126,
          columnNumber: 22
        }, void 0),
        /* @__PURE__ */ t.jsxDEV(
          "input",
          {
            ref: $,
            id: b,
            className: X,
            disabled: p,
            required: V,
            "aria-invalid": o ? "true" : "false",
            "aria-describedby": [o && Y, s && L].filter(Boolean).join(" ") || void 0,
            ...D
          },
          void 0,
          !1,
          {
            fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/Input/Input.tsx",
            lineNumber: 128,
            columnNumber: 11
          },
          void 0
        ),
        g && /* @__PURE__ */ t.jsxDEV("span", { className: "rf-input-suffix", children: g }, void 0, !1, {
          fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/Input/Input.tsx",
          lineNumber: 141,
          columnNumber: 22
        }, void 0),
        h && /* @__PURE__ */ t.jsxDEV("span", { className: "rf-input-icon rf-input-icon-right", children: h }, void 0, !1, {
          fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/Input/Input.tsx",
          lineNumber: 142,
          columnNumber: 25
        }, void 0)
      ] }, void 0, !0, {
        fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/Input/Input.tsx",
        lineNumber: 124,
        columnNumber: 9
      }, void 0),
      o && /* @__PURE__ */ t.jsxDEV("span", { id: Y, className: "rf-input-error-text", role: "alert", children: o }, void 0, !1, {
        fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/Input/Input.tsx",
        lineNumber: 146,
        columnNumber: 11
      }, void 0),
      s && !o && /* @__PURE__ */ t.jsxDEV("span", { id: L, className: "rf-input-helper-text", children: s }, void 0, !1, {
        fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/Input/Input.tsx",
        lineNumber: 152,
        columnNumber: 11
      }, void 0)
    ] }, void 0, !0, {
      fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/Input/Input.tsx",
      lineNumber: 112,
      columnNumber: 7
    }, void 0);
  }
);
Oe.displayName = "Input";
const Be = ({
  size: n = "md",
  label: o = "Loading...",
  className: s = ""
}) => {
  const c = ["rf-spinner", `rf-spinner-${n}`, s].filter(Boolean).join(" ");
  return /* @__PURE__ */ t.jsxDEV("svg", { className: c, viewBox: "0 0 50 50", role: "status", "aria-label": o, children: /* @__PURE__ */ t.jsxDEV(
    "circle",
    {
      className: "rf-spinner-circle",
      cx: "25",
      cy: "25",
      r: "20",
      fill: "none",
      strokeWidth: "5"
    },
    void 0,
    !1,
    {
      fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/Spinner/Spinner.tsx",
      lineNumber: 28,
      columnNumber: 7
    },
    void 0
  ) }, void 0, !1, {
    fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/Spinner/Spinner.tsx",
    lineNumber: 27,
    columnNumber: 5
  }, void 0);
};
Be.displayName = "Spinner";
const Ae = ({
  variant: n = "default",
  children: o,
  className: s = ""
}) => /* @__PURE__ */ t.jsxDEV("span", { className: `rf-badge rf-badge-${n} ${s}`, children: o }, void 0, !1, {
  fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/Badge/Badge.tsx",
  lineNumber: 18,
  columnNumber: 5
}, void 0);
Ae.displayName = "Badge";
const Me = ({
  icon: n,
  title: o,
  description: s,
  action: c,
  className: d = ""
}) => /* @__PURE__ */ t.jsxDEV("div", { className: `rf-empty-state ${d}`, children: [
  n && /* @__PURE__ */ t.jsxDEV("div", { className: "rf-empty-state-icon", children: n }, void 0, !1, {
    fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/EmptyState/EmptyState.tsx",
    lineNumber: 21,
    columnNumber: 16
  }, void 0),
  /* @__PURE__ */ t.jsxDEV("h3", { className: "rf-empty-state-title", children: o }, void 0, !1, {
    fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/EmptyState/EmptyState.tsx",
    lineNumber: 22,
    columnNumber: 7
  }, void 0),
  s && /* @__PURE__ */ t.jsxDEV("p", { className: "rf-empty-state-description", children: s }, void 0, !1, {
    fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/EmptyState/EmptyState.tsx",
    lineNumber: 23,
    columnNumber: 23
  }, void 0),
  c && /* @__PURE__ */ t.jsxDEV("div", { className: "rf-empty-state-action", children: c }, void 0, !1, {
    fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/EmptyState/EmptyState.tsx",
    lineNumber: 24,
    columnNumber: 18
  }, void 0)
] }, void 0, !0, {
  fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/EmptyState/EmptyState.tsx",
  lineNumber: 20,
  columnNumber: 5
}, void 0);
Me.displayName = "EmptyState";
const We = E.forwardRef(
  ({
    label: n,
    error: o,
    helperText: s,
    size: c = "md",
    fullWidth: d = !1,
    resize: N = "vertical",
    className: h = "",
    id: j,
    ...g
  }, m) => {
    const x = E.useId(), p = j || x, k = [
      "rf-textarea-wrapper",
      d && "rf-textarea-wrapper-full-width"
    ].filter(Boolean).join(" "), S = [
      "rf-textarea",
      `rf-textarea-${c}`,
      `rf-textarea-resize-${N}`,
      o && "rf-textarea-error",
      h
    ].filter(Boolean).join(" ");
    return /* @__PURE__ */ t.jsxDEV("div", { className: k, children: [
      n && /* @__PURE__ */ t.jsxDEV("label", { htmlFor: p, className: "rf-textarea-label", children: n }, void 0, !1, {
        fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/Textarea/Textarea.tsx",
        lineNumber: 49,
        columnNumber: 11
      }, void 0),
      /* @__PURE__ */ t.jsxDEV(
        "textarea",
        {
          ref: m,
          id: p,
          className: S,
          "aria-invalid": o ? "true" : "false",
          "aria-describedby": o ? `${p}-error` : s ? `${p}-helper` : void 0,
          ...g
        },
        void 0,
        !1,
        {
          fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/Textarea/Textarea.tsx",
          lineNumber: 53,
          columnNumber: 9
        },
        void 0
      ),
      o && /* @__PURE__ */ t.jsxDEV("span", { id: `${p}-error`, className: "rf-textarea-error-text", role: "alert", children: o }, void 0, !1, {
        fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/Textarea/Textarea.tsx",
        lineNumber: 62,
        columnNumber: 11
      }, void 0),
      !o && s && /* @__PURE__ */ t.jsxDEV("span", { id: `${p}-helper`, className: "rf-textarea-helper-text", children: s }, void 0, !1, {
        fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/Textarea/Textarea.tsx",
        lineNumber: 67,
        columnNumber: 11
      }, void 0)
    ] }, void 0, !0, {
      fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/Textarea/Textarea.tsx",
      lineNumber: 47,
      columnNumber: 7
    }, void 0);
  }
);
We.displayName = "Textarea";
const Ye = E.forwardRef(
  ({
    label: n,
    error: o,
    helperText: s,
    size: c = "md",
    indeterminate: d = !1,
    className: N = "",
    id: h,
    ...j
  }, g) => {
    const m = E.useId(), x = h || m, p = E.useRef(null);
    E.useImperativeHandle(g, () => p.current), E.useEffect(() => {
      p.current && (p.current.indeterminate = d);
    }, [d]);
    const k = [
      "rf-checkbox-wrapper",
      o && "rf-checkbox-wrapper-error"
    ].filter(Boolean).join(" "), S = [
      "rf-checkbox-container",
      `rf-checkbox-${c}`,
      j.disabled && "rf-checkbox-disabled",
      N
    ].filter(Boolean).join(" ");
    return /* @__PURE__ */ t.jsxDEV("div", { className: k, children: [
      /* @__PURE__ */ t.jsxDEV("div", { className: S, children: [
        /* @__PURE__ */ t.jsxDEV(
          "input",
          {
            ref: p,
            type: "checkbox",
            id: x,
            className: "rf-checkbox",
            "aria-invalid": o ? "true" : "false",
            "aria-describedby": o ? `${x}-error` : s ? `${x}-helper` : void 0,
            ...j
          },
          void 0,
          !1,
          {
            fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/Checkbox/Checkbox.tsx",
            lineNumber: 57,
            columnNumber: 11
          },
          void 0
        ),
        n && /* @__PURE__ */ t.jsxDEV("label", { htmlFor: x, className: "rf-checkbox-label", children: n }, void 0, !1, {
          fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/Checkbox/Checkbox.tsx",
          lineNumber: 67,
          columnNumber: 13
        }, void 0)
      ] }, void 0, !0, {
        fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/Checkbox/Checkbox.tsx",
        lineNumber: 56,
        columnNumber: 9
      }, void 0),
      o && /* @__PURE__ */ t.jsxDEV("span", { id: `${x}-error`, className: "rf-checkbox-error-text", role: "alert", children: o }, void 0, !1, {
        fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/Checkbox/Checkbox.tsx",
        lineNumber: 73,
        columnNumber: 11
      }, void 0),
      !o && s && /* @__PURE__ */ t.jsxDEV("span", { id: `${x}-helper`, className: "rf-checkbox-helper-text", children: s }, void 0, !1, {
        fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/Checkbox/Checkbox.tsx",
        lineNumber: 78,
        columnNumber: 11
      }, void 0)
    ] }, void 0, !0, {
      fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/Checkbox/Checkbox.tsx",
      lineNumber: 55,
      columnNumber: 7
    }, void 0);
  }
);
Ye.displayName = "Checkbox";
const Le = E.forwardRef(
  ({
    label: n,
    error: o,
    helperText: s,
    size: c = "md",
    className: d = "",
    id: N,
    ...h
  }, j) => {
    const g = E.useId(), m = N || g, x = [
      "rf-radio-wrapper",
      o && "rf-radio-wrapper-error"
    ].filter(Boolean).join(" "), p = [
      "rf-radio-container",
      `rf-radio-${c}`,
      h.disabled && "rf-radio-disabled",
      d
    ].filter(Boolean).join(" ");
    return /* @__PURE__ */ t.jsxDEV("div", { className: x, children: [
      /* @__PURE__ */ t.jsxDEV("div", { className: p, children: [
        /* @__PURE__ */ t.jsxDEV(
          "input",
          {
            ref: j,
            type: "radio",
            id: m,
            className: "rf-radio",
            "aria-invalid": o ? "true" : "false",
            "aria-describedby": o ? `${m}-error` : s ? `${m}-helper` : void 0,
            ...h
          },
          void 0,
          !1,
          {
            fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/Radio/Radio.tsx",
            lineNumber: 44,
            columnNumber: 11
          },
          void 0
        ),
        n && /* @__PURE__ */ t.jsxDEV("label", { htmlFor: m, className: "rf-radio-label", children: n }, void 0, !1, {
          fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/Radio/Radio.tsx",
          lineNumber: 54,
          columnNumber: 13
        }, void 0)
      ] }, void 0, !0, {
        fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/Radio/Radio.tsx",
        lineNumber: 43,
        columnNumber: 9
      }, void 0),
      o && /* @__PURE__ */ t.jsxDEV("span", { id: `${m}-error`, className: "rf-radio-error-text", role: "alert", children: o }, void 0, !1, {
        fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/Radio/Radio.tsx",
        lineNumber: 60,
        columnNumber: 11
      }, void 0),
      !o && s && /* @__PURE__ */ t.jsxDEV("span", { id: `${m}-helper`, className: "rf-radio-helper-text", children: s }, void 0, !1, {
        fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/Radio/Radio.tsx",
        lineNumber: 65,
        columnNumber: 11
      }, void 0)
    ] }, void 0, !0, {
      fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/Radio/Radio.tsx",
      lineNumber: 42,
      columnNumber: 7
    }, void 0);
  }
);
Le.displayName = "Radio";
const Ue = E.forwardRef(
  ({
    label: n,
    error: o,
    helperText: s,
    size: c = "md",
    fullWidth: d = !1,
    options: N = [],
    className: h = "",
    id: j,
    children: g,
    ...m
  }, x) => {
    const p = E.useId(), k = j || p, S = [
      "rf-select-wrapper",
      d && "rf-select-wrapper-full-width"
    ].filter(Boolean).join(" "), V = [
      "rf-select",
      `rf-select-${c}`,
      o && "rf-select-error",
      h
    ].filter(Boolean).join(" ");
    return /* @__PURE__ */ t.jsxDEV("div", { className: S, children: [
      n && /* @__PURE__ */ t.jsxDEV("label", { htmlFor: k, className: "rf-select-label", children: n }, void 0, !1, {
        fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/Select/Select.tsx",
        lineNumber: 55,
        columnNumber: 11
      }, void 0),
      /* @__PURE__ */ t.jsxDEV("div", { className: "rf-select-container", children: [
        /* @__PURE__ */ t.jsxDEV(
          "select",
          {
            ref: x,
            id: k,
            className: V,
            "aria-invalid": o ? "true" : "false",
            "aria-describedby": o ? `${k}-error` : s ? `${k}-helper` : void 0,
            ...m,
            children: g || N.map((D) => /* @__PURE__ */ t.jsxDEV("option", { value: D.value, disabled: D.disabled, children: D.label }, D.value, !1, {
              fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/Select/Select.tsx",
              lineNumber: 69,
              columnNumber: 15
            }, void 0))
          },
          void 0,
          !1,
          {
            fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/Select/Select.tsx",
            lineNumber: 60,
            columnNumber: 11
          },
          void 0
        ),
        /* @__PURE__ */ t.jsxDEV("span", { className: "rf-select-icon", "aria-hidden": "true", children: "▼" }, void 0, !1, {
          fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/Select/Select.tsx",
          lineNumber: 74,
          columnNumber: 11
        }, void 0)
      ] }, void 0, !0, {
        fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/Select/Select.tsx",
        lineNumber: 59,
        columnNumber: 9
      }, void 0),
      o && /* @__PURE__ */ t.jsxDEV("span", { id: `${k}-error`, className: "rf-select-error-text", role: "alert", children: o }, void 0, !1, {
        fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/Select/Select.tsx",
        lineNumber: 79,
        columnNumber: 11
      }, void 0),
      !o && s && /* @__PURE__ */ t.jsxDEV("span", { id: `${k}-helper`, className: "rf-select-helper-text", children: s }, void 0, !1, {
        fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/Select/Select.tsx",
        lineNumber: 84,
        columnNumber: 11
      }, void 0)
    ] }, void 0, !0, {
      fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/Select/Select.tsx",
      lineNumber: 53,
      columnNumber: 7
    }, void 0);
  }
);
Ue.displayName = "Select";
const Je = ({
  isOpen: n,
  onClose: o,
  title: s,
  footer: c,
  size: d = "md",
  closeOnOverlayClick: N = !0,
  closeOnEscape: h = !0,
  showCloseButton: j = !0,
  children: g,
  className: m = ""
}) => {
  const x = E.useRef(null);
  if (E.useEffect(() => {
    if (!n || !h) return;
    const S = (V) => {
      V.key === "Escape" && o();
    };
    return document.addEventListener("keydown", S), () => document.removeEventListener("keydown", S);
  }, [n, h, o]), E.useEffect(() => (n ? document.body.style.overflow = "hidden" : document.body.style.overflow = "", () => {
    document.body.style.overflow = "";
  }), [n]), E.useEffect(() => {
    if (!n) return;
    const S = x.current;
    if (!S) return;
    const V = S.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ), D = V[0], $ = V[V.length - 1], w = (b) => {
      b.key === "Tab" && (b.shiftKey ? document.activeElement === D && ($ == null || $.focus(), b.preventDefault()) : document.activeElement === $ && (D == null || D.focus(), b.preventDefault()));
    };
    return S.addEventListener("keydown", w), D == null || D.focus(), () => {
      S.removeEventListener("keydown", w);
    };
  }, [n]), !n) return null;
  const p = (S) => {
    S.target === S.currentTarget && N && o();
  }, k = [
    "rf-modal-content",
    `rf-modal-${d}`,
    m
  ].filter(Boolean).join(" ");
  return /* @__PURE__ */ t.jsxDEV("div", { className: "rf-modal-overlay", onClick: p, role: "dialog", "aria-modal": "true", children: /* @__PURE__ */ t.jsxDEV("div", { ref: x, className: k, children: [
    (s || j) && /* @__PURE__ */ t.jsxDEV("div", { className: "rf-modal-header", children: [
      s && /* @__PURE__ */ t.jsxDEV("h2", { className: "rf-modal-title", children: s }, void 0, !1, {
        fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/Modal/Modal.tsx",
        lineNumber: 115,
        columnNumber: 23
      }, void 0),
      j && /* @__PURE__ */ t.jsxDEV(
        "button",
        {
          type: "button",
          className: "rf-modal-close",
          onClick: o,
          "aria-label": "Close modal",
          children: "×"
        },
        void 0,
        !1,
        {
          fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/Modal/Modal.tsx",
          lineNumber: 117,
          columnNumber: 15
        },
        void 0
      )
    ] }, void 0, !0, {
      fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/Modal/Modal.tsx",
      lineNumber: 114,
      columnNumber: 11
    }, void 0),
    /* @__PURE__ */ t.jsxDEV("div", { className: "rf-modal-body", children: g }, void 0, !1, {
      fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/Modal/Modal.tsx",
      lineNumber: 128,
      columnNumber: 9
    }, void 0),
    c && /* @__PURE__ */ t.jsxDEV("div", { className: "rf-modal-footer", children: c }, void 0, !1, {
      fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/Modal/Modal.tsx",
      lineNumber: 129,
      columnNumber: 20
    }, void 0)
  ] }, void 0, !0, {
    fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/Modal/Modal.tsx",
    lineNumber: 112,
    columnNumber: 7
  }, void 0) }, void 0, !1, {
    fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/Modal/Modal.tsx",
    lineNumber: 111,
    columnNumber: 5
  }, void 0);
};
Je.displayName = "Modal";
const Ke = ({
  variant: n = "info",
  title: o,
  message: s,
  duration: c = 5e3,
  onClose: d,
  showCloseButton: N = !0,
  className: h = ""
}) => {
  E.useEffect(() => {
    if (c && d) {
      const m = setTimeout(d, c);
      return () => clearTimeout(m);
    }
  }, [c, d]);
  const j = [
    "rf-toast",
    `rf-toast-${n}`,
    h
  ].filter(Boolean).join(" "), g = () => {
    switch (n) {
      case "success":
        return "✓";
      case "warning":
        return "⚠";
      case "error":
        return "✕";
      default:
        return "ℹ";
    }
  };
  return /* @__PURE__ */ t.jsxDEV("div", { className: j, role: "alert", "aria-live": "polite", children: [
    /* @__PURE__ */ t.jsxDEV("div", { className: "rf-toast-icon", children: g() }, void 0, !1, {
      fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/Toast/Toast.tsx",
      lineNumber: 60,
      columnNumber: 7
    }, void 0),
    /* @__PURE__ */ t.jsxDEV("div", { className: "rf-toast-content", children: [
      o && /* @__PURE__ */ t.jsxDEV("div", { className: "rf-toast-title", children: o }, void 0, !1, {
        fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/Toast/Toast.tsx",
        lineNumber: 62,
        columnNumber: 19
      }, void 0),
      /* @__PURE__ */ t.jsxDEV("div", { className: "rf-toast-message", children: s }, void 0, !1, {
        fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/Toast/Toast.tsx",
        lineNumber: 63,
        columnNumber: 9
      }, void 0)
    ] }, void 0, !0, {
      fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/Toast/Toast.tsx",
      lineNumber: 61,
      columnNumber: 7
    }, void 0),
    N && d && /* @__PURE__ */ t.jsxDEV(
      "button",
      {
        type: "button",
        className: "rf-toast-close",
        onClick: d,
        "aria-label": "Close notification",
        children: "×"
      },
      void 0,
      !1,
      {
        fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/Toast/Toast.tsx",
        lineNumber: 66,
        columnNumber: 9
      },
      void 0
    )
  ] }, void 0, !0, {
    fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/Toast/Toast.tsx",
    lineNumber: 59,
    columnNumber: 5
  }, void 0);
}, qe = ({
  position: n = "top-right",
  children: o
}) => /* @__PURE__ */ t.jsxDEV("div", { className: `rf-toast-container rf-toast-container-${n}`, children: o }, void 0, !1, {
  fileName: "/home/orrox/projects/RightFit-Services/packages/ui-core/src/components/Toast/Toast.tsx",
  lineNumber: 84,
  columnNumber: 5
}, void 0);
Ke.displayName = "Toast";
qe.displayName = "ToastContainer";
const kr = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Badge: Ae,
  Button: _e,
  Card: $e,
  CardHeader: Pe,
  CardSection: Ie,
  Checkbox: Ye,
  EmptyState: Me,
  Input: Oe,
  Modal: Je,
  Radio: Le,
  Select: Ue,
  Spinner: Be,
  Textarea: We,
  Toast: Ke,
  ToastContainer: qe
}, Symbol.toStringTag, { value: "Module" }));
export {
  Ae as Badge,
  _e as Button,
  $e as Card,
  Pe as CardHeader,
  Ie as CardSection,
  Ye as Checkbox,
  kr as Components,
  Me as EmptyState,
  Oe as Input,
  Je as Modal,
  Le as Radio,
  Ue as Select,
  Be as Spinner,
  We as Textarea,
  Ke as Toast,
  qe as ToastContainer
};
//# sourceMappingURL=index.js.map
