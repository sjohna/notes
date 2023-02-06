import {View} from "../utility/view";
import {AnyBuilder, clear, div, flexRow} from "../utility/element";
import {TotalQuickNotesOnDateDataHandle} from "../service/totalQuickNotesOnDateDataHandle";
import {LocalDate, LocalDateTime, ZonedDateTime} from "@js-joda/core";
import {Subscription, take} from "rxjs";

export class QuickNoteCalendarView implements View {
    private totalQuickNotesOnDates: TotalQuickNotesOnDateDataHandle;

    private subscription: Subscription;

    constructor(private container: AnyBuilder) {
        this.totalQuickNotesOnDates = new TotalQuickNotesOnDateDataHandle();

        this.totalQuickNotesOnDates.parameters.startDate = LocalDate.of(2023,1,1);
        this.totalQuickNotesOnDates.parameters.endDate = LocalDate.of(2023, 1, 31);

        this.totalQuickNotesOnDates.get();
    }

    setup(): void {
        this.subscription?.unsubscribe();
        this.subscription = this.totalQuickNotesOnDates.notesOnDates$
            .subscribe(
            (totalNotesOnDates) => {
                if (!totalNotesOnDates) {
                    return;
                }

                clear(this.container);

                let index = 0;

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
                    .in(calendarBuilder)
                    .withChildren([
                        dayTemplate.clone('Sunday'),
                        dayTemplate.clone('Monday'),
                        dayTemplate.clone('Tuesday'),
                        dayTemplate.clone('Wednesday'),
                        dayTemplate.clone('Thursday'),
                        dayTemplate.clone('Friday'),
                        dayTemplate.clone('Saturday'),
                    ]);

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

                            if (index < totalNotesOnDates.length) {
                                const nextInList = totalNotesOnDates[index];
                                const localDateOfIndex = LocalDate.parse(nextInList.date);
                                const dateOfCell = LocalDate.of(2023,1,cellDay);

                                if (localDateOfIndex.equals(dateOfCell)) {
                                    div(String(nextInList.count))
                                        .in(cell)
                                        .textAlign('center');

                                    ++index;
                                }  else {
                                    div('.')
                                        .in(cell)
                                        .visibility('hidden');
                                }
                            } else {
                                div('.')
                                    .in(cell)
                                    .visibility('hidden');
                            }
                        }
                    }

                    currentDay += 7;
                }
            }
        );
    }

    teardown(): void {
        this.subscription?.unsubscribe();
    }

}