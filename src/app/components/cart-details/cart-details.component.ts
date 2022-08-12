import { Component, OnInit, Inject } from '@angular/core';
import { CartItem } from 'src/app/common/cart-item';
import { CartService } from 'src/app/services/cart.service';
import { OktaAuthStateService } from '@okta/okta-angular';
import { OKTA_AUTH } from '@okta/okta-angular';
import { OktaAuth } from '@okta/okta-auth-js';

@Component({
  selector: 'app-cart-details',
  templateUrl: './cart-details.component.html',
  styleUrls: ['./cart-details.component.css']
})
export class CartDetailsComponent implements OnInit {

  cartItems: CartItem[] = [];
  totalPrice: number = 0;
  totalQuantity: number = 0;

  isAuthenticated: boolean = false;

  constructor(private cartService: CartService, @Inject(OKTA_AUTH) private oktaAuth: OktaAuth, private oktaAuthService: OktaAuthStateService) { }

  ngOnInit(): void {
    this.oktaAuthService.authState$.subscribe(

      (result) => {
        this.isAuthenticated = result.isAuthenticated;
      }
    );
    this.listCartDetails();
  }

  listCartDetails(){
    //从cartserive拿cartItems的数据
    this.cartItems = this.cartService.cartItem;

    //subscribe 总价和总数量
    this.cartService.totalPrice.subscribe(
      data => this.totalPrice = data
    );

    this.cartService.totalQuantity.subscribe(
      data => this.totalQuantity = data
    );

    //计算购物车内的总价和总数量
    this.cartService.computeCartTotals();
  }

  incrementQuantity(theCartItem: CartItem){
    this.cartService.addToCart(theCartItem);
  }

  decrementQuantity(theCartItem: CartItem){
    this.cartService.decrementQuantity(theCartItem);
  }

  remove(theCartItem: CartItem){
    this.cartService.remove(theCartItem);
  }
}
