export namespace Directives {
  export type ProcessInfo = {
    scopeNode: any;
    targetNode: Element;
    attribute: Attr;
    attributeName: string;
    attributeValue: string | null;
    expression: string;
    context: any;
    props: string[];
  }

  export interface ProcessResult {
    update: (value: any, forceUpdate?: boolean) => any;
    removeAttribute?: boolean;
    removeNode?: boolean;
  }

  export interface Directive {
    attribute: (attr: Attr, nodeName: string, nodeValue: string | null) => any;
    process: (info: ProcessInfo) => ProcessResult;
    noExecution?: boolean;
  }

  export interface IRegistry {
    add(plugin: Directive): void;
    getDirectives(): Directive[];
  }

  export class DirectiveRegistry implements IRegistry {
    private _directives = new Set<Directive>();
    add(directive) {
      this._directives.add(directive);
    }
    getDirectives() {
      return Array.from(this._directives);
    }
  }

  /**
   * @singleton
   */
  export const Registry = new DirectiveRegistry();
}
