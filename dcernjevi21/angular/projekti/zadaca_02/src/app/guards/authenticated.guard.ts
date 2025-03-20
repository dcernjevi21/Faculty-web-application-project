import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthentificationService } from '../services/authentification.service';

export const isAuthenticatedGuard: CanActivateFn = (route, state) => {
	const authSevice = inject(AuthentificationService);
	if (authSevice.isLoggedIn()) return true;
	inject(Router).navigate(['/prijava']);
	return false;
};
