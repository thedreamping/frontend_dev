import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import MyDatePicker from "../component/datepicker";

function RefundEnv() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startDate2, setStartDate2] = useState("");
  const [endDate2, setEndDate2] = useState("");
  const [startDate3, setStartDate3] = useState("");
  const [endDate3, setEndDate3] = useState("");

  const handleDateChange = (formattedDate) => {
    setStartDate(formattedDate);
  };
  const handleDateChange2 = (formattedDate) => {
    setEndDate(formattedDate);
  };

  const handleDateChange3 = (formattedDate) => {
    setStartDate2(formattedDate);
  };
  const handleDateChange4 = (formattedDate) => {
    setEndDate2(formattedDate);
  };

  const handleDateChange5 = (formattedDate) => {
    setStartDate3(formattedDate);
  };
  const handleDateChange6 = (formattedDate) => {
    setEndDate3(formattedDate);
  };

  return (
    <>
      <div className="workspace">
        <div className="title">환불정책 설정</div>
        <div className="content">
          <table>
            <thead>
              <tr>
                <th>도착일 기준</th>
                <th>환불금액</th>
                <th>수정</th>
                <th>삭제</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ textAlign: "left" }}>도착일 0일전 취소시</td>
                <td style={{ textAlign: "left" }}>0%</td>
                <td style={{ textAlign: "left" }}>
                  <button>수정</button>
                </td>
                <td style={{ textAlign: "left" }}>
                  <button>삭제</button>
                </td>
              </tr>
              <tr>
                <td style={{ textAlign: "left" }}>도착일 1일전 취소시</td>
                <td style={{ textAlign: "left" }}>10%</td>
                <td style={{ textAlign: "left" }}>
                  <button>수정</button>
                </td>
                <td style={{ textAlign: "left" }}>
                  <button>삭제</button>
                </td>
              </tr>
              <tr>
                <td style={{ textAlign: "left" }}>도착일 2일전 취소시</td>
                <td style={{ textAlign: "left" }}>20%</td>
                <td style={{ textAlign: "left" }}>
                  <button>수정</button>
                </td>
                <td style={{ textAlign: "left" }}>
                  <button>삭제</button>
                </td>
              </tr>
              <tr>
                <td style={{ textAlign: "left" }}>도착일 3일전 취소시</td>
                <td style={{ textAlign: "left" }}>30%</td>
                <td style={{ textAlign: "left" }}>
                  <button>수정</button>
                </td>
                <td style={{ textAlign: "left" }}>
                  <button>삭제</button>
                </td>
              </tr>
              <tr>
                <td style={{ textAlign: "left" }}>도착일 4일전 취소시</td>
                <td style={{ textAlign: "left" }}>40%</td>
                <td style={{ textAlign: "left" }}>
                  <button>수정</button>
                </td>
                <td style={{ textAlign: "left" }}>
                  <button>삭제</button>
                </td>
              </tr>
              <tr>
                <td style={{ textAlign: "left" }}>도착일 5일전 취소시</td>
                <td style={{ textAlign: "left" }}>50%</td>
                <td style={{ textAlign: "left" }}>
                  <button>수정</button>
                </td>
                <td style={{ textAlign: "left" }}>
                  <button>삭제</button>
                </td>
              </tr>
              <tr>
                <td style={{ textAlign: "left" }}>도착일 6일전 취소시</td>
                <td style={{ textAlign: "left" }}>60%</td>
                <td style={{ textAlign: "left" }}>
                  <button>수정</button>
                </td>
                <td style={{ textAlign: "left" }}>
                  <button>삭제</button>
                </td>
              </tr>
              <tr>
                <td style={{ textAlign: "left" }}>도착일 7일전 취소시</td>
                <td style={{ textAlign: "left" }}>70%</td>
                <td style={{ textAlign: "left" }}>
                  <button>수정</button>
                </td>
                <td style={{ textAlign: "left" }}>
                  <button>삭제</button>
                </td>
              </tr>
              <tr>
                <td style={{ textAlign: "left" }}>도착일 8일전 취소시</td>
                <td style={{ textAlign: "left" }}>80%</td>
                <td style={{ textAlign: "left" }}>
                  <button>수정</button>
                </td>
                <td style={{ textAlign: "left" }}>
                  <button>삭제</button>
                </td>
              </tr>
              <tr>
                <td style={{ textAlign: "left" }}>도착일 9일전 취소시</td>
                <td style={{ textAlign: "left" }}>90%</td>
                <td style={{ textAlign: "left" }}>
                  <button>수정</button>
                </td>
                <td style={{ textAlign: "left" }}>
                  <button>삭제</button>
                </td>
              </tr>
              <tr>
                <td style={{ textAlign: "left" }}>도착일 10일전 취소시</td>
                <td style={{ textAlign: "left" }}>100%</td>
                <td style={{ textAlign: "left" }}>
                  <button>수정</button>
                </td>
                <td style={{ textAlign: "left" }}>
                  <button>삭제</button>
                </td>
              </tr>
            </tbody>
          </table>
          <div className="btn_area">
            <button className="green">저장</button>
            <button>취소</button>
            <div className="right_button"></div>
          </div>
        </div>
      </div>
    </>
  );
}

export default RefundEnv;
