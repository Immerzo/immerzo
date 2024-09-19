import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { Observable } from 'rxjs';
import { MatLegacyDialogRef as MatDialogRef } from "@angular/material/legacy-dialog";
import { MAT_LEGACY_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { KeycloakService } from  '../keycloak/service/keycloak.service';
import { ProjectService } from  '../project/service/project.service';
import { UserService } from  '../user/service/user.service';
import { OptionInterface } from "../option.interface";
import { CountryService } from "../country/service/country.service";
import { SOCIAL_PLATFORMS } from "../constants";

@Component({
	selector: 'app-edit-user',
	templateUrl: './edit-user.component.html',
	styleUrls: ['./edit-user.component.css']
})
export class EditUserComponent implements OnInit {

    @ViewChild('profile_picture') profile_picture: ElementRef;
    @ViewChild('profile_picture_area') profile_picture_area: ElementRef;
    
    @ViewChild('cover_image') cover_image: ElementRef;
    @ViewChild('cover_image_area') cover_image_area: ElementRef;

    SOCIAL_PLATFORMS = SOCIAL_PLATFORMS;
  
    user: any = null;
    handles: any = null;
    categories$: Observable<any[]>;
    platforms$: Observable<any[]>;

    countryOptions: OptionInterface[] = [];
  
    INDUSTRIES = [ 'MEDIA_AND_ENTERTAINMENT',
                   'RETAIL_AND_ECOMMERCE',
                   'TRANSPORTATION_AND_LOGISTICS',
                   'NON_PROFIT_AND_SOCIAL_SERVICES',
                   'REAL_ESTATE',
                   'MANUFACTURING',
                   'OTHER' ];
                             
    constructor(private dialogRef: MatDialogRef<EditUserComponent>,
        @Inject(MAT_LEGACY_DIALOG_DATA) public data: any,
        private keycloakService: KeycloakService,
        private projectService: ProjectService,
        private userService: UserService,
        private countryService: CountryService) {
        this.user = data.user;
        if (this.user.handles) {
            this.handles = JSON.parse(this.user.handles);
        }
    }

	ngOnInit() {
	   this.categories$ = this.projectService.getCategories();
	   this.platforms$ = this.projectService.getPlatforms();
       this.countryService
         .getCountryOptions()
         .subscribe((options: OptionInterface[]) => {
           this.countryOptions = options;
         });
	}

    onDrop(event: any, field_name: string, area_name: string) {
        event.preventDefault();
        const file = event.dataTransfer.files[0]; // Assuming a single image is dropped
        if (file) {
            this.handleFile(file, field_name);
        }
        this[area_name].nativeElement.style.backgroundColor = "";
        this[area_name].nativeElement.style.opacity = "";
    }

    onFileSelected(event: any, field_name: string) {
        const file = event.target.files[0];
        if (file) {
            this.handleFile(file, field_name);
        }
    }

    onDragOver(event: Event, area_name: string) {
        event.preventDefault();
        this[area_name].nativeElement.style.backgroundColor = "rgb(89, 86, 253)";
        this[area_name].nativeElement.style.opacity = "0.2";
    }

    onDragLeave(event: Event, area_name: string) {
        event.preventDefault();
        this[area_name].nativeElement.style.backgroundColor = "";
        this[area_name].nativeElement.style.opacity = "";
    }
  
    handleFile(file: File, field_name: string) {
        const reader = new FileReader();
        reader.onload = (e) => {
            this.user[field_name] = btoa(e.target.result as string);
        };
        reader.readAsBinaryString(file);
    }
    
    browse(event: Event, field_name) {
        event.preventDefault(); 
        this[field_name].nativeElement.click();
    }
    
    save() {
        this.user.handles = this.handles? JSON.stringify(this.handles): null;    
        this.userService.setUser(this.user.username, {
            'name': this.user.name,
            'description': this.user.description,
            'categories': this.user.categories,
            'platforms': this.user.platforms,
            'profile_picture': this.user.profile_picture,
            'cover_image': this.user.cover_image,
            'industry': this.user.industry,
            'url': this.user.url,
            'bid_min': this.user.bid_min,
            'bid_max': this.user.bid_max,
            'city': this.user.city,
            'country': this.user.country,
            'handles': this.user.handles
        }).subscribe(
            (response) => {
                this.keycloakService.setUser(this.user);
                this.dialogRef.close();
            },
            (error) => {
                console.error('error:', error);
            }
        );
    }

    close() {
        this.dialogRef.close();
    }
}
