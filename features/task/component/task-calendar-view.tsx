"use client";

import { useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import uzLocale from "@fullcalendar/core/locales/uz";
import { Box } from "@mantine/core";
import { TaskGetResponse, TASK_PRIORITY_OPTIONS } from "../type/task.type";

interface TaskCalendarViewProps {
    tasks: TaskGetResponse[];
    onEditTask?: (task: TaskGetResponse) => void;
    onCreateTask?: (date: Date) => void;
}

const TaskCalendarView = ({ tasks, onEditTask, onCreateTask }: TaskCalendarViewProps) => {
    // Map tasks to events
    const events = tasks
        .filter((task) => task.dueDate) // Only tasks with due dates
        .map((task) => {
            const priorityColor =
                TASK_PRIORITY_OPTIONS.find((p) => p.value === task.priority)?.color ||
                "#3498db";

            return {
                id: task.id,
                title: task.title,
                start: task.dueDate, // or startDate if available
                end: task.dueDate,
                allDay: true,
                extendedProps: {
                    task: task,
                },
                backgroundColor: priorityColor,
                borderColor: priorityColor,
                classNames: ['task-event'], // Add class for styling if needed
            };
        });

    const handleEventClick = (info: any) => {
        const task = info.event.extendedProps.task;
        if (task && onEditTask) {
            onEditTask(task);
        }
    };

    const handleDateClick = (arg: any) => {
        if (onCreateTask) {
            onCreateTask(arg.date);
        }
    };

    const dayCellContent = (arg: any) => {
        return (
            <div className="fc-daygrid-day-frame-content" style={{ position: 'relative', height: '100%', minHeight: '30px' }}>
                <div className="fc-daygrid-day-top" style={{ flexDirection: 'row', justifyContent: 'space-between', padding: '4px' }}>
                    <a className="fc-daygrid-day-number">{arg.dayNumberText}</a>
                    {onCreateTask && (
                        <div
                            className="add-task-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                onCreateTask(arg.date);
                            }}
                            style={{
                                cursor: 'pointer',
                                opacity: 0,
                                transition: 'opacity 0.2s',
                                color: '#868e96',
                                fontSize: '18px',
                                lineHeight: 1,
                                fontWeight: 'bold',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.color = '#1e3a5f'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.opacity = '0'; }}
                            title="Vazifa qo'shish"
                        >
                            +
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Inject styles for hover effect on the cell itself to show the button? 
    // Actually using onMouseEnter/Leave on the button within the cell content is tricky because the button is inside.
    // Better strategy: CSS.
    // We can add a <style> block or rely on external CSS. 
    // Let's use simple inline styles for the button, but we need the PARENT (cell) hover to trigger it ideally.
    // Since we can't easily control parent hover from here without CSS, let's make the button always visible but subtle, or ensure CSS handles it.
    // For now, let's make it visible on hover of the button itself, OR try to make it visible when hovering the day cell area if possible.
    // Actually, fullcalendar day cell rendering is complex.
    // Simplest robust solution: Just show the + button always but very subtle (dimmed), highlighting on hover.

    return (
        <Box
            style={{
                backgroundColor: "white",
                borderRadius: 8,
                padding: 16,
                border: "1px solid #e9ecef",
                height: "calc(100vh - 200px)",
                // We can use Mantine's sx or style to inject global styles for this component's scope effectively
            }}
        >
            <style>{`
                .fc-daygrid-day:hover .add-task-btn {
                    opacity: 1 !important;
                }
            `}</style>
            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "dayGridMonth,timeGridWeek,listWeek",
                }}
                events={events}
                eventClick={handleEventClick}
                dateClick={handleDateClick}
                dayCellContent={dayCellContent}
                height="100%"
                locales={[uzLocale]}
                locale="uz"
                titleFormat={{ year: 'numeric', month: 'long' }}
                buttonText={{
                    today: "Bugun",
                    month: "Oy",
                    week: "Hafta",
                    day: "Kun",
                    list: "Ro'yxat"
                }}
                firstDay={1} // Monday start
                // Improve event styling
                eventDisplay="block"
                eventContent={(arg) => {
                    return (
                        <div style={{ padding: '2px 4px', fontSize: '12px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                            {arg.event.title}
                        </div>
                    );
                }}
            />
        </Box>
    );
};

export default TaskCalendarView;
