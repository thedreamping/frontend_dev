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
  const [startDateAble, setStartDateAble] = useState("");
  const [endDateAble, setEndDateAble] = useState("");
  const [options, setOtions] = useState([]);
  const [optionName, setOptionName] = useState("");
  const [optionPrice, setOptionPrice] = useState(0);
  const [optionId, setOptionId] = useState("");

  useEffect(() => {
    getOptions();
  }, []);

  const getOptions = () => {
    api.get("/api/options").then((response) => {
      console.log(response.data.data)
      const sorted = response.data.data.sort(
        (a, b) => a.sort_order - b.sort_order
      );
      setOtions(sorted);
    });
  };

  const handleDateChange1 = (formattedDate) => {
    setStartDate(formattedDate);
  };

  const handleDateChange2 = (formattedDate) => {
    setEndDate(formattedDate);
  };
  const handleDateChange3 = (formattedDate) => {
    setStartDateAble(formattedDate);
  };

  const handleDateChange4 = (formattedDate) => {
    setEndDateAble(formattedDate);
  };

  const toKSTDateString = (dateString) => {
  if (!dateString) return "";

  const date = new Date(`${dateString}T12:00:00+09:00`);
    return date.toISOString().split("T")[0];
  };

  const modifyOption = async () => {
    if (
      !optionName ||
      optionPrice === undefined ||
      optionPrice === null ||
      optionPrice === "" ||
      !startDate ||
      !endDate ||
      !startDateAble ||
      !endDateAble
    ) {
      alert("모든 값을 입력해주세요.");
      return;
    }

    const numericPrice = Number(optionPrice);

    if (isNaN(numericPrice) || numericPrice < 0) {
      alert("가격은 0 이상 숫자여야 합니다.");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      alert("시작일은 종료일보다 늦을 수 없습니다.");
      return;
    }

    if (new Date(startDateAble) > new Date(endDateAble)) {
      alert("시작일은 종료일보다 늦을 수 없습니다.");
      return;
    }

    try {
      const response = await api.put(`/api/options/${optionId}`, {
        name: optionName,
        price: numericPrice,
        start_date: toKSTDateString(startDate),
        end_date: toKSTDateString(endDate),
        start_date_able: toKSTDateString(startDateAble),
        end_date_able: toKSTDateString(endDateAble),
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

  const createOption = async () => {
    if (
      !optionName ||
      optionPrice === undefined ||
      optionPrice === null ||
      optionPrice === "" ||
      !startDate ||
      !endDate ||
      !startDateAble ||
      !endDateAble
    ) {
      alert("모든 값을 입력해주세요.");
      return;
    }

    const numericPrice = Number(optionPrice);

    if (isNaN(numericPrice) || numericPrice < 0) {
      alert("가격은 0 이상 숫자여야 합니다.");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      alert("시작일은 종료일보다 늦을 수 없습니다.");
      return;
    }

    if (new Date(startDateAble) > new Date(endDateAble)) {
      alert("시작일은 종료일보다 늦을 수 없습니다.");
      return;
    }

    try {
      console.log({
        name: optionName,
        price: numericPrice,
        start_date: toKSTDateString(startDate),
        end_date: toKSTDateString(endDate),
        start_date_able: toKSTDateString(startDateAble),
        end_date_able: toKSTDateString(endDateAble),
      })
      const response = await api.post(`/api/options`, {
        name: optionName,
        price: numericPrice,
        start_date: toKSTDateString(startDate),
        end_date: toKSTDateString(endDate),
        start_date_able: toKSTDateString(startDateAble),
        end_date_able: toKSTDateString(endDateAble),
      });

      if (response.data.ok) {
        alert("옵션 저장 완료");
        getOptions();
        setIsPop(false);
      }
    } catch (error) {
      console.error("옵션 수정 실패:", error);
      alert(error.response?.data?.message || "수정 중 오류 발생");
    }
  };

  const deleteOption = async (id) => {
    const confirmDelete = window.confirm("정말 삭제하시겠습니까?");
    if (!confirmDelete) return;

    try {
      const response = await api.delete(`/api/options/${id}`);

      if (response.data.ok) {
        alert("옵션 삭제 완료");
        getOptions(); // 목록 다시 조회
      }
    } catch (error) {
      console.error("옵션 삭제 실패:", error);
      alert(error.response?.data?.message || "삭제 중 오류 발생");
    }
  };
  
  const normalizeDate = (date) => date.split("T")[0];

  const updateOrder = async (newOptions) => {
    try {
      await api.post("/api/options_all_change", {
        options: newOptions,
      });

      setOtions(newOptions);
    } catch (error) {
      console.error("순서 변경 실패:", error);
      alert("순서 변경 중 오류 발생");
    }
  };

   const moveUp = (index) => {
    if (index === 0) return;

    const newOptions = [...options];

    [newOptions[index - 1], newOptions[index]] = [
      newOptions[index],
      newOptions[index - 1],
    ];

    updateOrder(newOptions);
  };

  const moveDown = (index) => {
    if (index === options.length - 1) return;

    const newOptions = [...options];

    [newOptions[index], newOptions[index + 1]] = [
      newOptions[index + 1],
      newOptions[index],
    ];

    updateOrder(newOptions);
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
                setOptionName("");
                setOptionPrice(0);
                setStartDate("");
                setEndDate("");
                setStartDateAble("");
                setEndDateAble("");
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
                  <th>예약가능기간</th>
                  <th>사용(예약) 가능 여부</th>
                  <th>삭제</th>
                  <th>수정</th>
                  <th>차례</th>
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
                        {data.start_date_able.split("T")[0]} ~{" "}
                        {data.end_date_able.split("T")[0]}
                      </td>
                      <td>
                        {(() => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);

                          const start = new Date(data.start_date);
                          start.setHours(0, 0, 0, 0);

                          const end = new Date(data.end_date);
                          end.setHours(0, 0, 0, 0);

                          const startAble = new Date(data.start_date_able);
                          startAble.setHours(0, 0, 0, 0);

                          const endAble = new Date(data.end_date_able);
                          endAble.setHours(0, 0, 0, 0);

                          const isInOptionPeriod =
                            today >= start && today <= end;
                          const isInAblePeriod =
                            today >= startAble && today <= endAble;

                          return isInOptionPeriod && isInAblePeriod
                            ? "가능"
                            : "이용불가";
                        })()}
                      </td>
                      <td>
                        <button onClick={() => deleteOption(data.id)}>
                          삭제
                        </button>
                      </td>
                      <td>
                        <button
                          onClick={() => {
                            setIsPopModify(true);
                            setOptionName(data.name);
                            setOptionPrice(data.price);
                            setStartDate(data.start_date.split("T")[0]);
                            setEndDate(data.end_date.split("T")[0]);
                            setStartDateAble(
                              data.start_date_able.split("T")[0],
                            );
                            setEndDateAble(data.end_date_able.split("T")[0]);
                            setOptionId(data.id);
                          }}
                        >
                          수정
                        </button>
                      </td>
                      <td>
                        <button onClick={() => moveUp(i)}>Up</button>
                        <button onClick={() => moveDown(i)}>Down</button>
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
          <div className="popup" style={{ height: "560px" }}>
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
                <tr>
                  <th>예약가능 시작일</th>
                  <td>
                    <MyDatePicker
                      value={startDateAble}
                      onDateChange={handleDateChange3}
                    />
                  </td>
                </tr>
                <tr>
                  <th>예약가능 끝나는 일</th>
                  <td>
                    <MyDatePicker
                      value={endDateAble}
                      onDateChange={handleDateChange4}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="btn_area">
              <div className="right_button">
                <button className="green" onClick={createOption}>
                  저장
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isPopModify && (
        <div className="popup_wrap">
          <div className="popup" style={{ height: "560px" }}>
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
                <tr>
                  <th>예약가능 시작일</th>
                  <td>
                    <MyDatePicker
                      value={startDateAble}
                      onDateChange={handleDateChange3}
                    />
                  </td>
                </tr>
                <tr>
                  <th>예약가능 끝나는 일</th>
                  <td>
                    <MyDatePicker
                      value={endDateAble}
                      onDateChange={handleDateChange4}
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
