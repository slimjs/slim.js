export declare class Slim extends HTMLElement {
    static polyfill(url:string):void;
    static tag(tag:string, template:string, clazz:any):void;
    static getTag(clazz:Slim):string;
    static plugin(phase:string, plugin:Function):void;
    static registerCustomAttribute(attr:string, fn:Function):void;

    createdCallback():void;
    connectedCallback():void;
    disconnectedCallback():void;

    onBeforeCreated():void;
    onCreated():void;
    onAdded():void;
    onRemoved():void;
    onBeforeRender():void;
    onAfterRender():void;
    onBeforeUpdate():void
    onAfterUpdate():void;

    update():void;

    render(template?:string):void;

    find(selector:string):HTMLElement;
    findAll(selector:string):HTMLElement[];
    watch(prop:string, executor:Function):void;
    callAttribute(attributeName:string, value:any);
    useShadow:boolean;
    isInteractive:boolean;
    template:string;
}
