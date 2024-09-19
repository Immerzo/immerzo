import { Component, OnInit, OnDestroy, Input, ViewChild, ElementRef, AfterViewChecked, OnChanges, SimpleChanges } from '@angular/core';
import { Observable, switchMap, timer, share, retry, Subject, takeUntil, combineLatest, map } from 'rxjs';

import { KeycloakService } from  '../keycloak/service/keycloak.service';
import { ProjectService } from  '../project/service/project.service';
import { UserService } from  '../user/service/user.service';
import { ChatService } from  '../chat/service/chat.service';
import { FileService } from  '../file/service/file.service';
import { Utils } from '../utils';

@Component({
  selector: 'app-chats-brand',
  templateUrl: './chats-brand.component.html',
  styleUrls: ['./chats-brand.component.css']
})
export class ChatsBrandComponent implements OnInit, OnDestroy, AfterViewChecked, OnChanges {

    @ViewChild('attachment') attachment: ElementRef;
    @ViewChild('scrollableDiv') scrollableDiv: ElementRef;

    @Input() isSocial: boolean;
    @Input() proj: any;
    @Input() chatCreator: any;
        
    currency = Utils.currency;
    formatTimestamp = Utils.formatTimestamp;
    formatDate = Utils.formatDate;
    compareTimestamps = Utils.compareTimestamps;

    categories: any = null;
    
    state: string = 'A';
    
    projects$: Observable<any[]>;
    
    creators$: Observable<any[]> = null;
    creator$: Observable<any> = null;
    chats$: Observable<any> = null;
    chatCreators$: Observable<any> = null;

    creator: any = '';
    message: string = '';
    file: File = null;
    fileContent = null;

    counter = 0;
    POLLING_INTERVAL = 1;
    private stopPolling = new Subject();

    downloading: number = null;

    triggerScroll = false;
    hasNewMsg = false;
  
    constructor(private keycloakService: KeycloakService,
                private projectService: ProjectService,
                private userService: UserService,
                private chatService: ChatService,
                private fileService: FileService) {
    }

    ngOnInit() {
        this.categories = this.projectService.categories;
        this.projects$ = this.projectService.getProjects(this.keycloakService.getUser().id, this.state, '', '');
        
        if (this.proj != null) {
            this.updateCreators();
        }
        
        if (this.chatCreator != null) {
            this.updateChat(this.chatCreator.id);
        }
        
        this.updateChatCreators();     
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

    ngOnChanges(changes: SimpleChanges) {
        if (changes['isSocial']) {
            this.updateChatCreators();
        }
    }
          
    getProjects(): void {
        this.projects$ = this.projectService.getProjects(this.keycloakService.getUser().id, this.state, '', '');
    }

    getUser(): any {
        return this.keycloakService.getUser();
    }
    
    sendMsg(creator_id): void {
        let chat = { 'project_id': this.proj? this.proj.id: null,
                     'brand_id': this.keycloakService.getUser().id,
                     'creator_id': creator_id,
                     'msg': this.message,
                     'sender': 'B'
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

    updateChatCreators() {
        this.chatCreators$ = this.chatService.getChatCreators(this.keycloakService.getUser().id, this.isSocial? 'S': 'C');
    }
  
    updateCreators(): void {
        if (this.proj.state == 'P') {
            this.creators$ = this.projectService.getCreators(this.proj.id);
        } else {
            this.creator$ = this.userService.getUser(this.proj.creator_id);
            this.updateChat(this.proj.creator_id);
        }
    }

    updateChat(creator_id: string): void {
        let u = this.keycloakService.getUser();
        this.userService.setUser(u.username, {}).subscribe(
            (response) => {
                this.chats$ = timer(0, 1000).pipe(
                    switchMap(() => {
                        if ((this.counter %= this.POLLING_INTERVAL) == 0) {
                            this.counter++;
                            return new Observable((observer) => {
                                let proj_id = this.proj? this.proj.id: null;
                                this.chatService.getChats(this.keycloakService.getUser().id, creator_id, proj_id).subscribe(
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
