import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import MyDatePicker from "../component/datepicker";

function SpecialOfferManagement() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [isPop, setIsPop] = useState(false);

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
        <div className="title">스페셜 오퍼 배너 관리</div>
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
                <th>차례</th>
                <th>상세 입력</th>
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
                  <input type="text" placeholder="프로모션 이름" />
                  <br />
                  <br />
                  <input type="text" placeholder="기간 입력" />
                  <br />
                  <br />
                  <input type="text" placeholder="가격정보 입력" />
                  <br />
                  <br />
                  <input type="text" placeholder="링크 URL" />
                </td>

                <td>
                  <button>Up</button>
                  <button>Down</button>
                </td>
                <td>
                  <button
                    onClick={() => {
                      setIsPop(true);
                    }}
                  >
                    상세입력
                  </button>
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
                  <input type="text" placeholder="프로모션 이름" />
                  <br />
                  <br />
                  <input type="text" placeholder="기간 입력" />
                  <br />
                  <br />
                  <input type="text" placeholder="가격정보 입력" />
                  <br />
                  <br />
                  <input type="text" placeholder="링크 URL" />
                </td>

                <td>
                  <button>Up</button>
                  <button>Down</button>
                </td>
                <td>
                  <button
                    onClick={() => {
                      setIsPop(true);
                    }}
                  >
                    상세입력
                  </button>
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
                  <input type="text" placeholder="프로모션 이름" />
                  <br />
                  <br />
                  <input type="text" placeholder="기간 입력" />
                  <br />
                  <br />
                  <input type="text" placeholder="가격정보 입력" />
                  <br />
                  <br />
                  <input type="text" placeholder="링크 URL" />
                </td>

                <td>
                  <button>Up</button>
                  <button>Down</button>
                </td>
                <td>
                  <button
                    onClick={() => {
                      setIsPop(true);
                    }}
                  >
                    상세입력
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <div className="btn_area">
            <button className="green">저장</button>
          </div>
        </div>
      </div>
      {isPop && (
        <div className="popup_wrap">
          <div className="popup" style={{ width: "900px", height: "670px" }}>
            <div className="popup_title">상세 입력</div>
            <div
              className="popup_x"
              onClick={() => {
                setIsPop(false);
              }}
            >
              X
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default SpecialOfferManagement;
