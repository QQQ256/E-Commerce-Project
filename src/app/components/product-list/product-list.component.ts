import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CartItem } from 'src/app/common/cart-item';
import { Product } from 'src/app/common/product';
import { CartService } from 'src/app/services/cart.service';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list-grid.componet.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {

  products : Product[];
  currentCategoryId : number = 1;
  previousCategoryId: number = 1;
  searchMode : boolean;

  //pagination的变量
  thePageNumber: number = 1;//默认从页面1开始
  thePageSize: number = 5;
  theTotalElements: number = 0;
  

  //字符串+paginate
  previousKeyword: string;

  constructor(private productService : ProductService, private route: ActivatedRoute, private cartService: CartService) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(() => {
      this.listProducts();
    })
    // this.listProducts();
  }

  listProducts(){
    //keyword来自route的路径endpoint的定义，将这个值传给doSearch()的navigateByUrl
    this.searchMode =  this.route.snapshot.paramMap.has('keyword'); 
    //如果没有keyword，说明没有使用搜索功能，那么就展示所有的products
    //否则就通过传过来的keyword和用service方法
    if(this.searchMode){
      this.handleSearchProducts();
    }else{
      this.handleListProducts();
    }
  }

  handleListProducts(){
    //check id这个param是否可用
    const hasCategoryId: boolean = this.route.snapshot.paramMap.has('id');

    if(hasCategoryId){
      //id是个string，用+ ts会将其转换成int
      this.currentCategoryId = +this.route.snapshot.paramMap.get('id');
    }
    else{
      //没有这个id，设置默认id的值为1
      this.currentCategoryId = 1;
    }


    //对category id进行检测，是否和之前的有所不同，category id进行变化后要处理
    //注意：Angular会重复使用component，已经存在的component会重复call

    //若我们之前就有category id，我们要做的事情是重新设置category id为1
    if(this.previousCategoryId != this.currentCategoryId){
      this.thePageNumber = 1;
    }

    this.previousCategoryId = this.currentCategoryId;

    console.log(`currentCId=${this.currentCategoryId}, thePageNum=${this.thePageNumber} , thePageSize=${this.thePageSize}`);

    this.productService.getProductListPaginate(this.thePageNumber - 1, //在spring data REST，0是开始位置
                                               this.thePageSize, 
                                               this.currentCategoryId).subscribe(this.processResult());

    //将拿到的id赋值过来
    // this.productService.getProductList(this.currentCategoryId).subscribe(
    //   data => {
    //     this.products = data;
    //   }
    // )
  }

  processResult(){
    return (data: { _embedded: { products: Product[]; }; page: { number: number; size: number; totalElements: number; }; }) =>{
      this.products = data._embedded.products;
      this.thePageNumber = data.page.number + 1;
      this.thePageSize = data.page.size;
      this.theTotalElements = data.page.totalElements;
    };
  }



  
  handleSearchProducts() {
    const theKeyword: string = this.route.snapshot.paramMap.get('keyword');

    //如果现在的keyword和之前的keyword不相同，则将page设置为1
    if(this.previousKeyword != theKeyword){
      this.thePageNumber = 1;
    }

    this.previousKeyword = theKeyword;

    console.log(`keyword=${theKeyword}, thePageNumber=${this.thePageNumber}, thePageSize=${this.thePageSize}`);

    this.productService.searchProductListPaginate(this.thePageNumber - 1, this.thePageSize, theKeyword).subscribe(this.processResult());
  }


  //用户自定义页面商品的数量展示
  //Angular 13  进来的参数要设置成any，然后用any这个类型来获得value
  updatePageSize(pageSizeEvent: any){
    this.thePageSize = pageSizeEvent.target.value;
    this.thePageNumber = 1;//reset
    this.listProducts();//reset
  }




//购物车Add to Cart Func
  addToCart(theProduct: Product){
    console.log(`add to the cart: ${theProduct.name}, ${theProduct.unitPrice}`);

    //call cart sevice的

    const theCartItem = new CartItem(theProduct);

    this.cartService.addToCart(theCartItem);
  }

}
