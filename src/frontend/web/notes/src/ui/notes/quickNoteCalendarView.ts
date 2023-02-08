import {SubViewCollection, View} from "../../utility/view";
import {AnyBuilder, clear, div, DivBuilder, flexRow} from "../../utility/element";
import {TotalQuickNotesOnDateDataHandle} from "../../service/totalQuickNotesOnDateDataHandle";
import {LocalDate, LocalDateTime, LocalTime, TemporalAdjusters, ZonedDateTime, ZoneId} from "@js-joda/core";
import {Subscription, take} from "rxjs";
import {QuickNoteDataHandle} from "../../service/quickNoteDataHandle";
import {QuickNoteColumnView} from "./quickNoteColumnView";

export class QuickNoteCalendarView implements View {
    private totalQuickNotesOnDates: TotalQuickNotesOnDateDataHandle;

    private subscription: Subscription;

    private subviews: SubViewCollection;

    private calendarContainer: DivBuilder;
    private notesContainer: DivBuilder;

    private notesHandle: QuickNoteDataHandle;

    // date of first day of month
    private currentMonth: LocalDate;

    constructor(private container: AnyBuilder) {
        this.totalQuickNotesOnDates = new TotalQuickNotesOnDateDataHandle();

        this.currentMonth = LocalDate.now().with(TemporalAdjusters.firstDayOfMonth());

        this.get();

        this.notesHandle = new QuickNoteDataHandle();
        this.notesHandle.parameters.sortDirection = 'descending';
        this.notesHandle.parameters.sortBy = 'document_time';
    }

    private get() {
        this.totalQuickNotesOnDates.parameters.startDate = this.currentMonth.with(TemporalAdjusters.firstDayOfMonth());
        this.totalQuickNotesOnDates.parameters.endDate = this.currentMonth.with(TemporalAdjusters.lastDayOfMonth());

        this.totalQuickNotesOnDates.get();
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
                if (!totalNotesOnDates) {
                    return;
                }

                clear(this.calendarContainer);

                let index = 0;

                const calendarBuilder = div()
                    .in(this.calendarContainer)
                    .display('inline-block');

                const linkRow = flexRow()
                    .in(calendarBuilder)
                    .justifyContent('space-between')
                    .withChildren([
                        div('< Prev')
                            .cursor('pointer')
                            .onclick((ev) => {
                                this.currentMonth = this.currentMonth.minusMonths(1);
                                this.get();
                            }),
                        div('Next >')
                            .cursor('pointer')
                            .onclick((ev) => {
                                this.currentMonth = this.currentMonth.plusMonths(1);
                                this.get();
                            }),
                    ])

                const dayOfMonthOfFirstCalendarCell = 1 - this.currentMonth.dayOfWeek().value();
                const numDaysInMonth = this.currentMonth.month().length(this.currentMonth.isLeapYear());

                const currentMonthName = this.currentMonth.month().name();

                // Month and days of week
                div(currentMonthName + ' ' + this.currentMonth.year())
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
                                const dateOfCell = LocalDate.of(this.currentMonth.year(),this.currentMonth.monthValue(),cellDay);

                                if (localDateOfIndex.equals(dateOfCell)) {
                                    div(String(nextInList.count))
                                        .in(cell)
                                        .textAlign('center')
                                        .cursor('pointer')
                                        .background('lightgray')
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