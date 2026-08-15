/* =====================================================
   تنظیمات
===================================================== */

const STORAGE_KEY = "center_management_data";

const PASSWORD = "0111";

const LOCK_TIME = 30 * 60 * 1000;

let database =
    JSON.parse(
        localStorage.getItem(STORAGE_KEY)
    ) || {
        centers: []
    };

let currentProvince = "";

let currentCenter = null;

let currentRobot = "";


/* =====================================================
   استان‌ها
   تهران عمداً اول است
===================================================== */

const provinces = [
    ["tehran", "تهران"],
    ["alborz", "البرز"],
    ["qom", "قم"],
    ["qazvin", "قزوین"],
    ["gilan", "گیلان"],
    ["mazandaran", "مازندران"],
    ["golestan", "گلستان"],
    ["semnan", "سمنان"],
    ["markazi", "مرکزی"],
    ["isfahan", "اصفهان"],
    ["fars", "فارس"],
    ["kerman", "کرمان"],
    ["yazd", "یزد"],
    ["hormozgan", "هرمزگان"],
    ["bushehr", "بوشهر"],
    ["khuzestan", "خوزستان"],
    ["lorestan", "لرستان"],
    ["hamadan", "همدان"],
    ["kermanshah", "کرمانشاه"],
    ["kurdistan", "کردستان"],
    ["ilam", "ایلام"],
    ["zanjan", "زنجان"],
    ["ardabil", "اردبیل"],
    ["azerbaijan-east", "آذربایجان شرقی"],
    ["azerbaijan-west", "آذربایجان غربی"],
    ["khorasan-razavi", "خراسان رضوی"],
    ["khorasan-north", "خراسان شمالی"],
    ["khorasan-south", "خراسان جنوبی"],
    ["sistan-baluchestan", "سیستان و بلوچستان"],
    ["chahar-mahaal-bakhtiari", "چهارمحال و بختیاری"],
    ["kohgiluyeh-boyer-ahmad", "کهگیلویه و بویراحمد"]
];


/* =====================================================
   چک لیست ثابت
===================================================== */

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


/* =====================================================
   ذخیره
===================================================== */

function saveDatabase() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(database)
    );

}


/* =====================================================
   ورود
===================================================== */

function checkLoginLock() {

    const lockUntil =
        Number(
            localStorage.getItem(
                "login_lock_until"
            )
        ) || 0;

    if (Date.now() < lockUntil) {

        showLockMessage(
            lockUntil
        );

        return true;
    }

    return false;
}


function showLockMessage(lockUntil) {

    const message =
        document.getElementById(
            "loginMessage"
        );

    if (!message) return;

    function update() {

        const remaining =
            lockUntil - Date.now();

        if (remaining <= 0) {

            localStorage.removeItem(
                "login_lock_until"
            );

            localStorage.removeItem(
                "login_attempts"
            );

            message.textContent =
                "";

            return;
        }

        const minutes =
            Math.floor(
                remaining / 60000
            );

        const seconds =
            Math.floor(
                (remaining % 60000) / 1000
            );

        message.textContent =
            "سیستم قفل است. " +
            minutes +
            ":" +
            String(seconds).padStart(2, "0") +
            " دیگر امتحان کنید.";

        setTimeout(
            update,
            1000
        );
    }

    update();
}


function login() {

    if (checkLoginLock()) {
        return;
    }

    const input =
        document.getElementById(
            "passwordInput"
        );

    const message =
        document.getElementById(
            "loginMessage"
        );

    if (
        input.value === PASSWORD
    ) {

        localStorage.removeItem(
            "login_attempts"
        );

        document
            .getElementById("loginPage")
            .classList.add("hidden");

        document
            .getElementById("app")
            .classList.remove("hidden");

        renderProvinces();

        return;
    }


    let attempts =
        Number(
            localStorage.getItem(
                "login_attempts"
            )
        ) || 0;

    attempts++;

    localStorage.setItem(
        "login_attempts",
        attempts
    );


    if (attempts >= 3) {

        const lockUntil =
            Date.now() + LOCK_TIME;

        localStorage.setItem(
            "login_lock_until",
            lockUntil
        );

        message.textContent =
            "۳ بار رمز اشتباه وارد شد. سیستم برای ۳۰ دقیقه قفل شد.";

        showLockMessage(
            lockUntil
        );

        input.value = "";

        return;
    }


    message.textContent =
        "رمز اشتباه است. " +
        (3 - attempts) +
        " فرصت باقی مانده.";

    input.value = "";
}


/* =====================================================
   نمایش استان‌ها
===================================================== */

function renderProvinces() {

    const grid =
        document.getElementById(
            "provinceGrid"
        );

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


/* =====================================================
   استان
===================================================== */

function openProvince(
    key,
    name
) {

    currentProvince =
        key;

    currentCenter =
        null;

    currentRobot =
        "";

    document
        .getElementById(
            "provincePage"
        )
        .classList.add("hidden");

    document
        .getElementById(
            "centerPage"
        )
        .classList.add("hidden");

    document
        .getElementById(
            "centersPage"
        )
        .classList.remove("hidden");

    document
        .getElementById(
            "provinceTitle"
        )
        .textContent =
        "مراکز " + name;

    document
        .getElementById(
            "centerSearch"
        )
        .value = "";

    renderCenters();
}


/* =====================================================
   مراکز
===================================================== */

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
        );

    const query =
        search.value
            .trim()
            .toLowerCase();


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

                    return center.name
                        .toLowerCase()
                        .includes(query);

                }
            );

    }


    if (!centers.length) {

        empty.classList.remove(
            "hidden"
        );

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


            const title =
                document.createElement(
                    "h3"
                );

            title.textContent =
                center.name;


            const manager =
                document.createElement(
                    "p"
                );

            manager.textContent =
                "مسئول: " +
                (
                    center.manager ||
                    "ثبت نشده"
                );


            const button =
                document.createElement(
                    "button"
                );

            button.className =
                "btn btn-blue full-btn";

            button.textContent =
                "باز کردن مرکز";


            button.addEventListener(
                "click",
                function() {

                    openCenter(
                        center
                    );

                }
            );


            box.appendChild(
                title
            );

            box.appendChild(
                manager
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


/* =====================================================
   مرکز جدید
===================================================== */

function newCenter() {

    currentCenter =
        null;

    currentRobot =
        "";

    showCenterPage();

    clearCenterForm();
}


/* =====================================================
   باز کردن مرکز
===================================================== */

function openCenter(center) {

    currentCenter =
        center;

    currentRobot =
        "";

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

    updateLabelLink();
}


/* =====================================================
   صفحه مرکز
===================================================== */

function showCenterPage() {

    document
        .getElementById(
            "provincePage"
        )
        .classList.add("hidden");

    document
        .getElementById(
            "centersPage"
        )
        .classList.add("hidden");

    document
        .getElementById(
            "centerPage"
        )
        .classList.remove("hidden");


    document
        .getElementById(
            "centerPageTitle"
        )
        .textContent =
        currentCenter
            ? currentCenter.name
            : "ثبت مرکز جدید";


    createChecklist();
}


/* =====================================================
   پاک کردن فرم
===================================================== */

function clearCenterForm() {

    document.getElementById(
        "centerName"
    ).value = "";

    document.getElementById(
        "centerPhone"
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

    document.getElementById(
        "labelLinkBox"
    ).innerHTML = "";

    document.getElementById(
        "history"
    ).innerHTML =
        "<p>هنوز گزارشی ثبت نشده است.</p>";

    createChecklist();
}


/* =====================================================
   انتخاب ربات
===================================================== */

function selectRobot(robot) {

    currentRobot =
        robot;


    document
        .querySelectorAll(
            ".robot-card"
        )
        .forEach(
            function(card) {

                card.classList.toggle(
                    "selected",
                    card.dataset.robot ===
                    robot
                );

            }
        );


    document
        .getElementById(
            "robotModel"
        )
        .value =
        robot;


    let info = null;


    if (
        currentCenter &&
        currentCenter.robots &&
        currentCenter.robots[robot]
    ) {

        info =
            currentCenter.robots[
                robot
            ];

    }


    document
        .getElementById(
            "robotSerial"
        )
        .value =
        info?.serial || "";


    createChecklist(
        info?.checklist || []
    );


    updateLabelLink();
}


/* =====================================================
   چک لیست
===================================================== */

function createChecklist(
    saved = []
) {

    const container =
        document.getElementById(
            "checklist"
        );

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
                "check_" + index;

            checkbox.value =
                item;


            checkbox.checked =
                saved.includes(
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


/* =====================================================
   چک‌های انتخاب شده
===================================================== */

function getChecklist() {

    const result = [];

    document
        .querySelectorAll(
            "#checklist input:checked"
        )
        .forEach(
            function(input) {

                result.push(
                    input.value
                );

            }
        );

    return result;
}


/* =====================================================
   لینک لیبل
   شماره سریال = لینک
===================================================== */

function updateLabelLink() {

    const box =
        document.getElementById(
            "labelLinkBox"
        );

    const serial =
        document
            .getElementById(
                "robotSerial"
            )
            .value
            .trim();


    if (!serial) {

        box.innerHTML =
            "<span class='info-text'>شماره سریال وارد نشده است.</span>";

        return;
    }


    /*
       لینک لیبل را اینجا می‌سازیم.
       اگر آدرس سرور لیبلت متفاوت است،
       فقط این خط را تغییر بده.
    */

    const url =
        "labels/" +
        encodeURIComponent(
            serial
        ) +
        ".pdf";


    box.innerHTML = `

        <div class="label-box">

            <span>شماره سریال:</span>

            <strong>
                ${escapeHTML(serial)}
            </strong>

            <a
                href="${url}"
                target="_blank"
            >
                دانلود لیبل
            </a>

        </div>

    `;
}


/* =====================================================
   ذخیره گزارش
===================================================== */

function saveVisit() {

    const name =
        document
            .getElementById(
                "centerName"
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
                            .toLowerCase() ===
                        name.toLowerCase()
                    );

                }
            );

    }


    if (!center) {

        center = {

            id: Date.now(),

            province:
                currentProvince,

            name: name,

            phone:
                document.getElementById(
                    "centerPhone"
                ).value.trim(),

            manager:
                document.getElementById(
                    "centerManager"
                ).value.trim(),

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

    center.name =
        name;

    center.phone =
        document.getElementById(
            "centerPhone"
        ).value.trim();

    center.manager =
        document.getElementById(
            "centerManager"
        ).value.trim();


    if (!center.robots) {
        center.robots = {};
    }


    const serial =
        document
            .getElementById(
                "robotSerial"
            )
            .value
            .trim();


    const checklist =
        getChecklist();


    center.robots[
        currentRobot
    ] = {

        serial:
            serial,

        checklist:
            checklist

    };


    /*
       گزارش این مراجعه
    */

    const visit = {

        id: Date.now(),

        date:
            new Date()
                .toLocaleString(
                    "fa-IR"
                ),

        robot:
            currentRobot,

        serial:
            serial,

        checklist:
            checklist,

        extraWork:
            document
                .getElementById(
                    "extraWork"
                )
                .value
                .trim()

    };


    if (!Array.isArray(center.visits)) {
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


    updateLabelLink();

    renderHistory();


    alert(
        "گزارش با موفقیت ذخیره شد."
    );
}


/* =====================================================
   سوابق
===================================================== */

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
            "<p>هنوز گزارشی ثبت نشده است.</p>";

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


            const title =
                document.createElement(
                    "h3"
                );

            title.textContent =
                "📅 " +
                visit.date;


            const robot =
                document.createElement(
                    "p"
                );

            robot.textContent =
                "ربات: " +
                visit.robot;


            const serial =
                document.createElement(
                    "p"
                );

            serial.textContent =
                "Serial: " +
                (
                    visit.serial ||
                    "ثبت نشده"
                );


            const list =
                document.createElement(
                    "ul"
                );


            (
                visit.checklist || []
            ).forEach(
                function(item) {

                    const li =
                        document.createElement(
                            "li"
                        );

                    li.textContent =
                        "✓ " + item;

                    list.appendChild(
                        li
                    );

                }
            );


            box.appendChild(
                title
            );

            box.appendChild(
                robot
            );

            box.appendChild(
                serial
            );

            box.appendChild(
                list
            );


            if (visit.extraWork) {

                const extra =
                    document.createElement(
                        "p"
                    );

                extra.textContent =
                    "کار متفرقه: " +
                    visit.extraWork;

                box.appendChild(
                    extra
                );
            }


            history.appendChild(
                box
            );

        }
    );
}


/* =====================================================
   PDF
===================================================== */

function printReport() {

    const centerName =
        document
            .getElementById(
                "centerName"
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


    const phone =
        document
            .getElementById(
                "centerPhone"
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


    const checks =
        getChecklist();


    if (!centerName) {

        alert(
            "نام مرکز وارد نشده است."
        );

        return;
    }


    if (!currentRobot) {

        alert(
            "مدل ربات انتخاب نشده است."
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


    const listHTML =
        checks.length

        ?

        checks
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
    padding: 30px;
    color: #111;
}

h1 {
    text-align: center;
}

.box {
    border: 1px solid #888;
    border-radius: 10px;
    padding: 18px;
    margin-bottom: 20px;
}

table {
    width: 100%;
    border-collapse: collapse;
}

td {
    border: 1px solid #aaa;
    padding: 10px;
}

ul {
    line-height: 2;
}

</style>

</head>

<body>

<h1>گزارش کار مرکز</h1>

<div class="box">

<h2>اطلاعات مرکز</h2>

<table>

<tr>
<td>استان</td>
<td>
${escapeHTML(
    getProvinceName(
        currentProvince
    )
)}
</td>
</tr>

<tr>
<td>نام مرکز</td>
<td>${escapeHTML(centerName)}</td>
</tr>

<tr>
<td>مسئول</td>
<td>${escapeHTML(manager)}</td>
</tr>

<tr>
<td>شماره تماس</td>
<td>${escapeHTML(phone)}</td>
</tr>

<tr>
<td>تاریخ</td>
<td>
${new Date().toLocaleString("fa-IR")}
</td>
</tr>

</table>

</div>


<div class="box">

<h2>اطلاعات دستگاه</h2>

<table>

<tr>
<td>مدل ربات</td>
<td>${escapeHTML(currentRobot)}</td>
</tr>

<tr>
<td>شماره سریال</td>
<td>${escapeHTML(serial)}</td>
</tr>

</table>

</div>


<div class="box">

<h2>کارهای انجام‌شده</h2>

<ul>

${listHTML}

</ul>

</div>


<div class="box">

<h2>کارهای متفرقه</h2>

<p>
${escapeHTML(
    document
        .getElementById(
            "extraWork"
        )
        .value
        .trim() ||
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


/* =====================================================
   نام استان
===================================================== */

function getProvinceName(
    key
) {

    const item =
        provinces.find(
            p => p[0] === key
        );

    return item
        ? item[1]
        : "";
}


/* =====================================================
   امنیت HTML
===================================================== */

function escapeHTML(value) {

    return String(
        value || ""
    )
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


/* =====================================================
   دکمه‌ها
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        /*
           ورود
        */

        document
            .getElementById(
                "loginBtn"
            )
            .addEventListener(
                "click",
                login
            );


        document
            .getElementById(
                "passwordInput"
            )
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
           اگر هنوز قفل است
        */

        checkLoginLock();


        /*
           مرکز جدید
        */

        document
            .getElementById(
                "newCenterBtn"
            )
            .addEventListener(
                "click",
                newCenter
            );


        /*
           برگشت استان
        */

        document
            .getElementById(
                "backProvinceBtn"
            )
            .addEventListener(
                "click",
                function() {

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

                }
            );


        /*
           برگشت مراکز
        */

        document
            .getElementById(
                "backCentersBtn"
            )
            .addEventListener(
                "click",
                function() {

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

                    renderCenters();

                }
            );


        /*
           جستجو
        */

        document
            .getElementById(
                "centerSearch"
            )
            .addEventListener(
                "input",
                renderCenters
            );


        /*
           ربات‌ها
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
                                card.dataset.robot
                            );

                        }
                    );

                }
            );


        /*
           تغییر شماره سریال
        */

        document
            .getElementById(
                "robotSerial"
            )
            .addEventListener(
                "input",
                updateLabelLink
            );


        /*
           ذخیره
        */

        document
            .getElementById(
                "saveVisitBtn"
            )
            .addEventListener(
                "click",
                saveVisit
            );


        /*
           گزارش
        */

        document
            .getElementById(
                "printReportBtn"
            )
            .addEventListener(
                "click",
                printReport
            );

    }
);
