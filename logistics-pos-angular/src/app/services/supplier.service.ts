import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { RemoteService } from './remote.service';
import { environmentCommon } from '../../environments/environment.common';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {
  private apiUrl = environment.baseURL;
  private api = environmentCommon.api;
  constructor(private http: HttpClient, private remote:RemoteService) { }

  productCategory(data: any) {
    return this.remote.sendRequest('GET', this.api.supplier.CATEGORY,data);
  }

}