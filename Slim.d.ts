export declare interface SlimInternals {
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

    static dashToCamel(dash: string):string;
    static camelToDash(camel: string):string;
    static get rxInject(): RegExp;
    static get rxProp(): RegExp;
    static get rxMethod(): RegExp;
    static lookup(target:object|Element, expression: string, maybeRepeater:Element):any;
    
    static _$ (target: Element): SlimInternals;
    
    static polyFill (url: string): void;
    
    static tag (
        tagName: string,
        tplOrClass: string | Slim,
        clazz?: Slim);
    
    static tagOf(clazz:HTMLElement | Slim): string;
    
    static classOf(tag:string):HTMLElement | Slim;
    
    static createUniqueIndex (): string;
    
    static plugin (
        phase: string,
        plugin: (target: Slim) => void
    ): void;
    
    static checkCreationBlocking(
        element:HTMLElement
    ):boolean;
    
    static customDirective(
        textFn: (attr:Attr) => any,
        directiveFn: (source:Slim, child:Element, attribute: Attr, match: any) => void,
        isBlocking: boolean
    ): void;

    static executePlugins (phase: string, target: Slim):void;

    static qSelectAll(target: Element, selector: string):Array<Element>;

    static unbind (source: Element, target: Element): void;

    static root (target:Element): Element | ShadowRoot;

    static selectRecursive (target: Element, force: boolean): Array<Element>;

    static removeChild (target: Element): void;

    static moveChildren (source: Element, target: Element);

    static wrapGetterSetter (element: Element, expression: string): string;

    static bindOwn (source:Element, expression: string, executor: function): function;

    static bind (source:Element, target: Element, expression: string, executor: function): function;

    static update (target: Element, ...props: string): void;

    static commit (target: Element, prop: string);

    static readonly uniqueIndex: number;

    static readonly tagToClassDict: Map<string, HTMLElement>;

    static readonly tagToTemplateDict: Map<string, string>;

    static readonly plugins: {
        create: Array<(target: Slim) => void>,
        added: Array<(target: Slim) => void>,
        beforeRender: Array<(target: Slim) => void>,
        afterRender: Array<(target: Slim) => void>,
        removed: Array<(target: Slim) => void>,
    }

    static debug: function;

    static asap(f: function): any;

    protected createdCallback () {}

    protected connectedCallback() {}

    protected disconnectedCallback() {}

    protected attributeChangedCallback() {}

    protected get _isInContext(): boolean;

    protected _executeBindings(prop?: string): void;

    protected _bindChildren(children: Array<Element>|NodeList<Element>): void;

    protected _resetBindings(): void;

    protected _render (customTemplate?: string): void;

    protected _initialize (): void;

    public commit (...args: string): void;

    public update (...args: string): void;

    public render (customTempalte: string): void;

    protected onRender() {};
    protected onBeforeCreated() {};
    protected onCreated() {};
    protected onAdded() {};
    protected onRemoved() {};

    public find (selector: string): Element;

    public findAll (selector: string): Array<Element>|NodeList<Element>;

    protected callAttribute (attr: string, data: any): any;
    
    get useShadow (): boolean;

    get template (): string;
};

