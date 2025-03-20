import { Injectable } from '@angular/core';
import { BehaviorSubject, debounceTime, tap } from 'rxjs';
import { Notification } from '../models/notification';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
	providedIn: 'root',
})
export class NotificationService {
	constructor() {
		this.notification$
			.pipe(
				debounceTime(5000),
				tap(() => this.notification$.next(null))
			)
			.subscribe();
	}

	readonly notification$ = new BehaviorSubject<Notification | null>(null);

	addSuccessNotification(title: string, message: string) {
		const notification: Notification = {
			title,
			message,
			isErrorNotification: false,
		};
		this.notification$.next(notification);
	}

	addErrorNotification(err: HttpErrorResponse | Error) {
		let message = 'Nepoznata greška';
		if (err instanceof HttpErrorResponse) message = err.error.opis;
		else if (err instanceof Error && err.message != null)
			message = err.message;

		const notification: Notification = {
			title: 'Greška!',
			message,
			isErrorNotification: true,
		};

		this.notification$.next(notification);
	}
}
