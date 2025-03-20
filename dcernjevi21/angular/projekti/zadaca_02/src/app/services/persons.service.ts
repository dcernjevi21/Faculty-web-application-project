import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environments';
import { OsobaTmdbI } from '../models/movies';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PersonsService {
  
  constructor(private httpClient: HttpClient) { }

  private readonly baseUrl = `${environment.rest.host}:${environment.rest.port}/servis/app`;

  getPersons(page: number): Observable<OsobaTmdbI[]> {
    return this.httpClient.get<OsobaTmdbI[]>(`${this.baseUrl}/osoba?stranica=${page}`)
  }

  getPerson(id: number): Observable<OsobaTmdbI> {
    return this.httpClient.get<OsobaTmdbI>(`${this.baseUrl}/osoba/${id}`)
  }


}
