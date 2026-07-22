import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import MyDatePicker from "../component/datepicker";
import api from "../api/api";

function RoomManagement() {
  const [isPop, setIsPop] = useState(false);
  const [isPop2, setIsPop2] = useState(false);
  const [isDetailPop, setIsDetailPop] = useState(false);
  const [isDetailPopGroup, setIsDetailPopGroup] = useState(false);
  const [groups, setGroups] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [result, setResult] = useState([]);
  const [isActive, setIsActive] = useState(true);
  const [isActiveGroup, setIsActiveGroup] = useState(true);
  const [roomReason, setRoomReason] = useState("");
  const [roomDetailName, setRoomDetailName] = useState("");
  const [roomDetailGroupName, setRoomDetailGroupName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [groupName, setGroupName] = useState("");
  const [groupReason, setGroupReason] = useState("");
  const [groupId, setGroupId] = useState("");
  const [groupNameForCreate, setGroupNameForCreate] = useState("");
  const [isDay, setIsDay] = useState(0);
  const [capacityMin, setCapacityMin] = useState(0);
  const [capacityMax, setCapacityMax] = useState(0);
  const [roomNameForCreate, setRoomNameForCreate] = useState("");
  const [roomGroupId, setRoomGroupId] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [workPopForSelectedIds, setWorkPopForSelectedIds] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isPop3, setIsPop3] = useState(false);
  const [roomNameForCreateImsi, setRoomNameForCreateImsi] = useState("");
  const [capacityMinImsi, setCapacityMinImsi] = useState(0);
  const [capacityMaxImsi, setCapacityMaxImsi] = useState(0);
  const [capacityMinDayuse, setCapacityMinDayuse] = useState(0);
  const [capacityMaxDayuse, setCapacityMaxDayuse] = useState(0);
  const [capacityMinDayuseImsi, setCapacityMinDayuseImsi] = useState(0);
  const [capacityMaxDayuseImsi, setCapacityMaxDayuseImsi] = useState(0);
  const [isPet, setIsPet] = useState(0);
  const [isPetImsi, setIsPetImsi] = useState(0);
  const [optionList, setOptionList] = useState([]);
  const [unusedOptionIds, setUnusedOptionIds] = useState([]);
  const [isOptionLoading, setIsOptionLoading] = useState(false);
  const [contractSections, setContractSections] = useState([]);

  useEffect(() => {
    getAllRooms();
  }, []);

  useEffect(() => {
    console.log(groups);
    console.log(rooms);
    setResult(mergeGroupsWithRooms(groups, rooms));
  }, [groups, rooms]);

  useEffect(() => {
    console.log(result);
  }, [result]);

  const getAllRooms = () => {
    api.get("/api/room_group").then((response) => {
      console.log(response);
      setGroups(response.data.data);
      api.get("/api/rooms").then((response) => {
        console.log(response);
        setRooms(response.data.data);
      });
    });
  };

  const mergeGroupsWithRooms = (groups, rooms) => {
    const roomMap = new Map();

    // room_group_id 기준으로 미리 묶기
    for (const room of rooms) {
      const groupId = room.room_group_id;

      if (!roomMap.has(groupId)) {
        roomMap.set(groupId, []);
      }

      roomMap.get(groupId).push(room);
    }

    // 그룹에 rooms 붙이기
    return groups.map((group) => ({
      ...group,
      rooms: roomMap.get(group.id) || [],
    }));
  };

  const parseUnusedOptionIds = (value) => {
    if (!value) return [];

    if (Array.isArray(value)) {
      return value.map((id) => Number(id)).filter((id) => Number.isFinite(id));
    }

    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);

        if (!Array.isArray(parsed)) {
          return [];
        }

        return parsed
          .map((id) => Number(id))
          .filter((id) => Number.isFinite(id));
      } catch (error) {
        console.error("unused_option_ids 파싱 오류:", error);
        return [];
      }
    }

    return [];
  };

  const parseContractSections = (value) => {
    if (!value) return [];

    if (Array.isArray(value)) {
      return value;
    }

    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);

        if (!Array.isArray(parsed)) {
          return [];
        }

        return parsed;
      } catch (error) {
        console.error("contract_txt 파싱 오류:", error);
        return [];
      }
    }

    return [];
  };

  const createEmptyContractSection = () => ({
    type: "section",
    title: "",
    intro: "",
    items: [""],
  });

  const addContractSection = () => {
    setContractSections((prev) => [...prev, createEmptyContractSection()]);
  };

  const removeContractSection = (sectionIndex) => {
    const isOk = confirm("이 안내사항 영역을 삭제하시겠습니까?");

    if (!isOk) return;

    setContractSections((prev) =>
      prev.filter((_, index) => index !== sectionIndex),
    );
  };

  const updateContractSection = (sectionIndex, field, value) => {
    setContractSections((prev) =>
      prev.map((section, index) => {
        if (index !== sectionIndex) {
          return section;
        }

        return {
          ...section,
          [field]: value,
        };
      }),
    );
  };

  const addContractItem = (sectionIndex) => {
    setContractSections((prev) =>
      prev.map((section, index) => {
        if (index !== sectionIndex) {
          return section;
        }

        return {
          ...section,
          items: [...(section.items || []), ""],
        };
      }),
    );
  };

  const updateContractItem = (sectionIndex, itemIndex, value) => {
    setContractSections((prev) =>
      prev.map((section, index) => {
        if (index !== sectionIndex) {
          return section;
        }

        const nextItems = [...(section.items || [])];

        nextItems[itemIndex] = value;

        return {
          ...section,
          items: nextItems,
        };
      }),
    );
  };

  const removeContractItem = (sectionIndex, itemIndex) => {
    setContractSections((prev) =>
      prev.map((section, index) => {
        if (index !== sectionIndex) {
          return section;
        }

        return {
          ...section,
          items: (section.items || []).filter(
            (_, index2) => index2 !== itemIndex,
          ),
        };
      }),
    );
  };

  const moveContractSection = (sectionIndex, direction) => {
    setContractSections((prev) => {
      const targetIndex = sectionIndex + direction;

      if (targetIndex < 0 || targetIndex >= prev.length) {
        return prev;
      }

      const nextSections = [...prev];

      [nextSections[sectionIndex], nextSections[targetIndex]] = [
        nextSections[targetIndex],
        nextSections[sectionIndex],
      ];

      return nextSections;
    });
  };

  const cleanContractSections = (sections) => {
    return sections
      .map((section) => {
        const type = ["section", "star", "privacy"].includes(section?.type)
          ? section.type
          : "section";

        const title = String(section?.title || "").trim();
        const intro = String(section?.intro || "").trim();

        const items = Array.isArray(section?.items)
          ? section.items
              .map((item) => String(item || "").trim())
              .filter(Boolean)
          : [];

        return {
          type,
          title,
          intro,
          items,
        };
      })
      .filter((section) => {
        return section.title || section.intro || section.items.length > 0;
      })
      .map((section) => {
        if (section.type === "star") {
          return {
            type: "star",
            items: section.items,
          };
        }

        if (section.type === "privacy") {
          return {
            type: "privacy",
            title: section.title,
            intro: section.intro,
            items: section.items,
          };
        }

        return {
          type: "section",
          title: section.title,
          items: section.items,
        };
      });
  };
  const modifyRoom = () => {
    const isExtra = String(roomId).startsWith("EXTRA_");

    if (!roomDetailName?.trim()) {
      alert("객실명을 입력해주세요.");
      return;
    }

    /*
     * 임시객실은 is_active와 비활성화 사유 정책을 사용하지 않는다.
     * 일반객실 중 기존에 비활성화된 객실만 기존 사유를 유지한다.
     */

    if (isExtra && (!startDate || !endDate)) {
      alert("임시 객실 운영 기간을 입력해주세요.");
      return;
    }

    if (isExtra && startDate > endDate) {
      alert("시작일은 종료일보다 클 수 없습니다.");
      return;
    }

    const numericMin = Number(capacityMin);
    const numericMax = Number(capacityMax);

    /*
     * 데이유즈 값이 비어 있으면 null로 저장한다.
     * 클라이언트에서는 null일 때 숙박 인원값을 fallback으로 사용한다.
     */
    const numericMinDayuse =
      capacityMinDayuse === "" ||
      capacityMinDayuse === null ||
      capacityMinDayuse === undefined
        ? null
        : Number(capacityMinDayuse);

    const numericMaxDayuse =
      capacityMaxDayuse === "" ||
      capacityMaxDayuse === null ||
      capacityMaxDayuse === undefined
        ? null
        : Number(capacityMaxDayuse);

    /*
     * 임시객실 API 응답에 day_use가 없어도
     * 기본적으로 숙박 + 데이유즈 가능인 1을 사용한다.
     */
    const numericDayUse = isExtra ? 1 : Number(isDay ?? 1);

    const capacities = [
      numericMin,
      numericMax,
      numericMinDayuse,
      numericMaxDayuse,
    ].filter((value) => value !== null);

    if (capacities.some(Number.isNaN)) {
      alert("인원 수는 숫자로 입력해주세요.");
      return;
    }

    if (capacities.some((value) => value < 0)) {
      alert("인원 수는 0보다 작을 수 없습니다.");
      return;
    }

    if (numericMin > numericMax) {
      alert("숙박 최소 인원은 숙박 최대 인원보다 클 수 없습니다.");
      return;
    }

    if (
      numericMinDayuse !== null &&
      numericMaxDayuse !== null &&
      numericMinDayuse > numericMaxDayuse
    ) {
      alert("데이유즈 최소 인원은 데이유즈 최대 인원보다 클 수 없습니다.");
      return;
    }

    if (![0, 1, 2].includes(numericDayUse)) {
      alert("예약 타입 값이 올바르지 않습니다.");
      return;
    }

    const data = {
      name: roomDetailName.trim(),

      /*
       * 임시객실은 기존 active 정책에 막히지 않도록
       * 항상 활성 상태로 전송한다.
       */
      is_active: isExtra ? 1 : isActive ? 1 : 0,

      reason: isExtra ? null : isActive ? null : roomReason?.trim() || null,

      /*
       * 일반객실 비활성 기간
       */
      disable_start: isExtra || isActive ? null : startDate || null,

      disable_end: isExtra || isActive ? null : endDate || null,

      /*
       * 임시객실 운영 기간
       */
      start_date: isExtra ? startDate : null,

      end_date: isExtra ? endDate : null,

      capacity_min: numericMin,
      capacity_max: numericMax,

      capacity_min_dayuse: numericMinDayuse,
      capacity_max_dayuse: numericMaxDayuse,

      day_use: numericDayUse,
      is_pet: Number(isPet),
    };

    console.log("객실 수정:", {
      roomId,
      isExtra,
      data,
    });

    api
      .put(`/api/room/${roomId}`, data)
      .then((response) => {
        console.log(response);

        alert(
          isExtra
            ? "임시 객실 정보가 수정되었습니다."
            : "객실 정보가 수정되었습니다.",
        );

        setIsDetailPop(false);
        setIsActive(true);
        setIsPet(0);
        setRoomReason("");

        setCapacityMinDayuse(0);
        setCapacityMaxDayuse(0);

        setStartDate("");
        setEndDate("");

        getAllRooms();
      })
      .catch((err) => {
        console.error(err);

        alert(err.response?.data?.message || "수정 중 오류가 발생했습니다.");
      });
  };

  const modifyGroup = () => {
    if (!groupName?.trim()) {
      alert("그룹명을 입력해주세요.");
      return;
    }

    const cleanedContractSections = cleanContractSections(contractSections);

    const data = {
      name: groupName.trim(),
      is_active: isActiveGroup ? 1 : 0,
      reason: isActiveGroup ? null : groupReason?.trim() || null,
      unused_option_ids: unusedOptionIds,
      contract_txt: JSON.stringify(cleanedContractSections),
    };

    api
      .put(`/api/room-group/${groupId}`, data)
      .then((response) => {
        console.log(response);

        setIsDetailPopGroup(false);
        setContractSections([]);
        setStartDate("");
        setEndDate("");

        getAllRooms();
        alert("그룹이 수정되었습니다.");
      })
      .catch((err) => {
        console.error(err);

        alert(
          err.response?.data?.message || "그룹 수정 중 오류가 발생했습니다.",
        );
      });
  };
  const roomDelete = () => {
    const isExtra = String(roomId).startsWith("EXTRA_");

    const isOk = confirm(
      isExtra ? "이 임시 객실을 삭제하시겠습니까?" : "삭제하시겠습니까?",
    );

    if (!isOk) return;

    const deleteUrl = isExtra
      ? `/api/extra-room/${roomId}`
      : `/api/room/${roomId}`;

    api
      .delete(deleteUrl)
      .then((response) => {
        console.log(response);

        alert(isExtra ? "임시 객실이 삭제되었습니다." : "삭제되었습니다.");

        setIsDetailPop(false);
        setIsPet(0);
        setStartDate("");
        setEndDate("");
        getAllRooms();
      })
      .catch((err) => {
        console.error(err);

        alert(
          err.response?.data?.message ||
            (isExtra
              ? "임시 객실 삭제 중 오류가 발생했습니다."
              : "삭제 중 오류가 발생했습니다."),
        );
      });
  };

  const groupDelete = () => {
    const isOk = confirm("삭제하시겠습니까?");

    if (!isOk) return;

    api
      .delete(`/api/room-group/${groupId}`)
      .then((response) => {
        console.log(response);
        alert("삭제되었습니다.");
        setIsDetailPopGroup(false);
        setStartDate("");
        setEndDate("");
        getAllRooms();
      })
      .catch((err) => {
        console.error(err);
        alert("삭제 중 오류가 발생했습니다.");
      });
  };

  const createGroup = () => {
    if (!groupNameForCreate || groupNameForCreate.trim() === "") {
      alert("그룹명을 입력해주세요.");
      return;
    }

    const data = {
      name: groupNameForCreate,
      description: groupNameForCreate,
    };

    api
      .post(`/api/room-group`, data)
      .then((response) => {
        console.log(response);
        alert("새 그룹이 생성되었습니다.");
        setIsPop2(false);
        setStartDate("");
        setEndDate("");
        getAllRooms();
      })
      .catch((error) => {
        console.error(error);
        alert("생성 중 오류가 발생했습니다.");
      });
  };

  const getOptionsForGroup = async () => {
    setIsOptionLoading(true);

    try {
      const response = await api.get("/api/options");

      const options = Array.isArray(response.data.data)
        ? response.data.data
        : [];

      const sortedOptions = [...options].sort((a, b) => {
        const sortA = Number(a.sort_order);
        const sortB = Number(b.sort_order);

        if (Number.isFinite(sortA) && Number.isFinite(sortB)) {
          return sortA - sortB;
        }

        return Number(a.id) - Number(b.id);
      });

      setOptionList(sortedOptions);
    } catch (error) {
      console.error("옵션 목록 조회 오류:", error);

      setOptionList([]);

      alert(
        error.response?.data?.message || "옵션 목록을 불러오지 못했습니다.",
      );
    } finally {
      setIsOptionLoading(false);
    }
  };

  const toggleGroupOption = (optionId) => {
    const numericOptionId = Number(optionId);

    if (!Number.isFinite(numericOptionId)) {
      return;
    }

    setUnusedOptionIds((prev) => {
      if (prev.includes(numericOptionId)) {
        return prev.filter((id) => id !== numericOptionId);
      }

      return [...prev, numericOptionId];
    });
  };

  const openGroupDetail = async (group) => {
    setGroupName(group?.name || "");
    setGroupId(group?.id || "");
    setGroupReason(group?.reason || "");

    setIsActiveGroup(getIsActive(group?.is_active));

    setUnusedOptionIds(parseUnusedOptionIds(group?.unused_option_ids));

    const parsedContractSections = parseContractSections(group?.contract_txt);

    setContractSections(parsedContractSections);

    setOptionList([]);
    setIsDetailPopGroup(true);

    await getOptionsForGroup();
  };

  const createRoom = () => {
    if (!roomNameForCreate?.trim()) {
      alert("객실명을 입력해주세요.");
      return;
    }

    if (!roomGroupId) {
      alert("객실 그룹을 선택해주세요.");
      return;
    }

    const numericMin = Number(capacityMin);
    const numericMax = Number(capacityMax);
    const numericMinDayuse = Number(capacityMinDayuse);
    const numericMaxDayuse = Number(capacityMaxDayuse);
    const numericDayUse = Number(isDay);

    const capacities = [
      numericMin,
      numericMax,
      numericMinDayuse,
      numericMaxDayuse,
    ];

    if (capacities.some(Number.isNaN)) {
      alert("인원 수는 숫자로 입력해주세요.");
      return;
    }

    if (capacities.some((value) => value < 0)) {
      alert("인원 수는 0보다 작을 수 없습니다.");
      return;
    }

    if (numericMin > numericMax) {
      alert("숙박 최소 인원은 숙박 최대 인원보다 클 수 없습니다.");
      return;
    }

    if (
      numericMinDayuse !== null &&
      numericMaxDayuse !== null &&
      numericMinDayuse > numericMaxDayuse
    ) {
      alert("데이유즈 최소 인원은 데이유즈 최대 인원보다 클 수 없습니다.");
      return;
    }

    if (![0, 1, 2].includes(numericDayUse)) {
      alert("예약 타입 값이 올바르지 않습니다.");
      return;
    }

    const data = {
      name: roomNameForCreate.trim(),
      description: roomNameForCreate.trim(),
      room_group_id: Number(roomGroupId),

      capacity_min: numericMin,
      capacity_max: numericMax,

      capacity_min_dayuse: numericMinDayuse,
      capacity_max_dayuse: numericMaxDayuse,

      day_use: numericDayUse,
      is_pet: Number(isPet),
    };

    console.log("일반 객실 생성:", data);

    api
      .post("/api/room", data)
      .then((response) => {
        console.log(response);

        alert("객실이 추가되었습니다.");

        setIsPop(false);
        setIsPet(0);
        setRoomNameForCreate("");
        setRoomGroupId("");

        setCapacityMin(0);
        setCapacityMax(0);
        setCapacityMinDayuse(0);
        setCapacityMaxDayuse(0);

        getAllRooms();
      })
      .catch((error) => {
        console.error(error);

        alert(
          error.response?.data?.message || "객실 생성 중 오류가 발생했습니다.",
        );
      });
  };

  useEffect(() => {
    console.log(selectedIds);
  }, [selectedIds]);

  const workForSelected = () => {
    if (!isActiveGroup && !groupReason?.trim()) {
      alert("사유와 기간을 입력해주세요");
      return;
    }
    if (startDate > endDate) {
      alert("시작일은 종료일보다 클 수 없습니다.");
      return;
    }
    const data = {
      ids: selectedIds,
      is_active: isActiveGroup ? 1 : 0,
      reason: isActiveGroup ? null : groupReason,
      disable_start: startDate,
      disable_end: endDate,
    };

    api
      .put(`/api/rooms/bulk-update`, data)
      .then((response) => {
        console.log(response);
        setWorkPopForSelectedIds(false);
        getAllRooms();
      })
      .catch((err) => {
        console.error(err);
        alert("수정 중 오류가 발생했습니다.");
      });
  };

  const handleDateChange1 = (formattedDate) => {
    setStartDate(formattedDate);
  };

  const handleDateChange2 = (formattedDate) => {
    setEndDate(formattedDate);
  };

  const toKSTDate = (date) =>
    new Intl.DateTimeFormat("sv-SE", {
      timeZone: "Asia/Seoul",
    }).format(new Date(date));

  const todayKST = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Seoul",
  }).format(new Date());

  const isRoomOccupiedToday = (room) => {
    const today = todayKST; // "YYYY-MM-DD"

    // 1. 네이버 + 수기 병합
    let naver = room.check_in_and_out;
    let soogie = room.check_in_and_out_soogie;

    const schedules = [...(naver || []), ...(soogie || [])];

    if (schedules.length === 0) return false;

    // 3. 오늘 날짜 포함 여부 체크
    return schedules.some((s) => {
      if (!s?.check_in || !s?.check_out) return false;

      const start = s.check_in;
      const end = s.check_out;

      return today >= start && today <= end;
    });
  };

  const getIsActive = (value) => {
    if (value === null || value === undefined || value === "") {
      return true;
    }

    return Number(value) === 1;
  };
  const createExtraRoom = () => {
    if (!roomGroupId) {
      alert("객실 그룹을 선택해주세요.");
      return;
    }

    if (!roomNameForCreateImsi?.trim()) {
      alert("객실명을 입력해주세요.");
      return;
    }

    if (!startDate || !endDate) {
      alert("임시 객실이 운영될 기간을 선택해주세요.");
      return;
    }

    if (startDate > endDate) {
      alert("시작일은 종료일보다 클 수 없습니다.");
      return;
    }

    const numericMin = Number(capacityMinImsi);
    const numericMax = Number(capacityMaxImsi);
    const numericMinDayuse = Number(capacityMinDayuseImsi);
    const numericMaxDayuse = Number(capacityMaxDayuseImsi);

    const capacities = [
      numericMin,
      numericMax,
      numericMinDayuse,
      numericMaxDayuse,
    ];

    if (capacities.some(Number.isNaN)) {
      alert("인원 수는 숫자로 입력해주세요.");
      return;
    }

    if (capacities.some((value) => value < 0)) {
      alert("인원 수는 0보다 작을 수 없습니다.");
      return;
    }

    if (numericMin > numericMax) {
      alert("숙박 최소 인원은 숙박 최대 인원보다 클 수 없습니다.");
      return;
    }

    if (
      numericMinDayuse !== null &&
      numericMaxDayuse !== null &&
      numericMinDayuse > numericMaxDayuse
    ) {
      alert("데이유즈 최소 인원은 데이유즈 최대 인원보다 클 수 없습니다.");
      return;
    }

    const data = {
      name: roomNameForCreateImsi.trim(),
      room_group_id: Number(roomGroupId),

      capacity_min: numericMin,
      capacity_max: numericMax,

      capacity_min_dayuse: numericMinDayuse,
      capacity_max_dayuse: numericMaxDayuse,

      start_date: startDate,
      end_date: endDate,
      is_pet: Number(isPetImsi),
    };

    console.log("임시 객실 생성:", data);

    api
      .post("/api/extra-room", data)
      .then((response) => {
        console.log(response);

        alert("임시 객실이 추가되었습니다.");

        closeExtraRoomPopup();
        getAllRooms();
      })
      .catch((error) => {
        console.error(error);

        alert(
          error.response?.data?.message ||
            "임시 객실 생성 중 오류가 발생했습니다.",
        );
      });
  };

  const closeExtraRoomPopup = () => {
    setIsPop3(false);

    setRoomGroupId("");
    setRoomNameForCreateImsi("");

    setCapacityMinImsi(0);
    setCapacityMaxImsi(0);
    setIsPetImsi(0);
    setCapacityMinDayuseImsi(0);
    setCapacityMaxDayuseImsi(0);

    setStartDate("");
    setEndDate("");
  };

  return (
    <>
      <div className="workspace">
        <div className="title">객실관리</div>
        <div className="content">
          <div className="btn_area">
            <button
              onClick={() => {
                setIsPop2(true);
              }}
            >
              그룹추가
            </button>
            <button
              onClick={() => {
                setIsDay(1);
                setIsPet(0);
                setCapacityMax(0);
                setCapacityMin(0);

                setCapacityMaxDayuse(0);
                setCapacityMinDayuse(0);

                setRoomGroupId("");
                setRoomNameForCreate("");
                setIsPop(true);
              }}
            >
              객실추가
            </button>
            <button
              onClick={() => {
                setRoomGroupId("");
                setRoomNameForCreateImsi("");
                setIsPetImsi(0);
                setCapacityMinImsi(0);
                setCapacityMaxImsi(0);

                setCapacityMinDayuseImsi(0);
                setCapacityMaxDayuseImsi(0);

                setStartDate("");
                setEndDate("");

                setIsPop3(true);
              }}
            >
              임시 객실추가(기간)
            </button>
            <div className="room_cell_active active"></div> 오늘 빈방 (오늘
            체크인, 체크아웃 내역 없는 방)
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <div className="room_cell_active"></div> 한달내로 예약되어져 있음
            (방이 투명하면 현재 숙박되어지는 중 체크아웃되는 방도 여기 포함)
          </div>
          <div className="hor_scroll">
            <table>
              <tbody>
                <tr>
                  {result?.map((data, i) => {
                    return (
                      <td
                        key={`kjbk${i}`}
                        style={{ verticalAlign: "top" }}
                        className={
                          !getIsActive(data.is_active) ? "dimed_td" : ""
                        }
                      >
                        <h4 onClick={() => openGroupDetail(data)}>
                          {data?.name}{" "}
                          {getIsActive(data.is_active) ? (
                            <span className="green">Active</span>
                          ) : (
                            <span className="red">비활성화</span>
                          )}
                        </h4>
                        <div className="td_scroll">
                          {data?.rooms?.map((data2, ii) => {
                            return (
                              <>
                                <div
                                  className="room_cell"
                                  key={`iji${ii}`}
                                  style={{
                                    opacity:
                                      !getIsActive(data2.is_active) &&
                                      data2.disable_start != null &&
                                      data2.disable_end != null &&
                                      todayKST >=
                                        toKSTDate(data2.disable_start) &&
                                      todayKST <= toKSTDate(data2.disable_end)
                                        ? 0.3
                                        : 1,
                                  }}
                                  onClick={() => {
                                    console.log(data2);

                                    const isExtra = String(data2.id).includes(
                                      "EXTRA_",
                                    );

                                    setIsDetailPop(true);
                                    setRoomDetailName(data2.name);
                                    setRoomId(data2.id);
                                    setRoomDetailGroupName(data.name);
                                    setIsDay(Number(data2.day_use ?? 1));
                                    setCapacityMax(data2.capacity_max ?? 0);
                                    setCapacityMin(data2.capacity_min ?? 0);
                                    setIsPet(
                                      data2.is_pet == null ||
                                        Number(data2.is_pet) === 1
                                        ? 1
                                        : 0,
                                    );

                                    setCapacityMaxDayuse(
                                      data2.capacity_max_dayuse ?? "",
                                    );

                                    setCapacityMinDayuse(
                                      data2.capacity_min_dayuse ?? "",
                                    );

                                    setIsActive(getIsActive(data2.is_active));

                                    if (isExtra) {
                                      setStartDate(data2.start_date || "");
                                      setEndDate(data2.end_date || "");
                                    } else {
                                      setStartDate(
                                        data2.disable_start
                                          ? toKSTDate(data2.disable_start)
                                          : "",
                                      );
                                      setEndDate(
                                        data2.disable_end
                                          ? toKSTDate(data2.disable_end)
                                          : "",
                                      );
                                    }

                                    setRoomReason(
                                      data2.is_ota === 1
                                        ? "네이버예약"
                                        : data2.reason,
                                    );
                                  }}
                                >
                                  {data2.name}{" "}
                                  {String(data2.id).includes("EXTRA_")
                                    ? "임시"
                                    : ""}
                                  <div
                                    className={
                                      !isRoomOccupiedToday(data2)
                                        ? "room_cell_active active"
                                        : "room_cell_active"
                                    }
                                  ></div>{" "}
                                  {!getIsActive(data2.is_active) &&
                                  data2.disable_start != null &&
                                  data2.disable_end != null &&
                                  todayKST >= toKSTDate(data2.disable_start) &&
                                  todayKST <= toKSTDate(data2.disable_end)
                                    ? "숙박중"
                                    : "정보보기"}
                                </div>

                                <br />
                              </>
                            );
                          })}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {isPop && (
        <div className="popup_wrap">
          <div className="popup">
            <div className="popup_title">객실추가</div>
            <div
              className="popup_x"
              onClick={() => {
                setIsPop(false);
                setIsPet(0);
                setStartDate("");
                setEndDate("");
              }}
            >
              X
            </div>
            <table>
              <tbody>
                <tr>
                  <th>그룹</th>
                  <td>
                    <select
                      value={roomGroupId}
                      onChange={(e) => {
                        setRoomGroupId(e.target.value);
                      }}
                    >
                      <option value="">선택</option>

                      {groups.map((data, i) => (
                        <option value={data.id} key={`kjhk${i}`}>
                          {data.name}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
                <tr>
                  <th>객실 이름</th>
                  <td>
                    <input
                      type="text"
                      value={roomNameForCreate}
                      onChange={(e) => {
                        setRoomNameForCreate(e.target.value);
                      }}
                    />
                  </td>
                </tr>
                <tr>
                  <th>반려동물 수용</th>
                  <td>
                    <div className="checks">
                      <input
                        type="radio"
                        id="create_pet_able"
                        name="create_is_pet"
                        checked={isPet === 1}
                        onChange={() => setIsPet(1)}
                      />
                      <label htmlFor="create_pet_able">가능</label>
                    </div>

                    <div className="checks">
                      <input
                        type="radio"
                        id="create_pet_disable"
                        name="create_is_pet"
                        checked={isPet === 0}
                        onChange={() => setIsPet(0)}
                      />
                      <label htmlFor="create_pet_disable">불가능</label>
                    </div>
                  </td>
                </tr>
                {/* <tr>
                  <th>예약 타입</th>
                  <td>
                    <div className="checks">
                      <input
                        type="radio"
                        id="stay_only"
                        name="reservation_type"
                        onChange={() => setIsDay(0)}
                        checked={isDay === 0}
                      />
                      <label htmlFor="stay_only">숙박만 가능</label>
                    </div>

                    <div className="checks">
                      <input
                        type="radio"
                        id="both"
                        name="reservation_type"
                        onChange={() => setIsDay(1)}
                        checked={isDay === 1}
                      />
                      <label htmlFor="both">데이유즈 + 숙박 가능</label>
                    </div>

                    <div className="checks">
                      <input
                        type="radio"
                        id="day_only"
                        name="reservation_type"
                        onChange={() => setIsDay(2)}
                        checked={isDay === 2}
                      />
                      <label htmlFor="day_only">데이유즈만 가능</label>
                    </div>
                  </td>
                </tr> */}
                <tr>
                  <th>최소인원</th>
                  <td>
                    <input
                      type="number"
                      value={capacityMin}
                      onChange={(e) => {
                        setCapacityMin(e.target.value);
                      }}
                    />
                  </td>
                </tr>
                <tr>
                  <th>최대인원</th>
                  <td>
                    <input
                      type="number"
                      value={capacityMax}
                      onChange={(e) => {
                        setCapacityMax(e.target.value);
                      }}
                    />
                  </td>
                </tr>
                <tr>
                  <th>데이유즈 최소인원</th>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={capacityMinDayuse}
                      onChange={(e) => {
                        setCapacityMinDayuse(e.target.value);
                      }}
                    />
                  </td>
                </tr>

                <tr>
                  <th>데이유즈 최대인원</th>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={capacityMaxDayuse}
                      onChange={(e) => {
                        setCapacityMaxDayuse(e.target.value);
                      }}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="btn_area">
              <button className="green" onClick={createRoom}>
                저장
              </button>
              <button
                onClick={() => {
                  setIsPop(false);
                  setIsPet(0);
                  setStartDate("");
                  setEndDate("");
                }}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {isPop2 && (
        <div className="popup_wrap">
          <div className="popup">
            <div className="popup_title">그룹추가</div>
            <div
              className="popup_x"
              onClick={() => {
                setIsPop2(false);
                setStartDate("");
                setEndDate("");
              }}
            >
              X
            </div>
            <table>
              <tbody>
                <tr>
                  <th>그룹명</th>
                  <td>
                    <input
                      type="text"
                      value={groupNameForCreate}
                      onChange={(e) => {
                        setGroupNameForCreate(e.target.value);
                      }}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="btn_area">
              <button className="green" onClick={createGroup}>
                저장
              </button>
              <button
                onClick={() => {
                  setIsPop2(false);
                  setStartDate("");
                  setEndDate("");
                }}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
      {isDetailPop && (
        <div className="popup_wrap">
          <div className="popup" style={{ height: "auto", width: "1000px" }}>
            <div className="popup_title">객실 디테일</div>
            <div
              className="popup_x"
              onClick={() => {
                setIsDetailPop(false);
                setIsActive(true);
                setIsPet(0);
                setStartDate("");
                setEndDate("");
              }}
            >
              X
            </div>
            <table>
              <tbody>
                <tr>
                  <th>객실명</th>
                  <td>
                    {roomDetailGroupName} &gt; {roomDetailName}
                  </td>
                </tr>
                <tr>
                  <th>이름(수정시)</th>
                  <td>
                    <input
                      type="text"
                      value={roomDetailName}
                      onChange={(e) => {
                        setRoomDetailName(e.target.value);
                      }}
                    />
                  </td>
                </tr>
                <tr>
                  <th>반려동물 수용</th>
                  <td>
                    <div className="checks">
                      <input
                        type="radio"
                        id="detail_pet_able"
                        name="detail_is_pet"
                        checked={isPet === 1}
                        onChange={() => setIsPet(1)}
                      />
                      <label htmlFor="detail_pet_able">가능</label>
                    </div>

                    <div className="checks">
                      <input
                        type="radio"
                        id="detail_pet_disable"
                        name="detail_is_pet"
                        checked={isPet === 0}
                        onChange={() => setIsPet(0)}
                      />
                      <label htmlFor="detail_pet_disable">불가능</label>
                    </div>
                  </td>
                </tr>
                {String(roomId).includes("EXTRA_") && (
                  <tr>
                    <th>임시기간</th>
                    <td>
                      {toKSTDate(startDate)} ~ {toKSTDate(endDate)}
                    </td>
                  </tr>
                )}
                <tr>
                  <th>최소인원</th>
                  <td>
                    <input
                      type="number"
                      value={capacityMin}
                      onChange={(e) => {
                        setCapacityMin(e.target.value);
                      }}
                    />
                  </td>
                </tr>
                <tr>
                  <th>최대인원</th>
                  <td>
                    <input
                      type="number"
                      value={capacityMax}
                      onChange={(e) => {
                        setCapacityMax(e.target.value);
                      }}
                    />
                  </td>
                </tr>
                <tr>
                  <th>데이유즈 최소인원</th>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={capacityMinDayuse}
                      onChange={(e) => {
                        setCapacityMinDayuse(e.target.value);
                      }}
                    />
                  </td>
                </tr>

                <tr>
                  <th>데이유즈 최대인원</th>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={capacityMaxDayuse}
                      onChange={(e) => {
                        setCapacityMaxDayuse(e.target.value);
                      }}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="btn_area">
              <button className="green" onClick={modifyRoom}>
                수정내역 저장
              </button>
              <button className="red" onClick={roomDelete}>
                이 객실 삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {isDetailPopGroup && (
        <div className="popup_wrap">
          <div
            className="popup"
            style={{
              height: "auto",
              width: "1000px",
            }}
          >
            <div className="popup_title">그룹 디테일</div>
            <div
              className="popup_x"
              onClick={() => {
                setIsDetailPopGroup(false);
                setContractSections([]);
                setIsActiveGroup(true);

                setOptionList([]);
                setUnusedOptionIds([]);
                setIsOptionLoading(false);

                setStartDate("");
                setEndDate("");
              }}
            >
              X
            </div>
            <div style={{ height: "650px", overflow: "auto" }}>
              <table>
                <tbody>
                  <tr>
                    <th>그룹명</th>
                    <td>
                      <input
                        type="text"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>사용 옵션</th>

                    <td>
                      <div className="group_option_description">
                        체크된 옵션만 이 객실 그룹에서 사용할 수 있습니다.
                      </div>

                      {isOptionLoading ? (
                        <div className="group_option_message">
                          옵션 목록을 불러오는 중입니다.
                        </div>
                      ) : optionList.length === 0 ? (
                        <div className="group_option_message">
                          현재 사용 중인 옵션이 없습니다.
                        </div>
                      ) : (
                        <div className="group_option_list">
                          {optionList.map((option) => {
                            const optionId = Number(option.id);

                            const isUsed = !unusedOptionIds.includes(optionId);

                            return (
                              <label
                                className={`group_option_item ${
                                  isUsed ? "active" : ""
                                }`}
                                key={optionId}
                              >
                                <input
                                  type="checkbox"
                                  checked={isUsed}
                                  onChange={() => toggleGroupOption(optionId)}
                                />

                                <span className="group_option_checkbox"></span>

                                <span className="group_option_info">
                                  <strong>{option.name}</strong>

                                  <small>
                                    {Number(option.price || 0).toLocaleString()}
                                    원
                                  </small>
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <th>안내사항</th>

                    <td>
                      <div className="contract_editor">
                        <div className="contract_editor_top">
                          <div>
                            객실 예약과 결제 단계에서 표시될 안내사항입니다.
                          </div>

                          <button
                            type="button"
                            className="green"
                            onClick={addContractSection}
                          >
                            안내 영역 추가
                          </button>
                        </div>

                        {contractSections.length === 0 ? (
                          <div className="contract_editor_empty">
                            등록된 안내사항이 없습니다.
                            <br />
                            안내 영역 추가 버튼을 눌러 내용을 입력해주세요.
                          </div>
                        ) : (
                          <div className="contract_section_list">
                            {contractSections.map((section, sectionIndex) => (
                              <div
                                className="contract_section_box"
                                key={`contract-section-${sectionIndex}`}
                              >
                                <div className="contract_section_header">
                                  <strong>안내 영역 {sectionIndex + 1}</strong>

                                  <div className="contract_section_buttons">
                                    <button
                                      type="button"
                                      disabled={sectionIndex === 0}
                                      onClick={() =>
                                        moveContractSection(sectionIndex, -1)
                                      }
                                    >
                                      위로
                                    </button>

                                    <button
                                      type="button"
                                      disabled={
                                        sectionIndex ===
                                        contractSections.length - 1
                                      }
                                      onClick={() =>
                                        moveContractSection(sectionIndex, 1)
                                      }
                                    >
                                      아래로
                                    </button>

                                    <button
                                      type="button"
                                      className="red"
                                      onClick={() =>
                                        removeContractSection(sectionIndex)
                                      }
                                    >
                                      영역 삭제
                                    </button>
                                  </div>
                                </div>

                                <div className="contract_field">
                                  <label>출력 형식</label>

                                  <select
                                    value={section.type || "section"}
                                    onChange={(e) =>
                                      updateContractSection(
                                        sectionIndex,
                                        "type",
                                        e.target.value,
                                      )
                                    }
                                  >
                                    <option value="section">일반 안내</option>

                                    <option value="star">별표 강조 문구</option>

                                    <option value="privacy">
                                      개인정보 활용 동의
                                    </option>
                                  </select>
                                </div>

                                {section.type !== "star" && (
                                  <div className="contract_field">
                                    <label>제목</label>

                                    <input
                                      type="text"
                                      value={section.title || ""}
                                      placeholder={
                                        section.type === "privacy"
                                          ? "예: 개인정보 활용 동의"
                                          : "예: 입실 및 퇴실 시간 안내"
                                      }
                                      onChange={(e) =>
                                        updateContractSection(
                                          sectionIndex,
                                          "title",
                                          e.target.value,
                                        )
                                      }
                                    />
                                  </div>
                                )}

                                {section.type === "privacy" && (
                                  <div className="contract_field">
                                    <label>도입 문구</label>

                                    <textarea
                                      value={section.intro || ""}
                                      placeholder="개인정보 활용 동의 본문 위에 표시할 설명을 입력해주세요."
                                      onChange={(e) =>
                                        updateContractSection(
                                          sectionIndex,
                                          "intro",
                                          e.target.value,
                                        )
                                      }
                                    />
                                  </div>
                                )}

                                <div className="contract_item_title">
                                  <strong>
                                    {section.type === "star"
                                      ? "강조 문구"
                                      : "안내 항목"}
                                  </strong>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      addContractItem(sectionIndex)
                                    }
                                  >
                                    항목 추가
                                  </button>
                                </div>

                                <div className="contract_item_list">
                                  {(section.items || []).map(
                                    (item, itemIndex) => (
                                      <div
                                        className="contract_item_row"
                                        key={`contract-item-${sectionIndex}-${itemIndex}`}
                                      >
                                        <span className="contract_item_number">
                                          {itemIndex + 1}
                                        </span>

                                        <textarea
                                          value={item}
                                          placeholder="안내 내용을 입력해주세요."
                                          style={{ height: "50px" }}
                                          onChange={(e) =>
                                            updateContractItem(
                                              sectionIndex,
                                              itemIndex,
                                              e.target.value,
                                            )
                                          }
                                        />

                                        <button
                                          type="button"
                                          className="red"
                                          onClick={() =>
                                            removeContractItem(
                                              sectionIndex,
                                              itemIndex,
                                            )
                                          }
                                        >
                                          삭제
                                        </button>
                                      </div>
                                    ),
                                  )}
                                </div>

                                {(section.items || []).length === 0 && (
                                  <div className="contract_item_empty">
                                    등록된 항목이 없습니다. 항목 추가 버튼을
                                    눌러주세요.
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="btn_area">
              <button className="green" onClick={modifyGroup}>
                수정내역 저장
              </button>
              <button className="red" onClick={groupDelete}>
                이 그룹 삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {workPopForSelectedIds && (
        <div className="popup_wrap">
          <div
            className="popup group_detail_popup"
            style={{
              width: "1100px",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div className="popup_title">비활성화 일괄 편집</div>
            <div
              className="popup_x"
              onClick={() => {
                setIsDetailPopGroup(false);
                setIsActiveGroup(true);
                setWorkPopForSelectedIds(false);
                setStartDate("");
                setEndDate("");
              }}
            >
              X
            </div>
            <table>
              <tbody>
                {/* <tr>
                  <th>숙박</th>
                  <td>
                    <div className="checks">
                      <input
                        type="radio"
                        name="ac"
                        id="active"
                        defaultChecked
                        onChange={(e) => {
                          if (e.target.checked) {
                            setIsActiveGroup(true);
                          }
                        }}
                        checked={isActiveGroup}
                      />
                      <label htmlFor="active">숙박아님</label>
                    </div>
                    <div className="checks">
                      <input
                        type="radio"
                        name="ac"
                        id="non-active"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setIsActiveGroup(false);
                          }
                        }}
                        checked={!isActiveGroup}
                      />
                      <label htmlFor="non-active">숙박</label>
                    </div>
                  </td>
                </tr> */}
              </tbody>
            </table>
            {/* <div className="btn_area">
              <button className="green" onClick={workForSelected}>
                숙박 예약 일괄 적용
              </button>
            </div> */}
          </div>
        </div>
      )}
      {isPop3 && (
        <div className="popup_wrap">
          <div className="popup" style={{ height: "700px" }}>
            <div className="popup_title">임시 객실추가(기간)</div>
            <div className="popup_x" onClick={closeExtraRoomPopup}>
              X
            </div>
            <table>
              <tbody>
                <tr>
                  <th>그룹</th>
                  <td>
                    <select
                      value={roomGroupId}
                      onChange={(e) => {
                        setRoomGroupId(e.target.value);
                      }}
                    >
                      <option value="">선택</option>

                      {groups.map((data) => (
                        <option value={data.id} key={data.id}>
                          {data.name}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
                <tr>
                  <th>객실 이름</th>
                  <td>
                    <input
                      type="text"
                      value={roomNameForCreateImsi}
                      onChange={(e) => {
                        setRoomNameForCreateImsi(e.target.value);
                      }}
                    />
                  </td>
                </tr>
                <tr>
                  <th>반려동물 수용</th>
                  <td>
                    <div className="checks">
                      <input
                        type="radio"
                        id="extra_pet_able"
                        name="extra_is_pet"
                        checked={isPetImsi === 1}
                        onChange={() => setIsPetImsi(1)}
                      />
                      <label htmlFor="extra_pet_able">가능</label>
                    </div>

                    <div className="checks">
                      <input
                        type="radio"
                        id="extra_pet_disable"
                        name="extra_is_pet"
                        checked={isPetImsi === 0}
                        onChange={() => setIsPetImsi(0)}
                      />
                      <label htmlFor="extra_pet_disable">불가능</label>
                    </div>
                  </td>
                </tr>
                <tr>
                  <th>운영 시작일</th>
                  <td>
                    <MyDatePicker
                      selectedDate={startDate}
                      onDateChange={handleDateChange1}
                    />
                  </td>
                </tr>

                <tr>
                  <th>운영 종료일</th>
                  <td>
                    <MyDatePicker
                      selectedDate={endDate}
                      onDateChange={handleDateChange2}
                    />
                  </td>
                </tr>
                <tr>
                  <th>최소인원</th>
                  <td>
                    <input
                      type="number"
                      value={capacityMinImsi}
                      onChange={(e) => {
                        setCapacityMinImsi(e.target.value);
                      }}
                    />
                  </td>
                </tr>
                <tr>
                  <th>최대인원</th>
                  <td>
                    <input
                      type="number"
                      value={capacityMaxImsi}
                      onChange={(e) => {
                        setCapacityMaxImsi(e.target.value);
                      }}
                    />
                  </td>
                </tr>
                <tr>
                  <th>데이유즈 최소인원</th>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={capacityMinDayuseImsi}
                      onChange={(e) => {
                        setCapacityMinDayuseImsi(e.target.value);
                      }}
                    />
                  </td>
                </tr>

                <tr>
                  <th>데이유즈 최대인원</th>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={capacityMaxDayuseImsi}
                      onChange={(e) => {
                        setCapacityMaxDayuseImsi(e.target.value);
                      }}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="btn_area">
              <button className="green" onClick={createExtraRoom}>
                저장
              </button>
              <button onClick={closeExtraRoomPopup}>취소</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default RoomManagement;
