import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import MyDatePicker from "../component/datepicker";
import api from "../api/api";

function OptionManagement() {
  const [isPop, setIsPop] = useState(false);

  const [options, setOtions] = useState([]);

  useEffect(() => {
    getOptions();
  }, []);

  const getOptions = () => {
    api.get("/api/options").then((response) => {
      console.log(response);
      setOtions(response.data.data);
    });
  };

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
            <table>
              <thead>
                <tr>
                  <th>옵션명</th>
                  <th>가격</th>
                  <th>기간</th>
                  <th>이용가능</th>
                  <th>삭제</th>
                </tr>
              </thead>
              <tbody>
                {options.map((data, i) => {
                  return (
                    <tr key={`ta${i}`}>
                      <td>{data.name}</td>
                      <td>{data.price} 원</td>
                      <td>
                        {data.start_date.split("T")[0]} ~{" "}
                        {data.end_date.split("T")[0]}
                      </td>
                      <td>{data.is_use === 1 ? "가능" : "이용불가"}</td>
                      <td>
                        <button>삭제</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
