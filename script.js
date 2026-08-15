/* =========================================================
   مدیریت مراکز و گزارش کار
   Supabase - نسخه جدید
========================================================= */

const SUPABASE_URL =
    "https://nqfykfoxdcfgocfvcwxv.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_oLvZjzdOpAdErVP1sjPtzw_X5CGceRk";

const PASSWORD = "0111";

const MAX_ATTEMPTS = 3;

const LOCK_TIME = 30 * 60 * 1000;


let supabaseClient = null;

let database = {
    centers: [],
    devices: [],
    visits: []
};

let currentProvince = "";

let currentCenter = null;

let currentVisits = [];

let showAllHistory = false;


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
   ابزار DOM
========================================================= */

function getElement(id) {
    return document.getElementById(id);
}


function setValue(id, value) {

    const el = getElement(id);

    if (el) {
        el.value = value ?? "";
    }

}


function getValue(id) {

    const el = getElement(id);

    if (!el) {
        return "";
    }

    return String(el.value || "").trim();
}


/* =========================================================
   اتصال Supabase
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
   اعداد فارسی / انگلیسی
========================================================= */

function toEnglishDigits(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/[۰-۹]/g, function(d) {
            return String(
                "۰۱۲۳۴۵۶۷۸۹".indexOf(d)
            );
        })
        .replace(/[٠-٩]/g, function(d) {
            return String(
                "٠١٢٣٤٥٦٧٨٩".indexOf(d)
            );
        });
}


function toPersianDigits(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value).replace(
        /\d/g,
        function(d) {
            return "۰۱۲۳۴۵۶۷۸۹"[Number(d)];
        }
    );
}


/* =========================================================
   تاریخ میلادی ← شمسی
========================================================= */

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

        jy += Math.floor(
            (days - 1) / 365
        );

        days =
            (days - 1) % 365;
    }

    const jm =
        days < 186
            ?
            1 +
            Math.floor(
                days / 31
            )
            :
            7 +
            Math.floor(
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


function gregorianDateToJalali(
    dateString
) {

    if (!dateString) {
        return "";
    }

    const parts =
        String(dateString).split("-");

    if (parts.length !== 3) {
        return dateString;
    }

    const gy = Number(parts[0]);
    const gm = Number(parts[1]);
    const gd = Number(parts[2]);

    if (
        !gy ||
        !gm ||
        !gd
    ) {
        return dateString;
    }

    const result =
        gregorianToJalali(
            gy,
            gm,
            gd
        );

    return toPersianDigits(
        result[0] +
        "/" +
        String(result[1]).padStart(2, "0") +
        "/" +
        String(result[2]).padStart(2, "0")
    );
}


/* =========================================================
   تاریخ شمسی ← میلادی
========================================================= */

function jalaliToGregorian(
    jy,
    jm,
    jd
) {

    jy = Number(jy);
    jm = Number(jm);
    jd = Number(jd);

    jy -= 979;

    let days =
        365 * jy +
        Math.floor(jy / 33) * 8 +
        Math.floor(
            ((jy % 33) + 3) / 4
        );

    if (jm < 7) {
        days += (jm - 1) * 31;
    } else {
        days +=
            (jm - 7) * 30 +
            186;
    }

    days +=
        jd - 1;

    let gy =
        1600 +
        400 *
        Math.floor(
            days / 146097
        );

    days %= 146097;

    let leap = true;

    if (days >= 36525) {

        days--;

        gy +=
            100 *
            Math.floor(
                days / 36524
            );

        days %=
            36524;

        if (days >= 365) {
            days++;
        } else {
            leap = false;
        }

    }

    gy +=
        4 *
        Math.floor(
            days / 1461
        );

    days %= 1461;

    if (days >= 366) {

        leap = false;

        days--;

        gy +=
            Math.floor(
                days / 365
            );

        days %= 365;

    }

    const sal_a = [
        0,
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

    let gm;

    for (
        gm = 1;
        gm <= 12 &&
        days >= sal_a[gm];
        gm++
    ) {
        days -= sal_a[gm];
    }

    const gd =
        days + 1;

    return [
        gy,
        gm,
        gd
    ];
}


function jalaliDateToGregorian(
    value
) {

    value =
        toEnglishDigits(
            value
        ).trim();


    if (!value) {
        return "";
    }


    const parts =
        value.split(/[\/\-\.]/);


    if (parts.length !== 3) {
        return "";
    }


    const jy = Number(parts[0]);
    const jm = Number(parts[1]);
    const jd = Number(parts[2]);


    if (
        jy < 1200 ||
        jy > 1600 ||
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


/* =========================================================
   امروز شمسی
========================================================= */

function getTodayJalali() {

    const now = new Date();

    return gregorianDateToJalali(
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


function setDefaultDates() {

    const today =
        getTodayJalali();

    [
        "visitDate",
        "problemDate",
        "expertDate"
    ].forEach(function(id) {

        const el =
            getElement(id);

        if (
            el &&
            !el.value
        ) {
            el.value = today;
        }

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
                        "created_at",
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
            "Database load error:",
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
   استان
========================================================= */

async function openProvince(
    key,
    name
) {

    currentProvince =
        key;

    currentCenter =
        null;

    currentVisits =
        [];

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
            "مراکز " + name;
    }


    renderCenters();

}


/* =========================================================
   مراکز
========================================================= */

function getCenterVisits(
    centerId
) {

    return database.visits.filter(
        function(visit) {

            return String(
                visit.center_id
            ) ===
            String(
                centerId
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
                        .includes(query);

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


            const visits =
                getCenterVisits(
                    center.id
                );


            const count =
                document.createElement(
                    "p"
                );


            count.textContent =
                visits.length
                    ?
                    "تعداد مراجعات: " +
                    visits.length
                    :
                    "هنوز گزارشی ثبت نشده";


            const openButton =
                document.createElement(
                    "button"
                );

            openButton.type =
                "button";

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
            box.appendChild(openButton);
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

    currentVisits =
        [];

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


    renderHistory();

}


/* =========================================================
   مرکز موجود
========================================================= */

async function openExistingCenter(
    center
) {

    currentCenter =
        center;


    currentVisits =
        getCenterVisits(
            center.id
        );


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
            center.name;
    }


    const nameInput =
        getElement(
            "centerName"
        );


    if (nameInput) {

        nameInput.value =
            center.name || "";

        nameInput.setAttribute(
            "readonly",
            "readonly"
        );

    }


    setValue(
        "sectionName",
        center.section || ""
    );


    clearVisitFields();


    setValue(
        "centerName",
        center.name || ""
    );


    setValue(
        "sectionName",
        center.section || ""
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


    return database.devices
        .filter(
            function(device) {

                return (
                    String(
                        device.center_id
                    ) ===
                    String(
                        currentCenter.id
                    ) &&
                    device.model === model
                );

            }
        )
        .map(
            function(device) {
                return device.serial;
            }
        )
        .filter(Boolean);

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


    const serials =
        getCenterSerials(
            model
        );


    [...new Set(serials)].forEach(
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
            getValue("centerName"),

        section:
            getValue("sectionName"),

        date:
            getValue("visitDate"),

        problemSubject:
            getValue("problemSubject"),

        reportedBy:
            getValue("reportedBy"),

        problemDate:
            getValue("problemDate"),

        deviceModel:
            getValue("deviceModel"),

        serialNumber:
            getSelectedSerial(),

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
   ذخیره مرکز
========================================================= */

async function saveCenter(
    data
) {

    if (!supabaseClient) {
        initSupabase();
    }


    if (currentCenter) {

        const result =
            await supabaseClient
                .from("centers")
                .update({

                    name:
                        data.centerName,

                    section:
                        data.section

                })
                .eq(
                    "id",
                    currentCenter.id
                );


        if (result.error) {
            throw result.error;
        }


        return currentCenter.id;
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
                    data.section

            })
            .select()
            .single();


    if (result.error) {
        throw result.error;
    }


    currentCenter =
        result.data;


    return result.data.id;
}


/* =========================================================
   ذخیره دستگاه
========================================================= */

async function saveDevice(
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
                    String(centerId) &&
                    device.model === model &&
                    device.serial === serial
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
        throw result.error;
    }


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
            "نام مرکز را وارد کنید."
        );

        return;
    }


    if (!data.date) {

        alert(
            "تاریخ مراجعه را وارد کنید."
        );

        return;
    }


    const visitDate =
        jalaliDateToGregorian(
            data.date
        );


    if (!visitDate) {

        alert(
            "تاریخ مراجعه صحیح نیست.\nمثال: ۱۴۰۵/۰۵/۲۴"
        );

        return;
    }


    const problemDate =
        data.problemDate
            ?
            jalaliDateToGregorian(
                data.problemDate
            )
            :
            null;


    const expertDate =
        data.expertDate
            ?
            jalaliDateToGregorian(
                data.expertDate
            )
            :
            null;


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


    const saveButton =
        getElement(
            "saveVisitBtn"
        );


    if (saveButton) {

        saveButton.disabled = true;

        saveButton.textContent =
            "⏳ در حال ذخیره...";

    }


    try {

        /*
           1. مرکز
        */

        const centerId =
            await saveCenter(
                data
            );


        /*
           2. دستگاه
        */

        const device =
            await saveDevice(
                centerId,
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
                        centerId,

                    device_id:
                        device.id,

                    visit_date:
                        visitDate,

                    problem_subject:
                        data.problemSubject,

                    reported_by:
                        data.reportedBy,

                    problem_date:
                        problemDate,

                    description:
                        data.description,

                    expert_name:
                        data.expertName,

                    entry_time:
                        data.entryTime || null,

                    exit_time:
                        data.exitTime || null,

                    receiver_name:
                        data.receiverName,

                    expert_signature:
                        data.signatureExpertName

                })
                .select()
                .single();


        if (result.error) {
            throw result.error;
        }


        alert(
            "✅ گزارش با موفقیت ذخیره شد."
        );


        await loadDatabase();


        currentCenter =
            database.centers.find(
                function(center) {

                    return String(
                        center.id
                    ) ===
                    String(
                        centerId
                    );

                }
            );


        currentVisits =
            getCenterVisits(
                centerId
            );


        clearVisitFields();

        loadSerialNumbers();

        renderHistory();


    } catch (error) {

        console.error(
            "SAVE ERROR:",
            error
        );


        alert(
            "❌ ذخیره اطلاعات انجام نشد:\n\n" +
            error.message
        );

    } finally {

        if (saveButton) {

            saveButton.disabled = false;

            saveButton.textContent =
                "💾 ذخیره گزارش";

        }

    }

}


/* =========================================================
   حذف گزارش
========================================================= */

async function deleteVisit(
    visit
) {

    const confirmed =
        confirm(
            "آیا از حذف این گزارش مطمئن هستید؟\n\n" +
            "این عملیات قابل برگشت نیست."
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
            throw result.error;
        }


        await loadDatabase();


        currentVisits =
            getCenterVisits(
                currentCenter.id
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

    const visits =
        getCenterVisits(
            center.id
        );


    const confirmed =
        confirm(
            "⚠️ حذف مرکز\n\n" +
            "مرکز «" +
            center.name +
            "» حذف خواهد شد.\n\n" +
            "تمام دستگاه‌ها و گزارش‌های این مرکز نیز حذف می‌شوند.\n\n" +
            "آیا مطمئن هستید؟"
        );


    if (!confirmed) {
        return;
    }


    try {

        /*
           اول گزارش‌ها
        */

        const visitsResult =
            await supabaseClient
                .from("visits")
                .delete()
                .eq(
                    "center_id",
                    center.id
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
                    center.id
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
                    center.id
                );


        if (centerResult.error) {
            throw centerResult.error;
        }


        await loadDatabase();


        renderCenters();


        alert(
            "مرکز و اطلاعات مربوط به آن حذف شد."
        );


    } catch (error) {

        console.error(
            error
        );


        alert(
            "❌ حذف مرکز انجام نشد:\n\n" +
            error.message
        );

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
            "<p class='empty-message'>" +
            "هنوز گزارشی ثبت نشده است." +
            "</p>";

        return;
    }


    const visits =
        currentVisits;


    if (!visits.length) {

        history.innerHTML =
            "<p class='empty-message'>" +
            "هنوز گزارشی برای این مرکز ثبت نشده است." +
            "</p>";

        return;
    }


    const visibleVisits =
        showAllHistory
            ?
            visits
            :
            visits.slice(0, 1);


    visibleVisits.forEach(
        function(visit, index) {

            const box =
                document.createElement(
                    "div"
                );


            box.className =
                "history-item";


            const device =
                database.devices.find(
                    function(item) {

                        return String(
                            item.id
                        ) ===
                        String(
                            visit.device_id
                        );

                    }
                );


            const title =
                document.createElement(
                    "h3"
                );


            title.textContent =
                showAllHistory
                    ?
                    "گزارش " +
                    (index + 1)
                    :
                    "آخرین مراجعه";


            box.appendChild(title);


            const date =
                document.createElement(
                    "p"
                );


            date.innerHTML =
                "<strong>📅 تاریخ:</strong> " +
                escapeHTML(
                    gregorianDateToJalali(
                        visit.visit_date
                    )
                );


            box.appendChild(date);


            const deviceInfo =
                document.createElement(
                    "p"
                );


            deviceInfo.innerHTML =
                "<strong>🤖 دستگاه:</strong> " +
                escapeHTML(
                    device?.model || "-"
                ) +
                " &nbsp; | &nbsp; " +
                "<strong>سریال:</strong> " +
                escapeHTML(
                    device?.serial || "-"
                );


            box.appendChild(
                deviceInfo
            );


            if (
                visit.problem_subject
            ) {

                const subject =
                    document.createElement(
                        "p"
                    );


                subject.innerHTML =
                    "<strong>موضوع مشکل:</strong> " +
                    escapeHTML(
                        visit.problem_subject
                    );


                box.appendChild(
                    subject
                );

            }


            const buttons =
                document.createElement(
                    "div"
                );


            buttons.className =
                "history-actions";


            /*
               مشاهده / چاپ
            */

            const viewButton =
                document.createElement(
                    "button"
                );


            viewButton.type =
                "button";

            viewButton.className =
                "btn btn-blue";

            viewButton.textContent =
                "👁️ مشاهده / چاپ";


            viewButton.addEventListener(
                "click",
                function() {

                    openVisitReport(
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


            deleteButton.type =
                "button";

            deleteButton.className =
                "btn btn-danger";

            deleteButton.textContent =
                "🗑️ حذف گزارش";


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


        moreButton.type =
            "button";

        moreButton.className =
            "btn btn-gray history-more";


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
   باز کردن گزارش کامل
========================================================= */

function openVisitReport(
    visit
) {

    const device =
        database.devices.find(
            function(item) {

                return String(
                    item.id
                ) ===
                String(
                    visit.device_id
                );

            }
        );


    const data = {

        centerName:
            currentCenter?.name || "",

        section:
            currentCenter?.section || "",

        date:
            gregorianDateToJalali(
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
            gregorianDateToJalali(
                visit.problem_date
            ),

        description:
            visit.description || "",

        expertName:
            visit.expert_name || "",

        expertDate:
            gregorianDateToJalali(
                visit.visit_date
            ),

        entryTime:
            visit.entry_time || "",

        exitTime:
            visit.exit_time || "",

        receiverName:
            visit.receiver_name || "",

        signatureExpertName:
            visit.expert_signature || ""

    };


    printReport(
        data
    );

}


/* =========================================================
   گزارش چاپی
========================================================= */

function makeDescription(
    description
) {

    return (
        "با مراجعه به مرکز و بررسی ربات،\n\n" +
        (description || "") +
        "\n\n" +
        "ربات تست و تحویل مسئول مربوطه گردید."
    );

}


function printReport(
    customData = null
) {

    const data =
        customData ||
        getFormData();


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

<html lang="fa" dir="rtl">

<head>

<meta charset="UTF-8">

<title>گزارش کار</title>

<style>

@page {
    size: A4;
    margin: 12mm;
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
    background: #eee;
    border-bottom: 1px solid #333;
    padding: 7px;
    font-weight: bold;
}

.value {
    padding: 9px;
    min-height: 28px;
    white-space: pre-wrap;
}

.description-section {
    border: 1px solid #333;
    margin-top: 10px;
    margin-bottom: 18px;
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
    min-height: 180px;
    padding: 15px;
}

.signatures {
    display: flex;
    justify-content: space-between;
    margin-top: 60px;
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


        getElement(
            "newCenterBtn"
        )?.addEventListener(
            "click",
            createNewCenter
        );


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


        getElement(
            "centerSearch"
        )?.addEventListener(
            "input",
            renderCenters
        );


        getElement(
            "deviceModel"
        )?.addEventListener(
            "change",
            loadSerialNumbers
        );


        getElement(
            "newSerialBtn"
        )?.addEventListener(
            "click",
            toggleNewSerial
        );


        getElement(
            "saveVisitBtn"
        )?.addEventListener(
            "click",
            saveVisit
        );


        getElement(
            "printReportBtn"
        )?.addEventListener(
            "click",
            function() {

                printReport();

            }
        );


        setDefaultDates();

    }
);
