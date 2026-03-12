import { Component, OnInit } from '@angular/core';
import { BlogService, Post } from '../blog.service';

@Component({
  selector: 'app-blog-list',
  templateUrl: './blog-list.component.html',
  styleUrls: ['./blog-list.component.scss']
})
export class BlogListComponent implements OnInit {
  posts: Post[] = [];

  constructor(private blogService: BlogService) {}

  ngOnInit(): void {
    this.blogService.getPosts().subscribe(posts => this.posts = posts);
  }
}
