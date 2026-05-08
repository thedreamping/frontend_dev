import { useState, useEffect, useRef } from "react";
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
  const [rooms, setRooms] = useState([]);
  const [groups, setGroups] = useState([]);
  const [manualMap, setManualMap] = useState({});

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

  // =================================================
  // 🔥 FIX: color map 유지 (렌더 리셋 방지)
  // =================================================
  const groupColorMap = useRef({});
  const colorIndex = useRef(0);

  const getRoomColor = (roomName) => {
    const groupName = roomName.replace(/[0-9]/g, "");

    if (!groupColorMap.current[groupName]) {
      groupColorMap.current[groupName] =
        colorPalette[colorIndex.current % colorPalette.length];

      colorIndex.current++;
    }

    return groupColorMap.current[groupName];
  };

  // =================================================
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

  // =================================================
  const getDaysByWeekday = (data, targetWeekday) => {
    return data.flat().filter((item) => item?.weekday === targetWeekday);
  };

  // =================================================
  const getRoomsByDate = (date) => {
    if (!date) return [];

    const target = `${date.year}-${String(date.month).padStart(2, "0")}-${String(
      date.day
    ).padStart(2, "0")}`;

    return rooms.filter((room) => {
      if (!room.check_in_and_out) return false;

      let schedules = room.check_in_and_out;

      if (typeof schedules === "string") {
        try {
          schedules = JSON.parse(schedules);
        } catch {
          return false;
        }
      }

      if (!Array.isArray(schedules)) return false;

      return schedules.some((schedule) => {
        if (!schedule.check_in || !schedule.check_out) return false;

        return (
          target >= schedule.check_in &&
          target <= schedule.check_out
        );
      });
    });
  };

  useEffect(() => {
    getRooms();
    getRoomGroups();
  }, []);

  const getRooms = () => {
    api.get("/api/rooms").then((response) => {
      setRooms(response.data.data || []);
    });
  };

  const getRoomGroups = () => {
    api.get("/api/room_group").then((response) => {
      setGroups(response.data.data || []);
    });
  };

  const isConsecutiveDays = (days) => {
    if (!days || days.length === 0) return false;

    const sorted = [...days].sort(
      (a, b) =>
        new Date(a.year, a.month - 1, a.day) -
        new Date(b.year, b.month - 1, b.day)
    );

    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i - 1].year, sorted[i - 1].month - 1, sorted[i - 1].day);
      const curr = new Date(sorted[i].year, sorted[i].month - 1, sorted[i].day);

      const diff = (curr - prev) / (1000 * 60 * 60 * 24);

      if (diff !== 1) return false;
    }

    return true;
  };

  const formatRange = (days) => {
    if (!days || days.length === 0) return "";

    const sorted = [...days].sort(
      (a, b) =>
        new Date(a.year, a.month - 1, a.day) -
        new Date(b.year, b.month - 1, b.day)
    );

    const start = sorted[0];
    const end = sorted[sorted.length - 1];

    return `${start.year}-${start.month}-${start.day} ~ ${end.year}-${end.month}-${end.day}`;
  };

  // =================================================
  // 🔥 FIX: overlap 함수 통합 사용
  // =================================================
  const isOverlap = (room, selectedDays) => {
    if (!room.check_in_and_out) return false;

    let schedules = room.check_in_and_out;

    if (typeof schedules === "string") {
      try {
        schedules = JSON.parse(schedules);
      } catch {
        return false;
      }
    }

    return selectedDays.some((d) => {
      const target = `${d.year}-${String(d.month).padStart(2, "0")}-${String(
        d.day
      ).padStart(2, "0")}`;

      return schedules.some(
        (s) =>
          target >= s.check_in &&
          target <= s.check_out
      );
    });
  };
  const getAvailableCount = (groupId) => {
    const groupRooms = rooms.filter(r => r.room_group_id === groupId);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return groupRooms.filter((room) => {
      if (!room.check_in || !room.check_out) return true;

      const checkOut = new Date(room.check_out);
      checkOut.setHours(0, 0, 0, 0);

      // 오늘보다 이전 종료 → 사용 가능
      if (checkOut < today) return true;

      // 오늘 체크아웃 포함, selectedDays 겹치면 불가
      return !isOverlap(room.check_in, room.check_out, selectedDays);
    }).length;
  };

  const getTotalCount = (groupId) => {
    return rooms.filter(r => r.room_group_id === groupId).length;
  };

  const getGroupRoomInfo = (groupId) => {
    const total = getTotalCount(groupId);
    const available = getAvailableCount(groupId);

    return { total, available };
  };

  useEffect(() => {
    console.log(selectedDays);
  }, [selectedDays]);

  const formatDate = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");

    return `${yyyy}-${mm}-${dd} 00:00:00`;
  };

  const modifyReservationSchedule = async () => {
    try {
      const range = selectedDays
        .map(d => new Date(d.year, d.month - 1, d.day))
        .sort((a, b) => a - b);

      const check_in = range[0];
      const check_out = new Date(range[range.length - 1]);
      check_out.setDate(check_out.getDate()); // 중요: 체크아웃은 +1

      const groupsToApply = Object.entries(manualMap)
        .filter(([_, count]) => count > 0);

      for (const [groupId, count] of groupsToApply) {
       

        const groupRooms = rooms.filter(
          (r) =>
            r.room_group_id === Number(groupId) &&
            (
              !r.check_in ||
              !r.check_out ||
              !isOverlap(r, selectedDays)
            )
        );

        let assigned = 0;

        for (const room of groupRooms) {
          if (assigned >= count) break;

          await api.put(`/api/room/${room.id}`, {
            name: room.name,
            is_active: 0,
            capacity_max: room.capacity_max,
            capacity_min: room.capacity_min,
            day_use: room.day_use,
            disable_start: formatDate(check_in),
            disable_end: formatDate(check_out),
            reason: "수기예약",
          });

          assigned++;
        }
      }

      alert("수기예약 완료");
      setIsPop(false);
      setManualMap({});
      setSelectedDays([]);
      getRooms(); // refresh
    } catch (err) {
      console.error(err);
      alert("수기예약 실패");
    }
  };

  const increase = (groupId, max) => {
    setManualMap((prev) => {
      const current = prev[groupId] || 0;
      if (current >= max) return prev;

      return { ...prev, [groupId]: current + 1 };
    });
  };

  const decrease = (groupId) => {
    setManualMap((prev) => {
      const current = prev[groupId] || 0;
      if (current <= 0) return prev;

      return { ...prev, [groupId]: current - 1 };
    });
  };

  const getManualReservations = () => {
    if (!selectedDays.length) return [];

    return rooms.filter((room) => {
      if (room.is_soogie !== 1) return false;

      return isOverlap(room.disable_start, room.disable_end, selectedDays);
    });
  };

  const cancelManualReservation = async (room) => {
    console.log("취소 클릭됨", room);

    if (!confirm("수기예약 취소할까요?")) return;

    try {
     

      const response = await api.put(`/api/room/${room.id}`, {
        name: room.name,
        is_active: 1,
        capacity_max: room.capacity_max,
        capacity_min: room.capacity_min,
        day_use: room.day_use,
        disable_start: null,
        disable_end: null,
        reason: null,
        is_soogie: 0,
      });



      alert("취소 완료");
      getRooms();
    } catch (err) {
      console.error("취소 실패 상세:", err.response?.data || err);
      alert("취소 실패");
    }
  };

  return (
    <>
      <div className="workspace">
        <div className="title">객실예약 조회 / 관리</div>

        <div className="content">
          <div className="btn_area">
            <button
              className="green"
              onClick={() => {
                if (selectedDays.length === 0) {
                  alert("가격을 설정할 날짜를 선택해 주세요");
                  return;
                }
                if (!isConsecutiveDays(selectedDays)) {
                  alert("날짜는 연속으로 선택해야 합니다.");
                  return;
                }
                setIsPop(true);
              }}
            >
              선택한 날짜 수기예약
            </button>
          </div>

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
              <colgroup>
                <col style={{ width: "14%" }} />
                <col style={{ width: "14%" }} />
                <col style={{ width: "14%" }} />
                <col style={{ width: "14%" }} />
                <col style={{ width: "14%" }} />
                <col style={{ width: "14%" }} />
                <col style={{ width: "14%" }} />
              </colgroup>

              <thead>
                <tr>
                  {["일", "월", "화", "수", "목", "금", "토"].map(
                    (dayName, index) => (
                      <th key={index}>{dayName}</th>
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
                              {room.name}{" "}
                              {room.is_ota === 1 ? "(네이버예약)" : ""}
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
                if (!isConsecutiveDays(selectedDays)) {
                  alert("날짜는 연속으로 선택해야 합니다.");
                  return;
                }
                setIsPop(true);
              }}
            >
              선택한 날짜 수기예약
            </button>
          </div>
        </div>
      </div>

      {isPop && (
        <div className="popup_wrap">
          <div className="popup" style={{ height: "auto", width: "700px" }}>
            <div className="popup_title">선택한 날짜 수기 예약</div>
            <div
              className="popup_x"
              onClick={() => setIsPop(false)}
            >
              X
            </div>

            <table>
              <colgroup>
                <col style={{ width: "140px" }} />
                <col style={{ width: "auto" }} />
              </colgroup>

              <tbody>
                <tr>
                  <th>선택한 기간</th>
                  <td>{formatRange(selectedDays)}</td>
                </tr>

                <tr>
                  <th>객실</th>
                  <td>
                    <div style={{width:"100%",maxHeight:"340px",overflow:'auto',height:"auto"}}>
                      {groups.map((group) => {
                        const { available } = getGroupRoomInfo(group.id);

                        return (
                          <div key={group.id} className="room_controll_cell">
                            {group.name} (남은 방 수 : {available})

                            <div className="room_controll_cell_pl_mi">
                              <button type="button" className="plus" onClick={() => increase(group.id, available)}>+</button>

                              {manualMap[group.id] || 0}

                              <button type="button" className="minus" onClick={() => decrease(group.id)}>-</button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </td>
                </tr>
                <tr>
                  <th>
                    기존 수기예약
                  </th>
                  <td>
                    <div style={{width:"100%",maxHeight:"340px",overflow:'auto',height:"auto"}}>
                      {getManualReservations().length === 0 ? (
                          <div>없음</div>
                        ) : (
                          getManualReservations().map((room) => (
                            <div
                              key={room.id}
                              className="room_controll_cell"
                              style={{ marginBottom: "8px" }}
                            >
                              <div style={{display:'inline-block',verticalAlign:"top"}}>
                                {room.name}
                                {" "}
                                <small>
                                  {room.disable_start?.slice(0, 10)} ~{" "}
                                  {room.disable_end?.slice(0, 10)}
                                </small>
                                {" "}
                              </div>

                              <button
                                className="minus"
                                type="button"
                                onClick={() => cancelManualReservation(room)}
                              >
                                취소
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="btn_area">
              <button className="green" onClick={modifyReservationSchedule}>수기 예약 적용</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ReservationManagement;