import {View} from "../../../utility/view";
import {AnyBuilder, button, clear, flexRow} from "../../../utility/element";
import {Services} from "../../../service/services";
import {LabeledTextInput} from "../../component/labeledTextInput";

export class LoginView implements View {
    private UserName: LabeledTextInput;
    private Password: LabeledTextInput;

    constructor(
        private container: AnyBuilder,
        private s: Services,
    ) {
    }

    setup(): void {
        clear(this.container);

        this.UserName = new LabeledTextInput('User Name').in(this.container);
        this.Password = new LabeledTextInput('Password').in(this.container);
        this.Password.inputEl.element().type = 'password';

        button('Login')
            .in(this.container)
            .onclick(() => this.s.authService.login(this.UserName.value, this.Password.value))
    }

    teardown(): void {
    }

}