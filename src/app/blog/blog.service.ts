import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Post {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
}

@Injectable({ providedIn: 'root' })
export class BlogService {
  constructor(private http: HttpClient) {}

  getPosts(): Observable<Post[]> {
    return this.http.get<Post[]>('assets/blog/index.json').pipe(
      map(posts => posts.sort((a, b) => b.date.localeCompare(a.date)))
    );
  }

  getLatestPosts(n: number): Observable<Post[]> {
    return this.getPosts().pipe(map(posts => posts.slice(0, n)));
  }
}
