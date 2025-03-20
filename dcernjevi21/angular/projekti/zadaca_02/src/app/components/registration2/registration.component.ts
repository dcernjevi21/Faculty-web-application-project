import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UsersService } from '../../services/users.service';
import { RecaptchaService } from '../../services/recaptcha.service';

@Component({
  selector: 'app-registration',
  standalone: false,

  templateUrl: './registration.component.html',
  styleUrl: './registration.component.scss',
})
export class RegistrationComponent2 {
  registrationForm!: FormGroup;
  submitted = false;
  error: string = '';

  constructor(
    private userService: UsersService,
    private recaptchaService: RecaptchaService
  ) {}

  ngOnInit() {
    this.registrationForm = new FormGroup({
      username: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
      ]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
      ]),
      firstName: new FormControl(''),
      lastName: new FormControl(''),
      address: new FormControl(''),
      telephone: new FormControl(''),
      birthDate: new FormControl(''),
    });
  }

  get f() {
    return this.registrationForm.controls;
  }

  onSubmit() {
    console.log(this.registrationForm.invalid);

    console.log(this.registrationForm.value);
    this.recaptchaService.startValidation('registration').subscribe({
      next: (valid: boolean) => {
        if (valid) this.createUser();
        else console.log('zabranjeno registriranje robotima');
      },
      error: (err) => {
        console.log(err + 'neke ne valja kod recaptche');
      },
    });
  }

  private createUser() {
    const data = this.registrationForm.value;

    this.userService.createUser(data).subscribe({
      next: (_) => {
        console.log('user kreiran');
        this.registrationForm.reset();
      },
      error: (error) => {
        this.error = 'Došlo je do greške pri dohvaćanju osoba';
        console.error('Error fetching persons:', error);
      },
    });
  }
}
