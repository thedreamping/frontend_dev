import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import MyDatePicker from "../component/datepicker";
import api from "../api/api";

function SmsManagement() {
  const [reservationConfirm, setReservationConfirm] = useState("");
  const [refundConfirm, setRefundConfirm] = useState("");

  const getSmsTexts = () => {
    api.get("/api/sms-texts").then((response) => {
      console.log(response);
      const resData = response.data.data;
      for (let i = 0; i < resData.length; i++) {
        if (resData[i].sms_type === "refund_confirm") {
          setRefundConfirm(resData[i].sms_text);
        }
        if (resData[i].sms_type === "reservation_confirm") {
          setReservationConfirm(resData[i].sms_text);
        }
      }
    });
  };

  const saveSmsTexts = () => {
    const data = {
      refund_confirm: refundConfirm,
      reservation_confirm: reservationConfirm,
    };

    api
      .post("/api/sms-texts", data)
      .then((response) => {
        console.log(response);
        alert("저장되었습니다.");
      })
      .catch((error) => {
        console.log(error);
        alert("SMS 저장중 문제가 생겼습니다.");
      });
  };

  const textTempate = {
    reservation: `[드림핑] 예약 완료
\${name} 님 예약이 완료되었습니다.
예약번호: \${reservation_id}
상품: \${product_name}
체크인:\${check_in}
체크아웃:\${check_out}

감사합니다.`,

    refund: `[드림핑] 예약 환불 안내
\${name} 님 예약 환불이 처리되었습니다.
예약번호: \${reservation_id}
상품: \${product_name}
체크인:\${check_in}
체크아웃:\${check_out}
환불비율: \${refund_percent}%
환불금액: \${price}원

감사합니다.`,
  };

  const reset = () => {
    setReservationConfirm(textTempate.reservation);
    setRefundConfirm(textTempate.refund);
  };

  useEffect(() => {
    getSmsTexts();
  }, []);

  return (
    <>
      <div className="workspace">
        <div className="title">SMS 관리</div>
        <div className="content">
          <div className="btn_area">
            <button className="green" onClick={saveSmsTexts}>
              저장
            </button>
            <button className="blue" onClick={reset}>
              템플릿 리셋
            </button>
          </div>
          <table>
            <colgroup>
              <col style={{ width: "25%" }} />
              <col style={{ width: "75%" }} />
            </colgroup>

            <tbody>
              <tr>
                <th>예약확인 문자</th>
                <td>
                  <textarea
                    style={{
                      height: "240px",
                      width: "100%",
                      border: "1px solid #d4d4d4",
                      resize: "none",
                    }}
                    value={reservationConfirm}
                    onChange={(e) => {
                      setReservationConfirm(e.target.value);
                    }}
                  ></textarea>
                </td>
              </tr>
              <tr>
                <th>환불확인 문자</th>
                <td>
                  <textarea
                    style={{
                      height: "240px",
                      width: "100%",
                      border: "1px solid #d4d4d4",
                      resize: "none",
                    }}
                    value={refundConfirm}
                    onChange={(e) => {
                      setRefundConfirm(e.target.value);
                    }}
                  ></textarea>
                </td>
              </tr>
            </tbody>
          </table>
          <div className="btn_area">
            <button className="green" onClick={saveSmsTexts}>
              저장
            </button>
            <button className="blue" onClick={reset}>
              템플릿 리셋
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default SmsManagement;
