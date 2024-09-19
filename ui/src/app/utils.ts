import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'numberFormatter'
})
export class NumberFormatterPipe implements PipeTransform {

    transform(value: number): string {
        return (value < 1000000)? (value / 1000).toFixed(1) + 'K': (value / 1000000).toFixed(1) + 'M'; 
    }
}

export class Utils {
    static currency(amount: number): string {
        return (amount == null)? "Open": new Intl.NumberFormat('en-UK', { style: 'currency', currency: 'GBP' }).format(amount);
    }

    static strToArray(str: string): string[] {
        return str? str.split(','): [];
    }

    static formatTimestamp(timestamp: string): string {
        const inputDate = new Date(timestamp);
        const hours = inputDate.getHours();
        const minutes = inputDate.getMinutes();
        const ampm = hours >= 12 ? 'pm' : 'am';
    
        const formattedTime = `${hours % 12 || 12}:${minutes.toString().padStart(2, '0')}${ampm} | ${inputDate.getDate().toString().padStart(2, '0')}-${(inputDate.getMonth() + 1).toString().padStart(2, '0')}-${inputDate.getFullYear()}`;
    
        return formattedTime;
    }
    
    static formatDate(timestamp: string): string {
        if (timestamp) {
            const inputDate = new Date(timestamp);        
            timestamp = `${inputDate.getDate().toString().padStart(2, '0')}-${(inputDate.getMonth() + 1).toString().padStart(2, '0')}-${inputDate.getFullYear()}`;
        }
        return timestamp;
    }

    static compareTimestamps(date1: string, date2: string): boolean {
        return new Date(date1).getTime() < new Date(date2).getTime();
    }
      
    static roundToNearestThousand(value: number): string {
        const roundedValue = Math.round(value / 100) / 10; // Divide by 1000 and round to one decimal place
        return `${roundedValue}K`; // Append "K" suffix
    }

    static getSessionObject(key: string): any {
        const obj = sessionStorage.getItem(key);
        return obj? JSON.parse(obj): null;
    }

    static getSessionString(key: string): string {
        return sessionStorage.getItem(key);
    }
    
    static getSessionNumber(key: string): number {
        const n = sessionStorage.getItem(key);
        return n? parseInt(n, 10) : 0;
    }

    static setSessionObject(key: string, obj: any): void {
        sessionStorage.setItem(key, JSON.stringify(obj));
    }

    static setSessionString(key: string, value: string): void {
        sessionStorage.setItem(key, value);
    }

    static setSessionNumber(key: string, value: number): void {
        sessionStorage.setItem(key, value.toString());
    }
        
    static clearSession(key: string): void {
        sessionStorage.removeItem(key);
    }
}
