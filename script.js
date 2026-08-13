/* =========================================================
   مدیریت مراکز و ربات‌ها
   نسخه هماهنگ با index.html
========================================================= */


/* =========================================================
   تنظیمات
========================================================= */

const STORAGE_KEY = "center_management_data";

const MAP_FILE = "iranmap.html";


/* =========================================================
   دیتابیس
========================================================= */

let database = JSON.parse(
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
   نام فارسی استان‌ها
========================================================= */

const provinceNames = {

    "azerbaijan-east": "آذربایجان شرقی",

    "azerbaijan-west": "آذربایجان غربی",

    "ardabil": "اردبیل",

    "isfahan": "اصفهان",

    "alborz": "البرز",

    "ilam": "ایلام",

    "bushehr": "بوشهر",

    "tehran": "تهران",

    "chahar-mahaal-bakhtiari":
        "چهارمحال و بختیاری",

    "khorasan-south":
        "خراسان جنوبی",

    "khorasan-razavi":
        "خراسان رضوی",

    "khorasan-north":
        "خراسان شمالی",

    "khuzestan": "خوزستان",

    "zanjan": "زنجان",

    "semnan": "سمنان",

    "sistan-baluchestan":
        "سیستان و بلوچستان",

    "fars": "فارس",

    "qazvin": "قزوین",

    "qom": "قم",

    "kurdistan": "کردستان",

    "kerman": "کرمان",

    "kermanshah": "کرمانشاه",

    "kohgiluyeh-boyer-ahmad":
        "کهگیلویه و بویراحمد",

    "golestan": "گلستان",

    "gilan": "گیلان",

    "lorestan": "لرستان",

    "mazandaran": "مازندران",

    "markazi": "مرکزی",

    "hormozgan": "هرمزگان",

    "hamadan": "همدان",

    "yazd": "یزد"

};


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
   اطمینان از سالم بودن دیتابیس
========================================================= */

function normalizeDatabase() {

    if (!database) {

        database = {
            centers: []
        };

    }


    if (!Array.isArray(database.centers)) {

        database.centers = [];

    }


    database.centers.forEach(function(center) {

        if (!center.robots) {

            center.robots = {};

        }


        if (!Array.isArray(center.visits)) {

            center.visits = [];

        }

    });

}


/* =========================================================
   بارگذاری نقشه واقعی
========================================================= */

async function loadIranMap() {

    const container =
        document.getElementById("iranMap");


    if (!container) {

        return;

    }


    try {

        const response =
            await fetch(MAP_FILE);


        if (!response.ok) {

            throw new Error(
                "نقشه پیدا نشد."
            );

        }


        const html =
            await response.text();


        const parser =
            new DOMParser();


        const doc =
            parser.parseFromString(
                html,
                "text/html"
            );


        const svg =
            doc.querySelector("svg");


        if (!svg) {

            throw new Error(
                "SVG نقشه داخل فایل پیدا نشد."
            );

        }


        /*
           فقط SVG را وارد صفحه می‌کنیم.
        */

        const importedSVG =
            document.importNode(
                svg,
                true
            );


        importedSVG.removeAttribute(
            "width"
        );


        importedSVG.removeAttribute(
            "height"
        );


        importedSVG.classList.add(
            "iran-real-map"
        );


        container.innerHTML = "";


        container.appendChild(
            importedSVG
        );


        setupProvinceClicks(
            importedSVG
        );


    } catch (error) {

        console.error(
            "خطا در بارگذاری نقشه:",
            error
        );


        container.innerHTML = `

            <div class="map-error">

                <h3>
                    ⚠️ نقشه بارگذاری نشد
                </h3>

                <p>
                    فایل
                    <strong>iranmap.html</strong>
                    باید کنار index.html باشد.
                </p>

            </div>

        `;

    }

}


/* =========================================================
   اتصال کلیک استان‌ها
========================================================= */

function setupProvinceClicks(svg) {

    const provincePaths =
        svg.querySelectorAll(
            "#province > a > path"
        );


    /*
       اگر ساختار بالا پیدا نشد،
       همه pathهایی که کلاس استان دارند
       بررسی می‌شوند.
    */

    let paths =
        provincePaths;


    if (!paths.length) {

        paths =
            svg.querySelectorAll(
                "path"
            );

    }


    paths.forEach(function(path) {

        const className =
            path.getAttribute("class");


        if (!className) {

            return;

        }


        const provinceKey =
            getProvinceKey(
                className
            );


        if (!provinceKey) {

            return;

        }


        const provinceName =
            provinceNames[
                provinceKey
            ];


        if (!provinceName) {

            return;

        }


        /*
           جلوگیری از اجرای onclick قدیمی SVG
        */

        const parent =
            path.parentElement;


        if (parent) {

            parent.removeAttribute(
                "onclick"
            );

            parent.removeAttribute(
                "href"
            );

        }


        path.removeAttribute(
            "onclick"
        );


        path.style.cursor =
            "pointer";


        path.dataset.province =
            provinceKey;


        /*
           عنوان هنگام نگه داشتن موس
        */

        path.setAttribute(
            "title",
            provinceName
        );


        /*
           کلیک
        */

        path.addEventListener(
            "click",
            function(event) {

                event.preventDefault();

                event.stopPropagation();


                openProvince(
                    provinceKey
                );

            }
        );


        /*
           لمس موبایل
        */

        path.addEventListener(
            "touchend",
            function(event) {

                event.preventDefault();

                event.stopPropagation();


                openProvince(
                    provinceKey
                );

            },
            {
                passive: false
            }
        );

    });

}


/* =========================================================
   تشخیص کلید استان
========================================================= */

function getProvinceKey(className) {

    const classes =
        String(className)
            .split(/\s+/);


    for (
        let i = 0;
        i < classes.length;
        i++
    ) {

        if (
            provinceNames[
                classes[i]
            ]
        ) {

            return classes[i];

        }

    }


    return null;

}


/* =========================================================
   باز کردن استان
========================================================= */

function openProvince(
    provinceKey
) {

    const provinceName =
        provinceNames[
            provinceKey
        ];


    if (!provinceName) {

        return;

    }


    currentProvince =
        provinceKey;


    currentCenter = null;

    currentRobot = "";


    document
        .getElementById("mapPage")
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
        "مراکز استان " +
        provinceName;


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
   نمایش مراکز استان
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


    const query =
        (
            document.getElementById(
                "provinceCenterSearch"
            )?.value || ""
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

                    return center.name
                        .toLowerCase()
                        .includes(query);

                }
            );

    }


    if (!centers.length) {

        if (empty) {

            empty.style.display =
                "block";

            empty.textContent =
                query
                    ? "مرکزی با این نام پیدا نشد."
                    : "هنوز مرکزی برای این استان ثبت نشده است.";

        }

        return;

    }


    if (empty) {

        empty.style.display =
            "none";

    }


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
                    ${escapeHTML(
                        center.manager ||
                        "مسئول ثبت نشده"
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
            "ابتدا یک استان را انتخاب کنید."
        );

        return;

    }


    currentCenter = null;

    currentRobot = "";


    showCenterPage();


    clearCenterForm();


    document
        .getElementById("centerName")
        .focus();

}


/* =========================================================
   نمایش صفحه مرکز
========================================================= */

function showCenterPage() {

    document
        .getElementById("mapPage")
        .classList.add("hidden");


    document
        .getElementById("provincePage")
        .classList.add("hidden");


    document
        .getElementById("centerPage")
        .classList.remove("hidden");


    document
        .getElementById("pageTitle")
        .textContent =
        currentCenter
            ? currentCenter.name
            : "ثبت مرکز جدید";


    createChecklist();

}


/* =========================================================
   باز کردن مرکز
========================================================= */

function openCenter(center) {

    currentCenter =
        center;


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
        .getElementById("labelLink")
        .value =
        center.labelLink || "";


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
        .getElementById("robotMAC")
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

    if (!currentCenter) {

        /*
           برای مرکز جدید هنوز ذخیره نشده،
           فقط مدل ربات انتخاب می‌شود.
        */

        currentRobot =
            robot;

    } else {

        currentRobot =
            robot;

    }


    document
        .getElementById("robotModel")
        .value =
        robot;


    /*
       اطلاعات ربات قبلی مرکز
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


        document
            .getElementById("robotSerial")
            .value =
            info.serial || "";


        document
            .getElementById("robotIP")
            .value =
            info.ip || "";


        document
            .getElementById("robotMAC")
            .value =
            info.mac || "";

    } else {

        document
            .getElementById("robotSerial")
            .value = "";


        document
            .getElementById("robotIP")
            .value = "";


        document
            .getElementById("robotMAC")
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
   اطلاعات فرم
========================================================= */

function getFormData() {

    return {

        centerName:
            getValue("centerName"),

        centerPhone:
            getValue("centerPhone"),

        centerAddress:
            getValue("centerAddress"),

        centerManager:
            getValue("centerManager"),

        labelLink:
            getValue("labelLink"),

        robotModel:
            getValue("robotModel"),

        robotSerial:
            getValue("robotSerial"),

        robotIP:
            getValue("robotIP"),

        robotMAC:
            getValue("robotMAC"),

        checklist:
            getChecklistValues(),

        extraWork:
            getValue("extraWork")

    };

}


/* =========================================================
   گرفتن مقدار input
========================================================= */

function getValue(id) {

    const element =
        document.getElementById(id);


    return element
        ? element.value.trim()
        : "";

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


    /*
       اگر مرکز قبلاً وجود داشته،
       همان مرکز استفاده می‌شود.
    */

    let center =
        currentCenter;


    /*
       اگر مرکز فعلی نداریم،
       با نام مرکز + استان جستجو می‌کنیم.
    */

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

                        data.centerName
                            .trim()
                            .toLowerCase()
                    );

                }
            );

    }


    /*
       اگر مرکز وجود نداشت،
       مرکز جدید ساخته می‌شود.
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
       سابقه مراجعه
    */

    if (!Array.isArray(center.visits)) {

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


    /*
       ذخیره
    */

    saveDatabase();


    currentCenter =
        center;


    document
        .getElementById("pageTitle")
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


            const workTitle =
                document.createElement(
                    "p"
                );


            workTitle.innerHTML =
                "<strong>کارهای انجام‌شده:</strong>";


            box.appendChild(
                workTitle
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
   پاک کردن فرم مرکز جدید
========================================================= */

function clearCenterForm() {

    document
        .getElementById("centerName")
        .value = "";


    document
        .getElementById("centerPhone")
        .value = "";


    document
        .getElementById("centerAddress")
        .value = "";


    document
        .getElementById("centerManager")
        .value = "";


    document
        .getElementById("labelLink")
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
        .getElementById("robotMAC")
        .value = "";


    document
        .getElementById("extraWork")
        .value = "";


    document
        .getElementById("history")
        .innerHTML =
        "<p>مرکز جدید است؛ هنوز سابقه‌ای ثبت نشده.</p>";


    createChecklist();

}


/* =========================================================
   بازگشت به صفحه استان
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
   بازگشت به نقشه
========================================================= */

function backToMap() {

    document
        .getElementById("centerPage")
        .classList.add("hidden");


    document
        .getElementById("provincePage")
        .classList.add("hidden");


    document
        .getElementById("mapPage")
        .classList.remove("hidden");


    currentProvince = "";

    currentCenter = null;

    currentRobot = "";


    const search =
        document.getElementById(
            "provinceCenterSearch"
        );


    if (search) {

        search.value = "";

    }

}


/* =========================================================
   گزارش PDF
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

                    return (
                        "<li>☑ " +
                        escapeHTML(
                            item
                        ) +
                        "</li>"
                    );

                }
            )
            .join("")

        :

        "<li>موردی ثبت نشده است.</li>";


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
<td>استان</td>
<td>
${escapeHTML(
    provinceNames[
        currentProvince
    ] || ""
)}
</td>
</tr>

<tr>
<td>نام مرکز</td>
<td>
${escapeHTML(
    data.centerName
)}
</td>
</tr>

<tr>
<td>شماره تماس</td>
<td>
${escapeHTML(
    data.centerPhone
)}
</td>
</tr>

<tr>
<td>مسئول</td>
<td>
${escapeHTML(
    data.centerManager
)}
</td>
</tr>

<tr>
<td>آدرس</td>
<td>
${escapeHTML(
    data.centerAddress
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

<h2>
اطلاعات ربات
</h2>

<table>

<tr>
<td>مدل</td>
<td>
${escapeHTML(
    data.robotModel
)}
</td>
</tr>

<tr>
<td>Serial Number</td>
<td>
${escapeHTML(
    data.robotSerial
)}
</td>
</tr>

<tr>
<td>IP Address</td>
<td>
${escapeHTML(
    data.robotIP
)}
</td>
</tr>

<tr>
<td>MAC Address</td>
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
   اتصال دکمه‌ها
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {


        normalizeDatabase();


        /*
           بارگذاری نقشه واقعی
        */

        loadIranMap();


        /*
           دکمه مرکز جدید
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
           برگشت به نقشه
        */

        const backMapBtn =
            document.getElementById(
                "backMapBtn"
            );


        if (backMapBtn) {

            backMapBtn.addEventListener(
                "click",
                backToMap
            );

        }


        /*
           برگشت به استان
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
           جستجوی مراکز
        */

        const centerSearch =
            document.getElementById(
                "provinceCenterSearch"
            );


        if (centerSearch) {

            centerSearch.addEventListener(
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
           ذخیره
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
           PDF
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
