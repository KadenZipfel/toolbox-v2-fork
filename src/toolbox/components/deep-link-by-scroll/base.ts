import {Scroll} from '../../utils/cached-vectors/scroll';
import {renderLoop} from '../../utils/render-loop';
import {setScrollTop} from '../../utils/dom/position/set-scroll-top';
import {CommonSelector} from "../../utils/dom/common-selector";

const windowScroll: Scroll = Scroll.getSingleton();

class DeepLinkByScroll {
  private getCurrentAnchor_: (querySelector: string) => HTMLElement;
  private querySelector_: string;

  constructor(
    getCurrentAnchorFn: (querySelector: string) => HTMLElement,
    querySelector: string = CommonSelector.DEEP_LINK_TARGETS
  ) {
    this.getCurrentAnchor_ = getCurrentAnchorFn;
    this.querySelector_ = querySelector;
    this.init_();
  }

  private init_(): void {
    this.render_();
  }

  private render_(): void {
    renderLoop.measure(() => {
      renderLoop.cleanup(() => this.render_());

      // Do nothing if there's been no scrolling
      if (windowScroll.getDelta().getLength() === 0) {
        return;
      }

      const currentAnchorId: string =
        `#${(<HTMLElement>this.getCurrentAnchor_(this.querySelector_)).id}`;

      // Do nothing if the hash hasn't changed
      if (window.location.hash === currentAnchorId) {
        return;
      }

      // Store the current scroll position so we can reset it after changing
      // the hash.
      const currentScroll = windowScroll.getPosition().y;

      renderLoop.mutate(() => {
        history.replaceState(undefined, undefined, currentAnchorId);
        setScrollTop(currentScroll); // Reset the scroll position
      });
    });
  }
}

export {DeepLinkByScroll};
