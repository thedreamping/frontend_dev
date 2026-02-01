import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import MyDatePicker from "../component/datepicker";
import api from "../api/api";

function RoomManagement() {
  useEffect(() => {
    api.get("/api/room_group").then((response) => {
      console.log(response);
    });
  }, []);

  return (
    <>
      <div className="workspace">
        <div className="title">객실관리</div>
        <div className="content"></div>
      </div>
    </>
  );
}

export default RoomManagement;
