import { NgModule, importProvidersFrom } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';

import { RECAPTCHA_V3_SITE_KEY, RecaptchaV3Module } from 'ng-recaptcha-2';

import { LoginComponent } from './components/login/login.component';
import { RegistrationComponent2 } from './components/registration2/registration.component';
import { DetailsComponent } from './components/details/details.component';
import { UsersComponent } from './components/users/users.component';
import { SearchComponent } from './components/search/search.component';
import { DocumentationComponent } from './components/documentation/documentation.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { LogoutComponent } from './components/logout/logout.component';
import { PocetnaComponent } from './components/pocetna/pocetna.component';
import { PersonsComponent } from './components/persons/persons.component';
import { AddComponent } from './components/add/add.component';

import { environment } from './environments/environments';
import { MoviesComponent } from './components/movies/movies.component';
import { Authentification2FComponent } from './components/authentification2-f/authentification2-f.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegistrationComponent2,
    DetailsComponent,
    UsersComponent,
    SearchComponent,
    DocumentationComponent,
    NavbarComponent,
    LogoutComponent,
    PocetnaComponent,
    PersonsComponent,
    AddComponent,
    MoviesComponent,
    Authentification2FComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    RecaptchaV3Module,
  ],
  providers: [
    provideHttpClient(),
    {
      provide: RECAPTCHA_V3_SITE_KEY,
      useValue: environment.g_reCAPTCHA_site_key,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
