import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import Pagination from "../component/pagination";
import MyDatePicker from "../component/datepicker";

function LogAudit() {
  const navigate = useNavigate();

  const [list, setList] = useState([]);
  const [specialPower, setSpecialPower] = useState(true);

  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);

  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [adminKeyword, setAdminKeyword] = useState("");

  const [isSearchMode, setIsSearchMode] = useState(false);

  // 관리자 조회
  const getAdmins = () => {
    api.get("/api/users/admin").then((res) => {
      setList(res.data.items);
    });
  };

  // 로그 조회
  const getLogs = async (fetchAll = false) => {
    const res = await api.get("/api/logs", {
      params: {
        page: fetchAll ? 1 : page,
        limit: fetchAll ? 10000 : limit, // 안전한 선 (조절 가능)
      },
    });

    return res.data;
  };

  // 권한 체크
  useEffect(() => {
    getAdmins();
  }, []);

  useEffect(() => {
    const adminName = sessionStorage.getItem("adminName");
    if (!adminName || !list.length) return;

    const user = list.find((item) => item.name === adminName);
    setSpecialPower(user?.hyper === 1);
  }, [list]);

  // 기본 로그 조회 (페이지네이션)
  useEffect(() => {
    if (!specialPower) {
      alert("권한이 없습니다.");
      navigate("/");
      return;
    }

    if (!isSearchMode) {
      getLogs(false).then((data) => {
        setLogs(data.data);
        setFilteredLogs(data.data);
        setTotal(data.pagination.total);
      });
    }
  }, [specialPower, page, isSearchMode]);

  // 검색
  const handleSearch = async () => {
    setIsSearchMode(true);

    const data = await getLogs(true);
    let result = [...data.data];

    // 관리자 이름
    if (adminKeyword) {
      result = result.filter((item) =>
        item.admin_name?.toLowerCase().includes(adminKeyword.toLowerCase())
      );
    }

    // 시작 날짜
    if (startDate) {
      const start = new Date(startDate).setHours(0, 0, 0, 0);
      result = result.filter(
        (item) => new Date(item.created_at).getTime() >= start
      );
    }

    // 종료 날짜
    if (endDate) {
      const end = new Date(endDate).setHours(23, 59, 59, 999);
      result = result.filter(
        (item) => new Date(item.created_at).getTime() <= end
      );
    }

    setFilteredLogs(result);
    setTotal(result.length); // 검색 결과 기준
  };

  // 초기화
  const handleReset = () => {
    setAdminKeyword("");
    setStartDate("");
    setEndDate("");
    setIsSearchMode(false);
    setPage(1);
  };

  return (
    <div className="workspace">
      <div className="title">작업 로그 확인</div>

      <div className="content">
        <table>
          <tbody>
            <tr>
              <th>관리자 이름</th>
              <td>
                <input
                  type="text"
                  placeholder="관리자 이름"
                  value={adminKeyword}
                  onChange={(e) => setAdminKeyword(e.target.value)}
                />
              </td>

              <th>기간 검색</th>
              <td>
                <MyDatePicker value={startDate} onDateChange={setStartDate} />
                {" ~ "}
                <MyDatePicker value={endDate} onDateChange={setEndDate} />
              </td>

              <th>검색</th>
              <td>
                <button onClick={handleSearch}>검색</button>
              </td>

              <th>초기화</th>
              <td>
                <button onClick={handleReset}>초기화</button>
              </td>
            </tr>
          </tbody>
        </table>

        <table>
          <thead>
            <tr>
              <th>관리자 이름</th>
              <th>메서드</th>
              <th>End Point</th>
              <th>status</th>
              <th>when</th>
            </tr>
          </thead>

          <tbody>
            {filteredLogs.map((data, i) => (
              <tr key={i}>
                <td>{data.admin_name}</td>
                <td>{data.method}</td>
                <td>{data.endpoint}</td>
                <td>{data.status_code}</td>
                <td>{data.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {!isSearchMode && (
          <Pagination
            total={total}
            page={page}
            limit={limit}
            onChange={setPage}
          />
        )}
      </div>
    </div>
  );
}

export default LogAudit;