import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import MyDatePicker from "../component/datepicker";

function DkSchedule() {
  const now = new Date();

  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [calendarData, setCalendarData] = useState(null);

  const [selectedDays, setSelectedDays] = useState([]);
  const [isPop, setIsPop] = useState(false);
  const [roomGroup, setRoomGroup] = useState([]);
  const [checkedId, setCheckedId] = useState([]);
  const [priceInfos, setPriceInfos] = useState([]);
  const [isOneDayEdit, setIsOneDayEdit] = useState(false);

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

  const getDaysByWeekday = (data, targetWeekday) => {
    return data.flat().filter((item) => item?.weekday === targetWeekday);
  };

  const editOnlyOne = (date) => {
    console.log(date, rooms);
    if (!date) return;
    setSelectedDays([date]);
    setIsOneDayEdit(true);

    setIsPop(true);
  };

  return (
    <>
      <div className="workspace">
        <div className="title">대관일정</div>
        <div className="content">
          <div className="btn_area">
            <button className="green">저장</button>
          </div>
          <div className="rooms_calendar_info">
            <button
              className="prev"
              onClick={() => {
                prevMonth();
                setSelectedDays([]);
              }}
            >
              Prev
            </button>
            {year}.{month}
            <button
              className="next"
              onClick={() => {
                nextMonth();
                setSelectedDays([]);
              }}
            >
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
                      <td
                        key={colIndex}
                        className={
                          selectedDays.includes(date) ? "day_active" : ""
                        }
                        onClick={() => {
                          setSelectedDays((data) =>
                            data.includes(date)
                              ? data.filter((d) => d !== date)
                              : [...data, date],
                          );
                        }}
                      >
                        <div>
                          {date ? date.day : ""}{" "}
                          <button
                            style={{ float: "right" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              editOnlyOne(date);
                            }}
                          >
                            수정
                          </button>
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="btn_area">
            <button className="green">저장</button>
          </div>
        </div>
      </div>
    </>
  );
}

export default DkSchedule;
