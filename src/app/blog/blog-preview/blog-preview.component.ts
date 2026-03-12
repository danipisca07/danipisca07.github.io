import { Component, OnInit } from '@angular/core';
import { BlogService, Post } from '../blog.service';

@Component({
  selector: 'app-blog-preview',
  templateUrl: './blog-preview.component.html',
  styleUrls: ['./blog-preview.component.scss']
})
export class BlogPreviewComponent implements OnInit {
  posts: Post[] = [];

  constructor(private blogService: BlogService) {}

  ngOnInit(): void {
    this.blogService.getLatestPosts(3).subscribe(posts => this.posts = posts);
  }
}
