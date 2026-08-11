const STORAGE_KEY = "center_management_data";

let database = JSON.parse(
    localStorage.getItem(STORAGE_KEY)
) || {
    centers: []
};

let currentRobot = "";
let currentCenter = null;


/* =========================
   چک لیست
========================= */

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


/* =========================
   ذخیره دیتابیس
========================= */

function saveDatabase() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(database)
    );

}


/* =========================
   انتخاب ربات
========================= */

function selectRobot(robot) {

    currentRobot = robot;

    document
        .getElementById("homePage")
        .classList.add("hidden");

    document
        .getElementById("centerPage")
        .classList.remove("hidden");

    document
        .getElementById("pageTitle")
        .textContent = "ثبت اطلاعات مرکز - " + robot;

    document
        .getElementById("robotModel")
        .value = robot;

    clearForm();

    document
        .getElementById("robotModel")
        .value = robot;

    createChecklist();

}


/* =========================
   ساخت چک لیست
========================= */

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

        row.className = "check-item";


        const checkbox =
            document.createElement("input");

        checkbox.type = "checkbox";

        checkbox.id =
            "check_" + index;

        checkbox.value = item;


        if (savedItems.includes(item)) {
            checkbox.checked = true;
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


/* =========================
   گرفتن کارهای تیک خورده
========================= */

function getChecklistValues() {

    const items = [];

    document
        .querySelectorAll(
            "#checklist input[type='checkbox']"
        )
        .forEach(function(checkbox) {

            if (checkbox.checked) {
                items.push(checkbox.value);
            }

        });

    return items;

}


/* =========================
   گرفتن اطلاعات فرم
========================= */

function getFormData() {

    return {

        centerName:
            document
                .getElementById("centerName")
                .value
                .trim(),

        centerPhone:
            document
                .getElementById("centerPhone")
                .value
                .trim(),

        centerAddress:
            document
                .getElementById("centerAddress")
                .value
                .trim(),

        centerManager:
            document
                .getElementById("centerManager")
                .value
                .trim(),

        labelLink:
            document
                .getElementById("labelLink")
                .value
                .trim(),

        robotModel:
            document
                .getElementById("robotModel")
                .value
                .trim(),

        robotSerial:
            document
                .getElementById("robotSerial")
                .value
                .trim(),

        robotIP:
            document
                .getElementById("robotIP")
                .value
                .trim(),

        robotMAC:
            document
                .getElementById("robotMAC")
                .value
                .trim(),

        checklist:
            getChecklistValues(),

        extraWork:
            document
                .getElementById("extraWork")
                .value
                .trim()

    };

}


/* =========================
   پاک کردن فرم
========================= */

function clearForm() {

    document.getElementById("centerName").value = "";

    document.getElementById("centerPhone").value = "";

    document.getElementById("centerAddress").value = "";

    document.getElementById("centerManager").value = "";

    document.getElementById("labelLink").value = "";

    document.getElementById("robotSerial").value = "";

    document.getElementById("robotIP").value = "";

    document.getElementById("robotMAC").value = "";

    document.getElementById("extraWork").value = "";

    document.getElementById("history").innerHTML = "";

    createChecklist();

}


/* =========================
   ذخیره مراجعه
========================= */

function saveVisit() {

    const data = getFormData();


    if (!data.centerName) {

        alert("لطفاً نام مرکز را وارد کنید.");

        return;

    }


    /*
       پیدا کردن مرکز
    */

    let center =
        database.centers.find(function(item) {

            return item.name
                .trim()
                .toLowerCase() ===
                data.centerName
                    .trim()
                    .toLowerCase();

        });


    /*
       اگر مرکز وجود نداشت
    */

    if (!center) {

        center = {

            id: Date.now(),

            name: data.centerName,

            phone: data.centerPhone,

            address: data.centerAddress,

            manager: data.centerManager,

            labelLink: data.labelLink,

            robots: {},

            visits: []

        };

        database.centers.push(center);

    }


    /*
       بروزرسانی اطلاعات عمومی مرکز
    */

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


    center.robots[currentRobot] = {

        serial:
            data.robotSerial,

        ip:
            data.robotIP,

        mac:
            data.robotMAC

    };


    /*
       ایجاد سابقه جدید
    */

    if (!center.visits) {
        center.visits = [];
    }


    const visit = {

        id: Date.now(),

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


    center.visits.unshift(visit);


    /*
       ذخیره
    */

    saveDatabase();


    currentCenter = center;


    renderHistory();


    alert(
        "اطلاعات مرکز و گزارش مراجعه ذخیره شد."
    );

}


/* =========================
   جستجوی مرکز
========================= */

function searchCenters() {

    const input =
        document.getElementById(
            "searchCenter"
        );

    const results =
        document.getElementById(
            "searchResults"
        );


    const query =
        input.value
            .trim()
            .toLowerCase();


    results.innerHTML = "";


    if (!query) {
        return;
    }


    const matches =
        database.centers.filter(
            function(center) {

                return center.name
                    .toLowerCase()
                    .includes(query);

            }
        );


    if (!matches.length) {

        results.innerHTML =
            "<p>مرکزی پیدا نشد.</p>";

        return;

    }


    matches.forEach(
        function(center) {

            const row =
                document.createElement("div");

            row.className =
                "search-result";


            const name =
                document.createElement("strong");

            name.textContent =
                center.name;


            const button =
                document.createElement("button");

            button.type = "button";

            button.className =
                "btn btn-blue";

            button.textContent =
                "باز کردن";


            button.addEventListener(
                "click",
                function() {

                    openCenter(center);

                }
            );


            row.appendChild(name);

            row.appendChild(button);

            results.appendChild(row);

        }
    );

}


/* =========================
   باز کردن مرکز قبلی
========================= */

function openCenter(center) {

    currentCenter = center;


    document
        .getElementById("homePage")
        .classList.add("hidden");


    document
        .getElementById("centerPage")
        .classList.remove("hidden");


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
        .value =
        currentRobot;


    const robot =
        center.robots &&
        center.robots[currentRobot];


    if (robot) {

        document
            .getElementById("robotSerial")
            .value =
            robot.serial || "";


        document
            .getElementById("robotIP")
            .value =
            robot.ip || "";


        document
            .getElementById("robotMAC")
            .value =
            robot.mac || "";

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

    renderHistory();

}


/* =========================
   نمایش سوابق
========================= */

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
            "<p>هنوز مراجعه‌ای ثبت نشده است.</p>";

        return;

    }


    visits.forEach(
        function(visit) {

            const box =
                document.createElement("div");

            box.className =
                "history-item";


            const title =
                document.createElement("h3");

            title.textContent =
                "📅 " +
                visit.date;


            box.appendChild(title);


            const robot =
                document.createElement("p");

            robot.innerHTML =
                "<strong>ربات:</strong> " +
                escapeHTML(
                    visit.robot
                );


            box.appendChild(robot);


            const workTitle =
                document.createElement("p");

            workTitle.innerHTML =
                "<strong>کارهای انجام‌شده:</strong>";

            box.appendChild(workTitle);


            const list =
                document.createElement("ul");


            (visit.checklist || [])
                .forEach(
                    function(item) {

                        const li =
                            document.createElement("li");

                        li.textContent =
                            item;

                        list.appendChild(li);

                    }
                );


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

        }
    );

}


/* =========================
   برگشت صفحه اصلی
========================= */

function goHome() {

    document
        .getElementById("centerPage")
        .classList.add("hidden");


    document
        .getElementById("homePage")
        .classList.remove("hidden");


    currentCenter = null;

    currentRobot = "";


    document
        .getElementById("searchCenter")
        .value = "";


    document
        .getElementById("searchResults")
        .innerHTML = "";

}


/* =========================
   مرکز جدید
========================= */

function newCenter() {

    clearForm();

    currentCenter = null;

    document
        .getElementById("centerName")
        .focus();

}


/* =========================
   گزارش PDF
========================= */

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


    setTimeout(
        function() {

            report.print();

        },
        500
    );

}


/* =========================
   امنیت HTML
========================= */

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


/* =========================
   اتصال دکمه‌ها
========================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {


        /*
           دکمه‌های ربات
        */

        const robotCards =
            document.querySelectorAll(
                ".robot-card"
            );


        robotCards.forEach(
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
           جستجو
        */

        document
            .getElementById("searchBtn")
            .addEventListener(
                "click",
                searchCenters
            );


        document
            .getElementById("searchCenter")
            .addEventListener(
                "input",
                searchCenters
            );


        /*
           برگشت
        */

        document
            .getElementById("backHomeBtn")
            .addEventListener(
                "click",
                goHome
            );


        /*
           ذخیره
        */

        document
            .getElementById("saveVisitBtn")
            .addEventListener(
                "click",
                saveVisit
            );


        /*
           PDF
        */

        document
            .getElementById("printReportBtn")
            .addEventListener(
                "click",
                printReport
            );


        /*
           مرکز جدید
        */

        document
            .getElementById("newCenterBtn")
            .addEventListener(
                "click",
                newCenter
            );


        /*
           ساخت چک لیست اولیه
        */

        createChecklist();

    }
);
