import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Country } from '../common/country';
import { State } from '../common/state';

@Injectable({
  providedIn: 'root'
})
export class ShopFormService {
 

  private countriesUrl = environment.shopApiUrl + '/countries';
  private statesUrl = environment.shopApiUrl +'/states';

  constructor(private httpClient: HttpClient) { }

  //获取指定country code下的所有state
  getStates(theCountryCode: string):Observable<State[]>{
    const searchUrl = `${this.statesUrl}/search/findByCountryCode?code=${theCountryCode}`;

    return this.httpClient.get<getResponseStates>(searchUrl).pipe(
      map(response => response._embedded.states)
    );
  }

  //获取countries
  getCountries(): Observable<Country[]> {
    return this.httpClient.get<getResponseCountries>(this.countriesUrl).pipe(
      map(response => response._embedded.countries)
    );
  }



  getCreditCardMonths(startMonth: number): Observable<number[]>{
    let data: number[] = [];

    for(let theMonth = startMonth; theMonth <= 12; theMonth++){
      data.push(theMonth);
    }

    //of可以将数组包装成Observable类型，就可以用于给subscriber进行订阅了
    //wrap an object as an Observable
    return of(data);
  }

  getCreditCardYears(): Observable<number[]>{

    let data: number[] = [];
    
    //获取的是今年 --- 之后的10年
    const startYear: number = new Date().getFullYear();
    const endYear: number = startYear + 10;

    for(let theYear = startYear; theYear <= endYear; theYear++){
      data.push(theYear);
    }

    return of(data);
  }
}


interface getResponseStates{
  _embedded:{
    states: State[];
  }
}

interface getResponseCountries{
  _embedded:{
    countries: Country[];
  }
}