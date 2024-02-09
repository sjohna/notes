import { Injectable } from '@angular/core';
import {BehaviorSubject, distinctUntilChanged} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environment} from "../environment/environment";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedIn$$ = new BehaviorSubject<boolean>(false);
  public loggedInChanged$ = this.loggedIn$$.pipe(distinctUntilChanged());

  constructor(
    private http: HttpClient,
  ) { }

  login(userName: string, password: string) {
    this.http.post(environment.api + '/auth/login', {
      userName,
      password
    });
  }
}
