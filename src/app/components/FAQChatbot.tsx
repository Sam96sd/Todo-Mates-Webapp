import { useState, useRef, useEffect } from "react";
import { Send, MessageCircle, Pencil, Check, X } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";
import type { Language } from "../i18n/translations";

interface ContactInfo {
  whatsapp: string;
  instagram: string;
  facebook: string;
}

interface FAQChatbotProps {
  contactInfo: ContactInfo;
  onUpdateContact: (info: ContactInfo) => Promise<void>;
  isAdmin: boolean;
}

interface Message {
  id: string;
  role: "user" | "bot";
  text: string;
  timestamp: Date;
}

const FAQ_RESPONSES: Record<Language, Array<{ keywords: string[]; answer: string }>> = {
  ar: [
    {
      keywords: ["شحن", "توصيل", "ship", "deliver", "cities", "مدن", "مدينة"],
      answer:
        "نوصل مباشرة في ديرعطية 🏠\nأما بقية المدن السورية، فنشحن عبر شركة **القدموس** للتوصيل 🚛\n\nللطلب، تواصل معنا عبر واتساب!",
    },
    {
      keywords: ["واتس", "whatsapp", "اتصال", "contact", "تواصل", "رقم", "phone", "number"],
      answer: "يمكنك التواصل معنا عبر واتساب فقط (لا يوجد مكالمات) 📱\nسنضع رقمنا هنا بمجرد إضافته من الإدارة.\n\nكما يمكنك متابعتنا على انستغرام وفيسبوك!",
    },
    {
      keywords: ["سعر", "price", "أسعار", "تخفيض", "discount", "خصم", "كمية", "bulk", "جملة"],
      answer:
        "أسعارنا ثابتة وتعكس جودة المنتجات الأصلية من الأرجنتين 🇦🇷\n\nالخصم الوحيد هو لمشتريات الجملة:\n• 3 قطع فأكثر: خصم حسب جدول الأسعار\n\nراجع قسم **خصم الكميات** في الموقع لحساب سعرك!",
    },
    {
      keywords: ["original", "أصلي", "اصلي", "منتج", "product", "argentina", "أرجنتين", "جودة", "quality"],
      answer:
        "نعم! جميع منتجاتنا 100% أصلية من الأرجنتين 🇦🇷✨\n\nنستورد مباشرة لضمان الأصالة — لا منتجات مقلدة أو بديلة.\n\nنبيع:\n🌿 يربا متة\n🥤 مصاصات (ماصّة متة)\n🫙 قرع متة (كوب)",
    },
    {
      keywords: ["متة", "mate", "يربامتة", "yerba", "bombilla", "مصاصات", "gourd", "قرع", "كوب"],
      answer:
        "نوفر 3 أنواع من المنتجات:\n\n🌿 **يربامتة** — أعشاب المتة المجففة من الأرجنتين\n🥤 **مصاصات** — ماصّة المتة المعدنية الأصيلة\n🫙 **قرع المتة** — أكواب الشرب التقليدية\n\nشاهد منتجاتنا الكاملة في قسم المنتجات!",
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
    {
      keywords: ["محل", "متجر", "ديرعطية", "دير عطية", "عنوان", "مكان", "موقع"],
      answer: "لا يوجد لدينا محل في ديرعطية حالياً 🏠\nولكن نوفر خدمة توصيل مأجورة داخل ديرعطية بتكلفة **100 ليرة سورية جديدة** (أو 10 آلاف ليرة بالعملة القديمة) لجميع الطلبات!",
    },
    {
      keywords: ["النبك", "نبك", "توصيل للنبك", "شحن للنبك"],
      answer: "بالنسبة للنبك، لا يتوفر لدينا توصيل مباشر حالياً 🗺️\nولكن في العادة، يقوم زبائننا من النبك بإرسال **موتور (مراسيل)** من طرفهم لاستلام البضاعة وتوصيلها لهم، وتكون تكلفة التوصيل بالكامل على المشتري.",
    },
    {
      keywords: ["مكفولة", "مكفول", "ضمان", "كفالة", "مكسور", "تسريب", "اصلي", "تقليد"],
      answer: "جميع بضائعنا أصلية ومستوردة من الأرجنتين حصرًا 🇦🇷، ولا نتعامل مع البضائع المقلدة نهائياً.\n\nالقطع جميعها **مكفولة بشرط الاستخدام الصحيح**:\n• نتأكد تماماً قبل التسليم من أن جميع الجوزات غير مكسورة ولا تسرب الماء.\n• نتأكد أن جميع المصاصات لونها ثابت لأنها مصنوعة من معدن الستيل الأصلي.\n\n⚠️ **ملاحظة:** في حال حدوث خطأ في الاستخدام أو التنظيف (خصوصاً استخدام المنظفات القاسية والمواد الكيماوية على المنتجات)، يتحمل المشتري مسؤولية الخطأ.",
    },
    {
      keywords: ["جديد", "جديدة", "بضائع جديدة", "توفر", "امتى", "متى", "تجديد", "شحن"],
      answer: "عملية الشحن والاستيراد من الأرجنتين معقدة وصعبة ومكلفة للغاية 🚢\nلذلك، نحاول جلب تشكيلة من المنتجات **مرة أو مرتين في السنة كحد أقصى**، وفي بعض الأحيان قد لا نتمكن من التجديد خلال العام نفسه.\n\nبسبب هذا، البضائع المتوفرة لدينا دائمًا نادرة، محدودة الكمية، ولا تتكرر كثيرًا! إذا نال إعجابك منتج، ننصحك بطلبه مباشرة.",
    },
  ],
  en: [
    {
      keywords: ["ship", "deliver", "delivery", "cities", "shipping", "شحن", "توصيل"],
      answer:
        "We deliver directly in Deir Atiyeh 🏠\nFor other Syrian cities, we ship via **Al-Kodmous** delivery company 🚛\n\nTo order, contact us on WhatsApp!",
    },
    {
      keywords: ["whatsapp", "contact", "phone", "number", "واتس", "اتصال", "تواصل", "رقم"],
      answer:
        "You can reach us on WhatsApp only (No calls) 📱\nWe'll add our number here once it's set up by admin.\n\nYou can also follow us on Instagram and Facebook!",
    },
    {
      keywords: ["price", "prices", "discount", "bulk", "سعر", "أسعار", "تخفيض", "خصم", "جملة"],
      answer:
        "Our prices are fixed and reflect the quality of original Argentine products 🇦🇷\n\nThe only discount is for bulk purchases:\n• 3+ pieces: discount based on our pricing table\n\nCheck the **Bulk Discount** section to calculate your price!",
    },
    {
      keywords: ["original", "product", "argentina", "quality", "أصلي", "منتج", "أرجنتين", "جودة"],
      answer:
        "Yes! All our products are 100% original from Argentina 🇦🇷✨\n\nWe import directly to guarantee authenticity — no copies or substitutes.\n\nWe sell:\n🌿 Yerba Mate\n🥤 Bombilla (mate straw)\n🫙 Mate Gourd (cup)",
    },
    {
      keywords: ["mate", "yerba", "bombilla", "gourd", "متة", "يربامتة", "مصاصات", "قرع", "كوب"],
      answer:
        "We offer 3 types of products:\n\n🌿 **Yerba Mate** — dried mate herbs from Argentina\n🥤 **Bombilla** — authentic metal mate straw\n🫙 **Mate Gourd** — traditional drinking cups\n\nSee our full product range in the Products section!",
    },
    {
      keywords: ["instagram", "facebook", "social", "انستغرام", "فيسبوك", "وسائل"],
      answer: "Follow us on social media 📲\nInstagram and Facebook — links are at the bottom of the page!",
    },
    {
      keywords: ["hello", "hi", "مرحبا", "هلا", "أهلا", "اهلا"],
      answer:
        "Hello and welcome! 👋\n\nI'm here to answer your questions about our products, prices, and delivery.\n\nHow can I help you?",
    },
    {
      keywords: ["shop", "store", "location", "address", "deir atiyeh", "deir", "atiyeh"],
      answer: "We do not have a physical shop in Deir Atiyeh at the moment 🏠\nHowever, we offer paid delivery within Deir Atiyeh for just **100 new Syrian Pounds** (or 10,000 old Syrian Pounds) directly to your door!",
    },
    {
      keywords: ["an-nabk", "nabk", "nabek", "delivery to nabk"],
      answer: "For An-Nabk, we do not have a direct delivery route 🗺️\nUsually, our customers from An-Nabk send a **private motorcycle courier (Merasil)** from their side to pick up the products and deliver them, with the delivery fee covered by the buyer.",
    },
    {
      keywords: ["guaranteed", "warranty", "original", "fake", "authentic", "leak", "broken"],
      answer: "All our products are 100% authentic and imported strictly from Argentina 🇦🇷. We never deal with counterfeit items.\n\nAll items are **guaranteed provided they are used correctly**:\n• We inspect all gourds thoroughly to ensure they are not cracked and do not leak.\n• We guarantee that all bombillas (straws) are made of genuine stainless steel with non-fading colors.\n\n⚠️ **Please note:** Damage caused by improper handling, usage, or cleaning (especially using harsh chemical detergents on the products) is the sole responsibility of the buyer.",
    },
    {
      keywords: ["new", "stock", "restock", "when", "arrival", "cargo", "shipment"],
      answer: "Shipping and importing cargo directly from Argentina is extremely difficult and highly expensive 🚢\nBecause of this, we only manage to bring in new stock **once or twice a year at most**, and sometimes we cannot restock at all within the same year.\n\nTherefore, our available items are highly rare, limited in quantity, and rarely repeated!",
    },
  ],
};

function getBotResponse(input: string, lang: Language, defaultResponse: string): string {
  const lower = input.toLowerCase();
  for (const faq of FAQ_RESPONSES[lang]) {
    if (faq.keywords.some((kw) => lower.includes(kw))) {
      return faq.answer;
    }
  }
  return defaultResponse;
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
  const { t, language, isRTL } = useLanguage();
  const fontFamily = isRTL ? "'Cairo', sans-serif" : "'Lato', sans-serif";
  const serifFamily = isRTL ? "'Cairo', sans-serif" : "'Playfair Display', serif";

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "bot",
      text: t.faq.welcome,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [editingContact, setEditingContact] = useState(false);
  const [draftContact, setDraftContact] = useState(contactInfo);
  const [isSavingContact, setIsSavingContact] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDraftContact(contactInfo);
  }, [contactInfo]);

  useEffect(() => {
    setMessages([
      {
        id: "welcome",
        role: "bot",
        text: t.faq.welcome,
        timestamp: new Date(),
      },
    ]);
  }, [language, t.faq.welcome]);

  const scrollChatToBottom = () => {
    const el = messagesContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: input.trim(),
      timestamp: new Date(),
    };
    
    // Inject the real number into the response if the user asks about WhatsApp
    let botResponse = getBotResponse(input.trim(), language, t.faq.defaultResponse);
    if (input.toLowerCase().includes("whatsapp") || input.toLowerCase().includes("واتس")) {
        botResponse = contactInfo.whatsapp 
            ? `${t.faq.whatsappOnly} ${contactInfo.whatsapp}` 
            : botResponse;
    }

    const botMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: "bot",
      text: botResponse,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput("");
    requestAnimationFrame(scrollChatToBottom);
  };
  const saveContact = async () => {
    setIsSavingContact(true);
    try {
      await onUpdateContact(draftContact);
      setEditingContact(false);
    } catch {
      window.alert("Could not save contact info. Please try again.");
    } finally {
      setIsSavingContact(false);
    }
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

  const quickQuestions = [t.faq.quickQ1, t.faq.quickQ2, t.faq.quickQ3, t.faq.quickQ4];

  const handleQuickQuestion = (q: string) => {
    const userMsg: Message = { id: Date.now().toString(), role: "user", text: q, timestamp: new Date() };
    
    let botResponse = getBotResponse(q, language, t.faq.defaultResponse);
    if (q.toLowerCase().includes("whatsapp") || q.toLowerCase().includes("واتس")) {
        botResponse = contactInfo.whatsapp 
            ? `${t.faq.whatsappOnly} ${contactInfo.whatsapp}` 
            : botResponse;
    }

    const botMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: "bot",
      text: botResponse,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput("");
    requestAnimationFrame(scrollChatToBottom);
  };

  return (
    <section
      id="faq"
      style={{ backgroundColor: "#F4ECD8", fontFamily, padding: "80px 0" }}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-10">
          <p style={{ color: "#B85C38", fontSize: "0.8rem", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "4px" }}>
            {t.faq.subtitle}
          </p>
          <h2 style={{ fontFamily: serifFamily, color: "#2C1A0E", fontSize: "2rem", fontWeight: 700 }}>
            {t.faq.title}
          </h2>
        </div>

        <div className="grid md:grid-cols-5 gap-8">
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
              <span style={{ color: "#F4ECD8", fontWeight: 700, fontSize: "0.9rem" }}>{t.faq.chatHeader}</span>
              <div
                style={{
                  marginInlineStart: "auto",
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: "#c5e87a",
                }}
              />
            </div>

            <div
              ref={messagesContainerRef}
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
                    justifyContent: msg.role === "user" ? (isRTL ? "flex-start" : "flex-end") : (isRTL ? "flex-end" : "flex-start"),
                  }}
                >
                  <div
                    style={{
                      maxWidth: "78%",
                      padding: "10px 14px",
                      borderRadius: msg.role === "user"
                        ? isRTL ? "14px 14px 14px 4px" : "14px 14px 4px 14px"
                        : isRTL ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                      backgroundColor: msg.role === "user" ? "#2D5016" : "#EDE0C4",
                      color: msg.role === "user" ? "#F4ECD8" : "#2C1A0E",
                      fontSize: "0.87rem",
                      lineHeight: 1.65,
                      direction: isRTL ? "rtl" : "ltr",
                      textAlign: isRTL ? "right" : "left",
                    }}
                  >
                    {renderMarkdown(msg.text)}
                  </div>
                </div>
              ))}
            </div>

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
                placeholder={t.faq.inputPlaceholder}
                style={{
                  flex: 1,
                  padding: "9px 12px",
                  border: "1px solid rgba(44,26,14,0.2)",
                  borderRadius: "6px",
                  backgroundColor: "#EDE0C4",
                  color: "#2C1A0E",
                  fontSize: "0.88rem",
                  direction: isRTL ? "rtl" : "ltr",
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
                <h3 style={{ fontFamily: serifFamily, color: "#2C1A0E", fontSize: "1.05rem", fontWeight: 700 }}>
                  {t.faq.contactUs}
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
                    <Pencil size={11} /> {t.faq.edit}
                  </button>
                )}
              </div>

              {!editingContact ? (
                <div className="flex flex-col gap-4">
                  <div>
                    <p style={{ fontSize: "0.75rem", color: "#6B5340", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      {t.faq.whatsappOnly}
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
                        {isAdmin ? t.faq.whatsappAddAdmin : t.faq.whatsappComingSoon}
                      </p>
                    )}
                  </div>

                  <div>
                    <p style={{ fontSize: "0.75rem", color: "#6B5340", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      {t.faq.instagram}
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
                        {isAdmin ? t.faq.instagramAddAdmin : t.faq.instagramComingSoon}
                      </p>
                    )}
                  </div>

                  <div>
                    <p style={{ fontSize: "0.75rem", color: "#6B5340", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      {t.faq.facebook}
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
                        {isAdmin ? t.faq.facebookAddAdmin : t.faq.facebookComingSoon}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {[
                    { key: "whatsapp", label: t.faq.whatsappNumber, placeholder: "+963 9XX XXX XXXX" },
                    { key: "instagram", label: t.faq.instagramHandle, placeholder: "@yourpage" },
                    { key: "facebook", label: t.faq.facebookPage, placeholder: "yourpagename" },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label style={{ display: "block", color: "#2C1A0E", fontSize: "0.8rem", marginBottom: "4px", fontWeight: 600 }}>
                        {label}
                      </label>
                      <input
                        value={(draftContact as any)[key]}
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
                      <X size={13} /> {t.faq.cancel}
                    </button>
                    <button
                      onClick={saveContact}
                      disabled={isSavingContact}
                      style={{
                        flex: 2,
                        padding: "8px",
                        backgroundColor: isSavingContact ? "#D4C5A0" : "#2D5016",
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
                      <Check size={13} /> {isSavingContact ? "…" : t.faq.save}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div
              style={{
                backgroundColor: "#EDE0C4",
                border: "1px solid rgba(44,26,14,0.12)",
                borderRadius: "10px",
                padding: "20px",
              }}
            >
              <p style={{ color: "#6B5340", fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px" }}>
                {t.faq.quickQuestions}
              </p>
              <div className="flex flex-col gap-2">
                {quickQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleQuickQuestion(q)}
                    style={{
                      padding: "8px 12px",
                      textAlign: isRTL ? "right" : "left",
                      border: "1px solid rgba(44,26,14,0.15)",
                      borderRadius: "6px",
                      backgroundColor: "#F4ECD8",
                      color: "#2C1A0E",
                      cursor: "pointer",
                      fontSize: "0.83rem",
                      direction: isRTL ? "rtl" : "ltr",
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
