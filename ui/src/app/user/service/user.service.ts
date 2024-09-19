import { Injectable } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import { KeycloakService } from '../../keycloak/service/keycloak.service';
import { APP_URL } from '../../app.configs';

@Injectable({providedIn: 'root'})
export class UserService {

	public readonly BINARY = 'application/octet-stream';
	public readonly IMAGE = 'image/jpeg';
	
	constructor(private keycloakService: KeycloakService) { }

	getUser(id: string): Observable<any> {
    	let url = `${APP_URL}/user`;
    	if (id) {
            url += `?id=${id}`;
    	}
    	return this.keycloakService.get(url);
  	}

    getUsers(user_type: string, category: string, platform: string, name: string, limit?: number): Observable<any> {
        let url = `${APP_URL}/users?user_type=${user_type}`;

        if (category) {
            url += `&category=${category}`;
        }

        if (platform) {
            url += `&platform=${platform}`;
        }

        if (name) {
            url += `&name=${name}`;
        }

        if (limit) {
            url += `&limit=${limit}`;
        }
                                                
        return this.keycloakService.get(url);
    }

    getUserFamily(user): Observable<any> {
        const parent_id = (user.parent_id == null)? user.id: user.parent_id;  
        const parent = this.keycloakService.get(`${APP_URL}/user?id=${parent_id}`);
        const children = this.keycloakService.get(`${APP_URL}/users?parent_id=${parent_id}`);
        return forkJoin([parent, children]).pipe(
            map(([parent, children]) => [parent, ...children])
        );
    }
                  	
  	setUser(username: string, data: any): Observable<any> {
  	    let url = `${APP_URL}/user/${username}`;
  	    return this.keycloakService.post(url, data);
  	}
}
