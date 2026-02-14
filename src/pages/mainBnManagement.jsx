import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import MyDatePicker from "../component/datepicker";
import api from "../api/api";

function MainBnManagement() {
  const [basicArray, setBasicArray] = useState([
    {
      id: Date.now() + Math.random(),
      file_name: "",
      text: "",
      link: "",
      file: null,
      file_url: "",
    },
    {
      id: Date.now() + Math.random(),
      file_name: "",
      text: "",
      link: "",
      file: null,
      file_url: "",
    },
    {
      id: Date.now() + Math.random(),
      file_name: "",
      text: "",
      link: "",
      file: null,
      file_url: "",
    },
    {
      id: Date.now() + Math.random(),
      file_name: "",
      text: "",
      link: "",
      file: null,
      file_url: "",
    },
  ]);

  useEffect(() => {
    getBanners();
  }, []);

  const getBanners = () => {
    api.get("/api/get-main-banner").then((response) => {
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
        (item) => (!item.file && !item.file_url) || !item.text || !item.link,
      )
    ) {
      alert("모든 슬라이드를 빠짐없이 입력해주세요.");
      return;
    }

    const formData = new FormData();

    basicArray.forEach((item) => {
      if (item.file) {
        formData.append("file", item.file); // 새 파일 있을 때만
      }

      formData.append("file_name", item.file_name);
      formData.append("text", item.text);
      formData.append("link", item.link);
      formData.append("file_url", item.file_url || "");
    });

    api
      .post("/api/main-banner", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => {
        console.log(response);
      });
  };

  const rowAdd = (index) => {
    setBasicArray((prev) => {
      const newArr = [...prev];

      const emptyRow = {
        id: Date.now() + Math.random(),
        file_name: "",
        text: "",
        link: "",
        file: null,
        file_url: "",
      };

      newArr.splice(index + 1, 0, emptyRow); // 현재 행 아래에 삽입
      return newArr;
    });
  };

  const rowDelete = (index) => {
    setBasicArray((prev) => {
      if (prev.length <= 1) return prev; // 최소 1개 유지

      const newArr = [...prev];
      newArr.splice(index, 1);
      return newArr;
    });
  };

  const moveUp = (index) => {
    if (index === 0) return;

    setBasicArray((prev) => {
      const newArr = [...prev];
      [newArr[index - 1], newArr[index]] = [newArr[index], newArr[index - 1]];
      return newArr;
    });
  };

  const moveDown = (index) => {
    setBasicArray((prev) => {
      if (index === prev.length - 1) return prev;

      const newArr = [...prev];
      [newArr[index], newArr[index + 1]] = [newArr[index + 1], newArr[index]];
      return newArr;
    });
  };

  return (
    <>
      <div className="workspace">
        <div className="title">메인배너 관리</div>
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
              {basicArray.map((data, i) => {
                return (
                  <tr key={data.id}>
                    <td>{i + 1}</td>
                    <td>
                      <div className="file_uploader">
                        <input
                          type="text"
                          placeholder="1920 x 1080 사이즈 이상의 이미지를 사용해 주세요. 더 커도 무방하나 비율을 유지해주면서 큰 이미지로 사용해주세요"
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
                      <input
                        type="text"
                        value={data.text}
                        placeholder="배너 문구"
                        onChange={(e) => {
                          setBasicArray((prev) => {
                            const newArr = [...prev];
                            newArr[i] = {
                              ...newArr[i],
                              text: e.target.value,
                            };
                            return newArr;
                          });
                        }}
                      />
                      <br />
                      <br />
                      <input
                        type="text"
                        placeholder="링크 URL (링크를 원하지 않으실 때는 / 입력해주세요)"
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
                    </td>
                    <td>
                      <button onClick={() => rowAdd(i)}>추가</button>
                      <button onClick={() => rowDelete(i)}>삭제</button>
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

export default MainBnManagement;
