/* =========================================================
   مدیریت مراکز و ربات‌ها
   نسخه بدون نقشه
========================================================= */


const STORAGE_KEY = "center_management_data";


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
   وضعیت فعلی
========================================================= */

let currentProvince = "";

let currentCenter = null;

let currentRobot = "";


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
        key: "chahar-mahaal-bakhtiari",
        name: "چهارمحال و بختیاری"
    },

    {
        key: "khorasan-south",
        name: "خراسان جنوبی"
    },

    {
        key: "khorasan-north",
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
        key: "sistan-baluchestan",
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
        key: "kohgiluyeh-boyer-ahmad",
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
        key: "hamadan",
        name: "همدان"
    },

    {
        key: "yazd",
        name: "یزد"
    },

    {
        key: "ilam",
        name: "ایلام"
    }

];


/* =========================================================
   نام استان
========================================================= */

const provinceNames = {};

provinces.forEach(function(province) {

    provinceNames[
        province.key
    ] = province.name;

});


/* =========================================================
   چک لیست
========================================================= */

const checklists = {

    "4102": [

        "بررسی سیستم",
        "نصب ویندوز",
        "نصب درایورها",
        "تنظیم شبکه",
        "تنظیم IP",
        "تنظیم MAC",
        "نصب نرم‌افزارهای موردنیاز",
        "تنظیم نرم‌افزار ربات",
        "تست ربات",
        "تست رایت",
        "تست نهایی"

    ],


    "4202": [

        "بررسی سیستم",
        "نصب ویندوز",
        "نصب درایورها",
        "تنظیم شبکه",
        "تنظیم IP",
        "تنظیم MAC",
        "نصب نرم‌افزارهای موردنیاز",
        "تنظیم نرم‌افزار ربات",
        "تست ربات",
        "تست رایت",
        "تست نهایی"

    ],


    "Rimage": [

        "بررسی سیستم",
        "نصب ویندوز",
        "نصب درایورها",
        "تنظیم شبکه",
        "تنظیم IP",
        "تنظیم MAC",
        "نصب نرم‌افزارهای موردنیاز",
        "نصب نرم‌افزار Rimage",
        "تست ربات",
        "تست رایت",
        "تست نهایی"

    ]

};


/* =========================================================
   ذخیره دیتابیس
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
   ساخت لیست استان‌ها
========================================================= */

function renderProvinces() {

    const grid =
        document.getElementById(
            "provincesGrid"
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


            button.innerHTML = `

                <div class="province-icon">
                    🏛️
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

    if (
        !provinceNames[
            provinceKey
        ]
    ) {

        return;

    }


    currentProvince =
        provinceKey;


    currentCenter = null;

    currentRobot = "";


    document
        .getElementById(
            "provinceListPage"
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
            "provincePage"
        )
        .classList.remove(
            "hidden"
        );


    document
        .getElementById(
            "provinceTitle"
        )
        .textContent =
        "مراکز " +
        provinceNames[
            provinceKey
        ];


    const search =
        document.getElementById(
            "provinceCenterSearch"
        );


    if (search) {

        search.value = "";

    }


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


    const searchElement =
        document.getElementById(
            "provinceCenterSearch"
        );


    const query =
        (
            searchElement
                ? searchElement.value
                : ""
        )
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

                    return String(
                        center.name || ""
                    )
                    .toLowerCase()
                    .includes(query);

                }
            );

    }


    if (!centers.length) {

        empty.style.display =
            "block";


        empty.textContent =
            query
                ? "مرکزی با این نام پیدا نشد."
                : "هنوز مرکزی برای این استان ثبت نشده است.";


        return;

    }


    empty.style.display =
        "none";


    centers.forEach(
        function(center) {

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
                    ${escapeHTML(
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
                    type="button"
                    class="btn btn-blue center-open-btn"
                >
                    باز کردن مرکز
                </button>

            `;


            const button =
                card.querySelector(
                    ".center-open-btn"
                );


            button.addEventListener(
                "click",
                function() {

                    openCenter(
                        center
                    );

                }
            );


            grid.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   مرکز جدید
========================================================= */

function newCenter() {

    if (!currentProvince) {

        alert(
            "ابتدا استان را انتخاب کنید."
        );

        return;

    }


    currentCenter = null;

    currentRobot = "";


    showCenterPage();

    clearCenterForm();


    document
        .getElementById(
            "centerName"
        )
        .focus();

}


/* =========================================================
   نمایش صفحه مرکز
========================================================= */

function showCenterPage() {

    document
        .getElementById(
            "provinceListPage"
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
            "pageTitle"
        )
        .textContent =
        currentCenter
            ? currentCenter.name
            : "ثبت مرکز جدید";


    createChecklist();

}


/* =========================================================
   باز کردن مرکز موجود
========================================================= */

function openCenter(center) {

    currentCenter =
        center;


    currentRobot = "";


    showCenterPage();


    document
        .getElementById(
            "pageTitle"
        )
        .textContent =
        center.name || "مرکز";


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
            "labelLink"
        )
        .value =
        center.labelLink || "";


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
            "robotIP"
        )
        .value = "";


    document
        .getElementById(
            "robotMAC"
        )
        .value = "";


    document
        .getElementById(
            "extraWork"
        )
        .value = "";


    document
        .querySelectorAll(
            ".robot-card"
        )
        .forEach(
            function(card) {

                card.classList.remove(
                    "selected"
                );

            }
        );


    createChecklist();

    renderHistory();

}


/* =========================================================
   انتخاب ربات
========================================================= */

function selectRobot(robot) {

    currentRobot =
        robot;


    document
        .getElementById(
            "robotModel"
        )
        .value =
        robot;


    document
        .querySelectorAll(
            ".robot-card"
        )
        .forEach(
            function(card) {

                card.classList.remove(
                    "selected"
                );


                if (
                    card.dataset.robot ===
                    robot
                ) {

                    card.classList.add(
                        "selected"
                    );

                }

            }
        );


    if (
        currentCenter &&
        currentCenter.robots &&
        currentCenter.robots[robot]
    ) {

        const info =
            currentCenter.robots[
                robot
            ];


        document
            .getElementById(
                "robotSerial"
            )
            .value =
            info.serial || "";


        document
            .getElementById(
                "robotIP"
            )
            .value =
            info.ip || "";


        document
            .getElementById(
                "robotMAC"
            )
            .value =
            info.mac || "";

    } else {

        document
            .getElementById(
                "robotSerial"
            )
            .value = "";


        document
            .getElementById(
                "robotIP"
            )
            .value = "";


        document
            .getElementById(
                "robotMAC"
            )
            .value = "";

    }


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


    const list =
        checklists[
            currentRobot
        ] || [];


    list.forEach(
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

function getChecklistValues() {

    const items = [];


    document
        .querySelectorAll(
            "#checklist input[type='checkbox']"
        )
        .forEach(
            function(checkbox) {

                if (
                    checkbox.checked
                ) {

                    items.push(
                        checkbox.value
                    );

                }

            }
        );


    return items;

}


/* =========================================================
   گرفتن مقدار فرم
========================================================= */

function getValue(id) {

    const element =
        document.getElementById(
            id
        );


    return element
        ? element.value.trim()
        : "";

}


/* =========================================================
   اطلاعات فرم
========================================================= */

function getFormData() {

    return {

        centerName:
            getValue(
                "centerName"
            ),

        centerPhone:
            getValue(
                "centerPhone"
            ),

        centerAddress:
            getValue(
                "centerAddress"
            ),

        centerManager:
            getValue(
                "centerManager"
            ),

        labelLink:
            getValue(
                "labelLink"
            ),

        robotModel:
            getValue(
                "robotModel"
            ),

        robotSerial:
            getValue(
                "robotSerial"
            ),

        robotIP:
            getValue(
                "robotIP"
            ),

        robotMAC:
            getValue(
                "robotMAC"
            ),

        checklist:
            getChecklistValues(),

        extraWork:
            getValue(
                "extraWork"
            )

    };

}


/* =========================================================
   ذخیره مراجعه
========================================================= */

function saveVisit() {

    const data =
        getFormData();


    if (!currentProvince) {

        alert(
            "استان مشخص نشده است."
        );

        return;

    }


    if (!data.centerName) {

        alert(
            "لطفاً نام مرکز را وارد کنید."
        );

        return;

    }


    if (!currentRobot) {

        alert(
            "لطفاً ابتدا مدل ربات را انتخاب کنید."
        );

        return;

    }


    let center =
        currentCenter;


    /*
       اگر مرکز جدید است،
       بررسی می‌کنیم قبلاً با همین نام
       در همین استان ثبت نشده باشد.
    */

    if (!center) {

        center =
            database.centers.find(
                function(item) {

                    return (

                        item.province ===
                        currentProvince

                        &&

                        String(
                            item.name || ""
                        )
                        .trim()
                        .toLowerCase()

                        ===

                        data.centerName
                            .trim()
                            .toLowerCase()

                    );

                }
            );

    }


    /*
       ساخت مرکز جدید
    */

    if (!center) {

        center = {

            id:
                Date.now(),

            province:
                currentProvince,

            name:
                data.centerName,

            phone:
                data.centerPhone,

            address:
                data.centerAddress,

            manager:
                data.centerManager,

            labelLink:
                data.labelLink,

            robots: {},

            visits: []

        };


        database.centers.push(
            center
        );

    }


    /*
       اطلاعات عمومی مرکز
    */

    center.province =
        currentProvince;


    center.name =
        data.centerName;


    center.phone =
        data.centerPhone;


    center.address =
        data.centerAddress;


    center.manager =
        data.centerManager;


    center.labelLink =
        data.labelLink;


    /*
       اطلاعات ربات
    */

    if (!center.robots) {

        center.robots = {};

    }


    center.robots[
        currentRobot
    ] = {

        serial:
            data.robotSerial,

        ip:
            data.robotIP,

        mac:
            data.robotMAC

    };


    /*
       مراجعه جدید
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

        checklist:
            data.checklist,

        extraWork:
            data.extraWork,

        robotInfo: {

            serial:
                data.robotSerial,

            ip:
                data.robotIP,

            mac:
                data.robotMAC

        }

    };


    center.visits.unshift(
        visit
    );


    saveDatabase();


    currentCenter =
        center;


    document
        .getElementById(
            "pageTitle"
        )
        .textContent =
        center.name;


    renderHistory();


    alert(
        "اطلاعات مرکز و گزارش مراجعه ذخیره شد."
    );

}


/* =========================================================
   نمایش سوابق
========================================================= */

function renderHistory() {

    const history =
        document.getElementById(
            "history"
        );


    if (!history) {

        return;

    }


    history.innerHTML = "";


    if (!currentCenter) {

        history.innerHTML =
            "<p>مرکز جدید است؛ هنوز سابقه‌ای ثبت نشده.</p>";

        return;

    }


    const visits =
        currentCenter.visits || [];


    if (!visits.length) {

        history.innerHTML =
            "<p>هنوز مراجعه‌ای ثبت نشده است.</p>";

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


            const title =
                document.createElement(
                    "h3"
                );


            title.textContent =
                "📅 " +
                visit.date;


            box.appendChild(
                title
            );


            const robot =
                document.createElement(
                    "p"
                );


            robot.innerHTML =
                "<strong>ربات:</strong> " +
                escapeHTML(
                    visit.robot
                );


            box.appendChild(
                robot
            );


            const work =
                document.createElement(
                    "p"
                );


            work.innerHTML =
                "<strong>کارهای انجام‌شده:</strong>";


            box.appendChild(
                work
            );


            const list =
                document.createElement(
                    "ul"
                );


            (
                visit.checklist || []
            )
            .forEach(
                function(item) {

                    const li =
                        document.createElement(
                            "li"
                        );


                    li.textContent =
                        item;


                    list.appendChild(
                        li
                    );

                }
            );


            box.appendChild(
                list
            );


            if (
                visit.extraWork
            ) {

                const extra =
                    document.createElement(
                        "p"
                    );


                extra.innerHTML =
                    "<strong>کار متفرقه:</strong><br>" +
                    escapeHTML(
                        visit.extraWork
                    );


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


/* =========================================================
   پاک کردن فرم
========================================================= */

function clearCenterForm() {

    document
        .getElementById(
            "centerName"
        )
        .value = "";


    document
        .getElementById(
            "centerPhone"
        )
        .value = "";


    document
        .getElementById(
            "centerAddress"
        )
        .value = "";


    document
        .getElementById(
            "centerManager"
        )
        .value = "";


    document
        .getElementById(
            "labelLink"
        )
        .value = "";


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
            "robotIP"
        )
        .value = "";


    document
        .getElementById(
            "robotMAC"
        )
        .value = "";


    document
        .getElementById(
            "extraWork"
        )
        .value = "";


    document
        .getElementById(
            "history"
        )
        .innerHTML =
        "<p>مرکز جدید است؛ هنوز سابقه‌ای ثبت نشده.</p>";


    document
        .querySelectorAll(
            ".robot-card"
        )
        .forEach(
            function(card) {

                card.classList.remove(
                    "selected"
                );

            }
        );


    createChecklist();

}


/* =========================================================
   برگشت به لیست استان‌ها
========================================================= */

function backToProvinceList() {

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
            "provinceListPage"
        )
        .classList.remove(
            "hidden"
        );


    currentProvince = "";

    currentCenter = null;

    currentRobot = "";

}


/* =========================================================
   برگشت به مراکز استان
========================================================= */

function backToProvince() {

    document
        .getElementById(
            "centerPage"
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


    currentCenter = null;

    currentRobot = "";


    renderCenters();

}


/* =========================================================
   گزارش چاپ / PDF
========================================================= */

function printReport() {

    const data =
        getFormData();


    if (!data.centerName) {

        alert(
            "ابتدا نام مرکز را وارد کنید."
        );

        return;

    }


    if (!currentRobot) {

        alert(
            "ابتدا مدل ربات را انتخاب کنید."
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
            "مرورگر اجازه باز کردن پنجره گزارش را نداده است."
        );

        return;

    }


    const checklistHTML =
        data.checklist.length

        ?

        data.checklist
            .map(
                function(item) {

                    return `
                        <li>
                            ☑ ${escapeHTML(item)}
                        </li>
                    `;

                }
            )
            .join("")

        :

        "<li>موردی ثبت نشده است.</li>";


    const provinceName =
        provinceNames[
            currentProvince
        ] || "";


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

body {

    font-family:
        Tahoma,
        Arial,
        sans-serif;

    direction:
        rtl;

    padding:
        30px;

    color:
        #111;

}

h1 {

    text-align:
        center;

    margin-bottom:
        30px;

}

.box {

    border:
        1px solid #888;

    padding:
        15px;

    margin-bottom:
        20px;

    border-radius:
        8px;

}

table {

    width:
        100%;

    border-collapse:
        collapse;

}

td {

    border:
        1px solid #999;

    padding:
        8px;

}

ul {

    line-height:
        2;

}

</style>

</head>

<body>


<h1>
گزارش کار مرکز
</h1>


<div class="box">

<h2>
اطلاعات مرکز
</h2>

<table>

<tr>

<td>
استان
</td>

<td>
${escapeHTML(
    provinceName
)}
</td>

</tr>


<tr>

<td>
نام مرکز
</td>

<td>
${escapeHTML(
    data.centerName
)}
</td>

</tr>


<tr>

<td>
شماره تماس
</td>

<td>
${escapeHTML(
    data.centerPhone
)}
</td>

</tr>


<tr>

<td>
مسئول
</td>

<td>
${escapeHTML(
    data.centerManager
)}
</td>

</tr>


<tr>

<td>
آدرس
</td>

<td>
${escapeHTML(
    data.centerAddress
)}
</td>

</tr>


<tr>

<td>
تاریخ
</td>

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

<h2>
اطلاعات ربات
</h2>

<table>

<tr>

<td>
مدل
</td>

<td>
${escapeHTML(
    data.robotModel
)}
</td>

</tr>


<tr>

<td>
Serial Number
</td>

<td>
${escapeHTML(
    data.robotSerial
)}
</td>

</tr>


<tr>

<td>
IP Address
</td>

<td>
${escapeHTML(
    data.robotIP
)}
</td>

</tr>


<tr>

<td>
MAC Address
</td>

<td>
${escapeHTML(
    data.robotMAC
)}
</td>

</tr>

</table>

</div>


<div class="box">

<h2>
کارهای انجام‌شده
</h2>

<ul>

${checklistHTML}

</ul>

</div>


<div class="box">

<h2>
کارهای متفرقه
</h2>

<p>

${escapeHTML(
    data.extraWork ||
    "موردی ثبت نشده است."
)}

</p>

</div>


<div class="box">

<h2>
فایل لیبل
</h2>

${
    data.labelLink

    ?

    `
        <a
            href="${escapeHTML(
                data.labelLink
            )}"
            target="_blank"
        >
            مشاهده / دانلود فایل لیبل
        </a>
    `

    :

    "لینک فایل لیبل ثبت نشده است."
}

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
   جلوگیری از HTML ناخواسته
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


        /*
           ساخت استان‌ها
        */

        renderProvinces();


        /*
           مرکز جدید
        */

        const newCenterBtn =
            document.getElementById(
                "newCenterBtn"
            );


        if (newCenterBtn) {

            newCenterBtn.addEventListener(
                "click",
                newCenter
            );

        }


        /*
           برگشت به لیست استان‌ها
        */

        const backProvinceListBtn =
            document.getElementById(
                "backProvinceListBtn"
            );


        if (backProvinceListBtn) {

            backProvinceListBtn.addEventListener(
                "click",
                backToProvinceList
            );

        }


        /*
           برگشت به مراکز
        */

        const backProvinceBtn =
            document.getElementById(
                "backProvinceBtn"
            );


        if (backProvinceBtn) {

            backProvinceBtn.addEventListener(
                "click",
                backToProvince
            );

        }


        /*
           جستجوی مرکز
        */

        const search =
            document.getElementById(
                "provinceCenterSearch"
            );


        if (search) {

            search.addEventListener(
                "input",
                renderCenters
            );

        }


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
           ذخیره مراجعه
        */

        const saveBtn =
            document.getElementById(
                "saveVisitBtn"
            );


        if (saveBtn) {

            saveBtn.addEventListener(
                "click",
                saveVisit
            );

        }


        /*
           گزارش PDF
        */

        const printBtn =
            document.getElementById(
                "printReportBtn"
            );


        if (printBtn) {

            printBtn.addEventListener(
                "click",
                printReport
            );

        }

    }
);
