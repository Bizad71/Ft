/* =========================================================
   مدیریت مراکز و گزارش کار
========================================================= */

const STORAGE_KEY = "center_management_data";

const PASSWORD = "0111";


/* =========================================================
   دیتابیس
========================================================= */

let database =
    JSON.parse(
        localStorage.getItem(STORAGE_KEY)
    ) || {
        centers: []
    };


/* =========================================================
   وضعیت
========================================================= */

let currentCity = "";

let currentCenter = null;

let currentRobot = "";


/* =========================================================
   شهرها
   تهران عمداً اول لیست است
========================================================= */

const cities = [
    "تهران",
    "کرج",
    "مشهد",
    "اصفهان",
    "شیراز",
    "تبریز",
    "قم",
    "اهواز",
    "رشت",
    "کرمان",
    "ارومیه",
    "یزد",
    "ساری",
    "بندرعباس",
    "همدان",
    "کرمانشاه",
    "قزوین",
    "زنجان",
    "اردبیل",
    "سنندج",
    "گرگان",
    "خرم‌آباد",
    "بوشهر",
    "زاهدان",
    "اراک",
    "سمنان",
    "ایلام",
    "بیرجند",
    "یاسوج"
];


/* =========================================================
   لیست کارها
========================================================= */

const checklistItems = [

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


/* =========================================================
   ذخیره
========================================================= */

function saveDatabase() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(database)
    );

}


/* =========================================================
   سالم‌سازی دیتابیس
========================================================= */

function normalizeDatabase() {

    if (
        !database ||
        typeof database !== "object"
    ) {

        database = {
            centers: []
        };

    }


    if (
        !Array.isArray(
            database.centers
        )
    ) {

        database.centers = [];

    }


    database.centers.forEach(
        function(center) {

            if (!center.robots) {

                center.robots = {};

            }

            if (
                !Array.isArray(
                    center.visits
                )
            ) {

                center.visits = [];

            }

        }
    );

}


/* =========================================================
   ورود با رمز
========================================================= */

function login() {

    const input =
        document.getElementById(
            "passwordInput"
        );

    const error =
        document.getElementById(
            "loginError"
        );

    if (
        input.value === PASSWORD
    ) {

        document
            .getElementById("loginPage")
            .classList.add("hidden");

        document
            .getElementById("app")
            .classList.remove("hidden");

        error.textContent = "";

        input.value = "";

        renderCities();

    } else {

        error.textContent =
            "❌ رمز عبور اشتباه است.";

        input.value = "";

        input.focus();

    }

}


/* =========================================================
   خروج
========================================================= */

function logout() {

    document
        .getElementById("app")
        .classList.add("hidden");

    document
        .getElementById("loginPage")
        .classList.remove("hidden");

    document
        .getElementById("passwordInput")
        .focus();

}


/* =========================================================
   نمایش شهرها
========================================================= */

function renderCities() {

    const grid =
        document.getElementById(
            "cityGrid"
        );

    if (!grid) {

        return;

    }


    grid.innerHTML = "";


    cities.forEach(
        function(city, index) {

            const card =
                document.createElement(
                    "button"
                );


            card.type = "button";

            card.className =
                "city-card";


            const count =
                database.centers.filter(
                    function(center) {

                        return (
                            center.city ===
                            city
                        );

                    }
                ).length;


            card.innerHTML = `

                <div class="city-number">
                    ${index + 1}
                </div>

                <div class="city-icon">
                    🏙️
                </div>

                <div class="city-name">
                    ${escapeHTML(city)}
                </div>

                <div class="city-count">
                    ${count} مرکز
                </div>

            `;


            card.addEventListener(
                "click",
                function() {

                    openCity(city);

                }
            );


            grid.appendChild(card);

        }
    );

}


/* =========================================================
   باز کردن شهر
========================================================= */

function openCity(city) {

    currentCity = city;

    currentCenter = null;

    currentRobot = "";


    document
        .getElementById("cityPage")
        .classList.add("hidden");


    document
        .getElementById("centerPage")
        .classList.add("hidden");


    document
        .getElementById("provincePage")
        .classList.remove("hidden");


    document
        .getElementById("provinceTitle")
        .textContent =
        "مراکز " + city;


    document
        .getElementById(
            "provinceCenterSearch"
        )
        .value = "";


    renderCenters();

}


/* =========================================================
   نمایش مراکز
========================================================= */

function renderCenters() {

    const grid =
        document.getElementById(
            "centersGrid"
        );

    const empty =
        document.getElementById(
            "emptyCenters"
        );


    if (!grid) {

        return;

    }


    grid.innerHTML = "";


    const search =
        (
            document.getElementById(
                "provinceCenterSearch"
            ).value || ""
        )
        .trim()
        .toLowerCase();


    let centers =
        database.centers.filter(
            function(center) {

                return (
                    center.city ===
                    currentCity
                );

            }
        );


    if (search) {

        centers =
            centers.filter(
                function(center) {

                    return String(
                        center.name || ""
                    )
                    .toLowerCase()
                    .includes(search);

                }
            );

    }


    if (!centers.length) {

        empty.style.display =
            "block";

        empty.textContent =
            search
                ? "مرکزی با این نام پیدا نشد."
                : "هنوز مرکزی ثبت نشده است.";

        return;

    }


    empty.style.display =
        "none";


    centers.forEach(
        function(center) {

            const box =
                document.createElement(
                    "div"
                );


            box.className =
                "center-box";


            box.innerHTML = `

                <div class="center-box-icon">
                    🏥
                </div>

                <h3>
                    ${escapeHTML(
                        center.name
                    )}
                </h3>

                <p>
                    ${escapeHTML(
                        center.manager ||
                        "مسئول ثبت نشده"
                    )}
                </p>

                <button
                    type="button"
                    class="btn btn-blue"
                >
                    باز کردن مرکز
                </button>

            `;


            box
                .querySelector("button")
                .addEventListener(
                    "click",
                    function() {

                        openCenter(
                            center
                        );

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


    showCenterPage();

    clearForm();


    document
        .getElementById("centerCity")
        .value =
        currentCity;


    document
        .getElementById("centerName")
        .focus();

}


/* =========================================================
   نمایش صفحه گزارش
========================================================= */

function showCenterPage() {

    document
        .getElementById("cityPage")
        .classList.add("hidden");


    document
        .getElementById("provincePage")
        .classList.add("hidden");


    document
        .getElementById("centerPage")
        .classList.remove("hidden");


    createChecklist();

}


/* =========================================================
   باز کردن مرکز
========================================================= */

function openCenter(center) {

    currentCenter = center;

    currentRobot = "";


    showCenterPage();


    document
        .getElementById("pageTitle")
        .textContent =
        center.name;


    document
        .getElementById("centerName")
        .value =
        center.name || "";


    document
        .getElementById("centerCity")
        .value =
        center.city || "";


    document
        .getElementById("centerManager")
        .value =
        center.manager || "";


    document
        .getElementById("centerPhone")
        .value =
        center.phone || "";


    document
        .getElementById("centerAddress")
        .value =
        center.address || "";


    document
        .getElementById("robotModel")
        .value = "";


    document
        .getElementById("robotSerial")
        .value = "";


    document
        .getElementById("robotIP")
        .value = "";


    document
        .getElementById("extraWork")
        .value = "";


    createChecklist();

    renderHistory();

}


/* =========================================================
   انتخاب ربات
========================================================= */

function selectRobot(robot) {

    currentRobot = robot;


    document
        .getElementById("robotModel")
        .value =
        robot;


    let info = null;


    if (
        currentCenter &&
        currentCenter.robots &&
        currentCenter.robots[robot]
    ) {

        info =
            currentCenter.robots[robot];

    }


    document
        .getElementById("robotSerial")
        .value =
        info?.serial || "";


    document
        .getElementById("robotIP")
        .value =
        info?.ip || "";


    createChecklist();

}


/* =========================================================
   ساخت چک لیست
========================================================= */

function createChecklist(
    savedItems = []
) {

    const container =
        document.getElementById(
            "checklist"
        );


    if (!container) {

        return;

    }


    container.innerHTML = "";


    checklistItems.forEach(
        function(item, index) {

            const row =
                document.createElement(
                    "label"
                );


            row.className =
                "check-item";


            const checkbox =
                document.createElement(
                    "input"
                );


            checkbox.type =
                "checkbox";


            checkbox.id =
                "check_" + index;


            checkbox.value =
                item;


            if (
                savedItems.includes(
                    item
                )
            ) {

                checkbox.checked =
                    true;

            }


            row.appendChild(
                checkbox
            );


            const text =
                document.createElement(
                    "span"
                );


            text.textContent =
                item;


            row.appendChild(
                text
            );


            container.appendChild(
                row
            );

        }
    );

}


/* =========================================================
   گرفتن کارهای انتخاب‌شده
========================================================= */

function getChecklistValues() {

    const result = [];


    document
        .querySelectorAll(
            "#checklist input"
        )
        .forEach(
            function(input) {

                if (
                    input.checked
                ) {

                    result.push(
                        input.value
                    );

                }

            }
        );


    return result;

}


/* =========================================================
   گرفتن فرم
========================================================= */

function getFormData() {

    return {

        name:
            getValue("centerName"),

        city:
            getValue("centerCity"),

        manager:
            getValue("centerManager"),

        phone:
            getValue("centerPhone"),

        address:
            getValue("centerAddress"),

        robot:
            getValue("robotModel"),

        serial:
            getValue("robotSerial"),

        ip:
            getValue("robotIP"),

        checklist:
            getChecklistValues(),

        extra:
            getValue("extraWork")

    };

}


/* =========================================================
   مقدار input
========================================================= */

function getValue(id) {

    const el =
        document.getElementById(id);

    return el
        ? el.value.trim()
        : "";

}


/* =========================================================
   ذخیره گزارش
========================================================= */

function saveVisit() {

    const data =
        getFormData();


    if (!data.name) {

        alert(
            "نام مرکز را وارد کنید."
        );

        return;

    }


    if (!currentRobot) {

        alert(
            "مدل ربات را انتخاب کنید."
        );

        return;

    }


    let center =
        currentCenter;


    if (!center) {

        center =
            database.centers.find(
                function(item) {

                    return (
                        item.city ===
                        currentCity &&

                        String(
                            item.name
                        )
                        .trim()
                        .toLowerCase() ===

                        data.name
                            .trim()
                            .toLowerCase()
                    );

                }
            );

    }


    if (!center) {

        center = {

            id: Date.now(),

            city: currentCity,

            name: data.name,

            manager: data.manager,

            phone: data.phone,

            address: data.address,

            robots: {},

            visits: []

        };


        database.centers.push(
            center
        );

    }


    center.city =
        currentCity;

    center.name =
        data.name;

    center.manager =
        data.manager;

    center.phone =
        data.phone;

    center.address =
        data.address;


    if (!center.robots) {

        center.robots = {};

    }


    center.robots[
        currentRobot
    ] = {

        serial:
            data.serial,

        ip:
            data.ip

    };


    if (
        !Array.isArray(
            center.visits
        )
    ) {

        center.visits = [];

    }


    center.visits.unshift({

        id:
            Date.now(),

        date:
            new Date()
                .toLocaleString(
                    "fa-IR"
                ),

        robot:
            currentRobot,

        serial:
            data.serial,

        ip:
            data.ip,

        checklist:
            data.checklist,

        extra:
            data.extra

    });


    saveDatabase();


    currentCenter =
        center;


    document
        .getElementById("pageTitle")
        .textContent =
        center.name;


    renderHistory();


    alert(
        "✅ گزارش با موفقیت ذخیره شد."
    );

}


/* =========================================================
   سوابق
========================================================= */

function renderHistory() {

    const history =
        document.getElementById(
            "history"
        );


    history.innerHTML = "";


    if (!currentCenter) {

        return;

    }


    const visits =
        currentCenter.visits || [];


    if (!visits.length) {

        history.innerHTML =
            "<p>هنوز سابقه‌ای ثبت نشده است.</p>";

        return;

    }


    visits.forEach(
        function(visit) {

            const box =
                document.createElement(
                    "div"
                );


            box.className =
                "history-item";


            box.innerHTML = `

                <h3>
                    📅 ${escapeHTML(
                        visit.date
                    )}
                </h3>

                <p>
                    <strong>ربات:</strong>
                    ${escapeHTML(
                        visit.robot
                    )}
                </p>

                <p>
                    <strong>شماره سریال:</strong>
                    ${escapeHTML(
                        visit.serial || ""
                    )}
                </p>

                <p>
                    <strong>کارهای انجام‌شده:</strong>
                </p>

                <ul>
                    ${
                        (visit.checklist || [])
                        .map(
                            item =>
                            `<li>${escapeHTML(item)}</li>`
                        )
                        .join("")
                    }
                </ul>

                ${
                    visit.extra
                    ?
                    `
                    <p>
                        <strong>کار متفرقه:</strong><br>
                        ${escapeHTML(
                            visit.extra
                        )}
                    </p>
                    `
                    :
                    ""
                }

            `;


            history.appendChild(
                box
            );

        }
    );

}


/* =========================================================
   پاک کردن فرم
========================================================= */

function clearForm() {

    document
        .getElementById("centerName")
        .value = "";

    document
        .getElementById("centerCity")
        .value =
        currentCity;

    document
        .getElementById("centerManager")
        .value = "";

    document
        .getElementById("centerPhone")
        .value = "";

    document
        .getElementById("centerAddress")
        .value = "";

    document
        .getElementById("robotModel")
        .value = "";

    document
        .getElementById("robotSerial")
        .value = "";

    document
        .getElementById("robotIP")
        .value = "";

    document
        .getElementById("extraWork")
        .value = "";

    document
        .getElementById("history")
        .innerHTML =
        "<p>مرکز جدید است؛ هنوز سابقه‌ای ثبت نشده است.</p>";

    createChecklist();

}


/* =========================================================
   بازگشت به شهر
========================================================= */

function backToProvince() {

    document
        .getElementById("centerPage")
        .classList.add("hidden");

    document
        .getElementById("provincePage")
        .classList.remove("hidden");

    currentCenter = null;

    currentRobot = "";

    renderCenters();

}


/* =========================================================
   بازگشت به لیست شهرها
========================================================= */

function backToCities() {

    document
        .getElementById("provincePage")
        .classList.add("hidden");

    document
        .getElementById("centerPage")
        .classList.add("hidden");

    document
        .getElementById("cityPage")
        .classList.remove("hidden");

    currentCity = "";

    currentCenter = null;

    currentRobot = "";

    renderCities();

}


/* =========================================================
   گزارش چاپی / PDF
========================================================= */

function printReport() {

    const data =
        getFormData();


    if (!data.name) {

        alert(
            "نام مرکز را وارد کنید."
        );

        return;

    }


    if (!data.robot) {

        alert(
            "مدل ربات را انتخاب کنید."
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
            "پنجره گزارش باز نشد. Popup مرورگر را فعال کنید."
        );

        return;

    }


    const checklist =
        data.checklist.length

        ?

        data.checklist
            .map(
                item =>
                `<li>☑ ${escapeHTML(item)}</li>`
            )
            .join("")

        :

        "<li>موردی انتخاب نشده است.</li>";


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

    margin: 0;

    padding: 30px;

    color: #111;

    background: white;

}

.report {

    max-width: 900px;

    margin: auto;

}

h1 {

    text-align: center;

    margin-bottom: 30px;

}

.box {

    border: 1px solid #777;

    border-radius: 8px;

    padding: 18px;

    margin-bottom: 18px;

}

table {

    width: 100%;

    border-collapse: collapse;

}

td {

    border: 1px solid #999;

    padding: 9px;

}

td:first-child {

    width: 30%;

    font-weight: bold;

}

li {

    margin-bottom: 8px;

}

@media print {

    body {

        padding: 0;

    }

}

</style>

</head>

<body>

<div class="report">

<h1>گزارش کار</h1>


<div class="box">

<h2>اطلاعات مرکز</h2>

<table>

<tr>
<td>شهر</td>
<td>${escapeHTML(data.city)}</td>
</tr>

<tr>
<td>نام مرکز</td>
<td>${escapeHTML(data.name)}</td>
</tr>

<tr>
<td>نام مسئول</td>
<td>${escapeHTML(data.manager)}</td>
</tr>

<tr>
<td>شماره تماس</td>
<td>${escapeHTML(data.phone)}</td>
</tr>

<tr>
<td>آدرس</td>
<td>${escapeHTML(data.address)}</td>
</tr>

</table>

</div>


<div class="box">

<h2>اطلاعات دستگاه</h2>

<table>

<tr>
<td>مدل دستگاه</td>
<td>${escapeHTML(data.robot)}</td>
</tr>

<tr>
<td>شماره سریال</td>
<td>${escapeHTML(data.serial)}</td>
</tr>

<tr>
<td>IP Address</td>
<td>${escapeHTML(data.ip)}</td>
</tr>

<tr>
<td>لینک لیبل</td>
<td>
${escapeHTML(
    data.serial
        ? "بر اساس شماره سریال دستگاه"
        : "شماره سریال ثبت نشده"
)}
</td>
</tr>

</table>

</div>


<div class="box">

<h2>کارهای انجام‌شده</h2>

<ul>

${checklist}

</ul>

</div>


<div class="box">

<h2>کارهای متفرقه</h2>

<p>
${escapeHTML(
    data.extra ||
    "موردی ثبت نشده است."
)}
</p>

</div>


<div class="box">

<h2>تاریخ گزارش</h2>

<p>
${new Date().toLocaleString("fa-IR")}
</p>

</div>

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
   امنیت HTML
========================================================= */

function escapeHTML(value) {

    if (!value) {

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
   شروع برنامه
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        normalizeDatabase();


        /* ورود */

        document
            .getElementById("loginBtn")
            .addEventListener(
                "click",
                login
            );


        document
            .getElementById("passwordInput")
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


        /* خروج */

        document
            .getElementById("logoutBtn")
            .addEventListener(
                "click",
                logout
            );


        /* شهر */

        document
            .getElementById("backCityBtn")
            .addEventListener(
                "click",
                backToCities
            );


        /* مرکز جدید */

        document
            .getElementById("newCenterBtn")
            .addEventListener(
                "click",
                newCenter
            );


        /* بازگشت */

        document
            .getElementById("backProvinceBtn")
            .addEventListener(
                "click",
                backToProvince
            );


        /* جستجو */

        document
            .getElementById(
                "provinceCenterSearch"
            )
            .addEventListener(
                "input",
                renderCenters
            );


        /* ربات */

        document
            .querySelectorAll(
                ".robot-card"
            )
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


        /* ذخیره */

        document
            .getElementById(
                "saveVisitBtn"
            )
            .addEventListener(
                "click",
                saveVisit
            );


        /* چاپ */

        document
            .getElementById(
                "printReportBtn"
            )
            .addEventListener(
                "click",
                printReport
            );


        /* نمایش ورود */

        document
            .getElementById(
                "passwordInput"
            )
            .focus();

    }
);
