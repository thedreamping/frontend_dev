import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import "./App.css";
import Login from "./pages/login";
import Dashboard from "./pages/main";
import api from "./api/api";
import ReservationEnv from "./pages/reservationEnv";
import RefundEnv from "./pages/refundEnv";
import Components from "./pages/components";
import RoomManagement from "./pages/roomManagement";

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!sessionStorage.getItem("accessToken")) {
      navigate("/login");
    }
  }, []);

  useEffect(() => {
    navChange();
  }, [location.pathname]);

  const navChange = () => {
    const lnb_children = document.querySelector("#lnb").children;
    for (let i = 0; i < lnb_children.length; i++) {
      if (
        new URL(lnb_children[i].children[0].href).pathname === location.pathname
      ) {
        lnb_children[i].classList.add("ac");
      } else {
        lnb_children[i].classList.remove("ac");
      }
    }
  };

  const logout = async () => {
    try {
      await api.post("/api/users/logout");
      console.log("서버 세션 만료 완료!");
    } catch (err) {
      console.error(
        "서버 로그아웃 처리 중 오류가 났지만, 강제 로그아웃 진행해요 웅..!",
        err,
      );
    } finally {
      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("refreshToken");

      navigate("/login");
    }
  };

  return (
    <>
      <div className="wrap">
        <div className="left_menu">
          <h4>
            드림핑 관리자
            <br />
            시스템
          </h4>
          <ul id="lnb">
            <li className="ac">
              <Link to="/">DASHBOARD</Link>
            </li>
            <li>
              <Link to="/reservation_env">예약환경 설정</Link>
            </li>

            <li>
              <Link to="/room_management">객실관리</Link>
            </li>
            <li>
              <Link to="/refund_env">환불정책 설정</Link>
            </li>
            <li>
              <Link to="/dfds">객실예약 조회</Link>
            </li>
            <li>
              <Link to="/dfds">관리자 추가 및 관리</Link>
            </li>
            <li>
              <Link to="/dfds">결제내역 관리</Link>
            </li>
            <li>
              <Link to="/dfds">메인배너 관리</Link>
            </li>
            <li>
              <Link to="/dfds">메인 ROOMS 디자인 관리</Link>
            </li>
            <li>
              <Link to="/dfds">메인 DINING 디자인 관리</Link>
            </li>
            <li>
              <Link to="/dfds">SPECIAL OFFER관리</Link>
            </li>
            {/* <li>
              <Link to="">메뉴 2</Link>
              <div className="open_close ac"></div>
            </li>
            <ul className="second">
              <li>
                <Link to="">서브메뉴1</Link>
              </li>
              <li className="ac">
                <Link to="">서브메뉴2</Link>
              </li>
              <li>
                <Link to="">서브메뉴3</Link>
              </li>
              <li>
                <Link to="">서브메뉴4</Link>
              </li>
            </ul>
            <li>
              <Link to="">메뉴 3</Link>
            </li>
            <li>
              <Link to="">메뉴 4</Link>
            </li>
            <li>
              <Link to="">메뉴 5</Link>
            </li> */}
          </ul>
        </div>

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reservation_env" element={<ReservationEnv />} />
          <Route path="/refund_env" element={<RefundEnv />} />
          <Route path="/room_management" element={<RoomManagement />} />
          <Route path="/components" element={<Components />} />
        </Routes>
        <button className="logout" onClick={logout}></button>
      </div>
    </>
  );
}

export default App;
