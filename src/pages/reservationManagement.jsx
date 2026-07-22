import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import MyDatePicker from "../component/datepicker";
import api from "../api/api";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function ReservationManagement() {
  const now = new Date();

  const minYear = now.getFullYear();
  const minMonth = now.getMonth() + 1;

  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [calendarData, setCalendarData] = useState(null);

  const [selectedDays, setSelectedDays] = useState([]);
  const [isPop, setIsPop] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [groups, setGroups] = useState([]);
  const [manualMap, setManualMap] = useState({});
  const [memos, setMemos] = useState({});
  const [isPop2, setIsPop2] = useState(false);
  const [isHistory, setIsHistory] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyLimit, setHistoryLimit] = useState(10);
  const [guestMemo, setGuestMemo] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [historyData, setHistoryData] = useState([]);
  const [historyTotalPage, setHistoryTotalPage] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [checkInFrom, setCheckInFrom] = useState("");
  const [checkInTo, setCheckInTo] = useState("");

  const [checkOutFrom, setCheckOutFrom] = useState("");
  const [checkOutTo, setCheckOutTo] = useState("");
  const [manualBookingType, setManualBookingType] = useState("stay");
  const [roomPriceInfos, setRoomPriceInfos] = useState([]);
  const [paymentFrom, setPaymentFrom] = useState("");
  const [paymentTo, setPaymentTo] = useState("");
  const [manualCheckOutDate, setManualCheckOutDate] = useState("");
  // 그룹별 입력 방식: "one" | "all"
  const [memoInputMode, setMemoInputMode] = useState({});

  // 상품 전체 공통 메모
  const [allMemos, setAllMemos] = useState({});

  const [customName, setCustomName] = useState({});

  const [allCustomName, setAllCustomName] = useState({});

  const [customRoomNo, setCustomRoomNo] = useState({});

  const [homepageReservations, setHomepageReservations] = useState([]);

  const [isManagerMemoPop, setIsManagerMemoPop] = useState(false);

  const [selectedHistoryRecord, setSelectedHistoryRecord] = useState(null);

  const [managerMemoText, setManagerMemoText] = useState("");

  const [isManagerMemoSaving, setIsManagerMemoSaving] = useState(false);

  const colorPalette = [
    "#ffe5e5",
    "#e5f3ff",
    "#e8ffe5",
    "#fff4d9",
    "#f3e5ff",
    "#e5fff8",
    "#ffe9f5",
    "#f0f0f0",
    "#fff0e5",
    "#e5e9ff",
    "#f9ffe5",
    "#e5fff1",
    "#ffe5f0",
    "#e5f7ff",
    "#f2e5ff",
    "#fffbe5",
    "#e5ffe8",
  ];

  // =================================================
  // 🔥 FIX: color map 유지 (렌더 리셋 방지)
  // =================================================
  const groupColorMap = useRef({});
  const colorIndex = useRef(0);

  const normalizeKSTDate = (value) => {
    if (!value) return "";

    const str = String(value);

    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      return str;
    }

    return new Date(value).toLocaleDateString("sv-SE", {
      timeZone: "Asia/Seoul",
    });
  };

  const openManagerMemoPopup = (historyRecord) => {
    setSelectedHistoryRecord(historyRecord);

    // 기존 manager_memo가 있으면 textarea 초기값으로 사용
    setManagerMemoText(historyRecord?.manager_memo || "");

    setIsManagerMemoPop(true);
  };

  const closeManagerMemoPopup = () => {
    if (isManagerMemoSaving) return;

    setIsManagerMemoPop(false);
    setSelectedHistoryRecord(null);
    setManagerMemoText("");
  };
  const saveManagerMemo = async () => {
    if (!selectedHistoryRecord?.id) {
      alert("선택된 예약 히스토리 정보가 없습니다.");
      return;
    }

    if (isManagerMemoSaving) {
      return;
    }

    try {
      setIsManagerMemoSaving(true);

      const historyId = selectedHistoryRecord.id;

      const response = await api.post(
        `/api/reservation_history/${historyId}/manager-memo`,
        {
          manager_memo: managerMemoText,
        },
      );

      /*
       * 백엔드가 저장된 manager_memo를 반환하면 그 값을 사용하고,
       * 아직 응답 형식이 다르거나 값이 없으면 입력값을 사용한다.
       */
      const savedManagerMemo =
        response.data?.manager_memo ??
        response.data?.data?.manager_memo ??
        managerMemoText;

      /*
       * 현재 예약 히스토리 팝업의 해당 레코드를 즉시 갱신한다.
       * 별도의 목록 재조회 없이 화면에 바로 반영된다.
       */
      setHistoryData((prev) =>
        prev.map((item) =>
          String(item.id) === String(historyId)
            ? {
                ...item,
                manager_memo: savedManagerMemo,
              }
            : item,
        ),
      );

      alert(response.data?.message || "관리자 메모가 저장되었습니다.");

      setIsManagerMemoPop(false);
      setSelectedHistoryRecord(null);
      setManagerMemoText("");
    } catch (err) {
      console.error("관리자 메모 저장 실패:", err.response?.data || err);

      alert(
        err.response?.data?.message ||
          "관리자 메모 저장 중 오류가 발생했습니다.",
      );
    } finally {
      setIsManagerMemoSaving(false);
    }
  };

  const getHomepageReservations = async () => {
    try {
      const monthStart = `${year}-${String(month).padStart(2, "0")}-01`;

      const monthEnd = `${year}-${String(month).padStart(2, "0")}-${String(
        new Date(year, month, 0).getDate(),
      ).padStart(2, "0")}`;

      const response = await api.get(
        `/api/reservation_infos?page=1&limit=10000&check_in_from=${monthStart}&check_in_to=${monthEnd}`,
      );
      console.log("홈페이지 예약 API 전체 응답", response.data);
      console.log("홈페이지 예약 목록", response.data.data);

      setHomepageReservations(response.data.data || []);
    } catch (err) {
      console.error("홈페이지 예약 조회 실패:", err);
      setHomepageReservations([]);
    }
  };

  const isExtraRoom = (room) => String(room?.id || "").startsWith("EXTRA_");

  const normalizeYmd = (value) => {
    if (!value) return "";

    const str = String(value);

    // 이미 순수 YYYY-MM-DD라면 그대로 사용
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      return str;
    }

    // ISO 날짜/Date 객체는 한국시간 날짜로 변환
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleDateString("sv-SE", {
      timeZone: "Asia/Seoul",
    });
  };

  const dayToYmd = (day) => {
    return [
      day.year,
      String(day.month).padStart(2, "0"),
      String(day.day).padStart(2, "0"),
    ].join("-");
  };

  const isExtraRoomAvailableForDays = (room, targetDays) => {
    if (!room?.is_extra) return true;
    if (!targetDays?.length) return false;

    const startYmd = normalizeYmd(room.start_date);
    const endYmd = normalizeYmd(room.end_date);

    if (!startYmd || !endYmd) return false;

    return targetDays.every((day) => {
      const targetYmd = dayToYmd(day);

      // start_date 포함, end_date 미포함
      return targetYmd >= startYmd && targetYmd < endYmd;
    });
  };
  const loadRoomPriceInfos = () => {
    api.get(`/api/room-price?year=${year}&month=${month}`).then((response) => {
      setRoomPriceInfos(response.data.data || []);
    });
  };

  const getRoomColor = (roomName) => {
    const groupName = roomName.replace(/[0-9]/g, "");

    if (!groupColorMap.current[groupName]) {
      groupColorMap.current[groupName] =
        colorPalette[colorIndex.current % colorPalette.length];

      colorIndex.current++;
    }

    return groupColorMap.current[groupName];
  };

  const addDaysToYmd = (ymd, days) => {
    const d = new Date(ymd);
    d.setDate(d.getDate() + days);

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");

    return `${yyyy}-${mm}-${dd}`;
  };

  const getHistoryGroupName = (roomGroupId) => {
    const matchedGroup = groups.find(
      (group) => Number(group.id) === Number(roomGroupId),
    );

    return matchedGroup?.name || "";
  };

  const getHistoryRoomName = (roomId) => {
    const matchedRoom = rooms.find(
      (room) => String(room.id) === String(roomId),
    );

    return matchedRoom?.name || "";
  };

  const renderHistoryDate = (value, source) => {
    if (!value) return "";

    return toKoreanDate(value);
  };

  // =================================================
  function getMonthDates(year, month) {
    const jsMonth = month - 1;

    const lastDate = new Date(year, jsMonth + 1, 0).getDate();

    return Array.from({ length: lastDate }, (_, i) => {
      const date = new Date(year, jsMonth, i + 1);

      return {
        year,
        month,
        day: i + 1,
        weekday: date.getDay(),
        dateObj: date,
      };
    });
  }

  useEffect(() => {
    if (month > 12) {
      setMonth(1);
      setYear((prev) => prev + 1);
      return;
    }

    if (month < 1) {
      setMonth(12);
      setYear((prev) => prev - 1);
      return;
    }

    groupColorMap.current = {};
    colorIndex.current = 0;

    setCalendarData(getMonthDates(year, month));
    loadRoomPriceInfos();
    getHomepageReservations();
  }, [month, year]);

  const downloadExcel = async () => {
    try {
      const now = new Date();
      const pad = (n) => String(n).padStart(2, "0");

      const fileTime =
        `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_` +
        `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

      const rows = [];

      const selectedSet = selectedDays.map(
        (d) =>
          `${d.year}-${String(d.month).padStart(2, "0")}-${String(d.day).padStart(2, "0")}`,
      );

      const monthStart = `${year}-${String(month).padStart(2, "0")}-01`;
      const monthEnd = `${year}-${String(month).padStart(2, "0")}-${String(
        new Date(year, month, 0).getDate(),
      ).padStart(2, "0")}`;

      const paymentRes = await api.get(
        `/api/reservation_infos?page=1&limit=10000&check_in_from=${monthStart}&check_in_to=${monthEnd}`,
      );

      const homepageList = paymentRes.data.data || [];

      const groupMap = groups.reduce((acc, group) => {
        acc[Number(group.id)] = group.name;
        return acc;
      }, {});

      const toKSTDate = (value) => {
        if (!value) return "";

        if (String(value).length === 10) {
          return value;
        }

        return new Date(value).toLocaleDateString("sv-SE", {
          timeZone: "Asia/Seoul",
        });
      };

      const getRoomGroupName = (room) => {
        return (
          room.room_group_name || groupMap[Number(room.room_group_id)] || ""
        );
      };

      const getChannelName = (source) => {
        if (source === "naver") return "네이버";
        if (source === "manual") return "수기예약";
        if (source === "website" || String(source || "").startsWith("SITE_")) {
          return "홈페이지";
        }
        return source || "";
      };

      const optionToText = (options) => {
        if (!options) return "";

        let data = options;

        if (typeof data === "string") {
          try {
            data = JSON.parse(data);
          } catch {
            return data;
          }
        }

        if (Array.isArray(data)) {
          return data
            .map((opt) => {
              const name = opt.name || "";
              const qty = opt.qty ? ` x${opt.qty}` : "";
              const price = opt.price
                ? ` (${Number(opt.price).toLocaleString()}원)`
                : "";
              return `${name}${qty}${price}`;
            })
            .join(", ");
        }

        if (typeof data === "object") {
          return data.name || JSON.stringify(data);
        }

        return "";
      };

      const getHomepageIdFromSource = (source) => {
        const str = String(source || "");
        if (!str.startsWith("SITE_")) return "";
        return str.replace("SITE_", "");
      };

      const findHomepageReservation = (room, booking, start, end) => {
        const source = String(booking.source || "");
        const homepageId = getHomepageIdFromSource(source);

        let homepage = null;

        if (homepageId) {
          homepage = homepageList.find(
            (item) => Number(item.id) === Number(homepageId),
          );

          if (homepage && homepage.status === "PAID") {
            return homepage;
          }
        }

        if (source !== "website" && !source.startsWith("SITE_")) {
          return null;
        }

        homepage = homepageList.find((item) => {
          if (item.status !== "PAID") return false;

          const itemCheckIn = toKSTDate(item.check_in);
          const itemCheckOut = toKSTDate(item.check_out);

          if (normalizeRoomId(item.room_id) !== normalizeRoomId(room.id)) {
            return false;
          }
          if (itemCheckIn !== start) return false;
          if (itemCheckOut !== end) return false;

          return true;
        });

        if (homepage) return homepage;

        homepage = homepageList.find((item) => {
          if (item.status !== "PAID") return false;

          const itemCheckIn = toKSTDate(item.check_in);
          const itemCheckOut = toKSTDate(item.check_out);

          if (Number(item.room_group_id) !== Number(room.room_group_id)) {
            return false;
          }

          if (itemCheckIn !== start) return false;
          if (itemCheckOut !== end) return false;

          return true;
        });

        return homepage || null;
      };

      const pushBookingRow = (room, booking, channelName) => {
        const start = toKSTDate(booking.check_in);
        const end = toKSTDate(booking.check_out);

        if (!start || !end) return;

        const isVisible = selectedSet.some((target) =>
          isBookingVisibleOnDate(target, {
            ...booking,
            check_in: start,
            check_out: end,
          }),
        );

        if (!isVisible) return;

        const homepage = findHomepageReservation(room, booking, start, end);

        rows.push({
          날짜: `${start} ~ ${end}`,
          객실타입: getRoomGroupName(room),
          방번호: room.name || room.room_name || "",

          이름:
            homepage?.buyer_name || booking.name || booking.guest_name || "",

          연락처:
            homepage?.buyer_tel || booking.phone || booking.guest_phone || "",

          메모: homepage?.memo || booking.memo || booking.request_memo || "",

          옵션: optionToText(homepage?.options || booking.booking_option),

          결제일: homepage?.created_at
            ? new Date(homepage.created_at).toLocaleString("ko-KR")
            : booking.payment_date
              ? new Date(booking.payment_date).toLocaleString("ko-KR")
              : "",

          금액:
            homepage?.total_amount !== undefined &&
            homepage?.total_amount !== null
              ? Number(homepage.total_amount).toLocaleString()
              : booking.price
                ? Number(booking.price).toLocaleString()
                : "",

          채널: channelName,
        });
      };

      rooms.forEach((room) => {
        let naverSchedules = [];

        try {
          naverSchedules =
            typeof room.naver_crawling_info === "string"
              ? JSON.parse(room.naver_crawling_info)
              : room.naver_crawling_info || [];
        } catch {
          naverSchedules = [];
        }

        naverSchedules.forEach((booking) => {
          pushBookingRow(room, booking, "네이버");
        });

        const allSchedules = getAllSchedules(room);

        allSchedules.forEach((booking) => {
          const source = booking.source || "";

          if (
            source !== "manual" &&
            source !== "website" &&
            !String(source).startsWith("SITE_")
          ) {
            return;
          }

          pushBookingRow(room, booking, getChannelName(source));
        });
      });

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(workbook, worksheet, "예약목록");

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      saveAs(blob, `예약목록_${year}_${month}_${fileTime}.xlsx`);
    } catch (err) {
      console.error("엑셀 다운로드 실패:", err);
      alert("엑셀 다운로드 중 오류 발생");
    }
  };

  const nextMonth = () => setMonth((prev) => prev + 1);

  const prevMonth = () => {
    if (year === minYear && month === minMonth) return;
    setMonth((prev) => prev - 1);
  };

  const hasNaverBooking = (room, date) => {
    if (!room.check_in_and_out) return false;

    let schedules = room.check_in_and_out;

    if (typeof schedules === "string") {
      schedules = JSON.parse(schedules);
    }

    const target = `${date.year}-${String(date.month).padStart(2, "0")}-${String(
      date.day,
    ).padStart(2, "0")}`;

    return schedules.some((s) => {
      if (s.source !== "naver") return false;

      if (s.check_in === s.check_out) {
        return target === s.check_in;
      }

      return target >= s.check_in && target < s.check_out;
    });
  };

  const getBookingForDate = (room, date) => {
    const schedules = getAllSchedules(room);

    const target = `${date.year}-${String(date.month).padStart(2, "0")}-${String(
      date.day,
    ).padStart(2, "0")}`;

    return schedules.find((s) => {
      const start = normalize(s.check_in);
      const end = normalize(s.check_out);

      if (!start || !end) return false;

      if (start === end) {
        return target === start;
      }

      return target >= start && target < end;
    });
  };

  const isDayBooking = (booking) => {
    if (!booking) return false;
    return booking.check_in === booking.check_out;
  };

  const buildCalendarRows = (dates) => {
    if (!dates || dates.length === 0) return [];

    const rows = [];
    let currentRow = [];

    const firstWeekday = dates[0].weekday;

    for (let i = 0; i < firstWeekday; i++) {
      currentRow.push(null);
    }

    dates.forEach((date) => {
      currentRow.push(date);

      if (currentRow.length === 7) {
        rows.push(currentRow);
        currentRow = [];
      }
    });

    if (currentRow.length > 0) {
      while (currentRow.length < 7) {
        currentRow.push(null);
      }

      rows.push(currentRow);
    }

    return rows;
  };

  // =================================================
  const getDaysByWeekday = (data, targetWeekday) => {
    return data.flat().filter((item) => item?.weekday === targetWeekday);
  };

  // =================================================
  const getRoomsByDate = (date) => {
    if (!date) return [];

    const target = `${date.year}-${String(date.month).padStart(2, "0")}-${String(
      date.day,
    ).padStart(2, "0")}`;

    return rooms.filter((room) => {
      const schedules = getAllSchedules(room);

      return schedules.some((schedule) => {
        if (!schedule.check_in || !schedule.check_out) return false;

        const start = normalize(schedule.check_in);
        const end = normalize(schedule.check_out);
        if (start === end) {
          return target === start;
        }

        return target >= start && target < end;
      });
    });
  };

  useEffect(() => {
    getRooms();
    getRoomGroups();
  }, []);

  const getRooms = () => {
    api.get("/api/rooms").then((response) => {
      const roomList = response.data.data || [];

      console.log("ROOMS RESPONSE", roomList);

      const cube1 = roomList.find((room) => room.name === "큐1");

      console.log("큐1 데이터", cube1);
      console.log("큐1 수기예약", cube1?.check_in_and_out_soogie);

      const sortedRooms = [...roomList].sort((a, b) => {
        // 1. 같은 그룹끼리 붙인다.
        const groupCompare = Number(a.room_group_id) - Number(b.room_group_id);

        if (groupCompare !== 0) {
          return groupCompare;
        }

        // 2. 같은 그룹 안에서는 객실명을 숫자 기준으로 정렬한다.
        // 한1, 한2, 한3 ... 한7 순서
        return String(a.name || "").localeCompare(
          String(b.name || ""),
          "ko-KR",
          {
            numeric: true,
            sensitivity: "base",
          },
        );
      });

      setRooms(sortedRooms);
    });
  };

  const getRoomGroups = () => {
    api.get("/api/room_group").then((response) => {
      setGroups(response.data.data || []);
    });
  };

  const isConsecutiveDays = (days) => {
    if (!days || days.length === 0) return false;

    const sorted = [...days].sort(
      (a, b) =>
        new Date(a.year, a.month - 1, a.day) -
        new Date(b.year, b.month - 1, b.day),
    );

    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(
        sorted[i - 1].year,
        sorted[i - 1].month - 1,
        sorted[i - 1].day,
      );
      const curr = new Date(sorted[i].year, sorted[i].month - 1, sorted[i].day);

      const diff = (curr - prev) / (1000 * 60 * 60 * 24);

      if (diff !== 1) return false;
    }

    return true;
  };

  const formatRange = (days) => {
    if (!days || days.length === 0) return "";

    const sorted = [...days].sort(
      (a, b) =>
        new Date(a.year, a.month - 1, a.day) -
        new Date(b.year, b.month - 1, b.day),
    );

    const start = sorted[0];
    const end = sorted[sorted.length - 1];

    return `${start.year}-${start.month}-${start.day} ~ ${end.year}-${end.month}-${end.day}`;
  };

  // =================================================
  // 🔥 FIX: overlap 함수 통합 사용
  // =================================================
  const isOverlap = (room, selectedDays) => {
    const schedules = getAllSchedules(room);

    return selectedDays.some((d) => {
      const target = `${d.year}-${String(d.month).padStart(2, "0")}-${String(
        d.day,
      ).padStart(2, "0")}`;

      return schedules.some((s) => {
        const start = normalize(s.check_in);
        const end = normalize(s.check_out);

        if (!start || !end) return false;

        if (start === end) {
          return target === start;
        }

        return target >= start && target < end;
      });
    });
  };

  const normalize = (d) => d?.slice(0, 10);

  const normalizeRoomId = (value) => String(value ?? "");

  const toTime = (d) => new Date(d).getTime();

  const getAvailableCount = (groupId) => {
    const targetDays = getManualTargetDays();

    const groupRooms = rooms.filter(
      (room) =>
        Number(room.room_group_id) === Number(groupId) &&
        isExtraRoomAvailableForDays(room, targetDays),
    );

    return groupRooms.filter((room) => isRoomAvailable(room, targetDays))
      .length;
  };

  const getTotalCount = (groupId) => {
    return rooms.filter((r) => r.room_group_id === groupId).length;
  };

  const getGroupRoomInfo = (groupId) => {
    const total = getTotalCount(groupId);
    const available = getAvailableCount(groupId);

    return { total, available };
  };

  useEffect(() => {
    console.log(selectedDays);
  }, [selectedDays]);

  const formatDate = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");

    return `${yyyy}-${mm}-${dd} 00:00:00`;
  };

  const formatDay = (d) => {
    return `${d.year}-${String(d.month).padStart(2, "0")}-${String(d.day).padStart(2, "0")}`;
  };

  const getEffectiveDayUse = (room, dateObj) => {
    const target = formatDay(dateObj);

    const matchedPrice = roomPriceInfos.find(
      (price) =>
        String(price.date).slice(0, 10) === target &&
        Number(price.room_group_id) === Number(room.room_group_id),
    );

    // room_price에 is_day_use 값이 있으면 그걸 최우선
    if (
      matchedPrice &&
      matchedPrice.is_day_use !== null &&
      matchedPrice.is_day_use !== undefined
    ) {
      return Number(matchedPrice.is_day_use);
    }

    // 없으면 기존 room.day_use 사용
    return Number(room.day_use);
  };

  const getManualBookingRange = () => {
    const range = selectedDays
      .map((d) => new Date(d.year, d.month - 1, d.day))
      .sort((a, b) => a - b);

    const checkIn = range[0];

    // 하루 선택
    if (range.length === 1) {
      const checkOut = new Date(checkIn);

      // 데이유즈면 4일 ~ 4일
      if (manualBookingType === "day") {
        return {
          check_in: checkIn,
          check_out: checkOut,
        };
      }

      // 숙박이면 4일 ~ 5일
      if (manualCheckOutDate) {
        return {
          check_in: checkIn,
          check_out: new Date(manualCheckOutDate),
        };
      }

      checkOut.setDate(checkOut.getDate() + 1);

      return {
        check_in: checkIn,
        check_out: checkOut,
      };
    }

    // 여러 날짜 선택은 무조건 숙박
    // 4~5일 선택 => 4~6일 예약, 6일은 체크아웃이라 미표시
    const checkOut = new Date(range[range.length - 1]);
    checkOut.setDate(checkOut.getDate() + 1);

    return {
      check_in: checkIn,
      check_out: checkOut,
    };
  };

  const getManualTargetDays = () => {
    if (!selectedDays.length) return [];

    const { check_in, check_out } = getManualBookingRange();

    const startYmd = formatDate(check_in).slice(0, 10);
    const endYmd = formatDate(check_out).slice(0, 10);

    if (manualBookingType === "day" || startYmd === endYmd) {
      return selectedDays;
    }

    const result = [];
    const cursor = new Date(startYmd);
    const end = new Date(endYmd);

    while (cursor < end) {
      result.push({
        year: cursor.getFullYear(),
        month: cursor.getMonth() + 1,
        day: cursor.getDate(),
      });

      cursor.setDate(cursor.getDate() + 1);
    }

    return result;
  };

  const hasAnyManualBooking = (room) => {
    let schedules = [];

    try {
      schedules =
        typeof room.check_in_and_out_soogie === "string"
          ? JSON.parse(room.check_in_and_out_soogie)
          : room.check_in_and_out_soogie || [];
    } catch {
      schedules = [];
    }

    return schedules.length > 0;
  };

  const getAvailableGroupRooms = (groupId) => {
    const targetDays = getManualTargetDays();

    return rooms
      .filter(
        (room) =>
          Number(room.room_group_id) === Number(groupId) &&
          isExtraRoomAvailableForDays(room, targetDays) &&
          isRoomAvailable(room, targetDays),
      )
      .sort((a, b) =>
        String(a.name || "").localeCompare(String(b.name || ""), undefined, {
          numeric: true,
        }),
      );
  };

  const resetManualBookingInputs = () => {
    setManualMap({});
    setMemos({});
    setAllMemos({});
    setMemoInputMode({});

    setCustomName({});
    setAllCustomName({});
    setCustomRoomNo({});
  };

  const increase = (groupId, max) => {
    setManualMap((prev) => {
      const current = prev[groupId] || 0;

      if (current >= max) return prev;

      return {
        ...prev,
        [groupId]: current + 1,
      };
    });
  };

  const decrease = (groupId) => {
    const current = manualMap[groupId] || 0;

    if (current <= 0) return;

    const nextCount = current - 1;

    setManualMap((prev) => ({
      ...prev,
      [groupId]: nextCount,
    }));

    setMemos((prev) => ({
      ...prev,
      [groupId]: (prev[groupId] || []).slice(0, nextCount),
    }));

    setCustomName((prev) => ({
      ...prev,
      [groupId]: (prev[groupId] || []).slice(0, nextCount),
    }));

    setCustomRoomNo((prev) => ({
      ...prev,
      [groupId]: (prev[groupId] || []).slice(0, nextCount),
    }));

    if (nextCount === 0) {
      setMemoInputMode((prev) => {
        const next = { ...prev };
        delete next[groupId];
        return next;
      });

      setAllMemos((prev) => {
        const next = { ...prev };
        delete next[groupId];
        return next;
      });

      setAllCustomName((prev) => {
        const next = { ...prev };
        delete next[groupId];
        return next;
      });
    }
  };

  const modifyReservationSchedule = async () => {
    try {
      const { check_in, check_out } = getManualBookingRange();

      const groupsToApply = Object.entries(manualMap).filter(
        ([_, count]) => Number(count) > 0,
      );

      if (groupsToApply.length === 0) {
        alert("예약할 객실 수를 선택해 주세요.");
        return;
      }

      for (const [groupId, rawCount] of groupsToApply) {
        const count = Number(rawCount);
        const memoMode = memoInputMode[groupId] || "one";

        const availableRooms = getAvailableGroupRooms(groupId);

        if (availableRooms.length < count) {
          alert(
            `${groups.find((group) => Number(group.id) === Number(groupId))?.name || "해당 상품"}의 예약 가능한 객실 수가 부족합니다.`,
          );
          return;
        }

        let selectedRooms = [];

        const selectedRoomIds = [];
        const usedRoomIds = new Set();

        // 사용자가 선택한 객실 유효성 및 중복 검사
        for (let idx = 0; idx < count; idx++) {
          const selectedId = customRoomNo[groupId]?.[idx];

          if (!selectedId) continue;

          const roomId = normalizeRoomId(selectedId);

          const exists = availableRooms.some(
            (room) => normalizeRoomId(room.id) === roomId,
          );

          if (!exists) {
            alert("선택한 객실이 현재 예약 가능한 상태가 아닙니다.");
            return;
          }

          if (usedRoomIds.has(roomId)) {
            alert("같은 객실을 중복 선택할 수 없습니다.");
            return;
          }

          selectedRoomIds[idx] = roomId;
          usedRoomIds.add(roomId);
        }

        // 선택하지 않은 줄은 남은 객실 순서대로 자동배정
        for (let idx = 0; idx < count; idx++) {
          if (selectedRoomIds[idx]) continue;

          const nextAvailableRoom = availableRooms.find(
            (room) => !usedRoomIds.has(normalizeRoomId(room.id)),
          );

          if (!nextAvailableRoom) {
            alert("예약 가능한 객실이 부족합니다.");
            return;
          }

          const roomId = normalizeRoomId(nextAvailableRoom.id);

          selectedRoomIds[idx] = roomId;
          usedRoomIds.add(roomId);
        }

        selectedRooms = selectedRoomIds
          .map((roomId) =>
            availableRooms.find(
              (room) => normalizeRoomId(room.id) === normalizeRoomId(roomId),
            ),
          )
          .filter(Boolean);

        if (selectedRooms.length !== count) {
          alert("예약할 객실을 모두 선택해 주세요.");
          return;
        }

        console.log(
          "수기예약 최종 배정 객실",
          selectedRooms.map((room) => room.name),
        );

        for (let idx = 0; idx < selectedRooms.length; idx++) {
          const room = selectedRooms[idx];

          const memoText =
            memoMode === "all"
              ? allMemos[groupId] || ""
              : memos[groupId]?.[idx] || "";

          const customNameText =
            memoMode === "all"
              ? allCustomName[groupId] || ""
              : customName[groupId]?.[idx] || "";

          await api.post(`/api/room/${room.id}/manual-booking`, {
            manual_booking: {
              source: "manual",
              check_in: formatDate(check_in).slice(0, 10),
              check_out: formatDate(check_out).slice(0, 10),

              custom_room_no: [room.name],
              custom_name: customNameText,

              memo: memoText,
            },
          });
        }
      }

      alert("수기예약 완료");

      setIsPop(false);
      setManualBookingType("stay");
      setSelectedDays([]);
      setManualCheckOutDate("");

      resetManualBookingInputs();

      getRooms();
    } catch (err) {
      console.error("수기예약 실패:", err.response?.data || err);

      setManualCheckOutDate("");
      alert("수기예약 실패");
    }
  };

  const getManualReservations = () => {
    if (!selectedDays.length) return [];

    const result = [];

    for (const room of rooms) {
      let schedules = [];

      try {
        schedules =
          typeof room.check_in_and_out_soogie === "string"
            ? JSON.parse(room.check_in_and_out_soogie)
            : room.check_in_and_out_soogie || [];
      } catch {
        schedules = [];
      }

      for (const schedule of schedules) {
        const match = selectedDays.some((d) => {
          const target = `${d.year}-${String(d.month).padStart(2, "0")}-${String(d.day).padStart(2, "0")}`;

          if (schedule.check_in === schedule.check_out) {
            return target === schedule.check_in;
          }

          return target >= schedule.check_in && target < schedule.check_out;
        });

        if (match) {
          result.push({
            ...room,
            room_id: room.id,
            room_name: room.name,
            ...schedule,
          });
        }
      }
    }

    return result;
  };

  const cancelManualReservation = async (room) => {
    console.log("취소 클릭됨", room);

    if (!confirm("수기예약 취소할까요?")) return;

    try {
      const response = await api.put(`/api/room/${room.room_id}`, {
        name: room.room_name,
        is_active: 1,
        capacity_max: room.capacity_max,
        capacity_min: room.capacity_min,
        day_use: room.day_use,
        disable_start: null,
        disable_end: null,
        reason: null,
        is_soogie: 0,
        cancel_booking: {
          source: "manual",
          check_in: room.check_in,
          check_out: room.check_out,
        },
      });

      alert("취소 완료");
      getRooms();
    } catch (err) {
      console.error("취소 실패 상세:", err.response?.data || err);
      alert("취소 실패");
    }
  };

  const getAllSchedules = (room) => {
    let naver = [];
    let soogie = [];

    try {
      naver =
        typeof room.check_in_and_out === "string"
          ? JSON.parse(room.check_in_and_out)
          : room.check_in_and_out || [];
    } catch {
      naver = [];
    }

    try {
      soogie =
        typeof room.check_in_and_out_soogie === "string"
          ? JSON.parse(room.check_in_and_out_soogie)
          : room.check_in_and_out_soogie || [];
    } catch {
      soogie = [];
    }

    return [...naver, ...soogie];
  };
  const isRoomAvailable = (room, selectedDays) => {
    const isSingleDay = selectedDays.length === 1;
    const isMultiDay = selectedDays.length > 1;

    // 하루 선택 + 데이유즈
    if (isSingleDay && manualBookingType === "day") {
      const dayUse = getEffectiveDayUse(room, selectedDays[0]);

      // 0 = 숙박만 가능
      if (dayUse === 0) {
        return false;
      }
    }

    // 하루 선택 + 숙박
    if (isSingleDay && manualBookingType === "stay") {
      const dayUse = getEffectiveDayUse(room, selectedDays[0]);

      // 2 = 데이유즈만 가능
      if (dayUse === 2) {
        return false;
      }
    }

    // 여러 날짜 선택은 무조건 숙박
    if (isMultiDay) {
      const hasDayUseOnlyDate = selectedDays.some((d) => {
        const dayUse = getEffectiveDayUse(room, d);
        return dayUse === 2;
      });

      if (hasDayUseOnlyDate) {
        return false;
      }
    }

    const schedules = getAllSchedules(room);

    return !selectedDays.some((d) => {
      const target = `${d.year}-${String(d.month).padStart(2, "0")}-${String(
        d.day,
      ).padStart(2, "0")}`;

      return schedules.some((s) => {
        const start = normalize(s.check_in);
        const end = normalize(s.check_out);

        if (!start || !end) return false;

        if (start === end) {
          return target === start;
        }

        return target >= start && target < end;
      });
    });
  };

  const getNaverReservations = () => {
    if (!selectedDays.length) return [];

    const result = [];

    for (const room of rooms) {
      let schedules = [];

      try {
        schedules =
          typeof room.naver_crawling_info === "string"
            ? JSON.parse(room.naver_crawling_info)
            : room.naver_crawling_info || [];
      } catch {
        schedules = [];
      }

      for (const schedule of schedules) {
        const match = selectedDays.some((d) => {
          const target = `${d.year}-${String(d.month).padStart(2, "0")}-${String(
            d.day,
          ).padStart(2, "0")}`;

          if (schedule.check_in === schedule.check_out) {
            return target === schedule.check_in;
          }

          return target >= schedule.check_in && target < schedule.check_out;
        });

        if (match) {
          result.push({
            ...room,
            room_id: room.id,
            room_name: room.name,
            ...schedule,
          });
        }
      }
    }
    console.log(result);
    return result;
  };
  const getCalendarGuestName = (room, booking) => {
    if (!booking) return "-";

    // 새 수기예약 및 이름이 이미 포함된 예약
    const directName =
      booking.custom_name ||
      booking.name ||
      booking.guest_name ||
      booking.buyer_name;

    if (directName) {
      return directName;
    }

    const source = String(booking.source || "");

    // =====================================
    // 네이버 예약 원본에서 이름 찾기
    // =====================================
    if (source === "naver") {
      let naverBookings = [];

      try {
        naverBookings =
          typeof room.naver_crawling_info === "string"
            ? JSON.parse(room.naver_crawling_info)
            : room.naver_crawling_info || [];
      } catch {
        naverBookings = [];
      }

      const matchedNaver = naverBookings.find((item) => {
        // 예약번호가 있으면 예약번호를 최우선으로 비교
        if (booking.booking_id && item.booking_id) {
          return String(item.booking_id) === String(booking.booking_id);
        }

        // 예전 데이터처럼 예약번호가 없으면 날짜로 비교
        return (
          String(item.check_in || "").slice(0, 10) ===
            String(booking.check_in || "").slice(0, 10) &&
          String(item.check_out || "").slice(0, 10) ===
            String(booking.check_out || "").slice(0, 10)
        );
      });
      return (
        matchedNaver?.name ||
        matchedNaver?.guest_name ||
        matchedNaver?.buyer_name ||
        "-"
      );
    }

    // =====================================
    // 홈페이지 예약 원본에서 이름 찾기
    // =====================================
    if (source === "website" || source.startsWith("SITE_")) {
      let roomReservationInfos = [];

      try {
        roomReservationInfos =
          typeof room.naver_crawling_info === "string"
            ? JSON.parse(room.naver_crawling_info)
            : room.naver_crawling_info || [];
      } catch {
        roomReservationInfos = [];
      }

      const bookingCheckIn = normalizeKSTDate(booking.check_in);
      const bookingCheckOut = normalizeKSTDate(booking.check_out);

      const matchedRoomReservation = roomReservationInfos.find((item) => {
        const itemBookingId = String(item.booking_id || "");
        const itemSource = String(item.source || "");

        const isWebsiteReservation =
          itemSource === "website" ||
          itemBookingId.startsWith("SITE_") ||
          item.reservation_id;

        if (!isWebsiteReservation) return false;

        return (
          normalizeKSTDate(item.check_in) === bookingCheckIn &&
          normalizeKSTDate(item.check_out) === bookingCheckOut
        );
      });

      if (matchedRoomReservation) {
        return (
          matchedRoomReservation.name ||
          matchedRoomReservation.buyer_name ||
          matchedRoomReservation.guest_name ||
          "-"
        );
      }
      const reservationId = source.startsWith("SITE_")
        ? source.replace("SITE_", "")
        : booking.reservation_id;

      // SITE_예약ID 또는 reservation_id가 있으면 가장 정확하게 매칭
      if (reservationId) {
        const matchedById = homepageReservations.find(
          (item) => Number(item.id) === Number(reservationId),
        );

        if (matchedById) {
          return (
            matchedById.buyer_name ||
            matchedById.buyerName ||
            matchedById.guest_name ||
            matchedById.guestName ||
            matchedById.name ||
            "-"
          );
        }
      }

      // 같은 상품 그룹 + 같은 기간의 홈페이지 결제 예약들
      const matchedHomepageReservations = homepageReservations
        .filter((item) => {
          const sameGroup =
            Number(item.room_group_id) === Number(room.room_group_id);

          const sameCheckIn =
            normalizeKSTDate(item.check_in) === bookingCheckIn;

          const sameCheckOut =
            normalizeKSTDate(item.check_out) === bookingCheckOut;

          const isPaid = !item.status || item.status === "PAID";

          return sameGroup && sameCheckIn && sameCheckOut && isPaid;
        })
        .sort((a, b) => Number(a.id) - Number(b.id));

      if (matchedHomepageReservations.length === 0) {
        return "-";
      }

      // 같은 그룹·기간에 홈페이지 예약이 배정된 실제 객실 목록
      const assignedWebsiteRooms = rooms
        .filter(
          (targetRoom) =>
            Number(targetRoom.room_group_id) === Number(room.room_group_id),
        )
        .filter((targetRoom) => {
          const schedules = getAllSchedules(targetRoom);

          return schedules.some((schedule) => {
            const scheduleSource = String(schedule.source || "");

            if (
              scheduleSource !== "website" &&
              !scheduleSource.startsWith("SITE_")
            ) {
              return false;
            }

            return (
              normalizeKSTDate(schedule.check_in) === bookingCheckIn &&
              normalizeKSTDate(schedule.check_out) === bookingCheckOut
            );
          });
        })
        .sort((a, b) =>
          String(a.name || "").localeCompare(String(b.name || ""), undefined, {
            numeric: true,
          }),
        );

      const currentRoomIndex = assignedWebsiteRooms.findIndex(
        (targetRoom) =>
          normalizeRoomId(targetRoom.id) === normalizeRoomId(room.id),
      );

      const matchedWebsite =
        matchedHomepageReservations[currentRoomIndex] ||
        matchedHomepageReservations[0];

      console.log("홈페이지 최종 순서 매칭", {
        room: room.name,
        currentRoomIndex,
        assignedRooms: assignedWebsiteRooms.map((item) => item.name),
        matchedReservationId: matchedWebsite?.id,
        matchedWebsite,
      });

      return (
        matchedWebsite?.buyer_name ||
        matchedWebsite?.buyerName ||
        matchedWebsite?.guest_name ||
        matchedWebsite?.guestName ||
        matchedWebsite?.name ||
        matchedWebsite?.customer_name ||
        matchedWebsite?.reservation_name ||
        "-"
      );
    }

    // 과거 수기예약은 당시 이름 자체를 저장하지 않았다면 복구 불가
    return "-";
  };

  const getBookingsByDate = (date) => {
    if (!date) return [];

    const target = `${date.year}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`;

    const result = [];

    for (const room of rooms) {
      const schedules = getAllSchedules(room);

      for (const schedule of schedules) {
        const start = normalize(schedule.check_in);
        const end = normalize(schedule.check_out);

        if (!start || !end) continue;

        if (isBookingVisibleOnDate(target, schedule)) {
          result.push({
            room,
            booking: schedule,
          });
        }
      }
    }

    return result;
  };

  const getHistory = () => {
    api
      .get(
        `/api/reservation_history?page=${historyPage}&limit=${historyLimit}
      &guest_name=${encodeURIComponent(guestName)}
      &guest_phone=${encodeURIComponent(guestPhone)}
      &memo=${encodeURIComponent(guestMemo)}
      &check_in_from=${encodeURIComponent(checkInFrom)}
      &check_out_to=${encodeURIComponent(checkOutTo)}
      &payment_from=${encodeURIComponent(paymentFrom)}
      &payment_to=${encodeURIComponent(paymentTo)}`.replace(/\s+/g, ""),
      )
      .then((response) => {
        console.log("예약 히스토리 응답", response.data);
        setHistoryData(response.data.list);
        setHistoryTotal(response.data.total);
        setHistoryTotalPage(response.data.totalPage);
      });
  };

  const toKoreanDate = (value) => {
    if (!value) {
      return "";
    }

    return new Date(value).toLocaleDateString("sv-SE", {
      timeZone: "Asia/Seoul",
    });
  };

  const formatKSTDateTime = (value) => {
    if (!value) return "-";

    const d = new Date(value);

    return new Intl.DateTimeFormat("sv-SE", {
      timeZone: "Asia/Seoul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(d);
  };

  const renderOptions = (options) => {
    if (!options) return "-";

    let data = options;

    // 1) string → 그대로 반환
    if (typeof data === "string") {
      return data;
    }

    // 2) object (단일 옵션)
    if (!Array.isArray(data)) {
      return data.name || "-";
    }

    // 3) array (여러 옵션)
    if (Array.isArray(data)) {
      if (data.length === 0) return "-";

      return data
        .map((opt) => {
          const name = opt.name || "-";
          const qty = opt.qty ? ` x${opt.qty}` : "";
          const price = opt.price
            ? ` (${Number(opt.price).toLocaleString()}원)`
            : "";

          return `${name}${qty}${price}`;
        })
        .join("<br/>");
    }

    return "-";
  };

  const getHomepageReservationsForHistory = async () => {
    try {
      const response = await api.get(
        "/api/reservation_infos?page=1&limit=10000",
      );

      setHomepageReservations(response.data.data || []);
    } catch (err) {
      console.error("히스토리용 홈페이지 예약 조회 실패:", err);
    }
  };
  const parseCountData = (value) => {
    if (!value) return [];

    try {
      const parsed = typeof value === "string" ? JSON.parse(value) : value;

      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.error("count JSON 파싱 실패:", value, err);
      return [];
    }
  };

  const getCountSummary = (count) => {
    const list = parseCountData(count);

    if (!list.length) {
      return null;
    }

    const totalPeople = list.reduce((sum, item) => {
      if (!item || typeof item !== "object") return sum;

      return sum + Number(item.people || 0);
    }, 0);

    const totalPets = list.reduce((sum, item) => {
      if (!item || typeof item !== "object") return sum;

      return sum + Number(item.pets || 0);
    }, 0);

    return {
      totalPeople,
      totalPets,
    };
  };

  const findHomepageReservationForHistory = (
    payloadData,
    source,
    roomGroupId,
  ) => {
    const sourceText = String(source || "");

    if (sourceText !== "website" && !sourceText.startsWith("SITE_")) {
      return null;
    }

    const bookingId = String(payloadData?.booking_id || "");
    const reservationId = payloadData?.reservation_id;

    let targetId = null;

    // source 자체가 SITE_123 형태
    if (sourceText.startsWith("SITE_")) {
      targetId = sourceText.replace("SITE_", "");
    }

    // payload.booking_id가 SITE_123 형태
    if (!targetId && bookingId.startsWith("SITE_")) {
      targetId = bookingId.replace("SITE_", "");
    }

    // payload에 reservation_id가 있는 경우
    if (!targetId && reservationId) {
      targetId = reservationId;
    }

    // ID가 있으면 가장 정확하게 조회
    if (targetId) {
      const matchedById = homepageReservations.find(
        (item) => Number(item.id) === Number(targetId),
      );

      if (matchedById) {
        return matchedById;
      }
    }

    // 과거 홈페이지 데이터 fallback
    return (
      homepageReservations.find((item) => {
        const sameGroup = Number(item.room_group_id) === Number(roomGroupId);

        const sameCheckIn =
          normalizeKSTDate(item.check_in) ===
          normalizeKSTDate(payloadData?.check_in);

        const sameCheckOut =
          normalizeKSTDate(item.check_out) ===
          normalizeKSTDate(payloadData?.check_out);

        const samePhone =
          String(item.buyer_tel || "").replace(/\D/g, "") ===
          String(payloadData?.phone || "").replace(/\D/g, "");

        return sameGroup && sameCheckIn && sameCheckOut && samePhone;
      }) || null
    );
  };

  const renderPayload = (
    payload,
    canceled,
    rowCreatedAt,
    source,
    roomGroupName,
    roomGroupId,
    roomName,
    managerMemo,
  ) => {
    try {
      const data =
        typeof payload === "string" ? JSON.parse(payload) : payload || {};

      const sourceText = String(source || "");

      const isWebsite =
        sourceText === "website" || sourceText.startsWith("SITE_");

      const homepageReservation = isWebsite
        ? findHomepageReservationForHistory(data, sourceText, roomGroupId)
        : null;

      const paymentMethod = data.method || homepageReservation?.method || "";

      /*
       * 히스토리 payload에 count가 있으면 그것을 우선 사용하고,
       * 없으면 reservations_info에서 찾은 값을 사용
       */
      const countValue = data.count ?? homepageReservation?.count;

      const countSummary = isWebsite ? getCountSummary(countValue) : null;

      const paymentDate =
        isWebsite || sourceText === "manual"
          ? rowCreatedAt
          : data.payment_date || null;

      return `
      ${
        Number(canceled) === 1
          ? `
            <div style="
              color:red;
              font-weight:bold;
              margin-bottom:6px;
            ">
              취소됨
            </div>
          `
          : ""
      }

      예약자 : ${data.name || "-"}<br />
      연락처 : ${data.phone || "-"}<br />

      <span style="color:blue">
        상품명 : ${
          sourceText === "manual"
            ? `수기예약(${roomGroupName || "-"})`
            : data.product_name || "-"
        }
      </span><br />

      ${sourceText === "naver" ? `방넘버 : ${roomName || "-"}<br />` : ""}

      방수 : ${data.qty || "-"}<br />

      ${
        countSummary
          ? `
            인원수 : ${countSummary.totalPeople}명<br />
            강아지 : ${countSummary.totalPets}마리<br />
          `
          : ""
      }

      ${
        sourceText === "manual"
          ? `
            객실명 : ${
              Array.isArray(data.custom_room_no)
                ? data.custom_room_no.join(", ")
                : data.custom_room_no || "-"
            }<br />
          `
          : ""
      }

      금액 : ${data.price ? Number(data.price).toLocaleString() : "0"}원<br />
      ${isWebsite ? `결제수단 : ${paymentMethod || "-"}<br />` : ""}
      결제일 : ${formatKSTDateTime(paymentDate)}<br />
      체크인 : ${data.check_in || "-"}<br />
      체크아웃 : ${data.check_out || "-"}<br />
      예약번호 : ${data.booking_id || "-"}<br />
      옵션 : ${renderOptions(data.booking_option || data.options)}<br />
      메모 : ${data.request_memo || ""}<br/>
     ${
       sourceText === "naver" ||
       sourceText === "website" ||
       sourceText.startsWith("SITE_")
         ? `
        <div style="
          margin-top:8px;
          padding-top:8px;
          border-top:1px solid #ddd;
        ">
          <strong>관리자메모 :</strong><br />
          <div style="
            margin-top:4px;
            word-break:break-all;
          ">
            ${managerMemo || "-"}
          </div>
        </div>
      `
         : ""
     }
     
    `;
    } catch (err) {
      console.error("renderPayload error:", err, payload);

      return Number(canceled) === 1
        ? `<div style="color:red;font-weight:bold;">취소됨</div>`
        : "-";
    }
  };

  const getPreviewAssignedRoomIds = (groupId, count) => {
    const availableRooms = getAvailableGroupRooms(groupId);
    const result = Array(Number(count) || 0).fill(null);
    const usedRoomIds = new Set();

    // 직접 선택한 객실 우선
    for (let idx = 0; idx < result.length; idx++) {
      const selectedId = normalizeRoomId(customRoomNo[groupId]?.[idx]);

      if (!selectedId) continue;

      const exists = availableRooms.some(
        (room) => normalizeRoomId(room.id) === selectedId,
      );

      if (!exists || usedRoomIds.has(selectedId)) continue;

      result[idx] = selectedId;
      usedRoomIds.add(selectedId);
    }

    // 선택하지 않은 객실 자동배정
    for (let idx = 0; idx < result.length; idx++) {
      if (result[idx]) continue;

      const nextRoom = availableRooms.find(
        (room) => !usedRoomIds.has(normalizeRoomId(room.id)),
      );

      if (!nextRoom) continue;

      const roomId = normalizeRoomId(nextRoom.id);

      result[idx] = roomId;
      usedRoomIds.add(roomId);
    }

    return result;
  };

  useEffect(() => {
    if (isHistory) {
      getHistory();
    }
  }, [historyPage, isHistory]);

  const isBookingVisibleOnDate = (target, schedule) => {
    const start = normalize(schedule.check_in);
    const end = normalize(schedule.check_out);

    if (!start || !end) return false;

    // 데이유즈
    if (start === end) {
      return target === start;
    }

    // 숙박
    return target >= start && target < end;
  };

  useEffect(() => {
    if (!groups.length || !rooms.length) return;

    const groupMap = groups.reduce((acc, g) => {
      acc[g.id] = g.name;
      return acc;
    }, {});

    setRooms((prev) =>
      prev.map((room) => ({
        ...room,
        room_group_name: groupMap[room.room_group_id] || "",
      })),
    );
  }, [groups]);

  return (
    <>
      <div className="workspace">
        <div className="title">객실예약 조회 / 관리</div>

        <div className="content">
          <div className="btn_area">
            <button
              className="green"
              onClick={() => {
                if (selectedDays.length === 0) {
                  alert("가격을 설정할 날짜를 선택해 주세요");
                  return;
                }
                if (!isConsecutiveDays(selectedDays)) {
                  alert("날짜는 연속으로 선택해야 합니다.");
                  return;
                }
                const first = [...selectedDays].sort(
                  (a, b) =>
                    new Date(a.year, a.month - 1, a.day) -
                    new Date(b.year, b.month - 1, b.day),
                )[0];

                const checkInYmd = formatDay(first);
                setManualCheckOutDate(addDaysToYmd(checkInYmd, 1));

                setIsPop(true);
              }}
            >
              선택한 날짜 수기예약 / 취소
            </button>
            <button
              className="green"
              onClick={() => {
                if (selectedDays.length === 0) {
                  alert("가격을 설정할 날짜를 선택해 주세요");
                  return;
                }
                if (!isConsecutiveDays(selectedDays)) {
                  alert("날짜는 연속으로 선택해야 합니다.");
                  return;
                }
                setIsPop2(true);
              }}
            >
              선택한 날짜 네이버예약 상세
            </button>
            <button
              className="green"
              onClick={() => {
                if (selectedDays.length === 0) {
                  alert("다운로드 받을 날짜를 지정해주세요");
                  return;
                }
                downloadExcel();
              }}
            >
              선택 날짜 기준 엑셀 다운로드
            </button>
            <button
              className="green"
              onClick={async () => {
                await getHomepageReservationsForHistory();
                setIsHistory(true);
              }}
            >
              예약 히스토리
            </button>
          </div>

          <div className="rooms_calendar_info">
            <button
              className="prev"
              disabled={year === minYear && month === minMonth}
              onClick={() => {
                prevMonth();
                setSelectedDays([]);
              }}
            >
              Prev
            </button>
            {year}.{month}
            <button
              className="next"
              onClick={() => {
                nextMonth();
                setSelectedDays([]);
              }}
            >
              Next
            </button>
          </div>

          <div className="rooms_calendar">
            <table>
              <colgroup>
                <col style={{ width: "14%" }} />
                <col style={{ width: "14%" }} />
                <col style={{ width: "14%" }} />
                <col style={{ width: "14%" }} />
                <col style={{ width: "14%" }} />
                <col style={{ width: "14%" }} />
                <col style={{ width: "14%" }} />
              </colgroup>

              <thead>
                <tr>
                  {["일", "월", "화", "수", "목", "금", "토"].map(
                    (dayName, index) => (
                      <th key={index}>{dayName}</th>
                    ),
                  )}
                </tr>
              </thead>

              <tbody>
                {buildCalendarRows(calendarData).map((week, rowIndex) => (
                  <tr key={rowIndex}>
                    {week.map((date, colIndex) => (
                      <td
                        key={colIndex}
                        className={
                          selectedDays.includes(date) ? "day_active" : ""
                        }
                        onClick={() => {
                          setSelectedDays((data) =>
                            data.includes(date)
                              ? data.filter((d) => d !== date)
                              : [...data, date],
                          );
                        }}
                        style={{ verticalAlign: "top" }}
                      >
                        <div>{date ? date.day : ""}</div>

                        {date &&
                          getBookingsByDate(date).map(
                            ({ room, booking }, idx) => (
                              <div
                                key={`${room.id}-${booking?.check_in}-${booking?.check_out}`}
                                style={{
                                  fontSize: "11px",
                                  padding: "2px 4px",
                                  marginTop: "2px",
                                  borderRadius: "4px",
                                  background: getRoomColor(room.name),
                                }}
                              >
                                {room.name}{" "}
                                {(() => {
                                  if (!booking) return "";

                                  const source = String(booking.source || "");

                                  const label =
                                    source === "naver"
                                      ? "네이버예약"
                                      : source === "website" ||
                                          source.startsWith("SITE_")
                                        ? "홈페이지예약"
                                        : "수기예약";

                                  const checkout = booking.check_out.slice(5);

                                  const guestName = getCalendarGuestName(
                                    room,
                                    booking,
                                  );

                                  return `(${label}${
                                    isDayBooking(booking)
                                      ? " 데이"
                                      : ` 체크아웃:${checkout}`
                                  }) ${guestName}`;
                                })()}
                              </div>
                            ),
                          )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isPop && (
        <div className="popup_wrap">
          <div className="popup" style={{ height: "auto", width: "1400px" }}>
            <div className="popup_title">선택한 날짜 수기 예약</div>
            <div
              className="popup_x"
              onClick={() => {
                setIsPop(false);
                resetManualBookingInputs();
                setSelectedDays([]);
                setManualBookingType("stay");
                setManualCheckOutDate("");
              }}
            >
              X
            </div>
            <div style={{ width: "50%", float: "left", height: "auto" }}>
              <table>
                <colgroup>
                  <col style={{ width: "140px" }} />
                  <col style={{ width: "auto" }} />
                </colgroup>

                <tbody>
                  <tr>
                    <th>선택한 기간</th>
                    <td>
                      {selectedDays.length === 1 ? (
                        <>
                          <span>{formatDay(selectedDays[0])}</span>
                          <span style={{ margin: "0 8px" }}>~</span>

                          {manualBookingType === "stay" ? (
                            <input
                              type="date"
                              value={manualCheckOutDate}
                              min={addDaysToYmd(formatDay(selectedDays[0]), 1)}
                              onChange={(e) =>
                                setManualCheckOutDate(e.target.value)
                              }
                            />
                          ) : (
                            <span>{formatDay(selectedDays[0])}</span>
                          )}
                        </>
                      ) : (
                        formatRange(selectedDays)
                      )}
                    </td>
                  </tr>
                  {selectedDays.length === 1 && (
                    <tr>
                      <th>예약 유형</th>
                      <td>
                        <label style={{ marginRight: "20px" }}>
                          <input
                            type="radio"
                            name="manualBookingType"
                            value="stay"
                            checked={manualBookingType === "stay"}
                            onChange={() => {
                              setManualBookingType("stay");
                              resetManualBookingInputs();
                            }}
                          />
                          숙박
                        </label>

                        <label>
                          <input
                            type="radio"
                            name="manualBookingType"
                            value="day"
                            checked={manualBookingType === "day"}
                            onChange={() => {
                              setManualBookingType("day");
                              resetManualBookingInputs();
                            }}
                          />
                          데이유즈
                        </label>
                      </td>
                    </tr>
                  )}
                  <tr>
                    <th>객실</th>
                    <td>
                      <div
                        style={{
                          width: "100%",
                          maxHeight: "340px",
                          overflow: "auto",
                          height: "auto",
                        }}
                      >
                        {groups.map((group) => {
                          const { available } = getGroupRoomInfo(group.id);

                          return (
                            <div key={group.id} className="room_controll_cell">
                              {group.name} (남은 방 수 : {available})
                              <div className="room_controll_cell_pl_mi">
                                <button
                                  type="button"
                                  className="plus"
                                  onClick={() => increase(group.id, available)}
                                >
                                  +
                                </button>

                                {manualMap[group.id] || 0}

                                <button
                                  type="button"
                                  className="minus"
                                  onClick={() => decrease(group.id)}
                                >
                                  -
                                </button>
                              </div>
                              {(manualMap[group.id] || 0) > 0 && (
                                <>
                                  <div className="all_or_one">
                                    <input
                                      type="radio"
                                      id={`one-${group.id}`}
                                      name={`all_or_one-${group.id}`}
                                      value="one"
                                      checked={
                                        (memoInputMode[group.id] || "one") ===
                                        "one"
                                      }
                                      onChange={() => {
                                        setMemoInputMode((prev) => ({
                                          ...prev,
                                          [group.id]: "one",
                                        }));
                                      }}
                                    />

                                    <label htmlFor={`one-${group.id}`}>
                                      하나씩 기입
                                    </label>

                                    <input
                                      type="radio"
                                      id={`all-${group.id}`}
                                      name={`all_or_one-${group.id}`}
                                      value="all"
                                      checked={
                                        memoInputMode[group.id] === "all"
                                      }
                                      onChange={() => {
                                        setMemoInputMode((prev) => ({
                                          ...prev,
                                          [group.id]: "all",
                                        }));
                                      }}
                                    />

                                    <label htmlFor={`all-${group.id}`}>
                                      해당 상품 전체 기입
                                    </label>
                                  </div>

                                  {memoInputMode[group.id] === "all" ? (
                                    <div className="input_wrap">
                                      <div
                                        style={{
                                          padding: "12px",
                                          marginBottom: "12px",
                                          border: "1px solid #ddd",
                                          borderRadius: "6px",
                                          background: "#fafafa",
                                        }}
                                      >
                                        <div
                                          style={{
                                            marginBottom: "10px",
                                            fontSize: "13px",
                                            fontWeight: "bold",
                                          }}
                                        >
                                          전체 객실 공통 정보
                                        </div>

                                        <div
                                          style={{
                                            display: "grid",
                                            gridTemplateColumns: "1fr 1fr",
                                            gap: "8px",
                                          }}
                                        >
                                          <input
                                            type="text"
                                            placeholder="전체 객실 공통 예약자명"
                                            value={
                                              allCustomName[group.id] || ""
                                            }
                                            onChange={(e) => {
                                              const value = e.target.value;

                                              setAllCustomName((prev) => ({
                                                ...prev,
                                                [group.id]: value,
                                              }));
                                            }}
                                          />

                                          <input
                                            type="text"
                                            placeholder="전체 객실 공통 세부정보"
                                            value={allMemos[group.id] || ""}
                                            onChange={(e) => {
                                              const value = e.target.value;

                                              setAllMemos((prev) => ({
                                                ...prev,
                                                [group.id]: value,
                                              }));
                                            }}
                                          />
                                        </div>
                                      </div>

                                      <div
                                        style={{
                                          padding: "12px",
                                          border: "1px solid #ddd",
                                          borderRadius: "6px",
                                        }}
                                      >
                                        <div
                                          style={{
                                            marginBottom: "4px",
                                            fontSize: "13px",
                                            fontWeight: "bold",
                                          }}
                                        >
                                          객실 번호 배정
                                        </div>

                                        <div
                                          style={{
                                            marginBottom: "10px",
                                            fontSize: "12px",
                                            color: "#777",
                                          }}
                                        >
                                          기본적으로 남은 객실 번호순으로
                                          배정되며, 필요한 객실만 변경할 수
                                          있습니다.
                                        </div>

                                        {(() => {
                                          const availableRooms =
                                            getAvailableGroupRooms(group.id);

                                          const assignedRoomIds =
                                            getPreviewAssignedRoomIds(
                                              group.id,
                                              manualMap[group.id] || 0,
                                            );

                                          return Array.from({
                                            length: manualMap[group.id] || 0,
                                          }).map((_, idx) => {
                                            const currentSelectedRoomId =
                                              assignedRoomIds[idx] || "";

                                            const selectedByOtherRows =
                                              assignedRoomIds
                                                .filter(
                                                  (_, selectedIdx) =>
                                                    selectedIdx !== idx,
                                                )
                                                .map(normalizeRoomId)
                                                .filter(Boolean);

                                            return (
                                              <div
                                                key={idx}
                                                style={{
                                                  display: "grid",
                                                  gridTemplateColumns:
                                                    "80px 1fr",
                                                  alignItems: "center",
                                                  gap: "8px",
                                                  marginBottom: "8px",
                                                }}
                                              >
                                                <div
                                                  style={{
                                                    fontSize: "13px",
                                                    fontWeight: "bold",
                                                  }}
                                                >
                                                  {idx + 1}번 객실
                                                </div>

                                                <select
                                                  value={currentSelectedRoomId}
                                                  onChange={(e) => {
                                                    const value =
                                                      e.target.value;

                                                    setCustomRoomNo((prev) => {
                                                      const current = [
                                                        ...(prev[group.id] ||
                                                          []),
                                                      ];

                                                      current[idx] = value;

                                                      return {
                                                        ...prev,
                                                        [group.id]: current,
                                                      };
                                                    });
                                                  }}
                                                >
                                                  {availableRooms.map(
                                                    (room) => (
                                                      <option
                                                        key={room.id}
                                                        value={room.id}
                                                        disabled={selectedByOtherRows.includes(
                                                          normalizeRoomId(
                                                            room.id,
                                                          ),
                                                        )}
                                                      >
                                                        {room.name}
                                                      </option>
                                                    ),
                                                  )}
                                                </select>
                                              </div>
                                            );
                                          });
                                        })()}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="input_wrap">
                                      {Array.from({
                                        length: manualMap[group.id] || 0,
                                      }).map((_, idx) => {
                                        const availableRooms =
                                          getAvailableGroupRooms(group.id);

                                        const currentSelectedRoomId =
                                          customRoomNo[group.id]?.[idx] ||
                                          availableRooms[idx]?.id ||
                                          "";

                                        const selectedByOtherRows = Array.from(
                                          { length: manualMap[group.id] || 0 },
                                          (_, selectedIdx) => {
                                            if (selectedIdx === idx)
                                              return null;

                                            return normalizeRoomId(
                                              customRoomNo[group.id]?.[
                                                selectedIdx
                                              ] ||
                                                availableRooms[selectedIdx]?.id,
                                            );
                                          },
                                        ).filter(Boolean);

                                        return (
                                          <div
                                            key={idx}
                                            style={{
                                              display: "grid",
                                              gridTemplateColumns:
                                                "130px 1fr 1fr",
                                              gap: "8px",
                                              marginBottom: "8px",
                                            }}
                                          >
                                            <select
                                              value={currentSelectedRoomId}
                                              onChange={(e) => {
                                                const value = e.target.value;

                                                setCustomRoomNo((prev) => {
                                                  const current = [
                                                    ...(prev[group.id] || []),
                                                  ];

                                                  current[idx] = value;

                                                  return {
                                                    ...prev,
                                                    [group.id]: current,
                                                  };
                                                });
                                              }}
                                            >
                                              <option value="">
                                                객실 선택
                                              </option>

                                              {availableRooms.map((room) => (
                                                <option
                                                  key={room.id}
                                                  value={room.id}
                                                  disabled={selectedByOtherRows.includes(
                                                    normalizeRoomId(room.id),
                                                  )}
                                                >
                                                  {room.name}
                                                </option>
                                              ))}
                                            </select>

                                            <input
                                              type="text"
                                              placeholder={`예약자명 ${idx + 1}`}
                                              value={
                                                customName[group.id]?.[idx] ||
                                                ""
                                              }
                                              onChange={(e) => {
                                                const value = e.target.value;

                                                setCustomName((prev) => {
                                                  const current = [
                                                    ...(prev[group.id] || []),
                                                  ];

                                                  current[idx] = value;

                                                  return {
                                                    ...prev,
                                                    [group.id]: current,
                                                  };
                                                });
                                              }}
                                            />

                                            <input
                                              type="text"
                                              placeholder={`세부정보 ${idx + 1}`}
                                              value={
                                                memos[group.id]?.[idx] || ""
                                              }
                                              onChange={(e) => {
                                                const value = e.target.value;

                                                setMemos((prev) => {
                                                  const current = [
                                                    ...(prev[group.id] || []),
                                                  ];

                                                  current[idx] = value;

                                                  return {
                                                    ...prev,
                                                    [group.id]: current,
                                                  };
                                                });
                                              }}
                                            />
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div style={{ float: "left", width: "50%", height: "auto" }}>
              <table>
                <tbody>
                  <tr>
                    <th>기존 수기예약</th>
                    <td>
                      <div
                        style={{
                          width: "100%",
                          maxHeight: "440px",
                          overflow: "auto",
                          height: "auto",
                        }}
                      >
                        {getManualReservations().length === 0 ? (
                          <div>없음</div>
                        ) : (
                          getManualReservations().map((room, idx) => {
                            console.log(room);
                            return (
                              <div
                                key={`${room.room_id}-${room.check_in}-${room.check_out}-${idx}`}
                                className="room_controll_cell"
                                style={{ marginBottom: "8px" }}
                              >
                                <div
                                  style={{
                                    display: "inline-block",
                                    verticalAlign: "top",
                                    lineHeight: "1.7",
                                  }}
                                >
                                  <div>
                                    <b>
                                      객실 :{" "}
                                      {Array.isArray(room.custom_room_no)
                                        ? room.custom_room_no.join(", ")
                                        : room.custom_room_no ||
                                          room.room_name ||
                                          "-"}
                                    </b>
                                  </div>

                                  <div>
                                    예약자명 : {room.custom_name || "-"}
                                  </div>

                                  <div>
                                    <small>
                                      예약기간 :{" "}
                                      {room.check_in?.slice(0, 10) || "-"} ~{" "}
                                      {room.check_out?.slice(0, 10) || "-"}
                                    </small>
                                  </div>
                                </div>

                                <button
                                  className="minus"
                                  type="button"
                                  style={{
                                    backgroundColor: "black",
                                    color: "white",
                                    marginLeft: "40px",
                                  }}
                                  onClick={() => cancelManualReservation(room)}
                                >
                                  취소
                                </button>
                                <div className="input_wrap">
                                  <div
                                    style={{
                                      fontSize: "13px",
                                      marginBottom: "4px",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    세부정보
                                  </div>

                                  <textarea
                                    value={room.memo || ""}
                                    placeholder="메모 없음"
                                    style={{
                                      width: "100%",
                                      height: "80px",
                                      resize: "none",
                                    }}
                                    readOnly
                                  />
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div style={{ clear: "both" }}></div>
            <div className="btn_area">
              <button className="green" onClick={modifyReservationSchedule}>
                수기 예약 적용
              </button>
            </div>
          </div>
        </div>
      )}

      {isPop2 && (
        <div className="popup_wrap">
          <div className="popup" style={{ height: "auto", width: "700px" }}>
            <div className="popup_title">선택한 날짜 네이버예약 상세</div>

            <div
              className="popup_x"
              onClick={() => {
                setIsPop2(false);
              }}
            >
              X
            </div>

            <table>
              <colgroup>
                <col style={{ width: "140px" }} />
                <col style={{ width: "auto" }} />
              </colgroup>

              <tbody>
                <tr>
                  <th>선택한 기간</th>
                  <td>{formatRange(selectedDays)}</td>
                </tr>

                <tr>
                  <th>네이버 예약</th>

                  <td>
                    <div
                      style={{
                        width: "100%",
                        maxHeight: "500px",
                        overflow: "auto",
                      }}
                    >
                      {getNaverReservations().length === 0 ? (
                        <div>없음</div>
                      ) : (
                        getNaverReservations().map((room, idx) => (
                          <div
                            key={idx}
                            className="room_controll_cell"
                            style={{ marginBottom: "12px" }}
                          >
                            <div>
                              <b>{room.room_name}</b>
                            </div>

                            <div>
                              {room.check_in?.slice(0, 10)} ~{" "}
                              {room.check_out?.slice(0, 10)}
                            </div>

                            <div>예약자 : {room.name}</div>

                            <div>연락처 : {room.phone}</div>

                            <div>상품명 : {room.product_name}</div>

                            <div>수량 : {room.qty}</div>

                            <div>금액 : {room.price}</div>
                            <div>
                              결제일 :{" "}
                              {room.payment_date
                                ? String(room.payment_date).slice(0, 10)
                                : "-"}
                            </div>
                            <div>예약번호 : {room.booking_id}</div>
                            <div>
                              옵션 :{" "}
                              {(() => {
                                const option = room.booking_option;

                                if (!option) return "-";

                                // 문자열이면 JSON 파싱 시도
                                if (typeof option === "string") {
                                  try {
                                    const parsed = JSON.parse(option);

                                    if (Array.isArray(parsed)) {
                                      return parsed
                                        .map((item) => {
                                          const name = item?.name || "-";
                                          const qty = item?.qty
                                            ? ` x${item.qty}`
                                            : "";
                                          const price =
                                            item?.price !== undefined &&
                                            item?.price !== null
                                              ? ` (${Number(item.price).toLocaleString()}원)`
                                              : "";

                                          return `${name}${qty}${price}`;
                                        })
                                        .join(", ");
                                    }

                                    if (
                                      typeof parsed === "object" &&
                                      parsed !== null
                                    ) {
                                      const name = parsed.name || "-";
                                      const qty = parsed.qty
                                        ? ` x${parsed.qty}`
                                        : "";
                                      const price =
                                        parsed.price !== undefined &&
                                        parsed.price !== null
                                          ? ` (${Number(parsed.price).toLocaleString()}원)`
                                          : "";

                                      return `${name}${qty}${price}`;
                                    }

                                    return String(parsed);
                                  } catch {
                                    return option;
                                  }
                                }

                                // 배열
                                if (Array.isArray(option)) {
                                  return option
                                    .map((item) => {
                                      const name = item?.name || "-";
                                      const qty = item?.qty
                                        ? ` x${item.qty}`
                                        : "";
                                      const price =
                                        item?.price !== undefined &&
                                        item?.price !== null
                                          ? ` (${Number(item.price).toLocaleString()}원)`
                                          : "";

                                      return `${name}${qty}${price}`;
                                    })
                                    .join(", ");
                                }

                                // 단일 객체
                                if (typeof option === "object") {
                                  const name = option.name || "-";
                                  const qty = option.qty
                                    ? ` x${option.qty}`
                                    : "";
                                  const price =
                                    option.price !== undefined &&
                                    option.price !== null
                                      ? ` (${Number(option.price).toLocaleString()}원)`
                                      : "";

                                  return `${name}${qty}${price}`;
                                }

                                return String(option);
                              })()}
                            </div>
                            <div>메모 : {room.request_memo}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
      {isHistory && (
        <>
          <div className="popup_wrap">
            <div className="popup" style={{ height: "770px", width: "1600px" }}>
              <div className="popup_title">예약 히스토리</div>

              <div
                className="popup_x"
                onClick={() => {
                  setIsHistory(false);
                }}
              >
                X
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginBottom: "20px",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <input
                  type="text"
                  placeholder="예약자명"
                  value={guestName}
                  onChange={(e) => {
                    setGuestName(e.target.value);
                  }}
                />

                <input
                  type="text"
                  placeholder="전화번호"
                  value={guestPhone}
                  onChange={(e) => {
                    setGuestPhone(e.target.value);
                  }}
                />

                <input
                  type="text"
                  placeholder="메모"
                  value={guestMemo}
                  onChange={(e) => {
                    setGuestMemo(e.target.value);
                  }}
                />

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  <span>예약기간</span>
                  <input
                    type="date"
                    value={checkInFrom}
                    onChange={(e) => {
                      setCheckInFrom(e.target.value);
                    }}
                  />
                  ~
                  <input
                    type="date"
                    value={checkOutTo}
                    onChange={(e) => {
                      setCheckOutTo(e.target.value);
                    }}
                  />
                  <span>결제일</span>
                  <input
                    type="date"
                    value={paymentFrom}
                    onChange={(e) => setPaymentFrom(e.target.value)}
                  />
                  ~
                  <input
                    type="date"
                    value={paymentTo}
                    onChange={(e) => setPaymentTo(e.target.value)}
                  />
                </div>

                <button
                  className="btn_custom"
                  onClick={() => {
                    setHistoryPage(1);

                    setTimeout(() => {
                      getHistory();
                    }, 0);
                  }}
                >
                  검색
                </button>

                <button
                  className="btn_custom"
                  onClick={() => {
                    setGuestName("");
                    setGuestPhone("");
                    setGuestMemo("");

                    setCheckInFrom("");
                    setCheckInTo("");

                    setCheckOutFrom("");
                    setCheckOutTo("");

                    setHistoryPage(1);
                    setPaymentFrom("");
                    setPaymentTo("");

                    setTimeout(() => {
                      getHistory();
                    }, 0);
                  }}
                >
                  초기화
                </button>
              </div>
              <div className="rooms_calendar">
                <table>
                  <thead>
                    <th>소스</th>
                    <th>이름</th>
                    <th>전화번호</th>
                    <th>기간</th>
                    <th>가격</th>
                    <th>디테일</th>
                    <th>메모</th>
                  </thead>
                  <tbody>
                    {historyData.map((data, i) => {
                      return (
                        <tr key={data.id || i}>
                          <td>{data.source}</td>
                          <td>{data.guest_name}</td>
                          <td>{data.guest_phone}</td>
                          <td>
                            {renderHistoryDate(data.check_in, data.source)} ~{" "}
                            {renderHistoryDate(data.check_out, data.source)}
                          </td>
                          <td>{data.price?.toLocaleString()}</td>
                          <td
                            dangerouslySetInnerHTML={{
                              __html: renderPayload(
                                data.payload,
                                data.canceled,
                                data.created_at,
                                data.source,
                                getHistoryGroupName(data.room_group_id),
                                data.room_group_id,
                                getHistoryRoomName(data.room_id),
                                data.manager_memo,
                              ),
                            }}
                          ></td>
                          <td>
                            {data.memo}
                            <br />
                            {(data.source === "website" ||
                              data.source === "naver" ||
                              String(data.source || "").startsWith(
                                "SITE_",
                              )) && (
                              <div style={{ marginTop: "10px" }}>
                                <button
                                  type="button"
                                  style={{
                                    background: "black",
                                    color: "white",
                                    padding: "6px 10px",
                                    border: "none",
                                    borderRadius: "3px",
                                    cursor: "pointer",
                                  }}
                                  onClick={() => openManagerMemoPopup(data)}
                                >
                                  {data.manager_memo
                                    ? "관리자 메모 수정"
                                    : "관리자 메모하기"}
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "5px",
                  justifyContent: "center",
                  marginTop: "20px",
                  flexWrap: "wrap",
                }}
              >
                <button
                  disabled={historyPage === 1}
                  onClick={() => {
                    setHistoryPage(historyPage - 1);
                  }}
                >
                  이전
                </button>

                {Array.from(
                  {
                    length:
                      Math.min(historyTotalPage, historyPage + 5) -
                      Math.max(1, historyPage - 5) +
                      1,
                  },
                  (_, i) => Math.max(1, historyPage - 5) + i,
                ).map((page) => {
                  return (
                    <button
                      key={page}
                      style={{
                        fontWeight: historyPage === page ? "bold" : "normal",
                      }}
                      onClick={() => {
                        setHistoryPage(page);
                      }}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  disabled={historyPage === historyTotalPage}
                  onClick={() => {
                    setHistoryPage(historyPage + 1);
                  }}
                >
                  다음
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      {isManagerMemoPop && selectedHistoryRecord && (
        <div
          className="popup_wrap"
          style={{
            background: "rgba(0, 0, 0, 0.5)",
          }}
          id="zpop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeManagerMemoPopup();
            }
          }}
        >
          <div
            className="popup"
            style={{
              width: "600px",
              height: "auto",
              minHeight: "330px",
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
          >
            <div className="popup_title">관리자 메모</div>

            <button
              type="button"
              className="popup_x"
              disabled={isManagerMemoSaving}
              onClick={closeManagerMemoPopup}
            >
              X
            </button>

            <div
              style={{
                padding: "20px",
              }}
            >
              <div
                style={{
                  marginBottom: "15px",
                  padding: "12px",
                  background: "#f7f7f7",
                  border: "1px solid #ddd",
                  lineHeight: "1.7",
                }}
              >
                <div>
                  <strong>예약자 :</strong>{" "}
                  {selectedHistoryRecord.guest_name || "-"}
                </div>

                <div>
                  <strong>연락처 :</strong>{" "}
                  {selectedHistoryRecord.guest_phone || "-"}
                </div>

                <div>
                  <strong>예약기간 :</strong>{" "}
                  {renderHistoryDate(
                    selectedHistoryRecord.check_in,
                    selectedHistoryRecord.source,
                  )}{" "}
                  ~{" "}
                  {renderHistoryDate(
                    selectedHistoryRecord.check_out,
                    selectedHistoryRecord.source,
                  )}
                </div>

                <div>
                  <strong>예약경로 :</strong>{" "}
                  {selectedHistoryRecord.source || "-"}
                </div>
              </div>

              <textarea
                value={managerMemoText}
                placeholder="관리자 메모를 입력해 주세요."
                disabled={isManagerMemoSaving}
                autoFocus
                onChange={(e) => {
                  setManagerMemoText(e.target.value);
                }}
                style={{
                  width: "100%",
                  height: "150px",
                  padding: "10px",
                  border: "1px solid #bbb",
                  borderRadius: "4px",
                  resize: "vertical",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                  fontSize: "14px",
                  lineHeight: "1.5",
                }}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "8px",
                  marginTop: "15px",
                }}
              >
                <button
                  type="button"
                  className="green"
                  disabled={isManagerMemoSaving}
                  onClick={saveManagerMemo}
                  style={{ background: "black", color: "white" }}
                >
                  {isManagerMemoSaving ? "저장 중..." : "저장"}
                </button>

                <button
                  type="button"
                  disabled={isManagerMemoSaving}
                  onClick={closeManagerMemoPopup}
                  style={{ background: "black", color: "white" }}
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ReservationManagement;
