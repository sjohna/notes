import {Services} from "../../service/services";
import {Subscription} from "rxjs";
import {LoggedInContainerView} from "./loggedInContainer";
import {LoginView} from "../notes/auth/loginView";
import {Component, ComponentBase, Div, div} from "../../utility/component";


export class ContainerView extends ComponentBase {
    private container: Div = div();

    constructor(
        private s: Services,
    ) {
        super();

        this.navigationSubscription = this.s.navService.navigationEvents$.subscribe((e) => {
            if (e.loggedIn != this.loggedIn) {
                this.loggedIn = e.loggedIn;
                this.render();
            }
        });
    }

    public root(): HTMLElement {
        return this.container.root();
    }

    private loggedIn?: boolean = null;

    private view: Component;

    private navigationSubscription?: Subscription;

    private render() {
        this.container.clear();
        if (this.loggedIn) {
            new LoggedInContainerView(this.s).in(this.container);
        } else {
            new LoginView(this.s).in(this.container);
        }
    }

    public teardown(): void {
        this.navigationSubscription?.unsubscribe();
        this.view?.teardown();
    }
}