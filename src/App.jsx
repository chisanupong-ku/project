import { useState, useEffect } from "react";

// ─── ข้อมูลจำลองในหน่วยความจำ ─────────────────────────────────────────────────
const DEMO_USERS = [
  { id: "1", name: "สมชาย ใจดี", email: "employee@company.com", password: "1234", role: "employee", employeeId: "EMP001", department: "IT" },
  { id: "1", name: "สมชาย ใจร้าย", email: "employee@company.com", password: "1234", role: "employee", employeeId: "EMP002", department: "DATA" },
  { id: "2", name: "สมหญิง ตรวจดี", email: "reviewer@company.com", password: "1234", role: "reviewer", employeeId: "REV001", department: "HR" },
  { id: "3", name: "นายอนุมัติ เก่งมาก", email: "approver@company.com", password: "1234", role: "approver", employeeId: "APR001", department: "Management" },
  { id: "4", name: "นางบัญชี ถูกต้อง", email: "accountant@company.com", password: "1234", role: "accountant", employeeId: "ACC001", department: "Finance" },
];

const INITIAL_BENEFITS = [
  { id: "b1", benefitId: "BEN001", type: "medical", name: "ค่ารักษาพยาบาลประจำปี", description: "ครอบคลุมค่ารักษาพยาบาลทั่วไปและฉุกเฉิน", maxAmount: 30000, icon: "🏥" },
  { id: "b2", benefitId: "BEN002", type: "education", name: "ค่าเล่าเรียนบุตร", description: "สนับสนุนค่าเล่าเรียนบุตรในระดับการศึกษาต่างๆ", maxAmount: 20000, icon: "📚" },
  { id: "b3", benefitId: "BEN003", type: "travel", name: "ท่องเที่ยวประจำปี", description: "งบท่องเที่ยวสำหรับพนักงานและครอบครัว", maxAmount: 15000, icon: "✈️" },
  { id: "b4", benefitId: "BEN004", type: "funeral", name: "ค่าจัดงานศพ", description: "ค่าจัดการงานศพกรณีบุพการีเสียชีวิต", maxAmount: 50000, icon: "🕯️" },
  { id: "b5", benefitId: "BEN005", type: "maternity", name: "คลอดบุตร", description: "ค่าใช้จ่ายในการคลอดบุตร", maxAmount: 25000, icon: "👶" },
  { id: "b5", benefitId: "BEN006", type: "maternity", name: "คลอดบุตร2", description: "ค่าใช้จ่ายในการคลอดบุตร2", maxAmount: 35000, icon: "👶" },
];

const INITIAL_REQUESTS = [
  { id: "r1", employeeId: "EMP001", employeeName: "สมชาย ใจดี", type: "medical", amount: 5000, description: "ค่าหมอฟัน", status: "pending", createdAt: "2025-03-01T10:00:00Z" },
  { id: "r2", employeeId: "EMP001", employeeName: "สมชาย ใจดี", type: "travel", amount: 8000, description: "ท่องเที่ยวครอบครัว", status: "approved", createdAt: "2025-02-15T09:00:00Z" },
  { id: "r3", employeeId: "EMP002", employeeName: "สุดา รักดี", type: "medical", amount: 12000, description: "ค่าผ่าตัด", status: "reviewing", createdAt: "2025-03-05T08:00:00Z" },
  { id: "r4", employeeId: "EMP003", employeeName: "วิชัย เก่งงาน", type: "education", amount: 15000, description: "ค่าเล่าเรียนลูก", status: "reviewed", createdAt: "2025-03-10T11:00:00Z" },
];

// ─── Helper Functions ─────────────────────────────────────────────────────────
function getRoleDisplay(role) {
  return { employee: "พนักงาน", reviewer: "เจ้าหน้าที่ตรวจสอบ", approver: "ผู้อนุมัติ", accountant: "พนักงานบัญชี" }[role] || role;
}

function getTypeName(type) {
  return { medical: "ค่ารักษาพยาบาล", education: "ค่าเล่าเรียนบุตร", travel: "ท่องเที่ยว", funeral: "ค่าจัดงานศพ", maternity: "คลอดบุตร", other: "อื่นๆ" }[type] || type;
}

function genId() {
  return Math.random().toString(36).substring(2, 10);
}

// ─── StatusBadge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = {
    pending: { label: "รอตรวจสอบ", bg: "#fef3c7", color: "#b45309" },
    reviewing: { label: "กำลังตรวจสอบ", bg: "#dbeafe", color: "#1d4ed8" },
    reviewed: { label: "ตรวจสอบแล้ว", bg: "#e0e7ff", color: "#4338ca" },
    approved: { label: "อนุมัติแล้ว", bg: "#d1fae5", color: "#065f46" },
    rejected: { label: "ไม่อนุมัติ", bg: "#fee2e2", color: "#b91c1c" },
    paid: { label: "จ่ายเงินแล้ว", bg: "#e9d5ff", color: "#7e22ce" },
  }[status] || { label: status, bg: "#f3f4f6", color: "#374151" };

  return (
    <span style={{ background: cfg.bg, color: cfg.color, padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>
      {cfg.label}
    </span>
  );
}

// ─── Modal Wrapper ────────────────────────────────────────────────────────────
function Modal({ children, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 24, width: "100%", maxWidth: 460, maxHeight: "90vh", overflowY: "auto", position: "relative" }}>
        {children}
      </div>
    </div>
  );
}

// ─── Input Component ──────────────────────────────────────────────────────────
function Input({ label, value, onChange, placeholder, type = "text", multiline }) {
  const style = { width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit" };
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>{label}</label>
      {multiline
        ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={4} style={{ ...style, resize: "vertical" }} />
        : <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} type={type} style={style} />}
    </div>
  );
}

// ─── Button ───────────────────────────────────────────────────────────────────
function Btn({ children, onClick, color = "#4f46e5", textColor = "#fff", style = {}, small }) {
  return (
    <button onClick={onClick} style={{
      background: color, color: textColor, border: "none", borderRadius: 8,
      padding: small ? "6px 12px" : "10px 16px", fontSize: small ? 13 : 15,
      fontWeight: 600, cursor: "pointer", ...style
    }}>{children}</button>
  );
}

// ─── LoginPage ────────────────────────────────────────────────────────────────
function LoginPage({ users, onLogin, onSwitchToRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!email || !password) return setError("กรุณากรอกอีเมลและรหัสผ่าน");
    const found = users.find(u => u.email === email && u.password === password);
    if (!found) return setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    onLogin(found);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#4f46e5", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ width: 80, height: 80, borderRadius: 20, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, margin: "0 auto 16px" }}>🏢</div>
          <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 700, margin: 0 }}>ระบบสวัสดิการ</h1>
          <p style={{ color: "rgba(255,255,255,0.7)", marginTop: 8 }}>ยินดีต้อนรับเข้าสู่ระบบจัดการสวัสดิการบริษัท</p>
        </div>

        <div style={{ background: "#fff", borderRadius: 16, padding: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, color: "#111827" }}>เข้าสู่ระบบ</h2>
          <Input label="อีเมล" value={email} onChange={setEmail} placeholder="your.email@company.com" type="email" />
          <Input label="รหัสผ่าน" value={password} onChange={setPassword} placeholder="password" type="password" />
          {error && <p style={{ color: "#ef4444", fontSize: 13, margin: "0 0 12px" }}>{error}</p>}
          <Btn onClick={handleSubmit} style={{ width: "100%" }}>เข้าสู่ระบบ</Btn>
          <p style={{ textAlign: "center", marginTop: 12, fontSize: 14, color: "#6b7280" }}>
            ยังไม่มีบัญชี?{" "}
            <span onClick={onSwitchToRegister} style={{ color: "#4f46e5", fontWeight: 600, cursor: "pointer" }}>สมัครสมาชิก</span>
          </p>
        </div>

        <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 12, padding: 16, marginTop: 16 }}>
          <p style={{ color: "#fff", fontWeight: 600, marginBottom: 8 }}>🔑 บัญชีทดสอบ (รหัสผ่าน: 1234):</p>
          {["employee@company.com", "reviewer@company.com", "approver@company.com", "accountant@company.com"].map(e => (
            <p key={e} style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, margin: "2px 0" }}>• {e}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── RegisterPage ─────────────────────────────────────────────────────────────
function RegisterPage({ onRegister, onSwitchToLogin }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", employeeId: "", department: "" });
  const [error, setError] = useState("");

  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.password) return setError("กรุณากรอกข้อมูลที่จำเป็น");
    onRegister({ ...form, id: genId(), role: "employee" });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#635ce7", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ width: 80, height: 80, borderRadius: 20, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, margin: "0 auto 16px" }}>👥</div>
          <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 700, margin: 0 }}>สมัครสมาชิก</h1>
          <p style={{ color: "rgba(255,255,255,0.7)", marginTop: 8 }}>สร้างบัญชีใหม่เพื่อเข้าใช้งานระบบ</p>
        </div>
        <div style={{ background: "#fff", borderRadius: 16, padding: 24 }}>
          <Input label="ชื่อ-นามสกุล" value={form.name} onChange={set("name")} placeholder="สมชาย ใจดี" />
          <Input label="อีเมล" value={form.email} onChange={set("email")} placeholder="your.email@company.com" type="email" />
          <Input label="รหัสผ่าน" value={form.password} onChange={set("password")} placeholder="••••••••" type="password" />
          <Input label="รหัสพนักงาน" value={form.employeeId} onChange={set("employeeId")} placeholder="EMP001" />
          <Input label="แผนก" value={form.department} onChange={set("department")} placeholder="IT Department" />
          {error && <p style={{ color: "#ef4444", fontSize: 13, margin: "0 0 12px" }}>{error}</p>}
          <Btn onClick={handleSubmit} style={{ width: "100%" }}>สมัครสมาชิก</Btn>
          <p style={{ textAlign: "center", marginTop: 12, fontSize: 14, color: "#6b7280" }}>
            มีบัญชีอยู่แล้ว?{" "}
            <span onClick={onSwitchToLogin} style={{ color: "#4f46e5", fontWeight: 600, cursor: "pointer" }}>เข้าสู่ระบบ</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── BenefitCard ──────────────────────────────────────────────────────────────
function BenefitCard({ benefit, onRequest }) {
  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: 16, border: "1px solid #e5e7eb", display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 32 }}>{benefit.icon || "🎁"}</span>
        <span style={{ background: "#eef2ff", color: "#4f46e5", fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 20 }}>{getTypeName(benefit.type)}</span>
      </div>
      <p style={{ fontWeight: 700, fontSize: 15, color: "#111827", margin: 0 }}>{benefit.name}</p>
      <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>{benefit.description || "สวัสดิการสำหรับพนักงาน"}</p>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "#6b7280" }}>วงเงินสูงสุด</span>
        <span style={{ fontWeight: 700, color: "#4f46e5", fontSize: 15 }}>฿{benefit.maxAmount.toLocaleString()}</span>
      </div>
      <Btn onClick={onRequest} small style={{ width: "100%" }}>+ ยื่นคำขอ</Btn>
    </div>
  );
}

// ─── RequestModal ─────────────────────────────────────────────────────────────
function RequestModal({ benefit, currentUser, onClose, onSubmit }) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [docUrl, setDocUrl] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!amount || !description) return setError("กรุณากรอกข้อมูลให้ครบ");
    if (Number(amount) > benefit.maxAmount) return setError(`วงเงินสูงสุดคือ ${benefit.maxAmount.toLocaleString()} บาท`);
    onSubmit({ type: benefit.type, amount: Number(amount), description, document: docUrl });
    onClose();
  };

  return (
    <Modal onClose={onClose}>
      <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 16px", color: "#111827" }}>ยื่นคำขอสวัสดิการ</h2>
      <div style={{ background: "#eef2ff", borderRadius: 8, padding: 12, marginBottom: 16 }}>
        <p style={{ margin: "0 0 4px", fontSize: 14, color: "#374151" }}>ประเภท: <b>{benefit.name}</b></p>
        <p style={{ margin: 0, fontSize: 14, color: "#374151" }}>วงเงินสูงสุด: <b>฿{benefit.maxAmount.toLocaleString()}</b></p>
      </div>
      <Input label="จำนวนเงิน (บาท)" value={amount} onChange={setAmount} placeholder="0.00" type="number" />
      <Input label="รายละเอียด" value={description} onChange={setDescription} placeholder="กรุณาระบุรายละเอียดคำขอ..." multiline />
      <Input label="ลิงก์เอกสาร (ถ้ามี)" value={docUrl} onChange={setDocUrl} placeholder="https://example.com/receipt.jpg" />
      {error && <p style={{ color: "#ef4444", fontSize: 13, margin: "0 0 12px" }}>{error}</p>}
      <div style={{ display: "flex", gap: 8 }}>
        <Btn onClick={onClose} color="#f3f4f6" textColor="#374151" style={{ flex: 1 }}>ยกเลิก</Btn>
        <Btn onClick={handleSubmit} style={{ flex: 1 }}>ยื่นคำขอ</Btn>
      </div>
    </Modal>
  );
}

// ─── CustomRequestModal ───────────────────────────────────────────────────────
function CustomRequestModal({ onClose, onSubmit }) {
  const [benefitName, setBenefitName] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [docUrl, setDocUrl] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!benefitName || !amount || !description) return setError("กรุณากรอกข้อมูลให้ครบ");
    onSubmit({ type: "other", customBenefitName: benefitName, amount: Number(amount), description, document: docUrl });
    onClose();
  };

  return (
    <Modal onClose={onClose}>
      <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 4px", color: "#111827" }}>ขอสวัสดิการพิเศษ</h2>
      <p style={{ color: "#6b7280", fontSize: 13, marginBottom: 16 }}>สำหรับสวัสดิการที่ไม่มีในรายการของบริษัท</p>
      <Input label="ชื่อสวัสดิการที่ต้องการ" value={benefitName} onChange={setBenefitName} placeholder="เช่น ค่าแว่นตา, ค่าตรวจสุขภาพพิเศษ" />
      <Input label="จำนวนเงิน (บาท)" value={amount} onChange={setAmount} placeholder="0.00" type="number" />
      <Input label="รายละเอียด" value={description} onChange={setDescription} placeholder="กรุณาระบุเหตุผลและรายละเอียดคำขอ..." multiline />
      <Input label="ลิงก์เอกสาร (ถ้ามี)" value={docUrl} onChange={setDocUrl} placeholder="https://example.com/receipt.jpg" />
      {error && <p style={{ color: "#ef4444", fontSize: 13, margin: "0 0 12px" }}>{error}</p>}
      <div style={{ display: "flex", gap: 8 }}>
        <Btn onClick={onClose} color="#f3f4f6" textColor="#374151" style={{ flex: 1 }}>ยกเลิก</Btn>
        <Btn onClick={handleSubmit} style={{ flex: 1 }}>ยื่นคำขอ</Btn>
      </div>
    </Modal>
  );
}

// ─── BenefitManageModal ───────────────────────────────────────────────────────
function BenefitManageModal({ benefit, onClose, onSubmit }) {
  const isEdit = !!benefit;
  const [name, setName] = useState(benefit?.name || "");
  const [type, setType] = useState(benefit?.type || "other");
  const [description, setDescription] = useState(benefit?.description || "");
  const [maxAmount, setMaxAmount] = useState(benefit?.maxAmount?.toString() || "");
  const [icon, setIcon] = useState(benefit?.icon || "🎁");
  const [error, setError] = useState("");

  const typeOptions = [
    { value: "medical", label: "ค่ารักษาพยาบาล" }, { value: "education", label: "ค่าเล่าเรียนบุตร" },
    { value: "travel", label: "ท่องเที่ยว" }, { value: "funeral", label: "ค่าจัดงานศพ" },
    { value: "maternity", label: "คลอดบุตร" }, { value: "other", label: "อื่นๆ" },
  ];

  const handleSubmit = () => {
    if (!name || !maxAmount) return setError("กรุณากรอกชื่อและวงเงินสูงสุด");
    onSubmit({ id: benefit?.id || genId(), benefitId: benefit?.benefitId || `BEN${genId()}`, name, type, description, maxAmount: Number(maxAmount), icon });
    onClose();
  };

  return (
    <Modal onClose={onClose}>
      <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 16px", color: "#111827" }}>{isEdit ? "แก้ไขสวัสดิการ" : "เพิ่มสวัสดิการใหม่"}</h2>
      <Input label="ชื่อสวัสดิการ" value={name} onChange={setName} placeholder="เช่น ค่ารักษาพยาบาลประจำปี" />
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>ประเภท</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {typeOptions.map(opt => (
            <button key={opt.value} onClick={() => setType(opt.value)}
              style={{ padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "1px solid", borderColor: type === opt.value ? "#4f46e5" : "#e5e7eb", background: type === opt.value ? "#eef2ff" : "#f3f4f6", color: type === opt.value ? "#4f46e5" : "#374151" }}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <Input label="วงเงินสูงสุด (บาท)" value={maxAmount} onChange={setMaxAmount} placeholder="10000" type="number" />
      <Input label="รายละเอียด" value={description} onChange={setDescription} placeholder="รายละเอียดสวัสดิการ..." multiline />
      <Input label="ไอคอน (Emoji)" value={icon} onChange={setIcon} placeholder="🎁" />
      {error && <p style={{ color: "#ef4444", fontSize: 13, margin: "0 0 12px" }}>{error}</p>}
      <div style={{ display: "flex", gap: 8 }}>
        <Btn onClick={onClose} color="#f3f4f6" textColor="#374151" style={{ flex: 1 }}>ยกเลิก</Btn>
        <Btn onClick={handleSubmit} style={{ flex: 1 }}>{isEdit ? "บันทึก" : "เพิ่มสวัสดิการ"}</Btn>
      </div>
    </Modal>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
function StatCard({ icon, value, label, bg }) {
  return (
    <div style={{ background: bg, borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 80, flex: 1 }}>
      <span style={{ fontSize: 24 }}>{icon}</span>
      <span style={{ fontWeight: 700, fontSize: 18, color: "#111827" }}>{value}</span>
      <span style={{ fontSize: 12, color: "#6b7280", textAlign: "center" }}>{label}</span>
    </div>
  );
}

// ─── Tab Bar ──────────────────────────────────────────────────────────────────
function TabBar({ tabs, active, onChange }) {
  return (
    <div style={{ display: "flex", background: "#f3f4f6", borderRadius: 10, padding: 4, marginBottom: 16, gap: 4 }}>
      {tabs.map(t => (
        <button key={t.key} onClick={() => onChange(t.key)}
          style={{ flex: 1, padding: "8px 4px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, background: active === t.key ? "#fff" : "transparent", color: active === t.key ? "#4f46e5" : "#6b7280", boxShadow: active === t.key ? "0 1px 4px rgba(0,0,0,0.1)" : "none" }}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ─── EmployeeDashboard ────────────────────────────────────────────────────────
function EmployeeDashboard({ currentUser, benefits, requests, onAddRequest }) {
  const [tab, setTab] = useState("benefits");
  const [requestModal, setRequestModal] = useState(null);
  const [showCustomModal, setShowCustomModal] = useState(false);

  const myRequests = requests.filter(r => r.employeeId === currentUser.employeeId);
  const pending = myRequests.filter(r => ["pending", "reviewing"].includes(r.status)).length;
  const approved = myRequests.filter(r => r.status === "approved").length;

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <StatCard icon="📄" value={myRequests.length} label="คำขอทั้งหมด" bg="#dbeafe" />
        <StatCard icon="⏰" value={pending} label="รอดำเนินการ" bg="#fef3c7" />
        <StatCard icon="✅" value={approved} label="อนุมัติแล้ว" bg="#d1fae5" />
      </div>

      <TabBar tabs={[{ key: "benefits", label: "สวัสดิการที่มี" }, { key: "requests", label: "คำขอของฉัน" }]} active={tab} onChange={setTab} />

      {tab === "benefits" && (
        <div>
          <button onClick={() => setShowCustomModal(true)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#eef2ff", border: "1px solid #c7d2fe", borderRadius: 12, padding: "12px 16px", cursor: "pointer", marginBottom: 12 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8, color: "#4f46e5", fontWeight: 600 }}>➕ ขอสวัสดิการที่ไม่มีในรายการ</span>
            <span style={{ color: "#4f46e5" }}>›</span>
          </button>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
            {benefits.map(b => <BenefitCard key={b.id} benefit={b} onRequest={() => setRequestModal(b)} />)}
          </div>
        </div>
      )}

      {tab === "requests" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {myRequests.length === 0 && <p style={{ color: "#6b7280", textAlign: "center", padding: 24 }}>ยังไม่มีคำขอ</p>}
          {myRequests.map(r => (
            <div key={r.id} style={{ background: "#fff", borderRadius: 12, padding: 14, border: "1px solid #e5e7eb" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontWeight: 600, fontSize: 15 }}>{r.customBenefitName ? `${r.customBenefitName} (พิเศษ)` : getTypeName(r.type)}</span>
                <StatusBadge status={r.status} />
              </div>
              <p style={{ color: "#6b7280", fontSize: 13, margin: "0 0 8px" }}>{r.description}</p>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 700, color: "#111827" }}>฿{r.amount.toLocaleString()}</span>
                <span style={{ fontSize: 12, color: "#9ca3af" }}>{new Date(r.createdAt).toLocaleDateString("th-TH")}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {requestModal && (
        <RequestModal benefit={requestModal} currentUser={currentUser} onClose={() => setRequestModal(null)}
          onSubmit={(data) => onAddRequest({ ...data, employeeId: currentUser.employeeId, employeeName: currentUser.name })} />
      )}
      {showCustomModal && (
        <CustomRequestModal onClose={() => setShowCustomModal(false)}
          onSubmit={(data) => onAddRequest({ ...data, employeeId: currentUser.employeeId, employeeName: currentUser.name })} />
      )}
    </div>
  );
}

// ─── ReviewerDashboard ────────────────────────────────────────────────────────
function ReviewerDashboard({ requests, onStatusChange }) {
  const [filter, setFilter] = useState("pending");

  const filtered = requests.filter(r => filter === "all" ? ["pending", "reviewing"].includes(r.status) : r.status === filter);
  const pendingCount = requests.filter(r => r.status === "pending").length;
  const reviewingCount = requests.filter(r => r.status === "reviewing").length;
  const approvedCount = requests.filter(r => r.status === "reviewed").length;

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <StatCard icon="📄" value={pendingCount} label="รอตรวจสอบ" bg="#fef3c7" />
        <StatCard icon="👁️" value={reviewingCount} label="กำลังตรวจสอบ" bg="#dbeafe" />
        <StatCard icon="✅" value={approvedCount} label="ส่งต่อแล้ว" bg="#d1fae5" />
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {[["all", "ทั้งหมด", "#f3f4f6", "#374151"], ["pending", "รอตรวจสอบ", "#fef3c7", "#b45309"], ["reviewing", "กำลังตรวจสอบ", "#dbeafe", "#1d4ed8"]].map(([k, l, bg, c]) => (
          <button key={k} onClick={() => setFilter(k)}
            style={{ padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13, background: filter === k ? bg : "#f3f4f6", color: filter === k ? c : "#6b7280" }}>
            {l}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map(r => (
          <div key={r.id} style={{ background: "#fff", borderRadius: 12, padding: 14, border: "1px solid #e5e7eb" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <div>
                <p style={{ fontWeight: 600, margin: 0 }}>{r.employeeName}</p>
                <p style={{ color: "#6b7280", fontSize: 12, margin: 0 }}>{r.employeeId}</p>
              </div>
              <StatusBadge status={r.status} />
            </div>
            <p style={{ fontWeight: 600, fontSize: 14, margin: "4px 0" }}>{r.customBenefitName ? `${r.customBenefitName} (พิเศษ)` : getTypeName(r.type)}</p>
            <p style={{ color: "#6b7280", fontSize: 13, margin: "0 0 8px" }}>{r.description}</p>
            <p style={{ fontWeight: 700 }}>฿{r.amount.toLocaleString()}</p>
            <div style={{ display: "flex", gap: 8 }}>
              {r.status === "pending" && <Btn onClick={() => onStatusChange(r.id, "reviewing")} color="#3b82f6" small style={{ flex: 1 }}>รับตรวจ</Btn>}
              {r.status === "reviewing" && <>
                <Btn onClick={() => onStatusChange(r.id, "rejected")} color="#ef4444" small style={{ flex: 1 }}>ไม่ผ่าน</Btn>
                <Btn onClick={() => onStatusChange(r.id, "reviewed")} color="#10b981" small style={{ flex: 1 }}>ส่งต่อ</Btn>
              </>}
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p style={{ color: "#6b7280", textAlign: "center", padding: 24 }}>ไม่มีรายการ</p>}
      </div>
    </div>
  );
}

// ─── ApproverDashboard ────────────────────────────────────────────────────────
function ApproverDashboard({ requests, onStatusChange }) {
  const visible = requests.filter(r => ["reviewed", "approved", "rejected"].includes(r.status));
  const pendingCount = requests.filter(r => r.status === "reviewed").length;
  const approvedCount = requests.filter(r => r.status === "approved").length;
  const rejectedCount = requests.filter(r => r.status === "rejected").length;
  const totalAmount = requests.filter(r => r.status === "approved").reduce((s, r) => s + r.amount, 0);

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <StatCard icon="📄" value={pendingCount} label="รออนุมัติ" bg="#fef3c7" />
        <StatCard icon="✅" value={approvedCount} label="อนุมัติแล้ว" bg="#d1fae5" />
        <StatCard icon="❌" value={rejectedCount} label="ไม่อนุมัติ" bg="#fee2e2" />
      </div>
      <div style={{ background: "#dbeafe", borderRadius: 12, padding: 14, display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 24 }}>💰</span>
        <div>
          <p style={{ fontWeight: 700, fontSize: 18, margin: 0 }}>฿{totalAmount.toLocaleString()}</p>
          <p style={{ color: "#6b7280", fontSize: 12, margin: 0 }}>มูลค่ารวมที่อนุมัติ</p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {visible.map(r => (
          <div key={r.id} style={{ background: "#fff", borderRadius: 12, padding: 14, border: "1px solid #e5e7eb" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <div>
                <p style={{ fontWeight: 600, margin: 0 }}>{r.employeeName}</p>
                <p style={{ color: "#6b7280", fontSize: 12, margin: 0 }}>{r.employeeId}</p>
              </div>
              <StatusBadge status={r.status} />
            </div>
            <p style={{ fontWeight: 600, fontSize: 14, margin: "4px 0" }}>{r.customBenefitName ? `${r.customBenefitName} (พิเศษ)` : getTypeName(r.type)}</p>
            <p style={{ color: "#6b7280", fontSize: 13, margin: "0 0 8px" }}>{r.description}</p>
            <p style={{ fontWeight: 700, marginBottom: 8 }}>฿{r.amount.toLocaleString()}</p>
            {r.status === "reviewed" && (
              <div style={{ display: "flex", gap: 8 }}>
                <Btn onClick={() => onStatusChange(r.id, "rejected")} color="#ef4444" small style={{ flex: 1 }}>ไม่อนุมัติ</Btn>
                <Btn onClick={() => { if (window.confirm("ยืนยันอนุมัติคำขอนี้?")) onStatusChange(r.id, "approved"); }} color="#10b981" small style={{ flex: 1 }}>อนุมัติ</Btn>
              </div>
            )}
          </div>
        ))}
        {visible.length === 0 && <p style={{ color: "#6b7280", textAlign: "center", padding: 24 }}>ไม่มีรายการ</p>}
      </div>
    </div>
  );
}

// ─── AccountantDashboard ──────────────────────────────────────────────────────
function AccountantDashboard({ requests, benefits, onStatusChange, onBenefitSave, onBenefitDelete }) {
  const [tab, setTab] = useState("budget");
  const [showBenefitModal, setShowBenefitModal] = useState(false);
  const [editingBenefit, setEditingBenefit] = useState(null);

  const budgetData = benefits.map(b => {
    const used = requests.filter(r => r.type === b.type && ["approved", "paid"].includes(r.status)).reduce((s, r) => s + r.amount, 0);
    const total = b.maxAmount * 10;
    return { ...b, used, total, remaining: total - used, percentage: (used / total) * 100 };
  });

  const totalBudget = budgetData.reduce((s, b) => s + b.total, 0);
  const totalUsed = budgetData.reduce((s, b) => s + b.used, 0);
  const totalPaid = requests.filter(r => r.status === "approved").reduce((s, r) => s + r.amount, 0);

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <StatCard icon="💵" value={`฿${totalBudget.toLocaleString()}`} label="งบทั้งหมด" bg="#dbeafe" />
        <StatCard icon="📈" value={`฿${totalUsed.toLocaleString()}`} label="ใช้ไปแล้ว" bg="#d1fae5" />
        <StatCard icon="✅" value={`฿${totalPaid.toLocaleString()}`} label="จ่ายแล้ว" bg="#e9d5ff" />
      </div>
      <div style={{ background: "#fef3c7", borderRadius: 12, padding: 14, display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 24 }}>📋</span>
        <div><p style={{ fontWeight: 700, fontSize: 18, margin: 0 }}>{requests.length}</p><p style={{ color: "#6b7280", fontSize: 12, margin: 0 }}>คำขอทั้งหมด</p></div>
      </div>

      <TabBar tabs={[{ key: "budget", label: "งบประมาณ" }, { key: "benefits", label: "จัดการสวัสดิการ" }, { key: "transactions", label: "รายการ" }]} active={tab} onChange={setTab} />

      {tab === "budget" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {budgetData.map((b, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: 12, padding: 14, border: "1px solid #e5e7eb" }}>
              <p style={{ fontWeight: 700, marginBottom: 8 }}>{b.name}</p>
              {[["งบทั้งหมด", `฿${b.total.toLocaleString()}`, "#111827"], ["ใช้ไป", `฿${b.used.toLocaleString()}`, "#3b82f6"], ["คงเหลือ", `฿${b.remaining.toLocaleString()}`, "#10b981"]].map(([l, v, c]) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 13, color: "#6b7280" }}>{l}:</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: c }}>{v}</span>
                </div>
              ))}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                <div style={{ flex: 1, height: 8, background: "#e5e7eb", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ width: `${Math.min(b.percentage, 100)}%`, height: "100%", background: b.percentage > 80 ? "#ef4444" : b.percentage > 60 ? "#f59e0b" : "#10b981", borderRadius: 4 }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#374151", width: 42 }}>{b.percentage.toFixed(1)}%</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "benefits" && (
        <div>
          <Btn onClick={() => { setEditingBenefit(null); setShowBenefitModal(true); }} style={{ width: "100%", marginBottom: 12 }}>➕ เพิ่มสวัสดิการใหม่</Btn>
          {benefits.map(b => (
            <div key={b.id} style={{ background: "#fff", borderRadius: 12, padding: 14, border: "1px solid #e5e7eb", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 28 }}>{b.icon || "🎁"}</span>
                <div>
                  <p style={{ fontWeight: 700, margin: 0 }}>{b.name}</p>
                  <p style={{ color: "#6b7280", fontSize: 12, margin: 0 }}>{getTypeName(b.type)}</p>
                </div>
              </div>
              {b.description && <p style={{ color: "#6b7280", fontSize: 13, marginBottom: 8 }}>{b.description}</p>}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 13, color: "#6b7280" }}>วงเงินสูงสุด:</span>
                <span style={{ fontWeight: 700, color: "#4f46e5" }}>฿{b.maxAmount.toLocaleString()}</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Btn onClick={() => { setEditingBenefit(b); setShowBenefitModal(true); }} color="#f59e0b" small style={{ flex: 1 }}>✏️ แก้ไข</Btn>
                <Btn onClick={() => { if (window.confirm(`ต้องการลบ "${b.name}" ใช่หรือไม่?`)) onBenefitDelete(b.id); }} color="#ef4444" small style={{ flex: 1 }}>🗑️ ลบ</Btn>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "transactions" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {requests.slice(0, 10).map(r => (
            <div key={r.id} style={{ background: "#fff", borderRadius: 12, padding: 14, border: "1px solid #e5e7eb" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <div>
                  <p style={{ fontWeight: 600, margin: 0 }}>{r.employeeName}</p>
                  <p style={{ color: "#6b7280", fontSize: 12, margin: 0 }}>{r.employeeId}</p>
                </div>
                <StatusBadge status={r.status} />
              </div>
              <p style={{ fontSize: 14, margin: "0 0 8px" }}>{r.customBenefitName ? `${r.customBenefitName} (พิเศษ)` : getTypeName(r.type)}</p>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 700 }}>฿{r.amount.toLocaleString()}</span>
                <span style={{ fontSize: 12, color: "#9ca3af" }}>{new Date(r.createdAt).toLocaleDateString("th-TH")}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showBenefitModal && (
        <BenefitManageModal benefit={editingBenefit} onClose={() => { setShowBenefitModal(false); setEditingBenefit(null); }} onSubmit={onBenefitSave} />
      )}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [users, setUsers] = useState(DEMO_USERS);
  const [benefits, setBenefits] = useState(INITIAL_BENEFITS);
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [currentUser, setCurrentUser] = useState(null);
  const [view, setView] = useState("login");

  const handleLogin = (user) => setCurrentUser(user);

  const handleRegister = (data) => {
    setUsers(prev => [...prev, data]);
    alert("ลงทะเบียนสำเร็จ! กรุณาเข้าสู่ระบบ");
    setView("login");
  };

  const handleLogout = () => { setCurrentUser(null); setView("login"); };

  const handleAddRequest = (data) => {
    setRequests(prev => [...prev, { id: genId(), ...data, status: "pending", createdAt: new Date().toISOString() }]);
  };

  const handleStatusChange = (id, newStatus) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
  };

  const handleBenefitSave = (data) => {
    setBenefits(prev => {
      const exists = prev.find(b => b.id === data.id);
      return exists ? prev.map(b => b.id === data.id ? data : b) : [...prev, data];
    });
  };

  const handleBenefitDelete = (id) => {
    setBenefits(prev => prev.filter(b => b.id !== id));
  };

  if (!currentUser) {
    return view === "login"
      ? <LoginPage users={users} onLogin={handleLogin} onSwitchToRegister={() => setView("register")} />
      : <RegisterPage onRegister={handleRegister} onSwitchToLogin={() => setView("login")} />;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", fontFamily: "'Sarabun', 'Noto Sans Thai', sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#fff", padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e5e7eb", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "#4f46e5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🏢</div>
          <div>
            <p style={{ fontWeight: 700, fontSize: 16, margin: 0, color: "#111827" }}>ระบบสวัสดิการบริษัท</p>
            <p style={{ fontSize: 11, color: "#6b7280", margin: 0 }}>Welfare Management</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontWeight: 600, fontSize: 14, margin: 0, color: "#111827" }}>{currentUser.name}</p>
            <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>{getRoleDisplay(currentUser.role)}</p>
          </div>
          <button onClick={handleLogout} style={{ background: "#fee2e2", color: "#ef4444", border: "none", borderRadius: 8, padding: "8px 12px", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>ออกจากระบบ</button>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: 20 }}>
        {currentUser.role === "employee" && <EmployeeDashboard currentUser={currentUser} benefits={benefits} requests={requests} onAddRequest={handleAddRequest} />}
        {currentUser.role === "reviewer" && <ReviewerDashboard requests={requests} onStatusChange={handleStatusChange} />}
        {currentUser.role === "approver" && <ApproverDashboard requests={requests} onStatusChange={handleStatusChange} />}
        {currentUser.role === "accountant" && <AccountantDashboard requests={requests} benefits={benefits} onStatusChange={handleStatusChange} onBenefitSave={handleBenefitSave} onBenefitDelete={handleBenefitDelete} />}
      </div>
    </div>
  );
}
