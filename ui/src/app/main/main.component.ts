import { Component, OnInit, Inject } from '@angular/core';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ProjectService } from  '../project/service/project.service';
import { ShareService } from  '../share/service/share.service';
import { PaypalService } from '../paypal/service/paypal.service';
import { KeycloakService } from  '../keycloak/service/keycloak.service';
import { Utils } from '../utils';

@Component({
	selector: 'app-main',
	templateUrl: './main.component.html',
	styleUrls: ['./main.component.css'],
})


export class MainComponent implements OnInit {

    formatDate = Utils.formatDate;
    
    isSocial: boolean = false;
    
    share_id: string = null;
    shared_proj: any = null;
    
    categories: any = null;
        
    username: string = '';
    password: string = '';
	error: boolean = false;
    selected: string = '';

    idea: any = null; // idea as input for ProjectsBrandComponent
    proj: any = null;   // proj as input for ChatsBrandComponent
    chatCreator: any = null;   // chatCreator as input for ChatsBrandComponent

	constructor(private router: Router,
                private route: ActivatedRoute,
                private location: Location,
	            private keycloakService: KeycloakService,
	            private projectService: ProjectService,
	            private shareService: ShareService,
                private paypalService: PaypalService) {
	}

	ngOnInit() {
        this.categories = this.projectService.categories;

        this.route.queryParams.subscribe(params => { 
            const token = params['token'];
            if (token) {
                const payerID = params['PayerID'];
                if (!payerID) {
                    alert("Payment cancelled.");
                    // remove token GET parameter from paypal
                    this.router.navigate([], {
                        queryParams: { 'token': null },
                        queryParamsHandling: 'merge'
                    });
                    this.goBillingBrand();
                } else {
                    if (confirm("Confirm payment of invoice?")) {
                        this.paypalService.paypalCapture({ token, payerID }).subscribe(
                            response => {
                                console.log(response);
                                alert("Payment successfully made.");
                                // remove token GET parameters from paypal
                                this.router.navigate([], {
                                    queryParams: { 'token': null, 'PayerID': null },
                                    queryParamsHandling: 'merge'
                                });
                                this.goBillingBrand();
                            },
                            (error) => {
                                console.error('error:', error);
                            }
                        );
                    } else {
                        alert("Payment cancelled.");
                        // remove token GET parameters from paypal
                        this.router.navigate([], {
                            queryParams: { 'token': null, 'PayerID': null },
                            queryParamsHandling: 'merge'
                        });
                        this.goBillingBrand();
                    }
                }
            } else {
                this.share_id = params['share_id'];
                if (this.share_id != null) {
                    this.shareService.getSharedProject(this.share_id).subscribe(
                        (project) => {   
                            this.shared_proj = project;      
                        },
                        (error) => {
                            console.error('error:', error);
                        }
                    );
                }

                let u = this.keycloakService.getUser();
                if (u != null && this.selected == '') {
                    this.selected = (u.user_type == 'B'? 'DASH_BRAND': 'DASH_CREATOR');  
                }
            }
        });
  	}

    removeQueryParams(): void {
        // Remove query parameters using history.replaceState()
        const baseUrl = window.location.origin + window.location.pathname;
        history.replaceState({}, document.title, baseUrl);
    }
    
    login(): void {
        this.removeQueryParams();
        this.shared_proj = null;
        this.keycloakService.login(this.username, this.password).subscribe(
            (userResponse) => {
                this.password = '';
                this.error = false;
                this.selected = (this.keycloakService.getUser().user_type == 'B'? 'DASH_BRAND': 'DASH_CREATOR');             
            },
            (error) => {
                this.password = '';
                this.error = true;

                console.error('Login Error:', error);
            }
        );
    }

	logout(): void {
		this.keycloakService.logout().subscribe(
			(response) => {
                this.selected = '';
                this.username = '';
                this.error = false;
			},
			(error) => {
				console.error('error:', error);
			}
		);
	}

    navToLogin(): void {
        window.location.href = 'https://app.immerzo.io';
        this.location.replaceState('/');  // Replace the current history entry to prevent revisiting
    }
      
	print(): void {
		window.print();	
	}

	onClick(value) {
		this.selected = value;
		this.idea = null;
		this.proj = null;
		this.chatCreator = null;
	}
	
	goChat(proj: any, selected: string) {
	   this.proj = proj;
	   this.selected = selected;
	}
    
    goChatCreator(chatCreator: any) {
       this.chatCreator = chatCreator;
       this.selected = 'CHATS_BRAND';
    }

    goBillingBrand() {
        this.selected = 'BILLING_BRAND';
    }
    
    goSetupProject(idea:any) {
       this.idea = idea;
       this.selected = 'PROJECTS_BRAND';
    }
    	
	getUser() {
	    return this.keycloakService.getUser();
	}
}
