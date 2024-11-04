import {Services} from "../../../service/services";
import {LabeledTextInput} from "../../component/labeledTextInput";
import {button, ComponentBase, div, Div} from "../../../utility/component";

export class LoginView extends ComponentBase {
    private container: Div = div();

    private UserName: LabeledTextInput;
    private Password: LabeledTextInput;

    constructor(
        private s: Services,
    ) {
        super();

        this.container.clear();

        this.UserName = new LabeledTextInput('User Name').in(this.container);
        this.Password = new LabeledTextInput('Password').in(this.container);
        this.Password.inputEl.root().type = 'password';

        button('Login')
            .in(this.container)
            .onclick(() => this.s.authService.login(this.UserName.value, this.Password.value))
    }

    root(): HTMLElement {
        return this.container.root();
    }
}