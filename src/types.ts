type POSITION_TYPE = "top" | "top-start" | "top-center" | "top-end" 
    | "left-start" | "left-center" | "left-end" 
    | "bottom" | "bottom-start" | "bottom-center" | "bottom-end"
    | "right-start" | "right-center" | "right-end";

export interface ISettings {
    rootElement: HTMLElement;
    className: string;
    position: POSITION_TYPE;
    margin: number;
}

export interface IPossibleSides{
  vertical: {
    start: boolean;
    end: boolean;
  },
  horizontal: {
    start: boolean;
    end: boolean;
  }
}

export interface IDiseredPosition {
  side: string,
  alignment: string|undefined
}
