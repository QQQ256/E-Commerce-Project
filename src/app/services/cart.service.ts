import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { CartItem } from '../common/cart-item';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  cartItem: CartItem[] = [];

  //subject is a subclass of Observable, 所以我们可以使用subject来publish events
  //events将会发送到所有的subscribers手中
  totalPrice: Subject<number> = new BehaviorSubject<number>(0);
  totalQuantity: Subject<number> = new BehaviorSubject<number>(0);

  //存储当前页面的数据，并在同一页面下使用
  storage: Storage = sessionStorage;
  // storage: Storage = localStorage;

  constructor() {
    //从storage读取cartItems的数据 JS object -> object
    let data = JSON.parse(this.storage.getItem('cartItems'));

    if(data != null){
      this.cartItem = data;
      //刷新页面后最先走的是构造函数，所以这儿通过cartItem就可以重新再计算一波
      this.computeCartTotals();
    }
   }

  addToCart(theCartItem: CartItem){
    //检查是否已经存在于cart
    let alreadyExistsInCart: boolean = false;
    let existingCartItem: CartItem = undefined;

    //基于id在cart找item --相同id的item就显示一个，quantity的数量是唯一的变化量
    if(this.cartItem.length > 0){

      // for(let item of this.cartItem){
      //   if(item.id == theCartItem.id){
      //     existingCartItem = item;
      //     break;
      //   }
      // }

      //tempCartItem仅存在于该find function内
      //如果找到结果则会返回第一个符合结果的值，否则就返回undefined
      existingCartItem = this.cartItem.find(tempCartItem => theCartItem.id == tempCartItem.id);
    }

    //检查是否找到
    alreadyExistsInCart = (existingCartItem != undefined);

    if(alreadyExistsInCart){
      existingCartItem.quantity++;
    }else{
      this.cartItem.push(theCartItem);
    }

    //计算总金额和总个数
    this.computeCartTotals();
  }

  persistCartItems(){
    //              convert object ---> string
    this.storage.setItem('cartItems', JSON.stringify(this.cartItem));
  }

  computeCartTotals(){
      let totalPriceValue: number = 0;
      let totalQuantityValue: number = 0;
      
      for(let item of this.cartItem){
        totalPriceValue += item.quantity * item.unitPrice;
        totalQuantityValue += item.quantity;
      }

      //publish新的数据，所有的subscribers都会收到
      this.totalPrice.next(totalPriceValue);
      this.totalQuantity.next(totalQuantityValue);

      //log一下，直观可靠
      // this.logCartData(totalPriceValue, totalQuantityValue);

      //构造器中读取数据，这里再存储数据
      this.persistCartItems();
  }

  //移除一个item
  decrementQuantity(theCartItem: CartItem){
    theCartItem.quantity--;

    if(theCartItem.quantity == 0){
      this.remove(theCartItem);
    }else{
      this.computeCartTotals();
    }
  }

  //通过id来找cartItem，然后将这个item从数组中移除
  remove(theCartItem: CartItem){
    const itemIndex = this.cartItem.findIndex(tempItem => tempItem.id == theCartItem.id);

    //数组中通过提供测试函数的第一个元素的索引。否则，返回-1
    if(itemIndex > -1){
      this.cartItem.splice(itemIndex, 1);//(itemIndex--移除这个下标的元素，1--移除一个)

      this.computeCartTotals();
    }
  }

  logCartData(price: number, quantity: number){

      console.log("Cart Data Log");

      for(let item of this.cartItem){
        const subTotalPrice = item.quantity * item.unitPrice;
        console.log(`${item.name},${item.quantity},${item.unitPrice},${subTotalPrice}`);
      }

      console.log("Total price and quantity");
      console.log(`price=${price},value=${quantity}`);
  }
}
