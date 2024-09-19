import { Component, OnInit, Inject, EventEmitter } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef } from "@angular/material/legacy-dialog";
import { MAT_LEGACY_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { Observable } from 'rxjs';
import { ProjectService } from  '../project/service/project.service';
import { UserService } from  '../user/service/user.service';
import { Utils } from '../utils';

@Component({
	selector: 'app-read-project',
	templateUrl: './read-project.component.html',
	styleUrls: ['./read-project.component.css']
})
export class ReadProjectComponent implements OnInit {

    currency = Utils.currency;

    categories: any = null;
    
    project: any = null;
    creator: any = null;
    chatCreator: EventEmitter<any> = null;
  
    constructor(private dialogRef: MatDialogRef<ReadProjectComponent>,
        @Inject(MAT_LEGACY_DIALOG_DATA) public data: any,
        private projectService: ProjectService,
        private userService: UserService) {
        this.project = data.project;
        this.chatCreator = data.chatCreator;
    }

	ngOnInit() {
	    this.categories = this.projectService.categories;

        this.userService.getUser(this.project.creator_id).subscribe(
            (response) => {
                this.creator = response;
            },
            (error) => {
                console.error('error:', error);
            }
        );          
	}
    
    close() {
        this.dialogRef.close();
    }
    
    goChat() {
        this.chatCreator.emit(this.creator);
    }
}
