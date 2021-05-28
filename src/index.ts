import { FluentBundle, FluentResource, FluentVariable } from '@fluent/bundle'
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

  getString(
    id: string,
    args?: Record<string, FluentVariable> | null,
    fallback?: string,
  ): string {
    const bundle = this.getBundle(id)
    if (bundle) {
      const msg = bundle.getMessage(id)
      if (msg && msg.value) {
        let errors: Array<Error> = []
        let value = bundle.formatPattern(msg.value, args, errors)
        for (let error of errors) {
          this.reportError(error)
        }
        return value
      }
    }

    return fallback || id
  }

  reportError(error: Error): void {
    console.warn('[@turnslate/cli] ' + error.name + ': ' + error.message)
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
