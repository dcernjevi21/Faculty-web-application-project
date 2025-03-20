import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environments';
import { Observable } from 'rxjs';
import { KorisnikI } from '../models/user';
import { OsobaTmdbI } from '../models/movies';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  constructor(private httpClient: HttpClient) {}

  private readonly baseUrl = `${environment.rest.host}:${environment.rest.port}/servis/app`;

  totp(username: string, key: string) {
    return this.httpClient.get<KorisnikI>(
      `${this.baseUrl}/korisnici/2f/totp/${username}/${key}`,
      {}
    );
  }

  post2FAuth(value: number, generateTotp: number, username: string) {
    return this.httpClient.post<KorisnikI>(
      `${this.baseUrl}/korisnici/2f/${username}/${value}/${generateTotp}`,
      {}
    );
  }

  getUsers(): Observable<KorisnikI[]> {
    console.log(this.baseUrl);
    return this.httpClient.get<KorisnikI[]>(`${this.baseUrl}/korisnici`);
  }

  createUser(data: OsobaTmdbI) {
    return this.httpClient.post(`${this.baseUrl}/registracija`, {
      data,
    });
  }

  deleteUser(username: string) {
    return this.httpClient.delete<KorisnikI>(
      `${this.baseUrl}/korisnici/${username}`
    );
  }

  giveAccess(username: string) {
    return this.httpClient.post<KorisnikI>(
      `${this.baseUrl}/dajPravo/${username}`,
      {}
    );
  }

  removeAccess(username: string) {
    return this.httpClient.post<KorisnikI>(
      `${this.baseUrl}/makniPravo/${username}`,
      {}
    );
  }

  manageAccessApkDB(username: string, value: number) {
    console.log('apkDB');
    console.log(`${this.baseUrl}/setPravo/${username}/${value}`);
    return this.httpClient.post<KorisnikI>(
      `${this.baseUrl}/setPravo/${username}/${value}`,
      {}
    );
  }
}
