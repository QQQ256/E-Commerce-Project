import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable, Inject } from '@angular/core';
import { OktaAuth } from '@okta/okta-auth-js';
import { OKTA_AUTH } from '@okta/okta-angular';
import { from, lastValueFrom, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptorService implements HttpInterceptor{

  constructor(@Inject(OKTA_AUTH)private oktaAuth: OktaAuth) { }

  //implement interface HttpInterceptor
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(this.handleAccess(request, next));
  }


  private async handleAccess(request: HttpRequest<any>, next: HttpHandler): Promise<HttpEvent<any>> {

    //only add an access token for secured endpoints
    const theEndPoint = environment.shopApiUrl + '/orders';
    const secureEndpoints = [theEndPoint];

    if(secureEndpoints.some(url => request.urlWithParams.includes(url))){
      //await --> wait for the async call to finish
      //getAccessToken() is a Async call
      const accessToken = await this.oktaAuth.getAccessToken();

      //clone the request and add new header with access token
      request = request.clone({
        setHeaders:{
          Authorization: 'Bearer ' + accessToken//后面要加空格，我rnmb
        }
      });
    }
    //继续处理其他interceptors，没有的话就直接call rest API
    return await lastValueFrom(next.handle(request));
  }

}
