import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { KeycloakService } from '../keycloak/service/keycloak.service';


@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

    dataSource: MatTableDataSource<any>;
    displayedColumns: string[] = ['name', 'value'];

    constructor(private keycloakService: KeycloakService) {
    }

    ngOnInit() {
      let data = [
        { name: 'Username', value: 'Hi' },
        { name: 'Language', value: 'English' },
        // Add more data as needed
      ];

      this.dataSource = new MatTableDataSource(data);
    }
}
