import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then(m => m.HomePage)
  },
  {
    path: 'connection',
    loadComponent: () => import('./connection/connection.page').then(m => m.ConnectionPage)
  },
  {
    path: 'shows',
    loadComponent: () => import('./shows/shows.page').then(m => m.ShowsPage)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  }
];