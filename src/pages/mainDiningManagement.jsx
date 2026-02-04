import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import MyDatePicker from "../component/datepicker";

function MainDiningManagement() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");

  const fileUpload = (e) => {
    e.target.nextElementSibling.nextElementSibling.click();
  };

  const fileDelete = (e) => {
    setFile(null);
    setFileName("");
  };
  return (
    <>
      <div className="workspace">
        <div className="title">메인 다이닝 배너 관리</div>
        <div className="content">
          <div className="btn_area">
            <button className="green">저장</button>
          </div>
          <table>
            <colgroup>
              <col style={{ width: "5%" }} />
              <col style={{ width: "65%" }} />
              <col style={{ width: "15%" }} />
              <col style={{ width: "15%" }} />
            </colgroup>
            <thead>
              <tr>
                <th>순서</th>
                <th>이미지 파일</th>
                <th>행추가/삭제</th>
                <th>차례</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>
                  <div className="file_uploader">
                    <input
                      type="text"
                      placeholder="파일을 업로드해주세요"
                      disabled
                      value={fileName}
                    />
                    <button onClick={fileUpload}>파일</button>
                    <button onClick={fileDelete}>X</button>
                    <input
                      type="file"
                      onChange={(e) => setFile(e.target.files)}
                    />
                  </div>
                  <input type="text" placeholder="시설 이름" />
                  <br />
                  <br />
                  <input type="text" placeholder="배너 문구" />
                  <br />
                  <br />
                  <input type="text" placeholder="링크 URL" />
                </td>
                <td>
                  <button>추가</button>
                  <button>삭제</button>
                </td>
                <td>
                  <button>Up</button>
                  <button>Down</button>
                </td>
              </tr>
              <tr>
                <td>2</td>
                <td>
                  <div className="file_uploader">
                    <input
                      type="text"
                      placeholder="파일을 업로드해주세요"
                      disabled
                      value={fileName}
                    />
                    <button onClick={fileUpload}>파일</button>
                    <button onClick={fileDelete}>X</button>
                    <input
                      type="file"
                      onChange={(e) => setFile(e.target.files)}
                    />
                  </div>
                  <input type="text" placeholder="시설 이름" />
                  <br />
                  <br />
                  <input type="text" placeholder="배너 문구" />
                  <br />
                  <br />
                  <input type="text" placeholder="링크 URL" />
                </td>
                <td>
                  <button>추가</button>
                  <button>삭제</button>
                </td>
                <td>
                  <button>Up</button>
                  <button>Down</button>
                </td>
              </tr>
              <tr>
                <td>3</td>
                <td>
                  <div className="file_uploader">
                    <input
                      type="text"
                      placeholder="파일을 업로드해주세요"
                      disabled
                      value={fileName}
                    />
                    <button onClick={fileUpload}>파일</button>
                    <button onClick={fileDelete}>X</button>
                    <input
                      type="file"
                      onChange={(e) => setFile(e.target.files)}
                    />
                  </div>
                  <input type="text" placeholder="시설 이름" />
                  <br />
                  <br />
                  <input type="text" placeholder="배너 문구" />
                  <br />
                  <br />
                  <input type="text" placeholder="링크 URL" />
                </td>
                <td>
                  <button>추가</button>
                  <button>삭제</button>
                </td>
                <td>
                  <button>Up</button>
                  <button>Down</button>
                </td>
              </tr>
              <tr>
                <td>4</td>
                <td>
                  <div className="file_uploader">
                    <input
                      type="text"
                      placeholder="파일을 업로드해주세요"
                      disabled
                      value={fileName}
                    />
                    <button onClick={fileUpload}>파일</button>
                    <button onClick={fileDelete}>X</button>
                    <input
                      type="file"
                      onChange={(e) => setFile(e.target.files)}
                    />
                  </div>
                  <input type="text" placeholder="시설 이름" />
                  <br />
                  <br />
                  <input type="text" placeholder="배너 문구" />
                  <br />
                  <br />
                  <input type="text" placeholder="링크 URL" />
                </td>
                <td>
                  <button>추가</button>
                  <button>삭제</button>
                </td>
                <td>
                  <button>Up</button>
                  <button>Down</button>
                </td>
              </tr>
            </tbody>
          </table>
          <div className="btn_area">
            <button className="green">저장</button>
          </div>
        </div>
      </div>
    </>
  );
}

export default MainDiningManagement;
