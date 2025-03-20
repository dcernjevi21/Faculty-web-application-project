import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../environments/environments';
import { OsobaTmdbI } from '../models/movies';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AddService {
  
    constructor(private httpClient: HttpClient) { }

    private readonly baseUrl = `${environment.rest.host}:${environment.rest.port}/servis/app`;


    postPersonOsoba(id: number) {
      const params = new HttpParams().set('stranica', id);
      return this.httpClient.post(`${this.baseUrl}/osoba?stranica=${id}`, { });
    }
    postPersonMovies(id: number) {
      const params = new HttpParams().set('stranica', id);
      return this.httpClient.post(`${this.baseUrl}/film?stranica=${id}&datumOd=${id}&datumDo${id}`, { });
    }
    putPersonMoviesConnect(id: number) {
      const params = new HttpParams().set('stranica', id);
      return this.httpClient.put(`${this.baseUrl}/osoba/${id}/film?stranica=1`, { });
    }

    deletePerson(id: number)
    {
      return this.httpClient.delete(`${this.baseUrl}/osoba/${id}`);
    }

    deletedPersonConnectedMovies(id: number) {
      return this.httpClient.delete(`${this.baseUrl}/film/brisanjeSvihNepovezanih`);
    }

}
