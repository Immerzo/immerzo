import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { APP_URL } from '../../app.configs';

@Injectable({providedIn: 'root'})
export class SocialService {

  constructor(private http: HttpClient) { }

  getFollowers(social_platform: string, handle: string): Observable<any> {
  
    let url = `${APP_URL}/followers?social_platform=${social_platform}&&handle=${handle}`;            
    return this.http.get(url);
  }
}
