"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateLocalization = void 0;
const bundle_1 = require("@fluent/bundle");
const langneg_1 = require("@fluent/langneg");
const sequence_1 = require("@fluent/sequence");
const cached_iterable_1 = require("cached-iterable");
class TurnslateLocalization {
    constructor(bundles) {
        this.bundles = cached_iterable_1.CachedSyncIterable.from(bundles);
    }
    getBundle(id) {
        return sequence_1.mapBundleSync(this.bundles, id);
    }
    getString(id, args, fallback) {
        const bundle = this.getBundle(id);
        if (bundle) {
            const msg = bundle.getMessage(id);
            if (msg && msg.value) {
                let errors = [];
                let value = bundle.formatPattern(msg.value, args, errors);
                for (let error of errors) {
                    this.reportError(error);
                }
                return value;
            }
        }
        return fallback || id;
    }
    reportError(error) {
        console.warn('[@turnslate/cli] ' + error.name + ': ' + error.message);
    }
}
const generateLocalization = (userLocales, localizationConfig) => new TurnslateLocalization(generateBundles(userLocales, localizationConfig));
exports.generateLocalization = generateLocalization;
function* generateBundles(userLocales, localizationConfig) {
    const locales = Object.keys(localizationConfig);
    const currentLocales = langneg_1.negotiateLanguages(userLocales, locales, {
        defaultLocale: locales[0],
    });
    for (const locale of currentLocales) {
        const resourceConfig = localizationConfig[locale];
        if (!resourceConfig)
            continue;
        const bundle = new bundle_1.FluentBundle(locale);
        const resource = new bundle_1.FluentResource(resourceConfig);
        bundle.addResource(resource);
        yield bundle;
    }
}
