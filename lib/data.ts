const galleryFiles = [
  "01.png",
  "02.png",
  "03.png",
  "04.png",
  "05.png",
  "06.png",
  "07.png",
  "08.png",
  "09.png",
  "10.png",
  "11.png",
  "12.png",
  "13.png",
  "14.png",
  "15.png",
  "16.png",
  "17.png",
  "18.png",
  "19.png",
  "20.png",
  "21.png",
  "22.jpg",
  "23.png",
  "24.png",
  "25.png",
  "26.png",
  "27.png",
  "28.png",
  "29.png",
  "30.png",
  "31.png",
  "32.JPG",
  "33.png",
  "34.jpg",
  "35.png",
];

export const weddingData = {
  groom: {
    name: "임정모",
    nameEn: "Jungmo",
    role: "신랑",
    parents: { father: "임광현", mother: "이향숙" },
    intro: "언제나 한결같은 사람이 되겠습니다.",
  },
  bride: {
    name: "최화형",
    nameEn: "Hwahyung",
    role: "신부",
    parents: { father: "최승현", mother: "기길란" },
    intro: "따뜻한 가정을 만들어가겠습니다.",
  },
  photos: {
    main: "/photos/main.png",
    groom: "/photos/groom.jpg",
    bride: "/photos/bride.jpg",
  },
  date: {
    iso: "2026-08-29T12:30:00+09:00",
    year: 2026,
    month: 8,
    day: 29,
    weekday: "토요일",
    hour: 12,
    minute: 30,
    display: "2026년 8월 29일 토요일 오후 12시 30분",
  },
  venue: {
    name: "히든베이 호텔",
    hall: "B2F 그랜드 볼룸 웨딩홀",
    address: "전라남도 여수시 신월로 496-25",
    addressDetail: "네비게이션 검색 : 히든베이 호텔",
    tel: "061-680-3012",
    parking: "건물 지상, 지하 주차 가능",
    transit: "자차 또는 택시 이용 권장드립니다.",
    coordinates: { lat: 34.7286, lng: 127.7258 },
  },
  gallery: galleryFiles.map((f, i) => ({
    src: `/photos/${f}`,
    alt: `웨딩 사진 ${i + 1}`,
  })),
  accounts: {
    groom: [
      { holder: "임정모", bank: "국민은행", number: "221702-04-112063" },
      { holder: "임광현", bank: "신한은행", number: "559901-04-338848" },
      { holder: "이향숙", bank: "농협은행", number: "613083-51-146664" },
    ],
    bride: [
      { holder: "최화형", bank: "카카오뱅크", number: "3333-01-2345678" },
      { holder: "최승현", bank: "농협은행", number: "302-1234-5678-90" },
      { holder: "기길란", bank: "하나은행", number: "123-456789-01234" },
    ],
  },
  invitation: {
    title: "저희 두 사람이 결혼합니다",
    body: `서로 다른 길을 걸어온 두 사람이
한 길을 함께 걷고자 합니다.

귀한 발걸음으로 축복해 주시면
더없는 기쁨이겠습니다.`,
  },
} as const;

export type WeddingData = typeof weddingData;
