import { CanActivateFn, Router } from '@angular/router';
import { AuthentificationService } from '../services/authentification.service';
import { inject } from '@angular/core';

export const hasRestGuard: CanActivateFn = (route, state) => {
  const authSevice = inject(AuthentificationService);
  if (authSevice.getCurrentUser().getValue()?.ima_pristup == 1) return true;
  inject(Router).navigate(['/pocetna']);
  return false;
};
