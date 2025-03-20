import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { OsobaTmdbI } from '../models/movies';
import { environment } from '../environments/environments';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class TmdbService {

  private baseUrl = `${environment.rest.host}:${environment.rest.port}/servis/app`;

  constructor(private httpClient: HttpClient) { }

  getPersons(searchQuery: string, page: number = 1): Observable<OsobaTmdbI[]> {

    const params = new HttpParams()
      .set('search', searchQuery)
      .set('page', page.toString());

    return this.httpClient.get<OsobaTmdbI[]>(`${this.baseUrl}/dodavanje`, { params });
  }

  getPerson(id: number): Observable<OsobaTmdbI[]> {
    console.log(`${this.baseUrl}/osoba/${id}`);
    return this.httpClient.get<OsobaTmdbI[]>(`${this.baseUrl}/osoba/${id}`);
  }

  getPersonImages(id: number) {
    return this.httpClient.get(`${this.baseUrl}/tmdb/images/${id}`);
  }
  
  getPersonMovies(id: number) {
    return this.httpClient.get(`${this.baseUrl}/person/${id}/movie_credits?api_key=`);
  }
  
}