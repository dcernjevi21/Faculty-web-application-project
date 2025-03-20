import { Component, OnInit } from '@angular/core';
import { UsersService } from '../../services/users.service';
import { KorisnikI } from '../../models/user';

@Component({
  selector: 'app-users',
  standalone: false,

  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
})
export class UsersComponent implements OnInit {
  users: KorisnikI[] = [];
  loading: boolean = true;
  error: string | null = null;

  constructor(private userService: UsersService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Došlo je do greške pri dohvaćanju korisnika';
        this.loading = false;
        console.error('Error fetching users:', error);
      },
    });
  }

  deleteUser(user: KorisnikI) {
    this.userService.deleteUser(user.korime).subscribe({
      next: () => {
        console.log('user uspjesno obrisan');
        this.loadUsers();
      },
      error: (error) => {
        this.error = 'Došlo je do greške pri dohvaćanju korisnika';
        this.loading = false;
        console.error('Error fetching users:', error);
      },
    });
  }

  giveAccess(user: KorisnikI) {
    this.userService.giveAccess(user.korime).subscribe({
      next: () => {
        console.log('useru uspjesno dat pristup');
        this.userService.manageAccessApkDB(user.korime, 1).subscribe({
          next: (r) => {
            this.loadUsers();
          },
          error: (error2) => {
            this.error = 'Došlo je do greške pri dohvaćanju korisnika';
            this.loading = false;
            console.error('Error fetching users:', error2);
          },
        });
      },
      error: (error) => {
        this.error = 'Došlo je do greške pri dohvaćanju korisnika';
        this.loading = false;
        console.error('Error fetching users:', error);
      },
    });
  }

  removeAccess(user: KorisnikI) {
    this.userService.removeAccess(user.korime).subscribe({
      next: () => {
        console.log('useru uspjeno maknut pristup');
        this.userService.manageAccessApkDB(user.korime, 0).subscribe({
          next: () => {
            this.loadUsers();
          },
          error: (error) => {
            this.error = 'Došlo je do greške pri dohvaćanju korisnika';
            this.loading = false;
            console.error('Error fetching users:', error);
          },
        });
      },
      error: (error) => {
        this.error = 'Došlo je do greške pri dohvaćanju korisnika';
        this.loading = false;
        console.error('Error fetching users:', error);
      },
    });
  }
}
