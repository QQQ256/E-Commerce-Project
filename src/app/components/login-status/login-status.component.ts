import { Component, Inject, OnInit } from '@angular/core';
import { OktaAuthStateService } from '@okta/okta-angular';
import { OKTA_AUTH } from '@okta/okta-angular';
import { OktaAuth } from '@okta/okta-auth-js';

@Component({
  selector: 'app-login-status',
  templateUrl: './login-status.component.html',
  styleUrls: ['./login-status.component.css']
})

export class LoginStatusComponent implements OnInit {

  isAuthenticated: boolean = false;
  userFullName: string;

  storage: Storage = sessionStorage;

  constructor(private oktaAuthService: OktaAuthStateService,

    @Inject(OKTA_AUTH) private oktaAuth: OktaAuth) { }

  ngOnInit(): void {

    // Subscribe to authentication state changes

    this.oktaAuthService.authState$.subscribe(

      (result) => {

        this.isAuthenticated = result.isAuthenticated;
        this.getUserDetails();
      }
    );
  }
  getUserDetails() {

    if (this.isAuthenticated) {
      // Fetch the logged in user details (user's claims)
      // user full name is exposed as a property name
      this.oktaAuth.getUser().then(
        (res) => {
          this.userFullName = res.name;

          //在用户登录后，保存用户的email用于order的查询
          const email = res.email;
          //                          convert object ---> string
          //记住了，storage只存储string
          this.storage.setItem("userEmail", JSON.stringify(email));
        }
      );
    }
  }

  logout() {
    // Terminates the session with Okta and removes current tokens.
    this.oktaAuth.signOut();
  }
}