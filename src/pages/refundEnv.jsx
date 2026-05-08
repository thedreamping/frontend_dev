import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import MyDatePicker from "../component/datepicker";
import api from "../api/api";

function RefundEnv() {

  const [refundInfo,setRefundInfo] = useState([]);

  useEffect(() => {
    getRefundInfo()
  },[])

  const getRefundInfo = () => {
    api.get("/api/refund-info").then((response) => {
      console.log(response);
      setRefundInfo(response.data.data)
    })
  }

  const modify = (i, id) => {
    const ch = document.querySelector(`#ga${i}`).value;

    api.put(`/api/refund-info/${id}`, {
      changed: Number(ch),
    }).then((response) => {
      console.log(response);
      alert("수정되었습니다.");
      getRefundInfo();
    }).catch((err) => {
      console.error(err);
      alert("수정 실패");
    });
  };

  useEffect(() => {console.log(refundInfo)},[refundInfo])

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
              </tr>
            </thead>
            <tbody>
              {refundInfo?.map((data,i) => {
                return <tr key={i}>
                        <td style={{ textAlign: "left" }}>도착일 {data.day_before}일전 취소시</td>
                        <td style={{ textAlign: "left" }}>
                          <input
                            type="number"
                            defaultValue={data.per}
                            style={{ width: "80px" }}
                            id={"ga" + i}
                          />{" "} %
                        </td>
                        <td style={{ textAlign: "left" }}>
                          <button onClick={() => {modify(i,data.id)}}>수정</button>
                        </td>
                      </tr>
              })}
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
