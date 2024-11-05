import {Services} from "../../service/services";
import {LoggedInContainerView} from "./loggedInContainer";
import {LoginView} from "../notes/auth/loginView";
import {CompositeComponentBase, div} from "../../utility/component";
import {unsubscribe} from "../../utility/subscription";


export class ContainerView extends CompositeComponentBase {
    constructor(
        private s: Services,
    ) {
        super(div());

        this.onTeardown(unsubscribe(this.s.navService.navigationEvents$.subscribe((e) => {
            if (e.loggedIn != this.loggedIn) {
                this.loggedIn = e.loggedIn;
                this.render();
            }
        })));
    }

    private loggedIn?: boolean = null;

    private render() {
        this.root.clear();
        if (this.loggedIn) {
            new LoggedInContainerView(this.s).in(this.root);
        } else {
            new LoginView(this.s).in(this.root);
        }
    }
}