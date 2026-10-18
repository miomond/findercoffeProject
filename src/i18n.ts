export type Lang = "ar" | "en";

export const DIR: Record<Lang, "rtl" | "ltr"> = { ar: "rtl", en: "ltr" };

const ar = {
  title: "رأيك يهمنا",
  subtitle: "ساعدنا نقدم لك تجربة أفضل دائماً",

  details: "بياناتك",
  fullName: "الاسم الكامل",
  phone: "رقم الجوال",
  birthday: "تاريخ الميلاد",
  optional: "(اختياري)",
  fullNameError: "أدخل اسمك الكامل",
  phoneError: "أدخل رقم جوال صحيح",
  birthdayError: "تاريخ غير صحيح",

  rateTitle: "من فضلك قيّم تجربتك معنا",
  suggestions: "هل لديك أي اقتراحات لتحسين تجربتنا؟",
  liked: "ما أكثر شيء أعجبك؟",
  visitAgain: "هل ستزورنا مرة أخرى؟",
  overall: "تقييمك العام",
  required: "من فضلك أكمل الحقول المطلوبة",
  submit: "إرسال",
  footer: "شكراً لوقتك .. نعتز برأيك",

  reactionYesTitle: "شكراً لك!",
  reactionYesText: "بانتظار زيارتك القادمة",
  reactionNoTitle: "يؤسفنا ذلك",
  reactionNoText: "سنعمل على أن تكون زيارتك القادمة أفضل",

  greet: "سعدنا بزيارتك",
  nameSeparator: "، ",
  thanksBody: "شكراً لمشاركتنا رأيك، فملاحظاتك تساعدنا على تقديم تجربة أفضل في كل زيارة.",
  closing: {
    yes: "نتطلع لاستقبالك مجدداً قريباً",
    maybe: "نتمنى أن نراك مجدداً، وسنحرص أن تكون زيارتك القادمة أجمل",
    no: "نأسف أن تجربتك لم تكن بالمستوى الذي تستحقه، وسنأخذ ملاحظاتك بكل اهتمام",
  },
  team: "فريق finder CAFE",

  lightMode: "الوضع الفاتح",
  darkMode: "الوضع الداكن",
  switchLangShort: "EN",
  switchLangLabel: "Switch to English",
};

const en: typeof ar = {
  title: "Your Feedback Matters",
  subtitle: "Help us serve you a better experience, always",

  details: "Your details",
  fullName: "Full name",
  phone: "Phone number",
  birthday: "Birthday",
  optional: "(optional)",
  fullNameError: "Enter your full name",
  phoneError: "Enter a valid phone number",
  birthdayError: "Invalid date",

  rateTitle: "Please rate your experience with us",
  suggestions: "Do you have any suggestions to improve our experience?",
  liked: "What did you like the most?",
  visitAgain: "Will you visit us again?",
  overall: "Overall rating",
  required: "Please complete the required fields",
  submit: "Submit",
  footer: "Thank you for your time. We value your feedback",

  reactionYesTitle: "Thank you!",
  reactionYesText: "We can't wait to see you again",
  reactionNoTitle: "We're sorry to hear that",
  reactionNoText: "We'll work to make your next visit better",

  greet: "It was a pleasure having you",
  nameSeparator: ", ",
  thanksBody: "Thank you for sharing your feedback. It helps us make every visit better.",
  closing: {
    yes: "We look forward to welcoming you back soon.",
    maybe: "We hope to see you again, and we'll make your next visit even better.",
    no: "We're sorry your visit fell short. Your feedback will be taken seriously.",
  },
  team: "The finder CAFE team",

  lightMode: "Light mode",
  darkMode: "Dark mode",
  switchLangShort: "ع",
  switchLangLabel: "التبديل إلى العربية",
};

export const T: Record<Lang, typeof ar> = { ar, en };
