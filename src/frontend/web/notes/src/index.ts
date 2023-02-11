import "@js-joda/timezone";
import {ContainerView} from "./ui/app/container";
import {div} from "./utility/element";

const topLevelContainer = div().inElement(document.body);

const view = new ContainerView(topLevelContainer);
view.setup();