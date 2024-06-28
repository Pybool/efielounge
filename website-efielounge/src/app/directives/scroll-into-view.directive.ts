import { Directive, ElementRef, EventEmitter, HostListener, OnDestroy, OnInit, Output, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appScrollIntoView]',
  standalone: true
})
export class ScrollIntoViewDirective implements OnInit, OnDestroy {
  private observer!: IntersectionObserver;

  @Output() visible = new EventEmitter<void>();

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    this.createObserver();
  }

  ngOnDestroy() {
    this.observer.disconnect();
  }

  private createObserver() {
    const options = {
      root: null, // Use the viewport as the root
      rootMargin: '0px',
      threshold: 0.1 // Trigger when 10% of the element is visible
    };

    this.observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.visible.emit();
        }
      });
    }, options);

    this.observer.observe(this.el.nativeElement);
  }
}
