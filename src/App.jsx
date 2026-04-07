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
import OptionManagement from "./pages/optionMangement";
import MainBnManagement from "./pages/mainBnManagement";
import MainRoomsManagement from "./pages/mainRoomsManagement";
import MainDiningManagement from "./pages/mainDiningManagement";
import SpecialOfferManagement from "./pages/specialOfferManagement";
import DkSchedule from "./pages/dkSchedule";
import AddAdministrator from "./pages/addAdministrator";
import AdminList from "./pages/adminList";
import DkBanners from "./pages/dkBanners";
import AroundAndSpot from "./pages/aroundAndSpot";
import MainEventPopupManagement from "./pages/mainEventPopupManagement";

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!sessionStorage.getItem("accessToken")) {
      navigate("/login");
    }
  }, [location.pathname]);

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
        <div className="welcome">
         {sessionStorage.getItem("adminName") && <><b>{sessionStorage.getItem("adminName")}</b> 님 환영합니다~ 😎</>}  
        </div>
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
              <Link to="/option_management">옵션관리</Link>
            </li>
            <li>
              <Link to="/refund_env">환불정책 설정</Link>
            </li>
            <li>
              <Link to="/dfds">객실예약 조회</Link>
            </li>
            <li>
              <Link to="/dk_schedule">대관일정</Link>
            </li>
            <li>
              <Link to="/dfds">관리자 추가 및 관리</Link>
            </li>
            <li>
              <Link to="/dfds">결제내역 관리</Link>
            </li>
            <li>
              <Link to="/main_bn_management">메인배너 관리</Link>
            </li>
            <li>
              <Link to="/main_romms_bn_management">메인 ROOMS 디자인 관리</Link>
            </li>
            <li>
              <Link to="/main_dining_management">메인 DINING 디자인 관리</Link>
            </li>
            <li>
              <Link to="/dk_banners">대관 & 워크샵 배너 관리</Link>
            </li>
            <li>
              <Link to="/special_offer_management">SPECIAL OFFER관리</Link>
            </li>
            <li>
              <Link to="/around_and_spot">Around & Spot 관리</Link>
            </li>
            <li>
              <Link to="/event_pop_management">이벤트팝업 관리</Link>
            </li>
            <li>
              <Link to="/admin_list">관리자 리스트</Link>
            </li>
            <li>
              <Link to="/add_administrator">새 관리자 추가</Link>
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
          <Route path="/add_administrator" element={<AddAdministrator />} />
          <Route
            path="/event_pop_management"
            element={<MainEventPopupManagement />}
          />
          <Route path="/admin_list" element={<AdminList />} />
          <Route path="/reservation_env" element={<ReservationEnv />} />
          <Route path="/dk_schedule" element={<DkSchedule />} />
          <Route path="/refund_env" element={<RefundEnv />} />
          <Route path="/room_management" element={<RoomManagement />} />
          <Route path="/option_management" element={<OptionManagement />} />
          <Route path="/components" element={<Components />} />
          <Route path="/main_bn_management" element={<MainBnManagement />} />
          <Route path="/around_and_spot" element={<AroundAndSpot />} />
          <Route path="/dk_banners" element={<DkBanners />} />
          <Route
            path="/special_offer_management"
            element={<SpecialOfferManagement />}
          />
          <Route
            path="/main_dining_management"
            element={<MainDiningManagement />}
          />
          <Route
            path="/main_romms_bn_management"
            element={<MainRoomsManagement />}
          />
        </Routes>
        <button className="logout" onClick={logout}></button>
      </div>
    </>
  );
}

export default App;
