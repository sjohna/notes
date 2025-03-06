import {Div, div, flexColumn} from "./component";


export function loading(message: string): Div {
    const root = flexColumn().alignItems('center')

    div(message).in(root);

    const keyframes = [
        {
            transform: 'rotate(0deg)',
        },
        {
            transform: 'rotate(360deg)'
        }
    ];

    const loader = div()
        .border('16px solid #f3f3f3')
        .borderTop('16px solid #3498db')
        .borderRadius('50%')
        .width('120px')
        .height('120px')
        .in(root);

    const animation = loader.rootElement.animate(keyframes, {
        duration: 5000,
        iterations: Infinity,
    })

    loader.onTeardown(() => animation.cancel());

    return root;
}