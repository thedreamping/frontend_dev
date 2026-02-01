import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";

function Components() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");

  function getMonthDates(year, month) {
    // month: 1 ~ 12 (사람 기준)
    const jsMonth = month - 1;

    const lastDate = new Date(year, jsMonth + 1, 0).getDate();

    return Array.from({ length: lastDate }, (_, i) => {
      const date = new Date(year, jsMonth, i + 1);
      return {
        year,
        month, // 1 ~ 12
        day: i + 1,
        weekday: date.getDay(),
        dateObj: date,
      };
    });
  }

  // const dates = getMonthDates(2026, 1); // 2026년 1월

  // const wednesdays = dates.filter(d => d.weekday === 3);

  // console.log(wednesdays);
  const fileUpload = (e) => {
    e.target.nextElementSibling.nextElementSibling.click();
  };

  const fileDelete = (e) => {
    setFile(null);
    setFileName("");
  };

  useEffect(() => {
    if (file !== null) {
      console.log(file);
      setFileName(file[0].name);
    }
  }, [file]);

  return (
    <>
      <div className="workspace">
        <div className="title">Dashboard</div>
        <div className="content">
          <table>
            <thead>
              <tr>
                <th>헤더</th>
                <th>헤더</th>
                <th>헤더</th>
                <th>헤더</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>티바디 내용</td>
                <td>티바디 내용</td>
                <td>티바디 내용</td>
                <td>티바디 내용</td>
              </tr>
              <tr>
                <td>티바디 내용</td>
                <td>티바디 내용</td>
                <td>티바디 내용</td>
                <td>티바디 내용</td>
              </tr>
              <tr>
                <td>티바디 내용</td>
                <td>티바디 내용</td>
                <td>티바디 내용</td>
                <td>티바디 내용</td>
              </tr>
              <tr>
                <td>티바디 내용</td>
                <td>티바디 내용</td>
                <td>티바디 내용</td>
                <td>티바디 내용</td>
              </tr>
              <tr>
                <td>티바디 내용</td>
                <td>티바디 내용</td>
                <td>티바디 내용</td>
                <td>티바디 내용</td>
              </tr>
            </tbody>
          </table>
          <div className="pagination">
            <Link to="#" className="prev">
              &lt;
            </Link>
            <Link to="#" className="ac">
              1
            </Link>
            <Link to="#">2</Link>
            <Link to="#">3</Link>
            <Link to="#">4</Link>
            <Link to="#" className="next">
              &gt;
            </Link>
          </div>
          <div className="mid_title">중간 타이틀</div>
          <textarea placeholder="텍스트아레아 컴포넌트"></textarea>
          <div className="btn_area">
            <button>버튼</button>
            <button className="green">버튼</button>
            <button className="red">버튼</button>
            <div className="right_button">
              <button>버튼</button>
            </div>
          </div>
          <div className="file_uploader">
            <input
              type="text"
              placeholder="파일을 업로드해주세요"
              disabled
              value={fileName}
            />
            <button onClick={fileUpload}>파일</button>
            <button onClick={fileDelete}>X</button>
            <input type="file" onChange={(e) => setFile(e.target.files)} />
          </div>
          <input type="text" placeholder="텍스트인풋 컴포넌트" />
          <input type="text" placeholder="텍스트인풋 컴포넌트" />
          <input type="text" placeholder="텍스트인풋 컴포넌트" />
        </div>
      </div>
    </>
  );
}

export default Components;
