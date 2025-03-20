import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SearchComponent } from './components/search/search.component';
import { LoginComponent } from './components/login/login.component';
import { RegistrationComponent2 } from './components/registration2/registration.component';
import { DocumentationComponent } from './components/documentation/documentation.component';
import { UsersComponent } from './components/users/users.component';
import { DetailsComponent } from './components/details/details.component';
import { LogoutComponent } from './components/logout/logout.component';
import { PocetnaComponent } from './components/pocetna/pocetna.component';
import { PersonsComponent } from './components/persons/persons.component';
import { AddComponent } from './components/add/add.component';

import { isAuthenticatedGuard } from './guards/authenticated.guard';
import { isAdminGuard } from './guards/is-admin.guard';
import { MoviesComponent } from './components/movies/movies.component';
import { Authentification2FComponent } from './components/authentification2-f/authentification2-f.component';
import { hasRestGuard } from './guards/has-rest.guard';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/pocetna',
  },
  {
    path: 'registracija',
    component: RegistrationComponent2,
  },
  {
    path: 'prijava',
    component: LoginComponent,
  },
  {
    path: 'dokumentacija',
    component: DocumentationComponent,
  },
  {
    path: 'korisnici',
    component: UsersComponent,
    canActivate: [isAdminGuard],
  },
  {
    path: 'detalji/:id',
    component: DetailsComponent,
    canActivate: [isAuthenticatedGuard, hasRestGuard],
  },
  {
    path: 'pocetna',
    component: PocetnaComponent,
    canActivate: [isAuthenticatedGuard],
  },
  {
    path: 'dodavanje',
    component: AddComponent,
    canActivate: [isAdminGuard],
  },
  {
    path: 'osobe',
    component: PersonsComponent,
    canActivate: [isAuthenticatedGuard, hasRestGuard],
  },
  {
    path: 'filmovi',
    component: MoviesComponent,
    canActivate: [isAuthenticatedGuard, hasRestGuard],
  },

  {
    path: 'odjava',
    component: LogoutComponent,
  },
  {
    path: 'aktiviraj2F',
    component: Authentification2FComponent,
    canActivate: [isAuthenticatedGuard],
  },
  {
    path: '**',
    redirectTo: '',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
