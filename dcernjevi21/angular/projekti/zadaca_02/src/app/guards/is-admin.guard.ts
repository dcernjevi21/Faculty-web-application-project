import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthentificationService } from '../services/authentification.service';

export const isAdminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthentificationService);
  const loggedUser = authService.getCurrentUser().getValue();
  console.log(loggedUser);
  if (loggedUser && loggedUser?.tip_korisnika_id === 1)
    return true;
  else return false;
};
