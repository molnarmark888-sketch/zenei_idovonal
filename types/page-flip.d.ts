// A 'page-flip' (StPageFlip) 2.0.7 nem szállít típus-definíciókat, és a UMD-bundle
// nem exportálja a SizeType enumot (a 'size' belül stringként hasonlítva: 'fixed' | 'stretch').
// Ez a minimális ambient deklaráció pontos típusokat ad a használt API-ra (nincs `any`).
declare module 'page-flip' {
  export interface FlipSetting {
    startPage: number;
    size: 'fixed' | 'stretch';
    width: number;
    height: number;
    minWidth: number;
    maxWidth: number;
    minHeight: number;
    maxHeight: number;
    drawShadow: boolean;
    flippingTime: number;
    usePortrait: boolean;
    startZIndex: number;
    autoSize: boolean;
    maxShadowOpacity: number;
    showCover: boolean;
    mobileScrollSupport: boolean;
    clickEventForward: boolean;
    useMouseEvents: boolean;
    swipeDistance: number;
    showPageCorners: boolean;
    disableFlipByClick: boolean;
  }

  export type WidgetEvent = {
    data: unknown;
    object: PageFlip;
  };

  export class PageFlip {
    constructor(inBlock: HTMLElement, setting: Partial<FlipSetting>);
    loadFromImages(imagesHref: string[]): void;
    loadFromHTML(items: NodeListOf<Element> | HTMLElement[]): void;
    updateFromImages(imagesHref: string[]): void;
    updateFromHtml(items: NodeListOf<Element> | HTMLElement[]): void;
    destroy(): void;
    flip(page: number, corner?: 'top' | 'bottom'): void;
    flipNext(corner?: 'top' | 'bottom'): void;
    flipPrev(corner?: 'top' | 'bottom'): void;
    turnToPage(page: number): void;
    turnToNextPage(): void;
    turnToPrevPage(): void;
    getPageCount(): number;
    getCurrentPageIndex(): number;
    getOrientation(): 'portrait' | 'landscape';
    on(eventName: string, callback: (e: WidgetEvent) => void): void;
    off(eventName: string): void;
  }
}
