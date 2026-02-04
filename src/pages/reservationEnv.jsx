import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import MyDatePicker from "../component/datepicker";

function ReservationEnv() {
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
    console.log(buildCalendarRows(calendarData));
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

  const getDaysByWeekday = (data, targetWeekday) => {
    return data.flat().filter((item) => item?.weekday === targetWeekday);
  };

  return (
    <>
      <div className="workspace">
        <div className="title">예약환경 설정</div>
        <div className="content">
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
                  <th
                    onClick={() => {
                      setSelectedDays(() => {
                        return getDaysByWeekday(
                          buildCalendarRows(calendarData),
                          0,
                        );
                      });
                    }}
                  >
                    일 <button className="selectAllSameDays">전체선택</button>
                  </th>
                  <th
                    onClick={() => {
                      setSelectedDays(() => {
                        return getDaysByWeekday(
                          buildCalendarRows(calendarData),
                          1,
                        );
                      });
                    }}
                  >
                    월 <button className="selectAllSameDays">전체선택</button>
                  </th>
                  <th
                    onClick={() => {
                      setSelectedDays(() => {
                        return getDaysByWeekday(
                          buildCalendarRows(calendarData),
                          2,
                        );
                      });
                    }}
                  >
                    화 <button className="selectAllSameDays">전체선택</button>
                  </th>
                  <th
                    onClick={() => {
                      setSelectedDays(() => {
                        return getDaysByWeekday(
                          buildCalendarRows(calendarData),
                          3,
                        );
                      });
                    }}
                  >
                    수 <button className="selectAllSameDays">전체선택</button>
                  </th>
                  <th
                    onClick={() => {
                      setSelectedDays(() => {
                        return getDaysByWeekday(
                          buildCalendarRows(calendarData),
                          4,
                        );
                      });
                    }}
                  >
                    목 <button className="selectAllSameDays">전체선택</button>
                  </th>
                  <th
                    onClick={() => {
                      setSelectedDays(() => {
                        return getDaysByWeekday(
                          buildCalendarRows(calendarData),
                          5,
                        );
                      });
                    }}
                  >
                    금 <button className="selectAllSameDays">전체선택</button>
                  </th>
                  <th
                    onClick={() => {
                      setSelectedDays(() => {
                        return getDaysByWeekday(
                          buildCalendarRows(calendarData),
                          6,
                        );
                      });
                    }}
                  >
                    토 <button className="selectAllSameDays">전체선택</button>
                  </th>
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
                        {date ? date.day : ""}
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
      {isPop && (
        <div className="popup_wrap">
          <div className="popup">
            <div className="popup_title">객실가격 설정</div>
            <div
              className="popup_x"
              onClick={() => {
                setIsPop(false);
              }}
            >
              X
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ReservationEnv;
