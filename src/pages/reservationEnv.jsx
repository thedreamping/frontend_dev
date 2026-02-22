import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import MyDatePicker from "../component/datepicker";
import api from "../api/api";

function ReservationEnv() {
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
    loadData();
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

  useEffect(() => {
    getRoomGroup();
  }, []);

  const getRoomGroup = () => {
    api.get("/api/room_group").then((response) => {
      const newData = response.data.data.map((item) => ({
        ...item,
        price: 0,
      }));

      setRoomGroup(newData);
      setCheckedId(newData.map((data) => data.id));
    });
  };

  const saveRoomPrice = async () => {
    try {
      const formattedDates = selectedDays.map((d) => {
        const month = d.month < 10 ? "0" + d.month : d.month;
        const day = d.day < 10 ? "0" + d.day : d.day;
        return `${d.year}-${month}-${day}`;
      });

      // ✅ 체크된 룸만 필터링
      const rooms = roomGroup
        .filter((room) => checkedId.includes(room.id))
        .map((room) => ({
          room_group_id: room.id,
          room_group_name: room.name,
          price: Number(room.price),
        }));

      if (rooms.length === 0) {
        alert("선택된 객실이 없습니다.");
        return;
      }

      await api.post("/api/room-price", {
        dates: formattedDates,
        rooms: rooms,
      });

      alert("가격 저장 완료");
      setIsPop(false);
    } catch (err) {
      console.error(err);
      alert("저장 중 오류 발생");
    }
  };

  useEffect(() => {
    console.log(checkedId);
  }, [checkedId]);

  const loadData = () => {
    api.get(`/api/room-price?year=${year}&month=${month}`).then((response) => {
      console.log(response);
      setPriceInfos(response.data.data);
    });
  };

  const getPricesByDate = (date) => {
    if (!date || !priceInfos) return [];

    const month = date.month < 10 ? "0" + date.month : date.month;
    const day = date.day < 10 ? "0" + date.day : date.day;

    const formatted = `${date.year}-${month}-${day}`;

    return priceInfos.filter((item) => item.date === formatted);
  };

  const editOnlyOne = (date, rooms) => {
    console.log(date, rooms);
    if (!date) return;
    setSelectedDays([date]);
    setIsOneDayEdit(true);
    if (!rooms || rooms.length === 0) {
      setIsPop(true);
      return;
    }
    setRoomGroup((data) => {
      return data.map((item) => {
        const matchedRoom = rooms.find((r) => r.room_group_name === item.name);
        return {
          ...item,
          price: matchedRoom ? matchedRoom.price : 0,
        };
      });
    });
    setCheckedId(rooms.map((r) => r.room_group_id));
    setIsPop(true);
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
                        <div>
                          {date ? date.day : ""}{" "}
                          <button
                            style={{ float: "right" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              editOnlyOne(date, getPricesByDate(date));
                            }}
                          >
                            수정
                          </button>
                        </div>
                        <div className="day_prices">
                          {getPricesByDate(date).map((price, idx) => (
                            <div key={idx} className="price_item">
                              {price.room_group_name} :{" "}
                              {price.price.toLocaleString()}원
                            </div>
                          ))}
                        </div>
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
          <div className="popup" style={{ width: "1200px", height: "600px" }}>
            <div className="popup_title">객실가격 설정</div>
            <div
              className="popup_x"
              onClick={() => {
                setIsPop(false);
              }}
            >
              X
            </div>
            <div className="btn_area">
              <button className="green" onClick={saveRoomPrice}>
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
                    <td colSpan={2}>
                      <table>
                        <tbody>
                          {roomGroup.map((data, i) => {
                            return (
                              <tr key={`kgjdf${i}`}>
                                <th style={{ textAlign: "left" }}>
                                  <div className="checks">
                                    <input
                                      type="checkbox"
                                      id={data.id}
                                      checked={checkedId.includes(data.id)}
                                      onChange={(e) => {
                                        const isChecked = e.target.checked;

                                        setCheckedId((prev) => {
                                          if (isChecked) {
                                            return prev.includes(data.id)
                                              ? prev
                                              : [...prev, data.id];
                                          } else {
                                            return prev.filter(
                                              (id) => id !== data.id,
                                            );
                                          }
                                        });
                                      }}
                                    />
                                    <label htmlFor={data.id}></label>
                                  </div>{" "}
                                  {data.name}
                                </th>
                                <td>
                                  <input
                                    type="number"
                                    value={data.price}
                                    onChange={(e) => {
                                      const value = Number(e.target.value);

                                      setRoomGroup((prev) =>
                                        prev.map((item, index) =>
                                          index === i
                                            ? { ...item, price: value }
                                            : item,
                                        ),
                                      );
                                    }}
                                    disabled={!checkedId.includes(data.id)}
                                  />{" "}
                                  원
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="btn_area">
                <button className="green" onClick={saveRoomPrice}>
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

export default ReservationEnv;
