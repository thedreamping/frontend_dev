import { useState } from "react";
import api from "../api/api";

function AddAdministrator() {
  const [name, setName] = useState("");
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  const handleSubmit = async () => {
    if (!name || !adminId || !password || !password2) {
      alert("모든 값을 입력하세요.");
      return;
    }

    if (password !== password2) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      const res = await api.post("api/users/admin", {
        name,
        adminId,
        password,
      });
      console.log(res);
      alert("관리자가 생성되었습니다.");

      // 초기화
      setName("");
      setAdminId("");
      setPassword("");
      setPassword2("");
    } catch (err) {
      console.error(err);

      if (err.response?.data?.message) {
        alert(err.response.data.message);
      } else {
        alert("관리자 생성 중 오류가 발생했습니다.");
      }
    }
  };

  return (
    <>
      <div className="workspace">
        <div className="title">새 관리자 추가</div>

        <div className="content">
          <table>
            <colgroup>
              <col style={{ width: "220px" }} />
            </colgroup>

            <tbody>
              <tr>
                <th>관리자 이름</th>
                <td>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="new-password"
                  />
                </td>
              </tr>

              <tr>
                <th>관리자 ID</th>
                <td>
                  <input
                    type="text"
                    value={adminId}
                    onChange={(e) => setAdminId(e.target.value)}
                    autoComplete="new-password"
                  />
                </td>
              </tr>

              <tr>
                <th>관리자 PASSWORD</th>
                <td>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                </td>
              </tr>

              <tr>
                <th>PASSWORD 재입력</th>
                <td>
                  <input
                    type="password"
                    value={password2}
                    onChange={(e) => setPassword2(e.target.value)}
                    autoComplete="new-password"
                  />
                </td>
              </tr>
            </tbody>
          </table>

          <div className="btn_area">
            <button className="green" onClick={handleSubmit}>
              저장
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default AddAdministrator;
