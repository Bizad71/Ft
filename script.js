const STORAGE_KEY = "center_management_data";

let database = JSON.parse(
    localStorage.getItem(STORAGE_KEY)
) || {
    centers: []
};

let currentRobot = "";
let currentCenter = null;
let editingVisitId = null;


/* =========================================================
   چک لیست‌ها
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
   ساخت ID
========================================================= */

function createId() {

    return Date.now().toString() +
        "_" +
        Math.random()
            .toString(36)
            .substring(2, 10);

}


/* =========================================================
   انتخاب ربات
========================================================= */

function selectRobot(robot) {

    currentRobot = robot;

    currentCenter = null;

    editingVisitId = null;

    document
        .getElementById("homePage")
        .classList.add("hidden");

    document
        .getElementById("centerPage")
        .classList.remove("hidden");

    document
        .getElementById("pageTitle")
        .textContent =
        "ثبت اطلاعات مرکز - " + robot;

    document
        .getElementById("robotModel")
        .value = robot;

    clearCenterForm();

    document
        .getElementById("robotModel")
        .value = robot;

    createChecklist();

    updateVisitStatus("مراجعه جدید");

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


/* =========================================================
   پاک کردن فقط فرم مراجعه
========================================================= */

function clearVisitForm() {

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

    editingVisitId = null;

    document
        .getElementById("saveVisitBtn")
        .textContent =
        "💾 ذخیره مراجعه";

    updateVisitStatus("مراجعه جدید");

}


/* =========================================================
   پاک کردن فرم مرکز
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

    clearVisitForm();

    document
        .getElementById("history")
        .innerHTML = "";

}


/* =========================================================
   ذخیره مراجعه
========================================================= */

function saveVisit() {

    const data = getFormData();


    if (!data.centerName) {

        alert(
            "لطفاً نام مرکز را وارد کنید."
        );

        return;

    }


    /*
       اگر مرکز فعلی وجود دارد،
       از همان استفاده می‌کنیم.
    */

    let center = currentCenter;


    /*
       اگر مرکز فعلی نداریم،
       دنبال مرکز همنام می‌گردیم.
    */

    if (!center) {

        center =
            database.centers.find(
                function(item) {

                    return item.name
                        .trim()
                        .toLowerCase() ===
                        data.centerName
                            .trim()
                            .toLowerCase();

                }
            );

    }


    /*
       اگر مرکز اصلاً وجود نداشت،
       مرکز جدید ایجاد می‌شود.
    */

    if (!center) {

        center = {

            id: createId(),

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
       اطلاعات ثابت مرکز
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
       ربات‌های مرکز
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
       اطمینان از وجود visits
    */

    if (!Array.isArray(center.visits)) {
        center.visits = [];
    }


    /* =====================================================
       اگر داریم گزارش قبلی را ویرایش می‌کنیم
    ===================================================== */

    if (editingVisitId) {

        const visit =
            center.visits.find(
                function(item) {

                    return item.id ===
                        editingVisitId;

                }
            );


        if (visit) {

            visit.robot =
                currentRobot;

            visit.checklist =
                data.checklist;

            visit.extraWork =
                data.extraWork;

            visit.robotInfo = {

                serial:
                    data.robotSerial,

                ip:
                    data.robotIP,

                mac:
                    data.robotMAC

            };


            saveDatabase();

            currentCenter = center;

            renderHistory();

            clearVisitForm();

            alert(
                "گزارش قبلی با موفقیت ویرایش شد."
            );

            return;

        }

    }


    /* =====================================================
       ایجاد مراجعه کاملاً جدید
    ===================================================== */

    const visit = {

        id: createId(),

        date:
            new Date()
                .toLocaleString(
                    "fa-IR"
                ),

        timestamp:
            Date.now(),

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


    /*
       مهم:
       اینجا push / unshift می‌کنیم.
       یعنی گزارش قبلی حذف یا جایگزین نمی‌شود.
    */

    center.visits.unshift(
        visit
    );


    saveDatabase();

    currentCenter = center;


    renderHistory();


    /*
       بعد از ذخیره،
       فرم مراجعه کاملاً جدید می‌شود
       ولی اطلاعات مرکز باقی می‌ماند.
    */

    clearVisitForm();


    alert(
        "مراجعه با موفقیت ذخیره شد."
    );

}


/* =========================================================
   جستجوی مرکز
========================================================= */

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

                return (
                    center.name || ""
                )
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
                document.createElement(
                    "div"
                );

            row.className =
                "search-result";


            const info =
                document.createElement(
                    "div"
                );


            const name =
                document.createElement(
                    "strong"
                );

            name.textContent =
                center.name;


            info.appendChild(name);


            const details =
                document.createElement(
                    "small"
                );

            details.textContent =
                "تعداد مراجعات: " +
                (
                    center.visits
                        ? center.visits.length
                        : 0
                );


            info.appendChild(details);


            const button =
                document.createElement(
                    "button"
                );

            button.type =
                "button";

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


            row.appendChild(info);

            row.appendChild(button);

            results.appendChild(row);

        }
    );

}


/* =========================================================
   باز کردن مرکز قبلی
========================================================= */

function openCenter(center) {

    currentCenter = center;

    editingVisitId = null;


    /*
       اگر مرکز قبلی چند ربات دارد،
       ربات انتخاب‌شده فعلی را حفظ می‌کنیم.

       اگر چیزی انتخاب نشده باشد،
       اولین ربات مرکز را انتخاب می‌کنیم.
    */

    if (
        !currentRobot ||
        !center.robots ||
        !center.robots[currentRobot]
    ) {

        const robotKeys =
            center.robots
                ? Object.keys(
                    center.robots
                )
                : [];

        if (robotKeys.length) {

            currentRobot =
                robotKeys[0];

        }

    }


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
        currentRobot || "";


    /*
       اطلاعات ربات را برای فرم مراجعه
       جدید نشان نمی‌دهیم.

       این قسمت مهم است:
       مراجعه جدید باید فرم خالی داشته باشد.
    */

    clearVisitForm();


    renderHistory();

}


/* =========================================================
   ثبت مراجعه جدید
========================================================= */

function newVisit() {

    if (!currentCenter) {

        alert(
            "ابتدا یک مرکز را باز کنید."
        );

        return;

    }


    clearVisitForm();


    document
        .getElementById("robotModel")
        .value =
        currentRobot;


    document
        .getElementById("robotSerial")
        .focus();

}


/* =========================================================
   نمایش سوابق
========================================================= */

function renderHistory() {

    const history =
        document.getElementById(
            "history"
        );


    history.innerHTML = "";


    if (!currentCenter) {

        history.innerHTML =
            "<p>هنوز مرکزی انتخاب نشده است.</p>";

        return;

    }


    const visits =
        Array.isArray(
            currentCenter.visits
        )
            ? currentCenter.visits
            : [];


    if (!visits.length) {

        history.innerHTML = `
            <div class="empty-history">
                هنوز هیچ مراجعه‌ای برای این مرکز ثبت نشده است.
            </div>
        `;

        return;

    }


    visits.forEach(
        function(visit, index) {

            const box =
                document.createElement(
                    "div"
                );

            box.className =
                "history-item";


            const header =
                document.createElement(
                    "div"
                );

            header.className =
                "history-header";


            const title =
                document.createElement(
                    "h3"
                );

            title.textContent =
                "📅 مراجعه " +
                (visits.length - index) +
                " - " +
                visit.date;


            header.appendChild(title);


            const buttons =
                document.createElement(
                    "div"
                );

            buttons.className =
                "history-buttons";


            const editButton =
                document.createElement(
                    "button"
                );

            editButton.type =
                "button";

            editButton.className =
                "btn btn-blue btn-small";

            editButton.textContent =
                "ویرایش";


            editButton.addEventListener(
                "click",
                function() {

                    editVisit(
                        visit.id
                    );

                }
            );


            const deleteButton =
                document.createElement(
                    "button"
                );

            deleteButton.type =
                "button";

            deleteButton.className =
                "btn btn-red btn-small";

            deleteButton.textContent =
                "حذف";


            deleteButton.addEventListener(
                "click",
                function() {

                    deleteVisit(
                        visit.id
                    );

                }
            );


            buttons.appendChild(
                editButton
            );

            buttons.appendChild(
                deleteButton
            );


            header.appendChild(
                buttons
            );


            box.appendChild(
                header
            );


            /*
               اطلاعات ربات
            */

            const robotInfo =
                document.createElement(
                    "div"
                );

            robotInfo.className =
                "history-robot";


            robotInfo.innerHTML = `

                <div>
                    <strong>ربات:</strong>
                    ${escapeHTML(
                        visit.robot || "-"
                    )}
                </div>

                <div>
                    <strong>Serial:</strong>
                    ${escapeHTML(
                        visit.robotInfo?.serial || "-"
                    )}
                </div>

                <div>
                    <strong>IP:</strong>
                    ${escapeHTML(
                        visit.robotInfo?.ip || "-"
                    )}
                </div>

                <div>
                    <strong>MAC:</strong>
                    ${escapeHTML(
                        visit.robotInfo?.mac || "-"
                    )}
                </div>

            `;


            box.appendChild(
                robotInfo
            );


            /*
               کارهای انجام‌شده
            */

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


            if (
                visit.checklist &&
                visit.checklist.length
            ) {

                visit.checklist.forEach(
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

            } else {

                const li =
                    document.createElement(
                        "li"
                    );

                li.textContent =
                    "موردی ثبت نشده است.";

                list.appendChild(
                    li
                );

            }


            box.appendChild(
                list
            );


            /*
               کار متفرقه
            */

            if (visit.extraWork) {

                const extra =
                    document.createElement(
                        "div"
                    );

                extra.className =
                    "history-extra";


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
   ویرایش گزارش
========================================================= */

function editVisit(visitId) {

    if (!currentCenter) {
        return;
    }


    const visit =
        currentCenter.visits.find(
            function(item) {

                return item.id ===
                    visitId;

            }
        );


    if (!visit) {
        return;
    }


    currentRobot =
        visit.robot;


    document
        .getElementById("robotModel")
        .value =
        currentRobot;


    document
        .getElementById("robotSerial")
        .value =
        visit.robotInfo?.serial || "";


    document
        .getElementById("robotIP")
        .value =
        visit.robotInfo?.ip || "";


    document
        .getElementById("robotMAC")
        .value =
        visit.robotInfo?.mac || "";


    document
        .getElementById("extraWork")
        .value =
        visit.extraWork || "";


    createChecklist(
        visit.checklist || []
    );


    editingVisitId =
        visit.id;


    document
        .getElementById("saveVisitBtn")
        .textContent =
        "💾 ذخیره تغییرات";


    updateVisitStatus(
        "در حال ویرایش گزارش"
    );


    document
        .getElementById("robotSerial")
        .focus();


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================================
   حذف گزارش
========================================================= */

function deleteVisit(visitId) {

    if (!currentCenter) {
        return;
    }


    const confirmed =
        confirm(
            "آیا از حذف این گزارش مطمئن هستید؟"
        );


    if (!confirmed) {
        return;
    }


    currentCenter.visits =
        currentCenter.visits.filter(
            function(visit) {

                return visit.id !==
                    visitId;

            }
        );


    saveDatabase();

    renderHistory();

}


/* =========================================================
   وضعیت فرم مراجعه
========================================================= */

function updateVisitStatus(text) {

    const status =
        document.getElementById(
            "visitStatus"
        );

    if (status) {

        status.textContent =
            text;

    }

}


/* =========================================================
   برگشت صفحه اصلی
========================================================= */

function goHome() {

    document
        .getElementById("centerPage")
        .classList.add("hidden");


    document
        .getElementById("homePage")
        .classList.remove("hidden");


    currentCenter = null;

    currentRobot = "";

    editingVisitId = null;


    document
        .getElementById("searchCenter")
        .value = "";


    document
        .getElementById("searchResults")
        .innerHTML = "";

}


/* =========================================================
   مرکز جدید
========================================================= */

function newCenter() {

    currentCenter = null;

    editingVisitId = null;


    /*
       مدل ربات انتخاب‌شده حفظ می‌شود.
    */

    clearCenterForm();


    document
        .getElementById("robotModel")
        .value =
        currentRobot;


    document
        .getElementById("pageTitle")
        .textContent =
        "مرکز جدید - " +
        currentRobot;


    document
        .getElementById("centerName")
        .focus();

}


/* =========================================================
   PDF
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


/* =========================================================
   امنیت HTML
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


/* =========================================================
   اتصال دکمه‌ها
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {


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
           ذخیره مراجعه
        */

        document
            .getElementById("saveVisitBtn")
            .addEventListener(
                "click",
                saveVisit
            );


        /*
           مراجعه جدید
        */

        document
            .getElementById("newVisitBtn")
            .addEventListener(
                "click",
                newVisit
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
           چک لیست اولیه
        */

        createChecklist();

    }
);
