import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";

function Dashboard() {
  return (
    <>
      <div className="workspace">
        <div className="title">Dashboard</div>
        <div className="content">
          <div className="dashboard_table">
            <div className="dashboard_table_left">
              <div className="dashboard_table_left_cell">
                <span>예약대기</span>10
              </div>
              <div className="dashboard_table_left_cell">
                <span>예약확정</span>10
              </div>
              <div className="dashboard_table_left_cell">
                <span>예약취소</span>10
              </div>
              <div className="dashboard_table_left_cell">
                <span>이용완료</span>10
              </div>
            </div>
            <div className="dashboard_table_right">
              <ul>
                <li>
                  <b>
                    총 판매금액 <span>0원</span>
                  </b>
                </li>
                <li>
                  <b>
                    총 입금예정금액 <span>0원</span>
                  </b>
                </li>
                <li>
                  ㄴ 일반 상품 예정 금액 <span>0원</span>
                </li>
                <li>
                  ㄴ 하드블럭 예정 금액 <span>0원</span>
                </li>
                <li>
                  ㄴ 추가 옵션 예정 금액 <span>0원</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
