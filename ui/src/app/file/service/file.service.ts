import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { KeycloakService } from '../../keycloak/service/keycloak.service';
import { APP_URL } from '../../app.configs';

@Injectable({providedIn: 'root'})
export class FileService {

    constructor(private keycloakService: KeycloakService) { }

    download(file_id: number, filename: string): Observable<void> {
        return new Observable((observer) => {
            const url = `${APP_URL}/download?file_id=${file_id}`;
            this.keycloakService.get(url, true).subscribe((data: Blob) => {
                const download_url = window.URL.createObjectURL(data);
                const a = document.createElement('a');
                a.href = download_url;
                a.download = filename;
                a.click();
                window.URL.revokeObjectURL(download_url);
                observer.next();
                observer.complete();
            }, (error) => {
                console.error('error:', error);
                observer.error('Error downloading file');
            }, () => {
                    observer.complete();
            });
        });
    }
}
