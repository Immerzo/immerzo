import { Component, OnInit, Inject, EventEmitter } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef } from "@angular/material/legacy-dialog";
import { MAT_LEGACY_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { Observable } from 'rxjs';
import { ProjectService } from  '../project/service/project.service';
import { UserService } from  '../user/service/user.service';
import { SocialService } from  '../social/service/social.service';
import { Utils } from '../utils';
import { SOCIAL_PLATFORMS } from "../constants";

@Component({
	selector: 'app-read-user',
	templateUrl: './read-user.component.html',
	styleUrls: ['./read-user.component.css']
})
export class ReadUserComponent implements OnInit {
                           
    currency = Utils.currency;
    roundToNearestThousand = Utils.roundToNearestThousand;

    SOCIAL_PLATFORMS = SOCIAL_PLATFORMS;
  
    user_id: string = null;
    project: any = null;
    parent: any = null;
    creator: any = null;
    chatCreator: EventEmitter<any> = null;
    
    categories: any = null;
    handles: any = null;
    user$: any = null;
    rsvp$: any = null;
    followers$ = {};
  
    constructor(private dialogRef: MatDialogRef<ReadUserComponent>,
        @Inject(MAT_LEGACY_DIALOG_DATA) public data: any,
        private projectService: ProjectService,
        private userService: UserService,
        private socialService: SocialService) {
        this.user_id = data.user_id;
        this.project = data.project;
        this.parent = data.parent;
        this.creator = data.creator;
        this.chatCreator = data.chatCreator;
        this.categories = this.projectService.categories;
    }

	ngOnInit() {
        this.user$ = this.userService.getUser(this.user_id);
        this.user$.subscribe(user => {
            this.handles = JSON.parse(user.handles);
            for (const sp of this.SOCIAL_PLATFORMS) {
                let h = this.getJsonValue(this.handles, sp);
                if (h) {
                    if (sp == 'YOUTUBE') {
                        h = this.addAt(this.getHandleFromUrl(h));
                    }
                    this.followers$[sp] = this.socialService.getFollowers(sp, h);
                }
            }     
        });
	    if (this.project != null) {
	        this.rsvp$ = this.projectService.getRsvp(this.project.id, this.user_id);
	    }
	}
    
    close() {
        this.dialogRef.close();
    }

    activateProject(): void {
        if (confirm("Are you sure you want to activate the project with this Creator?")) {
            this.projectService.setProject({
                'id': this.project.id,
                'creator_id': this.user_id,
                'state': 'A'
            }).subscribe(
                (response) => {
                    alert("Project is now active.");
                    this.parent.proj = null;
                    this.parent.projState = null;
                    this.parent.creators$ = null;
                    this.parent.creator$ = null;                    
                    this.close();
                },
                (error) => {
                    console.error('error:', error);
                }
            );
        }
    }

    getJsonValue(data, key) {
        if (!data || data[key] === undefined) {
            return "";
        } else {
            return data[key];     
        }
    }

    addHttp(url: string, prefix: string, suffix?: string): string {
        if (!url || url.startsWith('http')) {
            return url;
        } else if (suffix === undefined) {
            return prefix + url;
        } else {
            return prefix + url + suffix;
        }
    }
    
    addAt(handle: string): string {
        if (!handle || handle.startsWith('@')) {
            return handle;
        } else {
            return '@' + handle;
        }
    }
        
    stripAt(handle: string): string {
        if (handle && handle.startsWith('@')) {
            return handle.substring(1);
        } else {
            return handle;
        }
    }
    
    getHandleFromUrl(url: string): string {
        if (!url) {
            return '';
        } 

        if (url.endsWith('/')) {
            // strip final slash
            url = url.substring(0, url.length - 1);
        }

        const parts = url.split('/');
        return parts[parts.length - 1];
    }
    
    goChat() {
        this.chatCreator.emit(this.creator);
    }
}
