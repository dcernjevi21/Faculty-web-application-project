import { Component } from '@angular/core';
import { AuthentificationService } from '../../services/authentification.service';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-logout',
  standalone: false,

  templateUrl: './logout.component.html',
  styleUrl: './logout.component.scss',
})
export class LogoutComponent {
  constructor(
    private authService: AuthentificationService,
    private router: Router
  ) {}
  ngOnInit() {
    console.log('odjava init pozvana');
    this.authService.logout().subscribe();
    console.log(
      'trenutni user nakon pozivanja logout funkcije u logout komponenti: ' +
        this.authService.getCurrentUser()
    );
    this.router.navigate(['/']);
  }
}
