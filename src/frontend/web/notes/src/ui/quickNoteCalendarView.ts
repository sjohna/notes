import {View} from "../utility/view";
import {clear, newDiv} from "../utility/element";


export class QuickNoteCalendarView implements View {
    private notesContainer: HTMLDivElement;

    constructor(private container: HTMLElement) {}

    setup(): void {
        clear(this.container);

        const calendarBuilder = newDiv()
            .display('inline-block')
            .in(this.container);

        // hardcode to January 2023 for now
        const dayOfMonthOfFirstCalendarCell = 1;
        const numDaysInMonth = 31;

        // Month and days of week
        newDiv()
            .textAlign('center')
            .innerText('January')
            .border('1px solid')
            .in(calendarBuilder.element())

        newDiv()
            .display('flex')
            .flexDirection('row')
            .withChild(
                newDiv()
                    .innerText('Sunday')
                    .border('1px solid')
                    .width('75px')
                    .textAlign('center')
                    .element()
            )
            .withChild(
                newDiv()
                    .innerText('Monday')
                    .border('1px solid')
                    .width('75px')
                    .textAlign('center')
                    .element()
            )
            .withChild(
                newDiv()
                    .innerText('Tuesday')
                    .border('1px solid')
                    .width('75px')
                    .textAlign('center')
                    .element()
            )
            .withChild(
                newDiv()
                    .innerText('Wednesday')
                    .border('1px solid')
                    .width('75px')
                    .textAlign('center')
                    .element()
            )
            .withChild(
                newDiv()
                    .innerText('Thursday')
                    .border('1px solid')
                    .width('75px')
                    .textAlign('center')
                    .element()
            )
            .withChild(
                newDiv()
                    .innerText('Friday')
                    .border('1px solid')
                    .width('75px')
                    .textAlign('center')
                    .element()
            )
            .withChild(
                newDiv()
                    .innerText('Saturday')
                    .border('1px solid')
                    .width('75px')
                    .textAlign('center')
                    .element()
            )
            .in(calendarBuilder.element())

        let currentDay = dayOfMonthOfFirstCalendarCell;
        while (currentDay <= numDaysInMonth) {
            const row = newDiv()
                .display('flex')
                .flexDirection('row')
                .in(calendarBuilder.element())
                .element();
            for (let i = 0; i < 7; ++i) {
                const cell = newDiv()
                    .border('1px solid')
                    .width('75px')
                    .in(row)
                    .element();

                const cellDay = currentDay + i;
                let cellDayHeader = '';
                if (cellDay > 0 && cellDay <= numDaysInMonth) {
                    cellDayHeader = String(cellDay);

                    newDiv()
                        .textAlign('center')
                        .border('1px solid')
                        .innerText(cellDayHeader)
                        .in(cell);

                    // TODO: show number of notes, with link
                    newDiv()
                        .textAlign('center')
                        .innerText('X')
                        .in(cell);
                }
            }

            currentDay += 7;
        }
    }

    teardown(): void {
    }

}