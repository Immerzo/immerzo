import { Component, OnInit, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { Observable, combineLatest, map } from 'rxjs';
import { EditUserComponent } from '../edit-user/edit-user.component';
import { ReadProjectComponent } from '../read-project/read-project.component';
import { ReadUserComponent } from '../read-user/read-user.component';
import { KeycloakService } from  '../keycloak/service/keycloak.service';
import { ProjectService } from  '../project/service/project.service';
import { UserService } from  '../user/service/user.service';
import { Idea } from '../project/service/idea.interface';

@Component({
	selector: 'app-dash-brand',
	templateUrl: './dash-brand.component.html',
	styleUrls: ['./dash-brand.component.css']
})
export class DashBrandComponent implements OnInit, OnChanges {
    @Input() isSocial: boolean;
    @Output() setupProject: EventEmitter<any> = new EventEmitter<any>();
    @Output() chatCreator: EventEmitter<any> = new EventEmitter<any>();
    
    showDash: boolean = true;

    dash$: Observable<any>;

    objective: string = null;
    ideas: Idea[] = [];

    OBJECTIVES: string[] = [ "Brand Awareness and Exposure",
                             "Partnerships and Collaboration",
                             "Immersive Product Experiences",
                             "Virtual Product Integration",
                             "Community Building and Engagement",
                             "Data Collection and Consumer Insights" ];

    pagination: number = 0;
    generating: boolean = false;
    readIndex: any = null;

    constructor(private dialog: MatDialog,
                private keycloakService: KeycloakService,
                private projectService: ProjectService,
                private userService: UserService) { }

	ngOnInit() {
        this.updateDash();
	}

    ngOnChanges(changes: SimpleChanges) {
        if (changes['isSocial']) {
            this.updateDash();
        }
    }
    	
	updateDash() {
        this.dash$ = combineLatest([
                            this.projectService.getProjects(this.getUser().id, 'A', '', ''),
                            this.projectService.getProjects(this.getUser().id, 'P', '', ''),
                            this.projectService.getProjects(this.getUser().id, 'T', '', ''),
                            this.projectService.getIdeas(),
                            this.userService.getUsers(this.isSocial? 'S': 'C', '', '', '', 15),
                            this.userService.getUserFamily(this.getUser())                           
                        ]).pipe(
                            map(([activeProjects, pendingProjects, completedProjects, ideas, creators, family]) => {
                                const user = family.find(u => u.id === this.getUser().id) || null;
                                return {activeProjects, pendingProjects, completedProjects, ideas, creators, family, user};
                            })
                        );
	}
	
    getUser(): any {
        return this.keycloakService.getUser();
    }
    
    updateUser(u) {
        this.keycloakService.setUser(u);
    }

    getProfileStatus(): number {
        let s = 0;
        if (this.getUser().profile_picture) {
            s += 15;
        }
        if (this.getUser().cover_image) {
            s += 5;
        }
        if (this.getUser().description) {
            s += 30;
        }
        if (this.getUser().name) {
            s += 20;
        }
        if (this.getUser().url) {
            s += 10;
        }
        if (this.getUser().industry) {
            s += 15;
        }        
        if (this.getUser().city) {
            s += 1;
        }
        if (this.getUser().country) {
            s += 4;
        }
        return s;
    }
    
    openEditUserDialog() {
        this.dialog.open(EditUserComponent, {
            disableClose: true,
            autoFocus: true,
            data: {
                user: { ...this.getUser() }
            }
        });     
    }

    openReadProjectDialog(project) {
        this.dialog.open(ReadProjectComponent, {
            disableClose: true,
            autoFocus: true,
            data: {
                project: project,
                chatCreator: this.chatCreator
            }
        });     
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
    
    showObjectives() {
        this.objective = "";
    }
    
    generateIdeas() {
        this.generating = true;
        this.projectService.generateIdeas(this.objective).subscribe(
            (response) => {
                this.generating = false;
                this.ideas = this.ideas.concat(JSON.parse(response.ideas)['ideas']);
            },
            (error) => {
                console.error('error:', error);
            }
        );          
    }
    
    prev() {
        if (this.pagination >= 2) {
            this.pagination -= 2;
        } else {
            this.objective = "";
            this.ideas = [];
        }
    }
    
    next() {
        if (this.pagination + 4 <= this.ideas.length) {
            this.pagination += 2;
        } else {
            this.generating = true;
            this.projectService.generateIdeas(this.objective).subscribe(
                (response) => {
                    this.generating = false;
                    this.ideas = this.ideas.concat(JSON.parse(response.ideas)['ideas']);
                    if (this.pagination + 4 <= this.ideas.length) {
                        this.pagination += 2;
                    }                    
                },
                (error) => {
                    console.error('error:', error);
                }
            );
        }
    }
    
    goSetupProject(p) {
        this.setupProject.emit(p);
    }
    
    goChatCreator(p) {
        this.chatCreator.emit(p);
    }
}
