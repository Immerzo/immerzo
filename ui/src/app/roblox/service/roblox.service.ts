import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { KeycloakService } from '../../keycloak/service/keycloak.service';
import { APP_URL } from '../../app.configs';

@Injectable({providedIn: 'root'})
export class RobloxService {

  constructor(private keycloakService: KeycloakService) { }


  getAnalytics(game_id: string, action: string, period: string, object_id = ''): Observable<any> {
    let url = `${APP_URL}/analytics?game_id=${game_id}&action=${action}&period=${period}`;
    if (object_id !== '') {
      url += `&object_id=${object_id}`;
    }
    return this.keycloakService.get(url);
  }

  getObjectIds(game_id: string, action: string): Observable<any> {
    const url = `${APP_URL}/get_object_ids?game_id=${game_id}&action=${action}`;
    return this.keycloakService.get(url);
  }
}
