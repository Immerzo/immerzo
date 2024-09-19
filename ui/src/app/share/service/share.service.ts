import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { KeycloakService } from '../../keycloak/service/keycloak.service';
import { APP_URL } from '../../app.configs';

@Injectable({providedIn: 'root'})
export class ShareService {

    constructor(private keycloakService: KeycloakService, private http: HttpClient) { }

    getShare(project_id: string): Observable<any> {
        let url = `${APP_URL}/share?project_id=${project_id}`;
        return this.keycloakService.get(url);
    }

    setShare(data: any): Observable<any> {
        let url = `${APP_URL}/share`;        
        return this.keycloakService.post(url, data);
    }
    
    getSharedProject(share_id: string): Observable<any> {
        let url = `${APP_URL}/shared_project?share_id=${share_id}`;   
        return this.http.get(url);
    }
}
