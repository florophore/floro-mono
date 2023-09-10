export type CursorEvents = "changed";
export default class Cursor {

    public position: number = 0;
    public endRangePosition: number = 0;
    public startRangePosition: number = 0;
    public isSelected: boolean = false;

    private listeners: {[eventName: string]: Array<(cursor: Cursor) => void>} = {};

    constructor() {
        this.position = 0;
        this.endRangePosition = 0;
        this.startRangePosition = 0;
        this.isSelected = false;
    }

    public updatePosition(selectionRange: {start: number, end: number}) {
        this.position = selectionRange.end;
        this.startRangePosition = selectionRange.start;
        this.endRangePosition = selectionRange.end;
        this.isSelected = selectionRange.start != selectionRange.end;
        if (this.listeners["changed"]) {
            for (let listener of this.listeners["changed"]) {
                listener(this);
            }
        }
    }

    public addEventListener(eventName: CursorEvents, callback: (cursor: Cursor) => void) {
        if (!this.listeners[eventName]) {
            this.listeners[eventName] = [];
            this.listeners[eventName].push(callback);
        } else {
            this.listeners[eventName].push(callback);
        }
    }

    public removeEventListener(eventName: CursorEvents, callback: (cursor: Cursor) => void) {
        if (this.listeners[eventName]) {
            this.listeners[eventName] = this.listeners[eventName].filter(cb => cb != callback);
        }
    }
}