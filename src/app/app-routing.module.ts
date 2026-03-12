import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BlogListComponent } from './blog/blog-list/blog-list.component';
import { BlogPostComponent } from './blog/blog-post/blog-post.component';

const routes: Routes = [
  { path: 'blog', component: BlogListComponent },
  { path: 'blog/:slug', component: BlogPostComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
