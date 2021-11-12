import { directive, Directive } from "lit/directive.js";

class AnimateReset extends Directive {
    attributeNames = '';
    /** @override */ update(/** @type {import("lit/directive.js").ChildPart} */ part, /** @type {import("lit/directive.js").DirectiveParameters<this>} */ [child]) {
        let c = [...part.parentNode.childNodes]
        for (const element of c.slice(c.indexOf(part.startNode)+1, c.lastIndexOf(part.endNode))) {
            console.log(element)
            element.remove()
            /*for (const animatedElements of element.getElementsByClassName("placeholder")) {
                console.log(animatedElements)
                console.log(animatedElements.getAnimations())
            }*/
        }
        return this.render(child);
    }
  
    render(/** @type {import("lit").TemplateResult} */ child) {
      return child;
    }
}
  
export const animateReset = directive(AnimateReset);
  