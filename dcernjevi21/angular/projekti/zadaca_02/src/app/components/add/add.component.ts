import { Component } from '@angular/core';
import { TmdbService } from '../../services/tmdb.service';
import { OsobaTmdbI } from '../../models/movies';
import { AddService } from '../../services/add.service';

@Component({
  selector: 'app-add',
  standalone: false,

  templateUrl: './add.component.html',
  styleUrl: './add.component.scss',
})
export class AddComponent {
  searchQuery: string = '';
  persons: OsobaTmdbI[] = [];
  error: string | null = null;

  constructor(
    private tmdbService: TmdbService,
    private addService: AddService
  ) {}

  onSearch() {
    if (this.searchQuery.trim()) {
      console.log('Pokrenuta pretraga za:', this.searchQuery);
      this.loadPersons(this.searchQuery);
    } else {
      console.log('Polje za pretragu je prazno.');
    }
  }
  loadPersons(searchQuery: string, page?: number) {
    this.tmdbService.getPersons(searchQuery).subscribe({
      next: (response: any) => {
        this.persons = response.results.slice(0, 20).map((person: any) => ({
          id: person.id,
          name: person.name,
          known_for: person.known_for.map((kf: any) => ({
            title: kf.title,
            id: kf.id,
          })),
          popularity: person.popularity.toString(),
          profile_path: person.profile_path,
        }));
      },
      error: (error) => {
        this.error = 'Došlo je do greške pri dohvaćanju osoba';
        console.error('Error fetching persons:', error);
      },
    });
  }

  onAdd(id: number) {
    console.log('Dodana osoba:', id);
    if (id > 0) {
      this.addService.postPersonOsoba(id).subscribe({
        next: (response: any) => {
          this.addService.postPersonMovies(id).subscribe({
            next: (response: any) => {
              this.addService.putPersonMoviesConnect(id).subscribe({
                next: (response: any) => {},
                error: (error) => {
                  this.error = 'Došlo je do greške pri dohvaćanju osoba';
                  console.error('Error fetching persons:', error);
                },
              });
            },
            error: (error) => {
              this.error = 'Došlo je do greške pri dohvaćanju osoba';
              console.error('Error fetching persons:', error);
            },
          });
        },
        error: (error) => {
          this.error = 'Došlo je do greške pri dohvaćanju osoba';
          console.error('Error fetching persons:', error);
        },
      });
    } else return;
  }

  onDelete(id: number) {
    console.log('Izbrisan ID:', id);
    if (id > 0) {
      this.addService.deletePerson(id).subscribe({
        next: (response: any) => {},
        error: (error) => {
          this.error = 'Došlo je do greške pri dohvaćanju osoba';
          console.error('Error fetching persons:', error);
        },
      });
    } else return;
  }
}
