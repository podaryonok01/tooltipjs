export function getScroll() {
    return {
      x: (window.scrollX !== undefined) ?
          window.scrollX 
          : (document.documentElement || document.body.parentNode || document.body).scrollLeft,
      y: (window.scrollY !== undefined) ?
          window.scrollY 
          : (document.documentElement || document.body.parentNode || document.body).scrollTop
    };
  }

export function isNotEmptyAttr(el: HTMLElement, attr: string){
  return el.hasAttribute(attr) && el.getAttribute(attr) !== "";
}