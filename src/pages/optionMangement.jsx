import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import MyDatePicker from "../component/datepicker";
import api from "../api/api";

function OptionManagement() {
  const [isPop, setIsPop] = useState(false);

  useEffect(() => {
    api.get("/api/room_group").then((response) => {
      console.log(response);
    });
  }, []);

  return (
    <>
      <div className="workspace">
        <div className="title">옵션관리</div>
        <div className="content">
          <div className="btn_area">
            <button
              className="green"
              onClick={() => {
                setIsPop(true);
              }}
            >
              옵션추가
            </button>
          </div>
          <div className="options_scroll_wrap">
            <div className="option_cell">
              옵션 1 (100,000 원)<div className="option_cell_x">X</div>
            </div>
            <div className="option_cell">
              옵션 2 (100,000 원)<div className="option_cell_x">X</div>
            </div>
            <div className="option_cell">
              옵션 3 (100,000 원)<div className="option_cell_x">X</div>
            </div>
            <div className="option_cell">
              옵션 4 (100,000 원)<div className="option_cell_x">X</div>
            </div>
            <div className="option_cell">
              옵션 5 (100,000 원)<div className="option_cell_x">X</div>
            </div>
            <div className="option_cell">
              옵션 6 (100,000 원)<div className="option_cell_x">X</div>
            </div>
            <div className="option_cell">
              옵션 7 (100,000 원)<div className="option_cell_x">X</div>
            </div>
            <div className="option_cell">
              옵션 8 (100,000 원)<div className="option_cell_x">X</div>
            </div>
            <div className="option_cell">
              옵션 9 (100,000 원)<div className="option_cell_x">X</div>
            </div>
          </div>
        </div>
      </div>
      {isPop && (
        <div className="popup_wrap">
          <div className="popup">
            <div className="popup_title">옵션추가</div>
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

export default OptionManagement;
