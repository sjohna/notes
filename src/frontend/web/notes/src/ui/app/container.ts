import {View} from "../../utility/view";
import {AnyBuilder, clear} from "../../utility/element";
import {Services} from "../../service/services";
import {navigationEvents$} from "../../service/navigationService";
import {Subscription} from "rxjs";
import {LoggedInContainerView} from "./loggedInContainer";
import {LoginView} from "../notes/auth/loginView";


export class ContainerView implements View {
    constructor(
        private container: AnyBuilder,
        private s: Services,
    ) {}

    private loggedIn?: boolean = null;

    private view: View;

    private navigationSubscription?: Subscription;

    public setup(): void {
        this.navigationSubscription = navigationEvents$.subscribe((e) => {
            if (e.loggedIn != this.loggedIn) {
                this.loggedIn = e.loggedIn;
                this.render();
            }
        });
    }

    private render() {
        this.view?.teardown();
        clear(this.container);
        if (this.loggedIn) {
            this.view = new LoggedInContainerView(this.container, this.s);
        } else {
            this.view = new LoginView(this.container, this.s);
        }
        this.view.setup();
    }

    public teardown(): void {
        this.navigationSubscription?.unsubscribe();
        this.view?.teardown();
    }
}