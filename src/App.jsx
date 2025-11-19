import { useState, useRef, useEffect } from "react";
import html2pdf from "html2pdf.js";
// Import Faker untuk Indonesia dan Inggris (Internasional)
import { fakerID_ID, fakerEN } from "@faker-js/faker";

// =========================================
// 1. DATA & CONFIG
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

const PRESETS = {
  RAHARJA: {
    id: "RAHARJA",
    logoUrl: "/logo-raharja.png",
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
  }
};

// --- Utils ---
const DAY_LIST = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];
const TIME_LIST = ["08:00 - 10:00", "10:00 - 12:00", "13:00 - 15:00", "15:30 - 17:30", "18:30 - 20:30"];
const VENUE_LIST_RAHARJA = ["Lab iLearning", "R. L201", "R. M303", "Grand Max Theatre", "Lab Jaringan"];
const VENUE_LIST_IIUM = ["KICT Lab 1", "KICT LR 2", "Main Hall", "Auditorium"];

function getRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// Helper untuk Generate Nama pakai Faker
function generateFakerName(preset) {
  if (preset === "RAHARJA") {
    // Nama Indonesia (Jawa/Sunda/Umum tercampur di locale ID)
    return fakerID_ID.person.fullName();
  } else {
    // Untuk IIUM, kita coba mix biar kayak nama Melayu/Inter
    // Kadang fakerEN terlalu "John Doe", jadi kita bisa custom dikit
    const isMalay = Math.random() > 0.3; // 70% kemungkinan nama Melayu style
    if (isMalay) {
      const gender = Math.random() > 0.5 ? 'male' : 'female';
      const first = fakerID_ID.person.firstName(gender); // Pake ID firstname biar agak melayu
      const father = fakerID_ID.person.firstName('male');
      const bin = gender === 'male' ? 'bin' : 'binti';
      return `${first} ${bin} ${father}`;
    }
    return fakerEN.person.fullName(); // 30% nama International
  }
}

// === COMPONENT: INPUT DENGAN COPY BUTTON ===
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

  const [courses, setCourses] = useState([]);
  const [totalCredits, setTotalCredits] = useState(0);
  const [generatedAt, setGeneratedAt] = useState("");
  const [shown, setShown] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const slipRef = useRef(null);

  // === INIT ===
  useEffect(() => {
    const config = PRESETS[activePreset];
    setUniName(config.uniName);
    setSemesterText(getDynamicSemester(activePreset));
    
    // Reset fields to default
    setFaculty(config.defaultData.faculty);
    setDepartment(config.defaultData.dept);
    setLevel(config.defaultData.level);
    setSection(config.defaultData.section);
    setMatricNo("");
    setStudentName("");
    setEmail("");
    setPhone("");
    setShown(false);
  }, [activePreset]);

  // === LOGIC TAHUN AJARAN ===
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

    return presetType === 'RAHARJA' 
      ? `Semester ${semesterLabel} T.A. ${acadYear}` 
      : `Semester ${semesterLabel}, Session ${acadYear}`;
  }

  // === AUTO FILL + LOGIKA EMAIL ===
  const handleAutoFillStudent = () => {
    const isRaharja = activePreset === "RAHARJA";
    
    // 1. Generate Nama pakai Faker
    const name = generateFakerName(activePreset);
    
    // 2. Generate NIM/Matric (Tahun + Random)
    const year = new Date().getFullYear().toString().slice(-2);
    const randomId = Math.floor(Math.random() * 90000 + 10000);
    const id = year + "1" + randomId;

    // 3. Generate Phone
    const ph = isRaharja ? "08" + Math.floor(Math.random() * 100000000) : "01" + Math.floor(Math.random() * 100000000);

    // 4. Generate Email (Username based on name + ID suffix)
    // Bersihkan nama untuk jadi slug email
    const slug = name.split(" ")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
    const idSuffix = id.slice(-4); 
    const emailDomain = PRESETS[activePreset].emailSuffix;
    const finalEmail = `${slug}${idSuffix}${emailDomain}`;

    setStudentName(name);
    setMatricNo(id);
    setPhone(ph);
    setEmail(finalEmail);
  };

  const handleGenerateSlip = () => {
    if (!studentName) handleAutoFillStudent();

    const isRaharja = activePreset === "RAHARJA";
    const courseSource = isRaharja ? COURSES_RAHARJA : COURSES_IIUM;
    const venueSource = isRaharja ? VENUE_LIST_RAHARJA : VENUE_LIST_IIUM;

    const shuffled = [...courseSource].sort(() => Math.random() - 0.5);
    const selectedCourses = [];
    let creditSum = 0;
    let no = 1;

    for (let c of shuffled) {
        const day = getRandom(DAY_LIST);
        const time = getRandom(TIME_LIST);
        const venue = getRandom(venueSource);
        const docTitles = isRaharja ? ["Ir.", "Dr.", "Bpk.", "Ibu"] : ["Dr.", "Prof."];
        
        // Generate Nama Dosen pakai Faker juga
        const randomLecturerName = generateFakerName(activePreset);
        const lecturerName = `${getRandom(docTitles)} ${randomLecturerName}`;

        selectedCourses.push({
            no: no++,
            code: c.code,
            name: c.name,
            credits: c.credits,
            section: isRaharja ? "Kls-A" : "S1",
            day, time, venue, lecturer: lecturerName
        });
        creditSum += c.credits;

        if (c.hasLab) {
             selectedCourses.push({
                no: "",
                code: "",
                name: `${c.name} (Lab/Praktikum)`,
                credits: 0,
                section: "-",
                day: getRandom(DAY_LIST),
                time: getRandom(TIME_LIST),
                venue: "Lab Komputer",
                lecturer: "-"
             });
        }

        if (creditSum >= 18 && selectedCourses.length > 5) break; 
    }

    setCourses(selectedCourses);
    setTotalCredits(creditSum);

    const locale = isRaharja ? "id-ID" : "en-MY";
    setGeneratedAt(new Date().toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" }));
    setShown(true);
  };

  // === DOWNLOAD FUNCTION ===
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
      
      {/* SWITCHER */}
      <div className="max-w-5xl mx-auto mb-8 flex justify-center gap-4">
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
                {key === "RAHARJA" ? "🏢 Raharja (Indonesia)" : "🕌 IIUM (Malaysia)"}
            </button>
        ))}
      </div>

      <div className="max-w-6xl mx-auto grid md:grid-cols-12 gap-6">
        
        {/* === INPUT FORM === */}
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
                </div>

                <button 
                    onClick={handleGenerateSlip}
                    className="w-full mt-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-3 rounded-lg shadow-lg transition transform hover:scale-[1.02]"
                >
                    ⚡ Generate Preview
                </button>
            </div>
        </div>

        {/* === PREVIEW === */}
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
                                        height: "70px", 
                                        width: "auto" 
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
                                    <p className="mb-16">{L.studentName}</p>
                                    <p className="font-bold underline uppercase">{studentName}</p>
                                </div>
                                <div>
                                    <p className="mb-16">{L.consultant}</p>
                                    <p className="border-b border-black w-3/4 mx-auto" style={{borderColor: "#000000"}}></p>
                                </div>
                                <div>
                                    <p className="mb-2">{C.officeText}</p>
                                    <p className="mb-12" style={{fontSize: "9pt", color: "#666"}}>Dicetak: {generatedAt}</p>
                                    <p className="font-bold underline">Administrator</p>
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