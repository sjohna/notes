import {palette} from "../notes/paletteView";
import {button, flexColumn, RootedComponent} from "../../utility/component";
import {services} from "../../service/services";

export function sidebar(): RootedComponent<any> {
    return flexColumn()
        .background('lightgray')
        .width('200px')
        .withChild(
            button("Log out")
                .onclick(() => services.authService.logout())
        )
        .withChild(palette());
}