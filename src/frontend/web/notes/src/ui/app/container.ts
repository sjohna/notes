import {services} from "../../service/services";
import {LoggedInContainerView} from "./loggedInContainer";
import {login} from "../notes/auth/loginView";
import {CompositeComponentBase, div} from "../../utility/component";
import {unsubscribe} from "../../utility/subscription";


export class ContainerView extends CompositeComponentBase {
    constructor() {
        super(div());

        this.onTeardown(unsubscribe(services.navService.navigationEvents$.subscribe((e) => {
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
            new LoggedInContainerView().in(this.root);
        } else {
            login().in(this.root);
        }
    }
}