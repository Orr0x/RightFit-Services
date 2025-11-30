import U from "react";
import { Card as B, Badge as ne, Button as ye, Checkbox as Se } from "@rightfit/ui-core";
var re = { exports: {} }, Y = {};
/**
 * @license React
 * react-jsx-dev-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var De;
function gr() {
  if (De) return Y;
  De = 1;
  var a = Symbol.for("react.fragment");
  return Y.Fragment = a, Y.jsxDEV = void 0, Y;
}
var L = {};
/**
 * @license React
 * react-jsx-dev-runtime.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Te;
function vr() {
  return Te || (Te = 1, process.env.NODE_ENV !== "production" && function() {
    var a = U, l = Symbol.for("react.element"), k = Symbol.for("react.portal"), b = Symbol.for("react.fragment"), R = Symbol.for("react.strict_mode"), C = Symbol.for("react.profiler"), x = Symbol.for("react.provider"), g = Symbol.for("react.context"), _ = Symbol.for("react.forward_ref"), u = Symbol.for("react.suspense"), p = Symbol.for("react.suspense_list"), E = Symbol.for("react.memo"), S = Symbol.for("react.lazy"), w = Symbol.for("react.offscreen"), ie = Symbol.iterator, Oe = "@@iterator";
    function Je(e) {
      if (e === null || typeof e != "object")
        return null;
      var r = ie && e[ie] || e[Oe];
      return typeof r == "function" ? r : null;
    }
    var F = a.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
    function h(e) {
      {
        for (var r = arguments.length, i = new Array(r > 1 ? r - 1 : 0), t = 1; t < r; t++)
          i[t - 1] = arguments[t];
        Ae("error", e, i);
      }
    }
    function Ae(e, r, i) {
      {
        var t = F.ReactDebugCurrentFrame, c = t.getStackAddendum();
        c !== "" && (r += "%s", i = i.concat([c]));
        var d = i.map(function(o) {
          return String(o);
        });
        d.unshift("Warning: " + r), Function.prototype.apply.call(console[e], console, d);
      }
    }
    var Ie = !1, $e = !1, We = !1, Me = !1, Ye = !1, ae;
    ae = Symbol.for("react.module.reference");
    function Le(e) {
      return !!(typeof e == "string" || typeof e == "function" || e === b || e === C || Ye || e === R || e === u || e === p || Me || e === w || Ie || $e || We || typeof e == "object" && e !== null && (e.$$typeof === S || e.$$typeof === E || e.$$typeof === x || e.$$typeof === g || e.$$typeof === _ || // This needs to include all possible module reference object
      // types supported by any Flight configuration anywhere since
      // we don't know which Flight build this will end up being used
      // with.
      e.$$typeof === ae || e.getModuleId !== void 0));
    }
    function Ue(e, r, i) {
      var t = e.displayName;
      if (t)
        return t;
      var c = r.displayName || r.name || "";
      return c !== "" ? i + "(" + c + ")" : i;
    }
    function te(e) {
      return e.displayName || "Context";
    }
    function y(e) {
      if (e == null)
        return null;
      if (typeof e.tag == "number" && h("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), typeof e == "function")
        return e.displayName || e.name || null;
      if (typeof e == "string")
        return e;
      switch (e) {
        case b:
          return "Fragment";
        case k:
          return "Portal";
        case C:
          return "Profiler";
        case R:
          return "StrictMode";
        case u:
          return "Suspense";
        case p:
          return "SuspenseList";
      }
      if (typeof e == "object")
        switch (e.$$typeof) {
          case g:
            var r = e;
            return te(r) + ".Consumer";
          case x:
            var i = e;
            return te(i._context) + ".Provider";
          case _:
            return Ue(e, e.render, "ForwardRef");
          case E:
            var t = e.displayName || null;
            return t !== null ? t : y(e.type) || "Memo";
          case S: {
            var c = e, d = c._payload, o = c._init;
            try {
              return y(o(d));
            } catch {
              return null;
            }
          }
        }
      return null;
    }
    var D = Object.assign, O = 0, se, oe, ce, le, ue, de, me;
    function fe() {
    }
    fe.__reactDisabledLog = !0;
    function Be() {
      {
        if (O === 0) {
          se = console.log, oe = console.info, ce = console.warn, le = console.error, ue = console.group, de = console.groupCollapsed, me = console.groupEnd;
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
        O++;
      }
    }
    function Ke() {
      {
        if (O--, O === 0) {
          var e = {
            configurable: !0,
            enumerable: !0,
            writable: !0
          };
          Object.defineProperties(console, {
            log: D({}, e, {
              value: se
            }),
            info: D({}, e, {
              value: oe
            }),
            warn: D({}, e, {
              value: ce
            }),
            error: D({}, e, {
              value: le
            }),
            group: D({}, e, {
              value: ue
            }),
            groupCollapsed: D({}, e, {
              value: de
            }),
            groupEnd: D({}, e, {
              value: me
            })
          });
        }
        O < 0 && h("disabledDepth fell below zero. This is a bug in React. Please file an issue.");
      }
    }
    var K = F.ReactCurrentDispatcher, z;
    function I(e, r, i) {
      {
        if (z === void 0)
          try {
            throw Error();
          } catch (c) {
            var t = c.stack.trim().match(/\n( *(at )?)/);
            z = t && t[1] || "";
          }
        return `
` + z + e;
      }
    }
    var q = !1, $;
    {
      var ze = typeof WeakMap == "function" ? WeakMap : Map;
      $ = new ze();
    }
    function pe(e, r) {
      if (!e || q)
        return "";
      {
        var i = $.get(e);
        if (i !== void 0)
          return i;
      }
      var t;
      q = !0;
      var c = Error.prepareStackTrace;
      Error.prepareStackTrace = void 0;
      var d;
      d = K.current, K.current = null, Be();
      try {
        if (r) {
          var o = function() {
            throw Error();
          };
          if (Object.defineProperty(o.prototype, "props", {
            set: function() {
              throw Error();
            }
          }), typeof Reflect == "object" && Reflect.construct) {
            try {
              Reflect.construct(o, []);
            } catch (N) {
              t = N;
            }
            Reflect.construct(e, [], o);
          } else {
            try {
              o.call();
            } catch (N) {
              t = N;
            }
            e.call(o.prototype);
          }
        } else {
          try {
            throw Error();
          } catch (N) {
            t = N;
          }
          e();
        }
      } catch (N) {
        if (N && t && typeof N.stack == "string") {
          for (var s = N.stack.split(`
`), v = t.stack.split(`
`), m = s.length - 1, f = v.length - 1; m >= 1 && f >= 0 && s[m] !== v[f]; )
            f--;
          for (; m >= 1 && f >= 0; m--, f--)
            if (s[m] !== v[f]) {
              if (m !== 1 || f !== 1)
                do
                  if (m--, f--, f < 0 || s[m] !== v[f]) {
                    var j = `
` + s[m].replace(" at new ", " at ");
                    return e.displayName && j.includes("<anonymous>") && (j = j.replace("<anonymous>", e.displayName)), typeof e == "function" && $.set(e, j), j;
                  }
                while (m >= 1 && f >= 0);
              break;
            }
        }
      } finally {
        q = !1, K.current = d, Ke(), Error.prepareStackTrace = c;
      }
      var V = e ? e.displayName || e.name : "", T = V ? I(V) : "";
      return typeof e == "function" && $.set(e, T), T;
    }
    function qe(e, r, i) {
      return pe(e, !1);
    }
    function Ge(e) {
      var r = e.prototype;
      return !!(r && r.isReactComponent);
    }
    function W(e, r, i) {
      if (e == null)
        return "";
      if (typeof e == "function")
        return pe(e, Ge(e));
      if (typeof e == "string")
        return I(e);
      switch (e) {
        case u:
          return I("Suspense");
        case p:
          return I("SuspenseList");
      }
      if (typeof e == "object")
        switch (e.$$typeof) {
          case _:
            return qe(e.render);
          case E:
            return W(e.type, r, i);
          case S: {
            var t = e, c = t._payload, d = t._init;
            try {
              return W(d(c), r, i);
            } catch {
            }
          }
        }
      return "";
    }
    var J = Object.prototype.hasOwnProperty, he = {}, ge = F.ReactDebugCurrentFrame;
    function M(e) {
      if (e) {
        var r = e._owner, i = W(e.type, e._source, r ? r.type : null);
        ge.setExtraStackFrame(i);
      } else
        ge.setExtraStackFrame(null);
    }
    function Xe(e, r, i, t, c) {
      {
        var d = Function.call.bind(J);
        for (var o in e)
          if (d(e, o)) {
            var s = void 0;
            try {
              if (typeof e[o] != "function") {
                var v = Error((t || "React class") + ": " + i + " type `" + o + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof e[o] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.");
                throw v.name = "Invariant Violation", v;
              }
              s = e[o](r, o, t, i, null, "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED");
            } catch (m) {
              s = m;
            }
            s && !(s instanceof Error) && (M(c), h("%s: type specification of %s `%s` is invalid; the type checker function must return `null` or an `Error` but returned a %s. You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument).", t || "React class", i, o, typeof s), M(null)), s instanceof Error && !(s.message in he) && (he[s.message] = !0, M(c), h("Failed %s type: %s", i, s.message), M(null));
          }
      }
    }
    var He = Array.isArray;
    function G(e) {
      return He(e);
    }
    function Ze(e) {
      {
        var r = typeof Symbol == "function" && Symbol.toStringTag, i = r && e[Symbol.toStringTag] || e.constructor.name || "Object";
        return i;
      }
    }
    function Qe(e) {
      try {
        return ve(e), !1;
      } catch {
        return !0;
      }
    }
    function ve(e) {
      return "" + e;
    }
    function be(e) {
      if (Qe(e))
        return h("The provided key is an unsupported type %s. This value must be coerced to a string before before using it here.", Ze(e)), ve(e);
    }
    var A = F.ReactCurrentOwner, er = {
      key: !0,
      ref: !0,
      __self: !0,
      __source: !0
    }, Ne, Ce, X;
    X = {};
    function rr(e) {
      if (J.call(e, "ref")) {
        var r = Object.getOwnPropertyDescriptor(e, "ref").get;
        if (r && r.isReactWarning)
          return !1;
      }
      return e.ref !== void 0;
    }
    function nr(e) {
      if (J.call(e, "key")) {
        var r = Object.getOwnPropertyDescriptor(e, "key").get;
        if (r && r.isReactWarning)
          return !1;
      }
      return e.key !== void 0;
    }
    function ir(e, r) {
      if (typeof e.ref == "string" && A.current && r && A.current.stateNode !== r) {
        var i = y(A.current.type);
        X[i] || (h('Component "%s" contains the string ref "%s". Support for string refs will be removed in a future major release. This case cannot be automatically converted to an arrow function. We ask you to manually fix this case by using useRef() or createRef() instead. Learn more about using refs safely here: https://reactjs.org/link/strict-mode-string-ref', y(A.current.type), e.ref), X[i] = !0);
      }
    }
    function ar(e, r) {
      {
        var i = function() {
          Ne || (Ne = !0, h("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", r));
        };
        i.isReactWarning = !0, Object.defineProperty(e, "key", {
          get: i,
          configurable: !0
        });
      }
    }
    function tr(e, r) {
      {
        var i = function() {
          Ce || (Ce = !0, h("%s: `ref` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", r));
        };
        i.isReactWarning = !0, Object.defineProperty(e, "ref", {
          get: i,
          configurable: !0
        });
      }
    }
    var sr = function(e, r, i, t, c, d, o) {
      var s = {
        // This tag allows us to uniquely identify this as a React Element
        $$typeof: l,
        // Built-in properties that belong on the element
        type: e,
        key: r,
        ref: i,
        props: o,
        // Record the component responsible for creating this element.
        _owner: d
      };
      return s._store = {}, Object.defineProperty(s._store, "validated", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: !1
      }), Object.defineProperty(s, "_self", {
        configurable: !1,
        enumerable: !1,
        writable: !1,
        value: t
      }), Object.defineProperty(s, "_source", {
        configurable: !1,
        enumerable: !1,
        writable: !1,
        value: c
      }), Object.freeze && (Object.freeze(s.props), Object.freeze(s)), s;
    };
    function or(e, r, i, t, c) {
      {
        var d, o = {}, s = null, v = null;
        i !== void 0 && (be(i), s = "" + i), nr(r) && (be(r.key), s = "" + r.key), rr(r) && (v = r.ref, ir(r, c));
        for (d in r)
          J.call(r, d) && !er.hasOwnProperty(d) && (o[d] = r[d]);
        if (e && e.defaultProps) {
          var m = e.defaultProps;
          for (d in m)
            o[d] === void 0 && (o[d] = m[d]);
        }
        if (s || v) {
          var f = typeof e == "function" ? e.displayName || e.name || "Unknown" : e;
          s && ar(o, f), v && tr(o, f);
        }
        return sr(e, s, v, c, t, A.current, o);
      }
    }
    var H = F.ReactCurrentOwner, xe = F.ReactDebugCurrentFrame;
    function P(e) {
      if (e) {
        var r = e._owner, i = W(e.type, e._source, r ? r.type : null);
        xe.setExtraStackFrame(i);
      } else
        xe.setExtraStackFrame(null);
    }
    var Z;
    Z = !1;
    function Q(e) {
      return typeof e == "object" && e !== null && e.$$typeof === l;
    }
    function _e() {
      {
        if (H.current) {
          var e = y(H.current.type);
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
          var r = e.fileName.replace(/^.*[\\\/]/, ""), i = e.lineNumber;
          return `

Check your code at ` + r + ":" + i + ".";
        }
        return "";
      }
    }
    var je = {};
    function lr(e) {
      {
        var r = _e();
        if (!r) {
          var i = typeof e == "string" ? e : e.displayName || e.name;
          i && (r = `

Check the top-level render call using <` + i + ">.");
        }
        return r;
      }
    }
    function ke(e, r) {
      {
        if (!e._store || e._store.validated || e.key != null)
          return;
        e._store.validated = !0;
        var i = lr(r);
        if (je[i])
          return;
        je[i] = !0;
        var t = "";
        e && e._owner && e._owner !== H.current && (t = " It was passed a child from " + y(e._owner.type) + "."), P(e), h('Each child in a list should have a unique "key" prop.%s%s See https://reactjs.org/link/warning-keys for more information.', i, t), P(null);
      }
    }
    function Ee(e, r) {
      {
        if (typeof e != "object")
          return;
        if (G(e))
          for (var i = 0; i < e.length; i++) {
            var t = e[i];
            Q(t) && ke(t, r);
          }
        else if (Q(e))
          e._store && (e._store.validated = !0);
        else if (e) {
          var c = Je(e);
          if (typeof c == "function" && c !== e.entries)
            for (var d = c.call(e), o; !(o = d.next()).done; )
              Q(o.value) && ke(o.value, r);
        }
      }
    }
    function ur(e) {
      {
        var r = e.type;
        if (r == null || typeof r == "string")
          return;
        var i;
        if (typeof r == "function")
          i = r.propTypes;
        else if (typeof r == "object" && (r.$$typeof === _ || // Note: Memo only checks outer props here.
        // Inner props are checked in the reconciler.
        r.$$typeof === E))
          i = r.propTypes;
        else
          return;
        if (i) {
          var t = y(r);
          Xe(i, e.props, "prop", t, e);
        } else if (r.PropTypes !== void 0 && !Z) {
          Z = !0;
          var c = y(r);
          h("Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?", c || "Unknown");
        }
        typeof r.getDefaultProps == "function" && !r.getDefaultProps.isReactClassApproved && h("getDefaultProps is only used on classic React.createClass definitions. Use a static property named `defaultProps` instead.");
      }
    }
    function dr(e) {
      {
        for (var r = Object.keys(e.props), i = 0; i < r.length; i++) {
          var t = r[i];
          if (t !== "children" && t !== "key") {
            P(e), h("Invalid prop `%s` supplied to `React.Fragment`. React.Fragment can only have `key` and `children` props.", t), P(null);
            break;
          }
        }
        e.ref !== null && (P(e), h("Invalid attribute `ref` supplied to `React.Fragment`."), P(null));
      }
    }
    var Re = {};
    function mr(e, r, i, t, c, d) {
      {
        var o = Le(e);
        if (!o) {
          var s = "";
          (e === void 0 || typeof e == "object" && e !== null && Object.keys(e).length === 0) && (s += " You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.");
          var v = cr(c);
          v ? s += v : s += _e();
          var m;
          e === null ? m = "null" : G(e) ? m = "array" : e !== void 0 && e.$$typeof === l ? (m = "<" + (y(e.type) || "Unknown") + " />", s = " Did you accidentally export a JSX literal instead of a component?") : m = typeof e, h("React.jsx: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: %s.%s", m, s);
        }
        var f = or(e, r, i, c, d);
        if (f == null)
          return f;
        if (o) {
          var j = r.children;
          if (j !== void 0)
            if (t)
              if (G(j)) {
                for (var V = 0; V < j.length; V++)
                  Ee(j[V], e);
                Object.freeze && Object.freeze(j);
              } else
                h("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");
            else
              Ee(j, e);
        }
        if (J.call(r, "key")) {
          var T = y(e), N = Object.keys(r).filter(function(hr) {
            return hr !== "key";
          }), ee = N.length > 0 ? "{key: someKey, " + N.join(": ..., ") + ": ...}" : "{key: someKey}";
          if (!Re[T + ee]) {
            var pr = N.length > 0 ? "{" + N.join(": ..., ") + ": ...}" : "{}";
            h(`A props object containing a "key" prop is being spread into JSX:
  let props = %s;
  <%s {...props} />
React keys must be passed directly to JSX without using spread:
  let props = %s;
  <%s key={someKey} {...props} />`, ee, T, pr, T), Re[T + ee] = !0;
          }
        }
        return e === b ? dr(f) : ur(f), f;
      }
    }
    var fr = mr;
    L.Fragment = b, L.jsxDEV = fr;
  }()), L;
}
process.env.NODE_ENV === "production" ? re.exports = gr() : re.exports = vr();
var n = re.exports;
const Fe = U.forwardRef(
  ({ property: a, onClick: l, showOwner: k = !0, className: b = "" }, R) => {
    const C = () => {
      l && l(a);
    }, x = (g) => {
      l && (g.key === "Enter" || g.key === " ") && (g.preventDefault(), l(a));
    };
    return /* @__PURE__ */ n.jsxDEV(
      B,
      {
        ref: R,
        className: `rf-property-card ${b}`,
        onClick: l ? C : void 0,
        onKeyDown: l ? x : void 0,
        role: l ? "button" : void 0,
        tabIndex: l ? 0 : void 0,
        "aria-label": `Property at ${a.address}`,
        children: [
          /* @__PURE__ */ n.jsxDEV("div", { className: "rf-property-card__header", children: [
            /* @__PURE__ */ n.jsxDEV("h3", { className: "rf-property-card__address", children: a.address }, void 0, !1, {
              fileName: "/home/orrox/projects/RightFit-Services/packages/ui-cleaning/src/components/PropertyCard/PropertyCard.tsx",
              lineNumber: 47,
              columnNumber: 11
            }, void 0),
            /* @__PURE__ */ n.jsxDEV(ne, { variant: a.is_active ? "success" : "default", children: a.is_active ? "Active" : "Inactive" }, void 0, !1, {
              fileName: "/home/orrox/projects/RightFit-Services/packages/ui-cleaning/src/components/PropertyCard/PropertyCard.tsx",
              lineNumber: 48,
              columnNumber: 11
            }, void 0)
          ] }, void 0, !0, {
            fileName: "/home/orrox/projects/RightFit-Services/packages/ui-cleaning/src/components/PropertyCard/PropertyCard.tsx",
            lineNumber: 46,
            columnNumber: 9
          }, void 0),
          /* @__PURE__ */ n.jsxDEV("div", { className: "rf-property-card__details", children: [
            /* @__PURE__ */ n.jsxDEV("div", { className: "rf-property-card__detail", children: [
              /* @__PURE__ */ n.jsxDEV("span", { className: "rf-property-card__label", children: "Type:" }, void 0, !1, {
                fileName: "/home/orrox/projects/RightFit-Services/packages/ui-cleaning/src/components/PropertyCard/PropertyCard.tsx",
                lineNumber: 55,
                columnNumber: 13
              }, void 0),
              /* @__PURE__ */ n.jsxDEV("span", { className: "rf-property-card__value", children: a.property_type }, void 0, !1, {
                fileName: "/home/orrox/projects/RightFit-Services/packages/ui-cleaning/src/components/PropertyCard/PropertyCard.tsx",
                lineNumber: 56,
                columnNumber: 13
              }, void 0)
            ] }, void 0, !0, {
              fileName: "/home/orrox/projects/RightFit-Services/packages/ui-cleaning/src/components/PropertyCard/PropertyCard.tsx",
              lineNumber: 54,
              columnNumber: 11
            }, void 0),
            a.bedrooms !== void 0 && /* @__PURE__ */ n.jsxDEV("div", { className: "rf-property-card__detail", children: [
              /* @__PURE__ */ n.jsxDEV("span", { className: "rf-property-card__label", children: "Bedrooms:" }, void 0, !1, {
                fileName: "/home/orrox/projects/RightFit-Services/packages/ui-cleaning/src/components/PropertyCard/PropertyCard.tsx",
                lineNumber: 61,
                columnNumber: 15
              }, void 0),
              /* @__PURE__ */ n.jsxDEV("span", { className: "rf-property-card__value", children: a.bedrooms }, void 0, !1, {
                fileName: "/home/orrox/projects/RightFit-Services/packages/ui-cleaning/src/components/PropertyCard/PropertyCard.tsx",
                lineNumber: 62,
                columnNumber: 15
              }, void 0)
            ] }, void 0, !0, {
              fileName: "/home/orrox/projects/RightFit-Services/packages/ui-cleaning/src/components/PropertyCard/PropertyCard.tsx",
              lineNumber: 60,
              columnNumber: 13
            }, void 0),
            a.bathrooms !== void 0 && /* @__PURE__ */ n.jsxDEV("div", { className: "rf-property-card__detail", children: [
              /* @__PURE__ */ n.jsxDEV("span", { className: "rf-property-card__label", children: "Bathrooms:" }, void 0, !1, {
                fileName: "/home/orrox/projects/RightFit-Services/packages/ui-cleaning/src/components/PropertyCard/PropertyCard.tsx",
                lineNumber: 68,
                columnNumber: 15
              }, void 0),
              /* @__PURE__ */ n.jsxDEV("span", { className: "rf-property-card__value", children: a.bathrooms }, void 0, !1, {
                fileName: "/home/orrox/projects/RightFit-Services/packages/ui-cleaning/src/components/PropertyCard/PropertyCard.tsx",
                lineNumber: 69,
                columnNumber: 15
              }, void 0)
            ] }, void 0, !0, {
              fileName: "/home/orrox/projects/RightFit-Services/packages/ui-cleaning/src/components/PropertyCard/PropertyCard.tsx",
              lineNumber: 67,
              columnNumber: 13
            }, void 0),
            k && a.landlord && /* @__PURE__ */ n.jsxDEV("div", { className: "rf-property-card__detail", children: [
              /* @__PURE__ */ n.jsxDEV("span", { className: "rf-property-card__label", children: "Owner:" }, void 0, !1, {
                fileName: "/home/orrox/projects/RightFit-Services/packages/ui-cleaning/src/components/PropertyCard/PropertyCard.tsx",
                lineNumber: 75,
                columnNumber: 15
              }, void 0),
              /* @__PURE__ */ n.jsxDEV("span", { className: "rf-property-card__value", children: [
                a.landlord.first_name,
                " ",
                a.landlord.last_name
              ] }, void 0, !0, {
                fileName: "/home/orrox/projects/RightFit-Services/packages/ui-cleaning/src/components/PropertyCard/PropertyCard.tsx",
                lineNumber: 76,
                columnNumber: 15
              }, void 0)
            ] }, void 0, !0, {
              fileName: "/home/orrox/projects/RightFit-Services/packages/ui-cleaning/src/components/PropertyCard/PropertyCard.tsx",
              lineNumber: 74,
              columnNumber: 13
            }, void 0)
          ] }, void 0, !0, {
            fileName: "/home/orrox/projects/RightFit-Services/packages/ui-cleaning/src/components/PropertyCard/PropertyCard.tsx",
            lineNumber: 53,
            columnNumber: 9
          }, void 0),
          a.special_instructions && /* @__PURE__ */ n.jsxDEV("div", { className: "rf-property-card__instructions", children: [
            /* @__PURE__ */ n.jsxDEV("span", { className: "rf-property-card__label", children: "Instructions:" }, void 0, !1, {
              fileName: "/home/orrox/projects/RightFit-Services/packages/ui-cleaning/src/components/PropertyCard/PropertyCard.tsx",
              lineNumber: 85,
              columnNumber: 13
            }, void 0),
            /* @__PURE__ */ n.jsxDEV("p", { className: "rf-property-card__instructions-text", children: a.special_instructions }, void 0, !1, {
              fileName: "/home/orrox/projects/RightFit-Services/packages/ui-cleaning/src/components/PropertyCard/PropertyCard.tsx",
              lineNumber: 86,
              columnNumber: 13
            }, void 0)
          ] }, void 0, !0, {
            fileName: "/home/orrox/projects/RightFit-Services/packages/ui-cleaning/src/components/PropertyCard/PropertyCard.tsx",
            lineNumber: 84,
            columnNumber: 11
          }, void 0)
        ]
      },
      void 0,
      !0,
      {
        fileName: "/home/orrox/projects/RightFit-Services/packages/ui-cleaning/src/components/PropertyCard/PropertyCard.tsx",
        lineNumber: 37,
        columnNumber: 7
      },
      void 0
    );
  }
);
Fe.displayName = "PropertyCard";
function br(a) {
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
const Pe = U.forwardRef(
  ({ job: a, onClick: l, onStart: k, onComplete: b, showActions: R = !0, className: C = "" }, x) => {
    const g = Nr(a.status), _ = a.status === "scheduled" || a.status === "pending", u = a.status === "in_progress", p = () => {
      l && l(a);
    }, E = (w) => {
      w.stopPropagation(), k && k(a);
    }, S = (w) => {
      w.stopPropagation(), b && b(a);
    };
    return /* @__PURE__ */ n.jsxDEV(
      B,
      {
        ref: x,
        className: `rf-cleaning-job-card ${C}`,
        onClick: l ? p : void 0,
        role: l ? "button" : void 0,
        tabIndex: l ? 0 : void 0,
        "aria-label": `Cleaning job at ${a.property.address}`,
        children: [
          /* @__PURE__ */ n.jsxDEV("div", { className: "rf-cleaning-job-card__header", children: [
            /* @__PURE__ */ n.jsxDEV("div", { className: "rf-cleaning-job-card__title-section", children: [
              /* @__PURE__ */ n.jsxDEV("h3", { className: "rf-cleaning-job-card__property", children: a.property.address }, void 0, !1, {
                fileName: "/home/orrox/projects/RightFit-Services/packages/ui-cleaning/src/components/CleaningJobCard/CleaningJobCard.tsx",
                lineNumber: 63,
                columnNumber: 13
              }, void 0),
              /* @__PURE__ */ n.jsxDEV(ne, { variant: g, children: br(a.status) }, void 0, !1, {
                fileName: "/home/orrox/projects/RightFit-Services/packages/ui-cleaning/src/components/CleaningJobCard/CleaningJobCard.tsx",
                lineNumber: 66,
                columnNumber: 13
              }, void 0)
            ] }, void 0, !0, {
              fileName: "/home/orrox/projects/RightFit-Services/packages/ui-cleaning/src/components/CleaningJobCard/CleaningJobCard.tsx",
              lineNumber: 62,
              columnNumber: 11
            }, void 0),
            /* @__PURE__ */ n.jsxDEV("p", { className: "rf-cleaning-job-card__date", children: new Date(a.scheduled_date).toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric"
            }) }, void 0, !1, {
              fileName: "/home/orrox/projects/RightFit-Services/packages/ui-cleaning/src/components/CleaningJobCard/CleaningJobCard.tsx",
              lineNumber: 70,
              columnNumber: 11
            }, void 0)
          ] }, void 0, !0, {
            fileName: "/home/orrox/projects/RightFit-Services/packages/ui-cleaning/src/components/CleaningJobCard/CleaningJobCard.tsx",
            lineNumber: 61,
            columnNumber: 9
          }, void 0),
          /* @__PURE__ */ n.jsxDEV("div", { className: "rf-cleaning-job-card__details", children: [
            a.cleaning_type && /* @__PURE__ */ n.jsxDEV("div", { className: "rf-cleaning-job-card__detail", children: [
              /* @__PURE__ */ n.jsxDEV("span", { className: "rf-cleaning-job-card__label", children: "Type:" }, void 0, !1, {
                fileName: "/home/orrox/projects/RightFit-Services/packages/ui-cleaning/src/components/CleaningJobCard/CleaningJobCard.tsx",
                lineNumber: 83,
                columnNumber: 15
              }, void 0),
              /* @__PURE__ */ n.jsxDEV("span", { className: "rf-cleaning-job-card__value", children: a.cleaning_type }, void 0, !1, {
                fileName: "/home/orrox/projects/RightFit-Services/packages/ui-cleaning/src/components/CleaningJobCard/CleaningJobCard.tsx",
                lineNumber: 84,
                columnNumber: 15
              }, void 0)
            ] }, void 0, !0, {
              fileName: "/home/orrox/projects/RightFit-Services/packages/ui-cleaning/src/components/CleaningJobCard/CleaningJobCard.tsx",
              lineNumber: 82,
              columnNumber: 13
            }, void 0),
            a.assigned_worker && /* @__PURE__ */ n.jsxDEV("div", { className: "rf-cleaning-job-card__detail", children: [
              /* @__PURE__ */ n.jsxDEV("span", { className: "rf-cleaning-job-card__label", children: "Worker:" }, void 0, !1, {
                fileName: "/home/orrox/projects/RightFit-Services/packages/ui-cleaning/src/components/CleaningJobCard/CleaningJobCard.tsx",
                lineNumber: 92,
                columnNumber: 15
              }, void 0),
              /* @__PURE__ */ n.jsxDEV("span", { className: "rf-cleaning-job-card__value", children: [
                a.assigned_worker.first_name,
                " ",
                a.assigned_worker.last_name
              ] }, void 0, !0, {
                fileName: "/home/orrox/projects/RightFit-Services/packages/ui-cleaning/src/components/CleaningJobCard/CleaningJobCard.tsx",
                lineNumber: 93,
                columnNumber: 15
              }, void 0)
            ] }, void 0, !0, {
              fileName: "/home/orrox/projects/RightFit-Services/packages/ui-cleaning/src/components/CleaningJobCard/CleaningJobCard.tsx",
              lineNumber: 91,
              columnNumber: 13
            }, void 0),
            a.estimated_hours && /* @__PURE__ */ n.jsxDEV("div", { className: "rf-cleaning-job-card__detail", children: [
              /* @__PURE__ */ n.jsxDEV("span", { className: "rf-cleaning-job-card__label", children: "Duration:" }, void 0, !1, {
                fileName: "/home/orrox/projects/RightFit-Services/packages/ui-cleaning/src/components/CleaningJobCard/CleaningJobCard.tsx",
                lineNumber: 101,
                columnNumber: 15
              }, void 0),
              /* @__PURE__ */ n.jsxDEV("span", { className: "rf-cleaning-job-card__value", children: [
                a.estimated_hours,
                "h"
              ] }, void 0, !0, {
                fileName: "/home/orrox/projects/RightFit-Services/packages/ui-cleaning/src/components/CleaningJobCard/CleaningJobCard.tsx",
                lineNumber: 102,
                columnNumber: 15
              }, void 0)
            ] }, void 0, !0, {
              fileName: "/home/orrox/projects/RightFit-Services/packages/ui-cleaning/src/components/CleaningJobCard/CleaningJobCard.tsx",
              lineNumber: 100,
              columnNumber: 13
            }, void 0)
          ] }, void 0, !0, {
            fileName: "/home/orrox/projects/RightFit-Services/packages/ui-cleaning/src/components/CleaningJobCard/CleaningJobCard.tsx",
            lineNumber: 80,
            columnNumber: 9
          }, void 0),
          R && (_ || u) && /* @__PURE__ */ n.jsxDEV("div", { className: "rf-cleaning-job-card__actions", children: [
            _ && k && /* @__PURE__ */ n.jsxDEV(
              ye,
              {
                variant: "primary",
                size: "sm",
                onClick: E,
                "aria-label": "Start cleaning job",
                children: "Start Job"
              },
              void 0,
              !1,
              {
                fileName: "/home/orrox/projects/RightFit-Services/packages/ui-cleaning/src/components/CleaningJobCard/CleaningJobCard.tsx",
                lineNumber: 112,
                columnNumber: 15
              },
              void 0
            ),
            u && b && /* @__PURE__ */ n.jsxDEV(
              ye,
              {
                variant: "success",
                size: "sm",
                onClick: S,
                "aria-label": "Complete cleaning job",
                children: "Complete Job"
              },
              void 0,
              !1,
              {
                fileName: "/home/orrox/projects/RightFit-Services/packages/ui-cleaning/src/components/CleaningJobCard/CleaningJobCard.tsx",
                lineNumber: 122,
                columnNumber: 15
              },
              void 0
            )
          ] }, void 0, !0, {
            fileName: "/home/orrox/projects/RightFit-Services/packages/ui-cleaning/src/components/CleaningJobCard/CleaningJobCard.tsx",
            lineNumber: 110,
            columnNumber: 11
          }, void 0)
        ]
      },
      void 0,
      !0,
      {
        fileName: "/home/orrox/projects/RightFit-Services/packages/ui-cleaning/src/components/CleaningJobCard/CleaningJobCard.tsx",
        lineNumber: 53,
        columnNumber: 7
      },
      void 0
    );
  }
);
Pe.displayName = "CleaningJobCard";
const Ve = ({
  items: a,
  onToggle: l,
  showRooms: k = !0,
  className: b = ""
}) => {
  const R = a.reduce((u, p) => (u[p.room] || (u[p.room] = []), u[p.room].push(p), u), {}), C = (u, p) => {
    l && l(u, p);
  }, x = a.filter((u) => u.completed).length, g = a.length, _ = g > 0 ? Math.round(x / g * 100) : 0;
  return /* @__PURE__ */ n.jsxDEV(B, { className: `rf-cleaning-checklist ${b}`, children: [
    /* @__PURE__ */ n.jsxDEV("div", { className: "rf-cleaning-checklist__header", children: [
      /* @__PURE__ */ n.jsxDEV("h3", { className: "rf-cleaning-checklist__title", children: "Cleaning Checklist" }, void 0, !1, {
        fileName: "/home/orrox/projects/RightFit-Services/packages/ui-cleaning/src/components/CleaningChecklist/CleaningChecklist.tsx",
        lineNumber: 56,
        columnNumber: 9
      }, void 0),
      /* @__PURE__ */ n.jsxDEV("div", { className: "rf-cleaning-checklist__progress", children: [
        /* @__PURE__ */ n.jsxDEV("span", { className: "rf-cleaning-checklist__progress-text", children: [
          x,
          " of ",
          g,
          " tasks"
        ] }, void 0, !0, {
          fileName: "/home/orrox/projects/RightFit-Services/packages/ui-cleaning/src/components/CleaningChecklist/CleaningChecklist.tsx",
          lineNumber: 58,
          columnNumber: 11
        }, void 0),
        /* @__PURE__ */ n.jsxDEV("div", { className: "rf-cleaning-checklist__progress-bar", children: /* @__PURE__ */ n.jsxDEV(
          "div",
          {
            className: "rf-cleaning-checklist__progress-fill",
            style: { width: `${_}%` },
            role: "progressbar",
            "aria-valuenow": _,
            "aria-valuemin": 0,
            "aria-valuemax": 100
          },
          void 0,
          !1,
          {
            fileName: "/home/orrox/projects/RightFit-Services/packages/ui-cleaning/src/components/CleaningChecklist/CleaningChecklist.tsx",
            lineNumber: 62,
            columnNumber: 13
          },
          void 0
        ) }, void 0, !1, {
          fileName: "/home/orrox/projects/RightFit-Services/packages/ui-cleaning/src/components/CleaningChecklist/CleaningChecklist.tsx",
          lineNumber: 61,
          columnNumber: 11
        }, void 0)
      ] }, void 0, !0, {
        fileName: "/home/orrox/projects/RightFit-Services/packages/ui-cleaning/src/components/CleaningChecklist/CleaningChecklist.tsx",
        lineNumber: 57,
        columnNumber: 9
      }, void 0)
    ] }, void 0, !0, {
      fileName: "/home/orrox/projects/RightFit-Services/packages/ui-cleaning/src/components/CleaningChecklist/CleaningChecklist.tsx",
      lineNumber: 55,
      columnNumber: 7
    }, void 0),
    /* @__PURE__ */ n.jsxDEV("div", { className: "rf-cleaning-checklist__items", children: k ? Object.entries(R).map(([u, p]) => /* @__PURE__ */ n.jsxDEV("div", { className: "rf-cleaning-checklist__room", children: [
      /* @__PURE__ */ n.jsxDEV("h4", { className: "rf-cleaning-checklist__room-title", children: u }, void 0, !1, {
        fileName: "/home/orrox/projects/RightFit-Services/packages/ui-cleaning/src/components/CleaningChecklist/CleaningChecklist.tsx",
        lineNumber: 78,
        columnNumber: 15
      }, void 0),
      /* @__PURE__ */ n.jsxDEV("div", { className: "rf-cleaning-checklist__room-items", children: p.map((E) => /* @__PURE__ */ n.jsxDEV("div", { className: "rf-cleaning-checklist__item", children: /* @__PURE__ */ n.jsxDEV(
        Se,
        {
          checked: E.completed,
          onChange: (S) => C(E.id, S.target.checked),
          label: E.task
        },
        void 0,
        !1,
        {
          fileName: "/home/orrox/projects/RightFit-Services/packages/ui-cleaning/src/components/CleaningChecklist/CleaningChecklist.tsx",
          lineNumber: 82,
          columnNumber: 21
        },
        void 0
      ) }, E.id, !1, {
        fileName: "/home/orrox/projects/RightFit-Services/packages/ui-cleaning/src/components/CleaningChecklist/CleaningChecklist.tsx",
        lineNumber: 81,
        columnNumber: 19
      }, void 0)) }, void 0, !1, {
        fileName: "/home/orrox/projects/RightFit-Services/packages/ui-cleaning/src/components/CleaningChecklist/CleaningChecklist.tsx",
        lineNumber: 79,
        columnNumber: 15
      }, void 0)
    ] }, u, !0, {
      fileName: "/home/orrox/projects/RightFit-Services/packages/ui-cleaning/src/components/CleaningChecklist/CleaningChecklist.tsx",
      lineNumber: 77,
      columnNumber: 13
    }, void 0)) : a.map((u) => /* @__PURE__ */ n.jsxDEV("div", { className: "rf-cleaning-checklist__item", children: /* @__PURE__ */ n.jsxDEV(
      Se,
      {
        checked: u.completed,
        onChange: (p) => C(u.id, p.target.checked),
        label: `${u.room}: ${u.task}`
      },
      void 0,
      !1,
      {
        fileName: "/home/orrox/projects/RightFit-Services/packages/ui-cleaning/src/components/CleaningChecklist/CleaningChecklist.tsx",
        lineNumber: 95,
        columnNumber: 15
      },
      void 0
    ) }, u.id, !1, {
      fileName: "/home/orrox/projects/RightFit-Services/packages/ui-cleaning/src/components/CleaningChecklist/CleaningChecklist.tsx",
      lineNumber: 94,
      columnNumber: 13
    }, void 0)) }, void 0, !1, {
      fileName: "/home/orrox/projects/RightFit-Services/packages/ui-cleaning/src/components/CleaningChecklist/CleaningChecklist.tsx",
      lineNumber: 74,
      columnNumber: 7
    }, void 0)
  ] }, void 0, !0, {
    fileName: "/home/orrox/projects/RightFit-Services/packages/ui-cleaning/src/components/CleaningChecklist/CleaningChecklist.tsx",
    lineNumber: 54,
    columnNumber: 5
  }, void 0);
};
Ve.displayName = "CleaningChecklist";
const we = U.forwardRef(
  ({ entry: a, onClick: l, showWorker: k = !0, className: b = "" }, R) => {
    const C = !a.clock_out, x = (u) => new Date(u).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: !0
    }), g = (u) => new Date(u).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    }), _ = () => {
      l && l(a);
    };
    return /* @__PURE__ */ n.jsxDEV(
      B,
      {
        ref: R,
        className: `rf-timesheet-card ${b}`,
        onClick: l ? _ : void 0,
        role: l ? "button" : void 0,
        tabIndex: l ? 0 : void 0,
        children: [
          /* @__PURE__ */ n.jsxDEV("div", { className: "rf-timesheet-card__header", children: [
            /* @__PURE__ */ n.jsxDEV("div", { className: "rf-timesheet-card__title-section", children: [
              /* @__PURE__ */ n.jsxDEV("h3", { className: "rf-timesheet-card__property", children: a.job.property_address }, void 0, !1, {
                fileName: "/home/orrox/projects/RightFit-Services/packages/ui-cleaning/src/components/TimesheetCard/TimesheetCard.tsx",
                lineNumber: 70,
                columnNumber: 13
              }, void 0),
              /* @__PURE__ */ n.jsxDEV(ne, { variant: C ? "primary" : "success", children: C ? "Active" : "Completed" }, void 0, !1, {
                fileName: "/home/orrox/projects/RightFit-Services/packages/ui-cleaning/src/components/TimesheetCard/TimesheetCard.tsx",
                lineNumber: 73,
                columnNumber: 13
              }, void 0)
            ] }, void 0, !0, {
              fileName: "/home/orrox/projects/RightFit-Services/packages/ui-cleaning/src/components/TimesheetCard/TimesheetCard.tsx",
              lineNumber: 69,
              columnNumber: 11
            }, void 0),
            k && /* @__PURE__ */ n.jsxDEV("p", { className: "rf-timesheet-card__worker", children: [
              a.worker.first_name,
              " ",
              a.worker.last_name
            ] }, void 0, !0, {
              fileName: "/home/orrox/projects/RightFit-Services/packages/ui-cleaning/src/components/TimesheetCard/TimesheetCard.tsx",
              lineNumber: 78,
              columnNumber: 13
            }, void 0)
          ] }, void 0, !0, {
            fileName: "/home/orrox/projects/RightFit-Services/packages/ui-cleaning/src/components/TimesheetCard/TimesheetCard.tsx",
            lineNumber: 68,
            columnNumber: 9
          }, void 0),
          /* @__PURE__ */ n.jsxDEV("div", { className: "rf-timesheet-card__times", children: [
            /* @__PURE__ */ n.jsxDEV("div", { className: "rf-timesheet-card__time", children: [
              /* @__PURE__ */ n.jsxDEV("span", { className: "rf-timesheet-card__time-label", children: "Clock In" }, void 0, !1, {
                fileName: "/home/orrox/projects/RightFit-Services/packages/ui-cleaning/src/components/TimesheetCard/TimesheetCard.tsx",
                lineNumber: 86,
                columnNumber: 13
              }, void 0),
              /* @__PURE__ */ n.jsxDEV("span", { className: "rf-timesheet-card__time-value", children: x(a.clock_in) }, void 0, !1, {
                fileName: "/home/orrox/projects/RightFit-Services/packages/ui-cleaning/src/components/TimesheetCard/TimesheetCard.tsx",
                lineNumber: 87,
                columnNumber: 13
              }, void 0),
              /* @__PURE__ */ n.jsxDEV("span", { className: "rf-timesheet-card__time-date", children: g(a.clock_in) }, void 0, !1, {
                fileName: "/home/orrox/projects/RightFit-Services/packages/ui-cleaning/src/components/TimesheetCard/TimesheetCard.tsx",
                lineNumber: 90,
                columnNumber: 13
              }, void 0)
            ] }, void 0, !0, {
              fileName: "/home/orrox/projects/RightFit-Services/packages/ui-cleaning/src/components/TimesheetCard/TimesheetCard.tsx",
              lineNumber: 85,
              columnNumber: 11
            }, void 0),
            a.clock_out && /* @__PURE__ */ n.jsxDEV("div", { className: "rf-timesheet-card__time", children: [
              /* @__PURE__ */ n.jsxDEV("span", { className: "rf-timesheet-card__time-label", children: "Clock Out" }, void 0, !1, {
                fileName: "/home/orrox/projects/RightFit-Services/packages/ui-cleaning/src/components/TimesheetCard/TimesheetCard.tsx",
                lineNumber: 97,
                columnNumber: 15
              }, void 0),
              /* @__PURE__ */ n.jsxDEV("span", { className: "rf-timesheet-card__time-value", children: x(a.clock_out) }, void 0, !1, {
                fileName: "/home/orrox/projects/RightFit-Services/packages/ui-cleaning/src/components/TimesheetCard/TimesheetCard.tsx",
                lineNumber: 98,
                columnNumber: 15
              }, void 0),
              /* @__PURE__ */ n.jsxDEV("span", { className: "rf-timesheet-card__time-date", children: g(a.clock_out) }, void 0, !1, {
                fileName: "/home/orrox/projects/RightFit-Services/packages/ui-cleaning/src/components/TimesheetCard/TimesheetCard.tsx",
                lineNumber: 101,
                columnNumber: 15
              }, void 0)
            ] }, void 0, !0, {
              fileName: "/home/orrox/projects/RightFit-Services/packages/ui-cleaning/src/components/TimesheetCard/TimesheetCard.tsx",
              lineNumber: 96,
              columnNumber: 13
            }, void 0),
            a.total_hours !== void 0 && /* @__PURE__ */ n.jsxDEV("div", { className: "rf-timesheet-card__total", children: [
              /* @__PURE__ */ n.jsxDEV("span", { className: "rf-timesheet-card__total-label", children: "Total Hours" }, void 0, !1, {
                fileName: "/home/orrox/projects/RightFit-Services/packages/ui-cleaning/src/components/TimesheetCard/TimesheetCard.tsx",
                lineNumber: 109,
                columnNumber: 15
              }, void 0),
              /* @__PURE__ */ n.jsxDEV("span", { className: "rf-timesheet-card__total-value", children: [
                a.total_hours.toFixed(2),
                "h"
              ] }, void 0, !0, {
                fileName: "/home/orrox/projects/RightFit-Services/packages/ui-cleaning/src/components/TimesheetCard/TimesheetCard.tsx",
                lineNumber: 110,
                columnNumber: 15
              }, void 0)
            ] }, void 0, !0, {
              fileName: "/home/orrox/projects/RightFit-Services/packages/ui-cleaning/src/components/TimesheetCard/TimesheetCard.tsx",
              lineNumber: 108,
              columnNumber: 13
            }, void 0)
          ] }, void 0, !0, {
            fileName: "/home/orrox/projects/RightFit-Services/packages/ui-cleaning/src/components/TimesheetCard/TimesheetCard.tsx",
            lineNumber: 84,
            columnNumber: 9
          }, void 0),
          a.notes && /* @__PURE__ */ n.jsxDEV("div", { className: "rf-timesheet-card__notes", children: [
            /* @__PURE__ */ n.jsxDEV("span", { className: "rf-timesheet-card__notes-label", children: "Notes:" }, void 0, !1, {
              fileName: "/home/orrox/projects/RightFit-Services/packages/ui-cleaning/src/components/TimesheetCard/TimesheetCard.tsx",
              lineNumber: 119,
              columnNumber: 13
            }, void 0),
            /* @__PURE__ */ n.jsxDEV("p", { className: "rf-timesheet-card__notes-text", children: a.notes }, void 0, !1, {
              fileName: "/home/orrox/projects/RightFit-Services/packages/ui-cleaning/src/components/TimesheetCard/TimesheetCard.tsx",
              lineNumber: 120,
              columnNumber: 13
            }, void 0)
          ] }, void 0, !0, {
            fileName: "/home/orrox/projects/RightFit-Services/packages/ui-cleaning/src/components/TimesheetCard/TimesheetCard.tsx",
            lineNumber: 118,
            columnNumber: 11
          }, void 0)
        ]
      },
      void 0,
      !0,
      {
        fileName: "/home/orrox/projects/RightFit-Services/packages/ui-cleaning/src/components/TimesheetCard/TimesheetCard.tsx",
        lineNumber: 61,
        columnNumber: 7
      },
      void 0
    );
  }
);
we.displayName = "TimesheetCard";
const _r = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  CleaningChecklist: Ve,
  CleaningJobCard: Pe,
  PropertyCard: Fe,
  TimesheetCard: we
}, Symbol.toStringTag, { value: "Module" }));
export {
  Ve as CleaningChecklist,
  Pe as CleaningJobCard,
  _r as Components,
  Fe as PropertyCard,
  we as TimesheetCard,
  br as formatJobStatus,
  Nr as getStatusVariant
};
//# sourceMappingURL=index.js.map
