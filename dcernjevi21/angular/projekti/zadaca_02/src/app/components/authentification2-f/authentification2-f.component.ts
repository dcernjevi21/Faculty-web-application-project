import { Component } from '@angular/core';
import { UsersService } from '../../services/users.service';
import { AuthentificationService } from '../../services/authentification.service';
import { KorisnikI } from '../../models/user';

@Component({
  selector: 'app-authentification2-f',
  standalone: false,

  templateUrl: './authentification2-f.component.html',
  styleUrl: './authentification2-f.component.scss',
})
export class Authentification2FComponent {
  currentUser: KorisnikI | null = null;
  error: string = '';
  username: string = '';
  constructor(
    private userService: UsersService,
    private authService: AuthentificationService
  ) {}

  ngOnInit() {
    this.loadUser();
  }

  loadUser() {
    this.authService.getCurrentUser().subscribe((r) => {
      this.currentUser = r;
      this.username = this.currentUser?.korime!;
    });
  }

  azuriraj2F() {
    let generateTotp: number = 0;
    if (this.currentUser?.two_factor != 1) {
      if (this.currentUser?.totp_tajniKljuc == null) {
        generateTotp = 1;
      }
      this.userService.post2FAuth(1, generateTotp, this.username).subscribe({
        next: (data) => {
          this.authService.setLoggedInUser(data);
        },
        error: (error) => {
          this.error = 'Došlo je do greške pri dohvaćanju korisnika';
          console.error('Error fetching users:', error);
        },
      });
    } else {
      this.userService.post2FAuth(0, 0, this.username).subscribe({
        next: (data) => {
          console.log('uspjesna promjena TOTP');
          this.authService.setLoggedInUser(data);
        },
        error: (error) => {
          this.error = 'Došlo je do greške pri dohvaćanju korisnika';
          console.error('Error fetching users:', error);
        },
      });
    }
  }
}
