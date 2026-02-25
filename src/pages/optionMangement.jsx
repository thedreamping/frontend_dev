import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import MyDatePicker from "../component/datepicker";
import api from "../api/api";

function OptionManagement() {
  const [isPop, setIsPop] = useState(false);
  const [isPopModify, setIsPopModify] = useState(false);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [options, setOtions] = useState([]);
  const [optionName, setOptionName] = useState("");
  const [optionPrice, setOptionPrice] = useState(0);
  const [optionId, setOptionId] = useState("");

  useEffect(() => {
    getOptions();
  }, []);

  const getOptions = () => {
    api.get("/api/options").then((response) => {
      console.log(response);
      setOtions(response.data.data);
    });
  };

  const handleDateChange1 = (formattedDate) => {
    setStartDate(formattedDate);
  };

  const handleDateChange2 = (formattedDate) => {
    setEndDate(formattedDate);
  };

  const modifyOption = async () => {
    if (!optionName || !optionPrice || !startDate || !endDate) {
      alert("모든 값을 입력해주세요.");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      alert("시작일은 종료일보다 늦을 수 없습니다.");
      return;
    }

    try {
      const response = await api.put(`/api/options/${optionId}`, {
        name: optionName,
        price: Number(optionPrice),
        start_date: startDate,
        end_date: endDate,
      });

      if (response.data.ok) {
        alert("옵션 수정 완료");
        getOptions();
        setIsPopModify(false);
      }
    } catch (error) {
      console.error("옵션 수정 실패:", error);
      alert(error.response?.data?.message || "수정 중 오류 발생");
    }
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
                  <th>사용 가능 여부</th>
                  <th>삭제</th>
                  <th>수정</th>
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
                      <td>
                        {(() => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);

                          const start = new Date(data.start_date);
                          start.setHours(0, 0, 0, 0);

                          const end = new Date(data.end_date);
                          end.setHours(0, 0, 0, 0);

                          return today >= start && today <= end
                            ? "가능"
                            : "이용불가";
                        })()}
                      </td>
                      <td>
                        <button>삭제</button>
                      </td>
                      <td>
                        <button
                          onClick={() => {
                            setIsPopModify(true);
                            setOptionName(data.name);
                            setOptionPrice(data.price);
                            setStartDate(data.start_date.split("T")[0]);
                            setEndDate(data.end_date.split("T")[0]);
                            setOptionId(data.id);
                          }}
                        >
                          수정
                        </button>
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
          <div className="popup" style={{ height: "460px" }}>
            <div className="popup_title">옵션추가</div>
            <div
              className="popup_x"
              onClick={() => {
                setIsPop(false);
              }}
            >
              X
            </div>
            <table>
              <tbody>
                <tr>
                  <th>옵션명</th>
                  <td>
                    <input type="text" />
                  </td>
                </tr>
                <tr>
                  <th>단가</th>
                  <td>
                    <input type="number" value={0} /> 원
                  </td>
                </tr>

                <tr>
                  <th>시작일</th>
                  <td>
                    <MyDatePicker
                      value={startDate}
                      onDateChange={handleDateChange1}
                    />
                  </td>
                </tr>
                <tr>
                  <th>끝나는 일</th>
                  <td>
                    <MyDatePicker
                      value={endDate}
                      onDateChange={handleDateChange2}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="btn_area">
              <div className="right_button">
                <button className="green">저장</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isPopModify && (
        <div className="popup_wrap">
          <div className="popup" style={{ height: "460px" }}>
            <div className="popup_title">옵션수정</div>
            <div
              className="popup_x"
              onClick={() => {
                setIsPopModify(false);
              }}
            >
              X
            </div>
            <table>
              <tbody>
                <tr>
                  <th>옵션명</th>
                  <td>
                    <input
                      type="text"
                      value={optionName}
                      onChange={(e) => {
                        setOptionName(e.target.value);
                      }}
                    />
                  </td>
                </tr>
                <tr>
                  <th>단가</th>
                  <td>
                    <input
                      type="number"
                      value={optionPrice}
                      onChange={(e) => {
                        setOptionPrice(e.target.value);
                      }}
                    />{" "}
                    원
                  </td>
                </tr>

                <tr>
                  <th>시작일</th>
                  <td>
                    <MyDatePicker
                      value={startDate}
                      onDateChange={handleDateChange1}
                    />
                  </td>
                </tr>
                <tr>
                  <th>끝나는 일</th>
                  <td>
                    <MyDatePicker
                      value={endDate}
                      onDateChange={handleDateChange2}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="btn_area">
              <div className="right_button">
                <button className="green" onClick={modifyOption}>
                  수정
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default OptionManagement;
