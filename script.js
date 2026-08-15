/* =========================================================
   مدیریت مراکز و گزارش کار
========================================================= */

const STORAGE_KEY = "center_management_data";

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
   استان‌ها
   تهران عمداً اول قرار گرفته
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
    ["khorasan-razavi", "خراسان رضوی"],
    ["khorasan-north", "خراسان شمالی"],
    ["khorasan-south", "خراسان جنوبی"],
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
   کارهای ثابت
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
   نرمال‌سازی
========================================================= */

function normalizeDatabase() {

    if (!database || typeof database !== "object") {

        database = {
            centers: []
        };

    }

    if (!Array.isArray(database.centers)) {

        database.centers = [];

    }

    database.centers.forEach(center => {

        if (!center.robots) {
            center.robots = {};
        }

        if (!Array.isArray(center.visits)) {
            center.visits = [];
        }

    });

}


/* =========================================================
   نمایش استان‌ها
========================================================= */

function renderProvinces() {

    const grid =
        document.getElementById(
            "provincesGrid"
        );

    if (!grid) return;

    grid.innerHTML = "";

    provinces.forEach(
        ([key, name]) => {

            const button =
                document.createElement(
                    "button"
                );

            button.type = "button";

            button.className =
                "province-box";

            if (key === "tehran") {

                button.classList.add(
                    "first-province"
                );

            }

            button.innerHTML = `
                <span class="province-icon">
                    🏢
                </span>

                <strong>
                    ${name}
                </strong>
            `;

            button.addEventListener(
                "click",
                () => openProvince(key)
            );

            grid.appendChild(button);

        }
    );

}


/* =========================================================
   باز کردن استان
========================================================= */

function openProvince(key) {

    currentProvince = key;
    currentCenter = null;
    currentRobot = "";

    const province =
        provinces.find(
            item => item[0] === key
        );

    document
        .getElementById("provincePage")
        .classList.add("hidden");

    document
        .getElementById("centersPage")
        .classList.remove("hidden");

    document
        .getElementById("reportPage")
        .classList.add("hidden");

    document
        .getElementById("provinceTitle")
        .textContent =
        "مراکز استان " +
        province[1];

    document
        .getElementById("centerSearch")
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

    if (!grid) return;

    grid.innerHTML = "";

    const query =
        document
            .getElementById(
                "centerSearch"
            )
            .value
            .trim()
            .toLowerCase();


    let centers =
        database.centers.filter(
            center =>
                center.province ===
                currentProvince
        );


    if (query) {

        centers =
            centers.filter(
                center =>
                    String(center.name || "")
                        .toLowerCase()
                        .includes(query)
            );

    }


    if (!centers.length) {

        empty.style.display = "block";

        empty.textContent =
            query
                ? "مرکزی با این نام پیدا نشد."
                : "هنوز مرکزی ثبت نشده است.";

        return;

    }


    empty.style.display = "none";


    centers.forEach(center => {

        const card =
            document.createElement(
                "div"
            );

        card.className =
            "center-box";


        card.innerHTML = `

            <div class="center-box-icon">
                🏥
            </div>

            <h3>
                ${escapeHTML(center.name)}
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


        card
            .querySelector("button")
            .addEventListener(
                "click",
                () => openCenter(center)
            );


        grid.appendChild(card);

    });

}


/* =========================================================
   مرکز جدید
========================================================= */

function newCenter() {

    currentCenter = null;
    currentRobot = "";

    showReportPage();

    clearForm();

}


/* =========================================================
   باز کردن مرکز
========================================================= */

function openCenter(center) {

    currentCenter = center;
    currentRobot = "";

    showReportPage();

    document
        .getElementById("centerName")
        .value =
        center.name || "";

    document
        .getElementById("centerPhone")
        .value =
        center.phone || "";

    document
        .getElementById("centerAddress")
        .value =
        center.address || "";

    document
        .getElementById("centerManager")
        .value =
        center.manager || "";

    document
        .getElementById("robotModel")
        .value = "";

    document
        .getElementById("robotSerial")
        .value = "";

    document
        .getElementById("problemDescription")
        .value = "";

    document
        .getElementById("extraWork")
        .value = "";

    document
        .getElementById("technicianName")
        .value = "";

    document
        .getElementById("entryTime")
        .value = "";

    document
        .getElementById("exitTime")
        .value = "";

    document
        .getElementById("workDescription")
        .value = "";

    document
        .getElementById("receiverName")
        .value = "";

    document
        .getElementById("companyRepresentative")
        .value = "";

    setToday();

    renderParts([]);

    createChecklist([]);

    renderHistory();

}


/* =========================================================
   نمایش صفحه گزارش
========================================================= */

function showReportPage() {

    document
        .getElementById("provincePage")
        .classList.add("hidden");

    document
        .getElementById("centersPage")
        .classList.add("hidden");

    document
        .getElementById("reportPage")
        .classList.remove("hidden");

    document
        .getElementById("reportPageTitle")
        .textContent =
        currentCenter
            ? currentCenter.name
            : "ثبت گزارش جدید";

}


/* =========================================================
   پاک کردن فرم
========================================================= */

function clearForm() {

    [
        "centerName",
        "centerPhone",
        "centerAddress",
        "centerManager",
        "robotModel",
        "robotSerial",
        "problemDescription",
        "extraWork",
        "technicianName",
        "entryTime",
        "exitTime",
        "workDescription",
        "receiverName",
        "companyRepresentative"
    ].forEach(id => {

        const el =
            document.getElementById(id);

        if (el) el.value = "";

    });


    setToday();

    renderParts([]);

    createChecklist([]);

    document
        .getElementById("history")
        .innerHTML =
        "<p>مرکز جدید است؛ هنوز سابقه‌ای ثبت نشده.</p>";

}


/* =========================================================
   تاریخ امروز
========================================================= */

function setToday() {

    document
        .getElementById("workDate")
        .value =
        new Date().toLocaleDateString(
            "fa-IR"
        );

}


/* =========================================================
   انتخاب ربات
========================================================= */

function selectRobot(robot) {

    currentRobot = robot;

    document
        .getElementById("robotModel")
        .value = robot;


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


    createChecklist([]);

}


/* =========================================================
   ساخت چک لیست
========================================================= */

function createChecklist(saved = []) {

    const container =
        document.getElementById(
            "checklist"
        );

    if (!container) return;

    container.innerHTML = "";


    checklistItems.forEach(
        (item, index) => {

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

            checkbox.type = "checkbox";

            checkbox.value = item;

            checkbox.checked =
                saved.includes(item);


            const text =
                document.createElement(
                    "span"
                );

            text.textContent = item;


            row.appendChild(checkbox);
            row.appendChild(text);

            container.appendChild(row);

        }
    );

}


/* =========================================================
   گرفتن چک لیست
========================================================= */

function getChecklist() {

    return Array.from(
        document.querySelectorAll(
            "#checklist input:checked"
        )
    ).map(
        checkbox => checkbox.value
    );

}


/* =========================================================
   قطعات
========================================================= */

function addPartRow(data = {}) {

    const container =
        document.getElementById(
            "partsRows"
        );

    const row =
        document.createElement(
            "div"
        );

    row.className =
        "part-row";


    const number =
        container.children.length + 1;


    row.innerHTML = `

        <div>
            ${number}
        </div>

        <div>
            <input
                class="part-name"
                type="text"
                value="${escapeAttribute(
                    data.name || ""
                )}"
                placeholder="نام قطعه"
            >
        </div>

        <div>
            <input
                class="part-count"
                type="number"
                min="1"
                value="${data.count || 1}"
            >
        </div>

        <div class="part-description-cell">

            <input
                class="part-description"
                type="text"
                value="${escapeAttribute(
                    data.description || ""
                )}"
                placeholder="توضیحات"
            >

            <button
                type="button"
                class="delete-part"
            >
                ✕
            </button>

        </div>

    `;


    row
        .querySelector(".delete-part")
        .addEventListener(
            "click",
            () => {

                row.remove();

                renumberParts();

            }
        );


    container.appendChild(row);

}


function renumberParts() {

    Array.from(
        document.querySelectorAll(
            "#partsRows .part-row"
        )
    ).forEach(
        (row, index) => {

            row.children[0]
                .textContent =
                index + 1;

        }
    );

}


function renderParts(parts = []) {

    const container =
        document.getElementById(
            "partsRows"
        );

    container.innerHTML = "";

    parts.forEach(addPartRow);

}


function getParts() {

    return Array.from(
        document.querySelectorAll(
            "#partsRows .part-row"
        )
    ).map(row => {

        return {

            name:
                row.querySelector(
                    ".part-name"
                ).value.trim(),

            count:
                row.querySelector(
                    ".part-count"
                ).value,

            description:
                row.querySelector(
                    ".part-description"
                ).value.trim()

        };

    });

}


/* =========================================================
   ذخیره گزارش
========================================================= */

function saveVisit() {

    const centerName =
        getValue("centerName");


    if (!centerName) {

        alert("لطفاً نام مرکز را وارد کنید.");

        return;

    }


    if (!currentRobot) {

        alert("لطفاً مدل دستگاه را انتخاب کنید.");

        return;

    }


    const serial =
        getValue("robotSerial");


    if (!serial) {

        alert(
            "لطفاً شماره سریال دستگاه را وارد کنید."
        );

        return;

    }


    let center =
        currentCenter;


    /*
       اگر مرکز جدید است ولی قبلاً
       با همین نام ثبت شده، همان مرکز
       استفاده می‌شود.
    */

    if (!center) {

        center =
            database.centers.find(
                item =>
                    item.province ===
                    currentProvince &&

                    String(item.name)
                        .trim()
                        .toLowerCase() ===

                    centerName
                        .trim()
                        .toLowerCase()
            );

    }


    if (!center) {

        center = {

            id: Date.now(),

            province:
                currentProvince,

            name:
                centerName,

            phone:
                getValue("centerPhone"),

            address:
                getValue("centerAddress"),

            manager:
                getValue("centerManager"),

            robots: {},

            visits: []

        };


        database.centers.push(center);

    }


    center.name =
        centerName;

    center.phone =
        getValue("centerPhone");

    center.address =
        getValue("centerAddress");

    center.manager =
        getValue("centerManager");


    if (!center.robots) {

        center.robots = {};

    }


    /*
       لینک لیبل = شماره سریال
       دیگر هیچ فیلد جداگانه‌ای ندارد.
    */

    center.robots[currentRobot] = {

        serial: serial

    };


    if (!Array.isArray(center.visits)) {

        center.visits = [];

    }


    const visit = {

        id: Date.now(),

        date:
            new Date().toLocaleString(
                "fa-IR"
            ),

        robot:
            currentRobot,

        robotSerial:
            serial,

        /*
           لینک لیبل مستقیماً
           از شماره سریال گرفته می‌شود.
        */

        labelLink:
            serial,

        problem:
            getValue(
                "problemDescription"
            ),

        parts:
            getParts(),

        checklist:
            getChecklist(),

        extraWork:
            getValue("extraWork"),

        technician:
            getValue("technicianName"),

        workDate:
            getValue("workDate"),

        entryTime:
            getValue("entryTime"),

        exitTime:
            getValue("exitTime"),

        workDescription:
            getValue("workDescription"),

        receiver:
            getValue("receiverName"),

        companyRepresentative:
            getValue(
                "companyRepresentative"
            )

    };


    center.visits.unshift(visit);


    saveDatabase();


    currentCenter = center;


    document
        .getElementById("reportPageTitle")
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

    const container =
        document.getElementById(
            "history"
        );

    if (!container) return;

    container.innerHTML = "";


    if (
        !currentCenter ||
        !currentCenter.visits ||
        !currentCenter.visits.length
    ) {

        container.innerHTML =
            "<p>هنوز گزارشی ثبت نشده است.</p>";

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
                    <strong>دستگاه:</strong>
                    ${escapeHTML(
                        visit.robot
                    )}
                </p>

                <p>
                    <strong>سریال:</strong>
                    ${escapeHTML(
                        visit.robotSerial
                    )}
                </p>

                ${
                    visit.problem
                    ?
                    `
                    <p>
                        <strong>شرح اشکال:</strong><br>
                        ${escapeHTML(
                            visit.problem
                        )}
                    </p>
                    `
                    :
                    ""
                }

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
                    visit.extraWork
                    ?
                    `
                    <p>
                        <strong>توضیحات:</strong><br>
                        ${escapeHTML(
                            visit.extraWork
                        )}
                    </p>
                    `
                    :
                    ""
                }

            `;


            container.appendChild(box);

        }
    );

}


/* =========================================================
   چاپ گزارش
========================================================= */

function printReport() {

    const centerName =
        getValue("centerName");


    if (!centerName) {

        alert("نام مرکز وارد نشده است.");

        return;

    }


    if (!currentRobot) {

        alert("مدل دستگاه انتخاب نشده است.");

        return;

    }


    const serial =
        getValue("robotSerial");


    const province =
        provinces.find(
            item =>
                item[0] === currentProvince
        );


    const checklist =
        getChecklist();


    const parts =
        getParts();


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


    const checklistHTML =
        checklist.length

        ?

        checklist
            .map(
                item =>
                    `<li>☑ ${escapeHTML(item)}</li>`
            )
            .join("")

        :

        "<li>موردی ثبت نشده است.</li>";


    const partsHTML =
        parts.length

        ?

        parts
            .map(
                (part, index) => `

                    <tr>

                        <td>
                            ${index + 1}
                        </td>

                        <td>
                            ${escapeHTML(
                                part.name
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                part.count
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                part.description
                            )}
                        </td>

                    </tr>

                `
            )
            .join("")

        :

        `
            <tr>
                <td>1</td>
                <td></td>
                <td></td>
                <td></td>
            </tr>
        `;


    report.document.write(`

<!DOCTYPE html>

<html lang="fa" dir="rtl">

<head>

<meta charset="UTF-8">

<title>
گزارش نصب، آموزش و خدمات پس از فروش
</title>

<style>

* {
    box-sizing: border-box;
}

body {

    margin: 0;

    padding: 20px;

    font-family:
        Tahoma,
        Arial,
        sans-serif;

    direction: rtl;

    color: #111;

    background: white;

    font-size: 13px;

}

.report {

    max-width: 900px;

    margin: auto;

}

.main-title {

    text-align: center;

    font-size: 22px;

    font-weight: bold;

    margin-bottom: 15px;

}

.blue-title {

    background: #172d78;

    color: white;

    padding: 8px;

    text-align: center;

    font-weight: bold;

    border: 1px solid #172d78;

}

table {

    width: 100%;

    border-collapse: collapse;

}

td,
th {

    border: 1px solid #172d78;

    padding: 8px;

    min-height: 30px;

}

.label {

    font-weight: bold;

    width: 20%;

    background: #f3f5fa;

}

.section {

    margin-top: 14px;

}

.problem {

    min-height: 100px;

    border: 1px solid #172d78;

    padding: 12px;

    white-space: pre-wrap;

}

.services {

    min-height: 150px;

    border: 1px solid #172d78;

    padding: 15px;

}

.services ul {

    line-height: 2;

    margin: 0;

}

.parts th {

    background: #eef1f8;

}

.work {

    min-height: 100px;

}

.signature {

    margin-top: 20px;

}

.signature td {

    height: 100px;

    vertical-align: top;

}

.footer-note {

    margin-top: 20px;

    text-align: center;

    font-size: 10px;

}

@media print {

    body {

        padding: 0;

    }

    .report {

        width: 100%;

    }

}

</style>

</head>

<body>

<div class="report">


<div class="main-title">

    گزارش نصب، آموزش و خدمات پس از فروش

</div>


<div class="blue-title">

    مشخصات بیمارستان / مرکز / صنعت / موسسه ...

</div>


<table>

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
${escapeHTML(
    getValue("workDate")
)}
</td>

</tr>


<tr>

<td class="label">
آدرس
</td>

<td colspan="3">
${escapeHTML(
    getValue("centerAddress")
)}
</td>

</tr>


<tr>

<td class="label">
نام مسئول
</td>

<td>
${escapeHTML(
    getValue("centerManager")
)}
</td>

<td class="label">
تلفن
</td>

<td>
${escapeHTML(
    getValue("centerPhone")
)}
</td>

</tr>

</table>



<div class="section">

<div class="blue-title">

    مشخصات دستگاه

</div>

<table>

<tr>

<td class="label">
دستگاه / سیستم
</td>

<td>
${escapeHTML(currentRobot)}
</td>

<td class="label">
شماره سریال
</td>

<td>
${escapeHTML(serial)}
</td>

</tr>

</table>

</div>



<div class="section">

<div class="blue-title">

    گزارش اشکال دستگاه

</div>

<div class="problem">

${escapeHTML(
    getValue(
        "problemDescription"
    ) ||
    "موردی ثبت نشده است."
)}

</div>

</div>



<div class="section">

<div class="blue-title">

    دستگاه نصب شده / قطعات مصرف شده و موضوع خدمات

</div>

<table class="parts">

<thead>

<tr>

<th>
ردیف
</th>

<th>
نام قطعه
</th>

<th>
تعداد
</th>

<th>
توضیحات
</th>

</tr>

</thead>

<tbody>

${partsHTML}

</tbody>

</table>

</div>



<div class="section">

<div class="blue-title">

    شرح خدمات

</div>

<div class="services">

<ul>

${checklistHTML}

</ul>


${
    getValue("extraWork")
    ?
    `
    <hr>

    <strong>
    توضیحات:
    </strong>

    <p>
    ${escapeHTML(
        getValue("extraWork")
    )}
    </p>
    `
    :
    ""
}

</div>

</div>



<div class="section">

<div class="blue-title">

    ساعت کار

</div>

<table>

<tr>

<th>
نام کارشناس
</th>

<th>
تاریخ
</th>

<th>
ساعت ورود
</th>

<th>
ساعت خروج
</th>

<th>
توضیحات
</th>

</tr>

<tr class="work">

<td>
${escapeHTML(
    getValue(
        "technicianName"
    )
)}
</td>

<td>
${escapeHTML(
    getValue("workDate")
)}
</td>

<td>
${escapeHTML(
    getValue("entryTime")
)}
</td>

<td>
${escapeHTML(
    getValue("exitTime")
)}
</td>

<td>
${escapeHTML(
    getValue(
        "workDescription"
    )
)}
</td>

</tr>

</table>

</div>



<div class="section">

<div class="blue-title">

    تأیید و امضا

</div>

<table class="signature">

<tr>

<td>

نام تحویل‌گیرنده / مسئول فنی:

<br><br>

${escapeHTML(
    getValue(
        "receiverName"
    )
)}

<br><br>

مهر و امضاء

</td>


<td>

نام نماینده شرکت:

<br><br>

${escapeHTML(
    getValue(
        "companyRepresentative"
    )
)}

<br><br>

مهر و امضاء

</td>

</tr>

</table>

</div>



<div class="footer-note">

    شماره سریال دستگاه به عنوان شناسه فایل لیبل ثبت شده است.

</div>


</div>

</body>

</html>

    `);


    report.document.close();


    setTimeout(
        () => report.print(),
        500
    );

}


/* =========================================================
   برگشت
========================================================= */

function backToProvince() {

    document
        .getElementById("centersPage")
        .classList.add("hidden");

    document
        .getElementById("provincePage")
        .classList.remove("hidden");

    currentCenter = null;
    currentRobot = "";

}


/* =========================================================
   برگشت از گزارش
========================================================= */

function backToCenters() {

    document
        .getElementById("reportPage")
        .classList.add("hidden");

    document
        .getElementById("centersPage")
        .classList.remove("hidden");

    currentRobot = "";

    renderCenters();

}


/* =========================================================
   مقدار input
========================================================= */

function getValue(id) {

    const element =
        document.getElementById(id);

    return element
        ? element.value.trim()
        : "";

}


/* =========================================================
   امنیت
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


function escapeAttribute(value) {

    return escapeHTML(value);

}


/* =========================================================
   اتصال دکمه‌ها
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        normalizeDatabase();

        renderProvinces();


        document
            .getElementById(
                "backProvinceBtn"
            )
            .addEventListener(
                "click",
                backToProvince
            );


        document
            .getElementById(
                "backCentersBtn"
            )
            .addEventListener(
                "click",
                backToCenters
            );


        document
            .getElementById(
                "newCenterBtn"
            )
            .addEventListener(
                "click",
                newCenter
            );


        document
            .getElementById(
                "centerSearch"
            )
            .addEventListener(
                "input",
                renderCenters
            );


        document
            .getElementById(
                "saveVisitBtn"
            )
            .addEventListener(
                "click",
                saveVisit
            );


        document
            .getElementById(
                "printReportBtn"
            )
            .addEventListener(
                "click",
                printReport
            );


        document
            .getElementById(
                "addPartBtn"
            )
            .addEventListener(
                "click",
                () => addPartRow()
            );


        document
            .querySelectorAll(
                ".robot-card"
            )
            .forEach(
                card => {

                    card.addEventListener(
                        "click",
                        () =>
                            selectRobot(
                                card.dataset.robot
                            )
                    );

                }
            );

    }
);
