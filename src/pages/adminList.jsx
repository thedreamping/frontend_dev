import { useState } from "react";
import { useEffect } from "react";
import api from "../api/api";

function AdminList() {
  const [list, setList] = useState([]);

  useEffect(() => {
    getAdmins();
  }, []);

  const getAdmins = () => {
    api.get("/api/users/admin").then((response) => {
      console.log(response);
      setList(response.data.items);
    });
  };

  const deleteAdmin = async (id) => {
    if (!confirm("삭제하시겠습니까?")) return;

    await api.delete(`/api/users/admin/${id}`);

    alert("삭제되었습니다.");
    getAdmins();
  };

  useEffect(() => {
    console.log(list);
  }, [list]);

  return (
    <>
      <div className="workspace">
        <div className="title">관리자 리스트</div>

        <div className="content">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>이름</th>
                <th>생성일</th>
                <th>삭제</th>
              </tr>
            </thead>
            <tbody>
              {list?.map((data, i) => {
                return (
                  <tr key={i}>
                    <td>{data.adminId}</td>
                    <td>{data.name}</td>
                    <td>{data.createdAt.split("T")[0]}</td>
                    <td>
                      <button
                        onClick={() => {
                          deleteAdmin(data.id);
                        }}
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default AdminList;
