import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environments';
import { Router } from '@angular/router';
import { KorisnikI } from '../models/user';
import { BehaviorSubject, firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthentificationService {
  private baseUrl = `${environment.rest.host}:${environment.rest.port}`;

  currentUser = new BehaviorSubject<KorisnikI | null>(null);

  constructor(private httpClient: HttpClient, private router: Router) {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUser.next(JSON.parse(storedUser));
    }
  }

  public getCurrentUser(): BehaviorSubject<KorisnikI | null> {
    return this.currentUser;
  }

  login(loginData: { username: string; password: string }) {
    return this.httpClient.post<KorisnikI>(
      `${this.baseUrl}/servis/app/korisnici/${loginData.username}/prijava`,
      {
        hash: loginData.password,
      }
    );
  }

  logout() {
    console.log('logout funkcija pozvana');
    this.currentUser.next(null);
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
    console.log(localStorage.getItem('currentUser'));
    return this.httpClient.get(`${this.baseUrl}/odjava`);
  }

  setLoggedInUser(user: KorisnikI) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUser.next(user);
  }

  isLoggedIn(): boolean {
    if (localStorage.getItem('currentUser')) {
      return true;
    } else return false;
  }
}
