import { useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import Pagination from "../component/pagination";

function LogAudit() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [specialPower,setSpecialPower] = useState(true);
  const [logs,setLogs] = useState([]);
  const [total,setTotal] = useState(0);
  const [page,setPage] = useState(1);
  const [limit,setLimit] = useState(10)

  const getAdmins = () => {
    api.get("/api/users/admin").then((response) => {
      console.log(response);
      setList(response.data.items);
    });
  };


 const getLogs = () => {
    api.get("/api/logs", {
        params: {
            page:page,
            limit: limit,
        },
    }).then((response) => {
      console.log(response);
      setLogs(response.data.data)
      setTotal(response.data.pagination.total)
    });
  };

  useEffect(() => {
    getAdmins();
  },[]);

  useEffect(() => {
    const adminName = sessionStorage.getItem("adminName");

    if (!adminName || !list?.length) return;

    const user = list.find(item => item.name === adminName);

    const hyper = user?.hyper;

    console.log("찾은 유저:", user);
    console.log("hyper 값:", hyper);
    setSpecialPower(hyper === 1 ? true : false)

  }, [list]);

  useEffect(() => {
    if (specialPower) {
        getLogs();

    } else {
        alert("권한이 없습니다.")
        navigate('/')
    }
  },[specialPower, page])

  return (
    <>
      <div className="workspace">
        <div className="title">작업 로그 확인</div>

        <div className="content">
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
                {logs.map((data,i) => {
                    return <tr key={i}>
                        <td>{data.admin_name}</td>
                        <td>{data.method}</td>
                        <td>{data.endpoint}</td>
                        <td>{data.status_code}</td>
                        <td>{data.created_at}</td>
                    </tr>
                })}
            </tbody>
          </table>
          <Pagination  
            total={total}
            page={page}
            limit={limit}
            onChange={setPage}/>
        </div>
      </div>
    </>
  );
}

export default LogAudit;
