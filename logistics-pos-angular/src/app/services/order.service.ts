import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { RemoteService } from './remote.service';
import { environmentCommon } from '../../environments/environment.common';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = environment.baseURL;
  private api = environmentCommon.api;
  constructor(private http: HttpClient, private remote:RemoteService) { }

  orderType(data: any) {
    return this.remote.sendRequest('GET', this.api.order.ORDER_TYPE,data);
  }
  getCustomer(data: any) {
    return this.remote.sendRequest('GET', this.api.order.CUSTOMER,data);
  }

}