import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { Observable, combineLatest, map } from 'rxjs';
import { ReadUserComponent } from '../read-user/read-user.component';
import { KeycloakService } from  '../keycloak/service/keycloak.service';
import { ProjectService } from  '../project/service/project.service';
import { ChatService } from  '../chat/service/chat.service';
import { UserService } from  '../user/service/user.service';
import { FileService } from  '../file/service/file.service';
import { ShareService } from  '../share/service/share.service';
import { Utils } from '../utils';

@Component({
  selector: 'app-projects-brand',
  templateUrl: './projects-brand.component.html',
  styleUrls: ['./projects-brand.component.css']
})
export class ProjectsBrandComponent implements OnInit {
    @Input() idea: any;
    
    @Output() chat: EventEmitter<any> = new EventEmitter<any>();
    
    currency = Utils.currency;
    formatDate = Utils.formatDate;

    title: string = '';
    
    categories: any = null;

    state: string = '';
    
    projects$: Observable<any[]>;
    creators$: Observable<any[]>;
    
    projectFiles$: Observable<any[]>;
        
    creator$: Observable<any>;
  
    categories$: Observable<any[]>;
    platforms$: Observable<any[]>;
        
          
    proj: any = null;
    projState: string = null;

    downloading: number = null;

    constructor(private dialog: MatDialog,
                private keycloakService: KeycloakService,
                private projectService: ProjectService,
                private chatService: ChatService,
                private userService: UserService,
                private fileService: FileService,
                private shareService: ShareService) {
    }

    ngOnInit() {
        this.categories = this.projectService.categories;
        this.projects$ = this.projectService.getProjects(this.keycloakService.getUser().id, this.state, '', '');           

        this.categories$ = this.projectService.getCategories();
        this.platforms$ = this.projectService.getPlatforms();
    }
    
    updateProjects(): void {
        this.projects$ = this.projectService.getProjects(this.keycloakService.getUser().id, this.state, '', this.title);
    }
    
    updateCreators(project: any): void {
        if (project.state == 'P') {
            this.creators$ = this.projectService.getCreators(project.id);
        } else {
            this.creator$ = combineLatest([
                                this.userService.getUser(project.creator_id),
                                this.projectService.getRsvp(project.id, project.creator_id)]).pipe(
                                map(([user, rsvp]) => ({user, rsvp})));
        }
    }

    updateProjectFiles(project: any): void {
        this.projectFiles$ = this.chatService.getChatFiles(project.id, project.creator_id);
    }
        
    updateState(): void {
        if (confirm("Are you sure you want to change the Project Status?")) {
            this.projectService.setProject({
                'id': this.proj.id,
                'state': this.proj.state
            }).subscribe(
                (response) => {
                    this.projState = this.proj.state;
                    alert("Project Status changed.");
                },
                (error) => {
                    console.error('error:', error);
                }
            );
        
        } else {
            setTimeout(() => {
                this.proj.state =  this.projState;
            });
        }
    }
    
    openReadUserDialog(user_id, project) {                         
        this.dialog.open(ReadUserComponent, {
            disableClose: true,
            autoFocus: true,
            data: {
                user_id: user_id,
                project: project,
                parent: this
            }
        });     
    }
    
    goChat(p) {
        this.chat.emit(p);
    }
    
    initIdea() {
        this.idea = {};
        this.idea['title'] = "";
        this.idea['description'] = "";
        this.idea['categories'] = [];
        this.idea['platforms'] = [];
        this.idea['budget'] = null;
    }
    
    createProject() {
        if (!this.idea['title'] || !this.idea['description']) {
            alert("Please provide title and description for the new project.");
        } else {
            let projectData = { brand_id: this.keycloakService.getUser().id,
                                brand_name: this.keycloakService.getUser().name,
                                title: this.idea['title'],
                                description: this.idea['description'],
                                categories: this.idea['categories'],
                                platforms: this.idea['platforms'],
                                budget: this.idea['budget'],
                                state: 'P'
                              }
            this.projectService.setProject(projectData).subscribe(
                (v) => {
                    alert("Project created.");
                    this.updateProjects();
                    this.idea = null;
                },
                (error) => {
                    console.error('Error fetching:', error);
                }
            );
        }   
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
    
    copyToClipboard(text: string): void {
        // Create a temporary textarea element to hold the text
        const textarea = document.createElement('textarea');
        textarea.value = text;
    
        // Set the element to be out of the viewport to ensure that it doesn't disrupt the layout
        textarea.style.position = 'fixed';
        textarea.style.left = '-999999px';
    
        document.body.appendChild(textarea);
    
        // Select the text within the textarea
        textarea.select();
        textarea.setSelectionRange(0, textarea.value.length);
    
        // Execute the copy command
        document.execCommand('copy');
    
        // Clean up - remove the textarea from the DOM
        document.body.removeChild(textarea);
    }
    
    copyLink(project_id: string) {
        this.shareService.getShare(project_id).subscribe(
            (u) => {
                let link = `https://app.immerzo.io/?share_id=${u.uuid}`;
                this.copyToClipboard(link);
                alert("Project shareable link [" + link + "] copied to clipboard.");
            },
            (error) => {
                if (error.status == 404) {
                    // create link
                   this.shareService.setShare({ project_id: project_id }).subscribe(
                        (v) => {
                            let link = `https://app.immerzo.io/?share_id=${v.uuid}`;
                            this.copyToClipboard(link);
                            alert("Project shareable link [" + link + "] copied to clipboard.");
                        },
                        (error) => {
                            console.error('error:', error);
                        }
                    );                 
                } else {
                    console.error('error:', error);
                }
            }
        );
    }
}
