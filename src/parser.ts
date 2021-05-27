import {
  SelectExpression,
  VariableReference,
  PatternElement,
  Placeable,
} from '@fluent/syntax'

export const parseElements = (elements: PatternElement[]): string[] => {
  let identifiers: string[] = []

  for (const element of elements) {
    switch (element.type) {
      case 'Placeable':
        identifiers = identifiers.concat(parsePlaceable(element as Placeable))
        break
      default:
        break
    }
  }

  return identifiers
}

export const parsePlaceable = (element: Placeable): string | string[] => {
  switch (element.expression.type) {
    case 'VariableReference': {
      const expression = element.expression as VariableReference
      return expression.id.name
    }
    case 'MessageReference': {
      throw new Error('MessageReference is not supported by the system')
    }
    case 'SelectExpression': {
      const expression = element.expression as SelectExpression
      const selectorVariableReference = expression.selector as VariableReference

      let identifiers: string[] = []

      for (const variant of expression.variants) {
        identifiers = identifiers.concat(parseElements(variant.value.elements))
      }

      return [selectorVariableReference.id.name, ...identifiers]
    }
    default:
      return []
  }
}
