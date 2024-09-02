import { Injectable, OnDestroy } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DomWatcherService implements OnDestroy {
  private observer!: MutationObserver;

  constructor() {}

  startObserving(className: string, callback: (node: HTMLElement) => void) {
    // Define the observer callback
    console.log(className)
    const observerCallback: MutationCallback = (mutationsList) => {
      console.log("mutationsList ", Array.from(mutationsList))
      for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (
              node instanceof HTMLElement &&
              node.classList.contains(className)
            ) {
              console.log(`${className} appeared in DOM:`, node);
              callback(node); // Trigger the passed callback function
            }
          });
        }
      }
    };

    // Create a MutationObserver instance
    this.observer = new MutationObserver(observerCallback);

    // Start observing the document body for childList changes
    this.observer.observe(document.body, {
      childList: true, // Watch for addition or removal of child nodes
      subtree: true,   // Watch for all descendant nodes
    });
  }

  // Stop observing the DOM
  stopObserving() {
    if (this.observer) {
      this.observer.disconnect();
      console.log('Stopped observing the DOM.');
    }
  }

  // Clean up the observer when the service or component is destroyed
  ngOnDestroy() {
    this.stopObserving();
  }
}
