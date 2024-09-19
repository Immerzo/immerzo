import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { KeycloakService } from '../../keycloak/service/keycloak.service';
import { APP_URL } from '../../app.configs';

@Injectable({providedIn: 'root'})
export class InvoiceService {

    constructor(private keycloakService: KeycloakService) {
    }
    
    getInvoices(brand_id: string, state: string): Observable<any> {
        let url = `${APP_URL}/invoices`;
        
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

        return this.keycloakService.get(url);
    }
    
    setInvoice(data: any): Observable<any> {
        let url = `${APP_URL}/invoice`;        
        return this.keycloakService.post(url, data);
    } 
}
