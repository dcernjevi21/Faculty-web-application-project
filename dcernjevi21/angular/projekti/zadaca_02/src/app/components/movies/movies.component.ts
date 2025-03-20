import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MoviesService } from '../../services/movies.service';

@Component({
  selector: 'app-movies',
  standalone: false,

  templateUrl: './movies.component.html',
  styleUrl: './movies.component.scss',
})
export class MoviesComponent {
  filmovi: any[] = [];
  totalPages: number = 0;
  currentPage: number = 1;
  filterForm: FormGroup;
  isLoading: boolean = false;

  constructor(private fb: FormBuilder, private movieService: MoviesService) {
    this.filterForm = this.fb.group({
      datumOd: null,
      datumDo: null,
    });
  }

  dohvatiFilmove() {
    this.isLoading = true;
    const { datumOd, datumDo } = this.filterForm.value;

    this.movieService
      .getFilteredMovies(datumOd, datumDo, this.currentPage)
      .subscribe({
        next: (res: any) => {
          this.filmovi = res;
          this.isLoading = false;
        },
        error: () => {
          console.error('Greška pri dohvaćanju filmova.');
          this.isLoading = false;
        },
      });
  }

  filtriraj() {
    this.currentPage = 1;
    this.dohvatiFilmove();
  }

  promijeniStranicu(page: number) {
    this.currentPage = page;
    this.dohvatiFilmove();
  }
}
