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

  useEffect(() => {
    console.log(selectedDays);
  }, [selectedDays]);

  const saveSchedule = () => {};

  return (
    <>
      <div className="workspace">
        <div className="title">대관일정</div>
        <div className="content">
          <div className="btn_area">
            <button
              className="green"
              onClick={() => {
                if (selectedDays.length === 0) {
                  alert("일정을 넣을 날짜를 선택해 주세요");
                  return;
                }
                setIsPop(true);
              }}
            >
              선택날짜에 일정 집어넣기
            </button>
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
                        <div>{date ? date.day : ""} </div>
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

      {isPop && (
        <div className="popup_wrap">
          <div className="popup" style={{ width: "1200px", height: "600px" }}>
            <div className="popup_title">일정 집어넣기</div>
            <div
              className="popup_x"
              onClick={() => {
                setIsPop(false);
              }}
            >
              X
            </div>
            <div className="btn_area">
              <button className="green" onClick={saveSchedule}>
                저장
              </button>
            </div>
            <div className="ovf_scroll_for_pop">
              <table>
                <tbody>
                  <tr>
                    <th>선택된 날짜</th>
                    <td>
                      {selectedDays.map((data, i) => {
                        return (
                          <span
                            className="date_span"
                            key={`khkj$${i}`}
                          >{`${data.year}-${data.month < 10 ? "0" + data.month : data.month}-${data.day < 10 ? "0" + data.day : data.day}`}</span>
                        );
                      })}
                    </td>
                  </tr>
                  <tr>
                    <th>일정명</th>
                    <td>
                      <input type="text" />
                    </td>
                  </tr>
                  <tr>
                    <th>자세한 내역</th>

                    <td>
                      <textarea></textarea>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="btn_area">
                <button className="green" onClick={saveSchedule}>
                  저장
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default DkSchedule;
