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
  const [memos, setMemos] = useState({});
  const [isPop2, setIsPop2] = useState(false);
  const [isHistory, setIsHistory] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyLimit, setHistoryLimit] = useState(10);
  const [guestMemo, setGuestMemo] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [historyData, setHistoryData] = useState([]);
  const [historyTotalPage, setHistoryTotalPage] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);

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

  const hasNaverBooking = (room, date) => {
    if (!room.check_in_and_out) return false;

    let schedules = room.check_in_and_out;

    if (typeof schedules === "string") {
      schedules = JSON.parse(schedules);
    }

    const target = `${date.year}-${String(date.month).padStart(2, "0")}-${String(
      date.day,
    ).padStart(2, "0")}`;

    return schedules.some(
      (s) =>
        s.source === "naver" && target >= s.check_in && target <= s.check_out,
    );
  };

  const getBookingForDate = (room, date) => {
    const schedules = getAllSchedules(room);

    const target = `${date.year}-${String(date.month).padStart(2, "0")}-${String(
      date.day,
    ).padStart(2, "0")}`;

    return schedules.find((s) => {
      const start = normalize(s.check_in);
      const end = normalize(s.check_out);

      return start && end && target >= start && target <= end;
    });
  };

  const isDayBooking = (booking) => {
    if (!booking) return false;
    return booking.check_in === booking.check_out;
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
      date.day,
    ).padStart(2, "0")}`;

    return rooms.filter((room) => {
      const schedules = getAllSchedules(room);

      return schedules.some((schedule) => {
        if (!schedule.check_in || !schedule.check_out) return false;

        const start = normalize(schedule.check_in);
        const end = normalize(schedule.check_out);

        return target >= start && target <= end;
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
        new Date(b.year, b.month - 1, b.day),
    );

    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(
        sorted[i - 1].year,
        sorted[i - 1].month - 1,
        sorted[i - 1].day,
      );
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
        new Date(b.year, b.month - 1, b.day),
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
        d.day,
      ).padStart(2, "0")}`;

      return schedules.some(
        (s) => target >= s.check_in && target <= s.check_out,
      );
    });
  };

  const normalize = (d) => d?.slice(0, 10);

  const toTime = (d) => new Date(d).getTime();

  const getAvailableCount = (groupId) => {
    const groupRooms = rooms.filter(
      (r) => Number(r.room_group_id) === Number(groupId),
    );

    return groupRooms.filter((room) => isRoomAvailable(room, selectedDays))
      .length;
  };

  const getTotalCount = (groupId) => {
    return rooms.filter((r) => r.room_group_id === groupId).length;
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
        .map((d) => new Date(d.year, d.month - 1, d.day))
        .sort((a, b) => a - b);

      const check_in = range[0];
      const check_out = new Date(range[range.length - 1]);

      check_out.setDate(check_out.getDate());

      const groupsToApply = Object.entries(manualMap).filter(
        ([_, count]) => count > 0,
      );

      for (const [groupId, count] of groupsToApply) {
        const groupRooms = rooms.filter(
          (r) =>
            r.room_group_id === Number(groupId) &&
            (!r.check_in || !r.check_out || !isOverlap(r, selectedDays)),
        );

        let assigned = 0;

        for (const room of groupRooms) {
          if (assigned >= count) break;

          const memoText = memos[groupId]?.[assigned] || "";

          await api.put(`/api/room/${room.id}`, {
            name: room.name,
            is_active: 0,
            capacity_max: room.capacity_max,
            capacity_min: room.capacity_min,
            day_use: room.day_use,
            disable_start: formatDate(check_in),
            disable_end: formatDate(check_out),
            reason: "수기예약",

            manual_booking: {
              source: "manual",
              check_in: formatDate(check_in).slice(0, 10),
              check_out: formatDate(check_out).slice(0, 10),
              memo: memoText,
            },
          });

          assigned++;
        }
      }

      alert("수기예약 완료");

      setIsPop(false);
      setManualMap({});
      setMemos({});
      setSelectedDays([]);

      getRooms();
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

    const result = [];

    for (const room of rooms) {
      let schedules = [];

      try {
        schedules =
          typeof room.check_in_and_out_soogie === "string"
            ? JSON.parse(room.check_in_and_out_soogie)
            : room.check_in_and_out_soogie || [];
      } catch {
        schedules = [];
      }

      for (const schedule of schedules) {
        const match = selectedDays.some((d) => {
          const target = `${d.year}-${String(d.month).padStart(2, "0")}-${String(d.day).padStart(2, "0")}`;

          return target >= schedule.check_in && target <= schedule.check_out;
        });

        if (match) {
          result.push({
            ...room,
            room_id: room.id,
            room_name: room.name,
            ...schedule,
          });
        }
      }
    }

    return result;
  };

  const cancelManualReservation = async (room) => {
    console.log("취소 클릭됨", room);

    if (!confirm("수기예약 취소할까요?")) return;

    try {
      const response = await api.put(`/api/room/${room.room_id}`, {
        name: room.room_name,
        is_active: 1,
        capacity_max: room.capacity_max,
        capacity_min: room.capacity_min,
        day_use: room.day_use,
        disable_start: null,
        disable_end: null,
        reason: null,
        is_soogie: 0,
        cancel_booking: {
          source: "manual",
          check_in: room.check_in,
          check_out: room.check_out,
        },
      });

      alert("취소 완료");
      getRooms();
    } catch (err) {
      console.error("취소 실패 상세:", err.response?.data || err);
      alert("취소 실패");
    }
  };

  const getAllSchedules = (room) => {
    let naver = [];
    let soogie = [];

    try {
      naver = room.check_in_and_out || "[]";
    } catch {}

    try {
      soogie = room.check_in_and_out_soogie || "[]";
    } catch {}

    return [...naver, ...soogie];
  };
  const isRoomAvailable = (room, selectedDays) => {
    const dayUse = Number(room.day_use);

    // 날짜 범위
    const isSingleDay = selectedDays.length === 1;
    const isMultiDay = selectedDays.length > 1;

    // 0: 숙박만 → 1일 선택도 막고 싶다면
    if (dayUse === 0 && isSingleDay) {
      return false;
    }

    // 2: 데이만 → 2일 이상 선택 금지 (이게 핵심)
    if (dayUse === 2 && isMultiDay) {
      return false;
    }

    const schedules = getAllSchedules(room);

    return !selectedDays.some((d) => {
      const target = `${d.year}-${String(d.month).padStart(2, "0")}-${String(
        d.day,
      ).padStart(2, "0")}`;

      return schedules.some((s) => {
        const start = normalize(s.check_in);
        const end = normalize(s.check_out);

        if (!start || !end) return false;

        return target >= start && target <= end;
      });
    });
  };

  const getNaverReservations = () => {
    if (!selectedDays.length) return [];

    const result = [];

    for (const room of rooms) {
      let schedules = [];

      try {
        schedules =
          typeof room.naver_crawling_info === "string"
            ? JSON.parse(room.naver_crawling_info)
            : room.naver_crawling_info || [];
      } catch {
        schedules = [];
      }

      for (const schedule of schedules) {
        const match = selectedDays.some((d) => {
          const target = `${d.year}-${String(d.month).padStart(2, "0")}-${String(
            d.day,
          ).padStart(2, "0")}`;

          return target >= schedule.check_in && target <= schedule.check_out;
        });

        if (match) {
          result.push({
            ...room,
            room_id: room.id,
            room_name: room.name,
            ...schedule,
          });
        }
      }
    }

    return result;
  };

  const getBookingsByDate = (date) => {
    if (!date) return [];

    const target = `${date.year}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`;

    const result = [];

    for (const room of rooms) {
      const schedules = getAllSchedules(room);

      for (const schedule of schedules) {
        const start = normalize(schedule.check_in);
        const end = normalize(schedule.check_out);

        if (!start || !end) continue;

        if (target >= start && target <= end) {
          result.push({
            room,
            booking: schedule,
          });
        }
      }
    }

    return result;
  };

  const getHistory = () => {
    api
      .get(
        `/api/reservation_history?page=${historyPage}&limit=${historyLimit}&guest_name=${encodeURIComponent(guestName)}&guest_phone=${encodeURIComponent(guestPhone)}&memo=${encodeURIComponent(guestMemo)}`,
      )
      .then((response) => {
        console.log(response);

        setHistoryData(response.data.list);

        setHistoryTotal(response.data.total);
        setHistoryTotalPage(response.data.totalPage);
      });
  };

  const toKoreanDate = (value) => {
    if (!value) {
      return "";
    }

    return new Date(value).toLocaleDateString("sv-SE", {
      timeZone: "Asia/Seoul",
    });
  };

  const renderPayload = (payload) => {
    try {
      const data = typeof payload === "string" ? JSON.parse(payload) : payload;

      return `
      예약자 : ${data.name}<br />
      연락처 : ${data.phone}<br />
      상품명 : ${data.product_name}<br />
      인원 : ${data.qty}명<br />
      금액 : ${data.price.toLocaleString()}원<br />
      체크인 : ${data.check_in}<br />
      체크아웃 : ${data.check_out}<br />
      예약번호 : ${data.booking_id}
    `;
    } catch (err) {
      return "-";
    }
  };

  useEffect(() => {
    if (isHistory) {
      getHistory();
    }
  }, [historyPage, isHistory]);

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
              선택한 날짜 수기예약 / 취소
            </button>
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
                setIsPop2(true);
              }}
            >
              선택한 날짜 네이버예약 상세
            </button>
            <button className="green">현재날짜 기준 엑셀 다운로드</button>
            <button
              className="green"
              onClick={() => {
                setIsHistory(true);
              }}
            >
              예약 히스토리
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
                    ),
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
                              : [...data, date],
                          );
                        }}
                        style={{ verticalAlign: "top" }}
                      >
                        <div>{date ? date.day : ""}</div>

                        {date &&
                          getBookingsByDate(date).map(
                            ({ room, booking }, idx) => (
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
                                {(() => {
                                  if (!booking) return "";

                                  const label =
                                    booking.source === "naver"
                                      ? "네이버예약"
                                      : "수기예약";

                                  const checkout = booking.check_out.slice(5);

                                  return `(${label}${isDayBooking(booking) ? " 데이" : ` 체크아웃:${checkout}`})`;
                                })()}
                              </div>
                            ),
                          )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isPop && (
        <div className="popup_wrap">
          <div className="popup" style={{ height: "auto", width: "700px" }}>
            <div className="popup_title">선택한 날짜 수기 예약</div>
            <div
              className="popup_x"
              onClick={() => {
                setIsPop(false);
                setManualMap({});
                setMemos({});
                setSelectedDays([]);
              }}
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
                    <div
                      style={{
                        width: "100%",
                        maxHeight: "340px",
                        overflow: "auto",
                        height: "auto",
                      }}
                    >
                      {groups.map((group) => {
                        const { available } = getGroupRoomInfo(group.id);

                        return (
                          <div key={group.id} className="room_controll_cell">
                            {group.name} (남은 방 수 : {available})
                            <div className="room_controll_cell_pl_mi">
                              <button
                                type="button"
                                className="plus"
                                onClick={() => increase(group.id, available)}
                              >
                                +
                              </button>

                              {manualMap[group.id] || 0}

                              <button
                                type="button"
                                className="minus"
                                onClick={() => decrease(group.id)}
                              >
                                -
                              </button>
                            </div>
                            <div className={"input_wrap"}>
                              {Array.from({
                                length: manualMap[group.id] || 0,
                              }).map((_, idx) => (
                                <input
                                  key={idx}
                                  type="text"
                                  placeholder={`세부정보 ${idx + 1}`}
                                  value={memos[group.id]?.[idx] || ""}
                                  onChange={(e) => {
                                    const value = e.target.value;

                                    setMemos((prev) => {
                                      const current = [
                                        ...(prev[group.id] || []),
                                      ];

                                      current[idx] = value;

                                      return {
                                        ...prev,
                                        [group.id]: current,
                                      };
                                    });
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </td>
                </tr>
                <tr>
                  <th>기존 수기예약</th>
                  <td>
                    <div
                      style={{
                        width: "100%",
                        maxHeight: "140px",
                        overflow: "auto",
                        height: "auto",
                      }}
                    >
                      {getManualReservations().length === 0 ? (
                        <div>없음</div>
                      ) : (
                        getManualReservations().map((room) => {
                          console.log(room);
                          return (
                            <div
                              key={room.id}
                              className="room_controll_cell"
                              style={{ marginBottom: "8px" }}
                            >
                              <div
                                style={{
                                  display: "inline-block",
                                  verticalAlign: "top",
                                }}
                              >
                                {room.room_name}{" "}
                                <small>
                                  {room.check_in?.slice(0, 10)} ~{" "}
                                  {room.check_out?.slice(0, 10)}
                                </small>{" "}
                              </div>

                              <button
                                className="minus"
                                type="button"
                                onClick={() => cancelManualReservation(room)}
                              >
                                취소
                              </button>
                              <div className="input_wrap">
                                <textarea
                                  value={room.memo || ""}
                                  placeholder="메모 없음"
                                  style={{
                                    width: "100%",
                                    height: "100px",
                                    resize: "none",
                                  }}
                                  readOnly
                                />
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="btn_area">
              <button className="green" onClick={modifyReservationSchedule}>
                수기 예약 적용
              </button>
            </div>
          </div>
        </div>
      )}

      {isPop2 && (
        <div className="popup_wrap">
          <div className="popup" style={{ height: "auto", width: "700px" }}>
            <div className="popup_title">선택한 날짜 네이버예약 상세</div>

            <div
              className="popup_x"
              onClick={() => {
                setIsPop2(false);
              }}
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
                  <th>네이버 예약</th>

                  <td>
                    <div
                      style={{
                        width: "100%",
                        maxHeight: "500px",
                        overflow: "auto",
                      }}
                    >
                      {getNaverReservations().length === 0 ? (
                        <div>없음</div>
                      ) : (
                        getNaverReservations().map((room, idx) => (
                          <div
                            key={idx}
                            className="room_controll_cell"
                            style={{ marginBottom: "12px" }}
                          >
                            <div>
                              <b>{room.room_name}</b>
                            </div>

                            <div>
                              {room.check_in?.slice(0, 10)} ~{" "}
                              {room.check_out?.slice(0, 10)}
                            </div>

                            <div>예약자 : {room.name}</div>

                            <div>연락처 : {room.phone}</div>

                            <div>상품명 : {room.product_name}</div>

                            <div>수량 : {room.qty}</div>

                            <div>금액 : {room.price}</div>

                            <div>예약번호 : {room.booking_id}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
      {isHistory && (
        <>
          <div className="popup_wrap">
            <div className="popup" style={{ height: "700px", width: "1600px" }}>
              <div className="popup_title">예약 히스토리</div>

              <div
                className="popup_x"
                onClick={() => {
                  setIsHistory(false);
                }}
              >
                X
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginBottom: "20px",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <input
                  type="text"
                  placeholder="예약자명"
                  value={guestName}
                  onChange={(e) => {
                    setGuestName(e.target.value);
                  }}
                />

                <input
                  type="text"
                  placeholder="전화번호"
                  value={guestPhone}
                  onChange={(e) => {
                    setGuestPhone(e.target.value);
                  }}
                />

                <input
                  type="text"
                  placeholder="메모"
                  value={guestMemo}
                  onChange={(e) => {
                    setGuestMemo(e.target.value);
                  }}
                />

                <button
                  onClick={() => {
                    setHistoryPage(1);

                    setTimeout(() => {
                      getHistory();
                    }, 0);
                  }}
                >
                  검색
                </button>
              </div>
              <div className="rooms_calendar">
                <table>
                  <thead>
                    <th>소스</th>
                    <th>이름</th>
                    <th>전화번호</th>
                    <th>기간</th>
                    <th>가격</th>
                    <th>디테일</th>
                    <th>메모</th>
                  </thead>
                  <tbody>
                    {historyData.map((data, i) => {
                      return (
                        <tr key={i}>
                          <td>{data.source}</td>
                          <td>{data.guest_name}</td>
                          <td>{data.guest_phone}</td>
                          <td>
                            {toKoreanDate(data.check_in)} ~{" "}
                            {toKoreanDate(data.check_out)}
                          </td>
                          <td>{data.price?.toLocaleString()}</td>
                          <td
                            dangerouslySetInnerHTML={{
                              __html: renderPayload(data.payload),
                            }}
                          ></td>
                          <td>{data.memo}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "5px",
                  justifyContent: "center",
                  marginTop: "20px",
                  flexWrap: "wrap",
                }}
              >
                <button
                  disabled={historyPage === 1}
                  onClick={() => {
                    setHistoryPage(historyPage - 1);
                  }}
                >
                  이전
                </button>

                {Array.from(
                  {
                    length:
                      Math.min(historyTotalPage, historyPage + 5) -
                      Math.max(1, historyPage - 5) +
                      1,
                  },
                  (_, i) => Math.max(1, historyPage - 5) + i,
                ).map((page) => {
                  return (
                    <button
                      key={page}
                      style={{
                        fontWeight: historyPage === page ? "bold" : "normal",
                      }}
                      onClick={() => {
                        setHistoryPage(page);
                      }}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  disabled={historyPage === historyTotalPage}
                  onClick={() => {
                    setHistoryPage(historyPage + 1);
                  }}
                >
                  다음
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default ReservationManagement;
