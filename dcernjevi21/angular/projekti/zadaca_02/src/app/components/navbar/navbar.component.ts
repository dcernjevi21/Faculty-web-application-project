import { Component, Input } from '@angular/core';
import { AuthentificationService } from '../../services/authentification.service';

@Component({
  selector: 'app-navbar',
  standalone: false,
  
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {

  isAuthenticated: boolean = false;
  isAdmin: boolean = false;

  constructor(public authService: AuthentificationService) {}
  
  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe(loggedUser => {
      if (loggedUser) {
        this.isAuthenticated = true;
      }
      else {
          this.isAuthenticated = false;
          this.isAdmin = false;
        }
  
      if (loggedUser && loggedUser.tip_korisnika_id == 1)
      {
          this.isAdmin = true;
      }
    });
  }
    

  logout() {
    console.log("u odjavi");
    this.authService.logout();
  }
}
