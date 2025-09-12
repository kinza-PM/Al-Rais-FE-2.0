import type { Booking, BookingStatus } from "../components/molecules/UserBookingsListing";

export const travelData = [
  {
    id: 2,
    name: "Emirates Airline",
    logo: "src/assets/images/emirates.png",
    flight_detail: {
      flight_features: {
        cabin: 1,
        baggage: "40KGs",
        usb_power: true,
        free_meal: true,
        wifi: true,
        entertainment: true,
      },
      flight_number: "EK 1234",
      flight_bus: "Airbus A380",
      flight_class: "Economy class",
      start_time: "10:45 AM",
      start_date: "Mon, 16 June 2025",
      end_time: "02:00 PM",
      end_date: "Mon, 16 June 2025",
      seats_layout: "2-2-2",
      upgradable: true,
    },
    airport_details: {
      startAirport: "Dubai International Airport (DXB)",
      startTerminal: "Terminal 3 International",
      endAirport:
        "Chhatrapati Shivaji Maharaj International Airport Mumbai (BOM)",
      endTerminal: "Terminal 1 international",
    },
    stop: [],
    price: {
      economyLite: {
        personalItem: "01 item (e.g., small backpack, laptop bag)",
        baggage: "",
        seatSelection: "Assigned at check-in",
        Changes: "with very high fee",
        Refundable: "",
        price: "48",
      },
      economyStandard: {
        personalItem: "01 item (e.g., small backpack, laptop bag)",
        baggage: "01 item (up to 20kg)",
        seatSelection: "Standard (free)",
        Changes: "$4 + fare difference",
        Refundable: "",
        price: "52",
      },
      economyFlex: {
        personalItem: "01 item (e.g., small backpack, laptop bag)",
        baggage: "02 items (up to 20kg each)",
        seatSelection: "Any (free, including preferred seats)",
        Changes: "Free (fare differences may apply)",
        Refundable: "with a small fee",
        price: "66",
      },
    },
  },
  {
    id: 3,
    name: "Qatar Airways",
    logo: "src/assets/images/qatar.png",
    flight_detail: {
      flight_features: {
        cabin: 1,
        baggage: "40KGs",
        usb_power: true,
        free_meal: true,
        wifi: true,
        entertainment: true,
      },
      flight_number: "QR 5678",
      flight_bus: "Airbus A320",

      flight_class: "Business class",
      start_time: "10:45 AM",
      start_date: "Mon, 16 June 2025",
      end_time: "02:00 PM",
      end_date: "Mon, 16 June 2025",
      seats_layout: "1-1-1",
      upgradable: true,
    },
    airport_details: {
      startAirport: "Dubai International Airport (DXB)",
      startTerminal: "Terminal 3 International",
      endAirport:
        "Chhatrapati Shivaji Maharaj International Airport Mumbai (BOM)",
      endTerminal: "Terminal 1 international",
    },
    stop: [
      {
        name: "Doha (DOH)",
        stayTime: "01h 15min",
        stayStartingtime: "",
        stayEndingtime: "",
      },
      {
        name: "Demo (DOH)",
        stayTime: "01h 15min",
        stayStartingtime: "",
        stayEndingtime: "",
      },
    ],
    price: {
      economyLite: {
        personalItem: "01 item (e.g., small backpack, laptop bag)",
        baggage: "",
        seatSelection: "Assigned at check-in",
        Changes: "with very high fee",
        Refundable: "",
        price: "70",
      },
      economyStandard: {
        personalItem: "01 item (e.g., small backpack, laptop bag)",
        baggage: "01 item (up to 20kg)",
        seatSelection: "Standard (free)",
        Changes: "$4 + fare difference",
        Refundable: "",
        price: "120",
      },
      economyFlex: {
        personalItem: "01 item (e.g., small backpack, laptop bag)",
        baggage: "02 items (up to 20kg each)",
        seatSelection: "Any (free, including preferred seats)",
        Changes: "Free (fare differences may apply)",
        Refundable: "with a small fee",
        price: "150",
      },
    },
  },
  {
    id: 1,
    name: "Flydubai",
    logo: "src/assets/images/flydubai_icon.jpeg",
    airport_details: {
      startAirport: "Dubai International Airport (DXB)",
      startTerminal: "Terminal 3 International",
      endAirport:
        "Chhatrapati Shivaji Maharaj International Airport Mumbai (BOM)",
      endTerminal: "Terminal 1 international",
    },
    flight_detail: {
      flight_features: {
        cabin: 1,
        baggage: "40KGs",
        usb_power: true,
        free_meal: true,
        wifi: true,
        entertainment: true,
      },
      flight_bus: "Airbus A120",
      flight_number: "BA 9101",
      flight_class: "First class",
      start_time: "10:45 AM",
      start_date: "Mon, 16 June 2025",
      end_time: "02:00 PM",
      end_date: "Mon, 16 June 2025",
      seats_layout: "1-1-1-1",
      upgradable: true,
    },
    stop: [
      {
        name: "Doha (DOH)",
        stayTime: "01h 15min",
        stayStartingtime: "",
        stayEndingtime: "",
      },
    ],
    price: {
      economyLite: {
        personalItem: "01 item (e.g., small backpack, laptop bag)",
        baggage: "",
        seatSelection: "Assigned at check-in",
        Changes: "with very high fee",
        Refundable: "",
        price: "40",
      },
      economyStandard: {
        personalItem: "01 item (e.g., small backpack, laptop bag)",
        baggage: "01 item (up to 20kg)",
        seatSelection: "Standard (free)",
        Changes: "$4 + fare difference",
        Refundable: "",
        price: "80",
      },
      economyFlex: {
        personalItem: "01 item (e.g., small backpack, laptop bag)",
        baggage: "02 items (up to 20kg each)",
        seatSelection: "Any (free, including preferred seats)",
        Changes: "Free (fare differences may apply)",
        Refundable: "with a small fee",
        price: "110",
      },
    },
  },
];

export const passengersOptions = [
  { value: "01", label: "01" },
  { value: "02", label: "02" },
  { value: "03", label: "03" },
  { value: "04", label: "04" },
  { value: "05", label: "05" },
  { value: "06", label: "06" },
  { value: "07", label: "07" },
  { value: "08", label: "08" },
  { value: "09", label: "09" },
  { value: "10", label: "10" },
];
export const cabinClass = [
  { value: "economy", label: "Economy" },
  { value: "businessClass", label: "Business Class" },
  { value: "firstClass", label: "First Class" },
];

export const flightBookingMeals = [
  { name: "Vegan Burger", price: 15.75 },
  { name: "Gluten-Free Pasta", price: 18.2 },
  { name: "Quinoa Salad", price: 14.5 },
  { name: "Stuffed Bell Peppers", price: 17.3 },
  { name: "Mushroom Risotto", price: 12.85 },
];
export const flightBookingDrinks = [
  { name: "Herbal Tea", price: 4.75 },
  { name: "Freshly Squeezed Lemonade", price: 3.2 },
  { name: "Iced Green Tea", price: 4.5 },
  { name: "Coconut Water", price: 3.65 },
  { name: "Chilled Hibiscus Drink", price: 2.85 },
];

export const flightBookingComfortAndEntertainment = {
  wifi: [
    {
      leg: "Departure flight",
      logo: 'src/assets/images/emirates.png',
      airline: "Emirates Airlines",
      flight: "EK 1234 – Economy class",
      passenger: "01 Adult",
      speed: "10 Mbps",
      cost: 22.5,
      checked: true,
    },
    {
      leg: "Return flight",
      logo: 'src/assets/images/air-india.png',
      airline: "Air India",
      flight: "AI 1452 – Economy class",
      passenger: "01 Adult",
      speed: "12 Mbps",
      cost: 16.0,
      checked: true,
    },
  ],
  movies: [
    {
      leg: "Departure flight",
      logo: 'src/assets/images/emirates.png',
      airline: "Emirates Airlines",
      flight: "EK 1234 – Economy class",
      passenger: "01 Adult",
      selection: "Newly released",
      cost: 50,
      checked: false,
    },
    {
      leg: "Return flight",
      logo: 'src/assets/images/air-india.png',
      airline: "Air India",
      flight: "AI 1452 – Economy class",
      passenger: "01 Adult",
      selection: "Newly released",
      cost: 44.5,
      checked: false,
    },
  ],
  music: [
    {
      leg: "Departure flight",
      logo: 'src/assets/images/emirates.png',
      airline: "Emirates Airlines",
      flight: "EK 1234 – Economy class",
      passenger: "01 Adult",
      selection: "Spotify Trending",
      cost: 40,
      checked: true,
    },
    {
      leg: "Return flight",
      logo: 'src/assets/images/air-india.png',
      airline: "Air India",
      flight: "AI 1452 – Economy class",
      passenger: "01 Adult",
      selection: "Spotify Trending",
      cost: 32,
      checked: true,
    },
  ],
}

export const flightBookingAirportServices = {
  lounge_access: [
    {
      leg: "Departure flight",
      logo: 'src/assets/images/emirates.png',
      airline: "Emirates Airlines",
      flight: "EK 1234 – Economy class",
      passenger: "01 Adult",
      cost: 62.50,
      checked: true,
    },
    {
      leg: "Return flight",
      logo: 'src/assets/images/air-india.png',
      airline: "Air India",
      flight: "AI 1452 – Economy class",
      passenger: "01 Adult",
      cost: 55.70,
      checked: true,
    },
  ],
  fast_track: [
    {
      leg: "Departure flight",
      logo: 'src/assets/images/emirates.png',
      airline: "Emirates Airlines",
      flight: "EK 1234 – Economy class",
      passenger: "01 Adult",
      cost: 90,
      checked: true,
    },
    {
      leg: "Return flight",
      logo: 'src/assets/images/air-india.png',
      airline: "Air India",
      flight: "AI 1452 – Economy class",
      passenger: "01 Adult",
      cost: 75.50,
      checked: false,
    },
  ],
  priority_boarding: [
    {
      leg: "Departure flight",
      logo: 'src/assets/images/emirates.png',
      airline: "Emirates Airlines",
      flight: "EK 1234 – Economy class",
      passenger: "01 Adult",
      cost: 45,
      checked: false,
    },
    {
      leg: "Return flight",
      logo: 'src/assets/images/air-india.png',
      airline: "Air India",
      flight: "AI 1452 – Economy class",
      passenger: "01 Adult",
      cost: 30,
      checked: true,
    },
  ],
}

export const flightBookingReviewContactDetail = {
  title: "Mr.",
  fullName: "Zeeshan Ahmad",
  email: "zeeshan.ahmad@email.com",
  phone: "+12 345 67890",
};

export const flightBookingReviewPassengerDetail = {
  paxType: "Adult",
  passportNumber: "123DXB78WYR",
  issuingCountry: "Dubai",
  expiryDate: "09/2030",
};

export const flightBookingReviewSeatDetail = {
  cabinClass: "Economy",
  seatNo: "B9",
};

export const userBookingListings: Booking[] = [
  {
    id: "1",
    type: "flight",
    airline: {
      name: "Emirates Airlines",
      code: "EK",
      flightNo: "1234",
      logoUrl:
        "src/assets/images/emirates.png",
      cabin: "Economy class",
    },
    from: { city: "Dubai", code: "DXB", time: "10:45 AM", dateLabel: "Mon, 16 June 2025" },
    to: { city: "Mumbai", code: "BOM", time: "02:00 PM", dateLabel: "Mon, 16 June 2025" },
    durationLabel: "03 hours 15 minutes",
    isDirect: true,
    passengersLabel: "01 Adult",
    bookingRef: "6DFFX8901HAE",
    status: "Confirmed" as BookingStatus,
  },
  {
    id: "2",
    type: "flight",
    airline: {
      name: "Emirates Airlines",
      code: "EK",
      flightNo: "1234",
      logoUrl:
        "src/assets/images/emirates.png",
      cabin: "Economy class",
    },
    from: { city: "Dubai", code: "DXB", time: "10:45 AM", dateLabel: "Mon, 16 June 2025" },
    to: { city: "Mumbai", code: "BOM", time: "02:00 PM", dateLabel: "Mon, 16 June 2025" },
    durationLabel: "03 hours 15 minutes",
    isDirect: true,
    passengersLabel: "01 Adult",
    bookingRef: "6DFFX8901HAE",
    status: "Pending" as BookingStatus,
    countdownHours: "00",
    countdownMins: "35",
    countdownSecs: "49",
  },
  {
    id: "3",
    type: "flight",
    airline: {
      name: "Emirates Airlines",
      code: "EK",
      flightNo: "5678",
      logoUrl:
        "src/assets/images/emirates.png",
      cabin: "Economy class",
    },
    from: { city: "Dubai", code: "DXB", time: "06:20 AM", dateLabel: "Tue, 17 June 2025" },
    to: { city: "Karachi", code: "KHI", time: "07:40 AM", dateLabel: "Tue, 17 June 2025" },
    durationLabel: "01 hour 20 minutes",
    isDirect: true,
    passengersLabel: "02 Adults",
    bookingRef: "7ZXCV9801QQ",
    status: "Expired" as BookingStatus,
  },
];