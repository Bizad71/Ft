/* =========================================================
   مدیریت مراکز و گزارش کار
========================================================= */

const STORAGE_KEY =
    "center_management_data";


/* =========================================================
   استان‌ها
   تهران اول
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
        key: "razavi-khorasan",
        name: "خراسان رضوی"
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
        key: "fars",
        name: "فارس"
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
   چک لیست جدید
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
   دیتابیس
========================================================= */

let database =
    JSON.parse(
        localStorage.getItem(
            STORAGE_KEY
        )
    ) || {
        centers: []
    };


if (!Array.isArray(database.centers)) {

    database.centers = [];

}


let currentProvince = null;

let currentCenter = null;

let currentRobot = "";


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
   نام استان
========================================================= */

function getProvinceName(key) {

    const province =
        provinces.find(
            p => p.key === key
        );

    return province
        ? province.name
        : "";

}


/* =========================================================
   نمایش استان‌ها
========================================================= */

function renderProvinces() {

    const grid =
        document.getElementById(
            "provinceGrid"
        );


    grid.innerHTML = "";


    provinces.forEach(
        province => {

            const button =
                document.createElement(
                    "button"
                );


            button.className =
                "province-box";


            if (
                province.key ===
                "tehran"
            ) {

                button.classList.add(
                    "tehran"
                );

            }


            button.textContent =
                province.name;


            button.onclick =
                () => {

                    openProvince(
                        province.key
                    );

                };


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


    currentCenter = null;

    currentRobot = "";


    document
        .getElementById(
            "provincePage"
        )
        .classList.add(
            "hidden"
        );


    document
        .getElementById(
            "centerPage"
        )
        .classList.add(
            "hidden"
        );


    document
        .getElementById(
            "centersPage"
        )
        .classList.remove(
            "hidden"
        );


    document
        .getElementById(
            "provinceTitle"
        )
        .textContent =
        "🏥 مراکز " +
        getProvinceName(
            provinceKey
        );


    document
        .getElementById(
            "centerSearch"
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


    const search =
        document.getElementById(
            "centerSearch"
        )
        .value
        .trim()
        .toLowerCase();


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
                    center.name
                        .toLowerCase()
                        .includes(search)
            );

    }


    if (!centers.length) {

        empty.style.display =
            "block";

        return;

    }


    empty.style.display =
        "none";


    centers.forEach(
        center => {

            const box =
                document.createElement(
                    "div"
                );


            box.className =
                "center-box";


            box.innerHTML = `

                <h3>
                    🏥 ${escapeHTML(
                        center.name
                    )}
                </h3>

                <p>
                    مسئول:
                    ${escapeHTML(
                        center.manager ||
                        "ثبت نشده"
                    )}
                </p>

                <button
                    class="btn blue"
                >
                    باز کردن مرکز
                </button>

            `;


            box
                .querySelector(
                    "button"
                )
                .onclick =
                () => {

                    openCenter(
                        center
                    );

                };


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

    currentCenter = null;

    currentRobot = "";


    showCenterPage();


    clearForm();


    document
        .getElementById(
            "centerName"
        )
        .focus();

}


/* =========================================================
   باز کردن مرکز
========================================================= */

function openCenter(
    center
) {

    currentCenter =
        center;


    currentRobot = "";


    showCenterPage();


    document
        .getElementById(
            "centerName"
        )
        .value =
        center.name || "";


    document
        .getElementById(
            "centerPhone"
        )
        .value =
        center.phone || "";


    document
        .getElementById(
            "centerAddress"
        )
        .value =
        center.address || "";


    document
        .getElementById(
            "centerManager"
        )
        .value =
        center.manager || "";


    document
        .getElementById(
            "robotModel"
        )
        .value = "";


    document
        .getElementById(
            "robotSerial"
        )
        .value = "";


    document
        .getElementById(
            "extraWork"
        )
        .value = "";


    renderHistory();

}


/* =========================================================
   صفحه مرکز
========================================================= */

function showCenterPage() {

    document
        .getElementById(
            "centersPage"
        )
        .classList.add(
            "hidden"
        );


    document
        .getElementById(
            "provincePage"
        )
        .classList.add(
            "hidden"
        );


    document
        .getElementById(
            "centerPage"
        )
        .classList.remove(
            "hidden"
        );


    document
        .getElementById(
            "centerPageTitle"
        )
        .textContent =
        currentCenter
            ? currentCenter.name
            : "ثبت گزارش کار";


    createChecklist();

}


/* =========================================================
   پاک کردن فرم
========================================================= */

function clearForm() {

    document.getElementById(
        "centerName"
    ).value = "";


    document.getElementById(
        "centerPhone"
    ).value = "";


    document.getElementById(
        "centerAddress"
    ).value = "";


    document.getElementById(
        "centerManager"
    ).value = "";


    document.getElementById(
        "robotModel"
    ).value = "";


    document.getElementById(
        "robotSerial"
    ).value = "";


    document.getElementById(
        "extraWork"
    ).value = "";


    document
        .querySelectorAll(
            ".robot-card"
        )
        .forEach(
            card =>
                card.classList.remove(
                    "active"
                )
        );


    document.getElementById(
        "history"
    ).innerHTML =
        "<div class='empty'>هنوز گزارشی ثبت نشده است.</div>";


    createChecklist();

}


/* =========================================================
   انتخاب ربات
========================================================= */

document
    .querySelectorAll(
        ".robot-card"
    )
    .forEach(
        card => {

            card.onclick =
                () => {

                    document
                        .querySelectorAll(
                            ".robot-card"
                        )
                        .forEach(
                            c =>
                                c.classList.remove(
                                    "active"
                                )
                        );


                    card.classList.add(
                        "active"
                    );


                    currentRobot =
                        card.dataset.robot;


                    document
                        .getElementById(
                            "robotModel"
                        )
                        .value =
                        currentRobot;


                    /*
                       اطلاعات ربات قبلی
                    */

                    if (
                        currentCenter &&
                        currentCenter.robots &&
                        currentCenter.robots[
                            currentRobot
                        ]
                    ) {

                        const robot =
                            currentCenter
                                .robots[
                                    currentRobot
                                ];


                        document
                            .getElementById(
                                "robotSerial"
                            )
                            .value =
                            robot.serial || "";

                    } else {

                        document
                            .getElementById(
                                "robotSerial"
                            )
                            .value = "";

                    }


                    createChecklist();

                };

        }
    );


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
        (item, index) => {

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


            checkbox.checked =
                savedItems.includes(
                    item
                );


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
            "#checklist input"
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
        document
            .getElementById(
                "centerName"
            )
            .value
            .trim();


    const phone =
        document
            .getElementById(
                "centerPhone"
            )
            .value
            .trim();


    const address =
        document
            .getElementById(
                "centerAddress"
            )
            .value
            .trim();


    const manager =
        document
            .getElementById(
                "centerManager"
            )
            .value
            .trim();


    const serial =
        document
            .getElementById(
                "robotSerial"
            )
            .value
            .trim();


    const extra =
        document
            .getElementById(
                "extraWork"
            )
            .value
            .trim();


    if (!name) {

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


    if (!serial) {

        alert(
            "شماره سریال دستگاه را وارد کنید."
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
                        .toLowerCase() ===
                    name.toLowerCase()
            );

    }


    /*
       ساخت مرکز
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

            address:
                address,

            manager:
                manager,

            robots: {},

            visits: []

        };


        database.centers.push(
            center
        );

    }


    /*
       اطلاعات عمومی
    */

    center.name =
        name;

    center.phone =
        phone;

    center.address =
        address;

    center.manager =
        manager;


    if (!center.robots) {

        center.robots = {};

    }


    /*
       شماره سریال = شناسه لیبل
    */

    center.robots[
        currentRobot
    ] = {

        serial:
            serial,

        label:
            serial

    };


    /*
       گزارش مراجعه
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
            currentRobot,

        serial:
            serial,

        label:
            serial,

        checklist:
            getChecklist(),

        extraWork:
            extra

    };


    if (!Array.isArray(
        center.visits
    )) {

        center.visits = [];

    }


    center.visits.unshift(
        visit
    );


    saveDatabase();


    currentCenter =
        center;


    document
        .getElementById(
            "centerPageTitle"
        )
        .textContent =
        center.name;


    renderHistory();


    alert(
        "گزارش با موفقیت ذخیره شد."
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


    if (
        !currentCenter ||
        !currentCenter.visits ||
        !currentCenter.visits.length
    ) {

        history.innerHTML =
            "<div class='empty'>هنوز گزارشی ثبت نشده است.</div>";

        return;

    }


    currentCenter.visits.forEach(
        visit => {

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
                        visit.serial
                    )}
                </p>

                <p>
                    <strong>لیبل:</strong>
                    ${escapeHTML(
                        visit.label
                    )}
                </p>

                <strong>
                    کارهای انجام‌شده:
                </strong>

                <ul>
                    ${
                        visit.checklist
                            .map(
                                item =>
                                    `<li>${escapeHTML(item)}</li>`
                            )
                            .join("")
                    }
                </ul>

                ${
                    visit.extraWork
                        ? `
                            <p>
                                <strong>
                                    شرح خدمات:
                                </strong>
                                <br>
                                ${escapeHTML(
                                    visit.extraWork
                                )}
                            </p>
                          `
                        : ""
                }

            `;


            history.appendChild(
                box
            );

        }
    );

}


/* =========================================================
   چاپ گزارش
   طراحی شبیه فرم داخل عکس
========================================================= */

function printReport() {

    const centerName =
        document
            .getElementById(
                "centerName"
            )
            .value
            .trim();


    const phone =
        document
            .getElementById(
                "centerPhone"
            )
            .value
            .trim();


    const address =
        document
            .getElementById(
                "centerAddress"
            )
            .value
            .trim();


    const manager =
        document
            .getElementById(
                "centerManager"
            )
            .value
            .trim();


    const model =
        document
            .getElementById(
                "robotModel"
            )
            .value
            .trim();


    const serial =
        document
            .getElementById(
                "robotSerial"
            )
            .value
            .trim();


    if (!centerName) {

        alert(
            "نام مرکز وارد نشده است."
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
            "شماره سریال دستگاه را وارد کنید."
        );

        return;

    }


    const selected =
        getChecklist();


    const extra =
        document
            .getElementById(
                "extraWork"
            )
            .value
            .trim();


    const date =
        new Date()
            .toLocaleDateString(
                "fa-IR"
            );


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


    report.document.write(`

<!DOCTYPE html>

<html
lang="fa"
dir="rtl"
>

<head>

<meta charset="UTF-8">

<title>
گزارش نصب، آموزش و خدمات پس از فروش
</title>

<style>

@page {
    size: A4;
    margin: 10mm;
}

* {
    box-sizing: border-box;
}

body {

    margin: 0;

    font-family:
        Tahoma,
        Arial,
        sans-serif;

    color: #111;

    direction: rtl;

    font-size: 12px;

}

.report {

    width: 100%;

    border: 2px solid #263d8f;

}

.header {

    text-align: center;

    border-bottom: 4px solid #263d8f;

    padding: 14px;

    position: relative;

}

.header h1 {

    margin: 0;

    color: #263d8f;

    font-size: 19px;

}

.header .company {

    position: absolute;

    left: 15px;

    top: 10px;

    color: #263d8f;

    font-size: 17px;

    font-weight: bold;

}

.section-title {

    background: #263d8f;

    color: white;

    text-align: center;

    padding: 7px;

    font-weight: bold;

    border-top: 1px solid #263d8f;

    border-bottom: 1px solid #263d8f;

}

.info-table {

    width: 100%;

    border-collapse: collapse;

}

.info-table td {

    border: 1px solid #263d8f;

    padding: 7px;

    height: 28px;

}

.label {

    font-weight: bold;

    width: 18%;

    background: #f5f6fa;

}

.services {

    width: 100%;

    border-collapse: collapse;

}

.services th,
.services td {

    border: 1px solid #263d8f;

    padding: 6px;

}

.services th {

    background: #eef0f8;

}

.services td {

    height: 26px;

}

.description {

    min-height: 120px;

    padding: 12px;

    border-bottom: 1px solid #263d8f;

    line-height: 2;

}

.signature {

    width: 100%;

    border-collapse: collapse;

}

.signature td {

    border: 1px solid #263d8f;

    height: 80px;

    vertical-align: top;

    padding: 8px;

}

.small {

    font-size: 10px;

    color: #555;

}

</style>

</head>

<body>

<div class="report">


<div class="header">

<div class="company">
گزارش خدمات
</div>

<h1>
گزارش نصب، آموزش و خدمات پس از فروش
</h1>

</div>


<div class="section-title">
مشخصات بیمارستان / مرکز
</div>


<table class="info-table">

<tr>

<td class="label">
نام مرکز
</td>

<td>
${escapeHTML(centerName)}
</td>

<td class="label">
تاریخ
</td>

<td>
${escapeHTML(date)}
</td>

</tr>


<tr>

<td class="label">
مسئول
</td>

<td>
${escapeHTML(manager)}
</td>

<td class="label">
تلفن
</td>

<td>
${escapeHTML(phone)}
</td>

</tr>


<tr>

<td class="label">
آدرس
</td>

<td colspan="3">
${escapeHTML(address)}
</td>

</tr>

</table>


<div class="section-title">
مشخصات دستگاه
</div>


<table class="info-table">

<tr>

<td class="label">
دستگاه / سیستم
</td>

<td>
${escapeHTML(model)}
</td>

<td class="label">
شماره سریال
</td>

<td>
${escapeHTML(serial)}
</td>

</tr>


<tr>

<td class="label">
شماره لیبل
</td>

<td colspan="3">
${escapeHTML(serial)}
</td>

</tr>

</table>


<div class="section-title">
گزارش خدمات انجام‌شده
</div>


<table class="services">

<thead>

<tr>

<th style="width:8%">
ردیف
</th>

<th>
شرح خدمات
</th>

<th style="width:12%">
انجام شد
</th>

</tr>

</thead>

<tbody>

${
    checklistItems
        .map(
            (item, index) => {

                const checked =
                    selected.includes(
                        item
                    );

                return `

<tr>

<td>
${index + 1}
</td>

<td>
${escapeHTML(item)}
</td>

<td style="text-align:center">
${checked ? "✓" : ""}
</td>

</tr>

`;

            }
        )
        .join("")
}

</tbody>

</table>


<div class="section-title">
شرح خدمات / توضیحات
</div>


<div class="description">

${
    extra
        ? escapeHTML(extra)
        : "توضیحات ثبت نشده است."
}

</div>


<div class="section-title">
تأیید و امضاء
</div>


<table class="signature">

<tr>

<td>
نام تحویل‌گیرنده / مسئول مرکز
<br><br>
امضاء:
</td>

<td>
نام کارشناس
<br><br>
امضاء:
</td>

</tr>

</table>


</div>

<script>

window.onload = function() {

    setTimeout(
        function() {
            window.print();
        },
        500
    );

};

</script>

</body>

</html>

    `);


    report.document.close();

}


/* =========================================================
   برگشت‌ها
========================================================= */

document
    .getElementById(
        "backProvinceBtn"
    )
    .onclick =
    () => {

        document
            .getElementById(
                "centersPage"
            )
            .classList.add(
                "hidden"
            );


        document
            .getElementById(
                "provincePage"
            )
            .classList.remove(
                "hidden"
            );

        currentProvince = null;

        currentCenter = null;

    };


document
    .getElementById(
        "backCentersBtn"
    )
    .onclick =
    () => {

        document
            .getElementById(
                "centerPage"
            )
            .classList.add(
                "hidden"
            );


        document
            .getElementById(
                "centersPage"
            )
            .classList.remove(
                "hidden"
            );


        currentCenter = null;

        currentRobot = "";

        renderCenters();

    };


/* =========================================================
   دکمه‌ها
========================================================= */

document
    .getElementById(
        "newCenterBtn"
    )
    .onclick =
    newCenter;


document
    .getElementById(
        "saveBtn"
    )
    .onclick =
    saveVisit;


document
    .getElementById(
        "printBtn"
    )
    .onclick =
    printReport;


document
    .getElementById(
        "centerSearch"
    )
    .addEventListener(
        "input",
        renderCenters
    );


/* =========================================================
   امنیت
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
   شروع
========================================================= */

renderProvinces();
