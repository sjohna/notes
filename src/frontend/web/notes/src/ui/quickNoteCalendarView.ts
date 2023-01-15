import {View} from "../utility/view";
import {AnyBuilder, clear, div, flexRow} from "../utility/element";


export class QuickNoteCalendarView implements View {
    constructor(private container: AnyBuilder) {}

    setup(): void {
        clear(this.container);

        const calendarBuilder = div()
            .in(this.container)
            .display('inline-block');

        // hardcode to January 2023 for now
        const dayOfMonthOfFirstCalendarCell = 1;
        const numDaysInMonth = 31;

        // Month and days of week
        div('January')
            .in(calendarBuilder)
            .textAlign('center')
            .border('1px solid');

        const dayTemplate = div()
            .border('1px solid')
            .width('75px')
            .textAlign('center');

        flexRow()
            .withChildren([
                dayTemplate.clone('Sunday'),
                dayTemplate.clone('Monday'),
                dayTemplate.clone('Tuesday'),
                dayTemplate.clone('Wednesday'),
                dayTemplate.clone('Thursday'),
                dayTemplate.clone('Friday'),
                dayTemplate.clone('Saturday'),
            ])
            .in(calendarBuilder)

        let currentDay = dayOfMonthOfFirstCalendarCell;
        while (currentDay <= numDaysInMonth) {
            const row = flexRow()
                .in(calendarBuilder)
            for (let i = 0; i < 7; ++i) {
                const cell = div()
                    .in(row)
                    .border('1px solid')
                    .width('75px');

                const cellDay = currentDay + i;
                let cellDayHeader = '';
                if (cellDay > 0 && cellDay <= numDaysInMonth) {
                    cellDayHeader = String(cellDay);

                    div(cellDayHeader)
                        .in(cell)
                        .textAlign('center')
                        .border('1px solid');

                    // TODO: show number of notes, with link
                    div('X')
                        .in(cell)
                        .textAlign('center');
                }
            }

            currentDay += 7;
        }
    }

    teardown(): void {
    }

}