import B from "react";
import { Card as ne, Badge as P, Button as Se } from "@rightfit/ui-core";
var ae = { exports: {} }, L = {};
/**
 * @license React
 * react-jsx-dev-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var ye;
function hr() {
  if (ye) return L;
  ye = 1;
  var a = Symbol.for("react.fragment");
  return L.Fragment = a, L.jsxDEV = void 0, L;
}
var U = {};
/**
 * @license React
 * react-jsx-dev-runtime.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var De;
function br() {
  return De || (De = 1, process.env.NODE_ENV !== "production" && function() {
    var a = B, d = Symbol.for("react.element"), N = Symbol.for("react.portal"), h = Symbol.for("react.fragment"), x = Symbol.for("react.strict_mode"), j = Symbol.for("react.profiler"), R = Symbol.for("react.provider"), W = Symbol.for("react.context"), E = Symbol.for("react.forward_ref"), k = Symbol.for("react.suspense"), S = Symbol.for("react.suspense_list"), y = Symbol.for("react.memo"), M = Symbol.for("react.lazy"), z = Symbol.for("react.offscreen"), D = Symbol.iterator, Ie = "@@iterator";
    function Te(e) {
      if (e === null || typeof e != "object")
        return null;
      var r = D && e[D] || e[Ie];
      return typeof r == "function" ? r : null;
    }
    var F = a.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
    function f(e) {
      {
        for (var r = arguments.length, n = new Array(r > 1 ? r - 1 : 0), i = 1; i < r; i++)
          n[i - 1] = arguments[i];
        Pe("error", e, n);
      }
    }
    function Pe(e, r, n) {
      {
        var i = F.ReactDebugCurrentFrame, c = i.getStackAddendum();
        c !== "" && (r += "%s", n = n.concat([c]));
        var u = n.map(function(s) {
          return String(s);
        });
        u.unshift("Warning: " + r), Function.prototype.apply.call(console[e], console, u);
      }
    }
    var We = !1, Je = !1, Ae = !1, $e = !1, Ye = !1, te;
    te = Symbol.for("react.module.reference");
    function Le(e) {
      return !!(typeof e == "string" || typeof e == "function" || e === h || e === j || Ye || e === x || e === k || e === S || $e || e === z || We || Je || Ae || typeof e == "object" && e !== null && (e.$$typeof === M || e.$$typeof === y || e.$$typeof === R || e.$$typeof === W || e.$$typeof === E || // This needs to include all possible module reference object
      // types supported by any Flight configuration anywhere since
      // we don't know which Flight build this will end up being used
      // with.
      e.$$typeof === te || e.getModuleId !== void 0));
    }
    function Ue(e, r, n) {
      var i = e.displayName;
      if (i)
        return i;
      var c = r.displayName || r.name || "";
      return c !== "" ? n + "(" + c + ")" : n;
    }
    function ie(e) {
      return e.displayName || "Context";
    }
    function g(e) {
      if (e == null)
        return null;
      if (typeof e.tag == "number" && f("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), typeof e == "function")
        return e.displayName || e.name || null;
      if (typeof e == "string")
        return e;
      switch (e) {
        case h:
          return "Fragment";
        case N:
          return "Portal";
        case j:
          return "Profiler";
        case x:
          return "StrictMode";
        case k:
          return "Suspense";
        case S:
          return "SuspenseList";
      }
      if (typeof e == "object")
        switch (e.$$typeof) {
          case W:
            var r = e;
            return ie(r) + ".Consumer";
          case R:
            var n = e;
            return ie(n._context) + ".Provider";
          case E:
            return Ue(e, e.render, "ForwardRef");
          case y:
            var i = e.displayName || null;
            return i !== null ? i : g(e.type) || "Memo";
          case M: {
            var c = e, u = c._payload, s = c._init;
            try {
              return g(s(u));
            } catch {
              return null;
            }
          }
        }
      return null;
    }
    var _ = Object.assign, w = 0, oe, se, ce, ue, de, le, me;
    function fe() {
    }
    fe.__reactDisabledLog = !0;
    function Be() {
      {
        if (w === 0) {
          oe = console.log, se = console.info, ce = console.warn, ue = console.error, de = console.group, le = console.groupCollapsed, me = console.groupEnd;
          var e = {
            configurable: !0,
            enumerable: !0,
            value: fe,
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
        w++;
      }
    }
    function ze() {
      {
        if (w--, w === 0) {
          var e = {
            configurable: !0,
            enumerable: !0,
            writable: !0
          };
          Object.defineProperties(console, {
            log: _({}, e, {
              value: oe
            }),
            info: _({}, e, {
              value: se
            }),
            warn: _({}, e, {
              value: ce
            }),
            error: _({}, e, {
              value: ue
            }),
            group: _({}, e, {
              value: de
            }),
            groupCollapsed: _({}, e, {
              value: le
            }),
            groupEnd: _({}, e, {
              value: me
            })
          });
        }
        w < 0 && f("disabledDepth fell below zero. This is a bug in React. Please file an issue.");
      }
    }
    var K = F.ReactCurrentDispatcher, q;
    function J(e, r, n) {
      {
        if (q === void 0)
          try {
            throw Error();
          } catch (c) {
            var i = c.stack.trim().match(/\n( *(at )?)/);
            q = i && i[1] || "";
          }
        return `
` + q + e;
      }
    }
    var G = !1, A;
    {
      var Ke = typeof WeakMap == "function" ? WeakMap : Map;
      A = new Ke();
    }
    function pe(e, r) {
      if (!e || G)
        return "";
      {
        var n = A.get(e);
        if (n !== void 0)
          return n;
      }
      var i;
      G = !0;
      var c = Error.prepareStackTrace;
      Error.prepareStackTrace = void 0;
      var u;
      u = K.current, K.current = null, Be();
      try {
        if (r) {
          var s = function() {
            throw Error();
          };
          if (Object.defineProperty(s.prototype, "props", {
            set: function() {
              throw Error();
            }
          }), typeof Reflect == "object" && Reflect.construct) {
            try {
              Reflect.construct(s, []);
            } catch (v) {
              i = v;
            }
            Reflect.construct(e, [], s);
          } else {
            try {
              s.call();
            } catch (v) {
              i = v;
            }
            e.call(s.prototype);
          }
        } else {
          try {
            throw Error();
          } catch (v) {
            i = v;
          }
          e();
        }
      } catch (v) {
        if (v && i && typeof v.stack == "string") {
          for (var o = v.stack.split(`
`), p = i.stack.split(`
`), l = o.length - 1, m = p.length - 1; l >= 1 && m >= 0 && o[l] !== p[m]; )
            m--;
          for (; l >= 1 && m >= 0; l--, m--)
            if (o[l] !== p[m]) {
              if (l !== 1 || m !== 1)
                do
                  if (l--, m--, m < 0 || o[l] !== p[m]) {
                    var b = `
` + o[l].replace(" at new ", " at ");
                    return e.displayName && b.includes("<anonymous>") && (b = b.replace("<anonymous>", e.displayName)), typeof e == "function" && A.set(e, b), b;
                  }
                while (l >= 1 && m >= 0);
              break;
            }
        }
      } finally {
        G = !1, K.current = u, ze(), Error.prepareStackTrace = c;
      }
      var O = e ? e.displayName || e.name : "", C = O ? J(O) : "";
      return typeof e == "function" && A.set(e, C), C;
    }
    function qe(e, r, n) {
      return pe(e, !1);
    }
    function Ge(e) {
      var r = e.prototype;
      return !!(r && r.isReactComponent);
    }
    function $(e, r, n) {
      if (e == null)
        return "";
      if (typeof e == "function")
        return pe(e, Ge(e));
      if (typeof e == "string")
        return J(e);
      switch (e) {
        case k:
          return J("Suspense");
        case S:
          return J("SuspenseList");
      }
      if (typeof e == "object")
        switch (e.$$typeof) {
          case E:
            return qe(e.render);
          case y:
            return $(e.type, r, n);
          case M: {
            var i = e, c = i._payload, u = i._init;
            try {
              return $(u(c), r, n);
            } catch {
            }
          }
        }
      return "";
    }
    var I = Object.prototype.hasOwnProperty, ve = {}, he = F.ReactDebugCurrentFrame;
    function Y(e) {
      if (e) {
        var r = e._owner, n = $(e.type, e._source, r ? r.type : null);
        he.setExtraStackFrame(n);
      } else
        he.setExtraStackFrame(null);
    }
    function Xe(e, r, n, i, c) {
      {
        var u = Function.call.bind(I);
        for (var s in e)
          if (u(e, s)) {
            var o = void 0;
            try {
              if (typeof e[s] != "function") {
                var p = Error((i || "React class") + ": " + n + " type `" + s + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof e[s] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.");
                throw p.name = "Invariant Violation", p;
              }
              o = e[s](r, s, i, n, null, "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED");
            } catch (l) {
              o = l;
            }
            o && !(o instanceof Error) && (Y(c), f("%s: type specification of %s `%s` is invalid; the type checker function must return `null` or an `Error` but returned a %s. You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument).", i || "React class", n, s, typeof o), Y(null)), o instanceof Error && !(o.message in ve) && (ve[o.message] = !0, Y(c), f("Failed %s type: %s", n, o.message), Y(null));
          }
      }
    }
    var He = Array.isArray;
    function X(e) {
      return He(e);
    }
    function Ze(e) {
      {
        var r = typeof Symbol == "function" && Symbol.toStringTag, n = r && e[Symbol.toStringTag] || e.constructor.name || "Object";
        return n;
      }
    }
    function Qe(e) {
      try {
        return be(e), !1;
      } catch {
        return !0;
      }
    }
    function be(e) {
      return "" + e;
    }
    function ge(e) {
      if (Qe(e))
        return f("The provided key is an unsupported type %s. This value must be coerced to a string before before using it here.", Ze(e)), be(e);
    }
    var T = F.ReactCurrentOwner, er = {
      key: !0,
      ref: !0,
      __self: !0,
      __source: !0
    }, Ne, xe, H;
    H = {};
    function rr(e) {
      if (I.call(e, "ref")) {
        var r = Object.getOwnPropertyDescriptor(e, "ref").get;
        if (r && r.isReactWarning)
          return !1;
      }
      return e.ref !== void 0;
    }
    function ar(e) {
      if (I.call(e, "key")) {
        var r = Object.getOwnPropertyDescriptor(e, "key").get;
        if (r && r.isReactWarning)
          return !1;
      }
      return e.key !== void 0;
    }
    function nr(e, r) {
      if (typeof e.ref == "string" && T.current && r && T.current.stateNode !== r) {
        var n = g(T.current.type);
        H[n] || (f('Component "%s" contains the string ref "%s". Support for string refs will be removed in a future major release. This case cannot be automatically converted to an arrow function. We ask you to manually fix this case by using useRef() or createRef() instead. Learn more about using refs safely here: https://reactjs.org/link/strict-mode-string-ref', g(T.current.type), e.ref), H[n] = !0);
      }
    }
    function tr(e, r) {
      {
        var n = function() {
          Ne || (Ne = !0, f("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", r));
        };
        n.isReactWarning = !0, Object.defineProperty(e, "key", {
          get: n,
          configurable: !0
        });
      }
    }
    function ir(e, r) {
      {
        var n = function() {
          xe || (xe = !0, f("%s: `ref` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", r));
        };
        n.isReactWarning = !0, Object.defineProperty(e, "ref", {
          get: n,
          configurable: !0
        });
      }
    }
    var or = function(e, r, n, i, c, u, s) {
      var o = {
        // This tag allows us to uniquely identify this as a React Element
        $$typeof: d,
        // Built-in properties that belong on the element
        type: e,
        key: r,
        ref: n,
        props: s,
        // Record the component responsible for creating this element.
        _owner: u
      };
      return o._store = {}, Object.defineProperty(o._store, "validated", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: !1
      }), Object.defineProperty(o, "_self", {
        configurable: !1,
        enumerable: !1,
        writable: !1,
        value: i
      }), Object.defineProperty(o, "_source", {
        configurable: !1,
        enumerable: !1,
        writable: !1,
        value: c
      }), Object.freeze && (Object.freeze(o.props), Object.freeze(o)), o;
    };
    function sr(e, r, n, i, c) {
      {
        var u, s = {}, o = null, p = null;
        n !== void 0 && (ge(n), o = "" + n), ar(r) && (ge(r.key), o = "" + r.key), rr(r) && (p = r.ref, nr(r, c));
        for (u in r)
          I.call(r, u) && !er.hasOwnProperty(u) && (s[u] = r[u]);
        if (e && e.defaultProps) {
          var l = e.defaultProps;
          for (u in l)
            s[u] === void 0 && (s[u] = l[u]);
        }
        if (o || p) {
          var m = typeof e == "function" ? e.displayName || e.name || "Unknown" : e;
          o && tr(s, m), p && ir(s, m);
        }
        return or(e, o, p, c, i, T.current, s);
      }
    }
    var Z = F.ReactCurrentOwner, _e = F.ReactDebugCurrentFrame;
    function V(e) {
      if (e) {
        var r = e._owner, n = $(e.type, e._source, r ? r.type : null);
        _e.setExtraStackFrame(n);
      } else
        _e.setExtraStackFrame(null);
    }
    var Q;
    Q = !1;
    function ee(e) {
      return typeof e == "object" && e !== null && e.$$typeof === d;
    }
    function Ce() {
      {
        if (Z.current) {
          var e = g(Z.current.type);
          if (e)
            return `

Check the render method of \`` + e + "`.";
        }
        return "";
      }
    }
    function cr(e) {
      {
        if (e !== void 0) {
          var r = e.fileName.replace(/^.*[\\\/]/, ""), n = e.lineNumber;
          return `

Check your code at ` + r + ":" + n + ".";
        }
        return "";
      }
    }
    var je = {};
    function ur(e) {
      {
        var r = Ce();
        if (!r) {
          var n = typeof e == "string" ? e : e.displayName || e.name;
          n && (r = `

Check the top-level render call using <` + n + ">.");
        }
        return r;
      }
    }
    function Re(e, r) {
      {
        if (!e._store || e._store.validated || e.key != null)
          return;
        e._store.validated = !0;
        var n = ur(r);
        if (je[n])
          return;
        je[n] = !0;
        var i = "";
        e && e._owner && e._owner !== Z.current && (i = " It was passed a child from " + g(e._owner.type) + "."), V(e), f('Each child in a list should have a unique "key" prop.%s%s See https://reactjs.org/link/warning-keys for more information.', n, i), V(null);
      }
    }
    function Ee(e, r) {
      {
        if (typeof e != "object")
          return;
        if (X(e))
          for (var n = 0; n < e.length; n++) {
            var i = e[n];
            ee(i) && Re(i, r);
          }
        else if (ee(e))
          e._store && (e._store.validated = !0);
        else if (e) {
          var c = Te(e);
          if (typeof c == "function" && c !== e.entries)
            for (var u = c.call(e), s; !(s = u.next()).done; )
              ee(s.value) && Re(s.value, r);
        }
      }
    }
    function dr(e) {
      {
        var r = e.type;
        if (r == null || typeof r == "string")
          return;
        var n;
        if (typeof r == "function")
          n = r.propTypes;
        else if (typeof r == "object" && (r.$$typeof === E || // Note: Memo only checks outer props here.
        // Inner props are checked in the reconciler.
        r.$$typeof === y))
          n = r.propTypes;
        else
          return;
        if (n) {
          var i = g(r);
          Xe(n, e.props, "prop", i, e);
        } else if (r.PropTypes !== void 0 && !Q) {
          Q = !0;
          var c = g(r);
          f("Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?", c || "Unknown");
        }
        typeof r.getDefaultProps == "function" && !r.getDefaultProps.isReactClassApproved && f("getDefaultProps is only used on classic React.createClass definitions. Use a static property named `defaultProps` instead.");
      }
    }
    function lr(e) {
      {
        for (var r = Object.keys(e.props), n = 0; n < r.length; n++) {
          var i = r[n];
          if (i !== "children" && i !== "key") {
            V(e), f("Invalid prop `%s` supplied to `React.Fragment`. React.Fragment can only have `key` and `children` props.", i), V(null);
            break;
          }
        }
        e.ref !== null && (V(e), f("Invalid attribute `ref` supplied to `React.Fragment`."), V(null));
      }
    }
    var ke = {};
    function mr(e, r, n, i, c, u) {
      {
        var s = Le(e);
        if (!s) {
          var o = "";
          (e === void 0 || typeof e == "object" && e !== null && Object.keys(e).length === 0) && (o += " You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.");
          var p = cr(c);
          p ? o += p : o += Ce();
          var l;
          e === null ? l = "null" : X(e) ? l = "array" : e !== void 0 && e.$$typeof === d ? (l = "<" + (g(e.type) || "Unknown") + " />", o = " Did you accidentally export a JSX literal instead of a component?") : l = typeof e, f("React.jsx: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: %s.%s", l, o);
        }
        var m = sr(e, r, n, c, u);
        if (m == null)
          return m;
        if (s) {
          var b = r.children;
          if (b !== void 0)
            if (i)
              if (X(b)) {
                for (var O = 0; O < b.length; O++)
                  Ee(b[O], e);
                Object.freeze && Object.freeze(b);
              } else
                f("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");
            else
              Ee(b, e);
        }
        if (I.call(r, "key")) {
          var C = g(e), v = Object.keys(r).filter(function(vr) {
            return vr !== "key";
          }), re = v.length > 0 ? "{key: someKey, " + v.join(": ..., ") + ": ...}" : "{key: someKey}";
          if (!ke[C + re]) {
            var pr = v.length > 0 ? "{" + v.join(": ..., ") + ": ...}" : "{}";
            f(`A props object containing a "key" prop is being spread into JSX:
  let props = %s;
  <%s {...props} />
React keys must be passed directly to JSX without using spread:
  let props = %s;
  <%s key={someKey} {...props} />`, re, C, pr, C), ke[C + re] = !0;
          }
        }
        return e === h ? lr(m) : dr(m), m;
      }
    }
    var fr = mr;
    U.Fragment = h, U.jsxDEV = fr;
  }()), U;
}
process.env.NODE_ENV === "production" ? ae.exports = hr() : ae.exports = br();
var t = ae.exports;
function gr(a) {
  return {
    pending: "Pending",
    scheduled: "Scheduled",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled"
  }[a] || a;
}
function Nr(a) {
  return {
    pending: "warning",
    scheduled: "primary",
    in_progress: "primary",
    completed: "success",
    cancelled: "error"
  }[a] || "default";
}
function Fe(a) {
  return {
    low: "default",
    medium: "warning",
    high: "error",
    urgent: "error",
    critical: "error"
  }[a] || "default";
}
function Ve(a) {
  return a.charAt(0).toUpperCase() + a.slice(1);
}
function xr(a) {
  return {
    draft: "Draft",
    submitted: "Submitted",
    approved: "Approved",
    in_progress: "In Progress",
    completed: "Completed",
    rejected: "Rejected"
  }[a] || a;
}
function _r(a) {
  return {
    draft: "default",
    submitted: "warning",
    approved: "primary",
    in_progress: "primary",
    completed: "success",
    rejected: "error"
  }[a] || "default";
}
function Cr(a) {
  return {
    reported: "Reported",
    acknowledged: "Acknowledged",
    in_progress: "In Progress",
    resolved: "Resolved",
    closed: "Closed"
  }[a] || a;
}
function jr(a) {
  return {
    reported: "warning",
    acknowledged: "primary",
    in_progress: "primary",
    resolved: "success",
    closed: "default"
  }[a] || "default";
}
const Oe = B.forwardRef(
  ({ job: a, onClick: d, onStart: N, onComplete: h, showActions: x = !0, className: j = "" }, R) => {
    const W = Nr(a.status), E = Fe(a.priority), k = a.status === "scheduled" || a.status === "pending", S = a.status === "in_progress", y = () => {
      d && d(a);
    }, M = (D) => {
      D.stopPropagation(), N && N(a);
    }, z = (D) => {
      D.stopPropagation(), h && h(a);
    };
    return /* @__PURE__ */ t.jsxDEV(
      ne,
      {
        ref: R,
        className: `rf-maintenance-job-card ${j}`,
        onClick: d ? y : void 0,
        role: d ? "button" : void 0,
        tabIndex: d ? 0 : void 0,
        "aria-label": `Maintenance job: ${a.title}`,
        children: [
          /* @__PURE__ */ t.jsxDEV("div", { className: "rf-maintenance-job-card__header", children: [
            /* @__PURE__ */ t.jsxDEV("div", { className: "rf-maintenance-job-card__title-section", children: [
              /* @__PURE__ */ t.jsxDEV("h3", { className: "rf-maintenance-job-card__title", children: a.title }, void 0, !1, {
                fileName: "/home/orrox/projects/RightFit-Services/packages/ui-maintenance/src/components/MaintenanceJobCard/MaintenanceJobCard.tsx",
                lineNumber: 63,
                columnNumber: 13
              }, void 0),
              /* @__PURE__ */ t.jsxDEV("div", { className: "rf-maintenance-job-card__badges", children: [
                /* @__PURE__ */ t.jsxDEV(P, { variant: W, children: gr(a.status) }, void 0, !1, {
                  fileName: "/home/orrox/projects/RightFit-Services/packages/ui-maintenance/src/components/MaintenanceJobCard/MaintenanceJobCard.tsx",
                  lineNumber: 65,
                  columnNumber: 15
                }, void 0),
                /* @__PURE__ */ t.jsxDEV(P, { variant: E, children: Ve(a.priority) }, void 0, !1, {
                  fileName: "/home/orrox/projects/RightFit-Services/packages/ui-maintenance/src/components/MaintenanceJobCard/MaintenanceJobCard.tsx",
                  lineNumber: 68,
                  columnNumber: 15
                }, void 0)
              ] }, void 0, !0, {
                fileName: "/home/orrox/projects/RightFit-Services/packages/ui-maintenance/src/components/MaintenanceJobCard/MaintenanceJobCard.tsx",
                lineNumber: 64,
                columnNumber: 13
              }, void 0)
            ] }, void 0, !0, {
              fileName: "/home/orrox/projects/RightFit-Services/packages/ui-maintenance/src/components/MaintenanceJobCard/MaintenanceJobCard.tsx",
              lineNumber: 62,
              columnNumber: 11
            }, void 0),
            /* @__PURE__ */ t.jsxDEV("p", { className: "rf-maintenance-job-card__property", children: a.property.address }, void 0, !1, {
              fileName: "/home/orrox/projects/RightFit-Services/packages/ui-maintenance/src/components/MaintenanceJobCard/MaintenanceJobCard.tsx",
              lineNumber: 73,
              columnNumber: 11
            }, void 0)
          ] }, void 0, !0, {
            fileName: "/home/orrox/projects/RightFit-Services/packages/ui-maintenance/src/components/MaintenanceJobCard/MaintenanceJobCard.tsx",
            lineNumber: 61,
            columnNumber: 9
          }, void 0),
          a.description && /* @__PURE__ */ t.jsxDEV("p", { className: "rf-maintenance-job-card__description", children: a.description }, void 0, !1, {
            fileName: "/home/orrox/projects/RightFit-Services/packages/ui-maintenance/src/components/MaintenanceJobCard/MaintenanceJobCard.tsx",
            lineNumber: 79,
            columnNumber: 11
          }, void 0),
          /* @__PURE__ */ t.jsxDEV("div", { className: "rf-maintenance-job-card__details", children: [
            a.scheduled_date && /* @__PURE__ */ t.jsxDEV("div", { className: "rf-maintenance-job-card__detail", children: [
              /* @__PURE__ */ t.jsxDEV("span", { className: "rf-maintenance-job-card__label", children: "Scheduled:" }, void 0, !1, {
                fileName: "/home/orrox/projects/RightFit-Services/packages/ui-maintenance/src/components/MaintenanceJobCard/MaintenanceJobCard.tsx",
                lineNumber: 87,
                columnNumber: 15
              }, void 0),
              /* @__PURE__ */ t.jsxDEV("span", { className: "rf-maintenance-job-card__value", children: new Date(a.scheduled_date).toLocaleDateString() }, void 0, !1, {
                fileName: "/home/orrox/projects/RightFit-Services/packages/ui-maintenance/src/components/MaintenanceJobCard/MaintenanceJobCard.tsx",
                lineNumber: 88,
                columnNumber: 15
              }, void 0)
            ] }, void 0, !0, {
              fileName: "/home/orrox/projects/RightFit-Services/packages/ui-maintenance/src/components/MaintenanceJobCard/MaintenanceJobCard.tsx",
              lineNumber: 86,
              columnNumber: 13
            }, void 0),
            a.assigned_worker && /* @__PURE__ */ t.jsxDEV("div", { className: "rf-maintenance-job-card__detail", children: [
              /* @__PURE__ */ t.jsxDEV("span", { className: "rf-maintenance-job-card__label", children: "Assigned:" }, void 0, !1, {
                fileName: "/home/orrox/projects/RightFit-Services/packages/ui-maintenance/src/components/MaintenanceJobCard/MaintenanceJobCard.tsx",
                lineNumber: 96,
                columnNumber: 15
              }, void 0),
              /* @__PURE__ */ t.jsxDEV("span", { className: "rf-maintenance-job-card__value", children: [
                a.assigned_worker.first_name,
                " ",
                a.assigned_worker.last_name
              ] }, void 0, !0, {
                fileName: "/home/orrox/projects/RightFit-Services/packages/ui-maintenance/src/components/MaintenanceJobCard/MaintenanceJobCard.tsx",
                lineNumber: 97,
                columnNumber: 15
              }, void 0)
            ] }, void 0, !0, {
              fileName: "/home/orrox/projects/RightFit-Services/packages/ui-maintenance/src/components/MaintenanceJobCard/MaintenanceJobCard.tsx",
              lineNumber: 95,
              columnNumber: 13
            }, void 0),
            a.estimated_cost !== void 0 && /* @__PURE__ */ t.jsxDEV("div", { className: "rf-maintenance-job-card__detail", children: [
              /* @__PURE__ */ t.jsxDEV("span", { className: "rf-maintenance-job-card__label", children: "Est. Cost:" }, void 0, !1, {
                fileName: "/home/orrox/projects/RightFit-Services/packages/ui-maintenance/src/components/MaintenanceJobCard/MaintenanceJobCard.tsx",
                lineNumber: 105,
                columnNumber: 15
              }, void 0),
              /* @__PURE__ */ t.jsxDEV("span", { className: "rf-maintenance-job-card__value", children: [
                "$",
                a.estimated_cost.toFixed(2)
              ] }, void 0, !0, {
                fileName: "/home/orrox/projects/RightFit-Services/packages/ui-maintenance/src/components/MaintenanceJobCard/MaintenanceJobCard.tsx",
                lineNumber: 106,
                columnNumber: 15
              }, void 0)
            ] }, void 0, !0, {
              fileName: "/home/orrox/projects/RightFit-Services/packages/ui-maintenance/src/components/MaintenanceJobCard/MaintenanceJobCard.tsx",
              lineNumber: 104,
              columnNumber: 13
            }, void 0)
          ] }, void 0, !0, {
            fileName: "/home/orrox/projects/RightFit-Services/packages/ui-maintenance/src/components/MaintenanceJobCard/MaintenanceJobCard.tsx",
            lineNumber: 84,
            columnNumber: 9
          }, void 0),
          x && (k || S) && /* @__PURE__ */ t.jsxDEV("div", { className: "rf-maintenance-job-card__actions", children: [
            k && N && /* @__PURE__ */ t.jsxDEV(
              Se,
              {
                variant: "primary",
                size: "sm",
                onClick: M,
                "aria-label": "Start maintenance job",
                children: "Start Job"
              },
              void 0,
              !1,
              {
                fileName: "/home/orrox/projects/RightFit-Services/packages/ui-maintenance/src/components/MaintenanceJobCard/MaintenanceJobCard.tsx",
                lineNumber: 116,
                columnNumber: 15
              },
              void 0
            ),
            S && h && /* @__PURE__ */ t.jsxDEV(
              Se,
              {
                variant: "success",
                size: "sm",
                onClick: z,
                "aria-label": "Complete maintenance job",
                children: "Complete Job"
              },
              void 0,
              !1,
              {
                fileName: "/home/orrox/projects/RightFit-Services/packages/ui-maintenance/src/components/MaintenanceJobCard/MaintenanceJobCard.tsx",
                lineNumber: 126,
                columnNumber: 15
              },
              void 0
            )
          ] }, void 0, !0, {
            fileName: "/home/orrox/projects/RightFit-Services/packages/ui-maintenance/src/components/MaintenanceJobCard/MaintenanceJobCard.tsx",
            lineNumber: 114,
            columnNumber: 11
          }, void 0)
        ]
      },
      void 0,
      !0,
      {
        fileName: "/home/orrox/projects/RightFit-Services/packages/ui-maintenance/src/components/MaintenanceJobCard/MaintenanceJobCard.tsx",
        lineNumber: 53,
        columnNumber: 7
      },
      void 0
    );
  }
);
Oe.displayName = "MaintenanceJobCard";
const Me = B.forwardRef(
  ({ workOrder: a, onClick: d, className: N = "" }, h) => {
    const x = _r(a.status);
    return /* @__PURE__ */ t.jsxDEV(
      ne,
      {
        ref: h,
        className: `rf-work-order-card ${N}`,
        onClick: d ? () => d(a) : void 0,
        role: d ? "button" : void 0,
        tabIndex: d ? 0 : void 0,
        children: [
          /* @__PURE__ */ t.jsxDEV("div", { className: "rf-work-order-card__header", children: [
            /* @__PURE__ */ t.jsxDEV("div", { children: [
              /* @__PURE__ */ t.jsxDEV("h3", { className: "rf-work-order-card__title", children: a.title }, void 0, !1, {
                fileName: "/home/orrox/projects/RightFit-Services/packages/ui-maintenance/src/components/WorkOrderCard/WorkOrderCard.tsx",
                lineNumber: 27,
                columnNumber: 13
              }, void 0),
              /* @__PURE__ */ t.jsxDEV("p", { className: "rf-work-order-card__number", children: [
                "#",
                a.order_number
              ] }, void 0, !0, {
                fileName: "/home/orrox/projects/RightFit-Services/packages/ui-maintenance/src/components/WorkOrderCard/WorkOrderCard.tsx",
                lineNumber: 28,
                columnNumber: 13
              }, void 0)
            ] }, void 0, !0, {
              fileName: "/home/orrox/projects/RightFit-Services/packages/ui-maintenance/src/components/WorkOrderCard/WorkOrderCard.tsx",
              lineNumber: 26,
              columnNumber: 11
            }, void 0),
            /* @__PURE__ */ t.jsxDEV(P, { variant: x, children: xr(a.status) }, void 0, !1, {
              fileName: "/home/orrox/projects/RightFit-Services/packages/ui-maintenance/src/components/WorkOrderCard/WorkOrderCard.tsx",
              lineNumber: 30,
              columnNumber: 11
            }, void 0)
          ] }, void 0, !0, {
            fileName: "/home/orrox/projects/RightFit-Services/packages/ui-maintenance/src/components/WorkOrderCard/WorkOrderCard.tsx",
            lineNumber: 25,
            columnNumber: 9
          }, void 0),
          /* @__PURE__ */ t.jsxDEV("p", { className: "rf-work-order-card__property", children: a.property.address }, void 0, !1, {
            fileName: "/home/orrox/projects/RightFit-Services/packages/ui-maintenance/src/components/WorkOrderCard/WorkOrderCard.tsx",
            lineNumber: 33,
            columnNumber: 9
          }, void 0),
          /* @__PURE__ */ t.jsxDEV("div", { className: "rf-work-order-card__details", children: [
            a.assigned_technician && /* @__PURE__ */ t.jsxDEV("div", { className: "rf-work-order-card__detail", children: [
              /* @__PURE__ */ t.jsxDEV("span", { className: "rf-work-order-card__label", children: "Technician:" }, void 0, !1, {
                fileName: "/home/orrox/projects/RightFit-Services/packages/ui-maintenance/src/components/WorkOrderCard/WorkOrderCard.tsx",
                lineNumber: 38,
                columnNumber: 15
              }, void 0),
              /* @__PURE__ */ t.jsxDEV("span", { className: "rf-work-order-card__value", children: [
                a.assigned_technician.first_name,
                " ",
                a.assigned_technician.last_name
              ] }, void 0, !0, {
                fileName: "/home/orrox/projects/RightFit-Services/packages/ui-maintenance/src/components/WorkOrderCard/WorkOrderCard.tsx",
                lineNumber: 39,
                columnNumber: 15
              }, void 0)
            ] }, void 0, !0, {
              fileName: "/home/orrox/projects/RightFit-Services/packages/ui-maintenance/src/components/WorkOrderCard/WorkOrderCard.tsx",
              lineNumber: 37,
              columnNumber: 13
            }, void 0),
            a.due_date && /* @__PURE__ */ t.jsxDEV("div", { className: "rf-work-order-card__detail", children: [
              /* @__PURE__ */ t.jsxDEV("span", { className: "rf-work-order-card__label", children: "Due:" }, void 0, !1, {
                fileName: "/home/orrox/projects/RightFit-Services/packages/ui-maintenance/src/components/WorkOrderCard/WorkOrderCard.tsx",
                lineNumber: 46,
                columnNumber: 15
              }, void 0),
              /* @__PURE__ */ t.jsxDEV("span", { className: "rf-work-order-card__value", children: new Date(a.due_date).toLocaleDateString() }, void 0, !1, {
                fileName: "/home/orrox/projects/RightFit-Services/packages/ui-maintenance/src/components/WorkOrderCard/WorkOrderCard.tsx",
                lineNumber: 47,
                columnNumber: 15
              }, void 0)
            ] }, void 0, !0, {
              fileName: "/home/orrox/projects/RightFit-Services/packages/ui-maintenance/src/components/WorkOrderCard/WorkOrderCard.tsx",
              lineNumber: 45,
              columnNumber: 13
            }, void 0),
            a.total_cost !== void 0 && /* @__PURE__ */ t.jsxDEV("div", { className: "rf-work-order-card__detail", children: [
              /* @__PURE__ */ t.jsxDEV("span", { className: "rf-work-order-card__label", children: "Total Cost:" }, void 0, !1, {
                fileName: "/home/orrox/projects/RightFit-Services/packages/ui-maintenance/src/components/WorkOrderCard/WorkOrderCard.tsx",
                lineNumber: 54,
                columnNumber: 15
              }, void 0),
              /* @__PURE__ */ t.jsxDEV("span", { className: "rf-work-order-card__value", children: [
                "$",
                a.total_cost.toFixed(2)
              ] }, void 0, !0, {
                fileName: "/home/orrox/projects/RightFit-Services/packages/ui-maintenance/src/components/WorkOrderCard/WorkOrderCard.tsx",
                lineNumber: 55,
                columnNumber: 15
              }, void 0)
            ] }, void 0, !0, {
              fileName: "/home/orrox/projects/RightFit-Services/packages/ui-maintenance/src/components/WorkOrderCard/WorkOrderCard.tsx",
              lineNumber: 53,
              columnNumber: 13
            }, void 0)
          ] }, void 0, !0, {
            fileName: "/home/orrox/projects/RightFit-Services/packages/ui-maintenance/src/components/WorkOrderCard/WorkOrderCard.tsx",
            lineNumber: 35,
            columnNumber: 9
          }, void 0)
        ]
      },
      void 0,
      !0,
      {
        fileName: "/home/orrox/projects/RightFit-Services/packages/ui-maintenance/src/components/WorkOrderCard/WorkOrderCard.tsx",
        lineNumber: 18,
        columnNumber: 7
      },
      void 0
    );
  }
);
Me.displayName = "WorkOrderCard";
const we = B.forwardRef(
  ({ issue: a, onClick: d, showPhotos: N = !0, className: h = "" }, x) => {
    const j = jr(a.status), R = Fe(a.priority);
    return /* @__PURE__ */ t.jsxDEV(
      ne,
      {
        ref: x,
        className: `rf-issue-card ${h}`,
        onClick: d ? () => d(a) : void 0,
        role: d ? "button" : void 0,
        tabIndex: d ? 0 : void 0,
        children: [
          /* @__PURE__ */ t.jsxDEV("div", { className: "rf-issue-card__header", children: [
            /* @__PURE__ */ t.jsxDEV("div", { className: "rf-issue-card__title-section", children: [
              /* @__PURE__ */ t.jsxDEV("h3", { className: "rf-issue-card__title", children: a.title }, void 0, !1, {
                fileName: "/home/orrox/projects/RightFit-Services/packages/ui-maintenance/src/components/IssueCard/IssueCard.tsx",
                lineNumber: 29,
                columnNumber: 13
              }, void 0),
              /* @__PURE__ */ t.jsxDEV("div", { className: "rf-issue-card__badges", children: [
                /* @__PURE__ */ t.jsxDEV(P, { variant: j, children: Cr(a.status) }, void 0, !1, {
                  fileName: "/home/orrox/projects/RightFit-Services/packages/ui-maintenance/src/components/IssueCard/IssueCard.tsx",
                  lineNumber: 31,
                  columnNumber: 15
                }, void 0),
                /* @__PURE__ */ t.jsxDEV(P, { variant: R, children: Ve(a.priority) }, void 0, !1, {
                  fileName: "/home/orrox/projects/RightFit-Services/packages/ui-maintenance/src/components/IssueCard/IssueCard.tsx",
                  lineNumber: 32,
                  columnNumber: 15
                }, void 0)
              ] }, void 0, !0, {
                fileName: "/home/orrox/projects/RightFit-Services/packages/ui-maintenance/src/components/IssueCard/IssueCard.tsx",
                lineNumber: 30,
                columnNumber: 13
              }, void 0)
            ] }, void 0, !0, {
              fileName: "/home/orrox/projects/RightFit-Services/packages/ui-maintenance/src/components/IssueCard/IssueCard.tsx",
              lineNumber: 28,
              columnNumber: 11
            }, void 0),
            /* @__PURE__ */ t.jsxDEV("p", { className: "rf-issue-card__property", children: a.property.address }, void 0, !1, {
              fileName: "/home/orrox/projects/RightFit-Services/packages/ui-maintenance/src/components/IssueCard/IssueCard.tsx",
              lineNumber: 35,
              columnNumber: 11
            }, void 0)
          ] }, void 0, !0, {
            fileName: "/home/orrox/projects/RightFit-Services/packages/ui-maintenance/src/components/IssueCard/IssueCard.tsx",
            lineNumber: 27,
            columnNumber: 9
          }, void 0),
          /* @__PURE__ */ t.jsxDEV("p", { className: "rf-issue-card__description", children: a.description }, void 0, !1, {
            fileName: "/home/orrox/projects/RightFit-Services/packages/ui-maintenance/src/components/IssueCard/IssueCard.tsx",
            lineNumber: 38,
            columnNumber: 9
          }, void 0),
          /* @__PURE__ */ t.jsxDEV("div", { className: "rf-issue-card__details", children: [
            a.category && /* @__PURE__ */ t.jsxDEV("div", { className: "rf-issue-card__detail", children: [
              /* @__PURE__ */ t.jsxDEV("span", { className: "rf-issue-card__label", children: "Category:" }, void 0, !1, {
                fileName: "/home/orrox/projects/RightFit-Services/packages/ui-maintenance/src/components/IssueCard/IssueCard.tsx",
                lineNumber: 43,
                columnNumber: 15
              }, void 0),
              /* @__PURE__ */ t.jsxDEV("span", { className: "rf-issue-card__value", children: a.category.charAt(0).toUpperCase() + a.category.slice(1) }, void 0, !1, {
                fileName: "/home/orrox/projects/RightFit-Services/packages/ui-maintenance/src/components/IssueCard/IssueCard.tsx",
                lineNumber: 44,
                columnNumber: 15
              }, void 0)
            ] }, void 0, !0, {
              fileName: "/home/orrox/projects/RightFit-Services/packages/ui-maintenance/src/components/IssueCard/IssueCard.tsx",
              lineNumber: 42,
              columnNumber: 13
            }, void 0),
            a.reported_by && /* @__PURE__ */ t.jsxDEV("div", { className: "rf-issue-card__detail", children: [
              /* @__PURE__ */ t.jsxDEV("span", { className: "rf-issue-card__label", children: "Reported by:" }, void 0, !1, {
                fileName: "/home/orrox/projects/RightFit-Services/packages/ui-maintenance/src/components/IssueCard/IssueCard.tsx",
                lineNumber: 51,
                columnNumber: 15
              }, void 0),
              /* @__PURE__ */ t.jsxDEV("span", { className: "rf-issue-card__value", children: a.reported_by.name }, void 0, !1, {
                fileName: "/home/orrox/projects/RightFit-Services/packages/ui-maintenance/src/components/IssueCard/IssueCard.tsx",
                lineNumber: 52,
                columnNumber: 15
              }, void 0)
            ] }, void 0, !0, {
              fileName: "/home/orrox/projects/RightFit-Services/packages/ui-maintenance/src/components/IssueCard/IssueCard.tsx",
              lineNumber: 50,
              columnNumber: 13
            }, void 0),
            /* @__PURE__ */ t.jsxDEV("div", { className: "rf-issue-card__detail", children: [
              /* @__PURE__ */ t.jsxDEV("span", { className: "rf-issue-card__label", children: "Reported:" }, void 0, !1, {
                fileName: "/home/orrox/projects/RightFit-Services/packages/ui-maintenance/src/components/IssueCard/IssueCard.tsx",
                lineNumber: 56,
                columnNumber: 13
              }, void 0),
              /* @__PURE__ */ t.jsxDEV("span", { className: "rf-issue-card__value", children: new Date(a.reported_date).toLocaleDateString() }, void 0, !1, {
                fileName: "/home/orrox/projects/RightFit-Services/packages/ui-maintenance/src/components/IssueCard/IssueCard.tsx",
                lineNumber: 57,
                columnNumber: 13
              }, void 0)
            ] }, void 0, !0, {
              fileName: "/home/orrox/projects/RightFit-Services/packages/ui-maintenance/src/components/IssueCard/IssueCard.tsx",
              lineNumber: 55,
              columnNumber: 11
            }, void 0)
          ] }, void 0, !0, {
            fileName: "/home/orrox/projects/RightFit-Services/packages/ui-maintenance/src/components/IssueCard/IssueCard.tsx",
            lineNumber: 40,
            columnNumber: 9
          }, void 0),
          N && a.photos && a.photos.length > 0 && /* @__PURE__ */ t.jsxDEV("div", { className: "rf-issue-card__photos", children: /* @__PURE__ */ t.jsxDEV("span", { className: "rf-issue-card__photos-label", children: [
            a.photos.length,
            " photo",
            a.photos.length > 1 ? "s" : "",
            " attached"
          ] }, void 0, !0, {
            fileName: "/home/orrox/projects/RightFit-Services/packages/ui-maintenance/src/components/IssueCard/IssueCard.tsx",
            lineNumber: 65,
            columnNumber: 13
          }, void 0) }, void 0, !1, {
            fileName: "/home/orrox/projects/RightFit-Services/packages/ui-maintenance/src/components/IssueCard/IssueCard.tsx",
            lineNumber: 64,
            columnNumber: 11
          }, void 0)
        ]
      },
      void 0,
      !0,
      {
        fileName: "/home/orrox/projects/RightFit-Services/packages/ui-maintenance/src/components/IssueCard/IssueCard.tsx",
        lineNumber: 20,
        columnNumber: 7
      },
      void 0
    );
  }
);
we.displayName = "IssueCard";
const kr = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  IssueCard: we,
  MaintenanceJobCard: Oe,
  WorkOrderCard: Me
}, Symbol.toStringTag, { value: "Module" }));
export {
  kr as Components,
  we as IssueCard,
  Oe as MaintenanceJobCard,
  Me as WorkOrderCard,
  Cr as formatIssueStatus,
  gr as formatMaintenanceStatus,
  Ve as formatPriority,
  xr as formatWorkOrderStatus,
  jr as getIssueStatusVariant,
  Nr as getMaintenanceStatusVariant,
  Fe as getPriorityVariant,
  _r as getWorkOrderStatusVariant
};
//# sourceMappingURL=index.js.map
