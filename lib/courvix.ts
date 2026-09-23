export type Row = { id: string; club: string; [key: string]: any };
export type Fee = {
  rate: number;
  min: number;
  max: number;
  gateway: number;
  flat: number;
  type: string;
};
export type DB = {
  records: Record<string, Row[]>;
  fee: Fee;
  websites: Record<string, { title: string; headline: string; about: string }>;
};
export const money = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
export const clubs = [
  {
    id: "batam",
    name: "Batam Basketball Club",
    short: "BBC",
    sport: "Basketball",
  },
  {
    id: "rally",
    name: "Rally Badminton Academy",
    short: "RBA",
    sport: "Badminton",
  },
];
export const feeFor = (amount: number, f: Fee) =>
  Math.min(
    amount,
    f.max,
    Math.max(
      f.min,
      Math.round(f.type === "Fixed" ? f.flat : (amount * f.rate) / 100),
    ),
  );
export function seed(): DB {
  const names = [
    "Gilang Pratama",
    "Aditya Putra",
    "Nadia Safitri",
    "Rizky Ramadhan",
    "Chelsea Wijaya",
    "Dimas Saputra",
    "Alya Permata",
    "Kevin Hartono",
    "Fajar Maulana",
    "Sarah Aulia",
    "Bima Prakoso",
    "Michelle Tan",
  ];
  const members = clubs.flatMap((c) =>
    Array.from({ length: c.id === "batam" ? 520 : 64 }, (_, i) => ({
      id: `${c.id}-${i + 1}`,
      club: c.id,
      name: names[i % 12] + (i >= 12 ? ` ${Math.floor(i / 12) + 1}` : ""),
      email: `member${i + 1}@${c.id}.example`,
      team: `${c.id}-t${i % 4}`,
      status: i % 19 === 0 ? "Pending" : "Active",
      date: "2026-09-01",
      amount: c.id === "batam" ? 350000 : 250000,
    })),
  );
  const invoices = members.map((m, i) => {
    const pending = i % 7 === 0 || i % 11 === 0;
    return {
      id: `INV-${String(i + 1).padStart(4, "0")}`,
      club: m.club,
      member: m.id,
      name: m.name,
      amount: m.amount,
      status: i % 7 === 0 ? "Pending" : i % 11 === 0 ? "Expired" : "Paid",
      date: `2026-09-${String((i % 22) + 1).padStart(2, "0")}`,
      due: "2026-09-25",
      method: i % 2 ? "Virtual Account" : "QRIS",
      fee: pending ? 0 : Math.round(m.amount * 0.005),
      gateway: pending ? 0 : i % 2 ? 4000 : Math.round(m.amount * 0.007),
      description: "Membership September 2026",
      reference: `DEMO-${i + 1}`,
    };
  });
  return {
    records: {
      Members: members,
      Invoices: invoices,
      Teams: clubs.flatMap((c) =>
        [
          "U-16 Development",
          "U-18 Performance",
          "Senior Team",
          "Weekend Academy",
        ].map((name, i) => ({
          id: `${c.id}-t${i}`,
          club: c.id,
          name,
          sport: c.sport,
          coach: ["Coach Andi", "Coach Reza", "Coach Maya", "Coach Andi"][i],
          status: "Active",
        })),
      ),
      Coaches: clubs.flatMap((c) =>
        ["Andi Setiawan", "Reza Mahendra", "Maya Kartika"].map((name, i) => ({
          id: `${c.id}-c${i}`,
          club: c.id,
          name,
          email: `coach${i}@${c.id}.example`,
          description: i ? "Player development" : "Head coach",
          status: "Active",
        })),
      ),
      Schedule: clubs.flatMap((c) =>
        Array.from({ length: 6 }, (_, i) => ({
          id: `${c.id}-s${i}`,
          club: c.id,
          name: [
            c.id === "batam"
              ? "Ball handling fundamentals"
              : "Footwork fundamentals",
            "Team practice · U-18",
            "Strength & conditioning",
            "Weekend development",
            "Match preparation",
            "Recovery session",
          ][i],
          team: `${c.id}-t${i % 4}`,
          date: `2026-09-${23 + i}`,
          time: ["16:00", "18:30", "07:00", "09:00", "16:00", "08:00"][i],
          venue: c.id === "batam" ? "GOR Tumenggung" : "Rally Court 01",
          status: "Scheduled",
        })),
      ),
      Attendance: [],
      Announcements: [
        {
          id: "a1",
          club: "batam",
          name: "Persiapan latihan pekan ini",
          description:
            "Bawa jersey latihan, botol minum, dan hadir 15 menit sebelum sesi dimulai.",
          status: "Important",
          date: "2026-09-23",
        },
      ],
      Expenses: [
        {
          id: "e1",
          club: "batam",
          name: "Sewa GOR September",
          amount: 8500000,
          description: "Venue",
          date: "2026-09-05",
        },
        {
          id: "e2",
          club: "batam",
          name: "Peralatan latihan",
          amount: 2400000,
          description: "Equipment",
          date: "2026-09-12",
        },
      ],
      Membership: clubs.map((c) => ({
        id: `${c.id}-p1`,
        club: c.id,
        name: "Monthly Academy",
        amount: c.id === "batam" ? 350000 : 250000,
        description: "Monthly",
        status: "Active",
      })),
      Projects: [
        {
          id: "p1",
          club: "batam",
          name: "BBC Member Portal",
          description: "Website klub dan pendaftaran anggota.",
          status: "Discovery",
          email: "demo@batam.example",
        },
      ],
      Training: [
        {
          id: "tr1",
          club: "batam",
          team: "batam-t0",
          name: "Fundamentals program",
          description: "Warmup 10 menit · teknik 30 menit · evaluasi 15 menit",
          status: "Active",
        },
      ],
      Competitions: [
        {
          id: "co1",
          club: "batam",
          name: "Batam Youth Championship",
          date: "2026-10-12",
          venue: "GOR Tumenggung",
          status: "Registration",
        },
      ],
      Documents: [
        {
          id: "d1",
          club: "batam",
          name: "Panduan latihan anggota",
          description:
            "Hadir 15 menit sebelum latihan. Gunakan sepatu olahraga dan bawa botol minum. Hubungi coach bila berhalangan.",
          status: "Team",
        },
      ],
      "Audit logs": [],
      Support: [],
    },
    fee: {
      rate: 0.5,
      min: 1000,
      max: 7500,
      flat: 2000,
      type: "Percentage",
      gateway: 4000,
    },
    websites: {
      batam: {
        title: "Batam Basketball Club",
        headline: "Build character. Play together.",
        about:
          "Ruang untuk belajar, berlatih, dan tumbuh bersama melalui basket.",
      },
      rally: {
        title: "Rally Badminton Academy",
        headline: "Your next level starts here.",
        about: "Latihan badminton terstruktur untuk setiap level.",
      },
    },
  };
}
