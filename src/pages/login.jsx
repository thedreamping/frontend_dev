import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import api from "../api/api";

function Login() {
  const navigate = useNavigate();
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");

  const login = () => {
    console.log(id, pw);
    let data = {
      admin_id: id,
      password: pw,
    };
    api
      .post("/api/users/login", data)
      .then((response) => {
        const { accessToken, refreshToken, user } = response.data;

        sessionStorage.setItem("accessToken", accessToken);
        sessionStorage.setItem("refreshToken", refreshToken);

        navigate("/");
      })
      .catch((err) => {
        alert("로그인 실패: " + err.response?.data?.message || "서버 오류");
      });
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        document.querySelector("#button_for_login").click();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <>
      <div className="login_wrap">
        <div className="login_pannel">
          <h2>드림핑 관리자 시스템 v1.1</h2>- Login -<br />
          <br />
          <input
            type="text"
            placeholder="아이디"
            autoComplete="new-password"
            value={id}
            onChange={(e) => {
              setId(e.target.value);
            }}
          />
          <input
            type="password"
            placeholder="비밀번호"
            autoComplete="new-password"
            value={pw}
            onChange={(e) => {
              setPw(e.target.value);
            }}
          />
          <button onClick={login} id="button_for_login">
            로그인
          </button>
          <button>새 관리자 등록</button>
        </div>
      </div>
    </>
  );
}

export default Login;
