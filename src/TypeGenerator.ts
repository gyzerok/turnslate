import {
  VariableReference,
  Visitor,
  Message,
  Comment,
  parse,
} from '@fluent/syntax'

export class TypeGenerator extends Visitor {
  nodes: Array<{ name: string; comment?: string; ids: Set<string> }> = []

  static fromFTL(ftl: string): string {
    const vars = new TypeGenerator()
    vars.visit(parse(ftl, { withSpans: true }))

    const union = vars.nodes
      .map(
        (node) =>
          `${node.comment ? `  /* ${node.comment} */\n` : ''}  | ['${
            node.name
          }', Record<${Array.from(node.ids)
            .map((id) => `'${id}'`)
            .join(' | ')}, string | number>]`,
      )
      .join('\n')

    return `export type LocalizedMessage =\n${union}`
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
