import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import MyDatePicker from "../component/datepicker";
import api from "../api/api";

function RoomManagement() {
  const [isPop, setIsPop] = useState(false);
  const [isPop2, setIsPop2] = useState(false);
  const [isDetailPop, setIsDetailPop] = useState(false);
  const [isDetailPopGroup, setIsDetailPopGroup] = useState(false);
  const [groups, setGroups] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [result, setResult] = useState([]);
  const [isActive, setIsActive] = useState(true);
  const [isActiveGroup, setIsActiveGroup] = useState(true);
  const [roomReason, setRoomReason] = useState("");
  const [roomDetailName, setRoomDetailName] = useState("");
  const [roomDetailGroupName, setRoomDetailGroupName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [groupName, setGroupName] = useState("");
  const [groupReason, setGroupReason] = useState("");
  const [groupId, setGroupId] = useState("");
  const [groupNameForCreate, setGroupNameForCreate] = useState("");
  const [isDay, setIsDay] = useState(0);
  const [capacityMin, setCapacityMin] = useState(0);
  const [capacityMax, setCapacityMax] = useState(0);
  const [roomNameForCreate, setRoomNameForCreate] = useState("");
  const [roomGroupId, setRoomGroupId] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [workPopForSelectedIds, setWorkPopForSelectedIds] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isPop3, setIsPop3] = useState(false);
  const [roomNameForCreateImsi, setRoomNameForCreateImsi] = useState("");
  const [capacityMinImsi, setCapacityMinImsi] = useState(0);
  const [capacityMaxImsi, setCapacityMaxImsi] = useState(0);

  useEffect(() => {
    getAllRooms();
  }, []);

  useEffect(() => {
    console.log(groups);
    console.log(rooms);
    setResult(mergeGroupsWithRooms(groups, rooms));
  }, [groups, rooms]);

  useEffect(() => {
    console.log(result);
  }, [result]);

  const getAllRooms = () => {
    api.get("/api/room_group").then((response) => {
      console.log(response);
      setGroups(response.data.data);
      api.get("/api/rooms").then((response) => {
        console.log(response);
        setRooms(response.data.data);
      });
    });
  };

  const mergeGroupsWithRooms = (groups, rooms) => {
    const roomMap = new Map();

    // room_group_id 기준으로 미리 묶기
    for (const room of rooms) {
      const groupId = room.room_group_id;

      if (!roomMap.has(groupId)) {
        roomMap.set(groupId, []);
      }

      roomMap.get(groupId).push(room);
    }

    // 그룹에 rooms 붙이기
    return groups.map((group) => ({
      ...group,
      rooms: roomMap.get(group.id) || [],
    }));
  };
  const modifyRoom = () => {
    const isExtra = String(roomId).startsWith("EXTRA_");

    if (!isActive && !roomReason?.trim()) {
      alert("사유를 입력해주세요");
      return;
    }

    if (isExtra && (!startDate || !endDate)) {
      alert("임시 객실 운영 기간을 입력해주세요.");
      return;
    }

    if (isExtra && startDate > endDate) {
      alert("시작일은 종료일보다 클 수 없습니다.");
      return;
    }

    const data = {
      name: roomDetailName,
      is_active: isActive ? 1 : 0,
      reason: isActive ? null : roomReason?.trim(),

      // 일반 객실 비활성 기간
      disable_start: isExtra ? null : isActive ? null : startDate,
      disable_end: isExtra ? null : isActive ? null : endDate,

      // 임시 객실 운영 기간
      start_date: isExtra ? startDate : null,
      end_date: isExtra ? endDate : null,

      capacity_max: Number(capacityMax),
      capacity_min: Number(capacityMin),
      day_use: Number(isDay),
    };

    console.log("객실 수정:", {
      roomId,
      isExtra,
      data,
    });

    api
      .put(`/api/room/${roomId}`, data)
      .then((response) => {
        console.log(response);

        alert(
          isExtra
            ? "임시 객실 정보가 수정되었습니다."
            : "객실 정보가 수정되었습니다.",
        );

        setIsDetailPop(false);
        setStartDate("");
        setEndDate("");
        getAllRooms();
      })
      .catch((err) => {
        console.error(err);

        alert(err.response?.data?.message || "수정 중 오류가 발생했습니다.");
      });
  };

  const modifyGroup = () => {
    if (!isActiveGroup && !groupReason?.trim()) {
      alert("사유를 입력해주세요");
      return;
    }
    const data = {
      name: groupName,
      is_active: isActiveGroup ? 1 : 0,
      reason: isActiveGroup ? null : groupReason,
      disable_start: isActiveGroup ? null : startDate,
      disable_end: isActiveGroup ? null : endDate,
    };

    api
      .put(`/api/room-group/${groupId}`, data)
      .then((response) => {
        console.log(response);
        setIsDetailPopGroup(false);
        setStartDate("");
        setEndDate("");
        getAllRooms();
      })
      .catch((err) => {
        console.error(err);
        alert("수정 중 오류가 발생했습니다.");
      });
  };

  const roomDelete = () => {
    const isOk = confirm("삭제하시겠습니까?");

    if (!isOk) return;

    api
      .delete(`/api/room/${roomId}`)
      .then((response) => {
        console.log(response);
        alert("삭제되었습니다.");
        setIsDetailPop(false);
        setStartDate("");
        setEndDate("");
        getAllRooms();
      })
      .catch((err) => {
        console.error(err);
        alert("삭제 중 오류가 발생했습니다.");
      });
  };

  const groupDelete = () => {
    const isOk = confirm("삭제하시겠습니까?");

    if (!isOk) return;

    api
      .delete(`/api/room-group/${groupId}`)
      .then((response) => {
        console.log(response);
        alert("삭제되었습니다.");
        setIsDetailPopGroup(false);
        setStartDate("");
        setEndDate("");
        getAllRooms();
      })
      .catch((err) => {
        console.error(err);
        alert("삭제 중 오류가 발생했습니다.");
      });
  };

  const createGroup = () => {
    if (!groupNameForCreate || groupNameForCreate.trim() === "") {
      alert("그룹명을 입력해주세요.");
      return;
    }

    const data = {
      name: groupNameForCreate,
      description: groupNameForCreate,
    };

    api
      .post(`/api/room-group`, data)
      .then((response) => {
        console.log(response);
        alert("새 그룹이 생성되었습니다.");
        setIsPop2(false);
        setStartDate("");
        setEndDate("");
        getAllRooms();
      })
      .catch((error) => {
        console.error(error);
        alert("생성 중 오류가 발생했습니다.");
      });
  };

  const createRoom = () => {
    // ✅ 이름 체크
    if (!roomNameForCreate || roomNameForCreate.trim() === "") {
      alert("객실명을 입력해주세요.");
      return;
    }

    // ✅ 그룹 체크
    if (!roomGroupId) {
      alert("객실 그룹을 선택해주세요.");
      return;
    }

    const numericMax = Number(capacityMax);
    const numericMin = Number(capacityMin);
    const numericDayUse = Number(isDay);

    // ✅ 숫자 체크
    if (isNaN(numericMax) || isNaN(numericMin)) {
      alert("인원 수는 숫자로 입력해주세요.");
      return;
    }

    // ✅ 최소/최대 검증
    if (numericMin > numericMax) {
      alert("최소 인원은 최대 인원보다 클 수 없습니다.");
      return;
    }

    // ✅ day_use 체크
    if (numericDayUse !== 0 && numericDayUse !== 1) {
      alert("숙박 타입 값이 올바르지 않습니다.");
      return;
    }

    const data = {
      name: roomNameForCreate.trim(),
      description: roomNameForCreate.trim(),
      room_group_id: roomGroupId,
      capacity_max: numericMax,
      capacity_min: numericMin,
      day_use: numericDayUse,
    };

    api
      .post("/api/room", data)
      .then((response) => {
        console.log(response);
        setIsPop(false);
        getAllRooms();
        setStartDate("");
        setEndDate("");
      })
      .catch((error) => {
        console.error(error);
        alert("생성 중 오류가 발생했습니다.");
      });
  };

  useEffect(() => {
    console.log(selectedIds);
  }, [selectedIds]);

  const workForSelected = () => {
    if (!isActiveGroup && !groupReason?.trim()) {
      alert("사유와 기간을 입력해주세요");
      return;
    }
    if (startDate > endDate) {
      alert("시작일은 종료일보다 클 수 없습니다.");
      return;
    }
    const data = {
      ids: selectedIds,
      is_active: isActiveGroup ? 1 : 0,
      reason: isActiveGroup ? null : groupReason,
      disable_start: startDate,
      disable_end: endDate,
    };

    api
      .put(`/api/rooms/bulk-update`, data)
      .then((response) => {
        console.log(response);
        setWorkPopForSelectedIds(false);
        getAllRooms();
      })
      .catch((err) => {
        console.error(err);
        alert("수정 중 오류가 발생했습니다.");
      });
  };

  const handleDateChange1 = (formattedDate) => {
    setStartDate(formattedDate);
  };

  const handleDateChange2 = (formattedDate) => {
    setEndDate(formattedDate);
  };

  const toKSTDate = (date) =>
    new Intl.DateTimeFormat("sv-SE", {
      timeZone: "Asia/Seoul",
    }).format(new Date(date));

  const todayKST = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Seoul",
  }).format(new Date());

  const isRoomOccupiedToday = (room) => {
    const today = todayKST; // "YYYY-MM-DD"

    // 1. 네이버 + 수기 병합
    let naver = room.check_in_and_out;
    let soogie = room.check_in_and_out_soogie;

    const schedules = [...(naver || []), ...(soogie || [])];

    if (schedules.length === 0) return false;

    // 3. 오늘 날짜 포함 여부 체크
    return schedules.some((s) => {
      if (!s?.check_in || !s?.check_out) return false;

      const start = s.check_in;
      const end = s.check_out;

      return today >= start && today <= end;
    });
  };

  const createExtraRoom = () => {
    if (!roomGroupId) {
      alert("객실 그룹을 선택해주세요.");
      return;
    }

    if (!roomNameForCreateImsi?.trim()) {
      alert("객실명을 입력해주세요.");
      return;
    }

    if (!startDate || !endDate) {
      alert("임시 객실이 운영될 기간을 선택해주세요.");
      return;
    }

    if (startDate > endDate) {
      alert("시작일은 종료일보다 클 수 없습니다.");
      return;
    }

    const numericMin = Number(capacityMinImsi);
    const numericMax = Number(capacityMaxImsi);

    if (Number.isNaN(numericMin) || Number.isNaN(numericMax)) {
      alert("인원 수는 숫자로 입력해주세요.");
      return;
    }

    if (numericMin < 0 || numericMax < 0) {
      alert("인원 수는 0보다 작을 수 없습니다.");
      return;
    }
    if (numericMin > numericMax) {
      alert("최소 인원은 최대 인원보다 클 수 없습니다.");
      return;
    }

    const data = {
      name: roomNameForCreateImsi.trim(),
      room_group_id: Number(roomGroupId),
      capacity_min: numericMin,
      capacity_max: numericMax,
      start_date: startDate,
      end_date: endDate,
    };

    console.log("임시 객실 생성:", data);

    api
      .post("/api/extra-room", data)
      .then((response) => {
        console.log(response);

        alert("임시 객실이 추가되었습니다.");

        closeExtraRoomPopup();

        getAllRooms();
      })
      .catch((error) => {
        console.error(error);
        alert(
          error.response?.data?.message ||
            "임시 객실 생성 중 오류가 발생했습니다.",
        );
      });
  };

  const closeExtraRoomPopup = () => {
    setIsPop3(false);
    setRoomGroupId("");
    setRoomNameForCreateImsi("");
    setCapacityMinImsi(0);
    setCapacityMaxImsi(0);
    setStartDate("");
    setEndDate("");
  };

  return (
    <>
      <div className="workspace">
        <div className="title">객실관리</div>
        <div className="content">
          <div className="btn_area">
            <button
              onClick={() => {
                setIsPop2(true);
              }}
            >
              그룹추가
            </button>
            <button
              onClick={() => {
                setIsDay(1);
                setCapacityMax(0);
                setCapacityMin(0);
                setRoomGroupId("");
                setRoomNameForCreate("");
                setIsPop(true);
              }}
            >
              객실추가
            </button>
            <button
              onClick={() => {
                setRoomGroupId("");
                setRoomNameForCreateImsi("");
                setCapacityMinImsi(0);
                setCapacityMaxImsi(0);
                setStartDate("");
                setEndDate("");
                setIsPop3(true);
              }}
            >
              임시 객실추가(기간)
            </button>
            <div className="room_cell_active active"></div> 오늘 빈방 (오늘
            체크인, 체크아웃 내역 없는 방)
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <div className="room_cell_active"></div> 한달내로 예약되어져 있음
            (방이 투명하면 현재 숙박되어지는 중 체크아웃되는 방도 여기 포함)
          </div>
          <div className="hor_scroll">
            <table>
              <tbody>
                <tr>
                  {result?.map((data, i) => {
                    return (
                      <td
                        key={`kjbk${i}`}
                        style={{ verticalAlign: "top" }}
                        className={data.is_active !== 1 ? "dimed_td" : ""}
                      >
                        <h4
                          onClick={() => {
                            setIsDetailPopGroup(true);
                            setGroupName(data?.name);
                            setGroupId(data?.id);
                            setGroupReason(data?.reason);
                            setIsActiveGroup(
                              data.is_active === 1 ? true : false,
                            );
                          }}
                        >
                          {data?.name}{" "}
                          {data.is_active === 1 ? (
                            <span className="green">Active</span>
                          ) : (
                            <span className="red">비활성화</span>
                          )}
                        </h4>
                        <div className="td_scroll">
                          {data?.rooms?.map((data2, ii) => {
                            return (
                              <>
                                <div
                                  className="room_cell"
                                  key={`iji${ii}`}
                                  style={{
                                    opacity:
                                      data2.is_active === 0 &&
                                      data2.disable_start != null &&
                                      data2.disable_end != null &&
                                      todayKST >=
                                        toKSTDate(data2.disable_start) &&
                                      todayKST <= toKSTDate(data2.disable_end)
                                        ? "0.3"
                                        : "1",
                                  }}
                                  onClick={() => {
                                    console.log(data2);

                                    const isExtra = String(data2.id).includes(
                                      "EXTRA_",
                                    );

                                    setIsDetailPop(true);
                                    setRoomDetailName(data2.name);
                                    setRoomId(data2.id);
                                    setRoomDetailGroupName(data.name);
                                    setIsDay(data2.day_use);
                                    setCapacityMax(data2.capacity_max);
                                    setCapacityMin(data2.capacity_min);

                                    setIsActive(data2.is_active === 1);

                                    if (isExtra) {
                                      setStartDate(data2.start_date || "");
                                      setEndDate(data2.end_date || "");
                                    } else {
                                      setStartDate(
                                        data2.disable_start
                                          ? toKSTDate(data2.disable_start)
                                          : "",
                                      );
                                      setEndDate(
                                        data2.disable_end
                                          ? toKSTDate(data2.disable_end)
                                          : "",
                                      );
                                    }

                                    setRoomReason(
                                      data2.is_ota === 1
                                        ? "네이버예약"
                                        : data2.reason,
                                    );
                                  }}
                                >
                                  {data2.name}{" "}
                                  {String(data2.id).includes("EXTRA_")
                                    ? "임시"
                                    : ""}
                                  <div
                                    className={
                                      !isRoomOccupiedToday(data2)
                                        ? "room_cell_active active"
                                        : "room_cell_active"
                                    }
                                  ></div>{" "}
                                  {data2.is_active === 0 &&
                                  data2.disable_start != null &&
                                  data2.disable_end != null &&
                                  todayKST >= toKSTDate(data2.disable_start) &&
                                  todayKST <= toKSTDate(data2.disable_end)
                                    ? "숙박중"
                                    : "정보보기"}
                                </div>

                                <br />
                              </>
                            );
                          })}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {isPop && (
        <div className="popup_wrap">
          <div className="popup">
            <div className="popup_title">객실추가</div>
            <div
              className="popup_x"
              onClick={() => {
                setIsPop(false);
                setStartDate("");
                setEndDate("");
              }}
            >
              X
            </div>
            <table>
              <tbody>
                <tr>
                  <th>그룹</th>
                  <td>
                    <select
                      onChange={(e) => {
                        setRoomGroupId(e.target.id);
                      }}
                    >
                      <option id="">선택</option>
                      {groups.map((data, i) => {
                        return (
                          <option id={data.id} key={`kjhk${i}`}>
                            {data.name}
                          </option>
                        );
                      })}
                    </select>
                  </td>
                </tr>
                <tr>
                  <th>객실 이름</th>
                  <td>
                    <input
                      type="text"
                      value={roomNameForCreate}
                      onChange={(e) => {
                        setRoomNameForCreate(e.target.value);
                      }}
                    />
                  </td>
                </tr>
                {/* <tr>
                  <th>예약 타입</th>
                  <td>
                    <div className="checks">
                      <input
                        type="radio"
                        id="stay_only"
                        name="reservation_type"
                        onChange={() => setIsDay(0)}
                        checked={isDay === 0}
                      />
                      <label htmlFor="stay_only">숙박만 가능</label>
                    </div>

                    <div className="checks">
                      <input
                        type="radio"
                        id="both"
                        name="reservation_type"
                        onChange={() => setIsDay(1)}
                        checked={isDay === 1}
                      />
                      <label htmlFor="both">데이유즈 + 숙박 가능</label>
                    </div>

                    <div className="checks">
                      <input
                        type="radio"
                        id="day_only"
                        name="reservation_type"
                        onChange={() => setIsDay(2)}
                        checked={isDay === 2}
                      />
                      <label htmlFor="day_only">데이유즈만 가능</label>
                    </div>
                  </td>
                </tr> */}
                <tr>
                  <th>최소인원</th>
                  <td>
                    <input
                      type="number"
                      value={capacityMin}
                      onChange={(e) => {
                        setCapacityMin(e.target.value);
                      }}
                    />
                  </td>
                </tr>
                <tr>
                  <th>최대인원</th>
                  <td>
                    <input
                      type="number"
                      value={capacityMax}
                      onChange={(e) => {
                        setCapacityMax(e.target.value);
                      }}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="btn_area">
              <button className="green" onClick={createRoom}>
                저장
              </button>
              <button
                onClick={() => {
                  setIsPop(false);
                  setStartDate("");
                  setEndDate("");
                }}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {isPop2 && (
        <div className="popup_wrap">
          <div className="popup">
            <div className="popup_title">그룹추가</div>
            <div
              className="popup_x"
              onClick={() => {
                setIsPop2(false);
                setStartDate("");
                setEndDate("");
              }}
            >
              X
            </div>
            <table>
              <tbody>
                <tr>
                  <th>그룹명</th>
                  <td>
                    <input
                      type="text"
                      value={groupNameForCreate}
                      onChange={(e) => {
                        setGroupNameForCreate(e.target.value);
                      }}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="btn_area">
              <button className="green" onClick={createGroup}>
                저장
              </button>
              <button
                onClick={() => {
                  setIsPop2(false);
                  setStartDate("");
                  setEndDate("");
                }}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
      {isDetailPop && (
        <div className="popup_wrap">
          <div className="popup" style={{ height: "auto", width: "1000px" }}>
            <div className="popup_title">객실 디테일</div>
            <div
              className="popup_x"
              onClick={() => {
                setIsDetailPop(false);
                setIsActive(true);
                setStartDate("");
                setEndDate("");
              }}
            >
              X
            </div>
            <table>
              <tbody>
                <tr>
                  <th>객실명</th>
                  <td>
                    {roomDetailGroupName} &gt; {roomDetailName}
                  </td>
                </tr>
                <tr>
                  <th>이름(수정시)</th>
                  <td>
                    <input
                      type="text"
                      value={roomDetailName}
                      onChange={(e) => {
                        setRoomDetailName(e.target.value);
                      }}
                    />
                  </td>
                </tr>
                {String(roomId).includes("EXTRA_") && (
                  <tr>
                    <th>임시기간</th>
                    <td>
                      {toKSTDate(startDate)} ~ {toKSTDate(endDate)}
                    </td>
                  </tr>
                )}
                <tr>
                  <th>최소인원</th>
                  <td>
                    <input
                      type="number"
                      value={capacityMin}
                      onChange={(e) => {
                        setCapacityMin(e.target.value);
                      }}
                    />
                  </td>
                </tr>
                <tr>
                  <th>최대인원</th>
                  <td>
                    <input
                      type="number"
                      value={capacityMax}
                      onChange={(e) => {
                        setCapacityMax(e.target.value);
                      }}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="btn_area">
              <button className="green" onClick={modifyRoom}>
                수정내역 저장
              </button>
              <button className="red" onClick={roomDelete}>
                이 객실 삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {isDetailPopGroup && (
        <div className="popup_wrap">
          <div className="popup" style={{ height: "auto", width: "1000px" }}>
            <div className="popup_title">그룹 디테일</div>
            <div
              className="popup_x"
              onClick={() => {
                setIsDetailPopGroup(false);
                setIsActiveGroup(true);
                setStartDate("");
                setEndDate("");
              }}
            >
              X
            </div>
            <table>
              <tbody>
                <tr>
                  <th>그룹명</th>
                  <td>
                    <input
                      type="text"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                    />
                  </td>
                </tr>

                {/* <tr>
                  <th>숙박</th>
                  <td>
                    <div className="checks">
                      <input
                        type="radio"
                        name="ac"
                        id="active"
                        defaultChecked
                        onChange={(e) => {
                          if (e.target.checked) {
                            setIsActiveGroup(true);
                          }
                        }}
                        checked={isActiveGroup}
                      />
                      <label htmlFor="active">숙박아님</label>
                    </div>
                    <div className="checks">
                      <input
                        type="radio"
                        name="ac"
                        id="non-active"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setIsActiveGroup(false);
                          }
                        }}
                        checked={!isActiveGroup}
                      />
                      <label htmlFor="non-active">숙박</label>
                    </div>
                  </td>
                </tr> */}
              </tbody>
            </table>
            <div className="btn_area">
              <button className="green" onClick={modifyGroup}>
                수정내역 저장
              </button>
              <button className="red" onClick={groupDelete}>
                이 그룹 삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {workPopForSelectedIds && (
        <div className="popup_wrap">
          <div className="popup" style={{ height: "auto", width: "1000px" }}>
            <div className="popup_title">비활성화 일괄 편집</div>
            <div
              className="popup_x"
              onClick={() => {
                setIsDetailPopGroup(false);
                setIsActiveGroup(true);
                setWorkPopForSelectedIds(false);
                setStartDate("");
                setEndDate("");
              }}
            >
              X
            </div>
            <table>
              <tbody>
                {/* <tr>
                  <th>숙박</th>
                  <td>
                    <div className="checks">
                      <input
                        type="radio"
                        name="ac"
                        id="active"
                        defaultChecked
                        onChange={(e) => {
                          if (e.target.checked) {
                            setIsActiveGroup(true);
                          }
                        }}
                        checked={isActiveGroup}
                      />
                      <label htmlFor="active">숙박아님</label>
                    </div>
                    <div className="checks">
                      <input
                        type="radio"
                        name="ac"
                        id="non-active"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setIsActiveGroup(false);
                          }
                        }}
                        checked={!isActiveGroup}
                      />
                      <label htmlFor="non-active">숙박</label>
                    </div>
                  </td>
                </tr> */}
              </tbody>
            </table>
            {/* <div className="btn_area">
              <button className="green" onClick={workForSelected}>
                숙박 예약 일괄 적용
              </button>
            </div> */}
          </div>
        </div>
      )}
      {isPop3 && (
        <div className="popup_wrap">
          <div className="popup" style={{ height: "600px" }}>
            <div className="popup_title">임시 객실추가(기간)</div>
            <div className="popup_x" onClick={closeExtraRoomPopup}>
              X
            </div>
            <table>
              <tbody>
                <tr>
                  <th>그룹</th>
                  <td>
                    <select
                      value={roomGroupId}
                      onChange={(e) => {
                        setRoomGroupId(e.target.value);
                      }}
                    >
                      <option value="">선택</option>

                      {groups.map((data) => (
                        <option value={data.id} key={data.id}>
                          {data.name}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
                <tr>
                  <th>객실 이름</th>
                  <td>
                    <input
                      type="text"
                      value={roomNameForCreateImsi}
                      onChange={(e) => {
                        setRoomNameForCreateImsi(e.target.value);
                      }}
                    />
                  </td>
                </tr>
                <tr>
                  <th>운영 시작일</th>
                  <td>
                    <MyDatePicker
                      selectedDate={startDate}
                      onDateChange={handleDateChange1}
                    />
                  </td>
                </tr>

                <tr>
                  <th>운영 종료일</th>
                  <td>
                    <MyDatePicker
                      selectedDate={endDate}
                      onDateChange={handleDateChange2}
                    />
                  </td>
                </tr>
                <tr>
                  <th>최소인원</th>
                  <td>
                    <input
                      type="number"
                      value={capacityMinImsi}
                      onChange={(e) => {
                        setCapacityMinImsi(e.target.value);
                      }}
                    />
                  </td>
                </tr>
                <tr>
                  <th>최대인원</th>
                  <td>
                    <input
                      type="number"
                      value={capacityMaxImsi}
                      onChange={(e) => {
                        setCapacityMaxImsi(e.target.value);
                      }}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="btn_area">
              <button className="green" onClick={createExtraRoom}>
                저장
              </button>
              <button onClick={closeExtraRoomPopup}>취소</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default RoomManagement;
