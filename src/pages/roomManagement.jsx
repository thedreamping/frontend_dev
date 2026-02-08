import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import MyDatePicker from "../component/datepicker";
import api from "../api/api";

function RoomManagement() {
  const [isPop, setIsPop] = useState(false);
  const [isDetailPop, setIsDetailPop] = useState(false);
  const [groups, setGroups] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [result, setResult] = useState([]);

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

  return (
    <>
      <div className="workspace">
        <div className="title">객실관리</div>
        <div className="content">
          <div className="btn_area">
            <button
              onClick={() => {
                setIsPop(true);
              }}
            >
              객실추가
            </button>{" "}
            <div className="room_cell_active active"></div> 숙박가능
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <div className="room_cell_active"></div> 손님 있음
            <div className="right_button">
              <button className="green">수정사항 저장</button>
            </div>
          </div>
          <div className="hor_scroll">
            <table>
              <tbody>
                <tr>
                  {result?.map((data, i) => {
                    return (
                      <td key={`kjbk${i}`} style={{ verticalAlign: "top" }}>
                        <h4>{data?.name}</h4>
                        <div className="td_scroll">
                          {data?.rooms?.map((data2, ii) => {
                            return (
                              <>
                                <div
                                  className="room_cell"
                                  key={`iji${ii}`}
                                  style={
                                    data2.is_active === 1
                                      ? { opacity: "1" }
                                      : { opacity: "0.3" }
                                  }
                                  onClick={() => {
                                    setIsDetailPop(true);
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
                                  {data2.is_active === 1
                                    ? "ACTIVE"
                                    : "DISABLED"}
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
              }}
            >
              X
            </div>
          </div>
        </div>
      )}
      {isDetailPop && (
        <div className="popup_wrap">
          <div className="popup">
            <div className="popup_title">객실 디테일</div>
            <div
              className="popup_x"
              onClick={() => {
                setIsDetailPop(false);
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

export default RoomManagement;
