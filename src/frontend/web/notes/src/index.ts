import "@js-joda/timezone";
import {DocumentFilterService} from "./service/documentFilterService";
import {initServices, services, Services} from "./service/services";
import {ContainerView} from "./ui/app/container";
import {flexColumn} from "./utility/component";

document.body.style.height = '100%';
document.body.style.overflowY = 'hidden';

initServices();

const topLevelContainer = flexColumn()
    .inElement(document.body)
    .height('100%')
    .overflowY('auto'); // TODO: make it so the sidebar doesn't scroll...

const documentFilters = new DocumentFilterService();
documentFilters.filter.sortBy = 'document_time';
documentFilters.filter.sortDirection = 'descending';

window.onpopstate =  (event) => {
    services.navService.historyPopped(event.state);
};

services.authService.loggedInChanged$.subscribe((loggedIn) => {
    if (loggedIn) {
        console.log('logged in changed handler: getting stuff')
        services.generalService.get();
        services.tagService.get();
        services.groupService.get();
    }
});

new ContainerView().in(topLevelContainer);