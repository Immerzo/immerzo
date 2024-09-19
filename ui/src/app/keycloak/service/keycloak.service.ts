import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { APP_URL } from '../../app.configs';
import { Utils } from '../../utils';

@Injectable({providedIn: 'root'})
export class KeycloakService {

    ACCESS_TOKEN: string = 'ACCESS_TOKEN';
    REFRESH_TOKEN: string = 'REFRESH_TOKEN';
    EXPIRY: string = 'EXPIRY';
    REFRESH_EXPIRY: string = 'REFRESH_EXPIRY';

    getSessionObject = Utils.getSessionObject;
    getSessionString = Utils.getSessionString;
    getSessionNumber = Utils.getSessionNumber;
    
    setSessionObject = Utils.setSessionObject;
    setSessionString = Utils.setSessionString;
    setSessionNumber = Utils.setSessionNumber;
    
    clearSession = Utils.clearSession;

    supportScript: HTMLScriptElement | null = null;

    getUser(): any {
        return this.getSessionObject('USER');
    }
    
    setUser(user: any): void {
        this.setSessionObject('USER', user);
    }
      
    constructor(private http: HttpClient) { }

    login(username: string, password: string): Observable<any> {
        const now = Date.now();
        const login_url = `${APP_URL}/login`;
        const json = { username, password }
        
        return new Observable((observer) => {
            this.http.post(login_url, json, { observe: 'response' }).subscribe(
            (response: HttpResponse<any>) => {
                if (response.status === 200) {

                    // activate support board
                    if (this.supportScript == null) {
                        this.supportScript = document.createElement('script');
                        this.supportScript.src = "https://cloud.board.support/account/js/init.js?id=734879522";
                        this.supportScript.id = "chat-init";
                        this.supportScript.async = true;
                        this.supportScript.defer = true;
                        document.head.appendChild(this.supportScript);
                    }
                
                    this.setSessionString(this.ACCESS_TOKEN, response.body.access_token);
                    this.setSessionString(this.REFRESH_TOKEN, response.body.refresh_token);

                    // set to 5s early to avoid being invalid when used
                    this.setSessionNumber(this.EXPIRY, now + (response.body.expires_in - 5) * 1000);
                    this.setSessionNumber(this.REFRESH_EXPIRY, now + (response.body.refresh_expires_in - 5) * 1000);

                    const encodedUsername = encodeURIComponent(username);
                    const user_url = `${APP_URL}/user?username=${encodedUsername}`;

                    const headers = new HttpHeaders({ 'Authorization': `Bearer ${response.body.access_token}` });
                    this.http.get(user_url, { headers }).subscribe((data) => {
                        this.setUser(data);
                        observer.next(data); // Pass the response to the observer
                        observer.complete(); // Complete the observable
                    }, (error) => {
                        // Handle any errors that occurred during the GET request
                        console.error('GET request error', error);
                        observer.error(error); // Pass the error to the observer
                    });
                }
            }, (error) => {
                observer.error(error);
            });
        });
    }

    logout(): Observable<any> {
        const url = `${APP_URL}/logout`;
        const json = { 'refresh_token': this.getSessionString(this.REFRESH_TOKEN) }

        this.clearSession(this.ACCESS_TOKEN);
        this.clearSession(this.REFRESH_TOKEN);
        this.clearSession(this.EXPIRY);
        this.clearSession(this.REFRESH_EXPIRY);
        this.clearSession('USER');

        return this.http.post(url, json, {observe: 'response'});
    }

    // Return access token.  Automatically refresh if already expired
    getAccessToken(): Observable<string> {
        const now = Date.now();
        const expiry: number = this.getSessionNumber(this.EXPIRY);
        const refreshExpiry: number = this.getSessionNumber(this.REFRESH_EXPIRY);        
        if (now >= expiry && now < refreshExpiry) {
            // refresh token is still valid.  Use it to get a new access token
            const url = `${APP_URL}/refresh`;
            const json = {'refresh_token': this.getSessionString(this.REFRESH_TOKEN)}
            return this.http.post(url, json, {observe: 'response'}).pipe(
                map((response: any) => {
                    if (response.status === 200) {
                        this.setSessionString(this.ACCESS_TOKEN, response.body.access_token);
                        this.setSessionNumber(this.EXPIRY, now + (response.body.expires_in - 5) * 1000);
                        console.log("Access token renewed");
                    }
                    return response.body.access_token;
                })
            );
        } else {
            return of(this.getSessionString(this.ACCESS_TOKEN));
        }
    }
    
    get(url: string, blob?: boolean): Observable<any> {
        return new Observable((observer) => {
            this.getAccessToken().subscribe((accessToken) => {
                const h = new HttpHeaders({ 'Authorization': `Bearer ${accessToken}` });
                let options = { headers: h }
                if (blob) {
                    options['responseType'] = "blob"
                }
    
                this.http.get(url, options).subscribe((data) => {
                    observer.next(data); // Pass the response to the observer
                    observer.complete(); // Complete the observable
                }, (error) => {
                    // Handle any errors that occurred during the GET request
                    console.error('GET request error', error);
                    observer.error(error); // Pass the error to the observer
                });
            });
        });
    }
    
    post(url: string, requestBody: any): Observable<any> {
        return new Observable((observer) => {
            this.getAccessToken().subscribe((accessToken) => {
                // Use the updated access token here    
                // Make an HTTP POST request using the access token
                const headers = { 'Authorization': `Bearer ${accessToken}` };
    
                this.http.post(url, requestBody, { headers }).subscribe((data) => {
                    observer.next(data); // Pass the response to the observer
                    observer.complete(); // Complete the observable
                }, (error) => {
                    // Handle any errors that occurred during the POST request
                    console.error('POST request error', error);
                    observer.error(error); // Pass the error to the observer
                });
            });
        });
    }
    
    delete(url: string): Observable<any> {
        return new Observable((observer) => {
            this.getAccessToken().subscribe((accessToken) => {
                const headers = { 'Authorization': `Bearer ${accessToken}` };
    
                this.http.delete(url, { headers }).subscribe((data) => {
                    observer.next(data); // Pass the response to the observer
                    observer.complete(); // Complete the observable
                }, (error) => {
                    // Handle any errors that occurred during the DELETE request
                    console.error('DELETE request error', error);
                    observer.error(error); // Pass the error to the observer
                });
            });
        });
    }
    
    downloadUrl(url): void {
        this.http.get(url, { responseType: 'blob' }).subscribe((data: Blob) => {
            const download_url = window.URL.createObjectURL(data);
            const a = document.createElement('a');
            a.href = download_url;
            const parts = url.split('/');
            a.download = parts[parts.length - 1];
            a.click();
            window.URL.revokeObjectURL(download_url);        
        });
    }
}
