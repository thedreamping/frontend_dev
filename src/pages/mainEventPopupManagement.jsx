import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import MyDatePicker from "../component/datepicker";
import api from "../api/api";

function MainEventPopupManagement() {
  const [basicArray, setBasicArray] = useState([
    {
      id: Date.now() + Math.random(),
      file_name: "",
      link: "",
      file: null,
      file_url: "",
      width: 0,
      height: 0,
      is_use: 0,
    },
  ]);

  useEffect(() => {
    getBanners();
  }, []);

  const getBanners = () => {
    api.get("/api/get-main-event-popup").then((response) => {
      console.log(response);
      if (response.data.data.length !== 0) {
        setBasicArray(response.data.data);
      }
    });
  };

  const fileUpload = (e) => {
    e.target.nextElementSibling.nextElementSibling.click();
  };

  const fileDelete = (i) => {
    setBasicArray((prev) => {
      const newArr = [...prev];
      newArr[i] = {
        ...newArr[i],
        file_name: "",
        file: null,
      };
      return newArr;
    });
  };
  const save = () => {
    if (
      basicArray.some(
        (item) =>
          (!item.file && !item.file_url) ||
          !item.width ||
          !item.height ||
          !item.link,
      )
    ) {
      alert("모든 슬라이드를 빠짐없이 입력해주세요.");
      return;
    }

    const formData = new FormData();

    basicArray.forEach((item, index) => {
      // 새 파일이 있으면 file과 file_index 같이 전송
      if (item.file) {
        formData.append("file", item.file);
        formData.append("file_index", index); // 새 파일의 슬라이드 위치
      }

      // 나머지 값은 항상 전송
      formData.append("file_name", item.file_name);
      formData.append("width", item.width);
      formData.append("link", item.link);
      formData.append("height", item.height);
      formData.append("is_use", item.is_use);
      formData.append("file_url", item.file_url || "");
    });

    api
      .post("/api/main-event-popup", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => {
        console.log(response);
        alert("메인 이벤트 팝업 설정이 저장되었습니다.");
        getBanners();
      })
      .catch((err) => {
        console.error("save error:", err);
        alert("메인 이벤트 팝업 설정 중 오류가 발생했습니다.");
      });
  };

  return (
    <>
      <div className="workspace">
        <div className="title">메인 이벤트 팝업 관리</div>
        <div className="content">
          <div className="btn_area">
            <button className="green" onClick={save}>
              저장
            </button>
          </div>
          <table>
            <colgroup>
              <col style={{ width: "5%" }} />
              <col style={{ width: "65%" }} />
            </colgroup>
            <thead>
              <tr>
                <th>순서</th>
                <th>이미지 파일</th>
              </tr>
            </thead>
            <tbody>
              {basicArray.map((data, i) => {
                return (
                  <tr key={data.id}>
                    <td>{i + 1}</td>
                    <td style={{ textAlign: "left" }}>
                      이미지 파일 업로드
                      <br />
                      <div className="file_uploader">
                        <input
                          type="text"
                          placeholder="가로가 긴 직사각형 형태로 가로가 1000px 이상, 세로가 200px 이상의 크기의 이미지를 이용해 주세요"
                          disabled
                          value={data.file_name}
                        />
                        <button onClick={fileUpload}>파일</button>
                        <button onClick={() => fileDelete(i)}>X</button>
                        <input
                          type="file"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            setBasicArray((prev) => {
                              const newArr = [...prev];
                              newArr[i] = {
                                ...newArr[i],
                                file_name: file.name,
                                file: file,
                              };
                              return newArr;
                            });
                          }}
                        />
                      </div>
                      링크
                      <br />
                      <input
                        type="text"
                        placeholder="링크 URL(링크를 걸고 싶으시지 않으시면 / 만 입력해주세요)"
                        value={data.link}
                        onChange={(e) => {
                          setBasicArray((prev) => {
                            const newArr = [...prev];
                            newArr[i] = {
                              ...newArr[i],
                              link: e.target.value,
                            };
                            return newArr;
                          });
                        }}
                      />
                      <br />
                      <br />
                      너비 (px)
                      <br />
                      <input
                        type="number"
                        placeholder="이미지 너비"
                        value={data.width}
                        onChange={(e) => {
                          setBasicArray((prev) => {
                            const newArr = [...prev];
                            newArr[i] = {
                              ...newArr[i],
                              width: e.target.value,
                            };
                            return newArr;
                          });
                        }}
                      />
                      <br />
                      <br />
                      높이 (px)
                      <br />
                      <input
                        type="number"
                        placeholder="이미지 높이"
                        value={data.height}
                        onChange={(e) => {
                          setBasicArray((prev) => {
                            const newArr = [...prev];
                            newArr[i] = {
                              ...newArr[i],
                              height: e.target.value,
                            };
                            return newArr;
                          });
                        }}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="checks">
            <input
              type="radio"
              id="use"
              name="is_use"
              checked={basicArray[0].is_use === 1 ? true : false}
              onChange={(e) => {
                if (e.target.checked) {
                  setBasicArray((prev) => {
                    const newArr = [...prev];
                    newArr[0] = {
                      ...newArr[0],
                      is_use: 1,
                    };
                    return newArr;
                  });
                }
              }}
            />
            <label htmlFor="use">사용</label>
          </div>
          <div className="checks">
            <input
              type="radio"
              id="not_use"
              name="is_use"
              defaultChecked
              checked={basicArray[0].is_use === 0 ? true : false}
              onChange={(e) => {
                if (e.target.checked) {
                  setBasicArray((prev) => {
                    const newArr = [...prev];
                    newArr[0] = {
                      ...newArr[0],
                      is_use: 0,
                    };
                    return newArr;
                  });
                }
              }}
            />
            <label htmlFor="not_use">비사용</label>
          </div>
          <br />
          <br />
          <br />
          <div className="btn_area">
            <button className="green" onClick={save}>
              저장
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default MainEventPopupManagement;
