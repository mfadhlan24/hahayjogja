import { useState, useRef, useEffect } from "react";
import html2pdf from "html2pdf.js";
import { fakerID_ID } from "@faker-js/faker";
import "@docuseal/signature-maker-js";
import JSZip from "jszip";
import { saveAs } from "file-saver";

/* =========================================================
 * 1) DATA CONSTANTS & CONFIG
 * =======================================================*/
const COURSES_IIUM = [
  { code: "ICT 1201", name: "Programming I", credits: 3, hasLab: true },
  { code: "ICT 1202", name: "Programming II", credits: 3, hasLab: true },
  { code: "ICT 1301", name: "Database Systems", credits: 3, hasLab: true },
  { code: "ICT 1401", name: "Computer Networks", credits: 3, hasLab: true },
  { code: "UNGS 2040", name: "Islamic Worldview", credits: 2, hasLab: false },
  { code: "TQTD 1002", name: "Tilawah al-Quran II", credits: 1, hasLab: false },
];

const COURSES_RAHARJA = [
  { code: "TM330", name: "Algoritma Pemrograman", credits: 4, hasLab: true },
  { code: "SI101", name: "Pengantar Teknologi Informasi", credits: 2, hasLab: false },
  { code: "TI203", name: "Struktur Data", credits: 3, hasLab: true },
  { code: "TM304", name: "Basis Data", credits: 3, hasLab: true },
  { code: "UM111", name: "Pendidikan Pancasila", credits: 2, hasLab: false },
  { code: "KB102", name: "Kecerdasan Buatan", credits: 3, hasLab: false },
  { code: "EN101", name: "Entrepreneurship", credits: 2, hasLab: false },
  { code: "JARKOM", name: "Jaringan Komputer", credits: 3, hasLab: true },
];

const COURSES_UOC = [
  { code: "BPH 101", name: "Introduction to Pharmacy", credits: 3, hasLab: true },
  { code: "MED 104", name: "Human Anatomy", credits: 4, hasLab: true },
  { code: "PSY 110", name: "General Psychology", credits: 3, hasLab: false },
  { code: "OSH 201", name: "Occupational Safety & Health", credits: 3, hasLab: false },
  { code: "MPU 3123", name: "Tamadun Islam & Tamadun Asia", credits: 2, hasLab: false },
  { code: "BUS 105", name: "Principles of Management", credits: 3, hasLab: false },
  { code: "ENG 102", name: "English for Academic Purposes", credits: 2, hasLab: false },
];

const VENUE_LIST_RAHARJA = ["Lab iLearning", "R. L201", "R. M303", "Grand Max Theatre", "Lab Jaringan"];
const VENUE_LIST_IIUM = ["KICT Lab 1", "KICT LR 2", "Main Hall", "Auditorium"];
const VENUE_LIST_UOC = ["Grand Hall", "Pharmacy Lab 2", "Anatomy Room", "Lecture Theatre 1", "Psych Lab"];

const DAY_LIST = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];
const TIME_LIST = ["08:00 - 10:00", "10:00 - 12:00", "13:00 - 15:00", "15:30 - 17:30", "18:30 - 20:30"];

const PRESETS = {
  RAHARJA: {
    id: "RAHARJA",
    logoUrl: "/logo-raharja.png",
    signUrl: "/sign.png",
    logoClass: "h-[70px] w-auto",
    uniName: "UNIVERSITAS RAHARJA",
    uniAddress: "Jl. Jenderal Sudirman No. 40, Modernland, Tangerang 15117, Indonesia",
    uniContact: "Tel: 021-5529692 | info@raharja.ac.id | www.raharja.ac.id",
    docTitle: "KARTU RENCANA STUDI (KRS)",
    officeText: "Bagian Administrasi Akademik (BAA)",
    emailSuffix: "@raharja.info",
    labels: {
      id: "NIM",
      studentName: "Nama Mahasiswa",
      faculty: "Fakultas",
      dept: "Program Studi (Prodi)",
      level: "Jenjang",
      section: "Kelas/Shift",
      credits: "SKS",
      lecturer: "Dosen Pengampu",
      consultant: "Dosen PA",
    },
    defaultData: {
      faculty: "Fakultas Sains dan Teknologi",
      dept: "Teknik Informatika",
      level: "Sarjana (S1)",
      section: "Malam (Reguler B)",
    },
  },
  IIUM: {
    id: "IIUM",
    logoUrl: "/logo-iium.png",
    signUrl: "/sign.png",
    logoClass: "h-[70px] w-auto",
    uniName: "INTERNATIONAL ISLAMIC UNIVERSITY MALAYSIA (IIUM)",
    uniAddress: "P.O. Box 10, 50728 Kuala Lumpur, Malaysia",
    uniContact: "Tel: +603-6421 6421 | www.iium.edu.my",
    docTitle: "COURSE REGISTRATION SLIP",
    officeText: "Programme Office, Kulliyyah of ICT",
    emailSuffix: "@student.iium.edu.my",
    labels: {
      id: "Matric No.",
      studentName: "Student Name / Nama Pelajar",
      faculty: "Kulliyyah",
      dept: "Department",
      level: "Level",
      section: "Section",
      credits: "Credit Hours",
      lecturer: "Lecturer / Pensyarah",
      consultant: "Academic Advisor",
    },
    defaultData: {
      faculty: "Kulliyyah of ICT",
      dept: "Computer Science",
      level: "Undergraduate",
      section: "Section 1",
    },
  },
  UOC: {
    id: "UOC",
    logoUrl: "/logo-uoc.png",
    signUrl: "/sign.png",
    logoClass: "h-auto max-h-[60px] max-w-[250px]",
    uniName: "UNIVERSITY OF CYBERJAYA",
    uniAddress: "Persiaran Bestari, Cyber 11, 63000 Cyberjaya, Selangor, Malaysia",
    uniContact: "Tel: +603-8313 7000 | inquiry@cyberjaya.edu.my",
    docTitle: "REGISTRATION STATEMENT",
    officeText: "Registrar Office",
    emailSuffix: "@student.cyberjaya.edu.my",
    labels: {
      id: "Student ID",
      studentName: "Student Name",
      faculty: "Faculty",
      dept: "Programme",
      level: "Level of Study",
      section: "Cohort / Intake",
      credits: "Credits",
      lecturer: "Instructor",
      consultant: "Mentor",
    },
    defaultData: {
      faculty: "Faculty of Psychology & Social Sciences",
      dept: "Bachelor of Psychology (Hons)",
      level: "Degree",
      section: "Sep 2024 Intake",
    },
  },
};

const EDU_ORGS = [
  { name: "OHIO UNIVERSITY", logoUrl: "/logo-ohio-uni.png" },
  { name: "INDIANAPOLIS METROPOLITAN HIGH SCHOOL", logoUrl: "/logo-imhs.png" },
  { name: "LINCOLN ELEMENTARY SCHOOL", logoUrl: "/lincoln-logo.png" },
  { name: "MADISON METROPOLITAN SCHOOL DISTRICT", logoUrl: "/logo-madison.png" },
];

/* =========================================================
 * 2) HELPERS
 * =======================================================*/
function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getDynamicSemester(presetType) {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  let acadYear = "", semesterLabel = "";

  if (month >= 7) {
    acadYear = `${year}/${year + 1}`;
    semesterLabel = presetType === "RAHARJA" ? "Ganjil" : "1";
  } else {
    acadYear = `${year - 1}/${year}`;
    semesterLabel = presetType === "RAHARJA" ? "Genap" : "2";
  }
  return presetType === "RAHARJA"
    ? `Semester ${semesterLabel} T.A. ${acadYear}`
    : `Semester ${semesterLabel}, Session ${acadYear}`;
}

// SIGNATURE HELPERS
function generateSignatureFromName(name = "") {
  const canvas = document.createElement("canvas");
  canvas.width = 400;
  canvas.height = 120;

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#111827";
  ctx.textBaseline = "middle";
  ctx.font = 'italic 32px "Segoe Script", "Pacifico", cursive';

  const text = name || "Student Signature";
  const textWidth = ctx.measureText(text).width;
  const x = Math.max(20, (canvas.width - textWidth) / 2);
  const y = canvas.height / 2;

  ctx.fillText(text, x, y);

  return canvas.toDataURL("image/png");
}

function captureSignatureCanvasOnly() {
  try {
    const maker = document.getElementById("signatureMaker");
    if (!maker) return null;
    const canvas =
      maker.querySelector("canvas") ||
      (maker.shadowRoot && maker.shadowRoot.querySelector("canvas"));
    if (!canvas) return null;
    return canvas.toDataURL("image/png");
  } catch (e) {
    console.warn("capture signature error:", e);
    return null;
  }
}

// NAMA MALAYSIA VARIATIF
function generateMalayName() {
  const maleFirsts = ["Ahmad","Muhammad","Mohd","Adam","Hakim","Hafiz","Amir","Aiman","Irfan","Syafiq","Faiz","Firdaus","Haziq","Ikmal","Khairul","Syahmi","Arif","Danial","Naufal","Farhan"];
  const femaleFirsts = ["Nur","Aisyah","Siti","Aina","Amirah","Balqis","Hannah","Iman","Insyirah","Nadia","Nabila","Qistina","Syuhada","Zulaikha","Ain","Sofea","Nurin","Zahra","Maryam","Alya"];
  const male = Math.random() > 0.5;
  const first = male ? getRandom(maleFirsts) : getRandom(femaleFirsts);
  const father = getRandom(maleFirsts);
  const bin = male ? "bin" : "binti";
  const modernMiddles = ["Aqil","Rayyan","Danish","Nurin","Alia","Humaira","Mikael","Ariq"];
  const maybeMiddle = Math.random() < 0.3 ? ` ${getRandom(modernMiddles)}` : "";
  return `${first}${maybeMiddle} ${bin} ${father}`;
}
function generateChineseMYName() {
  const surnames = ["Lee","Lim","Tan","Chong","Ng","Wong","Chan","Goh","Chin","Chee","Loh","Lau","Yap","Chia","Teoh","Koh"];
  const given1 = ["Wei","Jia","Yi","Hui","Xin","Jun","Qian","Zhi","Yong","Mei","Li","Yu"];
  const given2 = ["Ming","Xuan","Ling","Hao","Ting","Rui","Shan","Ning","Hui","Fang","Han","En"];
  return `${getRandom(surnames)} ${getRandom(given1)} ${getRandom(given2)}`;
}
function generateIndianMYName() {
  const male = Math.random() > 0.5;
  const maleFirsts = ["Arun","Kumar","Vijay","Pravin","Sanjay","Suresh","Ravi","Rajesh","Rakesh","Vikram","Karthik"];
  const femaleFirsts = ["Asha","Priya","Deepa","Pooja","Divya","Shalini","Anita","Kavitha","Meera","Nisha"];
  const fatherNames = ["Murugan","Subramaniam","Ramachandran","Balakrishnan","Krishnan","Ganesan","Raman","Maniam","Loganathan","Rajan"];
  const first = male ? getRandom(maleFirsts) : getRandom(femaleFirsts);
  const father = getRandom(fatherNames);
  const connector = male ? "A/L" : "A/P";
  return `${first} ${connector} ${father}`;
}
function generateModernMYName() {
  const modernFirsts = ["Adam","Ryan","Jayden","Kayden","Ethan","Sophia","Ariel","Hana","Mika","Zara","Elly","Nate"];
  const male = Math.random() > 0.5;
  const first = getRandom(modernFirsts);
  const father = generateMalayName().split(" ").pop();
  const bin = male ? "bin" : "binti";
  return `${first} ${bin} ${father}`;
}
function generateFakerName(preset) {
  if (preset === "RAHARJA") return fakerID_ID.person.fullName();
  const roll = Math.random();
  if (roll < 0.45) return generateMalayName();
  if (roll < 0.75) return generateChineseMYName();
  if (roll < 0.92) return generateIndianMYName();
  return generateModernMYName();
}

/* =========================================================
 * 3) SMALL UI
 * =======================================================*/
const InputGroup = ({ label, value, onChange, placeholder }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div>
      <label className="block font-semibold text-xs text-slate-400 uppercase mb-1">{label}</label>
      <div className="flex relative">
        <input
          className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 pr-10 focus:ring-2 focus:ring-purple-500 outline-none text-white text-sm"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
        <button
          onClick={handleCopy}
          title="Copy"
          className="absolute right-1 top-1 bottom-1 px-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded"
        >
          {copied ? "✓" : "⧉"}
        </button>
      </div>
    </div>
  );
};

/* =========================================================
 * 4) SLIP KRS (TETAP ADA)
 * =======================================================*/
function SlipKRS({
  C, L, uniName, semesterText,
  student, courses, totalCredits, generatedAt,
  studentSignatureBase64, isLast = false
}) {
  return (
    <div
      className="w-[210mm] min-h-[297mm] p-[20mm] bg-white text-black box-border font-['Times_New_Roman',Times,_serif] shadow-2xl"
      style={{ pageBreakAfter: isLast ? "auto" : "always" }}
    >
      {/* HEADER */}
      <div className="relative border-b-2 border-black pb-2 mb-4 min-h-[80px]">
        {C.logoUrl && (
          <img
            src={C.logoUrl}
            alt="Logo"
            className={`${C.logoClass} object-contain absolute left-0 top-1`}
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        )}
        <div className="text-center">
          <h1 className="font-bold uppercase tracking-wide text-[16pt] leading-tight">
            {uniName}
          </h1>
          <p className="text-[9pt]">{C.uniAddress}</p>
          <p className="text-[9pt] italic">{C.uniContact}</p>
        </div>
      </div>

      <div className="text-center mb-6">
        <h2 className="font-bold underline uppercase text-[14pt]">{C.docTitle}</h2>
        <p className="uppercase mt-1 text-[11pt] font-bold">{semesterText}</p>
      </div>

      {/* INFO MAHASISWA */}
      <table className="w-full mb-6 text-[10pt]">
        <tbody>
          <tr>
            <td className="font-bold w-32 py-0.5">{L.studentName}</td><td className="w-2">:</td>
            <td className="uppercase">{student.name}</td>
            <td className="font-bold w-28 pl-4">{L.faculty}</td><td className="w-2">:</td>
            <td>{student.faculty}</td>
          </tr>
          <tr>
            <td className="font-bold py-0.5">{L.id}</td><td>:</td><td>{student.id}</td>
            <td className="font-bold pl-4">{L.dept}</td><td>:</td><td>{student.department}</td>
          </tr>
          <tr>
            <td className="font-bold py-0.5">{L.level}</td><td>:</td><td>{student.level}</td>
            <td className="font-bold pl-4">{L.section}</td><td>:</td><td>{student.section}</td>
          </tr>
          <tr>
            <td className="font-bold py-0.5">Email</td><td>:</td><td>{student.email}</td>
            <td className="font-bold pl-4">Phone</td><td>:</td><td>{student.phone}</td>
          </tr>
        </tbody>
      </table>

      {/* TABLE */}
      <table className="w-full border-collapse border border-black mb-6 text-[10pt]">
        <thead>
          <tr className="bg-slate-100">
            <th className="border border-black p-1 w-8 text-center align-middle">No</th>
            <th className="border border-black p-1 w-20 text-center align-middle">Kode</th>
            <th className="border border-black p-1 text-center align-middle">Mata Kuliah / Course</th>
            <th className="border border-black p-1 w-12 text-center align-middle">{C.labels.credits}</th>
            <th className="border border-black p-1 w-24 text-center align-middle">Jadwal</th>
            <th className="border border-black p-1 w-20 text-center align-middle">Ruang</th>
            <th className="border border-black p-1 w-32 text-center align-middle">Dosen</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((c, idx) => (
            <tr key={idx}>
              <td className="border border-black p-1 text-center align-middle">{c.no}</td>
              <td className="border border-black p-1 text-center align-middle">{c.code}</td>
              <td className="border border-black p-1 font-bold text-center align-middle">{c.name}</td>
              <td className="border border-black p-1 text-center align-middle">{c.credits > 0 ? c.credits : ""}</td>
              <td className="border border-black p-1 text-center align-middle">
                <div className="text-[9pt]">{c.day}</div>
                <div className="text-[8pt]">{c.time}</div>
              </td>
              <td className="border border-black p-1 text-center align-middle text-[9pt]">{c.venue}</td>
              <td className="border border-black p-1 text-center align-middle italic text-[9pt]">{c.lecturer}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-slate-100 font-bold">
            <td colSpan={3} className="border border-black p-1 uppercase text-right">
              Total {C.labels.credits}
            </td>
            <td className="border border-black p-1 text-center align-middle">{totalCredits}</td>
            <td colSpan={3} className="border border-black p-1 bg-slate-300" />
          </tr>
        </tfoot>
      </table>

      {/* FOOTER & TTD */}
      <div className="grid grid-cols-3 gap-4 text-center mt-12 text-[10pt]">
        <div>
          <p className="mb-4">{C.labels.studentName}</p>
          <div className="h-20 flex items-center justify-center mb-2">
            {studentSignatureBase64 ? (
              <img src={studentSignatureBase64} alt="Student Signature" className="h-full object-contain" />
            ) : (
              <div className="h-16 w-40 border-b border-dashed border-gray-400" />
            )}
          </div>
          <p className="font-bold underline uppercase">{student.name}</p>
        </div>
        <div>
          <p className="mb-16">{C.labels.consultant}</p>
          <p className="border-b border-black w-3/4 mx-auto" />
        </div>
        <div>
          <p className="mb-4">{C.officeText}</p>
          <div className="h-20 flex items-center justify-center mb-2">
            {C.signUrl ? (
              <img
                src={C.signUrl}
                alt="Digital Signature"
                className="h-full object-contain"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            ) : (
              <div className="h-16 w-full border-b border-dashed border-gray-400" />
            )}
          </div>
          <p className="mb-2 text-[9pt] text-gray-600">Dicetak: {generatedAt}</p>
          <p className="font-bold underline">Administrator / Registrar</p>
        </div>
      </div>

      <div className="mt-8 text-center border-t pt-2 text-[9pt] text-gray-500">
        <p className="italic text-red-600 uppercase tracking-widest mt-1">
          *** DOKUMEN INI SANGAT RAHASIA / STRICTLY CONFIDENTIAL ***
        </p>
      </div>
    </div>
  );
}

/* =========================================================
 * 5) EDUCATOR SUMMARY (MODIFIED - RESIZABLE)
 * =======================================================*/
function EducatorSummarySlip({
  org,
  educatorId,
  fullName,
  birthYear,
  status = "Issued",
  effectiveDate = "08/15/2024",
  issueDate = "08/10/2024",
  expirationDate = "08/14/2029",
  teachingField = { name: "Integrated Mathematics", code: "050230" },
  submittedDate = "08/01/2024",
  eSignStatus = "Completed",
  isLast = false,
}) {
  return (
    <div
      className="w-[210mm] min-h-[297mm] py-[18mm] px-[20mm] bg-white text-slate-900 box-border font-sans"
      style={{ pageBreakAfter: isLast ? "auto" : "always" }}
    >
      {/* HEADER MODIFIKASI: LOGO RESIZABLE & TEKS DI BAWAH */}
      <div className="flex flex-col items-center mb-6 text-center group">
        {/* LOGO AREA: Full width, bisa di-resize vertikal */}
        {org.logoUrl && (
          <div className="w-full flex justify-center mb-4">
             {/* - resize-y: User bisa drag bawah untuk atur tinggi.
                - overflow-hidden: Wajib supaya resize jalan.
                - hover:border: Indikator agar user tahu bisa di-resize.
             */}
             <div
               className="resize-y overflow-hidden flex justify-center items-center border border-transparent hover:border-dashed hover:border-slate-300 transition-all rounded p-1 relative"
               style={{ height: '140px', minHeight: '50px', width: '100%' }} // Default height lebih besar
               title="Drag bottom-right corner to resize logo"
             >
                {/* Image: pointer-events-none agar tidak mengganggu drag */}
                <img
                  src={org.logoUrl}
                  alt="Org Logo"
                  className="w-full h-full object-contain pointer-events-none"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />

                {/* Visual Hint di pojok kanan bawah saat hover */}
                <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-slate-400 opacity-0 group-hover:opacity-100 pointer-events-none"></div>
             </div>
          </div>
        )}

        {/* TEXT AREA: Di bawah logo */}
        <div className="w-full">
          <div className="font-bold text-[24px] tracking-wide uppercase leading-tight">
            {org.name}
          </div>
          <div className="font-semibold text-[14px] text-slate-500 mt-2">
            ID: {educatorId}
          </div>
        </div>
      </div>

      <div className="mt-8 text-[20px] font-bold">
        Educator Summary for {fullName}
      </div>
      <div className="text-slate-500 mb-3 text-sm">
        State Educator Licensing Portal
      </div>

      <div className="border-b border-slate-200 py-2 font-semibold text-sm">
        Demographics
      </div>
      <div className="flex justify-between items-center border-b border-slate-200 py-3 text-sm">
        <span className="text-slate-500">Birth Year:</span>
        <span>{birthYear}</span>
      </div>

      <div className="border-b border-slate-200 py-2 mt-1 font-semibold text-sm">
        Credentials
      </div>
      <div className="grid grid-cols-4 gap-3 border-b border-slate-200 py-3 text-[13px]">
        <div className="font-semibold text-slate-500">STATUS</div>
        <div className="font-semibold text-slate-500">EFFECTIVE DATE</div>
        <div className="font-semibold text-slate-500">ISSUE DATE</div>
        <div className="font-semibold text-slate-500">EXPIRATION DATE</div>

        <div className="mt-1">
          <span className="inline-flex px-3 py-0.5 rounded-full bg-emerald-500 text-white text-[12px] font-bold">
            {status}
          </span>
        </div>
        <div className="mt-1">{effectiveDate}</div>
        <div className="mt-1">{issueDate}</div>
        <div className="mt-1">{expirationDate}</div>
      </div>

      <div className="border-b border-slate-200 py-2 mt-2 font-bold text-sm tracking-wide">
        CREDENTIAL
      </div>
      <div className="pt-2 text-sm leading-relaxed">
        <p>5 Year Professional Adolescence to Young Adult (7–12) License</p>

        <div className="mt-3">
          <div className="font-semibold text-slate-500">Credential Number:</div>
          <div className="mt-1">
            Teaching Fields: {teachingField.name} [{teachingField.code}]
          </div>
        </div>

        <div className="flex justify-end mt-4 text-[12px]">
          <div className="text-right text-slate-500">
            <div className="font-bold text-slate-600">{teachingField.code}</div>
            <div>Issue Date</div>
            <div className="text-slate-900">{issueDate}</div>
          </div>
        </div>
      </div>

      <div className="border-b border-slate-200 py-2 mt-4 font-semibold text-sm">
        Submitted Applications
      </div>
      <div className="grid grid-cols-[1fr_3fr_1fr] gap-3 py-3 text-[13px]">
        <div className="font-semibold text-slate-500">SUBMITTED DATE</div>
        <div className="font-semibold text-slate-500">CREDENTIAL / STATUS</div>
        <div className="font-semibold text-slate-500">E-SIGN STATUS</div>

        <div className="mt-1">{submittedDate}</div>
        <div className="mt-1">
          5 Year Professional Adolescence to Young Adult (7–12) License ·{" "}
          <span className="font-bold">{status}</span>
        </div>
        <div className="mt-1">{eSignStatus}</div>
      </div>
    </div>
  );
}

/* =========================================================
 * 6) MAIN APP
 * =======================================================*/
function App() {
  const [activePreset, setActivePreset] = useState("RAHARJA");
  const [docMode, setDocMode] = useState("educator");
  const [mode, setMode] = useState("bulk");

  // KRS states
  const [uniName, setUniName] = useState("");
  const [semesterText, setSemesterText] = useState("");
  const [matricNo, setMatricNo] = useState("");
  const [studentName, setStudentName] = useState("");
  const [faculty, setFaculty] = useState("");
  const [department, setDepartment] = useState("");
  const [level, setLevel] = useState("");
  const [section, setSection] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [studentSignature, setStudentSignature] = useState(null);
  const [applySignatureToAll, setApplySignatureToAll] = useState(true);
  const [courses, setCourses] = useState([]);
  const [totalCredits, setTotalCredits] = useState(0);
  const [generatedAt, setGeneratedAt] = useState("");
  const [shown, setShown] = useState(false);
  const [bulkCount, setBulkCount] = useState(10);
  const [bulkStudents, setBulkStudents] = useState([]);

  // Educator states
  const [eduOrg, setEduOrg] = useState(EDU_ORGS[0]);
  const [eduName, setEduName] = useState("");
  const [eduId, setEduId] = useState("");
  const [birthYear, setBirthYear] = useState("1990");
  const [eduList, setEduList] = useState([]);

  const singleSlipRef = useRef(null);
  const bulkContainerRef = useRef(null);
  const slipRefs = useRef([]);
  const [isDownloading, setIsDownloading] = useState(false);

  // Init KRS preset
  useEffect(() => {
    const config = PRESETS[activePreset];
    setUniName(config.uniName);
    setSemesterText(getDynamicSemester(activePreset));
    setFaculty(config.defaultData.faculty);
    setDepartment(config.defaultData.dept);
    setLevel(config.defaultData.level);
    setSection(config.defaultData.section);
    setMatricNo(""); setStudentName(""); setEmail(""); setPhone("");
    setStudentSignature(null); setShown(false);
    setBulkStudents([]); slipRefs.current = [];
  }, [activePreset]);

  // ==== KRS generators ====
  function autoFillStudent() {
    const isRaharja = activePreset === "RAHARJA";
    const name = generateFakerName(activePreset);
    const year = new Date().getFullYear().toString().slice(-2);
    const randomId = Math.floor(Math.random() * 90000 + 10000);
    const id = year + (isRaharja ? "1" : "2") + randomId;
    const ph = isRaharja ? "08" + Math.floor(Math.random() * 100000000) : "01" + Math.floor(Math.random() * 100000000);
    const slug = name.split(" ")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
    const idSuffix = id.slice(-4);
    const emailDomain = PRESETS[activePreset].emailSuffix;
    const finalEmail = `${slug}${idSuffix}${emailDomain}`;
    setStudentName(name); setMatricNo(id); setPhone(ph); setEmail(finalEmail);
  }

  function buildCoursesAndCredits() {
    let courseSource, venueSource, docTitles;
    if (activePreset === "RAHARJA") {
      courseSource = COURSES_RAHARJA;
      venueSource = VENUE_LIST_RAHARJA;
      docTitles = ["Ir.", "Dr.", "Bpk.", "Ibu"];
    } else if (activePreset === "IIUM") {
      courseSource = COURSES_IIUM;
      venueSource = VENUE_LIST_IIUM;
      docTitles = ["Dr.", "Prof.", "Assoc. Prof."];
    } else {
      courseSource = COURSES_UOC;
      venueSource = VENUE_LIST_UOC;
      docTitles = ["Dr.", "Prof.", "Mdm.", "Mr."];
    }

    const shuffled = [...courseSource].sort(() => Math.random() - 0.5);
    const selectedCourses = [];
    let creditSum = 0;
    let no = 1;

    for (let c of shuffled) {
      const day = getRandom(DAY_LIST);
      const time = getRandom(TIME_LIST);
      const venue = getRandom(venueSource);
      const lecturerName = `${getRandom(docTitles)} ${generateFakerName(activePreset)}`;
      selectedCourses.push({ no: no++, code: c.code, name: c.name, credits: c.credits, section: activePreset === "RAHARJA" ? "Kls-A" : "S1", day, time, venue, lecturer: lecturerName });
      creditSum += c.credits;
      if (c.hasLab) {
        selectedCourses.push({
          no: "", code: "", name: `${c.name} (Lab/Tutorial)`, credits: 0,
          section: "-", day: getRandom(DAY_LIST), time: getRandom(TIME_LIST),
          venue: activePreset === "UOC" ? "Science Lab" : "Lab Komputer", lecturer: "-"
        });
      }
      if (creditSum >= 18 && selectedCourses.length > 5) break;
    }
    return { selectedCourses, creditSum };
  }

  function handleGenerateSingleKRS() {
    let name = studentName;
    if (!name) {
      autoFillStudent();
      name = studentName || generateFakerName(activePreset);
    }

    const { selectedCourses, creditSum } = buildCoursesAndCredits();
    setCourses(selectedCourses);
    setTotalCredits(creditSum);

    const locale = activePreset === "RAHARJA" ? "id-ID" : "en-MY";
    const printed = new Date().toLocaleDateString(locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    setGeneratedAt(printed);

    const manualSig = captureSignatureCanvasOnly();
    const sig = manualSig || generateSignatureFromName(name);
    setStudentSignature(sig);

    setShown(true);
  }

  function makeRandomStudentKRS() {
    const isRaharja = activePreset === "RAHARJA";
    const name = generateFakerName(activePreset);
    const year = new Date().getFullYear().toString().slice(-2);
    const randomId = Math.floor(Math.random() * 90000 + 10000);
    const id = year + (isRaharja ? "1" : "2") + randomId;
    const ph = isRaharja ? "08" + Math.floor(Math.random() * 100000000) : "01" + Math.floor(Math.random() * 100000000);
    const slug = name.split(" ")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
    const idSuffix = id.slice(-4);
    const emailDomain = PRESETS[activePreset].emailSuffix;
    const email = `${slug}${idSuffix}${emailDomain}`;
    return { name, id, phone: ph, email, faculty, department, level, section };
  }

  function handleGenerateBulkKRS() {
    const locale = activePreset === "RAHARJA" ? "id-ID" : "en-MY";
    const printedAt = new Date().toLocaleDateString(locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const manual = captureSignatureCanvasOnly();
    const rows = [];
    const count = Math.max(1, Number(bulkCount) || 0);

    for (let i = 0; i < count; i++) {
      const student = makeRandomStudentKRS();
      const { selectedCourses, creditSum } = buildCoursesAndCredits();

      let signature;
      if (applySignatureToAll && manual) {
        signature = manual;
      } else {
        signature = generateSignatureFromName(student.name);
      }

      rows.push({
        student,
        courses: selectedCourses,
        totalCredits: creditSum,
        generatedAt: printedAt,
        signature,
      });
    }

    setBulkStudents(rows);
    setShown(true);
    slipRefs.current = [];
  }

  // ==== Educator generators ====
  function randomEduId() {
    const prefixes = ["SM", "GH", "AB", "LT"];
    const digits = String(Math.floor(Math.random() * 10000000)).padStart(7, "0");
    return `${getRandom(prefixes)}${digits}`;
  }
  function autoFillEducator() {
    const name = generateFakerName("IIUM");
    setEduName(name);
    setEduId(randomEduId());
    setBirthYear(String(1975 + Math.floor(Math.random() * 20)));
  }
  function handleGenerateSingleEducator() {
    if (!eduName || !eduId) autoFillEducator();
    setShown(true);
  }
  function handleGenerateBulkEducator() {
    const list = [];
    for (let i = 0; i < Math.max(1, Number(bulkCount) || 0); i++) {
      list.push({
        org: getRandom(EDU_ORGS),
        educatorId: randomEduId(),
        fullName: generateFakerName("IIUM"),
        birthYear: String(1975 + Math.floor(Math.random() * 20)),
      });
    }
    setEduList(list); setShown(true); slipRefs.current = [];
  }

  // ==== html2pdf utils ====
  function pdfOpts(filename) {
    return {
      margin: 0,
      filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        dpi: 192,
        letterRendering: true,
        backgroundColor: "#ffffff",
        onclone: (clonedDoc) => {
          const win = clonedDoc.defaultView;
          if (!win) return;
          clonedDoc.querySelectorAll("*").forEach((el) => {
            const st = win.getComputedStyle(el);
            ["color", "background-color", "border-color"].forEach((css) => {
              const val = st.getPropertyValue(css);
              if (val && val.includes("oklch(")) {
                el.style.setProperty(css, css === "background-color" ? "#ffffff" : "#000000", "important");
              }
            });
          });
        },
      },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };
  }
  function sanitizeFilename(s) {
    return s.replace(/[<>:"/\\|?*\x00-\x1F]/g, "_").slice(0, 90);
  }
  function downloadSingle(refEl, filename) {
    if (!refEl) return;
    setIsDownloading(true);
    setTimeout(() => {
      html2pdf()
        .from(refEl)
        .set(pdfOpts(filename))
        .save()
        .then(() => setIsDownloading(false))
        .catch((e) => {
          console.error(e);
          alert("Gagal download PDF.");
          setIsDownloading(false);
        });
    }, 250);
  }
  async function downloadBulkAsZip(prefix, refs, names) {
    if (!refs?.length) return;
    setIsDownloading(true);
    try {
      const zip = new JSZip();
      for (let i = 0; i < refs.length; i++) {
        const el = refs[i];
        if (!el) continue;
        const fname = sanitizeFilename(`${prefix}_${names[i]}.pdf`);
        const blob = await new Promise((resolve, reject) => {
          html2pdf()
            .from(el)
            .set(pdfOpts(fname))
            .toPdf()
            .get("pdf")
            .then((pdf) => resolve(pdf.output("blob")))
            .catch(reject);
        });
        zip.file(fname, blob);
      }
      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, `${prefix}_bundle_${refs.length}.zip`);
    } catch (e) {
      console.error(e);
      alert("Gagal membuat ZIP.");
    } finally {
      setIsDownloading(false);
    }
  }

  const L = PRESETS[activePreset].labels;
  const C = PRESETS[activePreset];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-4 md:p-8 font-sans">
      {/* Top toggles */}
      <div className="max-w-6xl mx-auto flex flex-wrap items-center gap-3 mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setDocMode("krs")}
            className={`px-3 py-1 rounded ${docMode === "krs" ? "bg-purple-600" : "bg-slate-700"}`}
          >
            KRS Generator
          </button>
          <button
            onClick={() => setDocMode("educator")}
            className={`px-3 py-1 rounded ${docMode === "educator" ? "bg-purple-600" : "bg-slate-700"}`}
          >
            Educator Summary
          </button>
        </div>
        <div className="flex gap-2 ml-auto">
          <button
            onClick={() => setMode("single")}
            className={`px-3 py-1 rounded ${mode === "single" ? "bg-blue-600" : "bg-slate-700"}`}
          >
            Single
          </button>
          <button
            onClick={() => setMode("bulk")}
            className={`px-3 py-1 rounded ${mode === "bulk" ? "bg-blue-600" : "bg-slate-700"}`}
          >
            Bulk
          </button>
          {mode === "bulk" && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Jumlah</span>
              <input
                type="number"
                min={1}
                max={200}
                value={bulkCount}
                onChange={(e) => setBulkCount(e.target.value)}
                className="w-20 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm"
              />
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid md:grid-cols-12 gap-6">
        {/* LEFT CONTROL PANEL */}
        <div className="md:col-span-4 space-y-4">
          {docMode === "krs" ? (
            <div className="bg-slate-800 p-5 rounded-xl shadow-lg border border-slate-700">
              <div className="flex items-center justify-between border-b border-slate-700 pb-2 mb-4">
                <h2 className="text-lg font-bold">⚙️ Data Mahasiswa</h2>
                <span className="text-[10px] bg-slate-700 px-2 py-1 rounded text-blue-300">
                  {semesterText}
                </span>
              </div>

              <div className="flex gap-2 mb-3">
                {Object.keys(PRESETS).map((key) => (
                  <button
                    key={key}
                    onClick={() => setActivePreset(key)}
                    className={`px-3 py-1 rounded text-xs ${
                      activePreset === key ? "bg-emerald-600" : "bg-slate-700"
                    }`}
                  >
                    {key}
                  </button>
                ))}
              </div>

              {mode === "single" && (
                <div className="flex items-end gap-2 mb-3">
                  <div className="flex-1">
                    <InputGroup
                      label={L.id}
                      value={matricNo}
                      onChange={(e) => setMatricNo(e.target.value)}
                      placeholder="Generate Auto..."
                    />
                  </div>
                  <button
                    onClick={autoFillStudent}
                    className="bg-slate-600 h-[38px] px-3 rounded hover:bg-slate-500 text-xs text-white font-semibold mb-[1px]"
                  >
                    Auto
                  </button>
                </div>
              )}

              <div className="space-y-3">
                <InputGroup label={L.studentName} value={studentName} onChange={(e) => setStudentName(e.target.value)} />
                <InputGroup label={L.faculty} value={faculty} onChange={(e) => setFaculty(e.target.value)} />
                <InputGroup label={L.dept} value={department} onChange={(e) => setDepartment(e.target.value)} />
                <div className="grid grid-cols-2 gap-2">
                  <InputGroup label={L.level} value={level} onChange={(e) => setLevel(e.target.value)} />
                  <InputGroup label={L.section} value={section} onChange={(e) => setSection(e.target.value)} />
                </div>
                <InputGroup label="Email (Official)" value={email} onChange={(e) => setEmail(e.target.value)} />
                <InputGroup label="No. Handphone" value={phone} onChange={(e) => setPhone(e.target.value)} />

                <div className="mt-4 pt-4 border-t border-slate-700">
                  <label className="block font-semibold text-xs text-slate-400 uppercase mb-2">
                    Tanda Tangan Mahasiswa (Opsional)
                  </label>
                  <signature-maker
                    id="signatureMaker"
                    data-with-submit="false"
                    data-download-on-save="false"
                    data-clear-button-text="Hapus"
                    data-undo-button-text="Undo"
                    data-save-button-text="Simpan / Apply"
                    data-canvas-class="bg-white rounded-lg w-full h-32"
                    data-save-button-class="hidden"
                    class="block w-full"
                  ></signature-maker>
                  {mode === "bulk" && (
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        id="applyAll"
                        type="checkbox"
                        checked={applySignatureToAll}
                        onChange={(e) => setApplySignatureToAll(e.target.checked)}
                      />
                      <label htmlFor="applyAll" className="text-xs text-slate-300">
                        Gunakan tanda tangan yang sama untuk semua (kalau digambar).
                        Kalau tidak, tiap mahasiswa auto.
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {mode === "single" ? (
                <button
                  onClick={handleGenerateSingleKRS}
                  className="w-full mt-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-3 rounded-lg shadow-lg"
                >
                  ⚡ Generate Preview (KRS)
                </button>
              ) : (
                <button
                  onClick={handleGenerateBulkKRS}
                  className="w-full mt-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-3 rounded-lg shadow-lg"
                >
                  ⚡ Generate Preview (Bulk KRS)
                </button>
              )}
            </div>
          ) : (
            <div className="bg-slate-800 p-5 rounded-xl shadow-lg border border-slate-700">
              <div className="flex items-center justify-between border-b border-slate-700 pb-2 mb-4">
                <h2 className="text-lg font-bold">🎓 Educator Summary</h2>
                <span className="text-[10px] bg-slate-700 px-2 py-1 rounded text-blue-300">
                  Layout mirip sample
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Organization</label>
                  <select
                    className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm"
                    value={eduOrg.name}
                    onChange={(e) =>
                      setEduOrg(EDU_ORGS.find((x) => x.name === e.target.value) || EDU_ORGS[0])
                    }
                  >
                    {EDU_ORGS.map((o) => (
                      <option key={o.name} value={o.name}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                </div>
                <InputGroup label="Full Name" value={eduName} onChange={(e) => setEduName(e.target.value)} />
                <InputGroup label="Educator ID" value={eduId} onChange={(e) => setEduId(e.target.value)} />
                <InputGroup label="Birth Year" value={birthYear} onChange={(e) => setBirthYear(e.target.value)} />
                <div className="flex gap-2">
                  <button onClick={autoFillEducator} className="bg-slate-600 px-3 py-2 rounded text-xs">
                    Auto
                  </button>
                  <span className="text-xs text-slate-400 self-center">
                    Auto nama / ID / tahun lahir
                  </span>
                </div>
              </div>

              {mode === "single" ? (
                <button
                  onClick={handleGenerateSingleEducator}
                  className="w-full mt-6 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold py-3 rounded-lg shadow-lg"
                >
                  ⚡ Generate Preview (Educator)
                </button>
              ) : (
                <button
                  onClick={handleGenerateBulkEducator}
                  className="w-full mt-6 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold py-3 rounded-lg shadow-lg"
                >
                  ⚡ Generate Preview (Bulk Educator)
                </button>
              )}
            </div>
          )}
        </div>

        {/* RIGHT PREVIEW */}
        <div className="md:col-span-8">
          {shown ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-slate-800 p-3 rounded-lg border border-slate-700">
                <span className="text-sm text-slate-300 font-semibold">
                  {docMode === "krs"
                    ? mode === "single"
                      ? "📄 Preview KRS"
                      : `📄 Preview Bulk KRS: ${bulkStudents.length} slips`
                    : mode === "single"
                    ? "📄 Preview Educator Summary"
                    : `📄 Preview Bulk Educator: ${eduList.length} docs`}
                </span>
                <div className="flex items-center gap-2">
                  {docMode === "krs" ? (
                    mode === "single" ? (
                      <button
                        onClick={() =>
                          downloadSingle(
                            singleSlipRef.current,
                            `${activePreset}_KRS_${matricNo || "document"}.pdf`
                          )
                        }
                        disabled={isDownloading}
                        className={`text-white text-sm px-5 py-2 rounded ${
                          isDownloading ? "bg-gray-500 cursor-not-allowed" : "bg-red-600 hover:bg-red-500"
                        }`}
                      >
                        {isDownloading ? "Processing..." : "⬇️ Download PDF"}
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          downloadBulkAsZip(
                            `${activePreset}_KRS`,
                            slipRefs.current,
                            bulkStudents.map((r) => `${r.student.id}_${r.student.name}`)
                          )
                        }
                        disabled={isDownloading}
                        className={`text-white text-sm px-5 py-2 rounded ${
                          isDownloading ? "bg-gray-500 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-500"
                        }`}
                      >
                        {isDownloading ? "Processing..." : "⬇️ Download ZIP (per PDF)"}
                      </button>
                    )
                  ) : mode === "single" ? (
                    <button
                      onClick={() =>
                        downloadSingle(singleSlipRef.current, `Educator_${eduId || "document"}.pdf`)
                      }
                      disabled={isDownloading}
                      className={`text-white text-sm px-5 py-2 rounded ${
                        isDownloading ? "bg-gray-500 cursor-not-allowed" : "bg-red-600 hover:bg-red-500"
                      }`}
                    >
                      {isDownloading ? "Processing..." : "⬇️ Download PDF"}
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        downloadBulkAsZip(
                          `Educators`,
                          slipRefs.current,
                          eduList.map((r) => `${r.educatorId}_${r.fullName}`)
                        )
                      }
                      disabled={isDownloading}
                      className={`text-white text-sm px-5 py-2 rounded ${
                        isDownloading ? "bg-gray-500 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-500"
                      }`}
                    >
                      {isDownloading ? "Processing..." : "⬇️ Download ZIP (per PDF)"}
                    </button>
                  )}
                </div>
              </div>

              {/* CANVAS PREVIEW AREA */}
              {docMode === "krs" ? (
                mode === "single" ? (
                  <div className="overflow-auto pb-10 flex justify-center">
                    <div ref={singleSlipRef}>
                      <SlipKRS
                        C={C}
                        L={L}
                        uniName={uniName}
                        semesterText={semesterText}
                        student={{
                          name: studentName || "",
                          id: matricNo || "",
                          faculty,
                          department,
                          level,
                          section,
                          email,
                          phone,
                        }}
                        courses={courses}
                        totalCredits={totalCredits}
                        generatedAt={generatedAt}
                        studentSignatureBase64={studentSignature}
                        isLast
                      />
                    </div>
                  </div>
                ) : (
                  <div className="overflow-auto pb-10 flex justify-center">
                    <div ref={bulkContainerRef}>
                      {bulkStudents.map((row, i) => (
                        <div key={row.student.id} ref={(el) => (slipRefs.current[i] = el)}>
                          <SlipKRS
                            C={C}
                            L={L}
                            uniName={uniName}
                            semesterText={semesterText}
                            student={row.student}
                            courses={row.courses}
                            totalCredits={row.totalCredits}
                            generatedAt={row.generatedAt}
                            studentSignatureBase64={row.signature}
                            isLast={i === bulkStudents.length - 1}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )
              ) : mode === "single" ? (
                <div className="overflow-auto pb-10 flex justify-center">
                  <div ref={singleSlipRef}>
                    <EducatorSummarySlip
                      org={eduOrg}
                      educatorId={eduId || randomEduId()}
                      fullName={eduName || generateFakerName("IIUM")}
                      birthYear={birthYear || "1990"}
                      isLast
                    />
                  </div>
                </div>
              ) : (
                <div className="overflow-auto pb-10 flex justify-center">
                  <div ref={bulkContainerRef}>
                    {eduList.map((r, i) => (
                      <div key={r.educatorId} ref={(el) => (slipRefs.current[i] = el)}>
                        <EducatorSummarySlip {...r} isLast={i === eduList.length - 1} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-96 flex flex-col items-center justify-center bg-slate-800 rounded-xl border-2 border-dashed border-slate-700 text-slate-500">
              <span className="text-5xl mb-4">📄</span>
              <p>
                Klik tombol <span className="text-purple-400 font-bold">"Generate Preview"</span> di sebelah kiri.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;