import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import MyDatePicker from "../component/datepicker";
import api from "../api/api";

function ReservationManagement() {
  const now = new Date();

  const minYear = now.getFullYear();
  const minMonth = now.getMonth() + 1;

  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [calendarData, setCalendarData] = useState(null);

  const [selectedDays, setSelectedDays] = useState([]);
  const [isPop, setIsPop] = useState(false);
  const [checkedId, setCheckedId] = useState([]);
  const [rooms, setRooms] = useState([]);

  const colorPalette = [
    "#ffe5e5",
    "#e5f3ff",
    "#e8ffe5",
    "#fff4d9",
    "#f3e5ff",
    "#e5fff8",
    "#ffe9f5",
    "#f0f0f0",
    "#fff0e5",
    "#e5e9ff",
    "#f9ffe5",
    "#e5fff1",
    "#ffe5f0",
    "#e5f7ff",
    "#f2e5ff",
    "#fffbe5",
    "#e5ffe8",
  ];

  const groupColorMap = {};
  let colorIndex = 0;

  const getRoomColor = (roomName) => {
    const groupName = roomName.replace(/[0-9]/g, "");

    if (!groupColorMap[groupName]) {
        groupColorMap[groupName] =
        colorPalette[colorIndex % colorPalette.length];

        colorIndex++;
    }

    return groupColorMap[groupName];
    };

  function getMonthDates(year, month) {
    const jsMonth = month - 1;

    const lastDate = new Date(year, jsMonth + 1, 0).getDate();

    return Array.from({ length: lastDate }, (_, i) => {
      const date = new Date(year, jsMonth, i + 1);

      return {
        year,
        month,
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

  const prevMonth = () => {
    if (year === minYear && month === minMonth) return;
    setMonth((prev) => prev - 1);
  };

  const buildCalendarRows = (dates) => {
    if (!dates || dates.length === 0) return [];

    const rows = [];
    let currentRow = [];

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

  const getRoomsByDate = (date) => {
    if (!date) return [];

    const target = `${date.year}-${String(date.month).padStart(
      2,
      "0"
    )}-${String(date.day).padStart(2, "0")}`;

    const toKSTDate = (utcDate) => {
      const d = new Date(utcDate);
      d.setHours(d.getHours() + 9);
      return d.toISOString().slice(0, 10);
    };

    return rooms.filter((room) => {
      if (!room.check_in || !room.check_out) return false;

      const checkIn = toKSTDate(room.check_in);
      const checkOut = toKSTDate(room.check_out);

      return target >= checkIn && target <= checkOut;
    });
  };

  useEffect(() => {
    getRooms();
  }, []);

  const getRooms = () => {
    api.get("/api/rooms").then((response) => {
      setRooms(response.data.data || []);
    });
  };

  return (
    <>
      <div className="workspace">
        <div className="title">객실예약 조회 / 관리</div>

        <div className="content">
          <div className="btn_area"></div>

          <div className="rooms_calendar_info">
            <button
              className="prev"
              disabled={year === minYear && month === minMonth}
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
                  {["일", "월", "화", "수", "목", "금", "토"].map(
                    (dayName, index) => (
                      <th
                        key={index}
                        onClick={() => {
                          setSelectedDays(() =>
                            getDaysByWeekday(
                              buildCalendarRows(calendarData),
                              index
                            )
                          );
                        }}
                      >
                        {dayName}
                        <button className="selectAllSameDays">
                          전체선택
                        </button>
                      </th>
                    )
                  )}
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
                              : [...data, date]
                          );
                        }}
                        style={{ verticalAlign: "top" }}
                      >
                        <div>{date ? date.day : ""}</div>

                        {date &&
                          getRoomsByDate(date).map((room) => (
                            <div
                              key={room.id}
                              style={{
                                fontSize: "11px",
                                padding: "2px 4px",
                                marginTop: "2px",
                                borderRadius: "4px",
                                background: getRoomColor(room.name),
                              }}
                            >
                              {room.name}{" "}{room.is_ota === 1 ? "(네이버예약)" : ""}
                            </div>
                          ))}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="btn_area">
            <button
              className="green"
              onClick={() => {
                if (selectedDays.length === 0) {
                  alert("가격을 설정할 날짜를 선택해 주세요");
                  return;
                }

                setIsPop(true);
              }}
            >
              선택한 날짜 객실 가격 설정
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default ReservationManagement;