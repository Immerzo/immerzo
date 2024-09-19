import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { KeycloakService } from '../../keycloak/service/keycloak.service';
import { APP_URL } from '../../app.configs';

@Injectable({providedIn: 'root'})
export class ProjectService {

    categories = {};

    constructor(private http: HttpClient,
                private keycloakService: KeycloakService) {
        this.getCategories().subscribe(
            cats => {
                cats.forEach(c => { this.categories[c.key] = c.value; });
            }, error => {
                console.error('error:', error);
            }
        );
    }

    getCategories(): Observable<any> {
        let url = `${APP_URL}/categories`;
        return this.http.get(url);
    }
    
    getProjects(brand_id: string, state: string, creator_id: string, title: string): Observable<any> {
        let url = `${APP_URL}/projects`;
        
        let first: boolean = true;
        
        if (brand_id) {
            url += `?brand_id=${brand_id}`;
            first = false;
        }
        
        if (state) {
            url += (first? '?': '&');
            url += `state=${state}`;
            first = false;
        }
 
        if (creator_id) {
            url += (first? '?': '&');
            url += `creator_id=${creator_id}`;
        }       

        if (title) {
            url += (first? '?': '&');
            url += `title=${title}`;
        }

        return this.keycloakService.get(url);
    }

    getInvitations(user_id: string, accepted?: boolean, title?: string): Observable<any> {
        let url = `${APP_URL}/invitations?creator_id=${user_id}`;
        
        if (typeof accepted !== 'undefined') {
            url += `&accepted=${accepted}`;
        }

        if (typeof title !== 'undefined') {
            url += `&title=${title}`;
        }
                
        return this.keycloakService.get(url);
    }

    getIdeas(): Observable<any> {
        let url = `${APP_URL}/ideas`;        
        return this.keycloakService.get(url);
    }
    
    getCreators(project_id: string): Observable<any[]> {
        let url = `${APP_URL}/creators?project_id=${project_id}`;
        return this.keycloakService.get(url);
    }
    
    getPlatforms(): Observable<any[]> {
        let url = `${APP_URL}/platforms`;
        return this.keycloakService.get(url);
    }
    
    setProject(data: any): Observable<any> {
        let url = `${APP_URL}/project`;        
        return this.keycloakService.post(url, data);
    }    

    getRsvp(project_id: string, creator_id: string): Observable<any> {
        let url = `${APP_URL}/rsvp?creator_id=${creator_id}&project_id=${project_id}`;
        return this.keycloakService.get(url);
    }
           
    setRsvp(project_id: string, accepted: boolean, creator_id: string, proposal: string, bid: number): Observable<any> {
        let url = `${APP_URL}/rsvp`;
        const json = { 'project_id': project_id,
                       'accepted': accepted,
                       'creator_id': creator_id,
                       'proposal': proposal,
                       'bid': bid }
        return this.keycloakService.post(url, json);
    }
    
    generateIdeas(objective: string): Observable<any> {
        let url = `${APP_URL}/generate_ideas`;        
        return this.keycloakService.post(url, { 'brand_id': this.keycloakService.getUser().id, 'objective': objective });
    }  
}
