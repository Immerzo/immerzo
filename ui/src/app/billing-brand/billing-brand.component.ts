import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map, reduce } from 'rxjs/operators';
import { KeycloakService } from  '../keycloak/service/keycloak.service';
import { InvoiceService } from  '../invoice/service/invoice.service';
import { TransactionService } from  '../transaction/service/transaction.service';
import { PaypalService } from '../paypal/service/paypal.service';
import { Utils, NumberFormatterPipe } from '../utils';

@Component({
    selector: 'app-billing-brand',
    templateUrl: './billing-brand.component.html',
    styleUrls: ['./billing-brand.component.css'],
    providers: [NumberFormatterPipe]
})
export class BillingBrandComponent implements OnInit {

    currency = Utils.currency;
    formatDate = Utils.formatDate;
    
    invoice: any = "";
    unpaid: any = 0;
    paid: any = 0;
    
    unpaidCurrent: any = 0;
    paidCurrent: any = 0;
  
    unpaidInvoices$: Observable<any[]>;
    paidInvoices$: Observable<any[]>;

    transactions$: Observable<any[]>;
        
    constructor(private keycloakService: KeycloakService,
                private invoiceService: InvoiceService,
                private transactionService: TransactionService,
                private paypalService: PaypalService) { }

    ngOnInit() {
        this.getInvoices();
        this.getTransactions();
    }
    
    getInvoices() {    
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);

        // UNPAID
        this.unpaidInvoices$ = this.invoiceService.getInvoices(this.keycloakService.getUser().id, 'A');

        // sum unpaid
        this.unpaidInvoices$.pipe(
            map(invoices => invoices.map(invoice => parseFloat(invoice.amount))),
                map(amounts => amounts.reduce((acc, amount) => acc + amount, 0))
            ).subscribe(total => this.unpaid = total);

        // sum current unpaid
        this.unpaidInvoices$.pipe(
            map(invoices => invoices.filter(invoice => new Date(invoice.created_at) >= thirtyDaysAgo)),
                map(invoices => invoices.map(invoice => parseFloat(invoice.amount))),
                    map(amounts => amounts.reduce((acc, amount) => acc + amount, 0))
            ).subscribe(total => this.unpaidCurrent = total);
  
        // PAID
        this.paidInvoices$ = this.invoiceService.getInvoices(this.keycloakService.getUser().id, 'T');

        // sum paid
        this.paidInvoices$.pipe(
            map(invoices => invoices.map(invoice => parseFloat(invoice.amount))),
                map(amounts => amounts.reduce((acc, amount) => acc + amount, 0))
            ).subscribe(total => this.paid = total);

        // sum current paid
        this.paidInvoices$.pipe(
            map(invoices => invoices.filter(invoice => new Date(invoice.created_at) >= thirtyDaysAgo)),
                map(invoices => invoices.map(invoice => parseFloat(invoice.amount))),
                    map(amounts => amounts.reduce((acc, amount) => acc + amount, 0))
            ).subscribe(total => this.paidCurrent = total);

    }
    
    getTransactions() {    
        this.transactions$ = this.transactionService.getTransactions(this.keycloakService.getUser().id);
    }
    
    pay(): void {
        this.paypalService.paypalProcess({
            'invoice': this.invoice,
            'url': window.location.href
        }).subscribe(
            (response) => {
                console.log(response);
                if (response.links && response.links.some(link => link.rel === 'approve')) {
                  // Redirect to the PayPal approval URL
                  window.location.href = response.links.find(link => link.rel === 'approve').href;
                }
            },
            (error) => {
                console.error('error:', error);
            }
        );
    }    
}
