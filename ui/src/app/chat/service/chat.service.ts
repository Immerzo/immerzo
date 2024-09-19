import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { KeycloakService } from '../../keycloak/service/keycloak.service';
import { APP_URL } from '../../app.configs';

@Injectable({providedIn: 'root'})
export class ChatService {

    constructor(private keycloakService: KeycloakService) { }

    getChats(brand_id: string, creator_id: string, project_id?: string): Observable<any> {
        let url = `${APP_URL}/chats?brand_id=${brand_id}&creator_id=${creator_id}`;
        
        if (project_id) {
            url += `&project_id=${project_id}`;
        }
        
        return this.keycloakService.get(url);
    }

    setChat(data: any): Observable<any> {
        let url = `${APP_URL}/chat`;        
        return this.keycloakService.post(url, data);
    }

    getChatBrands(creator_id: string): Observable<any> {
        let url = `${APP_URL}/chat_brands?creator_id=${creator_id}`;
        return this.keycloakService.get(url);
    }
        
    getChatCreators(brand_id: string, user_type: string): Observable<any> {
        let url = `${APP_URL}/chat_creators?brand_id=${brand_id}&user_type=${user_type}`;
        return this.keycloakService.get(url);
    }
    
    getChatFiles(project_id: string, creator_id?: string): Observable<any> {
        let url = `${APP_URL}/chat_files?project_id=${project_id}`;
        
        if (creator_id) {
            url += `&creator_id=${creator_id}`;
        }
      
        return this.keycloakService.get(url);
    }
    
    deleteChat(chat_id: number): Observable<any> {
        let url = `${APP_URL}/chat/${chat_id}`;   
        return this.keycloakService.delete(url);
    }
}
