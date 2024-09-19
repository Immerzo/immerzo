import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { KeycloakService } from '../../keycloak/service/keycloak.service';
import { InvoiceService } from '../../invoice/service/invoice.service';
import { TransactionService } from '../../transaction/service/transaction.service';
import { APP_URL } from '../../app.configs';
import { Utils } from '../../utils';

@Injectable({providedIn: 'root'})
export class PaypalService {
	
	getSessionObject = Utils.getSessionObject;
    setSessionObject = Utils.setSessionObject;
    clearSession = Utils.clearSession;
	    
	constructor(private keycloakService: KeycloakService,
	            private invoiceService: InvoiceService,
	            private transactionService: TransactionService) { }

  	paypalProcess(data: any): Observable<any> {
        const invoice = data['invoice'];
        this.setSessionObject('INVOICE', invoice);
        const url = data['url'];
        const amount = invoice.amount;

        return this.keycloakService.post(`${APP_URL}/paypal_process`, { amount, url });
    }

    paypalCapture(data: any): Observable<any> {
        const invoice = this.getSessionObject('INVOICE');

        return new Observable((observer) => {
            this.keycloakService.post(`${APP_URL}/paypal_capture`, data).subscribe(
            (resp1) => {
                this.invoiceService.setInvoice({
                    'id': invoice.id,
                    'state': 'T'
                }).subscribe(
                    (resp2) => {
                        this.transactionService.setTransaction({
                            'user_id': this.keycloakService.getUser().id,
                            'invoice_id': invoice.id,
                            'title': invoice.title,
                            'amount': invoice.amount,
                            'reference': `Ref: ${invoice.id} ${invoice.title}, ${invoice.amount}, paid by ${this.keycloakService.getUser().username}`,
                            'capture': JSON.stringify(resp1.purchase_units[0].payments.captures[0]),
                            'state': 'T'
                        }).subscribe(
                            () => {
                                this.clearSession('INVOICE');
                                observer.next(resp1); // Pass the response to the observer
                                observer.complete(); // Complete the observable
                            },
                            (error) => {
                                observer.error(error);
                            }
                        );
                    },
                    (error) => {
                        observer.error(error);
                    }
                );
            }, (error) => {
                observer.error(error);
            });
        });
    }
}
