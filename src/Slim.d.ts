declare type SlimInternals = {
  hasCustomTemplate: string | undefined;
  boundParent: Element;
  repeater: object;
  bindings: object;
  reversed: object;
  inbounds: object;
  eventHandlers: object;
  internetExploderClone: any;
  rootElement: Element;
  createCallbackInvoked: boolean;
  sourceText: string;
  excluded: boolean;
  autoBoundAttributes: Array<string>;
}

export declare class Slim extends HTMLElement {

  public static dashToCamel (dash: string):string;
  public static camelToDash (camel: string):string;
  public static rxProp: RegExp;
  public static rxMethod: RegExp;
  public static lookup (target:Object|Element, expression: string, maybeRepeater:Element|Object):any;
  public static _$ (target: Element): SlimInternals;
  public static qSelectAll(target: Element, selector: string):Array<Element>;
  public static tag (
    tagName: string,
    tplOrClass: string | Slim,
    clazz?: Slim): void;
  static tagOf(clazz:HTMLElement | Slim): string;
  public static plugin (phase: string, plugin: (target: Slim) => void): void;
  public static customDirective(
    testFn: (attr:Attr) => any,
    directiveFn: (source:Slim, child:Element, attribute: Attr, match: any) => void,
    isBlocking: boolean
  ): void;
  public static unbind (source: Element, target: Element): void;
  public static root (target:Element): Element | ShadowRoot;
  public static bindOwn (source:Element|Object, expression: string, executor: Function): Function;
  public static bind (source:Element|Object, target: Element|Object, expression: string, executor: Function): Function;
  public static update (target: Element|Object, ...props: string[]): void;
  public static commit (target: Element|Object, prop: string): void;
  public static debug: Function;

  private static checkCreationBlocking(element:HTMLElement):boolean;
  private static executePlugins (phase: string, target: Slim):void;
  private static wrapGetterSetter (element: Element, expression: string): string;
  private static plugins: {
    create: Array<(target: Slim) => void>,
    added: Array<(target: Slim) => void>,
    beforeRender: Array<(target: Slim) => void>,
    afterRender: Array<(target: Slim) => void>,
    removed: Array<(target: Slim) => void>,
  };
  private static asap(f: Function): any;

  public commit (...args: string[]): void;
  public update (...args: string[]): void;
  public render (customTemplate: string): void;
  public find (selector: string): Element;
  public findAll (selector: string): Array<Element>;

  protected createdCallback (): void
  protected connectedCallback(): void
  protected disconnectedCallback(): void
  protected attributeChangedCallback(): void
  protected _executeBindings(prop?: string): void;
  protected _bindChildren(children: Array<Element>| NodeListOf<Element>): void;
  protected _resetBindings(): void;
  protected _render (customTemplate?: string): void;
  protected _initialize (): void;
  protected onRender(): void;
  protected onBeforeCreated(): void;
  protected onCreated(): void;
  protected onAdded(): void;
  protected onRemoved(): void;
  protected callAttribute (attr: string, data: any): any;


}

