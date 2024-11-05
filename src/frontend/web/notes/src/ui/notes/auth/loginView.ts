import {services} from "../../../service/services";
import {button, div, RootedComponent} from "../../../utility/component";
import {labelledPasswordInput, labelledTextBox} from "../../component/labeledTextInput";

export function login(): RootedComponent<any> {
    const username = labelledTextBox('User Name');
    const password = labelledPasswordInput('Password');

    return div().withChildren([
        username,
        password,
        button('Login').onclick(() => services.authService.login(username.getValue(), password.getValue()))
    ])
}