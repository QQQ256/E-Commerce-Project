import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, ObservedValueOf } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Product } from '../common/product';
import { ProductCategory } from '../common/product-category';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  
  //有点像订阅者，可以传递events，各种消息和数据

  private baseUrl = environment.shopApiUrl + '/products'; /* REST API GET所有student的link */
  private categoryUrl = environment.shopApiUrl + '/product-category';//已经暴露的categoryUrl

  constructor(private httpClient : HttpClient){ /* 将HttpClient注入到该构造函数中，可以使用其中的各种request */

  }

  getProductList(theCategoryId: number) : Observable<Product[]>{


    //@TODO:基于id使用合适的Url，从后端获取数据
    const searchUrl = `${this.baseUrl}/search/findByCategoryId?id=${theCategoryId}`;

    //Observables provide support for passing messages between parts of your application. 
    //有点像订阅者，可以传递events，各种消息和数据

    return this.getProducts(searchUrl);
  }

  //通过REST获取product-category
  getProductCategories() : Observable<ProductCategory[]> {

    
    return this.httpClient.get<GetResponseProductCategory>(this.categoryUrl).pipe(/* HttpClient的getmethod */
      map(response => response._embedded.productCategory)
    );
  }


  //通过keyword来search
  searchProducts(theKeyword: string) :Observable<Product[]> {

    const searchUrl = `${this.baseUrl}/search/findByNameContaining?name=${theKeyword}`;

    return this.getProducts(searchUrl);
  }

  //封装这个返回Product Array的function
  private getProducts(searchUrl: string): Observable<Product[]> {
    return this.httpClient.get<GetResponseProducts>(searchUrl).pipe(
      map(response => response._embedded.products)
    );
  }


  //通过id获取单个product的所有数据 -- 通过products/id -- 返回值即JSON，无需用interface来UNwrap
  getProduct(productId: number): Observable<Product> {
    const productUrl = `${this.baseUrl}/${productId}`;

    return this.httpClient.get<Product>(productUrl);
  }


  //获取PageContent -- size, totalElements 等
  getProductListPaginate(thePage: number, 
                         thePageSize: number, theCategoryId: number) : Observable<GetResponseProducts>{

    //还是通过url的方式
    const searchUrl = `${this.baseUrl}/search/findByCategoryId`
                      + `?id=${theCategoryId}&page=${thePage}&size=${thePageSize}`;

    return this.httpClient.get<GetResponseProducts>(searchUrl);
  }


  //搜索产品后进行page的paginate
  searchProductListPaginate(thePage: number, 
                            thePageSize: number, 
                            theKeyword: string) : Observable<GetResponseProducts>{

  //还是通过url的方式，这里复用之前的从数据库搜索字符串的方式
  const searchUrl = `${this.baseUrl}/search/findByNameContaining?name=${theKeyword}` 
                    + `&page=${thePage}&size=${thePageSize}`;

  return this.httpClient.get<GetResponseProducts>(searchUrl);
  }

}

interface GetResponseProducts{
  _embedded:{
    products : Product[];
  }
  page:{
    size: number,
    totalElements: number,
    totalPages: number,
    number: number
  }
}


interface GetResponseProductCategory{
  _embedded:{
    productCategory : ProductCategory[];
  }
}
