/* =========================================================
   مدیریت مراکز و گزارش کار
   Supabase - نسخه اصلاح شده
========================================================= */


/* =========================================================
   تنظیمات
========================================================= */

const SUPABASE_URL =
    "https://nqfykfoxdcfgocfvcwxv.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_oLvZjzdOpAdErVP1sjPtzw_X5CGceRk";

const PASSWORD =
    "0111";

const MAX_ATTEMPTS =
    3;

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
    centers: []
};

let currentProvince = "";
let currentProvinceName = "";
let currentCenter = null;
let showAllHistory = false;


/* =========================================================
   ابزار DOM
========================================================= */

function getElement(id) {
    return document.getElementById(id);
}


function setValue(id, value) {

    const element = getElement(id);

    if (element) {
        element.value = value ?? "";
    }

}


function getValue(id) {

    const element = getElement(id);

    if (!element) {
        return "";
    }

    return String(
        element.value || ""
    ).trim();

}


/* =========================================================
   Supabase
========================================================= */

function initSupabase() {

    if (
        !window.supabase ||
        typeof window.supabase.createClient !== "function"
    ) {

        console.error(
            "Supabase library is not loaded."
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


/* =========================================================
   تاریخ شمسی
========================================================= */

/*
   تبدیل تاریخ میلادی به شمسی
*/

function gregorianToJalali(gy, gm, gd) {

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
        Math.floor((gy2 + 3) / 4) -
        Math.floor((gy2 + 99) / 100) +
        Math.floor((gy2 + 399) / 400) -
        80 +
        gd +
        g_d_m[gm - 1];

    jy += 33 * Math.floor(days / 12053);

    days %= 12053;

    jy += 4 * Math.floor(days / 1461);

    days %= 1461;

    if (days > 365) {

        jy += Math.floor(
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

    return [
        jy,
        jm,
        jd
    ];

}


/*
   تبدیل شمسی به میلادی
*/

function jalaliToGregorian(jy, jm, jd) {

    jy = Number(jy);
    jm = Number(jm);
    jd = Number(jd);

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
                : ((jm - 7) * 30) + 186
        );

    gy +=
        400 *
        Math.floor(
            days / 146097
        );

    days %=
        146097;

    if (days > 36524) {

        gy +=
            100 *
            Math.floor(
                --days / 36524
            );

        days %=
            36524;

        if (days >= 365) {
            days++;
        }

    }

    gy +=
        4 *
        Math.floor(
            days / 1461
        );

    days %=
        1461;

    if (days > 365) {

        gy +=
            Math.floor(
                (days - 1) / 365
            );

        days =
            (days - 1) % 365;

    }

    const gd =
        days + 1;

    const leap =
        (
            gy % 4 === 0 &&
            (
                gy % 100 !== 0 ||
                gy % 400 === 0
            )
        );

    const monthDays = [
        31,
        leap ? 29 : 28,
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

    let month = 1;
    let day = gd;

    while (
        day >
        monthDays[month - 1]
    ) {

        day -=
            monthDays[month - 1];

        month++;

    }

    return [
        gy,
        month,
        day
    ];

}


/*
   1405/05/24
   ->
   2026-08-15
*/

function jalaliStringToGregorian(value) {

    if (!value) {
        return "";
    }

    const normalized =
        String(value)
            .replace(
                /۰/g,
                "0"
            )
            .replace(
                /۱/g,
                "1"
            )
            .replace(
                /۲/g,
                "2"
            )
            .replace(
                /۳/g,
                "3"
            )
            .replace(
                /۴/g,
                "4"
            )
            .replace(
                /۵/g,
                "5"
            )
            .replace(
                /۶/g,
                "6"
            )
            .replace(
                /۷/g,
                "7"
            )
            .replace(
                /۸/g,
                "8"
            )
            .replace(
                /۹/g,
                "9"
            )
            .replace(
                /-/g,
                "/"
            );

    const parts =
        normalized.split("/");

    if (parts.length !== 3) {
        return "";
    }

    const jy =
        Number(parts[0]);

    const jm =
        Number(parts[1]);

    const jd =
        Number(parts[2]);

    if (
        !jy ||
        !jm ||
        !jd ||
        jm < 1 ||
        jm > 12 ||
        jd < 1 ||
        jd > 31
    ) {
        return "";
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
        String(result[1]).padStart(2, "0") +
        "-" +
        String(result[2]).padStart(2, "0")
    );

}


/*
   2026-08-15
   ->
   1405/05/24
*/

function gregorianStringToJalali(value) {

    if (!value) {
        return "";
    }

    const parts =
        String(value).split("-");

    if (parts.length !== 3) {
        return value;
    }

    const result =
        gregorianToJalali(
            Number(parts[0]),
            Number(parts[1]),
            Number(parts[2])
        );

    return (
        result[0] +
        "/" +
        String(result[1]).padStart(2, "0") +
        "/" +
        String(result[2]).padStart(2, "0")
    );

}


/*
   تاریخ امروز شمسی
*/

function getTodayJalali() {

    const now =
        new Date();

    return gregorianStringToJalali(
        now.getFullYear() +
        "-" +
        String(
            now.getMonth() + 1
        ).padStart(2, "0") +
        "-" +
        String(
            now.getDate()
        ).padStart(2, "0")
    );

}


/*
   تبدیل ورودی‌های تاریخ به فیلد متنی شمسی
*/

function prepareJalaliDateInputs() {

    const ids = [
        "visitDate",
        "problemDate",
        "expertDate"
    ];

    ids.forEach(function(id) {

        const element =
            getElement(id);

        if (!element) {
            return;
        }

        element.type = "text";

        element.placeholder =
            "مثلاً 1405/05/24";

        element.inputMode =
            "numeric";

        element.autocomplete =
            "off";

    });

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

    const remaining =
        MAX_ATTEMPTS -
        attempts;

    const message =
        getElement(
            "loginMessage"
        );

    if (message) {

        message.textContent =
            "رمز اشتباه است. " +
            remaining +
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

        const message =
            getElement(
                "loginMessage"
            );

        if (message) {
            message.textContent = "";
        }

        return;
    }

    const minutes =
        Math.ceil(
            diff / 60000
        );

    const message =
        getElement(
            "loginMessage"
        );

    if (message) {

        message.textContent =
            "ورود موقتاً قفل شده است. " +
            minutes +
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
   دریافت مراکز
========================================================= */

async function loadDatabase() {

    if (!supabaseClient) {

        if (!initSupabase()) {

            alert(
                "کتابخانه Supabase بارگذاری نشده است."
            );

            return;
        }
    }

    try {

        const centersResult =
            await supabaseClient
                .from("centers")
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending: true
                    }
                );

        if (centersResult.error) {

            console.error(
                centersResult.error
            );

            alert(
                "خطا در دریافت مراکز:\n" +
                centersResult.error.message
            );

            return;

        }


        const devicesResult =
            await supabaseClient
                .from("devices")
                .select("*");

        if (devicesResult.error) {

            console.error(
                devicesResult.error
            );

            alert(
                "خطا در دریافت دستگاه‌ها:\n" +
                devicesResult.error.message
            );

            return;

        }


        const visitsResult =
            await supabaseClient
                .from("visits")
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );

        if (visitsResult.error) {

            console.error(
                visitsResult.error
            );

            alert(
                "خطا در دریافت گزارش‌ها:\n" +
                visitsResult.error.message
            );

            return;

        }


        const centers =
            centersResult.data || [];

        const devices =
            devicesResult.data || [];

        const visits =
            visitsResult.data || [];


        database.centers =
            centers.map(
                function(center) {

                    const centerDevices =
                        devices.filter(
                            function(device) {

                                return String(
                                    device.center_id
                                ) === String(
                                    center.id
                                );

                            }
                        );


                    const centerVisits =
                        visits
                            .filter(
                                function(visit) {

                                    return String(
                                        visit.center_id
                                    ) === String(
                                        center.id
                                    );

                                }
                            )
                            .map(
                                function(visit) {

                                    const device =
                                        centerDevices.find(
                                            function(item) {

                                                return String(
                                                    item.id
                                                ) === String(
                                                    visit.device_id
                                                );

                                            }
                                        );


                                    return {

                                        id:
                                            visit.id,

                                        section:
                                            center.section || "",

                                        date:
                                            visit.visit_date,

                                        deviceModel:
                                            device?.model || "",

                                        serialNumber:
                                            device?.serial || "",

                                        problemSubject:
                                            visit.problem_subject || "",

                                        reportedBy:
                                            visit.reported_by || "",

                                        problemDate:
                                            visit.problem_date || "",

                                        description:
                                            visit.description || "",

                                        expertName:
                                            visit.expert_name || "",

                                        expertDate:
                                            visit.visit_date || "",

                                        entryTime:
                                            visit.entry_time || "",

                                        exitTime:
                                            visit.exit_time || "",

                                        receiverName:
                                            visit.receiver_name || "",

                                        signatureExpertName:
                                            visit.expert_signature || ""

                                    };

                                }
                            );


                    return {

                        id:
                            center.id,

                        province:
                            center.province,

                        name:
                            center.name,

                        section:
                            center.section || "",

                        phone:
                            center.phone || "",

                        manager:
                            center.manager || "",

                        devices:
                            centerDevices,

                        visits:
                            centerVisits

                    };

                }
            );

    } catch (error) {

        console.error(
            error
        );

        alert(
            "ارتباط با پایگاه داده برقرار نشد."
        );

    }

}


/* =========================================================
   استان
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

    showAllHistory =
        false;

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

    setValue(
        "centerSearch",
        ""
    );

    const title =
        getElement(
            "provinceTitle"
        );

    if (title) {

        title.textContent =
            "مراکز " +
            name;

    }

    renderCenters();

}


/* =========================================================
   نمایش مراکز
========================================================= */

function renderCenters() {

    const grid =
        getElement(
            "centersGrid"
        );

    const empty =
        getElement(
            "emptyCenters"
        );

    if (!grid) {
        return;
    }

    const query =
        getValue(
            "centerSearch"
        ).toLowerCase();

    grid.innerHTML = "";

    let centers =
        database.centers.filter(
            function(center) {

                return (
                    center.province ===
                    currentProvince
                );

            }
        );

    if (query) {

        centers =
            centers.filter(
                function(center) {

                    return String(
                        center.name || ""
                    )
                        .toLowerCase()
                        .includes(
                            query
                        );

                }
            );

    }

    if (!centers.length) {

        empty?.classList.remove(
            "hidden"
        );

        if (empty) {

            empty.textContent =
                query
                    ?
                    "مرکزی با این نام پیدا نشد."
                    :
                    "هنوز مرکزی برای این استان ثبت نشده است.";

        }

        return;
    }

    empty?.classList.add(
        "hidden"
    );

    centers.forEach(
        function(center) {

            const box =
                document.createElement(
                    "div"
                );

            box.className =
                "center-box";


            const title =
                document.createElement(
                    "h3"
                );

            title.textContent =
                "🏥 " +
                center.name;


            const count =
                document.createElement(
                    "p"
                );

            count.textContent =
                center.visits.length
                    ?
                    "تعداد مراجعات: " +
                    center.visits.length
                    :
                    "هنوز گزارشی ثبت نشده";


            const button =
                document.createElement(
                    "button"
                );

            button.type =
                "button";

            button.className =
                "btn btn-blue";

            button.textContent =
                "باز کردن مرکز";

            button.addEventListener(
                "click",
                function() {

                    openExistingCenter(
                        center
                    );

                }
            );

            box.appendChild(
                title
            );

            box.appendChild(
                count
            );

            box.appendChild(
                button
            );

            grid.appendChild(
                box
            );

        }
    );

}


/* =========================================================
   مرکز جدید
========================================================= */

function createNewCenter() {

    currentCenter =
        null;

    showAllHistory =
        false;

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

    const title =
        getElement(
            "reportPageTitle"
        );

    if (title) {

        title.textContent =
            "ثبت مرکز جدید";

    }

    const nameInput =
        getElement(
            "centerName"
        );

    if (nameInput) {

        nameInput.removeAttribute(
            "readonly"
        );

    }

    clearVisitFields();

    setValue(
        "centerName",
        ""
    );

    setValue(
        "expertName",
        "حیدریانی"
    );

    setValue(
        "signatureExpertName",
        "حیدریانی"
    );

    renderHistory();

}


/* =========================================================
   مرکز موجود
========================================================= */

async function openExistingCenter(
    center
) {

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
        ) || center;

    showAllHistory =
        false;

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

    const title =
        getElement(
            "reportPageTitle"
        );

    if (title) {

        title.textContent =
            currentCenter.name;

    }

    const nameInput =
        getElement(
            "centerName"
        );

    if (nameInput) {

        nameInput.value =
            currentCenter.name;

        nameInput.setAttribute(
            "readonly",
            "readonly"
        );

    }

    clearVisitFields();

    setValue(
        "centerName",
        currentCenter.name
    );

    renderHistory();

}


/* =========================================================
   پاک کردن فرم
========================================================= */

function clearVisitFields() {

    setValue(
        "sectionName",
        currentCenter?.section || ""
    );

    setValue(
        "visitDate",
        getTodayJalali()
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
        "problemSubject",
        ""
    );

    setValue(
        "reportedBy",
        ""
    );

    setValue(
        "problemDate",
        getTodayJalali()
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
        getTodayJalali()
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


function getCenterSerials(
    model
) {

    if (!currentCenter) {
        return [];
    }

    const devices =
        currentCenter.devices || [];

    return devices
        .filter(
            function(device) {

                return (
                    device.model === model &&
                    device.serial
                );

            }
        )
        .map(
            function(device) {

                return device.serial;

            }
        )
        .filter(
            function(serial, index, array) {

                return array.indexOf(
                    serial
                ) === index;

            }
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

    getCenterSerials(
        model
    ).forEach(
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


/* =========================================================
   سریال جدید
========================================================= */

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

    const visitDateJalali =
        getValue(
            "visitDate"
        );

    const problemDateJalali =
        getValue(
            "problemDate"
        );

    const expertDateJalali =
        getValue(
            "expertDate"
        );


    return {

        centerName:
            getValue("centerName"),

        section:
            getValue("sectionName"),

        visitDateJalali:
            visitDateJalali,

        visitDate:
            jalaliStringToGregorian(
                visitDateJalali
            ),

        deviceModel:
            getValue("deviceModel"),

        serialNumber:
            getSelectedSerial(),

        problemSubject:
            getValue("problemSubject"),

        reportedBy:
            getValue("reportedBy"),

        problemDateJalali:
            problemDateJalali,

        problemDate:
            jalaliStringToGregorian(
                problemDateJalali
            ),

        description:
            getValue("description"),

        expertName:
            getValue("expertName"),

        expertDateJalali:
            expertDateJalali,

        expertDate:
            jalaliStringToGregorian(
                expertDateJalali
            ),

        entryTime:
            getValue("entryTime"),

        exitTime:
            getValue("exitTime"),

        receiverName:
            getValue("receiverName"),

        signatureExpertName:
            getValue("signatureExpertName")

    };

}


/* =========================================================
   پیدا کردن یا ساخت مرکز
========================================================= */

async function findOrCreateCenter(
    data
) {

    await loadDatabase();

    let center =
        database.centers.find(
            function(item) {

                return (
                    item.province === currentProvince &&
                    String(
                        item.name
                    )
                        .trim()
                        .toLowerCase() ===
                    String(
                        data.centerName
                    )
                        .trim()
                        .toLowerCase()
                );

            }
        );


    if (center) {
        return center;
    }


    const result =
        await supabaseClient
            .from("centers")
            .insert({

                province:
                    currentProvince,

                name:
                    data.centerName,

                section:
                    data.section || null

            })
            .select()
            .single();


    if (result.error) {

        throw new Error(
            "خطا در ذخیره مرکز:\n" +
            result.error.message
        );

    }


    return {

        id:
            result.data.id,

        province:
            result.data.province,

        name:
            result.data.name,

        section:
            result.data.section || "",

        phone:
            result.data.phone || "",

        manager:
            result.data.manager || "",

        devices:
            [],

        visits:
            []

    };

}


/* =========================================================
   پیدا کردن یا ساخت دستگاه
========================================================= */

async function findOrCreateDevice(
    centerId,
    model,
    serial
) {

    const existing =
        await supabaseClient
            .from("devices")
            .select("*")
            .eq(
                "center_id",
                centerId
            )
            .eq(
                "model",
                model
            )
            .eq(
                "serial",
                serial
            )
            .maybeSingle();


    if (existing.error) {

        throw new Error(
            "خطا در بررسی دستگاه:\n" +
            existing.error.message
        );

    }


    if (existing.data) {

        return existing.data;

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
                    serial

            })
            .select()
            .single();


    if (result.error) {

        throw new Error(
            "خطا در ذخیره دستگاه:\n" +
            result.error.message
        );

    }


    return result.data;

}


/* =========================================================
   ذخیره گزارش
========================================================= */

async function saveVisit() {

    const button =
        getElement(
            "saveVisitBtn"
        );


    const data =
        getFormData();


    if (!data.centerName) {

        alert(
            "نام مرکز را وارد کنید."
        );

        return;
    }


    if (!data.visitDate) {

        alert(
            "تاریخ مراجعه را به صورت شمسی وارد کنید.\nمثال: 1405/05/24"
        );

        return;
    }


    if (!data.deviceModel) {

        alert(
            "مدل دستگاه را انتخاب کنید."
        );

        return;
    }


    if (!data.serialNumber) {

        alert(
            "شماره سریال دستگاه را وارد یا انتخاب کنید."
        );

        return;
    }


    if (!supabaseClient) {

        if (!initSupabase()) {

            alert(
                "ارتباط با Supabase برقرار نشد."
            );

            return;
        }

    }


    if (button) {
        button.disabled = true;
        button.textContent = "⏳ در حال ذخیره...";
    }


    try {

        /*
           1. مرکز
        */

        currentCenter =
            await findOrCreateCenter(
                data
            );


        /*
           2. دستگاه
        */

        const device =
            await findOrCreateDevice(
                currentCenter.id,
                data.deviceModel,
                data.serialNumber
            );


        /*
           3. گزارش
        */

        const result =
            await supabaseClient
                .from("visits")
                .insert({

                    center_id:
                        currentCenter.id,

                    device_id:
                        device.id,

                    visit_date:
                        data.visitDate,

                    problem_subject:
                        data.problemSubject || null,

                    reported_by:
                        data.reportedBy || null,

                    problem_date:
                        data.problemDate || null,

                    description:
                        data.description || null,

                    expert_name:
                        data.expertName || null,

                    entry_time:
                        data.entryTime || null,

                    exit_time:
                        data.exitTime || null,

                    receiver_name:
                        data.receiverName || null,

                    expert_signature:
                        data.signatureExpertName || null

                })
                .select()
                .single();


        if (result.error) {

            throw new Error(
                "خطا در ذخیره گزارش:\n" +
                result.error.message
            );

        }


        /*
           4. به‌روزرسانی مرکز
        */

        if (
            data.section &&
            currentCenter.section !== data.section
        ) {

            const updateResult =
                await supabaseClient
                    .from("centers")
                    .update({

                        section:
                            data.section

                    })
                    .eq(
                        "id",
                        currentCenter.id
                    );


            if (updateResult.error) {

                console.warn(
                    "Section update warning:",
                    updateResult.error
                );

            }

        }


        /*
           5. دریافت اطلاعات تازه
        */

        await loadDatabase();


        currentCenter =
            database.centers.find(
                function(center) {

                    return String(
                        center.id
                    ) ===
                    String(
                        result.data.center_id
                    );

                }
            );


        showAllHistory =
            false;


        loadSerialNumbers();

        renderHistory();


        alert(
            "✅ گزارش با موفقیت ذخیره شد."
        );


    } catch (error) {

        console.error(
            "SAVE ERROR:",
            error
        );


        alert(
            error.message ||
            "خطا هنگام ذخیره اطلاعات."
        );


    } finally {

        if (button) {

            button.disabled =
                false;

            button.textContent =
                "💾 ذخیره گزارش";

        }

    }

}


/* =========================================================
   تاریخچه
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
        currentCenter.visits || [];


    if (!visits.length) {

        history.innerHTML =
            "<p class='empty-message'>هنوز گزارشی برای این مرکز ثبت نشده است.</p>";

        return;

    }


    const visibleVisits =
        showAllHistory
            ?
            visits
            :
            visits.slice(
                0,
                1
            );


    visibleVisits.forEach(
        function(visit, index) {

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
                showAllHistory
                    ?
                    "گزارش " +
                    (index + 1) +
                    " — " +
                    gregorianStringToJalali(
                        visit.date
                    )
                    :
                    "آخرین مراجعه — " +
                    gregorianStringToJalali(
                        visit.date
                    );


            box.appendChild(
                title
            );


            const info =
                document.createElement(
                    "p"
                );


            info.textContent =
                "دستگاه: " +
                (
                    visit.deviceModel ||
                    "-"
                ) +
                " | سریال: " +
                (
                    visit.serialNumber ||
                    "-"
                );


            box.appendChild(
                info
            );


            if (visit.problemSubject) {

                const subject =
                    document.createElement(
                        "p"
                    );

                subject.textContent =
                    "موضوع مشکل: " +
                    visit.problemSubject;

                box.appendChild(
                    subject
                );

            }


            const description =
                document.createElement(
                    "p"
                );


            description.textContent =
                visit.description ||
                "توضیحی ثبت نشده است.";


            box.appendChild(
                description
            );


            history.appendChild(
                box
            );

        }
    );


    if (visits.length > 1) {

        const moreButton =
            document.createElement(
                "button"
            );


        moreButton.type =
            "button";

        moreButton.className =
            "btn btn-gray";


        moreButton.textContent =
            showAllHistory
                ?
                "بستن سوابق"
                :
                "بیشتر";


        moreButton.addEventListener(
            "click",
            function() {

                showAllHistory =
                    !showAllHistory;

                renderHistory();

            }
        );


        history.appendChild(
            moreButton
        );

    }

}


/* =========================================================
   متن گزارش
========================================================= */

function makeDescription(
    description
) {

    return (
        "با مراجعه به مرکز و بررسی ربات،\n\n" +
        (
            description ||
            ""
        ) +
        "\n\n" +
        "ربات تست و تحویل مسئول مربوطه گردید."
    );

}


/* =========================================================
   چاپ گزارش
========================================================= */

function printReport() {

    const data =
        getFormData();


    if (!data.centerName) {

        alert(
            "نام مرکز وارد نشده است."
        );

        return;

    }


    if (!data.deviceModel) {

        alert(
            "مدل دستگاه انتخاب نشده است."
        );

        return;

    }


    if (!data.serialNumber) {

        alert(
            "شماره سریال وارد نشده است."
        );

        return;

    }


    const report =
        window.open(
            "",
            "_blank"
        );


    if (!report) {

        alert(
            "پنجره گزارش توسط مرورگر مسدود شده است."
        );

        return;

    }


    const description =
        makeDescription(
            data.description
        );


    report.document.write(`

<!DOCTYPE html>

<html
    lang="fa"
    dir="rtl"
>

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
    margin: 0;
    font-family: Tahoma, Arial, sans-serif;
    direction: rtl;
    color: #111;
    font-size: 13px;
}

h1 {
    text-align: center;
    margin: 0 0 20px;
}

.row {
    display: grid;
    gap: 8px;
    margin-bottom: 10px;
}

.row-3 {
    grid-template-columns: repeat(3, 1fr);
}

.row-2 {
    grid-template-columns: repeat(2, 1fr);
}

.row-4 {
    grid-template-columns: repeat(4, 1fr);
}

.field {
    border: 1px solid #333;
    min-height: 48px;
}

.label {
    background: #eeeeee;
    border-bottom: 1px solid #333;
    padding: 7px;
    font-weight: bold;
}

.value {
    padding: 9px;
    min-height: 28px;
}

.description-section {
    border: 1px solid #333;
    margin-top: 10px;
    margin-bottom: 18px;
}

.description-title {
    background: #eeeeee;
    border-bottom: 1px solid #333;
    padding: 9px;
    font-weight: bold;
}

.description-text {
    white-space: pre-wrap;
    line-height: 2;
    min-height: 180px;
    padding: 15px;
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

.signature-line {
    margin-top: 45px;
    border-bottom: 1px solid #111;
}

</style>

</head>

<body>

<h1>
گزارش کار
</h1>


<div class="row row-3">

<div class="field">
<div class="label">نام مرکز</div>
<div class="value">
${escapeHTML(data.centerName)}
</div>
</div>

<div class="field">
<div class="label">بخش</div>
<div class="value">
${escapeHTML(data.section)}
</div>
</div>

<div class="field">
<div class="label">تاریخ</div>
<div class="value">
${escapeHTML(data.visitDateJalali)}
</div>
</div>

</div>


<div class="row row-2">

<div class="field">
<div class="label">مدل دستگاه</div>
<div class="value">
${escapeHTML(data.deviceModel)}
</div>
</div>

<div class="field">
<div class="label">شماره سریال دستگاه</div>
<div class="value">
${escapeHTML(data.serialNumber)}
</div>
</div>

</div>


<div class="row row-3">

<div class="field">
<div class="label">موضوع مشکل</div>
<div class="value">
${escapeHTML(data.problemSubject)}
</div>
</div>

<div class="field">
<div class="label">گزارش شده توسط</div>
<div class="value">
${escapeHTML(data.reportedBy)}
</div>
</div>

<div class="field">
<div class="label">تاریخ اعلام مشکل</div>
<div class="value">
${escapeHTML(data.problemDateJalali)}
</div>
</div>

</div>


<div class="description-section">

<div class="description-title">
توضیحات
</div>

<div class="description-text">
${escapeHTML(description)}
</div>

</div>


<div class="row row-4">

<div class="field">
<div class="label">نام کارشناس</div>
<div class="value">
${escapeHTML(data.expertName)}
</div>
</div>

<div class="field">
<div class="label">تاریخ</div>
<div class="value">
${escapeHTML(data.expertDateJalali)}
</div>
</div>

<div class="field">
<div class="label">ساعت ورود</div>
<div class="value">
${escapeHTML(data.entryTime)}
</div>
</div>

<div class="field">
<div class="label">ساعت خروج</div>
<div class="value">
${escapeHTML(data.exitTime)}
</div>
</div>

</div>


<div class="signatures">

<div class="signature">

<strong>
نام و امضا تحویل گیرنده
</strong>

<div>
${escapeHTML(data.receiverName)}
</div>

<div class="signature-line"></div>

</div>


<div class="signature">

<strong>
نام و امضا کارشناس
</strong>

<div>
${escapeHTML(data.signatureExpertName)}
</div>

<div class="signature-line"></div>

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
   امنیت HTML
========================================================= */

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   رویدادها
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function() {

        console.log(
            "Site loaded"
        );


        initSupabase();


        /*
           تاریخ‌ها شمسی
        */

        prepareJalaliDateInputs();


        /*
           ورود
        */

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

        }


        /*
           استان‌ها
        */

        renderProvinces();


        /*
           برگشت استان
        */

        getElement(
            "backProvinceBtn"
        )?.addEventListener(
            "click",
            function() {

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


        /*
           مرکز جدید
        */

        getElement(
            "newCenterBtn"
        )?.addEventListener(
            "click",
            createNewCenter
        );


        /*
           برگشت مراکز
        */

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

                currentCenter =
                    null;

                renderCenters();

            }
        );


        /*
           جستجو
        */

        getElement(
            "centerSearch"
        )?.addEventListener(
            "input",
            renderCenters
        );


        /*
           مدل دستگاه
        */

        getElement(
            "deviceModel"
        )?.addEventListener(
            "change",
            loadSerialNumbers
        );


        /*
           سریال جدید
        */

        getElement(
            "newSerialBtn"
        )?.addEventListener(
            "click",
            toggleNewSerial
        );


        /*
           ذخیره
        */

        getElement(
            "saveVisitBtn"
        )?.addEventListener(
            "click",
            saveVisit
        );


        /*
           چاپ
        */

        getElement(
            "printReportBtn"
        )?.addEventListener(
            "click",
            printReport
        );


        /*
           تاریخ‌های پیش‌فرض
        */

        setValue(
            "visitDate",
            getTodayJalali()
        );

        setValue(
            "problemDate",
            getTodayJalali()
        );

        setValue(
            "expertDate",
            getTodayJalali()
        );

    }
);
