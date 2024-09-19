import { Component, OnInit, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { Observable } from 'rxjs';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { ReadUserComponent } from '../read-user/read-user.component';
import { ProjectService } from  '../project/service/project.service';
import { UserService } from  '../user/service/user.service';
import { Utils, NumberFormatterPipe } from '../utils';

@Component({
	selector: 'app-creators',
	templateUrl: './creators.component.html',
	styleUrls: ['./creators.component.css'],
	providers: [NumberFormatterPipe]
})
export class CreatorsComponent implements OnInit, OnChanges {
    @Input() isSocial: boolean;
    @Output() chatCreator: EventEmitter<any> = new EventEmitter<any>();

    currency = Utils.currency;
    
    searchStr: string = '';

    categories$: Observable<any[]>;
    platforms$: Observable<any[]>;
    creators$: Observable<any[]>;
        
    cat: any = '';
    plat: any = '';
    
	constructor(private dialog: MatDialog,
	            private projectService: ProjectService,
	            private userService: UserService) { }

	ngOnInit() {
       this.categories$ = this.projectService.getCategories();
       this.platforms$ = this.projectService.getPlatforms();
       this.updateCreators();
	}

    ngOnChanges(changes: SimpleChanges) {
        if (changes['isSocial']) {
            this.updateCreators();
        }
    }

	updateCreators(): void {
	   this.creators$ = this.userService.getUsers(this.isSocial? 'S': 'C', this.cat, this.plat, this.searchStr, 200);
	}
	
	goChatCreator(p) {
        this.chatCreator.emit(p);
    }

    openReadUserDialog(creator) {
        this.dialog.open(ReadUserComponent, {
            disableClose: true,
            autoFocus: true,
            data: {
                user_id: creator.id,
                creator: creator,
                chatCreator: this.chatCreator
            }
        });     
    }    
}
