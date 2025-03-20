import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PersonsService } from '../../services/persons.service';
import { MoviesService } from '../../services/movies.service';
import { TmdbService } from '../../services/tmdb.service';
import { OsobaTmdbI } from '../../models/movies';
import { FilmTmdbI } from '../../models/movies';
import { ImageDataI } from '../../models/movies';

@Component({
  selector: 'app-details',
  standalone: false,
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
})
export class DetailsComponent implements OnInit {
  id!: number;
  person: any;
  images: ImageDataI[] = [];
  movies: FilmTmdbI[] = [];

  error: string | null = null;
  imageBaseUrl = 'https://image.tmdb.org/t/p/w500';

  constructor(
    private route: ActivatedRoute,
    private personsService: PersonsService,
    private movieService: MoviesService,
    private tmdbService: TmdbService
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.id = +params['id'];
      this.loadPerson(this.id);
      this.loadPersonImages(this.id);
      this.loadPersonMovies(this.id);
    });
  }

  loadPerson(id: number) {
    this.personsService.getPerson(id).subscribe({
      next: (response: any) => {
        this.person = {
          name: response.ime,
          known_for: response.known_fo,
          popularity: response.popularity,
          profile_path: response.profile_path,
        };
      },
      error: (error) => {
        this.error = 'Došlo je do greške pri dohvaćanju osobe';
        console.error('Error fetching person:', error);
      },
    });
  }

  loadPersonImages(id: number) {
    this.tmdbService.getPersonImages(id).subscribe({
      next: (response: any) => {
        this.images = response;
        console.log(this.images);
      },
      error: (error) => {
        console.error('Error fetching images:', error);
      },
    });
  }

  loadPersonMovies(id: number) {
    this.movieService.getPersonMovie(id).subscribe({
      next: (response: any) => {
        this.movies = response.map((movie: any) => ({
          id: movie.id,
          original_language: movie.original_language,
          original_title: movie.original_title,
          overview: movie.overview,
          popularity: movie.popularity,
          poster_path: movie.poster_path,
          release_date: movie.release_date,
          title: movie.title,
        }));
      },
      error: (error) => {
        console.error('Error fetching movies:', error);
      },
    });
  }
}
