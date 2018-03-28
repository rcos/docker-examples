import { Injectable }              from '@angular/core';
import { Http, Response }          from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class APIService {
  constructor (private http: Http) {}

  get (path: string, params: Object = {}): Promise<Object[]> {
    return this.http.get(`${this.baseUrl()}`)
                    .toPromise()
                    .then(this.extractData)
                    .catch(this.handleError);
  }

  post (path: string, body: Object = {}): Promise<Object[]> {
    return this.http.post(`${this.baseUrl()}/${path}`, body)
                    .toPromise()
                    .then(this.extractData)
                    .catch(this.handleError);
  }

  protected extractData (response: Response) : Object[] {
    return response.json() || [];
  }

  private objectToQueryString (params: Object) {
    return Object.keys(params).reduce((prev, key, i) => (
      `${prev}${i!==0?'&':''}${key}=${params[key]}`
    ), '');
  }

  protected handleError (error: Response | any) {
    let errorMessage: string = `API Error - ${error}`
    console.error(errorMessage);
    return Promise.reject(errorMessage);
  }

  protected baseUrl () : string {
    return `http://${document.location.hostname}:5000`;
  }
}
