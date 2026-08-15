/* =========================================================
   مدیریت مراکز و گزارش کار
   Supabase
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
   اتصال Supabase
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
let currentCenter = null;
let showAllHistory = false;


/* =========================================================
   DOM
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
   تاریخ
========================================================= */

function getTodayISO() {

    const now = new Date();

    const year =
        now.getFullYear();

    const month =
        String(
            now.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            now.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;

}


function setDefaultDates() {

    const today =
        getTodayISO();

    const ids = [
        "visitDate",
        "problemDate",
        "expertDate"
    ];

    ids.forEach(function(id) {

        const element =
            getElement(id);

        if (
            element &&
            !element.value
        ) {
            element.value = today;
        }

    });

}


/* =========================================================
   آماده‌سازی Supabase
========================================================= */

function initSupabase() {

    if (
        !window.supabase ||
        typeof window.supabase.createClient !==
        "function"
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


    const passwordInput =
        getElement(
            "passwordInput"
        );


    const password =
        passwordInput
            ? passwordInput.value
            : "";


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
   دریافت دیتابیس
========================================================= */

async function loadDatabase() {

    if (!supabaseClient) {

        if (!initSupabase()) {

            alert(
                "کتابخانه Supabase بارگذاری نشده است."
            );

            return {
                centers: []
            };

        }

    }


    try {

        const result =
            await supabaseClient
                .from("centers")
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending: true
                    }
                );


        if (result.error) {

            console.error(
                "Supabase load error:",
                result.error
            );


            alert(
                "خطا در دریافت اطلاعات:\n" +
                result.error.message
            );


            return {
                centers: []
            };

        }


        database = {

            centers:
                (result.data || [])
                    .map(
                        function(row) {

                            return {

                                id:
                                    row.id,

                                province:
                                    row.province,

                                name:
                                    row.name,

                                visits:
                                    Array.isArray(
                                        row.visits
                                    )
                                        ?
                                        row.visits
                                        :
                                        []

                            };

                        }
                    )

        };


        return database;


    } catch (error) {

        console.error(
            error
        );


        alert(
            "ارتباط با پایگاه داده برقرار نشد."
        );


        return {
            centers: []
        };

    }

}


/* =========================================================
   ذخیره مرکز
========================================================= */

async function saveCenterToSupabase(
    center
) {

    if (!supabaseClient) {

        if (!initSupabase()) {
            return false;
        }

    }


    try {

        const result =
            await supabaseClient
                .from("centers")
                .upsert(
                    {

                        id:
                            center.id,

                        province:
                            center.province,

                        name:
                            center.name,

                        visits:
                            center.visits || []

                    },
                    {
                        onConflict: "id"
                    }
                );


        if (result.error) {

            console.error(
                "Supabase save error:",
                result.error
            );


            alert(
                "ذخیره اطلاعات انجام نشد:\n" +
                result.error.message
            );


            return false;

        }


        return true;


    } catch (error) {

        console.error(
            error
        );


        alert(
            "خطا هنگام ذخیره اطلاعات."
        );


        return false;

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
            "مراکز " + name;

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

            const visits =
                center.visits || [];


            count.textContent =
                visits.length
                    ?
                    "تعداد مراجعات: " +
                    visits.length
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


            box.appendChild(title);
            box.appendChild(count);
            box.appendChild(button);

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


    const freshCenter =
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


    currentCenter =
        freshCenter || center;


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
   پاک کردن فرم مراجعه
========================================================= */

function clearVisitFields() {

    setValue(
        "sectionName",
        ""
    );


    setValue(
        "visitDate",
        getTodayISO()
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
        getTodayISO()
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
        getTodayISO()
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


    const visits =
        currentCenter.visits || [];


    const result = [];


    visits.forEach(
        function(visit) {

            if (
                visit.deviceModel === model &&
                visit.serialNumber
            ) {

                if (
                    !result.includes(
                        visit.serialNumber
                    )
                ) {

                    result.push(
                        visit.serialNumber
                    );

                }

            }

        }
    );


    return result;

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
   فرم
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
   ذخیره
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


    if (!currentCenter) {

        await loadDatabase();


        currentCenter =
            database.centers.find(
                function(center) {

                    return (
                        center.province ===
                        currentProvince &&
                        String(
                            center.name
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


        if (!currentCenter) {

            currentCenter = {

                id:
                    crypto.randomUUID
                    ?
                    crypto.randomUUID()
                    :
                    String(Date.now()),

                province:
                    currentProvince,

                name:
                    data.centerName,

                visits:
                    []

            };


            database.centers.push(
                currentCenter
            );

        }

    }


    currentCenter.name =
        data.centerName;

    currentCenter.province =
        currentProvince;


    if (
        !Array.isArray(
            currentCenter.visits
        )
    ) {

        currentCenter.visits = [];

    }


    const visit = {

        id:
            crypto.randomUUID
            ?
            crypto.randomUUID()
            :
            String(Date.now()),

        savedAt:
            new Date().toISOString(),

        ...data

    };


    currentCenter.visits.unshift(
        visit
    );


    const saved =
        await saveCenterToSupabase(
            currentCenter
        );


    if (!saved) {

        currentCenter.visits.shift();

        return;

    }


    const centerId =
        currentCenter.id;


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


    loadSerialNumbers();


    showAllHistory =
        false;


    renderHistory();


    alert(
        "گزارش با موفقیت ذخیره شد."
    );

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
            visits.slice(0, 1);


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
                    (
                        visit.date ||
                        "بدون تاریخ"
                    )
                    :
                    "آخرین مراجعه — " +
                    (
                        visit.date ||
                        "بدون تاریخ"
                    );


            box.appendChild(title);


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


            box.appendChild(info);


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
   متن توضیحات
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
    async function() {

        console.log(
            "Site loaded"
        );


        /*
           Supabase
        */

        initSupabase();


        /*
           ورود
        */

        const loginBtn =
            getElement(
                "loginBtn"
            );


        if (loginBtn) {

            loginBtn.addEventListener(
                "click",
                checkLogin
            );

        }


        const passwordInput =
            getElement(
                "passwordInput"
            );


        if (passwordInput) {

            passwordInput.addEventListener(
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

        }


        /*
           وضعیت قفل
        */

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
           مدل
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
           تاریخ پیشفرض
        */

        setDefaultDates();


        /*
           فعلاً اطلاعات را فقط بعد از
           ورود/انتخاب استان می‌خوانیم.
           این کار باعث می‌شود صفحه ورود
           حتی اگر Supabase خطا داشته باشد
           باز هم کار کند.
        */

    }
);
