import { Component, AfterViewInit, ElementRef, Renderer2 } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { PreloaderComponent } from '../../components/preloader/preloader.component';

@Component({
  selector: 'app-faqs',
  standalone: true,
  imports: [
    PreloaderComponent,
    HeaderComponent,
    FooterComponent,
  ],
  templateUrl: './faqs.component.html',
  styleUrl: './faqs.component.scss',
})
export class FaqsComponent {
  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngAfterViewInit() {
    const pageLoader = document.querySelector(
      '.loader-container'
    ) as HTMLElement;
    setTimeout(() => {
      pageLoader.style.display = 'none';
    }, 100);
    const accordions = this.el.nativeElement.querySelectorAll('.accordion');

    accordions.forEach((accordion: any, index: number) => {
      const header = accordion.querySelector('.accordion__header');
      const content = accordion.querySelector('.accordion__content');
      const icon = accordion.querySelector('#accordion-icon');

      this.renderer.listen(header, 'click', () => {
        const isOpen = content.style.height === `${content.scrollHeight}px`;

        accordions.forEach((a: any, i: number) => {
          const c = a.querySelector('.accordion__content');
          const ic = a.querySelector('#accordion-icon');

          if (i === index && !isOpen) {
            this.renderer.setStyle(c, 'height', `${c.scrollHeight}px`);
            this.renderer.removeClass(ic, 'ri-add-line');
            this.renderer.addClass(ic, 'ri-subtract-fill');
          } else {
            this.renderer.setStyle(c, 'height', '0px');
            this.renderer.removeClass(ic, 'ri-subtract-fill');
            this.renderer.addClass(ic, 'ri-add-line');
          }
        });
      });
    });
  }
}
