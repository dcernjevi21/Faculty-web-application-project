import { Component, inject } from '@angular/core';
import { KorisnikI } from '../../models/user';
import { AuthentificationService } from '../../services/authentification.service';

@Component({
  selector: 'app-pocetna',
  standalone: false,
  
  templateUrl: './pocetna.component.html',
  styleUrl: './pocetna.component.scss'
})
export class PocetnaComponent {

  currentUser: KorisnikI | null = null;

  constructor(private authService: AuthentificationService) {}

  ngOnInit() {
    this.authService.getCurrentUser().subscribe(r =>{this.currentUser = r});
    console.log(this.currentUser);
    console.log("dosao u pocetnu i ispis usera");
  }  
}
