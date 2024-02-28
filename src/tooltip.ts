import { TOOLTIP_CLASS } from "./constants";
import { getScroll, isNotEmptyAttr } from "./functions";
import { IDiseredPosition, IPossibleSides, ISettings } from "./types";
import "./tooltip.scss";

class Tooltip {
    private settings: ISettings;
    private tooltip!: HTMLDivElement;
    private targetElement: HTMLElement|undefined;
    constructor(options:ISettings = {}) {
        this.settings = {
          rootElement: document.body,
          className: TOOLTIP_CLASS,
          position: "top-center",
          margin: 10
        };
        Object.keys(options).forEach((option: keyof ISettings) => {
          if(options[option]){
            // @ts-ignore
            this.settings[option] = options[option];
          }
        });
        this.createTooltipElement();

        const observer = new MutationObserver(this.checkIsTargetElement);
        observer.observe(this.settings.rootElement!, {
          subtree: true,
          childList: true
        });
    }

    private createTooltipElement() {
        const tooltipEl = document.querySelector(".tooltip");
        if(tooltipEl && tooltipEl.tagName === "DIV"){
          this.tooltip = tooltipEl as HTMLDivElement;
          this.tooltip.classList.add(TOOLTIP_CLASS, this.settings.className!);
          this.subscribe(true);
          return;
        }
        const tooltip = document.createElement("div");
        tooltip.classList.add(TOOLTIP_CLASS, this.settings.className!);
        this.tooltip = tooltip;
        document.body.appendChild(this.tooltip);
        this.subscribe(true);
    }

    public removeTooltip = () => {
        this.subscribe(false);
        this.tooltip.remove();
    }

    private subscribe(mtd: boolean){
        if(mtd){
            this.settings.rootElement?.addEventListener("mousemove", this.onMouseMove);
        }else{
            this.settings.rootElement?.removeEventListener("mousemove", this.onMouseMove);
            this.targetElement?.removeEventListener("mouseenter", this.onMouseEnterTargetElement)
            this.targetElement?.removeEventListener("mouseleave", this.onHideTooltip);
        }
    }

    private checkIsTargetElement = () => {
      if(!this.targetElement || !document.body.contains(this.targetElement)){
        this.onHideTooltip();
      }
    }

    private onMouseMove = (event: MouseEvent | {target: HTMLElement}) => {
        const el = event.target as HTMLElement;
        if(isNotEmptyAttr(el,"title") || isNotEmptyAttr(el,"data-tooltip")){
            // отписка для предыдущего targetElement
            this.targetElement?.removeEventListener("mouseenter", this.onMouseEnterTargetElement)
            this.targetElement?.removeEventListener("mouseleave", this.onHideTooltip);

            this.targetElement = el;
            // подписка для текущего targetElement
            this.targetElement.addEventListener("mouseenter", this.onMouseEnterTargetElement)
            this.targetElement.addEventListener("mouseleave", this.onHideTooltip);
            this.onMouseEnterTargetElement();
        }else if(el.parentElement){
          this.onMouseMove({target: el.parentElement})
        }
    }

    private onMouseEnterTargetElement = () => {
      this.addTooltipData();
      this.addTooltip();
    }

    private addTooltipData(){
        if(!this.targetElement){
            return;
        }
        if (isNotEmptyAttr(this.targetElement, "title") && !isNotEmptyAttr(this.targetElement, "data-tooltip")) {
            this.targetElement.dataset.tooltip = this.targetElement.getAttribute("title") || undefined;
            this.targetElement.setAttribute("title", "");
        }
      
        if (!isNotEmptyAttr(this.targetElement, 'data-position')) {
            this.targetElement.dataset.position = this.settings.position;
        }
        
    }

    private addTooltip(){
        if(!this.targetElement){
            return;
        }
        this.tooltip.textContent = this.targetElement.dataset.tooltip || null;
        this.setTooltipPosition();
        this.showTooltip();
    }

    private onHideTooltip = () => {
        const visibilityClass = `${TOOLTIP_CLASS}--visible`;
        
        if (this.tooltip.classList.contains(visibilityClass)) {
            this.tooltip.classList.remove(visibilityClass);
            this.tooltip.removeAttribute("style");
            this.resetClass();
        }
        this.targetElement?.removeEventListener("mouseleave", this.onHideTooltip);
        this.targetElement?.removeEventListener("mouseenter", this.onMouseEnterTargetElement)
    }

    private showTooltip() {
        
        const visibilityClass = `${TOOLTIP_CLASS}--visible`;
    
        if (!this.tooltip.classList.contains(visibilityClass)) {
            this.tooltip.classList.add(visibilityClass);
        }
    }

    private setTooltipPosition() {
        if(!this.targetElement){
            return;
        }
        const elementRect = this.targetElement.getBoundingClientRect();
        const desiredPosition = this.getDesiredPosition(this.targetElement);
        const possibleSides = this.getPossibleSides(elementRect);
        const actualPosition = desiredPosition && possibleSides ? this.getActualPosition(desiredPosition, possibleSides) : undefined;
        const coordinates = this.calcCoordinates(elementRect, actualPosition);
    
        if(this.tooltip && coordinates){
            this.tooltip.style.left = `${coordinates.x}px`;
            this.tooltip.style.top = `${coordinates.y}px`;
        }

        if(actualPosition){
            this.setClass(`${actualPosition.side}-${actualPosition.alignment}`);
        }
      
    }

    private setClass(tooltipPosition: string) {
        this.tooltip.classList.add(`${TOOLTIP_CLASS}--${tooltipPosition}`);
    }

    private resetClass() {
        this.tooltip.removeAttribute("class");
        this.tooltip.classList.add(TOOLTIP_CLASS, this.settings.className!);
    }

    private  getDesiredPosition(element: HTMLElement): IDiseredPosition | undefined {
        const posSplit = element.dataset.position?.split("-");
    
        if(!posSplit){
          return undefined;
        }
        // for centered position only one alignment might be provided,
        // eg. top === top-center
        if (posSplit.length < 2) {
          posSplit.push("center");
        }
    
        return {
          side: posSplit[0],
          alignment: posSplit[1]
        };
    }

    private getPossibleSides(elementBounding: DOMRect): IPossibleSides {
        return  {
            vertical: this.checkVerticalSpace(elementBounding),
            horizontal: this.checkHorizontalSpace(elementBounding)
        }
    }

    private calcCoordinates(elementRect: DOMRect, position: IDiseredPosition | undefined) {

        const tooltipBounding = this.tooltip.getBoundingClientRect();
        const elementBounding = elementRect;
        const coordinates = getScroll();
        if(!position){
            return coordinates;
        }
        // top & bottom
    
        if ((position.side === "top" || position.side === "bottom")) {
            if (position.alignment === "start") {
            coordinates.x += elementBounding.left;
            }
    
            if (position.alignment === "center") {
            coordinates.x +=
                elementBounding.left +
                ((elementBounding.width / 2) - (tooltipBounding.width / 2));
            }
    
            if (position.alignment === "end") {
            coordinates.x += (elementBounding.right - tooltipBounding.width);
            }
        }
    
        if (position.side === "top") {
            coordinates.y += (elementBounding.top - tooltipBounding.height - (this.settings.margin || 0));
        }
    
        if (position.side === "bottom") {
            coordinates.y += (elementBounding.bottom + (this.settings.margin || 0));
        }
    
        // left & right
    
        if ((position.side === "left" || position.side === "right")) {
            if (position.alignment === "start") {
            coordinates.y += elementBounding.top;
            }
    
            if (position.alignment === "center") {
            coordinates.y +=
                elementBounding.top +
                ((elementBounding.height / 2) - (tooltipBounding.height / 2));
            }
    
            if (position.alignment === "end") {
            coordinates.y += elementBounding.bottom - tooltipBounding.height;
            }
        }
    
        if (position.side === "left") {
            coordinates.x += (elementBounding.left - (this.settings.margin || 0) - tooltipBounding.width);
        }
    
        if (position.side === "right") {
            coordinates.x += (elementBounding.right + (this.settings.margin || 0));
        }
    
        return coordinates;
    }

    private checkVerticalSpace(elementBounding: DOMRect) {
      const topSpace = (elementBounding.top - (this.settings.margin || 0));
      const bottomSpace = window.innerHeight - (elementBounding.bottom + (this.settings.margin || 0));
  
      return {
        start: topSpace > this.tooltip.offsetHeight,
        end: bottomSpace > this.tooltip.offsetHeight
      };
    }
  
    private checkHorizontalSpace(elementBounding: DOMRect) {
      const leftSpace = (elementBounding.left - (this.settings.margin || 0));
      const rightSpace = window.innerWidth - (elementBounding.right + (this.settings.margin || 0));
  
      return {
        start: leftSpace > this.tooltip.offsetWidth,
        end: rightSpace > this.tooltip.offsetWidth
      };
    }

    private getActualPosition(desired: IDiseredPosition, possible: IPossibleSides): IDiseredPosition {
      const positionMap = {
        top: "start",
        bottom: "end",
        left: "start",
        right: "end",
      };
    
      const oppositeMap = {
        top: "bottom",
        bottom: "top",
        left: "right",
        right: "left",
        vertical: "horizontal",
        horizontal: "vertical",
      };
    
      const axis = (
        desired.side === "top" || desired.side === "bottom"
      ) ? "vertical" : "horizontal";
  
      const getSide = (wantedAxis: string, wantedSide: string): string => {
        // @ts-ignore
        const theAxis = possible[wantedAxis];
        let side;
  
        // @ts-ignore
        if (theAxis[positionMap[wantedSide]]) {
          side = wantedSide;
          // @ts-ignore
        } else if (theAxis[positionMap[oppositeMap[wantedSide]]]) {
          // @ts-ignore
          side = oppositeMap[wantedSide];
        } else {
          // @ts-ignore
          side = getSide(oppositeMap[wantedAxis], wantedSide);
        }
  
        return side;
      };
  
      const getAlignment = (wantedAxis: string, wantedAlignment: string|undefined) => {
        // @ts-ignore
        const possibleAlign = possible[wantedAxis];
        
        let alignment;
  
        if (possibleAlign.start && possibleAlign.end) {
          alignment = wantedAlignment;
        } else if (!possibleAlign.start && !possibleAlign.end) {
          alignment = "center";
        } else if (!possibleAlign.start) {
          alignment = "start";
        } else if (!possibleAlign.end) {
          alignment = "end";
        }
  
        return alignment;
      };
  
      return {
        side: getSide(axis, desired.side),
        alignment: getAlignment(oppositeMap[axis], desired.alignment)
      };
    }

}

export default Tooltip;