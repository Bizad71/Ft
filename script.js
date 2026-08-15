/* =========================================================
   مدیریت مراکز و گزارش کار
   ساختار:
   استان → بیمارستان → بخش → ربات → گزارش
   Supabase
========================================================= */


/* =========================================================
   تنظیمات
========================================================= */

const SUPABASE_URL =
    "https://nqfykfoxdcfgocfvcwxv.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_oLvZjzdOpAdErVP1sjPtzw_X5CGceRk";

const PASSWORD = "0111";

const MAX_ATTEMPTS = 3;

const LOCK_TIME =
    30 * 60 * 1000;


/* =========================================================
   Supabase
========================================================= */

let supabaseClient = null;


/* =========================================================
   استان‌ها
========================================================= */

const provinces = [

    ["tehran", "تهران"],
    ["alborz", "البرز"],
    ["azerbaijan-east", "آذربایجان شرقی"],
    ["azerbaijan-west", "آذربایجان غربی"],
    ["ardabil", "اردبیل"],
    ["isfahan", "اصفهان"],
    ["ilam", "ایلام"],
    ["bushehr", "بوشهر"],
    ["chahar-mahaal-bakhtiari", "چهارمحال و بختیاری"],
    ["khorasan-south", "خراسان جنوبی"],
    ["khorasan-razavi", "خراسان رضوی"],
    ["khorasan-north", "خراسان شمالی"],
    ["khuzestan", "خوزستان"],
    ["zanjan", "زنجان"],
    ["semnan", "سمنان"],
    ["sistan-baluchestan", "سیستان و بلوچستان"],
    ["fars", "فارس"],
    ["qazvin", "قزوین"],
    ["qom", "قم"],
    ["kurdistan", "کردستان"],
    ["kerman", "کرمان"],
    ["kermanshah", "کرمانشاه"],
    ["kohgiluyeh-boyer-ahmad", "کهگیلویه و بویراحمد"],
    ["golestan", "گلستان"],
    ["gilan", "گیلان"],
    ["lorestan", "لرستان"],
    ["mazandaran", "مازندران"],
    ["markazi", "مرکزی"],
    ["hormozgan", "هرمزگان"],
    ["hamadan", "همدان"],
    ["yazd", "یزد"]

];


/* =========================================================
   وضعیت
========================================================= */

let database = {

    centers: [],
    devices: [],
    visits: []

};

let currentProvince = "";

let currentProvinceName = "";

let currentCenter = null;

let currentSection = "";

let currentView = "hospitals";

let editingVisitId = null;


/* =========================================================
   ابزار DOM
========================================================= */

function getElement(id) {

    return document.getElementById(id);

}


function setValue(id, value) {

    const element =
        getElement(id);

    if (element) {

        element.value =
            value ?? "";

    }

}


function getValue(id) {

    const element =
        getElement(id);

    if (!element) {

        return "";

    }

    return String(
        element.value || ""
    ).trim();

}


/* =========================================================
   تاریخ شمسی
========================================================= */

function pad2(number) {

    return String(number)
        .padStart(2, "0");

}


function gregorianToJalali(
    gy,
    gm,
    gd
) {

    const g_d_m = [
        0,
        31,
        59,
        90,
        120,
        151,
        181,
        212,
        243,
        273,
        304,
        334
    ];

    let jy;

    if (gy > 1600) {

        jy = 979;

        gy -= 1600;

    } else {

        jy = 0;

        gy -= 621;

    }

    const gy2 =
        gm > 2
            ? gy + 1
            : gy;

    let days =
        365 * gy +
        Math.floor(
            (gy2 + 3) / 4
        ) -
        Math.floor(
            (gy2 + 99) / 100
        ) +
        Math.floor(
            (gy2 + 399) / 400
        ) -
        80 +
        gd +
        g_d_m[gm - 1];

    jy +=
        33 *
        Math.floor(
            days / 12053
        );

    days %= 12053;

    jy +=
        4 *
        Math.floor(
            days / 1461
        );

    days %= 1461;

    if (days > 365) {

        jy +=
            Math.floor(
                (days - 1) / 365
            );

        days =
            (days - 1) % 365;

    }

    let jm;

    if (days < 186) {

        jm =
            1 +
            Math.floor(
                days / 31
            );

    } else {

        jm =
            7 +
            Math.floor(
                (days - 186) / 30
            );

    }

    const jd =
        1 +
        (
            days < 186
                ? days % 31
                : (days - 186) % 30
        );

    return [
        jy,
        jm,
        jd
    ];

}


function isoToJalali(value) {

    if (!value) {

        return "";

    }

    const match =
        String(value).match(
            /^(\d{4})-(\d{2})-(\d{2})/
        );

    if (!match) {

        return value;

    }

    const result =
        gregorianToJalali(
            Number(match[1]),
            Number(match[2]),
            Number(match[3])
        );

    return (
        result[0] +
        "/" +
        pad2(result[1]) +
        "/" +
        pad2(result[2])
    );

}


function jalaliToGregorian(
    jy,
    jm,
    jd
) {

    let gy;

    if (jy > 979) {

        gy = 1600;

        jy -= 979;

    } else {

        gy = 621;

    }

    let days =
        365 * jy +
        Math.floor(jy / 33) * 8 +
        Math.floor(
            ((jy % 33) + 3) / 4
        ) +
        78 +
        jd +
        (
            jm < 7
                ? (jm - 1) * 31
                : (jm - 7) * 30 + 186
        );

    gy +=
        400 *
        Math.floor(
            days / 146097
        );

    days %= 146097;

    if (days > 36524) {

        gy +=
            100 *
            Math.floor(
                --days / 36524
            );

        days %= 36524;

        if (days >= 365) {

            days++;

        }

    }

    gy +=
        4 *
        Math.floor(
            days / 1461
        );

    days %= 1461;

    if (days > 365) {

        gy +=
            Math.floor(
                (days - 1) / 365
            );

        days =
            (days - 1) % 365;

    }

    let gd =
        days + 1;

    const sal_a = [
        0,
        31,
        (
            gy % 4 === 0 &&
            gy % 100 !== 0
        ) ||
        gy % 400 === 0
            ? 29
            : 28,
        31,
        30,
        31,
        30,
        31,
        31,
        30,
        31,
        30,
        31
    ];

    let gm = 0;

    while (
        gm < 13 &&
        gd > sal_a[gm]
    ) {

        gd -=
            sal_a[gm];

        gm++;

    }

    return [
        gy,
        gm,
        gd
    ];

}


function jalaliToISO(value) {

    if (!value) {

        return null;

    }

    const normalized =
        String(value)
            .replace(/-/g, "/")
            .trim();

    const match =
        normalized.match(
            /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/
        );

    if (!match) {

        return null;

    }

    const jy =
        Number(match[1]);

    const jm =
        Number(match[2]);

    const jd =
        Number(match[3]);

    if (
        jy < 1300 ||
        jm < 1 ||
        jm > 12 ||
        jd < 1 ||
        jd > 31
    ) {

        return null;

    }

    const result =
        jalaliToGregorian(
            jy,
            jm,
            jd
        );

    return (
        result[0] +
        "-" +
        pad2(result[1]) +
        "-" +
        pad2(result[2])
    );

}


function todayJalali() {

    const now =
        new Date();

    return isoToJalali(
        now.getFullYear() +
        "-" +
        pad2(
            now.getMonth() + 1
        ) +
        "-" +
        pad2(
            now.getDate()
        )
    );

}


/* =========================================================
   Supabase
========================================================= */

function initSupabase() {

    if (
        !window.supabase ||
        !window.supabase.createClient
    ) {

        console.error(
            "Supabase library not loaded"
        );

        return false;

    }

    supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_KEY
        );

    return true;

}


async function loadDatabase() {

    if (!supabaseClient) {

        if (!initSupabase()) {

            return false;

        }

    }

    try {

        const [
            centersResult,
            devicesResult,
            visitsResult
        ] =
            await Promise.all([

                supabaseClient
                    .from("centers")
                    .select("*")
                    .order(
                        "created_at",
                        {
                            ascending: true
                        }
                    ),

                supabaseClient
                    .from("devices")
                    .select("*")
                    .order(
                        "created_at",
                        {
                            ascending: true
                        }
                    ),

                supabaseClient
                    .from("visits")
                    .select("*")
                    .order(
                        "visit_date",
                        {
                            ascending: false
                        }
                    )

            ]);


        if (centersResult.error) {

            throw centersResult.error;

        }

        if (devicesResult.error) {

            throw devicesResult.error;

        }

        if (visitsResult.error) {

            throw visitsResult.error;

        }


        database = {

            centers:
                centersResult.data || [],

            devices:
                devicesResult.data || [],

            visits:
                visitsResult.data || []

        };


        return true;

    } catch (error) {

        console.error(
            "DATABASE ERROR:",
            error
        );

        alert(
            "خطا در دریافت اطلاعات پایگاه داده:\n" +
            error.message
        );

        return false;

    }

}


/* =========================================================
   ورود
========================================================= */

function checkLogin() {

    const lockUntil =
        Number(
            localStorage.getItem(
                "site_lock_until"
            ) || 0
        );

    if (
        Date.now() <
        lockUntil
    ) {

        showLockMessage();

        return;

    }

    const password =
        getValue(
            "passwordInput"
        );

    if (
        password === PASSWORD
    ) {

        localStorage.removeItem(
            "site_login_attempts"
        );

        localStorage.removeItem(
            "site_lock_until"
        );

        getElement(
            "loginPage"
        )?.classList.add(
            "hidden"
        );

        getElement(
            "app"
        )?.classList.remove(
            "hidden"
        );

        renderProvinces();

        return;

    }

    let attempts =
        Number(
            localStorage.getItem(
                "site_login_attempts"
            ) || 0
        );

    attempts++;

    if (
        attempts >= MAX_ATTEMPTS
    ) {

        localStorage.setItem(
            "site_login_attempts",
            "0"
        );

        localStorage.setItem(
            "site_lock_until",
            String(
                Date.now() +
                LOCK_TIME
            )
        );

        setValue(
            "passwordInput",
            ""
        );

        showLockMessage();

        return;

    }

    localStorage.setItem(
        "site_login_attempts",
        String(attempts)
    );

    const message =
        getElement(
            "loginMessage"
        );

    if (message) {

        message.textContent =
            "رمز اشتباه است. " +
            (
                MAX_ATTEMPTS -
                attempts
            ) +
            " فرصت باقی مانده.";

    }

    setValue(
        "passwordInput",
        ""
    );

}


function showLockMessage() {

    const lockUntil =
        Number(
            localStorage.getItem(
                "site_lock_until"
            ) || 0
        );

    const diff =
        lockUntil -
        Date.now();

    if (diff <= 0) {

        localStorage.removeItem(
            "site_lock_until"
        );

        localStorage.removeItem(
            "site_login_attempts"
        );

        return;

    }

    const message =
        getElement(
            "loginMessage"
        );

    if (message) {

        message.textContent =
            "ورود موقتاً قفل شده است. " +
            Math.ceil(
                diff / 60000
            ) +
            " دقیقه دیگر دوباره تلاش کنید.";

    }

}


/* =========================================================
   استان‌ها
========================================================= */

function renderProvinces() {

    const grid =
        getElement(
            "provinceGrid"
        );

    if (!grid) {

        return;

    }

    grid.innerHTML = "";

    provinces.forEach(
        function(province) {

            const button =
                document.createElement(
                    "button"
                );

            button.type =
                "button";

            button.className =
                "province-card";

            button.textContent =
                province[1];

            button.addEventListener(
                "click",
                function() {

                    openProvince(
                        province[0],
                        province[1]
                    );

                }
            );

            grid.appendChild(
                button
            );

        }
    );

}


/* =========================================================
   باز کردن استان
========================================================= */

async function openProvince(
    key,
    name
) {

    currentProvince =
        key;

    currentProvinceName =
        name;

    currentCenter =
        null;

    currentSection =
        "";

    currentView =
        "hospitals";

    await loadDatabase();

    getElement(
        "provincePage"
    )?.classList.add(
        "hidden"
    );

    getElement(
        "reportPage"
    )?.classList.add(
        "hidden"
    );

    getElement(
        "centersPage"
    )?.classList.remove(
        "hidden"
    );

    getElement(
        "provinceTitle"
    ).textContent =
        "بیمارستان‌های " +
        name;

    renderHierarchy();

}


/* =========================================================
   بیمارستان‌ها
========================================================= */

function getProvinceHospitals() {

    return database.centers.filter(
        function(center) {

            return (
                center.province ===
                currentProvince
            );

        }
    );

}


function renderHospitals() {

    const grid =
        getElement(
            "hospitalGrid"
        );

    const empty =
        getElement(
            "emptyHospitals"
        );

    if (!grid) {

        return;

    }

    grid.innerHTML = "";

    const hospitals =
        getProvinceHospitals();


    if (!hospitals.length) {

        empty?.classList.remove(
            "hidden"
        );

        return;

    }


    empty?.classList.add(
        "hidden"
    );


    hospitals.forEach(
        function(center) {

            const box =
                document.createElement(
                    "button"
                );

            box.type =
                "button";

            box.className =
                "hospital-card";


            const icon =
                document.createElement(
                    "div"
                );

            icon.className =
                "hospital-icon";

            icon.textContent =
                "🏥";


            const title =
                document.createElement(
                    "div"
                );

            title.className =
                "hospital-title";

            title.textContent =
                center.name;


            const devices =
                getCenterDevices(
                    center.id
                );


            const info =
                document.createElement(
                    "div"
                );

            info.className =
                "hospital-info";

            info.textContent =
                devices.length +
                " ربات";


            box.appendChild(
                icon
            );

            box.appendChild(
                title
            );

            box.appendChild(
                info
            );


            box.addEventListener(
                "click",
                function() {

                    openHospital(
                        center
                    );

                }
            );


            grid.appendChild(
                box
            );

        }
    );

}


/* =========================================================
   باز کردن بیمارستان
========================================================= */

function openHospital(
    center
) {

    currentCenter =
        center;

    currentSection =
        "";

    currentView =
        "sections";

    renderHierarchy();

}


/* =========================================================
   گرفتن بخش‌های بیمارستان
========================================================= */

function getCenterSections(
    centerId
) {

    const devices =
        getCenterDevices(
            centerId
        );

    const sections = [];


    devices.forEach(
        function(device) {

            const name =
                String(
                    device.section_name ||
                    ""
                ).trim();


            if (
                name &&
                !sections.includes(name)
            ) {

                sections.push(name);

            }

        }
    );


    return sections.sort(
        function(a, b) {

            return a.localeCompare(
                b,
                "fa"
            );

        }
    );

}


/* =========================================================
   نمایش بخش‌ها
========================================================= */

function renderSections() {

    const grid =
        getElement(
            "sectionGrid"
        );

    const empty =
        getElement(
            "emptySections"
        );

    if (!grid) {

        return;

    }

    grid.innerHTML = "";


    if (!currentCenter) {

        return;

    }


    const sections =
        getCenterSections(
            currentCenter.id
        );


    getElement(
        "selectedHospitalText"
    ).textContent =
        "بیمارستان: " +
        currentCenter.name;


    if (!sections.length) {

        empty?.classList.remove(
            "hidden"
        );

        return;

    }


    empty?.classList.add(
        "hidden"
    );


    sections.forEach(
        function(sectionName) {

            const devices =
                getCenterDevices(
                    currentCenter.id
                ).filter(
                    function(device) {

                        return String(
                            device.section_name ||
                            ""
                        ).trim() ===
                        sectionName;

                    }
                );


            const box =
                document.createElement(
                    "button"
                );

            box.type =
                "button";

            box.className =
                "section-card";


            const icon =
                document.createElement(
                    "div"
                );

            icon.className =
                "section-icon";

            icon.textContent =
                "📂";


            const title =
                document.createElement(
                    "div"
                );

            title.className =
                "section-title";

            title.textContent =
                sectionName;


            const info =
                document.createElement(
                    "div"
                );

            info.className =
                "section-info-count";

            info.textContent =
                devices.length +
                " ربات";


            box.appendChild(
                icon
            );

            box.appendChild(
                title
            );

            box.appendChild(
                info
            );


            box.addEventListener(
                "click",
                function() {

                    openSection(
                        sectionName
                    );

                }
            );


            grid.appendChild(
                box
            );

        }
    );

}


/* =========================================================
   باز کردن بخش
========================================================= */

function openSection(
    sectionName
) {

    currentSection =
        sectionName;

    currentView =
        "robots";

    renderHierarchy();

}


/* =========================================================
   نمایش ربات‌ها
========================================================= */

function renderRobots() {

    const grid =
        getElement(
            "robotGrid"
        );

    const empty =
        getElement(
            "emptyRobots"
        );

    if (!grid || !currentCenter) {

        return;

    }

    grid.innerHTML = "";


    getElement(
        "selectedSectionText"
    ).textContent =
        "بیمارستان: " +
        currentCenter.name +
        " | بخش: " +
        currentSection;


    const robots =
        getCenterDevices(
            currentCenter.id
        ).filter(
            function(device) {

                return String(
                    device.section_name ||
                    ""
                ).trim() ===
                String(
                    currentSection
                ).trim();

            }
        );


    if (!robots.length) {

        empty?.classList.remove(
            "hidden"
        );

        return;

    }


    empty?.classList.add(
        "hidden"
    );


    robots.forEach(
        function(device) {

            const box =
                document.createElement(
                    "div"
                );

            box.className =
                "robot-card";


            const title =
                document.createElement(
                    "h3"
                );

            title.textContent =
                "🤖 " +
                (
                    device.model ||
                    "-"
                );


            const serial =
                document.createElement(
                    "div"
                );

            serial.className =
                "robot-detail";

            serial.innerHTML =
                "<strong>شماره سریال:</strong> " +
                escapeHTML(
                    device.serial || "-"
                );


            const model =
                document.createElement(
                    "div"
                );

            model.className =
                "robot-detail";

            model.innerHTML =
                "<strong>مدل:</strong> " +
                escapeHTML(
                    device.model || "-"
                );


            const section =
                document.createElement(
                    "div"
                );

            section.className =
                "robot-detail";

            section.innerHTML =
                "<strong>بخش:</strong> " +
                escapeHTML(
                    device.section_name || "-"
                );


            box.appendChild(
                title
            );

            box.appendChild(
                model
            );

            box.appendChild(
                serial
            );

            box.appendChild(
                section
            );


            /* لینک مشخصات */

            if (
                device.spec_link
            ) {

                const link =
                    document.createElement(
                        "a"
                    );

                link.href =
                    device.spec_link;

                link.target =
                    "_blank";

                link.rel =
                    "noopener noreferrer";

                link.className =
                    "robot-link";

                link.textContent =
                    "🔗 دانلود / مشاهده مشخصات ربات";


                box.appendChild(
                    link
                );

            } else {

                const noLink =
                    document.createElement(
                        "div"
                    );

                noLink.className =
                    "no-link";

                noLink.textContent =
                    "لینک مشخصات ثبت نشده است.";

                box.appendChild(
                    noLink
                );

            }


            /* دکمه گزارش جدید */

            const reportButton =
                document.createElement(
                    "button"
                );

            reportButton.type =
                "button";

            reportButton.className =
                "btn btn-primary robot-report-button";

            reportButton.textContent =
                "➕ ثبت گزارش کار جدید";


            reportButton.addEventListener(
                "click",
                function() {

                    openNewReportForDevice(
                        device
                    );

                }
            );


            box.appendChild(
                reportButton
            );


            /* سابقه */

            const visits =
                database.visits.filter(
                    function(visit) {

                        return String(
                            visit.device_id
                        ) ===
                        String(
                            device.id
                        );

                    }
                );


            const historyTitle =
                document.createElement(
                    "h4"
                );

            historyTitle.className =
                "robot-history-title";

            historyTitle.textContent =
                "📚 سابقه گزارش‌ها (" +
                visits.length +
                ")";


            box.appendChild(
                historyTitle
            );


            if (!visits.length) {

                const noHistory =
                    document.createElement(
                        "div"
                    );

                noHistory.className =
                    "no-history";

                noHistory.textContent =
                    "برای این ربات هنوز گزارشی ثبت نشده است.";

                box.appendChild(
                    noHistory
                );

            } else {

                const historyList =
                    document.createElement(
                        "div"
                    );

                historyList.className =
                    "robot-history-list";


                visits.forEach(
                    function(visit, index) {

                        const historyItem =
                            document.createElement(
                                "div"
                            );

                        historyItem.className =
                            "robot-history-item";


                        const historyInfo =
                            document.createElement(
                                "div"
                            );

                        historyInfo.innerHTML =
                            "<strong>گزارش " +
                            (index + 1) +
                            "</strong><br>" +
                            "تاریخ: " +
                            escapeHTML(
                                isoToJalali(
                                    visit.visit_date
                                )
                            );


                        const historyButtons =
                            document.createElement(
                                "div"
                            );

                        historyButtons.className =
                            "history-actions";


                        const viewButton =
                            document.createElement(
                                "button"
                            );

                        viewButton.className =
                            "btn btn-blue";

                        viewButton.textContent =
                            "👁 مشاهده";

                        viewButton.onclick =
                            function() {

                                viewVisit(
                                    visit.id
                                );

                            };


                        const editButton =
                            document.createElement(
                                "button"
                            );

                        editButton.className =
                            "btn btn-warning";

                        editButton.textContent =
                            "✏️ ویرایش";

                        editButton.onclick =
                            function() {

                                editVisit(
                                    visit.id
                                );

                            };


                        const pdfButton =
                            document.createElement(
                                "button"
                            );

                        pdfButton.className =
                            "btn btn-gray";

                        pdfButton.textContent =
                            "🖨 PDF";

                        pdfButton.onclick =
                            function() {

                                printVisit(
                                    visit.id
                                );

                            };


                        const deleteButton =
                            document.createElement(
                                "button"
                            );

                        deleteButton.className =
                            "btn btn-danger";

                        deleteButton.textContent =
                            "🗑 حذف";

                        deleteButton.onclick =
                            function() {

                                deleteVisit(
                                    visit.id
                                );

                            };


                        historyButtons.appendChild(
                            viewButton
                        );

                        historyButtons.appendChild(
                            editButton
                        );

                        historyButtons.appendChild(
                            pdfButton
                        );

                        historyButtons.appendChild(
                            deleteButton
                        );


                        historyItem.appendChild(
                            historyInfo
                        );

                        historyItem.appendChild(
                            historyButtons
                        );


                        historyList.appendChild(
                            historyItem
                        );

                    }
                );


                box.appendChild(
                    historyList
                );

            }


            grid.appendChild(
                box
            );

        }
    );

}


/* =========================================================
   نمایش صحیح صفحه فعلی
========================================================= */

function renderHierarchy() {

    const hospitalToolbar =
        getElement(
            "hospitalsToolbar"
        );

    const sectionToolbar =
        getElement(
            "sectionsToolbar"
        );

    const robotToolbar =
        getElement(
            "robotsToolbar"
        );


    const hospitalGrid =
        getElement(
            "hospitalGrid"
        );

    const sectionGrid =
        getElement(
            "sectionGrid"
        );

    const robotGrid =
        getElement(
            "robotGrid"
        );


    const emptyHospitals =
        getElement(
            "emptyHospitals"
        );

    const emptySections =
        getElement(
            "emptySections"
        );

    const emptyRobots =
        getElement(
            "emptyRobots"
        );


    hospitalToolbar?.classList.add(
        "hidden"
    );

    sectionToolbar?.classList.add(
        "hidden"
    );

    robotToolbar?.classList.add(
        "hidden"
    );


    hospitalGrid?.classList.add(
        "hidden"
    );

    sectionGrid?.classList.add(
        "hidden"
    );

    robotGrid?.classList.add(
        "hidden"
    );


    emptyHospitals?.classList.add(
        "hidden"
    );

    emptySections?.classList.add(
        "hidden"
    );

    emptyRobots?.classList.add(
        "hidden"
    );


    if (
        currentView ===
        "hospitals"
    ) {

        getElement(
            "provinceTitle"
        ).textContent =
            "بیمارستان‌های " +
            currentProvinceName;


        hospitalToolbar?.classList.remove(
            "hidden"
        );

        hospitalGrid?.classList.remove(
            "hidden"
        );


        setBreadcrumb([
            currentProvinceName
        ]);


        renderHospitals();

        return;

    }


    if (
        currentView ===
        "sections"
    ) {

        getElement(
            "provinceTitle"
        ).textContent =
            currentCenter.name;


        sectionToolbar?.classList.remove(
            "hidden"
        );

        sectionGrid?.classList.remove(
            "hidden"
        );


        setBreadcrumb([
            currentProvinceName,
            currentCenter.name
        ]);


        renderSections();

        return;

    }


    if (
        currentView ===
        "robots"
    ) {

        getElement(
            "provinceTitle"
        ).textContent =
            currentSection;


        robotToolbar?.classList.remove(
            "hidden"
        );

        robotGrid?.classList.remove(
            "hidden"
        );


        setBreadcrumb([
            currentProvinceName,
            currentCenter.name,
            currentSection
        ]);


        renderRobots();

    }

}


/* =========================================================
   مسیر بالا
========================================================= */

function setBreadcrumb(
    items
) {

    const breadcrumb =
        getElement(
            "breadcrumb"
        );

    if (!breadcrumb) {

        return;

    }

    breadcrumb.innerHTML = "";

    items.forEach(
        function(item, index) {

            const span =
                document.createElement(
                    "span"
                );

            span.textContent =
                item;

            breadcrumb.appendChild(
                span
            );


            if (
                index <
                items.length - 1
            ) {

                const arrow =
                    document.createElement(
                        "span"
                    );

                arrow.className =
                    "breadcrumb-arrow";

                arrow.textContent =
                    "‹";

                breadcrumb.appendChild(
                    arrow
                );

            }

        }
    );

}


/* =========================================================
   برگشت
========================================================= */

function goBackHierarchy() {

    if (
        currentView ===
        "robots"
    ) {

        currentView =
            "sections";

        currentSection =
            "";

        renderHierarchy();

        return;

    }


    if (
        currentView ===
        "sections"
    ) {

        currentView =
            "hospitals";

        currentCenter =
            null;

        renderHierarchy();

        return;

    }

}


/* =========================================================
   مرکز / بیمارستان جدید
========================================================= */

function createNewCenter() {

    currentCenter =
        null;

    currentSection =
        "";

    editingVisitId =
        null;


    getElement(
        "centersPage"
    )?.classList.add(
        "hidden"
    );

    getElement(
        "reportPage"
    )?.classList.remove(
        "hidden"
    );


    getElement(
        "reportPageTitle"
    ).textContent =
        "ثبت بیمارستان و اولین ربات";


    getElement(
        "centerName"
    )?.removeAttribute(
        "readonly"
    );


    setValue(
        "centerName",
        ""
    );

    clearVisitFields();


    getElement(
        "cancelEditBtn"
    )?.classList.add(
        "hidden"
    );


    renderHistory();

}


/* =========================================================
   ثبت ربات جدید برای بیمارستان
========================================================= */

function createNewRobot(
    center,
    section = ""
) {

    currentCenter =
        center;

    currentSection =
        section;

    editingVisitId =
        null;


    getElement(
        "centersPage"
    )?.classList.add(
        "hidden"
    );

    getElement(
        "reportPage"
    )?.classList.remove(
        "hidden"
    );


    getElement(
        "reportPageTitle"
    ).textContent =
        "ثبت ربات جدید";


    setValue(
        "centerName",
        center.name
    );


    getElement(
        "centerName"
    )?.setAttribute(
        "readonly",
        "readonly"
    );


    clearVisitFields();


    setValue(
        "centerName",
        center.name
    );

    setValue(
        "deviceSection",
        section
    );


    getElement(
        "cancelEditBtn"
    )?.classList.add(
        "hidden"
    );


    renderHistory();

}


function openNewReportForDevice(
    device
) {

    currentCenter =
        database.centers.find(
            function(center) {

                return String(
                    center.id
                ) ===
                String(
                    device.center_id
                );

            }
        );


    if (!currentCenter) {

        alert(
            "بیمارستان ربات پیدا نشد."
        );

        return;

    }


    currentSection =
        device.section_name || "";


    editingVisitId =
        null;


    getElement(
        "centersPage"
    )?.classList.add(
        "hidden"
    );

    getElement(
        "reportPage"
    )?.classList.remove(
        "hidden"
    );


    getElement(
        "reportPageTitle"
    ).textContent =
        "ثبت گزارش کار جدید";


    setValue(
        "centerName",
        currentCenter.name
    );


    getElement(
        "centerName"
    )?.setAttribute(
        "readonly",
        "readonly"
    );


    clearVisitFields();


    setValue(
        "centerName",
        currentCenter.name
    );

    setValue(
        "deviceSection",
        device.section_name || ""
    );

    setValue(
        "deviceModel",
        device.model || ""
    );


    loadSerialNumbers();


    setValue(
        "serialNumber",
        device.serial || ""
    );


    setValue(
        "deviceSpecLink",
        device.spec_link || ""
    );


    renderHistory();


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================================
   مرکز موجود - برای سازگاری
========================================================= */

function openExistingCenter(
    center
) {

    openHospital(
        center
    );

}


/* =========================================================
   دستگاه‌ها
========================================================= */

function getCenterDevices(
    centerId
) {

    return database.devices.filter(
        function(device) {

            return String(
                device.center_id
            ) ===
            String(
                centerId
            );

        }
    );

}


/* =========================================================
   فرم خالی
========================================================= */

function clearVisitFields() {

    setValue(
        "visitDate",
        todayJalali()
    );


    setValue(
        "deviceModel",
        ""
    );


    resetSerialSelect();


    setValue(
        "newSerialNumber",
        ""
    );


    getElement(
        "newSerialNumber"
    )?.classList.add(
        "hidden"
    );


    setValue(
        "deviceSection",
        currentSection || ""
    );


    setValue(
        "deviceSpecLink",
        ""
    );


    setValue(
        "problemSubject",
        ""
    );


    setValue(
        "reportedBy",
        ""
    );


    setValue(
        "problemDate",
        todayJalali()
    );


    setValue(
        "description",
        ""
    );


    setValue(
        "expertName",
        "حیدریانی"
    );


    setValue(
        "expertDate",
        todayJalali()
    );


    setValue(
        "entryTime",
        ""
    );


    setValue(
        "exitTime",
        ""
    );


    setValue(
        "receiverName",
        ""
    );


    setValue(
        "signatureExpertName",
        "حیدریانی"
    );

}


/* =========================================================
   سریال
========================================================= */

function resetSerialSelect() {

    const select =
        getElement(
            "serialNumber"
        );

    if (!select) {

        return;

    }

    select.innerHTML = "";


    const option =
        document.createElement(
            "option"
        );

    option.value = "";

    option.textContent =
        "ابتدا مدل دستگاه را انتخاب کنید";


    select.appendChild(
        option
    );

}


function loadSerialNumbers() {

    const model =
        getValue(
            "deviceModel"
        );

    const select =
        getElement(
            "serialNumber"
        );


    if (!select) {

        return;

    }


    select.innerHTML = "";


    if (!model) {

        resetSerialSelect();

        return;

    }


    const first =
        document.createElement(
            "option"
        );

    first.value = "";

    first.textContent =
        "انتخاب شماره سریال";


    select.appendChild(
        first
    );


    if (!currentCenter) {

        return;

    }


    const devices =
        getCenterDevices(
            currentCenter.id
        );


    const serials = [];


    devices.forEach(
        function(device) {

            if (
                device.model === model &&
                device.serial &&
                !serials.includes(
                    device.serial
                )
            ) {

                serials.push(
                    device.serial
                );

            }

        }
    );


    serials.forEach(
        function(serial) {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                serial;

            option.textContent =
                serial;

            select.appendChild(
                option
            );

        }
    );

}


function toggleNewSerial() {

    const input =
        getElement(
            "newSerialNumber"
        );

    if (!input) {

        return;

    }

    input.classList.toggle(
        "hidden"
    );


    if (
        !input.classList.contains(
            "hidden"
        )
    ) {

        input.focus();

    }

}


function getSelectedSerial() {

    const input =
        getElement(
            "newSerialNumber"
        );


    if (
        input &&
        !input.classList.contains(
            "hidden"
        ) &&
        input.value.trim()
    ) {

        return input.value.trim();

    }


    return getValue(
        "serialNumber"
    );

}


/* =========================================================
   اطلاعات فرم
========================================================= */

function getFormData() {

    return {

        centerName:
            getValue(
                "centerName"
            ),

        deviceSection:
            getValue(
                "deviceSection"
            ),

        visitDate:
            getValue(
                "visitDate"
            ),

        deviceModel:
            getValue(
                "deviceModel"
            ),

        serialNumber:
            getSelectedSerial(),

        deviceSpecLink:
            getValue(
                "deviceSpecLink"
            ),

        problemSubject:
            getValue(
                "problemSubject"
            ),

        reportedBy:
            getValue(
                "reportedBy"
            ),

        problemDate:
            getValue(
                "problemDate"
            ),

        description:
            getValue(
                "description"
            ),

        expertName:
            getValue(
                "expertName"
            ),

        expertDate:
            getValue(
                "expertDate"
            ),

        entryTime:
            getValue(
                "entryTime"
            ),

        exitTime:
            getValue(
                "exitTime"
            ),

        receiverName:
            getValue(
                "receiverName"
            ),

        signatureExpertName:
            getValue(
                "signatureExpertName"
            )

    };

}


/* =========================================================
   پیدا کردن / ساخت بیمارستان
========================================================= */

async function getOrCreateCenter(
    data
) {

    if (currentCenter) {

        return currentCenter;

    }


    const name =
        String(
            data.centerName || ""
        ).trim();


    let center =
        database.centers.find(
            function(item) {

                return (
                    item.province ===
                    currentProvince
                    &&
                    String(
                        item.name || ""
                    )
                        .trim()
                        .toLowerCase() ===
                    name.toLowerCase()
                );

            }
        );


    if (center) {

        currentCenter =
            center;

        return center;

    }


    const result =
        await supabaseClient
            .from("centers")
            .insert({

                province:
                    currentProvince,

                name:
                    name,

                section:
                    "",

                phone:
                    "",

                manager:
                    ""

            })
            .select()
            .single();


    if (result.error) {

        throw result.error;

    }


    currentCenter =
        result.data;


    database.centers.push(
        result.data
    );


    return result.data;

}


/* =========================================================
   پیدا کردن / ساخت ربات
========================================================= */

async function getOrCreateDevice(
    centerId,
    model,
    serial,
    sectionName,
    specLink
) {

    let device =
        database.devices.find(
            function(item) {

                return (
                    String(
                        item.center_id
                    ) ===
                    String(
                        centerId
                    )
                    &&
                    item.model ===
                    model
                    &&
                    String(
                        item.serial
                    ) ===
                    String(
                        serial
                    )
                );

            }
        );


    if (device) {

        const updateData = {

            section_name:
                sectionName || "",

            spec_link:
                specLink || ""

        };


        const result =
            await supabaseClient
                .from("devices")
                .update(
                    updateData
                )
                .eq(
                    "id",
                    device.id
                )
                .select()
                .single();


        if (result.error) {

            throw result.error;

        }


        Object.assign(
            device,
            result.data
        );


        return device;

    }


    const result =
        await supabaseClient
            .from("devices")
            .insert({

                center_id:
                    centerId,

                model:
                    model,

                serial:
                    serial,

                section_name:
                    sectionName || "",

                spec_link:
                    specLink || ""

            })
            .select()
            .single();


    if (result.error) {

        throw result.error;

    }


    database.devices.push(
        result.data
    );


    return result.data;

}


/* =========================================================
   ذخیره گزارش
========================================================= */

async function saveVisit() {

    const data =
        getFormData();


    if (!data.centerName) {

        alert(
            "نام بیمارستان را وارد کنید."
        );

        return;

    }


    if (!data.deviceSection) {

        alert(
            "بخش را وارد کنید."
        );

        return;

    }


    if (!data.visitDate) {

        alert(
            "تاریخ مراجعه را وارد کنید."
        );

        return;

    }


    const visitDate =
        jalaliToISO(
            data.visitDate
        );


    if (!visitDate) {

        alert(
            "تاریخ مراجعه صحیح نیست.\nمثال: 1405/05/18"
        );

        return;

    }


    let problemDate = null;


    if (data.problemDate) {

        problemDate =
            jalaliToISO(
                data.problemDate
            );


        if (!problemDate) {

            alert(
                "تاریخ اعلام مشکل صحیح نیست."
            );

            return;

        }

    }


    if (!data.deviceModel) {

        alert(
            "مدل دستگاه را انتخاب کنید."
        );

        return;

    }


    if (!data.serialNumber) {

        alert(
            "شماره سریال را وارد یا انتخاب کنید."
        );

        return;

    }


    let expertDate = null;


    if (data.expertDate) {

        expertDate =
            jalaliToISO(
                data.expertDate
            );


        if (!expertDate) {

            alert(
                "تاریخ کارشناس صحیح نیست."
            );

            return;

        }

    }


    try {

        const center =
            await getOrCreateCenter(
                data
            );


        const device =
            await getOrCreateDevice(
                center.id,
                data.deviceModel,
                data.serialNumber,
                data.deviceSection,
                data.deviceSpecLink
            );


        const payload = {

            center_id:
                center.id,

            device_id:
                device.id,

            visit_date:
                visitDate,

            problem_subject:
                data.problemSubject || "",

            reported_by:
                data.reportedBy || "",

            problem_date:
                problemDate,

            description:
                data.description || "",

            expert_name:
                data.expertName || "",

            entry_time:
                data.entryTime || null,

            exit_time:
                data.exitTime || null,

            receiver_name:
                data.receiverName || "",

            expert_signature:
                data.signatureExpertName || ""

        };


        let result;


        if (editingVisitId) {

            result =
                await supabaseClient
                    .from("visits")
                    .update(
                        payload
                    )
                    .eq(
                        "id",
                        editingVisitId
                    );

        } else {

            result =
                await supabaseClient
                    .from("visits")
                    .insert(
                        payload
                    );

        }


        if (result.error) {

            throw result.error;

        }


        alert(
            editingVisitId
                ?
                "گزارش با موفقیت ویرایش شد."
                :
                "گزارش با موفقیت ذخیره شد."
        );


        editingVisitId =
            null;


        getElement(
            "cancelEditBtn"
        )?.classList.add(
            "hidden"
        );


        await loadDatabase();


        currentCenter =
            database.centers.find(
                function(item) {

                    return String(
                        item.id
                    ) ===
                    String(
                        center.id
                    );

                }
            );


        currentSection =
            data.deviceSection;


        clearVisitFields();


        getElement(
            "centerName"
        )?.setAttribute(
            "readonly",
            "readonly"
        );


        setValue(
            "centerName",
            currentCenter.name
        );

        setValue(
            "deviceSection",
            currentSection
        );


        renderHistory();

    } catch (error) {

        console.error(
            "SAVE ERROR:",
            error
        );

        alert(
            "ذخیره اطلاعات انجام نشد:\n" +
            error.message
        );

    }

}


/* =========================================================
   تاریخچه فرم گزارش
========================================================= */

function renderHistory() {

    const history =
        getElement(
            "history"
        );


    if (!history) {

        return;

    }


    history.innerHTML = "";


    if (!currentCenter) {

        history.innerHTML =
            "<p class='empty-message'>هنوز گزارشی ثبت نشده است.</p>";

        return;

    }


    const visits =
        database.visits.filter(
            function(visit) {

                return String(
                    visit.center_id
                ) ===
                String(
                    currentCenter.id
                );

            }
        );


    if (!visits.length) {

        history.innerHTML =
            "<p class='empty-message'>هنوز گزارشی برای این بیمارستان ثبت نشده است.</p>";

        return;

    }


    visits.forEach(
        function(visit, index) {

            const device =
                getVisitDevice(
                    visit
                );


            const box =
                document.createElement(
                    "div"
                );

            box.className =
                "history-item";


            const title =
                document.createElement(
                    "h3"
                );

            title.textContent =
                "گزارش " +
                (index + 1) +
                " — " +
                isoToJalali(
                    visit.visit_date
                );


            const info =
                document.createElement(
                    "p"
                );

            info.textContent =
                "دستگاه: " +
                (
                    device?.model ||
                    "-"
                ) +
                " | سریال: " +
                (
                    device?.serial ||
                    "-"
                ) +
                " | بخش: " +
                (
                    device?.section_name ||
                    "-"
                );


            const subject =
                document.createElement(
                    "p"
                );

            subject.textContent =
                "موضوع مشکل: " +
                (
                    visit.problem_subject ||
                    "-"
                );


            box.appendChild(
                title
            );

            box.appendChild(
                info
            );

            box.appendChild(
                subject
            );


            const actions =
                document.createElement(
                    "div"
                );

            actions.className =
                "history-actions";


            const viewButton =
                document.createElement(
                    "button"
                );

            viewButton.className =
                "btn btn-blue";

            viewButton.textContent =
                "👁 مشاهده";

            viewButton.onclick =
                function() {

                    viewVisit(
                        visit.id
                    );

                };


            const editButton =
                document.createElement(
                    "button"
                );

            editButton.className =
                "btn btn-warning";

            editButton.textContent =
                "✏️ ویرایش";

            editButton.onclick =
                function() {

                    editVisit(
                        visit.id
                    );

                };


            const pdfButton =
                document.createElement(
                    "button"
                );

            pdfButton.className =
                "btn btn-gray";

            pdfButton.textContent =
                "🖨 PDF";

            pdfButton.onclick =
                function() {

                    printVisit(
                        visit.id
                    );

                };


            const deleteButton =
                document.createElement(
                    "button"
                );

            deleteButton.className =
                "btn btn-danger";

            deleteButton.textContent =
                "🗑 حذف";

            deleteButton.onclick =
                function() {

                    deleteVisit(
                        visit.id
                    );

                };


            actions.appendChild(
                viewButton
            );

            actions.appendChild(
                editButton
            );

            actions.appendChild(
                pdfButton
            );

            actions.appendChild(
                deleteButton
            );


            box.appendChild(
                actions
            );


            history.appendChild(
                box
            );

        }
    );

}


/* =========================================================
   گزارش
========================================================= */

function findVisit(
    visitId
) {

    return database.visits.find(
        function(visit) {

            return String(
                visit.id
            ) ===
            String(
                visitId
            );

        }
    );

}


function getVisitDevice(
    visit
) {

    return database.devices.find(
        function(device) {

            return String(
                device.id
            ) ===
            String(
                visit.device_id
            );

        }
    );

}


/* =========================================================
   مشاهده گزارش
========================================================= */

function viewVisit(
    visitId
) {

    const visit =
        findVisit(
            visitId
        );


    if (!visit) {

        return;

    }


    const device =
        getVisitDevice(
            visit
        );


    const history =
        getElement(
            "history"
        );


    if (!history) {

        return;

    }


    const content =
        document.createElement(
            "div"
        );

    content.className =
        "visit-details";


    content.innerHTML = `

        <div class="visit-details-card">

            <h2>
                📋 اطلاعات کامل گزارش
            </h2>

            <div class="visit-details-row">

                <div class="visit-detail">
                    <strong>نام بیمارستان</strong>
                    ${escapeHTML(
                        currentCenter?.name || "-"
                    )}
                </div>

                <div class="visit-detail">
                    <strong>بخش</strong>
                    ${escapeHTML(
                        device?.section_name || "-"
                    )}
                </div>

                <div class="visit-detail">
                    <strong>تاریخ مراجعه</strong>
                    ${escapeHTML(
                        isoToJalali(
                            visit.visit_date
                        )
                    )}
                </div>

                <div class="visit-detail">
                    <strong>مدل دستگاه</strong>
                    ${escapeHTML(
                        device?.model || "-"
                    )}
                </div>

                <div class="visit-detail">
                    <strong>شماره سریال</strong>
                    ${escapeHTML(
                        device?.serial || "-"
                    )}
                </div>

                <div class="visit-detail">
                    <strong>موضوع مشکل</strong>
                    ${escapeHTML(
                        visit.problem_subject || "-"
                    )}
                </div>

                <div class="visit-detail">
                    <strong>گزارش شده توسط</strong>
                    ${escapeHTML(
                        visit.reported_by || "-"
                    )}
                </div>

                <div class="visit-detail">
                    <strong>تاریخ اعلام مشکل</strong>
                    ${escapeHTML(
                        isoToJalali(
                            visit.problem_date
                        ) || "-"
                    )}
                </div>

            </div>


            ${
                device?.spec_link
                    ?
                    `
                    <div class="visit-file-box">

                        <strong>
                            مشخصات ربات:
                        </strong>

                        <a
                            href="${escapeHTML(
                                device.spec_link
                            )}"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="file-link"
                        >
                            🔗 مشاهده / دانلود مشخصات
                        </a>

                    </div>
                    `
                    :
                    ""
            }


            <div class="description">

                <h3>
                    📝 توضیحات
                </h3>

                <p>
                    با مراجعه به مرکز و بررسی ربات،
                </p>

                <p style="white-space:pre-wrap">
                    ${escapeHTML(
                        visit.description || ""
                    )}
                </p>

                <p>
                    ربات تست و تحویل مسئول مربوطه گردید.
                </p>

            </div>


            <div class="visit-details-row">

                <div class="visit-detail">
                    <strong>کارشناس</strong>
                    ${escapeHTML(
                        visit.expert_name || "-"
                    )}
                </div>

                <div class="visit-detail">
                    <strong>ساعت ورود</strong>
                    ${escapeHTML(
                        visit.entry_time || "-"
                    )}
                </div>

                <div class="visit-detail">
                    <strong>ساعت خروج</strong>
                    ${escapeHTML(
                        visit.exit_time || "-"
                    )}
                </div>

                <div class="visit-detail">
                    <strong>تحویل گیرنده</strong>
                    ${escapeHTML(
                        visit.receiver_name || "-"
                    )}
                </div>

                <div class="visit-detail">
                    <strong>نام کارشناس امضا</strong>
                    ${escapeHTML(
                        visit.expert_signature || "-"
                    )}
                </div>

            </div>


            <div class="action-card">

                <button
                    class="btn btn-warning"
                    onclick="editVisit('${visit.id}')"
                >
                    ✏️ ویرایش
                </button>

                <button
                    class="btn btn-blue"
                    onclick="printVisit('${visit.id}')"
                >
                    🖨 PDF / چاپ
                </button>

                <button
                    class="btn btn-gray"
                    onclick="renderHistory()"
                >
                    بستن
                </button>

            </div>

        </div>

    `;


    history.prepend(
        content
    );

}


/* =========================================================
   ویرایش
========================================================= */

function editVisit(
    visitId
) {

    const visit =
        findVisit(
            visitId
        );


    if (!visit) {

        alert(
            "گزارش پیدا نشد."
        );

        return;

    }


    const device =
        getVisitDevice(
            visit
        );


    if (!device) {

        alert(
            "ربات این گزارش پیدا نشد."
        );

        return;

    }


    currentCenter =
        database.centers.find(
            function(center) {

                return String(
                    center.id
                ) ===
                String(
                    visit.center_id
                );

            }
        );


    currentSection =
        device.section_name || "";


    editingVisitId =
        visit.id;


    getElement(
        "reportPage"
    )?.classList.remove(
        "hidden"
    );

    getElement(
        "centersPage"
    )?.classList.add(
        "hidden"
    );


    getElement(
        "reportPageTitle"
    ).textContent =
        "ویرایش گزارش";


    setValue(
        "centerName",
        currentCenter?.name || ""
    );


    getElement(
        "centerName"
    )?.setAttribute(
        "readonly",
        "readonly"
    );


    setValue(
        "visitDate",
        isoToJalali(
            visit.visit_date
        )
    );


    setValue(
        "deviceSection",
        device.section_name || ""
    );


    setValue(
        "deviceModel",
        device.model || ""
    );


    loadSerialNumbers();


    setValue(
        "serialNumber",
        device.serial || ""
    );


    setValue(
        "deviceSpecLink",
        device.spec_link || ""
    );


    setValue(
        "problemSubject",
        visit.problem_subject || ""
    );


    setValue(
        "reportedBy",
        visit.reported_by || ""
    );


    setValue(
        "problemDate",
        isoToJalali(
            visit.problem_date
        )
    );


    setValue(
        "description",
        visit.description || ""
    );


    setValue(
        "expertName",
        visit.expert_name ||
        "حیدریانی"
    );


    setValue(
        "expertDate",
        todayJalali()
    );


    setValue(
        "entryTime",
        visit.entry_time || ""
    );


    setValue(
        "exitTime",
        visit.exit_time || ""
    );


    setValue(
        "receiverName",
        visit.receiver_name || ""
    );


    setValue(
        "signatureExpertName",
        visit.expert_signature ||
        "حیدریانی"
    );


    getElement(
        "cancelEditBtn"
    )?.classList.remove(
        "hidden"
    );


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


/* =========================================================
   لغو ویرایش
========================================================= */

function cancelEdit() {

    editingVisitId =
        null;


    getElement(
        "cancelEditBtn"
    )?.classList.add(
        "hidden"
    );


    clearVisitFields();


    if (currentCenter) {

        getElement(
            "reportPageTitle"
        ).textContent =
            "ثبت گزارش کار جدید";

    }

}


/* =========================================================
   حذف گزارش
========================================================= */

async function deleteVisit(
    visitId
) {

    const visit =
        findVisit(
            visitId
        );


    if (!visit) {

        return;

    }


    if (
        !confirm(
            "آیا از حذف این گزارش مطمئن هستید؟"
        )
    ) {

        return;

    }


    try {

        const result =
            await supabaseClient
                .from("visits")
                .delete()
                .eq(
                    "id",
                    visitId
                );


        if (result.error) {

            throw result.error;

        }


        await loadDatabase();


        alert(
            "گزارش حذف شد."
        );


        renderHistory();


    } catch (error) {

        console.error(
            error
        );

        alert(
            "حذف گزارش انجام نشد:\n" +
            error.message
        );

    }

}


/* =========================================================
   حذف بیمارستان
========================================================= */

async function deleteCenter(
    center
) {

    const visits =
        database.visits.filter(
            function(visit) {

                return String(
                    visit.center_id
                ) ===
                String(
                    center.id
                );

            }
        );


    const devices =
        getCenterDevices(
            center.id
        );


    if (
        !confirm(
            "بیمارستان «" +
            center.name +
            "» و تمام ربات‌ها و گزارش‌های آن حذف شود؟"
        )
    ) {

        return;

    }


    try {

        if (visits.length) {

            const result =
                await supabaseClient
                    .from("visits")
                    .delete()
                    .eq(
                        "center_id",
                        center.id
                    );


            if (result.error) {

                throw result.error;

            }

        }


        if (devices.length) {

            const result =
                await supabaseClient
                    .from("devices")
                    .delete()
                    .eq(
                        "center_id",
                        center.id
                    );


            if (result.error) {

                throw result.error;

            }

        }


        const result =
            await supabaseClient
                .from("centers")
                .delete()
                .eq(
                    "id",
                    center.id
                );


        if (result.error) {

            throw result.error;

        }


        await loadDatabase();

        renderHierarchy();


        alert(
            "بیمارستان و اطلاعات مربوط به آن حذف شد."
        );


    } catch (error) {

        console.error(
            error
        );

        alert(
            "حذف بیمارستان انجام نشد:\n" +
            error.message
        );

    }

}


/* =========================================================
   چاپ PDF
========================================================= */

function printVisit(
    visitId
) {

    const visit =
        findVisit(
            visitId
        );


    if (!visit) {

        alert(
            "گزارش پیدا نشد."
        );

        return;

    }


    const device =
        getVisitDevice(
            visit
        );


    const center =
        database.centers.find(
            function(item) {

                return String(
                    item.id
                ) ===
                String(
                    visit.center_id
                );

            }
        );


    const report =
        window.open(
            "",
            "_blank"
        );


    if (!report) {

        alert(
            "پنجره چاپ توسط مرورگر مسدود شده است."
        );

        return;

    }


    const description =
        "با مراجعه به مرکز و بررسی ربات،\n\n" +
        (
            visit.description || ""
        ) +
        "\n\n" +
        "ربات تست و تحویل مسئول مربوطه گردید.";


    report.document.write(`

<!DOCTYPE html>

<html lang="fa" dir="rtl">

<head>

<meta charset="UTF-8">

<title>
گزارش کار
</title>

<style>

@page {
    size: A4;
    margin: 15mm;
}

* {
    box-sizing: border-box;
}

body {

    font-family:
        Tahoma,
        Arial,
        sans-serif;

    color: #111;

    font-size: 13px;

}

h1 {

    text-align: center;

    margin-bottom: 25px;

}

.grid {

    display: grid;

    grid-template-columns:
        repeat(2, 1fr);

    gap: 8px;

    margin-bottom: 10px;

}

.field {

    border: 1px solid #333;

}

.label {

    background: #eee;

    padding: 7px;

    font-weight: bold;

    border-bottom:
        1px solid #333;

}

.value {

    padding: 10px;

    min-height: 28px;

}

.description {

    border: 1px solid #333;

    margin-top: 15px;

}

.description-title {

    background: #eee;

    padding: 8px;

    font-weight: bold;

    border-bottom:
        1px solid #333;

}

.description-text {

    min-height: 200px;

    padding: 15px;

    white-space: pre-wrap;

    line-height: 2;

}

.signatures {

    display: flex;

    justify-content:
        space-between;

    margin-top: 70px;

}

.signature {

    width: 40%;

    text-align: center;

}

.line {

    margin-top: 50px;

    border-bottom:
        1px solid #111;

}

</style>

</head>

<body>

<h1>
گزارش کار
</h1>


<div class="grid">

<div class="field">

<div class="label">
نام بیمارستان
</div>

<div class="value">
${escapeHTML(
    center?.name || "-"
)}
</div>

</div>


<div class="field">

<div class="label">
بخش
</div>

<div class="value">
${escapeHTML(
    device?.section_name || "-"
)}
</div>

</div>


<div class="field">

<div class="label">
تاریخ مراجعه
</div>

<div class="value">
${escapeHTML(
    isoToJalali(
        visit.visit_date
    )
)}
</div>

</div>


<div class="field">

<div class="label">
مدل دستگاه
</div>

<div class="value">
${escapeHTML(
    device?.model || "-"
)}
</div>

</div>


<div class="field">

<div class="label">
شماره سریال
</div>

<div class="value">
${escapeHTML(
    device?.serial || "-"
)}
</div>

</div>


<div class="field">

<div class="label">
موضوع مشکل
</div>

<div class="value">
${escapeHTML(
    visit.problem_subject || "-"
)}
</div>

</div>


<div class="field">

<div class="label">
گزارش شده توسط
</div>

<div class="value">
${escapeHTML(
    visit.reported_by || "-"
)}
</div>

</div>


<div class="field">

<div class="label">
تاریخ اعلام مشکل
</div>

<div class="value">
${escapeHTML(
    isoToJalali(
        visit.problem_date
    ) || "-"
)}
</div>

</div>

</div>


${
    device?.spec_link
        ?
        `
        <div class="field">

            <div class="label">
                لینک مشخصات ربات
            </div>

            <div class="value">
                ${escapeHTML(
                    device.spec_link
                )}
            </div>

        </div>
        `
        :
        ""
}


<div class="description">

<div class="description-title">
توضیحات
</div>

<div class="description-text">
${escapeHTML(
    description
)}
</div>

</div>


<div class="grid">

<div class="field">

<div class="label">
نام کارشناس
</div>

<div class="value">
${escapeHTML(
    visit.expert_name || "-"
)}
</div>

</div>


<div class="field">

<div class="label">
ساعت ورود
</div>

<div class="value">
${escapeHTML(
    visit.entry_time || "-"
)}
</div>

</div>


<div class="field">

<div class="label">
ساعت خروج
</div>

<div class="value">
${escapeHTML(
    visit.exit_time || "-"
)}
</div>

</div>


<div class="field">

<div class="label">
نام تحویل گیرنده
</div>

<div class="value">
${escapeHTML(
    visit.receiver_name || "-"
)}
</div>

</div>

</div>


<div class="signatures">

<div class="signature">

<strong>
نام و امضا تحویل گیرنده
</strong>

<div>
${escapeHTML(
    visit.receiver_name || ""
)}
</div>

<div class="line"></div>

</div>


<div class="signature">

<strong>
نام و امضا کارشناس
</strong>

<div>
${escapeHTML(
    visit.expert_signature || ""
)}
</div>

<div class="line"></div>

</div>

</div>


<script>

setTimeout(
    function() {
        window.print();
    },
    500
);

<\/script>

</body>

</html>

    `);


    report.document.close();

}


/* =========================================================
   امنیت HTML
========================================================= */

function escapeHTML(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   رویدادها
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        initSupabase();


        /* ورود */

        getElement(
            "loginBtn"
        )?.addEventListener(
            "click",
            checkLogin
        );


        getElement(
            "passwordInput"
        )?.addEventListener(
            "keydown",
            function(event) {

                if (
                    event.key === "Enter"
                ) {

                    checkLogin();

                }

            }
        );


        renderProvinces();


        /* برگشت استان */

        getElement(
            "backProvinceBtn"
        )?.addEventListener(
            "click",
            function() {

                if (
                    currentView !==
                    "hospitals"
                ) {

                    currentView =
                        "hospitals";

                    currentCenter =
                        null;

                    currentSection =
                        "";

                    renderHierarchy();

                    return;

                }


                getElement(
                    "centersPage"
                )?.classList.add(
                    "hidden"
                );

                getElement(
                    "provincePage"
                )?.classList.remove(
                    "hidden"
                );

                currentCenter =
                    null;

            }
        );


        /* برگشت از گزارش */

        getElement(
            "backCentersBtn"
        )?.addEventListener(
            "click",
            function() {

                getElement(
                    "reportPage"
                )?.classList.add(
                    "hidden"
                );

                getElement(
                    "centersPage"
                )?.classList.remove(
                    "hidden"
                );


                editingVisitId =
                    null;


                if (currentCenter) {

                    currentView =
                        currentSection
                            ? "robots"
                            : "sections";

                    renderHierarchy();

                } else {

                    currentView =
                        "hospitals";

                    renderHierarchy();

                }

            }
        );


        /* بیمارستان جدید */

        getElement(
            "newCenterBtn"
        )?.addEventListener(
            "click",
            createNewCenter
        );


        /* ربات جدید داخل بیمارستان */

        getElement(
            "newRobotBtn"
        )?.addEventListener(
            "click",
            function() {

                createNewRobot(
                    currentCenter
                );

            }
        );


        /* ربات جدید داخل بخش */

        getElement(
            "newRobotInSectionBtn"
        )?.addEventListener(
            "click",
            function() {

                createNewRobot(
                    currentCenter,
                    currentSection
                );

            }
        );


        /* مدل دستگاه */

        getElement(
            "deviceModel"
        )?.addEventListener(
            "change",
            function() {

                loadSerialNumbers();

                setValue(
                    "deviceSpecLink",
                    ""
                );

            }
        );


        /* انتخاب سریال */

        getElement(
            "serialNumber"
        )?.addEventListener(
            "change",
            function() {

                const serial =
                    getValue(
                        "serialNumber"
                    );

                const model =
                    getValue(
                        "deviceModel"
                    );


                if (
                    !currentCenter ||
                    !serial ||
                    !model
                ) {

                    return;

                }


                const device =
                    database.devices.find(
                        function(item) {

                            return (
                                String(
                                    item.center_id
                                ) ===
                                String(
                                    currentCenter.id
                                )
                                &&
                                item.model ===
                                model
                                &&
                                String(
                                    item.serial
                                ) ===
                                String(
                                    serial
                                )
                            );

                        }
                    );


                if (device) {

                    setValue(
                        "deviceSection",
                        device.section_name || ""
                    );

                    setValue(
                        "deviceSpecLink",
                        device.spec_link || ""
                    );

                }

            }
        );


        /* سریال جدید */

        getElement(
            "newSerialBtn"
        )?.addEventListener(
            "click",
            toggleNewSerial
        );


        /* ذخیره */

        getElement(
            "saveVisitBtn"
        )?.addEventListener(
            "click",
            saveVisit
        );


        /* لغو ویرایش */

        getElement(
            "cancelEditBtn"
        )?.addEventListener(
            "click",
            cancelEdit
        );


        /* تاریخ */

        [
            "visitDate",
            "problemDate",
            "expertDate"
        ].forEach(
            function(id) {

                getElement(id)?.addEventListener(
                    "input",
                    function() {

                        let value =
                            this.value.replace(
                                /[^0-9/]/g,
                                ""
                            );


                        if (
                            value.length === 4 ||
                            value.length === 7
                        ) {

                            if (
                                !value.endsWith("/")
                            ) {

                                value += "/";

                            }

                        }


                        this.value =
                            value.substring(
                                0,
                                10
                            );

                    }
                );

            }
        );

    }
);
