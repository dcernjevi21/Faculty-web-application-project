import { Injectable } from '@angular/core';
import { FilmoviTmdbI } from '../models/movies';
import { environment } from '../environments/environments';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class MoviesService {
  constructor(private httpClient: HttpClient) {}

  private readonly baseUrl = `${environment.rest.host}:${environment.rest.port}/servis/app`;

  getPersonMovie(id: number): Observable<FilmoviTmdbI> {
    return this.httpClient.get<FilmoviTmdbI>(
      `${this.baseUrl}/osoba/${id}/film?stranica=1`
    );
  }

  getFilteredMovies(datumOd: string, datumDo: number, page: number) {
    return this.httpClient.get(
      `${this.baseUrl}/film?stranica=${page}&datumOd=${datumOd}&datumDo=${datumDo}`
    );
  }
}
