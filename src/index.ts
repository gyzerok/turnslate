import { FluentBundle, FluentResource } from '@fluent/bundle'
import { negotiateLanguages } from '@fluent/langneg'
import { mapBundleSync } from '@fluent/sequence'
import { CachedSyncIterable } from 'cached-iterable'

class TurnslateLocalization {
  public bundles: Iterable<FluentBundle>

  constructor(bundles: Iterable<FluentBundle>) {
    this.bundles = CachedSyncIterable.from(bundles)
  }

  getBundle(id: string): FluentBundle | null {
    return mapBundleSync(this.bundles, id)
  }
}

export const generateLocalization = (
  userLocales: string[],
  localizationConfig: Record<string, string>,
) => new TurnslateLocalization(generateBundles(userLocales, localizationConfig))

function* generateBundles(
  userLocales: string[],
  localizationConfig: Record<string, string>,
) {
  const locales = Object.keys(localizationConfig)

  const currentLocales = negotiateLanguages(userLocales, locales, {
    defaultLocale: locales[0],
  })

  for (const locale of currentLocales) {
    const resourceConfig = localizationConfig[locale]
    if (!resourceConfig) continue

    const bundle = new FluentBundle(locale)
    const resource = new FluentResource(resourceConfig)
    bundle.addResource(resource)
    yield bundle
  }
}
