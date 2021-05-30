"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateLocalization = void 0;
const bundle_1 = require("@fluent/bundle");
const langneg_1 = require("@fluent/langneg");
const sequence_1 = require("@fluent/sequence");
const cached_iterable_1 = require("cached-iterable");
// class Lang {
//   private bundle: FluentBundle
//   constructor(locale: string, ftl: string) {
//     this.bundle = new FluentBundle(locale)
//     const resource = new FluentResource('ftl')
//     this.bundle.addResource(resource)
//   }
//   use(id)
//   switchLocale(locale: string): void {}
// }
class TurnslateLocalization {
    constructor(bundles) {
        this.bundles = cached_iterable_1.CachedSyncIterable.from(bundles);
    }
    getBundle(id) {
        return sequence_1.mapBundleSync(this.bundles, id);
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
