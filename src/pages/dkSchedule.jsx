import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import MyDatePicker from "../component/datepicker";

function DkSchedule() {
  return (
    <>
      <div className="workspace">
        <div className="title">대관일정</div>
        <div className="content">
          <div className="btn_area">
            <button className="green">저장</button>
          </div>

          <div className="btn_area">
            <button className="green">저장</button>
          </div>
        </div>
      </div>
    </>
  );
}

export default DkSchedule;
