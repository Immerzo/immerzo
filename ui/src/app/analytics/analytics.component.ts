import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { KeycloakService } from  '../keycloak/service/keycloak.service';
import { ProjectService } from  '../project/service/project.service';
import { RobloxService } from '../roblox/service/roblox.service';
import { Observable, forkJoin } from 'rxjs';


@Component({
    selector: 'app-analytics',
    templateUrl: './analytics.component.html',
    styleUrls: ['./analytics.component.css']
})
export class AnalyticsComponent implements OnInit {    
    @ViewChild('myChart') myChart: ElementRef;
    
    game_id: string = '';

    actions = ["click", "visit"]
    data: any = {'click': { 'results': [] }, 'visit': { 'results': [] }}
    object_id: any = {'click': '', 'visit': ''}
    view: any;
    period: string = 'day';

    // options
    action = "click";
    showXAxis = true;
    showYAxis = true;
    gradient = false;
    showLegend = false;
    showXAxisLabel = true;
    showYAxisLabel = true;

    colorScheme = {
        domain: ['#5956FD', '#A10A28', '#C7B42C', '#AAAAAA']
    };

    numClicks = 0;
    numVisits = 0;

    projects$: Observable<any[]>;

    constructor(private keycloakService: KeycloakService,
                private projectService: ProjectService,
                private robloxService: RobloxService) {
    }

    ngOnInit() {
        this.projects$ = this.projectService.getProjects(this.keycloakService.getUser().id, '', '', '');
    }

    update_period(p) {
        if (p != this.period) {
            this.period = p;
            this.update_game_id();
        }
    }
    
    update_game_id() {
        forkJoin([
            this.robloxService.getAnalytics(this.game_id, 'click', this.period),
            this.robloxService.getAnalytics(this.game_id, 'visit', this.period),
            this.robloxService.getObjectIds(this.game_id, 'click'),
            this.robloxService.getObjectIds(this.game_id, 'visit')
        ]).subscribe(
            ([clicks, visits, click_oids, visit_oids]) => {                  
                this.data['click'] = { 'results': [{'name': 'click',
                                                    'series': clicks.map(item => ({
                                                    'name': item.name,
                                                    'value': item.value }))},],
                                       'label': 'Number of Clicks',
                                       'oids': click_oids }
                this.data['visit'] = { 'results': [{'name': 'visit',
                                                    'series': visits.map(item => ({
                                                    'name': item.name,
                                                    'value': item.value }))},],
                                       'label': 'Number of Visits',
                                       'oids': visit_oids }
                this.numClicks = clicks.reduce((acc, item) => { return acc + item.value; }, 0);
                this.numVisits = visits.reduce((acc, item) => { return acc + item.value; }, 0);
            },
            (error) => {
                console.error('Error fetching:', error);
            }
        );
    }
  
    update_oid(action: string) {
        this.robloxService.getAnalytics(this.game_id, action, this.period, this.object_id[action]).subscribe(
            (v) => {
                this.data[action]['results'] = [{'name': action,
                								 'series': v.map(item => ({
                                                 'name': item.name,
                                                 'value': item.value }))
                								},];
            },
                (error) => {
                console.error('Error fetching:', error);
            }
        );
    }

    onSelect(e: Event) {
        console.log(e);
    }
  
    @HostListener('window:resize', ['$event'])
    onResize(event: Event): void {
        let w = window.innerWidth;
        // Determined experimentally based on current layout.
        // Expected output: -1 or 1 as screen shrink / grow
        // console.log(this.myChart.nativeElement.offsetWidth - w);
        w = Math.max(1000 - 35, w);  // min width minus offset
        w = Math.min(1250 - 35, w); // max width minus offset
        this.view = [w, this.myChart.nativeElement.offsetHeight]; // w triggers the change as it deviates from offsetWidth
    }
    
    print() {
        window.print();
    }
}
