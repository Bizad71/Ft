/* =========================================================
   مدیریت مراکز و ربات‌ها
   ساختار:
   استان
      ↓
   مراکز
      ↓
   اطلاعات مرکز
      ↓
   اطلاعات ربات
      ↓
   سوابق مراجعه
========================================================= */


/* =========================================================
   DATABASE
========================================================= */

const STORAGE_KEY = "center_management_data_v3";

let database = JSON.parse(
    localStorage.getItem(STORAGE_KEY)
) || {
    centers: []
};

let currentProvince = "";
let currentRobot = "";
let currentCenter = null;


/* =========================================================
   استان‌های ایران
========================================================= */

const provinces = [
    "آذربایجان شرقی",
    "آذربایجان غربی",
    "اردبیل",
    "اصفهان",
    "البرز",
    "ایلام",
    "بوشهر",
    "تهران",
    "چهارمحال و بختیاری",
    "خراسان جنوبی",
    "خراسان رضوی",
    "خراسان شمالی",
    "خوزستان",
    "زنجان",
    "سمنان",
    "سیستان و بلوچستان",
    "فارس",
    "قزوین",
    "قم",
    "کردستان",
    "کرمان",
    "کرمانشاه",
    "کهگیلویه و بویراحمد",
    "گلستان",
    "گیلان",
    "لرستان",
    "مازندران",
    "مرکزی",
    "هرمزگان",
    "همدان",
    "یزد"
];


/* =========================================================
   چک لیست ربات‌ها
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
   پیدا کردن مرکز
========================================================= */

function findCenterByName(name, province) {

    return database.centers.find(function(center) {

        return (
            center.province === province &&
            center.name.trim().toLowerCase() ===
            name.trim().toLowerCase()
        );

    });

}


/* =========================================================
   نمایش صفحه استان
========================================================= */

function openProvince(province) {

    currentProvince = province;
    currentCenter = null;
    currentRobot = "";

    document
        .getElementById("mapPage")
        .classList.add("hidden");

    document
        .getElementById("provincePage")
        .classList.remove("hidden");

    document
        .getElementById("centerPage")
        .classList.add("hidden");

    const title =
        document.getElementById("provinceTitle");

    if (title) {
        title.textContent =
            "مراکز استان " + province;
    }

    renderCenters();

}


/* =========================================================
   نمایش مراکز استان
========================================================= */

function renderCenters(searchText = "") {

    const container =
        document.getElementById("centersGrid");

    if (!container) {
        return;
    }

    container.innerHTML = "";

    const query =
        searchText
            .trim()
            .toLowerCase();


    let centers =
        database.centers.filter(function(center) {

            return center.province === currentProvince;

        });


    if (query) {

        centers =
            centers.filter(function(center) {

                return center.name
                    .toLowerCase()
                    .includes(query);

            });

    }


    if (!centers.length) {

        const empty =
            document.createElement("div");

        empty.className =
            "empty-state";

        empty.style.gridColumn =
            "1 / -1";

        empty.innerHTML = `
            <h3>هنوز مرکزی ثبت نشده است</h3>
            <p>
                برای ثبت اولین مرکز این استان،
                روی دکمه «مرکز جدید» بزنید.
            </p>
        `;

        container.appendChild(empty);

        return;

    }


    centers.forEach(function(center) {

        const card =
            document.createElement("div");

        card.className =
            "center-card";


        const title =
            document.createElement("h3");

        title.textContent =
            "🏥 " + center.name;


        const manager =
            document.createElement("p");

        manager.innerHTML =
            "<strong>مسئول:</strong> " +
            escapeHTML(
                center.manager || "ثبت نشده"
            );


        const phone =
            document.createElement("p");

        phone.innerHTML =
            "<strong>تماس:</strong> " +
            escapeHTML(
                center.phone || "ثبت نشده"
            );


        const button =
            document.createElement("button");

        button.type = "button";

        button.className =
            "btn btn-blue";

        button.textContent =
            "باز کردن مرکز";


        button.addEventListener(
            "click",
            function() {

                openCenter(center);

            }
        );


        card.appendChild(title);

        card.appendChild(manager);

        card.appendChild(phone);

        card.appendChild(button);

        container.appendChild(card);

    });

}


/* =========================================================
   مرکز جدید
========================================================= */

function newCenter() {

    currentCenter = null;

    currentRobot = "";

    document
        .getElementById("provincePage")
        .classList.add("hidden");

    document
        .getElementById("centerPage")
        .classList.remove("hidden");


    document
        .getElementById("pageTitle")
        .textContent =
        "ثبت مرکز جدید - " +
        currentProvince;


    clearForm();

}


/* =========================================================
   انتخاب ربات
========================================================= */

function selectRobot(robot) {

    currentRobot = robot;


    document
        .getElementById("homePage")
        ?.classList.add("hidden");


    document
        .getElementById("mapPage")
        ?.classList.add("hidden");


    document
        .getElementById("provincePage")
        ?.classList.add("hidden");


    document
        .getElementById("centerPage")
        .classList.remove("hidden");


    document
        .getElementById("robotModel")
        .value = robot;


    createChecklist();

}


/* =========================================================
   ساخت چک لیست
========================================================= */

function createChecklist(savedItems = []) {

    const container =
        document.getElementById("checklist");

    if (!container) {
        return;
    }

    container.innerHTML = "";


    const list =
        checklists[currentRobot] || [];


    list.forEach(function(item, index) {

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
            savedItems.includes(item)
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


        row.appendChild(checkbox);

        row.appendChild(label);

        container.appendChild(row);

    });

}


/* =========================================================
   گرفتن کارهای تیک خورده
========================================================= */

function getChecklistValues() {

    const items = [];


    document
        .querySelectorAll(
            "#checklist input[type='checkbox']"
        )
        .forEach(function(checkbox) {

            if (checkbox.checked) {

                items.push(
                    checkbox.value
                );

            }

        });


    return items;

}


/* =========================================================
   گرفتن اطلاعات فرم
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

    if (!element) {
        return "";
    }

    return element.value.trim();

}


/* =========================================================
   پاک کردن فرم
========================================================= */

function clearForm() {

    const ids = [

        "centerName",
        "centerPhone",
        "centerAddress",
        "centerManager",
        "labelLink",
        "robotSerial",
        "robotIP",
        "robotMAC",
        "extraWork"

    ];


    ids.forEach(function(id) {

        const element =
            document.getElementById(id);

        if (element) {
            element.value = "";
        }

    });


    const robotModel =
        document.getElementById("robotModel");

    if (robotModel) {
        robotModel.value =
            currentRobot || "";
    }


    const history =
        document.getElementById("history");

    if (history) {
        history.innerHTML = "";
    }


    createChecklist();

}


/* =========================================================
   ذخیره مراجعه
========================================================= */

function saveVisit() {

    const data =
        getFormData();


    if (!currentProvince) {

        alert(
            "استان مرکز مشخص نیست."
        );

        return;

    }


    if (!data.centerName) {

        alert(
            "لطفاً نام مرکز را وارد کنید."
        );

        return;

    }


    /*
       پیدا کردن مرکز
    */

    let center =
        findCenterByName(
            data.centerName,
            currentProvince
        );


    /*
       اگر مرکز جدید است
    */

    if (!center) {

        center = {

            id: Date.now(),

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


        database.centers.push(center);

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
       اگر ربات انتخاب شده باشد
    */

    if (currentRobot) {

        if (!center.robots) {
            center.robots = {};
        }


        center.robots[currentRobot] = {

            serial:
                data.robotSerial,

            ip:
                data.robotIP,

            mac:
                data.robotMAC

        };


        /*
           ایجاد سابقه مراجعه جدید
        */

        if (!center.visits) {
            center.visits = [];
        }


        const visit = {

            id:
                Date.now(),

            date:
                new Date()
                    .toLocaleString("fa-IR"),

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

    }


    /*
       ذخیره
    */

    saveDatabase();


    currentCenter =
        center;


    /*
       اگر مرکز جدید بوده،
       کارت آن در استان ساخته می‌شود
    */

    alert(
        "اطلاعات مرکز با موفقیت ذخیره شد."
    );


    /*
       نمایش مجدد مرکز
    */

    openCenter(center);

}


/* =========================================================
   باز کردن مرکز
========================================================= */

function openCenter(center) {

    currentCenter =
        center;


    document
        .getElementById("mapPage")
        ?.classList.add("hidden");


    document
        .getElementById("provincePage")
        ?.classList.add("hidden");


    document
        .getElementById("centerPage")
        .classList.remove("hidden");


    document
        .getElementById("pageTitle")
        .textContent =
        center.name;


    setValue(
        "centerName",
        center.name
    );


    setValue(
        "centerPhone",
        center.phone
    );


    setValue(
        "centerAddress",
        center.address
    );


    setValue(
        "centerManager",
        center.manager
    );


    setValue(
        "labelLink",
        center.labelLink
    );


    /*
       اگر ربات قبلی انتخاب نشده،
       اولین ربات ثبت‌شده را پیدا کن
    */

    if (
        !currentRobot &&
        center.robots
    ) {

        const robotNames =
            Object.keys(
                center.robots
            );


        if (robotNames.length) {

            currentRobot =
                robotNames[0];

        }

    }


    setValue(
        "robotModel",
        currentRobot
    );


    /*
       اطلاعات ربات
    */

    const robot =
        center.robots &&
        currentRobot
            ? center.robots[currentRobot]
            : null;


    if (robot) {

        setValue(
            "robotSerial",
            robot.serial
        );

        setValue(
            "robotIP",
            robot.ip
        );

        setValue(
            "robotMAC",
            robot.mac
        );

    } else {

        setValue(
            "robotSerial",
            ""
        );

        setValue(
            "robotIP",
            ""
        );

        setValue(
            "robotMAC",
            ""
        );

    }


    createChecklist();

    renderHistory();

}


/* =========================================================
   تنظیم مقدار
========================================================= */

function setValue(id, value) {

    const element =
        document.getElementById(id);

    if (element) {

        element.value =
            value || "";

    }

}


/* =========================================================
   نمایش سوابق
========================================================= */

function renderHistory() {

    const history =
        document.getElementById("history");


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


    visits.forEach(function(visit) {

        const box =
            document.createElement("div");

        box.className =
            "history-item";


        const title =
            document.createElement("h3");

        title.textContent =
            "📅 " + visit.date;


        box.appendChild(title);


        const robot =
            document.createElement("p");

        robot.innerHTML =
            "<strong>ربات:</strong> " +
            escapeHTML(
                visit.robot || "-"
            );


        box.appendChild(robot);


        const workTitle =
            document.createElement("p");

        workTitle.innerHTML =
            "<strong>کارهای انجام‌شده:</strong>";

        box.appendChild(workTitle);


        const list =
            document.createElement("ul");


        (
            visit.checklist || []
        ).forEach(function(item) {

            const li =
                document.createElement("li");

            li.textContent =
                item;

            list.appendChild(li);

        });


        box.appendChild(list);


        if (visit.extraWork) {

            const extra =
                document.createElement("p");

            extra.innerHTML =
                "<strong>کار متفرقه:</strong><br>" +
                escapeHTML(
                    visit.extraWork
                );


            box.appendChild(extra);

        }


        history.appendChild(box);

    });

}


/* =========================================================
   بازگشت به استان
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
        ?.classList.add("hidden");


    document
        .getElementById("provincePage")
        ?.classList.add("hidden");


    document
        .getElementById("mapPage")
        ?.classList.remove("hidden");


    currentProvince = "";

    currentCenter = null;

    currentRobot = "";

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
            .map(function(item) {

                return (
                    "<li>☑ " +
                    escapeHTML(item) +
                    "</li>"
                );

            })
            .join("")

            :

        "<li>موردی ثبت نشده است.</li>";


    report.document.write(`

<!DOCTYPE html>

<html lang="fa" dir="rtl">

<head>

<meta charset="UTF-8">

<title>گزارش کار مرکز</title>

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
    border: 1px solid #888;
    padding: 15px;
    margin-bottom: 20px;
    border-radius: 8px;
}

table {
    width: 100%;
    border-collapse: collapse;
}

td {
    border: 1px solid #999;
    padding: 8px;
}

ul {
    line-height: 2;
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
<td>${escapeHTML(currentProvince)}</td>
</tr>

<tr>
<td>نام مرکز</td>
<td>${escapeHTML(data.centerName)}</td>
</tr>

<tr>
<td>شماره تماس</td>
<td>${escapeHTML(data.centerPhone)}</td>
</tr>

<tr>
<td>مسئول</td>
<td>${escapeHTML(data.centerManager)}</td>
</tr>

<tr>
<td>آدرس</td>
<td>${escapeHTML(data.centerAddress)}</td>
</tr>

<tr>
<td>تاریخ</td>
<td>${new Date().toLocaleString("fa-IR")}</td>
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
<td>${escapeHTML(data.robotModel)}</td>
</tr>

<tr>
<td>Serial Number</td>
<td>${escapeHTML(data.robotSerial)}</td>
</tr>

<tr>
<td>IP Address</td>
<td>${escapeHTML(data.robotIP)}</td>
</tr>

<tr>
<td>MAC Address</td>
<td>${escapeHTML(data.robotMAC)}</td>
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
        href="${escapeHTML(data.labelLink)}"
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


    setTimeout(function() {

        report.print();

    }, 500);

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
   رویدادهای صفحه
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {


        /* ---------------------------------
           نقشه استان‌ها
        --------------------------------- */

        document
            .querySelectorAll(
                ".province"
            )
            .forEach(function(province) {

                province.addEventListener(
                    "click",
                    function() {

                        const name =
                            this.dataset.province;

                        if (name) {

                            openProvince(
                                name
                            );

                        }

                    }
                );

            });


        /* ---------------------------------
           دکمه‌های ربات
        --------------------------------- */

        document
            .querySelectorAll(
                ".robot-card"
            )
            .forEach(function(card) {

                card.addEventListener(
                    "click",
                    function() {

                        selectRobot(
                            this.dataset.robot
                        );

                    }
                );

            });


        /* ---------------------------------
           مرکز جدید
        --------------------------------- */

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


        /* ---------------------------------
           بازگشت به استان
        --------------------------------- */

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


        /* ---------------------------------
           بازگشت به نقشه
        --------------------------------- */

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


        /* ---------------------------------
           ذخیره مراجعه
        --------------------------------- */

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


        /* ---------------------------------
           گزارش
        --------------------------------- */

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


        /* ---------------------------------
           جستجوی مراکز استان
        --------------------------------- */

        const centerSearch =
            document.getElementById(
                "provinceCenterSearch"
            );


        if (centerSearch) {

            centerSearch.addEventListener(
                "input",
                function() {

                    renderCenters(
                        this.value
                    );

                }
            );

        }


        /* ---------------------------------
           ساخت چک لیست اولیه
        --------------------------------- */

        createChecklist();

    }
);
