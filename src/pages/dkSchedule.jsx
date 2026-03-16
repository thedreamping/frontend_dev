import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import MyDatePicker from "../component/datepicker";
import api from "../api/api.js";

function DkSchedule() {
  const now = new Date();

  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [calendarData, setCalendarData] = useState(null);

  const [selectedDays, setSelectedDays] = useState([]);
  const [isPop, setIsPop] = useState(false);

  const [name, setName] = useState("");
  const [detail, setDetail] = useState("");
  const [scheduleData, setScheduleData] = useState([]);
  const [color, setColor] = useState("");

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

  useEffect(() => {
    getSchedule();
  }, []);

  const nextMonth = () => setMonth((prev) => prev + 1);
  const prevMonth = () => setMonth((prev) => prev - 1);

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

  useEffect(() => {
    console.log(selectedDays);
  }, [selectedDays]);

  const saveSchedule = () => {
    const data = {
      schedule_name: name,
      schedule_contents: detail,
      days: selectedDays,
      color: color,
    };

    api.post("/api/dk_schedule", data).then((response) => {
      console.log(response);
      setIsPop(false);
      alert("스케쥴 생성 성공");
      getSchedule();
    });
  };

  const getSchedule = () => {
    api.get("/api/dk_schedule").then((response) => {
      console.log(response);
      setScheduleData(response.data.data);
    });
  };

  const findScheduleByDate = (date) => {
    if (!date) return [];

    return scheduleData.filter((schedule) =>
      schedule.days.some(
        (d) =>
          d.year === date.year && d.month === date.month && d.day === date.day,
      ),
    );
  };

  const removeScheduleDay = (scheduleId, date) => {
    api
      .put("/api/dk_schedule/remove-day", {
        schedule_id: scheduleId,
        year: date.year,
        month: date.month,
        day: date.day,
      })
      .then(() => {
        getSchedule();
      });
  };

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
              <colgroup>
                <col style={{ width: "14.28%" }} />
                <col style={{ width: "14.28%" }} />
                <col style={{ width: "14.28%" }} />
                <col style={{ width: "14.28%" }} />
                <col style={{ width: "14.28%" }} />
                <col style={{ width: "14.28%" }} />
                <col style={{ width: "14.28%" }} />
              </colgroup>
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
                    {week.map((date, colIndex) => {
                      const schedules = findScheduleByDate(date);

                      return (
                        <td
                          key={colIndex}
                          className={
                            (selectedDays.includes(date) ? "day_active " : "") +
                            (schedules.length > 0 ? "has_schedule" : "")
                          }
                          onClick={() => {
                            if (!date) return;

                            setSelectedDays((data) =>
                              data.includes(date)
                                ? data.filter((d) => d !== date)
                                : [...data, date],
                            );
                          }}
                          style={{ verticalAlign: "top" }}
                        >
                          <div>{date ? date.day : ""}</div>

                          {schedules.map((s, i) => (
                            <div
                              key={i}
                              className="schedule_badge"
                              style={{ backgroundColor: s.color }}
                            >
                              {s.schedule_name}{" "}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeScheduleDay(s.id, date);
                                }}
                              >
                                X
                              </button>
                            </div>
                          ))}
                        </td>
                      );
                    })}
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
                          >{`${data.year}-${
                            data.month < 10 ? "0" + data.month : data.month
                          }-${
                            data.day < 10 ? "0" + data.day : data.day
                          }`}</span>
                        );
                      })}
                    </td>
                  </tr>

                  <tr>
                    <th>일정명</th>

                    <td>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                        }}
                      />
                    </td>
                  </tr>

                  <tr>
                    <th>자세한 내역</th>

                    <td>
                      <textarea
                        value={detail}
                        onChange={(e) => {
                          setDetail(e.target.value);
                        }}
                      ></textarea>
                    </td>
                  </tr>
                  <tr>
                    <th>뱃지 컬러</th>
                    <td>
                      <select
                        onChange={(e) => {
                          setColor(e.target.value);
                        }}
                      >
                        <option>색상선택</option>
                        <option value={"red"}>red</option>
                        <option value={"red"}>orange</option>
                        <option value={"blue"}>blue</option>
                        <option value={"green"}>green</option>
                      </select>
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
