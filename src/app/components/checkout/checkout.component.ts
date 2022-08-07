import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Country } from 'src/app/common/country';
import { Order } from 'src/app/common/order';
import { OrderItem } from 'src/app/common/order-item';
import { Purchase } from 'src/app/common/purchase';
import { State } from 'src/app/common/state';
import { CartService } from 'src/app/services/cart.service';
import { CheckoutService } from 'src/app/services/checkout.service';
import { ShopFormService } from 'src/app/services/shop-form.service';
import { ShopValidators } from 'src/app/validators/shop-validators';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  totalPrice: number = 0;
  totalQuantity: number = 0;

  //月年dropdown list
  creditCardYears: number[] = [];
  creditCardMonths: number[] = [];

  //显示所有的country
  countries: Country[] = [];

  //互相传值，shipping传给billing所有的state
  shippingAddressStates: State[] = [];
  billingAddressStates: State[] = [];

  checkoutFormGroup: FormGroup;

  //从 cartService 里拿totalPrice & totalQuantity
  constructor(private formBuilder: FormBuilder,
              private shopFormService: ShopFormService,
              private cartService: CartService,
              private checkoutService: CheckoutService,
              private router: Router
              ) { }
              

  ngOnInit(): void {

    this.reviewCartDetails();

    this.checkoutFormGroup = this.formBuilder.group({
      //第一个组，一个大表格--customer
      customer: this.formBuilder.group({
        //写validation rules
        firstName: new FormControl('', [Validators.required, Validators.minLength(2), ShopValidators.notOnlyWhiteSpace]),
        lastName: new FormControl('', [Validators.required, Validators.minLength(2), ShopValidators.notOnlyWhiteSpace]),
        email: new FormControl('', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')])
      }),
      shippingAddress: this.formBuilder.group({
        country: new FormControl('', [Validators.required]),
        state: new FormControl('', [Validators.required]),
        street: new FormControl('', [Validators.required, Validators.minLength(2), ShopValidators.notOnlyWhiteSpace]),
        city: new FormControl('', [Validators.required, Validators.minLength(2), ShopValidators.notOnlyWhiteSpace]),
        zipCode: new FormControl('', [Validators.required, Validators.minLength(2), ShopValidators.notOnlyWhiteSpace])
      }),
      billingAddress: this.formBuilder.group({
        country: new FormControl('', [Validators.required]),
        state: new FormControl('', [Validators.required]),
        street: new FormControl('', [Validators.required, Validators.minLength(2), ShopValidators.notOnlyWhiteSpace]),
        city: new FormControl('', [Validators.required, Validators.minLength(2), ShopValidators.notOnlyWhiteSpace]),
        zipCode: new FormControl('', [Validators.required, Validators.minLength(2), ShopValidators.notOnlyWhiteSpace])
      }),
      creditCardInformation: this.formBuilder.group({
        cardType: new FormControl('', [Validators.required]),
        nameOnCard: new FormControl('', [Validators.required, Validators.minLength(2), ShopValidators.notOnlyWhiteSpace]),
        cardNumber: new FormControl('', [Validators.required, Validators.pattern('[0-9]{16}')]),
        securityCode: new FormControl('', [Validators.required, Validators.pattern('[0-9]{3}')]),
        expirationMonth: [''],
        expirationYear: ['']
      })
    });


    //填充Card Month & Years
    const startMonth: number = new Date().getMonth() + 1;//start from [0]

    this.shopFormService.getCreditCardMonths(startMonth).subscribe(
      data =>{
        this.creditCardMonths = data;
      }
    );

    this.shopFormService.getCreditCardYears().subscribe(
      data =>{
        this.creditCardYears = data;
      }
    );


    this.shopFormService.getCountries().subscribe(
      data =>{
        this.countries = data;
      }
    );
    
  }


  //getter methods
  get firstName(){ return this.checkoutFormGroup.get('customer.firstName'); }
  get lastName(){ return this.checkoutFormGroup.get('customer.lastName'); }
  get email(){ return this.checkoutFormGroup.get('customer.email'); }

  //shipping address getter methods
  get shippingAddressCountry(){ return this.checkoutFormGroup.get('shippingAddress.country'); }
  get shippingAddressStreet(){ return this.checkoutFormGroup.get('shippingAddress.street'); }
  get shippingAddressCity(){ return this.checkoutFormGroup.get('shippingAddress.city'); }
  get shippingAddressState(){ return this.checkoutFormGroup.get('shippingAddress.state'); }
  get shippingAddressZipCode(){ return this.checkoutFormGroup.get('shippingAddress.zipCode'); }

  //billing address getter methods
  get billingAddressCountry(){ return this.checkoutFormGroup.get('billingAddress.country'); }
  get billingAddressStreet(){ return this.checkoutFormGroup.get('billingAddress.street'); }
  get billingAddressCity(){ return this.checkoutFormGroup.get('billingAddress.city'); }
  get billingAddressState(){ return this.checkoutFormGroup.get('billingAddress.state'); }
  get billingAddressZipCode(){ return this.checkoutFormGroup.get('billingAddress.zipCode'); }

  //credit card getter
  get creditCardType(){ return this.checkoutFormGroup.get('creditCardInformation.cardType'); }
  get creditCardNameOnCard(){ return this.checkoutFormGroup.get('creditCardInformation.nameOnCard'); }
  get creditCardCardNumber(){ return this.checkoutFormGroup.get('creditCardInformation.cardNumber'); }
  get creditCardSecurityCode(){ return this.checkoutFormGroup.get('creditCardInformation.securityCode'); }


  onSubmit(){
    console.log("Handing the submit button");
    console.log(this.checkoutFormGroup.get('customer').value);

    if(this.checkoutFormGroup.invalid){
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }

    //set up order
    let order = new Order();
    order.totalPrice = this.totalPrice;
    order.totalQuantity = this.totalQuantity;

    //get cart items
    const cartItems = this.cartService.cartItem;

    //create orderItem from cartItems 把所有cartItem的信息都加入orderItem
    //简单方式；比较普通的方式是通过for循环来
    let orderItem: OrderItem[] = cartItems.map(item => new OrderItem(item));

    //set up purchase
    let purchase = new Purchase();

    //populate purchase - customer
    purchase.customer = this.checkoutFormGroup.controls['customer'].value;

    //populate purchase - adress * 2
    //--------------------------------
    purchase.shippingAddress = this.checkoutFormGroup.controls['shippingAddress'].value;
    //country和state是一组变量中的一个
    const shippingState: State = JSON.parse(JSON.stringify(purchase.shippingAddress.state));
    const shippingCountry: Country = JSON.parse(JSON.stringify(purchase.shippingAddress.country));
    purchase.shippingAddress.state = shippingState.name;
    purchase.shippingAddress.country = shippingCountry.name;

    purchase.billingAddress = this.checkoutFormGroup.controls['billingAddress'].value;
    const billingState: State = JSON.parse(JSON.stringify(purchase.billingAddress.state));
    const billingCountry: Country = JSON.parse(JSON.stringify(purchase.billingAddress.country));
    purchase.billingAddress.state = billingState.name;
    purchase.billingAddress.country = billingCountry.name;
    //--------------------------------

    //populate purchase - order and orderItems
    purchase.order = order;
    purchase.orderItems = orderItem;

    //call REST API via the checkoutService
    this.checkoutService.placeOrder(purchase).subscribe(
      {
        //next means success
        next: response => {
          alert(`Your order has been received.\nOrder tracking number:${response.orderTrackingNumber}`)
          
          //重置购物车
          this.resetCart();
        },
        //error means exception
        error: err => {
          alert(`There was an error: ${err.message}`);
        }
      }
    );
  }

  resetCart(){
    //reset card data
    this.cartService.cartItem = [];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);

    //reset the form
    this.checkoutFormGroup.reset();

    //navigate back to the products page
    this.router.navigateByUrl("/products");
  }

  copyShippingAddressToBilingAddress(event: any){
    // const isChecked = (<HTMLInputElement>event.target).checked;
    if(event.target.checked){
      this.checkoutFormGroup.controls['billingAddress']
      .setValue(this.checkoutFormGroup.controls['shippingAddress'].value);
      this.billingAddressStates = this.shippingAddressStates;//加上这行，修复勾选后state不被赋值的bug
    }else{
      this.checkoutFormGroup.controls['billingAddress'].reset();
      this.billingAddressStates = [];
    }
  }

  handleMonthAndYears(){
    const currentCardGroup = this.checkoutFormGroup.get('creditCardInformation');

    const currentYear: number = new Date().getFullYear();
    const selectedYear = Number(currentCardGroup.value.expirationYear);

    let startMonth: number;

    if(currentYear != selectedYear){
      startMonth = 1;
    }else{
      startMonth = new Date().getMonth() + 1;
    }

    this.shopFormService.getCreditCardMonths(startMonth).subscribe(
      data =>{
        this.creditCardMonths = data;
      }
    );

  }

  //通过(change)调用
  getStates(formGroupName: string){
    //这个对象里的，formGroupName里的country里的code；前面填写了就肯定有数据
    const formGroup = this.checkoutFormGroup.get(formGroupName);

    const countryCode = formGroup.value.country.code;

    this.shopFormService.getStates(countryCode).subscribe(
      data => {
        if(formGroupName == 'shippingAddress'){
          //在html端使用
          this.shippingAddressStates = data;
        }else{
          this.billingAddressStates = data;
        }

        //设置一个默认的state值
        formGroup.get('state').setValue(data[0]);
      }
    );
  }

  //subscribe price + quantity from cartService
  reviewCartDetails() {
    
    this.cartService.totalQuantity.subscribe(
      totalQuantity => this.totalQuantity = totalQuantity
    );

    this.cartService.totalPrice.subscribe(
      totalPrice => this.totalPrice = totalPrice
    );
  }
}
