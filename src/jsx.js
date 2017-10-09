const emptyTags = [
    'area',
	'base',
	'br',
	'col',
	'command',
	'embed',
	'hr',
	'img',
	'input',
	'keygen',
	'link',
	'meta',
	'param',
	'source',
	'track',
	'wbr'
]

// escape an attribute
let esc = str => String(str).replace(/[&<>"']/g, s=>`&${map[s]};`);
let map = {'&':'amp','<':'lt','>':'gt','"':'quot',"'":'apos'};

let sanitized = {};

/** Hyperscript reviver that constructs a sanitized HTML string. */
export default function jsx({elementName, attributes, children}) {

    let s = `<${elementName}`;
    
	if (attributes) for (let attrName in attributes) {
		if (attributes[attrName]!==false && attributes[attrName]!=null) {
            if (attrName.charAt(0) === '$') {
                const value = attributes[attrName]
                const targetProperty = attrName.slice(1)
                const tempAttr = ('b_' + Math.random()).split('.').join('_')
                s += ` ${tempAttr}="true"`
                const injection = () => {
                    const targetElement = document.querySelector(`[${tempAttr}="true"]`)
                    targetElement[targetProperty] = value
					targetElement.removeAttribute(tempAttr)
					// targetElement.render()
				}
                window.requestAnimationFrame(injection)
            } else {
                s += ` ${esc(attrName)}="${esc(attributes[attrName])}"`;
            }
		}
	}

    if (emptyTags.indexOf(elementName) === -1) {
        s += '>';

        const stack = children ? children.concat() : []

		while (stack.length) {
			let child = stack.shift();
			if (child) {
				if (child instanceof Array) {
                    stack.push(...child)
				}
				else {
					s += sanitized[child]===true ? child : esc(child);
				}
			}
		}

		s += `</${elementName}>`;
	} else {
		s += ' />';
	}

    sanitized[s] = true;
	return s;
}