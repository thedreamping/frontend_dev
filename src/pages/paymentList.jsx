import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import api from "../api/api";
import Pagination from "../component/pagination";

function PaymentList() {
  const [checkInFrom, setCheckInFrom] = useState("");
  const [checkInTo, setCheckInTo] = useState("");

  const [checkOutFrom, setCheckOutFrom] = useState("");
  const [checkOutTo, setCheckOutTo] = useState("");
  const [paymentsList, setPaymentsList] = useState([]);
  const [buyerName, setBuyerName] = useState("");
  const [totalPage, setTotalPage] = useState(1);
  const [page, setPage] = useState(1);

  const [total, setTotal] = useState(0);

  const [limit] = useState(20);

  const [rooms, setRooms] = useState([]);
  const [roomGroups, setRoomGroups] = useState([]);

  useEffect(() => {
    getPayments();
    getRooms();
    getRoomGroups();
  }, []);

  const getRooms = () => {
    api.get("/api/rooms").then((response) => {
      setRooms(response.data.data || []);
    });
  };

  const getRoomGroups = () => {
    api.get("/api/room_group").then((response) => {
      setRoomGroups(response.data.data || []);
    });
  };

  const getRoomName = (roomId) => {
    const room = rooms.find((item) => Number(item.id) === Number(roomId));

    return room?.name || "-";
  };

  const getRoomGroupName = (roomGroupId) => {
    const group = roomGroups.find(
      (item) => Number(item.id) === Number(roomGroupId),
    );

    return group?.name || "-";
  };

  const getPayments = () => {
    api
      .get(
        `/api/reservation_infos?page=${page}
      &limit=${limit}
      &buyer_name=${encodeURIComponent(buyerName)}
      &check_in_from=${encodeURIComponent(checkInFrom)}
      &check_in_to=${encodeURIComponent(checkInTo)}
      &check_out_from=${encodeURIComponent(checkOutFrom)}
      &check_out_to=${encodeURIComponent(checkOutTo)}`.replace(/\s+/g, ""),
      )
      .then((response) => {
        const list = response.data.data || [];

        const filteredList = list.filter((item) => {
          const status = String(item.status || "").toUpperCase();
          const refundAmount = Number(item.refund_amount || 0);

          if (status === "PENDING") {
            return false;
          }

          if (status === "CANCELLED" || status === "CANCELED") {
            return refundAmount > 0;
          }

          return true;
        });

        setPaymentsList(filteredList);

        setTotalPage(response.data.pagination.totalPages || 1);

        setTotal(response.data.pagination.total || 0);
      });
  };
  const toKSTDateString = (dateString) => {
    if (!dateString) {
      return "";
    }

    const date = new Date(`${dateString}T12:00:00+09:00`);

    return date.toISOString().split("T")[0];
  };

  useEffect(() => {
    getPayments();
  }, [page]);

  const toKoreanDate = (value) => {
    if (!value) {
      return "";
    }

    return new Date(value).toLocaleDateString("sv-SE", {
      timeZone: "Asia/Seoul",
    });
  };

  return (
    <>
      <div className="workspace">
        <div className="title">홈페이지 결제 내역</div>
        <div className="content">
          <div
            style={{
              display: "flex",
              gap: "10px",
              marginBottom: "20px",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <span>예약자 명</span>
              <input
                type="text"
                placeholder="예약자명"
                value={buyerName}
                style={{ width: "200px", marginBottom: "0px" }}
                onChange={(e) => {
                  setBuyerName(e.target.value);
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <span>체크인 기간</span>
              <input
                type="date"
                value={checkInFrom}
                style={{ width: "200px", marginBottom: "0px" }}
                onChange={(e) => {
                  setCheckInFrom(e.target.value);
                }}
              />
              ~
              <input
                type="date"
                value={checkInTo}
                style={{ width: "200px", marginBottom: "0px" }}
                onChange={(e) => {
                  setCheckInTo(e.target.value);
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <span>체크아웃 기간</span>
              <input
                type="date"
                value={checkOutFrom}
                style={{ width: "200px", marginBottom: "0px" }}
                onChange={(e) => {
                  setCheckOutFrom(e.target.value);
                }}
              />
              ~
              <input
                type="date"
                value={checkOutTo}
                style={{ width: "200px", marginBottom: "0px" }}
                onChange={(e) => {
                  setCheckOutTo(e.target.value);
                }}
              />
            </div>
            <button
              className="btn_custom"
              onClick={() => {
                setPage(1);

                setTimeout(() => {
                  getPayments();
                }, 0);
              }}
            >
              검색
            </button>
            <button
              className="btn_custom"
              onClick={() => {
                setBuyerName("");

                setCheckInFrom("");
                setCheckInTo("");

                setCheckOutFrom("");
                setCheckOutTo("");

                setPage(1);

                setTimeout(() => {
                  getPayments();
                }, 0);
              }}
            >
              초기화
            </button>
          </div>

          <div
            style={{
              marginBottom: "10px",
              fontWeight: "bold",
            }}
          >
            총 {total.toLocaleString()}건
          </div>
          <table>
            <thead>
              <tr>
                <th>ID</th>

                <th>결제일</th>
                <th>예약자</th>
                <th>룸그룹명</th>
                <th>방번호</th>
                <th>연락처</th>
                <th>체크인</th>
                <th>체크아웃</th>
                <th>숙박</th>
                <th>결제금액</th>
                <th>결제방법</th>
                <th>상태</th>
                <th>환불퍼센트</th>
                <th>환불금액</th>
              </tr>
            </thead>
            <tbody>
              {paymentsList.map((data) => {
                return (
                  <tr key={data.id}>
                    <td>{data.id}</td>
                    <td>
                      {data.created_at
                        ? new Date(data.created_at).toLocaleString("ko-KR")
                        : ""}
                    </td>
                    <td>{data.buyer_name}</td>
                    <td>{getRoomGroupName(data.room_group_id)}</td>
                    <td>{getRoomName(data.room_id)}</td>
                    <td>{data.buyer_tel}</td>

                    <td>{toKoreanDate(data.check_in)}</td>

                    <td>{toKoreanDate(data.check_out)}</td>

                    <td>{data.nights} 박</td>

                    <td>{Number(data.total_amount).toLocaleString()}원</td>
                    <td>{data.method}</td>
                    <td>{data.status}</td>
                    <td>
                      {data.refund_percent !== null &&
                      data.refund_percent !== undefined
                        ? `${Number(data.refund_percent).toLocaleString()}%`
                        : "-"}
                    </td>

                    <td>
                      {data.refund_amount !== null &&
                      data.refund_amount !== undefined
                        ? `${Number(data.refund_amount).toLocaleString()}원`
                        : "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div
            style={{
              display: "flex",
              gap: "5px",
              justifyContent: "center",
              marginTop: "20px",
              flexWrap: "wrap",
            }}
          >
            <button
              disabled={page === 1}
              onClick={() => {
                setPage(page - 1);
              }}
            >
              이전
            </button>

            {Array.from(
              {
                length:
                  Math.min(totalPage, page + 5) - Math.max(1, page - 5) + 1,
              },
              (_, i) => Math.max(1, page - 5) + i,
            ).map((data) => {
              return (
                <button
                  key={data}
                  style={{
                    fontWeight: page === data ? "bold" : "normal",
                  }}
                  onClick={() => {
                    setPage(data);
                  }}
                >
                  {data}
                </button>
              );
            })}

            <button
              disabled={page === totalPage}
              onClick={() => {
                setPage(page + 1);
              }}
            >
              다음
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default PaymentList;
