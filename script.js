/* =========================================================
   مدیریت مراکز و گزارش کار
========================================================= */


/* ================= تنظیمات ================= */

const PASSWORD = "0111";

const LOCK_LIMIT = 3;

const LOCK_TIME = 30 * 60 * 1000;

const STORAGE_KEY = "center_management_data_v2";

const SECURITY_KEY = "center_management_security_v2";


/* ================= استان‌ها =================
   تهران عمداً اول قرار گرفته
========================================================= */

const provinces = [

    ["tehran", "تهران"],
    ["alborz", "البرز"],
    ["isfahan", "اصفهان"],
    ["fars", "فارس"],
    ["khorasan-razavi", "خراسان رضوی"],
    ["east-azerbaijan", "آذربایجان شرقی"],
    ["west-azerbaijan", "آذربایجان غربی"],
    ["ardabil", "اردبیل"],
    ["bushehr", "بوشهر"],
    ["chaharmahal", "چهارمحال و بختیاری"],
    ["south-khorasan", "خراسان جنوبی"],
    ["north-khorasan", "خراسان شمالی"],
    ["khuzestan", "خوزستان"],
    ["zanjan", "زنجان"],
    ["semnan", "سمنان"],
    ["sistan", "سیستان و بلوچستان"],
    ["qazvin", "قزوین"],
    ["qom", "قم"],
    ["kurdistan", "کردستان"],
    ["kerman", "کرمان"],
    ["kermanshah", "کرمانشاه"],
    ["kohgiluyeh", "کهگیلویه و بویراحمد"],
    ["golestan", "گلستان"],
    ["gilan", "گیلان"],
    ["lorestan", "لرستان"],
    ["mazandaran", "مازندران"],
    ["markazi", "مرکزی"],
    ["hormozgan", "هرمزگان"],
    ["hamadan", "همدان"],
    ["yazd", "یزد"],
    ["ilam", "ایلام"]
];


/* ================= کارهای ثابت ================= */

const CHECKLIST = [

    "بررسی سیستم",

    "نصب ویندوز",

    "نصب نرم‌افزارهای موردنیاز",

    "کالیبره ربات",

    "تعمیر بازو",

    "تعویض رکوردر",

    "تعویض کارتریج",

    "تعویض هد پرینت",

    "تعویض کریر",

    "تست ربات",

    "تست رایت",

    "تست نهایی"

];


/* ================= وضعیت ================= */

let database =
    JSON.parse(
        localStorage.getItem(STORAGE_KEY)
    ) || {
        centers: []
    };


let currentProvince = "";

let currentCenter = null;

let currentRobot = "";


/* =========================================================
   ابزارهای عمومی
========================================================= */

function saveDatabase() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(database)
    );

}


function escapeHTML(value) {

    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function get(id) {

    return document.getElementById(id);

}


/* =========================================================
   سیستم رمز
========================================================= */

function getSecurity() {

    let security =
        JSON.parse(
            localStorage.getItem(SECURITY_KEY)
        );

    if (!security) {

        security = {
            attempts: 0,
            lockedUntil: 0
        };

    }

    return security;

}


function saveSecurity(security) {

    localStorage.setItem(
        SECURITY_KEY,
        JSON.stringify(security)
    );

}


function isLocked() {

    const security =
        getSecurity();

    if (
        security.lockedUntil &&
        Date.now() < security.lockedUntil
    ) {

        return true;

    }

    if (
        security.lockedUntil &&
        Date.now() >= security.lockedUntil
    ) {

        security.attempts = 0;
        security.lockedUntil = 0;

        saveSecurity(security);

    }

    return false;

}


function updateLockMessage() {

    const message =
        get("loginMessage");

    if (!message) {
        return;
    }

    const security =
        getSecurity();

    if (
        security.lockedUntil &&
        Date.now() < security.lockedUntil
    ) {

        const remaining =
            security.lockedUntil -
            Date.now();

        const minutes =
            Math.ceil(
                remaining / 60000
            );

        message.textContent =
            "🔒 سایت قفل است. " +
            minutes +
            " دقیقه دیگر دوباره تلاش کنید.";

        return;

    }

    message.textContent = "";

}


function login() {

    const input =
        get("passwordInput");

    const message =
        get("loginMessage");

    if (isLocked()) {

        updateLockMessage();

        return;

    }


    const password =
        input.value;


    if (
        password === PASSWORD
    ) {

        const security = {
            attempts: 0,
            lockedUntil: 0
        };

        saveSecurity(security);

        sessionStorage.setItem(
            "center_logged_in",
            "1"
        );

        input.value = "";

        message.textContent = "";

        showApp();

        return;

    }


    const security =
        getSecurity();

    security.attempts++;

    
    if (
        security.attempts >= LOCK_LIMIT
    ) {

        security.lockedUntil =
            Date.now() +
            LOCK_TIME;

        saveSecurity(security);

        updateLockMessage();

        input.value = "";

        return;

    }


    saveSecurity(security);

    const left =
        LOCK_LIMIT -
        security.attempts;

    message.textContent =
        "❌ رمز اشتباه است. " +
        left +
        " تلاش دیگر باقی مانده.";

    input.value = "";

}


function showApp() {

    get("loginPage")
        .classList.add("hidden");

    get("app")
        .classList.remove("hidden");

    renderProvinces();

}


function logout() {

    sessionStorage.removeItem(
        "center_logged_in"
    );

    get("app")
        .classList.add("hidden");

    get("loginPage")
        .classList.remove("hidden");

}


/* =========================================================
   استان‌ها
========================================================= */

function renderProvinces() {

    const grid =
        get("provinceGrid");

    grid.innerHTML = "";

    provinces.forEach(
        function(province) {

            const button =
                document.createElement("button");

            button.type = "button";

            button.className =
                "province-card";

            button.textContent =
                province[1];

            button.dataset.province =
                province[0];

            button.addEventListener(
                "click",
                function() {

                    openProvince(
                        province[0],
                        province[1]
                    );

                }
            );

            grid.appendChild(button);

        }
    );

}


function openProvince(
    key,
    name
) {

    currentProvince = key;

    currentCenter = null;

    currentRobot = "";

    get("provincePage")
        .classList.add("hidden");

    get("centerPage")
        .classList.add("hidden");

    get("centersPage")
        .classList.remove("hidden");

    get("provinceTitle")
        .textContent =
        "مراکز " + name;

    get("centerSearch").value = "";

    renderCenters();

}


/* =========================================================
   مراکز
========================================================= */

function renderCenters() {

    const grid =
        get("centersGrid");

    const empty =
        get("emptyCenters");

    grid.innerHTML = "";

    const query =
        get("centerSearch")
            .value
            .trim()
            .toLowerCase();


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

                    return center.name
                        .toLowerCase()
                        .includes(query);

                }
            );

    }


    if (!centers.length) {

        empty.classList.remove("hidden");

        empty.textContent =
            query
                ? "مرکزی با این نام پیدا نشد."
                : "هنوز مرکزی برای این استان ثبت نشده است.";

        return;

    }


    empty.classList.add("hidden");


    centers.forEach(
        function(center) {

            const box =
                document.createElement("div");

            box.className =
                "center-box";

            box.innerHTML = `

                <div class="center-icon">
                    🏥
                </div>

                <h3>
                    ${escapeHTML(center.name)}
                </h3>

                <p>
                    مسئول:
                    ${escapeHTML(
                        center.manager ||
                        "ثبت نشده"
                    )}
                </p>

                <button
                    type="button"
                    class="btn btn-blue"
                >
                    باز کردن مرکز
                </button>
            `;


            box.querySelector("button")
                .addEventListener(
                    "click",
                    function() {

                        openCenter(center);

                    }
                );


            grid.appendChild(box);

        }
    );

}


/* =========================================================
   مرکز جدید
========================================================= */

function newCenter() {

    currentCenter = null;

    currentRobot = "";

    get("centersPage")
        .classList.add("hidden");

    get("centerPage")
        .classList.remove("hidden");

    get("centerPageTitle")
        .textContent =
        "ثبت مرکز جدید";

    clearForm();

    renderChecklist();

}


/* =========================================================
   باز کردن مرکز موجود
========================================================= */

function openCenter(center) {

    currentCenter = center;

    currentRobot = "";

    get("centersPage")
        .classList.add("hidden");

    get("centerPage")
        .classList.remove("hidden");


    get("centerPageTitle")
        .textContent =
        center.name;


    /*
       اطلاعات ثابت مرکز
    */

    get("centerName").value =
        center.name || "";

    get("centerPhone").value =
        center.phone || "";

    get("centerManager").value =
        center.manager || "";


    /*
       اطلاعات ربات ذخیره‌شده
    */

    if (
        center.robot &&
        center.robot.model
    ) {

        currentRobot =
            center.robot.model;

        get("robotModel").value =
            center.robot.model;

        get("robotSerial").value =
            center.robot.serial || "";

        selectRobotVisual(
            center.robot.model
        );

        updateLabel();

    } else {

        get("robotModel").value = "";

        get("robotSerial").value = "";

        updateLabel();

    }


    /*
       گزارش مراجعه جدید خالی باشد
    */

    get("extraWork").value = "";

    renderChecklist();

    renderHistory();

}


/* =========================================================
   پاک کردن فرم مرکز جدید
========================================================= */

function clearForm() {

    get("centerName").value = "";

    get("centerPhone").value = "";

    get("centerManager").value = "";

    get("robotModel").value = "";

    get("robotSerial").value = "";

    get("extraWork").value = "";

    get("labelSection")
        .classList.add("hidden");


    document
        .querySelectorAll(".robot-card")
        .forEach(
            function(card) {

                card.classList.remove(
                    "selected"
                );

            }
        );

}


/* =========================================================
   انتخاب ربات
========================================================= */

function selectRobot(robot) {

    currentRobot = robot;

    get("robotModel").value =
        robot;


    document
        .querySelectorAll(".robot-card")
        .forEach(
            function(card) {

                card.classList.remove(
                    "selected"
                );

            }
        );


    selectRobotVisual(robot);


    /*
       اگر اطلاعات ربات قبلاً ذخیره شده،
       دوباره نمایش داده شود.
    */

    if (
        currentCenter &&
        currentCenter.robot &&
        currentCenter.robot.model === robot
    ) {

        get("robotSerial").value =
            currentCenter.robot.serial || "";

    } else {

        get("robotSerial").value = "";

    }


    updateLabel();

    renderChecklist();

}


function selectRobotVisual(robot) {

    const card =
        document.querySelector(
            `.robot-card[data-robot="${CSS.escape(robot)}"]`
        );

    if (card) {

        card.classList.add(
            "selected"
        );

    }

}


/* =========================================================
   لینک لیبل
========================================================= */

function updateLabel() {

    const serial =
        get("robotSerial")
            .value
            .trim();

    const section =
        get("labelSection");

    const text =
        get("labelText");

    const link =
        get("labelDownload");


    if (!serial) {

        section.classList.add(
            "hidden"
        );

        return;

    }


    section.classList.remove(
        "hidden"
    );


    /*
       لینک لیبل بر اساس Serial Number
       ساخته می‌شود.

       اگر بعداً مسیر واقعی فایل‌های لیبل
       مشخص شد، فقط این قسمت تغییر می‌کند.
    */

    const labelURL =
        "labels/" +
        encodeURIComponent(
            serial
        ) +
        ".pdf";


    text.textContent =
        "Serial Number: " +
        serial;


    link.href =
        labelURL;

    link.classList.remove(
        "hidden"
    );

}


/* =========================================================
   چک لیست
========================================================= */

function renderChecklist(
    checkedItems = []
) {

    const container =
        get("checklist");

    container.innerHTML = "";


    CHECKLIST.forEach(
        function(item, index) {

            const row =
                document.createElement("div");

            row.className =
                "check-item";


            const checkbox =
                document.createElement("input");

            checkbox.type =
                "checkbox";

            checkbox.id =
                "check_" + index;

            checkbox.value =
                item;


            if (
                checkedItems.includes(item)
            ) {

                checkbox.checked =
                    true;

            }


            const label =
                document.createElement("label");

            label.htmlFor =
                checkbox.id;

            label.textContent =
                item;


            row.appendChild(
                checkbox
            );

            row.appendChild(
                label
            );

            container.appendChild(
                row
            );

        }
    );

}


function getCheckedItems() {

    const result = [];

    document
        .querySelectorAll(
            "#checklist input[type='checkbox']"
        )
        .forEach(
            function(input) {

                if (input.checked) {

                    result.push(
                        input.value
                    );

                }

            }
        );

    return result;

}


/* =========================================================
   ذخیره مراجعه
========================================================= */

function saveVisit() {

    const name =
        get("centerName")
            .value
            .trim();

    const phone =
        get("centerPhone")
            .value
            .trim();

    const manager =
        get("centerManager")
            .value
            .trim();

    const model =
        get("robotModel")
            .value
            .trim();

    const serial =
        get("robotSerial")
            .value
            .trim();

    const extra =
        get("extraWork")
            .value
            .trim();

    const checklist =
        getCheckedItems();


    if (!name) {

        alert(
            "نام مرکز را وارد کنید."
        );

        return;

    }


    if (!model) {

        alert(
            "مدل ربات را انتخاب کنید."
        );

        return;

    }


    if (!serial) {

        alert(
            "Serial Number را وارد کنید."
        );

        return;

    }


    /*
       پیدا کردن مرکز
    */

    let center =
        currentCenter;


    if (!center) {

        center =
            database.centers.find(
                function(item) {

                    return (
                        item.province ===
                        currentProvince &&

                        item.name
                            .trim()
                            .toLowerCase() ===
                        name
                            .toLowerCase()
                    );

                }
            );

    }


    /*
       ایجاد مرکز جدید
    */

    if (!center) {

        center = {

            id:
                Date.now(),

            province:
                currentProvince,

            name:
                name,

            phone:
                phone,

            manager:
                manager,

            robot: {

                model:
                    model,

                serial:
                    serial

            },

            visits: []

        };


        database.centers.push(
            center
        );

    }


    /*
       اطلاعات ثابت مرکز
    */

    center.name =
        name;

    center.phone =
        phone;

    center.manager =
        manager;


    center.province =
        currentProvince;


    /*
       اطلاعات ثابت ربات
    */

    center.robot = {

        model:
            model,

        serial:
            serial

    };


    if (!Array.isArray(center.visits)) {

        center.visits = [];

    }


    /*
       ثبت مراجعه جدید
    */

    const visit = {

        id:
            Date.now(),

        date:
            new Date()
                .toLocaleString(
                    "fa-IR"
                ),

        robot:
            model,

        serial:
            serial,

        checklist:
            checklist,

        extraWork:
            extra

    };


    center.visits.unshift(
        visit
    );


    saveDatabase();


    currentCenter =
        center;


    get("centerPageTitle")
        .textContent =
        center.name;


    updateLabel();

    renderHistory();


    /*
       فرم گزارش جدید خالی می‌شود،
       ولی اطلاعات ثابت مرکز باقی می‌ماند.
    */

    get("extraWork").value = "";

    renderChecklist();


    alert(
        "✅ مراجعه با موفقیت ذخیره شد."
    );

}


/* =========================================================
   تاریخچه
========================================================= */

function renderHistory() {

    const history =
        get("history");

    history.innerHTML = "";


    if (
        !currentCenter ||
        !currentCenter.visits ||
        !currentCenter.visits.length
    ) {

        history.innerHTML =
            "<p>هنوز مراجعه‌ای ثبت نشده است.</p>";

        return;

    }


    currentCenter.visits.forEach(
        function(visit) {

            const box =
                document.createElement("div");

            box.className =
                "history-item";


            let listHTML = "";


            if (
                visit.checklist &&
                visit.checklist.length
            ) {

                listHTML =
                    visit.checklist
                        .map(
                            function(item) {

                                return (
                                    "<li>" +
                                    escapeHTML(item) +
                                    "</li>"
                                );

                            }
                        )
                        .join("");

            } else {

                listHTML =
                    "<li>موردی ثبت نشده است.</li>";

            }


            box.innerHTML = `

                <h3>
                    📅 ${escapeHTML(visit.date)}
                </h3>

                <p>
                    <strong>ربات:</strong>
                    ${escapeHTML(visit.robot)}
                </p>

                <p>
                    <strong>Serial Number:</strong>
                    ${escapeHTML(visit.serial)}
                </p>

                <strong>
                    کارهای انجام‌شده:
                </strong>

                <ul>
                    ${listHTML}
                </ul>

                ${
                    visit.extraWork
                    ?
                    `
                    <p>
                        <strong>کار متفرقه:</strong><br>
                        ${escapeHTML(visit.extraWork)}
                    </p>
                    `
                    :
                    ""
                }

            `;


            history.appendChild(box);

        }
    );

}


/* =========================================================
   گزارش PDF / چاپ
========================================================= */

function printReport() {

    if (!currentCenter) {

        alert(
            "ابتدا مرکز را ذخیره کنید."
        );

        return;

    }


    const name =
        get("centerName").value.trim();

    const phone =
        get("centerPhone").value.trim();

    const manager =
        get("centerManager").value.trim();

    const model =
        get("robotModel").value.trim();

    const serial =
        get("robotSerial").value.trim();

    const extra =
        get("extraWork").value.trim();

    const checklist =
        getCheckedItems();


    const provinceName =
        provinces.find(
            function(item) {

                return item[0] ===
                    currentProvince;

            }
        )?.[1] || "";


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


    const listHTML =
        checklist.length
        ?
        checklist
            .map(
                function(item) {

                    return (
                        "<li>☑ " +
                        escapeHTML(item) +
                        "</li>"
                    );

                }
            )
            .join("")
        :
        "<li>موردی ثبت نشده است.</li>";


    report.document.write(`

<!DOCTYPE html>

<html lang="fa" dir="rtl">

<head>

<meta charset="UTF-8">

<title>گزارش کار</title>

<style>

body {

    font-family: Tahoma, Arial, sans-serif;

    direction: rtl;

    padding: 30px;

    color: #111;

}

h1 {

    text-align: center;

    margin-bottom: 30px;

}

.box {

    border: 1px solid #999;

    border-radius: 8px;

    padding: 18px;

    margin-bottom: 18px;

}

table {

    width: 100%;

    border-collapse: collapse;

}

td {

    border: 1px solid #aaa;

    padding: 9px;

}

td:first-child {

    width: 30%;

    font-weight: bold;

}

li {

    margin-bottom: 7px;

}

@media print {

    body {

        padding: 10px;

    }

}

</style>

</head>

<body>

<h1>
گزارش کار
</h1>


<div class="box">

<h2>
اطلاعات مرکز
</h2>

<table>

<tr>
<td>استان</td>
<td>${escapeHTML(provinceName)}</td>
</tr>

<tr>
<td>نام مرکز</td>
<td>${escapeHTML(name)}</td>
</tr>

<tr>
<td>شماره تماس</td>
<td>${escapeHTML(phone)}</td>
</tr>

<tr>
<td>نام مسئول</td>
<td>${escapeHTML(manager)}</td>
</tr>

</table>

</div>


<div class="box">

<h2>
اطلاعات ربات
</h2>

<table>

<tr>
<td>مدل ربات</td>
<td>${escapeHTML(model)}</td>
</tr>

<tr>
<td>Serial Number</td>
<td>${escapeHTML(serial)}</td>
</tr>

</table>

</div>


<div class="box">

<h2>
کارهای انجام‌شده
</h2>

<ul>

${listHTML}

</ul>

</div>


<div class="box">

<h2>
کارهای متفرقه
</h2>

<p>
${escapeHTML(
    extra ||
    "موردی ثبت نشده است."
)}
</p>

</div>


</body>

</html>

    `);


    report.document.close();


    setTimeout(
        function() {

            report.print();

        },
        500
    );

}


/* =========================================================
   بازگشت‌ها
========================================================= */

function backToProvinces() {

    currentProvince = "";

    currentCenter = null;

    currentRobot = "";

    get("centersPage")
        .classList.add("hidden");

    get("centerPage")
        .classList.add("hidden");

    get("provincePage")
        .classList.remove("hidden");

}


function backToCenters() {

    currentCenter = null;

    currentRobot = "";

    get("centerPage")
        .classList.add("hidden");

    get("centersPage")
        .classList.remove("hidden");

    renderCenters();

}


/* =========================================================
   شروع برنامه
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {


        /*
           رمز
        */

        get("loginBtn")
            .addEventListener(
                "click",
                login
            );


        get("passwordInput")
            .addEventListener(
                "keydown",
                function(event) {

                    if (
                        event.key ===
                        "Enter"
                    ) {

                        login();

                    }

                }
            );


        /*
           خروج
        */

        get("logoutBtn")
            .addEventListener(
                "click",
                logout
            );


        /*
           دکمه‌ها
        */

        get("backProvinceBtn")
            .addEventListener(
                "click",
                backToProvinces
            );


        get("backCentersBtn")
            .addEventListener(
                "click",
                backToCenters
            );


        get("newCenterBtn")
            .addEventListener(
                "click",
                newCenter
            );


        get("centerSearch")
            .addEventListener(
                "input",
                renderCenters
            );


        /*
           ربات
        */

        document
            .querySelectorAll(".robot-card")
            .forEach(
                function(card) {

                    card.addEventListener(
                        "click",
                        function() {

                            selectRobot(
                                this.dataset.robot
                            );

                        }
                    );

                }
            );


        /*
           تغییر Serial
        */

        get("robotSerial")
            .addEventListener(
                "input",
                updateLabel
            );


        /*
           ذخیره
        */

        get("saveBtn")
            .addEventListener(
                "click",
                saveVisit
            );


        /*
           گزارش
        */

        get("reportBtn")
            .addEventListener(
                "click",
                printReport
            );


        /*
           وضعیت رمز
        */

        if (
            isLocked()
        ) {

            updateLockMessage();

        }


        /*
           اگر قبلاً در همین نشست وارد شده
        */

        if (
            sessionStorage.getItem(
                "center_logged_in"
            ) === "1" &&
            !isLocked()
        ) {

            showApp();

        }


        /*
           شمارش معکوس قفل
        */

        setInterval(
            function() {

                if (
                    isLocked()
                ) {

                    updateLockMessage();

                }

            },
            10000
        );

    }
);
