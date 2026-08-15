/* =========================================================
   مدیریت مراکز و گزارش کار
   app.js
========================================================= */

const SUPABASE_URL =
    "https://nqfykfoxdcfgocfvcwxv.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_oLvZjzdOpAdErVP1sjPtzw_X5CGceRk";

const PASSWORD = "0111";

const MAX_ATTEMPTS = 3;
const LOCK_TIME = 30 * 60 * 1000;

const LABEL_BASE_URL =
    "https://bizad71.github.io/Ft/label/";


let supabaseClient = null;

let database = {
    centers: [],
    devices: [],
    visits: []
};

let currentProvince = "";
let currentCenter = null;
let currentSection = "";
let currentDevice = null;
let editingVisitId = null;


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
   ابزارها
========================================================= */

function getElement(id) {
    return document.getElementById(id);
}

function getValue(id) {
    const el = getElement(id);
    return el ? String(el.value || "").trim() : "";
}

function setValue(id, value) {
    const el = getElement(id);
    if (el) el.value = value ?? "";
}

function escapeHTML(value) {
    if (value === null || value === undefined) return "";

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   Supabase
========================================================= */

function initSupabase() {

    if (
        !window.supabase ||
        !window.supabase.createClient
    ) {
        console.error("Supabase library not loaded");
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
        if (!initSupabase()) return false;
    }

    try {

        const [
            centersResult,
            devicesResult,
            visitsResult
        ] = await Promise.all([

            supabaseClient
                .from("centers")
                .select("*")
                .order("created_at", {
                    ascending: true
                }),

            supabaseClient
                .from("devices")
                .select("*")
                .order("created_at", {
                    ascending: true
                }),

            supabaseClient
                .from("visits")
                .select("*")
                .order("visit_date", {
                    ascending: false
                })
        ]);


        if (centersResult.error)
            throw centersResult.error;

        if (devicesResult.error)
            throw devicesResult.error;

        if (visitsResult.error)
            throw visitsResult.error;


        database = {
            centers: centersResult.data || [],
            devices: devicesResult.data || [],
            visits: visitsResult.data || []
        };

        return true;

    } catch (error) {

        console.error(error);

        alert(
            "خطا در دریافت اطلاعات:\n" +
            error.message
        );

        return false;
    }
}


/* =========================================================
   ورود
========================================================= */

function checkLogin() {

    const lockUntil = Number(
        localStorage.getItem("site_lock_until") || 0
    );

    if (Date.now() < lockUntil) {
        showLockMessage();
        return;
    }


    const password =
        getValue("passwordInput");


    if (password === PASSWORD) {

        localStorage.removeItem(
            "site_login_attempts"
        );

        localStorage.removeItem(
            "site_lock_until"
        );

        getElement("loginPage")
            ?.classList.add("hidden");

        getElement("app")
            ?.classList.remove("hidden");

        renderProvinces();

        return;
    }


    let attempts = Number(
        localStorage.getItem(
            "site_login_attempts"
        ) || 0
    );

    attempts++;


    if (attempts >= MAX_ATTEMPTS) {

        localStorage.setItem(
            "site_login_attempts",
            "0"
        );

        localStorage.setItem(
            "site_lock_until",
            String(
                Date.now() + LOCK_TIME
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
        getElement("loginMessage");


    if (message) {

        message.textContent =
            "رمز اشتباه است. " +
            (MAX_ATTEMPTS - attempts) +
            " فرصت باقی مانده.";
    }


    setValue(
        "passwordInput",
        ""
    );
}


function showLockMessage() {

    const lockUntil = Number(
        localStorage.getItem(
            "site_lock_until"
        ) || 0
    );

    const diff =
        lockUntil - Date.now();


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
        getElement("loginMessage");


    if (message) {

        message.textContent =
            "ورود موقتاً قفل شده است. " +
            Math.ceil(diff / 60000) +
            " دقیقه دیگر دوباره تلاش کنید.";
    }
}


/* =========================================================
   استان‌ها
========================================================= */

function renderProvinces() {

    const grid =
        getElement("provinceGrid");

    if (!grid) return;

    grid.innerHTML = "";


    provinces.forEach(
        ([key, name]) => {

            const button =
                document.createElement("button");

            button.type = "button";
            button.className = "province-card";
            button.textContent = name;

            button.onclick = () => {
                openProvince(key, name);
            };

            grid.appendChild(button);
        }
    );
}


/* =========================================================
   باز کردن استان
========================================================= */

async function openProvince(key, name) {

    currentProvince = key;
    currentCenter = null;
    currentSection = "";
    currentDevice = null;


    const ok =
        await loadDatabase();

    if (!ok) return;


    hideAllPages();


    getElement("centersPage")
        ?.classList.remove("hidden");


    const title =
        getElement("provinceTitle");

    if (title) {
        title.textContent =
            "مراکز " + name;
    }


    setValue(
        "advancedSearchInput",
        ""
    );


    renderCenters();
}


/* =========================================================
   مراکز
========================================================= */

function renderCenters() {

    const grid =
        getElement("centersGrid");

    const empty =
        getElement("emptyCenters");


    if (!grid) return;


    grid.innerHTML = "";


    const query =
        getValue(
            "advancedSearchInput"
        ).toLowerCase();


    const centers =
        database.centers.filter(
            center => {

                const sameProvince =
                    center.province ===
                    currentProvince;

                const matches =
                    !query ||
                    String(center.name || "")
                        .toLowerCase()
                        .includes(query);

                return (
                    sameProvince &&
                    matches
                );
            }
        );


    if (!centers.length) {

        empty?.classList.remove("hidden");

        if (empty) {

            empty.textContent =
                query
                    ? "نتیجه‌ای پیدا نشد."
                    : "هنوز مرکزی ثبت نشده است.";
        }

        return;
    }


    empty?.classList.add("hidden");


    centers.forEach(center => {

        const button =
            document.createElement("button");

        button.type = "button";

        button.className =
            "center-name-card";

        // فقط اسم مرکز
        button.textContent =
            center.name;

        button.onclick = () => {
            openCenter(center);
        };

        grid.appendChild(button);
    });
}


/* =========================================================
   مرکز
========================================================= */

function openCenter(center) {

    currentCenter = center;
    currentSection = "";
    currentDevice = null;


    hideAllPages();


    getElement("centerPage")
        ?.classList.remove("hidden");


    const title =
        getElement("centerTitle");

    if (title) {
        title.textContent =
            center.name;
    }


    renderSections();
}


/* =========================================================
   دستگاه‌های مرکز
========================================================= */

function getCenterDevices(centerId) {

    return database.devices.filter(
        device =>
            String(device.center_id) ===
            String(centerId)
    );
}


/* =========================================================
   بخش‌های مرکز
========================================================= */

function renderSections() {

    const grid =
        getElement("sectionsGrid");

    const empty =
        getElement("emptySections");


    if (!grid) return;


    grid.innerHTML = "";


    if (!currentCenter) return;


    const devices =
        getCenterDevices(
            currentCenter.id
        );


    const sectionNames = [];


    devices.forEach(device => {

        if (
            device.section_name &&
            !sectionNames.includes(
                device.section_name
            )
        ) {

            sectionNames.push(
                device.section_name
            );
        }
    });


    if (!sectionNames.length) {

        empty?.classList.remove(
            "hidden"
        );

        return;
    }


    empty?.classList.add(
        "hidden"
    );


    sectionNames.forEach(section => {

        const button =
            document.createElement("button");

        button.type = "button";

        button.className =
            "section-card";

        // فقط اسم بخش
        button.textContent =
            section;

        button.onclick = () => {
            openSection(section);
        };

        grid.appendChild(button);
    });
}


/* =========================================================
   بخش
========================================================= */

function openSection(section) {

    currentSection = section;
    currentDevice = null;


    hideAllPages();


    getElement("devicesPage")
        ?.classList.remove("hidden");


    const title =
        getElement("sectionTitle");

    if (title) {
        title.textContent =
            "ربات‌های " + section;
    }


    renderDevices();
}


/* =========================================================
   ربات‌ها
========================================================= */

function renderDevices() {

    const grid =
        getElement("devicesGrid");

    const empty =
        getElement("emptyDevices");


    if (!grid) return;


    grid.innerHTML = "";


    if (!currentCenter) return;


    const devices =
        database.devices.filter(
            device =>
                String(device.center_id) ===
                String(currentCenter.id) &&
                device.section_name ===
                currentSection
        );


    if (!devices.length) {

        empty?.classList.remove(
            "hidden"
        );

        return;
    }


    empty?.classList.add(
        "hidden"
    );


    devices.forEach(device => {

        const box =
            document.createElement("div");

        box.className =
            "device-card";


        const title =
            document.createElement("h3");

        title.textContent =
            device.model || "دستگاه";


        const serial =
            document.createElement("p");

        serial.textContent =
            "سریال: " +
            (device.serial || "-");


        /*
           لینک ZIP فقط کنار شماره سریال
        */

        const zipLink =
            document.createElement("a");

        zipLink.className =
            "serial-zip-link";

        zipLink.target =
            "_blank";

        zipLink.rel =
            "noopener noreferrer";

        zipLink.href =
            getLabelZipUrl(
                device.serial
            );

        zipLink.textContent =
            "📦 ZIP";


        const serialRow =
            document.createElement("div");

        serialRow.className =
            "serial-row";

        serialRow.appendChild(serial);
        serialRow.appendChild(zipLink);


        const open =
            document.createElement("button");

        open.type = "button";

        open.className =
            "btn btn-blue";

        open.textContent =
            "باز کردن ربات";

        open.onclick = () => {
            openDevice(device);
        };


        box.appendChild(title);
        box.appendChild(serialRow);
        box.appendChild(open);

        grid.appendChild(box);
    });
}


/* =========================================================
   لینک ZIP
========================================================= */

function getLabelZipUrl(serial) {

    const cleanSerial =
        String(serial || "")
            .trim();

    return (
        LABEL_BASE_URL +
        encodeURIComponent(
            cleanSerial
        ) +
        ".zip"
    );
}


/* =========================================================
   باز کردن ربات
========================================================= */

function openDevice(device) {

    currentDevice = device;


    hideAllPages();


    getElement("robotPage")
        ?.classList.remove("hidden");


    getElement("robotTitle").textContent =
        device.model +
        " — " +
        device.serial;


    getElement("robotSectionText").textContent =
        device.section_name || "-";


    getElement("robotModelText").textContent =
        device.model || "-";


    getElement("robotSerialText").textContent =
        device.serial || "-";


    const zip =
        getElement("robotZipLink");


    if (zip) {

        zip.href =
            getLabelZipUrl(
                device.serial
            );
    }


    clearVisitFields();

    renderHistory();
}


/* =========================================================
   ثبت مرکز
========================================================= */

function openCenterModal() {

    setValue(
        "newCenterName",
        ""
    );

    getElement("centerModal")
        ?.classList.remove("hidden");
}


async function saveNewCenter() {

    if (!currentProvince) {
        alert("ابتدا یک استان را انتخاب کنید.");
        return;
    }


    const name =
        getValue("newCenterName");


    if (!name) {

        alert(
            "نام مرکز را وارد کنید."
        );

        return;
    }


    const exists =
        database.centers.some(
            center =>
                center.province ===
                currentProvince &&
                String(center.name || "")
                    .trim()
                    .toLowerCase() ===
                name.trim().toLowerCase()
        );


    if (exists) {

        alert(
            "این مرکز قبلاً ثبت شده است."
        );

        return;
    }


    try {

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


        if (result.error)
            throw result.error;


        database.centers.push(
            result.data
        );


        closeModal("centerModal");

        renderCenters();


    } catch (error) {

        console.error(error);

        alert(
            "ثبت مرکز انجام نشد:\n" +
            error.message
        );
    }
}


/* =========================================================
   ثبت دستگاه
========================================================= */

function openDeviceModal() {

    setValue(
        "newDeviceSection",
        ""
    );

    setValue(
        "newDeviceModel",
        ""
    );

    setValue(
        "newDeviceSerial",
        ""
    );


    getElement("deviceModal")
        ?.classList.remove("hidden");
}


async function saveNewDevice() {

    if (!currentCenter) {
        alert("مرکز انتخاب نشده است.");
        return;
    }


    const section =
        getValue("newDeviceSection");

    const model =
        getValue("newDeviceModel");

    const serial =
        getValue("newDeviceSerial");


    if (!section) {

        alert(
            "بخش را انتخاب کنید."
        );

        return;
    }


    if (!model) {

        alert(
            "مدل دستگاه را انتخاب کنید."
        );

        return;
    }


    if (!serial) {

        alert(
            "شماره سریال را وارد کنید."
        );

        return;
    }


    const exists =
        database.devices.some(
            device =>
                String(device.center_id) ===
                String(currentCenter.id) &&
                String(device.serial || "")
                    .trim()
                    .toLowerCase() ===
                serial.trim().toLowerCase()
        );


    if (exists) {

        alert(
            "این شماره سریال قبلاً برای این مرکز ثبت شده است."
        );

        return;
    }


    try {

        const result =
            await supabaseClient
                .from("devices")
                .insert({

                    center_id:
                        currentCenter.id,

                    model:
                        model,

                    serial:
                        serial,

                    section_name:
                        section,

                    spec_link:
                        ""
                })
                .select()
                .single();


        if (result.error)
            throw result.error;


        database.devices.push(
            result.data
        );


        closeModal("deviceModal");


        renderSections();


        alert(
            "دستگاه با موفقیت ثبت شد."
        );


    } catch (error) {

        console.error(error);

        alert(
            "ثبت دستگاه انجام نشد:\n" +
            error.message
        );
    }
}


/* =========================================================
   تاریخ شمسی
========================================================= */

function pad2(number) {

    return String(number)
        .padStart(2, "0");
}


function gregorianToJalali(gy, gm, gd) {

    const gdm = [
        0, 31, 59, 90, 120, 151,
        181, 212, 243, 273, 304, 334
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
        Math.floor((gy2 + 3) / 4) -
        Math.floor((gy2 + 99) / 100) +
        Math.floor((gy2 + 399) / 400) -
        80 +
        gd +
        gdm[gm - 1];


    jy +=
        33 *
        Math.floor(days / 12053);


    days %= 12053;


    jy +=
        4 *
        Math.floor(days / 1461);


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
            Math.floor(days / 31);

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


    return [jy, jm, jd];
}


function isoToJalali(value) {

    if (!value) return "";


    const match =
        String(value).match(
            /^(\d{4})-(\d{2})-(\d{2})/
        );


    if (!match)
        return value;


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


function jalaliToGregorian(jy, jm, jd) {

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

        if (days >= 365)
            days++;
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


    const salA = [
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
        gd > salA[gm]
    ) {

        gd -= salA[gm];
        gm++;
    }


    return [
        gy,
        gm,
        gd
    ];
}


function jalaliToISO(value) {

    if (!value) return null;


    const normalized =
        String(value)
            .replace(/-/g, "/")
            .trim();


    const match =
        normalized.match(
            /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/
        );


    if (!match)
        return null;


    const jy = Number(match[1]);
    const jm = Number(match[2]);
    const jd = Number(match[3]);


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

    const now = new Date();


    return isoToJalali(
        now.getFullYear() +
        "-" +
        pad2(now.getMonth() + 1) +
        "-" +
        pad2(now.getDate())
    );
}


/* =========================================================
   گزارش
========================================================= */

function clearVisitFields() {

    setValue(
        "visitDate",
        todayJalali()
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


    editingVisitId = null;


    getElement("cancelEditBtn")
        ?.classList.add("hidden");
}


function getDeviceVisits() {

    if (!currentDevice)
        return [];


    return database.visits.filter(
        visit =>
            String(visit.device_id) ===
            String(currentDevice.id)
    );
}


/* =========================================================
   ذخیره گزارش
========================================================= */

async function saveVisit() {

    if (!currentDevice) {

        alert(
            "ربات انتخاب نشده است."
        );

        return;
    }


    const visitDateText =
        getValue("visitDate");


    const visitDate =
        jalaliToISO(
            visitDateText
        );


    if (!visitDate) {

        alert(
            "تاریخ مراجعه صحیح نیست."
        );

        return;
    }


    const problemDateText =
        getValue("problemDate");


    const problemDate =
        problemDateText
            ? jalaliToISO(problemDateText)
            : null;


    if (
        problemDateText &&
        !problemDate
    ) {

        alert(
            "تاریخ اعلام مشکل صحیح نیست."
        );

        return;
    }


    const payload = {

        center_id:
            currentCenter.id,

        device_id:
            currentDevice.id,

        visit_date:
            visitDate,

        problem_subject:
            getValue("problemSubject"),

        reported_by:
            getValue("reportedBy"),

        problem_date:
            problemDate,

        description:
            getValue("description"),

        expert_name:
            getValue("expertName"),

        entry_time:
            getValue("entryTime") ||
            null,

        exit_time:
            getValue("exitTime") ||
            null,

        receiver_name:
            getValue("receiverName"),

        expert_signature:
            getValue(
                "signatureExpertName"
            )
    };


    try {

        let result;


        if (editingVisitId) {

            result =
                await supabaseClient
                    .from("visits")
                    .update(payload)
                    .eq(
                        "id",
                        editingVisitId
                    )
                    .select()
                    .single();

        } else {

            result =
                await supabaseClient
                    .from("visits")
                    .insert(payload)
                    .select()
                    .single();
        }


        if (result.error)
            throw result.error;


        const oldEditing =
            editingVisitId;


        editingVisitId = null;


        await loadDatabase();


        currentDevice =
            database.devices.find(
                device =>
                    String(device.id) ===
                    String(currentDevice.id)
            );


        clearVisitFields();

        renderHistory();


        alert(
            oldEditing
                ? "گزارش با موفقیت ویرایش شد."
                : "گزارش با موفقیت ذخیره شد."
        );


    } catch (error) {

        console.error(error);

        alert(
            "ذخیره گزارش انجام نشد:\n" +
            error.message
        );
    }
}


/* =========================================================
   سابقه کار
========================================================= */

function findVisit(id) {

    return database.visits.find(
        visit =>
            String(visit.id) ===
            String(id)
    );
}


function renderHistory() {

    const history =
        getElement("history");


    if (!history) return;


    history.innerHTML = "";


    const visits =
        getDeviceVisits();


    if (!visits.length) {

        history.innerHTML = `
            <div class="empty-message">
                هنوز گزارشی برای این ربات ثبت نشده است.
            </div>
        `;

        return;
    }


    visits.forEach(
        (visit, index) => {

            const box =
                document.createElement("div");

            box.className =
                "history-item";


            const title =
                document.createElement("h3");

            title.textContent =
                "گزارش " +
                (index + 1) +
                " — " +
                isoToJalali(
                    visit.visit_date
                );


            const subject =
                document.createElement("p");

            subject.textContent =
                "موضوع مشکل: " +
                (
                    visit.problem_subject ||
                    "-"
                );


            const reporter =
                document.createElement("p");

            reporter.textContent =
                "گزارش شده توسط: " +
                (
                    visit.reported_by ||
                    "-"
                );


            const actions =
                document.createElement("div");

            actions.className =
                "history-actions";


            const view =
                document.createElement("button");

            view.type = "button";
            view.className = "btn btn-blue";
            view.textContent = "👁 مشاهده";

            view.onclick = () => {
                viewVisit(visit.id);
            };


            const edit =
                document.createElement("button");

            edit.type = "button";
            edit.className = "btn btn-warning";
            edit.textContent = "✏️ ویرایش";

            edit.onclick = () => {
                editVisit(visit.id);
            };


            const print =
                document.createElement("button");

            print.type = "button";
            print.className = "btn btn-gray";
            print.textContent = "🖨 PDF";

            print.onclick = () => {
                printVisit(visit.id);
            };


            const del =
                document.createElement("button");

            del.type = "button";
            del.className = "btn btn-danger";
            del.textContent = "🗑 حذف";

            del.onclick = () => {
                deleteVisit(visit.id);
            };


            actions.appendChild(view);
            actions.appendChild(edit);
            actions.appendChild(print);
            actions.appendChild(del);


            box.appendChild(title);
            box.appendChild(subject);
            box.appendChild(reporter);
            box.appendChild(actions);


            history.appendChild(box);
        }
    );
}


/* =========================================================
   Popup توضیحات
========================================================= */

function viewVisit(id) {

    const visit =
        findVisit(id);


    if (!visit) return;


    const modal =
        getElement(
            "descriptionModal"
        );

    const content =
        getElement(
            "descriptionModalContent"
        );


    if (!modal || !content)
        return;


    content.textContent =
        visit.description ||
        "توضیحی برای این گزارش ثبت نشده است.";


    modal.classList.remove(
        "hidden"
    );
}


/* =========================================================
   ویرایش گزارش
========================================================= */

function editVisit(id) {

    const visit =
        findVisit(id);


    if (!visit) return;


    editingVisitId =
        visit.id;


    setValue(
        "visitDate",
        isoToJalali(
            visit.visit_date
        )
    );


    setValue(
        "problemSubject",
        visit.problem_subject
    );


    setValue(
        "reportedBy",
        visit.reported_by
    );


    setValue(
        "problemDate",
        isoToJalali(
            visit.problem_date
        )
    );


    setValue(
        "description",
        visit.description
    );


    setValue(
        "expertName",
        visit.expert_name ||
        "حیدریانی"
    );


    setValue(
        "expertDate",
        isoToJalali(
            visit.expert_date
        ) ||
        todayJalali()
    );


    setValue(
        "entryTime",
        visit.entry_time
    );


    setValue(
        "exitTime",
        visit.exit_time
    );


    setValue(
        "receiverName",
        visit.receiver_name
    );


    setValue(
        "signatureExpertName",
        visit.expert_signature ||
        "حیدریانی"
    );


    getElement("cancelEditBtn")
        ?.classList.remove("hidden");


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================================
   حذف گزارش
========================================================= */

async function deleteVisit(id) {

    const visit =
        findVisit(id);


    if (!visit) return;


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
                .eq("id", id);


        if (result.error)
            throw result.error;


        await loadDatabase();

        renderHistory();


    } catch (error) {

        alert(
            "حذف گزارش انجام نشد:\n" +
            error.message
        );
    }
}


/* =========================================================
   حذف مرکز
========================================================= */

async function deleteCenter() {

    if (!currentCenter) return;


    const centerName =
        currentCenter.name;


    if (
        !confirm(
            "آیا از حذف مرکز «" +
            centerName +
            "» و تمام ربات‌ها و گزارش‌های آن مطمئن هستید؟"
        )
    ) {
        return;
    }


    try {

        await supabaseClient
            .from("visits")
            .delete()
            .eq(
                "center_id",
                currentCenter.id
            );


        await supabaseClient
            .from("devices")
            .delete()
            .eq(
                "center_id",
                currentCenter.id
            );


        const result =
            await supabaseClient
                .from("centers")
                .delete()
                .eq(
                    "id",
                    currentCenter.id
                );


        if (result.error)
            throw result.error;


        await loadDatabase();


        currentCenter = null;


        alert(
            "مرکز با موفقیت حذف شد."
        );


        hideAllPages();


        getElement("centersPage")
            ?.classList.remove("hidden");


        renderCenters();


    } catch (error) {

        alert(
            "حذف مرکز انجام نشد:\n" +
            error.message
        );
    }
}


/* =========================================================
   PDF کامل
========================================================= */

function printVisit(id) {

    const visit =
        findVisit(id);


    if (!visit) {

        alert(
            "گزارش پیدا نشد."
        );

        return;
    }


    const device =
        currentDevice;


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


    const centerName =
        currentCenter?.name || "-";

    const section =
        device?.section_name || "-";

    const model =
        device?.model || "-";

    const serial =
        device?.serial || "-";


    report.document.write(`

<!DOCTYPE html>

<html lang="fa" dir="rtl">

<head>

<meta charset="UTF-8">

<title>
گزارش کار - ${escapeHTML(centerName)}
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
    font-family: Tahoma, Arial, sans-serif;
    color: #111;
    font-size: 13px;
    line-height: 1.8;
}

h1 {
    text-align: center;
    margin-bottom: 25px;
}

.info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
}

.field {
    border: 1px solid #333;
}

.label {
    background: #eee;
    padding: 6px;
    font-weight: bold;
    border-bottom: 1px solid #333;
}

.value {
    padding: 9px;
    min-height: 35px;
}

.description {
    margin-top: 15px;
    border: 1px solid #333;
}

.description-title {
    padding: 8px;
    background: #eee;
    font-weight: bold;
    border-bottom: 1px solid #333;
}

.description-text {
    min-height: 180px;
    padding: 15px;
    white-space: pre-wrap;
}

.signatures {
    display: flex;
    justify-content: space-between;
    margin-top: 70px;
}

.signature {
    width: 40%;
    text-align: center;
}

.line {
    margin-top: 50px;
    border-bottom: 1px solid #111;
}

</style>

</head>

<body>

<h1>
گزارش کار
</h1>

<div class="info-grid">

<div class="field">
<div class="label">نام مرکز</div>
<div class="value">
${escapeHTML(centerName)}
</div>
</div>

<div class="field">
<div class="label">بخش</div>
<div class="value">
${escapeHTML(section)}
</div>
</div>

<div class="field">
<div class="label">تاریخ مراجعه</div>
<div class="value">
${escapeHTML(
    isoToJalali(
        visit.visit_date
    )
)}
</div>
</div>

<div class="field">
<div class="label">مدل دستگاه</div>
<div class="value">
${escapeHTML(model)}
</div>
</div>

<div class="field">
<div class="label">شماره سریال</div>
<div class="value">
${escapeHTML(serial)}
</div>
</div>

<div class="field">
<div class="label">موضوع مشکل</div>
<div class="value">
${escapeHTML(
    visit.problem_subject || "-"
)}
</div>
</div>

<div class="field">
<div class="label">گزارش شده توسط</div>
<div class="value">
${escapeHTML(
    visit.reported_by || "-"
)}
</div>
</div>

<div class="field">
<div class="label">تاریخ اعلام مشکل</div>
<div class="value">
${escapeHTML(
    isoToJalali(
        visit.problem_date
    )
)}
</div>
</div>

</div>


<div class="description">

<div class="description-title">
توضیحات گزارش
</div>

<div class="description-text">
${escapeHTML(
    visit.description || "-"
)}
</div>

</div>


<div class="info-grid">

<div class="field">
<div class="label">نام کارشناس</div>
<div class="value">
${escapeHTML(
    visit.expert_name || "-"
)}
</div>
</div>

<div class="field">
<div class="label">تاریخ کارشناس</div>
<div class="value">
${escapeHTML(
    visit.expert_date
        ? isoToJalali(visit.expert_date)
        : "-"
)}
</div>
</div>

<div class="field">
<div class="label">ساعت ورود</div>
<div class="value">
${escapeHTML(
    visit.entry_time || "-"
)}
</div>
</div>

<div class="field">
<div class="label">ساعت خروج</div>
<div class="value">
${escapeHTML(
    visit.exit_time || "-"
)}
</div>
</div>

<div class="field">
<div class="label">نام تحویل گیرنده</div>
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
نام و امضای تحویل گیرنده
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
نام و امضای کارشناس
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

setTimeout(function() {
    window.print();
}, 500);

<\/script>

</body>

</html>

    `);


    report.document.close();
}


/* =========================================================
   صفحات
========================================================= */

function hideAllPages() {

    [
        "provincePage",
        "centersPage",
        "centerPage",
        "devicesPage",
        "robotPage"
    ].forEach(id => {

        getElement(id)
            ?.classList.add("hidden");

    });
}


/* =========================================================
   Modal
========================================================= */

function closeModal(id) {

    getElement(id)
        ?.classList.add("hidden");
}


/* =========================================================
   تاریخ ورودی
========================================================= */

function setupJalaliInput(id) {

    getElement(id)
        ?.addEventListener(
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


/* =========================================================
   رویدادها
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        initSupabase();


        /* ورود */

        getElement("loginBtn")
            ?.addEventListener(
                "click",
                checkLogin
            );


        getElement("passwordInput")
            ?.addEventListener(
                "keydown",
                function(event) {

                    if (
                        event.key === "Enter"
                    ) {
                        checkLogin();
                    }
                }
            );


        /* استان */

        renderProvinces();


        /* بازگشت استان */

        getElement("backProvinceBtn")
            ?.addEventListener(
                "click",
                function() {

                    hideAllPages();

                    getElement("provincePage")
                        ?.classList.remove(
                            "hidden"
                        );
                }
            );


        /* جستجو */

        getElement(
            "advancedSearchInput"
        )?.addEventListener(
            "input",
            renderCenters
        );


        /* مرکز جدید */

        getElement("newCenterBtn")
            ?.addEventListener(
                "click",
                openCenterModal
            );


        getElement("saveCenterBtn")
            ?.addEventListener(
                "click",
                saveNewCenter
            );


        getElement("closeCenterModal")
            ?.addEventListener(
                "click",
                function() {
                    closeModal("centerModal");
                }
            );


        /* بازگشت از مرکز */

        getElement("backCentersBtn")
            ?.addEventListener(
                "click",
                function() {

                    hideAllPages();

                    getElement("centersPage")
                        ?.classList.remove(
                            "hidden"
                        );

                    renderCenters();
                }
            );


        /* ثبت دستگاه */

        getElement("newDeviceBtn")
            ?.addEventListener(
                "click",
                openDeviceModal
            );


        getElement("saveDeviceBtn")
            ?.addEventListener(
                "click",
                saveNewDevice
            );


        getElement("closeDeviceModal")
            ?.addEventListener(
                "click",
                function() {
                    closeModal("deviceModal");
                }
            );


        /* بازگشت از بخش */

        getElement("backCenterBtn")
            ?.addEventListener(
                "click",
                function() {

                    openCenter(
                        currentCenter
                    );
                }
            );


        /* ثبت ربات */

        getElement("newRobotBtn")
            ?.addEventListener(
                "click",
                openDeviceModal
            );


        /* بازگشت از ربات */

        getElement("backDevicesBtn")
            ?.addEventListener(
                "click",
                function() {

                    openSection(
                        currentSection
                    );
                }
            );


        /* گزارش */

        getElement("saveVisitBtn")
            ?.addEventListener(
                "click",
                saveVisit
            );


        getElement("cancelEditBtn")
            ?.addEventListener(
                "click",
                clearVisitFields
            );


        /* حذف مرکز */

        getElement("deleteCenterBtn")
            ?.addEventListener(
                "click",
                deleteCenter
            );


        /* Popup */

        getElement("closeDescriptionModal")
            ?.addEventListener(
                "click",
                function() {

                    closeModal(
                        "descriptionModal"
                    );
                }
            );


        getElement("descriptionModal")
            ?.querySelector(".modal-overlay")
            ?.addEventListener(
                "click",
                function() {

                    closeModal(
                        "descriptionModal"
                    );
                }
            );


        /* تاریخ */

        setupJalaliInput("visitDate");
        setupJalaliInput("problemDate");
        setupJalaliInput("expertDate");

    }
);
