import { Component, OnInit } from '@angular/core';
import { Inject, Injectable } from '@angular/core';
import { OktaAuth } from '@okta/okta-auth-js';
import { OktaAuthStateService, OKTA_AUTH  } from '@okta/okta-angular';
import OktaSignIn from '@okta/okta-signin-widget';
//Okta的配置内容
import myAppConfig from 'src/app/config/my-app-config';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

oktaSignin: any;

constructor(@Inject(OKTA_AUTH) private oktaAuth: OktaAuth) {
  this.oktaSignin = new OktaSignIn({
    logo: 'assets/images/logo3.png',
    baseUrl: myAppConfig.oidc.issuer.split('/oauth2')[0],
    clientId: myAppConfig.oidc.clientId,
    redirectUri: myAppConfig.oidc.redirectUri,
    authParams: {
      pkce: true,
      issuer: myAppConfig.oidc.issuer,
      scopes: myAppConfig.oidc.scopes
    }
  });

}

  ngOnInit(): void {
   this.oktaSignin.remove();

   this.oktaSignin.renderEl({
    el: '#okta-sign-in-widget'},//render id from <html>
    (response: { status: any; }) =>{
      if(response.status === 'SUCCESS'){
        this.oktaAuth.signInWithRedirect();
      }
    },
    (error: any) =>{
      throw error;
    });

  }

}
