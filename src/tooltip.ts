import { TOOLTIP_CLASS } from "./constants";
import { getScroll, isNotEmptyAttr } from "./functions";
import { IDiseredPosition, IPossibleSides, ISettings } from "./types";
import "../lib/tooltip.css"

class Tooltip {
    private settings: ISettings;
    private tooltip!: HTMLDivElement;
    private targetElement: HTMLElement|undefined;
    constructor(options = {}) {
        this.settings = {
          rootElement: document.body,
          className: "tooltip",
          position: "top-center",
          margin: 10
        };
  
        this.settings = Object.assign(this.settings, options);
        this.createTooltipElement();
    }

    createTooltipElement() {
        const tooltip = document.createElement("div");
        tooltip.classList.add(TOOLTIP_CLASS, this.settings.className);
        this.tooltip = tooltip;
        this.settings.rootElement.appendChild(this.tooltip);
        this.subscribe(true);
    }

    onRemoveTooltip = () => {
        this.tooltip.remove();
    }

    subscribe(mtd: boolean){
        if(mtd){
            this.settings.rootElement.addEventListener("mouseover", this.onMouseMove);
            this.settings.rootElement.addEventListener("remove", this.onRemoveTooltip);
        }else{
            this.settings.rootElement.removeEventListener("mouseover", this.onMouseMove);
            this.settings.rootElement.removeEventListener("remove", this.onRemoveTooltip);
        }
    }

    onMouseMove = (event: MouseEvent) => {
        const el = event.target as HTMLElement;
        if(isNotEmptyAttr(el,"title") || isNotEmptyAttr(el,"data-tooltip")){
            this.targetElement = el;
            this.targetElement.addEventListener("mouseout", this.onHideTooltip);

            this.addTooltipData();
            this.addTooltip();
        }
    }

    addTooltipData(){
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

    addTooltip(){
        if(!this.targetElement){
            return;
        }
        this.tooltip.textContent = this.targetElement.dataset.tooltip || null;
        this.setTooltipPosition();
        this.showTooltip();
    }

    onHideTooltip = () => {
        const visibilityClass = `${TOOLTIP_CLASS}--visible`;
        
        if (this.tooltip.classList.contains(visibilityClass)) {
            this.tooltip.classList.remove(visibilityClass);
            this.tooltip.removeAttribute("style");
            this.resetClass();
        }
    }

    showTooltip() {
        
        const visibilityClass = `${TOOLTIP_CLASS}--visible`;
    
        if (!this.tooltip.classList.contains(visibilityClass)) {
            this.tooltip.classList.add(visibilityClass);
        }
    }

    setTooltipPosition() {
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

    setClass(tooltipPosition: string) {
        this.tooltip.classList.add(`${TOOLTIP_CLASS}--${tooltipPosition}`);
    }

    resetClass() {
        this.tooltip.removeAttribute("class");
        this.tooltip.classList.add(TOOLTIP_CLASS, this.settings.className);
    }

    getDesiredPosition(element: HTMLElement): IDiseredPosition | undefined {
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

    getPossibleSides(elementBounding: DOMRect): IPossibleSides {
        return  {
            vertical: this.checkVerticalSpace(elementBounding),
            horizontal: this.checkHorizontalSpace(elementBounding)
        }
    }

    calcCoordinates(elementRect: DOMRect, position: IDiseredPosition | undefined) {

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
            coordinates.y += (elementBounding.top - tooltipBounding.height - this.settings.margin);
        }
    
        if (position.side === "bottom") {
            coordinates.y += (elementBounding.bottom + this.settings.margin);
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
            coordinates.x += (elementBounding.left - this.settings.margin - tooltipBounding.width);
        }
    
        if (position.side === "right") {
            coordinates.x += (elementBounding.right + this.settings.margin);
        }
    
        return coordinates;
    }

    checkVerticalSpace(elementBounding: DOMRect) {
      const topSpace = (elementBounding.top - this.settings.margin);
      const bottomSpace = window.innerHeight - (elementBounding.bottom + this.settings.margin);
  
      return {
        start: topSpace > this.tooltip.offsetHeight,
        end: bottomSpace > this.tooltip.offsetHeight
      };
    }
  
    checkHorizontalSpace(elementBounding: DOMRect) {
      const leftSpace = (elementBounding.left - this.settings.margin);
      const rightSpace = window.innerWidth - (elementBounding.right + this.settings.margin);
  
      return {
        start: leftSpace > this.tooltip.offsetWidth,
        end: rightSpace > this.tooltip.offsetWidth
      };
    }

    getActualPosition(desired: IDiseredPosition, possible: IPossibleSides): IDiseredPosition {
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