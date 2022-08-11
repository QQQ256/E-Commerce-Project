import { Component, OnInit } from '@angular/core';
import { OrderHistory } from 'src/app/common/order-history';
import { OrderHistoryService } from 'src/app/services/order-history.service';

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.css']
})
export class OrderHistoryComponent implements OnInit {

  orderHistoryList: OrderHistory[] = [];
  storage: Storage = sessionStorage;

  constructor(private orderHistoryService: OrderHistoryService) { }

  ngOnInit(): void {

    this.handleOrderHistory();
  }
  handleOrderHistory() {
    //JSON.parse用于解析字符串，将JSON -> Object
    const theEmail = JSON.parse(this.storage.getItem('userEmail'));
    this.orderHistoryService.getOrderHistory(theEmail).subscribe(
      data => {
        //assign data
        this.orderHistoryList = data._embedded.orders;
      }
    );
  }

}
