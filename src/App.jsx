import { useState, useRef, useEffect } from "react";
import html2pdf from "html2pdf.js";
import { fakerID_ID, fakerEN } from "@faker-js/faker";
// Import library Signature Maker
import "@docuseal/signature-maker-js";

// =========================================
// 1. DATA CONSTANTS & CONFIGURATION
// =========================================

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
    // Config Logo Standard
    logoStyle: { height: "70px", width: "auto" },
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
      consultant: "Dosen PA"
    },
    defaultData: {
      faculty: "Fakultas Sains dan Teknologi",
      dept: "Teknik Informatika",
      level: "Sarjana (S1)",
      section: "Malam (Reguler B)"
    }
  },
  IIUM: {
    id: "IIUM",
    logoUrl: "/logo-iium.png",
    signUrl: "/sign.png",
    // Config Logo Standard
    logoStyle: { height: "70px", width: "auto" },
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
      consultant: "Academic Advisor"
    },
    defaultData: {
      faculty: "Kulliyyah of ICT",
      dept: "Computer Science",
      level: "Undergraduate",
      section: "Section 1"
    }
  },
  UOC: {
    id: "UOC",
    logoUrl: "/logo-uoc.png",
    signUrl: "/sign.png",
    // === FIX LOGO UOC ===
    // Menggunakan max-width agar tidak terlalu besar/lebar
    logoStyle: { height: "auto", maxWidth: "250px", maxHeight: "60px" },
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
      consultant: "Mentor"
    },
    defaultData: {
      faculty: "Faculty of Psychology & Social Sciences",
      dept: "Bachelor of Psychology (Hons)",
      level: "Degree",
      section: "Sep 2024 Intake"
    }
  }
};

// =========================================
// 2. HELPER FUNCTIONS
// =========================================

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
      semesterLabel = presetType === 'RAHARJA' ? "Ganjil" : "1";
  } else {
      acadYear = `${year - 1}/${year}`;
      semesterLabel = presetType === 'RAHARJA' ? "Genap" : "2";
  }

  if (presetType === 'RAHARJA') {
      return `Semester ${semesterLabel} T.A. ${acadYear}`;
  } else {
      return `Semester ${semesterLabel}, Session ${acadYear}`;
  }
}

function generateFakerName(preset) {
  if (preset === "RAHARJA") {
    return fakerID_ID.person.fullName();
  } else {
    const isMalay = Math.random() > 0.3;
    if (isMalay) {
      const gender = Math.random() > 0.5 ? 'male' : 'female';
      const first = fakerID_ID.person.firstName(gender);
      const father = fakerID_ID.person.firstName('male');
      const bin = gender === 'male' ? 'bin' : 'binti';
      return `${first} ${bin} ${father}`;
    }
    return fakerEN.person.fullName();
  }
}

// =========================================
// 3. UI COMPONENTS
// =========================================

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
      <div className="flex relative group">
        <input
          className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 pr-10 focus:ring-2 focus:ring-purple-500 outline-none text-white text-sm transition-all"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
        <button
          onClick={handleCopy}
          title="Copy to clipboard"
          className="absolute right-1 top-1 bottom-1 px-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
        >
          {copied ? (
            <span className="text-green-400 text-xs font-bold">✓</span>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

// =========================================
// 4. MAIN APP COMPONENT
// =========================================

function App() {
  const [activePreset, setActivePreset] = useState("RAHARJA");

  // Data States
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

  // Signature State
  const [studentSignature, setStudentSignature] = useState(null);

  const [courses, setCourses] = useState([]);
  const [totalCredits, setTotalCredits] = useState(0);
  const [generatedAt, setGeneratedAt] = useState("");
  const [shown, setShown] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const slipRef = useRef(null);

  // === INITIALIZATION ===
  useEffect(() => {
    const config = PRESETS[activePreset];
    setUniName(config.uniName);
    setSemesterText(getDynamicSemester(activePreset));

    // Reset fields
    setFaculty(config.defaultData.faculty);
    setDepartment(config.defaultData.dept);
    setLevel(config.defaultData.level);
    setSection(config.defaultData.section);
    setMatricNo("");
    setStudentName("");
    setEmail("");
    setPhone("");
    setStudentSignature(null); // Reset signature when switching uni
    setShown(false);
  }, [activePreset]);

  // === SIGNATURE LISTENER ===
  useEffect(() => {
    const handleSignatureChange = (e) => {
        // e.detail.base64 berisi data gambar tanda tangan
        if (e.detail && e.detail.base64) {
            setStudentSignature(e.detail.base64);
        } else {
            // Jika dihapus/clear
            setStudentSignature(null);
        }
    };

    const maker = document.getElementById('signatureMaker');
    if (maker) {
        maker.addEventListener('change', handleSignatureChange);
    }

    // Cleanup listener
    return () => {
        if (maker) maker.removeEventListener('change', handleSignatureChange);
    };
  }, []);

  // === AUTO FILL LOGIC ===
  const handleAutoFillStudent = () => {
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

    setStudentName(name);
    setMatricNo(id);
    setPhone(ph);
    setEmail(finalEmail);
  };

  // === GENERATE SLIP LOGIC ===
  const handleGenerateSlip = () => {
    if (!studentName) handleAutoFillStudent();

    // Select Source based on Preset
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
        // UOC
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
        const randomLecturerName = generateFakerName(activePreset);
        const lecturerName = `${getRandom(docTitles)} ${randomLecturerName}`;

        selectedCourses.push({
            no: no++,
            code: c.code,
            name: c.name,
            credits: c.credits,
            section: activePreset === "RAHARJA" ? "Kls-A" : "S1",
            day, time, venue, lecturer: lecturerName
        });
        creditSum += c.credits;

        if (c.hasLab) {
             selectedCourses.push({
                no: "",
                code: "",
                name: `${c.name} (Lab/Tutorial)`,
                credits: 0,
                section: "-",
                day: getRandom(DAY_LIST),
                time: getRandom(TIME_LIST),
                venue: activePreset === "UOC" ? "Science Lab" : "Lab Komputer",
                lecturer: "-"
             });
        }

        if (creditSum >= 18 && selectedCourses.length > 5) break;
    }

    setCourses(selectedCourses);
    setTotalCredits(creditSum);

    const locale = activePreset === "RAHARJA" ? "id-ID" : "en-MY";
    setGeneratedAt(new Date().toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" }));
    setShown(true);
  };

  // === DOWNLOAD PDF LOGIC ===
  const handleDownloadPdf = () => {
    if (!slipRef.current) return;
    setIsDownloading(true);

    const fileName = `${activePreset}_KRS_${matricNo || "dokumen"}.pdf`;

    const opt = {
      margin: 0,
      filename: fileName,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        dpi: 192,
        letterRendering: true,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
            const win = clonedDoc.defaultView;
            if (!win) return;
            const all = clonedDoc.querySelectorAll('*');
            all.forEach((el) => {
              const style = win.getComputedStyle(el);
              const props = [
                { css: 'color', fallback: '#000000' },
                { css: 'background-color', fallback: '#ffffff' },
                { css: 'border-color', fallback: '#000000' },
              ];
              props.forEach(({ css, fallback }) => {
                const val = style.getPropertyValue(css);
                if (val && val.includes('oklch(')) {
                  el.style.setProperty(css, fallback, 'important');
                }
              });
            });
        }
      },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
    };

    setTimeout(() => {
        html2pdf().from(slipRef.current).set(opt).save()
        .then(() => setIsDownloading(false))
        .catch((err) => {
            console.error("PDF Error:", err);
            alert("Gagal mendownload PDF. Coba lagi.");
            setIsDownloading(false);
        });
    }, 500);
  };

  const L = PRESETS[activePreset].labels;
  const C = PRESETS[activePreset];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-4 md:p-8 font-sans">

      {/* SWITCHER BUTTONS */}
      <div className="max-w-5xl mx-auto mb-8 flex flex-wrap justify-center gap-4">
        {Object.keys(PRESETS).map(key => (
             <button
                key={key}
                onClick={() => setActivePreset(key)}
                className={`px-6 py-2 rounded-full font-bold shadow-md transition ${
                    activePreset === key
                    ? "bg-purple-600 text-white ring-2 ring-purple-400 shadow-purple-500/50"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                }`}
            >
                {key === "RAHARJA" ? "🏢 Raharja" : key === "IIUM" ? "🕌 IIUM" : "🎓 UoC"}
            </button>
        ))}
      </div>

      <div className="max-w-6xl mx-auto grid md:grid-cols-12 gap-6">

        {/* === LEFT COLUMN: INPUT FORM === */}
        <div className="md:col-span-4 space-y-4">
            <div className="bg-slate-800 p-5 rounded-xl shadow-lg border border-slate-700">
                <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-2">
                    <h2 className="text-lg font-bold text-slate-100">⚙️ Data Mahasiswa</h2>
                    <span className="text-[10px] bg-slate-700 px-2 py-1 rounded text-blue-300">{semesterText}</span>
                </div>

                <div className="space-y-3">
                    <div className="flex items-end gap-2">
                        <div className="flex-1">
                            <InputGroup label={L.id} value={matricNo} onChange={e=>setMatricNo(e.target.value)} placeholder="Generate Auto..." />
                        </div>
                        <button onClick={handleAutoFillStudent} className="bg-slate-600 h-[38px] px-3 rounded hover:bg-slate-500 text-xs text-white font-semibold mb-[1px]">Auto</button>
                    </div>

                    <InputGroup label={L.studentName} value={studentName} onChange={e=>setStudentName(e.target.value)} />
                    <InputGroup label={L.faculty} value={faculty} onChange={e=>setFaculty(e.target.value)} />
                    <InputGroup label={L.dept} value={department} onChange={e=>setDepartment(e.target.value)} />

                    <div className="grid grid-cols-2 gap-2">
                        <InputGroup label={L.level} value={level} onChange={e=>setLevel(e.target.value)} />
                        <InputGroup label={L.section} value={section} onChange={e=>setSection(e.target.value)} />
                    </div>

                    <InputGroup label="Email (Official)" value={email} onChange={e=>setEmail(e.target.value)} placeholder="...Username" />
                    <InputGroup label="No. Handphone" value={phone} onChange={e=>setPhone(e.target.value)} />

                    {/* === SIGNATURE MAKER === */}
                    <div className="mt-4 pt-4 border-t border-slate-700">
                        <label className="block font-semibold text-xs text-slate-400 uppercase mb-2">Tanda Tangan Mahasiswa (Opsional)</label>
                        <signature-maker
                            id="signatureMaker"
                            data-with-submit="false"
                            data-download-on-save="false"
                            data-clear-button-text="Hapus"
                            data-undo-button-text="Undo"
                            data-save-button-text="Simpan / Apply"
                            data-canvas-class="bg-white rounded-lg w-full h-32"
                            data-save-button-class="hidden" // Kita pakai event 'change' jadi tombol save bisa dihide atau dibiarkan
                            class="block w-full"
                        ></signature-maker>
                        <p className="text-[10px] text-slate-500 mt-1 italic">*Tanda tangan akan otomatis muncul di preview.</p>
                    </div>
                </div>

                <button
                    onClick={handleGenerateSlip}
                    className="w-full mt-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-3 rounded-lg shadow-lg transition transform hover:scale-[1.02]"
                >
                    ⚡ Generate Preview
                </button>
            </div>
        </div>

        {/* === RIGHT COLUMN: PREVIEW === */}
        <div className="md:col-span-8">
            {shown ? (
                <div className="space-y-4 animate-fade-in">
                    <div className="flex justify-between items-center bg-slate-800 p-3 rounded-lg border border-slate-700">
                         <span className="text-sm text-slate-300 font-semibold">📄 Preview Dokumen A4</span>
                        <button
                            onClick={handleDownloadPdf}
                            disabled={isDownloading}
                            className={`text-white text-sm px-5 py-2 rounded shadow flex items-center gap-2 font-bold transition-all ${
                                isDownloading ? "bg-gray-500 cursor-not-allowed" : "bg-red-600 hover:bg-red-500"
                            }`}
                        >
                            {isDownloading ? "Processing..." : "⬇️ Download PDF"}
                        </button>
                    </div>

                    {/* === KERTAS DOKUMEN (AREA PRINT) === */}
                    <div className="overflow-auto pb-10 flex justify-center">
                        <div
                            ref={slipRef}
                            style={{
                                width: "210mm",
                                minHeight: "297mm",
                                padding: "20mm",
                                fontFamily: "'Times New Roman', Times, serif",
                                backgroundColor: "#ffffff",
                                color: "#000000",
                                boxSizing: "border-box"
                            }}
                            className="shadow-2xl bg-white"
                        >
                            {/* Header */}
                            <div className="border-b-2 border-black pb-2 mb-4 relative min-h-[80px]" style={{borderColor: "#000000"}}>
                                <img
                                    src={C.logoUrl}
                                    alt="Logo"
                                    style={{
                                        position: "absolute",
                                        left: 0,
                                        top: 0,
                                        // MENGGUNAKAN LOGO STYLE DARI CONFIG
                                        ...C.logoStyle
                                    }}
                                    onError={(e) => e.target.style.display = 'none'}
                                />
                                <div className="text-center ml-20">
                                    <h1 className="font-bold uppercase tracking-wide" style={{fontSize: "16pt", lineHeight: "1.2"}}>{uniName}</h1>
                                    <p style={{fontSize: "9pt"}}>{C.uniAddress}</p>
                                    <p style={{fontSize: "9pt", fontStyle: "italic"}}>{C.uniContact}</p>
                                </div>
                            </div>

                            <div className="text-center mb-6">
                                <h2 className="font-bold underline uppercase" style={{fontSize: "14pt"}}>{C.docTitle}</h2>
                                <p className="uppercase mt-1" style={{fontSize: "11pt", fontWeight: "bold"}}>{semesterText}</p>
                            </div>

                            {/* Info Mahasiswa */}
                            <table className="w-full mb-6" style={{fontSize: "10pt"}}>
                                <tbody>
                                    <tr>
                                        <td className="font-bold w-32 py-0.5">{L.studentName}</td>
                                        <td className="w-2">:</td>
                                        <td className="uppercase">{studentName}</td>
                                        <td className="font-bold w-28 pl-4">{L.faculty}</td>
                                        <td className="w-2">:</td>
                                        <td>{faculty}</td>
                                    </tr>
                                    <tr>
                                        <td className="font-bold py-0.5">{L.id}</td>
                                        <td>:</td>
                                        <td>{matricNo}</td>
                                        <td className="font-bold pl-4">{L.dept}</td>
                                        <td>:</td>
                                        <td>{department}</td>
                                    </tr>
                                    <tr>
                                        <td className="font-bold py-0.5">{L.level}</td>
                                        <td>:</td>
                                        <td>{level}</td>
                                        <td className="font-bold pl-4">{L.section}</td>
                                        <td>:</td>
                                        <td>{section}</td>
                                    </tr>
                                    <tr>
                                        <td className="font-bold py-0.5">Email</td>
                                        <td>:</td>
                                        <td>{email}</td>
                                        <td className="font-bold pl-4">Phone</td>
                                        <td>:</td>
                                        <td>{phone}</td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* Tabel Kursus - RATA TENGAH & FONT KECIL */}
                            <table className="w-full border-collapse border border-black mb-6" style={{fontSize: "10pt", borderColor: "#000000"}}>
                                <thead>
                                    <tr style={{backgroundColor: "#f3f4f6"}}>
                                        <th className="border border-black p-1 w-8" style={{borderColor: "#000000", textAlign: "center", verticalAlign: "middle"}}>No</th>
                                        <th className="border border-black p-1 w-20" style={{borderColor: "#000000", textAlign: "center", verticalAlign: "middle"}}>Kode</th>
                                        <th className="border border-black p-1" style={{borderColor: "#000000", textAlign: "center", verticalAlign: "middle"}}>Mata Kuliah / Course</th>
                                        <th className="border border-black p-1 w-12" style={{borderColor: "#000000", textAlign: "center", verticalAlign: "middle"}}>{L.credits}</th>
                                        <th className="border border-black p-1 w-24" style={{borderColor: "#000000", textAlign: "center", verticalAlign: "middle"}}>Jadwal</th>
                                        <th className="border border-black p-1 w-20" style={{borderColor: "#000000", textAlign: "center", verticalAlign: "middle"}}>Ruang</th>
                                        <th className="border border-black p-1 w-32" style={{borderColor: "#000000", textAlign: "center", verticalAlign: "middle"}}>Dosen</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {courses.map((c, idx) => (
                                        <tr key={idx}>
                                            <td className="border border-black p-1" style={{borderColor: "#000000", textAlign: "center", verticalAlign: "middle"}}>{c.no}</td>
                                            <td className="border border-black p-1" style={{borderColor: "#000000", textAlign: "center", verticalAlign: "middle"}}>{c.code}</td>
                                            <td className="border border-black p-1 font-bold" style={{borderColor: "#000000", textAlign: "center", verticalAlign: "middle"}}>{c.name}</td>
                                            <td className="border border-black p-1" style={{borderColor: "#000000", textAlign: "center", verticalAlign: "middle"}}>{c.credits > 0 ? c.credits : ''}</td>
                                            <td className="border border-black p-1" style={{borderColor: "#000000", textAlign: "center", verticalAlign: "middle"}}>
                                                <div style={{fontSize: "9pt"}}>{c.day}</div>
                                                <div style={{fontSize: "8pt"}}>{c.time}</div>
                                            </td>
                                            <td className="border border-black p-1" style={{borderColor: "#000000", fontSize: "9pt", textAlign: "center", verticalAlign: "middle"}}>{c.venue}</td>
                                            <td className="border border-black p-1 italic" style={{borderColor: "#000000", fontSize: "9pt", textAlign: "center", verticalAlign: "middle"}}>{c.lecturer}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr style={{backgroundColor: "#f3f4f6", fontWeight: "bold"}}>
                                        <td colSpan={3} className="border border-black p-1 uppercase" style={{borderColor: "#000000", textAlign: "right"}}>Total {L.credits}</td>
                                        <td className="border border-black p-1" style={{borderColor: "#000000", textAlign: "center", verticalAlign: "middle"}}>{totalCredits}</td>
                                        <td colSpan={3} className="border border-black" style={{borderColor: "#000000", backgroundColor: "#d1d5db"}}></td>
                                    </tr>
                                </tfoot>
                            </table>

                            {/* Tanda Tangan */}
                            <div className="grid grid-cols-3 gap-4 text-center mt-12" style={{fontSize: "10pt"}}>
                                <div>
                                    <p className="mb-4">{L.studentName}</p>
                                    {/* === AREA TANDA TANGAN MAHASISWA === */}
                                    <div className="h-20 flex items-center justify-center mb-2 relative">

                                    </div>
                                    <p className="font-bold underline uppercase">{studentName}</p>
                                </div>
                                <div>
                                    <p className="mb-16">{L.consultant}</p>
                                    <p className="border-b border-black w-3/4 mx-auto" style={{borderColor: "#000000"}}></p>
                                </div>
                                <div>
                                    <p className="mb-4">{C.officeText}</p>
                                    {/* LOGIKA TANDA TANGAN GAMBAR */}
                                    <div className="h-20 flex items-center justify-center mb-2">
                                        {C.signUrl ? (
                                            <img
                                                src={C.signUrl}
                                                alt="Digital Signature"
                                                className="h-full object-contain"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.parentElement.innerHTML = '<p class="font-bold underline text-red-500">Sign Error</p>';
                                                }}
                                            />
                                        ) : (
                                            <div className="h-16 w-full border-b border-dashed border-gray-400"></div>
                                        )}
                                    </div>
                                    <p className="mb-2" style={{fontSize: "9pt", color: "#666"}}>Dicetak: {generatedAt}</p>
                                    <p className="font-bold underline">Administrator / Registrar</p>
                                </div>
                            </div>

                            <div className="mt-8 text-center italic border-t pt-2" style={{fontSize: "9pt", borderColor: "#e5e7eb", color: "#888"}}>
                                This document is computer generated. No signature is required.
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="h-96 flex flex-col items-center justify-center bg-slate-800 rounded-xl border-2 border-dashed border-slate-700 text-slate-500">
                    <span className="text-5xl mb-4">📄</span>
                    <p>Klik tombol <span className="text-purple-400 font-bold">"Generate Preview"</span> di sebelah kiri.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}

export default App;