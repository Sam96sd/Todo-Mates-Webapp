import { useState, useRef, useEffect } from "react";
import { Send, MessageCircle, Pencil, Check, X } from "lucide-react";

interface ContactInfo {
  whatsapp: string;
  instagram: string;
  facebook: string;
}

interface FAQChatbotProps {
  contactInfo: ContactInfo;
  onUpdateContact: (info: ContactInfo) => void;
  isAdmin: boolean;
}

interface Message {
  id: string;
  role: "user" | "bot";
  text: string;
  timestamp: Date;
}

const FAQ_RESPONSES: Array<{ keywords: string[]; answer: string }> = [
  {
    keywords: ["شحن", "توصيل", "ship", "deliver", "deliver", "cities", "مدن", "مدينة"],
    answer:
      "نوصل مباشرة في ديرعطية 🏠\nأما بقية المدن السورية، فنشحن عبر شركة **القدموس** للتوصيل 🚛\n\nللطلب، تواصل معنا عبر واتساب!",
  },
  {
    keywords: ["واتس", "whatsapp", "اتصال", "contact", "تواصل", "رقم", "phone", "number"],
    answer: "يمكنك التواصل معنا عبر واتساب فقط 📱\nسنضع رقمنا هنا بمجرد إضافته من الإدارة.\n\nكما يمكنك متابعتنا على انستغرام وفيسبوك!",
  },
  {
    keywords: ["سعر", "price", "أسعار", "تخفيض", "discount", "خصم", "كمية", "bulk", "جملة"],
    answer:
      "أسعارنا ثابتة وتعكس جودة المنتجات الأصلية من الأرجنتين 🇦🇷\n\nالخصم الوحيد هو لمشتريات الجملة:\n• 3 قطع فأكثر: خصم حسب جدول الأسعار\n\nراجع قسم **خصم الكميات** في الموقع لحساب سعرك!",
  },
  {
    keywords: ["original", "أصلي", "اصلي", "منتج", "product", "argentina", "أرجنتين", "جودة", "quality"],
    answer:
      "نعم! جميع منتجاتنا 100% أصلية من الأرجنتين 🇦🇷✨\n\nنستورد مباشرة لضمان الأصالة — لا منتجات مقلدة أو بديلة.\n\nنبيع:\n🌿 يربا ماتي\n🥤 بومبيلا (ماصّة ماتي)\n🫙 قرع ماتي (كوب)",
  },
  {
    keywords: ["ماتي", "mate", "يرباماتي", "yerba", "bombilla", "بومبيلا", "gourd", "قرع", "كوب"],
    answer:
      "نوفر 3 أنواع من المنتجات:\n\n🌿 **يرباماتي** — أعشاب الماتي المجففة من الأرجنتين\n🥤 **بومبيلا** — ماصّة الماتي المعدنية الأصيلة\n🫙 **قرع الماتي** — أكواب الشرب التقليدية\n\nشاهد منتجاتنا الكاملة في قسم المنتجات!",
  },
  {
    keywords: ["instagram", "انستغرام", "انستجرام", "facebook", "فيسبوك", "social", "وسائل"],
    answer: "تابعنا على وسائل التواصل الاجتماعي 📲\nانستغرام وفيسبوك — الروابط في أسفل الصفحة!",
  },
  {
    keywords: ["hello", "hi", "مرحبا", "مرحبً", "هلا", "السلام", "أهلا", "اهلا"],
    answer:
      "أهلاً وسهلاً! 👋\n\nأنا هنا للإجابة على أسئلتك حول منتجاتنا، الأسعار، والتوصيل.\n\nكيف أستطيع مساعدتك؟",
  },
];

const DEFAULT_RESPONSE =
  "شكراً لسؤالك! 😊\n\nيمكنني مساعدتك في:\n• معلومات المنتجات\n• الأسعار والخصومات\n• التوصيل والشحن\n• التواصل معنا\n\nأو تواصل معنا مباشرة عبر واتساب!";

function getBotResponse(input: string): string {
  const lower = input.toLowerCase();
  for (const faq of FAQ_RESPONSES) {
    if (faq.keywords.some((kw) => lower.includes(kw))) {
      return faq.answer;
    }
  }
  return DEFAULT_RESPONSE;
}

function renderMarkdown(text: string) {
  return text.split("\n").map((line, i) => {
    const bold = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    return (
      <span key={i} style={{ display: "block" }} dangerouslySetInnerHTML={{ __html: bold }} />
    );
  });
}

export function FAQChatbot({ contactInfo, onUpdateContact, isAdmin }: FAQChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "bot",
      text: "أهلاً بك في ماتي أرجنتين! 🧉\n\nاسألني عن منتجاتنا، أسعارنا، أو التوصيل وسأساعدك بكل سرور.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [editingContact, setEditingContact] = useState(false);
  const [draftContact, setDraftContact] = useState(contactInfo);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: input.trim(),
      timestamp: new Date(),
    };
    const botResponse = getBotResponse(input.trim());
    const botMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: "bot",
      text: botResponse,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput("");
  };

  const saveContact = () => {
    onUpdateContact(draftContact);
    setEditingContact(false);
  };

  const whatsappUrl = contactInfo.whatsapp
    ? `https://wa.me/${contactInfo.whatsapp.replace(/[^0-9]/g, "")}`
    : null;
  const instagramUrl = contactInfo.instagram
    ? `https://instagram.com/${contactInfo.instagram.replace("@", "")}`
    : null;
  const facebookUrl = contactInfo.facebook
    ? `https://facebook.com/${contactInfo.facebook.replace("@", "")}`
    : null;

  return (
    <section
      id="faq"
      style={{ backgroundColor: "#F4ECD8", fontFamily: "'Lato', sans-serif", padding: "80px 0" }}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-10">
          <p style={{ color: "#B85C38", fontSize: "0.8rem", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "4px" }}>
            Ask Anything
          </p>
          <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#2C1A0E", fontSize: "2rem", fontWeight: 700 }}>
            FAQ Assistant
          </h2>
        </div>

        <div className="grid md:grid-cols-5 gap-8">
          {/* Chatbot */}
          <div
            className="md:col-span-3"
            style={{
              border: "1px solid rgba(44,26,14,0.15)",
              borderRadius: "10px",
              overflow: "hidden",
              boxShadow: "0 2px 12px rgba(44,26,14,0.08)",
              display: "flex",
              flexDirection: "column",
              height: "480px",
            }}
          >
            {/* Chat header */}
            <div
              style={{
                backgroundColor: "#2D5016",
                padding: "14px 18px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <MessageCircle size={18} style={{ color: "#c5e87a" }} />
              <span style={{ color: "#F4ECD8", fontWeight: 700, fontSize: "0.9rem" }}>Mate Argentin — مساعد الأسئلة</span>
              <div
                style={{
                  marginLeft: "auto",
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: "#c5e87a",
                }}
              />
            </div>

            {/* Messages */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "16px",
                backgroundColor: "#FAF4E8",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    display: "flex",
                    justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "78%",
                      padding: "10px 14px",
                      borderRadius: msg.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                      backgroundColor: msg.role === "user" ? "#2D5016" : "#EDE0C4",
                      color: msg.role === "user" ? "#F4ECD8" : "#2C1A0E",
                      fontSize: "0.87rem",
                      lineHeight: 1.65,
                      direction: "rtl",
                      textAlign: "right",
                    }}
                  >
                    {renderMarkdown(msg.text)}
                  </div>
                </div>
              ))}
              <div ref={endRef} />
            </div>

            {/* Input */}
            <div
              style={{
                padding: "12px 14px",
                borderTop: "1px solid rgba(44,26,14,0.1)",
                backgroundColor: "#F4ECD8",
                display: "flex",
                gap: "8px",
              }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="اكتب سؤالك هنا... / Type your question..."
                style={{
                  flex: 1,
                  padding: "9px 12px",
                  border: "1px solid rgba(44,26,14,0.2)",
                  borderRadius: "6px",
                  backgroundColor: "#EDE0C4",
                  color: "#2C1A0E",
                  fontSize: "0.88rem",
                  direction: "rtl",
                }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "6px",
                  backgroundColor: input.trim() ? "#2D5016" : "#D4C5A0",
                  border: "none",
                  color: "#F4ECD8",
                  cursor: input.trim() ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Send size={16} />
              </button>
            </div>
          </div>

          {/* Contact info panel */}
          <div className="md:col-span-2 flex flex-col gap-6">
            <div
              style={{
                backgroundColor: "#EDE0C4",
                border: "1px solid rgba(44,26,14,0.12)",
                borderRadius: "10px",
                padding: "24px",
              }}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#2C1A0E", fontSize: "1.05rem", fontWeight: 700 }}>
                  Contact Us
                </h3>
                {isAdmin && !editingContact && (
                  <button
                    onClick={() => { setDraftContact(contactInfo); setEditingContact(true); }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      padding: "4px 10px",
                      border: "1px solid rgba(44,26,14,0.25)",
                      borderRadius: "4px",
                      backgroundColor: "transparent",
                      color: "#6B5340",
                      fontSize: "0.78rem",
                      cursor: "pointer",
                    }}
                  >
                    <Pencil size={11} /> Edit
                  </button>
                )}
              </div>

              {!editingContact ? (
                <div className="flex flex-col gap-4">
                  {/* WhatsApp */}
                  <div>
                    <p style={{ fontSize: "0.75rem", color: "#6B5340", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      WhatsApp Only
                    </p>
                    {whatsappUrl ? (
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "10px 14px",
                          backgroundColor: "#25D366",
                          color: "#fff",
                          borderRadius: "6px",
                          textDecoration: "none",
                          fontSize: "0.88rem",
                          fontWeight: 700,
                        }}
                      >
                        💬 {contactInfo.whatsapp}
                      </a>
                    ) : (
                      <p style={{ color: "#D4C5A0", fontSize: "0.85rem", fontStyle: "italic" }}>
                        {isAdmin ? "Add WhatsApp number in edit mode" : "WhatsApp coming soon"}
                      </p>
                    )}
                  </div>

                  {/* Instagram */}
                  <div>
                    <p style={{ fontSize: "0.75rem", color: "#6B5340", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      Instagram
                    </p>
                    {instagramUrl ? (
                      <a
                        href={instagramUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "10px 14px",
                          background: "linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)",
                          color: "#fff",
                          borderRadius: "6px",
                          textDecoration: "none",
                          fontSize: "0.88rem",
                          fontWeight: 700,
                        }}
                      >
                        📸 @{contactInfo.instagram.replace("@", "")}
                      </a>
                    ) : (
                      <p style={{ color: "#D4C5A0", fontSize: "0.85rem", fontStyle: "italic" }}>
                        {isAdmin ? "Add Instagram handle in edit mode" : "Instagram coming soon"}
                      </p>
                    )}
                  </div>

                  {/* Facebook */}
                  <div>
                    <p style={{ fontSize: "0.75rem", color: "#6B5340", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      Facebook
                    </p>
                    {facebookUrl ? (
                      <a
                        href={facebookUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "10px 14px",
                          backgroundColor: "#1877F2",
                          color: "#fff",
                          borderRadius: "6px",
                          textDecoration: "none",
                          fontSize: "0.88rem",
                          fontWeight: 700,
                        }}
                      >
                        👍 {contactInfo.facebook.replace("@", "")}
                      </a>
                    ) : (
                      <p style={{ color: "#D4C5A0", fontSize: "0.85rem", fontStyle: "italic" }}>
                        {isAdmin ? "Add Facebook page in edit mode" : "Facebook coming soon"}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {[
                    { key: "whatsapp", label: "WhatsApp Number", placeholder: "+963 9XX XXX XXXX" },
                    { key: "instagram", label: "Instagram Handle", placeholder: "@yourpage" },
                    { key: "facebook", label: "Facebook Page", placeholder: "yourpagename" },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label style={{ display: "block", color: "#2C1A0E", fontSize: "0.8rem", marginBottom: "4px", fontWeight: 600 }}>
                        {label}
                      </label>
                      <input
                        value={(draftContact as Record<string, string>)[key]}
                        onChange={(e) => setDraftContact({ ...draftContact, [key]: e.target.value })}
                        placeholder={placeholder}
                        style={{
                          width: "100%",
                          padding: "8px 10px",
                          border: "1px solid rgba(44,26,14,0.2)",
                          borderRadius: "4px",
                          backgroundColor: "#F4ECD8",
                          color: "#2C1A0E",
                          fontSize: "0.85rem",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                  ))}
                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={() => setEditingContact(false)}
                      style={{
                        flex: 1,
                        padding: "8px",
                        border: "1px solid rgba(44,26,14,0.2)",
                        borderRadius: "4px",
                        backgroundColor: "transparent",
                        color: "#6B5340",
                        cursor: "pointer",
                        fontSize: "0.82rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "4px",
                      }}
                    >
                      <X size={13} /> Cancel
                    </button>
                    <button
                      onClick={saveContact}
                      style={{
                        flex: 2,
                        padding: "8px",
                        backgroundColor: "#2D5016",
                        color: "#F4ECD8",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontWeight: 700,
                        fontSize: "0.82rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "4px",
                      }}
                    >
                      <Check size={13} /> Save
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick questions */}
            <div
              style={{
                backgroundColor: "#EDE0C4",
                border: "1px solid rgba(44,26,14,0.12)",
                borderRadius: "10px",
                padding: "20px",
              }}
            >
              <p style={{ color: "#6B5340", fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px" }}>
                Quick Questions
              </p>
              <div className="flex flex-col gap-2">
                {[
                  "كيف يتم التوصيل؟",
                  "هل المنتجات أصلية؟",
                  "كيف أحصل على خصم؟",
                  "ما أنواع المنتجات؟",
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => {
                      setInput(q);
                      setTimeout(() => {
                        const btn = document.querySelector("[data-send]") as HTMLButtonElement;
                        if (btn) btn.click();
                      }, 50);
                      const userMsg: Message = { id: Date.now().toString(), role: "user", text: q, timestamp: new Date() };
                      const botMsg: Message = {
                        id: (Date.now() + 1).toString(),
                        role: "bot",
                        text: getBotResponse(q),
                        timestamp: new Date(),
                      };
                      setMessages((prev) => [...prev, userMsg, botMsg]);
                      setInput("");
                    }}
                    style={{
                      padding: "8px 12px",
                      textAlign: "right",
                      border: "1px solid rgba(44,26,14,0.15)",
                      borderRadius: "6px",
                      backgroundColor: "#F4ECD8",
                      color: "#2C1A0E",
                      cursor: "pointer",
                      fontSize: "0.83rem",
                      direction: "rtl",
                      transition: "background-color 0.15s",
                    }}
                    onMouseOver={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "#EDE0C4")}
                    onMouseOut={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "#F4ECD8")}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
