import {
  VariableReference,
  Visitor,
  Message,
  Comment,
  parse,
} from '@fluent/syntax'

export class TypeGenerator extends Visitor {
  nodes: Array<{ name: string; comment?: string; ids: Set<string> }> = []

  static fromLangs(langs: Record<string, string>, mainLocale: string): string {
    const mainFtl = langs[mainLocale]
    if (!mainFtl)
      throw new Error(`Translation is not found for locale ${mainLocale}`)

    const restLocalesVisitors = Object.keys(langs)
      .filter((locale) => locale !== mainLocale)
      .map((locale) => {
        const visitor = new TypeGenerator()
        visitor.visit(parse(langs[locale]!, { withSpans: true }))
        return visitor
      })

    const mainLocaleVisitor = new TypeGenerator()
    mainLocaleVisitor.visit(parse(mainFtl, { withSpans: true }))

    const union = mainLocaleVisitor.nodes
      .map((node) => {
        const key = `${node.comment ? `  /* ${node.comment} */\n` : ''}  '${
          node.name
        }'`
        const idsFromOtherLocales = restLocalesVisitors.reduce(
          (set, { nodes }) => {
            const relativeNode = nodes.find((n) => n.name === node.name)
            if (!relativeNode) return set
            return new Set([...set, ...relativeNode.ids])
          },
          new Set<string>(),
        )
        const ids = Array.from(new Set([...node.ids, ...idsFromOtherLocales]))
        const vars =
          ids.length === 0
            ? `[]`
            : `[Vars<${ids.map((id) => `'${id}'`).join(' | ')}>]`

        return `${key}: ${vars};`
      })
      .join('\n')

    return [
      `export type LocalizedMessage = {\n${union}\n}`,
      'type Vars<T extends string> = Record<T, string | number>',
    ].join('\n\n')
  }

  visitMessage(node: Message): void {
    this.nodes.push({ name: node.id.name, ids: new Set() })
    this.genericVisit(node)
  }

  visitComment(node: Comment): void {
    const last = this.nodes[this.nodes.length - 1]

    if (!last) {
      return
    }

    last.comment = node.content
  }

  visitVariableReference(node: VariableReference): void {
    this.nodes[this.nodes.length - 1]?.ids.add(node.id.name)
  }
}
