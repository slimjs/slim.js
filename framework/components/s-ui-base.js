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
            this[attr] = val
        }
    }

    executeEvent(attr, e) {
        let fnName = this.getAttribute(attr)
        if (fnName && typeof this._boundParent[ fnName ] === 'function') {
            this._boundParent[ fnName ](e)
        }
    }

    handleEvent(e) {
        this.executeEvent(e.type, e)
    }


}