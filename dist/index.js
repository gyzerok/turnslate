"use strict";
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateLocalization = void 0;
var bundle_1 = require("@fluent/bundle");
var langneg_1 = require("@fluent/langneg");
var sequence_1 = require("@fluent/sequence");
var cached_iterable_1 = require("cached-iterable");
var ReactLocalization = /** @class */ (function () {
    function ReactLocalization(bundles) {
        this.bundles = cached_iterable_1.CachedSyncIterable.from(bundles);
    }
    ReactLocalization.prototype.getBundle = function (id) {
        return sequence_1.mapBundleSync(this.bundles, id);
    };
    ReactLocalization.prototype.getString = function (id, args, fallback) {
        var bundle = this.getBundle(id);
        if (bundle) {
            var msg = bundle.getMessage(id);
            if (msg && msg.value) {
                var errors = [];
                var value = bundle.formatPattern(msg.value, args, errors);
                for (var _i = 0, errors_1 = errors; _i < errors_1.length; _i++) {
                    var error = errors_1[_i];
                    this.reportError(error);
                }
                return value;
            }
        }
        return fallback || id;
    };
    ReactLocalization.prototype.reportError = function (error) {
        console.warn('[@turnslate/cli] ' + error.name + ': ' + error.message);
    };
    return ReactLocalization;
}());
var generateLocalization = function (localizationConfig) {
    return new ReactLocalization(generateBundles(navigator.languages.slice(), localizationConfig));
};
exports.generateLocalization = generateLocalization;
function generateBundles(userLocales, localizationConfig) {
    var locales, currentLocales, _i, currentLocales_1, locale, resourceConfig, bundle, resource;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                locales = Object.keys(localizationConfig);
                currentLocales = langneg_1.negotiateLanguages(userLocales, locales, {
                    defaultLocale: locales[0],
                });
                _i = 0, currentLocales_1 = currentLocales;
                _a.label = 1;
            case 1:
                if (!(_i < currentLocales_1.length)) return [3 /*break*/, 4];
                locale = currentLocales_1[_i];
                resourceConfig = localizationConfig[locale];
                if (!resourceConfig)
                    return [3 /*break*/, 3];
                bundle = new bundle_1.FluentBundle(locale);
                resource = new bundle_1.FluentResource(resourceConfig);
                bundle.addResource(resource);
                return [4 /*yield*/, bundle];
            case 2:
                _a.sent();
                _a.label = 3;
            case 3:
                _i++;
                return [3 /*break*/, 1];
            case 4: return [2 /*return*/];
        }
    });
}
