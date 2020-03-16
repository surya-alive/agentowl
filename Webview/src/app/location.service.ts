import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  headers;
  options;
  trxUrl="https://kn28vl3hhl.execute-api.us-west-1.amazonaws.com/live/location";

  constructor(public http: HttpClient) {
    
  }

  setHeaderJson(){
  	let headers = new HttpHeaders();
	headers.append('Accept', 'application/json');
	return { headers: headers };
  }

  getTransaction(data){
  	return this.http.post<any>(this.trxUrl,data,this.setHeaderJson());
  }

}
