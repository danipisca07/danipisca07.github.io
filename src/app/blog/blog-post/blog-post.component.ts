import { Component, OnInit, ElementRef, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-blog-post',
  templateUrl: './blog-post.component.html',
  styleUrls: ['./blog-post.component.scss']
})
export class BlogPostComponent implements OnInit {
  slug = '';
  markdownSrc = '';
  lightboxSrc = '';
  lightboxAlt = '';

  constructor(private route: ActivatedRoute, private el: ElementRef) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.slug = params.get('slug') || '';
      this.markdownSrc = `assets/blog/${this.slug}.md`;
    });
  }

  onMarkdownReady(): void {
    const container = this.el.nativeElement.querySelector('.post-content');
    container.addEventListener('click', (event: Event) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'IMG' && target.closest('figure')) {
        this.lightboxSrc = (target as HTMLImageElement).src;
        this.lightboxAlt = (target as HTMLImageElement).alt;
      }
    });
  }

  closeLightbox(): void {
    this.lightboxSrc = '';
  }

  @HostListener('document:keydown.escape')
  onEscKey(): void {
    this.closeLightbox();
  }
}
