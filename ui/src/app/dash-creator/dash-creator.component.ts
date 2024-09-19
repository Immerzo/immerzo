import { Component, OnInit } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { Observable, combineLatest, map, switchMap } from 'rxjs';
import { EditUserComponent } from '../edit-user/edit-user.component';
import { ReadUserComponent } from '../read-user/read-user.component';
import { KeycloakService } from  '../keycloak/service/keycloak.service';
import { ProjectService } from  '../project/service/project.service';
import { UserService } from  '../user/service/user.service';
import { Utils } from '../utils';

@Component({
    selector: 'app-dash-creator',
    templateUrl: './dash-creator.component.html',
    styleUrls: ['./dash-creator.component.css']
})
export class DashCreatorComponent implements OnInit {

    currency = Utils.currency;
    formatDate = Utils.formatDate;

    title: string = '';

    categories: any = null;
    
    rsvp: any = null;
    proposal: string = '';
    bid: number = null;
    
    dash$: Observable<any>;

    invitations$: Observable<any[]>;
        
    constructor(private dialog: MatDialog,
                private keycloakService: KeycloakService,
                private projectService: ProjectService,
                private userService: UserService) { }

    ngOnInit() {
        this.categories = this.projectService.categories;
        this.updateDash();
    }

    updateDash() {
        this.dash$ = combineLatest([
                            this.projectService.getInvitations(this.getUser().id),
                            this.userService.getUserFamily(this.getUser())                           
                        ]).pipe(
                            map(([invitations, family]) => {
                                const user = family.find(u => u.id === this.getUser().id) || null;
                                return {invitations, family, user};
                            })
                        );
    }

    searchInvitations() {
        this.dash$ = this.dash$.pipe(
            switchMap(currentState => {
                return this.projectService.getInvitations(this.getUser().id, undefined, this.title).pipe(
                    map(newInvitations => {
                        return { ...currentState, invitations: newInvitations };
                    })
                );
            })
        );
    }
    
    respond(project_id: string, accepted: boolean) {
        this.projectService.setRsvp(project_id, accepted, this.getUser().id, this.proposal, this.bid).subscribe(
            (response) => {
                this.dash$ = this.dash$.pipe(
                    switchMap(currentState => {
                        return this.projectService.getInvitations(this.getUser().id).pipe(
                            map(newInvitations => {
                                return { ...currentState, invitations: newInvitations };
                            })
                        );
                    })
                );
            },
            (error) => {
                console.error('error:', error);
            }
        );          
    }
    
    getUser(): any {
        return this.keycloakService.getUser();
    }

    updateUser(u) {
        this.keycloakService.setUser(u);
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
    
    openReadUserDialog(brand_id) {                         
        this.dialog.open(ReadUserComponent, {
            disableClose: true,
            autoFocus: true,
            data: {
                user_id: brand_id
            }
        });     
    }
}
