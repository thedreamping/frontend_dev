import React, { useState } from "react";
import styles from "./DatePicker.module.css";
import DatePicker from "react-datepicker";
import { format } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";

import { ko } from "date-fns/locale";

function MyDatePicker({ onDateChange, value, disabled }) {
  // ✅ 부모로부터 콜백 받기
  const [selectedDate, setSelectedDate] = useState(null);

  const handleChange = (date) => {
    // console.log(date);
    setSelectedDate(date);
    if (onDateChange) {
      const formatted = format(date, "yyyy-MM-dd"); // yyyy-MM-dd로 변환
      onDateChange(formatted); // ✅ 부모에게 전달
    }
  };

  return (
    <>
      <DatePicker
        selected={selectedDate} // 달력에 선택 날짜 색상 변경됨
        onChange={handleChange}
        dateFormat="yyyy-MM-dd"
        placeholderText="연도-월-일"
        value={value}
        disabled={disabled}
        locale={ko}
        // withPortal
        renderCustomHeader={({
          date,
          decreaseMonth,
          increaseMonth,
          prevMonthButtonDisabled,
          nextMonthButtonDisabled,
        }) => (
          <div className={`${styles.myDatePicker}`}>
            <button
              onClick={decreaseMonth}
              disabled={prevMonthButtonDisabled}
              className={`${styles.myDatePicker_btn}`}
            >
              &lt;
            </button>
            <span>
              {date.toLocaleString("ko-KR", { month: "long", year: "numeric" })}
            </span>
            <button
              onClick={increaseMonth}
              disabled={nextMonthButtonDisabled}
              className={`${styles.myDatePicker_btn}`}
            >
              &gt;
            </button>
            <button
              onClick={() => {
                setSelectedDate(null);
                onDateChange(null);
              }}
              className={`${styles.myDatePicer_reset}`}
            >
              초기화
            </button>
          </div>
        )}
      />
    </>
  );
}

export default MyDatePicker;
