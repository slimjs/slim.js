export function tag(selector:string) {
    return function(target:any):void {
        window['Slim'].tag(selector, target);
    };
}

export function template(tpl:string) {
    return function(target:any):void {
        target.prototype.__defineGetter__('template', () => {
            return tpl;
        });
    }
}

export function useShadow(value:boolean) {
    return function(target:any):void {
        target.prototype.__defineGetter__('useShadow', () => {
            return value;
        });
    }
}