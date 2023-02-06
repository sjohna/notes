import {SubViewCollection, View} from "../utility/view";
import {AnyBuilder, clear, div, DivBuilder, flexRow} from "../utility/element";
import {TotalQuickNotesOnDateDataHandle} from "../service/totalQuickNotesOnDateDataHandle";
import {LocalDate, LocalDateTime, LocalTime, ZonedDateTime, ZoneId} from "@js-joda/core";
import {Subscription, take} from "rxjs";
import {QuickNoteDataHandle} from "../service/quickNoteDataHandle";
import {QuickNoteColumnView} from "./quickNoteColumnView";

export class QuickNoteCalendarView implements View {
    private totalQuickNotesOnDates: TotalQuickNotesOnDateDataHandle;

    private subscription: Subscription;

    private subviews: SubViewCollection;

    private calendarContainer: DivBuilder;
    private notesContainer: DivBuilder;

    private notesHandle: QuickNoteDataHandle;

    constructor(private container: AnyBuilder) {
        this.totalQuickNotesOnDates = new TotalQuickNotesOnDateDataHandle();

        this.totalQuickNotesOnDates.parameters.startDate = LocalDate.of(2023,1,1);
        this.totalQuickNotesOnDates.parameters.endDate = LocalDate.of(2023, 1, 31);

        this.totalQuickNotesOnDates.get();

        this.notesHandle = new QuickNoteDataHandle();
        this.notesHandle.parameters.sortDirection = 'descending';
        this.notesHandle.parameters.sortBy = 'document_time';
    }

    setup(): void {
        clear(this.container);
        this.subscription?.unsubscribe();
        this.subviews?.teardown();
        this.subviews = new SubViewCollection();

        this.calendarContainer = div().in(this.container).display('inline-block');
        this.notesContainer = div().in(this.container);

        this.subviews.setupAndAdd(
            new QuickNoteColumnView(this.notesContainer, this.notesHandle)
        );

        this.subscription = this.totalQuickNotesOnDates.notesOnDates$
            .subscribe(
            (totalNotesOnDates) => {
                console.log('subscribe hit');

                if (!totalNotesOnDates) {
                    return;
                }

                console.log('there are total notes on dates');

                clear(this.calendarContainer);

                let index = 0;

                const calendarBuilder = div()
                    .in(this.calendarContainer)
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
                                        .textAlign('center')
                                        .cursor('pointer')
                                        .onclick(() => {
                                            const startDate = localDateOfIndex.atTime(LocalTime.of(0,0,0)).atZone(ZoneId.of('America/Denver')).withZoneSameInstant(ZoneId.UTC);
                                            this.notesHandle.parameters.startTime = startDate;
                                            this.notesHandle.parameters.endTime = startDate.plusDays(1);
                                            this.notesHandle.get();
                                        });

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
        this.subviews?.teardown();
    }

}