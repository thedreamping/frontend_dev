import { useEffect, useState } from "react";
import api from "../api/api";

const createEmptyPopup = () => ({
  id: `new-${Date.now()}-${Math.random()}`,
  title: "",
  file_name: "",
  file: null,
  file_url: "",
  link: "/",
  width: 300,
  height: 514,
  is_use: 1,
  start_date: "",
  end_date: "",
  sort_order: 0,
});

function MainEventPopupManagement() {
  const [basicArray, setBasicArray] = useState([createEmptyPopup()]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getBanners();
  }, []);

  const getBanners = async () => {
    try {
      const response = await api.get("/api/get-main-event-popup");
      const rows = response.data?.data || [];

      if (rows.length === 0) {
        setBasicArray([createEmptyPopup()]);
        return;
      }

      setBasicArray(
        rows.map((row, index) => ({
          ...row,
          id: row.id,
          title: row.title || "",
          file_name: row.file_name || "",
          file: null,
          file_url: row.file_url || "",
          link: row.link || "/",
          width: row.width || 300,
          height: row.height || 514,
          is_use: Number(row.is_use) === 1 ? 1 : 0,
          start_date: row.start_date || "",
          end_date: row.end_date || "",
          sort_order: row.sort_order || index + 1,
        })),
      );
    } catch (err) {
      console.error("get banners error:", err);
      alert("메인 이벤트 팝업 정보를 불러오지 못했습니다.");
    }
  };

  const updateRow = (index, values) => {
    setBasicArray((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              ...values,
            }
          : item,
      ),
    );
  };

  const fileUpload = (e) => {
    const wrapper = e.currentTarget.closest(".file_uploader");
    const fileInput = wrapper?.querySelector('input[type="file"]');

    fileInput?.click();
  };

  const fileDelete = (index) => {
    updateRow(index, {
      file_name: "",
      file: null,
      file_url: "",
    });
  };

  const rowAdd = (index) => {
    setBasicArray((prev) => {
      const newArray = [...prev];
      newArray.splice(index + 1, 0, createEmptyPopup());
      return newArray;
    });
  };

  const rowDelete = (index) => {
    setBasicArray((prev) => {
      if (prev.length <= 1) {
        alert("팝업 행은 최소 1개 이상이어야 합니다.");
        return prev;
      }

      return prev.filter((_, itemIndex) => itemIndex !== index);
    });
  };

  const moveUp = (index) => {
    if (index === 0) return;

    setBasicArray((prev) => {
      const newArray = [...prev];

      [newArray[index - 1], newArray[index]] = [
        newArray[index],
        newArray[index - 1],
      ];

      return newArray;
    });
  };

  const moveDown = (index) => {
    setBasicArray((prev) => {
      if (index >= prev.length - 1) return prev;

      const newArray = [...prev];

      [newArray[index], newArray[index + 1]] = [
        newArray[index + 1],
        newArray[index],
      ];

      return newArray;
    });
  };

  const validate = () => {
    for (let i = 0; i < basicArray.length; i++) {
      const item = basicArray[i];

      if (!item.file && !item.file_url) {
        alert(`${i + 1}번 팝업의 이미지를 등록해주세요.`);
        return false;
      }

      if (!Number(item.width) || Number(item.width) <= 0) {
        alert(`${i + 1}번 팝업의 너비를 입력해주세요.`);
        return false;
      }

      if (!Number(item.height) || Number(item.height) <= 0) {
        alert(`${i + 1}번 팝업의 높이를 입력해주세요.`);
        return false;
      }

      if (!item.link?.trim()) {
        alert(`${i + 1}번 팝업의 링크를 입력해주세요.`);
        return false;
      }

      const hasStartDate = Boolean(item.start_date);
      const hasEndDate = Boolean(item.end_date);

      if (hasStartDate !== hasEndDate) {
        alert(`${i + 1}번 팝업의 게시 시작일과 종료일을 모두 입력해주세요.`);
        return false;
      }

      if (item.start_date && item.end_date && item.start_date > item.end_date) {
        alert(`${i + 1}번 팝업의 게시 시작일이 종료일보다 늦습니다.`);
        return false;
      }
    }

    return true;
  };

  const save = async () => {
    if (loading) return;
    if (!validate()) return;

    const formData = new FormData();

    basicArray.forEach((item, index) => {
      if (item.file) {
        formData.append("file", item.file);
        formData.append("file_index", String(index));
      }

      formData.append("title", item.title || "");
      formData.append("file_name", item.file_name || "");
      formData.append("file_url", item.file_url || "");
      formData.append("link", item.link || "/");
      formData.append("width", String(item.width || ""));
      formData.append("height", String(item.height || ""));
      formData.append("is_use", String(item.is_use ?? 0));
      formData.append("start_date", item.start_date || "");
      formData.append("end_date", item.end_date || "");
      formData.append("sort_order", String(index + 1));
    });

    try {
      setLoading(true);

      const response = await api.post("/api/main-event-popup", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log(response);

      alert("메인 이벤트 팝업 설정이 저장되었습니다.");
      await getBanners();
    } catch (err) {
      console.error("save error:", err);

      alert(
        err.response?.data?.message ||
          "메인 이벤트 팝업 설정 중 오류가 발생했습니다.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="workspace">
      <div className="title">메인 이벤트 팝업 관리</div>

      <div className="content">
        <div className="btn_area">
          <button
            type="button"
            className="green"
            onClick={save}
            disabled={loading}
          >
            {loading ? "저장 중..." : "저장"}
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
              <th>팝업 정보</th>
              <th>행 추가/삭제</th>
              <th>차례</th>
            </tr>
          </thead>

          <tbody>
            {basicArray.map((data, i) => (
              <tr key={data.id}>
                <td>{i + 1}</td>

                <td style={{ textAlign: "left" }}>
                  <label>팝업 제목</label>

                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      alignItems: "center",
                    }}
                  >
                    <input
                      type="text"
                      placeholder="팝업 제목"
                      value={data.title}
                      onChange={(e) =>
                        updateRow(i, {
                          title: e.target.value,
                        })
                      }
                    />

                    <input
                      type="date"
                      value={data.start_date}
                      onChange={(e) =>
                        updateRow(i, {
                          start_date: e.target.value,
                        })
                      }
                    />

                    <span>~</span>

                    <input
                      type="date"
                      value={data.end_date}
                      onChange={(e) =>
                        updateRow(i, {
                          end_date: e.target.value,
                        })
                      }
                    />
                  </div>

                  <br />

                  <label>이미지 파일 업로드</label>

                  <div className="file_uploader">
                    <input
                      type="text"
                      disabled
                      value={data.file_name}
                      placeholder="팝업 이미지를 등록해주세요."
                    />

                    <button type="button" onClick={fileUpload}>
                      파일
                    </button>

                    <button type="button" onClick={() => fileDelete(i)}>
                      X
                    </button>

                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];

                        if (!file) return;

                        updateRow(i, {
                          file_name: file.name,
                          file,
                        });

                        // 동일 파일 재선택 허용
                        e.target.value = "";
                      }}
                    />
                  </div>

                  {data.file_url && !data.file && (
                    <div
                      style={{
                        marginTop: "8px",
                        marginBottom: "15px",
                      }}
                    >
                      <img
                        src={import.meta.env.VITE_API_BASE_URL + data.file_url}
                        alt={data.title || `팝업 ${i + 1}`}
                        style={{
                          maxWidth: "250px",
                          maxHeight: "150px",
                          objectFit: "contain",
                        }}
                      />
                    </div>
                  )}

                  <br />

                  <label>링크</label>

                  <input
                    type="text"
                    placeholder="링크가 없으면 / 를 입력해주세요."
                    value={data.link}
                    onChange={(e) =>
                      updateRow(i, {
                        link: e.target.value,
                      })
                    }
                  />

                  <br />
                  <br />

                  <div
                    style={{
                      display: "flex",
                      gap: "15px",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <label>너비 (px)</label>

                      <input
                        type="number"
                        min="1"
                        placeholder="이미지 너비"
                        value={data.width}
                        onChange={(e) =>
                          updateRow(i, {
                            width: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div style={{ flex: 1 }}>
                      <label>높이 (px)</label>

                      <input
                        type="number"
                        min="1"
                        placeholder="이미지 높이"
                        value={data.height}
                        onChange={(e) =>
                          updateRow(i, {
                            height: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <br />

                  <div
                    style={{
                      display: "flex",
                      gap: "20px",
                    }}
                  >
                    <div className="checks">
                      <input
                        type="radio"
                        id={`use-${data.id}`}
                        name={`is_use-${data.id}`}
                        checked={Number(data.is_use) === 1}
                        onChange={() =>
                          updateRow(i, {
                            is_use: 1,
                          })
                        }
                      />

                      <label htmlFor={`use-${data.id}`}>사용</label>
                    </div>

                    <div className="checks">
                      <input
                        type="radio"
                        id={`not-use-${data.id}`}
                        name={`is_use-${data.id}`}
                        checked={Number(data.is_use) === 0}
                        onChange={() =>
                          updateRow(i, {
                            is_use: 0,
                          })
                        }
                      />

                      <label htmlFor={`not-use-${data.id}`}>비사용</label>
                    </div>
                  </div>
                </td>

                <td>
                  <button type="button" onClick={() => rowAdd(i)}>
                    추가
                  </button>

                  <button
                    type="button"
                    onClick={() => rowDelete(i)}
                    disabled={basicArray.length <= 1}
                  >
                    삭제
                  </button>
                </td>

                <td>
                  <button
                    type="button"
                    onClick={() => moveUp(i)}
                    disabled={i === 0}
                  >
                    Up
                  </button>

                  <button
                    type="button"
                    onClick={() => moveDown(i)}
                    disabled={i === basicArray.length - 1}
                  >
                    Down
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="btn_area">
          <button
            type="button"
            className="green"
            onClick={save}
            disabled={loading}
          >
            {loading ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default MainEventPopupManagement;
