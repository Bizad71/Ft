/* =========================================================
   مدیریت مراکز و گزارش کار
   Supabase
   ساختار:
   centers
   devices
   visits
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
    centers: [],
    devices: [],
    visits: []
};

let currentProvince = "";

let currentProvinceName = "";

let currentCenter = null;

let currentVisit = null;

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


    if (!supabaseClient) {

        supabaseClient =
            window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_KEY
            );

    }


    return true;

}


/* =========================================================
   تاریخ شمسی
========================================================= */

function pad2(number) {

    return String(number).padStart(2, "0");

}


/*
   تبدیل میلادی به شمسی
*/

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


    if (
        gm > 2 &&
        (
            gy2 % 4 === 0 &&
            (
                gy2 % 100 !== 0 ||
                gy2 % 400 === 0
            )
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


/*
   تبدیل شمسی به میلادی
*/

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
            (
                (jy % 33) + 3
            ) / 4
        ) +
        78 +
        jd +
        (
            jm < 7
                ?
                (jm - 1) * 31
                :
                (jm - 7) * 30 + 186
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


    let gm = 1;


    while (
        gd > monthDays[gm - 1]
    ) {

        gd -=
            monthDays[gm - 1];

        gm++;

    }


    return [
        gy,
        gm,
        gd
    ];

}


/*
   1405/05/18
   →
   2026-08-09
*/

function jalaliToISO(
    value
) {

    if (!value) {
        return "";
    }


    const normalized =
        String(value)
            .replace(
                /-/g,
                "/"
            )
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
            );


    const parts =
        normalized
            .split("/")
            .map(Number);


    if (
        parts.length !== 3 ||
        parts.some(
            Number.isNaN
        )
    ) {

        return "";

    }


    const [
        jy,
        jm,
        jd
    ] = parts;


    if (
        jy < 1300 ||
        jy > 1500 ||
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


/*
   2026-08-09
   →
   1405/05/18
*/

function isoToJalali(
    iso
) {

    if (!iso) {
        return "";
    }


    const parts =
        String(iso)
            .substring(0, 10)
            .split("-")
            .map(Number);


    if (
        parts.length !== 3 ||
        parts.some(
            Number.isNaN
        )
    ) {

        return "";

    }


    const [
        gy,
        gm,
        gd
    ] = parts;


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


/*
   امروز
*/

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
        Date.now() < lockUntil
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


            button.type = "button";

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
   دریافت اطلاعات
========================================================= */

async function loadDatabase() {

    if (!initSupabase()) {

        alert(
            "کتابخانه Supabase بارگذاری نشده است."
        );

        return false;

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
                        "created_at",
                        {
                            ascending: false
                        }
                    )

            ]);


        if (centersResult.error) {

            console.error(
                centersResult.error
            );

            alert(
                "خطا در دریافت مراکز:\n" +
                centersResult.error.message
            );

            return false;

        }


        if (devicesResult.error) {

            console.error(
                devicesResult.error
            );

            alert(
                "خطا در دریافت دستگاه‌ها:\n" +
                devicesResult.error.message
            );

            return false;

        }


        if (visitsResult.error) {

            console.error(
                visitsResult.error
            );

            alert(
                "خطا در دریافت گزارش‌ها:\n" +
                visitsResult.error.message
            );

            return false;

        }


        database.centers =
            centersResult.data || [];


        database.devices =
            devicesResult.data || [];


        database.visits =
            visitsResult.data || [];


        return true;

    } catch (error) {

        console.error(
            error
        );

        alert(
            "ارتباط با پایگاه داده برقرار نشد."
        );

        return false;

    }

}


/* =========================================================
   استان
========================================================= */

function getProvinceName(
    provinceKey
) {

    const item =
        provinces.find(
            function(p) {

                return p[0] === provinceKey;

            }
        );


    return item
        ? item[1]
        : provinceKey;

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

    currentVisit =
        null;

    showAllHistory =
        false;


    const loaded =
        await loadDatabase();


    if (!loaded) {
        return;
    }


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

function getProvinceCenters() {

    return database.centers.filter(
        function(center) {

            return (
                String(
                    center.province || ""
                ) ===
                String(
                    currentProvince
                )
            );

        }
    );

}


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
        )
            .toLowerCase();


    grid.innerHTML = "";


    let centers =
        getProvinceCenters();


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


            const devices =
                database.devices.filter(
                    function(device) {

                        return String(
                            device.center_id
                        ) ===
                        String(
                            center.id
                        );

                    }
                );


            const visits =
                database.visits.filter(
                    function(visit) {

                        return database.devices.some(
                            function(device) {

                                return (
                                    String(
                                        device.id
                                    ) ===
                                    String(
                                        visit.device_id
                                    ) &&
                                    String(
                                        device.center_id
                                    ) ===
                                    String(
                                        center.id
                                    )
                                );

                            }
                        );

                    }
                );


            const count =
                document.createElement(
                    "p"
                );


            count.textContent =
                "گزارش‌ها: " +
                visits.length +
                " | دستگاه‌ها: " +
                devices.length;


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


            const deleteButton =
                document.createElement(
                    "button"
                );


            deleteButton.type =
                "button";

            deleteButton.className =
                "btn btn-danger";

            deleteButton.textContent =
                "🗑️ حذف مرکز";


            deleteButton.addEventListener(
                "click",
                function() {

                    deleteCenter(
                        center
                    );

                }
            );


            box.appendChild(title);
            box.appendChild(count);
            box.appendChild(button);
            box.appendChild(deleteButton);


            grid.appendChild(box);

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


    setValue(
        "provinceName",
        currentProvinceName
    );


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


    setValue(
        "expertName",
        "حیدریانی"
    );


    setValue(
        "signatureExpertName",
        "حیدریانی"
    );


    showNormalSaveMode();

    renderHistory();

}


/* =========================================================
   مرکز موجود
========================================================= */

async function openExistingCenter(
    center
) {

    const loaded =
        await loadDatabase();


    if (!loaded) {
        return;
    }


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


    if (!currentCenter) {

        alert(
            "مرکز پیدا نشد."
        );

        return;

    }


    currentVisit =
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


    setValue(
        "provinceName",
        getProvinceName(
            currentCenter.province
        )
    );


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


    showNormalSaveMode();


    renderHistory();

}


/* =========================================================
   پاک کردن فرم
========================================================= */

function clearVisitFields() {

    setValue(
        "sectionName",
        ""
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


    currentVisit =
        null;

}


/* =========================================================
   حالت ذخیره / ویرایش
========================================================= */

function showNormalSaveMode() {

    getElement(
        "saveVisitBtn"
    )?.classList.remove(
        "hidden"
    );


    getElement(
        "updateVisitBtn"
    )?.classList.add(
        "hidden"
    );


    getElement(
        "cancelEditBtn"
    )?.classList.add(
        "hidden"
    );

}


function showEditMode() {

    getElement(
        "saveVisitBtn"
    )?.classList.add(
        "hidden"
    );


    getElement(
        "updateVisitBtn"
    )?.classList.remove(
        "hidden"
    );


    getElement(
        "cancelEditBtn"
    )?.classList.remove(
        "hidden"
    );

}


/* =========================================================
   دستگاه‌ها / سریال
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
        )
            .filter(
                function(device) {

                    return (
                        device.model ===
                        model
                    );

                }
            );


    devices.forEach(
        function(device) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                device.id;


            option.textContent =
                device.serial;


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


function getSelectedSerialText() {

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


    const select =
        getElement(
            "serialNumber"
        );


    if (!select) {
        return "";
    }


    const option =
        select.options[
            select.selectedIndex
        ];


    return option
        ? option.textContent.trim()
        : "";

}


/* =========================================================
   فرم
========================================================= */

function getFormData() {

    return {

        centerName:
            getValue(
                "centerName"
            ),

        section:
            getValue(
                "sectionName"
            ),

        visitDate:
            getValue(
                "visitDate"
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

        expertSignature:
            getValue(
                "signatureExpertName"
            ),

        deviceModel:
            getValue(
                "deviceModel"
            ),

        serialNumber:
            getSelectedSerialText()

    };

}


/* =========================================================
   پیدا کردن / ایجاد دستگاه
========================================================= */

async function findOrCreateDevice(
    centerId,
    model,
    serial
) {

    const existing =
        database.devices.find(
            function(device) {

                return (
                    String(
                        device.center_id
                    ) ===
                    String(
                        centerId
                    ) &&
                    String(
                        device.model
                    ) ===
                    String(
                        model
                    ) &&
                    String(
                        device.serial
                    ).trim() ===
                    String(
                        serial
                    ).trim()
                );

            }
        );


    if (existing) {

        return existing;

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

        console.error(
            result.error
        );

        throw new Error(
            "ذخیره دستگاه انجام نشد:\n" +
            result.error.message
        );

    }


    database.devices.push(
        result.data
    );


    return result.data;

}


/* =========================================================
   ذخیره مرکز
========================================================= */

async function ensureCenter(
    centerName
) {

    let center =
        database.centers.find(
            function(item) {

                return (
                    String(
                        item.province
                    ) ===
                    String(
                        currentProvince
                    ) &&
                    String(
                        item.name
                    )
                        .trim()
                        .toLowerCase() ===
                    String(
                        centerName
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
                    centerName,

                section:
                    ""

            })
            .select()
            .single();


    if (result.error) {

        console.error(
            result.error
        );

        throw new Error(
            "ذخیره مرکز انجام نشد:\n" +
            result.error.message
        );

    }


    center =
        result.data;


    database.centers.push(
        center
    );


    return center;

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


    const visitDate =
        jalaliToISO(
            data.visitDate
        );


    if (!visitDate) {

        alert(
            "تاریخ مراجعه را به صورت 1405/05/18 وارد کنید."
        );

        return;

    }


    const problemDate =
        data.problemDate
            ?
            jalaliToISO(
                data.problemDate
            )
            :
            null;


    if (
        data.problemDate &&
        !problemDate
    ) {

        alert(
            "تاریخ اعلام مشکل صحیح نیست."
        );

        return;

    }


    const expertDate =
        data.expertDate
            ?
            jalaliToISO(
                data.expertDate
            )
            :
            null;


    if (
        data.expertDate &&
        !expertDate
    ) {

        alert(
            "تاریخ کارشناس صحیح نیست."
        );

        return;

    }


    try {

        if (!initSupabase()) {
            return;
        }


        const center =
            currentCenter ||
            await ensureCenter(
                data.centerName
            );


        currentCenter =
            center;


        const device =
            await findOrCreateDevice(
                center.id,
                data.deviceModel,
                data.serialNumber
            );


        const result =
            await supabaseClient
                .from("visits")
                .insert({

                    center_id:
                        center.id,

                    device_id:
                        device.id,

                    visit_date:
                        visitDate,

                    problem_subject:
                        data.problemSubject ||
                        null,

                    reported_by:
                        data.reportedBy ||
                        null,

                    problem_date:
                        problemDate,

                    description:
                        data.description ||
                        null,

                    expert_name:
                        data.expertName ||
                        null,

                    entry_time:
                        data.entryTime ||
                        null,

                    exit_time:
                        data.exitTime ||
                        null,

                    receiver_name:
                        data.receiverName ||
                        null,

                    expert_signature:
                        data.expertSignature ||
                        null

                })
                .select()
                .single();


        if (result.error) {

            throw new Error(
                "ذخیره گزارش انجام نشد:\n" +
                result.error.message
            );

        }


        database.visits.unshift(
            result.data
        );


        alert(
            "گزارش با موفقیت ذخیره شد."
        );


        clearVisitFields();


        setValue(
            "centerName",
            center.name
        );


        loadSerialNumbers();

        renderHistory();

        renderCenters();


    } catch (error) {

        console.error(
            error
        );

        alert(
            error.message ||
            "خطا هنگام ذخیره اطلاعات."
        );

    }

}


/* =========================================================
   پیدا کردن دستگاه گزارش
========================================================= */

function getDeviceForVisit(
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
   تاریخچه
========================================================= */

function getCurrentCenterVisits() {

    if (!currentCenter) {
        return [];
    }


    const devices =
        getCenterDevices(
            currentCenter.id
        );


    const deviceIds =
        devices.map(
            function(device) {

                return String(
                    device.id
                );

            }
        );


    return database.visits.filter(
        function(visit) {

            return deviceIds.includes(
                String(
                    visit.device_id
                )
            );

        }
    );

}


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
        getCurrentCenterVisits();


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

            const device =
                getDeviceForVisit(
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
                showAllHistory
                    ?
                    "گزارش " +
                    (
                        index + 1
                    ) +
                    " — " +
                    isoToJalali(
                        visit.visit_date
                    )
                    :
                    "آخرین مراجعه — " +
                    isoToJalali(
                        visit.visit_date
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
                    device?.model ||
                    "-"
                ) +
                " | سریال: " +
                (
                    device?.serial ||
                    "-"
                );


            box.appendChild(
                info
            );


            if (
                visit.problem_subject
            ) {

                const subject =
                    document.createElement(
                        "p"
                    );


                subject.textContent =
                    "موضوع مشکل: " +
                    visit.problem_subject;


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


            const buttons =
                document.createElement(
                    "div"
                );


            buttons.className =
                "history-actions";


            const viewButton =
                document.createElement(
                    "button"
                );


            viewButton.type =
                "button";

            viewButton.className =
                "btn btn-blue";

            viewButton.textContent =
                "👁️ مشاهده کامل";


            viewButton.addEventListener(
                "click",
                function() {

                    openVisitDetails(
                        visit.id
                    );

                }
            );


            const editButton =
                document.createElement(
                    "button"
                );


            editButton.type =
                "button";

            editButton.className =
                "btn btn-primary";

            editButton.textContent =
                "✏️ ویرایش";


            editButton.addEventListener(
                "click",
                function() {

                    editVisit(
                        visit.id
                    );

                }
            );


            const printButton =
                document.createElement(
                    "button"
                );


            printButton.type =
                "button";

            printButton.className =
                "btn btn-gray";

            printButton.textContent =
                "🖨️ چاپ";


            printButton.addEventListener(
                "click",
                function() {

                    printVisit(
                        visit.id
                    );

                }
            );


            const deleteButton =
                document.createElement(
                    "button"
                );


            deleteButton.type =
                "button";

            deleteButton.className =
                "btn btn-danger";

            deleteButton.textContent =
                "🗑️ حذف";


            deleteButton.addEventListener(
                "click",
                function() {

                    deleteVisit(
                        visit
                    );

                }
            );


            buttons.appendChild(
                viewButton
            );

            buttons.appendChild(
                editButton
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


    if (
        visits.length > 1
    ) {

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
   مشاهده کامل گزارش
========================================================= */

function openVisitDetails(
    visitId
) {

    const visit =
        database.visits.find(
            function(item) {

                return String(
                    item.id
                ) ===
                String(
                    visitId
                );

            }
        );


    if (!visit) {

        alert(
            "گزارش پیدا نشد."
        );

        return;

    }


    const device =
        getDeviceForVisit(
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


    const details =
        document.createElement(
            "div"
        );


    details.className =
        "modal-overlay";


    details.innerHTML = `

        <div class="modal-box">

            <div class="modal-header">

                <h2>
                    📋 جزئیات گزارش
                </h2>

                <button
                    type="button"
                    class="modal-close"
                    id="closeDetailsBtn"
                >
                    ×
                </button>

            </div>


            <div class="detail-grid">

                ${detailItem(
                    "نام مرکز",
                    center?.name
                )}

                ${detailItem(
                    "استان",
                    getProvinceName(
                        center?.province
                    )
                )}

                ${detailItem(
                    "بخش",
                    center?.section
                )}

                ${detailItem(
                    "تاریخ مراجعه",
                    isoToJalali(
                        visit.visit_date
                    )
                )}

                ${detailItem(
                    "مدل دستگاه",
                    device?.model
                )}

                ${detailItem(
                    "شماره سریال",
                    device?.serial
                )}

                ${detailItem(
                    "موضوع مشکل",
                    visit.problem_subject
                )}

                ${detailItem(
                    "گزارش شده توسط",
                    visit.reported_by
                )}

                ${detailItem(
                    "تاریخ اعلام مشکل",
                    isoToJalali(
                        visit.problem_date
                    )
                )}

                ${detailItem(
                    "نام کارشناس",
                    visit.expert_name
                )}

                ${detailItem(
                    "تاریخ کارشناس",
                    ""
                )}

                ${detailItem(
                    "ساعت ورود",
                    visit.entry_time
                )}

                ${detailItem(
                    "ساعت خروج",
                    visit.exit_time
                )}

                ${detailItem(
                    "تحویل گیرنده",
                    visit.receiver_name
                )}

                ${detailItem(
                    "نام کارشناس امضا",
                    visit.expert_signature
                )}

            </div>


            <div class="detail-description">

                <h3>
                    📝 توضیحات
                </h3>

                <p>
                    ${escapeHTML(
                        visit.description ||
                        "توضیحی ثبت نشده است."
                    )}
                </p>

            </div>


            <div class="modal-actions">

                <button
                    type="button"
                    class="btn btn-primary"
                    id="modalEditBtn"
                >
                    ✏️ ویرایش
                </button>

                <button
                    type="button"
                    class="btn btn-blue"
                    id="modalPrintBtn"
                >
                    🖨️ چاپ / PDF
                </button>

            </div>

        </div>
    `;


    document.body.appendChild(
        details
    );


    getElement(
        "closeDetailsBtn"
    )?.addEventListener(
        "click",
        function() {

            details.remove();

        }
    );


    getElement(
        "modalEditBtn"
    )?.addEventListener(
        "click",
        function() {

            details.remove();

            editVisit(
                visit.id
            );

        }
    );


    getElement(
        "modalPrintBtn"
    )?.addEventListener(
        "click",
        function() {

            printVisit(
                visit.id
            );

        }
    );

}


/* =========================================================
   جزئیات HTML
========================================================= */

function detailItem(
    label,
    value
) {

    return `

        <div class="detail-item">

            <div class="detail-label">
                ${escapeHTML(label)}
            </div>

            <div class="detail-value">
                ${escapeHTML(
                    value || "-"
                )}
            </div>

        </div>

    `;

}


/* =========================================================
   ویرایش گزارش
========================================================= */

function editVisit(
    visitId
) {

    const visit =
        database.visits.find(
            function(item) {

                return String(
                    item.id
                ) ===
                String(
                    visitId
                );

            }
        );


    if (!visit) {

        alert(
            "گزارش پیدا نشد."
        );

        return;

    }


    currentVisit =
        visit;


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


    if (center) {

        currentCenter =
            center;

        currentProvince =
            center.province;

        currentProvinceName =
            getProvinceName(
                center.province
            );

    }


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


    setValue(
        "reportPageTitle",
        ""
    );


    const title =
        getElement(
            "reportPageTitle"
        );


    if (title) {

        title.textContent =
            "✏️ ویرایش گزارش";

    }


    setValue(
        "provinceName",
        currentProvinceName
    );


    setValue(
        "centerName",
        center?.name || ""
    );


    getElement(
        "centerName"
    )?.setAttribute(
        "readonly",
        "readonly"
    );


    setValue(
        "sectionName",
        center?.section || ""
    );


    setValue(
        "visitDate",
        isoToJalali(
            visit.visit_date
        )
    );


    const device =
        getDeviceForVisit(
            visit
        );


    setValue(
        "deviceModel",
        device?.model || ""
    );


    loadSerialNumbers();


    setTimeout(
        function() {

            const select =
                getElement(
                    "serialNumber"
                );


            if (select) {

                select.value =
                    device?.id || "";

            }

        },
        0
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
        getTodayJalali()
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


    showEditMode();


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================================
   ذخیره ویرایش
========================================================= */

async function updateVisit() {

    if (!currentVisit) {

        alert(
            "گزارشی برای ویرایش انتخاب نشده است."
        );

        return;

    }


    const data =
        getFormData();


    const visitDate =
        jalaliToISO(
            data.visitDate
        );


    if (!visitDate) {

        alert(
            "تاریخ مراجعه صحیح نیست."
        );

        return;

    }


    const problemDate =
        data.problemDate
            ?
            jalaliToISO(
                data.problemDate
            )
            :
            null;


    if (
        data.problemDate &&
        !problemDate
    ) {

        alert(
            "تاریخ اعلام مشکل صحیح نیست."
        );

        return;

    }


    try {

        const result =
            await supabaseClient
                .from("visits")
                .update({

                    visit_date:
                        visitDate,

                    problem_subject:
                        data.problemSubject ||
                        null,

                    reported_by:
                        data.reportedBy ||
                        null,

                    problem_date:
                        problemDate,

                    description:
                        data.description ||
                        null,

                    expert_name:
                        data.expertName ||
                        null,

                    entry_time:
                        data.entryTime ||
                        null,

                    exit_time:
                        data.exitTime ||
                        null,

                    receiver_name:
                        data.receiverName ||
                        null,

                    expert_signature:
                        data.expertSignature ||
                        null

                })
                .eq(
                    "id",
                    currentVisit.id
                )
                .select()
                .single();


        if (result.error) {

            throw new Error(
                "ویرایش ذخیره نشد:\n" +
                result.error.message
            );

        }


        const index =
            database.visits.findIndex(
                function(item) {

                    return String(
                        item.id
                    ) ===
                    String(
                        currentVisit.id
                    );

                }
            );


        if (index !== -1) {

            database.visits[index] =
                result.data;

        }


        currentVisit =
            result.data;


        alert(
            "ویرایش با موفقیت ذخیره شد."
        );


        showNormalSaveMode();

        clearVisitFields();

        setValue(
            "centerName",
            currentCenter?.name || ""
        );


        renderHistory();


    } catch (error) {

        console.error(
            error
        );

        alert(
            error.message ||
            "خطا هنگام ویرایش."
        );

    }

}


/* =========================================================
   لغو ویرایش
========================================================= */

function cancelEdit() {

    currentVisit =
        null;


    showNormalSaveMode();


    clearVisitFields();


    setValue(
        "centerName",
        currentCenter?.name || ""
    );


    renderHistory();

}


/* =========================================================
   حذف گزارش
========================================================= */

async function deleteVisit(
    visit
) {

    const confirmed =
        confirm(
            "آیا مطمئن هستید که این گزارش حذف شود؟"
        );


    if (!confirmed) {
        return;
    }


    try {

        const result =
            await supabaseClient
                .from("visits")
                .delete()
                .eq(
                    "id",
                    visit.id
                );


        if (result.error) {

            throw new Error(
                result.error.message
            );

        }


        database.visits =
            database.visits.filter(
                function(item) {

                    return String(
                        item.id
                    ) !==
                    String(
                        visit.id
                    );

                }
            );


        alert(
            "گزارش حذف شد."
        );


        renderHistory();


        renderCenters();


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
   حذف مرکز
========================================================= */

async function deleteCenter(
    center
) {

    const confirmed =
        confirm(
            "با حذف مرکز، دستگاه‌ها و گزارش‌های مربوط به آن نیز حذف می‌شوند.\n\nآیا مطمئن هستید؟"
        );


    if (!confirmed) {
        return;
    }


    try {

        const devices =
            database.devices.filter(
                function(device) {

                    return String(
                        device.center_id
                    ) ===
                    String(
                        center.id
                    );

                }
            );


        const deviceIds =
            devices.map(
                function(device) {

                    return device.id;

                }
            );


        if (
            deviceIds.length
        ) {

            const visitDelete =
                await supabaseClient
                    .from("visits")
                    .delete()
                    .in(
                        "device_id",
                        deviceIds
                    );


            if (
                visitDelete.error
            ) {

                throw new Error(
                    visitDelete.error.message
                );

            }


            const deviceDelete =
                await supabaseClient
                    .from("devices")
                    .delete()
                    .eq(
                        "center_id",
                        center.id
                    );


            if (
                deviceDelete.error
            ) {

                throw new Error(
                    deviceDelete.error.message
                );

            }

        }


        const centerDelete =
            await supabaseClient
                .from("centers")
                .delete()
                .eq(
                    "id",
                    center.id
                );


        if (
            centerDelete.error
        ) {

            throw new Error(
                centerDelete.error.message
            );

        }


        database.centers =
            database.centers.filter(
                function(item) {

                    return String(
                        item.id
                    ) !==
                    String(
                        center.id
                    );

                }
            );


        database.devices =
            database.devices.filter(
                function(device) {

                    return String(
                        device.center_id
                    ) !==
                    String(
                        center.id
                    );

                }
            );


        database.visits =
            database.visits.filter(
                function(visit) {

                    return !deviceIds.includes(
                        visit.device_id
                    );

                }
            );


        alert(
            "مرکز با موفقیت حذف شد."
        );


        renderCenters();


    } catch (error) {

        console.error(
            error
        );


        alert(
            "حذف مرکز انجام نشد:\n" +
            error.message
        );

    }

}


/* =========================================================
   چاپ گزارش
========================================================= */

function printReport() {

    if (currentVisit) {

        printVisit(
            currentVisit.id
        );

        return;

    }


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


    printFormData(
        data
    );

}


/* =========================================================
   چاپ گزارش ذخیره‌شده
========================================================= */

function printVisit(
    visitId
) {

    const visit =
        database.visits.find(
            function(item) {

                return String(
                    item.id
                ) ===
                String(
                    visitId
                );

            }
        );


    if (!visit) {

        alert(
            "گزارش پیدا نشد."
        );

        return;

    }


    const device =
        getDeviceForVisit(
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


    const data = {

        centerName:
            center?.name || "",

        section:
            center?.section || "",

        visitDate:
            isoToJalali(
                visit.visit_date
            ),

        deviceModel:
            device?.model || "",

        serialNumber:
            device?.serial || "",

        problemSubject:
            visit.problem_subject || "",

        reportedBy:
            visit.reported_by || "",

        problemDate:
            isoToJalali(
                visit.problem_date
            ),

        description:
            visit.description || "",

        expertName:
            visit.expert_name || "",

        expertDate:
            "",

        entryTime:
            visit.entry_time || "",

        exitTime:
            visit.exit_time || "",

        receiverName:
            visit.receiver_name || "",

        expertSignature:
            visit.expert_signature || ""

    };


    printFormData(
        data
    );

}


/* =========================================================
   ساخت گزارش چاپی
========================================================= */

function printFormData(
    data
) {

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
    grid-template-columns:
        repeat(3, 1fr);
}

.row-2 {
    grid-template-columns:
        repeat(2, 1fr);
}

.row-4 {
    grid-template-columns:
        repeat(4, 1fr);
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
<div class="label">تاریخ مراجعه</div>
<div class="value">
${escapeHTML(data.visitDate)}
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
${escapeHTML(data.expertSignature)}
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
   توضیحات
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
   جستجوی پیشرفته
========================================================= */

function updateAdvancedSearchPlaceholder() {

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


    if (
        type === "serial"
    ) {

        input.placeholder =
            "شماره سریال ربات را وارد کنید...";

    } else {

        input.placeholder =
            "نام مرکز را وارد کنید...";

    }

}


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


    const results =
        getElement(
            "advancedSearchResults"
        );


    if (!results) {
        return;
    }


    results.innerHTML = "";


    if (!query) {

        results.innerHTML =
            "<p class='empty-message'>عبارت جستجو را وارد کنید.</p>";

        return;

    }


    const loaded =
        await loadDatabase();


    if (!loaded) {
        return;
    }


    let foundCenters = [];


    if (
        type === "center"
    ) {

        foundCenters =
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

    } else {

        const matchingDevices =
            database.devices.filter(
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


        const centerIds =
            matchingDevices.map(
                function(device) {

                    return String(
                        device.center_id
                    );

                }
            );


        foundCenters =
            database.centers.filter(
                function(center) {

                    return centerIds.includes(
                        String(
                            center.id
                        )
                    );

                }
            );

    }


    if (!foundCenters.length) {

        results.innerHTML =
            "<p class='empty-message'>نتیجه‌ای پیدا نشد.</p>";

        return;

    }


    foundCenters.forEach(
        function(center) {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "search-result-item";


            const title =
                document.createElement(
                    "h3"
                );


            title.textContent =
                "🏥 " +
                center.name;


            const province =
                document.createElement(
                    "p"
                );


            province.textContent =
                "استان: " +
                getProvinceName(
                    center.province
                );


            item.appendChild(
                title
            );


            item.appendChild(
                province
            );


            if (
                type === "serial"
            ) {

                const devices =
                    database.devices.filter(
                        function(device) {

                            return (
                                String(
                                    device.center_id
                                ) ===
                                String(
                                    center.id
                                ) &&
                                String(
                                    device.serial || ""
                                )
                                    .toLowerCase()
                                    .includes(
                                        query
                                    )
                            );

                        }
                    );


                devices.forEach(
                    function(device) {

                        const serial =
                            document.createElement(
                                "p"
                            );


                        serial.textContent =
                            "🤖 " +
                            device.model +
                            " — سریال: " +
                            device.serial;


                        item.appendChild(
                            serial
                        );

                    }
                );

            }


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

                    currentProvince =
                        center.province;

                    currentProvinceName =
                        getProvinceName(
                            center.province
                        );


                    openExistingCenter(
                        center
                    );

                }
            );


            item.appendChild(
                button
            );


            results.appendChild(
                item
            );

        }
    );

}


function clearAdvancedSearch() {

    setValue(
        "advancedSearchInput",
        ""
    );


    const results =
        getElement(
            "advancedSearchResults"
        );


    if (results) {

        results.innerHTML = "";

    }

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
    async function() {

        console.log(
            "Site loaded"
        );


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
                    event.key ===
                    "Enter"
                ) {

                    checkLogin();

                }

            }
        );


        /* استان */

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

                currentVisit =
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


                currentVisit =
                    null;


                showNormalSaveMode();


                renderCenters();

            }
        );


        /* جستجوی مرکز */

        getElement(
            "centerSearch"
        )?.addEventListener(
            "input",
            renderCenters
        );


        /* مدل */

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


        /* ویرایش */

        getElement(
            "updateVisitBtn"
        )?.addEventListener(
            "click",
            updateVisit
        );


        /* لغو ویرایش */

        getElement(
            "cancelEditBtn"
        )?.addEventListener(
            "click",
            cancelEdit
        );


        /* چاپ */

        getElement(
            "printReportBtn"
        )?.addEventListener(
            "click",
            printReport
        );


        /* جستجوی پیشرفته */

        getElement(
            "advancedSearchType"
        )?.addEventListener(
            "change",
            updateAdvancedSearchPlaceholder
        );


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
                    event.key ===
                    "Enter"
                ) {

                    advancedSearch();

                }

            }
        );


        getElement(
            "clearAdvancedSearchBtn"
        )?.addEventListener(
            "click",
            clearAdvancedSearch
        );


        updateAdvancedSearchPlaceholder();


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
