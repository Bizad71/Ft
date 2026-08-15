/* =========================================================
   مدیریت مراکز و گزارش کار
   نسخه جدید
========================================================= */

const STORAGE_KEY = "center_report_v3";

const PASSWORD = "0111";

const MAX_ATTEMPTS = 3;

const LOCK_TIME = 30 * 60 * 1000;


/* =========================================================
   استان‌ها
   تهران عمداً اول است
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
    ["khorasan-south", "خراسان جنوبی"],
    ["khorasan-razavi", "خراسان رضوی"],
    ["khorasan-north", "خراسان شمالی"],
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
   دیتابیس
========================================================= */

let database = loadDatabase();

let currentProvince = "";

let currentCenter = null;


/* =========================================================
   بارگذاری دیتابیس
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

        const data =
            JSON.parse(saved);

        if (!data.centers) {

            data.centers = [];

        }

        return data;

    } catch (error) {

        console.error(error);

        return {
            centers: []
        };

    }

}


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
   ورود
========================================================= */

function checkLogin() {

    const lockUntil =
        Number(
            localStorage.getItem(
                "site_lock_until"
            ) || 0
        );

    if (Date.now() < lockUntil) {

        showLockMessage();

        return;

    }


    const password =
        document
            .getElementById(
                "passwordInput"
            )
            .value;


    if (password === PASSWORD) {

        localStorage.removeItem(
            "site_login_attempts"
        );

        localStorage.removeItem(
            "site_lock_until"
        );


        document
            .getElementById(
                "loginPage"
            )
            .classList.add("hidden");


        document
            .getElementById(
                "app"
            )
            .classList.remove("hidden");


        renderProvinces();

        return;

    }


    let attempts =
        Number(
            localStorage.getItem(
                "site_login_attempts"
            ) || 0
        );


    attempts++;


    if (attempts >= MAX_ATTEMPTS) {

        localStorage.setItem(
            "site_login_attempts",
            "0"
        );

        localStorage.setItem(
            "site_lock_until",
            String(
                Date.now() +
                LOCK_TIME
            )
        );


        showLockMessage();

        return;

    }


    localStorage.setItem(
        "site_login_attempts",
        String(attempts)
    );


    const remaining =
        MAX_ATTEMPTS - attempts;


    document
        .getElementById(
            "loginMessage"
        )
        .textContent =
        "رمز اشتباه است. " +
        remaining +
        " فرصت باقی مانده.";


    document
        .getElementById(
            "passwordInput"
        )
        .value = "";

}


function showLockMessage() {

    const lockUntil =
        Number(
            localStorage.getItem(
                "site_lock_until"
            ) || 0
        );


    let remaining =
        Math.ceil(
            (
                lockUntil -
                Date.now()
            ) / 60000
        );


    if (remaining < 1) {

        remaining = 1;

    }


    document
        .getElementById(
            "loginMessage"
        )
        .textContent =
        "ورود موقتاً قفل شده است. " +
        remaining +
        " دقیقه دیگر دوباره تلاش کنید.";

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


/* =========================================================
   باز کردن استان
========================================================= */

function openProvince(
    key,
    name
) {

    currentProvince =
        key;


    document
        .getElementById(
            "provincePage"
        )
        .classList.add(
            "hidden"
        );


    document
        .getElementById(
            "reportPage"
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
        "مراکز " + name;


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


    const query =
        document
            .getElementById(
                "centerSearch"
            )
            .value
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
                "🏥 " +
                center.name;


            const manager =
                document.createElement(
                    "p"
                );


            manager.textContent =
                center.manager
                    ? "مسئول: " +
                      center.manager
                    : "اطلاعات مسئول ثبت نشده";


            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "btn btn-blue";


            button.textContent =
                "باز کردن مرکز";


            button.addEventListener(
                "click",
                function() {

                    openExistingCenter(
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


/* =========================================================
   مرکز جدید
========================================================= */

function createNewCenter() {

    currentCenter = null;


    document
        .getElementById(
            "centersPage"
        )
        .classList.add(
            "hidden"
        );


    document
        .getElementById(
            "reportPage"
        )
        .classList.remove(
            "hidden"
        );


    document
        .getElementById(
            "reportPageTitle"
        )
        .textContent =
        "ثبت مرکز جدید";


    clearVisitFields();


    document
        .getElementById(
            "centerName"
        )
        .removeAttribute(
            "readonly"
        );


    document
        .getElementById(
            "centerName"
        )
        .value = "";


    document
        .getElementById(
            "expertName"
        )
        .value =
        "حیدریانی";


    document
        .getElementById(
            "signatureExpertName"
        )
        .value =
        "حیدریانی";


    renderHistory();

}


/* =========================================================
   مرکز موجود
========================================================= */

function openExistingCenter(
    center
) {

    currentCenter =
        center;


    document
        .getElementById(
            "centersPage"
        )
        .classList.add(
            "hidden"
        );


    document
        .getElementById(
            "reportPage"
        )
        .classList.remove(
            "hidden"
        );


    document
        .getElementById(
            "reportPageTitle"
        )
        .textContent =
        center.name;


    const nameInput =
        document.getElementById(
            "centerName"
        );


    nameInput.value =
        center.name;


    nameInput.setAttribute(
        "readonly",
        "readonly"
    );


    /*
       هر بار مراجعه جدید است،
       پس اطلاعات مراجعه پاک می‌شوند.
    */

    clearVisitFields();


    document
        .getElementById(
            "expertName"
        )
        .value =
        "حیدریانی";


    document
        .getElementById(
            "signatureExpertName"
        )
        .value =
        "حیدریانی";


    renderHistory();

}


/* =========================================================
   پاک کردن فیلدهای مراجعه
========================================================= */

function clearVisitFields() {

    document
        .getElementById(
            "sectionName"
        )
        .value = "";


    document
        .getElementById(
            "visitDate"
        )
        .value = "";


    document
        .getElementById(
            "deviceModel"
        )
        .value = "";


    resetSerialSelect();


    document
        .getElementById(
            "newSerialNumber"
        )
        .value = "";


    document
        .getElementById(
            "newSerialNumber"
        )
        .classList.add(
            "hidden"
        );


    document
        .getElementById(
            "problemSubject"
        )
        .value = "";


    document
        .getElementById(
            "reportedBy"
        )
        .value = "";


    document
        .getElementById(
            "problemDate"
        )
        .value = "";


    document
        .getElementById(
            "description"
        )
        .value = "";


    document
        .getElementById(
            "expertName"
        )
        .value =
        "حیدریانی";


    document
        .getElementById(
            "expertDate"
        )
        .value = "";


    document
        .getElementById(
            "entryTime"
        )
        .value = "";


    document
        .getElementById(
            "exitTime"
        )
        .value = "";


    document
        .getElementById(
            "receiverName"
        )
        .value = "";


    document
        .getElementById(
            "signatureExpertName"
        )
        .value =
        "حیدریانی";

}


/* =========================================================
   سریال‌ها
========================================================= */

function resetSerialSelect() {

    const select =
        document.getElementById(
            "serialNumber"
        );


    select.innerHTML = "";


    const option =
        document.createElement(
            "option"
        );


    option.value = "";


    option.textContent =
        "ابتدا مدل دستگاه را انتخاب کنید";


    select.appendChild(
        option
    );

}


/* =========================================================
   نمایش سریال‌های قبلی
========================================================= */

function loadSerialNumbers() {

    const model =
        document
            .getElementById(
                "deviceModel"
            )
            .value;


    const select =
        document.getElementById(
            "serialNumber"
        );


    select.innerHTML = "";


    if (!model) {

        resetSerialSelect();

        return;

    }


    const first =
        document.createElement(
            "option"
        );


    first.value = "";


    first.textContent =
        "انتخاب شماره سریال";


    select.appendChild(
        first
    );


    const serials =
        getCenterSerials(
            model
        );


    serials.forEach(
        function(serial) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                serial;


            option.textContent =
                serial;


            select.appendChild(
                option
            );

        }
    );

}


/* =========================================================
   گرفتن سریال‌های مرکز برای مدل خاص
========================================================= */

function getCenterSerials(
    model
) {

    if (!currentCenter) {

        return [];

    }


    const visits =
        currentCenter.visits || [];


    const result = [];


    visits.forEach(
        function(visit) {

            if (
                visit.deviceModel ===
                model &&
                visit.serialNumber
            ) {

                if (
                    !result.includes(
                        visit.serialNumber
                    )
                ) {

                    result.push(
                        visit.serialNumber
                    );

                }

            }

        }
    );


    return result;

}


/* =========================================================
   سریال جدید
========================================================= */

function toggleNewSerial() {

    const input =
        document.getElementById(
            "newSerialNumber"
        );


    input.classList.toggle(
        "hidden"
    );


    if (
        !input.classList.contains(
            "hidden"
        )
    ) {

        input.focus();

    }

}


/* =========================================================
   گرفتن سریال نهایی
========================================================= */

function getSelectedSerial() {

    const newInput =
        document.getElementById(
            "newSerialNumber"
        );


    if (
        !newInput.classList.contains(
            "hidden"
        ) &&
        newInput.value.trim()
    ) {

        return newInput.value.trim();

    }


    return document
        .getElementById(
            "serialNumber"
        )
        .value
        .trim();

}


/* =========================================================
   اطلاعات فرم
========================================================= */

function getFormData() {

    return {

        centerName:
            document
                .getElementById(
                    "centerName"
                )
                .value
                .trim(),

        section:
            document
                .getElementById(
                    "sectionName"
                )
                .value
                .trim(),

        date:
            document
                .getElementById(
                    "visitDate"
                )
                .value
                .trim(),

        deviceModel:
            document
                .getElementById(
                    "deviceModel"
                )
                .value,

        serialNumber:
            getSelectedSerial(),

        problemSubject:
            document
                .getElementById(
                    "problemSubject"
                )
                .value
                .trim(),

        reportedBy:
            document
                .getElementById(
                    "reportedBy"
                )
                .value
                .trim(),

        problemDate:
            document
                .getElementById(
                    "problemDate"
                )
                .value
                .trim(),

        description:
            document
                .getElementById(
                    "description"
                )
                .value
                .trim(),

        expertName:
            document
                .getElementById(
                    "expertName"
                )
                .value
                .trim(),

        expertDate:
            document
                .getElementById(
                    "expertDate"
                )
                .value
                .trim(),

        entryTime:
            document
                .getElementById(
                    "entryTime"
                )
                .value,

        exitTime:
            document
                .getElementById(
                    "exitTime"
                )
                .value,

        receiverName:
            document
                .getElementById(
                    "receiverName"
                )
                .value
                .trim(),

        signatureExpertName:
            document
                .getElementById(
                    "signatureExpertName"
                )
                .value
                .trim()

    };

}


/* =========================================================
   ذخیره گزارش
========================================================= */

function saveVisit() {

    const data =
        getFormData();


    if (!data.centerName) {

        alert(
            "نام مرکز را وارد کنید."
        );

        return;

    }


    if (!data.deviceModel) {

        alert(
            "مدل دستگاه را انتخاب کنید."
        );

        return;

    }


    if (!data.serialNumber) {

        alert(
            "شماره سریال دستگاه را وارد یا انتخاب کنید."
        );

        return;

    }


    /*
       اگر مرکز جدید است
    */

    if (!currentCenter) {

        currentCenter = {

            id:
                Date.now(),

            province:
                currentProvince,

            name:
                data.centerName,

            visits: []

        };


        database.centers.push(
            currentCenter
        );

    }


    /*
       اگر اسم مرکز جدید با مرکز موجود
       اشتباه تکراری داشت، از ایجاد
       گزارش دوباره جلوگیری می‌کنیم.
    */

    currentCenter.name =
        data.centerName;


    if (
        !Array.isArray(
            currentCenter.visits
        )
    ) {

        currentCenter.visits = [];

    }


    const visit = {

        id:
            Date.now(),

        ...data

    };


    currentCenter.visits.unshift(
        visit
    );


    saveDatabase();


    document
        .getElementById(
            "reportPageTitle"
        )
        .textContent =
        currentCenter.name;


    document
        .getElementById(
            "centerName"
        )
        .value =
        currentCenter.name;


    document
        .getElementById(
            "centerName"
        )
        .setAttribute(
            "readonly",
            "readonly"
        );


    alert(
        "گزارش با موفقیت ذخیره شد."
    );


    renderHistory();

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

        history.innerHTML =
            "<p>هنوز گزارشی ثبت نشده است.</p>";

        return;

    }


    const visits =
        currentCenter.visits || [];


    if (!visits.length) {

        history.innerHTML =
            "<p>هنوز گزارشی برای این مرکز ثبت نشده است.</p>";

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


            const title =
                document.createElement(
                    "h3"
                );


            title.textContent =
                "گزارش " +
                (index + 1) +
                " — " +
                (
                    visit.date ||
                    "بدون تاریخ"
                );


            const info =
                document.createElement(
                    "p"
                );


            info.textContent =
                "دستگاه: " +
                visit.deviceModel +
                " | سریال: " +
                visit.serialNumber;


            const subject =
                document.createElement(
                    "p"
                );


            subject.textContent =
                "موضوع مشکل: " +
                (
                    visit.problemSubject ||
                    "ثبت نشده"
                );


            const description =
                document.createElement(
                    "p"
                );


            description.textContent =
                visit.description ||
                "توضیحی ثبت نشده است.";


            box.appendChild(
                title
            );

            box.appendChild(
                info
            );

            box.appendChild(
                subject
            );

            box.appendChild(
                description
            );


            history.appendChild(
                box
            );

        }
    );

}


/* =========================================================
   ساخت متن توضیحات برای PDF
========================================================= */

function makeDescription(
    description
) {

    const middle =
        description
            ? "\n" + description + "\n"
            : "\n";


    return (
        "با مراجعه به مرکز و بررسی ربات،" +
        middle +
        "ربات تست و تحویل مسئول مربوطه گردید."
    );

}


/* =========================================================
   گزارش چاپی / PDF
========================================================= */

function printReport() {

    const data =
        getFormData();


    if (!data.centerName) {

        alert(
            "نام مرکز وارد نشده است."
        );

        return;

    }


    if (!data.deviceModel) {

        alert(
            "مدل دستگاه انتخاب نشده است."
        );

        return;

    }


    if (!data.serialNumber) {

        alert(
            "شماره سریال وارد نشده است."
        );

        return;

    }


    const provinceName =
        provinces.find(
            function(item) {

                return (
                    item[0] ===
                    currentProvince
                );

            }
        )?.[1] || "";


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


    const description =
        makeDescription(
            data.description
        );


    report.document.write(`

<!DOCTYPE html>

<html lang="fa" dir="rtl">

<head>

<meta charset="UTF-8">

<title>گزارش کار - ${escapeHTML(
    data.centerName
)}</title>

<style>

@page {
    size: A4;
    margin: 15mm;
}

* {
    box-sizing: border-box;
}

body {
    margin: 0;
    padding: 0;
    font-family: Tahoma, Arial, sans-serif;
    direction: rtl;
    color: #111;
    font-size: 13px;
}

h1 {
    text-align: center;
    margin: 0 0 20px 0;
    font-size: 22px;
}

.row {
    display: grid;
    gap: 8px;
    margin-bottom: 10px;
}

.row-3 {
    grid-template-columns: repeat(3, 1fr);
}

.row-2 {
    grid-template-columns: repeat(2, 1fr);
}

.row-4 {
    grid-template-columns: repeat(4, 1fr);
}

.field {
    border: 1px solid #333;
    min-height: 48px;
}

.label {
    background: #eeeeee;
    border-bottom: 1px solid #333;
    padding: 7px;
    font-weight: bold;
}

.value {
    padding: 8px;
    min-height: 28px;
}

.description-section {
    border: 1px solid #333;
    margin-top: 10px;
    margin-bottom: 18px;
}

.description-title {
    background: #eeeeee;
    border-bottom: 1px solid #333;
    padding: 9px;
    font-weight: bold;
}

.description-text {
    white-space: pre-wrap;
    line-height: 2;
    min-height: 180px;
    padding: 15px;
}

.signatures {
    display: flex;
    justify-content: space-between;
    margin-top: 70px;
}

.signature {
    width: 40%;
    text-align: center;
}

.signature-line {
    margin-top: 45px;
    border-bottom: 1px solid #111;
}

@media print {
    body {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
    }
}

</style>

</head>

<body>

<h1>
گزارش کار
</h1>


<!-- ردیف اول -->

<div class="row row-3">

    <div class="field">

        <div class="label">
            نام مرکز
        </div>

        <div class="value">
            ${escapeHTML(data.centerName)}
        </div>

    </div>


    <div class="field">

        <div class="label">
            بخش
        </div>

        <div class="value">
            ${escapeHTML(data.section)}
        </div>

    </div>


    <div class="field">

        <div class="label">
            تاریخ
        </div>

        <div class="value">
            ${escapeHTML(data.date)}
        </div>

    </div>

</div>


<!-- ردیف دوم -->

<div class="row row-2">

    <div class="field">

        <div class="label">
            مدل دستگاه
        </div>

        <div class="value">
            ${escapeHTML(data.deviceModel)}
        </div>

    </div>


    <div class="field">

        <div class="label">
            شماره سریال دستگاه
        </div>

        <div class="value">
            ${escapeHTML(data.serialNumber)}
        </div>

    </div>

</div>


<!-- ردیف سوم -->

<div class="row row-3">

    <div class="field">

        <div class="label">
            موضوع مشکل
        </div>

        <div class="value">
            ${escapeHTML(data.problemSubject)}
        </div>

    </div>


    <div class="field">

        <div class="label">
            گزارش شده توسط
        </div>

        <div class="value">
            ${escapeHTML(data.reportedBy)}
        </div>

    </div>


    <div class="field">

        <div class="label">
            تاریخ اعلام مشکل
        </div>

        <div class="value">
            ${escapeHTML(data.problemDate)}
        </div>

    </div>

</div>


<!-- توضیحات -->

<div class="description-section">

    <div class="description-title">
        توضیحات
    </div>

    <div class="description-text">
${escapeHTML(description)}
    </div>

</div>


<!-- اطلاعات کارشناس -->

<div class="row row-4">

    <div class="field">

        <div class="label">
            نام کارشناس
        </div>

        <div class="value">
            ${escapeHTML(data.expertName)}
        </div>

    </div>


    <div class="field">

        <div class="label">
            تاریخ
        </div>

        <div class="value">
            ${escapeHTML(data.expertDate)}
        </div>

    </div>


    <div class="field">

        <div class="label">
            ساعت ورود
        </div>

        <div class="value">
            ${escapeHTML(data.entryTime)}
        </div>

    </div>


    <div class="field">

        <div class="label">
            ساعت خروج
        </div>

        <div class="value">
            ${escapeHTML(data.exitTime)}
        </div>

    </div>

</div>


<!-- امضاها -->

<div class="signatures">

    <div class="signature">

        <strong>
            نام و امضا تحویل گیرنده
        </strong>

        <div>
            ${escapeHTML(data.receiverName)}
        </div>

        <div class="signature-line"></div>

    </div>


    <div class="signature">

        <strong>
            نام و امضا کارشناس
        </strong>

        <div>
            ${escapeHTML(data.signatureExpertName)}
        </div>

        <div class="signature-line"></div>

    </div>

</div>


<script>

setTimeout(function() {
    window.print();
}, 500);

<\/script>

</body>

</html>

    `);


    report.document.close();

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
   رویدادها
========================================================= */

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
                checkLogin
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

                        checkLogin();

                    }

                }
            );


        /*
           استان‌ها
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
           مرکز جدید
        */

        document
            .getElementById(
                "newCenterBtn"
            )
            .addEventListener(
                "click",
                createNewCenter
            );


        /*
           بازگشت از گزارش
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
                            "reportPage"
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
           تغییر مدل دستگاه
        */

        document
            .getElementById(
                "deviceModel"
            )
            .addEventListener(
                "change",
                loadSerialNumbers
            );


        /*
           سریال جدید
        */

        document
            .getElementById(
                "newSerialBtn"
            )
            .addEventListener(
                "click",
                toggleNewSerial
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
           چاپ
        */

        document
            .getElementById(
                "printReportBtn"
            )
            .addEventListener(
                "click",
                printReport
            );


        /*
           اگر قبلاً لاگین بوده، صفحه
           ورود نشان داده می‌شود تا
           رمز دوباره وارد شود.
        */

        const lockUntil =
            Number(
                localStorage.getItem(
                    "site_lock_until"
                ) || 0
            );


        if (
            Date.now() <
            lockUntil
        ) {

            showLockMessage();

        }

    }
);
