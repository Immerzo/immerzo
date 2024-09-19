import { Component, OnInit, OnDestroy, Input, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { Observable, switchMap, timer, share, retry, Subject, takeUntil, combineLatest, map } from 'rxjs';
import { KeycloakService } from  '../keycloak/service/keycloak.service';
import { ProjectService } from  '../project/service/project.service';
import { UserService } from  '../user/service/user.service';
import { ChatService } from  '../chat/service/chat.service';
import { FileService } from  '../file/service/file.service';
import { Utils } from '../utils';

@Component({
  selector: 'app-chats-creator',
  templateUrl: './chats-creator.component.html',
  styleUrls: ['./chats-creator.component.css']
})
export class ChatsCreatorComponent implements OnInit, OnDestroy, AfterViewChecked {

    @ViewChild('attachment') attachment: ElementRef;
    @ViewChild('scrollableDiv') scrollableDiv: ElementRef;

    @Input() proj: any;
    
    currency = Utils.currency;
    formatTimestamp = Utils.formatTimestamp;
    formatDate = Utils.formatDate;
    compareTimestamps = Utils.compareTimestamps;

    categories: any = null;
    
    myProjects = true;
    invitationState = 'true';
    projectState = 'A';
    
    invitations$: Observable<any[]>;
    projects$: Observable<any[]>;

    brand$: Observable<any[]> = null;
    chats$: Observable<any> = null;
    chatBrand: any;
    chatBrands$: Observable<any> = null;
    
    message: string = '';
    file: File = null;
    fileContent = null;

    counter = 0;
    POLLING_INTERVAL = 5;
    private stopPolling = new Subject();

    downloading: number = null;

    triggerScroll = false;
    hasNewMsg = false;

    constructor(private keycloakService: KeycloakService,
                private projectService: ProjectService,
                private userService: UserService,
                private chatService: ChatService,
                private fileService: FileService) { }

    ngOnInit() {
        this.categories = this.projectService.categories;
        this.projects$ = this.projectService.getProjects('', this.projectState, this.keycloakService.getUser().id, '');
        this.invitations$ = this.projectService.getInvitations(this.keycloakService.getUser().id, true);             
        if (this.proj != null) {
            this.updateBrand();
        } 
        this.chatBrands$ = this.chatService.getChatBrands(this.keycloakService.getUser().id); 
    }

    ngOnDestroy() {
        this.stopPolling.next(void 0);
    }

    ngAfterViewChecked() {
        if (this.triggerScroll && this.scrollableDiv) {
            this.scrollableDiv.nativeElement.scrollTop = this.scrollableDiv.nativeElement.scrollHeight;
            this.triggerScroll = false;
        }
    }
    
    getProjects(): void {
        this.projects$ = this.projectService.getProjects('', this.projectState, this.keycloakService.getUser().id, '');
    }

    getInvitations(): void {
        this.invitations$ = this.projectService.getInvitations(this.keycloakService.getUser().id, this.invitationState == 'true');
    }

    getUser(): any {
        return this.keycloakService.getUser();
    }
        
    updateBrand(): void {
        this.brand$ = this.userService.getUser(this.proj.brand_id);
        this.updateChat(this.proj.brand_id);
    }

    updateChat(brand_id: string): void {
        let u = this.keycloakService.getUser();
        this.userService.setUser(u.username, {}).subscribe(
            (response) => {
                this.chats$ = timer(0, 1000).pipe(
                    switchMap(() => {
                        if ((this.counter %= this.POLLING_INTERVAL) == 0) {
                            this.counter++;
                            return new Observable((observer) => {
                                let proj_id = this.proj? this.proj.id: null;
                                this.chatService.getChats(brand_id, this.keycloakService.getUser().id, proj_id).subscribe(
                                (data) => {
                                    observer.next(data);
                                    observer.complete();
                                    if (this.hasNewMsg) {
                                        this.triggerScroll = true;
                                        this.hasNewMsg = false;
                                    }
                                });
                            });
                        } else {
                            this.counter++;
                            return this.chats$;
                        }
                    }),
                    retry(),
                    share(),
                    takeUntil(this.stopPolling)
                );
            },
            (error) => {
                console.error('error:', error);
            }
        );
    }
    
    sendMsg(brand_id): void {
        let chat = { 'project_id': this.proj? this.proj.id: null,
                     'brand_id': brand_id,
                     'creator_id': this.keycloakService.getUser().id,
                     'msg': this.message,
                     'sender': 'C'
                   };

        if (this.file) {
            chat['name'] = this.file.name;
            chat['file'] = this.fileContent;
        }
        
        this.chatService.setChat(chat).subscribe(
            (response) => {
                this.message = '';
                this.file = null;
                this.counter = 0;
                this.hasNewMsg = true;
            },
            (error) => {
                console.error('error:', error);
            }
        );
    }
    
    browse(event: Event) {
        event.preventDefault(); 
        this.attachment.nativeElement.value = '';
        this.attachment.nativeElement.click();
    }
    
    onFileSelected(event: any) {
        this.file = event.target.files[0];
        if (this.file) {
            this.handleFile();
        }
    }

    handleFile() {
        const reader = new FileReader();
        reader.onload = (e) => {
            this.fileContent = btoa(e.target.result as string);
        };
        reader.readAsBinaryString(this.file);
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
        
    clearAttachment(): void {
        this.file = null;
        this.fileContent = null;
    }
    
    deleteChat(chat_id: number): void {
        if (confirm("Are you sure you want to remove this message?")) {
            this.chatService.deleteChat(chat_id).subscribe(() => {
                console.log("chat removed.");
            }, (error) => {
                console.error('error', error);
            });
        }
    }
}
