import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import MyDatePicker from "../component/datepicker";
import api from "../api/api";

function RoomManagement() {
  const [isPop, setIsPop] = useState(false);
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    api.get("/api/room_group").then((response) => {
      console.log(response);
      setGroups(response.data.data);
    });
  }, []);

  useEffect(() => {
    console.log(groups);
  }, [groups]);

  return (
    <>
      <div className="workspace">
        <div className="title">객실관리</div>
        <div className="content">
          <div className="btn_area">
            <button
              className="green"
              onClick={() => {
                setIsPop(true);
              }}
            >
              객실추가
            </button>
          </div>
          <table>
            <thead>
              <tr>
                {groups?.map((data, i) => {
                  return (
                    <>
                      <th key={i}>{data.name}</th>
                    </>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div className="room_cell">객실</div>
                  <br />
                  <div className="room_cell">객실</div>
                  <br />
                  <div className="room_cell">객실</div>
                  <br />
                  <div className="room_cell">객실</div>
                  <br />
                  <div className="room_cell">객실</div>
                  <br />
                  <div className="room_cell">객실</div>
                  <br />
                  <div className="room_cell">객실</div>
                  <br />
                  <div className="room_cell">객실</div>
                  <br />
                  <div className="room_cell">객실</div>
                  <br />
                  <div className="room_cell">객실</div>
                  <br />
                </td>
                <td>
                  <div className="room_cell">객실</div>
                  <br />
                  <div className="room_cell">객실</div>
                  <br />
                  <div className="room_cell">객실</div>
                  <br />
                  <div className="room_cell">객실</div>
                  <br />
                  <div className="room_cell">객실</div>
                  <br />
                  <div className="room_cell">객실</div>
                  <br />
                  <div className="room_cell">객실</div>
                  <br />
                  <div className="room_cell">객실</div>
                  <br />
                  <div className="room_cell">객실</div>
                  <br />
                  <div className="room_cell">객실</div>
                  <br />
                </td>
                <td>
                  <div className="room_cell">객실</div>
                  <br />
                  <div className="room_cell">객실</div>
                  <br />
                  <div className="room_cell">객실</div>
                  <br />
                  <div className="room_cell">객실</div>
                  <br />
                  <div className="room_cell">객실</div>
                  <br />
                  <div className="room_cell">객실</div>
                  <br />
                  <div className="room_cell">객실</div>
                  <br />
                  <div className="room_cell">객실</div>
                  <br />
                  <div className="room_cell">객실</div>
                  <br />
                  <div className="room_cell">객실</div>
                  <br />
                </td>
                <td>
                  <div className="room_cell">객실</div>
                  <br />
                  <div className="room_cell">객실</div>
                  <br />
                  <div className="room_cell">객실</div>
                  <br />
                  <div className="room_cell">객실</div>
                  <br />
                  <div className="room_cell">객실</div>
                  <br />
                  <div className="room_cell">객실</div>
                  <br />
                  <div className="room_cell">객실</div>
                  <br />
                  <div className="room_cell">객실</div>
                  <br />
                  <div className="room_cell">객실</div>
                  <br />
                  <div className="room_cell">객실</div>
                  <br />
                </td>
                <td>
                  <div className="room_cell">객실</div>
                  <br />
                  <div className="room_cell">객실</div>
                  <br />
                  <div className="room_cell">객실</div>
                  <br />
                  <div className="room_cell">객실</div>
                  <br />
                  <div className="room_cell">객실</div>
                  <br />
                  <div className="room_cell">객실</div>
                  <br />
                  <div className="room_cell">객실</div>
                  <br />
                  <div className="room_cell">객실</div>
                  <br />
                  <div className="room_cell">객실</div>
                  <br />
                  <div className="room_cell">객실</div>
                  <br />
                </td>
                <td>
                  <div className="room_cell">객실</div>
                  <br />
                  <div className="room_cell">객실</div>
                  <br />
                  <div className="room_cell">객실</div>
                  <br />
                  <div className="room_cell">객실</div>
                  <br />
                  <div className="room_cell">객실</div>
                  <br />
                  <div className="room_cell">객실</div>
                  <br />
                  <div className="room_cell">객실</div>
                  <br />
                  <div className="room_cell">객실</div>
                  <br />
                  <div className="room_cell">객실</div>
                  <br />
                  <div className="room_cell">객실</div>
                  <br />
                </td>
                <td>
                  <div className="room_cell">객실</div>
                  <br />
                  <div className="room_cell">객실</div>
                  <br />
                  <div className="room_cell">객실</div>
                  <br />
                  <div className="room_cell">객실</div>
                  <br />
                  <div className="room_cell">객실</div>
                  <br />
                  <div className="room_cell">객실</div>
                  <br />
                  <div className="room_cell">객실</div>
                  <br />
                  <div className="room_cell">객실</div>
                  <br />
                  <div className="room_cell">객실</div>
                  <br />
                  <div className="room_cell">객실</div>
                  <br />
                </td>
              </tr>
            </tbody>
          </table>
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
    </>
  );
}

export default RoomManagement;
