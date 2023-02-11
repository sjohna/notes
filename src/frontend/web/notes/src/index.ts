import "@js-joda/timezone";
import {ContainerView} from "./ui/app/container";
import {div} from "./utility/element";
import {fetchTags} from "./service/tags";

document.body.style.height = '100%';

const topLevelContainer = div()
    .inElement(document.body);

const view = new ContainerView(topLevelContainer);
fetchTags();
view.setup();