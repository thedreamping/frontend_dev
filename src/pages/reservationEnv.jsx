import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import MyDatePicker from "../component/datepicker";

function ReservationEnv() {
  const now = new Date();

  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [calendarData, setCalendarData] = useState(null);

  function getMonthDates(year, month) {
    // month: 1 ~ 12 (사람 기준)
    const jsMonth = month - 1;

    const lastDate = new Date(year, jsMonth + 1, 0).getDate();

    return Array.from({ length: lastDate }, (_, i) => {
      const date = new Date(year, jsMonth, i + 1);
      return {
        year,
        month, // 1 ~ 12
        day: i + 1,
        weekday: date.getDay(),
        dateObj: date,
      };
    });
  }

  // const dates = getMonthDates(2026, 1); // 2026년 1월

  // const wednesdays = dates.filter(d => d.weekday === 3);

  // console.log(wednesdays);

  useEffect(() => {
    if (month > 12) {
      setMonth(1);
      setYear((prev) => prev + 1);
      return;
    }

    if (month < 1) {
      setMonth(12);
      setYear((prev) => prev - 1);
      return;
    }

    setCalendarData(getMonthDates(year, month));
  }, [month, year]);

  const nextMonth = () => setMonth((prev) => prev + 1);
  const prevMonth = () => setMonth((prev) => prev - 1);

  useEffect(() => {
    console.log(calendarData);
  }, [calendarData]);

  const buildCalendarRows = (dates) => {
    if (!dates || dates.length === 0) return [];

    const rows = [];
    let currentRow = [];

    // ✅ 1일의 요일만큼 앞에 빈 td
    const firstWeekday = dates[0].weekday;
    for (let i = 0; i < firstWeekday; i++) {
      currentRow.push(null);
    }

    dates.forEach((date) => {
      currentRow.push(date);

      if (currentRow.length === 7) {
        rows.push(currentRow);
        currentRow = [];
      }
    });

    // ✅ 마지막 주 빈칸 채우기
    if (currentRow.length > 0) {
      while (currentRow.length < 7) {
        currentRow.push(null);
      }
      rows.push(currentRow);
    }

    return rows;
  };

  return (
    <>
      <div className="workspace">
        <div className="title">예약환경 설정</div>
        <div className="content">
          <div className="rooms_calendar_info">
            <button className="prev" onClick={prevMonth}>
              Prev
            </button>
            {year}.{month}
            <button className="next" onClick={nextMonth}>
              Next
            </button>
          </div>
          <div className="rooms_calendar">
            <table>
              <thead>
                <tr>
                  <th>일</th>
                  <th>월</th>
                  <th>화</th>
                  <th>수</th>
                  <th>목</th>
                  <th>금</th>
                  <th>토</th>
                </tr>
              </thead>
              <tbody>
                {buildCalendarRows(calendarData).map((week, rowIndex) => (
                  <tr key={rowIndex}>
                    {week.map((date, colIndex) => (
                      <td key={colIndex}>{date ? date.day : ""}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

export default ReservationEnv;
