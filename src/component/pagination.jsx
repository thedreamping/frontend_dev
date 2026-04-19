import React from "react";

const Pagination = ({
  total,
  page,
  limit = 10,
  onChange,
  maxPageButtons = 5,
}) => {
  const totalPages = Math.ceil(total / limit);

  if (totalPages === 0) return null;

  // 🔹 페이지 그룹 계산
  const currentGroup = Math.floor((page - 1) / maxPageButtons);
  const startPage = currentGroup * maxPageButtons + 1;
  const endPage = Math.min(startPage + maxPageButtons - 1, totalPages);

  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div style={{ display: "flex", gap: "8px", alignItems: "center" , justifyContent: "center"}}>
      
      {/* 이전 */}
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
      >
        Prev
      </button>

      {/* 페이지 번호 */}
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          style={{
            fontWeight: p === page ? "bold" : "normal",
            background: p === page ? "#ddd" : "transparent",
          }}
        >
          {p}
        </button>
      ))}

      {/* 다음 */}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;