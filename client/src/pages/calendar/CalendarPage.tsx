import { addDays, addMonths, format, isSameDay, isSameMonth, parseISO, subMonths } from "date-fns";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

import { Button } from "../../components/ui/Button";
import { CalendarCell } from "../../components/ui/CalendarCell";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { SkeletonList } from "../../components/ui/Loading";
import { PageHeader } from "../../components/ui/PageHeader";
import { TaskCard } from "../../components/ui/TaskCard";
import { fetchSchedules } from "../../services/schedules";
import type { Schedule } from "../../types/domain";

function scheduleDate(schedule: Schedule) {
  const value = schedule.dueTime ?? schedule.startTime;
  return value ? parseISO(value) : null;
}

export function CalendarPage() {
  const [month, setMonth] = useState(() => new Date());
  const [selected, setSelected] = useState(() => new Date());
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchSchedules({ page: 1, pageSize: 100, sortBy: "dueTime", sortDir: "asc" });
      setSchedules(data.items);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Calendar failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const days = useMemo(() => {
    const start = new Date(month.getFullYear(), month.getMonth(), 1);
    const gridStart = addDays(start, -start.getDay());
    return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));
  }, [month]);

  const selectedTasks = schedules.filter((schedule) => {
    const date = scheduleDate(schedule);
    return date ? isSameDay(date, selected) : false;
  });

  return (
    <>
      <PageHeader
        title="Calendar"
        description="Scan the month and open the work attached to each day."
        actions={
          <Link className="button button--primary" to="/schedules/new">
            <Plus aria-hidden="true" />
            New schedule
          </Link>
        }
      />

      <Card>
        <div className="calendar-toolbar">
          <Button variant="secondary" onClick={() => setMonth((value) => subMonths(value, 1))}>
            <ChevronLeft aria-hidden="true" />
            Previous
          </Button>
          <strong>{format(month, "MMMM yyyy")}</strong>
          <Button variant="secondary" onClick={() => setMonth((value) => addMonths(value, 1))}>
            Next
            <ChevronRight aria-hidden="true" />
          </Button>
        </div>

        {loading ? <SkeletonList rows={2} /> : null}
        {!loading && error ? (
          <EmptyState title="Calendar could not load" description={error} action={<Button onClick={() => void load()}>Retry</Button>} />
        ) : null}
        {!loading && !error ? (
          <div className="calendar-layout">
            <div className="calendar-grid">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <span className="calendar-weekday" key={day}>
                  {day}
                </span>
              ))}
              {days.map((day) => {
                const count = schedules.filter((schedule) => {
                  const date = scheduleDate(schedule);
                  return date ? isSameDay(date, day) : false;
                }).length;
                return (
                  <CalendarCell
                    count={count}
                    day={day.getDate()}
                    key={day.toISOString()}
                    muted={!isSameMonth(day, month)}
                    onClick={() => setSelected(day)}
                    selected={isSameDay(day, selected)}
                    today={isSameDay(day, new Date())}
                  />
                );
              })}
            </div>
            <aside className="selected-day">
              <h2>{format(selected, "MMMM d, yyyy")}</h2>
              {selectedTasks.length === 0 ? <p className="muted-text">No schedules on this date.</p> : null}
              <div className="preview-list">
                {selectedTasks.map((schedule) => (
                  <TaskCard compact key={schedule.id} schedule={schedule} />
                ))}
              </div>
            </aside>
          </div>
        ) : null}
      </Card>
    </>
  );
}
