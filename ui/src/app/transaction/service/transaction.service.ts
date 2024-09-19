import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { KeycloakService } from '../../keycloak/service/keycloak.service';
import { APP_URL } from '../../app.configs';

@Injectable({providedIn: 'root'})
export class TransactionService {

    constructor(private keycloakService: KeycloakService) { }

    getTransactions(user_id: string): Observable<any> {
        let url = `${APP_URL}/transactions`;
        
        if (user_id) {
            url += `?user_id=${user_id}`;
        }
 
        return this.keycloakService.get(url);
    }
    
    setTransaction(data: any): Observable<any> {
        let url = `${APP_URL}/transaction`;        
        return this.keycloakService.post(url, data);
    }   
}
