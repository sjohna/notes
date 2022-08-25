import "@js-joda/timezone";
import {renderQuickNotes} from "./quickNotes";

const topLevelContainer = document.createElement('div') as HTMLDivElement;
document.body.appendChild(topLevelContainer);

renderQuickNotes(topLevelContainer);