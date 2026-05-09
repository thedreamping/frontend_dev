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
    if (!isActive && !roomReason?.trim()) {
      alert("사유를 입력해주세요");
      return;
    }

    const data = {
      name: roomDetailName,
      is_active: isActive ? 1 : 0,
      reason: isActive ? null : roomReason?.trim(),
      disable_start: isActive ? null : startDate,
      disable_end: isActive ? null : endDate,
      capacity_max: Number(capacityMax),
      capacity_min: Number(capacityMin),
      day_use: Number(isDay), // 1 or 0 구조라면
    };

    api
      .put(`/api/room/${roomId}`, data)
      .then((response) => {
        console.log(response);
        setIsDetailPop(false);
        setStartDate("");
        setEndDate("");
        getAllRooms();
      })
      .catch((err) => {
        console.error(err);
        alert("수정 중 오류가 발생했습니다.");
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

  useEffect(() => { console.log(selectedIds) }, [selectedIds]);

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
  }

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
            {/* <button onClick={() => {
              if (selectedIds.length === 0) {
                alert("일괄적용할 방들을 선택해주세요.");
                return;
              } else {
                setWorkPopForSelectedIds(true);
              }
            }}>
              숙박 예약 일괄처리
            </button>{" "} */}
            <div className="room_cell_active active"></div> 오늘 빈방
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <div className="room_cell_active"></div> 한달내로 예약되어져 있음 (방이 투명하면 현재 숙박되어지는 중)
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
                                {/* <div className="checks">
                                  <input
                                    type="checkbox"
                                    id={data2.id}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedIds((prev) => [...prev, data2.id]);
                                      } else {
                                        setSelectedIds((prev) =>
                                          prev.filter((id) => id !== data2.id)
                                        );
                                      }
                                    }}
                                  />
                                  <label htmlFor={data2.id}></label>
                                </div> */}
                                <div
                                  className="room_cell"
                                  key={`iji${ii}`}
                                  style={{
                                      opacity:
                                       data2.is_active === 0 &&
                                        data2.disable_start != null &&
                                        data2.disable_end != null &&
                                        todayKST >= toKSTDate(data2.disable_start) &&
                                        todayKST <= toKSTDate(data2.disable_end) ?
                                         "0.3" : "1",
                                    }}
                                  onClick={() => {
                                    console.log(data2)
                                    setIsDetailPop(true);
                                    setRoomDetailName(data2.name);
                                    setRoomId(data2.id);
                                    setRoomDetailGroupName(data.name);
                                    setIsDay(data2.day_use);
                                    setCapacityMax(data2.capacity_max);
                                    setCapacityMin(data2.capacity_min);
                                    setIsActive(
                                      data2.is_active === 1 ? true : false,
                                    );
                                    setStartDate(toKSTDate(data2.disable_start));
                                    setEndDate(toKSTDate(data2.disable_end));
                                    setRoomReason(data2.is_ota === 1 ? "네이버예약" : data2.reason)
                                  }}
                                >
                                  {data2.name}{" "}
                                  <div
                                    className={
                                     data2.available === 1
                                        ? "room_cell_active active"
                                        : "room_cell_active"
                                    }
                                  ></div>{" "}
                                  { data2.is_active === 0 &&
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
               <tr>
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
              </tr>
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
          <div className="popup" style={{ height: "auto", width:'1000px'  }}>
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
                <tr>
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
                </tr>
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
                            setIsActive(true);
                          }
                        }}
                        checked={isActive}
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
                            setIsActive(false);
                          }
                        }}
                        checked={!isActive}
                      />
                      <label htmlFor="non-active">숙박</label>
                    </div>
                  </td>
                </tr> */}
                {isActive === false && (
                  <>
                    <tr>
                      <th>기간</th>
                      <td>
                        <td>
                          <MyDatePicker
                            value={startDate}
                            onDateChange={handleDateChange1}
                          /> ~ <MyDatePicker
                            value={endDate}
                            onDateChange={handleDateChange2}
                          />
                        </td>
                      </td>
                    </tr>
                    <tr>
                      <th>비고</th>
                      <td>
                        <textarea
                          value={roomReason}
                          onChange={(e) => {
                            setRoomReason(e.target.value);
                          }}
                          readOnly
                        ></textarea>
                      </td>
                    </tr>
                  </>
                )}
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
          <div className="popup" style={{ height: "auto", width:'1000px'  }}>
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
                {isActiveGroup === false && (
                  <>
                    <tr>
                      <th>기간</th>
                      <td>
                        <td>
                          <MyDatePicker
                            value={startDate}
                            onDateChange={handleDateChange1}
                          /> ~ <MyDatePicker
                            value={endDate}
                            onDateChange={handleDateChange2}
                          />
                        </td>
                      </td>
                    </tr>
                    <tr>
                      <th>비고</th>
                      <td>
                        <textarea
                          value={groupReason}
                          onChange={(e) => {
                            setGroupReason(e.target.value);
                          }}
                          readOnly
                        ></textarea>
                      </td>
                    </tr>
                  </>
                )}
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
          <div className="popup" style={{ height: "auto", width:'1000px' }}>
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
                {isActiveGroup === false && (
                  <>
                    <tr>
                      <th>기간</th>
                      <td>
                        <td>
                          <MyDatePicker
                            value={startDate}
                            onDateChange={handleDateChange1}
                          /> ~ <MyDatePicker
                            value={endDate}
                            onDateChange={handleDateChange2}
                          />
                        </td>
                      </td>
                    </tr>
                    <tr>
                      <th>비고</th>
                      <td>
                        <textarea
                          value={groupReason}
                          onChange={(e) => {
                            setGroupReason(e.target.value);
                          }}
                          readOnly
                        ></textarea>
                      </td>
                    </tr>
                  </>
                )}
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
    </>
  );
}

export default RoomManagement;
