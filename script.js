/* =========================================================
   مدیریت مراکز و گزارش کار
   نسخه بدون نقشه
========================================================= */


/* =========================================================
   تنظیمات
========================================================= */

const STORAGE_KEY =
    "center_management_data_v3";

const PASSWORD =
    "0111";


/* =========================================================
   استان‌ها
   تهران عمداً اول قرار گرفته
========================================================= */

const provinces = [

    {
        key: "tehran",
        name: "تهران"
    },

    {
        key: "alborz",
        name: "البرز"
    },

    {
        key: "isfahan",
        name: "اصفهان"
    },

    {
        key: "fars",
        name: "فارس"
    },

    {
        key: "khorasan-razavi",
        name: "خراسان رضوی"
    },

    {
        key: "east-azerbaijan",
        name: "آذربایجان شرقی"
    },

    {
        key: "west-azerbaijan",
        name: "آذربایجان غربی"
    },

    {
        key: "ardabil",
        name: "اردبیل"
    },

    {
        key: "bushehr",
        name: "بوشهر"
    },

    {
        key: "chaharmahal",
        name: "چهارمحال و بختیاری"
    },

    {
        key: "south-khorasan",
        name: "خراسان جنوبی"
    },

    {
        key: "north-khorasan",
        name: "خراسان شمالی"
    },

    {
        key: "khuzestan",
        name: "خوزستان"
    },

    {
        key: "zanjan",
        name: "زنجان"
    },

    {
        key: "semnan",
        name: "سمنان"
    },

    {
        key: "sistan",
        name: "سیستان و بلوچستان"
    },

    {
        key: "qazvin",
        name: "قزوین"
    },

    {
        key: "qom",
        name: "قم"
    },

    {
        key: "kurdistan",
        name: "کردستان"
    },

    {
        key: "kerman",
        name: "کرمان"
    },

    {
        key: "kermanshah",
        name: "کرمانشاه"
    },

    {
        key: "kohgiluyeh",
        name: "کهگیلویه و بویراحمد"
    },

    {
        key: "golestan",
        name: "گلستان"
    },

    {
        key: "gilan",
        name: "گیلان"
    },

    {
        key: "lorestan",
        name: "لرستان"
    },

    {
        key: "mazandaran",
        name: "مازندران"
    },

    {
        key: "markazi",
        name: "مرکزی"
    },

    {
        key: "hormozgan",
        name: "هرمزگان"
    },

    {
        key: "hamedan",
        name: "همدان"
    },

    {
        key: "yazd",
        name: "یزد"
    }

];


/* =========================================================
   چک لیست
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
   وضعیت
========================================================= */

let database =
    loadDatabase();

let currentProvince =
    "";

let currentCenter =
    null;

let currentRobot =
    "";


/* =========================================================
   دیتابیس
========================================================= */

function loadDatabase() {

    try {

        const saved =
            localStorage.getItem(
                STORAGE_KEY
            );

        if (!saved) {

            return {
                centers: []
            };

        }

        const parsed =
            JSON.parse(saved);

        if (
            !parsed ||
            !Array.isArray(
                parsed.centers
            )
        ) {

            return {
                centers: []
            };

        }

        return parsed;

    } catch (error) {

        console.error(
            error
        );

        return {
            centers: []
        };

    }

}


function saveDatabase() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(database)
    );

}


/* =========================================================
   ابزارها
========================================================= */

function $(id) {

    return document.getElementById(id);

}


function value(id) {

    const element =
        $(id);

    return element
        ? element.value.trim()
        : "";

}


function escapeHTML(text) {

    if (
        text === null ||
        text === undefined
    ) {

        return "";

    }

    return String(text)

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
   پیدا کردن نام استان
========================================================= */

function getProvinceName(key) {

    const province =
        provinces.find(
            item =>
                item.key === key
        );

    return province
        ? province.name
        : "";

}


/* =========================================================
   ورود
========================================================= */

function login() {

    const password =
        value("passwordInput");

    const error =
        $("loginError");


    if (
        password === PASSWORD
    ) {

        $("loginPage")
            .classList.add(
                "hidden"
            );

        $("app")
            .classList.remove(
                "hidden"
            );

        error.style.display =
            "none";

        renderProvinces();

        return;

    }


    error.style.display =
        "block";

    $("passwordInput")
        .value = "";

    $("passwordInput")
        .focus();

}


function logout() {

    $("app")
        .classList.add(
            "hidden"
        );

    $("loginPage")
        .classList.remove(
            "hidden"
        );

    $("passwordInput")
        .value = "";

    $("passwordInput")
        .focus();

}


/* =========================================================
   نمایش استان‌ها
========================================================= */

function renderProvinces() {

    const grid =
        $("provinceGrid");

    grid.innerHTML = "";


    provinces.forEach(
        function(province, index) {

            const button =
                document.createElement(
                    "button"
                );

            button.type =
                "button";

            button.className =
                "province-card";


            if (
                index === 0
            ) {

                button.classList.add(
                    "tehran"
                );

            }


            button.innerHTML = `

                <div class="province-icon">
                    ${index === 0 ? "⭐" : "🏙️"}
                </div>

                <div class="province-name">
                    ${escapeHTML(
                        province.name
                    )}
                </div>

            `;


            button.addEventListener(
                "click",
                function() {

                    openProvince(
                        province.key
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

function openProvince(
    provinceKey
) {

    currentProvince =
        provinceKey;

    currentCenter =
        null;

    currentRobot =
        "";


    $("provincePage")
        .classList.add(
            "hidden"
        );


    $("reportPage")
        .classList.add(
            "hidden"
        );


    $("centersPage")
        .classList.remove(
            "hidden"
        );


    $("provinceTitle")
        .textContent =
        "مراکز " +
        getProvinceName(
            provinceKey
        );


    $("centerSearch")
        .value = "";


    renderCenters();

}


/* =========================================================
   نمایش مراکز
========================================================= */

function renderCenters() {

    const grid =
        $("centersGrid");

    const empty =
        $("emptyCenters");

    const search =
        value(
            "centerSearch"
        ).toLowerCase();


    grid.innerHTML = "";


    let centers =
        database.centers.filter(
            center =>
                center.province ===
                currentProvince
        );


    if (search) {

        centers =
            centers.filter(
                center =>
                    String(
                        center.name
                    )
                    .toLowerCase()
                    .includes(search)
            );

    }


    if (!centers.length) {

        empty.classList.remove(
            "hidden"
        );

        empty.textContent =
            search
                ? "مرکزی با این نام پیدا نشد."
                : "هنوز مرکزی برای این استان ثبت نشده است.";

        return;

    }


    empty.classList.add(
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


            box.innerHTML = `

                <div class="center-icon">
                    🏥
                </div>

                <h3>
                    ${escapeHTML(
                        center.name
                    )}
                </h3>

                <p>
                    شهر:
                    ${escapeHTML(
                        center.city ||
                        "-"
                    )}
                </p>

                <p>
                    مسئول:
                    ${escapeHTML(
                        center.manager ||
                        "-"
                    )}
                </p>

                <p>
                    مراجعه:
                    ${(center.visits || []).length}
                </p>

                <button
                    type="button"
                    class="btn btn-blue"
                >
                    باز کردن مرکز
                </button>

            `;


            box.querySelector(
                ".btn"
            ).addEventListener(
                "click",
                function() {

                    openCenter(
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
   مرکز جدید
========================================================= */

function newCenter() {

    currentCenter =
        null;

    currentRobot =
        "";


    $("centersPage")
        .classList.add(
            "hidden"
        );


    $("reportPage")
        .classList.remove(
            "hidden"
        );


    clearForm();


    $("reportPageTitle")
        .textContent =
        "ثبت مرکز جدید";


    renderChecklist();

}


/* =========================================================
   باز کردن مرکز
========================================================= */

function openCenter(center) {

    currentCenter =
        center;

    currentRobot =
        "";


    $("centersPage")
        .classList.add(
            "hidden"
        );


    $("reportPage")
        .classList.remove(
            "hidden"
        );


    $("reportPageTitle")
        .textContent =
        center.name;


    $("centerName")
        .value =
        center.name || "";


    $("centerCity")
        .value =
        center.city || "";


    $("centerManager")
        .value =
        center.manager || "";


    $("centerPhone")
        .value =
        center.phone || "";


    $("centerAddress")
        .value =
        center.address || "";


    $("robotModel")
        .value = "";

    $("robotSerial")
        .value = "";

    $("robotIP")
        .value = "";


    $("extraWork")
        .value = "";


    clearRobotSelection();


    renderChecklist();

    renderHistory();

    updateLabelLink();

}


/* =========================================================
   پاک کردن فرم
========================================================= */

function clearForm() {

    $("centerName")
        .value = "";

    $("centerCity")
        .value = "";

    $("centerManager")
        .value = "";

    $("centerPhone")
        .value = "";

    $("centerAddress")
        .value = "";

    $("robotModel")
        .value = "";

    $("robotSerial")
        .value = "";

    $("robotIP")
        .value = "";

    $("extraWork")
        .value = "";


    clearRobotSelection();


    $("history").innerHTML =
        `
        <p style="color:#8b949e">
            مرکز جدید است؛ هنوز سابقه‌ای ثبت نشده.
        </p>
        `;


    updateLabelLink();

}


function clearRobotSelection() {

    currentRobot =
        "";

    document
        .querySelectorAll(
            ".robot-card"
        )
        .forEach(
            card =>
                card.classList.remove(
                    "selected"
                )
        );

}


/* =========================================================
   انتخاب ربات
========================================================= */

function selectRobot(
    robot
) {

    currentRobot =
        robot;


    document
        .querySelectorAll(
            ".robot-card"
        )
        .forEach(
            card => {

                card.classList.toggle(
                    "selected",
                    card.dataset.robot ===
                    robot
                );

            }
        );


    $("robotModel")
        .value =
        robot;


    /*
       اگر این ربات قبلاً در مرکز
       ثبت شده باشد، اطلاعاتش را می‌آوریم.
    */

    if (
        currentCenter &&
        currentCenter.robots &&
        currentCenter.robots[robot]
    ) {

        const info =
            currentCenter.robots[
                robot
            ];


        $("robotSerial")
            .value =
            info.serial || "";


        $("robotIP")
            .value =
            info.ip || "";

    } else {

        $("robotSerial")
            .value = "";

        $("robotIP")
            .value = "";

    }


    updateLabelLink();

}


/* =========================================================
   لینک لیبل
   شماره سریال = لینک لیبل
========================================================= */

function updateLabelLink() {

    const serial =
        value(
            "robotSerial"
        );


    const preview =
        $("labelLink");


    if (
        !serial
    ) {

        preview.textContent =
            "پس از وارد کردن شماره سریال ایجاد می‌شود";

        return;

    }


    /*
       فعلاً خود شماره سریال به عنوان
       شناسه لیبل ذخیره می‌شود.
    */

    preview.textContent =
        serial;

}


/* =========================================================
   ساخت چک لیست
========================================================= */

function renderChecklist(
    savedItems = []
) {

    const container =
        $("checklist");

    container.innerHTML = "";


    checklistItems.forEach(
        function(item, index) {

            const row =
                document.createElement(
                    "div"
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
                "check_" +
                index;

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


            const label =
                document.createElement(
                    "label"
                );

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


/* =========================================================
   گرفتن چک لیست
========================================================= */

function getChecklist() {

    const result = [];


    document
        .querySelectorAll(
            "#checklist input[type='checkbox']"
        )
        .forEach(
            checkbox => {

                if (
                    checkbox.checked
                ) {

                    result.push(
                        checkbox.value
                    );

                }

            }
        );


    return result;

}


/* =========================================================
   ذخیره گزارش
========================================================= */

function saveVisit() {

    const name =
        value("centerName");

    const city =
        value("centerCity");

    const manager =
        value("centerManager");

    const phone =
        value("centerPhone");

    const address =
        value("centerAddress");

    const robotSerial =
        value("robotSerial");

    const robotIP =
        value("robotIP");

    const extraWork =
        value("extraWork");

    const checklist =
        getChecklist();


    if (!name) {

        alert(
            "نام مرکز را وارد کنید."
        );

        $("centerName")
            .focus();

        return;

    }


    if (!currentRobot) {

        alert(
            "ابتدا مدل ربات را انتخاب کنید."
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
                item =>

                    item.province ===
                    currentProvince &&

                    item.name
                        .trim()
                        .toLowerCase() ===

                    name
                        .trim()
                        .toLowerCase()
            );

    }


    /*
       اگر مرکز وجود ندارد
       ایجاد می‌شود.
    */

    if (!center) {

        center = {

            id:
                Date.now(),

            province:
                currentProvince,

            name:
                name,

            city:
                city,

            manager:
                manager,

            phone:
                phone,

            address:
                address,

            robots: {},

            visits: []

        };


        database.centers.push(
            center
        );

    }


    /*
       اطلاعات ثابت مرکز
    */

    center.province =
        currentProvince;

    center.name =
        name;

    center.city =
        city;

    center.manager =
        manager;

    center.phone =
        phone;

    center.address =
        address;


    if (!center.robots) {

        center.robots = {};

    }


    /*
       اطلاعات ربات
    */

    center.robots[
        currentRobot
    ] = {

        serial:
            robotSerial,

        ip:
            robotIP

    };


    /*
       ثبت مراجعه جدید
    */

    if (
        !Array.isArray(
            center.visits
        )
    ) {

        center.visits = [];

    }


    const visit = {

        id:
            Date.now(),

        date:
            new Date()
                .toLocaleString(
                    "fa-IR"
                ),

        province:
            currentProvince,

        robot:
            currentRobot,

        serial:
            robotSerial,

        ip:
            robotIP,

        checklist:
            checklist,

        extraWork:
            extraWork

    };


    center.visits.unshift(
        visit
    );


    saveDatabase();


    currentCenter =
        center;


    $("reportPageTitle")
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

    const container =
        $("history");


    container.innerHTML = "";


    if (
        !currentCenter ||
        !Array.isArray(
            currentCenter.visits
        ) ||
        !currentCenter.visits.length
    ) {

        container.innerHTML =
            `
            <p style="color:#8b949e">
                هنوز مراجعه‌ای ثبت نشده است.
            </p>
            `;

        return;

    }


    currentCenter.visits.forEach(
        function(visit) {

            const box =
                document.createElement(
                    "div"
                );

            box.className =
                "history-item";


            const checklist =
                Array.isArray(
                    visit.checklist
                )
                    ? visit.checklist
                    : [];


            const listHTML =
                checklist.length

                    ?

                    checklist
                        .map(
                            item =>
                                `
                                <li>
                                    ☑
                                    ${escapeHTML(
                                        item
                                    )}
                                </li>
                                `
                        )
                        .join("")

                    :

                    "<li>موردی ثبت نشده است.</li>";


            box.innerHTML = `

                <div class="history-header">

                    <span class="history-date">
                        📅
                        ${escapeHTML(
                            visit.date
                        )}
                    </span>

                    <span class="history-robot">
                        ${escapeHTML(
                            visit.robot
                        )}
                    </span>

                </div>


                <p>
                    <strong>
                        شماره سریال:
                    </strong>

                    ${escapeHTML(
                        visit.serial ||
                        "-"
                    )}
                </p>


                <p>
                    <strong>
                        IP:
                    </strong>

                    ${escapeHTML(
                        visit.ip ||
                        "-"
                    )}
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
                        <div class="history-extra">

                            <strong>
                                کارهای متفرقه:
                            </strong>

                            <br>

                            ${escapeHTML(
                                visit.extraWork
                            )}

                        </div>
                        `

                        :

                        ""
                }

            `;


            container.appendChild(
                box
            );

        }
    );

}


/* =========================================================
   گزارش چاپی / PDF
========================================================= */

function printReport() {

    const name =
        value("centerName");

    const city =
        value("centerCity");

    const manager =
        value("centerManager");

    const phone =
        value("centerPhone");

    const address =
        value("centerAddress");

    const robot =
        value("robotModel");

    const serial =
        value("robotSerial");

    const ip =
        value("robotIP");

    const extra =
        value("extraWork");

    const checklist =
        getChecklist();


    if (!name) {

        alert(
            "نام مرکز را وارد کنید."
        );

        return;

    }


    if (!robot) {

        alert(
            "ابتدا مدل ربات را انتخاب کنید."
        );

        return;

    }


    const province =
        getProvinceName(
            currentProvince
        );


    const checklistHTML =
        checklist.length

            ?

            checklist
                .map(
                    item =>
                        `
                        <tr>
                            <td class="check">
                                ✓
                            </td>

                            <td>
                                ${escapeHTML(
                                    item
                                )}
                            </td>
                        </tr>
                        `
                )
                .join("")

            :

            `
            <tr>
                <td colspan="2">
                    موردی انتخاب نشده است.
                </td>
            </tr>
            `;


    const report =
        window.open(
            "",
            "_blank",
            "width=900,height=1000"
        );


    if (!report) {

        alert(
            "پنجره گزارش توسط مرورگر مسدود شده است."
        );

        return;

    }


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

    margin: 12mm;

}


* {

    box-sizing:
        border-box;

}


body {

    margin:
        0;

    font-family:
        Tahoma,
        Arial,
        sans-serif;

    direction:
        rtl;

    color:
        #111;

    background:
        white;

}


.report {

    width:
        100%;

}


.header {

    text-align:
        center;

    border:
        2px solid
        #111;

    padding:
        14px;

    margin-bottom:
        15px;

}


.header h1 {

    margin:
        0 0 7px;

    font-size:
        24px;

}


.header p {

    margin:
        0;

    font-size:
        13px;

}


.box {

    border:
        1px solid
        #222;

    margin-bottom:
        14px;

}


.box-title {

    padding:
        8px 12px;

    font-weight:
        bold;

    background:
        #eeeeee;

    border-bottom:
        1px solid
        #222;

}


table {

    width:
        100%;

    border-collapse:
        collapse;

}


td {

    border:
        1px solid
        #555;

    padding:
        8px;

    font-size:
        13px;

}


.info td:first-child {

    width:
        25%;

    font-weight:
        bold;

    background:
        #f7f7f7;

}


.check {

    width:
        40px;

    text-align:
        center;

    font-weight:
        bold;

}


.footer {

    margin-top:
        30px;

    display:
        grid;

    grid-template-columns:
        1fr 1fr;

    gap:
        50px;

}


.signature {

    text-align:
        center;

    padding-top:
        30px;

}


.small {

    font-size:
        11px;

    color:
        #444;

}


</style>

</head>


<body>


<div class="report">


    <div class="header">

        <h1>
            گزارش کار
        </h1>

        <p>
            مدیریت مراکز و ربات‌ها
        </p>

    </div>


    <div class="box">

        <div class="box-title">
            اطلاعات مرکز
        </div>


        <table class="info">

            <tr>
                <td>استان</td>
                <td>
                    ${escapeHTML(
                        province
                    )}
                </td>
            </tr>


            <tr>
                <td>شهر</td>
                <td>
                    ${escapeHTML(
                        city
                    )}
                </td>
            </tr>


            <tr>
                <td>نام مرکز</td>
                <td>
                    ${escapeHTML(
                        name
                    )}
                </td>
            </tr>


            <tr>
                <td>نام مسئول</td>
                <td>
                    ${escapeHTML(
                        manager
                    )}
                </td>
            </tr>


            <tr>
                <td>شماره تماس</td>
                <td>
                    ${escapeHTML(
                        phone
                    )}
                </td>
            </tr>


            <tr>
                <td>آدرس</td>
                <td>
                    ${escapeHTML(
                        address
                    )}
                </td>
            </tr>


            <tr>
                <td>تاریخ</td>
                <td>
                    ${new Date()
                        .toLocaleString(
                            "fa-IR"
                        )}
                </td>
            </tr>

        </table>

    </div>


    <div class="box">

        <div class="box-title">
            اطلاعات دستگاه
        </div>


        <table class="info">

            <tr>
                <td>مدل دستگاه</td>
                <td>
                    ${escapeHTML(
                        robot
                    )}
                </td>
            </tr>


            <tr>
                <td>شماره سریال</td>
                <td>
                    ${escapeHTML(
                        serial
                    )}
                </td>
            </tr>


            <tr>
                <td>IP Address</td>
                <td>
                    ${escapeHTML(
                        ip
                    )}
                </td>
            </tr>


            <tr>
                <td>لینک لیبل</td>
                <td>
                    ${escapeHTML(
                        serial || "-"
                    )}
                </td>
            </tr>

        </table>

    </div>


    <div class="box">

        <div class="box-title">
            کارهای انجام‌شده
        </div>


        <table>

            ${checklistHTML}

        </table>

    </div>


    <div class="box">

        <div class="box-title">
            کارهای متفرقه
        </div>


        <div style="
            padding:15px;
            min-height:70px;
        ">

            ${
                extra
                    ? escapeHTML(extra)
                    : "موردی ثبت نشده است."
            }

        </div>

    </div>


    <div class="footer">

        <div class="signature">

            امضاء تکنسین

            <br><br><br>

            ..............................

        </div>


        <div class="signature">

            امضاء مسئول مرکز

            <br><br><br>

            ..............................

        </div>

    </div>


    <p class="small">

        گزارش ایجاد شده توسط سیستم مدیریت مراکز و ربات‌ها

    </p>


</div>


<script>

setTimeout(
    function() {

        window.print();

    },
    500
);

</script>


</body>

</html>

    `);


    report.document.close();

}


/* =========================================================
   برگشت‌ها
========================================================= */

function backToProvinces() {

    $("centersPage")
        .classList.add(
            "hidden"
        );

    $("reportPage")
        .classList.add(
            "hidden"
        );

    $("provincePage")
        .classList.remove(
            "hidden"
        );


    currentProvince =
        "";

    currentCenter =
        null;

    currentRobot =
        "";

}


function backToCenters() {

    $("reportPage")
        .classList.add(
            "hidden"
        );

    $("centersPage")
        .classList.remove(
            "hidden"
        );


    currentCenter =
        null;

    currentRobot =
        "";

    renderCenters();

}


/* =========================================================
   رویدادها
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {


        /*
           ورود
        */

        $("loginBtn")
            .addEventListener(
                "click",
                login
            );


        $("passwordInput")
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

        $("logoutBtn")
            .addEventListener(
                "click",
                logout
            );


        /*
           برگشت استان‌ها
        */

        $("backProvinceBtn")
            .addEventListener(
                "click",
                backToProvinces
            );


        /*
           مرکز جدید
        */

        $("newCenterBtn")
            .addEventListener(
                "click",
                newCenter
            );


        /*
           برگشت مراکز
        */

        $("backCentersBtn")
            .addEventListener(
                "click",
                backToCenters
            );


        /*
           جستجو
        */

        $("centerSearch")
            .addEventListener(
                "input",
                renderCenters
            );


        /*
           انتخاب ربات
        */

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


        /*
           تغییر شماره سریال
        */

        $("robotSerial")
            .addEventListener(
                "input",
                updateLabelLink
            );


        /*
           ذخیره
        */

        $("saveVisitBtn")
            .addEventListener(
                "click",
                saveVisit
            );


        /*
           PDF
        */

        $("printReportBtn")
            .addEventListener(
                "click",
                printReport
            );


        /*
           فوکوس روی رمز
        */

        $("passwordInput")
            .focus();

    }
);
