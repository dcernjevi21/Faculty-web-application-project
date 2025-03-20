import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { HttpErrorResponse } from "@angular/common/http";
import { KorisnikI } from "../../models/user";
import { AuthentificationService } from "../../services/authentification.service";
import { NotificationService } from "../../services/notification.service";
import { RecaptchaService } from "../../services/recaptcha.service";
import { UsersService } from "../../services/users.service";

@Component({
  selector: "app-login",
  standalone: false,
  templateUrl: "./login.component.html",
  styleUrl: "./login.component.scss",
})
export class LoginComponent {
  constructor(
    private notificationService: NotificationService,
    private authentificationService: AuthentificationService,
    private router: Router,
    private recaptchaV3Service: RecaptchaService,
    private userService: UsersService
  ) {}

  loginForm!: FormGroup;
  isLoading = false;
  error: string = "";

  ngOnInit() {
    this.loginForm = new FormGroup({
      username: new FormControl("", [Validators.required]),
      password: new FormControl("", [Validators.required]),
      totp: new FormControl(""),
    });

    if (this.authentificationService.getCurrentUser()) {
      this.router.navigate(["/"]);
    } else return;
  }

  handleSubmit() {
    if (this.loginForm.invalid) return;

    this.isLoading = true;

    this.recaptchaV3Service.startValidation("login").subscribe({
      next: (valid: boolean) => {
        if (valid) this.login();
        else console.log(" roboti stop");
      },
      error: (error) => {
        error = "bravo error";
        console.log(error);
      },
      complete: () => (this.isLoading = false),
    });
  }

  private login() {
    console.log("login");
    this.authentificationService.login(this.loginForm.value).subscribe({
      next: (user: KorisnikI) => {
        if (user.two_factor == 1) {
          this.handleTotp();
          return;
        }

        this.onSuccessfulLogin(user);
      },
      error: (error) => {
        console.log("greska kod dohvata login");
      },
      complete: () => (this.isLoading = false),
    });
  }

  handleTotp() {
    this.userService
      .totp(
        this.loginForm.get("username")?.value,
        this.loginForm.get("totp")?.value
      )
      .subscribe({
        next: (user) => {
          this.onSuccessfulLogin(user);
        },
        error: (error) => {
          console.log(error, "greska handleTotp");
        },
      });
  }

  private onSuccessfulLogin(user: KorisnikI) {
    console.log("uspjesni login");
    this.notificationService.addSuccessNotification(
      "Uspješni login",
      `Dobrodošli, ${user.korime}`
    );

    this.authentificationService.setLoggedInUser(user);

    this.router.navigate(["/"]);
  }
}
