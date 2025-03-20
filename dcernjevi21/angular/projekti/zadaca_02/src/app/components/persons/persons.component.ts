interface OsobaTmdbI {
  id: number;
  name: string;
  known_for: string;
  popularity: number;
  profile_path: string;
}

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PersonsService } from '../../services/persons.service';

@Component({
  selector: 'app-persons',
  standalone: false,
  templateUrl: './persons.component.html',
  styleUrls: ['./persons.component.scss'],
})
export class PersonsComponent {
  persons: OsobaTmdbI[] = [];
  error: string | null = null;

  itemsPerPageOptions = [5, 10, 20, 50];
  currentItemsPerPage = 10;
  currentPage = 1;
  totalPersons = 0;

  constructor(private personsService: PersonsService, private router: Router) {}

  ngOnInit() {
    this.loadPersons();
  }

  loadPersons() {
    this.personsService.getPersons(this.currentPage).subscribe({
      next: (response: any) => {
        this.totalPersons = response.total_results;
        this.persons = response.map((person: any) => ({
          id: person.id,
          name: person.name,
          known_for: person.known_for,
          popularity: person.popularity,
          profile_path: person.profile_path,
        }));
      },
      error: (error) => {
        this.error = 'Došlo je do greške pri dohvaćanju osoba';
        console.error('Error fetching persons:', error);
      },
    });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadPersons();
  }

  onItemsPerPageChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.currentItemsPerPage = Number(target.value);
    this.currentPage = 1;
    this.loadPersons();
  }

  goToDetails(id: number) {
    this.router.navigate(['/detalji', id]);
  }

  get totalPages(): number {
    return Math.ceil(this.totalPersons / this.currentItemsPerPage);
  }
}
