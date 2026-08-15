/* =========================================================
   مدیریت مراکز و گزارش کار
   نسخه جدید - Supabase
========================================================= */


/* =========================================================
   تنظیمات
========================================================= */

const SUPABASE_URL =
    "https://nqfykfoxdcfgocfvcwxv.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_oLvZjzdOpAdErVP1sjPtzw_X5CGceR4K";

const PASSWORD = "0111";

const MAX_ATTEMPTS = 3;

const LOCK_TIME = 30 * 60 * 1000;


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
   وضعیت برنامه
========================================================= */

let database = {
    centers: []
};

let currentProvince = "";

let currentCenter = null;

let currentVisit = null;

let editingVisitId = null;

let showAllHistory = false;


/* =========================================================
   ابزار DOM
========================================================= */

function getElement(id) {

    return document.getElementById(id);

}


function getValue(id) {

    const element = getElement(id);

    if (!element) {
        return "";
    }

    return String(element.value || "").trim();

}


function setValue(id, value) {

    const element = getElement(id);

    if (element) {
        element.value = value ?? "";
    }

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
   ورودی کاربر:
   1405/05/18

   خروجی دیتابیس:
   2026-08-09

   هنگام نمایش:
   دوباره 1405/05/18
*/


function pad2(number) {

    return String(number).padStart(2, "0");

}


/* -------------------------
   تبدیل میلادی به شمسی
------------------------- */

function gregorianToJalali(
    gy,
    gm,
    gd
) {

    const gdm = [
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

    let gy2 =
        gy > 1600
            ? gy - 1600
            : gy - 621;

    let gyForCalc =
        gy > 1600
            ? gy
            : gy + 621;

    let jy =
        gy > 1600
            ? 979
            : 0;

    if (gy > 1600) {

        jy = 979;

    } else {

        jy = 0;

    }


    let days =
        365 * gy2 +
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
        gdm[gm - 1];


    if (
        gm > 2 &&
        (
            gy % 4 === 0 &&
            gy % 100 !== 0
            ||
            gy % 400 === 0
        )
    ) {

        days++;

    }


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


    const jm =
        days < 186
            ?
            1 + Math.floor(days / 31)
            :
            7 + Math.floor(
                (days - 186) / 30
            );


    const jd =
        1 +
        (
            days < 186
                ?
                days % 31
                :
                (days - 186) % 30
        );


    return [
        jy,
        jm,
        jd
    ];

}


/* -------------------------
   تبدیل شمسی به میلادی
------------------------- */

function jalaliToGregorian(
    jy,
    jm,
    jd
) {

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
        );


    if (jm < 7) {

        days +=
            (jm - 1) * 31;

    } else {

        days +=
            (jm - 7) * 30 +
            186;

    }


    days +=
        jd -
        1;


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
            ||
            gy % 400 === 0
        )
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


    let gm = 1;


    while (
        gd >
        sal_a[gm]
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


/* -------------------------
   شمسی → ISO
------------------------- */

function jalaliToISO(value) {

    if (!value) {
        return "";
    }


    const clean =
        String(value)
            .replace(
                /-/g,
                "/"
            )
            .trim();


    const parts =
        clean.split("/");


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


    const [
        gy,
        gm,
        gd
    ] =
        jalaliToGregorian(
            jy,
            jm,
            jd
        );


    return (
        gy +
        "-" +
        pad2(gm) +
        "-" +
        pad2(gd)
    );

}


/* -------------------------
   ISO → شمسی
------------------------- */

function isoToJalali(value) {

    if (!value) {
        return "";
    }


    const parts =
        String(value)
            .substring(0, 10)
            .split("-");


    if (parts.length !== 3) {
        return value;
    }


    const gy =
        Number(parts[0]);

    const gm =
        Number(parts[1]);

    const gd =
        Number(parts[2]);


    if (
        !gy ||
        !gm ||
        !gd
    ) {

        return value;

    }


    const [
        jy,
        jm,
        jd
    ] =
        gregorianToJalali(
            gy,
            gm,
            gd
        );


    return (
        jy +
        "/" +
        pad2(jm) +
        "/" +
        pad2(jd)
    );

}


/* -------------------------
   امروز شمسی
------------------------- */

function getTodayJalali() {

    const now =
        new Date();


    return isoToJalali(
        now
            .toISOString()
            .substring(0, 10)
    );

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


        /*
           دریافت اولیه اطلاعات
           برای جستجوی پیشرفته
        */

        awaitLoadDatabase();


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


/* =========================================================
   پیام قفل
========================================================= */

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


        setValue(
            "loginMessage",
            ""
        );


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
   دریافت دیتابیس
========================================================= */

async function awaitLoadDatabase() {

    try {

        await loadDatabase();

    } catch (error) {

        console.error(error);

    }

}


async function loadDatabase() {

    if (!supabaseClient) {

        if (!initSupabase()) {

            return {
                centers: []
            };

        }

    }


    try {

        /*
           مراکز
        */

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
                "centers:",
                centersResult.error
            );

            throw centersResult.error;

        }


        /*
           دستگاه‌ها
        */

        const devicesResult =
            await supabaseClient
                .from("devices")
                .select("*");


        if (devicesResult.error) {

            console.error(
                "devices:",
                devicesResult.error
            );

            throw devicesResult.error;

        }


        /*
           مراجعات
        */

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
                "visits:",
                visitsResult.error
            );

            throw visitsResult.error;

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
                                ) ===
                                String(
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
                                    ) ===
                                    String(
                                        center.id
                                    );

                                }
                            )
                            .map(
                                function(visit) {

                                    const device =
                                        devices.find(
                                            function(item) {

                                                return String(
                                                    item.id
                                                ) ===
                                                String(
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

                                        deviceId:
                                            visit.device_id,

                                        deviceModel:
                                            device?.model || "",

                                        serialNumber:
                                            device?.serial || "",

                                        problemSubject:
                                            visit.problem_subject || "",

                                        reportedBy:
                                            visit.reported_by || "",

                                        problemDate:
                                            visit.problem_date,

                                        description:
                                            visit.description || "",

                                        expertName:
                                            visit.expert_name || "",

                                        expertDate:
                                            visit.visit_date,

                                        entryTime:
                                            visit.entry_time || "",

                                        exitTime:
                                            visit.exit_time || "",

                                        receiverName:
                                            visit.receiver_name || "",

                                        signatureExpertName:
                                            visit.expert_signature || "",

                                        createdAt:
                                            visit.created_at

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


        return database;


    } catch (error) {

        console.error(
            "DATABASE ERROR:",
            error
        );


        database = {
            centers: []
        };


        return database;

    }

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

    currentCenter =
        null;

    currentVisit =
        null;

    editingVisitId =
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
   مراکز
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


    grid.innerHTML = "";


    const query =
        getValue(
            "centerSearch"
        ).toLowerCase();


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
                    "هنوز مرکزی ثبت نشده است.";

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


            const openButton =
                document.createElement(
                    "button"
                );


            openButton.className =
                "btn btn-blue";


            openButton.textContent =
                "باز کردن مرکز";


            openButton.addEventListener(
                "click",
                function() {

                    openExistingCenter(
                        center
                    );

                }
            );


            const deleteButton =
                document.createElement(
                    "button"
                );


            deleteButton.className =
                "btn btn-danger";


            deleteButton.textContent =
                "🗑 حذف مرکز";


            deleteButton.addEventListener(
                "click",
                function() {

                    deleteCenter(
                        center.id
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
                openButton
            );

            box.appendChild(
                deleteButton
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

    currentVisit =
        null;

    editingVisitId =
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


    nameInput?.removeAttribute(
        "readonly"
    );


    clearVisitFields();


    setValue(
        "centerName",
        ""
    );


    getElement(
        "saveVisitBtn"
    ).textContent =
        "💾 ذخیره گزارش";


    getElement(
        "cancelEditBtn"
    )?.classList.add(
        "hidden"
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


    currentVisit =
        null;

    editingVisitId =
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


    loadSerialNumbers();


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
   سریال‌ها
========================================================= */

function resetSerialSelect() {

    const select =
        getElement(
            "serialNumber"
        );


    if (!select) {
        return;
    }


    select.innerHTML =
        '<option value="">ابتدا مدل دستگاه را انتخاب کنید</option>';

}


function getCenterSerials(
    model
) {

    if (!currentCenter) {
        return [];
    }


    return [
        ...new Set(
            currentCenter.devices
                .filter(
                    function(device) {

                        return (
                            device.model ===
                            model
                        );

                    }
                )
                .map(
                    function(device) {

                        return device.serial;

                    }
                )
                .filter(Boolean)
        )
    ];

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


    resetSerialSelect();


    if (!model) {
        return;
    }


    select.innerHTML =
        '<option value="">انتخاب شماره سریال</option>';


    const serials =
        getCenterSerials(
            model
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


    /*
       اگر در حال ویرایش هستیم
       سریال قبلی انتخاب شود
    */

    if (
        currentVisit &&
        currentVisit.serialNumber
    ) {

        select.value =
            currentVisit.serialNumber;

    }

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

    const newInput =
        getElement(
            "newSerialNumber"
        );


    if (
        newInput &&
        !newInput.classList.contains(
            "hidden"
        ) &&
        newInput.value.trim()
    ) {

        return newInput.value.trim();

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
            getValue("centerName"),

        section:
            getValue("sectionName"),

        date:
            getValue("visitDate"),

        deviceModel:
            getValue("deviceModel"),

        serialNumber:
            getSelectedSerial(),

        problemSubject:
            getValue("problemSubject"),

        reportedBy:
            getValue("reportedBy"),

        problemDate:
            getValue("problemDate"),

        description:
            getValue("description"),

        expertName:
            getValue("expertName"),

        expertDate:
            getValue("expertDate"),

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
   پیدا کردن یا ساخت دستگاه
========================================================= */

async function getOrCreateDevice(
    centerId,
    model,
    serial
) {

    if (!model || !serial) {
        return null;
    }


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

        throw existing.error;

    }


    if (existing.data) {

        return existing.data;

    }


    const created =
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


    if (created.error) {

        throw created.error;

    }


    return created.data;

}


/* =========================================================
   ذخیره گزارش
========================================================= */

async function saveVisit() {

    const data =
        getFormData();


    if (!data.centerName) {

        alert(
            "نام مرکز را وارد کنید."
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


    const visitDateISO =
        jalaliToISO(
            data.date
        );


    const problemDateISO =
        jalaliToISO(
            data.problemDate
        );


    if (!visitDateISO) {

        alert(
            "تاریخ مراجعه را به صورت 1405/05/18 وارد کنید."
        );

        return;

    }


    if (
        data.problemDate &&
        !problemDateISO
    ) {

        alert(
            "تاریخ اعلام مشکل صحیح نیست."
        );

        return;

    }


    try {

        /*
           اگر مرکز جدید است
           ابتدا مرکز را می‌سازیم.
        */

        if (!currentCenter) {

            const centerResult =
                await supabaseClient
                    .from("centers")
                    .insert({

                        province:
                            currentProvince,

                        name:
                            data.centerName,

                        section:
                            data.section || null,

                        phone:
                            null,

                        manager:
                            null

                    })
                    .select()
                    .single();


            if (centerResult.error) {

                throw centerResult.error;

            }


            currentCenter = {

                id:
                    centerResult.data.id,

                province:
                    centerResult.data.province,

                name:
                    centerResult.data.name,

                section:
                    centerResult.data.section || "",

                phone:
                    centerResult.data.phone || "",

                manager:
                    centerResult.data.manager || "",

                devices: [],

                visits: []

            };

        }


        /*
           مرکز موجود
        */

        else {

            const updateCenter =
                await supabaseClient
                    .from("centers")
                    .update({

                        name:
                            data.centerName,

                        section:
                            data.section || null

                    })
                    .eq(
                        "id",
                        currentCenter.id
                    );


            if (updateCenter.error) {

                throw updateCenter.error;

            }

        }


        /*
           دستگاه
        */

        const device =
            await getOrCreateDevice(
                currentCenter.id,
                data.deviceModel,
                data.serialNumber
            );


        if (!device) {

            throw new Error(
                "دستگاه ایجاد نشد."
            );

        }


        /*
           ویرایش گزارش
        */

        if (editingVisitId) {

            const updateVisit =
                await supabaseClient
                    .from("visits")
                    .update({

                        device_id:
                            device.id,

                        visit_date:
                            visitDateISO,

                        problem_subject:
                            data.problemSubject || null,

                        reported_by:
                            data.reportedBy || null,

                        problem_date:
                            problemDateISO || null,

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
                    .eq(
                        "id",
                        editingVisitId
                    );


            if (updateVisit.error) {

                throw updateVisit.error;

            }


            alert(
                "گزارش با موفقیت ویرایش شد."
            );

        }


        /*
           گزارش جدید
        */

        else {

            const insertVisit =
                await supabaseClient
                    .from("visits")
                    .insert({

                        center_id:
                            currentCenter.id,

                        device_id:
                            device.id,

                        visit_date:
                            visitDateISO,

                        problem_subject:
                            data.problemSubject || null,

                        reported_by:
                            data.reportedBy || null,

                        problem_date:
                            problemDateISO || null,

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


            if (insertVisit.error) {

                throw insertVisit.error;

            }


            alert(
                "گزارش با موفقیت ذخیره شد."
            );

        }


        /*
           بعد از ذخیره
           دوباره اطلاعات را بگیر
        */

        editingVisitId =
            null;

        currentVisit =
            null;


        getElement(
            "cancelEditBtn"
        )?.classList.add(
            "hidden"
        );


        getElement(
            "saveVisitBtn"
        ).textContent =
            "💾 ذخیره گزارش";


        await loadDatabase();


        currentCenter =
            database.centers.find(
                function(center) {

                    return String(
                        center.id
                    ) ===
                    String(
                        currentCenter.id
                    );

                }
            );


        clearVisitFields();

        loadSerialNumbers();

        renderHistory();

        renderCenters();


    } catch (error) {

        console.error(
            "SAVE ERROR:",
            error
        );


        alert(
            "خطا در ذخیره اطلاعات:\n\n" +
            error.message
        );

    }

}


/* =========================================================
   نمایش تاریخچه
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
                    isoToJalali(
                        visit.date
                    )
                    :
                    "آخرین مراجعه — " +
                    isoToJalali(
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


            const buttons =
                document.createElement(
                    "div"
                );


            buttons.className =
                "history-actions";


            /*
               مشاهده / ویرایش
            */

            const viewButton =
                document.createElement(
                    "button"
                );


            viewButton.className =
                "btn btn-blue";


            viewButton.textContent =
                "👁 مشاهده / ویرایش";


            viewButton.addEventListener(
                "click",
                function() {

                    editVisit(
                        visit
                    );

                }
            );


            /*
               چاپ
            */

            const printButton =
                document.createElement(
                    "button"
                );


            printButton.className =
                "btn btn-gray";


            printButton.textContent =
                "🖨 چاپ";


            printButton.addEventListener(
                "click",
                function() {

                    printVisit(
                        visit
                    );

                }
            );


            /*
               حذف
            */

            const deleteButton =
                document.createElement(
                    "button"
                );


            deleteButton.className =
                "btn btn-danger";


            deleteButton.textContent =
                "🗑 حذف";


            deleteButton.addEventListener(
                "click",
                function() {

                    deleteVisit(
                        visit.id
                    );

                }
            );


            buttons.appendChild(
                viewButton
            );

            buttons.appendChild(
                printButton
            );

            buttons.appendChild(
                deleteButton
            );


            box.appendChild(
                buttons
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


        moreButton.className =
            "btn btn-gray";


        moreButton.textContent =
            showAllHistory
                ?
                "بستن سوابق"
                :
                "نمایش همه سوابق";


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
   ویرایش گزارش
========================================================= */

function editVisit(
    visit
) {

    currentVisit =
        visit;

    editingVisitId =
        visit.id;


    setValue(
        "sectionName",
        visit.section || ""
    );


    setValue(
        "visitDate",
        isoToJalali(
            visit.date
        )
    );


    setValue(
        "deviceModel",
        visit.deviceModel || ""
    );


    loadSerialNumbers();


    setTimeout(
        function() {

            setValue(
                "serialNumber",
                visit.serialNumber || ""
            );

        },
        50
    );


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
        visit.problemSubject
    );


    setValue(
        "reportedBy",
        visit.reportedBy
    );


    setValue(
        "problemDate",
        isoToJalali(
            visit.problemDate
        )
    );


    setValue(
        "description",
        visit.description
    );


    setValue(
        "expertName",
        visit.expertName ||
        "حیدریانی"
    );


    setValue(
        "expertDate",
        isoToJalali(
            visit.expertDate ||
            visit.date
        )
    );


    setValue(
        "entryTime",
        visit.entryTime
    );


    setValue(
        "exitTime",
        visit.exitTime
    );


    setValue(
        "receiverName",
        visit.receiverName
    );


    setValue(
        "signatureExpertName",
        visit.signatureExpertName ||
        "حیدریانی"
    );


    setValue(
        "centerName",
        currentCenter.name
    );


    getElement(
        "saveVisitBtn"
    ).textContent =
        "💾 ذخیره ویرایش";


    getElement(
        "cancelEditBtn"
    )?.classList.remove(
        "hidden"
    );


    getElement(
        "reportPageTitle"
    ).textContent =
        "ویرایش گزارش";


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


    window.scrollTo(
        {
            top: 0,
            behavior: "smooth"
        }
    );

}


/* =========================================================
   لغو ویرایش
========================================================= */

function cancelEdit() {

    editingVisitId =
        null;

    currentVisit =
        null;


    getElement(
        "cancelEditBtn"
    )?.classList.add(
        "hidden"
    );


    getElement(
        "saveVisitBtn"
    ).textContent =
        "💾 ذخیره گزارش";


    getElement(
        "reportPageTitle"
    ).textContent =
        currentCenter
            ?
            currentCenter.name
            :
            "گزارش کار";


    clearVisitFields();

}


/* =========================================================
   حذف گزارش
========================================================= */

async function deleteVisit(
    visitId
) {

    if (
        !confirm(
            "آیا از حذف این گزارش مطمئن هستید؟\nاین عملیات قابل برگشت نیست."
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


        currentCenter =
            database.centers.find(
                function(center) {

                    return String(
                        center.id
                    ) ===
                    String(
                        currentCenter.id
                    );

                }
            );


        renderHistory();


        alert(
            "گزارش حذف شد."
        );


    } catch (error) {

        console.error(
            error
        );


        alert(
            "خطا در حذف گزارش:\n" +
            error.message
        );

    }

}


/* =========================================================
   حذف مرکز
========================================================= */

async function deleteCenter(
    centerId
) {

    const center =
        database.centers.find(
            function(item) {

                return String(
                    item.id
                ) ===
                String(
                    centerId
                );

            }
        );


    if (!center) {
        return;
    }


    const confirmed =
        confirm(
            "مرکز «" +
            center.name +
            "» حذف شود؟\n\n" +
            "تمام دستگاه‌ها و سوابق این مرکز نیز حذف خواهند شد."
        );


    if (!confirmed) {
        return;
    }


    try {

        /*
           اول مراجعات
        */

        const visitsResult =
            await supabaseClient
                .from("visits")
                .delete()
                .eq(
                    "center_id",
                    centerId
                );


        if (visitsResult.error) {

            throw visitsResult.error;

        }


        /*
           بعد دستگاه‌ها
        */

        const devicesResult =
            await supabaseClient
                .from("devices")
                .delete()
                .eq(
                    "center_id",
                    centerId
                );


        if (devicesResult.error) {

            throw devicesResult.error;

        }


        /*
           در نهایت مرکز
        */

        const centerResult =
            await supabaseClient
                .from("centers")
                .delete()
                .eq(
                    "id",
                    centerId
                );


        if (centerResult.error) {

            throw centerResult.error;

        }


        await loadDatabase();


        renderCenters();


        alert(
            "مرکز با موفقیت حذف شد."
        );


    } catch (error) {

        console.error(
            error
        );


        alert(
            "خطا در حذف مرکز:\n" +
            error.message
        );

    }

}


/* =========================================================
   جستجوی پیشرفته
========================================================= */

async function advancedSearch() {

    const type =
        getValue(
            "advancedSearchType"
        );


    const query =
        getValue(
            "advancedSearchInput"
        )
            .toLowerCase();


    const resultsBox =
        getElement(
            "advancedSearchResults"
        );


    if (!resultsBox) {
        return;
    }


    resultsBox.innerHTML = "";


    if (!query) {

        resultsBox.innerHTML =
            "<div class='search-empty'>عبارت جستجو را وارد کنید.</div>";

        return;

    }


    await loadDatabase();


    let results = [];


    /*
       جستجوی مرکز
    */

    if (
        type === "center"
    ) {

        results =
            database.centers.filter(
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


    /*
       جستجوی سریال
    */

    if (
        type === "serial"
    ) {

        database.centers.forEach(
            function(center) {

                const found =
                    center.devices.find(
                        function(device) {

                            return String(
                                device.serial || ""
                            )
                                .toLowerCase()
                                .includes(
                                    query
                                );

                        }
                    );


                if (found) {

                    results.push({
                        center: center,
                        device: found
                    });

                }

            }
        );

    }


    if (!results.length) {

        resultsBox.innerHTML =
            "<div class='search-empty'>نتیجه‌ای پیدا نشد.</div>";

        return;

    }


    results.forEach(
        function(result) {

            const center =
                type === "center"
                    ?
                    result
                    :
                    result.center;


            const box =
                document.createElement(
                    "div"
                );


            box.className =
                "advanced-result";


            const title =
                document.createElement(
                    "h3"
                );


            title.textContent =
                "🏥 " +
                center.name;


            box.appendChild(
                title
            );


            const province =
                provinces.find(
                    function(item) {

                        return item[0] ===
                        center.province;

                    }
                );


            const p =
                document.createElement(
                    "p"
                );


            p.textContent =
                "استان: " +
                (
                    province
                        ?
                        province[1]
                        :
                        center.province
                );


            box.appendChild(
                p
            );


            if (
                type === "serial"
            ) {

                const deviceInfo =
                    document.createElement(
                        "p"
                    );


                deviceInfo.textContent =
                    "مدل: " +
                    result.device.model +
                    " | سریال: " +
                    result.device.serial;


                box.appendChild(
                    deviceInfo
                );

            }


            const button =
                document.createElement(
                    "button"
                );


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
                button
            );


            resultsBox.appendChild(
                box
            );

        }
    );

}


/* =========================================================
   چاپ گزارش
========================================================= */

function printReport() {

    const data =
        getFormData();


    printData(
        data
    );

}


function printVisit(
    visit
) {

    printData({

        centerName:
            currentCenter.name,

        section:
            visit.section,

        date:
            isoToJalali(
                visit.date
            ),

        deviceModel:
            visit.deviceModel,

        serialNumber:
            visit.serialNumber,

        problemSubject:
            visit.problemSubject,

        reportedBy:
            visit.reportedBy,

        problemDate:
            isoToJalali(
                visit.problemDate
            ),

        description:
            visit.description,

        expertName:
            visit.expertName,

        expertDate:
            isoToJalali(
                visit.expertDate ||
                visit.date
            ),

        entryTime:
            visit.entryTime,

        exitTime:
            visit.exitTime,

        receiverName:
            visit.receiverName,

        signatureExpertName:
            visit.signatureExpertName

    });

}


/* =========================================================
   ساخت گزارش چاپی
========================================================= */

function printData(
    data
) {

    if (!data.centerName) {

        alert(
            "نام مرکز وارد نشده است."
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
            "پنجره چاپ توسط مرورگر مسدود شده است."
        );

        return;

    }


    const description =
        "با مراجعه به مرکز و بررسی ربات،\n\n" +
        (
            data.description ||
            ""
        ) +
        "\n\n" +
        "ربات تست و تحویل مسئول مربوطه گردید.";


    report.document.write(`

<!DOCTYPE html>

<html lang="fa" dir="rtl">

<head>

<meta charset="UTF-8">

<title>گزارش کار</title>

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
    direction: rtl;
    color: #111;
    font-size: 13px;
}

h1 {
    text-align: center;
    margin-bottom: 25px;
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
    background: #eee;
    border-bottom: 1px solid #333;
    padding: 7px;
    font-weight: bold;
}

.value {
    padding: 9px;
    min-height: 30px;
}

.description-section {
    border: 1px solid #333;
    margin-top: 12px;
}

.description-title {
    background: #eee;
    border-bottom: 1px solid #333;
    padding: 9px;
    font-weight: bold;
}

.description-text {
    white-space: pre-wrap;
    line-height: 2;
    min-height: 190px;
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

<h1>گزارش کار</h1>

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
${escapeHTML(data.date)}
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
<div class="label">شماره سریال</div>
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
${escapeHTML(data.problemDate)}
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
${escapeHTML(data.expertDate)}
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


        /* استان‌ها */

        renderProvinces();


        /* برگشت استان */

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


        /* مرکز جدید */

        getElement(
            "newCenterBtn"
        )?.addEventListener(
            "click",
            createNewCenter
        );


        /* برگشت مراکز */

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


                if (editingVisitId) {

                    editingVisitId =
                        null;

                    currentVisit =
                        null;

                }


                renderCenters();

            }
        );


        /* جستجوی معمولی مرکز */

        getElement(
            "centerSearch"
        )?.addEventListener(
            "input",
            renderCenters
        );


        /* مدل دستگاه */

        getElement(
            "deviceModel"
        )?.addEventListener(
            "change",
            loadSerialNumbers
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


        /* چاپ */

        getElement(
            "printReportBtn"
        )?.addEventListener(
            "click",
            printReport
        );


        /* لغو ویرایش */

        getElement(
            "cancelEditBtn"
        )?.addEventListener(
            "click",
            cancelEdit
        );


        /* جستجوی پیشرفته */

        getElement(
            "advancedSearchBtn"
        )?.addEventListener(
            "click",
            advancedSearch
        );


        getElement(
            "advancedSearchInput"
        )?.addEventListener(
            "keydown",
            function(event) {

                if (
                    event.key === "Enter"
                ) {

                    advancedSearch();

                }

            }
        );


        /* تغییر نوع جستجو */

        getElement(
            "advancedSearchType"
        )?.addEventListener(
            "change",
            function() {

                const type =
                    getValue(
                        "advancedSearchType"
                    );


                const input =
                    getElement(
                        "advancedSearchInput"
                    );


                if (!input) {
                    return;
                }


                input.placeholder =
                    type === "serial"
                        ?
                        "شماره سریال ربات..."
                        :
                        "نام مرکز...";

            }
        );


        /* پاک کردن جستجوی پیشرفته */

        getElement(
            "clearAdvancedSearchBtn"
        )?.addEventListener(
            "click",
            function() {

                setValue(
                    "advancedSearchInput",
                    ""
                );


                getElement(
                    "advancedSearchResults"
                ).innerHTML =
                    "";

            }
        );


        /* وضعیت قفل */

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

    }
);
