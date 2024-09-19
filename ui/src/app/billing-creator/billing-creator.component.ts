import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { KeycloakService } from  '../keycloak/service/keycloak.service';
import { InvoiceService } from  '../invoice/service/invoice.service';
import { Utils, NumberFormatterPipe } from '../utils';

@Component({
    selector: 'app-billing-creator',
    templateUrl: './billing-creator.component.html',
    styleUrls: ['./billing-creator.component.css'],
    providers: [NumberFormatterPipe]
})
export class BillingCreatorComponent implements OnInit {

    currency = Utils.currency;
    formatDate = Utils.formatDate;
    
    invoice: any = "";
    
    invoices$: Observable<any[]>;

    constructor(private keycloakService: KeycloakService,
                private invoiceService: InvoiceService) { }

    ngOnInit() {
        this.getInvoices();
    }
    
    getInvoices() {
        this.invoices$ = this.invoiceService.getInvoices(this.keycloakService.getUser().id, 'A');
    }
}
