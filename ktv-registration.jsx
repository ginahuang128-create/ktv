import { useState, useEffect, useRef } from "react";

// ── 串接 Google Sheets：妳的專屬 Apps Script 網址 ──
const GOOGLE_SCRIPT_URL = "https://script.googleusercontent.com/macros/echo?user_content_key=AUkAhnQE5vH_gJAPbdkdo9JOO_kfyXO4WewLop6Poaml4sznndZbHFvj5zYoILNXBl2O1bzbEjckb0oGR7WXIKF2_uqgBetna48bjyFfxRJkxGaiAAS32uk7_zcYPdngcD1e1SkhihsXjR2ijdg82gReM-EmsZwS6OJVwjiUi0K1DrS2-zDsSJ9qLmC_0qpIofA1LuqBGFYXo8vCGAcPdkXUx7Lk50OzLmYRfacvpxm07H9-0ccr0WK7LsAEkRV28JIBQSe1BEdBQD0tgtxcRtgEVj3ZbPvc5Q&lib=M6GsPgIN7jgZR3fYc4YHLsDrq_XfHy2fD";

// ── 背景海報預設圖（防編譯錯誤留空，可自由填入圖片 URL） ──
const POSTER = "https://i.meee.com.tw/K4mrP8o.jpg";

export default function KtvRegistration() {
  const [formData, setFormData] = useState({
    name: "",          // 對應 怎麼稱呼妳
    email: "",         // 對應 mail
    instagram: "",     // 對應 Instagram ID
    remittance: "",    // 對應 匯款後五碼
    note: "",          // 對應 備註說明
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const canvasRef = useRef(null);

  // 動態繪製霓虹背景效果
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const particles = [];
    for (let i = 0; i < 25; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 1,
        color: Math.random() > 0.5 ? "rgba(255, 0, 128, 0.3)" : "rgba(0, 233, 255, 0.2)",
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fill();
      });
      ctx.shadowBlur = 0;
      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [submitted]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMsg("請填寫您的稱呼唷！");
      return;
    }
    if (!formData.email.trim()) {
      setErrorMsg("請填寫您的 mail，方便後續聯絡。");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    // 格式對齊後端 Google Sheets 欄位名稱
    const payload = {
      "怎麼稱呼妳": formData.name,
      "mail": formData.email,
      "Instagram ID": formData.instagram,
      "匯款後五碼": formData.remittance,
      "備註說明": formData.note,
    };

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors", 
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setErrorMsg("糟糕，連線好像有點問題，請稍後再試。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <canvas ref={canvasRef} style={styles.backgroundCanvas} />

      <div style={styles.card}>
        {/* 上方視覺海報區 */}
        <div style={styles.posterArea}>
          {POSTER ? (
            <img src={POSTER} alt="KTV Poster" style={styles.posterImage} />
          ) : (
            <div style={styles.posterFallback}>
              <div style={styles.neonTextLarge}>🎤 KTV PARTY 🎶</div>
              <div style={styles.neonTextSub}>歡樂開唱 ‧ 預約報名表</div>
            </div>
          )}
          <div style={styles.posterOverlay} />
        </div>

        {/* 表單主體區 */}
        {!submitted ? (
          <form onSubmit={handleSubmit} style={styles.formBody}>
            <div style={styles.introSection}>
              <p style={styles.introText}>
                歡迎來到 KTV 歡樂對唱派對！🎉<br />
                請填寫以下報名與匯款資料以方便統計人數唷！
              </p>
              <div style={styles.divider}>
                <span style={styles.dividerLabel}>REGISTRATION FORM</span>
              </div>
            </div>

            {/* 怎麼稱呼妳 */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>怎麼稱呼妳 / 你 <span style={{ color: "#ff4081" }}>*</span></label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="怎麼稱呼妳/你呢？"
                style={styles.input}
                disabled={loading}
              />
            </div>

            {/* mail */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>mail <span style={{ color: "#ff4081" }}>*</span></label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@gmail.com"
                style={styles.input}
                disabled={loading}
              />
            </div>

            {/* Instagram ID */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Instagram ID</label>
              <input
                type="text"
                name="instagram"
                value={formData.instagram}
                onChange={handleChange}
                placeholder="例如：instagram_id"
                style={styles.input}
                disabled={loading}
              />
            </div>

            {/* 匯款後五碼 */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>匯款後五碼</label>
              <input
                type="text"
                name="remittance"
                value={formData.remittance}
                onChange={handleChange}
                placeholder="請輸入轉帳帳號後五碼"
                style={styles.input}
                disabled={loading}
              />
            </div>

            {/* 備註說明 */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>備註說明</label>
              <textarea
                name="note"
                value={formData.note}
                onChange={handleChange}
                placeholder="有什麼想對主辦人說的話，或者特殊忌口都可以寫在這裡唷！"
                style={styles.textarea}
                disabled={loading}
              />
            </div>

            {errorMsg && <div style={styles.errorContainer}>{errorMsg}</div>}

            {/* 提交按鈕 */}
            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.button,
                ...(loading ? styles.buttonDisabled : {}),
              }}
            >
              {loading ? "傳送中，請稍候..." : "確認送出報名 🎤"}
            </button>
          </form>
        ) : (
          /* 提交成功畫面 */
          <div style={styles.successBody}>
            <div style={styles.successIcon}>✨</div>
            <h2 style={styles.successTitle}>報名成功！</h2>
            <p style={styles.successText}>
              太棒了，已經收到您的報名與匯款資料囉！<br />
              主辦人會盡快核對並與您聯絡。<br />
              期待當天與您一起飆歌狂歡 🎶
            </p>
            <div style={styles.successCardSummary}>
              <div style={styles.summaryRow}>
                <span style={styles.summaryLabel}>報名暱稱：</span>
                <span style={styles.summaryValue}>{formData.name}</span>
              </div>
              <div style={styles.summaryRow}>
                <span style={styles.summaryLabel}>聯絡信箱：</span>
                <span style={styles.summaryValue}>{formData.email}</span>
              </div>
            </div>
            <button
              onClick={() => setSubmitted(false)}
              style={styles.backButton}
            >
              修改資料 / 填寫下一張
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── 奢華賽博微醺霓虹風 樣式表 ──
const styles = {
  container: {
    minHeight: "100vh",
    background: "#0c0714", 
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px 12px",
    fontFamily: "'Noto Serif TC', serif",
    position: "relative",
    overflow: "hidden",
  },
  backgroundCanvas: {
    position: "absolute",
    top: 0, left: 0, width: "100%", height: "100%",
    zIndex: 1, pointerEvents: "none",
  },
 card: {
    width: "100%",
    maxWidth: "460px",
    background: "rgba(25, 15, 38, 0.75)",
    backdropFilter: "blur(20px)",
    borderRadius: "24px",
    boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5), inset 0 0 2px rgba(255, 200, 230, 0.2), 0 0 30px rgba(255, 0, 128, 0.05)",
    border: "1px solid rgba(255, 160, 200, 0.12)",
    zIndex: 2,
    overflow: "hidden",
  },
  posterArea: {
    width: "100%",
    height: "180px",
    position: "relative",
    background: "linear-gradient(135deg, #2a0845 0%, #6441a5 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  posterImage: {
    width: "100%", height: "100%", objectFit: "cover",
  },
  posterOverlay: {
    position: "absolute",
    bottom: 0, left: 0, right: 0,
    height: "60px",
    background: "linear-gradient(to top, rgba(25, 15, 38, 1), rgba(25, 15, 38, 0))",
  },
  posterFallback: {
    textAlign: "center",
    padding: "0 20px",
  },
  neonTextLarge: {
    fontSize: "26px",
    fontWeight: "bold",
    color: "#fff",
    textShadow: "0 0 6px #fff, 0 0 15px #ff007f, 0 0 30px #ff007f",
    letterSpacing: "2px",
    marginBottom: "8px",
  },
  neonTextSub: {
    fontSize: "13px",
    color: "#00efff",
    textShadow: "0 0 4px #00efff, 0 0 10px #00efff",
    letterSpacing: "4px",
  },
  introSection: {
    textAlign: "center",
    marginTop: "4px",
  },
  introText: {
    fontSize: "13.5px",
    color: "rgba(255, 220, 235, 0.75)",
    lineHeight: "1.6",
    margin: 0,
  },
  divider: {
    margin: "24px 0 12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    height: "1px",
    background: "linear-gradient(to right, transparent, rgba(255,160,200,0.2), transparent)",
  },
  dividerLabel: {
    fontSize: "11px",
    color: "rgba(255,180,210,0.5)",
    letterSpacing: "3px",
    whiteSpace: "nowrap",
    background: "#1c1129",
    padding: "0 12px",
    borderRadius: "10px",
    position: "absolute",
    border: "1px solid rgba(255,160,200,0.1)",
  },
  formBody: {
    padding: "16px 28px 36px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "12.5px",
    color: "rgba(255,190,220,0.85)",
    letterSpacing: "0.5px",
    fontWeight: "500",
  },
  input: {
    background: "rgba(255,200,230,0.05)",
    border: "1px solid rgba(255,160,200,0.2)",
    borderRadius: "12px",
    color: "#ffd0e8",
    fontSize: "14.5px",
    padding: "12px 16px",
    outline: "none",
    fontFamily: "inherit",
    width: "100%",
    boxSizing: "border-box",
  },
  textarea: {
    background: "rgba(255,200,230,0.05)",
    border: "1px solid rgba(255,160,200,0.2)",
    borderRadius: "12px",
    color: "#ffd0e8",
    fontSize: "14.5px",
    padding: "12px 16px",
    outline: "none",
    fontFamily: "inherit",
    width: "100%",
    minHeight: "80px",
    resize: "vertical",
    boxSizing: "border-box",
  },
  errorContainer: {
    background: "rgba(255, 0, 85, 0.1)",
    border: "1px solid rgba(255, 0, 85, 0.3)",
    borderRadius: "10px",
    color: "#ff4f8b",
    fontSize: "13px",
    padding: "10px 14px",
    textAlign: "center",
  },
  button: {
    background: "linear-gradient(90deg, #ff007f 0%, #7928ca 100%)",
    border: "none",
    borderRadius: "14px",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "600",
    padding: "14px",
    cursor: "pointer",
    boxShadow: "0 0 15px rgba(255, 0, 127, 0.3)",
    letterSpacing: "1px",
    marginTop: "10px",
  },
  buttonDisabled: {
    background: "#40354e",
    color: "rgba(255,255,255,0.4)",
    boxShadow: "none",
    cursor: "not-allowed",
  },
  successBody: {
    padding: "40px 28px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  successIcon: {
    fontSize: "48px",
    marginBottom: "16px",
    textShadow: "0 0 20px rgba(255,255,255,0.6)",
  },
  successTitle: {
    fontSize: "24px",
    color: "#fff",
    margin: "0 0 12px",
    textShadow: "0 0 10px rgba(255,0,127,0.5)",
  },
  successText: {
    fontSize: "14px",
    color: "rgba(255, 220, 235, 0.8)",
    lineHeight: "1.6",
    margin: "0 0 24px",
  },
  successCardSummary: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,160,200,0.1)",
    borderRadius: "16px",
    width: "100%",
    padding: "16px",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginBottom: "28px",
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "13.5px",
  },
  summaryLabel: {
    color: "rgba(255,180,210,0.6)",
  },
  summaryValue: {
    color: "#ffd0e8",
    fontWeight: "500",
  },
  backButton: {
    background: "transparent",
    border: "1px solid rgba(255,160,200,0.3)",
    borderRadius: "12px",
    color: "rgba(255,180,210,0.8)",
    fontSize: "14px",
    padding: "10px 20px",
    cursor: "pointer",
  },
};
