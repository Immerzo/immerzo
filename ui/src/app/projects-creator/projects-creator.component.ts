import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { Observable } from 'rxjs';
import { ReadUserComponent } from '../read-user/read-user.component';
import { KeycloakService } from  '../keycloak/service/keycloak.service';
import { ProjectService } from  '../project/service/project.service';
import { ChatService } from  '../chat/service/chat.service';
import { FileService } from  '../file/service/file.service';
import { Utils } from '../utils';

@Component({
  selector: 'app-projects-creator',
  templateUrl: './projects-creator.component.html',
  styleUrls: ['./projects-creator.component.css']
})
export class ProjectsCreatorComponent implements OnInit {
    @Output() chat: EventEmitter<any> = new EventEmitter<any>();
    
    currency = Utils.currency;
    formatDate = Utils.formatDate;

    categories: any = null;

    myProjects = true;
    invitationState = 'true';
    projectState = '';
    
    invitations$: Observable<any[]>;
    projects$: Observable<any[]>;
    rsvp$: Observable<any>;
    projectFiles$: Observable<any[]>;

    proj: any = null;
    downloading: number = null;

    constructor(private dialog: MatDialog,
                private keycloakService: KeycloakService,
                private projectService: ProjectService,
                private chatService: ChatService,
                private fileService: FileService) { }

    ngOnInit() {
        this.categories = this.projectService.categories;
        this.projects$ = this.projectService.getProjects('', this.projectState, this.keycloakService.getUser().id, '');
        this.invitations$ = this.projectService.getInvitations(this.keycloakService.getUser().id, true);             
    }
    
    getRsvp(project): void {
        this.rsvp$ = this.projectService.getRsvp(project.id, this.keycloakService.getUser().id);
    }
    
    getProjects(): void {
        this.projects$ = this.projectService.getProjects('', this.projectState, this.keycloakService.getUser().id, '');
    }

    getInvitations(): void {
        this.invitations$ = this.projectService.getInvitations(this.keycloakService.getUser().id, this.invitationState == 'true');
    }
    
    openReadUserDialog(brand_id) {                         
        this.dialog.open(ReadUserComponent, {
            disableClose: true,
            autoFocus: true,
            data: {
                user_id: brand_id
            }
        });     
    }
    
    goChat(p) {
        this.chat.emit(p);
    }
    
    updateProjectFiles(project: any): void {
        this.projectFiles$ = this.chatService.getChatFiles(project.id, this.keycloakService.getUser().id);
    }
    
    downloadFile(file_id: number, filename: string) {
        this.downloading = file_id;
        this.fileService.download(file_id, filename).subscribe(
            () => {
                this.downloading = null;
            },
            error => {
                this.downloading = null;
                console.error('error:', error);
            }
        );
    }
}
