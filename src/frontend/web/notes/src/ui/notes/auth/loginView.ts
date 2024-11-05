import {Services} from "../../../service/services";
import {button, CompositeComponentBase, div} from "../../../utility/component";
import {labelledPasswordInput, labelledTextBox} from "../../component/labeledTextInput";

export class LoginView extends CompositeComponentBase {
    constructor(
        private s: Services,
    ) {
        super(div());

        const username = labelledTextBox('User Name').in(this.root);
        const password = labelledPasswordInput('Password').in(this.root);

        button('Login')
            .in(this.root)
            .onclick(() => this.s.authService.login(username.getValue(), password.getValue()))
    }
}