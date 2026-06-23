import React, { createContext, useContext, useEffect, useState } from "react";

// Two languages, one dictionary. No i18n library: the surface is small enough
// that a plain object keeps things transparent and fast.

export const LANGUAGES = ["tr", "en"];
const STORAGE_KEY = "memento-lang";

export const dict = {
    tr: {
        langLabel: "EN",
        themeToLight: "Aydınlık",
        themeToDark: "Karanlık",

        // Cover (the entry form)
        cover: {
            kicker: "yaş değil, hayat",
            title: "Hayatına kısa bir bakış atalım mı?",
            subtitle: "Adını ve doğum tarihini gir. Gerisini sayılara bırakalım.",
            name: "İsim",
            namePlaceholder: "Adın",
            day: "Gün",
            month: "Ay",
            year: "Yıl",
            calculate: "Hayatımı paketle",
            hint: "Bir isim, bir tarih. Sonrası sürpriz.",
        },

        // Validation
        required: "Bu alan boş kalamaz",
        nameRequired: "Sana nasıl hitap edelim?",
        invalidDate: "Böyle bir tarih yok",
        futureDate: "Henüz yaşanmamış bir gün",
        dayRange: "1 ile 31 arası olmalı",
        monthRange: "1 ile 12 arası olmalı",

        // Personalised address (used only when a name was given)
        greet: (name) => `Selam ${name},`,
        s_people_caption_named: (name) =>
            `Demek ki yalnız değilsin ${name}. Hiç de olmadın.`,
        sum_title_named: (name) => `İşte ${name}, özetle hayatın`,

        // Story chrome
        nav: {
            restart: "Baştan al",
            share: "Paylaş",
            download: "Görseli indir",
            copied: "Kopyalandı",
            next: "İleri",
            prev: "Geri",
            close: "Kapat",
            pause: "Duraklat",
            play: "Devam et",
            copyLink: "Linki kopyala",
            shareStory: "Story olarak",
            soundOn: "Ses açık",
            soundOff: "Ses kapalı",
        },

        // Slides
        s_age_lead: "Şu ana kadar tam",
        years: "yıl",
        months: "ay",
        days: "gün",
        s_age_caption: "Ve sayaç hâlâ işliyor.",

        s_seconds_lead: "Tam şu ana kadar, saniye saniye",
        s_seconds_unit: "saniye",
        s_seconds_caption: "Ve bu sayı, sen okurken bile artıyor. Durmuyor.",

        s_days_lead: "Toplamda",
        s_days_unit: "gün",
        s_days_caption: "Her birinde uyandın. Bu bile başlı başına bir başarı.",

        s_heart_lead: "Göğsünde, tam şu an",
        s_heart_unit: "kalp atışı",
        s_breath_unit: "nefes",
        s_heart_caption: "İkisi de hâlâ işliyor. Sen hiç emir vermeden.",

        s_cosmic_lead: "Dünya seni taşırken",
        s_moons: "kez dolunay gördün",
        s_trips: "tur Güneş'in etrafında",
        s_cosmic_caption:
            "Kocaman bir kaya parçasının üstünde, durmadan dönüyorsun.",

        s_born_lead: "Sahneye çıkışın bir",
        s_born_day_suffix: "gününeydi",
        s_born_next: (n) => `Bir sonraki turuna ${n} gün var.`,
        s_born_today: "Ve bugün, tam da o gün. Mum üfleme zamanı.",

        s_weeks_title: "Hayatın, hafta hafta",
        s_weeks_caption: (lived) =>
            `${lived.toLocaleString("tr-TR")} kare doldu. Her biri yaşadığın bir hafta.`,
        s_weeks_hint: "Bir kareye dokun.",
        s_weeks_tooltip: (week, age) => `${week}. hafta · ${age} yaşındaydın`,
        s_weeks_note:
            "Izgara 80 yıllık uzun bir ömür. Bir hatırlatma, bir kehanet değil.",
        s_weeks_axis: "yaş",
        w_lived: "yaşanan",
        w_now: "şu an",
        w_left: "kalan",
        w_of: (lived, total) =>
            `${lived.toLocaleString("tr-TR")} / ${total.toLocaleString("tr-TR")} hafta`,

        s_percent_lead: "Bu uzun ömrün",
        s_percent_caption: "Kalan kısmı tamamen senin. Akıllıca harca.",

        // Estimated lifespan (humour)
        s_life_lead: "Kaba bir hesapla, önünde tahminen",
        s_life_unit: "yaz daha var",
        s_life_caption:
            "Tabii bu sadece ortalama. Sen daha iyisini yaparsın, biliyorum.",
        s_life_sub: (days, weeks) =>
            `Yani yaklaşık ${days.toLocaleString("tr-TR")} gün, ${weeks.toLocaleString(
                "tr-TR",
            )} hafta. Acele yok ama oyalanma da.`,
        s_life_outlived: "Tüm istatistikleri yendin. Resmî olarak efsanesin.",

        // People your age
        s_people_lead: "Bu gezegende, tam senin yaşında",
        s_people_unit: "kişi daha var",
        s_people_caption: "Yani yalnız değilsin. Hiç olmadın.",
        s_people_births: (n) =>
            `Doğduğun gün dünyada seninle birlikte ~${n.toLocaleString(
                "tr-TR",
            )} bebek daha doğdu.`,

        // Milestones
        s_miles_title: "Kayda değer günler",
        s_miles_caption: "Birini takvimine işle.",
        m_ten_thousand: "10.000. günün",
        m_billion: (b) => `${b} milyar saniyen`,
        m_next_round: (n) => `${n.toLocaleString("tr-TR")}. günün`,
        m_decade: (a) => `${a}. yaşın`,
        m_done: "geçti",
        m_soon: "yolda",

        // Summary
        sum_title: "İşte hayatın, özetle",
        sum_live: (n) =>
            `${n.toLocaleString("tr-TR")} saniyedir buradasın. Ve sayaç işliyor.`,
        sum_save_hint: "Bu kartı kaydet, paylaş, dünyaya hatırlat.",

        // Final
        s_final_recap: "Bir de şöyle:",
        r_breaths: "nefes",
        r_sleeps: "gece uykusu",
        r_weeks: "hafta",
        r_days: "gün",
        r_moons: "dolunay",
        r_trips: "Güneş turu",
        r_life: "tamamlandı",
        footer: "Dünya bir penceredir, her gelen baktı geçti.",

        weekdays: [
            "Pazar",
            "Pazartesi",
            "Salı",
            "Çarşamba",
            "Perşembe",
            "Cuma",
            "Cumartesi",
        ],
        shareTitle: "Hayatım, paketlendi",
    },

    en: {
        langLabel: "TR",
        themeToLight: "Light",
        themeToDark: "Dark",

        cover: {
            kicker: "not an age, a life",
            title: "Shall we take a quick look at your life?",
            subtitle: "Enter your name and birth date. Let the numbers do the talking.",
            name: "Name",
            namePlaceholder: "Your name",
            day: "Day",
            month: "Month",
            year: "Year",
            calculate: "Wrap my life",
            hint: "A name, a date. The rest is a surprise.",
        },

        required: "This field can't be empty",
        nameRequired: "What should we call you?",
        invalidDate: "No such date exists",
        futureDate: "A day not yet lived",
        dayRange: "Must be between 1 and 31",
        monthRange: "Must be between 1 and 12",

        // Personalised address (used only when a name was given)
        greet: (name) => `Hey ${name},`,
        s_people_caption_named: (name) => `So you're not alone, ${name}. You never were.`,
        sum_title_named: (name) => `Here's your life, ${name}`,

        nav: {
            restart: "Start over",
            share: "Share",
            download: "Download image",
            copied: "Copied",
            next: "Next",
            prev: "Back",
            close: "Close",
            pause: "Pause",
            play: "Resume",
            copyLink: "Copy link",
            shareStory: "As a story",
            soundOn: "Sound on",
            soundOff: "Sound off",
        },

        s_age_lead: "So far you've clocked exactly",
        years: "years",
        months: "months",
        days: "days",
        s_age_caption: "And the meter is still running.",

        s_seconds_lead: "Down to this very second, you've lived",
        s_seconds_unit: "seconds",
        s_seconds_caption:
            "And it's still climbing as you read this. It doesn't stop.",

        s_days_lead: "That's a grand total of",
        s_days_unit: "days",
        s_days_caption: "You woke up for every single one. That alone counts.",

        s_heart_lead: "In your chest, right now",
        s_heart_unit: "heartbeats",
        s_breath_unit: "breaths",
        s_heart_caption:
            "Both still running. Without you ever giving the order.",

        s_cosmic_lead: "While Earth carried you, you saw",
        s_moons: "full moons",
        s_trips: "trips around the Sun",
        s_cosmic_caption: "Spinning nonstop on a giant rock. As one does.",

        s_born_lead: "You made your entrance on a",
        s_born_day_suffix: "",
        s_born_next: (n) => `${n} days until your next lap.`,
        s_born_today: "And today is the day. Time to blow out the candles.",

        s_weeks_title: "Your life, week by week",
        s_weeks_caption: (lived) =>
            `${lived.toLocaleString("en-US")} squares filled. Each one a week you've lived.`,
        s_weeks_hint: "Tap a square.",
        s_weeks_tooltip: (week, age) => `Week ${week} · you were ${age}`,
        s_weeks_note:
            "The grid is a long life of 80 years. A reminder, not a prophecy.",
        s_weeks_axis: "age",
        w_lived: "lived",
        w_now: "now",
        w_left: "ahead",
        w_of: (lived, total) =>
            `${lived.toLocaleString("en-US")} / ${total.toLocaleString("en-US")} weeks`,

        s_percent_lead: "Of that long life, you've spent",
        s_percent_caption: "The rest is entirely yours. Spend it well.",

        // Estimated lifespan (humour)
        s_life_lead: "Give or take, you've got about",
        s_life_unit: "summers left",
        s_life_caption:
            "That's just the average, of course. You'll beat it. Obviously.",
        s_life_sub: (days, weeks) =>
            `Roughly ${days.toLocaleString("en-US")} days, ${weeks.toLocaleString(
                "en-US",
            )} weeks. No rush. But don't dawdle.`,
        s_life_outlived: "You've outlived the averages. Officially a legend.",

        // People your age
        s_people_lead: "On this planet, the exact same age as you, there are",
        s_people_unit: "other people",
        s_people_caption: "So you're not alone. You never were.",
        s_people_births: (n) =>
            `About ${n.toLocaleString(
                "en-US",
            )} other babies were born the same day as you.`,

        // Milestones
        s_miles_title: "Days worth marking",
        s_miles_caption: "Put one in your calendar.",
        m_ten_thousand: "Your 10,000th day",
        m_billion: (b) => `${b} billion seconds`,
        m_next_round: (n) => `Day ${n.toLocaleString("en-US")}`,
        m_decade: (a) => `Turning ${a}`,
        m_done: "done",
        m_soon: "ahead",

        // Summary
        sum_title: "Here's your life, recapped",
        sum_live: (n) =>
            `${n.toLocaleString("en-US")} seconds here. And the meter is running.`,
        sum_save_hint: "Save this card, share it, remind the world.",

        s_final_recap: "Also worth knowing:",
        r_breaths: "breaths",
        r_sleeps: "nights of sleep",
        r_weeks: "weeks",
        r_days: "days",
        r_moons: "full moons",
        r_trips: "sun trips",
        r_life: "complete",
        footer: "The world is a window; everyone who came looked through it and passed by.",

        weekdays: [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
        ],
        shareTitle: "My life, wrapped",
    },
};

// Memento-mori lines that rotate by life stage: quiet, poetic, with a faint
// smile. Chosen by age in years so the closing line meets the moment.
export const mementoLines = {
    tr: [
        { max: 12, text: "Daha çok yazın var. Her birini sonuna kadar yaşa." },
        {
            max: 19,
            text: "Vakit sonsuz görünüyor. Bu yanılsama da bir armağan.",
        },
        { max: 29, text: "Sandığından hızlı akıyor. Önemli olanı erteleme." },
        {
            max: 39,
            text: "Bir ömrün üçte birinden fazlası geçti. Gerisi senin.",
        },
        { max: 49, text: "Yarısına yaklaştın. Diğer yarısı hâlâ önünde." },
        { max: 59, text: "Artık günleri saymıyorsun; onları dolduruyorsun." },
        {
            max: 69,
            text: "Çok kış gördün. Her biri seni biraz daha sağlam yaptı.",
        },
        { max: 200, text: "Buraya kadar geldin. Bu, başlı başına bir zafer." },
    ],
    en: [
        { max: 12, text: "Many summers ahead. Live each one to its edge." },
        { max: 19, text: "Time looks endless. That illusion is its own gift." },
        {
            max: 29,
            text: "It moves faster than you think. Stop postponing what matters.",
        },
        {
            max: 39,
            text: "More than a third of a life is spent. The rest is yours.",
        },
        {
            max: 49,
            text: "Nearing the halfway mark. The other half is still ahead.",
        },
        { max: 59, text: "You no longer count the days; you fill them." },
        {
            max: 69,
            text: "You've seen many winters. Each one made you steadier.",
        },
        { max: 200, text: "You made it this far. That alone is a triumph." },
    ],
};

export function pickMementoLine(lang, ageYears) {
    const lines = mementoLines[lang] || mementoLines.en;
    return (lines.find((l) => ageYears <= l.max) || lines[lines.length - 1])
        .text;
}

// --- React context ---------------------------------------------------------

const LangContext = createContext(null);

export function LangProvider({ children }) {
    const [lang, setLang] = useState("tr");

    useEffect(() => {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved && LANGUAGES.includes(saved)) setLang(saved);
    }, []);

    const toggle = () => {
        setLang((prev) => {
            const next = prev === "tr" ? "en" : "tr";
            window.localStorage.setItem(STORAGE_KEY, next);
            return next;
        });
    };

    return (
        <LangContext.Provider value={{ lang, setLang, toggle, t: dict[lang] }}>
            {children}
        </LangContext.Provider>
    );
}

export function useLang() {
    const ctx = useContext(LangContext);
    if (!ctx) throw new Error("useLang must be used within LangProvider");
    return ctx;
}
