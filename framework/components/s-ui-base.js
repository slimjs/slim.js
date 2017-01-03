class SlimUIBase extends Slim {

    onBeforeRender() {
        ['click','mouseover','mouseout','mousemove','mouseenter','mousedown','mouseup','dblclick','contextmenu','wheel',
            'mouseleave','select','pointerlockchange','pointerlockerror','focus','blur',
            'animationstart','animationend','animationiteration','reset','submit','resize','scroll',
            'keydown','keypress','keyup', 'change'].forEach( eventType => {
            this.myControl && this.myControl.addEventListener(eventType, e => { this.handleEvent(e) })
        })
    }

    attributeChangedCallback(attr, val) {
        if (this.hasOwnProperty(attr)) {
            this[Slim.__dashToCamel(attr)] = val
        }
    }

    handleEvent(e) {
        this.callAttribute(e.type, e)
    }


}

class SlimModel extends Slim {

    get view() {
        return this._boundParent
    }
}