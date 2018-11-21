// TODO(Angus): Complete
// Reference https://davidwalsh.name/css-animation-callback

class AnimationChain {
    private element_: HTMLElement;
    private keyframes_: Array<string>;

    constructor(element: HTMLElement, keyframes: Array<string>) {
        this.element_ = element;
        this.keyframes_ = keyframes;

    }
}